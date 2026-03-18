import { Link } from "wouter";
import { useState, useEffect } from "react";
import {
  Backpack, Droplets, UtensilsCrossed, Zap, ClipboardList, Map,
  ArrowRight, FolderOpen, Shield, Target, Crosshair,
  Siren, Skull, Truck, Fuel, Weight, Brain, Wrench, Radar, BatteryCharging,
  AlertTriangle, BarChart3, Repeat, Package, Tent, Search,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import ChangelogTicker from "@/components/tools/ChangelogTicker";
import FeatureShowcase from "@/components/tools/FeatureShowcase";
import SupportFooter from "@/components/tools/SupportFooter";

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
      "Build your BOB from 125+ gear items, track total weight vs. body weight limits, and get personalized recommendations for missing essentials.",
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
    slug: "power-station-runtime",
    name: "Power Station Runtime Calculator",
    description:
      "Already have a power station? Select it, add your devices, and see exactly how long your battery will last. Cut devices for longer runtime, or add solar to extend it.",
    icon: BatteryCharging,
    status: "live",
    badge: "New",
    version: "v1.0",
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

const gearFinders: Tool[] = [
  {
    slug: "gear-finder",
    name: "Ultralight Gear Finder",
    description:
      "Compare 150+ ultralight backpacking products across 11 categories: tents, sleeping bags, pads, packs, stoves, cookware, rain gear, insulation, trekking poles, headlamps, and accessories. Filter by weight, price, and category-specific specs.",
    icon: Search,
    status: "live",
    badge: "Updated",
    version: "v2.0",
    cta: "Find Gear",
  },
  {
    slug: "tent-finder",
    name: "Backpacking Tent Finder",
    description:
      "Compare 50+ ultralight backpacking tents side by side. Filter by weight, price, setup type, wind rating, capacity, and more. Every spec is sourced from manufacturer data.",
    icon: Tent,
    status: "live",
    version: "v1.0",
    cta: "Find Tents",
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
    slug: "deadstock",
    name: "Deadstock — Supply Lifecycle Manager",
    description:
      "Know your exact number. Calculate the precise day your household becomes dependent on outside help. Tracks water, food, medical, power, comms, and gear — 100% private, stored on your device only.",
    icon: Package,
    status: "live",
    badge: "New",
    version: "v1.0",
    cta: "Find Your Number",
  },
  {
    slug: "vehicle-profile",
    name: "Unified Vehicle Profile",
    description:
      "Build your complete rig profile from 40+ real vehicles — trucks, SUVs, crossovers, and vans. Track every mod and see real-time impact on payload, MPG, stability, and trail readiness.",
    icon: Truck,
    status: "live",
    badge: "Updated",
    version: "v1.1",
    cta: "Build Profile",
  },
  {
    slug: "fuel-range-planner",
    name: "Fuel & Range Planner",
    description:
      "Build your route segment by segment and watch your fuel burn in real-time. Terrain-adjusted MPG with elevation penalties, climate adjustments, point of no return, and fuel cache recommendations.",
    icon: Fuel,
    status: "live",
    badge: "New",
    version: "v1.0",
    cta: "Plan Route",
  },
  {
    slug: "rigsafe-configurator",
    name: "RigSafe Overland Configurator",
    description:
      "Design your rooftop tent and rack setup, then let the three-chain calculator tell you if it's safe. Validates static, on-road, and off-road dynamic ratings, vehicle payload, garage clearance, and sleeping capacity.",
    icon: Shield,
    status: "live",
    badge: "New",
    version: "v1.0",
    cta: "Configure Rig",
  },
  {
    slug: "rigrated-configurator",
    name: "RigRated UTV Overland Builder",
    description:
      "Select from 26+ real UTVs, add 80+ accessories, and see how weight, fuel range, towing, and trail legality change in real time. Plan a trip and generate a leave-behind trip plan PDF.",
    icon: Wrench,
    status: "live",
    badge: "New",
    version: "v1.0",
    cta: "Build UTV",
  },
  {
    slug: "trail-intel",
    name: "Trail Intel — Know Before You Go",
    description:
      "Real-time conditions at your destination. Weather alerts, FEMA disasters, wildfires, plus NPS park closures, BLM route status, and USFS seasonal access for 7 trail systems.",
    icon: Radar,
    status: "live",
    badge: "Updated",
    version: "v2.0",
    cta: "Check Intel",
  },
  {
    slug: "power-system-builder",
    name: "Power System Builder",
    description:
      "Design a complete 12V auxiliary electrical system. Wire gauge calculator, fuse sizing, LiFePO4 battery bank design, DC-DC charger selection, solar integration, and a safety-verified wiring diagram.",
    icon: BatteryCharging,
    status: "live",
    badge: "New",
    version: "v1.0",
    cta: "Build System",
  },
  {
    slug: "skills-tracker",
    name: "Skills & Knowledge Gap Analyzer",
    description:
      "Self-assess 60+ survival and overlanding skills across 8 domains. Get a personalized skill roadmap, priority training recommendations, and curated learning resources.",
    icon: Brain,
    status: "live",
    badge: "New",
    version: "v1.0",
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
      "Estimate post-collapse trade values for 100+ items and 30+ skills across 3 timeline phases. Based on real data from Venezuela, Yugoslavia, Argentina, and post-Katrina economies. Find the best ROI gear to stockpile now.",
    icon: Repeat,
    status: "live",
    badge: "New",
    version: "v1.0",
    cta: "Estimate Values",
  },
];

function ReadinessBanner() {
  const [score, setScore] = useState<number | null>(null);
  const [assessed, setAssessed] = useState(0);

  useEffect(() => {
    // Quick check: count how many tool keys have data
    const keys = [
      "pe-deadstock-result", "pe-bob-calculator", "pe-water-calculator",
      "pe-solar-calculator", "pe-vehicle-profile", "pe-skills-assessment",
      "pe-barter-portfolio", "pe-readiness-financial",
    ];
    let count = 0;
    keys.forEach((k) => { if (localStorage.getItem(k)) count++; });
    setAssessed(count);

    // Load cached score from history
    try {
      const hist = localStorage.getItem("pe-readiness-history");
      if (hist) {
        const entries = JSON.parse(hist);
        if (Array.isArray(entries) && entries.length > 0) {
          setScore(entries[entries.length - 1].score);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const hasScore = score !== null && assessed > 0;
  const color = !hasScore ? "#6B7280" : score <= 25 ? "#EF4444" : score <= 50 ? "#F97316" : score <= 75 ? "#EAB308" : "#22C55E";

  return (
    <div className="mb-8 animate-fade-in-up">
      <Link href="/tools/readiness-dashboard" className="block group">
        <div className="relative overflow-hidden rounded-xl border-2 border-primary/40 hover:border-primary/70 transition-all hover:shadow-xl bg-gradient-to-r from-card via-card to-primary/5">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" />
          <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none" style={{
            background: "radial-gradient(circle, currentColor 0%, transparent 70%)",
          }} />
          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            {/* Score Circle */}
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="8" opacity="0.3" />
                  {hasScore && (
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke={color}
                      strokeWidth="8"
                      strokeDasharray={`${(score / 100) * 314} 314`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      className="transition-all duration-700"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-black" style={{ color }}>
                    {hasScore ? score : "?"}
                  </span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                <h2 className="text-lg sm:text-xl font-extrabold group-hover:text-primary transition-colors">
                  {hasScore ? "Your Readiness Score" : "Unified Readiness Dashboard"}
                </h2>
                <span className="text-xs font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-1 rounded">
                  New
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {hasScore
                  ? `Scoring ${assessed}/8 categories. Open your dashboard to see pillar breakdowns, critical alerts, and actions to improve your score.`
                  : "One score across 8 readiness categories. Pulls from every PE tool you have completed. See where you are strong, where you have gaps, and what to do next."
                }
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide flex-shrink-0">
              {hasScore ? "Open Dashboard" : "Check Your Score"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

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

      {/* ─── Changelog Ticker ──────────────────────────────────── */}
      <ChangelogTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

        {/* ─── Readiness Dashboard Banner ─────────────────────── */}
        <ReadinessBanner />

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

        {/* ─── Showcase: Deadstock ──────────────────────────────── */}
        <FeatureShowcase
          label="New Tool — Deadstock"
          title="Deadstock:"
          titleAccent="Know Your Exact Survival Timeline"
          description="Most people guess how long they could last without outside help. Deadstock replaces that guess with a real number — your Autonomy Clock. Enter your household and supplies, and see the exact date your household hits Day Zero."
          features={[
            { highlight: "Autonomy Clock", text: "— the exact number of days your household can survive, updated in real-time as you add or consume supplies" },
            { highlight: "Last Day Date", text: "— not 'about 3 weeks' but an actual calendar date that hits differently" },
            { highlight: "Weakest Link Detection", text: "— instantly see which category (water, food, medical, power) runs out first" },
            { highlight: "Shareable Autonomy Score", text: "— a single 0-365+ number you can share: 'I'm a 47-day household. What are you?'" },
          ]}
          imageSrc="https://wp.prepperevolution.com/wp-content/uploads/2026/03/Deadstock.jpg"
          imageAlt="Deadstock Autonomy Clock showing days of supply autonomy"
          cta="Find Your Number"
          href="/tools/deadstock"
        />

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
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-xl font-extrabold">Gear Finders</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 ml-11">
            Compare real specs side by side. Filter, sort, and find the right gear for your trip.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up-delay-1">
            {gearFinders.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>

        {/* ─── Showcase: SHTF Simulator ─────────────────────────── */}
        <FeatureShowcase
          label="Hardline Tools — SHTF Simulator"
          title="SHTF Simulator:"
          titleAccent="Survive the Scenario. Learn the Lesson."
          description="The SHTF Simulator drops you into realistic emergency scenarios using choice-based gameplay. Every decision matters — wrong call and you don't make it. Right call and you learn what gear would have saved you."
          features={[
            { highlight: "Branching scenarios", text: "— your choices create different outcomes, not a linear quiz" },
            { highlight: "Gear-aware results", text: "— the debrief tells you exactly what items would have changed your outcome" },
            { highlight: "Replay value", text: "— multiple scenarios with different environments, threats, and decision trees" },
            { highlight: "No sign-up", text: "— jump straight in and start making survival decisions" },
          ]}
          imageSrc="https://wp.prepperevolution.com/wp-content/uploads/2026/03/SHTF_simulator.jpg"
          imageAlt="SHTF Scenario Simulator showing a survival decision with branching choices"
          cta="Launch Simulator"
          href="/tools/shtf-simulator"
          reverse
          variant="red"
        />

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

        {/* ─── Showcase: Ops Deck Ecosystem ─────────────────────── */}
        <FeatureShowcase
          label="Ops Deck — Vehicle Profile & Fuel Planner"
          title="Ops Deck:"
          titleAccent="Your Rig. Your Data. One Ecosystem."
          description="Build your Vehicle Profile once and every Ops Deck tool reads from it automatically. Your MPG, payload, fuel capacity, and mod penalties flow into the Fuel Planner, RigSafe, and every tool that follows. Change a tire size once — your range, stability, and safety numbers update everywhere."
          features={[
            { highlight: "40+ real vehicles", text: "— manufacturer specs, NHTSA data, and EPA ratings. Not forum guesses." },
            { highlight: "Fuel & Range Planner", text: "— terrain-adjusted MPG across 8 surface types with elevation penalties and fuel cache recommendations" },
            { highlight: "Cross-tool integration", text: "— Vehicle Profile feeds RigSafe, RigRated, Fuel Planner, and Power System Builder automatically" },
            { highlight: "Physics-based", text: "— every number is derived from published data sources with a multiplicative penalty chain model" },
          ]}
          imageSrc="https://wp.prepperevolution.com/wp-content/uploads/2026/03/ops_deck_vehicle_profile.jpg"
          imageAlt="Ops Deck Vehicle Profile showing mod penalties and trail readiness score"
          cta="Build Your Profile"
          href="/tools/vehicle-profile"
          variant="emerald"
        />

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <SupportFooter />
      </div>

    </div>
  );
}
