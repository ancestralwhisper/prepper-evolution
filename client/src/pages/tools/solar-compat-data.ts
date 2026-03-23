// ─── Power Station Solar Compatibility Data ──────────────────────────────────

export type ConnectorType =
  | "mc4"
  | "xt60"
  | "dc8020"
  | "dc5525"
  | "hpp"
  | "dc8020-mc4"
  | "anderson";

export interface PowerStation {
  id: string;
  brand: string;
  model: string;
  capacity_wh: number;
  solar_max_w: number;
  solar_max_voc: number; // max open circuit voltage
  native_connector: ConnectorType;
  accepts_mc4_direct: boolean; // true if MC4 panels plug in without adapter
  asin?: string;
}

export interface SolarPanel {
  id: string;
  brand: string;
  model: string;
  watts: number;
  voc: number; // open circuit voltage - CRITICAL for compatibility
  vmp: number; // max power voltage
  isc: number; // short circuit current (amps)
  panel_type: "rigid" | "flexible" | "foldable";
  native_connector: ConnectorType;
  roof_mountable: boolean; // can mount on vehicle roof or RTT
  partial_shade_rating: "poor" | "fair" | "good" | "excellent";
  weight_lbs: number;
  asin?: string;
}

export interface ConnectorAdapter {
  from: ConnectorType;
  to: ConnectorType;
  label: string;
  note: string;
  asin?: string;
}

// ─── Power Stations ───────────────────────────────────────────────────────────

export const powerStations: PowerStation[] = [
  // Jackery
  {
    id: "jackery-240",
    brand: "Jackery",
    model: "Explorer 240",
    capacity_wh: 240,
    solar_max_w: 200,
    solar_max_voc: 30,
    native_connector: "dc8020",
    accepts_mc4_direct: false,
    asin: "B082PDGMNK",
  },
  {
    id: "jackery-500",
    brand: "Jackery",
    model: "Explorer 500",
    capacity_wh: 518,
    solar_max_w: 100,
    solar_max_voc: 17.5,
    native_connector: "dc8020",
    accepts_mc4_direct: false,
    asin: "B07DVBG79L",
  },
  {
    id: "jackery-1000-pro",
    brand: "Jackery",
    model: "Explorer 1000 Pro",
    capacity_wh: 1002,
    solar_max_w: 400,
    solar_max_voc: 60,
    native_connector: "dc8020",
    accepts_mc4_direct: false,
    asin: "B09Q76J3MB",
  },
  {
    id: "jackery-1000-v2",
    brand: "Jackery",
    model: "Explorer 1000 v2",
    capacity_wh: 1070,
    solar_max_w: 400,
    solar_max_voc: 60,
    native_connector: "dc8020",
    accepts_mc4_direct: false,
    asin: "B0CFW1LTX2",
  },
  {
    id: "jackery-2000-plus",
    brand: "Jackery",
    model: "Explorer 2000 Plus",
    capacity_wh: 2042,
    solar_max_w: 2400,
    solar_max_voc: 80,
    native_connector: "dc8020",
    accepts_mc4_direct: false,
    asin: "B0CMY4BFPQ",
  },

  // EcoFlow
  {
    id: "ecoflow-river2",
    brand: "EcoFlow",
    model: "RIVER 2",
    capacity_wh: 256,
    solar_max_w: 110,
    solar_max_voc: 25,
    native_connector: "xt60",
    accepts_mc4_direct: false,
    asin: "B0BHGF47VD",
  },
  {
    id: "ecoflow-river2-pro",
    brand: "EcoFlow",
    model: "RIVER 2 Pro",
    capacity_wh: 768,
    solar_max_w: 220,
    solar_max_voc: 25,
    native_connector: "xt60",
    accepts_mc4_direct: false,
    asin: "B0B6PKDMZN",
  },
  {
    id: "ecoflow-delta2",
    brand: "EcoFlow",
    model: "DELTA 2",
    capacity_wh: 1024,
    solar_max_w: 500,
    solar_max_voc: 60,
    native_connector: "xt60",
    accepts_mc4_direct: false,
    asin: "B0B6PVDGXX",
  },
  {
    id: "ecoflow-delta2-max",
    brand: "EcoFlow",
    model: "DELTA 2 Max",
    capacity_wh: 2048,
    solar_max_w: 1000,
    solar_max_voc: 60,
    native_connector: "xt60",
    accepts_mc4_direct: false,
    asin: "B0BDH7QKVD",
  },
  {
    id: "ecoflow-delta3-ultra",
    brand: "EcoFlow",
    model: "DELTA 3 Ultra",
    capacity_wh: 1500,
    solar_max_w: 1500,
    solar_max_voc: 60,
    native_connector: "xt60",
    accepts_mc4_direct: false,
    asin: "B0CXQHX48K",
  },
  {
    id: "ecoflow-delta-pro",
    brand: "EcoFlow",
    model: "DELTA Pro",
    capacity_wh: 3600,
    solar_max_w: 1600,
    solar_max_voc: 150,
    native_connector: "xt60",
    accepts_mc4_direct: false,
    asin: "B09DTQDCJ5",
  },

  // Bluetti
  {
    id: "bluetti-eb3a",
    brand: "Bluetti",
    model: "EB3A",
    capacity_wh: 268,
    solar_max_w: 200,
    solar_max_voc: 28,
    native_connector: "dc5525",
    accepts_mc4_direct: false,
    asin: "B09YMNQMTW",
  },
  {
    id: "bluetti-ac180",
    brand: "Bluetti",
    model: "AC180",
    capacity_wh: 1152,
    solar_max_w: 500,
    solar_max_voc: 60,
    native_connector: "mc4",
    accepts_mc4_direct: true,
    asin: "B0BV3GGCVJ",
  },
  {
    id: "bluetti-ac200max",
    brand: "Bluetti",
    model: "AC200MAX",
    capacity_wh: 2048,
    solar_max_w: 900,
    solar_max_voc: 150,
    native_connector: "mc4",
    accepts_mc4_direct: true,
    asin: "B09DVNTM4Y",
  },
  {
    id: "bluetti-ac300",
    brand: "Bluetti",
    model: "AC300",
    capacity_wh: 3072,
    solar_max_w: 2400,
    solar_max_voc: 150,
    native_connector: "mc4",
    accepts_mc4_direct: true,
    asin: "B09DVNMJ89",
  },

  // Goal Zero
  {
    id: "goalzero-yeti-500x",
    brand: "Goal Zero",
    model: "Yeti 500X",
    capacity_wh: 505,
    solar_max_w: 150,
    solar_max_voc: 22,
    native_connector: "hpp",
    accepts_mc4_direct: false,
    asin: "B07Y6PF4WL",
  },
  {
    id: "goalzero-yeti-1000-core",
    brand: "Goal Zero",
    model: "Yeti 1000 Core",
    capacity_wh: 983,
    solar_max_w: 600,
    solar_max_voc: 50,
    native_connector: "hpp",
    accepts_mc4_direct: false,
    asin: "B097D3HZ8X",
  },
  {
    id: "goalzero-yeti-1500x",
    brand: "Goal Zero",
    model: "Yeti 1500X",
    capacity_wh: 1516,
    solar_max_w: 600,
    solar_max_voc: 50,
    native_connector: "hpp",
    accepts_mc4_direct: false,
    asin: "B07THHQMHM",
  },

  // Anker
  {
    id: "anker-solix-c1000",
    brand: "Anker",
    model: "SOLIX C1000",
    capacity_wh: 1056,
    solar_max_w: 1400,
    solar_max_voc: 60,
    native_connector: "xt60",
    accepts_mc4_direct: false,
    asin: "B0CQB2KFGX",
  },
  {
    id: "anker-solix-f2000",
    brand: "Anker",
    model: "SOLIX F2000",
    capacity_wh: 2048,
    solar_max_w: 1500,
    solar_max_voc: 60,
    native_connector: "xt60",
    accepts_mc4_direct: false,
    asin: "B0BHQCNVHB",
  },
];

// ─── Solar Panels ─────────────────────────────────────────────────────────────

export const solarPanels: SolarPanel[] = [
  // Rigid panels
  {
    id: "renogy-100w-rigid",
    brand: "Renogy",
    model: "100W Mono Rigid",
    watts: 100,
    voc: 22.3,
    vmp: 18.6,
    isc: 5.72,
    panel_type: "rigid",
    native_connector: "mc4",
    roof_mountable: true,
    partial_shade_rating: "fair",
    weight_lbs: 16.5,
    asin: "B07GF5JY35",
  },
  {
    id: "renogy-200w-rigid",
    brand: "Renogy",
    model: "200W Mono Rigid",
    watts: 200,
    voc: 24.3,
    vmp: 20.5,
    isc: 10.32,
    panel_type: "rigid",
    native_connector: "mc4",
    roof_mountable: true,
    partial_shade_rating: "fair",
    weight_lbs: 28.2,
    asin: "B08CRJYJ22",
  },

  // Flexible panels
  {
    id: "renogy-100w-flex",
    brand: "Renogy",
    model: "E.Flex 100W Flexible",
    watts: 100,
    voc: 21.6,
    vmp: 18.2,
    isc: 5.84,
    panel_type: "flexible",
    native_connector: "mc4",
    roof_mountable: true,
    partial_shade_rating: "fair",
    weight_lbs: 4.2,
    asin: "B07MVRL2QN",
  },
  {
    id: "renogy-shadowflex-100w",
    brand: "Renogy",
    model: "Shadowflex 100W",
    watts: 100,
    voc: 21.6,
    vmp: 18.4,
    isc: 5.84,
    panel_type: "flexible",
    native_connector: "mc4",
    roof_mountable: true,
    partial_shade_rating: "good",
    weight_lbs: 4.0,
    asin: "B0BZMVQ1SX",
  },
  {
    id: "bougerv-100w-flex",
    brand: "BougeRV",
    model: "100W Flexible",
    watts: 100,
    voc: 20.6,
    vmp: 17.2,
    isc: 6.11,
    panel_type: "flexible",
    native_connector: "mc4",
    roof_mountable: true,
    partial_shade_rating: "fair",
    weight_lbs: 3.7,
    asin: "B0CP29YQCK",
  },
  {
    id: "bougerv-200w-flex",
    brand: "BougeRV",
    model: "200W Flexible",
    watts: 200,
    voc: 24.3,
    vmp: 20.4,
    isc: 10.32,
    panel_type: "flexible",
    native_connector: "mc4",
    roof_mountable: true,
    partial_shade_rating: "fair",
    weight_lbs: 6.8,
    asin: "B0BW4YTY67",
  },
  {
    id: "zoupw-180w-flex",
    brand: "Zoupw",
    model: "180W Flexible",
    watts: 180,
    voc: 20.0,
    vmp: 17.4,
    isc: 10.56,
    panel_type: "flexible",
    native_connector: "mc4",
    roof_mountable: true,
    partial_shade_rating: "good",
    weight_lbs: 5.5,
    asin: "B0BXQXR2KN",
  },
  {
    id: "hqst-100w-flex",
    brand: "HQST",
    model: "100W Flexible",
    watts: 100,
    voc: 22.5,
    vmp: 18.9,
    isc: 5.93,
    panel_type: "flexible",
    native_connector: "mc4",
    roof_mountable: true,
    partial_shade_rating: "fair",
    weight_lbs: 4.1,
    asin: "B07PMBCKZL",
  },

  // Foldable / portable panels
  {
    id: "jackery-solarsaga-200w",
    brand: "Jackery",
    model: "SolarSaga 200W",
    watts: 200,
    voc: 21.6,
    vmp: 18.0,
    isc: 11.6,
    panel_type: "foldable",
    native_connector: "dc8020",
    roof_mountable: false,
    partial_shade_rating: "fair",
    weight_lbs: 13.9,
    asin: "B09CRPNL8J",
  },
  {
    id: "ecoflow-220w-bifacial",
    brand: "EcoFlow",
    model: "220W Bifacial",
    watts: 220,
    voc: 27.6,
    vmp: 22.1,
    isc: 9.9,
    panel_type: "foldable",
    native_connector: "mc4",
    roof_mountable: false,
    partial_shade_rating: "good",
    weight_lbs: 13.9,
    asin: "B0BZBJ9XBD",
  },
  {
    id: "goalzero-nomad-200",
    brand: "Goal Zero",
    model: "Nomad 200",
    watts: 200,
    voc: 22.4,
    vmp: 19.6,
    isc: 10.9,
    panel_type: "foldable",
    native_connector: "hpp",
    roof_mountable: false,
    partial_shade_rating: "fair",
    weight_lbs: 15.9,
    asin: "B07YVDSTDV",
  },
];

// ─── Connector Adapters ───────────────────────────────────────────────────────

export const connectorAdapters: ConnectorAdapter[] = [
  {
    from: "mc4",
    to: "dc8020",
    label: "MC4 to DC8020 (Jackery)",
    note: "Required for most panels with Jackery stations. Use Jackery's official cable or check DC8020 pin size — older units used DC7909.",
    asin: "B09NW2W21W",
  },
  {
    from: "mc4",
    to: "xt60",
    label: "MC4 to XT60 (EcoFlow / Anker)",
    note: "EcoFlow includes this cable in the box. Third-party versions work fine — verify polarity before connecting.",
    asin: "B08HNJP5J7",
  },
  {
    from: "mc4",
    to: "dc5525",
    label: "MC4 to DC5525 (Bluetti budget)",
    note: "Used on EB3A and some older Bluetti units. Short cable, keep panel close to station.",
    asin: "B09KC5MH6N",
  },
  {
    from: "mc4",
    to: "hpp",
    label: "MC4 to HPP (Goal Zero)",
    note: "Goal Zero uses a proprietary HPP connector. Get the official Goal Zero MC4 adapter — third-party versions have mixed reliability.",
    asin: "B018HER4FC",
  },
  {
    from: "dc8020",
    to: "mc4",
    label: "DC8020 to MC4",
    note: "Reverse adapter for connecting Jackery-connector panels to MC4-input stations.",
    asin: "B09NW2W21W",
  },
];

// ─── Cable Extensions ─────────────────────────────────────────────────────────

export interface CableExtension {
  id: string;
  label: string;
  length_ft: number;
  gauge_awg: string;
  note: string;
  asin: string;
}

export const cableExtensions: CableExtension[] = [
  { id: "mc4-ext-10ft", label: "MC4 Extension Cable 10ft", length_ft: 10, gauge_awg: "12AWG", note: "Short run — roof panel to charge controller inside cab", asin: "B07BRQM9KJ" },
  { id: "mc4-ext-20ft", label: "MC4 Extension Cable 20ft", length_ft: 20, gauge_awg: "12AWG", note: "Standard camp run — panel in sun, station in shade nearby", asin: "B07BRTQJQX" },
  { id: "mc4-ext-30ft", label: "MC4 Extension Cable 30ft", length_ft: 30, gauge_awg: "12AWG", note: "Best for shade camping — park vehicle under trees, panel in clearing", asin: "B08BXNL4MZ" },
  { id: "mc4-ext-50ft", label: "MC4 Extension Cable 50ft", length_ft: 50, gauge_awg: "10AWG", note: "Long run needs thicker wire to prevent voltage drop — use 10AWG at this length", asin: "B08BXP2Y2Z" },
];

// ─── DC-DC Chargers (self-contained for Solar Compat Checker) ─────────────────

export interface CompatDcDcCharger {
  id: string;
  brand: string;
  model: string;
  dcAmps: number;           // max alternator charging amps
  solarAmps: number | null; // max solar input amps (null = no solar input)
  solarMaxV: number | null; // max solar Voc input
  solarMaxW: number | null;
  lifepo4Compatible: boolean;
  agmCompatible: boolean;
  note: string;
  asin?: string;
}

export const compatDcDcChargers: CompatDcDcCharger[] = [
  { id: "renogy-dcc30s", brand: "Renogy", model: "DCC30S", dcAmps: 30, solarAmps: 30, solarMaxV: 50, solarMaxW: null, lifepo4Compatible: true, agmCompatible: true, note: "Most popular overland DC-DC. Handles both alternator and solar input simultaneously.", asin: "B093BB3PCV" },
  { id: "renogy-dcc50s", brand: "Renogy", model: "DCC50S", dcAmps: 50, solarAmps: 50, solarMaxV: 50, solarMaxW: null, lifepo4Compatible: true, agmCompatible: true, note: "Larger builds — 50A alternator + 50A solar. Good for 200Ah+ LiFePO4 banks.", asin: "B093BB5JKF" },
  { id: "redarc-bcdc1225d", brand: "Redarc", model: "BCDC1225D", dcAmps: 25, solarAmps: null, solarMaxV: null, solarMaxW: 350, lifepo4Compatible: true, agmCompatible: true, note: "Australian-made, bulletproof build quality. 25A alternator + 350W solar.", asin: "B077JPHCRV" },
  { id: "redarc-bcdc1240d", brand: "Redarc", model: "BCDC1240D", dcAmps: 40, solarAmps: null, solarMaxV: null, solarMaxW: 550, lifepo4Compatible: true, agmCompatible: true, note: "40A for larger battery banks. 550W solar input.", asin: "B077JR6NH5" },
  { id: "victron-orion-12-12-30", brand: "Victron", model: "Orion-Tr 12/12-30", dcAmps: 30, solarAmps: null, solarMaxV: null, solarMaxW: null, lifepo4Compatible: true, agmCompatible: true, note: "Alternator only — no solar input. Best-in-class smart charging profiles. Pairs with a separate MPPT controller.", asin: "B07NVVNWN9" },
  { id: "redarc-manager30", brand: "Redarc", model: "Manager30", dcAmps: 30, solarAmps: 30, solarMaxV: 50, solarMaxW: null, lifepo4Compatible: true, agmCompatible: true, note: "Handles alternator, solar, AND 240V shore power in one unit. RedVision compatible.", asin: "B00LKRKKIW" },
];
