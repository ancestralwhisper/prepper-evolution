// ─── Virtual Go-Bag — Type Definitions ───────────────────────────────────────

export type GoBagCategory =
  | "water"
  | "fire"
  | "power"
  | "recovery"
  | "shelter"
  | "comms"
  | "medical"
  | "navigation"
  | "tools";

export interface GoBagItem {
  id: string;           // matches gearToNodes keys in failure-mode-data.ts where applicable
  name: string;
  brand: string;
  category: GoBagCategory;
  weight_lbs: number;
  description: string;
  asin?: string;
  hasDiagnostic?: boolean; // true if failure-mode-data.ts has nodes for this item
}

export interface CustomGoBagItem {
  id: string;           // "custom-" prefix
  name: string;
  category: GoBagCategory;
  weight_lbs: number;
}

export interface SavedGoBag {
  itemIds: string[];
  customItems: CustomGoBagItem[];
  lastUpdated: number;
}

export interface GoBagCategoryMeta {
  id: GoBagCategory;
  label: string;
  icon: string;
}
