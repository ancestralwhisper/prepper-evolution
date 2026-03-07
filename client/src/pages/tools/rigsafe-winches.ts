// ─── RigSafe Winch Database ──────────────────────────────────────────
// Real manufacturer specs for electric recovery winches.
// All entries are truck/SUV bumper-mount winches (NOT UTV/ATV).
//
// Sources:
//   Weight & ratings: Manufacturer spec sheets, Amazon listings, retailer specs
//   Series-wound motors: Higher amp draw, better performance under sustained load
//   Permanent-magnet motors: Lighter, lower amp draw, best for occasional use
//   Typical weight range: 55–100 lbs depending on capacity and motor type
//   Note: Synthetic rope is lighter than wire; wire rope listed weights include drum + rope

export interface WinchEntry {
  id: string;
  brand: string;
  model: string;
  weightLbs: number;
  pullCapacityLbs: number;
  ropeType: "wire" | "synthetic";
  motorType: "series-wound" | "permanent-magnet";
  affiliateUrl: string;
  notes?: string;
}

export const winchDatabase: WinchEntry[] = [
  // ─── WARN ────────────────────────────────────────────────────────────

  {
    id: "warn-vr-evo-8s",
    brand: "Warn",
    model: "VR EVO 8-S",
    weightLbs: 72,
    pullCapacityLbs: 8000,
    ropeType: "synthetic",
    motorType: "series-wound",
    affiliateUrl: "https://www.amazon.com/dp/B07SKL787Q?tag=prepperevo-20",
    notes: "Part# 103251. 90 ft 3/8\" Spydura synthetic rope. IP68 waterproof. Best fit for 8K bumpers. Corded remote.",
  },
  {
    id: "warn-vr-evo-10s",
    brand: "Warn",
    model: "VR EVO 10-S",
    weightLbs: 73,
    pullCapacityLbs: 10000,
    ropeType: "synthetic",
    motorType: "series-wound",
    affiliateUrl: "https://www.amazon.com/dp/B07SKJBN25?tag=prepperevo-20",
    notes: "Part# 103253. 90 ft 3/8\" Spydura rope. IP68. Most popular size for mid-trucks and SUVs. Corded remote.",
  },
  {
    id: "warn-zeon-10s",
    brand: "Warn",
    model: "Zeon 10-S",
    weightLbs: 75,
    pullCapacityLbs: 10000,
    ropeType: "synthetic",
    motorType: "series-wound",
    affiliateUrl: "https://www.amazon.com/dp/B00AAKFESS?tag=prepperevo-20",
    notes: "Part# 89611. Premium series-wound motor handles sustained pulls better than VR EVO. Wireless remote included.",
  },
  {
    id: "warn-zeon-12s",
    brand: "Warn",
    model: "Zeon 12-S",
    weightLbs: 80,
    pullCapacityLbs: 12000,
    ropeType: "synthetic",
    motorType: "series-wound",
    affiliateUrl: "https://www.amazon.com/dp/B0185QO65A?tag=prepperevo-20",
    notes: "Part# 95950. Heavy-duty 12K series-wound. Built for full-size trucks and large SUVs. Wireless remote.",
  },
  {
    id: "warn-tabor-10k",
    brand: "Warn",
    model: "Tabor 10-K",
    weightLbs: 89,
    pullCapacityLbs: 10000,
    ropeType: "wire",
    motorType: "series-wound",
    affiliateUrl: "https://www.amazon.com/dp/B006PVFYXO?tag=prepperevo-20",
    notes: "Part# 88395. Wire rope version of the Tabor series. Budget entry into Warn lineup. Roller fairlead included.",
  },

  // ─── SMITTYBILT ──────────────────────────────────────────────────────

  {
    id: "smittybilt-x2o-10k",
    brand: "Smittybilt",
    model: "X2O GEN2 10K",
    weightLbs: 67,
    pullCapacityLbs: 10000,
    ropeType: "synthetic",
    motorType: "series-wound",
    affiliateUrl: "https://www.amazon.com/dp/B00K150VAI?tag=prepperevo-20",
    notes: "Part# 98510. IP67 waterproof. Wireless remote standard. Popular budget alternative to Warn. 6.6 HP motor.",
  },
  {
    id: "smittybilt-xrc-9500",
    brand: "Smittybilt",
    model: "XRC 9.5K",
    weightLbs: 64,
    pullCapacityLbs: 9500,
    ropeType: "wire",
    motorType: "series-wound",
    affiliateUrl: "https://www.amazon.com/dp/B002UKLDL8?tag=prepperevo-20",
    notes: "Part# 97495. Wire rope entry-level winch. Roller fairlead included. Good budget choice for lighter rigs.",
  },

  // ─── BADLANDS (Harbor Freight) ────────────────────────────────────────

  {
    id: "badlands-zxr-12000",
    brand: "Badlands",
    model: "ZXR 12000",
    weightLbs: 86,
    pullCapacityLbs: 12000,
    ropeType: "wire",
    motorType: "series-wound",
    affiliateUrl: "https://www.amazon.com/dp/B0793GSR78?tag=prepperevo-20",
    notes: "IP66 rated. Automatic load-holding brake. Best value 12K winch. Wire rope. Harbor Freight house brand.",
  },
  {
    id: "badlands-apex-12000",
    brand: "Badlands",
    model: "Apex 12000",
    weightLbs: 79,
    pullCapacityLbs: 12000,
    ropeType: "synthetic",
    motorType: "series-wound",
    affiliateUrl: "#",
    notes: "Upgraded version of ZXR with synthetic rope. IP67 waterproof. Wireless remote. Harbor Freight exclusive.",
  },

  // ─── SUPERWINCH ──────────────────────────────────────────────────────

  {
    id: "superwinch-tiger-shark-9500",
    brand: "Superwinch",
    model: "Tiger Shark 9500",
    weightLbs: 82,
    pullCapacityLbs: 9500,
    ropeType: "wire",
    motorType: "series-wound",
    affiliateUrl: "https://www.amazon.com/dp/B008JCW9GY?tag=prepperevo-20",
    notes: "Part# 1595200. 95 ft wire rope. Roller fairlead. Sealed motor. Solid mid-tier option for Jeep and truck.",
  },
  {
    id: "superwinch-tiger-shark-9500sr",
    brand: "Superwinch",
    model: "Tiger Shark 9500SR",
    weightLbs: 79,
    pullCapacityLbs: 9500,
    ropeType: "synthetic",
    motorType: "series-wound",
    affiliateUrl: "#",
    notes: "Part# 1595201. Same as Tiger Shark 9500 but with synthetic rope and aluminum hawse fairlead.",
  },

  // ─── ROUGH COUNTRY ──────────────────────────────────────────────────

  {
    id: "rough-country-pro12000s",
    brand: "Rough Country",
    model: "PRO 12000-S",
    weightLbs: 64,
    pullCapacityLbs: 12000,
    ropeType: "synthetic",
    motorType: "permanent-magnet",
    affiliateUrl: "https://www.amazon.com/dp/B00B8TWL5Y?tag=prepperevo-20",
    notes: "Part# PRO12000S. Lightweight for a 12K winch. 100 ft synthetic rope. Wireless remote. Budget full-size option.",
  },

  // ─── ENGO ────────────────────────────────────────────────────────────

  {
    id: "engo-sr10s",
    brand: "Engo",
    model: "SR10S",
    weightLbs: 64,
    pullCapacityLbs: 10000,
    ropeType: "synthetic",
    motorType: "series-wound",
    affiliateUrl: "https://www.amazon.com/dp/B01NC0F5GT?tag=prepperevo-20",
    notes: "Part# 97-10000S. 3-stage planetary gear train. Polished aluminum hawse fairlead. Corded + wireless remotes. Underrated brand.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

export function getWinchBrands(): string[] {
  return [...new Set(winchDatabase.map((w) => w.brand))].sort();
}

export function getWinchModels(brand: string): WinchEntry[] {
  return winchDatabase
    .filter((w) => w.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findWinch(id: string): WinchEntry | undefined {
  return winchDatabase.find((w) => w.id === id);
}
