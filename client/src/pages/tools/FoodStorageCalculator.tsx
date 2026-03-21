import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Minus, Printer, Share2, ChevronDown, ChevronUp,
  ExternalLink, X, Users, Clock, AlertTriangle,
  CheckCircle, ShieldAlert, Package, Home, MessageSquarePlus, Send,
} from "lucide-react";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import PrintQrCode from "@/components/tools/PrintQrCode";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import { trackEvent } from "@/lib/analytics";
import InstallButton from "@/components/tools/InstallButton";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import {
  foodCategories,
  activityLevels,
  durationPresets,
  balancedFoodMix,
  generateShoppingList,
  productRecommendations,
  shelfLifeTiers,
  dataSources,
  allFoodItems,
  livingSituations,
  apartmentFoodTips,
  type ActivityLevel,
  type FoodItem,
  type ShoppingItem,
  type LivingSituation,
} from "./food-data";
import { useSEO } from "@/hooks/useSEO";

interface GroupConfig {
  males: number;
  females: number;
  children: number;
}

export default function FoodStorageCalculator() {
  const [group, setGroup] = useState<GroupConfig>({ males: 1, females: 1, children: 0 });
  const [durationDays, setDurationDays] = useState(30);
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["grains"]));
  const [showShareToast, setShowShareToast] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>("1m");
  const [livingSituation, setLivingSituation] = useState<LivingSituation>("house");

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestBrand, setRequestBrand] = useState("");
  const [requestShelfLife, setRequestShelfLife] = useState("");
  const [requestUrl, setRequestUrl] = useState("");
  const [requestStatus, setRequestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useSEO({
    title: "Food Storage Calculator",
    description: "Calculate your emergency food storage needs based on household size, duration, and activity level. Get a complete shopping list with quantities, costs, and shelf life estimates.",
  });

  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "food-storage" });
    const params = new URLSearchParams(window.location.search);
    const m = params.get("m");
    const f = params.get("f");
    const c = params.get("c");
    const d = params.get("d");
    const a = params.get("a");

    if (m || f || c) {
      setGroup({
        males: Math.max(0, Math.min(10, parseInt(m || "1") || 1)),
        females: Math.max(0, Math.min(10, parseInt(f || "1") || 1)),
        children: Math.max(0, Math.min(10, parseInt(c || "0") || 0)),
      });
    }
    if (d) {
      const days = Math.max(1, Math.min(730, parseInt(d) || 30));
      setDurationDays(days);
      const preset = durationPresets.find((p) => p.days === days);
      setActivePreset(preset ? preset.id : null);
    }
    if (a && ["sedentary", "moderate", "heavy"].includes(a)) {
      setActivity(a as ActivityLevel);
    }
    const ls = params.get("ls");
    if (ls && livingSituations.some((l) => l.id === ls)) setLivingSituation(ls as LivingSituation);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const data = { group, durationDays, activity, livingSituation, timestamp: Date.now() };
    localStorage.setItem("pe-food-calculator", JSON.stringify(data));
    setLastSaved(new Date());
  }, [group, durationDays, activity, livingSituation, initialized]);

  const adjustGroup = useCallback((key: keyof GroupConfig, delta: number) => {
    setGroup((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(10, prev[key] + delta)),
    }));
  }, []);

  const selectPreset = (presetId: string, days: number) => {
    setDurationDays(days);
    setActivePreset(presetId);
  };

  const handleDurationChange = (days: number) => {
    setDurationDays(days);
    const preset = durationPresets.find((p) => p.days === days);
    setActivePreset(preset ? preset.id : null);
  };

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const calculations = useMemo(() => {
    const profile = activityLevels.find((a) => a.id === activity) || activityLevels[1];
    const totalPeople = group.males + group.females + group.children;

    const dailyMaleCals = group.males * profile.maleCalories;
    const dailyFemaleCals = group.females * profile.femaleCalories;
    const dailyChildCals = group.children * profile.childCalories;
    const dailyTotalCals = dailyMaleCals + dailyFemaleCals + dailyChildCals;

    const totalCalories = dailyTotalCals * durationDays;

    const shoppingList = generateShoppingList(totalCalories, durationDays);

    const totalLbs = shoppingList.reduce((sum, item) => sum + item.lbs, 0);
    const totalCost = shoppingList.reduce((sum, item) => sum + item.costEstimate, 0);
    const totalCubicFt = shoppingList.reduce((sum, item) => sum + item.cubicFt, 0);
    const totalShoppingCals = shoppingList.reduce((sum, item) => sum + item.calories, 0);

    const categoryBreakdown = balancedFoodMix.map((mix) => ({
      label: mix.label,
      value: totalCalories * (mix.percent / 100),
      color: foodCategories.find((c) => c.id === mix.categoryId)?.color || "#6B7280",
    }));

    const costLow = totalCost * 0.7;
    const costHigh = totalCost * 1.4;

    const waterGallonsForCooking = Math.ceil(
      (totalCalories * 0.40) / 250 * 0.13
    );

    return {
      profile,
      totalPeople,
      dailyTotalCals,
      dailyMaleCals,
      dailyFemaleCals,
      dailyChildCals,
      totalCalories,
      shoppingList,
      totalLbs,
      totalCost,
      totalCubicFt,
      totalShoppingCals,
      categoryBreakdown,
      costLow,
      costHigh,
      waterGallonsForCooking,
    };
  }, [group, durationDays, activity]);

  const chartSegments = calculations.categoryBreakdown;

  const fmtCal = (cal: number) => {
    if (cal >= 1000000) return `${(cal / 1000000).toFixed(1)}M`;
    if (cal >= 1000) return `${(cal / 1000).toFixed(cal >= 10000 ? 0 : 1)}k`;
    return `${Math.round(cal)}`;
  };

  const fmtMoney = (amount: number) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${Math.round(amount)}`;
  };

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    let url = `${window.location.origin}${window.location.pathname}?m=${group.males}&f=${group.females}&c=${group.children}&d=${durationDays}&a=${activity}`;
    if (livingSituation !== "house") url += `&ls=${livingSituation}`;
    return url;
  }, [group, durationDays, activity, livingSituation]);

  const shareLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  const handlePrint = () => window.print();

  const submitFoodRequest = async () => {
    const name = requestName.trim();
    if (!name || name.length < 2) return;

    setRequestStatus("sending");
    try {
      const res = await fetch("/api/gear-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brand: requestBrand.trim() || undefined,
          category: requestShelfLife.trim() ? `shelf-life: ${requestShelfLife.trim()}` : "food-storage",
          amazonUrl: requestUrl.trim() || undefined,
          source: "food",
        }),
      });

      if (res.ok) {
        setRequestStatus("sent");
        setRequestName("");
        setRequestBrand("");
        setRequestShelfLife("");
        setRequestUrl("");
        setTimeout(() => {
          setRequestStatus("idle");
          setShowRequestForm(false);
        }, 4000);
      } else {
        const data = await res.json();
        console.error("Food request failed:", data.error);
        setRequestStatus("error");
        setTimeout(() => setRequestStatus("idle"), 3000);
      }
    } catch {
      setRequestStatus("error");
      setTimeout(() => setRequestStatus("idle"), 3000);
    }
  };

  const durationLabel = durationDays >= 365
    ? `${(durationDays / 365).toFixed(durationDays % 365 === 0 ? 0 : 1)} year${durationDays >= 730 ? "s" : ""}`
    : durationDays >= 30
      ? `${(durationDays / 30).toFixed(durationDays % 30 === 0 ? 0 : 1)} month${durationDays >= 60 ? "s" : ""}`
      : `${durationDays} day${durationDays !== 1 ? "s" : ""}`;

  return (
    <>
      <div className="print-only">
        <div className="print-header">
          <img src="/pe-badge.png" alt="Prepper Evolution" className="print-logo" />
          <div>
            <h2 className="print-title">Food Storage Calculator Results</h2>
            <p className="print-date">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        <div className="print-summary">
          <div className="print-summary-grid">
            <div>
              <span className="print-label">Total Calories</span>
              <span className="print-value">{fmtCal(calculations.totalCalories)} cal</span>
              <span className="print-sub">for {durationLabel}</span>
            </div>
            <div>
              <span className="print-label">Daily Need</span>
              <span className="print-value">{calculations.dailyTotalCals.toLocaleString()} cal</span>
              <span className="print-sub">{calculations.totalPeople} {calculations.totalPeople === 1 ? "person" : "people"}</span>
            </div>
            <div>
              <span className="print-label">Total Weight</span>
              <span className="print-value">{calculations.totalLbs} lbs</span>
              <span className="print-sub">{calculations.totalCubicFt.toFixed(1)} cu ft</span>
            </div>
            <div>
              <span className="print-label">Est. Cost</span>
              <span className="print-value">{fmtMoney(calculations.costLow)} - {fmtMoney(calculations.costHigh)}</span>
              <span className="print-sub">budget to premium</span>
            </div>
          </div>
        </div>

        <table className="print-gear-table">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Food Item</th>
              <th style={{ width: "15%", textAlign: "center" }}>Quantity</th>
              <th style={{ width: "15%", textAlign: "center" }}>Calories</th>
              <th style={{ width: "15%", textAlign: "center" }}>Shelf Life</th>
              <th style={{ width: "15%", textAlign: "right" }}>Est. Cost</th>
            </tr>
          </thead>
          <tbody>
            {calculations.shoppingList.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                <td style={{ textAlign: "center" }}>{item.calories.toLocaleString()}</td>
                <td style={{ textAlign: "center" }}>{item.shelfLifeYears}yr</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>${Math.round(item.costEstimate)}</td>
              </tr>
            ))}
            <tr className="print-total-row">
              <td colSpan={2} style={{ textAlign: "right", fontWeight: 700 }}>TOTAL</td>
              <td style={{ textAlign: "center", fontWeight: 700 }}>{calculations.totalShoppingCals.toLocaleString()} cal</td>
              <td />
              <td style={{ textAlign: "right", fontWeight: 700 }}>${Math.round(calculations.totalCost)}</td>
            </tr>
          </tbody>
        </table>

        <PrintQrCode url={getShareUrl()} />

        <p className="print-footer">
          Generated at prepperevolution.com/tools/food-storage-calculator &mdash; {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="min-h-screen bg-background pt-24 pb-20 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3" data-testid="text-free-tool">Free Tool</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4" data-testid="text-page-title">
              Food Storage <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-page-description">
              Calculate your emergency food storage needs based on household size, duration,
              and activity level. Get a complete shopping list with quantities, costs, and shelf life estimates.
              Based on USDA dietary guidelines and military nutrition standards.
            </p>
          </div>

          <div className="no-print mb-6">
            {/* Tool Title */}
            <div>
              <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Free Tool</p>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold">Food Storage <span className="text-primary">Calculator</span></h2>
                {lastSaved && (
                  <span className="text-xs text-muted-foreground">
                    Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* How This Tool Works */}
              <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-extrabold mb-3">How This Tool Works</h3>
                <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-3">
                  <p>
                    Tell us how many mouths you&apos;re feeding, how long you&apos;re planning for, and how hard everyone&apos;s working &mdash; we&apos;ll build you a complete shopping list with quantities, costs, and shelf life for every category. The math is based on USDA dietary guidelines and real calorie needs, not some generic &ldquo;just buy rice and beans&rdquo; advice.
                  </p>
                  <p>
                    <strong className="text-foreground">Bottom line:</strong> a 30-day food supply sounds overwhelming until you break it down category by category. This tool does that for you so you can shop smart, rotate stock, and never wonder if you actually have enough.
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wide">Your Household</h3>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Activity Level</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activityLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setActivity(level.id)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          activity === level.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        data-testid={`button-activity-${level.id}`}
                      >
                        <span className="text-sm font-bold block">{level.name}</span>
                        <span className="text-[11px] text-muted-foreground leading-snug">{level.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                    <Home className="w-3 h-3 inline mr-1" /> Living Situation
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {livingSituations.map((ls) => (
                      <button
                        key={ls.id}
                        onClick={() => setLivingSituation(ls.id)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          livingSituation === ls.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        data-testid={`button-living-${ls.id}`}
                      >
                        <span className="text-sm font-bold block">{ls.name}</span>
                        <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">{ls.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                      <Users className="w-3 h-3 inline mr-1" /> Adult Males
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustGroup("males", -1)}
                        className="w-9 h-9 rounded-md flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                        data-testid="button-males-decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-lg font-extrabold tabular-nums" data-testid="text-males-count">{group.males}</span>
                      <button
                        onClick={() => adjustGroup("males", 1)}
                        className="w-9 h-9 rounded-md flex items-center justify-center bg-primary text-primary-foreground transition-colors"
                        data-testid="button-males-increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {calculations.profile.maleCalories.toLocaleString()} cal/day each
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                      <Users className="w-3 h-3 inline mr-1" /> Adult Females
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustGroup("females", -1)}
                        className="w-9 h-9 rounded-md flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                        data-testid="button-females-decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-lg font-extrabold tabular-nums" data-testid="text-females-count">{group.females}</span>
                      <button
                        onClick={() => adjustGroup("females", 1)}
                        className="w-9 h-9 rounded-md flex items-center justify-center bg-primary text-primary-foreground transition-colors"
                        data-testid="button-females-increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {calculations.profile.femaleCalories.toLocaleString()} cal/day each
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                      <Users className="w-3 h-3 inline mr-1" /> Children (5-12)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustGroup("children", -1)}
                        className="w-9 h-9 rounded-md flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                        data-testid="button-children-decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-lg font-extrabold tabular-nums" data-testid="text-children-count">{group.children}</span>
                      <button
                        onClick={() => adjustGroup("children", 1)}
                        className="w-9 h-9 rounded-md flex items-center justify-center bg-primary text-primary-foreground transition-colors"
                        data-testid="button-children-increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {calculations.profile.childCalories.toLocaleString()} cal/day each
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                    <Clock className="w-3 h-3 inline mr-1" /> Storage Duration
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {durationPresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => selectPreset(preset.id, preset.days)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                          activePreset === preset.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted border border-border text-muted-foreground hover:border-primary/50"
                        }`}
                        data-testid={`button-preset-${preset.id}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="730"
                      value={durationDays}
                      onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                      className="flex-1 accent-primary h-1.5"
                      data-testid="input-duration-slider"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="730"
                        value={durationDays}
                        onChange={(e) => handleDurationChange(Math.max(1, Math.min(730, parseInt(e.target.value) || 1)))}
                        className="w-16 bg-background border border-border rounded px-2 py-1.5 text-sm text-center font-bold text-foreground focus:outline-none focus:border-primary"
                        data-testid="input-duration-number"
                      />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {durationLabel} of food storage for {calculations.totalPeople} {calculations.totalPeople === 1 ? "person" : "people"}
                  </p>
                </div>
              </div>

              {foodCategories.map((cat) => {
                const isExpanded = expandedCats.has(cat.id);
                const itemCount = cat.items.length;

                return (
                  <div key={cat.id} className="bg-card border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      aria-expanded={isExpanded}
                      data-testid={`toggle-category-${cat.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-bold text-sm uppercase tracking-wide">{cat.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border">
                        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground border-b border-border/50 bg-muted/30">
                          <div className="col-span-4">Item</div>
                          <div className="col-span-2 text-center">Cal/Serving</div>
                          <div className="col-span-2 text-center">Serving</div>
                          <div className="col-span-2 text-center">Shelf Life</div>
                          <div className="col-span-2 text-right">$/lb</div>
                        </div>
                        {cat.items.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border/50 last:border-b-0 text-sm items-center"
                          >
                            <div className="col-span-4">
                              <span className="text-foreground font-medium">{item.name}</span>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.shelfLifeNote}</p>
                            </div>
                            <div className="col-span-2 text-center font-mono tabular-nums text-foreground">
                              {item.caloriesPerServing}
                            </div>
                            <div className="col-span-2 text-center text-muted-foreground text-sm">
                              {item.servingSize}
                            </div>
                            <div className="col-span-2 text-center">
                              <span className={`text-sm font-bold ${
                                item.shelfLifeYears >= 20 ? "text-green-500" :
                                item.shelfLifeYears >= 5 ? "text-blue-400" :
                                item.shelfLifeYears >= 2 ? "text-yellow-500" :
                                "text-red-400"
                              }`}>
                                {item.shelfLifeYears >= 100 ? "Indef." : `${item.shelfLifeYears}yr`}
                              </span>
                            </div>
                            <div className="col-span-2 text-right font-mono tabular-nums text-muted-foreground">
                              ${item.costPerLb.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="text-sm font-bold uppercase tracking-wide mb-4">Shelf Life Timeline</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use First-In, First-Out (FIFO) rotation. Store in a cool, dry place (below 75F). Proper storage
                  with mylar bags and oxygen absorbers can dramatically extend shelf life.
                </p>
                <div className="space-y-3">
                  {shelfLifeTiers.map((tier) => (
                    <div key={tier.label} className="flex items-start gap-3">
                      <div className="shrink-0 w-16 text-right">
                        <span className="text-sm font-bold" style={{ color: tier.color }}>
                          {tier.years}
                        </span>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: tier.color }}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground">{tier.label}</span>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {tier.items.join(" / ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 no-print">
                <div className="flex items-start gap-3 mb-4">
                  <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Community Driven</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This calculator is community-driven. We&apos;re constantly adding products based on what
                      real preppers use. If a food product you rely on isn&apos;t listed, let us know.
                    </p>
                  </div>
                </div>

                {!showRequestForm ? (
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="w-full flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    data-testid="button-request-food"
                  >
                    <MessageSquarePlus className="w-4 h-4 text-primary" />
                    Don&apos;t See a Food Product? Request It
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wide text-primary">Request a Product</h4>
                      <button
                        onClick={() => { setShowRequestForm(false); setRequestStatus("idle"); }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close request form"
                        data-testid="button-close-request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {requestStatus === "sent" ? (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-green-500">Request Submitted!</p>
                        <p className="text-sm text-muted-foreground mt-1">We&apos;ll review it and add it if it fits. Thanks for helping us improve.</p>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={requestName}
                          onChange={(e) => setRequestName(e.target.value)}
                          placeholder="Product name *"
                          maxLength={100}
                          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                          aria-label="Product name"
                          data-testid="input-request-name"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={requestBrand}
                            onChange={(e) => setRequestBrand(e.target.value)}
                            placeholder="Brand (optional)"
                            maxLength={50}
                            className="bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                            aria-label="Brand name"
                            data-testid="input-request-brand"
                          />
                          <input
                            type="text"
                            value={requestShelfLife}
                            onChange={(e) => setRequestShelfLife(e.target.value)}
                            placeholder="Shelf life (optional)"
                            maxLength={50}
                            className="bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                            aria-label="Shelf life"
                            data-testid="input-request-shelf-life"
                          />
                        </div>

                        <input
                          type="text"
                          value={requestUrl}
                          onChange={(e) => setRequestUrl(e.target.value)}
                          placeholder="Amazon link (optional)"
                          maxLength={200}
                          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                          aria-label="Amazon product link"
                          data-testid="input-request-url"
                        />

                        <button
                          onClick={submitFoodRequest}
                          disabled={!requestName.trim() || requestName.trim().length < 2 || requestStatus === "sending"}
                          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-border disabled:text-muted-foreground text-primary-foreground font-bold py-3 rounded text-sm uppercase tracking-wide transition-colors"
                          data-testid="button-submit-request"
                        >
                          {requestStatus === "sending" ? (
                            "Submitting..."
                          ) : requestStatus === "error" ? (
                            "Something went wrong — try again"
                          ) : (
                            <><Send className="w-4 h-4" /> Submit Request</>
                          )}
                        </button>

                        <p className="text-xs text-muted-foreground/50 text-center">
                          All requests are reviewed before being added. We typically update weekly.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-muted rounded-lg p-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Data Sources &amp; References</h3>
                <ul className="space-y-1">
                  {dataSources.map((ds) => (
                    <li key={ds.name} className="text-sm text-muted-foreground">
                      {ds.url ? (
                        <a href={ds.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {ds.name}
                        </a>
                      ) : (
                        <span className="font-medium">{ds.name}</span>
                      )}
                      {" "}&mdash; {ds.note}
                    </li>
                  ))}
                </ul>
              </div>

              <DataPrivacyNotice />
              <SupportFooter />
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-none space-y-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                <div className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide">Food Storage Summary</h3>
                    <Package className="w-4 h-4 text-primary" />
                  </div>

                  {calculations.totalPeople === 0 ? (
                    <div className="text-center py-6">
                      <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground" data-testid="text-add-people">Add people to see your food storage needs</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center mb-2">
                        <DonutChart
                          segments={chartSegments}
                          totalLabel="Total Cal"
                          totalValue={`${fmtCal(calculations.totalCalories)}`}
                          size={180}
                        />
                      </div>
                      <ChartLegend segments={chartSegments} />
                    </>
                  )}

                  {calculations.totalPeople > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground uppercase">Daily Need</p>
                        <p className="text-lg font-extrabold" data-testid="text-daily-calories">{calculations.dailyTotalCals.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">calories/day</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase">Duration</p>
                        <p className="text-lg font-extrabold" data-testid="text-duration">{durationLabel}</p>
                        <p className="text-sm text-muted-foreground">{calculations.totalPeople} {calculations.totalPeople === 1 ? "person" : "people"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase">Total Weight</p>
                        <p className="text-lg font-extrabold text-primary" data-testid="text-total-weight">{calculations.totalLbs.toLocaleString()} lbs</p>
                        <p className="text-sm text-muted-foreground">{calculations.totalCubicFt.toFixed(1)} cubic ft</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase">Est. Cost</p>
                        <p className="text-lg font-extrabold text-primary" data-testid="text-est-cost">{fmtMoney(calculations.costLow)}-{fmtMoney(calculations.costHigh)}</p>
                        <p className="text-sm text-muted-foreground">budget to premium</p>
                      </div>
                    </div>
                  )}
                </div>

                {calculations.shoppingList.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Shopping List</h3>
                    <div className="space-y-2.5">
                      {calculations.shoppingList.map((item) => {
                        const pct = calculations.totalShoppingCals > 0
                          ? (item.calories / calculations.totalShoppingCals) * 100
                          : 0;
                        return (
                          <div key={item.name}>
                            <div className="flex items-center justify-between text-sm mb-0.5">
                              <span className="text-foreground font-medium truncate">{item.name}</span>
                              <span className="font-bold tabular-nums ml-2 text-muted-foreground">{item.quantity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                                ~${Math.round(item.costEstimate)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm font-bold">
                      <span>Total Est. Cost</span>
                      <span className="text-primary" data-testid="text-total-cost">{fmtMoney(calculations.costLow)} - {fmtMoney(calculations.costHigh)}</span>
                    </div>
                  </div>
                )}

                {calculations.totalPeople > 0 && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Storage Space</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total volume</span>
                        <span className="font-bold" data-testid="text-total-volume">{calculations.totalCubicFt.toFixed(1)} cu ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Approx. 5-gal buckets</span>
                        <span className="font-bold" data-testid="text-bucket-count">{Math.ceil(calculations.totalLbs / 35)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shelf space (2ft deep)</span>
                        <span className="font-bold">{(calculations.totalCubicFt / 2).toFixed(1)} ft of shelving</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cooking water needed</span>
                        <span className="font-bold">~{calculations.waterGallonsForCooking} gal</span>
                      </div>
                    </div>
                  </div>
                )}

                {livingSituation === "apartment" && calculations.totalPeople > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1">Apartment Storage Tips</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Your plan needs <strong className="text-foreground">{calculations.totalCubicFt.toFixed(1)} cu ft</strong> and{" "}
                          <strong className="text-foreground">{Math.round(calculations.totalLbs).toLocaleString()} lbs</strong> of food.
                          {calculations.totalCubicFt > 10 ? " That is a lot for an apartment — here is how to make it fit:" : " Here is how to optimize your space:"}
                        </p>
                        <ul className="space-y-1">
                          {apartmentFoodTips.slice(0, 5).map((tip, i) => (
                            <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                              <span className="text-primary shrink-0">&bull;</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {calculations.totalPeople > 0 && durationDays >= 90 && (
                  <div className="bg-[#EAB308]/10 border border-[#EAB308]/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#EAB308] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1">Long-Term Storage Tips</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>&bull; Store in cool, dry, dark location (50-70F ideal)</li>
                          <li>&bull; Use mylar bags + oxygen absorbers for grains and beans</li>
                          <li>&bull; Rotate short shelf-life items every 6-12 months</li>
                          <li>&bull; Don&apos;t forget water &mdash; 1 gallon per person per day minimum</li>
                          <li>&bull; Consider a multivitamin to cover micronutrient gaps</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {calculations.totalPeople > 0 && calculations.totalCalories > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1 text-green-500" data-testid="text-supply-label">
                          {durationDays <= 3 ? "72-Hour Kit" : durationDays <= 14 ? "2-Week Supply" : durationDays <= 30 ? "1-Month Supply" : durationDays <= 90 ? "3-Month Supply" : "Long-Term Storage"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {calculations.totalShoppingCals.toLocaleString()} total calories across {calculations.shoppingList.length} food categories.
                          That is {Math.round(calculations.totalShoppingCals / calculations.totalPeople / durationDays).toLocaleString()} cal/person/day.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {calculations.totalPeople > 0 && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Recommended Products</h3>
                    <div className="space-y-3">
                      {productRecommendations
                        .filter((p) => {
                          if (p.type === "storage" && durationDays >= 14) return true;
                          if (p.type === "food") return true;
                          return false;
                        })
                        .slice(0, 5)
                        .map((product) => (
                          <a
                            key={product.id}
                            href={product.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="block p-3 bg-muted rounded-md hover:bg-primary/5 transition-colors group"
                            data-testid={`link-product-${product.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-sm font-medium group-hover:text-primary transition-colors block">
                                  {product.name}
                                </span>
                                <span className="text-sm text-muted-foreground block mt-0.5">
                                  {product.desc} &mdash; {product.price}
                                </span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">{product.note}</p>
                          </a>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground/50 mt-3">
                      Affiliate links &mdash; we earn a commission at no extra cost to you.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-card transition-colors"
                    data-testid="button-print"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button
                    onClick={shareLink}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 text-sm font-bold uppercase tracking-wide transition-colors"
                    data-testid="button-share"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <InstallButton />
                </div>

                {showShareToast && (
                  <div className="bg-green-500/15 border border-green-500/30 text-green-500 text-sm rounded-lg p-3 text-center animate-fade-in-up" data-testid="text-share-toast">
                    Link copied to clipboard!
                  </div>
                )}

                <ToolSocialShare url={getShareUrl()} toolName="Food Storage Calculator" />

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">How We Calculate</h4>
                  <ul className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
                    <li>&bull; <strong className="text-foreground">Male adults:</strong> {calculations.profile.maleCalories.toLocaleString()} cal/day ({activity} activity)</li>
                    <li>&bull; <strong className="text-foreground">Female adults:</strong> {calculations.profile.femaleCalories.toLocaleString()} cal/day ({activity} activity)</li>
                    <li>&bull; <strong className="text-foreground">Children (5-12):</strong> {calculations.profile.childCalories.toLocaleString()} cal/day</li>
                    <li>&bull; <strong className="text-foreground">Balanced mix:</strong> 40% grains, 20% canned, 15% freeze-dried, 15% staples, 10% bars/MREs</li>
                    <li>&bull; Calorie data from <strong className="text-foreground">USDA</strong> and <strong className="text-foreground">US Army TB MED 507</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
