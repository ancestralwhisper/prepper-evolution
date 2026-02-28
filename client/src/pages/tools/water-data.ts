// ─── Amazon Affiliate Helper ───
const A = (asin: string) => `https://www.amazon.com/dp/${asin}?tag=prepperevo-20`;

// ─── FEMA Base Usage (gallons per person per day) ───
export const BASE_GALLONS_PER_PERSON_PER_DAY = 1;

export interface UsageBreakdown {
  id: string;
  label: string;
  gallons: number;
  color: string;
  note: string;
}

export const usageBreakdown: UsageBreakdown[] = [
  { id: "drinking", label: "Drinking", gallons: 0.5, color: "#06B6D4", note: "Minimum hydration — half a gallon per person" },
  { id: "cooking", label: "Cooking", gallons: 0.25, color: "#22C55E", note: "Meal prep, rehydrating freeze-dried food" },
  { id: "hygiene", label: "Hygiene", gallons: 0.25, color: "#A855F7", note: "Handwashing, brushing teeth, basic sanitation" },
];

// ─── Climate Zones ───
export interface ClimateZone {
  id: string;
  name: string;
  multiplier: number;
  note: string;
}

export const climateZones: ClimateZone[] = [
  { id: "temperate", name: "Temperate", multiplier: 1.0, note: "Moderate temps (50-80F) — baseline FEMA recommendation" },
  { id: "cold", name: "Cold", multiplier: 1.25, note: "Winter / cold climates — extra water for layered-clothing hydration and preventing dehydration" },
  { id: "hot-humid", name: "Hot / Humid", multiplier: 1.5, note: "High heat and humidity — increased sweating and risk of heat illness" },
  { id: "hot-arid", name: "Hot / Arid", multiplier: 2.0, note: "Desert or dry heat — FEMA recommends doubling water in extreme heat" },
];

// ─── Activity Levels ───
export interface ActivityLevel {
  id: string;
  name: string;
  multiplier: number;
  note: string;
}

export const activityLevels: ActivityLevel[] = [
  { id: "sedentary", name: "Sedentary", multiplier: 1.0, note: "Sheltering in place, minimal physical exertion" },
  { id: "moderate", name: "Moderate", multiplier: 1.25, note: "Light tasks, walking, campsite maintenance" },
  { id: "heavy", name: "Heavy / Labor", multiplier: 1.75, note: "Bug out on foot, construction, firewood splitting — significantly increased need" },
];

// ─── Special Needs ───
export const NURSING_MOTHER_EXTRA_GAL = 0.25; // +1 quart per day
export const CHILD_UNDER_5_MULTIPLIER = 0.5; // 50% of adult need
export const PET_DOG_GAL_PER_DAY = 0.5;
export const PET_CAT_GAL_PER_DAY = 0.25;

// ─── Container Recommendations ───
export interface Container {
  id: string;
  name: string;
  gallons: number;
  affiliateUrl: string;
  type: "storage" | "filtration" | "treatment";
  note: string;
  portable: boolean;
}

export const containers: Container[] = [
  {
    id: "55-gal-drum",
    name: "55 Gallon Water Drum",
    gallons: 55,
    affiliateUrl: A("B06Y2H5GVX"),
    type: "storage",
    note: "Best bulk storage — needs hand pump and space. Rotate every 6-12 months.",
    portable: false,
  },
  {
    id: "waterbob",
    name: "WaterBOB Bathtub Bladder (100 gal)",
    gallons: 100,
    affiliateUrl: A("B001AXLUX2"),
    type: "storage",
    note: "Fill your bathtub before a storm — keeps 100 gallons clean and accessible. Single-use.",
    portable: false,
  },
  {
    id: "aqua-tainer",
    name: "Reliance Aqua-Tainer (7 gal)",
    gallons: 7,
    affiliateUrl: A("B001QC31G6"),
    type: "storage",
    note: "Stackable, BPA-free. Great for rotation and transport. Built-in spigot.",
    portable: true,
  },
  {
    id: "hydroblu-jerry",
    name: "HydroBlu Pressurized Jerry Can (5 gal)",
    gallons: 5,
    affiliateUrl: A("B06XKWH4CW"),
    type: "storage",
    note: "Pressurized spout for easy pouring. Military-style design, great for overlanding.",
    portable: true,
  },
  {
    id: "waterbrick",
    name: "WaterBrick Stackable (3.5 gal)",
    gallons: 3.5,
    affiliateUrl: A("B0053GVRWQ"),
    type: "storage",
    note: "Ultra-stackable, space-efficient. Can also store dry goods. Premium option.",
    portable: true,
  },
  {
    id: "aqua-pak",
    name: "Reliance Aqua-Pak (2.5 gal)",
    gallons: 2.5,
    affiliateUrl: A("B0002IW6JS"),
    type: "storage",
    note: "Compact and lightweight — ideal for bug out bags and vehicle kits.",
    portable: true,
  },
  {
    id: "sawyer-squeeze",
    name: "Sawyer Squeeze Water Filter",
    gallons: 0,
    affiliateUrl: A("B00B1OSU4W"),
    type: "filtration",
    note: "Filters 100,000 gallons. Removes 99.99999% of bacteria and 99.9999% of protozoa. Essential backup.",
    portable: true,
  },
  {
    id: "aquamira-drops",
    name: "Aquamira Water Treatment Drops",
    gallons: 0,
    affiliateUrl: A("B000OR114S"),
    type: "treatment",
    note: "Chemical purification — treats 30 gallons per kit. Kills viruses that filters miss. 5-year shelf life.",
    portable: true,
  },
  {
    id: "lifestraw-personal",
    name: "Lifestraw Personal Filter",
    gallons: 0,
    affiliateUrl: A("B006QF3TW4"),
    type: "filtration",
    note: "Ultra-portable backup filter. Filters 1,000 gal.",
    portable: true,
  },
  {
    id: "katadyn-befree",
    name: "Katadyn BeFree 1L",
    gallons: 0,
    affiliateUrl: A("B0BFQMMJVS"),
    type: "filtration",
    note: "Fast flow — 2L/min. 1L soft flask.",
    portable: true,
  },
  {
    id: "grayl-geopress",
    name: "GRAYL GeoPress Purifier",
    gallons: 0,
    affiliateUrl: A("B0D3HB3V5Z"),
    type: "filtration",
    note: "Removes viruses, no pumping. 24oz bottle.",
    portable: true,
  },
  {
    id: "msr-guardian",
    name: "MSR Guardian Purifier",
    gallons: 0,
    affiliateUrl: A("B0DB3RDN9H"),
    type: "filtration",
    note: "Military-grade, self-cleaning. Pump filter.",
    portable: true,
  },
  {
    id: "potable-aqua-iodine",
    name: "Potable Aqua Iodine Tablets",
    gallons: 0,
    affiliateUrl: A("B001949TKS"),
    type: "treatment",
    note: "EPA-registered, 25 quarts. 50 tablets.",
    portable: true,
  },
  {
    id: "scepter-military-can",
    name: "Scepter Military Water Can (5 gal)",
    gallons: 5,
    affiliateUrl: A("B001IV8IYA"),
    type: "storage",
    note: "NATO-spec, heavy duty.",
    portable: true,
  },
  {
    id: "platypus-gravityworks",
    name: "Platypus GravityWorks 4L",
    gallons: 0,
    affiliateUrl: A("B00A9A2HKM"),
    type: "filtration",
    note: "Base camp filter, no pumping. 4L gravity filter.",
    portable: true,
  },
  {
    id: "steripen-ultra",
    name: "SteriPEN Ultra UV Purifier",
    gallons: 0,
    affiliateUrl: A("B00NK9948M"),
    type: "treatment",
    note: "USB-rechargeable, kills 99.9%. UV wand.",
    portable: true,
  },
  {
    id: "coleman-5gal-jug",
    name: "Coleman 5-Gallon Jug",
    gallons: 5,
    affiliateUrl: A("B01M63EXYM"),
    type: "storage",
    note: "Budget camp water storage.",
    portable: true,
  },
  {
    id: "berkey-sport-bottle",
    name: "Berkey Sport Bottle",
    gallons: 0,
    affiliateUrl: A("B0B37L9CBG"),
    type: "filtration",
    note: "Filters tap & untreated water. 22oz filter bottle.",
    portable: true,
  },
];

export const storageContainers = containers.filter((c) => c.type === "storage");
export const filtrationProducts = containers.filter((c) => c.type === "filtration" || c.type === "treatment");

// ─── Storage Tips ───
export const storageTips = [
  "Rotate stored water every 6 months if using tap water — commercially bottled water lasts 1-2 years unopened.",
  "Store water in a cool, dark place away from chemicals and direct sunlight to prevent algae growth.",
  "Treat tap water with 8 drops of unscented liquid chlorine bleach per gallon before long-term storage.",
  "Never use milk jugs for water storage — they degrade and harbor bacteria. Use food-grade containers only.",
  "Keep at least 3 days of water per person accessible at all times — do not lock it all in one location.",
  "Fill your WaterBOB or bathtub when a storm warning is issued — tap water may become contaminated or unavailable.",
  "Label every container with the fill date so you know when to rotate.",
  "A water filter handles bacteria and protozoa, but you need purification drops or boiling to kill viruses.",
];

// ─── Data Sources ───
export const dataSources = [
  { name: "FEMA / Ready.gov", url: "https://www.ready.gov/water", note: "1 gallon per person per day minimum recommendation" },
  { name: "CDC Emergency Water", url: "https://www.cdc.gov/healthywater/emergency/creating-storing-emergency-water-supply.html", note: "Water storage, treatment, and purification guidelines" },
  { name: "Wilderness Medical Society", url: "https://wms.org", note: "Hydration requirements under exertion and extreme conditions" },
  { name: "EPA", note: "Water treatment and disinfection standards" },
];
