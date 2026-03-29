import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  Crosshair, AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
  Info, Truck, Zap, Tent, Droplets, UtensilsCrossed, Radio,
  ArrowRight, RotateCcw, Database, ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import { GuidedTour } from "./GuidedTour";
import { useSEO } from "@/hooks/useSEO";
import { trackEvent } from "@/lib/analytics";
import { getHousehold } from "@/lib/household-store";
import { computeSitrep } from "./sitrep-compute";
import {
  SCENARIO_META,
  DEFAULT_MANUAL_INPUTS,
  STORAGE_KEY,
} from "./sitrep-types";
import type {
  SitrepScenario,
  SitrepManualInputs,
  CategoryResult,
  PriorityGap,
  GoNoGo,
  CategoryStatus,
} from "./sitrep-types";

// ─── Tour ─────────────────────────────────────────────────────────────────────

const SITREP_TOUR = [
  {
    title: "Pick Your Scenario",
    body: "Each scenario weights your categories differently. Wildfire evac is 50% mobility. Grid-down is 35% power. Choose the scenario you're actually planning for.",
  },
  {
    title: "Connect Your Tools",
    body: "SITREP automatically reads your Vehicle Profile, Power System, Load Balancer, and supply calculators. The more tools you've filled out, the more accurate your score.",
  },
  {
    title: "Fill the Gaps",
    body: "Enter anything the tools don't capture yet: days of water and food on hand, shelter gear, comms gear. Even rough numbers are better than zero.",
  },
  {
    title: "Read Your Report",
    body: "Each category shows a score, green/yellow/red status, and specific wins and gaps. The overall score is scenario-weighted — not all categories count equally.",
  },
  {
    title: "Go / No-Go Verdict",
    body: "Send It (75+), Marginal (45–74), or Stand Down (<45). This tells you if you could execute this scenario right now with what you have.",
  },
  {
    title: "Priority Gaps",
    body: "The top 5 gaps are sorted by scenario impact — not just which category scored lowest, but which gaps hurt you most in this specific scenario.",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const SCENARIOS: SitrepScenario[] = [
  "grid-down",
  "72hr-bug-out",
  "extended-bug-out",
  "wildfire-evac",
  "shelter-in-place",
  "winter-storm",
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  mobility: Truck,
  power:    Zap,
  shelter:  Tent,
  water:    Droplets,
  food:     UtensilsCrossed,
  comms:    Radio,
};

// ─── Stored State ─────────────────────────────────────────────────────────────

interface StoredState {
  scenario: SitrepScenario;
  manualInputs: SitrepManualInputs;
}

function loadState(): Partial<StoredState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function statusColor(status: CategoryStatus): { bar: string; badge: string; text: string } {
  switch (status) {
    case "green":  return { bar: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",  text: "text-green-600 dark:text-green-400" };
    case "yellow": return { bar: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", text: "text-yellow-600 dark:text-yellow-400" };
    case "red":    return { bar: "bg-red-500",    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",    text: "text-red-600 dark:text-red-400" };
  }
}

function goNoGoStyle(verdict: GoNoGo): { bg: string; border: string; text: string; label: string; sub: string } {
  switch (verdict) {
    case "send-it":    return { bg: "bg-green-100 dark:bg-green-900/30",  border: "border-green-500",  text: "text-green-700 dark:text-green-400",  label: "SEND IT",     sub: "You're ready to execute this scenario." };
    case "marginal":   return { bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-500", text: "text-yellow-700 dark:text-yellow-400", label: "MARGINAL",    sub: "Can execute, but with real gaps and risk." };
    case "stand-down": return { bg: "bg-red-100 dark:bg-red-900/30",     border: "border-red-500",    text: "text-red-700 dark:text-red-400",     label: "STAND DOWN",  sub: "Not ready for this scenario right now." };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScenarioCard({
  scenario,
  selected,
  onSelect,
}: {
  scenario: SitrepScenario;
  selected: boolean;
  onSelect: (s: SitrepScenario) => void;
}) {
  const meta = SCENARIO_META[scenario];
  return (
    <button
      type="button"
      onClick={() => onSelect(scenario)}
      className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-150 ${
        selected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm font-bold ${selected ? "text-primary" : ""}`}>{meta.label}</span>
        <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">
          {meta.timeframe}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{meta.description}</p>
    </button>
  );
}

function CategoryCard({
  cat,
  scenario,
}: {
  cat: CategoryResult;
  scenario: SitrepScenario;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[cat.id] ?? Crosshair;
  const colors = statusColor(cat.status);
  const weightPct = Math.round(cat.weight * 100);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{cat.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {weightPct}% weight
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
              style={{ width: `${cat.score}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm font-bold font-mono ${colors.text}`}>{cat.score}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${colors.badge}`}>
            {cat.status.toUpperCase()}
          </span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-3 py-2 space-y-2 bg-muted/20">
          {cat.wins.length > 0 && (
            <div className="space-y-1">
              {cat.wins.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-green-700 dark:text-green-400">
                  <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
          {cat.gaps.length > 0 && (
            <div className="space-y-1">
              {cat.gaps.map((g, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{g}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GapCard({ gap }: { gap: PriorityGap }) {
  return (
    <div className="border border-border rounded-lg px-3 py-2.5 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center shrink-0">
          {gap.priority}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
          {gap.category}
        </span>
      </div>
      <p className="text-xs text-foreground leading-snug">{gap.issue}</p>
      <p className="text-xs text-primary leading-snug font-medium">{gap.fix}</p>
      {gap.toolSlug && (
        <Link href={`/tools/${gap.toolSlug}`}>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer mt-0.5">
            <ExternalLink className="w-3 h-3" />
            Open {gap.toolName}
          </span>
        </Link>
      )}
    </div>
  );
}

// Data source indicator
function SourceBadge({
  label,
  connected,
  toolSlug,
}: {
  label: string;
  connected: boolean;
  toolSlug: string;
}) {
  return (
    <div className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md border ${
      connected
        ? "border-green-400/40 bg-green-100/30 dark:bg-green-900/10"
        : "border-border bg-muted/30"
    }`}>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${connected ? "bg-green-500" : "bg-muted-foreground/40"}`} />
        <span className={connected ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      </div>
      {!connected && (
        <Link href={`/tools/${toolSlug}`}>
          <span className="text-[10px] text-primary hover:underline cursor-pointer">Configure</span>
        </Link>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SITREP() {
  useSEO({
    title: "SITREP — Ops Deck Readiness Report | Prepper Evolution",
    description:
      "Scenario-driven readiness assessment. Pick grid-down, bug-out, or wildfire evac, and get a scored situation report across mobility, power, shelter, water, food, and comms.",
  });

  const saved = loadState();

  const [scenario, setScenario] = useState<SitrepScenario>(saved.scenario ?? "grid-down");
  const [manual, setManual] = useState<SitrepManualInputs>({
    ...DEFAULT_MANUAL_INPUTS,
    ...(saved.manualInputs ?? {}),
  });

  // Track data source connections
  const [sourcesConnected, setSourcesConnected] = useState({
    householdProfile: false,
    vehicleProfile: false,
    loadBalancer: false,
    powerSystem: false,
    bugOutBag: false,
    waterCalc: false,
    foodCalc: false,
  });

  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "sitrep" });
    setSourcesConnected({
      householdProfile: !!localStorage.getItem("pe-household"),
      vehicleProfile:   !!localStorage.getItem("pe-vehicle-profile"),
      loadBalancer:     !!localStorage.getItem("lb-ops-deck-v1"),
      powerSystem:      !!localStorage.getItem("pe-power-config"),
      bugOutBag:        !!localStorage.getItem("pe-bob-calculator"),
      waterCalc:        !!localStorage.getItem("pe-water-calculator"),
      foodCalc:         !!localStorage.getItem("pe-food-calculator"),
    });

    // Pre-fill manual inputs from household readiness if still at defaults
    const household = getHousehold();
    if (household) {
      setManual((prev) => {
        const updates: Partial<SitrepManualInputs> = {};
        const totalPeople = household.profile.adults + household.profile.children + household.profile.elderly;
        if (prev.householdSize === DEFAULT_MANUAL_INPUTS.householdSize && totalPeople > 0) {
          updates.householdSize = totalPeople;
        }
        if (prev.waterDaysOnHand === 0 && household.readiness.water?.daysOfSupply) {
          updates.waterDaysOnHand = Math.round(household.readiness.water.daysOfSupply);
        }
        if (prev.foodDaysOnHand === 0 && household.readiness.food?.daysOfSupply) {
          updates.foodDaysOnHand = Math.round(household.readiness.food.daysOfSupply);
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, []);

  // Persist state
  useEffect(() => {
    const state: StoredState = { scenario, manualInputs: manual };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [scenario, manual]);

  const setManualField = useCallback(
    <K extends keyof SitrepManualInputs>(key: K, value: SitrepManualInputs[K]) => {
      setManual((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Compute result
  const result = useMemo(() => computeSitrep(scenario, manual), [scenario, manual]);

  const goStyle = goNoGoStyle(result.goNoGo);
  const connectedCount = Object.values(sourcesConnected).filter(Boolean).length;
  // dataSourceCount in result counts up to 7 now (added household)

  const reset = useCallback(() => {
    setManual(DEFAULT_MANUAL_INPUTS);
    setScenario("grid-down");
  }, []);

  return (
    <div className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* ─── Header ─── */}
        <div className="max-w-3xl mb-10">
          <p className="text-primary text-sm font-bold uppercase tracking-wide mb-2">Ops Deck</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
            SITREP{" "}
            <span className="text-primary">Readiness Report</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Pick a scenario, connect your Ops Deck tools, and get a scored situation report across mobility, power, shelter, water, food, and comms. Your real Go/No-Go verdict — no hand-waving.
          </p>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <Badge variant="secondary">v1.0</Badge>
            <Badge variant="outline" className="text-emerald-600 border-emerald-600/40">
              Ops Deck
            </Badge>
            <span className="text-xs text-muted-foreground">
              {connectedCount}/7 data sources connected
            </span>
          </div>
        </div>

        <GuidedTour steps={SITREP_TOUR} toolName="SITREP walkthrough" />

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Left Panel: Config ─── */}
          <div className="space-y-4">

            {/* Scenario Selector */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Crosshair className="w-4 h-4 text-primary" />
                  Select Scenario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SCENARIOS.map((s) => (
                  <ScenarioCard
                    key={s}
                    scenario={s}
                    selected={scenario === s}
                    onSelect={(val) => {
                      setScenario(val);
                      trackEvent("pe_scenario_selected", { scenario: val });
                    }}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Manual Inputs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="w-4 h-4 text-primary" />
                  Manual Inputs
                  <Tip text="Enter data for anything not captured by your tools yet. Even rough estimates improve your score accuracy." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Household size */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    Household size
                    <Tip text="Affects water and food per-person calculations." />
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[manual.householdSize]}
                      onValueChange={([v]) => setManualField("householdSize", v)}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-6 text-right">{manual.householdSize}</span>
                  </div>
                </div>

                {/* Water days */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    Water days on hand
                    <Tip text="Days of water stored at your primary location. 1 gal/person/day minimum." />
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={365}
                      value={manual.waterDaysOnHand}
                      onChange={(e) => setManualField("waterDaysOnHand", Math.max(0, Number(e.target.value)))}
                      className="h-8 text-sm w-24"
                    />
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                </div>

                {/* Food days */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    Food days on hand
                    <Tip text="Days of shelf-stable food at your primary location." />
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={365}
                      value={manual.foodDaysOnHand}
                      onChange={(e) => setManualField("foodDaysOnHand", Math.max(0, Number(e.target.value)))}
                      className="h-8 text-sm w-24"
                    />
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                </div>

                {/* Fuel override (shown only if no load balancer data) */}
                {!sourcesConnected.loadBalancer && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      Current fuel fill %
                      <Tip text="Approximate tank fill level. Configure the Load Balancer for precise tracking." />
                    </Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[manual.fuelFillPct]}
                        onValueChange={([v]) => setManualField("fuelFillPct", v)}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-8 text-right">{manual.fuelFillPct}%</span>
                    </div>
                  </div>
                )}

                {/* Shelter checkboxes */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shelter</Label>
                  <div className="space-y-1.5">
                    {[
                      { key: "hasTentOrTarp" as const, label: "Ground tent or tarp" },
                      { key: "hasSleepingBag" as const, label: "Sleeping bag (any season)" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={manual[key]}
                          onChange={(e) => setManualField(key, e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-xs">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Comms checkboxes */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Comms</Label>
                  <div className="space-y-1.5">
                    {[
                      { key: "hasHandheldRadio" as const, label: "Handheld radio (GMRS/VHF)" },
                      { key: "hasSatComm" as const, label: "Satellite communicator (inReach/SPOT)" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={manual[key]}
                          onChange={(e) => setManualField(key, e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-xs">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={reset}
                >
                  <RotateCcw className="w-3 h-3 mr-1.5" />
                  Reset inputs
                </Button>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Connected Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <SourceBadge label="Household Profile"   connected={sourcesConnected.householdProfile} toolSlug="household" />
                <SourceBadge label="Vehicle Profile"     connected={sourcesConnected.vehicleProfile}   toolSlug="vehicle-profile" />
                <SourceBadge label="Load Balancer"       connected={sourcesConnected.loadBalancer}     toolSlug="load-balancer" />
                <SourceBadge label="Power System"        connected={sourcesConnected.powerSystem}      toolSlug="power-system-builder" />
                <SourceBadge label="Bug Out Bag"         connected={sourcesConnected.bugOutBag}        toolSlug="bug-out-bag-calculator" />
                <SourceBadge label="Water Calculator"    connected={sourcesConnected.waterCalc}        toolSlug="water-storage-calculator" />
                <SourceBadge label="Food Calculator"     connected={sourcesConnected.foodCalc}         toolSlug="food-storage-calculator" />
                <p className="text-[10px] text-muted-foreground pt-1">
                  Data is read automatically. Fill out more tools to improve score accuracy.
                </p>
              </CardContent>
            </Card>

          </div>

          {/* ─── Right Panel: Report (spans 2 cols) ─── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Go/No-Go Verdict */}
            <Card className={`border-2 ${goStyle.border}`}>
              <CardContent className="pt-5">
                <div className={`rounded-lg px-5 py-4 ${goStyle.bg} flex flex-col sm:flex-row sm:items-center gap-4`}>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className={`text-3xl font-extrabold tracking-tight ${goStyle.text}`}>
                        {goStyle.label}
                      </span>
                      <span className={`text-4xl font-extrabold font-mono ${goStyle.text}`}>
                        {result.overallScore}
                        <span className="text-xl font-normal opacity-60">/100</span>
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${goStyle.text} opacity-80`}>{goStyle.sub}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Scenario: <span className="font-medium">{SCENARIO_META[scenario].label}</span>
                      {" · "}
                      {result.dataSourceCount}/7 data sources connected
                    </p>
                  </div>

                  {/* Score arc visual */}
                  <div className="shrink-0">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                      <circle
                        cx="40" cy="40" r="32"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - result.overallScore / 100)}`}
                        transform="rotate(-90 40 40)"
                        className={
                          result.goNoGo === "send-it" ? "text-green-500"
                          : result.goNoGo === "marginal" ? "text-yellow-500"
                          : "text-red-500"
                        }
                        style={{ transition: "stroke-dashoffset 0.8s ease" }}
                      />
                      <text x="40" y="44" textAnchor="middle" className="fill-foreground text-xs font-bold" fontSize="14" fontWeight="700">
                        {result.overallScore}
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Scenario weight bar */}
                <div className="mt-4 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                    Category weights for {SCENARIO_META[scenario].label}
                  </p>
                  <div className="flex gap-px rounded overflow-hidden h-3">
                    {result.categories.map((cat) => {
                      const colors = statusColor(cat.status);
                      return (
                        <div
                          key={cat.id}
                          className={`${colors.bar} opacity-80 transition-all duration-700`}
                          style={{ flex: cat.weight }}
                          title={`${cat.name}: ${Math.round(cat.weight * 100)}%`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex gap-px">
                    {result.categories.map((cat) => (
                      <div key={cat.id} style={{ flex: cat.weight }} className="text-[9px] text-muted-foreground truncate text-center">
                        {cat.name.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="space-y-2">
                {result.warnings.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 bg-red-100 dark:bg-red-900/30 border border-red-400 rounded-lg px-3 py-2.5 text-xs text-red-700 dark:text-red-400"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {w}
                  </div>
                ))}
              </div>
            )}

            {/* Category Scores */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Category Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.categories.map((cat) => (
                  <CategoryCard key={cat.id} cat={cat} scenario={scenario} />
                ))}
              </CardContent>
            </Card>

            {/* Priority Gaps */}
            {result.priorityGaps.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    Priority Gaps
                    <Tip text="Sorted by scenario impact — which gaps hurt you most in this specific situation, not just which category scored lowest." />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.priorityGaps.map((gap) => (
                    <GapCard key={gap.priority} gap={gap} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* All clear */}
            {result.warnings.length === 0 && result.goNoGo === "send-it" && (
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 border border-green-400 rounded-lg px-4 py-3 text-sm text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4 shrink-0" />
                No critical warnings — you're dialed in for {SCENARIO_META[scenario].label}.
              </div>
            )}

            {/* Cross-tool CTA */}
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Improve your score by completing more Ops Deck tools.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Vehicle Profile", slug: "vehicle-profile" },
                    { label: "Power System", slug: "power-system-builder" },
                    { label: "Load Balancer", slug: "load-balancer" },
                    { label: "Water Calculator", slug: "water-storage-calculator" },
                  ].map(({ label, slug }) => (
                    <Link key={slug} href={`/tools/${slug}`}>
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                        {label}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        <div className="mt-10 space-y-4">
          <DataPrivacyNotice />
          <SupportFooter />
        </div>

      </div>
    </div>
  );
}
