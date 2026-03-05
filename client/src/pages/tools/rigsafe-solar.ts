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
    weightLbs: 4.0,
    watts: 100,
    panelCount: 1,
    mountType: "hood",
    affiliateUrl: "https://www.amazon.com/dp/B09W21FRBC?tag=prepperevo-20",
    notes:
      "240° bend capable. 4 lbs. Adhesive/tape mount. No frame. Good for curved hood or cab roof.",
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
    weightLbs: 7.05,
    watts: 100,
    panelCount: 1,
    mountType: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B0BJJYZJ5X?tag=prepperevo-20",
    notes:
      "CIGS thin-film — shading tolerant, better performance in partial shade. Tape-mount. No soldering required.",
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
    weightLbs: 14.3,
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
    weightLbs: 26.0,
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

  // ─── GOAL ZERO ───────────────────────────────────────────────────────────

  {
    id: "goalzero-boulder-100-briefcase",
    brand: "Goal Zero",
    model: "Boulder 100 Briefcase",
    weightLbs: 21.0,
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
