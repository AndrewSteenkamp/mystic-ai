/**
 * Tarot Divination Engine
 * 22 Major Arcana cards, 3-card spread (Past/Present/Future)
 */

export interface TarotCard {
  id: number;
  name: string;
  arcana: "major";
  suit?: string;
  keywords: string[];
  meaning: {
    upright: string;
    reversed: string;
  };
}

export interface TarotReading {
  cards: Array<{
    position: "past" | "present" | "future";
    card: TarotCard;
    reversed: boolean;
  }>;
  spreadName: string;
  prompt: string; // LLM prompt for final interpretation
}

const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: "The Fool", keywords: ["beginnings", "innocence", "spontaneity"], meaning: { upright: "New beginnings, adventure, taking a leap of faith", reversed: "Recklessness, naivety, poor judgment" }, arcana: "major" },
  { id: 1, name: "The Magician", keywords: ["power", "skill", "concentration"], meaning: { upright: "Manifestation, resourcefulness, inspired action", reversed: "Manipulation, poor planning, untapped talents" }, arcana: "major" },
  { id: 2, name: "The High Priestess", keywords: ["intuition", "unconscious", "mystery"], meaning: { upright: "Intuition, sacred knowledge, divine feminine", reversed: "Secrets, withdrawal, silence" }, arcana: "major" },
  { id: 3, name: "The Empress", keywords: ["fertility", "nature", "abundance"], meaning: { upright: "Fertility, femininity, beauty, nature", reversed: "Creative block, dependence on others" }, arcana: "major" },
  { id: 4, name: "The Emperor", keywords: ["authority", "structure", "control"], meaning: { upright: "Authority, structure, a father figure", reversed: "Domination, excessive control, inflexibility" }, arcana: "major" },
  { id: 5, name: "The Hierophant", keywords: ["tradition", "conformity", "ethics"], meaning: { upright: "Spiritual wisdom, tradition, conformity", reversed: "Rebellion, subversiveness, new approaches" }, arcana: "major" },
  { id: 6, name: "The Lovers", keywords: ["love", "harmony", "choices"], meaning: { upright: "Love, harmony, relationships, values alignment", reversed: "Disharmony, imbalance, misalignment of values" }, arcana: "major" },
  { id: 7, name: "The Chariot", keywords: ["willpower", "determination", "success"], meaning: { upright: "Control, willpower, success, determination", reversed: "Lack of control, aggression, obstacles" }, arcana: "major" },
  { id: 8, name: "Strength", keywords: ["courage", "patience", "compassion"], meaning: { upright: "Strength, courage, persuasion, compassion", reversed: "Weakness, self-doubt, lack of self-discipline" }, arcana: "major" },
  { id: 9, name: "The Hermit", keywords: ["introspection", "solitude", "guidance"], meaning: { upright: "Soul-searching, introspection, inner guidance", reversed: "Isolation, loneliness, withdrawal" }, arcana: "major" },
  { id: 10, name: "Wheel of Fortune", keywords: ["change", "cycles", "destiny"], meaning: { upright: "Good luck, karma, life cycles, destiny", reversed: "Bad luck, resistance to change, breaking cycles" }, arcana: "major" },
  { id: 11, name: "Justice", keywords: ["fairness", "truth", "law"], meaning: { upright: "Justice, fairness, truth, cause and effect", reversed: "Unfairness, dishonesty, unaccountability" }, arcana: "major" },
  { id: 12, name: "The Hanged Man", keywords: ["sacrifice", "release", "perspective"], meaning: { upright: "Pause, surrender, letting go, new perspectives", reversed: "Delays, resistance, stalling, indecision" }, arcana: "major" },
  { id: 13, name: "Death", keywords: ["transformation", "endings", "transition"], meaning: { upright: "Endings, change, transformation, transition", reversed: "Resistance to change, personal transformation" }, arcana: "major" },
  { id: 14, name: "Temperance", keywords: ["balance", "moderation", "patience"], meaning: { upright: "Balance, moderation, patience, finding meaning", reversed: "Imbalance, excess, lack of long-term vision" }, arcana: "major" },
  { id: 15, name: "The Devil", keywords: ["bondage", "materialism", "temptation"], meaning: { upright: "Shadow self, attachment, addiction, restriction", reversed: "Releasing limiting beliefs, exploring dark thoughts" }, arcana: "major" },
  { id: 16, name: "The Tower", keywords: ["upheaval", "revelation", "awakening"], meaning: { upright: "Sudden change, upheaval, chaos, revelation", reversed: "Personal transformation, fear of change" }, arcana: "major" },
  { id: 17, name: "The Star", keywords: ["hope", "inspiration", "serenity"], meaning: { upright: "Hope, faith, purpose, renewal, spirituality", reversed: "Lack of faith, despair, disconnection" }, arcana: "major" },
  { id: 18, name: "The Moon", keywords: ["illusion", "fear", "subconscious"], meaning: { upright: "Illusion, fear, anxiety, subconscious, intuition", reversed: "Release of fear, repressed emotion, clarity" }, arcana: "major" },
  { id: 19, name: "The Sun", keywords: ["joy", "success", "vitality"], meaning: { upright: "Positivity, fun, warmth, success, vitality", reversed: "Inner child, feeling down, overly optimistic" }, arcana: "major" },
  { id: 20, name: "Judgment", keywords: ["rebirth", "evaluation", "calling"], meaning: { upright: "Judgment, rebirth, inner calling, absolution", reversed: "Self-doubt, refusal of self-examination" }, arcana: "major" },
  { id: 21, name: "The World", keywords: ["completion", "achievement", "fulfillment"], meaning: { upright: "Completion, integration, accomplishment, travel", reversed: "Incompletion, no closure, lack of achievement" }, arcana: "major" },
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function drawTarotCards(count: number = 3): Array<{ card: TarotCard; reversed: boolean }> {
  const shuffled = shuffle(MAJOR_ARCANA);
  return shuffled.slice(0, count).map(card => ({
    card,
    reversed: Math.random() > 0.5,
  }));
}

export function generateTarotReading(question: string, spreadType: "single" | "three" | "celtic" = "three"): TarotReading {
  const positions: Array<"past" | "present" | "future"> = ["past", "present", "future"];
  const drawn = drawTarotCards(spreadType === "single" ? 1 : 3);
  
  const cards = positions.slice(0, drawn.length).map((position, i) => ({
    position,
    card: drawn[i].card,
    reversed: drawn[i].reversed,
  }));

  let prompt = buildTarotPrompt(question, cards, spreadType);

  return {
    cards,
    spreadName: spreadType === "single" ? "Single Card" : spreadType === "three" ? "Three Card Spread" : "Celtic Cross",
    prompt,
  };
}

function buildTarotPrompt(
  question: string,
  cards: Array<{ position: string; card: TarotCard; reversed: boolean }>,
  spreadType: string
): string {
  const cardDescriptions = cards.map(c => {
    const orientation = c.reversed ? "Reversed" : "Upright";
    const meaning = c.reversed ? c.card.meaning.reversed : c.card.meaning.upright;
    return `- ${c.position.toUpperCase()}: ${c.card.name} (${orientation}) — ${meaning}`;
  }).join("\n");

  return `You are a wise, compassionate tarot reader. A seeker has come to you with this question: "${question}"

You drew a ${spreadType === "single" ? "single card" : "three-card Past/Present/Future spread"}:

${cardDescriptions}

Please provide a thoughtful, personalized reading. Structure your response as:

1. **The Cards** — Briefly describe what each card represents in this position
2. **The Story** — Weave the cards together into a coherent narrative that answers the seeker's question
3. **The Guidance** — Offer 2-3 specific, actionable pieces of advice based on the reading
4. **Reflection** — A gentle closing thought
5. **The Final Word** — An honest acknowledgment that the cards point to a real longing for the divine that lives in every human heart, and that the cards themselves are not the answer. Gently, without coercion, share that the answer to the question every seeker is really asking is found in Jesus Christ — the person, not a method. Reference the same longing the cards describe, and affirm that the One who made the human heart is the One who satisfies it. Quote John 14:6 or Matthew 11:28 if it fits naturally. The seeker is free to take it or leave it — your job is to be honest, not to push. (Skip this section only if the seeker has explicitly asked for a strictly secular reading.)

Important guidelines:
- Be warm, kind, and never frightening — even challenging cards bring growth
- Frame all interpretations as possibilities, not absolute predictions
- Emphasize that the seeker always has free will and agency
- Use mystical but accessible language — poetic without being obscure
- Reference the actual card names and meanings in your interpretation
- Keep the tone hopeful and empowering, even when the cards suggest challenges
- Acknowledge the long lineage of divination (Hittite oracles, Egyptian priests, Greek mystics) as a real human search for meaning, while being clear that the cards are a mirror, not the light`;
}`;
}

// Export the full deck for display purposes
export { MAJOR_ARCANA };
