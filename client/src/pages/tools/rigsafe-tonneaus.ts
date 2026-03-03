// ─── RigSafe Tonneau Cover Database ─────────────────────────────────
// Real manufacturer specs for tonneau covers used with bed rack setups.
//
// Sources:
//   Weight, type, ratings: Manufacturer spec sheets & product pages
//   Folded height: Measured or from manufacturer data
//   T-slot compatibility: Cross-referenced with rack manufacturers

export interface TonneauEntry {
  id: string;
  brand: string;
  model: string;
  type: "hard-fold" | "hard-roll" | "retractable" | "soft-fold" | "soft-roll";
  weightLbs: number;
  onTopCapacityLbs: number;      // weight it can support on top
  hasTSlots: boolean;
  foldedHeightIn: number;        // height when folded against cab
  compatibleRacks?: string[];    // rack IDs known compatible
  affiliateUrl: string;
  notes?: string;
}

export const tonneauDatabase: TonneauEntry[] = [
  // ─── BAKFlip ────────────────────────────────────────────────────────

  {
    id: "bakflip-mx4",
    brand: "BAKFlip",
    model: "MX4",
    type: "hard-fold",
    weightLbs: 52,
    onTopCapacityLbs: 400,
    hasTSlots: false,
    foldedHeightIn: 14,
    affiliateUrl: "https://www.amazon.com/dp/B074VH8BH5?tag=prepperevo-20",
    notes: "Industry standard hard-fold. Tri-fold. Flush mount. No T-slots.",
  },
  {
    id: "bakflip-mx4-ts",
    brand: "BAKFlip",
    model: "MX4 TS",
    type: "hard-fold",
    weightLbs: 55,
    onTopCapacityLbs: 400,
    hasTSlots: true,
    foldedHeightIn: 14,
    compatibleRacks: ["elevate-ts", "elevate-cs"],
    affiliateUrl: "https://www.amazon.com/dp/B0CGNZXLM6?tag=prepperevo-20",
    notes: "Same as MX4 with integrated T-slots. Designed for Elevate TS/CS racks.",
  },
  {
    id: "bakflip-revolver-x4s",
    brand: "BAKFlip",
    model: "Revolver X4s",
    type: "hard-roll",
    weightLbs: 68,
    onTopCapacityLbs: 500,
    hasTSlots: false,
    foldedHeightIn: 0,
    affiliateUrl: "https://www.amazon.com/dp/B09K3DKV12?tag=prepperevo-20",
    notes: "Rolling hard cover. Does not fold — rolls to cab. Strongest tonneau rated load.",
  },

  // ─── RETRAX ─────────────────────────────────────────────────────────

  {
    id: "retrax-xr",
    brand: "Retrax",
    model: "RetraxONE XR",
    type: "retractable",
    weightLbs: 48,
    onTopCapacityLbs: 350,
    hasTSlots: true,
    foldedHeightIn: 0,
    affiliateUrl: "https://www.amazon.com/dp/B084D7RW2W?tag=prepperevo-20",
    notes: "Retractable polycarbonate. Built-in T-slot rail. Retracts into canister at cab.",
  },
  {
    id: "retrax-powertrax-pro-xr",
    brand: "Retrax",
    model: "PowertraxPRO XR",
    type: "retractable",
    weightLbs: 62,
    onTopCapacityLbs: 350,
    hasTSlots: true,
    foldedHeightIn: 0,
    affiliateUrl: "https://www.amazon.com/dp/B084D8TLR6?tag=prepperevo-20",
    notes: "Electric-powered retractable. T-slot rail built in. Key fob control.",
  },

  // ─── ROLL-N-LOCK ────────────────────────────────────────────────────

  {
    id: "rollnlock-xt",
    brand: "Roll-N-Lock",
    model: "A-Series XT",
    type: "retractable",
    weightLbs: 56,
    onTopCapacityLbs: 400,
    hasTSlots: false,
    foldedHeightIn: 0,
    affiliateUrl: "https://www.amazon.com/dp/B00H9V7JXI?tag=prepperevo-20",
    notes: "Aluminum retractable. Key-lockable. Built-in drain system.",
  },
  {
    id: "rollnlock-m-series-xt",
    brand: "Roll-N-Lock",
    model: "M-Series XT",
    type: "retractable",
    weightLbs: 60,
    onTopCapacityLbs: 500,
    hasTSlots: false,
    foldedHeightIn: 0,
    affiliateUrl: "https://www.amazon.com/dp/B003YH9ZSM?tag=prepperevo-20",
    notes: "Premium retractable. Vinyl-over-aluminum construction. Weatherproof.",
  },

  // ─── TRUXEDO ────────────────────────────────────────────────────────

  {
    id: "truxedo-sentry-ct",
    brand: "TruXedo",
    model: "Sentry CT",
    type: "hard-roll",
    weightLbs: 45,
    onTopCapacityLbs: 250,
    hasTSlots: false,
    foldedHeightIn: 0,
    affiliateUrl: "https://www.amazon.com/dp/B07GKQB3D3?tag=prepperevo-20",
    notes: "Woven fabric with hard-panel core. Low-profile. Budget-friendly hard roll.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

export function getTonneauBrands(): string[] {
  return Array.from(new Set(tonneauDatabase.map((t) => t.brand))).sort();
}

export function getTonneauModels(brand: string): TonneauEntry[] {
  return tonneauDatabase.filter((t) => t.brand === brand).sort((a, b) => a.model.localeCompare(b.model));
}

export function findTonneau(id: string): TonneauEntry | undefined {
  return tonneauDatabase.find((t) => t.id === id);
}
