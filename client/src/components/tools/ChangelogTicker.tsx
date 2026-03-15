
// ─── Changelog Ticker ────────────────────────────────────────────
// A scrolling news-ticker-style bar showing recent tool updates.
// Reads from changelog.json — add new entries there when pushing tool updates.
// Runs a CSS animation loop; pauses on hover.

import changelog from "../../pages/tools/changelog.json";

export default function ChangelogTicker() {
  // Duplicate entries for seamless infinite scroll
  const items = [...changelog, ...changelog];

  return (
    <div className="w-full overflow-hidden bg-muted/50 border-t border-b border-border py-2.5">
      <div className="flex items-center gap-2 px-4 mb-0">
        <span className="flex-shrink-0 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
          Changelog
        </span>
      </div>
      <div className="relative mt-1.5 group">
        <div
          className="flex gap-8 whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused]"
          aria-label="Recent tool updates"
        >
          {items.map((entry, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm">
              <span className="text-muted-foreground/70 font-mono">{entry.date}</span>
              <span className="text-primary font-bold">{entry.tool}</span>
              {entry.version && (
                <span className="text-xs font-mono text-muted-foreground/50">{entry.version}</span>
              )}
              <span className="text-foreground/80">{entry.summary}</span>
              <span className="text-muted-foreground/30 mx-2">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
