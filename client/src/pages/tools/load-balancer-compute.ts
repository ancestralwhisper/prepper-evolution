// ─── Overland Load Balancer — Compute Engine ─────────────────────────────────
// Calculates payload used, axle distribution, roof load, stability risk,
// and safety warnings from vehicle config + session input.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

export type PlacementZone = "cab" | "roof" | "bed-front" | "bed-rear" | "hitch";

export type GearCategory =
  | "shelter"
  | "recovery"
  | "water-fuel"
  | "power"
  | "kitchen"
  | "medical"
  | "comms"
  | "navigation"
  | "clothing"
  | "tools"
  | "other";

export type LoadStatus = "safe" | "warning" | "danger" | "over";

export type StabilityRisk = "low" | "moderate" | "high" | "critical";

export interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  defaultZone: PlacementZone;
  weightPerUnit: number;
  unit: string;
  asin?: string;
  notes?: string;
}

export interface LoadEntry {
  id: string;
  gearItemId: string;
  name: string;
  zone: PlacementZone;
  qty: number;
  weightPerUnit: number;
}

/** Vehicle specs passed in from the database */
export interface LoadConfig {
  curbWeightLbs: number;
  gvwrLbs: number;
  fuelTankGal: number;
  /** Stock front axle weight as a percentage, e.g. 52 = 52% front. Defaults to 52. */
  frontWeightPct?: number;
  /** Static roof load rating in lbs. Defaults to 165. */
  roofStaticLbs?: number;
}

/** User inputs for the current load session */
export interface LoadSessionConfig {
  vehicleKey: string;
  entries: LoadEntry[];
  passengerCount: number;
  driverWeightLbs: number;
  avgPassengerWeightLbs: number;
  /** 0–100 */
  fuelFillPct: number;
  trailerTongueLbs: number;
}

export interface LoadResult {
  // ── Payload ──────────────────────────────────────────────────────────────
  status: LoadStatus;
  payloadUsedPct: number;
  totalAddedLbs: number;
  payloadCapacityLbs: number;
  payloadRemainingLbs: number;

  // ── Weight breakdown ─────────────────────────────────────────────────────
  gearLbs: number;
  peopleLbs: number;
  fuelLbs: number;
  tongueLbs: number;
  vehicleCurbLbs: number;
  totalGrossLbs: number;
  gvwrLbs: number;

  // ── Axle distribution ────────────────────────────────────────────────────
  axleLoads: {
    frontLbs: number;
    rearLbs: number;
    frontPct: number;
    rearPct: number;
  };

  // ── Roof ─────────────────────────────────────────────────────────────────
  roofLoadLbs: number;
  roofStaticRatingLbs: number;
  roofOverloaded: boolean;

  // ── Stability ────────────────────────────────────────────────────────────
  stabilityRisk: StabilityRisk;

  // ── Warnings ─────────────────────────────────────────────────────────────
  warnings: string[];

  // ── Gear by zone ─────────────────────────────────────────────────────────
  byZone: Record<PlacementZone, number>;
}

// ─── Axle contribution factors ────────────────────────────────────────────────
// Each zone contributes a fraction to the front vs rear axle.
// These are reasonable approximations for a standard pickup truck.
const ZONE_FRONT_FACTOR: Record<PlacementZone, number> = {
  cab:         0.80, // cab gear + people sit over/near front axle
  "bed-front": 0.35, // forward section of bed — closer to front
  "bed-rear":  0.10, // rearward section — mostly rear axle
  roof:        0.50, // evenly distributed along length
  hitch:       0.00, // all weight pulls on rear axle
};

// ─── Main ────────────────────────────────────────────────────────────────────

export function calculateLoad(
  vehicleConfig: LoadConfig,
  session: LoadSessionConfig,
): LoadResult {
  const {
    curbWeightLbs,
    gvwrLbs,
    fuelTankGal,
    frontWeightPct = 52,
    roofStaticLbs = 165,
  } = vehicleConfig;

  const {
    entries,
    passengerCount,
    driverWeightLbs,
    avgPassengerWeightLbs,
    fuelFillPct,
    trailerTongueLbs,
  } = session;

  // ── 1. Gear by zone ───────────────────────────────────────────────────────
  const byZone: Record<PlacementZone, number> = {
    cab: 0,
    roof: 0,
    "bed-front": 0,
    "bed-rear": 0,
    hitch: 0,
  };
  for (const e of entries) {
    byZone[e.zone] += e.qty * e.weightPerUnit;
  }
  const gearLbs = (Object.values(byZone) as number[]).reduce((a, b) => a + b, 0);

  // ── 2. People ─────────────────────────────────────────────────────────────
  const peopleLbs = driverWeightLbs + passengerCount * avgPassengerWeightLbs;

  // ── 3. Fuel ───────────────────────────────────────────────────────────────
  const fuelLbs = fuelTankGal * (fuelFillPct / 100) * 6.1;

  // ── 4. Tongue weight ──────────────────────────────────────────────────────
  const tongueLbs = trailerTongueLbs;

  // ── 5. Payload ────────────────────────────────────────────────────────────
  const totalAddedLbs = gearLbs + peopleLbs + fuelLbs + tongueLbs;
  const payloadCapacityLbs = gvwrLbs - curbWeightLbs;
  const payloadRemainingLbs = payloadCapacityLbs - totalAddedLbs;
  const payloadUsedPct = payloadCapacityLbs > 0
    ? (totalAddedLbs / payloadCapacityLbs) * 100
    : 0;
  const totalGrossLbs = curbWeightLbs + totalAddedLbs;

  // ── 6. Status ─────────────────────────────────────────────────────────────
  let status: LoadStatus;
  if (payloadUsedPct >= 100) status = "over";
  else if (payloadUsedPct >= 93)  status = "danger";
  else if (payloadUsedPct >= 80)  status = "warning";
  else                             status = "safe";

  // ── 7. Axle distribution ─────────────────────────────────────────────────
  // Stock curb weight split
  const curbFrontLbs = curbWeightLbs * (frontWeightPct / 100);
  const curbRearLbs  = curbWeightLbs * (1 - frontWeightPct / 100);

  // Gear contributions
  let gearFrontLbs = 0;
  let gearRearLbs  = 0;
  for (const zone of Object.keys(byZone) as PlacementZone[]) {
    const w = byZone[zone];
    const f = ZONE_FRONT_FACTOR[zone];
    gearFrontLbs += w * f;
    gearRearLbs  += w * (1 - f);
  }

  // People + fuel sit in cab → 80% front
  const peopleFuelFront = (peopleLbs + fuelLbs) * 0.80;
  const peopleFuelRear  = (peopleLbs + fuelLbs) * 0.20;

  // Tongue → 100% rear
  const frontLbs = curbFrontLbs + gearFrontLbs + peopleFuelFront;
  const rearLbs  = curbRearLbs  + gearRearLbs  + peopleFuelRear + tongueLbs;

  const totalAxleLbs = frontLbs + rearLbs;
  const axleLoads = {
    frontLbs: Math.round(frontLbs),
    rearLbs:  Math.round(rearLbs),
    frontPct: totalAxleLbs > 0 ? Math.round((frontLbs / totalAxleLbs) * 100) : 50,
    rearPct:  totalAxleLbs > 0 ? Math.round((rearLbs  / totalAxleLbs) * 100) : 50,
  };

  // ── 8. Roof load ──────────────────────────────────────────────────────────
  const roofLoadLbs = byZone.roof;
  const roofOverloaded = roofLoadLbs > roofStaticLbs;

  // ── 9. Stability risk ─────────────────────────────────────────────────────
  const roofPctOfAdded = totalAddedLbs > 0 ? (roofLoadLbs / totalAddedLbs) * 100 : 0;
  let stabilityRisk: StabilityRisk;

  if (status === "over" || roofOverloaded) {
    stabilityRisk = "critical";
  } else if (status === "danger" || axleLoads.rearPct > 65 || roofPctOfAdded > 25) {
    stabilityRisk = "high";
  } else if (status === "warning" || axleLoads.rearPct > 60 || roofPctOfAdded > 15) {
    stabilityRisk = "moderate";
  } else {
    stabilityRisk = "low";
  }

  // ── 10. Warnings ──────────────────────────────────────────────────────────
  const warnings: string[] = [];

  if (status === "over") {
    const overBy = Math.round(totalAddedLbs - payloadCapacityLbs);
    warnings.push(
      `Overloaded: ${overBy.toLocaleString()} lbs over payload capacity. Remove gear before driving — this is a safety and legal issue.`,
    );
  } else if (status === "danger") {
    const remaining = Math.round(payloadRemainingLbs);
    warnings.push(
      `Only ${remaining.toLocaleString()} lbs of payload remaining (${payloadUsedPct.toFixed(0)}% used). Leave margin for unexpected loads.`,
    );
  } else if (status === "warning") {
    warnings.push(
      `Approaching payload limit (${payloadUsedPct.toFixed(0)}% used). Check that nothing heavy was missed.`,
    );
  }

  if (roofOverloaded) {
    warnings.push(
      `Roof overloaded: ${Math.round(roofLoadLbs).toLocaleString()} lbs on roof exceeds ${roofStaticLbs.toLocaleString()} lb static rating. Reduce roof load.`,
    );
  } else if (roofPctOfAdded > 20 && roofLoadLbs > 0) {
    warnings.push(
      `Top-heavy: ${Math.round(roofPctOfAdded)}% of added weight is on the roof. Drive conservatively — reduced cornering stability.`,
    );
  }

  if (axleLoads.rearPct > 65) {
    warnings.push(
      `Rear-heavy: ${axleLoads.rearPct}% of gross weight on rear axle. Move heavier gear forward toward the cab.`,
    );
  }

  if (tongueLbs > 0 && tongueLbs > totalAddedLbs * 0.20) {
    warnings.push(
      `Tongue weight is ${Math.round((tongueLbs / totalAddedLbs) * 100)}% of total added load — check it's within your vehicle's hitch rating.`,
    );
  }

  return {
    status,
    payloadUsedPct: Math.round(payloadUsedPct * 10) / 10,
    totalAddedLbs: Math.round(totalAddedLbs),
    payloadCapacityLbs: Math.round(payloadCapacityLbs),
    payloadRemainingLbs: Math.round(payloadRemainingLbs),
    gearLbs:  Math.round(gearLbs),
    peopleLbs: Math.round(peopleLbs),
    fuelLbs:  Math.round(fuelLbs),
    tongueLbs: Math.round(tongueLbs),
    vehicleCurbLbs: Math.round(curbWeightLbs),
    totalGrossLbs: Math.round(totalGrossLbs),
    gvwrLbs: Math.round(gvwrLbs),
    axleLoads,
    roofLoadLbs: Math.round(roofLoadLbs),
    roofStaticRatingLbs: roofStaticLbs,
    roofOverloaded,
    stabilityRisk,
    warnings,
    byZone,
  };
}
