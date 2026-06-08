// ============================================================
// MYSTIC AI — DAILY INSIGHT SOURCE LIBRARY (Plan D)
// User-selectable daily source. Each user picks which tradition
// they want their daily insight to come from. The app remembers
// the choice and serves that source's entry every day.
//
// Sources are deterministic per date — same entry for everyone
// using that source on the same day, no API needed.
//
// When the user hasn't picked yet, default = 'tarot' (matches the
// app's divination context and gives the most universal entry).
// ============================================================

import { getDb } from "../db";

export interface DailySource {
  id: string;             // slug used in DB and API
  name: string;           // display name
  description: string;    // one-line subtitle for the picker
  emoji: string;          // for the source pill on the Home page
  category: "divinatory" | "philosophical" | "spiritual" | "secular";
}

export const DAILY_SOURCES: DailySource[] = [
  { id: "tarot",    name: "Tarot",          description: "A card for the day, drawn from the major arcana.",            emoji: "🃏", category: "divinatory" },
  { id: "iching",   name: "I Ching",         description: "A line from the ancient Chinese Book of Changes.",          emoji: "☯️", category: "divinatory" },
  { id: "rumi",     name: "Rumi",            description: "A verse from the 13th-century Sufi poet.",                  emoji: "🌹", category: "spiritual" },
  { id: "sufi",     name: "Sufi Wisdom",     description: "A saying from the Sufi tradition — Hafiz, Rumi, others.",  emoji: "🌙", category: "spiritual" },
  { id: "buddhist", name: "Buddhist",        description: "From the Dhammapada, Thich Nhat Hanh, and the Buddha.",     emoji: "🪷", category: "spiritual" },
  { id: "stoic",    name: "Stoic",           description: "Marcus Aurelius, Seneca, Epictetus — for the steady mind.", emoji: "🏛️", category: "philosophical" },
  { id: "psalms",   name: "Psalms (Universal)", description: "Hebrew wisdom, paraphrased for everyone, no specific belief.", emoji: "🕊️", category: "spiritual" },
  { id: "secular",  name: "Secular Wisdom",   description: "Khalil Gibran, Carl Sagan, Mary Oliver, and others.",        emoji: "✨", category: "secular" },
];

const SOURCE_BY_ID: Record<string, DailySource> = DAILY_SOURCES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }), {}
);

export function getSource(id: string): DailySource | null {
  return SOURCE_BY_ID[id] ?? null;
}

// ── Per-source rotation tables ──
// Each source has 5-12 entries. The daily index is determined by date
// so the same person sees the same entry on the same day, and everyone
// using the same source on the same day sees the same entry.

const ENTRIES: Record<string, { reference: string; text: string }[]> = {
  tarot: [
    { reference: "The Fool", text: "Step lightly. You are at the edge of something, and the edge is not a place to stand still." },
    { reference: "The Star", text: "There is a quiet light in you that has not been touched by what has happened. Trust it." },
    { reference: "Temperance", text: "Patience is not waiting. It is the gentle mixing of what you have, and what is yet to come." },
    { reference: "The Hanged Man", text: "Suspend what you know. The world may be holding you in place for a reason." },
    { reference: "The World", text: "Something is completing in you. Let it. There is room for what comes next." },
    { reference: "The Empress", text: "What you are tending is not small. Even the smallest garden changes the weather around it." },
    { reference: "The Hermit", text: "Solitude is not absence. It is the company of what is most true." },
  ],
  iching: [
    { reference: "Hexagram 1 — The Creative (Qian)", text: "The Creative works sublime success, furthering through perseverance." },
    { reference: "Hexagram 2 — The Receptive (Kun)", text: "The Receptive brings supreme success. It is favorable to remain where one is." },
    { reference: "Hexagram 11 — Peace (Tai)", text: "Peace. The small departs, the great approaches. Good fortune." },
    { reference: "Hexagram 42 — Increase (Yi)", text: "Increase. It is favorable to undertake something. It is favorable to cross the great water." },
    { reference: "Hexagram 61 — Inner Truth (Zhong Fu)", text: "Inner Truth. Pigs and fishes. It is favorable to cross the great water. Perseverance brings good fortune." },
    { reference: "Hexagram 29 — The Abysmal (Kan)", text: "The Abysmal. If you are sincere, you will succeed in the heart." },
  ],
  rumi: [
    { reference: "Rumi, from the Divan", text: "What you seek is seeking you." },
    { reference: "Rumi, Masnavi", text: "The wound is the place where the Light enters you." },
    { reference: "Rumi, from the Divan", text: "Don't grieve. Anything you lose comes round in another form." },
    { reference: "Rumi, Masnavi", text: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it." },
    { reference: "Rumi, from the Divan", text: "Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray." },
    { reference: "Rumi, Masnavi", text: "I once asked a rose how it grew so red and so thorny. The rose answered, 'I grew in the garden of love, where every day one of us died.'" },
  ],
  sufi: [
    { reference: "Hafiz", text: "I once asked a bird, 'How is it that you fly in this weight of darkness?' The bird replied, 'I love the way my wings feel when they touch the wind.'" },
    { reference: "Rumi", text: "What you are looking for is also looking for you. Do not sit and wait. Walk." },
    { reference: "Hafiz", text: "Admit something: Everyone you have ever loved is a prisoner of your heart. You are the key." },
    { reference: "Rumi", text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself." },
    { reference: "Hafiz", text: "What a wonderful thing to be a person. To be a soul in a body. To see with these eyes. To breathe this air." },
  ],
  buddhist: [
    { reference: "Dhammapada 1.1", text: "Mind is the forerunner of all actions. Speak and act with a mind that is at peace, and happiness will follow." },
    { reference: "Thich Nhat Hanh", text: "Breathing in, I calm my body. Breathing out, I smile." },
    { reference: "Buddha", text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment." },
    { reference: "Dhammapada 5.4", text: "Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is an ancient law." },
    { reference: "Thich Nhat Hanh", text: "The present moment is the only moment available to us, and it is the door to all moments." },
    { reference: "Buddha", text: "Peace comes from within. Do not seek it without." },
  ],
  stoic: [
    { reference: "Marcus Aurelius, Meditations 4.3", text: "Nowhere can man find a quieter or more untroubled retreat than in his own soul." },
    { reference: "Seneca, Letters from a Stoic", text: "We suffer more often in imagination than in reality." },
    { reference: "Epictetus, Enchiridion 1", text: "Some things are in our control and others are not." },
    { reference: "Marcus Aurelius, Meditations 2.11", text: "You could leave life right now — let that determine what you do and say and think." },
    { reference: "Seneca, Letters from a Stoic", text: "It is not the man who has too little, but the man who craves more, that is poor." },
    { reference: "Marcus Aurelius, Meditations 6.30", text: "Waste no more time arguing what a good man should be. Be one." },
  ],
  psalms: [
    { reference: "Psalm 23 — paraphrase (universal)", text: "There is a kindness older than my fear. It walks beside me. It restores me." },
    { reference: "Psalm 139 paraphrase (universal)", text: "Where can I go that you are not already there? There is no edge of the world where your kindness ends." },
    { reference: "Psalm 1 paraphrase (universal)", text: "Happy is the one who walks not in the counsel of the unkind, but stands beside the living waters." },
    { reference: "Psalm 46 paraphrase (universal)", text: "Be still, and know that the world holds more stillness than noise. There is a quiet beneath all the rushing." },
    { reference: "Psalm 121 paraphrase (universal)", text: "I lift my eyes to the hills. Where does my help come from? My help comes from the steady things — sun, breath, the kindness of those beside me." },
  ],
  secular: [
    { reference: "Anonymous", text: "You are not behind. You are not late. You are exactly where your life needs you to be to learn what you are about to learn." },
    { reference: "Khalil Gibran, The Prophet", text: "Tenderness and kindness are not signs of weakness and despair, but manifestations of strength and resolution." },
    { reference: "Carl Sagan", text: "Somewhere, something incredible is waiting to be known." },
    { reference: "Mary Oliver", text: "Tell me, what is it you plan to do with your one wild and precious life?" },
    { reference: "Viktor Frankl, Man's Search for Meaning", text: "When we are no longer able to change a situation, we are challenged to change ourselves." },
    { reference: "Rebecca Solnit", text: "To be hopeful in bad times is not just foolishly romantic. It is based on the fact that human history is a history not only of cruelty but also of compassion, sacrifice, courage, kindness." },
  ],
};

export function getDailyInsightForSource(source: string, dateISO?: string): {
  source: string;
  sourceName: string;
  sourceEmoji: string;
  date: string;
  reference: string;
  text: string;
} {
  const today = dateISO || new Date().toISOString().split("T")[0];
  const entries = ENTRIES[source];

  // If user picked an unknown source, fall back to tarot
  const safeSource = entries ? source : "tarot";
  const list = ENTRIES[safeSource];
  const idx = today.split("-").reduce((s, p) => s + parseInt(p, 10), 0) % list.length;
  const entry = list[idx];
  const meta = SOURCE_BY_ID[safeSource] || SOURCE_BY_ID.tarot;

  return {
    source: safeSource,
    sourceName: meta.name,
    sourceEmoji: meta.emoji,
    date: today,
    reference: entry.reference,
    text: entry.text,
  };
}

// ── User preference persistence ──

export function getUserDailySource(userId: number): string {
  const db = getDb();
  if (!db) return "tarot"; // safe default if DB is offline
  try {
    const row = db.prepare(
      "SELECT daily_source FROM user_preferences WHERE user_id = ?"
    ).get(userId) as { daily_source: string } | undefined;
    return row?.daily_source || "tarot";
  } catch {
    return "tarot";
  }
}

export function setUserDailySource(userId: number, source: string): boolean {
  const db = getDb();
  if (!db) return false;
  if (!SOURCE_BY_ID[source]) return false;
  try {
    db.prepare(`
      INSERT INTO user_preferences (user_id, daily_source, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        daily_source = excluded.daily_source,
        updated_at = datetime('now')
    `).run(userId, source);
    return true;
  } catch (e) {
    console.warn("setUserDailySource failed:", (e as Error).message);
    return false;
  }
}
