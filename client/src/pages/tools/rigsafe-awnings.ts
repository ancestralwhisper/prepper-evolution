// ─── RigSafe Awning Database ────────────────────────────────────────
// Real manufacturer specs for vehicle-mounted awnings.
//
// Sources:
//   Weight, coverage, type: Manufacturer spec sheets & product pages
//   Mounted bracket weight: Manufacturer data or ~10-15 lbs estimate
//   (most weight transfers to ground poles when deployed)

export interface AwningEntry {
  id: string;
  brand: string;
  model: string;
  type: "270" | "180" | "360" | "batwing";
  mountSide: "driver" | "passenger" | "either";  // which side the awning mounts / deploys from
  totalWeightLbs: number;
  mountedBracketWeightLbs: number;  // weight on rack when deployed
  deployedCoverageSqFt: number;
  hasWallKit: boolean;
  wallKitWeightLbs?: number;
  wallKitCreatesSleeping: boolean;
  wallKitSleeps?: number;
  affiliateUrl: string;
  notes?: string;
}

export const awningDatabase: AwningEntry[] = [
  // ─── OVS (Overland Vehicle Systems) ─────────────────────────────────

  {
    id: "ovs-nomadic-270-hd",
    brand: "OVS",
    model: "Nomadic 270 HD",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 72,
    mountedBracketWeightLbs: 15,
    deployedCoverageSqFt: 129,
    hasWallKit: true,
    wallKitWeightLbs: 22,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B09M3S1VK6?tag=prepperevo-20",
    notes: "Heavy-duty 270. Driver or passenger side. With walls creates enclosed ground shelter.",
  },
  {
    id: "ovs-nomadic-270-lt",
    brand: "OVS",
    model: "Nomadic 270 LT",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 40,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 80,
    hasWallKit: true,
    wallKitWeightLbs: 18,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B09M3RQZJP?tag=prepperevo-20",
    notes: "Lighter version of the 270. Slightly less coverage. Same wall kit.",
  },
  {
    id: "ovs-nomadic-180",
    brand: "OVS",
    model: "Nomadic 180",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 55,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 88,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B09KXYJ1Y5?tag=prepperevo-20",
    notes: "Side-mount 180-degree awning. Lighter and simpler than 270.",
  },

  // ─── 23ZERO ─────────────────────────────────────────────────────────

  {
    id: "23zero-peregrine-270",
    brand: "23Zero",
    model: "Peregrine 270",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 68,
    mountedBracketWeightLbs: 14,
    deployedCoverageSqFt: 120,
    hasWallKit: true,
    wallKitWeightLbs: 20,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B0CG3NXL8R?tag=prepperevo-20",
    notes: "Australian brand. Premium 270 with quick-deploy design.",
  },
  {
    id: "23zero-peregrine-180",
    brand: "23Zero",
    model: "Peregrine 180",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 32,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 50,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B0CG3QDGX1?tag=prepperevo-20",
    notes: "Compact 180 from 23Zero. Quick setup.",
  },

  // ─── ARB ────────────────────────────────────────────────────────────

  {
    id: "arb-2500-touring",
    brand: "ARB",
    model: "2500 Touring Awning",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 28,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 48,
    hasWallKit: true,
    wallKitWeightLbs: 12,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B002SRZJF4?tag=prepperevo-20",
    notes: "Industry standard 180 awning. Compact and reliable. Tons of accessories.",
  },

  // ─── IRONMAN ────────────────────────────────────────────────────────

  {
    id: "ironman-270-instant",
    brand: "Ironman",
    model: "270 Instant Awning",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 62,
    mountedBracketWeightLbs: 13,
    deployedCoverageSqFt: 110,
    hasWallKit: true,
    wallKitWeightLbs: 18,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B09H3RNV7Y?tag=prepperevo-20",
    notes: "Rapid-deploy 270. Spring-loaded arms. Sub-60-second setup.",
  },

  // ─── RHINO RACK ─────────────────────────────────────────────────────

  {
    id: "rhinorack-batwing",
    brand: "Rhino Rack",
    model: "Batwing Awning",
    type: "batwing",
    mountSide: "either",
    totalWeightLbs: 58,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 118,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B004G9DVVY?tag=prepperevo-20",
    notes: "270 style but 2-piece 'batwing' design. Mounts centrally on roof rack. Very popular.",
  },

  // ─── FRONT RUNNER ───────────────────────────────────────────────────

  {
    id: "frontrunner-easyout",
    brand: "Front Runner",
    model: "Easy-Out Awning",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 25,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 45,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B00UVG5JKC?tag=prepperevo-20",
    notes: "Compact 180. Designed for Front Runner racks but fits any T-slot.",
  },

  // ─── DARCHE ─────────────────────────────────────────────────────────

  {
    id: "darche-eclipse-270",
    brand: "Darche",
    model: "Eclipse 270",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 65,
    mountedBracketWeightLbs: 14,
    deployedCoverageSqFt: 115,
    hasWallKit: true,
    wallKitWeightLbs: 20,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B0B5BYH3KD?tag=prepperevo-20",
    notes: "Australian-designed. Heavy-duty canvas. Excellent wind resistance.",
  },

  // ─── TUFF STUFF ─────────────────────────────────────────────────────

  {
    id: "tuffstuff-270",
    brand: "Tuff Stuff",
    model: "270 Awning",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 58,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 105,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B0BTMXJR1K?tag=prepperevo-20",
    notes: "Budget 270 option. Good coverage for the price.",
  },

  // ─── CLEVERSHADE ────────────────────────────────────────────────────

  {
    id: "clevershade-270",
    brand: "Clevershade",
    model: "270",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 45,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 95,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B09VBHZ98Y?tag=prepperevo-20",
    notes: "Unique hinge design. Lightweight. Quick deploy. Australian brand.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

export function getAwningBrands(): string[] {
  return [...new Set(awningDatabase.map((a) => a.brand))].sort();
}

export function getAwningModels(brand: string): AwningEntry[] {
  return awningDatabase.filter((a) => a.brand === brand).sort((a, b) => a.model.localeCompare(b.model));
}

export function findAwning(id: string): AwningEntry | undefined {
  return awningDatabase.find((a) => a.id === id);
}
