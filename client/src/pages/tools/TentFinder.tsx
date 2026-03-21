import { useState, useMemo, useCallback, useEffect } from "react";
import {
  SlidersHorizontal, X, ChevronDown, ChevronUp, ExternalLink,
  ArrowUpDown, RotateCcw, Check, Mountain, Wind, Layers,
  Ruler, DoorOpen, Weight, Info, Tent,
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
import { vehicleDatabase } from "./vehicle-db";

// ─── Sort options ────────────────────────────────────────────────────────
type SortKey =
  | "lightest"
  | "heaviest"
  | "cheapest"
  | "expensive"
  | "value"
  | "floor"
  | "tallest";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "lightest", label: "Lightest First" },
  { key: "heaviest", label: "Heaviest First" },
  { key: "cheapest", label: "Lowest Price" },
  { key: "expensive", label: "Highest Price" },
  { key: "value", label: "Best Value (oz/$)" },
  { key: "floor", label: "Most Floor Area" },
  { key: "tallest", label: "Tallest Peak Height" },
];

function sortTents(list: BackpackingTent[], key: SortKey): BackpackingTent[] {
  const sorted = [...list];
  switch (key) {
    case "lightest":
      return sorted.sort((a, b) => a.weightOz - b.weightOz);
    case "heaviest":
      return sorted.sort((a, b) => b.weightOz - a.weightOz);
    case "cheapest":
      return sorted.sort((a, b) => a.price - b.price);
    case "expensive":
      return sorted.sort((a, b) => b.price - a.price);
    case "value":
      return sorted.sort(
        (a, b) => a.price / a.weightOz - b.price / b.weightOz
      );
    case "floor":
      return sorted.sort((a, b) => b.floorArea - a.floorArea);
    case "tallest":
      return sorted.sort((a, b) => b.peakHeight - a.peakHeight);
  }
}

// ─── Badge component ─────────────────────────────────────────────────────
function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center text-xs font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Comparison Table ────────────────────────────────────────────────────
function ComparisonTable({
  compared,
  onRemove,
}: {
  compared: BackpackingTent[];
  onRemove: (id: string) => void;
}) {
  const rows: { label: string; render: (t: BackpackingTent) => React.ReactNode }[] = [
    { label: "Trail Weight", render: (t) => formatWeight(t.weightOz) },
    { label: "Packed Weight", render: (t) => formatWeight(t.packedWeightOz) },
    { label: "Price", render: (t) => `$${t.price}` },
    { label: "Setup", render: (t) => setupLabels[t.setup] },
    { label: "Season", render: (t) => seasonLabels[t.season] },
    {
      label: "Wind Rating",
      render: (t) => (
        <Badge className={windColors[t.windRating]}>
          {windLabels[t.windRating]}
        </Badge>
      ),
    },
    { label: "Wall Type", render: (t) => t.wallType === "double" ? "Double Wall" : t.wallType === "single" ? "Single Wall" : "Hybrid" },
    { label: "Floor Area", render: (t) => `${sqInToSqFt(t.floorArea)} sq ft` },
    { label: "Vestibule", render: (t) => t.vestibuleArea > 0 ? `${sqInToSqFt(t.vestibuleArea)} sq ft` : "None" },
    { label: "Peak Height", render: (t) => `${t.peakHeight} in` },
    { label: "Doors", render: (t) => `${t.doors}` },
    { label: "Stakes", render: (t) => `${t.stakes}${t.stakesIncluded ? " (incl.)" : " (not incl.)"}` },
    { label: "Packed Size", render: (t) => t.packedSize },
    { label: "Fly Fabric", render: (t) => t.fabricFly },
    { label: "Floor Fabric", render: (t) => t.fabricFloor },
    { label: "Poles", render: (t) => t.poles },
    { label: "Made In", render: (t) => t.madeIn },
    { label: "Footprint Incl.", render: (t) => t.footprintIncluded ? "Yes" : "No" },
  ];

  return (
    <div className="bg-card border-2 border-primary/30 rounded-lg overflow-hidden mb-8 animate-fade-in-up">
      <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border">
        <h3 className="font-extrabold text-sm uppercase tracking-wide">
          Comparison ({compared.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 min-w-[120px] text-muted-foreground text-sm font-bold uppercase tracking-wide">
                Spec
              </th>
              {compared.map((t) => (
                <th key={t.id} className="p-3 min-w-[160px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-left">
                      <div className="text-sm text-muted-foreground">{t.brand}</div>
                      <div className="text-sm font-bold">{t.model}</div>
                    </div>
                    <button
                      onClick={() => onRemove(t.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                      aria-label={`Remove ${t.model}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={i % 2 === 0 ? "bg-muted/30" : ""}
              >
                <td className="p-3 text-sm font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  {row.label}
                </td>
                {compared.map((t) => (
                  <td key={t.id} className="p-3 text-sm">
                    {row.render(t)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tent Detail Modal ───────────────────────────────────────────────────
function TentModal({
  tent,
  onClose,
}: {
  tent: BackpackingTent;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-wide">
              {tent.brand}
            </p>
            <h2 className="text-xl font-extrabold">{tent.model}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {tent.capacity}P
          </Badge>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {setupLabels[tent.setup]}
          </Badge>
          <Badge className={windColors[tent.windRating]}>
            Wind: {windLabels[tent.windRating]}
          </Badge>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {seasonLabels[tent.season]}
          </Badge>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {tent.wallType === "double" ? "Double Wall" : tent.wallType === "single" ? "Single Wall" : "Hybrid"}
          </Badge>
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
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-sm font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Fly Fabric
            </p>
            <p className="text-sm">{tent.fabricFly}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Floor Fabric
            </p>
            <p className="text-sm">{tent.fabricFloor}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Poles
            </p>
            <p className="text-sm">{tent.poles}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Made In
            </p>
            <p className="text-sm">{tent.madeIn}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-sm font-bold text-green-400 uppercase tracking-wide mb-2">
              Pros
            </p>
            <ul className="space-y-1">
              {tent.pros.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-red-400 uppercase tracking-wide mb-2">
              Cons
            </p>
            <ul className="space-y-1">
              {tent.cons.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 mb-5">
          <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">
            Best For
          </p>
          <p className="text-sm">{tent.bestFor}</p>
        </div>

        {tent.notes && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-5">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">{tent.notes}</p>
            </div>
          </div>
        )}

        <a
          href={tent.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent("pe_affiliate_click", {
              tool: "tent-finder",
              product: `${tent.brand} ${tent.model}`,
              url: tent.affiliateUrl,
            })
          }
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wide rounded-lg px-5 py-3 hover:bg-primary/90 transition-colors"
        >
          Check Price <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function TentFinder() {
  useSEO({
    title: "Backpacking Tent Finder | Compare 50+ Ultralight Tents",
    description:
      "Find the perfect ultralight backpacking tent. Filter by weight, price, setup type, wind rating, and more. Compare specs side-by-side across 50+ tents from Zpacks, Big Agnes, NEMO, MSR, Durston, and more.",
  });

  // ─── Filter state ───────────────────────────────────────────
  const [capacity, setCapacity] = useState<Set<number>>(new Set());
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);
  const [weightMax, setWeightMax] = useState(80);
  const [setupFilter, setSetupFilter] = useState<Set<string>>(new Set());
  const [seasonFilter, setSeasonFilter] = useState<Set<string>>(new Set());
  const [windFilter, setWindFilter] = useState<Set<string>>(new Set());
  const [wallFilter, setWallFilter] = useState<Set<string>>(new Set());
  const [freestandingOnly, setFreestandingOnly] = useState(false);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // ─── Sort / compare / modal state ──────────────────────────
  const [sortKey, setSortKey] = useState<SortKey>("lightest");
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [modalTent, setModalTent] = useState<BackpackingTent | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ─── Analytics ──────────────────────────────────────────────
  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "tent-finder" });
  }, []);

  // ─── Filter helpers ─────────────────────────────────────────
  const toggleSet = useCallback(
    (setter: React.Dispatch<React.SetStateAction<Set<string>>>, val: string) => {
      setter((prev) => {
        const next = new Set(prev);
        if (next.has(val)) next.delete(val);
        else next.add(val);
        return next;
      });
    },
    []
  );

  const toggleCapacity = useCallback((val: number) => {
    setCapacity((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setCapacity(new Set());
    setPriceMin(0);
    setPriceMax(1000);
    setWeightMax(80);
    setSetupFilter(new Set());
    setSeasonFilter(new Set());
    setWindFilter(new Set());
    setWallFilter(new Set());
    setFreestandingOnly(false);
    setSelectedVehicleId(null);
  }, []);

  // ─── Vehicle roof filter ────────────────────────────────────
  const selectedVehicle = vehicleDatabase.find(
    (v) => `${v.year}-${v.make}-${v.model}-${v.trim}` === selectedVehicleId
  ) ?? null;

  // ─── Filter + sort ─────────────────────────────────────────
  const filtered = useMemo(() => {
    const roofLimitOz = selectedVehicle ? selectedVehicle.roofDynamicLbs * 16 : null;
    let result = tents.filter((t) => {
      if (capacity.size > 0 && !capacity.has(t.capacity)) return false;
      if (t.price < priceMin || t.price > priceMax) return false;
      if (t.weightOz > weightMax) return false;
      if (setupFilter.size > 0 && !setupFilter.has(t.setup)) return false;
      if (seasonFilter.size > 0 && !seasonFilter.has(t.season)) return false;
      if (windFilter.size > 0 && !windFilter.has(t.windRating)) return false;
      if (wallFilter.size > 0 && !wallFilter.has(t.wallType)) return false;
      if (freestandingOnly && t.setup !== "freestanding") return false;
      if (roofLimitOz !== null && t.weightOz > roofLimitOz) return false;
      return true;
    });
    return sortTents(result, sortKey);
  }, [
    capacity,
    priceMin,
    priceMax,
    weightMax,
    setupFilter,
    seasonFilter,
    windFilter,
    wallFilter,
    freestandingOnly,
    selectedVehicle,
    sortKey,
  ]);

  const comparedTents = useMemo(
    () => tents.filter((t) => compareIds.has(t.id)),
    [compareIds]
  );

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const hasActiveFilters =
    capacity.size > 0 ||
    priceMin > 0 ||
    priceMax < 1000 ||
    weightMax < 80 ||
    setupFilter.size > 0 ||
    seasonFilter.size > 0 ||
    windFilter.size > 0 ||
    wallFilter.size > 0 ||
    freestandingOnly ||
    selectedVehicleId !== null;

  return (
    <div className="bg-background min-h-screen">
      {/* ─── Hero ───────────────────────────────────────────── */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tent className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground/50 uppercase tracking-wider">
              v1.0
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Backpacking Tent Finder
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Compare 50+ ultralight backpacking tents side by side. Filter by weight,
            price, setup type, wind rating, and more. Every spec is sourced from
            manufacturer data. Click any tent for full details, pros/cons, and a direct
            link to buy.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── Filter Toggle (mobile) ─────────────────────── */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden w-full flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 mb-4"
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
          {filtersOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Filter Sidebar ─────────────────────────────── */}
          <div
            className={`lg:w-72 flex-shrink-0 ${
              filtersOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="lg:sticky lg:top-4 space-y-5">
              <div className="bg-card border border-border rounded-lg p-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Filters
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-wide hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>

                {/* Capacity */}
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-2">
                    Capacity
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((cap) => (
                      <button
                        key={cap}
                        onClick={() => toggleCapacity(cap)}
                        className={`flex-1 py-1.5 text-sm font-bold rounded border transition-colors ${
                          capacity.has(cap)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                        }`}
                      >
                        {cap}P
                      </button>
                    ))}
                  </div>
                </div>

                {/* Can't Stake Here (freestanding only) */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freestandingOnly}
                      onChange={(e) => setFreestandingOnly(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-bold text-muted-foreground">
                      Freestanding only (desert/slickrock)
                    </span>
                  </label>
                </div>

                {/* Price Range */}
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-2">
                    Price Range
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={priceMin || ""}
                        onChange={(e) =>
                          setPriceMin(parseInt(e.target.value) || 0)
                        }
                        placeholder="Min"
                        className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <span className="text-muted-foreground text-sm">to</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={priceMax === 1000 ? "" : priceMax}
                        onChange={(e) =>
                          setPriceMax(parseInt(e.target.value) || 1000)
                        }
                        placeholder="Max"
                        className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight Max */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-muted-foreground">
                      Max Trail Weight
                    </p>
                    <span className="text-sm font-mono text-muted-foreground">
                      {weightMax >= 80
                        ? "Any"
                        : `${(weightMax / 16).toFixed(1)} lbs`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    step={2}
                    value={weightMax}
                    onChange={(e) => setWeightMax(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground/60 mt-0.5">
                    <span>10 oz</span>
                    <span>5 lbs</span>
                  </div>
                </div>

                {/* Setup Type */}
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-2">
                    Setup Type
                  </p>
                  <div className="space-y-1.5">
                    {(
                      Object.entries(setupLabels) as [
                        BackpackingTent["setup"],
                        string
                      ][]
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={setupFilter.has(key)}
                          onChange={() => toggleSet(setSetupFilter, key)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Wind Rating */}
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-2">
                    Wind Rating
                  </p>
                  <div className="space-y-1.5">
                    {(
                      Object.entries(windLabels) as [
                        BackpackingTent["windRating"],
                        string
                      ][]
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={windFilter.has(key)}
                          onChange={() => toggleSet(setWindFilter, key)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          <Badge className={`${windColors[key]} mr-1`}>
                            {label}
                          </Badge>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Season */}
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-2">
                    Season
                  </p>
                  <div className="space-y-1.5">
                    {(
                      Object.entries(seasonLabels) as [
                        BackpackingTent["season"],
                        string
                      ][]
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={seasonFilter.has(key)}
                          onChange={() => toggleSet(setSeasonFilter, key)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Wall Type */}
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-2">
                    Wall Type
                  </p>
                  <div className="space-y-1.5">
                    {(["double", "single", "hybrid"] as const).map((w) => (
                      <label
                        key={w}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={wallFilter.has(w)}
                          onChange={() => toggleSet(setWallFilter, w)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          {w === "double"
                            ? "Double Wall"
                            : w === "single"
                            ? "Single Wall"
                            : "Hybrid"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Vehicle Roof Filter */}
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-2">
                    Filter by Your Vehicle
                  </p>
                  <select
                    value={selectedVehicleId ?? ""}
                    onChange={(e) =>
                      setSelectedVehicleId(e.target.value || null)
                    }
                    className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">Select your vehicle</option>
                    {vehicleDatabase.map((v) => {
                      const id = `${v.year}-${v.make}-${v.model}-${v.trim}`;
                      return (
                        <option key={id} value={id}>
                          {v.year} {v.make} {v.model} — {v.trim}
                        </option>
                      );
                    })}
                  </select>
                  {selectedVehicle && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Filters to tents your roof rack can safely carry (dynamic limit:{" "}
                        <span className="font-bold text-foreground">
                          {selectedVehicle.roofDynamicLbs} lbs
                        </span>
                        )
                      </p>
                      <button
                        onClick={() => setSelectedVehicleId(null)}
                        className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <X className="w-3 h-3" /> Clear vehicle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Main Content ──────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Compare panel */}
            {comparedTents.length >= 2 && (
              <ComparisonTable
                compared={comparedTents}
                onRemove={(id) => toggleCompare(id)}
              />
            )}

            {/* Sort bar + results count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-bold text-foreground">
                  {filtered.length}
                </span>{" "}
                of {tents.length} tents
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="bg-muted border border-border rounded px-3 py-1.5 text-sm font-bold"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Compare hint */}
            {compareIds.size > 0 && compareIds.size < 2 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 mb-4 text-sm text-primary font-bold">
                Select {2 - compareIds.size} more tent
                {2 - compareIds.size > 1 ? "s" : ""} to compare (max 4)
              </div>
            )}

            {/* Tent Grid */}
            {filtered.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Mountain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">
                  No tents match your filters
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-3 text-primary text-sm font-bold hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((tent) => (
                  <div
                    key={tent.id}
                    className="bg-card border border-border rounded-lg p-4 flex flex-col hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => setModalTent(tent)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide truncate">
                          {tent.brand}
                        </p>
                        <h3 className="text-sm font-extrabold truncate">
                          {tent.model}
                        </h3>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-lg font-extrabold text-primary">
                          ${tent.price}
                        </p>
                      </div>
                    </div>

                    {/* Weight + badges row */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <div className="flex items-center gap-1 bg-muted rounded px-2 py-1">
                        <Weight className="w-3 h-3 text-primary" />
                        <span className="text-sm font-bold">
                          {formatWeight(tent.weightOz)}
                        </span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {tent.capacity}P
                      </Badge>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {setupLabels[tent.setup]}
                      </Badge>
                    </div>

                    {/* Badges row 2 */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <Badge className={windColors[tent.windRating]}>
                        <Wind className="w-3 h-3 mr-1" />
                        {windLabels[tent.windRating]}
                      </Badge>
                      <Badge className="bg-muted text-muted-foreground border-border">
                        {seasonLabels[tent.season]}
                      </Badge>
                      <Badge className="bg-muted text-muted-foreground border-border">
                        {tent.wallType === "double"
                          ? "Double"
                          : tent.wallType === "single"
                          ? "Single"
                          : "Hybrid"}
                      </Badge>
                    </div>

                    {/* Quick specs */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-muted/50 rounded p-1.5">
                        <Layers className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
                        <p className="text-xs text-muted-foreground">
                          Floor
                        </p>
                        <p className="text-sm font-bold">
                          {sqInToSqFt(tent.floorArea)} ft
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded p-1.5">
                        <Ruler className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
                        <p className="text-xs text-muted-foreground">
                          Peak
                        </p>
                        <p className="text-sm font-bold">{tent.peakHeight}"</p>
                      </div>
                      <div className="bg-muted/50 rounded p-1.5">
                        <DoorOpen className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
                        <p className="text-xs text-muted-foreground">
                          Doors
                        </p>
                        <p className="text-sm font-bold">{tent.doors}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(tent.id);
                        }}
                        className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${
                          compareIds.has(tent.id)
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            compareIds.has(tent.id)
                              ? "bg-primary border-primary"
                              : "border-border"
                          }`}
                        >
                          {compareIds.has(tent.id) && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        Compare
                      </button>
                      <a
                        href={tent.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackEvent("pe_affiliate_click", {
                            tool: "tent-finder",
                            product: `${tent.brand} ${tent.model}`,
                            url: tent.affiliateUrl,
                          });
                        }}
                        className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                      >
                        Check Price{" "}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── SEO Content Section ─────────────────────────── */}
        <div className="max-w-3xl mt-16 space-y-10">
          <section>
            <h2 className="text-2xl font-extrabold mb-4">
              How to Choose an Ultralight Backpacking Tent
            </h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Choosing a backpacking tent comes down to a few key trade-offs: weight
                vs. durability, cost vs. features, and weather protection vs.
                ventilation. There is no single best tent for everyone — your ideal
                shelter depends on where you camp, how far you hike, and what
                conditions you expect.
              </p>
              <p>
                <strong className="text-foreground">Weight</strong> is the first
                filter for most backpackers. Trail weight (the tent body, fly, and
                poles) is the number that matters on the trail. Packed weight adds
                stakes, stuff sacks, and guy lines. If you are doing a thru-hike,
                every ounce matters. For weekend trips, a few extra ounces buy
                significant comfort and durability.
              </p>
              <p>
                <strong className="text-foreground">Price</strong> varies wildly.
                Budget-friendly options from Naturehike and 3F UL Gear get you on the
                trail under $200. Mid-range tents from Durston, REI, and Tarptent
                ($240-$500) hit the sweet spot of value. Premium offerings from
                Zpacks, HMG, and Hilleberg ($600-$950+) deliver the lightest weights
                and most durable materials.
              </p>
              <p>
                <strong className="text-foreground">Setup type</strong> affects where
                you can camp. Freestanding tents pitch on any surface — including
                slickrock, sand, and platforms — without stakes. Trekking pole tents
                save weight but need stakeable ground and your hiking poles. If you
                camp in the desert or above treeline on exposed rock, freestanding is
                non-negotiable.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-extrabold mb-4">
              Freestanding vs. Trekking Pole Tents
            </h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Freestanding tents</strong> use
                dedicated poles that hold the tent up without any stakes. You can pick
                the whole tent up and move it after pitching. Stakes are still
                recommended for wind resistance, but the tent stands on its own. Best
                for: established campsites, desert camping, platforms, rocky ground,
                and anyone who wants simplicity.
              </p>
              <p>
                <strong className="text-foreground">Semi-freestanding tents</strong>{" "}
                need 1-2 stakes (usually at the foot end) to hold their shape, but the
                body is mostly self-supporting. This is the most common ultralight
                design — it saves weight over full freestanding while remaining fairly
                versatile. Most Big Agnes, NEMO, and MSR ultralight tents fall here.
              </p>
              <p>
                <strong className="text-foreground">Trekking pole tents</strong> use
                your hiking poles as the structural support. This eliminates the weight
                of dedicated tent poles entirely, often saving 8-16 oz. The trade-off:
                you need trekking poles, you need stakeable ground, and setup can take
                longer. Brands like Durston, Tarptent, Zpacks, and Gossamer Gear
                specialize here.
              </p>
              <p>
                <strong className="text-foreground">
                  Non-freestanding tents
                </strong>{" "}
                (tunnels, tarps) rely entirely on stakes and guy lines. They are
                typically the lightest option but the most site-dependent. Hilleberg
                tunnels are the exception — they trade light weight for extreme
                durability and weather protection.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-extrabold mb-4">
              Understanding Tent Weight Ratings
            </h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Tent manufacturers use confusing weight terminology. Here is what
                actually matters:
              </p>
              <p>
                <strong className="text-foreground">
                  Trail weight (minimum weight)
                </strong>{" "}
                = tent body + fly + poles. This is what you actually carry. It is the
                most useful number for comparison shopping.
              </p>
              <p>
                <strong className="text-foreground">Packed weight</strong> = trail
                weight + stakes + stuff sacks + guy lines + repair kit. This is
                everything in the bag. It is what your scale reads when you weigh the
                whole package.
              </p>
              <p>
                <strong className="text-foreground">Fast-pitch weight</strong> = fly +
                poles only (no inner body). Some tents support pitching just the fly
                for rain protection when bugs are not a concern, dropping weight
                significantly.
              </p>
              <p>
                In this tool, we list <strong className="text-foreground">trail weight</strong> as the
                primary weight and packed weight as a secondary reference. All weights
                are sourced from manufacturer specifications.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-extrabold mb-4">
              Wind Ratings Explained
            </h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Most tent reviews ignore wind performance, but it matters — especially
                if you camp above treeline, in exposed desert, or during shoulder
                season storms. We rate each tent based on its pole structure, profile
                height, guy point count, and real-world reviews:
              </p>
              <ul className="space-y-2 ml-4">
                <li>
                  <Badge className={`${windColors.storm} mr-2`}>Storm</Badge>
                  Tested or rated for 40+ mph winds. Multiple pole intersections, low
                  profile, bombproof construction. Hilleberg, Kuiu Storm Star, HMG
                  UltaMid.
                </li>
                <li>
                  <Badge className={`${windColors.high} mr-2`}>High</Badge>
                  Handles 30-40 mph gusts. Good for exposed ridgelines and mountain
                  passes. MSR Hubba Hubba, Durston X-Mid, Slingfin Portal.
                </li>
                <li>
                  <Badge className={`${windColors.moderate} mr-2`}>Moderate</Badge>
                  Fine in 15-30 mph winds. Typical 3-season performance for sheltered
                  sites. Most Big Agnes, NEMO, and REI tents.
                </li>
                <li>
                  <Badge className={`${windColors.low} mr-2`}>Low</Badge>
                  Best for sheltered conditions only. Budget tents with thinner poles
                  or minimal guy points.
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* ─── Privacy + Support ───────────────────────────── */}
        <div className="max-w-3xl mt-12 space-y-6">
          <DataPrivacyNotice />
          <SupportFooter />
        </div>
      </div>

      {/* ─── Modal ─────────────────────────────────────────── */}
      {modalTent && (
        <TentModal tent={modalTent} onClose={() => setModalTent(null)} />
      )}
    </div>
  );
}
