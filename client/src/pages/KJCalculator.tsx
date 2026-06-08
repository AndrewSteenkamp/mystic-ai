import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Search, Calculator, Loader2, Sparkles, AlertTriangle, CheckCircle2, ChefHat, X, Plus, History } from "lucide-react";

export default function KJCalculator() {
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [grams, setGrams] = useState(150);
  const [result, setResult] = useState<any>(null);
  const [mealItems, setMealItems] = useState<{ food: string; grams: number; id: string }[]>([]);
  const [mealResult, setMealResult] = useState<any>(null);

  const { data: searchResults, isFetching: searching } = trpc.lifestyle.searchFoods.useQuery(
    { query: search, limit: 8 },
    { enabled: search.length >= 1, staleTime: 30000 }
  );

  const calculateMutation = trpc.lifestyle.calculateKJ.useMutation();
  const calculateMealMutation = trpc.lifestyle.calculateMealKJ.useMutation();

  const handleSelect = (food: any) => {
    setSelectedFood(food);
    setResult(null);
    setSearch("");
  };

  const handleCalculate = async () => {
    if (!selectedFood) return;
    const r = await calculateMutation.mutateAsync({ foodName: selectedFood.name, grams });
    setResult(r);
  };

  const addToMeal = () => {
    if (!selectedFood) return;
    setMealItems([...mealItems, {
      food: selectedFood.name,
      grams,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }]);
    setSelectedFood(null);
    setResult(null);
  };

  const removeFromMeal = (id: string) => {
    setMealItems(mealItems.filter(i => i.id !== id));
    setMealResult(null);
  };

  const calculateWholeMeal = async () => {
    if (mealItems.length === 0) return;
    const r = await calculateMealMutation.mutateAsync({
      items: mealItems.map(i => ({ food: i.food, grams: i.grams })),
    });
    setMealResult(r);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl">
            🔥
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Kilojoule Calculator</h2>
            <p className="text-xs text-gray-400">Search our 650-item food database. Track your meal. Know your numbers.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-2">
            <div className="text-emerald-300 font-bold">650+</div>
            <div className="text-emerald-200/70">Foods in DB</div>
          </div>
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-2">
            <div className="text-blue-300 font-bold">69</div>
            <div className="text-blue-200/70">SA staples</div>
          </div>
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-2">
            <div className="text-purple-300 font-bold">AI fallback</div>
            <div className="text-purple-200/70">For unknowns</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-purple-400" /> Search a food
        </h3>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="apple, chicken breast, boerewors, biltong..."
            className="w-full bg-gray-900/50 border border-purple-800/50 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-purple-500 outline-none"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 animate-spin" />}
        </div>

        {searchResults && searchResults.length > 0 && (
          <div className="mt-2 bg-gray-900/70 border border-purple-800/30 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            {searchResults.map((food: any) => (
              <button
                key={food.id}
                onClick={() => handleSelect(food)}
                className="w-full text-left px-3 py-2 hover:bg-purple-900/30 flex items-center justify-between border-b border-gray-800/50 last:border-0"
              >
                <div>
                  <div className="text-sm text-gray-200">{food.name}</div>
                  <div className="text-[10px] text-gray-500">{food.category} · {food.region}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-amber-300 font-medium">{food.kj} kJ</div>
                  <div className="text-[10px] text-gray-500">{food.kcal} kcal</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {search && searchResults && searchResults.length === 0 && !searching && (
          <div className="mt-2 bg-amber-900/20 border border-amber-700/40 rounded-xl p-3 text-xs text-amber-200">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Not in our 650-item database. Pick a similar food or use the AI by leaving search blank and clicking Calculate — we'll log your query for review.
          </div>
        )}
      </div>

      {/* Selected food + gram input */}
      {selectedFood && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase text-gray-500 tracking-widest">Selected</div>
              <h3 className="text-lg font-bold text-gray-100">{selectedFood.name}</h3>
              <div className="text-xs text-gray-400 mt-1">
                {selectedFood.kj} kJ · {selectedFood.kcal} kcal · per 100g
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                P {selectedFood.protein}g · C {selectedFood.carbs}g · F {selectedFood.fat}g
                {selectedFood.fiber != null && ` · Fiber ${selectedFood.fiber}g`}
              </div>
            </div>
            <button onClick={() => setSelectedFood(null)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(parseInt(e.target.value) || 0)}
              min="1"
              max="5000"
              className="flex-1 bg-gray-900/50 border border-purple-800/50 rounded-xl px-3 py-2 text-sm text-gray-200"
            />
            <span className="text-sm text-gray-400">grams</span>
            <button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending || grams <= 0}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {calculateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Calculate
            </button>
            <button
              onClick={addToMeal}
              className="bg-purple-700 hover:bg-purple-600 text-white text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1"
              title="Add to meal tracker"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {result && (
            <div className={`rounded-xl p-4 ${
              result.source === "database" ? "bg-emerald-900/20 border border-emerald-700/40" :
              result.source === "deepseek" ? "bg-amber-900/20 border border-amber-700/40" :
              "bg-rose-900/20 border border-rose-700/40"
            }`}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] uppercase opacity-70">Total Energy</div>
                  <div className="text-2xl font-bold">{result.totals.kj} kJ</div>
                  <div className="text-sm opacity-80">{result.totals.kcal} kcal</div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="opacity-70">Protein</span><span>{result.totals.protein}g</span></div>
                  <div className="flex justify-between"><span className="opacity-70">Carbs</span><span>{result.totals.carbs}g</span></div>
                  <div className="flex justify-between"><span className="opacity-70">Fat</span><span>{result.totals.fat}g</span></div>
                  {result.totals.fiber != null && <div className="flex justify-between"><span className="opacity-70">Fiber</span><span>{result.totals.fiber}g</span></div>}
                </div>
              </div>
              <div className="text-[10px] opacity-70 mt-2 flex items-center gap-1">
                {result.source === "database" ? <><CheckCircle2 className="w-3 h-3" /> Database ({result.confidence} confidence)</> :
                 result.source === "deepseek" ? <><Sparkles className="w-3 h-3" /> AI estimate ({result.confidence} confidence) — logged for review</> :
                 <><AlertTriangle className="w-3 h-3" /> Could not calculate. Try a different food name.</>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Meal Tracker */}
      <MealTracker
        items={mealItems}
        onRemove={removeFromMeal}
        onCalculate={calculateWholeMeal}
        result={mealResult}
        isPending={calculateMealMutation.isPending}
      />
    </div>
  );
}

function MealTracker({ items, onRemove, onCalculate, result, isPending }: any) {
  if (items.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 text-center">
        <ChefHat className="w-8 h-8 mx-auto text-gray-600 mb-2" />
        <h3 className="text-sm font-medium text-gray-300 mb-1">Meal Tracker</h3>
        <p className="text-xs text-gray-500">
          Calculate a food, then click <span className="text-purple-400">+</span> to add it here.
          Build a whole meal and see the totals.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-purple-400" /> Meal ({items.length} {items.length === 1 ? "item" : "items"})
        </h3>
        <button
          onClick={onCalculate}
          disabled={isPending}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Total Meal"}
        </button>
      </div>

      <div className="space-y-1 mb-3">
        {items.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between bg-gray-900/40 rounded-lg px-3 py-2 text-sm">
            <div className="flex-1">
              <div className="text-gray-200">{item.food}</div>
              <div className="text-[10px] text-gray-500">{item.grams}g</div>
            </div>
            <button onClick={() => onRemove(item.id)} className="text-gray-500 hover:text-rose-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {result && (
        <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-4">
          <div className="text-[10px] uppercase text-emerald-300/70 tracking-widest mb-2">Meal Total</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-2xl font-bold text-emerald-200">{result.totals.kj} kJ</div>
              <div className="text-sm text-emerald-300/70">{result.totals.kcal} kcal</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Protein</span><span className="text-emerald-200">{result.totals.protein}g</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Carbs</span><span className="text-emerald-200">{result.totals.carbs}g</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Fat</span><span className="text-emerald-200">{result.totals.fat}g</span></div>
            </div>
          </div>
          <div className="text-[10px] text-emerald-400/60 mt-2 flex flex-wrap gap-2">
            {result.sources.database > 0 && <span>✓ {result.sources.database} from database</span>}
            {result.sources.deepseek > 0 && <span>· {result.sources.deepseek} AI estimates</span>}
            {result.sources.fallback > 0 && <span>· {result.sources.fallback} unknown</span>}
          </div>
        </div>
      )}
    </div>
  );
}
