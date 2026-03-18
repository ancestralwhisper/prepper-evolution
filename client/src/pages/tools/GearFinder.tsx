import { useState, useMemo, useCallback, useEffect } from "react";
import {
  SlidersHorizontal, X, ChevronDown, ChevronUp, ExternalLink,
  ArrowUpDown, RotateCcw, Check, Mountain, Wind, Layers,
  Ruler, DoorOpen, Weight, Info, Tent, Moon, BedDouble, Backpack,
  Flame, CookingPot, Droplets, CloudRain, Thermometer, Lightbulb,
  Package, ShoppingBag, Plus, Minus, Warehouse,
} from "lucide-react";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import { trackEvent } from "@/lib/analytics";
import { useSEO } from "@/hooks/useSEO";
import {
  tents,
  formatWeight,
  sqInToSqFt,
  setupLabels,
  seasonLabels,
  windLabels,
  windColors,
  type BackpackingTent,
} from "./tent-data";
import {
  type GearCategory,
  type GearProduct,
  type GearSortKey,
  categoryMeta,
  allGear,
  sortGear,
  gearSortOptions,
  sleepingBags,
  sleepingPads,
  packs,
  stoves,
  cookware,
  rainGear,
  insulation,
  trekkingPoles,
  headlamps,
  accessories,
  shelters,
} from "./gear-finder-data";

// ─── Tent Sort (kept from original) ──────────────────────────────────────────
type TentSortKey = "lightest" | "heaviest" | "cheapest" | "expensive" | "value" | "floor" | "tallest";

const tentSortOptions: { key: TentSortKey; label: string }[] = [
  { key: "lightest", label: "Lightest First" },
  { key: "heaviest", label: "Heaviest First" },
  { key: "cheapest", label: "Lowest Price" },
  { key: "expensive", label: "Highest Price" },
  { key: "value", label: "Best Value (oz/$)" },
  { key: "floor", label: "Most Floor Area" },
  { key: "tallest", label: "Tallest Peak Height" },
];

function sortTents(list: BackpackingTent[], key: TentSortKey): BackpackingTent[] {
  const sorted = [...list];
  switch (key) {
    case "lightest": return sorted.sort((a, b) => a.weightOz - b.weightOz);
    case "heaviest": return sorted.sort((a, b) => b.weightOz - a.weightOz);
    case "cheapest": return sorted.sort((a, b) => a.price - b.price);
    case "expensive": return sorted.sort((a, b) => b.price - a.price);
    case "value": return sorted.sort((a, b) => a.price / a.weightOz - b.price / b.weightOz);
    case "floor": return sorted.sort((a, b) => b.floorArea - a.floorArea);
    case "tallest": return sorted.sort((a, b) => b.peakHeight - a.peakHeight);
  }
}

// ─── Badge component ─────────────────────────────────────────────────────────
function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${className}`}>
      {children}
    </span>
  );
}

// ─── Category icon map ───────────────────────────────────────────────────────
const categoryIcons: Record<GearCategory | "tents", React.ElementType> = {
  tents: Tent,
  "sleeping-bags": Moon,
  "sleeping-pads": BedDouble,
  packs: Backpack,
  stoves: Flame,
  cookware: CookingPot,
  "water-treatment": Droplets,
  "rain-gear": CloudRain,
  insulation: Thermometer,
  "trekking-poles": ArrowUpDown,
  headlamps: Lightbulb,
  accessories: Package,
  shelters: Warehouse,
};

// ─── Category tabs config ────────────────────────────────────────────────────
const tabOrder: (GearCategory | "tents")[] = [
  "tents", "shelters", "sleeping-bags", "sleeping-pads", "packs", "stoves", "cookware",
  "rain-gear", "insulation", "trekking-poles", "headlamps", "accessories",
];

const tabLabels: Record<string, string> = {
  tents: "Tents",
  shelters: "Shelters",
  "sleeping-bags": "Sleep Bags",
  "sleeping-pads": "Pads",
  packs: "Packs",
  stoves: "Stoves",
  cookware: "Cookware",
  "rain-gear": "Rain Gear",
  insulation: "Insulation",
  "trekking-poles": "Poles",
  headlamps: "Headlamps",
  accessories: "Accessories",
};

// ─── Gear data map ───────────────────────────────────────────────────────────
const gearByCategory: Record<GearCategory, GearProduct[]> = {
  "sleeping-bags": sleepingBags,
  "sleeping-pads": sleepingPads,
  packs,
  stoves,
  cookware,
  "rain-gear": rainGear,
  insulation,
  "trekking-poles": trekkingPoles,
  headlamps,
  accessories,
  shelters,
  tents: [], // tents use BackpackingTent type
  "water-treatment": [], // covered under accessories
};

function getCategoryCount(cat: GearCategory | "tents"): number {
  if (cat === "tents") return tents.length;
  return (gearByCategory[cat] || []).length;
}

// ─── Tent Comparison Table (kept from original) ──────────────────────────────
function TentComparisonTable({ compared, onRemove }: { compared: BackpackingTent[]; onRemove: (id: string) => void }) {
  const rows: { label: string; render: (t: BackpackingTent) => React.ReactNode }[] = [
    { label: "Trail Weight", render: (t) => formatWeight(t.weightOz) },
    { label: "Packed Weight", render: (t) => formatWeight(t.packedWeightOz) },
    { label: "Price", render: (t) => `$${t.price}` },
    { label: "Setup", render: (t) => setupLabels[t.setup] },
    { label: "Season", render: (t) => seasonLabels[t.season] },
    { label: "Wind Rating", render: (t) => <Badge className={windColors[t.windRating]}>{windLabels[t.windRating]}</Badge> },
    { label: "Wall Type", render: (t) => t.wallType === "double" ? "Double Wall" : t.wallType === "single" ? "Single Wall" : "Hybrid" },
    { label: "Floor Area", render: (t) => `${sqInToSqFt(t.floorArea)} sq ft` },
    { label: "Peak Height", render: (t) => `${t.peakHeight} in` },
    { label: "Doors", render: (t) => `${t.doors}` },
    { label: "Packed Size", render: (t) => t.packedSize },
  ];
  return (
    <div className="bg-card border-2 border-primary/30 rounded-lg overflow-hidden mb-8 animate-fade-in-up">
      <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border">
        <h3 className="font-extrabold text-sm uppercase tracking-wide">Comparison ({compared.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 min-w-[120px] text-muted-foreground text-xs font-bold uppercase tracking-wide">Spec</th>
              {compared.map((t) => (
                <th key={t.id} className="p-3 min-w-[160px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-left"><div className="text-xs text-muted-foreground">{t.brand}</div><div className="text-sm font-bold">{t.model}</div></div>
                    <button onClick={() => onRemove(t.id)} className="text-muted-foreground hover:text-red-400 transition-colors" aria-label={`Remove ${t.model}`}><X className="w-3.5 h-3.5" /></button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                <td className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{row.label}</td>
                {compared.map((t) => (<td key={t.id} className="p-3 text-sm">{row.render(t)}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Gear Comparison Table ───────────────────────────────────────────────────
function GearComparisonTable({ compared, category, onRemove }: { compared: GearProduct[]; category: GearCategory; onRemove: (id: string) => void }) {
  const baseRows: { label: string; render: (g: GearProduct) => React.ReactNode }[] = [
    { label: "Weight", render: (g) => formatWeight(g.weightOz) },
    { label: "Price", render: (g) => `$${g.price}` },
    { label: "Best For", render: (g) => g.bestFor },
  ];
  const specRows = getSpecRows(category);
  const allRows = [...baseRows, ...specRows];
  return (
    <div className="bg-card border-2 border-primary/30 rounded-lg overflow-hidden mb-8 animate-fade-in-up">
      <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border">
        <h3 className="font-extrabold text-sm uppercase tracking-wide">Comparison ({compared.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 min-w-[120px] text-muted-foreground text-xs font-bold uppercase tracking-wide">Spec</th>
              {compared.map((g) => (
                <th key={g.id} className="p-3 min-w-[160px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-left"><div className="text-xs text-muted-foreground">{g.brand}</div><div className="text-sm font-bold">{g.model}</div></div>
                    <button onClick={() => onRemove(g.id)} className="text-muted-foreground hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                <td className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{row.label}</td>
                {compared.map((g) => (<td key={g.id} className="p-3 text-sm">{row.render(g)}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getSpecRows(category: GearCategory): { label: string; render: (g: GearProduct) => React.ReactNode }[] {
  switch (category) {
    case "sleeping-bags": return [
      { label: "Temp Rating", render: (g) => `${g.specs.tempRating}°F` },
      { label: "Fill Type", render: (g) => String(g.specs.fillType) },
      { label: "Fill Power", render: (g) => g.specs.fillPower ? `${g.specs.fillPower}FP` : "N/A" },
      { label: "Shape", render: (g) => String(g.specs.shape) },
      { label: "Zipper", render: (g) => String(g.specs.zipper) },
    ];
    case "sleeping-pads": return [
      { label: "R-Value", render: (g) => String(g.specs.rValue) },
      { label: "Thickness", render: (g) => `${g.specs.thickness}"` },
      { label: "Type", render: (g) => String(g.specs.type) },
      { label: "Size", render: (g) => `${g.specs.length}" x ${g.specs.width}"` },
    ];
    case "packs": return [
      { label: "Volume", render: (g) => `${g.specs.volume}L` },
      { label: "Frame", render: (g) => String(g.specs.frameType) },
      { label: "Hip Belt", render: (g) => g.specs.hipBelt ? "Yes" : "No" },
      { label: "Max Load", render: (g) => `${g.specs.weightCapacity} lbs` },
      { label: "Material", render: (g) => String(g.specs.material) },
    ];
    case "stoves": return [
      { label: "Fuel", render: (g) => String(g.specs.fuelType) },
      { label: "Boil Time", render: (g) => `${g.specs.boilTime} min` },
      { label: "Wind", render: (g) => String(g.specs.windPerformance) },
    ];
    case "cookware": return [
      { label: "Material", render: (g) => String(g.specs.material) },
      { label: "Capacity", render: (g) => g.specs.capacity ? `${g.specs.capacity}ml` : "N/A" },
    ];
    case "rain-gear": return [
      { label: "WP Rating", render: (g) => `${g.specs.waterproofRating}mm` },
      { label: "Breathability", render: (g) => `${g.specs.breathability}g/m²` },
      { label: "Material", render: (g) => String(g.specs.material) },
      { label: "Pit Zips", render: (g) => g.specs.pitZips ? "Yes" : "No" },
    ];
    case "insulation": return [
      { label: "Fill Type", render: (g) => String(g.specs.fillType) },
      { label: "Fill Power", render: (g) => g.specs.fillPower ? `${g.specs.fillPower}FP` : "N/A" },
      { label: "Hood", render: (g) => g.specs.hood ? "Yes" : "No" },
      { label: "Material", render: (g) => String(g.specs.material) },
    ];
    case "trekking-poles": return [
      { label: "Material", render: (g) => String(g.specs.material) },
      { label: "Wt/Pair", render: (g) => formatWeight(Number(g.specs.weightPerPair)) },
      { label: "Collapsed", render: (g) => String(g.specs.collapsedLength) },
      { label: "Grip", render: (g) => String(g.specs.gripMaterial) },
      { label: "Lock", render: (g) => String(g.specs.lockType) },
    ];
    case "headlamps": return [
      { label: "Lumens", render: (g) => String(g.specs.lumens) },
      { label: "Battery", render: (g) => String(g.specs.batteryType) },
      { label: "Burn (Hi)", render: (g) => `${g.specs.burnTimeHigh}h` },
      { label: "Burn (Lo)", render: (g) => `${g.specs.burnTimeLow}h` },
      { label: "Red Light", render: (g) => g.specs.redLight ? "Yes" : "No" },
    ];
    case "shelters": return [
      { label: "Type", render: (g) => String(g.specs.type) },
      { label: "Coverage", render: (g) => `${g.specs.coverageSqFt} sq ft` },
      { label: "Peak Height", render: (g) => `${g.specs.peakHeight}"` },
      { label: "Setup", render: (g) => String(g.specs.setupTime) },
      { label: "Wind Rating", render: (g) => String(g.specs.windRating) },
      { label: "Walls", render: (g) => String(g.specs.wallsIncluded) },
    ];
    default: return [];
  }
}

// ─── Gear Detail Modal ───────────────────────────────────────────────────────
function GearModal({ gear, onClose }: { gear: GearProduct; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const specEntries = Object.entries(gear.specs).filter(([, v]) => v !== "" && v !== 0 && v !== false && v !== "n/a");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">{gear.brand}</p>
            <h2 className="text-xl font-extrabold">{gear.model}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{gear.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-muted rounded-lg p-2.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Weight</p>
            <p className="text-sm font-bold">{formatWeight(gear.weightOz)}</p>
          </div>
          <div className="bg-muted rounded-lg p-2.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Price</p>
            <p className="text-sm font-bold">${gear.price}</p>
          </div>
          {specEntries.map(([key, val]) => (
            <div key={key} className="bg-muted rounded-lg p-2.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{key.replace(/([A-Z])/g, " $1").trim()}</p>
              <p className="text-sm font-bold">{typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-2">Pros</p>
            <ul className="space-y-1">
              {gear.pros.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm"><Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" /><span>{p}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-2">Cons</p>
            <ul className="space-y-1">
              {gear.cons.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm"><X className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" /><span>{c}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 mb-5">
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Best For</p>
          <p className="text-sm">{gear.bestFor}</p>
        </div>

        <a href={gear.affiliateUrl} target="_blank" rel="noopener noreferrer"
          onClick={() => trackEvent("pe_affiliate_click", { tool: "gear-finder", product: `${gear.brand} ${gear.model}`, url: gear.affiliateUrl })}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wide rounded-lg px-5 py-3 hover:bg-primary/90 transition-colors">
          Check Price <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// ─── Tent Detail Modal (kept from original) ──────────────────────────────────
function TentModal({ tent, onClose }: { tent: BackpackingTent; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">{tent.brand}</p>
            <h2 className="text-xl font-extrabold">{tent.model}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-primary/20 text-primary border-primary/30">{tent.capacity}P</Badge>
          <Badge className="bg-primary/20 text-primary border-primary/30">{setupLabels[tent.setup]}</Badge>
          <Badge className={windColors[tent.windRating]}>Wind: {windLabels[tent.windRating]}</Badge>
          <Badge className="bg-primary/20 text-primary border-primary/30">{seasonLabels[tent.season]}</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: "Trail Weight", value: formatWeight(tent.weightOz) },
            { label: "Packed Weight", value: formatWeight(tent.packedWeightOz) },
            { label: "Price", value: `$${tent.price}` },
            { label: "Floor Area", value: `${sqInToSqFt(tent.floorArea)} sq ft` },
            { label: "Vestibule", value: tent.vestibuleArea > 0 ? `${sqInToSqFt(tent.vestibuleArea)} sq ft` : "None" },
            { label: "Peak Height", value: `${tent.peakHeight} in` },
            { label: "Doors", value: `${tent.doors}` },
            { label: "Stakes", value: `${tent.stakes}${tent.stakesIncluded ? " (incl.)" : ""}` },
            { label: "Packed Size", value: tent.packedSize },
          ].map((item) => (
            <div key={item.label} className="bg-muted rounded-lg p-2.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-bold">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3 mb-5">
          <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Fly Fabric</p><p className="text-sm">{tent.fabricFly}</p></div>
          <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Floor Fabric</p><p className="text-sm">{tent.fabricFloor}</p></div>
          <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Poles</p><p className="text-sm">{tent.poles}</p></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-2">Pros</p>
            <ul className="space-y-1">{tent.pros.map((p, i) => (<li key={i} className="flex gap-2 text-sm"><Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" /><span>{p}</span></li>))}</ul>
          </div>
          <div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-2">Cons</p>
            <ul className="space-y-1">{tent.cons.map((c, i) => (<li key={i} className="flex gap-2 text-sm"><X className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" /><span>{c}</span></li>))}</ul>
          </div>
        </div>
        <div className="bg-muted rounded-lg p-3 mb-5">
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Best For</p>
          <p className="text-sm">{tent.bestFor}</p>
        </div>
        {tent.notes && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-5">
            <div className="flex gap-2"><Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" /><p className="text-sm text-yellow-200">{tent.notes}</p></div>
          </div>
        )}
        <a href={tent.affiliateUrl} target="_blank" rel="noopener noreferrer"
          onClick={() => trackEvent("pe_affiliate_click", { tool: "gear-finder", product: `${tent.brand} ${tent.model}`, url: tent.affiliateUrl })}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wide rounded-lg px-5 py-3 hover:bg-primary/90 transition-colors">
          Check Price <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// ─── Gear Card (non-tent categories) ─────────────────────────────────────────
function GearCard({ gear, category, isCompared, onToggleCompare, onClick }: {
  gear: GearProduct;
  category: GearCategory;
  isCompared: boolean;
  onToggleCompare: () => void;
  onClick: () => void;
}) {
  const specPills = getCardSpecs(gear, category);

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col hover:border-primary/30 transition-colors cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide truncate">{gear.brand}</p>
          <h3 className="text-sm font-extrabold truncate">{gear.model}</h3>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <p className="text-lg font-extrabold text-primary">${gear.price}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-1 bg-muted rounded px-2 py-1">
          <Weight className="w-3 h-3 text-primary" />
          <span className="text-xs font-bold">{formatWeight(gear.weightOz)}</span>
        </div>
        {specPills.map((pill) => (
          <Badge key={pill} className="bg-primary/10 text-primary border-primary/20">{pill}</Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{gear.bestFor}</p>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
        <button onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isCompared ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
          <div className={`w-4 h-4 rounded border flex items-center justify-center ${isCompared ? "bg-primary border-primary" : "border-border"}`}>
            {isCompared && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>
          Compare
        </button>
        <a href={gear.affiliateUrl} target="_blank" rel="noopener noreferrer"
          onClick={(e) => { e.stopPropagation(); trackEvent("pe_affiliate_click", { tool: "gear-finder", product: `${gear.brand} ${gear.model}`, url: gear.affiliateUrl }); }}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
          Check Price <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

function getCardSpecs(gear: GearProduct, category: GearCategory): string[] {
  switch (category) {
    case "sleeping-bags": return [String(gear.specs.shape), `${gear.specs.tempRating}°F`, gear.specs.fillPower ? `${gear.specs.fillPower}FP` : "Synthetic"];
    case "sleeping-pads": return [String(gear.specs.type), `R${gear.specs.rValue}`, `${gear.specs.thickness}"`];
    case "packs": return [`${gear.specs.volume}L`, String(gear.specs.frameType), gear.specs.hipBelt ? "Hip Belt" : "No Belt"];
    case "stoves": return [String(gear.specs.fuelType), `${gear.specs.boilTime}m boil`];
    case "cookware": return [String(gear.specs.material), gear.specs.capacity ? `${gear.specs.capacity}ml` : ""];
    case "rain-gear": return [String(gear.specs.material).split(" ")[0], gear.specs.pitZips ? "Pit Zips" : "No Pit Zips"];
    case "insulation": return [String(gear.specs.fillType), gear.specs.fillPower ? `${gear.specs.fillPower}FP` : "Synthetic", gear.specs.hood ? "Hooded" : "No Hood"];
    case "trekking-poles": return [String(gear.specs.material), String(gear.specs.gripMaterial)];
    case "headlamps": return [`${gear.specs.lumens}lm`, String(gear.specs.batteryType)];
    case "accessories": return [String(gear.specs.type)];
    case "shelters": return [String(gear.specs.type), `${gear.specs.coverageSqFt} sq ft`, String(gear.specs.windRating)];
    default: return [];
  }
}

// ─── Pack Builder (running total weight) ─────────────────────────────────────
function PackBuilder({ items, onRemove }: { items: { id: string; name: string; weightOz: number }[]; onRemove: (id: string) => void }) {
  const totalOz = items.reduce((sum, i) => sum + i.weightOz, 0);
  if (items.length === 0) return null;
  return (
    <div className="bg-card border-2 border-emerald-500/30 rounded-lg p-4 mb-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-500" />
          Pack Builder ({items.length} items)
        </h3>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Weight</p>
          <p className="text-lg font-extrabold text-emerald-400">{formatWeight(totalOz)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-xs">
            <span className="font-bold text-emerald-400">{item.name}</span>
            <span className="text-emerald-400/60">{formatWeight(item.weightOz)}</span>
            <button onClick={() => onRemove(item.id)} className="text-emerald-400/60 hover:text-red-400"><X className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function GearFinder() {
  useSEO({
    title: "Ultralight Gear Finder | Compare 150+ Backpacking Products",
    description: "Find the perfect ultralight backpacking gear. Compare tents, sleeping bags, pads, packs, stoves, rain gear, insulation, and more across 150+ products. Filter by weight, price, and specs.",
  });

  // ─── Tab state ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<GearCategory | "tents">("tents");

  // ─── Tent filters (kept from original) ─────────────────────
  const [capacity, setCapacity] = useState<Set<number>>(new Set());
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);
  const [weightMax, setWeightMax] = useState(80);
  const [setupFilter, setSetupFilter] = useState<Set<string>>(new Set());
  const [seasonFilter, setSeasonFilter] = useState<Set<string>>(new Set());
  const [windFilter, setWindFilter] = useState<Set<string>>(new Set());
  const [wallFilter, setWallFilter] = useState<Set<string>>(new Set());
  const [freestandingOnly, setFreestandingOnly] = useState(false);
  const [tentSortKey, setTentSortKey] = useState<TentSortKey>("lightest");

  // ─── Gear filters ──────────────────────────────────────────
  const [gearPriceMin, setGearPriceMin] = useState(0);
  const [gearPriceMax, setGearPriceMax] = useState(2000);
  const [gearWeightMax, setGearWeightMax] = useState(100);
  const [gearSortKey, setGearSortKey] = useState<GearSortKey>("lightest");
  const [gearSpecFilter, setGearSpecFilter] = useState<Record<string, Set<string>>>({});

  // ─── Compare / modal / pack builder state ──────────────────
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [modalTent, setModalTent] = useState<BackpackingTent | null>(null);
  const [modalGear, setModalGear] = useState<GearProduct | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [packItems, setPackItems] = useState<{ id: string; name: string; weightOz: number }[]>([]);

  // ─── Analytics ─────────────────────────────────────────────
  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "gear-finder" });
  }, []);

  // ─── Helpers ───────────────────────────────────────────────
  const toggleSet = useCallback((setter: React.Dispatch<React.SetStateAction<Set<string>>>, val: string) => {
    setter((prev) => { const next = new Set(prev); if (next.has(val)) next.delete(val); else next.add(val); return next; });
  }, []);

  const toggleCapacity = useCallback((val: number) => {
    setCapacity((prev) => { const next = new Set(prev); if (next.has(val)) next.delete(val); else next.add(val); return next; });
  }, []);

  const resetTentFilters = useCallback(() => {
    setCapacity(new Set()); setPriceMin(0); setPriceMax(1000); setWeightMax(80);
    setSetupFilter(new Set()); setSeasonFilter(new Set()); setWindFilter(new Set());
    setWallFilter(new Set()); setFreestandingOnly(false);
  }, []);

  const resetGearFilters = useCallback(() => {
    setGearPriceMin(0); setGearPriceMax(2000); setGearWeightMax(100); setGearSpecFilter({});
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else if (next.size < 4) next.add(id); return next; });
  }, []);

  const togglePackItem = useCallback((id: string, name: string, weightOz: number) => {
    setPackItems((prev) => {
      if (prev.find((p) => p.id === id)) return prev.filter((p) => p.id !== id);
      return [...prev, { id, name, weightOz }];
    });
  }, []);

  // Clear compare when switching tabs
  useEffect(() => { setCompareIds(new Set()); }, [activeTab]);

  // ─── Filtered tents ────────────────────────────────────────
  const filteredTents = useMemo(() => {
    let result = tents.filter((t) => {
      if (capacity.size > 0 && !capacity.has(t.capacity)) return false;
      if (t.price < priceMin || t.price > priceMax) return false;
      if (t.weightOz > weightMax) return false;
      if (setupFilter.size > 0 && !setupFilter.has(t.setup)) return false;
      if (seasonFilter.size > 0 && !seasonFilter.has(t.season)) return false;
      if (windFilter.size > 0 && !windFilter.has(t.windRating)) return false;
      if (wallFilter.size > 0 && !wallFilter.has(t.wallType)) return false;
      if (freestandingOnly && t.setup !== "freestanding") return false;
      return true;
    });
    return sortTents(result, tentSortKey);
  }, [capacity, priceMin, priceMax, weightMax, setupFilter, seasonFilter, windFilter, wallFilter, freestandingOnly, tentSortKey]);

  const comparedTents = useMemo(() => tents.filter((t) => compareIds.has(t.id)), [compareIds]);

  // ─── Filtered gear ─────────────────────────────────────────
  const currentGearList = useMemo(() => {
    if (activeTab === "tents") return [];
    return gearByCategory[activeTab] || [];
  }, [activeTab]);

  const filteredGear = useMemo(() => {
    let result = currentGearList.filter((g) => {
      if (g.price < gearPriceMin || g.price > gearPriceMax) return false;
      if (g.weightOz > gearWeightMax) return false;
      // spec filters
      for (const [key, values] of Object.entries(gearSpecFilter)) {
        if (values.size > 0) {
          const specVal = String(g.specs[key] ?? "");
          if (!values.has(specVal)) return false;
        }
      }
      return true;
    });
    return sortGear(result, gearSortKey);
  }, [currentGearList, gearPriceMin, gearPriceMax, gearWeightMax, gearSpecFilter, gearSortKey]);

  const comparedGear = useMemo(
    () => currentGearList.filter((g) => compareIds.has(g.id)),
    [compareIds, currentGearList]
  );

  // ─── Spec filter options for current category ──────────────
  const specFilterOptions = useMemo(() => {
    if (activeTab === "tents") return {};
    const options: Record<string, Set<string>> = {};
    const specKeys = getFilterableSpecs(activeTab);
    for (const key of specKeys) {
      options[key] = new Set<string>();
      for (const g of currentGearList) {
        const val = g.specs[key];
        if (val !== undefined && val !== "" && val !== 0) options[key].add(String(val));
      }
    }
    return options;
  }, [activeTab, currentGearList]);

  const hasActiveTentFilters = capacity.size > 0 || priceMin > 0 || priceMax < 1000 || weightMax < 80 ||
    setupFilter.size > 0 || seasonFilter.size > 0 || windFilter.size > 0 || wallFilter.size > 0 || freestandingOnly;

  const hasActiveGearFilters = gearPriceMin > 0 || gearPriceMax < 2000 || gearWeightMax < 100 ||
    Object.values(gearSpecFilter).some((s) => s.size > 0);

  const totalProducts = tents.length + allGear.length;

  return (
    <div className="bg-background min-h-screen">
      {/* ─── Hero ───────────────────────────────────────────── */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] font-mono font-bold text-muted-foreground/50 uppercase tracking-wider">v2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Ultralight Gear Finder</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Compare {totalProducts}+ ultralight backpacking products across {tabOrder.length} categories.
            Filter by weight, price, and category-specific specs. Click any product for full details, pros/cons, and a direct link to buy.
          </p>
        </div>
      </div>

      {/* ─── Category Tabs ──────────────────────────────────── */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar -mb-px">
            {tabOrder.map((tab) => {
              const Icon = categoryIcons[tab];
              const isActive = activeTab === tab;
              const count = getCategoryCount(tab);
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setFiltersOpen(false);
                    trackEvent("pe_gear_finder_tab", { tab });
                  }}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tabLabels[tab]}</span>
                  <span className="sm:hidden">{tabLabels[tab]}</span>
                  <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${isActive ? "bg-primary/20" : "bg-muted"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── Pack Builder ─────────────────────────────────── */}
        <PackBuilder items={packItems} onRemove={(id) => setPackItems((prev) => prev.filter((p) => p.id !== id))} />

        {/* ─── Filter Toggle (mobile) ──────────────────────── */}
        <button onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden w-full flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-bold">
            <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
            {(activeTab === "tents" ? hasActiveTentFilters : hasActiveGearFilters) && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">Active</span>
            )}
          </div>
          {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Filter Sidebar ────────────────────────────── */}
          <div className={`lg:w-72 flex-shrink-0 ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <div className="lg:sticky lg:top-16 space-y-5">
              {activeTab === "tents" ? (
                /* ─── TENT FILTERS ─── */
                <div className="bg-card border border-border rounded-lg p-4 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Filters</h3>
                    {hasActiveTentFilters && (
                      <button onClick={resetTentFilters} className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wide hover:underline">
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2">Capacity</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((cap) => (
                        <button key={cap} onClick={() => toggleCapacity(cap)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded border transition-colors ${
                            capacity.has(cap) ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                          }`}>{cap}P</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={freestandingOnly} onChange={(e) => setFreestandingOnly(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
                      <span className="text-xs font-bold text-muted-foreground">Freestanding only</span>
                    </label>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2">Price Range</p>
                    <div className="flex items-center gap-2">
                      <input type="number" value={priceMin || ""} onChange={(e) => setPriceMin(parseInt(e.target.value) || 0)} placeholder="Min" className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs" />
                      <span className="text-muted-foreground text-xs">to</span>
                      <input type="number" value={priceMax === 1000 ? "" : priceMax} onChange={(e) => setPriceMax(parseInt(e.target.value) || 1000)} placeholder="Max" className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-muted-foreground">Max Trail Weight</p>
                      <span className="text-xs font-mono text-muted-foreground">{weightMax >= 80 ? "Any" : `${(weightMax / 16).toFixed(1)} lbs`}</span>
                    </div>
                    <input type="range" min={10} max={80} step={2} value={weightMax} onChange={(e) => setWeightMax(parseInt(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2">Setup Type</p>
                    <div className="space-y-1.5">
                      {(Object.entries(setupLabels) as [BackpackingTent["setup"], string][]).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={setupFilter.has(key)} onChange={() => toggleSet(setSetupFilter, key)} className="rounded border-border text-primary focus:ring-primary" />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2">Wind Rating</p>
                    <div className="space-y-1.5">
                      {(Object.entries(windLabels) as [BackpackingTent["windRating"], string][]).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={windFilter.has(key)} onChange={() => toggleSet(setWindFilter, key)} className="rounded border-border text-primary focus:ring-primary" />
                          <span className="text-xs text-muted-foreground"><Badge className={`${windColors[key]} mr-1`}>{label}</Badge></span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2">Season</p>
                    <div className="space-y-1.5">
                      {(Object.entries(seasonLabels) as [BackpackingTent["season"], string][]).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={seasonFilter.has(key)} onChange={() => toggleSet(setSeasonFilter, key)} className="rounded border-border text-primary focus:ring-primary" />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2">Wall Type</p>
                    <div className="space-y-1.5">
                      {(["double", "single", "hybrid"] as const).map((w) => (
                        <label key={w} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={wallFilter.has(w)} onChange={() => toggleSet(setWallFilter, w)} className="rounded border-border text-primary focus:ring-primary" />
                          <span className="text-xs text-muted-foreground">{w === "double" ? "Double Wall" : w === "single" ? "Single Wall" : "Hybrid"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ─── GEAR FILTERS ─── */
                <div className="bg-card border border-border rounded-lg p-4 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Filters</h3>
                    {hasActiveGearFilters && (
                      <button onClick={resetGearFilters} className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wide hover:underline">
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2">Price Range</p>
                    <div className="flex items-center gap-2">
                      <input type="number" value={gearPriceMin || ""} onChange={(e) => setGearPriceMin(parseInt(e.target.value) || 0)} placeholder="Min" className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs" />
                      <span className="text-muted-foreground text-xs">to</span>
                      <input type="number" value={gearPriceMax >= 2000 ? "" : gearPriceMax} onChange={(e) => setGearPriceMax(parseInt(e.target.value) || 2000)} placeholder="Max" className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-muted-foreground">Max Weight</p>
                      <span className="text-xs font-mono text-muted-foreground">{gearWeightMax >= 100 ? "Any" : `${(gearWeightMax / 16).toFixed(1)} lbs`}</span>
                    </div>
                    <input type="range" min={1} max={100} step={1} value={gearWeightMax} onChange={(e) => setGearWeightMax(parseInt(e.target.value))} className="w-full accent-primary" />
                  </div>
                  {/* Dynamic spec filters */}
                  {Object.entries(specFilterOptions).map(([specKey, values]) => (
                    <div key={specKey}>
                      <p className="text-xs font-bold text-muted-foreground mb-2 capitalize">{specKey.replace(/([A-Z])/g, " $1").trim()}</p>
                      <div className="space-y-1.5">
                        {Array.from(values).sort().map((val) => {
                          const current = gearSpecFilter[specKey] || new Set<string>();
                          return (
                            <label key={val} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={current.has(val)}
                                onChange={() => {
                                  setGearSpecFilter((prev) => {
                                    const next = { ...prev };
                                    const set = new Set(next[specKey] || []);
                                    if (set.has(val)) set.delete(val); else set.add(val);
                                    next[specKey] = set;
                                    return next;
                                  });
                                }}
                                className="rounded border-border text-primary focus:ring-primary" />
                              <span className="text-xs text-muted-foreground capitalize">{val}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Main Content ───────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {activeTab === "tents" ? (
              /* ═══ TENTS TAB ═══ */
              <>
                {comparedTents.length >= 2 && <TentComparisonTable compared={comparedTents} onRemove={(id) => toggleCompare(id)} />}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-bold text-foreground">{filteredTents.length}</span> of {tents.length} tents
                  </p>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                    <select value={tentSortKey} onChange={(e) => setTentSortKey(e.target.value as TentSortKey)}
                      className="bg-muted border border-border rounded px-3 py-1.5 text-xs font-bold">
                      {tentSortOptions.map((opt) => (<option key={opt.key} value={opt.key}>{opt.label}</option>))}
                    </select>
                  </div>
                </div>
                {compareIds.size > 0 && compareIds.size < 2 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 mb-4 text-xs text-primary font-bold">
                    Select {2 - compareIds.size} more tent{2 - compareIds.size > 1 ? "s" : ""} to compare (max 4)
                  </div>
                )}
                {filteredTents.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Mountain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-bold">No tents match your filters</p>
                    <button onClick={resetTentFilters} className="mt-3 text-primary text-sm font-bold hover:underline">Reset Filters</button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTents.map((tent) => (
                      <div key={tent.id} className="bg-card border border-border rounded-lg p-4 flex flex-col hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setModalTent(tent)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide truncate">{tent.brand}</p>
                            <h3 className="text-sm font-extrabold truncate">{tent.model}</h3>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2"><p className="text-lg font-extrabold text-primary">${tent.price}</p></div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <div className="flex items-center gap-1 bg-muted rounded px-2 py-1">
                            <Weight className="w-3 h-3 text-primary" />
                            <span className="text-xs font-bold">{formatWeight(tent.weightOz)}</span>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-primary/20">{tent.capacity}P</Badge>
                          <Badge className="bg-primary/10 text-primary border-primary/20">{setupLabels[tent.setup]}</Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <Badge className={windColors[tent.windRating]}><Wind className="w-3 h-3 mr-1" />{windLabels[tent.windRating]}</Badge>
                          <Badge className="bg-muted text-muted-foreground border-border">{seasonLabels[tent.season]}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                          <div className="bg-muted/50 rounded p-1.5">
                            <Layers className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
                            <p className="text-[10px] text-muted-foreground">Floor</p>
                            <p className="text-xs font-bold">{sqInToSqFt(tent.floorArea)} ft</p>
                          </div>
                          <div className="bg-muted/50 rounded p-1.5">
                            <Ruler className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
                            <p className="text-[10px] text-muted-foreground">Peak</p>
                            <p className="text-xs font-bold">{tent.peakHeight}"</p>
                          </div>
                          <div className="bg-muted/50 rounded p-1.5">
                            <DoorOpen className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
                            <p className="text-[10px] text-muted-foreground">Doors</p>
                            <p className="text-xs font-bold">{tent.doors}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                          <button onClick={(e) => { e.stopPropagation(); toggleCompare(tent.id); }}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${compareIds.has(tent.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${compareIds.has(tent.id) ? "bg-primary border-primary" : "border-border"}`}>
                              {compareIds.has(tent.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            Compare
                          </button>
                          <div className="flex items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); togglePackItem(tent.id, `${tent.brand} ${tent.model}`, tent.weightOz); }}
                              className={`text-xs font-bold transition-colors ${packItems.find(p => p.id === tent.id) ? "text-emerald-400" : "text-muted-foreground hover:text-emerald-400"}`}>
                              {packItems.find(p => p.id === tent.id) ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                            <a href={tent.affiliateUrl} target="_blank" rel="noopener noreferrer"
                              onClick={(e) => { e.stopPropagation(); trackEvent("pe_affiliate_click", { tool: "gear-finder", product: `${tent.brand} ${tent.model}`, url: tent.affiliateUrl }); }}
                              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                              Check Price <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* ═══ GEAR TABS ═══ */
              <>
                {comparedGear.length >= 2 && <GearComparisonTable compared={comparedGear} category={activeTab} onRemove={(id) => toggleCompare(id)} />}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-bold text-foreground">{filteredGear.length}</span> of {currentGearList.length} {tabLabels[activeTab]?.toLowerCase()}
                  </p>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                    <select value={gearSortKey} onChange={(e) => setGearSortKey(e.target.value as GearSortKey)}
                      className="bg-muted border border-border rounded px-3 py-1.5 text-xs font-bold">
                      {gearSortOptions.map((opt) => (<option key={opt.key} value={opt.key}>{opt.label}</option>))}
                    </select>
                  </div>
                </div>
                {compareIds.size > 0 && compareIds.size < 2 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 mb-4 text-xs text-primary font-bold">
                    Select {2 - compareIds.size} more to compare (max 4)
                  </div>
                )}
                {filteredGear.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Mountain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-bold">No {tabLabels[activeTab]?.toLowerCase()} match your filters</p>
                    <button onClick={resetGearFilters} className="mt-3 text-primary text-sm font-bold hover:underline">Reset Filters</button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredGear.map((gear) => (
                      <GearCard
                        key={gear.id}
                        gear={gear}
                        category={activeTab}
                        isCompared={compareIds.has(gear.id)}
                        onToggleCompare={() => toggleCompare(gear.id)}
                        onClick={() => setModalGear(gear)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ─── SEO Content Section ──────────────────────────── */}
        <div className="max-w-3xl mt-16 space-y-10">
          <section>
            <h2 className="text-2xl font-extrabold mb-4">How to Choose Ultralight Backpacking Gear</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Going ultralight is not about buying the most expensive gear — it is about making intentional choices
                that reduce weight without sacrificing safety. The biggest weight savings come from your "Big Three":
                shelter, sleep system, and pack. Get those right and everything else is fine-tuning.
              </p>
              <p>
                <strong className="text-foreground">Shelter</strong> is typically your heaviest single item. Ultralight tents
                range from 12 oz (tarps and floorless shelters) to 3 lbs (comfortable 2-person freestanding tents).
                The right choice depends on where you camp, your tolerance for condensation, and whether you need to pitch
                on non-stakeable ground.
              </p>
              <p>
                <strong className="text-foreground">Sleep system</strong> — your sleeping bag/quilt and pad together — usually
                runs 1.5 to 3 lbs total. Down quilts save weight over mummy bags but require a learning curve. Inflatable
                pads are comfortable but fragile; foam pads are indestructible but bulky. The right R-value depends on
                the coldest temps you will encounter.
              </p>
              <p>
                <strong className="text-foreground">Pack</strong> weight correlates with features. Frameless packs under 1 lb
                carry well to 15 lbs. Framed ultralight packs at 1.5-2.5 lbs carry 25-30 lbs comfortably. Traditional
                packs at 3-5 lbs haul 40+ lbs. Match your pack to your total load, not the other way around.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-extrabold mb-4">Understanding Weight in Backpacking</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Base weight</strong> is everything in your pack except consumables
                (food, water, fuel). A traditional backpacker carries 20-30 lbs base weight. Lightweight is under 15 lbs.
                Ultralight is under 10 lbs. Sub-5 lbs is "super ultralight" and requires significant tradeoffs.
              </p>
              <p>
                Every ounce matters on a thru-hike where you walk 2,000+ miles. For weekend trips, a few extra ounces of
                comfort are usually worth it. This tool helps you find the right balance between weight, durability, and price
                for your specific use case.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-extrabold mb-4">Sleeping Bags vs. Quilts</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Mummy bags</strong> are fully enclosed with a zipper and hood. They trap
                warmth well but can feel restrictive. Best for cold sleepers and winter camping.
              </p>
              <p>
                <strong className="text-foreground">Quilts</strong> eliminate the insulation underneath you (which gets
                compressed anyway) and rely on your sleeping pad for bottom insulation. This saves 5-10 oz and lets you
                move freely. Quilts take practice to use well — drafts are possible if the pad attachment fails.
              </p>
              <p>
                <strong className="text-foreground">Down vs. Synthetic</strong>: Down is lighter, more compressible, and
                longer-lasting, but fails when wet. Synthetic retains warmth when wet and costs less, but weighs more and
                loses loft faster. Water-resistant down treatments (DownTek, Nikwax) split the difference.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-extrabold mb-4">Choosing the Right Sleeping Pad</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">R-value</strong> measures insulation from the cold ground. R-value 2-3
                is fine for summer. R-value 4-5 handles 3+ seasons. R-value 6+ is for winter and snow camping. R-values
                are additive — stack a foam pad (R-2) under an inflatable (R-4) for an R-6 system.
              </p>
              <p>
                <strong className="text-foreground">Inflatable pads</strong> offer the best comfort-to-weight ratio but can
                puncture. <strong className="text-foreground">Foam pads</strong> are indestructible and instant to set up
                but bulky and less comfortable. Many hikers carry both — a foam pad as a backup and sitting pad, and an
                inflatable as their primary sleep surface.
              </p>
            </div>
          </section>
        </div>

        {/* ─── Privacy + Support ─────────────────────────────── */}
        <div className="max-w-3xl mt-12 space-y-6">
          <DataPrivacyNotice />
          <SupportFooter />
        </div>
      </div>

      {/* ─── Modals ──────────────────────────────────────────── */}
      {modalTent && <TentModal tent={modalTent} onClose={() => setModalTent(null)} />}
      {modalGear && <GearModal gear={modalGear} onClose={() => setModalGear(null)} />}
    </div>
  );
}

// ─── Helper: filterable spec keys per category ───────────────────────────────
function getFilterableSpecs(category: GearCategory | "tents"): string[] {
  switch (category) {
    case "sleeping-bags": return ["fillType", "shape"];
    case "sleeping-pads": return ["type"];
    case "packs": return ["frameType"];
    case "stoves": return ["fuelType"];
    case "cookware": return ["material"];
    case "rain-gear": return ["pitZips"];
    case "insulation": return ["fillType", "hood"];
    case "trekking-poles": return ["material"];
    case "headlamps": return ["batteryType"];
    case "shelters": return ["type", "windRating", "wallsIncluded"];
    default: return [];
  }
}
