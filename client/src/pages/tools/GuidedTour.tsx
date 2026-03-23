// ─── GuidedTour — Shared floating tour component ─────────────────────────────
// Usage:
//   const TOUR = [{ title: "Step Name", body: "Explanation.", anchor: "section-id" }]
//   <GuidedTour steps={TOUR} />
//
// Renders a "First time?" banner when idle. On start, shows a fixed bottom panel
// that steps through each entry. Optional `anchor` scrolls to that element ID.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { Info } from "lucide-react";

export interface TourStep {
  title: string;
  body: string;
  /** Optional: element id to scroll into view when this step activates */
  anchor?: string;
}

interface GuidedTourProps {
  steps: TourStep[];
  /** Label shown in the banner, e.g. "the Payload Calculator" */
  toolName?: string;
}

export function GuidedTour({ steps, toolName }: GuidedTourProps) {
  const [step, setStep] = useState<number | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (next >= steps.length) {
        setStep(null);
        return;
      }
      setStep(next);
      const anchor = steps[next]?.anchor;
      if (anchor) {
        setTimeout(() => {
          document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    },
    [steps],
  );

  return (
    <>
      {/* ── Banner (shown when tour is inactive) ── */}
      {step === null && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              First time?{toolName ? ` Take the ${toolName} walkthrough.` : " Take the guided tour."}
            </p>
            <p className="text-xs text-muted-foreground">
              Plain-English explanations of what to enter and why it matters.
            </p>
          </div>
          <button
            onClick={() => goTo(0)}
            className="flex-shrink-0 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Tour →
          </button>
        </div>
      )}

      {/* ── Floating panel (shown when tour is active) ── */}
      {step !== null && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(92vw,480px)] bg-card border border-primary/40 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Step {step + 1} of {steps.length}
            </span>
            <button
              onClick={() => setStep(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-wide"
            >
              ✕ Skip
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-primary/10">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="px-4 py-3 space-y-1.5">
            <p className="text-sm font-extrabold text-foreground">{steps[step].title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{steps[step].body}</p>
          </div>

          {/* Navigation */}
          <div className="px-4 pb-3 flex justify-between items-center">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === step ? "bg-primary" : "bg-primary/25 hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => goTo(step - 1)}
                  className="px-3 py-1.5 text-xs font-bold uppercase border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={() => goTo(step + 1)}
                className="px-4 py-1.5 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-primary/90 transition-colors"
              >
                {step < steps.length - 1 ? "Next →" : "Done ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
