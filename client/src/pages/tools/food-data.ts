// ─── Food Storage Calculator Data ───
// Sources: USDA Dietary Guidelines 2020-2025, LDS Church food storage calculator,
// US Army TB MED 507 (nutrition standards), FDA shelf life guidance

// Amazon affiliate tag: prepperevo-20
const A = (asin: string) => `https://www.amazon.com/dp/${asin}?tag=prepperevo-20`;

// ─── Activity Levels & Calorie Needs ───
export type ActivityLevel = "sedentary" | "moderate" | "heavy";

export interface CalorieProfile {
  id: ActivityLevel;
  name: string;
  desc: string;
  maleCalories: number;     // daily baseline
  femaleCalories: number;   // daily baseline (male - 400)
  childCalories: number;    // daily baseline (ages 5-12, male - 800)
}

export const activityLevels: CalorieProfile[] = [
  {
    id: "sedentary",
    name: "Sedentary / Sheltering",
    desc: "Staying at home or shelter, minimal physical exertion",
    maleCalories: 2000,
    femaleCalories: 1600,
    childCalories: 1200,
  },
  {
    id: "moderate",
    name: "Moderate Activity",
    desc: "Walking, light work, household tasks, moderate exertion",
    maleCalories: 2500,
    femaleCalories: 2100,
    childCalories: 1700,
  },
  {
    id: "heavy",
    name: "Heavy Labor / Survival",
    desc: "Hiking, manual labor, chopping wood, hauling supplies",
    maleCalories: 3500,
    femaleCalories: 3100,
    childCalories: 2700,
  },
];

// ─── Food Categories ───
export interface FoodItem {
  id: string;
  name: string;
  caloriesPerServing: number;
  servingSize: string;         // e.g., "1 cup", "1 packet"
  servingsPerLb: number;       // approximate servings per pound of product
  shelfLifeYears: number;      // stored properly
  shelfLifeNote: string;       // context for shelf life
  category: string;
  costPerLb: number;           // approximate retail $ per lb
  cubicFtPerLb: number;        // storage space per lb
  proteinGrams: number;        // per serving
  carbGrams: number;           // per serving
  fatGrams: number;            // per serving
}

export interface FoodCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  items: FoodItem[];
}

export const foodCategories: FoodCategory[] = [
  {
    id: "freeze-dried",
    name: "Freeze-Dried Meals",
    color: "#A855F7",
    icon: "Package",
    items: [
      { id: "fd-entree", name: "Freeze-Dried Entree (Mountain House style)", caloriesPerServing: 300, servingSize: "1 pouch (2 servings)", servingsPerLb: 4, shelfLifeYears: 25, shelfLifeNote: "Sealed #10 can or pouch", category: "freeze-dried", costPerLb: 18, cubicFtPerLb: 0.08, proteinGrams: 12, carbGrams: 38, fatGrams: 10 },
      { id: "fd-breakfast", name: "Freeze-Dried Breakfast (eggs, granola)", caloriesPerServing: 280, servingSize: "1 pouch", servingsPerLb: 5, shelfLifeYears: 25, shelfLifeNote: "Sealed in nitrogen-flushed pouch", category: "freeze-dried", costPerLb: 20, cubicFtPerLb: 0.08, proteinGrams: 10, carbGrams: 35, fatGrams: 11 },
      { id: "fd-fruit", name: "Freeze-Dried Fruit Mix", caloriesPerServing: 120, servingSize: "1/2 cup", servingsPerLb: 10, shelfLifeYears: 25, shelfLifeNote: "Sealed properly in mylar or #10 can", category: "freeze-dried", costPerLb: 22, cubicFtPerLb: 0.1, proteinGrams: 1, carbGrams: 28, fatGrams: 0 },
      { id: "fd-veggie", name: "Freeze-Dried Vegetables", caloriesPerServing: 90, servingSize: "1/2 cup rehydrated", servingsPerLb: 12, shelfLifeYears: 25, shelfLifeNote: "Sealed in #10 can", category: "freeze-dried", costPerLb: 16, cubicFtPerLb: 0.1, proteinGrams: 3, carbGrams: 18, fatGrams: 0 },
    ],
  },
  {
    id: "canned",
    name: "Canned Goods",
    color: "#EF4444",
    icon: "Archive",
    items: [
      { id: "can-chili", name: "Canned Chili / Stew", caloriesPerServing: 260, servingSize: "1 cup (15oz can)", servingsPerLb: 1.8, shelfLifeYears: 3, shelfLifeNote: "Best by 2-5 years, safe much longer", category: "canned", costPerLb: 3, cubicFtPerLb: 0.025, proteinGrams: 16, carbGrams: 22, fatGrams: 10 },
      { id: "can-tuna", name: "Canned Tuna / Chicken", caloriesPerServing: 200, servingSize: "1 can (5oz)", servingsPerLb: 3.2, shelfLifeYears: 4, shelfLifeNote: "High protein, compact", category: "canned", costPerLb: 6, cubicFtPerLb: 0.02, proteinGrams: 30, carbGrams: 0, fatGrams: 8 },
      { id: "can-beans", name: "Canned Beans (black, kidney, pinto)", caloriesPerServing: 240, servingSize: "1 cup", servingsPerLb: 1.8, shelfLifeYears: 4, shelfLifeNote: "Already cooked, no water needed", category: "canned", costPerLb: 2, cubicFtPerLb: 0.025, proteinGrams: 14, carbGrams: 40, fatGrams: 1 },
      { id: "can-soup", name: "Canned Soup (chunky)", caloriesPerServing: 200, servingSize: "1 cup", servingsPerLb: 2, shelfLifeYears: 3, shelfLifeNote: "Easy meal, contains water", category: "canned", costPerLb: 2.5, cubicFtPerLb: 0.025, proteinGrams: 10, carbGrams: 24, fatGrams: 6 },
      { id: "can-veg", name: "Canned Vegetables (corn, green beans)", caloriesPerServing: 80, servingSize: "1/2 cup", servingsPerLb: 3, shelfLifeYears: 4, shelfLifeNote: "Low cal but essential micronutrients", category: "canned", costPerLb: 1.5, cubicFtPerLb: 0.025, proteinGrams: 2, carbGrams: 16, fatGrams: 0 },
      { id: "can-fruit", name: "Canned Fruit (peaches, pears)", caloriesPerServing: 100, servingSize: "1/2 cup", servingsPerLb: 3, shelfLifeYears: 3, shelfLifeNote: "Morale booster, vitamins", category: "canned", costPerLb: 2, cubicFtPerLb: 0.025, proteinGrams: 0, carbGrams: 25, fatGrams: 0 },
    ],
  },
  {
    id: "grains",
    name: "Rice, Beans & Grains",
    color: "#8B6F47",
    icon: "Wheat",
    items: [
      { id: "white-rice", name: "White Rice (long grain)", caloriesPerServing: 205, servingSize: "1 cup cooked", servingsPerLb: 5, shelfLifeYears: 30, shelfLifeNote: "Mylar bag w/ O2 absorber", category: "grains", costPerLb: 1.2, cubicFtPerLb: 0.02, proteinGrams: 4, carbGrams: 45, fatGrams: 0 },
      { id: "dry-beans", name: "Dry Beans (pinto, black, lentils)", caloriesPerServing: 230, servingSize: "1 cup cooked", servingsPerLb: 5, shelfLifeYears: 30, shelfLifeNote: "Mylar bag w/ O2 absorber", category: "grains", costPerLb: 1.5, cubicFtPerLb: 0.02, proteinGrams: 15, carbGrams: 40, fatGrams: 1 },
      { id: "flour", name: "All-Purpose Flour", caloriesPerServing: 110, servingSize: "1/4 cup", servingsPerLb: 14, shelfLifeYears: 10, shelfLifeNote: "5yr standard, 10yr in mylar/frozen", category: "grains", costPerLb: 0.8, cubicFtPerLb: 0.02, proteinGrams: 3, carbGrams: 23, fatGrams: 0 },
      { id: "dry-pasta", name: "Dried Pasta", caloriesPerServing: 200, servingSize: "2 oz dry (1 cup cooked)", servingsPerLb: 8, shelfLifeYears: 10, shelfLifeNote: "8-10yr in sealed container", category: "grains", costPerLb: 1.5, cubicFtPerLb: 0.03, proteinGrams: 7, carbGrams: 42, fatGrams: 1 },
      { id: "oats", name: "Rolled Oats", caloriesPerServing: 150, servingSize: "1/2 cup dry", servingsPerLb: 8, shelfLifeYears: 25, shelfLifeNote: "20-30yr sealed in mylar", category: "grains", costPerLb: 1.5, cubicFtPerLb: 0.04, proteinGrams: 5, carbGrams: 27, fatGrams: 3 },
      { id: "cornmeal", name: "Cornmeal", caloriesPerServing: 110, servingSize: "1/4 cup", servingsPerLb: 14, shelfLifeYears: 10, shelfLifeNote: "Degermed lasts longer", category: "grains", costPerLb: 1, cubicFtPerLb: 0.02, proteinGrams: 2, carbGrams: 24, fatGrams: 1 },
    ],
  },
  {
    id: "mre",
    name: "MREs (Meals Ready to Eat)",
    color: "#6B8E23",
    icon: "Package",
    items: [
      { id: "mre-full", name: "MRE (full meal w/ heater)", caloriesPerServing: 1200, servingSize: "1 full MRE", servingsPerLb: 0.7, shelfLifeYears: 5, shelfLifeNote: "5-7yr at 70F, less in heat", category: "mre", costPerLb: 9, cubicFtPerLb: 0.05, proteinGrams: 40, carbGrams: 150, fatGrams: 45 },
      { id: "mre-entree", name: "MRE Entree Only", caloriesPerServing: 300, servingSize: "1 entree pouch", servingsPerLb: 2, shelfLifeYears: 5, shelfLifeNote: "Lighter without sides/heater", category: "mre", costPerLb: 7, cubicFtPerLb: 0.03, proteinGrams: 15, carbGrams: 35, fatGrams: 10 },
    ],
  },
  {
    id: "bars-snacks",
    name: "Energy & Protein Bars",
    color: "#EAB308",
    icon: "Candy",
    items: [
      { id: "energy-bar", name: "Energy Bar (Clif, Kind)", caloriesPerServing: 250, servingSize: "1 bar", servingsPerLb: 7, shelfLifeYears: 1.5, shelfLifeNote: "1-2yr, rotate regularly", category: "bars-snacks", costPerLb: 8, cubicFtPerLb: 0.04, proteinGrams: 10, carbGrams: 40, fatGrams: 8 },
      { id: "protein-bar", name: "Protein Bar (Quest, RX)", caloriesPerServing: 200, servingSize: "1 bar", servingsPerLb: 7, shelfLifeYears: 1.5, shelfLifeNote: "Short shelf life, good nutrition", category: "bars-snacks", costPerLb: 12, cubicFtPerLb: 0.04, proteinGrams: 20, carbGrams: 22, fatGrams: 8 },
      { id: "sos-ration", name: "SOS Emergency Ration Bar (3600 cal)", caloriesPerServing: 400, servingSize: "1 packet (of 9)", servingsPerLb: 4, shelfLifeYears: 5, shelfLifeNote: "5yr, coast guard approved, no water needed", category: "bars-snacks", costPerLb: 5, cubicFtPerLb: 0.03, proteinGrams: 6, carbGrams: 50, fatGrams: 18 },
      { id: "trail-mix", name: "Trail Mix (nuts, dried fruit)", caloriesPerServing: 350, servingSize: "1/4 cup", servingsPerLb: 10, shelfLifeYears: 1, shelfLifeNote: "6-12 months, high fat oxidizes", category: "bars-snacks", costPerLb: 8, cubicFtPerLb: 0.03, proteinGrams: 8, carbGrams: 30, fatGrams: 22 },
    ],
  },
  {
    id: "staples",
    name: "Pantry Staples",
    color: "#06B6D4",
    icon: "Jar",
    items: [
      { id: "peanut-butter", name: "Peanut Butter", caloriesPerServing: 190, servingSize: "2 tbsp", servingsPerLb: 15, shelfLifeYears: 2, shelfLifeNote: "Unopened, cool dark storage", category: "staples", costPerLb: 3, cubicFtPerLb: 0.02, proteinGrams: 7, carbGrams: 7, fatGrams: 16 },
      { id: "honey", name: "Honey", caloriesPerServing: 60, servingSize: "1 tbsp", servingsPerLb: 22, shelfLifeYears: 100, shelfLifeNote: "Indefinite shelf life, may crystallize", category: "staples", costPerLb: 6, cubicFtPerLb: 0.015, proteinGrams: 0, carbGrams: 17, fatGrams: 0 },
      { id: "powdered-milk", name: "Powdered Milk (nonfat)", caloriesPerServing: 80, servingSize: "1/3 cup powder (makes 1 cup)", servingsPerLb: 15, shelfLifeYears: 20, shelfLifeNote: "20yr sealed, calcium + protein", category: "staples", costPerLb: 5, cubicFtPerLb: 0.04, proteinGrams: 8, carbGrams: 12, fatGrams: 0 },
      { id: "sugar", name: "Granulated Sugar", caloriesPerServing: 45, servingSize: "1 tbsp", servingsPerLb: 36, shelfLifeYears: 100, shelfLifeNote: "Indefinite if kept dry", category: "staples", costPerLb: 1, cubicFtPerLb: 0.015, proteinGrams: 0, carbGrams: 12, fatGrams: 0 },
      { id: "salt", name: "Iodized Salt", caloriesPerServing: 0, servingSize: "1 tsp", servingsPerLb: 96, shelfLifeYears: 100, shelfLifeNote: "Indefinite, essential for electrolytes", category: "staples", costPerLb: 0.5, cubicFtPerLb: 0.015, proteinGrams: 0, carbGrams: 0, fatGrams: 0 },
      { id: "cooking-oil", name: "Vegetable / Coconut Oil", caloriesPerServing: 120, servingSize: "1 tbsp", servingsPerLb: 30, shelfLifeYears: 2, shelfLifeNote: "Coconut oil lasts longer (2yr+)", category: "staples", costPerLb: 3, cubicFtPerLb: 0.02, proteinGrams: 0, carbGrams: 0, fatGrams: 14 },
      { id: "bouillon", name: "Bouillon Cubes / Powder", caloriesPerServing: 10, servingSize: "1 cube", servingsPerLb: 50, shelfLifeYears: 2, shelfLifeNote: "Flavor + sodium, lightweight", category: "staples", costPerLb: 6, cubicFtPerLb: 0.03, proteinGrams: 1, carbGrams: 1, fatGrams: 0 },
      { id: "coffee-instant", name: "Instant Coffee", caloriesPerServing: 5, servingSize: "1 packet", servingsPerLb: 60, shelfLifeYears: 20, shelfLifeNote: "Morale item, stores well sealed", category: "staples", costPerLb: 10, cubicFtPerLb: 0.04, proteinGrams: 0, carbGrams: 1, fatGrams: 0 },
    ],
  },
];

export const allFoodItems = foodCategories.flatMap((c) => c.items);

// ─── Duration Presets ───
export interface DurationPreset {
  id: string;
  label: string;
  days: number;
}

export const durationPresets: DurationPreset[] = [
  { id: "72h", label: "72 Hours", days: 3 },
  { id: "2w", label: "2 Weeks", days: 14 },
  { id: "1m", label: "1 Month", days: 30 },
  { id: "3m", label: "3 Months", days: 90 },
  { id: "1y", label: "1 Year", days: 365 },
];

// ─── Suggested Food Mix (% of total calories per food type) ───
// Balanced long-term storage ratio
export interface FoodMixRatio {
  categoryId: string;
  label: string;
  percent: number; // % of total calories
  note: string;
}

export const balancedFoodMix: FoodMixRatio[] = [
  { categoryId: "grains", label: "Rice, Beans & Grains", percent: 40, note: "Backbone of any food storage plan" },
  { categoryId: "canned", label: "Canned Goods", percent: 20, note: "Ready to eat, no prep needed" },
  { categoryId: "freeze-dried", label: "Freeze-Dried Meals", percent: 15, note: "Lightweight, long shelf life" },
  { categoryId: "staples", label: "Pantry Staples", percent: 15, note: "Cooking fats, milk, sweeteners" },
  { categoryId: "bars-snacks", label: "Bars & Snacks", percent: 5, note: "Quick energy, grab-and-go" },
  { categoryId: "mre", label: "MREs", percent: 5, note: "No-cook backup meals" },
];

// ─── Shopping List Generator ───
// Given a category % and total calories, suggest specific quantities
export interface ShoppingItem {
  name: string;
  quantity: string;      // e.g., "25 lbs" or "2 buckets"
  lbs: number;
  calories: number;
  costEstimate: number;
  cubicFt: number;
  shelfLifeYears: number;
}

export function generateShoppingList(
  totalCalories: number,
  durationDays: number,
): ShoppingItem[] {
  const items: ShoppingItem[] = [];

  // Target calorie distribution
  const grainCals = totalCalories * 0.25;
  const beanCals = totalCalories * 0.15;
  const pastaCals = totalCalories * 0.05;
  const oatsCals = totalCalories * 0.05;
  const cannedCals = totalCalories * 0.18;
  const fdCals = totalCalories * 0.12;
  const stapleCals = totalCalories * 0.08;
  const barsCals = totalCalories * 0.04;
  const mreCals = totalCalories * 0.03;
  const pbCals = totalCalories * 0.03;
  const milkCals = totalCalories * 0.02;

  const riceItem = allFoodItems.find((f) => f.id === "white-rice")!;
  const beanItem = allFoodItems.find((f) => f.id === "dry-beans")!;
  const pastaItem = allFoodItems.find((f) => f.id === "dry-pasta")!;
  const oatsItem = allFoodItems.find((f) => f.id === "oats")!;
  const cannedChili = allFoodItems.find((f) => f.id === "can-chili")!;
  const cannedTuna = allFoodItems.find((f) => f.id === "can-tuna")!;
  const fdEntree = allFoodItems.find((f) => f.id === "fd-entree")!;
  const pbItem = allFoodItems.find((f) => f.id === "peanut-butter")!;
  const milkItem = allFoodItems.find((f) => f.id === "powdered-milk")!;
  const energyBar = allFoodItems.find((f) => f.id === "energy-bar")!;
  const mreItem = allFoodItems.find((f) => f.id === "mre-full")!;
  const oilItem = allFoodItems.find((f) => f.id === "cooking-oil")!;
  const honeyItem = allFoodItems.find((f) => f.id === "honey")!;
  const saltItem = allFoodItems.find((f) => f.id === "salt")!;

  const calcLbs = (cals: number, item: FoodItem) => {
    const calsPerLb = item.caloriesPerServing * item.servingsPerLb;
    return Math.ceil(cals / calsPerLb);
  };

  const addItem = (name: string, cals: number, item: FoodItem) => {
    const lbs = calcLbs(cals, item);
    if (lbs <= 0) return;
    const calsPerLb = item.caloriesPerServing * item.servingsPerLb;
    items.push({
      name,
      quantity: lbs >= 25 ? `${Math.round(lbs / 25)} x 25 lb bucket${Math.round(lbs / 25) > 1 ? "s" : ""} (${lbs} lbs)` : `${lbs} lbs`,
      lbs,
      calories: lbs * calsPerLb,
      costEstimate: lbs * item.costPerLb,
      cubicFt: lbs * item.cubicFtPerLb,
      shelfLifeYears: item.shelfLifeYears,
    });
  };

  addItem("White Rice", grainCals, riceItem);
  addItem("Dry Beans / Lentils", beanCals, beanItem);
  addItem("Dried Pasta", pastaCals, pastaItem);
  addItem("Rolled Oats", oatsCals, oatsItem);
  addItem("Canned Goods (chili, stew, soup)", cannedCals, cannedChili);
  addItem("Canned Tuna / Chicken", totalCalories * 0.02, cannedTuna);
  addItem("Freeze-Dried Meals", fdCals, fdEntree);
  addItem("Peanut Butter", pbCals, pbItem);
  addItem("Powdered Milk", milkCals, milkItem);
  addItem("Energy / Protein Bars", barsCals, energyBar);
  addItem("MREs", mreCals, mreItem);

  // Staples (smaller quantities)
  const oilLbs = Math.max(1, Math.ceil(durationDays / 30));
  items.push({
    name: "Cooking Oil",
    quantity: `${oilLbs} lbs`,
    lbs: oilLbs,
    calories: oilLbs * oilItem.caloriesPerServing * oilItem.servingsPerLb,
    costEstimate: oilLbs * oilItem.costPerLb,
    cubicFt: oilLbs * oilItem.cubicFtPerLb,
    shelfLifeYears: oilItem.shelfLifeYears,
  });

  const honeyLbs = Math.max(1, Math.ceil(durationDays / 60));
  items.push({
    name: "Honey",
    quantity: `${honeyLbs} lbs`,
    lbs: honeyLbs,
    calories: honeyLbs * honeyItem.caloriesPerServing * honeyItem.servingsPerLb,
    costEstimate: honeyLbs * honeyItem.costPerLb,
    cubicFt: honeyLbs * honeyItem.cubicFtPerLb,
    shelfLifeYears: honeyItem.shelfLifeYears,
  });

  const saltLbs = Math.max(1, Math.ceil(durationDays / 90));
  items.push({
    name: "Iodized Salt",
    quantity: `${saltLbs} lbs`,
    lbs: saltLbs,
    calories: 0,
    costEstimate: saltLbs * saltItem.costPerLb,
    cubicFt: saltLbs * saltItem.cubicFtPerLb,
    shelfLifeYears: saltItem.shelfLifeYears,
  });

  return items.filter((i) => i.lbs > 0);
}

// ─── Product Recommendations ───
export interface ProductRec {
  id: string;
  name: string;
  desc: string;
  price: string;
  affiliateUrl: string;
  type: "food" | "storage";
  note: string;
}

export const productRecommendations: ProductRec[] = [
  {
    id: "mh-classic",
    name: "Mountain House Classic Bucket",
    desc: "24 servings of freeze-dried meals, 25-year shelf life",
    price: "$75",
    affiliateUrl: A("B00955DUHQ"),
    type: "food",
    note: "Best-selling emergency food bucket",
  },
  {
    id: "augason-30day",
    name: "Augason Farms 30-Day Supply",
    desc: "307 servings, up to 25-year shelf life",
    price: "$135",
    affiliateUrl: A("B00IW1NQDC"),
    type: "food",
    note: "Best value per serving for bulk storage",
  },
  {
    id: "readywise-bucket",
    name: "ReadyWise Emergency Food Bucket",
    desc: "120 servings of entrees and breakfasts",
    price: "$90",
    affiliateUrl: A("B0CR5DCFTJ"),
    type: "food",
    note: "Grab-and-go bucket, 25-year shelf life",
  },
  {
    id: "rice-bucket",
    name: "Rice Storage Bucket (25 lbs)",
    desc: "25 lbs white rice in food-grade sealed bucket",
    price: "$22",
    affiliateUrl: A("B079H3CZQ9"),
    type: "food",
    note: "Foundation of any food storage plan",
  },
  {
    id: "mylar-bags",
    name: "Mylar Bags with Oxygen Absorbers (50 pack)",
    desc: "1 gallon mylar bags + 300cc O2 absorbers",
    price: "$22",
    affiliateUrl: A("B09NNH4FLZ"),
    type: "storage",
    note: "Essential for DIY long-term storage",
  },
  {
    id: "food-buckets",
    name: "5 Gallon Food-Grade Buckets (3 pack)",
    desc: "BPA-free, FDA-approved, gamma seal lid compatible",
    price: "$28",
    affiliateUrl: A("B00A1LUFK8"),
    type: "storage",
    note: "Stackable, rodent-proof, reusable",
  },
  {
    id: "augason-fd-fruit",
    name: "Augason Farms Freeze Dried Fruit Variety",
    desc: "Variety pack, 25yr shelf life",
    price: "$40",
    affiliateUrl: A("B0C39ZVLYY"),
    type: "food",
    note: "Variety pack, 25yr shelf life",
  },
  {
    id: "mh-14day",
    name: "Mountain House Just In Case 14-Day",
    desc: "14-day supply, just add water",
    price: "$250",
    affiliateUrl: A("B0BPVMJKV2"),
    type: "food",
    note: "14-day supply, just add water",
  },
  {
    id: "wise-60srv",
    name: "Wise Company Emergency Food Supply (60 servings)",
    desc: "Budget bulk option, 60 servings",
    price: "$80",
    affiliateUrl: A("B08C9JZYPG"),
    type: "food",
    note: "Budget bulk option",
  },
  {
    id: "sos-ration-3600",
    name: "S.O.S. Emergency Rations 3600-Cal",
    desc: "Coast Guard approved, 5yr shelf life",
    price: "$8",
    affiliateUrl: A("B004MF41LI"),
    type: "food",
    note: "Coast Guard approved, 5yr shelf life",
  },
  {
    id: "patriot-72hr",
    name: "Patriot Pantry 72-Hour Kit",
    desc: "3-day individual supply",
    price: "$25",
    affiliateUrl: A("B0CLSBB89P"),
    type: "food",
    note: "3-day individual supply",
  },
  {
    id: "datrex-2400",
    name: "Datrex Emergency Ration 2400-Cal",
    desc: "Non-thirst provoking, 5yr shelf life",
    price: "$7",
    affiliateUrl: A("B01DUTZ4JE"),
    type: "food",
    note: "Non-thirst provoking, 5yr shelf",
  },
  {
    id: "vittles-vault-40",
    name: "Gamma2 Vittles Vault (40lb pet food)",
    desc: "Airtight pet food storage, 40lb capacity",
    price: "$25",
    affiliateUrl: A("B0002H3S5K"),
    type: "storage",
    note: "Airtight pet food storage",
  },
  {
    id: "packfresh-mylar-50",
    name: "PackFreshUSA Mylar Bags (50 1-gallon)",
    desc: "1-gallon bags + O2 absorbers, 50 pack",
    price: "$20",
    affiliateUrl: A("B075FH6T17"),
    type: "storage",
    note: "1-gallon bags + O2 absorbers",
  },
  {
    id: "harvest-right-fd",
    name: "Harvest Right Home Freeze Dryer",
    desc: "Freeze dry your own food — 25yr shelf life",
    price: "$2,495",
    affiliateUrl: A("B07H7VVT68"),
    type: "storage",
    note: "Freeze dry your own food — 25yr shelf life",
  },
  {
    id: "bobs-oats-25lb",
    name: "Bob's Red Mill Rolled Oats (25 lb)",
    desc: "Bulk staple — store in mylar + O2 absorber",
    price: "$30",
    affiliateUrl: A("B001SB684M"),
    type: "food",
    note: "Bulk staple — store in mylar + O2 absorber",
  },
];

// ─── Shelf Life Timeline Data ───
export interface ShelfLifeTier {
  label: string;
  years: string;
  color: string;
  items: string[];
}

export const shelfLifeTiers: ShelfLifeTier[] = [
  {
    label: "Indefinite",
    years: "Forever",
    color: "#22C55E",
    items: ["Honey", "Salt", "Sugar", "White rice (sealed)", "Dry beans (sealed)"],
  },
  {
    label: "20-30 Years",
    years: "20-30yr",
    color: "#3B82F6",
    items: ["Freeze-dried meals", "Rolled oats (mylar)", "Powdered milk (sealed)", "Instant coffee"],
  },
  {
    label: "5-10 Years",
    years: "5-10yr",
    color: "#EAB308",
    items: ["Dried pasta", "Flour (mylar)", "MREs", "SOS ration bars", "Cornmeal"],
  },
  {
    label: "2-5 Years",
    years: "2-5yr",
    color: "#F97316",
    items: ["Canned goods", "Peanut butter", "Cooking oil", "Bouillon"],
  },
  {
    label: "1-2 Years",
    years: "1-2yr",
    color: "#EF4444",
    items: ["Energy bars", "Protein bars", "Trail mix", "Granola"],
  },
];

// ─── Data Sources ───
export const dataSources = [
  { name: "USDA Dietary Guidelines 2020-2025", url: "https://www.dietaryguidelines.gov", note: "Calorie needs by age, sex, and activity level" },
  { name: "LDS Church Home Storage Center", url: "https://providentliving.churchofjesuschrist.org", note: "Long-term food storage quantities and shelf life" },
  { name: "US Army TB MED 507", url: null, note: "Military nutrition standards for sustained operations" },
  { name: "FDA Shelf Life Guidance", url: "https://www.fda.gov", note: "Shelf life and food safety data" },
  { name: "Utah State University Extension", url: "https://extension.usu.edu", note: "Food storage shelf life research" },
];
