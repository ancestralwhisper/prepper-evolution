import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Truck, ChevronDown, ChevronRight, AlertTriangle, Info,
  ShieldAlert, Tent, Wind, Package, Users, Bed, Ruler,
  Plus, Trash2, Save, RotateCcw, ExternalLink, Download,
} from "lucide-react";
import {
  getUniqueMakes, getModelsForMake, getTrimsForModel, findVehicle,
} from "./vehicle-db";
import type { StockVehicle, BodyType } from "./vehicle-types";
import { VEHICLE_PROFILE_KEY } from "./vehicle-types";
import { rackDatabase, getRackBrands, getRackModels, findRack } from "./rigsafe-racks";
import type { RackEntry } from "./rigsafe-racks";
import { tentDatabase, getTentBrands, getTentModels, findTent } from "./rigsafe-tents";
import type { TentEntry } from "./rigsafe-tents";
import { awningDatabase, getAwningBrands, getAwningModels, findAwning } from "./rigsafe-awnings";
import type { AwningEntry } from "./rigsafe-awnings";
import { tonneauDatabase, getTonneauBrands, getTonneauModels, findTonneau } from "./rigsafe-tonneaus";
import type { TonneauEntry } from "./rigsafe-tonneaus";
import {
  computeAll, defaultRigSafeConfig, RIGSAFE_KEY,
  type RigSafeConfig, type RigSafeResult, type RigSafeWarning, type CargoItem,
} from "./rigsafe-compute";
import RigSafeSvg from "./RigSafeSvg";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import ToolSafetyDisclaimer from "@/components/tools/ToolSafetyDisclaimer";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import PrintQrCode from "@/components/tools/PrintQrCode";
import InstallButton from "@/components/tools/InstallButton";
import { generateRigSafePdf, type RigSafePdfData } from "@/components/tools/PdfExport";

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

function WarningsPanel({ warnings }: { warnings: RigSafeWarning[] }) {
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

function BudgetCard({ label, used, rating, remaining, pct, unit }: {
  label: string; used: number; rating: number; remaining: number; pct: number; unit?: string;
}) {
  let barColor = "#10B981";
  if (pct >= 100) barColor = "#EF4444";
  else if (pct >= 85) barColor = "#F97316";
  else if (pct >= 70) barColor = "#EAB308";

  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
        <StatusBadge pct={pct} />
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{used} {unit || "lbs"} used</span>
        <span>{remaining >= 0 ? `${remaining} ${unit || "lbs"} remaining` : `${Math.abs(remaining)} ${unit || "lbs"} OVER`}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">Rating: {rating} {unit || "lbs"}</p>
    </div>
  );
}

export default function RigSafeConfigurator() {
  const [config, setConfig] = useState<RigSafeConfig>(defaultRigSafeConfig);
  const [loaded, setLoaded] = useState(false);

  const [sections, setSections] = useState({
    vehicle: true,
    mounting: false,
    tent: false,
    awning: false,
    cargo: false,
    occupants: false,
    results: true,
  });

  const [selMake, setSelMake] = useState("");
  const [selModel, setSelModel] = useState("");
  const [selTrim, setSelTrim] = useState("");

  const [selRackBrand, setSelRackBrand] = useState("");
  const [selTentBrand, setSelTentBrand] = useState("");
  const [selAwningBrand, setSelAwningBrand] = useState("");
  const [selTonneauBrand, setSelTonneauBrand] = useState("");

  const [profileAvailable, setProfileAvailable] = useState(false);
  const [profileImported, setProfileImported] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RIGSAFE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as RigSafeConfig;
        setConfig({ ...defaultRigSafeConfig, ...parsed });
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
      localStorage.setItem(RIGSAFE_KEY, JSON.stringify(config));
    } catch { /* ignore */ }
  }, [config, loaded]);

  const importFromProfile = useCallback(() => {
    try {
      const raw = localStorage.getItem(VEHICLE_PROFILE_KEY);
      if (!raw) return;
      const vp = JSON.parse(raw);
      const stock = findVehicle(vp.make, vp.model, `${vp.year} ${vp.trim}`);
      if (stock) {
        setConfig((prev) => ({
          ...prev,
          vehicle: stock,
          useManual: false,
          mountType: stock.bodyType.includes("cab") || stock.bodyType === "mid-truck" ? "bed-rack" : "roof-rack",
        }));
        setSelMake(stock.make);
        setSelModel(stock.model);
        setSelTrim(`${stock.year} ${stock.trim}`);
      } else {
        setConfig((prev) => ({
          ...prev,
          useManual: true,
          manualVehicle: {
            ...prev.manualVehicle,
            year: vp.year || 2024,
            make: vp.make || "",
            model: vp.model || "",
            curbWeightLbs: vp.curbWeightLbs || 5000,
            gvwrLbs: vp.gvwrLbs || 7000,
            overallHeightIn: 76,
            bedLengthIn: 68,
            roofDynamicLbs: 150,
            roofStaticLbs: 450,
            bodyType: "crew-cab-short",
            fuelTankGal: vp.fuelTankGal || 24,
            engineType: vp.engineType || "gas",
            wheelbaseIn: vp.wheelbaseIn || 145,
            trackWidthIn: vp.trackWidthIn || 67,
            ssf: vp.ssf || 1.15,
            cgHeightIn: vp.cgHeightIn || 29,
          },
        }));
      }
      setProfileImported(true);
    } catch { /* ignore */ }
  }, []);

  const update = useCallback(<K extends keyof RigSafeConfig>(key: K, value: RigSafeConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateManualVehicle = useCallback((key: string, value: number | string | null) => {
    setConfig((prev) => ({
      ...prev,
      manualVehicle: { ...prev.manualVehicle, [key]: value },
    }));
  }, []);

  const updateManualRack = useCallback((key: string, value: number) => {
    setConfig((prev) => ({
      ...prev,
      manualRack: { ...prev.manualRack, [key]: value },
    }));
  }, []);

  const updateManualTent = useCallback((key: string, value: number) => {
    setConfig((prev) => ({
      ...prev,
      manualTent: { ...prev.manualTent, [key]: value },
    }));
  }, []);

  const updateManualAwning = useCallback((key: string, value: number) => {
    setConfig((prev) => ({
      ...prev,
      manualAwning: { ...prev.manualAwning, [key]: value },
    }));
  }, []);

  const updateOccupants = useCallback((key: string, value: number) => {
    setConfig((prev) => ({
      ...prev,
      occupants: { ...prev.occupants, [key]: value },
    }));
  }, []);

  const addCargoItem = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      cargoItems: [
        ...prev.cargoItems,
        { id: Date.now().toString(36), name: "", weightLbs: 0, qty: 1 },
      ],
    }));
  }, []);

  const updateCargoItem = useCallback((id: string, field: keyof CargoItem, value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      cargoItems: prev.cargoItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeCargoItem = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      cargoItems: prev.cargoItems.filter((item) => item.id !== id),
    }));
  }, []);

  const handleMakeChange = useCallback((make: string) => {
    setSelMake(make);
    setSelModel("");
    setSelTrim("");
    update("vehicle", null);
  }, [update]);

  const handleModelChange = useCallback((model: string) => {
    setSelModel(model);
    setSelTrim("");
    update("vehicle", null);
  }, [update]);

  const handleTrimChange = useCallback((trim: string) => {
    setSelTrim(trim);
    if (!selMake || !selModel || !trim) return;
    const stock = findVehicle(selMake, selModel, trim);
    if (stock) {
      update("vehicle", stock);
      update("useManual", false);
      const isTruck = stock.bodyType.includes("cab") || stock.bodyType === "mid-truck";
      update("mountType", isTruck ? "bed-rack" : "roof-rack");
    }
  }, [selMake, selModel, update]);

  const result = useMemo<RigSafeResult>(() => computeAll(config), [config]);

  const activeVehicle = config.useManual ? config.manualVehicle : config.vehicle;
  const bodyType: BodyType = activeVehicle
    ? ("bodyType" in activeVehicle ? activeVehicle.bodyType : "crew-cab-short")
    : "crew-cab-short";
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";

  const overallLoadStatus: "green" | "yellow" | "red" =
    result.safetyMarginStatus === "over-limit" ? "red" :
    result.safetyMarginStatus === "margin-warning" ? "yellow" : "green";

  const toggleSection = useCallback((key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetAll = useCallback(() => {
    setConfig(defaultRigSafeConfig);
    setSelMake("");
    setSelModel("");
    setSelTrim("");
    setSelRackBrand("");
    setSelTentBrand("");
    setSelAwningBrand("");
    setSelTonneauBrand("");
    setProfileImported(false);
    try { localStorage.removeItem(RIGSAFE_KEY); } catch { /* ignore */ }
  }, []);

  if (!loaded) return null;

  const makes = getUniqueMakes();
  const models = selMake ? getModelsForMake(selMake) : [];
  const trims = selMake && selModel ? getTrimsForModel(selMake, selModel) : [];

  const rackType = config.mountType;
  const filteredRackBrands = getRackBrands(rackType);
  const filteredRackModels = selRackBrand ? getRackModels(selRackBrand, rackType) : [];

  const tentBrands = getTentBrands();
  const tentModels = selTentBrand ? getTentModels(selTentBrand) : [];

  const awningBrands = getAwningBrands();
  const awningModels = selAwningBrand ? getAwningModels(selAwningBrand) : [];

  const tonneauBrands = getTonneauBrands();
  const tonneauModels = selTonneauBrand ? getTonneauModels(selTonneauBrand) : [];

  return (
    <div className="space-y-6">
      <ToolSafetyDisclaimer level="safety-critical" />

      {profileAvailable && !profileImported && (
        <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Truck className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">Vehicle Profile Detected</p>
            <p className="text-xs text-muted-foreground">We found your saved vehicle from Ops Deck. Import it?</p>
          </div>
          <button
            onClick={importFromProfile}
            className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-primary/90 transition-colors"
          >
            Import Vehicle
          </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">

        <Section
          title="Vehicle Setup"
          icon={Truck}
          open={sections.vehicle}
          onToggle={() => toggleSection("vehicle")}
          badge={activeVehicle && !config.useManual && config.vehicle ? `${config.vehicle.year} ${config.vehicle.make} ${config.vehicle.model}` : undefined}
        >
          <div className="px-4 space-y-4">
            <Toggle
              label="Manual Entry"
              checked={config.useManual}
              onChange={(v) => update("useManual", v)}
              hint="Enter specs manually instead of selecting from database"
            />

            {!config.useManual ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Make</label>
                    <select
                      value={selMake}
                      onChange={(e) => handleMakeChange(e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                    >
                      <option value="">Select Make</option>
                      {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                    <select
                      value={selModel}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                      disabled={!selMake}
                    >
                      <option value="">Select Model</option>
                      {models.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Year / Trim</label>
                    <select
                      value={selTrim}
                      onChange={(e) => handleTrimChange(e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                      disabled={!selModel}
                    >
                      <option value="">Select Trim</option>
                      {trims.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {config.vehicle && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">Curb Weight</span>
                      <span className="font-bold">{config.vehicle.curbWeightLbs.toLocaleString()} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">GVWR</span>
                      <span className="font-bold">{config.vehicle.gvwrLbs.toLocaleString()} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">Payload</span>
                      <span className="font-bold">{(config.vehicle.gvwrLbs - config.vehicle.curbWeightLbs).toLocaleString()} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">Roof Dynamic</span>
                      <span className="font-bold">{config.vehicle.roofDynamicLbs} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">Height</span>
                      <span className="font-bold">{config.vehicle.overallHeightIn}&quot;</span>
                    </div>
                    {config.vehicle.bedLengthIn && (
                      <div className="bg-muted rounded-lg p-2">
                        <span className="text-muted-foreground block text-[10px] uppercase">Bed Length</span>
                        <span className="font-bold">{config.vehicle.bedLengthIn}&quot;</span>
                      </div>
                    )}
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">Body Type</span>
                      <span className="font-bold">{config.vehicle.bodyType}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <NumberInput label="Year" value={config.manualVehicle.year} onChange={(v) => updateManualVehicle("year", v)} min={1990} max={2030} />
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Make</label>
                  <input
                    type="text" value={config.manualVehicle.make}
                    onChange={(e) => updateManualVehicle("make", e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                  <input
                    type="text" value={config.manualVehicle.model}
                    onChange={(e) => updateManualVehicle("model", e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                  />
                </div>
                <NumberInput label="Curb Weight" value={config.manualVehicle.curbWeightLbs} onChange={(v) => updateManualVehicle("curbWeightLbs", v)} unit="lbs" />
                <NumberInput label="GVWR" value={config.manualVehicle.gvwrLbs} onChange={(v) => updateManualVehicle("gvwrLbs", v)} unit="lbs" />
                <NumberInput label="Overall Height" value={config.manualVehicle.overallHeightIn} onChange={(v) => updateManualVehicle("overallHeightIn", v)} unit="in" />
                <NumberInput label="Bed Length" value={config.manualVehicle.bedLengthIn ?? 0} onChange={(v) => updateManualVehicle("bedLengthIn", v || null)} unit="in" hint="0 = no bed (SUV)" />
                <NumberInput label="Roof Dynamic Rating" value={config.manualVehicle.roofDynamicLbs} onChange={(v) => updateManualVehicle("roofDynamicLbs", v)} unit="lbs" />
                <NumberInput label="Roof Static Rating" value={config.manualVehicle.roofStaticLbs} onChange={(v) => updateManualVehicle("roofStaticLbs", v)} unit="lbs" />
                <NumberInput label="Fuel Tank" value={config.manualVehicle.fuelTankGal} onChange={(v) => updateManualVehicle("fuelTankGal", v)} unit="gal" />
                <SelectInput
                  label="Body Type"
                  value={config.manualVehicle.bodyType}
                  onChange={(v) => updateManualVehicle("bodyType", v)}
                  options={[
                    { value: "crew-cab-short", label: "Crew Cab Short Bed" },
                    { value: "crew-cab-standard", label: "Crew Cab Standard Bed" },
                    { value: "crew-cab-long", label: "Crew Cab Long Bed" },
                    { value: "mid-truck", label: "Mid-Size Truck" },
                    { value: "suv-5door", label: "SUV (5-Door)" },
                    { value: "suv-3door", label: "SUV (3-Door)" },
                    { value: "crossover", label: "Crossover" },
                    { value: "van", label: "Van" },
                  ]}
                />
                <SelectInput
                  label="Engine Type"
                  value={config.manualVehicle.engineType}
                  onChange={(v) => updateManualVehicle("engineType", v)}
                  options={[
                    { value: "gas", label: "Gasoline" },
                    { value: "diesel", label: "Diesel" },
                    { value: "hybrid", label: "Hybrid" },
                    { value: "ev", label: "Electric" },
                  ]}
                />
              </div>
            )}
          </div>
        </Section>

        <Section
          title="Mounting Configuration"
          icon={Package}
          open={sections.mounting}
          onToggle={() => toggleSection("mounting")}
          badge={config.rack ? `${config.rack.brand} ${config.rack.model}` : undefined}
        >
          <div className="px-4 space-y-4">
            <SelectInput
              label="Mount Type"
              value={config.mountType}
              onChange={(v) => update("mountType", v)}
              options={[
                { value: "bed-rack", label: "Bed Rack (Trucks)" },
                { value: "roof-rack", label: "Roof Rack (SUVs, Crossovers)" },
                { value: "cab-rack", label: "Cab-Over Rack" },
              ]}
            />

            {isTruck && (
              <div className="space-y-3">
                <Toggle
                  label="Tonneau Cover"
                  checked={config.hasTonneau}
                  onChange={(v) => update("hasTonneau", v)}
                  hint="Weight counts against vehicle payload, not rack budget"
                />
                {config.hasTonneau && (
                  <div className="pl-6 space-y-3">
                    <Toggle
                      label="Manual Entry"
                      checked={config.useManualTonneau}
                      onChange={(v) => update("useManualTonneau", v)}
                    />
                    {!config.useManualTonneau ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                          <select
                            value={selTonneauBrand}
                            onChange={(e) => { setSelTonneauBrand(e.target.value); update("tonneau", null); }}
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                          >
                            <option value="">Select Brand</option>
                            {tonneauBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                          <select
                            value={config.tonneau?.id || ""}
                            onChange={(e) => {
                              const t = findTonneau(e.target.value);
                              update("tonneau", t || null);
                            }}
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                            disabled={!selTonneauBrand}
                          >
                            <option value="">Select Model</option>
                            {tonneauModels.map((t) => (
                              <option key={t.id} value={t.id}>{t.model} ({t.weightLbs} lbs, {t.hasTSlots ? "T-Slot" : "No T-Slot"})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <NumberInput label="Weight" value={config.manualTonneau.weightLbs} onChange={(v) => setConfig((prev) => ({ ...prev, manualTonneau: { ...prev.manualTonneau, weightLbs: v } }))} unit="lbs" />
                        <NumberInput label="Folded Height" value={config.manualTonneau.foldedHeightIn} onChange={(v) => setConfig((prev) => ({ ...prev, manualTonneau: { ...prev.manualTonneau, foldedHeightIn: v } }))} unit="in" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Rack</h4>
              <Toggle
                label="Manual Entry"
                checked={config.useManualRack}
                onChange={(v) => update("useManualRack", v)}
              />
              {!config.useManualRack ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                    <select
                      value={selRackBrand}
                      onChange={(e) => { setSelRackBrand(e.target.value); update("rack", null); }}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                    >
                      <option value="">Select Brand</option>
                      {filteredRackBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                    <select
                      value={config.rack?.id || ""}
                      onChange={(e) => {
                        const r = findRack(e.target.value);
                        update("rack", r || null);
                        if (r?.heightSettings?.length) update("rackHeightSetting", r.heightSettings[0]);
                      }}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                      disabled={!selRackBrand}
                    >
                      <option value="">Select Model</option>
                      {filteredRackModels.map((r) => (
                        <option key={r.id} value={r.id}>{r.model} ({r.weightLbs} lbs)</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <NumberInput label="Rack Weight" value={config.manualRack.weightLbs} onChange={(v) => updateManualRack("weightLbs", v)} unit="lbs" />
                  <NumberInput label="Static Rating" value={config.manualRack.staticLbs} onChange={(v) => updateManualRack("staticLbs", v)} unit="lbs" />
                  <NumberInput label="On-Road Dynamic" value={config.manualRack.onRoadDynamicLbs} onChange={(v) => updateManualRack("onRoadDynamicLbs", v)} unit="lbs" />
                  <NumberInput label="Off-Road Dynamic" value={config.manualRack.offRoadDynamicLbs} onChange={(v) => updateManualRack("offRoadDynamicLbs", v)} unit="lbs" />
                  <NumberInput label="Rack Height" value={config.manualRack.heightIn} onChange={(v) => updateManualRack("heightIn", v)} unit="in" hint="Height above bed rail or roof" />
                </div>
              )}

              {config.rack && !config.useManualRack && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">Static</span>
                      <span className="font-bold">{config.rack.staticLbs} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">On-Road</span>
                      <span className="font-bold">{config.rack.onRoadDynamicLbs} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">Off-Road</span>
                      <span className="font-bold">{config.rack.offRoadDynamicLbs} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">Weight</span>
                      <span className="font-bold">{config.rack.weightLbs} lbs</span>
                    </div>
                  </div>

                  {config.rack.heightSettings && config.rack.heightSettings.length > 1 && (
                    <SelectInput
                      label="Height Setting"
                      value={String(config.rackHeightSetting ?? config.rack.heightSettings[0])}
                      onChange={(v) => update("rackHeightSetting", Number(v))}
                      options={config.rack.heightSettings.map((h) => ({
                        value: String(h),
                        label: `${h}" (${h <= 20 ? "Low" : h <= 25 ? "Mid" : "High"})`,
                      }))}
                    />
                  )}

                  {config.rack.notes && (
                    <p className="text-[10px] text-muted-foreground italic">{config.rack.notes}</p>
                  )}

                  <p className="text-[10px] text-muted-foreground">Ratings shown are manufacturer-published values. Actual capacity may vary by installation, condition, and use.</p>
                </div>
              )}
            </div>
          </div>
        </Section>

        <Section
          title="Rooftop Tent"
          icon={Tent}
          open={sections.tent}
          onToggle={() => toggleSection("tent")}
          badge={config.hasTent && config.tent ? `${config.tent.brand} ${config.tent.model}` : undefined}
        >
          <div className="px-4 space-y-4">
            <Toggle
              label="Add Rooftop Tent"
              checked={config.hasTent}
              onChange={(v) => update("hasTent", v)}
            />

            {config.hasTent && (
              <div className="space-y-4">
                <Toggle
                  label="Manual Entry"
                  checked={config.useManualTent}
                  onChange={(v) => update("useManualTent", v)}
                />

                {!config.useManualTent ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select
                          value={selTentBrand}
                          onChange={(e) => { setSelTentBrand(e.target.value); update("tent", null); }}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                        >
                          <option value="">Select Brand</option>
                          {tentBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select
                          value={config.tent?.id || ""}
                          onChange={(e) => {
                            const t = findTent(e.target.value);
                            update("tent", t || null);
                            if (t?.hasAnnex) {
                              update("annexWeightLbs", t.annexWeightLbs ?? 18);
                              update("annexSleeps", t.annexSleeps ?? 2);
                            }
                          }}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                          disabled={!selTentBrand}
                        >
                          <option value="">Select Model</option>
                          {tentModels.map((t) => (
                            <option key={t.id} value={t.id}>{t.model} ({t.closedWeightLbs} lbs, {t.type})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {config.tent && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-muted rounded-lg p-2">
                            <span className="text-muted-foreground block text-[10px] uppercase">Weight</span>
                            <span className="font-bold">{config.tent.closedWeightLbs} lbs</span>
                          </div>
                          <div className="bg-muted rounded-lg p-2">
                            <span className="text-muted-foreground block text-[10px] uppercase">Closed Height</span>
                            <span className="font-bold">{config.tent.closedHeightIn}&quot;</span>
                          </div>
                          <div className="bg-muted rounded-lg p-2">
                            <span className="text-muted-foreground block text-[10px] uppercase">Marketing Sleeps</span>
                            <span className="font-bold">{config.tent.sleepsMarketing}</span>
                          </div>
                          <div className="bg-muted rounded-lg p-2">
                            <span className="text-muted-foreground block text-[10px] uppercase">Realistic Sleeps</span>
                            <span className="font-bold text-primary">{config.tent.sleepsRealistic}</span>
                          </div>
                        </div>

                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs">
                            <span className="font-bold">Footprint:</span> {config.tent.closedLengthIn}&quot; x {config.tent.closedWidthIn}&quot; (closed)
                            {" / "}{config.tent.openLengthIn}&quot; x {config.tent.openWidthIn}&quot; (open)
                          </p>
                          <p className="text-xs mt-1">
                            <span className="font-bold">Headroom:</span> {config.tent.openHeadroomIn}&quot; | <span className="font-bold">Mattress:</span> {config.tent.mattressThicknessIn}&quot;
                          </p>
                        </div>

                        {config.tent.notes && (
                          <p className="text-[10px] text-muted-foreground italic">{config.tent.notes}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <NumberInput label="Weight" value={config.manualTent.weightLbs} onChange={(v) => updateManualTent("weightLbs", v)} unit="lbs" />
                    <NumberInput label="Closed Height" value={config.manualTent.closedHeightIn} onChange={(v) => updateManualTent("closedHeightIn", v)} unit="in" />
                    <NumberInput label="Closed Length" value={config.manualTent.closedLengthIn} onChange={(v) => updateManualTent("closedLengthIn", v)} unit="in" />
                    <NumberInput label="Closed Width" value={config.manualTent.closedWidthIn} onChange={(v) => updateManualTent("closedWidthIn", v)} unit="in" />
                    <NumberInput label="Open Width" value={config.manualTent.openWidthIn} onChange={(v) => updateManualTent("openWidthIn", v)} unit="in" />
                    <NumberInput label="Marketing Capacity" value={config.manualTent.sleepsMarketing} onChange={(v) => updateManualTent("sleepsMarketing", v)} />
                  </div>
                )}

                {config.hasTent && (config.tent?.hasAnnex || config.useManualTent) && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <Toggle
                      label="Add Annex"
                      checked={config.hasAnnex}
                      onChange={(v) => update("hasAnnex", v)}
                      hint="Annex weight does NOT count against rack load (ground-supported)"
                    />
                    {config.hasAnnex && (
                      <div className="pl-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <NumberInput label="Annex Weight" value={config.annexWeightLbs} onChange={(v) => update("annexWeightLbs", v)} unit="lbs" />
                        <NumberInput label="Annex Sleeps" value={config.annexSleeps} onChange={(v) => update("annexSleeps", v)} />
                        <SelectInput
                          label="Annex Side"
                          value={config.annexSide}
                          onChange={(v) => update("annexSide", v)}
                          options={[
                            { value: "passenger", label: "Passenger" },
                            { value: "driver", label: "Driver" },
                            { value: "rear", label: "Rear" },
                          ]}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>

        <Section
          title="Awning & Shelter"
          icon={Wind}
          open={sections.awning}
          onToggle={() => toggleSection("awning")}
          badge={config.hasAwning && config.awning ? `${config.awning.brand} ${config.awning.model}` : undefined}
        >
          <div className="px-4 space-y-4">
            <Toggle
              label="Add Awning"
              checked={config.hasAwning}
              onChange={(v) => update("hasAwning", v)}
            />

            {config.hasAwning && (
              <div className="space-y-4">
                <Toggle
                  label="Manual Entry"
                  checked={config.useManualAwning}
                  onChange={(v) => update("useManualAwning", v)}
                />

                {!config.useManualAwning ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select
                          value={selAwningBrand}
                          onChange={(e) => { setSelAwningBrand(e.target.value); update("awning", null); }}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                        >
                          <option value="">Select Brand</option>
                          {awningBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select
                          value={config.awning?.id || ""}
                          onChange={(e) => {
                            const a = findAwning(e.target.value);
                            update("awning", a || null);
                          }}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                          disabled={!selAwningBrand}
                        >
                          <option value="">Select Model</option>
                          {awningModels.map((a) => (
                            <option key={a.id} value={a.id}>{a.model} ({a.totalWeightLbs} lbs, {a.type})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {config.awning && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground block text-[10px] uppercase">Total Weight</span>
                          <span className="font-bold">{config.awning.totalWeightLbs} lbs</span>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground block text-[10px] uppercase">Bracket Weight</span>
                          <span className="font-bold">{config.awning.mountedBracketWeightLbs} lbs</span>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground block text-[10px] uppercase">Coverage</span>
                          <span className="font-bold">{config.awning.deployedCoverageSqFt} sq ft</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput label="Total Weight" value={config.manualAwning.totalWeightLbs} onChange={(v) => updateManualAwning("totalWeightLbs", v)} unit="lbs" />
                    <NumberInput label="Bracket Weight (on rack)" value={config.manualAwning.mountedBracketWeightLbs} onChange={(v) => updateManualAwning("mountedBracketWeightLbs", v)} unit="lbs" hint="Weight on rack when deployed" />
                  </div>
                )}

                <SelectInput
                  label="Mounting Side"
                  value={config.awningSide}
                  onChange={(v) => update("awningSide", v)}
                  options={[
                    { value: "driver", label: "Driver Side" },
                    { value: "passenger", label: "Passenger Side" },
                    { value: "rear", label: "Rear" },
                  ]}
                />

                <p className="text-[10px] text-muted-foreground italic">Most awning weight transfers to ground poles when deployed. Only bracket weight (~10-15 lbs) stays on rack.</p>

                {config.awning?.hasWallKit !== false && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <Toggle
                      label="Add Wall Kit"
                      checked={config.hasWallKit}
                      onChange={(v) => update("hasWallKit", v)}
                      hint="Walls create enclosed ground shelter for additional sleeping"
                    />
                    {config.hasWallKit && (
                      <div className="pl-6 grid grid-cols-2 gap-3">
                        <NumberInput label="Wall Kit Weight" value={config.wallKitWeightLbs} onChange={(v) => update("wallKitWeightLbs", v)} unit="lbs" />
                        <NumberInput label="Ground Sleeps" value={config.wallKitSleeps} onChange={(v) => update("wallKitSleeps", v)} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>

        <Section
          title="Cargo & Occupants"
          icon={Users}
          open={sections.cargo}
          onToggle={() => toggleSection("cargo")}
        >
          <div className="px-4 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Rack Cargo</h4>
                <button
                  onClick={addCargoItem}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              {config.cargoItems.length === 0 && (
                <p className="text-xs text-muted-foreground">No cargo items added. Recovery boards, roof box, solar panels, etc.</p>
              )}

              {config.cargoItems.map((item) => (
                <div key={item.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Item</label>
                    <input
                      type="text" value={item.name} placeholder="e.g. Recovery boards"
                      onChange={(e) => updateCargoItem(item.id, "name", e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">lbs</label>
                    <input
                      type="number" value={item.weightLbs || ""}
                      onChange={(e) => updateCargoItem(item.id, "weightLbs", Number(e.target.value))}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div className="w-16">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Qty</label>
                    <input
                      type="number" value={item.qty} min={1}
                      onChange={(e) => updateCargoItem(item.id, "qty", Number(e.target.value))}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => removeCargoItem(item.id)}
                    className="p-2 text-red-500 hover:text-red-400 transition-colors mb-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Occupants</h4>
              <p className="text-[10px] text-muted-foreground">Occupant weight counts against rack static budget (sleeping) and vehicle payload (always).</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <NumberInput label="Adults" value={config.occupants.adults} onChange={(v) => updateOccupants("adults", v)} min={0} max={8} />
                <NumberInput label="Avg Adult Weight" value={config.occupants.avgAdultLbs} onChange={(v) => updateOccupants("avgAdultLbs", v)} unit="lbs" />
                <NumberInput label="Kids/Teens" value={config.occupants.kids} onChange={(v) => updateOccupants("kids", v)} min={0} max={8} />
                <NumberInput label="Avg Kid Weight" value={config.occupants.avgKidLbs} onChange={(v) => updateOccupants("avgKidLbs", v)} unit="lbs" />
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Bedding (in tent)</h4>
              <SelectInput
                label="Bedding Level"
                value={config.beddingLevel}
                onChange={(v) => update("beddingLevel", v)}
                options={[
                  { value: "light", label: "Light (10 lbs/person)" },
                  { value: "full", label: "Full (20 lbs/person)" },
                  { value: "custom", label: "Custom" },
                ]}
              />
              {config.beddingLevel === "custom" && (
                <NumberInput label="Bedding Per Person" value={config.customBeddingLbsPerPerson} onChange={(v) => update("customBeddingLbsPerPerson", v)} unit="lbs" />
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Other</h4>
              <div className="grid grid-cols-2 gap-3">
                <NumberInput label="Garage Height" value={config.garageHeightIn} onChange={(v) => update("garageHeightIn", v)} unit="in" hint="84 = 7ft, 96 = 8ft" />
                <NumberInput label="Tongue Weight" value={config.tongueWeightLbs} onChange={(v) => update("tongueWeightLbs", v)} unit="lbs" hint="If towing a trailer" />
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Results Dashboard"
          icon={Ruler}
          open={sections.results}
          onToggle={() => toggleSection("results")}
          iconColor={overallLoadStatus === "red" ? "text-red-500" : overallLoadStatus === "yellow" ? "text-yellow-500" : "text-green-500"}
        >
          <div className="px-4 space-y-6">
            {result.safetyMarginStatus === "margin-warning" && (
              <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-500">
                  Always leave a 10-20% safety margin to prevent overload. One or more budgets are within the margin zone.
                </p>
              </div>
            )}
            {result.safetyMarginStatus === "over-limit" && (
              <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-3 flex gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-500 font-bold">
                  One or more load budgets are OVER LIMIT. Remove weight or upgrade equipment before use.
                </p>
              </div>
            )}

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-3">Rack Load Budgets</h4>
              <div className="grid grid-cols-3 gap-2">
                <GaugeArc
                  value={result.rackStatic.pct}
                  max={100}
                  label="Static"
                  unit="%"
                  size={110}
                  warningThreshold={70}
                  dangerThreshold={90}
                />
                <GaugeArc
                  value={result.rackOnRoad.pct}
                  max={100}
                  label="On-Road"
                  unit="%"
                  size={110}
                  warningThreshold={70}
                  dangerThreshold={90}
                />
                <GaugeArc
                  value={result.rackOffRoad.pct}
                  max={100}
                  label="Off-Road"
                  unit="%"
                  size={110}
                  warningThreshold={70}
                  dangerThreshold={90}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1">
                Off-road dynamic ratings assume moderate trail conditions. Extreme terrain imposes higher loads.
              </p>
            </div>

            <div className="space-y-3">
              <BudgetCard label="Static (Sleeping)" {...result.rackStatic} />
              <BudgetCard label="On-Road Dynamic (Highway)" {...result.rackOnRoad} />
              <BudgetCard label="Off-Road Dynamic (Trail)" {...result.rackOffRoad} />
              <BudgetCard label="Vehicle Payload (GVWR)" {...result.vehiclePayload} />
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Weakest Link Analysis</h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Static Limit</span>
                  <span className="font-bold">{result.weakestLink.staticLimit} lbs</span>
                  <span className="block text-[10px] text-muted-foreground">({result.weakestLink.staticBottleneck})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Dynamic Limit</span>
                  <span className="font-bold">{result.weakestLink.dynamicLimit} lbs</span>
                  <span className="block text-[10px] text-muted-foreground">({result.weakestLink.dynamicBottleneck})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Off-Road Limit</span>
                  <span className="font-bold">{result.weakestLink.offRoadLimit} lbs</span>
                  <span className="block text-[10px] text-muted-foreground">({result.weakestLink.offRoadBottleneck})</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">The lower rating between rack and vehicle roof is the effective limit.</p>
            </div>

            <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-4">
              <div className="flex-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Garage Clearance</h4>
                <p className="text-lg font-extrabold">{result.totalHeightIn}&quot;</p>
                <p className="text-xs text-muted-foreground">vs {result.garageHeightIn}&quot; garage</p>
              </div>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                result.garageFits
                  ? "bg-green-500/10 text-green-500 border border-green-500/30"
                  : "bg-red-500/10 text-red-500 border border-red-500/30"
              }`}>
                {result.garageFits ? "Fits" : "Won't Fit"}
              </span>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Sleeping Capacity</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Tent (Comfort)</span>
                  <span className="text-xl font-extrabold text-primary">{result.sleepingCapacity.tentComfort}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Tent (Tight)</span>
                  <span className="text-xl font-extrabold">{result.sleepingCapacity.tentTight}</span>
                </div>
                {result.sleepingCapacity.annexSleeps > 0 && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Annex</span>
                    <span className="text-xl font-extrabold">{result.sleepingCapacity.annexSleeps}</span>
                  </div>
                )}
                {result.sleepingCapacity.wallKitSleeps > 0 && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Wall Kit</span>
                    <span className="text-xl font-extrabold">{result.sleepingCapacity.wallKitSleeps}</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-bold">Total rig sleeping capacity: {result.sleepingCapacity.total}</p>
            </div>

            {result.cgRaiseIn > 0 && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Center of Gravity Impact</h4>
                <p className="text-sm">CG raised ~{result.cgRaiseIn}&quot;</p>
                <p className="text-xs text-muted-foreground mt-1">{result.stabilityNote}</p>
              </div>
            )}

            {!result.bedFitmentOk && (
              <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-yellow-500 mb-1">Bed Fitment</h4>
                <p className="text-xs">Tent overhangs bed by {result.bedOverhangIn}&quot;. Check cab/tailgate clearance.</p>
              </div>
            )}

            {result.weightBreakdown.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-3">Weight Breakdown</h4>
                <div className="flex flex-col items-center">
                  <DonutChart
                    segments={result.weightBreakdown}
                    totalLabel="Total Load"
                    totalValue={`${result.weightBreakdown.reduce((s, w) => s + w.value, 0)} lbs`}
                    size={180}
                  />
                  <ChartLegend segments={result.weightBreakdown} />
                </div>
              </div>
            )}

            <RigSafeSvg
              bodyType={bodyType}
              showTonneau={config.hasTonneau}
              showRack={true}
              showTent={config.hasTent}
              showAnnex={config.hasAnnex}
              showAwning={config.hasAwning}
              awningSide={config.awningSide}
              annexSide={config.annexSide}
              loadStatus={overallLoadStatus}
              totalHeightIn={result.totalHeightIn}
              vehicleHeightIn={activeVehicle?.overallHeightIn ?? 76}
            />

            {result.warnings.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Warnings & Notes</h4>
                <WarningsPanel warnings={result.warnings} />
              </div>
            )}

            {(config.rack || config.tent || config.awning) && (
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Product Links</h4>
                <div className="space-y-2">
                  {config.rack && (
                    <a
                      href={config.rack.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> {config.rack.brand} {config.rack.model}
                    </a>
                  )}
                  {config.tent && (
                    <a
                      href={config.tent.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> {config.tent.brand} {config.tent.model}
                    </a>
                  )}
                  {config.awning && (
                    <a
                      href={config.awning.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> {config.awning.brand} {config.awning.model}
                    </a>
                  )}
                  {config.tonneau && (
                    <a
                      href={config.tonneau.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> {config.tonneau.brand} {config.tonneau.model}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      <div className="flex justify-center gap-6">
        <button
          onClick={() => {
            const productLinks: { name: string; url: string }[] = [];
            if (config.rack) productLinks.push({ name: `${config.rack.brand} ${config.rack.model}`, url: config.rack.affiliateUrl });
            if (config.tent) productLinks.push({ name: `${config.tent.brand} ${config.tent.model}`, url: config.tent.affiliateUrl });
            if (config.awning) productLinks.push({ name: `${config.awning.brand} ${config.awning.model}`, url: config.awning.affiliateUrl });
            if (config.tonneau) productLinks.push({ name: `${config.tonneau.brand} ${config.tonneau.model}`, url: config.tonneau.affiliateUrl });

            const pdfData: RigSafePdfData = {
              vehicleName: config.vehicle ? `${config.vehicle.year} ${config.vehicle.make} ${config.vehicle.model} ${config.vehicle.trim}` : config.useManual ? `${config.manualVehicle.year} ${config.manualVehicle.make} ${config.manualVehicle.model}` : "",
              rackName: config.rack ? `${config.rack.brand} ${config.rack.model}` : "",
              tentName: config.tent ? `${config.tent.brand} ${config.tent.model}` : "",
              awningName: config.awning ? `${config.awning.brand} ${config.awning.model}` : "",
              tonneauName: config.tonneau ? `${config.tonneau.brand} ${config.tonneau.model}` : "",
              rackStatic: result.rackStatic,
              rackOnRoad: result.rackOnRoad,
              rackOffRoad: result.rackOffRoad,
              vehiclePayload: result.vehiclePayload,
              weakestLink: result.weakestLink,
              totalHeightIn: result.totalHeightIn,
              garageHeightIn: result.garageHeightIn,
              garageFits: result.garageFits,
              sleepingTotal: result.sleepingCapacity.total,
              cgRaiseIn: result.cgRaiseIn,
              stabilityNote: result.stabilityNote,
              warnings: result.warnings,
              weightBreakdown: result.weightBreakdown,
              productLinks,
            };
            generateRigSafePdf(pdfData);
          }}
          className="flex items-center gap-2 text-xs font-bold uppercase text-primary hover:text-primary/80 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export PDF
        </button>
        <button
          onClick={resetAll}
          className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground hover:text-red-500 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset All
        </button>
      </div>

      <DataPrivacyNotice />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolSocialShare
          url="https://prepperevolution.com/tools/rigsafe-configurator"
          toolName="RigSafe Overland Configurator"
        />
        <PrintQrCode url="https://prepperevolution.com/tools/rigsafe-configurator" />
        <InstallButton />
      </div>
    </div>
  );
}
