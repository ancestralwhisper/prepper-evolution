import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDown, ChevronRight, AlertTriangle, Info,
  ShieldAlert, Truck, Package, Users, MapPin,
  Scale, Shield, Route, FileText, Award,
  Sparkles, RotateCcw, Download, Fuel, Settings2,
} from "lucide-react";
import {
  getUniqueMakes, getModelsForMake, getTrimsForModel, findMachine,
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
import RigRatedSvg from "./RigRatedSvg";
import LegalHeatMap from "./LegalHeatMap";
import TripPlan from "./TripPlan";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import ToolSafetyDisclaimer from "@/components/tools/ToolSafetyDisclaimer";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import PrintQrCode from "@/components/tools/PrintQrCode";
import InstallButton from "@/components/tools/InstallButton";
import { VEHICLE_PROFILE_KEY } from "./vehicle-types";

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

export default function RigRatedConfigurator() {
  const [config, setConfig] = useState<RigRatedConfig>(defaultRigRatedConfig);
  const [loaded, setLoaded] = useState(false);

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

  const [selMake, setSelMake] = useState("");
  const [selModel, setSelModel] = useState("");
  const [selTrim, setSelTrim] = useState("");

  const [accCategory, setAccCategory] = useState<AccessoryCategory | "all">("all");

  const [profileAvailable, setProfileAvailable] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(RIGRATED_KEY, JSON.stringify(config));
    } catch { /* ignore */ }
  }, [config, loaded]);

  const update = useCallback(<K extends keyof RigRatedConfig>(key: K, value: RigRatedConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateManual = useCallback((key: string, value: number | string) => {
    setConfig((prev) => ({
      ...prev,
      manualMachine: { ...prev.manualMachine, [key]: value },
    }));
  }, []);

  const handleMakeChange = useCallback((make: string) => {
    setSelMake(make);
    setSelModel("");
    setSelTrim("");
    update("machine", null);
  }, [update]);

  const handleModelChange = useCallback((model: string) => {
    setSelModel(model);
    setSelTrim("");
    update("machine", null);
  }, [update]);

  const handleTrimChange = useCallback((trim: string) => {
    setSelTrim(trim);
    if (!selMake || !selModel || !trim) return;
    const machine = findMachine(selMake, selModel, trim);
    if (machine) {
      update("machine", machine);
      update("useManual", false);
    }
  }, [selMake, selModel, update]);

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

  const handlePresetChange = useCallback((days: number) => {
    const preset = findPreset(days);
    setConfig((prev) => ({
      ...prev,
      durationDays: days,
      gearPreset: preset || null,
    }));
  }, []);

  const toggleSection = useCallback((key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetAll = useCallback(() => {
    setConfig(defaultRigRatedConfig);
    setSelMake("");
    setSelModel("");
    setSelTrim("");
    setAccCategory("all");
    try { localStorage.removeItem(RIGRATED_KEY); } catch { /* ignore */ }
  }, []);

  const result = useMemo<RigRatedResult>(
    () => computeAll(config, accessories, trails, stateLegalData),
    [config]
  );

  const activeMachine = config.useManual ? config.manualMachine : config.machine;
  const bodyType: UTVBodyType = activeMachine?.bodyType ?? "2-seat-utility";
  const machineLabel = activeMachine
    ? ("id" in activeMachine ? `${activeMachine.year} ${activeMachine.make} ${activeMachine.model}` : `${activeMachine.year} ${activeMachine.make} ${activeMachine.model}`)
    : "Not selected";

  const hasCategory = (cat: string) => config.selectedAccessories.some((id) => {
    const acc = accessories.find((a) => a.id === id);
    return acc?.category === cat;
  });

  const estimatedMpg = bodyType.includes("sport") ? 8 : 12;
  const machineObj = getMachineObj(config);
  const totalFuel = machineObj.fuelCapacityGal + (config.gearPreset?.spareFuelGal ?? 0);
  const fuelRangeMiles = Math.round(totalFuel * estimatedMpg);

  if (!loaded) return null;

  const makes = getUniqueMakes();
  const models = selMake ? getModelsForMake(selMake) : [];
  const trims = selMake && selModel ? getTrimsForModel(selMake, selModel) : [];

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
      <ToolSafetyDisclaimer level="safety-critical" />

      {profileAvailable && (
        <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Truck className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">Tow Vehicle Profile Detected</p>
            <p className="text-xs text-muted-foreground">Your saved vehicle from Ops Deck can be used in the Drive vs. Trailer comparison.</p>
          </div>
        </div>
      )}

      <RigRatedSvg
        bodyType={bodyType}
        showRoof={hasCategory("roof")}
        showWindshield={hasCategory("windshield")}
        showDoors={hasCategory("doors")}
        showFrontBumper={hasCategory("bumper-front")}
        showRearBumper={hasCategory("bumper-rear")}
        showWinch={hasCategory("winch")}
        showRack={hasCategory("roof-rack") || hasCategory("cargo-rack")}
        showLightBar={hasCategory("light-bar")}
        showRtt={hasCategory("rtt-mount")}
        loadStatus={result.overallStatus}
      />

      <div className="bg-card border border-border rounded-lg overflow-hidden">

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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Year / Trim</label>
                  <select value={selTrim} onChange={(e) => handleTrimChange(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors" disabled={!selModel}>
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

            {activeMachine && (
              <div className="bg-muted border border-border rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><span className="text-muted-foreground block text-[10px]">Dry Weight</span><span className="font-bold">{activeMachine.dryWeightLbs.toLocaleString()} lbs</span></div>
                <div><span className="text-muted-foreground block text-[10px]">GVWR</span><span className="font-bold">{activeMachine.gvwrLbs.toLocaleString()} lbs</span></div>
                <div><span className="text-muted-foreground block text-[10px]">Payload</span><span className="font-bold">{activeMachine.payloadCapacityLbs} lbs</span></div>
                <div><span className="text-muted-foreground block text-[10px]">Clearance</span><span className="font-bold">{activeMachine.groundClearanceIn}"</span></div>
                <div><span className="text-muted-foreground block text-[10px]">HP</span><span className="font-bold">{activeMachine.horsePower}</span></div>
                <div><span className="text-muted-foreground block text-[10px]">Fuel</span><span className="font-bold">{activeMachine.fuelCapacityGal} gal</span></div>
                <div><span className="text-muted-foreground block text-[10px]">Width</span><span className="font-bold">{activeMachine.overallWidthIn}"</span></div>
                <div><span className="text-muted-foreground block text-[10px]">Tow Rating</span><span className="font-bold">{activeMachine.towingCapacityLbs.toLocaleString()} lbs</span></div>
              </div>
            )}
          </div>
        </Section>

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
                      className="w-4 h-4 accent-primary mt-0.5"
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

            {config.selectedAccessories.length > 0 && (
              <p className="text-[10px] text-muted-foreground">
                Total accessory weight: <strong>{result.payload.accessoriesWeight} lbs</strong>
              </p>
            )}
          </div>
        </Section>

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

        <Section
          title="Results Dashboard"
          icon={Scale}
          open={sections.results}
          onToggle={() => toggleSection("results")}
          iconColor="text-emerald-500"
        >
          <div className="px-4 space-y-6">

            <div className="flex flex-wrap justify-center gap-6">
              <GaugeArc
                value={result.payload.payloadPct}
                max={100}
                label="Payload Used"
                unit="%"
                warningThreshold={70}
                dangerThreshold={90}
              />
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

            <div className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Payload Budget</span>
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

            {result.weightBreakdown.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <DonutChart
                  segments={result.weightBreakdown}
                  totalLabel="Payload"
                  totalValue={`${result.payload.payloadUsed} lbs`}
                  size={180}
                />
                <ChartLegend segments={result.weightBreakdown} />
              </div>
            )}

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

            <WarningsPanel warnings={result.warnings} />

            <p className="text-xs text-muted-foreground">{result.stabilityNote}</p>
          </div>
        </Section>
      </div>

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

        <ToolSocialShare
          url={typeof window !== "undefined" ? window.location.href : ""}
          toolName="RigRated UTV/Quad Overland Builder"
        />
        <PrintQrCode url={typeof window !== "undefined" ? window.location.href : ""} />
        <InstallButton />
      </div>
    </div>
  );
}

function getMachineObj(config: RigRatedConfig) {
  if (config.useManual || !config.machine) return config.manualMachine;
  return config.machine;
}
