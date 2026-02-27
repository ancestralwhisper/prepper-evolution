import { Link } from "wouter";
import {
  Backpack, Droplets, UtensilsCrossed, Zap, ClipboardList, Map,
  ArrowRight,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const tools = [
  {
    slug: "bug-out-bag-calculator",
    name: "Bug Out Bag Weight Calculator",
    description:
      "Build your BOB from 40+ gear items, track total weight vs. body weight limits, and get personalized recommendations for missing essentials.",
    icon: Backpack,
    status: "live" as const,
    badge: "Popular",
  },
  {
    slug: "water-storage-calculator",
    name: "Water Storage Calculator",
    description:
      "Calculate exactly how much water your family needs based on group size, climate, and duration. Includes container recommendations and FEMA guidelines.",
    icon: Droplets,
    status: "coming-soon" as const,
  },
  {
    slug: "food-storage-calculator",
    name: "Food Storage Calculator",
    description:
      "Plan your emergency food supply by calories, macros, and shelf life. Input family size and duration to get a complete shopping list.",
    icon: UtensilsCrossed,
    status: "coming-soon" as const,
  },
  {
    slug: "power-station-calculator",
    name: "Solar & Power Station Calculator",
    description:
      "Input your devices and run times to calculate the watt-hours you need. Get matched to the right portable power station and solar panel setup.",
    icon: Zap,
    status: "coming-soon" as const,
  },
  {
    slug: "72-hour-kit-builder",
    name: "72-Hour Kit Builder",
    description:
      "Answer questions about your region, climate, family, and needs to generate a custom 72-hour emergency kit checklist. Downloadable PDF.",
    icon: ClipboardList,
    status: "coming-soon" as const,
  },
  {
    slug: "evacuation-route-planner",
    name: "Evacuation Route Planner",
    description:
      "Plan primary, secondary, and tertiary evacuation routes. Inspired by Joel Skousen's Strategic Relocation principles — avoid highways, choke points, and high-risk corridors.",
    icon: Map,
    status: "coming-soon" as const,
  },
];

export default function ToolsIndex() {
  useSEO({
    title: "Free Prepper Tools & Calculators | Prepper Evolution",
    description: "Free interactive tools for preppers: bug out bag weight calculator, water storage calculator, food storage planner, power station sizing, 72-hour kit builder, and evacuation route planner.",
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Free Tools</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
            Prepper <span className="text-primary">Calculators & Tools</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Interactive tools built on real data — FEMA guidelines, US Army field manuals,
            and hands-on experience. No sign-up required. Calculate, plan, and prepare.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isLive = tool.status === "live";

            const card = (
              <div
                className={`bg-card border border-border rounded-xl p-6 flex flex-col h-full transition-all ${
                  isLive
                    ? "hover:shadow-lg hover:border-primary/30 cursor-pointer"
                    : "opacity-60"
                }`}
                data-testid={`card-tool-${tool.slug}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  {tool.badge && (
                    <span className="text-xs font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-1 rounded">
                      {tool.badge}
                    </span>
                  )}
                  {!isLive && (
                    <span className="text-xs font-bold uppercase tracking-wide bg-muted text-muted-foreground px-2 py-1 rounded border border-border">
                      Coming Soon
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-display font-bold mb-2">{tool.name}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{tool.description}</p>

                {isLive && (
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide mt-4 pt-4 border-t border-border">
                    Open Calculator <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );

            return isLive ? (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                {card}
              </Link>
            ) : (
              <div key={tool.slug}>{card}</div>
            );
          })}
        </div>

        <div className="max-w-3xl mt-16 space-y-6">
          <h2 className="text-2xl font-display font-bold">Why Use Prepper Calculators?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Most preppers either over-prepare (spending thousands on gear they will never carry) or
            under-prepare (missing critical items until it is too late). These calculators use real-world
            data from FEMA, the US military, and field-tested experience to help you build a balanced,
            practical preparedness plan — whether you are building your first 72-hour kit or optimizing
            a bug out bag you have carried for years.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every tool is free, works on mobile, and requires no account. Your data stays in your
            browser — we do not store personal information. Share your results with a link or print
            them as a checklist.
          </p>
        </div>
      </div>
    </div>
  );
}
