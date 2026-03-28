// ─── Household Profile Types ───────────────────────────────────────
// pe-household — shared across all prep calculators and SITREP

export interface HouseholdProfile {
  // People
  adults: number;
  children: number;
  elderly: number;
  nursingMothers: number;

  // Pets
  dogs: number;
  cats: number;

  // Home
  livingSituation: "house" | "apartment" | "rural" | "mobile";

  // Location (synced from pe-zip / ZipLookup)
  zipCode: string;
  region: string;     // SolarRegionId — matches Solar calc region IDs (sr)
  kitRegion: string;  // KitRegionId — matches 72-Hour Kit region IDs (kr)
  climate: string;    // ClimateZoneId — matches Water calc climate IDs (cz)
  primaryHazard: string; // HazardId from zip lookup

  // Lifestyle
  activityLevel: "sedentary" | "moderate" | "heavy";

  // Special needs
  hasCPAP: boolean;
  hasRefrigeratedMeds: boolean;
  hasMobilityLimitations: boolean;

  // Budget
  budgetTier: "starter" | "standard" | "premium";
}

// Computed outputs written back by each calculator after a run.
// These give SITREP real data instead of estimates.
export interface HouseholdReadiness {
  water?: {
    totalGallons: number;
    daysOfSupply: number;
    dailyGallons: number;
    lastCalculated: string; // ISO timestamp
  };
  food?: {
    totalCalories: number;
    daysOfSupply: number;
    totalLbs: number;
    lastCalculated: string;
  };
  bugout?: {
    bagWeightLbs: number;
    pctBodyWeight: number;
    status: string; // "Good" | "Heavy" | "Too Heavy"
    itemCount: number;
    lastCalculated: string;
  };
  kit72?: {
    completionPct: number;
    checkedCount: number;
    totalItems: number;
    lastCalculated: string;
  };
  solar?: {
    totalDailyWh: number;
    batteryCapacityNeeded: number;
    solarWattsNeeded: number;
    daysOfAutonomy: number;
    lastCalculated: string;
  };
}

export interface PEHousehold {
  version: number;
  profile: HouseholdProfile;
  readiness: HouseholdReadiness;
  lastProfileUpdate: string; // ISO timestamp
}

export const DEFAULT_PROFILE: HouseholdProfile = {
  adults: 2,
  children: 0,
  elderly: 0,
  nursingMothers: 0,
  dogs: 0,
  cats: 0,
  livingSituation: "house",
  zipCode: "",
  region: "",
  kitRegion: "",
  climate: "temperate",
  primaryHazard: "",
  activityLevel: "sedentary",
  hasCPAP: false,
  hasRefrigeratedMeds: false,
  hasMobilityLimitations: false,
  budgetTier: "standard",
};

export const DEFAULT_HOUSEHOLD: PEHousehold = {
  version: 1,
  profile: DEFAULT_PROFILE,
  readiness: {},
  lastProfileUpdate: "",
};
