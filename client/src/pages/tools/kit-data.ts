// ─── 72-Hour Kit Builder — Data Layer ───
// Questions, kit items, affiliate links, and condition logic.

// Amazon affiliate tag helper
const A = (asin: string) => `https://www.amazon.com/dp/${asin}?tag=prepperevo-20`;

// ─── Question Types ───

export type QuestionId =
  | "region"
  | "climate"
  | "adults"
  | "children"
  | "elderly"
  | "pets"
  | "medical"
  | "shelter"
  | "vehicle"
  | "budget";

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface Question {
  id: QuestionId;
  title: string;
  subtitle: string;
  type: "single" | "counter" | "multi";
  options?: QuestionOption[];
  min?: number;
  max?: number;
  default?: number;
}

export const questions: Question[] = [
  {
    id: "region",
    title: "What region do you live in?",
    subtitle: "This determines climate-specific gear and regional hazard priorities.",
    type: "single",
    options: [
      { value: "northeast", label: "Northeast", description: "ME, NH, VT, MA, RI, CT, NY, NJ, PA, DE, MD, DC" },
      { value: "southeast", label: "Southeast", description: "VA, NC, SC, GA, FL, AL, MS, LA, AR, TN, KY, WV" },
      { value: "midwest", label: "Midwest", description: "OH, IN, IL, MI, WI, MN, IA, MO, ND, SD, NE, KS" },
      { value: "southwest", label: "Southwest", description: "TX, OK, NM, AZ" },
      { value: "california", label: "California", description: "CA — earthquakes, wildfires, drought, diverse climates" },
      { value: "mountain", label: "Mountain West", description: "MT, ID, WY, CO, UT, NV" },
      { value: "pacific-nw", label: "Pacific Northwest", description: "WA, OR" },
      { value: "alaska", label: "Alaska", description: "Extreme cold, remote, limited infrastructure" },
      { value: "hawaii", label: "Hawaii", description: "Volcanic, tropical storms, island isolation" },
    ],
  },
  {
    id: "climate",
    title: "What is your primary climate concern?",
    subtitle: "Pick the hazard most likely to hit your area. We will add gear for it.",
    type: "single",
    options: [
      { value: "extreme-cold", label: "Extreme Cold", description: "Blizzards, ice storms, sub-zero temps" },
      { value: "extreme-heat", label: "Extreme Heat", description: "Heat waves, drought, 100+ degree temps" },
      { value: "hurricanes", label: "Hurricanes", description: "Tropical storms, storm surge, sustained winds" },
      { value: "earthquakes", label: "Earthquakes", description: "Seismic zones, aftershocks, structural collapse" },
      { value: "wildfires", label: "Wildfires", description: "Wildland-urban interface, smoke, evacuations" },
      { value: "tornadoes", label: "Tornadoes", description: "Tornado alley, severe thunderstorms, hail" },
      { value: "flooding", label: "Flooding", description: "Flash floods, river floods, coastal flooding" },
    ],
  },
  {
    id: "adults",
    title: "How many adults in your household?",
    subtitle: "Ages 13 and up. This scales water, food, and clothing quantities.",
    type: "counter",
    min: 1,
    max: 8,
    default: 2,
  },
  {
    id: "children",
    title: "How many children (under 13)?",
    subtitle: "Kids need smaller portions but extra comfort items.",
    type: "counter",
    min: 0,
    max: 8,
    default: 0,
  },
  {
    id: "elderly",
    title: "Any elderly or mobility-limited members?",
    subtitle: "This adds comfort and accessibility items to your kit.",
    type: "counter",
    min: 0,
    max: 4,
    default: 0,
  },
  {
    id: "pets",
    title: "How many pets need to evacuate with you?",
    subtitle: "Dogs, cats, or other animals that need food and water.",
    type: "counter",
    min: 0,
    max: 6,
    default: 0,
  },
  {
    id: "medical",
    title: "Any special medical needs?",
    subtitle: "Select all that apply. We will add critical medical items.",
    type: "multi",
    options: [
      { value: "none", label: "None", description: "No special medical needs" },
      { value: "prescriptions", label: "Prescription Meds", description: "Daily medications that cannot be missed" },
      { value: "cpap", label: "CPAP Machine", description: "Sleep apnea — needs portable power" },
      { value: "insulin", label: "Insulin / Refrigerated Meds", description: "Needs cooling and careful storage" },
      { value: "mobility", label: "Mobility Aids", description: "Wheelchair, walker, cane, or similar" },
    ],
  },
  {
    id: "shelter",
    title: "What is your current living situation?",
    subtitle: "This affects storage capacity and evacuation plans.",
    type: "single",
    options: [
      { value: "house", label: "House", description: "Single-family home with garage/storage" },
      { value: "apartment", label: "Apartment", description: "Limited storage, may need to go vertical" },
      { value: "rural", label: "Rural Property", description: "Acreage, well water, outbuildings" },
      { value: "rv-van", label: "RV / Van", description: "Mobile living, limited space, always ready to move" },
    ],
  },
  {
    id: "vehicle",
    title: "Do you have vehicle access for evacuation?",
    subtitle: "This determines how much weight your kit can be.",
    type: "single",
    options: [
      { value: "sedan", label: "Yes - Sedan / Car", description: "Trunk space, moderate cargo capacity" },
      { value: "truck-suv", label: "Yes - Truck / SUV", description: "Bed or cargo area, higher capacity" },
      { value: "none", label: "No Vehicle", description: "On foot or public transit — weight matters most" },
    ],
  },
  {
    id: "budget",
    title: "What is your budget for this kit?",
    subtitle: "We will prioritize items that fit your price range.",
    type: "single",
    options: [
      { value: "starter", label: "Starter ($50 - $100)", description: "Bare essentials only — dollar store and DIY" },
      { value: "standard", label: "Standard ($200 - $500)", description: "Solid gear that will last — best value" },
      { value: "premium", label: "Premium ($500+)", description: "Top-tier gear, redundancy, no compromises" },
    ],
  },
];

// ─── Kit Item Types ───

export type ItemPriority = "essential" | "recommended" | "optional";

export type ItemCategory =
  | "water"
  | "food"
  | "shelter"
  | "first-aid"
  | "tools"
  | "communication"
  | "documents"
  | "clothing"
  | "hygiene"
  | "special-needs";

export interface KitItemCondition {
  question: QuestionId;
  values?: string[];       // include if answer matches one of these
  minCount?: number;       // for counter questions: include if >= this
}

export interface KitItem {
  id: string;
  name: string;
  category: ItemCategory;
  priority: ItemPriority;
  description: string;
  perPerson?: boolean;      // multiply quantity by total people
  perAdult?: boolean;       // multiply by adults only
  estimatedCost: number;    // in USD
  affiliateUrl?: string;
  affiliateNote?: string;
  conditions?: KitItemCondition[];  // ALL must match (AND logic); empty = always include
  budgetTier?: "starter" | "standard" | "premium"; // minimum budget to include
}

export const categoryMeta: Record<ItemCategory, { name: string; color: string; icon: string }> = {
  water:          { name: "Water",         color: "#3B82F6", icon: "Droplets" },
  food:           { name: "Food",          color: "#22C55E", icon: "UtensilsCrossed" },
  shelter:        { name: "Shelter",       color: "#8B5E3C", icon: "Tent" },
  "first-aid":    { name: "First Aid",     color: "#EF4444", icon: "Heart" },
  tools:          { name: "Tools",         color: "#F59E0B", icon: "Wrench" },
  communication:  { name: "Communication", color: "#8B5CF6", icon: "Radio" },
  documents:      { name: "Documents",     color: "#6B7280", icon: "FileText" },
  clothing:       { name: "Clothing",      color: "#0EA5E9", icon: "Shirt" },
  hygiene:        { name: "Hygiene",       color: "#EC4899", icon: "SprayCan" },
  "special-needs":{ name: "Special Needs", color: "#14B8A6", icon: "ShieldPlus" },
};

export const categoryOrder: ItemCategory[] = [
  "water", "food", "shelter", "first-aid", "tools",
  "communication", "documents", "clothing", "hygiene", "special-needs",
];

// ─── Kit Items Database ───

export const kitItems: KitItem[] = [
  // ═══════════════════════════════════════════
  // WATER
  // ═══════════════════════════════════════════
  {
    id: "water-bottles",
    name: "Water (1 gallon per person per day x 3 days)",
    category: "water",
    priority: "essential",
    description: "FEMA recommends 1 gallon per person per day. 3 days = 3 gallons per person minimum.",
    perPerson: true,
    estimatedCost: 5,
  },
  {
    id: "sawyer-squeeze",
    name: "Sawyer Squeeze Water Filter",
    category: "water",
    priority: "essential",
    description: "Filters up to 100,000 gallons. Removes 99.99999% of bacteria. Lightweight backup to stored water.",
    estimatedCost: 38,
    affiliateUrl: A("B00B1OSU4W"),
    affiliateNote: "$38 — Best value water filter",
  },
  {
    id: "aquamira-drops",
    name: "Aquamira Water Treatment Drops",
    category: "water",
    priority: "recommended",
    description: "Chemical water purification backup. Treats up to 30 gallons. Lightweight and has long shelf life.",
    estimatedCost: 15,
    affiliateUrl: A("B0078SA5SE"),
    affiliateNote: "$15 — Chemical backup to filters",
    budgetTier: "standard",
  },
  {
    id: "water-container",
    name: "Collapsible Water Container (5 gallon)",
    category: "water",
    priority: "recommended",
    description: "Collapsible jug for water storage and transport. Folds flat when empty.",
    estimatedCost: 12,
    budgetTier: "standard",
  },
  {
    id: "water-purification-tabs",
    name: "Water Purification Tablets (50ct)",
    category: "water",
    priority: "optional",
    description: "Third-tier water backup. Each tablet treats 1 liter. 5-year shelf life.",
    estimatedCost: 10,
    budgetTier: "standard",
  },
  {
    id: "lifestraw-peak",
    name: "LifeStraw Peak Series",
    category: "water",
    priority: "recommended",
    description: "Personal water filter — backup to main filter. Drink directly from any freshwater source.",
    estimatedCost: 20,
    affiliateUrl: A("B0CFYHBWP4"),
    affiliateNote: "$20 — Personal backup water filter",
    budgetTier: "standard",
  },
  {
    id: "katadyn-befree",
    name: "Katadyn BeFree 1L",
    category: "water",
    priority: "optional",
    description: "Fast-flow filter in soft flask. Squeeze or drink directly — filters 1,000 liters.",
    estimatedCost: 40,
    affiliateUrl: A("B0BFQMMJVS"),
    affiliateNote: "$40 — Fast-flow collapsible filter",
    budgetTier: "premium",
  },

  // ═══════════════════════════════════════════
  // FOOD
  // ═══════════════════════════════════════════
  {
    id: "mountain-house-bucket",
    name: "Mountain House 3-Day Emergency Food Supply",
    category: "food",
    priority: "essential",
    description: "Freeze-dried meals with 30-year shelf life. Just add hot water. 18 servings per bucket.",
    perPerson: true,
    estimatedCost: 65,
    affiliateUrl: A("B00955DUHQ"),
    affiliateNote: "$65 — 30-year shelf life meals",
    budgetTier: "standard",
  },
  {
    id: "energy-bars",
    name: "High-Calorie Energy Bars (12-pack)",
    category: "food",
    priority: "essential",
    description: "Calorie-dense, no-cook food. 400+ calories per bar. Works as a starter kit budget option.",
    perPerson: true,
    estimatedCost: 15,
  },
  {
    id: "peanut-butter",
    name: "Peanut Butter (shelf-stable jar)",
    category: "food",
    priority: "recommended",
    description: "High calorie, high protein, no cooking required. Cheap and filling.",
    estimatedCost: 5,
  },
  {
    id: "instant-coffee",
    name: "Instant Coffee / Tea Packets",
    category: "food",
    priority: "optional",
    description: "Morale booster. Caffeine helps with alertness during stressful situations.",
    estimatedCost: 5,
  },
  {
    id: "mess-kit",
    name: "Camping Mess Kit (pot, pan, utensils)",
    category: "food",
    priority: "recommended",
    description: "Compact nesting cook set for boiling water and heating meals.",
    estimatedCost: 20,
    budgetTier: "standard",
  },
  {
    id: "portable-stove",
    name: "Portable Camp Stove + Fuel Canisters",
    category: "food",
    priority: "recommended",
    description: "Compact butane or isobutane stove for heating water and cooking freeze-dried meals.",
    estimatedCost: 30,
    budgetTier: "standard",
  },
  {
    id: "can-opener",
    name: "Manual Can Opener (P-38 Military)",
    category: "food",
    priority: "essential",
    description: "Tiny, weighs nothing, opens canned food. Every kit needs one.",
    estimatedCost: 2,
  },
  {
    id: "pet-food",
    name: "Pet Food (3-day supply per pet)",
    category: "food",
    priority: "essential",
    description: "Dry kibble in sealed bag. Include pet bowls.",
    estimatedCost: 15,
    conditions: [{ question: "pets", minCount: 1 }],
  },
  {
    id: "child-snacks",
    name: "Child-Friendly Snacks (crackers, fruit cups)",
    category: "food",
    priority: "recommended",
    description: "Familiar comfort foods for kids reduce stress during emergencies.",
    estimatedCost: 10,
    conditions: [{ question: "children", minCount: 1 }],
  },
  {
    id: "sos-rations",
    name: "S.O.S. Emergency Rations",
    category: "food",
    priority: "recommended",
    description: "Coast Guard approved, compact calories. 3,600 calories per package, non-thirst provoking.",
    estimatedCost: 8,
    affiliateUrl: A("B004MF41LI"),
    affiliateNote: "$8 — Coast Guard approved rations",
  },
  {
    id: "clif-bars",
    name: "Clif Bars (12-pack)",
    category: "food",
    priority: "optional",
    description: "Quick energy, decent shelf life. Familiar comfort food that delivers 250 calories per bar.",
    estimatedCost: 18,
    affiliateUrl: A("B07QSB6KGV"),
    affiliateNote: "$18 — 12-pack energy bars",
    budgetTier: "standard",
  },

  // ═══════════════════════════════════════════
  // SHELTER
  // ═══════════════════════════════════════════
  {
    id: "emergency-blankets",
    name: "Emergency Mylar Blankets (4-pack)",
    category: "shelter",
    priority: "essential",
    description: "Reflects 90% of body heat. Waterproof, windproof. Weighs almost nothing. Always carry extras.",
    estimatedCost: 8,
    affiliateUrl: A("B07Z5H98R7"),
    affiliateNote: "$8 — 4-pack, essential for every kit",
  },
  {
    id: "tarp",
    name: "Heavy-Duty Tarp (10x10)",
    category: "shelter",
    priority: "recommended",
    description: "Ground cover, rain shelter, windbreak. Multi-use survival tool.",
    estimatedCost: 15,
    budgetTier: "standard",
  },
  {
    id: "tent",
    name: "Compact 2-Person Emergency Tent",
    category: "shelter",
    priority: "recommended",
    description: "Lightweight pop-up or backpacking tent. Shelter from rain, wind, and insects.",
    estimatedCost: 50,
    budgetTier: "standard",
    conditions: [{ question: "vehicle", values: ["sedan", "truck-suv"] }],
  },
  {
    id: "sleeping-bag",
    name: "Sleeping Bag (temperature rated)",
    category: "shelter",
    priority: "recommended",
    description: "Rated to 30F or lower for cold regions. Synthetic fill dries faster than down.",
    perAdult: true,
    estimatedCost: 45,
    budgetTier: "standard",
  },
  {
    id: "sleeping-bag-cold",
    name: "Cold-Weather Sleeping Bag (0F rated)",
    category: "shelter",
    priority: "essential",
    description: "Sub-zero rated bag for extreme cold. Synthetic fill works when wet.",
    perAdult: true,
    estimatedCost: 80,
    budgetTier: "standard",
    conditions: [{ question: "climate", values: ["extreme-cold"] }],
  },
  {
    id: "sleeping-pad",
    name: "Sleeping Pad / Foam Roll",
    category: "shelter",
    priority: "recommended",
    description: "Insulation from the ground is critical. Closed-cell foam is cheapest and most reliable.",
    perAdult: true,
    estimatedCost: 20,
    budgetTier: "standard",
  },
  {
    id: "paracord",
    name: "Paracord 550 (100 ft)",
    category: "shelter",
    priority: "recommended",
    description: "550-lb rated cordage. Shelter building, clothesline, gear lashing, and 100 other uses.",
    estimatedCost: 8,
  },
  {
    id: "duct-tape",
    name: "Duct Tape (mini roll)",
    category: "shelter",
    priority: "recommended",
    description: "Repairs gear, seals shelters, first aid, and infinite other uses. Wrap around a pencil to save space.",
    estimatedCost: 4,
  },
  {
    id: "sol-escape-bivvy",
    name: "SOL Escape Bivvy",
    category: "shelter",
    priority: "recommended",
    description: "Breathable emergency shelter — sleep in it. Reflects 70% of body heat while letting moisture escape. Weighs 8.5 oz.",
    estimatedCost: 35,
    affiliateUrl: A("B0CYJX3QCL"),
    affiliateNote: "$35 — Breathable emergency bivvy",
    budgetTier: "standard",
  },

  // ═══════════════════════════════════════════
  // FIRST AID
  // ═══════════════════════════════════════════
  {
    id: "first-aid-kit",
    name: "Comprehensive First Aid Kit (200+ piece)",
    category: "first-aid",
    priority: "essential",
    description: "Bandages, gauze, antiseptic, scissors, tweezers, burn cream, and more. Covers most injuries.",
    estimatedCost: 25,
    affiliateUrl: A("B06XVJDYSF"),
    affiliateNote: "$25 — 200+ piece trauma-ready kit",
  },
  {
    id: "prescription-meds",
    name: "Prescription Medications (7-day supply)",
    category: "first-aid",
    priority: "essential",
    description: "Rotate monthly. Keep copies of prescriptions. Store in waterproof bag.",
    estimatedCost: 0,
    conditions: [{ question: "medical", values: ["prescriptions", "insulin"] }],
  },
  {
    id: "otc-meds",
    name: "OTC Medications (pain, allergy, anti-diarrheal)",
    category: "first-aid",
    priority: "essential",
    description: "Ibuprofen, acetaminophen, Benadryl, Imodium, electrolyte packets. Cover the basics.",
    estimatedCost: 15,
  },
  {
    id: "tourniquet",
    name: "CAT Tourniquet (Gen 7)",
    category: "first-aid",
    priority: "recommended",
    description: "Combat Application Tourniquet. Can save a life in minutes from severe bleeding.",
    estimatedCost: 30,
    budgetTier: "standard",
  },
  {
    id: "insulin-cooler",
    name: "Insulin Cooling Case (FRIO or similar)",
    category: "first-aid",
    priority: "essential",
    description: "Evaporative cooling pouch keeps insulin safe without electricity for 45+ hours.",
    estimatedCost: 25,
    conditions: [{ question: "medical", values: ["insulin"] }],
  },
  {
    id: "cpap-battery",
    name: "CPAP Battery Pack (portable)",
    category: "first-aid",
    priority: "essential",
    description: "Portable battery to power CPAP for 2-3 nights. Critical for sleep apnea patients.",
    estimatedCost: 200,
    conditions: [{ question: "medical", values: ["cpap"] }],
  },
  {
    id: "moleskin",
    name: "Moleskin Blister Pads",
    category: "first-aid",
    priority: "recommended",
    description: "Prevent and treat blisters. Essential if you might be walking.",
    estimatedCost: 6,
    conditions: [{ question: "vehicle", values: ["none"] }],
  },
  {
    id: "child-meds",
    name: "Children's Medications (Tylenol, Benadryl)",
    category: "first-aid",
    priority: "essential",
    description: "Liquid or chewable children's pain/fever/allergy meds. Check dosing charts.",
    estimatedCost: 12,
    conditions: [{ question: "children", minCount: 1 }],
  },
  {
    id: "elderly-meds-organizer",
    name: "Medication Organizer + Med List Card",
    category: "first-aid",
    priority: "essential",
    description: "Waterproof pill organizer. Include a laminated card listing all medications, dosages, and allergies.",
    estimatedCost: 8,
    conditions: [{ question: "elderly", minCount: 1 }],
  },

  // ═══════════════════════════════════════════
  // TOOLS
  // ═══════════════════════════════════════════
  {
    id: "headlamp",
    name: "BioLite HeadLamp 200",
    category: "tools",
    priority: "essential",
    description: "Rechargeable, moisture-wicking, 200 lumens. Hands-free lighting is critical.",
    perAdult: true,
    estimatedCost: 30,
    affiliateUrl: A("B07T25LMYB"),
    affiliateNote: "$30 — Rechargeable, lightweight",
    budgetTier: "standard",
  },
  {
    id: "flashlight",
    name: "LED Flashlight + Extra Batteries",
    category: "tools",
    priority: "essential",
    description: "Reliable AA or AAA flashlight. Backup to headlamp. Include spare batteries.",
    estimatedCost: 12,
  },
  {
    id: "stormproof-matches",
    name: "UCO Stormproof Matches",
    category: "tools",
    priority: "essential",
    description: "Burn in wind and rain. 15-second burn time. Waterproof container included.",
    estimatedCost: 8,
    affiliateUrl: A("B00773VVHO"),
    affiliateNote: "$8 — Burns in any weather",
  },
  {
    id: "lighter",
    name: "BIC Lighter (2-pack)",
    category: "tools",
    priority: "essential",
    description: "Cheap, reliable fire starting. Carry at least two.",
    estimatedCost: 3,
  },
  {
    id: "multitool",
    name: "Multi-Tool (Leatherman or similar)",
    category: "tools",
    priority: "essential",
    description: "Pliers, knife, saw, screwdriver, and more. One tool covers dozens of tasks.",
    estimatedCost: 30,
    budgetTier: "standard",
  },
  {
    id: "knife",
    name: "Fixed-Blade Knife",
    category: "tools",
    priority: "recommended",
    description: "Full-tang fixed blade, 4-5 inch. Stronger than a folder for batoning, shelter work, and food prep.",
    estimatedCost: 35,
    budgetTier: "standard",
  },
  {
    id: "whistle",
    name: "Emergency Whistle",
    category: "tools",
    priority: "essential",
    description: "Audible over 1 mile. Three short blasts = universal distress signal. Weighs nothing.",
    estimatedCost: 3,
  },
  {
    id: "dust-mask",
    name: "N95 Dust Masks (10-pack)",
    category: "tools",
    priority: "essential",
    description: "Protects against dust, smoke, ash, and airborne particles. Essential for wildfires and earthquakes.",
    estimatedCost: 10,
    conditions: [{ question: "climate", values: ["wildfires", "earthquakes"] }],
  },
  {
    id: "dust-mask-general",
    name: "N95 Dust Masks (5-pack)",
    category: "tools",
    priority: "recommended",
    description: "General protection against dust and debris. Good to have in any kit.",
    estimatedCost: 7,
  },
  {
    id: "work-gloves",
    name: "Heavy-Duty Work Gloves",
    category: "tools",
    priority: "recommended",
    description: "Protect hands during debris clearing, shelter building, and fire management.",
    estimatedCost: 12,
  },
  {
    id: "wrench-shutoff",
    name: "Gas / Water Shut-Off Wrench",
    category: "tools",
    priority: "recommended",
    description: "Shut off gas and water mains after an earthquake or flood. Non-sparking is ideal.",
    estimatedCost: 10,
    conditions: [{ question: "climate", values: ["earthquakes", "flooding"] }],
  },
  {
    id: "pry-bar",
    name: "Compact Pry Bar",
    category: "tools",
    priority: "optional",
    description: "Open jammed doors, move debris, break through obstacles during earthquake or tornado aftermath.",
    estimatedCost: 15,
    conditions: [{ question: "climate", values: ["earthquakes", "tornadoes"] }],
    budgetTier: "standard",
  },
  {
    id: "fire-extinguisher",
    name: "Compact Fire Extinguisher",
    category: "tools",
    priority: "recommended",
    description: "Small ABC-rated extinguisher. Critical for wildfire areas and earthquake zones (gas leaks).",
    estimatedCost: 20,
    conditions: [{ question: "climate", values: ["wildfires", "earthquakes"] }],
    budgetTier: "standard",
  },
  {
    id: "gerber-strongarm",
    name: "Gerber Strongarm Fixed Blade",
    category: "tools",
    priority: "recommended",
    description: "Full-tang, pommel striker. Ceramic coated 420HC steel handles batoning, food prep, and shelter work.",
    estimatedCost: 65,
    affiliateUrl: A("B00U0ILXGC"),
    affiliateNote: "$65 — Full-tang with pommel striker",
    budgetTier: "standard",
  },
  {
    id: "leatherman-signal",
    name: "Leatherman Signal",
    category: "tools",
    priority: "optional",
    description: "Multi-tool with fire starter + whistle. 19 tools in one including a ferro rod and emergency whistle.",
    estimatedCost: 120,
    affiliateUrl: A("B084T78Z82"),
    affiliateNote: "$120 — Multi-tool with fire starter",
    budgetTier: "premium",
  },
  {
    id: "black-diamond-spot",
    name: "Black Diamond Spot 400",
    category: "tools",
    priority: "recommended",
    description: "400 lumen headlamp, red night mode. Waterproof, runs on AAA batteries, and has a lock mode to prevent accidental drain.",
    estimatedCost: 40,
    affiliateUrl: A("B0DK2QZYKG"),
    affiliateNote: "$40 — 400 lumen, red night mode",
    budgetTier: "standard",
  },

  // ═══════════════════════════════════════════
  // COMMUNICATION
  // ═══════════════════════════════════════════
  {
    id: "emergency-radio",
    name: "Eton Emergency Weather Radio",
    category: "communication",
    priority: "essential",
    description: "NOAA weather alerts, AM/FM, hand-crank + solar + USB charging. Phone charger built in.",
    estimatedCost: 40,
    affiliateUrl: A("B0C5KSYZ1N"),
    affiliateNote: "$40 — Hand-crank + solar + NOAA",
  },
  {
    id: "phone-charger",
    name: "Portable Power Bank (20,000 mAh)",
    category: "communication",
    priority: "essential",
    description: "Charges a phone 4-5 times. Keep it topped off and rotate into daily use.",
    estimatedCost: 25,
  },
  {
    id: "charging-cables",
    name: "USB Charging Cables (Lightning + USB-C)",
    category: "communication",
    priority: "essential",
    description: "Spare cables for all devices in your household. Include a USB-A to USB-C adapter.",
    estimatedCost: 8,
  },
  {
    id: "frs-radios",
    name: "FRS Two-Way Radios (pair)",
    category: "communication",
    priority: "recommended",
    description: "When cell towers are down, FRS radios work. 2-mile range in most conditions.",
    estimatedCost: 30,
    budgetTier: "standard",
  },
  {
    id: "signal-mirror",
    name: "Signal Mirror",
    category: "communication",
    priority: "optional",
    description: "Visible up to 10 miles. No batteries needed. Emergency signaling backup.",
    estimatedCost: 5,
  },
  {
    id: "midland-t77",
    name: "Midland T77VP5 GMRS Radio",
    category: "communication",
    priority: "recommended",
    description: "38-mile range, NOAA weather alerts. License-free and rechargeable — serious upgrade over basic FRS radios.",
    estimatedCost: 60,
    affiliateUrl: A("B01LVUBPPA"),
    affiliateNote: "$60 — 38-mile range GMRS radio pair",
    budgetTier: "standard",
  },
  {
    id: "anker-powercore-20k",
    name: "Anker 737 Power Bank (24,000mAh)",
    category: "communication",
    priority: "recommended",
    description: "Charge your phone 5+ times. Dual USB output charges two devices simultaneously. Keep communications alive for days.",
    estimatedCost: 30,
    affiliateUrl: A("B09VPHVT2Z"),
    affiliateNote: "$30 — 20,000mAh portable charger",
    budgetTier: "standard",
  },

  // ═══════════════════════════════════════════
  // DOCUMENTS
  // ═══════════════════════════════════════════
  {
    id: "document-copies",
    name: "Copies of Important Documents",
    category: "documents",
    priority: "essential",
    description: "IDs, insurance policies, bank info, medical records, prescriptions. Laminate or store in waterproof bag.",
    estimatedCost: 5,
  },
  {
    id: "usb-drive",
    name: "USB Drive with Digital Copies",
    category: "documents",
    priority: "recommended",
    description: "Encrypted USB with scans of all critical documents, photos, and contacts.",
    estimatedCost: 10,
  },
  {
    id: "emergency-contacts",
    name: "Emergency Contact Card (laminated)",
    category: "documents",
    priority: "essential",
    description: "Phone numbers, rally points, out-of-state contacts. Assume your phone is dead.",
    estimatedCost: 1,
  },
  {
    id: "cash",
    name: "Cash ($200 in small bills)",
    category: "documents",
    priority: "essential",
    description: "ATMs and card readers go down. $1, $5, $10, and $20 bills. Include coins for vending machines.",
    estimatedCost: 200,
  },
  {
    id: "local-maps",
    name: "Local Area Maps (paper)",
    category: "documents",
    priority: "recommended",
    description: "State highway map and local street map. Mark evacuation routes, rally points, and shelters.",
    estimatedCost: 5,
  },
  {
    id: "waterproof-bag",
    name: "Waterproof Document Bag",
    category: "documents",
    priority: "essential",
    description: "Ziplock or dry bag for documents, cash, and electronics. Redundancy on flood protection.",
    estimatedCost: 5,
    conditions: [{ question: "climate", values: ["hurricanes", "flooding"] }],
  },
  {
    id: "waterproof-bag-general",
    name: "Waterproof Bag (small dry bag)",
    category: "documents",
    priority: "recommended",
    description: "Protects documents, electronics, and valuables from rain and spills.",
    estimatedCost: 8,
  },

  // ═══════════════════════════════════════════
  // CLOTHING
  // ═══════════════════════════════════════════
  {
    id: "change-of-clothes",
    name: "Complete Change of Clothes",
    category: "clothing",
    priority: "essential",
    description: "Underwear, socks, pants, shirt. Season-appropriate. Layers in cold climates.",
    perPerson: true,
    estimatedCost: 0,
  },
  {
    id: "rain-poncho",
    name: "Rain Poncho / Rain Gear",
    category: "clothing",
    priority: "essential",
    description: "Lightweight and compact. Keeps you dry in rain, doubles as a ground cover.",
    perAdult: true,
    estimatedCost: 5,
  },
  {
    id: "sturdy-shoes",
    name: "Sturdy Closed-Toe Shoes / Boots",
    category: "clothing",
    priority: "essential",
    description: "Broken glass, debris, flood water. Never evacuate in sandals. Keep by your bed.",
    perPerson: true,
    estimatedCost: 0,
  },
  {
    id: "warm-layers",
    name: "Warm Layers (fleece, insulated jacket)",
    category: "clothing",
    priority: "essential",
    description: "Hypothermia is the #1 outdoor killer. Layer: base, insulation, shell.",
    perAdult: true,
    estimatedCost: 30,
    conditions: [{ question: "climate", values: ["extreme-cold"] }],
  },
  {
    id: "warm-layers-general",
    name: "Warm Layer (fleece or hoodie)",
    category: "clothing",
    priority: "recommended",
    description: "Temperatures drop at night in any season. One warm layer per person.",
    perAdult: true,
    estimatedCost: 15,
  },
  {
    id: "hat-gloves",
    name: "Warm Hat + Insulated Gloves",
    category: "clothing",
    priority: "essential",
    description: "You lose 40% of body heat through your head. Hands need protection for tasks.",
    perPerson: true,
    estimatedCost: 10,
    conditions: [{ question: "climate", values: ["extreme-cold"] }],
  },
  {
    id: "sun-hat",
    name: "Wide-Brim Sun Hat",
    category: "clothing",
    priority: "essential",
    description: "Sun protection prevents heat exhaustion. Wide brim covers neck and ears.",
    perAdult: true,
    estimatedCost: 10,
    conditions: [{ question: "climate", values: ["extreme-heat"] }],
  },
  {
    id: "bandana",
    name: "Bandana / Buff (2-pack)",
    category: "clothing",
    priority: "recommended",
    description: "Dust mask, sweat band, water filter pre-screen, sling, tourniquet. Infinite uses.",
    estimatedCost: 6,
  },
  {
    id: "child-clothing",
    name: "Children's Change of Clothes",
    category: "clothing",
    priority: "essential",
    description: "Age-appropriate extra outfit. Include a comfort item (small toy or stuffed animal).",
    estimatedCost: 0,
    conditions: [{ question: "children", minCount: 1 }],
  },

  // ═══════════════════════════════════════════
  // HYGIENE
  // ═══════════════════════════════════════════
  {
    id: "toilet-paper",
    name: "Toilet Paper (compact roll)",
    category: "hygiene",
    priority: "essential",
    description: "Flatten the roll, remove the tube, put it in a ziplock bag. Simple but critical.",
    estimatedCost: 2,
  },
  {
    id: "hand-sanitizer",
    name: "Hand Sanitizer (travel size)",
    category: "hygiene",
    priority: "essential",
    description: "When water is scarce, hand sanitizer prevents disease spread.",
    estimatedCost: 3,
  },
  {
    id: "wet-wipes",
    name: "Wet Wipes / Baby Wipes (large pack)",
    category: "hygiene",
    priority: "essential",
    description: "Full-body cleanup without water. Baby wipes work for adults too.",
    estimatedCost: 5,
  },
  {
    id: "toothbrush",
    name: "Toothbrush + Travel Toothpaste",
    category: "hygiene",
    priority: "recommended",
    description: "Oral hygiene prevents infection. Small tube of toothpaste lasts days.",
    perPerson: true,
    estimatedCost: 2,
  },
  {
    id: "trash-bags",
    name: "Heavy-Duty Trash Bags (3-pack)",
    category: "hygiene",
    priority: "essential",
    description: "Waste disposal, rain poncho, ground cover, gear waterproofing. Multi-use essential.",
    estimatedCost: 3,
  },
  {
    id: "sunscreen",
    name: "Sunscreen (SPF 50+)",
    category: "hygiene",
    priority: "essential",
    description: "Sunburn is debilitating in a survival situation. Apply every 2 hours.",
    estimatedCost: 8,
    conditions: [{ question: "climate", values: ["extreme-heat", "wildfires"] }],
  },
  {
    id: "insect-repellent",
    name: "Insect Repellent (DEET or Picaridin)",
    category: "hygiene",
    priority: "recommended",
    description: "Mosquitoes and ticks carry disease. Essential in humid / flooded areas.",
    estimatedCost: 8,
    conditions: [{ question: "climate", values: ["hurricanes", "flooding"] }],
  },
  {
    id: "diapers",
    name: "Diapers + Baby Wipes (3-day supply)",
    category: "hygiene",
    priority: "essential",
    description: "If you have a child in diapers, this is non-negotiable.",
    estimatedCost: 15,
    conditions: [{ question: "children", minCount: 1 }],
  },
  {
    id: "feminine-hygiene",
    name: "Feminine Hygiene Products",
    category: "hygiene",
    priority: "recommended",
    description: "Multi-day supply. Store in waterproof bag.",
    estimatedCost: 8,
  },
  {
    id: "camp-soap",
    name: "Biodegradable Camp Soap (small bottle)",
    category: "hygiene",
    priority: "optional",
    description: "Wash dishes, clean wounds, laundry. One small bottle covers 72 hours.",
    estimatedCost: 5,
    budgetTier: "standard",
  },

  // ═══════════════════════════════════════════
  // SPECIAL NEEDS
  // ═══════════════════════════════════════════
  {
    id: "pet-carrier",
    name: "Pet Carrier / Leash + Collar",
    category: "special-needs",
    priority: "essential",
    description: "Secure carrier for cats/small dogs. Extra leash and collar with ID tags for dogs.",
    estimatedCost: 25,
    conditions: [{ question: "pets", minCount: 1 }],
  },
  {
    id: "pet-water-bowl",
    name: "Collapsible Pet Water Bowl",
    category: "special-needs",
    priority: "essential",
    description: "Lightweight silicone bowl. Pets need water too.",
    estimatedCost: 5,
    conditions: [{ question: "pets", minCount: 1 }],
  },
  {
    id: "pet-records",
    name: "Pet Vaccination Records (copies)",
    category: "special-needs",
    priority: "recommended",
    description: "Shelters require proof of vaccinations. Keep copies in waterproof bag.",
    estimatedCost: 0,
    conditions: [{ question: "pets", minCount: 1 }],
  },
  {
    id: "mobility-aid-extras",
    name: "Mobility Aid Spares (cane tip, wheelchair patch kit)",
    category: "special-needs",
    priority: "essential",
    description: "Spare parts for mobility equipment. A flat tire or broken cane tip is an emergency within an emergency.",
    estimatedCost: 15,
    conditions: [{ question: "medical", values: ["mobility"] }],
  },
  {
    id: "comfort-items-elderly",
    name: "Comfort Items for Elderly (blanket, pillow, meds organizer)",
    category: "special-needs",
    priority: "recommended",
    description: "Extra padding, warmth, and organization helps elderly members stay comfortable and compliant with meds.",
    estimatedCost: 20,
    conditions: [{ question: "elderly", minCount: 1 }],
  },
  {
    id: "child-entertainment",
    name: "Children's Activity Kit (crayons, cards, small games)",
    category: "special-needs",
    priority: "recommended",
    description: "Keeping kids occupied reduces stress for everyone. Small bag of activities and comfort items.",
    estimatedCost: 10,
    conditions: [{ question: "children", minCount: 1 }],
  },
  {
    id: "sandbags",
    name: "Sand Bags (empty, 10-pack)",
    category: "special-needs",
    priority: "recommended",
    description: "Fill with sand or dirt for flood barriers. Light and flat when stored empty.",
    estimatedCost: 15,
    conditions: [{ question: "climate", values: ["flooding", "hurricanes"] }],
  },
  {
    id: "goggles",
    name: "Safety Goggles (sealed)",
    category: "special-needs",
    priority: "recommended",
    description: "Protect eyes from smoke, ash, dust, and debris. Sealed goggles for wildfire and earthquake scenarios.",
    estimatedCost: 8,
    conditions: [{ question: "climate", values: ["wildfires", "earthquakes", "tornadoes"] }],
  },
  {
    id: "cooling-towel",
    name: "Cooling Towel (evaporative)",
    category: "special-needs",
    priority: "recommended",
    description: "Wet, wring, and snap to activate. Lowers body temperature in extreme heat.",
    perAdult: true,
    estimatedCost: 8,
    conditions: [{ question: "climate", values: ["extreme-heat"] }],
  },
  {
    id: "hand-warmers",
    name: "Hand Warmers (10-pack)",
    category: "special-needs",
    priority: "essential",
    description: "8-hour disposable hand warmers. Also warm core body when placed in pockets or sleeping bag.",
    estimatedCost: 10,
    conditions: [{ question: "climate", values: ["extreme-cold"] }],
  },
];

// ─── Regional Tips ───

export const regionTips: Record<string, string[]> = {
  northeast: [
    "Pack extra warm layers and hand warmers — nor'easters can knock out power for a week.",
    "Ice storms are the #1 threat. Keep road salt and an ice scraper in your vehicle kit.",
    "FEMA shelters fill fast in urban areas. Have a secondary shelter plan (friends, family outside the zone).",
  ],
  southeast: [
    "Hurricane season runs June through November. Build your kit by May and check it monthly.",
    "Heat and humidity accelerate food and medication spoilage. Rotate supplies every 6 months.",
    "Flooding is the deadliest hurricane hazard — never drive through standing water.",
  ],
  midwest: [
    "Tornado season peaks March through June. Identify your safe room and practice with family.",
    "Severe thunderstorms can produce baseball-size hail. Protect vehicles and have a hard-cover shelter plan.",
    "Rural areas may lose power for days. A backup generator or power station is worth the investment.",
  ],
  southwest: [
    "Extreme heat kills more Americans than any other weather event. Hydration is your #1 priority.",
    "Store extra water — the 1-gallon-per-person FEMA minimum is not enough in 110+ degree heat. Plan for 1.5-2 gallons.",
    "Flash floods happen with little warning in desert terrain. Know your flood zones and avoid dry washes.",
  ],
  mountain: [
    "Altitude increases dehydration and calorie burn. Pack 25% more water and food than lowland estimates.",
    "Temperature swings of 40+ degrees in a single day are common. Layer system is mandatory.",
    "Snow can strand you for days. Keep a full winter kit in your vehicle from October through April.",
  ],
  california: [
    "Earthquakes, wildfires, and drought are your big three. Prep for all of them, not just one.",
    "Wildfire evacuations happen with minutes of notice. Keep your kit by the door, not in the garage.",
    "Water infrastructure is fragile — store extra water and have purification. Aqueduct disruption is a real scenario.",
  ],
  "pacific-nw": [
    "The Cascadia Subduction Zone is overdue for a major earthquake. Earthquake prep is not optional here.",
    "Rain is constant — waterproof everything. Dry bags and rain gear are essentials, not luxuries.",
    "Wildfire smoke from inland fires can make air quality hazardous. Keep N95 masks stocked year-round.",
  ],
  alaska: [
    "Extreme cold and long darkness require serious gear. Hypothermia can set in within minutes at -40F.",
    "Resupply takes days or weeks in remote areas. Build a 7-day kit minimum, not just 72 hours.",
    "Wildlife encounters are real — bear spray, proper food storage, and noise-making devices are standard.",
  ],
  hawaii: [
    "Island isolation means supply chains break fast. Stores empty within hours of a major event.",
    "Volcanic activity (vog, lava flows) is unique to Hawaii. Track USGS alerts and have respirator masks.",
    "Tsunami warnings are frequent. Know your evacuation zone and vertical evacuation options.",
  ],
};

export const climateTips: Record<string, string[]> = {
  "extreme-cold": [
    "Hypothermia is the #1 killer. The rule of 3s: you can survive 3 hours without shelter in harsh conditions.",
    "Cotton kills — when wet it loses all insulating value. Use wool or synthetic base layers.",
    "Keep your car's gas tank above half at all times. A running engine is a heater.",
  ],
  "extreme-heat": [
    "Heat stroke is a medical emergency. Know the signs: confusion, hot/dry skin, rapid pulse.",
    "Hydrate BEFORE you feel thirsty. By the time you are thirsty, you are already dehydrated.",
    "Schedule physical activity for early morning or evening. Rest in shade during peak heat (10am-4pm).",
  ],
  hurricanes: [
    "Board up windows or have pre-cut plywood ready. Hurricane shutters are the best investment.",
    "Fill bathtubs with water before the storm for flushing toilets and general use.",
    "After the storm, avoid downed power lines and standing water. Electrocution and contamination are real risks.",
  ],
  earthquakes: [
    "Drop, Cover, Hold On. Do NOT stand in a doorway — that advice is outdated.",
    "Secure heavy furniture, water heaters, and bookshelves to walls with earthquake straps.",
    "After a quake, check gas lines. If you smell gas, shut off the main and leave immediately.",
  ],
  wildfires: [
    "Have a go-bag ready at all times during fire season. Evacuations can come with minutes of warning.",
    "Create defensible space: 30 feet of clearance around structures, no dead vegetation.",
    "An N95 mask only filters particles — for heavy smoke exposure, you need a P100 respirator.",
  ],
  tornadoes: [
    "Your safe room should be interior, ground floor, no windows. Basement is ideal.",
    "Mobile homes are never safe in a tornado. Identify a nearby sturdy building as your shelter.",
    "Keep shoes and a helmet by your bed. Most tornado injuries are from debris and flying glass.",
  ],
  flooding: [
    "6 inches of moving water can knock you down. 12 inches can carry a vehicle. Never walk or drive through floods.",
    "Move important documents and valuables to the highest floor before a flood watch becomes a warning.",
    "Flood water is contaminated. Do not drink, cook with, or bathe in flood water without treatment.",
  ],
};
