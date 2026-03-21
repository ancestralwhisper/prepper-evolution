// ─── RigSafe Calculation Engine ─────────────────────────────────────
// Pure logic — no React. All functions are deterministic and testable.
//
// Three-chain load calculation:
//   Chain 1: Rack Load Budget (static / on-road dynamic / off-road dynamic)
//   Chain 2: Vehicle Payload Budget (GVWR - curb weight - everything)
//   Chain 3: Weakest Link Identification (rack vs vehicle roof rating)
//

export const RIGSAFE_VERSION = "v2.0";

export const RIGSAFE_CHANGELOG: { version: string; date: string; changes: string[] }[] = [
  {
    version: "v2.0",
    date: "March 2026",
    changes: [
      "Per-item mount location — assign each cargo item to your bed rack, cab roof rack, or truck bed",
      "Cargo box mount routing — place your cargo box on whichever rack it actually lives on",
      "Per-rack load donuts — separate visual breakdown for each rack showing used vs remaining budget",
      "Per-person occupant weights — set exact weight for each adult and child",
      "Larger text throughout for better readability",
    ],
  },
  {
    version: "v1.0",
    date: "February 2026",
    changes: [
      "Initial release — three-chain load calculation (static, on-road dynamic, off-road dynamic)",
      "Vehicle payload budget, cab clearance analysis, and safety margin scoring",
      "RTT, awning, rack, cargo box, tonneau, and full vehicle mods support",
    ],
  },
];
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
import type { BumperEntry } from "./rigsafe-bumpers";
import type { WinchEntry } from "./rigsafe-winches";
import type { DrawerEntry } from "./rigsafe-drawers";
import type { FridgeEntry } from "./rigsafe-fridges";
import type { WaterTankEntry } from "./rigsafe-water-tanks";
import type { SkidPlateEntry } from "./rigsafe-skidplates";
import type { SpareCarrierEntry } from "./rigsafe-spare-carriers";
import type { SolarPanelEntry } from "./rigsafe-solar";
import type { LightBarEntry } from "./rigsafe-lightbars";
import type { SlideKitchenEntry } from "./rigsafe-kitchens";
import type { RecoveryGearEntry } from "./rigsafe-recovery";
import type { CargoBoxEntry } from "./rigsafe-cargo-boxes";
import type { StockVehicle, BodyType } from "./vehicle-types";

export const WATER_LBS_PER_GALLON = 8.34;

// ─── Configuration Interfaces ───────────────────────────────────────

export type CargoMountTarget = "bed_rack" | "cab_rack" | "bed";

export interface CargoItem {
  id: string;
  name: string;
  weightLbs: number;
  qty: number;
  mountTarget: CargoMountTarget; // which rack/location this item is physically on
}

export interface Occupant {
  id: string;
  label: string;       // "Driver", "Passenger", "Rear 1", etc.
  weightLbs: number;
  isSleeper: boolean;   // sleeps in tent (counts toward static roof load)
}

// Kept for backward compat — old configs still work
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

  // Primary Rack (bed rack for trucks, roof rack for cars/SUVs)
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

  // Secondary Rack (cab roof rack on trucks — optional, independent load zone)
  hasSecondaryRack: boolean;
  secondaryRack: RackEntry | null;
  secondaryRackHeightSetting: number | null;
  manualSecondaryRack: {
    weightLbs: number;
    staticLbs: number;
    onRoadDynamicLbs: number;
    offRoadDynamicLbs: number;
    heightIn: number;
  };
  useManualSecondaryRack: boolean;
  // Items on secondary rack
  secondaryRackSolar: boolean;
  secondaryRackSolarWeightLbs: number;
  secondaryRackLightBar: boolean;
  secondaryRackLightBarWeightLbs: number;
  secondaryRackCargoLbs: number;

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

  // Vehicle Mods (bolt-ons that eat payload before roof is loaded)
  frontBumper: BumperEntry | null;
  rearBumper: BumperEntry | null;
  manualBumperWeightLbs: { front: number; rear: number };
  useManualBumpers: boolean;
  hasFrontBumper: boolean;
  hasRearBumper: boolean;

  winch: WinchEntry | null;
  manualWinchWeightLbs: number;
  useManualWinch: boolean;
  hasWinch: boolean;

  drawers: DrawerEntry | null;
  manualDrawerWeightLbs: number;
  useManualDrawers: boolean;
  hasDrawers: boolean;

  fridge: FridgeEntry | null;
  manualFridgeWeightLbs: number;
  useManualFridge: boolean;
  hasFridge: boolean;

  waterTank: WaterTankEntry | null;
  manualWaterTank: { emptyWeightLbs: number; capacityGal: number };
  useManualWaterTank: boolean;
  hasWaterTank: boolean;
  waterTankFillPct: number;

  skidPlates: SkidPlateEntry | null;
  manualSkidPlateWeightLbs: number;
  useManualSkidPlates: boolean;
  hasSkidPlates: boolean;

  spareCarrier: SpareCarrierEntry | null;
  manualSpareCarrierWeightLbs: number;
  useManualSpareCarrier: boolean;
  hasSpareCarrier: boolean;
  spareTireWeightLbs: number;

  solarPanels: SolarPanelEntry | null;
  manualSolarWeightLbs: number;
  useManualSolar: boolean;
  hasSolar: boolean;

  lightBar: LightBarEntry | null;
  manualLightBarWeightLbs: number;
  useManualLightBar: boolean;
  hasLightBar: boolean;

  slideKitchen: SlideKitchenEntry | null;
  manualKitchenWeightLbs: number;
  useManualKitchen: boolean;
  hasSlideKitchen: boolean;

  recoveryGear: RecoveryGearEntry[];
  manualRecoveryWeightLbs: number;
  useManualRecovery: boolean;
  hasRecoveryGear: boolean;

  // Cargo on rack
  cargoItems: CargoItem[];

  // Cargo box (mounted on rack)
  cargoBox: CargoBoxEntry | null;
  manualCargoBoxWeightLbs: number;
  useManualCargoBox: boolean;
  hasCargoBox: boolean;
  cargoBoxContentsLbs: number; // slider 0-100 lbs for stuff inside the box
  cargoBoxMountTarget: CargoMountTarget; // which rack the box sits on

  // Quick-add rack cargo presets
  rackPresets: string[]; // array of preset IDs that are toggled on

  // Occupants (new: individual list)
  occupantList: Occupant[];
  // Legacy fallback (used if occupantList is empty)
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
  pct: number; // 0-100+
}

export interface RigSafeResult {
  // Chain 1: Rack load (roof only)
  rackStatic: RackBudget;
  rackOnRoad: RackBudget;
  rackOffRoad: RackBudget;

  // Chain 2: Bed load (in the truck bed — not on roof)
  bedLoad: { used: number; items: { label: string; value: number }[] };

  // Chain 3: Frame mods (bolted to chassis)
  frameMods: { used: number; items: { label: string; value: number }[] };

  // Chain 4: Vehicle payload (everything combined)
  vehiclePayload: RackBudget;

  // Secondary rack load (cab roof rack on trucks — optional)
  secondaryRackOnRoad: RackBudget | null;
  secondaryRackOffRoad: RackBudget | null;

  // Weakest link
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

  // Cab / roof-rack clearance (bed rack + secondary cab rack combos)
  cabClearance: CabClearanceResult;

  // Tonneau clearance
  tonneauClearanceIn: number;
  tonneauClearanceOk: boolean;

  // Vehicle mods total
  vehicleModsWeightLbs: number;

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

const SAFETY_MARGIN_ZONE = 0.80;  // 80% — start of 10-20% safety margin
const WARNING_ZONE = 0.90;        // 90% — strongly discouraged
const DANGER_ZONE = 1.0;          // 100% — at or over limit

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

// ─── Helper: Occupant weights ────────────────────────────────────────

function getOccupantTotalWeight(config: RigSafeConfig): number {
  if (config.occupantList && config.occupantList.length > 0) {
    return config.occupantList.reduce((sum, o) => sum + o.weightLbs, 0);
  }
  // Legacy fallback
  return config.occupants.adults * config.occupants.avgAdultLbs
    + config.occupants.kids * config.occupants.avgKidLbs;
}

function getSleeperTotalWeight(config: RigSafeConfig): number {
  if (config.occupantList && config.occupantList.length > 0) {
    return config.occupantList.filter(o => o.isSleeper).reduce((sum, o) => sum + o.weightLbs, 0);
  }
  // Legacy: assume all occupants sleep in tent
  return config.occupants.adults * config.occupants.avgAdultLbs
    + config.occupants.kids * config.occupants.avgKidLbs;
}

function getSleeperCount(config: RigSafeConfig): number {
  if (config.occupantList && config.occupantList.length > 0) {
    return config.occupantList.filter(o => o.isSleeper).length;
  }
  return config.occupants.adults + config.occupants.kids;
}

function getOccupantCount(config: RigSafeConfig): number {
  if (config.occupantList && config.occupantList.length > 0) {
    return config.occupantList.length;
  }
  return config.occupants.adults + config.occupants.kids;
}

function getSecondaryRack(config: RigSafeConfig) {
  if (!config.hasSecondaryRack) return null;
  if (config.useManualSecondaryRack || !config.secondaryRack) {
    return config.manualSecondaryRack;
  }
  return {
    weightLbs: config.secondaryRack.weightLbs,
    staticLbs: config.secondaryRack.staticLbs,
    onRoadDynamicLbs: config.secondaryRack.onRoadDynamicLbs,
    offRoadDynamicLbs: config.secondaryRack.offRoadDynamicLbs,
    heightIn: config.secondaryRackHeightSetting ?? config.secondaryRack.heightSettings?.[0] ?? 4,
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

// ─── Helper: Frame Mods Weight (bolted to chassis — not in bed or on roof) ──

export function computeFrameModsWeight(config: RigSafeConfig): number {
  let total = 0;

  // Bumpers
  if (config.hasFrontBumper) {
    total += config.useManualBumpers
      ? config.manualBumperWeightLbs.front
      : (config.frontBumper?.weightLbs ?? 0);
  }
  if (config.hasRearBumper) {
    total += config.useManualBumpers
      ? config.manualBumperWeightLbs.rear
      : (config.rearBumper?.weightLbs ?? 0);
  }

  // Winch (mounted on front bumper)
  if (config.hasWinch) {
    total += config.useManualWinch
      ? config.manualWinchWeightLbs
      : (config.winch?.weightLbs ?? 0);
  }

  // Skid plates (bolted to frame)
  if (config.hasSkidPlates) {
    total += config.useManualSkidPlates
      ? config.manualSkidPlateWeightLbs
      : (config.skidPlates?.weightLbs ?? 0);
  }

  // Spare tire carrier + tire (rear-mounted)
  if (config.hasSpareCarrier) {
    total += config.useManualSpareCarrier
      ? config.manualSpareCarrierWeightLbs
      : (config.spareCarrier?.carrierWeightLbs ?? 0);
    total += config.spareTireWeightLbs;
  }

  return Math.round(total);
}

// ─── Helper: Bed Load Weight (cargo in the truck bed) ────────────────

export function computeBedLoadWeight(config: RigSafeConfig): number {
  let total = 0;

  // Drawers (bed-mounted storage system)
  if (config.hasDrawers) {
    total += config.useManualDrawers
      ? config.manualDrawerWeightLbs
      : (config.drawers?.weightLbs ?? 0);
  }

  // Fridge (sits in bed or on drawer slide)
  if (config.hasFridge) {
    total += config.useManualFridge
      ? config.manualFridgeWeightLbs
      : (config.fridge?.weightLbs ?? 0);
  }

  // Water tank (bed-mounted)
  if (config.hasWaterTank) {
    if (config.useManualWaterTank) {
      total += config.manualWaterTank.emptyWeightLbs
        + (config.manualWaterTank.capacityGal * WATER_LBS_PER_GALLON * config.waterTankFillPct / 100);
    } else if (config.waterTank) {
      total += config.waterTank.emptyWeightLbs
        + (config.waterTank.capacityGal * WATER_LBS_PER_GALLON * config.waterTankFillPct / 100);
    }
  }

  // Slide-out kitchen (bed-mounted)
  if (config.hasSlideKitchen) {
    total += config.useManualKitchen
      ? config.manualKitchenWeightLbs
      : (config.slideKitchen?.weightLbs ?? 0);
  }

  // Recovery gear (typically stored in bed)
  if (config.hasRecoveryGear) {
    if (config.useManualRecovery) {
      total += config.manualRecoveryWeightLbs;
    } else {
      total += config.recoveryGear.reduce((sum, g) => sum + g.weightLbs, 0);
    }
  }

  return Math.round(total);
}

// ─── Helper: All vehicle mods weight (frame + bed + roof-mounted non-rack) ──
// Kept for backward compat — sums all three zones

export function computeVehicleModsWeight(config: RigSafeConfig): number {
  let total = computeFrameModsWeight(config) + computeBedLoadWeight(config);

  // Solar panels (may be roof or bed-mounted)
  if (config.hasSolar) {
    total += config.useManualSolar
      ? config.manualSolarWeightLbs
      : (config.solarPanels?.weightLbs ?? 0);
  }

  // Light bar
  if (config.hasLightBar) {
    total += config.useManualLightBar
      ? config.manualLightBarWeightLbs
      : (config.lightBar?.weightLbs ?? 0);
  }

  return Math.round(total);
}

// ─── Helper: Roof-mounted mod weight (adds to rack load) ────────────

function computeRoofMountedModWeight(config: RigSafeConfig): number {
  let total = 0;
  // Solar on roof-rack or bed-rack counts against rack load
  if (config.hasSolar) {
    const mountType = config.solarPanels?.mountType;
    if (!config.useManualSolar && (mountType === "roof-rack" || mountType === "bed-rack")) {
      total += config.solarPanels?.weightLbs ?? 0;
    }
  }
  // Light bar on roof-rack counts against rack load
  if (config.hasLightBar) {
    const mountLoc = config.lightBar?.mountLocation;
    if (!config.useManualLightBar && mountLoc === "roof-rack") {
      total += config.lightBar?.weightLbs ?? 0;
    }
  }
  return total;
}

// ─── Rack Cargo Presets ─────────────────────────────────────────────

// location: "rack" = on top of rack, "bed" = in the truck bed
export const RACK_CARGO_PRESETS = [
  // ─── Rack-mounted (counts toward roof load) ───
  { id: "recovery-boards", name: "Recovery Boards (pair)", weightLbs: 8, location: "rack" as const },
  { id: "shovel", name: "Folding Shovel", weightLbs: 5, location: "rack" as const },
  { id: "axe-hatchet", name: "Axe / Hatchet", weightLbs: 4, location: "rack" as const },
  { id: "hi-lift-mount", name: "Hi-Lift Jack (rack mounted)", weightLbs: 30, location: "rack" as const },
  { id: "jerry-can-fuel", name: "Fuel Jerry Can (full, 5 gal)", weightLbs: 40, location: "rack" as const },
  { id: "jerry-can-water", name: "Water Jerry Can (full, 5 gal)", weightLbs: 44, location: "rack" as const },
  { id: "rotopax-2gal", name: "RotoPax 2-Gal Fuel (full)", weightLbs: 15, location: "rack" as const },
  { id: "fire-extinguisher", name: "Fire Extinguisher", weightLbs: 6, location: "rack" as const },
  { id: "traction-mats", name: "Traction Mats (pair)", weightLbs: 6, location: "rack" as const },
  { id: "dry-bag-large", name: "Large Dry Bag (loaded)", weightLbs: 20, location: "rack" as const },
  // ─── Bed cargo (counts toward payload only, NOT roof load) ───
  { id: "camp-chairs-2", name: "Camp Chairs (x2)", weightLbs: 14, location: "bed" as const },
  { id: "camp-table", name: "Camp Table", weightLbs: 12, location: "bed" as const },
  { id: "portable-compressor", name: "Portable Air Compressor", weightLbs: 10, location: "bed" as const },
  { id: "propane-tank", name: "Propane Tank (5 lb)", weightLbs: 10, location: "bed" as const },
  { id: "camp-shower", name: "Camp Shower Bag (full)", weightLbs: 22, location: "bed" as const },
] as const;

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

  // Cargo on bed rack only (items routed to cab_rack or bed are excluded)
  const cargoWeight = config.cargoItems
    .filter(item => (item.mountTarget ?? "bed_rack") === "bed_rack")
    .reduce((sum, item) => sum + item.weightLbs * item.qty, 0);

  // Cargo box on bed rack
  let cargoBoxWeight = 0;
  if (config.hasCargoBox && (config.cargoBoxMountTarget ?? "bed_rack") === "bed_rack") {
    cargoBoxWeight += config.useManualCargoBox
      ? config.manualCargoBoxWeightLbs
      : (config.cargoBox?.weightLbs ?? 0);
    cargoBoxWeight += config.cargoBoxContentsLbs;
  }

  // Rack preset items (only items physically on the rack — not bed cargo)
  const presetWeight = config.rackPresets.reduce((sum, id) => {
    const preset = RACK_CARGO_PRESETS.find(p => p.id === id);
    if (!preset || preset.location === "bed") return sum; // bed items don't load the rack
    return sum + preset.weightLbs;
  }, 0);

  // Bed preset items weight (for payload calc, not rack)
  const bedPresetWeight = config.rackPresets.reduce((sum, id) => {
    const preset = RACK_CARGO_PRESETS.find(p => p.id === id);
    if (!preset || preset.location !== "bed") return sum;
    return sum + preset.weightLbs;
  }, 0);

  // Occupant weight (only sleepers for static — they're in the tent on the rack)
  const sleeperWeight = getSleeperTotalWeight(config);

  // Bedding weight (only for static, per sleeper)
  let beddingPerPerson = 0;
  if (config.beddingLevel === "light") beddingPerPerson = 10;
  else if (config.beddingLevel === "full") beddingPerPerson = 20;
  else beddingPerPerson = config.customBeddingLbsPerPerson;
  const totalSleepers = getSleeperCount(config);
  const beddingWeight = beddingPerPerson * totalSleepers;

  // Roof-mounted mods (solar panels, light bars on rack)
  const roofModWeight = computeRoofMountedModWeight(config);

  // Dynamic loads (driving — no people or bedding on rack)
  const dynamicLoad = tentWeight + awningBracketWeight + cargoWeight + cargoBoxWeight + presetWeight + roofModWeight;

  // Static loads (camping — sleepers and bedding on rack)
  const staticLoad = dynamicLoad + sleeperWeight + beddingWeight;

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

// ─── Compute: Secondary Rack Load (cab roof rack) ──────────────────

export function computeSecondaryRackLoad(config: RigSafeConfig): {
  onRoad: RackBudget;
  offRoad: RackBudget;
} | null {
  const secRack = getSecondaryRack(config);
  if (!secRack) return null;

  let load = 0;

  // Items assigned to secondary rack
  if (config.secondaryRackSolar) load += config.secondaryRackSolarWeightLbs;
  if (config.secondaryRackLightBar) load += config.secondaryRackLightBarWeightLbs;
  load += config.secondaryRackCargoLbs;

  // Custom cargo items routed to cab rack
  load += config.cargoItems
    .filter(item => item.mountTarget === "cab_rack")
    .reduce((sum, item) => sum + item.weightLbs * item.qty, 0);

  // Cargo box on cab rack
  if (config.hasCargoBox && config.cargoBoxMountTarget === "cab_rack") {
    load += config.useManualCargoBox
      ? config.manualCargoBoxWeightLbs
      : (config.cargoBox?.weightLbs ?? 0);
    load += config.cargoBoxContentsLbs;
  }

  const mkBudget = (rating: number, used: number): RackBudget => ({
    rating,
    used: Math.round(used),
    remaining: Math.round(rating - used),
    pct: rating > 0 ? Math.round((used / rating) * 100) : 0,
  });

  return {
    onRoad: mkBudget(secRack.onRoadDynamicLbs, load),
    offRoad: mkBudget(secRack.offRoadDynamicLbs, load),
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

  // Primary rack weight
  used += rack.weightLbs;

  // Secondary rack weight + its load
  const secRack = getSecondaryRack(config);
  if (secRack) {
    used += secRack.weightLbs;
    if (config.secondaryRackSolar) used += config.secondaryRackSolarWeightLbs;
    if (config.secondaryRackLightBar) used += config.secondaryRackLightBarWeightLbs;
    used += config.secondaryRackCargoLbs;
  }

  // Tonneau weight
  if (tonneau) used += tonneau.weightLbs;

  // Tent weight
  if (tent) used += tent.weightLbs;

  // Awning full weight (entire awning counts against payload)
  if (awning) used += awning.totalWeightLbs;

  // Wall kit
  if (config.hasWallKit) used += config.wallKitWeightLbs;

  // Annex (counts against payload even though ground-supported — it's carried when stored)
  if (config.hasAnnex) used += config.annexWeightLbs;

  // Vehicle mods (bumpers, winch, drawers, fridge, water tank, skids, spare, solar, lights, kitchen, recovery)
  used += computeVehicleModsWeight(config);

  // All cargo (custom items)
  used += config.cargoItems.reduce((sum, item) => sum + item.weightLbs * item.qty, 0);

  // Cargo box on rack
  if (config.hasCargoBox) {
    used += config.useManualCargoBox
      ? config.manualCargoBoxWeightLbs
      : (config.cargoBox?.weightLbs ?? 0);
    used += config.cargoBoxContentsLbs;
  }

  // All preset items (rack + bed — both count toward payload)
  used += config.rackPresets.reduce((sum, id) => {
    const preset = RACK_CARGO_PRESETS.find(p => p.id === id);
    return sum + (preset?.weightLbs ?? 0);
  }, 0);

  // All occupants (everyone in the vehicle, not just sleepers)
  used += getOccupantTotalWeight(config);

  // Fuel weight
  const fuelLbsPerGal =
    vehicle.engineType === "diesel" ? DIESEL_LBS_PER_GALLON : GAS_LBS_PER_GALLON;
  used += vehicle.fuelTankGal * fuelLbsPerGal;

  // Tongue weight (if towing)
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
  const vehOffRoad = Math.round(vehicle.roofDynamicLbs * 0.75); // 75% of dynamic for off-road

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

  // Add rack height above roof/bed rail
  totalHeight += rack.heightIn;

  // Add tent closed height
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

  // Weight at rack height (high-mounted)
  const tentWeight = tent?.weightLbs ?? 0;
  const cargoWeight = config.cargoItems.reduce((sum, i) => sum + i.weightLbs * i.qty, 0);
  const roofModWeight = computeRoofMountedModWeight(config);
  const roofLoad = tentWeight + cargoWeight + rack.weightLbs + roofModWeight;

  // Low-mounted mods (bumpers, skids, drawers — mounted below CG, lower it)
  let lowMountedWeight = 0;
  if (config.hasFrontBumper) lowMountedWeight += config.useManualBumpers ? config.manualBumperWeightLbs.front : (config.frontBumper?.weightLbs ?? 0);
  if (config.hasRearBumper) lowMountedWeight += config.useManualBumpers ? config.manualBumperWeightLbs.rear : (config.rearBumper?.weightLbs ?? 0);
  if (config.hasWinch) lowMountedWeight += config.useManualWinch ? config.manualWinchWeightLbs : (config.winch?.weightLbs ?? 0);
  if (config.hasSkidPlates) lowMountedWeight += config.useManualSkidPlates ? config.manualSkidPlateWeightLbs : (config.skidPlates?.weightLbs ?? 0);
  if (config.hasDrawers) lowMountedWeight += config.useManualDrawers ? config.manualDrawerWeightLbs : (config.drawers?.weightLbs ?? 0);

  if (roofLoad === 0 && lowMountedWeight === 0) return { cgRaiseIn: 0, stabilityNote: "No roof load — CG unchanged." };

  // Approximate CG change from weight at different heights
  // CG_new = (M_vehicle * CG_vehicle + M_high * H_high + M_low * H_low) / (M_vehicle + M_high + M_low)
  const vehicleMass = vehicle.curbWeightLbs;
  const highLoadHeight = vehicle.overallHeightIn + rack.heightIn + (tent ? tent.closedHeightIn / 2 : 0);
  const lowLoadHeight = vehicle.cgHeightIn * 0.5; // bumpers/skids mounted at ~50% of CG height
  const cgVehicle = vehicle.cgHeightIn;

  const totalMass = vehicleMass + roofLoad + lowMountedWeight;
  const newCg = (vehicleMass * cgVehicle + roofLoad * highLoadHeight + lowMountedWeight * lowLoadHeight) / totalMass;
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

// ─── Compute: Cab / Roof-Rack Clearance ────────────────────────────
// Only relevant when a bed rack + tent is combined with a secondary
// cab roof rack on the same truck. Checks whether the tent bottom
// clears the rear crossbar of the cab rack at each available height.

export interface CabClearanceHeightOption {
  heightIn: number;                  // rack height setting (e.g. 19, 23, 27.25)
  tentBottomFromGroundIn: number;    // where tent bottom sits from ground
  roofRackTopFromGroundIn: number;   // top of secondary rack crossbar from ground
  clearanceIn: number;               // gap between tent bottom and rack top (positive = clear)
  status: "clear" | "tight" | "conflict";  // clear ≥2", tight 0–2", conflict <0
  totalVehicleHeightIn: number;      // ground to top of closed tent at this setting
  garageWarning: boolean;            // total height >84" (7 ft)
}

export interface CabClearanceResult {
  applicable: boolean;               // false if no secondary rack or no bed rack tent setup
  totalOverhangIn: number;           // how much tent extends beyond bed (tent length - bed length)
  fitsInBed: boolean;                // true if tent is shorter than or equal to bed
  optimalFrontOverhangIn: number;    // recommended front overhang (toward cab) for weight balance
  optimalRearOverhangIn: number;     // recommended rear overhang (toward tailgate)
  heightOptions: CabClearanceHeightOption[];
  recommendedHeightIn: number | null;  // lowest height setting that achieves "clear" status
  minimumClearHeightIn: number | null; // same as above, for display
  currentHeightStatus: "clear" | "tight" | "conflict" | "unknown";
}

export function computeCabClearance(config: RigSafeConfig): CabClearanceResult {
  const NOT_APPLICABLE: CabClearanceResult = {
    applicable: false,
    totalOverhangIn: 0,
    fitsInBed: true,
    optimalFrontOverhangIn: 0,
    optimalRearOverhangIn: 0,
    heightOptions: [],
    recommendedHeightIn: null,
    minimumClearHeightIn: null,
    currentHeightStatus: "unknown",
  };

  // Only applies: truck with bed rack + tent + secondary cab roof rack
  if (!config.hasTent) return NOT_APPLICABLE;
  if (config.mountType !== "bed-rack") return NOT_APPLICABLE;
  if (!config.hasSecondaryRack) return NOT_APPLICABLE;

  const vehicle = config.useManual ? config.manualVehicle : config.vehicle;
  if (!vehicle) return NOT_APPLICABLE;

  const tent = getTent(config);
  if (!tent) return NOT_APPLICABLE;

  // Get bed and cab dimensions from vehicle
  const bedLengthIn = vehicle.bedLengthIn ?? null;
  // bedRailHeightIn and cabRoofHeightIn are on StockVehicle only (not manualVehicle)
  const bedRailHeightIn = !config.useManual && config.vehicle
    ? (config.vehicle as any).bedRailHeightIn ?? null
    : null;
  const cabRoofHeightIn = !config.useManual && config.vehicle
    ? (config.vehicle as any).cabRoofHeightIn ?? null
    : null;

  if (!bedRailHeightIn || !cabRoofHeightIn) return NOT_APPLICABLE;

  // Secondary rack crossbar height above roof surface
  const secRackCrossbarOffset = !config.useManualSecondaryRack && config.secondaryRack
    ? (config.secondaryRack as any).crossbarHeightAboveRoofIn ?? 3
    : config.manualSecondaryRack.heightIn ?? 3;

  const roofRackTopFromGroundIn = cabRoofHeightIn + secRackCrossbarOffset;

  // Overhang calculation
  const totalOverhangIn = bedLengthIn
    ? Math.max(0, tent.closedLengthIn - bedLengthIn)
    : 0;
  const fitsInBed = totalOverhangIn === 0;

  // Optimal position: split overhang evenly front/rear
  const optimalFrontOverhangIn = Math.round((totalOverhangIn / 2) * 10) / 10;
  const optimalRearOverhangIn  = Math.round((totalOverhangIn / 2) * 10) / 10;

  // Available height settings from the bed rack
  const availableHeights: number[] = (() => {
    if (!config.useManualRack && config.rack?.heightSettings?.length) {
      return config.rack.heightSettings;
    }
    // Fall back to current setting only
    const h = config.rackHeightSetting ?? config.manualRack.heightIn;
    return [h];
  })();

  const currentHeight = config.rackHeightSetting ?? config.manualRack.heightIn;

  const heightOptions: CabClearanceHeightOption[] = availableHeights.map((h) => {
    const tentBottomFromGroundIn = bedRailHeightIn + h;
    const clearanceIn = Math.round((tentBottomFromGroundIn - roofRackTopFromGroundIn) * 10) / 10;
    const totalVehicleHeightIn = Math.round((tentBottomFromGroundIn + tent.closedHeightIn) * 10) / 10;
    const status: "clear" | "tight" | "conflict" =
      clearanceIn >= 2 ? "clear" : clearanceIn >= 0 ? "tight" : "conflict";
    return {
      heightIn: h,
      tentBottomFromGroundIn: Math.round(tentBottomFromGroundIn * 10) / 10,
      roofRackTopFromGroundIn: Math.round(roofRackTopFromGroundIn * 10) / 10,
      clearanceIn,
      status,
      totalVehicleHeightIn,
      garageWarning: totalVehicleHeightIn > 84,
    };
  });

  const recommendedOpt = heightOptions.find((o) => o.status === "clear");
  const currentOpt = heightOptions.find((o) => o.heightIn === currentHeight);

  return {
    applicable: true,
    totalOverhangIn: Math.round(totalOverhangIn * 10) / 10,
    fitsInBed,
    optimalFrontOverhangIn,
    optimalRearOverhangIn,
    heightOptions,
    recommendedHeightIn: recommendedOpt?.heightIn ?? null,
    minimumClearHeightIn: recommendedOpt?.heightIn ?? null,
    currentHeightStatus: currentOpt?.status ?? "unknown",
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
    ok: clearance >= 2, // need at least 2" clearance
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

  // Frame mods (bumpers, winch, skid plates, spare carrier)
  const frameWeight = computeFrameModsWeight(config);
  if (frameWeight > 0) items.push({ label: "Frame Mods", value: frameWeight, color: "#B45309" });

  // Bed load (fridge, drawers, kitchen, water tank, recovery gear)
  const bedWeight = computeBedLoadWeight(config);
  if (bedWeight > 0) items.push({ label: "Bed Cargo", value: bedWeight, color: "#D97706" });

  // Solar + light bar (may be roof or bed — count as misc mods)
  let miscModWeight = 0;
  if (config.hasSolar) miscModWeight += config.useManualSolar ? config.manualSolarWeightLbs : (config.solarPanels?.weightLbs ?? 0);
  if (config.hasLightBar) miscModWeight += config.useManualLightBar ? config.manualLightBarWeightLbs : (config.lightBar?.weightLbs ?? 0);
  if (miscModWeight > 0) items.push({ label: "Solar / Lights", value: miscModWeight, color: "#FBBF24" });

  // Bed rack cargo (custom items + cargo box + rack-location presets)
  let rackCargoWeight = config.cargoItems
    .filter(i => (i.mountTarget ?? "bed_rack") === "bed_rack")
    .reduce((sum, i) => sum + i.weightLbs * i.qty, 0);
  if (config.hasCargoBox && (config.cargoBoxMountTarget ?? "bed_rack") === "bed_rack") {
    rackCargoWeight += config.useManualCargoBox
      ? config.manualCargoBoxWeightLbs
      : (config.cargoBox?.weightLbs ?? 0);
    rackCargoWeight += config.cargoBoxContentsLbs;
  }
  rackCargoWeight += config.rackPresets.reduce((sum, id) => {
    const preset = RACK_CARGO_PRESETS.find(p => p.id === id);
    if (!preset || preset.location === "bed") return sum;
    return sum + preset.weightLbs;
  }, 0);
  if (rackCargoWeight > 0) items.push({ label: "Rack Cargo", value: rackCargoWeight, color: "#EF4444" });

  // Cab rack cargo (custom items + cargo box on cab rack)
  let cabRackCargoWeight = config.cargoItems
    .filter(i => i.mountTarget === "cab_rack")
    .reduce((sum, i) => sum + i.weightLbs * i.qty, 0);
  if (config.hasCargoBox && config.cargoBoxMountTarget === "cab_rack") {
    cabRackCargoWeight += config.useManualCargoBox
      ? config.manualCargoBoxWeightLbs
      : (config.cargoBox?.weightLbs ?? 0);
    cabRackCargoWeight += config.cargoBoxContentsLbs;
  }
  if (cabRackCargoWeight > 0) items.push({ label: "Cab Rack Cargo", value: cabRackCargoWeight, color: "#F97316" });

  // Bed preset cargo (chairs, table, compressor, etc.)
  const bedPresetCargo = config.rackPresets.reduce((sum, id) => {
    const preset = RACK_CARGO_PRESETS.find(p => p.id === id);
    if (!preset || preset.location !== "bed") return sum;
    return sum + preset.weightLbs;
  }, 0);
  if (bedPresetCargo > 0) items.push({ label: "Bed Accessories", value: bedPresetCargo, color: "#F97316" });

  const occupantWeight = getOccupantTotalWeight(config);
  if (occupantWeight > 0) items.push({ label: "Occupants", value: occupantWeight, color: "#6366F1" });

  return items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
}

// ─── Compute: Per-Rack Donut Breakdown ─────────────────────────────

type BreakdownSegment = { label: string; value: number; color: string };

export function computeBedRackBreakdown(config: RigSafeConfig): BreakdownSegment[] {
  const items: BreakdownSegment[] = [];
  const rack = getRack(config);
  const tent = getTent(config);
  const awning = getAwning(config);

  const tentW = tent?.weightLbs ?? 0;
  const awningW = awning?.mountedBracketWeightLbs ?? 0;

  if (tentW > 0) items.push({ label: "Tent", value: tentW, color: "#3B82F6" });
  if (awningW > 0) items.push({ label: "Awning Bracket", value: awningW, color: "#10B981" });

  // Roof mods on bed rack
  const roofModW = computeRoofMountedModWeight(config);
  if (roofModW > 0) items.push({ label: "Solar / Lights", value: roofModW, color: "#FBBF24" });

  // Rack preset items
  const presetW = config.rackPresets.reduce((sum, id) => {
    const p = RACK_CARGO_PRESETS.find(x => x.id === id);
    if (!p || p.location === "bed") return sum;
    return sum + p.weightLbs;
  }, 0);
  if (presetW > 0) items.push({ label: "Preset Cargo", value: presetW, color: "#8B5CF6" });

  // Custom cargo on bed rack
  const customW = config.cargoItems
    .filter(i => (i.mountTarget ?? "bed_rack") === "bed_rack")
    .reduce((sum, i) => sum + i.weightLbs * i.qty, 0);
  if (customW > 0) items.push({ label: "Custom Cargo", value: customW, color: "#EF4444" });

  // Cargo box on bed rack
  let boxW = 0;
  if (config.hasCargoBox && (config.cargoBoxMountTarget ?? "bed_rack") === "bed_rack") {
    boxW += config.useManualCargoBox ? config.manualCargoBoxWeightLbs : (config.cargoBox?.weightLbs ?? 0);
    boxW += config.cargoBoxContentsLbs;
  }
  if (boxW > 0) items.push({ label: "Cargo Box", value: boxW, color: "#F97316" });

  // Remaining budget (gray)
  const used = items.reduce((s, i) => s + i.value, 0);
  const rating = rack.onRoadDynamicLbs;
  const remaining = Math.max(0, rating - used);
  if (remaining > 0) items.push({ label: "Remaining", value: remaining, color: "#374151" });

  return items;
}

export function computeCabRackBreakdown(config: RigSafeConfig): BreakdownSegment[] {
  const secRack = getSecondaryRack(config);
  if (!secRack) return [];

  const items: BreakdownSegment[] = [];

  if (config.secondaryRackSolar && config.secondaryRackSolarWeightLbs > 0)
    items.push({ label: "Solar", value: config.secondaryRackSolarWeightLbs, color: "#FBBF24" });
  if (config.secondaryRackLightBar && config.secondaryRackLightBarWeightLbs > 0)
    items.push({ label: "Light Bar", value: config.secondaryRackLightBarWeightLbs, color: "#F59E0B" });
  if (config.secondaryRackCargoLbs > 0)
    items.push({ label: "Manual Cargo", value: config.secondaryRackCargoLbs, color: "#8B5CF6" });

  // Custom cargo on cab rack
  const customW = config.cargoItems
    .filter(i => i.mountTarget === "cab_rack")
    .reduce((sum, i) => sum + i.weightLbs * i.qty, 0);
  if (customW > 0) items.push({ label: "Custom Cargo", value: customW, color: "#EF4444" });

  // Cargo box on cab rack
  let boxW = 0;
  if (config.hasCargoBox && config.cargoBoxMountTarget === "cab_rack") {
    boxW += config.useManualCargoBox ? config.manualCargoBoxWeightLbs : (config.cargoBox?.weightLbs ?? 0);
    boxW += config.cargoBoxContentsLbs;
  }
  if (boxW > 0) items.push({ label: "Cargo Box", value: boxW, color: "#F97316" });

  // Remaining budget (gray)
  const used = items.reduce((s, i) => s + i.value, 0);
  const rating = secRack.onRoadDynamicLbs;
  const remaining = Math.max(0, rating - used);
  if (remaining > 0) items.push({ label: "Remaining", value: remaining, color: "#374151" });

  return items;
}

// ─── Compute: Warnings ─────────────────────────────────────────────

export function computeWarnings(config: RigSafeConfig, result: Omit<RigSafeResult, "warnings" | "safetyMarginStatus">): RigSafeWarning[] {
  const w: RigSafeWarning[] = [];

  // Safety margin warnings (10-20% buffer)
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

  // Garage clearance
  if (!result.garageFits) {
    const over = Math.round(result.totalHeightIn - result.garageHeightIn);
    w.push({ level: "danger", message: `Total height ${result.totalHeightIn}" exceeds ${result.garageHeightIn}" garage. WILL NOT FIT (${over}" over).` });
  }

  // Bed overhang
  if (result.bedOverhangIn > 0) {
    w.push({ level: "warning", message: `Tent overhangs bed by ${result.bedOverhangIn}". Verify cab/tailgate clearance.` });
  }

  // CG impact
  if (result.cgRaiseIn >= 3) {
    w.push({ level: "warning", message: `CG raised ~${result.cgRaiseIn}". ${result.stabilityNote}` });
  } else if (result.cgRaiseIn >= 2) {
    w.push({ level: "info", message: `CG raised ~${result.cgRaiseIn}". ${result.stabilityNote}` });
  }

  // Cab / roof-rack clearance
  if (result.cabClearance.applicable) {
    const cc = result.cabClearance;
    const current = cc.heightOptions.find(o => o.heightIn === (config.rackHeightSetting ?? config.manualRack.heightIn));
    if (current) {
      if (current.status === "conflict") {
        w.push({
          level: "danger",
          message: `Tent CONFLICTS with cab rack at ${current.heightIn}" rack height — tent bottom is ${Math.abs(current.clearanceIn)}" BELOW the roof rack crossbar. Raise bed rack to ${cc.recommendedHeightIn ?? "max"}" or higher.`,
        });
      } else if (current.status === "tight") {
        w.push({
          level: "warning",
          message: `Only ${current.clearanceIn}" clearance between tent and cab rack at ${current.heightIn}" height. Minimum recommended is 2". Raise to ${cc.recommendedHeightIn ?? "max"}" for safe clearance.`,
        });
      } else {
        // Clear — but flag if it's just barely clear
        if (current.clearanceIn < 4) {
          w.push({
            level: "info",
            message: `Tent clears cab rack at ${current.heightIn}" with ${current.clearanceIn}" gap. Technically clear but tight — double-check fit before securing tent.`,
          });
        }
      }
    }
    // Overhang note
    if (cc.totalOverhangIn > 0) {
      w.push({
        level: "info",
        message: `Tent is ${cc.totalOverhangIn}" longer than your bed. Recommended: position ${cc.optimalFrontOverhangIn}" over cab + ${cc.optimalRearOverhangIn}" past tailgate for balanced weight distribution.`,
      });
    }
    // Garage warning at recommended height
    if (cc.recommendedHeightIn !== null) {
      const recOpt = cc.heightOptions.find(o => o.heightIn === cc.recommendedHeightIn);
      if (recOpt?.garageWarning) {
        w.push({
          level: "warning",
          message: `At ${cc.recommendedHeightIn}" (minimum clearance height), total rig height is ${recOpt.totalVehicleHeightIn}" (${(recOpt.totalVehicleHeightIn / 12).toFixed(1)}ft). Many parking garages are posted at 7'0"–7'6". Measure your garage before pulling in.`,
        });
      }
    }
  }

  // Tonneau clearance
  if (!result.tonneauClearanceOk) {
    w.push({ level: "warning", message: `Tonneau fold clearance only ${result.tonneauClearanceIn}". May interfere with rack. Need 2"+ gap.` });
  }

  // Tent open-side awareness
  if (config.hasTent && config.tent && config.tent.openSide !== "either") {
    const side = config.tent.openSide;
    const capSide = side.charAt(0).toUpperCase() + side.slice(1);
    w.push({ level: "info", message: `${config.tent.brand} ${config.tent.model} opens ${capSide}-side ONLY. Entry and ladder must be on the ${side} side of the vehicle.` });

    // Annex must match tent open side (annex hangs from tent entry)
    if (config.hasAnnex && config.annexSide !== side) {
      w.push({ level: "danger", message: `Annex set to ${config.annexSide} side but tent only opens ${side} side. Annex attaches below tent entry — move annex to ${side} side.` });
    }
  }

  // Awning/annex conflict
  if (config.hasAwning && config.hasAnnex) {
    if (config.awningSide === config.annexSide) {
      w.push({ level: "danger", message: `${config.awningSide.charAt(0).toUpperCase() + config.awningSide.slice(1)}-side awning + ${config.annexSide}-side annex = CONFLICT. Both deploy to the same side.` });
    } else {
      w.push({ level: "info", message: `${config.awningSide.charAt(0).toUpperCase() + config.awningSide.slice(1)}-side awning + ${config.annexSide}-side annex = compatible layout.` });
    }
  }

  // Awning/tent side info (not a conflict — many people want shade at tent entry)
  if (config.hasAwning && config.hasTent && config.tent && config.tent.openSide !== "either") {
    const tentSide = config.tent.openSide;
    if (config.awningSide === tentSide) {
      w.push({ level: "info", message: `Awning and tent entry both on ${tentSide} side — awning provides shade at tent ladder. Good combo.` });
    } else {
      w.push({ level: "info", message: `Awning on ${config.awningSide} side, tent opens ${tentSide} side — shade and entry are on opposite sides.` });
    }
  }

  // Secondary rack warnings
  if (config.hasSecondaryRack) {
    const secOnRoad = computeSecondaryRackLoad(config);
    if (secOnRoad) {
      if (secOnRoad.onRoad.pct >= 100) {
        w.push({ level: "danger", message: `Cab roof rack OVER LIMIT (${secOnRoad.onRoad.pct}%). Reduce cab rack cargo.` });
      } else if (secOnRoad.onRoad.pct >= 85) {
        w.push({ level: "warning", message: `Cab roof rack at ${secOnRoad.onRoad.pct}% on-road capacity. Leave 10-20% margin.` });
      }
    }
  }

  // Load zone warnings
  const frameWeight = computeFrameModsWeight(config);
  const bedWeight = computeBedLoadWeight(config);
  const modsWeight = computeVehicleModsWeight(config);
  const payloadRating = getVehicle(config).gvwrLbs - getVehicle(config).curbWeightLbs;

  if (bedWeight > 0) {
    const bedPct = Math.round((bedWeight / payloadRating) * 100);
    if (bedWeight >= 300) {
      w.push({ level: "info", message: `Bed cargo: ${bedWeight} lbs (${bedPct}% of payload). Fridge, drawers, water, kitchen — all riding in the bed.` });
    }
  }

  if (frameWeight > 0) {
    const framePct = Math.round((frameWeight / payloadRating) * 100);
    if (frameWeight >= 400) {
      w.push({ level: "warning", message: `Frame mods: ${frameWeight} lbs (${framePct}% of payload). Bumpers, winch, skids, spare carrier — heavy before you load anything.` });
    }
  }

  if (modsWeight > 0) {
    const modsPct = Math.round((modsWeight / payloadRating) * 100);
    if (modsWeight >= 500) {
      w.push({ level: "warning", message: `All mods total ${modsWeight} lbs — that's ${modsPct}% of your payload before loading the roof.` });
    }

    // Heavy front-end (bumper + winch)
    let frontWeight = 0;
    if (config.hasFrontBumper) frontWeight += config.useManualBumpers ? config.manualBumperWeightLbs.front : (config.frontBumper?.weightLbs ?? 0);
    if (config.hasWinch) frontWeight += config.useManualWinch ? config.manualWinchWeightLbs : (config.winch?.weightLbs ?? 0);
    if (frontWeight >= 250) {
      w.push({ level: "info", message: `Heavy front-end weight (${frontWeight} lbs). Factor into front axle rating for tire and brake wear.` });
    }

    // Water tank full
    if (config.hasWaterTank) {
      const tankGal = config.useManualWaterTank ? config.manualWaterTank.capacityGal : (config.waterTank?.capacityGal ?? 0);
      if (tankGal >= 10 && config.waterTankFillPct >= 75) {
        const waterWeight = Math.round(tankGal * WATER_LBS_PER_GALLON * config.waterTankFillPct / 100);
        w.push({ level: "info", message: `Water tank at ${config.waterTankFillPct}% adds ${waterWeight} lbs. Consider partial fill for trail days.` });
      }
    }
  }

  // Climate-based warnings
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
  const secondaryRack = computeSecondaryRackLoad(config);
  const payload = computePayload(config);
  const weakestLink = computeWeakestLink(config);
  const garage = computeGarageClearance(config);
  const sleeping = computeSleepingCapacity(config);
  const cg = computeCgImpact(config);
  const bedFit = computeBedFitment(config);
  const cabClearance = computeCabClearance(config);
  const tonneauClear = computeTonneauClearance(config);
  const breakdown = computeWeightBreakdown(config);
  const vehicleModsWeightLbs = computeVehicleModsWeight(config);

  // Bed load detail
  const bedLoadItems: { label: string; value: number }[] = [];
  if (config.hasDrawers) {
    const w = config.useManualDrawers ? config.manualDrawerWeightLbs : (config.drawers?.weightLbs ?? 0);
    if (w > 0) bedLoadItems.push({ label: "Drawers", value: w });
  }
  if (config.hasFridge) {
    const w = config.useManualFridge ? config.manualFridgeWeightLbs : (config.fridge?.weightLbs ?? 0);
    if (w > 0) bedLoadItems.push({ label: "Fridge", value: w });
  }
  if (config.hasWaterTank) {
    let w = 0;
    if (config.useManualWaterTank) {
      w = config.manualWaterTank.emptyWeightLbs + (config.manualWaterTank.capacityGal * WATER_LBS_PER_GALLON * config.waterTankFillPct / 100);
    } else if (config.waterTank) {
      w = config.waterTank.emptyWeightLbs + (config.waterTank.capacityGal * WATER_LBS_PER_GALLON * config.waterTankFillPct / 100);
    }
    if (w > 0) bedLoadItems.push({ label: `Water Tank (${config.waterTankFillPct}%)`, value: Math.round(w) });
  }
  if (config.hasSlideKitchen) {
    const w = config.useManualKitchen ? config.manualKitchenWeightLbs : (config.slideKitchen?.weightLbs ?? 0);
    if (w > 0) bedLoadItems.push({ label: "Slide Kitchen", value: w });
  }
  if (config.hasRecoveryGear) {
    const w = config.useManualRecovery ? config.manualRecoveryWeightLbs : config.recoveryGear.reduce((s, g) => s + g.weightLbs, 0);
    if (w > 0) bedLoadItems.push({ label: "Recovery Gear", value: w });
  }
  const bedLoad = { used: computeBedLoadWeight(config), items: bedLoadItems };

  // Frame mods detail
  const frameModItems: { label: string; value: number }[] = [];
  if (config.hasFrontBumper) {
    const w = config.useManualBumpers ? config.manualBumperWeightLbs.front : (config.frontBumper?.weightLbs ?? 0);
    if (w > 0) frameModItems.push({ label: "Front Bumper", value: w });
  }
  if (config.hasRearBumper) {
    const w = config.useManualBumpers ? config.manualBumperWeightLbs.rear : (config.rearBumper?.weightLbs ?? 0);
    if (w > 0) frameModItems.push({ label: "Rear Bumper", value: w });
  }
  if (config.hasWinch) {
    const w = config.useManualWinch ? config.manualWinchWeightLbs : (config.winch?.weightLbs ?? 0);
    if (w > 0) frameModItems.push({ label: "Winch", value: w });
  }
  if (config.hasSkidPlates) {
    const w = config.useManualSkidPlates ? config.manualSkidPlateWeightLbs : (config.skidPlates?.weightLbs ?? 0);
    if (w > 0) frameModItems.push({ label: "Skid Plates", value: w });
  }
  if (config.hasSpareCarrier) {
    const w = (config.useManualSpareCarrier ? config.manualSpareCarrierWeightLbs : (config.spareCarrier?.carrierWeightLbs ?? 0)) + config.spareTireWeightLbs;
    if (w > 0) frameModItems.push({ label: "Spare Carrier + Tire", value: w });
  }
  const frameMods = { used: computeFrameModsWeight(config), items: frameModItems };

  // Build partial result for warnings
  const partialResult = {
    rackStatic: rackLoad.static,
    rackOnRoad: rackLoad.onRoad,
    rackOffRoad: rackLoad.offRoad,
    secondaryRackOnRoad: secondaryRack?.onRoad ?? null,
    secondaryRackOffRoad: secondaryRack?.offRoad ?? null,
    bedLoad,
    frameMods,
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
    cabClearance,
    tonneauClearanceIn: tonneauClear.clearanceIn,
    tonneauClearanceOk: tonneauClear.ok,
    vehicleModsWeightLbs,
    weightBreakdown: breakdown,
  };

  const warnings = computeWarnings(config, partialResult);

  // Overall safety margin status
  const maxPct = Math.max(
    rackLoad.static.pct,
    rackLoad.onRoad.pct,
    rackLoad.offRoad.pct,
    secondaryRack?.onRoad.pct ?? 0,
    secondaryRack?.offRoad.pct ?? 0,
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

  // Secondary rack (cab roof rack — off by default)
  hasSecondaryRack: false,
  secondaryRack: null,
  secondaryRackHeightSetting: null,
  manualSecondaryRack: {
    weightLbs: 20,
    staticLbs: 200,
    onRoadDynamicLbs: 165,
    offRoadDynamicLbs: 100,
    heightIn: 4,
  },
  useManualSecondaryRack: false,
  secondaryRackSolar: false,
  secondaryRackSolarWeightLbs: 15,
  secondaryRackLightBar: false,
  secondaryRackLightBarWeightLbs: 10,
  secondaryRackCargoLbs: 0,

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

  // Vehicle Mods
  frontBumper: null,
  rearBumper: null,
  manualBumperWeightLbs: { front: 120, rear: 100 },
  useManualBumpers: false,
  hasFrontBumper: false,
  hasRearBumper: false,

  winch: null,
  manualWinchWeightLbs: 70,
  useManualWinch: false,
  hasWinch: false,

  drawers: null,
  manualDrawerWeightLbs: 65,
  useManualDrawers: false,
  hasDrawers: false,

  fridge: null,
  manualFridgeWeightLbs: 50,
  useManualFridge: false,
  hasFridge: false,

  waterTank: null,
  manualWaterTank: { emptyWeightLbs: 5, capacityGal: 10 },
  useManualWaterTank: false,
  hasWaterTank: false,
  waterTankFillPct: 100,

  skidPlates: null,
  manualSkidPlateWeightLbs: 50,
  useManualSkidPlates: false,
  hasSkidPlates: false,

  spareCarrier: null,
  manualSpareCarrierWeightLbs: 30,
  useManualSpareCarrier: false,
  hasSpareCarrier: false,
  spareTireWeightLbs: 60,

  solarPanels: null,
  manualSolarWeightLbs: 20,
  useManualSolar: false,
  hasSolar: false,

  lightBar: null,
  manualLightBarWeightLbs: 10,
  useManualLightBar: false,
  hasLightBar: false,

  slideKitchen: null,
  manualKitchenWeightLbs: 45,
  useManualKitchen: false,
  hasSlideKitchen: false,

  recoveryGear: [],
  manualRecoveryWeightLbs: 30,
  useManualRecovery: false,
  hasRecoveryGear: false,

  cargoItems: [],

  cargoBox: null,
  manualCargoBoxWeightLbs: 25,
  useManualCargoBox: false,
  hasCargoBox: false,
  cargoBoxContentsLbs: 0,
  cargoBoxMountTarget: "bed_rack" as CargoMountTarget,
  rackPresets: [],

  occupantList: [
    { id: "adult-1", label: "Adult 1", weightLbs: 180, isSleeper: true },
    { id: "adult-2", label: "Adult 2", weightLbs: 150, isSleeper: true },
  ],
  occupants: {
    adults: 2,
    avgAdultLbs: 180,
    kids: 0,
    avgKidLbs: 80,
  },

  beddingLevel: "full",
  customBeddingLbsPerPerson: 15,

  garageHeightIn: 84, // 7-foot garage default

  tongueWeightLbs: 0,

  climateZone: null,
};

export const RIGSAFE_KEY = "pe-rigsafe";
