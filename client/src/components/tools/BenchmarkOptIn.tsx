// ─── Anonymous Benchmark Opt-In ──────────────────────────────────
// Adds an opt-in toggle to calculators.
// When enabled, stores anonymous aggregate metrics to localStorage
// under "pe-benchmark" for future community benchmark reporting.
// No PII, no server calls, fully local.

import { useEffect, useState } from "react";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";

const OPT_IN_KEY = "pe-benchmark-optin";
const BENCHMARK_KEY = "pe-benchmark";

export interface BenchmarkEntry {
  tool: string;
  metrics: Record<string, number | string>;
  ts: number; // unix ms
}

export function saveBenchmarkEntry(tool: string, metrics: Record<string, number | string>): void {
  try {
    const optin = localStorage.getItem(OPT_IN_KEY) === "true";
    if (!optin) return;
    const raw = localStorage.getItem(BENCHMARK_KEY);
    const entries: BenchmarkEntry[] = raw ? JSON.parse(raw) : [];
    // Keep last 100 entries per tool to avoid storage bloat
    const filtered = entries.filter((e) => e.tool !== tool).slice(-99);
    filtered.push({ tool, metrics, ts: Date.now() });
    localStorage.setItem(BENCHMARK_KEY, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

export function getBenchmarkOptIn(): boolean {
  try {
    return localStorage.getItem(OPT_IN_KEY) === "true";
  } catch {
    return false;
  }
}

interface Props {
  tool: string;
  metrics: Record<string, number | string>;
  /** Trigger save whenever metrics change and opt-in is on */
  autoSave?: boolean;
}

export default function BenchmarkOptIn({ tool, metrics, autoSave = false }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setEnabled(getBenchmarkOptIn());
  }, []);

  useEffect(() => {
    if (autoSave && enabled && Object.keys(metrics).length > 0) {
      saveBenchmarkEntry(tool, metrics);
    }
  }, [autoSave, enabled, metrics, tool]);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(OPT_IN_KEY, String(next));
      if (next && Object.keys(metrics).length > 0) {
        saveBenchmarkEntry(tool, metrics);
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Community Benchmarks
            {enabled && (
              <span className="ml-2 text-emerald-500 font-bold">· Contributing</span>
            )}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 py-3 space-y-3 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Anonymously contribute your results to help build community benchmarks — the first real dataset of how preppers actually prepare. No personal data. No server. Stored only in your browser.
          </p>
          <div
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              enabled ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-muted/20 hover:bg-muted/40"
            }`}
            onClick={toggle}
            role="checkbox"
            aria-checked={enabled}
            tabIndex={0}
            onKeyDown={(e) => e.key === " " && toggle()}
          >
            <div className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
              enabled ? "bg-emerald-500 border-emerald-500" : "border-border bg-background"
            }`}>
              {enabled && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight">Contribute anonymous results</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Aggregated metrics only (totals, weights, days of supply). Never personal info.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
