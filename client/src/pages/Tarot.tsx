import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import PostReadingCTA from "@/components/PostReadingCTA";

const SPREADS = [
  { value: "single", label: "Single Card", desc: "Quick insight on one question" },
  { value: "three", label: "Three Card Spread", desc: "Past • Present • Future" },
];

export default function TarotPage() {
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState<"single" | "three">("three");
  const [reading, setReading] = useState<any>(null);
  const [error, setError] = useState("");

  const readMutation = trpc.divination.tarotRead.useMutation({
    onSuccess: (data) => {
      if ((data as any).error) {
        setError((data as any).message);
      } else {
        setReading(data);
        setError("");
      }
    },
    onError: (err) => setError(err.message),
  });

  const handleRead = () => {
    if (question.length < 3) { setError("Please ask a meaningful question"); return; }
    setError("");
    readMutation.mutate({ question, spreadType });
  };

  if (reading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🃏 Your Tarot Reading</h1>
          <button onClick={() => setReading(null)} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> New Reading
          </button>
        </div>
        <p className="text-gray-400 mb-4 italic">Question: "{reading.question || question}"</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {reading.cards?.map((c: any, i: number) => (
            <div key={i} className="glass-card rounded-xl p-4 text-center">
              <div className="text-xs text-purple-400 uppercase tracking-wider mb-2">{c.position}</div>
              <div className="text-3xl font-bold mb-1">{c.card.name}</div>
              <div className={`text-xs font-medium mb-2 ${c.reversed ? "text-red-400" : "text-green-400"}`}>
                {c.reversed ? "⬇ Reversed" : "⬆ Upright"}
              </div>
              <div className="flex gap-1 justify-center flex-wrap">
                {c.card.keywords?.map((k: string) => (
                  <span key={k} className="text-xs bg-purple-900/50 px-2 py-0.5 rounded-full">{k}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-bold mb-3">✨ Interpretation</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{reading.interpretation}</div>
        </div>
        <PostReadingCTA />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">🃏 Tarot Reading</h1>
      <p className="text-gray-400 mb-6">Ask a question and let the cards reveal your path.</p>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Your Question</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What would you like guidance on? E.g., 'What should I focus on in my career?'"
            className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none h-24 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Spread Type</label>
          <div className="grid grid-cols-2 gap-3">
            {SPREADS.map(s => (
              <button
                key={s.value}
                onClick={() => setSpreadType(s.value as any)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  spreadType === s.value
                    ? "border-purple-500 bg-purple-900/30"
                    : "border-gray-800 bg-gray-900 hover:border-gray-700"
                }`}
              >
                <div className="font-medium text-sm">{s.label}</div>
                <div className="text-xs text-gray-500">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">{error}</div>}

        <button
          onClick={handleRead}
          disabled={readMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {readMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Consulting the cards...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Reveal My Reading</>
          )}
        </button>
      </div>
    </div>
  );
}
