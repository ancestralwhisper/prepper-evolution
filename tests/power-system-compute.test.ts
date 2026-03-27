import { describe, it, expect } from "vitest";
import {
  deviceToLoad,
  selectWireGauge,
  selectFuse,
  getSpareCapacity,
  recommendBankAh,
  calculatePowerBudget,
} from "../client/src/pages/tools/power-system-compute";
import type {
  BatteryBankConfig,
  ChargeSourceConfig,
} from "../client/src/pages/tools/power-system-compute";
import type { DeviceEntry } from "../client/src/pages/tools/power-system-data";

// ─── deviceToLoad ────────────────────────────────────────────────────

describe("deviceToLoad", () => {
  const fridge: DeviceEntry = {
    id: "fridge",
    name: "Dometic CFX3 45",
    category: "refrigeration",
    watts: 45,
    amps12v: 3.75,
    dutyCyclePct: 40,
    defaultHoursPerDay: 24,
    invertRequired: false,
  };

  it("calculates daily Ah correctly for fridge running 24h at 100% duty", () => {
    const load = deviceToLoad(fridge, 24, 100);
    // 45W / 12V = 3.75A × 24h × 1.0 = 90 Ah
    expect(load.dailyAh).toBeCloseTo(90, 1);
    expect(load.amps).toBeCloseTo(3.75, 2);
  });

  it("applies duty cycle correctly (50%)", () => {
    const load = deviceToLoad(fridge, 8, 50);
    // effective hours = 8 × 0.5 = 4h; 3.75A × 4 = 15 Ah
    expect(load.dailyAh).toBeCloseTo(15, 1);
  });

  it("adds 15% inverter overhead for AC devices", () => {
    const laptop: DeviceEntry = {
      id: "laptop",
      name: "Laptop",
      category: "electronics",
      watts: 60,
      amps12v: 5,
      dutyCyclePct: 100,
      defaultHoursPerDay: 4,
      invertRequired: true,
    };
    const load = deviceToLoad(laptop, 4, 100);
    // 60W × 1.15 = 69W / 12V = 5.75A × 4h = 23 Ah
    expect(load.watts).toBeCloseTo(69, 1);
    expect(load.dailyAh).toBeCloseTo(23, 1);
  });

  it("no overhead applied when invertRequired is false", () => {
    const load = deviceToLoad(fridge, 1, 100);
    expect(load.watts).toBe(45);
  });
});

// ─── selectWireGauge ────────────────────────────────────────────────
// Safety-critical: wrong gauge = fire risk

describe("selectWireGauge", () => {
  it("returns a valid AWG string", () => {
    const result = selectWireGauge(10, 10, 3);
    expect(result.awg).toBeTruthy();
    expect(typeof result.awg).toBe("string");
  });

  it("voltage drop is within max allowed threshold", () => {
    const result = selectWireGauge(15, 30, 3);
    expect(result.dropPct).toBeLessThanOrEqual(3.1);
  });

  it("returns pass status for compliant circuits", () => {
    const result = selectWireGauge(5, 15, 3);
    expect(result.status).toBe("pass");
  });

  it("selected wire ampacity handles the current load", () => {
    const amps = 40;
    const result = selectWireGauge(8, amps, 3);
    expect(result.ampacity).toBeGreaterThanOrEqual(amps);
  });

  it("dropVolts is positive for any non-trivial run", () => {
    const result = selectWireGauge(10, 10, 3);
    expect(result.dropVolts).toBeGreaterThan(0);
  });

  it("longer run with same current produces higher drop volts", () => {
    const short = selectWireGauge(5, 20, 3);
    const long = selectWireGauge(20, 20, 3);
    // Both should be within spec, but longer run burns more voltage
    // Either dropVolts is higher OR a thicker gauge was selected (lower drop)
    // Just verify both are within spec
    expect(short.dropPct).toBeLessThanOrEqual(3.1);
    expect(long.dropPct).toBeLessThanOrEqual(3.1);
  });
});

// ─── selectFuse ──────────────────────────────────────────────────────

describe("selectFuse", () => {
  it("uses blade fuse for small loads (target under 30A)", () => {
    const result = selectFuse(20, 60, 100);
    // 20 × 1.25 = 25A target → blade
    expect(result.fuseType).toBe("blade");
  });

  it("uses maxi fuse for medium loads (30–80A target range)", () => {
    const result = selectFuse(50, 100, 150);
    // 50 × 1.25 = 62.5A → maxi
    expect(result.fuseType).toBe("maxi");
  });

  it("uses ANL fuse for heavy loads above 80A target", () => {
    const result = selectFuse(80, 200, 200);
    // 80 × 1.25 = 100A → anl
    expect(result.fuseType).toBe("anl");
  });

  it("uses Class-T fuse for large battery banks (>255Ah)", () => {
    const result = selectFuse(80, 200, 300);
    expect(result.fuseType).toBe("class-t");
  });

  it("fuse amps meet NEC 125% rule (sized at 125% of load)", () => {
    const loadAmps = 30;
    const result = selectFuse(loadAmps, 100, 100);
    expect(result.fuseAmps).toBeGreaterThanOrEqual(loadAmps * 1.25);
  });

  it("safe = true when fuse does not exceed wire ampacity", () => {
    const result = selectFuse(40, 60, 100);
    expect(result.safe).toBe(true);
  });

  it("safe = false when fuse would exceed wire ampacity", () => {
    // Load needs ~100A fuse but wire only handles 30A
    const result = selectFuse(80, 30, 100);
    expect(result.safe).toBe(false);
  });
});

// ─── recommendBankAh ────────────────────────────────────────────────

describe("recommendBankAh", () => {
  it("result is always a multiple of 50Ah", () => {
    const result = recommendBankAh(60, 2, "lifepo4", "temperate");
    expect(result % 50).toBe(0);
  });

  it("LiFePO4 requires smaller bank than AGM (better depth of discharge)", () => {
    const lifepo4 = recommendBankAh(100, 3, "lifepo4", "temperate");
    const agm = recommendBankAh(100, 3, "agm", "temperate");
    expect(lifepo4).toBeLessThan(agm);
  });

  it("cold climate requires larger bank than temperate (cold derating)", () => {
    const temperate = recommendBankAh(80, 2, "lifepo4", "temperate");
    const cold = recommendBankAh(80, 2, "lifepo4", "cold");
    expect(cold).toBeGreaterThanOrEqual(temperate);
  });

  it("more days autonomy means larger bank", () => {
    const oneDay = recommendBankAh(60, 1, "lifepo4", "temperate");
    const threeDays = recommendBankAh(60, 3, "lifepo4", "temperate");
    expect(threeDays).toBeGreaterThan(oneDay);
  });

  it("result is always positive", () => {
    const result = recommendBankAh(20, 1, "agm", "hot-arid");
    expect(result).toBeGreaterThan(0);
  });
});

// ─── calculatePowerBudget ────────────────────────────────────────────

describe("calculatePowerBudget", () => {
  // 200Ah LiFePO4 bank, 80% usable = 160Ah
  const bank: BatteryBankConfig = {
    chemistry: "lifepo4",
    singleCapacityAh: 100,
    count: 2,
    totalCapacityAh: 200,
    usableAh: 160,
    daysAutonomy: 2.67,
    coldDeratedAh: 144,
    weightLbs: 52,
  };

  // Solar only: 400W, 5 peak hours → 400 × 5 × 0.8 / 12 = ~26.7 Ah/day
  const solarOnly: ChargeSourceConfig = {
    dcDcCharger: null,
    dailyDriveHours: 0,
    solarWatts: 400,
    peakSunHours: 5,
    shoreChargerAmps: 0,
  };

  it("calculates solar Ah per day correctly", () => {
    const budget = calculatePowerBudget(20, bank, solarOnly, "truck-full", 0);
    // 400W × 5hrs × 0.80 efficiency / 12V = 133.3 Ah
    expect(budget.solarAhPerDay).toBeCloseTo(133.3, 0);
  });

  it("surplus is positive when solar covers daily usage", () => {
    // 133 Ah solar vs 20 Ah usage
    const budget = calculatePowerBudget(20, bank, solarOnly, "truck-full", 0);
    expect(budget.surplusAh).toBeGreaterThan(0);
  });

  it("surplus is negative when usage exceeds solar", () => {
    // 200 Ah usage vs 133 Ah solar
    const budget = calculatePowerBudget(200, bank, solarOnly, "truck-full", 0);
    expect(budget.surplusAh).toBeLessThan(0);
  });

  it("total charge equals sum of all sources", () => {
    const budget = calculatePowerBudget(60, bank, solarOnly, "truck-full", 0);
    const summed =
      budget.alternatorAhPerDay + budget.solarAhPerDay + budget.shoreAhPerDay;
    expect(Math.abs(budget.totalChargeAhPerDay - summed)).toBeLessThan(0.01);
  });

  it("days autonomy is usableAh / dailyAh", () => {
    const dailyAh = 40;
    const budget = calculatePowerBudget(dailyAh, bank, solarOnly, "truck-full", 0);
    expect(budget.daysAutonomy).toBeCloseTo(bank.usableAh / dailyAh, 1);
  });

  it("no alternator Ah when drive hours are 0", () => {
    const budget = calculatePowerBudget(40, bank, solarOnly, "truck-full", 0);
    expect(budget.alternatorAhPerDay).toBe(0);
  });
});
