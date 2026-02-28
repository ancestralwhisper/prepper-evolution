import { Shield, HardDrive, AlertTriangle } from "lucide-react";

export default function DataPrivacyNotice() {
  return (
    <div className="bg-muted border border-border rounded-lg p-4 no-print" data-testid="data-privacy-notice">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-primary flex-shrink-0" />
        <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Your Data, Your Device
        </h4>
      </div>
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <HardDrive className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All your data is <strong className="text-foreground">stored locally in your browser only</strong>.
            Nothing is sent to our servers or shared with anyone &mdash; ever.
            Your configurations, selections, and results never leave your device.
          </p>
        </div>
        <div className="flex gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Clearing your browser cache or site data will permanently erase</strong> all
            saved progress across your calculators. To keep your data, avoid clearing browsing
            data for this site.
          </p>
        </div>
      </div>
    </div>
  );
}
