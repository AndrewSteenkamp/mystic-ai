import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { BookOpen, Utensils, Sparkles, Save, ShoppingBag, ExternalLink, Heart, ChefHat, ListChecks, ShoppingCart, Calendar, RefreshCw, Camera, Calculator, Loader2, Lock, Eye, Settings } from "lucide-react";
import FoodIdentifier from "./FoodIdentifier";
import KJCalculator from "./KJCalculator";
import DailySourcePicker from "../components/DailySourcePicker";

// Alpapies is not live yet. When it goes live, set this to true.
// Until then the Shop tab is hidden from regular users and only visible
// to admins (user id 1, the local dummy user) so we can review the layout.
const SHOP_LIVE = false;

const TABS = [
  { key: "journal", label: "Journal", icon: BookOpen },
  { key: "diet", label: "Diet", icon: Utensils },
  { key: "mealplan", label: "Meals", icon: Calendar },
  { key: "foodid", label: "Identify", icon: Camera },
  { key: "kjcalc", label: "kJ Calc", icon: Calculator },
  { key: "source", label: "Source", icon: Settings },
  { key: "meditation", label: "Meditate", icon: Sparkles },
  { key: "shop", label: "Shop", icon: ShoppingBag },
];

const SHOP_PRODUCTS = [
  { name: "Crystal Healing Set", desc: "7 chakra stones with guide", price: "R299", category: "Crystals", link: "https://alpapies.com/product/crystal-set" },
  { name: "Guided Journal", desc: "Daily reflection & gratitude journal", price: "R189", category: "Journals", link: "https://alpapies.com/product/journal" },
  { name: "Herbal Tea Collection", desc: "Organic wellness blend 12-pack", price: "R149", category: "Teas", link: "https://alpapies.com/product/tea" },
  { name: "Meditation Cushion", desc: "Ergonomic support for deep practice", price: "R349", category: "Meditation", link: "https://alpapies.com/product/cushion" },
];

// ── Meal Planner Sub-Components ──

function IngredientsToMeals() {
  const [ingredients, setIngredients] = useState("");
  const [diet, setDiet] = useState("");
  const { data, isLoading, refetch } = trpc.lifestyle.suggestMeals.useQuery(
    { ingredients: ingredients.split(",").map(i => i.trim()).filter(Boolean), diet: diet || undefined },
    { enabled: false }
  );

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-purple-400" /> What can I make with...
        </h3>
        <textarea
          value={ingredients}
          onChange={e => setIngredients(e.target.value)}
          placeholder="Enter ingredients separated by commas... e.g. chicken, rice, tomatoes, onions, garlic"
          className="w-full bg-gray-900/50 border border-purple-800/50 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 outline-none h-20 resize-none"
        />
        <div className="flex gap-2 mt-3">
          <select value={diet} onChange={e => setDiet(e.target.value)} className="bg-gray-900/50 border border-purple-800/50 rounded-xl px-3 py-2 text-sm text-gray-200">
            <option value="">Any diet</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto</option>
            <option value="paleo">Paleo</option>
            <option value="mediterranean">Mediterranean</option>
          </select>
          <button onClick={() => refetch()} disabled={!ingredients.trim() || isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all">
            <ChefHat className="w-4 h-4" /> Suggest Meals
          </button>
        </div>
      </div>

      {isLoading && <div className="text-center text-gray-400 py-4">🧑‍🍳 Generating meal ideas...</div>}

      {data && Array.isArray(data) && (
        <div className="space-y-3">
          {data.map((meal: any, i: number) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-gray-100">{meal.name}</span>
                <span className="text-xs text-purple-400">{meal.prepTime} · {meal.difficulty}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {meal.ingredients?.map((ing: string, j: number) => (
                  <span key={j} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">{ing}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400">{meal.instructions}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeeklyMenuPlanner() {
  const [prefs, setPrefs] = useState({ diet: "", cuisine: "", budget: "medium" as "low"|"medium"|"high" });
  const { data, isLoading, refetch } = trpc.lifestyle.weeklyMenu.useQuery(
    { diet: prefs.diet || undefined, cuisine: prefs.cuisine || undefined, budget: prefs.budget },
    { enabled: false }
  );
  const savePlan = trpc.lifestyle.saveMealPlan.useMutation();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (data?.menu && data?.shoppingList) {
      savePlan.mutate({ menu: data.menu, shoppingList: data.shoppingList });
      setSaved(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" /> Weekly Menu Planner
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <select value={prefs.diet} onChange={e => setPrefs(p => ({...p, diet: e.target.value}))} className="bg-gray-900/50 border border-purple-800/50 rounded-xl px-3 py-2 text-sm text-gray-200">
            <option value="">Any diet</option>
            <option value="balanced">Balanced</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="high-protein">High Protein</option>
          </select>
          <select value={prefs.cuisine} onChange={e => setPrefs(p => ({...p, cuisine: e.target.value}))} className="bg-gray-900/50 border border-purple-800/50 rounded-xl px-3 py-2 text-sm text-gray-200">
            <option value="">Any cuisine</option>
            <option value="italian">Italian</option>
            <option value="asian">Asian</option>
            <option value="mexican">Mexican</option>
            <option value="indian">Indian</option>
            <option value="south african">South African</option>
          </select>
        </div>
        <button onClick={() => { refetch(); setSaved(false); }} disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-2.5 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Generate Weekly Menu
        </button>
      </div>

      {isLoading && <div className="text-center text-gray-400 py-8">🍳 Creating your weekly plan...</div>}

      {data?.menu && (
        <>
          {/* Menu */}
          <div className="space-y-3">
            {data.menu.map((day: any, i: number) => (
              <div key={i} className="glass-card rounded-xl p-4">
                <div className="text-sm font-bold text-purple-300 mb-3">{day.day}</div>
                {["breakfast","lunch","dinner","snack"].map(mealType => {
                  const meal = day[mealType];
                  if (!meal) return null;
                  return (
                    <div key={mealType} className="flex items-start gap-3 py-2 border-t border-gray-800/50">
                      <span className="text-xs text-gray-500 w-16 flex-shrink-0 capitalize">{mealType}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-200 font-medium">{meal.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {meal.ingredients?.map((ing: string, j: number) => (
                            <span key={j} className="text-[10px] bg-purple-900/20 text-purple-300 px-1.5 py-0.5 rounded-full">{ing}</span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{meal.prepTime} · {meal.calories} cal</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Shopping List */}
          <div className="glass-card rounded-xl p-4 border-green-500/30 bg-green-500/5">
            <h3 className="text-sm font-bold text-green-300 mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Shopping List — {data.shoppingList?.reduce((sum: number, c: any) => sum + c.items.length, 0) || 0} items
            </h3>
            {data.shoppingList?.map((cat: any, i: number) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="text-xs font-semibold text-green-400 mb-1.5">{cat.category}</div>
                <div className="flex flex-wrap gap-1">
                  {cat.items.map((item: string, j: number) => (
                    <span key={j} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg">{item}</span>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={handleSave} disabled={saved}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-green-500 disabled:opacity-50 transition-all">
              {saved ? "✓ Saved!" : <><Save className="w-4 h-4" /> Save Meal Plan</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function RecipeBreakdownTool() {
  const [recipe, setRecipe] = useState("");
  const { data, isLoading, refetch } = trpc.lifestyle.breakdownRecipe.useQuery(
    { recipe },
    { enabled: false }
  );

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-purple-400" /> Recipe Breakdown
        </h3>
        <textarea
          value={recipe}
          onChange={e => setRecipe(e.target.value)}
          placeholder="Paste a full recipe here and we'll break it down into structured ingredients with quantities..."
          className="w-full bg-gray-900/50 border border-purple-800/50 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 outline-none h-24 resize-none"
        />
        <button onClick={() => refetch()} disabled={!recipe.trim() || isLoading}
          className="mt-3 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all">
          <ListChecks className="w-4 h-4" /> Break Down Recipe
        </button>
      </div>

      {isLoading && <div className="text-center text-gray-400 py-4">📋 Analyzing recipe...</div>}

      {data && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-100">{data.name}</span>
            <span className="text-xs text-gray-500">{data.servings} servings · {data.prepTime} prep · {data.cookTime} cook</span>
          </div>
          <div className="space-y-2 mb-4">
            <div className="text-xs font-semibold text-purple-400 mb-1">Ingredients</div>
            {data.ingredients?.map((ing: any, i: number) => (
              <div key={i} className="flex justify-between text-sm text-gray-300 py-1 border-b border-gray-800/50">
                <span>{ing.name}</span>
                <span className="text-gray-500">{ing.quantity} {ing.unit}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 mb-3">
            <div className="text-xs font-semibold text-purple-400 mb-1">Instructions</div>
            {data.instructions?.map((step: string, i: number) => (
              <div key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-purple-400 font-medium">{i+1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          {data.nutrition && (
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-800">
              {Object.entries(data.nutrition).map(([key, val]) => (
                <div key={key} className="text-center">
                  <div className="text-lg font-bold text-purple-300">{val as string}</div>
                  <div className="text-[10px] text-gray-500 capitalize">{key}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Lifestyle Page ──

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
  const { data: user } = trpc.auth.me.useQuery();
  const saveJournal = trpc.lifestyle.saveJournal.useMutation({ onSuccess: () => { setJournalTitle(""); setJournalContent(""); setJournalMood(""); refetchJournals(); } });
  const saveDiet = trpc.lifestyle.saveDietPlan.useMutation({ onSuccess: () => { setDietType(""); setDietMeals(""); setDietCalories(""); refetchDiets(); } });

  const moods = ["😊", "😌", "😔", "😤", "🤔", "😴", "💪", "🙏"];

  // Shop tab visibility: visible to everyone when SHOP_LIVE is true,
  // OR visible only to admin (user id 1) when SHOP_LIVE is false.
  // Regular users see no Shop tab in the nav at all.
  const isAdmin = user?.id === 1;
  const visibleTabs = TABS.filter(t => {
    if (t.key === "shop") return SHOP_LIVE || isAdmin;
    return true;
  });

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Heart className="w-5 h-5 text-pink-400" /> Lifestyle & Wellness
      </h1>
      <p className="text-gray-400 text-sm mb-6">Journal your thoughts, plan your meals, and find inner peace.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {visibleTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
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
            <input value={journalTitle} onChange={e => setJournalTitle(e.target.value)} placeholder="Entry title..." className="w-full bg-transparent text-gray-100 text-sm font-medium mb-2 outline-none placeholder-gray-600" />
            <textarea value={journalContent} onChange={e => setJournalContent(e.target.value)} placeholder="What's on your mind today?" className="w-full bg-gray-900/50 border border-purple-800/50 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 outline-none h-32 resize-none" />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1">
                {moods.map(m => (
                  <button key={m} onClick={() => setJournalMood(m)} className={`text-lg p-1 rounded-lg ${journalMood === m ? "bg-purple-800/50 scale-125" : "hover:bg-gray-800"}`}>{m}</button>
                ))}
              </div>
              <button onClick={() => saveJournal.mutate({ title: journalTitle || "Untitled", content: journalContent, mood: journalMood || undefined })} disabled={!journalContent || saveJournal.isPending}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all">
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
            <input value={dietType} onChange={e => setDietType(e.target.value)} placeholder="Plan type (e.g. Keto, Vegan)" className="w-full bg-transparent text-gray-100 text-sm font-medium mb-3 outline-none placeholder-gray-600" />
            <textarea value={dietMeals} onChange={e => setDietMeals(e.target.value)} placeholder="Describe your meals for today..." className="w-full bg-gray-900/50 border border-purple-800/50 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 outline-none h-32 resize-none" />
            <div className="flex items-center justify-between mt-3">
              <input type="number" value={dietCalories} onChange={e => setDietCalories(e.target.value)} placeholder="Calories" className="w-24 bg-gray-900/50 border border-purple-800/50 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 outline-none" />
              <button onClick={() => saveDiet.mutate({ planType: dietType || "General", meals: dietMeals, calories: dietCalories ? parseInt(dietCalories) : undefined })} disabled={!dietMeals || saveDiet.isPending}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all">
                <Save className="w-3.5 h-3.5" /> Save Plan
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {(dietPlans as any[] || []).map((d: any) => (
              <div key={d.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{d.plan_type}</span><span className="text-xs text-gray-500">{new Date(d.created_at).toLocaleDateString()}</span></div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{d.meals}</p>
                {d.calories && <span className="text-xs text-purple-400 mt-2 inline-block">{d.calories} cal</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal Plan Tab */}
      {tab === "mealplan" && (
        <div className="space-y-8">
          <IngredientsToMeals />
          <RecipeBreakdownTool />
          <WeeklyMenuPlanner />
        </div>
      )}

      {/* Meditation Tab — Daily AI meditation + browse all static */}
      {tab === "meditation" && (
        <div className="space-y-4">
          <DailyMeditation />
          {(meditations as any[] || []).length > 0 && (
            <>
              <div className="text-xs text-gray-500 uppercase tracking-widest pt-2">Browse all practices</div>
              {(meditations as any[] || []).map((m: any, i: number) => (
                <div key={i} className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center text-lg">
                      {i === 0 ? "🌅" : i === 1 ? "🟣" : i === 2 ? "💗" : i === 3 ? "🧘" : "⭐"}
                    </div>
                    <div><div className="font-medium text-sm">{m.title}</div><div className="text-xs text-purple-400">{m.duration}</div></div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{m.description}</p>
                  <div className="space-y-1.5">
                    {m.steps.map((s: string, j: number) => (
                      <div key={j} className="flex items-start gap-2 text-sm text-gray-300"><span className="text-purple-400 font-medium min-w-[20px]">{j + 1}.</span>{s}</div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Shop Tab — admin-only until Alpapies is live */}
      {tab === "shop" && (
        isAdmin && !SHOP_LIVE ? (
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-5 border border-amber-700/50 bg-amber-900/20">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-200 mb-1">Admin preview — Alpapies is not live yet</h3>
                  <p className="text-xs text-amber-300/70">
                    You're seeing this Shop tab because you're signed in as the admin. Regular users
                    cannot see this tab until <code className="bg-amber-900/40 px-1 rounded">SHOP_LIVE = true</code> in Lifestyle.tsx.
                    Toggle it on when Alpapies is ready to receive traffic.
                  </p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-sm text-gray-300 mb-2">Wellness products — powered by <span className="text-purple-400 font-medium">Alpapies</span></p>
              <a href="https://alpapies.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">Visit Alpapies Store <ExternalLink className="w-3 h-3" /></a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SHOP_PRODUCTS.map((p, i) => (
                <a key={i} href={p.link} target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl p-4 hover:border-purple-500/50 transition-all cursor-pointer group">
                  <div className="text-xs text-purple-400 mb-1">{p.category}</div>
                  <div className="font-medium text-sm mb-1 group-hover:text-purple-300">{p.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{p.desc}</div>
                  <div className="flex items-center justify-between"><span className="text-sm font-bold text-purple-300">{p.price}</span><ShoppingBag className="w-4 h-4 text-purple-500" /></div>
                </a>
              ))}
            </div>
          </div>
        ) : isAdmin ? (
          // Alpapies is live + admin: full shop
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-sm text-gray-300 mb-2">Wellness products — powered by <span className="text-purple-400 font-medium">Alpapies</span></p>
              <a href="https://alpapies.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">Visit Alpapies Store <ExternalLink className="w-3 h-3" /></a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SHOP_PRODUCTS.map((p, i) => (
                <a key={i} href={p.link} target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl p-4 hover:border-purple-500/50 transition-all cursor-pointer group">
                  <div className="text-xs text-purple-400 mb-1">{p.category}</div>
                  <div className="font-medium text-sm mb-1 group-hover:text-purple-300">{p.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{p.desc}</div>
                  <div className="flex items-center justify-between"><span className="text-sm font-bold text-purple-300">{p.price}</span><ShoppingBag className="w-4 h-4 text-purple-500" /></div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          // Non-admin somehow landed on the shop tab — show empty state
          <div className="glass-card rounded-xl p-6 text-center">
            <Lock className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <h3 className="text-sm font-medium text-gray-300">Shop is not available yet</h3>
            <p className="text-xs text-gray-500 mt-1">Our wellness store is coming soon.</p>
          </div>
        )
      )}

      {/* Food Identifier Tab */}
      {tab === "foodid" && <FoodIdentifier />}

      {/* Daily Source Tab — user picks which tradition their daily insight comes from */}
      {tab === "source" && <DailySourcePicker />}

      {/* kJ Calculator Tab */}
      {tab === "kjcalc" && <KJCalculator />}
    </div>
  );
}

// ── Daily AI Meditation (featured at top of meditation tab) ──

function DailyMeditation() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generateMutation = trpc.lifestyle.dailyMeditation.useMutation();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const cached = localStorage.getItem(`mystic_daily_meditation_${today}`);
    if (cached) {
      try { setData(JSON.parse(cached)); return; } catch { /* fall through */ }
    }
    // No cache — generate one
    setLoading(true);
    generateMutation.mutate(undefined, {
      onSuccess: (res) => {
        setData(res.meditation);
        localStorage.setItem(`mystic_daily_meditation_${today}`, JSON.stringify(res.meditation));
        setLoading(false);
      },
      onError: (e) => {
        setError(e.message);
        setLoading(false);
      },
    });
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 text-purple-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <div>
            <div className="text-sm font-medium">Drawing today's meditation…</div>
            <div className="text-xs text-purple-400/60">Anchoring to today's verse</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-rose-700/50 bg-rose-900/20">
        <div className="text-sm text-rose-200">Could not generate today's meditation: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glass-card rounded-2xl p-5 border border-amber-700/30 bg-gradient-to-br from-amber-900/10 via-purple-900/10 to-pink-900/10">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-widest text-amber-300/80">Today's Meditation · {data.date}</div>
        <div className="text-[10px] text-amber-300/50">{data.duration}</div>
      </div>
      <h3 className="text-lg font-bold text-gray-100 mb-1">{data.title}</h3>
      {data.description && (
        <p className="text-xs text-gray-400 mb-3 italic">{data.description}</p>
      )}
      {data.verseText && (
        <div className="bg-amber-900/15 border-l-2 border-amber-500/50 rounded-r-lg px-3 py-2 mb-3">
          <div className="text-xs text-amber-100/80 italic">"{data.verseText.length > 200 ? data.verseText.slice(0, 200) + "..." : data.verseText}"</div>
          <div className="text-[10px] text-amber-300/60 mt-1">— {data.verseRef}</div>
        </div>
      )}
      <div className="space-y-1.5 mb-3">
        {data.steps.map((step: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-200">
            <span className="text-purple-400 font-medium min-w-[20px]">{i + 1}.</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
      {data.closingLine && (
        <div className="border-t border-amber-700/30 pt-3 text-sm text-amber-100/90 italic">
          {data.closingLine}
        </div>
      )}
      {data.source === "fallback" && (
        <div className="mt-3 text-[10px] text-gray-500 italic">A simpler practice today — the AI guide was unavailable.</div>
      )}
    </div>
  );
}
