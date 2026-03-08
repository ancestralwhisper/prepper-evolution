// ─── RigSafe Fridge / Fridge-Freezer Database ────────────────────────────────
// Real manufacturer specs for 12V portable fridges and fridge-freezers.
// For trucks and SUVs — NOT UTVs.
//
// Sources:
//   Weight, capacity, amp draw: Manufacturer spec sheets, Amazon listings,
//     OutdoorGearLab, OvelandExpo reviews, and retailer tech specs
//   Capacity converted from liters: 1L ≈ 1.057 qt (rounded to nearest whole qt)
//   Amp draw: rated DC draw at 12V; compressor cycling average where noted
//
// NOTE: Dometic CFX3 lineup: 35, 45, 55, 75DZ (being phased out).
//   Dometic CFX5 lineup: 25, 35, 45, 55IM, 75DZ, 95DZ (current generation).
//   Both series included — many users already own CFX3 units.

export interface FridgeEntry {
  id: string;
  brand: string;
  model: string;
  type: "fridge" | "fridge-freezer" | "freezer";
  weightLbs: number;
  capacityQts: number;
  drawAmps: number;
  affiliateUrl: string;
  notes?: string;
}

export const fridgeDatabase: FridgeEntry[] = [
  // ─── DOMETIC CFX3 ────────────────────────────────────────────────────────

  {
    id: "dometic-cfx3-35",
    brand: "Dometic",
    model: "CFX3 35",
    type: "fridge-freezer",
    weightLbs: 37,
    capacityQts: 38,    // 36L
    drawAmps: 7.5,      // rated 12V DC draw
    affiliateUrl: "https://www.amazon.com/dp/B085MM9B2D?tag=prepperevo-20",
    notes: "36L / 50-can capacity. Best-selling compact Dometic. Fits behind most rear seats.",
  },
  {
    id: "dometic-cfx3-45",
    brand: "Dometic",
    model: "CFX3 45",
    type: "fridge-freezer",
    weightLbs: 41,
    capacityQts: 49,    // 46L
    drawAmps: 8.2,      // rated DC input current per Dometic spec
    affiliateUrl: "https://www.amazon.com/dp/B0F9LFBJHF?tag=prepperevo-20",
    notes: "46L / 67-can capacity. Most popular mid-size Dometic for overland builds.",
  },
  {
    id: "dometic-cfx3-55",
    brand: "Dometic",
    model: "CFX3 55",
    type: "fridge-freezer",
    weightLbs: 47,
    capacityQts: 56,    // 53L
    drawAmps: 8.9,
    affiliateUrl: "https://www.amazon.com/dp/B0DDYWJ7WS?tag=prepperevo-20",
    notes: "53L / 83-can capacity. Strong choice for extended trips with a full crew.",
  },
  {
    id: "dometic-cfx3-75dz",
    brand: "Dometic",
    model: "CFX3 75DZ",
    type: "fridge-freezer",
    weightLbs: 61,
    capacityQts: 79,    // 75L dual zone
    drawAmps: 9.6,      // rated DC draw, dual zone running
    affiliateUrl: "https://www.amazon.com/dp/B0CHXMT21Z?tag=prepperevo-20",
    notes: "75L dual-zone — independent fridge and freezer compartments. WiFi/BT app control.",
  },

  // ─── DOMETIC CFX5 ────────────────────────────────────────────────────────

  {
    id: "dometic-cfx5-25",
    brand: "Dometic",
    model: "CFX5 25",
    type: "fridge-freezer",
    weightLbs: 30,
    capacityQts: 26,    // 25L
    drawAmps: 9.2,      // rated 12V DC input current per Dometic spec
    affiliateUrl: "#",
    notes: "25L / 33-can capacity. Most compact CFX5. VIP insulation, USB QC 3.0, Bluetooth app control.",
  },
  {
    id: "dometic-cfx5-35",
    brand: "Dometic",
    model: "CFX5 35",
    type: "fridge-freezer",
    weightLbs: 37,
    capacityQts: 37,    // 35L
    drawAmps: 7.6,      // rated 12V DC input current per Dometic spec
    affiliateUrl: "https://www.amazon.com/dp/B0DVM1G8VM?tag=prepperevo-20",
    notes: "35L / 50-can capacity. Vacuum Insulated Panels. TFT color display. USB QC 3.0. Bluetooth.",
  },
  {
    id: "dometic-cfx5-45",
    brand: "Dometic",
    model: "CFX5 45",
    type: "fridge-freezer",
    weightLbs: 42,
    capacityQts: 49,    // 46L
    drawAmps: 9.4,      // rated 12V DC input current per Dometic spec
    affiliateUrl: "#",
    notes: "46L / 72-can capacity. Mid-size sweet spot. VIP insulation, TFT display, USB QC 3.0.",
  },
  {
    id: "dometic-cfx5-55im",
    brand: "Dometic",
    model: "CFX5 55 IM",
    type: "fridge-freezer",
    weightLbs: 48,
    capacityQts: 58,    // 55L
    drawAmps: 9.6,      // rated 12V DC input current per Dometic spec
    affiliateUrl: "https://www.amazon.com/dp/B0F9LFZTVC?tag=prepperevo-20",
    notes: "55L / 83-can capacity with built-in ice maker. VIP insulation, TFT display, USB QC 3.0.",
  },
  {
    id: "dometic-cfx5-75dz",
    brand: "Dometic",
    model: "CFX5 75DZ",
    type: "fridge-freezer",
    weightLbs: 60,
    capacityQts: 79,    // 75L dual zone (45L + 30L)
    drawAmps: 9.7,      // rated 12V DC input current per Dometic spec
    affiliateUrl: "#",
    notes: "75L dual-zone (45L + 30L) — independent fridge and freezer. VIP insulation, TFT display, Bluetooth.",
  },
  {
    id: "dometic-cfx5-95dz",
    brand: "Dometic",
    model: "CFX5 95DZ",
    type: "fridge-freezer",
    weightLbs: 64,
    capacityQts: 99,    // 94L dual zone
    drawAmps: 9.8,      // rated 12V DC input current per Dometic spec (US)
    affiliateUrl: "#",
    notes: "94L dual-zone — largest Dometic portable cooler. 133-can capacity. For extended family trips.",
  },

  // ─── ARB ─────────────────────────────────────────────────────────────────

  {
    id: "arb-classic-ii-50",
    brand: "ARB",
    model: "Classic Series II 50Qt",
    type: "fridge-freezer",
    weightLbs: 53,
    capacityQts: 50,
    drawAmps: 4.5,      // estimated compressor running draw; ARB publishes 0.87 Ah/h cycling avg
    affiliateUrl: "https://www.amazon.com/dp/B07Q75PB68?tag=prepperevo-20",
    notes: "The gold standard for expedition use. Dual-zone compartment lid. Rock-solid build quality.",
  },
  {
    id: "arb-elements-60",
    brand: "ARB",
    model: "Elements 60L",
    type: "fridge-freezer",
    weightLbs: 70,
    capacityQts: 63,    // 60L
    drawAmps: 4.5,      // ~0.89 Ah average cycling
    affiliateUrl: "https://www.amazon.com/dp/B073X696GN?tag=prepperevo-20",
    notes: "Stainless steel exterior, fully weatherproof. Best ARB fridge for harsh conditions.",
  },
  {
    id: "arb-zero-36",
    brand: "ARB",
    model: "Zero 36L",
    type: "fridge-freezer",
    weightLbs: 49,
    capacityQts: 38,    // 36L
    drawAmps: 4.0,      // estimated; similar class to Zero 47
    affiliateUrl: "#",
    notes: "Compact single-zone with ARB's ultra-efficient SECOP compressor. -22°F to +50°F range.",
  },
  {
    id: "arb-zero-47",
    brand: "ARB",
    model: "Zero 47Qt",
    type: "fridge-freezer",
    weightLbs: 52.6,
    capacityQts: 47,
    drawAmps: 4.5,
    affiliateUrl: "https://www.amazon.com/dp/B084Z8Z55B?tag=prepperevo-20",
    notes: "Front-opening lid — unique to 38Qt and 47Qt. Perfect for bedside placement in a truck bed.",
  },

  // ─── ICECO VL SERIES ─────────────────────────────────────────────────────

  {
    id: "iceco-vl35",
    brand: "IceCo",
    model: "VL35 ProS",
    type: "fridge-freezer",
    weightLbs: 48.7,
    capacityQts: 37,    // 35L
    drawAmps: 5.5,      // ~45W average / 12V
    affiliateUrl: "#",
    notes: "Metal construction, dual-zone capable. SECOP compressor. Strong budget alternative to Dometic.",
  },
  {
    id: "iceco-vl45",
    brand: "IceCo",
    model: "VL45 ProS",
    type: "fridge-freezer",
    weightLbs: 52,
    capacityQts: 48,    // 45L → ~47.6 qt; listed as 47 qt
    drawAmps: 5.5,      // ~55W average / 12V
    affiliateUrl: "#",
    notes: "47Qt single-zone. Slide mount compatible. Solid performer at a lower price point.",
  },
  {
    id: "iceco-vl60",
    brand: "IceCo",
    model: "VL60 Pro",
    type: "fridge-freezer",
    weightLbs: 65,
    capacityQts: 63,    // 60L
    drawAmps: 6.5,      // estimated; ~63Qt class
    affiliateUrl: "#",
    notes: "Dual-zone option available (VL60D). Largest VL-series for extended family trips.",
  },

  // ─── BOUGERV CR PRO ──────────────────────────────────────────────────────

  {
    id: "bougerv-crpro30",
    brand: "BougeRV",
    model: "CR Pro 30",
    type: "fridge-freezer",
    weightLbs: 28,
    capacityQts: 30,
    drawAmps: 3.75,     // 45W ECO / 12V
    affiliateUrl: "https://www.amazon.com/dp/B0B9S6YX5N?tag=prepperevo-20",
    notes: "Lightest fridge on this list. Great for solo rigs or when payload is tight.",
  },
  {
    id: "bougerv-crpro45",
    brand: "BougeRV",
    model: "CR Pro 45",
    type: "fridge-freezer",
    weightLbs: 44,
    capacityQts: 48,    // 45L
    drawAmps: 5.0,      // 60W max / 12V
    affiliateUrl: "https://www.amazon.com/dp/B091SJTWP5?tag=prepperevo-20",
    notes: "48Qt dual-zone option. App control. Best value in the 45L class.",
  },

  // ─── ECOFLOW GLACIER ─────────────────────────────────────────────────────

  {
    id: "ecoflow-glacier-35",
    brand: "EcoFlow",
    model: "GLACIER Classic 35L",
    type: "fridge-freezer",
    weightLbs: 45,
    capacityQts: 37,    // 35L
    drawAmps: 4.6,      // 55W rated compressor / 12V; 0.57 Ah/h cycling avg
    affiliateUrl: "https://www.amazon.com/dp/B0F4DP9BKH?tag=prepperevo-20",
    notes: "Dual-zone (fridge + freezer). Detachable battery option. Ice-making mode. App control via WiFi/BT.",
  },
  {
    id: "ecoflow-glacier-45",
    brand: "EcoFlow",
    model: "GLACIER Classic 45L",
    type: "fridge-freezer",
    weightLbs: 51,
    capacityQts: 48,    // 45L
    drawAmps: 4.6,      // 55W rated compressor / 12V; same compressor as 35L
    affiliateUrl: "https://www.amazon.com/dp/B0FS6T2539?tag=prepperevo-20",
    notes: "Dual-zone. Same feature set as 35L in a larger package. Good for 2-4 person trips.",
  },
  {
    id: "ecoflow-glacier-55",
    brand: "EcoFlow",
    model: "GLACIER Classic 55L",
    type: "fridge-freezer",
    weightLbs: 55.6,
    capacityQts: 58,    // 55L
    drawAmps: 4.6,      // 55W rated compressor / 12V; same compressor as 35L/45L
    affiliateUrl: "https://www.amazon.com/dp/B0FS68S9V6?tag=prepperevo-20",
    notes: "Largest GLACIER. Dual-zone. Pairs perfectly with DELTA 3 series for extended off-grid use.",
  },

  // ─── ALPICOOL ────────────────────────────────────────────────────────────

  {
    id: "alpicool-c20",
    brand: "Alpicool",
    model: "C20",
    type: "fridge-freezer",
    weightLbs: 22,
    capacityQts: 21,    // 19.8L
    drawAmps: 4.2,      // ~50W / 12V
    affiliateUrl: "#",
    notes: "Ultra-compact entry-level fridge. 21Qt. Good for day runs or secondary cooler duty.",
  },
  {
    id: "alpicool-c40",
    brand: "Alpicool",
    model: "C40",
    type: "fridge-freezer",
    weightLbs: 30,
    capacityQts: 38,    // 35.7L / 38Qt
    drawAmps: 5.0,      // 45W–60W / 12V
    affiliateUrl: "https://www.amazon.com/dp/B01N4WOSTZ?tag=prepperevo-20",
    notes: "38Qt single-zone. Budget-friendly compressor fridge. Popular first upgrade from ice chests.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getFridgeBrands(): string[] {
  return [...new Set(fridgeDatabase.map((f) => f.brand))].sort();
}

export function getFridgeModels(brand: string): FridgeEntry[] {
  return fridgeDatabase
    .filter((f) => f.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findFridge(id: string): FridgeEntry | undefined {
  return fridgeDatabase.find((f) => f.id === id);
}
