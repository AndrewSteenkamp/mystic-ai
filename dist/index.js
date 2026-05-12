import { createRequire } from 'module'; const require = createRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db.ts
var db_exports = {};
__export(db_exports, {
  countTodayReadings: () => countTodayReadings,
  ensureDummyUser: () => ensureDummyUser,
  getCompatibleProfiles: () => getCompatibleProfiles,
  getDatingProfile: () => getDatingProfile,
  getDb: () => getDb,
  getReadingCredits: () => getReadingCredits,
  getUserReadings: () => getUserReadings,
  getUserSubscription: () => getUserSubscription,
  incrementReadingCredits: () => incrementReadingCredits,
  insertSampleProfiles: () => insertSampleProfiles,
  saveDatingProfile: () => saveDatingProfile,
  saveDivinationReading: () => saveDivinationReading,
  saveUserSubscription: () => saveUserSubscription,
  setProfileActive: () => setProfileActive
});
import path from "path";
import { fileURLToPath } from "url";
function loadDatabase() {
  if (_dbTried) return;
  _dbTried = true;
  try {
    const SQLite = __require("better-sqlite3");
    _db = new SQLite(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  } catch (e) {
    console.warn("better-sqlite3 not available:", e);
    _db = null;
  }
}
function getDb() {
  loadDatabase();
  return _db;
}
function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      open_id TEXT UNIQUE NOT NULL,
      email TEXT,
      name TEXT,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'tarot',
      query TEXT NOT NULL,
      result TEXT,
      interpretation TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      start_date TEXT,
      end_date TEXT,
      paystack_reference TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reading_credits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      credits INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS dating_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      bio TEXT,
      gender TEXT,
      seeking TEXT,
      interests TEXT,
      birthdate TEXT NOT NULL,
      birth_time TEXT,
      birth_place TEXT,
      sun_sign TEXT,
      moon_sign TEXT,
      rising_sign TEXT,
      sun_house INTEGER,
      moon_house INTEGER,
      mercury_sign TEXT,
      venus_sign TEXT,
      mars_sign TEXT,
      life_path INTEGER,
      expression INTEGER,
      soul_urge INTEGER,
      personality INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}
function ensureDummyUser() {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE open_id = ?").get("mystic-local-user");
  if (!existing) {
    db.prepare("INSERT INTO users (open_id, email, name, role) VALUES (?, ?, ?, ?)").run("mystic-local-user", "seeker@mystic.ai", "Mystic Seeker", "admin");
  }
}
function saveDivinationReading(record) {
  const db = getDb();
  db.prepare(
    "INSERT INTO readings (user_id, type, query, result, interpretation) VALUES (?, ?, ?, ?, ?)"
  ).run(record.userId, record.type, record.query, record.result, record.interpretation);
}
function getUserReadings(userId) {
  const db = getDb();
  return db.prepare(
    "SELECT id, type, query, result, interpretation, created_at as createdAt FROM readings WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
  ).all(userId);
}
function countTodayReadings(userId) {
  const db = getDb();
  const row = db.prepare(
    "SELECT COUNT(*) as count FROM readings WHERE user_id = ? AND date(created_at) = date('now')"
  ).get(userId);
  return row?.count || 0;
}
function saveUserSubscription(record) {
  const db = getDb();
  db.prepare(
    "INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, paystack_reference) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    record.userId,
    record.planId,
    record.status,
    record.startDate.toISOString(),
    record.endDate.toISOString(),
    record.paystackReference || null
  );
}
function getUserSubscription(userId) {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
  ).get(userId);
}
function incrementReadingCredits(userId) {
  const db = getDb();
  db.prepare(
    "INSERT INTO reading_credits (user_id, credits) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET credits = credits + 1"
  ).run(userId);
}
function getReadingCredits(userId) {
  const db = getDb();
  const row = db.prepare(
    "SELECT credits FROM reading_credits WHERE user_id = ?"
  ).get(userId);
  return row?.credits || 0;
}
function saveDatingProfile(profile) {
  const db = getDb();
  db.prepare(`
    INSERT INTO dating_profiles (user_id, bio, gender, seeking, interests, birthdate, birth_time, birth_place,
      sun_sign, moon_sign, rising_sign, sun_house, moon_house, mercury_sign, venus_sign, mars_sign,
      life_path, expression, soul_urge, personality)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      bio=excluded.bio, gender=excluded.gender, seeking=excluded.seeking,
      interests=excluded.interests, updated_at=datetime('now')
  `).run(
    profile.userId,
    profile.bio,
    profile.gender,
    profile.seeking,
    profile.interests,
    profile.birthdate,
    profile.birthTime,
    profile.birthPlace,
    profile.sunSign,
    profile.moonSign,
    profile.risingSign,
    profile.sunHouse,
    profile.moonHouse,
    profile.mercurySign,
    profile.venusSign,
    profile.marsSign,
    profile.lifePath,
    profile.expression,
    profile.soulUrge,
    profile.personality
  );
}
function getDatingProfile(userId) {
  const db = getDb();
  return db.prepare("SELECT * FROM dating_profiles WHERE user_id = ?").get(userId);
}
function getCompatibleProfiles(currentUserId, limit = 20) {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM dating_profiles WHERE user_id != ? AND is_active = 1 ORDER BY created_at DESC LIMIT ?"
  ).all(currentUserId, limit);
}
function setProfileActive(userId, active) {
  const db = getDb();
  db.prepare("UPDATE dating_profiles SET is_active = ?, updated_at = datetime('now') WHERE user_id = ?").run(active ? 1 : 0, userId);
}
function insertSampleProfiles() {
  const db = getDb();
  const existing = db.prepare("SELECT COUNT(*) as c FROM dating_profiles").get();
  if (existing.c > 0) return;
  const samples = [
    { name: "Luna", bio: "Artist & free spirit. Love sunsets, coffee, and deep conversations.", gender: "female", seeking: "male", interests: "art,music,spirituality,travel", birthdate: "2000-03-14", birthTime: "08:30", birthPlace: "Cape Town", lifePath: 3, expression: 7, soulUrge: 9, personality: 5, sun: "Pisces", moon: "Taurus", rising: "Gemini", sunH: 12, moonH: 2, mercury: "Aquarius", venus: "Aries", mars: "Cancer" },
    { name: "Zara", bio: "Yoga instructor finding balance in chaos. Plant mom \u{1F33F}", gender: "female", seeking: "male", interests: "yoga,wellness,nature,books", birthdate: "1997-09-22", birthTime: "16:45", birthPlace: "Durban", lifePath: 6, expression: 4, soulUrge: 2, personality: 8, sun: "Virgo", moon: "Scorpio", rising: "Capricorn", sunH: 10, moonH: 1, mercury: "Libra", venus: "Leo", mars: "Virgo" },
    { name: "Aria", bio: "Tech entrepreneur by day, stargazer by night. Looking for someone who can keep up.", gender: "female", seeking: "male", interests: "tech,astronomy,hiking,cooking", birthdate: "1995-11-08", birthTime: "22:15", birthPlace: "Johannesburg", lifePath: 8, expression: 1, soulUrge: 5, personality: 3, sun: "Scorpio", moon: "Leo", rising: "Sagittarius", sunH: 8, moonH: 5, mercury: "Scorpio", venus: "Capricorn", mars: "Aries" },
    { name: "Nadia", bio: "Bookstore owner \u{1F4DA} Cat lover. Looking for my plot twist.", gender: "female", seeking: "male", interests: "literature,cats,food,photography", birthdate: "1999-06-28", birthTime: "07:00", birthPlace: "Pretoria", lifePath: 4, expression: 2, soulUrge: 6, personality: 7, sun: "Cancer", moon: "Pisces", rising: "Virgo", sunH: 4, moonH: 9, mercury: "Gemini", venus: "Taurus", mars: "Libra" },
    { name: "Kai", bio: "Surfer & marine biologist \u{1F30A}. Ocean heals everything.", gender: "male", seeking: "female", interests: "surfing,ocean,science,fitness", birthdate: "1996-02-19", birthTime: "14:20", birthPlace: "Port Elizabeth", lifePath: 5, expression: 9, soulUrge: 1, personality: 6, sun: "Aquarius", moon: "Gemini", rising: "Leo", sunH: 11, moonH: 3, mercury: "Aquarius", venus: "Pisces", mars: "Sagittarius" },
    { name: "Sage", bio: "Music producer \u{1F3B5} Good vibes only. Swipe right for deep talks & vinyl nights.", gender: "male", seeking: "female", interests: "music,vinyl,meditation,travel", birthdate: "1998-04-03", birthTime: "19:45", birthPlace: "Cape Town", lifePath: 11, expression: 5, soulUrge: 8, personality: 2, sun: "Aries", moon: "Libra", rising: "Cancer", sunH: 1, moonH: 7, mercury: "Pisces", venus: "Aries", mars: "Leo" },
    { name: "Raven", bio: "Psychologist who believes in magic. Deep thinker, soft heart.", gender: "female", seeking: "male", interests: "psychology,tarot,poetry,tea", birthdate: "2001-12-05", birthTime: "11:11", birthPlace: "Stellenbosch", lifePath: 7, expression: 33, soulUrge: 4, personality: 11, sun: "Sagittarius", moon: "Aquarius", rising: "Scorpio", sunH: 9, moonH: 3, mercury: "Scorpio", venus: "Capricorn", mars: "Virgo" }
  ];
  const insert = db.prepare(`
    INSERT OR IGNORE INTO users (open_id, email, name, role) VALUES (?, ?, ?, 'user')
  `);
  const getUserId = db.prepare("SELECT id FROM users WHERE open_id = ?");
  const insertProfile = db.prepare(`
    INSERT OR IGNORE INTO dating_profiles (user_id, bio, gender, seeking, interests, birthdate, birth_time, birth_place,
      sun_sign, moon_sign, rising_sign, sun_house, moon_house, mercury_sign, venus_sign, mars_sign,
      life_path, expression, soul_urge, personality)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of samples) {
    const openId = `sample-${s.name.toLowerCase()}`;
    insert.run(openId, `${s.name.toLowerCase()}@sample.mystic.ai`, s.name);
    const user = getUserId.get(openId);
    if (user) {
      insertProfile.run(
        user.id,
        s.bio,
        s.gender,
        s.seeking,
        s.interests,
        s.birthdate,
        s.birthTime,
        s.birthPlace,
        s.sun,
        s.moon,
        s.rising,
        s.sunH,
        s.moonH,
        s.mercury,
        s.venus,
        s.mars,
        s.lifePath,
        s.expression,
        s.soulUrge,
        s.personality
      );
    }
  }
  console.log(`[DB] Inserted ${samples.length} sample dating profiles`);
}
var __dirname, DB_PATH, _db, _dbTried;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    __dirname = path.dirname(fileURLToPath(import.meta.url));
    DB_PATH = path.resolve(__dirname, "..", "mystic.db");
    _db = null;
    _dbTried = false;
  }
});

// vite.config.ts
var vite_config_exports = {};
__export(vite_config_exports, {
  default: () => vite_config_default
});
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path2 from "node:path";
import { defineConfig } from "vite";
var vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    vite_config_default = defineConfig({
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          "@": path2.resolve(import.meta.dirname, "client", "src"),
          "@shared": path2.resolve(import.meta.dirname, "shared")
        }
      },
      root: path2.resolve(import.meta.dirname, "client"),
      publicDir: path2.resolve(import.meta.dirname, "client", "public"),
      build: {
        outDir: path2.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true
      },
      server: {
        host: true,
        allowedHosts: ["localhost", "127.0.0.1"]
      }
    });
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routers.ts
import { z } from "zod";

// shared/const.ts
var COOKIE_NAME = "mystic_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/routers.ts
init_db();

// server/paystack.ts
import crypto from "node:crypto";
var TEST_SECRET = "sk_test_c700fbcca87790b2951d0b343b4f88564ef7105f";
var TEST_PUBLIC = "pk_test_2c5306b2e15d20f1b6d24627cdb070ed4df4f9d7";
var LIVE_SECRET = "sk_live_321a1dae031d7cf087dfb0e4f2f806c6a22cc148";
var LIVE_PUBLIC = "pk_live_cb358fef56c2bdcbabbd9af1ec77f7d632c163d2";
var PAYSTACK_BASE = "https://api.paystack.co";
function getConfig() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    secretKey: isProduction ? LIVE_SECRET : TEST_SECRET,
    publicKey: isProduction ? LIVE_PUBLIC : TEST_PUBLIC
  };
}
var PaystackError = class extends Error {
  constructor(message, statusCode, paystackMessage) {
    super(message);
    this.statusCode = statusCode;
    this.paystackMessage = paystackMessage;
    this.name = "PaystackError";
  }
};
async function paystackFetch(path4, options = {}) {
  const { secretKey } = getConfig();
  const url = `${PAYSTACK_BASE}${path4}`;
  const headers = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
    ...options.headers ?? {}
  };
  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new PaystackError(
      `Network error reaching Paystack: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  const bodyText = await response.text();
  let body;
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      throw new PaystackError(
        `Invalid JSON response from Paystack (HTTP ${response.status})`,
        response.status
      );
    }
  } else {
    body = { status: true, message: "OK", data: null };
  }
  if (!response.ok || !body.status) {
    throw new PaystackError(
      body.message || `Paystack API returned HTTP ${response.status}`,
      response.status,
      body.message
    );
  }
  return body.data;
}
async function initializePaystackTransaction(amount, email, callbackUrl, metadata) {
  const payload = {
    amount: Math.round(amount),
    // ensure integer cents
    email
  };
  if (callbackUrl) {
    payload.callback_url = callbackUrl;
  }
  if (metadata) {
    payload.metadata = metadata;
  }
  return paystackFetch("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function verifyPaystackTransaction(reference) {
  return paystackFetch(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    { method: "GET" }
  );
}
function validatePaystackWebhookSignature(rawBody, signature) {
  const { secretKey } = getConfig();
  const computed = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(computed, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
}
async function handlePaystackWebhook(rawBody, signature) {
  if (!validatePaystackWebhookSignature(rawBody, signature)) {
    return {
      acknowledged: false,
      event: "charge.success",
      // placeholder
      action: "error",
      message: "Invalid webhook signature"
    };
  }
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return {
      acknowledged: false,
      event: "charge.success",
      action: "error",
      message: "Failed to parse webhook body as JSON"
    };
  }
  const eventType = event.event;
  const reference = event.data?.reference ?? void 0;
  switch (eventType) {
    case "charge.success": {
      return {
        acknowledged: true,
        event: eventType,
        reference,
        action: "processed",
        message: `Payment ${reference} succeeded`
      };
    }
    case "subscription.create": {
      return {
        acknowledged: true,
        event: eventType,
        reference,
        action: "processed",
        message: `Subscription created for ${reference}`
      };
    }
    case "subscription.disable": {
      return {
        acknowledged: true,
        event: eventType,
        reference,
        action: "processed",
        message: `Subscription disabled for ${reference}`
      };
    }
    default: {
      return {
        acknowledged: true,
        event: eventType,
        reference,
        action: "ignored",
        message: `Event type '${eventType}' acknowledged but not processed`
      };
    }
  }
}
var MYSTIC_PLANS = {
  /** Single fortune reading — R29.00 */
  singleReading: { amount: 2900, description: "Single fortune reading" },
  /** Monthly subscription — R99.00 */
  monthlySubscription: {
    amount: 9900,
    interval: "monthly",
    name: "Mystic Monthly",
    description: "Unlimited fortune readings \u2014 monthly"
  },
  /** Annual subscription — R799.00 */
  annualSubscription: {
    amount: 79900,
    interval: "annually",
    name: "Mystic Annual",
    description: "Unlimited fortune readings \u2014 annual (save 33%)"
  }
};

// server/divination/tarot.ts
var MAJOR_ARCANA = [
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
  { id: 21, name: "The World", keywords: ["completion", "achievement", "fulfillment"], meaning: { upright: "Completion, integration, accomplishment, travel", reversed: "Incompletion, no closure, lack of achievement" }, arcana: "major" }
];
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function drawTarotCards(count = 3) {
  const shuffled = shuffle(MAJOR_ARCANA);
  return shuffled.slice(0, count).map((card) => ({
    card,
    reversed: Math.random() > 0.5
  }));
}
function generateTarotReading(question, spreadType = "three") {
  const positions = ["past", "present", "future"];
  const drawn = drawTarotCards(spreadType === "single" ? 1 : 3);
  const cards = positions.slice(0, drawn.length).map((position, i) => ({
    position,
    card: drawn[i].card,
    reversed: drawn[i].reversed
  }));
  let prompt = buildTarotPrompt(question, cards, spreadType);
  return {
    cards,
    spreadName: spreadType === "single" ? "Single Card" : spreadType === "three" ? "Three Card Spread" : "Celtic Cross",
    prompt
  };
}
function buildTarotPrompt(question, cards, spreadType) {
  const cardDescriptions = cards.map((c) => {
    const orientation = c.reversed ? "Reversed" : "Upright";
    const meaning = c.reversed ? c.card.meaning.reversed : c.card.meaning.upright;
    return `- ${c.position.toUpperCase()}: ${c.card.name} (${orientation}) \u2014 ${meaning}`;
  }).join("\n");
  return `You are a wise, compassionate tarot reader. A seeker has come to you with this question: "${question}"

You drew a ${spreadType === "single" ? "single card" : "three-card Past/Present/Future spread"}:

${cardDescriptions}

Please provide a thoughtful, personalized reading. Structure your response as:

1. **The Cards** \u2014 Briefly describe what each card represents in this position
2. **The Story** \u2014 Weave the cards together into a coherent narrative that answers the seeker's question
3. **The Guidance** \u2014 Offer 2-3 specific, actionable pieces of advice based on the reading
4. **Reflection** \u2014 A gentle closing thought

Important guidelines:
- Be warm, kind, and never frightening \u2014 even challenging cards bring growth
- Frame all interpretations as possibilities, not absolute predictions
- Emphasize that the seeker always has free will and agency
- Use mystical but accessible language \u2014 poetic without being obscure
- Reference the actual card names and meanings in your interpretation
- Keep the tone hopeful and empowering, even when the cards suggest challenges`;
}

// server/divination/numerology.ts
var NUMBER_MEANINGS = {
  1: "The Leader \u2014 Independent, ambitious, pioneering. You are a natural-born leader with strong drive and determination. Your path involves learning to stand on your own and initiate new beginnings.",
  2: "The Diplomat \u2014 Cooperative, sensitive, balanced. You thrive in partnerships and have a gift for bringing harmony to situations. Your path involves learning patience and diplomacy.",
  3: "The Communicator \u2014 Creative, expressive, social. You bring joy and inspiration through self-expression. Your path involves using your creative gifts to uplift others.",
  4: "The Builder \u2014 Practical, disciplined, reliable. You create lasting foundations through hard work and dedication. Your path involves building something of enduring value.",
  5: "The Adventurer \u2014 Freedom-loving, adaptable, progressive. You crave variety and new experiences. Your path involves embracing change and inspiring others to live fully.",
  6: "The Nurturer \u2014 Responsible, compassionate, protective. You find fulfillment in serving and caring for others. Your path involves balancing service with self-care.",
  7: "The Seeker \u2014 Analytical, spiritual, introspective. You are drawn to life's deeper questions and mysteries. Your path involves trusting your inner wisdom.",
  8: "The Achiever \u2014 Ambitious, authoritative, successful. You are driven to achieve material and professional success. Your path involves using power ethically and wisely.",
  9: "The Humanitarian \u2014 Compassionate, wise, selfless. You feel a deep calling to serve humanity. Your path involves letting go and embracing universal love.",
  11: "The Inspired Healer (Master Number) \u2014 Highly intuitive, sensitive, and spiritually aware. You are here to uplift humanity through spiritual insight and creative inspiration. This is a master number of great potential \u2014 and great responsibility.",
  22: "The Master Builder (Master Number) \u2014 Visionary, practical, transformative. You have the rare ability to turn grand visions into reality. This master number gives you the power to build something that changes the world.",
  33: "The Master Teacher (Master Number) \u2014 Compassionate, selfless, enlightened. You are a natural teacher and healer whose presence alone uplifts others. This is the rarest master number \u2014 the path of the spiritual master."
};
function reduceToSingleDigit(num) {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num).split("").reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}
function letterToNumber(letter) {
  const upper = letter.toUpperCase();
  const charCode = upper.charCodeAt(0) - 64;
  if (charCode < 1 || charCode > 26) return 0;
  return charCode;
}
function nameToNumber(name) {
  const sum = name.replace(/[^A-Za-z]/g, "").split("").map(letterToNumber).reduce((s, n) => s + n, 0);
  return reduceToSingleDigit(sum);
}
function calculateLifePath(birthdate) {
  const digits = birthdate.replace(/-/g, "").split("").map(Number);
  const sum = digits.reduce((s, d) => s + d, 0);
  return reduceToSingleDigit(sum);
}
function calculateExpression(name) {
  return nameToNumber(name);
}
function calculateSoulUrge(name) {
  const vowels = name.replace(/[^AEIOUaeiou]/g, "");
  if (vowels.length === 0) return 0;
  return nameToNumber(vowels);
}
function calculatePersonality(name) {
  const consonants = name.replace(/[AEIOUaeiou\s]/gi, "");
  if (consonants.length === 0) return 0;
  return nameToNumber(consonants);
}
function calculateBirthday(birthdate) {
  const day = parseInt(birthdate.split("-")[2]);
  return reduceToSingleDigit(day);
}
function generateNumerologyReading(name, birthdate) {
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
    birthday: { value: birthday, meaning: NUMBER_MEANINGS[birthday] || NUMBER_MEANINGS[1] }
  };
  const prompt = buildNumerologyPrompt(name, birthdate, numbers);
  return {
    name,
    birthdate,
    numbers,
    prompt
  };
}
function buildNumerologyPrompt(name, birthdate, numbers) {
  const dateFormatted = new Date(birthdate).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return `You are a gifted numerologist with deep insight into the Pythagorean system. A seeker has shared their details:

**Name:** ${name}
**Birthdate:** ${dateFormatted}

Their core numbers are:
- **Life Path Number: ${numbers.lifePath.value}** \u2014 ${numbers.lifePath.meaning}
- **Expression Number: ${numbers.expression.value}** \u2014 ${numbers.expression.meaning}
- **Soul Urge Number: ${numbers.soulUrge.value}** \u2014 ${numbers.soulUrge.meaning}
- **Personality Number: ${numbers.personality.value}** \u2014 ${numbers.personality.meaning}
- **Birthday Number: ${numbers.birthday.value}** \u2014 ${numbers.birthday.meaning}

Please provide a complete numerology reading structured as:

1. **Your Core Blueprint** \u2014 Synthesize the Life Path and Expression numbers into a cohesive description of who this person is and their life's central theme
2. **Your Inner World** \u2014 Interpret the Soul Urge number \u2014 what drives them beneath the surface, their deepest desires
3. **How Others See You** \u2014 Interpret the Personality number \u2014 the face they show the world
4. **Your Gifts & Challenges** \u2014 Based on all numbers, identify 2-3 strengths and 2-3 growth areas
5. **Guidance for Your Path** \u2014 3-4 specific pieces of advice for the year ahead based on their numbers

Important guidelines:
- Be warm, insightful, and empowering \u2014 this is guidance, not fate
- Make connections between the different numbers \u2014 show how they interact
- If any Master Numbers (11, 22, 33) appear, give special attention to their significance
- Use the seeker's name occasionally to personalize the reading
- Keep the tone mystical but grounded \u2014 spiritual insight with practical application
- Always remind the seeker that numbers reveal potential, not destiny \u2014 they hold the power of choice`;
}

// server/divination/dream.ts
var DREAM_SYMBOLS = {
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
  chasing: { category: "Fear", meaning: "Avoiding a problem or fear. The chaser often represents something you're not facing. Turn around \u2014 what's chasing you?" },
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
  tunnel: { category: "Journey", meaning: "A journey through the unconscious or a difficult transition. Light at the end = hope and resolution." }
};
var EMOTION_KEYWORDS = {
  fear: ["scared", "afraid", "terrified", "frightened", "horror", "panic", "anxious", "dread"],
  joy: ["happy", "joyful", "excited", "thrilled", "elated", "peaceful", "content", "blissful"],
  sadness: ["sad", "crying", "depressed", "lonely", "grief", "sorrow", "mournful", "empty"],
  anger: ["angry", "furious", "rage", "frustrated", "irritated", "resentful", "hostile"],
  confusion: ["confused", "lost", "disoriented", "bewildered", "puzzled", "uncertain", "trapped"],
  love: ["loving", "loved", "affection", "tender", "warm", "intimate", "connected"],
  empowerment: ["powerful", "strong", "confident", "brave", "courageous", "determined", "free"],
  vulnerability: ["vulnerable", "exposed", "naked", "bare", "raw", "weak", "helpless"],
  guilt: ["guilty", "ashamed", "regretful", "remorseful", "embarrassed", "humiliated"],
  wonder: ["amazed", "awe", "wonder", "fascinated", "curious", "mystical", "magical", "surreal"]
};
function extractSymbols(dream) {
  const found = [];
  const lowerText = dream.toLowerCase();
  for (const [symbol, info] of Object.entries(DREAM_SYMBOLS)) {
    if (lowerText.includes(symbol)) {
      found.push({ word: symbol, category: info.category, meaning: info.meaning });
    }
  }
  return found;
}
function extractEmotions(dream) {
  const found = [];
  const lowerText = dream.toLowerCase();
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      found.push(emotion);
    }
  }
  return found.length > 0 ? found : ["mystery"];
}
function extractThemes(symbols) {
  const categories = new Set(symbols.map((s) => s.category));
  return Array.from(categories);
}
function analyzeDream(dreamText) {
  const symbols = extractSymbols(dreamText);
  const emotions = extractEmotions(dreamText);
  const themes = extractThemes(symbols);
  const prompt = buildDreamPrompt(dreamText, symbols, emotions, themes);
  return {
    dream: dreamText,
    symbols,
    emotions,
    themes,
    prompt
  };
}
function buildDreamPrompt(dream, symbols, emotions, themes) {
  const symbolText = symbols.length > 0 ? symbols.map((s) => `- **${s.word}** (${s.category}): ${s.meaning}`).join("\n") : "No common symbols detected \u2014 this dream is uniquely personal.";
  const emotionText = emotions.join(", ");
  const themeText = themes.length > 0 ? themes.join(", ") : "Personal";
  return `You are a wise, Jungian-trained dream interpreter with deep psychological insight. A dreamer has shared this dream:

"${dream}"

**Detected symbols:**
${symbolText}

**Emotional tone:** ${emotionText}
**Dominant themes:** ${themeText}

Please provide an interpretation structured as:

1. **The Landscape** \u2014 Describe the overall feeling and atmosphere of this dream. What world did the dreamer create?
2. **The Symbols Speak** \u2014 Interpret 3-4 key symbols and what they might represent in the dreamer's waking life. Connect symbols to each other where possible.
3. **The Message** \u2014 What is the dream trying to communicate? What might the dreamer's unconscious be processing?
4. **Waking Life Connection** \u2014 Offer 2-3 gentle suggestions about what area of life this dream might relate to (relationships, career, inner growth, etc.)
5. **Integration Practice** \u2014 Suggest one simple practice the dreamer can do today to work with this dream's message

Important guidelines:
- Use Jungian principles: dreams are messages from the unconscious, not random noise
- Be compassionate and never frightening \u2014 all dreams serve the dreamer's growth
- Frame interpretations as "this might mean..." not "this means..."
- Honor the dreamer's unique personal symbolism \u2014 not everything in a dream dictionary
- The dreamer is the ultimate authority on their own dream \u2014 you are offering perspective, not judgment
- End with a sense of wonder and curiosity about the inner world`;
}

// server/divination/palm.ts
var GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
async function analyzePalmImage(imageBase64, hand = "auto") {
  const analysisPrompt = `Analyze this palm image in detail for palm reading purposes. Identify and describe:

1. **Hand Shape** \u2014 Element type (Earth, Air, Fire, Water hands) based on palm shape and finger length
2. **Life Line** \u2014 Length, depth, curve, branches. What it suggests about vitality and life path
3. **Head Line** \u2014 Length, depth, direction. What it suggests about intellect and communication
4. **Heart Line** \u2014 Length, curve, branches. What it suggests about emotions and relationships  
5. **Fate Line** \u2014 If visible, describe its characteristics
6. **Mounts** \u2014 Which mounts (Venus, Jupiter, Saturn, Apollo, Mercury, Mars, Moon) are prominent
7. **Overall Character** \u2014 Synthesize these features into a brief personality sketch

Be detailed and specific. Note any unique marks, crosses, stars, or islands on the lines.
Hand: ${hand === "auto" ? "Determine if this is left or right hand" : hand === "left" ? "This is the LEFT hand (recessive/inner self)" : "This is the RIGHT hand (dominant/outer self)"}

IMPORTANT: If this image does not clearly show a palm/hand suitable for reading, say so honestly and suggest taking a clearer photo.`;
  let features;
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
        })
      }
    );
    const data = await response.json();
    features = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to analyze palm image.";
  } catch (error) {
    console.error("[PalmReading] Gemini analysis failed:", error);
    features = "Image analysis unavailable \u2014 proceeding with a general palm reading based on the energy of your inquiry.";
  }
  const prompt = buildPalmPrompt(features, hand);
  return {
    imageBase64,
    hand: hand === "auto" ? "unknown" : hand,
    features,
    prompt
  };
}
function buildPalmPrompt(features, hand) {
  return `You are a gifted palm reader with deep knowledge of chiromancy (the art of palm reading). A seeker has presented their palm for analysis.

**Hand:** ${hand === "left" ? "Left hand \u2014 this reveals the inner self, potential, and subconscious patterns" : hand === "right" ? "Right hand \u2014 this reveals the outer self, how one engages with the world" : "Hand orientation unknown"}
  
**Visual Analysis of the Palm:**
${features}

Please provide a complete palm reading structured as:

1. **First Impressions** \u2014 What does this hand reveal at first glance about the person's nature?
2. **The Life Line** \u2014 What does their vitality, life path, and major life events suggest?
3. **The Head Line** \u2014 Interpret their intellectual style, communication patterns, and mental strengths
4. **The Heart Line** \u2014 Reveal what the heart shows about their emotional life, relationships, and capacity for love
5. **The Hand's Story** \u2014 Synthesize all features into a coherent narrative about this person's character and journey
6. **Guidance from the Lines** \u2014 Offer 2-3 gentle insights or suggestions based on the reading

Important guidelines:
- Be warm, insightful, and never frightening
- Frame everything as tendencies and potentials, not fixed destiny
- Our hands change over time \u2014 what you read is their current state, not a permanent verdict
- Honor the ancient tradition of palmistry while keeping it accessible
- If the image analysis was limited, focus on the spiritual and intuitive aspects of the reading
- Always end with an empowering, hopeful note`;
}

// server/divination/face.ts
var GEMINI_API_KEY2 = process.env.GEMINI_API_KEY || "";
async function analyzeFaceImage(imageBase64) {
  const analysisPrompt = `Analyze this face for physiognomy (face reading / Mian Xiang). Describe these features:

1. **Face Shape** \u2014 Round, oval, square, rectangular, heart, diamond, or triangular. What does this shape traditionally suggest about personality?
2. **Forehead** \u2014 Height, width, lines. What it reveals about intellect, career, and early life (ages 15-30)
3. **Eyebrows** \u2014 Shape, thickness, position. What they suggest about temperament, relationships, and creativity
4. **Eyes** \u2014 Size, shape, spacing, expression. The eyes are the most important feature \u2014 what do they reveal about the person's soul and emotional nature?
5. **Nose** \u2014 Size, shape, bridge. What it suggests about wealth, ambition, and mid-life (ages 40-50)
6. **Mouth & Lips** \u2014 Size, shape, expression. What they reveal about communication style, sensuality, and relationships
7. **Chin & Jaw** \u2014 Shape, prominence. What it suggests about later life, determination, and resilience
8. **Overall Impression** \u2014 Synthesize into a brief character portrait

Be detailed, specific, and grounded in traditional Mian Xiang principles.

IMPORTANT: If this image does not clearly show a face, say so honestly.`;
  let features;
  try {
    if (!GEMINI_API_KEY2) {
      throw new Error("GEMINI_API_KEY not configured");
    }
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY2}`,
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
        })
      }
    );
    const data = await response.json();
    features = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to analyze face image.";
  } catch (error) {
    console.error("[FaceReading] Gemini analysis failed:", error);
    features = "Image analysis unavailable \u2014 proceeding with a general face reading based on the energy of your inquiry.";
  }
  const prompt = buildFacePrompt(features);
  return {
    imageBase64,
    features,
    prompt
  };
}
function buildFacePrompt(features) {
  return `You are a master of Mian Xiang (Chinese face reading), an ancient art that reads character and destiny from facial features. A seeker has presented their face for analysis.

**Visual Analysis:**
${features}

Please provide a face reading structured as:

1. **The Three Regions** \u2014 Interpret the face in three zones: Upper (forehead \u2014 intellect, early life), Middle (eyes to nose \u2014 career, relationships, mid-life), Lower (mouth to chin \u2014 later life, foundation)
2. **The Windows to the Soul** \u2014 A deep reading of the eyes \u2014 what do they reveal about this person's inner world?
3. **Character Portrait** \u2014 Synthesize all features into a vivid description of this person's nature, strengths, and tendencies
4. **Life Journey** \u2014 What does this face suggest about their life path, challenges, and opportunities?
5. **The Art of Mian Xiang** \u2014 Connect the reading to traditional face reading wisdom in a way that feels timeless and meaningful
6. **Guidance** \u2014 Offer 2-3 gentle insights for the seeker based on what their face reveals

Important guidelines:
- Be respectful, warm, and insightful \u2014 this is an ancient art, not a judgment
- Frame everything as tendencies, not absolute truths
- A face changes with time and experience \u2014 what you see is a snapshot, not a permanent fate
- Honor Chinese face reading traditions while making them accessible
- If the image analysis was limited, focus on universal human wisdom
- Always end with an empowering note about the beauty of the human face as a map of life lived`;
}

// server/divination/astrology.ts
var ZODIAC_SIGNS = [
  { name: "Aries", emoji: "\u2648", element: "Fire", quality: "Cardinal", dates: "Mar 21 - Apr 19", degree: 0 },
  { name: "Taurus", emoji: "\u2649", element: "Earth", quality: "Fixed", dates: "Apr 20 - May 20", degree: 30 },
  { name: "Gemini", emoji: "\u264A", element: "Air", quality: "Mutable", dates: "May 21 - Jun 20", degree: 60 },
  { name: "Cancer", emoji: "\u264B", element: "Water", quality: "Cardinal", dates: "Jun 21 - Jul 22", degree: 90 },
  { name: "Leo", emoji: "\u264C", element: "Fire", quality: "Fixed", dates: "Jul 23 - Aug 22", degree: 120 },
  { name: "Virgo", emoji: "\u264D", element: "Earth", quality: "Mutable", dates: "Aug 23 - Sep 22", degree: 150 },
  { name: "Libra", emoji: "\u264E", element: "Air", quality: "Cardinal", dates: "Sep 23 - Oct 22", degree: 180 },
  { name: "Scorpio", emoji: "\u264F", element: "Water", quality: "Fixed", dates: "Oct 23 - Nov 21", degree: 210 },
  { name: "Sagittarius", emoji: "\u2650", element: "Fire", quality: "Mutable", dates: "Nov 22 - Dec 21", degree: 240 },
  { name: "Capricorn", emoji: "\u2651", element: "Earth", quality: "Cardinal", dates: "Dec 22 - Jan 19", degree: 270 },
  { name: "Aquarius", emoji: "\u2652", element: "Air", quality: "Fixed", dates: "Jan 20 - Feb 18", degree: 300 },
  { name: "Pisces", emoji: "\u2653", element: "Water", quality: "Mutable", dates: "Feb 19 - Mar 20", degree: 330 }
];
var SIGN_MEANINGS = {
  Aries: {
    sun: "Your core identity is bold, pioneering, and fiercely independent. You lead with courage and thrive on new challenges.",
    moon: "Your emotional nature is fiery and direct. You feel things intensely and react quickly, but anger passes as fast as it arrives.",
    rising: "You come across as confident, energetic, and ready for action. People see you as a natural leader who doesn't wait for permission.",
    mercury: "You communicate directly and decisively. Your mind is quick and competitive \u2014 you think fast and speak your truth without hesitation.",
    venus: "In love, you're passionate and spontaneous. You pursue what you want boldly and love the thrill of the chase.",
    mars: "Your drive is unstoppable when inspired. You attack challenges head-on and have endless energy for what excites you."
  },
  Taurus: {
    sun: "Your core self is grounded, patient, and deeply connected to the physical world. You build things that last.",
    moon: "You need emotional security and stability. Change unsettles you \u2014 you find peace in routine, comfort, and the familiar.",
    rising: "You project calm, reliability, and quiet strength. People feel safe around you and trust your steady presence.",
    mercury: "Your mind works methodically. You think things through thoroughly before speaking, and your words carry weight.",
    venus: "You love deeply and sensually. Romance for you is about touch, taste, beauty, and lasting commitment.",
    mars: "You move at your own pace \u2014 slow, steady, unstoppable. Once committed, nothing can move you off course."
  },
  Gemini: {
    sun: "Your essence is curious, adaptable, and eternally youthful. You collect ideas and connections like treasures.",
    moon: "You process emotions through words and analysis. Talking about feelings helps you understand them \u2014 silence feels suffocating.",
    rising: "You come across as witty, charming, and intellectually curious. People see you as someone who knows a little about everything.",
    mercury: "Your mind is lightning-fast, versatile, and brilliant at making connections. You're a natural communicator and storyteller.",
    venus: "You're attracted to intelligence and wit. Mental connection is foreplay \u2014 you fall in love through conversation.",
    mars: "Your energy is mental and social. You pursue goals through networking, learning, and adaptability rather than brute force."
  },
  Cancer: {
    sun: "Your soul is nurturing, protective, and deeply feeling. Home and family are your sacred ground.",
    moon: "Emotions are your first language. You feel everything intensely \u2014 joy, pain, love, loss \u2014 and your moods shift like tides.",
    rising: "You appear soft, caring, and approachable. Your emotional intelligence draws people to you for comfort and wisdom.",
    mercury: "Your thoughts are colored by emotion and memory. You communicate with empathy and never forget how something made you feel.",
    venus: "You love by nurturing. Safety, trust, and emotional depth mean more to you than grand romantic gestures.",
    mars: "You protect what you love fiercely. Your drive comes from emotional commitment \u2014 when you care, you're unstoppable."
  },
  Leo: {
    sun: "You are radiant, creative, and meant to shine. Your purpose involves expressing your unique light and inspiring others.",
    moon: "You need to feel special and appreciated. Your emotional wellbeing depends on being seen and valued for who you are.",
    rising: "You enter a room like the sun rising. Your presence is warm, magnetic, and impossible to ignore.",
    mercury: "You communicate with drama and passion. You're a natural performer \u2014 your words inspire and entertain.",
    venus: "You love grandly and generously. Romance is a stage and you want a love story worth telling.",
    mars: "Your drive is powered by pride and passion. You work hard for recognition and pour your heart into what you create."
  },
  Virgo: {
    sun: "Your essence is analytical, service-oriented, and ever-improving. You find meaning in making things better.",
    moon: "You feel safe when things are orderly and understood. Chaos in your environment creates chaos in your heart.",
    rising: "You project competence, modesty, and helpfulness. People see you as the one who has things figured out.",
    mercury: "Your mind is precise, analytical, and detail-oriented. You notice what others miss and communicate with clarity.",
    venus: "You show love through acts of service. Grand gestures feel hollow \u2014 you prove devotion through consistent care.",
    mars: "Your drive is methodical and efficient. You attack problems by breaking them into manageable pieces."
  },
  Libra: {
    sun: "Your core is about balance, beauty, and relationships. You see all sides and seek harmony in everything.",
    moon: "You need peace and partnership. Conflict drains you; harmony restores you. You feel best when relationships are balanced.",
    rising: "You project charm, diplomacy, and grace. People are drawn to your sense of fairness and aesthetic sensibility.",
    mercury: "Your mind weighs all perspectives. You communicate with tact and see truth as something that exists between viewpoints.",
    venus: "You are a true romantic. Love is an art form to you \u2014 you seek beauty, balance, and a true equal partner.",
    mars: "You pursue goals through cooperation and charm. You'd rather win people over than fight them."
  },
  Scorpio: {
    sun: "Your soul runs deep, intense, and transformative. You see beneath surfaces and are unafraid of darkness.",
    moon: "Your emotions are volcanic \u2014 still on the surface, molten underneath. You feel everything with intensity most people can't imagine.",
    rising: "You project mystery, power, and depth. People sense there's more to you than meets the eye \u2014 and there always is.",
    mercury: "Your mind is investigative and penetrating. You don't do small talk \u2014 you go straight to the truth.",
    venus: "You love with soul-deep intensity. Casual isn't in your vocabulary \u2014 you want complete merger or nothing at all.",
    mars: "Your drive is relentless and strategic. You pursue goals with laser focus and won't stop until transformation is complete."
  },
  Sagittarius: {
    sun: "Your spirit is adventurous, philosophical, and free. You're here to explore, learn, and expand horizons.",
    moon: "You need freedom and meaning. Routine suffocates your emotions \u2014 you feel alive when exploring new territory.",
    rising: "You come across as optimistic, adventurous, and larger than life. Your enthusiasm is contagious.",
    mercury: "Your mind thinks in big pictures. You're a natural philosopher who communicates with humor and brutal honesty.",
    venus: "You love adventure and growth. The best date is an experience \u2014 you fall in love while exploring the world together.",
    mars: "Your drive is fueled by vision and freedom. You pursue goals with infectious enthusiasm and HATE being boxed in."
  },
  Capricorn: {
    sun: "Your core is ambitious, disciplined, and built for the long game. You understand that real achievement takes time.",
    moon: "You process emotions through achievement and control. Vulnerability is hard \u2014 you feel safest when self-sufficient.",
    rising: "You project competence, authority, and quiet ambition. People take you seriously even before you speak.",
    mercury: "Your mind is strategic and practical. You communicate with authority and think in terms of results.",
    venus: "You love with commitment and responsibility. Romance is serious business \u2014 you build relationships like you build empires.",
    mars: "Your drive is relentless and goal-oriented. You outwork everyone and measure progress in milestones achieved."
  },
  Aquarius: {
    sun: "Your essence is innovative, humanitarian, and ahead of your time. You're here to challenge norms and envision the future.",
    moon: "You need intellectual and emotional freedom. You care deeply about humanity but can seem detached one-on-one.",
    rising: "You project uniqueness, intelligence, and a hint of rebellion. People see you as original and slightly unpredictable.",
    mercury: "Your mind is visionary and unconventional. You think in systems and patterns \u2014 your ideas are years ahead.",
    venus: "You love through friendship and shared ideals. Intellectual connection comes first \u2014 then the heart follows.",
    mars: "Your drive is powered by ideals and innovation. You fight for causes, not personal gain."
  },
  Pisces: {
    sun: "Your soul is dreamy, compassionate, and deeply connected to the unseen. You're a bridge between worlds.",
    moon: "You absorb emotions like a sponge. Other people's feelings become yours \u2014 you need solitude to know what's truly you.",
    rising: "You project gentleness, creativity, and mystery. People see you as ethereal \u2014 someone who seems to exist between worlds.",
    mercury: "Your mind is intuitive and poetic. You think in images, feelings, and impressions rather than straight lines.",
    venus: "You love unconditionally and romantically. You see the divine in your partner and love with spiritual depth.",
    mars: "Your drive flows like water \u2014 adaptable, persistent, finding paths around obstacles rather than through them."
  }
};
function getSunSign(birthdate) {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const signBoundaries = [
    { sign: "Capricorn", emoji: "\u2651", start: [12, 22], end: [1, 19] },
    { sign: "Aquarius", emoji: "\u2652", start: [1, 20], end: [2, 18] },
    { sign: "Pisces", emoji: "\u2653", start: [2, 19], end: [3, 20] },
    { sign: "Aries", emoji: "\u2648", start: [3, 21], end: [4, 19] },
    { sign: "Taurus", emoji: "\u2649", start: [4, 20], end: [5, 20] },
    { sign: "Gemini", emoji: "\u264A", start: [5, 21], end: [6, 20] },
    { sign: "Cancer", emoji: "\u264B", start: [6, 21], end: [7, 22] },
    { sign: "Leo", emoji: "\u264C", start: [7, 23], end: [8, 22] },
    { sign: "Virgo", emoji: "\u264D", start: [8, 23], end: [9, 22] },
    { sign: "Libra", emoji: "\u264E", start: [9, 23], end: [10, 22] },
    { sign: "Scorpio", emoji: "\u264F", start: [10, 23], end: [11, 21] },
    { sign: "Sagittarius", emoji: "\u2650", start: [11, 22], end: [12, 21] }
  ];
  for (const boundary of signBoundaries) {
    const [sMonth, sDay] = boundary.start;
    const [eMonth, eDay] = boundary.end;
    if (boundary.sign === "Capricorn") {
      if (month === 12 && day >= sDay || month === 1 && day <= eDay) {
        const sign = ZODIAC_SIGNS.find((s) => s.name === "Capricorn");
        return { sign: "Capricorn", emoji: "\u2651", degree: sign.degree + 15 };
      }
    } else {
      if (month === sMonth && day >= sDay || month === eMonth && day <= eDay) {
        const sign = ZODIAC_SIGNS.find((s) => s.name === boundary.sign);
        return { sign: boundary.sign, emoji: boundary.emoji, degree: sign.degree + 15 };
      }
    }
  }
  return { sign: "Aries", emoji: "\u2648", degree: 15 };
}
function getMoonSign(birthdate) {
  const date = new Date(birthdate);
  const epoch = (/* @__PURE__ */ new Date("2000-01-01")).getTime();
  const daysSinceEpoch = (date.getTime() - epoch) / (1e3 * 60 * 60 * 24);
  const moonDegree = (daysSinceEpoch * 13.2 % 360 + 360) % 360;
  const signIndex = Math.floor(moonDegree / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  return { sign: sign.name, degree: Math.round(moonDegree % 30 * 10) / 10 };
}
function getRisingSign(birthdate, birthTime) {
  if (!birthTime) {
    const sun = getSunSign(birthdate);
    return { sign: sun.sign, degree: sun.degree };
  }
  const [hours, minutes] = birthTime.split(":").map(Number);
  const date = new Date(birthdate);
  const epoch = (/* @__PURE__ */ new Date("2000-01-01")).getTime();
  const daysSinceEpoch = (date.getTime() - epoch) / (1e3 * 60 * 60 * 24);
  const ascDegree = ((hours * 15 + minutes * 0.25 + daysSinceEpoch * 1) % 360 + 360) % 360;
  const signIndex = Math.floor(ascDegree / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  return { sign: sign.name, degree: Math.round(ascDegree % 30 * 10) / 10 };
}
function getPlanetarySign(sunDegree, offset) {
  const degree = ((sunDegree + offset) % 360 + 360) % 360;
  const signIndex = Math.floor(degree / 30);
  return { sign: ZODIAC_SIGNS[signIndex].name };
}
function getHouseForDegree(degree, ascDegree) {
  const relativeDegree = ((degree - ascDegree) % 360 + 360) % 360;
  return Math.floor(relativeDegree / 30) + 1;
}
function generateAstrologyReading(name, birthdate, birthTime = null, birthPlace = null) {
  const sunData = getSunSign(birthdate);
  const moonData = getMoonSign(birthdate);
  const risingData = getRisingSign(birthdate, birthTime);
  const ascDegree = ZODIAC_SIGNS.find((s) => s.name === risingData.sign)?.degree || 0;
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
    mars: { sign: mars.sign, meaning: marsMeanings.mars }
  };
  const prompt = buildAstrologyPrompt(name, birthdate, birthTime, birthPlace, signs);
  return { name, birthdate, birthTime, birthPlace, signs, prompt };
}
function signEmoji(signName) {
  return ZODIAC_SIGNS.find((s) => s.name === signName)?.emoji || "\u2728";
}
function buildAstrologyPrompt(name, birthdate, birthTime, birthPlace, signs) {
  const dateFormatted = new Date(birthdate).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return `You are a wise, insightful astrologer who interprets birth charts with depth and compassion. A seeker named ${name} has shared their birth details:

**Born:** ${dateFormatted}${birthTime ? ` at ${birthTime}` : " (time unknown)"}${birthPlace ? ` in ${birthPlace}` : ""}

**Their Big Three:**
- \u2600\uFE0F Sun in ${signs.sun.sign} ${signEmoji(signs.sun.sign)} (House ${signs.sun.house})
- \u{1F319} Moon in ${signs.moon.sign} ${signEmoji(signs.moon.sign)} (House ${signs.moon.house})
- \u2B06\uFE0F Rising: ${signs.rising.sign} ${signEmoji(signs.rising.sign)}

**Other Planets:**
- \u263F Mercury in ${signs.mercury.sign} ${signEmoji(signs.mercury.sign)}
- \u2640 Venus in ${signs.venus.sign} ${signEmoji(signs.venus.sign)}
- \u2642 Mars in ${signs.mars.sign} ${signEmoji(signs.mars.sign)}

**Core Meanings:**
- Sun: ${signs.sun.meaning}
- Moon: ${signs.moon.meaning}
- Rising: ${signs.rising.meaning}
- Mercury: ${signs.mercury.meaning}
- Venus: ${signs.venus.meaning}
- Mars: ${signs.mars.meaning}

Please provide a complete birth chart reading structured as:

1. **Your Cosmic Blueprint** \u2014 Synthesize the Sun, Moon, and Rising into a vivid description of the seeker's essential nature. How do these three interact? What's the core tension and harmony?
2. **Your Inner World** \u{1F319} \u2014 Deep dive into the Moon sign \u2014 their emotional landscape, what they need to feel safe, their instinctive reactions
3. **Your Outer Expression** \u2B06\uFE0F \u2014 The Rising sign \u2014 how they come across to others, their social mask, first impressions
4. **How You Think & Communicate** \u263F \u2014 Mercury in ${signs.mercury.sign} \u2014 their mind, communication style, learning patterns
5. **How You Love** \u2640 \u2014 Venus in ${signs.venus.sign} \u2014 their love language, what attracts them, relationship patterns
6. **How You Take Action** \u2642 \u2014 Mars in ${signs.mars.sign} \u2014 their drive, ambition, and how they pursue goals
7. **Cosmic Guidance** \u2014 3-4 pieces of advice tailored to this unique chart configuration. Address potential challenges and how to work with them

Important guidelines:
- Be warm, insightful, and specific \u2014 reference the actual sign qualities
- Explain how the signs interact (e.g., "Your fiery Aries Sun wants to charge ahead, but your sensitive Cancer Moon needs emotional safety first")
- Use emoji occasionally to make it visually engaging
- Frame everything as tendencies and potentials, not fixed fate
- If birth time is unknown, acknowledge the uncertainty around the Rising sign and houses
- Make ${name} feel truly seen and understood through their chart
- End with an empowering reminder that the stars incline, they do not compel`;
}

// server/divination/compatibility.ts
var ELEMENT_MATRIX = {
  Fire: { Fire: 85, Earth: 40, Air: 90, Water: 50 },
  Earth: { Fire: 40, Earth: 80, Air: 50, Water: 90 },
  Air: { Fire: 90, Earth: 50, Air: 85, Water: 40 },
  Water: { Fire: 50, Earth: 90, Air: 40, Water: 85 }
};
var ZODIAC_ELEMENTS = {
  Aries: "Fire",
  Taurus: "Earth",
  Gemini: "Air",
  Cancer: "Water",
  Leo: "Fire",
  Virgo: "Earth",
  Libra: "Air",
  Scorpio: "Water",
  Sagittarius: "Fire",
  Capricorn: "Earth",
  Aquarius: "Air",
  Pisces: "Water"
};
var ZODIAC_QUALITIES = {
  Aries: "Cardinal",
  Taurus: "Fixed",
  Gemini: "Mutable",
  Cancer: "Cardinal",
  Leo: "Fixed",
  Virgo: "Mutable",
  Libra: "Cardinal",
  Scorpio: "Fixed",
  Sagittarius: "Mutable",
  Capricorn: "Cardinal",
  Aquarius: "Fixed",
  Pisces: "Mutable"
};
var QUALITY_MATRIX = {
  Cardinal: { Cardinal: 75, Fixed: 40, Mutable: 60 },
  Fixed: { Cardinal: 40, Fixed: 70, Mutable: 55 },
  Mutable: { Cardinal: 60, Fixed: 55, Mutable: 80 }
};
var SUN_PAIRS = {
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
  Pisces: ["Cancer", "Scorpio", "Taurus", "Capricorn"]
};
var LIFE_PATH_PAIRS = {
  1: [1, 3, 5, 7, 9],
  2: [2, 4, 6, 8],
  3: [1, 3, 5, 6, 9],
  4: [2, 4, 6, 7, 8],
  5: [1, 3, 5, 7],
  6: [2, 3, 4, 6, 8, 9],
  7: [1, 4, 5, 7, 9],
  8: [2, 4, 6, 8],
  9: [1, 3, 6, 7, 9],
  11: [2, 6, 7, 9, 11, 22],
  22: [4, 6, 7, 8, 11, 22],
  33: [3, 6, 9, 11, 33]
};
function calculateCompatibility(astrology1, astrology2, numerology1, numerology2) {
  const sunScore = scoreSun(astrology1.sun.sign, astrology2.sun.sign);
  const moonScore = scoreMoon(astrology1.moon.sign, astrology2.moon.sign);
  const risingScore = scoreRising(astrology1.rising.sign, astrology2.rising.sign);
  const venusScore = scoreVenus(astrology1.venus.sign, astrology2.venus.sign);
  const marsScore = scoreMars(astrology1.mars.sign, astrology2.mars.sign);
  const numScore = numerology1 && numerology2 ? scoreNumerology(numerology1.lifePath.value, numerology2.lifePath.value) : 5;
  const total = Math.min(100, Math.round(
    sunScore + moonScore + risingScore + venusScore + marsScore + numScore
  ));
  const highlights = [];
  const challenges = [];
  if (sunScore >= 20) highlights.push(`${astrology1.sun.sign} & ${astrology2.sun.sign} Sun signs create natural understanding`);
  if (moonScore >= 20) highlights.push(`Your Moons (${astrology1.moon.sign} & ${astrology2.moon.sign}) connect emotionally`);
  if (venusScore >= 12) highlights.push(`Venus signs align \u2014 strong romantic chemistry`);
  if (numScore >= 8) highlights.push(`Life Path numbers are harmonious`);
  if (risingScore >= 12) highlights.push(`Immediate attraction potential from Rising signs`);
  if (sunScore < 10) challenges.push(`Different core natures may require patience`);
  if (moonScore < 10) challenges.push(`Emotional needs differ \u2014 communication is key`);
  if (marsScore < 5) challenges.push(`Different drive styles \u2014 respect each other's pace`);
  const tier = total >= 85 ? "cosmic" : total >= 70 ? "excellent" : total >= 55 ? "good" : total >= 40 ? "challenging" : "complex";
  const summaries = {
    cosmic: "A rare, profound connection. The stars have aligned for something extraordinary.",
    excellent: "Strong compatibility with genuine chemistry. This has real potential.",
    good: "A solid match with natural understanding. Worth exploring.",
    challenging: "An interesting dynamic that requires effort but can be deeply rewarding.",
    complex: "Different energies that could clash or complement \u2014 depends on the people."
  };
  return {
    total,
    breakdown: { sun: sunScore, moon: moonScore, rising: risingScore, venus: venusScore, mars: marsScore, numerology: numScore },
    highlights: highlights.length > 0 ? highlights : ["Unique dynamic between two individuals"],
    challenges: challenges.length > 0 ? challenges : ["No major challenges detected"],
    summary: summaries[tier]
  };
}
function scoreSun(sign1, sign2) {
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  const quality1 = ZODIAC_QUALITIES[sign1];
  const quality2 = ZODIAC_QUALITIES[sign2];
  let score = ELEMENT_MATRIX[element1]?.[element2] || 50;
  score = (score + (QUALITY_MATRIX[quality1]?.[quality2] || 50)) / 2;
  if (SUN_PAIRS[sign1]?.includes(sign2)) score = Math.min(100, score + 10);
  return Math.round(score * 0.25);
}
function scoreMoon(sign1, sign2) {
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  const elementScore = ELEMENT_MATRIX[element1]?.[element2] || 50;
  const sameSignBonus = sign1 === sign2 ? 20 : 0;
  return Math.min(25, Math.round((elementScore + sameSignBonus) * 0.25));
}
function scoreRising(sign1, sign2) {
  const quality1 = ZODIAC_QUALITIES[sign1];
  const quality2 = ZODIAC_QUALITIES[sign2];
  if (quality1 === "Cardinal" && quality2 === "Fixed" || quality1 === "Fixed" && quality2 === "Cardinal") return 12;
  if (quality1 === quality2) return 11;
  return 8;
}
function scoreVenus(sign1, sign2) {
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  const elementScore = ELEMENT_MATRIX[element1]?.[element2] || 50;
  const sameSignBonus = sign1 === sign2 ? 10 : 0;
  return Math.round((elementScore + sameSignBonus) * 0.15);
}
function scoreMars(sign1, sign2) {
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  const sameElement = element1 === element2;
  const base = sameElement ? 80 : ELEMENT_MATRIX[element1]?.[element2] || 50;
  return Math.round(base * 0.1);
}
function scoreNumerology(lp1, lp2) {
  if (LIFE_PATH_PAIRS[lp1]?.includes(lp2)) return 8;
  if (lp1 === lp2) return 7;
  if (lp1 === 11 || lp1 === 22 || lp1 === 33 || lp2 === 11 || lp2 === 22 || lp2 === 33) return 6;
  return 4;
}
function generateCompatibilityPrompt(name1, name2, score, astrology1, astrology2) {
  return `You are a cosmic matchmaker. Two people have been matched:

**${name1}**: \u2600\uFE0F ${astrology1.sun.sign} \u{1F319} ${astrology1.moon.sign} \u2B06\uFE0F ${astrology1.rising.sign} | \u2640 ${astrology1.venus.sign} \u2642 ${astrology1.mars.sign}
**${name2}**: \u2600\uFE0F ${astrology2.sun.sign} \u{1F319} ${astrology2.moon.sign} \u2B06\uFE0F ${astrology2.rising.sign} | \u2640 ${astrology2.venus.sign} \u2642 ${astrology2.mars.sign}

**Compatibility Score: ${score.total}/100** (${score.total >= 85 ? "Cosmic" : score.total >= 70 ? "Excellent" : score.total >= 55 ? "Good" : "Interesting"})

Sun: ${score.breakdown.sun}/25 | Moon: ${score.breakdown.moon}/25 | Rising: ${score.breakdown.rising}/15 | Venus: ${score.breakdown.venus}/15 | Mars: ${score.breakdown.mars}/10

\u2728 Highlights: ${score.highlights.join("; ")}
\u26A1 Challenges: ${score.challenges.join("; ")}

Write a warm, poetic 3-4 sentence match description that captures the essence of this connection. Make it feel magical but grounded. Mention specific sign interactions. Keep it under 150 words.`;
}

// server/routers.ts
var DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
async function callLLM(prompt) {
  if (!DEEPSEEK_API_KEY) {
    return generateFallbackResponse(prompt);
  }
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a gifted spiritual guide and divination interpreter. You are warm, insightful, wise, and never frightening. You frame all readings as possibilities, not absolute predictions. Always emphasize the seeker's free will and agency. Be mystical but accessible \u2014 poetic without being obscure. Limit responses to 600 words." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1200
    })
  });
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || generateFallbackResponse(prompt);
}
function generateFallbackResponse(prompt) {
  return `\u2728 Thank you for seeking guidance. While our mystical AI is momentarily unavailable, know that the universe speaks through silence too. 

Take a moment to reflect on your question. Often, the answer we seek is already within us, waiting to be heard. 

For a full reading, please try again shortly when our cosmic connection is restored. In the meantime, trust your intuition \u2014 it is your most reliable guide.

\u{1F52E} The stars are aligning for you. Return soon.`;
}
var appRouter = router({
  // ============= AUTH =============
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // ============= SYSTEM =============
  system: router({
    health: publicProcedure.query(() => ({ ok: true, timestamp: Date.now() }))
  }),
  // ============= DIVINATION =============
  divination: router({
    // --- TAROT ---
    tarotCards: publicProcedure.query(() => {
      return MAJOR_ARCANA.map((c) => ({
        id: c.id,
        name: c.name,
        keywords: c.keywords
      }));
    }),
    tarotRead: protectedProcedure.input(z.object({
      question: z.string().min(3, "Please ask a question for the cards"),
      spreadType: z.enum(["single", "three", "celtic"]).default("three")
    })).mutation(async ({ input, ctx }) => {
      const canRead = await checkReadingQuota(ctx.user.id);
      if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };
      const reading = generateTarotReading(input.question, input.spreadType);
      const interpretation = await callLLM(reading.prompt);
      await saveDivinationReading({
        userId: ctx.user.id,
        type: "tarot",
        query: input.question,
        result: JSON.stringify(reading.cards),
        interpretation
      });
      return {
        type: "tarot",
        spreadType: reading.spreadName,
        cards: reading.cards,
        interpretation,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }),
    // --- NUMEROLOGY ---
    numerologyRead: protectedProcedure.input(z.object({
      name: z.string().min(1, "Please enter your full name"),
      birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
    })).mutation(async ({ input, ctx }) => {
      const canRead = await checkReadingQuota(ctx.user.id);
      if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };
      const reading = generateNumerologyReading(input.name, input.birthdate);
      const interpretation = await callLLM(reading.prompt);
      await saveDivinationReading({
        userId: ctx.user.id,
        type: "numerology",
        query: `${input.name} / ${input.birthdate}`,
        result: JSON.stringify(reading.numbers),
        interpretation
      });
      return {
        type: "numerology",
        name: reading.name,
        birthdate: reading.birthdate,
        numbers: reading.numbers,
        interpretation,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }),
    // --- DREAM INTERPRETATION ---
    dreamRead: protectedProcedure.input(z.object({
      dream: z.string().min(5, "Please describe your dream in more detail")
    })).mutation(async ({ input, ctx }) => {
      const canRead = await checkReadingQuota(ctx.user.id);
      if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };
      const reading = analyzeDream(input.dream);
      const interpretation = await callLLM(reading.prompt);
      await saveDivinationReading({
        userId: ctx.user.id,
        type: "dream",
        query: input.dream.substring(0, 500),
        result: JSON.stringify({ symbols: reading.symbols, emotions: reading.emotions }),
        interpretation
      });
      return {
        type: "dream",
        symbols: reading.symbols,
        emotions: reading.emotions,
        themes: reading.themes,
        interpretation,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }),
    // --- ASTROLOGY ---
    astrologyRead: protectedProcedure.input(z.object({
      name: z.string().min(1, "Please enter your name"),
      birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
      birthTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format").nullable().optional(),
      birthPlace: z.string().nullable().optional()
    })).mutation(async ({ input, ctx }) => {
      const canRead = await checkReadingQuota(ctx.user.id);
      if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };
      const reading = generateAstrologyReading(
        input.name,
        input.birthdate,
        input.birthTime || null,
        input.birthPlace || null
      );
      const interpretation = await callLLM(reading.prompt);
      await saveDivinationReading({
        userId: ctx.user.id,
        type: "astrology",
        query: `${input.name} / ${input.birthdate}${input.birthTime ? ` ${input.birthTime}` : ""}`,
        result: JSON.stringify(reading.signs),
        interpretation
      });
      return {
        type: "astrology",
        name: reading.name,
        signs: reading.signs,
        interpretation,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }),
    // --- PALM READING (image) ---
    palmRead: protectedProcedure.input(z.object({
      imageBase64: z.string(),
      hand: z.enum(["left", "right", "auto"]).default("auto")
    })).mutation(async ({ input, ctx }) => {
      const canRead = await checkReadingQuota(ctx.user.id);
      if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };
      const reading = await analyzePalmImage(input.imageBase64, input.hand);
      const interpretation = await callLLM(reading.prompt);
      await saveDivinationReading({
        userId: ctx.user.id,
        type: "palm",
        query: `Hand: ${input.hand}`,
        result: reading.features.substring(0, 1e3),
        interpretation
      });
      return {
        type: "palm",
        hand: reading.hand,
        features: reading.features,
        interpretation,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }),
    // --- FACE READING (image) ---
    faceRead: protectedProcedure.input(z.object({
      imageBase64: z.string()
    })).mutation(async ({ input, ctx }) => {
      const canRead = await checkReadingQuota(ctx.user.id);
      if (!canRead) return { error: "QUOTA_EXCEEDED", message: "Free daily reading used. Subscribe for unlimited readings." };
      const reading = await analyzeFaceImage(input.imageBase64);
      const interpretation = await callLLM(reading.prompt);
      await saveDivinationReading({
        userId: ctx.user.id,
        type: "face",
        query: "Face reading",
        result: reading.features.substring(0, 1e3),
        interpretation
      });
      return {
        type: "face",
        features: reading.features,
        interpretation,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }),
    // --- HISTORY ---
    history: protectedProcedure.query(async ({ ctx }) => {
      return await getUserReadings(ctx.user.id);
    })
  }),
  // ============= PAYMENTS (Paystack) =============
  payments: router({
    plans: publicProcedure.query(() => MYSTIC_PLANS),
    initialize: protectedProcedure.input(z.object({
      planId: z.enum(["single", "monthly", "annual"]),
      callbackUrl: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const plan = MYSTIC_PLANS[input.planId];
      if (!plan) throw new Error("Invalid plan");
      try {
        const transaction = await initializePaystackTransaction(
          plan.amount,
          ctx.user.email || "seeker@mystic.ai",
          input.callbackUrl,
          { userId: String(ctx.user.id), planId: input.planId }
        );
        return {
          success: true,
          authorizationUrl: transaction.authorization_url,
          reference: transaction.reference,
          accessCode: transaction.access_code
        };
      } catch (error) {
        if (error instanceof PaystackError) {
          return { success: false, error: error.message };
        }
        throw error;
      }
    }),
    verify: protectedProcedure.input(z.object({ reference: z.string() })).mutation(async ({ input, ctx }) => {
      const result = await verifyPaystackTransaction(input.reference);
      if (result.status === "success") {
        const metadata = result.metadata || {};
        const planId = metadata.planId || "single";
        if (planId === "monthly" || planId === "annual") {
          const plan = MYSTIC_PLANS[planId];
          const endDate = /* @__PURE__ */ new Date();
          endDate.setMonth(endDate.getMonth() + (planId === "annual" ? 12 : 1));
          await saveUserSubscription({
            userId: ctx.user.id,
            planId,
            status: "active",
            startDate: /* @__PURE__ */ new Date(),
            endDate,
            paystackReference: input.reference
          });
        }
        if (planId === "single") {
          await incrementReadingCredits(ctx.user.id);
        }
        return { success: true, status: result.status, message: "Payment verified successfully" };
      }
      return { success: false, status: result.status, message: "Payment verification failed" };
    }),
    webhook: publicProcedure.input(z.object({ body: z.any(), signature: z.string() })).mutation(async ({ input }) => {
      const result = handlePaystackWebhook(JSON.stringify(input.body), input.signature);
      return result;
    }),
    subscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
      return await getUserSubscription(ctx.user.id);
    })
  }),
  // ============= DATING =============
  dating: router({
    // Create or update dating profile with calculated chart
    createProfile: protectedProcedure.input(z.object({
      bio: z.string().optional(),
      gender: z.string().optional(),
      seeking: z.string().optional(),
      interests: z.string().optional(),
      birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      birthTime: z.string().optional(),
      birthPlace: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const astrology = generateAstrologyReading(ctx.user.name || "Seeker", input.birthdate, input.birthTime || null, input.birthPlace || null);
      const numerology = generateNumerologyReading(ctx.user.name || "Seeker", input.birthdate);
      const profile = {
        userId: ctx.user.id,
        bio: input.bio,
        gender: input.gender,
        seeking: input.seeking,
        interests: input.interests,
        birthdate: input.birthdate,
        birthTime: input.birthTime,
        birthPlace: input.birthPlace,
        sunSign: astrology.signs.sun.sign,
        moonSign: astrology.signs.moon.sign,
        risingSign: astrology.signs.rising.sign,
        sunHouse: astrology.signs.sun.house,
        moonHouse: astrology.signs.moon.house,
        mercurySign: astrology.signs.mercury.sign,
        venusSign: astrology.signs.venus.sign,
        marsSign: astrology.signs.mars.sign,
        lifePath: numerology.numbers.lifePath.value,
        expression: numerology.numbers.expression.value,
        soulUrge: numerology.numbers.soulUrge.value,
        personality: numerology.numbers.personality.value
      };
      saveDatingProfile(profile);
      return { success: true, profile };
    }),
    // Get current user's profile
    myProfile: protectedProcedure.query(async ({ ctx }) => {
      const profile = getDatingProfile(ctx.user.id);
      return profile || null;
    }),
    // Browse matches with compatibility scores
    matches: protectedProcedure.query(async ({ ctx }) => {
      const myProfile = getDatingProfile(ctx.user.id);
      if (!myProfile) return { error: "Create your dating profile first", matches: [] };
      const allProfiles = getCompatibleProfiles(ctx.user.id);
      const matches = allProfiles.map((p) => {
        const mySigns = {
          sun: { sign: myProfile.sun_sign },
          moon: { sign: myProfile.moon_sign },
          rising: { sign: myProfile.rising_sign },
          mercury: { sign: myProfile.mercury_sign },
          venus: { sign: myProfile.venus_sign },
          mars: { sign: myProfile.mars_sign }
        };
        const theirSigns = {
          sun: { sign: p.sun_sign },
          moon: { sign: p.moon_sign },
          rising: { sign: p.rising_sign },
          mercury: { sign: p.mercury_sign },
          venus: { sign: p.venus_sign },
          mars: { sign: p.mars_sign }
        };
        const score = calculateCompatibility(mySigns, theirSigns);
        return {
          userId: p.user_id,
          name: "",
          // Will be filled from users table
          bio: p.bio,
          gender: p.gender,
          interests: p.interests,
          signs: {
            sun: p.sun_sign,
            moon: p.moon_sign,
            rising: p.rising_sign,
            venus: p.venus_sign,
            mars: p.mars_sign
          },
          lifePath: p.life_path,
          compatibility: score
        };
      });
      const db_ = (await Promise.resolve().then(() => (init_db(), db_exports))).getDb();
      for (const m of matches) {
        const user = db_.prepare("SELECT name FROM users WHERE id = ?").get(m.userId);
        m.name = user?.name || "Unknown";
      }
      const dailySeed = getDailySeed();
      matches.forEach((m) => {
        const shift = dailySeed * (m.userId * 7 + ctx.user.id * 13) % 10 - 5;
        m.compatibility.total = Math.min(100, Math.max(0, m.compatibility.total + shift));
      });
      matches.sort((a, b) => b.compatibility.total - a.compatibility.total);
      return { matches };
    }),
    // Get detailed compatibility with specific person
    compatibility: protectedProcedure.input(z.object({ otherUserId: z.number() })).query(async ({ input, ctx }) => {
      const myProfile = getDatingProfile(ctx.user.id);
      const theirProfile = getDatingProfile(input.otherUserId);
      if (!myProfile || !theirProfile) return { error: "Both profiles needed" };
      const mySigns = {
        sun: { sign: myProfile.sun_sign },
        moon: { sign: myProfile.moon_sign },
        rising: { sign: myProfile.rising_sign },
        mercury: { sign: myProfile.mercury_sign },
        venus: { sign: myProfile.venus_sign },
        mars: { sign: myProfile.mars_sign }
      };
      const theirSigns = {
        sun: { sign: theirProfile.sun_sign },
        moon: { sign: theirProfile.moon_sign },
        rising: { sign: theirProfile.rising_sign },
        mercury: { sign: theirProfile.mercury_sign },
        venus: { sign: theirProfile.venus_sign },
        mars: { sign: theirProfile.mars_sign }
      };
      const score = calculateCompatibility(mySigns, theirSigns);
      const db_ = (await Promise.resolve().then(() => (init_db(), db_exports))).getDb();
      const me = db_.prepare("SELECT name FROM users WHERE id = ?").get(ctx.user.id);
      const them = db_.prepare("SELECT name FROM users WHERE id = ?").get(input.otherUserId);
      const prompt = generateCompatibilityPrompt(
        me?.name || "You",
        them?.name || "Them",
        score,
        mySigns,
        theirSigns
      );
      const insight = await callLLM(prompt);
      return { score, insight, myName: me?.name, theirName: them?.name };
    }),
    // Toggle profile active/inactive
    toggleActive: protectedProcedure.input(z.object({ active: z.boolean() })).mutation(async ({ input, ctx }) => {
      setProfileActive(ctx.user.id, input.active);
      return { success: true, active: input.active };
    })
  })
});
function getDailySeed() {
  const now = /* @__PURE__ */ new Date();
  return now.getFullYear() * 1e4 + (now.getMonth() + 1) * 100 + now.getDate();
}
async function checkReadingQuota(userId) {
  const sub = await getUserSubscription(userId);
  if (sub && sub.status === "active") return true;
  const todayReadings = await countTodayReadings(userId);
  return todayReadings < 1;
}

// server/_core/context.ts
var DUMMY_USER = {
  id: 1,
  openId: "mystic-local-user",
  email: "seeker@mystic-ai.com",
  name: "Mystic Seeker",
  role: "admin",
  createdAt: /* @__PURE__ */ new Date(),
  updatedAt: /* @__PURE__ */ new Date()
};
async function createContext(opts) {
  return {
    req: opts.req,
    res: opts.res,
    user: DUMMY_USER
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
async function setupVite(app, server) {
  const { nanoid } = await import("nanoid");
  const { createServer: createViteServer } = await import("vite");
  const viteConfig = (await Promise.resolve().then(() => (init_vite_config(), vite_config_exports))).default;
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const candidates = [
    path3.resolve(import.meta.dirname, "public"),
    path3.resolve(import.meta.dirname, "..", "..", "dist", "public"),
    path3.resolve(process.cwd(), "dist", "public")
  ];
  let distPath = candidates.find((p) => fs.existsSync(path3.join(p, "index.html")));
  if (!distPath) {
    const clientPath = path3.resolve(process.cwd(), "client");
    if (fs.existsSync(path3.join(clientPath, "index.html"))) {
      console.log(`Falling back to client directory: ${clientPath}`);
      app.use(express.static(clientPath));
      app.use("*", (_req, res) => res.sendFile(path3.join(clientPath, "index.html")));
      return;
    }
    console.error("No static files found at any location");
    distPath = candidates[0];
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path3.join(distPath, "index.html"));
  });
}

// server/_core/index.ts
init_db();
async function startServer() {
  try {
    ensureDummyUser();
    insertSampleProfiles();
  } catch (e) {
    console.error("DB init failed (non-fatal):", e);
  }
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.get("/health", (_req, res) => res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() }));
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3001");
  server.listen(port, () => {
    console.log(`\u{1F52E} Mystic AI running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
