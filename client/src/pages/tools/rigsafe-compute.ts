// ─── RigSafe Calculation Engine ─────────────────────────────────────
// Pure logic — no React. All functions are deterministic and testable.
//
// Three-chain load calculation:
//   Chain 1: Rack Load Budget (static / on-road dynamic / off-road dynamic)
//   Chain 2: Vehicle Payload Budget (GVWR - curb weight - everything)
//   Chain 3: Weakest Link Identification (rack vs vehicle roof rating)
//
// Safety margin: 10-20% buffer recommended. Gauge colors reflect this:
//   Green: 0-70% used (plenty of margin)
//   Yellow: 70-85% used (within safety margin zone)
//   Orange: 85-90% used (approaching limit — safety margin warning)
//   Red: 90-100%+ used (at or over limit)

import { GAS_LBS_PER_GALLON, DIESEL_LBS_PER_GALLON } from "./vehicle-types";
import type { RackEntry } from "./rigsafe-racks";
import type { TentEntry } from "./rigsafe-tents";
import type { AwningEntry } from "./rigsafe-awnings";
import type { TonneauEntry } from "./rigsafe-tonneaus";
import type { StockVehicle, BodyType } from "./vehicle-types";

// ─── Configuration Interfaces ───────────────────────────────────────

export interface CargoItem {
  id: string;
  name: string;
  weightLbs: number;
  qty: number;
}

export interface OccupantConfig {
  adults: number;
  avgAdultLbs: number;
  kids: number;
  avgKidLbs: number;
}

export type BeddingLevel = "light" | "full" | "custom";

export interface RigSafeConfig {
  // Vehicle
  vehicle: StockVehicle | null;
  manualVehicle: {
    year: number;
    make: string;
    model: string;
    curbWeightLbs: number;
    gvwrLbs: number;
    overallHeightIn: number;
    bedLengthIn: number | null;
    roofDynamicLbs: number;
    roofStaticLbs: number;
    bodyType: BodyType;
    fuelTankGal: number;
    engineType: "gas" | "diesel" | "hybrid" | "ev";
    wheelbaseIn: number;
    trackWidthIn: number;
    ssf: number;
    cgHeightIn: number;
  };
  useManual: boolean;

  // Mounting
  mountType: "bed-rack" | "roof-rack" | "cab-rack";
  rack: RackEntry | null;
  rackHeightSetting: number | null;
  manualRack: {
    weightLbs: number;
    staticLbs: number;
    onRoadDynamicLbs: number;
    offRoadDynamicLbs: number;
    heightIn: number;
  };
  useManualRack: boolean;

  // Tonneau (trucks only)
  tonneau: TonneauEntry | null;
  manualTonneau: { weightLbs: number; foldedHeightIn: number };
  useManualTonneau: boolean;
  hasTonneau: boolean;

  // Tent
  tent: TentEntry | null;
  manualTent: {
    weightLbs: number;
    closedHeightIn: number;
    closedLengthIn: number;
    closedWidthIn: number;
    openWidthIn: number;
    sleepsMarketing: number;
  };
  useManualTent: boolean;
  hasTent: boolean;

  // Annex
  hasAnnex: boolean;
  annexWeightLbs: number;
  annexSleeps: number;
  annexSide: "driver" | "passenger" | "rear";

  // Awning
  awning: AwningEntry | null;
  manualAwning: {
    totalWeightLbs: number;
    mountedBracketWeightLbs: number;
  };
  useManualAwning: boolean;
  hasAwning: boolean;
  awningSide: "driver" | "passenger" | "rear";
  hasWallKit: boolean;
  wallKitWeightLbs: number;
  wallKitSleeps: number;

  // Cargo on rack
  cargoItems: CargoItem[];

  // Occupants
  occupants: OccupantConfig;

  // Bedding
  beddingLevel: BeddingLevel;
  customBeddingLbsPerPerson: number;

  // Garage
  garageHeightIn: number;

  // Tongue weight (if towing)
  tongueWeightLbs: number;

  // ZIP climate
  climateZone: string | null;
}

// ─── Computed Results ───────────────────────────────────────────────

export interface RackBudget {
  rating: number;
  used: number;
  remaining: number;
  pct: number;
}

export interface RigSafeResult {
  // Chain 1: Rack load
  rackStatic: RackBudget;
  rackOnRoad: RackBudget;
  rackOffRoad: RackBudget;

  // Chain 2: Vehicle payload
  vehiclePayload: RackBudget;

  // Chain 3: Weakest link
  weakestLink: {
    component: "rack" | "vehicle-roof";
    staticLimit: number;
    dynamicLimit: number;
    offRoadLimit: number;
    staticBottleneck: string;
    dynamicBottleneck: string;
    offRoadBottleneck: string;
  };

  // Garage clearance
  totalHeightIn: number;
  garageFits: boolean;
  garageHeightIn: number;

  // Sleeping capacity
  sleepingCapacity: {
    tentComfort: number;
    tentTight: number;
    annexSleeps: number;
    wallKitSleeps: number;
    total: number;
  };

  // CG impact
  cgRaiseIn: number;
  stabilityNote: string;

  // Bed fitment
  bedOverhangIn: number;
  bedFitmentOk: boolean;

  // Tonneau clearance
  tonneauClearanceIn: number;
  tonneauClearanceOk: boolean;

  // Weight breakdown
  weightBreakdown: { label: string; value: number; color: string }[];

  // Warnings
  warnings: RigSafeWarning[];

  // Safety margin status
  safetyMarginStatus: "safe" | "margin-warning" | "over-limit";
}

export interface RigSafeWarning {
  level: "info" | "warning" | "danger";
  message: string;
}

// ─── Safety Margin Thresholds ───────────────────────────────────────

const SAFETY_MARGIN_ZONE = 0.80;
const WARNING_ZONE = 0.90;
const DANGER_ZONE = 1.0;

// ─── Helper: Get effective vehicle data ─────────────────────────────

function getVehicle(config: RigSafeConfig) {
  if (config.useManual || !config.vehicle) {
    return config.manualVehicle;
  }
  return {
    ...config.vehicle,
    cgHeightIn: config.vehicle.trackWidthIn / (2 * config.vehicle.ssf),
  };
}

function getRack(config: RigSafeConfig) {
  if (config.useManualRack || !config.rack) {
    return config.manualRack;
  }
  return {
    weightLbs: config.rack.weightLbs,
    staticLbs: config.rack.staticLbs,
    onRoadDynamicLbs: config.rack.onRoadDynamicLbs,
    offRoadDynamicLbs: config.rack.offRoadDynamicLbs,
    heightIn: config.rackHeightSetting ?? config.rack.heightSettings?.[0] ?? 20,
  };
}

function getTent(config: RigSafeConfig) {
  if (!config.hasTent) return null;
  if (config.useManualTent || !config.tent) {
    return config.manualTent;
  }
  return {
    weightLbs: config.tent.closedWeightLbs,
    closedHeightIn: config.tent.closedHeightIn,
    closedLengthIn: config.tent.closedLengthIn,
    closedWidthIn: config.tent.closedWidthIn,
    openWidthIn: config.tent.openWidthIn,
    sleepsMarketing: config.tent.sleepsMarketing,
  };
}

function getAwning(config: RigSafeConfig) {
  if (!config.hasAwning) return null;
  if (config.useManualAwning || !config.awning) {
    return config.manualAwning;
  }
  return {
    totalWeightLbs: config.awning.totalWeightLbs,
    mountedBracketWeightLbs: config.awning.mountedBracketWeightLbs,
  };
}

function getTonneau(config: RigSafeConfig) {
  if (!config.hasTonneau) return null;
  if (config.useManualTonneau || !config.tonneau) {
    return config.manualTonneau;
  }
  return {
    weightLbs: config.tonneau.weightLbs,
    foldedHeightIn: config.tonneau.foldedHeightIn,
  };
}

// ─── Compute: Rack Load Budget ──────────────────────────────────────

export function computeRackLoad(config: RigSafeConfig): {
  static: RackBudget;
  onRoad: RackBudget;
  offRoad: RackBudget;
} {
  const rack = getRack(config);
  const tent = getTent(config);
  const awning = getAwning(config);

  const tentWeight = tent?.weightLbs ?? 0;
  const awningBracketWeight = awning?.mountedBracketWeightLbs ?? 0;

  const cargoWeight = config.cargoItems.reduce((sum, item) => sum + item.weightLbs * item.qty, 0);

  const totalOccupantWeight =
    config.occupants.adults * config.occupants.avgAdultLbs +
    config.occupants.kids * config.occupants.avgKidLbs;

  let beddingPerPerson = 0;
  if (config.beddingLevel === "light") beddingPerPerson = 10;
  else if (config.beddingLevel === "full") beddingPerPerson = 20;
  else beddingPerPerson = config.customBeddingLbsPerPerson;
  const totalSleepers = config.occupants.adults + config.occupants.kids;
  const beddingWeight = beddingPerPerson * totalSleepers;

  const dynamicLoad = tentWeight + awningBracketWeight + cargoWeight;

  const staticLoad = dynamicLoad + totalOccupantWeight + beddingWeight;

  const mkBudget = (rating: number, used: number): RackBudget => ({
    rating,
    used: Math.round(used),
    remaining: Math.round(rating - used),
    pct: rating > 0 ? Math.round((used / rating) * 100) : 0,
  });

  return {
    static: mkBudget(rack.staticLbs, staticLoad),
    onRoad: mkBudget(rack.onRoadDynamicLbs, dynamicLoad),
    offRoad: mkBudget(rack.offRoadDynamicLbs, dynamicLoad),
  };
}

// ─── Compute: Vehicle Payload Budget ────────────────────────────────

export function computePayload(config: RigSafeConfig): RackBudget {
  const vehicle = getVehicle(config);
  const rack = getRack(config);
  const tent = getTent(config);
  const awning = getAwning(config);
  const tonneau = getTonneau(config);

  const payload = vehicle.gvwrLbs - vehicle.curbWeightLbs;

  let used = 0;

  used += rack.weightLbs;

  if (tonneau) used += tonneau.weightLbs;

  if (tent) used += tent.weightLbs;

  if (awning) used += awning.totalWeightLbs;

  if (config.hasWallKit) used += config.wallKitWeightLbs;

  if (config.hasAnnex) used += config.annexWeightLbs;

  used += config.cargoItems.reduce((sum, item) => sum + item.weightLbs * item.qty, 0);

  used +=
    config.occupants.adults * config.occupants.avgAdultLbs +
    config.occupants.kids * config.occupants.avgKidLbs;

  const fuelLbsPerGal =
    vehicle.engineType === "diesel" ? DIESEL_LBS_PER_GALLON : GAS_LBS_PER_GALLON;
  used += vehicle.fuelTankGal * fuelLbsPerGal;

  used += config.tongueWeightLbs;

  return {
    rating: Math.round(payload),
    used: Math.round(used),
    remaining: Math.round(payload - used),
    pct: payload > 0 ? Math.round((used / payload) * 100) : 0,
  };
}

// ─── Compute: Weakest Link ──────────────────────────────────────────

export function computeWeakestLink(config: RigSafeConfig) {
  const vehicle = getVehicle(config);
  const rack = getRack(config);

  const vehStatic = vehicle.roofStaticLbs;
  const vehDynamic = vehicle.roofDynamicLbs;
  const vehOffRoad = Math.round(vehicle.roofDynamicLbs * 0.75);

  const rackStatic = rack.staticLbs;
  const rackDynamic = rack.onRoadDynamicLbs;
  const rackOffRoad = rack.offRoadDynamicLbs;

  return {
    component: (rackDynamic <= vehDynamic ? "rack" : "vehicle-roof") as "rack" | "vehicle-roof",
    staticLimit: Math.min(vehStatic, rackStatic),
    dynamicLimit: Math.min(vehDynamic, rackDynamic),
    offRoadLimit: Math.min(vehOffRoad, rackOffRoad),
    staticBottleneck: rackStatic <= vehStatic ? "Rack" : "Vehicle Roof",
    dynamicBottleneck: rackDynamic <= vehDynamic ? "Rack" : "Vehicle Roof",
    offRoadBottleneck: rackOffRoad <= vehOffRoad ? "Rack" : "Vehicle Roof",
  };
}

// ─── Compute: Garage Clearance ──────────────────────────────────────

export function computeGarageClearance(config: RigSafeConfig): {
  totalHeightIn: number;
  fits: boolean;
  garageHeightIn: number;
} {
  const vehicle = getVehicle(config);
  const rack = getRack(config);
  const tent = getTent(config);

  let totalHeight = vehicle.overallHeightIn;

  totalHeight += rack.heightIn;

  if (tent) totalHeight += tent.closedHeightIn;

  return {
    totalHeightIn: Math.round(totalHeight * 10) / 10,
    fits: totalHeight <= config.garageHeightIn,
    garageHeightIn: config.garageHeightIn,
  };
}

// ─── Compute: Sleeping Capacity ─────────────────────────────────────

export function computeSleepingCapacity(config: RigSafeConfig): {
  tentComfort: number;
  tentTight: number;
  annexSleeps: number;
  wallKitSleeps: number;
  total: number;
} {
  const tent = config.tent;
  let tentComfort = 0;
  let tentTight = 0;

  if (config.hasTent && tent) {
    const adultWidth = 24;
    const gap = 6;
    const w = tent.openWidthIn;
    tentComfort = Math.max(1, Math.floor((w + gap) / (adultWidth + gap)));
    tentTight = Math.max(1, Math.floor(w / adultWidth));
  } else if (config.hasTent && config.useManualTent) {
    const w = config.manualTent.openWidthIn;
    const adultWidth = 24;
    const gap = 6;
    tentComfort = Math.max(1, Math.floor((w + gap) / (adultWidth + gap)));
    tentTight = Math.max(1, Math.floor(w / adultWidth));
  }

  const annexSleeps = config.hasAnnex ? config.annexSleeps : 0;
  const wallKitSleeps = config.hasWallKit ? config.wallKitSleeps : 0;

  return {
    tentComfort,
    tentTight,
    annexSleeps,
    wallKitSleeps,
    total: tentComfort + annexSleeps + wallKitSleeps,
  };
}

// ─── Compute: CG Impact ────────────────────────────────────────────

export function computeCgImpact(config: RigSafeConfig): {
  cgRaiseIn: number;
  stabilityNote: string;
} {
  const vehicle = getVehicle(config);
  const rack = getRack(config);
  const tent = getTent(config);

  const tentWeight = tent?.weightLbs ?? 0;
  const cargoWeight = config.cargoItems.reduce((sum, i) => sum + i.weightLbs * i.qty, 0);
  const roofLoad = tentWeight + cargoWeight + rack.weightLbs;

  if (roofLoad === 0) return { cgRaiseIn: 0, stabilityNote: "No roof load — CG unchanged." };

  const vehicleMass = vehicle.curbWeightLbs;
  const loadHeight = vehicle.overallHeightIn + rack.heightIn + (tent ? tent.closedHeightIn / 2 : 0);
  const cgVehicle = vehicle.cgHeightIn;

  const newCg = (vehicleMass * cgVehicle + roofLoad * loadHeight) / (vehicleMass + roofLoad);
  const cgRaise = newCg - cgVehicle;

  let note = "";
  if (cgRaise < 1) note = "Minimal CG impact. Normal driving behavior expected.";
  else if (cgRaise < 2) note = "Slight CG raise. Be aware on off-camber terrain.";
  else if (cgRaise < 3) note = "Moderate CG raise. Avoid aggressive off-camber terrain at speed.";
  else note = "Significant CG raise. Reduce speed on curves and off-camber terrain. Roll risk elevated.";

  return {
    cgRaiseIn: Math.round(cgRaise * 10) / 10,
    stabilityNote: note,
  };
}

// ─── Compute: Bed Fitment ──────────────────────────────────────────

export function computeBedFitment(config: RigSafeConfig): {
  overhangIn: number;
  fits: boolean;
} {
  const vehicle = getVehicle(config);
  const tent = getTent(config);

  if (!tent || !vehicle.bedLengthIn) return { overhangIn: 0, fits: true };

  const overhang = tent.closedLengthIn - vehicle.bedLengthIn;
  return {
    overhangIn: Math.round(Math.max(0, overhang) * 10) / 10,
    fits: overhang <= 0,
  };
}

// ─── Compute: Tonneau Fold Clearance ───────────────────────────────

export function computeTonneauClearance(config: RigSafeConfig): {
  clearanceIn: number;
  ok: boolean;
} {
  const rack = getRack(config);
  const tonneau = getTonneau(config);

  if (!tonneau || tonneau.foldedHeightIn === 0) return { clearanceIn: 99, ok: true };

  const clearance = rack.heightIn - tonneau.foldedHeightIn;
  return {
    clearanceIn: Math.round(clearance * 10) / 10,
    ok: clearance >= 2,
  };
}

// ─── Compute: Weight Breakdown ─────────────────────────────────────

export function computeWeightBreakdown(config: RigSafeConfig): {
  label: string;
  value: number;
  color: string;
}[] {
  const items: { label: string; value: number; color: string }[] = [];
  const rack = getRack(config);
  const tent = getTent(config);
  const awning = getAwning(config);
  const tonneau = getTonneau(config);

  if (rack.weightLbs > 0) items.push({ label: "Rack", value: rack.weightLbs, color: "#6B7280" });
  if (tent) items.push({ label: "Tent", value: tent.weightLbs, color: "#3B82F6" });
  if (awning) items.push({ label: "Awning", value: awning.totalWeightLbs, color: "#10B981" });
  if (tonneau) items.push({ label: "Tonneau", value: tonneau.weightLbs, color: "#8B5CF6" });
  if (config.hasAnnex && config.annexWeightLbs > 0)
    items.push({ label: "Annex", value: config.annexWeightLbs, color: "#F59E0B" });
  if (config.hasWallKit && config.wallKitWeightLbs > 0)
    items.push({ label: "Wall Kit", value: config.wallKitWeightLbs, color: "#EC4899" });

  const cargoWeight = config.cargoItems.reduce((sum, i) => sum + i.weightLbs * i.qty, 0);
  if (cargoWeight > 0) items.push({ label: "Cargo", value: cargoWeight, color: "#EF4444" });

  const occupantWeight =
    config.occupants.adults * config.occupants.avgAdultLbs +
    config.occupants.kids * config.occupants.avgKidLbs;
  if (occupantWeight > 0) items.push({ label: "Occupants", value: occupantWeight, color: "#6366F1" });

  return items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
}

// ─── Compute: Warnings ─────────────────────────────────────────────

export function computeWarnings(config: RigSafeConfig, result: Omit<RigSafeResult, "warnings" | "safetyMarginStatus">): RigSafeWarning[] {
  const w: RigSafeWarning[] = [];

  if (result.rackOffRoad.pct >= 100) {
    w.push({ level: "danger", message: `Off-road dynamic budget EXCEEDED (${result.rackOffRoad.pct}%). Remove rack cargo before hitting trails.` });
  } else if (result.rackOffRoad.pct >= 85) {
    w.push({ level: "warning", message: `Off-road dynamic budget at ${result.rackOffRoad.pct}%. You are within the safety margin zone. Always leave 10-20% buffer to prevent overload.` });
  } else if (result.rackOffRoad.pct >= 80) {
    w.push({ level: "info", message: `Off-road dynamic budget at ${result.rackOffRoad.pct}%. Approaching the recommended 10-20% safety margin. Consider reducing rack load.` });
  }

  if (result.rackOnRoad.pct >= 100) {
    w.push({ level: "danger", message: `On-road dynamic budget EXCEEDED (${result.rackOnRoad.pct}%). Over-limit for highway driving.` });
  } else if (result.rackOnRoad.pct >= 85) {
    w.push({ level: "warning", message: `On-road dynamic budget at ${result.rackOnRoad.pct}%. Within safety margin zone. Leave 10-20% buffer.` });
  }

  if (result.rackStatic.pct >= 100) {
    w.push({ level: "danger", message: `Static budget EXCEEDED (${result.rackStatic.pct}%). Too much weight for sleeping in tent.` });
  } else if (result.rackStatic.pct >= 85) {
    w.push({ level: "warning", message: `Static budget at ${result.rackStatic.pct}%. Leave 10-20% margin for safety.` });
  }

  if (result.vehiclePayload.pct >= 100) {
    w.push({ level: "danger", message: `Vehicle payload EXCEEDED by ${Math.abs(result.vehiclePayload.remaining)} lbs. Brakes, suspension, and tires operating beyond rated capacity.` });
  } else if (result.vehiclePayload.pct >= 90) {
    w.push({ level: "warning", message: `Vehicle payload at ${result.vehiclePayload.pct}%. Very limited margin remaining.` });
  }

  if (!result.garageFits) {
    const over = Math.round(result.totalHeightIn - result.garageHeightIn);
    w.push({ level: "danger", message: `Total height ${result.totalHeightIn}" exceeds ${result.garageHeightIn}" garage. WILL NOT FIT (${over}" over).` });
  }

  if (result.bedOverhangIn > 0) {
    w.push({ level: "warning", message: `Tent overhangs bed by ${result.bedOverhangIn}". Verify cab/tailgate clearance.` });
  }

  if (result.cgRaiseIn >= 3) {
    w.push({ level: "warning", message: `CG raised ~${result.cgRaiseIn}". ${result.stabilityNote}` });
  } else if (result.cgRaiseIn >= 2) {
    w.push({ level: "info", message: `CG raised ~${result.cgRaiseIn}". ${result.stabilityNote}` });
  }

  if (!result.tonneauClearanceOk) {
    w.push({ level: "warning", message: `Tonneau fold clearance only ${result.tonneauClearanceIn}". May interfere with rack. Need 2"+ gap.` });
  }

  if (config.hasAwning && config.hasAnnex) {
    if (config.awningSide === config.annexSide) {
      w.push({ level: "danger", message: `${config.awningSide.charAt(0).toUpperCase() + config.awningSide.slice(1)}-side awning + ${config.annexSide}-side annex = CONFLICT. Both deploy to the same side.` });
    } else {
      w.push({ level: "info", message: `${config.awningSide.charAt(0).toUpperCase() + config.awningSide.slice(1)}-side awning + ${config.annexSide}-side annex = compatible layout.` });
    }
  }

  if (config.climateZone === "cold") {
    w.push({ level: "info", message: "Cold/snow climate: Add 15-25 lbs for snow load on tent roof overnight. Factor into static budget." });
  } else if (config.climateZone === "hot-humid") {
    w.push({ level: "info", message: "Hot-humid climate: Condensation adds negligible weight but ventilation matters. Choose tent with good airflow." });
  }

  return w;
}

// ─── Master Compute ────────────────────────────────────────────────

export function computeAll(config: RigSafeConfig): RigSafeResult {
  const rackLoad = computeRackLoad(config);
  const payload = computePayload(config);
  const weakestLink = computeWeakestLink(config);
  const garage = computeGarageClearance(config);
  const sleeping = computeSleepingCapacity(config);
  const cg = computeCgImpact(config);
  const bedFit = computeBedFitment(config);
  const tonneauClear = computeTonneauClearance(config);
  const breakdown = computeWeightBreakdown(config);

  const partialResult = {
    rackStatic: rackLoad.static,
    rackOnRoad: rackLoad.onRoad,
    rackOffRoad: rackLoad.offRoad,
    vehiclePayload: payload,
    weakestLink,
    totalHeightIn: garage.totalHeightIn,
    garageFits: garage.fits,
    garageHeightIn: garage.garageHeightIn,
    sleepingCapacity: sleeping,
    cgRaiseIn: cg.cgRaiseIn,
    stabilityNote: cg.stabilityNote,
    bedOverhangIn: bedFit.overhangIn,
    bedFitmentOk: bedFit.fits,
    tonneauClearanceIn: tonneauClear.clearanceIn,
    tonneauClearanceOk: tonneauClear.ok,
    weightBreakdown: breakdown,
  };

  const warnings = computeWarnings(config, partialResult);

  const maxPct = Math.max(
    rackLoad.static.pct,
    rackLoad.onRoad.pct,
    rackLoad.offRoad.pct,
    payload.pct,
  );
  let safetyMarginStatus: "safe" | "margin-warning" | "over-limit" = "safe";
  if (maxPct >= 100) safetyMarginStatus = "over-limit";
  else if (maxPct >= 80) safetyMarginStatus = "margin-warning";

  return {
    ...partialResult,
    warnings,
    safetyMarginStatus,
  };
}

// ─── Default Config ────────────────────────────────────────────────

export const defaultRigSafeConfig: RigSafeConfig = {
  vehicle: null,
  manualVehicle: {
    year: 2024,
    make: "",
    model: "",
    curbWeightLbs: 5000,
    gvwrLbs: 7000,
    overallHeightIn: 76,
    bedLengthIn: 68,
    roofDynamicLbs: 150,
    roofStaticLbs: 450,
    bodyType: "crew-cab-short",
    fuelTankGal: 24,
    engineType: "gas",
    wheelbaseIn: 145,
    trackWidthIn: 67,
    ssf: 1.15,
    cgHeightIn: 29,
  },
  useManual: false,

  mountType: "bed-rack",
  rack: null,
  rackHeightSetting: null,
  manualRack: {
    weightLbs: 75,
    staticLbs: 700,
    onRoadDynamicLbs: 450,
    offRoadDynamicLbs: 225,
    heightIn: 20,
  },
  useManualRack: false,

  tonneau: null,
  manualTonneau: { weightLbs: 50, foldedHeightIn: 14 },
  useManualTonneau: false,
  hasTonneau: false,

  tent: null,
  manualTent: {
    weightLbs: 150,
    closedHeightIn: 12,
    closedLengthIn: 84,
    closedWidthIn: 54,
    openWidthIn: 54,
    sleepsMarketing: 2,
  },
  useManualTent: false,
  hasTent: false,

  hasAnnex: false,
  annexWeightLbs: 18,
  annexSleeps: 2,
  annexSide: "passenger",

  awning: null,
  manualAwning: { totalWeightLbs: 60, mountedBracketWeightLbs: 12 },
  useManualAwning: false,
  hasAwning: false,
  awningSide: "driver",
  hasWallKit: false,
  wallKitWeightLbs: 20,
  wallKitSleeps: 2,

  cargoItems: [],

  occupants: {
    adults: 2,
    avgAdultLbs: 180,
    kids: 0,
    avgKidLbs: 80,
  },

  beddingLevel: "full",
  customBeddingLbsPerPerson: 15,

  garageHeightIn: 84,

  tongueWeightLbs: 0,

  climateZone: null,
};

export const RIGSAFE_KEY = "pe-rigsafe";
