/**
 * ============================================================================
 * MASTER ASIN REFERENCE — CANONICAL SOURCE OF TRUTH
 * ============================================================================
 *
 * This file is the single, authoritative source for every Amazon affiliate
 * product ASIN used across the Prepper Evolution ecosystem.
 *
 * ALL bots, scripts, content generators, and fix tools MUST import from here.
 * Do NOT hardcode ASINs anywhere else. If you find a conflicting ASIN in
 * another file, THIS file wins — update the other file to match.
 *
 * Consumers:
 *   - ContentForger (AI content generation)
 *   - Ranger Bot (Telegram social content)
 *   - fix-*.mjs scripts (WordPress link repair)
 *   - Bug Out Bag Calculator (client/src/data/gear-data.ts)
 *   - Product seed data (server/seed.ts)
 *   - Any future calculator or tool that links to Amazon
 *
 * To add a product:
 *   1. Add it to the correct category array below
 *   2. Run any downstream sync scripts as needed
 *
 * Affiliate tag: prepperevo-20
 * Amazon URL format: https://www.amazon.com/dp/{ASIN}?tag=prepperevo-20
 *
 * Last verified: 2026-02-28
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Affiliate tag
// ---------------------------------------------------------------------------

export const AFFILIATE_TAG = "prepperevo-20" as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductEntry {
  asin: string;
  name: string;
  category: string;
  url: string;
  notes?: string;
}

export type CategoryKey =
  | "water-filtration"
  | "knives"
  | "bug-out-bags"
  | "portable-power"
  | "rooftop-tents"
  | "12v-fridges"
  | "communication"
  | "camp-cooking"
  | "overlanding-gear"
  | "lighting"
  | "camping"
  | "emergency-medical";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a properly formatted Amazon affiliate URL for a given ASIN.
 */
export function getAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

/**
 * Fuzzy-match a product by name. Case-insensitive, matches if every word in
 * the query appears somewhere in the product name.
 *
 * Returns all matching ProductEntry objects sorted by relevance (fewest extra
 * words in the name first — i.e. tightest match).
 */
export function findProduct(query: string): ProductEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const matches: Array<{ entry: ProductEntry; nameWordCount: number }> = [];

  for (const entries of Object.values(MASTER_ASIN_MAP)) {
    for (const entry of entries) {
      const nameLower = entry.name.toLowerCase();
      const allMatch = words.every((w) => nameLower.includes(w));
      if (allMatch) {
        matches.push({
          entry,
          nameWordCount: entry.name.split(/\s+/).length,
        });
      }
    }
  }

  // Tightest matches first
  matches.sort((a, b) => a.nameWordCount - b.nameWordCount);

  return matches.map((m) => m.entry);
}

/**
 * Look up a single product by exact ASIN. Returns undefined if not found.
 */
export function findByAsin(asin: string): ProductEntry | undefined {
  for (const entries of Object.values(MASTER_ASIN_MAP)) {
    const found = entries.find((e) => e.asin === asin);
    if (found) return found;
  }
  return undefined;
}

/**
 * Return a flat array of every product across all categories.
 */
export function getAllProducts(): ProductEntry[] {
  return Object.values(MASTER_ASIN_MAP).flat();
}

// ---------------------------------------------------------------------------
// Internal factory — keeps the map DRY
// ---------------------------------------------------------------------------

function p(
  asin: string,
  name: string,
  category: string,
  notes?: string
): ProductEntry {
  return {
    asin,
    name,
    category,
    url: getAmazonUrl(asin),
    ...(notes ? { notes } : {}),
  };
}

// ---------------------------------------------------------------------------
// MASTER ASIN MAP
// ---------------------------------------------------------------------------

export const MASTER_ASIN_MAP: Record<CategoryKey, ProductEntry[]> = {
  // =========================================================================
  // WATER FILTRATION
  // =========================================================================
  "water-filtration": [
    p("B00B1OSU4W", "Sawyer Squeeze Water Filter", "Water Filtration"),
    p("B006QF3TW4", "LifeStraw Personal Water Filter", "Water Filtration"),
    p("B0CHXTXZ2S", "LifeStraw Peak Series", "Water Filtration"),
    p("B0BLNSYNW3", "Waterdrop King Tank", "Water Filtration"),
    p("B0F3FLHZK5", "Katadyn BeFree 1.0L", "Water Filtration"),
    p("B0D3HB3V5Z", "GRAYL GeoPress Water Purifier", "Water Filtration"),
    p("B0DB3RDN9H", "MSR Guardian Purifier", "Water Filtration"),
    p("B0DB3S6NNZ", "Platypus GravityWorks Water Filter", "Water Filtration"),
    p("B0DVH55V81", "Sawyer Mini Water Filter", "Water Filtration"),
    p(
      "B01AUWUAQ6",
      "Aquamira Water Treatment Drops",
      "Water Filtration",
      "Chemical treatment — not a filter"
    ),
  ],

  // =========================================================================
  // KNIVES
  // =========================================================================
  knives: [
    p("B06XKNF38D", "Benchmade Bugout 535", "Knives"),
    p("B0848RXQ1W", "ESEE 4 Fixed Blade", "Knives"),
    p("B0849WSSX6", "ESEE 5 Fixed Blade", "Knives"),
    p("B084BX2SD6", "ESEE 6 Fixed Blade", "Knives"),
    p("B004TNWD40", "Morakniv Companion HD", "Knives", "Heavy-duty carbon steel"),
    p("B07H5J1DYW", "Morakniv Companion HD Carbon Steel", "Knives"),
    p("B01M23QMPO", "Morakniv Kansbol", "Knives"),
    p("B00BFI8TOA", "Morakniv Bushcraft", "Knives"),
    p("B0015M06V0", "Gerber LMF II Infantry Knife", "Knives"),
    p("B07BK58NX2", "Leatherman Wave+", "Knives", "Multi-tool"),
  ],

  // =========================================================================
  // BUG OUT BAGS / BACKPACKS
  // =========================================================================
  "bug-out-bags": [
    p("B0D9R239MT", "5.11 RUSH72 2.0 Backpack", "Bug Out Bags", "Current model"),
    p("B0D9QZWBC1", "5.11 RUSH24 2.0 Backpack", "Bug Out Bags", "Current model"),
    p("B005AG3R0C", "5.11 RUSH72 Backpack", "Bug Out Bags", "Original model — may be discontinued"),
    p("B09H71PN7H", "MOLLE II Rucksack", "Bug Out Bags"),
    p("B0046QT4BA", "MOLLE II Rucksack Large ACU", "Bug Out Bags"),
    p("B0DTB48FW4", "Mystery Ranch 3-Day Assault Pack", "Bug Out Bags"),
    p("B0013AXY54", "Maxpedition Falcon-II Backpack", "Bug Out Bags"),
    p("B082P4D8LZ", "Kelty Redwing 50 Backpack", "Bug Out Bags"),
    p("B09JXQDZG5", "Osprey Atmos AG 65", "Bug Out Bags"),
    p("B09JXJBQKP", "Osprey Atmos AG 50", "Bug Out Bags"),
    p("B0FGXYSZBZ", "Osprey Farpoint 40 Travel Pack", "Bug Out Bags"),
    p("B0CNBCZGRZ", "The North Face Recon Backpack", "Bug Out Bags"),
    p("B0G2MY4814", "Vertx Gamut 22L EDC Backpack", "Bug Out Bags"),
    p("B0DDZPCXZD", "GORUCK Rucker 4.0 20L", "Bug Out Bags"),
    p("B0D8HCRCYR", "Helikon-Tex Raccoon Mk2 Backpack", "Bug Out Bags"),
    p("B0CV5RNFJK", "Patagonia Black Hole 55L Duffel", "Bug Out Bags"),
  ],

  // =========================================================================
  // PORTABLE POWER
  // =========================================================================
  "portable-power": [
    p("B0D7PPG25F", "Jackery Explorer 1000 V2", "Portable Power"),
    p("B0CLGZB3L6", "Bluetti AC200L Power Station", "Portable Power"),
    p("B096ST3VMS", "Goal Zero Yeti 1000 Core", "Portable Power"),
    p("B0C4DW17PD", "EcoFlow DELTA 2 Power Station", "Portable Power"),
    p("B0B5PSSCFY", "Renogy 200W Monocrystalline Solar Panel", "Portable Power"),
    p("B01EXWCPLC", "BigBlue 28W Solar Charger", "Portable Power"),
  ],

  // =========================================================================
  // ROOFTOP TENTS
  // =========================================================================
  "rooftop-tents": [
    p("B0CB6RX4RT", "iKamper Skycamp 3.0 Rooftop Tent", "Rooftop Tents"),
    p("B0F1MWF1GL", "Roofnest Galaxy Pro Rooftop Tent", "Rooftop Tents"),
    p("B0CJCWY2DN", "Roofnest Falcon 2 Rooftop Tent", "Rooftop Tents"),
    p("B001RDLGG6", "ARB Simpson III Rooftop Tent", "Rooftop Tents"),
    p("B08LD2F6W4", "Smittybilt Overlander Rooftop Tent", "Rooftop Tents"),
  ],

  // =========================================================================
  // 12V FRIDGES
  // =========================================================================
  "12v-fridges": [
    p("B083G3NBNZ", "Dometic CFX3 55IM Powered Cooler", "12V Fridges"),
    p("B085MM9B2D", "Dometic CFX3 35 Powered Cooler", "12V Fridges"),
    p("B07DVBJPGB", "ARB Classic Series II Fridge Freezer", "12V Fridges"),
    p("B07TXG7G1Y", "ICECO VL60 Portable Fridge Freezer", "12V Fridges"),
    p(
      "B0BPM7C8RT",
      "BougeRV Bodega T50 Portable Fridge",
      "12V Fridges",
      "Also listed as BougeRV / Bodega T50"
    ),
    p("B0DZHGD8B6", "SetPower Portable Fridge Freezer", "12V Fridges"),
    p("B075R1LH8D", "Alpicool Portable Fridge Freezer", "12V Fridges"),
  ],

  // =========================================================================
  // COMMUNICATION
  // =========================================================================
  communication: [
    p("B007H4VT7A", "Baofeng UV-5R Two-Way Radio", "Communication", "Original listing"),
    p("B0CPK8GYWG", "Baofeng UV-5R Two-Way Radio", "Communication", "Newer listing"),
    p("B09X49GPS1", "Garmin inReach Mini 2 Satellite Communicator", "Communication"),
    p(
      "B0G4RST8LV",
      "Garmin inReach Mini 3 Plus Satellite Communicator",
      "Communication",
      "Latest model"
    ),
    p("B001WMFYH4", "Midland GXT1000VP4 Two-Way Radio", "Communication"),
    p("B0D9CCFZBK", "Midland GXT3000 Two-Way Radio", "Communication"),
    p("B00000K2YR", "Midland 75-822 Portable CB Radio", "Communication"),
    p("B07X59RH7T", "Zoleo Satellite Communicator", "Communication"),
    p("B07DYC1PGR", "SPOT X Two-Way Satellite Messenger", "Communication"),
    p("B0794H67JP", "Cobra HH RT50 Handheld CB Radio", "Communication"),
    p("B07PFWL5Y1", "Dakota Alert MURS Wireless Motion Sensor", "Communication"),
  ],

  // =========================================================================
  // CAMP COOKING
  // =========================================================================
  "camp-cooking": [
    p("B0C31B18Y2", "BioLite CampStove 2+ Wood Burning Stove", "Camp Cooking"),
    p("B0006VORDY", "Camp Chef Explorer 2X Two-Burner Stove", "Camp Cooking"),
    p("B0CH7YYXZC", "Solo Stove Ranger 2.0 Fire Pit", "Camp Cooking"),
    p("B0DXQC9B14", "Jetboil Flash Cooking System", "Camp Cooking"),
  ],

  // =========================================================================
  // OVERLANDING GEAR
  // =========================================================================
  "overlanding-gear": [
    p("B00HYCVSW6", "MAXTRAX MKII Recovery Boards", "Overlanding Gear"),
    p("B07YTYVQ4J", "MAXTRAX Recovery Boards", "Overlanding Gear", "Alternate listing"),
    p("B07942QM39", "ActionTrax Recovery Boards", "Overlanding Gear"),
    p("B01MS1SKIW", "X-BULL Recovery Boards", "Overlanding Gear"),
    p("B07SJHVQTJ", "Warn VR EVO 10-S Winch", "Overlanding Gear"),
    p("B0050DI9YQ", "ARB Twin Motor Air Compressor", "Overlanding Gear"),
    p("B07MVF491C", "Front Runner Slimline II Roof Rack", "Overlanding Gear"),
    p("B07KCSPY71", "ARB TRED Pro Recovery Boards", "Overlanding Gear"),
    p("B073V6Q8DY", "Baja Designs Squadron Sport LED Light", "Overlanding Gear"),
  ],

  // =========================================================================
  // LIGHTING
  // =========================================================================
  lighting: [
    p("B0CH19THR5", "Goal Zero Skylight Lantern", "Lighting"),
    p("B0DJCGF8ZP", "DeVos LightRanger 4000", "Lighting"),
    p("B08Z6294Y5", "BioLite AlpenGlow 500 Lantern", "Lighting"),
    p("B08HRM4J8Y", "Goal Zero Lighthouse 600 Lantern", "Lighting"),
    p("B0GJT58T5C", "Black Diamond Moji R+ Lantern", "Lighting"),
    p("B01AW7Q1EO", "LE LED Camping Lantern", "Lighting"),
    p("B0DTM36WPB", "MPOWERD Luci Solar Light", "Lighting"),
    p("B08YC6H4F6", "LuminAID PackLite Max Solar Lantern", "Lighting"),
    p("B09WDKMYYL", "Coleman Classic Recharge 800 Lantern", "Lighting"),
  ],

  // =========================================================================
  // CAMPING
  // =========================================================================
  camping: [
    p("B0817CJLHN", "Big Agnes Copper Spur HV UL2 Tent", "Camping"),
    p("B0CS4NHPVP", "Therm-a-Rest NeoAir XTherm Sleeping Pad", "Camping"),
    p("B0B17FCP29", "Featherstone Moondance 25 Sleeping Bag", "Camping"),
    p("B0FHKTNR6T", "Petzl Actik Core Headlamp", "Camping"),
    p("B0DJPSBDYN", "GSI Pinnacle Camper Cookset", "Camping"),
    p("B0D3TJBWBQ", "Frogg Toggs Rain Jacket", "Camping"),
  ],

  // =========================================================================
  // EMERGENCY / MEDICAL
  // =========================================================================
  "emergency-medical": [
    p("B0BPVMJKV2", "Mountain House 14-Day Emergency Food Supply", "Emergency / Medical"),
    p("B0CZ7VVJZ6", "Mylar Bags 100-Pack for Food Storage", "Emergency / Medical"),
    p("B0DVZR1XHP", "CAT Tourniquet Gen 7", "Emergency / Medical"),
    p("B0FYF2S1HM", "IFAK Trauma Kit", "Emergency / Medical"),
    p("B08KWQVBT7", "SOL Emergency Bivvy", "Emergency / Medical"),
    p(
      "B09WDKMYYL",
      "Coleman North Rim Sleeping Bag",
      "Emergency / Medical",
      "Same ASIN as Coleman Classic Recharge 800 Lantern in lighting — verify listing"
    ),
  ],
};

// ---------------------------------------------------------------------------
// Quick stats (useful for audits)
// ---------------------------------------------------------------------------

/** Total number of product entries in the map. */
export const TOTAL_PRODUCTS = Object.values(MASTER_ASIN_MAP).reduce(
  (sum, arr) => sum + arr.length,
  0
);

/** Total number of unique ASINs (some products share ASINs across categories). */
export const UNIQUE_ASINS = new Set(
  Object.values(MASTER_ASIN_MAP)
    .flat()
    .map((e) => e.asin)
).size;
