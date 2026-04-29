
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Truck, ChevronDown, ChevronRight, AlertTriangle, Info,
  ShieldAlert, Plus, Trash2, RotateCcw, Search, Scale,
  Wrench, Package, CheckCircle2, ExternalLink,
} from "lucide-react";
import {
  getAllLBVehicles, getLBVehicleById, getUniqueMakes,
} from "./load-balancer-vehicles";
import type { LBVehicle } from "./load-balancer-vehicles";
import {
  upgradeDatabase, UPGRADE_CATEGORY_LABELS,
} from "./load-balancer-upgrades";
import type { LBUpgrade, UpgradeCategory } from "./load-balancer-upgrades";
import {
  gearDatabase, getGearCategories, GEAR_CATEGORY_LABELS, ZONE_LABELS,
} from "./load-balancer-gear";
import type { LBGearItem, GearZone, GearCategory } from "./load-balancer-gear";
import {
  computeAll, defaultLBConfig, LB_KEY, LB_VERSION,
  scoreColor, payloadBarColor,
} from "./load-balancer-compute";
import type { LBConfig, LBResult, LBWarning, InstalledUpgrade, PlacedGearItem } from "./load-balancer-compute";
import { VEHICLE_PROFILE_KEY } from "./vehicle-types";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import { trackEvent } from "@/lib/analytics";

// ─── Gauge Arc ─────────────────────────────────────────────────────────

function GaugeArc({
  value, max, label, unit, size = 120, warningThreshold, dangerThreshold,
}: {
  value: number; max: number; label: string; unit?: string;
  size?: number; warningThreshold?: number; dangerThreshold?: number;
}) {
  const pct = Math.min(1, Math.max(0, value / (max || 1)));
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
  const pctNum = pct * 100;
  let fillColor = "#10B981";
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
        <text x={center} y={center + 2} textAnchor="middle" fontWeight="800"
          style={{ fontSize: size * 0.18, fill: "var(--color-foreground)" }}>
          {value}
        </text>
        {unit && (
          <text x={center} y={center + size * 0.15} textAnchor="middle"
            style={{ fontSize: size * 0.1, fill: "var(--color-muted-foreground)" }}>
            {unit}
          </text>
        )}
      </svg>
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────

function Section({
  title, icon: Icon, children, open, onToggle, iconColor, badge, id,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  open: boolean; onToggle: () => void; iconColor?: string; badge?: string; id?: string;
}) {
  return (
    <div id={id} className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 py-4 text-left hover:text-primary transition-colors"
      >
        <Icon className={`w-4 h-4 ${iconColor || "text-primary"}`} />
        <span className="text-sm font-extrabold flex-1">{title}</span>
        {badge && (
          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {badge}
          </span>
        )}
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="pb-4 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Input Helpers ────────────────────────────────────────────────────────

function NumberInput({
  label, value, onChange, min, max, step, unit, hint,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
        {label} {unit && <span className="normal-case font-normal">({unit})</span>}
      </label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min} max={max} step={step || 1}
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
      />
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
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
      <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
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
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </label>
  );
}

// ─── Tip ──────────────────────────────────────────────────────────────────

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
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-popover border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-xl z-50 pointer-events-none block text-left leading-relaxed">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border block" />
        </span>
      )}
    </span>
  );
}

// ─── Warnings Panel ───────────────────────────────────────────────────────

function WarningsPanel({ warnings }: { warnings: LBWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="space-y-2">
      {warnings.map((w, i) => {
        const iconColor =
          w.level === "danger" ? "text-red-500" :
          w.level === "warning" ? "text-yellow-500" : "text-blue-400";
        const bgColor =
          w.level === "danger" ? "bg-red-500/10 border-red-500/40" :
          w.level === "warning" ? "bg-yellow-500/8 border-yellow-500/30" :
          "bg-blue-500/5 border-blue-500/30";
        const Icon =
          w.level === "danger" ? ShieldAlert :
          w.level === "warning" ? AlertTriangle : Info;
        return (
          <div key={i} className={`flex gap-3 p-3 rounded-lg border ${bgColor}`}>
            <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} />
            <div>
              <p className="text-sm font-bold">{w.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{w.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Balance Bar ─────────────────────────────────────────────────────────

function BalanceBar({ leftLabel, leftPct, rightLabel, rightPct, leftLbs, rightLbs }: {
  leftLabel: string; leftPct: number; leftLbs: number;
  rightLabel: string; rightPct: number; rightLbs: number;
}) {
  const ideal = leftLabel === "Front" ? leftPct >= 40 && leftPct <= 55 : leftPct >= 45 && leftPct <= 55;
  const barColor = ideal ? "bg-emerald-500" : leftPct > 60 ? "bg-red-500" : "bg-yellow-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold text-muted-foreground">
        <span>{leftLabel}: {leftPct}% ({leftLbs} lbs)</span>
        <span>{rightLabel}: {rightPct}% ({rightLbs} lbs)</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden flex">
        <div
          className={`h-full ${barColor} rounded-l-full transition-all duration-500`}
          style={{ width: `${leftPct}%` }}
        />
        <div className="h-full bg-emerald-500/20 rounded-r-full flex-1" />
      </div>
      {!ideal && (
        <p className="text-xs text-yellow-500">
          {leftLabel === "Front"
            ? "Ideal front: 40–55% of gear weight"
            : "Ideal left/right: 45–55% each side"}
        </p>
      )}
    </div>
  );
}

// ─── Score Badge ─────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = scoreColor(score);
  const label = score >= 85 ? "Balanced" : score >= 65 ? "Acceptable" : score >= 45 ? "Marginal" : "Poor";
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-20 h-20 rounded-full border-4 flex items-center justify-center"
        style={{ borderColor: color }}
      >
        <span className="text-2xl font-extrabold" style={{ color }}>{score}</span>
      </div>
      <span className="text-xs font-bold uppercase tracking-wide mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Payload Bar ─────────────────────────────────────────────────────────

function PayloadBar({ used, capacity, label }: { used: number; capacity: number; label: string }) {
  const pct = capacity > 0 ? Math.min(120, Math.round((used / capacity) * 100)) : 0;
  const barColor = payloadBarColor(pct);
  const remaining = capacity - used;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="font-bold uppercase tracking-wide">{label}</span>
        <span className={pct >= 100 ? "text-red-500 font-bold" : ""}>
          {pct}% used
        </span>
      </div>
      <div className="h-4 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{used.toLocaleString()} lbs loaded</span>
        <span className={remaining < 0 ? "text-red-500 font-bold" : ""}>
          {remaining >= 0
            ? `${remaining.toLocaleString()} lbs remaining`
            : `${Math.abs(remaining).toLocaleString()} lbs OVER`}
        </span>
      </div>
    </div>
  );
}

// ─── Zone Table ───────────────────────────────────────────────────────────

function ZoneTable({ zones, total }: {
  zones: Record<string, number>; total: number;
}) {
  const zoneKeys = ["cab", "bed-fwd", "bed-mid", "bed-aft", "roof", "tongue"] as GearZone[];
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-3 py-2 font-bold uppercase tracking-wide text-muted-foreground">Zone</th>
            <th className="text-right px-3 py-2 font-bold uppercase tracking-wide text-muted-foreground">Weight</th>
            <th className="text-right px-3 py-2 font-bold uppercase tracking-wide text-muted-foreground">Share</th>
          </tr>
        </thead>
        <tbody>
          {zoneKeys.map((zone) => {
            const w = zones[zone] || 0;
            const pct = total > 0 ? Math.round((w / total) * 100) : 0;
            return (
              <tr key={zone} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 text-foreground">{ZONE_LABELS[zone]}</td>
                <td className="px-3 py-2 text-right font-mono">{w} lbs</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{pct}%</td>
              </tr>
            );
          })}
          <tr className="bg-muted/30 font-bold">
            <td className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right font-mono">{total} lbs</td>
            <td className="px-3 py-2 text-right">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Gear Row (in builder) ────────────────────────────────────────────────

function GearRow({ item, placed, onAdd, onRemove, onZoneChange, onQtyChange }: {
  item: LBGearItem;
  placed: PlacedGearItem | undefined;
  onAdd: () => void;
  onRemove: () => void;
  onZoneChange: (z: GearZone) => void;
  onQtyChange: (q: number) => void;
}) {
  const zoneOptions = Object.entries(ZONE_LABELS).map(([v, l]) => ({ value: v as GearZone, label: l }));
  const isAdded = !!placed;

  return (
    <div className={`rounded-lg border transition-colors ${isAdded ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"} p-3 space-y-2`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.weightLbs} lbs {item.unit ? `(${item.unit})` : ""}
            {item.notes && <span className="ml-1 opacity-70">· {item.notes}</span>}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {item.affiliateUrl && (
            <a
              href={item.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
              title="View on Amazon"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {isAdded ? (
            <button onClick={onRemove} className="p-1.5 text-red-500 hover:text-red-400 transition-colors" title="Remove">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={onAdd} className="p-1.5 text-emerald-500 hover:text-emerald-400 transition-colors" title="Add">
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {isAdded && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Zone</label>
            <select
              value={placed!.zone}
              onChange={(e) => onZoneChange(e.target.value as GearZone)}
              className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground focus:border-primary outline-none"
            >
              {zoneOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Qty</label>
            <input
              type="number"
              value={placed!.qty}
              min={1}
              max={99}
              onChange={(e) => onQtyChange(Math.max(1, Number(e.target.value)))}
              className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground focus:border-primary outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Upgrade Row ──────────────────────────────────────────────────────────

function UpgradeRow({ upgrade, installed, onToggle }: {
  upgrade: LBUpgrade;
  installed: InstalledUpgrade | undefined;
  onToggle: () => void;
}) {
  const isInstalled = !!installed;
  return (
    <div
      className={`rounded-lg border cursor-pointer transition-all ${
        isInstalled
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border hover:border-primary/40"
      } p-3`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
            isInstalled ? "bg-emerald-500 border-emerald-500" : "border-border"
          }`}
        >
          {isInstalled && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">{upgrade.name}</p>
          <p className="text-xs text-muted-foreground">{upgrade.description}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
          isInstalled ? "bg-red-500/10 text-red-400" : "bg-muted text-muted-foreground"
        }`}>
          −{upgrade.weightLbs} lbs
        </span>
      </div>
      {upgrade.notes && (
        <p className="text-xs text-muted-foreground mt-1.5 pl-6 opacity-70">{upgrade.notes}</p>
      )}
      {isInstalled && upgrade.affectsHighCG && (
        <p className="text-xs text-yellow-500 mt-1 pl-6">⚠ Raises center of gravity</p>
      )}
    </div>
  );
}

// ─── Payload Chain Card ───────────────────────────────────────────────────

function ChainCard({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xl font-extrabold mt-0.5" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function LoadBalancer() {
  const [config, setConfig] = useState<LBConfig>(defaultLBConfig);
  const [loaded, setLoaded] = useState(false);
  const [profileAvailable, setProfileAvailable] = useState(false);
  const [profileImported, setProfileImported] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // UI state
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleMakeFilter, setVehicleMakeFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<LBVehicle | null>(null);
  const [gearCategoryTab, setGearCategoryTab] = useState<GearCategory>("people");
  const [gearSearch, setGearSearch] = useState("");
  const [upgradeCategory, setUpgradeCategory] = useState<UpgradeCategory>("bumpers");

  // Custom gear entry
  const [customGearName, setCustomGearName] = useState("");
  const [customGearWeight, setCustomGearWeight] = useState(10);
  const [customGearZone, setCustomGearZone] = useState<GearZone>("bed-mid");

  // Section open/close
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    vehicle: true,
    upgrades: true,
    gear: true,
    results: true,
  });

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ── Load from localStorage ───────────────────────────────────────────
  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "load-balancer" });
    try {
      const saved = localStorage.getItem(LB_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LBConfig;
        setConfig({ ...defaultLBConfig, ...parsed });
        if (parsed.vehicleId) {
          const v = getLBVehicleById(parsed.vehicleId);
          if (v) setSelectedVehicle(v);
        }
      }
    } catch { /* ignore */ }

    try {
      const vp = localStorage.getItem(VEHICLE_PROFILE_KEY);
      if (vp) setProfileAvailable(true);
    } catch { /* ignore */ }

    setLoaded(true);
  }, []);

  // ── Save to localStorage ─────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(LB_KEY, JSON.stringify(config));
      setLastSaved(new Date());
    } catch { /* ignore */ }
  }, [config, loaded]);

  // ── Import from Vehicle Profile ──────────────────────────────────────
  const importFromProfile = useCallback(() => {
    try {
      const raw = localStorage.getItem(VEHICLE_PROFILE_KEY);
      if (!raw) return;
      const vp = JSON.parse(raw);
      const vehicles = getAllLBVehicles();
      const match = vehicles.find(
        (v) =>
          v.make.toLowerCase().includes((vp.make || "").toLowerCase()) &&
          v.model.toLowerCase().includes((vp.model || "").toLowerCase())
      );
      if (match) {
        setSelectedVehicle(match);
        setConfig((prev) => ({
          ...prev,
          vehicleId: match.id,
          vehicleName: `${match.make} ${match.model} ${match.generation}`,
          gvwrLbs: match.gvwrLbs,
          curbWeightLbs: match.curbWeightLbs,
          stockPayloadLbs: match.payloadLbs,
          wheelbaseIn: match.wheelbaseIn,
          manualPayloadOverride: false,
          manualPayloadLbs: null,
        }));
        setVehicleMakeFilter(match.make);
      } else if (vp.gvwrLbs && vp.curbWeightLbs) {
        setConfig((prev) => ({
          ...prev,
          vehicleId: null,
          vehicleName: `${vp.year || ""} ${vp.make || ""} ${vp.model || ""}`.trim() || "Custom Vehicle",
          gvwrLbs: vp.gvwrLbs,
          curbWeightLbs: vp.curbWeightLbs,
          stockPayloadLbs: vp.gvwrLbs - vp.curbWeightLbs,
          wheelbaseIn: vp.wheelbaseIn || 130,
          manualPayloadOverride: false,
          manualPayloadLbs: null,
        }));
      }
      setProfileImported(true);
    } catch { /* ignore */ }
  }, []);

  // ── Update helper ────────────────────────────────────────────────────
  const update = useCallback(<K extends keyof LBConfig>(key: K, value: LBConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Vehicle selection ────────────────────────────────────────────────
  const allVehicles = useMemo(() => getAllLBVehicles(), []);
  const makes = useMemo(() => ["all", ...getUniqueMakes()], []);

  const filteredVehicles = useMemo(() => {
    let list = allVehicles;
    if (vehicleMakeFilter !== "all") {
      list = list.filter((v) => v.make === vehicleMakeFilter);
    }
    if (vehicleSearch.trim()) {
      const q = vehicleSearch.toLowerCase();
      list = list.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.generation.toLowerCase().includes(q) ||
          v.trim.toLowerCase().includes(q) ||
          String(v.yearStart).includes(q)
      );
    }
    return list;
  }, [allVehicles, vehicleMakeFilter, vehicleSearch]);

  const selectVehicle = useCallback((v: LBVehicle) => {
    setSelectedVehicle(v);
    setConfig((prev) => ({
      ...prev,
      vehicleId: v.id,
      vehicleName: `${v.make} ${v.model} ${v.generation}`,
      gvwrLbs: v.gvwrLbs,
      curbWeightLbs: v.curbWeightLbs,
      stockPayloadLbs: v.payloadLbs,
      wheelbaseIn: v.wheelbaseIn,
      manualPayloadOverride: false,
      manualPayloadLbs: null,
    }));
    trackEvent("pe_lb_vehicle_selected", { vehicleId: v.id });
  }, []);

  // ── Upgrade toggles ──────────────────────────────────────────────────
  const toggleUpgrade = useCallback((upgrade: LBUpgrade) => {
    setConfig((prev) => {
      const existing = prev.installedUpgrades.find((u) => u.upgradeId === upgrade.id);
      if (existing) {
        return { ...prev, installedUpgrades: prev.installedUpgrades.filter((u) => u.upgradeId !== upgrade.id) };
      }
      return {
        ...prev,
        installedUpgrades: [
          ...prev.installedUpgrades,
          { upgradeId: upgrade.id, name: upgrade.name, weightLbs: upgrade.weightLbs, affectsHighCG: upgrade.affectsHighCG, qty: 1 },
        ],
      };
    });
  }, []);

  const installedUpgradeIds = useMemo(
    () => new Set(config.installedUpgrades.map((u) => u.upgradeId)),
    [config.installedUpgrades]
  );

  // ── Gear add/remove ──────────────────────────────────────────────────
  const addGear = useCallback((item: LBGearItem) => {
    const id = `${item.id}-${Date.now()}`;
    setConfig((prev) => ({
      ...prev,
      placedGear: [
        ...prev.placedGear,
        { id, gearItemId: item.id, name: item.name, weightLbs: item.weightLbs, qty: 1, zone: item.defaultZone },
      ],
    }));
  }, []);

  const removeGear = useCallback((placedId: string) => {
    setConfig((prev) => ({
      ...prev,
      placedGear: prev.placedGear.filter((g) => g.id !== placedId),
    }));
  }, []);

  const updateGearZone = useCallback((placedId: string, zone: GearZone) => {
    setConfig((prev) => ({
      ...prev,
      placedGear: prev.placedGear.map((g) => g.id === placedId ? { ...g, zone } : g),
    }));
  }, []);

  const updateGearQty = useCallback((placedId: string, qty: number) => {
    setConfig((prev) => ({
      ...prev,
      placedGear: prev.placedGear.map((g) => g.id === placedId ? { ...g, qty } : g),
    }));
  }, []);

  // Map of gearItemId → placed instance (first match, since same item can be added once)
  const placedGearMap = useMemo(() => {
    const map = new Map<string, PlacedGearItem>();
    for (const g of config.placedGear) {
      if (!map.has(g.gearItemId)) map.set(g.gearItemId, g);
    }
    return map;
  }, [config.placedGear]);

  // Add custom gear
  const addCustomGear = useCallback(() => {
    if (!customGearName.trim() || customGearWeight <= 0) return;
    const id = `custom-${Date.now()}`;
    setConfig((prev) => ({
      ...prev,
      placedGear: [
        ...prev.placedGear,
        { id, gearItemId: id, name: customGearName.trim(), weightLbs: customGearWeight, qty: 1, zone: customGearZone, custom: true },
      ],
    }));
    setCustomGearName("");
    setCustomGearWeight(10);
  }, [customGearName, customGearWeight, customGearZone]);

  // ── Compute ──────────────────────────────────────────────────────────
  const result = useMemo<LBResult>(() => computeAll(config), [config]);

  // ── Gear for current category/search ────────────────────────────────
  const gearForTab = useMemo(() => {
    let list = gearDatabase.filter((g) => g.category === gearCategoryTab);
    if (gearSearch.trim()) {
      const q = gearSearch.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }
    return list;
  }, [gearCategoryTab, gearSearch]);

  const upgradeCategories = useMemo<UpgradeCategory[]>(() => [
    "bumpers", "winch", "suspension", "protection", "storage", "electrical", "exterior", "shelter", "tires", "towing",
  ], []);

  const upgradesForCategory = useMemo(
    () => upgradeDatabase.filter((u) => u.category === upgradeCategory),
    [upgradeCategory]
  );

  const confidenceColor = (c: string) =>
    c === "high" ? "text-emerald-500" : c === "medium" ? "text-yellow-500" : "text-red-400";

  const reset = useCallback(() => {
    setConfig(defaultLBConfig);
    setSelectedVehicle(null);
    setVehicleSearch("");
    setVehicleMakeFilter("all");
    setProfileImported(false);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-base font-extrabold leading-none">Overland Load Balancer</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Payload · Upgrade Deductions · Gear Placement · Axle Balance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {LB_VERSION} · {lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
            </span>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── Vehicle Profile Banner ── */}
        {profileAvailable && !profileImported && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold">Vehicle Profile detected</p>
                <p className="text-xs text-muted-foreground">Import your rig's specs from the Ops Deck Vehicle Profile.</p>
              </div>
            </div>
            <button
              onClick={importFromProfile}
              className="flex-shrink-0 text-sm font-bold px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            >
              Import
            </button>
          </div>
        )}
        {profileImported && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-500 font-bold">Vehicle Profile imported — specs pre-filled from your rig.</p>
          </div>
        )}

        {/* ── Payload Chain (always visible summary) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ChainCard
            label="Stock Payload"
            value={`${result.stockPayloadLbs.toLocaleString()} lbs`}
            sub={`GVWR ${config.gvwrLbs.toLocaleString()} − Curb ${config.curbWeightLbs.toLocaleString()}`}
          />
          <ChainCard
            label="Mods Deducted"
            value={`−${result.upgradeWeightLbs} lbs`}
            sub={`${config.installedUpgrades.length} upgrade${config.installedUpgrades.length !== 1 ? "s" : ""} installed`}
            color={result.upgradeWeightLbs > 0 ? "#EF4444" : undefined}
          />
          <ChainCard
            label="Effective Payload"
            value={`${result.effectivePayloadLbs.toLocaleString()} lbs`}
            sub="Before gear is loaded"
            color={result.effectivePayloadLbs < 400 ? "#EF4444" : result.effectivePayloadLbs < 700 ? "#EAB308" : "#10B981"}
          />
          <ChainCard
            label="Remaining"
            value={result.remainingPayloadLbs >= 0
              ? `${result.remainingPayloadLbs.toLocaleString()} lbs`
              : `−${Math.abs(result.remainingPayloadLbs).toLocaleString()} lbs`}
            sub={result.remainingPayloadLbs < 0 ? "OVER PAYLOAD" : `${result.payloadUsedPct}% of effective payload`}
            color={result.remainingPayloadLbs < 0 ? "#EF4444" : result.payloadUsedPct > 85 ? "#EAB308" : "#10B981"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ════════ LEFT: Vehicle + Upgrades ════════ */}
          <div className="lg:col-span-1 space-y-4">

            {/* Vehicle Card */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Section
                title="Select Your Rig"
                icon={Truck}
                iconColor="text-emerald-500"
                badge={selectedVehicle ? selectedVehicle.model : undefined}
                open={openSections.vehicle}
                onToggle={() => toggleSection("vehicle")}
                id="section-vehicle"
              >
                {/* Make filter */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Make</label>
                    <select
                      value={vehicleMakeFilter}
                      onChange={(e) => setVehicleMakeFilter(e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                    >
                      {makes.map((m) => (
                        <option key={m} value={m}>{m === "all" ? "All Makes" : m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Search</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Model, gen, year..."
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        className="w-full bg-muted border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle list */}
                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 -mr-1">
                  {filteredVehicles.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No vehicles match your search.</p>
                  )}
                  {filteredVehicles.map((v) => {
                    const isSelected = selectedVehicle?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => selectVehicle(v)}
                        className={`w-full text-left rounded-lg border p-2.5 transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight">{v.make} {v.model}</p>
                            <p className="text-xs text-muted-foreground">{v.generation} · {v.yearStart}–{v.yearEnd ?? "present"}</p>
                            <p className="text-xs text-muted-foreground truncate">{v.trim}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-extrabold text-emerald-500">{v.payloadLbs.toLocaleString()} lbs</p>
                            <p className="text-xs text-muted-foreground">stock payload</p>
                            <span className={`text-xs ${confidenceColor(v.confidence)}`}>● {v.confidence}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Manual overrides */}
                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Manual Override</p>
                  <p className="text-xs text-muted-foreground">
                    Always verify specs against the sticker on your driver's door jamb — that number is specific to your VIN.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                      label="GVWR" unit="lbs"
                      value={config.gvwrLbs}
                      onChange={(v) => update("gvwrLbs", v)}
                      min={1000} max={20000}
                    />
                    <NumberInput
                      label="Curb Weight" unit="lbs"
                      value={config.curbWeightLbs}
                      onChange={(v) => update("curbWeightLbs", v)}
                      min={500} max={12000}
                    />
                  </div>
                  <Toggle
                    label="Use manual payload (override calc)"
                    checked={config.manualPayloadOverride}
                    onChange={(v) => update("manualPayloadOverride", v)}
                    hint="Enter the payload from your door jamb sticker directly."
                  />
                  {config.manualPayloadOverride && (
                    <NumberInput
                      label="Door Jamb Payload" unit="lbs"
                      value={config.manualPayloadLbs ?? 0}
                      onChange={(v) => update("manualPayloadLbs", v)}
                      min={100} max={5000}
                    />
                  )}
                </div>
              </Section>
            </div>

            {/* Upgrades Card */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Section
                title="Installed Upgrades"
                icon={Wrench}
                iconColor="text-orange-500"
                badge={config.installedUpgrades.length > 0 ? `${config.installedUpgrades.length} installed · −${result.upgradeWeightLbs} lbs` : undefined}
                open={openSections.upgrades}
                onToggle={() => toggleSection("upgrades")}
                id="section-upgrades"
              >
                <p className="text-xs text-muted-foreground">
                  Permanent mods add to your curb weight and reduce payload BEFORE you load a single piece of gear.
                  <Tip text="Stock payload from manufacturer assumes zero mods. Every heavy bumper, winch, rack, and RTT eats into your payload budget. This is the number most overlanders ignore until something breaks." />
                </p>

                {/* Category tabs */}
                <div className="flex flex-wrap gap-1.5">
                  {upgradeCategories.map((cat) => {
                    const count = config.installedUpgrades.filter(
                      (u) => upgradeDatabase.find((d) => d.id === u.upgradeId)?.category === cat
                    ).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setUpgradeCategory(cat)}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold transition-colors ${
                          upgradeCategory === cat
                            ? "bg-orange-500 text-white"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {UPGRADE_CATEGORY_LABELS[cat]}
                        {count > 0 && <span className="ml-1 opacity-80">({count})</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Upgrade list */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 -mr-1">
                  {upgradesForCategory.map((upgrade) => (
                    <UpgradeRow
                      key={upgrade.id}
                      upgrade={upgrade}
                      installed={config.installedUpgrades.find((u) => u.upgradeId === upgrade.id)}
                      onToggle={() => toggleUpgrade(upgrade)}
                    />
                  ))}
                </div>

                {/* Installed summary */}
                {config.installedUpgrades.length > 0 && (
                  <div className="border-t border-border pt-3 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Installed</p>
                    {config.installedUpgrades.map((u) => (
                      <div key={u.upgradeId} className="flex items-center justify-between text-xs">
                        <span className="text-foreground truncate max-w-[180px]">{u.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-red-400 font-bold">−{u.weightLbs} lbs</span>
                          <button
                            onClick={() => setConfig((prev) => ({
                              ...prev,
                              installedUpgrades: prev.installedUpgrades.filter((x) => x.upgradeId !== u.upgradeId),
                            }))}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-bold border-t border-border/50 pt-1 mt-1">
                      <span>Total mods weight</span>
                      <span className="text-red-400">−{result.upgradeWeightLbs} lbs</span>
                    </div>
                  </div>
                )}
              </Section>
            </div>

          </div>

          {/* ════════ CENTER: Gear Builder ════════ */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Section
                title="Gear Builder"
                icon={Package}
                iconColor="text-blue-500"
                badge={config.placedGear.length > 0 ? `${config.placedGear.length} items · ${result.gearWeightLbs} lbs` : undefined}
                open={openSections.gear}
                onToggle={() => toggleSection("gear")}
                id="section-gear"
              >
                {/* Category search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search gear..."
                    value={gearSearch}
                    onChange={(e) => setGearSearch(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                  />
                </div>

                {/* Category tabs */}
                {!gearSearch.trim() && (
                  <div className="flex flex-wrap gap-1.5">
                    {getGearCategories().map((cat) => {
                      const count = config.placedGear.filter((g) => {
                        const dbItem = gearDatabase.find((d) => d.id === g.gearItemId);
                        return dbItem?.category === cat;
                      }).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setGearCategoryTab(cat)}
                          className={`text-xs px-2.5 py-1 rounded-full font-bold transition-colors ${
                            gearCategoryTab === cat
                              ? "bg-blue-500 text-white"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {GEAR_CATEGORY_LABELS[cat]}
                          {count > 0 && <span className="ml-1 opacity-80">({count})</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Gear items */}
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 -mr-1">
                  {(gearSearch.trim()
                    ? gearDatabase.filter((g) => g.name.toLowerCase().includes(gearSearch.toLowerCase()))
                    : gearForTab
                  ).map((item) => {
                    const placed = placedGearMap.get(item.id);
                    return (
                      <GearRow
                        key={item.id}
                        item={item}
                        placed={placed}
                        onAdd={() => addGear(item)}
                        onRemove={() => placed && removeGear(placed.id)}
                        onZoneChange={(z) => placed && updateGearZone(placed.id, z)}
                        onQtyChange={(q) => placed && updateGearQty(placed.id, q)}
                      />
                    );
                  })}
                </div>

                {/* Custom gear */}
                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Custom Item</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={customGearName}
                        onChange={(e) => setCustomGearName(e.target.value)}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                      />
                    </div>
                    <NumberInput
                      label="Weight" unit="lbs"
                      value={customGearWeight}
                      onChange={setCustomGearWeight}
                      min={0.1} step={0.5}
                    />
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Zone</label>
                      <select
                        value={customGearZone}
                        onChange={(e) => setCustomGearZone(e.target.value as GearZone)}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                      >
                        {Object.entries(ZONE_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={addCustomGear}
                    disabled={!customGearName.trim() || customGearWeight <= 0}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Item
                  </button>
                </div>

                {/* Loaded gear list */}
                {config.placedGear.length > 0 && (
                  <div className="border-t border-border pt-3 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Loaded</p>
                    {config.placedGear.map((g) => (
                      <div key={g.id} className="flex items-center justify-between text-xs gap-1">
                        <span className="text-foreground truncate max-w-[140px]">
                          {g.qty > 1 ? `${g.qty}× ` : ""}{g.name}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-muted-foreground">{ZONE_LABELS[g.zone]}</span>
                          <span className="font-bold">{g.weightLbs * g.qty} lbs</span>
                          <button onClick={() => removeGear(g.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-bold border-t border-border/50 pt-1 mt-1">
                      <span>Total gear</span>
                      <span className="text-blue-400">{result.gearWeightLbs} lbs</span>
                    </div>
                  </div>
                )}

              </Section>
            </div>
          </div>

          {/* ════════ RIGHT: Results ════════ */}
          <div className="lg:col-span-1 space-y-4">

            {/* Balance Score + Payload Gauge */}
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">Load Readiness</p>
              <div className="flex items-center justify-around gap-4">
                <div className="text-center">
                  <ScoreBadge score={result.balanceScore} />
                  <p className="text-xs text-muted-foreground mt-2">Balance Score</p>
                </div>
                <div className="h-16 w-px bg-border" />
                <GaugeArc
                  value={result.payloadUsedPct}
                  max={120}
                  label="Payload Used"
                  unit="%"
                  size={100}
                  warningThreshold={75}
                  dangerThreshold={100}
                />
              </div>

              {/* Payload bar */}
              <div className="mt-4">
                <PayloadBar
                  used={result.gearWeightLbs}
                  capacity={result.effectivePayloadLbs}
                  label="Effective Payload"
                />
              </div>
            </div>

            {/* Axle Balance */}
            {result.gearWeightLbs > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Axle Balance</p>
                <BalanceBar
                  leftLabel="Front"
                  leftPct={result.axle.frontPct}
                  leftLbs={result.axle.frontLbs}
                  rightLabel="Rear"
                  rightPct={result.axle.rearPct}
                  rightLbs={result.axle.rearLbs}
                />
                <BalanceBar
                  leftLabel="Left"
                  leftPct={result.axle.leftPct}
                  leftLbs={result.axle.leftLbs}
                  rightLabel="Right"
                  rightPct={result.axle.rightPct}
                  rightLbs={result.axle.rightLbs}
                />
              </div>
            )}

            {/* Zone Breakdown */}
            {result.gearWeightLbs > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Zone Breakdown</p>
                <ZoneTable
                  zones={result.zoneWeights as unknown as Record<string, number>}
                  total={result.totalGearLbs}
                />
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Advisories ({result.warnings.length})
                </p>
                <WarningsPanel warnings={result.warnings} />
              </div>
            )}

            {/* Empty state */}
            {result.gearWeightLbs === 0 && result.warnings.length === 0 && (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground">
                <Scale className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">Nothing loaded yet</p>
                <p className="text-xs mt-1">Select your rig, add mods, then build your gear list to see your load analysis.</p>
              </div>
            )}

            {/* Social Share */}
            {result.gearWeightLbs > 0 && (
              <ToolSocialShare
                toolName="Overland Load Balancer"
                url="https://prepperevolution.com/tools/load-balancer"
              />
            )}

          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-bold text-yellow-500">Safety Disclaimer</p>
          <p>
            This tool provides estimates only. Vehicle payload ratings, curb weights, and GVWR vary by year, trim,
            engine, and options — always verify against the sticker on your driver's door jamb. The door jamb sticker is
            the only legally binding payload rating for your specific VIN. Overloading a vehicle is dangerous and illegal.
            Actual axle load distribution depends on vehicle geometry not modeled here. Never exceed your vehicle's GVWR or
            individual axle ratings.
          </p>
        </div>

        <DataPrivacyNotice />

        <SupportFooter />

      </div>
    </div>
  );
}
