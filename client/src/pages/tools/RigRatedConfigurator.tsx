
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDown, ChevronRight, AlertTriangle, Info,
  ShieldAlert, Truck, Package, Users, MapPin,
  Scale, Shield, Route, FileText, Award,
  Sparkles, RotateCcw, Download, Fuel, Settings2, Send, Wrench, CircleDot,
} from "lucide-react";
import {
  getUniqueMakes, getModelsForMake, getYearsForModel, getTrimsForModelYear, findMachineByYearTrim,
} from "./rigrated-machines";
import type { UTVMachine, UTVBodyType } from "./rigrated-machines";
import { accessories, getAccessoryCategories, getAccessoriesByCategory, CATEGORY_LABELS } from "./rigrated-accessories";
import type { AccessoryCategory } from "./rigrated-accessories";
import { trails } from "./rigrated-trails";
import { stateLegalData } from "./rigrated-legal";
import { gearPresets, findPreset, getPresetOptions } from "./rigrated-gear-presets";
import {
  computeAll, defaultRigRatedConfig, RIGRATED_KEY,
  type RigRatedConfig, type RigRatedResult, type RigRatedWarning, type TripPlanData, defaultTripPlan,
} from "./rigrated-compute";
import { suspensionProducts, getSuspensionBrands, getSuspensionByBrand } from "./rigrated-suspension-products";
import { tires, wheels, getTireBrands, getTiresByBrand, getWheelBrands, getWheelsByBrand } from "./rigrated-tires-wheels";
import { FUEL_LBS_PER_GALLON } from "./rigrated-gear-presets";
import LegalHeatMap from "./LegalHeatMap";
import TripPlan from "./TripPlan";
import RigRatedShare from "./RigRatedShare";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import { trackEvent } from "@/lib/analytics";
import ToolSafetyDisclaimer from "@/components/tools/ToolSafetyDisclaimer";
import PrintQrCode from "@/components/tools/PrintQrCode";
import InstallButton from "@/components/tools/InstallButton";
import { VEHICLE_PROFILE_KEY } from "./vehicle-types";

// ─── SVG Gauge Component ──────────────────────────────────────────────

function GaugeArc({
  value, max, label, unit, size = 120, warningThreshold, dangerThreshold,
}: {
  value: number; max: number; label: string; unit?: string;
  size?: number; warningThreshold?: number; dangerThreshold?: number;
}) {
  const pct = Math.min(1, Math.max(0, value / max));
  const radius = (size - 16) / 2;
  const center = size / 2;
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

  let fillColor = "#10B981";
  const pctNum = pct * 100;
  if (dangerThreshold !== undefined && pctNum >= dangerThreshold) fillColor = "#EF4444";
  else if (warningThreshold !== undefined && pctNum >= warningThreshold) fillColor = "#EAB308";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.85}`}>
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${bgLargeArc} 1 ${bgEnd.x} ${bgEnd.y}`}
          fill="none" stroke="var(--border)" strokeWidth={8} strokeLinecap="round" opacity={0.3}
        />
        {pct > 0.005 && (
          <path
            d={`M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${valLargeArc} 1 ${valEnd.x} ${valEnd.y}`}
            fill="none" stroke={fillColor} strokeWidth={8} strokeLinecap="round"
            className="transition-all duration-700"
          />
        )}
        <text x={center} y={center + 2} textAnchor="middle" className="fill-foreground text-lg font-extrabold" style={{ fontSize: size * 0.18 }}>
          {value}
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

// ─── Collapsible Section ──────────────────────────────────────────────

function Section({
  title, icon: Icon, children, open, onToggle, iconColor, badge,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  open: boolean; onToggle: () => void; iconColor?: string; badge?: string;
}) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 py-4 text-left hover:text-primary transition-colors"
      >
        <Icon className={`w-4 h-4 ${iconColor || "text-primary"}`} />
        <span className="text-sm font-extrabold flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {badge}
          </span>
        )}
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="pb-4 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Input Helpers ────────────────────────────────────────────────────

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
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
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
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
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
          className="w-4 h-4 rounded-full bg-white shadow transition-transform"
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

// ─── Status Badge ────────────────────────────────────────────────────

function StatusBadge({ pct }: { pct: number }) {
  let color = "bg-green-500/10 text-green-500 border-green-500/30";
  let text = "Good";
  if (pct >= 100) { color = "bg-red-500/10 text-red-500 border-red-500/30"; text = "Over Limit"; }
  else if (pct >= 85) { color = "bg-orange-500/10 text-orange-500 border-orange-500/30"; text = "Caution"; }
  else if (pct >= 70) { color = "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"; text = "Near Margin"; }

  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${color}`}>
      {text} ({pct}%)
    </span>
  );
}

// ─── Warning Panel ──────────────────────────────────────────────────

function WarningsPanel({ warnings }: { warnings: RigRatedWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="space-y-2">
      {warnings.map((w, i) => {
        const iconColor = w.level === "danger" ? "text-red-500" : w.level === "warning" ? "text-yellow-500" : "text-blue-400";
        const bgColor = w.level === "danger" ? "bg-red-500/5 border-red-500/30" : w.level === "warning" ? "bg-yellow-500/5 border-yellow-500/30" : "bg-blue-500/5 border-blue-500/30";
        return (
          <div key={i} className={`flex gap-2 p-3 rounded-lg border ${bgColor}`}>
            {w.level === "danger" ? <ShieldAlert className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} /> :
             w.level === "warning" ? <AlertTriangle className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} /> :
             <Info className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} />}
            <p className="text-xs leading-relaxed">{w.message}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Trail Score Card ────────────────────────────────────────────────

function TrailCard({ score }: { score: RigRatedResult["trailScores"][0] }) {
  const trail = trails.find((t) => t.id === score.trailId);
  if (!trail) return null;

  const statusColor = score.overall === "red" ? "border-red-500/50 bg-red-500/5" :
    score.overall === "yellow" ? "border-yellow-500/50 bg-yellow-500/5" :
    "border-green-500/50 bg-green-500/5";

  const dot = (ok: boolean) => (
    <span className={`w-2 h-2 rounded-full inline-block ${ok ? "bg-green-500" : "bg-red-500"}`} />
  );

  return (
    <div className={`border rounded-lg p-3 space-y-2 ${statusColor}`}>
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-extrabold">{trail.name}</h5>
        <span className="text-[10px] font-bold uppercase">{trail.state}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">{trail.distanceMiles} mi | {trail.durationDays} days | Difficulty {trail.difficulty}/10</p>
      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <span>{dot(score.widthOk)} Width</span>
        <span>{dot(score.clearanceOk)} Clearance</span>
        <span>{dot(score.tiresOk)} Tires</span>
        <span>{dot(score.fuelRangeOk)} Fuel Range</span>
      </div>
      <p className="text-[10px] text-muted-foreground">{score.difficultyNote}</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function RigRatedConfigurator() {
  // ─── State ────────────────────────────────────────────────────
  const [config, setConfig] = useState<RigRatedConfig>(defaultRigRatedConfig);
  const [loaded, setLoaded] = useState(false);

  // Section open state
  const [sections, setSections] = useState({
    machine: true,
    accessories: false,
    gear: false,
    trails: false,
    legal: false,
    driveVsTrailer: false,
    tripPlan: false,
    results: true,
  });

  // Machine selector state
  const [selMake, setSelMake] = useState("");
  const [selModel, setSelModel] = useState("");
  const [selYear, setSelYear] = useState<number | "">("");
  const [selTrim, setSelTrim] = useState("");

  // Accessory category filter
  const [accCategory, setAccCategory] = useState<AccessoryCategory | "all">("all");

  // Profile import
  const [profileAvailable, setProfileAvailable] = useState(false);

  // Request form state
  const [reqForm, setReqForm] = useState({ make: "", model: "", year: "", trim: "", notes: "", email: "" });
  const [reqStatus, setReqStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // ─── Load from localStorage ────────────────────────────────────
  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "rigrated" });

    try {
      const saved = localStorage.getItem(RIGRATED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as RigRatedConfig;
        setConfig({ ...defaultRigRatedConfig, ...parsed });
      }
    } catch { /* ignore */ }

    try {
      const vp = localStorage.getItem(VEHICLE_PROFILE_KEY);
      if (vp) setProfileAvailable(true);
    } catch { /* ignore */ }

    setLoaded(true);
  }, []);

  // ─── Save to localStorage ──────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(RIGRATED_KEY, JSON.stringify(config));
    } catch { /* ignore */ }
  }, [config, loaded]);

  // ─── Update helpers ─────────────────────────────────────────────
  const update = useCallback(<K extends keyof RigRatedConfig>(key: K, value: RigRatedConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateManual = useCallback((key: string, value: number | string) => {
    setConfig((prev) => ({
      ...prev,
      manualMachine: { ...prev.manualMachine, [key]: value },
    }));
  }, []);

  // ─── Machine selection ──────────────────────────────────────────
  const handleMakeChange = useCallback((make: string) => {
    setSelMake(make);
    setSelModel("");
    setSelYear("");
    setSelTrim("");
    update("machine", null);
  }, [update]);

  const handleModelChange = useCallback((model: string) => {
    setSelModel(model);
    setSelYear("");
    setSelTrim("");
    update("machine", null);
  }, [update]);

  const handleYearChange = useCallback((year: number | "") => {
    setSelYear(year);
    setSelTrim("");
    update("machine", null);
  }, [update]);

  const handleTrimChange = useCallback((trim: string) => {
    setSelTrim(trim);
    if (!selMake || !selModel || !selYear || !trim) return;
    const machine = findMachineByYearTrim(selMake, selModel, selYear as number, trim);
    if (machine) {
      update("machine", { ...machine, year: selYear as number });
      update("useManual", false);
      trackEvent("pe_machine_selected", { tool: "rigrated", machine: `${selYear} ${selMake} ${selModel} ${trim}` });
    }
  }, [selMake, selModel, selYear, update]);

  // ─── Accessory toggle ───────────────────────────────────────────
  const toggleAccessory = useCallback((id: string) => {
    setConfig((prev) => {
      const has = prev.selectedAccessories.includes(id);
      return {
        ...prev,
        selectedAccessories: has
          ? prev.selectedAccessories.filter((a) => a !== id)
          : [...prev.selectedAccessories, id],
      };
    });
  }, []);

  // ─── Gear preset change ─────────────────────────────────────────
  const handlePresetChange = useCallback((days: number) => {
    const preset = findPreset(days);
    setConfig((prev) => ({
      ...prev,
      durationDays: days,
      gearPreset: preset || null,
    }));
  }, []);

  // ─── Section toggle ─────────────────────────────────────────────
  const toggleSection = useCallback((key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ─── Reset ────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    setConfig(defaultRigRatedConfig);
    setSelMake("");
    setSelModel("");
    setSelYear("");
    setSelTrim("");
    setAccCategory("all");
    try { localStorage.removeItem(RIGRATED_KEY); } catch { /* ignore */ }
  }, []);

  // ─── Computed results ───────────────────────────────────────────
  const result = useMemo<RigRatedResult>(
    () => computeAll(config, accessories, trails, stateLegalData),
    [config]
  );

  // ─── Derived values ─────────────────────────────────────────────
  const activeMachine = config.useManual ? config.manualMachine : config.machine;
  const bodyType: UTVBodyType = activeMachine?.bodyType ?? "2-seat-utility";
  const machineLabel = activeMachine
    ? ("id" in activeMachine ? `${activeMachine.year} ${activeMachine.make} ${activeMachine.model}` : `${activeMachine.year} ${activeMachine.make} ${activeMachine.model}`)
    : "Not selected";

  const estimatedMpg = bodyType.includes("sport") ? 8 : 12;
  const machineObj = getMachineObj(config);
  const totalFuel = machineObj.fuelCapacityGal + (config.gearPreset?.spareFuelGal ?? 0);
  const fuelRangeMiles = Math.round(totalFuel * estimatedMpg);

  if (!loaded) return null;

  // ─── Dropdown data ──────────────────────────────────────────────
  const makes = getUniqueMakes();
  const models = selMake ? getModelsForMake(selMake) : [];
  const years = selMake && selModel ? getYearsForModel(selMake, selModel) : [];
  const trims = selMake && selModel && selYear ? getTrimsForModelYear(selMake, selModel, selYear as number) : [];

  const categories = getAccessoryCategories(config.instagramMode);
  const filteredAccessories = accCategory === "all"
    ? accessories.filter((a) => categories.includes(a.category))
    : getAccessoriesByCategory(accCategory as AccessoryCategory);

  const selectedAccNames = config.selectedAccessories.map((id) => {
    const acc = accessories.find((a) => a.id === id);
    return acc ? `${acc.brand} ${acc.model}` : id;
  });

  return (
    <div className="space-y-6">
      {/* Safety Disclaimer */}
      <ToolSafetyDisclaimer level="safety-critical" />

      {/* Vehicle Profile Import Banner */}
      {profileAvailable && (
        <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Truck className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">Tow Vehicle Profile Detected</p>
            <p className="text-xs text-muted-foreground">Your saved vehicle from Ops Deck can be used in the Drive vs. Trailer comparison.</p>
          </div>
        </div>
      )}

      {/* Book Value vs Real World Explainer */}
      <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-extrabold mb-3">How This Tool Works</h3>
        <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-3">
          <p>
            <strong className="text-foreground">GVWR is the boss</strong> &mdash; the unbreakable factory line that says &ldquo;don&apos;t exceed this or you&apos;re toast.&rdquo; It never budges, no matter how many upgrades you bolt on. Payload? That&apos;s the leftover cash after the UTV&apos;s already eaten its own weight &mdash; room for you, your buddies, beer, tools, and that light bar you couldn&apos;t resist.
          </p>
          <p>
            Add-ons pile on fast like a bad ex: winch, roof, skid plates &mdash; bam, you&apos;re down to scraps quick. Fancy shocks or coilovers? They don&apos;t rewrite the rules or raise GVWR, but they sure make the ride way less like a jackhammer on your spine. They let you actually use more of that payload without bottoming out or turning the rig into a wobbly mess &mdash; so you can smugly say &ldquo;told you it&apos;d handle it&rdquo; while secretly hoping the axles hold.
          </p>
          <p>
            <strong className="text-foreground">Bottom line:</strong> accessories don&apos;t cheat physics, they just let you flirt with the limit more comfortably. Calculate your payload, knock off ten percent for safety, keep it light, keep it fun, and don&apos;t be that guy who turns his toy into a lawsuit on wheels.
          </p>
        </div>
      </div>

      {/* Main config card */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">

        {/* ─── Section 1: Machine Selection ───────────────────────── */}
        <Section
          title="Machine Selection"
          icon={Truck}
          open={sections.machine}
          onToggle={() => toggleSection("machine")}
          badge={activeMachine && !config.useManual && config.machine ? `${config.machine.year} ${config.machine.make} ${config.machine.model}` : undefined}
        >
          <div className="px-4 space-y-4">
            <Toggle
              label="Manual Entry"
              checked={config.useManual}
              onChange={(v) => update("useManual", v)}
              hint="Enter UTV specs manually instead of selecting from database"
            />

            {!config.useManual ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Make</label>
                  <select value={selMake} onChange={(e) => handleMakeChange(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                    <option value="">Select Make</option>
                    {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                  <select value={selModel} onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors" disabled={!selMake}>
                    <option value="">Select Model</option>
                    {models.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Year</label>
                  <select value={selYear} onChange={(e) => handleYearChange(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors" disabled={!selModel}>
                    <option value="">Select Year</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Trim</label>
                  <select value={selTrim} onChange={(e) => handleTrimChange(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors" disabled={!selYear}>
                    <option value="">Select Trim</option>
                    {trims.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <NumberInput label="Year" value={config.manualMachine.year} onChange={(v) => updateManual("year", v)} min={2010} max={2026} />
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Make</label>
                  <input type="text" value={config.manualMachine.make} onChange={(e) => updateManual("make", e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                  <input type="text" value={config.manualMachine.model} onChange={(e) => updateManual("model", e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors" />
                </div>
                <SelectInput label="Body Type" value={config.manualMachine.bodyType}
                  onChange={(v) => updateManual("bodyType", v)}
                  options={[
                    { value: "2-seat-sport", label: "2-Seat Sport" },
                    { value: "4-seat-sport", label: "4-Seat Sport" },
                    { value: "2-seat-utility", label: "2-Seat Utility" },
                    { value: "4-seat-utility", label: "4-Seat Utility" },
                    { value: "crew-cab-utility", label: "Crew Cab Utility" },
                  ]}
                />
                <NumberInput label="Dry Weight" value={config.manualMachine.dryWeightLbs} onChange={(v) => updateManual("dryWeightLbs", v)} unit="lbs" min={800} />
                <NumberInput label="GVWR" value={config.manualMachine.gvwrLbs} onChange={(v) => updateManual("gvwrLbs", v)} unit="lbs" min={1000} />
                <NumberInput label="Payload Capacity" value={config.manualMachine.payloadCapacityLbs} onChange={(v) => updateManual("payloadCapacityLbs", v)} unit="lbs" />
                <NumberInput label="Towing Capacity" value={config.manualMachine.towingCapacityLbs} onChange={(v) => updateManual("towingCapacityLbs", v)} unit="lbs" />
                <NumberInput label="Ground Clearance" value={config.manualMachine.groundClearanceIn} onChange={(v) => updateManual("groundClearanceIn", v)} unit="in" />
                <NumberInput label="Overall Width" value={config.manualMachine.overallWidthIn} onChange={(v) => updateManual("overallWidthIn", v)} unit="in" />
                <NumberInput label="Fuel Capacity" value={config.manualMachine.fuelCapacityGal} onChange={(v) => updateManual("fuelCapacityGal", v)} unit="gal" />
                <NumberInput label="Horsepower" value={config.manualMachine.horsePower} onChange={(v) => updateManual("horsePower", v)} unit="hp" />
              </div>
            )}

            {/* Machine spec summary */}
            {activeMachine && (
              <div className="bg-muted border border-border rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><span className="text-muted block text-[10px]">Dry Weight</span><span className="font-bold">{activeMachine.dryWeightLbs.toLocaleString()} lbs</span></div>
                <div><span className="text-muted block text-[10px]">GVWR</span><span className="font-bold">{activeMachine.gvwrLbs.toLocaleString()} lbs</span></div>
                <div><span className="text-muted block text-[10px]">Payload</span><span className="font-bold">{activeMachine.payloadCapacityLbs} lbs</span></div>
                <div><span className="text-muted block text-[10px]">Clearance</span><span className="font-bold">{activeMachine.groundClearanceIn}"</span></div>
                <div><span className="text-muted block text-[10px]">HP</span><span className="font-bold">{activeMachine.horsePower}</span></div>
                <div><span className="text-muted block text-[10px]">Fuel</span><span className="font-bold">{activeMachine.fuelCapacityGal} gal</span></div>
                <div><span className="text-muted block text-[10px]">Width</span><span className="font-bold">{activeMachine.overallWidthIn}"</span></div>
                <div><span className="text-muted block text-[10px]">Tow Rating</span><span className="font-bold">{activeMachine.towingCapacityLbs.toLocaleString()} lbs</span></div>
              </div>
            )}

            {/* Suspension Product Selector */}
            <div className="border-t border-border pt-4 space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Suspension Upgrade</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                  <select
                    value={config.selectedSuspension ? (suspensionProducts.find(p => p.id === config.selectedSuspension)?.brand ?? "") : ""}
                    onChange={(e) => {
                      if (!e.target.value) { update("selectedSuspension", null); return; }
                      // Select first product of brand
                      const products = getSuspensionByBrand(e.target.value);
                      update("selectedSuspension", products.length > 0 ? products[0].id : null);
                    }}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                  >
                    <option value="">Stock (No Upgrade)</option>
                    {getSuspensionBrands().map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                  <select
                    value={config.selectedSuspension ?? ""}
                    onChange={(e) => {
                      const id = e.target.value || null;
                      update("selectedSuspension", id);
                      if (id) {
                        const p = suspensionProducts.find((sp) => sp.id === id);
                        if (p) trackEvent("pe_suspension_selected", { brand: p.brand, model: p.model });
                      }
                    }}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                    disabled={!config.selectedSuspension}
                  >
                    <option value="">Select model...</option>
                    {config.selectedSuspension && getSuspensionByBrand(
                      suspensionProducts.find(p => p.id === config.selectedSuspension)?.brand ?? ""
                    ).map((p) => (
                      <option key={p.id} value={p.id}>{p.model} ({p.tier}) — {p.priceRange}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Suspension gain info */}
              {result.suspensionGain && (
                <div className="bg-muted border border-border rounded-lg p-3 space-y-1.5">
                  <p className="text-xs">
                    <strong className="text-foreground">{result.suspensionGain.product.brand}</strong> claims{" "}
                    <strong className="text-foreground">+{result.suspensionGain.product.claimedGainPct}%</strong> capacity
                    &rarr; <strong className="text-primary">Realistic: +{result.suspensionGain.product.realisticGainPct}%</strong>
                    <span className="text-muted-foreground"> (we cut marketing fluff in half)</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kit weight: <strong>{result.suspensionGain.kitWeightLbs} lbs</strong> |
                    Capacity boost: <strong>+{result.suspensionGain.realisticBoostLbs} lbs</strong> |
                    Net gain: <strong className={result.suspensionGain.netGainLbs >= 0 ? "text-green-500" : "text-red-500"}>
                      {result.suspensionGain.netGainLbs >= 0 ? "+" : ""}{result.suspensionGain.netGainLbs} lbs
                    </strong>
                  </p>
                  {result.suspensionGain.product.notes && (
                    <p className="text-[10px] text-muted-foreground">{result.suspensionGain.product.notes}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground italic">
                    Manufacturer claims are cut 50% to reflect real-world conditions. This ain&apos;t lab-tested &mdash; just ballpark trail math.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* ─── Section 2: Accessories ──────────────────────────────── */}
        <Section
          title="Accessories"
          icon={Settings2}
          open={sections.accessories}
          onToggle={() => toggleSection("accessories")}
          badge={config.selectedAccessories.length > 0 ? `${config.selectedAccessories.length} selected` : undefined}
        >
          <div className="px-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Toggle
                label="Instagram Mode"
                checked={config.instagramMode}
                onChange={(v) => update("instagramMode", v)}
                hint="Show cosmetic accessories (LED whips, underglow, sound bars)"
              />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setAccCategory("all")}
                className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border transition-colors ${
                  accCategory === "all" ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-border"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAccCategory(cat)}
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border transition-colors ${
                    accCategory === cat ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Accessory checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {filteredAccessories.map((acc) => {
                const isSelected = config.selectedAccessories.includes(acc.id);
                return (
                  <label
                    key={acc.id}
                    className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAccessory(acc.id)}
                      className="w-4 h-4 accent-accent mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold block truncate">{acc.brand} {acc.model}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {acc.weightLbs} lbs | {CATEGORY_LABELS[acc.category]}
                        {acc.isCosmetic && <span className="text-pink-400 ml-1">(cosmetic)</span>}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Fuel cell toggle */}
            {config.selectedAccessories.some(id => {
              const acc = accessories.find(a => a.id === id);
              return acc?.category === "fuel-cell" && acc?.fuelCapacityGal;
            }) && (
              <div className="bg-muted border border-border rounded-lg p-3">
                <Toggle
                  label="Fuel Cell Loaded (Full)"
                  checked={config.fuelCellFull}
                  onChange={(v) => update("fuelCellFull", v)}
                  hint={(() => {
                    const fc = config.selectedAccessories
                      .map(id => accessories.find(a => a.id === id))
                      .find(a => a?.category === "fuel-cell" && a?.fuelCapacityGal);
                    if (!fc || !fc.fuelCapacityGal) return "";
                    const fullWeight = fc.weightLbs + Math.round(fc.fuelCapacityGal * FUEL_LBS_PER_GALLON);
                    return `Dry: ${fc.weightLbs} lbs | Full: ${fullWeight} lbs`;
                  })()}
                />
              </div>
            )}

            {config.selectedAccessories.length > 0 && (
              <p className="text-[10px] text-muted-foreground">
                Total accessory weight: <strong>{result.payload.accessoriesWeight} lbs</strong>
              </p>
            )}

            {/* Tires & Wheels Upgrade */}
            <div className="border-t border-border pt-4 space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5" /> Tires & Wheels
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Tire</label>
                  <select
                    value={config.selectedTires ?? ""}
                    onChange={(e) => update("selectedTires", e.target.value || null)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                  >
                    <option value="">Stock Tires</option>
                    {tires.map((t) => (
                      <option key={t.id} value={t.id}>{t.brand} {t.model} {t.size} ({t.weightLbs} lbs ea)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Wheel</label>
                  <select
                    value={config.selectedWheels ?? ""}
                    onChange={(e) => update("selectedWheels", e.target.value || null)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                  >
                    <option value="">Stock Wheels</option>
                    {wheels.map((w) => (
                      <option key={w.id} value={w.id}>{w.brand} {w.model} {w.size} ({w.weightLbs} lbs ea, {w.material})</option>
                    ))}
                  </select>
                </div>
              </div>
              {result.tireWheelDelta > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Tire/wheel upgrade adds <strong className="text-foreground">+{result.tireWheelDelta} lbs</strong> over stock
                </p>
              )}
            </div>
          </div>
        </Section>

        {/* ─── Section 3: Occupants & Gear ────────────────────────── */}
        <Section
          title="Occupants & Gear"
          icon={Users}
          open={sections.gear}
          onToggle={() => toggleSection("gear")}
          badge={config.gearPreset ? config.gearPreset.label.split("(")[0].trim() : undefined}
        >
          <div className="px-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <NumberInput label="Adults" value={config.adults} onChange={(v) => update("adults", v)} min={0} max={6} />
              <NumberInput label="Children" value={config.children} onChange={(v) => update("children", v)} min={0} max={4} />
              <NumberInput label="Avg Adult Weight" value={config.avgAdultLbs} onChange={(v) => update("avgAdultLbs", v)} unit="lbs" min={80} />
              <NumberInput label="Avg Child Weight" value={config.avgChildLbs} onChange={(v) => update("avgChildLbs", v)} unit="lbs" min={30} />
            </div>

            <SelectInput
              label="Trip Duration Preset"
              value={String(config.durationDays)}
              onChange={(v) => handlePresetChange(Number(v))}
              options={[
                { value: "0", label: "Select duration..." },
                ...getPresetOptions().map((o) => ({ value: String(o.value), label: o.label })),
              ]}
            />

            <Toggle
              label="Custom Gear Weights"
              checked={config.useCustomGear}
              onChange={(v) => update("useCustomGear", v)}
              hint="Override preset weights with your own values"
            />

            {config.useCustomGear && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <NumberInput label="Food" value={config.customFoodLbs} onChange={(v) => update("customFoodLbs", v)} unit="lbs" />
                <NumberInput label="Water" value={config.customWaterGal} onChange={(v) => update("customWaterGal", v)} unit="gal" />
                <NumberInput label="Spare Fuel" value={config.customSpareFuelGal} onChange={(v) => update("customSpareFuelGal", v)} unit="gal" />
                <NumberInput label="Cooler + Ice" value={config.customCoolerLbs} onChange={(v) => update("customCoolerLbs", v)} unit="lbs" />
                <NumberInput label="Recovery Kit" value={config.customRecoveryLbs} onChange={(v) => update("customRecoveryLbs", v)} unit="lbs" />
                <NumberInput label="Tools" value={config.customToolsLbs} onChange={(v) => update("customToolsLbs", v)} unit="lbs" />
                <NumberInput label="Camping Gear" value={config.customCampingLbs} onChange={(v) => update("customCampingLbs", v)} unit="lbs" />
                <NumberInput label="Other" value={config.customOtherLbs} onChange={(v) => update("customOtherLbs", v)} unit="lbs" />
              </div>
            )}

            {result.payload.gearWeight > 0 && (
              <p className="text-[10px] text-muted-foreground">
                Total gear weight: <strong>{result.payload.gearWeight} lbs</strong> |
                Occupant weight: <strong>{result.payload.occupantWeight} lbs</strong>
              </p>
            )}
          </div>
        </Section>

        {/* ─── Section 4: Trail Compatibility ──────────────────────── */}
        <Section
          title="Trail Compatibility"
          icon={Route}
          open={sections.trails}
          onToggle={() => toggleSection("trails")}
          badge={result.trailScores.filter((t) => t.overall === "green").length > 0
            ? `${result.trailScores.filter((t) => t.overall === "green").length} green`
            : undefined}
        >
          <div className="px-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Trail compatibility is calculated from your machine specs vs. trail requirements (width, clearance, tire size, fuel range).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.trailScores.map((score) => (
                <TrailCard key={score.trailId} score={score} />
              ))}
            </div>
          </div>
        </Section>

        {/* ─── Section 5: Legal & Permits ──────────────────────────── */}
        <Section
          title="Legal & Permits"
          icon={Shield}
          open={sections.legal}
          onToggle={() => toggleSection("legal")}
          badge={config.selectedStates.length > 0 ? `${config.selectedStates.length} states` : undefined}
        >
          <div className="px-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Click states to select as travel destinations. Toggle view to see how legality changes with registration status.
            </p>
            <LegalHeatMap
              statuses={result.legalStatuses}
              view={config.legalView}
              onViewChange={(v) => update("legalView", v)}
              selectedStates={config.selectedStates}
              onStateToggle={(code) => {
                setConfig((prev) => ({
                  ...prev,
                  selectedStates: prev.selectedStates.includes(code)
                    ? prev.selectedStates.filter((s) => s !== code)
                    : [...prev.selectedStates, code],
                }));
              }}
            />
          </div>
        </Section>

        {/* ─── Section 6: Drive vs Trailer ─────────────────────────── */}
        <Section
          title="Drive vs. Trailer"
          icon={Fuel}
          open={sections.driveVsTrailer}
          onToggle={() => toggleSection("driveVsTrailer")}
        >
          <div className="px-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Compare driving your UTV to the trailhead vs. trailering it behind a tow vehicle.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <NumberInput label="Distance to Trail" value={config.driveMiles} onChange={(v) => update("driveMiles", v)} unit="miles" />
              <NumberInput label="Fuel Cost" value={config.fuelCostPerGal} onChange={(v) => update("fuelCostPerGal", v)} unit="$/gal" step={0.1} />
              <NumberInput label="Trailer Weight" value={config.trailerWeightLbs} onChange={(v) => update("trailerWeightLbs", v)} unit="lbs" hint="Empty trailer weight" />
              <NumberInput label="Tow Vehicle MPG" value={config.towVehicleMpg} onChange={(v) => update("towVehicleMpg", v)} unit="mpg" />
              <NumberInput label="Tow Vehicle Max Tow" value={config.towVehicleMaxTow} onChange={(v) => update("towVehicleMaxTow", v)} unit="lbs" />
            </div>

            {result.driveVsTrailer && (
              <div className="bg-muted border border-border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Drive UTV</p>
                    <p className="text-2xl font-extrabold text-primary">${result.driveVsTrailer.driveFuelCost}</p>
                    <p className="text-[10px] text-muted-foreground">fuel cost</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Trailer</p>
                    <p className="text-2xl font-extrabold">${result.driveVsTrailer.trailerFuelCost}</p>
                    <p className="text-[10px] text-muted-foreground">fuel cost</p>
                  </div>
                </div>
                {!result.driveVsTrailer.towVehicleCanHandle && (
                  <div className="flex gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/30">
                    <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs">Trailer total ({result.driveVsTrailer.trailerTotalWeight.toLocaleString()} lbs) exceeds tow capacity!</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{result.driveVsTrailer.recommendation}</p>
                <p className="text-[10px] text-muted-foreground">
                  Tongue weight: ~{result.driveVsTrailer.trailerTongueWeight} lbs |
                  Trailer total: {result.driveVsTrailer.trailerTotalWeight.toLocaleString()} lbs
                </p>
              </div>
            )}
          </div>
        </Section>

        {/* ─── Section 7: Trip Plan ────────────────────────────────── */}
        <Section
          title="Trip Plan"
          icon={FileText}
          open={sections.tripPlan}
          onToggle={() => toggleSection("tripPlan")}
        >
          <div className="px-4">
            <TripPlan
              plan={config.tripPlan}
              onChange={(plan) => update("tripPlan", plan)}
              machineLabel={machineLabel}
              loadedWeightLbs={result.payload.totalLoaded}
              payloadPct={result.payload.payloadPct}
              accessoryList={selectedAccNames}
              fuelRangeMiles={fuelRangeMiles}
            />
          </div>
        </Section>

        {/* ─── Section 8: Results Dashboard ────────────────────────── */}
        <Section
          title="Results Dashboard"
          icon={Scale}
          open={sections.results}
          onToggle={() => toggleSection("results")}
          iconColor="text-emerald-500"
        >
          <div className="px-4 space-y-6">

            {/* Gauges row */}
            <div className="flex flex-wrap justify-center gap-6">
              <GaugeArc
                value={result.payload.payloadPct}
                max={100}
                label="MFR Payload %"
                unit="%"
                warningThreshold={70}
                dangerThreshold={90}
              />
              {result.modifiedPayload && (
                <GaugeArc
                  value={result.modifiedPayload.payloadPct}
                  max={100}
                  label="Effective Payload %"
                  unit="%"
                  warningThreshold={70}
                  dangerThreshold={90}
                />
              )}
              <GaugeArc
                value={result.stabilityIndex}
                max={10}
                label="Stability Index"
                unit="/ 10"
              />
              <GaugeArc
                value={fuelRangeMiles}
                max={200}
                label="Fuel Range"
                unit="mi"
              />
            </div>

            {/* Payload bars */}
            <div className="bg-card border border-border rounded-lg p-3 space-y-3">
              {/* Stock spec bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {result.modifiedPayload ? "MFR Spec Payload" : "Payload Budget"}
                  </span>
                  <StatusBadge pct={result.payload.payloadPct} />
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, result.payload.payloadPct)}%`,
                      backgroundColor: result.payload.payloadPct >= 100 ? "#EF4444" : result.payload.payloadPct >= 85 ? "#F97316" : result.payload.payloadPct >= 70 ? "#EAB308" : "#10B981",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{result.payload.payloadUsed} lbs used of {result.payload.payloadCapacity} lbs capacity</span>
                  <span>{result.payload.remaining >= 0 ? `${result.payload.remaining} lbs remaining` : `${Math.abs(result.payload.remaining)} lbs OVER`}</span>
                </div>
              </div>

              {/* Modified bar (only when suspension upgrade active) */}
              {result.modifiedPayload && (
                <div className="space-y-1 border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Effective Payload</span>
                    <StatusBadge pct={result.modifiedPayload.payloadPct} />
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, result.modifiedPayload.payloadPct)}%`,
                        backgroundColor: result.modifiedPayload.payloadPct >= 100 ? "#EF4444" : result.modifiedPayload.payloadPct >= 85 ? "#F97316" : result.modifiedPayload.payloadPct >= 70 ? "#EAB308" : "#10B981",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{result.modifiedPayload.payloadUsed} lbs used of {result.modifiedPayload.payloadCapacity} lbs capacity</span>
                    <span>{result.modifiedPayload.remaining >= 0 ? `${result.modifiedPayload.remaining} lbs remaining` : `${Math.abs(result.modifiedPayload.remaining)} lbs OVER`}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Axle distribution */}
            <div className="bg-card border border-border rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Axle Distribution</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold w-12">Front</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500 rounded-l-full transition-all duration-500" style={{ width: `${result.axleDistribution.frontPct}%` }} />
                  <div className="h-full bg-orange-500 rounded-r-full transition-all duration-500" style={{ width: `${result.axleDistribution.rearPct}%` }} />
                </div>
                <span className="text-xs font-bold w-12 text-right">Rear</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{result.axleDistribution.frontPct}%</span>
                <span>{result.axleDistribution.rearPct}%</span>
              </div>
            </div>

            {/* GVWR Breakdown Donuts */}
            <div className="space-y-3">
              <div className={`flex ${result.modifiedPayload ? "flex-row justify-center gap-6 flex-wrap" : "flex-col sm:flex-row items-center gap-4"}`}>
                {/* Stock GVWR donut */}
                <div className="flex flex-col items-center">
                  <DonutChart
                    segments={result.stockGVWR.segments}
                    totalLabel={result.modifiedPayload ? "Book Value" : "GVWR Load"}
                    totalValue={`${result.stockGVWR.usedPct}%`}
                    size={result.modifiedPayload ? 150 : 180}
                    overCapacity={result.stockGVWR.isOverCapacity}
                  />
                  {result.modifiedPayload && (
                    <span className="text-[10px] font-bold text-muted-foreground mt-1">Book Value</span>
                  )}
                </div>

                {/* Effective GVWR donut (only when suspension active) */}
                {result.modifiedPayload && (
                  <div className="flex flex-col items-center">
                    <DonutChart
                      segments={result.effectiveGVWR.segments}
                      totalLabel="Real World"
                      totalValue={`${result.effectiveGVWR.usedPct}%`}
                      size={150}
                      overCapacity={result.effectiveGVWR.isOverCapacity}
                    />
                    <span className="text-[10px] font-bold text-primary mt-1">Real World</span>
                  </div>
                )}

                {/* Legend beside single donut */}
                {!result.modifiedPayload && (
                  <ChartLegend segments={result.stockGVWR.segments} />
                )}
              </div>
              {result.modifiedPayload && (
                <div className="flex justify-center">
                  <ChartLegend segments={result.stockGVWR.segments} />
                </div>
              )}
            </div>

            {/* Fun Message */}
            {result.funMessage && (
              <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/30">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-foreground">{result.funMessage}</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/30">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-muted-foreground space-y-1">
                <p>
                  <strong className="text-foreground">Ballpark trail math &mdash; not lab-certified.</strong> Weigh your rig, know your limits.
                  GVWR is set by the manufacturer based on frame, axles, hubs, and brakes &mdash; it never changes regardless of upgrades.
                </p>
                {result.modifiedPayload && (
                  <p>
                    Suspension upgrades improve weight handling but do not raise GVWR. &ldquo;Real World&rdquo; capacity reflects
                    how the suspension lets you use more of your payload without bottoming out. Manufacturer claims are cut 50%
                    for real-world conditions (trail abuse, heat soak, mud).
                  </p>
                )}
                <p>Community-sourced weights coming soon.</p>
              </div>
            </div>

            {/* 14-Day Certified Badge */}
            <div className={`border rounded-lg p-4 ${
              result.certifiedBadge.earned
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border bg-card"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <Award className={`w-8 h-8 ${result.certifiedBadge.earned ? "text-emerald-500" : "text-muted-foreground"}`} />
                <div>
                  <h4 className="text-sm font-extrabold">
                    {result.certifiedBadge.earned ? "14-Day Certified" : "14-Day Badge — Not Yet Earned"}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">Pass all 5 checks to earn the badge</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[
                  { label: "Payload < 80%", ok: result.certifiedBadge.checks.payloadUnder80 },
                  { label: "Legal OK", ok: result.certifiedBadge.checks.legalOk },
                  { label: "Fuel Range", ok: result.certifiedBadge.checks.fuelRange },
                  { label: "Recovery Gear", ok: result.certifiedBadge.checks.recoveryGear },
                  { label: "Water Supply", ok: result.certifiedBadge.checks.waterSupply },
                ].map((check) => (
                  <div key={check.label} className={`text-center p-2 rounded border ${check.ok ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                    <span className={`text-xs font-bold ${check.ok ? "text-green-500" : "text-red-500"}`}>
                      {check.ok ? "PASS" : "FAIL"}
                    </span>
                    <p className="text-[10px] text-muted-foreground">{check.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <WarningsPanel warnings={result.warnings} />

            {/* Stability note */}
            <p className="text-xs text-muted-foreground">{result.stabilityNote}</p>
          </div>
        </Section>
      </div>

      {/* Request a Machine */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 no-print">
        <h3 className="text-sm font-extrabold flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          Request a Machine
        </h3>
        <p className="text-xs text-muted-foreground">
          Don&apos;t see your UTV or side-by-side? Submit a request and we&apos;ll add it to the database.
        </p>
        {reqStatus === "sent" ? (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold">
            Request submitted! We&apos;ll review it and add the machine.
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!reqForm.make || !reqForm.model || !reqForm.year) return;
              setReqStatus("sending");
              try {
                const res = await fetch("/api/vehicle-requests", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...reqForm, source: "rigrated" }),
                });
                if (res.ok) {
                  setReqStatus("sent");
                  setReqForm({ make: "", model: "", year: "", trim: "", notes: "", email: "" });
                } else {
                  const data = await res.json();
                  alert(data.error || "Something went wrong.");
                  setReqStatus("idle");
                }
              } catch {
                alert("Network error. Please try again.");
                setReqStatus("idle");
              }
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Make *</label>
                <input
                  type="text" required minLength={2} maxLength={50} placeholder="e.g. Polaris"
                  value={reqForm.make} onChange={(e) => setReqForm((p) => ({ ...p, make: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model *</label>
                <input
                  type="text" required minLength={2} maxLength={80} placeholder="e.g. RZR XP 1000"
                  value={reqForm.model} onChange={(e) => setReqForm((p) => ({ ...p, model: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Year *</label>
                <input
                  type="text" required minLength={4} maxLength={4} placeholder="e.g. 2025"
                  value={reqForm.year} onChange={(e) => setReqForm((p) => ({ ...p, year: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Trim</label>
                <input
                  type="text" maxLength={80} placeholder="e.g. Sport, Premium"
                  value={reqForm.trim} onChange={(e) => setReqForm((p) => ({ ...p, trim: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Email</label>
                <input
                  type="email" maxLength={120} placeholder="Optional — notify me when added"
                  value={reqForm.email} onChange={(e) => setReqForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Notes</label>
              <textarea
                maxLength={200} rows={2} placeholder="Any details that would help us add this machine..."
                value={reqForm.notes} onChange={(e) => setReqForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={reqStatus === "sending"}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-bold uppercase hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {reqStatus === "sending" ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="space-y-4 no-print">
        <DataPrivacyNotice />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg text-xs font-bold uppercase hover:border-primary/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All
          </button>
        </div>

        <RigRatedShare
          url={typeof window !== "undefined" ? window.location.href : ""}
          machineName={machineLabel}
          stockPayloadLbs={result.payload.payloadCapacity}
          effectivePayloadLbs={result.modifiedPayload?.payloadCapacity ?? result.payload.payloadCapacity}
          gainLbs={result.suspensionGain?.netGainLbs ?? 0}
          suspensionBrand={result.suspensionGain?.product.brand}
          topMod={result.suspensionGain ? `${result.suspensionGain.product.brand} ${result.suspensionGain.product.model}` : undefined}
        />
        <PrintQrCode url={typeof window !== "undefined" ? window.location.href : ""} />
        <InstallButton />
        <SupportFooter />
      </div>
    </div>
  );
}

// ─── Helper to get machine object for non-React contexts ─────────────

function getMachineObj(config: RigRatedConfig) {
  if (config.useManual || !config.machine) return config.manualMachine;
  return config.machine;
}
