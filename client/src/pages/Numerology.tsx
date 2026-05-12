import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import PostReadingCTA from "@/components/PostReadingCTA";

export default function NumerologyPage() {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [reading, setReading] = useState<any>(null);
  const [error, setError] = useState("");

  const mutate = trpc.divination.numerologyRead.useMutation({
    onSuccess: (data) => {
      if ((data as any).error) setError((data as any).message);
      else { setReading(data); setError(""); }
    },
    onError: (err) => setError(err.message),
  });

  const handleRead = () => {
    if (!name || !birthdate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setError("Please enter your full name and birthdate (YYYY-MM-DD)"); return;
    }
    setError("");
    mutate.mutate({ name, birthdate });
  };

  if (reading) {
    const nums = reading.numbers;
    const numberCards = [
      { label: "Life Path", key: "lifePath", emoji: "🛤️" },
      { label: "Expression", key: "expression", emoji: "💫" },
      { label: "Soul Urge", key: "soulUrge", emoji: "💜" },
      { label: "Personality", key: "personality", emoji: "🎭" },
      { label: "Birthday", key: "birthday", emoji: "🎂" },
    ];

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🔢 Your Numerology Chart</h1>
          <button onClick={() => setReading(null)} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> New Reading
          </button>
        </div>
        <p className="text-gray-400 mb-4">Name: <span className="text-purple-300">{reading.name}</span> • Born: <span className="text-purple-300">{reading.birthdate}</span></p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {numberCards.map(card => {
            const n = nums[card.key];
            const isMaster = [11,22,33].includes(n.value);
            return (
              <div key={card.key} className={`glass-card rounded-xl p-4 text-center ${isMaster ? "border-amber-500/50 ring-1 ring-amber-500/30" : ""}`}>
                <div className="text-sm text-gray-400 mb-1">{card.emoji} {card.label}</div>
                <div className={`text-4xl font-bold ${isMaster ? "text-amber-400" : "text-purple-300"}`}>
                  {n.value}
                  {isMaster && <div className="text-xs font-normal text-amber-400/70 mt-1">Master Number</div>}
                </div>
                <div className="text-xs text-gray-500 mt-2 leading-relaxed">{n.meaning.split(".")[0]}.</div>
              </div>
            );
          })}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-bold mb-3">✨ Your Numerology Reading</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{reading.interpretation}</div>
        </div>
        <PostReadingCTA />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">🔢 Numerology</h1>
      <p className="text-gray-400 mb-6">Discover your Life Path, Expression, Soul Urge, and Personality numbers.</p>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., John David Smith"
            className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:border-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Birthdate</label>
          <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)}
            className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 focus:border-purple-500 outline-none" />
        </div>
        {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">{error}</div>}
        <button onClick={handleRead} disabled={mutate.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-medium hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {mutate.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</> : <><Sparkles className="w-4 h-4" /> Reveal My Numbers</>}
        </button>
      </div>
    </div>
  );
}
