// ─── SITREP — Situation Report ────────────────────────────────────────────────
// Scenario-driven readiness assessment across 6 categories.
// Reads from all Ops Deck localStorage keys + manual inputs.

export type SitrepScenario =
  | "grid-down"
  | "72hr-bug-out"
  | "extended-bug-out"
  | "wildfire-evac"
  | "shelter-in-place"
  | "winter-storm";

export type CategoryStatus = "green" | "yellow" | "red";
export type GoNoGo = "send-it" | "marginal" | "stand-down";

export interface CategoryResult {
  id: string;
  name: string;
  score: number;       // 0–100
  weight: number;      // scenario-specific weight, 0–1
  status: CategoryStatus;
  wins: string[];
  gaps: string[];
}

export interface PriorityGap {
  priority: number;    // 1 = most critical
  category: string;
  issue: string;
  fix: string;
  toolSlug?: string;
  toolName?: string;
}

export interface SitrepResult {
  scenario: SitrepScenario;
  overallScore: number;   // weighted 0–100
  goNoGo: GoNoGo;
  categories: CategoryResult[];
  priorityGaps: PriorityGap[];
  warnings: string[];
  dataSourceCount: number;
}

// Manual inputs fill gaps when tool data isn't available
export interface SitrepManualInputs {
  householdSize: number;
  waterDaysOnHand: number;
  foodDaysOnHand: number;
  hasTentOrTarp: boolean;
  hasSleepingBag: boolean;
  hasHandheldRadio: boolean;
  hasSatComm: boolean;
  fuelFillPct: number;    // override when load balancer not configured
}

export const DEFAULT_MANUAL_INPUTS: SitrepManualInputs = {
  householdSize: 2,
  waterDaysOnHand: 0,
  foodDaysOnHand: 0,
  hasTentOrTarp: false,
  hasSleepingBag: false,
  hasHandheldRadio: false,
  hasSatComm: false,
  fuelFillPct: 50,
};

export const SCENARIO_META: Record<
  SitrepScenario,
  { label: string; timeframe: string; description: string; icon: string }
> = {
  "grid-down": {
    label: "Grid Down",
    timeframe: "7–30 days",
    description: "Power grid failure. Shelter in place or limited movement. Power and water are your critical gaps.",
    icon: "zap-off",
  },
  "72hr-bug-out": {
    label: "72-Hr Bug Out",
    timeframe: "72 hours",
    description: "Emergency departure. You have 15 minutes to load and go. Mobility and shelter drive your readiness.",
    icon: "truck",
  },
  "extended-bug-out": {
    label: "Extended Bug Out",
    timeframe: "7+ days",
    description: "Multi-day departure with full kit. Power, shelter, water, and vehicle capability all matter.",
    icon: "map",
  },
  "wildfire-evac": {
    label: "Wildfire Evac",
    timeframe: "Minutes to hours",
    description: "Speed is the only variable. Can you leave in 10 minutes with enough fuel to get out of the zone?",
    icon: "flame",
  },
  "shelter-in-place": {
    label: "Shelter in Place",
    timeframe: "30+ days",
    description: "Long-duration home survival. Water, food, and power are your highest priorities.",
    icon: "home",
  },
  "winter-storm": {
    label: "Winter Storm",
    timeframe: "3–14 days",
    description: "Cold weather grid-down. Shelter quality and power for heat matter more than anything else.",
    icon: "snowflake",
  },
};

export const STORAGE_KEY = "pe-sitrep-v1";
