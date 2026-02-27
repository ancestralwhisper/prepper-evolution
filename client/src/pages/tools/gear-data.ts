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

const TAG = "prepperevo-20";

export const gearCategories: GearCategory[] = [
  {
    id: "pack",
    name: "Pack / Bag",
    color: "#8B6F47",
    icon: "Backpack",
    items: [
      { id: "rush72", name: "5.11 Rush 72 2.0 (55L)", weightOz: 85, category: "pack", essential: true, affiliateUrl: `https://www.amazon.com/dp/B08R7Y9R7Y?tag=${TAG}`, affiliateNote: "$185 — Our top BOB pick" },
      { id: "mystery-ranch", name: "Mystery Ranch 3-Day Assault", weightOz: 72, category: "pack", essential: false },
      { id: "goruck-gr2", name: "GoRuck GR2 (40L)", weightOz: 68, category: "pack", essential: false },
    ],
  },
  {
    id: "shelter",
    name: "Shelter & Sleep",
    color: "#8B5E3C",
    icon: "Tent",
    items: [
      { id: "tent-2p", name: "2-Person Backpacking Tent", weightOz: 56, category: "shelter", essential: false },
      { id: "tarp", name: "Emergency Tarp (10x10)", weightOz: 24, category: "shelter", essential: false },
      { id: "sleeping-bag", name: "3-Season Sleeping Bag", weightOz: 40, category: "shelter", essential: false },
      { id: "sleeping-pad", name: "Inflatable Sleeping Pad", weightOz: 16, category: "shelter", essential: false },
      { id: "mylar-blanket", name: "Mylar Emergency Blanket (2x)", weightOz: 2, category: "shelter", essential: true },
    ],
  },
  {
    id: "water",
    name: "Water & Filtration",
    color: "#3B82F6",
    icon: "Droplets",
    items: [
      { id: "sawyer-squeeze", name: "Sawyer Squeeze Filter", weightOz: 3, category: "water", essential: true, affiliateUrl: `https://www.amazon.com/dp/B00B1OSU4W?tag=${TAG}`, affiliateNote: "$38 — Best value filter" },
      { id: "nalgene-32", name: "Nalgene Bottle (32oz)", weightOz: 6, category: "water", essential: true },
      { id: "purification-tabs", name: "Aquamira Purification Tablets", weightOz: 1, category: "water", essential: false },
      { id: "hydration-bladder", name: "Hydration Bladder (3L)", weightOz: 6, category: "water", essential: false },
    ],
  },
  {
    id: "food",
    name: "Food & Cooking",
    color: "#22C55E",
    icon: "UtensilsCrossed",
    items: [
      { id: "mre-1", name: "MRE (1 meal)", weightOz: 24, category: "food", essential: false },
      { id: "mre-2", name: "MRE (2nd meal)", weightOz: 24, category: "food", essential: false },
      { id: "freeze-dried-1", name: "Freeze-Dried Meal (1)", weightOz: 5, category: "food", essential: false },
      { id: "freeze-dried-2", name: "Freeze-Dried Meal (2)", weightOz: 5, category: "food", essential: false },
      { id: "energy-bars", name: "Energy Bars (6-pack)", weightOz: 12, category: "food", essential: true },
      { id: "cooking-kit", name: "Compact Stove + Pot Kit", weightOz: 16, category: "food", essential: false },
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
      { id: "ifak", name: "IFAK / First Aid Kit", weightOz: 16, category: "firstaid", essential: true },
      { id: "medications", name: "Personal Medications", weightOz: 4, category: "firstaid", essential: true },
      { id: "tourniquet", name: "CAT Tourniquet", weightOz: 3, category: "firstaid", essential: false },
      { id: "israeli-bandage", name: "Israeli Bandage", weightOz: 4, category: "firstaid", essential: false },
    ],
  },
  {
    id: "tools",
    name: "Tools & Cordage",
    color: "#6B7280",
    icon: "Wrench",
    items: [
      { id: "esee4", name: "ESEE-4 Fixed Blade Knife", weightOz: 12, category: "tools", essential: true, affiliateUrl: `https://www.amazon.com/dp/B004GHYK2K?tag=${TAG}`, affiliateNote: "$150 — Lifetime warranty" },
      { id: "multitool", name: "Leatherman Multi-Tool", weightOz: 9, category: "tools", essential: true },
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
      { id: "garmin-inreach", name: "Garmin inReach Mini 2", weightOz: 7, category: "navigation", essential: false, affiliateUrl: `https://www.amazon.com/dp/B09RMD3B9P?tag=${TAG}`, affiliateNote: "$400 — Satellite SOS + messaging" },
    ],
  },
  {
    id: "communication",
    name: "Communication",
    color: "#06B6D4",
    icon: "Radio",
    items: [
      { id: "baofeng", name: "Baofeng UV-5R Radio", weightOz: 10, category: "communication", essential: false, affiliateUrl: `https://www.amazon.com/dp/B007H4VT7A?tag=${TAG}`, affiliateNote: "$25 — License required" },
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
      { id: "headlamp", name: "Headlamp + Batteries", weightOz: 4, category: "misc", essential: true },
      { id: "trash-bags", name: "Heavy Duty Trash Bags (2x)", weightOz: 2, category: "misc", essential: false },
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
