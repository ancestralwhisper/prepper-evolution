// ─── Share Results Page ───────────────────────────────────────────
// Renders a public readiness score card from URL params.
// URL format: /tools/share?s=67&w=15&f=12&b=20&k=14&p=6&n=4&l=On+Track

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Shield, ArrowRight, CheckCircle } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface ShareData {
  total: number;
  water: number;
  food: number;
  bugout: number;
  kit72: number;
  solar: number;
  people: number;
  label: string;
}

function getRingColor(total: number) {
  if (total >= 91) return { ring: "border-emerald-400", text: "text-emerald-400", stroke: "stroke-emerald-400" };
  if (total >= 76) return { ring: "border-green-400",   text: "text-green-400",   stroke: "stroke-green-400"   };
  if (total >= 51) return { ring: "border-yellow-400",  text: "text-yellow-400",  stroke: "stroke-yellow-400"  };
  if (total >= 26) return { ring: "border-orange-400",  text: "text-orange-400",  stroke: "stroke-orange-400"  };
  return             { ring: "border-red-400",    text: "text-red-400",    stroke: "stroke-red-400"    };
}

const DOMAINS = [
  { key: "water",  label: "Water"  },
  { key: "food",   label: "Food"   },
  { key: "bugout", label: "BOB"    },
  { key: "kit72",  label: "72-Hr"  },
  { key: "solar",  label: "Power"  },
] as const;

export default function ShareResults() {
  useSEO({
    title: "Prepper Readiness Score | Prepper Evolution",
    description: "See a household's preparedness score across water, food, bug-out bag, 72-hour kit, and power — built with free tools at PrepperEvolution.com.",
  });

  const [data, setData] = useState<ShareData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = parseInt(params.get("s") ?? "0", 10);
    if (isNaN(s)) return;
    setData({
      total:  s,
      water:  parseInt(params.get("w") ?? "0", 10),
      food:   parseInt(params.get("f") ?? "0", 10),
      bugout: parseInt(params.get("b") ?? "0", 10),
      kit72:  parseInt(params.get("k") ?? "0", 10),
      solar:  parseInt(params.get("p") ?? "0", 10),
      people: parseInt(params.get("n") ?? "0", 10),
      label:  params.get("l") ?? "Score",
    });
  }, []);

  if (!data) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">No readiness data found in this link.</p>
          <Link href="/tools/household" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold py-2.5 px-5 rounded-xl text-sm hover:opacity-90 transition-opacity">
            Build Your Score <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const colors = getRingColor(data.total);

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">

        {/* Badge */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Prepper Evolution</p>
          <h1 className="text-2xl font-extrabold">Readiness Score</h1>
          {data.people > 0 && (
            <p className="text-sm text-muted-foreground mt-1">Household of {data.people}</p>
          )}
        </div>

        {/* Score card */}
        <div className={`bg-card border-2 ${colors.ring} rounded-2xl p-8 mb-6`}>
          <div className="flex flex-col items-center gap-4">
            {/* Ring */}
            <div className="relative w-36 h-36">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="62" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
                <circle
                  cx="72" cy="72" r="62" fill="none" strokeWidth="10"
                  strokeLinecap="round"
                  className={colors.stroke}
                  strokeDasharray={`${(data.total / 100) * 389.6} 389.6`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black tabular-nums ${colors.text}`}>{data.total}</span>
                <span className="text-xs text-muted-foreground font-bold">/100</span>
              </div>
            </div>

            <div className="text-center">
              <p className={`text-2xl font-extrabold ${colors.text}`}>{data.label}</p>
            </div>

            {/* Domain breakdown */}
            <div className="w-full grid grid-cols-5 gap-2 mt-2">
              {DOMAINS.map(({ key, label }) => {
                const val = data[key] as number;
                const pct = (val / 20) * 100;
                return (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <div className="w-full bg-muted/50 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          pct >= 75 ? "bg-emerald-400" :
                          pct >= 50 ? "bg-yellow-400" :
                          pct > 0   ? "bg-orange-400" : "bg-muted"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold">{label}</span>
                    <span className="text-[11px] font-black tabular-nums">{val}/20</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-card border border-border rounded-xl p-5 text-center space-y-3">
          <p className="text-sm font-medium">Build your own readiness score — free, no login, all data stays on your device.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/tools/household"
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 px-5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              Start My Score <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tools"
              className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border font-medium py-3 px-5 rounded-xl hover:bg-muted/70 transition-colors text-sm"
            >
              All Free Tools
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          prepperevolution.com — free preparedness tools, no login required
        </p>
      </div>
    </div>
  );
}
