import type { SupplyCategory } from "./deadstock-types";

export const WATER_GAL_PER_ADULT_PER_DAY = 1.0;
export const WATER_GAL_PER_CHILD_PER_DAY = 0.75;
export const WATER_GAL_PER_ELDERLY_PER_DAY = 0.85;
export const WATER_GAL_PER_PET_PER_DAY = 0.5;

export const CALORIES_PER_ADULT = 2000;
export const CALORIES_PER_CHILD = 1400;
export const CALORIES_PER_ELDERLY = 1600;

export const CALORIES_PER_LB_GRAINS = 1600;
export const CALORIES_PER_LB_PROTEIN = 800;
export const CALORIES_PER_CAN_AVG = 400;
export const CALORIES_PER_LB_FREEZE_DRIED = 1800;
export const CALORIES_PER_LB_OTHER = 1200;

export const GENERATOR_HOURS_PER_GALLON = 8;
export const GENERATOR_WH_PER_HOUR = 500;

export const MEDICAL_DAYS_BY_KIT: Record<string, number> = {
  none: 0,
  basic: 3,
  advanced: 14,
  trauma: 30,
};

export const COMMS_DAYS_HAM = 30;
export const COMMS_DAYS_AM_FM = 14;
export const COMMS_DAYS_NONE = 0;

export const GEAR_SHELTER_DAYS: Record<string, number> = {
  none: 0,
  tent: 30,
  tarp: 14,
  vehicle: 21,
};

export const CLIMATE_WATER_MULTIPLIER: Record<string, number> = {
  "hot-arid": 1.5,
  "hot-humid": 1.35,
  temperate: 1.0,
  cold: 0.9,
};

export const STRESS_MULTIPLIER = 1.15;

export const CATEGORY_META: Record<SupplyCategory, { label: string; icon: string; color: string; unit: string }> = {
  water: { label: "Water", icon: "💧", color: "#3b82f6", unit: "gallons" },
  food: { label: "Food", icon: "🥫", color: "#f59e0b", unit: "calories" },
  medical: { label: "Medical", icon: "🩹", color: "#ef4444", unit: "days coverage" },
  power: { label: "Power & Fuel", icon: "⚡", color: "#10b981", unit: "watt-hours" },
  comms: { label: "Communications", icon: "📡", color: "#8b5cf6", unit: "days capability" },
  gear: { label: "Shelter & Gear", icon: "🏕️", color: "#64748b", unit: "days viability" },
};

export function statusFromDays(days: number): "critical" | "low" | "moderate" | "good" | "excellent" {
  if (days <= 0) return "critical";
  if (days <= 3) return "critical";
  if (days <= 7) return "low";
  if (days <= 30) return "moderate";
  if (days <= 90) return "good";
  return "excellent";
}

export const STATUS_COLORS: Record<string, string> = {
  critical: "#ef4444",
  low: "#f59e0b",
  moderate: "#eab308",
  good: "#10b981",
  excellent: "#06b6d4",
};
