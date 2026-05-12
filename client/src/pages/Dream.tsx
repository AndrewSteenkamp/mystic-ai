import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import PostReadingCTA from "@/components/PostReadingCTA";

export default function DreamPage() {
  const [dream, setDream] = useState("");
  const [reading, setReading] = useState<any>(null);
  const [error, setError] = useState("");
  const mutate = trpc.divination.dreamRead.useMutation({
    onSuccess: (data) => {
      if ((data as any).error) setError((data as any).message);
      else { setReading(data); setError(""); }
    },
    onError: (err) => setError(err.message),
  });
  const handleRead = () => {
    if (dream.length < 5) { setError("Please describe your dream in more detail"); return; }
    setError(""); mutate.mutate({ dream });
  };
  if (reading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🌙 Dream Interpretation</h1>
          <button onClick={() => setReading(null)} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> New Dream</button>
        </div>
        <div className="glass-card rounded-xl p-4 mb-4">
          <div className="text-xs text-gray-500 mb-1">Your Dream:</div>
          <p className="text-gray-300 italic text-sm">"{reading.dream || dream}"</p>
        </div>
        {reading.symbols?.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-purple-300 mb-2">Detected Symbols</div>
            <div className="flex flex-wrap gap-2">
              {reading.symbols.map((s: any, i: number) => (
                <span key={i} className="text-xs bg-indigo-900/40 border border-indigo-700/50 px-2 py-1 rounded-full">{s.word}</span>
              ))}
            </div>
          </div>
        )}
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
      <h1 className="text-2xl font-bold mb-2">🌙 Dream Interpretation</h1>
      <p className="text-gray-400 mb-6">Describe your dream and uncover its hidden messages.</p>
      <div className="space-y-4 mb-6">
        <textarea value={dream} onChange={e => setDream(e.target.value)} placeholder="Describe your dream in as much detail as you remember... What happened? How did you feel? Who or what appeared?"
          className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:border-purple-500 outline-none h-32 resize-none" />
        {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">{error}</div>}
        <button onClick={handleRead} disabled={mutate.isPending}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-lg font-medium hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {mutate.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing dream...</> : <><Sparkles className="w-4 h-4" /> Interpret My Dream</>}
        </button>
      </div>
    </div>
  );
}
