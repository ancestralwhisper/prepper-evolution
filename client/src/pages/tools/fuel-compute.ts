import type {
  TerrainType, TripSegment, SegmentResult, TripResult,
  RigConditions, HeadwindLevel, AltitudeBand, LiftHeight,
} from "./fuel-types";

export const terrainLabels: Record<TerrainType, string> = {
  highway: "Highway / Interstate",
  city: "City / Suburban",
  gravel: "Gravel / Maintained Dirt",
  dirt: "Unmaintained Dirt / Fire Road",
  sand: "Sand (aired down)",
  mud: "Mud / Wet Trail",
  "rock-crawl": "Rock Crawl / Technical",
  snow: "Snow / Ice",
};

export const terrainIcons: Record<TerrainType, string> = {
  highway: "\u{1F6E3}\u{FE0F}",
  city: "\u{1F3D9}\u{FE0F}",
  gravel: "\u{1FAA8}",
  dirt: "\u{1F332}",
  sand: "\u{1F3DC}\u{FE0F}",
  mud: "\u{1F4A7}",
  "rock-crawl": "\u26F0\u{FE0F}",
  snow: "\u2744\u{FE0F}",
};

export const terrainMpgMultiplier: Record<TerrainType, number> = {
  highway: 1.0,
  city: 0.82,
  gravel: 0.78,
  dirt: 0.68,
  sand: 0.50,
  mud: 0.45,
  "rock-crawl": 0.30,
  snow: 0.62,
};

export const terrainDefaultSpeed: Record<TerrainType, number> = {
  highway: 65,
  city: 30,
  gravel: 35,
  dirt: 25,
  sand: 15,
  mud: 10,
  "rock-crawl": 5,
  snow: 25,
};

const ELEVATION_PENALTY_PER_1000FT = 0.15;
const MAX_ELEVATION_PENALTY = 0.60;

export function speedEfficiency(mph: number): number {
  if (mph <= 0) return 1.0;
  if (mph <= 5) return 0.40;
  if (mph <= 15) return 0.55;
  if (mph <= 25) return 0.72;
  if (mph <= 35) return 0.85;
  if (mph <= 45) return 0.95;
  if (mph <= 55) return 1.0;
  if (mph <= 65) return 0.95;
  if (mph <= 75) return 0.88;
  return 0.80;
}

export function temperaturePenalty(climateZone: string | null): number {
  if (!climateZone) return 1.0;
  switch (climateZone) {
    case "cold": return 0.90;
    case "temperate": return 1.0;
    case "hot-humid": return 0.96;
    case "hot-arid": return 0.95;
    default: return 1.0;
  }
}

const RESERVE_PCT = 0.10;

export const JERRY_CAN_WEIGHT_LBS = 42;
export const JERRY_CAN_GAL = 5;
export const MPG_PENALTY_PER_100LBS = 0.01;

export function auxFuelMpgPenalty(jerryCans: number, baseMpg: number): number {
  if (jerryCans <= 0) return baseMpg;
  const extraWeight = jerryCans * JERRY_CAN_WEIGHT_LBS;
  const penalty = (extraWeight / 100) * MPG_PENALTY_PER_100LBS;
  return Math.round(baseMpg * (1 - penalty) * 10) / 10;
}

// ─── Rig & Conditions Penalty Constants ──────────────────────────────

/** MPG multiplier by lift height (same as vehicle-types.ts) */
const LIFT_MPG_PENALTY: Record<string, number> = {
  "0": 1.0, "1": 0.985, "2": 0.97, "2.5": 0.955,
  "3": 0.93, "4": 0.91, "5": 0.88, "6": 0.85,
};

/** MPG multiplier by tire type (same as vehicle-types.ts) */
const TIRE_TYPE_PENALTY: Record<string, number> = {
  highway: 1.0, "all-terrain": 0.92, "mud-terrain": 0.85, hybrid: 0.95,
};

/** 2.5% penalty per inch of tire diameter over stock */
const TIRE_DIAMETER_PENALTY_PER_INCH = 0.025;

/** Headwind multipliers (base, without RTT) */
const HEADWIND_PENALTY: Record<HeadwindLevel, number> = {
  none: 1.0, light: 0.95, moderate: 0.88, strong: 0.80,
};

/** Extra headwind penalty per level when RTT is mounted */
const HEADWIND_RTT_EXTRA: Record<HeadwindLevel, number> = {
  none: 0, light: 0.03, moderate: 0.03, strong: 0.03,
};

/** 4WD engagement multipliers */
const DRIVE_MODE_PENALTY: Record<string, number> = {
  "2wd": 1.0, "4h": 0.95, "4l": 0.70,
};

/** AC penalty */
const AC_PENALTY = 0.97;

/** Towing: 1% per 200 lbs of trailer weight */
const TOWING_LBS_PER_PCT = 200;

/** Cargo weight: 1% per 100 lbs (same as WEIGHT_LBS_PER_PCT_MPG_LOSS) */
const CARGO_LBS_PER_PCT = 100;

/** Aero drag penalties per mod */
const AERO_DRAG_PENALTY = {
  lightbar: 0.99,
  bullBar: 0.985,
  snorkel: 0.99,
  antenna: 0.998,
  awning: 0.99,
  rtt: 0.95,
} as const;

/** RTT with fairing: drag reduced from 0.95 to 0.97 */
const AERO_RTT_WITH_FAIRING = 0.97;

/** Fuel type energy multipliers */
const FUEL_TYPE_MULTIPLIER: Record<string, number> = {
  e10: 1.0, premium: 1.02, e85: 0.75,
};

/** Sustained altitude penalties (naturally aspirated) */
const ALTITUDE_PENALTY_NA: Record<AltitudeBand, number> = {
  "below-3000": 1.0,
  "3000-5000": 1.0,
  "5000-7000": 0.97,
  "7000-9000": 0.94,
  "9000-plus": 0.91,
};

/** Sustained altitude penalties (turbo — half penalty) */
const ALTITUDE_PENALTY_TURBO: Record<AltitudeBand, number> = {
  "below-3000": 1.0,
  "3000-5000": 1.0,
  "5000-7000": 0.985,
  "7000-9000": 0.97,
  "9000-plus": 0.955,
};

/** Aired down on pavement penalty (forgot to air up) */
const AIRED_DOWN_PAVEMENT_PENALTY = 0.92;

/** Idle fuel consumption (gallons per hour, typical truck) */
export const IDLE_GPH = 0.5;

/** Descent fuel recovery: 5% better MPG per 1000ft of descent */
const DESCENT_RECOVERY_PER_1000FT = 0.05;
/** Cap at 15% recovery max */
const MAX_DESCENT_RECOVERY = 0.15;

// ─── Rig Penalty Calculator ─────────────────────────────────────────

export interface RigPenaltyBreakdown {
  label: string;
  multiplier: number;
}

export function calculateRigPenalty(conditions: RigConditions): {
  multiplier: number;
  breakdown: RigPenaltyBreakdown[];
} {
  const breakdown: RigPenaltyBreakdown[] = [];
  let combined = 1.0;

  // Lift
  const liftMult = LIFT_MPG_PENALTY[conditions.liftInches] ?? 1.0;
  if (liftMult < 1.0) {
    breakdown.push({ label: `${conditions.liftInches}" lift`, multiplier: liftMult });
    combined *= liftMult;
  }

  // Tire type
  const tireMult = TIRE_TYPE_PENALTY[conditions.tireType] ?? 1.0;
  if (tireMult < 1.0) {
    const labels: Record<string, string> = {
      "all-terrain": "A/T tires", "mud-terrain": "M/T tires", hybrid: "Hybrid tires",
    };
    breakdown.push({ label: labels[conditions.tireType] ?? "Tires", multiplier: tireMult });
    combined *= tireMult;
  }

  // Tire size over stock
  if (conditions.tireSizeOverStock > 0) {
    const tsMult = 1 - (conditions.tireSizeOverStock * TIRE_DIAMETER_PENALTY_PER_INCH);
    breakdown.push({ label: `+${conditions.tireSizeOverStock}" tire diameter`, multiplier: Math.max(0.5, tsMult) });
    combined *= Math.max(0.5, tsMult);
  }

  // Aired down on pavement
  if (conditions.airedDown) {
    breakdown.push({ label: "Aired down (pavement penalty)", multiplier: AIRED_DOWN_PAVEMENT_PENALTY });
    combined *= AIRED_DOWN_PAVEMENT_PENALTY;
  }

  // Drive mode
  const driveMult = DRIVE_MODE_PENALTY[conditions.driveMode] ?? 1.0;
  if (driveMult < 1.0) {
    const driveLabels: Record<string, string> = { "4h": "4WD High", "4l": "4WD Low" };
    breakdown.push({ label: driveLabels[conditions.driveMode] ?? "4WD", multiplier: driveMult });
    combined *= driveMult;
  }

  // AC
  if (conditions.acOn) {
    breakdown.push({ label: "A/C running", multiplier: AC_PENALTY });
    combined *= AC_PENALTY;
  }

  // Fuel type
  const fuelMult = FUEL_TYPE_MULTIPLIER[conditions.fuelType] ?? 1.0;
  if (fuelMult !== 1.0) {
    const fuelLabels: Record<string, string> = { premium: "Premium fuel (+2%)", e85: "E85 (-25%)" };
    breakdown.push({ label: fuelLabels[conditions.fuelType] ?? "Fuel type", multiplier: fuelMult });
    combined *= fuelMult;
  }

  // Cargo weight
  if (conditions.cargoWeightLbs > 0) {
    const cargoPct = (conditions.cargoWeightLbs / CARGO_LBS_PER_PCT) * 0.01;
    const cargoMult = Math.max(0.5, 1 - cargoPct);
    breakdown.push({ label: `${conditions.cargoWeightLbs} lbs cargo`, multiplier: cargoMult });
    combined *= cargoMult;
  }

  // Towing
  if (conditions.towingEnabled && conditions.trailerWeightLbs > 0) {
    const towPct = (conditions.trailerWeightLbs / TOWING_LBS_PER_PCT) * 0.01;
    const towMult = Math.max(0.3, 1 - towPct);
    breakdown.push({ label: `Towing ${conditions.trailerWeightLbs} lbs`, multiplier: towMult });
    combined *= towMult;
  }

  // Aero drag mods
  const hasRtt = conditions.aeroDrag.rtt;
  for (const [mod, checked] of Object.entries(conditions.aeroDrag) as [keyof typeof AERO_DRAG_PENALTY, boolean][]) {
    if (!checked) continue;
    let dragMult = AERO_DRAG_PENALTY[mod];
    // If RTT + fairing, use reduced penalty
    if (mod === "rtt" && conditions.fairing) {
      dragMult = AERO_RTT_WITH_FAIRING;
    }
    const aeroLabels: Record<string, string> = {
      lightbar: "Light bar", bullBar: "Bull bar/bumper", snorkel: "Snorkel",
      antenna: "CB/Ham antenna", awning: "Awning", rtt: "Roof-top tent",
    };
    const label = conditions.fairing && mod === "rtt"
      ? "Roof-top tent (w/ fairing)"
      : aeroLabels[mod] ?? mod;
    breakdown.push({ label, multiplier: dragMult });
    combined *= dragMult;
  }

  // Headwind
  const hwBase = HEADWIND_PENALTY[conditions.headwind] ?? 1.0;
  const hwExtra = hasRtt ? (HEADWIND_RTT_EXTRA[conditions.headwind] ?? 0) : 0;
  const hwMult = Math.max(0.5, hwBase - hwExtra);
  if (hwMult < 1.0) {
    const hwLabels: Record<string, string> = {
      light: "Light headwind (5-10 mph)",
      moderate: "Moderate headwind (15-20 mph)",
      strong: "Strong headwind (25+ mph)",
    };
    const hwLabel = hwExtra > 0
      ? `${hwLabels[conditions.headwind]} + RTT drag`
      : hwLabels[conditions.headwind] ?? "Headwind";
    breakdown.push({ label: hwLabel, multiplier: hwMult });
    combined *= hwMult;
  }

  // Altitude
  const altMult = conditions.isTurbo
    ? (ALTITUDE_PENALTY_TURBO[conditions.altitude] ?? 1.0)
    : (ALTITUDE_PENALTY_NA[conditions.altitude] ?? 1.0);
  if (altMult < 1.0) {
    const altLabels: Record<string, string> = {
      "5000-7000": "5,000-7,000 ft altitude",
      "7000-9000": "7,000-9,000 ft altitude",
      "9000-plus": "9,000+ ft altitude",
    };
    const altLabel = conditions.isTurbo
      ? `${altLabels[conditions.altitude] ?? "Altitude"} (turbo)`
      : altLabels[conditions.altitude] ?? "Altitude";
    breakdown.push({ label: altLabel, multiplier: altMult });
    combined *= altMult;
  }

  return {
    multiplier: Math.round(combined * 10000) / 10000,
    breakdown,
  };
}

// ─── Descent Recovery Calculator ─────────────────────────────────────

function descentRecovery(elevationGainFt: number): number {
  // Only applies to negative elevation (going downhill)
  if (elevationGainFt >= 0) return 1.0;
  const descentFt = Math.abs(elevationGainFt);
  const rawRecovery = (descentFt / 1000) * DESCENT_RECOVERY_PER_1000FT;
  const cappedRecovery = Math.min(rawRecovery, MAX_DESCENT_RECOVERY);
  return 1 + cappedRecovery; // e.g. 1.10 = 10% better MPG
}

// ─── Aired-down terrain check ────────────────────────────────────────

function airedDownTerrainPenalty(
  airedDown: boolean,
  terrain: TerrainType,
): number {
  if (!airedDown) return 1.0;
  // On pavement/city, aired down is a penalty (forgot to air up)
  const pavementTerrains: TerrainType[] = ["highway", "city"];
  if (pavementTerrains.includes(terrain)) return AIRED_DOWN_PAVEMENT_PENALTY;
  // Off-road terrains: aired down is expected, penalty already in terrain multiplier
  return 1.0;
}

// ─── Main Trip Computer ──────────────────────────────────────────────

export function computeTrip(
  segments: TripSegment[],
  baseMpg: number,
  totalFuelGal: number,
  climateZone: string | null = null,
  gasPricePerGal: number = 0,
  rigConditions?: RigConditions,
): TripResult {
  // Calculate rig penalty if conditions provided
  const rigResult = rigConditions ? calculateRigPenalty(rigConditions) : null;
  const rigMultiplier = rigResult?.multiplier ?? 1.0;

  // Apply rig penalty to base MPG
  const rigAdjustedMpg = baseMpg * rigMultiplier;

  let fuelRemaining = totalFuelGal;
  const reserve = totalFuelGal * RESERVE_PCT;
  let pointOfNoReturn: number | null = null;
  let outOfFuelAt: number | null = null;
  let totalDistance = 0;
  let totalFuel = 0;
  let totalTime = 0;
  let totalIdleFuel = 0;
  let refuelStopCount = 0;

  const results: SegmentResult[] = segments.map((seg, idx) => {
    if (seg.isFuelStop && idx > 0) {
      fuelRemaining = totalFuelGal;
      refuelStopCount++;
    }

    const terrainMult = terrainMpgMultiplier[seg.terrain];

    // Elevation penalty (uphill)
    const rawElevPenalty = seg.elevationGainFt > 0
      ? (seg.elevationGainFt / 1000) * ELEVATION_PENALTY_PER_1000FT
      : 0;
    const clampedElevPenalty = 1 - Math.min(rawElevPenalty, MAX_ELEVATION_PENALTY);

    // Descent recovery (downhill — negative elevation)
    const descent = descentRecovery(seg.elevationGainFt);

    const speedMult = speedEfficiency(seg.speedMph);
    const tempMult = temperaturePenalty(climateZone);

    // Aired-down per-segment penalty (only on pavement)
    const airedDownMult = rigConditions
      ? airedDownTerrainPenalty(rigConditions.airedDown, seg.terrain)
      : 1.0;

    const adjustedMpg = Math.max(
      0.5,
      rigAdjustedMpg * terrainMult * clampedElevPenalty * descent * speedMult * tempMult * airedDownMult,
    );

    const drivingFuelUsed = seg.distanceMiles / adjustedMpg;

    // Idle fuel consumption
    const idleMinutes = seg.idleMinutes ?? 0;
    const idleFuel = idleMinutes > 0 ? (idleMinutes / 60) * IDLE_GPH : 0;

    const fuelUsed = drivingFuelUsed + idleFuel;

    const timeHours = seg.speedMph > 0 ? seg.distanceMiles / seg.speedMph : 0;
    const idleTimeHours = idleMinutes / 60;

    const fuelAfterRefill = seg.isFuelStop && idx > 0 ? totalFuelGal : fuelRemaining + fuelUsed;

    fuelRemaining -= fuelUsed;
    totalDistance += seg.distanceMiles;
    totalFuel += fuelUsed;
    totalIdleFuel += idleFuel;
    totalTime += timeHours + idleTimeHours;

    const warnings: string[] = [];
    if (fuelRemaining < 0 && outOfFuelAt === null) {
      outOfFuelAt = idx;
      warnings.push("OUT OF FUEL \u2014 you won't make it through this segment");
    } else if (fuelRemaining >= 0 && fuelRemaining < reserve) {
      warnings.push("Below 10% fuel reserve \u2014 find fuel or cache soon");
    }

    if (idleFuel > 0) {
      warnings.push(`Idle burn: ${Math.round(idleFuel * 100) / 100} gal (${idleMinutes} min)`);
    }

    if (totalFuel > totalFuelGal * 0.5 && pointOfNoReturn === null) {
      pointOfNoReturn = idx;
    }

    return {
      segment: seg,
      adjustedMpg: Math.round(adjustedMpg * 10) / 10,
      fuelUsedGal: Math.round(fuelUsed * 100) / 100,
      idleFuelGal: Math.round(idleFuel * 100) / 100,
      fuelRemainingGal: Math.round(Math.max(0, fuelRemaining) * 100) / 100,
      fuelAfterRefillGal: Math.round(fuelAfterRefill * 100) / 100,
      didRefuel: seg.isFuelStop && idx > 0,
      cumulativeDistanceMiles: Math.round(totalDistance * 10) / 10,
      timeHours: Math.round((timeHours + idleTimeHours) * 100) / 100,
      terrainMultiplier: terrainMult,
      elevationPenalty: clampedElevPenalty,
      speedPenalty: speedMult,
      descentRecovery: descent,
      warnings,
    };
  });

  const totalCost = gasPricePerGal > 0
    ? Math.round(totalFuel * gasPricePerGal * 100) / 100
    : 0;

  return {
    segments: results,
    totalDistanceMiles: Math.round(totalDistance * 10) / 10,
    totalFuelUsedGal: Math.round(totalFuel * 100) / 100,
    totalFuelCapacityGal: totalFuelGal,
    fuelRemainingGal: Math.round(Math.max(0, fuelRemaining) * 100) / 100,
    totalTimeHours: Math.round(totalTime * 100) / 100,
    totalFuelCost: totalCost,
    totalIdleFuelGal: Math.round(totalIdleFuel * 100) / 100,
    refuelStopCount,
    pointOfNoReturnIdx: pointOfNoReturn,
    reserveWarning: fuelRemaining >= 0 && fuelRemaining < reserve,
    outOfFuel: fuelRemaining < 0,
    outOfFuelAtIdx: outOfFuelAt,
    rigPenaltyMultiplier: rigMultiplier,
  };
}

export function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function fuelPct(remaining: number, total: number): number {
  return Math.round(Math.max(0, Math.min(100, (remaining / total) * 100)));
}
