export interface GearItem {
  id: string;
  name: string;
  weightOz: number;
  category: string;
  essential: boolean;
  stackable?: boolean;
  maxQty?: number;
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
      { id: "camp-pillow", name: "Therm-a-Rest Compressible Pillow", weightOz: 9, category: "shelter", essential: false, affiliateUrl: A("B083BPBR2N"), affiliateNote: "$30 — Foam comfort" },
      { id: "s2s-pillow", name: "Sea to Summit Aeros Premium Pillow", weightOz: 3, category: "shelter", essential: false, affiliateUrl: A("B07P7J7BV8"), affiliateNote: "$55 — Ultralight inflatable" },
      { id: "hammock", name: "ENO DoubleNest Hammock", weightOz: 19, category: "shelter", essential: false, affiliateUrl: A("B07FXZKFPM"), affiliateNote: "$75 — Shelter alternative" },
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
      { id: "nalgene-32", name: "Nalgene Bottle (32oz)", weightOz: 6, category: "water", essential: true, stackable: true, maxQty: 3 },
      { id: "purification-tabs", name: "Aquamira Purification Tablets (pack)", weightOz: 1, category: "water", essential: false, stackable: true, maxQty: 5, affiliateUrl: A("B01AUWUAQ6"), affiliateNote: "Chemical backup — per pack" },
      { id: "osprey-reservoir", name: "Osprey Hydraulics LT 2.5L", weightOz: 6, category: "water", essential: false, affiliateUrl: A("B017ONQM5W"), affiliateNote: "$39 — Bite valve reservoir" },
      { id: "platypus-bigzip", name: "Platypus Big Zip EVO 3L", weightOz: 6, category: "water", essential: false, affiliateUrl: A("B07P75ZVK3"), affiliateNote: "$50 — Wide-mouth zip opening" },
      { id: "platypus-softbottle", name: "Platypus SoftBottle 1L (Collapsible)", weightOz: 1.5, category: "water", essential: false, affiliateUrl: A("B09LR4WBJP"), affiliateNote: "$14 — Rolls up when empty" },
      { id: "sillcock-key", name: "4-Way Sillcock Key (Water Key)", weightOz: 2, category: "water", essential: false, affiliateUrl: A("B071JNZ772"), affiliateNote: "$7 — Urban water access from commercial spigots" },
      { id: "katadyn-micropur", name: "Katadyn Micropur MP1 Tablets (30ct)", weightOz: 1, category: "water", essential: false, stackable: true, maxQty: 3, affiliateUrl: A("B0007U017U"), affiliateNote: "$15 — Chlorine dioxide purification" },
    ],
  },
  {
    id: "food",
    name: "Food & Cooking",
    color: "#22C55E",
    icon: "UtensilsCrossed",
    items: [
      { id: "mh-supply", name: "Mountain House Freeze-Dried Meal", weightOz: 5, category: "food", essential: false, stackable: true, maxQty: 10, affiliateUrl: A("B0BPVMJKV2"), affiliateNote: "25-year shelf life — per pouch" },
      { id: "mre", name: "MRE (full meal)", weightOz: 24, category: "food", essential: false, stackable: true, maxQty: 6 },
      { id: "freeze-dried", name: "Freeze-Dried Meal (generic)", weightOz: 5, category: "food", essential: false, stackable: true, maxQty: 10 },
      { id: "energy-bars", name: "Energy / Protein Bar", weightOz: 2, category: "food", essential: true, stackable: true, maxQty: 12 },
      { id: "electrolyte-packets", name: "Electrolyte Powder Packet (per packet)", weightOz: 0.5, category: "food", essential: false, stackable: true, maxQty: 10, affiliateUrl: A("B084HQ4DYQ"), affiliateNote: "LMNT — 1000mg sodium, zero sugar" },
      { id: "beef-jerky", name: "Beef Jerky Bag", weightOz: 7, category: "food", essential: false, stackable: true, maxQty: 6 },
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
      { id: "n95-masks", name: "3M Aura N95 Respirator (10-pack)", weightOz: 5, category: "firstaid", essential: false, affiliateUrl: A("B095FJ36H2"), affiliateNote: "$18 — Individually wrapped" },
      { id: "insect-repellent", name: "Sawyer Picaridin Insect Repellent", weightOz: 4, category: "firstaid", essential: false, affiliateUrl: A("B0D5QNN3XJ"), affiliateNote: "$10 — Tick + mosquito" },
      { id: "nitrile-gloves", name: "Nitrile Gloves (10ct)", weightOz: 3, category: "firstaid", essential: true, affiliateUrl: A("B00Q3D7SSA"), affiliateNote: "Disposable exam gloves" },
      { id: "wound-closure", name: "SkinStitch Wound Closure Adhesive", weightOz: 0.5, category: "firstaid", essential: false, affiliateUrl: A("B0CHN8QCL2"), affiliateNote: "Dermabond alternative — close cuts without sutures" },
      { id: "ors-packets", name: "DripDrop ORS Packets (8ct)", weightOz: 3, category: "firstaid", essential: false, affiliateUrl: A("B00PM0D77G"), affiliateNote: "Oral rehydration — 3x electrolytes of sports drinks" },
      { id: "caffeine-tabs", name: "Vivarin Caffeine Tablets (16ct)", weightOz: 1, category: "firstaid", essential: false, affiliateUrl: A("B008FNKKYA"), affiliateNote: "200mg caffeine per tab — stay alert" },
      { id: "sunscreen-stick", name: "Sun Bum SPF 30 Face Stick", weightOz: 1.5, category: "firstaid", essential: false, affiliateUrl: A("B007MV4BQY"), affiliateNote: "$10 — Travel-size, reef-safe" },
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
      { id: "resqme", name: "ResQMe Keychain Glass Breaker", weightOz: 1, category: "tools", essential: false, affiliateUrl: A("B000IE0EZO"), affiliateNote: "$12 — Seatbelt cutter + window breaker" },
      { id: "zip-ties", name: "Cable Ties / Zip Ties (assorted 20-pack)", weightOz: 2, category: "tools", essential: false, affiliateUrl: A("B0C2Z4L3S6"), affiliateNote: "Multi-size UV-resistant nylon" },
      { id: "pry-bar", name: "Stanley Wonder Bar II (7\")", weightOz: 8, category: "tools", essential: false, affiliateUrl: A("B079Y449SJ"), affiliateNote: "$10 — Compact pry / nail pull" },
      { id: "leatherman-bits", name: "Leatherman Bit Kit (21 bits)", weightOz: 3, category: "tools", essential: false, affiliateUrl: A("B003E1QPZG"), affiliateNote: "$25 — 42 driver sizes for Wave+" },
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    color: "#A855F7",
    icon: "Compass",
    items: [
      { id: "compass", name: "Suunto MC-2 Mirror Compass", weightOz: 3, category: "navigation", essential: true, affiliateUrl: A("B00IT6BFVK"), affiliateNote: "$70 — Sighting mirror + clinometer" },
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
      { id: "crank-radio", name: "Midland ER310 Crank Weather Radio", weightOz: 13, category: "communication", essential: false, affiliateUrl: A("B015QIC1PW"), affiliateNote: "$65 — Solar + hand crank + NOAA" },
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
      { id: "gloves", name: "Mechanix M-Pact Gloves", weightOz: 5, category: "clothing", essential: false, affiliateUrl: A("B005YSS0EQ"), affiliateNote: "$35 — Impact protection" },
      { id: "emergency-poncho", name: "Emergency Poncho (disposable)", weightOz: 3, category: "clothing", essential: false, affiliateUrl: A("B075PKK8MM"), affiliateNote: "Reusable .03mm PE — thicker than most" },
      { id: "ear-plugs", name: "Foam Ear Plugs (7 pair + case)", weightOz: 0.5, category: "clothing", essential: false, affiliateUrl: A("B0065IILSO"), affiliateNote: "Mack's Slim Fit — sleep, noise, shooting" },
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
      { id: "power-bank", name: "Anker 737 Power Bank (24,000mAh)", weightOz: 22, category: "misc", essential: false, affiliateUrl: A("B09VPHVT2Z"), affiliateNote: "$110 — 140W, 3-port" },
      { id: "power-bank-prime", name: "Anker Prime 27,650mAh (250W)", weightOz: 24, category: "misc", essential: false, affiliateUrl: A("B0BYP2F3SG"), affiliateNote: "$180 — TSA-approved" },
      { id: "pepper-spray", name: "SABRE Red Pepper Spray", weightOz: 2, category: "misc", essential: false, affiliateUrl: A("B09TY94YZH"), affiliateNote: "$12 — Max police strength" },
      { id: "surefire", name: "SureFire G2X Tactical Flashlight", weightOz: 4, category: "misc", essential: false, affiliateUrl: A("B00FDWOGZ0"), affiliateNote: "$83 — 600 lumens, bombproof" },
      { id: "streamlight", name: "Streamlight ProTac HL USB", weightOz: 5, category: "misc", essential: false, affiliateUrl: A("B00T8J9FGO"), affiliateNote: "$110 — 1000 lumens, rechargeable" },
      { id: "dry-sacks", name: "Sea to Summit Dry Sack Set (3pc)", weightOz: 4, category: "misc", essential: false, affiliateUrl: A("B0BZ5LF3KQ"), affiliateNote: "$30 — Keep gear dry" },
      { id: "trekking-poles", name: "Black Diamond Distance Carbon Z", weightOz: 18, category: "misc", essential: false, affiliateUrl: A("B078XMKSVX"), affiliateNote: "$190 — Carbon fiber, foldable" },
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
