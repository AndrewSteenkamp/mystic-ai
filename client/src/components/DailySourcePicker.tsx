import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Check, Sparkles, ChevronRight, Loader2 } from "lucide-react";

/**
 * Daily source picker — lets the user pick which tradition their daily
 * insight comes from. Default = tarot. The choice is persisted to the
 * server (user_preferences.daily_source) and used by the dailyAnchor
 * procedure to seed the Home page card.
 */
export default function DailySourcePicker() {
  const { data: sources, isLoading } = trpc.lifestyle.getDailySources.useQuery();
  const { data: mySource, refetch: refetchMine } = trpc.lifestyle.myDailySource.useQuery();
  const setMutation = trpc.lifestyle.setMyDailySource.useMutation();
  const [showAll, setShowAll] = useState(false);

  const currentId = mySource?.source || "tarot";

  const handlePick = async (sourceId: string) => {
    try {
      await setMutation.mutateAsync({ source: sourceId });
      await refetchMine();
    } catch (e) {
      // ignored
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading daily sources...
        </div>
      </div>
    );
  }

  if (!sources) return null;

  const current = sources.find((s: any) => s.id === currentId) || sources[0];
  const visible = showAll ? sources : sources.slice(0, 4);

  return (
    <div className="glass-card rounded-2xl p-5 border-amber-700/30 bg-gradient-to-br from-amber-900/10 via-purple-900/5 to-pink-900/10">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <div className="text-xs uppercase tracking-widest text-amber-300/80 font-bold">Daily Source</div>
      </div>
      <p className="text-[11px] text-gray-400 mb-3">
        Pick where today's insight comes from. Change it any time.
      </p>

      {/* Current selection */}
      <div className="flex items-center gap-3 p-3 bg-amber-900/20 border border-amber-700/30 rounded-xl mb-3">
        <div className="text-2xl">{current.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-100">{current.name}</div>
          <div className="text-[11px] text-amber-200/70 truncate">{current.description}</div>
        </div>
        <Check className="w-4 h-4 text-amber-300 flex-shrink-0" />
      </div>

      {/* Picker grid */}
      <div className="grid grid-cols-2 gap-2">
        {visible.map((s: any) => (
          <button
            key={s.id}
            onClick={() => handlePick(s.id)}
            disabled={setMutation.isPending}
            className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all border ${
              s.id === currentId
                ? "bg-amber-900/30 border-amber-500/50 text-amber-100"
                : "bg-gray-900/40 border-gray-700/50 text-gray-300 hover:border-amber-700/40 hover:bg-gray-800/50"
            }`}
          >
            <div className="text-lg flex-shrink-0">{s.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{s.name}</div>
            </div>
            {s.id === currentId && <Check className="w-3 h-3 text-amber-300 flex-shrink-0" />}
          </button>
        ))}
      </div>

      {sources.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 w-full text-[11px] text-amber-300/70 hover:text-amber-300 flex items-center justify-center gap-1 py-1.5"
        >
          {showAll ? "Show less" : `Show all ${sources.length} sources`}
          <ChevronRight className={`w-3 h-3 transition-transform ${showAll ? "rotate-90" : ""}`} />
        </button>
      )}

      <div className="text-[10px] text-gray-500 mt-3 italic">
        {mySource?.isDefault
          ? "You're seeing the default (Tarot). Pick a source to personalize your daily insight."
          : `Your daily insight comes from ${current.name}. Open the app tomorrow for a different entry from the same source.`}
      </div>
    </div>
  );
}
