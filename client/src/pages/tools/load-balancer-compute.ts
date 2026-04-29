// ─── Overland Load Balancer — Compute Engine ─────────────────────────
// Pure functions. No React. Deterministic and testable.
//
// Calculation chain:
//   1. Stock payload = GVWR − stock curb weight
//   2. Effective payload = stock payload − sum(installed upgrade weights)
//   3. Gear weight = sum(all placed gear items × qty)
//   4. Remaining payload = effective payload − gear weight
//   5. Axle distribution = zone-based weight allocation
//   6. Balance score = composite penalty model (0–100)
//   7. Warnings = threshold-based advisory messages

import type { LBVehicle } from "./load-balancer-vehicles";
import type { LBUpgrade } from "./load-balancer-upgrades";
import type { GearZone } from "./load-balancer-gear";

export const LB_VERSION = "v1.0";
export const LB_KEY = "pe-load-balancer";

export const LB_CHANGELOG: { version: string; date: string; changes: string[] }[] = [
  {
    version: "v1.0",
    date: "April 2026",
    changes: [
      "Initial release — full vehicle database 2000–present (60+ configurations)",
      "Upgrades deducted from stock payload before gear is loaded",
      "6-zone gear placement (cab, bed-fwd, bed-mid, bed-aft, roof, tongue)",
      "Front/rear and left/right axle balance with physics-based distribution",
      "Balance score 0–100 with color coding",
      "Vehicle Profile integration — reads pe-vehicle-profile for default vehicle",
      "SITREP integration for Ops Deck readiness dashboard",
    ],
  },
];

// ─── Types ─────────────────────────────────────────────────────────────

export interface InstalledUpgrade {
  upgradeId: string;
  name: string;
  weightLbs: number;
  affectsHighCG: boolean;
  qty: number;
}

export interface PlacedGearItem {
  id: string; // unique placement instance id
  gearItemId: string;
  name: string;
  weightLbs: number; // per unit weight
  qty: number;
  zone: GearZone;
  custom?: boolean;
}

export interface LBConfig {
  vehicleId: string | null;
  vehicleName: string;
  gvwrLbs: number;
  curbWeightLbs: number;
  stockPayloadLbs: number;
  wheelbaseIn: number;
  installedUpgrades: InstalledUpgrade[];
  placedGear: PlacedGearItem[];
  // manual overrides
  manualPayloadOverride: boolean;
  manualPayloadLbs: number | null;
}

export interface ZoneWeights {
  cab: number;
  "bed-fwd": number;
  "bed-mid": number;
  "bed-aft": number;
  roof: number;
  tongue: number;
}

export interface AxleBalance {
  frontLbs: number;
  rearLbs: number;
  frontPct: number;
  rearPct: number;
  leftPct: number;
  rightPct: number;
  rightLbs: number;
  leftLbs: number;
  cgHeightScore: number; // 0–100, higher = lower CG = better
}

export interface LBResult {
  // Payload chain
  stockPayloadLbs: number;
  upgradeWeightLbs: number;
  effectivePayloadLbs: number;
  gearWeightLbs: number;
  remainingPayloadLbs: number;
  payloadUsedPct: number;

  // Zones
  zoneWeights: ZoneWeights;
  totalGearLbs: number;

  // Balance
  axle: AxleBalance;
  balanceScore: number;

  // Upgrade high-CG flag
  hasHighCGUpgrades: boolean;
  highCGUpgradeWeight: number;

  // Warnings
  warnings: LBWarning[];
}

export interface LBWarning {
  id: string;
  level: "danger" | "warning" | "info";
  title: string;
  message: string;
}

// ─── Default config ────────────────────────────────────────────────────

export const defaultLBConfig: LBConfig = {
  vehicleId: null,
  vehicleName: "Your Vehicle",
  gvwrLbs: 6000,
  curbWeightLbs: 4500,
  stockPayloadLbs: 1500,
  wheelbaseIn: 130,
  installedUpgrades: [],
  placedGear: [],
  manualPayloadOverride: false,
  manualPayloadLbs: null,
};

// ─── Zone weight distribution model ────────────────────────────────────
// These coefficients determine what fraction of each zone's weight is
// distributed to front vs rear axle and left vs right side.
//
// Based on lever-arm physics simplified for usability:
//   - Cab interior: close to front axle (people, small gear)
//   - Bed-fwd: behind cab, roughly 20% of wheelbase from front axle
//   - Bed-mid: middle of bed, roughly 50% of wheelbase from front axle
//   - Bed-aft: rear of bed, roughly 80% of wheelbase from front axle
//   - Roof: treated like bed-mid but raises CG
//   - Tongue: 100% rear, all on hitch

const ZONE_FRONT_PCT: Record<GearZone, number> = {
  "cab": 0.65,       // cab weight near front axle
  "bed-fwd": 0.35,   // forward bed, still more rear but some front transfer
  "bed-mid": 0.20,   // center of bed
  "bed-aft": 0.08,   // near tailgate — almost all rear
  "roof": 0.22,      // roof roughly mid-vehicle
  "tongue": 0.00,    // tongue weight is 100% rear axle load
};

// Left/right split: absent specific placement, assume 50/50
// In practice users load asymmetrically — we flag when it matters
const ZONE_LEFT_PCT: Record<GearZone, number> = {
  "cab": 0.50,
  "bed-fwd": 0.50,
  "bed-mid": 0.50,
  "bed-aft": 0.50,
  "roof": 0.50,
  "tongue": 0.50,
};

// ─── Core compute functions ────────────────────────────────────────────

export function computeZoneWeights(gear: PlacedGearItem[]): ZoneWeights {
  const zones: ZoneWeights = {
    cab: 0,
    "bed-fwd": 0,
    "bed-mid": 0,
    "bed-aft": 0,
    roof: 0,
    tongue: 0,
  };
  for (const item of gear) {
    zones[item.zone] = (zones[item.zone] || 0) + item.weightLbs * item.qty;
  }
  return zones;
}

export function computeUpgradeWeight(upgrades: InstalledUpgrade[]): number {
  return upgrades.reduce((sum, u) => sum + u.weightLbs * u.qty, 0);
}

export function computeEffectivePayload(config: LBConfig): number {
  if (config.manualPayloadOverride && config.manualPayloadLbs !== null) {
    return config.manualPayloadLbs - computeUpgradeWeight(config.installedUpgrades);
  }
  const stock = config.gvwrLbs - config.curbWeightLbs;
  return stock - computeUpgradeWeight(config.installedUpgrades);
}

export function computeAxleBalance(
  zoneWeights: ZoneWeights,
  totalGear: number
): AxleBalance {
  let frontLbs = 0;
  let rearLbs = 0;
  let leftLbs = 0;
  let rightLbs = 0;

  const zones = Object.keys(zoneWeights) as GearZone[];
  for (const zone of zones) {
    const w = zoneWeights[zone];
    const frontFrac = ZONE_FRONT_PCT[zone];
    const leftFrac = ZONE_LEFT_PCT[zone];

    frontLbs += w * frontFrac;
    rearLbs += w * (1 - frontFrac);
    leftLbs += w * leftFrac;
    rightLbs += w * (1 - leftFrac);
  }

  const total = totalGear || 1; // prevent div/0

  return {
    frontLbs: Math.round(frontLbs),
    rearLbs: Math.round(rearLbs),
    frontPct: Math.round((frontLbs / total) * 100),
    rearPct: Math.round((rearLbs / total) * 100),
    leftLbs: Math.round(leftLbs),
    rightLbs: Math.round(rightLbs),
    leftPct: Math.round((leftLbs / total) * 100),
    rightPct: Math.round((rightLbs / total) * 100),
    cgHeightScore: 100, // placeholder; full CG height requires vehicle geometry
  };
}

export function computeBalanceScore(
  axle: AxleBalance,
  payloadUsedPct: number,
  zoneWeights: ZoneWeights,
  totalGear: number,
  highCGWeight: number
): number {
  let score = 100;

  // ── Front/rear penalty ─────────────────────────────────────────────
  // Ideal: 40–55% front. Each % outside this window = –2 pts (max –30)
  const frontPct = axle.frontPct;
  if (frontPct < 40) score -= Math.min(30, (40 - frontPct) * 2);
  if (frontPct > 55) score -= Math.min(30, (frontPct - 55) * 2);

  // ── Left/right penalty ─────────────────────────────────────────────
  // Ideal: 45–55% per side. Each % outside = –3 pts (max –20)
  const leftPct = axle.leftPct;
  if (leftPct < 45) score -= Math.min(20, (45 - leftPct) * 3);
  if (leftPct > 55) score -= Math.min(20, (leftPct - 55) * 3);

  // ── Roof / high-CG penalty ──────────────────────────────────────────
  if (totalGear > 0) {
    const roofPct = (zoneWeights.roof / totalGear) * 100;
    if (roofPct > 25) score -= 30;
    else if (roofPct > 15) score -= 15;
    else if (roofPct > 10) score -= 5;
  }

  // High-CG upgrades (RTT, roof racks, etc.) add additional penalty
  if (highCGWeight > 200) score -= 15;
  else if (highCGWeight > 100) score -= 8;

  // ── Payload usage penalty ──────────────────────────────────────────
  if (payloadUsedPct > 100) score -= 50;
  else if (payloadUsedPct > 90) score -= 25;
  else if (payloadUsedPct > 80) score -= 10;

  // ── Tongue weight penalty ──────────────────────────────────────────
  // Tongue weight on a receiver but no visible rear weight = rear-heavy
  if (zoneWeights.tongue > 200) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeWarnings(
  result: Pick<
    LBResult,
    | "effectivePayloadLbs"
    | "gearWeightLbs"
    | "remainingPayloadLbs"
    | "payloadUsedPct"
    | "axle"
    | "zoneWeights"
    | "totalGearLbs"
    | "balanceScore"
    | "hasHighCGUpgrades"
    | "highCGUpgradeWeight"
    | "upgradeWeightLbs"
  >
): LBWarning[] {
  const warnings: LBWarning[] = [];
  const {
    effectivePayloadLbs,
    gearWeightLbs,
    remainingPayloadLbs,
    payloadUsedPct,
    axle,
    zoneWeights,
    totalGearLbs,
    balanceScore,
    hasHighCGUpgrades,
    highCGUpgradeWeight,
    upgradeWeightLbs,
  } = result;

  // ── DANGER: Over payload ────────────────────────────────────────────
  if (payloadUsedPct > 100) {
    warnings.push({
      id: "over-payload",
      level: "danger",
      title: "Over Payload",
      message: `You are over payload by ${Math.round(gearWeightLbs - effectivePayloadLbs)} lbs. This is illegal to drive in most states and unsafe. Remove gear before leaving.`,
    });
  }

  // ── DANGER: Near payload limit ──────────────────────────────────────
  if (payloadUsedPct >= 90 && payloadUsedPct <= 100) {
    warnings.push({
      id: "near-limit",
      level: "danger",
      title: "Near Payload Limit",
      message: `Only ${Math.round(remainingPayloadLbs)} lbs of payload remaining. No margin for error. Reduce load before adding anything else.`,
    });
  }

  // ── WARNING: 75–90% payload used ───────────────────────────────────
  if (payloadUsedPct >= 75 && payloadUsedPct < 90) {
    warnings.push({
      id: "heavy-load",
      level: "warning",
      title: "Heavy Load",
      message: `Using ${Math.round(payloadUsedPct)}% of effective payload. Safe, but you have ${Math.round(remainingPayloadLbs)} lbs of margin. Watch for added weight (wet gear, extra water, passengers).`,
    });
  }

  // ── WARNING: Upgrades eating payload ───────────────────────────────
  if (upgradeWeightLbs > 400) {
    warnings.push({
      id: "heavy-build",
      level: "warning",
      title: "Heavy Build",
      message: `Your installed upgrades add ${Math.round(upgradeWeightLbs)} lbs to your rig — significantly reducing payload. This is common for built overlanders. Know your real capacity.`,
    });
  }

  // ── WARNING: Heavy rear bias ────────────────────────────────────────
  if (axle.rearPct > 70 && totalGearLbs > 100) {
    warnings.push({
      id: "rear-heavy",
      level: "warning",
      title: "Heavy Rear Bias",
      message: `${axle.rearPct}% of load is in the rear. Heavy rear bias can cause understeer, reduce braking effectiveness, and stress rear springs. Move heavier items forward when possible.`,
    });
  }

  // ── WARNING: Roof heavy ─────────────────────────────────────────────
  if (totalGearLbs > 0 && (zoneWeights.roof / totalGearLbs) > 0.20) {
    warnings.push({
      id: "top-heavy",
      level: "warning",
      title: "Top-Heavy Load",
      message: `${Math.round((zoneWeights.roof / totalGearLbs) * 100)}% of your gear weight is on the roof. High center of gravity affects cornering stability and rollover risk — especially off-camber.`,
    });
  }

  // ── WARNING: Tongue heavy ───────────────────────────────────────────
  if (zoneWeights.tongue > 300) {
    warnings.push({
      id: "tongue-heavy",
      level: "warning",
      title: "High Tongue Weight",
      message: `${Math.round(zoneWeights.tongue)} lbs on the hitch. This counts against GVWR and adds rear axle load. Ensure you're within your vehicle's tongue weight rating.`,
    });
  }

  // ── WARNING: High CG upgrades ───────────────────────────────────────
  if (hasHighCGUpgrades && highCGUpgradeWeight > 150) {
    warnings.push({
      id: "high-cg-upgrades",
      level: "warning",
      title: "Elevated Center of Gravity",
      message: `Your installed high-mount upgrades (RTT, roof rack, awning) add ${Math.round(highCGUpgradeWeight)} lbs at an elevated height. Drive conservatively on off-camber terrain and in high winds.`,
    });
  }

  // ── INFO: Poor balance score ────────────────────────────────────────
  if (balanceScore < 60 && totalGearLbs > 50) {
    warnings.push({
      id: "poor-balance",
      level: "info",
      title: "Load Balance Could Be Improved",
      message: `Balance score is ${balanceScore}/100. Review the distribution chart and shift heavier items forward and toward center to improve stability.`,
    });
  }

  // ── INFO: Effective payload is low ─────────────────────────────────
  if (effectivePayloadLbs < 500) {
    warnings.push({
      id: "low-effective-payload",
      level: "info",
      title: "Low Effective Payload",
      message: `After your installed upgrades, you only have ${Math.round(effectivePayloadLbs)} lbs of payload to work with. Budget carefully — passengers and water alone can consume this quickly.`,
    });
  }

  // ── INFO: Good balance ──────────────────────────────────────────────
  if (balanceScore >= 85 && totalGearLbs > 100) {
    warnings.push({
      id: "good-balance",
      level: "info",
      title: "Well Balanced Load",
      message: `Balance score ${balanceScore}/100 — your load distribution looks solid. Secure everything and check that nothing shifts on rough terrain.`,
    });
  }

  return warnings;
}

// ─── Main compute function ─────────────────────────────────────────────

export function computeAll(config: LBConfig): LBResult {
  const upgradeWeightLbs = computeUpgradeWeight(config.installedUpgrades);
  const effectivePayloadLbs = computeEffectivePayload(config);
  const zoneWeights = computeZoneWeights(config.placedGear);
  const totalGearLbs = Object.values(zoneWeights).reduce((s, v) => s + v, 0);
  const gearWeightLbs = totalGearLbs;
  const remainingPayloadLbs = effectivePayloadLbs - gearWeightLbs;
  const payloadUsedPct = effectivePayloadLbs > 0
    ? Math.round((gearWeightLbs / effectivePayloadLbs) * 100)
    : 0;

  const axle = computeAxleBalance(zoneWeights, totalGearLbs);

  const highCGUpgrades = config.installedUpgrades.filter((u) => u.affectsHighCG);
  const highCGUpgradeWeight = highCGUpgrades.reduce(
    (s, u) => s + u.weightLbs * u.qty,
    0
  );
  const hasHighCGUpgrades = highCGUpgrades.length > 0;

  const balanceScore = computeBalanceScore(
    axle,
    payloadUsedPct,
    zoneWeights,
    totalGearLbs,
    highCGUpgradeWeight
  );

  const stockPayloadLbs = config.gvwrLbs - config.curbWeightLbs;

  const partialResult = {
    effectivePayloadLbs,
    gearWeightLbs,
    remainingPayloadLbs,
    payloadUsedPct,
    axle,
    zoneWeights,
    totalGearLbs,
    balanceScore,
    hasHighCGUpgrades,
    highCGUpgradeWeight,
    upgradeWeightLbs,
  };

  const warnings = computeWarnings(partialResult);

  return {
    stockPayloadLbs,
    upgradeWeightLbs,
    effectivePayloadLbs,
    gearWeightLbs,
    remainingPayloadLbs,
    payloadUsedPct,
    zoneWeights,
    totalGearLbs,
    axle,
    balanceScore,
    hasHighCGUpgrades,
    highCGUpgradeWeight,
    warnings,
  };
}

// ─── Score color helpers ───────────────────────────────────────────────

export function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function scoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-100 border-green-300";
  if (score >= 60) return "bg-yellow-100 border-yellow-300";
  return "bg-red-100 border-red-300";
}

export function payloadColor(pct: number): string {
  if (pct > 100) return "text-red-600";
  if (pct >= 85) return "text-orange-600";
  if (pct >= 70) return "text-yellow-600";
  return "text-green-600";
}

export function payloadBarColor(pct: number): string {
  if (pct > 100) return "bg-red-500";
  if (pct >= 85) return "bg-orange-500";
  if (pct >= 70) return "bg-yellow-500";
  return "bg-green-500";
}

// ─── SITREP integration ────────────────────────────────────────────────
// Returns a readiness score for the SITREP Ops Deck dashboard

export function getSitrepScore(config: LBConfig): {
  score: number;
  label: string;
  detail: string;
} {
  if (!config.vehicleId && config.placedGear.length === 0) {
    return { score: 0, label: "Not Configured", detail: "No vehicle or gear loaded." };
  }

  const result = computeAll(config);

  if (result.payloadUsedPct > 100) {
    return {
      score: 20,
      label: "Over Payload",
      detail: `Overloaded by ${Math.round(result.gearWeightLbs - result.effectivePayloadLbs)} lbs.`,
    };
  }

  if (result.effectivePayloadLbs < 200) {
    return {
      score: 40,
      label: "Critically Limited",
      detail: `Only ${Math.round(result.effectivePayloadLbs)} lbs effective payload after mods.`,
    };
  }

  const score = Math.round(
    (result.balanceScore * 0.5) + (Math.max(0, 100 - result.payloadUsedPct) * 0.5)
  );

  return {
    score,
    label: score >= 80 ? "Ready" : score >= 60 ? "Marginal" : "Needs Attention",
    detail: `Balance ${result.balanceScore}/100 — ${Math.round(result.remainingPayloadLbs)} lbs remaining.`,
  };
}
