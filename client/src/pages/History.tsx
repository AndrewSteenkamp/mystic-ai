import { trpc } from "@/lib/trpc";
import { Clock, Sparkles } from "lucide-react";
import { Link } from "wouter";

const typeIcons: Record<string, string> = { tarot: "🃏", numerology: "🔢", dream: "🌙", astrology: "⭐", palm: "✋", face: "👤" };
const typeLabels: Record<string, string> = { tarot: "Tarot", numerology: "Numerology", dream: "Dream", astrology: "Astrology", palm: "Palm", face: "Face" };

export default function History() {
  const { data: readings, isLoading } = trpc.divination.history.useQuery();

  if (isLoading) return (
    <div className="text-center py-12"><div className="animate-pulse-mystic text-4xl mb-4">🔮</div><p className="text-gray-400">Loading your readings...</p></div>
  );

  if (!readings || readings.length === 0) return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">📜</div>
      <h1 className="text-2xl font-bold mb-2">No Readings Yet</h1>
      <p className="text-gray-400 mb-6">Your mystical journey begins with your first reading.</p>
      <Link href="/"><div className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition-colors cursor-pointer"><Sparkles className="w-4 h-4" /> Start Your First Reading</div></Link>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📜 Your Reading History</h1>
      <div className="space-y-3">
        {(readings as any[]).map((r: any, i: number) => (
          <div key={r.id || i} className="glass-card rounded-xl p-4 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{typeIcons[r.type] || "🔮"}</span>
              <div>
                <div className="font-medium">{typeLabels[r.type] || r.type}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(r.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
            <div className="text-sm text-gray-400 truncate">"{r.query?.substring(0, 100)}"</div>
            {r.interpretation && (
              <div className="text-xs text-gray-500 mt-2 line-clamp-2">{r.interpretation?.substring(0, 200)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
