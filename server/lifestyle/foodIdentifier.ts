// ============================================================
// MYSTIC AI — FOOD IDENTIFIER
// Image (base64) → Gemini Vision → food name + serving estimate.
// Returns a single best-guess identification plus 2 alternates.
// On failure, falls back to DeepSeek (when available) or a
// graceful "could not identify" payload.
// ============================================================

import { getDb } from "../db";
import { searchFoods } from "./foodDb";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

export interface FoodIdentification {
  primary: IdentifiedFood;
  alternates: IdentifiedFood[];
  confidence: "high" | "medium" | "low";
  source: "gemini" | "deepseek" | "none";
  note?: string;
}

export interface IdentifiedFood {
  name: string;
  description: string;
  estimatedServingG: number;
  estimatedServingLabel: string; // e.g. "1 medium apple (~150g)"
  matchedFoodId?: string;        // if we matched it to our DB
  matchedFoodName?: string;
}

const IDENTIFICATION_PROMPT = `You are a nutrition assistant. Look at the image of food carefully.

Return ONLY a JSON object (no markdown, no explanation outside the JSON):
{
  "name": "the food name in plain English (e.g. 'Granny Smith Apple', 'Chicken Caesar Salad', 'Brown Rice')",
  "description": "1-2 sentences describing what you see in the image (e.g. 'A red apple on a wooden table, sliced in half')",
  "estimatedServingG": <number, your best estimate of the visible portion in grams>,
  "estimatedServingLabel": "human-friendly serving label (e.g. '1 medium apple (~150g)', '1 plate (~300g)', '1 slice (~100g)')",
  "alternates": [
    { "name": "alternative guess 1", "estimatedServingG": <number>, "estimatedServingLabel": "..." },
    { "name": "alternative guess 2", "estimatedServingG": <number>, "estimatedServingLabel": "..." }
  ]
}

Rules:
- Be specific but not overly precise. "Apple" is fine; "Granny Smith Apple" is better.
- If you see a plate of food with multiple items, name the dominant one.
- If the image is blurry, dark, or not food, set estimatedServingG to 0 and name to "Unidentifiable image".
- estimatedServingG should be realistic. A single apple is ~150g, a chicken breast ~120g, a bowl of rice ~200g, a slice of pizza ~100g.
- estimatedServingLabel should be human-friendly, not "grams: 150".`;

/**
 * Identify a food from a base64 image.
 * Tries Gemini first (vision-capable), then DeepSeek (less reliable for vision).
 * Matches the result against our local DB.
 */
export async function identifyFoodFromImage(imageBase64: string): Promise<FoodIdentification> {
  // Strip data URL prefix if present
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

  if (GEMINI_API_KEY) {
    try {
      const result = await callGeminiVision(cleanBase64);
      if (result) return enrichWithDbMatch(result, "gemini");
    } catch (e) {
      console.warn("[FoodID] Gemini call failed:", (e as Error).message);
    }
  }

  if (DEEPSEEK_API_KEY) {
    try {
      const result = await callDeepSeekVision(cleanBase64);
      if (result) return enrichWithDbMatch(result, "deepseek");
    } catch (e) {
      console.warn("[FoodID] DeepSeek call failed:", (e as Error).message);
    }
  }

  return {
    primary: {
      name: "Unidentifiable",
      description: "We could not identify the food in the image. Please try again with a clearer photo, or use the Kilojoule Calculator and type the food name manually.",
      estimatedServingG: 0,
      estimatedServingLabel: "—",
    },
    alternates: [],
    confidence: "low",
    source: "none",
    note: !GEMINI_API_KEY && !DEEPSEEK_API_KEY
      ? "No vision API keys available. Set GEMINI_API_KEY or DEEPSEEK_API_KEY in environment."
      : "Both vision APIs returned an error.",
  };
}

// ── Gemini Vision ──

async function callGeminiVision(imageBase64: string): Promise<IdentifiedFood | null> {
  // Gemini 1.5 Flash is fast, cheap, and vision-capable.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: IDENTIFICATION_PROMPT },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const data = await response.json() as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return parseIdentificationResponse(text);
}

// ── DeepSeek Vision (fallback) ──

async function callDeepSeekVision(imageBase64: string): Promise<IdentifiedFood | null> {
  // DeepSeek's chat model is text-first; vision support is experimental
  // and may not work for all images. We still try as a last resort.
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: IDENTIFICATION_PROMPT },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ],
      }],
      temperature: 0.4,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek HTTP ${response.status}`);
  }

  const data = await response.json() as any;
  const text = data?.choices?.[0]?.message?.content;
  if (!text) return null;

  return parseIdentificationResponse(text);
}

function parseIdentificationResponse(text: string): IdentifiedFood | null {
  // Strip markdown code fences if present
  let json = text.trim();
  if (json.startsWith("```")) {
    json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    console.warn("[FoodID] Failed to parse JSON:", text.slice(0, 200));
    return null;
  }

  if (!parsed.name || typeof parsed.estimatedServingG !== "number") {
    return null;
  }

  return {
    name: String(parsed.name),
    description: String(parsed.description || ""),
    estimatedServingG: parsed.estimatedServingG,
    estimatedServingLabel: String(parsed.estimatedServingLabel || `${parsed.estimatedServingG}g`),
  };
}

// ── DB MATCHING ──

function enrichWithDbMatch(identified: IdentifiedFood, source: "gemini" | "deepseek"): FoodIdentification {
  const primaryMatches = searchFoods(identified.name, 3);
  const primary = primaryMatches[0];
  const alternatesRaw = (identified as any).alternates || [];
  const alternates: IdentifiedFood[] = [];

  for (const alt of alternatesRaw) {
    if (!alt?.name) continue;
    const match = searchFoods(alt.name, 1)[0];
    alternates.push({
      name: alt.name,
      description: "",
      estimatedServingG: alt.estimatedServingG || 0,
      estimatedServingLabel: alt.estimatedServingLabel || `${alt.estimatedServingG || 0}g`,
      matchedFoodId: match?.id,
      matchedFoodName: match?.name,
    });
  }

  const confidence: "high" | "medium" | "low" = primary
    ? "high"
    : alternatesRaw.length > 0
      ? "medium"
      : "low";

  return {
    primary: {
      ...identified,
      matchedFoodId: primary?.id,
      matchedFoodName: primary?.name,
    },
    alternates,
    confidence,
    source,
  };
}

// ── MISS LOGGING ──

/**
 * Log a food that the user wanted to calculate but isn't in the DB.
 * Stored in a simple table for later review and DB expansion.
 */
export function logFoodMiss(foodName: string, userId?: number, source: "identifier" | "calculator" = "calculator") {
  const db = getDb();
  if (!db) {
    console.log(`[FoodMiss] (mock DB) ${source}: ${foodName}${userId ? ` (user ${userId})` : ""}`);
    return;
  }

  try {
    db.prepare(
      "INSERT INTO food_misses (food_name, source, user_id, created_at) VALUES (?, ?, ?, datetime('now'))"
    ).run(foodName.toLowerCase().trim(), source, userId ?? null);

    // Dedupe: keep only the latest entry per food_name
    db.prepare(`
      DELETE FROM food_misses
      WHERE id NOT IN (
        SELECT MAX(id) FROM food_misses GROUP BY food_name, source
      )
    `).run();

    console.log(`[FoodMiss] logged: ${foodName} (${source})`);
  } catch (e) {
    console.warn(`[FoodMiss] log failed:`, (e as Error).message);
  }
}

/**
 * Get the most-logged misses for DB expansion review.
 */
export function getFoodMisses(limit: number = 50): { food_name: string; count: number; last_seen: string; source: string }[] {
  const db = getDb();
  if (!db) return [];
  try {
    return db.prepare(`
      SELECT food_name, source, MAX(created_at) as last_seen, COUNT(*) as count
      FROM food_misses
      GROUP BY food_name, source
      ORDER BY count DESC, last_seen DESC
      LIMIT ?
    `).all(limit) as any;
  } catch {
    return [];
  }
}
