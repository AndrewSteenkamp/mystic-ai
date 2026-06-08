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
  if (prompt.includes("7-day meal plan") || prompt.includes("Create a 7-day") || prompt.includes("weekly menu") || prompt.includes("weekly meal")) {
    return JSON.stringify(generateFallbackWeeklyMenu());
  }
  return JSON.stringify({ message: "Plan generated — customize in the app." });
}

function generateFallbackWeeklyMenu() {
  const simpleMeal = (name: string, ings: string[], time: string, cal: number) => ({
    name,
    ingredients: ings,
    instructions: `Prepare ${name.toLowerCase()} using the listed ingredients.`,
    prepTime: time,
    difficulty: "easy" as const,
    calories: cal,
  });
  return {
    menu: [
      { day: "Monday",    breakfast: simpleMeal("Oatmeal with Banana", ["oats","milk","banana","honey"], "10 min", 380), lunch: simpleMeal("Chicken Salad",     ["chicken breast","lettuce","tomato","olive oil"], "15 min", 420), dinner: simpleMeal("Pasta with Tomato Sauce", ["pasta","tomato sauce","garlic","olive oil"], "20 min", 550), snack: simpleMeal("Greek Yogurt",  ["greek yogurt","honey"], "2 min", 150) },
      { day: "Tuesday",   breakfast: simpleMeal("Avocado Toast",    ["bread","avocado","egg","salt"], "10 min", 420), lunch: simpleMeal("Tuna Wrap",          ["tortilla","tuna","lettuce","mayo"], "10 min", 430), dinner: simpleMeal("Stir Fry Vegetables & Rice", ["rice","mixed veg","soy sauce","garlic"], "20 min", 500), snack: simpleMeal("Apple with Peanut Butter", ["apple","peanut butter"], "2 min", 200) },
      { day: "Wednesday", breakfast: simpleMeal("Smoothie",         ["banana","spinach","milk","honey"], "5 min", 320), lunch: simpleMeal("Lentil Soup",        ["lentils","carrot","onion","broth"], "25 min", 380), dinner: simpleMeal("Grilled Chicken with Rice", ["chicken breast","rice","broccoli","butter"], "25 min", 580), snack: simpleMeal("Mixed Nuts",  ["almonds","cashews"], "1 min", 180) },
      { day: "Thursday",  breakfast: simpleMeal("Scrambled Eggs & Toast", ["eggs","bread","butter","salt"], "8 min", 380), lunch: simpleMeal("Rice Bowl with Beans", ["rice","black beans","avocado","salsa"], "15 min", 480), dinner: simpleMeal("Roast Chicken with Potatoes", ["chicken","potatoes","carrot","olive oil"], "40 min", 600), snack: simpleMeal("Banana",       ["banana"], "1 min", 100) },
      { day: "Friday",    breakfast: simpleMeal("Pancakes",         ["flour","egg","milk","syrup"], "15 min", 480), lunch: simpleMeal("Ham & Cheese Sandwich", ["bread","ham","cheese","lettuce"], "8 min", 450), dinner: simpleMeal("Pizza Margherita",    ["pizza base","tomato sauce","mozzarella","basil"], "25 min", 650), snack: simpleMeal("Fruit Salad",  ["apple","banana","grapes"], "5 min", 150) },
      { day: "Saturday",  breakfast: simpleMeal("Bagel with Cream Cheese", ["bagel","cream cheese","smoked salmon"], "8 min", 420), lunch: simpleMeal("Leftover Remix",      ["leftover protein","rice","vegetables"], "10 min", 480), dinner: simpleMeal("Beef Burger & Fries", ["burger bun","beef patty","cheese","potatoes"], "25 min", 700), snack: simpleMeal("Popcorn",       ["popcorn","butter"], "5 min", 180) },
      { day: "Sunday",    breakfast: simpleMeal("French Toast",     ["bread","egg","cinnamon","syrup"], "15 min", 450), lunch: simpleMeal("Roasted Vegetables",  ["sweet potato","carrot","beetroot","olive oil"], "30 min", 400), dinner: simpleMeal("Beef Stew",           ["beef","potato","carrot","broth"], "60 min", 620), snack: simpleMeal("Cheese & Crackers", ["cheese","crackers"], "3 min", 220) },
    ],
    shoppingList: [
      { category: "Produce", items: ["spinach", "tomatoes x6", "onions x4", "garlic x1", "lemons x2", "bananas x5", "apples x4", "carrots x1kg", "potatoes x1kg", "broccoli x1", "lettuce x1", "avocados x3", "sweet potato x1kg", "beetroot x1"] },
      { category: "Protein", items: ["chicken breast 1kg", "eggs x12", "beef patties x4", "beef stew meat 500g", "tuna 1 can", "ham 200g", "smoked salmon 100g"] },
      { category: "Grains", items: ["oats", "brown rice 1kg", "white rice 1kg", "pasta 500g", "bread 1 loaf", "tortillas x4", "bagels x4", "pizza base x1", "burger buns x4", "flour 1kg", "crackers"] },
      { category: "Dairy", items: ["milk 2L", "greek yogurt 500g", "butter 250g", "cheese 200g", "cream cheese 250g", "mozzarella 200g"] },
      { category: "Pantry", items: ["olive oil", "soy sauce", "salt", "pepper", "syrup", "honey", "cinnamon", "mayo", "tomato sauce", "salsa", "broth", "peanut butter", "mixed nuts", "popcorn kernels"] },
    ],
    totalPrepTime: "~25 min/day average",
  };
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
    if (result && Array.isArray(result.menu) && result.menu.length > 0) {
      return result;
    }
    // AI returned JSON but no menu array — fall through to the hardcoded plan below
    console.warn("[generateWeeklyMenu] AI returned no menu, using fallback");
  } catch {
    // AI failed or returned invalid JSON — fall through
  }
  // Hardcoded fallback: 7-day plan with shopping list
  const fallback = JSON.parse(generateFallback("weekly menu"));
  return {
    menu: fallback.menu,
    shoppingList: fallback.shoppingList,
    totalPrepTime: fallback.totalPrepTime,
  };
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
