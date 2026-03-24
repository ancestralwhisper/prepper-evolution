// ─── Virtual Go-Bag — Shared localStorage State ──────────────────────────────
import type { SavedGoBag } from "./go-bag-types";

export const GO_BAG_KEY = "pe-go-bag";

export function loadGoBag(): SavedGoBag {
  try {
    const raw = localStorage.getItem(GO_BAG_KEY);
    if (raw) return JSON.parse(raw) as SavedGoBag;
  } catch { /* ignore */ }
  return { itemIds: [], customItems: [], lastUpdated: 0 };
}

export function saveGoBag(bag: SavedGoBag): void {
  try {
    localStorage.setItem(GO_BAG_KEY, JSON.stringify({ ...bag, lastUpdated: Date.now() }));
  } catch { /* ignore */ }
}

export function getGoBagIds(): string[] {
  return loadGoBag().itemIds;
}
