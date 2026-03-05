// ─── RigSafe Bumper Database ──────────────────────────────────────────
// Real manufacturer specs for steel, aluminum, and hybrid aftermarket bumpers.
// Trucks and SUVs only (4Runner, Tacoma, Wrangler, Gladiator, F-150, etc.).
//
// Sources:
//   Weights: Manufacturer spec sheets, product pages, retailer listings
//   Steel front bumpers typically 80–200 lbs depending on size/vehicle
//   Aluminum front bumpers typically 40–100 lbs
//   Rear bumpers typically 60–150 lbs (lighter than fronts, no winch plate)
//   Note: Packaged/shipping weight can run 20–40 lbs over bare part weight;
//   all weights here are bare part weight where confirmed.

export interface BumperEntry {
  id: string;
  brand: string;
  model: string;
  position: "front" | "rear";
  material: "steel" | "aluminum" | "hybrid";
  weightLbs: number;
  hasFairleadMount: boolean;
  maxWinchLbs?: number;
  hasDRing: boolean;
  dRingCount?: number;
  affiliateUrl: string;
  notes?: string;
}

export const bumperDatabase: BumperEntry[] = [
  // ─── FRONT BUMPERS ──────────────────────────────────────────────────

  {
    id: "arb-summit-tacoma",
    brand: "ARB",
    model: "Summit Front Bumper (Tacoma 2016+)",
    position: "front",
    material: "steel",
    weightLbs: 170,
    hasFairleadMount: true,
    maxWinchLbs: 12000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B07H4KBPZK?tag=prepperevo-20",
    notes: "60.3mm mandrel-bent steel tubing. Winch mount included. Fits 3rd gen Tacoma 2016-2023.",
  },
  {
    id: "arb-summit-4runner",
    brand: "ARB",
    model: "Summit Front Bumper (4Runner 2014-2024)",
    position: "front",
    material: "steel",
    weightLbs: 165,
    hasFairleadMount: true,
    maxWinchLbs: 12000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B00BIXETNE?tag=prepperevo-20",
    notes: "Fits 5th gen 4Runner. Integrated winch plate. One of the most popular 4Runner bumpers.",
  },
  {
    id: "arb-deluxe-wrangler-jl",
    brand: "ARB",
    model: "Deluxe Classic Front Bumper (Wrangler JL/Gladiator JT)",
    position: "front",
    material: "steel",
    weightLbs: 160,
    hasFairleadMount: true,
    maxWinchLbs: 10000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B07KXNVYTM?tag=prepperevo-20",
    notes: "Part# 3450440. Fits 2018-2026 Wrangler JL and 2020+ Gladiator JT. 10K winch plate included.",
  },
  {
    id: "cbi-covert-4runner",
    brand: "CBI Offroad",
    model: "Covert Front Bumper (4Runner 2014-2024)",
    position: "front",
    material: "steel",
    weightLbs: 85,
    hasFairleadMount: true,
    maxWinchLbs: 12000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B09NQTFPQR?tag=prepperevo-20",
    notes: "3/16\" formed plate steel. Mid-width design. CBI's most popular 4Runner bumper. USA made.",
  },
  {
    id: "cbi-covert-tacoma",
    brand: "CBI Offroad",
    model: "Covert Front Bumper (Tacoma 2024+)",
    position: "front",
    material: "steel",
    weightLbs: 85,
    hasFairleadMount: true,
    maxWinchLbs: 12000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "#",
    notes: "Fits 4th gen Tacoma 2024+. Same Covert platform as 4Runner version. USA made.",
  },
  {
    id: "c4-fab-overland-tacoma",
    brand: "C4 Fabrication",
    model: "Overland Front Bumper (Tacoma 2024+)",
    position: "front",
    material: "steel",
    weightLbs: 90,
    hasFairleadMount: true,
    maxWinchLbs: 12000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "#",
    notes: "3/16\" laser-cut P&O steel. Full-width winch capable. Vehicle-specific fitment for 4th gen Tacoma.",
  },
  {
    id: "smittybilt-xrc-gen3-jl",
    brand: "Smittybilt",
    model: "XRC Gen 3 Front Bumper (Wrangler JK/JL/Gladiator JT)",
    position: "front",
    material: "steel",
    weightLbs: 111,
    hasFairleadMount: true,
    maxWinchLbs: 10000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B08TW7G37R?tag=prepperevo-20",
    notes: "Part# SB77808. 3/16\" cold roll steel. Supports up to 9 aux lights. 5-year warranty. Fits JK/JL/JT.",
  },
  {
    id: "smittybilt-m1-front-tacoma",
    brand: "Smittybilt",
    model: "M1 Front Bumper (Tacoma)",
    position: "front",
    material: "steel",
    weightLbs: 95,
    hasFairleadMount: true,
    maxWinchLbs: 10000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B002Q8T46G?tag=prepperevo-20",
    notes: "Budget-friendly steel option. Winch cradle integrated. Available for multiple truck platforms.",
  },
  {
    id: "warn-ascent-front-wrangler",
    brand: "Warn",
    model: "Ascent Front Bumper (Wrangler JL)",
    position: "front",
    material: "steel",
    weightLbs: 98,
    hasFairleadMount: true,
    maxWinchLbs: 12000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B07D2NVQNM?tag=prepperevo-20",
    notes: "Manufacturer-matched winch mount. Clean integration with Warn winches. Full-width coverage.",
  },
  {
    id: "body-armor-pro-front-tacoma",
    brand: "Body Armor 4x4",
    model: "Pro Series Front Bumper (Tacoma 2016-2023)",
    position: "front",
    material: "steel",
    weightLbs: 105,
    hasFairleadMount: true,
    maxWinchLbs: 10000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B01N1JFGJD?tag=prepperevo-20",
    notes: "3/16\" mild steel. Mid-width full winch bumper. Integrated skid plate lip. D-ring mounts standard.",
  },
  {
    id: "road-armor-identity-front-f150",
    brand: "Road Armor",
    model: "Identity Front Bumper (F-150)",
    position: "front",
    material: "steel",
    weightLbs: 145,
    hasFairleadMount: true,
    maxWinchLbs: 12000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B07MQMX4BV?tag=prepperevo-20",
    notes: "Modular system — center section + end caps sold separately. Raw or powdercoat finish options.",
  },
  {
    id: "fab-fours-black-steel-f150",
    brand: "Fab Fours",
    model: "Black Steel Elite Front Bumper (F-150)",
    position: "front",
    material: "steel",
    weightLbs: 160,
    hasFairleadMount: true,
    maxWinchLbs: 12000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B00QWJB4ZQ?tag=prepperevo-20",
    notes: "Full-guard option adds pre-runner hoop. USA made. Integrates with Ford factory camera system.",
  },
  {
    id: "expedition-one-trail2-jl",
    brand: "Expedition One",
    model: "Trail Series 2 Front Bumper (Wrangler JL/JT)",
    position: "front",
    material: "steel",
    weightLbs: 95,
    hasFairleadMount: true,
    maxWinchLbs: 12000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "#",
    notes: "Full-width winch bumper. Optional center hoop. USA made. Fits JL Wrangler and Gladiator JT.",
  },
  {
    id: "go-rhino-arb-front-f150",
    brand: "Go Rhino",
    model: "ARB Front Bumper (F-150)",
    position: "front",
    material: "steel",
    weightLbs: 130,
    hasFairleadMount: true,
    maxWinchLbs: 10000,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B00MFN96U8?tag=prepperevo-20",
    notes: "Full-width design with integrated skid protection. Pre-drilled for light bar and fog lights.",
  },

  // ─── REAR BUMPERS ──────────────────────────────────────────────────

  {
    id: "arb-deluxe-rear-tacoma",
    brand: "ARB",
    model: "Deluxe Rear Bumper (Tacoma 2016+)",
    position: "rear",
    material: "steel",
    weightLbs: 110,
    hasFairleadMount: false,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B01LWUGGXU?tag=prepperevo-20",
    notes: "Integrated tire carrier option available. Full-width coverage with recovery points.",
  },
  {
    id: "smittybilt-m1-rear-f150",
    brand: "Smittybilt",
    model: "M1 Rear Bumper (F-150)",
    position: "rear",
    material: "steel",
    weightLbs: 73,
    hasFairleadMount: false,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B00IZZDXQK?tag=prepperevo-20",
    notes: "3/16\" cold roll steel. Full-width. Budget-friendly entry. Includes D-ring mounts.",
  },
  {
    id: "body-armor-pro-rear-tacoma",
    brand: "Body Armor 4x4",
    model: "Pro Series Rear Bumper (Tacoma 2016-2023)",
    position: "rear",
    material: "steel",
    weightLbs: 95,
    hasFairleadMount: false,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B07CG3GBXZ?tag=prepperevo-20",
    notes: "3/16\" mild steel. Full-width with integrated step. Optional tire carrier add-on.",
  },
  {
    id: "cbi-rear-4runner",
    brand: "CBI Offroad",
    model: "Rear Bumper (4Runner 2010-2024)",
    position: "rear",
    material: "steel",
    weightLbs: 88,
    hasFairleadMount: false,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "#",
    notes: "Swing-out tire carrier compatible. Matches CBI front bumper aesthetic. USA made.",
  },
  {
    id: "expedition-one-rear-4runner",
    brand: "Expedition One",
    model: "ECTO Rear Bumper (4Runner 2010-2024)",
    position: "rear",
    material: "steel",
    weightLbs: 92,
    hasFairleadMount: false,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "#",
    notes: "Full-width bumper with optional high-lift jack mount and tire swing. USA made.",
  },
  {
    id: "fab-fours-rear-wrangler-jl",
    brand: "Fab Fours",
    model: "Black Steel Rear Bumper (Wrangler JL)",
    position: "rear",
    material: "steel",
    weightLbs: 80,
    hasFairleadMount: false,
    hasDRing: true,
    dRingCount: 2,
    affiliateUrl: "https://www.amazon.com/dp/B07YZWQPMT?tag=prepperevo-20",
    notes: "Integrated receiver hitch. High-lift compatible. Spare tire carrier version available separately.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

export function getBumperBrands(position?: BumperEntry["position"]): string[] {
  const filtered = position
    ? bumperDatabase.filter((b) => b.position === position)
    : bumperDatabase;
  return [...new Set(filtered.map((b) => b.brand))].sort();
}

export function getBumperModels(
  brand: string,
  position?: BumperEntry["position"]
): BumperEntry[] {
  return bumperDatabase
    .filter((b) => b.brand === brand && (position ? b.position === position : true))
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findBumper(id: string): BumperEntry | undefined {
  return bumperDatabase.find((b) => b.id === id);
}
