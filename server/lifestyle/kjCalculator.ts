// ============================================================
// MYSTIC AI — KILOJOULE CALCULATOR
// DB lookup first, DeepSeek fallback for unknowns.
// Returns per-100g nutrition scaled to the requested grams.
// On miss, logs the item for DB expansion review.
// ============================================================

import { getDb } from "../db";
import { searchFoods, getFoodById, FoodItem } from "./foodDb";
import { logFoodMiss } from "./foodIdentifier";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

export interface NutritionResult {
  food: string;            // the food name (resolved or original)
  matchedFoodId?: string;  // if matched to our DB
  matchedFoodName?: string;
  source: "database" | "deepseek" | "fallback";
  grams: number;
  per100g: { kj: number; kcal: number; protein: number; carbs: number; fat: number; fiber?: number };
  totals: { kj: number; kcal: number; protein: number; carbs: number; fat: number; fiber?: number };
  confidence: "high" | "medium" | "low";
  warning?: string;        // e.g. "AI estimate, not lab-verified"
  loggedForReview?: boolean;
}

/**
 * Look up nutrition for a named food and scale to the requested grams.
 * Tries the local DB first. If nothing matches, asks DeepSeek.
 * If DeepSeek fails too, returns a graceful fallback.
 *
 * `userId` is optional — if provided, misses get logged against this user
 * (so you can see what real users are asking for that the DB doesn't cover).
 */
export async function calculateNutrition(
  foodName: string,
  grams: number,
  userId?: number
): Promise<NutritionResult> {
  if (!foodName || foodName.trim().length === 0) {
    return makeFallback("Unknown food", grams, "Empty food name");
  }
  if (grams <= 0 || grams > 5000) {
    return makeFallback(foodName, grams, "Grams must be between 1 and 5000");
  }

  const cleanedName = foodName.trim();

  // ── 1. Local DB lookup ──
  const matches = searchFoods(cleanedName, 1);
  if (matches.length > 0) {
    return fromDb(matches[0], grams);
  }

  // ── 2. DeepSeek fallback ──
  if (DEEPSEEK_API_KEY) {
    try {
      const aiResult = await callDeepSeekEstimate(cleanedName, grams);
      if (aiResult) {
        // Log this miss for DB expansion review
        logFoodMiss(cleanedName, userId, "calculator");
        return { ...aiResult, loggedForReview: true };
      }
    } catch (e) {
      console.warn("[KJCalc] DeepSeek call failed:", (e as Error).message);
    }
  } else {
    // No AI to fall back to — log the miss anyway
    logFoodMiss(cleanedName, userId, "calculator");
  }

  // ── 3. Last-resort fallback ──
  return makeFallback(cleanedName, grams);
}

function fromDb(food: FoodItem, grams: number): NutritionResult {
  const scale = grams / 100;
  const per100g = {
    kj: food.kj,
    kcal: food.kcal,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber,
  };
  const totals = {
    kj: Math.round(food.kj * scale),
    kcal: Math.round(food.kcal * scale),
    protein: Math.round(food.protein * scale * 10) / 10,
    carbs: Math.round(food.carbs * scale * 10) / 10,
    fat: Math.round(food.fat * scale * 10) / 10,
    fiber: food.fiber ? Math.round(food.fiber * scale * 10) / 10 : undefined,
  };
  return {
    food: food.name,
    matchedFoodId: food.id,
    matchedFoodName: food.name,
    source: "database",
    grams,
    per100g,
    totals,
    confidence: "high",
  };
}

async function callDeepSeekEstimate(foodName: string, grams: number): Promise<NutritionResult | null> {
  const prompt = `Estimate the nutritional content of "${foodName}" per 100 grams (cooked, edible portion — use the most common preparation if ambiguous).

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "per100g": {
    "kj": <number>,
    "protein": <number in grams>,
    "carbs": <number in grams>,
    "fat": <number in grams>,
    "fiber": <number in grams or null>
  },
  "confidence": "high" | "medium" | "low",
  "warning": "<optional string, e.g. 'Highly variable depending on preparation'>"
}

Rules:
- Use realistic values, not extremes. If you're guessing, say confidence "low".
- For branded items (e.g. "Coca-Cola", "KFC chicken"), use standard manufacturer values.
- For ambiguous items (e.g. "chicken"), use a sensible default like "roasted chicken breast".
- 1 kcal = 4.184 kJ. Compute kcal from kJ if needed for consistency, but report what you know.
- Be honest. If you don't know the food, set confidence to "low" and use generic values.`;

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a nutrition data assistant. You give realistic per-100g values for foods and are honest when uncertain. Respond in JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek HTTP ${response.status}`);
  }

  const data = await response.json() as any;
  const text = data?.choices?.[0]?.message?.content;
  if (!text) return null;

  let json = text.trim();
  if (json.startsWith("```")) {
    json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!parsed.per100g || typeof parsed.per100g.kj !== "number") return null;

  const per100g = {
    kj: parsed.per100g.kj,
    kcal: Math.round(parsed.per100g.kj / 4.184),
    protein: parsed.per100g.protein || 0,
    carbs: parsed.per100g.carbs || 0,
    fat: parsed.per100g.fat || 0,
    fiber: parsed.per100g.fiber ?? undefined,
  };

  const scale = grams / 100;
  const totals = {
    kj: Math.round(per100g.kj * scale),
    kcal: Math.round(per100g.kcal * scale),
    protein: Math.round(per100g.protein * scale * 10) / 10,
    carbs: Math.round(per100g.carbs * scale * 10) / 10,
    fat: Math.round(per100g.fat * scale * 10) / 10,
    fiber: per100g.fiber ? Math.round(per100g.fiber * scale * 10) / 10 : undefined,
  };

  return {
    food: foodName,
    source: "deepseek",
    grams,
    per100g,
    totals,
    confidence: parsed.confidence || "medium",
    warning: parsed.warning,
  };
}

function makeFallback(foodName: string, grams: number, reason?: string): NutritionResult {
  return {
    food: foodName,
    source: "fallback",
    grams,
    per100g: { kj: 0, kcal: 0, protein: 0, carbs: 0, fat: 0 },
    totals: { kj: 0, kcal: 0, protein: 0, carbs: 0, fat: 0 },
    confidence: "low",
    warning: reason || "Could not find this food. Try a different spelling, or log a miss to add it to our database.",
    loggedForReview: true,
  };
}

// ── COMPOUND CALCULATION ──

/**
 * Calculate nutrition for a list of items (e.g. a meal).
 * Each item has a name and grams. Returns individual + total.
 */
export async function calculateMeal(
  items: { food: string; grams: number }[],
  userId?: number
): Promise<{
  items: NutritionResult[];
  totals: { kj: number; kcal: number; protein: number; carbs: number; fat: number };
  sources: { database: number; deepseek: number; fallback: number };
}> {
  const results = await Promise.all(
    items.map(item => calculateNutrition(item.food, item.grams, userId))
  );

  const totals = results.reduce(
    (acc, r) => ({
      kj: acc.kj + r.totals.kj,
      kcal: acc.kcal + r.totals.kcal,
      protein: acc.protein + r.totals.protein,
      carbs: acc.carbs + r.totals.carbs,
      fat: acc.fat + r.totals.fat,
    }),
    { kj: 0, kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const sources = {
    database: results.filter(r => r.source === "database").length,
    deepseek: results.filter(r => r.source === "deepseek").length,
    fallback: results.filter(r => r.source === "fallback").length,
  };

  return { items: results, totals, sources };
}
