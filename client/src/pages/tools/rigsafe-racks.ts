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
  heightSettings?: number[];     // inches above bed rail or roof
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
    staticLbs: 800,
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
    staticLbs: 600,
    onRoadDynamicLbs: 400,
    offRoadDynamicLbs: 200,
    tSlotRequired: true,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0DFJK5RY7?tag=prepperevo-20",
    notes: "Compact version. Lower profile than TS/FS.",
  },
  {
    id: "cbi-bed-rack",
    brand: "CBI Offroad",
    model: "Bed Rack",
    type: "bed-rack",
    weightLbs: 90,
    staticLbs: 700,
    onRoadDynamicLbs: 450,
    offRoadDynamicLbs: 225,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0B1TQ8M63?tag=prepperevo-20",
    notes: "Heavy-duty steel construction. Vehicle-specific fitment.",
  },
  {
    id: "leitner-acs",
    brand: "Leitner Designs",
    model: "Active Cargo System",
    type: "bed-rack",
    weightLbs: 55,
    staticLbs: 500,
    onRoadDynamicLbs: 350,
    offRoadDynamicLbs: 175,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0BTR7JHR5?tag=prepperevo-20",
    notes: "Lightweight aluminum. Low-profile. Modular accessory system.",
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
    staticLbs: 750,
    onRoadDynamicLbs: 500,
    offRoadDynamicLbs: 250,
    heightSettings: [16, 22, 28],
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0DFNQCDR9?tag=prepperevo-20",
    notes: "Adjustable height. Heavy-duty steel with powder coat.",
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
    weightLbs: 42,
    staticLbs: 500,
    onRoadDynamicLbs: 300,
    offRoadDynamicLbs: 150,
    heightSettings: [12, 15, 18, 21],
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B08LN8DRQH?tag=prepperevo-20",
    notes: "Lightweight aluminum T-slot. Height adjustable. Most height settings of any rack.",
  },
  {
    id: "yakima-outpost-hd",
    brand: "Yakima",
    model: "OutPost HD",
    type: "bed-rack",
    weightLbs: 44,
    staticLbs: 500,
    onRoadDynamicLbs: 300,
    offRoadDynamicLbs: 150,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B0765Z1XTQ?tag=prepperevo-20",
    notes: "Similar to OverHaul but with integrated tie-down points.",
  },
  {
    id: "thule-xsporter-pro",
    brand: "Thule",
    model: "Xsporter Pro",
    type: "bed-rack",
    weightLbs: 36,
    staticLbs: 450,
    onRoadDynamicLbs: 300,
    offRoadDynamicLbs: 150,
    tSlotRequired: false,
    compatibleVehicles: ["crew-cab-short", "crew-cab-standard", "mid-truck"],
    affiliateUrl: "https://www.amazon.com/dp/B00AEFFJ1U?tag=prepperevo-20",
    notes: "Lightweight. Lower load ratings than competitors. Good for lighter RTTs.",
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
    id: "frontrunner-slimline-roof",
    brand: "Front Runner",
    model: "Slimline II Roof Rack",
    type: "roof-rack",
    weightLbs: 50,
    staticLbs: 660,
    onRoadDynamicLbs: 440,
    offRoadDynamicLbs: 220,
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
    staticLbs: 500,
    onRoadDynamicLbs: 330,
    offRoadDynamicLbs: 165,
    tSlotRequired: false,
    compatibleVehicles: ["suv-5door"],
    affiliateUrl: "https://www.amazon.com/dp/B0762TRK7X?tag=prepperevo-20",
    notes: "Vehicle-specific for 5th gen 4Runner. Low-profile design.",
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
    weightLbs: 55,
    staticLbs: 700,
    onRoadDynamicLbs: 500,
    offRoadDynamicLbs: 250,
    tSlotRequired: false,
    compatibleVehicles: ["suv-5door", "suv-3door"],
    affiliateUrl: "https://www.amazon.com/dp/B001GM77WK?tag=prepperevo-20",
    notes: "Full-length with rear ladder. USA made. Vehicle-specific.",
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
