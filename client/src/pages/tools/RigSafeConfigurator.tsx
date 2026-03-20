
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Truck, ChevronDown, ChevronRight, AlertTriangle, Info,
  ShieldAlert, Tent, Wind, Package, Users, Bed, Ruler, Wrench,
  Plus, Trash2, Save, RotateCcw, ExternalLink, Download, Send,
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
import { getBumperBrands, getBumperModels, findBumper } from "./rigsafe-bumpers";
import { getWinchBrands, getWinchModels, findWinch } from "./rigsafe-winches";
import { getDrawerBrands, getDrawerModels, findDrawer } from "./rigsafe-drawers";
import { getFridgeBrands, getFridgeModels, findFridge } from "./rigsafe-fridges";
import { getWaterTankBrands, getWaterTankModels, findWaterTank } from "./rigsafe-water-tanks";
import { getSkidPlateBrands, getSkidPlateModels, findSkidPlate } from "./rigsafe-skidplates";
import { getSpareCarrierBrands, getSpareCarrierModels, findSpareCarrier } from "./rigsafe-spare-carriers";
import { getSolarBrands, getSolarModels, findSolar } from "./rigsafe-solar";
import { getLightBarBrands, getLightBarModels, findLightBar } from "./rigsafe-lightbars";
import { getKitchenBrands, getKitchenModels, findKitchen } from "./rigsafe-kitchens";
import { getRecoveryBrands, getRecoveryModels, findRecovery, recoveryDatabase } from "./rigsafe-recovery";
import { getCargoBoxBrands, getCargoBoxModels, findCargoBox } from "./rigsafe-cargo-boxes";
import {
  computeAll, computeVehicleModsWeight, defaultRigSafeConfig, RIGSAFE_KEY,
  RACK_CARGO_PRESETS,
  type RigSafeConfig, type RigSafeResult, type RigSafeWarning, type CargoItem,
} from "./rigsafe-compute";
// import RigSafeSvg, { vehicleToSilhouetteId } from "./RigSafeSvg";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import ToolSafetyDisclaimer from "@/components/tools/ToolSafetyDisclaimer";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import PrintQrCode from "@/components/tools/PrintQrCode";
import InstallButton from "@/components/tools/InstallButton";
import { generateRigSafePdf, type RigSafePdfData } from "@/components/tools/PdfExport";
import { trackEvent } from "@/lib/analytics";

// ─── SVG Gauge Component ─────────────────────────────────────────────

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

  let fillColor = "#10B981"; // green
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

// ─── Collapsible Section ─────────────────────────────────────────────

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

// ─── Budget Card ─────────────────────────────────────────────────────

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

// ─── Main Component ────────────────────────────────────────────────

export default function RigSafeConfigurator() {
  // ─── State ─────────────────────────────────────────────────────
  const [config, setConfig] = useState<RigSafeConfig>(defaultRigSafeConfig);
  const [loaded, setLoaded] = useState(false);

  // Section open state
  const [sections, setSections] = useState({
    vehicle: true,
    mounting: false,
    tent: false,
    awning: false,
    vehicleMods: false,
    cargo: false,
    occupants: false,
    results: true,
  });

  // Vehicle selector state
  const [selMake, setSelMake] = useState("");
  const [selModel, setSelModel] = useState("");
  const [selTrim, setSelTrim] = useState("");

  // Rack selector state
  const [selRackBrand, setSelRackBrand] = useState("");

  // Tent selector state
  const [selTentBrand, setSelTentBrand] = useState("");
  const [lightweightTentOnly, setLightweightTentOnly] = useState(false);

  // Awning selector state
  const [selAwningBrand, setSelAwningBrand] = useState("");

  // Tonneau selector state
  const [selTonneauBrand, setSelTonneauBrand] = useState("");

  // Vehicle mod selector states
  const [selBumperBrand, setSelBumperBrand] = useState("");
  const [selWinchBrand, setSelWinchBrand] = useState("");
  const [selDrawerBrand, setSelDrawerBrand] = useState("");
  const [selFridgeBrand, setSelFridgeBrand] = useState("");
  const [selWaterTankBrand, setSelWaterTankBrand] = useState("");
  const [selSkidPlateBrand, setSelSkidPlateBrand] = useState("");
  const [selSpareCarrierBrand, setSelSpareCarrierBrand] = useState("");
  const [selSolarBrand, setSelSolarBrand] = useState("");
  const [selLightBarBrand, setSelLightBarBrand] = useState("");
  const [selKitchenBrand, setSelKitchenBrand] = useState("");

  // Cargo box selector state
  const [selCargoBoxBrand, setSelCargoBoxBrand] = useState("");

  // Secondary rack (cab roof rack) selector state
  const [selSecondaryRackBrand, setSelSecondaryRackBrand] = useState("");

  // Profile import banner
  const [profileAvailable, setProfileAvailable] = useState(false);
  const [profileImported, setProfileImported] = useState(false);

  // Request form state
  const [reqForm, setReqForm] = useState({ make: "", model: "", year: "", trim: "", bodyType: "", notes: "", email: "" });
  const [reqStatus, setReqStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // ─── Load from localStorage ──────────────────────────────────────
  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "rigsafe" });
    try {
      const saved = localStorage.getItem(RIGSAFE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as RigSafeConfig;
        setConfig({ ...defaultRigSafeConfig, ...parsed });
      }
    } catch { /* ignore */ }

    // Check for vehicle profile
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
      localStorage.setItem(RIGSAFE_KEY, JSON.stringify(config));
    } catch { /* ignore */ }
  }, [config, loaded]);

  // ─── Import from Vehicle Profile ─────────────────────────────
  const importFromProfile = useCallback(() => {
    try {
      const raw = localStorage.getItem(VEHICLE_PROFILE_KEY);
      if (!raw) return;
      const vp = JSON.parse(raw);
      // Find matching stock vehicle
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

  // ─── Update config helper ──────────────────────────────────────
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

  const updateManualSecondaryRack = useCallback((key: string, value: number) => {
    setConfig((prev) => ({
      ...prev,
      manualSecondaryRack: { ...prev.manualSecondaryRack, [key]: value },
    }));
  }, []);

  const updateOccupants = useCallback((key: string, value: number) => {
    setConfig((prev) => ({
      ...prev,
      occupants: { ...prev.occupants, [key]: value },
    }));
  }, []);

  // ─── Cargo items ──────────────────────────────────────────────
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

  // ─── Vehicle selection ────────────────────────────────────────
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
      trackEvent("pe_vehicle_selected", { tool: "rigsafe", vehicle: [selMake, selModel, trim].join(" ") });
      update("vehicle", stock);
      update("useManual", false);
      // Default mount type based on body type
      const isTruck = stock.bodyType.includes("cab") || stock.bodyType === "mid-truck";
      update("mountType", isTruck ? "bed-rack" : "roof-rack");
    }
  }, [selMake, selModel, update]);

  // ─── Computed results ──────────────────────────────────────────
  const result = useMemo<RigSafeResult>(() => computeAll(config), [config]);

  // ─── Derived values ──────────────────────────────────────────
  const activeVehicle = config.useManual ? config.manualVehicle : config.vehicle;
  const bodyType: BodyType = activeVehicle
    ? ("bodyType" in activeVehicle ? activeVehicle.bodyType : "crew-cab-short")
    : "crew-cab-short";
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";

  const overallLoadStatus: "green" | "yellow" | "red" =
    result.safetyMarginStatus === "over-limit" ? "red" :
    result.safetyMarginStatus === "margin-warning" ? "yellow" : "green";

  // ─── Toggle section ──────────────────────────────────────────
  const toggleSection = useCallback((key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ─── Reset ────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    setConfig(defaultRigSafeConfig);
    setSelMake("");
    setSelModel("");
    setSelTrim("");
    setSelRackBrand("");
    setSelTentBrand("");
    setSelAwningBrand("");
    setSelTonneauBrand("");
    setSelBumperBrand("");
    setSelWinchBrand("");
    setSelDrawerBrand("");
    setSelFridgeBrand("");
    setSelWaterTankBrand("");
    setSelSkidPlateBrand("");
    setSelSpareCarrierBrand("");
    setSelSolarBrand("");
    setSelLightBarBrand("");
    setSelKitchenBrand("");
    setSelCargoBoxBrand("");
    setProfileImported(false);
    try { localStorage.removeItem(RIGSAFE_KEY); } catch { /* ignore */ }
  }, []);

  if (!loaded) return null;

  // ─── Dropdown data ───────────────────────────────────────────
  const makes = getUniqueMakes();
  const models = selMake ? getModelsForMake(selMake) : [];
  const trims = selMake && selModel ? getTrimsForModel(selMake, selModel) : [];

  const rackType = config.mountType;
  const filteredRackBrands = getRackBrands(rackType);
  const filteredRackModels = selRackBrand ? getRackModels(selRackBrand, rackType) : [];

  const secondaryRackBrands = getRackBrands("roof-rack");
  const secondaryRackModels = selSecondaryRackBrand ? getRackModels(selSecondaryRackBrand, "roof-rack") : [];

  const LIGHTWEIGHT_LBS = 100;
  const tentBrands = lightweightTentOnly
    ? getTentBrands().filter((b) => tentDatabase.some((t) => t.brand === b && t.closedWeightLbs > 0 && t.closedWeightLbs < LIGHTWEIGHT_LBS))
    : getTentBrands();
  const tentModels = selTentBrand
    ? getTentModels(selTentBrand).filter((t) => !lightweightTentOnly || (t.closedWeightLbs > 0 && t.closedWeightLbs < LIGHTWEIGHT_LBS))
    : [];

  const awningBrands = getAwningBrands();
  const awningModels = selAwningBrand ? getAwningModels(selAwningBrand) : [];

  const tonneauBrands = getTonneauBrands();
  const tonneauModels = selTonneauBrand ? getTonneauModels(selTonneauBrand) : [];

  return (
    <div className="space-y-6">
      {/* Tool Title */}
      <div>
        <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Ops Deck</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold">RigSafe Overland <span className="text-primary">Configurator</span></h2>
      </div>

      {/* Safety Disclaimer */}
      <ToolSafetyDisclaimer level="safety-critical" />

      {/* How This Tool Works */}
      <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-extrabold mb-3">How This Tool Works</h3>
        <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-3">
          <p>
            Start with your rig&apos;s factory specs, then pile on your gear &mdash; roof rack, bumpers, winch, skid plates, the whole build list. We calculate your real remaining payload, center of gravity shift, and safety margins in real time. Every pound counts and this tool makes sure you see where you stand before the suspension tells you the hard way.
          </p>
          <p>
            <strong className="text-foreground">Bottom line:</strong> overloading your rig isn&apos;t just hard on parts &mdash; it&apos;s a safety issue. This configurator keeps your build honest so you can load up with confidence and hit the trail knowing the numbers check out.
          </p>
        </div>
      </div>

      {/* Vehicle Profile Import Banner */}
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

      {/* Main config card */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">

        {/* ─── Section 1: Vehicle Setup ─────────────────────────── */}
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
                {/* Make/Model/Trim dropdowns */}
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
                      <span className="text-muted block text-[10px] uppercase">Curb Weight</span>
                      <span className="font-bold">{config.vehicle.curbWeightLbs.toLocaleString()} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted block text-[10px] uppercase">GVWR</span>
                      <span className="font-bold">{config.vehicle.gvwrLbs.toLocaleString()} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted block text-[10px] uppercase">Payload</span>
                      <span className="font-bold">{(config.vehicle.gvwrLbs - config.vehicle.curbWeightLbs).toLocaleString()} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted block text-[10px] uppercase">Roof Dynamic</span>
                      <span className="font-bold">{config.vehicle.roofDynamicLbs} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted block text-[10px] uppercase">Height</span>
                      <span className="font-bold">{config.vehicle.overallHeightIn}&quot;</span>
                    </div>
                    {config.vehicle.bedLengthIn && (
                      <div className="bg-muted rounded-lg p-2">
                        <span className="text-muted block text-[10px] uppercase">Bed Length</span>
                        <span className="font-bold">{config.vehicle.bedLengthIn}&quot;</span>
                      </div>
                    )}
                    <div className="bg-muted rounded-lg p-2">
                      <span className="text-muted block text-[10px] uppercase">Body Type</span>
                      <span className="font-bold">{config.vehicle.bodyType}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Manual entry fields */
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

        {/* ─── Section 2: Mounting Configuration ────────────────── */}
        <Section
          title="Mounting Configuration"
          icon={Package}
          open={sections.mounting}
          onToggle={() => toggleSection("mounting")}
          badge={config.rack ? `${config.rack.brand} ${config.rack.model}` : undefined}
        >
          <div className="px-4 space-y-4">
            {/* Tonneau (trucks only — shown first so rack details stay grouped) */}
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

            {/* Mount type */}
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

            {/* Rack selector */}
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

              {/* Rack details (when selected from DB) */}
              {config.rack && !config.useManualRack && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-muted rounded-lg p-2.5">
                      <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Static Rating</span>
                      <span className="font-extrabold text-sm">{config.rack.staticLbs} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2.5">
                      <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">On-Road Dynamic</span>
                      <span className="font-extrabold text-sm">{config.rack.onRoadDynamicLbs} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2.5">
                      <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Off-Road Dynamic</span>
                      <span className="font-extrabold text-sm">{config.rack.offRoadDynamicLbs} lbs</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2.5">
                      <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Product Weight</span>
                      <span className="font-extrabold text-sm">{config.rack.weightLbs} lbs</span>
                    </div>
                  </div>

                  {/* Height setting selector */}
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

                  {/* T-slot tonneau warning */}
                  {config.rack.tSlotRequired && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-amber-300">T-Slot Tonneau Required</p>
                        <p className="text-[11px] text-amber-200/80">
                          This rack mounts to T-tracks in your tonneau cover (e.g. BAKFlip MX4 TS, ReTrax OneXT). Not all tonneaus have T-slots — verify yours does before ordering.
                        </p>
                        {!config.useManual && config.vehicle && config.vehicle.year < 2015 && (
                          <p className="text-[11px] text-amber-200/80">
                            Heads up: T-slot tonneaus are available aftermarket for your {config.vehicle.year} {config.vehicle.make} {config.vehicle.model} but were not factory-standard on this generation. Confirm you have one installed or budget for an upgrade (~$400–$900).
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground">Ratings shown are manufacturer-published values. Actual capacity may vary by installation, condition, and use.</p>
                </div>
              )}
            </div>

            {/* Secondary Rack (Cab Roof Rack) — trucks with bed rack only */}
            {config.mountType === "bed-rack" && (
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Secondary Rack (Cab Roof Rack)</h4>
                <Toggle
                  label="I have a cab roof rack installed"
                  checked={config.hasSecondaryRack}
                  onChange={(v) => update("hasSecondaryRack", v)}
                  hint="Required for cab clearance calculation when using an RTT on a bed rack"
                />

                {config.hasSecondaryRack && (
                  <div className="space-y-3">
                    <Toggle
                      label="Manual Entry"
                      checked={config.useManualSecondaryRack}
                      onChange={(v) => update("useManualSecondaryRack", v)}
                    />

                    {!config.useManualSecondaryRack ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                            <select
                              value={selSecondaryRackBrand}
                              onChange={(e) => { setSelSecondaryRackBrand(e.target.value); update("secondaryRack", null); }}
                              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                            >
                              <option value="">Select Brand</option>
                              {secondaryRackBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                            <select
                              value={config.secondaryRack?.id || ""}
                              onChange={(e) => {
                                const r = findRack(e.target.value);
                                update("secondaryRack", r || null);
                              }}
                              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                              disabled={!selSecondaryRackBrand}
                            >
                              <option value="">Select Model</option>
                              {secondaryRackModels.map((r) => (
                                <option key={r.id} value={r.id}>{r.model} ({r.weightLbs} lbs)</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {config.secondaryRack && (
                          <p className="text-[10px] text-muted-foreground italic">
                            Crossbar height: {(config.secondaryRack as any).crossbarHeightAboveRoofIn ?? 3}&quot; above roof surface
                            {config.secondaryRack.notes && ` — ${config.secondaryRack.notes}`}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <NumberInput
                          label="Rack Weight"
                          value={config.manualSecondaryRack.weightLbs}
                          onChange={(v) => updateManualSecondaryRack("weightLbs", v)}
                          unit="lbs"
                        />
                        <NumberInput
                          label="Crossbar Height Above Roof"
                          value={config.manualSecondaryRack.heightIn}
                          onChange={(v) => updateManualSecondaryRack("heightIn", v)}
                          unit="in"
                          hint="Vertical distance from cab roof surface to top of crossbar"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* ─── Section 3: Rooftop Tent ────────────────────────── */}
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
                    <button
                      type="button"
                      onClick={() => {
                        setLightweightTentOnly(!lightweightTentOnly);
                        setSelTentBrand("");
                        update("tent", null);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        lightweightTentOnly
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:border-primary"
                      }`}
                    >
                      ⚡ Lightweight only (&lt;100 lbs)
                    </button>
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
                          <div className="bg-muted rounded-lg p-2.5">
                            <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Tent Weight</span>
                            <span className="font-extrabold text-sm">{config.tent.closedWeightLbs} lbs</span>
                          </div>
                          <div className="bg-muted rounded-lg p-2.5">
                            <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Closed Height</span>
                            <span className="font-extrabold text-sm">{config.tent.closedHeightIn}&quot;</span>
                          </div>
                          <div className="bg-muted rounded-lg p-2.5">
                            <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Marketing Sleeps</span>
                            <span className="font-extrabold text-sm">{config.tent.sleepsMarketing}</span>
                          </div>
                          <div className="bg-muted rounded-lg p-2.5">
                            <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Realistic Sleeps</span>
                            <span className="font-extrabold text-sm text-primary">{config.tent.sleepsRealistic}</span>
                          </div>
                        </div>

                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs">
                            <span className="text-primary font-bold">Footprint:</span> {config.tent.closedLengthIn}&quot; x {config.tent.closedWidthIn}&quot; (closed)
                            {" / "}{config.tent.openLengthIn}&quot; x {config.tent.openWidthIn}&quot; (open)
                          </p>
                          <p className="text-xs mt-1">
                            <span className="text-primary font-bold">Headroom:</span> {config.tent.openHeadroomIn}&quot; | <span className="text-primary font-bold">Mattress:</span> {config.tent.mattressThicknessIn}&quot;
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

                {/* Tent Annex */}
                {config.hasTent && (config.tent?.hasAnnex || config.useManualTent) && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Tent Annex</h4>
                    <Toggle
                      label={config.tent?.annexName ? `Add ${config.tent.annexName}` : "Add Tent Annex"}
                      checked={config.hasAnnex}
                      onChange={(v) => update("hasAnnex", v)}
                      hint="Annex weight does NOT count against rack load (ground-supported) but counts toward vehicle payload"
                    />
                    {config.hasAnnex && (
                      <div className="pl-6 space-y-3">
                        {/* Show matched annex details when tent is from DB */}
                        {config.tent?.hasAnnex && !config.useManualTent && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-muted rounded-lg p-2.5">
                              <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Annex Weight</span>
                              <span className="font-extrabold text-sm">{config.annexWeightLbs} lbs</span>
                            </div>
                            <div className="bg-muted rounded-lg p-2.5">
                              <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Sleeps</span>
                              <span className="font-extrabold text-sm">{config.annexSleeps}</span>
                            </div>
                            {config.tent.annexAffiliateUrl && (
                              <div className="flex items-center">
                                <a
                                  href={config.tent.annexAffiliateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3" /> View on Amazon
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Manual entry for custom tents */}
                        {config.useManualTent && (
                          <div className="grid grid-cols-2 gap-3">
                            <NumberInput label="Annex Weight" value={config.annexWeightLbs} onChange={(v) => update("annexWeightLbs", v)} unit="lbs" />
                            <NumberInput label="Annex Sleeps" value={config.annexSleeps} onChange={(v) => update("annexSleeps", v)} />
                          </div>
                        )}
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

        {/* ─── Section 4: Awning & Shelter ────────────────────── */}
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
                        <div className="bg-muted rounded-lg p-2.5">
                          <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Total Weight</span>
                          <span className="font-extrabold text-sm">{config.awning.totalWeightLbs} lbs</span>
                        </div>
                        <div className="bg-muted rounded-lg p-2.5">
                          <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Bracket Weight</span>
                          <span className="font-extrabold text-sm">{config.awning.mountedBracketWeightLbs} lbs</span>
                        </div>
                        <div className="bg-muted rounded-lg p-2.5">
                          <span className="text-primary block text-[10px] font-bold uppercase tracking-wide mb-0.5">Coverage</span>
                          <span className="font-extrabold text-sm">{config.awning.deployedCoverageSqFt} sq ft</span>
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

                {/* Awning Annex (Wall Kit) */}
                {config.awning?.hasWallKit !== false && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Awning Annex</h4>
                    <Toggle
                      label="Add Awning Wall Kit"
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

        {/* ─── Section 5: Vehicle Mods ──────────────────────── */}
        <Section
          title="Vehicle Mods"
          icon={Wrench}
          open={sections.vehicleMods}
          onToggle={() => toggleSection("vehicleMods")}
          badge={result.vehicleModsWeightLbs > 0 ? `${result.vehicleModsWeightLbs} lbs` : undefined}
        >
          <div className="px-4 space-y-6">
            <p className="text-[10px] text-muted-foreground">
              Heavy bolt-ons that eat payload before you load the roof. These deduct from your vehicle payload budget.
            </p>

            {/* ── Group 1: Armor & Recovery ─── */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border pb-1">Armor & Recovery</h4>

              {/* Front Bumper */}
              <Toggle label="Front Bumper" checked={config.hasFrontBumper} onChange={(v) => update("hasFrontBumper", v)} />
              {config.hasFrontBumper && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualBumpers} onChange={(v) => update("useManualBumpers", v)} hint="Enter weight manually" />
                  {!config.useManualBumpers ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selBumperBrand} onChange={(e) => { setSelBumperBrand(e.target.value); update("frontBumper", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getBumperBrands("front").map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.frontBumper?.id ?? ""} onChange={(e) => { const b = findBumper(e.target.value); if (b) update("frontBumper", b); }} disabled={!selBumperBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getBumperModels(selBumperBrand, "front").map((b) => <option key={b.id} value={b.id}>{b.model} ({b.weightLbs} lbs)</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <NumberInput label="Front Bumper Weight" value={config.manualBumperWeightLbs.front} onChange={(v) => update("manualBumperWeightLbs", { ...config.manualBumperWeightLbs, front: v })} unit="lbs" />
                  )}
                </div>
              )}

              {/* Rear Bumper */}
              <Toggle label="Rear Bumper" checked={config.hasRearBumper} onChange={(v) => update("hasRearBumper", v)} />
              {config.hasRearBumper && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualBumpers} onChange={(v) => update("useManualBumpers", v)} hint="Enter weight manually" />
                  {!config.useManualBumpers ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selBumperBrand} onChange={(e) => { setSelBumperBrand(e.target.value); update("rearBumper", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getBumperBrands("rear").map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.rearBumper?.id ?? ""} onChange={(e) => { const b = findBumper(e.target.value); if (b) update("rearBumper", b); }} disabled={!selBumperBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getBumperModels(selBumperBrand, "rear").map((b) => <option key={b.id} value={b.id}>{b.model} ({b.weightLbs} lbs)</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <NumberInput label="Rear Bumper Weight" value={config.manualBumperWeightLbs.rear} onChange={(v) => update("manualBumperWeightLbs", { ...config.manualBumperWeightLbs, rear: v })} unit="lbs" />
                  )}
                </div>
              )}

              {/* Winch */}
              <Toggle label="Winch" checked={config.hasWinch} onChange={(v) => update("hasWinch", v)} />
              {config.hasWinch && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualWinch} onChange={(v) => update("useManualWinch", v)} hint="Enter weight manually" />
                  {!config.useManualWinch ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selWinchBrand} onChange={(e) => { setSelWinchBrand(e.target.value); update("winch", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getWinchBrands().map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.winch?.id ?? ""} onChange={(e) => { const w = findWinch(e.target.value); if (w) update("winch", w); }} disabled={!selWinchBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getWinchModels(selWinchBrand).map((w) => <option key={w.id} value={w.id}>{w.model} ({w.weightLbs} lbs, {w.pullCapacityLbs.toLocaleString()} lb pull)</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <NumberInput label="Winch Weight" value={config.manualWinchWeightLbs} onChange={(v) => update("manualWinchWeightLbs", v)} unit="lbs" />
                  )}
                </div>
              )}

              {/* Skid Plates */}
              <Toggle label="Skid Plates" checked={config.hasSkidPlates} onChange={(v) => update("hasSkidPlates", v)} />
              {config.hasSkidPlates && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualSkidPlates} onChange={(v) => update("useManualSkidPlates", v)} hint="Enter weight manually" />
                  {!config.useManualSkidPlates ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selSkidPlateBrand} onChange={(e) => { setSelSkidPlateBrand(e.target.value); update("skidPlates", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getSkidPlateBrands().map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.skidPlates?.id ?? ""} onChange={(e) => { const s = findSkidPlate(e.target.value); if (s) update("skidPlates", s); }} disabled={!selSkidPlateBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getSkidPlateModels(selSkidPlateBrand).map((s) => <option key={s.id} value={s.id}>{s.model} ({s.weightLbs} lbs, {s.coverage})</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <NumberInput label="Skid Plates Weight" value={config.manualSkidPlateWeightLbs} onChange={(v) => update("manualSkidPlateWeightLbs", v)} unit="lbs" />
                  )}
                </div>
              )}
            </div>

            {/* ── Group 2: Storage & Camp ─── */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border pb-1">Storage & Camp</h4>

              {/* Drawer System */}
              <Toggle label="Drawer System" checked={config.hasDrawers} onChange={(v) => update("hasDrawers", v)} />
              {config.hasDrawers && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualDrawers} onChange={(v) => update("useManualDrawers", v)} hint="Enter weight manually" />
                  {!config.useManualDrawers ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selDrawerBrand} onChange={(e) => { setSelDrawerBrand(e.target.value); update("drawers", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getDrawerBrands().map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.drawers?.id ?? ""} onChange={(e) => { const d = findDrawer(e.target.value); if (d) update("drawers", d); }} disabled={!selDrawerBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getDrawerModels(selDrawerBrand).map((d) => <option key={d.id} value={d.id}>{d.model} ({d.weightLbs} lbs)</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <NumberInput label="Drawer Weight" value={config.manualDrawerWeightLbs} onChange={(v) => update("manualDrawerWeightLbs", v)} unit="lbs" />
                  )}
                </div>
              )}

              {/* Fridge/Freezer */}
              <Toggle label="Fridge / Freezer" checked={config.hasFridge} onChange={(v) => update("hasFridge", v)} />
              {config.hasFridge && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualFridge} onChange={(v) => update("useManualFridge", v)} hint="Enter weight manually" />
                  {!config.useManualFridge ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selFridgeBrand} onChange={(e) => { setSelFridgeBrand(e.target.value); update("fridge", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getFridgeBrands().map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.fridge?.id ?? ""} onChange={(e) => { const f = findFridge(e.target.value); if (f) update("fridge", f); }} disabled={!selFridgeBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getFridgeModels(selFridgeBrand).map((f) => <option key={f.id} value={f.id}>{f.model} ({f.weightLbs} lbs, {f.capacityQts} qt)</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <NumberInput label="Fridge Weight" value={config.manualFridgeWeightLbs} onChange={(v) => update("manualFridgeWeightLbs", v)} unit="lbs" />
                  )}
                </div>
              )}

              {/* Slide-Out Kitchen */}
              <Toggle label="Slide-Out Kitchen" checked={config.hasSlideKitchen} onChange={(v) => update("hasSlideKitchen", v)} />
              {config.hasSlideKitchen && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualKitchen} onChange={(v) => update("useManualKitchen", v)} hint="Enter weight manually" />
                  {!config.useManualKitchen ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selKitchenBrand} onChange={(e) => { setSelKitchenBrand(e.target.value); update("slideKitchen", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getKitchenBrands().map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.slideKitchen?.id ?? ""} onChange={(e) => { const k = findKitchen(e.target.value); if (k) update("slideKitchen", k); }} disabled={!selKitchenBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getKitchenModels(selKitchenBrand).map((k) => <option key={k.id} value={k.id}>{k.model} ({k.weightLbs} lbs)</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <NumberInput label="Kitchen Weight" value={config.manualKitchenWeightLbs} onChange={(v) => update("manualKitchenWeightLbs", v)} unit="lbs" />
                  )}
                </div>
              )}

              {/* Water Tank */}
              <Toggle label="Water Tank" checked={config.hasWaterTank} onChange={(v) => update("hasWaterTank", v)} />
              {config.hasWaterTank && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualWaterTank} onChange={(v) => update("useManualWaterTank", v)} hint="Enter weight manually" />
                  {!config.useManualWaterTank ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selWaterTankBrand} onChange={(e) => { setSelWaterTankBrand(e.target.value); update("waterTank", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getWaterTankBrands().map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.waterTank?.id ?? ""} onChange={(e) => { const t = findWaterTank(e.target.value); if (t) update("waterTank", t); }} disabled={!selWaterTankBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getWaterTankModels(selWaterTankBrand).map((t) => <option key={t.id} value={t.id}>{t.model} ({t.capacityGal} gal, {t.emptyWeightLbs} lbs empty)</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <NumberInput label="Empty Weight" value={config.manualWaterTank.emptyWeightLbs} onChange={(v) => update("manualWaterTank", { ...config.manualWaterTank, emptyWeightLbs: v })} unit="lbs" />
                      <NumberInput label="Capacity" value={config.manualWaterTank.capacityGal} onChange={(v) => update("manualWaterTank", { ...config.manualWaterTank, capacityGal: v })} unit="gal" />
                    </div>
                  )}
                  {/* Fill % slider */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                      Fill Level: {config.waterTankFillPct}%
                    </label>
                    <input
                      type="range" min={0} max={100} step={5}
                      value={config.waterTankFillPct}
                      onChange={(e) => update("waterTankFillPct", Number(e.target.value))}
                      className="w-full accent-accent"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Empty</span>
                      <span>Full</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Group 3: Electrical & Lighting ─── */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border pb-1">Electrical & Lighting</h4>

              {/* Solar Panels */}
              <Toggle label="Solar Panels" checked={config.hasSolar} onChange={(v) => update("hasSolar", v)} hint="Roof-rack or bed-rack mounted panels also count against rack load" />
              {config.hasSolar && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualSolar} onChange={(v) => update("useManualSolar", v)} hint="Enter weight manually" />
                  {!config.useManualSolar ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selSolarBrand} onChange={(e) => { setSelSolarBrand(e.target.value); update("solarPanels", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getSolarBrands().map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.solarPanels?.id ?? ""} onChange={(e) => { const s = findSolar(e.target.value); if (s) update("solarPanels", s); }} disabled={!selSolarBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getSolarModels(selSolarBrand).map((s) => <option key={s.id} value={s.id}>{s.model} ({s.watts}W, {s.weightLbs} lbs)</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <NumberInput label="Solar Panel Weight" value={config.manualSolarWeightLbs} onChange={(v) => update("manualSolarWeightLbs", v)} unit="lbs" />
                  )}
                </div>
              )}

              {/* Light Bar */}
              <Toggle label="Light Bar" checked={config.hasLightBar} onChange={(v) => update("hasLightBar", v)} hint="Roof-rack mounted bars also count against rack load" />
              {config.hasLightBar && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualLightBar} onChange={(v) => update("useManualLightBar", v)} hint="Enter weight manually" />
                  {!config.useManualLightBar ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selLightBarBrand} onChange={(e) => { setSelLightBarBrand(e.target.value); update("lightBar", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getLightBarBrands().map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.lightBar?.id ?? ""} onChange={(e) => { const l = findLightBar(e.target.value); if (l) update("lightBar", l); }} disabled={!selLightBarBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getLightBarModels(selLightBarBrand).map((l) => <option key={l.id} value={l.id}>{l.model} ({l.lengthIn}", {l.weightLbs} lbs)</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <NumberInput label="Light Bar Weight" value={config.manualLightBarWeightLbs} onChange={(v) => update("manualLightBarWeightLbs", v)} unit="lbs" />
                  )}
                </div>
              )}
            </div>

            {/* ── Group 4: Carry ─── */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border pb-1">Carry</h4>

              {/* Spare Tire Carrier */}
              <Toggle label="Spare Tire Carrier" checked={config.hasSpareCarrier} onChange={(v) => update("hasSpareCarrier", v)} />
              {config.hasSpareCarrier && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualSpareCarrier} onChange={(v) => update("useManualSpareCarrier", v)} hint="Enter weight manually" />
                  {!config.useManualSpareCarrier ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Brand</label>
                        <select value={selSpareCarrierBrand} onChange={(e) => { setSelSpareCarrierBrand(e.target.value); update("spareCarrier", null); }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors">
                          <option value="">Select Brand</option>
                          {getSpareCarrierBrands().map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model</label>
                        <select value={config.spareCarrier?.id ?? ""} onChange={(e) => { const c = findSpareCarrier(e.target.value); if (c) update("spareCarrier", c); }} disabled={!selSpareCarrierBrand} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors disabled:opacity-40">
                          <option value="">Select Model</option>
                          {getSpareCarrierModels(selSpareCarrierBrand).map((c) => <option key={c.id} value={c.id}>{c.model} ({c.carrierWeightLbs} lbs)</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <NumberInput label="Carrier Weight" value={config.manualSpareCarrierWeightLbs} onChange={(v) => update("manualSpareCarrierWeightLbs", v)} unit="lbs" />
                  )}
                  <NumberInput label="Spare Tire Weight" value={config.spareTireWeightLbs} onChange={(v) => update("spareTireWeightLbs", v)} unit="lbs" hint="Weight of the spare tire itself" />
                </div>
              )}

              {/* Recovery Gear */}
              <Toggle label="Recovery Gear" checked={config.hasRecoveryGear} onChange={(v) => update("hasRecoveryGear", v)} />
              {config.hasRecoveryGear && (
                <div className="pl-4 space-y-3">
                  <Toggle label="Manual Entry" checked={config.useManualRecovery} onChange={(v) => update("useManualRecovery", v)} hint="Enter total weight manually instead of selecting items" />
                  {!config.useManualRecovery ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground">Select recovery items you carry:</p>
                      {recoveryDatabase.map((item) => {
                        const isSelected = config.recoveryGear.some((g) => g.id === item.id);
                        return (
                          <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  update("recoveryGear", [...config.recoveryGear, item]);
                                } else {
                                  update("recoveryGear", config.recoveryGear.filter((g) => g.id !== item.id));
                                }
                              }}
                              className="accent-accent"
                            />
                            <span className="text-xs group-hover:text-primary transition-colors">
                              {item.brand} {item.model} ({item.weightLbs} lbs)
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <NumberInput label="Total Recovery Gear Weight" value={config.manualRecoveryWeightLbs} onChange={(v) => update("manualRecoveryWeightLbs", v)} unit="lbs" />
                  )}
                </div>
              )}
            </div>

            {/* ── Running Total ─── */}
            {result.vehicleModsWeightLbs > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide">Vehicle Mods Total</span>
                  <span className="text-lg font-extrabold">{result.vehicleModsWeightLbs} lbs</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {result.vehiclePayload.rating > 0
                    ? `${Math.round((result.vehicleModsWeightLbs / result.vehiclePayload.rating) * 100)}% of payload used before roof load`
                    : "Select a vehicle to see payload impact"}
                </p>
              </div>
            )}
          </div>
        </Section>

        {/* ─── Section 6: Additional Load ─────────────────────── */}
        <Section
          title="Cargo & Occupants"
          icon={Users}
          open={sections.cargo}
          onToggle={() => toggleSection("cargo")}
        >
          <div className="px-4 space-y-6">
            {/* Rack Cargo Header with total */}
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Rack Cargo</h4>
              <p className="text-xs text-muted-foreground">
                Total rack cargo:{" "}
                <span className="font-bold text-foreground">
                  {(() => {
                    const presetW = config.rackPresets.reduce((sum, id) => {
                      const p = RACK_CARGO_PRESETS.find(pr => pr.id === id);
                      return sum + (p?.weightLbs ?? 0);
                    }, 0);
                    let boxW = 0;
                    if (config.hasCargoBox) {
                      boxW += config.useManualCargoBox ? config.manualCargoBoxWeightLbs : (config.cargoBox?.weightLbs ?? 0);
                      boxW += config.cargoBoxContentsLbs;
                    }
                    const customW = config.cargoItems.reduce((sum, i) => sum + i.weightLbs * i.qty, 0);
                    return presetW + boxW + customW;
                  })()}{" "}
                  lbs
                </span>
              </p>
            </div>

            {/* ─── a) Quick-Add Rack Items (presets) ─────────── */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Quick-Add Rack Items</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {RACK_CARGO_PRESETS.map((preset) => {
                  const checked = config.rackPresets.includes(preset.id);
                  return (
                    <label key={preset.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-2 py-1.5 transition-colors">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setConfig((prev) => ({
                            ...prev,
                            rackPresets: checked
                              ? prev.rackPresets.filter((id) => id !== preset.id)
                              : [...prev.rackPresets, preset.id],
                          }));
                        }}
                        className="accent-accent w-3.5 h-3.5"
                      />
                      <span className="flex-1 text-foreground">{preset.name}</span>
                      <span className="text-muted font-mono text-[10px]">{preset.weightLbs} lbs</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ─── b) Cargo Box ────────────────────────────────── */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.hasCargoBox}
                    onChange={(e) => update("hasCargoBox", e.target.checked)}
                    className="accent-accent w-3.5 h-3.5"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Cargo Box</span>
                </label>
              </div>

              {config.hasCargoBox && (
                <div className="space-y-3 pl-1">
                  {/* Manual toggle */}
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.useManualCargoBox}
                      onChange={(e) => update("useManualCargoBox", e.target.checked)}
                      className="accent-accent w-3.5 h-3.5"
                    />
                    <span className="text-muted-foreground">Enter weight manually</span>
                  </label>

                  {config.useManualCargoBox ? (
                    <NumberInput
                      label="Box Weight"
                      value={config.manualCargoBoxWeightLbs}
                      onChange={(v) => update("manualCargoBoxWeightLbs", v)}
                      unit="lbs"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <SelectInput
                        label="Brand"
                        value={selCargoBoxBrand}
                        onChange={(v) => {
                          setSelCargoBoxBrand(v);
                          update("cargoBox", null);
                        }}
                        options={[
                          { value: "", label: "Select brand..." },
                          ...getCargoBoxBrands().map((b) => ({ value: b, label: b })),
                        ]}
                      />
                      <SelectInput
                        label="Model"
                        value={config.cargoBox?.id ?? ""}
                        onChange={(v) => {
                          const box = findCargoBox(v);
                          update("cargoBox", box ?? null);
                        }}
                        options={
                          selCargoBoxBrand
                            ? [
                                { value: "", label: "Select model..." },
                                ...getCargoBoxModels(selCargoBoxBrand).map((m) => ({
                                  value: m.id,
                                  label: `${m.model} (${m.weightLbs} lbs)`,
                                })),
                              ]
                            : [{ value: "", label: "Select brand first..." }]
                        }
                      />
                    </div>
                  )}

                  {/* Contents slider */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Contents Inside Box: {config.cargoBoxContentsLbs} lbs
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={config.cargoBoxContentsLbs}
                      onChange={(e) => update("cargoBoxContentsLbs", Number(e.target.value))}
                      className="w-full accent-accent"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span>0 lbs</span>
                      <span>100 lbs</span>
                    </div>
                  </div>

                  {/* Show selected box info */}
                  {!config.useManualCargoBox && config.cargoBox && (
                    <div className="bg-muted/50 rounded-lg p-2 text-[10px] text-muted-foreground space-y-0.5">
                      <p><span className="font-bold text-foreground">{config.cargoBox.brand} {config.cargoBox.model}</span></p>
                      <p>{config.cargoBox.capacityCuFt} cu ft &middot; {config.cargoBox.lengthIn}&quot;L &times; {config.cargoBox.widthIn}&quot;W &times; {config.cargoBox.heightIn}&quot;H &middot; {config.cargoBox.material}</p>
                      {config.cargoBox.notes && <p>{config.cargoBox.notes}</p>}
                      {config.cargoBox.affiliateUrl !== "#" && (
                        <a href={config.cargoBox.affiliateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                          View on Amazon <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── c) Custom Items ─────────────────────────────── */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Custom Items</h4>
                <button
                  onClick={addCargoItem}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              {config.cargoItems.length === 0 && (
                <p className="text-xs text-muted-foreground">Add custom cargo items not covered above.</p>
              )}

              {config.cargoItems.map((item) => (
                <div key={item.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Item</label>
                    <input
                      type="text" value={item.name} placeholder="e.g. Pelican case"
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

            {/* Occupants */}
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

            {/* Bedding */}
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

            {/* Garage & misc */}
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Other</h4>
              <div className="grid grid-cols-2 gap-3">
                <NumberInput label="Garage Height" value={config.garageHeightIn} onChange={(v) => update("garageHeightIn", v)} unit="in" hint="84 = 7ft, 96 = 8ft" />
                <NumberInput label="Tongue Weight" value={config.tongueWeightLbs} onChange={(v) => update("tongueWeightLbs", v)} unit="lbs" hint="If towing a trailer" />
              </div>
            </div>
          </div>
        </Section>

        {/* ─── Section 7: Results Dashboard ───────────────────── */}
        <Section
          title="Results Dashboard"
          icon={Ruler}
          open={sections.results}
          onToggle={() => toggleSection("results")}
          iconColor={overallLoadStatus === "red" ? "text-red-500" : overallLoadStatus === "yellow" ? "text-yellow-500" : "text-green-500"}
        >
          <div className="px-4 space-y-6">
            {/* Safety margin reminder */}
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

            {/* Three primary gauges */}
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

            {/* Budget detail cards */}
            <div className="space-y-3">
              <BudgetCard label="Static (Sleeping)" {...result.rackStatic} />
              <BudgetCard label="On-Road Dynamic (Highway)" {...result.rackOnRoad} />
              <BudgetCard label="Off-Road Dynamic (Trail)" {...result.rackOffRoad} />
              <BudgetCard label="Vehicle Payload (GVWR)" {...result.vehiclePayload} />
            </div>

            {/* Weakest Link */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Weakest Link Analysis</h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted block text-[10px] uppercase">Static Limit</span>
                  <span className="font-bold">{result.weakestLink.staticLimit} lbs</span>
                  <span className="block text-[10px] text-muted-foreground">({result.weakestLink.staticBottleneck})</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase">Dynamic Limit</span>
                  <span className="font-bold">{result.weakestLink.dynamicLimit} lbs</span>
                  <span className="block text-[10px] text-muted-foreground">({result.weakestLink.dynamicBottleneck})</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase">Off-Road Limit</span>
                  <span className="font-bold">{result.weakestLink.offRoadLimit} lbs</span>
                  <span className="block text-[10px] text-muted-foreground">({result.weakestLink.offRoadBottleneck})</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">The lower rating between rack and vehicle roof is the effective limit.</p>
            </div>

            {/* Garage Clearance */}
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

            {/* Sleeping Capacity */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Sleeping Capacity</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted block text-[10px] uppercase">Tent (Comfort)</span>
                  <span className="text-xl font-extrabold text-primary">{result.sleepingCapacity.tentComfort}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase">Tent (Tight)</span>
                  <span className="text-xl font-extrabold">{result.sleepingCapacity.tentTight}</span>
                </div>
                {result.sleepingCapacity.annexSleeps > 0 && (
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Annex</span>
                    <span className="text-xl font-extrabold">{result.sleepingCapacity.annexSleeps}</span>
                  </div>
                )}
                {result.sleepingCapacity.wallKitSleeps > 0 && (
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Wall Kit</span>
                    <span className="text-xl font-extrabold">{result.sleepingCapacity.wallKitSleeps}</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-bold">Total rig sleeping capacity: {result.sleepingCapacity.total}</p>
            </div>

            {/* CG Impact */}
            {result.cgRaiseIn > 0 && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Center of Gravity Impact</h4>
                <p className="text-sm">CG raised ~{result.cgRaiseIn}&quot;</p>
                <p className="text-xs text-muted-foreground mt-1">{result.stabilityNote}</p>
              </div>
            )}

            {/* Bed Fitment (trucks) */}
            {!result.bedFitmentOk && !result.cabClearance.applicable && (
              <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-yellow-500 mb-1">Bed Fitment</h4>
                <p className="text-xs">Tent overhangs bed by {result.bedOverhangIn}&quot;. Check cab/tailgate clearance.</p>
              </div>
            )}

            {/* Cab Clearance & Tent Positioning */}
            {result.cabClearance.applicable && (
              <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Cab Clearance & Tent Positioning</h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    result.cabClearance.currentHeightStatus === "clear"
                      ? "bg-green-500/10 text-green-500 border-green-500/30"
                      : result.cabClearance.currentHeightStatus === "tight"
                      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                      : result.cabClearance.currentHeightStatus === "conflict"
                      ? "bg-red-500/10 text-red-500 border-red-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {result.cabClearance.currentHeightStatus === "clear" ? "Clear" :
                     result.cabClearance.currentHeightStatus === "tight" ? "Tight" :
                     result.cabClearance.currentHeightStatus === "conflict" ? "Conflict" : "—"}
                  </span>
                </div>

                {/* Overhang summary */}
                {!result.cabClearance.fitsInBed && (
                  <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                    <p>
                      Tent overhangs bed by <span className="font-bold">{result.cabClearance.totalOverhangIn}&quot;</span>.
                    </p>
                    <p className="text-muted-foreground">
                      Optimal mount: <span className="font-bold text-foreground">{result.cabClearance.optimalFrontOverhangIn}&quot; past cab</span> /&nbsp;
                      <span className="font-bold text-foreground">{result.cabClearance.optimalRearOverhangIn}&quot; past tailgate</span> — balanced load on both mounting points.
                    </p>
                  </div>
                )}

                {/* Height matrix */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Height Settings vs Cab Clearance</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[320px]">
                      <thead>
                        <tr className="text-[10px] uppercase text-muted-foreground border-b border-border">
                          <th className="text-left pb-1.5 font-bold">Rack Ht</th>
                          <th className="text-right pb-1.5 font-bold">Tent Bottom</th>
                          <th className="text-right pb-1.5 font-bold">Rack Top</th>
                          <th className="text-right pb-1.5 font-bold">Gap</th>
                          <th className="text-center pb-1.5 font-bold">Status</th>
                          <th className="text-right pb-1.5 font-bold">Rig Ht</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.cabClearance.heightOptions.map((opt) => {
                          const isCurrent = opt.heightIn === (config.rackHeightSetting ?? config.manualRack?.heightIn);
                          const isRecommended = opt.heightIn === result.cabClearance.recommendedHeightIn;
                          const statusColor = opt.status === "clear" ? "text-green-500" : opt.status === "tight" ? "text-yellow-500" : "text-red-500";
                          return (
                            <tr key={opt.heightIn} className={`border-b border-border/50 last:border-0 ${isCurrent ? "font-bold" : "text-muted-foreground"}`}>
                              <td className="py-1.5">
                                {opt.heightIn}&quot;
                                {isCurrent && <span className="text-[9px] text-primary ml-1.5 font-bold">◀ active</span>}
                                {isRecommended && !isCurrent && <span className="text-[9px] text-green-500 ml-1.5 font-bold">★ rec.</span>}
                              </td>
                              <td className="text-right py-1.5">{opt.tentBottomFromGroundIn}&quot;</td>
                              <td className="text-right py-1.5">{opt.roofRackTopFromGroundIn}&quot;</td>
                              <td className={`text-right py-1.5 font-bold ${statusColor}`}>
                                {opt.clearanceIn >= 0 ? "+" : ""}{opt.clearanceIn}&quot;
                              </td>
                              <td className={`text-center py-1.5 font-bold uppercase text-[9px] tracking-wide ${statusColor}`}>
                                {opt.status}
                              </td>
                              <td className="text-right py-1.5">
                                {opt.totalVehicleHeightIn}&quot;
                                {opt.garageWarning && <span className="text-yellow-500 ml-1" title="Over 7ft — check garage clearance">⚠</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommended setting callout */}
                {result.cabClearance.recommendedHeightIn !== null && (
                  <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-3">
                    <p className="text-xs">
                      <span className="font-bold text-green-500">Recommended: {result.cabClearance.recommendedHeightIn}&quot; setting</span>
                      {" — "}lowest height that fully clears the cab rack (≥2&quot; gap).
                    </p>
                  </div>
                )}

                {result.cabClearance.recommendedHeightIn === null && result.cabClearance.heightOptions.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-3">
                    <p className="text-xs text-red-500 font-bold">No height setting achieves full clearance with this combination. Consider a different rack or tent.</p>
                  </div>
                )}
              </div>
            )}

            {/* Weight Breakdown Donut */}
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

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Warnings & Notes</h4>
                <WarningsPanel warnings={result.warnings} />
              </div>
            )}

            {/* Product Recommendations */}
            {(config.rack || config.tent || config.awning || config.frontBumper || config.rearBumper || config.winch || config.drawers || config.fridge || config.waterTank || config.skidPlates || config.spareCarrier || config.solarPanels || config.lightBar || config.slideKitchen) && (
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
                  {config.frontBumper && (
                    <a href={config.frontBumper.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.frontBumper.brand} {config.frontBumper.model}
                    </a>
                  )}
                  {config.rearBumper && (
                    <a href={config.rearBumper.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.rearBumper.brand} {config.rearBumper.model}
                    </a>
                  )}
                  {config.winch && (
                    <a href={config.winch.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.winch.brand} {config.winch.model}
                    </a>
                  )}
                  {config.drawers && (
                    <a href={config.drawers.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.drawers.brand} {config.drawers.model}
                    </a>
                  )}
                  {config.fridge && (
                    <a href={config.fridge.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.fridge.brand} {config.fridge.model}
                    </a>
                  )}
                  {config.slideKitchen && (
                    <a href={config.slideKitchen.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.slideKitchen.brand} {config.slideKitchen.model}
                    </a>
                  )}
                  {config.waterTank && (
                    <a href={config.waterTank.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.waterTank.brand} {config.waterTank.model}
                    </a>
                  )}
                  {config.skidPlates && (
                    <a href={config.skidPlates.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.skidPlates.brand} {config.skidPlates.model}
                    </a>
                  )}
                  {config.spareCarrier && (
                    <a href={config.spareCarrier.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.spareCarrier.brand} {config.spareCarrier.model}
                    </a>
                  )}
                  {config.solarPanels && (
                    <a href={config.solarPanels.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.solarPanels.brand} {config.solarPanels.model}
                    </a>
                  )}
                  {config.lightBar && (
                    <a href={config.lightBar.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {config.lightBar.brand} {config.lightBar.model}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Export & Reset */}
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
            trackEvent("pe_pdf_exported", { tool: "rigsafe" });
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

      {/* Request a Vehicle */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 no-print">
        <h3 className="text-sm font-extrabold flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          Request a Vehicle
        </h3>
        <p className="text-xs text-muted-foreground">
          Don&apos;t see your vehicle? Submit a request and we&apos;ll add it to the database.
        </p>
        {reqStatus === "sent" ? (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold">
            Request submitted! We&apos;ll review it and add the vehicle.
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
                  body: JSON.stringify({ ...reqForm, source: "rigsafe" }),
                });
                if (res.ok) {
                  setReqStatus("sent");
                  setReqForm({ make: "", model: "", year: "", trim: "", bodyType: "", notes: "", email: "" });
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
                  type="text" required minLength={2} maxLength={50} placeholder="e.g. Toyota"
                  value={reqForm.make} onChange={(e) => setReqForm((p) => ({ ...p, make: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Model *</label>
                <input
                  type="text" required minLength={2} maxLength={80} placeholder="e.g. Tacoma"
                  value={reqForm.model} onChange={(e) => setReqForm((p) => ({ ...p, model: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Year *</label>
                <input
                  type="text" required minLength={4} maxLength={4} placeholder="e.g. 2024"
                  value={reqForm.year} onChange={(e) => setReqForm((p) => ({ ...p, year: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Trim</label>
                <input
                  type="text" maxLength={80} placeholder="e.g. TRD Off-Road"
                  value={reqForm.trim} onChange={(e) => setReqForm((p) => ({ ...p, trim: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Body Type</label>
                <select
                  value={reqForm.bodyType} onChange={(e) => setReqForm((p) => ({ ...p, bodyType: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                >
                  <option value="">Select...</option>
                  <option value="mid-truck">Mid-Size Truck</option>
                  <option value="full-truck">Full-Size Truck</option>
                  <option value="heavy-truck">HD Truck</option>
                  <option value="mid-suv">Mid-Size SUV</option>
                  <option value="full-suv">Full-Size SUV</option>
                  <option value="crossover">Crossover</option>
                  <option value="van">Van</option>
                  <option value="jeep">Jeep</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Email</label>
                <input
                  type="email" maxLength={120} placeholder="Optional — notify me"
                  value={reqForm.email} onChange={(e) => setReqForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Notes</label>
              <textarea
                maxLength={200} rows={2} placeholder="Any details that would help us add this vehicle..."
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

      {/* Shared footer components */}
      <DataPrivacyNotice />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolSocialShare
          url="https://prepperevolution.com/tools/rigsafe-configurator"
          toolName="RigSafe Overland Configurator"
        />
        <PrintQrCode url="https://prepperevolution.com/tools/rigsafe-configurator" />
        <InstallButton />
      </div>
      <SupportFooter />
    </div>
  );
}
