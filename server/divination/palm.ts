/**
 * Palm Reading Engine
 * Uses Google Gemini Vision to analyze palm images
 * Zero API cost: uses Gemini's free tier (1,500 requests/day)
 */

export interface PalmReading {
  imageBase64: string;
  hand: "left" | "right" | "unknown";
  features: string; // raw Gemini analysis
  prompt: string;    // LLM interpretation prompt
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

/**
 * Analyze a palm image using Gemini Vision
 * Returns structured observations about palm lines and features
 */
export async function analyzePalmImage(
  imageBase64: string,
  hand: "left" | "right" | "auto" = "auto"
): Promise<PalmReading> {
  const analysisPrompt = `Analyze this palm image in detail for palm reading purposes. Identify and describe:

1. **Hand Shape** — Element type (Earth, Air, Fire, Water hands) based on palm shape and finger length
2. **Life Line** — Length, depth, curve, branches. What it suggests about vitality and life path
3. **Head Line** — Length, depth, direction. What it suggests about intellect and communication
4. **Heart Line** — Length, curve, branches. What it suggests about emotions and relationships  
5. **Fate Line** — If visible, describe its characteristics
6. **Mounts** — Which mounts (Venus, Jupiter, Saturn, Apollo, Mercury, Mars, Moon) are prominent
7. **Overall Character** — Synthesize these features into a brief personality sketch

Be detailed and specific. Note any unique marks, crosses, stars, or islands on the lines.
Hand: ${hand === "auto" ? "Determine if this is left or right hand" : hand === "left" ? "This is the LEFT hand (recessive/inner self)" : "This is the RIGHT hand (dominant/outer self)"}

IMPORTANT: If this image does not clearly show a palm/hand suitable for reading, say so honestly and suggest taking a clearer photo.`;

  let features: string;
  
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: analysisPrompt },
              { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
            ]
          }]
        }),
      }
    );

    const data = await response.json() as any;
    features = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to analyze palm image.";

  } catch (error) {
    console.error("[PalmReading] Gemini analysis failed:", error);
    features = "Image analysis unavailable — proceeding with a general palm reading based on the energy of your inquiry.";
  }

  const prompt = buildPalmPrompt(features, hand);

  return {
    imageBase64,
    hand: hand === "auto" ? "unknown" : hand,
    features,
    prompt,
  };
}

function buildPalmPrompt(features: string, hand: string): string {
  return `You are a gifted palm reader with deep knowledge of chiromancy (the art of palm reading). A seeker has presented their palm for analysis.

**Hand:** ${hand === "left" ? "Left hand — this reveals the inner self, potential, and subconscious patterns" : hand === "right" ? "Right hand — this reveals the outer self, how one engages with the world" : "Hand orientation unknown"}
  
**Visual Analysis of the Palm:**
${features}

Please provide a complete palm reading structured as:

1. **First Impressions** — What does this hand reveal at first glance about the person's nature?
2. **The Life Line** — What does their vitality, life path, and major life events suggest?
3. **The Head Line** — Interpret their intellectual style, communication patterns, and mental strengths
4. **The Heart Line** — Reveal what the heart shows about their emotional life, relationships, and capacity for love
5. **The Hand's Story** — Synthesize all features into a coherent narrative about this person's character and journey
6. **Guidance from the Lines** — Offer 2-3 gentle insights or suggestions based on the reading

Important guidelines:
- Be warm, insightful, and never frightening
- Frame everything as tendencies and potentials, not fixed destiny
- Our hands change over time — what you read is their current state, not a permanent verdict
- Honor the ancient tradition of palmistry while keeping it accessible
- If the image analysis was limited, focus on the spiritual and intuitive aspects of the reading
- Always end with an empowering, hopeful note
- Acknowledge the long lineage of palm reading (Hittite hand-keepers, Indian samudrika shastra, Chinese palmistry) as a real human search for meaning, while being clear that the hand is a mirror, not the Maker
- The Final Word is the answer to the question behind every palm reading. Do not be evasive about it.
`
}
