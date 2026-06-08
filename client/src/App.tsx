import { Switch, Route, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Home from "@/pages/Home";
import TarotPage from "@/pages/Tarot";
import NumerologyPage from "@/pages/Numerology";
import DreamPage from "@/pages/Dream";
import AstrologyPage from "@/pages/Astrology";
import PalmPage from "@/pages/Palm";
import FacePage from "@/pages/Face";
import History from "@/pages/History";
import MatchesPage from "@/pages/Matches";
import DatingProfilePage from "@/pages/DatingProfile";
import ChatPage from "@/pages/Chat";
import LifestylePage from "@/pages/Lifestyle";
import { useState } from "react";
import { ChevronDown, Sparkles, Leaf } from "lucide-react";

export default function App() {
  const { data: user } = trpc.auth.me.useQuery();
  const [location] = useLocation();
  const [openMenu, setOpenMenu] = useState<null | "divination" | "lifestyle">(null);

  const divinationItems = [
    { href: "/tarot", label: "Tarot", emoji: "🃏" },
    { href: "/numerology", label: "Numerology", emoji: "🔢" },
    { href: "/astrology", label: "Astrology", emoji: "⭐" },
    { href: "/dream", label: "Dreams", emoji: "🌙" },
    { href: "/palm", label: "Palm", emoji: "✋" },
    { href: "/face", label: "Face", emoji: "👤" },
  ];

  const lifestyleItems = [
    { href: "/dating", label: "Dating Match", emoji: "💕" },
    { href: "/chat", label: "Chat", emoji: "💬" },
    { href: "/lifestyle", label: "All Lifestyle Tools", emoji: "🌿" },
  ];

  const flatItems = [
    { href: "/", label: "Home", emoji: "🔮" },
    { href: "/history", label: "History", emoji: "📜" },
  ];

  const isActiveInGroup = (items: { href: string }[]) =>
    items.some(i => location === i.href);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950 to-gray-950 text-gray-100">
      <nav className="bg-gray-900/80 backdrop-blur border-b border-purple-900/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex-shrink-0">
            🔮 Mystic AI
          </Link>
          <div className="flex gap-1 flex-wrap justify-end items-center">
            {/* Home */}
            <Link
              href="/"
              className={`px-2 py-1.5 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap ${
                location === "/" ? "bg-purple-800/50 text-purple-200" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              🏠 <span className="hidden md:inline">Home</span>
            </Link>

            {/* Divination Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === "divination" ? null : "divination")}
                onBlur={() => setTimeout(() => setOpenMenu(null), 150)}
                className={`px-2 py-1.5 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isActiveInGroup(divinationItems)
                    ? "bg-purple-800/50 text-purple-200"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }`}
              >
                <Sparkles className="w-3 h-3" /> Divination <ChevronDown className="w-3 h-3" />
              </button>
              {openMenu === "divination" && (
                <div className="absolute top-full left-0 mt-1 bg-gray-900/95 border border-purple-700/50 rounded-xl shadow-xl py-1 min-w-[180px] z-50">
                  {divinationItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      className={`block px-3 py-2 text-xs hover:bg-purple-900/40 ${
                        location === item.href ? "text-purple-200 bg-purple-900/30" : "text-gray-300"
                      }`}
                    >
                      {item.emoji} {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Lifestyle Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === "lifestyle" ? null : "lifestyle")}
                onBlur={() => setTimeout(() => setOpenMenu(null), 150)}
                className={`px-2 py-1.5 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isActiveInGroup(lifestyleItems) || location === "/lifestyle"
                    ? "bg-emerald-800/50 text-emerald-200"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }`}
              >
                <Leaf className="w-3 h-3" /> Lifestyle <ChevronDown className="w-3 h-3" />
              </button>
              {openMenu === "lifestyle" && (
                <div className="absolute top-full right-0 mt-1 bg-gray-900/95 border border-emerald-700/50 rounded-xl shadow-xl py-1 min-w-[200px] z-50">
                  {lifestyleItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      className={`block px-3 py-2 text-xs hover:bg-emerald-900/40 ${
                        location === item.href ? "text-emerald-200 bg-emerald-900/30" : "text-gray-300"
                      }`}
                    >
                      {item.emoji} {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* History */}
            <Link
              href="/history"
              className={`px-2 py-1.5 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap ${
                location === "/history" ? "bg-purple-800/50 text-purple-200" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              📜 <span className="hidden md:inline">History</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-3 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/tarot" component={TarotPage} />
          <Route path="/numerology" component={NumerologyPage} />
          <Route path="/astrology" component={AstrologyPage} />
          <Route path="/dream" component={DreamPage} />
          <Route path="/palm" component={PalmPage} />
          <Route path="/face" component={FacePage} />
          <Route path="/history" component={History} />
          <Route path="/dating" component={MatchesPage} />
          <Route path="/dating/profile" component={DatingProfilePage} />
          <Route path="/chat" component={ChatPage} />
          <Route path="/lifestyle" component={LifestylePage} />
        </Switch>
      </main>
    </div>
  );
}
