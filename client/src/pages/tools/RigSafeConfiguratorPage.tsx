import { useSEO } from "@/hooks/useSEO";
import RigSafeConfigurator from "./RigSafeConfigurator";

export default function RigSafeConfiguratorPage() {
  useSEO({
    title: "RigSafe Overland Configurator | Ops Deck",
    description:
      "Design your rooftop tent setup and know it's safe before you buy a single bolt. Three-chain load calculator for rack ratings (static, on-road, off-road), vehicle payload, and garage clearance. Free, no sign-up.",
  });

  return (
    <div className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-3xl mb-10 animate-fade-in-up">
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
            Ops Deck
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            RigSafe Overland <span className="text-primary">Configurator</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Design your rooftop tent and rack setup, then let the three-chain calculator
            tell you if it is safe — before you buy a single bolt. Validates rack ratings
            (static, on-road dynamic, off-road dynamic), vehicle payload, garage clearance,
            sleeping capacity, and center of gravity impact. All computed from real
            manufacturer specs.
          </p>
          <p className="text-primary text-sm font-bold mt-3">
            Design it. Sleep it. Know it is safe.
          </p>
        </div>

        <div className="animate-fade-in-up-delay-1">
          <RigSafeConfigurator />
        </div>

        <div className="max-w-3xl mt-16 space-y-8 no-print">
          <section>
            <h2 className="text-2xl font-extrabold mb-4">
              Why RigSafe?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              No interactive RTT and rack load calculator existed anywhere on the internet.
              People in overlanding forums constantly ask &quot;can my vehicle handle a rooftop
              tent?&quot; and get confused by the three-tier weight rating system: static vs
              on-road dynamic vs off-road dynamic. They do not understand the weakest-link
              problem (vehicle roof rating vs rack rating), forget to account for tonneau
              covers and awnings in their weight math, and have no way to validate garage
              clearance or sleeping capacity against real load limits.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              RigSafe solves all of this. Select your vehicle, pick your rack, choose your
              tent, add your awning and cargo — and see every budget updated in real time.
              Three-chain analysis shows you exactly where the bottleneck is and how much
              margin you have left.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-4">
              Understanding the Three Weight Ratings
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>Static rating</strong> is the maximum load when the vehicle is parked
              and people are sleeping in the tent. This is the highest number and includes
              occupant weight and bedding.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>On-road dynamic rating</strong> is the maximum load while driving on
              paved roads. Road vibration and cornering forces reduce the safe limit — this
              number is always lower than static.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Off-road dynamic rating</strong> is the maximum load on trails and
              unpaved roads. Bumps, drops, and lateral forces from off-road driving reduce
              the limit further — typically 50-75% of the on-road number.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-4">
              The Weakest Link Problem
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your vehicle&apos;s roof has a weight rating. Your rack has a weight rating.
              Your tent has a weight rating. The effective limit is the <em>lowest</em> of
              the three — the weakest link in the chain. RigSafe identifies which component
              is the bottleneck at each tier (static, dynamic, off-road) so you know exactly
              what to upgrade or what to leave behind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-4">
              What Products Are in the Database?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              RigSafe includes 25+ racks from RealTruck, CBI Offroad, Leitner, Front Runner,
              Uptop, Yakima, Thule, Prinsu, Rhino Rack, ARB, and more. 20+ rooftop tents
              from iKamper, Roofnest, 23Zero, OVS, Smittybilt, ARB, Body Armor, Tuff Stuff,
              Thule, and Alu-Cab. 12+ awnings and 8+ tonneau covers. Every product has real
              manufacturer weight and rating specs. If your product is not listed, you can
              enter all specs manually.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
