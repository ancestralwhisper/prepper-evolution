// ─── Virtual Go-Bag Builder ───────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Backpack, Plus, X, Trash2, Wrench, Droplets, Flame, Zap,
  Truck, Tent, Radio, HeartPulse, Compass, Scale,
  ChevronRight, Activity, ShoppingCart, Check,
  AlertTriangle, RotateCcw
} from "lucide-react";
import {
  categoryMeta,
  gearDatabase,
  getItemsByCategory,
  getTotalWeight,
} from "./go-bag-data";
import { loadGoBag, saveGoBag } from "./go-bag-shared";
import type { GoBagCategory, CustomGoBagItem } from "./go-bag-types";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";

// ── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Droplets, Flame, Zap, Truck, Tent, Radio, HeartPulse, Compass, Wrench,
};

// ── Weight classification ─────────────────────────────────────────────────────
function weightClass(lbs: number): { label: string; color: string; bar: string } {
  if (lbs < 20) return { label: "Ultra Light",  color: "text-emerald-400", bar: "bg-emerald-500" };
  if (lbs < 35) return { label: "Light",         color: "text-green-400",   bar: "bg-green-500"   };
  if (lbs < 50) return { label: "Moderate",      color: "text-yellow-400",  bar: "bg-yellow-500"  };
  if (lbs < 65) return { label: "Heavy",         color: "text-orange-400",  bar: "bg-orange-500"  };
  return               { label: "Very Heavy",    color: "text-red-400",     bar: "bg-red-500"     };
}

// ── Amazon affiliate helper ───────────────────────────────────────────────────
const AMAZON_TAG = "prepperevo-20";
function amazonUrl(asin: string) {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function VirtualGoBag() {
  const [activeCategory, setActiveCategory] = useState<GoBagCategory>("water");
  const [savedItemIds, setSavedItemIds]     = useState<string[]>([]);
  const [customItems, setCustomItems]       = useState<CustomGoBagItem[]>([]);
  const [mobileView, setMobileView]         = useState<"browse" | "kit">("browse");

  // Custom item form
  const [showCustomForm, setShowCustomForm]     = useState(false);
  const [customName, setCustomName]             = useState("");
  const [customCat, setCustomCat]               = useState<GoBagCategory>("tools");
  const [customWeightVal, setCustomWeightVal]   = useState("");

  // Load on mount
  useEffect(() => {
    const bag = loadGoBag();
    setSavedItemIds(bag.itemIds);
    setCustomItems(bag.customItems);
  }, []);

  // Save on change
  useEffect(() => {
    saveGoBag({ itemIds: savedItemIds, customItems, lastUpdated: Date.now() });
  }, [savedItemIds, customItems]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  function toggleItem(id: string) {
    setSavedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function removeCustomItem(id: string) {
    setCustomItems((prev) => prev.filter((x) => x.id !== id));
  }

  function addCustomItem() {
    const name = customName.trim();
    const wt   = parseFloat(customWeightVal);
    if (!name || isNaN(wt) || wt < 0) return;
    setCustomItems((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name, category: customCat, weight_lbs: wt },
    ]);
    setCustomName("");
    setCustomWeightVal("");
    setShowCustomForm(false);
  }

  function clearAll() {
    if (!confirm("Clear your entire kit? This can't be undone.")) return;
    setSavedItemIds([]);
    setCustomItems([]);
  }

  // ── Derived values ───────────────────────────────────────────────────────────
  const gearWeight      = getTotalWeight(savedItemIds);
  const customWeightSum = customItems.reduce((s, i) => s + i.weight_lbs, 0);
  const totalWeight     = gearWeight + customWeightSum;
  const itemCount       = savedItemIds.length + customItems.length;
  const wc              = weightClass(totalWeight);

  const categoryItems   = getItemsByCategory(activeCategory);
  const diagnosticCount = savedItemIds.filter((id) => {
    const item = gearDatabase.find((g) => g.id === id);
    return item?.hasDiagnostic;
  }).length;

  // Saved gear items for kit panel
  const savedGear = savedItemIds
    .map((id) => gearDatabase.find((g) => g.id === id))
    .filter(Boolean) as typeof gearDatabase;

  // ── Layout ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* ── Hero ── */}
      <div className="bg-gradient-to-b from-neutral-900 to-[#0d0d0d] border-b border-neutral-800 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
              <Backpack className="text-orange-400" size={20} />
            </div>
            <div>
              <div className="text-xs text-orange-400 font-medium tracking-widest uppercase">
                Ops Deck · Virtual Go-Bag
              </div>
              <h1 className="text-2xl font-bold leading-tight">Build Your Kit</h1>
            </div>
          </div>
          <p className="text-neutral-400 text-sm max-w-xl mt-2">
            Pick your gear. Track your load. When something breaks in the field, your kit feeds
            directly into the{" "}
            <Link href="/tools/field-diagnostic" className="text-orange-400 hover:underline">
              Field Failure Diagnostic
            </Link>
            .
          </p>

          {/* Weight summary strip */}
          {itemCount > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-neutral-400" />
                <span className="text-2xl font-bold">{totalWeight.toFixed(1)}</span>
                <span className="text-neutral-400 text-sm">lbs total</span>
              </div>
              <span className={`text-sm font-semibold ${wc.color}`}>{wc.label}</span>
              <span className="text-neutral-500 text-sm">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>

              {/* Weight bar */}
              <div className="flex-1 min-w-[120px] max-w-xs h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${wc.bar}`}
                  style={{ width: `${Math.min((totalWeight / 80) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile view toggle ── */}
      <div className="md:hidden flex border-b border-neutral-800 sticky top-0 z-20 bg-[#0d0d0d]">
        <button
          onClick={() => setMobileView("browse")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileView === "browse"
              ? "text-white border-b-2 border-orange-500"
              : "text-neutral-500"
          }`}
        >
          Browse Gear
        </button>
        <button
          onClick={() => setMobileView("kit")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            mobileView === "kit"
              ? "text-white border-b-2 border-orange-500"
              : "text-neutral-500"
          }`}
        >
          My Kit
          {itemCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs bg-orange-600 rounded-full text-white font-bold">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-[1fr_320px] gap-6">

        {/* ── LEFT: Browse ── */}
        <div className={mobileView === "kit" ? "hidden md:block" : ""}>

          {/* Category tabs */}
          <div className="flex gap-1 flex-wrap mb-5">
            {categoryMeta.map((cat) => {
              const Icon = ICON_MAP[cat.icon];
              const count = getItemsByCategory(cat.id).filter(
                (g) => savedItemIds.includes(g.id)
              ).length;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-orange-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700"
                  }`}
                >
                  {Icon && <Icon size={12} />}
                  {cat.label}
                  {count > 0 && (
                    <span className={`text-xs font-bold ${isActive ? "text-orange-100" : "text-orange-400"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Gear grid */}
          <div className="grid gap-2">
            {categoryItems.map((item) => {
              const inBag = savedItemIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all group ${
                    inBag
                      ? "bg-orange-600/10 border-orange-500/50 hover:bg-orange-600/15"
                      : "bg-neutral-900 border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Check / Add indicator */}
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      inBag ? "bg-orange-500" : "bg-neutral-800 group-hover:bg-neutral-700"
                    }`}>
                      {inBag
                        ? <Check size={11} className="text-white" />
                        : <Plus size={11} className="text-neutral-400" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-neutral-500 font-medium">{item.brand}</span>
                        <span className={`font-semibold text-sm ${inBag ? "text-white" : "text-neutral-200"}`}>
                          {item.name}
                        </span>
                        {item.hasDiagnostic && (
                          <span className="text-[10px] bg-emerald-900/60 text-emerald-400 border border-emerald-700/40 px-1.5 py-0.5 rounded font-medium">
                            Diagnostic
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-neutral-400 font-mono whitespace-nowrap">
                        {item.weight_lbs === 0 ? "0 lbs" : `${item.weight_lbs} lbs`}
                      </span>
                      {item.asin && (
                        <a
                          href={amazonUrl(item.asin)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-neutral-600 hover:text-orange-400 flex items-center gap-0.5 transition-colors"
                          title="View on Amazon"
                        >
                          <ShoppingCart size={10} />
                          Buy
                        </a>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: My Kit ── */}
        <div className={`space-y-4 ${mobileView === "browse" ? "hidden md:block" : ""}`}>

          {/* Kit summary card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Backpack size={15} className="text-orange-400" />
                My Kit
              </h2>
              {itemCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-neutral-600 hover:text-red-400 transition-colors"
                  title="Clear all"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>

            {itemCount === 0 ? (
              <div className="text-center py-6">
                <Backpack size={28} className="text-neutral-700 mx-auto mb-2" />
                <p className="text-neutral-600 text-xs">
                  Your bag is empty.<br />Tap gear on the left to add it.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold">{totalWeight.toFixed(1)}</span>
                  <span className="text-neutral-400 text-sm">lbs</span>
                  <span className={`text-xs font-semibold ml-auto ${wc.color}`}>{wc.label}</span>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${wc.bar}`}
                    style={{ width: `${Math.min((totalWeight / 80) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-neutral-600 text-[11px] mb-4">
                  {itemCount} item{itemCount !== 1 ? "s" : ""} · {savedItemIds.length} catalog + {customItems.length} custom
                </p>

                {/* Diagnose CTA */}
                {diagnosticCount > 0 && (
                  <Link
                    href="/tools/field-diagnostic"
                    className="block w-full bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg text-center transition-colors mb-3 flex items-center justify-center gap-2"
                  >
                    <Activity size={15} />
                    Diagnose Your Kit
                    <ChevronRight size={14} />
                  </Link>
                )}
                {diagnosticCount === 0 && itemCount > 0 && (
                  <div className="bg-neutral-800 rounded-lg px-3 py-2 mb-3 text-[11px] text-neutral-500 flex items-center gap-2">
                    <AlertTriangle size={12} className="text-neutral-600 flex-shrink-0" />
                    Add gear with a Diagnostic badge to unlock the field diagnostic.
                  </div>
                )}
              </>
            )}
          </div>

          {/* Gear list */}
          {(savedGear.length > 0 || customItems.length > 0) && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800 text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Items
              </div>
              <div className="divide-y divide-neutral-800/60 max-h-[420px] overflow-y-auto">
                {savedGear.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-neutral-800/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium leading-tight truncate">{item.name}</div>
                      <div className="text-[11px] text-neutral-500">{item.brand}</div>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono whitespace-nowrap">
                      {item.weight_lbs} lbs
                    </span>
                    {item.hasDiagnostic && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="Has diagnostic" />
                    )}
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="text-neutral-700 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {customItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-neutral-800/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium leading-tight truncate">{item.name}</div>
                      <div className="text-[11px] text-neutral-500 italic">Custom</div>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono whitespace-nowrap">
                      {item.weight_lbs} lbs
                    </span>
                    <button
                      onClick={() => removeCustomItem(item.id)}
                      className="text-neutral-700 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add custom item */}
          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-neutral-700 hover:border-orange-600/60 text-neutral-500 hover:text-orange-400 text-sm rounded-xl transition-colors"
            >
              <Plus size={14} />
              Add Custom Item
            </button>
          ) : (
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold">Add Custom Item</h3>
              <input
                type="text"
                placeholder="Item name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={customCat}
                  onChange={(e) => setCustomCat(e.target.value as GoBagCategory)}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  {categoryMeta.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Weight (lbs)"
                  value={customWeightVal}
                  onChange={(e) => setCustomWeightVal(e.target.value)}
                  min="0"
                  step="0.1"
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addCustomItem}
                  disabled={!customName.trim() || !customWeightVal}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowCustomForm(false); setCustomName(""); setCustomWeightVal(""); }}
                  className="px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Category weight breakdown */}
          {totalWeight > 0 && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
                Weight by Category
              </h3>
              <div className="space-y-2">
                {categoryMeta.map((cat) => {
                  const Icon = ICON_MAP[cat.icon];
                  const catIds = savedItemIds.filter((id) => {
                    const item = gearDatabase.find((g) => g.id === id);
                    return item?.category === cat.id;
                  });
                  const catCustom = customItems.filter((i) => i.category === cat.id);
                  const catWeight =
                    getTotalWeight(catIds) +
                    catCustom.reduce((s, i) => s + i.weight_lbs, 0);
                  if (catWeight === 0) return null;
                  const pct = totalWeight > 0 ? (catWeight / totalWeight) * 100 : 0;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center gap-2 mb-0.5">
                        {Icon && <Icon size={11} className="text-neutral-500" />}
                        <span className="text-xs text-neutral-400 flex-1">{cat.label}</span>
                        <span className="text-xs text-neutral-400 font-mono">{catWeight.toFixed(1)} lbs</span>
                      </div>
                      <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-600/70 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DataPrivacyNotice />
        </div>
      </div>

      {/* ── Field Diagnostic callout (bottom, mobile browse view) ── */}
      {diagnosticCount > 0 && mobileView === "browse" && (
        <div className="md:hidden mx-4 mb-6">
          <Link
            href="/tools/field-diagnostic"
            className="block w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl text-center text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Activity size={16} />
            Diagnose Your Kit ({diagnosticCount} items)
            <ChevronRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
