
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Plus, Minus, Zap,
  Battery, Sun, Cable, Check, AlertTriangle, ShoppingCart, Truck,
  Download, Wrench, Thermometer, Info, X,
} from "lucide-react";
import {
  deviceDatabase, deviceCategoryLabels, deviceCategoryColors, deviceCategoryNotes,
  batterySpecs, coldDerating, dcDcChargers, alternatorLookup, standardBatteryCapacities,
  type DeviceEntry, type DeviceCategory, type BatteryChemistry, type VehicleType, type DcDcCharger,
} from "./power-system-data";
import {
  deviceToLoad, computeFullSystem, peakAmps, totalDailyAh,
  type SelectedLoad, type PowerSystemResult, type WireCircuit,
} from "./power-system-compute";
import type { ClimateZoneId, ZipPrefixData } from "@/pages/tools/zip-types";
import PowerSystemDiagram from "./PowerSystemDiagram";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import ZipLookup from "@/components/tools/ZipLookup";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import ToolSafetyDisclaimer from "@/components/tools/ToolSafetyDisclaimer";
import SupportFooter from "@/components/tools/SupportFooter";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import { trackEvent } from "@/lib/analytics";

// ─── localStorage keys ─────────────────────────────────────────────
const STORAGE_KEY = "pe-power-system";
const VP_KEY = "pe-vehicle-profile";

// ─── Step definitions ──────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Vehicle", icon: Truck },
  { id: 2, label: "Loads", icon: Zap },
  { id: 3, label: "Battery", icon: Battery },
  { id: 4, label: "Charging", icon: Sun },
  { id: 5, label: "Wiring", icon: Cable },
] as const;

// ─── Types ─────────────────────────────────────────────────────────

interface DeviceSelection {
  deviceId: string;
  qty: number;
  hoursPerDay: number;
  dutyCyclePct: number;
}

interface CustomDevice {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  dutyCyclePct: number;
  invertRequired: boolean;
}

interface SavedState {
  step: number;
  vehicleType: VehicleType;
  alternatorAmps: number;
  smartAlternator: boolean;
  deviceSelections: DeviceSelection[];
  customDevices: CustomDevice[];
  chemistry: BatteryChemistry;
  singleCapacityAh: number;
  batteryCount: number;
  daysAutonomyTarget: number;
  climateZone: ClimateZoneId;
  dcDcChargerId: string;
  dailyDriveHours: number;
  solarWatts: number;
  peakSunHours: number;
  shoreChargerAmps: number;
  circuitDistances: Record<string, number>;
}

const ELECTRICAL_SAFETY_MESSAGE =
  "Incorrect wire sizing or fuse sizing can cause vehicle fires. This tool uses NEC/ABYC-based calculations " +
  "but is for planning purposes only. Have all electrical work inspected by a qualified technician. " +
  "Prepper Evolution assumes no liability for any decisions made using this tool.";

// ─── Component ─────────────────────────────────────────────────────

export default function PowerSystemBuilder() {
  // ─── State ───────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);

  // Step 1: Vehicle
  const [vehicleType, setVehicleType] = useState<VehicleType>("full-size-truck");
  const [alternatorAmps, setAlternatorAmps] = useState(150);
  const [smartAlternator, setSmartAlternator] = useState(true);
  const [vehicleProfileLoaded, setVehicleProfileLoaded] = useState(false);

  // Step 2: Loads
  const [deviceSelections, setDeviceSelections] = useState<DeviceSelection[]>([]);
  const [customDevices, setCustomDevices] = useState<CustomDevice[]>([]);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["refrigeration"]));
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customWatts, setCustomWatts] = useState(50);
  const [customHours, setCustomHours] = useState(4);
  const [customDuty, setCustomDuty] = useState(100);
  const [customInvert, setCustomInvert] = useState(false);

  // Step 3: Battery
  const [chemistry, setChemistry] = useState<BatteryChemistry>("lifepo4");
  const [singleCapacityAh, setSingleCapacityAh] = useState(200);
  const [batteryCount, setBatteryCount] = useState(1);
  const [daysAutonomyTarget, setDaysAutonomyTarget] = useState(2);
  const [climateZone, setClimateZone] = useState<ClimateZoneId>("temperate");

  // Step 4: Charging
  const [dcDcChargerId, setDcDcChargerId] = useState("renogy-dcc50s");
  const [dailyDriveHours, setDailyDriveHours] = useState(2);
  const [solarWatts, setSolarWatts] = useState(200);
  const [peakSunHours, setPeakSunHours] = useState(5.0);
  const [shoreChargerAmps, setShoreChargerAmps] = useState(0);

  // Step 5: Wiring
  const [circuitDistances, setCircuitDistances] = useState<Record<string, number>>({});

  // Safety checklist
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasTrackedStart = useRef(false);

  // ─── Load Vehicle Profile from localStorage ──────────────────────
  useEffect(() => {
    try {
      const vpRaw = localStorage.getItem(VP_KEY);
      if (vpRaw) {
        const vp = JSON.parse(vpRaw);
        if (vp.alternatorAmps) {
          setAlternatorAmps(vp.alternatorAmps);
          setVehicleProfileLoaded(true);
          // Infer vehicle type from body type or weight
          if (vp.gvwr > 8500) setVehicleType("heavy-duty-truck");
          else if (vp.gvwr > 6500) setVehicleType("full-size-truck");
          else if (vp.bodyType === "suv" && vp.gvwr > 5500) setVehicleType("full-size-suv");
          else if (vp.bodyType === "suv") setVehicleType("midsize-suv");
          else setVehicleType("midsize-suv");
        }
      }
    } catch { /* ignore */ }
  }, []);

  // ─── Load saved state ────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: SavedState = JSON.parse(raw);
        setStep(saved.step || 1);
        setVehicleType(saved.vehicleType || "full-size-truck");
        setAlternatorAmps(saved.alternatorAmps || 150);
        setSmartAlternator(saved.smartAlternator ?? true);
        setDeviceSelections(saved.deviceSelections || []);
        setCustomDevices(saved.customDevices || []);
        setChemistry(saved.chemistry || "lifepo4");
        setSingleCapacityAh(saved.singleCapacityAh || 200);
        setBatteryCount(saved.batteryCount || 1);
        setDaysAutonomyTarget(saved.daysAutonomyTarget || 2);
        setClimateZone(saved.climateZone || "temperate");
        setDcDcChargerId(saved.dcDcChargerId || "renogy-dcc50s");
        setDailyDriveHours(saved.dailyDriveHours ?? 2);
        setSolarWatts(saved.solarWatts ?? 200);
        setPeakSunHours(saved.peakSunHours ?? 5.0);
        setShoreChargerAmps(saved.shoreChargerAmps ?? 0);
        setCircuitDistances(saved.circuitDistances || {});
      }
    } catch { /* ignore */ }
  }, []);

  // ─── Debounced save ──────────────────────────────────────────────
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      const state: SavedState = {
        step, vehicleType, alternatorAmps, smartAlternator,
        deviceSelections, customDevices, chemistry, singleCapacityAh,
        batteryCount, daysAutonomyTarget, climateZone, dcDcChargerId,
        dailyDriveHours, solarWatts, peakSunHours, shoreChargerAmps,
        circuitDistances,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  });

  // ─── Track start ─────────────────────────────────────────────────
  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackEvent("pe_power_system_started", { tool: "power-system-builder" });
      hasTrackedStart.current = true;
    }
  }, []);

  // ─── Computed loads ──────────────────────────────────────────────
  const loads: SelectedLoad[] = useMemo(() => {
    const fromDb = deviceSelections.flatMap((sel) => {
      const device = deviceDatabase.find((d) => d.id === sel.deviceId);
      if (!device) return [];
      return Array.from({ length: sel.qty }, () =>
        deviceToLoad(device, sel.hoursPerDay, sel.dutyCyclePct)
      );
    });
    const fromCustom = customDevices.map((cd) => {
      const fakeDevice: DeviceEntry = {
        id: cd.id, name: cd.name, watts: cd.watts,
        amps12v: cd.watts / 12, dutyCyclePct: cd.dutyCyclePct,
        defaultHoursPerDay: cd.hoursPerDay, category: "electronics",
        invertRequired: cd.invertRequired,
      };
      return deviceToLoad(fakeDevice, cd.hoursPerDay, cd.dutyCyclePct);
    });
    return [...fromDb, ...fromCustom];
  }, [deviceSelections, customDevices]);

  const totalDaily = useMemo(() => totalDailyAh(loads), [loads]);
  const peakDraw = useMemo(() => peakAmps(loads), [loads]);

  // ─── Full system result ──────────────────────────────────────────
  const dcDcCharger = dcDcChargers.find((c) => c.id === dcDcChargerId) ?? null;

  const result: PowerSystemResult | null = useMemo(() => {
    if (loads.length === 0) return null;
    return computeFullSystem({
      loads,
      chemistry,
      singleCapacityAh,
      batteryCount,
      daysAutonomyTarget,
      climateZone,
      chargeSources: {
        dcDcCharger,
        dailyDriveHours,
        solarWatts,
        peakSunHours,
        shoreChargerAmps,
      },
      vehicleType,
      alternatorAmps,
      smartAlternator,
      circuitDistances,
    });
  }, [
    loads, chemistry, singleCapacityAh, batteryCount, daysAutonomyTarget,
    climateZone, dcDcCharger, dailyDriveHours, solarWatts, peakSunHours,
    shoreChargerAmps, vehicleType, alternatorAmps, smartAlternator, circuitDistances,
  ]);

  // ─── Handlers ────────────────────────────────────────────────────

  const toggleCategory = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const getSelection = (deviceId: string): DeviceSelection | undefined =>
    deviceSelections.find((s) => s.deviceId === deviceId);

  const toggleDevice = (device: DeviceEntry) => {
    setDeviceSelections((prev) => {
      const existing = prev.find((s) => s.deviceId === device.id);
      if (existing) return prev.filter((s) => s.deviceId !== device.id);
      return [...prev, {
        deviceId: device.id,
        qty: 1,
        hoursPerDay: device.defaultHoursPerDay,
        dutyCyclePct: device.dutyCyclePct,
      }];
    });
    trackEvent("pe_power_system_load_added", { tool: "power-system-builder", device: device.name });
  };

  const updateSelection = (deviceId: string, updates: Partial<DeviceSelection>) => {
    setDeviceSelections((prev) =>
      prev.map((s) => s.deviceId === deviceId ? { ...s, ...updates } : s)
    );
  };

  const addCustomDevice = () => {
    if (!customName.trim()) return;
    const cd: CustomDevice = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      watts: customWatts,
      hoursPerDay: customHours,
      dutyCyclePct: customDuty,
      invertRequired: customInvert,
    };
    setCustomDevices((prev) => [...prev, cd]);
    setCustomName("");
    setCustomWatts(50);
    setCustomHours(4);
    setCustomDuty(100);
    setCustomInvert(false);
    setShowCustomForm(false);
  };

  const removeCustomDevice = (id: string) => {
    setCustomDevices((prev) => prev.filter((d) => d.id !== id));
  };

  const handleZipResult = useCallback((data: ZipPrefixData | null) => {
    if (data) {
      setClimateZone(data.cz);
      setPeakSunHours(data.psh);
    }
  }, []);

  const updateCircuitDistance = (circuitId: string, distance: number) => {
    setCircuitDistances((prev) => ({ ...prev, [circuitId]: distance }));
  };

  const handleGenerate = () => {
    setShowResults(true);
    trackEvent("pe_power_system_report_generated", { tool: "power-system-builder" });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // ─── Render helpers ──────────────────────────────────────────────

  const categories = Object.keys(deviceCategoryLabels) as DeviceCategory[];

  // Group devices by category
  const devicesByCategory = useMemo(() => {
    const map = new Map<DeviceCategory, DeviceEntry[]>();
    for (const cat of categories) {
      map.set(cat, deviceDatabase.filter((d) => d.category === cat));
    }
    return map;
  }, []);

  // ─── Step 1: Vehicle Setup ──────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-extrabold mb-1">Vehicle Setup</h3>
        <p className="text-sm text-muted-foreground">Your vehicle determines alternator capacity and spare amps available for auxiliary charging.</p>
      </div>

      {vehicleProfileLoaded && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-emerald-500">Loaded from Vehicle Profile</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Vehicle Type</label>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value as VehicleType)}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm"
        >
          {alternatorLookup.map((a) => (
            <option key={a.type} value={a.type}>{a.label} ({a.stockRangeMin}-{a.stockRangeMax}A stock)</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Alternator Amps</label>
        <input
          type="number" min={40} max={300} step={5}
          value={alternatorAmps}
          onChange={(e) => setAlternatorAmps(Number(e.target.value))}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-mono"
        />
        <p className="text-[10px] text-muted-foreground mt-1">Check your owner&apos;s manual or alternator sticker for exact rating</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setSmartAlternator(!smartAlternator)}
          className={`relative w-10 h-5 rounded-full transition-colors ${smartAlternator ? "bg-primary" : "bg-card-border"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${smartAlternator ? "left-5" : "left-0.5"}`} />
        </button>
        <div>
          <span className="text-sm font-bold">Smart Alternator</span>
          <p className="text-[10px] text-muted-foreground">Most 2017+ vehicles have ECU-controlled alternators. Requires compatible DC-DC charger.</p>
        </div>
      </div>
    </div>
  );

  // ─── Step 2: Load Builder ───────────────────────────────────────

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-extrabold mb-1">Load Builder</h3>
        <p className="text-sm text-muted-foreground">Select your devices and adjust run times. The calculator handles duty cycles and inverter overhead automatically.</p>
      </div>

      {/* Running totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted border border-border rounded-lg p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Daily Load</p>
          <p className="text-xl font-extrabold text-primary">{totalDaily.toFixed(1)} <span className="text-xs text-muted-foreground">Ah</span></p>
        </div>
        <div className="bg-muted border border-border rounded-lg p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Peak Draw</p>
          <p className="text-xl font-extrabold">{peakDraw.toFixed(1)} <span className="text-xs text-muted-foreground">A</span></p>
        </div>
      </div>

      {/* Category accordions */}
      {categories.map((cat) => {
        const devices = devicesByCategory.get(cat) ?? [];
        const isExpanded = expandedCats.has(cat);
        const catNote = deviceCategoryNotes[cat];
        const selectedCount = deviceSelections.filter((s) =>
          devices.some((d) => d.id === s.deviceId)
        ).length;

        return (
          <div key={cat} className="bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: deviceCategoryColors[cat] }} />
                <span className="text-sm font-bold">{deviceCategoryLabels[cat]}</span>
                {selectedCount > 0 && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {selectedCount}
                  </span>
                )}
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {catNote && (
                  <div className="flex items-start gap-2 bg-muted rounded-lg px-3 py-2">
                    <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground">{catNote}</p>
                  </div>
                )}
                {devices.map((device) => {
                  const sel = getSelection(device.id);
                  const isSelected = !!sel;
                  const load = isSelected
                    ? deviceToLoad(device, sel.hoursPerDay, sel.dutyCyclePct)
                    : null;

                  return (
                    <div key={device.id} className={`rounded-lg border p-3 transition-colors ${isSelected ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                      <div className="flex items-center justify-between">
                        <button onClick={() => toggleDevice(device)} className="flex-1 text-left">
                          <span className="text-sm font-bold">{device.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{device.watts}W / {device.amps12v}A</span>
                          {device.invertRequired && <span className="text-[9px] text-warning ml-1">(inverter)</span>}
                        </button>
                        <button
                          onClick={() => toggleDevice(device)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-border"}`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </div>

                      {device.note && (
                        <p className="text-[10px] text-muted-foreground mt-1">{device.note}</p>
                      )}

                      {isSelected && sel && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {/* Qty */}
                          <div>
                            <label className="text-[9px] font-bold uppercase text-muted-foreground">Qty</label>
                            <div className="flex items-center gap-1 mt-1">
                              <button onClick={() => updateSelection(device.id, { qty: Math.max(1, sel.qty - 1) })}
                                className="w-6 h-6 rounded bg-muted border border-border flex items-center justify-center">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-bold w-6 text-center">{sel.qty}</span>
                              <button onClick={() => updateSelection(device.id, { qty: sel.qty + 1 })}
                                className="w-6 h-6 rounded bg-muted border border-border flex items-center justify-center">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {/* Hours */}
                          <div>
                            <label className="text-[9px] font-bold uppercase text-muted-foreground">Hours/Day</label>
                            <input
                              type="range" min={0} max={24} step={0.5}
                              value={sel.hoursPerDay}
                              onChange={(e) => updateSelection(device.id, { hoursPerDay: Number(e.target.value) })}
                              className="w-full mt-1 accent-accent"
                            />
                            <span className="text-[10px] text-muted-foreground">{sel.hoursPerDay}h</span>
                          </div>
                          {/* Duty */}
                          <div>
                            <label className="text-[9px] font-bold uppercase text-muted-foreground">Duty %</label>
                            <input
                              type="range" min={5} max={100} step={5}
                              value={sel.dutyCyclePct}
                              onChange={(e) => updateSelection(device.id, { dutyCyclePct: Number(e.target.value) })}
                              className="w-full mt-1 accent-accent"
                            />
                            <span className="text-[10px] text-muted-foreground">{sel.dutyCyclePct}%</span>
                          </div>
                          {/* Daily Ah */}
                          <div>
                            <label className="text-[9px] font-bold uppercase text-muted-foreground">Daily Ah</label>
                            <p className="text-lg font-extrabold text-primary mt-0.5">
                              {load ? (load.dailyAh * sel.qty).toFixed(1) : "—"}
                            </p>
                          </div>
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

      {/* Custom devices */}
      {customDevices.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Custom Devices</h4>
          {customDevices.map((cd) => {
            const amps = (cd.invertRequired ? cd.watts * 1.15 : cd.watts) / 12;
            const dailyAh = amps * cd.hoursPerDay * (cd.dutyCyclePct / 100);
            return (
              <div key={cd.id} className="flex items-center justify-between bg-muted border border-border rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm font-bold">{cd.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{cd.watts}W / {cd.hoursPerDay}h / {cd.dutyCyclePct}% duty</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">{dailyAh.toFixed(1)} Ah</span>
                  <button onClick={() => removeCustomDevice(cd.id)} className="text-muted hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add custom device */}
      {showCustomForm ? (
        <div className="bg-muted border border-border rounded-lg p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Add Custom Device</h4>
          <input
            type="text" placeholder="Device name" value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[9px] font-bold uppercase text-muted-foreground">Watts</label>
              <input type="number" min={1} max={2000} value={customWatts} onChange={(e) => setCustomWatts(Number(e.target.value))}
                className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-sm font-mono" />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-muted-foreground">Hours/Day</label>
              <input type="number" min={0} max={24} step={0.5} value={customHours} onChange={(e) => setCustomHours(Number(e.target.value))}
                className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-sm font-mono" />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-muted-foreground">Duty %</label>
              <input type="number" min={5} max={100} step={5} value={customDuty} onChange={(e) => setCustomDuty(Number(e.target.value))}
                className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-sm font-mono" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" checked={customInvert} onChange={(e) => setCustomInvert(e.target.checked)} className="accent-accent" />
                Inverter
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addCustomDevice} className="px-4 py-2 bg-primary text-background text-sm font-bold rounded-lg">Add</button>
            <button onClick={() => setShowCustomForm(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowCustomForm(true)}
          className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
          <Plus className="w-4 h-4" /> Add Custom Device
        </button>
      )}
    </div>
  );

  // ─── Step 3: Battery Bank ───────────────────────────────────────

  const spec = batterySpecs[chemistry];
  const totalBankAh = singleCapacityAh * batteryCount;
  const usableAh = totalBankAh * spec.dod;
  const deratedAh = usableAh * coldDerating[climateZone];
  const bankWeight = totalBankAh * spec.lbsPerAh;
  const recommendedAh = totalDaily > 0 ? Math.ceil((totalDaily * daysAutonomyTarget) / (spec.dod * coldDerating[climateZone]) / 50) * 50 : 0;

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-extrabold mb-1">Battery Bank</h3>
        <p className="text-sm text-muted-foreground">Choose chemistry, capacity, and count. LiFePO4 is recommended for overlanding — lighter, deeper discharge, longer life.</p>
      </div>

      {/* Chemistry */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Chemistry</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(batterySpecs) as BatteryChemistry[]).map((chem) => {
            const s = batterySpecs[chem];
            const selected = chemistry === chem;
            return (
              <button key={chem} onClick={() => setChemistry(chem)}
                className={`text-left rounded-lg border p-3 transition-colors ${selected ? "border-primary bg-primary/5" : "border-border"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{s.label}</span>
                  {chem === "lifepo4" && <span className="text-[8px] font-bold uppercase bg-primary/10 text-primary px-1 py-0.5 rounded">Recommended</span>}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{(s.dod * 100).toFixed(0)}% DOD / {s.lbsPerAh} lb/Ah / {s.cycleLifeMin.toLocaleString()}+ cycles</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Capacity */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Single Battery Capacity (Ah)</label>
        <div className="flex gap-2">
          {standardBatteryCapacities.map((cap) => (
            <button key={cap} onClick={() => setSingleCapacityAh(cap)}
              className={`px-4 py-2 rounded-lg border text-sm font-bold transition-colors ${singleCapacityAh === cap ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
              {cap}Ah
            </button>
          ))}
          <input type="number" min={50} max={400} step={10} value={singleCapacityAh}
            onChange={(e) => setSingleCapacityAh(Number(e.target.value))}
            className="w-24 bg-muted border border-border rounded-lg px-2 py-2 text-sm font-mono text-center" />
        </div>
      </div>

      {/* Count */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Battery Count</label>
        <div className="flex items-center gap-3">
          <button onClick={() => setBatteryCount(Math.max(1, batteryCount - 1))}
            className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-2xl font-extrabold w-8 text-center">{batteryCount}</span>
          <button onClick={() => setBatteryCount(Math.min(4, batteryCount + 1))}
            className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of autonomy */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Days of Autonomy Target</label>
        <input type="range" min={1} max={5} step={0.5} value={daysAutonomyTarget}
          onChange={(e) => setDaysAutonomyTarget(Number(e.target.value))}
          className="w-full accent-accent" />
        <span className="text-sm font-bold">{daysAutonomyTarget} day{daysAutonomyTarget !== 1 ? "s" : ""}</span>
      </div>

      {/* ZIP for climate */}
      <ZipLookup onResult={handleZipResult} showFields={["climate"]} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-muted border border-border rounded-lg p-3 text-center">
          <p className="text-[9px] font-bold uppercase text-muted-foreground">Total</p>
          <p className="text-lg font-extrabold">{totalBankAh} <span className="text-xs text-muted-foreground">Ah</span></p>
        </div>
        <div className="bg-muted border border-border rounded-lg p-3 text-center">
          <p className="text-[9px] font-bold uppercase text-muted-foreground">Usable</p>
          <p className="text-lg font-extrabold">{usableAh.toFixed(0)} <span className="text-xs text-muted-foreground">Ah</span></p>
        </div>
        <div className="bg-muted border border-border rounded-lg p-3 text-center">
          <p className="text-[9px] font-bold uppercase text-muted-foreground">Cold Derated</p>
          <p className="text-lg font-extrabold">{deratedAh.toFixed(0)} <span className="text-xs text-muted-foreground">Ah</span></p>
        </div>
        <div className="bg-muted border border-border rounded-lg p-3 text-center">
          <p className="text-[9px] font-bold uppercase text-muted-foreground">Weight</p>
          <p className="text-lg font-extrabold">{bankWeight.toFixed(1)} <span className="text-xs text-muted-foreground">lbs</span></p>
        </div>
      </div>

      {/* Recommended comparison */}
      {recommendedAh > 0 && (
        <div className={`rounded-lg p-3 border ${totalBankAh >= recommendedAh ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
          <p className="text-xs">
            <span className="font-bold">Recommended:</span> {recommendedAh}Ah for {daysAutonomyTarget} days at {totalDaily.toFixed(1)} Ah/day
            {totalBankAh >= recommendedAh
              ? <span className="text-emerald-500 font-bold ml-2">Your bank meets the target</span>
              : <span className="text-amber-500 font-bold ml-2">Your bank is {recommendedAh - totalBankAh}Ah short</span>
            }
          </p>
        </div>
      )}

      {/* Cold warning */}
      {chemistry === "lifepo4" && climateZone === "cold" && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <Thermometer className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-500">LiFePO4 Cold Charge Warning</p>
            <p className="text-[11px] text-red-400/80 mt-1">
              LiFePO4 batteries cannot be charged below 32F (0C). Charging below freezing causes permanent lithium plating.
              Use a battery with built-in heating or insulate and heat the battery enclosure.
              Capacity derated to {(coldDerating.cold * 100).toFixed(0)}% in cold conditions.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Step 4: Charging Sources ───────────────────────────────────

  const spareCapacity = (() => {
    const lookup = alternatorLookup.find((a) => a.type === vehicleType);
    if (!lookup) return 20;
    const mid = (lookup.spareMin + lookup.spareMax) / 2;
    const stockMid = (lookup.stockRangeMin + lookup.stockRangeMax) / 2;
    return alternatorAmps > 0 ? Math.round(alternatorAmps * (mid / stockMid)) : mid;
  })();

  const effectiveDcAmps = dcDcCharger ? Math.min(dcDcCharger.dcAmps, spareCapacity) : 0;
  const altAhPerDay = effectiveDcAmps * dailyDriveHours;
  const solarAhPerDay = solarWatts > 0 && peakSunHours > 0 ? (solarWatts * peakSunHours * 0.80) / 12 : 0;

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-extrabold mb-1">Charging Sources</h3>
        <p className="text-sm text-muted-foreground">Configure how your aux bank gets charged — alternator, solar, and shore power.</p>
      </div>

      {/* DC-DC Charger */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">DC-DC Charger</label>
        <select value={dcDcChargerId} onChange={(e) => setDcDcChargerId(e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm">
          <option value="">None</option>
          {dcDcChargers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.brand} {c.model} — {c.dcAmps}A DC{c.solarAmps ? ` / ${c.solarAmps}A solar` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Drive time */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Daily Drive Time</label>
        <input type="range" min={0} max={8} step={0.5} value={dailyDriveHours}
          onChange={(e) => setDailyDriveHours(Number(e.target.value))}
          className="w-full accent-accent" />
        <span className="text-sm font-bold">{dailyDriveHours}h/day</span>
      </div>

      {/* Alternator charge summary */}
      {dcDcCharger && (
        <div className="bg-muted border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            Effective charge: min({dcDcCharger.dcAmps}A charger, {spareCapacity}A spare) = <span className="font-bold text-foreground">{effectiveDcAmps}A</span>
            {" "}x {dailyDriveHours}h = <span className="font-bold text-primary">{altAhPerDay.toFixed(1)} Ah/day</span>
          </p>
        </div>
      )}

      {/* Solar */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Solar (Watts)</label>
        <div className="flex gap-3 items-center">
          <input type="range" min={0} max={800} step={25} value={solarWatts}
            onChange={(e) => setSolarWatts(Number(e.target.value))}
            className="flex-1 accent-accent" />
          <input type="number" min={0} max={800} step={25} value={solarWatts}
            onChange={(e) => setSolarWatts(Number(e.target.value))}
            className="w-20 bg-muted border border-border rounded-lg px-2 py-1.5 text-sm font-mono text-center" />
        </div>
        {solarWatts > 0 && (
          <p className="text-xs text-muted-foreground">
            {solarWatts}W x {peakSunHours}h PSH x 80% = <span className="font-bold text-primary">{solarAhPerDay.toFixed(1)} Ah/day</span>
          </p>
        )}
      </div>

      {/* Shore power */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Shore Power Charger (Amps, optional)</label>
        <input type="number" min={0} max={50} step={5} value={shoreChargerAmps}
          onChange={(e) => setShoreChargerAmps(Number(e.target.value))}
          className="w-24 bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono" />
        {shoreChargerAmps > 0 && (
          <p className="text-xs text-muted-foreground">{shoreChargerAmps}A x 8h = {(shoreChargerAmps * 8).toFixed(0)} Ah/day (assumed 8h plugged in)</p>
        )}
      </div>

      {/* Total charge summary */}
      <div className="bg-primary/5 border border-primary/30 rounded-lg p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">Daily Charge Budget</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase">Alternator</p>
            <p className="text-lg font-extrabold">{altAhPerDay.toFixed(1)} <span className="text-xs text-muted-foreground">Ah</span></p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase">Solar</p>
            <p className="text-lg font-extrabold">{solarAhPerDay.toFixed(1)} <span className="text-xs text-muted-foreground">Ah</span></p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase">Total</p>
            <p className="text-lg font-extrabold text-primary">
              {(altAhPerDay + solarAhPerDay + (shoreChargerAmps * 8)).toFixed(1)} <span className="text-xs text-muted-foreground">Ah</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Step 5: Wire Runs ──────────────────────────────────────────

  const previewCircuits = useMemo(() => {
    if (!result) return [];
    return result.circuits;
  }, [result]);

  const renderStep5 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-extrabold mb-1">Wire Runs</h3>
        <p className="text-sm text-muted-foreground">Enter the one-way distance (in feet) for each wire run. The calculator auto-sizes wire gauge and fuses.</p>
      </div>

      {previewCircuits.length === 0 && (
        <p className="text-sm text-muted-foreground">Add loads and configure charging to see circuits.</p>
      )}

      {/* Circuit table */}
      <div className="space-y-2 overflow-x-auto">
        {previewCircuits.map((circuit) => (
          <div key={circuit.id} className={`bg-card border rounded-lg p-3 ${
            circuit.status === "fail" ? "border-red-500/50" : circuit.status === "warn" ? "border-amber-500/30" : "border-border"
          }`}>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-sm font-bold flex-1 min-w-[200px]">{circuit.label}</span>
              <div className="flex items-center gap-2">
                <label className="text-[9px] font-bold uppercase text-muted-foreground">Distance (ft)</label>
                <input type="number" min={1} max={100} step={1}
                  value={circuitDistances[circuit.id] ?? circuit.distanceFt}
                  onChange={(e) => updateCircuitDistance(circuit.id, Number(e.target.value))}
                  className="w-16 bg-muted border border-border rounded px-2 py-1 text-sm font-mono text-center" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="text-muted-foreground">{circuit.maxAmps}A max</span>
              <span className={`font-bold ${circuit.status === "fail" ? "text-red-500" : circuit.status === "warn" ? "text-amber-500" : "text-emerald-500"}`}>
                {circuit.recommendedAwg} AWG
              </span>
              <span className={circuit.actualDropPct > 3 ? "text-amber-500" : "text-muted-foreground"}>
                {circuit.actualDropVolts.toFixed(3)}V drop ({circuit.actualDropPct.toFixed(1)}%)
              </span>
              <span className="text-muted-foreground">{circuit.fuseAmps}A {circuit.fuseType} fuse</span>
              {circuit.note && (
                <span className="text-red-500 font-bold">{circuit.note}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Results Dashboard ──────────────────────────────────────────

  const renderResults = () => {
    if (!result) return null;

    const budgetSegments = [
      { label: "Alternator", value: result.budget.alternatorAhPerDay, color: "#3B82F6" },
      { label: "Solar", value: result.budget.solarAhPerDay, color: "#EAB308" },
      { label: "Shore", value: result.budget.shoreAhPerDay, color: "#8B5CF6" },
    ];

    return (
      <div className="space-y-8 animate-fade-in-up">
        <h2 className="text-2xl font-extrabold">System Report</h2>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-2">
            {result.warnings.map((w, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-lg p-3 border ${
                w.level === "critical" ? "bg-red-500/10 border-red-500/30" :
                w.level === "warning" ? "bg-amber-500/10 border-amber-500/30" :
                "bg-blue-500/10 border-blue-500/30"
              }`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  w.level === "critical" ? "text-red-500" :
                  w.level === "warning" ? "text-amber-500" :
                  "text-blue-500"
                }`} />
                <p className={`text-xs ${
                  w.level === "critical" ? "text-red-400" :
                  w.level === "warning" ? "text-amber-400" :
                  "text-blue-400"
                }`}>{w.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Power Budget */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-extrabold mb-4">Power Budget</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <DonutChart
              segments={budgetSegments}
              totalLabel="charge/day"
              totalValue={`${result.budget.totalChargeAhPerDay.toFixed(0)} Ah`}
              size={180}
              overCapacity={result.budget.surplusAh < 0}
            />
            <div className="flex-1 space-y-3">
              <ChartLegend segments={budgetSegments} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Daily Consumption</p>
                  <p className="text-lg font-extrabold">{result.budget.totalDailyAh.toFixed(1)} Ah</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${result.budget.surplusAh >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">{result.budget.surplusAh >= 0 ? "Surplus" : "Deficit"}</p>
                  <p className={`text-lg font-extrabold ${result.budget.surplusAh >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {Math.abs(result.budget.surplusAh).toFixed(1)} Ah
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Autonomy</p>
                  <p className="text-lg font-extrabold">{result.budget.daysAutonomy.toFixed(1)} days</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Autonomy (Cold)</p>
                  <p className="text-lg font-extrabold">{result.budget.daysAutonomyColdDerated.toFixed(1)} days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battery Assessment */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-extrabold mb-3">Battery Assessment</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Your Bank</p>
              <p className="text-2xl font-extrabold">{result.batteryBank.totalCapacityAh}Ah</p>
            </div>
            <span className="text-muted text-xl">vs</span>
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Recommended</p>
              <p className="text-2xl font-extrabold text-primary">{result.recommendedBankAh}Ah</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">{result.bankAssessment}</p>
        </div>

        {/* Wire Schedule */}
        <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
          <h3 className="text-lg font-extrabold mb-4">Wire Gauge Schedule</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[9px] font-bold uppercase text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-3">Circuit</th>
                <th className="text-center px-2">Dist</th>
                <th className="text-center px-2">Amps</th>
                <th className="text-center px-2">AWG</th>
                <th className="text-center px-2">V Drop</th>
                <th className="text-center px-2">Drop %</th>
                <th className="text-center px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.circuits.map((c) => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-2 pr-3 font-bold">{c.label}</td>
                  <td className="text-center px-2">{c.distanceFt}ft</td>
                  <td className="text-center px-2">{c.maxAmps}A</td>
                  <td className="text-center px-2 font-bold">{c.recommendedAwg}</td>
                  <td className="text-center px-2 font-mono">{c.actualDropVolts.toFixed(3)}V</td>
                  <td className={`text-center px-2 font-bold ${
                    c.actualDropPct <= 3 ? "text-emerald-500" : c.actualDropPct <= 5 ? "text-amber-500" : "text-red-500"
                  }`}>{c.actualDropPct.toFixed(1)}%</td>
                  <td className="text-center px-2">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      c.status === "pass" ? "bg-emerald-500/10 text-emerald-500" :
                      c.status === "warn" ? "bg-amber-500/10 text-amber-500" :
                      "bg-red-500/10 text-red-500"
                    }`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fuse Schedule */}
        <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
          <h3 className="text-lg font-extrabold mb-4">Fuse Schedule</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[9px] font-bold uppercase text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-3">Circuit</th>
                <th className="text-center px-2">Load Amps</th>
                <th className="text-center px-2">Fuse Rating</th>
                <th className="text-center px-2">Fuse Type</th>
                <th className="text-left px-2">Placement</th>
              </tr>
            </thead>
            <tbody>
              {result.circuits.filter((c) => c.fuseAmps > 0).map((c) => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-2 pr-3 font-bold">{c.label}</td>
                  <td className="text-center px-2">{c.maxAmps}A</td>
                  <td className="text-center px-2 font-bold text-primary">{c.fuseAmps}A</td>
                  <td className="text-center px-2 uppercase">{c.fuseType}</td>
                  <td className="text-left px-2 text-muted-foreground">Within 18&quot; of positive source</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Wiring Diagram */}
        <PowerSystemDiagram
          circuits={result.circuits}
          hasSolar={solarWatts > 0}
          totalBankAh={result.batteryBank.totalCapacityAh}
        />

        {/* Shopping List */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-extrabold">Shopping List</h3>
          </div>
          {(() => {
            const groups = new Map<string, typeof result.shoppingList>();
            for (const item of result.shoppingList) {
              const list = groups.get(item.category) ?? [];
              list.push(item);
              groups.set(item.category, list);
            }
            return Array.from(groups).map(([cat, items]) => (
              <div key={cat} className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">{cat}</h4>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold">{item.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{item.spec}</span>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent("pe_affiliate_click", { tool: "power-system-builder", product: item.name, url: item.url! })}
                        className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded hover:bg-primary/20 transition-colors"
                      >
                        View on Amazon
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ));
          })()}
          <p className="text-[10px] text-muted/50 mt-3">
            Affiliate links help support our free tools at no extra cost to you.
          </p>
        </div>

        {/* Safety Checklist */}
        <div className="bg-red-500/5 border-2 border-red-500/40 rounded-lg p-6">
          <h3 className="text-lg font-extrabold text-red-500 mb-4">Safety Checklist</h3>
          <div className="space-y-2">
            {result.safetyChecklist.map((item) => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                <button
                  onClick={() => setCheckedItems((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    return next;
                  })}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    checkedItems.has(item.id) ? "bg-emerald-500 border-emerald-500" : item.critical ? "border-red-500" : "border-border"
                  }`}
                >
                  {checkedItems.has(item.id) && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className={`text-sm ${checkedItems.has(item.id) ? "text-muted line-through" : item.critical ? "text-red-400 font-bold" : "text-foreground"}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Safety disclaimer again at bottom */}
        <ToolSafetyDisclaimer level="safety-critical" message={ELECTRICAL_SAFETY_MESSAGE} />

        {/* Share + Footer */}
        <ToolSocialShare toolName="Power System Builder" url="https://prepperevolution.com/tools/power-system-builder" />
      </div>
    );
  };

  // ─── Main Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Safety disclaimer at top */}
      <ToolSafetyDisclaimer level="safety-critical" message={ELECTRICAL_SAFETY_MESSAGE} />

      {/* Step indicator */}
      {!showResults && (
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isPast = step > s.id;
            return (
              <button key={s.id} onClick={() => setStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  isActive ? "bg-primary text-background" :
                  isPast ? "bg-primary/10 text-primary" :
                  "text-muted-foreground"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Step content */}
      {!showResults && (
        <div className="bg-card border border-border rounded-lg p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>
      )}

      {/* Navigation */}
      {!showResults && (
        <div className="flex items-center justify-between">
          <button onClick={prevStep} disabled={step === 1}
            className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-muted-foreground disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < 5 ? (
            <button onClick={nextStep}
              className="flex items-center gap-1 px-6 py-2.5 bg-primary text-background text-sm font-bold rounded-lg">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleGenerate} disabled={loads.length === 0}
              className="flex items-center gap-1 px-6 py-2.5 bg-primary text-background text-sm font-bold rounded-lg disabled:opacity-50">
              <Wrench className="w-4 h-4" /> Generate Report
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {showResults && renderResults()}

      {showResults && (
        <button onClick={() => setShowResults(false)}
          className="flex items-center gap-1 text-sm text-primary font-bold hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Editor
        </button>
      )}

      {/* How This Tool Works */}
      <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-extrabold mb-3">How This Tool Works</h3>
        <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-3">
          <p>
            Map out your full off-grid power setup step by step &mdash; pick your devices, set your location, and we&apos;ll spec the panels, batteries, charge controller, and inverter you actually need. The wiring diagram updates live as you build so you can see exactly how everything connects before you buy a single component.
          </p>
          <p>
            <strong className="text-foreground">Bottom line:</strong> wiring a power system wrong is expensive at best and dangerous at worst. This builder walks you through the entire chain from panel to plug so nothing gets missed and nothing gets fried.
          </p>
        </div>
      </div>

      {/* Data Privacy + Support */}
      <DataPrivacyNotice />
      <SupportFooter />
    </div>
  );
}
