// ─── Category Accent Colors ───────────────────────────────────────────────────
// Three-color system that maps content categories to accent colors site-wide.
//
//   Red     → Emergency prep, survival, first aid, skills, security, comms
//   Emerald → Overlanding, camping, outdoor/mobile content
//   Primary → Gear reviews, tools, power, products

export type AccentColor = "red" | "emerald" | "primary";

// Matches both slugs (gear-reviews) and display names (Gear Reviews), case-insensitive
const MAP: Record<string, AccentColor> = {
  // Emergency prep → red
  preparedness:          "red",
  "skills-strategy":     "red",
  "skills & strategy":   "red",
  "skills and strategy": "red",
  "skills":              "red",
  "first-aid":           "red",
  "first aid":           "red",
  security:              "red",
  communication:         "red",
  "water-food":          "red",
  "water & food":        "red",
  "water and food":      "red",
  survival:              "red",
  emergency:             "red",

  // Outdoor / mobile → emerald
  overlanding:           "emerald",
  camping:               "emerald",
  navigation:            "emerald",
  offroad:               "emerald",
  "off-road":            "emerald",

  // Gear / tools → primary
  "gear-reviews":        "primary",
  "gear reviews":        "primary",
  "gear review":         "primary",
  tools:                 "primary",
  power:                 "primary",
  electronics:           "primary",
  products:              "primary",
};

export function categoryAccent(category: string | undefined | null): AccentColor {
  if (!category) return "primary";
  return MAP[category.toLowerCase().trim()] ?? "primary";
}

// ─── Class Lookups ────────────────────────────────────────────────────────────

/** Solid pill badge on image cards */
export const BADGE_CLASSES: Record<AccentColor, string> = {
  red:     "bg-red-600 text-white",
  emerald: "bg-emerald-600 text-white",
  primary: "bg-primary/90 text-primary-foreground",
};

/** Inline category label (text only) */
export const LABEL_CLASSES: Record<AccentColor, string> = {
  red:     "text-red-500 dark:text-red-400",
  emerald: "text-emerald-500 dark:text-emerald-400",
  primary: "text-primary",
};

/** Filter button — active state */
export const FILTER_ACTIVE: Record<AccentColor, string> = {
  red:     "bg-red-500 text-white border-red-500 shadow-sm",
  emerald: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
  primary: "bg-primary text-primary-foreground border-primary shadow-sm",
};

/** Filter button — inactive hover state */
export const FILTER_HOVER: Record<AccentColor, string> = {
  red:     "hover:border-red-400 hover:text-red-500 hover:shadow-sm",
  emerald: "hover:border-emerald-500 hover:text-emerald-600 hover:shadow-sm",
  primary: "hover:border-primary hover:text-primary hover:shadow-sm",
};

/** Card border on hover */
export const CARD_HOVER: Record<AccentColor, string> = {
  red:     "hover:border-red-400/50",
  emerald: "hover:border-emerald-500/50",
  primary: "hover:border-primary/50",
};

/** Icon wrapper background */
export const ICON_BG: Record<AccentColor, string> = {
  red:     "bg-red-500/10 group-hover:bg-red-500/20",
  emerald: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  primary: "bg-primary/10 group-hover:bg-primary/20",
};

/** Icon color */
export const ICON_COLOR: Record<AccentColor, string> = {
  red:     "text-red-500",
  emerald: "text-emerald-600",
  primary: "text-primary",
};

/** Nav hover color */
export const NAV_HOVER: Record<AccentColor, string> = {
  red:     "hover:text-red-500 decoration-red-500",
  emerald: "hover:text-emerald-600 decoration-emerald-600",
  primary: "hover:text-primary decoration-primary",
};

/** Section header left-border accent */
export const SECTION_BORDER: Record<AccentColor, string> = {
  red:     "border-l-4 border-l-red-500 pl-3",
  emerald: "border-l-4 border-l-emerald-500 pl-3",
  primary: "border-l-4 border-l-primary pl-3",
};
