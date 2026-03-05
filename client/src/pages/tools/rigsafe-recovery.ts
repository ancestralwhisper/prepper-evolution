// ─── RigSafe Recovery Gear Database ──────────────────────────────────────────
// Real manufacturer specs for vehicle recovery gear used on trucks and SUVs.
// UTVs NOT included — this is for full-size and mid-size vehicles only.
//
// Sources:
//   Weight: Manufacturer spec sheets, Amazon listings, retailer product pages
//   Board weights are per-pair (boards are sold and used in pairs)
//   Kit weights include bag and all contents

export interface RecoveryGearEntry {
  id: string;
  brand: string;
  model: string;
  weightLbs: number;
  type: "boards" | "jack" | "strap" | "shackle" | "kit";
  affiliateUrl: string;
  notes?: string;
}

export const recoveryDatabase: RecoveryGearEntry[] = [
  // ─── MAXTRAX ──────────────────────────────────────────────────────────

  {
    id: "maxtrax-mkii",
    brand: "Maxtrax",
    model: "MKII Recovery Boards",
    weightLbs: 15,
    type: "boards",
    affiliateUrl: "https://www.amazon.com/dp/B07K5HKWLN?tag=prepperevo-20",
    notes:
      "Weight is per pair (7.5 lbs each). 45\" x 13\" x 3.5\". Industry standard for sand, mud, and snow recovery.",
  },
  {
    id: "maxtrax-mini",
    brand: "Maxtrax",
    model: "Mini Recovery Boards",
    weightLbs: 8,
    type: "boards",
    affiliateUrl: "https://www.amazon.com/dp/B08BVWJ86D?tag=prepperevo-20",
    notes:
      "Weight is per pair (4 lbs each). Compact size for easier storage on smaller rigs. Includes jack pad feature.",
  },

  // ─── ARB ──────────────────────────────────────────────────────────────

  {
    id: "arb-tred-pro",
    brand: "ARB",
    model: "TRED Pro Recovery Boards",
    weightLbs: 18,
    type: "boards",
    affiliateUrl: "https://www.amazon.com/dp/B07FYVJ9BH?tag=prepperevo-20",
    notes:
      "Weight is per pair (~9 lbs each). 45.67\" x 12.99\" x 2.56\" per board. Hollow-tine design bites into terrain.",
  },
  {
    id: "arb-recovery-kit-rk9",
    brand: "ARB",
    model: "Premium Recovery Kit (RK9)",
    weightLbs: 35,
    type: "kit",
    affiliateUrl: "https://www.amazon.com/dp/B004P9C5ZA?tag=prepperevo-20",
    notes:
      "9-piece kit with snatch block, tree trunk protector, shackles, extension strap, recovery damper, and storage bag. Complete starter kit.",
  },

  // ─── HI-LIFT JACK ─────────────────────────────────────────────────────

  {
    id: "hilift-48-cast",
    brand: "Hi-Lift",
    model: "48\" All-Cast Jack (HL-485)",
    weightLbs: 30,
    type: "jack",
    affiliateUrl: "https://www.amazon.com/dp/B000688VNE?tag=prepperevo-20",
    notes:
      "4,660 lb rated / 7,000 lb tested capacity. Cast iron top and bottom. 48\" lift height. The go-to farm jack for overlanders.",
  },
  {
    id: "hilift-60-cast",
    brand: "Hi-Lift",
    model: "60\" All-Cast Jack (HL-605)",
    weightLbs: 33,
    type: "jack",
    affiliateUrl: "https://www.amazon.com/dp/B00042JJWE?tag=prepperevo-20",
    notes:
      "4,660 lb rated / 7,000 lb tested capacity. Extra 12\" of lift over 48\" model. Better for lifted trucks and high-clearance builds.",
  },

  // ─── FACTOR 55 ────────────────────────────────────────────────────────

  {
    id: "factor55-flatlink-e",
    brand: "Factor 55",
    model: "FlatLink E (Expert)",
    weightLbs: 1.6,
    type: "shackle",
    affiliateUrl: "https://www.amazon.com/dp/B0711S485P?tag=prepperevo-20",
    notes:
      "26 oz. Replaces conventional winch hook with a safer shackle/D-ring mount. 16,000 lb max load. 40,000+ lb failure strength.",
  },
  {
    id: "factor55-ultrahook",
    brand: "Factor 55",
    model: "UltraHook",
    weightLbs: 2,
    type: "shackle",
    affiliateUrl: "https://www.amazon.com/dp/B01E4AQ6KE?tag=prepperevo-20",
    notes:
      "32 oz. Closed-system shackle. 16,000 lb max load, 48,000 lb pin mount strength. Winch-line to soft shackle or strap attachment.",
  },

  // ─── BUBBA ROPE ───────────────────────────────────────────────────────

  {
    id: "bubbarope-7-8-30ft",
    brand: "Bubba Rope",
    model: "7/8\" x 30ft Kinetic Recovery Rope",
    weightLbs: 10,
    type: "strap",
    affiliateUrl: "https://www.amazon.com/dp/B007HYR85W?tag=prepperevo-20",
    notes:
      "28,600 lb breaking strength. Double-braided nylon with Gator-ize coating. Rated for 1/2-ton to 3/4-ton trucks.",
  },
  {
    id: "bubbarope-1in-30ft",
    brand: "Bubba Rope",
    model: "1\" x 30ft Kinetic Recovery Rope",
    weightLbs: 15,
    type: "strap",
    affiliateUrl: "https://www.amazon.com/dp/B007HYR8DU?tag=prepperevo-20",
    notes:
      "Heavier diameter for 3/4-ton and 1-ton trucks. Higher energy storage than 7/8\" version. Gator-ize coating resists mud and UV.",
  },

  // ─── SMITTYBILT ───────────────────────────────────────────────────────

  {
    id: "smittybilt-cc121",
    brand: "Smittybilt",
    model: "Recoil Recovery Rope CC121 (1\" x 30ft)",
    weightLbs: 5,
    type: "strap",
    affiliateUrl: "https://www.amazon.com/dp/B0BXXQWMG9?tag=prepperevo-20",
    notes:
      "30,000 lb capacity. Budget-friendly kinetic rope option. Good first rope before upgrading to Bubba Rope.",
  },

  // ─── WARN ─────────────────────────────────────────────────────────────

  {
    id: "warn-epic-kit-medium",
    brand: "Warn",
    model: "Medium-Duty Epic Recovery Kit (97565)",
    weightLbs: 25,
    type: "kit",
    affiliateUrl: "https://www.amazon.com/dp/B01N9456V8?tag=prepperevo-20",
    notes:
      "For winches up to 12,000 lbs. Includes snatch block, shackles, tree saver, extension strap, and bag. Made in USA.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getRecoveryBrands(): string[] {
  return [...new Set(recoveryDatabase.map((r) => r.brand))].sort();
}

export function getRecoveryModels(brand: string): RecoveryGearEntry[] {
  return recoveryDatabase
    .filter((r) => r.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findRecovery(id: string): RecoveryGearEntry | undefined {
  return recoveryDatabase.find((r) => r.id === id);
}
