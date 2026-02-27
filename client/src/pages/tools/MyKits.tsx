import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import {
  Backpack, Zap, Trash2, ExternalLink, Package,
  Weight, Hash, Percent, Clock, Battery, Sun, Users, MapPin,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface KitConfig<T = unknown> {
  id: string;
  storageKey: string;
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  parseSummary: (data: T) => SummaryItem[];
  parseTimestamp: (data: T) => number | null;
}

interface SummaryItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

interface BobData {
  bodyWeight: number;
  selected: Record<string, number>;
  customItems: { id: string; name: string; weightOz: number; category: string }[];
  timestamp: number;
}

const WARNING_PERCENT = 25;
const CRITICAL_PERCENT = 33;

function parseBobSummary(data: BobData): SummaryItem[] {
  const itemCount = Object.keys(data.selected).length;

  const pct = data.bodyWeight > 0 ? 0 : 0;
  void pct;

  const items: SummaryItem[] = [
    {
      label: "Items Packed",
      value: `${itemCount}`,
      icon: Hash,
    },
    {
      label: "Body Weight",
      value: `${data.bodyWeight} lbs`,
      icon: Weight,
    },
  ];

  const enhanced = data as BobData & { totalLbs?: number; pctBodyWeight?: number };
  if (typeof enhanced.totalLbs === "number") {
    const pctBW = enhanced.pctBodyWeight ?? 0;
    const status =
      pctBW >= CRITICAL_PERCENT ? "Too Heavy" :
      pctBW >= WARNING_PERCENT ? "Heavy" :
      pctBW > 0 ? "Good" : "Empty";

    items.unshift({
      label: "Total Weight",
      value: `${enhanced.totalLbs.toFixed(1)} lbs`,
      icon: Package,
      highlight: true,
    });
    items.push({
      label: "% Body Weight",
      value: `${pctBW.toFixed(1)}%`,
      icon: Percent,
    });
    items.push({
      label: "Status",
      value: status,
      icon: Package,
      highlight: status === "Good",
    });
  }

  return items;
}

interface SolarData {
  people: number;
  days: number;
  region: string;
  useCase: string;
  selected: Record<string, { qty: number; hours: number }>;
  timestamp: number;
}

const REGION_LABELS: Record<string, string> = {
  southwest: "Southwest US",
  southeast: "Southeast US",
  midwest: "Midwest US",
  northeast: "Northeast US",
  northwest: "Northwest US",
  mountain: "Mountain West",
  hawaii: "Hawaii",
  alaska: "Alaska",
};

const USE_CASE_LABELS: Record<string, string> = {
  emergency: "Emergency Backup",
  offgrid: "Off-Grid Living",
  camping: "Overlanding / Camping",
};

function parseSolarSummary(data: SolarData): SummaryItem[] {
  const deviceCount = Object.keys(data.selected).length;

  const items: SummaryItem[] = [
    {
      label: "Devices",
      value: `${deviceCount}`,
      icon: Zap,
      highlight: true,
    },
    {
      label: "People",
      value: `${data.people}`,
      icon: Users,
    },
    {
      label: "Days Off-Grid",
      value: `${data.days}`,
      icon: Clock,
    },
    {
      label: "Region",
      value: REGION_LABELS[data.region] || data.region,
      icon: MapPin,
    },
    {
      label: "Use Case",
      value: USE_CASE_LABELS[data.useCase] || data.useCase,
      icon: Battery,
    },
  ];

  const enhanced = data as SolarData & {
    totalDailyWh?: number;
    batteryCapacityNeeded?: number;
    solarWattsNeeded?: number;
  };

  if (typeof enhanced.totalDailyWh === "number") {
    const fmtWh = (wh: number) => wh >= 1000 ? `${(wh / 1000).toFixed(1)} kWh` : `${Math.round(wh)} Wh`;
    const fmtW = (w: number) => w >= 1000 ? `${(w / 1000).toFixed(1)} kW` : `${Math.round(w)} W`;

    items.splice(1, 0, {
      label: "Daily Power",
      value: fmtWh(enhanced.totalDailyWh),
      icon: Zap,
      highlight: true,
    });

    if (typeof enhanced.batteryCapacityNeeded === "number") {
      items.push({
        label: "Battery Needed",
        value: fmtWh(enhanced.batteryCapacityNeeded),
        icon: Battery,
      });
    }

    if (typeof enhanced.solarWattsNeeded === "number") {
      items.push({
        label: "Solar Needed",
        value: fmtW(enhanced.solarWattsNeeded),
        icon: Sun,
      });
    }
  }

  return items;
}

const kitConfigs: KitConfig<never>[] = [
  {
    id: "bob",
    storageKey: "pe-bob-calculator",
    name: "Bug Out Bag",
    description: "Your saved BOB loadout with gear selections and weight tracking.",
    href: "/tools/bug-out-bag-calculator",
    icon: Backpack,
    accentColor: "text-primary",
    parseSummary: parseBobSummary as (data: never) => SummaryItem[],
    parseTimestamp: (data: never) => (data as unknown as BobData).timestamp ?? null,
  },
  {
    id: "solar",
    storageKey: "pe-solar-calculator",
    name: "Solar & Power Setup",
    description: "Your saved power station and solar panel configuration.",
    href: "/tools/solar-power-calculator",
    icon: Zap,
    accentColor: "text-[#EAB308]",
    parseSummary: parseSolarSummary as (data: never) => SummaryItem[],
    parseTimestamp: (data: never) => (data as unknown as SolarData).timestamp ?? null,
  },
];

interface SavedKit {
  config: KitConfig<never>;
  data: never;
  summary: SummaryItem[];
  timestamp: number | null;
}

export default function MyKits() {
  const [kits, setKits] = useState<SavedKit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useSEO({
    title: "My Saved Kits",
    description: "View and manage your saved bug out bag and solar power calculator configurations. All data stored locally in your browser.",
  });

  const loadKits = useCallback(() => {
    const found: SavedKit[] = [];

    for (const config of kitConfigs) {
      try {
        const raw = localStorage.getItem(config.storageKey);
        if (!raw) continue;
        const data = JSON.parse(raw) as never;

        const hasData = (() => {
          if (config.id === "bob") {
            const bob = data as unknown as BobData;
            return Object.keys(bob.selected).length > 0;
          }
          if (config.id === "solar") {
            const solar = data as unknown as SolarData;
            return Object.keys(solar.selected).length > 0;
          }
          return true;
        })();

        if (!hasData) continue;

        found.push({
          config,
          data,
          summary: config.parseSummary(data),
          timestamp: config.parseTimestamp(data),
        });
      } catch {
        // Corrupted data — skip silently
      }
    }

    found.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    setKits(found);
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadKits();
  }, [loadKits]);

  const handleDelete = (kitId: string) => {
    if (confirmDelete !== kitId) {
      setConfirmDelete(kitId);
      return;
    }

    const config = kitConfigs.find((c) => c.id === kitId);
    if (config) {
      localStorage.removeItem(config.storageKey);
    }
    setConfirmDelete(null);
    loadKits();
  };

  const formatTimestamp = (ts: number | null) => {
    if (!ts) return "Unknown";
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3" data-testid="text-tool-label">Dashboard</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4" data-testid="text-page-title">
            My Saved <span className="text-primary">Kits</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-page-description">
            View and manage your saved calculator configurations. All data is stored locally in your browser.
          </p>
        </div>

        {!loaded && (
          <div className="space-y-6 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-6 h-48"
              />
            ))}
          </div>
        )}

        {loaded && kits.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-extrabold mb-3" data-testid="text-empty-title">No Saved Kits Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
              You haven&apos;t used any calculators yet &mdash; start building your first kit!
              Your results are saved automatically in your browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {kitConfigs.map((config) => {
                const Icon = config.icon;
                return (
                  <Link
                    key={config.id}
                    href={config.href}
                    className="flex items-center gap-3 bg-card border border-border rounded-lg px-5 py-3 hover:border-primary/30 hover:shadow-lg transition-all group"
                    data-testid={`link-calculator-${config.id}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block group-hover:text-primary transition-colors">
                        {config.name}
                      </span>
                      <span className="text-xs text-muted-foreground">Open Calculator</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-2" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {loaded && kits.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{kits.length}</span>{" "}
                saved kit{kits.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground/60">
                Data stored locally in your browser
              </p>
            </div>

            {kits.map((kit) => {
              const Icon = kit.config.icon;
              const isConfirming = confirmDelete === kit.config.id;

              return (
                <div
                  key={kit.config.id}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  data-testid={`card-kit-${kit.config.id}`}
                >
                  <div className="flex items-center justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${kit.config.accentColor}`} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base">{kit.config.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Updated {formatTimestamp(kit.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {kit.summary.map((item, idx) => {
                        const StatIcon = item.icon;
                        return (
                          <div key={idx} className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                              <StatIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wide leading-tight">
                                {item.label}
                              </p>
                              <p
                                className={`text-sm font-bold mt-0.5 ${
                                  item.highlight ? "text-primary" : "text-foreground"
                                }`}
                              >
                                {item.value}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-5 pb-5">
                    <Link
                      href={kit.config.href}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2.5 text-sm font-bold uppercase tracking-wide transition-colors"
                      data-testid={`link-open-${kit.config.id}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Calculator
                    </Link>

                    <button
                      onClick={() => handleDelete(kit.config.id)}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-bold uppercase tracking-wide transition-colors ${
                        isConfirming
                          ? "bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500/25"
                          : "bg-muted border border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30"
                      }`}
                      data-testid={`button-delete-${kit.config.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {isConfirming ? "Confirm" : "Delete"}
                    </button>
                  </div>

                  {isConfirming && (
                    <div className="px-5 pb-4 -mt-1">
                      <p className="text-xs text-red-500/80">
                        This will permanently delete your saved {kit.config.name.toLowerCase()} data.{" "}
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="underline hover:no-underline font-medium"
                          data-testid={`button-cancel-delete-${kit.config.id}`}
                        >
                          Cancel
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {(() => {
              const unusedConfigs = kitConfigs.filter(
                (config) => !kits.some((k) => k.config.id === config.id)
              );
              if (unusedConfigs.length === 0) return null;

              return (
                <div className="mt-10">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    More Calculators
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {unusedConfigs.map((config) => {
                      const Icon = config.icon;
                      return (
                        <Link
                          key={config.id}
                          href={config.href}
                          className="flex items-center gap-3 bg-muted border border-border rounded-lg p-4 hover:border-primary/30 hover:bg-card transition-all group"
                          data-testid={`link-more-${config.id}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold block group-hover:text-primary transition-colors">
                              {config.name}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {config.description}
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
