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
}

export interface SegmentResult {
  segment: TripSegment;
  adjustedMpg: number;
  fuelUsedGal: number;
  fuelRemainingGal: number;
  fuelAfterRefillGal: number;
  didRefuel: boolean;
  cumulativeDistanceMiles: number;
  timeHours: number;
  terrainMultiplier: number;
  elevationPenalty: number;
  speedPenalty: number;
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
  refuelStopCount: number;
  pointOfNoReturnIdx: number | null;
  reserveWarning: boolean;
  outOfFuel: boolean;
  outOfFuelAtIdx: number | null;
}

export interface TripPreset {
  id: string;
  name: string;
  region: string;
  description: string;
  totalMiles: number;
  segments: Omit<TripSegment, "id">[];
}
