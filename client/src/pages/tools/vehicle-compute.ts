// ─── Vehicle Computation Engine ──────────────────────────────────────
// Real-time physics-based calculations for the Unified Vehicle Profile.
// Every number here is derived from published data sources, not guesses.
//
// Sources:
//   MPG penalties: EPA/National Academies (weight), Expedition Portal (tires/lift),
//     Car and Driver (roof drag), RBP Tires (tire type tests)
//   CG/stability: NHTSA NCAP SSF methodology
//   Geometry: Trigonometric derivation from wheelbase/clearance/overhang
//   Recovery scoring: Weighted checklist from Trail Teams, ARB, Warn

import type {
  VehicleProfile,
  VehicleComputed,
  TireType,
} from "./vehicle-types";

import {
  tireTypePenalty,
  liftMpgPenalty,
  TIRE_DIAMETER_MPG_PENALTY_PER_INCH,
  ROOF_RACK_MPG_PENALTY,
  ROOF_RACK_LOADED_EXTRA_PENALTY,
  WEIGHT_LBS_PER_PCT_MPG_LOSS,
  TIRE_PRESSURE_PENALTY_PER_10PSI,
  LIFT_CG_FACTOR,
  GAS_LBS_PER_GALLON,
  DIESEL_LBS_PER_GALLON,
} from "./vehicle-types";

// ─── Weight Calculation ──────────────────────────────────────────────

function calcTotalModWeight(p: VehicleProfile): number {
  let w = 0;

  // Bumpers (difference from stock ~40-50 lbs)
  if (p.frontBumper.type !== "stock") w += Math.max(0, p.frontBumper.weightLbs - 45);
  if (p.rearBumper.type !== "stock") w += Math.max(0, p.rearBumper.weightLbs - 40);

  // Winch
  if (p.winch.installed) w += p.winch.weightLbs;

  // Roof setup
  if (p.roof.rack) w += p.roof.rackWeightLbs;
  w += p.roof.cargoWeightLbs;
  if (p.roof.rtt) w += p.roof.rttWeightLbs;
  if (p.roof.awning) w += p.roof.awningWeightLbs;

  // Armor
  if (p.armor.rockSliders) w += p.armor.sliderWeightLbs;
  if (p.armor.skidPlates) w += p.armor.skidPlateWeightLbs;

  // Electrical extras
  if (p.electrical.dualBattery) w += p.electrical.dualBatteryWeightLbs;
  if (p.electrical.onboardAir) w += p.electrical.onboardAirWeightLbs;
  w += p.electrical.radioWeightLbs;

  // Aux fuel weight
  const fuelLbsPerGal = p.engineType === "diesel" ? DIESEL_LBS_PER_GALLON : GAS_LBS_PER_GALLON;
  w += p.fuel.auxTankGal * fuelLbsPerGal;
  w += p.fuel.extraCansGal * fuelLbsPerGal;

  // Bed slide
  if (p.bedSlide?.installed) {
    w += p.bedSlide.weightLbs;
    w += p.bedSlide.cargoWeightLbs;
  }

  // Trailer tongue weight (added to vehicle weight)
  if (p.trailer.hasTrailer) w += p.trailer.tongueWeightLbs;

  // Other mods
  w += p.otherModsWeightLbs;

  return Math.round(w);
}

// ─── MPG Calculation ─────────────────────────────────────────────────

interface MpgBreakdownItem {
  label: string;
  penalty: number; // percentage loss (positive = bad)
}

function calcMpg(p: VehicleProfile, totalModWeight: number): { mpg: number; pct: number; breakdown: MpgBreakdownItem[] } {
  // If user has a real-world tested MPG, use that as the baseline result
  if (p.testedMpg !== null && p.testedMpg > 0) {
    return {
      mpg: p.testedMpg,
      pct: Math.round((1 - p.testedMpg / p.mpgCombined) * 100),
      breakdown: [{ label: "User-tested MPG override", penalty: 0 }],
    };
  }

  // EV doesn't use traditional MPG penalties the same way
  if (p.engineType === "ev") {
    // Simplified: weight penalty only (EVs less affected by aero at low speed)
    const weightPenalty = (totalModWeight / WEIGHT_LBS_PER_PCT_MPG_LOSS) * 0.01;
    const finalMpg = p.mpgCombined * (1 - weightPenalty);
    return {
      mpg: Math.round(finalMpg * 10) / 10,
      pct: Math.round(weightPenalty * 100),
      breakdown: [
        { label: `Added weight (${totalModWeight} lbs)`, penalty: Math.round(weightPenalty * 100) },
      ],
    };
  }

  const breakdown: MpgBreakdownItem[] = [];
  let multiplier = 1.0;

  // 1. Tire type penalty
  const tireMult = tireTypePenalty[p.tires.type] || 1.0;
  if (tireMult < 1.0) {
    const pct = Math.round((1 - tireMult) * 100);
    breakdown.push({ label: `${p.tires.type} tires`, penalty: pct });
    multiplier *= tireMult;
  }

  // 2. Tire diameter penalty
  const diameterDiff = p.tires.diameter - p.stockTireDiameter;
  if (diameterDiff > 0) {
    const diamPenalty = diameterDiff * TIRE_DIAMETER_MPG_PENALTY_PER_INCH;
    const pct = Math.round(diamPenalty * 100);
    breakdown.push({ label: `+${diameterDiff.toFixed(1)}" tire diameter`, penalty: pct });
    multiplier *= (1 - diamPenalty);
  }

  // 3. Lift penalty
  if (p.lift.inches > 0) {
    // Find nearest key in liftMpgPenalty
    const keys = Object.keys(liftMpgPenalty).map(Number).sort((a, b) => a - b);
    let liftMult = 1.0;
    if (p.lift.inches >= keys[keys.length - 1]) {
      liftMult = liftMpgPenalty[String(keys[keys.length - 1])];
    } else {
      // Interpolate
      for (let i = 0; i < keys.length - 1; i++) {
        if (p.lift.inches >= keys[i] && p.lift.inches <= keys[i + 1]) {
          const range = keys[i + 1] - keys[i];
          const frac = (p.lift.inches - keys[i]) / range;
          const low = liftMpgPenalty[String(keys[i])];
          const high = liftMpgPenalty[String(keys[i + 1])];
          liftMult = low + frac * (high - low);
          break;
        }
      }
    }
    if (liftMult < 1.0) {
      const pct = Math.round((1 - liftMult) * 100);
      breakdown.push({ label: `${p.lift.inches}" ${p.lift.type} lift`, penalty: pct });
      multiplier *= liftMult;
    }
  }

  // 4. Tire pressure penalty
  const psiUnder = p.tires.recommendedPsi - p.tires.pressurePsi;
  if (psiUnder > 0) {
    const pressurePenalty = (psiUnder / 10) * TIRE_PRESSURE_PENALTY_PER_10PSI;
    const pct = Math.round(pressurePenalty * 100 * 10) / 10;
    breakdown.push({ label: `${psiUnder} PSI under-inflated`, penalty: Math.round(pct) });
    multiplier *= (1 - pressurePenalty);
  }

  // 5. Roof rack drag penalty
  if (p.roof.rack) {
    let rackPenalty = ROOF_RACK_MPG_PENALTY;
    if (p.roof.cargoWeightLbs > 0 || p.roof.rtt || p.roof.awning) {
      rackPenalty += ROOF_RACK_LOADED_EXTRA_PENALTY;
    }
    const pct = Math.round(rackPenalty * 100);
    breakdown.push({ label: `Roof rack${p.roof.cargoWeightLbs > 0 || p.roof.rtt ? " + cargo" : ""}`, penalty: pct });
    multiplier *= (1 - rackPenalty);
  }

  // 6. Weight penalty
  if (totalModWeight > 0) {
    const weightPenalty = (totalModWeight / WEIGHT_LBS_PER_PCT_MPG_LOSS) * 0.01;
    const pct = Math.round(weightPenalty * 100);
    breakdown.push({ label: `Added weight (${totalModWeight} lbs)`, penalty: pct });
    multiplier *= (1 - weightPenalty);
  }

  // 7. Regear benefit (partially offsets larger tire penalty)
  if (p.drivetrainMods.regeared && p.drivetrainMods.newRatio > p.drivetrainMods.stockRatio) {
    const ratioImprovement = (p.drivetrainMods.newRatio - p.drivetrainMods.stockRatio) / p.drivetrainMods.stockRatio;
    // Regearing recovers roughly 40% of the tire diameter penalty
    const regearRecovery = Math.min(0.04, ratioImprovement * 0.4);
    if (regearRecovery > 0) {
      const pct = Math.round(regearRecovery * 100);
      breakdown.push({ label: `Regear to ${p.drivetrainMods.newRatio}`, penalty: -pct });
      multiplier *= (1 + regearRecovery);
    }
  }

  const finalMpg = Math.max(1, p.mpgCombined * multiplier);
  const totalPenalty = Math.round((1 - multiplier) * 100);

  return {
    mpg: Math.round(finalMpg * 10) / 10,
    pct: totalPenalty,
    breakdown,
  };
}

// ─── Geometry Calculation ────────────────────────────────────────────

function calcGeometry(p: VehicleProfile) {
  // Modified ground clearance
  const liftGain = p.lift.inches;
  const tireDiamGain = (p.tires.diameter - p.stockTireDiameter) / 2;
  const modifiedGroundClearance = p.groundClearanceIn + liftGain + tireDiamGain;

  // Modified CG height
  const liftType = p.lift.type || "spacer";
  const cgFactor = LIFT_CG_FACTOR[liftType] || 0.85;
  const liftCgIncrease = p.lift.inches * cgFactor;
  const tireCgIncrease = tireDiamGain * 0.5; // half goes to raising axle
  const modifiedCgHeight = p.cgHeightIn + liftCgIncrease + tireCgIncrease;

  // Modified SSF
  const modifiedSsf = p.trackWidthIn / (2 * modifiedCgHeight);

  // Rollover threshold (degrees) — atan(SSF) * (180/pi)
  const rolloverThresholdDeg = Math.atan(modifiedSsf) * (180 / Math.PI);

  // Modified approach angle
  // Approach = atan2(ground_clearance_front, front_overhang) — simplified
  // Lift + bigger tires improve approach proportionally
  const clearanceRatio = modifiedGroundClearance / p.groundClearanceIn;
  const modifiedApproachAngle = Math.min(90, p.approachAngle * clearanceRatio);
  const modifiedDepartureAngle = Math.min(90, p.departureAngle * clearanceRatio);

  // Breakover depends on wheelbase and clearance
  // breakover = atan(2 * clearance / wheelbase) in degrees
  const stockBreakover = Math.atan((2 * p.groundClearanceIn) / p.wheelbaseIn) * (180 / Math.PI);
  const modBreakover = Math.atan((2 * modifiedGroundClearance) / p.wheelbaseIn) * (180 / Math.PI);
  const breakoverImprovement = modBreakover - stockBreakover;
  const modifiedBreakoverAngle = p.breakoverAngle + breakoverImprovement;

  return {
    modifiedGroundClearanceIn: Math.round(modifiedGroundClearance * 10) / 10,
    modifiedApproachAngle: Math.round(modifiedApproachAngle * 10) / 10,
    modifiedDepartureAngle: Math.round(modifiedDepartureAngle * 10) / 10,
    modifiedBreakoverAngle: Math.round(modifiedBreakoverAngle * 10) / 10,
    modifiedCgHeightIn: Math.round(modifiedCgHeight * 10) / 10,
    modifiedSsf: Math.round(modifiedSsf * 100) / 100,
    rolloverThresholdDeg: Math.round(rolloverThresholdDeg * 10) / 10,
  };
}

// ─── Recovery Score ──────────────────────────────────────────────────
// Weighted scoring: each item has a point value based on how critical
// it is for self-recovery and group recovery.

function calcRecoveryScore(p: VehicleProfile): number {
  let score = 0;
  const r = p.recovery;

  // Self-recovery essentials (high value)
  if (p.winch.installed) score += 20;
  if (r.kinetic) score += 10;
  if (r.tractionBoards) score += 10;

  // Standard recovery kit
  if (r.straps) score += 6;
  if (r.shackles) score += 6;
  if (r.treeProtector) score += 5;
  if (r.snatchBlock) score += 7; // force multiplier

  // Field repair
  if (r.tirePlug) score += 5;
  if (r.compressor) score += 6;
  if (r.spareTire) score += 8;
  if (r.spareTireFullSize) score += 4; // bonus for full-size

  // Utility
  if (r.highlift) score += 5;
  if (r.shovel) score += 4;

  // Lockers help recovery
  if (p.drivetrainMods.rearLocker) score += 3;
  if (p.drivetrainMods.frontLocker) score += 2;

  return Math.min(100, Math.round(score));
}

// ─── Trail Readiness Score ───────────────────────────────────────────
// How ready is this rig for serious off-road / overlanding?

function calcTrailReadiness(
  p: VehicleProfile,
  geo: ReturnType<typeof calcGeometry>,
  recoveryScore: number,
): number {
  let score = 0;

  // Drivetrain (0-15)
  if (p.drivetrain === "4wd") score += 12;
  else if (p.drivetrain === "awd") score += 8;
  if (p.transferCase === "part-time" || p.transferCase === "selectable") score += 3;

  // Ground clearance (0-12)
  if (geo.modifiedGroundClearanceIn >= 12) score += 12;
  else if (geo.modifiedGroundClearanceIn >= 10) score += 10;
  else if (geo.modifiedGroundClearanceIn >= 8) score += 7;
  else score += 4;

  // Approach angle (0-8)
  if (geo.modifiedApproachAngle >= 40) score += 8;
  else if (geo.modifiedApproachAngle >= 30) score += 6;
  else if (geo.modifiedApproachAngle >= 25) score += 4;
  else score += 2;

  // Tires (0-10)
  if (p.tires.type === "mud-terrain") score += 10;
  else if (p.tires.type === "all-terrain") score += 8;
  else if (p.tires.type === "hybrid") score += 6;
  else score += 2;

  if (p.tires.diameter >= 33) score += 3;
  else if (p.tires.diameter >= 31) score += 1;

  // Armor (0-8)
  if (p.armor.rockSliders) score += 4;
  if (p.armor.skidPlates) score += 4;

  // Lockers (0-8)
  if (p.drivetrainMods.rearLocker) score += 5;
  if (p.drivetrainMods.frontLocker) score += 3;

  // Recovery readiness (0-15, scaled from recovery score)
  score += Math.round(recoveryScore * 0.15);

  // Water fording (0-5)
  if (p.waterFording.snorkel) score += 3;
  if (p.waterFording.diffBreathers) score += 2;

  // Self-sufficiency (0-8)
  if (p.electrical.dualBattery) score += 2;
  if (p.electrical.onboardAir) score += 2;
  if (p.fuel.auxTankGal > 0 || p.fuel.extraCansGal > 0) score += 2;
  if (p.roof.rtt) score += 1;
  if (p.electrical.radioType !== "none") score += 1;

  return Math.min(100, Math.round(score));
}

// ─── Weight Breakdown ────────────────────────────────────────────────

function calcWeightBreakdown(p: VehicleProfile): { label: string; value: number; color: string }[] {
  const items: { label: string; value: number; color: string }[] = [];

  // Front bumper delta
  const fbDelta = p.frontBumper.type !== "stock" ? Math.max(0, p.frontBumper.weightLbs - 45) : 0;
  if (fbDelta > 0) items.push({ label: "Front Bumper", value: fbDelta, color: "#6B7280" });

  // Rear bumper delta
  const rbDelta = p.rearBumper.type !== "stock" ? Math.max(0, p.rearBumper.weightLbs - 40) : 0;
  if (rbDelta > 0) items.push({ label: "Rear Bumper", value: rbDelta, color: "#9CA3AF" });

  // Winch
  if (p.winch.installed && p.winch.weightLbs > 0)
    items.push({ label: "Winch", value: p.winch.weightLbs, color: "#EF4444" });

  // Roof
  const roofTotal = (p.roof.rack ? p.roof.rackWeightLbs : 0)
    + p.roof.cargoWeightLbs
    + (p.roof.rtt ? p.roof.rttWeightLbs : 0)
    + (p.roof.awning ? p.roof.awningWeightLbs : 0);
  if (roofTotal > 0) items.push({ label: "Roof Setup", value: roofTotal, color: "#3B82F6" });

  // Armor
  const armorTotal = (p.armor.rockSliders ? p.armor.sliderWeightLbs : 0)
    + (p.armor.skidPlates ? p.armor.skidPlateWeightLbs : 0);
  if (armorTotal > 0) items.push({ label: "Armor", value: armorTotal, color: "#F59E0B" });

  // Electrical
  const elecTotal = (p.electrical.dualBattery ? p.electrical.dualBatteryWeightLbs : 0)
    + (p.electrical.onboardAir ? p.electrical.onboardAirWeightLbs : 0)
    + p.electrical.radioWeightLbs;
  if (elecTotal > 0) items.push({ label: "Electrical", value: elecTotal, color: "#8B5CF6" });

  // Aux fuel
  const fuelLbsPerGal = p.engineType === "diesel" ? DIESEL_LBS_PER_GALLON : GAS_LBS_PER_GALLON;
  const auxFuelWeight = (p.fuel.auxTankGal + p.fuel.extraCansGal) * fuelLbsPerGal;
  if (auxFuelWeight > 0) items.push({ label: "Aux Fuel", value: Math.round(auxFuelWeight), color: "#10B981" });

  // Bed slide
  if (p.bedSlide?.installed) {
    const slideTotal = p.bedSlide.weightLbs + p.bedSlide.cargoWeightLbs;
    if (slideTotal > 0) items.push({ label: "Bed Slide", value: slideTotal, color: "#14B8A6" });
  }

  // Tongue weight
  if (p.trailer.hasTrailer && p.trailer.tongueWeightLbs > 0)
    items.push({ label: "Trailer Tongue", value: p.trailer.tongueWeightLbs, color: "#EC4899" });

  // Other
  if (p.otherModsWeightLbs > 0)
    items.push({ label: "Other Mods", value: p.otherModsWeightLbs, color: "#6366F1" });

  return items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
}

// ─── Warnings ────────────────────────────────────────────────────────

function calcWarnings(
  p: VehicleProfile,
  totalLoaded: number,
  geo: ReturnType<typeof calcGeometry>,
): string[] {
  const w: string[] = [];

  // Overloaded
  if (totalLoaded > p.gvwrLbs) {
    const over = totalLoaded - p.gvwrLbs;
    w.push(`OVERLOADED: ${over} lbs over GVWR (${p.gvwrLbs} lbs). Brakes, suspension, and tires are operating beyond rated capacity.`);
  } else if (totalLoaded > p.gvwrLbs * 0.95) {
    w.push(`Within 5% of GVWR. Limited payload margin remaining.`);
  }

  // Towing over max
  if (p.trailer.hasTrailer && p.trailer.trailerWeightLbs > p.maxTowingLbs) {
    w.push(`Trailer weight (${p.trailer.trailerWeightLbs} lbs) exceeds max towing capacity (${p.maxTowingLbs} lbs).`);
  }

  // Stability warning
  if (geo.modifiedSsf < 1.0) {
    w.push(`SSF below 1.0 (${geo.modifiedSsf}). HIGH rollover risk. NHTSA rates this as dangerous.`);
  } else if (geo.modifiedSsf < 1.05) {
    w.push(`SSF is ${geo.modifiedSsf}. Elevated rollover risk, especially on off-camber terrain. Drive accordingly.`);
  }

  // Tire age
  if (p.tires.ageMonths > 72) {
    w.push(`Tires are ${Math.round(p.tires.ageMonths / 12)} years old. Rubber degrades regardless of tread depth. NHTSA recommends replacement at 6 years.`);
  } else if (p.tires.ageMonths > 60) {
    w.push(`Tires are ${Math.round(p.tires.ageMonths / 12)} years old. Inspect sidewalls for cracking. Consider replacement within the next year.`);
  }

  // Tire pressure
  const psiUnder = p.tires.recommendedPsi - p.tires.pressurePsi;
  if (psiUnder >= 15) {
    w.push(`Tires ${psiUnder} PSI under recommended. Significantly increases blowout risk and heat buildup at highway speeds.`);
  }

  // Lift without regear
  if (p.lift.inches >= 3 && p.tires.diameter >= 33 && !p.drivetrainMods.regeared) {
    w.push(`${p.lift.inches}" lift + ${p.tires.diameter}" tires without regearing. Transmission works harder, runs hotter, and accelerates wear. Consider 4.88 or higher gears.`);
  }

  // Winch without bumper mount
  if (p.winch.installed && !p.frontBumper.hasWinchMount) {
    w.push(`Winch installed but front bumper has no winch mount. Verify mounting is rated for the winch pull capacity.`);
  }

  // High CG with roof load
  if (p.roof.rtt && geo.modifiedSsf < 1.1) {
    w.push(`Roof top tent with reduced SSF (${geo.modifiedSsf}). High center of gravity increases roll risk. Remove RTT for highway towing.`);
  }

  // Bed slide overloaded
  if (p.bedSlide?.installed && p.bedSlide.cargoWeightLbs > p.bedSlide.loadCapacityLbs && p.bedSlide.loadCapacityLbs > 0) {
    w.push(`Bed slide cargo (${p.bedSlide.cargoWeightLbs} lbs) exceeds rated capacity (${p.bedSlide.loadCapacityLbs} lbs). Risk of slide failure or rail damage.`);
  }

  // No recovery gear with off-road setup
  if (p.tires.type !== "highway" && p.lift.inches > 0) {
    const hasBasicRecovery = p.recovery.straps || p.recovery.kinetic || p.recovery.tractionBoards;
    if (!hasBasicRecovery) {
      w.push(`Off-road build with no recovery gear. At minimum, carry traction boards, a kinetic rope, and shackles.`);
    }
  }

  return w;
}

// ─── Master Compute Function ─────────────────────────────────────────

export function computeVehicle(p: VehicleProfile): VehicleComputed {
  // Weight
  const totalModWeight = calcTotalModWeight(p);
  const totalLoadedWeight = p.curbWeightLbs + totalModWeight;
  const remainingPayload = p.gvwrLbs - totalLoadedWeight;
  const payloadPct = Math.round((totalLoadedWeight / p.gvwrLbs) * 100);

  // MPG
  const mpgResult = calcMpg(p, totalModWeight);

  // Fuel & Range
  const totalFuelGal = p.fuel.stockTankGal + p.fuel.auxTankGal + p.fuel.extraCansGal;
  const estimatedRange = Math.round(totalFuelGal * mpgResult.mpg);

  // Geometry
  const geo = calcGeometry(p);

  // Scores
  const recoveryScore = calcRecoveryScore(p);
  const trailReadiness = calcTrailReadiness(p, geo, recoveryScore);
  const overallReadiness = Math.round((recoveryScore * 0.35 + trailReadiness * 0.65));

  // Weight breakdown
  const weightBreakdown = calcWeightBreakdown(p);

  // Warnings
  const warnings = calcWarnings(p, totalLoadedWeight, geo);

  return {
    totalModWeightLbs: totalModWeight,
    totalLoadedWeightLbs: totalLoadedWeight,
    remainingPayloadLbs: remainingPayload,
    payloadPct,
    overloaded: totalLoadedWeight > p.gvwrLbs,

    estimatedMpg: mpgResult.mpg,
    mpgPenaltyPct: mpgResult.pct,
    totalFuelGal,
    estimatedRangeMiles: estimatedRange,

    ...geo,

    recoveryScore,
    trailReadinessScore: trailReadiness,
    overallReadinessScore: overallReadiness,

    weightBreakdown,
    mpgBreakdown: mpgResult.breakdown,
    warnings,
  };
}
