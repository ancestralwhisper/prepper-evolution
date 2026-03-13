export type SupplyCategory = "water" | "food" | "medical" | "power" | "comms" | "gear";

export type KitLevel = "none" | "basic" | "advanced" | "trauma";
export type ShelterType = "none" | "tent" | "tarp" | "vehicle";

export interface DeadstockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  caloriesPerUnit?: number;
  expirationDate?: string;
  addedAt: string;
}

export interface DeadstockHousehold {
  adults: number;
  children: number;
  elderly: number;
  pets: number;
  zipCode: string | null;
  climateZone: string | null;
}

export interface WaterInventory {
  totalGallons: number;
  hasFilter: boolean;
  hasPurification: boolean;
  items: DeadstockItem[];
}

export interface FoodInventory {
  estimatedDays: number | null;
  categories: {
    grains: number;
    protein: number;
    canned: number;
    freezeDried: number;
    other: number;
  } | null;
  items: DeadstockItem[];
}

export interface MedicalInventory {
  kitLevel: KitLevel;
  prescriptionDays: number;
  items: DeadstockItem[];
}

export interface PowerInventory {
  hasGenerator: boolean;
  hasSolar: boolean;
  generatorFuelGallons: number;
  solarWh: number;
  batteryBankWh: number;
  items: DeadstockItem[];
}

export interface CommsInventory {
  hasHamGmrs: boolean;
  hasAmFm: boolean;
  items: DeadstockItem[];
}

export interface GearInventory {
  shelterType: ShelterType;
  fireMethodCount: number;
  items: DeadstockItem[];
}

export interface DeadstockInventory {
  water: WaterInventory;
  food: FoodInventory;
  medical: MedicalInventory;
  power: PowerInventory;
  comms: CommsInventory;
  gear: GearInventory;
}

export interface CategoryResult {
  category: SupplyCategory;
  days: number;
  label: string;
  status: "critical" | "low" | "moderate" | "good" | "excellent";
  detail: string;
}

export interface DeadstockResult {
  autonomyDays: number;
  lastDay: string;
  categoryResults: CategoryResult[];
  bottleneck: SupplyCategory;
  score: number;
  calculatedAt: string;
}

export interface ConsumptionLog {
  id: string;
  category: SupplyCategory;
  amount: number;
  unit: string;
  loggedAt: string;
}

export const DEADSTOCK_HOUSEHOLD_KEY = "pe-deadstock-household";
export const DEADSTOCK_INVENTORY_KEY = "pe-deadstock-inventory";
export const DEADSTOCK_RESULT_KEY = "pe-deadstock-result";
export const DEADSTOCK_CONSUMPTION_KEY = "pe-deadstock-consumption";
export const DEADSTOCK_SETUP_COMPLETE_KEY = "pe-deadstock-setup-complete";
