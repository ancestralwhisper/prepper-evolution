import { useSEO } from "@/hooks/useSEO";
import RigRatedConfigurator from "./RigRatedConfigurator";

export default function RigRatedConfiguratorPage() {
  useSEO({
    title: "RigRated UTV/Quad Overland Builder | Ops Deck",
    description:
      "Build your UTV overland rig. Know exactly what it can haul, where it can go, and how long you can stay. Payload calculator, 50-state OHV legality, trail compatibility, and trip planning for side-by-sides. Free, no sign-up.",
  });

  return (
    <div className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-3xl mb-10 animate-fade-in-up">
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
            Ops Deck
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            RigRated UTV/Quad <span className="text-primary">Overland Builder</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Build your UTV overland rig. Know exactly what it can haul, where it can go,
            and how long you can stay. Select from 26+ real UTVs, add 80+ accessories,
            check payload limits, validate trail compatibility, verify 50-state OHV legality,
            and generate a leave-behind trip plan — all computed from real manufacturer specs.
          </p>
          <p className="text-primary text-sm font-bold mt-3">
            Build it. Load it. Know before you go.
          </p>
        </div>

        <div className="max-w-3xl mb-10 animate-fade-in-up">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full rounded-lg"
              src="https://www.youtube-nocookie.com/embed/flERE5CUFeI"
              title="How to Ride Your Side by Side to the Grand Canyon"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Video: &quot;How to Ride Your Side by Side to the Grand Canyon&quot; by Buck&apos;s Send It &amp; Info Channel
          </p>
        </div>

        <div className="animate-fade-in-up-delay-1">
          <RigRatedConfigurator />
        </div>

        <div className="max-w-3xl mt-16 space-y-8 no-print">
          <section>
            <h2 className="text-2xl font-extrabold mb-4">
              Why RigRated?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              No interactive UTV overland planning tool existed anywhere on the internet.
              Riders planning multi-day trips on the Arizona Peace Trail, Paiute Trail,
              Colorado Alpine Loop, or Rubicon have no way to validate that their loaded
              rig is within payload limits before hitting the trail. UTV payload capacities
              are extremely tight — typically 400 to 1,000 pounds — and it takes very little
              gear to exceed them. RigRated solves this by computing real payload math from
              real manufacturer specs.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Select your machine, add your accessories, set your trip duration, and see
              exactly how much weight you are carrying vs. your GVWR. Trail compatibility
              scoring tells you if your rig can handle the width restrictions, ground
              clearance requirements, and fuel distances of the trails you plan to ride.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-4">
              Understanding UTV Payload
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>Dry weight</strong> is the weight of the machine with no fuel, no
              accessories, and no occupants. This is the manufacturer-listed weight on the
              spec sheet.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>GVWR (Gross Vehicle Weight Rating)</strong> is the maximum total weight
              the machine is rated to carry — including itself, fuel, occupants, accessories,
              and cargo. Exceeding GVWR degrades braking, suspension, and handling.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Payload capacity</strong> is the difference: GVWR minus dry weight.
              This is what you have to work with. Once you add fuel (~60 lbs for a full
              tank), two adults (~360 lbs), and accessories (windshield, doors, winch,
              bumpers = easily 150+ lbs), you may have already used half your payload before
              loading a single piece of camping gear.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-4">
              50-State OHV Legality
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Every state has different rules for operating UTVs on public roads, BLM land,
              and national forests. Some states (Arizona, Utah, Idaho) allow road-legal
              operation with proper titling and registration. Others (California, New York)
              restrict operation to designated OHV areas only. Many states offer non-resident
              permits for visiting riders.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The RigRated legal heat map gives you a quick visual of where your rig can
              legally operate. Click any state to see detailed requirements including
              registration, permits, helmet laws, speed limits, and BLM/forest access rules.
              Always verify with official state agencies before your trip — laws change.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-4">
              The 14-Day Certified Badge
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The 14-Day Certified badge means your rig is verified capable of sustaining a
              14-day backcountry trip. To earn it, your build must pass five checks: payload
              under 80% (safety margin), at least one destination state legally green, fuel
              range exceeding 60 miles, recovery gear aboard, and adequate water supply for
              your group. This is not a guarantee — it is a planning tool that confirms you
              have addressed the five most common failure points in UTV overlanding.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
