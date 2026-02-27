export interface GearItem {
  id: string;
  name: string;
  weightOz: number;
  category: string;
  essential: boolean;
  affiliateUrl?: string;
  affiliateNote?: string;
}

export interface GearCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  items: GearItem[];
}

const A = (asin: string) => `https://www.amazon.com/dp/${asin}?tag=prepperevo-20`;

export const gearCategories: GearCategory[] = [
  {
    id: "pack",
    name: "Pack / Bag",
    color: "#8B6F47",
    icon: "Backpack",
    items: [
      { id: "rush72", name: "5.11 Rush 72 2.0 (55L)", weightOz: 85, category: "pack", essential: true, affiliateUrl: A("B0D9R239MT"), affiliateNote: "$185 — Our top BOB pick" },
      { id: "mystery-ranch", name: "Mystery Ranch 2 Day (27L)", weightOz: 72, category: "pack", essential: false, affiliateUrl: A("B0DTB48FW4"), affiliateNote: "$249" },
      { id: "goruck-rucker", name: "GORUCK Rucker 4.0 (20L)", weightOz: 68, category: "pack", essential: false, affiliateUrl: A("B0DDZPCXZD"), affiliateNote: "$255" },
      { id: "molle-ii", name: "Akmax MOLLE II Medium Ruck", weightOz: 96, category: "pack", essential: false, affiliateUrl: A("B09H71PN7H"), affiliateNote: "Budget military surplus" },
      { id: "helikon-raccoon", name: "Helikon-Tex Raccoon Mk2 (20L)", weightOz: 38, category: "pack", essential: false, affiliateUrl: A("B0D8HCRCYR"), affiliateNote: "$86 — Budget lightweight" },
      { id: "osprey-atmos", name: "Osprey Atmos AG 65", weightOz: 73, category: "pack", essential: false, affiliateUrl: A("B09JXQDZG5"), affiliateNote: "$350 — Best comfort" },
      { id: "kelty-redwing", name: "Kelty Redwing 50", weightOz: 56, category: "pack", essential: false, affiliateUrl: A("B0DT2FZGYV"), affiliateNote: "$200" },
      { id: "maxpedition-falcon", name: "Maxpedition Falcon-II", weightOz: 64, category: "pack", essential: false, affiliateUrl: A("B0013AXY54"), affiliateNote: "$167" },
      { id: "vertx-gamut", name: "Vertx Gamut 22L Sling", weightOz: 44, category: "pack", essential: false, affiliateUrl: A("B0G2MY4814"), affiliateNote: "$230 — Gray man EDC" },
    ],
  },
  {
    id: "shelter",
    name: "Shelter & Sleep",
    color: "#8B5E3C",
    icon: "Tent",
    items: [
      { id: "tent-2p", name: "Big Agnes Copper Spur UL2 (2025)", weightOz: 40, category: "shelter", essential: false, affiliateUrl: A("B0DHF4JHQD"), affiliateNote: "Ultralight 2P tent — HyperBead fabric" },
      { id: "tarp", name: "Emergency Tarp (10x10)", weightOz: 24, category: "shelter", essential: false },
      { id: "sol-bivvy", name: "SOL Emergency Bivvy", weightOz: 4, category: "shelter", essential: false, affiliateUrl: A("B08KWQVBT7"), affiliateNote: "Reusable emergency shelter" },
      { id: "sleeping-bag", name: "Featherstone Moondance 25", weightOz: 40, category: "shelter", essential: false, affiliateUrl: A("B0B17FCP29"), affiliateNote: "850-fill down bag" },
      { id: "sleeping-pad", name: "Therm-a-Rest NeoAir XLite NXT", weightOz: 13, category: "shelter", essential: false, affiliateUrl: A("B0CS4NHPVP"), affiliateNote: "Ultralight inflatable pad" },
      { id: "mylar-blanket", name: "Mylar Emergency Blanket (2x)", weightOz: 2, category: "shelter", essential: true },
    ],
  },
  {
    id: "water",
    name: "Water & Filtration",
    color: "#3B82F6",
    icon: "Droplets",
    items: [
      { id: "sawyer-squeeze", name: "Sawyer Squeeze Filter", weightOz: 3, category: "water", essential: true, affiliateUrl: A("B00B1OSU4W"), affiliateNote: "$38 — Best value filter" },
      { id: "lifestraw", name: "LifeStraw Peak Series Straw", weightOz: 2, category: "water", essential: false, affiliateUrl: A("B0CFYHBWP4"), affiliateNote: "$20 — Redesigned 2025" },
      { id: "lifestraw-peak", name: "LifeStraw Peak Solo", weightOz: 2, category: "water", essential: false, affiliateUrl: A("B0CHXTXZ2S"), affiliateNote: "$34 — Next-gen filter" },
      { id: "katadyn-befree", name: "Katadyn BeFree Ultralight", weightOz: 2, category: "water", essential: false, affiliateUrl: A("B0BFQMMJVS"), affiliateNote: "Fast flow ultralight" },
      { id: "grayl-geopress", name: "GRAYL GeoPress Purifier", weightOz: 16, category: "water", essential: false, affiliateUrl: A("B0D3HB3V5Z"), affiliateNote: "$100 — Removes viruses" },
      { id: "nalgene-32", name: "Nalgene Bottle (32oz)", weightOz: 6, category: "water", essential: true },
      { id: "purification-tabs", name: "Aquamira Purification Tablets", weightOz: 1, category: "water", essential: false, affiliateUrl: A("B01AUWUAQ6"), affiliateNote: "Chemical backup" },
      { id: "hydration-bladder", name: "Hydration Bladder (3L)", weightOz: 6, category: "water", essential: false },
    ],
  },
  {
    id: "food",
    name: "Food & Cooking",
    color: "#22C55E",
    icon: "UtensilsCrossed",
    items: [
      { id: "mh-supply", name: "Mountain House Freeze-Dried Meals", weightOz: 5, category: "food", essential: false, affiliateUrl: A("B0BPVMJKV2"), affiliateNote: "25-year shelf life" },
      { id: "mre-1", name: "MRE (1 meal)", weightOz: 24, category: "food", essential: false },
      { id: "mre-2", name: "MRE (2nd meal)", weightOz: 24, category: "food", essential: false },
      { id: "freeze-dried-1", name: "Freeze-Dried Meal (1)", weightOz: 5, category: "food", essential: false },
      { id: "freeze-dried-2", name: "Freeze-Dried Meal (2)", weightOz: 5, category: "food", essential: false },
      { id: "energy-bars", name: "Energy Bars (6-pack)", weightOz: 12, category: "food", essential: true },
      { id: "jetboil", name: "Jetboil Flash Cooking System", weightOz: 13, category: "food", essential: false, affiliateUrl: A("B0DXQC9B14"), affiliateNote: "Boils water in 100 sec" },
      { id: "cooking-kit", name: "GSI Pinnacle Camper Cookset", weightOz: 32, category: "food", essential: false, affiliateUrl: A("B0DJPSBDYN"), affiliateNote: "Full camp kitchen" },
      { id: "biolite-stove", name: "BioLite CampStove 2+", weightOz: 33, category: "food", essential: false, affiliateUrl: A("B08S46HLM1"), affiliateNote: "Burns wood + charges USB" },
    ],
  },
  {
    id: "fire",
    name: "Fire Starting",
    color: "#EF4444",
    icon: "Flame",
    items: [
      { id: "ferro-rod", name: "Ferro Rod + Striker", weightOz: 2, category: "fire", essential: true },
      { id: "bic-lighter", name: "BIC Lighters (2x)", weightOz: 1, category: "fire", essential: true },
      { id: "storm-matches", name: "Stormproof Matches", weightOz: 2, category: "fire", essential: false },
      { id: "fire-tinder", name: "Commercial Fire Tinder", weightOz: 1, category: "fire", essential: false },
    ],
  },
  {
    id: "firstaid",
    name: "First Aid & Medical",
    color: "#F97316",
    icon: "Heart",
    items: [
      { id: "ifak", name: "IFAK Trauma Kit", weightOz: 16, category: "firstaid", essential: true, affiliateUrl: A("B0FYF2S1HM"), affiliateNote: "Complete trauma kit" },
      { id: "medications", name: "Personal Medications", weightOz: 4, category: "firstaid", essential: true },
      { id: "tourniquet", name: "CAT Tourniquet Gen 7", weightOz: 3, category: "firstaid", essential: false, affiliateUrl: A("B0DVZR1XHP"), affiliateNote: "Buy genuine — beware counterfeits" },
      { id: "israeli-bandage", name: "Israeli Bandage", weightOz: 4, category: "firstaid", essential: false },
    ],
  },
  {
    id: "tools",
    name: "Tools & Cordage",
    color: "#6B7280",
    icon: "Wrench",
    items: [
      { id: "esee4", name: "ESEE-4 Fixed Blade Knife", weightOz: 12, category: "tools", essential: true, affiliateUrl: A("B0848RXQ1W"), affiliateNote: "$127 — Lifetime no-questions warranty" },
      { id: "morakniv", name: "Morakniv Companion", weightOz: 4, category: "tools", essential: false, affiliateUrl: A("B004TNWD40"), affiliateNote: "$16 — Budget workhorse" },
      { id: "morakniv-bushcraft", name: "Morakniv Bushcraft Survival", weightOz: 5, category: "tools", essential: false, affiliateUrl: A("B00BFI8TOA"), affiliateNote: "$59 — Includes fire starter" },
      { id: "benchmade-bugout", name: "Benchmade Bugout 535", weightOz: 2, category: "tools", essential: false, affiliateUrl: A("B07452LTBD"), affiliateNote: "1.85oz EDC folder" },
      { id: "multitool", name: "Leatherman Wave+", weightOz: 9, category: "tools", essential: true, affiliateUrl: A("B07BK58NX2"), affiliateNote: "Best multi-tool" },
      { id: "folding-saw", name: "Folding Saw", weightOz: 8, category: "tools", essential: false },
      { id: "paracord", name: "Paracord (100ft)", weightOz: 7, category: "tools", essential: true },
      { id: "duct-tape", name: "Duct Tape (mini roll)", weightOz: 3, category: "tools", essential: false },
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    color: "#A855F7",
    icon: "Compass",
    items: [
      { id: "compass", name: "Baseplate Compass", weightOz: 2, category: "navigation", essential: true },
      { id: "topo-maps", name: "Local Topo Maps (printed)", weightOz: 3, category: "navigation", essential: true },
      { id: "garmin-inreach", name: "Garmin inReach Mini 3 Plus", weightOz: 4, category: "navigation", essential: false, affiliateUrl: A("B0G4RST8LV"), affiliateNote: "$450 — Color touchscreen + SOS" },
    ],
  },
  {
    id: "communication",
    name: "Communication",
    color: "#06B6D4",
    icon: "Radio",
    items: [
      { id: "baofeng", name: "Baofeng BF-F8HP PRO (10W)", weightOz: 10, category: "communication", essential: false, affiliateUrl: A("B0DHSS2NNF"), affiliateNote: "$45 — Tri-band, GPS, NOAA, USB-C" },
      { id: "midland-gxt", name: "Midland GXT1000 GMRS Radio", weightOz: 12, category: "communication", essential: false, affiliateUrl: A("B001WMFYH4"), affiliateNote: "$73 — 36-mile range" },
      { id: "midland-cb", name: "Midland 75-822 CB Radio", weightOz: 14, category: "communication", essential: false, affiliateUrl: A("B00000K2YR"), affiliateNote: "$100 — No license needed" },
      { id: "zoleo", name: "Zoleo Satellite Messenger", weightOz: 5, category: "communication", essential: false, affiliateUrl: A("B07X59RH7T"), affiliateNote: "$149 — Budget satellite" },
      { id: "whistle", name: "Emergency Whistle", weightOz: 1, category: "communication", essential: true },
      { id: "signal-mirror", name: "Signal Mirror", weightOz: 2, category: "communication", essential: false },
    ],
  },
  {
    id: "clothing",
    name: "Clothing",
    color: "#EC4899",
    icon: "Shirt",
    items: [
      { id: "wool-socks", name: "Wool Socks (2 pair)", weightOz: 6, category: "clothing", essential: true },
      { id: "rain-jacket", name: "Rain Jacket", weightOz: 12, category: "clothing", essential: true },
      { id: "base-layer", name: "Base Layer Top", weightOz: 8, category: "clothing", essential: false },
      { id: "shemagh", name: "Shemagh / Bandana", weightOz: 4, category: "clothing", essential: false },
    ],
  },
  {
    id: "misc",
    name: "Documents & Misc",
    color: "#EAB308",
    icon: "FileText",
    items: [
      { id: "document-kit", name: "Document Kit (IDs, cash)", weightOz: 4, category: "misc", essential: true },
      { id: "usb-drive", name: "USB Drive (docs backup)", weightOz: 1, category: "misc", essential: false },
      { id: "headlamp", name: "Petzl Actik Core Headlamp", weightOz: 3, category: "misc", essential: true, affiliateUrl: A("B0FHKTNR6T"), affiliateNote: "Rechargeable, 600 lumens" },
      { id: "solar-panel", name: "BigBlue 28W Solar Charger", weightOz: 21, category: "misc", essential: false, affiliateUrl: A("B01EXWCPLC"), affiliateNote: "Keep devices charged" },
      { id: "trash-bags", name: "Heavy Duty Trash Bags (2x)", weightOz: 2, category: "misc", essential: false },
      { id: "mylar-bags", name: "Mylar Bags + O2 Absorbers", weightOz: 8, category: "misc", essential: false, affiliateUrl: A("B0CZ7VVJZ6"), affiliateNote: "Long-term food storage" },
    ],
  },
];

export const allGearItems = gearCategories.flatMap((c) => c.items);

export const essentialItems = allGearItems.filter((i) => i.essential);

export const BODY_WEIGHT_MIN = 90;
export const BODY_WEIGHT_MAX = 350;
export const BODY_WEIGHT_DEFAULT = 180;
export const WARNING_PERCENT = 25;
export const CRITICAL_PERCENT = 33;

export const dataSources = [
  { name: "FEMA Ready.gov", url: "https://www.ready.gov/kit", note: "72-hour emergency kit guidelines" },
  { name: "US Army FM 21-18", note: "Soldier load recommendations (max 30% body weight for marching)" },
  { name: "Wilderness Medical Society", note: "Pack weight guidelines for injury prevention" },
  { name: "Sawyer Products", url: "https://www.sawyer.com", note: "Filter specifications and testing data" },
];
