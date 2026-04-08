import { useState, useEffect, useMemo } from "react";
import {
  Tent, Search, Plus, CheckCircle, Users, ChevronDown, ChevronUp,
  ExternalLink, X, AlertTriangle, RotateCcw, Camera, ZoomIn,
} from "lucide-react";
import { GuidedTour } from "./GuidedTour";
import { useSEO } from "@/hooks/useSEO";
import SupportFooter from "@/components/tools/SupportFooter";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";

// ─── Types ─────────────────────────────────────────────────────────────────

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
  imageUrls: string[] | null;
  verifiedCount: number;
  approvedAt: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

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
  const num = sixteenths / g;
  const den = 16 / g;
  return whole > 0 ? `${whole} ${num}/${den}"` : `${num}/${den}"`;
}

function calcRecommended(rise: number, spine: number): number {
  const total = rise + spine;
  const withBuffer = total + 0.5;
  const standards = [0, 1, 1.5, 2, 2.5, 3, 4];
  return standards.find(s => s >= withBuffer) ?? Math.ceil(withBuffer);
}

function outcomeInfo(outcome: string): { label: string; color: string; bg: string } {
  switch (outcome) {
    case "sealed": return { label: "Sealed flush", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    case "marginal": return { label: "Marginal", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
    case "no-fix": return { label: "Didn't resolve", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
    default: return { label: outcome, color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" };
  }
}

// ─── Fraction Select ────────────────────────────────────────────────────────

const FRACTIONS = [
  { v: 0, l: "0" }, { v: 1 / 16, l: "1/16" }, { v: 1 / 8, l: "1/8" },
  { v: 3 / 16, l: "3/16" }, { v: 1 / 4, l: "1/4" }, { v: 5 / 16, l: "5/16" },
  { v: 3 / 8, l: "3/8" }, { v: 7 / 16, l: "7/16" }, { v: 1 / 2, l: "1/2" },
  { v: 9 / 16, l: "9/16" }, { v: 5 / 8, l: "5/8" }, { v: 11 / 16, l: "11/16" },
  { v: 3 / 4, l: "3/4" }, { v: 13 / 16, l: "13/16" }, { v: 7 / 8, l: "7/8" },
  { v: 15 / 16, l: "15/16" },
];

function FractionSelect({
  label, hint, value, onChange, maxWhole = 3, required = false,
}: {
  label: string; hint?: string; value: number; onChange: (v: number) => void;
  maxWhole?: number; required?: boolean;
}) {
  const whole = Math.floor(value);
  const frac = parseFloat((value - whole).toFixed(4));
  const closestFrac = FRACTIONS.reduce((p, c) =>
    Math.abs(c.v - frac) < Math.abs(p.v - frac) ? c : p, FRACTIONS[0]
  );

  const selClass = "bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500";

  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <select
          className={selClass}
          value={whole}
          onChange={e => onChange(parseInt(e.target.value) + closestFrac.v)}
        >
          {Array.from({ length: maxWhole + 1 }, (_, i) => (
            <option key={i} value={i}>{i}"</option>
          ))}
        </select>
        <span className="text-zinc-500 text-sm">+</span>
        <select
          className={selClass}
          value={closestFrac.v}
          onChange={e => onChange(whole + parseFloat(e.target.value))}
        >
          {FRACTIONS.map(f => (
            <option key={f.l} value={f.v}>{f.l}"</option>
          ))}
        </select>
        <span className="text-zinc-300 text-sm font-mono">= {toFraction(value)}</span>
      </div>
      {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Measurement Diagram ────────────────────────────────────────────────────

function MeasurementDiagram({ showSpine }: { showSpine: boolean }) {
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-4 mb-6">
      <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">
        Cross-section reference — measure these points
      </p>
      <svg viewBox="0 0 320 200" className="w-full max-w-sm mx-auto" aria-label="Rack and RTT cross-section measurement diagram">
        {/* Side rail */}
        <rect x="0" y="158" width="320" height="32" rx="2" fill="#52525b" />
        <text x="160" y="178" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">SIDE RAIL</text>

        {/* Cross bar rise */}
        <rect x="80" y="124" width="160" height="34" rx="2" fill="#b45309" />
        <text x="160" y="145" textAnchor="middle" fill="#fde68a" fontSize="9" fontFamily="monospace">CROSS BAR</text>

        {/* Spine (conditional) */}
        {showSpine && (
          <>
            <rect x="110" y="112" width="100" height="12" rx="1" fill="#d97706" />
            <text x="160" y="121" textAnchor="middle" fill="#fff7ed" fontSize="8" fontFamily="monospace">SPINE</text>
          </>
        )}

        {/* Mount foot */}
        <rect x="80" y="68" width="160" height="22" rx="2" fill="#059669" />
        <text x="160" y="83" textAnchor="middle" fill="#d1fae5" fontSize="9" fontFamily="monospace">RTT MOUNT FOOT</text>

        {/* Gap / interference zone */}
        <rect x="80" y="90" width="160" height={showSpine ? 22 : 34} fill="#ef4444" fillOpacity="0.12" />
        <line x1="76" y1="90" x2="76" y2={showSpine ? 112 : 124} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" />
        <line x1="72" y1="90" x2="80" y2="90" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="72" y1={showSpine ? 112 : 124} x2="80" y2={showSpine ? 112 : 124} stroke="#ef4444" strokeWidth="1.5" />
        <text x="68" y={showSpine ? 102 : 108} textAnchor="end" fill="#f87171" fontSize="8" fontFamily="monospace">gap</text>

        {/* Arrow: crossbar rise */}
        <line x1="246" y1="158" x2="246" y2="124" stroke="#fbbf24" strokeWidth="1.5" />
        <line x1="242" y1="158" x2="250" y2="158" stroke="#fbbf24" strokeWidth="1.5" />
        <line x1="242" y1="124" x2="250" y2="124" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="252" y="144" fill="#fbbf24" fontSize="8" fontFamily="monospace">crossbar</text>
        <text x="252" y="153" fill="#fbbf24" fontSize="8" fontFamily="monospace">rise</text>

        {/* Arrow: spine height (conditional) */}
        {showSpine && (
          <>
            <line x1="218" y1="124" x2="218" y2="112" stroke="#f97316" strokeWidth="1.5" />
            <line x1="214" y1="124" x2="222" y2="124" stroke="#f97316" strokeWidth="1.5" />
            <line x1="214" y1="112" x2="222" y2="112" stroke="#f97316" strokeWidth="1.5" />
            <text x="224" y="120" fill="#f97316" fontSize="8" fontFamily="monospace">spine ht</text>
          </>
        )}

        {/* Arrow: mount foot thickness */}
        <line x1="246" y1="68" x2="246" y2="90" stroke="#34d399" strokeWidth="1.5" />
        <line x1="242" y1="68" x2="250" y2="68" stroke="#34d399" strokeWidth="1.5" />
        <line x1="242" y1="90" x2="250" y2="90" stroke="#34d399" strokeWidth="1.5" />
        <text x="252" y="80" fill="#34d399" fontSize="8" fontFamily="monospace">mount</text>
        <text x="252" y="89" fill="#34d399" fontSize="8" fontFamily="monospace">foot</text>
      </svg>
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        <span className="flex items-center gap-1.5 text-xs text-amber-400"><span className="w-3 h-3 rounded-sm bg-amber-700 inline-block" />Cross bar rise above side rail</span>
        {showSpine && <span className="flex items-center gap-1.5 text-xs text-orange-400"><span className="w-3 h-3 rounded-sm bg-amber-600 inline-block" />Center spine height</span>}
        <span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-3 h-3 rounded-sm bg-emerald-700 inline-block" />RTT mount foot thickness</span>
        <span className="flex items-center gap-1.5 text-xs text-red-400"><span className="w-3 h-3 rounded-sm bg-red-900 inline-block" />Clearance gap (interference zone)</span>
      </div>
    </div>
  );
}

// ─── Lightbox ───────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center"
        onClick={onClose}
      >
        <X className="w-4 h-4 text-zinc-200" />
      </button>
      <img
        src={src}
        alt="Fitment photo"
        className="max-w-full max-h-[90vh] rounded-lg object-contain"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// ─── Entry Card ─────────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: FitmentEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const oi = outcomeInfo(entry.outcome);
  const totalObstacle = parseFloat(entry.crossbarRise) + (entry.hasSpine && entry.spineHeight ? parseFloat(entry.spineHeight) : 0);
  const recommended = calcRecommended(parseFloat(entry.crossbarRise), entry.hasSpine && entry.spineHeight ? parseFloat(entry.spineHeight) : 0);

  const vehicleStr = [entry.vehicleYear, entry.vehicleMake, entry.vehicleModel, entry.vehiclePackage].filter(Boolean).join(" ");

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-zinc-100">{entry.rackBrand} {entry.rackModel}</span>
              <span className="text-zinc-600">+</span>
              <span className="text-sm font-semibold text-zinc-100">{entry.rttBrand} {entry.rttModel}</span>
            </div>
            {vehicleStr && (
              <p className="text-xs text-zinc-500 mb-2">{vehicleStr}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2 py-0.5 rounded border ${oi.bg} ${oi.color} font-medium`}>
                {oi.label}
              </span>
              {entry.riserUsed && parseFloat(entry.riserUsed) > 0 && (
                <span className="text-xs px-2 py-0.5 rounded border bg-zinc-800 border-zinc-600 text-zinc-300">
                  {toFraction(entry.riserUsed)} riser
                </span>
              )}
              {entry.verifiedCount >= 2 && (
                <span className="text-xs px-2 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  Community verified ×{entry.verifiedCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-700 p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Crossbar rise</p>
              <p className="text-sm font-mono text-amber-400">{toFraction(entry.crossbarRise)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Center spine</p>
              <p className="text-sm font-mono text-orange-400">
                {entry.hasSpine ? toFraction(entry.spineHeight) : "None"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Mount foot</p>
              <p className="text-sm font-mono text-emerald-400">{toFraction(entry.mountFootThickness)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Total obstacle</p>
              <p className="text-sm font-mono text-zinc-200">{toFraction(totalObstacle)}</p>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-400 mb-1">Recommended riser</p>
            <p className="text-lg font-bold text-zinc-100">{recommended > 0 ? `${recommended}"` : "None needed"}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Obstacle {toFraction(totalObstacle)} + 1/2" flex buffer, rounded to standard size</p>
          </div>

          {entry.notes && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">What worked</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{entry.notes}</p>
            </div>
          )}

          {entry.imageUrls && entry.imageUrls.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Photos
              </p>
              <div className="flex flex-wrap gap-2">
                {entry.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={e => { e.stopPropagation(); setLightboxSrc(url); }}
                    className="relative group w-20 h-20 rounded overflow-hidden border border-zinc-700 hover:border-emerald-500 transition-colors flex-shrink-0"
                  >
                    <img src={url} alt={`Fitment photo ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

          {entry.facebookUsername && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-500">Questions?</p>
              <a
                href={`https://facebook.com/${entry.facebookUsername.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Find {entry.facebookUsername} on Facebook
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Badge Card ─────────────────────────────────────────────────────────────

function BadgeCard({ entry }: { entry: Partial<FitmentEntry> & { rackBrand: string; rackModel: string; rttBrand: string; rttModel: string } }) {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-emerald-500/40 rounded-xl p-6 text-center max-w-sm mx-auto">
      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle className="w-7 h-7 text-emerald-400" />
      </div>
      <div className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-1">Founding Contributor</div>
      <div className="text-base font-bold text-zinc-100 mb-1">
        {entry.rackBrand} {entry.rackModel}
      </div>
      <div className="text-xs text-zinc-400 mb-1">+</div>
      <div className="text-base font-bold text-zinc-100 mb-3">
        {entry.rttBrand} {entry.rttModel}
      </div>
      <div className="text-xs text-zinc-500 mb-1">contributed to</div>
      <div className="text-sm font-semibold text-zinc-300 mb-4">Rack + RTT Fitment Database</div>
      <div className="text-xs text-emerald-500/70 font-mono">prepperevolution.com/tools</div>
    </div>
  );
}

// ─── Submit Form ─────────────────────────────────────────────────────────────

const RISER_OPTIONS = [
  { v: -1, l: "Not needed — clears without" },
  { v: 0, l: "None — still investigating" },
  { v: 1, l: "1\"" },
  { v: 1.5, l: "1.5\"" },
  { v: 2, l: "2\"" },
  { v: 2.5, l: "2.5\"" },
  { v: 3, l: "3\"" },
  { v: 4, l: "4\"" },
];

interface FormState {
  rackBrand: string;
  rackModel: string;
  rttBrand: string;
  rttModel: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePackage: string;
  crossbarRise: number;
  hasSpine: boolean;
  spineHeight: number;
  mountFootThickness: number;
  riserOption: number;
  outcome: string;
  notes: string;
  facebookUsername: string;
}

const defaultForm: FormState = {
  rackBrand: "", rackModel: "", rttBrand: "", rttModel: "",
  vehicleYear: "", vehicleMake: "", vehicleModel: "", vehiclePackage: "",
  crossbarRise: 0.25, hasSpine: false, spineHeight: 0.0625, mountFootThickness: 1.0,
  riserOption: 2, outcome: "", notes: "", facebookUsername: "",
};

function SubmitForm({ onSuccess }: { onSuccess: (entry: Partial<FitmentEntry> & { rackBrand: string; rackModel: string; rttBrand: string; rttModel: string }) => void }) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500";
  const labelClass = "block text-xs font-medium text-zinc-400 mb-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.rackBrand || !form.rackModel || !form.rttBrand || !form.rttModel) {
      setError("Rack and RTT brand/model are required.");
      return;
    }
    if (!form.outcome) {
      setError("Select an outcome.");
      return;
    }

    const payload: any = {
      rackBrand: form.rackBrand.trim(),
      rackModel: form.rackModel.trim(),
      rttBrand: form.rttBrand.trim(),
      rttModel: form.rttModel.trim(),
      crossbarRise: form.crossbarRise,
      hasSpine: form.hasSpine,
      spineHeight: form.hasSpine ? form.spineHeight : undefined,
      mountFootThickness: form.mountFootThickness,
      outcome: form.outcome,
    };

    if (form.vehicleYear) payload.vehicleYear = parseInt(form.vehicleYear);
    if (form.vehicleMake.trim()) payload.vehicleMake = form.vehicleMake.trim();
    if (form.vehicleModel.trim()) payload.vehicleModel = form.vehicleModel.trim();
    if (form.vehiclePackage.trim()) payload.vehiclePackage = form.vehiclePackage.trim();
    if (form.riserOption >= 0) payload.riserUsed = form.riserOption;
    if (form.notes.trim()) payload.notes = form.notes.trim();
    if (form.facebookUsername.trim()) payload.facebookUsername = form.facebookUsername.trim();

    setSubmitting(true);
    try {
      // Upload any attached photos first
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch("/api/fitment/upload-image", { method: "POST", body: fd });
        if (upRes.ok) {
          const upData = await upRes.json();
          if (upData.url) uploadedUrls.push(upData.url);
        }
      }
      if (uploadedUrls.length > 0) payload.imageUrls = uploadedUrls;

      const res = await fetch("/api/fitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed. Try again.");
        return;
      }
      onSuccess({ rackBrand: form.rackBrand, rackModel: form.rackModel, rttBrand: form.rttBrand, rttModel: form.rttModel });
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <MeasurementDiagram showSpine={form.hasSpine} />

      {/* Rack */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
          Your Roof Rack
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Rack brand <span className="text-red-400">*</span></label>
            <input className={inputClass} placeholder="e.g. RealTruck Elevate, Prinsu, CBI" value={form.rackBrand} onChange={e => set("rackBrand", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Rack model / series <span className="text-red-400">*</span></label>
            <input className={inputClass} placeholder="e.g. Full-Size Bed Rack, Design Studio" value={form.rackModel} onChange={e => set("rackModel", e.target.value)} />
          </div>
        </div>
      </div>

      {/* RTT */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">2</span>
          Your Rooftop Tent
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>RTT brand <span className="text-red-400">*</span></label>
            <input className={inputClass} placeholder="e.g. OVS, iKamper, Roofnest" value={form.rttBrand} onChange={e => set("rttBrand", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>RTT model <span className="text-red-400">*</span></label>
            <input className={inputClass} placeholder="e.g. HD Bushveld, Skycamp 3.0" value={form.rttModel} onChange={e => set("rttModel", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Vehicle */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-1 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">3</span>
          Vehicle <span className="text-zinc-600 font-normal text-xs ml-1">(optional — helps narrow results)</span>
        </h3>
        <p className="text-xs text-zinc-500 mb-3">The same rack on different trucks can have different clearance. Package matters too — AT4, TRD Pro, etc.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className={labelClass}>Year</label>
            <input className={inputClass} placeholder="2025" maxLength={4} value={form.vehicleYear} onChange={e => set("vehicleYear", e.target.value.replace(/\D/g, ""))} />
          </div>
          <div>
            <label className={labelClass}>Make</label>
            <input className={inputClass} placeholder="GMC" value={form.vehicleMake} onChange={e => set("vehicleMake", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input className={inputClass} placeholder="Sierra 1500" value={form.vehicleModel} onChange={e => set("vehicleModel", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Package / trim</label>
            <input className={inputClass} placeholder="AT4, TRD Pro..." value={form.vehiclePackage} onChange={e => set("vehiclePackage", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Measurements */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">4</span>
          Measurements
        </h3>
        <div className="space-y-4">
          <FractionSelect
            label="Crossbar rise above side rail"
            hint="How high the cross bar sits above the top surface of the side rail. Use a tape measure or feeler gauge."
            value={form.crossbarRise}
            onChange={v => set("crossbarRise", v)}
            maxWhole={2}
            required
          />

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                checked={form.hasSpine}
                onChange={e => set("hasSpine", e.target.checked)}
              />
              <span className="text-sm text-zinc-300">My rack has a center spine / raised rib on the cross bar</span>
            </label>
          </div>

          {form.hasSpine && (
            <FractionSelect
              label="Center spine height above cross bar"
              hint="The raised center rib that runs along the top of the cross bar. Measure from cross bar surface to top of spine."
              value={form.spineHeight}
              onChange={v => set("spineHeight", v)}
              maxWhole={1}
              required
            />
          )}

          <FractionSelect
            label="RTT mount foot thickness"
            hint="Thickness of the RTT mounting hardware (the clamp/foot that attaches the tent to the rack). Measure from bottom of foot to top."
            value={form.mountFootThickness}
            onChange={v => set("mountFootThickness", v)}
            maxWhole={3}
            required
          />
        </div>
      </div>

      {/* Result */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-zinc-500/20 text-zinc-400 text-xs flex items-center justify-center font-bold">5</span>
          What riser did you use &amp; what was the result?
        </h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Riser size used</label>
            <select
              className={inputClass}
              value={form.riserOption}
              onChange={e => set("riserOption", parseFloat(e.target.value))}
            >
              {RISER_OPTIONS.map(o => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Outcome <span className="text-red-400">*</span></label>
            <div className="flex gap-2 flex-wrap">
              {[
                { v: "sealed", l: "Sealed flush", c: "emerald" },
                { v: "marginal", l: "Marginal", c: "amber" },
                { v: "no-fix", l: "Didn't resolve", c: "red" },
              ].map(o => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => set("outcome", o.v)}
                  className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                    form.outcome === o.v
                      ? o.c === "emerald" ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : o.c === "amber" ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-red-500/20 border-red-500 text-red-300"
                      : "bg-zinc-800 border-zinc-600 text-zinc-400 hover:border-zinc-400"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>What worked — what would you tell someone facing the same issue?</label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="e.g. Used 2&quot; aluminum billet risers, four bolts per foot. Retorque after the first trip — mine settled a bit. Took about an hour."
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-zinc-600 text-right mt-0.5">{form.notes.length}/500</p>
          </div>
        </div>
      </div>

      {/* Facebook */}
      <div>
        <label className={labelClass}>Facebook username (optional)</label>
        <input
          className={inputClass}
          placeholder="@yourname"
          value={form.facebookUsername}
          onChange={e => set("facebookUsername", e.target.value)}
        />
        <p className="text-xs text-zinc-500 mt-1">This will be publicly visible next to your entry so others can reach you with follow-up questions. Only add it if you're okay with that.</p>
      </div>

      {/* Photos */}
      <div>
        <label className={labelClass}>
          <Camera className="w-3.5 h-3.5 inline mr-1" />
          Photos <span className="text-zinc-600 font-normal">(optional — up to 3)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full text-sm text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-zinc-700 file:text-zinc-200 hover:file:bg-zinc-600 cursor-pointer"
          onChange={e => {
            const files = Array.from(e.target.files || []).slice(0, 3);
            setSelectedFiles(files);
            setUploadPreviews(files.map(f => URL.createObjectURL(f)));
          }}
        />
        <p className="text-xs text-zinc-500 mt-1">Show what your setup actually looks like — before/after, riser install, or how the tent sits. Helps others confirm the fitment.</p>
        {uploadPreviews.length > 0 && (
          <div className="flex gap-2 mt-2">
            {uploadPreviews.map((src, i) => (
              <img key={i} src={src} alt="" className="w-16 h-16 rounded object-cover border border-zinc-700" />
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {submitting ? "Submitting..." : "Submit Contribution"}
      </button>

      <p className="text-xs text-zinc-600 text-center">
        All submissions are reviewed before going live. Riser product links are added by the PE team — no affiliate links in submissions.
      </p>
    </form>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RackRTTFitmentDatabase() {
  useSEO({
    title: "Rack + RTT Fitment Database | Community Clearance Data | Prepper Evolution",
    description: "Community-sourced clearance data for roof rack and rooftop tent combos. Look up your rack and RTT before you buy — or contribute your own measurements.",
    canonical: "https://prepperevolution.com/tools/rack-rtt-fitment-database",
  });

  const FITMENT_TOUR = [
    {
      title: "Search the Database",
      body: "Type your rack brand or RTT brand in the search fields to find existing entries. If someone has already measured your exact combo, you'll see the crossbar rise, riser size used, and what outcome they got.",
      anchor: "fitment-search",
    },
    {
      title: "Reading an Entry",
      body: "Each entry shows the crossbar rise (how high the cross bar sticks above the side rail), center spine height if any, and the RTT mount foot thickness. The recommended riser size is calculated automatically with a 1/2\" flex buffer built in.",
      anchor: "fitment-results",
    },
    {
      title: "What the Outcome Means",
      body: "Sealed flush = tent closes and seals properly with the riser used. Marginal = it mostly works but not perfectly. Didn't resolve = riser didn't solve it — read their notes for what they tried.",
      anchor: "fitment-results",
    },
    {
      title: "What to Measure",
      body: "Use the cross-section diagram as your reference. Crossbar rise: measure from the top surface of the side rail to the top of the cross bar. Spine height: the raised center rib on top of the cross bar, if your rack has one. Mount foot thickness: the hardware that clamps your RTT to the rack.",
      anchor: "fitment-contribute",
    },
    {
      title: "Add Your Data",
      body: "Switch to the Add Your Data tab to submit your measurements. Vehicle year, make, model, and package are optional but help others narrow down results — the same rack on a Tacoma vs a Sierra can have different clearance. Your entry goes live after a quick review.",
      anchor: "fitment-contribute",
    },
    {
      title: "Riser Links",
      body: "Don't paste Amazon links in your submission — the PE team adds affiliate links during review so every link in the database is verified and current. Just name the riser brand and size you used in the notes field.",
      anchor: "fitment-contribute",
    },
  ];

  const [entries, setEntries] = useState<FitmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"browse" | "contribute">("browse");
  const [searchRack, setSearchRack] = useState("");
  const [searchRTT, setSearchRTT] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<(Partial<FitmentEntry> & { rackBrand: string; rackModel: string; rttBrand: string; rttModel: string }) | null>(null);

  useEffect(() => {
    fetch("/api/fitment")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEntries(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const rackQ = searchRack.toLowerCase();
    const rttQ = searchRTT.toLowerCase();
    return entries.filter(e => {
      const rackMatch = !rackQ || `${e.rackBrand} ${e.rackModel}`.toLowerCase().includes(rackQ);
      const rttMatch = !rttQ || `${e.rttBrand} ${e.rttModel}`.toLowerCase().includes(rttQ);
      return rackMatch && rttMatch;
    });
  }, [entries, searchRack, searchRTT]);

  const handleSuccess = (entry: Partial<FitmentEntry> & { rackBrand: string; rackModel: string; rttBrand: string; rttModel: string }) => {
    setSubmittedEntry(entry);
    setSubmitted(true);
    setActiveTab("browse");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t
      ? "bg-emerald-600 text-white"
      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">

        {/* Hero Image */}
        <div className="mb-8 rounded-xl overflow-hidden">
          <img
            src="https://wp.prepperevolution.com/wp-content/uploads/2026/04/rack-rtt-fitment-database-3.png"
            alt="Rack + RTT Fitment Database — community-powered clearance data for roof racks and rooftop tents"
            className="w-full object-cover"
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500/15 rounded-lg flex items-center justify-center">
              <Tent className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">Rack + RTT Fitment Database</h1>
              <p className="text-sm text-zinc-500">Community-sourced clearance data</p>
            </div>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Rack manufacturers don't publish crossbar clearance specs. So we built this. Look up your exact rack + RTT combo before you buy — or contribute your measurements so the next person doesn't run into the same fitment problem.
          </p>
          {entries.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">{entries.length} combo{entries.length !== 1 ? "s" : ""} in the database</span>
            </div>
          )}
        </div>

        {/* Success state */}
        {submitted && submittedEntry && (
          <div className="mb-8">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Submission received — thanks for contributing.</p>
                <p className="text-xs text-zinc-400 mt-0.5">Your entry will go live once reviewed. Screenshot your badge below and share it — you earned it.</p>
              </div>
            </div>
            <BadgeCard entry={submittedEntry} />
            <p className="text-center text-xs text-zinc-600 mt-3">Screenshot this card and share it on Facebook to show you contributed</p>
            <div className="flex justify-center mt-3">
              <button
                onClick={() => { setSubmitted(false); setSubmittedEntry(null); }}
                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Guided Tour */}
        <div className="mb-6">
          <GuidedTour steps={FITMENT_TOUR} toolName="the Rack + RTT Fitment Database" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button className={tabClass("browse")} onClick={() => setActiveTab("browse")}>
            Browse Database
          </button>
          <button className={tabClass("contribute")} onClick={() => setActiveTab("contribute")}>
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            Add Your Data
          </button>
        </div>

        {/* Browse */}
        {activeTab === "browse" && (
          <div>
            <div id="fitment-search" className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  placeholder="Search rack brand or model..."
                  value={searchRack}
                  onChange={e => setSearchRack(e.target.value)}
                />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  placeholder="Search RTT brand or model..."
                  value={searchRTT}
                  onChange={e => setSearchRTT(e.target.value)}
                />
              </div>
              {(searchRack || searchRTT) && (
                <button
                  onClick={() => { setSearchRack(""); setSearchRTT(""); }}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 px-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {loading && (
              <div className="text-center py-12 text-zinc-500 text-sm">Loading database...</div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-12">
                <Tent className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm font-medium mb-1">
                  {entries.length === 0 ? "No entries yet." : "No matches found."}
                </p>
                <p className="text-zinc-600 text-sm mb-4">
                  {entries.length === 0
                    ? "Be the first to contribute your rack + RTT measurements."
                    : "Try different search terms, or be the first to add this combo."}
                </p>
                <button
                  onClick={() => setActiveTab("contribute")}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Your Data
                </button>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div id="fitment-results" className="space-y-3">
                {filtered.map(entry => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
                <div className="pt-4 border-t border-zinc-800 text-center">
                  <p className="text-xs text-zinc-600 mb-2">Don't see your combo?</p>
                  <button
                    onClick={() => setActiveTab("contribute")}
                    className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    <Plus className="w-3.5 h-3.5" /> Contribute your measurements
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contribute */}
        {activeTab === "contribute" && (
          <div id="fitment-contribute">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-zinc-300 mb-1">What you're contributing</p>
              <p className="text-sm text-zinc-500">Your rack, RTT, and vehicle info plus the actual clearance measurements. Once approved, your entry goes live in the database with your notes so others can find the exact riser they need — before buying anything.</p>
            </div>
            <SubmitForm onSuccess={handleSuccess} />
          </div>
        )}

        <div className="mt-12">
          <DataPrivacyNotice />
        </div>
        <SupportFooter />
      </div>
    </div>
  );
}
