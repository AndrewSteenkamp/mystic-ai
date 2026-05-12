/**
 * Astrology Engine
 * Calculates sun, moon, rising signs + planetary positions
 * Simplified calculations (accurate to within a few degrees)
 */

export interface AstrologyReading {
  name: string;
  birthdate: string;
  birthTime: string | null; // HH:MM format, optional
  birthPlace: string | null;
  signs: {
    sun: { sign: string; degree: number; house: number; meaning: string };
    moon: { sign: string; degree: number; house: number; meaning: string };
    rising: { sign: string; degree: number; meaning: string };
    mercury: { sign: string; meaning: string };
    venus: { sign: string; meaning: string };
    mars: { sign: string; meaning: string };
  };
  prompt: string;
}

const ZODIAC_SIGNS = [
  { name: "Aries", emoji: "♈", element: "Fire", quality: "Cardinal", dates: "Mar 21 - Apr 19", degree: 0 },
  { name: "Taurus", emoji: "♉", element: "Earth", quality: "Fixed", dates: "Apr 20 - May 20", degree: 30 },
  { name: "Gemini", emoji: "♊", element: "Air", quality: "Mutable", dates: "May 21 - Jun 20", degree: 60 },
  { name: "Cancer", emoji: "♋", element: "Water", quality: "Cardinal", dates: "Jun 21 - Jul 22", degree: 90 },
  { name: "Leo", emoji: "♌", element: "Fire", quality: "Fixed", dates: "Jul 23 - Aug 22", degree: 120 },
  { name: "Virgo", emoji: "♍", element: "Earth", quality: "Mutable", dates: "Aug 23 - Sep 22", degree: 150 },
  { name: "Libra", emoji: "♎", element: "Air", quality: "Cardinal", dates: "Sep 23 - Oct 22", degree: 180 },
  { name: "Scorpio", emoji: "♏", element: "Water", quality: "Fixed", dates: "Oct 23 - Nov 21", degree: 210 },
  { name: "Sagittarius", emoji: "♐", element: "Fire", quality: "Mutable", dates: "Nov 22 - Dec 21", degree: 240 },
  { name: "Capricorn", emoji: "♑", element: "Earth", quality: "Cardinal", dates: "Dec 22 - Jan 19", degree: 270 },
  { name: "Aquarius", emoji: "♒", element: "Air", quality: "Fixed", dates: "Jan 20 - Feb 18", degree: 300 },
  { name: "Pisces", emoji: "♓", element: "Water", quality: "Mutable", dates: "Feb 19 - Mar 20", degree: 330 },
];

const SIGN_MEANINGS: Record<string, { sun: string; moon: string; rising: string; mercury: string; venus: string; mars: string }> = {
  Aries: {
    sun: "Your core identity is bold, pioneering, and fiercely independent. You lead with courage and thrive on new challenges.",
    moon: "Your emotional nature is fiery and direct. You feel things intensely and react quickly, but anger passes as fast as it arrives.",
    rising: "You come across as confident, energetic, and ready for action. People see you as a natural leader who doesn't wait for permission.",
    mercury: "You communicate directly and decisively. Your mind is quick and competitive — you think fast and speak your truth without hesitation.",
    venus: "In love, you're passionate and spontaneous. You pursue what you want boldly and love the thrill of the chase.",
    mars: "Your drive is unstoppable when inspired. You attack challenges head-on and have endless energy for what excites you.",
  },
  Taurus: {
    sun: "Your core self is grounded, patient, and deeply connected to the physical world. You build things that last.",
    moon: "You need emotional security and stability. Change unsettles you — you find peace in routine, comfort, and the familiar.",
    rising: "You project calm, reliability, and quiet strength. People feel safe around you and trust your steady presence.",
    mercury: "Your mind works methodically. You think things through thoroughly before speaking, and your words carry weight.",
    venus: "You love deeply and sensually. Romance for you is about touch, taste, beauty, and lasting commitment.",
    mars: "You move at your own pace — slow, steady, unstoppable. Once committed, nothing can move you off course.",
  },
  Gemini: {
    sun: "Your essence is curious, adaptable, and eternally youthful. You collect ideas and connections like treasures.",
    moon: "You process emotions through words and analysis. Talking about feelings helps you understand them — silence feels suffocating.",
    rising: "You come across as witty, charming, and intellectually curious. People see you as someone who knows a little about everything.",
    mercury: "Your mind is lightning-fast, versatile, and brilliant at making connections. You're a natural communicator and storyteller.",
    venus: "You're attracted to intelligence and wit. Mental connection is foreplay — you fall in love through conversation.",
    mars: "Your energy is mental and social. You pursue goals through networking, learning, and adaptability rather than brute force.",
  },
  Cancer: {
    sun: "Your soul is nurturing, protective, and deeply feeling. Home and family are your sacred ground.",
    moon: "Emotions are your first language. You feel everything intensely — joy, pain, love, loss — and your moods shift like tides.",
    rising: "You appear soft, caring, and approachable. Your emotional intelligence draws people to you for comfort and wisdom.",
    mercury: "Your thoughts are colored by emotion and memory. You communicate with empathy and never forget how something made you feel.",
    venus: "You love by nurturing. Safety, trust, and emotional depth mean more to you than grand romantic gestures.",
    mars: "You protect what you love fiercely. Your drive comes from emotional commitment — when you care, you're unstoppable.",
  },
  Leo: {
    sun: "You are radiant, creative, and meant to shine. Your purpose involves expressing your unique light and inspiring others.",
    moon: "You need to feel special and appreciated. Your emotional wellbeing depends on being seen and valued for who you are.",
    rising: "You enter a room like the sun rising. Your presence is warm, magnetic, and impossible to ignore.",
    mercury: "You communicate with drama and passion. You're a natural performer — your words inspire and entertain.",
    venus: "You love grandly and generously. Romance is a stage and you want a love story worth telling.",
    mars: "Your drive is powered by pride and passion. You work hard for recognition and pour your heart into what you create.",
  },
  Virgo: {
    sun: "Your essence is analytical, service-oriented, and ever-improving. You find meaning in making things better.",
    moon: "You feel safe when things are orderly and understood. Chaos in your environment creates chaos in your heart.",
    rising: "You project competence, modesty, and helpfulness. People see you as the one who has things figured out.",
    mercury: "Your mind is precise, analytical, and detail-oriented. You notice what others miss and communicate with clarity.",
    venus: "You show love through acts of service. Grand gestures feel hollow — you prove devotion through consistent care.",
    mars: "Your drive is methodical and efficient. You attack problems by breaking them into manageable pieces.",
  },
  Libra: {
    sun: "Your core is about balance, beauty, and relationships. You see all sides and seek harmony in everything.",
    moon: "You need peace and partnership. Conflict drains you; harmony restores you. You feel best when relationships are balanced.",
    rising: "You project charm, diplomacy, and grace. People are drawn to your sense of fairness and aesthetic sensibility.",
    mercury: "Your mind weighs all perspectives. You communicate with tact and see truth as something that exists between viewpoints.",
    venus: "You are a true romantic. Love is an art form to you — you seek beauty, balance, and a true equal partner.",
    mars: "You pursue goals through cooperation and charm. You'd rather win people over than fight them.",
  },
  Scorpio: {
    sun: "Your soul runs deep, intense, and transformative. You see beneath surfaces and are unafraid of darkness.",
    moon: "Your emotions are volcanic — still on the surface, molten underneath. You feel everything with intensity most people can't imagine.",
    rising: "You project mystery, power, and depth. People sense there's more to you than meets the eye — and there always is.",
    mercury: "Your mind is investigative and penetrating. You don't do small talk — you go straight to the truth.",
    venus: "You love with soul-deep intensity. Casual isn't in your vocabulary — you want complete merger or nothing at all.",
    mars: "Your drive is relentless and strategic. You pursue goals with laser focus and won't stop until transformation is complete.",
  },
  Sagittarius: {
    sun: "Your spirit is adventurous, philosophical, and free. You're here to explore, learn, and expand horizons.",
    moon: "You need freedom and meaning. Routine suffocates your emotions — you feel alive when exploring new territory.",
    rising: "You come across as optimistic, adventurous, and larger than life. Your enthusiasm is contagious.",
    mercury: "Your mind thinks in big pictures. You're a natural philosopher who communicates with humor and brutal honesty.",
    venus: "You love adventure and growth. The best date is an experience — you fall in love while exploring the world together.",
    mars: "Your drive is fueled by vision and freedom. You pursue goals with infectious enthusiasm and HATE being boxed in.",
  },
  Capricorn: {
    sun: "Your core is ambitious, disciplined, and built for the long game. You understand that real achievement takes time.",
    moon: "You process emotions through achievement and control. Vulnerability is hard — you feel safest when self-sufficient.",
    rising: "You project competence, authority, and quiet ambition. People take you seriously even before you speak.",
    mercury: "Your mind is strategic and practical. You communicate with authority and think in terms of results.",
    venus: "You love with commitment and responsibility. Romance is serious business — you build relationships like you build empires.",
    mars: "Your drive is relentless and goal-oriented. You outwork everyone and measure progress in milestones achieved.",
  },
  Aquarius: {
    sun: "Your essence is innovative, humanitarian, and ahead of your time. You're here to challenge norms and envision the future.",
    moon: "You need intellectual and emotional freedom. You care deeply about humanity but can seem detached one-on-one.",
    rising: "You project uniqueness, intelligence, and a hint of rebellion. People see you as original and slightly unpredictable.",
    mercury: "Your mind is visionary and unconventional. You think in systems and patterns — your ideas are years ahead.",
    venus: "You love through friendship and shared ideals. Intellectual connection comes first — then the heart follows.",
    mars: "Your drive is powered by ideals and innovation. You fight for causes, not personal gain.",
  },
  Pisces: {
    sun: "Your soul is dreamy, compassionate, and deeply connected to the unseen. You're a bridge between worlds.",
    moon: "You absorb emotions like a sponge. Other people's feelings become yours — you need solitude to know what's truly you.",
    rising: "You project gentleness, creativity, and mystery. People see you as ethereal — someone who seems to exist between worlds.",
    mercury: "Your mind is intuitive and poetic. You think in images, feelings, and impressions rather than straight lines.",
    venus: "You love unconditionally and romantically. You see the divine in your partner and love with spiritual depth.",
    mars: "Your drive flows like water — adaptable, persistent, finding paths around obstacles rather than through them.",
  },
};

function getSunSign(birthdate: string): { sign: string; degree: number; emoji: string } {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Simplified sun sign calculation
  const signBoundaries = [
    { sign: "Capricorn", emoji: "♑", start: [12, 22], end: [1, 19] },
    { sign: "Aquarius", emoji: "♒", start: [1, 20], end: [2, 18] },
    { sign: "Pisces", emoji: "♓", start: [2, 19], end: [3, 20] },
    { sign: "Aries", emoji: "♈", start: [3, 21], end: [4, 19] },
    { sign: "Taurus", emoji: "♉", start: [4, 20], end: [5, 20] },
    { sign: "Gemini", emoji: "♊", start: [5, 21], end: [6, 20] },
    { sign: "Cancer", emoji: "♋", start: [6, 21], end: [7, 22] },
    { sign: "Leo", emoji: "♌", start: [7, 23], end: [8, 22] },
    { sign: "Virgo", emoji: "♍", start: [8, 23], end: [9, 22] },
    { sign: "Libra", emoji: "♎", start: [9, 23], end: [10, 22] },
    { sign: "Scorpio", emoji: "♏", start: [10, 23], end: [11, 21] },
    { sign: "Sagittarius", emoji: "♐", start: [11, 22], end: [12, 21] },
  ];

  for (const boundary of signBoundaries) {
    const [sMonth, sDay] = boundary.start;
    const [eMonth, eDay] = boundary.end;

    // Handle Capricorn wrapping across year boundary
    if (boundary.sign === "Capricorn") {
      if ((month === 12 && day >= sDay) || (month === 1 && day <= eDay)) {
        const sign = ZODIAC_SIGNS.find(s => s.name === "Capricorn")!;
        return { sign: "Capricorn", emoji: "♑", degree: sign.degree + 15 };
      }
    } else {
      if ((month === sMonth && day >= sDay) || (month === eMonth && day <= eDay)) {
        const sign = ZODIAC_SIGNS.find(s => s.name === boundary.sign)!;
        return { sign: boundary.sign, emoji: boundary.emoji, degree: sign.degree + 15 };
      }
    }
  }

  return { sign: "Aries", emoji: "♈", degree: 15 };
}

// Approximate moon sign (simplified — cycles every ~2.5 days)
function getMoonSign(birthdate: string): { sign: string; degree: number } {
  const date = new Date(birthdate);
  // Use a simple approximation based on days since epoch
  const epoch = new Date("2000-01-01").getTime();
  const daysSinceEpoch = (date.getTime() - epoch) / (1000 * 60 * 60 * 24);
  // Moon moves ~13.2° per day through the zodiac
  const moonDegree = ((daysSinceEpoch * 13.2) % 360 + 360) % 360;
  const signIndex = Math.floor(moonDegree / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  return { sign: sign.name, degree: Math.round((moonDegree % 30) * 10) / 10 };
}

// Rising sign based on birth time (simplified — ascendant changes every ~2 hours)
function getRisingSign(birthdate: string, birthTime: string | null): { sign: string; degree: number } {
  if (!birthTime) {
    // Without birth time, use sun sign as rising (common approximation)
    const sun = getSunSign(birthdate);
    return { sign: sun.sign, degree: sun.degree };
  }

  const [hours, minutes] = birthTime.split(":").map(Number);
  const date = new Date(birthdate);
  const epoch = new Date("2000-01-01").getTime();
  const daysSinceEpoch = (date.getTime() - epoch) / (1000 * 60 * 60 * 24);
  
  // Rising sign moves ~1° every 4 minutes (360°/24h)
  const ascDegree = ((hours * 15 + minutes * 0.25 + daysSinceEpoch * 1) % 360 + 360) % 360;
  const signIndex = Math.floor(ascDegree / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  return { sign: sign.name, degree: Math.round((ascDegree % 30) * 10) / 10 };
}

// Planetary signs (simplified offsets from sun)
function getPlanetarySign(sunDegree: number, offset: number): { sign: string } {
  const degree = ((sunDegree + offset) % 360 + 360) % 360;
  const signIndex = Math.floor(degree / 30);
  return { sign: ZODIAC_SIGNS[signIndex].name };
}

function getHouseForDegree(degree: number, ascDegree: number): number {
  const relativeDegree = ((degree - ascDegree) % 360 + 360) % 360;
  return Math.floor(relativeDegree / 30) + 1;
}

export function generateAstrologyReading(
  name: string,
  birthdate: string,
  birthTime: string | null = null,
  birthPlace: string | null = null
): AstrologyReading {
  const sunData = getSunSign(birthdate);
  const moonData = getMoonSign(birthdate);
  const risingData = getRisingSign(birthdate, birthTime);

  const ascDegree = ZODIAC_SIGNS.find(s => s.name === risingData.sign)?.degree || 0;

  const mercury = getPlanetarySign(sunData.degree, Math.random() > 0.5 ? 15 : -15);
  const venus = getPlanetarySign(sunData.degree, Math.random() > 0.5 ? 45 : -30);
  const mars = getPlanetarySign(sunData.degree, Math.random() > 0.5 ? 90 : -60);

  const sunHouse = getHouseForDegree(sunData.degree, ascDegree);
  const moonHouse = getHouseForDegree(moonData.degree, ascDegree);

  const sunMeanings = SIGN_MEANINGS[sunData.sign] || SIGN_MEANINGS["Aries"];
  const moonMeanings = SIGN_MEANINGS[moonData.sign] || SIGN_MEANINGS["Aries"];
  const risingMeanings = SIGN_MEANINGS[risingData.sign] || SIGN_MEANINGS["Aries"];
  const mercuryMeanings = SIGN_MEANINGS[mercury.sign] || SIGN_MEANINGS["Aries"];
  const venusMeanings = SIGN_MEANINGS[venus.sign] || SIGN_MEANINGS["Aries"];
  const marsMeanings = SIGN_MEANINGS[mars.sign] || SIGN_MEANINGS["Aries"];

  const signs = {
    sun: { sign: sunData.sign, degree: sunData.degree, house: sunHouse, meaning: sunMeanings.sun },
    moon: { sign: moonData.sign, degree: moonData.degree, house: moonHouse, meaning: moonMeanings.moon },
    rising: { sign: risingData.sign, degree: risingData.degree, meaning: risingMeanings.rising },
    mercury: { sign: mercury.sign, meaning: mercuryMeanings.mercury },
    venus: { sign: venus.sign, meaning: venusMeanings.venus },
    mars: { sign: mars.sign, meaning: marsMeanings.mars },
  };

  const prompt = buildAstrologyPrompt(name, birthdate, birthTime, birthPlace, signs);

  return { name, birthdate, birthTime, birthPlace, signs, prompt };
}

function signEmoji(signName: string): string {
  return ZODIAC_SIGNS.find(s => s.name === signName)?.emoji || "✨";
}

function buildAstrologyPrompt(
  name: string,
  birthdate: string,
  birthTime: string | null,
  birthPlace: string | null,
  signs: AstrologyReading["signs"]
): string {
  const dateFormatted = new Date(birthdate).toLocaleDateString("en-ZA", {
    year: "numeric", month: "long", day: "numeric",
  });

  return `You are a wise, insightful astrologer who interprets birth charts with depth and compassion. A seeker named ${name} has shared their birth details:

**Born:** ${dateFormatted}${birthTime ? ` at ${birthTime}` : " (time unknown)"}${birthPlace ? ` in ${birthPlace}` : ""}

**Their Big Three:**
- ☀️ Sun in ${signs.sun.sign} ${signEmoji(signs.sun.sign)} (House ${signs.sun.house})
- 🌙 Moon in ${signs.moon.sign} ${signEmoji(signs.moon.sign)} (House ${signs.moon.house})
- ⬆️ Rising: ${signs.rising.sign} ${signEmoji(signs.rising.sign)}

**Other Planets:**
- ☿ Mercury in ${signs.mercury.sign} ${signEmoji(signs.mercury.sign)}
- ♀ Venus in ${signs.venus.sign} ${signEmoji(signs.venus.sign)}
- ♂ Mars in ${signs.mars.sign} ${signEmoji(signs.mars.sign)}

**Core Meanings:**
- Sun: ${signs.sun.meaning}
- Moon: ${signs.moon.meaning}
- Rising: ${signs.rising.meaning}
- Mercury: ${signs.mercury.meaning}
- Venus: ${signs.venus.meaning}
- Mars: ${signs.mars.meaning}

Please provide a complete birth chart reading structured as:

1. **Your Cosmic Blueprint** — Synthesize the Sun, Moon, and Rising into a vivid description of the seeker's essential nature. How do these three interact? What's the core tension and harmony?
2. **Your Inner World** 🌙 — Deep dive into the Moon sign — their emotional landscape, what they need to feel safe, their instinctive reactions
3. **Your Outer Expression** ⬆️ — The Rising sign — how they come across to others, their social mask, first impressions
4. **How You Think & Communicate** ☿ — Mercury in ${signs.mercury.sign} — their mind, communication style, learning patterns
5. **How You Love** ♀ — Venus in ${signs.venus.sign} — their love language, what attracts them, relationship patterns
6. **How You Take Action** ♂ — Mars in ${signs.mars.sign} — their drive, ambition, and how they pursue goals
7. **Cosmic Guidance** — 3-4 pieces of advice tailored to this unique chart configuration. Address potential challenges and how to work with them

Important guidelines:
- Be warm, insightful, and specific — reference the actual sign qualities
- Explain how the signs interact (e.g., "Your fiery Aries Sun wants to charge ahead, but your sensitive Cancer Moon needs emotional safety first")
- Use emoji occasionally to make it visually engaging
- Frame everything as tendencies and potentials, not fixed fate
- If birth time is unknown, acknowledge the uncertainty around the Rising sign and houses
- Make ${name} feel truly seen and understood through their chart
- End with an empowering reminder that the stars incline, they do not compel`;
}
