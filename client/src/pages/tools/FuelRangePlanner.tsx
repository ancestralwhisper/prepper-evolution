import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  Fuel, MapPin, Plus, Trash2, ChevronUp, ChevronDown,
  AlertTriangle, Gauge, Route, Mountain, Truck,
  ArrowDown, Info, GripVertical, Copy, RotateCcw,
  Printer, Download, DollarSign, Package, RefreshCw,
  Repeat, BookOpen, ChevronRight, Settings2, Wind,
  Thermometer, Timer,
} from "lucide-react";
import { computeVehicle } from "./vehicle-compute";
import type { VehicleProfile as VehicleProfileType, VehicleComputed } from "./vehicle-types";
import { VEHICLE_PROFILE_KEY } from "./vehicle-types";
import {
  computeTrip, terrainLabels, terrainDefaultSpeed,
  terrainMpgMultiplier, terrainIcons, formatTime, fuelPct,
  auxFuelMpgPenalty, JERRY_CAN_GAL, JERRY_CAN_WEIGHT_LBS,
  calculateRigPenalty, IDLE_GPH,
} from "./fuel-compute";
import type {
  TerrainType, TripSegment, TripResult,
  RigConditions, LiftHeight, TireTypeOption, HeadwindLevel,
  DriveMode, FuelTypeOption, AltitudeBand, AeroDragMods,
} from "./fuel-types";
import { DEFAULT_RIG_CONDITIONS } from "./fuel-types";
import { tripPresets } from "./fuel-presets";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import ZipLookup from "@/components/tools/ZipLookup";
import type { ZipPrefixData } from "./zip-types";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import PrintQrCode from "@/components/tools/PrintQrCode";
import InstallButton from "@/components/tools/InstallButton";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import { generateFuelRangePdf } from "@/components/tools/PdfExport";
import { trackEvent } from "@/lib/analytics";
import { useSEO } from "@/hooks/useSEO";

const TRIP_STORAGE_KEY = "pe-fuel-range-trip";
const RIG_CONDITIONS_KEY = "pe-fuel-rig-conditions";

const TERRAIN_OPTIONS: TerrainType[] = [
  "highway", "city", "gravel", "dirt", "sand", "mud", "rock-crawl", "snow",
];

const TERRAIN_COLORS: Record<TerrainType, string> = {
  highway: "#10b981",
  city: "#6366f1",
  gravel: "#f59e0b",
  dirt: "#92400e",
  sand: "#fbbf24",
  mud: "#64748b",
  "rock-crawl": "#ef4444",
  snow: "#38bdf8",
};

function makeId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// ─── Inline Tooltip ──────────────────────────────────────────────────
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

function defaultSegment(index: number): TripSegment {
  return {
    id: makeId(),
    name: index === 0 ? "Start" : `Waypoint ${index}`,
    distanceMiles: 0,
    terrain: "highway",
    elevationGainFt: 0,
    speedMph: terrainDefaultSpeed.highway,
    isFuelStop: false,
    idleMinutes: 0,
  };
}

function FuelBar({ pct, danger }: { pct: number; danger: boolean }) {
  const color = danger
    ? "bg-red-500"
    : pct < 25
      ? "bg-amber-500"
      : pct < 50
        ? "bg-yellow-500"
        : "bg-emerald-500";

  return (
    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${Math.max(1, pct)}%` }}
      />
    </div>
  );
}

interface SegmentEditorProps {
  segment: TripSegment;
  index: number;
  total: number;
  onChange: (id: string, field: string, value: string | number | boolean) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function SegmentEditor({
  segment, index, total, onChange, onRemove, onMoveUp, onMoveDown, onDuplicate,
}: SegmentEditorProps) {
  const handleTerrainChange = (terrain: string) => {
    onChange(segment.id, "terrain", terrain);
    onChange(segment.id, "speedMph", terrainDefaultSpeed[terrain as TerrainType]);
  };

  return (
    <div className={`bg-card border rounded-lg p-4 ${segment.isFuelStop ? "border-blue-500/50 bg-blue-500/5" : "border-border"}`} data-testid={`segment-editor-${index}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground/30" />
          <span className="text-xs font-bold uppercase tracking-wide text-primary">
            Segment {index + 1}
          </span>
          {segment.isFuelStop && (
            <span className="text-[9px] font-bold uppercase tracking-wide text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
              Fuel Stop
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(segment.id, "isFuelStop", !segment.isFuelStop)}
            className={`p-1 transition-colors ${segment.isFuelStop ? "text-blue-400 hover:text-blue-300" : "text-muted-foreground/40 hover:text-blue-400"}`}
            aria-label="Toggle fuel stop"
            title={segment.isFuelStop ? "Remove fuel stop" : "Mark as fuel stop"}
            data-testid={`button-fuel-stop-${index}`}
          >
            <Fuel className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(segment.id)}
            className="p-1 text-muted-foreground/40 hover:text-foreground transition-colors"
            aria-label="Duplicate segment"
            data-testid={`button-duplicate-segment-${index}`}
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveUp(segment.id)}
            disabled={index === 0}
            className="p-1 text-muted-foreground/40 hover:text-foreground disabled:opacity-20 transition-colors"
            aria-label="Move up"
            data-testid={`button-move-up-${index}`}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveDown(segment.id)}
            disabled={index === total - 1}
            className="p-1 text-muted-foreground/40 hover:text-foreground disabled:opacity-20 transition-colors"
            aria-label="Move down"
            data-testid={`button-move-down-${index}`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          {total > 1 && (
            <button
              onClick={() => onRemove(segment.id)}
              className="p-1 text-muted-foreground/40 hover:text-red-400 transition-colors ml-1"
              aria-label="Remove segment"
              data-testid={`button-remove-segment-${index}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-3">
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
            Segment Name
          </label>
          <input
            type="text"
            value={segment.name}
            onChange={(e) => onChange(segment.id, "name", e.target.value)}
            placeholder="e.g. Highway to trailhead"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
            data-testid={`input-segment-name-${index}`}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
            Distance (mi)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={segment.distanceMiles || ""}
            onChange={(e) => onChange(segment.id, "distanceMiles", parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
            data-testid={`input-distance-${index}`}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
            Terrain
            <Tip text="Terrain multiplies your fuel burn. Rock crawling can use 3× more fuel than highway — you're idling in 4-Low at walking speed. Choose the most representative surface for this segment." />
          </label>
          <select
            value={segment.terrain}
            onChange={(e) => handleTerrainChange(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-colors"
            data-testid={`select-terrain-${index}`}
          >
            {TERRAIN_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {terrainIcons[t]} {terrainLabels[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
            Elev. Gain (ft)
            <Tip text="Net elevation change for this segment. Climbing costs fuel — roughly 3-5% more per 1,000 ft. Enter a negative number for descents. This stacks on top of terrain penalties." />
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={segment.elevationGainFt || ""}
            onChange={(e) => onChange(segment.id, "elevationGainFt", parseInt(e.target.value) || 0)}
            placeholder="0 (negative = descent)"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
            data-testid={`input-elevation-${index}`}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
            Speed (mph)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={segment.speedMph || ""}
            onChange={(e) => onChange(segment.id, "speedMph", parseInt(e.target.value) || 0)}
            placeholder="0"
            min="0"
            max="120"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
            data-testid={`input-speed-${index}`}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
            <Timer className="w-3 h-3 inline -mt-0.5 mr-0.5" />
            Idle Time (min)
            <Tip text="Time spent idling at this location — running heat, camp power, or waiting at a trailhead. Most trucks burn ~0.5 gal/hr at idle. 8 hours can drain 4 gallons without moving an inch." />
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={segment.idleMinutes || ""}
            onChange={(e) => onChange(segment.id, "idleMinutes", Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="0"
            min="0"
            max="480"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
            data-testid={`input-idle-${index}`}
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
            Terrain Impact
          </label>
          <div className="bg-muted border border-border rounded-lg px-3 py-2 text-sm">
            <span className={`font-bold ${terrainMpgMultiplier[segment.terrain] < 0.6 ? "text-red-400" : terrainMpgMultiplier[segment.terrain] < 0.8 ? "text-amber-400" : "text-emerald-400"}`}>
              {Math.round((1 - terrainMpgMultiplier[segment.terrain]) * 100)}% MPG loss
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rig & Conditions Panel ──────────────────────────────────────────

const LIFT_OPTIONS: { value: LiftHeight; label: string }[] = [
  { value: "0", label: "Stock (0\")" },
  { value: "1", label: "1\"" },
  { value: "2", label: "2\"" },
  { value: "2.5", label: "2.5\"" },
  { value: "3", label: "3\"" },
  { value: "4", label: "4\"" },
  { value: "5", label: "5\"" },
  { value: "6", label: "6\"" },
];

const TIRE_TYPE_OPTIONS: { value: TireTypeOption; label: string }[] = [
  { value: "highway", label: "Highway (H/T)" },
  { value: "all-terrain", label: "All-Terrain (A/T)" },
  { value: "mud-terrain", label: "Mud-Terrain (M/T)" },
  { value: "hybrid", label: "Hybrid / Rugged A/T" },
];

const HEADWIND_OPTIONS: { value: HeadwindLevel; label: string }[] = [
  { value: "none", label: "None / Calm" },
  { value: "light", label: "Light (5-10 mph)" },
  { value: "moderate", label: "Moderate (15-20 mph)" },
  { value: "strong", label: "Strong (25+ mph)" },
];

const DRIVE_MODE_OPTIONS: { value: DriveMode; label: string }[] = [
  { value: "2wd", label: "2WD / 2H" },
  { value: "4h", label: "4WD High" },
  { value: "4l", label: "4WD Low" },
];

const FUEL_TYPE_OPTIONS: { value: FuelTypeOption; label: string }[] = [
  { value: "e10", label: "Regular E10" },
  { value: "premium", label: "Premium" },
  { value: "e85", label: "E85 Flex Fuel" },
];

const ALTITUDE_OPTIONS: { value: AltitudeBand; label: string }[] = [
  { value: "below-3000", label: "Below 3,000 ft" },
  { value: "3000-5000", label: "3,000 - 5,000 ft" },
  { value: "5000-7000", label: "5,000 - 7,000 ft" },
  { value: "7000-9000", label: "7,000 - 9,000 ft" },
  { value: "9000-plus", label: "9,000+ ft" },
];

const AERO_DRAG_ITEMS: { key: keyof AeroDragMods; label: string }[] = [
  { key: "lightbar", label: "Light bar" },
  { key: "bullBar", label: "Bull bar / Bumper" },
  { key: "snorkel", label: "Snorkel" },
  { key: "antenna", label: "CB / Ham antenna" },
  { key: "awning", label: "Awning" },
  { key: "rtt", label: "Roof-top tent (RTT)" },
];

interface RigConditionsPanelProps {
  conditions: RigConditions;
  onChange: (conditions: RigConditions) => void;
  profileLinked: boolean;
}

function RigConditionsPanel({ conditions, onChange, profileLinked }: RigConditionsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const rigResult = useMemo(() => calculateRigPenalty(conditions), [conditions]);
  const totalPenaltyPct = Math.round((1 - rigResult.multiplier) * 100);
  const hasPenalty = totalPenaltyPct !== 0;

  const updateField = <K extends keyof RigConditions>(key: K, value: RigConditions[K]) => {
    onChange({ ...conditions, [key]: value });
  };

  const updateAero = (key: keyof AeroDragMods, checked: boolean) => {
    onChange({
      ...conditions,
      aeroDrag: { ...conditions.aeroDrag, [key]: checked },
      // If un-checking RTT, also disable fairing
      ...(key === "rtt" && !checked ? { fairing: false } : {}),
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4" data-testid="rig-conditions-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors w-full"
        data-testid="button-rig-conditions-toggle"
      >
        <Settings2 className="w-4 h-4 text-primary flex-shrink-0" />
        <span>Rig & Conditions</span>
        {hasPenalty && (
          <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${totalPenaltyPct > 0 ? "text-red-400 bg-red-400/10" : "text-emerald-400 bg-emerald-400/10"}`}>
            {totalPenaltyPct > 0 ? `-${totalPenaltyPct}%` : `+${Math.abs(totalPenaltyPct)}%`} MPG
          </span>
        )}
        {profileLinked && (
          <span className="text-[9px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
            Profile Linked
          </span>
        )}
        <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-6">

          {/* Suspension & Tires */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
              Suspension & Tires
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  Lift Height
                </label>
                <select
                  value={conditions.liftInches}
                  onChange={(e) => updateField("liftInches", e.target.value as LiftHeight)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-colors"
                  data-testid="select-lift-height"
                >
                  {LIFT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  Tire Type
                </label>
                <select
                  value={conditions.tireType}
                  onChange={(e) => updateField("tireType", e.target.value as TireTypeOption)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-colors"
                  data-testid="select-tire-type"
                >
                  {TIRE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  Tire Size Over Stock (in)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={conditions.tireSizeOverStock || ""}
                  onChange={(e) => updateField("tireSizeOverStock", Math.max(0, Math.min(4, parseFloat(e.target.value) || 0)))}
                  placeholder="0"
                  min="0"
                  max="4"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
                  data-testid="input-tire-size-over"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  Aired Down
                </label>
                <button
                  onClick={() => updateField("airedDown", !conditions.airedDown)}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold border transition-colors ${
                    conditions.airedDown
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                  data-testid="button-aired-down"
                >
                  {conditions.airedDown ? "Yes" : "No"}
                </button>
                {conditions.airedDown && (
                  <p className="text-[9px] text-amber-400/70 mt-1">Penalty on highway/city only</p>
                )}
              </div>
            </div>
          </div>

          {/* Drivetrain & Engine */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
              Drivetrain & Engine
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  4WD Engagement
                </label>
                <select
                  value={conditions.driveMode}
                  onChange={(e) => updateField("driveMode", e.target.value as DriveMode)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-colors"
                  data-testid="select-drive-mode"
                >
                  {DRIVE_MODE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  A/C Running
                </label>
                <button
                  onClick={() => updateField("acOn", !conditions.acOn)}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold border transition-colors ${
                    conditions.acOn
                      ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                  data-testid="button-ac"
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  {conditions.acOn ? "On" : "Off"}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  Fuel Type
                </label>
                <select
                  value={conditions.fuelType}
                  onChange={(e) => updateField("fuelType", e.target.value as FuelTypeOption)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-colors"
                  data-testid="select-fuel-type"
                >
                  {FUEL_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  Turbo / Forced Induction
                </label>
                <button
                  onClick={() => updateField("isTurbo", !conditions.isTurbo)}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold border transition-colors ${
                    conditions.isTurbo
                      ? "bg-primary/10 border-primary/50 text-primary"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                  data-testid="button-turbo"
                >
                  {conditions.isTurbo ? "Yes" : "No"}
                </button>
                {conditions.isTurbo && (
                  <p className="text-[9px] text-primary/70 mt-1">Halves altitude penalty</p>
                )}
              </div>
            </div>
          </div>

          {/* Aero & Load */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
              Aero & Load
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  Trip Cargo (lbs)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={conditions.cargoWeightLbs || ""}
                  onChange={(e) => updateField("cargoWeightLbs", Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  min="0"
                  max="5000"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
                  data-testid="input-cargo-weight"
                />
                {conditions.cargoWeightLbs > 0 && (
                  <p className="text-[9px] text-muted-foreground mt-1">
                    -{Math.round(conditions.cargoWeightLbs / 100)}% MPG
                  </p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  Towing
                </label>
                <button
                  onClick={() => updateField("towingEnabled", !conditions.towingEnabled)}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold border transition-colors ${
                    conditions.towingEnabled
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                  data-testid="button-towing"
                >
                  <Truck className="w-3.5 h-3.5" />
                  {conditions.towingEnabled ? "Yes" : "No"}
                </button>
              </div>

              {conditions.towingEnabled && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                    Trailer Weight (lbs)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={conditions.trailerWeightLbs || ""}
                    onChange={(e) => updateField("trailerWeightLbs", Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    min="0"
                    max="15000"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
                    data-testid="input-trailer-weight"
                  />
                  {conditions.trailerWeightLbs > 0 && (
                    <p className="text-[9px] text-muted-foreground mt-1">
                      -{Math.round(conditions.trailerWeightLbs / 200)}% MPG
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-2">
                Aero Drag Mods
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AERO_DRAG_ITEMS.map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border cursor-pointer transition-colors ${
                      conditions.aeroDrag[item.key]
                        ? "bg-primary/5 border-primary/30 text-foreground"
                        : "bg-muted border-border text-muted-foreground hover:border-border/80"
                    }`}
                    data-testid={`checkbox-aero-${item.key}`}
                  >
                    <input
                      type="checkbox"
                      checked={conditions.aeroDrag[item.key]}
                      onChange={(e) => updateAero(item.key, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                      conditions.aeroDrag[item.key]
                        ? "bg-primary border-primary"
                        : "border-border"
                    }`}>
                      {conditions.aeroDrag[item.key] && (
                        <svg className="w-2.5 h-2.5 text-background" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    {item.label}
                  </label>
                ))}
              </div>
              {conditions.aeroDrag.rtt && (
                <div className="mt-2">
                  <label
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm border cursor-pointer transition-colors ${
                      conditions.fairing
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-muted border-border text-muted-foreground hover:border-border/80"
                    }`}
                    data-testid="checkbox-fairing"
                  >
                    <input
                      type="checkbox"
                      checked={conditions.fairing}
                      onChange={(e) => updateField("fairing", e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                      conditions.fairing
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-border"
                    }`}>
                      {conditions.fairing && (
                        <svg className="w-2.5 h-2.5 text-background" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    Wind fairing (reduces RTT drag)
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Environment */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
              Environment
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  <Wind className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                  Headwind
                </label>
                <select
                  value={conditions.headwind}
                  onChange={(e) => updateField("headwind", e.target.value as HeadwindLevel)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-colors"
                  data-testid="select-headwind"
                >
                  {HEADWIND_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                  <Mountain className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                  Sustained Altitude
                </label>
                <select
                  value={conditions.altitude}
                  onChange={(e) => updateField("altitude", e.target.value as AltitudeBand)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-colors"
                  data-testid="select-altitude"
                >
                  {ALTITUDE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rig Penalty Summary */}
          {rigResult.breakdown.length > 0 && (
            <div className="bg-muted rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Rig Adjustment Impact
                </span>
                <span className={`text-sm font-extrabold ${totalPenaltyPct > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {totalPenaltyPct > 0 ? `-${totalPenaltyPct}%` : `+${Math.abs(totalPenaltyPct)}%`} base MPG
                </span>
              </div>
              <div className="space-y-1">
                {rigResult.breakdown.map((item, i) => {
                  const pctChange = Math.round((1 - item.multiplier) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={`font-bold ${pctChange > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {pctChange > 0 ? `-${pctChange}%` : `+${Math.abs(pctChange)}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reset button */}
          <div className="flex justify-end">
            <button
              onClick={() => onChange({ ...DEFAULT_RIG_CONDITIONS })}
              className="text-xs font-bold uppercase tracking-wide text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              data-testid="button-reset-rig"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function FuelRangePlanner() {
  useSEO({
    title: "Fuel & Range Planner | Ops Deck | Prepper Evolution",
    description: "Plan your overland route with terrain-adjusted MPG calculations. See exactly how much fuel each segment burns, where you'll hit reserve, and how many jerry cans to cache.",
  });

  const [profile, setProfile] = useState<VehicleProfileType | null>(null);
  const [computed, setComputed] = useState<VehicleComputed | null>(null);
  const [segments, setSegments] = useState<TripSegment[]>([defaultSegment(0)]);
  const [tripName, setTripName] = useState("My Trip");
  const [climateZone, setClimateZone] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [manualMpg, setManualMpg] = useState<number | null>(null);
  const [manualFuel, setManualFuel] = useState<number | null>(null);
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [gasPrice, setGasPrice] = useState<number>(0);
  const [jerryCans, setJerryCans] = useState(0);
  const [roundTrip, setRoundTrip] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showAuxFuel, setShowAuxFuel] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [rigConditions, setRigConditions] = useState<RigConditions>({ ...DEFAULT_RIG_CONDITIONS });
  const [profileLinked, setProfileLinked] = useState(false);

  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "fuel-range-planner" });

    const saved = localStorage.getItem(VEHICLE_PROFILE_KEY);
    if (saved) {
      try {
        const p: VehicleProfileType = JSON.parse(saved);
        setProfile(p);
        setComputed(computeVehicle(p));

        // Auto-populate rig conditions from vehicle profile
        const savedRig = localStorage.getItem(RIG_CONDITIONS_KEY);
        let rig: RigConditions;
        if (savedRig) {
          try {
            rig = JSON.parse(savedRig);
          } catch {
            rig = { ...DEFAULT_RIG_CONDITIONS };
          }
        } else {
          rig = { ...DEFAULT_RIG_CONDITIONS };
        }

        // Map vehicle profile fields to rig conditions (only for defaults)
        if (!savedRig) {
          const liftStr = String(p.lift?.inches ?? 0) as LiftHeight;
          if (liftStr in { "0": 1, "1": 1, "2": 1, "2.5": 1, "3": 1, "4": 1, "5": 1, "6": 1 }) {
            rig.liftInches = liftStr;
          }
          if (p.tires?.type) {
            rig.tireType = p.tires.type as TireTypeOption;
          }
          if (p.tires?.diameter && p.stockTireDiameter) {
            rig.tireSizeOverStock = Math.max(0, Math.round((p.tires.diameter - p.stockTireDiameter) * 10) / 10);
          }
          if (p.roof?.rtt) {
            rig.aeroDrag = { ...rig.aeroDrag, rtt: true };
          }
          if (p.roof?.awning) {
            rig.aeroDrag = { ...rig.aeroDrag, awning: true };
          }
          if (p.waterFording?.snorkel) {
            rig.aeroDrag = { ...rig.aeroDrag, snorkel: true };
          }
          if (p.electrical?.radioType && p.electrical.radioType !== "none") {
            rig.aeroDrag = { ...rig.aeroDrag, antenna: true };
          }
          if (p.frontBumper?.type && p.frontBumper.type !== "stock") {
            rig.aeroDrag = { ...rig.aeroDrag, bullBar: true };
          }
          if (p.electrical?.lightBarWatts && p.electrical.lightBarWatts > 0) {
            rig.aeroDrag = { ...rig.aeroDrag, lightbar: true };
          }
        }

        setRigConditions(rig);
        setProfileLinked(true);
      } catch { /* corrupted */ }
    } else {
      // No vehicle profile, load saved rig conditions if available
      const savedRig = localStorage.getItem(RIG_CONDITIONS_KEY);
      if (savedRig) {
        try {
          setRigConditions(JSON.parse(savedRig));
        } catch { /* corrupted */ }
      }
    }

    const savedTrip = localStorage.getItem(TRIP_STORAGE_KEY);
    if (savedTrip) {
      try {
        const trip = JSON.parse(savedTrip);
        if (trip.segments?.length > 0) {
          setSegments(trip.segments);
          if (trip.tripName) setTripName(trip.tripName);
          if (trip.manualMpg) setManualMpg(trip.manualMpg);
          if (trip.manualFuel) setManualFuel(trip.manualFuel);
          if (trip.gasPrice) setGasPrice(trip.gasPrice);
          if (trip.jerryCans) setJerryCans(trip.jerryCans);
          if (trip.roundTrip) setRoundTrip(trip.roundTrip);
        }
      } catch { /* corrupted */ }
    }
  }, []);

  // Save trip data
  useEffect(() => {
    localStorage.setItem(
      TRIP_STORAGE_KEY,
      JSON.stringify({ tripName, segments, manualMpg, manualFuel, gasPrice, jerryCans, roundTrip }),
    );
  }, [tripName, segments, manualMpg, manualFuel, gasPrice, jerryCans, roundTrip]);

  // Save rig conditions
  useEffect(() => {
    localStorage.setItem(RIG_CONDITIONS_KEY, JSON.stringify(rigConditions));
  }, [rigConditions]);

  const rawBaseMpg = manualMpg ?? computed?.estimatedMpg ?? 20;
  const baseMpg = jerryCans > 0 ? auxFuelMpgPenalty(jerryCans, rawBaseMpg) : rawBaseMpg;
  const tankFuel = manualFuel ?? computed?.totalFuelGal ?? 24;
  const totalFuelGal = tankFuel + (jerryCans * JERRY_CAN_GAL);

  const rigPenaltyResult = useMemo(() => calculateRigPenalty(rigConditions), [rigConditions]);
  const rigAdjustedMpg = useMemo(
    () => Math.round(baseMpg * rigPenaltyResult.multiplier * 10) / 10,
    [baseMpg, rigPenaltyResult.multiplier],
  );

  const effectiveSegments = useMemo(() => {
    if (!roundTrip) return segments;
    const reversed = [...segments].reverse().map((seg) => ({
      ...seg,
      id: makeId(),
      name: `${seg.name} (return)`,
      isFuelStop: false,
    }));
    return [...segments, ...reversed];
  }, [segments, roundTrip]);

  const tripResult: TripResult | null = useMemo(() => {
    const validSegments = effectiveSegments.filter((s) => s.distanceMiles > 0 || (s.idleMinutes ?? 0) > 0);
    if (validSegments.length === 0) return null;
    return computeTrip(validSegments, baseMpg, totalFuelGal, climateZone, gasPrice, rigConditions);
  }, [effectiveSegments, baseMpg, totalFuelGal, climateZone, gasPrice, rigConditions]);

  const terrainBreakdown = useMemo(() => {
    if (!tripResult) return [];
    const byTerrain: Record<string, { fuel: number; distance: number; time: number }> = {};
    tripResult.segments.forEach((r) => {
      const t = r.segment.terrain;
      if (!byTerrain[t]) byTerrain[t] = { fuel: 0, distance: 0, time: 0 };
      byTerrain[t].fuel += r.fuelUsedGal;
      byTerrain[t].distance += r.segment.distanceMiles;
      byTerrain[t].time += r.timeHours;
    });
    return Object.entries(byTerrain)
      .map(([terrain, data]) => ({
        terrain: terrain as TerrainType,
        label: terrainLabels[terrain as TerrainType],
        fuel: Math.round(data.fuel * 100) / 100,
        distance: Math.round(data.distance * 10) / 10,
        time: data.time,
        color: TERRAIN_COLORS[terrain as TerrainType],
        pct: tripResult.totalFuelUsedGal > 0
          ? Math.round((data.fuel / tripResult.totalFuelUsedGal) * 100)
          : 0,
      }))
      .sort((a, b) => b.fuel - a.fuel);
  }, [tripResult]);

  const updateSegment = useCallback(
    (id: string, field: string, value: string | number | boolean) => {
      setSegments((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      );
    },
    [],
  );

  const addSegment = useCallback(() => {
    setSegments((prev) => [...prev, defaultSegment(prev.length)]);
    trackEvent("pe_fuel_segment_add", { count: segments.length + 1 });
  }, [segments.length]);

  const removeSegment = useCallback((id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const moveUp = useCallback((id: string) => {
    setSegments((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((id: string) => {
    setSegments((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const resetTrip = useCallback(() => {
    setSegments([defaultSegment(0)]);
    setTripName("My Trip");
    setManualMpg(null);
    setManualFuel(null);
    setGasPrice(0);
    setJerryCans(0);
    setRoundTrip(false);
    localStorage.removeItem(TRIP_STORAGE_KEY);
    trackEvent("pe_fuel_trip_reset", {} as Record<string, never>);
  }, []);

  const duplicateSegment = useCallback((id: string) => {
    setSegments((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const original = prev[idx];
      const clone: TripSegment = {
        ...original,
        id: makeId(),
        name: `${original.name} (copy)`,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  }, []);

  const loadPreset = useCallback((presetId: string) => {
    const preset = tripPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setTripName(preset.name);
    setSegments(preset.segments.map((s) => ({ ...s, id: makeId(), idleMinutes: 0 })));
    setShowPresets(false);
    trackEvent("pe_tool_started", { tool: "fuel-range-planner" });
  }, []);

  const handleZipResult = useCallback((data: ZipPrefixData | null) => {
    setClimateZone(data?.cz ?? null);
  }, []);

  const handlePrint = useCallback(() => {
    trackEvent("pe_fuel_print", { tripName });
    window.print();
  }, [tripName]);

  const handlePdfExport = useCallback(async () => {
    if (!tripResult) return;
    setPdfLoading(true);
    try {
      const cacheNeeded = tripResult.outOfFuel
        ? Math.ceil(tripResult.totalFuelUsedGal - totalFuelGal + totalFuelGal * 0.1)
        : null;
      await generateFuelRangePdf({
        tripName,
        vehicleName: profile ? `${profile.year} ${profile.make} ${profile.model}` : null,
        baseMpg,
        totalFuelGal,
        rangeMiles: computed?.estimatedRangeMiles ?? null,
        gasPricePerGal: gasPrice,
        jerryCans,
        climateZone,
        segments: tripResult.segments.map((r) => ({
          name: r.segment.name,
          terrain: terrainLabels[r.segment.terrain],
          distanceMiles: r.segment.distanceMiles,
          elevationGainFt: r.segment.elevationGainFt,
          speedMph: r.segment.speedMph,
          adjustedMpg: r.adjustedMpg,
          fuelUsedGal: r.fuelUsedGal,
          fuelRemainingGal: r.fuelRemainingGal,
          timeFormatted: formatTime(r.timeHours),
          isFuelStop: r.segment.isFuelStop,
          didRefuel: r.didRefuel,
          warnings: r.warnings,
        })),
        totalDistanceMiles: tripResult.totalDistanceMiles,
        totalFuelUsedGal: tripResult.totalFuelUsedGal,
        fuelRemainingGal: tripResult.fuelRemainingGal,
        totalTimeFormatted: formatTime(tripResult.totalTimeHours),
        totalFuelCost: tripResult.totalFuelCost,
        outOfFuel: tripResult.outOfFuel,
        reserveWarning: tripResult.reserveWarning,
        pointOfNoReturnIdx: tripResult.pointOfNoReturnIdx,
        refuelStopCount: tripResult.refuelStopCount,
        cacheGallons: cacheNeeded,
        cacheCans: cacheNeeded !== null ? Math.ceil(cacheNeeded / 5) : null,
      });
      trackEvent("pe_pdf_exported", { tool: "fuel-range-planner" });
    } finally {
      setPdfLoading(false);
    }
  }, [tripResult, tripName, profile, baseMpg, totalFuelGal, computed, gasPrice, jerryCans, climateZone]);

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Fuel & Range Planner \u2014 Ops Deck",
    description: "Plan overland routes with terrain-adjusted MPG. See fuel burn per segment, cache recommendations, and point of no return.",
    url: "https://prepperevolution.com/tools/fuel-range-planner",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Organization", name: "Prepper Evolution", url: "https://prepperevolution.com" },
  };

  return (
    <>
      <div className="print-only">
        <div className="print-header">
          <img src="/images/pe-badge.png" alt="Prepper Evolution" className="print-logo" />
          <div>
            <h2 className="print-title">Fuel & Range Plan: {tripName}{roundTrip ? " (Round Trip)" : ""}</h2>
            <p className="print-date">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>
        {profile && computed && (
          <div className="print-summary">
            <div className="print-summary-grid">
              <div>
                <span className="print-label">Vehicle</span>
                <span className="print-value">{profile.year} {profile.make} {profile.model}</span>
              </div>
              <div>
                <span className="print-label">Est. MPG</span>
                <span className="print-value">{rigAdjustedMpg}{rigPenaltyResult.multiplier < 1 ? ` (${baseMpg} base - rig adj.)` : ""}{jerryCans > 0 ? ` (${rawBaseMpg} base - weight penalty)` : ""}</span>
              </div>
              <div>
                <span className="print-label">Fuel Capacity</span>
                <span className="print-value">{totalFuelGal} gal{jerryCans > 0 ? ` (${tankFuel} tank + ${jerryCans * JERRY_CAN_GAL} aux)` : ""}</span>
              </div>
            </div>
          </div>
        )}
        {tripResult && (
          <>
            <div className="print-summary">
              <div className="print-summary-grid">
                <div>
                  <span className="print-label">Total Distance</span>
                  <span className="print-value">{tripResult.totalDistanceMiles} mi</span>
                </div>
                <div>
                  <span className="print-label">Fuel Required</span>
                  <span className="print-value">{tripResult.totalFuelUsedGal} gal</span>
                </div>
                <div>
                  <span className="print-label">Fuel Remaining</span>
                  <span className="print-value">{tripResult.outOfFuel ? "EMPTY" : `${tripResult.fuelRemainingGal} gal`}</span>
                </div>
                <div>
                  <span className="print-label">Drive Time</span>
                  <span className="print-value">{formatTime(tripResult.totalTimeHours)}</span>
                </div>
                {gasPrice > 0 && (
                  <div>
                    <span className="print-label">Est. Fuel Cost</span>
                    <span className="print-value">${tripResult.totalFuelCost.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginTop: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
                  <th style={{ padding: "4px 8px" }}>#</th>
                  <th style={{ padding: "4px 8px" }}>Segment</th>
                  <th style={{ padding: "4px 8px" }}>Terrain</th>
                  <th style={{ padding: "4px 8px", textAlign: "right" }}>Dist</th>
                  <th style={{ padding: "4px 8px", textAlign: "right" }}>MPG</th>
                  <th style={{ padding: "4px 8px", textAlign: "right" }}>Fuel</th>
                  <th style={{ padding: "4px 8px", textAlign: "right" }}>Left</th>
                  <th style={{ padding: "4px 8px", textAlign: "right" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {tripResult.segments.map((r, i) => (
                  <tr key={r.segment.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "4px 8px" }}>{i + 1}</td>
                    <td style={{ padding: "4px 8px" }}>{r.didRefuel ? "\u26FD " : ""}{r.segment.name}</td>
                    <td style={{ padding: "4px 8px" }}>{terrainLabels[r.segment.terrain]}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>{r.segment.distanceMiles} mi</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>{r.adjustedMpg}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>-{r.fuelUsedGal}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>{r.fuelRemainingGal} gal</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>{formatTime(r.timeHours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <PrintQrCode url="https://prepperevolution.com/tools/fuel-range-planner" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <div className="py-16 sm:py-20 bg-background no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-3xl mb-10">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">
              Ops Deck
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
              Fuel & Range <span className="text-primary">Planner</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Build your route segment by segment &mdash; highway, dirt road, rock crawl,
              sand. Watch your fuel burn in real-time with terrain-adjusted MPG pulled
              directly from your Vehicle Profile. Know exactly where you hit reserve,
              where you run dry, and how many jerry cans to cache.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <InstallButton />
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-print"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              {tripResult && (
                <button
                  onClick={handlePdfExport}
                  disabled={pdfLoading}
                  className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  data-testid="button-pdf-export"
                >
                  <Download className="w-3.5 h-3.5" />
                  {pdfLoading ? "Generating..." : "Export PDF"}
                </button>
              )}
              <ToolSocialShare
                toolName="Fuel & Range Planner"
                url="https://prepperevolution.com/tools/fuel-range-planner"
              />
            </div>
          </div>

          <div className="space-y-6">

            {profile && computed ? (
              <div className="bg-card border border-border rounded-lg p-4" data-testid="vehicle-summary-card">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Your Vehicle
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div>
                    <p className="text-lg font-extrabold text-foreground">
                      {profile.year} {profile.make} {profile.model}
                    </p>
                    {profile.nickname && (
                      <p className="text-sm text-muted-foreground">&ldquo;{profile.nickname}&rdquo;</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">MPG: </span>
                      <span className="font-bold text-foreground">{rigAdjustedMpg}</span>
                      {(computed.mpgPenaltyPct > 0 || jerryCans > 0 || rigPenaltyResult.multiplier < 1) && (
                        <span className="text-red-400 text-sm ml-1">
                          ({baseMpg} base{rigPenaltyResult.multiplier < 1 ? ` x ${Math.round(rigPenaltyResult.multiplier * 100)}% rig` : ""}{jerryCans > 0 ? " - cargo" : ""})
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fuel: </span>
                      <span className="font-bold text-foreground">{totalFuelGal} gal</span>
                      {jerryCans > 0 && (
                        <span className="text-blue-400 text-sm ml-1">(+{jerryCans * JERRY_CAN_GAL} aux)</span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Range: </span>
                      <span className="font-bold text-foreground">{Math.round(rigAdjustedMpg * totalFuelGal)} mi</span>
                    </div>
                  </div>
                </div>
                {computed.warnings.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {computed.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-sm text-amber-400">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 text-center" data-testid="no-vehicle-card">
                <Truck className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-foreground mb-1">No Vehicle Profile Found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Build your vehicle profile first so we can calculate accurate fuel consumption
                  based on your rig's actual specs and modifications.
                </p>
                <Link
                  href="/tools/vehicle-profile"
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold text-sm px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
                  data-testid="link-vehicle-profile"
                >
                  <Truck className="w-4 h-4" />
                  Build Vehicle Profile
                </Link>
                <p className="text-xs text-muted-foreground/50 mt-3">
                  Or continue below with default values (20 MPG / 24 gal tank)
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <button
                  onClick={() => setShowManualOverride(!showManualOverride)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors w-full"
                  data-testid="button-manual-override"
                >
                  <Gauge className="w-4 h-4 text-primary flex-shrink-0" />
                  Manual MPG / Fuel Override
                  <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${showManualOverride ? "rotate-180" : ""}`} />
                </button>
                {showManualOverride && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                        Base MPG
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={manualMpg ?? ""}
                        onChange={(e) => setManualMpg(e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder={String(computed?.estimatedMpg ?? 20)}
                        min="1"
                        max="99"
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
                        data-testid="input-manual-mpg"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                        Tank Size (gal)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={manualFuel ?? ""}
                        onChange={(e) => setManualFuel(e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder={String(computed?.totalFuelGal ?? 24)}
                        min="1"
                        max="999"
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
                        data-testid="input-manual-fuel"
                      />
                    </div>
                    {(manualMpg !== null || manualFuel !== null) && (
                      <div className="col-span-2">
                        <button
                          onClick={() => { setManualMpg(null); setManualFuel(null); }}
                          className="text-xs font-bold uppercase tracking-wide text-red-400 hover:text-red-300 transition-colors"
                          data-testid="button-clear-override"
                        >
                          Clear Override
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <button
                  onClick={() => setShowAuxFuel(!showAuxFuel)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors w-full"
                  data-testid="button-aux-fuel-toggle"
                >
                  <Package className="w-4 h-4 text-primary flex-shrink-0" />
                  Auxiliary Fuel & Cost
                  <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${showAuxFuel ? "rotate-180" : ""}`} />
                </button>
                {showAuxFuel && (
                  <div className="space-y-3 mt-3 pt-3 border-t border-border">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                        Jerry Cans (5 gal each)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={jerryCans || ""}
                          onChange={(e) => setJerryCans(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          min="0"
                          max="10"
                          className="w-20 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
                          data-testid="input-jerry-cans"
                        />
                        {jerryCans > 0 && (
                          <span className="text-sm text-muted-foreground">
                            +{jerryCans * JERRY_CAN_GAL} gal / +{jerryCans * JERRY_CAN_WEIGHT_LBS} lbs cargo
                          </span>
                        )}
                      </div>
                      {jerryCans > 0 && (
                        <p className="text-xs text-amber-400 mt-1">
                          MPG reduced {rawBaseMpg} &rarr; {baseMpg} due to extra weight
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                        <DollarSign className="w-3 h-3 inline -mt-0.5" /> Gas Price ($/gal)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={gasPrice || ""}
                        onChange={(e) => setGasPrice(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        max="20"
                        className="w-28 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
                        data-testid="input-gas-price"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ZipLookup
              onResult={handleZipResult}
              showFields={["climate", "hazard"]}
              compact
            />

            {/* ─── Rig & Conditions (between ZIP lookup and trip builder) ─── */}
            <RigConditionsPanel
              conditions={rigConditions}
              onChange={setRigConditions}
              profileLinked={profileLinked}
            />

            <div className="bg-card border border-border rounded-lg p-4" data-testid="trip-planner-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-primary flex-shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Trip Planner
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRoundTrip(!roundTrip)}
                    className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wide transition-colors ${roundTrip ? "text-primary" : "text-muted-foreground/50 hover:text-primary"}`}
                    data-testid="button-round-trip"
                    title="Mirror segments for return trip"
                  >
                    <Repeat className="w-3 h-3" />
                    Round Trip {roundTrip ? "ON" : "OFF"}
                  </button>
                  <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground/50 hover:text-primary transition-colors"
                    data-testid="button-presets"
                  >
                    <BookOpen className="w-3 h-3" />
                    Presets
                  </button>
                  <button
                    onClick={resetTrip}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground/50 hover:text-red-400 transition-colors"
                    data-testid="button-reset-trip"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
              </div>

              {showPresets && (
                <div className="mb-4 p-3 bg-muted rounded-lg border border-border">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
                    Load a Route Template
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {tripPresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => loadPreset(preset.id)}
                        className="text-left p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                        data-testid={`button-preset-${preset.id}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-foreground">{preset.name}</span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-primary font-bold mb-1">
                          {preset.region} &middot; {preset.totalMiles} mi &middot; {preset.segments.length} segments
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Name your trip"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-colors"
                data-testid="input-trip-name"
              />
              {roundTrip && (
                <p className="text-xs text-primary mt-2 flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  Round-trip mode: your {segments.length} segment{segments.length !== 1 ? "s" : ""} will be mirrored for the return ({segments.length * 2} total segments calculated)
                </p>
              )}
            </div>

            <div className="space-y-3">
              {segments.map((seg, i) => (
                <SegmentEditor
                  key={seg.id}
                  segment={seg}
                  index={i}
                  total={segments.length}
                  onChange={updateSegment}
                  onRemove={removeSegment}
                  onMoveUp={moveUp}
                  onMoveDown={moveDown}
                  onDuplicate={duplicateSegment}
                />
              ))}

              <button
                onClick={addSegment}
                className="w-full flex items-center justify-center gap-2 bg-card border border-dashed border-border rounded-lg p-3 text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
                data-testid="button-add-segment"
              >
                <Plus className="w-4 h-4" />
                Add Segment
              </button>
            </div>

            {tripResult && (
              <div className="space-y-4">

                <div className="bg-card border border-border rounded-lg p-4" data-testid="trip-summary-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Gauge className="w-4 h-4 text-primary flex-shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Trip Summary {roundTrip ? "(Round Trip)" : ""}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                        Total Distance
                      </p>
                      <p className="text-xl font-extrabold text-foreground" data-testid="text-total-distance">
                        {tripResult.totalDistanceMiles} <span className="text-sm text-muted-foreground font-normal">mi</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                        Fuel Required
                      </p>
                      <p className={`text-xl font-extrabold ${tripResult.outOfFuel ? "text-red-400" : "text-foreground"}`} data-testid="text-fuel-required">
                        {tripResult.totalFuelUsedGal} <span className="text-sm text-muted-foreground font-normal">gal</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                        Fuel Remaining
                      </p>
                      <p className={`text-xl font-extrabold ${tripResult.outOfFuel ? "text-red-400" : tripResult.reserveWarning ? "text-amber-400" : "text-emerald-400"}`} data-testid="text-fuel-remaining">
                        {tripResult.outOfFuel ? "EMPTY" : `${tripResult.fuelRemainingGal} gal`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                        Drive Time
                      </p>
                      <p className="text-xl font-extrabold text-foreground" data-testid="text-drive-time">
                        {formatTime(tripResult.totalTimeHours)}
                      </p>
                    </div>
                  </div>

                  {(gasPrice > 0 || tripResult.refuelStopCount > 0 || tripResult.totalIdleFuelGal > 0 || rigPenaltyResult.multiplier < 1) && (
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4 text-sm">
                      {gasPrice > 0 && (
                        <div data-testid="text-fuel-cost">
                          <span className="text-muted-foreground">Est. Cost: </span>
                          <span className="font-bold text-foreground">${tripResult.totalFuelCost.toFixed(2)}</span>
                          <span className="text-muted-foreground text-sm ml-1">@ ${gasPrice.toFixed(2)}/gal</span>
                        </div>
                      )}
                      {tripResult.refuelStopCount > 0 && (
                        <div>
                          <span className="text-muted-foreground">Fuel Stops: </span>
                          <span className="font-bold text-blue-400">{tripResult.refuelStopCount}</span>
                        </div>
                      )}
                      {tripResult.totalIdleFuelGal > 0 && (
                        <div>
                          <span className="text-muted-foreground">Idle Burn: </span>
                          <span className="font-bold text-amber-400">{tripResult.totalIdleFuelGal} gal</span>
                        </div>
                      )}
                      {rigPenaltyResult.multiplier < 1 && (
                        <div>
                          <span className="text-muted-foreground">Rig Penalty: </span>
                          <span className="font-bold text-red-400">-{Math.round((1 - rigPenaltyResult.multiplier) * 100)}%</span>
                        </div>
                      )}
                      {rigPenaltyResult.multiplier > 1 && (
                        <div>
                          <span className="text-muted-foreground">Rig Bonus: </span>
                          <span className="font-bold text-emerald-400">+{Math.round((rigPenaltyResult.multiplier - 1) * 100)}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Fuel Level After Trip</span>
                      <span className="font-bold">
                        {tripResult.outOfFuel
                          ? "0%"
                          : `${fuelPct(tripResult.fuelRemainingGal, tripResult.totalFuelCapacityGal)}%`}
                      </span>
                    </div>
                    <FuelBar
                      pct={fuelPct(tripResult.fuelRemainingGal, tripResult.totalFuelCapacityGal)}
                      danger={tripResult.outOfFuel}
                    />
                  </div>
                </div>

                {terrainBreakdown.length > 1 && (
                  <div className="bg-card border border-border rounded-lg p-4" data-testid="terrain-breakdown-chart">
                    <div className="flex items-center gap-2 mb-4">
                      <Fuel className="w-4 h-4 text-primary flex-shrink-0" />
                      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Fuel by Terrain Type
                      </h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-48 h-48 flex-shrink-0">
                        <DonutChart
                          segments={terrainBreakdown.map((t) => ({
                            label: t.label,
                            value: t.fuel,
                            color: t.color,
                          }))}
                          totalLabel="Total Fuel"
                          totalValue={`${tripResult.totalFuelUsedGal} gal`}
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <ChartLegend
                          segments={terrainBreakdown.map((t) => ({
                            label: `${terrainIcons[t.terrain]} ${t.label}`,
                            value: t.fuel,
                            color: t.color,
                          }))}
                        />
                        <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {terrainBreakdown.map((t) => (
                            <div key={t.terrain} className="flex justify-between">
                              <span>{terrainIcons[t.terrain]} {t.distance} mi</span>
                              <span>{formatTime(t.time)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(tripResult.outOfFuel || tripResult.reserveWarning || tripResult.pointOfNoReturnIdx !== null) && (
                  <div className={`border rounded-lg p-4 ${tripResult.outOfFuel ? "bg-red-500/10 border-red-500/30" : "bg-amber-500/10 border-amber-500/30"}`} data-testid="fuel-warnings">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${tripResult.outOfFuel ? "text-red-400" : "text-amber-400"}`} />
                      <h3 className={`text-xs font-bold uppercase tracking-wide ${tripResult.outOfFuel ? "text-red-400" : "text-amber-400"}`}>
                        {tripResult.outOfFuel ? "Fuel Critical" : "Fuel Warning"}
                      </h3>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      {tripResult.outOfFuel && tripResult.outOfFuelAtIdx !== null && (
                        <p className="text-red-300 font-bold">
                          You run out of fuel at Segment {tripResult.outOfFuelAtIdx + 1}:{" "}
                          {tripResult.segments[tripResult.outOfFuelAtIdx]?.segment.name || "Unknown"}.
                          You need {Math.ceil(tripResult.totalFuelUsedGal - totalFuelGal)} more gallons
                          or need to shorten your route.
                        </p>
                      )}
                      {tripResult.reserveWarning && !tripResult.outOfFuel && (
                        <p className="text-amber-300">
                          You'll finish with less than 10% fuel reserve. Consider caching fuel
                          or topping off before heading out.
                        </p>
                      )}
                      {tripResult.pointOfNoReturnIdx !== null && !tripResult.outOfFuel && (
                        <p className="text-muted-foreground text-sm">
                          Point of no return: Segment {tripResult.pointOfNoReturnIdx + 1} &mdash; beyond here,
                          you don't have enough fuel to retrace your route.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-card border border-border rounded-lg p-4" data-testid="route-timeline">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Route Fuel Timeline
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="text-xs font-bold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors"
                      data-testid="button-toggle-details"
                    >
                      {showBreakdown ? "Hide" : "Show"} Details
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">Start</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {totalFuelGal} gal (100%)
                      </span>
                    </div>
                  </div>

                  {tripResult.segments.map((res, idx) => {
                    const pct = fuelPct(res.fuelRemainingGal, tripResult.totalFuelCapacityGal);
                    const isOutOfFuel = tripResult.outOfFuelAtIdx !== null && idx >= tripResult.outOfFuelAtIdx;
                    const isPonr = tripResult.pointOfNoReturnIdx === idx;

                    return (
                      <div key={res.segment.id + idx}>
                        {res.didRefuel && (
                          <div className="flex items-center gap-3 my-1">
                            <div className="w-3 flex justify-center">
                              <div className="w-0.5 h-4 bg-blue-500/50" />
                            </div>
                            <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded px-2 py-1">
                              <span className="text-xs font-bold text-blue-400">
                                FUEL STOP &mdash; Tank refilled to {totalFuelGal} gal
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <div className="w-3 flex justify-center">
                            <div className={`w-0.5 h-full min-h-[48px] ${isOutOfFuel ? "bg-red-500/50" : "bg-border"}`} />
                          </div>
                          <div className="flex-1 py-2 text-sm text-muted-foreground space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span>{terrainIcons[res.segment.terrain]} {terrainLabels[res.segment.terrain]}</span>
                              <span>&middot;</span>
                              <span>{res.segment.distanceMiles} mi</span>
                              <span>&middot;</span>
                              <span>{formatTime(res.timeHours)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Fuel className="w-3 h-3 text-muted-foreground/50" />
                              <span>
                                -{res.fuelUsedGal} gal @ {res.adjustedMpg} MPG
                              </span>
                              {res.segment.elevationGainFt !== 0 && (
                                <>
                                  <span>&middot;</span>
                                  <Mountain className="w-3 h-3 text-muted-foreground/50" />
                                  <span>{res.segment.elevationGainFt > 0 ? "+" : ""}{res.segment.elevationGainFt} ft</span>
                                </>
                              )}
                              {res.idleFuelGal > 0 && (
                                <>
                                  <span>&middot;</span>
                                  <Timer className="w-3 h-3 text-muted-foreground/50" />
                                  <span>{res.idleFuelGal} gal idle</span>
                                </>
                              )}
                            </div>

                            {showBreakdown && (
                              <div className="mt-1 pt-1 border-t border-border/50 text-xs text-muted-foreground/60 space-y-0.5">
                                <div>Terrain penalty: -{Math.round((1 - res.terrainMultiplier) * 100)}%</div>
                                {res.segment.elevationGainFt > 0 && (
                                  <div>Elevation penalty: -{Math.round((1 - res.elevationPenalty) * 100)}%</div>
                                )}
                                {res.descentRecovery > 1 && (
                                  <div className="text-emerald-400/70">Descent recovery: +{Math.round((res.descentRecovery - 1) * 100)}%</div>
                                )}
                                <div>Speed efficiency: {Math.round(res.speedPenalty * 100)}%</div>
                                {rigPenaltyResult.multiplier < 1 && (
                                  <div>Rig penalty: -{Math.round((1 - rigPenaltyResult.multiplier) * 100)}%</div>
                                )}
                              </div>
                            )}

                            {res.warnings.map((w, wi) => (
                              <div key={wi} className={`flex items-center gap-1 font-bold ${w.startsWith("Idle") ? "text-amber-400" : "text-red-400"}`}>
                                {w.startsWith("Idle") ? <Timer className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                {w}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isOutOfFuel ? "bg-red-500" : pct < 25 ? "bg-amber-500" : "bg-emerald-500"} ${isPonr ? "ring-2 ring-amber-400/50" : ""}`} />
                          <div className="flex-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">
                                {res.segment.name}
                              </span>
                              {isPonr && (
                                <span className="text-[9px] font-bold uppercase tracking-wide text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded" title="Past this point you don't have enough fuel to turn around and make it back to your start. You're committed to finding fuel ahead.">
                                  Point of No Return ⚠
                                </span>
                              )}
                            </div>
                            <span className={`text-sm font-bold ${isOutOfFuel ? "text-red-400" : pct < 25 ? "text-amber-400" : "text-emerald-400"}`}>
                              {isOutOfFuel ? "EMPTY" : `${res.fuelRemainingGal} gal (${pct}%)`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden" data-testid="segment-breakdown-table">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary flex-shrink-0" />
                      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Segment Breakdown
                      </h3>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-2">#</th>
                          <th className="px-4 py-2">Segment</th>
                          <th className="px-4 py-2 text-right">Dist</th>
                          <th className="px-4 py-2">Terrain</th>
                          <th className="px-4 py-2 text-right">Adj. MPG</th>
                          <th className="px-4 py-2 text-right">Fuel Used</th>
                          <th className="px-4 py-2 text-right">Remaining</th>
                          <th className="px-4 py-2 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tripResult.segments.map((res, idx) => {
                          const isOutOfFuel = tripResult.outOfFuelAtIdx !== null && idx >= tripResult.outOfFuelAtIdx;
                          return (
                            <tr
                              key={res.segment.id + idx}
                              className={`border-b border-border/50 ${isOutOfFuel ? "bg-red-500/5" : res.didRefuel ? "bg-blue-500/5" : ""}`}
                            >
                              <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                              <td className="px-4 py-2 font-bold text-foreground">
                                {res.didRefuel && <span className="text-blue-400 mr-1" title="Fuel stop">&#9981;</span>}
                                {res.segment.name}
                                {res.idleFuelGal > 0 && (
                                  <span className="text-amber-400 text-[9px] ml-1" title="Includes idle fuel">+idle</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-right text-muted-foreground">{res.segment.distanceMiles} mi</td>
                              <td className="px-4 py-2 text-muted-foreground">{terrainIcons[res.segment.terrain]} {terrainLabels[res.segment.terrain]}</td>
                              <td className="px-4 py-2 text-right font-bold text-foreground">{res.adjustedMpg}</td>
                              <td className="px-4 py-2 text-right text-red-400">-{res.fuelUsedGal}</td>
                              <td className={`px-4 py-2 text-right font-bold ${isOutOfFuel ? "text-red-400" : "text-foreground"}`}>
                                {isOutOfFuel ? "EMPTY" : `${res.fuelRemainingGal} gal`}
                              </td>
                              <td className="px-4 py-2 text-right text-muted-foreground">{formatTime(res.timeHours)}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-muted font-bold">
                          <td className="px-4 py-2" colSpan={2}>Total</td>
                          <td className="px-4 py-2 text-right">{tripResult.totalDistanceMiles} mi</td>
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2 text-right text-red-400">-{tripResult.totalFuelUsedGal}</td>
                          <td className={`px-4 py-2 text-right ${tripResult.outOfFuel ? "text-red-400" : "text-emerald-400"}`}>
                            {tripResult.outOfFuel ? "EMPTY" : `${tripResult.fuelRemainingGal} gal`}
                          </td>
                          <td className="px-4 py-2 text-right">{formatTime(tripResult.totalTimeHours)}</td>
                        </tr>
                        {gasPrice > 0 && (
                          <tr className="bg-muted/50">
                            <td className="px-4 py-2" colSpan={5}>
                              <span className="font-bold">Estimated Fuel Cost</span>
                              <span className="text-muted-foreground ml-2">@ ${gasPrice.toFixed(2)}/gal</span>
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-foreground" colSpan={3}>
                              ${tripResult.totalFuelCost.toFixed(2)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {(tripResult.outOfFuel || tripResult.reserveWarning) && (
                  <div className="bg-card border border-border rounded-lg p-4" data-testid="fuel-cache-recommendations">
                    <div className="flex items-center gap-2 mb-3">
                      <Fuel className="w-4 h-4 text-primary flex-shrink-0" />
                      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Fuel Cache Recommendations
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {tripResult.outOfFuel && (
                        <div className="flex items-start gap-2">
                          <ArrowDown className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <p>
                            <strong className="text-foreground">
                              Stash {Math.ceil(tripResult.totalFuelUsedGal - totalFuelGal + totalFuelGal * 0.1)} gallons
                            </strong>{" "}
                            before Segment {(tripResult.outOfFuelAtIdx ?? 0) + 1} to complete
                            this trip with a 10% reserve. That's{" "}
                            {Math.ceil((tripResult.totalFuelUsedGal - totalFuelGal + totalFuelGal * 0.1) / 5)}{" "}
                            jerry cans (5 gal each).
                            {gasPrice > 0 && (
                              <span className="text-muted-foreground">
                                {" "}Estimated cache cost: ${(Math.ceil(tripResult.totalFuelUsedGal - totalFuelGal + totalFuelGal * 0.1) * gasPrice).toFixed(2)}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      {!tripResult.outOfFuel && tripResult.reserveWarning && (
                        <div className="flex items-start gap-2">
                          <ArrowDown className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <p>
                            <strong className="text-foreground">Consider 1 extra jerry can (5 gal)</strong>{" "}
                            to maintain a comfortable reserve. You'll finish this trip with only{" "}
                            {tripResult.fuelRemainingGal} gallons remaining.
                          </p>
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-sm text-muted-foreground/60">
                        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <p>
                          Fuel caching is the practice of pre-positioning fuel along your route before the trip.
                          Standard jerry cans hold 5 gallons. Always use DOT-approved containers and check
                          local regulations.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!tripResult && segments.some((s) => s.distanceMiles === 0 && (s.idleMinutes ?? 0) === 0) && (
              <div className="bg-card border border-border rounded-lg p-6 text-center" data-testid="empty-state">
                <Route className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Add distance to your segments above to see fuel calculations.
                </p>
              </div>
            )}

            <DataPrivacyNotice />
            <SupportFooter />
          </div>

          <div className="max-w-3xl mt-16 space-y-8 no-print">
            <section>
              <h2 className="text-2xl font-extrabold mb-4">
                Why Terrain-Adjusted Fuel Planning Matters
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Your truck's EPA-rated highway MPG is meaningless the moment you leave
                pavement. Sand can cut fuel economy by 50%. Rock crawling drops it by 70%.
                Add elevation gain and cold weather, and that "400-mile range" turns
                into 180 real-world miles. The Fuel & Range Planner calculates what actually
                happens to your fuel across every terrain type.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you've built a Vehicle Profile, the planner automatically reads your
                rig's estimated MPG &mdash; including penalties from your lift, tires,
                roof rack, and added weight. Then it applies terrain, elevation, speed, and
                climate adjustments on top. The result is the most accurate fuel estimate you
                can get without a flow meter.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4">
                How the Calculations Work
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Each segment applies a multiplicative penalty chain to your base MPG. Highway
                is the baseline (1.0x). Gravel drops efficiency by ~22%. Sand by 50%. Rock
                crawling by 70% &mdash; you're barely moving, but the engine is working hard.
                Elevation gain adds ~15% fuel cost per 1,000 feet of climb. Speed matters too:
                driving 5 mph in low range burns 60% more fuel per mile than cruising at 50.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The Rig & Conditions panel adds another layer of accuracy. Your lift height,
                tire type, aero mods, towing load, altitude, headwind, and drive mode all
                multiply against your base MPG before terrain is even factored in. Negative
                elevation (descent) gives you a small fuel recovery bonus, capped at 15%.
                Idle time burns fuel at ~{IDLE_GPH} gal/hr without adding miles.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                These multipliers come from controlled testing by Expedition Portal, ARB,
                EPA altitude guidelines, and Oak Ridge National Lab fuel economy studies.
                They're not guesses &mdash; they're physics.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4">
                Fuel Caching for Overland Routes
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                When your trip exceeds your tank's range, the planner recommends exactly
                how many gallons to cache and where. Fuel caching &mdash; stashing DOT-approved
                jerry cans at waypoints before your trip &mdash; is standard practice for remote
                overlanding in the American West, Australia, and Africa. Standard NATO jerry
                cans hold 5.3 gallons. The planner accounts for your auxiliary tank and any
                extra cans you're already carrying.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
