// ─── RigRated Calculation Engine ──────────────────────────────────────
// Pure logic — no React. All functions are deterministic and testable.
//
// Computes: payload budget, axle distribution, stability index,
// trail compatibility, legal status, drive-vs-trailer comparison,
// 14-day certified badge, and warnings.
//
// Safety thresholds (same as RigSafe):
//   Green:  0-70% used (plenty of margin)
//   Yellow: 70-85% used (safety margin zone)
//   Orange: 85-90% used (approaching limit)
//   Red:    90-100%+ used (at or over limit)

import type { UTVMachine, UTVBodyType } from "./rigrated-machines";
import type { UTVAccessory } from "./rigrated-accessories";
import type { TrailProfile } from "./rigrated-trails";
import { parseTireDiameter } from "./rigrated-trails";
import type { StateLegalInfo, LegalView } from "./rigrated-legal";
import { getLegalStatus } from "./rigrated-legal";
import type { GearPreset } from "./rigrated-gear-presets";
import { WATER_LBS_PER_GALLON, FUEL_LBS_PER_GALLON, DEFAULT_OCCUPANT_LBS } from "./rigrated-gear-presets";
import { findSuspensionProduct, type SuspensionProduct } from "./rigrated-suspension-products";
import { findTire, findWheel, type UTVTire, type UTVWheel } from "./rigrated-tires-wheels";

// ─── Configuration Interfaces ─────────────────────────────────────────

export interface RigRatedConfig {
  // Machine
  machine: UTVMachine | null;
  manualMachine: {
    make: string;
    model: string;
    year: number;
    bodyType: UTVBodyType;
    seatingCapacity: 2 | 4 | 6;
    dryWeightLbs: number;
    gvwrLbs: number;
    payloadCapacityLbs: number;
    towingCapacityLbs: number;
    groundClearanceIn: number;
    wheelbaseIn: number;
    trackWidthFrontIn: number;
    trackWidthRearIn: number;
    overallWidthIn: number;
    overallHeightIn: number;
    horsePower: number;
    fuelCapacityGal: number;
    tireSize: string;
    bedLengthIn: number;
    bedWidthIn: number;
  };
  useManual: boolean;

  // Accessories
  selectedAccessories: string[]; // accessory IDs
  instagramMode: boolean;

  // Occupants
  adults: number;
  children: number;
  avgAdultLbs: number;
  avgChildLbs: number;

  // Gear
  durationDays: number;
  gearPreset: GearPreset | null;
  customFoodLbs: number;
  customWaterGal: number;
  customSpareFuelGal: number;
  customCoolerLbs: number;
  customRecoveryLbs: number;
  customToolsLbs: number;
  customCampingLbs: number;
  customOtherLbs: number;
  useCustomGear: boolean;

  // Trail selection
  selectedTrails: string[]; // trail IDs

  // Legal
  legalView: LegalView;
  selectedStates: string[]; // state codes

  // Drive vs trailer
  towVehicleWeight: number; // curb weight
  towVehicleMaxTow: number;
  towVehicleMpg: number;
  towVehicleFuelTankGal: number;
  trailerWeightLbs: number;
  driveMiles: number;
  fuelCostPerGal: number;

  // Suspension & Upgrades
  selectedSuspension: string | null;  // suspension product ID
  selectedTires: string | null;       // tire ID
  selectedWheels: string | null;      // wheel ID
  fuelCellFull: boolean;              // fuel cell loaded toggle

  // Trip plan
  tripPlan: TripPlanData;
}

export interface TripPlanData {
  tripName: string;
  startDate: string;
  endDate: string;
  trailRoute: string;
  roster: { name: string; medical: string; emergencyContact: string; emergencyPhone: string }[];
  commPlan: string;
  checkInSchedule: string;
  satelliteDevice: string;
  waypoints: { name: string; notes: string; isOvernight: boolean }[];
  nearestHospital: string;
  nearestFuel: string;
  nearestTowing: string;
  recoveryCapability: string;
  backupPlan: string;
  leaveBehindName: string;
  leaveBehindPhone: string;
}

// ─── Computed Results ─────────────────────────────────────────────────

export interface RigRatedResult {
  // Payload
  payload: PayloadBudget;
  modifiedPayload: PayloadBudget | null;
  axleDistribution: { frontPct: number; rearPct: number };

  // Stability
  stabilityIndex: number; // 1-10 (10 = most stable)
  stabilityNote: string;

  // Trail compatibility
  trailScores: TrailScore[];

  // Legal
  legalStatuses: { stateCode: string; status: "green" | "yellow" | "red" }[];

  // Drive vs trailer
  driveVsTrailer: DriveVsTrailerResult | null;

  // 14-day badge
  certifiedBadge: CertifiedBadge;

  // Weight breakdown for donut chart (legacy — payload items only)
  weightBreakdown: { label: string; value: number; color: string }[];

  // GVWR breakdown for dual donut charts
  stockGVWR: GVWRBreakdown;
  effectiveGVWR: GVWRBreakdown;

  // Suspension gain details
  suspensionGain: SuspensionGainInfo | null;

  // Fun message
  funMessage: string | null;

  // Tire/wheel delta
  tireWheelDelta: number;

  // Warnings
  warnings: RigRatedWarning[];

  // Overall status
  overallStatus: "green" | "yellow" | "orange" | "red";
}

export interface PayloadBudget {
  dryWeight: number;
  accessoriesWeight: number;
  occupantWeight: number;
  gearWeight: number;
  fuelWeight: number;
  totalLoaded: number;
  gvwr: number;
  payloadUsed: number;
  payloadCapacity: number;
  payloadPct: number;
  remaining: number;
}

export interface TrailScore {
  trailId: string;
  trailName: string;
  overall: "green" | "yellow" | "red";
  widthOk: boolean;
  clearanceOk: boolean;
  tiresOk: boolean;
  fuelRangeOk: boolean;
  difficultyNote: string;
}

export interface DriveVsTrailerResult {
  driveFuelCost: number;
  driveTimeMiles: number;
  trailerFuelCost: number;
  trailerTongueWeight: number;
  trailerTotalWeight: number;
  towVehicleCanHandle: boolean;
  recommendation: string;
}

export interface CertifiedBadge {
  earned: boolean;
  checks: {
    payloadUnder80: boolean;
    legalOk: boolean;
    fuelRange: boolean;
    recoveryGear: boolean;
    waterSupply: boolean;
  };
  daysCapable: number;
}

export interface RigRatedWarning {
  level: "info" | "warning" | "danger";
  message: string;
}

// ─── Helper: Get effective machine data ───────────────────────────────

function getMachine(config: RigRatedConfig) {
  if (config.useManual || !config.machine) {
    return config.manualMachine;
  }
  return config.machine;
}

// ─── Compute: Payload Budget ──────────────────────────────────────────

export function computePayload(
  config: RigRatedConfig,
  accessoryDb: UTVAccessory[]
): PayloadBudget {
  const machine = getMachine(config);

  const dryWeight = machine.dryWeightLbs;

  // Accessories weight (includes fuel cell dry/full logic)
  let accessoriesWeight = 0;
  for (const id of config.selectedAccessories) {
    const acc = accessoryDb.find((a) => a.id === id);
    if (!acc) continue;
    if (acc.category === "fuel-cell" && acc.fuelCapacityGal && config.fuelCellFull) {
      // Full fuel cell: dry weight + fuel weight
      accessoriesWeight += acc.weightLbs + Math.round(acc.fuelCapacityGal * FUEL_LBS_PER_GALLON);
    } else {
      accessoriesWeight += acc.weightLbs;
    }
  }

  // Tire/wheel weight delta
  const tireWheelDelta = computeTireWheelDelta(config, machine);
  accessoriesWeight += tireWheelDelta;

  // Suspension kit weight (the kit itself adds weight)
  const suspProduct = config.selectedSuspension ? findSuspensionProduct(config.selectedSuspension) : null;
  if (suspProduct) {
    accessoriesWeight += suspProduct.weightLbs;
  }

  // Occupant weight
  const occupantWeight =
    config.adults * config.avgAdultLbs +
    config.children * config.avgChildLbs;

  // Gear weight
  let gearWeight = 0;
  if (config.useCustomGear) {
    gearWeight =
      config.customFoodLbs +
      Math.round(config.customWaterGal * WATER_LBS_PER_GALLON) +
      Math.round(config.customSpareFuelGal * FUEL_LBS_PER_GALLON) +
      config.customCoolerLbs +
      config.customRecoveryLbs +
      config.customToolsLbs +
      config.customCampingLbs +
      config.customOtherLbs;
  } else if (config.gearPreset) {
    const people = config.adults + config.children;
    const p = config.gearPreset;
    gearWeight =
      Math.round(p.foodLbsPerPerson * people) +
      Math.round(p.waterGalPerPerson * people * WATER_LBS_PER_GALLON) +
      Math.round(p.spareFuelGal * FUEL_LBS_PER_GALLON) +
      p.coolerIceWeightLbs +
      p.recoveryKitLbs +
      p.toolsLbs +
      p.campingGearLbs;
  }

  // Full fuel tank weight
  const fuelWeight = Math.round(machine.fuelCapacityGal * FUEL_LBS_PER_GALLON);

  const totalLoaded = dryWeight + accessoriesWeight + occupantWeight + gearWeight + fuelWeight;
  const gvwr = machine.gvwrLbs;
  const payloadCapacity = gvwr - dryWeight;
  const payloadUsed = totalLoaded - dryWeight;
  const payloadPct = payloadCapacity > 0 ? Math.round((payloadUsed / payloadCapacity) * 100) : 0;

  return {
    dryWeight,
    accessoriesWeight,
    occupantWeight,
    gearWeight,
    fuelWeight,
    totalLoaded,
    gvwr,
    payloadUsed,
    payloadCapacity,
    payloadPct,
    remaining: payloadCapacity - payloadUsed,
  };
}

// ─── Tire/Wheel Weight Delta ─────────────────────────────────────────
// Returns additional weight from upgrading tires/wheels over stock

function computeTireWheelDelta(
  config: RigRatedConfig,
  machine: ReturnType<typeof getMachine>
): number {
  let delta = 0;

  if (config.selectedTires) {
    const tire = findTire(config.selectedTires);
    if (tire && "stockTireWeightLbs" in machine) {
      const stockTotal = (machine as UTVMachine).stockTireWeightLbs * 4;
      const newTotal = tire.weightLbs * 4;
      delta += newTotal - stockTotal;
    }
  }

  if (config.selectedWheels) {
    const wheel = findWheel(config.selectedWheels);
    if (wheel && "stockWheelWeightLbs" in machine) {
      const stockTotal = (machine as UTVMachine).stockWheelWeightLbs * 4;
      const newTotal = wheel.weightLbs * 4;
      delta += newTotal - stockTotal;
    }
  }

  return Math.max(0, delta); // Only count added weight, never subtract
}

// ─── Compute: Modified Payload (suspension product) ──────────────────
// Formula: New effective payload = (stock payload × (1 + realisticGainPct/100)) − suspension kit weight
// If brand provides hardRatedCapacityLbs, use that as flat bonus instead of percentage.
// Kit weight is already included in accessoriesWeight in the stock payload calculation,
// so we only boost the capacity here — no double-counting.

export function computeModifiedPayload(
  stockPayload: PayloadBudget,
  suspensionId: string | null
): PayloadBudget | null {
  if (!suspensionId) return null;
  const product = findSuspensionProduct(suspensionId);
  if (!product) return null;

  let modifiedCapacity: number;
  if (product.hardRatedCapacityLbs) {
    // Brand gives a hard number — use it as flat boost over stock capacity
    modifiedCapacity = stockPayload.payloadCapacity + product.hardRatedCapacityLbs;
  } else {
    // Percentage-based: use realistic gain (already 50% of claimed)
    modifiedCapacity = Math.round(
      stockPayload.payloadCapacity * (1 + product.realisticGainPct / 100)
    );
  }

  const payloadPct = modifiedCapacity > 0
    ? Math.round((stockPayload.payloadUsed / modifiedCapacity) * 100)
    : 0;

  return {
    ...stockPayload,
    payloadCapacity: modifiedCapacity,
    payloadPct,
    remaining: modifiedCapacity - stockPayload.payloadUsed,
  };
}

// ─── Compute: Suspension Gain Details ────────────────────────────────
// Returns info for the UI to display "Fox claims +30% → Realistic: +15%"

export interface SuspensionGainInfo {
  product: SuspensionProduct;
  claimedBoostLbs: number;
  realisticBoostLbs: number;
  kitWeightLbs: number;
  netGainLbs: number;
}

export function computeSuspensionGain(
  stockPayloadCapacity: number,
  suspensionId: string | null
): SuspensionGainInfo | null {
  if (!suspensionId) return null;
  const product = findSuspensionProduct(suspensionId);
  if (!product) return null;

  let claimedBoostLbs: number;
  let realisticBoostLbs: number;

  if (product.hardRatedCapacityLbs) {
    claimedBoostLbs = product.hardRatedCapacityLbs;
    realisticBoostLbs = product.hardRatedCapacityLbs;
  } else {
    claimedBoostLbs = Math.round(stockPayloadCapacity * (product.claimedGainPct / 100));
    realisticBoostLbs = Math.round(stockPayloadCapacity * (product.realisticGainPct / 100));
  }

  return {
    product,
    claimedBoostLbs,
    realisticBoostLbs,
    kitWeightLbs: product.weightLbs,
    netGainLbs: realisticBoostLbs - product.weightLbs,
  };
}

// ─── Compute: GVWR Breakdown (for donut charts) ─────────────────────
// Returns segments that sum to GVWR for proper donut visualization

export interface GVWRBreakdown {
  segments: { label: string; value: number; color: string }[];
  isOverCapacity: boolean;
  usedPct: number;
}

export function computeGVWRBreakdown(payload: PayloadBudget): GVWRBreakdown {
  const segments: { label: string; value: number; color: string }[] = [];

  // Curb weight is always the biggest chunk
  segments.push({ label: "Curb Weight", value: payload.dryWeight, color: "#4B5563" });

  if (payload.accessoriesWeight > 0)
    segments.push({ label: "Accessories", value: payload.accessoriesWeight, color: "#8B5CF6" });
  if (payload.occupantWeight > 0)
    segments.push({ label: "Occupants", value: payload.occupantWeight, color: "#6366F1" });
  if (payload.gearWeight > 0)
    segments.push({ label: "Gear & Supplies", value: payload.gearWeight, color: "#10B981" });
  if (payload.fuelWeight > 0)
    segments.push({ label: "Fuel", value: payload.fuelWeight, color: "#F59E0B" });

  const remaining = payload.gvwr - payload.totalLoaded;
  const isOverCapacity = remaining < 0;

  if (remaining > 0) {
    segments.push({ label: "Remaining", value: remaining, color: "#34D399" });
  }

  const usedPct = payload.gvwr > 0
    ? Math.round((payload.totalLoaded / payload.gvwr) * 100)
    : 0;

  return { segments, isOverCapacity, usedPct };
}

// ─── Fun Messages ────────────────────────────────────────────────────
// Contextual messages based on build state. One per render.

export function generateFunMessage(
  payload: PayloadBudget,
  suspGain: SuspensionGainInfo | null,
  accessoryDb: UTVAccessory[],
  selectedAccessories: string[]
): string | null {
  const messages: string[] = [];

  // Net gain messages
  if (suspGain) {
    if (suspGain.netGainLbs < 0) {
      messages.push("You're heavier, not better. Time to rethink that build.");
    } else if (suspGain.netGainLbs > 50) {
      messages.push(`You gained ${suspGain.netGainLbs} lbs of beer-hauling power!`);
    } else if (suspGain.netGainLbs > 30) {
      messages.push(`Hey, you gained ${suspGain.netGainLbs} lbs — enough for the dog to tag along!`);
    } else if (suspGain.netGainLbs > 0) {
      messages.push(`+${suspGain.netGainLbs} lbs. Every pound counts when you're packing for the weekend.`);
    }
  }

  // Winch weight
  const winch = selectedAccessories
    .map(id => accessoryDb.find(a => a.id === id))
    .find(a => a?.category === "winch");
  if (winch && winch.weightLbs > 25) {
    messages.push(`Whoa, that winch weighs more than your mom's purse.`);
  }

  // Payload stress
  if (payload.payloadPct > 95) {
    messages.push("Your rig is sweating. Maybe leave the kitchen sink at home.");
  } else if (payload.payloadPct > 85) {
    messages.push("Getting chunky. You sure you need ALL that gear?");
  }

  // Light load
  if (payload.payloadPct < 30 && payload.accessoriesWeight > 0) {
    messages.push("Plenty of room left. Time to add a cooler... or three.");
  }

  if (messages.length === 0) return null;
  return messages[Math.floor(Math.random() * messages.length)];
}

// ─── Compute: Axle Distribution ───────────────────────────────────────

export function computeAxleDistribution(
  config: RigRatedConfig,
  accessoryDb: UTVAccessory[]
): { frontPct: number; rearPct: number } {
  let frontWeight = 0;
  let rearWeight = 0;
  let distributedWeight = 0;

  for (const id of config.selectedAccessories) {
    const acc = accessoryDb.find((a) => a.id === id);
    if (!acc) continue;
    switch (acc.mountPosition) {
      case "front": frontWeight += acc.weightLbs; break;
      case "rear":
      case "bed": rearWeight += acc.weightLbs; break;
      case "roof": rearWeight += acc.weightLbs * 0.6; frontWeight += acc.weightLbs * 0.4; break;
      case "sides": distributedWeight += acc.weightLbs; break;
      case "distributed": distributedWeight += acc.weightLbs; break;
    }
  }

  // Gear goes in bed/rear
  const gearWeight = computeGearWeight(config);
  rearWeight += gearWeight;

  // Occupants distributed roughly 50/50
  const occupantWeight = config.adults * config.avgAdultLbs + config.children * config.avgChildLbs;
  frontWeight += occupantWeight * 0.5;
  rearWeight += occupantWeight * 0.5;

  // Distributed items split 50/50
  frontWeight += distributedWeight * 0.5;
  rearWeight += distributedWeight * 0.5;

  const total = frontWeight + rearWeight;
  if (total === 0) return { frontPct: 50, rearPct: 50 };

  return {
    frontPct: Math.round((frontWeight / total) * 100),
    rearPct: Math.round((rearWeight / total) * 100),
  };
}

function computeGearWeight(config: RigRatedConfig): number {
  if (config.useCustomGear) {
    return (
      config.customFoodLbs +
      Math.round(config.customWaterGal * WATER_LBS_PER_GALLON) +
      Math.round(config.customSpareFuelGal * FUEL_LBS_PER_GALLON) +
      config.customCoolerLbs +
      config.customRecoveryLbs +
      config.customToolsLbs +
      config.customCampingLbs +
      config.customOtherLbs
    );
  }
  if (config.gearPreset) {
    const people = config.adults + config.children;
    const p = config.gearPreset;
    return (
      Math.round(p.foodLbsPerPerson * people) +
      Math.round(p.waterGalPerPerson * people * WATER_LBS_PER_GALLON) +
      Math.round(p.spareFuelGal * FUEL_LBS_PER_GALLON) +
      p.coolerIceWeightLbs +
      p.recoveryKitLbs +
      p.toolsLbs +
      p.campingGearLbs
    );
  }
  return 0;
}

// ─── Compute: Stability Index ─────────────────────────────────────────

export function computeStabilityIndex(
  config: RigRatedConfig,
  payload: PayloadBudget
): { index: number; note: string } {
  const machine = getMachine(config);

  // Base stability from track width ratio (wider = more stable)
  const avgTrackWidth = (machine.trackWidthFrontIn + machine.trackWidthRearIn) / 2;
  const widthScore = Math.min(10, (avgTrackWidth / 72) * 10);

  // CG penalty from load
  const loadPct = payload.payloadPct / 100;
  const cgPenalty = loadPct * 2;

  // Height penalty (taller = less stable)
  const heightPenalty = Math.max(0, (machine.overallHeightIn - 70) / 10);

  // Body type bonus (sport = wider stance, lower CG)
  const bodyBonus = machine.bodyType.includes("sport") ? 1.5 : 0;

  let index = Math.round((widthScore - cgPenalty - heightPenalty + bodyBonus) * 10) / 10;
  index = Math.max(1, Math.min(10, index));

  let note = "";
  if (index >= 8) note = "Excellent stability. Wide stance and balanced load.";
  else if (index >= 6) note = "Good stability. Normal driving behavior expected.";
  else if (index >= 4) note = "Moderate stability. Be cautious on off-camber terrain and side slopes.";
  else note = "Low stability. Heavy load raising CG. Avoid steep side slopes and aggressive cornering.";

  return { index, note };
}

// ─── Compute: Trail Compatibility ─────────────────────────────────────

export function computeTrailCompatibility(
  config: RigRatedConfig,
  trailDb: TrailProfile[]
): TrailScore[] {
  const machine = getMachine(config);

  return trailDb.map((trail) => {
    const widthOk = machine.overallWidthIn <= trail.minWidthIn + 8; // 8" tolerance
    const clearanceOk = machine.groundClearanceIn >= trail.minClearanceIn;

    // Tire size check
    const machineTireDia = parseTireDiameter(machine.tireSize);
    const trailTireDia = parseTireDiameter(trail.minTireSize);
    const tiresOk = machineTireDia >= trailTireDia;

    // Fuel range check: can the machine complete the longest fuel leg?
    const estimatedMpg = machine.bodyType.includes("sport") ? 8 : 12;
    const totalFuel = machine.fuelCapacityGal + (config.gearPreset?.spareFuelGal ?? 0);
    const rangeMiles = totalFuel * estimatedMpg;
    const fuelRangeOk = rangeMiles >= trail.fuelDistanceMiles;

    // Difficulty note
    let difficultyNote = "";
    if (trail.difficulty <= 4) difficultyNote = "Beginner-friendly. Most UTVs can handle this.";
    else if (trail.difficulty <= 6) difficultyNote = "Moderate. Recovery gear recommended.";
    else if (trail.difficulty <= 8) difficultyNote = "Advanced. Skid plates, rock sliders, and winch recommended.";
    else difficultyNote = "Expert only. Full armor, recovery gear, and experienced driver required.";

    // Overall score
    const failCount = [widthOk, clearanceOk, tiresOk, fuelRangeOk].filter((v) => !v).length;
    let overall: "green" | "yellow" | "red" = "green";
    if (failCount >= 2) overall = "red";
    else if (failCount === 1) overall = "yellow";

    return {
      trailId: trail.id,
      trailName: trail.name,
      overall,
      widthOk,
      clearanceOk,
      tiresOk,
      fuelRangeOk,
      difficultyNote,
    };
  });
}

// ─── Compute: Legal Status ────────────────────────────────────────────

export function computeLegalStatuses(
  config: RigRatedConfig,
  stateLegalDb: StateLegalInfo[]
): { stateCode: string; status: "green" | "yellow" | "red" }[] {
  return stateLegalDb.map((state) => ({
    stateCode: state.stateCode,
    status: getLegalStatus(state, config.legalView),
  }));
}

// ─── Compute: Drive vs Trailer ────────────────────────────────────────

export function computeDriveVsTrailer(config: RigRatedConfig): DriveVsTrailerResult | null {
  if (config.driveMiles <= 0 || config.towVehicleMaxTow <= 0) return null;

  const machine = getMachine(config);

  // Drive UTV directly
  const utvMpg = machine.bodyType.includes("sport") ? 8 : 12;
  const driveFuelGal = config.driveMiles / utvMpg;
  const driveFuelCost = Math.round(driveFuelGal * config.fuelCostPerGal * 100) / 100;

  // Trailer: tow vehicle hauls UTV on trailer
  const utvWeight = machine.dryWeightLbs;
  const trailerTotalWeight = config.trailerWeightLbs + utvWeight;
  const tongueWeight = Math.round(trailerTotalWeight * 0.12); // 10-15% tongue weight

  // MPG penalty from towing: ~1 MPG per 1000 lbs towed
  const towPenalty = trailerTotalWeight / 1000;
  const towMpg = Math.max(4, config.towVehicleMpg - towPenalty);
  const trailerFuelGal = config.driveMiles / towMpg;
  const trailerFuelCost = Math.round(trailerFuelGal * config.fuelCostPerGal * 100) / 100;

  const towVehicleCanHandle = trailerTotalWeight <= config.towVehicleMaxTow;

  let recommendation = "";
  if (!towVehicleCanHandle) {
    recommendation = "Trailer weight exceeds tow vehicle capacity. Drive the UTV or use a lighter trailer.";
  } else if (trailerFuelCost < driveFuelCost * 0.7) {
    recommendation = "Trailering is significantly cheaper. Recommended for long highway distances.";
  } else if (driveFuelCost < trailerFuelCost * 0.7) {
    recommendation = "Driving the UTV is cheaper. Consider direct drive if road-legal.";
  } else {
    recommendation = "Costs are similar. Consider convenience, road legality, and wear on the UTV.";
  }

  return {
    driveFuelCost,
    driveTimeMiles: config.driveMiles,
    trailerFuelCost,
    trailerTongueWeight: tongueWeight,
    trailerTotalWeight,
    towVehicleCanHandle,
    recommendation,
  };
}

// ─── Compute: 14-Day Certified Badge ─────────────────────────────────

export function computeCertifiedBadge(
  config: RigRatedConfig,
  payload: PayloadBudget,
  legalStatuses: { stateCode: string; status: "green" | "yellow" | "red" }[]
): CertifiedBadge {
  const machine = getMachine(config);

  // Check 1: Payload under 80%
  const payloadUnder80 = payload.payloadPct < 80;

  // Check 2: At least one selected state is green
  const selectedLegal = legalStatuses.filter((s) =>
    config.selectedStates.includes(s.stateCode)
  );
  const legalOk = selectedLegal.length === 0 || selectedLegal.some((s) => s.status === "green");

  // Check 3: Fuel range covers the longest selected trail fuel distance
  const estimatedMpg = machine.bodyType.includes("sport") ? 8 : 12;
  const totalFuel = machine.fuelCapacityGal + (config.gearPreset?.spareFuelGal ?? 0);
  const rangeMiles = totalFuel * estimatedMpg;
  const fuelRange = rangeMiles >= 60; // at least 60 miles range

  // Check 4: Recovery gear (must have recovery weight in gear)
  const recoveryWeight = config.useCustomGear
    ? config.customRecoveryLbs
    : config.gearPreset?.recoveryKitLbs ?? 0;
  const recoveryGear = recoveryWeight >= 10;

  // Check 5: Adequate water supply (at least 1 gal per person per day for 3 days)
  const people = config.adults + config.children;
  const waterGal = config.useCustomGear
    ? config.customWaterGal
    : (config.gearPreset?.waterGalPerPerson ?? 0) * people;
  const waterSupply = people > 0 ? waterGal >= people * 3 : true;

  const earned = payloadUnder80 && legalOk && fuelRange && recoveryGear && waterSupply;

  // Calculate days capable based on water and food
  const daysCapable = config.durationDays || (config.gearPreset?.durationDays ?? 0);

  return {
    earned,
    checks: { payloadUnder80, legalOk, fuelRange, recoveryGear, waterSupply },
    daysCapable,
  };
}

// ─── Compute: Warnings ────────────────────────────────────────────────

export function computeWarnings(
  config: RigRatedConfig,
  payload: PayloadBudget,
  modifiedPayload: PayloadBudget | null,
  stability: { index: number; note: string },
  trailScores: TrailScore[]
): RigRatedWarning[] {
  const w: RigRatedWarning[] = [];

  // Payload warnings (based on stock spec)
  if (payload.payloadPct >= 100) {
    const modNote = modifiedPayload && modifiedPayload.payloadPct < 100
      ? ` (Effective capacity with suspension upgrade: ${modifiedPayload.payloadPct}%)`
      : "";
    w.push({
      level: "danger",
      message: `MFR payload EXCEEDED by ${Math.abs(payload.remaining)} lbs (${payload.payloadPct}%).${modNote} Remove gear or accessories before riding.`,
    });
  } else if (payload.payloadPct >= 90) {
    const modNote = modifiedPayload
      ? ` Effective with suspension upgrade: ${modifiedPayload.payloadPct}%.`
      : "";
    w.push({
      level: "warning",
      message: `MFR payload at ${payload.payloadPct}%. Very limited margin.${modNote}`,
    });
  } else if (payload.payloadPct >= 85) {
    w.push({
      level: "warning",
      message: `MFR payload at ${payload.payloadPct}%. Within safety margin zone. Leave 10-20% buffer.`,
    });
  } else if (payload.payloadPct >= 70) {
    w.push({
      level: "info",
      message: `MFR payload at ${payload.payloadPct}%. Approaching recommended 10-20% safety margin.`,
    });
  }

  // Stability warnings
  if (stability.index < 4) {
    w.push({
      level: "warning",
      message: `Low stability index (${stability.index}/10). ${stability.note}`,
    });
  } else if (stability.index < 6) {
    w.push({
      level: "info",
      message: `Moderate stability index (${stability.index}/10). ${stability.note}`,
    });
  }

  // Trail red flags
  const redTrails = trailScores.filter((t) => t.overall === "red");
  if (redTrails.length > 0) {
    w.push({
      level: "danger",
      message: `${redTrails.length} trail(s) flagged red: ${redTrails.map((t) => t.trailName).join(", ")}. Your rig may not be compatible.`,
    });
  }

  // No recovery gear warning
  const recoveryWeight = config.useCustomGear
    ? config.customRecoveryLbs
    : config.gearPreset?.recoveryKitLbs ?? 0;
  if (recoveryWeight < 10) {
    w.push({
      level: "warning",
      message: "No recovery gear detected. Always carry a tow strap, shackles, and basic recovery kit on trails.",
    });
  }

  // Brake fade warning at 80%+ load
  const effectivePct = modifiedPayload ? modifiedPayload.payloadPct : payload.payloadPct;
  if (effectivePct >= 80) {
    w.push({
      level: "warning",
      message: "Brakes overheat faster at 80%+ load. Consider upgraded brake pads for sustained downhill braking.",
    });
  }

  // Low water warning
  const people = config.adults + config.children;
  const waterGal = config.useCustomGear
    ? config.customWaterGal
    : (config.gearPreset?.waterGalPerPerson ?? 0) * people;
  if (people > 0 && waterGal < people * 1) {
    w.push({
      level: "danger",
      message: "Less than 1 gallon of water per person. FEMA minimum is 1 gallon per person per day.",
    });
  }

  return w;
}

// ─── Compute: Weight Breakdown ────────────────────────────────────────

export function computeWeightBreakdown(payload: PayloadBudget): {
  label: string;
  value: number;
  color: string;
}[] {
  const items: { label: string; value: number; color: string }[] = [];

  if (payload.accessoriesWeight > 0)
    items.push({ label: "Accessories", value: payload.accessoriesWeight, color: "#6B7280" });
  if (payload.occupantWeight > 0)
    items.push({ label: "Occupants", value: payload.occupantWeight, color: "#6366F1" });
  if (payload.gearWeight > 0)
    items.push({ label: "Gear & Supplies", value: payload.gearWeight, color: "#10B981" });
  if (payload.fuelWeight > 0)
    items.push({ label: "Fuel", value: payload.fuelWeight, color: "#F59E0B" });

  return items.sort((a, b) => b.value - a.value);
}

// ─── Master Compute ───────────────────────────────────────────────────

export function computeAll(
  config: RigRatedConfig,
  accessoryDb: UTVAccessory[],
  trailDb: TrailProfile[],
  stateLegalDb: StateLegalInfo[]
): RigRatedResult {
  const payload = computePayload(config, accessoryDb);
  const modifiedPayload = computeModifiedPayload(payload, config.selectedSuspension);
  const axleDistribution = computeAxleDistribution(config, accessoryDb);
  const stability = computeStabilityIndex(config, payload);
  const trailScores = computeTrailCompatibility(config, trailDb);
  const legalStatuses = computeLegalStatuses(config, stateLegalDb);
  const driveVsTrailer = computeDriveVsTrailer(config);
  const certifiedBadge = computeCertifiedBadge(config, payload, legalStatuses);
  const weightBreakdown = computeWeightBreakdown(payload);
  const warnings = computeWarnings(config, payload, modifiedPayload, stability, trailScores);

  // GVWR breakdowns for dual donuts
  const stockGVWR = computeGVWRBreakdown(payload);
  const effectiveGVWR = modifiedPayload
    ? computeGVWRBreakdown(modifiedPayload)
    : stockGVWR;

  // Suspension gain details for UI
  const suspensionGain = computeSuspensionGain(
    payload.payloadCapacity,
    config.selectedSuspension
  );

  // Fun message
  const funMessage = generateFunMessage(
    payload,
    suspensionGain,
    accessoryDb,
    config.selectedAccessories
  );

  // Tire/wheel delta for display
  const machine = getMachine(config);
  const tireWheelDelta = computeTireWheelDelta(config, machine);

  // Overall status — use effective (modified if active) payload for color thresholds
  const effectivePct = modifiedPayload ? modifiedPayload.payloadPct : payload.payloadPct;
  let overallStatus: "green" | "yellow" | "orange" | "red" = "green";
  if (effectivePct >= 100) overallStatus = "red";
  else if (effectivePct >= 90) overallStatus = "orange";
  else if (effectivePct >= 70) overallStatus = "yellow";

  return {
    payload,
    modifiedPayload,
    axleDistribution,
    stabilityIndex: stability.index,
    stabilityNote: stability.note,
    trailScores,
    legalStatuses,
    driveVsTrailer,
    certifiedBadge,
    weightBreakdown,
    stockGVWR,
    effectiveGVWR,
    suspensionGain,
    funMessage,
    tireWheelDelta,
    warnings,
    overallStatus,
  };
}

// ─── Default Config ───────────────────────────────────────────────────

export const defaultTripPlan: TripPlanData = {
  tripName: "",
  startDate: "",
  endDate: "",
  trailRoute: "",
  roster: [{ name: "", medical: "", emergencyContact: "", emergencyPhone: "" }],
  commPlan: "",
  checkInSchedule: "",
  satelliteDevice: "",
  waypoints: [{ name: "", notes: "", isOvernight: false }],
  nearestHospital: "",
  nearestFuel: "",
  nearestTowing: "",
  recoveryCapability: "",
  backupPlan: "",
  leaveBehindName: "",
  leaveBehindPhone: "",
};

export const defaultRigRatedConfig: RigRatedConfig = {
  machine: null,
  manualMachine: {
    make: "",
    model: "",
    year: 2024,
    bodyType: "2-seat-utility",
    seatingCapacity: 2,
    dryWeightLbs: 1500,
    gvwrLbs: 2200,
    payloadCapacityLbs: 700,
    towingCapacityLbs: 2000,
    groundClearanceIn: 12,
    wheelbaseIn: 90,
    trackWidthFrontIn: 62,
    trackWidthRearIn: 62,
    overallWidthIn: 64,
    overallHeightIn: 76,
    horsePower: 80,
    fuelCapacityGal: 10,
    tireSize: "27x9R14",
    bedLengthIn: 36,
    bedWidthIn: 48,
  },
  useManual: false,

  selectedAccessories: [],
  instagramMode: false,

  adults: 2,
  children: 0,
  avgAdultLbs: DEFAULT_OCCUPANT_LBS,
  avgChildLbs: 80,

  durationDays: 3,
  gearPreset: null,
  customFoodLbs: 0,
  customWaterGal: 0,
  customSpareFuelGal: 0,
  customCoolerLbs: 0,
  customRecoveryLbs: 0,
  customToolsLbs: 0,
  customCampingLbs: 0,
  customOtherLbs: 0,
  useCustomGear: false,

  selectedTrails: [],
  legalView: "unregistered",
  selectedStates: [],

  selectedSuspension: null,
  selectedTires: null,
  selectedWheels: null,
  fuelCellFull: false,

  towVehicleWeight: 5000,
  towVehicleMaxTow: 7500,
  towVehicleMpg: 18,
  towVehicleFuelTankGal: 24,
  trailerWeightLbs: 800,
  driveMiles: 0,
  fuelCostPerGal: 3.50,

  tripPlan: defaultTripPlan,
};

export const RIGRATED_KEY = "pe-rigrated";
