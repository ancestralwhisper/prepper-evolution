
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Radar, Cloud, AlertTriangle, Flame, ChevronDown, ChevronRight,
  RefreshCw, X, MapPin, Clock, WifiOff, Mountain, ExternalLink,
  ShieldAlert, Route, TreePine, Wind, Droplets, Activity,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { TrailIntelResponse } from "@/lib/trail-intel-types";
import { TRAIL_SYSTEMS, findNearbyTrailSystems, detectTrailSystem } from "@/pages/tools/trail-systems";

// ─── Props ───────────────────────────────────────────────────────

interface TrailIntelProps {
  destinationZip?: string;
  showZipInput?: boolean;
  defaultCollapsed?: boolean;
  onDataLoaded?: (data: TrailIntelResponse) => void;
  compact?: boolean;
}

// ─── localStorage keys ───────────────────────────────────────────

const DEST_ZIP_KEY = "pe-destination-zip";
const CACHE_KEY = "pe-trail-intel-cache";
const TRAIL_SYSTEM_KEY = "pe-trail-system";
const CLIENT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ─── Threat level config ─────────────────────────────────────────

const THREAT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  clear: { label: "All Clear", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  advisory: { label: "Advisory", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/30" },
  watch: { label: "Watch", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" },
  warning: { label: "Warning", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" },
};

// ─── Severity badge colors ───────────────────────────────────────

function severityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "extreme": return "bg-red-500 text-white";
    case "severe": return "bg-red-400/20 text-red-400";
    case "moderate": return "bg-amber-400/20 text-amber-400";
    case "minor": return "bg-sky-400/20 text-sky-400";
    default: return "bg-muted/20 text-muted-foreground";
  }
}

// ─── NPS alert category colors ───────────────────────────────────

function alertCategoryColor(category: string): string {
  switch (category) {
    case "Closure": return "bg-red-400/20 text-red-400";
    case "Danger": return "bg-red-500 text-white";
    case "Caution": return "bg-amber-400/20 text-amber-400";
    case "Information": return "bg-sky-400/20 text-sky-400";
    default: return "bg-muted/20 text-muted-foreground";
  }
}

// ─── AQI color helpers ───────────────────────────────────────────

function aqiColor(aqi: number): string {
  if (aqi <= 50) return "text-emerald-400";
  if (aqi <= 100) return "text-yellow-400";
  if (aqi <= 150) return "text-amber-400";
  if (aqi <= 200) return "text-orange-400";
  if (aqi <= 300) return "text-red-400";
  return "text-purple-400";
}

function aqiBg(aqi: number): string {
  if (aqi <= 50) return "bg-emerald-400/10 border-emerald-400/30";
  if (aqi <= 100) return "bg-yellow-400/10 border-yellow-400/30";
  if (aqi <= 150) return "bg-amber-400/10 border-amber-400/30";
  if (aqi <= 200) return "bg-orange-400/10 border-orange-400/30";
  if (aqi <= 300) return "bg-red-400/10 border-red-400/30";
  return "bg-purple-400/10 border-purple-400/30";
}

// ─── Gauge status color ──────────────────────────────────────────

function gaugeStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "major": return "text-red-400";
    case "moderate": return "text-orange-400";
    case "minor": return "text-amber-400";
    case "action": return "text-yellow-400";
    default: return "text-emerald-400";
  }
}

// ─── Land type badge ─────────────────────────────────────────────

function landTypeBadge(landType: string): { label: string; color: string } {
  switch (landType) {
    case "blm": return { label: "BLM", color: "bg-amber-400/20 text-amber-400" };
    case "usfs": return { label: "USFS", color: "bg-emerald-400/20 text-emerald-400" };
    case "nps": return { label: "NPS", color: "bg-green-400/20 text-green-400" };
    case "private": return { label: "Private", color: "bg-purple-400/20 text-purple-400" };
    case "mixed": return { label: "Mixed Federal", color: "bg-orange-400/20 text-orange-400" };
    default: return { label: landType.toUpperCase(), color: "bg-muted/20 text-muted-foreground" };
  }
}

// ─── Time ago helper ─────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Component ───────────────────────────────────────────────────

export default function TrailIntel({
  destinationZip,
  showZipInput = true,
  defaultCollapsed = true,
  onDataLoaded,
  compact = false,
}: TrailIntelProps) {
  const [zip, setZip] = useState(destinationZip || "");
  const [data, setData] = useState<TrailIntelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleData, setStaleData] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState<string>("");

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [panels, setPanels] = useState({ weather: true, disasters: true, wildfires: true, trailSystem: true, airQuality: true, streamGauges: false, earthquakes: false });

  const fetchedRef = useRef({ zip: "", trail: "" });

  // Nearby trail systems based on current data coords
  const nearbyTrails = useMemo(() => {
    if (!data) return [];
    return findNearbyTrailSystems(data.coords.lat, data.coords.lon);
  }, [data]);

  // Load saved destination ZIP + trail system on mount
  useEffect(() => {
    if (destinationZip) {
      setZip(destinationZip);
    } else {
      const saved = localStorage.getItem(DEST_ZIP_KEY);
      if (saved && saved.length === 5) {
        setZip(saved);
      }
    }
    const savedTrail = localStorage.getItem(TRAIL_SYSTEM_KEY);
    if (savedTrail) {
      setSelectedTrail(savedTrail);
    }
  }, [destinationZip]);

  // Auto-fetch when zip is 5 digits or trail selection changes
  useEffect(() => {
    if (zip.length === 5 && (zip !== fetchedRef.current.zip || selectedTrail !== fetchedRef.current.trail)) {
      fetchIntel(zip, selectedTrail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip, selectedTrail]);

  // Auto-detect trail system when first data loads (if none selected)
  useEffect(() => {
    if (data && !selectedTrail) {
      const detected = detectTrailSystem(data.coords.lat, data.coords.lon);
      if (detected) {
        setSelectedTrail(detected.id);
        localStorage.setItem(TRAIL_SYSTEM_KEY, detected.id);
      }
    }
  }, [data, selectedTrail]);

  const fetchIntel = useCallback(async (targetZip: string, trailId: string) => {
    const clean = targetZip.replace(/\D/g, "").substring(0, 5);
    if (clean.length !== 5) return;

    const cacheId = trailId ? `${clean}:${trailId}` : clean;

    // Check client cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.cacheId === cacheId && Date.now() - new Date(parsed.fetchedAt).getTime() < CLIENT_CACHE_TTL) {
          setData(parsed.data);
          setStaleData(false);
          setError(null);
          fetchedRef.current = { zip: clean, trail: trailId };
          onDataLoaded?.(parsed.data);
          return;
        }
      }
    } catch { /* ignore corrupt cache */ }

    setLoading(true);
    setError(null);
    setStaleData(false);

    try {
      const trailParam = trailId ? `&trail=${encodeURIComponent(trailId)}` : "";
      const res = await fetch(`/api/trail-intel?zip=${clean}${trailParam}`);
      if (res.status === 429) {
        setError("Rate limited — try again in a few minutes.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const result: TrailIntelResponse = await res.json();
      setData(result);
      fetchedRef.current = { zip: clean, trail: trailId };

      // Save to client cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({ cacheId, data: result, fetchedAt: result.fetchedAt }));
      localStorage.setItem(DEST_ZIP_KEY, clean);

      const tool = window.location.pathname.split("/").pop() || "trail-intel";
      trackEvent("pe_trail_intel_fetch", { zip3: clean.substring(0, 3), tool, threatLevel: result.overallThreatLevel });

      onDataLoaded?.(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch intel";
      setError(msg);

      // Try to show stale cache
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.cacheId === cacheId) {
            setData(parsed.data);
            setStaleData(true);
          }
        }
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded]);

  const handleRefresh = () => {
    if (zip.length === 5) {
      localStorage.removeItem(CACHE_KEY);
      fetchedRef.current = { zip: "", trail: "" };
      const tool = window.location.pathname.split("/").pop() || "trail-intel";
      trackEvent("pe_trail_intel_refresh", { zip3: zip.substring(0, 3), tool });
      fetchIntel(zip, selectedTrail);
    }
  };

  const handleZipChange = (value: string) => {
    const clean = value.replace(/\D/g, "").substring(0, 5);
    setZip(clean);
    if (clean.length === 5) {
      localStorage.setItem(DEST_ZIP_KEY, clean);
      const tool = window.location.pathname.split("/").pop() || "trail-intel";
      trackEvent("pe_destination_zip_set", { zip3: clean.substring(0, 3), tool });
    }
  };

  const handleTrailChange = (trailId: string) => {
    setSelectedTrail(trailId);
    if (trailId) {
      localStorage.setItem(TRAIL_SYSTEM_KEY, trailId);
    } else {
      localStorage.removeItem(TRAIL_SYSTEM_KEY);
    }
    const tool = window.location.pathname.split("/").pop() || "trail-intel";
    trackEvent("pe_trail_system_selected", { trailId: trailId || "none", tool });
  };

  const clearZip = () => {
    setZip("");
    setData(null);
    setError(null);
    setStaleData(false);
    setSelectedTrail("");
    fetchedRef.current = { zip: "", trail: "" };
    localStorage.removeItem(DEST_ZIP_KEY);
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(TRAIL_SYSTEM_KEY);
  };

  const togglePanel = (key: keyof typeof panels) => {
    setPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const threat = data ? THREAT_CONFIG[data.overallThreatLevel] || THREAT_CONFIG.clear : null;
  const ts = data?.trailSystem;

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className={`bg-card border border-border rounded-lg ${compact ? "" : ""}`}>
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 p-4 text-left hover:text-primary transition-colors"
      >
        <Radar className="w-4 h-4 text-orange-400 flex-shrink-0" />
        <span className="text-sm font-extrabold flex-1">Trail Intel</span>
        {threat && data && (
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${threat.bg} ${threat.color}`}>
            {threat.label}
          </span>
        )}
        {loading && (
          <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
        )}
        {collapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {!collapsed && (
        <div className={`px-4 pb-4 space-y-4 ${compact ? "space-y-3" : ""}`}>
          {/* Subtitle */}
          <p className="text-[11px] text-muted-foreground leading-relaxed -mt-1">
            Real-time conditions at your destination
          </p>

          {/* ZIP Input */}
          {showZipInput && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                Where are you heading?
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3 w-3.5 h-3.5 text-muted/40" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Destination ZIP code"
                  value={zip}
                  onChange={(e) => handleZipChange(e.target.value)}
                  maxLength={5}
                  className="w-full bg-muted border border-border rounded-lg pl-8 pr-8 py-2.5 text-sm font-mono tracking-wider text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary/50 transition-colors"
                  aria-label="Destination ZIP code"
                />
                {zip.length > 0 && (
                  <button
                    onClick={clearZip}
                    className="absolute right-2 p-1 text-muted/40 hover:text-muted transition-colors"
                    aria-label="Clear destination"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Trail System Dropdown */}
          {data && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                Trail System
              </label>
              <div className="relative flex items-center">
                <Mountain className="absolute left-3 w-3.5 h-3.5 text-muted/40" />
                <select
                  value={selectedTrail}
                  onChange={(e) => handleTrailChange(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg pl-8 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                  aria-label="Trail system"
                >
                  <option value="">None — ZIP only</option>
                  {nearbyTrails.length > 0 && (
                    <optgroup label="Nearby">
                      {nearbyTrails.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="All Trail Systems">
                    {TRAIL_SYSTEMS.filter((t) => !nearbyTrails.find((n) => n.id === t.id)).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="absolute right-3 w-3.5 h-3.5 text-muted/40 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Empty state */}
          {!data && !loading && !error && zip.length < 5 && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Punch in a ZIP and we&apos;ll pull weather alerts, disaster declarations, and active wildfires from government feeds. Select a trail system for NPS alerts, BLM route status, and USFS seasonal access. Updated every 15 minutes.
            </p>
          )}

          {/* Loading skeleton */}
          {loading && !data && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted border border-border rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !data && (
            <div className="flex items-start gap-2 bg-red-400/5 border border-red-400/20 rounded-lg p-3">
              <WifiOff className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-400">{error}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Unable to fetch — check connection.</p>
              </div>
            </div>
          )}

          {/* Stale data banner */}
          {staleData && (
            <div className="flex items-center gap-2 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <p className="text-[11px] text-amber-400 font-bold">Data may be outdated</p>
            </div>
          )}

          {/* Data panels */}
          {data && (
            <>
              {/* Overall status message */}
              {data.overallThreatLevel === "clear" && (
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${THREAT_CONFIG.clear.bg} border ${THREAT_CONFIG.clear.border}`}>
                  <Radar className={`w-3.5 h-3.5 ${THREAT_CONFIG.clear.color} flex-shrink-0`} />
                  <p className={`text-[11px] font-bold ${THREAT_CONFIG.clear.color}`}>
                    All clear. No active alerts, disasters, or fires reported for this area.
                  </p>
                </div>
              )}
              {(data.overallThreatLevel === "watch" || data.overallThreatLevel === "warning") && (
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${THREAT_CONFIG[data.overallThreatLevel].bg} border ${THREAT_CONFIG[data.overallThreatLevel].border}`}>
                  <AlertTriangle className={`w-3.5 h-3.5 ${THREAT_CONFIG[data.overallThreatLevel].color} flex-shrink-0`} />
                  <p className={`text-[11px] font-bold ${THREAT_CONFIG[data.overallThreatLevel].color}`}>
                    Heads up — active alerts in this area. Check details before you roll out.
                  </p>
                </div>
              )}

              {/* ─── Trail System Panel (4th panel, shown first if present) ─── */}
              {ts && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => togglePanel("trailSystem")}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <Mountain className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                    <span className="text-xs font-extrabold flex-1">{ts.name}</span>
                    {(() => {
                      const badge = landTypeBadge(ts.landType);
                      return (
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${badge.color}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                    {panels.trailSystem ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                  {panels.trailSystem && (
                    <div className="px-3 pb-3 space-y-3">

                      {/* Private trail system fallback */}
                      {ts.landType === "private" && ts.websiteUrl && (
                        <div className="bg-muted rounded-lg p-3 space-y-2">
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            This is a private trail system. Federal APIs don&apos;t cover it.
                          </p>
                          <a
                            href={ts.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                          >
                            Check current conditions
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* NPS Park Alerts */}
                      {ts.parkAlerts && ts.parkAlerts.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <ShieldAlert className="w-3 h-3 text-green-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">NPS Park Alerts</span>
                          </div>
                          {ts.parkAlerts.map((alert, i) => (
                            <div key={i} className="bg-muted rounded-lg p-2.5 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-foreground">{alert.title}</span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${alertCategoryColor(alert.category)}`}>
                                  {alert.category}
                                </span>
                                {alert.park && (
                                  <span className="text-[9px] font-mono text-muted/60">{alert.park}</span>
                                )}
                              </div>
                              {alert.description && (
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {ts.parkAlerts && ts.parkAlerts.length === 0 && (
                        <div className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3 h-3 text-green-400" />
                          <span className="text-[11px] text-muted/60">No active NPS park alerts.</span>
                        </div>
                      )}

                      {/* BLM Route Status */}
                      {ts.routeStatus && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Route className="w-3 h-3 text-amber-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">BLM Route Status</span>
                          </div>
                          {ts.routeStatus.total > 0 ? (
                            <div className="bg-muted rounded-lg p-2.5 space-y-2">
                              {/* Stacked bar */}
                              <div className="w-full h-3 rounded-full overflow-hidden flex bg-muted/10">
                                {ts.routeStatus.open > 0 && (
                                  <div
                                    className="bg-emerald-400 h-full"
                                    style={{ width: `${(ts.routeStatus.open / ts.routeStatus.total) * 100}%` }}
                                  />
                                )}
                                {ts.routeStatus.limited > 0 && (
                                  <div
                                    className="bg-amber-400 h-full"
                                    style={{ width: `${(ts.routeStatus.limited / ts.routeStatus.total) * 100}%` }}
                                  />
                                )}
                                {ts.routeStatus.closed > 0 && (
                                  <div
                                    className="bg-red-400 h-full"
                                    style={{ width: `${(ts.routeStatus.closed / ts.routeStatus.total) * 100}%` }}
                                  />
                                )}
                              </div>
                              {/* Counts */}
                              <div className="flex items-center gap-3 text-[11px]">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                  <span className="text-emerald-400 font-bold">{ts.routeStatus.open}</span>
                                  <span className="text-muted-foreground">Open</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                                  <span className="text-amber-400 font-bold">{ts.routeStatus.limited}</span>
                                  <span className="text-muted-foreground">Limited</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-red-400" />
                                  <span className="text-red-400 font-bold">{ts.routeStatus.closed}</span>
                                  <span className="text-muted-foreground">Closed</span>
                                </span>
                              </div>
                              {/* Limitation notes */}
                              {ts.routeStatus.limitationNotes.length > 0 && (
                                <div className="space-y-1 pt-1 border-t border-border">
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Limitations</p>
                                  {ts.routeStatus.limitationNotes.map((note, i) => (
                                    <p key={i} className="text-[11px] text-muted/80 leading-relaxed">{note}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-muted/60">No BLM route data available for this area.</p>
                          )}
                        </div>
                      )}

                      {/* USFS Seasonal Access */}
                      {ts.seasonalAccess && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <TreePine className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                              USFS Seasonal Access — {ts.seasonalAccess.forest}
                            </span>
                          </div>
                          {ts.seasonalAccess.vehicleAccess.length > 0 ? (
                            <div className="bg-muted rounded-lg p-2.5 space-y-2">
                              {ts.seasonalAccess.vehicleAccess.map((v, i) => (
                                <div key={i} className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-bold text-foreground">{v.type}</span>
                                  <div className="flex items-center gap-2 text-[11px]">
                                    <span className="text-emerald-400 font-mono">{v.openTrails} open</span>
                                    {v.closedTrails > 0 && (
                                      <span className="text-red-400 font-mono">{v.closedTrails} closed</span>
                                    )}
                                    <span className="text-muted/50 text-[10px]">{v.seasonNote}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-muted/60">No USFS MVUM data available for this forest.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Weather Alerts Panel */}
              <div className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => togglePanel("weather")}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <Cloud className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span className="text-xs font-extrabold flex-1">Weather Alerts</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{data.weather.alerts.length}</span>
                  {panels.weather ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {panels.weather && (
                  <div className="px-3 pb-3 space-y-2">
                    {data.weather.alerts.length === 0 ? (
                      <p className="text-[11px] text-muted/60">No active weather alerts.</p>
                    ) : (
                      data.weather.alerts.map((alert, i) => (
                        <div key={i} className="bg-muted rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{alert.event}</span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${severityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          {alert.headline && (
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.headline}</p>
                          )}
                          {alert.expires && (
                            <p className="text-[10px] text-muted/60">
                              Expires: {new Date(alert.expires).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Disaster Declarations Panel */}
              <div className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => togglePanel("disasters")}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <span className="text-xs font-extrabold flex-1">Disaster Declarations</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{data.disasters.active.length}</span>
                  {panels.disasters ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {panels.disasters && (
                  <div className="px-3 pb-3 space-y-2">
                    {data.disasters.active.length === 0 ? (
                      <p className="text-[11px] text-muted/60">
                        No active FEMA disaster declarations for {data.state}.
                        {data.disasters.recentCount > 0 && (
                          <span className="text-muted/40"> ({data.disasters.recentCount} in last 12 months)</span>
                        )}
                      </p>
                    ) : (
                      data.disasters.active.map((d, i) => (
                        <div key={i} className="bg-muted rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{d.title}</span>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-400/20 text-orange-400">
                              {d.type}
                            </span>
                          </div>
                          {d.county && (
                            <p className="text-[11px] text-muted-foreground">{d.county}</p>
                          )}
                          {d.declarationDate && (
                            <p className="text-[10px] text-muted/60">
                              Declared: {new Date(d.declarationDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                    {data.disasters.recentCount > 0 && data.disasters.active.length > 0 && (
                      <p className="text-[10px] text-muted/50">
                        {data.disasters.recentCount} total declaration(s) in {data.state} in last 12 months
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Active Wildfires Panel */}
              <div className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => togglePanel("wildfires")}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span className="text-xs font-extrabold flex-1">Active Wildfires</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{data.wildfires.nearbyCount}</span>
                  {panels.wildfires ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {panels.wildfires && (
                  <div className="px-3 pb-3 space-y-2">
                    {data.wildfires.active.length === 0 ? (
                      <p className="text-[11px] text-muted/60">No active wildfires within ~100 miles.</p>
                    ) : (
                      data.wildfires.active.map((fire, i) => (
                        <div key={i} className="bg-muted rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{fire.name}</span>
                            {fire.percentContained > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-400/20 text-red-400">
                                {fire.percentContained}% contained
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            {fire.acres > 0 && <span>{fire.acres.toLocaleString()} acres</span>}
                            {fire.discoveredAt && <span>Discovered: {new Date(fire.discoveredAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Fire Restrictions subsection */}
                    {data.fireRestrictions && data.fireRestrictions.areas.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Fire Restrictions</p>
                        {data.fireRestrictions.areas.map((area, i) => (
                          <div key={i} className="bg-muted rounded-lg p-2.5 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-foreground">{area.name}</span>
                              {area.level > 0 && (
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${area.level >= 2 ? "bg-red-400/20 text-red-400" : "bg-amber-400/20 text-amber-400"}`}>
                                  Stage {area.level}
                                </span>
                              )}
                            </div>
                            {area.description && (
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{area.description}</p>
                            )}
                            {area.effectiveDate && (
                              <p className="text-[10px] text-muted/60">Effective: {area.effectiveDate}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Air Quality Panel */}
              {(data.airQuality?.available && data.airQuality.readings.length > 0) ? (
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => togglePanel("airQuality")}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <Wind className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span className="text-xs font-extrabold flex-1">Air Quality</span>
                    {data.airQuality.maxAqi > 0 && (
                      <span className={`text-[10px] font-mono ${aqiColor(data.airQuality.maxAqi)}`}>
                        AQI {data.airQuality.maxAqi}
                      </span>
                    )}
                    {panels.airQuality ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                  {panels.airQuality && (
                    <div className="px-3 pb-3 space-y-2">
                      {data.airQuality.readings.map((r, i) => (
                        <div key={i} className={`rounded-lg p-2.5 border ${aqiBg(r.aqi)}`}>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{r.parameter}</span>
                            <span className={`text-sm font-bold font-mono ${aqiColor(r.aqi)}`}>{r.aqi}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mt-1">
                            <span className={`font-bold ${aqiColor(r.aqi)}`}>{r.category}</span>
                            {r.reportingArea && (
                              <span className="text-muted/60">{r.reportingArea}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-muted/50">
                        AQI 0–50 Good · 51–100 Moderate · 101–150 Sensitive Groups · 151+ Unhealthy
                      </p>
                    </div>
                  )}
                </div>
              ) : data.airQuality && !data.airQuality.available ? (
                <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg">
                  <Wind className="w-3.5 h-3.5 text-muted/40 flex-shrink-0" />
                  <p className="text-[11px] text-muted/50">AQI data unavailable</p>
                </div>
              ) : null}

              {/* Stream Gauges Panel */}
              {data.streamGauges && data.streamGauges.gauges.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => togglePanel("streamGauges")}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <Droplets className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-extrabold flex-1">Stream Gauges</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{data.streamGauges.gauges.length}</span>
                    {panels.streamGauges ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                  {panels.streamGauges && (
                    <div className="px-3 pb-3 space-y-2">
                      {data.streamGauges.hasElevated && (
                        <div className="flex items-center gap-2 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <p className="text-[11px] text-amber-400 font-bold">One or more gauges at elevated stage</p>
                        </div>
                      )}
                      {data.streamGauges.gauges.map((g, i) => (
                        <div key={i} className="bg-muted rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{g.name}</span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted/60 ${gaugeStatusColor(g.status)}`}>
                              {g.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            {g.observed !== null && (
                              <span>Stage: <span className="text-foreground font-mono">{g.observed} ft</span></span>
                            )}
                            {g.floodStage !== null && (
                              <span>Flood: <span className="text-foreground font-mono">{g.floodStage} ft</span></span>
                            )}
                            {g.url && (
                              <a
                                href={g.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:text-primary-hover transition-colors"
                              >
                                Details <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Earthquakes Panel */}
              {data.earthquakes && data.earthquakes.events.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => togglePanel("earthquakes")}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                    <span className="text-xs font-extrabold flex-1">Recent Earthquakes</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{data.earthquakes.events.length}</span>
                    {panels.earthquakes ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                  {panels.earthquakes && (
                    <div className="px-3 pb-3 space-y-2">
                      {data.earthquakes.events.map((eq, i) => (
                        <div key={i} className="bg-muted rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-bold font-mono ${eq.magnitude >= 5 ? "text-red-400" : eq.magnitude >= 4 ? "text-amber-400" : "text-foreground"}`}>
                              M{eq.magnitude.toFixed(1)}
                            </span>
                            <span className="text-xs font-bold text-foreground">{eq.place}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span>{timeAgo(eq.time)}</span>
                            <span>Depth: {eq.depthKm.toFixed(1)} km</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Footer: last updated + refresh */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[10px] text-muted/50">
                  <Clock className="w-3 h-3" />
                  <span>Updated {timeAgo(data.fetchedAt)}</span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {/* API errors */}
              {data.errors.length > 0 && (
                <div className="flex items-start gap-1.5 text-[10px] text-amber-400/70">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>Partial data: {data.errors.join(", ")}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
