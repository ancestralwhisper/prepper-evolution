import { useState, useMemo } from "react";
import {
  Droplets, Flame, Zap, Truck, Tent,
  AlertTriangle, CheckCircle2, ChevronRight,
  ArrowLeft, Wrench, Lightbulb, Leaf,
  ShieldAlert, Info, RotateCcw, ExternalLink,
} from "lucide-react";
import { failureNodes, categoryMeta, getDeviceTypes, getNodes } from "./failure-mode-data";
import type { FailureCategory, DiagStep, DiagSolution, Severity } from "./failure-mode-types";
import { GuidedTour } from "./GuidedTour";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import { useSEO } from "@/hooks/useSEO";

// ─── Tour ─────────────────────────────────────────────────────────────────────

const DIAG_TOUR = [
  {
    title: "Pick Your Gear Category",
    body: "Start with the type of equipment that failed — Water, Fire/Food, Power, Recovery, or Shelter. The tool narrows down to the specific device.",
  },
  {
    title: "Select the Device",
    body: "Choose the specific gear — your stove model, filter type, winch brand. Each device has its own failure mode database.",
  },
  {
    title: "Describe the Symptom",
    body: "Pick the observable symptom — what you can see or feel right now. No technical knowledge required.",
  },
  {
    title: "Answer Yes/No Questions",
    body: "The tool asks simple diagnostic questions. Tap Yes or No — no typing. Designed to work with cold hands or a cracked screen.",
  },
  {
    title: "Three-Tier Fix System",
    body: "Every result shows a Standard Fix (spare parts), Improvised Fix (camp items you probably have), and an Extreme Fix (found/natural materials). The fix tier matches what you have available.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<FailureCategory, React.FC<{ className?: string }>> = {
  water:    ({ className }) => <Droplets className={className} />,
  fire:     ({ className }) => <Flame className={className} />,
  power:    ({ className }) => <Zap className={className} />,
  recovery: ({ className }) => <Truck className={className} />,
  shelter:  ({ className }) => <Tent className={className} />,
};

const CATEGORY_COLORS: Record<FailureCategory, string> = {
  water:    "blue",
  fire:     "orange",
  power:    "yellow",
  recovery: "red",
  shelter:  "green",
};

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-400",   badge: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", badge: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  red:    { bg: "bg-red-500/10",    border: "border-red-500/30",    text: "text-red-400",    badge: "bg-red-500/15 text-red-400 border-red-500/30" },
  green:  { bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-400",  badge: "bg-green-500/15 text-green-400 border-green-500/30" },
};

const SEVERITY_META: Record<Severity, { label: string; color: string }> = {
  1: { label: "Annoyance",  color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  2: { label: "Degraded",   color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  3: { label: "Significant",color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  4: { label: "Critical",   color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  5: { label: "LETHAL",     color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

type Phase = "category" | "device" | "symptom" | "diagnosing" | "result";

// ─── Safety Modal ─────────────────────────────────────────────────────────────

function SafetyModal({ warning, onAck }: { warning: string; onAck: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-card border-2 border-red-500 rounded-xl max-w-lg w-full p-6 space-y-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-extrabold text-red-400 uppercase tracking-wide mb-2">
              Safety Warning — Read Before Proceeding
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{warning}</p>
          </div>
        </div>
        <button
          onClick={onAck}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-lg text-sm transition-colors"
        >
          I understand the risk — show the fix
        </button>
      </div>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({
  solution,
  color,
  onReset,
}: {
  solution: DiagSolution;
  color: string;
  onReset: () => void;
}) {
  const [showExtreme, setShowExtreme] = useState(false);
  const [extremeAcked, setExtremeAcked] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const severity = SEVERITY_META[solution.severity];
  const c = COLOR_CLASSES[color];

  function handleExtremeClick() {
    if (solution.safetyWarning) {
      setShowSafetyModal(true);
    } else {
      setShowExtreme(true);
    }
  }

  return (
    <>
      {showSafetyModal && solution.safetyWarning && (
        <SafetyModal
          warning={solution.safetyWarning}
          onAck={() => {
            setShowSafetyModal(false);
            setExtremeAcked(true);
            setShowExtreme(true);
          }}
        />
      )}

      <div className="space-y-5">
        {/* Danger banner */}
        {solution.danger && (
          <div className="flex items-start gap-3 bg-red-500/15 border-2 border-red-500/60 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-extrabold text-red-400 uppercase tracking-wide">
                DISCARD — DO NOT USE
              </p>
              <p className="text-xs text-red-300 mt-1 leading-relaxed">
                This item cannot be safely repaired. Continued use poses a health or safety risk.
              </p>
            </div>
          </div>
        )}

        {/* Cause + likelihood */}
        <div className={`bg-card border ${c.border} rounded-xl p-5 space-y-4`}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                Most Likely Cause
              </p>
              <p className="text-lg font-extrabold text-foreground">{solution.cause}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 border rounded-lg ${severity.color}`}>
                {severity.label}
              </span>
            </div>
          </div>

          {/* Likelihood bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Likelihood
              </p>
              <p className={`text-sm font-extrabold ${c.text}`}>{solution.likelihood}%</p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  color === "red" ? "bg-red-500" :
                  color === "orange" ? "bg-orange-500" :
                  color === "yellow" ? "bg-yellow-500" :
                  color === "blue" ? "bg-blue-500" : "bg-green-500"
                }`}
                style={{ width: `${solution.likelihood}%` }}
              />
            </div>
          </div>
        </div>

        {/* Standard Fix */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/40">
            <Wrench className="w-4 h-4 text-foreground" />
            <p className="text-xs font-extrabold uppercase tracking-wide text-foreground">
              Standard Fix
            </p>
            <span className="text-[10px] text-muted-foreground ml-auto">Spare parts / proper tools</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-foreground leading-relaxed">{solution.standardFix}</p>
          </div>
        </div>

        {/* Improvised Fix */}
        {solution.improvisedFix && (
          <div className="bg-card border border-amber-500/30 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-amber-500/20 bg-amber-500/8">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-extrabold uppercase tracking-wide text-amber-400">
                Improvised Fix
              </p>
              <span className="text-[10px] text-muted-foreground ml-auto">Common camp items</span>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-foreground leading-relaxed">{solution.improvisedFix}</p>
            </div>
          </div>
        )}

        {/* Extreme Fix — gated */}
        {solution.extremeFix && (
          <div className="bg-card border border-red-500/30 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-red-500/20 bg-red-500/8">
              <Leaf className="w-4 h-4 text-red-400" />
              <p className="text-xs font-extrabold uppercase tracking-wide text-red-400">
                Extreme / Bush Fix
              </p>
              <span className="text-[10px] text-muted-foreground ml-auto">Natural / found materials</span>
            </div>
            <div className="px-4 py-4">
              {!showExtreme ? (
                <button
                  onClick={handleExtremeClick}
                  className="w-full py-2.5 border border-red-500/40 hover:bg-red-500/10 text-red-400 font-bold text-xs rounded-lg transition-colors"
                >
                  {solution.safetyWarning
                    ? "Show extreme fix — safety acknowledgment required"
                    : "Show extreme fix"}
                </button>
              ) : (
                <p className="text-sm text-foreground leading-relaxed">{solution.extremeFix}</p>
              )}
            </div>
          </div>
        )}

        {/* Safety warning (non-extreme) */}
        {solution.safetyWarning && !solution.extremeFix && !showExtreme && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">{solution.safetyWarning}</p>
          </div>
        )}

        {/* Required tools */}
        {solution.requiredTools && solution.requiredTools.length > 0 && (
          <div className="bg-muted/40 border border-border rounded-xl px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
              Tools / Materials Needed
            </p>
            <ul className="space-y-1">
              {solution.requiredTools.map((tool) => (
                <li key={tool} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Field note */}
        {solution.fieldNote && (
          <div className="flex items-start gap-3 bg-blue-500/8 border border-blue-500/20 rounded-xl p-4">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-blue-400">Field Note: </span>
              {solution.fieldNote}
            </p>
          </div>
        )}

        {/* Reset */}
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-3 border border-border hover:border-foreground/30 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Diagnose another problem
        </button>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FailureModeDiagnostic() {
  useSEO({
    title: "Field Failure Diagnostic Tool | Prepper Evolution",
    description:
      "Diagnose gear failures in the field. Yes/No troubleshooting for stoves, water filters, solar, winches, and more — with standard fixes and improvised bush fixes.",
  });

  const [phase, setPhase] = useState<Phase>("category");
  const [selectedCategory, setSelectedCategory] = useState<FailureCategory | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<DiagStep | null>(null);
  const [diagHistory, setDiagHistory] = useState<DiagStep[]>([]);
  const [finalSolution, setFinalSolution] = useState<DiagSolution | null>(null);

  const color = selectedCategory ? CATEGORY_COLORS[selectedCategory] : "yellow";

  const deviceTypes = useMemo(
    () => (selectedCategory ? getDeviceTypes(selectedCategory) : []),
    [selectedCategory]
  );

  const symptoms = useMemo(
    () =>
      selectedCategory && selectedDevice
        ? getNodes(selectedCategory, selectedDevice)
        : [],
    [selectedCategory, selectedDevice]
  );

  function selectCategory(cat: FailureCategory) {
    setSelectedCategory(cat);
    setSelectedDevice(null);
    setSelectedNodeId(null);
    setPhase("device");
  }

  function selectDevice(device: string) {
    setSelectedDevice(device);
    setPhase("symptom");
  }

  function selectNode(nodeId: string) {
    const node = failureNodes.find((n) => n.id === nodeId);
    if (!node) return;
    setSelectedNodeId(nodeId);
    setCurrentStep(node.tree);
    setDiagHistory([]);
    setFinalSolution(null);
    setPhase("diagnosing");
  }

  function answer(yes: boolean) {
    if (!currentStep || currentStep.type !== "question") return;
    const next = yes ? currentStep.yes : currentStep.no;
    setDiagHistory((h) => [...h, currentStep]);
    if (next.type === "solution") {
      setFinalSolution(next);
      setCurrentStep(null);
      setPhase("result");
    } else {
      setCurrentStep(next);
    }
  }

  function goBack() {
    if (phase === "device") {
      setPhase("category");
      setSelectedCategory(null);
    } else if (phase === "symptom") {
      setPhase("device");
      setSelectedDevice(null);
    } else if (phase === "diagnosing") {
      if (diagHistory.length === 0) {
        setPhase("symptom");
        setSelectedNodeId(null);
        setCurrentStep(null);
      } else {
        const prev = [...diagHistory];
        const last = prev.pop()!;
        setDiagHistory(prev);
        setCurrentStep(last);
      }
    } else if (phase === "result") {
      setPhase("symptom");
      setFinalSolution(null);
      setSelectedNodeId(null);
    }
  }

  function resetAll() {
    setPhase("category");
    setSelectedCategory(null);
    setSelectedDevice(null);
    setSelectedNodeId(null);
    setCurrentStep(null);
    setDiagHistory([]);
    setFinalSolution(null);
  }

  const selectedNode = failureNodes.find((n) => n.id === selectedNodeId);
  const c = COLOR_CLASSES[color];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                Field Failure Diagnostic
              </h1>
              <p className="text-sm text-muted-foreground">
                Bush-Fix Database &mdash; v1.0
              </p>
            </div>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            Tap through Yes/No questions to isolate the failure. Every result includes
            a standard fix, an improvised fix with camp items, and an extreme bush fix
            for when you have nothing.
          </p>
        </div>

        {/* ── Guided Tour ──────────────────────────────────────────────── */}
        <GuidedTour steps={DIAG_TOUR} toolName="Field Failure Diagnostic" />

        {/* ── Back button ──────────────────────────────────────────────── */}
        {phase !== "category" && (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        {phase !== "category" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <span
              className="hover:text-foreground cursor-pointer transition-colors"
              onClick={resetAll}
            >
              All Categories
            </span>
            {selectedCategory && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span
                  className="hover:text-foreground cursor-pointer transition-colors"
                  onClick={() => { setPhase("device"); setSelectedDevice(null); }}
                >
                  {categoryMeta.find((c) => c.id === selectedCategory)?.label}
                </span>
              </>
            )}
            {selectedDevice && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span
                  className="hover:text-foreground cursor-pointer transition-colors"
                  onClick={() => { setPhase("symptom"); setSelectedNodeId(null); }}
                >
                  {selectedDevice.length > 30 ? selectedDevice.substring(0, 30) + "…" : selectedDevice}
                </span>
              </>
            )}
            {selectedNode && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">Diagnosing</span>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PHASE: CATEGORY
        ══════════════════════════════════════════════════════════════ */}
        {phase === "category" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold uppercase tracking-wide text-foreground">
              What failed?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryMeta.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                const cc = COLOR_CLASSES[cat.color];
                return (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 ${cc.border} ${cc.bg} hover:opacity-90 transition-all text-left`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${cc.text}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-extrabold ${cc.text}`}>{cat.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PHASE: DEVICE
        ══════════════════════════════════════════════════════════════ */}
        {phase === "device" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold uppercase tracking-wide text-foreground">
              Which device?
            </h2>
            <div className="space-y-2">
              {deviceTypes.map((device) => (
                <button
                  key={device}
                  onClick={() => selectDevice(device)}
                  className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border ${c.border} bg-card hover:${c.bg} transition-all text-left`}
                >
                  <span className="text-sm font-bold text-foreground">{device}</span>
                  <ChevronRight className={`w-4 h-4 ${c.text} flex-shrink-0`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PHASE: SYMPTOM
        ══════════════════════════════════════════════════════════════ */}
        {phase === "symptom" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold uppercase tracking-wide text-foreground">
              What's the symptom?
            </h2>
            <div className="space-y-3">
              {symptoms.map((node) => (
                <button
                  key={node.id}
                  onClick={() => selectNode(node.id)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border ${c.border} bg-card hover:${c.bg} transition-all text-left`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-foreground">{node.symptom}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {node.symptomDetail}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${c.text} flex-shrink-0 mt-0.5`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PHASE: DIAGNOSING
        ══════════════════════════════════════════════════════════════ */}
        {phase === "diagnosing" && currentStep && currentStep.type === "question" && (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {[...Array(Math.max(diagHistory.length + 1, 1))].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < diagHistory.length ? c.border.replace("border-", "bg-") : "bg-muted"
                  }`}
                />
              ))}
              <div className={`h-1.5 flex-1 rounded-full ${c.border.replace("border-", "bg-")}`} />
            </div>

            {/* Question */}
            <div className={`bg-card border-2 ${c.border} rounded-xl p-6 space-y-6`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                  <Info className={`w-4 h-4 ${c.text}`} />
                </div>
                <p className="text-base font-bold text-foreground leading-relaxed">
                  {currentStep.text}
                </p>
              </div>

              {/* Yes / No */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => answer(true)}
                  className="py-5 rounded-xl bg-green-500/15 border-2 border-green-500/40 hover:bg-green-500/25 transition-all font-extrabold text-green-400 text-lg"
                >
                  YES
                </button>
                <button
                  onClick={() => answer(false)}
                  className="py-5 rounded-xl bg-red-500/15 border-2 border-red-500/40 hover:bg-red-500/25 transition-all font-extrabold text-red-400 text-lg"
                >
                  NO
                </button>
              </div>
            </div>

            {/* Context */}
            {selectedNode && (
              <div className="text-xs text-muted-foreground text-center">
                Diagnosing: <span className="text-foreground font-medium">{selectedNode.symptom}</span>
                {" · "}
                Step {diagHistory.length + 1}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PHASE: RESULT
        ══════════════════════════════════════════════════════════════ */}
        {phase === "result" && finalSolution && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-5 h-5 ${c.text}`} />
              <h2 className="text-base font-extrabold uppercase tracking-wide text-foreground">
                Diagnosis Complete
              </h2>
            </div>
            {selectedNode && (
              <p className="text-xs text-muted-foreground">
                {selectedNode.deviceType} &bull; {selectedNode.symptom}
              </p>
            )}
            <ResultCard
              solution={finalSolution}
              color={color}
              onReset={resetAll}
            />
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        {phase === "category" && (
          <>
            <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3 text-sm text-muted-foreground">
              <p className="font-extrabold text-foreground text-xs uppercase tracking-wide">
                About this tool
              </p>
              <p className="leading-relaxed">
                Every fix has three tiers: <strong className="text-foreground">Standard</strong> (spare parts),{" "}
                <strong className="text-amber-400">Improvised</strong> (what's in your pack), and{" "}
                <strong className="text-red-400">Extreme</strong> (natural and found materials). The extreme
                fixes are the ones you need when nothing else is available.
              </p>
              <p className="leading-relaxed">
                Fixes marked <span className="text-red-400 font-bold">LETHAL</span> or{" "}
                <span className="text-red-400 font-bold">DANGER</span> require a safety acknowledgment before
                viewing. No exceptions.
              </p>
            </div>
            <DataPrivacyNotice />
            <SupportFooter />
          </>
        )}
      </div>
    </div>
  );
}
