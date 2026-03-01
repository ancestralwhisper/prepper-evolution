
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Truck, ChevronDown, ChevronRight, Weight, Fuel, Gauge, Shield,
  AlertTriangle, ArrowUp, ArrowDown, Mountain, Disc3, Wrench,
  Zap, Waves, Radio, Box, CircleDot, Settings, TriangleAlert,
  Check, X, TentTree, Wind, Battery, Compass, Package,
  Save, RotateCcw, Info,
} from "lucide-react";
import {
  getUniqueMakes, getModelsForMake, getTrimsForModel, findVehicle,
} from "./vehicle-db";
import type {
  VehicleProfile, VehicleComputed, StockVehicle,
  EngineType, Drivetrain, TransferCase, TireType,
} from "./vehicle-types";
import { VEHICLE_PROFILE_KEY } from "./vehicle-types";
import { computeVehicle } from "./vehicle-compute";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import { useSEO } from "@/hooks/useSEO";

// ─── SVG Gauge Component ─────────────────────────────────────────────

function GaugeArc({
  value, max, label, unit, color, size = 120, warningThreshold, dangerThreshold,
}: {
  value: number; max: number; label: string; unit?: string;
  color: string; size?: number; warningThreshold?: number; dangerThreshold?: number;
}) {
  const pct = Math.min(1, Math.max(0, value / max));
  const radius = (size - 16) / 2;
  const center = size / 2;
  // Arc from -135deg to +135deg (270deg sweep)
  const startAngle = -135;
  const sweepAngle = 270;
  const endAngle = startAngle + sweepAngle * pct;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcX = (deg: number) => center + radius * Math.cos(toRad(deg));
  const arcY = (deg: number) => center + radius * Math.sin(toRad(deg));

  const bgStart = { x: arcX(startAngle), y: arcY(startAngle) };
  const bgEnd = { x: arcX(startAngle + sweepAngle), y: arcY(startAngle + sweepAngle) };
  const valEnd = { x: arcX(endAngle), y: arcY(endAngle) };

  const bgLargeArc = sweepAngle > 180 ? 1 : 0;
  const valSweep = sweepAngle * pct;
  const valLargeArc = valSweep > 180 ? 1 : 0;

  let fillColor = color;
  if (dangerThreshold !== undefined && value >= dangerThreshold) fillColor = "#EF4444";
  else if (warningThreshold !== undefined && value >= warningThreshold) fillColor = "#EAB308";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.85}`}>
        {/* Background arc */}
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${bgLargeArc} 1 ${bgEnd.x} ${bgEnd.y}`}
          fill="none" stroke="hsl(var(--border))" strokeWidth={8} strokeLinecap="round" opacity={0.3}
        />
        {/* Value arc */}
        {pct > 0.005 && (
          <path
            d={`M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${valLargeArc} 1 ${valEnd.x} ${valEnd.y}`}
            fill="none" stroke={fillColor} strokeWidth={8} strokeLinecap="round"
            className="transition-all duration-700"
          />
        )}
        {/* Center value */}
        <text x={center} y={center + 2} textAnchor="middle" className="fill-foreground text-lg font-extrabold" style={{ fontSize: size * 0.18 }}>
          {typeof value === "number" ? (value % 1 === 0 ? value : value.toFixed(1)) : value}
        </text>
        {unit && (
          <text x={center} y={center + size * 0.15} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: size * 0.1 }}>
            {unit}
          </text>
        )}
      </svg>
      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

// ─── Mini Progress Bar ───────────────────────────────────────────────

function ProgressBar({ value, max, color, label, showValue }: {
  value: number; max: number; color: string; label: string; showValue?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-xs font-bold text-foreground">{showValue || `${Math.round(value)}`}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Score Badge ─────────────────────────────────────────────────────

function ScoreBadge({ score, label, size = "md" }: { score: number; label: string; size?: "sm" | "md" }) {
  let color = "#EF4444"; // red
  if (score >= 80) color = "#10B981"; // green
  else if (score >= 60) color = "#3B82F6"; // blue
  else if (score >= 40) color = "#EAB308"; // yellow
  else if (score >= 20) color = "#F97316"; // orange

  const sz = size === "sm" ? "w-12 h-12" : "w-16 h-16";
  const textSz = size === "sm" ? "text-base" : "text-xl";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sz} rounded-full border-4 flex items-center justify-center`} style={{ borderColor: color }}>
        <span className={`${textSz} font-extrabold`} style={{ color }}>{score}</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground text-center">{label}</span>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, unit, accent, warning }: {
  icon: React.ElementType; label: string; value: string | number; unit?: string;
  accent?: boolean; warning?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-lg p-3 ${warning ? "border-red-500/50" : "border-border"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${accent ? "text-primary" : warning ? "text-red-500" : "text-muted-foreground"}`} />
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-lg font-extrabold ${warning ? "text-red-500" : accent ? "text-primary" : ""}`}>{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

// ─── Collapsible Section ─────────────────────────────────────────────

function Section({
  title, icon: Icon, children, open, onToggle, iconColor,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  open: boolean; onToggle: () => void; iconColor?: string;
}) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 py-4 text-left hover:text-primary transition-colors"
      >
        <Icon className={`w-4 h-4 ${iconColor || "text-primary"}`} />
        <span className="text-sm font-extrabold flex-1">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="pb-4 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Input Helpers ───────────────────────────────────────────────────

function NumberInput({
  label, value, onChange, min, max, step, unit, hint,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
        {label} {unit && <span className="normal-case font-normal">({unit})</span>}
      </label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min} max={max} step={step || 1}
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none transition-colors"
      />
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

function SelectInput<T extends string>({
  label, value, onChange, options, hint,
}: {
  label: string; value: T; onChange: (v: T) => void;
  options: { value: T; label: string }[]; hint?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

function Toggle({
  label, checked, onChange, hint,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`w-9 h-5 rounded-full flex items-center transition-colors mt-0.5 flex-shrink-0 ${
          checked ? "bg-primary" : "bg-muted border border-border"
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
          style={{ transform: checked ? "translateX(17px)" : "translateX(2px)" }}
        />
      </div>
      <div>
        <span className="text-sm font-bold group-hover:text-primary transition-colors">{label}</span>
        {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      </div>
    </label>
  );
}

// ─── Default Profile Factory ─────────────────────────────────────────

function createDefaultProfile(): VehicleProfile {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
    nickname: "",
    year: 0, make: "", model: "", trim: "",
    curbWeightLbs: 0, gvwrLbs: 0, maxTowingLbs: 0,
    wheelbaseIn: 0, trackWidthIn: 0, groundClearanceIn: 0,
    approachAngle: 0, departureAngle: 0, breakoverAngle: 0,
    fuelTankGal: 0, stockTireSize: "", stockTireDiameter: 0,
    mpgCity: 0, mpgHighway: 0, mpgCombined: 0,
    engineType: "gas", drivetrain: "4wd", transferCase: "part-time",
    ssf: 1.1, cgHeightIn: 0, frontWeightPct: 55,
    lift: { inches: 0, type: "spacer" },
    tires: { size: "", diameter: 0, type: "all-terrain", pressurePsi: 35, recommendedPsi: 35, ageMonths: 0 },
    frontBumper: { type: "stock", weightLbs: 45, hasWinchMount: false },
    rearBumper: { type: "stock", weightLbs: 40, hasWinchMount: false },
    winch: { installed: false, pullRatingLbs: 10000, weightLbs: 75, type: "electric" },
    roof: { rack: false, rackWeightLbs: 0, cargoWeightLbs: 0, rtt: false, rttWeightLbs: 0, awning: false, awningWeightLbs: 0 },
    armor: { rockSliders: false, sliderWeightLbs: 0, skidPlates: false, skidPlateWeightLbs: 0 },
    fuel: { stockTankGal: 0, auxTankGal: 0, auxTankType: "none", extraCansGal: 0 },
    electrical: {
      dualBattery: false, dualBatteryWeightLbs: 50, alternatorAmps: 0,
      onboardAir: false, onboardAirWeightLbs: 15, fridgeWatts: 0,
      lightBarWatts: 0, radioType: "none", radioWeightLbs: 0,
    },
    trailer: { hasTrailer: false, trailerWeightLbs: 0, tongueWeightLbs: 0, trailerType: "none" },
    drivetrainMods: {
      regeared: false, newRatio: 4.88, stockRatio: 3.73,
      frontLocker: false, rearLocker: false, lockerType: "none",
    },
    recovery: {
      kinetic: false, straps: false, shackles: false, treeProtector: false,
      snatchBlock: false, highlift: false, tractionBoards: false,
      tirePlug: false, compressor: false, spareTire: false,
      spareTireFullSize: false, shovel: false,
    },
    waterFording: { snorkel: false, stockWadingDepthIn: 0, modifiedWadingDepthIn: 0, diffBreathers: false },
    otherModsWeightLbs: 0, otherModsNotes: "",
    testedMpg: null, odometerMiles: 0,
    createdAt: Date.now(), updatedAt: Date.now(),
  };
}

function applyStockVehicle(stock: StockVehicle, profile: VehicleProfile): VehicleProfile {
  const cgHeight = stock.trackWidthIn / (2 * stock.ssf);
  return {
    ...profile,
    year: stock.year,
    make: stock.make,
    model: stock.model,
    trim: stock.trim,
    curbWeightLbs: stock.curbWeightLbs,
    gvwrLbs: stock.gvwrLbs,
    maxTowingLbs: stock.maxTowingLbs,
    wheelbaseIn: stock.wheelbaseIn,
    trackWidthIn: stock.trackWidthIn,
    groundClearanceIn: stock.groundClearanceIn,
    approachAngle: stock.approachAngle,
    departureAngle: stock.departureAngle,
    breakoverAngle: stock.breakoverAngle,
    fuelTankGal: stock.fuelTankGal,
    stockTireSize: stock.stockTireSize,
    stockTireDiameter: stock.stockTireDiameter,
    mpgCity: stock.mpgCity,
    mpgHighway: stock.mpgHighway,
    mpgCombined: stock.mpgCombined,
    engineType: stock.engineType,
    drivetrain: stock.drivetrain,
    transferCase: stock.transferCase,
    ssf: stock.ssf,
    cgHeightIn: Math.round(cgHeight * 10) / 10,
    frontWeightPct: stock.frontWeightPct,
    tires: {
      ...profile.tires,
      size: stock.stockTireSize,
      diameter: stock.stockTireDiameter,
    },
    fuel: { ...profile.fuel, stockTankGal: stock.fuelTankGal },
    waterFording: { ...profile.waterFording, stockWadingDepthIn: stock.stockWadingDepthIn },
    drivetrainMods: { ...profile.drivetrainMods, stockRatio: stock.stockRatio },
    electrical: { ...profile.electrical, alternatorAmps: stock.alternatorAmps },
    updatedAt: Date.now(),
  };
}

// ─── DonutChart (inline for weight breakdown) ────────────────────────

function WeightDonut({ segments, totalLbs }: { segments: { label: string; value: number; color: string }[]; totalLbs: number }) {
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = totalLbs > 0 ? seg.value / totalLbs : 0;
    const dashArray = `${circumference * pct} ${circumference * (1 - pct)}`;
    const dashOffset = -offset * circumference;
    offset += pct;
    return { ...seg, dashArray, dashOffset };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} opacity={0.2} />
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={center} cy={center} r={radius}
            fill="none" stroke={arc.color} strokeWidth={strokeWidth}
            strokeDasharray={arc.dashArray} strokeDashoffset={arc.dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-500"
          />
        ))}
        <text x={center} y={center - 6} textAnchor="middle" className="fill-foreground font-extrabold" style={{ fontSize: 22 }}>
          {totalLbs.toLocaleString()}
        </text>
        <text x={center} y={center + 12} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>
          lbs added
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full max-w-xs">
        {arcs.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] text-muted-foreground truncate">{seg.label}</span>
            <span className="text-[10px] font-bold text-foreground ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MPG Penalty Breakdown ───────────────────────────────────────────

function MpgBreakdownChart({ items }: { items: { label: string; penalty: number }[] }) {
  const maxPenalty = Math.max(...items.map((i) => Math.abs(i.penalty)), 1);
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="space-y-0.5">
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
            <span className={`text-[10px] font-bold ${item.penalty <= 0 ? "text-green-500" : "text-red-500"}`}>
              {item.penalty > 0 ? `-${item.penalty}%` : `+${Math.abs(item.penalty)}%`}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (Math.abs(item.penalty) / maxPenalty) * 100)}%`,
                backgroundColor: item.penalty <= 0 ? "#10B981" : "#EF4444",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

function VehicleProfileEditor() {

  const [profile, setProfile] = useState<VehicleProfile>(createDefaultProfile);
  const [initialized, setInitialized] = useState(false);

  // Vehicle selection state
  const [selMake, setSelMake] = useState("");
  const [selModel, setSelModel] = useState("");
  const [selTrim, setSelTrim] = useState("");
  const [manualEntry, setManualEntry] = useState(false);

  // Open sections
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["suspension", "tires"]));

  // Toast
  const [showSaved, setShowSaved] = useState(false);

  // ─── Computed values ────────────────────────────────────────────
  const computed = useMemo<VehicleComputed>(() => computeVehicle(profile), [profile]);

  // ─── Data from vehicle-db ───────────────────────────────────────
  const makes = useMemo(() => getUniqueMakes(), []);
  const models = useMemo(() => (selMake ? getModelsForMake(selMake) : []), [selMake]);
  const trims = useMemo(() => (selMake && selModel ? getTrimsForModel(selMake, selModel) : []), [selMake, selModel]);

  // ─── Load from localStorage ─────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VEHICLE_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as VehicleProfile;
        setProfile(parsed);
        if (parsed.make) {
          setSelMake(parsed.make);
          setSelModel(parsed.model);
          setSelTrim(`${parsed.year} ${parsed.trim}`);
        }
        if (!parsed.make && parsed.curbWeightLbs > 0) {
          setManualEntry(true);
        }
      }
    } catch { /* ignore */ }
    setInitialized(true);
  }, []);

  // ─── Auto-save to localStorage ──────────────────────────────────
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(VEHICLE_PROFILE_KEY, JSON.stringify(profile));
  }, [profile, initialized]);

  // ─── Update helper ──────────────────────────────────────────────
  const update = useCallback(<K extends keyof VehicleProfile>(key: K, value: VehicleProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value, updatedAt: Date.now() }));
  }, []);

  const updateNested = useCallback(<K extends keyof VehicleProfile>(
    key: K, partial: Partial<VehicleProfile[K]>,
  ) => {
    setProfile((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as unknown as Record<string, unknown>), ...(partial as unknown as Record<string, unknown>) },
      updatedAt: Date.now(),
    }));
  }, []);

  // ─── Vehicle selection handlers ─────────────────────────────────
  const handleMakeChange = (make: string) => {
    setSelMake(make);
    setSelModel("");
    setSelTrim("");
  };

  const handleModelChange = (model: string) => {
    setSelModel(model);
    setSelTrim("");
  };

  const handleTrimChange = (yearTrim: string) => {
    setSelTrim(yearTrim);
    if (!yearTrim) return;
    const stock = findVehicle(selMake, selModel, yearTrim);
    if (stock) {
      setProfile((prev) => applyStockVehicle(stock, prev));
    }
  };

  // ─── Section toggle ─────────────────────────────────────────────
  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Reset ──────────────────────────────────────────────────────
  const handleReset = () => {
    if (!confirm("Reset entire vehicle profile? This clears all modifications.")) return;
    const fresh = createDefaultProfile();
    setProfile(fresh);
    setSelMake("");
    setSelModel("");
    setSelTrim("");
    setManualEntry(false);
    localStorage.removeItem(VEHICLE_PROFILE_KEY);
  };

  // ─── Vehicle has been selected? ─────────────────────────────────
  const hasVehicle = profile.curbWeightLbs > 0;

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8">

      {/* ─── VEHICLE SELECTION ─────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold">Select Your Vehicle</h2>
            <p className="text-[10px] text-muted-foreground">Choose from our database or enter specs manually</p>
          </div>
        </div>

        {/* Nickname */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Vehicle Nickname</label>
          <input
            type="text"
            value={profile.nickname}
            onChange={(e) => update("nickname", e.target.value)}
            placeholder='e.g. "The War Wagon" or "Daily Runner"'
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none transition-colors"
          />
        </div>

        {!manualEntry ? (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-3">
              {/* Make */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Make</label>
                <select
                  value={selMake}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none"
                >
                  <option value="">Select Make</option>
                  {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {/* Model */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                <select
                  value={selModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!selMake}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none disabled:opacity-40"
                >
                  <option value="">Select Model</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {/* Trim / Year */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Year / Trim</label>
                <select
                  value={selTrim}
                  onChange={(e) => handleTrimChange(e.target.value)}
                  disabled={!selModel}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none disabled:opacity-40"
                >
                  <option value="">Select Trim</option>
                  {trims.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={() => setManualEntry(true)}
              className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide"
            >
              Vehicle not listed? Enter specs manually
            </button>
          </>
        ) : (
          <>
            <div className="grid sm:grid-cols-4 gap-4 mb-4">
              <NumberInput label="Year" value={profile.year} onChange={(v) => update("year", v)} min={1960} max={2030} />
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Make</label>
                <input type="text" value={profile.make} onChange={(e) => update("make", e.target.value)} placeholder="Toyota"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                <input type="text" value={profile.model} onChange={(e) => update("model", e.target.value)} placeholder="4Runner"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Trim</label>
                <input type="text" value={profile.trim} onChange={(e) => update("trim", e.target.value)} placeholder="TRD Off-Road"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none" />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <NumberInput label="Curb Weight" value={profile.curbWeightLbs} onChange={(v) => update("curbWeightLbs", v)} unit="lbs" />
              <NumberInput label="GVWR" value={profile.gvwrLbs} onChange={(v) => update("gvwrLbs", v)} unit="lbs" hint="Gross Vehicle Weight Rating" />
              <NumberInput label="Max Towing" value={profile.maxTowingLbs} onChange={(v) => update("maxTowingLbs", v)} unit="lbs" />
              <NumberInput label="Wheelbase" value={profile.wheelbaseIn} onChange={(v) => update("wheelbaseIn", v)} unit="in" />
              <NumberInput label="Track Width" value={profile.trackWidthIn} onChange={(v) => update("trackWidthIn", v)} unit="in" hint="Front track" />
              <NumberInput label="Ground Clearance" value={profile.groundClearanceIn} onChange={(v) => update("groundClearanceIn", v)} unit="in" />
              <NumberInput label="Approach Angle" value={profile.approachAngle} onChange={(v) => update("approachAngle", v)} unit="deg" />
              <NumberInput label="Departure Angle" value={profile.departureAngle} onChange={(v) => update("departureAngle", v)} unit="deg" />
              <NumberInput label="Breakover Angle" value={profile.breakoverAngle} onChange={(v) => update("breakoverAngle", v)} unit="deg" />
              <NumberInput label="Fuel Tank" value={profile.fuelTankGal} onChange={(v) => update("fuelTankGal", v)} unit="gal" />
              <NumberInput label="MPG Combined" value={profile.mpgCombined} onChange={(v) => update("mpgCombined", v)} />
              <NumberInput label="SSF" value={profile.ssf} onChange={(v) => update("ssf", v)} step={0.01} hint="NHTSA Static Stability Factor" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <SelectInput label="Engine" value={profile.engineType} onChange={(v) => update("engineType", v as EngineType)}
                options={[
                  { value: "gas", label: "Gasoline" }, { value: "diesel", label: "Diesel" },
                  { value: "hybrid", label: "Hybrid" }, { value: "ev", label: "Electric" },
                ]} />
              <SelectInput label="Drivetrain" value={profile.drivetrain} onChange={(v) => update("drivetrain", v as Drivetrain)}
                options={[
                  { value: "4wd", label: "4WD" }, { value: "awd", label: "AWD" },
                  { value: "2wd-rwd", label: "2WD (RWD)" }, { value: "2wd-fwd", label: "2WD (FWD)" },
                ]} />
              <SelectInput label="Transfer Case" value={profile.transferCase} onChange={(v) => update("transferCase", v as TransferCase)}
                options={[
                  { value: "part-time", label: "Part-Time" }, { value: "full-time", label: "Full-Time" },
                  { value: "selectable", label: "Selectable" }, { value: "none", label: "None" },
                ]} />
            </div>
            <button
              onClick={() => setManualEntry(false)}
              className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide"
            >
              Switch to database selection
            </button>
          </>
        )}

        {/* Stock specs summary (when vehicle is selected) */}
        {hasVehicle && !manualEntry && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Stock Specs (auto-filled)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
              <div><span className="text-muted-foreground">Curb Weight:</span> <span className="font-bold">{profile.curbWeightLbs.toLocaleString()} lbs</span></div>
              <div><span className="text-muted-foreground">GVWR:</span> <span className="font-bold">{profile.gvwrLbs.toLocaleString()} lbs</span></div>
              <div><span className="text-muted-foreground">Max Tow:</span> <span className="font-bold">{profile.maxTowingLbs.toLocaleString()} lbs</span></div>
              <div><span className="text-muted-foreground">Wheelbase:</span> <span className="font-bold">{profile.wheelbaseIn}"</span></div>
              <div><span className="text-muted-foreground">Clearance:</span> <span className="font-bold">{profile.groundClearanceIn}"</span></div>
              <div><span className="text-muted-foreground">Approach:</span> <span className="font-bold">{profile.approachAngle}°</span></div>
              <div><span className="text-muted-foreground">Departure:</span> <span className="font-bold">{profile.departureAngle}°</span></div>
              <div><span className="text-muted-foreground">Breakover:</span> <span className="font-bold">{profile.breakoverAngle}°</span></div>
              <div><span className="text-muted-foreground">Fuel Tank:</span> <span className="font-bold">{profile.fuelTankGal} gal</span></div>
              <div><span className="text-muted-foreground">Stock Tires:</span> <span className="font-bold">{profile.stockTireSize}</span></div>
              <div><span className="text-muted-foreground">MPG:</span> <span className="font-bold">{profile.mpgCombined}</span></div>
              <div><span className="text-muted-foreground">SSF:</span> <span className="font-bold">{profile.ssf}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Only show mods + dashboard if vehicle is selected */}
      {hasVehicle && (
        <>
          {/* ─── MODIFICATIONS ─────────────────────────────────── */}
          <div className="bg-card border border-border rounded-lg px-6">

            {/* Suspension / Lift */}
            <Section title="Suspension & Lift" icon={ArrowUp} open={openSections.has("suspension")} onToggle={() => toggleSection("suspension")}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <NumberInput label="Lift Height" value={profile.lift.inches} onChange={(v) => updateNested("lift", { inches: v })} unit="inches" min={0} max={12} step={0.5} />
                <SelectInput label="Lift Type" value={profile.lift.type} onChange={(v) => updateNested("lift", { type: v })}
                  options={[
                    { value: "spacer", label: "Spacer Lift" }, { value: "coilover", label: "Coilover" },
                    { value: "long-arm", label: "Long-Arm" }, { value: "body-lift", label: "Body Lift" },
                  ]} />
              </div>
            </Section>

            {/* Tires */}
            <Section title="Tires" icon={Disc3} open={openSections.has("tires")} onToggle={() => toggleSection("tires")}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Tire Size</label>
                  <input type="text" value={profile.tires.size} onChange={(e) => updateNested("tires", { size: e.target.value })}
                    placeholder="285/70R17" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none" />
                </div>
                <NumberInput label="Total Diameter" value={profile.tires.diameter} onChange={(v) => updateNested("tires", { diameter: v })} unit="inches" step={0.1} hint={`Stock: ${profile.stockTireDiameter}"`} />
                <SelectInput label="Tire Type" value={profile.tires.type} onChange={(v) => updateNested("tires", { type: v as TireType })}
                  options={[
                    { value: "highway", label: "Highway (H/T)" }, { value: "all-terrain", label: "All-Terrain (A/T)" },
                    { value: "mud-terrain", label: "Mud-Terrain (M/T)" }, { value: "hybrid", label: "Hybrid (A/T + M/T)" },
                  ]} />
                <NumberInput label="Current Pressure" value={profile.tires.pressurePsi} onChange={(v) => updateNested("tires", { pressurePsi: v })} unit="PSI" />
                <NumberInput label="Recommended Pressure" value={profile.tires.recommendedPsi} onChange={(v) => updateNested("tires", { recommendedPsi: v })} unit="PSI" hint="Door sticker value" />
                <NumberInput label="Tire Age" value={profile.tires.ageMonths} onChange={(v) => updateNested("tires", { ageMonths: v })} unit="months" hint="DOT date code on sidewall" />
              </div>
            </Section>

            {/* Bumpers & Winch */}
            <Section title="Bumpers & Winch" icon={Shield} open={openSections.has("bumpers")} onToggle={() => toggleSection("bumpers")}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Front Bumper</p>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <SelectInput label="Type" value={profile.frontBumper.type} onChange={(v) => updateNested("frontBumper", { type: v })}
                  options={[
                    { value: "stock", label: "Stock" }, { value: "steel", label: "Steel" },
                    { value: "aluminum", label: "Aluminum" }, { value: "hybrid", label: "Hybrid" },
                    { value: "stubby", label: "Stubby" },
                  ]} />
                <NumberInput label="Weight" value={profile.frontBumper.weightLbs} onChange={(v) => updateNested("frontBumper", { weightLbs: v })} unit="lbs" hint="Stock ~45 lbs" />
                <div className="pt-5"><Toggle label="Has Winch Mount" checked={profile.frontBumper.hasWinchMount} onChange={(v) => updateNested("frontBumper", { hasWinchMount: v })} /></div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Rear Bumper</p>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <SelectInput label="Type" value={profile.rearBumper.type} onChange={(v) => updateNested("rearBumper", { type: v })}
                  options={[
                    { value: "stock", label: "Stock" }, { value: "steel", label: "Steel" },
                    { value: "aluminum", label: "Aluminum" }, { value: "hybrid", label: "Hybrid" },
                    { value: "stubby", label: "Stubby" },
                  ]} />
                <NumberInput label="Weight" value={profile.rearBumper.weightLbs} onChange={(v) => updateNested("rearBumper", { weightLbs: v })} unit="lbs" hint="Stock ~40 lbs" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Winch</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="pt-1"><Toggle label="Winch Installed" checked={profile.winch.installed} onChange={(v) => updateNested("winch", { installed: v })} /></div>
                {profile.winch.installed && (
                  <>
                    <NumberInput label="Pull Rating" value={profile.winch.pullRatingLbs} onChange={(v) => updateNested("winch", { pullRatingLbs: v })} unit="lbs" />
                    <NumberInput label="Winch Weight" value={profile.winch.weightLbs} onChange={(v) => updateNested("winch", { weightLbs: v })} unit="lbs" hint="Typically 60-100 lbs" />
                  </>
                )}
              </div>
            </Section>

            {/* Roof Setup */}
            <Section title="Roof Setup" icon={TentTree} open={openSections.has("roof")} onToggle={() => toggleSection("roof")}>
              <div className="space-y-4">
                <Toggle label="Roof Rack" checked={profile.roof.rack} onChange={(v) => updateNested("roof", { rack: v })} />
                {profile.roof.rack && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <NumberInput label="Rack Weight" value={profile.roof.rackWeightLbs} onChange={(v) => updateNested("roof", { rackWeightLbs: v })} unit="lbs" hint="Rack itself (30-70 lbs)" />
                    <NumberInput label="Cargo Weight" value={profile.roof.cargoWeightLbs} onChange={(v) => updateNested("roof", { cargoWeightLbs: v })} unit="lbs" hint="Gear on rack" />
                  </div>
                )}
                <Toggle label="Roof Top Tent" checked={profile.roof.rtt} onChange={(v) => updateNested("roof", { rtt: v })} />
                {profile.roof.rtt && (
                  <NumberInput label="RTT Weight" value={profile.roof.rttWeightLbs} onChange={(v) => updateNested("roof", { rttWeightLbs: v })} unit="lbs" hint="Typically 100-200 lbs" />
                )}
                <Toggle label="Awning" checked={profile.roof.awning} onChange={(v) => updateNested("roof", { awning: v })} />
                {profile.roof.awning && (
                  <NumberInput label="Awning Weight" value={profile.roof.awningWeightLbs} onChange={(v) => updateNested("roof", { awningWeightLbs: v })} unit="lbs" hint="15-40 lbs" />
                )}
              </div>
            </Section>

            {/* Armor */}
            <Section title="Armor & Protection" icon={Shield} open={openSections.has("armor")} onToggle={() => toggleSection("armor")} iconColor="text-yellow-500">
              <div className="space-y-4">
                <Toggle label="Rock Sliders" checked={profile.armor.rockSliders} onChange={(v) => updateNested("armor", { rockSliders: v })} />
                {profile.armor.rockSliders && (
                  <NumberInput label="Slider Weight (pair)" value={profile.armor.sliderWeightLbs} onChange={(v) => updateNested("armor", { sliderWeightLbs: v })} unit="lbs" hint="Typically 50-120 lbs pair" />
                )}
                <Toggle label="Skid Plates" checked={profile.armor.skidPlates} onChange={(v) => updateNested("armor", { skidPlates: v })} />
                {profile.armor.skidPlates && (
                  <NumberInput label="Skid Plate Weight" value={profile.armor.skidPlateWeightLbs} onChange={(v) => updateNested("armor", { skidPlateWeightLbs: v })} unit="lbs" hint="30-80 lbs total" />
                )}
              </div>
            </Section>

            {/* Fuel */}
            <Section title="Fuel Setup" icon={Fuel} open={openSections.has("fuel")} onToggle={() => toggleSection("fuel")}>
              <div className="grid sm:grid-cols-3 gap-4">
                <NumberInput label="Aux Tank" value={profile.fuel.auxTankGal} onChange={(v) => updateNested("fuel", { auxTankGal: v })} unit="gal" />
                {profile.fuel.auxTankGal > 0 && (
                  <SelectInput label="Aux Tank Type" value={profile.fuel.auxTankType} onChange={(v) => updateNested("fuel", { auxTankType: v })}
                    options={[
                      { value: "none", label: "None" }, { value: "bed-mounted", label: "Bed-Mounted" },
                      { value: "under-bed", label: "Under-Bed" }, { value: "replacement", label: "Replacement" },
                    ]} />
                )}
                <NumberInput label="Jerry Cans" value={profile.fuel.extraCansGal} onChange={(v) => updateNested("fuel", { extraCansGal: v })} unit="gal" hint="5 gal per can typical" />
              </div>
            </Section>

            {/* Electrical */}
            <Section title="Electrical & Comms" icon={Zap} open={openSections.has("electrical")} onToggle={() => toggleSection("electrical")}>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Toggle label="Dual Battery" checked={profile.electrical.dualBattery} onChange={(v) => updateNested("electrical", { dualBattery: v })} hint="Adds ~50 lbs" />
                  <Toggle label="Onboard Air Compressor" checked={profile.electrical.onboardAir} onChange={(v) => updateNested("electrical", { onboardAir: v })} hint="ARB, Viair, etc." />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <NumberInput label="Fridge" value={profile.electrical.fridgeWatts} onChange={(v) => updateNested("electrical", { fridgeWatts: v })} unit="watts" hint="0 = none" />
                  <NumberInput label="Light Bar" value={profile.electrical.lightBarWatts} onChange={(v) => updateNested("electrical", { lightBarWatts: v })} unit="watts" />
                  <SelectInput label="Radio" value={profile.electrical.radioType} onChange={(v) => updateNested("electrical", { radioType: v })}
                    options={[
                      { value: "none", label: "None" }, { value: "cb", label: "CB Radio" },
                      { value: "gmrs", label: "GMRS" }, { value: "ham", label: "HAM" },
                      { value: "satellite", label: "Satellite" },
                    ]} />
                </div>
              </div>
            </Section>

            {/* Drivetrain Mods */}
            <Section title="Drivetrain Mods" icon={Settings} open={openSections.has("drivetrain")} onToggle={() => toggleSection("drivetrain")}>
              <div className="space-y-4">
                <Toggle label="Regeared" checked={profile.drivetrainMods.regeared} onChange={(v) => updateNested("drivetrainMods", { regeared: v })} hint="Changed axle gear ratio" />
                {profile.drivetrainMods.regeared && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <NumberInput label="New Ratio" value={profile.drivetrainMods.newRatio} onChange={(v) => updateNested("drivetrainMods", { newRatio: v })} step={0.01} hint="e.g. 4.88, 5.13" />
                    <NumberInput label="Stock Ratio" value={profile.drivetrainMods.stockRatio} onChange={(v) => updateNested("drivetrainMods", { stockRatio: v })} step={0.01} />
                  </div>
                )}
                <div className="grid sm:grid-cols-3 gap-4">
                  <Toggle label="Rear Locker" checked={profile.drivetrainMods.rearLocker} onChange={(v) => updateNested("drivetrainMods", { rearLocker: v })} />
                  <Toggle label="Front Locker" checked={profile.drivetrainMods.frontLocker} onChange={(v) => updateNested("drivetrainMods", { frontLocker: v })} />
                  {(profile.drivetrainMods.rearLocker || profile.drivetrainMods.frontLocker) && (
                    <SelectInput label="Locker Type" value={profile.drivetrainMods.lockerType} onChange={(v) => updateNested("drivetrainMods", { lockerType: v })}
                      options={[
                        { value: "none", label: "None" }, { value: "auto", label: "Automatic" },
                        { value: "selectable", label: "Selectable" }, { value: "spool", label: "Spool" },
                      ]} />
                  )}
                </div>
              </div>
            </Section>

            {/* Recovery Gear */}
            <Section title="Recovery Gear" icon={Wrench} open={openSections.has("recovery")} onToggle={() => toggleSection("recovery")} iconColor="text-red-500">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Toggle label="Kinetic Recovery Rope" checked={profile.recovery.kinetic} onChange={(v) => updateNested("recovery", { kinetic: v })} />
                <Toggle label="Tow Straps" checked={profile.recovery.straps} onChange={(v) => updateNested("recovery", { straps: v })} />
                <Toggle label="D-Ring Shackles" checked={profile.recovery.shackles} onChange={(v) => updateNested("recovery", { shackles: v })} />
                <Toggle label="Tree Protector" checked={profile.recovery.treeProtector} onChange={(v) => updateNested("recovery", { treeProtector: v })} />
                <Toggle label="Snatch Block" checked={profile.recovery.snatchBlock} onChange={(v) => updateNested("recovery", { snatchBlock: v })} />
                <Toggle label="Hi-Lift Jack" checked={profile.recovery.highlift} onChange={(v) => updateNested("recovery", { highlift: v })} />
                <Toggle label="Traction Boards" checked={profile.recovery.tractionBoards} onChange={(v) => updateNested("recovery", { tractionBoards: v })} hint="Maxtrax, X-Bull, etc." />
                <Toggle label="Tire Plug Kit" checked={profile.recovery.tirePlug} onChange={(v) => updateNested("recovery", { tirePlug: v })} />
                <Toggle label="Portable Compressor" checked={profile.recovery.compressor} onChange={(v) => updateNested("recovery", { compressor: v })} />
                <Toggle label="Spare Tire" checked={profile.recovery.spareTire} onChange={(v) => updateNested("recovery", { spareTire: v })} />
                {profile.recovery.spareTire && (
                  <Toggle label="Full-Size Spare" checked={profile.recovery.spareTireFullSize} onChange={(v) => updateNested("recovery", { spareTireFullSize: v })} />
                )}
                <Toggle label="Shovel" checked={profile.recovery.shovel} onChange={(v) => updateNested("recovery", { shovel: v })} />
              </div>
            </Section>

            {/* Water Fording */}
            <Section title="Water Fording" icon={Waves} open={openSections.has("water")} onToggle={() => toggleSection("water")}>
              <div className="space-y-4">
                <Toggle label="Snorkel Installed" checked={profile.waterFording.snorkel} onChange={(v) => updateNested("waterFording", { snorkel: v })} />
                <Toggle label="Differential Breathers Extended" checked={profile.waterFording.diffBreathers} onChange={(v) => updateNested("waterFording", { diffBreathers: v })} />
                {(profile.waterFording.snorkel || profile.waterFording.diffBreathers) && (
                  <NumberInput label="Modified Wading Depth" value={profile.waterFording.modifiedWadingDepthIn}
                    onChange={(v) => updateNested("waterFording", { modifiedWadingDepthIn: v })} unit="inches" hint={`Stock: ${profile.waterFording.stockWadingDepthIn || "not rated"}`} />
                )}
              </div>
            </Section>

            {/* Trailer */}
            <Section title="Trailer" icon={Package} open={openSections.has("trailer")} onToggle={() => toggleSection("trailer")}>
              <div className="space-y-4">
                <Toggle label="Towing a Trailer" checked={profile.trailer.hasTrailer} onChange={(v) => updateNested("trailer", { hasTrailer: v })} />
                {profile.trailer.hasTrailer && (
                  <div className="grid sm:grid-cols-3 gap-4">
                    <SelectInput label="Trailer Type" value={profile.trailer.trailerType} onChange={(v) => updateNested("trailer", { trailerType: v })}
                      options={[
                        { value: "none", label: "None" }, { value: "utility", label: "Utility" },
                        { value: "camper", label: "Camper" }, { value: "boat", label: "Boat" },
                        { value: "flatbed", label: "Flatbed" }, { value: "enclosed", label: "Enclosed" },
                      ]} />
                    <NumberInput label="Loaded Weight" value={profile.trailer.trailerWeightLbs} onChange={(v) => updateNested("trailer", { trailerWeightLbs: v })} unit="lbs" />
                    <NumberInput label="Tongue Weight" value={profile.trailer.tongueWeightLbs} onChange={(v) => updateNested("trailer", { tongueWeightLbs: v })} unit="lbs" hint="10-15% of trailer weight" />
                  </div>
                )}
              </div>
            </Section>

            {/* Other / Misc */}
            <Section title="Other Mods & Notes" icon={Box} open={openSections.has("other")} onToggle={() => toggleSection("other")}>
              <div className="grid sm:grid-cols-2 gap-4">
                <NumberInput label="Other Mods Weight" value={profile.otherModsWeightLbs} onChange={(v) => update("otherModsWeightLbs", v)} unit="lbs" hint="Catch-all for unlisted mods" />
                <NumberInput label="Odometer" value={profile.odometerMiles} onChange={(v) => update("odometerMiles", v)} unit="miles" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={profile.otherModsNotes}
                  onChange={(e) => update("otherModsNotes", e.target.value)}
                  rows={2}
                  placeholder="Custom drawer system, bed platform, comms antenna, etc."
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none resize-none"
                />
              </div>
              <NumberInput label="Real-World Tested MPG" value={profile.testedMpg || 0}
                onChange={(v) => update("testedMpg", v > 0 ? v : null)} hint="Leave 0 to use calculated estimate" />
            </Section>
          </div>

          {/* ─── DASHBOARD ─────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Warnings */}
            {computed.warnings.length > 0 && (
              <div className="bg-danger/5 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TriangleAlert className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-extrabold text-red-500">Warnings ({computed.warnings.length})</h3>
                </div>
                <div className="space-y-2">
                  {computed.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-red-500/80 leading-relaxed flex gap-2">
                      <span className="text-red-500 font-bold flex-shrink-0">{i + 1}.</span> {w}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Score Cards Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center">
                <ScoreBadge score={computed.recoveryScore} label="Recovery" />
              </div>
              <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center">
                <ScoreBadge score={computed.trailReadinessScore} label="Trail Ready" />
              </div>
              <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center">
                <ScoreBadge score={computed.overallReadinessScore} label="Overall" />
              </div>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Weight} label="Total Loaded" value={computed.totalLoadedWeightLbs.toLocaleString()} unit="lbs" warning={computed.overloaded} />
              <StatCard icon={Weight} label="Remaining Payload" value={computed.remainingPayloadLbs.toLocaleString()} unit="lbs" warning={computed.remainingPayloadLbs < 0} />
              <StatCard icon={Fuel} label="Est. MPG" value={computed.estimatedMpg} accent />
              <StatCard icon={Compass} label="Est. Range" value={computed.estimatedRangeMiles.toLocaleString()} unit="mi" accent />
            </div>

            {/* Gauges Row */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-extrabold mb-4">Vehicle Dynamics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <GaugeArc value={computed.payloadPct} max={120} label="GVWR Used" unit="%" color="#3B82F6" warningThreshold={90} dangerThreshold={100} />
                <GaugeArc value={computed.modifiedSsf} max={1.5} label="Stability (SSF)" color="#10B981" dangerThreshold={0} />
                <GaugeArc value={computed.modifiedGroundClearanceIn} max={20} label="Ground Clearance" unit="in" color="#F59E0B" />
                <GaugeArc value={computed.rolloverThresholdDeg} max={60} label="Rollover Threshold" unit="deg" color="#8B5CF6" />
              </div>
            </div>

            {/* Geometry */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-extrabold mb-4">Off-Road Geometry</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <ProgressBar
                  value={computed.modifiedApproachAngle} max={50}
                  color="#10B981" label="Approach Angle"
                  showValue={`${computed.modifiedApproachAngle}° (stock ${profile.approachAngle}°)`}
                />
                <ProgressBar
                  value={computed.modifiedDepartureAngle} max={50}
                  color="#3B82F6" label="Departure Angle"
                  showValue={`${computed.modifiedDepartureAngle}° (stock ${profile.departureAngle}°)`}
                />
                <ProgressBar
                  value={computed.modifiedBreakoverAngle} max={35}
                  color="#F59E0B" label="Breakover Angle"
                  showValue={`${computed.modifiedBreakoverAngle}° (stock ${profile.breakoverAngle}°)`}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                <div className="text-xs">
                  <span className="text-muted-foreground">Modified CG Height: </span>
                  <span className="font-bold">{computed.modifiedCgHeightIn}" </span>
                  <span className="text-muted-foreground">(stock {profile.cgHeightIn}")</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Modified SSF: </span>
                  <span className="font-bold">{computed.modifiedSsf} </span>
                  <span className="text-muted-foreground">(stock {profile.ssf})</span>
                </div>
              </div>
            </div>

            {/* Weight Breakdown + MPG Breakdown */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weight Donut */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-extrabold mb-4">Weight Breakdown</h3>
                {computed.weightBreakdown.length > 0 ? (
                  <WeightDonut segments={computed.weightBreakdown} totalLbs={computed.totalModWeightLbs} />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No modifications added yet</p>
                )}
              </div>

              {/* MPG Penalties */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-extrabold mb-2">MPG Impact</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-extrabold text-primary">{computed.estimatedMpg}</span>
                  <span className="text-sm text-muted-foreground">MPG</span>
                  {computed.mpgPenaltyPct > 0 && (
                    <span className="text-xs text-red-500 font-bold">(-{computed.mpgPenaltyPct}% from stock {profile.mpgCombined})</span>
                  )}
                </div>
                {computed.mpgBreakdown.length > 0 ? (
                  <MpgBreakdownChart items={computed.mpgBreakdown} />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Stock configuration</p>
                )}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total Fuel Capacity:</span>
                    <span className="font-bold">{computed.totalFuelGal} gal</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Estimated Range:</span>
                    <span className="font-bold text-primary">{computed.estimatedRangeMiles.toLocaleString()} miles</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fuel & Range Visual */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-extrabold mb-4">Fuel & Range</h3>
              <div className="space-y-3">
                <ProgressBar
                  value={profile.fuel.stockTankGal}
                  max={computed.totalFuelGal || 1}
                  color="#3B82F6"
                  label="Stock Tank"
                  showValue={`${profile.fuel.stockTankGal} gal`}
                />
                {profile.fuel.auxTankGal > 0 && (
                  <ProgressBar
                    value={profile.fuel.auxTankGal}
                    max={computed.totalFuelGal || 1}
                    color="#10B981"
                    label="Aux Tank"
                    showValue={`${profile.fuel.auxTankGal} gal`}
                  />
                )}
                {profile.fuel.extraCansGal > 0 && (
                  <ProgressBar
                    value={profile.fuel.extraCansGal}
                    max={computed.totalFuelGal || 1}
                    color="#F59E0B"
                    label="Jerry Cans"
                    showValue={`${profile.fuel.extraCansGal} gal`}
                  />
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-extrabold">{computed.totalFuelGal}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Total Gallons</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-primary">{computed.estimatedMpg}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Est. MPG</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-primary">{computed.estimatedRangeMiles.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Est. Miles</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-muted border border-border rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wide hover:border-red-500/30 hover:text-red-500 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Reset Profile
              </button>
            </div>

            {/* Privacy Notice */}
            <DataPrivacyNotice />
          </div>
        </>
      )}
    </div>
  );
}

export default function VehicleProfilePage() {
  useSEO({
    title: "Unified Vehicle Profile | Ops Deck | Prepper Evolution",
    description: "Build your complete vehicle profile with real manufacturer specs. Track modifications, calculate payload, estimate MPG impact, and assess trail readiness. The foundation of the Ops Deck — free, no sign-up.",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Unified Vehicle Profile — Ops Deck",
    description: "Build your complete vehicle profile with real manufacturer specs. Track modifications, calculate payload, estimate MPG impact, and assess trail readiness.",
    url: "https://prepperevolution.com/tools/vehicle-profile",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "Prepper Evolution",
      url: "https://prepperevolution.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-3xl mb-10 animate-fade-in-up">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
              Ops Deck
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
              Unified Vehicle <span className="text-primary">Profile</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Select your vehicle, input every modification, and see the real-world impact
              on payload capacity, fuel economy, off-road geometry, stability, and trail
              readiness — all computed from verified manufacturer specs and physics-based
              multipliers. This profile feeds every tool in the Ops Deck.
            </p>
          </div>

          <div className="animate-fade-in-up-delay-1">
            <VehicleProfileEditor />
          </div>

          <div className="max-w-3xl mt-16 space-y-8 no-print">
            <section>
              <h2 className="text-2xl font-extrabold mb-4">
                Why a Unified Vehicle Profile?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Every modification you bolt onto your rig has consequences. A 3-inch lift raises
                your center of gravity. 35-inch mud-terrains cut your fuel economy. A steel bumper
                and winch add 200+ pounds to your front axle. Most people guess at the impact. This
                tool calculates it.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The Vehicle Profile is the foundation of the entire Ops Deck. Once you build your
                profile here, every other tool — Fuel &amp; Range Planner, Load Balancer, Threat
                Dashboard — reads from it automatically. Change a tire size once, and your range,
                payload, and stability numbers update across everything.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4">
                How Accurate Is This?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Every stock spec in our database comes from manufacturer spec sheets, NHTSA rollover
                test data, and EPA fuel economy ratings. Modification penalties are derived from
                published testing by Expedition Portal, Car and Driver, the National Academies, and
                real-world controlled experiments — not forum opinions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The Static Stability Factor (SSF) comes directly from NHTSA NCAP rollover ratings.
                Center of gravity height is derived mathematically: CG = track width / (2 x SSF).
                MPG penalties use a multiplicative chain model that accounts for tire type, tire
                diameter, lift height, weight, roof drag, and tire pressure — each validated against
                published data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4">
                What Vehicles Are Supported?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our database includes 30+ of the most popular overlanding, off-road, and bug-out
                vehicles: Toyota 4Runner, Tacoma, Tundra, Land Cruiser; Jeep Wrangler, Gladiator,
                Grand Cherokee; Ford Bronco, F-150, Ranger, F-250; Chevrolet Colorado ZR2, Silverado,
                Tahoe; Ram 1500 Rebel, Power Wagon; Land Rover Defender; Lexus GX; Subaru Outback
                and Crosstrek Wilderness; Rivian R1T; and even van builds like the Mercedes Sprinter
                and Ford Transit. If your vehicle is not listed, you can enter all specs manually.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
