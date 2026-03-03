import type { UTVMachine, UTVBodyType } from "./rigrated-machines";
import type { UTVAccessory } from "./rigrated-accessories";
import type { TrailProfile } from "./rigrated-trails";
import { parseTireDiameter } from "./rigrated-trails";
import type { StateLegalInfo, LegalView } from "./rigrated-legal";
import { getLegalStatus } from "./rigrated-legal";
import type { GearPreset } from "./rigrated-gear-presets";
import { WATER_LBS_PER_GALLON, FUEL_LBS_PER_GALLON, DEFAULT_OCCUPANT_LBS } from "./rigrated-gear-presets";

export interface RigRatedConfig {
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

  selectedAccessories: string[];
  instagramMode: boolean;

  adults: number;
  children: number;
  avgAdultLbs: number;
  avgChildLbs: number;

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

  selectedTrails: string[];

  legalView: LegalView;
  selectedStates: string[];

  towVehicleWeight: number;
  towVehicleMaxTow: number;
  towVehicleMpg: number;
  towVehicleFuelTankGal: number;
  trailerWeightLbs: number;
  driveMiles: number;
  fuelCostPerGal: number;

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

export interface RigRatedResult {
  payload: PayloadBudget;
  axleDistribution: { frontPct: number; rearPct: number };

  stabilityIndex: number;
  stabilityNote: string;

  trailScores: TrailScore[];

  legalStatuses: { stateCode: string; status: "green" | "yellow" | "red" }[];

  driveVsTrailer: DriveVsTrailerResult | null;

  certifiedBadge: CertifiedBadge;

  weightBreakdown: { label: string; value: number; color: string }[];

  warnings: RigRatedWarning[];

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

function getMachine(config: RigRatedConfig) {
  if (config.useManual || !config.machine) {
    return config.manualMachine;
  }
  return config.machine;
}

export function computePayload(
  config: RigRatedConfig,
  accessoryDb: UTVAccessory[]
): PayloadBudget {
  const machine = getMachine(config);

  const dryWeight = machine.dryWeightLbs;

  const accessoriesWeight = config.selectedAccessories.reduce((sum, id) => {
    const acc = accessoryDb.find((a) => a.id === id);
    return sum + (acc?.weightLbs ?? 0);
  }, 0);

  const occupantWeight =
    config.adults * config.avgAdultLbs +
    config.children * config.avgChildLbs;

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

  const gearWeight = computeGearWeight(config);
  rearWeight += gearWeight;

  const occupantWeight = config.adults * config.avgAdultLbs + config.children * config.avgChildLbs;
  frontWeight += occupantWeight * 0.5;
  rearWeight += occupantWeight * 0.5;

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

export function computeStabilityIndex(
  config: RigRatedConfig,
  payload: PayloadBudget
): { index: number; note: string } {
  const machine = getMachine(config);

  const avgTrackWidth = (machine.trackWidthFrontIn + machine.trackWidthRearIn) / 2;
  const widthScore = Math.min(10, (avgTrackWidth / 72) * 10);

  const loadPct = payload.payloadPct / 100;
  const cgPenalty = loadPct * 2;

  const heightPenalty = Math.max(0, (machine.overallHeightIn - 70) / 10);

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

export function computeTrailCompatibility(
  config: RigRatedConfig,
  trailDb: TrailProfile[]
): TrailScore[] {
  const machine = getMachine(config);

  return trailDb.map((trail) => {
    const widthOk = machine.overallWidthIn <= trail.minWidthIn + 8;
    const clearanceOk = machine.groundClearanceIn >= trail.minClearanceIn;

    const machineTireDia = parseTireDiameter(machine.tireSize);
    const trailTireDia = parseTireDiameter(trail.minTireSize);
    const tiresOk = machineTireDia >= trailTireDia;

    const estimatedMpg = machine.bodyType.includes("sport") ? 8 : 12;
    const totalFuel = machine.fuelCapacityGal + (config.gearPreset?.spareFuelGal ?? 0);
    const rangeMiles = totalFuel * estimatedMpg;
    const fuelRangeOk = rangeMiles >= trail.fuelDistanceMiles;

    let difficultyNote = "";
    if (trail.difficulty <= 4) difficultyNote = "Beginner-friendly. Most UTVs can handle this.";
    else if (trail.difficulty <= 6) difficultyNote = "Moderate. Recovery gear recommended.";
    else if (trail.difficulty <= 8) difficultyNote = "Advanced. Skid plates, rock sliders, and winch recommended.";
    else difficultyNote = "Expert only. Full armor, recovery gear, and experienced driver required.";

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

export function computeLegalStatuses(
  config: RigRatedConfig,
  stateLegalDb: StateLegalInfo[]
): { stateCode: string; status: "green" | "yellow" | "red" }[] {
  return stateLegalDb.map((state) => ({
    stateCode: state.stateCode,
    status: getLegalStatus(state, config.legalView),
  }));
}

export function computeDriveVsTrailer(config: RigRatedConfig): DriveVsTrailerResult | null {
  if (config.driveMiles <= 0 || config.towVehicleMaxTow <= 0) return null;

  const machine = getMachine(config);

  const utvMpg = machine.bodyType.includes("sport") ? 8 : 12;
  const driveFuelGal = config.driveMiles / utvMpg;
  const driveFuelCost = Math.round(driveFuelGal * config.fuelCostPerGal * 100) / 100;

  const utvWeight = machine.dryWeightLbs;
  const trailerTotalWeight = config.trailerWeightLbs + utvWeight;
  const tongueWeight = Math.round(trailerTotalWeight * 0.12);

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

export function computeCertifiedBadge(
  config: RigRatedConfig,
  payload: PayloadBudget,
  legalStatuses: { stateCode: string; status: "green" | "yellow" | "red" }[]
): CertifiedBadge {
  const machine = getMachine(config);

  const payloadUnder80 = payload.payloadPct < 80;

  const selectedLegal = legalStatuses.filter((s) =>
    config.selectedStates.includes(s.stateCode)
  );
  const legalOk = selectedLegal.length === 0 || selectedLegal.some((s) => s.status === "green");

  const estimatedMpg = machine.bodyType.includes("sport") ? 8 : 12;
  const totalFuel = machine.fuelCapacityGal + (config.gearPreset?.spareFuelGal ?? 0);
  const rangeMiles = totalFuel * estimatedMpg;
  const fuelRange = rangeMiles >= 60;

  const recoveryWeight = config.useCustomGear
    ? config.customRecoveryLbs
    : config.gearPreset?.recoveryKitLbs ?? 0;
  const recoveryGear = recoveryWeight >= 10;

  const people = config.adults + config.children;
  const waterGal = config.useCustomGear
    ? config.customWaterGal
    : (config.gearPreset?.waterGalPerPerson ?? 0) * people;
  const waterSupply = people > 0 ? waterGal >= people * 3 : true;

  const earned = payloadUnder80 && legalOk && fuelRange && recoveryGear && waterSupply;

  const daysCapable = config.durationDays || (config.gearPreset?.durationDays ?? 0);

  return {
    earned,
    checks: { payloadUnder80, legalOk, fuelRange, recoveryGear, waterSupply },
    daysCapable,
  };
}

export function computeWarnings(
  config: RigRatedConfig,
  payload: PayloadBudget,
  stability: { index: number; note: string },
  trailScores: TrailScore[]
): RigRatedWarning[] {
  const w: RigRatedWarning[] = [];

  if (payload.payloadPct >= 100) {
    w.push({
      level: "danger",
      message: `Payload EXCEEDED by ${Math.abs(payload.remaining)} lbs (${payload.payloadPct}%). Remove gear or accessories before riding.`,
    });
  } else if (payload.payloadPct >= 90) {
    w.push({
      level: "warning",
      message: `Payload at ${payload.payloadPct}%. Very limited margin. Any additional weight risks exceeding GVWR.`,
    });
  } else if (payload.payloadPct >= 85) {
    w.push({
      level: "warning",
      message: `Payload at ${payload.payloadPct}%. Within safety margin zone. Leave 10-20% buffer.`,
    });
  } else if (payload.payloadPct >= 70) {
    w.push({
      level: "info",
      message: `Payload at ${payload.payloadPct}%. Approaching recommended 10-20% safety margin.`,
    });
  }

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

  const redTrails = trailScores.filter((t) => t.overall === "red");
  if (redTrails.length > 0) {
    w.push({
      level: "danger",
      message: `${redTrails.length} trail(s) flagged red: ${redTrails.map((t) => t.trailName).join(", ")}. Your rig may not be compatible.`,
    });
  }

  const recoveryWeight = config.useCustomGear
    ? config.customRecoveryLbs
    : config.gearPreset?.recoveryKitLbs ?? 0;
  if (recoveryWeight < 10) {
    w.push({
      level: "warning",
      message: "No recovery gear detected. Always carry a tow strap, shackles, and basic recovery kit on trails.",
    });
  }

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

export function computeAll(
  config: RigRatedConfig,
  accessoryDb: UTVAccessory[],
  trailDb: TrailProfile[],
  stateLegalDb: StateLegalInfo[]
): RigRatedResult {
  const payload = computePayload(config, accessoryDb);
  const axleDistribution = computeAxleDistribution(config, accessoryDb);
  const stability = computeStabilityIndex(config, payload);
  const trailScores = computeTrailCompatibility(config, trailDb);
  const legalStatuses = computeLegalStatuses(config, stateLegalDb);
  const driveVsTrailer = computeDriveVsTrailer(config);
  const certifiedBadge = computeCertifiedBadge(config, payload, legalStatuses);
  const weightBreakdown = computeWeightBreakdown(payload);
  const warnings = computeWarnings(config, payload, stability, trailScores);

  let overallStatus: "green" | "yellow" | "orange" | "red" = "green";
  if (payload.payloadPct >= 100) overallStatus = "red";
  else if (payload.payloadPct >= 90) overallStatus = "orange";
  else if (payload.payloadPct >= 70) overallStatus = "yellow";

  return {
    payload,
    axleDistribution,
    stabilityIndex: stability.index,
    stabilityNote: stability.note,
    trailScores,
    legalStatuses,
    driveVsTrailer,
    certifiedBadge,
    weightBreakdown,
    warnings,
    overallStatus,
  };
}

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
