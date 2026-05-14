import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BookOpen, Utensils, Sparkles, Save, ShoppingBag, ExternalLink, Heart } from "lucide-react";

const TABS = [
  { key: "journal", label: "Journal", icon: BookOpen },
  { key: "diet", label: "Diet Plans", icon: Utensils },
  { key: "meditation", label: "Meditation", icon: Sparkles },
  { key: "shop", label: "Shop", icon: ShoppingBag },
];

// Alpapies wellness products — update these with real products
const SHOP_PRODUCTS = [
  { name: "Crystal Healing Set", desc: "7 chakra stones with guide", price: "R299", category: "Crystals", link: "https://alpapies.com/product/crystal-set" },
  { name: "Guided Journal", desc: "Daily reflection & gratitude journal", price: "R189", category: "Journals", link: "https://alpapies.com/product/journal" },
  { name: "Herbal Tea Collection", desc: "Organic wellness blend 12-pack", price: "R149", category: "Teas", link: "https://alpapies.com/product/tea" },
  { name: "Meditation Cushion", desc: "Ergonomic support for deep practice", price: "R349", category: "Meditation", link: "https://alpapies.com/product/cushion" },
  { name: "Essential Oil Kit", desc: "6 pure oils for aromatherapy", price: "R249", category: "Wellness", link: "https://alpapies.com/product/oils" },
  { name: "Yoga Mat Premium", desc: "Non-slip 6mm eco-friendly mat", price: "R399", category: "Fitness", link: "https://alpapies.com/product/mat" },
];

export default function LifestylePage() {
  const [tab, setTab] = useState("journal");
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalMood, setJournalMood] = useState("");
  const [dietType, setDietType] = useState("");
  const [dietMeals, setDietMeals] = useState("");
  const [dietCalories, setDietCalories] = useState("");

  const { data: journals, refetch: refetchJournals } = trpc.lifestyle.journalEntries.useQuery();
  const { data: dietPlans, refetch: refetchDiets } = trpc.lifestyle.dietPlans.useQuery();
  const { data: meditations } = trpc.lifestyle.meditationGuide.useQuery();
  const saveJournal = trpc.lifestyle.saveJournal.useMutation({ onSuccess: () => { setJournalTitle(""); setJournalContent(""); setJournalMood(""); refetchJournals(); } });
  const saveDiet = trpc.lifestyle.saveDietPlan.useMutation({ onSuccess: () => { setDietType(""); setDietMeals(""); setDietCalories(""); refetchDiets(); } });

  const moods = ["😊", "😌", "😔", "😤", "🤔", "😴", "💪", "🙏"];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Heart className="w-5 h-5 text-pink-400" /> Lifestyle & Wellness
      </h1>
      <p className="text-gray-400 text-sm mb-6">Journal your thoughts, plan your meals, and find inner peace.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "bg-gray-900 text-gray-400 hover:text-gray-200"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Journal Tab */}
      {tab === "journal" && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-4">
            <input
              value={journalTitle}
              onChange={e => setJournalTitle(e.target.value)}
              placeholder="Entry title..."
              className="w-full bg-transparent text-gray-100 text-sm font-medium mb-2 outline-none placeholder-gray-600"
            />
            <textarea
              value={journalContent}
              onChange={e => setJournalContent(e.target.value)}
              placeholder="What's on your mind today?"
              className="w-full bg-gray-900/50 border border-purple-800/50 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 outline-none h-32 resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1">
                {moods.map(m => (
                  <button key={m} onClick={() => setJournalMood(m)} className={`text-lg p-1 rounded-lg transition-all ${journalMood === m ? "bg-purple-800/50 scale-125" : "hover:bg-gray-800"}`}>{m}</button>
                ))}
              </div>
              <button
                onClick={() => saveJournal.mutate({ title: journalTitle || "Untitled", content: journalContent, mood: journalMood || undefined })}
                disabled={!journalContent || saveJournal.isPending}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(journals as any[] || []).map((j: any) => (
              <div key={j.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{j.title}</span>
                  <span className="text-xs text-gray-500">{new Date(j.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{j.content}</p>
                {j.mood && <span className="text-lg mt-2 inline-block">{j.mood}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diet Tab */}
      {tab === "diet" && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-4">
            <input
              value={dietType}
              onChange={e => setDietType(e.target.value)}
              placeholder="Plan type (e.g. Keto, Vegan, Intermittent Fasting)"
              className="w-full bg-transparent text-gray-100 text-sm font-medium mb-3 outline-none placeholder-gray-600"
            />
            <textarea
              value={dietMeals}
              onChange={e => setDietMeals(e.target.value)}
              placeholder="Describe your meals for today..."
              className="w-full bg-gray-900/50 border border-purple-800/50 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 outline-none h-32 resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <input
                type="number"
                value={dietCalories}
                onChange={e => setDietCalories(e.target.value)}
                placeholder="Calories"
                className="w-24 bg-gray-900/50 border border-purple-800/50 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 outline-none"
              />
              <button
                onClick={() => saveDiet.mutate({ planType: dietType || "General", meals: dietMeals, calories: dietCalories ? parseInt(dietCalories) : undefined })}
                disabled={!dietMeals || saveDiet.isPending}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all"
              >
                <Save className="w-3.5 h-3.5" /> Save Plan
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(dietPlans as any[] || []).map((d: any) => (
              <div key={d.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{d.plan_type}</span>
                  <span className="text-xs text-gray-500">{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{d.meals}</p>
                {d.calories && <span className="text-xs text-purple-400 mt-2 inline-block">{d.calories} cal</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meditation Tab */}
      {tab === "meditation" && (
        <div className="space-y-4">
          {(meditations as any[] || []).map((m: any, i: number) => (
            <div key={i} className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center text-lg">
                  {i === 0 ? "🌅" : i === 1 ? "🟣" : i === 2 ? "💗" : i === 3 ? "🧘" : "⭐"}
                </div>
                <div>
                  <div className="font-medium text-sm">{m.title}</div>
                  <div className="text-xs text-purple-400">{m.duration}</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-3">{m.description}</p>
              <div className="space-y-1.5">
                {m.steps.map((s: string, j: number) => (
                  <div key={j} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-purple-400 font-medium min-w-[20px]">{j + 1}.</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shop Tab — Alpapies Wellness Products */}
      {tab === "shop" && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-sm text-gray-300 mb-2">
              Wellness products to support your journey — powered by <span className="text-purple-400 font-medium">Alpapies</span>
            </p>
            <a href="https://alpapies.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
              Visit Alpapies Store <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SHOP_PRODUCTS.map((p, i) => (
              <a key={i} href={p.link} target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl p-4 hover:border-purple-500/50 transition-all cursor-pointer group">
                <div className="text-xs text-purple-400 mb-1">{p.category}</div>
                <div className="font-medium text-sm mb-1 group-hover:text-purple-300 transition-colors">{p.name}</div>
                <div className="text-xs text-gray-500 mb-2">{p.desc}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-300">{p.price}</span>
                  <ShoppingBag className="w-4 h-4 text-purple-500 group-hover:text-purple-400 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
