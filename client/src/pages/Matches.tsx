import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Heart, Sparkles, Star, Loader2 } from "lucide-react";

const SIGN_EMOJI: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

export default function MatchesPage() {
  const { data, isLoading } = trpc.dating.matches.useQuery();
  const { data: myProfile } = trpc.dating.myProfile.useQuery();
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const compatQuery = trpc.dating.compatibility.useQuery(
    { otherUserId: selectedMatch! },
    { enabled: !!selectedMatch }
  );

  if (isLoading) return (
    <div className="text-center py-12"><div className="animate-pulse-mystic text-4xl mb-4">💕</div><p className="text-gray-400">Loading your cosmic matches...</p></div>
  );

  if ((data as any)?.error) return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">💫</div>
      <h1 className="text-2xl font-bold mb-2">Create Your Profile First</h1>
      <p className="text-gray-400 mb-6">Set up your dating profile to discover cosmic matches.</p>
      <Link href="/dating/profile"><div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-purple-500 hover:to-pink-500"><Heart className="w-4 h-4" /> Create Profile</div></Link>
    </div>
  );

  const matches = (data as any)?.matches || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">💕 Cosmic Matches</h1>
          <p className="text-gray-400 text-sm">Sorted by astrological compatibility</p>
        </div>
        <Link href="/dating/profile"><div className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1">✏️ Edit Profile</div></Link>
      </div>

      {myProfile && (
        <div className="glass-card rounded-xl p-4 mb-6 text-center">
          <div className="text-xs text-gray-500 mb-1">Your Signs</div>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span>☀️ {myProfile.sun_sign}</span>
            <span>🌙 {myProfile.moon_sign}</span>
            <span>⬆️ {myProfile.rising_sign}</span>
            <span className="text-purple-400">|</span>
            <span>Life Path {myProfile.life_path}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((m: any) => {
          const score = m.compatibility;
          const tier = score.total >= 85 ? "cosmic" : score.total >= 70 ? "excellent" : score.total >= 55 ? "good" : "interesting";
          const tierColor = score.total >= 85 ? "text-amber-400" : score.total >= 70 ? "text-green-400" : score.total >= 55 ? "text-blue-400" : "text-gray-400";
          const tierBg = score.total >= 85 ? "bg-amber-500/20 border-amber-500/40" : score.total >= 70 ? "bg-green-500/20 border-green-500/40" : score.total >= 55 ? "bg-blue-500/20 border-blue-500/40" : "bg-gray-500/20 border-gray-500/40";

          return (
            <div key={m.userId} className={`glass-card rounded-xl p-5 relative overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/10`}>
              {/* Compatibility badge */}
              <div className={`absolute top-3 right-3 ${tierBg} border rounded-full px-3 py-1 text-xs font-bold ${tierColor}`}>
                {score.total}%
              </div>

              <div className="mb-3">
                <h3 className="text-lg font-bold">{m.name}</h3>
                <p className="text-xs text-gray-500">
                  ☀️ {m.signs.sun} {SIGN_EMOJI[m.signs.sun]} · 🌙 {m.signs.moon} · ⬆️ {m.signs.rising} · LP {m.lifePath}
                </p>
              </div>

              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{m.bio}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {m.interests?.split(",").map((i: string) => (
                  <span key={i} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">{i.trim()}</span>
                ))}
              </div>

              {/* Compatibility breakdown */}
              <div className="grid grid-cols-3 gap-1 mb-3 text-center">
                <div><div className="text-xs text-gray-500">☀️ Sun</div><div className="text-sm font-bold">{score.breakdown.sun}/25</div></div>
                <div><div className="text-xs text-gray-500">🌙 Moon</div><div className="text-sm font-bold">{score.breakdown.moon}/25</div></div>
                <div><div className="text-xs text-gray-500">♀ Venus</div><div className="text-sm font-bold">{score.breakdown.venus}/15</div></div>
              </div>

              <p className="text-xs text-gray-500 italic mb-3">{score.summary}</p>

              <button
                onClick={() => setSelectedMatch(selectedMatch === m.userId ? null : m.userId)}
                className="w-full text-center text-sm bg-purple-900/40 hover:bg-purple-800/40 text-purple-300 py-2 rounded-lg transition-colors"
              >
                {selectedMatch === m.userId ? "Hide Details" : "✨ View Cosmic Connection"}
              </button>

              {selectedMatch === m.userId && (
                <div className="mt-3 pt-3 border-t border-purple-800/50">
                  {compatQuery.isLoading ? (
                    <div className="text-center py-2"><Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-400" /></div>
                  ) : compatQuery.data ? (
                    <div>
                      <p className="text-sm text-gray-300 leading-relaxed italic">{(compatQuery.data as any).insight}</p>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {score.highlights.map((h: string, i: number) => (
                          <div key={i} className="text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded-full">✨ {h}</div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
