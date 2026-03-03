import { AlertTriangle, ShieldAlert } from "lucide-react";

interface ToolSafetyDisclaimerProps {
  level: "standard" | "safety-critical";
  message?: string;
}

const SAFETY_CRITICAL_MESSAGE =
  "This tool uses published manufacturer data and conservative real-world estimates. " +
  "It is for planning and educational purposes only. Always verify every number with your " +
  "vehicle owner's manual and rack/tent manufacturer documentation. Overloading any component " +
  "can cause vehicle damage, loss of control, serious injury, or death. " +
  "Prepper Evolution assumes no liability for any decisions made using this tool.";

const STANDARD_MESSAGE =
  "This tool provides estimates based on published data and general guidelines. " +
  "Results are for planning purposes only. Always verify with manufacturer documentation.";

export default function ToolSafetyDisclaimer({ level, message }: ToolSafetyDisclaimerProps) {
  const isCritical = level === "safety-critical";
  const displayMessage = message || (isCritical ? SAFETY_CRITICAL_MESSAGE : STANDARD_MESSAGE);

  return (
    <div
      className={`rounded-lg p-4 no-print ${
        isCritical
          ? "bg-red-500/5 border-2 border-red-500/40"
          : "bg-muted border border-border"
      }`}
    >
      <div className="flex gap-3">
        {isCritical ? (
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
        )}
        <div>
          <h4
            className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${
              isCritical ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {isCritical ? "Safety Warning" : "Disclaimer"}
          </h4>
          <p
            className={`text-[11px] leading-relaxed ${
              isCritical ? "text-red-400/90" : "text-muted-foreground"
            }`}
          >
            {displayMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
