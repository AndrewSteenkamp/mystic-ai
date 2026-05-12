import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import PostReadingCTA from "@/components/PostReadingCTA";

export default function AstrologyPage() {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [reading, setReading] = useState<any>(null);
  const [error, setError] = useState("");

  const mutate = trpc.divination.astrologyRead.useMutation({
    onSuccess: (data) => {
      if ((data as any).error) setError((data as any).message);
      else { setReading(data); setError(""); }
    },
    onError: (err) => setError(err.message),
  });

  const handleRead = () => {
    if (!name || !birthdate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setError("Please enter your name and birthdate (YYYY-MM-DD)");
      return;
    }
    setError("");
    mutate.mutate({ name, birthdate, birthTime: birthTime || null, birthPlace: birthPlace || null });
  };

  if (reading) {
    const s = reading.signes || reading.signs;
    const big3 = [
      { label: "Sun", key: "sun", emoji: "☀️" },
      { label: "Moon", key: "moon", emoji: "🌙" },
      { label: "Rising", key: "rising", emoji: "⬆️" },
    ];
    const planets = [
      { label: "Mercury", key: "mercury", emoji: "☿" },
      { label: "Venus", key: "venus", emoji: "♀" },
      { label: "Mars", key: "mars", emoji: "♂" },
    ];
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">⭐ Your Birth Chart</h1>
          <button onClick={() => setReading(null)} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> New Chart
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {big3.map(b => (
            <div key={b.key} className="glass-card rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400">{b.emoji} {b.label}</div>
              <div className="text-2xl font-bold text-purple-300 mt-1">{s?.[b.key]?.sign}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {planets.map(p => (
            <div key={p.key} className="glass-card rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500">{p.emoji} {p.label}</div>
              <div className="text-lg font-semibold text-purple-400">{s?.[p.key]?.sign}</div>
            </div>
          ))}
        </div>
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-bold mb-3">✨ Your Reading</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{reading.interpretation}</div>
        </div>
        <PostReadingCTA />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">⭐ Astrology Birth Chart</h1>
      <p className="text-gray-400 mb-6">Your complete cosmic blueprint — Sun, Moon, Rising & planets.</p>
      <div className="space-y-4 mb-6">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:border-purple-500 outline-none" />
        <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 focus:border-purple-500 outline-none" />
        <input value={birthTime} onChange={e => setBirthTime(e.target.value)} placeholder="Birth Time (optional, e.g. 14:30)" className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:border-purple-500 outline-none" />
        <input value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="Birth Place (optional)" className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:border-purple-500 outline-none" />
        {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">{error}</div>}
        <button
          onClick={handleRead}
          disabled={mutate.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {mutate.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Reading the stars...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Reveal My Chart</>
          )}
        </button>
      </div>
    </div>
  );
}
