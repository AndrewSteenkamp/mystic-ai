import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, ArrowRight } from "lucide-react";

/** Shown after any divination reading to prompt profile creation */
export default function PostReadingCTA() {
  const { data: profile } = trpc.dating.myProfile.useQuery();

  if (profile) return null; // Already has profile

  return (
    <div className="mt-6 glass-card rounded-xl p-4 border-pink-500/30 bg-pink-500/5 text-center">
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
  );
}
