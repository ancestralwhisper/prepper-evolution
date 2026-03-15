export type TerrainType =
  | "highway"
  | "city"
  | "gravel"
  | "dirt"
  | "sand"
  | "mud"
  | "rock-crawl"
  | "snow";

export interface TripSegment {
  id: string;
  name: string;
  distanceMiles: number;
  terrain: TerrainType;
  elevationGainFt: number;
  speedMph: number;
  isFuelStop: boolean;
  /** Minutes of idle time at this segment (engine running, no miles added) */
  idleMinutes?: number;
}

export interface SegmentResult {
  segment: TripSegment;
  adjustedMpg: number;
  fuelUsedGal: number;
  /** Fuel burned while idling (not distance-based) */
  idleFuelGal: number;
  fuelRemainingGal: number;
  fuelAfterRefillGal: number;
  didRefuel: boolean;
  cumulativeDistanceMiles: number;
  timeHours: number;
  terrainMultiplier: number;
  elevationPenalty: number;
  speedPenalty: number;
  /** Descent recovery multiplier (> 1.0 means fuel savings) */
  descentRecovery: number;
  warnings: string[];
}

export interface TripResult {
  segments: SegmentResult[];
  totalDistanceMiles: number;
  totalFuelUsedGal: number;
  totalFuelCapacityGal: number;
  fuelRemainingGal: number;
  totalTimeHours: number;
  totalFuelCost: number;
  totalIdleFuelGal: number;
  refuelStopCount: number;
  pointOfNoReturnIdx: number | null;
  reserveWarning: boolean;
  outOfFuel: boolean;
  outOfFuelAtIdx: number | null;
  /** Total rig penalty applied to base MPG (0-1, e.g. 0.85 means 15% loss) */
  rigPenaltyMultiplier: number;
}

export interface TripPreset {
  id: string;
  name: string;
  region: string;
  description: string;
  totalMiles: number;
  segments: Omit<TripSegment, "id">[];
}

// ─── Rig & Conditions ──────────────────────────────────────────────

export type LiftHeight = "0" | "1" | "2" | "2.5" | "3" | "4" | "5" | "6";

export type TireTypeOption = "highway" | "all-terrain" | "mud-terrain" | "hybrid";

export type HeadwindLevel = "none" | "light" | "moderate" | "strong";

export type DriveMode = "2wd" | "4h" | "4l";

export type FuelTypeOption = "e10" | "premium" | "e85";

export type AltitudeBand = "below-3000" | "3000-5000" | "5000-7000" | "7000-9000" | "9000-plus";

export interface AeroDragMods {
  lightbar: boolean;
  bullBar: boolean;
  snorkel: boolean;
  antenna: boolean;
  awning: boolean;
  rtt: boolean;
}

export interface RigConditions {
  // Suspension & Tires
  liftInches: LiftHeight;
  tireType: TireTypeOption;
  tireSizeOverStock: number;   // inches over stock diameter
  airedDown: boolean;

  // Drivetrain & Engine
  driveMode: DriveMode;
  acOn: boolean;
  fuelType: FuelTypeOption;
  isTurbo: boolean;            // halves altitude penalty

  // Aero & Load
  cargoWeightLbs: number;
  towingEnabled: boolean;
  trailerWeightLbs: number;
  aeroDrag: AeroDragMods;
  fairing: boolean;            // reduces RTT drag

  // Environment
  headwind: HeadwindLevel;
  altitude: AltitudeBand;
}

export const DEFAULT_RIG_CONDITIONS: RigConditions = {
  liftInches: "0",
  tireType: "highway",
  tireSizeOverStock: 0,
  airedDown: false,
  driveMode: "2wd",
  acOn: false,
  fuelType: "e10",
  isTurbo: false,
  cargoWeightLbs: 0,
  towingEnabled: false,
  trailerWeightLbs: 0,
  aeroDrag: {
    lightbar: false,
    bullBar: false,
    snorkel: false,
    antenna: false,
    awning: false,
    rtt: false,
  },
  fairing: false,
  headwind: "none",
  altitude: "below-3000",
};
