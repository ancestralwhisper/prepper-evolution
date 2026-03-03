interface ChangelogEntry {
  date: string;
  tool: string;
  version: string;
  summary: string;
}

const changelog: ChangelogEntry[] = [
  {
    date: "Mar 3, 2026",
    tool: "RigSafe Configurator",
    version: "v1.0",
    summary: "Launched three-chain RTT/rack load calculator — validates static, dynamic, and off-road ratings, payload, garage clearance, and sleeping capacity",
  },
  {
    date: "Mar 3, 2026",
    tool: "RigRated UTV Builder",
    version: "v1.0",
    summary: "Launched UTV overland builder with 26+ machines, 80+ accessories, 50-state legal heatmap, trail scoring, and trip plan PDF export",
  },
  {
    date: "Mar 3, 2026",
    tool: "Vehicle Profile",
    version: "v1.1",
    summary: "Added 9 everyday vehicles: GMC Canyon, Colorado Z71, Sierra SLE, Silverado LT, Forester Wilderness, Outback Premium, Bronco Sport, RAV4 TRD, Passport TrailSport — 41 vehicles total",
  },
  {
    date: "Mar 1, 2026",
    tool: "Vehicle Profile",
    version: "v1.0",
    summary: "Launched with 32 vehicles, 10 mod categories, real-time MPG/payload/stability physics engine",
  },
  {
    date: "Mar 1, 2026",
    tool: "All Tools",
    version: "",
    summary: "Added data privacy notices, ZIP code auto-fill system, and version tracking across all calculators",
  },
  {
    date: "Feb 28, 2026",
    tool: "SHTF Simulator",
    version: "v1.0",
    summary: "Launched choice-based survival scenarios — your decisions determine if you make it out",
  },
  {
    date: "Feb 26, 2026",
    tool: "Solar Calculator",
    version: "v1.3",
    summary: "Added apartment caps (200W/2500Wh), living situation selector, ZIP-based solar hours",
  },
  {
    date: "Feb 26, 2026",
    tool: "BOB Calculator",
    version: "v1.3",
    summary: "Expanded to 80 items across 11 categories with real ASINs and affiliate links",
  },
  {
    date: "Feb 25, 2026",
    tool: "Water Storage",
    version: "v1.2",
    summary: "Added ZIP lookup, living situation awareness, apartment container filtering",
  },
  {
    date: "Feb 25, 2026",
    tool: "Food Storage",
    version: "v1.2",
    summary: "Added living situation selector with apartment space alerts",
  },
  {
    date: "Feb 25, 2026",
    tool: "72-Hour Kit",
    version: "v1.2",
    summary: "ZIP auto-fills region, climate, and hazards including California wildfire zones",
  },
];

export default function ChangelogTicker() {
  const items = [...changelog, ...changelog];

  return (
    <div className="w-full overflow-hidden bg-muted/50 border-t border-b border-border py-2.5">
      <div className="flex items-center gap-2 px-4 mb-0">
        <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
          Changelog
        </span>
      </div>
      <div className="relative mt-1.5 group">
        <div
          className="flex gap-8 whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused]"
          aria-label="Recent tool updates"
        >
          {items.map((entry, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-muted-foreground/40 font-mono">{entry.date}</span>
              <span className="text-primary/60 font-bold">{entry.tool}</span>
              {entry.version && (
                <span className="text-[10px] font-mono text-muted-foreground/30">{entry.version}</span>
              )}
              <span className="text-muted-foreground/70">{entry.summary}</span>
              <span className="text-muted-foreground/20 mx-2">●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
