// ─── Overland Load Balancer — Trip Gear Database ─────────────────────
// Items loaded for a trip. These are NOT permanent mods — they're what
// goes in, on, and around the vehicle when you leave the driveway.
//
// Each item has a suggested placement zone. The user can override zone.
//
// Zones:
//   cab      — inside the cab (passengers, bags, small items)
//   bed-fwd  — front third of the bed (closest to cab)
//   bed-mid  — middle third of the bed
//   bed-aft  — rear third of the bed (closest to tailgate)
//   roof     — on the roof rack or bed rack above bed rails
//   tongue   — tongue weight on a trailer hitch

export type GearZone = "cab" | "bed-fwd" | "bed-mid" | "bed-aft" | "roof" | "tongue";

export type GearCategory =
  | "people"
  | "sleeping"
  | "shelter"
  | "cooking"
  | "water"
  | "power"
  | "recovery"
  | "tools"
  | "food"
  | "clothing"
  | "comms"
  | "comfort"
  | "pets"
  | "misc";

export interface LBGearItem {
  id: string;
  name: string;
  category: GearCategory;
  weightLbs: number;
  defaultZone: GearZone;
  unit?: string; // "per person", "per gal", etc.
  notes?: string;
  affiliateUrl?: string;
}

export const gearDatabase: LBGearItem[] = [

  // ══════════════════════════════════════════════════════════════════
  // PEOPLE — Passengers and driver weight
  // ══════════════════════════════════════════════════════════════════

  {
    id: "person-adult",
    name: "Adult Passenger",
    category: "people",
    weightLbs: 175,
    defaultZone: "cab",
    unit: "per person",
    notes: "NHTSA uses 150 lbs per person as minimum. Adjust to actual weight.",
  },
  {
    id: "person-teen",
    name: "Teen Passenger (13–17)",
    category: "people",
    weightLbs: 130,
    defaultZone: "cab",
    unit: "per person",
  },
  {
    id: "person-child",
    name: "Child Passenger (under 13)",
    category: "people",
    weightLbs: 75,
    defaultZone: "cab",
    unit: "per person",
  },

  // ══════════════════════════════════════════════════════════════════
  // SLEEPING
  // ══════════════════════════════════════════════════════════════════

  {
    id: "sleeping-bag-down-20f",
    name: "Sleeping Bag — Down 20°F",
    category: "sleeping",
    weightLbs: 2.3,
    defaultZone: "bed-mid",
    notes: "Kelty Cosmic Down 2.5 lbs, Western Mountaineering 1.8 lbs.",
    affiliateUrl: "https://www.amazon.com/s?k=down+sleeping+bag+20+degree&tag=prepperevo-20",
  },
  {
    id: "sleeping-bag-synthetic-20f",
    name: "Sleeping Bag — Synthetic 20°F",
    category: "sleeping",
    weightLbs: 3.0,
    defaultZone: "bed-mid",
    notes: "Teton TrailHead 3.5 lbs, REI Lumen 2.5 lbs.",
    affiliateUrl: "https://www.amazon.com/s?k=synthetic+sleeping+bag+20+degree&tag=prepperevo-20",
  },
  {
    id: "sleeping-pad-inflatable",
    name: "Sleeping Pad — Inflatable (Therm-a-Rest NeoAir style)",
    category: "sleeping",
    weightLbs: 1.0,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/dp/B07QF1SLZN?tag=prepperevo-20",
  },
  {
    id: "sleeping-pad-foam",
    name: "Sleeping Pad — Foam (Z-Lite Sol style)",
    category: "sleeping",
    weightLbs: 0.9,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/dp/B0009XT5WK?tag=prepperevo-20",
  },
  {
    id: "camp-pillow",
    name: "Camp Pillow",
    category: "sleeping",
    weightLbs: 0.5,
    defaultZone: "cab",
  },

  // ══════════════════════════════════════════════════════════════════
  // SHELTER
  // ══════════════════════════════════════════════════════════════════

  {
    id: "ground-tent-2p",
    name: "Ground Tent — 2-Person (Big Agnes / MSR style)",
    category: "shelter",
    weightLbs: 4.0,
    defaultZone: "bed-aft",
    notes: "Big Agnes Copper Spur HV UL2: 3.2 lbs. MSR Hubba Hubba: 3.3 lbs.",
    affiliateUrl: "https://www.amazon.com/s?k=2+person+backpacking+tent&tag=prepperevo-20",
  },
  {
    id: "ground-tent-4p",
    name: "Ground Tent — 4-Person (family)",
    category: "shelter",
    weightLbs: 12.0,
    defaultZone: "bed-aft",
    affiliateUrl: "https://www.amazon.com/s?k=4+person+camping+tent&tag=prepperevo-20",
  },
  {
    id: "tarp-shelter",
    name: "Tarp / Shelter Tarp",
    category: "shelter",
    weightLbs: 1.8,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/s?k=camping+tarp&tag=prepperevo-20",
  },
  {
    id: "annex-room",
    name: "RTT Annex Room",
    category: "shelter",
    weightLbs: 16.0,
    defaultZone: "roof",
    notes: "Attaches to rooftop tent for covered ground-level space.",
  },

  // ══════════════════════════════════════════════════════════════════
  // COOKING
  // ══════════════════════════════════════════════════════════════════

  {
    id: "stove-2burner",
    name: "Camp Stove — 2-Burner (Camp Chef style)",
    category: "cooking",
    weightLbs: 12.0,
    defaultZone: "bed-mid",
    notes: "Camp Chef Explorer 2-Burner: 12 lbs.",
    affiliateUrl: "https://www.amazon.com/dp/B000EV0VWQ?tag=prepperevo-20",
  },
  {
    id: "stove-single",
    name: "Camp Stove — Single Burner",
    category: "cooking",
    weightLbs: 2.5,
    defaultZone: "cab",
  },
  {
    id: "stove-jetboil",
    name: "Jetboil Flash / MiniMo System",
    category: "cooking",
    weightLbs: 1.0,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/dp/B00CQMCUIO?tag=prepperevo-20",
  },
  {
    id: "cast-iron-skillet-10",
    name: "Cast Iron Skillet — 10\" (Lodge)",
    category: "cooking",
    weightLbs: 5.2,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/dp/B00006JSUA?tag=prepperevo-20",
  },
  {
    id: "cast-iron-dutch-oven",
    name: "Cast Iron Dutch Oven — 5 Qt",
    category: "cooking",
    weightLbs: 11.0,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/dp/B00063RWYI?tag=prepperevo-20",
  },
  {
    id: "cookset-titanium",
    name: "Pot/Pan Cook Set (titanium/aluminum)",
    category: "cooking",
    weightLbs: 1.8,
    defaultZone: "bed-mid",
  },
  {
    id: "propane-1lb",
    name: "Propane Canister — 1 lb",
    category: "cooking",
    weightLbs: 2.3,
    defaultZone: "bed-mid",
    unit: "each (full)",
    notes: "Tare ~1.1 lbs, full 2.3 lbs.",
    affiliateUrl: "https://www.amazon.com/s?k=1lb+propane+camping&tag=prepperevo-20",
  },
  {
    id: "propane-20lb",
    name: "Propane Tank — 20 lb",
    category: "cooking",
    weightLbs: 37.5,
    defaultZone: "bed-aft",
    unit: "each (full)",
    notes: "Tare ~18 lbs, full 37–38 lbs.",
    affiliateUrl: "https://www.amazon.com/s?k=20+lb+propane+tank&tag=prepperevo-20",
  },
  {
    id: "cooler-hard-45qt",
    name: "Cooler — Hard Side 45 Qt (Yeti Tundra / RTIC style)",
    category: "cooking",
    weightLbs: 27.0,
    defaultZone: "bed-mid",
    notes: "Yeti Tundra 45: 24.6 lbs empty. RTIC 45: 29.5 lbs empty. Add ice weight separately.",
    affiliateUrl: "https://www.amazon.com/dp/B00CFG5RVW?tag=prepperevo-20",
  },
  {
    id: "cooler-soft-45qt",
    name: "Cooler — Soft Side 45 Qt",
    category: "cooking",
    weightLbs: 7.0,
    defaultZone: "cab",
    notes: "RTIC Soft Pack, Yeti Hopper. Much lighter than hard cooler.",
  },
  {
    id: "ice-cooler",
    name: "Ice — 10 lbs (per day estimate)",
    category: "cooking",
    weightLbs: 10.0,
    defaultZone: "bed-mid",
    unit: "per 10 lbs",
    notes: "Budget 1 lb of ice per degree of ambient temp per day. 10 lbs is a conservative daily estimate.",
  },
  {
    id: "fridge-12v-30l",
    name: "12V Compressor Fridge — 30L (BougeRV / Dometic CFX3 25)",
    category: "cooking",
    weightLbs: 24.0,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/dp/B08WHPKP42?tag=prepperevo-20",
  },
  {
    id: "fridge-12v-45l",
    name: "12V Compressor Fridge — 45L (Dometic CFX3 45 / ARB 47)",
    category: "cooking",
    weightLbs: 41.0,
    defaultZone: "bed-mid",
    notes: "Dometic CFX3 45: 41.2 lbs. ARB 60L: 61.6 lbs for the larger model.",
    affiliateUrl: "https://www.amazon.com/dp/B08SCC3SKK?tag=prepperevo-20",
  },
  {
    id: "camp-kitchen-organizer",
    name: "Camp Kitchen Organizer (table-top style)",
    category: "cooking",
    weightLbs: 8.0,
    defaultZone: "bed-mid",
  },
  {
    id: "utensils-cutting",
    name: "Utensils + Cutting Board Set",
    category: "cooking",
    weightLbs: 2.0,
    defaultZone: "cab",
  },
  {
    id: "dishes-plates",
    name: "Plates / Bowls / Mugs (camp set)",
    category: "cooking",
    weightLbs: 2.5,
    defaultZone: "bed-mid",
  },

  // ══════════════════════════════════════════════════════════════════
  // WATER
  // ══════════════════════════════════════════════════════════════════

  {
    id: "water-jug-5gal-full",
    name: "Water Jug — 5 Gallon (full)",
    category: "water",
    weightLbs: 43.2,
    defaultZone: "bed-aft",
    unit: "each (full — 41.7 lbs water + 1.5 lbs jug)",
    notes: "Water = 8.34 lbs/gal × 5 = 41.7 lbs + jug weight.",
    affiliateUrl: "https://www.amazon.com/dp/B007NOZGKC?tag=prepperevo-20",
  },
  {
    id: "water-jug-5gal-empty",
    name: "Water Jug — 5 Gallon (empty)",
    category: "water",
    weightLbs: 2.0,
    defaultZone: "bed-aft",
  },
  {
    id: "water-jug-7gal-full",
    name: "Water Jug — 7 Gallon (full)",
    category: "water",
    weightLbs: 60.4,
    defaultZone: "bed-aft",
    unit: "each (full — 58.4 lbs water + 2 lbs jug)",
    affiliateUrl: "https://www.amazon.com/dp/B001QR9M8M?tag=prepperevo-20",
  },
  {
    id: "water-filter-gravity",
    name: "Gravity Water Filter (Platypus GravityWorks / MSR AutoFlow)",
    category: "water",
    weightLbs: 0.7,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/dp/B00EXJVMBU?tag=prepperevo-20",
  },
  {
    id: "water-filter-squeeze",
    name: "Squeeze Filter (Sawyer Squeeze / Katadyn BeFree)",
    category: "water",
    weightLbs: 0.3,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/dp/B00FA2RLX2?tag=prepperevo-20",
  },
  {
    id: "water-pump-manual",
    name: "Water Pump — Manual Transfer Pump",
    category: "water",
    weightLbs: 1.2,
    defaultZone: "bed-mid",
  },

  // ══════════════════════════════════════════════════════════════════
  // POWER — Portable power (not installed in vehicle)
  // ══════════════════════════════════════════════════════════════════

  {
    id: "power-bank-20000mah",
    name: "USB Power Bank — 20,000 mAh",
    category: "power",
    weightLbs: 1.1,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/s?k=20000mah+power+bank&tag=prepperevo-20",
  },
  {
    id: "power-station-500wh",
    name: "Portable Power Station — 500–600 Wh (Jackery 500 / EcoFlow River 2)",
    category: "power",
    weightLbs: 13.5,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/dp/B08XNBRK6P?tag=prepperevo-20",
  },
  {
    id: "power-station-1000wh",
    name: "Portable Power Station — 1,000–1,200 Wh (Jackery 1000 / EcoFlow Delta 2)",
    category: "power",
    weightLbs: 25.0,
    defaultZone: "bed-mid",
    notes: "Jackery 1000 v2: 23.8 lbs. EcoFlow Delta 2: ~27 lbs.",
    affiliateUrl: "https://www.amazon.com/dp/B09FBW8KSZ?tag=prepperevo-20",
  },
  {
    id: "power-station-2000wh",
    name: "Portable Power Station — 2,000–3,000 Wh (EcoFlow Delta 3 Ultra / Jackery 2000)",
    category: "power",
    weightLbs: 55.0,
    defaultZone: "bed-mid",
    notes: "EcoFlow Delta 3 Ultra: 72 lbs. Jackery 2000 Pro: 43 lbs. Confirm your model.",
    affiliateUrl: "https://www.amazon.com/dp/B0D2FLCLT4?tag=prepperevo-20",
  },
  {
    id: "solar-panel-portable-100w",
    name: "Solar Panel — 100W Portable (foldable)",
    category: "power",
    weightLbs: 7.5,
    defaultZone: "bed-aft",
    affiliateUrl: "https://www.amazon.com/s?k=100w+portable+solar+panel&tag=prepperevo-20",
  },
  {
    id: "solar-panel-portable-200w",
    name: "Solar Panel — 200W Portable (foldable, EcoFlow / Jackery style)",
    category: "power",
    weightLbs: 15.5,
    defaultZone: "bed-aft",
    notes: "EcoFlow 220W NextGen: 15.4 lbs. EcoFlow 220W standard: 20.9 lbs.",
    affiliateUrl: "https://www.amazon.com/dp/B09Q8HVM1K?tag=prepperevo-20",
  },
  {
    id: "battery-lifepo4-100ah",
    name: "LiFePO4 Battery — 100Ah 12V (portable, in vehicle)",
    category: "power",
    weightLbs: 24.0,
    defaultZone: "bed-mid",
    notes: "LiTime 100Ah: 24 lbs. Battle Born 100Ah: 31 lbs. Renogy Core: 23 lbs.",
    affiliateUrl: "https://www.amazon.com/s?k=100ah+lifepo4+battery&tag=prepperevo-20",
  },

  // ══════════════════════════════════════════════════════════════════
  // RECOVERY
  // ══════════════════════════════════════════════════════════════════

  {
    id: "recovery-boards-maxtrax",
    name: "Recovery Boards — MAXTRAX MKII (pair)",
    category: "recovery",
    weightLbs: 15.0,
    defaultZone: "bed-aft",
    affiliateUrl: "https://www.amazon.com/dp/B08FNFVT2H?tag=prepperevo-20",
  },
  {
    id: "recovery-boards-xbull",
    name: "Recovery Boards — X-Bull (pair, budget)",
    category: "recovery",
    weightLbs: 12.5,
    defaultZone: "bed-aft",
    affiliateUrl: "https://www.amazon.com/s?k=xbull+recovery+boards&tag=prepperevo-20",
  },
  {
    id: "hi-lift-jack-48",
    name: "Hi-Lift Jack — 48\" All-Cast",
    category: "recovery",
    weightLbs: 30.0,
    defaultZone: "bed-aft",
    affiliateUrl: "https://www.amazon.com/dp/B0044WRFXS?tag=prepperevo-20",
  },
  {
    id: "kinetic-rope-34",
    name: "Kinetic Recovery Rope — 3/4\" (Bubba Rope / Yankum)",
    category: "recovery",
    weightLbs: 9.0,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/dp/B07GWMLDSP?tag=prepperevo-20",
  },
  {
    id: "snatch-block",
    name: "Snatch Block (heavy duty)",
    category: "recovery",
    weightLbs: 5.0,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/s?k=snatch+block+recovery&tag=prepperevo-20",
  },
  {
    id: "d-rings-pair",
    name: "D-Rings / Bow Shackles (pair, 3/4\")",
    category: "recovery",
    weightLbs: 3.0,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/s?k=3%2F4+inch+d+ring+shackle&tag=prepperevo-20",
  },
  {
    id: "tree-saver-strap",
    name: "Tree Saver Strap (3\" × 8')",
    category: "recovery",
    weightLbs: 3.5,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/s?k=tree+saver+strap+recovery&tag=prepperevo-20",
  },
  {
    id: "shovel-folding",
    name: "Folding Shovel / E-Tool",
    category: "recovery",
    weightLbs: 2.8,
    defaultZone: "bed-aft",
    affiliateUrl: "https://www.amazon.com/s?k=military+folding+shovel&tag=prepperevo-20",
  },
  {
    id: "air-compressor-arb",
    name: "Air Compressor — ARB CKMP12 Portable",
    category: "recovery",
    weightLbs: 18.0,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/dp/B00MVFQFQ0?tag=prepperevo-20",
  },
  {
    id: "air-compressor-viair",
    name: "Air Compressor — Viair 300P Portable",
    category: "recovery",
    weightLbs: 8.7,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/dp/B000HH6SU6?tag=prepperevo-20",
  },
  {
    id: "tire-repair-kit",
    name: "Tire Repair Kit (plugs, patch, spoons)",
    category: "recovery",
    weightLbs: 2.0,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/s?k=tire+repair+kit+off+road&tag=prepperevo-20",
  },
  {
    id: "recovery-gloves",
    name: "Recovery Gloves + Safety Kit",
    category: "recovery",
    weightLbs: 0.5,
    defaultZone: "cab",
  },

  // ══════════════════════════════════════════════════════════════════
  // TOOLS
  // ══════════════════════════════════════════════════════════════════

  {
    id: "tool-roll-basic",
    name: "Tool Roll — Basic (sockets, wrenches, pliers)",
    category: "tools",
    weightLbs: 8.0,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/s?k=tool+roll+set+mechanic&tag=prepperevo-20",
  },
  {
    id: "tool-roll-full",
    name: "Tool Roll — Full (metric + SAE + recovery extras)",
    category: "tools",
    weightLbs: 18.0,
    defaultZone: "bed-mid",
  },
  {
    id: "jumper-cables",
    name: "Jumper Cables — Heavy Duty (20' 4-gauge)",
    category: "tools",
    weightLbs: 5.5,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/s?k=heavy+duty+jumper+cables+20+feet&tag=prepperevo-20",
  },
  {
    id: "first-aid-kit-full",
    name: "First Aid Kit — Full Camp (Adventure Medical Mountain)",
    category: "tools",
    weightLbs: 4.0,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/dp/B001LBVFVW?tag=prepperevo-20",
  },
  {
    id: "fire-extinguisher",
    name: "Fire Extinguisher — 2.5 lb Dry Chemical",
    category: "tools",
    weightLbs: 4.0,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/dp/B00002N5G9?tag=prepperevo-20",
  },
  {
    id: "chainsaw-small",
    name: "Chainsaw — Small (Husqvarna 120 Mark II)",
    category: "tools",
    weightLbs: 10.7,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/s?k=husqvarna+120+chainsaw&tag=prepperevo-20",
  },
  {
    id: "axe-camp",
    name: "Camp Axe / Hatchet",
    category: "tools",
    weightLbs: 3.5,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/s?k=camp+axe+fiskars&tag=prepperevo-20",
  },
  {
    id: "folding-saw",
    name: "Folding Saw (Silky / Corona style)",
    category: "tools",
    weightLbs: 1.3,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/s?k=silky+folding+saw&tag=prepperevo-20",
  },
  {
    id: "headlamps-2pack",
    name: "Headlamps (2-pack, Black Diamond / Petzl)",
    category: "tools",
    weightLbs: 0.6,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/s?k=black+diamond+headlamp&tag=prepperevo-20",
  },
  {
    id: "lantern-camp",
    name: "Camp Lantern (battery / rechargeable)",
    category: "tools",
    weightLbs: 1.5,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/s?k=camping+lantern+rechargeable&tag=prepperevo-20",
  },

  // ══════════════════════════════════════════════════════════════════
  // FOOD
  // ══════════════════════════════════════════════════════════════════

  {
    id: "food-1day-solo",
    name: "Food Supply — 1 Day / 1 Person",
    category: "food",
    weightLbs: 4.0,
    defaultZone: "bed-mid",
    unit: "per person/day",
    notes: "Budget ~4 lbs/person/day for real camp food (not just freeze-dried).",
  },
  {
    id: "food-3day-family4",
    name: "Food Supply — 3 Days / Family of 4",
    category: "food",
    weightLbs: 50.0,
    defaultZone: "bed-mid",
    notes: "Full camp food: breakfast, lunch, dinner + snacks for 4 people × 3 days.",
  },
  {
    id: "food-freeze-dried-case",
    name: "Freeze-Dried Meals — Case of 6 (#10 cans)",
    category: "food",
    weightLbs: 24.0,
    defaultZone: "bed-mid",
    notes: "Mountain House #10 cans, 6 cans ≈ 24 lbs. ~75 servings total.",
    affiliateUrl: "https://www.amazon.com/s?k=mountain+house+10+can&tag=prepperevo-20",
  },
  {
    id: "food-mre-case",
    name: "MRE Case — 12 Meals",
    category: "food",
    weightLbs: 22.0,
    defaultZone: "bed-mid",
    affiliateUrl: "https://www.amazon.com/s?k=mre+meals+ready+to+eat&tag=prepperevo-20",
  },
  {
    id: "food-snacks-box",
    name: "Snack Box (protein bars, nuts, trail mix)",
    category: "food",
    weightLbs: 8.0,
    defaultZone: "cab",
  },

  // ══════════════════════════════════════════════════════════════════
  // CLOTHING & PERSONAL GEAR
  // ══════════════════════════════════════════════════════════════════

  {
    id: "duffle-bag-weekend",
    name: "Duffle Bag — Weekend (1 person, packed)",
    category: "clothing",
    weightLbs: 20.0,
    defaultZone: "cab",
    unit: "per person",
    notes: "Clothing, footwear, toiletries for a 3-day trip. Adjust to actual weight.",
  },
  {
    id: "duffle-bag-week",
    name: "Duffle Bag — Week+ (1 person, packed)",
    category: "clothing",
    weightLbs: 35.0,
    defaultZone: "bed-mid",
    unit: "per person",
  },
  {
    id: "boots-extra-pair",
    name: "Boots — Extra Pair (work/hiking)",
    category: "clothing",
    weightLbs: 4.0,
    defaultZone: "cab",
    unit: "per pair",
  },
  {
    id: "rain-gear",
    name: "Rain Gear Set (jacket + pants)",
    category: "clothing",
    weightLbs: 2.5,
    defaultZone: "cab",
    unit: "per person",
  },

  // ══════════════════════════════════════════════════════════════════
  // COMMS
  // ══════════════════════════════════════════════════════════════════

  {
    id: "gmrs-handheld-pair",
    name: "GMRS Handheld Radios (pair)",
    category: "comms",
    weightLbs: 1.5,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/s?k=midland+gmrs+radio&tag=prepperevo-20",
  },
  {
    id: "satellite-communicator",
    name: "Satellite Communicator (Garmin inReach Mini 2)",
    category: "comms",
    weightLbs: 0.4,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/dp/B09D3VQH4G?tag=prepperevo-20",
  },
  {
    id: "meshtastic-radio",
    name: "Meshtastic Radio (T-Beam / Heltec)",
    category: "comms",
    weightLbs: 0.3,
    defaultZone: "cab",
  },
  {
    id: "cb-radio-portable",
    name: "CB Radio — Handheld (Cobra / Midland)",
    category: "comms",
    weightLbs: 2.0,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/s?k=handheld+cb+radio&tag=prepperevo-20",
  },

  // ══════════════════════════════════════════════════════════════════
  // COMFORT — Camp furnishings
  // ══════════════════════════════════════════════════════════════════

  {
    id: "camp-chair-helinox",
    name: "Camp Chair — Ultralight (Helinox Chair One style)",
    category: "comfort",
    weightLbs: 2.1,
    defaultZone: "bed-aft",
    affiliateUrl: "https://www.amazon.com/dp/B00K4XHVCO?tag=prepperevo-20",
  },
  {
    id: "camp-chair-standard",
    name: "Camp Chair — Standard (Coleman / GCI style)",
    category: "comfort",
    weightLbs: 5.5,
    defaultZone: "bed-aft",
    affiliateUrl: "https://www.amazon.com/s?k=folding+camp+chair&tag=prepperevo-20",
  },
  {
    id: "camp-table-folding",
    name: "Camp Table — Folding Aluminum",
    category: "comfort",
    weightLbs: 9.0,
    defaultZone: "bed-aft",
    affiliateUrl: "https://www.amazon.com/s?k=folding+aluminum+camp+table&tag=prepperevo-20",
  },
  {
    id: "camp-table-front-runner",
    name: "Camp Table — Front Runner Pro Stainless",
    category: "comfort",
    weightLbs: 26.1,
    defaultZone: "roof",
    affiliateUrl: "https://www.amazon.com/s?k=front+runner+camp+table&tag=prepperevo-20",
  },

  // ══════════════════════════════════════════════════════════════════
  // PETS
  // ══════════════════════════════════════════════════════════════════

  {
    id: "dog-gear-small",
    name: "Dog Gear — Small Dog (under 40 lbs)",
    category: "pets",
    weightLbs: 8.0,
    defaultZone: "cab",
    notes: "Food, water bowl, bed, leash, poop bags, toys. Dog weight counted separately.",
  },
  {
    id: "dog-gear-large",
    name: "Dog Gear — Large Dog (40+ lbs)",
    category: "pets",
    weightLbs: 15.0,
    defaultZone: "bed-mid",
    notes: "Food for 3 days (large dog eats ~3 lbs/day), bed, bowls, kennel hardware.",
  },
  {
    id: "dog-weight-small",
    name: "Dog — Small (under 40 lbs)",
    category: "pets",
    weightLbs: 25.0,
    defaultZone: "cab",
    unit: "per dog",
    notes: "Use your dog's actual weight.",
  },
  {
    id: "dog-weight-large",
    name: "Dog — Large (40–100 lbs)",
    category: "pets",
    weightLbs: 65.0,
    defaultZone: "cab",
    unit: "per dog",
  },

  // ══════════════════════════════════════════════════════════════════
  // MISC
  // ══════════════════════════════════════════════════════════════════

  {
    id: "camera-bag-loaded",
    name: "Camera Bag — Loaded (mirrorless + 2 lenses)",
    category: "misc",
    weightLbs: 8.0,
    defaultZone: "cab",
    notes: "Body ~1.5 lbs, 2 lenses ~2 lbs each, bag ~1 lb, accessories ~1.5 lbs.",
  },
  {
    id: "kid-gear-day",
    name: "Kid Gear Bag (games, tablets, snacks)",
    category: "misc",
    weightLbs: 8.0,
    defaultZone: "cab",
    unit: "per child",
  },
  {
    id: "med-bag-vehicle",
    name: "Vehicle Med Bag (trauma kit, medications, extras)",
    category: "misc",
    weightLbs: 6.0,
    defaultZone: "cab",
    affiliateUrl: "https://www.amazon.com/s?k=trauma+kit+bag&tag=prepperevo-20",
  },
  {
    id: "books-maps-navigation",
    name: "Paper Maps + Navigation (Gaia print, gazetteer)",
    category: "misc",
    weightLbs: 2.0,
    defaultZone: "cab",
  },
  {
    id: "trash-bags-misc-supplies",
    name: "Trash Bags + Misc Camp Supplies",
    category: "misc",
    weightLbs: 3.0,
    defaultZone: "bed-mid",
  },
  {
    id: "firewood-bundle",
    name: "Firewood (purchased bundle, ~0.75 cu ft)",
    category: "misc",
    weightLbs: 25.0,
    defaultZone: "bed-aft",
    unit: "per bundle",
    notes: "Green wood is heavier. This is a typical kiln-dried retail bundle weight.",
  },
];

// ─── Helper functions ──────────────────────────────────────────────────

export function getAllGearItems(): LBGearItem[] {
  return gearDatabase;
}

export function getGearByCategory(cat: GearCategory): LBGearItem[] {
  return gearDatabase.filter((g) => g.category === cat);
}

export function getGearById(id: string): LBGearItem | undefined {
  return gearDatabase.find((g) => g.id === id);
}

export function searchGear(query: string): LBGearItem[] {
  const q = query.toLowerCase();
  return gearDatabase.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
  );
}

export function getGearCategories(): GearCategory[] {
  return [
    "people",
    "sleeping",
    "shelter",
    "cooking",
    "water",
    "power",
    "recovery",
    "tools",
    "food",
    "clothing",
    "comms",
    "comfort",
    "pets",
    "misc",
  ];
}

export const GEAR_CATEGORY_LABELS: Record<GearCategory, string> = {
  people: "People & Passengers",
  sleeping: "Sleeping",
  shelter: "Shelter",
  cooking: "Cooking & Food Prep",
  water: "Water",
  power: "Power",
  recovery: "Recovery",
  tools: "Tools & Safety",
  food: "Food & Provisions",
  clothing: "Clothing & Personal",
  comms: "Communications",
  comfort: "Camp Comfort",
  pets: "Pets",
  misc: "Misc",
};

export const ZONE_LABELS: Record<GearZone, string> = {
  "cab": "Cab Interior",
  "bed-fwd": "Bed — Forward",
  "bed-mid": "Bed — Center",
  "bed-aft": "Bed — Rear",
  "roof": "Roof / Rack",
  "tongue": "Hitch / Tongue",
};
