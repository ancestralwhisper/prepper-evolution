import { Link } from "wouter";
import {
  Backpack, Droplets, UtensilsCrossed, Zap, ClipboardList, Map,
  ArrowRight, FolderOpen, Shield, Target, Crosshair,
  Siren, Skull, Truck, Fuel, Weight, Brain,
  AlertTriangle, BarChart3, Repeat,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface Tool {
  slug: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "live" | "coming-soon";
  badge?: string | null;
  version?: string | null;
  cta?: string;
}

const calculators: Tool[] = [
  {
    slug: "bug-out-bag-calculator",
    name: "Bug Out Bag Weight Calculator",
    description:
      "Build your BOB from 40+ gear items, track total weight vs. body weight limits, and get personalized recommendations for missing essentials.",
    icon: Backpack,
    status: "live",
    badge: "Popular",
    version: "v1.3",
  },
  {
    slug: "water-storage-calculator",
    name: "Water Storage Calculator",
    description:
      "Calculate exactly how much water your family needs based on group size, climate, and duration. Includes container recommendations and FEMA guidelines.",
    icon: Droplets,
    status: "live",
    version: "v1.2",
  },
  {
    slug: "food-storage-calculator",
    name: "Food Storage Calculator",
    description:
      "Plan your emergency food supply by calories, macros, and shelf life. Input family size and duration to get a complete shopping list.",
    icon: UtensilsCrossed,
    status: "live",
    version: "v1.2",
  },
  {
    slug: "solar-power-calculator",
    name: "Solar & Power Station Calculator",
    description:
      "Input your devices and run times to calculate the watt-hours you need. Get matched to the right portable power station and solar panel setup for your location.",
    icon: Zap,
    status: "live",
    version: "v1.3",
  },
  {
    slug: "72-hour-kit-builder",
    name: "72-Hour Kit Builder",
    description:
      "Answer questions about your region, climate, family, and needs to generate a custom 72-hour emergency kit checklist. Downloadable PDF.",
    icon: ClipboardList,
    status: "live",
    version: "v1.2",
  },
];

const hardlineTools: Tool[] = [
  {
    slug: "shtf-simulator",
    name: "SHTF Scenario Simulator",
    description:
      "Face realistic emergency scenarios and make survival decisions. Your choices determine if you make it out — and what gear would have saved you.",
    icon: Skull,
    status: "live",
    version: "v1.0",
    cta: "Launch Simulator",
  },
  {
    slug: "evacuation-route-planner",
    name: "Evacuation Route Planner",
    description:
      "Plan primary, secondary, and tertiary evacuation routes. Inspired by Joel Skousen's Strategic Relocation principles — avoid highways, choke points, and high-risk corridors.",
    icon: Map,
    status: "coming-soon",
    cta: "Open Planner",
  },
];

const opsDeckTools: Tool[] = [
  {
    slug: "vehicle-profile",
    name: "Unified Vehicle Profile",
    description:
      "Build your complete rig profile from 30+ real vehicles. Track every mod — lift, tires, bumpers, winch, armor, fuel, electrical — and see real-time impact on payload, MPG, stability, and trail readiness.",
    icon: Truck,
    status: "live",
    badge: "New",
    version: "v1.0",
    cta: "Build Profile",
  },
  {
    slug: "fuel-range-planner",
    name: "Fuel & Range Planner",
    description:
      "Plot waypoints on a map and watch your fuel burn in real-time. Calculates terrain-adjusted MPG, cache waypoints, altitude penalties, and shows exactly where you run dry.",
    icon: Fuel,
    status: "coming-soon",
    cta: "Plan Route",
  },
  {
    slug: "vehicle-load-balancer",
    name: "Overland Load Balancer",
    description:
      "Drag-and-drop gear onto a vehicle diagram. See live front/rear weight split, center of gravity shift, rollover angle, and get warnings before you overload an axle.",
    icon: Weight,
    status: "coming-soon",
    cta: "Balance Load",
  },
  {
    slug: "skills-tracker",
    name: "Skills & Knowledge Gap Analyzer",
    description:
      "Self-assess 60+ survival and overlanding skills across 8 domains. Get a personalized skill roadmap, priority training recommendations, and curated learning resources.",
    icon: Brain,
    status: "coming-soon",
    cta: "Assess Skills",
  },
  {
    slug: "threat-risk-dashboard",
    name: "Threat-Specific Risk Dashboard",
    description:
      "Enter your ZIP code and get FEMA-sourced risk scores for 18 hazard types. See probability bars, top 5 priority actions, and generate a custom preparedness PDF.",
    icon: AlertTriangle,
    status: "coming-soon",
    cta: "Check Threats",
  },
  {
    slug: "barter-value-estimator",
    name: "Barter & Trade Value Estimator",
    description:
      "Estimate post-collapse trade values for 100+ items across 6 scarcity tiers. Find the best ROI gear to stockpile and build optimized barter kits by budget.",
    icon: Repeat,
    status: "coming-soon",
    cta: "Estimate Values",
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const isLive = tool.status === "live";
  const cta = tool.cta || "Open Calculator";

  const card = (
    <div
      className={`bg-card border border-border rounded-lg p-6 flex flex-col h-full transition-all ${
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

      <h3 className="text-lg font-extrabold mb-2">{tool.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{tool.description}</p>

      {isLive && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
            {cta} <ArrowRight className="w-4 h-4" />
          </div>
          {tool.version && (
            <span className="text-[10px] font-mono font-bold text-muted-foreground/50 uppercase tracking-wider">
              {tool.version}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return isLive ? (
    <Link href={`/tools/${tool.slug}`}>{card}</Link>
  ) : (
    <div>{card}</div>
  );
}

export default function ToolsIndex() {
  useSEO({
    title: "Free Prepper Tools & Calculators | Prepper Evolution",
    description: "Free interactive tools for preppers and overlanders: bug out bag calculator, water storage, food storage, power station sizing, 72-hour kit builder, SHTF simulator, and the Ops Deck — vehicle-aware preparedness tools with real physics.",
  });

  return (
    <div className="bg-background">
      <div className="relative overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
          data-testid="video-tools-hero"
        >
          <source src="/tools-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl animate-fade-in-up">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
              Free Tools
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-white">
              Prepper <span className="text-primary">Calculators & Tools</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Interactive tools built on real data — FEMA guidelines, US Army field manuals,
              and hands-on experience. No sign-up required. Calculate, plan, and prepare.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

        <div className="mb-8 animate-fade-in-up">
          <Link
            href="/tools/my-kits"
            className="inline-flex items-center gap-2 bg-muted border border-border rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all group"
            data-testid="link-my-kits"
          >
            <FolderOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            Have saved results? View your kit library
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>

        <div className="mb-8 animate-fade-in-up">
          <Link href="/quiz" className="block group" data-testid="link-quiz-banner">
            <div className="bg-card border-2 border-primary/30 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:shadow-lg hover:border-primary/50 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-extrabold group-hover:text-primary transition-colors">
                    Prepper Readiness Quiz
                  </h2>
                  <span className="text-xs font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-1 rounded">
                    Featured
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  10 questions, 2 minutes. Get your survival score, see where you are strong and where you have gaps,
                  and get personalized gear recommendations for your level.
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide flex-shrink-0">
                Take the Quiz <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold">Prep Calculators</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up-delay-1">
            {calculators.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Siren className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-xl font-extrabold">Hardline Tools</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 ml-11">
            Scenario training and tactical planning. Where prep meets pressure.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up-delay-1">
            {hardlineTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
            </div>
            <h2 className="text-xl font-extrabold">Ops Deck</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 ml-11">
            Your rig. Your risks. Your readiness. One integrated system built on real physics and real data.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up-delay-1">
            {opsDeckTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>

        <div className="max-w-3xl space-y-6">
          <h2 className="text-2xl font-extrabold">
            Why Use Prepper Calculators?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Most preppers either over-prepare (spending thousands on gear they will never carry) or
            under-prepare (missing critical items until it is too late). These calculators use real-world
            data from FEMA, the US military, and field-tested experience to help you build a balanced,
            practical preparedness plan — whether you are building your first 72-hour kit or optimizing
            a bug out bag you have carried for years.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every tool is free, works on mobile, and requires no account. Your data is stored
            locally in your browser only — nothing is ever sent to our servers or shared with
            anyone. Your configurations save automatically so you can pick up where you left off.
            Just keep in mind: clearing your browser cache or site data will erase your saved progress.
            Share your results with a link or print them as a checklist.
          </p>
        </div>
      </div>
    </div>
  );
}
