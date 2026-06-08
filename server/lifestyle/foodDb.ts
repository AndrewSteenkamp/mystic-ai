// ============================================================
// MYSTIC AI — FOOD DATABASE
// 500+ items: SA staples, global common foods, branded basics.
// All values are per 100g, rounded to 1 decimal.
// kJ is the unit of energy; calories are the same thing divided
// by 4.184 (1 kcal = 4.184 kJ). South Africa labels kJ by law,
// so we lead with kJ and show kcal as a courtesy.
//
// Sources: SA FoodData tables (MRC), USDA FoodData Central, and
// standard manufacturer labels for branded items. All numbers
// are typical values, not lab measurements — good enough for a
// daily tracker, not good enough for clinical nutrition.
// ============================================================

export interface FoodItem {
  id: string;             // slug
  name: string;           // display name
  category: string;       // produce, protein, grain, dairy, etc.
  region?: string;        // sa, global, branded
  kj: number;             // per 100g
  kcal: number;           // per 100g
  protein: number;        // grams per 100g
  carbs: number;          // grams per 100g
  fat: number;            // grams per 100g
  fiber?: number;         // grams per 100g
  aliases?: string[];     // alternate names for search match
}

// Helper to build a row with the kcal auto-computed from kJ.
// kJ -> kcal = kJ / 4.184. We round to whole kcal for label realism.
function row(
  id: string,
  name: string,
  category: string,
  kj: number,
  protein: number,
  carbs: number,
  fat: number,
  opts: { region?: string; fiber?: number; aliases?: string[] } = {}
): FoodItem {
  return {
    id,
    name,
    category,
    region: opts.region ?? "global",
    kj,
    kcal: Math.round(kj / 4.184),
    protein,
    carbs,
    fat,
    fiber: opts.fiber,
    aliases: opts.aliases,
  };
}

export const FOOD_DB: FoodItem[] = [
  // ── PRODUCE: SA staples ──
  row("apple", "Apple (raw, with skin)", "produce", 218, 0.3, 14, 0.2, { region: "global", fiber: 2.4, aliases: ["apples", "green apple", "red apple"] }),
  row("banana", "Banana (raw)", "produce", 372, 1.1, 23, 0.3, { region: "global", fiber: 2.6, aliases: ["bananas"] }),
  row("orange", "Orange (raw)", "produce", 197, 0.9, 12, 0.1, { region: "global", fiber: 2.4, aliases: ["oranges", "navel orange", "valencia"] }),
  row("naartjie", "Naartjie (raw)", "produce", 197, 0.6, 13, 0.2, { region: "sa", fiber: 1.8, aliases: ["tangerine", "mandarin", "satsuma", "naartjies"] }),
  row("grape", "Grapes (raw)", "produce", 288, 0.7, 18, 0.2, { region: "global", fiber: 0.9, aliases: ["grapes"] }),
  row("strawberry", "Strawberries (raw)", "produce", 136, 0.7, 7.7, 0.3, { region: "global", fiber: 2.0, aliases: ["strawberries"] }),
  row("blueberry", "Blueberries (raw)", "produce", 240, 0.7, 14, 0.3, { region: "global", fiber: 2.4, aliases: ["blueberries", "berry"] }),
  row("raspberry", "Raspberries (raw)", "produce", 209, 1.2, 12, 0.7, { region: "global", fiber: 6.5, aliases: ["raspberries"] }),
  row("watermelon", "Watermelon (raw)", "produce", 127, 0.6, 7.6, 0.2, { region: "global", fiber: 0.4, aliases: ["watemelon"] }),
  row("pineapple", "Pineapple (raw)", "produce", 209, 0.5, 13, 0.1, { region: "global", fiber: 1.4, aliases: ["pineapples"] }),
  row("mango", "Mango (raw)", "produce", 272, 0.8, 17, 0.4, { region: "global", fiber: 1.6, aliases: ["mangoes", "mangos"] }),
  row("papaya", "Papaya (raw)", "produce", 183, 0.5, 11, 0.3, { region: "global", fiber: 1.7, aliases: ["papaw", "pawpaw"] }),
  row("pawpaw", "Pawpaw (raw)", "produce", 183, 0.5, 11, 0.3, { region: "global", fiber: 1.7, aliases: ["papaya"] }),
  row("avocado", "Avocado (raw)", "produce", 670, 2.0, 8.5, 15, { region: "global", fiber: 6.7, aliases: ["avocados", "avo", "avos", "pear"] }),
  row("pear", "Pear (raw, with skin)", "produce", 239, 0.4, 15, 0.1, { region: "global", fiber: 3.1, aliases: ["pears"] }),
  row("peach", "Peach (raw)", "produce", 165, 0.9, 9.5, 0.3, { region: "global", fiber: 1.5, aliases: ["peaches"] }),
  row("plum", "Plum (raw)", "produce", 192, 0.7, 11, 0.3, { region: "global", fiber: 1.4, aliases: ["plums"] }),
  row("kiwi", "Kiwi Fruit (raw)", "produce", 264, 1.1, 15, 0.5, { region: "global", fiber: 3.0, aliases: ["kiwifruit", "kiwis"] }),
  row("lemon", "Lemon (raw)", "produce", 121, 1.1, 9.3, 0.3, { region: "global", fiber: 2.8, aliases: ["lemons"] }),
  row("lime", "Lime (raw)", "produce", 109, 0.7, 10, 0.2, { region: "global", fiber: 2.8, aliases: ["limes"] }),
  row("grapefruit", "Grapefruit (raw)", "produce", 138, 0.8, 9.0, 0.1, { region: "global", fiber: 1.6, aliases: ["grapefruits", "pomelo"] }),
  row("cherry", "Cherries (raw)", "produce", 263, 1.1, 16, 0.3, { region: "global", fiber: 2.1, aliases: ["cherries"] }),
  row("pomegranate", "Pomegranate (raw)", "produce", 285, 1.7, 18, 1.2, { region: "global", fiber: 4.0, aliases: ["pomegranates"] }),
  row("fig", "Figs (raw)", "produce", 249, 0.8, 19, 0.3, { region: "global", fiber: 2.9, aliases: ["figs"] }),
  row("date", "Dates (dried)", "produce", 1190, 1.8, 75, 0.2, { region: "global", fiber: 6.7, aliases: ["dates", "date fruit"] }),

  // ── PRODUCE: vegetables ──
  row("potato", "Potato (boiled, no skin)", "produce", 318, 1.7, 17, 0.1, { region: "global", fiber: 1.5, aliases: ["potatoes", "spud", "spuds", "roasted potato"] }),
  row("sweet-potato", "Sweet Potato (boiled)", "produce", 360, 1.6, 20, 0.1, { region: "global", fiber: 3.0, aliases: ["sweet potato", "yam", "yams"] }),
  row("tomato", "Tomato (raw)", "produce", 74, 0.9, 3.9, 0.2, { region: "global", fiber: 1.2, aliases: ["tomatoes", "tamatar"] }),
  row("onion", "Onion (raw)", "produce", 155, 1.1, 9.0, 0.1, { region: "global", fiber: 1.7, aliases: ["onions", "red onion", "white onion"] }),
  row("garlic", "Garlic (raw)", "produce", 545, 6.4, 33, 0.5, { region: "global", fiber: 2.1, aliases: ["garlic clove"] }),
  row("carrot", "Carrot (raw)", "produce", 175, 0.9, 10, 0.2, { region: "global", fiber: 2.8, aliases: ["carrots"] }),
  row("spinach", "Spinach (raw)", "produce", 97, 2.9, 3.6, 0.4, { region: "global", fiber: 2.2, aliases: ["baby spinach", "spinach leaves"] }),
  row("spinach-cooked", "Spinach (cooked)", "produce", 100, 2.7, 4.0, 0.2, { region: "global", fiber: 2.4 }),
  row("kale", "Kale (raw)", "produce", 205, 4.3, 8.8, 0.9, { region: "global", fiber: 3.6, aliases: ["kale leaves"] }),
  row("lettuce", "Lettuce (raw)", "produce", 55, 1.4, 2.9, 0.2, { region: "global", fiber: 1.3, aliases: ["iceberg", "cos", "romaine", "butter lettuce"] }),
  row("cabbage", "Cabbage (raw)", "produce", 103, 1.3, 5.8, 0.1, { region: "global", fiber: 2.5, aliases: ["green cabbage", "red cabbage"] }),
  row("broccoli", "Broccoli (raw)", "produce", 141, 2.8, 7.0, 0.4, { region: "global", fiber: 2.6, aliases: ["brocoli"] }),
  row("cauliflower", "Cauliflower (raw)", "produce", 104, 1.9, 5.0, 0.3, { region: "global", fiber: 2.0, aliases: ["cauli"] }),
  row("cucumber", "Cucumber (raw, with skin)", "produce", 65, 0.7, 3.6, 0.1, { region: "global", fiber: 0.5, aliases: ["cukes"] }),
  row("bell-pepper-red", "Bell Pepper, Red (raw)", "produce", 130, 1.0, 6.0, 0.3, { region: "global", fiber: 2.1, aliases: ["red pepper", "capsicum red", "sweet pepper"] }),
  row("bell-pepper-green", "Bell Pepper, Green (raw)", "produce", 88, 0.9, 4.6, 0.2, { region: "global", fiber: 1.7, aliases: ["green pepper", "capsicum green"] }),
  row("bell-pepper-yellow", "Bell Pepper, Yellow (raw)", "produce", 130, 1.0, 6.0, 0.3, { region: "global", fiber: 1.7, aliases: ["yellow pepper", "capsicum yellow"] }),
  row("mushroom", "Mushrooms, White (raw)", "produce", 93, 3.1, 3.3, 0.3, { region: "global", fiber: 1.0, aliases: ["mushrooms", "button mushroom"] }),
  row("zucchini", "Zucchini / Baby Marrow (raw)", "produce", 67, 1.2, 3.1, 0.3, { region: "global", fiber: 1.0, aliases: ["baby marrow", "courgette", "courgettes"] }),
  row("eggplant", "Eggplant / Brinjal (raw)", "produce", 100, 1.0, 5.9, 0.2, { region: "global", fiber: 3.0, aliases: ["brinjal", "aubergine"] }),
  row("green-beans", "Green Beans (raw)", "produce", 132, 1.8, 7.0, 0.2, { region: "global", fiber: 2.7, aliases: ["beans green", "string beans"] }),
  row("peas", "Peas (boiled)", "produce", 350, 5.4, 16, 0.4, { region: "global", fiber: 5.5, aliases: ["garden peas", "green peas"] }),
  row("corn", "Sweet Corn (boiled)", "produce", 480, 3.4, 21, 1.5, { region: "global", fiber: 2.4, aliases: ["mealies", "sweet corn", "corn on the cob"] }),
  row("beetroot", "Beetroot (raw)", "produce", 180, 1.6, 10, 0.2, { region: "global", fiber: 2.8, aliases: ["beet", "beets"] }),
  row("butternut", "Butternut (cooked)", "produce", 175, 1.4, 9.0, 0.1, { region: "sa", fiber: 1.8, aliases: ["butternut squash", "butternut pumpkin"] }),
  row("pumpkin", "Pumpkin (cooked)", "produce", 100, 1.0, 5.0, 0.1, { region: "global", fiber: 1.1, aliases: ["pumpkin", "boerpampoen"] }),
  row("brussels-sprouts", "Brussels Sprouts (raw)", "produce", 175, 3.4, 9.0, 0.3, { region: "global", fiber: 3.8, aliases: ["brussel sprouts"] }),
  row("asparagus", "Asparagus (raw)", "produce", 85, 2.2, 4.1, 0.1, { region: "global", fiber: 2.1, aliases: ["asparagas", "spargel"] }),
  row("celery", "Celery (raw)", "produce", 58, 0.7, 3.0, 0.2, { region: "global", fiber: 1.6, aliases: ["celery stalk"] }),
  row("ginger", "Ginger (raw)", "produce", 335, 1.8, 18, 0.8, { region: "global", fiber: 2.0, aliases: ["fresh ginger", "ginger root"] }),

  // ── PROTEIN: meat, poultry, fish ──
  row("chicken-breast", "Chicken Breast (grilled, no skin)", "protein", 670, 31, 0, 3.6, { region: "global", aliases: ["chicken", "grilled chicken", "chicken fillet"] }),
  row("chicken-thigh", "Chicken Thigh (grilled, no skin)", "protein", 830, 25, 0, 11, { region: "global", aliases: ["chicken thigh"] }),
  row("chicken-wing", "Chicken Wing (roasted, skin on)", "protein", 1000, 22, 0, 14, { region: "global", aliases: ["wings", "chicken wings"] }),
  row("beef-lean", "Beef, Lean (cooked)", "protein", 850, 26, 0, 10, { region: "global", aliases: ["lean beef", "beef", "steak"] }),
  row("beef-mince", "Beef Mince (cooked, lean)", "protein", 950, 26, 0, 12, { region: "global", aliases: ["mince", "minced beef", "ground beef"] }),
  row("beef-ribeye", "Beef Ribeye (cooked)", "protein", 1180, 24, 0, 20, { region: "global", aliases: ["ribeye", "rib eye"] }),
  row("lamb", "Lamb (cooked, lean)", "protein", 970, 25, 0, 13, { region: "global", aliases: ["lamb chop", "lamb chops"] }),
  row("pork-loin", "Pork Loin (cooked)", "protein", 770, 28, 0, 7, { region: "global", aliases: ["pork", "pork chop"] }),
  row("pork-bacon", "Bacon (pan-fried)", "protein", 1500, 37, 0.7, 28, { region: "global", aliases: ["bacon", "streaky bacon"] }),
  row("boerewors", "Boerewors (grilled)", "protein", 1200, 18, 1, 25, { region: "sa", aliases: ["wors"] }),
  row("droewors", "Droewors (dried sausage)", "protein", 1800, 30, 5, 30, { region: "sa", aliases: ["dry wors"] }),
  row("sausage", "Sausage (pork, cooked)", "protein", 1100, 13, 1, 23, { region: "global", aliases: ["sausages"] }),
  row("salami", "Salami", "protein", 1700, 22, 1, 35, { region: "global" }),
  row("ham", "Ham (sliced, cooked)", "protein", 480, 18, 0.5, 4, { region: "global", aliases: ["sliced ham"] }),
  row("turkey", "Turkey Breast (roasted)", "protein", 500, 29, 0, 1, { region: "global" }),

  // ── PROTEIN: fish, seafood ──
  row("fish-hake", "Hake (grilled)", "protein", 380, 19, 0, 1, { region: "sa", aliases: ["hake", "fish", "white fish"] }),
  row("fish-cod", "Cod (baked)", "protein", 370, 23, 0, 0.7, { region: "global", aliases: ["cod"] }),
  row("fish-tuna", "Tuna (canned in water, drained)", "protein", 430, 24, 0, 1, { region: "global", aliases: ["tuna", "canned tuna"] }),
  row("fish-salmon", "Salmon (grilled)", "protein", 920, 22, 0, 14, { region: "global", aliases: ["salmon"] }),
  row("fish-sardines", "Sardines (canned in oil)", "protein", 900, 25, 0, 11, { region: "global", aliases: ["sardine", "sardines"] }),
  row("fish-pilchards", "Pilchards (canned in tomato sauce)", "protein", 600, 17, 6, 6, { region: "sa", aliases: ["pilchard", "pilchards"] }),
  row("shrimp", "Shrimp / Prawns (cooked)", "protein", 440, 24, 0.2, 0.3, { region: "global", aliases: ["prawns", "prawn", "shrimp"] }),
  row("mussels", "Mussels (cooked)", "protein", 360, 17, 5, 3, { region: "sa" }),
  row("oyster", "Oysters (raw)", "protein", 270, 5, 5, 2, { region: "global", aliases: ["oysters"] }),
  row("crab", "Crab Meat (cooked)", "protein", 460, 19, 0, 2, { region: "global" }),

  // ── PROTEIN: eggs, dairy, plant ──
  row("egg", "Egg, Whole (boiled)", "protein", 600, 13, 1.1, 11, { region: "global", aliases: ["eggs", "boiled egg", "fried egg", "scrambled egg"] }),
  row("egg-white", "Egg White (raw)", "protein", 200, 11, 0.7, 0.2, { region: "global", aliases: ["egg whites"] }),
  row("milk-full-cream", "Milk, Full Cream", "dairy", 270, 3.3, 4.7, 3.3, { region: "sa", aliases: ["full cream milk", "whole milk"] }),
  row("milk-low-fat", "Milk, Low Fat (2%)", "dairy", 195, 3.4, 4.7, 2.0, { region: "global", aliases: ["low fat milk", "2 percent milk"] }),
  row("milk-skim", "Milk, Skim / Fat Free", "dairy", 145, 3.4, 5.0, 0.2, { region: "global", aliases: ["skim milk", "fat free milk"] }),
  row("milk-amasi", "Amasi (Maas / Sour Milk)", "dairy", 290, 3.5, 4.5, 3.5, { region: "sa", aliases: ["maas", "sour milk"] }),
  row("yogurt-greek", "Yogurt, Greek (plain, full fat)", "dairy", 380, 9.0, 3.6, 5.0, { region: "global", aliases: ["greek yogurt", "greek yoghurt"] }),
  row("yogurt-plain", "Yogurt, Plain (full fat)", "dairy", 280, 3.5, 4.7, 3.3, { region: "global", aliases: ["yoghurt", "yogurt"] }),
  row("yogurt-low-fat", "Yogurt, Low Fat (plain)", "dairy", 230, 4.0, 6.0, 1.5, { region: "global" }),
  row("butter", "Butter", "dairy", 3000, 0.9, 0.1, 81, { region: "global" }),
  row("cheese-cheddar", "Cheese, Cheddar", "dairy", 1700, 25, 1.3, 33, { region: "global", aliases: ["cheddar", "cheese"] }),
  row("cheese-cottage", "Cheese, Cottage (low fat)", "dairy", 350, 12, 2.7, 1.5, { region: "global", aliases: ["cottage cheese"] }),
  row("cheese-feta", "Cheese, Feta", "dairy", 1100, 14, 4, 21, { region: "global", aliases: ["feta"] }),
  row("cheese-mozzarella", "Cheese, Mozzarella", "dairy", 1100, 22, 2.2, 22, { region: "global", aliases: ["mozzarella"] }),
  row("cheese-cream", "Cream Cheese", "dairy", 1500, 6.0, 4.0, 34, { region: "global" }),
  row("cream", "Cream, Whipping", "dairy", 1300, 2.5, 3.0, 33, { region: "global", aliases: ["whipping cream", "thick cream"] }),
  row("cream-sour", "Sour Cream", "dairy", 1100, 2.4, 4.0, 24, { region: "global" }),
  row("ricotta", "Ricotta", "dairy", 700, 11, 3, 13, { region: "global" }),

  // ── PROTEIN: plant ──
  row("tofu", "Tofu, Firm (raw)", "protein", 540, 12, 2, 7, { region: "global", aliases: ["bean curd"] }),
  row("tempeh", "Tempeh", "protein", 800, 19, 9, 11, { region: "global" }),
  row("lentils-cooked", "Lentils (boiled)", "protein", 450, 9.0, 20, 0.4, { region: "global", fiber: 7.9, aliases: ["lentil", "lentils"] }),
  row("chickpeas-cooked", "Chickpeas (boiled)", "protein", 690, 9.0, 27, 2.6, { region: "global", fiber: 7.6, aliases: ["chickpea", "garbanzo"] }),
  row("black-beans-cooked", "Black Beans (boiled)", "protein", 540, 8.9, 24, 0.5, { region: "global", fiber: 8.7, aliases: ["black bean", "black beans"] }),
  row("kidney-beans-cooked", "Kidney Beans (boiled)", "protein", 530, 8.7, 23, 0.5, { region: "global", fiber: 6.4, aliases: ["kidney bean", "kidney beans", "red kidney beans"] }),
  row("baked-beans", "Baked Beans (canned in tomato sauce)", "protein", 380, 5.0, 14, 0.4, { region: "global", aliases: ["beans in tomato sauce"] }),
  row("edamame", "Edamame (boiled)", "protein", 580, 11, 9, 5, { region: "global", aliases: ["edamame beans"] }),
  row("peanut-butter", "Peanut Butter (smooth)", "protein", 2500, 25, 20, 50, { region: "global", aliases: ["pb"] }),
  row("almonds", "Almonds (raw)", "protein", 2400, 21, 22, 50, { region: "global", fiber: 12 }),
  row("cashews", "Cashews (raw)", "protein", 2300, 18, 30, 44, { region: "global" }),
  row("walnuts", "Walnuts (raw)", "protein", 2700, 15, 14, 65, { region: "global" }),
  row("pecans", "Pecans (raw)", "protein", 2900, 9, 14, 72, { region: "global" }),
  row("brazil-nuts", "Brazil Nuts (raw)", "protein", 2750, 14, 12, 67, { region: "global" }),
  row("macadamia", "Macadamia Nuts (raw)", "protein", 3000, 8, 14, 76, { region: "global" }),
  row("pistachios", "Pistachios (roasted, salted)", "protein", 2350, 21, 28, 46, { region: "global" }),
  row("sunflower-seeds", "Sunflower Seeds (kernels)", "protein", 2450, 21, 20, 51, { region: "global" }),
  row("pumpkin-seeds", "Pumpkin Seeds (kernels)", "protein", 2300, 30, 11, 49, { region: "global", aliases: ["pepitas"] }),
  row("chia-seeds", "Chia Seeds (dried)", "protein", 1900, 17, 42, 31, { region: "global", fiber: 34 }),
  row("flaxseeds", "Flaxseeds / Linseeds", "protein", 2250, 18, 29, 42, { region: "global", fiber: 27, aliases: ["linseeds"] }),
  row("hummus", "Hummus", "protein", 800, 7, 14, 9, { region: "global" }),

  // ── GRAINS, BREAD, CEREALS ──
  row("rice-white-cooked", "Rice, White (boiled)", "grain", 540, 2.7, 28, 0.3, { region: "global", aliases: ["white rice", "rice"] }),
  row("rice-brown-cooked", "Rice, Brown (boiled)", "grain", 510, 2.6, 26, 1.0, { region: "global", fiber: 2.8, aliases: ["brown rice"] }),
  row("rice-basmati", "Rice, Basmati (boiled)", "grain", 540, 3.0, 28, 0.4, { region: "global", aliases: ["basmati rice"] }),
  row("pap", "Pap (cooked maize meal)", "grain", 380, 3.0, 18, 0.5, { region: "sa", aliases: ["maize porridge", "mealie meal", "sadza", "ugali"] }),
  row("samp", "Samp (cooked)", "grain", 500, 4.0, 24, 0.5, { region: "sa" }),
  row("oats-cooked", "Oats, Rolled (cooked with water)", "grain", 380, 3.0, 16, 1.5, { region: "global", fiber: 2.5, aliases: ["oatmeal", "porridge oats"] }),
  row("bread-white", "Bread, White", "grain", 1050, 9, 49, 3.2, { region: "global", aliases: ["white bread", "toast", "sandwich bread"] }),
  row("bread-whole-wheat", "Bread, Whole Wheat", "grain", 1050, 13, 43, 4.5, { region: "global", fiber: 7.0, aliases: ["wholewheat bread", "brown bread"] }),
  row("bread-rye", "Bread, Rye", "grain", 950, 9, 47, 1.5, { region: "global", fiber: 5.0 }),
  row("bread-sourdough", "Bread, Sourdough", "grain", 1000, 11, 47, 2.5, { region: "global" }),
  row("pita", "Pita Bread", "grain", 1160, 9, 56, 1.0, { region: "global" }),
  row("naan", "Naan Bread", "grain", 1300, 9, 50, 7, { region: "global" }),
  row("roti", "Roti / Chapati", "grain", 1200, 10, 45, 7, { region: "global", aliases: ["chapati", "chappati"] }),
  row("bagel", "Bagel (plain)", "grain", 1200, 10, 55, 2.5, { region: "global" }),
  row("pasta-cooked", "Pasta (boiled)", "grain", 580, 5.0, 31, 0.9, { region: "global", aliases: ["spaghetti", "macaroni", "penne", "noodles"] }),
  row("noodles-egg", "Egg Noodles (boiled)", "grain", 600, 5.0, 27, 1.5, { region: "global" }),
  row("noodles-rice", "Rice Noodles (boiled)", "grain", 480, 0.9, 26, 0.1, { region: "global" }),
  row("quinoa-cooked", "Quinoa (boiled)", "grain", 500, 4.4, 21, 1.9, { region: "global", fiber: 2.8 }),
  row("couscous-cooked", "Couscous (boiled)", "grain", 550, 4.0, 25, 0.7, { region: "global" }),
  row("barley-cooked", "Barley (boiled)", "grain", 480, 2.3, 26, 0.4, { region: "global", fiber: 3.2 }),
  row("muesli", "Muesli (mixed)", "grain", 1550, 10, 65, 5, { region: "global" }),
  row("cornflakes", "Cornflakes", "grain", 1600, 7, 85, 0.5, { region: "global" }),
  row("bran-flakes", "Bran Flakes", "grain", 1500, 11, 70, 2, { region: "global", fiber: 14 }),
  row("granola", "Granola", "grain", 1900, 11, 60, 18, { region: "global" }),

  // ── LEGUMES, NUTS (continued) ──
  row("peanuts", "Peanuts (roasted, salted)", "protein", 2400, 24, 18, 49, { region: "global" }),
  row("pine-nuts", "Pine Nuts", "protein", 2750, 14, 13, 68, { region: "global" }),

  // ── COOKING: oils, fats ──
  row("olive-oil", "Olive Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("sunflower-oil", "Sunflower Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("canola-oil", "Canola Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("coconut-oil", "Coconut Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("margarine", "Margarine / Brick Fat", "fat", 3000, 0, 0, 80, { region: "sa", aliases: ["brick margarine", "stork"] }),
  row("lard", "Lard / Pork Fat", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("mayonnaise", "Mayonnaise", "fat", 2900, 1, 0.6, 75, { region: "global", aliases: ["mayo"] }),

  // ── CONDIMENTS, SAUCES ──
  row("tomato-sauce", "Tomato Sauce / Ketchup", "condiment", 400, 1.7, 25, 0.2, { region: "global", aliases: ["ketchup", "tomato sauce"] }),
  row("mustard", "Mustard (yellow)", "condiment", 250, 4, 6, 3, { region: "global" }),
  row("soy-sauce", "Soy Sauce", "condiment", 240, 8, 5, 0, { region: "global", aliases: ["soya sauce"] }),
  row("worcestershire", "Worcestershire Sauce", "condiment", 350, 0, 19, 0, { region: "global" }),
  row("hot-sauce", "Hot Sauce / Tabasco", "condiment", 100, 0.5, 5, 0.5, { region: "global", aliases: ["tabasco", "peri peri sauce"] }),
  row("salsa", "Salsa", "condiment", 150, 1.5, 9, 0.2, { region: "global" }),
  row("bbq-sauce", "BBQ Sauce", "condiment", 700, 1, 45, 0.5, { region: "global" }),
  row("honey", "Honey", "sweetener", 1400, 0.3, 82, 0, { region: "global" }),
  row("maple-syrup", "Maple Syrup", "sweetener", 1100, 0, 67, 0, { region: "global" }),
  row("sugar-white", "Sugar, White", "sweetener", 1700, 0, 100, 0, { region: "global", aliases: ["white sugar", "caster sugar"] }),
  row("sugar-brown", "Sugar, Brown", "sweetener", 1600, 0, 95, 0, { region: "global" }),
  row("salt", "Salt, Table", "condiment", 0, 0, 0, 0, { region: "global" }),
  row("pepper-black", "Pepper, Black", "condiment", 1050, 10, 64, 3, { region: "global" }),
  row("vinegar", "Vinegar", "condiment", 80, 0, 0.5, 0, { region: "global" }),
  row("jam", "Jam / Jelly", "condiment", 1100, 0.4, 60, 0.1, { region: "global" }),

  // ── BEVERAGES (per 100ml) ──
  row("water", "Water", "beverage", 0, 0, 0, 0, { region: "global" }),
  row("coffee-black", "Coffee, Black (no sugar)", "beverage", 5, 0.1, 0, 0, { region: "global", aliases: ["black coffee"] }),
  row("tea-black", "Tea, Black (no sugar)", "beverage", 4, 0, 0.3, 0, { region: "global", aliases: ["black tea", "rooibos"] }),
  row("rooibos", "Rooibos Tea (no sugar)", "beverage", 4, 0, 0.3, 0, { region: "sa", aliases: ["rooibos tea"] }),
  row("orange-juice", "Orange Juice (fresh)", "beverage", 180, 0.7, 10, 0.2, { region: "global", aliases: ["oj"] }),
  row("apple-juice", "Apple Juice", "beverage", 190, 0.1, 11, 0.1, { region: "global" }),
  row("milk-chocolate", "Chocolate Milk", "beverage", 350, 3.4, 11, 2.5, { region: "global" }),
  row("coca-cola", "Coca-Cola (regular)", "beverage", 180, 0, 11, 0, { region: "branded", aliases: ["coke", "cola"] }),
  row("coca-cola-zero", "Coca-Cola Zero", "beverage", 1, 0, 0, 0, { region: "branded", aliases: ["coke zero"] }),
  row("pepsi", "Pepsi", "beverage", 180, 0, 11, 0, { region: "branded" }),
  row("fanta-orange", "Fanta Orange", "beverage", 190, 0, 12, 0, { region: "branded" }),
  row("sprite", "Sprite", "beverage", 180, 0, 11, 0, { region: "branded" }),
  row("beer-lager", "Beer, Lager (4.5% abv)", "beverage", 175, 0.5, 3.5, 0, { region: "global", aliases: ["beer", "lager"] }),
  row("beer-stout", "Beer, Stout (4.5% abv)", "beverage", 220, 0.6, 5, 0, { region: "global", aliases: ["stout", "guinness"] }),
  row("wine-red", "Wine, Red (13% abv)", "beverage", 355, 0.1, 0.6, 0, { region: "global", aliases: ["red wine"] }),
  row("wine-white", "Wine, White (12% abv)", "beverage", 345, 0.1, 1, 0, { region: "global", aliases: ["white wine"] }),
  row("whisky", "Whisky / Brandy (40% abv, 30ml shot)", "beverage", 280, 0, 0, 0, { region: "global", aliases: ["brandy", "whiskey"] }),
  row("gin-tonic", "Gin & Tonic", "beverage", 150, 0, 8, 0, { region: "global" }),
  row("cider", "Cider (5% abv)", "beverage", 220, 0, 6, 0, { region: "global" }),
  row("energy-drink", "Energy Drink (e.g. Red Bull)", "beverage", 195, 0, 11, 0, { region: "branded" }),

  // ── SNACKS, SWEETS ──
  row("chocolate-dark", "Chocolate, Dark (70% cocoa)", "snack", 2400, 8, 30, 43, { region: "global", aliases: ["dark chocolate"] }),
  row("chocolate-milk", "Chocolate, Milk", "snack", 2300, 7, 60, 30, { region: "global", aliases: ["milk chocolate"] }),
  row("chocolate-white", "Chocolate, White", "snack", 2400, 6, 60, 32, { region: "global", aliases: ["white chocolate"] }),
  row("chips-potato", "Potato Chips / Crisps", "snack", 2200, 6, 50, 33, { region: "global", aliases: ["crisps", "potato crisps"] }),
  row("popcorn-air", "Popcorn (air-popped)", "snack", 1600, 12, 78, 4, { region: "global", fiber: 14, aliases: ["plain popcorn"] }),
  row("popcorn-butter", "Popcorn (with butter)", "snack", 1900, 9, 70, 14, { region: "global" }),
  row("pretzels", "Pretzels (salted)", "snack", 1700, 10, 75, 3, { region: "global" }),
  row("crackers", "Crackers (plain)", "snack", 1900, 10, 70, 14, { region: "global" }),
  row("ice-cream-vanilla", "Ice Cream, Vanilla", "snack", 800, 4, 24, 10, { region: "global", aliases: ["vanilla ice cream"] }),
  row("ice-cream-chocolate", "Ice Cream, Chocolate", "snack", 850, 4, 26, 11, { region: "global", aliases: ["chocolate ice cream"] }),
  row("biscuits-digestive", "Digestive Biscuit", "snack", 2050, 7, 65, 23, { region: "global", aliases: ["digestive biscuit", "digestives"] }),
  row("biscuits-oreo", "Oreo Cookie", "snack", 2000, 5, 70, 20, { region: "branded", aliases: ["oreo", "oreos"] }),
  row("donut-glazed", "Glazed Doughnut", "snack", 1700, 5, 50, 18, { region: "global", aliases: ["doughnut", "donut"] }),
  row("muffin-blueberry", "Blueberry Muffin", "snack", 1450, 5, 55, 11, { region: "global" }),
  row("brownie", "Chocolate Brownie", "snack", 1700, 5, 55, 18, { region: "global" }),
  row("cheesecake", "Cheesecake", "snack", 1300, 5, 28, 22, { region: "global" }),
  row("apple-pie", "Apple Pie", "snack", 1300, 3, 35, 15, { region: "global" }),

  // ── BRANDED / SA-STAPLE BASICS ──
  row("white-bread-600g", "White Bread 600g Loaf (avg)", "grain", 1050, 9, 49, 3.2, { region: "sa", aliases: ["sasko", "alpine", "blue ribbon", "best foods"] }),
  row("russian-sausage", "Russian Sausage (Polony)", "protein", 1100, 12, 2, 22, { region: "sa", aliases: ["polony", "russian"] }),
  row("biltong", "Biltong (dried beef, lean)", "protein", 1000, 50, 1, 5, { region: "sa", aliases: ["biltong"] }),
  row("biltong-wet", "Biltong (dried beef, with fat)", "protein", 1300, 38, 1, 15, { region: "sa" }),
  row("drywors", "Droewors (dried sausage)", "protein", 1800, 30, 5, 30, { region: "sa", aliases: ["droewors"] }),
  row("ackee", "Ackee (canned)", "produce", 580, 4, 9, 16, { region: "sa" }),
  row("morogo", "Morogo / Wild Spinach (cooked)", "produce", 130, 4, 5, 1, { region: "sa", aliases: ["morogo", "wild spinach"] }),
  row("amadumbe", "Amadumbe (Taro, cooked)", "produce", 500, 1.5, 27, 0.2, { region: "sa", aliases: ["amadumbe", "taro"] }),
  row("umngqusho", "Umngqusho (samp & beans)", "grain", 500, 5, 25, 0.5, { region: "sa" }),
  row("chakalaka", "Chakalaka (vegetable relish)", "condiment", 400, 2, 12, 4, { region: "sa" }),
  row("samoosa", "Samoosa (vegetable)", "snack", 1400, 4, 35, 13, { region: "sa", aliases: ["samosa", "samosas"] }),
  row("bobotie", "Bobotie (cooked)", "protein", 850, 18, 15, 9, { region: "sa" }),
  row("biryani-chicken", "Chicken Biryani", "protein", 700, 14, 30, 7, { region: "global", aliases: ["biryani"] }),
  row("bunny-chow", "Bunny Chow (with curry)", "protein", 850, 12, 35, 9, { region: "sa" }),
  row("roti-fillings", "Roti with Filling", "grain", 1100, 10, 45, 9, { region: "sa" }),
  row("vetkoek", "Vetkoek (fried dough)", "grain", 1500, 7, 50, 15, { region: "sa" }),

  // ── PROTEIN: plant-based meat alternatives ──
  row("beyond-burger", "Beyond Burger Patty", "protein", 1000, 18, 5, 17, { region: "branded", aliases: ["beyond", "beyond meat"] }),
  row("impossible-burger", "Impossible Burger Patty", "protein", 1000, 19, 8, 14, { region: "branded" }),
  row("soya-mince", "Soya Mince (dry)", "protein", 1450, 50, 28, 1, { region: "sa", aliases: ["soya mince", "textured vegetable protein"] }),
  row("soya-mince-cooked", "Soya Mince (cooked)", "protein", 550, 17, 9, 0.4, { region: "sa" }),

  // ── COMMON EXTRAS ──
  row("olive-oil-extra-virgin", "Olive Oil, Extra Virgin", "fat", 3700, 0, 0, 100, { region: "global", aliases: ["evoo", "extra virgin olive oil"] }),
  row("coconut-cream", "Coconut Cream", "fat", 1800, 2, 6, 35, { region: "global" }),
  row("coconut-milk", "Coconut Milk (canned)", "fat", 750, 2, 6, 16, { region: "global" }),
  row("coconut-shredded", "Coconut, Shredded (dried)", "fat", 2700, 6, 24, 60, { region: "global" }),
  row("tomato-paste", "Tomato Paste", "condiment", 400, 4, 19, 0.5, { region: "global" }),
  row("tinned-tomatoes", "Tomatoes, Tinned (whole, peeled)", "condiment", 90, 1.6, 4, 0.3, { region: "global", aliases: ["tinned tomato", "tinned tomatoes"] }),
  row("passata", "Passata / Strained Tomatoes", "condiment", 130, 1.6, 6, 0.2, { region: "global" }),
  row("sun-dried-tomato", "Sun-Dried Tomatoes", "condiment", 1000, 14, 55, 3, { region: "global" }),
  row("olives-black", "Olives, Black (in brine)", "condiment", 600, 0.8, 6, 11, { region: "global" }),
  row("olives-green", "Olives, Green (in brine)", "condiment", 580, 1, 3, 12, { region: "global" }),
  row("capers", "Capers (in brine)", "condiment", 100, 2, 4, 0.9, { region: "global" }),
  row("pickle", "Pickle / Gherkin", "condiment", 100, 0.5, 5, 0.3, { region: "global" }),

  // ── BAKING ──
  row("flour-white", "Flour, White (wheat)", "baking", 1500, 10, 76, 1, { region: "global" }),
  row("flour-whole-wheat", "Flour, Whole Wheat", "baking", 1450, 13, 72, 2, { region: "global", fiber: 10 }),
  row("flour-cake", "Flour, Cake / Self-Raising", "baking", 1500, 8, 80, 1, { region: "global" }),
  row("baking-powder", "Baking Powder", "baking", 400, 0, 28, 0, { region: "global" }),
  row("baking-soda", "Baking Soda / Bicarb", "baking", 0, 0, 0, 0, { region: "global", aliases: ["bicarb", "bicarbonate of soda"] }),
  row("yeast", "Yeast, Dry", "baking", 1200, 40, 41, 7, { region: "global" }),
  row("cornflour", "Cornflour / Maize Starch", "baking", 1500, 0.3, 90, 0.1, { region: "global", aliases: ["maize starch", "corn starch"] }),
  row("cocoa-powder", "Cocoa Powder (unsweetened)", "baking", 1100, 20, 60, 14, { region: "global" }),
  row("vanilla-extract", "Vanilla Extract", "baking", 1100, 0, 12, 0, { region: "global" }),

  // ── DRINKS, MORE ──
  row("hot-chocolate", "Hot Chocolate (with milk)", "beverage", 350, 3.4, 11, 2.5, { region: "global" }),
  row("kombucha", "Kombucha", "beverage", 80, 0, 4, 0, { region: "global" }),
  row("almond-milk", "Almond Milk (unsweetened)", "beverage", 100, 0.4, 0.6, 1.1, { region: "global" }),
  row("soy-milk", "Soy Milk", "beverage", 200, 3.3, 1.8, 1.8, { region: "global", aliases: ["soya milk", "soy milk"] }),
  row("oat-milk", "Oat Milk", "beverage", 200, 1.0, 7, 1.5, { region: "global" }),
  row("coconut-water", "Coconut Water", "beverage", 80, 0.7, 3.7, 0.2, { region: "global" }),
  row("lemonade", "Lemonade (sweetened)", "beverage", 180, 0, 11, 0, { region: "global" }),

  // ── FAST FOOD & COMMON TAKEOUT ──
  row("pizza-cheese", "Pizza, Cheese Slice", "fast-food", 1100, 11, 33, 9, { region: "global", aliases: ["pizza", "cheese pizza"] }),
  row("pizza-pepperoni", "Pizza, Pepperoni Slice", "fast-food", 1300, 12, 30, 13, { region: "global" }),
  row("burger-beef", "Beef Burger (plain)", "fast-food", 1200, 18, 0, 23, { region: "global", aliases: ["burger", "beef burger", "hamburger"] }),
  row("burger-cheese", "Cheeseburger", "fast-food", 1250, 17, 30, 16, { region: "global" }),
  row("burger-chicken", "Chicken Burger (grilled)", "fast-food", 1000, 18, 35, 8, { region: "global" }),
  row("fries", "French Fries", "fast-food", 1300, 3, 40, 12, { region: "global", aliases: ["chips", "french fries", "fried chips"] }),
  row("hot-dog", "Hot Dog (with bun)", "fast-food", 1100, 10, 25, 15, { region: "global" }),
  row("fried-chicken", "Fried Chicken (KFC-style, 1 piece)", "fast-food", 1100, 22, 8, 14, { region: "global" }),
  row("nuggets-chicken", "Chicken Nuggets (6 pieces)", "fast-food", 1100, 15, 18, 12, { region: "global" }),
  row("shawarma-chicken", "Chicken Shawarma Wrap", "fast-food", 950, 18, 35, 8, { region: "global", aliases: ["shawarma", "wrap chicken"] }),
  row("burrito-beef", "Beef Burrito", "fast-food", 900, 14, 35, 10, { region: "global", aliases: ["burrito"] }),
  row("taco-beef", "Beef Taco", "fast-food", 1050, 12, 18, 16, { region: "global" }),
  row("sushi-roll", "Sushi Roll (8 pieces)", "fast-food", 600, 8, 30, 1, { region: "global", aliases: ["sushi"] }),
  row("pad-thai", "Pad Thai (chicken)", "fast-food", 800, 14, 35, 10, { region: "global" }),

  // ── CONDIMENTS & SPREADS EXTRA ──
  row("nutella", "Nutella (Hazelnut Spread)", "spread", 2200, 5, 58, 30, { region: "branded" }),
  row("peanut-butter-crunchy", "Peanut Butter, Crunchy", "spread", 2500, 25, 20, 50, { region: "global" }),
  row("jam-strawberry", "Strawberry Jam", "spread", 1100, 0.4, 60, 0.1, { region: "global" }),
  row("marmite", "Marmite (yeast extract)", "spread", 1000, 25, 25, 0, { region: "global", aliases: ["yeast extract"] }),
  row("cream-cheese-philadelphia", "Cream Cheese (Philadelphia)", "dairy", 1500, 6.0, 4.0, 34, { region: "branded" }),
  row("nutella-pb", "Mixed Nut Butter", "spread", 2400, 20, 22, 45, { region: "global" }),

  // ── PRODUCE: more ──
  row("passion-fruit", "Passion Fruit (raw)", "produce", 405, 2.2, 23, 0.7, { region: "global", aliases: ["passionfruit", "granadilla"] }),
  row("guava", "Guava (raw)", "produce", 285, 2.6, 14, 1.0, { region: "global", aliases: ["guavas"] }),
  row("lychee", "Lychee (raw)", "produce", 285, 0.9, 17, 0.4, { region: "global", aliases: ["lychees", "litchi"] }),
  row("dragon-fruit", "Dragon Fruit (raw)", "produce", 230, 1.2, 11, 0.4, { region: "global", aliases: ["pitaya"] }),
  row("persimmon", "Persimmon (raw)", "produce", 295, 0.6, 19, 0.2, { region: "global", aliases: ["sharon fruit"] }),
  row("jackfruit", "Jackfruit (raw)", "produce", 395, 1.7, 23, 0.6, { region: "global" }),
  row("durian", "Durian (raw)", "produce", 615, 2.5, 27, 5.3, { region: "global" }),
  row("starfruit", "Star Fruit (raw)", "produce", 145, 1.0, 7.0, 0.4, { region: "global", aliases: ["carambola"] }),
  row("tamarind", "Tamarind (raw)", "produce", 1000, 2.8, 63, 0.6, { region: "global" }),
  row("cranberry", "Cranberries (raw)", "produce", 200, 0.4, 12, 0.1, { region: "global" }),
  row("coconut-meat", "Coconut Meat (raw, mature)", "produce", 1480, 3.4, 15, 33, { region: "global" }),

  // ── VEGETABLES EXTRA ──
  row("okra", "Okra (raw)", "produce", 145, 2.0, 7.0, 0.2, { region: "global" }),
  row("parsnip", "Parsnip (raw)", "produce", 320, 1.5, 17, 0.3, { region: "global" }),
  row("turnip", "Turnip (raw)", "produce", 110, 1.5, 5.0, 0.2, { region: "global" }),
  row("radish", "Radish (raw)", "produce", 65, 0.7, 3.4, 0.1, { region: "global" }),
  row("leek", "Leek (raw)", "produce", 170, 1.5, 8.0, 0.3, { region: "global" }),
  row("artichoke", "Artichoke (boiled)", "produce", 200, 2.9, 11, 0.3, { region: "global" }),
  row("arugula", "Arugula / Rocket (raw)", "produce", 100, 2.6, 3.7, 0.7, { region: "global", aliases: ["rocket", "arugla"] }),
  row("watercress", "Watercress (raw)", "produce", 65, 2.3, 1.3, 0.1, { region: "global" }),
  row("swiss-chard", "Swiss Chard (raw)", "produce", 80, 1.8, 3.7, 0.2, { region: "global" }),
  row("collard-greens", "Collard Greens (raw)", "produce", 130, 3.0, 5.4, 0.5, { region: "global" }),
  row("mushroom-portobello", "Mushroom, Portobello (raw)", "produce", 95, 3.0, 3.0, 0.3, { region: "global" }),
  row("mushroom-shiitake", "Mushroom, Shiitake (dried)", "produce", 1300, 9.6, 75, 1.0, { region: "global" }),
  row("bamboo-shoots", "Bamboo Shoots (canned)", "produce", 90, 1.7, 3.0, 0.2, { region: "global" }),

  // ── PROTEIN EXTRA: GAME, OFFAL ──
  row("ostrich", "Ostrich Meat (cooked)", "protein", 650, 28, 0, 3, { region: "sa" }),
  row("springbok", "Springbok (cooked)", "protein", 700, 27, 0, 5, { region: "sa", aliases: ["venison", "game"] }),
  row("kudu", "Kudu (cooked)", "protein", 700, 27, 0, 5, { region: "sa" }),
  row("liver-beef", "Beef Liver (cooked)", "protein", 600, 26, 4, 4, { region: "global", aliases: ["liver"] }),
  row("liver-chicken", "Chicken Liver (cooked)", "protein", 540, 25, 1, 4, { region: "global" }),
  row("kidney-beef", "Beef Kidney (cooked)", "protein", 700, 26, 1, 7, { region: "global" }),
  row("tripe", "Tripe (cooked)", "protein", 460, 18, 0, 3, { region: "sa", aliases: ["skop", "maas"] }),

  // ── FISH EXTRA ──
  row("fish-kingklip", "Kingklip (grilled)", "protein", 400, 19, 0, 1, { region: "sa" }),
  row("fish-snoek", "Snoek (grilled)", "protein", 700, 22, 0, 9, { region: "sa" }),
  row("fish-yellowtail", "Yellowtail (grilled)", "protein", 600, 22, 0, 5, { region: "global" }),
  row("fish-mackerel", "Mackerel (grilled)", "protein", 850, 19, 0, 14, { region: "global" }),
  row("fish-snapper", "Snapper (grilled)", "protein", 450, 22, 0, 2, { region: "global" }),
  row("fish-trout", "Trout (grilled)", "protein", 600, 22, 0, 7, { region: "global" }),
  row("fish-anchovies", "Anchovies (canned in oil)", "protein", 870, 26, 0, 10, { region: "global" }),

  // ── BAKED GOODS ──
  row("croissant", "Croissant (plain)", "baked", 1800, 8, 50, 22, { region: "global" }),
  row("muffin-plain", "Muffin, Plain", "baked", 1400, 6, 55, 9, { region: "global" }),
  row("scone", "Scone (plain)", "baked", 1700, 8, 60, 14, { region: "global" }),
  row("pancake", "Pancake (plain)", "baked", 950, 6, 30, 9, { region: "global" }),
  row("waffle", "Waffle (plain)", "baked", 1050, 7, 30, 13, { region: "global" }),
  row("rusk", "Rusk (buttermilk)", "baked", 1700, 10, 70, 9, { region: "sa" }),
  row("baked-cookies", "Chocolate Chip Cookie", "baked", 2100, 5, 65, 25, { region: "global" }),
  row("cake-vanilla", "Cake, Vanilla (with frosting)", "baked", 1500, 4, 60, 12, { region: "global" }),
  row("cake-chocolate", "Cake, Chocolate (with frosting)", "baked", 1550, 4, 55, 16, { region: "global" }),
  row("eclair", "Eclair (chocolate)", "baked", 1450, 6, 35, 18, { region: "global" }),

  // ── SAUCES, STOCK, ETC. ──
  row("stock-chicken", "Chicken Stock", "condiment", 50, 1.0, 1.0, 0.5, { region: "global" }),
  row("stock-vegetable", "Vegetable Stock", "condiment", 30, 0.5, 2, 0.2, { region: "global" }),
  row("stock-beef", "Beef Stock", "condiment", 50, 1.0, 1, 0.4, { region: "global" }),
  row("curry-powder", "Curry Powder", "condiment", 1300, 14, 50, 14, { region: "global" }),
  row("turmeric", "Turmeric (ground)", "condiment", 1300, 8, 65, 3, { region: "global" }),
  row("cumin", "Cumin (ground)", "condiment", 1700, 18, 33, 22, { region: "global" }),
  row("paprika", "Paprika (ground)", "condiment", 1300, 14, 50, 13, { region: "global" }),
  row("cinnamon", "Cinnamon (ground)", "condiment", 1000, 4, 80, 1, { region: "global" }),
  row("nutmeg", "Nutmeg (ground)", "condiment", 2100, 6, 50, 36, { region: "global" }),
  row("cardamom", "Cardamom (ground)", "condiment", 1300, 11, 50, 7, { region: "global" }),

  // ── MILK ALTERNATIVES / SPECIAL ──
  row("rice-milk", "Rice Milk", "beverage", 200, 0.4, 9, 1.0, { region: "global" }),
  row("cashew-milk", "Cashew Milk", "beverage", 100, 0.4, 1.0, 1.5, { region: "global" }),
  row("hazelnut-milk", "Hazelnut Milk", "beverage", 240, 0.4, 3, 4, { region: "global" }),

  // ── POPULAR SPECIFIC ITEMS (Brands common in SA) ──
  row("nandos-quarter", "Nando's Quarter Chicken", "fast-food", 900, 25, 0, 12, { region: "branded", aliases: ["nando's", "nandos"] }),
  row("nandos-wrap", "Nando's Wrap", "fast-food", 1100, 15, 40, 12, { region: "branded" }),
  row("fish-and-chips", "Fish & Chips", "fast-food", 950, 13, 30, 12, { region: "global" }),
  row("ackee-and-saltfish", "Ackee and Saltfish", "protein", 600, 12, 12, 7, { region: "global" }),

  // ── CEREAL EXTRAS ──
  row("weet-bix", "Weet-Bix (1 biscuit ~14g)", "grain", 1500, 12, 70, 2, { region: "sa", fiber: 12, aliases: ["weetbix", "weet bix"] }),
  row("proNutro", "ProNutro (Cereal)", "grain", 1500, 22, 60, 5, { region: "sa", aliases: ["pronutro"] }),
  row("future-life", "Future Life (Cereal)", "grain", 1500, 18, 65, 6, { region: "sa", aliases: ["futurelife"] }),
  row("all-bran", "All-Bran Cereal", "grain", 1300, 14, 65, 4, { region: "global", fiber: 28 }),

  // ── ASIAN FOODS ──
  row("fried-rice", "Fried Rice (with egg)", "grain", 700, 7, 35, 6, { region: "global" }),
  row("spring-roll", "Spring Roll (vegetable, fried)", "fast-food", 1050, 4, 30, 14, { region: "global" }),
  row("dumpling", "Dumpling (steamed, pork)", "fast-food", 950, 9, 30, 7, { region: "global" }),
  row("ramen", "Ramen Noodle Soup", "fast-food", 600, 6, 25, 5, { region: "global" }),
  row("pho", "Pho (beef noodle soup)", "fast-food", 350, 8, 15, 1, { region: "global" }),
  row("curry-chicken", "Chicken Curry (with rice)", "fast-food", 700, 12, 30, 6, { region: "global", aliases: ["chicken curry"] }),
  row("curry-lamb", "Lamb Curry (with rice)", "fast-food", 800, 12, 30, 9, { region: "global" }),
  row("korma", "Korma (mild curry)", "fast-food", 950, 9, 18, 14, { region: "global" }),
  row("vindaloo", "Vindaloo (hot curry)", "fast-food", 800, 11, 15, 10, { region: "global" }),
  row("tikka-masala", "Chicken Tikka Masala", "fast-food", 850, 13, 12, 12, { region: "global" }),

  // ── BABY / TODDLER ──
  row("baby-formula", "Infant Formula (powder)", "baby", 2100, 11, 56, 27, { region: "global", aliases: ["formula", "milk formula"] }),
  row("baby-cereal", "Baby Cereal (rice-based)", "baby", 1600, 7, 80, 1, { region: "global" }),

  // ── SAUCES, HERBS EXTRA ──
  row("parsley", "Parsley (fresh)", "produce", 200, 3.0, 6, 0.8, { region: "global" }),
  row("basil", "Basil (fresh)", "produce", 100, 3.2, 2.7, 0.6, { region: "global" }),
  row("coriander", "Coriander / Cilantro (fresh)", "produce", 95, 2.1, 3.7, 0.5, { region: "global", aliases: ["cilantro"] }),
  row("mint", "Mint (fresh)", "produce", 105, 3.8, 5, 0.7, { region: "global" }),
  row("chives", "Chives (fresh)", "produce", 125, 3.3, 4, 0.7, { region: "global" }),
  row("rosemary", "Rosemary (fresh)", "produce", 215, 3.3, 8, 5, { region: "global" }),
  row("thyme", "Thyme (fresh)", "produce", 220, 5.6, 10, 2, { region: "global" }),
  row("curry-leaves", "Curry Leaves (fresh)", "produce", 290, 6, 6, 1, { region: "global" }),

  // ── ETHIOPIAN/AFRICAN ──
  row("injera", "Injera (Ethiopian flatbread)", "grain", 600, 4, 30, 0.5, { region: "global" }),
  row("kitfo", "Kitfo (Ethiopian beef tartare)", "protein", 1100, 25, 1, 16, { region: "global" }),
  row("doro-wat", "Doro Wat (Ethiopian chicken stew)", "protein", 800, 15, 8, 11, { region: "global" }),
  row("ful-medames", "Ful Medames (fava beans)", "protein", 500, 8, 20, 1, { region: "global" }),

  // ── MIDDLE EASTERN ──
  row("hummus-classic", "Hummus, Classic", "protein", 800, 7, 14, 9, { region: "global" }),
  row("baba-ganoush", "Baba Ganoush", "protein", 650, 4, 7, 12, { region: "global" }),
  row("tabbouleh", "Tabbouleh", "produce", 350, 3, 14, 1.5, { region: "global" }),
  row("falafel", "Falafel (fried chickpea patty)", "protein", 1100, 13, 25, 14, { region: "global" }),
  row("pita-hummus", "Pita Bread with Hummus", "grain", 950, 8, 35, 6, { region: "global" }),
  row("kebab-meat", "Kebab Meat (mixed)", "protein", 1000, 22, 0, 16, { region: "global" }),

  // ── INDIAN / PAKISTANI ──
  row("naan-garlic", "Naan, Garlic", "grain", 1350, 9, 50, 8, { region: "global" }),
  row("rice-pulao", "Rice Pulao / Pilaf", "grain", 700, 4, 30, 6, { region: "global", aliases: ["pulao", "pilaf", "pilau"] }),
  row("dal", "Dal (Lentil Curry)", "protein", 500, 9, 18, 1, { region: "global" }),
  row("samosa-veg", "Samosa, Vegetable", "snack", 1400, 4, 35, 13, { region: "global" }),
  row("pakora", "Pakora (vegetable fritter)", "snack", 1500, 6, 30, 18, { region: "global" }),
  row("tandoori-chicken", "Tandoori Chicken", "protein", 800, 25, 5, 9, { region: "global" }),
  row("palak-paneer", "Palak Paneer", "protein", 700, 12, 8, 12, { region: "global" }),

  // ── MEDITERRANEAN ──
  row("greek-salad", "Greek Salad", "produce", 350, 3, 6, 7, { region: "global" }),
  row("moussaka", "Moussaka", "protein", 700, 8, 14, 12, { region: "global" }),
  row("paella", "Paella (seafood)", "protein", 700, 14, 30, 6, { region: "global" }),
  row("gazpacho", "Gazpacho (cold soup)", "produce", 150, 1, 6, 0.5, { region: "global" }),

  // ── SAUCES, CONDIMENTS EXTRA ──
  row("sriracha", "Sriracha Sauce", "condiment", 200, 1.5, 12, 0.5, { region: "global" }),
  row("pesto", "Pesto (basil)", "condiment", 1900, 4, 5, 40, { region: "global" }),
  row("tomato-pasta-sauce", "Pasta Sauce, Tomato", "condiment", 200, 2, 9, 1, { region: "global" }),
  row("alfredo-sauce", "Alfredo Sauce", "condiment", 1500, 6, 5, 32, { region: "global" }),

  // ── PROTEIN SHAKES / SUPPLEMENTS ──
  row("whey-protein", "Whey Protein Powder", "supplement", 1600, 75, 8, 5, { region: "global", aliases: ["whey", "protein powder"] }),
  row("protein-bar", "Protein Bar (generic)", "supplement", 1500, 30, 35, 12, { region: "global" }),

  // ── ALCOHOL EXTENDED ──
  row("vodka-shot", "Vodka (30ml shot, 40% abv)", "beverage", 280, 0, 0, 0, { region: "global", aliases: ["vodka"] }),
  row("rum-shot", "Rum (30ml shot, 40% abv)", "beverage", 280, 0, 0, 0, { region: "global" }),
  row("tequila-shot", "Tequila (30ml shot, 40% abv)", "beverage", 280, 0, 0, 0, { region: "global" }),
  row("champagne", "Champagne / Sparkling Wine", "beverage", 320, 0.2, 1, 0, { region: "global" }),

  // ── VEGAN DAIRY ALTERNATIVES ──
  row("vegan-cheese", "Vegan Cheese (generic)", "dairy", 1300, 1, 12, 25, { region: "global" }),
  row("vegan-butter", "Vegan Butter / Margarine", "fat", 3000, 0, 0, 80, { region: "global" }),

  // ── FRUIT JUICE / NECTAR ──
  row("grape-juice", "Grape Juice", "beverage", 290, 0.4, 18, 0.1, { region: "global" }),
  row("cranberry-juice", "Cranberry Juice", "beverage", 200, 0, 12, 0, { region: "global" }),
  row("tomato-juice", "Tomato Juice", "beverage", 80, 0.8, 4, 0.1, { region: "global" }),
  row("vegetable-juice", "Vegetable Juice", "beverage", 90, 1, 4, 0.1, { region: "global" }),

  // ── COCONUT PRODUCTS EXTRA ──
  row("coconut-milk-light", "Coconut Milk, Light", "fat", 400, 1, 3, 8, { region: "global" }),

  // ── SA BAKED TREATS ──
  row("koesister", "Koesister", "baked", 1300, 4, 50, 8, { region: "sa" }),
  row("melktert", "Melktert (Milk Tart)", "baked", 950, 5, 30, 7, { region: "sa" }),
  row("malva-pudding", "Malva Pudding", "baked", 1100, 4, 45, 9, { region: "sa" }),

  // ── HEALTHY EXTRAS ──
  row("spirulina", "Spirulina Powder", "supplement", 1200, 57, 24, 8, { region: "global" }),
  row("moringa", "Moringa Powder", "supplement", 1300, 27, 38, 5, { region: "global" }),
  row("wheatgrass", "Wheatgrass Powder", "supplement", 1100, 25, 50, 3, { region: "global" }),
  row("matcha", "Matcha Powder", "beverage", 1300, 30, 20, 5, { region: "global" }),

  // ── COMMON CONDIMENTS (END) ──
  row("apple-cider-vinegar", "Apple Cider Vinegar", "condiment", 100, 0, 0.5, 0, { region: "global" }),

  // ── BABY FOOD ──
  row("baby-puree-fruit", "Baby Fruit Puree", "baby", 300, 0.5, 18, 0.1, { region: "global" }),

  // ── PREPARED / READY MEALS ──
  row("ready-meal-pasta", "Ready Meal, Pasta Bolognese", "prepared", 600, 8, 18, 5, { region: "global" }),
  row("ready-meal-curry", "Ready Meal, Chicken Curry", "prepared", 600, 9, 15, 6, { region: "global" }),
  row("ready-meal-lasagne", "Ready Meal, Lasagne", "prepared", 700, 8, 18, 8, { region: "global" }),

  // ── SOUPS ──
  row("soup-chicken", "Chicken Noodle Soup", "prepared", 200, 4, 7, 2, { region: "global" }),
  row("soup-tomato", "Tomato Soup", "prepared", 200, 1.5, 9, 2, { region: "global" }),
  row("soup-vegetable", "Vegetable Soup", "prepared", 150, 2, 7, 1, { region: "global" }),

  // ── SANDWICHES / WRAPS ──
  row("sandwich-ham-cheese", "Ham & Cheese Sandwich", "fast-food", 1000, 12, 30, 11, { region: "global" }),
  row("sandwich-tuna", "Tuna Sandwich", "fast-food", 950, 12, 28, 10, { region: "global" }),
  row("sandwich-egg", "Egg Sandwich", "fast-food", 950, 10, 30, 10, { region: "global" }),
  row("sandwich-chicken", "Chicken Sandwich", "fast-food", 900, 14, 30, 7, { region: "global" }),
  row("sandwich-avocado", "Avocado Sandwich", "fast-food", 900, 7, 30, 12, { region: "global" }),
  row("wrap-veggie", "Veggie Wrap", "fast-food", 700, 6, 30, 6, { region: "global" }),

  // ── MEALS BOWLED ──
  row("poke-bowl", "Poke Bowl (tuna)", "fast-food", 700, 15, 30, 7, { region: "global" }),
  row("burrito-bowl", "Burrito Bowl (chicken)", "fast-food", 750, 14, 30, 7, { region: "global" }),
  row("acai-bowl", "Acai Bowl", "fast-food", 500, 4, 25, 3, { region: "global" }),

  // ── DAIRY DESSERTS EXTRA ──
  row("yogurt-frozen", "Frozen Yogurt (vanilla)", "snack", 480, 4, 22, 1.5, { region: "global" }),

  // ── CANDIES ──
  row("gummy-bears", "Gummy Bears", "snack", 1400, 6, 80, 0, { region: "global" }),
  row("lollipop", "Lollipop", "snack", 1600, 0, 95, 0, { region: "global" }),
  row("chocolate-bar-mars", "Mars Bar (50g)", "snack", 1900, 5, 70, 18, { region: "branded" }),
  row("chocolate-bar-snickers", "Snickers Bar (50g)", "snack", 2000, 8, 60, 24, { region: "branded" }),

  // ── WATER / DRINKS EXTRA ──
  row("sparkling-water", "Sparkling Water", "beverage", 0, 0, 0, 0, { region: "global" }),
  row("coconut-water-fresh", "Coconut Water (fresh)", "beverage", 80, 0.7, 3.7, 0.2, { region: "global" }),
  row("smoothie-fruit", "Fruit Smoothie (mixed)", "beverage", 250, 1.5, 14, 0.5, { region: "global" }),
  row("smoothie-green", "Green Smoothie", "beverage", 200, 2, 12, 0.5, { region: "global" }),
  row("smoothie-protein", "Protein Smoothie", "beverage", 320, 8, 12, 1.5, { region: "global" }),

  // ── VEGETABLE PROTEINS EXTRA ──
  row("seitan", "Seitan (wheat gluten)", "protein", 600, 25, 14, 2, { region: "global" }),
  row("edamame-cooked", "Edamame (boiled, salted)", "protein", 600, 11, 9, 5, { region: "global" }),

  // ── RARE / SPECIALTY ──
  row("truffle-oil", "Truffle Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("duck", "Duck (roasted, skin on)", "protein", 1300, 19, 0, 25, { region: "global" }),
  row("venison-steak", "Venison Steak (cooked)", "protein", 700, 27, 0, 6, { region: "global" }),
  row("frog-legs", "Frog Legs (cooked)", "protein", 350, 16, 0, 0.3, { region: "global" }),
  row("escargot", "Escargot / Snails (cooked)", "protein", 380, 16, 2, 1.4, { region: "global", aliases: ["snails"] }),

  // ── BABY CARROTS, CANNED VEG ──
  row("canned-corn", "Corn, Canned (drained)", "produce", 380, 3, 18, 1, { region: "global" }),
  row("canned-peas", "Peas, Canned (drained)", "produce", 320, 4, 13, 0.3, { region: "global" }),
  row("canned-mushrooms", "Mushrooms, Canned (drained)", "produce", 90, 2, 3, 0.3, { region: "global" }),
  row("canned-beetroot", "Beetroot, Canned (drained)", "produce", 200, 1.5, 11, 0.1, { region: "global" }),

  // ── SAUCES EXTRA ──
  row("sweet-chilli", "Sweet Chilli Sauce", "condiment", 800, 0.5, 50, 0, { region: "global" }),
  row("teriyaki", "Teriyaki Sauce", "condiment", 600, 4, 25, 0, { region: "global" }),
  row("ranch-dressing", "Ranch Dressing", "condiment", 1700, 1, 5, 40, { region: "global" }),
  row("caesar-dressing", "Caesar Dressing", "condiment", 1900, 2, 5, 45, { region: "global" }),
  row("italian-dressing", "Italian Dressing", "condiment", 1500, 0, 5, 35, { region: "global" }),
  row("vinaigrette", "Vinaigrette", "condiment", 1400, 0, 5, 33, { region: "global" }),

  // ── PROTEIN EXTRAS ──
  row("chicken-tenders", "Chicken Tenders (breaded)", "fast-food", 1100, 18, 18, 11, { region: "global" }),
  row("chicken-wings-baked", "Chicken Wings (baked)", "protein", 950, 25, 0, 13, { region: "global" }),
  row("chicken-strips", "Chicken Strips (plain)", "protein", 800, 28, 0, 8, { region: "global" }),

  // ── SAUCES FOR BBQ ──
  row("peri-peri-sauce", "Peri-Peri Sauce (Nando's style)", "condiment", 400, 1, 8, 4, { region: "sa", aliases: ["nando's sauce", "peri sauce"] }),

  // ── HEALTHY EXTRAS ──
  row("kimchi", "Kimchi (fermented cabbage)", "produce", 150, 2, 5, 0.5, { region: "global" }),
  row("sauerkraut", "Sauerkraut", "produce", 100, 1, 4, 0.2, { region: "global" }),

  // ── FILLER: SA traditional, baby, supplements, spreads, prepared, baking, baked, fat ──
  row("mageu", "Mageu (Maize Drink)", "beverage", 200, 1, 12, 0.5, { region: "sa", aliases: ["mahewu", "amahewu"] }),
  row("motogo", "Motogo (Sorghum Porridge)", "grain", 350, 3, 17, 0.5, { region: "sa", aliases: ["ting"] }),
  row("ting", "Ting (Fermented Sorghum)", "grain", 350, 3, 17, 0.5, { region: "sa" }),
  row("umqombothi", "Umqombothi (Traditional Beer)", "beverage", 200, 1, 8, 0.2, { region: "sa" }),
  row("chutney-mango", "Mango Chutney", "condiment", 600, 0.5, 35, 0.5, { region: "global" }),
  row("chutney-tomato", "Tomato Chutney", "condiment", 400, 1.5, 20, 0.5, { region: "global" }),
  row("achar", "Achar (Pickle)", "condiment", 250, 1, 12, 0.5, { region: "sa" }),
  row("pickled-onions", "Pickled Onions", "condiment", 250, 1, 12, 0.5, { region: "global" }),
  row("chilli-paste", "Chilli Paste (sambal)", "condiment", 600, 4, 25, 4, { region: "global", aliases: ["sambal"] }),
  row("harissa", "Harissa Paste", "condiment", 800, 4, 18, 10, { region: "global" }),
  row("tahini", "Tahini (Sesame Paste)", "spread", 2700, 17, 21, 53, { region: "global" }),
  row("hummus-roasted-red-pepper", "Hummus, Roasted Red Pepper", "spread", 800, 7, 14, 9, { region: "global" }),
  row("caramel", "Caramel Sauce", "spread", 1400, 1, 75, 7, { region: "global" }),
  row("maple-butter", "Maple Butter", "spread", 2400, 0, 60, 30, { region: "global" }),
  row("fruit-jam-mixed", "Mixed Fruit Jam", "spread", 1100, 0.4, 60, 0.1, { region: "global" }),
  row("nuttelex", "Nuttelex (Vegan Spread)", "spread", 2400, 0, 0, 60, { region: "branded" }),
  row("peanut-butter-natural", "Peanut Butter, Natural (no sugar)", "spread", 2500, 25, 20, 50, { region: "global" }),
  row("almond-butter", "Almond Butter", "spread", 2500, 21, 20, 53, { region: "global" }),
  row("cashew-butter", "Cashew Butter", "spread", 2400, 18, 28, 46, { region: "global" }),
  row("cocoa-butter", "Cocoa Butter", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("ghee", "Ghee (Clarified Butter)", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("duck-fat", "Duck Fat", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("beef-tallow", "Beef Tallow", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("avocado-oil", "Avocado Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("sesame-oil", "Sesame Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("peanut-oil", "Peanut Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("flaxseed-oil", "Flaxseed Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("walnut-oil", "Walnut Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("palm-oil", "Palm Oil", "fat", 3700, 0, 0, 100, { region: "global" }),
  row("baby-porridge", "Baby Porridge (fortified)", "baby", 1700, 14, 65, 8, { region: "global" }),
  row("baby-food-jar-veg", "Baby Food Jar (Vegetable)", "baby", 200, 1.5, 9, 0.2, { region: "global" }),
  row("baby-food-jar-meat", "Baby Food Jar (Meat)", "baby", 400, 7, 5, 5, { region: "global" }),
  row("baby-rusks", "Baby Rusks", "baby", 1700, 9, 75, 4, { region: "global" }),
  row("baby-yogurt", "Baby Yogurt (plain)", "baby", 350, 3, 8, 3, { region: "global" }),
  row("follow-on-formula", "Follow-on Formula", "baby", 2100, 14, 55, 24, { region: "global" }),
  row("toddler-snack-bar", "Toddler Snack Bar", "baby", 1700, 5, 65, 13, { region: "global" }),
  row("protein-powder-vegan", "Plant Protein Powder (Pea)", "supplement", 1500, 75, 8, 5, { region: "global" }),
  row("creatine", "Creatine Monohydrate", "supplement", 0, 0, 0, 0, { region: "global" }),
  row("collagen-powder", "Collagen Powder", "supplement", 1500, 90, 0, 0, { region: "global" }),
  row("electrolyte-powder", "Electrolyte Powder", "supplement", 1000, 0, 50, 0, { region: "global" }),
  row("energy-bar", "Energy Bar (Cereal)", "supplement", 1600, 8, 70, 8, { region: "global" }),
  row("meal-replacement-shake", "Meal Replacement Shake", "supplement", 1400, 28, 35, 10, { region: "global" }),
  row("agave-nectar", "Agave Nectar", "sweetener", 1300, 0, 75, 0.5, { region: "global" }),
  row("stevia", "Stevia (powdered)", "sweetener", 0, 0, 0, 0, { region: "global" }),
  row("molasses", "Molasses", "sweetener", 1100, 0, 70, 0, { region: "global" }),
  row("rice-syrup", "Brown Rice Syrup", "sweetener", 1300, 1, 80, 0, { region: "global" }),
  row("date-syrup", "Date Syrup", "sweetener", 1200, 1, 75, 0, { region: "global" }),
  row("icing-sugar", "Icing Sugar / Powdered", "sweetener", 1700, 0, 100, 0, { region: "global" }),
  row("glucose-syrup", "Glucose Syrup", "sweetener", 1300, 0, 80, 0, { region: "global" }),
  row("fructose", "Fructose (powder)", "sweetener", 1700, 0, 100, 0, { region: "global" }),
  row("xanthan-gum", "Xanthan Gum", "baking", 1300, 0, 75, 0, { region: "global" }),
  row("gelatin", "Gelatin (powder)", "baking", 1500, 85, 0, 0, { region: "global" }),
  row("cream-of-tartar", "Cream of Tartar", "baking", 1100, 0, 60, 0, { region: "global" }),
  row("bread-crumbs", "Bread Crumbs (dried)", "baking", 1500, 13, 70, 4, { region: "global" }),
  row("pastry-flour", "Pastry Flour", "baking", 1500, 10, 75, 1, { region: "global" }),
  row("rice-flour", "Rice Flour", "baking", 1500, 6, 80, 1, { region: "global" }),
  row("almond-flour", "Almond Flour / Meal", "baking", 2500, 21, 21, 50, { region: "global" }),
  row("coconut-flour", "Coconut Flour", "baking", 1700, 17, 60, 14, { region: "global" }),
  row("psyllium-husk", "Psyllium Husk", "baking", 800, 4, 80, 0.5, { region: "global", fiber: 70 }),
  row("baking-chocolate", "Baking Chocolate (unsweetened)", "baking", 2400, 12, 22, 50, { region: "global" }),
  row("chocolate-chips", "Chocolate Chips (semi-sweet)", "baking", 2100, 4, 65, 25, { region: "global" }),
  row("dried-apricots", "Apricots, Dried", "baked", 1000, 3, 65, 0.5, { region: "global", fiber: 7 }),
  row("dried-cranberries", "Cranberries, Dried (sweetened)", "baked", 1300, 0, 80, 1, { region: "global" }),
  row("dried-raisins", "Raisins (dried grapes)", "baked", 1300, 3, 80, 0.5, { region: "global", aliases: ["raisins"] }),
  row("dried-prunes", "Prunes (dried plums)", "baked", 1000, 2, 64, 0.2, { region: "global", aliases: ["prunes"] }),
  row("dried-mangoes", "Mangoes, Dried", "baked", 1300, 2, 75, 1, { region: "global" }),
  row("dried-figs", "Figs, Dried", "baked", 1100, 3, 65, 1, { region: "global" }),
  row("coconut-sugar", "Coconut Sugar", "sweetener", 1600, 1, 92, 0.5, { region: "global" }),
  row("sourdough-starter", "Sourdough Starter", "baking", 350, 4, 17, 0.5, { region: "global" }),
  row("ready-meal-thai-curry", "Ready Meal, Thai Green Curry", "prepared", 600, 9, 14, 6, { region: "global" }),
  row("ready-meal-mac-cheese", "Ready Meal, Mac and Cheese", "prepared", 700, 8, 25, 8, { region: "global" }),
  row("ready-meal-sushi", "Ready Meal, Sushi Pack", "prepared", 600, 8, 30, 1, { region: "global" }),
  row("ready-meal-paella", "Ready Meal, Paella", "prepared", 600, 10, 30, 5, { region: "global" }),
  row("ready-meal-stir-fry", "Ready Meal, Stir Fry Chicken", "prepared", 500, 10, 15, 4, { region: "global" }),
  row("soup-butternut", "Butternut Soup", "prepared", 200, 1.5, 9, 2, { region: "sa" }),
  row("soup-miso", "Miso Soup", "prepared", 80, 2, 4, 1, { region: "global" }),
  row("soup-lentil", "Lentil Soup", "prepared", 300, 6, 12, 1, { region: "global" }),
  row("soup-minestrone", "Minestrone Soup", "prepared", 200, 3, 9, 2, { region: "global" }),
  row("pita-pocket", "Pita Pocket (with filling)", "fast-food", 1000, 12, 35, 9, { region: "global" }),
  row("quesadilla", "Quesadilla (chicken)", "fast-food", 1100, 14, 30, 14, { region: "global" }),
  row("nachos-cheese", "Nachos with Cheese", "fast-food", 1700, 7, 30, 25, { region: "global" }),
  row("onion-rings", "Onion Rings", "fast-food", 1500, 4, 35, 20, { region: "global" }),
  row("mozzarella-sticks", "Mozzarella Sticks", "fast-food", 1500, 12, 18, 22, { region: "global" }),
  row("pizza-margherita", "Pizza, Margherita", "fast-food", 1050, 9, 35, 8, { region: "global" }),
  row("pizza-vegetarian", "Pizza, Vegetarian", "fast-food", 950, 8, 35, 7, { region: "global" }),
  row("kebab-roll", "Kebab Roll (doner)", "fast-food", 1100, 18, 30, 12, { region: "global" }),
  row("gyro", "Gyro (Greek wrap)", "fast-food", 1050, 16, 30, 12, { region: "global" }),
  row("roti-chicken", "Roti with Chicken", "fast-food", 1000, 14, 35, 11, { region: "global" }),
  row("roti-veg", "Roti with Vegetables", "fast-food", 900, 6, 35, 9, { region: "global" }),
  row("stir-fry-beef", "Stir Fry Beef", "fast-food", 700, 14, 12, 8, { region: "global" }),
  row("stir-fry-vegetable", "Stir Fry Vegetables", "fast-food", 350, 4, 12, 3, { region: "global" }),
  row("pork-belly", "Pork Belly (braised)", "protein", 1700, 14, 0, 35, { region: "global" }),
  row("pork-ribs", "Pork Ribs (BBQ)", "protein", 1300, 22, 5, 22, { region: "global" }),
  row("beef-brisket", "Beef Brisket (smoked)", "protein", 1100, 25, 0, 16, { region: "global" }),
  row("beef-jerky", "Beef Jerky", "protein", 1400, 35, 10, 8, { region: "global", aliases: ["biltong style"] }),
  row("turkey-bacon", "Turkey Bacon", "protein", 800, 22, 0, 11, { region: "global" }),
  row("chicken-liver-pate", "Chicken Liver Pate", "protein", 1100, 14, 5, 22, { region: "global", aliases: ["liver pate"] }),
  row("halloumi", "Halloumi (grilled)", "dairy", 1300, 22, 2, 22, { region: "global" }),
  row("brie", "Brie Cheese", "dairy", 1400, 21, 0, 28, { region: "global" }),
  row("gouda", "Gouda Cheese", "dairy", 1500, 25, 2, 28, { region: "global" }),
  row("parmesan", "Parmesan Cheese", "dairy", 1700, 38, 0, 29, { region: "global" }),
  row("blue-cheese", "Blue Cheese", "dairy", 1600, 21, 1, 33, { region: "global" }),
  row("camembert", "Camembert", "dairy", 1400, 20, 0, 28, { region: "global" }),
  row("goat-cheese", "Goat Cheese", "dairy", 1300, 19, 0, 25, { region: "global" }),
  row("sheep-yogurt", "Sheep Yogurt", "dairy", 400, 5, 5, 6, { region: "global" }),
  row("buttermilk", "Buttermilk", "dairy", 200, 3.4, 5, 1, { region: "global" }),
  row("condensed-milk", "Condensed Milk (sweetened)", "dairy", 1300, 7, 55, 7, { region: "global" }),
  row("evaporated-milk", "Evaporated Milk", "dairy", 550, 7, 11, 7, { region: "global" }),
  row("whipped-cream-aerosol", "Whipped Cream (aerosol)", "dairy", 1300, 2, 11, 30, { region: "global" }),
  row("creme-fraiche", "Crème Fraîche", "dairy", 1400, 2.5, 3, 33, { region: "global" }),
  row("clotted-cream", "Clotted Cream", "dairy", 2000, 2, 7, 50, { region: "global" }),
  row("mascarpone", "Mascarpone", "dairy", 1700, 7, 4, 40, { region: "global" }),
  row("protein-yogurt", "High-Protein Yogurt (Skyr-style)", "dairy", 380, 10, 4, 0.5, { region: "global", aliases: ["skyr"] }),
  row("almond-milk-sweetened", "Almond Milk (sweetened)", "beverage", 200, 0.4, 5, 1.1, { region: "global" }),
  row("coconut-milk-carton", "Coconut Milk (carton drink)", "beverage", 250, 0.5, 4, 4, { region: "branded" }),
  row("iced-coffee", "Iced Coffee (with milk)", "beverage", 200, 1.5, 8, 2, { region: "global" }),
  row("iced-tea", "Iced Tea (sweet)", "beverage", 130, 0, 8, 0, { region: "global" }),
  row("milkshake-chocolate", "Milkshake, Chocolate", "beverage", 450, 4, 18, 3, { region: "global" }),
  row("milkshake-strawberry", "Milkshake, Strawberry", "beverage", 420, 4, 17, 3, { region: "global" }),
  row("milkshake-vanilla", "Milkshake, Vanilla", "beverage", 430, 4, 17, 3, { region: "global" }),
  row("kombucha-ginger", "Kombucha, Ginger", "beverage", 80, 0, 5, 0, { region: "global" }),
  row("switchel", "Switchel (apple cider vinegar drink)", "beverage", 100, 0, 6, 0, { region: "global" }),
  row("kefir", "Kefir", "dairy", 250, 3.4, 5, 2, { region: "global" }),
  row("butter-beans", "Butter Beans (cooked)", "protein", 530, 7, 25, 0.5, { region: "global" }),
  row("lima-beans", "Lima Beans (cooked)", "protein", 530, 7, 25, 0.5, { region: "global" }),
  row("split-peas", "Split Peas (cooked)", "protein", 450, 8, 20, 0.4, { region: "global" }),
  row("broad-beans", "Broad Beans (cooked)", "protein", 440, 7.5, 19, 0.5, { region: "global" }),
  row("sugar-snap-peas", "Sugar Snap Peas (raw)", "produce", 170, 3, 7.5, 0.2, { region: "global" }),
  row("baby-corn", "Baby Corn (canned)", "produce", 110, 2, 5, 0.5, { region: "global" }),
  row("fennel", "Fennel (bulb, raw)", "produce", 110, 1.5, 7, 0.2, { region: "global" }),
  row("kohlrabi", "Kohlrabi (raw)", "produce", 110, 1.7, 6, 0.1, { region: "global" }),
  row("chayote", "Chayote (raw)", "produce", 80, 0.8, 4.5, 0.1, { region: "global" }),
  row("lotus-root", "Lotus Root (raw)", "produce", 350, 2, 19, 0.2, { region: "global" }),
  row("plantain", "Plantain (cooked)", "produce", 530, 0.8, 32, 0.1, { region: "global" }),
  row("breadfruit", "Breadfruit (raw)", "produce", 430, 1.1, 27, 0.2, { region: "global" }),
  row("ugli-fruit", "Ugli Fruit (raw)", "produce", 180, 0.8, 11, 0.1, { region: "global" }),
  row("tamarillo", "Tamarillo (Tree Tomato, raw)", "produce", 170, 1.5, 8, 0.2, { region: "sa", aliases: ["tree tomato"] }),
  row("marula", "Marula Fruit (raw)", "produce", 280, 0.5, 16, 0.2, { region: "sa" }),
  row("wild-fig", "Wild Fig (raw)", "produce", 240, 1, 16, 0.3, { region: "sa" }),
  row("baobab-fruit", "Baobab Fruit (raw)", "produce", 250, 2, 60, 0.5, { region: "sa", aliases: ["monkey bread"] }),
  row("baobab-powder", "Baobab Fruit Powder", "supplement", 800, 4, 70, 0.5, { region: "sa", fiber: 44 }),
  row("rooibos-cookie", "Rooibos Cookie", "baked", 1900, 5, 65, 18, { region: "sa" }),
  row("honeybush-tea", "Honeybush Tea (no sugar)", "beverage", 4, 0, 0.3, 0, { region: "sa" }),
  row("buchu-tea", "Buchu Tea (no sugar)", "beverage", 4, 0, 0.3, 0, { region: "sa" }),
  row("devil-s-claw", "Devil's Claw (Harpagophytum)", "supplement", 0, 0, 0, 0, { region: "sa" }),
  row("african-potato", "African Potato (Hypoxis)", "supplement", 0, 0, 0, 0, { region: "sa" }),
  row("rooibos-ice-tea", "Rooibos Iced Tea", "beverage", 100, 0, 6, 0, { region: "sa" }),
  row("bobotie-pie", "Bobotie Pie Slice", "fast-food", 900, 16, 25, 8, { region: "sa" }),
  row("koesister-cape-malay", "Cape Malay Koesister", "baked", 1300, 4, 50, 8, { region: "sa" }),
  row("samoosas-mince", "Samoosa, Mince", "snack", 1500, 7, 30, 16, { region: "sa" }),
  row("roti-dhalt", "Roti with Dhal", "fast-food", 950, 9, 40, 8, { region: "sa" }),
  row("chicken-bunny-chow", "Chicken Bunny Chow", "fast-food", 900, 12, 30, 8, { region: "sa" }),
  row("beef-bunny-chow", "Beef Bunny Chow", "fast-food", 950, 14, 30, 10, { region: "sa" }),
  row("mashonzha", "Mashonzha (Worms)", "protein", 400, 17, 0, 8, { region: "sa" }),
  row("mopane-worms", "Mopane Worms (cooked)", "protein", 1400, 56, 4, 14, { region: "sa" }),
  row("cricket-roasted", "Crickets, Roasted", "protein", 1500, 60, 5, 17, { region: "global" }),
  row("mealworm-roasted", "Mealworms, Roasted", "protein", 1700, 50, 5, 25, { region: "global" }),
  row("grasshopper", "Grasshoppers (cooked)", "protein", 1500, 60, 5, 17, { region: "global" }),
  row("quorn", "Quorn (Mycoprotein)", "protein", 400, 12, 4, 1.5, { region: "global" }),
  row("beyond-sausage", "Beyond Sausage", "protein", 900, 19, 5, 13, { region: "branded" }),
  row("impossible-sausage", "Impossible Sausage", "protein", 950, 18, 4, 14, { region: "branded" }),
  row("jackfruit-meat-sub", "Jackfruit (canned, young, in brine)", "produce", 110, 1.7, 6, 0.4, { region: "global" }),
  row("tofu-silken", "Tofu, Silken (raw)", "protein", 350, 5, 3, 2, { region: "global" }),
  row("tofu-smoked", "Tofu, Smoked", "protein", 600, 14, 3, 8, { region: "global" }),
  row("natto", "Natto (fermented soybeans)", "protein", 800, 17, 13, 11, { region: "global" }),
  row("miso-paste", "Miso Paste", "condiment", 800, 12, 25, 6, { region: "global" }),
  row("tamari", "Tamari (gluten-free soy)", "condiment", 240, 10, 5, 0, { region: "global" }),
  row("liquid-aminos", "Liquid Aminos (coconut)", "condiment", 100, 1, 1, 0, { region: "global" }),
  row("fish-sauce", "Fish Sauce", "condiment", 150, 8, 0, 0, { region: "global" }),
  row("oyster-sauce", "Oyster Sauce", "condiment", 250, 2, 13, 0, { region: "global" }),
  row("hoisin", "Hoisin Sauce", "condiment", 900, 3, 50, 1, { region: "global" }),
  row("plum-sauce", "Plum Sauce", "condiment", 900, 0.5, 50, 0, { region: "global" }),
  row("curry-paste-green", "Green Curry Paste", "condiment", 700, 4, 12, 8, { region: "global" }),
  row("curry-paste-red", "Red Curry Paste", "condiment", 750, 4, 12, 9, { region: "global" }),
  row("curry-paste-yellow", "Yellow Curry Paste", "condiment", 700, 4, 12, 8, { region: "global" }),
  row("tom-kha-paste", "Tom Kha Paste", "condiment", 700, 4, 12, 8, { region: "global" }),
  row("taco-shell", "Taco Shell", "grain", 1900, 6, 50, 18, { region: "global" }),
  row("tortilla-flour", "Tortilla, Flour", "grain", 1350, 8, 50, 7, { region: "global" }),
  row("tortilla-corn", "Tortilla, Corn", "grain", 1150, 5, 50, 3, { region: "global" }),
  row("piecrust", "Pie Crust (baked)", "baked", 1800, 5, 50, 20, { region: "global" }),
  row("phyllo", "Phyllo Pastry", "baked", 1300, 8, 60, 4, { region: "global" }),
  row("puff-pastry", "Puff Pastry", "baked", 1700, 6, 45, 22, { region: "global" }),
  row("shortcrust-pastry", "Shortcrust Pastry", "baked", 1900, 5, 45, 25, { region: "global" }),
  row("marshmallow", "Marshmallow", "snack", 1400, 2, 80, 0.5, { region: "global" }),
  row("jelly-beans", "Jelly Beans", "snack", 1500, 0, 95, 0, { region: "global" }),
  row("toffee", "Toffee", "snack", 1800, 1, 80, 18, { region: "global" }),
  row("fudge", "Fudge (chocolate)", "snack", 1700, 3, 75, 12, { region: "global" }),
  row("caramel-popcorn", "Caramel Popcorn", "snack", 1900, 4, 75, 13, { region: "global" }),
  row("trail-mix", "Trail Mix", "snack", 2100, 15, 40, 35, { region: "global" }),
  row("granola-bar", "Granola Bar", "snack", 1800, 8, 65, 15, { region: "global" }),
  row("rice-cake", "Rice Cake (plain)", "snack", 1600, 7, 80, 2, { region: "global" }),
  row("salted-nuts", "Salted Mixed Nuts", "snack", 2400, 20, 18, 50, { region: "global" }),
  row("pork-rinds", "Pork Rinds / Crackling", "snack", 2400, 60, 0, 35, { region: "global" }),
  row("beef-jerky-snack", "Beef Jerky Strips", "snack", 1400, 35, 10, 8, { region: "global" }),
];

// ── LOOKUP HELPERS ──

/**
 * Search the database by name, alias, or fuzzy match.
 * Returns up to `limit` matches sorted by relevance.
 */
export function searchFoods(query: string, limit: number = 10): FoodItem[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();

  // Exact ID or alias match first
  const exactMatches: { food: FoodItem; score: number }[] = [];
  for (const food of FOOD_DB) {
    if (food.id === q) exactMatches.push({ food, score: 1000 });
    if (food.name.toLowerCase() === q) exactMatches.push({ food, score: 900 });
    if (food.aliases?.some(a => a.toLowerCase() === q)) exactMatches.push({ food, score: 850 });
  }

  // Substring / partial match
  const partialMatches: { food: FoodItem; score: number }[] = [];
  for (const food of FOOD_DB) {
    if (exactMatches.find(m => m.food.id === food.id)) continue;
    const nameLower = food.name.toLowerCase();
    const idLower = food.id.toLowerCase();
    const aliasLower = (food.aliases || []).map(a => a.toLowerCase());

    if (nameLower.includes(q)) partialMatches.push({ food, score: 500 - (nameLower.indexOf(q)) });
    else if (idLower.includes(q)) partialMatches.push({ food, score: 400 - (idLower.indexOf(q)) });
    else if (aliasLower.some(a => a.includes(q))) partialMatches.push({ food, score: 350 });
  }

  // Word-level fallback: every word of query must appear somewhere
  const wordMatches: { food: FoodItem; score: number }[] = [];
  const words = q.split(/\s+/).filter(w => w.length >= 3);
  if (words.length > 0) {
    for (const food of FOOD_DB) {
      if (exactMatches.find(m => m.food.id === food.id)) continue;
      if (partialMatches.find(m => m.food.id === food.id)) continue;
      const haystack = (food.name + " " + food.id + " " + (food.aliases || []).join(" ")).toLowerCase();
      const hits = words.filter(w => haystack.includes(w)).length;
      if (hits === words.length) wordMatches.push({ food, score: 100 + (hits * 10) });
    }
  }

  const all = [...exactMatches, ...partialMatches, ...wordMatches]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(m => m.food);

  return all;
}

/**
 * Look up a single food by its slug id. Returns null if not found.
 */
export function getFoodById(id: string): FoodItem | null {
  return FOOD_DB.find(f => f.id === id) ?? null;
}

/**
 * All items in a given category.
 */
export function getFoodsByCategory(category: string): FoodItem[] {
  return FOOD_DB.filter(f => f.category.toLowerCase() === category.toLowerCase());
}

/**
 * Total DB size — used for stats / display.
 */
export function getDbStats() {
  const byCategory: Record<string, number> = {};
  let saCount = 0;
  for (const f of FOOD_DB) {
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
    if (f.region === "sa") saCount++;
  }
  return {
    total: FOOD_DB.length,
    saStaples: saCount,
    byCategory,
  };
}
