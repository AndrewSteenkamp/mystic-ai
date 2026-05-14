// ============================================================
// MYSTIC AI — SAFETY DETECTION ENGINE
// Catches scams, harassment, and dangerous behavior in real-time
// ============================================================

// ── Patterns ──

const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,6}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_REGEX = /(https?:\/\/|www\.)[^\s<]+|t\.me\/|wa\.me\/|discord\.gg\/|snapchat\.com\/add\//gi;
const WHATSAPP_REGEX = /whatsapp|whats app|watsapp/i;
const TELEGRAM_REGEX = /telegram|t\.me/i;
const SNAPCHAT_REGEX = /snapchat|snap chat/i;
const OFF_PLATFORM_PUSHES = [
  /let'?s (move|go|talk|chat|switch) (to|over to)/i,
  /add me on/i,
  /find me on/i,
  /message me on/i,
  /text me/i,
  /dm me/i,
  /here'?s my (number|whatsapp|snap|ig|insta)/i,
];

// ── Financial Scam Keywords ──

const FINANCIAL_KEYWORDS = [
  "money", "invest", "investment", "crypto", "bitcoin", "btc", "eth",
  "gift card", "giftcard", "wire transfer", "western union", "moneygram",
  "paypal", "venmo", "cashapp", "help me out", "need help", "struggling",
  "emergency", "urgent", "hospital bill", "medical bill", "surgery",
  "plane ticket", "visa fee", "stranded", "stuck abroad", "oil rig",
  "deployed", "military deployment", "inheritance", "gold bars",
  "forex", "trading", "get rich", "double your", "guaranteed return",
  "send me", "lend me", "borrow", "loan",
];

const LOVEBOMB_PATTERNS = [
  /i love you/i,
  /you'?re my soulmate/i,
  /meant to be together/i,
  /marry me/i,
  /never felt this way/i,
  /you'?re the one/i,
  /twin flame/i,
  /divine counterpart/i,
  /perfect match/i,
  /can'?t live without/i,
  /my everything/i,
];

const EXPLICIT_PATTERNS = [
  /nudes?/i, /sexy pic/i, /dick pic/i, /send (me )?(nudes?|pics?)/i,
  /what are you wearing/i, /send (me )?a photo/i, /cam\??/i,
];

// ── Detection Engine ──

export interface SafetyResult {
  safe: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  flags: SafetyFlag[];
  message: string; // safe replacement text or warning
}

export interface SafetyFlag {
  type: "scam" | "off_platform" | "lovebomb" | "explicit" | "financial" | "contact_info";
  reason: string;
  severity: "warn" | "block" | "redact";
  matched: string;
}

export function scanMessage(text: string, conversationContext?: {
  messageCount: number;
  hoursSinceFirstMessage: number;
  userHasProfile: boolean;
}): SafetyResult {
  const flags: SafetyFlag[] = [];

  // 1. Phone numbers
  const phones = text.match(PHONE_REGEX);
  if (phones) {
    for (const p of phones) {
      if (p.replace(/[^0-9]/g, "").length >= 7) {
        flags.push({ type: "contact_info", reason: "Phone number detected", severity: "redact", matched: p });
      }
    }
  }

  // 2. Email addresses
  const emails = text.match(EMAIL_REGEX);
  if (emails) {
    for (const e of emails) {
      flags.push({ type: "contact_info", reason: "Email address detected", severity: "redact", matched: e });
    }
  }

  // 3. External links
  const urls = text.match(URL_REGEX);
  if (urls) {
    for (const u of urls) {
      flags.push({ type: "off_platform", reason: "External link detected", severity: "redact", matched: u });
    }
  }

  // 4. WhatsApp / Telegram / Snapchat references
  if (WHATSAPP_REGEX.test(text)) {
    flags.push({ type: "off_platform", reason: "WhatsApp reference", severity: "warn", matched: "WhatsApp" });
  }
  if (TELEGRAM_REGEX.test(text)) {
    flags.push({ type: "off_platform", reason: "Telegram reference", severity: "warn", matched: "Telegram" });
  }
  if (SNAPCHAT_REGEX.test(text)) {
    flags.push({ type: "off_platform", reason: "Snapchat reference", severity: "warn", matched: "Snapchat" });
  }

  // 5. Off-platform push phrases
  for (const pattern of OFF_PLATFORM_PUSHES) {
    const match = text.match(pattern);
    if (match) {
      flags.push({ type: "off_platform", reason: "Push to move off-platform", severity: "warn", matched: match[0] });
      break;
    }
  }

  // 6. Financial scam keywords
  if (conversationContext && conversationContext.messageCount < 20) {
    const lower = text.toLowerCase();
    for (const keyword of FINANCIAL_KEYWORDS) {
      if (lower.includes(keyword)) {
        flags.push({
          type: "financial",
          reason: `Financial keyword detected early in conversation: "${keyword}"`,
          severity: "block",
          matched: keyword,
        });
        break;
      }
    }
  }

  // 7. Love-bombing detection (only flag if happens VERY early)
  if (conversationContext && conversationContext.hoursSinceFirstMessage < 48) {
    for (const pattern of LOVEBOMB_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        flags.push({
          type: "lovebomb",
          reason: `Intense romantic language detected within 48 hours of first contact`,
          severity: "warn",
          matched: match[0],
        });
        break;
      }
    }
  }

  // 8. Explicit content
  for (const pattern of EXPLICIT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      flags.push({
        type: "explicit",
        reason: "Sexually explicit request detected",
        severity: "block",
        matched: match[0],
      });
      break;
    }
  }

  // ── Determine overall risk ──
  const hasBlock = flags.some(f => f.severity === "block");
  const hasRedact = flags.some(f => f.severity === "redact");
  const hasWarn = flags.some(f => f.severity === "warn");

  let riskLevel: SafetyResult["riskLevel"] = "low";
  if (hasBlock) riskLevel = "critical";
  else if (flags.length >= 3) riskLevel = "high";
  else if (hasRedact || flags.length >= 2) riskLevel = "medium";
  else if (hasWarn) riskLevel = "low";

  // ── Sanitize message ──
  let safeText = text;
  for (const flag of flags) {
    if (flag.severity === "redact") {
      safeText = safeText.replace(flag.matched, "[redacted]");
    }
  }

  return {
    safe: riskLevel !== "critical",
    riskLevel,
    flags,
    message: safeText,
  };
}

// ── Profile Safety Check ──

export interface ProfileSafetyCheck {
  passed: boolean;
  completionPercent: number;
  missingFields: string[];
  requirements: { field: string; status: "ok" | "missing" }[];
}

export function checkProfileCompletion(profile: {
  bio?: string;
  interests?: string;
  birthdate?: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: string;
  seeking?: string;
}): ProfileSafetyCheck {
  const requirements = [
    { field: "Bio (min 30 chars)", status: (profile.bio?.length || 0) >= 30 ? "ok" as const : "missing" as const },
    { field: "Interests (min 2)", status: (profile.interests?.split(",").filter(Boolean).length || 0) >= 2 ? "ok" as const : "missing" as const },
    { field: "Birth date", status: profile.birthdate ? "ok" as const : "missing" as const },
    { field: "Birth time", status: profile.birthTime ? "ok" as const : "missing" as const },
    { field: "Birth place", status: profile.birthPlace ? "ok" as const : "missing" as const },
    { field: "Gender", status: profile.gender ? "ok" as const : "missing" as const },
    { field: "Seeking", status: profile.seeking ? "ok" as const : "missing" as const },
  ];

  const completed = requirements.filter(r => r.status === "ok").length;
  const completionPercent = Math.round((completed / requirements.length) * 100);
  const missingFields = requirements.filter(r => r.status === "missing").map(r => r.field);

  return {
    passed: completionPercent >= 80,
    completionPercent,
    missingFields,
    requirements,
  };
}

// ── Astrological Compatibility Warning ──

export interface CompatibilityWarning {
  type: "high" | "caution" | "challenging";
  message: string;
  details: string;
}

export function checkAstroCompatibility(
  user1: { sunSign: string; moonSign: string },
  user2: { sunSign: string; moonSign: string }
): CompatibilityWarning | null {
  // Fire + Air = compatible, Earth + Water = compatible
  // Fire + Water = challenging, Air + Earth = challenging
  const elements: Record<string, string> = {
    aries: "fire", leo: "fire", sagittarius: "fire",
    taurus: "earth", virgo: "earth", capricorn: "earth",
    gemini: "air", libra: "air", aquarius: "air",
    cancer: "water", scorpio: "water", pisces: "water",
  };

  const e1 = elements[user1.sunSign.toLowerCase()];
  const e2 = elements[user2.sunSign.toLowerCase()];

  const challenging: [string, string][] = [
    ["fire", "water"], ["water", "fire"],
    ["air", "earth"], ["earth", "air"],
  ];

  const isChallenging = challenging.some(([a, b]) => e1 === a && e2 === b);

  if (isChallenging) {
    return {
      type: "challenging",
      message: `${user1.sunSign} (${e1}) + ${user2.sunSign} (${e2}) — naturally different energies`,
      details: "This combination can create powerful growth, but requires extra patience and understanding. Don't let cosmic differences stop you — awareness is the first step to harmony.",
    };
  }

  // Same element = high compatibility
  if (e1 === e2) {
    return {
      type: "high",
      message: `${user1.sunSign} + ${user2.sunSign} — harmonious elemental match`,
      details: "You share the same elemental energy. Communication flows naturally and you understand each other's core drives.",
    };
  }

  return null;
}
