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

export default function App() {
  const { data: user } = trpc.auth.me.useQuery();
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", emoji: "🔮" },
    { href: "/tarot", label: "Tarot", emoji: "🃏" },
    { href: "/numerology", label: "Num", emoji: "🔢" },
    { href: "/astrology", label: "Astro", emoji: "⭐" },
    { href: "/dream", label: "Dream", emoji: "🌙" },
    { href: "/palm", label: "Palm", emoji: "✋" },
    { href: "/face", label: "Face", emoji: "👤" },
    { href: "/dating", label: "Match", emoji: "💕" },
    { href: "/chat", label: "Chat", emoji: "💬" },
    { href: "/lifestyle", label: "Life", emoji: "🌿" },
    { href: "/history", label: "History", emoji: "📜" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950 to-gray-950 text-gray-100">
      <nav className="bg-gray-900/80 backdrop-blur border-b border-purple-900/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex-shrink-0">
            🔮 Mystic AI
          </Link>
          <div className="flex gap-0.5 flex-wrap justify-end overflow-x-auto">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-1.5 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  location === item.href
                    ? "bg-purple-800/50 text-purple-200"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }`}
              >
                {item.emoji} <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
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
