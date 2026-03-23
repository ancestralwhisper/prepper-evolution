
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Minus, Battery, BatteryCharging, ChevronDown, ChevronUp,
  ExternalLink, Sun, Zap, AlertTriangle, CheckCircle, X,
  MapPin, Clock, Download, MessageSquarePlus, Send, Search,
} from "lucide-react";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import { trackEvent } from "@/lib/analytics";
import PrintQrCode from "@/components/tools/PrintQrCode";
import InstallButton from "@/components/tools/InstallButton";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import ZipLookup from "@/components/tools/ZipLookup";
import type { ZipPrefixData } from "./zip-types";
import {
  deviceCategories,
  allDevices,
  powerStations,
  solarPanels,
  solarRegions,
  scenarioPresets,
  capacityTiers,
  INVERTER_EFFICIENCY,
  BATTERY_DOD,
  type Device,
  type PowerStationRec,
  type SolarRegion,
} from "./runtime-data";
import { GuidedTour } from "./GuidedTour";

const RUNTIME_TOUR = [
  { title: "Pick Your Power Station", body: "Select your power station from the list — the calculator loads its real Wh capacity automatically. If yours isn't listed, you can enter the Wh manually." },
  { title: "Add Your Devices", body: "Add the devices you'd run during an outage and set how many hours per day each runs. The fridge is almost always the biggest draw — don't forget it." },
  { title: "Read Your Runtime", body: "The results show how long your station lasts at your configured load and when you'll need to recharge. Scroll down to see how adding solar panels changes the math." },
];

interface SelectedDevices {
  [id: string]: { qty: number; hours: number; watts?: number };
}

export default function Calculator() {
  const [stationId, setStationId] = useState<string>("");
  const [customWh, setCustomWh] = useState<number>(1024);
  const [customMaxW, setCustomMaxW] = useState<number>(1800);
  const [useCustom, setUseCustom] = useState(false);
  const [selected, setSelected] = useState<SelectedDevices>({});
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [solarEnabled, setSolarEnabled] = useState(false);
  const [solarWatts, setSolarWatts] = useState(200);
  const [region, setRegion] = useState("northeast");
  const [stationSearch, setStationSearch] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Gear request form
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestBrand, setRequestBrand] = useState("");
  const [requestWattage, setRequestWattage] = useState("");
  const [requestUrl, setRequestUrl] = useState("");
  const [requestCat, setRequestCat] = useState(deviceCategories[0]?.id || "");
  const [requestStatus, setRequestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Selected station object
  const station = useMemo(() => {
    if (useCustom) return { id: "custom", name: "Custom Station", capacityWh: customWh, maxOutputW: customMaxW, price: "", affiliateUrl: "", note: "" };
    return powerStations.find((s) => s.id === stationId) || null;
  }, [stationId, useCustom, customWh, customMaxW]);

  // Load from URL params
  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "power-station-runtime" });
    const params = new URLSearchParams(window.location.search);
    const s = params.get("station");
    const g = params.get("g");
    const sol = params.get("solar");
    const r = params.get("r");

    if (s) {
      if (s.startsWith("custom-")) {
        setUseCustom(true);
        setCustomWh(parseInt(s.split("-")[1]) || 1024);
      } else {
        setStationId(s);
      }
    }
    if (g) {
      const devices: SelectedDevices = {};
      g.split(",").forEach((entry) => {
        const [id, qty, hours, watts] = entry.split(":");
        if (id) devices[id] = { qty: parseInt(qty) || 1, hours: parseFloat(hours) || 0, ...(watts ? { watts: parseInt(watts) } : {}) };
      });
      setSelected(devices);
    }
    if (sol) { setSolarEnabled(true); setSolarWatts(parseInt(sol) || 200); }
    if (r && solarRegions.some((sr) => sr.id === r)) setRegion(r);
    setInitialized(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem("pe-runtime-calculator", JSON.stringify({
      stationId, useCustom, customWh, customMaxW, selected, solarEnabled, solarWatts, region, timestamp: Date.now(),
    }));
  }, [stationId, useCustom, customWh, customMaxW, selected, solarEnabled, solarWatts, region, initialized]);

  const handleZipResult = useCallback((data: ZipPrefixData | null) => {
    if (data) setRegion(data.sr);
  }, []);

  const toggleDevice = useCallback((device: Device) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[device.id]) { delete next[device.id]; }
      else { next[device.id] = { qty: 1, hours: device.defaultHours, watts: device.watts }; }
      return next;
    });
  }, []);

  const adjustQty = useCallback((id: string, delta: number) => {
    setSelected((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const newQty = current.qty + delta;
      if (newQty <= 0) { const next = { ...prev }; delete next[id]; return next; }
      return { ...prev, [id]: { ...current, qty: Math.min(newQty, 20) } };
    });
  }, []);

  const setHours = useCallback((id: string, hours: number) => {
    setSelected((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, hours: Math.max(0, Math.min(24, hours)) } };
    });
  }, []);

  const setDeviceWatts = useCallback((id: string, watts: number) => {
    setSelected((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, watts: Math.max(1, Math.min(5000, watts)) } };
    });
  }, []);

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId); else next.add(catId);
      return next;
    });
  };

  const applyScenario = useCallback((presetId: string) => {
    const preset = scenarioPresets.find((p) => p.id === presetId);
    if (!preset) return;
    const devices: SelectedDevices = {};
    for (const [id, { qty, hours }] of Object.entries(preset.devices)) {
      const device = allDevices.find((d) => d.id === id);
      devices[id] = { qty, hours, watts: device?.watts };
    }
    setSelected(devices);
    const cats = new Set(Object.keys(preset.devices).map((id) => {
      const d = allDevices.find((dev) => dev.id === id);
      return d?.category || "";
    }).filter(Boolean));
    setExpandedCats(cats);
    trackEvent("pe_tool_view", { tool: "runtime-scenario-" + presetId });
  }, []);

  // ─── Calculations ───
  const calculations = useMemo(() => {
    if (!station) return null;

    const usableWh = station.capacityWh * BATTERY_DOD * INVERTER_EFFICIENCY;

    let totalDailyWh = 0;
    let peakWatts = 0;
    const categoryWh: Record<string, number> = {};
    const deviceBreakdown: { id: string; name: string; watts: number; qty: number; hours: number; dailyWh: number; category: string }[] = [];

    for (const [id, sel] of Object.entries(selected)) {
      const device = allDevices.find((d) => d.id === id);
      if (!device) continue;
      const w = sel.watts ?? device.watts;
      const wh = w * sel.qty * sel.hours;
      totalDailyWh += wh;
      peakWatts += w * sel.qty;
      categoryWh[device.category] = (categoryWh[device.category] || 0) + wh;
      deviceBreakdown.push({ id, name: device.name, watts: w, qty: sel.qty, hours: sel.hours, dailyWh: wh, category: device.category });
    }

    const avgDrawW = totalDailyWh / 24;
    const runtimeHours = avgDrawW > 0 ? usableWh / avgDrawW : Infinity;
    const worstCaseHours = peakWatts > 0 ? usableWh / peakWatts : Infinity;
    const overloaded = peakWatts > station.maxOutputW;

    // Solar offset
    const selectedRegion = solarRegions.find((r) => r.id === region);
    const peakSunHours = selectedRegion?.peakSunHours || 4;
    const dailySolarWh = solarEnabled ? solarWatts * peakSunHours * 0.85 : 0;
    const netDailyWh = Math.max(0, totalDailyWh - dailySolarWh);
    const netAvgDrawW = netDailyWh / 24;
    const solarRuntimeHours = netAvgDrawW > 0 ? usableWh / netAvgDrawW : Infinity;
    const solarFullyOffsets = solarEnabled && dailySolarWh >= totalDailyWh;

    // "Remove device" gains
    const deviceGains = deviceBreakdown.map((d) => {
      const whWithout = totalDailyWh - d.dailyWh;
      const avgWithout = whWithout / 24;
      const rtWithout = avgWithout > 0 ? usableWh / avgWithout : Infinity;
      return { ...d, hoursGained: rtWithout - runtimeHours };
    }).sort((a, b) => b.dailyWh - a.dailyWh);

    deviceBreakdown.sort((a, b) => b.dailyWh - a.dailyWh);

    return {
      usableWh,
      totalDailyWh,
      peakWatts,
      avgDrawW,
      runtimeHours,
      worstCaseHours,
      overloaded,
      categoryWh,
      deviceBreakdown,
      deviceGains,
      dailySolarWh,
      solarRuntimeHours,
      solarFullyOffsets,
      deviceCount: Object.keys(selected).length,
    };
  }, [selected, station, solarEnabled, solarWatts, region]);

  // Share URL
  const getShareUrl = useCallback(() => {
    const gearStr = Object.entries(selected).map(([id, s]) => {
      const base = `${id}:${s.qty}:${s.hours}`;
      return s.watts ? `${base}:${s.watts}` : base;
    }).join(",");
    const stationParam = useCustom ? `custom-${customWh}` : stationId;
    let url = `${window.location.origin}${window.location.pathname}?station=${stationParam}&g=${gearStr}`;
    if (solarEnabled) url += `&solar=${solarWatts}&r=${region}`;
    return url;
  }, [selected, stationId, useCustom, customWh, solarEnabled, solarWatts, region]);

  const fmtWh = (wh: number) => wh >= 1000 ? `${(wh / 1000).toFixed(1)} kWh` : `${Math.round(wh)} Wh`;
  const fmtHours = (h: number) => {
    if (!isFinite(h) || h > 8760) return "Indefinite";
    if (h >= 24) return `${Math.floor(h / 24)}d ${Math.round(h % 24)}h`;
    if (h >= 1) return `${h.toFixed(1)} hrs`;
    return `${Math.round(h * 60)} min`;
  };

  const chartSegments = deviceCategories.map((cat) => ({
    label: cat.name,
    value: calculations?.categoryWh[cat.id] || 0,
    color: cat.color,
  }));

  // Filtered stations for picker
  const filteredStations = useMemo(() => {
    const q = stationSearch.toLowerCase();
    return powerStations.filter((s) => !q || s.name.toLowerCase().includes(q));
  }, [stationSearch]);

  return (
    <div className="space-y-6">
      {/* Print layout */}
      <div className="hidden print:block print-layout">
        <h2 className="text-xl font-extrabold mb-2">Power Station Runtime Calculator</h2>
        {station && <p className="text-sm text-muted-foreground">Station: {station.name} ({station.capacityWh} Wh)</p>}
        {calculations && (
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Runtime:</strong> {fmtHours(calculations.runtimeHours)}</p>
            <p><strong>Daily Draw:</strong> {fmtWh(calculations.totalDailyWh)}</p>
            <p><strong>Peak Watts:</strong> {calculations.peakWatts}W</p>
            {solarEnabled && <p><strong>Runtime w/ Solar:</strong> {calculations.solarFullyOffsets ? "Indefinite" : fmtHours(calculations.solarRuntimeHours)}</p>}
          </div>
        )}
        <PrintQrCode url={getShareUrl()} />
        <p className="print-footer">Generated at prepperevolution.com/tools/power-station-runtime &mdash; {new Date().toLocaleDateString()}</p>
      </div>

      {/* ═══ SCREEN LAYOUT ═══ */}
      <div className="no-print mb-6">
        {/* Tool Title */}
        <div>
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Free Tool</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Power Station <span className="text-primary">Runtime Calculator</span></h2>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-8 no-print">
        {/* LEFT PANEL */}
        <div className="lg:col-span-2 space-y-6">

          <GuidedTour steps={RUNTIME_TOUR} toolName="Runtime Calculator walkthrough" />

          {/* How It Works */}
          <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-extrabold mb-3">How This Tool Works</h3>
            <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-3">
              <p>
                Already have a power station? Select it below, add the devices you want to run, and we&apos;ll tell you exactly how long your battery will last &mdash; and which devices to cut if you need more time.
              </p>
              <p>
                <strong className="text-foreground">The math:</strong> Your station&apos;s rated Wh &times; 80% depth of discharge &times; 85% inverter efficiency = usable energy. We divide that by your total device draw to get runtime.
              </p>
            </div>
          </div>

          {/* ─── Station Selection ─── */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide">
              <BatteryCharging className="w-4 h-4 inline mr-1.5" />Your Power Station
            </h3>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setUseCustom(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold border transition-colors ${!useCustom ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
              >Select a Station</button>
              <button
                onClick={() => setUseCustom(true)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold border transition-colors ${useCustom ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
              >Enter Custom Wh</button>
            </div>

            {useCustom ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">Battery Capacity (Wh)</label>
                  <input type="number" value={customWh} onChange={(e) => setCustomWh(Math.max(50, parseInt(e.target.value) || 50))}
                    className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground font-bold tabular-nums" />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">Max Output (W)</label>
                  <input type="number" value={customMaxW} onChange={(e) => setCustomMaxW(Math.max(100, parseInt(e.target.value) || 100))}
                    className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground font-bold tabular-nums" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search stations..." value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm" />
                </div>

                {/* Tiered list */}
                <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
                  {capacityTiers.map((tier) => {
                    const tierStations = filteredStations.filter((s) => s.capacityWh >= tier.min && s.capacityWh < tier.max);
                    if (tierStations.length === 0) return null;
                    return (
                      <div key={tier.label}>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{tier.label}</p>
                        <div className="space-y-1">
                          {tierStations.map((s) => (
                            <button key={s.id} onClick={() => setStationId(s.id)}
                              className={`w-full text-left px-3 py-2 rounded-md border transition-colors text-sm ${stationId === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                            >
                              <span className="font-bold">{s.name}</span>
                              <span className="text-muted-foreground ml-2">{(s.capacityWh / 1000).toFixed(1)} kWh &middot; {s.maxOutputW}W &middot; {s.price}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected station summary */}
            {station && (
              <div className="bg-primary/5 border border-primary/30 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{station.name}</p>
                  <p className="text-sm text-muted-foreground">{(station.capacityWh / 1000).toFixed(1)} kWh &middot; {station.maxOutputW}W max output</p>
                </div>
                {station.affiliateUrl && station.affiliateUrl !== "" && (
                  <a href={station.affiliateUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                    Amazon <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* ─── Quick Scenarios ─── */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide">Quick Scenarios <span className="font-normal normal-case text-muted-foreground">&mdash; pre-loads common devices</span></h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {scenarioPresets.map((p) => (
                <button key={p.id} onClick={() => applyScenario(p.id)}
                  className="text-left p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <span className="text-sm font-bold block">{p.name}</span>
                  <span className="text-[11px] text-muted-foreground leading-snug">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Device Selection ─── */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide">Your Devices</h3>
              {Object.keys(selected).length > 0 && (
                <button onClick={() => setSelected({})} className="text-sm text-muted-foreground hover:text-red-400 transition-colors">Clear All</button>
              )}
            </div>

            {deviceCategories.map((cat) => {
              const isExpanded = expandedCats.has(cat.id);
              const catSelectedCount = cat.devices.filter((d) => selected[d.id]).length;
              return (
                <div key={cat.id} className="border border-border rounded-lg overflow-hidden">
                  <button onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-bold">{cat.name}</span>
                      {catSelectedCount > 0 && (
                        <span className="text-xs font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded">{catSelectedCount}</span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 py-2 space-y-1 border-t border-border">
                      {cat.devices.map((device) => {
                        const sel = selected[device.id];
                        return (
                          <div key={device.id} className={`rounded-md px-3 py-2 transition-colors ${sel ? "bg-primary/5 border border-primary/20" : "hover:bg-muted"}`}>
                            <div className="flex items-center justify-between">
                              <button onClick={() => toggleDevice(device)} className="flex-1 text-left">
                                <span className="text-sm font-semibold">{device.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">{device.watts}W</span>
                              </button>
                              {!sel && (
                                <button onClick={() => toggleDevice(device)} className="text-sm font-bold text-primary">+ Add</button>
                              )}
                            </div>
                            {device.note && !sel && <p className="text-[11px] text-muted-foreground mt-0.5">{device.note}</p>}

                            {sel && (
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <button onClick={() => adjustQty(device.id, -1)} className="w-7 h-7 rounded flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold tabular-nums">{sel.qty}</span>
                                  <button onClick={() => adjustQty(device.id, 1)} className="w-7 h-7 rounded flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50">
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <input type="number" value={sel.hours} step={0.5} min={0} max={24}
                                    onChange={(e) => setHours(device.id, parseFloat(e.target.value) || 0)}
                                    className="w-14 px-1.5 py-1 rounded bg-muted border border-border text-sm text-center font-bold tabular-nums" />
                                  <span className="text-sm text-muted-foreground">hrs/day</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-muted-foreground" />
                                  <input type="number" value={sel.watts ?? device.watts} min={1} max={5000}
                                    onChange={(e) => setDeviceWatts(device.id, parseInt(e.target.value) || 1)}
                                    className="w-16 px-1.5 py-1 rounded bg-muted border border-border text-sm text-center font-bold tabular-nums" />
                                  <span className="text-sm text-muted-foreground">W</span>
                                </div>
                                <span className="text-sm text-primary font-bold ml-auto">{fmtWh((sel.watts ?? device.watts) * sel.qty * sel.hours)}/day</span>
                                <button onClick={() => toggleDevice(device)} className="text-muted-foreground hover:text-red-400"><X className="w-4 h-4" /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Request missing gear */}
            <div className="pt-2">
              <button onClick={() => setShowRequestForm(!showRequestForm)}
                className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                <MessageSquarePlus className="w-3 h-3" /> Don&apos;t see your device? Request it
              </button>
              {showRequestForm && (
                <div className="mt-3 bg-muted rounded-lg p-4 space-y-3 border border-border">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Device name" value={requestName} onChange={(e) => setRequestName(e.target.value)}
                      className="px-3 py-2 rounded bg-background border border-border text-sm" />
                    <input placeholder="Brand (optional)" value={requestBrand} onChange={(e) => setRequestBrand(e.target.value)}
                      className="px-3 py-2 rounded bg-background border border-border text-sm" />
                    <input placeholder="Wattage" value={requestWattage} onChange={(e) => setRequestWattage(e.target.value)}
                      className="px-3 py-2 rounded bg-background border border-border text-sm" />
                    <input placeholder="Product URL (optional)" value={requestUrl} onChange={(e) => setRequestUrl(e.target.value)}
                      className="px-3 py-2 rounded bg-background border border-border text-sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={requestCat} onChange={(e) => setRequestCat(e.target.value)}
                      className="px-3 py-2 rounded bg-background border border-border text-sm flex-1">
                      {deviceCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button disabled={!requestName || requestStatus === "sending"}
                      onClick={() => { setRequestStatus("sent"); setTimeout(() => setShowRequestForm(false), 2000); }}
                      className="px-4 py-2 bg-primary text-white rounded font-bold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1">
                      <Send className="w-3 h-3" /> {requestStatus === "sent" ? "Sent!" : "Submit"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Solar Offset ─── */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                <Sun className="w-4 h-4 inline mr-1.5 text-yellow-500" /> Solar Panel Offset
              </h3>
              <button onClick={() => setSolarEnabled(!solarEnabled)}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${solarEnabled ? "bg-primary text-white" : "bg-muted border border-border text-muted-foreground"}`}>
                {solarEnabled ? "ON" : "OFF"}
              </button>
            </div>

            {solarEnabled && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">If you have solar panels, enter the total wattage and your region to see how much they extend your runtime.</p>
                <a href="/tools/solar-compatibility" className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-500 hover:text-yellow-400 transition-colors">
                  <Sun className="w-3.5 h-3.5" /> Not sure which panels work with your station? Check compatibility →
                </a>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">Panel Wattage</label>
                    <input type="number" value={solarWatts} onChange={(e) => setSolarWatts(Math.max(10, parseInt(e.target.value) || 10))}
                      className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground font-bold tabular-nums" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3 inline mr-1" /> Region
                    </label>
                    <select value={region} onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm">
                      {solarRegions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
                <ZipLookup onResult={handleZipResult} />
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR — Results ═══ */}
        <div className="lg:col-span-1 space-y-6">
          <div className="lg:sticky lg:top-8 space-y-6">

            {/* No station selected */}
            {!station && (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Battery className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a power station to see runtime calculations</p>
              </div>
            )}

            {station && calculations && (
              <>
                {/* ─── Hero Runtime ─── */}
                <div className="bg-card border-2 border-primary/30 rounded-lg p-6 text-center">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Estimated Runtime</p>
                  <p className="text-4xl sm:text-5xl font-extrabold text-primary tabular-nums">
                    {calculations.deviceCount === 0 ? "—" : fmtHours(calculations.runtimeHours)}
                  </p>
                  {calculations.deviceCount > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">Worst case (all at once): {fmtHours(calculations.worstCaseHours)}</p>
                  )}
                  {solarEnabled && calculations.deviceCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">With Solar</p>
                      <p className="text-2xl font-extrabold text-yellow-500">
                        {calculations.solarFullyOffsets ? "Indefinite" : fmtHours(calculations.solarRuntimeHours)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{Math.round(calculations.dailySolarWh)} Wh/day from panels</p>
                    </div>
                  )}
                </div>

                {/* ─── Overload Warning ─── */}
                {calculations.overloaded && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-500">Peak Load Exceeds Output</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your devices draw <strong className="text-foreground">{calculations.peakWatts}W</strong> simultaneously, but your station maxes out at <strong className="text-foreground">{station.maxOutputW}W</strong>. Stagger high-draw devices or reduce your load.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Stats Grid ─── */}
                {calculations.deviceCount > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Daily Draw", value: fmtWh(calculations.totalDailyWh) },
                      { label: "Peak Watts", value: `${calculations.peakWatts}W`, warn: calculations.overloaded },
                      { label: "Usable Capacity", value: fmtWh(calculations.usableWh) },
                      { label: "Avg Draw", value: `${Math.round(calculations.avgDrawW)}W` },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-card border border-border rounded-lg p-3 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                        <p className={`text-lg font-extrabold tabular-nums ${stat.warn ? "text-red-500" : ""}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── Donut Chart ─── */}
                {calculations.deviceCount > 0 && (
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Usage Breakdown</h4>
                    <DonutChart segments={chartSegments} totalLabel="Total" totalValue={`${Math.round(calculations.totalDailyWh)} Wh`} size={180} />
                    <ChartLegend segments={chartSegments} />
                  </div>
                )}

                {/* ─── Extend Runtime ─── */}
                {calculations.deviceCount > 1 && (
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Extend Your Runtime</h4>
                    <p className="text-[11px] text-muted-foreground mb-3">Remove a device to see how much runtime you gain.</p>
                    <div className="space-y-1.5">
                      {calculations.deviceGains.slice(0, 8).map((d) => (
                        <div key={d.id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-muted transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold truncate block">{d.name}</span>
                            <span className="text-[11px] text-muted-foreground">{fmtWh(d.dailyWh)}/day</span>
                          </div>
                          <span className="text-sm font-bold text-green-500 whitespace-nowrap ml-2">
                            +{isFinite(d.hoursGained) ? fmtHours(d.hoursGained) : "a lot"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Station Affiliate ─── */}
                {station.affiliateUrl && station.affiliateUrl !== "" && station.id !== "custom" && (
                  <a href={station.affiliateUrl} target="_blank" rel="noopener noreferrer"
                    className="block bg-primary text-white text-center font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm">
                    Buy {station.name} on Amazon <ExternalLink className="w-3.5 h-3.5 inline ml-1" />
                  </a>
                )}
              </>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <ToolSocialShare url={getShareUrl()} toolName="Power Station Runtime Calculator" />
              <InstallButton />
            </div>

            <DataPrivacyNotice />
          </div>
        </div>
      </div>

      <SupportFooter />
    </div>
  );
}
