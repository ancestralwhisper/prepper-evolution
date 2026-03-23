import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  Repeat, ChevronDown, ChevronRight, ArrowRight,
  AlertTriangle, TrendingUp, TrendingDown, Minus as MinusIcon,
  Plus, Minus, Check, X, Clock, Shield, ShoppingCart,
  BookOpen, Lightbulb, Package, Star, Info,
  CircleDot, ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { trackEvent } from "@/lib/analytics";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import PrintQrCode from "@/components/tools/PrintQrCode";
import InstallButton from "@/components/tools/InstallButton";
import ToolSocialShare from "@/components/tools/ToolSocialShare";

import type {
  TimelinePoint,
  PortfolioEntry,
  BarterPortfolio,
  PortfolioScore,
} from "./barter-types";
import {
  BARTER_PORTFOLIO_KEY,
  TIMELINE_LABELS,
  TIMELINE_DESCRIPTIONS,
  GOODS_CATEGORIES,
  SKILLS_CATEGORIES,
  CATEGORY_COLORS,
  TIER_LABELS,
  TIER_COLORS,
} from "./barter-types";
import type { BarterItem } from "./barter-types";
import { GOODS, SKILLS } from "./barter-data";
import {
  calculatePortfolioValue,
  getTradeRecommendations,
  getAllSkillDependencies,
  getValueTrend,
  calculateROI,
  getTopItems,
  getTradeSuggestions,
} from "./barter-compute";
import { GuidedTour } from "./GuidedTour";

const BARTER_TOUR = [
  { title: "Your Inventory", body: "Add items from your preps that have barter value — ammo, food, fuel, medical supplies, tools. The estimator applies realistic trade values for each category." },
  { title: "Trade Environment", body: "Set how many days into a disruption you're calculating for. Barter values shift dramatically between week 1 (survival mode) and month 3 (new equilibrium forming)." },
  { title: "Read Your Trade Position", body: "The results show your estimated barter position and which items carry the most value. Focus your stockpiling on high-value items that are easy to trade in small amounts." },
];

// ─── Constants ──────────────────────────────────────────────────────────────────

const TIMELINE_OPTIONS: TimelinePoint[] = ["day7", "day30", "day90"];

const PRIORITY_COLORS = {
  critical: "text-red-500",
  high: "text-amber-500",
  medium: "text-blue-400",
  low: "text-muted-foreground",
};

const PRIORITY_BG = {
  critical: "bg-red-500/10 border-red-500/30",
  high: "bg-amber-500/10 border-amber-500/30",
  medium: "bg-blue-500/10 border-blue-500/30",
  low: "bg-muted border-border",
};

const DEP_STATUS_COLORS = {
  ready: "text-green-500",
  limited: "text-amber-500",
  blocked: "text-red-500",
};

const DEP_STATUS_BG = {
  ready: "bg-green-500/10",
  limited: "bg-amber-500/10",
  blocked: "bg-red-500/10",
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

function ValueBar({ value, maxValue = 10, color }: { value: number; maxValue?: number; color?: string }) {
  const pct = Math.min(100, (value / maxValue) * 100);
  const barColor = color ?? (value >= 8 ? "#22c55e" : value >= 5 ? "#f59e0b" : "#6b7280");
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums w-6 text-right" style={{ color: barColor }}>
        {value}
      </span>
    </div>
  );
}

function TrendIndicator({ day7, day30, day90 }: { day7: number; day30: number; day90: number }) {
  const trend90vs7 = day90 - day7;
  if (trend90vs7 > 2) return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
  if (trend90vs7 < -2) return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
  return <MinusIcon className="w-3.5 h-3.5 text-muted-foreground" />;
}

function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-card border border-border text-foreground disabled:opacity-30 hover:border-primary/50 transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="text-sm font-bold tabular-nums w-6 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-card border border-border text-foreground disabled:opacity-30 hover:border-primary/50 transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold">{title}</h2>
          {badge && (
            <span className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function CollapsibleCategory({
  title,
  color,
  isOpen,
  onToggle,
  children,
  count,
}: {
  title: string;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-bold">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="text-xs font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function BarterEstimator() {
  useSEO({
    title: "Barter & Trade Value Estimator | Ops Deck | Prepper Evolution",
    description:
      "Estimate post-collapse trade values for 100+ items and 30+ skills across 3 timeline phases. Find the best ROI gear to stockpile and build optimized barter kits.",
  });

  // ── State ───────────────────────────────────────────────────────────────────
  const [timepoint, setTimepoint] = useState<TimelinePoint>("day30");
  const [goodsEntries, setGoodsEntries] = useState<PortfolioEntry[]>([]);
  const [ownedSkills, setOwnedSkills] = useState<string[]>([]);
  const [expandedGoodsCategories, setExpandedGoodsCategories] = useState<Set<string>>(new Set());
  const [expandedSkillCategories, setExpandedSkillCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"goods" | "skills" | "results">("goods");
  const [showROI, setShowROI] = useState(false);

  // ── Load from localStorage ──────────────────────────────────────────────────
  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "barter-estimator" });

    const saved = localStorage.getItem(BARTER_PORTFOLIO_KEY);
    if (saved) {
      try {
        const portfolio: BarterPortfolio = JSON.parse(saved);
        setGoodsEntries(portfolio.goods ?? []);
        setOwnedSkills(portfolio.skills ?? []);
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  // ── Save to localStorage ────────────────────────────────────────────────────
  const savePortfolio = useCallback(
    (goods: PortfolioEntry[], skills: string[]) => {
      const portfolio: BarterPortfolio = {
        goods,
        skills,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(BARTER_PORTFOLIO_KEY, JSON.stringify(portfolio));
    },
    []
  );

  // ── Goods management ────────────────────────────────────────────────────────
  const updateGoodQuantity = useCallback(
    (itemId: string, quantity: number) => {
      setGoodsEntries((prev) => {
        const existing = prev.find((g) => g.itemId === itemId);
        let next: PortfolioEntry[];
        if (existing) {
          next = prev.map((g) => (g.itemId === itemId ? { ...g, quantity } : g));
        } else {
          next = [...prev, { itemId, quantity }];
        }
        // Remove zero-quantity entries for cleanliness (but keep them in UI as 0)
        savePortfolio(next, ownedSkills);
        return next;
      });
    },
    [ownedSkills, savePortfolio]
  );

  const getGoodQuantity = useCallback(
    (itemId: string): number => {
      return goodsEntries.find((g) => g.itemId === itemId)?.quantity ?? 0;
    },
    [goodsEntries]
  );

  // ── Skills management ───────────────────────────────────────────────────────
  const toggleSkill = useCallback(
    (skillId: string) => {
      setOwnedSkills((prev) => {
        const next = prev.includes(skillId)
          ? prev.filter((id) => id !== skillId)
          : [...prev, skillId];
        savePortfolio(goodsEntries, next);
        return next;
      });
    },
    [goodsEntries, savePortfolio]
  );

  // ── Computed values ─────────────────────────────────────────────────────────
  const portfolioScore = useMemo(
    () => calculatePortfolioValue(goodsEntries, ownedSkills, timepoint),
    [goodsEntries, ownedSkills, timepoint]
  );

  const recommendations = useMemo(
    () => getTradeRecommendations(goodsEntries, ownedSkills),
    [goodsEntries, ownedSkills]
  );

  const ownedGoodIds = useMemo(
    () => new Set(goodsEntries.filter((g) => g.quantity > 0).map((g) => g.itemId)),
    [goodsEntries]
  );

  const skillDependencies = useMemo(
    () => getAllSkillDependencies(ownedSkills, ownedGoodIds),
    [ownedSkills, ownedGoodIds]
  );

  const topItems = useMemo(() => getTopItems(timepoint, 10), [timepoint]);

  const tradeSuggestions = useMemo(
    () => getTradeSuggestions(goodsEntries, timepoint),
    [goodsEntries, timepoint]
  );

  const roiItems = useMemo(() => calculateROI().slice(0, 15), []);

  const donutSegments = useMemo(
    () =>
      portfolioScore.categoryBreakdown.map((cat) => ({
        label: cat.category,
        value: cat.score,
        color: cat.color,
      })),
    [portfolioScore.categoryBreakdown]
  );

  const goodsCount = goodsEntries.filter((g) => g.quantity > 0).length;
  const skillsCount = ownedSkills.length;
  const totalCount = goodsCount + skillsCount;

  // ── Category toggle helpers ─────────────────────────────────────────────────
  const toggleGoodsCategory = (cat: string) => {
    setExpandedGoodsCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleSkillCategory = (cat: string) => {
    setExpandedSkillCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const goodsByCategory = useMemo(() => {
    const map = new Map<string, BarterItem[]>();
    for (const cat of GOODS_CATEGORIES) map.set(cat, []);
    for (const item of GOODS) {
      const list = map.get(item.category);
      if (list) list.push(item);
    }
    return map;
  }, []);

  const skillsByCategory = useMemo(() => {
    const map = new Map<string, BarterItem[]>();
    for (const cat of SKILLS_CATEGORIES) map.set(cat, []);
    for (const item of SKILLS) {
      const list = map.get(item.category);
      if (list) list.push(item);
    }
    return map;
  }, []);

  const categoryGoodsCount = useCallback(
    (category: string): number => {
      const items = goodsByCategory.get(category) ?? [];
      return items.filter((item) => getGoodQuantity(item.id) > 0).length;
    },
    [goodsByCategory, getGoodQuantity]
  );

  const categorySkillsCount = useCallback(
    (category: string): number => {
      const items = skillsByCategory.get(category) ?? [];
      return items.filter((item) => ownedSkills.includes(item.id)).length;
    },
    [skillsByCategory, ownedSkills]
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-card to-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
          >
            <ArrowRight className="w-3 h-3 rotate-180" /> All Tools
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Repeat className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Barter & Trade Value <span className="text-primary">Estimator</span>
              </h1>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed max-w-2xl">
                Estimate post-collapse trade values based on real data from Venezuela, Argentina, Yugoslavia, and
                post-Katrina economies. Build your trade portfolio and find the best ROI items to stockpile today.
              </p>
            </div>
          </div>

          <GuidedTour steps={BARTER_TOUR} toolName="Barter Estimator walkthrough" />

          {/* Timeline Slider */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wide">Collapse Timeline</h3>
            </div>
            <div className="flex gap-2">
              {TIMELINE_OPTIONS.map((tp) => (
                <button
                  key={tp}
                  onClick={() => {
                    setTimepoint(tp);
                    trackEvent("pe_gear_added", {
                      tool: "barter-estimator",
                      item: tp,
                      category: "timeline",
                    });
                  }}
                  className={`flex-1 rounded-lg px-3 py-3 text-center transition-all ${
                    timepoint === tp
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  <div className="text-sm font-bold">{TIMELINE_LABELS[tp]}</div>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2 italic">
              {TIMELINE_DESCRIPTIONS[timepoint]}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Portfolio Score Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader
            icon={Star}
            title="Your Trade Portfolio"
            subtitle={`${totalCount} items/skills selected`}
          />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Score */}
            <div className="text-center">
              <div
                className="text-6xl sm:text-7xl font-black tabular-nums"
                style={{ color: TIER_COLORS[portfolioScore.tier] }}
              >
                {portfolioScore.totalScore}
              </div>
              <div className="text-sm font-bold text-muted-foreground mt-1">TRADE POWER SCORE</div>
              <div
                className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: `${TIER_COLORS[portfolioScore.tier]}20`,
                  color: TIER_COLORS[portfolioScore.tier],
                }}
              >
                {TIER_LABELS[portfolioScore.tier]}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
                <span>
                  Goods:{" "}
                  <strong className="text-foreground">{portfolioScore.goodsScore} pts</strong>
                </span>
                <span>
                  Skills:{" "}
                  <strong className="text-foreground">{portfolioScore.skillsScore} pts</strong>
                </span>
              </div>
            </div>

            {/* Donut */}
            <div className="flex flex-col items-center">
              {donutSegments.length > 0 ? (
                <>
                  <DonutChart
                    segments={donutSegments}
                    totalLabel="Categories"
                    totalValue={`${donutSegments.length}`}
                    size={160}
                  />
                  <ChartLegend segments={donutSegments} />
                </>
              ) : (
                <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                  Add goods or skills to see your portfolio breakdown
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          {(["goods", "skills", "results"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide text-center transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "goods" && `Goods (${goodsCount})`}
              {tab === "skills" && `Skills (${skillsCount})`}
              {tab === "results" && "Analysis"}
            </button>
          ))}
        </div>

        {/* ── GOODS TAB ──────────────────────────────────────────────────────── */}
        {activeTab === "goods" && (
          <div className="space-y-3">
            <SectionHeader
              icon={Package}
              title="Your Goods Inventory"
              subtitle="Set quantities for items you have stockpiled. Values update based on timeline."
            />
            {Array.from(GOODS_CATEGORIES).map((category) => {
              const items = goodsByCategory.get(category) ?? [];
              const count = categoryGoodsCount(category);
              return (
                <CollapsibleCategory
                  key={category}
                  title={category}
                  color={CATEGORY_COLORS[category] ?? "#6b7280"}
                  isOpen={expandedGoodsCategories.has(category)}
                  onToggle={() => toggleGoodsCategory(category)}
                  count={count}
                >
                  {items.map((item) => {
                    const qty = getGoodQuantity(item.id);
                    const value =
                      timepoint === "day7"
                        ? item.valueDay7
                        : timepoint === "day30"
                        ? item.valueDay30
                        : item.valueDay90;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          qty > 0 ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{item.name}</span>
                            {item.consumable && (
                              <span className="text-[9px] font-bold uppercase text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded flex-shrink-0">
                                Depletes
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <ValueBar value={value} />
                            <TrendIndicator
                              day7={item.valueDay7}
                              day30={item.valueDay30}
                              day90={item.valueDay90}
                            />
                          </div>
                        </div>
                        <QuantityStepper
                          value={qty}
                          onChange={(v) => updateGoodQuantity(item.id, v)}
                        />
                      </div>
                    );
                  })}
                </CollapsibleCategory>
              );
            })}
          </div>
        )}

        {/* ── SKILLS TAB ─────────────────────────────────────────────────────── */}
        {activeTab === "skills" && (
          <div className="space-y-3">
            <SectionHeader
              icon={BookOpen}
              title="Your Skills"
              subtitle="Check off skills you have. Skills are renewable — they never run out, so they get a trade value bonus."
            />
            {Array.from(SKILLS_CATEGORIES).map((category) => {
              const items = skillsByCategory.get(category) ?? [];
              const count = categorySkillsCount(category);
              return (
                <CollapsibleCategory
                  key={category}
                  title={category}
                  color={CATEGORY_COLORS[category] ?? "#6b7280"}
                  isOpen={expandedSkillCategories.has(category)}
                  onToggle={() => toggleSkillCategory(category)}
                  count={count}
                >
                  {items.map((skill) => {
                    const isOwned = ownedSkills.includes(skill.id);
                    const value =
                      timepoint === "day7"
                        ? skill.valueDay7
                        : timepoint === "day30"
                        ? skill.valueDay30
                        : skill.valueDay90;
                    const depStatus = isOwned
                      ? skillDependencies.find((d) => d.skill.id === skill.id)
                      : null;

                    return (
                      <div
                        key={skill.id}
                        className={`p-2 rounded-lg transition-colors ${
                          isOwned ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleSkill(skill.id)}
                            className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                              isOwned
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {isOwned && <Check className="w-4 h-4" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{skill.name}</span>
                              {depStatus && depStatus.status !== "ready" && (
                                <span
                                  className={`text-[9px] font-bold uppercase px-1 py-0.5 rounded ${DEP_STATUS_BG[depStatus.status]} ${DEP_STATUS_COLORS[depStatus.status]}`}
                                >
                                  {depStatus.status}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{skill.description}</p>
                            <ValueBar value={value} />
                          </div>
                        </div>
                        {/* Dependency warnings */}
                        {depStatus && depStatus.unmet.length > 0 && (
                          <div className="mt-1.5 ml-9 flex items-start gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-500">
                              Needs: {depStatus.unmet.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CollapsibleCategory>
              );
            })}
          </div>
        )}

        {/* ── RESULTS TAB ────────────────────────────────────────────────────── */}
        {activeTab === "results" && (
          <div className="space-y-8">
            {/* Top Value Rankings */}
            <div className="bg-card border border-border rounded-lg p-5">
              <SectionHeader
                icon={TrendingUp}
                title="Top 10 Most Valuable Items"
                subtitle={`At ${TIMELINE_LABELS[timepoint]} — what commands the highest trade value`}
              />
              <div className="space-y-2">
                {topItems.map((item, i) => {
                  const value =
                    timepoint === "day7"
                      ? item.valueDay7
                      : timepoint === "day30"
                      ? item.valueDay30
                      : item.valueDay90;
                  const isOwned =
                    item.type === "good"
                      ? ownedGoodIds.has(item.id)
                      : ownedSkills.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        isOwned ? "bg-green-500/5 border border-green-500/20" : ""
                      }`}
                    >
                      <span className="text-sm font-bold text-muted-foreground w-5 text-right">
                        {i + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{item.name}</span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1 py-0.5 rounded ${
                              item.type === "skill"
                                ? "bg-purple-500/10 text-purple-500"
                                : "bg-blue-500/10 text-blue-500"
                            }`}
                          >
                            {item.type}
                          </span>
                          {isOwned && (
                            <span className="text-[9px] font-bold uppercase text-green-500 bg-green-500/10 px-1 py-0.5 rounded">
                              Owned
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-24">
                        <ValueBar value={value} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trade Suggestions */}
            {tradeSuggestions.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-5">
                <SectionHeader
                  icon={Repeat}
                  title="Your Trade Leverage"
                  subtitle={`What your inventory is worth at ${TIMELINE_LABELS[timepoint]}`}
                />
                <div className="space-y-2">
                  {tradeSuggestions.slice(0, 10).map(({ item, suggestion, value }) => (
                    <div key={item.id} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                      <CircleDot
                        className="w-3.5 h-3.5 flex-shrink-0 mt-1"
                        style={{ color: CATEGORY_COLORS[item.category] ?? "#6b7280" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{suggestion}</p>
                      </div>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">{value}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-5">
                <SectionHeader
                  icon={Lightbulb}
                  title="Gap Analysis & Recommendations"
                  subtitle="What you are missing — prioritized by importance"
                />
                <div className="space-y-2">
                  {recommendations.slice(0, 8).map((rec) => (
                    <div
                      key={rec.item.id}
                      className={`p-3 rounded-lg border ${PRIORITY_BG[rec.priority]}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold uppercase tracking-wide ${PRIORITY_COLORS[rec.priority]}`}
                        >
                          {rec.priority}
                        </span>
                        <span className="text-sm font-bold">{rec.item.name}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">
                          ({rec.item.type})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      {rec.item.asin && (
                        <a
                          href={`https://www.amazon.com/dp/${rec.item.asin}?tag=prepperevo-20`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary font-bold mt-1.5 hover:underline"
                          onClick={() =>
                            trackEvent("pe_affiliate_click", {
                              tool: "barter-estimator",
                              product: rec.item.name,
                              url: `https://www.amazon.com/dp/${rec.item.asin}?tag=prepperevo-20`,
                            })
                          }
                        >
                          Check price on Amazon <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Dependencies */}
            {skillDependencies.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-5">
                <SectionHeader
                  icon={Shield}
                  title="Skill Dependency Check"
                  subtitle="Do you have the gear to actually USE your skills?"
                />
                <div className="space-y-2">
                  {skillDependencies.map((dep) => (
                    <div
                      key={dep.skill.id}
                      className={`p-3 rounded-lg ${DEP_STATUS_BG[dep.status]}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-bold ${DEP_STATUS_COLORS[dep.status]}`}>
                          {dep.status === "ready" ? "Ready" : dep.status === "limited" ? "Limited" : "Blocked"}
                        </span>
                        <span className="text-sm font-medium">{dep.skill.name}</span>
                      </div>
                      {dep.met.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {dep.met.map((d) => (
                            <span
                              key={d}
                              className="text-xs bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded"
                            >
                              <Check className="w-2.5 h-2.5 inline mr-0.5" />
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                      {dep.unmet.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {dep.unmet.map((d) => (
                            <span
                              key={d}
                              className="text-xs bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded"
                            >
                              <X className="w-2.5 h-2.5 inline mr-0.5" />
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROI Stockpile List */}
            <div className="bg-card border border-border rounded-lg p-5">
              <SectionHeader
                icon={ShoppingCart}
                title="Best ROI Stockpile List"
                subtitle="Buy these items NOW for maximum post-collapse trade value per dollar spent"
                badge="Smart Money"
              />
              <button
                onClick={() => setShowROI(!showROI)}
                className="flex items-center gap-2 text-sm text-primary font-bold mb-3"
              >
                {showROI ? "Hide list" : "Show list"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showROI ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {showROI && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      {roiItems.map((roi, i) => (
                        <div
                          key={roi.item.id}
                          className="flex items-center gap-3 p-2 bg-muted rounded-lg"
                        >
                          <span className="text-sm font-bold text-primary w-5 text-right">
                            {i + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{roi.item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ~${roi.retailPrice}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span>
                                Day 30: <strong className="text-foreground">{roi.day30Value}/10</strong>
                              </span>
                              <span>
                                Day 90: <strong className="text-foreground">{roi.day90Value}/10</strong>
                              </span>
                              <span>
                                ROI: <strong className="text-primary">{roi.roiScore}x</strong>
                              </span>
                            </div>
                          </div>
                          {roi.item.asin && (
                            <a
                              href={`https://www.amazon.com/dp/${roi.item.asin}?tag=prepperevo-20`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary font-bold hover:underline whitespace-nowrap flex items-center gap-0.5"
                              onClick={() =>
                                trackEvent("pe_affiliate_click", {
                                  tool: "barter-estimator",
                                  product: roi.item.name,
                                  url: `https://www.amazon.com/dp/${roi.item.asin}?tag=prepperevo-20`,
                                })
                              }
                            >
                              Amazon <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      Prices are approximate and may vary. ROI score = (Day 30 value x Day 90 multiplier) / retail cost.
                      Higher = better investment for trade purposes.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Historical Context */}
            <div className="bg-card border border-border rounded-lg p-5">
              <SectionHeader
                icon={Info}
                title="Where These Numbers Come From"
                subtitle="Real data from real collapses"
              />
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  These trade values are not guesses. They are derived from documented barter economies during real
                  societal disruptions:
                </p>
                <ul className="space-y-1.5 list-none">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>
                      <strong className="text-foreground">Yugoslavia 1992-1995</strong> — Selco Begovic documented
                      that a BIC lighter was worth more than a gold ring. Antibiotics, ammunition, alcohol, and
                      batteries were the top currencies.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>
                      <strong className="text-foreground">Argentina 2001-2002</strong> — Trueque (barter) clubs
                      formed across the country. Canned food, cooking oil, and hygiene products were the most
                      traded items at organized fairs.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>
                      <strong className="text-foreground">Venezuela 2017-2020</strong> — Hyperinflation made
                      currency worthless. Antibiotics cost a month&apos;s salary. Bottled water exceeded gasoline prices.
                      Coffee and tobacco became de facto currencies.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <span>
                      <strong className="text-foreground">Post-Katrina 2005</strong> — Gasoline hit $10+/gallon.
                      Tarps were in massive demand. Generators commanded premium prices but became useless without fuel.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">5.</span>
                    <span>
                      <strong className="text-foreground">Lebanon 2020-2022</strong> — Currency lost 90% of value.
                      Fuel, medicine, and basic food staples became the real economy.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Cross-tool links */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/tools/deadstock"
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors group"
          >
            <Package className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <span className="text-sm font-bold group-hover:text-primary transition-colors">
                Deadstock — Know Your Timeline
              </span>
              <p className="text-[11px] text-muted-foreground">
                How many days until your household needs outside help?
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="/tools/shtf-simulator"
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors group"
          >
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <span className="text-sm font-bold group-hover:text-primary transition-colors">
                SHTF Simulator
              </span>
              <p className="text-[11px] text-muted-foreground">
                Test your decisions under pressure in realistic scenarios.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>

        {/* Share / Print */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ToolSocialShare
            url="https://prepperevolution.com/tools/barter-value-estimator"
            toolName="Barter & Trade Value Estimator"
          />
          <InstallButton />
        </div>

        <div className="only-print">
          <PrintQrCode url="https://prepperevolution.com/tools/barter-value-estimator" />
        </div>

        <DataPrivacyNotice />
        <SupportFooter />
      </div>
    </div>
  );
}
