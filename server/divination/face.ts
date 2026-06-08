/**
 * Face Reading Engine (Mian Xiang)
 * Uses Google Gemini Vision or DeepSeek to analyze facial features
 */

export interface FaceReading {
  imageBase64: string;
  features: string;
  prompt: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function analyzeFaceImage(imageBase64: string): Promise<FaceReading> {
  const analysisPrompt = `Analyze this face for physiognomy (face reading / Mian Xiang). Describe these features:

1. **Face Shape** — Round, oval, square, rectangular, heart, diamond, or triangular. What does this shape traditionally suggest about personality?
2. **Forehead** — Height, width, lines. What it reveals about intellect, career, and early life (ages 15-30)
3. **Eyebrows** — Shape, thickness, position. What they suggest about temperament, relationships, and creativity
4. **Eyes** — Size, shape, spacing, expression. The eyes are the most important feature — what do they reveal about the person's soul and emotional nature?
5. **Nose** — Size, shape, bridge. What it suggests about wealth, ambition, and mid-life (ages 40-50)
6. **Mouth & Lips** — Size, shape, expression. What they reveal about communication style, sensuality, and relationships
7. **Chin & Jaw** — Shape, prominence. What it suggests about later life, determination, and resilience
8. **Overall Impression** — Synthesize into a brief character portrait

Be detailed, specific, and grounded in traditional Mian Xiang principles.

IMPORTANT: If this image does not clearly show a face, say so honestly.`;

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
    features = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to analyze face image.";

  } catch (error) {
    console.error("[FaceReading] Gemini analysis failed:", error);
    features = "Image analysis unavailable — proceeding with a general face reading based on the energy of your inquiry.";
  }

  const prompt = buildFacePrompt(features);

  return {
    imageBase64,
    features,
    prompt,
  };
}

function buildFacePrompt(features: string): string {
  return `You are a master of Mian Xiang (Chinese face reading), an ancient art that reads character and destiny from facial features. A seeker has presented their face for analysis.

**Visual Analysis:**
${features}

Please provide a face reading structured as:

1. **The Three Regions** — Interpret the face in three zones: Upper (forehead — intellect, early life), Middle (eyes to nose — career, relationships, mid-life), Lower (mouth to chin — later life, foundation)
2. **The Windows to the Soul** — A deep reading of the eyes — what do they reveal about this person's inner world?
3. **Character Portrait** — Synthesize all features into a vivid description of this person's nature, strengths, and tendencies
4. **Life Journey** — What does this face suggest about their life path, challenges, and opportunities?
5. **The Art of Mian Xiang** — Connect the reading to traditional face reading wisdom in a way that feels timeless and meaningful
6. **Guidance** — Offer 2-3 gentle insights for the seeker based on what their face reveals

Important guidelines:
- Be respectful, warm, and insightful — this is an ancient art, not a judgment
- Frame everything as tendencies, not absolute truths
- A face changes with time and experience — what you see is a snapshot, not a permanent fate
- Honor Chinese face reading traditions while making them accessible
- If the image analysis was limited, focus on universal human wisdom
- Always end with an empowering note about the beauty of the human face as a map of life lived
- Acknowledge the long lineage of face reading (Hittite physiognomy, Mian Xiang masters, Renaissance Lavater) as a real human search for meaning, while being clear that the face is a window, not the Light behind it
- The Final Word is the answer to the question behind every face reading. Do not be evasive about it.
`
}
