export interface BarterItem {
  id: string;
  name: string;
  category: string;
  type: "good" | "skill";
  description: string;
  /** Trade value on 1-10 scale at Day 7 */
  valueDay7: number;
  /** Trade value on 1-10 scale at Day 30 */
  valueDay30: number;
  /** Trade value on 1-10 scale at Day 90 */
  valueDay90: number;
  /** For skills: what goods/tools are needed to perform this skill */
  dependencies?: string[];
  /** For goods: does it get used up? */
  consumable?: boolean;
  /** Unit of measure (gallon, box, bottle, each, etc.) */
  unit?: string;
  /** What this item/skill typically trades for at Day 30 */
  tradesFor?: string;
  /** Additional context or historical reference */
  notes?: string;
  /** Current approximate retail price in USD (for ROI calc) */
  retailPrice?: number;
  /** Amazon ASIN for affiliate link (prepperevo-20) */
  asin?: string;
}

export type TimelinePoint = "day7" | "day30" | "day90";

export interface PortfolioEntry {
  itemId: string;
  quantity: number;
}

export interface BarterPortfolio {
  goods: PortfolioEntry[];
  skills: string[]; // skill IDs the user has
  updatedAt: string;
}

export interface PortfolioScore {
  totalScore: number;
  goodsScore: number;
  skillsScore: number;
  categoryBreakdown: { category: string; score: number; color: string }[];
  tier: "vulnerable" | "survivor" | "trader" | "broker" | "kingpin";
}

export interface TradeRecommendation {
  item: BarterItem;
  reason: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface ROIItem {
  item: BarterItem;
  retailPrice: number;
  day30Value: number;
  day90Value: number;
  roiScore: number; // higher = better bang for buck
}

export interface SkillDependencyStatus {
  skill: BarterItem;
  met: string[];
  unmet: string[];
  status: "ready" | "limited" | "blocked";
}

export interface ValueTrendPoint {
  timepoint: TimelinePoint;
  label: string;
  value: number;
}

export const BARTER_PORTFOLIO_KEY = "pe-barter-portfolio";

export const TIMELINE_LABELS: Record<TimelinePoint, string> = {
  day7: "Day 7",
  day30: "Day 30",
  day90: "Day 90",
};

export const TIMELINE_DESCRIPTIONS: Record<TimelinePoint, string> = {
  day7: "Most goods still available. Cash losing value. Skills undervalued.",
  day30: "Supply chains dead. Consumables scarce. Skills gaining real value.",
  day90: "Only durable goods and renewable skills matter. Production is king.",
};

export const GOODS_CATEGORIES = [
  "Water & Purification",
  "Food & Nutrition",
  "Medical & Hygiene",
  "Power & Fuel",
  "Tools & Hardware",
  "Defense & Comms",
  "Seeds & Agriculture",
] as const;

export const SKILLS_CATEGORIES = [
  "Medical",
  "Mechanical",
  "Electrical",
  "Construction",
  "Food Production",
  "Security",
  "Communications",
  "Teaching",
] as const;

export type GoodsCategory = (typeof GOODS_CATEGORIES)[number];
export type SkillsCategory = (typeof SKILLS_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  "Water & Purification": "#3b82f6",
  "Food & Nutrition": "#f59e0b",
  "Medical & Hygiene": "#ef4444",
  "Power & Fuel": "#8b5cf6",
  "Tools & Hardware": "#6b7280",
  "Defense & Comms": "#dc2626",
  "Seeds & Agriculture": "#22c55e",
  "Medical": "#ef4444",
  "Mechanical": "#f97316",
  "Electrical": "#eab308",
  "Construction": "#78716c",
  "Food Production": "#22c55e",
  "Security": "#dc2626",
  "Communications": "#3b82f6",
  "Teaching": "#a855f7",
};

export const TIER_THRESHOLDS = {
  vulnerable: 0,
  survivor: 20,
  trader: 40,
  broker: 65,
  kingpin: 85,
} as const;

export const TIER_LABELS: Record<PortfolioScore["tier"], string> = {
  vulnerable: "Vulnerable",
  survivor: "Survivor",
  trader: "Trader",
  broker: "Broker",
  kingpin: "Kingpin",
};

export const TIER_COLORS: Record<PortfolioScore["tier"], string> = {
  vulnerable: "#ef4444",
  survivor: "#f59e0b",
  trader: "#3b82f6",
  broker: "#8b5cf6",
  kingpin: "#22c55e",
};
