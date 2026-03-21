import { useState, useMemo } from "react";
import {
  AlertTriangle, MapPin, ShieldCheck, X, ChevronDown, ChevronRight,
  Flame, Waves, Mountain, Wind, Zap, Thermometer, CloudSnow,
  Activity, Sun, Cloud, Info,
} from "lucide-react";
import zipDataRaw from "./zip-data.json";
import { getStateRisk, levelColor, HAZARDS, type HazardScore } from "./threat-risk-data";
import { useSEO } from "@/hooks/useSEO";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import InstallButton from "@/components/tools/InstallButton";
import { trackEvent } from "@/lib/analytics";

const zipData = zipDataRaw as Record<string, { st: string }>;

// ─── Category Icon Map ─────────────────────────────────────────────

function HazardIcon({ id, className, style }: { id: string; className?: string; style?: React.CSSProperties }) {
  const cls = className || "w-4 h-4";
  const props = { className: cls, style };
  switch (id) {
    case "wildfire": return <Flame {...props} />;
    case "coastal-flood":
    case "riverine-flood":
    case "tsunami": return <Waves {...props} />;
    case "avalanche":
    case "landslide":
    case "volcano": return <Mountain {...props} />;
    case "hurricane":
    case "strong-wind":
    case "tornado": return <Wind {...props} />;
    case "lightning": return <Zap {...props} />;
    case "earthquake": return <Activity {...props} />;
    case "heat-wave":
    case "drought": return <Sun {...props} />;
    case "cold-wave":
    case "winter-weather":
    case "ice-storm": return <CloudSnow {...props} />;
    case "hail": return <Cloud {...props} />;
    default: return <AlertTriangle {...props} />;
  }
}

// ─── Risk Bar ──────────────────────────────────────────────────────

function RiskBar({ hazard, expanded, onToggle }: {
  hazard: HazardScore;
  expanded: boolean;
  onToggle: () => void;
}) {
  const color = levelColor(hazard.level);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left"
      >
        <HazardIcon id={hazard.id} className="w-4 h-4 flex-shrink-0" style={{ color }} />
        <span className="text-sm font-bold flex-1 text-foreground">{hazard.label}</span>
        <span
          className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded"
          style={{ color, backgroundColor: `${color}20` }}
        >
          {hazard.levelLabel}
        </span>
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden flex-shrink-0">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${hazard.score}%`, backgroundColor: color }}
          />
        </div>
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        }
      </button>
      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/20">
          <p className="text-sm text-muted-foreground">{hazard.description}</p>
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Priority Actions</p>
            {hazard.actions.map((action, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-primary font-bold flex-shrink-0 mt-0.5">›</span>
                <span className="text-foreground leading-snug">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Top Threat Card ───────────────────────────────────────────────

function TopThreatBadge({ hazard, rank }: { hazard: HazardScore; rank: number }) {
  const color = levelColor(hazard.level);
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-extrabold"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {rank}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <HazardIcon id={hazard.id} className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
          <span className="text-sm font-extrabold text-foreground truncate">{hazard.label}</span>
        </div>
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color }}
        >
          {hazard.levelLabel} Risk
        </span>
        <p className="text-xs text-muted-foreground mt-1 leading-snug line-clamp-2">
          {hazard.actions[0]}
        </p>
      </div>
    </div>
  );
}

// ─── State Name Map ────────────────────────────────────────────────

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "Washington D.C.", FL: "Florida",
  GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana",
  IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine",
  MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island",
  SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin",
  WY: "Wyoming",
};

// ─── Category grouping ─────────────────────────────────────────────

const CATEGORIES = ["Severe Weather", "Flood", "Climate", "Geologic", "Winter / Climate", "Mountain / Winter"];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function ThreatRiskDashboard() {
  useSEO({
    title: "Threat-Specific Risk Dashboard | Prepper Evolution",
    description: "Enter your ZIP code to get FEMA-sourced risk scores for 18 natural hazard types. See probability bars, priority prep actions, and your top threats.",
  });

  const [zip, setZip] = useState("");
  const [submittedZip, setSubmittedZip] = useState("");
  const [expandedHazard, setExpandedHazard] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const state = useMemo(() => {
    if (submittedZip.length < 3) return null;
    const prefix = submittedZip.substring(0, 3);
    return zipData[prefix]?.st || null;
  }, [submittedZip]);

  const hazards = useMemo(() => {
    if (!state) return [];
    return getStateRisk(state);
  }, [state]);

  const topThreats = useMemo(() => {
    return hazards.filter((h) => h.level === "very-high" || h.level === "high").slice(0, 5);
  }, [hazards]);

  const filteredHazards = useMemo(() => {
    if (filterCategory === "all") return hazards;
    return hazards.filter((h) => h.category === filterCategory);
  }, [hazards, filterCategory]);

  const overallLevel = useMemo(() => {
    if (hazards.length === 0) return null;
    const vhCount = hazards.filter((h) => h.level === "very-high").length;
    const hCount = hazards.filter((h) => h.level === "high").length;
    if (vhCount >= 3) return { label: "Elevated Multi-Hazard Zone", color: "#EF4444" };
    if (vhCount >= 1) return { label: "High-Risk Zone", color: "#F97316" };
    if (hCount >= 3) return { label: "Moderate-High Zone", color: "#EAB308" };
    return { label: "Baseline Risk Zone", color: "#3B82F6" };
  }, [hazards]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = zip.replace(/\D/g, "").substring(0, 5);
    if (clean.length >= 3) {
      setSubmittedZip(clean);
      trackEvent("pe_tool_use", { tool: "threat-risk-dashboard", zip: clean.substring(0, 3) });
    }
  };

  const handleToggle = (id: string) => {
    setExpandedHazard((prev) => (prev === id ? null : id));
  };

  return (
    <div className="py-16 sm:py-20 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
      {/* Title */}
      <div>
        <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Ops Deck</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          Threat-Specific <span className="text-primary">Risk Dashboard</span>
        </h1>
      </div>

      {/* How It Works */}
      <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-extrabold mb-3">How This Tool Works</h3>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          Enter your ZIP code and get risk scores for all 18 FEMA-tracked natural hazard types — scored
          from Very Low to Very High based on the National Risk Index (NRI). The NRI is built from Expected
          Annual Loss, Social Vulnerability, and Community Resilience data at the county level. Your top
          threats get priority actions specific to your area.
        </p>
      </div>

      {/* ZIP Input */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold">Enter Your ZIP Code</h2>
            <p className="text-xs text-muted-foreground">Risk data sourced from FEMA National Risk Index</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, "").substring(0, 5))}
            placeholder="e.g. 08050"
            maxLength={5}
            className="flex-1 bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors font-mono tracking-widest"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            Check Threats
          </button>
        </form>
        {submittedZip && !state && (
          <p className="text-sm text-red-500 mt-2">ZIP code not found. Try a different ZIP.</p>
        )}
      </div>

      {/* Results */}
      {state && hazards.length > 0 && (
        <>
          {/* Location Header */}
          <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Your Location</p>
                <h3 className="text-xl font-extrabold text-foreground">
                  {STATE_NAMES[state] || state} — ZIP {submittedZip}
                </h3>
                {overallLevel && (
                  <p className="text-sm font-bold" style={{ color: overallLevel.color }}>
                    {overallLevel.label}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span>State-level FEMA NRI data</span>
            </div>
          </div>

          {/* Top Threats */}
          {topThreats.length > 0 && (
            <div>
              <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Your Top {topThreats.length} Threat{topThreats.length !== 1 ? "s" : ""}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topThreats.map((h, i) => (
                  <TopThreatBadge key={h.id} hazard={h} rank={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Full Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-lg font-extrabold">All 18 FEMA Hazard Types</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors ${
                    filterCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors ${
                      filterCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Level Legend */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
              {(["very-low", "low", "moderate", "high", "very-high"] as const).map((level) => (
                <div key={level} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: levelColor(level) }} />
                  <span className="text-muted-foreground capitalize">{level.replace("-", " ")}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {filteredHazards.map((hazard) => (
                <RiskBar
                  key={hazard.id}
                  hazard={hazard}
                  expanded={expandedHazard === hazard.id}
                  onToggle={() => handleToggle(hazard.id)}
                />
              ))}
              {filteredHazards.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No hazards in this category for your location.</p>
              )}
            </div>
          </div>

          {/* Score Summary */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-base font-extrabold mb-3">Risk Score Summary</h3>
            <div className="grid grid-cols-5 gap-2 text-center">
              {(["very-high", "high", "moderate", "low", "very-low"] as const).map((level) => {
                const count = hazards.filter((h) => h.level === level).length;
                const color = levelColor(level);
                return (
                  <div key={level} className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-extrabold" style={{ color }}>{count}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">
                      {level.replace("-", " ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Share */}
          <ToolSocialShare
            title="Check your location's FEMA risk profile for 18 hazard types"
            url="/tools/threat-risk-dashboard"
          />

          <DataPrivacyNotice />
        </>
      )}

      {/* Empty state — no ZIP yet */}
      {!submittedZip && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground text-sm">
            Enter your ZIP code above to see your hazard risk profile.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Covers all 18 FEMA National Risk Index hazard types across the continental US, Alaska, and Hawaii.
          </p>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <InstallButton />
      </div>

      <SupportFooter />
    </div>
    </div>
    </div>
  );
}
