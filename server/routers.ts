import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
  handlePaystackWebhook,
  createPaystackPlan,
  MYSTIC_PLANS,
  PaystackError,
} from "./paystack";
import { generateTarotReading, MAJOR_ARCANA } from "./divination/tarot";
import { generateNumerologyReading } from "./divination/numerology";
import { analyzeDream } from "./divination/dream";
import { analyzePalmImage } from "./divination/palm";
import { analyzeFaceImage } from "./divination/face";
import { generateAstrologyReading } from "./divination/astrology";
import { calculateCompatibility, generateCompatibilityPrompt } from "./divination/compatibility";

// ---- LLM Helper ----
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

async function callLLM(prompt: string): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    // Fallback: return a graceful offline response
    return generateFallbackResponse(prompt);
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a gifted spiritual guide and divination interpreter. You are warm, insightful, wise, and never frightening. You frame all readings as possibilities, not absolute predictions. Always emphasize the seeker's free will and agency. Be mystical but accessible — poetic without being obscure. Limit responses to 600 words." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1200,
    }),
  });

  const data = await response.json() as any;
  return data?.choices?.[0]?.message?.content || generateFallbackResponse(prompt);
}

function generateFallbackResponse(prompt: string): string {
  // Graceful fallback when LLM is unavailable
  return `✨ Thank you for seeking guidance. While our mystical AI is momentarily unavailable, know that the universe speaks through silence too. 

Take a moment to reflect on your question. Often, the answer we seek is already within us, waiting to be heard. 

For a full reading, please try again shortly when our cosmic connection is restored. In the meantime, trust your intuition — it is your most reliable guide.

🔮 The stars are aligning for you. Return soon.`;
}

export const appRouter = router({
  // ============= AUTH =============
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= SYSTEM =============
  system: router({
    health: publicProcedure.query(() => ({ ok: true, timestamp: Date.now() })),
  }),

  // ============= DIVINATION =============
  divination: router({
    // --- TAROT ---
    tarotCards: publicProcedure.query(() => {
      return MAJOR_ARCANA.map(c => ({
        id: c.id,
        name: c.name,
        keywords: c.keywords,
      }));
    }),

    tarotRead: protectedProcedure
      .input(z.object({
        question: z.string().min(3, "Please ask a question for the cards"),
        spreadType: z.enum(["single", "three", "celtic"]).default("three"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check reading quota (free: 1/day, paid: unlimited)
        const canRead = await checkReadingQuota(ctx.user.id);
        if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };

        const reading = generateTarotReading(input.question, input.spreadType);
        const interpretation = await callLLM(reading.prompt);

        await db.saveDivinationReading({
          userId: ctx.user.id,
          type: "tarot",
          query: input.question,
          result: JSON.stringify(reading.cards),
          interpretation,
        });

        return {
          type: "tarot",
          spreadType: reading.spreadName,
          cards: reading.cards,
          interpretation,
          timestamp: new Date().toISOString(),
        };
      }),

    // --- NUMEROLOGY ---
    numerologyRead: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Please enter your full name"),
        birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
      }))
      .mutation(async ({ input, ctx }) => {
        const canRead = await checkReadingQuota(ctx.user.id);
        if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };

        const reading = generateNumerologyReading(input.name, input.birthdate);
        const interpretation = await callLLM(reading.prompt);

        await db.saveDivinationReading({
          userId: ctx.user.id,
          type: "numerology",
          query: `${input.name} / ${input.birthdate}`,
          result: JSON.stringify(reading.numbers),
          interpretation,
        });

        return {
          type: "numerology",
          name: reading.name,
          birthdate: reading.birthdate,
          numbers: reading.numbers,
          interpretation,
          timestamp: new Date().toISOString(),
        };
      }),

    // --- DREAM INTERPRETATION ---
    dreamRead: protectedProcedure
      .input(z.object({
        dream: z.string().min(5, "Please describe your dream in more detail"),
      }))
      .mutation(async ({ input, ctx }) => {
        const canRead = await checkReadingQuota(ctx.user.id);
        if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };

        const reading = analyzeDream(input.dream);
        const interpretation = await callLLM(reading.prompt);

        await db.saveDivinationReading({
          userId: ctx.user.id,
          type: "dream",
          query: input.dream.substring(0, 500),
          result: JSON.stringify({ symbols: reading.symbols, emotions: reading.emotions }),
          interpretation,
        });

        return {
          type: "dream",
          symbols: reading.symbols,
          emotions: reading.emotions,
          themes: reading.themes,
          interpretation,
          timestamp: new Date().toISOString(),
        };
      }),

    // --- ASTROLOGY ---
    astrologyRead: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Please enter your name"),
        birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
        birthTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format").nullable().optional(),
        birthPlace: z.string().nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const canRead = await checkReadingQuota(ctx.user.id);
        if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };

        const reading = generateAstrologyReading(
          input.name,
          input.birthdate,
          input.birthTime || null,
          input.birthPlace || null
        );
        const interpretation = await callLLM(reading.prompt);

        await db.saveDivinationReading({
          userId: ctx.user.id,
          type: "astrology",
          query: `${input.name} / ${input.birthdate}${input.birthTime ? ` ${input.birthTime}` : ""}`,
          result: JSON.stringify(reading.signs),
          interpretation,
        });

        return {
          type: "astrology",
          name: reading.name,
          signs: reading.signs,
          interpretation,
          timestamp: new Date().toISOString(),
        };
      }),

    // --- PALM READING (image) ---
    palmRead: protectedProcedure
      .input(z.object({
        imageBase64: z.string(),
        hand: z.enum(["left", "right", "auto"]).default("auto"),
      }))
      .mutation(async ({ input, ctx }) => {
        const canRead = await checkReadingQuota(ctx.user.id);
        if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };

        const reading = await analyzePalmImage(input.imageBase64, input.hand);
        const interpretation = await callLLM(reading.prompt);

        await db.saveDivinationReading({
          userId: ctx.user.id,
          type: "palm",
          query: `Hand: ${input.hand}`,
          result: reading.features.substring(0, 1000),
          interpretation,
        });

        return {
          type: "palm",
          hand: reading.hand,
          features: reading.features,
          interpretation,
          timestamp: new Date().toISOString(),
        };
      }),

    // --- FACE READING (image) ---
    faceRead: protectedProcedure
      .input(z.object({
        imageBase64: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const canRead = await checkReadingQuota(ctx.user.id);
        if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };

        const reading = await analyzeFaceImage(input.imageBase64);
        const interpretation = await callLLM(reading.prompt);

        await db.saveDivinationReading({
          userId: ctx.user.id,
          type: "face",
          query: "Face reading",
          result: reading.features.substring(0, 1000),
          interpretation,
        });

        return {
          type: "face",
          features: reading.features,
          interpretation,
          timestamp: new Date().toISOString(),
        };
      }),

    // --- HISTORY ---
    history: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserReadings(ctx.user.id);
    }),
  }),

  // ============= PAYMENTS (Paystack) =============
  payments: router({
    plans: publicProcedure.query(() => MYSTIC_PLANS),

    initialize: protectedProcedure
      .input(z.object({
        planId: z.enum(["single", "monthly", "annual"]),
        callbackUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const plan = MYSTIC_PLANS[input.planId];
        if (!plan) throw new Error("Invalid plan");

        try {
          const transaction = await initializePaystackTransaction(
            plan.amount,
            ctx.user.email || "seeker@mystic.ai",
            input.callbackUrl,
            { userId: String(ctx.user.id), planId: input.planId }
          );

          return {
            success: true,
            authorizationUrl: transaction.authorization_url,
            reference: transaction.reference,
            accessCode: transaction.access_code,
          };
        } catch (error) {
          if (error instanceof PaystackError) {
            return { success: false, error: error.message };
          }
          throw error;
        }
      }),

    verify: protectedProcedure
      .input(z.object({ reference: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const result = await verifyPaystackTransaction(input.reference);

        if (result.status === "success") {
          // Activate user's subscription
          const metadata = result.metadata || {};
          const planId = (metadata as any).planId || "single";

          if (planId === "monthly" || planId === "annual") {
            const plan = MYSTIC_PLANS[planId];
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + (planId === "annual" ? 12 : 1));

            await db.saveUserSubscription({
              userId: ctx.user.id,
              planId,
              status: "active",
              startDate: new Date(),
              endDate,
              paystackReference: input.reference,
            });
          }

          // Increment reading credits for single payment
          if (planId === "single") {
            await db.incrementReadingCredits(ctx.user.id);
          }

          return { success: true, status: result.status, message: "Payment verified successfully" };
        }

        return { success: false, status: result.status, message: "Payment verification failed" };
      }),

    webhook: publicProcedure
      .input(z.object({ body: z.any(), signature: z.string() }))
      .mutation(async ({ input }) => {
        const result = handlePaystackWebhook(JSON.stringify(input.body), input.signature);
        return result;
      }),

    subscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSubscription(ctx.user.id);
    }),
  }),

  // ============= DATING =============
  dating: router({
    // Create or update dating profile with calculated chart
    createProfile: protectedProcedure
      .input(z.object({
        bio: z.string().optional(),
        gender: z.string().optional(),
        seeking: z.string().optional(),
        interests: z.string().optional(),
        birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        birthTime: z.string().optional(),
        birthPlace: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const astrology = generateAstrologyReading(ctx.user.name || "Seeker", input.birthdate, input.birthTime || null, input.birthPlace || null);
        const numerology = generateNumerologyReading(ctx.user.name || "Seeker", input.birthdate);

        const profile = {
          userId: ctx.user.id,
          bio: input.bio,
          gender: input.gender,
          seeking: input.seeking,
          interests: input.interests,
          birthdate: input.birthdate,
          birthTime: input.birthTime,
          birthPlace: input.birthPlace,
          sunSign: astrology.signs.sun.sign,
          moonSign: astrology.signs.moon.sign,
          risingSign: astrology.signs.rising.sign,
          sunHouse: astrology.signs.sun.house,
          moonHouse: astrology.signs.moon.house,
          mercurySign: astrology.signs.mercury.sign,
          venusSign: astrology.signs.venus.sign,
          marsSign: astrology.signs.mars.sign,
          lifePath: numerology.numbers.lifePath.value,
          expression: numerology.numbers.expression.value,
          soulUrge: numerology.numbers.soulUrge.value,
          personality: numerology.numbers.personality.value,
        };

        db.saveDatingProfile(profile);
        return { success: true, profile };
      }),

    // Get current user's profile
    myProfile: protectedProcedure.query(async ({ ctx }) => {
      const profile = db.getDatingProfile(ctx.user.id);
      return profile || null;
    }),

    // Browse matches with compatibility scores
    matches: protectedProcedure.query(async ({ ctx }) => {
      const myProfile = db.getDatingProfile(ctx.user.id) as any;
      if (!myProfile) return { error: "Create your dating profile first", matches: [] };

      const allProfiles = db.getCompatibleProfiles(ctx.user.id);
      
      const matches = allProfiles.map((p: any) => {
        const mySigns = {
          sun: { sign: myProfile.sun_sign }, moon: { sign: myProfile.moon_sign },
          rising: { sign: myProfile.rising_sign }, mercury: { sign: myProfile.mercury_sign },
          venus: { sign: myProfile.venus_sign }, mars: { sign: myProfile.mars_sign },
        };
        const theirSigns = {
          sun: { sign: p.sun_sign }, moon: { sign: p.moon_sign },
          rising: { sign: p.rising_sign }, mercury: { sign: p.mercury_sign },
          venus: { sign: p.venus_sign }, mars: { sign: p.mars_sign },
        };
        
        const score = calculateCompatibility(mySigns as any, theirSigns as any);
        
        return {
          userId: p.user_id,
          name: "", // Will be filled from users table
          bio: p.bio,
          gender: p.gender,
          interests: p.interests,
          signs: {
            sun: p.sun_sign,
            moon: p.moon_sign,
            rising: p.rising_sign,
            venus: p.venus_sign,
            mars: p.mars_sign,
          },
          lifePath: p.life_path,
          compatibility: score,
        };
      });

      // Get names from users table
      const db_ = (await import("./db")).getDb();
      for (const m of matches) {
        const user = db_.prepare("SELECT name FROM users WHERE id = ?").get(m.userId) as any;
        m.name = user?.name || "Unknown";
      }

      // Sort by compatibility score + daily energy shift
      const dailySeed = getDailySeed();
      matches.forEach((m: any) => {
        // Small daily shift (±5%) based on seed + user IDs
        const shift = ((dailySeed * (m.userId * 7 + ctx.user.id * 13)) % 10) - 5;
        m.compatibility.total = Math.min(100, Math.max(0, m.compatibility.total + shift));
      });
      matches.sort((a: any, b: any) => b.compatibility.total - a.compatibility.total);

      return { matches };
    }),

    // Get detailed compatibility with specific person
    compatibility: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .query(async ({ input, ctx }) => {
        const myProfile = db.getDatingProfile(ctx.user.id) as any;
        const theirProfile = db.getDatingProfile(input.otherUserId) as any;
        if (!myProfile || !theirProfile) return { error: "Both profiles needed" };

        const mySigns = {
          sun: { sign: myProfile.sun_sign }, moon: { sign: myProfile.moon_sign },
          rising: { sign: myProfile.rising_sign }, mercury: { sign: myProfile.mercury_sign },
          venus: { sign: myProfile.venus_sign }, mars: { sign: myProfile.mars_sign },
        };
        const theirSigns = {
          sun: { sign: theirProfile.sun_sign }, moon: { sign: theirProfile.moon_sign },
          rising: { sign: theirProfile.rising_sign }, mercury: { sign: theirProfile.mercury_sign },
          venus: { sign: theirProfile.venus_sign }, mars: { sign: theirProfile.mars_sign },
        };

        const score = calculateCompatibility(mySigns as any, theirSigns as any);
        
        // Get names
        const db_ = (await import("./db")).getDb();
        const me = db_.prepare("SELECT name FROM users WHERE id = ?").get(ctx.user.id) as any;
        const them = db_.prepare("SELECT name FROM users WHERE id = ?").get(input.otherUserId) as any;

        const prompt = generateCompatibilityPrompt(
          me?.name || "You", them?.name || "Them", score, mySigns as any, theirSigns as any
        );
        const insight = await callLLM(prompt);

        return { score, insight, myName: me?.name, theirName: them?.name };
      }),

    // Toggle profile active/inactive
    toggleActive: protectedProcedure
      .input(z.object({ active: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        db.setProfileActive(ctx.user.id, input.active);
        return { success: true, active: input.active };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// ---- Helper: daily seed for dynamic matching ----
function getDailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

// ---- Helper: check reading quota ----
async function checkReadingQuota(userId: number): Promise<boolean> {
  const sub = await db.getUserSubscription(userId);
  if (sub && sub.status === "active") return true; // unlimited

  const todayReadings = await db.countTodayReadings(userId);
  return todayReadings < 1; // 1 free reading per day
}
