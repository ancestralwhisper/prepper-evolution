// ─── RigSafe Solar Panel Database ────────────────────────────────────────────
// Real manufacturer specs for vehicle-mounted solar panels (trucks/SUVs).
//
// Sources:
//   Weight: Manufacturer spec sheets & product pages
//   Wattage: Rated panel output
//   Rigid panels: ~15–25 lbs. Flex panels: ~4–8 lbs.

export interface SolarPanelEntry {
  id: string;
  brand: string;
  model: string;
  weightLbs: number;
  watts: number;
  panelCount: number;
  mountType: "roof-rack" | "bed-rack" | "hood" | "universal";
  affiliateUrl: string;
  notes?: string;
}

export const solarDatabase: SolarPanelEntry[] = [
  // ─── RENOGY ──────────────────────────────────────────────────────────────

  {
    id: "renogy-100w-mono-rigid",
    brand: "Renogy",
    model: "100W Mono Rigid Panel",
    weightLbs: 16.5,
    watts: 100,
    panelCount: 1,
    mountType: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B07GF5JY35?tag=prepperevo-20",
    notes:
      "Industry-standard 12V mono. Compact design 11% smaller than previous gen. Aluminum frame. Z-bracket compatible.",
  },
  {
    id: "renogy-200w-mono-rigid",
    brand: "Renogy",
    model: "200W Mono Rigid Panel",
    weightLbs: 26.5,
    watts: 200,
    panelCount: 1,
    mountType: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B08CRJYJ22?tag=prepperevo-20",
    notes:
      "Single large panel. 25% efficiency N-type cells. 16BB design. Good for larger roof racks.",
  },
  {
    id: "renogy-100w-flex",
    brand: "Renogy",
    model: "100W Flexible Mono Panel",
    weightLbs: 5.3,
    watts: 100,
    panelCount: 1,
    mountType: "hood",
    affiliateUrl: "https://www.amazon.com/dp/B09W21FRBC?tag=prepperevo-20",
    notes:
      "240° bend capable. 5.3 lbs (2.4 kg). Adhesive/tape mount. No frame. Good for curved hood or cab roof.",
  },

  // ─── BOUGERV ─────────────────────────────────────────────────────────────

  {
    id: "bougerv-100w-mono-rigid",
    brand: "BougeRV",
    model: "Arch 100W Fiberglass Flex Panel",
    weightLbs: 4.0,
    watts: 100,
    panelCount: 1,
    mountType: "hood",
    affiliateUrl: "https://www.amazon.com/dp/B0CFXTGWSN?tag=prepperevo-20",
    notes:
      "Fiberglass backing — more rigid than thin-film but still flexible. 270° bendable. Lightweight at 4 lbs.",
  },
  {
    id: "bougerv-100w-cigs-flex",
    brand: "BougeRV",
    model: "Yuma 100W CIGS Flex Panel",
    weightLbs: 4.3,
    watts: 100,
    panelCount: 1,
    mountType: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B0BJJYZJ5X?tag=prepperevo-20",
    notes:
      "CIGS thin-film — shading tolerant, better performance in partial shade. 4.3 lbs (compact tape-mount version). No soldering required.",
  },
  {
    id: "bougerv-200w-flex",
    brand: "BougeRV",
    model: "Arch 200W Fiberglass Flex (2x100W)",
    weightLbs: 8.0,
    watts: 200,
    panelCount: 2,
    mountType: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B0CFXXH2Y5?tag=prepperevo-20",
    notes:
      "Two 100W Arch panels. Total system weight ~8 lbs for both. Very low profile on rack surface.",
  },

  // ─── RICH SOLAR ──────────────────────────────────────────────────────────

  {
    id: "rich-solar-100w-rigid",
    brand: "Rich Solar",
    model: "100W Mono Rigid Panel",
    weightLbs: 13.2,
    watts: 100,
    panelCount: 1,
    mountType: "roof-rack",
    affiliateUrl: "#",
    notes:
      "Anodized aluminum frame. Tempered anti-reflective glass. Pre-drilled holes for Z-bracket or rail mounts.",
  },
  {
    id: "rich-solar-200w-rigid",
    brand: "Rich Solar",
    model: "200W Mono Rigid Panel",
    weightLbs: 24.0,
    watts: 200,
    panelCount: 1,
    mountType: "roof-rack",
    affiliateUrl: "#",
    notes: "High-efficiency mono cells. Compact footprint for a 200W rigid panel. IP65 junction box.",
  },

  // ─── ZAMP SOLAR ──────────────────────────────────────────────────────────

  {
    id: "zamp-obsidian-100w",
    brand: "Zamp Solar",
    model: "Obsidian 100W Roof Mount Kit",
    weightLbs: 10.78,
    watts: 100,
    panelCount: 1,
    mountType: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B082XJP513?tag=prepperevo-20",
    notes:
      "30% lighter than traditional panels. Ultra-slim low-profile frame. RV/overland ready. Made in USA.",
  },
  {
    id: "zamp-obsidian-200w",
    brand: "Zamp Solar",
    model: "Obsidian 200W Roof Mount Kit (2x100W)",
    weightLbs: 21.56,
    watts: 200,
    panelCount: 2,
    mountType: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B082XJXGYN?tag=prepperevo-20",
    notes:
      "Two Obsidian 100W panels (10.78 lbs each). Includes all mounting hardware. American designed.",
  },

  // ─── ECOFLOW ─────────────────────────────────────────────────────────────

  {
    id: "ecoflow-110w-portable",
    brand: "EcoFlow",
    model: "110W Portable Panel",
    weightLbs: 8.8,
    watts: 110,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0D5QWD1FK?tag=prepperevo-20",
    notes:
      "IP68, foldable with carry case. 23% efficiency. Ground-deploy or lean against vehicle.",
  },
  {
    id: "ecoflow-160w-portable",
    brand: "EcoFlow",
    model: "160W Portable Panel",
    weightLbs: 15.4,
    watts: 160,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0D3VCQV6W?tag=prepperevo-20",
    notes:
      "Kickstand included. Pairs with RIVER and DELTA series. IP68. Ground-deploy.",
  },
  {
    id: "ecoflow-220w-bifacial",
    brand: "EcoFlow",
    model: "220W Bifacial Panel",
    weightLbs: 20.9,
    watts: 220,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B09TKM8PBQ?tag=prepperevo-20",
    notes:
      "Bifacial design captures reflected light from rear side (+25%). 22-23% efficiency. IP68. Kickstand case included. 15.4 lbs panel only, 20.9 lbs with case.",
  },
  {
    id: "ecoflow-220w-ntype",
    brand: "EcoFlow",
    model: "220W N-Type Bifacial Panel",
    weightLbs: 20.9,
    watts: 220,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0D2H94PS6?tag=prepperevo-20",
    notes:
      "N-Type cells. 25% efficiency. Bifacial +28% gain. IP68. Adjustable kickstand. NextGen version.",
  },
  {
    id: "ecoflow-400w-portable",
    brand: "EcoFlow",
    model: "400W Portable Panel",
    weightLbs: 35.3,
    watts: 400,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B09TKKYW7G?tag=prepperevo-20",
    notes:
      "Best watts/dollar for large EcoFlow systems. IP68. Foldable with adjustable kickstand case.",
  },
  {
    id: "ecoflow-2x100w-rigid",
    brand: "EcoFlow",
    model: "2x100W Rigid Panel Kit",
    weightLbs: 27.4,
    watts: 200,
    panelCount: 2,
    mountType: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B0D5QXLVC9?tag=prepperevo-20",
    notes:
      "IP68 rigid panels. Permanent mount for RV/cabin/rack. 13.7 lbs each.",
  },
  {
    id: "ecoflow-2x400w-rigid",
    brand: "EcoFlow",
    model: "2x400W Rigid Panel Kit",
    weightLbs: 48.1,
    watts: 800,
    panelCount: 2,
    mountType: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B0CVL9S84Y?tag=prepperevo-20",
    notes:
      "800W total. Permanent mount for balcony, RV, or cabin rooftop. Best for DELTA Pro 3 / Pro Ultra systems.",
  },

  // ─── JACKERY ─────────────────────────────────────────────────────────────

  {
    id: "jackery-40w",
    brand: "Jackery",
    model: "SolarSaga 40W",
    weightLbs: 2.6,
    watts: 40,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0CYLCJ6KS?tag=prepperevo-20",
    notes: "Book-sized foldable. USB-C + USB-A ports. IP68. Pairs with Explorer 300 Plus.",
  },
  {
    id: "jackery-80w",
    brand: "Jackery",
    model: "SolarSaga 80W",
    weightLbs: 11.0,
    watts: 80,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0BMPJ2H5X?tag=prepperevo-20",
    notes: "Double-sided bifacial. 25% efficiency. Reflective carrying case included.",
  },
  {
    id: "jackery-100w",
    brand: "Jackery",
    model: "SolarSaga 100W",
    weightLbs: 7.94,
    watts: 100,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0D5CCY5Y2?tag=prepperevo-20",
    notes: "Bifacial 25% efficiency. USB-C + USB-A. IP68. Foldable with dual kickstands.",
  },
  {
    id: "jackery-100w-light",
    brand: "Jackery",
    model: "SolarSaga 100W Light",
    weightLbs: 4.52,
    watts: 100,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0FPFPJFSB?tag=prepperevo-20",
    notes: "56% lighter than traditional rigid panels. IBC cells. 25% efficiency. 221-degree bendable.",
  },
  {
    id: "jackery-200w",
    brand: "Jackery",
    model: "SolarSaga 200W",
    weightLbs: 13.7,
    watts: 200,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0D8377KV3?tag=prepperevo-20",
    notes: "Bifacial 26.7% efficiency. IP68. Higher efficiency PERC cells. Sunlight angle indicator.",
  },

  // ─── BLUETTI ────────────────────────────────────────────────────────────

  {
    id: "bluetti-pv68",
    brand: "Bluetti",
    model: "PV68 (68W)",
    weightLbs: 7.5,
    watts: 68,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0BNN9M6ZP?tag=prepperevo-20",
    notes: "Compact foldable. Adjustable kickstands. Pairs with EB3A and small stations.",
  },
  {
    id: "bluetti-pv200",
    brand: "Bluetti",
    model: "PV200 (200W)",
    weightLbs: 16.1,
    watts: 200,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0CCXSFSSJ?tag=prepperevo-20",
    notes: "23.4% efficiency. Foldable with kickstand. MC4 connectors. Pairs with AC200 series.",
  },
  {
    id: "bluetti-pv220",
    brand: "Bluetti",
    model: "PV220 (220W)",
    weightLbs: 20.5,
    watts: 220,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B09QKSCXTS?tag=prepperevo-20",
    notes: "23.4% efficiency. Foldable. Compatible with AC2A/AC70/AC180/AC200 series.",
  },
  {
    id: "bluetti-sp350",
    brand: "Bluetti",
    model: "SP350 (350W)",
    weightLbs: 30.6,
    watts: 350,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B09K7S15K1?tag=prepperevo-20",
    notes: "23.4% efficiency. Adjustable kickstand. For AC180/AC200L/AC200MAX/AC300 systems.",
  },
  {
    id: "bluetti-pv420",
    brand: "Bluetti",
    model: "PV420 (420W)",
    weightLbs: 30.8,
    watts: 420,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0BSFMCW11?tag=prepperevo-20",
    notes: "23.4% efficiency. Foldable. For AC200MAX/AC300/AC500/EP500 systems. Largest Bluetti panel.",
  },

  // ─── ANKER SOLIX ────────────────────────────────────────────────────────

  {
    id: "anker-ps30",
    brand: "Anker",
    model: "SOLIX PS30 (30W)",
    weightLbs: 2.4,
    watts: 30,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0BX9FCSQQ?tag=prepperevo-20",
    notes: "Ultralight foldable. IP65. USB charging only. For phones and small devices.",
  },
  {
    id: "anker-ps100",
    brand: "Anker",
    model: "SOLIX PS100 (100W)",
    weightLbs: 9.7,
    watts: 100,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0CYSD1C6Y?tag=prepperevo-20",
    notes: "IP67. 23% efficiency. Adjustable kickstand. Pairs with C1000 and F2000 series.",
  },
  {
    id: "anker-ps200",
    brand: "Anker",
    model: "SOLIX PS200 (200W)",
    weightLbs: 16.3,
    watts: 200,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0BK8YWY9Q?tag=prepperevo-20",
    notes: "IP67. 23% efficiency. Foldable. Compatible with F1200/F1500/F2000/F2600/C1000 series.",
  },
  {
    id: "anker-ps400",
    brand: "Anker",
    model: "SOLIX PS400 (400W)",
    weightLbs: 35.3,
    watts: 400,
    panelCount: 1,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0BWQJ19M4?tag=prepperevo-20",
    notes: "IP67. Smart sunlight alignment. Largest Anker panel. For F2000/PowerHouse 767.",
  },

  // ─── GOAL ZERO ───────────────────────────────────────────────────────────

  {
    id: "goalzero-boulder-100-briefcase",
    brand: "Goal Zero",
    model: "Boulder 100 Briefcase",
    weightLbs: 25.9,
    watts: 100,
    panelCount: 2,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B06Y3TC113?tag=prepperevo-20",
    notes:
      "Two 50W panels hinged together. Built-in kickstand. Connects to any Yeti power station. Not a rack-mount — ground or tailgate deploy.",
  },
  {
    id: "goalzero-boulder-200-briefcase",
    brand: "Goal Zero",
    model: "Boulder 200 Briefcase",
    weightLbs: 42.0,
    watts: 200,
    panelCount: 2,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B0753TW31T?tag=prepperevo-20",
    notes:
      "Two 100W panels. 42 lbs total. Tempered glass + aluminum frame. Best used as ground-deploy camp panel, not permanent rack-mount.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getSolarBrands(): string[] {
  return [...new Set(solarDatabase.map((s) => s.brand))].sort();
}

export function getSolarModels(brand: string): SolarPanelEntry[] {
  return solarDatabase
    .filter((s) => s.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findSolar(id: string): SolarPanelEntry | undefined {
  return solarDatabase.find((s) => s.id === id);
}
