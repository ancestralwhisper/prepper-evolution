// ─── Power System Builder — Static Reference Data ──────────────────
// Wire gauge tables, fuse sizes, device database, battery specs,
// DC-DC chargers, alternator lookup, and product recommendations.
// No React, no calculations — data only.

// ─── Wire Gauge Table (AWG, copper, 75C insulation) ────────────────

export interface WireGaugeEntry {
  awg: string;
  ohmsPerKft: number;   // ohms per 1,000 ft
  ampacity: number;     // chassis-rated ampacity at 75C
  sortOrder: number;    // smaller number = thicker wire
}

export const wireGaugeTable: WireGaugeEntry[] = [
  { awg: "4/0", ohmsPerKft: 0.049, ampacity: 380, sortOrder: 0 },
  { awg: "2/0", ohmsPerKft: 0.078, ampacity: 283, sortOrder: 1 },
  { awg: "1/0", ohmsPerKft: 0.098, ampacity: 245, sortOrder: 2 },
  { awg: "1",   ohmsPerKft: 0.124, ampacity: 211, sortOrder: 3 },
  { awg: "2",   ohmsPerKft: 0.156, ampacity: 181, sortOrder: 4 },
  { awg: "4",   ohmsPerKft: 0.249, ampacity: 135, sortOrder: 5 },
  { awg: "6",   ohmsPerKft: 0.395, ampacity: 101, sortOrder: 6 },
  { awg: "8",   ohmsPerKft: 0.628, ampacity: 73,  sortOrder: 7 },
  { awg: "10",  ohmsPerKft: 0.999, ampacity: 55,  sortOrder: 8 },
  { awg: "12",  ohmsPerKft: 1.588, ampacity: 41,  sortOrder: 9 },
  { awg: "14",  ohmsPerKft: 2.525, ampacity: 32,  sortOrder: 10 },
  { awg: "16",  ohmsPerKft: 4.016, ampacity: 22,  sortOrder: 11 },
];

// ─── Standard Fuse Sizes ───────────────────────────────────────────

export type FuseType = "blade" | "maxi" | "anl" | "class-t";

export const fuseSizes: Record<FuseType, number[]> = {
  blade:    [1, 2, 3, 5, 7.5, 10, 15, 20, 25, 30],
  maxi:     [20, 25, 30, 35, 40, 50, 60, 70, 80],
  anl:      [30, 40, 50, 60, 80, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400],
  "class-t": [110, 200, 225, 250, 300, 350, 400, 450, 500, 600],
};

export const fuseTypeLabels: Record<FuseType, string> = {
  blade: "Blade",
  maxi: "MAXI",
  anl: "ANL",
  "class-t": "Class-T",
};

// ─── Device Database ───────────────────────────────────────────────

export type DeviceCategory =
  | "refrigeration"
  | "lighting"
  | "communication"
  | "medical"
  | "electronics"
  | "climate"
  | "recovery"
  | "cooking";

export interface DeviceEntry {
  id: string;
  name: string;
  watts: number;
  amps12v: number;
  dutyCyclePct: number;
  defaultHoursPerDay: number;
  category: DeviceCategory;
  note?: string;
  invertRequired?: boolean;
}

export const deviceCategoryLabels: Record<DeviceCategory, string> = {
  refrigeration: "Refrigeration",
  lighting: "Lighting",
  communication: "Communication & Charging",
  medical: "Medical",
  electronics: "Electronics",
  climate: "Climate Control",
  recovery: "Recovery & Water",
  cooking: "Cooking",
};

export const deviceCategoryColors: Record<DeviceCategory, string> = {
  refrigeration: "#3B82F6",
  lighting: "#EAB308",
  communication: "#8B5CF6",
  medical: "#EF4444",
  electronics: "#6366F1",
  climate: "#06B6D4",
  recovery: "#F97316",
  cooking: "#10B981",
};

export const deviceCategoryNotes: Partial<Record<DeviceCategory, string>> = {
  cooking: "Cooking typically runs on propane. Add a custom device if using a 12V appliance.",
};

export const deviceDatabase: DeviceEntry[] = [
  // ─── Refrigeration ───
  { id: "dometic-cfx3-55",  name: "Dometic CFX3 55 (55L)", watts: 45,  amps12v: 3.75, dutyCyclePct: 33, defaultHoursPerDay: 24, category: "refrigeration" },
  { id: "dometic-cfx3-75",  name: "Dometic CFX3 75DZ (75L)", watts: 55, amps12v: 4.58, dutyCyclePct: 40, defaultHoursPerDay: 24, category: "refrigeration" },
  { id: "dometic-cfx5-45",  name: "Dometic CFX5 45 (46L)", watts: 43,  amps12v: 3.58, dutyCyclePct: 33, defaultHoursPerDay: 24, category: "refrigeration" },
  { id: "dometic-cfx5-55im",name: "Dometic CFX5 55 IM (55L)", watts: 47, amps12v: 3.92, dutyCyclePct: 33, defaultHoursPerDay: 24, category: "refrigeration" },
  { id: "dometic-cfx5-75dz",name: "Dometic CFX5 75DZ (75L)", watts: 61, amps12v: 5.08, dutyCyclePct: 40, defaultHoursPerDay: 24, category: "refrigeration" },
  { id: "arb-63qt",         name: "ARB Classic II 63QT",   watts: 45,  amps12v: 3.75, dutyCyclePct: 35, defaultHoursPerDay: 24, category: "refrigeration" },

  // ─── Lighting ───
  { id: "led-interior",  name: "LED Interior Light",   watts: 10,  amps12v: 0.83, dutyCyclePct: 100, defaultHoursPerDay: 4, category: "lighting" },
  { id: "led-bar-50",    name: "LED Light Bar (50W)",   watts: 50,  amps12v: 4.17, dutyCyclePct: 100, defaultHoursPerDay: 2, category: "lighting" },
  { id: "led-bar-120",   name: "LED Light Bar (120W)",  watts: 120, amps12v: 10,   dutyCyclePct: 100, defaultHoursPerDay: 1, category: "lighting" },
  { id: "camp-strip",    name: "LED Camp Strip",        watts: 15,  amps12v: 1.25, dutyCyclePct: 100, defaultHoursPerDay: 3, category: "lighting" },

  // ─── Communication & Charging ───
  { id: "usb-single",    name: "USB Charger (Single)",    watts: 15,  amps12v: 1.25, dutyCyclePct: 100, defaultHoursPerDay: 2, category: "communication" },
  { id: "usb-dual-fast", name: "USB Dual Fast Charger",   watts: 45,  amps12v: 3.75, dutyCyclePct: 100, defaultHoursPerDay: 2, category: "communication" },
  { id: "ham-rx",        name: "Ham Radio (Receive)",      watts: 8,   amps12v: 0.67, dutyCyclePct: 100, defaultHoursPerDay: 8, category: "communication" },
  { id: "ham-tx",        name: "Ham Radio (Transmit)",     watts: 250, amps12v: 20.8, dutyCyclePct: 10,  defaultHoursPerDay: 2, category: "communication", note: "High peak draw during transmit" },
  { id: "starlink-mini", name: "Starlink Mini",            watts: 35,  amps12v: 2.92, dutyCyclePct: 100, defaultHoursPerDay: 6, category: "communication" },
  { id: "starlink-std",  name: "Starlink Standard",        watts: 85,  amps12v: 7.08, dutyCyclePct: 100, defaultHoursPerDay: 6, category: "communication" },
  { id: "cb-radio",      name: "CB Radio",                 watts: 5,   amps12v: 0.42, dutyCyclePct: 100, defaultHoursPerDay: 4, category: "communication" },

  // ─── Medical ───
  { id: "cpap-no-humid",  name: "CPAP (No Humidifier)",   watts: 45,  amps12v: 3.75, dutyCyclePct: 100, defaultHoursPerDay: 8, category: "medical" },
  { id: "cpap-humid",     name: "CPAP (w/ Humidifier)",   watts: 85,  amps12v: 7.08, dutyCyclePct: 100, defaultHoursPerDay: 8, category: "medical", invertRequired: true },
  { id: "nebulizer",      name: "Nebulizer",              watts: 45,  amps12v: 3.75, dutyCyclePct: 100, defaultHoursPerDay: 0.5, category: "medical" },
  { id: "insulin-cooler", name: "Insulin Cooler",         watts: 8,   amps12v: 0.67, dutyCyclePct: 50,  defaultHoursPerDay: 24, category: "medical" },

  // ─── Electronics ───
  { id: "laptop",         name: "Laptop (via Inverter)",  watts: 65,  amps12v: 5.42, dutyCyclePct: 100, defaultHoursPerDay: 4, category: "electronics", invertRequired: true },
  { id: "tablet",         name: "Tablet Charger",         watts: 20,  amps12v: 1.67, dutyCyclePct: 100, defaultHoursPerDay: 2, category: "electronics" },
  { id: "camera-charger", name: "Camera Charger",         watts: 15,  amps12v: 1.25, dutyCyclePct: 100, defaultHoursPerDay: 1, category: "electronics" },
  { id: "drone-charger",  name: "Drone Charger",          watts: 60,  amps12v: 5.0,  dutyCyclePct: 100, defaultHoursPerDay: 1, category: "electronics" },

  // ─── Climate Control ───
  { id: "diesel-heater-run",     name: "Diesel Heater (Running)", watts: 20,  amps12v: 1.67, dutyCyclePct: 100, defaultHoursPerDay: 8, category: "climate" },
  { id: "diesel-heater-startup", name: "Diesel Heater (Startup)", watts: 150, amps12v: 12.5, dutyCyclePct: 5,   defaultHoursPerDay: 8, category: "climate", note: "150W spike on ignition — 5% duty" },
  { id: "maxxair-fan",           name: "MaxxAir Vent Fan",        watts: 20,  amps12v: 1.67, dutyCyclePct: 100, defaultHoursPerDay: 8, category: "climate" },
  { id: "heated-blanket",        name: "12V Heated Blanket",      watts: 45,  amps12v: 3.75, dutyCyclePct: 100, defaultHoursPerDay: 8, category: "climate" },

  // ─── Recovery & Water ───
  { id: "arb-compressor", name: "ARB Twin Compressor",    watts: 650, amps12v: 54.2, dutyCyclePct: 10,  defaultHoursPerDay: 0.5, category: "recovery", note: "Intermittent — high peak current" },
  { id: "water-pump",     name: "Shurflo Water Pump",     watts: 55,  amps12v: 4.58, dutyCyclePct: 15,  defaultHoursPerDay: 2, category: "recovery", note: "Intermittent — runs on demand" },
];

// ─── Battery Chemistry Specs ───────────────────────────────────────

export type BatteryChemistry = "lifepo4" | "agm" | "lead-acid";

export interface BatterySpec {
  chemistry: BatteryChemistry;
  label: string;
  dod: number;           // depth of discharge (decimal)
  lbsPerAh: number;      // weight per Ah
  cycleLifeMin: number;
  cycleLifeMax: number;
  coldChargeCutoffC: number;   // celsius
  coldChargeCutoffF: number;   // fahrenheit
  note: string;
}

export const batterySpecs: Record<BatteryChemistry, BatterySpec> = {
  lifepo4: {
    chemistry: "lifepo4",
    label: "LiFePO4",
    dod: 0.80,
    lbsPerAh: 0.14,
    cycleLifeMin: 3000,
    cycleLifeMax: 5000,
    coldChargeCutoffC: 0,
    coldChargeCutoffF: 32,
    note: "HARD STOP — charging below 0C causes permanent lithium plating",
  },
  agm: {
    chemistry: "agm",
    label: "AGM",
    dod: 0.50,
    lbsPerAh: 0.30,
    cycleLifeMin: 400,
    cycleLifeMax: 800,
    coldChargeCutoffC: -20,
    coldChargeCutoffF: -4,
    note: "No freeze risk in normal conditions",
  },
  "lead-acid": {
    chemistry: "lead-acid",
    label: "Flooded Lead-Acid",
    dod: 0.50,
    lbsPerAh: 0.35,
    cycleLifeMin: 200,
    cycleLifeMax: 500,
    coldChargeCutoffC: -20,
    coldChargeCutoffF: -4,
    note: "Requires ventilation, maintenance, upright mounting",
  },
};

// ─── Cold Weather Derating by Climate Zone ─────────────────────────

import type { ClimateZoneId } from "../data/zip-types";

export const coldDerating: Record<ClimateZoneId, number> = {
  temperate: 0.95,
  cold: 0.80,
  "hot-humid": 1.0,
  "hot-arid": 1.0,
};

// ─── DC-DC Charger Database ────────────────────────────────────────

export interface DcDcCharger {
  id: string;
  brand: string;
  model: string;
  dcAmps: number;
  solarAmps: number | null;
  solarMaxV: number | null;
  solarMaxW: number | null;
  lifepo4AbsV: number;
  smartAltCompatible: boolean;
}

export const dcDcChargers: DcDcCharger[] = [
  { id: "renogy-dcc30s",     brand: "Renogy",  model: "DCC30S",            dcAmps: 30, solarAmps: 30,   solarMaxV: 50,  solarMaxW: null, lifepo4AbsV: 14.4, smartAltCompatible: true },
  { id: "renogy-dcc50s",     brand: "Renogy",  model: "DCC50S",            dcAmps: 50, solarAmps: 50,   solarMaxV: 50,  solarMaxW: null, lifepo4AbsV: 14.4, smartAltCompatible: true },
  { id: "victron-12-12-18",  brand: "Victron", model: "Orion-Tr 12/12-18", dcAmps: 18, solarAmps: null, solarMaxV: null, solarMaxW: null, lifepo4AbsV: 14.2, smartAltCompatible: true },
  { id: "victron-12-12-30",  brand: "Victron", model: "Orion-Tr 12/12-30", dcAmps: 30, solarAmps: null, solarMaxV: null, solarMaxW: null, lifepo4AbsV: 14.2, smartAltCompatible: true },
  { id: "redarc-bcdc1225d",  brand: "Redarc",  model: "BCDC1225D",         dcAmps: 25, solarAmps: null, solarMaxV: null, solarMaxW: 350,  lifepo4AbsV: 14.6, smartAltCompatible: true },
  { id: "redarc-bcdc1240d",  brand: "Redarc",  model: "BCDC1240D",         dcAmps: 40, solarAmps: null, solarMaxV: null, solarMaxW: 550,  lifepo4AbsV: 14.6, smartAltCompatible: true },
  { id: "redarc-bcdc1250d",  brand: "Redarc",  model: "BCDC1250D",         dcAmps: 50, solarAmps: null, solarMaxV: null, solarMaxW: 750,  lifepo4AbsV: 14.6, smartAltCompatible: true },
];

// ─── Alternator Spare Capacity Lookup ──────────────────────────────

export type VehicleType =
  | "compact-car"
  | "midsize-suv"
  | "full-size-truck"
  | "full-size-suv"
  | "heavy-duty-truck";

export interface AlternatorLookup {
  type: VehicleType;
  label: string;
  stockRangeMin: number;
  stockRangeMax: number;
  spareMin: number;
  spareMax: number;
}

export const alternatorLookup: AlternatorLookup[] = [
  { type: "compact-car",      label: "Compact Car",       stockRangeMin: 60,  stockRangeMax: 80,  spareMin: 10, spareMax: 20 },
  { type: "midsize-suv",      label: "Midsize SUV",       stockRangeMin: 80,  stockRangeMax: 110, spareMin: 20, spareMax: 40 },
  { type: "full-size-truck",   label: "Full-Size Truck",   stockRangeMin: 100, stockRangeMax: 150, spareMin: 30, spareMax: 60 },
  { type: "full-size-suv",     label: "Full-Size SUV",     stockRangeMin: 120, stockRangeMax: 160, spareMin: 40, spareMax: 70 },
  { type: "heavy-duty-truck",  label: "Heavy-Duty Truck",  stockRangeMin: 150, stockRangeMax: 220, spareMin: 50, spareMax: 80 },
];

// ─── Standard Battery Capacities ───────────────────────────────────

export const standardBatteryCapacities = [100, 200, 300] as const;

// ─── Amazon Affiliate Tag ──────────────────────────────────────────

const TAG = "prepperevo-20";
function amzUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${TAG}`;
}

// ─── Product Recommendations ───────────────────────────────────────

export interface ProductRecommendation {
  category: string;
  name: string;
  spec: string;
  url?: string;
  asin?: string;
}

export const productRecommendations: ProductRecommendation[] = [
  // Batteries
  { category: "Batteries", name: "Battle Born 100Ah LiFePO4", spec: "100Ah, 12V, 31 lbs, BMS built-in, 3000+ cycles", asin: "B06XX197GJ", url: amzUrl("B06XX197GJ") },
  { category: "Batteries", name: "SOK 206Ah LiFePO4", spec: "206Ah, 12V, 47 lbs, self-heating option available", asin: "B092CPZK4M", url: amzUrl("B092CPZK4M") },
  { category: "Batteries", name: "LiTime 200Ah LiFePO4", spec: "200Ah, 12V, 52 lbs, built-in BMS, budget-friendly", asin: "B088RM4W48", url: amzUrl("B088RM4W48") },
  { category: "Batteries", name: "Renogy 200Ah LiFePO4", spec: "200Ah, 12V, 52 lbs, built-in BMS, cold cutoff", asin: "B09GK8DWQY", url: amzUrl("B09GK8DWQY") },

  // Solar
  { category: "Solar Panels", name: "Renogy 100W Mono Panel", spec: "100W rigid panel, 22.3V Vmp, aluminum frame", asin: "B07GF5JY35", url: amzUrl("B07GF5JY35") },
  { category: "Solar Panels", name: "Renogy 200W Mono Panel", spec: "200W rigid panel, high-efficiency cells", asin: "B08CRJYJ22", url: amzUrl("B08CRJYJ22") },
  { category: "Solar Panels", name: "BougeRV 200W Flexible", spec: "200W flexible panel, fiberglass, roof-mountable", asin: "B0CP29YQCK", url: amzUrl("B0CP29YQCK") },

  // DC-DC Chargers
  { category: "DC-DC Chargers", name: "Renogy DCC30S", spec: "30A DC + 30A MPPT solar input", asin: "B093BB3PCV", url: amzUrl("B093BB3PCV") },
  { category: "DC-DC Chargers", name: "Renogy DCC50S", spec: "50A DC + 50A MPPT solar input", asin: "B093BB5JKF", url: amzUrl("B093BB5JKF") },
  { category: "DC-DC Chargers", name: "Victron Orion-Tr Smart 12/12-18", spec: "18A isolated DC-DC, Bluetooth", asin: "B0851TPKV7", url: amzUrl("B0851TPKV7") },
  { category: "DC-DC Chargers", name: "Victron Orion-Tr Smart 12/12-30", spec: "30A isolated DC-DC, Bluetooth", asin: "B07ZKG396Y", url: amzUrl("B07ZKG396Y") },
  { category: "DC-DC Chargers", name: "Redarc BCDC1225D", spec: "25A DC + 350W solar, Australian-made", asin: "B077JPHCRV", url: amzUrl("B077JPHCRV") },
  { category: "DC-DC Chargers", name: "Redarc BCDC1240D", spec: "40A DC + 550W solar, Australian-made", asin: "B077JR6NH5", url: amzUrl("B077JR6NH5") },
  { category: "DC-DC Chargers", name: "Redarc BCDC1250D", spec: "50A DC + 750W solar, Australian-made", asin: "B07MT9T1Q5", url: amzUrl("B07MT9T1Q5") },

  // Fuse Boxes & Protection
  { category: "Fuse & Protection", name: "Blue Sea ST Blade Fuse Block (12-ckt)", spec: "12-circuit, cover + negative bus, model 5026", asin: "B00JWZ9M12", url: amzUrl("B00JWZ9M12") },
  { category: "Fuse & Protection", name: "Blue Sea MRBF Terminal Fuse", spec: "Battery terminal mount, 30-300A options", asin: "B0019ZBTV4", url: amzUrl("B0019ZBTV4") },

  // Disconnects
  { category: "Disconnects", name: "Blue Sea ML-RBS Remote Battery Switch", spec: "Remote disconnect, 500A continuous, model 7700", asin: "B0016HRUPE", url: amzUrl("B0016HRUPE") },

  // Wire & Cable
  { category: "Wire & Cable", name: "WindyNation 4 AWG Cable Kit", spec: "4 AWG welding cable, red + black, lugs included", asin: "B07K4RJNY5", url: amzUrl("B07K4RJNY5") },
  { category: "Wire & Cable", name: "WindyNation 2 AWG Cable Kit", spec: "2 AWG welding cable, red + black, lugs included", asin: "B01NBRF6FQ", url: amzUrl("B01NBRF6FQ") },

  // Bus Bars & Termination
  { category: "Bus Bars", name: "Blue Sea DualBus Plus 150A", spec: "Dual bus bar, 150A rated, 10 circuits each side", asin: "B000K2MABA", url: amzUrl("B000K2MABA") },
  { category: "Termination", name: "WindyNation 4 AWG Copper Lugs (25pk)", spec: "Tinned copper, 3/8\" stud, heat shrink included", asin: "B07X52FM4F", url: amzUrl("B07X52FM4F") },
];
