import type {
  DeadstockHousehold,
  DeadstockInventory,
  DeadstockResult,
  CategoryResult,
  SupplyCategory,
} from "./deadstock-types";
import {
  WATER_GAL_PER_ADULT_PER_DAY,
  WATER_GAL_PER_CHILD_PER_DAY,
  WATER_GAL_PER_ELDERLY_PER_DAY,
  WATER_GAL_PER_PET_PER_DAY,
  CALORIES_PER_ADULT,
  CALORIES_PER_CHILD,
  CALORIES_PER_ELDERLY,
  CALORIES_PER_LB_GRAINS,
  CALORIES_PER_LB_PROTEIN,
  CALORIES_PER_CAN_AVG,
  CALORIES_PER_LB_FREEZE_DRIED,
  CALORIES_PER_LB_OTHER,
  GENERATOR_HOURS_PER_GALLON,
  GENERATOR_WH_PER_HOUR,
  MEDICAL_DAYS_BY_KIT,
  COMMS_DAYS_HAM,
  COMMS_DAYS_AM_FM,
  COMMS_DAYS_NONE,
  GEAR_SHELTER_DAYS,
  CLIMATE_WATER_MULTIPLIER,
  STRESS_MULTIPLIER,
  statusFromDays,
  CATEGORY_META,
} from "./deadstock-data";

export function dailyWaterNeed(household: DeadstockHousehold): number {
  const climateMultiplier = household.climateZone
    ? CLIMATE_WATER_MULTIPLIER[household.climateZone] ?? 1.0
    : 1.0;

  const base =
    household.adults * WATER_GAL_PER_ADULT_PER_DAY +
    household.children * WATER_GAL_PER_CHILD_PER_DAY +
    household.elderly * WATER_GAL_PER_ELDERLY_PER_DAY +
    household.pets * WATER_GAL_PER_PET_PER_DAY;

  return base * climateMultiplier * STRESS_MULTIPLIER;
}

export function dailyCalorieNeed(household: DeadstockHousehold): number {
  return (
    household.adults * CALORIES_PER_ADULT +
    household.children * CALORIES_PER_CHILD +
    household.elderly * CALORIES_PER_ELDERLY
  ) * STRESS_MULTIPLIER;
}

export function calculateWaterDays(
  inventory: DeadstockInventory["water"],
  household: DeadstockHousehold,
): number {
  const daily = dailyWaterNeed(household);
  if (daily <= 0) return 0;

  let totalGal = inventory.totalGallons;
  inventory.items.forEach((item) => {
    if (item.unit === "gallons") totalGal += item.quantity;
  });

  const baseDays = totalGal / daily;
  const filterBonus = inventory.hasFilter ? Math.min(baseDays * 0.5, 30) : 0;

  return Math.round((baseDays + filterBonus) * 10) / 10;
}

export function calculateFoodDays(
  inventory: DeadstockInventory["food"],
  household: DeadstockHousehold,
): number {
  const dailyCal = dailyCalorieNeed(household);
  if (dailyCal <= 0) return 0;

  if (inventory.estimatedDays !== null && inventory.estimatedDays > 0 && !inventory.categories) {
    return inventory.estimatedDays;
  }

  let totalCalories = 0;

  if (inventory.categories) {
    totalCalories +=
      inventory.categories.grains * CALORIES_PER_LB_GRAINS +
      inventory.categories.protein * CALORIES_PER_LB_PROTEIN +
      inventory.categories.canned * CALORIES_PER_CAN_AVG +
      inventory.categories.freezeDried * CALORIES_PER_LB_FREEZE_DRIED +
      inventory.categories.other * CALORIES_PER_LB_OTHER;
  }

  inventory.items.forEach((item) => {
    if (item.caloriesPerUnit) {
      totalCalories += item.quantity * item.caloriesPerUnit;
    }
  });

  if (totalCalories <= 0 && inventory.estimatedDays !== null) {
    return inventory.estimatedDays;
  }

  return Math.round((totalCalories / dailyCal) * 10) / 10;
}

export function calculateMedicalDays(inventory: DeadstockInventory["medical"]): number {
  const kitDays = MEDICAL_DAYS_BY_KIT[inventory.kitLevel] ?? 0;
  const rxDays = inventory.prescriptionDays;
  const itemDays = inventory.items.reduce((acc, item) => {
    if (item.unit === "days") return acc + item.quantity;
    return acc;
  }, 0);

  if (rxDays > 0) {
    return Math.min(kitDays + itemDays, rxDays);
  }
  return kitDays + itemDays;
}

export function calculatePowerDays(inventory: DeadstockInventory["power"]): number {
  let totalWh = inventory.batteryBankWh + inventory.solarWh;

  if (inventory.hasGenerator && inventory.generatorFuelGallons > 0) {
    const genHours = inventory.generatorFuelGallons * GENERATOR_HOURS_PER_GALLON;
    totalWh += genHours * GENERATOR_WH_PER_HOUR;
  }

  inventory.items.forEach((item) => {
    if (item.unit === "wh") totalWh += item.quantity;
  });

  const dailyUsageWh = 2000;
  if (totalWh <= 0) return 0;
  return Math.round((totalWh / dailyUsageWh) * 10) / 10;
}

export function calculateCommsDays(inventory: DeadstockInventory["comms"]): number {
  if (inventory.hasHamGmrs) return COMMS_DAYS_HAM;
  if (inventory.hasAmFm) return COMMS_DAYS_AM_FM;

  const itemDays = inventory.items.reduce((acc, item) => {
    if (item.unit === "days") return acc + item.quantity;
    return acc;
  }, 0);

  return itemDays > 0 ? itemDays : COMMS_DAYS_NONE;
}

export function calculateGearDays(inventory: DeadstockInventory["gear"]): number {
  const shelterDays = GEAR_SHELTER_DAYS[inventory.shelterType] ?? 0;
  const fireBonus = Math.min(inventory.fireMethodCount, 3) * 7;

  const itemDays = inventory.items.reduce((acc, item) => {
    if (item.unit === "days") return acc + item.quantity;
    return acc;
  }, 0);

  return shelterDays + fireBonus + itemDays;
}

function detailForCategory(cat: SupplyCategory, days: number): string {
  if (days <= 0) return "No supplies in this category.";
  if (days <= 3) return `Critical — only ${days} day${days !== 1 ? "s" : ""} of coverage.`;
  if (days <= 7) return `Low — covers about a week. FEMA recommends at least 14 days.`;
  if (days <= 30) return `Moderate — ${Math.round(days)} days. Good start, aim for 90.`;
  if (days <= 90) return `Good — ${Math.round(days)} days of coverage.`;
  return `Excellent — ${Math.round(days)} days. Well prepared.`;
}

export function calculateAll(
  household: DeadstockHousehold,
  inventory: DeadstockInventory,
): DeadstockResult {
  const waterDays = calculateWaterDays(inventory.water, household);
  const foodDays = calculateFoodDays(inventory.food, household);
  const medicalDays = calculateMedicalDays(inventory.medical);
  const powerDays = calculatePowerDays(inventory.power);
  const commsDays = calculateCommsDays(inventory.comms);
  const gearDays = calculateGearDays(inventory.gear);

  const categories: SupplyCategory[] = ["water", "food", "medical", "power", "comms", "gear"];
  const dayValues: Record<SupplyCategory, number> = {
    water: waterDays,
    food: foodDays,
    medical: medicalDays,
    power: powerDays,
    comms: commsDays,
    gear: gearDays,
  };

  const categoryResults: CategoryResult[] = categories.map((cat) => ({
    category: cat,
    days: dayValues[cat],
    label: CATEGORY_META[cat].label,
    status: statusFromDays(dayValues[cat]),
    detail: detailForCategory(cat, dayValues[cat]),
  }));

  const coreDays = [waterDays, foodDays, medicalDays];
  const autonomyDays = Math.round(Math.min(...coreDays) * 10) / 10;

  const bottleneckResult = categoryResults.reduce((min, r) =>
    r.days < min.days ? r : min,
  );

  const now = new Date();
  const lastDay = new Date(now);
  lastDay.setDate(lastDay.getDate() + Math.floor(autonomyDays));

  const score = Math.min(365, Math.round(autonomyDays));

  return {
    autonomyDays,
    lastDay: lastDay.toISOString(),
    categoryResults,
    bottleneck: bottleneckResult.category,
    score,
    calculatedAt: now.toISOString(),
  };
}

export function formatLastDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
