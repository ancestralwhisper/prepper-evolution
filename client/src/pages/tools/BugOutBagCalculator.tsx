import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Minus, AlertTriangle, CheckCircle, Printer, Share2, ChevronDown, ChevronUp,
  ExternalLink, ShieldAlert, X, Package,
} from "lucide-react";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import {
  gearCategories,
  essentialItems,
  BODY_WEIGHT_DEFAULT, BODY_WEIGHT_MIN, BODY_WEIGHT_MAX,
  WARNING_PERCENT, CRITICAL_PERCENT,
  dataSources,
  type GearItem,
} from "./gear-data";
import { useSEO } from "@/hooks/useSEO";

interface SelectedGear {
  [id: string]: number;
}

interface CustomItem {
  id: string;
  name: string;
  weightOz: number;
  category: string;
}

export default function BugOutBagCalculator() {
  const [bodyWeight, setBodyWeight] = useState(BODY_WEIGHT_DEFAULT);
  const [selected, setSelected] = useState<SelectedGear>({});
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["pack"]));
  const [customName, setCustomName] = useState("");
  const [customWeightVal, setCustomWeightVal] = useState("");
  const [customCat, setCustomCat] = useState("misc");
  const [showShareToast, setShowShareToast] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useSEO({
    title: "Bug Out Bag Weight Calculator | Prepper Evolution",
    description: "Calculate your bug out bag weight, check if it exceeds safe limits, and get personalized gear recommendations. Based on US Army and FEMA guidelines.",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const w = params.get("w");
    const g = params.get("g");
    if (w) setBodyWeight(Math.max(BODY_WEIGHT_MIN, Math.min(BODY_WEIGHT_MAX, parseInt(w) || BODY_WEIGHT_DEFAULT)));
    if (g) {
      const gear: SelectedGear = {};
      g.split(",").forEach((entry) => {
        const [id, qty] = entry.split(":");
        if (id) gear[id] = parseInt(qty) || 1;
      });
      setSelected(gear);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const data = { bodyWeight, selected, customItems, timestamp: Date.now() };
    localStorage.setItem("pe-bob-calculator", JSON.stringify(data));
  }, [bodyWeight, selected, customItems, initialized]);

  const toggleItem = useCallback((id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  }, []);

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const addCustomItem = () => {
    const name = customName.trim();
    const weight = parseFloat(customWeightVal);
    if (!name || isNaN(weight) || weight <= 0) return;
    const id = `custom-${Date.now()}`;
    setCustomItems((prev) => [...prev, { id, name, weightOz: weight, category: customCat }]);
    setSelected((prev) => ({ ...prev, [id]: 1 }));
    setCustomName("");
    setCustomWeightVal("");
  };

  const removeCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const calculations = useMemo(() => {
    const allItems = [
      ...gearCategories.flatMap((c) => c.items),
      ...customItems.map((ci) => ({ ...ci, essential: false } as GearItem)),
    ];

    let totalOz = 0;
    const categoryWeights: Record<string, number> = {};
    const selectedItems: GearItem[] = [];

    for (const item of allItems) {
      if (selected[item.id]) {
        const qty = selected[item.id];
        const weight = item.weightOz * qty;
        totalOz += weight;
        categoryWeights[item.category] = (categoryWeights[item.category] || 0) + weight;
        selectedItems.push(item);
      }
    }

    const totalLbs = totalOz / 16;
    const pctBodyWeight = bodyWeight > 0 ? (totalLbs / bodyWeight) * 100 : 0;

    const missingEssentials = essentialItems.filter((e) => !selected[e.id]);

    const recommendations: GearItem[] = [];
    const hasWaterFilter = selected["sawyer-squeeze"] || selected["purification-tabs"] || selected["lifestraw"] || selected["lifestraw-peak"] || selected["katadyn-befree"] || selected["grayl-geopress"] || selected["osprey-reservoir"] || selected["platypus-bigzip"];
    const hasKnife = selected["esee4"] || selected["morakniv"] || selected["morakniv-bushcraft"] || selected["benchmade-bugout"];
    const hasBag = selected["rush72"] || selected["mystery-ranch"] || selected["goruck-rucker"] || selected["molle-ii"] || selected["helikon-raccoon"] || selected["osprey-atmos"] || selected["kelty-redwing"] || selected["maxpedition-falcon"] || selected["vertx-gamut"];
    const hasComms = selected["baofeng"] || selected["garmin-inreach"] || selected["midland-gxt"] || selected["midland-cb"] || selected["zoleo"] || selected["crank-radio"];

    if (!hasWaterFilter) {
      const item = allItems.find((i) => i.id === "sawyer-squeeze");
      if (item) recommendations.push(item);
    }
    if (!hasKnife) {
      const item = allItems.find((i) => i.id === "esee4");
      if (item) recommendations.push(item);
    }
    if (!hasBag) {
      const item = allItems.find((i) => i.id === "rush72");
      if (item) recommendations.push(item);
    }
    if (!hasComms) {
      const item = allItems.find((i) => i.id === "garmin-inreach");
      if (item) recommendations.push(item);
    }

    return {
      totalOz,
      totalLbs,
      pctBodyWeight,
      categoryWeights,
      selectedItems,
      missingEssentials,
      recommendations: recommendations.filter((r) => r.affiliateUrl),
      itemCount: Object.keys(selected).length,
    };
  }, [selected, customItems, bodyWeight]);

  const chartSegments = gearCategories.map((cat) => ({
    label: cat.name,
    value: calculations.categoryWeights[cat.id] || 0,
    color: cat.color,
  }));

  const customWeight2 = customItems.reduce(
    (sum, ci) => sum + (selected[ci.id] ? ci.weightOz : 0),
    0
  );
  const miscIdx = chartSegments.findIndex((s) => s.label === "Documents & Misc");
  if (miscIdx >= 0) chartSegments[miscIdx].value += customWeight2;

  const getStatusColor = () => {
    if (calculations.pctBodyWeight >= CRITICAL_PERCENT) return "text-red-500";
    if (calculations.pctBodyWeight >= WARNING_PERCENT) return "text-yellow-500";
    return "text-green-600 dark:text-green-500";
  };

  const getStatusLabel = () => {
    if (calculations.pctBodyWeight >= CRITICAL_PERCENT) return "Too Heavy";
    if (calculations.pctBodyWeight >= WARNING_PERCENT) return "Heavy";
    if (calculations.pctBodyWeight > 0) return "Good";
    return "Empty";
  };

  const shareLink = () => {
    const gearStr = Object.entries(selected)
      .map(([id, qty]) => `${id}:${qty}`)
      .join(",");
    const url = `${window.location.origin}${window.location.pathname}?w=${bodyWeight}&g=${gearStr}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  const handlePrint = () => window.print();

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Bug Out Bag Weight Calculator",
    description: "Calculate your bug out bag weight, check if it exceeds safe limits, and get personalized gear recommendations.",
    url: "https://prepperevolution.com/tools/bug-out-bag-calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Organization", name: "Prepper Evolution", url: "https://prepperevolution.com" },
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Free Tool</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
            Bug Out Bag <span className="text-primary">Weight Calculator</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Build your BOB from 40+ pre-loaded gear items, add your own custom gear,
            and see your total pack weight in real time. Warnings trigger when you exceed
            safe carry limits based on US Army load guidelines.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <label htmlFor="body-weight" className="block text-sm font-bold mb-3 uppercase tracking-wide">
                Your Body Weight (lbs)
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="body-weight"
                  type="range"
                  min={BODY_WEIGHT_MIN}
                  max={BODY_WEIGHT_MAX}
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(parseInt(e.target.value))}
                  className="flex-1 accent-primary h-2"
                  data-testid="input-body-weight-slider"
                />
                <input
                  type="number"
                  min={BODY_WEIGHT_MIN}
                  max={BODY_WEIGHT_MAX}
                  value={bodyWeight}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || BODY_WEIGHT_DEFAULT;
                    setBodyWeight(Math.max(BODY_WEIGHT_MIN, Math.min(BODY_WEIGHT_MAX, v)));
                  }}
                  className="w-20 bg-background border border-border rounded px-3 py-2 text-center font-bold text-foreground focus:outline-none focus:border-primary"
                  data-testid="input-body-weight-number"
                />
                <span className="text-muted-foreground text-sm">lbs</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                US Army recommends keeping pack weight under 30% of body weight for extended movement.
              </p>
            </div>

            {gearCategories.map((cat) => {
              const isExpanded = expandedCats.has(cat.id);
              const catWeight = calculations.categoryWeights[cat.id] || 0;
              const catCount = cat.items.filter((i) => selected[i.id]).length;

              return (
                <div key={cat.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    aria-expanded={isExpanded}
                    data-testid={`toggle-category-${cat.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-bold text-sm uppercase tracking-wide">{cat.name}</span>
                      {catCount > 0 && (
                        <span className="bg-primary/15 text-primary text-xs font-bold px-2 py-0.5 rounded">
                          {catCount} item{catCount !== 1 ? "s" : ""} / {(catWeight / 16).toFixed(1)} lbs
                        </span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border">
                      {cat.items.map((item) => {
                        const isSelected = !!selected[item.id];
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0 transition-colors ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                          >
                            <button
                              onClick={() => toggleItem(item.id)}
                              className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted border border-border text-muted-foreground hover:border-primary/50"
                              }`}
                              data-testid={`toggle-item-${item.id}`}
                            >
                              {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                  {item.name}
                                </span>
                                {item.essential && (
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                    Essential
                                  </span>
                                )}
                              </div>
                              {item.affiliateNote && isSelected && (
                                <a
                                  href={item.affiliateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer nofollow"
                                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                                >
                                  {item.affiliateNote} <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>

                            <span className={`text-sm font-mono tabular-nums shrink-0 ${isSelected ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                              {item.weightOz} oz
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4">Add Custom Gear</h3>

              {customItems.length > 0 && (
                <div className="mb-4 space-y-2">
                  {customItems.map((ci) => (
                    <div key={ci.id} className="flex items-center gap-3 bg-muted rounded px-3 py-2">
                      <span className="text-sm flex-1">{ci.name}</span>
                      <span className="text-sm font-mono text-muted-foreground">{ci.weightOz} oz</span>
                      <button onClick={() => removeCustomItem(ci.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Item name"
                  className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                  data-testid="input-custom-item-name"
                />
                <input
                  type="number"
                  value={customWeightVal}
                  onChange={(e) => setCustomWeightVal(e.target.value)}
                  placeholder="Weight (oz)"
                  min="0.1"
                  step="0.1"
                  className="w-28 bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                  data-testid="input-custom-item-weight"
                />
                <select
                  value={customCat}
                  onChange={(e) => setCustomCat(e.target.value)}
                  className="bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  data-testid="select-custom-item-category"
                >
                  {gearCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={addCustomItem}
                  disabled={!customName.trim() || !customWeightVal}
                  className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold px-4 py-2 rounded text-sm uppercase tracking-wide transition-colors"
                  data-testid="button-add-custom-item"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Data Sources & References</h3>
              <ul className="space-y-1">
                {dataSources.map((ds) => (
                  <li key={ds.name} className="text-xs text-muted-foreground">
                    {ds.url ? (
                      <a href={ds.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{ds.name}</a>
                    ) : (
                      <span className="font-medium">{ds.name}</span>
                    )}
                    {" "}&mdash; {ds.note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide">Pack Weight</h3>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${getStatusColor()}`} data-testid="text-weight-status">
                    {getStatusLabel()}
                  </span>
                </div>

                <div className="flex justify-center mb-2">
                  <DonutChart
                    segments={chartSegments}
                    totalLabel="Total"
                    totalValue={`${calculations.totalLbs.toFixed(1)} lbs`}
                    size={180}
                  />
                </div>

                <ChartLegend segments={chartSegments} />

                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Total Weight</p>
                    <p className="text-lg font-display font-bold" data-testid="text-total-weight">{calculations.totalLbs.toFixed(1)} lbs</p>
                    <p className="text-xs text-muted-foreground">{calculations.totalOz.toFixed(0)} oz</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">% Body Weight</p>
                    <p className={`text-lg font-display font-bold ${getStatusColor()}`} data-testid="text-pct-body-weight">
                      {calculations.pctBodyWeight.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">of {bodyWeight} lbs</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Items</p>
                    <p className="text-lg font-display font-bold" data-testid="text-item-count">{calculations.itemCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Max Recommended</p>
                    <p className="text-lg font-display font-bold">{(bodyWeight * 0.25).toFixed(0)} lbs</p>
                    <p className="text-xs text-muted-foreground">25% of body weight</p>
                  </div>
                </div>

                <div className="mt-4" role="progressbar" aria-valuenow={calculations.pctBodyWeight} aria-valuemin={0} aria-valuemax={50}>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (calculations.pctBodyWeight / 50) * 100)}%`,
                        backgroundColor:
                          calculations.pctBodyWeight >= CRITICAL_PERCENT
                            ? "#ef4444"
                            : calculations.pctBodyWeight >= WARNING_PERCENT
                            ? "#EAB308"
                            : "#22c55e",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0%</span>
                    <span className="text-green-600">25%</span>
                    <span className="text-red-500">33%+</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              {calculations.pctBodyWeight >= WARNING_PERCENT && calculations.itemCount > 0 && (
                <div className={`rounded-xl p-4 border ${
                  calculations.pctBodyWeight >= CRITICAL_PERCENT
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-yellow-500/10 border-yellow-500/30"
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                      calculations.pctBodyWeight >= CRITICAL_PERCENT ? "text-red-500" : "text-yellow-500"
                    }`} />
                    <div>
                      <p className="text-sm font-bold mb-1">
                        {calculations.pctBodyWeight >= CRITICAL_PERCENT ? "Pack is dangerously heavy" : "Pack is getting heavy"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {calculations.pctBodyWeight >= CRITICAL_PERCENT
                          ? "Over 33% body weight increases injury risk and drastically slows movement. The US Army limits sustained march loads to 30%. Consider cutting non-essential items."
                          : "At 25%+ body weight, endurance drops significantly. Consider lighter alternatives for your heaviest items."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {calculations.missingEssentials.length > 0 && calculations.itemCount > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold mb-2">Missing Essentials</p>
                      <ul className="space-y-1">
                        {calculations.missingEssentials.slice(0, 6).map((item) => (
                          <li key={item.id} className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                            {item.name}
                            {item.affiliateUrl && (
                              <a href={item.affiliateUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-primary hover:underline ml-auto">
                                Get it
                              </a>
                            )}
                          </li>
                        ))}
                        {calculations.missingEssentials.length > 6 && (
                          <li className="text-xs text-muted-foreground">+{calculations.missingEssentials.length - 6} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {calculations.recommendations.length > 0 && calculations.itemCount > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wide">Recommended Gear</h3>
                  </div>
                  <div className="space-y-3">
                    {calculations.recommendations.map((item) => (
                      <a key={item.id} href={item.affiliateUrl} target="_blank" rel="noopener noreferrer nofollow"
                        className="block p-3 bg-muted rounded-md hover:bg-primary/5 transition-colors group">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">{item.name}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                        </div>
                        {item.affiliateNote && <p className="text-xs text-primary mt-0.5">{item.affiliateNote}</p>}
                      </a>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-3">Affiliate links — we earn a commission at no extra cost to you.</p>
                </div>
              )}

              {calculations.missingEssentials.length === 0 && calculations.itemCount > 5 && calculations.pctBodyWeight < WARNING_PERCENT && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold mb-1 text-green-600 dark:text-green-500">Pack looks solid</p>
                      <p className="text-xs text-muted-foreground">All essentials covered and weight is within recommended limits. Your BOB is ready to go.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-xl py-3 text-sm font-bold uppercase tracking-wide hover:bg-card transition-colors"
                  data-testid="button-print">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={shareLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 text-sm font-bold uppercase tracking-wide transition-colors"
                  data-testid="button-share">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {showShareToast && (
                <div className="bg-green-500/15 border border-green-500/30 text-green-600 dark:text-green-500 text-sm rounded-xl p-3 text-center">
                  Link copied to clipboard!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mt-16 space-y-8">
          <section>
            <h2 className="text-2xl font-display font-bold mb-4">How Heavy Should a Bug Out Bag Be?</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The general rule is to keep your bug out bag under <strong className="text-foreground">25% of your body weight</strong> for
              sustained movement. The US Army Field Manual 21-18 recommends a maximum of 30% body weight for
              approach marches, and the Wilderness Medical Society warns that loads above 25% significantly
              increase injury risk and reduce endurance.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For a 180 lb person, that means a maximum of <strong className="text-foreground">45 lbs</strong> &mdash; and lighter is always better
              when you need to move fast. Many experienced preppers target 30-35 lbs for a 72-hour bag.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-display font-bold mb-4">What Should Be in Your Bug Out Bag?</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              At minimum, your BOB should cover the <strong className="text-foreground">5 survival priorities</strong>: water, shelter,
              fire, first aid, and navigation. FEMA recommends supplies for at least 72 hours. Our calculator
              marks essential items so you can see gaps in your loadout instantly.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The most common mistake is overpacking food and clothing while neglecting water filtration
              and fire-starting redundancy. Use this calculator to balance your categories and identify
              where your weight is concentrated.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-display font-bold mb-4">Bug Out Bag vs Get Home Bag</h2>
            <p className="text-muted-foreground leading-relaxed">
              A bug out bag (BOB) is designed to sustain you for 72+ hours when evacuating your home.
              A get home bag (GHB) is lighter &mdash; typically 15-20 lbs &mdash; and lives in your
              vehicle or office for getting home during an emergency. Use this calculator for either,
              but adjust your target weight accordingly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
