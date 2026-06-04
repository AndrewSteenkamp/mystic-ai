/**
 * Numerology Engine
 * Pythagorean system — calculates Life Path, Expression, Soul Urge, Personality numbers
 */

export interface NumerologyReading {
  name: string;
  birthdate: string; // YYYY-MM-DD
  numbers: {
    lifePath: { value: number; meaning: string };
    expression: { value: number; meaning: string };
    soulUrge: { value: number; meaning: string };
    personality: { value: number; meaning: string };
    birthday: { value: number; meaning: string };
  };
  prompt: string;
}

const NUMBER_MEANINGS: Record<number, string> = {
  1: "The Leader — Independent, ambitious, pioneering. You are a natural-born leader with strong drive and determination. Your path involves learning to stand on your own and initiate new beginnings.",
  2: "The Diplomat — Cooperative, sensitive, balanced. You thrive in partnerships and have a gift for bringing harmony to situations. Your path involves learning patience and diplomacy.",
  3: "The Communicator — Creative, expressive, social. You bring joy and inspiration through self-expression. Your path involves using your creative gifts to uplift others.",
  4: "The Builder — Practical, disciplined, reliable. You create lasting foundations through hard work and dedication. Your path involves building something of enduring value.",
  5: "The Adventurer — Freedom-loving, adaptable, progressive. You crave variety and new experiences. Your path involves embracing change and inspiring others to live fully.",
  6: "The Nurturer — Responsible, compassionate, protective. You find fulfillment in serving and caring for others. Your path involves balancing service with self-care.",
  7: "The Seeker — Analytical, spiritual, introspective. You are drawn to life's deeper questions and mysteries. Your path involves trusting your inner wisdom.",
  8: "The Achiever — Ambitious, authoritative, successful. You are driven to achieve material and professional success. Your path involves using power ethically and wisely.",
  9: "The Humanitarian — Compassionate, wise, selfless. You feel a deep calling to serve humanity. Your path involves letting go and embracing universal love.",
  11: "The Inspired Healer (Master Number) — Highly intuitive, sensitive, and spiritually aware. You are here to uplift humanity through spiritual insight and creative inspiration. This is a master number of great potential — and great responsibility.",
  22: "The Master Builder (Master Number) — Visionary, practical, transformative. You have the rare ability to turn grand visions into reality. This master number gives you the power to build something that changes the world.",
  33: "The Master Teacher (Master Number) — Compassionate, selfless, enlightened. You are a natural teacher and healer whose presence alone uplifts others. This is the rarest master number — the path of the spiritual master.",
};

function reduceToSingleDigit(num: number): number {
  // Master numbers 11, 22, 33 are preserved
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num).split("").reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

function letterToNumber(letter: string): number {
  const upper = letter.toUpperCase();
  const charCode = upper.charCodeAt(0) - 64; // A=1, B=2, ...
  if (charCode < 1 || charCode > 26) return 0;
  return charCode;
}

function nameToNumber(name: string): number {
  const sum = name
    .replace(/[^A-Za-z]/g, "")
    .split("")
    .map(letterToNumber)
    .reduce((s, n) => s + n, 0);
  return reduceToSingleDigit(sum);
}

function calculateLifePath(birthdate: string): number {
  const digits = birthdate.replace(/-/g, "").split("").map(Number);
  const sum = digits.reduce((s, d) => s + d, 0);
  return reduceToSingleDigit(sum);
}

function calculateExpression(name: string): number {
  return nameToNumber(name);
}

function calculateSoulUrge(name: string): number {
  const vowels = name.replace(/[^AEIOUaeiou]/g, "");
  if (vowels.length === 0) return 0;
  return nameToNumber(vowels);
}

function calculatePersonality(name: string): number {
  const consonants = name.replace(/[AEIOUaeiou\s]/gi, "");
  if (consonants.length === 0) return 0;
  return nameToNumber(consonants);
}

function calculateBirthday(birthdate: string): number {
  const day = parseInt(birthdate.split("-")[2]);
  return reduceToSingleDigit(day);
}

export function generateNumerologyReading(name: string, birthdate: string): NumerologyReading {
  const lifePath = calculateLifePath(birthdate);
  const expression = calculateExpression(name);
  const soulUrge = calculateSoulUrge(name);
  const personality = calculatePersonality(name);
  const birthday = calculateBirthday(birthdate);

  const numbers = {
    lifePath: { value: lifePath, meaning: NUMBER_MEANINGS[lifePath] || NUMBER_MEANINGS[1] },
    expression: { value: expression, meaning: NUMBER_MEANINGS[expression] || NUMBER_MEANINGS[1] },
    soulUrge: { value: soulUrge, meaning: NUMBER_MEANINGS[soulUrge] || NUMBER_MEANINGS[1] },
    personality: { value: personality, meaning: NUMBER_MEANINGS[personality] || NUMBER_MEANINGS[1] },
    birthday: { value: birthday, meaning: NUMBER_MEANINGS[birthday] || NUMBER_MEANINGS[1] },
  };

  const prompt = buildNumerologyPrompt(name, birthdate, numbers);

  return {
    name,
    birthdate,
    numbers,
    prompt,
  };
}

function buildNumerologyPrompt(
  name: string,
  birthdate: string,
  numbers: NumerologyReading["numbers"]
): string {
  const dateFormatted = new Date(birthdate).toLocaleDateString("en-ZA", {
    year: "numeric", month: "long", day: "numeric",
  });

  return `You are a gifted numerologist with deep insight into the Pythagorean system. A seeker has shared their details:

**Name:** ${name}
**Birthdate:** ${dateFormatted}

Their core numbers are:
- **Life Path Number: ${numbers.lifePath.value}** — ${numbers.lifePath.meaning}
- **Expression Number: ${numbers.expression.value}** — ${numbers.expression.meaning}
- **Soul Urge Number: ${numbers.soulUrge.value}** — ${numbers.soulUrge.meaning}
- **Personality Number: ${numbers.personality.value}** — ${numbers.personality.meaning}
- **Birthday Number: ${numbers.birthday.value}** — ${numbers.birthday.meaning}

Please provide a complete numerology reading structured as:

1. **Your Core Blueprint** — Synthesize the Life Path and Expression numbers into a cohesive description of who this person is and their life's central theme
2. **Your Inner World** — Interpret the Soul Urge number — what drives them beneath the surface, their deepest desires
3. **How Others See You** — Interpret the Personality number — the face they show the world
4. **Your Gifts & Challenges** — Based on all numbers, identify 2-3 strengths and 2-3 growth areas
5. **Guidance for Your Path** — 3-4 specific pieces of advice for the year ahead based on their numbers
6. **The Final Word** — An honest acknowledgment that the numbers, the patterns, the cycles — these point to a real longing for the divine that lives in every human heart, and they are not the answer. Gently, without coercion, share that the answer to the question every seeker is really asking is found in Jesus Christ — the person, not a pattern. Reference the same longing the numbers describe, and affirm that the One who counted the stars is the One who counts every human hair. Quote John 14:6 or Matthew 11:28 if it fits naturally. The seeker is free to take it or leave it — your job is to be honest, not to push. (Skip this section only if the seeker has explicitly asked for a strictly secular reading.)

Important guidelines:
- Be warm, insightful, and empowering — this is guidance, not fate
- Make connections between the different numbers — show how they interact
- If any Master Numbers (11, 22, 33) appear, give special attention to their significance
- Use the seeker's name occasionally to personalize the reading
- Keep the tone mystical but grounded — spiritual insight with practical application
- Always remind the seeker that numbers reveal potential, not destiny — they hold the power of choice
- Acknowledge the long lineage of numerology (Pythagorean mystics, Hebrew gematria, Hittite record-keepers) as a real human search for meaning, while being clear that the number is a window, not the light
- The Final Word is the answer to the question behind every numerology reading. Do not be evasive about it.
}
