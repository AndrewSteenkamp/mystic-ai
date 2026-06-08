import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "..", "mystic.db");
const require = createRequire(import.meta.url);

let _db: any = null;
let _dbTried = false;

function loadDatabase() {
  if (_dbTried) return;
  _dbTried = true;
  try {
    const SQLite = require("better-sqlite3");
    _db = new SQLite(DB_PATH);
    console.log(`[DB] better-sqlite3 loaded. Path: ${DB_PATH}`);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
    console.log(`[DB] Schema initialized. Users: ${_db.prepare("SELECT COUNT(*) as c FROM users").get().c}`);
  } catch (e) {
    console.error(`[DB] better-sqlite3 FAILED: ${e.message}. Using SAFE MOCK — NO DATA WILL BE SAVED!`);
    _db = createSafeDb();
  }
}

// Safe DB mock that returns empty/null instead of crashing
function createSafeDb(): any {
  const noop = () => {};
  const emptyAll = () => [];
  const emptyGet = () => null;
  const emptyRun = () => ({ changes: 0 });
  const stmt = { get: emptyGet, all: emptyAll, run: emptyRun };
  return {
    prepare: () => stmt,
    pragma: noop,
    exec: noop,
  };
}

export function getDb(): any {
  loadDatabase();
  return _db;
}

function initSchema(db: Database.Database) {
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

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS lifestyle_journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      entry_type TEXT DEFAULT 'journal',
      title TEXT,
      content TEXT NOT NULL,
      mood TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS diet_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_type TEXT NOT NULL,
      meals TEXT,
      calories INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS blocked_users (
      blocker_id INTEGER NOT NULL,
      blocked_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (blocker_id, blocked_id),
      FOREIGN KEY (blocker_id) REFERENCES users(id),
      FOREIGN KEY (blocked_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL,
      reported_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      category TEXT NOT NULL,
      message_content TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (reporter_id) REFERENCES users(id),
      FOREIGN KEY (reported_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      week_start TEXT NOT NULL,
      plan_data TEXT NOT NULL,
      shopping_list TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS food_misses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_name TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'calculator',
      user_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_food_misses_name ON food_misses(food_name);

    CREATE TABLE IF NOT EXISTS food_calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      food_name TEXT NOT NULL,
      grams REAL NOT NULL,
      total_kj REAL NOT NULL,
      total_kcal REAL NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_food_calc_user ON food_calculations(user_id, created_at);

    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id INTEGER PRIMARY KEY,
      daily_source TEXT NOT NULL DEFAULT 'tarot',
      notify_daily INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS daily_insight_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      source TEXT NOT NULL,
      reference TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_daily_insight_user_date ON daily_insight_history(user_id, date);
  `);
}

// ============================================================
// USERS
// ============================================================

export function ensureDummyUser() {
  const db = getDb();
  if (!db) return;
  try {
    const existing = db.prepare("SELECT id FROM users WHERE open_id = ?").get("mystic-local-user");
    if (!existing) {
      db.prepare("INSERT INTO users (open_id, email, name, role) VALUES (?, ?, ?, ?)")
        .run("mystic-local-user", "seeker@mystic.ai", "Mystic Seeker", "admin");
    }
  } catch (e) {
    console.warn("ensureDummyUser failed:", e);
  }
}

// ============================================================
// READINGS
// ============================================================

export interface ReadingRecord {
  userId: number;
  type: string;
  query: string;
  result: string;
  interpretation: string;
}

export function saveDivinationReading(record: ReadingRecord) {
  const db = getDb();
  if (!db) {
    console.error("[DB] saveDivinationReading ABORTED — getDb() returned null/undefined. Readings are NOT being saved!");
    return;
  }
  try {
    const result = db.prepare(
      "INSERT INTO readings (user_id, type, query, result, interpretation) VALUES (?, ?, ?, ?, ?)"
    ).run(record.userId, record.type, record.query, record.result, record.interpretation);
    console.log(`[DB] Reading saved: ${record.type} for user ${record.userId} (changes: ${result.changes})`);
  } catch (e) {
    console.error("saveDivinationReading failed:", e);
  }
}

export function getUserReadings(userId: number) {
  const db = getDb();
  if (!db) return [];
  try {
    return db.prepare(
      "SELECT id, type, query, result, interpretation, created_at as createdAt FROM readings WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
    ).all(userId);
  } catch (e) {
    console.warn("getUserReadings failed:", e);
    return [];
  }
}

export function countTodayReadings(userId: number): number {
  const db = getDb();
  if (!db) return 0;
  try {
    const row = db.prepare(
      "SELECT COUNT(*) as count FROM readings WHERE user_id = ? AND date(created_at) = date('now')"
    ).get(userId) as any;
    return row?.count || 0;
  } catch (e) {
    console.warn("countTodayReadings failed:", e);
    return 0;
  }
}

// ============================================================
// SUBSCRIPTIONS
// ============================================================

export interface SubscriptionRecord {
  userId: number;
  planId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  paystackReference?: string;
}

export function saveUserSubscription(record: SubscriptionRecord) {
  const db = getDb();
  if (!db) return;
  try {
    db.prepare(
      "INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, paystack_reference) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      record.userId, record.planId, record.status,
      record.startDate.toISOString(), record.endDate.toISOString(),
      record.paystackReference || null
    );
  } catch (e) { console.warn("saveUserSubscription failed:", e); }
}

export function getUserSubscription(userId: number) {
  const db = getDb();
  if (!db) return null;
  try {
    return db.prepare(
      "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
    ).get(userId) as any;
  } catch (e) {
    console.warn("getUserSubscription failed:", e);
    return null;
  }
}

// ============================================================
// CREDITS
// ============================================================

export function incrementReadingCredits(userId: number) {
  const db = getDb();
  db.prepare(
    "INSERT INTO reading_credits (user_id, credits) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET credits = credits + 1"
  ).run(userId);
}

export function getReadingCredits(userId: number): number {
  const db = getDb();
  const row = db.prepare(
    "SELECT credits FROM reading_credits WHERE user_id = ?"
  ).get(userId) as any;
  return row?.credits || 0;
}

// ============================================================
// DATING PROFILES
// ============================================================

export interface DatingProfile {
  userId: number;
  bio?: string;
  gender?: string;
  seeking?: string;
  interests?: string;
  birthdate: string;
  birthTime?: string;
  birthPlace?: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  sunHouse?: number;
  moonHouse?: number;
  mercurySign: string;
  venusSign: string;
  marsSign: string;
  lifePath?: number;
  expression?: number;
  soulUrge?: number;
  personality?: number;
}

export function saveDatingProfile(profile: DatingProfile) {
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
    profile.userId, profile.bio, profile.gender, profile.seeking, profile.interests,
    profile.birthdate, profile.birthTime, profile.birthPlace,
    profile.sunSign, profile.moonSign, profile.risingSign, profile.sunHouse, profile.moonHouse,
    profile.mercurySign, profile.venusSign, profile.marsSign,
    profile.lifePath, profile.expression, profile.soulUrge, profile.personality
  );
}

export function getDatingProfile(userId: number) {
  const db = getDb();
  return db.prepare("SELECT * FROM dating_profiles WHERE user_id = ?").get(userId) as any;
}

export function getCompatibleProfiles(currentUserId: number, limit: number = 20) {
  const db = getDb();
  // Get all active profiles except current user's
  return db.prepare(
    "SELECT * FROM dating_profiles WHERE user_id != ? AND is_active = 1 ORDER BY created_at DESC LIMIT ?"
  ).all(currentUserId, limit) as any[];
}

export function setProfileActive(userId: number, active: boolean) {
  const db = getDb();
  db.prepare("UPDATE dating_profiles SET is_active = ?, updated_at = datetime('now') WHERE user_id = ?")
    .run(active ? 1 : 0, userId);
}

// Insert sample profiles for testing
export function insertSampleProfiles() {
  const db = getDb();
  const existing = db.prepare("SELECT COUNT(*) as c FROM dating_profiles").get() as any;
  if (existing.c > 0) return;

  const samples = [
    { name: "Luna", bio: "Artist & free spirit. Love sunsets, coffee, and deep conversations.", gender: "female", seeking: "male", interests: "art,music,spirituality,travel", birthdate: "2000-03-14", birthTime: "08:30", birthPlace: "Cape Town", lifePath: 3, expression: 7, soulUrge: 9, personality: 5, sun: "Pisces", moon: "Taurus", rising: "Gemini", sunH: 12, moonH: 2, mercury: "Aquarius", venus: "Aries", mars: "Cancer" },
    { name: "Zara", bio: "Yoga instructor finding balance in chaos. Plant mom 🌿", gender: "female", seeking: "male", interests: "yoga,wellness,nature,books", birthdate: "1997-09-22", birthTime: "16:45", birthPlace: "Durban", lifePath: 6, expression: 4, soulUrge: 2, personality: 8, sun: "Virgo", moon: "Scorpio", rising: "Capricorn", sunH: 10, moonH: 1, mercury: "Libra", venus: "Leo", mars: "Virgo" },
    { name: "Aria", bio: "Tech entrepreneur by day, stargazer by night. Looking for someone who can keep up.", gender: "female", seeking: "male", interests: "tech,astronomy,hiking,cooking", birthdate: "1995-11-08", birthTime: "22:15", birthPlace: "Johannesburg", lifePath: 8, expression: 1, soulUrge: 5, personality: 3, sun: "Scorpio", moon: "Leo", rising: "Sagittarius", sunH: 8, moonH: 5, mercury: "Scorpio", venus: "Capricorn", mars: "Aries" },
    { name: "Nadia", bio: "Bookstore owner 📚 Cat lover. Looking for my plot twist.", gender: "female", seeking: "male", interests: "literature,cats,food,photography", birthdate: "1999-06-28", birthTime: "07:00", birthPlace: "Pretoria", lifePath: 4, expression: 2, soulUrge: 6, personality: 7, sun: "Cancer", moon: "Pisces", rising: "Virgo", sunH: 4, moonH: 9, mercury: "Gemini", venus: "Taurus", mars: "Libra" },
    { name: "Kai", bio: "Surfer & marine biologist 🌊. Ocean heals everything.", gender: "male", seeking: "female", interests: "surfing,ocean,science,fitness", birthdate: "1996-02-19", birthTime: "14:20", birthPlace: "Port Elizabeth", lifePath: 5, expression: 9, soulUrge: 1, personality: 6, sun: "Aquarius", moon: "Gemini", rising: "Leo", sunH: 11, moonH: 3, mercury: "Aquarius", venus: "Pisces", mars: "Sagittarius" },
    { name: "Sage", bio: "Music producer 🎵 Good vibes only. Swipe right for deep talks & vinyl nights.", gender: "male", seeking: "female", interests: "music,vinyl,meditation,travel", birthdate: "1998-04-03", birthTime: "19:45", birthPlace: "Cape Town", lifePath: 11, expression: 5, soulUrge: 8, personality: 2, sun: "Aries", moon: "Libra", rising: "Cancer", sunH: 1, moonH: 7, mercury: "Pisces", venus: "Aries", mars: "Leo" },
    { name: "Raven", bio: "Psychologist who believes in magic. Deep thinker, soft heart.", gender: "female", seeking: "male", interests: "psychology,tarot,poetry,tea", birthdate: "2001-12-05", birthTime: "11:11", birthPlace: "Stellenbosch", lifePath: 7, expression: 33, soulUrge: 4, personality: 11, sun: "Sagittarius", moon: "Aquarius", rising: "Scorpio", sunH: 9, moonH: 3, mercury: "Scorpio", venus: "Capricorn", mars: "Virgo" },
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
    const user = getUserId.get(openId) as any;
    if (user) {
      insertProfile.run(user.id, s.bio, s.gender, s.seeking, s.interests, s.birthdate, s.birthTime, s.birthPlace,
        s.sun, s.moon, s.rising, s.sunH, s.moonH, s.mercury, s.venus, s.mars,
        s.lifePath, s.expression, s.soulUrge, s.personality);
    }
  }
  console.log(`[DB] Inserted ${samples.length} sample dating profiles`);
}

// ============================================================
// MESSAGING
// ============================================================

export function sendMessage(senderId: number, receiverId: number, content: string) {
  const db = getDb();
  if (!db) return null;
  return db.prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)").run(senderId, receiverId, content);
}

export function getConversations(userId: number) {
  const db = getDb();
  if (!db) return [];
  return db.prepare(`
    SELECT DISTINCT 
      CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_id,
      u.name as other_name,
      (SELECT content FROM messages WHERE (sender_id = ? AND receiver_id = other_id) OR (sender_id = other_id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE (sender_id = ? AND receiver_id = other_id) OR (sender_id = other_id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_time
    FROM messages m
    JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
    WHERE m.sender_id = ? OR m.receiver_id = ?
  `).all(userId, userId, userId, userId, userId, userId, userId);
}

export function getMessages(userId: number, otherUserId: number, limit = 50) {
  const db = getDb();
  if (!db) return [];
  return db.prepare(`
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC LIMIT ?
  `).all(userId, otherUserId, otherUserId, userId, limit);
}

export function markMessagesRead(userId: number, otherUserId: number) {
  const db = getDb();
  if (!db) return;
  db.prepare("UPDATE messages SET read = 1 WHERE sender_id = ? AND receiver_id = ? AND read = 0").run(otherUserId, userId);
}

// ============================================================
// LIFESTYLE
// ============================================================

export function saveJournalEntry(userId: number, title: string, content: string, mood?: string) {
  const db = getDb();
  if (!db) return null;
  return db.prepare("INSERT INTO lifestyle_journals (user_id, title, content, mood) VALUES (?, ?, ?, ?)").run(userId, title, content, mood || null);
}

export function getJournalEntries(userId: number, limit = 20) {
  const db = getDb();
  if (!db) return [];
  return db.prepare("SELECT * FROM lifestyle_journals WHERE user_id = ? ORDER BY created_at DESC LIMIT ?").all(userId, limit);
}

export function saveDietPlan(userId: number, planType: string, meals: string, calories?: number) {
  const db = getDb();
  if (!db) return null;
  return db.prepare("INSERT INTO diet_plans (user_id, plan_type, meals, calories) VALUES (?, ?, ?, ?)").run(userId, planType, meals, calories || null);
}

export function getDietPlans(userId: number) {
  const db = getDb();
  if (!db) return [];
  return db.prepare("SELECT * FROM diet_plans WHERE user_id = ? ORDER BY created_at DESC").all(userId);
}
