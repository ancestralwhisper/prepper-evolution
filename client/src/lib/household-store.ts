// ─── Household Store ───────────────────────────────────────────────
// Read/write helpers for the pe-household localStorage key.

import type { PEHousehold, HouseholdProfile, HouseholdReadiness } from "./household-types";
import { DEFAULT_HOUSEHOLD } from "./household-types";

export const HOUSEHOLD_KEY = "pe-household";

export function getHousehold(): PEHousehold | null {
  try {
    const raw = localStorage.getItem(HOUSEHOLD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PEHousehold;
    // Sanity check — must have profile.adults to be valid
    if (typeof parsed?.profile?.adults !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveHousehold(household: PEHousehold): void {
  try {
    localStorage.setItem(HOUSEHOLD_KEY, JSON.stringify(household));
  } catch { /* ignore quota errors */ }
}

export function updateProfile(updates: Partial<HouseholdProfile>): PEHousehold {
  const existing = getHousehold() ?? { ...DEFAULT_HOUSEHOLD };
  const updated: PEHousehold = {
    ...existing,
    profile: { ...existing.profile, ...updates },
    lastProfileUpdate: new Date().toISOString(),
  };
  saveHousehold(updated);
  return updated;
}

export function updateReadiness<K extends keyof HouseholdReadiness>(
  key: K,
  data: HouseholdReadiness[K]
): void {
  try {
    const existing = getHousehold() ?? { ...DEFAULT_HOUSEHOLD };
    const updated: PEHousehold = {
      ...existing,
      readiness: { ...existing.readiness, [key]: data },
    };
    saveHousehold(updated);
  } catch { /* ignore */ }
}

export function clearHousehold(): void {
  localStorage.removeItem(HOUSEHOLD_KEY);
}

// Returns how many prep calculators have written readiness data back
export function countConnectedTools(household: PEHousehold): number {
  const r = household.readiness;
  return [r.water, r.food, r.bugout, r.kit72, r.solar].filter(Boolean).length;
}

// Returns "X days ago" or "today" label for a timestamp
export function staleness(isoTimestamp: string): string {
  if (!isoTimestamp) return "";
  const diff = Date.now() - new Date(isoTimestamp).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
