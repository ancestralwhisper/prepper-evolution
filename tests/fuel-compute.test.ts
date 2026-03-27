import { describe, it, expect } from "vitest";
import {
  speedEfficiency,
  temperaturePenalty,
  auxFuelMpgPenalty,
  calculateRigPenalty,
  formatTime,
  fuelPct,
  JERRY_CAN_WEIGHT_LBS,
  JERRY_CAN_GAL,
  MPG_PENALTY_PER_100LBS,
} from "../client/src/pages/tools/fuel-compute";
import type { RigConditions } from "../client/src/pages/tools/fuel-types";

// ─── speedEfficiency ─────────────────────────────────────────────────

describe("speedEfficiency", () => {
  it("returns 1.0 at 0 mph (idle/no movement)", () => {
    expect(speedEfficiency(0)).toBe(1.0);
  });

  it("returns 1.0 at optimal highway speed (55 mph)", () => {
    expect(speedEfficiency(55)).toBe(1.0);
  });

  it("returns reduced efficiency at low off-road speeds", () => {
    expect(speedEfficiency(5)).toBe(0.40);
    expect(speedEfficiency(15)).toBe(0.55);
    expect(speedEfficiency(25)).toBe(0.72);
  });

  it("returns reduced efficiency above 55 mph (aero drag)", () => {
    expect(speedEfficiency(65)).toBe(0.95);
    expect(speedEfficiency(75)).toBe(0.88);
    expect(speedEfficiency(85)).toBe(0.80);
  });

  it("never returns more than 1.0", () => {
    for (const mph of [0, 10, 30, 45, 55, 65, 80, 100]) {
      expect(speedEfficiency(mph)).toBeLessThanOrEqual(1.0);
    }
  });
});

// ─── temperaturePenalty ──────────────────────────────────────────────

describe("temperaturePenalty", () => {
  it("returns 1.0 for null (unknown zone)", () => {
    expect(temperaturePenalty(null)).toBe(1.0);
  });

  it("returns 1.0 for temperate", () => {
    expect(temperaturePenalty("temperate")).toBe(1.0);
  });

  it("applies cold-weather penalty (10%)", () => {
    expect(temperaturePenalty("cold")).toBe(0.90);
  });

  it("applies hot-humid penalty (4%)", () => {
    expect(temperaturePenalty("hot-humid")).toBe(0.96);
  });

  it("applies hot-arid penalty (5%)", () => {
    expect(temperaturePenalty("hot-arid")).toBe(0.95);
  });

  it("returns 1.0 for unknown zone string", () => {
    expect(temperaturePenalty("unknown-zone")).toBe(1.0);
  });
});

// ─── auxFuelMpgPenalty ───────────────────────────────────────────────

describe("auxFuelMpgPenalty", () => {
  it("returns base MPG unchanged when no jerry cans", () => {
    expect(auxFuelMpgPenalty(0, 20)).toBe(20);
  });

  it("applies correct weight penalty for 2 jerry cans", () => {
    // 2 cans × 42 lbs = 84 lbs
    // penalty = (84 / 100) × 0.01 = 0.0084
    // result = 20 × (1 - 0.0084) = 19.832 → rounds to 19.8
    const result = auxFuelMpgPenalty(2, 20);
    expect(result).toBeCloseTo(19.8, 1);
  });

  it("applies correct weight penalty for 4 jerry cans at 15 mpg", () => {
    // 4 × 42 = 168 lbs → penalty = 0.0168 → 15 × 0.9832 = 14.748 → 14.7
    const result = auxFuelMpgPenalty(4, 15);
    expect(result).toBeCloseTo(14.7, 1);
  });

  it("uses the exported constants correctly", () => {
    expect(JERRY_CAN_WEIGHT_LBS).toBe(42);
    expect(JERRY_CAN_GAL).toBe(5);
    expect(MPG_PENALTY_PER_100LBS).toBe(0.01);
  });
});

// ─── calculateRigPenalty ─────────────────────────────────────────────

const stockConditions: RigConditions = {
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

describe("calculateRigPenalty", () => {
  it("returns multiplier of 1.0 for stock conditions (no penalties)", () => {
    const result = calculateRigPenalty(stockConditions);
    expect(result.multiplier).toBe(1.0);
    expect(result.breakdown).toHaveLength(0);
  });

  it("applies A/T tire penalty (8% loss)", () => {
    const conditions = { ...stockConditions, tireType: "all-terrain" as const };
    const result = calculateRigPenalty(conditions);
    expect(result.multiplier).toBeCloseTo(0.92, 2);
    expect(result.breakdown.some((b) => b.label.includes("A/T"))).toBe(true);
  });

  it("applies M/T tire penalty (15% loss)", () => {
    const conditions = { ...stockConditions, tireType: "mud-terrain" as const };
    const result = calculateRigPenalty(conditions);
    expect(result.multiplier).toBeCloseTo(0.85, 2);
  });

  it("applies 4WD Low penalty (30% loss)", () => {
    const conditions = { ...stockConditions, driveMode: "4l" as const };
    const result = calculateRigPenalty(conditions);
    expect(result.multiplier).toBeCloseTo(0.70, 2);
  });

  it("multiplies compounding penalties correctly (AT + 4H)", () => {
    const conditions = {
      ...stockConditions,
      tireType: "all-terrain" as const,
      driveMode: "4h" as const,
    };
    const result = calculateRigPenalty(conditions);
    // 0.92 × 0.95 = 0.874
    expect(result.multiplier).toBeCloseTo(0.874, 2);
  });

  it("includes RTT in breakdown when enabled", () => {
    const conditions = {
      ...stockConditions,
      aeroDrag: { ...stockConditions.aeroDrag, rtt: true },
    };
    const result = calculateRigPenalty(conditions);
    expect(result.breakdown.some((b) => b.label.includes("tent"))).toBe(true);
  });

  it("applies AC penalty (3% loss)", () => {
    const conditions = { ...stockConditions, acOn: true };
    const result = calculateRigPenalty(conditions);
    expect(result.multiplier).toBeCloseTo(0.97, 2);
  });
});

// ─── formatTime ──────────────────────────────────────────────────────

describe("formatTime", () => {
  it("returns minutes-only for sub-1-hour values", () => {
    expect(formatTime(0.5)).toBe("30min");
    expect(formatTime(0.25)).toBe("15min");
  });

  it("returns hours-only when no remaining minutes", () => {
    expect(formatTime(2)).toBe("2h");
    expect(formatTime(1)).toBe("1h");
  });

  it("returns hours and minutes for mixed values", () => {
    expect(formatTime(1.5)).toBe("1h 30min");
    expect(formatTime(2.75)).toBe("2h 45min");
  });

  it("handles zero", () => {
    expect(formatTime(0)).toBe("0min");
  });
});

// ─── fuelPct ─────────────────────────────────────────────────────────

describe("fuelPct", () => {
  it("returns 100 when full", () => {
    expect(fuelPct(30, 30)).toBe(100);
  });

  it("returns 0 when empty", () => {
    expect(fuelPct(0, 30)).toBe(0);
  });

  it("returns 50 at half tank", () => {
    expect(fuelPct(15, 30)).toBe(50);
  });

  it("clamps to 0 if remaining is negative", () => {
    expect(fuelPct(-5, 30)).toBe(0);
  });

  it("clamps to 100 if remaining exceeds total", () => {
    expect(fuelPct(35, 30)).toBe(100);
  });

  it("rounds to nearest integer", () => {
    // 10/30 = 33.333...
    expect(fuelPct(10, 30)).toBe(33);
  });
});
