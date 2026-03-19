// ─── RigSafe Rack Database ──────────────────────────────────────────
// Real manufacturer specs for bed racks, roof racks, and cab racks.
//
// Sources:
//   Weight & ratings: Manufacturer spec sheets / product pages
//   Static: Published static load rating (tent + people sleeping)
//   On-road dynamic: Published moving load rating (highway driving)
//   Off-road dynamic: Published off-road rating (trail driving)
//   Note: If manufacturer only publishes one "dynamic" rating,
//   we use that for on-road and derate 75% for off-road estimate.

export interface RackEntry {
  id: string;
  brand: string;
  model: string;
  type: "bed-rack" | "roof-rack" | "cab-rack";
  weightLbs: number;
  staticLbs: number;
  onRoadDynamicLbs: number;
  offRoadDynamicLbs: number;
  heightSettings?: number[];           // inches above bed rail or roof
  crossbarHeightAboveRoofIn?: number;  // roof racks only: how high crossbar sits above roof surface
  tSlotRequired: boolean;
  compatibleVehicles?: string[]; // "all" or specific body types
  affiliateUrl: string;
  notes?: string;
}

export const rackDatabase: RackEntry[] = [
  // ─── BED RACKS ──────────────────────────────────────────────────────

  {
    id: "elevate-ts",
    brand: "RealTruck",
    model: "Elevate TS",
    type: "bed-rack",
    weightLbs: 75,
    staticLbs: 750,
    onRoadDynamicLbs: 500,
    offRoadDynamicLbs: 250,
    heightSettings: [18, 23, 28],
    tSlotRequired: true,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0DFJGLRN9?tag=prepperevo-20",
    notes: "3 height settings. Requires T-slot tonneau (BAKFlip MX4 TS, etc). Most popular adjustable bed rack.",
  },
  {
    id: "elevate-fs",
    brand: "RealTruck",
    model: "Elevate FS",
    type: "bed-rack",
    weightLbs: 85,
    staticLbs: 750,
    onRoadDynamicLbs: 500,
    offRoadDynamicLbs: 250,
    heightSettings: [18, 23, 28],
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0DFJH62G5?tag=prepperevo-20",
    notes: "Full-size version of Elevate. No tonneau required. Bolts to bed rail.",
  },
  {
    id: "elevate-cs",
    brand: "RealTruck",
    model: "Elevate CS",
    type: "bed-rack",
    weightLbs: 65,
    staticLbs: 750,
    onRoadDynamicLbs: 500,
    offRoadDynamicLbs: 250,
    heightSettings: [19, 23, 27.25],
    tSlotRequired: true,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0DFJK5RY7?tag=prepperevo-20",
    notes: "Compact version. Shorter crossbars (67\") than TS/FS (76\"). Heights: 19/23/27.25 in. RealTruck explicitly labels 27.25\" as the 'Maximum Cab Clearance' setting. Requires Elevate TS rails or T-slot tonneau (e.g. BAKFlip MX4 TS). Part #1118570.",
  },
  {
    id: "cbi-bed-rack",
    brand: "CBI Offroad",
    model: "Bed Rack",
    type: "bed-rack",
    weightLbs: 110,
    staticLbs: 900,
    onRoadDynamicLbs: 500,
    offRoadDynamicLbs: 250,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0B1TQ8M63?tag=prepperevo-20",
    notes: "12-gauge steel construction. 900 lb static rating. Vehicle-specific fitment.",
  },
  {
    id: "leitner-acs",
    brand: "Leitner Designs",
    model: "Active Cargo System Forged",
    type: "bed-rack",
    weightLbs: 85,
    staticLbs: 1400,
    onRoadDynamicLbs: 800,
    offRoadDynamicLbs: 400,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0BTR7JHR5?tag=prepperevo-20",
    notes: "ACS Forged — aluminum alloy, Grade 10.9 fasteners, 2\" HD load bars. Strongest ACS variant.",
  },
  {
    id: "frontrunner-slimline-bed",
    brand: "Front Runner",
    model: "Slimline II Bed Rack",
    type: "bed-rack",
    weightLbs: 60,
    staticLbs: 660,
    onRoadDynamicLbs: 440,
    offRoadDynamicLbs: 220,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B07NQ3KLCF?tag=prepperevo-20",
    notes: "T-slot extrusion system. Tons of mounting options. Popular worldwide.",
  },
  {
    id: "trukd-v2",
    brand: "TRUKD",
    model: "V2 Bed Rack",
    type: "bed-rack",
    weightLbs: 80,
    staticLbs: 1000,
    onRoadDynamicLbs: 300,
    offRoadDynamicLbs: 150,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0DFNQCDR9?tag=prepperevo-20",
    notes: "304 stainless steel + 5052 aluminum. 1000 lb static / 300 lb dynamic (150 per bar). Sold in fixed heights: 6.5/12.5/18.5/24.5 in.",
  },
  {
    id: "uptop-alpha",
    brand: "Uptop Overland",
    model: "Alpha Bed Rack",
    type: "bed-rack",
    weightLbs: 70,
    staticLbs: 600,
    onRoadDynamicLbs: 400,
    offRoadDynamicLbs: 200,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B09V7K8D26?tag=prepperevo-20",
    notes: "Aluminum construction. USA made. Clean design.",
  },
  {
    id: "uptop-bravo",
    brand: "Uptop Overland",
    model: "Bravo Bed Rack",
    type: "bed-rack",
    weightLbs: 85,
    staticLbs: 750,
    onRoadDynamicLbs: 500,
    offRoadDynamicLbs: 250,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B09V7L9NW3?tag=prepperevo-20",
    notes: "Full-height version with side rails. Taller than Alpha.",
  },
  {
    id: "yakima-overhaul-hd",
    brand: "Yakima",
    model: "OverHaul HD",
    type: "bed-rack",
    weightLbs: 51,
    staticLbs: 800,
    onRoadDynamicLbs: 500,
    offRoadDynamicLbs: 300,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B08LN8DRQH?tag=prepperevo-20",
    notes: "Aluminum T-slot. Continuously adjustable 19\"-30\". 800 lb static w/ crossbar spread >36\". SKS locks.",
  },
  {
    id: "yakima-outpost-hd",
    brand: "Yakima",
    model: "OutPost HD",
    type: "bed-rack",
    weightLbs: 39,
    staticLbs: 800,
    onRoadDynamicLbs: 500,
    offRoadDynamicLbs: 300,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0765Z1XTQ?tag=prepperevo-20",
    notes: "Mid-height (13\" above bed). QuickChange attachment. Integrated tie-down points.",
  },
  {
    id: "thule-xsporter-pro",
    brand: "Thule",
    model: "Xsporter Pro",
    type: "bed-rack",
    weightLbs: 36,
    staticLbs: 600,
    onRoadDynamicLbs: 450,
    offRoadDynamicLbs: 225,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B00AEFFJ1U?tag=prepperevo-20",
    notes: "Lightweight aluminum. 450 lb dynamic capacity (Thule rating). 32 height positions. Good for lighter RTTs.",
  },
  {
    id: "putnam-bed-rack",
    brand: "Putnam Fab",
    model: "Bed Rack",
    type: "bed-rack",
    weightLbs: 95,
    staticLbs: 800,
    onRoadDynamicLbs: 600,
    offRoadDynamicLbs: 300,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0CGMQ76D5?tag=prepperevo-20",
    notes: "Heaviest duty option. Steel. Built for heavy hardshell tents.",
  },
  {
    id: "prinsu-bed-rack",
    brand: "Prinsu",
    model: "Bed Rack",
    type: "bed-rack",
    weightLbs: 50,
    staticLbs: 550,
    onRoadDynamicLbs: 350,
    offRoadDynamicLbs: 175,
    tSlotRequired: false,
    compatibleVehicles: ["mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0B2N5N2LJ?tag=prepperevo-20",
    notes: "Popular for Tacoma and Tundra. Aluminum T-slot design.",
  },

  // ─── ROOF RACKS ─────────────────────────────────────────────────────

  {
    id: "ceros-low-profile",
    brand: "Go Rhino / RealTruck",
    model: "CEROS Low Profile Roof Rack",
    type: "roof-rack",
    weightLbs: 55,
    staticLbs: 500,
    onRoadDynamicLbs: 165,
    offRoadDynamicLbs: 110,
    crossbarHeightAboveRoofIn: 3,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck", "suv-5door"],
    affiliateUrl: "https://www.amazon.com/dp/B0DFJGLRN9?tag=prepperevo-20",
    notes: "Part GRH-5933110T. Rack length 70\" (front-to-back), surface width 54.5\". Front fairing peaks at ~6\" but angles down toward rear — crossbar/rail height at rear (tent clearance zone) is ~3\". Does NOT extend over the bed — cab section only.",
  },
  {
    id: "thule-wingbar-evo",
    brand: "Thule",
    model: "WingBar Evo + Evo Flush Feet",
    type: "roof-rack",
    weightLbs: 23,
    staticLbs: 330,
    onRoadDynamicLbs: 165,
    offRoadDynamicLbs: 110,
    crossbarHeightAboveRoofIn: 2.5,
    tSlotRequired: false,
    compatibleVehicles: ["crossover", "suv-5door", "suv-3door"],
    affiliateUrl: "https://www.amazon.com/dp/B08MBQ12FY?tag=prepperevo-20",
    notes: "Most popular naked-roof crossbar system. Evo Flush feet clamp to door frame — no factory rails needed. 165 lb dynamic total. Vehicle-specific fit kits sold separately (Thule Kit number varies by make/model/year).",
  },
  {
    id: "yakima-streamline",
    brand: "Yakima",
    model: "StreamLine + TimberLine Towers",
    type: "roof-rack",
    weightLbs: 22,
    staticLbs: 330,
    onRoadDynamicLbs: 165,
    offRoadDynamicLbs: 110,
    crossbarHeightAboveRoofIn: 3,
    tSlotRequired: false,
    compatibleVehicles: ["crossover", "suv-5door", "suv-3door"],
    affiliateUrl: "https://www.amazon.com/dp/B000BKRFUM?tag=prepperevo-20",
    notes: "Yakima's answer to Thule WingBar Evo. TimberLine towers clamp to door frame on naked roofs. StreamLine bars have T-slot channel for accessories. 165 lb dynamic. Vehicle-specific landing pad kits required.",
  },
  {
    id: "frontrunner-slimline-roof",
    brand: "Front Runner",
    model: "Slimline II Roof Rack",
    type: "roof-rack",
    weightLbs: 50,
    staticLbs: 660,
    onRoadDynamicLbs: 440,
    offRoadDynamicLbs: 220,
    crossbarHeightAboveRoofIn: 4,
    tSlotRequired: false,
    compatibleVehicles: ["suv-5door", "suv-3door", "crossover"],
    affiliateUrl: "https://www.amazon.com/dp/B07NQBJK3C?tag=prepperevo-20",
    notes: "Most popular overland roof rack worldwide. Vehicle-specific mounting kits.",
  },
  {
    id: "prinsu-roof-4runner",
    brand: "Prinsu",
    model: "Roof Rack (4Runner)",
    type: "roof-rack",
    weightLbs: 35,
    staticLbs: 1000,
    onRoadDynamicLbs: 600,
    offRoadDynamicLbs: 300,
    crossbarHeightAboveRoofIn: 3,
    tSlotRequired: false,
    compatibleVehicles: ["suv-5door"],
    affiliateUrl: "https://www.amazon.com/dp/B0762TRK7X?tag=prepperevo-20",
    notes: "Vehicle-specific for 5th gen 4Runner. Low-profile design. 1000 lb static / 600 lb dynamic (field tested).",
  },
  {
    id: "rhino-rack-pioneer",
    brand: "Rhino Rack",
    model: "Pioneer Platform",
    type: "roof-rack",
    weightLbs: 45,
    staticLbs: 660,
    onRoadDynamicLbs: 440,
    offRoadDynamicLbs: 220,
    crossbarHeightAboveRoofIn: 4.5,
    tSlotRequired: false,
    compatibleVehicles: ["suv-5door", "suv-3door", "crossover", "van"],
    affiliateUrl: "https://www.amazon.com/dp/B07CSLZKV1?tag=prepperevo-20",
    notes: "Full-length platform rack. Modular accessory system.",
  },
  {
    id: "arb-base-rack",
    brand: "ARB",
    model: "BASE Rack",
    type: "roof-rack",
    weightLbs: 40,
    staticLbs: 660,
    onRoadDynamicLbs: 440,
    offRoadDynamicLbs: 220,
    crossbarHeightAboveRoofIn: 3,
    tSlotRequired: false,
    compatibleVehicles: ["suv-5door", "suv-3door"],
    affiliateUrl: "https://www.amazon.com/dp/B08GKZZY8V?tag=prepperevo-20",
    notes: "Slim, wind-cutting profile. Integrated mounting points.",
  },
  {
    id: "gobi-stealth-roof",
    brand: "Gobi",
    model: "Stealth Roof Rack",
    type: "roof-rack",
    weightLbs: 66,
    staticLbs: 800,
    onRoadDynamicLbs: 300,
    offRoadDynamicLbs: 150,
    crossbarHeightAboveRoofIn: 4,
    tSlotRequired: false,
    compatibleVehicles: ["suv-5door", "suv-3door"],
    affiliateUrl: "https://www.amazon.com/dp/B001GM77WK?tag=prepperevo-20",
    notes: "Fully welded, no-drill mount. 800 lb static / 300 lb dynamic. Rear ladder. USA made.",
  },
  {
    id: "gobi-stealth-bed",
    brand: "Gobi",
    model: "Stealth Bed Rack",
    type: "bed-rack",
    weightLbs: 65,
    staticLbs: 600,
    onRoadDynamicLbs: 400,
    offRoadDynamicLbs: 200,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B001GM77WK?tag=prepperevo-20",
    notes: "Matching design with Gobi roof racks. Integrated tie-downs.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

export function getRacksByType(type: RackEntry["type"]): RackEntry[] {
  return rackDatabase.filter((r) => r.type === type);
}

export function getRackBrands(type?: RackEntry["type"]): string[] {
  const filtered = type ? rackDatabase.filter((r) => r.type === type) : rackDatabase;
  return [...new Set(filtered.map((r) => r.brand))].sort();
}

export function getRackModels(brand: string, type?: RackEntry["type"]): RackEntry[] {
  return rackDatabase
    .filter((r) => r.brand === brand && (type ? r.type === type : true))
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findRack(id: string): RackEntry | undefined {
  return rackDatabase.find((r) => r.id === id);
}
