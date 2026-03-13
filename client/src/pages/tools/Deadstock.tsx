import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  Shield, ChevronRight, Lock, HardDrive, Trash2,
  AlertTriangle, TrendingUp, Share2, Download, Printer,
  Plus, Minus, ChevronDown, Package, Droplets, UtensilsCrossed,
  Zap, Radio, Tent, Activity, ArrowRight, RefreshCw,
  Eye, EyeOff, Calendar, Clock,
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
  DeadstockHousehold,
  DeadstockInventory,
  DeadstockResult,
  SupplyCategory,
} from "./deadstock-types";
import {
  DEADSTOCK_HOUSEHOLD_KEY,
  DEADSTOCK_INVENTORY_KEY,
  DEADSTOCK_RESULT_KEY,
  DEADSTOCK_SETUP_COMPLETE_KEY,
} from "./deadstock-types";
import { calculateAll, formatLastDay, dailyWaterNeed, dailyCalorieNeed } from "./deadstock-compute";
import { CATEGORY_META, STATUS_COLORS, statusFromDays } from "./deadstock-data";
import { VEHICLE_PROFILE_KEY } from "./vehicle-types";

type View = "landing" | "household" | "inventory" | "reveal" | "dashboard";

const DEFAULT_HOUSEHOLD: DeadstockHousehold = {
  adults: 2,
  children: 0,
  elderly: 0,
  pets: 0,
  zipCode: null,
  climateZone: null,
};

const DEFAULT_INVENTORY: DeadstockInventory = {
  water: { totalGallons: 0, hasFilter: false, hasPurification: false, items: [] },
  food: { estimatedDays: null, categories: null, items: [] },
  medical: { kitLevel: "none", prescriptionDays: 0, items: [] },
  power: { hasGenerator: false, hasSolar: false, generatorFuelGallons: 0, solarWh: 0, batteryBankWh: 0, items: [] },
  comms: { hasHamGmrs: false, hasAmFm: false, items: [] },
  gear: { shelterType: "none", fireMethodCount: 0, items: [] },
};

function Stepper({ value, onChange, min = 0, max = 20, label }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; label: string;
}) {
  return (
    <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-card border border-border text-foreground disabled:opacity-30 hover:border-primary/50 transition-colors"
          data-testid={`stepper-minus-${label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-lg font-extrabold text-foreground w-8 text-center" data-testid={`stepper-value-${label.toLowerCase().replace(/\s+/g, "-")}`}>
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-card border border-border text-foreground disabled:opacity-30 hover:border-primary/50 transition-colors"
          data-testid={`stepper-plus-${label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PrivacyBanner() {
  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4" data-testid="privacy-banner">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-400 mb-1">100% Private &mdash; Your Data Never Leaves Your Device</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deadstock stores everything in your browser's local storage. We do not collect, transmit, or store
            any of your inventory data on our servers. No account needed. No cloud sync.
            No tracking of what you own. Your supply data stays on YOUR device &mdash; period.
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-400">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            <span className="font-bold">
              Important: Clearing your browser cookies/history will permanently erase all your Deadstock data.
              There is no way to recover it.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutonomyClock({ days, animate = false }: { days: number; animate?: boolean }) {
  const [displayDays, setDisplayDays] = useState(animate ? 0 : days);

  useEffect(() => {
    if (!animate) { setDisplayDays(days); return; }
    setDisplayDays(0);
    const target = Math.min(days, 365);
    const duration = 2000;
    const steps = Math.max(target, 1);
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setDisplayDays(current);
      if (current >= target) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [days, animate]);

  const status = statusFromDays(displayDays);
  const color = STATUS_COLORS[status];

  return (
    <div className="text-center">
      <div className="text-7xl sm:text-9xl font-black tabular-nums" style={{ color }} data-testid="autonomy-clock-number">
        {displayDays}{days > 365 ? "+" : ""}
      </div>
      <div className="text-lg font-bold text-muted-foreground mt-1">
        DAYS OF AUTONOMY
      </div>
    </div>
  );
}

function CategoryBar({ category, days, maxDays }: { category: SupplyCategory; days: number; maxDays: number }) {
  const meta = CATEGORY_META[category];
  const status = statusFromDays(days);
  const pct = maxDays > 0 ? Math.min(100, (days / maxDays) * 100) : 0;

  return (
    <div className="space-y-1" data-testid={`category-bar-${category}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{meta.icon} {meta.label}</span>
        <span className="font-bold" style={{ color: STATUS_COLORS[status] }}>
          {Math.round(days)} days
        </span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(1, pct)}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: STATUS_COLORS[status] }}
        />
      </div>
    </div>
  );
}

export default function Deadstock() {
  useSEO({
    title: "Deadstock — Supply Lifecycle Manager | Ops Deck | Prepper Evolution",
    description: "Know your exact number. Deadstock calculates the precise day your household runs out of supplies. 100% private — your data never leaves your device.",
  });

  const [view, setView] = useState<View>("landing");
  const [household, setHousehold] = useState<DeadstockHousehold>(DEFAULT_HOUSEHOLD);
  const [inventory, setInventory] = useState<DeadstockInventory>(DEFAULT_INVENTORY);
  const [result, setResult] = useState<DeadstockResult | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<SupplyCategory | null>("water");
  const [foodMode, setFoodMode] = useState<"quick" | "detail">("quick");
  const [revealDone, setRevealDone] = useState(false);

  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "deadstock" });

    const savedHousehold = localStorage.getItem(DEADSTOCK_HOUSEHOLD_KEY);
    const savedInventory = localStorage.getItem(DEADSTOCK_INVENTORY_KEY);
    const setupDone = localStorage.getItem(DEADSTOCK_SETUP_COMPLETE_KEY);

    if (savedHousehold) {
      try { setHousehold(JSON.parse(savedHousehold)); } catch {}
    }
    if (savedInventory) {
      try { setInventory(JSON.parse(savedInventory)); } catch {}
    }

    const savedZip = localStorage.getItem("pe-zip");
    if (savedZip && !savedHousehold) {
      setHousehold((h) => ({ ...h, zipCode: savedZip }));
    }

    try {
      const vp = localStorage.getItem(VEHICLE_PROFILE_KEY);
      if (vp) {
        const profile = JSON.parse(vp);
        if (profile.fuel?.auxTankGal || profile.fuelTankGal) {
          setInventory((inv) => ({
            ...inv,
            power: {
              ...inv.power,
              generatorFuelGallons: inv.power.generatorFuelGallons || 0,
            },
          }));
        }
      }
    } catch {}

    try {
      const ps = localStorage.getItem("pe-power-system");
      if (ps) {
        const power = JSON.parse(ps);
        if (power.solarWatts || power.singleCapacityAh) {
          setInventory((inv) => ({
            ...inv,
            power: {
              ...inv.power,
              solarWh: inv.power.solarWh || (power.solarWatts * (power.peakSunHours || 5)) || 0,
              batteryBankWh: inv.power.batteryBankWh || ((power.singleCapacityAh || 0) * (power.batteryCount || 1) * 12.8) || 0,
              hasSolar: inv.power.hasSolar || (power.solarWatts > 0),
            },
          }));
        }
      }
    } catch {}

    if (setupDone === "true" && savedHousehold && savedInventory) {
      setView("dashboard");
    }
  }, []);

  useEffect(() => {
    if (view === "dashboard" || view === "reveal") {
      const r = calculateAll(household, inventory);
      setResult(r);
      localStorage.setItem(DEADSTOCK_RESULT_KEY, JSON.stringify(r));
    }
  }, [household, inventory, view]);

  const saveState = useCallback(() => {
    localStorage.setItem(DEADSTOCK_HOUSEHOLD_KEY, JSON.stringify(household));
    localStorage.setItem(DEADSTOCK_INVENTORY_KEY, JSON.stringify(inventory));
  }, [household, inventory]);

  const handleStartSetup = useCallback(() => {
    setView("household");
    trackEvent("pe_tool_started", { tool: "deadstock" });
  }, []);

  const handleHouseholdNext = useCallback(() => {
    saveState();
    setView("inventory");
  }, [saveState]);

  const handleInventoryNext = useCallback(() => {
    saveState();
    localStorage.setItem(DEADSTOCK_SETUP_COMPLETE_KEY, "true");
    setRevealDone(false);
    setView("reveal");
    trackEvent("pe_deadstock_reveal", { tool: "deadstock" });
  }, [saveState]);

  const handleRevealDone = useCallback(() => {
    setRevealDone(true);
    setView("dashboard");
  }, []);

  const handleRecalculate = useCallback(() => {
    setView("inventory");
  }, []);

  const handleReset = useCallback(() => {
    localStorage.removeItem(DEADSTOCK_HOUSEHOLD_KEY);
    localStorage.removeItem(DEADSTOCK_INVENTORY_KEY);
    localStorage.removeItem(DEADSTOCK_RESULT_KEY);
    localStorage.removeItem(DEADSTOCK_SETUP_COMPLETE_KEY);
    setHousehold(DEFAULT_HOUSEHOLD);
    setInventory(DEFAULT_INVENTORY);
    setResult(null);
    setView("landing");
    trackEvent("pe_deadstock_reset", {} as Record<string, never>);
  }, []);

  const updateInventory = useCallback(<K extends keyof DeadstockInventory>(
    category: K,
    updater: (prev: DeadstockInventory[K]) => DeadstockInventory[K],
  ) => {
    setInventory((prev) => ({ ...prev, [category]: updater(prev[category]) }));
  }, []);

  const maxCategoryDays = useMemo(() => {
    if (!result) return 90;
    return Math.max(90, ...result.categoryResults.map((r) => r.days));
  }, [result]);

  const donutSegments = useMemo(() => {
    if (!result) return [];
    return result.categoryResults.map((r) => ({
      label: CATEGORY_META[r.category].label,
      value: Math.max(0.5, r.days),
      color: CATEGORY_META[r.category].color,
    }));
  }, [result]);

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Deadstock — Supply Lifecycle Manager",
    description: "Know your exact number. Calculate the precise day your household becomes dependent on outside help.",
    url: "https://prepperevolution.com/tools/deadstock",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Organization", name: "Prepper Evolution", url: "https://prepperevolution.com" },
  };

  return (
    <>
      <div className="print-only">
        <div className="print-header">
          <img src="/images/pe-badge.png" alt="Prepper Evolution" className="print-logo" />
          <div>
            <h2 className="print-title">Deadstock — Supply Autonomy Report</h2>
            <p className="print-date">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>
        {result && (
          <div className="print-summary">
            <div className="print-summary-grid">
              <div>
                <span className="print-label">Autonomy Days</span>
                <span className="print-value">{result.autonomyDays}</span>
              </div>
              <div>
                <span className="print-label">Last Day</span>
                <span className="print-value">{formatLastDay(result.lastDay)}</span>
              </div>
              <div>
                <span className="print-label">Bottleneck</span>
                <span className="print-value">{CATEGORY_META[result.bottleneck].label}</span>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginTop: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
                  <th style={{ padding: "4px 8px" }}>Category</th>
                  <th style={{ padding: "4px 8px", textAlign: "right" }}>Days</th>
                  <th style={{ padding: "4px 8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.categoryResults.map((r) => (
                  <tr key={r.category} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "4px 8px" }}>{CATEGORY_META[r.category].icon} {r.label}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>{Math.round(r.days)}</td>
                    <td style={{ padding: "4px 8px" }}>{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <PrintQrCode url="https://prepperevolution.com/tools/deadstock" />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <div className="no-print">
        <AnimatePresence mode="wait">

          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center bg-background px-4"
            >
              <div className="max-w-xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                  <Package className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black mb-4">
                  Dead<span className="text-red-400">stock</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-2 font-bold">
                  How many days can your household survive without outside help?
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Most people think they have "about two weeks" of supplies.
                  The actual number is almost always worse. Find out yours in under 3 minutes.
                </p>

                <button
                  onClick={handleStartSetup}
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors"
                  data-testid="button-find-out"
                >
                  Find Out
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="mt-8">
                  <PrivacyBanner />
                </div>
              </div>
            </motion.div>
          )}

          {view === "household" && (
            <motion.div
              key="household"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="py-16 sm:py-20 bg-background"
            >
              <div className="max-w-lg mx-auto px-4">
                <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Step 1 of 2</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Who Are You Protecting?</h2>
                <p className="text-muted-foreground mb-6">
                  Tell us about your household so we can calculate daily needs accurately.
                </p>

                <div className="space-y-3 mb-6">
                  <Stepper label="Adults (18-64)" value={household.adults} onChange={(v) => setHousehold((h) => ({ ...h, adults: v }))} min={1} max={12} />
                  <Stepper label="Children (under 18)" value={household.children} onChange={(v) => setHousehold((h) => ({ ...h, children: v }))} max={10} />
                  <Stepper label="Elderly (65+)" value={household.elderly} onChange={(v) => setHousehold((h) => ({ ...h, elderly: v }))} max={8} />
                  <Stepper label="Pets" value={household.pets} onChange={(v) => setHousehold((h) => ({ ...h, pets: v }))} max={10} />
                </div>

                <div className="mb-6">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                    ZIP Code (for climate-adjusted water needs)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={household.zipCode || ""}
                    onChange={(e) => {
                      const zip = e.target.value.replace(/\D/g, "").slice(0, 5);
                      setHousehold((h) => ({ ...h, zipCode: zip || null }));
                    }}
                    placeholder="e.g. 85001"
                    className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none"
                    data-testid="input-zip"
                  />
                </div>

                <div className="bg-card border border-border rounded-lg p-4 mb-6">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Daily needs estimate:</strong>{" "}
                    ~{dailyWaterNeed(household).toFixed(1)} gal water &middot;{" "}
                    ~{dailyCalorieNeed(household).toLocaleString()} calories
                    <span className="block mt-1 text-[10px]">
                      Includes 15% stress multiplier per FEMA crisis planning guidelines.
                    </span>
                  </p>
                </div>

                <PrivacyBanner />

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleHouseholdNext}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl transition-colors"
                    data-testid="button-next-inventory"
                  >
                    Next: Your Supplies
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === "inventory" && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="py-16 sm:py-20 bg-background"
            >
              <div className="max-w-2xl mx-auto px-4">
                <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Step 2 of 2</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">What Do You Have?</h2>
                <p className="text-muted-foreground mb-1">
                  Rough estimates are fine. You can refine later. This takes about 2 minutes.
                </p>
                <p className="text-xs text-emerald-400 mb-6 flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  All data stays on this device. We never see it.
                </p>

                <div className="space-y-3">

                  <CategoryAccordion
                    category="water"
                    icon={<Droplets className="w-5 h-5" />}
                    expanded={expandedCategory === "water"}
                    onToggle={() => setExpandedCategory(expandedCategory === "water" ? null : "water")}
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                          Total Gallons Stored
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={inventory.water.totalGallons || ""}
                          onChange={(e) => updateInventory("water", (w) => ({ ...w, totalGallons: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                          min="0"
                          className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none"
                          data-testid="input-water-gallons"
                        />
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inventory.water.hasFilter}
                            onChange={(e) => updateInventory("water", (w) => ({ ...w, hasFilter: e.target.checked }))}
                            className="rounded"
                            data-testid="checkbox-water-filter"
                          />
                          Water filter (e.g. Sawyer, LifeStraw)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inventory.water.hasPurification}
                            onChange={(e) => updateInventory("water", (w) => ({ ...w, hasPurification: e.target.checked }))}
                            className="rounded"
                            data-testid="checkbox-water-purification"
                          />
                          Purification tablets/drops
                        </label>
                      </div>
                    </div>
                  </CategoryAccordion>

                  <CategoryAccordion
                    category="food"
                    icon={<UtensilsCrossed className="w-5 h-5" />}
                    expanded={expandedCategory === "food"}
                    onToggle={() => setExpandedCategory(expandedCategory === "food" ? null : "food")}
                  >
                    <div className="space-y-3">
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => setFoodMode("quick")}
                          className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${foodMode === "quick" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                          data-testid="button-food-quick"
                        >
                          Quick Estimate
                        </button>
                        <button
                          onClick={() => setFoodMode("detail")}
                          className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${foodMode === "detail" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                          data-testid="button-food-detail"
                        >
                          By Category
                        </button>
                      </div>

                      {foodMode === "quick" ? (
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                            Estimated Days of Food for Your Household
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={inventory.food.estimatedDays ?? ""}
                            onChange={(e) => updateInventory("food", (f) => ({ ...f, estimatedDays: parseInt(e.target.value) || null }))}
                            placeholder="e.g. 14"
                            min="0"
                            className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none"
                            data-testid="input-food-days"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">Best guess is fine. We'll refine later.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            ["grains", "Grains/Rice/Pasta (lbs)"],
                            ["protein", "Canned Meat/Protein (lbs)"],
                            ["canned", "Canned Goods (# cans)"],
                            ["freezeDried", "Freeze-Dried (lbs)"],
                            ["other", "Other Food (lbs)"],
                          ] as const).map(([key, label]) => (
                            <div key={key}>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                                {label}
                              </label>
                              <input
                                type="number"
                                inputMode="decimal"
                                value={inventory.food.categories?.[key] ?? ""}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  updateInventory("food", (f) => ({
                                    ...f,
                                    categories: {
                                      grains: f.categories?.grains ?? 0,
                                      protein: f.categories?.protein ?? 0,
                                      canned: f.categories?.canned ?? 0,
                                      freezeDried: f.categories?.freezeDried ?? 0,
                                      other: f.categories?.other ?? 0,
                                      [key]: val,
                                    },
                                  }));
                                }}
                                placeholder="0"
                                min="0"
                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none"
                                data-testid={`input-food-${key}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CategoryAccordion>

                  <CategoryAccordion
                    category="medical"
                    icon={<Activity className="w-5 h-5" />}
                    expanded={expandedCategory === "medical"}
                    onToggle={() => setExpandedCategory(expandedCategory === "medical" ? null : "medical")}
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                          First Aid Kit Level
                        </label>
                        <select
                          value={inventory.medical.kitLevel}
                          onChange={(e) => updateInventory("medical", (m) => ({ ...m, kitLevel: e.target.value as any }))}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none"
                          data-testid="select-medical-kit"
                        >
                          <option value="none">No first aid kit</option>
                          <option value="basic">Basic (band-aids, antiseptic, OTC meds)</option>
                          <option value="advanced">Advanced (suture kit, splint, Rx basics)</option>
                          <option value="trauma">Trauma (tourniquet, chest seal, hemostatic)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                          Prescription Medication Supply (days)
                        </label>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={inventory.medical.prescriptionDays || ""}
                          onChange={(e) => updateInventory("medical", (m) => ({ ...m, prescriptionDays: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                          min="0"
                          className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none"
                          data-testid="input-medical-rx"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">If anyone in your household depends on daily medication, this becomes your hard ceiling.</p>
                      </div>
                    </div>
                  </CategoryAccordion>

                  <CategoryAccordion
                    category="power"
                    icon={<Zap className="w-5 h-5" />}
                    expanded={expandedCategory === "power"}
                    onToggle={() => setExpandedCategory(expandedCategory === "power" ? null : "power")}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inventory.power.hasGenerator}
                            onChange={(e) => updateInventory("power", (p) => ({ ...p, hasGenerator: e.target.checked }))}
                            className="rounded"
                            data-testid="checkbox-generator"
                          />
                          Generator
                        </label>
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inventory.power.hasSolar}
                            onChange={(e) => updateInventory("power", (p) => ({ ...p, hasSolar: e.target.checked }))}
                            className="rounded"
                            data-testid="checkbox-solar"
                          />
                          Solar panels
                        </label>
                      </div>
                      {inventory.power.hasGenerator && (
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                            Generator Fuel Stored (gallons)
                          </label>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={inventory.power.generatorFuelGallons || ""}
                            onChange={(e) => updateInventory("power", (p) => ({ ...p, generatorFuelGallons: parseFloat(e.target.value) || 0 }))}
                            placeholder="0"
                            min="0"
                            className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none"
                            data-testid="input-generator-fuel"
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                          Battery Bank Capacity (Wh)
                        </label>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={inventory.power.batteryBankWh || ""}
                          onChange={(e) => updateInventory("power", (p) => ({ ...p, batteryBankWh: parseInt(e.target.value) || 0 }))}
                          placeholder="e.g. 2000"
                          min="0"
                          className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none"
                          data-testid="input-battery-wh"
                        />
                        {inventory.power.batteryBankWh > 0 && (
                          <p className="text-[10px] text-emerald-400 mt-1">Auto-imported from your Power System Builder</p>
                        )}
                      </div>
                    </div>
                  </CategoryAccordion>

                  <CategoryAccordion
                    category="comms"
                    icon={<Radio className="w-5 h-5" />}
                    expanded={expandedCategory === "comms"}
                    onToggle={() => setExpandedCategory(expandedCategory === "comms" ? null : "comms")}
                  >
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inventory.comms.hasHamGmrs}
                          onChange={(e) => updateInventory("comms", (c) => ({ ...c, hasHamGmrs: e.target.checked }))}
                          className="rounded"
                          data-testid="checkbox-ham"
                        />
                        Ham / GMRS radio
                      </label>
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inventory.comms.hasAmFm}
                          onChange={(e) => updateInventory("comms", (c) => ({ ...c, hasAmFm: e.target.checked }))}
                          className="rounded"
                          data-testid="checkbox-amfm"
                        />
                        Battery-powered AM/FM radio
                      </label>
                    </div>
                  </CategoryAccordion>

                  <CategoryAccordion
                    category="gear"
                    icon={<Tent className="w-5 h-5" />}
                    expanded={expandedCategory === "gear"}
                    onToggle={() => setExpandedCategory(expandedCategory === "gear" ? null : "gear")}
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                          Shelter Beyond Your Home
                        </label>
                        <select
                          value={inventory.gear.shelterType}
                          onChange={(e) => updateInventory("gear", (g) => ({ ...g, shelterType: e.target.value as any }))}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none"
                          data-testid="select-shelter"
                        >
                          <option value="none">None / home only</option>
                          <option value="tent">Tent</option>
                          <option value="tarp">Tarp / lean-to</option>
                          <option value="vehicle">Vehicle-based (car camping, RTT)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                          Fire Starting Methods
                        </label>
                        <Stepper
                          label="Redundant fire methods"
                          value={inventory.gear.fireMethodCount}
                          onChange={(v) => updateInventory("gear", (g) => ({ ...g, fireMethodCount: v }))}
                          max={5}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Lighter, ferro rod, matches, magnifying glass, etc.
                        </p>
                      </div>
                    </div>
                  </CategoryAccordion>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setView("household")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-back-household"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={handleInventoryNext}
                    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    data-testid="button-calculate"
                  >
                    Calculate My Number
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === "reveal" && result && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center bg-background px-4"
            >
              <div className="max-w-lg text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <AutonomyClock days={result.autonomyDays} animate />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2, duration: 0.6 }}
                  className="mt-6 space-y-4"
                >
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Your Last Day</p>
                    <p className="text-xl font-extrabold text-foreground" data-testid="text-last-day">
                      {formatLastDay(result.lastDay)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      If all supply chains stopped today, your household becomes fully dependent on outside help on this date.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Your Bottleneck</p>
                    <p className="text-lg font-extrabold text-red-400" data-testid="text-bottleneck">
                      {CATEGORY_META[result.bottleneck].icon} {CATEGORY_META[result.bottleneck].label} — {Math.round(result.categoryResults.find((r) => r.category === result.bottleneck)?.days ?? 0)} days
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is what runs out first. Everything else is limited by this category.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    {result.categoryResults.map((r) => (
                      <CategoryBar key={r.category} category={r.category} days={r.days} maxDays={maxCategoryDays} />
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3, duration: 0.5 }}
                  className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                  <button
                    onClick={handleRevealDone}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl transition-colors"
                    data-testid="button-view-dashboard"
                  >
                    View Full Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <ToolSocialShare
                    toolName={`I'm a ${result.autonomyDays}-day household. What's your number?`}
                    url="https://prepperevolution.com/tools/deadstock"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {view === "dashboard" && result && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 sm:py-20 bg-background"
            >
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Ops Deck</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold">
                      Dead<span className="text-red-400">stock</span>
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <InstallButton />
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-print"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                    <ToolSocialShare
                      toolName={`I'm a ${result.autonomyDays}-day household`}
                      url="https://prepperevolution.com/tools/deadstock"
                    />
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                  <div className="lg:col-span-2 space-y-6">

                    <div className="bg-card border border-border rounded-lg p-6" data-testid="autonomy-summary-card">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <AutonomyClock days={result.autonomyDays} />
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Your Last Day</p>
                          <p className="text-lg font-extrabold text-foreground" data-testid="dashboard-last-day">
                            {formatLastDay(result.lastDay)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Your bottleneck is <strong className="text-red-400">{CATEGORY_META[result.bottleneck].label}</strong> at{" "}
                            {Math.round(result.categoryResults.find((r) => r.category === result.bottleneck)?.days ?? 0)} days.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              onClick={handleRecalculate}
                              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                              data-testid="button-update-supplies"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Update Supplies
                            </button>
                            <button
                              onClick={handleReset}
                              className="text-xs font-bold text-muted-foreground/50 hover:text-red-400 transition-colors flex items-center gap-1"
                              data-testid="button-reset-all"
                            >
                              <Trash2 className="w-3 h-3" />
                              Reset Everything
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 space-y-3" data-testid="category-breakdown-card">
                      <h3 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
                        Category Breakdown
                      </h3>
                      {result.categoryResults.map((r) => (
                        <div key={r.category}>
                          <CategoryBar category={r.category} days={r.days} maxDays={maxCategoryDays} />
                          <p className="text-[10px] text-muted-foreground mt-0.5 ml-6">{r.detail}</p>
                        </div>
                      ))}
                    </div>

                    {result.categoryResults.some((r) => r.status === "critical") && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4" data-testid="critical-warnings">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <h3 className="text-sm font-bold text-red-400">Critical Gaps</h3>
                        </div>
                        <div className="space-y-2">
                          {result.categoryResults
                            .filter((r) => r.status === "critical")
                            .map((r) => (
                              <div key={r.category} className="text-sm text-muted-foreground">
                                <strong className="text-foreground">{CATEGORY_META[r.category].icon} {r.label}:</strong>{" "}
                                {r.days <= 0
                                  ? "You have nothing in this category."
                                  : `Only ${Math.round(r.days)} day${r.days !== 1 ? "s" : ""}. This is dangerously low.`}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-card border border-border rounded-lg p-6" data-testid="improvement-suggestions">
                      <h3 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-3">
                        <TrendingUp className="w-3 h-3 inline -mt-0.5 mr-1" />
                        Quickest Improvements
                      </h3>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        {result.categoryResults
                          .sort((a, b) => a.days - b.days)
                          .slice(0, 3)
                          .map((r) => {
                            let suggestion = "";
                            if (r.category === "water") {
                              const gallonsNeeded = Math.ceil(dailyWaterNeed(household) * 14 - (inventory.water.totalGallons || 0));
                              suggestion = gallonsNeeded > 0
                                ? `Add ${gallonsNeeded} gallons of water storage to reach 14 days. A few cases of bottled water from the grocery store gets you started.`
                                : "Consider a water filter for renewable sourcing beyond stored supply.";
                            } else if (r.category === "food") {
                              suggestion = "Start with shelf-stable basics: rice, beans, canned protein. 20 lbs of rice gives a family of 4 roughly 10 extra days.";
                            } else if (r.category === "medical") {
                              suggestion = r.days <= 3
                                ? "A basic first aid kit from any pharmacy costs under $30 and covers most minor emergencies."
                                : "Ask your doctor about a 90-day prescription supply. Many insurers cover this.";
                            } else if (r.category === "power") {
                              suggestion = "A small portable power station (500Wh) keeps phones and lights running for 3-5 days.";
                            } else if (r.category === "comms") {
                              suggestion = "A battery-powered AM/FM radio costs under $20 and works when cell towers are down.";
                            } else {
                              suggestion = "A basic tarp shelter and a ferro rod + lighter give you redundant shelter and fire capability.";
                            }
                            return (
                              <div key={r.category} className="flex items-start gap-2">
                                <span className="text-lg">{CATEGORY_META[r.category].icon}</span>
                                <div>
                                  <strong className="text-foreground">{r.label} ({Math.round(r.days)} days):</strong>{" "}
                                  {suggestion}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">

                    <div className="bg-card border border-border rounded-lg p-4" data-testid="donut-chart-card">
                      <h3 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-3">
                        Supply Balance
                      </h3>
                      <div className="flex justify-center">
                        <div className="w-44 h-44">
                          <DonutChart
                            segments={donutSegments}
                            totalLabel="Autonomy"
                            totalValue={`${result.autonomyDays}d`}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <ChartLegend segments={donutSegments} />
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-4" data-testid="household-summary">
                      <h3 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
                        Household
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{household.adults} adult{household.adults !== 1 ? "s" : ""}</p>
                        {household.children > 0 && <p>{household.children} child{household.children !== 1 ? "ren" : ""}</p>}
                        {household.elderly > 0 && <p>{household.elderly} elderly</p>}
                        {household.pets > 0 && <p>{household.pets} pet{household.pets !== 1 ? "s" : ""}</p>}
                        {household.zipCode && <p>ZIP: {household.zipCode}</p>}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Daily: ~{dailyWaterNeed(household).toFixed(1)} gal water &middot; ~{dailyCalorieNeed(household).toLocaleString()} cal
                      </p>
                    </div>

                    <PrivacyBanner />

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4" data-testid="data-warning">
                      <div className="flex items-start gap-2">
                        <HardDrive className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-bold text-amber-400 mb-1">Your Data = Your Responsibility</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Everything is stored in your browser's local storage on this device only.
                            We have <strong>zero access</strong> to your inventory, household size, or
                            any data you enter here. This also means:
                          </p>
                          <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                            <li>Clearing cookies/history <strong>permanently erases</strong> your data</li>
                            <li>Your data does not sync between devices</li>
                            <li>We cannot recover your data if it's deleted</li>
                            <li>Print or export your report as a backup</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-w-3xl mt-16 space-y-8">
                  <section>
                    <h2 className="text-2xl font-extrabold mb-4">
                      Why "About Two Weeks" Is Almost Always Wrong
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      When people estimate their supply depth, they count food and nothing else.
                      But your real autonomy is limited by your weakest category &mdash; and
                      it's almost never food. Water runs out first for most households because
                      people drastically underestimate daily consumption, especially in hot climates
                      or under physical stress.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Medical supplies are the other blind spot. If anyone in your household depends
                      on daily prescription medication, your entire autonomy clock is capped at
                      however many days of medication you have on hand. A 90-day food supply means
                      nothing if your blood pressure medication runs out on Day 7.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-extrabold mb-4">
                      How Deadstock Calculates Your Number
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Your Autonomy Clock shows the number of days your household can function
                      without any outside supply chain. It's calculated as the <strong>minimum</strong> across
                      your three core categories: water, food, and medical. Power, comms, and gear
                      contribute to your overall readiness but don't cap your survival the way
                      water and calories do.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Water calculations follow FEMA guidelines (1 gallon per adult per day) adjusted
                      for your climate zone and a 15% stress multiplier. Food calculations use USDA
                      caloric requirements by age group. If you have a water filter, we add a
                      renewable sourcing bonus. All calculations are conservative because in a real
                      emergency, conservative keeps you alive.
                    </p>
                  </section>
                </div>

                <div className="mt-8">
                  <DataPrivacyNotice />
                  <SupportFooter />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
}

function CategoryAccordion({
  category,
  icon,
  expanded,
  onToggle,
  children,
}: {
  category: SupplyCategory;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const meta = CATEGORY_META[category];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden" data-testid={`accordion-${category}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: meta.color + "20", color: meta.color }}>
            {icon}
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-foreground">{meta.label}</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
