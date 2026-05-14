import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, BookOpen, Sparkles, ArrowRight } from "lucide-react";

/** Shown after any divination reading to gently nudge toward lifestyle features */
export default function PostReadingCTA({ readingType }: { readingType?: string }) {
  const { data: profile } = trpc.dating.myProfile.useQuery();
  const hasProfile = !!profile;

  return (
    <div className="mt-6 space-y-3">
      {/* Cosmic Matches — gentle nudge */}
      {!hasProfile && (
        <div className="glass-card rounded-xl p-4 border-pink-500/30 bg-pink-500/5 text-center">
          <div className="text-2xl mb-2">💕</div>
          <h3 className="text-sm font-bold text-pink-300 mb-1">Want Cosmic Matches?</h3>
          <p className="text-xs text-gray-400 mb-3">
            Create your dating profile. We'll match you based on your birth chart and daily energy.
          </p>
          <Link href="/dating/profile">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm px-5 py-2.5 rounded-xl cursor-pointer hover:from-pink-500 hover:to-purple-500 transition-all">
              <Heart className="w-4 h-4" /> Create Dating Profile <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>
      )}

      {/* Reflect on your reading — journal nudge */}
      <div className="glass-card rounded-xl p-4 border-purple-500/30 bg-purple-500/5 text-center">
        <div className="text-2xl mb-2">📝</div>
        <h3 className="text-sm font-bold text-purple-300 mb-1">Capture This Moment</h3>
        <p className="text-xs text-gray-400 mb-3">
          {readingType
            ? `Write down what this ${readingType} reading revealed. Journaling deepens insight.`
            : "Write down what this reading revealed. Journaling deepens insight."}
        </p>
        <Link href="/lifestyle">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm px-5 py-2.5 rounded-xl cursor-pointer hover:from-purple-500 hover:to-indigo-500 transition-all">
            <BookOpen className="w-4 h-4" /> Open Journal <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      </div>

      {/* Breathe — meditation nudge */}
      <div className="glass-card rounded-xl p-4 border-indigo-500/30 bg-indigo-500/5 text-center">
        <div className="text-2xl mb-2">🧘</div>
        <h3 className="text-sm font-bold text-indigo-300 mb-1">Center Yourself</h3>
        <p className="text-xs text-gray-400 mb-3">
          A short meditation can help you integrate the wisdom you've received.
        </p>
        <Link href="/lifestyle">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm px-5 py-2.5 rounded-xl cursor-pointer hover:from-indigo-500 hover:to-blue-500 transition-all">
            <Sparkles className="w-4 h-4" /> Try Meditation <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      </div>
    </div>
  );
}
