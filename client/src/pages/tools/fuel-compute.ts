import type { TerrainType, TripSegment, SegmentResult, TripResult } from "./fuel-types";

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

export function computeTrip(
  segments: TripSegment[],
  baseMpg: number,
  totalFuelGal: number,
  climateZone: string | null = null,
): TripResult {
  let fuelRemaining = totalFuelGal;
  const reserve = totalFuelGal * RESERVE_PCT;
  let pointOfNoReturn: number | null = null;
  let outOfFuelAt: number | null = null;
  let totalDistance = 0;
  let totalFuel = 0;
  let totalTime = 0;

  const results: SegmentResult[] = segments.map((seg, idx) => {
    const terrainMult = terrainMpgMultiplier[seg.terrain];

    const rawElevPenalty = seg.elevationGainFt > 0
      ? (seg.elevationGainFt / 1000) * ELEVATION_PENALTY_PER_1000FT
      : 0;
    const clampedElevPenalty = 1 - Math.min(rawElevPenalty, MAX_ELEVATION_PENALTY);

    const speedMult = speedEfficiency(seg.speedMph);
    const tempMult = temperaturePenalty(climateZone);

    const adjustedMpg = Math.max(
      0.5,
      baseMpg * terrainMult * clampedElevPenalty * speedMult * tempMult,
    );

    const fuelUsed = seg.distanceMiles / adjustedMpg;
    const timeHours = seg.speedMph > 0 ? seg.distanceMiles / seg.speedMph : 0;

    fuelRemaining -= fuelUsed;
    totalDistance += seg.distanceMiles;
    totalFuel += fuelUsed;
    totalTime += timeHours;

    const warnings: string[] = [];
    if (fuelRemaining < 0 && outOfFuelAt === null) {
      outOfFuelAt = idx;
      warnings.push("OUT OF FUEL \u2014 you won't make it through this segment");
    } else if (fuelRemaining >= 0 && fuelRemaining < reserve) {
      warnings.push("Below 10% fuel reserve \u2014 find fuel or cache soon");
    }

    if (totalFuel > totalFuelGal * 0.5 && pointOfNoReturn === null) {
      pointOfNoReturn = idx;
    }

    return {
      segment: seg,
      adjustedMpg: Math.round(adjustedMpg * 10) / 10,
      fuelUsedGal: Math.round(fuelUsed * 100) / 100,
      fuelRemainingGal: Math.round(Math.max(0, fuelRemaining) * 100) / 100,
      cumulativeDistanceMiles: Math.round(totalDistance * 10) / 10,
      timeHours: Math.round(timeHours * 100) / 100,
      terrainMultiplier: terrainMult,
      elevationPenalty: clampedElevPenalty,
      speedPenalty: speedMult,
      warnings,
    };
  });

  return {
    segments: results,
    totalDistanceMiles: Math.round(totalDistance * 10) / 10,
    totalFuelUsedGal: Math.round(totalFuel * 100) / 100,
    totalFuelCapacityGal: totalFuelGal,
    fuelRemainingGal: Math.round(Math.max(0, fuelRemaining) * 100) / 100,
    totalTimeHours: Math.round(totalTime * 100) / 100,
    pointOfNoReturnIdx: pointOfNoReturn,
    reserveWarning: fuelRemaining >= 0 && fuelRemaining < reserve,
    outOfFuel: fuelRemaining < 0,
    outOfFuelAtIdx: outOfFuelAt,
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
