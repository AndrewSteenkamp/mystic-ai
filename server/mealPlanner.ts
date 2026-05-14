// ============================================================
// MYSTIC AI — MEAL PLANNER
// AI-powered weekly menu, recipe breakdown, shopping lists
// ============================================================

import { getDb } from "./db";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

async function callAI(prompt: string): Promise<string> {
  if (!DEEPSEEK_API_KEY) return generateFallback(prompt);
  
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a professional nutritionist and meal planner. You provide practical, balanced meal plans with exact quantities, simple instructions, and shopping lists. Always respond with structured JSON only — no markdown, no explanations outside the JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json() as any;
  return data?.choices?.[0]?.message?.content || generateFallback(prompt);
}

function generateFallback(prompt: string): string {
  if (prompt.includes("meal ideas")) {
    return JSON.stringify({
      meals: [
        { name: "Mediterranean Bowl", ingredients: ["quinoa", "chickpeas", "cucumber", "tomato", "olive oil", "lemon", "feta"], time: "20 min", difficulty: "easy" },
        { name: "Stir-Fried Veggies & Rice", ingredients: ["rice", "mixed vegetables", "soy sauce", "garlic", "ginger", "sesame oil"], time: "25 min", difficulty: "easy" },
        { name: "Omelette with Greens", ingredients: ["eggs", "spinach", "onion", "cheese", "butter", "salt", "pepper"], time: "10 min", difficulty: "easy" },
      ]
    });
  }
  if (prompt.includes("shopping list")) {
    return JSON.stringify({
      shoppingList: [
        { category: "Produce", items: ["spinach", "tomatoes", "onions", "garlic", "lemons"] },
        { category: "Grains", items: ["quinoa", "brown rice"] },
        { category: "Protein", items: ["chicken breast", "eggs", "chickpeas"] },
        { category: "Dairy", items: ["feta cheese", "Greek yogurt"] },
        { category: "Pantry", items: ["olive oil", "soy sauce", "salt", "pepper"] },
      ]
    });
  }
  return JSON.stringify({ message: "Plan generated — customize in the app." });
}

// ── PUBLIC API ──

export interface MealIdea {
  name: string;
  ingredients: string[];
  instructions: string;
  prepTime: string;
  difficulty: "easy" | "medium" | "hard";
  calories?: number;
}

export interface RecipeBreakdown {
  name: string;
  servings: number;
  ingredients: { name: string; quantity: string; unit: string }[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  nutrition: { calories: string; protein: string; carbs: string; fat: string };
}

export interface DailyMenu {
  day: string;
  breakfast: MealIdea;
  lunch: MealIdea;
  dinner: MealIdea;
  snack: MealIdea;
}

export interface ShoppingListItem {
  name: string;
  quantity: string;
  unit: string;
  category: string;
}

export interface WeeklyPlan {
  menu: DailyMenu[];
  shoppingList: { category: string; items: string[] }[];
  totalPrepTime: string;
}

// ── 1. Suggest meals from ingredients ──

export async function suggestMealsFromIngredients(ingredients: string[], preferences?: {
  diet?: string; // vegan, keto, etc.
  allergies?: string[];
  maxTime?: number; // minutes
}): Promise<MealIdea[]> {
  const prompt = `I have these ingredients: ${ingredients.join(", ")}.
${preferences?.diet ? `Diet preference: ${preferences.diet}. ` : ""}
${preferences?.allergies?.length ? `Allergies: ${preferences.allergies.join(", ")}. ` : ""}
${preferences?.maxTime ? `Max prep time: ${preferences.maxTime} minutes. ` : ""}

Suggest 3-5 meals I can make. Return ONLY valid JSON in this format:
{
  "meals": [
    { "name": "...", "ingredients": ["...", "..."], "instructions": "Brief 2-3 step instructions", "prepTime": "X min", "difficulty": "easy|medium|hard", "calories": 400 }
  ]
}`;

  try {
    const result = JSON.parse(await callAI(prompt));
    return result.meals || [];
  } catch {
    const fallback = JSON.parse(generateFallback("meal ideas"));
    return fallback.meals || [];
  }
}

// ── 2. Break down a recipe ──

export async function breakdownRecipe(recipeText: string): Promise<RecipeBreakdown> {
  const prompt = `Break down this recipe into structured data:
"${recipeText}"

Return ONLY valid JSON:
{
  "name": "Recipe Name",
  "servings": 4,
  "ingredients": [{ "name": "ingredient", "quantity": "2", "unit": "cups" }],
  "instructions": ["step 1", "step 2"],
  "prepTime": "15 min",
  "cookTime": "30 min",
  "nutrition": { "calories": "450", "protein": "30g", "carbs": "45g", "fat": "15g" }
}`;

  try {
    return JSON.parse(await callAI(prompt));
  } catch {
    return {
      name: "Custom Recipe",
      servings: 2,
      ingredients: recipeText.split(",").map(i => ({ name: i.trim(), quantity: "1", unit: "portion" })),
      instructions: ["Prepare ingredients", "Cook as described", "Serve"],
      prepTime: "20 min",
      cookTime: "30 min",
      nutrition: { calories: "500", protein: "25g", carbs: "50g", fat: "20g" },
    };
  }
}

// ── 3. Generate weekly menu ──

export async function generateWeeklyMenu(preferences?: {
  diet?: string;
  allergies?: string[];
  caloriesPerDay?: number;
  mealsPerDay?: number;
  cuisine?: string;
  budget?: "low" | "medium" | "high";
}): Promise<WeeklyPlan> {
  const prompt = `Create a 7-day meal plan.
${preferences?.diet ? `Diet: ${preferences.diet}. ` : ""}
${preferences?.allergies?.length ? `Allergies: ${preferences.allergies.join(", ")}. ` : ""}
${preferences?.caloriesPerDay ? `Target: ${preferences.caloriesPerDay} calories/day. ` : ""}
${preferences?.cuisine ? `Cuisine preference: ${preferences.cuisine}. ` : ""}
${preferences?.budget ? `Budget: ${preferences.budget}. ` : ""}

For each day, provide breakfast, lunch, dinner, and a snack. Then generate a consolidated shopping list organized by category (Produce, Protein, Grains, Dairy, Pantry).

Return ONLY valid JSON:
{
  "menu": [
    {
      "day": "Monday",
      "breakfast": { "name": "...", "ingredients": ["..."], "instructions": "...", "prepTime": "10 min", "difficulty": "easy", "calories": 400 },
      "lunch": { ... },
      "dinner": { ... },
      "snack": { ... }
    }
  ],
  "shoppingList": [
    { "category": "Produce", "items": ["spinach x1 bag", "tomatoes x4", "onions x2"] },
    { "category": "Protein", "items": ["chicken breast 500g", "eggs x6"] }
  ],
  "totalPrepTime": "~45 min/day average"
}`;

  try {
    const result = JSON.parse(await callAI(prompt));
    return result;
  } catch {
    const fallback = JSON.parse(generateFallback("shopping list"));
    return {
      menu: [
        { day: "Monday", breakfast: { name: "Oatmeal", ingredients: ["oats","milk","banana"], instructions: "Cook oats, top with banana", prepTime:"5 min", difficulty:"easy", calories:350 }, lunch: { name: "Salad", ingredients: ["greens","chicken","dressing"], instructions: "Toss and serve", prepTime:"10 min", difficulty:"easy", calories:400 }, dinner: { name: "Stir Fry", ingredients: ["rice","veg","soy sauce"], instructions: "Stir fry and serve", prepTime:"20 min", difficulty:"easy", calories:500 }, snack: { name: "Yogurt", ingredients: ["yogurt","honey"], instructions: "Mix and enjoy", prepTime:"1 min", difficulty:"easy", calories:150 } },
        { day: "Tuesday", breakfast: { name: "Toast", ingredients: ["bread","avocado","egg"], instructions: "Toast, top, serve", prepTime:"5 min", difficulty:"easy", calories:350 }, lunch: { name: "Wrap", ingredients: ["tortilla","turkey","greens"], instructions: "Wrap and serve", prepTime:"5 min", difficulty:"easy", calories:400 }, dinner: { name: "Pasta", ingredients: ["pasta","tomato sauce","cheese"], instructions: "Cook pasta, add sauce", prepTime:"20 min", difficulty:"easy", calories:500 }, snack: { name: "Apple", ingredients: ["apple","peanut butter"], instructions: "Slice and dip", prepTime:"1 min", difficulty:"easy", calories:200 } },
        { day: "Wednesday", breakfast: { name: "Smoothie", ingredients: ["banana","spinach","milk","protein"], instructions: "Blend all", prepTime:"5 min", difficulty:"easy", calories:350 }, lunch: { name: "Soup", ingredients: ["broth","vegetables","noodles"], instructions: "Simmer and serve", prepTime:"15 min", difficulty:"easy", calories:350 }, dinner: { name: "Grilled Fish", ingredients: ["fish","lemon","herbs","rice"], instructions: "Grill fish, serve with rice", prepTime:"25 min", difficulty:"medium", calories:450 }, snack: { name: "Nuts", ingredients: ["almonds","raisins"], instructions: "Mix in bowl", prepTime:"1 min", difficulty:"easy", calories:200 } },
        { day: "Thursday", breakfast: { name: "Eggs", ingredients: ["eggs","toast","butter"], instructions: "Fry eggs, toast bread", prepTime:"5 min", difficulty:"easy", calories:350 }, lunch: { name: "Bowl", ingredients: ["rice","beans","avocado","salsa"], instructions: "Layer in bowl", prepTime:"10 min", difficulty:"easy", calories:450 }, dinner: { name: "Chicken", ingredients: ["chicken","potatoes","veg"], instructions: "Roast chicken and veg", prepTime:"40 min", difficulty:"medium", calories:550 }, snack: { name: "Crackers", ingredients: ["crackers","hummus"], instructions: "Dip and enjoy", prepTime:"1 min", difficulty:"easy", calories:180 } },
        { day: "Friday", breakfast: { name: "Pancakes", ingredients: ["flour","egg","milk","syrup"], instructions: "Mix and cook", prepTime:"15 min", difficulty:"easy", calories:400 }, lunch: { name: "Sandwich", ingredients: ["bread","ham","cheese","greens"], instructions: "Assemble sandwich", prepTime:"5 min", difficulty:"easy", calories:400 }, dinner: { name: "Pizza", ingredients: ["dough","sauce","cheese","toppings"], instructions: "Top and bake", prepTime:"30 min", difficulty:"medium", calories:600 }, snack: { name: "Fruit", ingredients: ["berries","cream"], instructions: "Serve in bowl", prepTime:"1 min", difficulty:"easy", calories:150 } },
        { day: "Saturday", breakfast: { name: "Bagel", ingredients: ["bagel","cream cheese","salmon"], instructions: "Toast, spread, top", prepTime:"5 min", difficulty:"easy", calories:400 }, lunch: { name: "Leftovers", ingredients: ["leftover protein","rice","veg"], instructions: "Reheat and serve", prepTime:"5 min", difficulty:"easy", calories:450 }, dinner: { name: "Burger", ingredients: ["patty","bun","cheese","greens"], instructions: "Grill patty, assemble", prepTime:"20 min", difficulty:"easy", calories:550 }, snack: { name: "Popcorn", ingredients: ["kernels","butter","salt"], instructions: "Pop and season", prepTime:"5 min", difficulty:"easy", calories:150 } },
        { day: "Sunday", breakfast: { name: "French Toast", ingredients: ["bread","egg","cinnamon","syrup"], instructions: "Dip bread, fry, serve", prepTime:"15 min", difficulty:"easy", calories:400 }, lunch: { name: "Roast Veg", ingredients: ["vegetables","olive oil","herbs"], instructions: "Roast until tender", prepTime:"30 min", difficulty:"easy", calories:350 }, dinner: { name: "Stew", ingredients: ["beef","potatoes","carrots","broth"], instructions: "Slow cook all day", prepTime:"10 min", difficulty:"easy", calories:500 }, snack: { name: "Cheese Plate", ingredients: ["cheese","crackers","grapes"], instructions: "Arrange on plate", prepTime:"2 min", difficulty:"easy", calories:200 } },
      ],
      shoppingList: fallback.shoppingList,
      totalPrepTime: "~30 min/day average",
    };
  }
}

// ── 4. Generate consolidated shopping list from menu ──

export function generateShoppingList(menu: DailyMenu[]): { category: string; items: string[] }[] {
  const allIngredients = new Map<string, { count: number; category: string }>();
  
  const categorize = (name: string): string => {
    const produce = ["spinach","lettuce","greens","tomato","onion","garlic","lemon","banana","apple","berries","grapes","avocado","cucumber","carrot","potato","broccoli","mixed veg","vegetables","herbs","ginger","salsa","fruit"];
    const protein = ["chicken","beef","fish","turkey","ham","salmon","eggs","patty","protein","chickpeas","beans","tofu"];
    const grains = ["rice","pasta","bread","oats","flour","dough","tortilla","noodles","bagel","crackers","kernels","quinoa"];
    const dairy = ["milk","cheese","yogurt","butter","cream","cream cheese","feta"];
    const pantry = ["olive oil","soy sauce","salt","pepper","syrup","honey","cinnamon","dressing","sauce","broth","peanut butter","hummus","raisins","almonds","nuts"];
    
    const lower = name.toLowerCase();
    if (produce.some(p => lower.includes(p))) return "Produce";
    if (protein.some(p => lower.includes(p))) return "Protein";
    if (grains.some(p => lower.includes(p))) return "Grains";
    if (dairy.some(p => lower.includes(p))) return "Dairy";
    return "Pantry";
  };

  for (const day of menu) {
    for (const meal of [day.breakfast, day.lunch, day.dinner, day.snack]) {
      for (const ingredient of meal.ingredients) {
        const lower = ingredient.toLowerCase().trim();
        const existing = allIngredients.get(lower);
        if (existing) {
          existing.count++;
        } else {
          allIngredients.set(lower, { count: 1, category: categorize(lower) });
        }
      }
    }
  }

  // Group by category
  const byCategory = new Map<string, string[]>();
  for (const [name, info] of allIngredients) {
    const cat = info.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(info.count > 1 ? `${name} (x${info.count})` : name);
  }

  return Array.from(byCategory.entries()).map(([category, items]) => ({ category, items }));
}

// ── 5. Save/load meal plans ──

export function saveMealPlan(userId: number, plan: WeeklyPlan) {
  const db = getDb();
  if (!db) return;
  try {
    db.prepare(
      "INSERT OR REPLACE INTO meal_plans (user_id, week_start, plan_data, shopping_list, created_at) VALUES (?, date('now', 'weekday 1', '-7 days'), ?, ?, datetime('now'))"
    ).run(userId, JSON.stringify(plan.menu), JSON.stringify(plan.shoppingList));
  } catch (e) {
    console.warn("saveMealPlan failed:", e);
  }
}

export function getMealPlan(userId: number): WeeklyPlan | null {
  const db = getDb();
  if (!db) return null;
  try {
    const row = db.prepare(
      "SELECT plan_data, shopping_list FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
    ).get(userId) as any;
    if (!row) return null;
    return {
      menu: JSON.parse(row.plan_data),
      shoppingList: JSON.parse(row.shopping_list),
      totalPrepTime: "~30 min/day",
    };
  } catch {
    return null;
  }
}
