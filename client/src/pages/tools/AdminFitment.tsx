import { useState, useEffect } from "react";
import { CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react";

interface FitmentEntry {
  id: number;
  rackBrand: string;
  rackModel: string;
  rttBrand: string;
  rttModel: string;
  vehicleYear: number | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehiclePackage: string | null;
  crossbarRise: string;
  hasSpine: boolean;
  spineHeight: string | null;
  mountFootThickness: string;
  riserUsed: string | null;
  outcome: string;
  notes: string | null;
  facebookUsername: string | null;
  createdAt: string;
}

function toFraction(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === "") return "—";
  const d = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(d)) return "—";
  if (d === 0) return "0\"";
  const whole = Math.floor(d);
  const frac = d - whole;
  if (frac < 0.01) return `${whole}"`;
  const sixteenths = Math.round(frac * 16);
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const g = gcd(sixteenths, 16);
  return whole > 0 ? `${whole} ${sixteenths / g}/${16 / g}"` : `${sixteenths / g}/${16 / g}"`;
}

export default function AdminFitment() {
  const [entries, setEntries] = useState<FitmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [actions, setActions] = useState<Record<number, "approved" | "rejected" | null>>({});

  useEffect(() => {
    fetch("/api/fitment/pending")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEntries(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id: number) => {
    const res = await fetch(`/api/fitment/${id}/approve`, { method: "PATCH" });
    if (res.ok) setActions(a => ({ ...a, [id]: "approved" }));
  };

  const reject = async (id: number) => {
    const res = await fetch(`/api/fitment/${id}/reject`, { method: "PATCH" });
    if (res.ok) setActions(a => ({ ...a, [id]: "rejected" }));
  };

  const pending = entries.filter(e => !actions[e.id]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-1">RTT Fitment — Pending Review</h1>
        <p className="text-sm text-zinc-500 mb-6">{pending.length} submission{pending.length !== 1 ? "s" : ""} waiting</p>

        {loading && <p className="text-zinc-500 text-sm">Loading...</p>}

        {!loading && pending.length === 0 && (
          <p className="text-zinc-400 text-sm">All clear — no pending submissions.</p>
        )}

        <div className="space-y-4">
          {entries.map(entry => {
            const status = actions[entry.id];
            const vehicleStr = [entry.vehicleYear, entry.vehicleMake, entry.vehicleModel, entry.vehiclePackage].filter(Boolean).join(" ");
            const isExpanded = expanded === entry.id;

            return (
              <div
                key={entry.id}
                className={`rounded-lg border p-4 transition-opacity ${
                  status === "approved" ? "border-emerald-500/30 bg-emerald-500/5 opacity-60"
                  : status === "rejected" ? "border-red-500/30 bg-red-500/5 opacity-40"
                  : "border-zinc-700 bg-zinc-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-zinc-100">
                      {entry.rackBrand} {entry.rackModel} + {entry.rttBrand} {entry.rttModel}
                    </p>
                    {vehicleStr && <p className="text-xs text-zinc-500 mt-0.5">{vehicleStr}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-400 font-mono">
                      <span>Rise: {toFraction(entry.crossbarRise)}</span>
                      <span>Spine: {entry.hasSpine ? toFraction(entry.spineHeight) : "none"}</span>
                      <span>Foot: {toFraction(entry.mountFootThickness)}</span>
                      <span>Riser: {entry.riserUsed ? toFraction(entry.riserUsed) : "none"}</span>
                      <span className={entry.outcome === "sealed" ? "text-emerald-400" : entry.outcome === "marginal" ? "text-amber-400" : "text-red-400"}>
                        {entry.outcome}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : entry.id)}
                    className="text-zinc-500 hover:text-zinc-300 flex-shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2">
                    {entry.notes && (
                      <div>
                        <p className="text-xs text-zinc-500">Notes</p>
                        <p className="text-sm text-zinc-300">{entry.notes}</p>
                      </div>
                    )}
                    {entry.facebookUsername && (
                      <div>
                        <p className="text-xs text-zinc-500">Facebook</p>
                        <p className="text-sm text-zinc-300">{entry.facebookUsername}</p>
                      </div>
                    )}
                    <p className="text-xs text-zinc-600">Submitted {new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                )}

                {!status && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approve(entry.id)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => reject(entry.id)}
                      className="flex items-center gap-1.5 bg-zinc-700 hover:bg-red-700 text-zinc-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}

                {status && (
                  <p className={`text-xs mt-2 font-medium ${status === "approved" ? "text-emerald-400" : "text-red-400"}`}>
                    {status === "approved" ? "✓ Approved" : "✗ Rejected"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
