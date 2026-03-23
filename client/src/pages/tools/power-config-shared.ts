// Shared power configuration state between Solar Compatibility Checker and Power System Builder

export const POWER_CONFIG_KEY = "pe-power-config";

export type PowerConfigMode = "power-station" | "12v-system";

export interface SharedPowerConfig {
  mode: PowerConfigMode;
  // Power station mode
  stationId?: string;
  // 12V system mode
  batteryAh?: number;
  batteryChemistry?: "lifepo4" | "agm" | "fla";
  dcDcChargerId?: string;
  alternatorAmps?: number;
  // Shared solar (carries across both modes)
  selectedPanelIds?: string[];
  totalSolarWatts?: number;
  panelTypeFilter?: "all" | "rigid" | "flexible" | "foldable";
  roofMountOnly?: boolean;
  // Meta
  lastUpdatedBy?: "solar-compat" | "power-system-builder";
  timestamp?: number;
}

export function loadPowerConfig(): SharedPowerConfig | null {
  try {
    const raw = localStorage.getItem(POWER_CONFIG_KEY);
    return raw ? (JSON.parse(raw) as SharedPowerConfig) : null;
  } catch {
    return null;
  }
}

export function savePowerConfig(config: SharedPowerConfig): void {
  try {
    localStorage.setItem(POWER_CONFIG_KEY, JSON.stringify({ ...config, timestamp: Date.now() }));
  } catch {
    // ignore
  }
}

export function mergePowerConfig(existing: SharedPowerConfig | null, updates: Partial<SharedPowerConfig>): SharedPowerConfig {
  return { ...(existing ?? { mode: "power-station" }), ...updates };
}
