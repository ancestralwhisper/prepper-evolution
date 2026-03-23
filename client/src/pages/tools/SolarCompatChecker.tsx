import { useState, useMemo, useEffect } from "react";
import {
  Sun,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ExternalLink,
  Truck,
  BatteryCharging,
} from "lucide-react";
import { powerStations, solarPanels, compatDcDcChargers, cableExtensions } from "./solar-compat-data";
import type { PowerStation } from "./solar-compat-data";
import { computeCompatibility, computeTwelveVSystem } from "./solar-compat-compute";
import type { PanelCompatResult } from "./solar-compat-compute";
import { loadPowerConfig, savePowerConfig, mergePowerConfig } from "./power-config-shared";
import type { PowerConfigMode } from "./power-config-shared";
import { GuidedTour } from "./GuidedTour";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import { useSEO } from "@/hooks/useSEO";

// ─── Tour ─────────────────────────────────────────────────────────────────────

const SOLAR_COMPAT_TOUR = [
  {
    title: "Pick Your Power Station",
    body: "Select the station you own or are buying. The tool loads its exact solar input limits — max watts and the critical max voltage (Voc) that determines what panels are safe to connect.",
  },
  {
    title: "Filter by Panel Type",
    body: "Choose rigid, flexible, or foldable. Flexible panels are ideal for RTT and vehicle roof mounting — they're lighter, curved-surface friendly, and don't add height to your rig.",
  },
  {
    title: "Read the Compatibility Results",
    body: "Green means compatible, red means voltage exceeds the station's limit and would cause damage. Each compatible panel shows the optimal series/parallel config and estimated charge time.",
  },
  {
    title: "Adapter Column",
    body: "Most panels use MC4 connectors. Most stations use a proprietary plug. The adapter column tells you exactly what you need — with an Amazon link — so you're not hunting for it later.",
  },
  {
    title: "Charge Time Estimates",
    body: "Times are calculated for full sun. In real-world overlanding conditions (partial cloud, non-ideal angle, heat), add 30–50% to the estimate.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function amzUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=prepperevo-20`;
}

const CONNECTOR_LABELS: Record<string, string> = {
  mc4: "MC4",
  xt60: "XT60",
  dc8020: "DC8020",
  dc5525: "DC5525",
  hpp: "HPP (Goal Zero)",
  "dc8020-mc4": "DC8020/MC4",
  anderson: "Anderson",
};

const SHADE_COLORS: Record<string, string> = {
  poor: "bg-red-500/15 text-red-400 border-red-500/30",
  fair: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  good: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  excellent: "bg-green-500/15 text-green-400 border-green-500/30",
};

const PANEL_TYPE_COLORS: Record<string, string> = {
  flexible: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  rigid: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  foldable: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

// Group stations by brand for the selector
const BRANDS = Array.from(new Set(powerStations.map((s) => s.brand)));

// ─── Panel Result Card ────────────────────────────────────────────────────────

function PanelCard({ result }: { result: PanelCompatResult }) {
  const { panel, compatible, incompatible_reason, adapter_needed,
    optimal_config, max_achievable_w, charge_time_note } = result;

  return (
    <div
      className={`bg-card border rounded-xl p-4 space-y-3 transition-colors ${
        compatible
          ? "border-border hover:border-yellow-500/30"
          : "border-red-500/40 bg-red-500/5"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-foreground truncate">
            {panel.brand} {panel.model}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {panel.watts}W &bull; Voc {panel.voc}V &bull; {panel.weight_lbs} lbs
          </p>
        </div>
        {/* Status badge */}
        {compatible ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/15 border border-green-500/30 rounded-lg flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wide">
              Compatible
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/15 border border-red-500/30 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
              Incompatible
            </span>
          </div>
        )}
      </div>

      {/* Type badges row */}
      <div className="flex flex-wrap gap-1.5">
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border rounded ${
            PANEL_TYPE_COLORS[panel.panel_type]
          }`}
        >
          {panel.panel_type}
        </span>
        {panel.roof_mountable && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border rounded bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
            Roof / RTT
          </span>
        )}
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border rounded ${
            SHADE_COLORS[panel.partial_shade_rating]
          }`}
        >
          Shade: {panel.partial_shade_rating}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border rounded bg-muted text-muted-foreground border-border">
          {CONNECTOR_LABELS[panel.native_connector] ?? panel.native_connector}
        </span>
      </div>

      {/* Incompatibility reason */}
      {!compatible && incompatible_reason && (
        <div className="flex gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 leading-relaxed">{incompatible_reason}</p>
        </div>
      )}

      {/* Compatible details */}
      {compatible && (
        <div className="space-y-2">
          {/* Optimal config */}
          <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-yellow-500/80 mb-1">
              Optimal Config
            </p>
            <p className="text-sm font-bold text-foreground">{optimal_config}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Max input: <span className="text-foreground font-semibold">{max_achievable_w}W</span>
            </p>
          </div>

          {/* Charge time */}
          <div className="flex items-start gap-2">
            <Sun className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{charge_time_note}</p>
          </div>

          {/* Adapter needed */}
          {adapter_needed && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-lg p-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-400">
                    Adapter Required
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {adapter_needed.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {adapter_needed.note}
                </p>
                {adapter_needed.asin && (
                  <a
                    href={amzUrl(adapter_needed.asin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Buy Adapter on Amazon
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Amazon link */}
      {panel.asin && (
        <a
          href={amzUrl(panel.asin)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-500 hover:text-yellow-400 transition-colors mt-1"
        >
          View on Amazon
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SolarCompatChecker() {
  useSEO({
    title: "Power Station Solar Panel Compatibility Checker | Prepper Evolution",
    description:
      "Find solar panels that are compatible with your power station. Check voltage limits, connector types, optimal panel configs, and charge time estimates.",
  });

  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [brandOpen, setBrandOpen] = useState<Record<string, boolean>>({});
  const [panelTypeFilter, setPanelTypeFilter] = useState<"all" | "rigid" | "flexible" | "foldable">("all");
  const [roofOnlyFilter, setRoofOnlyFilter] = useState(false);

  // Mode + 12V system state
  const [mode, setMode] = useState<PowerConfigMode>("power-station");
  const [batteryAh, setBatteryAh] = useState(100);
  const [batteryChemistry, setBatteryChemistry] = useState<"lifepo4" | "agm" | "fla">("lifepo4");
  const [alternatorAmps, setAlternatorAmps] = useState(80);
  const [selectedChargerId, setSelectedChargerId] = useState<string>("");
  const [customSolarWatts, setCustomSolarWatts] = useState(200);

  const selectedStation: PowerStation | null = useMemo(
    () => powerStations.find((s) => s.id === selectedStationId) ?? null,
    [selectedStationId]
  );

  const filteredPanels = useMemo(() => {
    let panels = solarPanels;
    if (panelTypeFilter !== "all") {
      panels = panels.filter((p) => p.panel_type === panelTypeFilter);
    }
    if (roofOnlyFilter) {
      panels = panels.filter((p) => p.roof_mountable);
    }
    return panels;
  }, [panelTypeFilter, roofOnlyFilter]);

  const results: PanelCompatResult[] = useMemo(() => {
    if (!selectedStation) return [];
    return computeCompatibility(selectedStation, filteredPanels);
  }, [selectedStation, filteredPanels]);

  const compatCount = results.filter((r) => r.compatible).length;
  const incompatCount = results.filter((r) => !r.compatible).length;

  function toggleBrand(brand: string) {
    setBrandOpen((prev) => ({ ...prev, [brand]: !prev[brand] }));
  }

  // Load shared state on mount
  useEffect(() => {
    const saved = loadPowerConfig();
    if (!saved) return;
    if (saved.mode) setMode(saved.mode);
    if (saved.stationId) setSelectedStationId(saved.stationId);
    if (saved.batteryAh) setBatteryAh(saved.batteryAh);
    if (saved.batteryChemistry) setBatteryChemistry(saved.batteryChemistry as "lifepo4" | "agm" | "fla");
    if (saved.alternatorAmps) setAlternatorAmps(saved.alternatorAmps);
    if (saved.dcDcChargerId) setSelectedChargerId(saved.dcDcChargerId);
    if (saved.panelTypeFilter) setPanelTypeFilter(saved.panelTypeFilter as "all" | "rigid" | "flexible" | "foldable");
    if (saved.roofMountOnly !== undefined) setRoofOnlyFilter(saved.roofMountOnly);
    if (saved.totalSolarWatts) setCustomSolarWatts(saved.totalSolarWatts);
  }, []);

  // Save shared state whenever key values change
  useEffect(() => {
    savePowerConfig(mergePowerConfig(loadPowerConfig(), {
      mode,
      stationId: selectedStation?.id,
      batteryAh,
      batteryChemistry,
      alternatorAmps,
      dcDcChargerId: selectedChargerId,
      panelTypeFilter,
      roofMountOnly: roofOnlyFilter,
      totalSolarWatts: customSolarWatts,
      lastUpdatedBy: "solar-compat",
    }));
  }, [mode, selectedStation, batteryAh, batteryChemistry, alternatorAmps, selectedChargerId, panelTypeFilter, roofOnlyFilter, customSolarWatts]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
              <Sun className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                Solar Panel Compatibility Checker
              </h1>
              <p className="text-sm text-muted-foreground">
                Power Station Edition &mdash; v1.0
              </p>
            </div>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Pick your power station and see which solar panels are safe to connect,
            what adapters you need, the optimal series/parallel config, and how long
            a full charge takes. Voltage limits are hard limits &mdash; over them and
            you fry the MPPT controller.
          </p>
        </div>

        {/* ── Guided Tour ──────────────────────────────────────────────── */}
        <GuidedTour steps={SOLAR_COMPAT_TOUR} toolName="Solar Compatibility Checker" />

        {/* ── Mode Toggle ──────────────────────────────────────────────── */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setMode("power-station")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${mode === "power-station" ? "bg-yellow-500 text-black" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Zap className="w-3.5 h-3.5 inline mr-1.5" />
            Power Station
          </button>
          <button
            onClick={() => setMode("12v-system")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${mode === "12v-system" ? "bg-yellow-500 text-black" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Truck className="w-3.5 h-3.5 inline mr-1.5" />
            12V Battery System
          </button>
        </div>

        {/* ── Power Station Mode ───────────────────────────────────────── */}
        {mode === "power-station" && (<>

        {/* ── Station Selector ─────────────────────────────────────────── */}
        <section id="station-selector" className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-foreground">
              Step 1 — Select Your Power Station
            </h2>
          </div>

          <div className="grid gap-3">
            {BRANDS.map((brand) => {
              const brandStations = powerStations.filter((s) => s.brand === brand);
              const isOpen = brandOpen[brand] ?? true;
              const hasSelected = brandStations.some((s) => s.id === selectedStationId);

              return (
                <div
                  key={brand}
                  className={`border rounded-xl overflow-hidden transition-colors ${
                    hasSelected
                      ? "border-yellow-500/50 bg-yellow-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <button
                    onClick={() => toggleBrand(brand)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <span className="text-sm font-extrabold text-foreground">{brand}</span>
                    <div className="flex items-center gap-2">
                      {hasSelected && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-500 bg-yellow-500/15 px-2 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
                      {brandStations.map((station) => {
                        const isSelected = station.id === selectedStationId;
                        return (
                          <button
                            key={station.id}
                            onClick={() =>
                              setSelectedStationId(
                                isSelected ? null : station.id
                              )
                            }
                            className={`flex flex-col items-start gap-1 p-3 text-left transition-colors ${
                              isSelected
                                ? "bg-yellow-500/15"
                                : "bg-card hover:bg-muted/60"
                            }`}
                          >
                            <span
                              className={`text-sm font-bold ${
                                isSelected ? "text-yellow-400" : "text-foreground"
                              }`}
                            >
                              {station.model}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {station.capacity_wh.toLocaleString()} Wh &bull;{" "}
                              {station.solar_max_w}W solar &bull; max{" "}
                              {station.solar_max_voc}V
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Station Info Card ─────────────────────────────────────────── */}
        {selectedStation && (
          <section id="station-info" className="space-y-3">
            <div className="bg-card border border-yellow-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-yellow-500 mb-1">
                    Selected Station
                  </p>
                  <h3 className="text-xl font-extrabold text-foreground">
                    {selectedStation.brand} {selectedStation.model}
                  </h3>
                </div>
                {selectedStation.asin && (
                  <a
                    href={amzUrl(selectedStation.asin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-500 hover:text-yellow-400 border border-yellow-500/30 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0"
                  >
                    Amazon
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Capacity", value: `${selectedStation.capacity_wh.toLocaleString()} Wh` },
                  { label: "Max Solar Input", value: `${selectedStation.solar_max_w}W` },
                  { label: "Max Voc", value: `${selectedStation.solar_max_voc}V` },
                  {
                    label: "Native Connector",
                    value:
                      CONNECTOR_LABELS[selectedStation.native_connector] ??
                      selectedStation.native_connector,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-muted rounded-lg px-3 py-2.5 space-y-0.5"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm font-extrabold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {/* Voc safety callout */}
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-300">
                    Voc Safety Limit: {selectedStation.solar_max_voc}V
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Never connect panels with a combined open circuit voltage (Voc)
                    above <strong className="text-foreground">{selectedStation.solar_max_voc}V</strong>.
                    Exceeding this permanently damages the MPPT controller inside the
                    station &mdash; it&apos;s not a fuse you can replace.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Panel Filters ─────────────────────────────────────────────── */}
        <section id="panel-filters" className="space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-500" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-foreground">
              Step 2 — Filter Panels
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Panel type toggle */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(["all", "rigid", "flexible", "foldable"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setPanelTypeFilter(type)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-colors ${
                    panelTypeFilter === type
                      ? "bg-yellow-500 text-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "all" ? "All Types" : type}
                </button>
              ))}
            </div>

            {/* Roof/RTT toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => setRoofOnlyFilter((v) => !v)}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                  roofOnlyFilter ? "bg-yellow-500" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    roofOnlyFilter ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm font-semibold text-foreground group-hover:text-yellow-400 transition-colors">
                Roof / RTT mountable only
              </span>
            </label>
          </div>
        </section>

        {/* ── Results ───────────────────────────────────────────────────── */}
        {selectedStation ? (
          <section id="results" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                <h2 className="text-base font-extrabold uppercase tracking-wide text-foreground">
                  Step 3 — Compatibility Results
                </h2>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 font-bold text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {compatCount} compatible
                </span>
                {incompatCount > 0 && (
                  <span className="flex items-center gap-1.5 font-bold text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    {incompatCount} incompatible
                  </span>
                )}
              </div>
            </div>

            {results.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                No panels match the current filters.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((result) => (
                  <PanelCard key={result.panel.id} result={result} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center space-y-2">
            <Sun className="w-10 h-10 text-yellow-500/40 mx-auto" />
            <p className="text-sm font-bold text-muted-foreground">
              Select a power station above to see panel compatibility results.
            </p>
          </div>
        )}

        </>)}

        {/* ── 12V Battery System Mode ───────────────────────────────────── */}
        {mode === "12v-system" && (
          <div className="space-y-6">
            {/* Battery Bank */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-base font-extrabold mb-4 flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-yellow-500" /> Your Battery Bank
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Chemistry</label>
                  <select value={batteryChemistry} onChange={e => setBatteryChemistry(e.target.value as "lifepo4" | "agm" | "fla")}
                    className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground">
                    <option value="lifepo4">LiFePO4 (80% usable)</option>
                    <option value="agm">AGM (50% usable)</option>
                    <option value="fla">Flooded Lead Acid (50% usable)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Capacity (Ah)</label>
                  <input type="number" value={batteryAh} onChange={e => setBatteryAh(Math.max(20, parseInt(e.target.value) || 100))}
                    className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground font-bold tabular-nums" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Alternator Output (A)</label>
                  <input type="number" value={alternatorAmps} onChange={e => setAlternatorAmps(Math.max(40, parseInt(e.target.value) || 80))}
                    className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground font-bold tabular-nums" />
                  <p className="text-xs text-muted-foreground mt-1">Most trucks: 130-220A. DC-DC charger uses a portion of this.</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Total Panel Wattage (W)</label>
                <input type="number" value={customSolarWatts} onChange={e => setCustomSolarWatts(Math.max(0, parseInt(e.target.value) || 200))}
                  className="w-full sm:w-48 px-3 py-2 rounded-md bg-muted border border-border text-foreground font-bold tabular-nums" />
                <p className="text-xs text-muted-foreground mt-1">Enter your planned or existing panel wattage for charge time estimates.</p>
              </div>
              <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  Usable capacity: {Math.round(batteryAh * (batteryChemistry === "lifepo4" ? 0.80 : 0.50))}Ah
                  ({Math.round(batteryAh * (batteryChemistry === "lifepo4" ? 0.80 : 0.50) * 12.8)}Wh at 12.8V nominal)
                </p>
              </div>
            </div>

            {/* DC-DC Charger Selection */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-base font-extrabold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> DC-DC Charger / MPPT Controller
              </h3>
              <p className="text-sm text-muted-foreground mb-4">The DC-DC charger connects your alternator (and optionally solar) to your house battery. Pick one to see compatibility and charge time estimates.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {compatDcDcChargers.map(charger => {
                  const result = computeTwelveVSystem(charger, batteryAh, batteryChemistry, alternatorAmps, customSolarWatts);
                  const isSelected = selectedChargerId === charger.id;
                  return (
                    <button key={charger.id} onClick={() => setSelectedChargerId(isSelected ? "" : charger.id)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${isSelected ? "border-yellow-500 bg-yellow-500/5" : "border-border bg-card hover:border-yellow-500/50"}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-bold text-sm">{charger.brand} {charger.model}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{charger.dcAmps}A alternator input {charger.solarAmps ? `+ ${charger.solarAmps}A solar` : charger.solarMaxW ? `+ ${charger.solarMaxW}W solar` : "— no solar input"}</p>
                        <p className="text-yellow-600 dark:text-yellow-400">{result.altHoursNote}</p>
                        {(charger.solarAmps !== null || charger.solarMaxW !== null) ? <p className="text-green-500">{result.solarHoursNote}</p> : null}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">{charger.note}</p>
                      {charger.asin && (
                        <a href={`https://www.amazon.com/dp/${charger.asin}?tag=prepperevo-20`} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-400 mt-2">
                          View on Amazon <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cable Extensions */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-base font-extrabold mb-3 flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-500" /> MC4 Extension Cables
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Park in the shade. Run a cable to the panel in the sun. This is the most overlooked part of a functional camp solar setup.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cableExtensions.map(cable => (
                  <div key={cable.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border">
                    <div className="flex-1">
                      <p className="text-sm font-bold">{cable.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{cable.note}</p>
                      <p className="text-xs text-muted-foreground">{cable.gauge_awg}</p>
                    </div>
                    <a href={`https://www.amazon.com/dp/${cable.asin}?tag=prepperevo-20`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-yellow-500 hover:text-yellow-400 font-bold whitespace-nowrap flex items-center gap-1">
                      Amazon <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── How This Tool Works ───────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-yellow-500" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-foreground">
              How This Tool Works
            </h2>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-5 text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Voc vs Vmp — the number that matters</h3>
              <p>
                Every solar panel has two voltage ratings. <strong className="text-foreground">Vmp</strong> is
                the voltage at maximum power under load — that&apos;s what you see on the
                wattage output. <strong className="text-foreground">Voc</strong> (open circuit voltage) is
                the voltage when nothing is connected. It&apos;s higher than Vmp, and it&apos;s
                the number your station&apos;s MPPT controller sees the instant you plug in.
                This tool checks Voc — not Vmp — because that&apos;s the value that can fry
                your controller if it&apos;s too high.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Series vs parallel — when and why</h3>
              <p>
                <strong className="text-foreground">Series wiring</strong> adds voltages together (2 panels
                at 22V = 44V), which lets a single cable run farther with less loss. But
                series raises Voc — you need to stay under the station&apos;s limit.{" "}
                <strong className="text-foreground">Parallel wiring</strong> keeps voltage the same and
                adds current instead, useful when you&apos;re already at the voltage limit.
                Most portable station setups are small enough that a single panel or a
                2-panel series string is the practical answer.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Why adapters are needed</h3>
              <p>
                The solar industry standardized on MC4 connectors for panel-to-panel
                wiring. Power station manufacturers didn&apos;t — every brand invented its
                own input connector. Jackery uses DC8020, EcoFlow uses XT60, Bluetti
                uses MC4 on newer units, Goal Zero has its own HPP connector. The
                adapter column shows exactly what bridge you need, and points to the
                right one on Amazon.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Charge time math</h3>
              <p>
                Estimated charge times assume 100% depth of discharge to full, at the
                optimal panel config, with an 85% system efficiency factor applied.
                Real-world numbers are longer — panels run cooler in the morning, angle
                changes through the day, clouds, temperature, and the station&apos;s own
                internal efficiency all cut into it. Add 30–50% to any estimate as your
                field planning buffer.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Flexible panels on rooftops &amp; RTTs</h3>
              <p>
                Flexible panels are the practical choice for vehicle roofs and rooftop
                tent (RTT) platforms. They&apos;re lighter, lay flat without adding clearance
                height, and handle the curved surfaces of most racks and tent platforms.
                The tradeoff is modest — slightly lower efficiency than rigid mono panels
                and they degrade faster in extreme heat if airflow is blocked underneath.
                The Roof/RTT filter above shows only panels rated for this use case.
              </p>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <DataPrivacyNotice />
        <SupportFooter />
      </div>
    </div>
  );
}
