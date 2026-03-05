// ─── Power System Builder — Calculation Engine ─────────────────────
// Pure TypeScript, zero React. Every function is deterministic.
// Wire gauge, fuse sizing, power budget, and system warnings.

import {
  wireGaugeTable,
  fuseSizes,
  batterySpecs,
  coldDerating,
  alternatorLookup,
  productRecommendations,
  type WireGaugeEntry,
  type FuseType,
  type BatteryChemistry,
  type DeviceEntry,
  type DcDcCharger,
  type VehicleType,
} from "./power-system-data";
import type { ClimateZoneId } from "../data/zip-types";

// ─── Core Interfaces ───────────────────────────────────────────────

export interface SelectedLoad {
  deviceId: string;
  name: string;
  watts: number;
  amps: number;
  hoursPerDay: number;
  dutyCyclePct: number;
  dailyAh: number;
  category: string;
  invertRequired: boolean;
}

export interface BatteryBankConfig {
  chemistry: BatteryChemistry;
  singleCapacityAh: number;
  count: number;
  totalCapacityAh: number;
  usableAh: number;
  daysAutonomy: number;
  coldDeratedAh: number;
  weightLbs: number;
}

export interface ChargeSourceConfig {
  dcDcCharger: DcDcCharger | null;
  dailyDriveHours: number;
  solarWatts: number;
  peakSunHours: number;
  shoreChargerAmps: number;
}

export type CircuitStatus = "pass" | "warn" | "fail";

export interface WireCircuit {
  id: string;
  label: string;
  distanceFt: number;
  maxAmps: number;
  maxDropPct: number;
  recommendedAwg: string;
  actualDropVolts: number;
  actualDropPct: number;
  fuseAmps: number;
  fuseType: FuseType;
  status: CircuitStatus;
  note?: string;
}

export interface PowerBudget {
  totalDailyAh: number;
  alternatorAhPerDay: number;
  solarAhPerDay: number;
  shoreAhPerDay: number;
  totalChargeAhPerDay: number;
  surplusAh: number;
  daysAutonomy: number;
  daysAutonomyColdDerated: number;
  parkedDailyBalance: number;
  drivingDailyBalance: number;
}

export type WarningLevel = "critical" | "warning" | "info";

export interface SystemWarning {
  level: WarningLevel;
  message: string;
}

export interface SafetyCheckItem {
  id: string;
  text: string;
  critical: boolean;
}

export interface ShoppingListItem {
  category: string;
  name: string;
  spec: string;
  url?: string;
  asin?: string;
}

export interface PowerSystemResult {
  loads: SelectedLoad[];
  batteryBank: BatteryBankConfig;
  chargeSources: ChargeSourceConfig;
  circuits: WireCircuit[];
  budget: PowerBudget;
  recommendedBankAh: number;
  bankAssessment: string;
  warnings: SystemWarning[];
  safetyChecklist: SafetyCheckItem[];
  shoppingList: ShoppingListItem[];
}

// ─── Constants ─────────────────────────────────────────────────────

const SYSTEM_VOLTAGE = 12;
const INVERTER_OVERHEAD = 1.15;   // 15% loss
const SOLAR_EFFICIENCY = 0.80;    // 80% real-world yield

// ─── Device → Load Conversion ──────────────────────────────────────

export function deviceToLoad(
  device: DeviceEntry,
  hoursPerDay: number,
  dutyCyclePct: number,
): SelectedLoad {
  const effectiveWatts = device.invertRequired
    ? device.watts * INVERTER_OVERHEAD
    : device.watts;
  const amps = effectiveWatts / SYSTEM_VOLTAGE;
  const effectiveHours = hoursPerDay * (dutyCyclePct / 100);
  const dailyAh = amps * effectiveHours;

  return {
    deviceId: device.id,
    name: device.name,
    watts: effectiveWatts,
    amps,
    hoursPerDay,
    dutyCyclePct,
    dailyAh,
    category: device.category,
    invertRequired: device.invertRequired ?? false,
  };
}

// ─── Wire Gauge Selection (safety-critical) ────────────────────────

export function selectWireGauge(
  distanceFt: number,
  currentAmps: number,
  maxDropPct: number,
): { awg: string; dropVolts: number; dropPct: number; status: CircuitStatus; ampacity: number } {
  const maxDropVolts = (maxDropPct / 100) * SYSTEM_VOLTAGE;

  // Iterate from thinnest (16 AWG) to thickest (4/0)
  const sorted = [...wireGaugeTable].sort((a, b) => b.sortOrder - a.sortOrder);

  for (const gauge of sorted) {
    const dropVolts = (2 * distanceFt * currentAmps * gauge.ohmsPerKft) / 1000;
    const dropPct = (dropVolts / SYSTEM_VOLTAGE) * 100;

    if (dropVolts <= maxDropVolts && currentAmps <= gauge.ampacity) {
      return {
        awg: gauge.awg,
        dropVolts: Math.round(dropVolts * 1000) / 1000,
        dropPct: Math.round(dropPct * 100) / 100,
        status: dropPct <= 3 ? "pass" : "warn",
        ampacity: gauge.ampacity,
      };
    }
  }

  // Nothing fits — return 4/0 with FAIL
  const thickest = wireGaugeTable[0]; // 4/0
  const dropVolts = (2 * distanceFt * currentAmps * thickest.ohmsPerKft) / 1000;
  const dropPct = (dropVolts / SYSTEM_VOLTAGE) * 100;

  return {
    awg: thickest.awg,
    dropVolts: Math.round(dropVolts * 1000) / 1000,
    dropPct: Math.round(dropPct * 100) / 100,
    status: "fail",
    ampacity: thickest.ampacity,
  };
}

// ─── Fuse Sizing (safety-critical) ─────────────────────────────────

export function selectFuse(
  loadAmps: number,
  wireAmpacity: number,
  totalBankAh: number,
): { fuseAmps: number; fuseType: FuseType; safe: boolean } {
  const target = loadAmps * 1.25;

  // Determine fuse type
  let fuseType: FuseType;
  if (totalBankAh > 255) {
    fuseType = "class-t";
  } else if (target <= 30) {
    fuseType = "blade";
  } else if (target <= 80) {
    fuseType = "maxi";
  } else {
    fuseType = "anl";
  }

  // Find next standard size up
  const sizes = fuseSizes[fuseType];
  let fuseAmps = sizes[sizes.length - 1]; // fallback to largest
  for (const size of sizes) {
    if (size >= target) {
      fuseAmps = size;
      break;
    }
  }

  // Safety check: fuse must not exceed wire ampacity
  const safe = fuseAmps <= wireAmpacity;

  return { fuseAmps, fuseType, safe };
}

// ─── Alternator Spare Capacity ─────────────────────────────────────

export function getSpareCapacity(
  vehicleType: VehicleType,
  alternatorAmps: number,
): number {
  const lookup = alternatorLookup.find((a) => a.type === vehicleType);
  if (!lookup) return 20; // conservative default

  // If user entered specific alternator amps, estimate spare as proportion
  const stockMid = (lookup.stockRangeMin + lookup.stockRangeMax) / 2;
  const spareMid = (lookup.spareMin + lookup.spareMax) / 2;

  if (alternatorAmps > 0) {
    const ratio = spareMid / stockMid;
    return Math.round(alternatorAmps * ratio);
  }

  return spareMid;
}

// ─── Battery Bank Recommendation ───────────────────────────────────

export function recommendBankAh(
  dailyAh: number,
  daysAutonomy: number,
  chemistry: BatteryChemistry,
  climateZone: ClimateZoneId,
): number {
  const spec = batterySpecs[chemistry];
  const derating = coldDerating[climateZone];
  const required = (dailyAh * daysAutonomy) / (spec.dod * derating);
  // Round up to nearest 50Ah
  return Math.ceil(required / 50) * 50;
}

// ─── Power Budget Calculator ───────────────────────────────────────

export function calculatePowerBudget(
  totalDailyAh: number,
  bank: BatteryBankConfig,
  charge: ChargeSourceConfig,
  vehicleType: VehicleType,
  alternatorAmps: number,
): PowerBudget {
  const spareCapacity = getSpareCapacity(vehicleType, alternatorAmps);
  const effectiveDcAmps = charge.dcDcCharger
    ? Math.min(charge.dcDcCharger.dcAmps, spareCapacity)
    : 0;

  const alternatorAhPerDay = effectiveDcAmps * charge.dailyDriveHours;
  const solarAhPerDay =
    charge.solarWatts > 0 && charge.peakSunHours > 0
      ? (charge.solarWatts * charge.peakSunHours * SOLAR_EFFICIENCY) / SYSTEM_VOLTAGE
      : 0;
  const shoreAhPerDay = charge.shoreChargerAmps > 0 ? charge.shoreChargerAmps * 8 : 0; // assume 8hr shore

  const totalChargeAhPerDay = alternatorAhPerDay + solarAhPerDay + shoreAhPerDay;
  const surplusAh = totalChargeAhPerDay - totalDailyAh;

  const daysAutonomy = totalDailyAh > 0 ? bank.usableAh / totalDailyAh : 0;
  const daysAutonomyColdDerated = totalDailyAh > 0 ? bank.coldDeratedAh / totalDailyAh : 0;

  const parkedDailyBalance = solarAhPerDay + shoreAhPerDay - totalDailyAh;
  const drivingDailyBalance = totalChargeAhPerDay - totalDailyAh;

  return {
    totalDailyAh: round2(totalDailyAh),
    alternatorAhPerDay: round2(alternatorAhPerDay),
    solarAhPerDay: round2(solarAhPerDay),
    shoreAhPerDay: round2(shoreAhPerDay),
    totalChargeAhPerDay: round2(totalChargeAhPerDay),
    surplusAh: round2(surplusAh),
    daysAutonomy: round2(daysAutonomy),
    daysAutonomyColdDerated: round2(daysAutonomyColdDerated),
    parkedDailyBalance: round2(parkedDailyBalance),
    drivingDailyBalance: round2(drivingDailyBalance),
  };
}

// ─── Circuit Generator ─────────────────────────────────────────────

export interface CircuitInput {
  id: string;
  label: string;
  distanceFt: number;
  maxAmps: number;
  maxDropPct: number;   // 3 for charging, 5 for lighting
}

export function generateCircuit(
  input: CircuitInput,
  totalBankAh: number,
): WireCircuit {
  if (input.distanceFt <= 0 || input.maxAmps <= 0) {
    return {
      ...input,
      recommendedAwg: "—",
      actualDropVolts: 0,
      actualDropPct: 0,
      fuseAmps: 0,
      fuseType: "blade",
      status: "pass",
    };
  }

  const wire = selectWireGauge(input.distanceFt, input.maxAmps, input.maxDropPct);
  const fuse = selectFuse(input.maxAmps, wire.ampacity, totalBankAh);

  let status: CircuitStatus = wire.status;
  let note: string | undefined;

  if (!fuse.safe) {
    status = "fail";
    note = `Fuse (${fuse.fuseAmps}A) exceeds wire ampacity (${wire.ampacity}A) — upsize wire`;
  }

  return {
    id: input.id,
    label: input.label,
    distanceFt: input.distanceFt,
    maxAmps: input.maxAmps,
    maxDropPct: input.maxDropPct,
    recommendedAwg: wire.awg,
    actualDropVolts: wire.dropVolts,
    actualDropPct: wire.dropPct,
    fuseAmps: fuse.fuseAmps,
    fuseType: fuse.fuseType,
    status,
    note,
  };
}

// ─── Default Circuits from Config ──────────────────────────────────

export function buildDefaultCircuits(
  loads: SelectedLoad[],
  charge: ChargeSourceConfig,
  dcDcAmps: number,
): CircuitInput[] {
  const circuits: CircuitInput[] = [];

  // 1. Starter battery → DC-DC charger
  if (dcDcAmps > 0) {
    circuits.push({
      id: "starter-to-dcdc",
      label: "Starter Battery → DC-DC Charger",
      distanceFt: 6,
      maxAmps: dcDcAmps,
      maxDropPct: 3,
    });
  }

  // 2. DC-DC → Aux bank
  if (dcDcAmps > 0) {
    circuits.push({
      id: "dcdc-to-aux",
      label: "DC-DC Charger → Aux Battery Bank",
      distanceFt: 3,
      maxAmps: dcDcAmps,
      maxDropPct: 3,
    });
  }

  // 3. Solar → Controller (if solar configured)
  if (charge.solarWatts > 0) {
    const solarAmps = charge.solarWatts / SYSTEM_VOLTAGE;
    circuits.push({
      id: "solar-to-controller",
      label: "Solar Panel(s) → Charge Controller",
      distanceFt: 15,
      maxAmps: Math.ceil(solarAmps * 1.25), // NEC 690.8 — 125% of Isc
      maxDropPct: 3,
    });
  }

  // 4. Aux → Fuse panel (main feed)
  const totalLoadAmps = loads.reduce((sum, l) => sum + l.amps, 0);
  if (totalLoadAmps > 0) {
    circuits.push({
      id: "aux-to-panel",
      label: "Aux Battery Bank → Fuse Panel",
      distanceFt: 3,
      maxAmps: Math.ceil(totalLoadAmps),
      maxDropPct: 3,
    });
  }

  // 5-N. Branch circuits from loads (group by category)
  const categoryMap = new Map<string, { totalAmps: number; names: string[] }>();
  for (const load of loads) {
    const existing = categoryMap.get(load.category);
    if (existing) {
      existing.totalAmps += load.amps;
      existing.names.push(load.name);
    } else {
      categoryMap.set(load.category, { totalAmps: load.amps, names: [load.name] });
    }
  }

  let branchIdx = 0;
  for (const [category, data] of categoryMap) {
    branchIdx++;
    const label = data.names.length <= 2
      ? data.names.join(" + ")
      : `${category} (${data.names.length} devices)`;
    circuits.push({
      id: `branch-${branchIdx}`,
      label: `Branch: ${label}`,
      distanceFt: 8, // default, user can adjust
      maxAmps: Math.ceil(data.totalAmps),
      maxDropPct: 5, // branch circuits allow 5%
    });
  }

  return circuits;
}

// ─── Warning Generator ─────────────────────────────────────────────

export function generateWarnings(
  bank: BatteryBankConfig,
  budget: PowerBudget,
  circuits: WireCircuit[],
  climateZone: ClimateZoneId,
  smartAlternator: boolean,
): SystemWarning[] {
  const warnings: SystemWarning[] = [];

  // LiFePO4 + cold climate
  if (bank.chemistry === "lifepo4" && climateZone === "cold") {
    warnings.push({
      level: "critical",
      message:
        "LiFePO4 batteries CANNOT be charged below 32F / 0C. Charging below freezing causes permanent lithium plating damage. Use a battery with built-in heating or keep in insulated, heated enclosure.",
    });
  }

  // Bank >255Ah → Class-T fuse required
  if (bank.totalCapacityAh > 255) {
    warnings.push({
      level: "warning",
      message:
        `Battery bank is ${bank.totalCapacityAh}Ah (>255Ah). ABYC E-11 requires Class-T fuses (5,000A AIC rating) on the main battery positive. Standard ANL fuses are not rated for this fault current.`,
    });
  }

  // Daily deficit
  if (budget.surplusAh < 0) {
    const daysToEmpty = budget.totalDailyAh > 0
      ? (bank.usableAh / Math.abs(budget.surplusAh)).toFixed(1)
      : "unknown";
    warnings.push({
      level: "warning",
      message:
        `Daily deficit of ${Math.abs(budget.surplusAh).toFixed(1)} Ah. At this rate, your bank will drain from full to empty in ~${daysToEmpty} days without additional charging.`,
    });
  }

  // Parked deficit (no driving)
  if (budget.parkedDailyBalance < 0 && budget.drivingDailyBalance >= 0) {
    warnings.push({
      level: "info",
      message:
        `When parked (solar only), you have a daily deficit of ${Math.abs(budget.parkedDailyBalance).toFixed(1)} Ah. Make sure to drive regularly or add more solar to maintain bank charge.`,
    });
  }

  // Any circuit with >5% drop
  const failCircuits = circuits.filter((c) => c.actualDropPct > 5);
  for (const c of failCircuits) {
    warnings.push({
      level: "critical",
      message:
        `Circuit "${c.label}" has ${c.actualDropPct.toFixed(1)}% voltage drop — exceeds 5% maximum. Upsize wire gauge or shorten run distance.`,
    });
  }

  // Any circuit where fuse > wire ampacity
  const fuseFails = circuits.filter((c) => c.status === "fail" && c.note);
  for (const c of fuseFails) {
    warnings.push({
      level: "critical",
      message: c.note!,
    });
  }

  // Smart alternator compatibility
  if (smartAlternator) {
    warnings.push({
      level: "info",
      message:
        "Smart (ECU-controlled) alternator detected. A DC-DC charger with smart alternator compatibility is required. Direct battery-to-battery charging will not work and may trigger check-engine codes.",
    });
  }

  return warnings;
}

// ─── Safety Checklist (always displayed) ───────────────────────────

export const safetyChecklist: SafetyCheckItem[] = [
  { id: "fuse-18in",         text: "Fuse within 18\" of EACH battery positive terminal", critical: true },
  { id: "crimp-no-solder",   text: "Crimp all connections — do NOT solder (wicks under vibration, ABYC E-11)", critical: true },
  { id: "star-ground",       text: "Star grounding — all negatives to single ground bus bolted to chassis", critical: true },
  { id: "disconnect-switch",  text: "Manual battery disconnect switch on aux bank", critical: true },
  { id: "battery-secure",    text: "Secure battery against movement ALL directions (20G forward, 15G side, 10G vertical)", critical: true },
  { id: "wire-routing",      text: "Route wire in split loom/conduit, secure every 18\", grommets through metal", critical: false },
  { id: "class-t",           text: "Banks >255Ah require Class-T fuses (5,000A AIC per ABYC E-11)", critical: false },
  { id: "lifepo4-cold",      text: "LiFePO4: DO NOT charge below 32F / 0C — causes permanent lithium plating", critical: true },
  { id: "bms-rate",          text: "Verify BMS max charge rate matches DC-DC + solar combined output", critical: false },
  { id: "test-circuits",     text: "Test all circuits with multimeter before connecting battery bank", critical: false },
];

// ─── Full System Computation ───────────────────────────────────────

export function computeFullSystem(params: {
  loads: SelectedLoad[];
  chemistry: BatteryChemistry;
  singleCapacityAh: number;
  batteryCount: number;
  daysAutonomyTarget: number;
  climateZone: ClimateZoneId;
  chargeSources: ChargeSourceConfig;
  vehicleType: VehicleType;
  alternatorAmps: number;
  smartAlternator: boolean;
  circuitDistances: Record<string, number>;
}): PowerSystemResult {
  const {
    loads, chemistry, singleCapacityAh, batteryCount, daysAutonomyTarget,
    climateZone, chargeSources, vehicleType, alternatorAmps, smartAlternator,
    circuitDistances,
  } = params;

  const totalDailyAh = loads.reduce((sum, l) => sum + l.dailyAh, 0);
  const spec = batterySpecs[chemistry];

  // Battery bank
  const totalCapacityAh = singleCapacityAh * batteryCount;
  const usableAh = totalCapacityAh * spec.dod;
  const derating = coldDerating[climateZone];
  const coldDeratedAh = usableAh * derating;
  const weightLbs = totalCapacityAh * spec.lbsPerAh;

  const bank: BatteryBankConfig = {
    chemistry,
    singleCapacityAh,
    count: batteryCount,
    totalCapacityAh,
    usableAh: round2(usableAh),
    daysAutonomy: totalDailyAh > 0 ? round2(usableAh / totalDailyAh) : 0,
    coldDeratedAh: round2(coldDeratedAh),
    weightLbs: round2(weightLbs),
  };

  // Power budget
  const budget = calculatePowerBudget(
    totalDailyAh, bank, chargeSources, vehicleType, alternatorAmps,
  );

  // Recommended bank
  const recommendedBankAh = recommendBankAh(
    totalDailyAh, daysAutonomyTarget, chemistry, climateZone,
  );

  let bankAssessment: string;
  if (totalCapacityAh >= recommendedBankAh * 1.1) {
    bankAssessment = "Oversized — extra margin for extended off-grid stays";
  } else if (totalCapacityAh >= recommendedBankAh) {
    bankAssessment = "Good — meets your autonomy target";
  } else if (totalCapacityAh >= recommendedBankAh * 0.8) {
    bankAssessment = "Slightly undersized — may fall short on extended trips";
  } else {
    bankAssessment = "Undersized — increase capacity or reduce loads";
  }

  // Generate circuits
  const dcDcAmps = chargeSources.dcDcCharger?.dcAmps ?? 0;
  const defaultCircuits = buildDefaultCircuits(loads, chargeSources, dcDcAmps);

  // Apply user-specified distances
  const circuits = defaultCircuits.map((input) => {
    const userDist = circuitDistances[input.id];
    if (userDist !== undefined && userDist > 0) {
      input.distanceFt = userDist;
    }
    return generateCircuit(input, totalCapacityAh);
  });

  // Warnings
  const warnings = generateWarnings(bank, budget, circuits, climateZone, smartAlternator);

  // Shopping list (context-aware, with affiliate links)
  const shoppingList: ShoppingListItem[] = [];

  // Helper: find product from database by partial name match
  const findProduct = (search: string) =>
    productRecommendations.find((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  // Battery recommendation
  if (chemistry === "lifepo4") {
    if (singleCapacityAh <= 100) {
      const p = findProduct("Battle Born 100Ah");
      shoppingList.push({ category: "Battery", name: p?.name ?? "Battle Born 100Ah LiFePO4", spec: p?.spec ?? "100Ah, 12V, 31 lbs", url: p?.url, asin: p?.asin });
    } else {
      const p1 = findProduct("LiTime 200Ah");
      const p2 = findProduct("SOK 206Ah");
      shoppingList.push({ category: "Battery", name: p1?.name ?? "LiTime 200Ah LiFePO4", spec: p1?.spec ?? "200Ah, 12V, 52 lbs", url: p1?.url, asin: p1?.asin });
      shoppingList.push({ category: "Battery", name: p2?.name ?? "SOK 206Ah LiFePO4", spec: p2?.spec ?? "206Ah, 12V, 47 lbs", url: p2?.url, asin: p2?.asin });
    }
  }

  // DC-DC charger
  if (chargeSources.dcDcCharger) {
    const chargerName = `${chargeSources.dcDcCharger.brand} ${chargeSources.dcDcCharger.model}`;
    const p = findProduct(chargeSources.dcDcCharger.model);
    shoppingList.push({
      category: "DC-DC Charger",
      name: p?.name ?? chargerName,
      spec: p?.spec ?? `${chargeSources.dcDcCharger.dcAmps}A DC`,
      url: p?.url,
      asin: p?.asin,
    });
  }

  // Solar panels
  if (chargeSources.solarWatts > 0) {
    if (chargeSources.solarWatts <= 100) {
      const p = findProduct("Renogy 100W");
      shoppingList.push({ category: "Solar", name: p?.name ?? "Renogy 100W Mono Panel", spec: p?.spec ?? "100W rigid", url: p?.url, asin: p?.asin });
    } else if (chargeSources.solarWatts <= 200) {
      const p = findProduct("Renogy 200W Mono");
      shoppingList.push({ category: "Solar", name: p?.name ?? "Renogy 200W Mono Panel", spec: p?.spec ?? "200W rigid", url: p?.url, asin: p?.asin });
    } else {
      const panelCount = Math.ceil(chargeSources.solarWatts / 200);
      const p = findProduct("Renogy 200W Mono");
      shoppingList.push({ category: "Solar", name: `${panelCount}x ${p?.name ?? "Renogy 200W Mono Panel"}`, spec: `${panelCount * 200}W total`, url: p?.url, asin: p?.asin });
    }
    // Also suggest flexible option
    const pFlex = findProduct("BougeRV 200W");
    if (pFlex) {
      shoppingList.push({ category: "Solar", name: pFlex.name, spec: pFlex.spec, url: pFlex.url, asin: pFlex.asin });
    }
  }

  // Fuse box
  const pFuseBlock = findProduct("Blue Sea ST Blade");
  shoppingList.push({ category: "Distribution", name: pFuseBlock?.name ?? "Blue Sea ST Blade Fuse Block", spec: pFuseBlock?.spec ?? "12-circuit", url: pFuseBlock?.url, asin: pFuseBlock?.asin });

  // Main fuse
  if (totalCapacityAh > 255) {
    shoppingList.push({ category: "Protection", name: "Class-T Fuse + Holder", spec: "ABYC E-11 required for banks >255Ah" });
  } else {
    const pMrbf = findProduct("Blue Sea MRBF");
    shoppingList.push({ category: "Protection", name: pMrbf?.name ?? "Blue Sea MRBF Terminal Fuse", spec: pMrbf?.spec ?? "Battery terminal mount", url: pMrbf?.url, asin: pMrbf?.asin });
  }

  // Disconnect switch
  const pSwitch = findProduct("Blue Sea ML-RBS");
  shoppingList.push({ category: "Safety", name: pSwitch?.name ?? "Blue Sea ML-RBS Remote Battery Switch", spec: pSwitch?.spec ?? "500A continuous", url: pSwitch?.url, asin: pSwitch?.asin });

  // Wire — recommend based on thickest circuit
  const thickestAwg = circuits.reduce((thickest, c) => {
    const entry = wireGaugeTable.find((w) => w.awg === c.recommendedAwg);
    const thickEntry = wireGaugeTable.find((w) => w.awg === thickest);
    if (!entry || !thickEntry) return thickest;
    return entry.sortOrder < thickEntry.sortOrder ? c.recommendedAwg : thickest;
  }, "10");

  // Match to available cable kits (2 or 4 AWG)
  const thickestOrder = wireGaugeTable.find((w) => w.awg === thickestAwg)?.sortOrder ?? 8;
  if (thickestOrder <= 4) { // 2 AWG or thicker
    const p = findProduct("WindyNation 2 AWG");
    shoppingList.push({ category: "Wire & Cable", name: p?.name ?? "WindyNation 2 AWG Cable Kit", spec: p?.spec ?? "2 AWG, red + black", url: p?.url, asin: p?.asin });
  } else {
    const p = findProduct("WindyNation 4 AWG");
    shoppingList.push({ category: "Wire & Cable", name: p?.name ?? "WindyNation 4 AWG Cable Kit", spec: p?.spec ?? "4 AWG, red + black", url: p?.url, asin: p?.asin });
  }

  // Bus bar + lugs
  const pBus = findProduct("Blue Sea DualBus");
  shoppingList.push({ category: "Distribution", name: pBus?.name ?? "Blue Sea DualBus Plus 150A", spec: pBus?.spec ?? "Dual bus bar, 150A", url: pBus?.url, asin: pBus?.asin });
  const pLugs = findProduct("WindyNation 4 AWG Copper");
  shoppingList.push({ category: "Termination", name: pLugs?.name ?? "WindyNation Copper Lugs", spec: pLugs?.spec ?? "Tinned copper, heat shrink", url: pLugs?.url, asin: pLugs?.asin });

  return {
    loads,
    batteryBank: bank,
    chargeSources,
    circuits,
    budget,
    recommendedBankAh,
    bankAssessment,
    warnings,
    safetyChecklist,
    shoppingList,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function peakAmps(loads: SelectedLoad[]): number {
  return round2(loads.reduce((sum, l) => sum + l.amps, 0));
}

export function totalDailyAh(loads: SelectedLoad[]): number {
  return round2(loads.reduce((sum, l) => sum + l.dailyAh, 0));
}
