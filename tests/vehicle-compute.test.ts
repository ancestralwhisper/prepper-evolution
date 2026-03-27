import { describe, it, expect } from "vitest";
import { computeVehicle } from "../client/src/pages/tools/vehicle-compute";
import type { VehicleProfile } from "../client/src/pages/tools/vehicle-types";

// ─── Minimal stock vehicle (2025 GMC Sierra 1500 approximation) ──────

const stockSierra: VehicleProfile = {
  id: "test-sierra",
  nickname: "Test Sierra",
  year: 2025,
  make: "GMC",
  model: "Sierra 1500",
  trim: "SLE",

  // Stock specs
  curbWeightLbs: 5010,
  gvwrLbs: 7100,
  maxTowingLbs: 13000,
  wheelbaseIn: 147.4,
  trackWidthIn: 65.7,
  groundClearanceIn: 8.9,
  approachAngle: 17.2,
  departureAngle: 22.4,
  breakoverAngle: 19.5,
  fuelTankGal: 24,
  stockTireSize: "265/65R18",
  stockTireDiameter: 31.5,
  mpgCity: 16,
  mpgHighway: 20,
  mpgCombined: 18,
  engineType: "gas",
  drivetrain: "4wd",
  transferCase: "part-time",
  ssf: 1.05,
  cgHeightIn: 31.3,
  frontWeightPct: 56,

  // No mods
  lift: { inches: 0, type: "spacer" },
  tires: {
    size: "265/65R18",
    diameter: 31.5,
    type: "highway",
    pressurePsi: 35,
    recommendedPsi: 35,
    ageMonths: 6,
  },
  frontBumper: { type: "stock", weightLbs: 45, hasWinchMount: false },
  rearBumper: { type: "stock", weightLbs: 40, hasWinchMount: false },
  winch: { installed: false, pullRatingLbs: 0, weightLbs: 0, type: "electric" },
  roof: {
    rack: false,
    rackWeightLbs: 0,
    cargoWeightLbs: 0,
    rtt: false,
    rttWeightLbs: 0,
    awning: false,
    awningWeightLbs: 0,
  },
  armor: { rockSliders: false, sliderWeightLbs: 0, skidPlates: false, skidPlateWeightLbs: 0 },
  fuel: { stockTankGal: 24, auxTankGal: 0, auxTankType: "none", extraCansGal: 0 },
  electrical: {
    dualBattery: false,
    dualBatteryWeightLbs: 0,
    alternatorAmps: 0,
    onboardAir: false,
    onboardAirWeightLbs: 0,
    fridgeWatts: 0,
    lightBarWatts: 0,
    radioType: "none",
    radioWeightLbs: 0,
  },
  trailer: {
    hasTrailer: false,
    trailerWeightLbs: 0,
    tongueWeightLbs: 0,
    trailerType: "none",
  },
  drivetrainMods: {
    regeared: false,
    newRatio: 3.73,
    stockRatio: 3.73,
    frontLocker: false,
    rearLocker: false,
    lockerType: "none",
  },
  recovery: {
    kinetic: false,
    straps: false,
    shackles: false,
    treeProtector: false,
    snatchBlock: false,
    highlift: false,
    tractionBoards: false,
    tirePlug: false,
    compressor: false,
    spareTire: false,
    spareTireFullSize: false,
    shovel: false,
  },
  bedSlide: {
    installed: false,
    type: "fridge-slide",
    material: "aluminum",
    weightLbs: 0,
    loadCapacityLbs: 0,
    cargoWeightLbs: 0,
  },
  waterFording: {
    snorkel: false,
    stockWadingDepthIn: 24,
    modifiedWadingDepthIn: 24,
    diffBreathers: false,
  },

  otherModsWeightLbs: 0,
  otherModsNotes: "",
  testedMpg: null,
  odometerMiles: 5000,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// ─── Stock vehicle (no mods) ─────────────────────────────────────────

describe("computeVehicle — stock, no mods", () => {
  const result = computeVehicle(stockSierra);

  it("reports zero mod weight on a stock rig", () => {
    expect(result.totalModWeightLbs).toBe(0);
  });

  it("loaded weight equals curb weight on a stock rig", () => {
    expect(result.totalLoadedWeightLbs).toBe(stockSierra.curbWeightLbs);
  });

  it("remaining payload is GVWR minus curb weight", () => {
    expect(result.remainingPayloadLbs).toBe(
      stockSierra.gvwrLbs - stockSierra.curbWeightLbs,
    );
  });

  it("is not overloaded", () => {
    expect(result.overloaded).toBe(false);
  });

  it("estimated MPG equals stock combined when no penalties", () => {
    expect(result.estimatedMpg).toBe(stockSierra.mpgCombined);
  });

  it("MPG penalty is 0% on stock rig", () => {
    expect(result.mpgPenaltyPct).toBe(0);
  });

  it("total fuel equals stock tank on stock rig", () => {
    expect(result.totalFuelGal).toBe(stockSierra.fuelTankGal);
  });

  it("ground clearance unchanged without lift or bigger tires", () => {
    expect(result.modifiedGroundClearanceIn).toBe(stockSierra.groundClearanceIn);
  });

  it("recovery score is 0 with no recovery gear", () => {
    expect(result.recoveryScore).toBe(0);
  });
});

// ─── Modified vehicle: 3" lift + 35" AT tires + RTT ─────────────────

const builtSierra: VehicleProfile = {
  ...stockSierra,
  lift: { inches: 3, type: "coilover" },
  tires: {
    size: "285/75R17",
    diameter: 35,
    type: "all-terrain",
    pressurePsi: 35,
    recommendedPsi: 35,
    ageMonths: 3,
  },
  roof: {
    rack: true,
    rackWeightLbs: 85,
    cargoWeightLbs: 0,
    rtt: true,
    rttWeightLbs: 155,
    awning: false,
    awningWeightLbs: 0,
  },
  winch: { installed: true, pullRatingLbs: 12000, weightLbs: 85, type: "electric" },
  recovery: {
    ...stockSierra.recovery,
    kinetic: true,
    tractionBoards: true,
    straps: true,
    shackles: true,
    spareTire: true,
    spareTireFullSize: true,
    compressor: true,
    tirePlug: true,
    snatchBlock: true,
  },
};

describe("computeVehicle — 3\" lift + 35\" AT + RTT + winch", () => {
  const result = computeVehicle(builtSierra);

  it("total mod weight includes rack + RTT + winch", () => {
    // rack: 85, RTT: 155, winch: 85 = 325
    expect(result.totalModWeightLbs).toBe(325);
  });

  it("MPG is lower than stock due to mods", () => {
    expect(result.estimatedMpg).toBeLessThan(stockSierra.mpgCombined);
  });

  it("MPG penalty is non-zero", () => {
    expect(result.mpgPenaltyPct).toBeGreaterThan(0);
  });

  it("ground clearance increases with 3\" lift + bigger tires", () => {
    expect(result.modifiedGroundClearanceIn).toBeGreaterThan(stockSierra.groundClearanceIn);
  });

  it("approach angle improves with more clearance", () => {
    expect(result.modifiedApproachAngle).toBeGreaterThan(stockSierra.approachAngle);
  });

  it("recovery score is non-zero with gear installed", () => {
    expect(result.recoveryScore).toBeGreaterThan(0);
  });

  it("winch earns 20 recovery points", () => {
    // Winch alone = 20pts
    expect(result.recoveryScore).toBeGreaterThanOrEqual(20);
  });

  it("does not exceed GVWR (not overloaded)", () => {
    expect(result.overloaded).toBe(false);
  });

  it("MPG breakdown includes at least one penalty item", () => {
    expect(result.mpgBreakdown.length).toBeGreaterThan(0);
  });
});

// ─── Overloaded vehicle ──────────────────────────────────────────────

describe("computeVehicle — overloaded", () => {
  const overloaded: VehicleProfile = {
    ...stockSierra,
    // Push loaded weight over GVWR by adding a huge other-mods weight
    otherModsWeightLbs: stockSierra.gvwrLbs - stockSierra.curbWeightLbs + 500,
  };

  it("flags overloaded when loaded weight exceeds GVWR", () => {
    const result = computeVehicle(overloaded);
    expect(result.overloaded).toBe(true);
  });
});

// ─── Tested MPG override ─────────────────────────────────────────────

describe("computeVehicle — testedMpg override", () => {
  it("uses real-world tested MPG when provided, ignoring penalty chain", () => {
    const withTestedMpg = { ...stockSierra, testedMpg: 17.5 };
    const result = computeVehicle(withTestedMpg);
    expect(result.estimatedMpg).toBe(17.5);
  });
});
