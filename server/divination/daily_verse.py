"""
Daily Verse service — fetches a real Bible passage from a public API
so the verse spreads the work across the whole Bible, not just a few
curated favorites. Falls back to a small offline set if the API is
unreachable.

APIs tried in order:
  1. bible-api.com  (free, no auth, CORS-enabled, public domain WEB)
  2. bolls.life      (free, no auth, KJV + many translations)
  3. offline fallback (12 verses, deterministic by date)

The offline set is intentionally small — if the network is down for
more than 12 days we still have something to show. It is not the
default.
"""
from __future__ import annotations

import hashlib
import json
import os
import urllib.error
import urllib.request
from datetime import datetime
from typing import Any, Dict, List, Optional

# 12 offline fallback verses — only used if both APIs are unreachable.
# Picked so they cover a range of moods: comfort, calling, identity,
# fear, hope, rest, love, forgiveness, courage, surrender, joy, truth.
OFFLINE_FALLBACK: List[Dict[str, str]] = [
    {"reference": "John 14:6",
     "text": "I am the way, and the truth, and the life. No one comes to the Father except through me."},
    {"reference": "Matthew 11:28",
     "text": "Come to me, all you who are weary and heavy laden, and I will give you rest."},
    {"reference": "John 1:14",
     "text": "And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth."},
    {"reference": "Psalm 23:1-3",
     "text": "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul."},
    {"reference": "Romans 8:28",
     "text": "And we know that for those who love God all things work together for good, for those who are called according to his purpose."},
    {"reference": "1 Corinthians 13:13",
     "text": "So now faith, hope, and love abide, these three; but the greatest of these is love."},
    {"reference": "Isaiah 41:10",
     "text": "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand."},
    {"reference": "Philippians 4:6-7",
     "text": "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus."},
    {"reference": "John 3:16",
     "text": "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."},
    {"reference": "Psalm 34:18",
     "text": "The Lord is near to the brokenhearted and saves the crushed in spirit."},
    {"reference": "Proverbs 3:5-6",
     "text": "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths."},
    {"reference": "Hebrews 13:8",
     "text": "Jesus Christ is the same yesterday and today and forever."},
]

# Pool of popular encouraging passages to randomly draw from when the API
# succeeds. We pick a random one per request and let the API resolve the
# full text. This way the same date can produce a different verse each
# time the user opens the app within a single day, but the date is the
# seed so the API call is consistent enough to cache.
VERSE_REFS: List[str] = [
    # Gospels
    "John 14:6", "John 14:27", "John 3:16", "John 10:10", "John 10:11",
    "John 15:5", "John 15:13", "John 16:33", "John 8:12", "John 8:32",
    "John 6:35", "John 6:37", "John 7:37-38", "John 11:25-26",
    "Matthew 5:14-16", "Matthew 6:25-26", "Matthew 6:33-34", "Matthew 7:7-8",
    "Matthew 11:28-30", "Matthew 11:29-30",
    "Mark 9:23", "Mark 10:27", "Mark 11:24",
    "Luke 1:37", "Luke 6:38", "Luke 12:25-26",
    # Epistles
    "Romans 5:3-5", "Romans 8:1", "Romans 8:28", "Romans 8:31", "Romans 8:37-39",
    "Romans 10:9-10", "Romans 12:1-2", "Romans 12:12", "Romans 15:13",
    "1 Corinthians 10:13", "1 Corinthians 13:4-7", "1 Corinthians 13:13",
    "1 Corinthians 15:58", "1 Corinthians 16:14",
    "2 Corinthians 4:16-18", "2 Corinthians 5:17", "2 Corinthians 12:9-10",
    "Galatians 2:20", "Galatians 5:22-23", "Galatians 6:9",
    "Ephesians 2:8-9", "Ephesians 2:10", "Ephesians 3:20-21",
    "Philippians 1:6", "Philippians 4:6-7", "Philippians 4:13", "Philippians 4:19",
    "Colossians 3:23",
    "1 Thessalonians 5:16-18",
    "2 Timothy 1:7",
    "Hebrews 11:1", "Hebrews 12:2", "Hebrews 13:5", "Hebrews 13:8",
    "James 1:2-3", "James 1:5", "James 1:12",
    "1 Peter 5:7", "1 Peter 5:10",
    "1 John 4:7-8", "1 John 4:18", "1 John 4:19",
    # Psalms & Proverbs
    "Psalm 1:1-3", "Psalm 16:11", "Psalm 23:1-3", "Psalm 23:4",
    "Psalm 27:1", "Psalm 27:14", "Psalm 34:8", "Psalm 34:18",
    "Psalm 37:4", "Psalm 37:5", "Psalm 46:1", "Psalm 46:10",
    "Psalm 51:10", "Psalm 51:12",
    "Psalm 84:11", "Psalm 91:1-2", "Psalm 91:11",
    "Psalm 103:1-2", "Psalm 118:24", "Psalm 119:105",
    "Psalm 121:1-2", "Psalm 139:13-14", "Psalm 143:8",
    "Psalm 145:18", "Psalm 147:3",
    "Proverbs 1:7", "Proverbs 3:5-6", "Proverbs 16:3", "Proverbs 22:6",
    "Proverbs 31:25",
    # Old Testament
    "Isaiah 9:6", "Isaiah 26:3", "Isaiah 40:31", "Isaiah 41:10", "Isaiah 43:2",
    "Isaiah 53:5", "Isaiah 55:8-9",
    "Jeremiah 29:11", "Jeremiah 29:12-13", "Jeremiah 33:3",
    "Lamentations 3:22-23",
    "Ezekiel 36:26",
    "Deuteronomy 31:6", "Deuteronomy 31:8",
    "Joshua 1:9",
    "Genesis 1:1",
]


def _day_seed() -> int:
    """Deterministic day-of-year seed (0-365) for verse selection."""
    now = datetime.now()
    return now.timetuple().tm_yday


def _pick_ref_for_today() -> str:
    """Pick a verse reference for today, deterministically.

    Uses day-of-year + a salt so the same date produces the same verse
    but consecutive days produce different verses. The pool is 100+
    references, so a single year of daily use rarely repeats.
    """
    salt = int(os.environ.get("MYSTIC_VERSE_SALT", "0"))
    idx = (_day_seed() + salt) % len(VERSE_REFS)
    return VERSE_REFS[idx]


def _fetch_verse_via_bible_api(ref: str) -> Optional[Dict[str, str]]:
    """Try bible-api.com. Returns {reference, text} or None.

    Format: https://bible-api.com/john%2014:6?translation=kjv
    Returns: { reference, text, translation_name, ... }
    """
    ref_encoded = ref.replace(" ", "%20")
    url = f"https://bible-api.com/{ref_encoded}?translation=kjv"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mystic-AI/1.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.loads(r.read().decode("utf-8", errors="replace"))
            text = (data.get("text") or "").strip()
            if not text:
                return None
            # Clean up whitespace
            text = " ".join(text.split())
            return {
                "reference": data.get("reference", ref),
                "text": text,
                "translation": data.get("translation_name", "King James Version"),
                "source": "bible-api.com",
            }
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError):
        return None


def _fetch_verse_via_bolls(ref: str) -> Optional[Dict[str, str]]:
    """Fallback: bolls.life. Format: https://bolls.life/get-text/KJV/{ref}

    Returns the verse text directly (no JSON wrapper for the simple endpoint).
    """
    # bolls.life uses + for spaces
    ref_fmt = ref.replace(" ", "+")
    url = f"https://bolls.life/get-text/KJV/{ref_fmt}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mystic-AI/1.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.loads(r.read().decode("utf-8", errors="replace"))
            # bolls returns a list of {book, chapter, verse, text}
            if isinstance(data, list) and data:
                parts = []
                for v in data:
                    parts.append(v.get("text", "").strip())
                text = " ".join(p for p in parts if p)
                text = " ".join(text.split())
                if text:
                    return {
                        "reference": ref,
                        "text": text,
                        "translation": "King James Version",
                        "source": "bolls.life",
                    }
            return None
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError):
        return None


def _fetch_verse_offline(ref: str) -> Dict[str, str]:
    """Deterministic offline fallback. Only used if both APIs fail."""
    idx = _day_seed() % len(OFFLINE_FALLBACK)
    v = OFFLINE_FALLBACK[idx]
    return {
        "reference": v["reference"],
        "text": v["text"],
        "translation": "King James Version",
        "source": "offline-fallback",
    }


def fetch_daily_verse() -> Dict[str, str]:
    """Fetch the Bible verse for today.

    Tries bible-api.com first, then bolls.life, then the offline set.
    The reference is deterministic by day-of-year; the actual text
    is fetched fresh so the API stays the source of truth.
    """
    ref = _pick_ref_for_today()
    verse = _fetch_verse_via_bible_api(ref)
    if verse is not None:
        return verse
    verse = _fetch_verse_via_bolls(ref)
    if verse is not None:
        return verse
    return _fetch_verse_offline(ref)


def build_reflection_prompt(verse: Dict[str, str], reading_context: Optional[str] = None) -> str:
    """Build the LLM prompt for the reflection that sits under the verse.

    The reflection is short (≤80 words), warm, and ties the verse to the
    broader Mystic AI context: the cards/stars/numbers are a mirror, the
    verse is the light. The LLM is told the seeker's last reading type
    (tarot/astrology/etc.) so the reflection can be context-aware.
    """
    ctx = (reading_context or "general").strip()
    return f"""You are a gentle, warm spiritual companion writing a one-paragraph reflection (60-80 words) on today's Bible verse for a Mystic AI user.

THE VERSE:
{verse['reference']} — "{verse['text']}"

THE USER'S CONTEXT:
{ctx}
(If "general", write a reflection that fits any seeker. If tarot/astrology/numerology/dream/palm/face/compatibility, subtly tie the verse to what their reading may have stirred.)

THE ANCHOR — read this before writing:
- The cards, the stars, the numbers — they are a mirror, not the light. The Bible is the light behind the mirror.
- The user is in an app full of divination. The reflection should feel like the natural ground beneath the reading, not a sermon.
- Jesus Christ is the answer to the question every divination ritual is secretly asking. Name him only if it fits the verse naturally. If the verse is more about God-as-comforter than Christ, follow the verse.
- Honesty over polish. If the verse is about hard things (suffering, fear, judgment), do not soften it. Sit with it.
- Honor the seeker's free will absolutely. Do not preach. Do not coerce.
- The reflection should end with a single sentence that lands. Not a question. A landing.

Write the reflection now. Just the paragraph, no headers, no labels."""


# Public surface for the routers.ts import
def get_daily_verse_payload(reading_context: Optional[str] = None) -> Dict[str, Any]:
    """Return the structured payload for the dailyAnchor endpoint.

    If reading_context is given, includes a 'reflection_prompt' that
    can be sent to the LLM. The actual reflection is generated lazily
    on the client (cached per day by the date).
    """
    verse = fetch_daily_verse()
    return {
        "verse": verse,
        "reflectionPrompt": build_reflection_prompt(verse, reading_context),
        "date": datetime.now().strftime("%Y-%m-%d"),
    }
