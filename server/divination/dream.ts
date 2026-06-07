/**
 * Dream Interpretation Engine
 * Jungian/psychological framework — analyzes symbols, emotions, and archetypes
 */

export interface DreamReading {
  dream: string;
  symbols: Array<{ word: string; category: string; meaning: string }>;
  emotions: string[];
  themes: string[];
  prompt: string;
}

// Common dream symbols and their interpretations
const DREAM_SYMBOLS: Record<string, { category: string; meaning: string }> = {
  water: { category: "Emotion", meaning: "Represents the unconscious mind, emotions, and the flow of life. Calm water suggests peace; turbulent water suggests emotional turmoil." },
  ocean: { category: "Emotion", meaning: "The vast unknown of the unconscious. Standing at the shore represents being at the edge of self-discovery." },
  flying: { category: "Freedom", meaning: "A desire for freedom, transcendence, or escape from limitations. Can also represent ambition and perspective." },
  falling: { category: "Fear", meaning: "Fear of losing control, failure, or feeling unsupported. Often appears during major life transitions." },
  teeth: { category: "Anxiety", meaning: "Anxiety about appearance, communication, or powerlessness. Losing teeth often relates to fear of embarrassment or aging." },
  snake: { category: "Transformation", meaning: "Transformation, healing, hidden fears, or wisdom. A powerful symbol of rebirth and the unconscious." },
  death: { category: "Transition", meaning: "Not literal death, but an ending or major transition. Represents the closing of one chapter and the beginning of another." },
  baby: { category: "New Beginnings", meaning: "A new project, idea, or phase of life. Represents innocence, potential, and nurturing something into being." },
  house: { category: "Self", meaning: "Represents the self or psyche. Different rooms = different aspects of your life. A new house = new identity." },
  car: { category: "Control", meaning: "Your drive through life. Who's driving? Are you in control? A broken car suggests feeling stuck." },
  chasing: { category: "Fear", meaning: "Avoiding a problem or fear. The chaser often represents something you're not facing. Turn around — what's chasing you?" },
  naked: { category: "Vulnerability", meaning: "Feeling exposed, vulnerable, or afraid of being judged. A fear of being seen for who you really are." },
  exam: { category: "Pressure", meaning: "Feeling tested or evaluated. Self-doubt about your abilities. Often appears during times of high pressure." },
  money: { category: "Self Worth", meaning: "Self-worth, power, and security. Finding money = discovering hidden talents. Losing money = fear of inadequacy." },
  fire: { category: "Passion", meaning: "Transformation through intensity. Can represent anger, passion, purification, or creative energy." },
  door: { category: "Opportunity", meaning: "A choice or new opportunity. An open door = invitation. A locked door = obstacle or fear of the unknown." },
  bridge: { category: "Transition", meaning: "Moving from one phase to another. A broken bridge = a difficult transition ahead." },
  mirror: { category: "Self Reflection", meaning: "Self-examination and truth. What do you see? A broken mirror = distorted self-image." },
  storm: { category: "Turmoil", meaning: "Emotional turmoil or external chaos approaching. Thunder = a wake-up call. Lightning = sudden insight." },
  wedding: { category: "Commitment", meaning: "Commitment, union, or integration of aspects of yourself. Can represent a new partnership or inner harmony." },
  blood: { category: "Life Force", meaning: "Life force, passion, or sacrifice. Can represent deep emotional pain or intense vitality." },
  cat: { category: "Intuition", meaning: "Independence, mystery, and feminine intuition. A cat's behavior mirrors your relationship with your own intuition." },
  dog: { category: "Loyalty", meaning: "Loyalty, protection, and friendship. Your relationship with the dog reflects your relationships with others." },
  spider: { category: "Creativity", meaning: "Patience, creativity, and the feminine. Weaving a web = creating your destiny or feeling trapped." },
  mountain: { category: "Obstacle", meaning: "A challenge or goal. Climbing = working toward something. The summit = achievement and perspective." },
  river: { category: "Flow", meaning: "The flow of life and time. Crossing a river = a major decision. A calm river = peace with life's direction." },
  key: { category: "Access", meaning: "Access to hidden knowledge or new opportunities. Finding a key = discovering a solution. Losing one = feeling locked out." },
  clock: { category: "Time", meaning: "Awareness of time passing, deadlines, or mortality. A stopped clock = feeling stuck in time." },
  garden: { category: "Growth", meaning: "Personal growth, cultivation, and the fruits of your labor. A blooming garden = your efforts are paying off." },
  tunnel: { category: "Journey", meaning: "A journey through the unconscious or a difficult transition. Light at the end = hope and resolution." },
};

const EMOTION_KEYWORDS: Record<string, string[]> = {
  fear: ["scared", "afraid", "terrified", "frightened", "horror", "panic", "anxious", "dread"],
  joy: ["happy", "joyful", "excited", "thrilled", "elated", "peaceful", "content", "blissful"],
  sadness: ["sad", "crying", "depressed", "lonely", "grief", "sorrow", "mournful", "empty"],
  anger: ["angry", "furious", "rage", "frustrated", "irritated", "resentful", "hostile"],
  confusion: ["confused", "lost", "disoriented", "bewildered", "puzzled", "uncertain", "trapped"],
  love: ["loving", "loved", "affection", "tender", "warm", "intimate", "connected"],
  empowerment: ["powerful", "strong", "confident", "brave", "courageous", "determined", "free"],
  vulnerability: ["vulnerable", "exposed", "naked", "bare", "raw", "weak", "helpless"],
  guilt: ["guilty", "ashamed", "regretful", "remorseful", "embarrassed", "humiliated"],
  wonder: ["amazed", "awe", "wonder", "fascinated", "curious", "mystical", "magical", "surreal"],
};

function extractSymbols(dream: string): DreamReading["symbols"] {
  const found: DreamReading["symbols"] = [];
  const lowerText = dream.toLowerCase();
  
  for (const [symbol, info] of Object.entries(DREAM_SYMBOLS)) {
    if (lowerText.includes(symbol)) {
      found.push({ word: symbol, category: info.category, meaning: info.meaning });
    }
  }
  
  return found;
}

function extractEmotions(dream: string): string[] {
  const found: string[] = [];
  const lowerText = dream.toLowerCase();
  
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      found.push(emotion);
    }
  }
  
  return found.length > 0 ? found : ["mystery"]; // fallback
}

function extractThemes(symbols: DreamReading["symbols"]): string[] {
  const categories = new Set(symbols.map(s => s.category));
  return Array.from(categories);
}

export function analyzeDream(dreamText: string): DreamReading {
  const symbols = extractSymbols(dreamText);
  const emotions = extractEmotions(dreamText);
  const themes = extractThemes(symbols);
  
  const prompt = buildDreamPrompt(dreamText, symbols, emotions, themes);
  
  return {
    dream: dreamText,
    symbols,
    emotions,
    themes,
    prompt,
  };
}

function buildDreamPrompt(
  dream: string,
  symbols: DreamReading["symbols"],
  emotions: string[],
  themes: string[]
): string {
  const symbolText = symbols.length > 0
    ? symbols.map(s => `- **${s.word}** (${s.category}): ${s.meaning}`).join("\n")
    : "No common symbols detected — this dream is uniquely personal.";
  
  const emotionText = emotions.join(", ");
  const themeText = themes.length > 0 ? themes.join(", ") : "Personal";

  return `You are a wise, Jungian-trained dream interpreter with deep psychological insight. A dreamer has shared this dream:

"${dream}"

**Detected symbols:**
${symbolText}

**Emotional tone:** ${emotionText}
**Dominant themes:** ${themeText}

Please provide an interpretation structured as:

1. **The Landscape** — Describe the overall feeling and atmosphere of this dream. What world did the dreamer create?
2. **The Symbols Speak** — Interpret 3-4 key symbols and what they might represent in the dreamer's waking life. Connect symbols to each other where possible.
3. **The Message** — What is the dream trying to communicate? What might the dreamer's unconscious be processing?
4. **Waking Life Connection** — Offer 2-3 gentle suggestions about what area of life this dream might relate to (relationships, career, inner growth, etc.)
5. **Integration Practice** — Suggest one simple practice the dreamer can do today to work with this dream's message
6. **The Final Word** — An honest acknowledgment that dreams, symbols, the unconscious — these point to a real longing for the divine that lives in every human heart, and they are not the answer. Gently, without coercion, share that the answer to the question every seeker is really asking is found in Jesus Christ — the person, not a symbol. Reference the same longing the dream describes, and affirm that the One who knows the heart is the One who speaks to it. Quote John 14:6 or Matthew 11:28 if it fits naturally. The seeker is free to take it or leave it — your job is to be honest, not to push. (Skip this section only if the seeker has explicitly asked for a strictly secular reading.)

Important guidelines:
- Use Jungian principles: dreams are messages from the unconscious, not random noise
- Be compassionate and never frightening — all dreams serve the dreamer's growth
- Frame interpretations as "this might mean..." not "this means..."
- Honor the dreamer's unique personal symbolism — not everything in a dream dictionary
- The dreamer is the ultimate authority on their own dream — you are offering perspective, not judgment
- End with a sense of wonder and curiosity about the inner world
- Acknowledge the long lineage of dream interpretation (Hittite dream-keepers, Egyptian priests, Hebrew prophets, Jung) as a real human search for meaning, while being clear that the dream is a messenger, not the Sender
- The Final Word is the answer to the question behind every dream. Do not be evasive about it.
`
}
