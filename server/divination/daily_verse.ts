// Daily Insight service — the app no longer pulls from a single
// religious source. This file now serves a deterministic, universal
// library of multi-tradition entries (Tarot, Stoic, Rumi, Buddhist,
// Sufi, secular, I Ching, Psalms as universal paraphrase). Each entry
// is dated, attributed, and source-tagged so the LLM and UI know
// which tradition to acknowledge.
//
// The previous Python (bible-api.com) child-process path was removed
// when the app went global — no single tradition is the default
// anymore. See server/lifestyle/dailySource.ts for the
// user-selectable source feature (Plan D).

// Daily insight text — a rotation of universal, multi-tradition entries
// the user can pick from. No single deity is named. The "source" field
// tells the LLM and the UI which tradition the entry comes from, so the
// prompt knows to say "Today's I Ching says..." vs "Today's Rumi says...".
const OFFLINE_FALLBACK: Array<{ reference: string; text: string; source: string }> = [
  // ── Tarot (the default — matches the app's divination context) ──
  { source: "tarot", reference: "The Fool", text: "Step lightly. You are at the edge of something, and the edge is not a place to stand still." },
  { source: "tarot", reference: "The Star", text: "There is a quiet light in you that has not been touched by what has happened. Trust it." },
  { source: "tarot", reference: "Temperance", text: "Patience is not waiting. It is the gentle mixing of what you have, and what is yet to come." },
  { source: "tarot", reference: "The Hanged Man", text: "Suspend what you know. The world may be holding you in place for a reason." },
  { source: "tarot", reference: "The World", text: "Something is completing in you. Let it. There is room for what comes next." },
  // ── Stoic fragments (Marcus Aurelius, Seneca, Epictetus) ──
  { source: "stoic", reference: "Marcus Aurelius, Meditations 4.3", text: "Nowhere can man find a quieter or more untroubled retreat than in his own soul." },
  { source: "stoic", reference: "Seneca, Letters from a Stoic", text: "We suffer more often in imagination than in reality." },
  { source: "stoic", reference: "Epictetus, Enchiridion 1", text: "Some things are in our control and others are not." },
  { source: "stoic", reference: "Marcus Aurelius, Meditations 2.11", text: "You could leave life right now — let that determine what you do and say and think." },
  // ── Rumi ──
  { source: "rumi", reference: "Rumi, from the Divan", text: "What you seek is seeking you." },
  { source: "rumi", reference: "Rumi, Masnavi", text: "The wound is the place where the Light enters you." },
  { source: "rumi", reference: "Rumi, from the Divan", text: "Don't grieve. Anything you lose comes round in another form." },
  // ── Buddhist (Dhammapada, Thich Nhat Hanh, traditional) ──
  { source: "buddhist", reference: "Dhammapada 1.1", text: "Mind is the forerunner of all actions. Speak and act with a mind that is at peace, and happiness will follow." },
  { source: "buddhist", reference: "Thich Nhat Hanh", text: "Breathing in, I calm my body. Breathing out, I smile." },
  { source: "buddhist", reference: "Buddha", text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment." },
  // ── Sufi (Rumi covers most, adding a few distinct voices) ──
  { source: "sufi", reference: "Hafiz", text: "I once asked a bird, 'How is it that you fly in this weight of darkness?' The bird replied, 'I love the way my wings feel when they touch the wind.'" },
  { source: "sufi", reference: "Rumi", text: "What you are looking for is also looking for you. Do not sit and wait. Walk." },
  // ── Universal / secular wisdoms ──
  { source: "secular", reference: "Anonymous", text: "You are not behind. You are not late. You are exactly where your life needs you to be to learn what you are about to learn." },
  { source: "secular", reference: "Khalil Gibran, The Prophet", text: "Tenderness and kindness are not signs of weakness and despair, but manifestations of strength and resolution." },
  { source: "secular", reference: "Carl Sagan", text: "Somewhere, something incredible is waiting to be known." },
  { source: "secular", reference: "Mary Oliver", text: "Tell me, what is it you plan to do with your one wild and precious life?" },
  // ── I Ching (one of the 64 hexagrams, simplified) ──
  { source: "iching", reference: "Hexagram 1 — The Creative (Qian)", text: "The Creative works sublime success, furthering through perseverance." },
  { source: "iching", reference: "Hexagram 2 — The Receptive (Kun)", text: "The Receptive brings supreme success. It is favorable to remain where one is." },
  { source: "iching", reference: "Hexagram 11 — Peace (Tai)", text: "Peace. The small departs, the great approaches. Good fortune." },
  { source: "iching", reference: "Hexagram 42 — Increase (Yi)", text: "Increase. It is favorable to undertake something. It is favorable to cross the great water." },
  // ── Psalms & Hebrew wisdom (Jewish tradition — kept universal) ──
  { source: "psalms", reference: "Psalm 23 — paraphrase (universal)", text: "There is a kindness older than my fear. It walks beside me. It restores me." },
  { source: "psalms", reference: "Psalm 139 paraphrase (universal)", text: "Where can I go that you are not already there? There is no edge of the world where your kindness ends." },
];

export function getDailyVerse(readingContext?: string): {
  date: string;
  verse: { reference: string; text: string; translation?: string };
  reflection_prompt?: string;
  source: string;
} {
  const today = new Date().toISOString().split("T")[0];
  // Deterministic per date — same entry for everyone on the same day.
  const seedIdx = today.split("-").reduce((s, p) => s + parseInt(p, 10), 0) % OFFLINE_FALLBACK.length;
  const entry = OFFLINE_FALLBACK[seedIdx];
  return {
    date: today,
    verse: { reference: entry.reference, text: entry.text, translation: entry.source },
    reflection_prompt: readingContext
      ? `Reflect on the following (${entry.source} tradition) in the context of a ${readingContext} reading. 60-80 words, warm and grounded. Do not name a specific tradition or deity. Close with a sentence that lands.`
      : `Reflect on the following (${entry.source} tradition). 60-80 words, warm and grounded. Do not name a specific tradition or deity. Close with a sentence that lands.`,
    source: "offline",
  };
}

export async function get_daily_verse_payload(readingContext?: string): Promise<{
  date: string;
  verse: { reference: string; text: string; translation?: string };
  reflection_prompt?: string;
  source: string;
}> {
  // Python Bible API path removed — the app no longer treats any one
  // tradition as the default. The offline universal library is the
  // single source of truth for the daily insight. A user can pick a
  // specific tradition from the Lifestyle settings page.
  return getDailyVerse(readingContext);
}
