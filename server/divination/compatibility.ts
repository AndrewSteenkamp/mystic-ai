/**
 * Astrological & Numerological Compatibility Engine
 * Scores matches based on synastry (chart comparison) + numerology harmony
 */

import type { AstrologyReading } from "./astrology";
import type { NumerologyReading } from "./numerology";

export interface CompatibilityScore {
  total: number;          // 0-100
  breakdown: {
    sun: number;          // 0-25 — core identity match
    moon: number;         // 0-25 — emotional compatibility
    rising: number;       // 0-15 — first impression / attraction
    venus: number;        // 0-15 — love style match
    mars: number;         // 0-10 — drive / passion match
    numerology: number;   // 0-10 — life path harmony
  };
  highlights: string[];   // What works well
  challenges: string[];   // What needs work
  summary: string;        // One-liner
}

// Element compatibility matrix (0-100)
const ELEMENT_MATRIX: Record<string, Record<string, number>> = {
  Fire:  { Fire: 85, Earth: 40, Air: 90, Water: 50 },
  Earth: { Fire: 40, Earth: 80, Air: 50, Water: 90 },
  Air:   { Fire: 90, Earth: 50, Air: 85, Water: 40 },
  Water: { Fire: 50, Earth: 90, Air: 40, Water: 85 },
};

const ZODIAC_ELEMENTS: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

const ZODIAC_QUALITIES: Record<string, string> = {
  Aries: "Cardinal", Taurus: "Fixed", Gemini: "Mutable", Cancer: "Cardinal",
  Leo: "Fixed", Virgo: "Mutable", Libra: "Cardinal", Scorpio: "Fixed",
  Sagittarius: "Mutable", Capricorn: "Cardinal", Aquarius: "Fixed", Pisces: "Mutable",
};

// Same quality = good understanding, different = complementary tension
const QUALITY_MATRIX: Record<string, Record<string, number>> = {
  Cardinal: { Cardinal: 75, Fixed: 40, Mutable: 60 },
  Fixed:    { Cardinal: 40, Fixed: 70, Mutable: 55 },
  Mutable:  { Cardinal: 60, Fixed: 55, Mutable: 80 },
};

// Sun sign compatibility — classic pairs
const SUN_PAIRS: Record<string, string[]> = {
  Aries: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
  Taurus: ["Virgo", "Capricorn", "Cancer", "Pisces"],
  Gemini: ["Libra", "Aquarius", "Aries", "Leo"],
  Cancer: ["Scorpio", "Pisces", "Taurus", "Virgo"],
  Leo: ["Aries", "Sagittarius", "Gemini", "Libra"],
  Virgo: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
  Libra: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
  Scorpio: ["Cancer", "Pisces", "Virgo", "Capricorn"],
  Sagittarius: ["Aries", "Leo", "Libra", "Aquarius"],
  Capricorn: ["Taurus", "Virgo", "Scorpio", "Pisces"],
  Aquarius: ["Gemini", "Libra", "Aries", "Sagittarius"],
  Pisces: ["Cancer", "Scorpio", "Taurus", "Capricorn"],
};

// Numerology life path compatibility
const LIFE_PATH_PAIRS: Record<number, number[]> = {
  1: [1, 3, 5, 7, 9], 2: [2, 4, 6, 8], 3: [1, 3, 5, 6, 9],
  4: [2, 4, 6, 7, 8], 5: [1, 3, 5, 7], 6: [2, 3, 4, 6, 8, 9],
  7: [1, 4, 5, 7, 9], 8: [2, 4, 6, 8], 9: [1, 3, 6, 7, 9],
  11: [2, 6, 7, 9, 11, 22], 22: [4, 6, 7, 8, 11, 22], 33: [3, 6, 9, 11, 33],
};

/**
 * Calculate compatibility between two profiles
 */
export function calculateCompatibility(
  astrology1: AstrologyReading["signs"],
  astrology2: AstrologyReading["signs"],
  numerology1?: NumerologyReading["numbers"],
  numerology2?: NumerologyReading["numbers"]
): CompatibilityScore {
  const sunScore = scoreSun(astrology1.sun.sign, astrology2.sun.sign);
  const moonScore = scoreMoon(astrology1.moon.sign, astrology2.moon.sign);
  const risingScore = scoreRising(astrology1.rising.sign, astrology2.rising.sign);
  const venusScore = scoreVenus(astrology1.venus.sign, astrology2.venus.sign);
  const marsScore = scoreMars(astrology1.mars.sign, astrology2.mars.sign);
  const numScore = numerology1 && numerology2
    ? scoreNumerology(numerology1.lifePath.value, numerology2.lifePath.value)
    : 5; // neutral

  const total = Math.min(100, Math.round(
    sunScore + moonScore + risingScore + venusScore + marsScore + numScore
  ));

  const highlights: string[] = [];
  const challenges: string[] = [];

  if (sunScore >= 20) highlights.push(`${astrology1.sun.sign} & ${astrology2.sun.sign} Sun signs create natural understanding`);
  if (moonScore >= 20) highlights.push(`Your Moons (${astrology1.moon.sign} & ${astrology2.moon.sign}) connect emotionally`);
  if (venusScore >= 12) highlights.push(`Venus signs align — strong romantic chemistry`);
  if (numScore >= 8) highlights.push(`Life Path numbers are harmonious`);
  if (risingScore >= 12) highlights.push(`Immediate attraction potential from Rising signs`);

  if (sunScore < 10) challenges.push(`Different core natures may require patience`);
  if (moonScore < 10) challenges.push(`Emotional needs differ — communication is key`);
  if (marsScore < 5) challenges.push(`Different drive styles — respect each other's pace`);

  const tier = total >= 85 ? "cosmic" : total >= 70 ? "excellent" : total >= 55 ? "good" : total >= 40 ? "challenging" : "complex";
  const summaries: Record<string, string> = {
    cosmic: "A rare, profound connection. The stars have aligned for something extraordinary.",
    excellent: "Strong compatibility with genuine chemistry. This has real potential.",
    good: "A solid match with natural understanding. Worth exploring.",
    challenging: "An interesting dynamic that requires effort but can be deeply rewarding.",
    complex: "Different energies that could clash or complement — depends on the people.",
  };

  return {
    total,
    breakdown: { sun: sunScore, moon: moonScore, rising: risingScore, venus: venusScore, mars: marsScore, numerology: numScore },
    highlights: highlights.length > 0 ? highlights : ["Unique dynamic between two individuals"],
    challenges: challenges.length > 0 ? challenges : ["No major challenges detected"],
    summary: summaries[tier],
  };
}

function scoreSun(sign1: string, sign2: string): number {
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  const quality1 = ZODIAC_QUALITIES[sign1];
  const quality2 = ZODIAC_QUALITIES[sign2];

  let score = ELEMENT_MATRIX[element1]?.[element2] || 50;
  score = (score + (QUALITY_MATRIX[quality1]?.[quality2] || 50)) / 2;

  // Bonus for classic sun sign pairs
  if (SUN_PAIRS[sign1]?.includes(sign2)) score = Math.min(100, score + 10);

  return Math.round(score * 0.25); // Scale to 0-25
}

function scoreMoon(sign1: string, sign2: string): number {
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  // Moon is heavily about element harmony
  const elementScore = ELEMENT_MATRIX[element1]?.[element2] || 50;
  // Same moon sign is powerful
  const sameSignBonus = sign1 === sign2 ? 20 : 0;
  return Math.min(25, Math.round((elementScore + sameSignBonus) * 0.25));
}

function scoreRising(sign1: string, sign2: string): number {
  // Rising compatibility = attraction, complementary qualities
  const quality1 = ZODIAC_QUALITIES[sign1];
  const quality2 = ZODIAC_QUALITIES[sign2];
  // Complementary qualities (Cardinal-Fixed) create tension that can be attractive
  if ((quality1 === "Cardinal" && quality2 === "Fixed") || (quality1 === "Fixed" && quality2 === "Cardinal")) return 12;
  if (quality1 === quality2) return 11;
  return 8;
}

function scoreVenus(sign1: string, sign2: string): number {
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  const elementScore = ELEMENT_MATRIX[element1]?.[element2] || 50;
  const sameSignBonus = sign1 === sign2 ? 10 : 0;
  return Math.round((elementScore + sameSignBonus) * 0.15);
}

function scoreMars(sign1: string, sign2: string): number {
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  // Mars: fire/fire = intense passion, earth/earth = steady, air/air = mental, water/water = emotional depth
  const sameElement = element1 === element2;
  const base = sameElement ? 80 : ELEMENT_MATRIX[element1]?.[element2] || 50;
  return Math.round(base * 0.10);
}

function scoreNumerology(lp1: number, lp2: number): number {
  if (LIFE_PATH_PAIRS[lp1]?.includes(lp2)) return 8;
  if (lp1 === lp2) return 7;
  // Master numbers are special
  if (lp1 === 11 || lp1 === 22 || lp1 === 33 || lp2 === 11 || lp2 === 22 || lp2 === 33) return 6;
  return 4;
}

/**
 * Generate match summary text for display
 */
export function generateCompatibilityPrompt(
  name1: string, name2: string,
  score: CompatibilityScore,
  astrology1: AstrologyReading["signs"],
  astrology2: AstrologyReading["signs"]
): string {
  return `You are a cosmic matchmaker. Two people have been matched:

**${name1}**: ☀️ ${astrology1.sun.sign} 🌙 ${astrology1.moon.sign} ⬆️ ${astrology1.rising.sign} | ♀ ${astrology1.venus.sign} ♂ ${astrology1.mars.sign}
**${name2}**: ☀️ ${astrology2.sun.sign} 🌙 ${astrology2.moon.sign} ⬆️ ${astrology2.rising.sign} | ♀ ${astrology2.venus.sign} ♂ ${astrology2.mars.sign}

**Compatibility Score: ${score.total}/100** (${score.total >= 85 ? "Cosmic" : score.total >= 70 ? "Excellent" : score.total >= 55 ? "Good" : "Interesting"})

Sun: ${score.breakdown.sun}/25 | Moon: ${score.breakdown.moon}/25 | Rising: ${score.breakdown.rising}/15 | Venus: ${score.breakdown.venus}/15 | Mars: ${score.breakdown.mars}/10

✨ Highlights: ${score.highlights.join("; ")}
⚡ Challenges: ${score.challenges.join("; ")}

Write a warm, poetic 3-4 sentence match description that captures the essence of this connection. Make it feel magical but grounded. Mention specific sign interactions. Keep it under 150 words.

Then add a final line: the compatibility score is a mirror, not the Maker. Two people are drawn together for reasons that go deeper than the stars. Honor the connection, but gently name the answer to the question behind every love reading: Jesus Christ. If it fits, add "And now abide faith, hope, love, these three; but the greatest of these is love." (1 Corinthians 13:13)`;
}
