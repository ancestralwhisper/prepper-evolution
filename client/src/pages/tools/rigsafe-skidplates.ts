// ─── RigSafe Skid Plate Database ──────────────────────────────────────
// Real manufacturer specs for underbody protection skid plates.
// Trucks and SUVs only (Tacoma, 4Runner, Wrangler, Gladiator, F-150, etc.).
//
// Sources:
//   Weights: Manufacturer spec sheets, retailer product listings
//   Steel full sets typically 60–120 lbs (thicker = heavier)
//   Aluminum full sets typically 30–70 lbs
//   UHMWPE (plastic composite) full sets typically 15–35 lbs
//   Note: "full-set" means engine + transmission + transfer case at minimum.
//   Some brands include additional pieces (fuel tank, diff, A-arms).

export interface SkidPlateEntry {
  id: string;
  brand: string;
  model: string;
  material: "steel" | "aluminum" | "UHMWPE";
  coverage: "engine-only" | "engine-trans" | "full-set";
  weightLbs: number;
  affiliateUrl: string;
  notes?: string;
}

export const skidPlateDatabase: SkidPlateEntry[] = [
  // ─── STEEL ───────────────────────────────────────────────────────────

  {
    id: "rci-steel-full-4runner",
    brand: "RCI Metalworks",
    model: "Full Skid Package — Steel (4Runner 2010-2024)",
    material: "steel",
    coverage: "full-set",
    weightLbs: 118,
    affiliateUrl: "#",
    notes: "Front + trans + t-case skids. 3/16\" formed steel. Heaviest protection available for 5th gen 4Runner. USA made.",
  },
  {
    id: "rci-steel-full-tacoma",
    brand: "RCI Metalworks",
    model: "Full Skid Package — Steel (Tacoma 2005-2023)",
    material: "steel",
    coverage: "full-set",
    weightLbs: 110,
    affiliateUrl: "#",
    notes: "Front + trans + t-case skids. 3/16\" formed steel. Vehicle-specific fitment. USA made.",
  },
  {
    id: "cbi-steel-front-4runner",
    brand: "CBI Offroad",
    model: "Front Skid Plate — Steel (4Runner 2014-2024)",
    material: "steel",
    coverage: "engine-only",
    weightLbs: 28,
    affiliateUrl: "https://www.amazon.com/dp/B09NQSR2TZ?tag=prepperevo-20",
    notes: "3/16\" formed plate steel. Engine-only single piece. Pairs with CBI trans/t-case skids for full coverage.",
  },
  {
    id: "shrockworks-steel-full-jk",
    brand: "Shrockworks",
    model: "Full Skid Set — Steel (Wrangler JK)",
    material: "steel",
    coverage: "full-set",
    weightLbs: 85,
    affiliateUrl: "#",
    notes: "Engine + trans + t-case set. Heavy gauge steel. Known for tight fitment. Still available from fabrication shops.",
  },
  {
    id: "pelfreybilt-steel-full-tacoma",
    brand: "Pelfreybilt",
    model: "Full Skid Set — Steel (Tacoma)",
    material: "steel",
    coverage: "full-set",
    weightLbs: 78,
    affiliateUrl: "#",
    notes: "10-gauge steel construction. Front + fuel tank set. Bay Area made. Gas tank skid alone is 32 lbs.",
  },

  // ─── ALUMINUM ───────────────────────────────────────────────────────

  {
    id: "rci-alum-full-4runner",
    brand: "RCI Metalworks",
    model: "Full Skid Package — Aluminum (4Runner 2010-2024)",
    material: "aluminum",
    coverage: "full-set",
    weightLbs: 68,
    affiliateUrl: "#",
    notes: "Same coverage as steel package at roughly 40% lighter. Front + trans + t-case. USA made.",
  },
  {
    id: "cali-raised-alum-full-4runner",
    brand: "Cali Raised LED",
    model: "Full Skid Package — Aluminum (4Runner 2010-2024)",
    material: "aluminum",
    coverage: "full-set",
    weightLbs: 80,
    affiliateUrl: "#",
    notes: "Complete set: front + trans + t-case + fuel tank. Anodized aluminum. Popular for trail rigs that watch weight.",
  },
  {
    id: "cali-raised-alum-full-tacoma",
    brand: "Cali Raised LED",
    model: "Full Skid Package — Aluminum (Tacoma 2024+)",
    material: "aluminum",
    coverage: "full-set",
    weightLbs: 55,
    affiliateUrl: "#",
    notes: "4th gen Tacoma specific. Front 22 lbs + trans 31 lbs base set. Add-ons available for fuel tank and LCA skids.",
  },
  {
    id: "arb-alum-engine-trans-4runner",
    brand: "ARB",
    model: "Underbody Protection — Aluminum (4Runner)",
    material: "aluminum",
    coverage: "engine-trans",
    weightLbs: 42,
    affiliateUrl: "https://www.amazon.com/dp/B07KXNTL3W?tag=prepperevo-20",
    notes: "Engine + transmission combined skid. ARB alloy construction. Designed to complement ARB lift kits.",
  },

  // ─── UHMWPE ──────────────────────────────────────────────────────────

  {
    id: "trail-armor-uhmwpe-full-tacoma",
    brand: "Trail Armor",
    model: "Full Skid Package — UHMWPE (Tacoma 2005-2023)",
    material: "UHMWPE",
    coverage: "full-set",
    weightLbs: 22,
    affiliateUrl: "#",
    notes: "Ultra-high molecular weight polyethylene. Slides over rocks (won't catch like steel). Full front + trans + t-case set. Self-lubricating surface.",
  },
  {
    id: "trail-armor-uhmwpe-engine-jl",
    brand: "Trail Armor",
    model: "Engine Skid — UHMWPE (Wrangler JL)",
    material: "UHMWPE",
    coverage: "engine-only",
    weightLbs: 9,
    affiliateUrl: "#",
    notes: "Single engine skid. Ultra-light at only 9 lbs. Great choice when weight matters more than max protection. Slick on rock surfaces.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

export function getSkidPlateBrands(): string[] {
  return [...new Set(skidPlateDatabase.map((s) => s.brand))].sort();
}

export function getSkidPlateModels(brand: string): SkidPlateEntry[] {
  return skidPlateDatabase
    .filter((s) => s.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findSkidPlate(id: string): SkidPlateEntry | undefined {
  return skidPlateDatabase.find((s) => s.id === id);
}
