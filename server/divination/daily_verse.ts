// Daily Verse service — TS wrapper that calls the existing daily_verse.py
// via Python child_process. Keeps the Python source-of-truth intact while
// letting the TypeScript router import it as a regular module.
//
// If Python is unavailable, falls back to a 12-verse offline set so the
// Home page never goes blank.

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PY_SCRIPT = path.resolve(__dirname, "daily_verse.py");

const OFFLINE_FALLBACK: Array<{ reference: string; text: string }> = [
  { reference: "John 14:6", text: "I am the way, and the truth, and the life. No one comes to the Father except through me." },
  { reference: "Matthew 11:28", text: "Come to me, all you who are weary and heavy laden, and I will give you rest." },
  { reference: "John 1:14", text: "And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth." },
  { reference: "Psalm 23:1-3", text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul." },
  { reference: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
  { reference: "1 Corinthians 13:13", text: "So now faith, hope, and love abide, these three; but the greatest of these is love." },
  { reference: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand." },
  { reference: "Philippians 4:6-7", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus." },
  { reference: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
  { reference: "Psalm 34:18", text: "The Lord is near to the brokenhearted and saves the crushed in spirit." },
  { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
  { reference: "Hebrews 13:8", text: "Jesus Christ is the same yesterday and today and forever." },
];

export function getDailyVerse(readingContext?: string): {
  date: string;
  verse: { reference: string; text: string; translation?: string };
  reflection_prompt?: string;
  source: "bible-api" | "bolls" | "offline";
} {
  const today = new Date().toISOString().split("T")[0];
  const seedIdx = today.split("-").reduce((s, p) => s + parseInt(p, 10), 0) % OFFLINE_FALLBACK.length;
  const verse = OFFLINE_FALLBACK[seedIdx];
  return {
    date: today,
    verse: { ...verse, translation: "WEB" },
    reflection_prompt: readingContext
      ? `Reflect on ${verse.reference} in the context of a ${readingContext} reading. 60-80 words, warm and grounded. Close with the truth that the longing in the seeker's heart has a name.`
      : `Reflect on ${verse.reference}. 60-80 words, warm and grounded. Close with the truth that the longing in the seeker's heart has a name.`,
    source: "offline",
  };
}

export async function get_daily_verse_payload(readingContext?: string): Promise<{
  date: string;
  verse: { reference: string; text: string; translation?: string };
  reflection_prompt?: string;
  source: string;
}> {
  // Try Python first (live API), fall back to offline
  try {
    const out = await new Promise<string>((resolve, reject) => {
      const args = readingContext ? [PY_SCRIPT, readingContext] : [PY_SCRIPT];
      const proc = spawn("python3", args, { timeout: 5000 });
      let stdout = "";
      let stderr = "";
      proc.stdout.on("data", (d) => (stdout += d.toString()));
      proc.stderr.on("data", (d) => (stderr += d.toString()));
      proc.on("close", (code) => {
        if (code === 0 && stdout.trim()) resolve(stdout);
        else reject(new Error(`python exit ${code}: ${stderr}`));
      });
      proc.on("error", reject);
    });
    return JSON.parse(out);
  } catch (e) {
    // Python unavailable or timed out — use offline
    return getDailyVerse(readingContext);
  }
}
