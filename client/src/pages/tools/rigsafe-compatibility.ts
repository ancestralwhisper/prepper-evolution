// ─── RigSafe Compatibility Pairing ───────────────────────────────────────────
// When a user selects a power station, recommend the best solar panels and
// fridges that pair with it.
//
// Ranking logic:
//   1. Same-brand products always rank first (best integration / warranty)
//   2. Then by wattage match — panel watts should be proportional to station capacity
//   3. Fridges ranked by power draw vs station output headroom

import { solarDatabase, type SolarPanelEntry } from "./rigsafe-solar";
import { fridgeDatabase, type FridgeEntry } from "./rigsafe-fridges";

// ─── Brand mapping: power station brand → solar/fridge brand names ──────────
// Some brands use different names across product lines
const brandAliases: Record<string, string[]> = {
  EcoFlow: ["EcoFlow"],
  Jackery: ["Jackery"],
  Bluetti: ["Bluetti"],
  Anker: ["Anker"],
  "Goal Zero": ["Goal Zero"],
  Renogy: ["Renogy"],
  BougeRV: ["BougeRV"],
  Dometic: ["Dometic"],
  ARB: ["ARB"],
};

// ─── Solar panel sizing guidance ─────────────────────────────────────────────
// Recommended panel wattage as a fraction of station capacity:
//   - Minimum: ~10% of Wh (e.g. 100W panel for 1000Wh station)
//   - Sweet spot: 15-25% of Wh
//   - Maximum: limited by station's solar input rating

interface PowerStationInfo {
  brand: string;
  capacityWh: number;
  maxSolarInputW?: number;
}

/**
 * Get top compatible solar panels for a power station.
 * Returns up to `limit` panels, ranked by compatibility.
 */
export function getCompatibleSolarPanels(
  station: PowerStationInfo,
  limit = 5,
): SolarPanelEntry[] {
  const stationBrands = brandAliases[station.brand] ?? [station.brand];

  // Target panel wattage: 15-25% of capacity, clamped by solar input
  const targetWatts = station.capacityWh * 0.2;
  const maxWatts = station.maxSolarInputW ?? station.capacityWh;

  const scored = solarDatabase
    .filter((panel) => panel.watts <= maxWatts)
    .map((panel) => {
      let score = 0;

      // Same brand: +50 points
      if (stationBrands.includes(panel.brand)) {
        score += 50;
      }

      // Wattage fit: closer to target = higher score (max 30 points)
      const wattRatio = panel.watts / targetWatts;
      if (wattRatio >= 0.5 && wattRatio <= 2.0) {
        // Within sweet spot range
        score += 30 - Math.abs(1 - wattRatio) * 20;
      } else if (wattRatio < 0.5) {
        score += 5; // too small but still usable
      } else {
        score += 10; // too large but might work
      }

      // Portable panels get a slight bump for overlanding use
      if (panel.mountType === "universal") {
        score += 5;
      }

      return { panel, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.panel);
}

/**
 * Get top compatible fridges for a power station.
 * Any 12V fridge works with any station, but we rank by:
 *   1. Same brand (best ecosystem integration)
 *   2. Power draw vs station output (shouldn't exceed 10% of capacity for all-day use)
 *   3. Mid-size fridges ranked higher (most practical for overlanding)
 */
export function getCompatibleFridges(
  station: PowerStationInfo,
  limit = 5,
): FridgeEntry[] {
  // Max reasonable fridge draw: fridge running 8hrs/day shouldn't exceed 40% of capacity
  const maxDailyBudgetWh = station.capacityWh * 0.4;
  const maxFridgeWatts = maxDailyBudgetWh / 8; // assume 8hrs active compressor per day

  const scored = fridgeDatabase
    .map((fridge) => {
      const fridgeWatts = fridge.drawAmps * 12;
      let score = 0;

      // Same brand: +50 points
      const stationBrands = brandAliases[station.brand] ?? [station.brand];
      if (stationBrands.includes(fridge.brand)) {
        score += 50;
      }

      // Power budget fit: can the station realistically run this fridge all day?
      if (fridgeWatts <= maxFridgeWatts) {
        score += 30; // fits comfortably
      } else if (fridgeWatts <= maxFridgeWatts * 1.5) {
        score += 15; // tight but doable
      } else {
        score += 5; // will drain fast
      }

      // Mid-size fridges (35-55qt) are most practical for overlanding
      if (fridge.capacityQts >= 35 && fridge.capacityQts <= 55) {
        score += 10;
      }

      // Fridge-freezer combos are more versatile
      if (fridge.type === "fridge-freezer") {
        score += 5;
      }

      return { fridge, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.fridge);
}

/**
 * Parse a power station brand from its name string.
 * Handles common patterns like "EcoFlow DELTA 3 Plus" → "EcoFlow"
 */
export function parseStationBrand(name: string): string {
  const lower = name.toLowerCase();
  if (lower.startsWith("ecoflow")) return "EcoFlow";
  if (lower.startsWith("jackery")) return "Jackery";
  if (lower.startsWith("bluetti")) return "Bluetti";
  if (lower.startsWith("anker")) return "Anker";
  if (lower.startsWith("goal zero")) return "Goal Zero";
  if (lower.startsWith("renogy")) return "Renogy";
  if (lower.startsWith("bougerv")) return "BougeRV";
  return name.split(" ")[0];
}
