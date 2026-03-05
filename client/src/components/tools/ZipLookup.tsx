
import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Check, X, AlertTriangle } from "lucide-react";
import type { ZipPrefixData, ZipDataMap } from "@/pages/tools/zip-types";
import { climateZoneLabels, hazardLabels } from "@/pages/tools/zip-types";
import { trackEvent } from "@/lib/analytics";

// Static import — ~60-80KB raw, ~15-20KB gzipped
import zipDataRaw from "@/pages/tools/zip-data.json";
const zipData = zipDataRaw as ZipDataMap;

// ─── State name lookup ─────────────────────────────────────────────
const stateNames: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "Washington DC", FL: "Florida",
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

// ─── localStorage key ──────────────────────────────────────────────
const ZIP_KEY = "pe-zip";

// ─── Public hook: read persisted ZIP without rendering input ───────
export function usePersistedZip(): { zip: string | null; data: ZipPrefixData | null } {
  const [zip, setZip] = useState<string | null>(null);
  const [data, setData] = useState<ZipPrefixData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(ZIP_KEY);
    if (saved && saved.length === 5) {
      const prefix = saved.substring(0, 3);
      const entry = zipData[prefix];
      if (entry) {
        setZip(saved);
        setData(entry);
      }
    }
  }, []);

  return { zip, data };
}

// ─── Component props ───────────────────────────────────────────────
interface ZipLookupProps {
  onResult: (data: ZipPrefixData | null, zip: string) => void;
  showFields?: Array<"climate" | "solar" | "region" | "hazard" | "hardiness" | "frost" | "growing">;
  compact?: boolean;
}

export default function ZipLookup({ onResult, showFields, compact }: ZipLookupProps) {
  const [zip, setZip] = useState("");
  const [result, setResult] = useState<ZipPrefixData | null>(null);
  const [error, setError] = useState(false);
  const hasFired = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(ZIP_KEY);
    if (saved && saved.length === 5) {
      const prefix = saved.substring(0, 3);
      const entry = zipData[prefix];
      if (entry) {
        setZip(saved);
        setResult(entry);
        if (!hasFired.current) {
          onResult(entry, saved);
          hasFired.current = true;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lookup = useCallback(
    (value: string) => {
      const clean = value.replace(/\D/g, "").substring(0, 5);
      setZip(clean);
      setError(false);

      if (clean.length >= 3) {
        const prefix = clean.substring(0, 3);
        const entry = zipData[prefix];
        if (entry) {
          setResult(entry);
          if (clean.length === 5) {
            localStorage.setItem(ZIP_KEY, clean);
            trackEvent("pe_zip_lookup", { zip3: prefix, tool: window.location.pathname.split("/").pop() || "unknown" });
            onResult(entry, clean);
            hasFired.current = true;
          }
          return;
        }
      }

      if (clean.length >= 3) {
        setError(true);
        setResult(null);
      } else {
        setResult(null);
      }
    },
    [onResult],
  );

  const clear = useCallback(() => {
    setZip("");
    setResult(null);
    setError(false);
    localStorage.removeItem(ZIP_KEY);
    onResult(null, "");
    hasFired.current = false;
  }, [onResult]);

  // ─── Which info lines to show ──────────────────────────────────
  const show = showFields ?? ["climate", "solar", "region", "hazard", "hardiness"];

  const stateName = result ? stateNames[result.st] || result.st : "";

  return (
    <div className={`bg-card border border-border rounded-lg ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
        <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Your Location
        </h4>
      </div>

      {/* Input row */}
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Enter ZIP code"
          value={zip}
          onChange={(e) => lookup(e.target.value)}
          maxLength={5}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-mono tracking-wider text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary/50 transition-colors"
          aria-label="ZIP code"
        />
        {zip.length > 0 && (
          <button
            onClick={clear}
            className="absolute right-2 p-1 text-muted/40 hover:text-muted transition-colors"
            aria-label="Clear ZIP"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-warning">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          ZIP not found — select your settings manually below
        </div>
      )}

      {/* Success state */}
      {result && zip.length >= 3 && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
            <span className="text-xs font-bold text-foreground">
              {stateName} area
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground pl-5">
            {show.includes("climate") && (
              <span>{climateZoneLabels[result.cz]} climate</span>
            )}
            {show.includes("solar") && (
              <span>{result.psh}h peak sun</span>
            )}
            {show.includes("hazard") && (
              <span>Risk: {hazardLabels[result.hz]}</span>
            )}
            {show.includes("hardiness") && (
              <span>Zone {result.uhz}</span>
            )}
            {show.includes("growing") && (
              <span>{result.gs}-day growing season</span>
            )}
            {show.includes("frost") && (
              <span>Frost: {result.lf} to {result.ff}</span>
            )}
          </div>
        </div>
      )}

      {/* Hint when empty */}
      {!result && !error && zip.length === 0 && (
        <p className="text-[10px] text-muted/40 mt-2">
          Auto-fills climate, solar, and hazard settings for your area
        </p>
      )}
    </div>
  );
}
