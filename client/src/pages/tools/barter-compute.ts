import type {
  BarterItem,
  TimelinePoint,
  PortfolioEntry,
  PortfolioScore,
  TradeRecommendation,
  ROIItem,
  SkillDependencyStatus,
  ValueTrendPoint,
} from "./barter-types";
import { CATEGORY_COLORS, TIER_THRESHOLDS } from "./barter-types";
import { GOODS, SKILLS, ALL_ITEMS, ITEM_MAP } from "./barter-data";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getValueAtTimepoint(item: BarterItem, timepoint: TimelinePoint): number {
  switch (timepoint) {
    case "day7":
      return item.valueDay7;
    case "day30":
      return item.valueDay30;
    case "day90":
      return item.valueDay90;
  }
}

function getTierFromScore(score: number): PortfolioScore["tier"] {
  if (score >= TIER_THRESHOLDS.kingpin) return "kingpin";
  if (score >= TIER_THRESHOLDS.broker) return "broker";
  if (score >= TIER_THRESHOLDS.trader) return "trader";
  if (score >= TIER_THRESHOLDS.survivor) return "survivor";
  return "vulnerable";
}

// ─── Portfolio Value ────────────────────────────────────────────────────────────

/**
 * Calculate total portfolio trade power at a given timepoint.
 * Goods: value * quantity (diminishing returns after qty 5)
 * Skills: value * 1.5 (skills are renewable, so they get a bonus)
 */
export function calculatePortfolioValue(
  goods: PortfolioEntry[],
  skillIds: string[],
  timepoint: TimelinePoint
): PortfolioScore {
  let goodsScore = 0;
  let skillsScore = 0;
  const categoryMap = new Map<string, number>();

  // Score goods
  for (const entry of goods) {
    const item = ITEM_MAP.get(entry.itemId);
    if (!item || item.type !== "good") continue;

    const baseValue = getValueAtTimepoint(item, timepoint);
    // Diminishing returns: first 5 units at full value, after that at 50%
    const fullUnits = Math.min(entry.quantity, 5);
    const extraUnits = Math.max(0, entry.quantity - 5);
    const itemScore = baseValue * fullUnits + baseValue * 0.5 * extraUnits;
    goodsScore += itemScore;

    const prev = categoryMap.get(item.category) ?? 0;
    categoryMap.set(item.category, prev + itemScore);
  }

  // Score skills (renewable, so 1.5x multiplier)
  for (const skillId of skillIds) {
    const item = ITEM_MAP.get(skillId);
    if (!item || item.type !== "skill") continue;

    const baseValue = getValueAtTimepoint(item, timepoint);
    const itemScore = baseValue * 1.5;
    skillsScore += itemScore;

    const prev = categoryMap.get(item.category) ?? 0;
    categoryMap.set(item.category, prev + itemScore);
  }

  const rawTotal = goodsScore + skillsScore;

  // Normalize to 0-100 scale
  // Max possible: ~80 goods at avg value 7 * 5 qty = 2800 goods + 30 skills at avg 7 * 1.5 = 315 = ~3115
  // Realistic strong portfolio: ~500 points
  // We'll use a logarithmic scale so typical users see meaningful numbers
  const maxReasonable = 500;
  const totalScore = Math.min(100, Math.round((rawTotal / maxReasonable) * 100));

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, score]) => ({
      category,
      score: Math.round(score),
      color: CATEGORY_COLORS[category] ?? "#6b7280",
    }))
    .sort((a, b) => b.score - a.score);

  return {
    totalScore,
    goodsScore: Math.round(goodsScore),
    skillsScore: Math.round(skillsScore),
    categoryBreakdown,
    tier: getTierFromScore(totalScore),
  };
}

// ─── Trade Recommendations ──────────────────────────────────────────────────────

/**
 * Analyze the portfolio and suggest what to acquire based on gaps.
 */
export function getTradeRecommendations(
  goods: PortfolioEntry[],
  skillIds: string[]
): TradeRecommendation[] {
  const ownedGoodIds = new Set(goods.filter((g) => g.quantity > 0).map((g) => g.itemId));
  const ownedSkillIds = new Set(skillIds);
  const recommendations: TradeRecommendation[] = [];

  // Check for critical category gaps
  const goodsCategories = new Set<string>();
  for (const entry of goods) {
    if (entry.quantity > 0) {
      const item = ITEM_MAP.get(entry.itemId);
      if (item) goodsCategories.add(item.category);
    }
  }

  // Water gap
  const hasWater = goods.some(
    (g) =>
      g.quantity > 0 &&
      ITEM_MAP.get(g.itemId)?.category === "Water & Purification"
  );
  if (!hasWater) {
    const waterFilter = ITEM_MAP.get("g-water-filter-squeeze")!;
    recommendations.push({
      item: waterFilter,
      reason: "You have no water purification. This is the #1 survival priority.",
      priority: "critical",
    });
  }

  // Medical gap
  const hasMedical = goods.some(
    (g) =>
      g.quantity > 0 &&
      ITEM_MAP.get(g.itemId)?.category === "Medical & Hygiene"
  );
  if (!hasMedical) {
    const antibiotics = ITEM_MAP.get("g-antibiotics")!;
    recommendations.push({
      item: antibiotics,
      reason: "No medical supplies. Antibiotics are the #1 trade item in every documented collapse.",
      priority: "critical",
    });
  }

  // Fire gap
  const hasFireStarter = ownedGoodIds.has("g-lighters") || ownedGoodIds.has("g-matches-stormproof");
  if (!hasFireStarter) {
    const lighters = ITEM_MAP.get("g-lighters")!;
    recommendations.push({
      item: lighters,
      reason: "No fire-starting ability. BIC lighters are the cheapest, highest-value barter item you can stockpile.",
      priority: "critical",
    });
  }

  // High-value items the user doesn't own
  const highValueGoods = GOODS.filter(
    (g) => g.valueDay30 >= 7 && !ownedGoodIds.has(g.id)
  ).sort((a, b) => b.valueDay30 - a.valueDay30);

  for (const item of highValueGoods.slice(0, 5)) {
    if (recommendations.some((r) => r.item.id === item.id)) continue;
    recommendations.push({
      item,
      reason: `High trade value (${item.valueDay30}/10 at Day 30). ${item.tradesFor || ""}`,
      priority: "high",
    });
  }

  // High-value skills the user doesn't have
  const highValueSkills = SKILLS.filter(
    (s) => s.valueDay30 >= 6 && !ownedSkillIds.has(s.id)
  ).sort((a, b) => b.valueDay30 - a.valueDay30);

  for (const skill of highValueSkills.slice(0, 3)) {
    recommendations.push({
      item: skill,
      reason: `Skill value ${skill.valueDay30}/10 at Day 30. Skills are renewable — they never run out.`,
      priority: "medium",
    });
  }

  // Seeds if missing (critical at day 90)
  const hasSeeds = ownedGoodIds.has("g-seed-vault") || ownedGoodIds.has("g-seeds-individual");
  if (!hasSeeds) {
    const seedVault = ITEM_MAP.get("g-seed-vault")!;
    recommendations.push({
      item: seedVault,
      reason: "No seeds. At Day 90, when stockpiles run out, seeds ARE the food supply. Peak value item.",
      priority: "high",
    });
  }

  return recommendations.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });
}

// ─── Skill Dependencies ─────────────────────────────────────────────────────────

/**
 * Check which dependencies are met for a given skill based on owned goods.
 */
export function getSkillDependencyStatus(
  skillId: string,
  ownedGoodIds: Set<string>
): SkillDependencyStatus | null {
  const skill = ITEM_MAP.get(skillId);
  if (!skill || skill.type !== "skill") return null;

  const deps = skill.dependencies ?? [];
  if (deps.length === 0) {
    return { skill, met: [], unmet: [], status: "ready" };
  }

  // Map dependency descriptions to owned goods (fuzzy matching)
  const ownedNames = new Set<string>();
  for (const id of ownedGoodIds) {
    const item = ITEM_MAP.get(id);
    if (item) ownedNames.add(item.name.toLowerCase());
  }

  const met: string[] = [];
  const unmet: string[] = [];

  for (const dep of deps) {
    const depLower = dep.toLowerCase();
    // Check if any owned item name contains the dependency keyword
    const found = Array.from(ownedNames).some(
      (name) => name.includes(depLower) || depLower.includes(name.split(" ")[0])
    );
    if (found) {
      met.push(dep);
    } else {
      unmet.push(dep);
    }
  }

  const status: SkillDependencyStatus["status"] =
    unmet.length === 0 ? "ready" : unmet.length < deps.length ? "limited" : "blocked";

  return { skill, met, unmet, status };
}

/**
 * Get all skill dependency statuses for owned skills.
 */
export function getAllSkillDependencies(
  skillIds: string[],
  ownedGoodIds: Set<string>
): SkillDependencyStatus[] {
  return skillIds
    .map((id) => getSkillDependencyStatus(id, ownedGoodIds))
    .filter((s): s is SkillDependencyStatus => s !== null);
}

// ─── Value Trends ───────────────────────────────────────────────────────────────

/**
 * Get value trend across all three timepoints for an item.
 */
export function getValueTrend(itemId: string): ValueTrendPoint[] | null {
  const item = ITEM_MAP.get(itemId);
  if (!item) return null;

  return [
    { timepoint: "day7", label: "Day 7", value: item.valueDay7 },
    { timepoint: "day30", label: "Day 30", value: item.valueDay30 },
    { timepoint: "day90", label: "Day 90", value: item.valueDay90 },
  ];
}

// ─── ROI Calculation ────────────────────────────────────────────────────────────

/**
 * Calculate best bang-for-buck items to stockpile now.
 * ROI = (day30 trade value * 10) / retail price
 * Higher = better investment.
 */
export function calculateROI(): ROIItem[] {
  return GOODS.filter((g) => g.retailPrice && g.retailPrice > 0)
    .map((item) => {
      const retailPrice = item.retailPrice!;
      const roiScore = ((item.valueDay30 * 10) / retailPrice) * (item.valueDay90 / 10);
      return {
        item,
        retailPrice,
        day30Value: item.valueDay30,
        day90Value: item.valueDay90,
        roiScore: Math.round(roiScore * 100) / 100,
      };
    })
    .sort((a, b) => b.roiScore - a.roiScore);
}

// ─── Top Ranked Items ───────────────────────────────────────────────────────────

/**
 * Get top N most valuable items at a given timepoint.
 */
export function getTopItems(
  timepoint: TimelinePoint,
  limit: number = 10
): BarterItem[] {
  return [...ALL_ITEMS]
    .sort((a, b) => getValueAtTimepoint(b, timepoint) - getValueAtTimepoint(a, timepoint))
    .slice(0, limit);
}

/**
 * Get trade suggestion strings for owned items at current timepoint.
 */
export function getTradeSuggestions(
  goods: PortfolioEntry[],
  timepoint: TimelinePoint
): { item: BarterItem; suggestion: string; value: number }[] {
  return goods
    .filter((g) => g.quantity > 0)
    .map((g) => {
      const item = ITEM_MAP.get(g.itemId);
      if (!item) return null;
      const value = getValueAtTimepoint(item, timepoint);
      const suggestion = item.tradesFor
        ? `${item.name} (${g.quantity} ${item.unit || "units"}): ${item.tradesFor}`
        : `${item.name}: Trade value ${value}/10`;
      return { item, suggestion, value };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => b.value - a.value);
}
