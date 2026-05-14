import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Sparkles, Heart, ArrowRight } from "lucide-react";

const methods = [
  { href: "/tarot", icon: "🃏", title: "Tarot Cards", desc: "Draw cards. Reveal your path.", color: "from-amber-500/20 to-amber-600/10 border-amber-500/30", glow: "shadow-amber-500/10" },
  { href: "/numerology", icon: "🔢", title: "Numerology", desc: "Your life path decoded.", color: "from-blue-500/20 to-blue-600/10 border-blue-500/30", glow: "shadow-blue-500/10" },
  { href: "/astrology", icon: "⭐", title: "Astrology", desc: "Your cosmic blueprint.", color: "from-purple-500/20 to-purple-600/10 border-purple-500/30", glow: "shadow-purple-500/10" },
  { href: "/dream", icon: "🌙", title: "Dreams", desc: "What your dreams mean.", color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30", glow: "shadow-indigo-500/10" },
  { href: "/palm", icon: "✋", title: "Palm Reading", desc: "What your hands reveal.", color: "from-rose-500/20 to-rose-600/10 border-rose-500/30", glow: "shadow-rose-500/10" },
  { href: "/face", icon: "👤", title: "Face Reading", desc: "Ancient Mian Xiang.", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30", glow: "shadow-emerald-500/10" },
];

export default function Home() {
  const { data: profile } = trpc.dating.myProfile.useQuery();

  return (
    <div className="max-w-lg mx-auto relative">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-40 left-1/4 w-1 h-1 bg-amber-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: "1s" }} />
        <div className="absolute top-60 right-12 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: "0.3s" }} />
        <div className="absolute top-80 left-16 w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse opacity-50" style={{ animationDelay: "0.7s" }} />
      </div>

      {/* Hero */}
      <div className="text-center mb-8 relative">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative text-6xl animate-float">
            🔮
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
            Mystic AI
          </span>
        </h1>
        <p className="text-sm text-purple-200/60 mb-6 max-w-xs mx-auto leading-relaxed">
          Your first reading is free. Peer into the cosmic mirror and discover what the universe whispers.
        </p>

        {profile ? (
          <div className="space-y-3">
            <Link href="/dating">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-500 hover:to-purple-500 transition-all cursor-pointer shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 active:scale-95">
                <Heart className="w-4 h-4" /> View Your Cosmic Matches <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
            <p className="text-xs text-purple-300/40">Your star-aligned matches await</p>
          </div>
        ) : (
          <div className="inline-block bg-purple-900/20 border border-purple-500/30 rounded-xl px-5 py-3 text-sm text-purple-200 max-w-xs">
            <span className="font-bold text-purple-300">✨ Free Daily Reading</span>
            <p className="text-xs text-purple-300/50 mt-1">Choose a method below. After your reading, create a profile for cosmic matches.</p>
          </div>
        )}
      </div>

      {/* Divination Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {methods.map((m) => (
          <Link key={m.href} href={m.href}>
            <div className={`bg-gradient-to-br ${m.color} border rounded-2xl p-4 cursor-pointer hover:scale-[1.03] transition-all duration-200 active:scale-95 text-center h-full group hover:shadow-lg ${m.glow}`}>
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{m.icon}</div>
              <div className="text-sm font-bold text-gray-100 mb-0.5">{m.title}</div>
              <div className="text-xs text-gray-400">{m.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Dating CTA */}
      {!profile && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-indigo-900/30 border border-pink-500/20 p-5 mb-6 text-center">
          <div className="absolute top-0 right-0 text-4xl opacity-20">💕</div>
          <div className="relative">
            <div className="text-lg font-bold text-pink-200 mb-1 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" /> Cosmic Dating
            </div>
            <p className="text-xs text-pink-200/60 mb-3">
              Create your profile after any reading. Get matched by the stars, moon, and numbers.
            </p>
            <p className="text-xs text-purple-400 flex items-center justify-center gap-1">
              <ArrowRight className="w-3 h-3" /> Start with a free reading above
            </p>
          </div>
        </div>
      )}

      {/* Wellness CTA — always visible */}
      <Link href="/lifestyle">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-cyan-900/30 border border-emerald-500/20 p-5 mb-6 text-center cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95">
          <div className="absolute top-0 right-0 text-4xl opacity-20">🌿</div>
          <div className="relative">
            <div className="text-lg font-bold text-emerald-200 mb-1 flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Lifestyle & Wellness
            </div>
            <p className="text-xs text-emerald-200/60 mb-3">
              Journal your thoughts, plan meals, meditate, and shop wellness products — your daily sanctuary.
            </p>
            <p className="text-xs text-emerald-400 flex items-center justify-center gap-1">
              <ArrowRight className="w-3 h-3" /> Open your wellness space
            </p>
          </div>
        </div>
      </Link>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 pb-8">
        <p>🔮 For entertainment purposes. AI-generated insights, not professional advice.</p>
      </div>
    </div>
  );
}
