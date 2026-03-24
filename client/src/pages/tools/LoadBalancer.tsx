import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Weight, Truck, AlertTriangle, CheckCircle, Gauge, Package,
  Plus, Trash2, ChevronUp, ChevronDown, X, Users, Fuel,
  Info, RotateCcw, ChevronRight,
} from "lucide-react";
import { vehicleDatabase } from "./vehicle-db";
import { gearItems } from "./load-balancer-data";
import { calculateLoad } from "./load-balancer-compute";
import type {
  LoadConfig, LoadEntry, LoadResult, PlacementZone,
  GearCategory, LoadStatus, StabilityRisk,
} from "./load-balancer-compute";
import type { GearItem } from "./load-balancer-compute";
import type { StockVehicle } from "./vehicle-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import ToolSafetyDisclaimer from "@/components/tools/ToolSafetyDisclaimer";
import { useSEO } from "@/hooks/useSEO";
import { GuidedTour } from "./GuidedTour";

const LB_TOUR = [
  { title: "Select Your Vehicle", body: "Search or pick your rig from the database. The balancer loads your real GVWR, curb weight, and roof rating — these are the hard limits you're working within." },
  { title: "People & Fuel", body: "Set passenger count, weights, and how full your fuel tank is. Most people forget these — fuel alone is 150-200 lbs on a full-size truck." },
  { title: "Build Your Gear List", body: "Add gear from the library or enter custom items. Assign each one a placement zone: cab, bed-front, bed-rear, roof, or hitch. Zone placement affects your axle balance, not just total weight." },
  { title: "Read the Payload Gauge", body: "The gauge shows payload % used. Green is safe, yellow means getting close, red means remove gear before you drive. Over 100% is a legal and safety issue, not just a guideline." },
  { title: "Axle Balance & Stability", body: "The axle bars show front/rear weight split. Over 65% on the rear means move heavier gear toward the cab. The Stability Risk badge combines roof load, rear bias, and payload into one verdict." },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "lb-ops-deck-v1";

const ZONE_LABELS: Record<PlacementZone, string> = {
  cab: "Cab",
  roof: "Roof",
  "bed-front": "Bed Front",
  "bed-rear": "Bed Rear",
  hitch: "Hitch",
};

const CATEGORY_LABELS: Record<GearCategory | "all", string> = {
  all: "All",
  shelter: "Shelter",
  recovery: "Recovery",
  "water-fuel": "Water/Fuel",
  power: "Power",
  kitchen: "Kitchen",
  medical: "Medical",
  comms: "Comms",
  navigation: "Navigation",
  clothing: "Clothing",
  tools: "Tools",
  other: "Other",
};

const ALL_CATEGORIES: Array<GearCategory | "all"> = [
  "all", "shelter", "recovery", "water-fuel", "power",
  "kitchen", "medical", "comms", "navigation", "clothing", "tools", "other",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function buildKey(v: StockVehicle): string {
  return `${v.year}-${v.make}-${v.model}-${v.trim}`.toLowerCase().replace(/\s+/g, "-");
}

function fmtLbs(n: number): string {
  return Math.round(n).toLocaleString();
}

function getStatusColors(status: LoadStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case "safe":    return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", border: "border-green-500" };
    case "warning": return { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-500" };
    case "danger":  return { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500" };
    case "over":    return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", border: "border-red-500" };
  }
}

function getRiskColors(risk: StabilityRisk): { badge: string; dot: string } {
  switch (risk) {
    case "low":      return { badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", dot: "bg-green-500" };
    case "moderate": return { badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", dot: "bg-yellow-500" };
    case "high":     return { badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", dot: "bg-orange-500" };
    case "critical": return { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" };
  }
}

// ─── Stored State ─────────────────────────────────────────────────────────────

interface StoredState {
  vehicleKey: string;
  entries: LoadEntry[];
  passengerCount: number;
  driverWeightLbs: number;
  avgPassengerWeightLbs: number;
  fuelFillPct: number;
  trailerTongueLbs: number;
}

function loadState(): Partial<StoredState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Tip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="text-muted-foreground hover:text-primary transition-colors align-middle"
        aria-label="More info"
      >
        <Info className="w-3 h-3" />
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-popover border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-xl z-50 pointer-events-none block text-left leading-relaxed font-normal normal-case tracking-normal">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border block" />
        </span>
      )}
    </span>
  );
}

function PayloadGauge({ pct, status }: { pct: number; status: LoadStatus }) {
  const clampedPct = Math.min(110, Math.max(0, pct));
  const { text } = getStatusColors(status);
  const barColor =
    status === "safe" ? "bg-green-500"
    : status === "warning" ? "bg-yellow-500"
    : status === "danger" ? "bg-orange-500"
    : "bg-red-500";

  return (
    <div className="relative w-full">
      <div className="w-full h-6 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(100, clampedPct)}%` }}
        />
      </div>
      {/* tick marks */}
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-0.5">
        <span>0%</span>
        <span>|80%</span>
        <span>|93%</span>
        <span>100%</span>
      </div>
      {/* threshold lines */}
      <div className="absolute top-0 left-[80%] h-6 w-px bg-yellow-400/60" />
      <div className="absolute top-0 left-[93%] h-6 w-px bg-orange-400/60" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LoadBalancer() {
  useSEO({
    title: "Overland Load Balancer Ops Deck | Prepper Evolution",
    description:
      "Know your numbers before you load up. Real payload math: total loaded weight vs GVWR, axle distribution, roof load check, and safety warnings for 60+ overlanding vehicles.",
  });

  // ── State ──
  const saved = useMemo(() => loadState(), []);

  const [vehicleKey, setVehicleKey] = useState<string>(saved.vehicleKey ?? "");
  const [entries, setEntries] = useState<LoadEntry[]>(saved.entries ?? []);
  const [passengerCount, setPassengerCount] = useState<number>(saved.passengerCount ?? 0);
  const [driverWeightLbs, setDriverWeightLbs] = useState<number>(saved.driverWeightLbs ?? 185);
  const [avgPassengerWeightLbs, setAvgPassengerWeightLbs] = useState<number>(saved.avgPassengerWeightLbs ?? 175);
  const [fuelFillPct, setFuelFillPct] = useState<number>(saved.fuelFillPct ?? 100);
  const [trailerTongueLbs, setTrailerTongueLbs] = useState<number>(saved.trailerTongueLbs ?? 0);

  // Gear picker UI state
  const [gearPickerOpen, setGearPickerOpen] = useState(false);
  const [gearPickerCategory, setGearPickerCategory] = useState<GearCategory | "all">("all");
  const [gearSearch, setGearSearch] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customWeight, setCustomWeight] = useState("");
  const [customZone, setCustomZone] = useState<PlacementZone>("bed-rear");

  // Vehicle search state
  const [vehicleSearch, setVehicleSearch] = useState("");

  // ── Derived ──
  const selectedVehicle = useMemo(
    () => vehicleDatabase.find((v) => buildKey(v) === vehicleKey),
    [vehicleKey],
  );

  const result = useMemo<LoadResult | null>(() => {
    if (!selectedVehicle) return null;
    return calculateLoad(
      {
        curbWeightLbs: selectedVehicle.curbWeightLbs,
        gvwrLbs: selectedVehicle.gvwrLbs,
        fuelTankGal: selectedVehicle.fuelTankGal,
        frontWeightPct: selectedVehicle.frontWeightPct,
        roofStaticLbs: selectedVehicle.roofStaticLbs,
      },
      {
        vehicleKey,
        entries,
        passengerCount,
        driverWeightLbs,
        avgPassengerWeightLbs,
        fuelFillPct,
        trailerTongueLbs,
      },
    );
  }, [selectedVehicle, vehicleKey, entries, passengerCount, driverWeightLbs, avgPassengerWeightLbs, fuelFillPct, trailerTongueLbs]);

  // ── Persist ──
  useEffect(() => {
    const state: StoredState = {
      vehicleKey, entries, passengerCount,
      driverWeightLbs, avgPassengerWeightLbs, fuelFillPct, trailerTongueLbs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [vehicleKey, entries, passengerCount, driverWeightLbs, avgPassengerWeightLbs, fuelFillPct, trailerTongueLbs]);

  // ── Vehicle selector ──
  const uniqueMakes = useMemo(
    () => [...new Set(vehicleDatabase.map((v) => v.make))].sort(),
    [],
  );

  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return vehicleDatabase;
    const q = vehicleSearch.toLowerCase();
    return vehicleDatabase.filter((v) =>
      `${v.year} ${v.make} ${v.model} ${v.trim}`.toLowerCase().includes(q),
    );
  }, [vehicleSearch]);

  const vehiclesByMake = useMemo(() => {
    const map: Record<string, StockVehicle[]> = {};
    for (const v of filteredVehicles) {
      if (!map[v.make]) map[v.make] = [];
      map[v.make].push(v);
    }
    return map;
  }, [filteredVehicles]);

  // ── Gear helpers ──
  const filteredGear = useMemo(() => {
    return gearItems.filter((g) => {
      const matchCat = gearPickerCategory === "all" || g.category === gearPickerCategory;
      const matchSearch = !gearSearch.trim() || g.name.toLowerCase().includes(gearSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [gearPickerCategory, gearSearch]);

  const addGearItem = useCallback((item: GearItem) => {
    setEntries((prev) => {
      // bump qty if same item already in same zone
      const existing = prev.find((e) => e.gearItemId === item.id && e.zone === item.defaultZone);
      if (existing) {
        return prev.map((e) =>
          e.id === existing.id ? { ...e, qty: e.qty + 1 } : e,
        );
      }
      return [
        ...prev,
        {
          id: makeId(),
          gearItemId: item.id,
          name: item.name,
          zone: item.defaultZone,
          qty: 1,
          weightPerUnit: item.weightPerUnit,
        },
      ];
    });
  }, []);

  const addCustomItem = useCallback(() => {
    const w = parseFloat(customWeight);
    if (!customName.trim() || isNaN(w) || w <= 0) return;
    setEntries((prev) => [
      ...prev,
      {
        id: makeId(),
        gearItemId: "custom",
        name: customName.trim(),
        zone: customZone,
        qty: 1,
        weightPerUnit: w,
      },
    ]);
    setCustomName("");
    setCustomWeight("");
    setShowCustomForm(false);
  }, [customName, customWeight, customZone]);

  const updateEntry = useCallback((id: string, field: keyof LoadEntry, value: unknown) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const zoneTotals = useMemo(() => {
    const t: Record<PlacementZone, number> = { cab: 0, roof: 0, "bed-front": 0, "bed-rear": 0, hitch: 0 };
    for (const e of entries) t[e.zone] += e.qty * e.weightPerUnit;
    return t;
  }, [entries]);

  const totalGearLbs = useMemo(
    () => Object.values(zoneTotals).reduce((a, b) => a + b, 0),
    [zoneTotals],
  );

  const resetAll = useCallback(() => {
    if (!confirm("Reset all load data?")) return;
    setVehicleKey("");
    setEntries([]);
    setPassengerCount(0);
    setDriverWeightLbs(185);
    setAvgPassengerWeightLbs(175);
    setFuelFillPct(100);
    setTrailerTongueLbs(0);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ─── */}
        <div className="max-w-3xl mb-10 animate-fade-in-up">
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
            Ops Deck
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            Overland Load Balancer <span className="text-primary">Ops Deck</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Know your numbers before you load up. Pick your vehicle, add gear by
            placement zone, and see real payload math — total weight vs GVWR, axle
            distribution, roof load check, and safety warnings.
          </p>
          <p className="text-primary text-sm font-bold mt-3">
            Know your numbers before you load up.
          </p>
        </div>

        {/* Guided Tour */}
        <GuidedTour steps={LB_TOUR} toolName="Load Balancer walkthrough" />

        {/* ─── 3-Panel Layout ─── */}
        <div className="animate-fade-in-up-delay-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ═══════════════════════════════════════════════════════
                PANEL 1 — Vehicle & Config
            ═══════════════════════════════════════════════════════ */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="w-4 h-4 text-primary" />
                  Vehicle &amp; Config
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">

                {/* Vehicle search + select */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide">Vehicle</Label>
                  <Input
                    placeholder="Search make, model, year…"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="text-sm"
                  />
                  <Select value={vehicleKey} onValueChange={setVehicleKey}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 bg-neutral-900 border-neutral-700">
                      {uniqueMakes
                        .filter((make) => vehiclesByMake[make]?.length)
                        .map((make) => (
                          <div key={make}>
                            <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              {make}
                            </div>
                            {vehiclesByMake[make].map((v) => {
                              const payload = v.gvwrLbs - v.curbWeightLbs;
                              return (
                                <SelectItem key={buildKey(v)} value={buildKey(v)} className="text-xs">
                                  {v.year} {v.model} {v.trim} — {fmtLbs(v.curbWeightLbs)} lb curb / {fmtLbs(payload)} lb payload
                                </SelectItem>
                              );
                            })}
                          </div>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicle summary card */}
                {selectedVehicle && (
                  <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1.5 border border-border">
                    <div className="font-bold text-sm mb-2">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                      <span className="text-muted-foreground font-normal ml-1">{selectedVehicle.trim}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <span className="text-muted-foreground">GVWR</span>
                      <span className="font-mono font-semibold">{fmtLbs(selectedVehicle.gvwrLbs)} lbs</span>
                      <span className="text-muted-foreground">Curb weight</span>
                      <span className="font-mono font-semibold">{fmtLbs(selectedVehicle.curbWeightLbs)} lbs</span>
                      <span className="text-muted-foreground">Payload capacity</span>
                      <span className="font-mono font-semibold">{fmtLbs(selectedVehicle.gvwrLbs - selectedVehicle.curbWeightLbs)} lbs</span>
                      <span className="text-muted-foreground">Fuel tank</span>
                      <span className="font-mono font-semibold">{selectedVehicle.fuelTankGal} gal</span>
                      <span className="text-muted-foreground">Roof static</span>
                      <span className="font-mono font-semibold">{selectedVehicle.roofStaticLbs} lbs</span>
                    </div>
                  </div>
                )}

                {/* Driver weight */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wide">
                      Driver weight
                      <Tip text="Weight of the driver in lbs. Default 185." />
                    </Label>
                    <span className="text-xs font-mono font-bold text-primary">{driverWeightLbs} lbs</span>
                  </div>
                  <Slider
                    min={100} max={350} step={5}
                    value={[driverWeightLbs]}
                    onValueChange={([v]) => setDriverWeightLbs(v)}
                  />
                </div>

                {/* Passengers */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide">
                    Passengers
                    <Tip text="Number of passengers excluding the driver (0–6)." />
                  </Label>
                  <div className="flex items-center gap-3">
                    <button
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-30"
                      onClick={() => setPassengerCount((p) => Math.max(0, p - 1))}
                      disabled={passengerCount === 0}
                      aria-label="Decrease passengers"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5 min-w-[4rem] justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg font-bold font-mono">{passengerCount}</span>
                    </div>
                    <button
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-30"
                      onClick={() => setPassengerCount((p) => Math.min(6, p + 1))}
                      disabled={passengerCount === 6}
                      aria-label="Increase passengers"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Avg passenger weight */}
                {passengerCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wide">
                        Avg passenger weight
                      </Label>
                      <span className="text-xs font-mono font-bold text-primary">{avgPassengerWeightLbs} lbs</span>
                    </div>
                    <Slider
                      min={80} max={350} step={5}
                      value={[avgPassengerWeightLbs]}
                      onValueChange={([v]) => setAvgPassengerWeightLbs(v)}
                    />
                  </div>
                )}

                {/* Fuel fill % */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                      <Fuel className="w-3 h-3" />
                      Fuel fill
                      <Tip text="How full is the tank? 100% = full. Fuel weighs ~6.1 lbs/gal." />
                    </Label>
                    <span className="text-xs font-mono font-bold text-primary">
                      {fuelFillPct}%
                      {selectedVehicle && (
                        <span className="text-muted-foreground font-normal ml-1">
                          ({fmtLbs(selectedVehicle.fuelTankGal * (fuelFillPct / 100) * 6.1)} lbs)
                        </span>
                      )}
                    </span>
                  </div>
                  <Slider
                    min={0} max={100} step={5}
                    value={[fuelFillPct]}
                    onValueChange={([v]) => setFuelFillPct(v)}
                  />
                </div>

                {/* Trailer tongue weight */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide">
                    Trailer tongue weight
                    <Tip text="Tongue weight is the downward force the trailer exerts on the hitch ball. Typically 10–15% of trailer weight. Leave 0 if not towing." />
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={5000}
                      value={trailerTongueLbs || ""}
                      onChange={(e) => setTrailerTongueLbs(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="font-mono text-sm"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">lbs</span>
                  </div>
                </div>

                {/* Reset */}
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors mt-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset all
                </button>

              </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════════════════
                PANEL 2 — Gear Builder
            ═══════════════════════════════════════════════════════ */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Gear Builder
                  </span>
                  <span className="text-xs font-mono text-muted-foreground font-normal">
                    {fmtLbs(totalGearLbs)} lbs
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Add gear button */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => { setGearPickerOpen((o) => !o); setShowCustomForm(false); }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Gear
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => { setShowCustomForm((o) => !o); setGearPickerOpen(false); }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Custom
                  </Button>
                </div>

                {/* Custom item form */}
                {showCustomForm && (
                  <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/30">
                    <div className="text-xs font-bold uppercase tracking-wide mb-1">Add Custom Item</div>
                    <Input
                      placeholder="Item name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="text-xs"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Weight (lbs)"
                        value={customWeight}
                        onChange={(e) => setCustomWeight(e.target.value)}
                        className="text-xs flex-1 font-mono"
                        min={0.1}
                      />
                      <Select value={customZone} onValueChange={(v) => setCustomZone(v as PlacementZone)}>
                        <SelectTrigger className="text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-700">
                          {(Object.keys(ZONE_LABELS) as PlacementZone[]).map((z) => (
                            <SelectItem key={z} value={z} className="text-xs">{ZONE_LABELS[z]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 text-xs" onClick={addCustomItem}>
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowCustomForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Gear picker panel */}
                {gearPickerOpen && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border">
                      <span className="text-xs font-bold uppercase tracking-wide">Pick Gear</span>
                      <button onClick={() => setGearPickerOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Search */}
                    <div className="px-3 pt-2">
                      <Input
                        placeholder="Search gear…"
                        value={gearSearch}
                        onChange={(e) => setGearSearch(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    {/* Category tabs */}
                    <div className="px-2 pt-2">
                      <div className="flex flex-wrap gap-1">
                        {ALL_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setGearPickerCategory(cat)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors font-medium ${
                              gearPickerCategory === cat
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                            }`}
                          >
                            {CATEGORY_LABELS[cat]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gear grid */}
                    <div className="p-2 max-h-56 overflow-y-auto">
                      {filteredGear.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">No gear found</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5">
                          {filteredGear.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => addGearItem(item)}
                              className="text-left border border-border rounded-md p-2 hover:border-primary hover:bg-primary/5 transition-colors group"
                            >
                              <div className="text-xs font-medium leading-tight group-hover:text-primary transition-colors">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-between">
                                <span className="font-mono">{item.weightPerUnit} lbs</span>
                                <span>{ZONE_LABELS[item.defaultZone]}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Entry list */}
                {entries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No gear added yet.</p>
                    <p className="mt-1">Click "Add Gear" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 bg-muted/30 rounded-md px-2 py-1.5 text-xs border border-border/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{entry.name}</div>
                          <div className="text-muted-foreground font-mono text-[10px]">
                            {fmtLbs(entry.qty * entry.weightPerUnit)} lbs total
                          </div>
                        </div>

                        {/* Zone dropdown */}
                        <Select
                          value={entry.zone}
                          onValueChange={(v) => updateEntry(entry.id, "zone", v as PlacementZone)}
                        >
                          <SelectTrigger className="h-6 text-[10px] w-24 px-1.5 py-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-900 border-neutral-700">
                            {(Object.keys(ZONE_LABELS) as PlacementZone[]).map((z) => (
                              <SelectItem key={z} value={z} className="text-xs">{ZONE_LABELS[z]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Qty stepper */}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => updateEntry(entry.id, "qty", Math.max(1, entry.qty - 1))}
                            className="w-5 h-5 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-30"
                            disabled={entry.qty <= 1}
                            aria-label="Decrease qty"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-mono text-xs">{entry.qty}</span>
                          <button
                            onClick={() => updateEntry(entry.id, "qty", entry.qty + 1)}
                            className="w-5 h-5 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"
                            aria-label="Increase qty"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="text-muted-foreground/40 hover:text-destructive transition-colors"
                          aria-label={`Remove ${entry.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Zone subtotals */}
                    <div className="border-t border-border/50 pt-2 mt-2 space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                        By Zone
                      </div>
                      {(Object.keys(ZONE_LABELS) as PlacementZone[]).map((z) => {
                        const lbs = zoneTotals[z];
                        if (!lbs) return null;
                        return (
                          <div key={z} className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">{ZONE_LABELS[z]}</span>
                            <span className="font-mono font-semibold">{fmtLbs(lbs)} lbs</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between text-xs font-bold border-t border-border/50 pt-1 mt-1">
                        <span>Total gear</span>
                        <span className="font-mono">{fmtLbs(totalGearLbs)} lbs</span>
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════════════════
                PANEL 3 — Results
            ═══════════════════════════════════════════════════════ */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="w-4 h-4 text-primary" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedVehicle ? (
                  <div className="text-center py-12 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Select a vehicle to see results.</p>
                  </div>
                ) : result ? (
                  <div className="space-y-5">

                    {/* A) Payload gauge */}
                    <div className={`rounded-lg p-4 border ${getStatusColors(result.status).bg} ${getStatusColors(result.status).border}`}>
                      <div className={`text-5xl font-extrabold font-mono text-center mb-1 ${getStatusColors(result.status).text}`}>
                        {result.payloadUsedPct.toFixed(1)}%
                      </div>
                      <div className="text-xs text-center text-muted-foreground mb-3">
                        payload used
                      </div>
                      <PayloadGauge pct={result.payloadUsedPct} status={result.status} />
                      <div className="text-xs text-center mt-2 text-muted-foreground">
                        <span className="font-mono font-semibold text-foreground">{fmtLbs(result.totalAddedLbs)}</span> lbs added
                        {" "}of{" "}
                        <span className="font-mono font-semibold text-foreground">{fmtLbs(result.payloadCapacityLbs)}</span> lbs capacity
                        {" "}—{" "}
                        <span className={`font-mono font-semibold ${result.payloadRemainingLbs < 0 ? "text-red-500" : ""}`}>
                          {fmtLbs(Math.abs(result.payloadRemainingLbs))} lbs {result.payloadRemainingLbs < 0 ? "over" : "remaining"}
                        </span>
                      </div>
                    </div>

                    {/* B) Weight breakdown table */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Weight Breakdown</div>
                      <table className="w-full text-xs">
                        <tbody>
                          {[
                            { label: "Gear", lbs: result.gearLbs },
                            { label: "People", lbs: result.peopleLbs },
                            { label: `Fuel (${fuelFillPct}% full)`, lbs: result.fuelLbs },
                            { label: "Tongue weight", lbs: result.tongueLbs },
                          ].map(({ label, lbs }) => (
                            <tr key={label} className="border-b border-border/30">
                              <td className="py-1 text-muted-foreground">{label}</td>
                              <td className="py-1 text-right font-mono font-semibold">{fmtLbs(lbs)}</td>
                            </tr>
                          ))}
                          <tr className="border-b-2 border-border font-bold">
                            <td className="py-1">Total Added</td>
                            <td className="py-1 text-right font-mono">{fmtLbs(result.totalAddedLbs)}</td>
                          </tr>
                          <tr className="border-b border-border/30 text-muted-foreground">
                            <td className="py-1">Curb weight</td>
                            <td className="py-1 text-right font-mono">{fmtLbs(result.vehicleCurbLbs)}</td>
                          </tr>
                          <tr className={`border-b-2 border-border font-bold ${result.status !== "safe" ? getStatusColors(result.status).text : ""}`}>
                            <td className="py-1">Gross weight</td>
                            <td className="py-1 text-right font-mono">{fmtLbs(result.totalGrossLbs)}</td>
                          </tr>
                          <tr className="text-muted-foreground">
                            <td className="py-1">GVWR</td>
                            <td className="py-1 text-right font-mono">{fmtLbs(result.gvwrLbs)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* C) Axle distribution */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Axle Distribution</div>
                      <div className="w-full h-5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-blue-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                          style={{ width: `${result.axleLoads.frontPct}%` }}
                        >
                          {result.axleLoads.frontPct > 15 ? `${result.axleLoads.frontPct}%` : ""}
                        </div>
                        <div
                          className={`h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500 ${
                            result.axleLoads.rearPct > 65 ? "bg-orange-500" : "bg-slate-500"
                          }`}
                          style={{ width: `${result.axleLoads.rearPct}%` }}
                        >
                          {result.axleLoads.rearPct > 15 ? `${result.axleLoads.rearPct}%` : ""}
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] mt-1.5 text-muted-foreground">
                        <span>
                          <span className="inline-block w-2 h-2 rounded-sm bg-blue-500 mr-1" />
                          Front: <span className="font-mono font-semibold text-foreground">{fmtLbs(result.axleLoads.frontLbs)} lbs</span>
                        </span>
                        <span>
                          <span className={`inline-block w-2 h-2 rounded-sm mr-1 ${result.axleLoads.rearPct > 65 ? "bg-orange-500" : "bg-slate-500"}`} />
                          Rear: <span className="font-mono font-semibold text-foreground">{fmtLbs(result.axleLoads.rearLbs)} lbs</span>
                        </span>
                      </div>
                    </div>

                    {/* D) Roof load */}
                    {result.roofLoadLbs > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Roof Load</div>
                        <div className={`flex items-center justify-between text-xs rounded-md px-3 py-2 ${
                          result.roofOverloaded
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-400"
                            : "bg-muted/50 border border-border"
                        }`}>
                          <span className="flex items-center gap-1">
                            {result.roofOverloaded ? (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            )}
                            Roof load
                          </span>
                          <span className="font-mono font-semibold">
                            {fmtLbs(result.roofLoadLbs)} / {fmtLbs(result.roofStaticRatingLbs)} lbs rated
                          </span>
                        </div>
                      </div>
                    )}

                    {/* E) Stability risk badge */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Stability Risk</div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getRiskColors(result.stabilityRisk).badge}`}>
                        <span className={`w-2 h-2 rounded-full ${getRiskColors(result.stabilityRisk).dot}`} />
                        {result.stabilityRisk.charAt(0).toUpperCase() + result.stabilityRisk.slice(1)}
                      </span>
                    </div>

                    {/* F) Warnings */}
                    {result.warnings.length > 0 && (
                      <div className="space-y-2">
                        {result.warnings.map((w, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 bg-red-100 dark:bg-red-900/30 border border-red-400 rounded-md px-3 py-2 text-xs text-red-700 dark:text-red-400"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            {w}
                          </div>
                        ))}
                      </div>
                    )}

                    {result.warnings.length === 0 && (
                      <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 border border-green-400 rounded-md px-3 py-2 text-xs text-green-700 dark:text-green-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        All checks passed — you're within safe limits.
                      </div>
                    )}

                    {/* G) By-zone breakdown */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                        Gear Weight by Zone
                      </div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-1 text-muted-foreground font-medium">Zone</th>
                            <th className="text-right py-1 text-muted-foreground font-medium">Lbs</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Object.keys(ZONE_LABELS) as PlacementZone[]).map((z) => {
                            const lbs = result.byZone[z];
                            return (
                              <tr key={z} className="border-b border-border/30">
                                <td className="py-1 text-muted-foreground">{ZONE_LABELS[z]}</td>
                                <td className="py-1 text-right font-mono font-semibold">
                                  {lbs > 0 ? fmtLbs(lbs) : <span className="text-muted-foreground/40">—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        * Cab zone includes people + fuel weight for axle math.
                      </p>
                    </div>

                  </div>
                ) : null}
              </CardContent>
            </Card>

          </div>{/* end grid */}
        </div>{/* end animate wrapper */}

        {/* ─── Footer content ─── */}
        <div className="max-w-3xl mt-16 space-y-8 no-print">
          <ToolSafetyDisclaimer toolName="Overland Load Balancer" />

          <section>
            <h2 className="text-2xl font-extrabold mb-4">About This Tool</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Overland Load Balancer Ops Deck uses real manufacturer curb weight,
              GVWR, fuel tank capacity, and roof ratings to calculate your actual loaded
              weight against your vehicle's payload capacity. No guessing. No overloaded
              axles on the trail.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Axle distribution is estimated using zone-based weight splitting coefficients.
              Roof stability risk accounts for center-of-gravity shift. All computation is
              done locally in your browser — no data is sent anywhere.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-4">Payload vs. GVWR</h2>
            <p className="text-muted-foreground leading-relaxed">
              Payload capacity is <strong>GVWR minus curb weight</strong>. GVWR
              (Gross Vehicle Weight Rating) is the maximum the vehicle was engineered to
              handle — exceeding it puts stress on brakes, suspension, tires, and frame.
              Payload includes everything added to the vehicle: people, gear, fuel, and
              tongue weight.
            </p>
          </section>

          <DataPrivacyNotice />
          <SupportFooter />
        </div>

      </div>
    </div>
  );
}
