export {
  deviceCategories,
  allDevices,
  powerStations,
  solarPanels,
  solarRegions,
  BATTERY_DOD,
  type Device,
  type PowerStationRec,
  type SolarRegion,
} from "./device-data";

export const INVERTER_EFFICIENCY = 0.90;

export interface ScenarioPreset {
  id: string;
  name: string;
  desc: string;
  devices: Record<string, { qty: number; hours: number }>;
}

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: "blackout",
    name: "Power Outage",
    desc: "Lights, phone, fridge, fan",
    devices: {
      "led-bulb": { qty: 3, hours: 6 },
      "phone-charger": { qty: 2, hours: 2 },
      "fridge": { qty: 1, hours: 8 },
      "box-fan": { qty: 1, hours: 8 },
    },
  },
  {
    id: "camping",
    name: "Car Camping",
    desc: "Lights, phone, cooler, speaker",
    devices: {
      "led-lantern": { qty: 2, hours: 5 },
      "phone-charger": { qty: 2, hours: 2 },
      "mini-fridge": { qty: 1, hours: 8 },
      "bluetooth-speaker": { qty: 1, hours: 4 },
    },
  },
  {
    id: "vanlife",
    name: "Van / RV",
    desc: "Fridge, laptop, lights, fan, CPAP",
    devices: {
      "led-bulb": { qty: 2, hours: 5 },
      "fridge": { qty: 1, hours: 10 },
      "laptop": { qty: 1, hours: 6 },
      "box-fan": { qty: 1, hours: 8 },
      "cpap": { qty: 1, hours: 8 },
    },
  },
  {
    id: "tailgate",
    name: "Tailgate / Jobsite",
    desc: "TV, blender, phone, speaker",
    devices: {
      "tv-40": { qty: 1, hours: 4 },
      "phone-charger": { qty: 3, hours: 2 },
      "bluetooth-speaker": { qty: 1, hours: 4 },
    },
  },
];

export interface CapacityTier {
  label: string;
  min: number;
  max: number;
}

export const capacityTiers: CapacityTier[] = [
  { label: "Under 500 Wh", min: 0, max: 500 },
  { label: "500 – 1,500 Wh", min: 500, max: 1500 },
  { label: "1,500 – 3,000 Wh", min: 1500, max: 3000 },
  { label: "3,000 – 5,000 Wh", min: 3000, max: 5000 },
  { label: "5,000+ Wh", min: 5000, max: Infinity },
];
