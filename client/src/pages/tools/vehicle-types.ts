// ─── Unified Vehicle Profile Schema ────────────────────────────────
// Central brain for the Ops Deck. Every tool reads from this.
// Stored in localStorage as pe-vehicle-profile.
//
// Data accuracy sources:
//   Curb weight/GVWR/towing: Manufacturer specs (owner's manual door sticker)
//   Wheelbase/track/clearance: Manufacturer spec sheets
//   Approach/departure/breakover: Manufacturer off-road specs
//   SSF: NHTSA NCAP rollover ratings (fema.gov/nhtsa)
//   CG height: Derived from SSF — CG_h = track / (2 × SSF)
//   MPG: FuelEconomy.gov (EPA estimates)
//   Tire sizing: manufacturer stock fitment
//   Mod penalties: Hagerty, 4WDTalk, Car and Driver, RBP Tires,
//     Expedition Portal controlled tests, EPA/National Academies

// ─── Engine & Drivetrain ───────────────────────────────────────────

export type EngineType = "gas" | "diesel" | "hybrid" | "ev";
export type Drivetrain = "4wd" | "awd" | "2wd-rwd" | "2wd-fwd";
export type TransferCase = "part-time" | "full-time" | "selectable" | "none";

// ─── Tire Types ────────────────────────────────────────────────────

export type TireType = "highway" | "all-terrain" | "mud-terrain" | "hybrid";

/** MPG multiplier by tire type (vs highway baseline) */
export const tireTypePenalty: Record<TireType, number> = {
  highway: 1.0,
  "all-terrain": 0.92,
  "mud-terrain": 0.85,
  hybrid: 0.95,
};

// ─── Modification Types ────────────────────────────────────────────

export interface LiftKit {
  inches: number; // 0 = stock
  type: "spacer" | "coilover" | "long-arm" | "body-lift";
}

export interface TireSetup {
  size: string;         // e.g. "285/70R17"
  diameter: number;     // total diameter in inches
  type: TireType;
  pressurePsi: number;  // current running pressure
  recommendedPsi: number;
  ageMonths: number;    // tire age in months
}

export interface BumperMod {
  type: "stock" | "steel" | "aluminum" | "hybrid" | "stubby";
  weightLbs: number;
  hasWinchMount: boolean;
}

export interface WinchMod {
  installed: boolean;
  pullRatingLbs: number;  // e.g. 10000, 12000
  weightLbs: number;      // typically 60-100 lbs
  type: "electric" | "hydraulic";
}

export interface RoofSetup {
  rack: boolean;
  rackWeightLbs: number;   // rack itself
  cargoWeightLbs: number;  // gear on rack
  rtt: boolean;            // roof top tent
  rttWeightLbs: number;    // typically 100-200 lbs
  awning: boolean;
  awningWeightLbs: number;
}

export interface ArmorMod {
  rockSliders: boolean;
  sliderWeightLbs: number;
  skidPlates: boolean;
  skidPlateWeightLbs: number;
}

export interface FuelSetup {
  stockTankGal: number;
  auxTankGal: number;       // 0 = none
  auxTankType: "bed-mounted" | "under-bed" | "replacement" | "none";
  extraCansGal: number;     // jerry cans
}

export interface ElectricalSetup {
  dualBattery: boolean;
  dualBatteryWeightLbs: number;
  alternatorAmps: number;    // stock alternator output
  onboardAir: boolean;
  onboardAirWeightLbs: number;
  fridgeWatts: number;       // 0 = none, ties to Solar Calculator
  lightBarWatts: number;
  radioType: "none" | "cb" | "gmrs" | "ham" | "satellite";
  radioWeightLbs: number;
}

export interface TrailerSetup {
  hasTrailer: boolean;
  trailerWeightLbs: number;  // loaded weight
  tongueWeightLbs: number;
  trailerType: "none" | "utility" | "camper" | "boat" | "flatbed" | "enclosed";
}

export interface DrivetrainMods {
  regeared: boolean;
  newRatio: number;        // e.g. 4.88, 5.13
  stockRatio: number;      // e.g. 3.73, 4.10
  frontLocker: boolean;
  rearLocker: boolean;
  lockerType: "none" | "auto" | "selectable" | "spool";
}

// ─── Recovery Gear ─────────────────────────────────────────────────

export interface RecoveryGear {
  kinetic: boolean;     // kinetic recovery rope
  straps: boolean;      // tow straps
  shackles: boolean;    // D-ring shackles
  treeProtector: boolean;
  snatchBlock: boolean;
  highlift: boolean;
  tractionBoards: boolean;   // Maxtrax etc.
  tirePlug: boolean;
  compressor: boolean;
  spareTire: boolean;
  spareTireFullSize: boolean;
  shovel: boolean;
}

// ─── Water Fording ─────────────────────────────────────────────────

export interface WaterFording {
  snorkel: boolean;
  stockWadingDepthIn: number;   // manufacturer spec
  modifiedWadingDepthIn: number; // with snorkel + diff breathers
  diffBreathers: boolean;
}

// ─── The Complete Vehicle Profile ──────────────────────────────────

export interface VehicleProfile {
  // ─── Identity ───
  id: string;            // unique ID (generated)
  nickname: string;      // user's name for the vehicle
  year: number;
  make: string;
  model: string;
  trim: string;

  // ─── Stock Specs (from vehicle DB or manual entry) ───
  curbWeightLbs: number;
  gvwrLbs: number;
  maxTowingLbs: number;
  wheelbaseIn: number;
  trackWidthIn: number;   // front track
  groundClearanceIn: number;
  approachAngle: number;  // degrees
  departureAngle: number;
  breakoverAngle: number;
  fuelTankGal: number;
  stockTireSize: string;
  stockTireDiameter: number;
  mpgCity: number;
  mpgHighway: number;
  mpgCombined: number;
  engineType: EngineType;
  drivetrain: Drivetrain;
  transferCase: TransferCase;
  ssf: number;            // NHTSA Static Stability Factor
  cgHeightIn: number;     // derived: track / (2 * SSF)
  frontWeightPct: number; // front axle weight percentage (e.g. 55)

  // ─── Modifications ───
  lift: LiftKit;
  tires: TireSetup;
  frontBumper: BumperMod;
  rearBumper: BumperMod;
  winch: WinchMod;
  roof: RoofSetup;
  armor: ArmorMod;
  fuel: FuelSetup;
  electrical: ElectricalSetup;
  trailer: TrailerSetup;
  drivetrainMods: DrivetrainMods;
  recovery: RecoveryGear;
  waterFording: WaterFording;

  // ─── Custom / Misc ───
  otherModsWeightLbs: number;  // catch-all for unlisted mods
  otherModsNotes: string;
  testedMpg: number | null;    // real-world override
  odometerMiles: number;

  // ─── Meta ───
  createdAt: number;   // timestamp
  updatedAt: number;
}

// ─── Computed Values (derived in real-time) ────────────────────────

export interface VehicleComputed {
  // Weight
  totalModWeightLbs: number;
  totalLoadedWeightLbs: number;
  remainingPayloadLbs: number;
  payloadPct: number;         // % of GVWR used
  overloaded: boolean;

  // Fuel & Range
  estimatedMpg: number;
  mpgPenaltyPct: number;      // how much worse than stock
  totalFuelGal: number;       // stock + aux + cans
  estimatedRangeMiles: number;

  // Geometry
  modifiedGroundClearanceIn: number;
  modifiedApproachAngle: number;
  modifiedDepartureAngle: number;
  modifiedBreakoverAngle: number;
  modifiedCgHeightIn: number;
  modifiedSsf: number;
  rolloverThresholdDeg: number;

  // Scores (0-100)
  recoveryScore: number;
  trailReadinessScore: number;
  overallReadinessScore: number;

  // Weight breakdown for donut chart
  weightBreakdown: { label: string; value: number; color: string }[];

  // MPG penalty breakdown
  mpgBreakdown: { label: string; penalty: number }[];

  // Warnings
  warnings: string[];
}

// ─── Stock Vehicle Database Entry ──────────────────────────────────

export interface StockVehicle {
  year: number;
  make: string;
  model: string;
  trim: string;
  curbWeightLbs: number;
  gvwrLbs: number;
  maxTowingLbs: number;
  wheelbaseIn: number;
  trackWidthIn: number;
  groundClearanceIn: number;
  approachAngle: number;
  departureAngle: number;
  breakoverAngle: number;
  fuelTankGal: number;
  stockTireSize: string;
  stockTireDiameter: number;
  mpgCity: number;
  mpgHighway: number;
  mpgCombined: number;
  engineType: EngineType;
  drivetrain: Drivetrain;
  transferCase: TransferCase;
  ssf: number;
  frontWeightPct: number;
  stockWadingDepthIn: number;
  stockRatio: number;      // axle ratio
  alternatorAmps: number;
}

// ─── Multiplier Constants ──────────────────────────────────────────

/** MPG multiplier by lift height */
export const liftMpgPenalty: Record<string, number> = {
  "0": 1.0,
  "1": 0.985,
  "2": 0.97,
  "2.5": 0.955,
  "3": 0.93,
  "4": 0.91,
  "5": 0.88,
  "6": 0.85,
};

/** MPG penalty per inch of tire diameter over stock (-2.5% per inch) */
export const TIRE_DIAMETER_MPG_PENALTY_PER_INCH = 0.025;

/** MPG penalty for roof rack drag (highway-weighted) */
export const ROOF_RACK_MPG_PENALTY = 0.05; // 5% with empty rack
export const ROOF_RACK_LOADED_EXTRA_PENALTY = 0.03; // additional 3% with cargo

/** Weight penalty: lbs per 1% MPG loss */
export const WEIGHT_LBS_PER_PCT_MPG_LOSS = 100;

/** Tire pressure: MPG loss per 10 PSI under recommended */
export const TIRE_PRESSURE_PENALTY_PER_10PSI = 0.0125;

/** Altitude: MPG loss per 1000ft above 5000ft */
export const ALTITUDE_NA_PENALTY_PER_1000FT = 0.03;  // naturally aspirated
export const ALTITUDE_TURBO_PENALTY_PER_1000FT = 0.015; // turbocharged

/** Lift CG factor: how much of lift height raises CG */
export const LIFT_CG_FACTOR: Record<string, number> = {
  spacer: 0.85,     // spacer lifts raise CG nearly 1:1
  coilover: 0.75,   // coilovers slightly better
  "long-arm": 0.65, // long-arm keeps geometry better
  "body-lift": 0.4, // body lifts raise body CG, not axle
};

/** Fuel weight */
export const GAS_LBS_PER_GALLON = 6.3;
export const DIESEL_LBS_PER_GALLON = 7.1;

/** localStorage key */
export const VEHICLE_PROFILE_KEY = "pe-vehicle-profile";
