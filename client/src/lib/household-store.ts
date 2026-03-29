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

// ─── Prepper Readiness Score (PRS) ───────────────────────────────
// Weighted 0-100 composite score across all 5 prep domains.
// Each domain is worth 20 points max.

export interface PRSResult {
  total: number;          // 0-100
  water: number;          // 0-20
  food: number;           // 0-20
  bugout: number;         // 0-20
  kit72: number;          // 0-20
  solar: number;          // 0-20
  label: string;          // "Getting Started" | "Building Up" | "On Track" | "Well Prepared" | "Fully Ready"
  color: string;          // tailwind text color class
  ring: string;           // tailwind ring/border color class
}

function daysScore(days: number): number {
  if (days >= 14) return 20;
  if (days >= 7)  return 15;
  if (days >= 3)  return 10;
  if (days >= 1)  return 5;
  return 0;
}

export function computePRS(household: PEHousehold): PRSResult {
  const r = household.readiness;

  const water  = daysScore(r.water?.daysOfSupply ?? 0);
  const food   = daysScore(r.food?.daysOfSupply ?? 0);

  let bugout = 0;
  if (r.bugout) {
    if (r.bugout.status === "Good")       bugout = 20;
    else if (r.bugout.status === "Heavy") bugout = 12;
    else if (r.bugout.status === "Too Heavy") bugout = 5;
    else bugout = 8; // has a bag, no status
  }

  const kit72 = r.kit72
    ? Math.min(20, Math.round((r.kit72.completionPct / 100) * 20))
    : 0;

  let solar = 0;
  if (r.solar) {
    const d = r.solar.daysOfAutonomy;
    if (d >= 3)      solar = 20;
    else if (d >= 2) solar = 16;
    else if (d >= 1) solar = 12;
    else if (d > 0)  solar = 8;
  }

  const total = water + food + bugout + kit72 + solar;

  let label: string;
  let color: string;
  let ring: string;
  if (total >= 91)      { label = "Fully Ready";     color = "text-emerald-400"; ring = "border-emerald-400"; }
  else if (total >= 76) { label = "Well Prepared";   color = "text-green-400";   ring = "border-green-400";   }
  else if (total >= 51) { label = "On Track";         color = "text-yellow-400";  ring = "border-yellow-400";  }
  else if (total >= 26) { label = "Building Up";      color = "text-orange-400";  ring = "border-orange-400";  }
  else                  { label = "Getting Started";  color = "text-red-400";     ring = "border-red-400";     }

  return { total, water, food, bugout, kit72, solar, label, color, ring };
}

// ─── Share URL encoder ────────────────────────────────────────────
// Encodes PRS result as a compact URL-safe string for sharing.
export function encodePRSShare(prs: PRSResult, profile: PEHousehold["profile"]): string {
  const params = new URLSearchParams({
    s: String(prs.total),
    w: String(prs.water),
    f: String(prs.food),
    b: String(prs.bugout),
    k: String(prs.kit72),
    p: String(prs.solar),
    n: String(profile.adults + profile.children + profile.elderly),
    l: prs.label,
  });
  return `/tools/share?${params.toString()}`;
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
