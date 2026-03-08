
import TrailIntel from "@/components/tools/TrailIntel";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import PrintQrCode from "@/components/tools/PrintQrCode";
import InstallButton from "@/components/tools/InstallButton";

export default function TrailIntelPage() {
  const toolUrl = "https://prepperevolution.com/tools/trail-intel";

  return (
    <div className="space-y-6">
      {/* Tool Title */}
      <div>
        <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Ops Deck</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold">Trail Intel &mdash; <span className="text-primary">Know Before You Go</span></h2>
      </div>

      {/* How This Tool Works */}
      <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-extrabold mb-3">How This Tool Works</h3>
        <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-3">
          <p>
            Punch in any ZIP code and we&apos;ll pull real-time intel from FEMA, the National Weather Service, and NIFC fire data &mdash; active alerts, fire perimeters, weather warnings, and local hazard history all in one place. No accounts, no apps, just the data you need before you head out or hunker down.
          </p>
          <p>
            <strong className="text-foreground">Bottom line:</strong> situational awareness is step one of any plan. This tool gives you a quick threat picture for any location so you&apos;re never caught off guard by something you could have seen coming.
          </p>
        </div>
      </div>

      {/* Main component */}
      <TrailIntel showZipInput defaultCollapsed={false} />

      {/* Footer stack */}
      <div className="space-y-4 no-print">
        {/* Modified privacy notice */}
        <div className="bg-muted border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Your Data, Your Device
            </h4>
          </div>
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your destination ZIP is sent to our server to fetch government data (FEMA, NWS, NIFC) — <strong className="text-foreground">it is not stored or logged</strong>.
                Results are cached locally in your browser for 10 minutes. Your ZIP is saved locally so you don&apos;t have to re-enter it.
              </p>
            </div>
            <div className="flex gap-2">
              <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Clearing your browser cache or site data will erase</strong> your saved destination ZIP and cached intel data.
              </p>
            </div>
          </div>
        </div>

        <SupportFooter />
        <ToolSocialShare url={toolUrl} toolName="Trail Intel" />
        <PrintQrCode url={toolUrl} />
        <InstallButton />
      </div>
    </div>
  );
}
