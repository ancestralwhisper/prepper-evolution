import { useSEO } from "@/hooks/useSEO";
import { Printer, ExternalLink } from "lucide-react";

/**
 * "Steal My Gear List" — Mike's complete 2025 GMC Sierra 1500 overland build.
 * Lead magnet delivered via Kit email #1.
 * ASINs: fill in "#" placeholders once confirmed on Amazon.
 */

const AMZ = (asin: string) => `https://www.amazon.com/dp/${asin}?tag=prepperevo-20`;

type GearItem = {
  name: string;
  note?: string;
  href: string;
  badge?: "Amazon" | "Direct";
  qty?: string;
  incoming?: boolean;
};

type GearCategory = {
  icon: string;
  title: string;
  subtitle?: string;
  items: GearItem[];
};

const categories: GearCategory[] = [
  {
    icon: "🏕️",
    title: "Rooftop Tent & Shelter",
    subtitle: "The foundation of the build. Everything else is layered on top of this.",
    items: [
      {
        name: "OVS HD Bushveld RTT",
        note: "My main shelter — annex, awning, and universal LED lighting kit included in the bundle",
        href: "https://ovs-offroad.com",
        badge: "Direct",
      },
      {
        name: "OVS XD Nomadic 270 Awning (driver side)",
        note: "Full driver-side coverage. Pairs with the annex for a proper camp setup",
        href: AMZ("B0DFRGR1XK"),
        badge: "Amazon",
        incoming: true,
      },
      {
        name: "270 Awning Side Walls",
        note: "Full enclosure for the 270. Still in transit.",
        href: "https://ovs-offroad.com",
        badge: "Direct",
        incoming: true,
      },
    ],
  },
  {
    icon: "🏗️",
    title: "Roof Rack & Bed System",
    subtitle: "The structure everything mounts to.",
    items: [
      {
        name: "Go Rhino / RealTruck CEROS Low-Profile Roof Rack",
        note: "Ceros acts as the front stop for the RTT. Aluminum, low-profile.",
        href: "https://www.realtruck.com",
        badge: "Direct",
      },
      {
        name: "RealTruck Elevate Bed Rack",
        note: "Main bed rack the RTT sits on (not on the cab rack)",
        href: AMZ("B0G278BLWJ"),
        badge: "Amazon",
      },
      {
        name: "BakFlip MX4 TS Tonneau Cover",
        note: "Hard-folding tonneau with T-track rails — TS variant is dealer-direct, not sold on Amazon",
        href: "https://www.realtruck.com",
        badge: "Direct",
      },
      {
        name: "RealTruck UnderCover SwingCase Truck Bed Toolbox (Driver Side)",
        note: "Swing-out storage behind the wheel well",
        href: AMZ("B07K9JWFVL"),
        badge: "Amazon",
      },
      {
        name: "MZS T-Track Tie-Down Anchors",
        note: "Secure cargo to the tonneau track system",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "Taruca RacksBrax XD Hitch Mounts",
        note: "Quick-release system to attach/detach 180°, 270°, and 6–8 ft awnings from the hitch. In transit — compatibility with OVS awning TBD.",
        href: "https://www.taruca.com",
        badge: "Direct",
        incoming: true,
      },
    ],
  },
  {
    icon: "⚡",
    title: "Power System",
    subtitle: "EcoFlow ecosystem runs the whole rig. RTT, fridge, lighting, AC, everything.",
    items: [
      {
        name: "EcoFlow DELTA 3 Ultra (4096Wh, 6000W output)",
        note: "The brain of the power system. Powers the fridge, Wave 3, charging, lights.",
        href: AMZ("B0FT32MCM9"),
        badge: "Amazon",
      },
      {
        name: "EcoFlow 220W Bifacial Solar Panels (×3 = 660W)",
        note: "Mounted on the CEROS rack and Elevate bed rack",
        href: AMZ("B09TKM8PBQ"),
        badge: "Amazon",
      },
      {
        name: "EcoFlow Wave 3 Ultra",
        note: "Portable AC + heater for the RTT. Game-changer for shoulder season.",
        href: AMZ("B0F4D4Z18S"),
        badge: "Amazon",
      },
      {
        name: "EcoFlow WAVE Series Silver Protection Bag",
        note: "Keeps the Wave 3 clean and protected in transport",
        href: "https://ecoflow.com",
        badge: "Direct",
      },
      {
        name: "EcoFlow DELTA 3 Waterproof Bag",
        href: "https://ecoflow.com",
        badge: "Direct",
      },
      {
        name: "EMP Shield Micro DC-12V",
        note: "Whole-truck EMP protection. Plugs into the 12V circuit.",
        href: AMZ("B0BLCYSB3G"),
        badge: "Amazon",
      },
    ],
  },
  {
    icon: "🧊",
    title: "Fridge & Cold Storage",
    subtitle: "Dometic CFX5 95DZ — dual zone keeps fresh food and frozen meat separate.",
    items: [
      {
        name: "Dometic CFX5 95DZ Dual-Zone Fridge/Freezer",
        note: "95L dual zone. Left side fridge, right side freezer. The best overlanding fridge I've owned. Sold direct via Dometic.",
        href: "https://dometic.com",
        badge: "Direct",
      },
      {
        name: "Dometic CFX5 95 Protective Cover",
        note: "Keeps it clean and adds insulation when parked",
        href: AMZ("B08F7Z9DS2"),
        badge: "Amazon",
      },
      {
        name: "DFG Offroad Fridge Slide for Dometic CFX 95L–100L",
        note: "Custom slide for the 95DZ — mounts in the bed rib valley. Sold direct via DFG Offroad.",
        href: "https://dfgoffroad.com",
        badge: "Direct",
      },
      {
        name: "Dometic Hydration Water Jug 11L (Glacier)",
        note: "Insulated for keeping cold drinking water accessible",
        href: AMZ("B0FNKMPQ5V"),
        badge: "Amazon",
      },
      {
        name: "Dometic GO Hydration Water Faucet",
        note: "Turns the Dometic jug into a tap — camp quality-of-life upgrade",
        href: AMZ("B0FLBN8HDD"),
        badge: "Amazon",
      },
      {
        name: "OVS Multi-Purpose Fluid Tanks with Mounting Bracket",
        note: "Extra fluid storage mounted to the rack",
        href: "https://ovlandvehiclesystems.com",
        badge: "Direct",
      },
    ],
  },
  {
    icon: "📡",
    title: "Connectivity & Navigation",
    subtitle: "Starlink everywhere. No excuses for dead zones anymore.",
    items: [
      {
        name: "Starlink Roam Standard (with WiFi router and power supply)",
        note: "Works anywhere with sky view. I run it off the DELTA 3 Ultra. Game-changer for remote work + family trips.",
        href: "https://www.starlink.com",
        badge: "Direct",
      },
      {
        name: "Starlink Standard Roof Rack Mount",
        note: "Mounts the dish to the roof rack — solid and low-profile",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "Silicone Starlink Gen 3 Dish Cover",
        note: "UV/hail resistant protective case for the Gen 3 dish",
        href: AMZ("B0G2Q7YKJR"),
        badge: "Amazon",
      },
      {
        name: "XLTTYTWL Starlink Gen 3 Mount (Router + Power Supply, UTR-32)",
        note: "All-in-one mounting kit for the router and power supply",
        href: AMZ("B0D12L7KG9"),
        badge: "Amazon",
      },
      {
        name: "Car Cable Wire Hider (6.56 ft, roof rack)",
        note: "Conceals the Starlink cable along the roofline",
        href: AMZ("#"),
        badge: "Amazon",
      },
    ],
  },
  {
    icon: "💡",
    title: "Lighting (Devos + COB Build)",
    subtitle: "Two-part lighting system: Devos portable work/camp lights + custom COB LED build in the RTT and awning area.",
    items: [
      {
        name: "Devos LightRanger 4000 (4,000 lm, Bluetooth)",
        note: "Portable work/camp light. 4,000 lumens, mounts on a pole, Bluetooth app control. Best camp light I've used.",
        href: "https://devosoutdoor.com",
        badge: "Direct",
      },
      {
        name: "Devos Outdoor Motion Sensor",
        note: "Pairs with the LightRanger system",
        href: "https://devosoutdoor.com",
        badge: "Direct",
      },
      {
        name: "Devos AMPak 20 Portable Power Bank",
        note: "Dedicated power bank for the Devos system",
        href: "https://devosoutdoor.com",
        badge: "Direct",
      },
      {
        name: "BTF-LIGHTING FCOB COB RGB LED Strip (IP66, 810 LEDs/m, 32.8 ft, DC12V)",
        note: "The backbone of the COB awning light build. I wired this into the truck's 12V system.",
        href: AMZ("B0DQPMBV1B"),
        badge: "Amazon",
      },
      {
        name: "BTF-LIGHTING RF 2.4GHz RGB Wireless Remote Controller (Tuya App)",
        note: "Zone control for the COB strips — phone app or remote",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "APIELE 10A 22mm Latching Push Button Switch (Blue LED, waterproof)",
        note: "Panel-mount switch for the COB lighting circuit",
        href: AMZ("#"),
        badge: "Amazon",
      },
    ],
  },
  {
    icon: "📦",
    title: "Bed Panels & Organization",
    subtitle: "SZYANG MOLLE panels turn the truck bed walls into a modular storage system.",
    items: [
      {
        name: "SZYANG Front Bed MOLLE Panel (2019–2025 Silverado/Sierra)",
        note: "Replaces the factory plastic — adds MOLLE webbing across the entire front bed wall",
        href: AMZ("B0GF25XG4L"),
        badge: "Amazon",
      },
      {
        name: "SZYANG 5.8FT Side Bed MOLLE Panel (2019–2025 Silverado/Sierra)",
        note: "Full-length side panels. Pairs with the front panel for complete bed organization.",
        href: AMZ("B0GF26XW81"),
        badge: "Amazon",
      },
      {
        name: "OpenRoad 102L Rugged Truck Bed Case",
        note: "Weatherproof 102L hard case. Sold direct — mounts on backorder from OpenRoad.",
        href: "https://openroad4wd.com",
        badge: "Direct",
        incoming: true,
      },
    ],
  },
  {
    icon: "🍳",
    title: "Cooking",
    subtitle: "Full camp kitchen setup. JetBoil for quick boils, GCI station for real cooking.",
    items: [
      {
        name: "JetBoil Genesis Basecamp System",
        note: "Two-burner propane system. Fast, efficient, packs into itself. My primary base camp stove.",
        href: AMZ("B019GPHR64"),
        badge: "Amazon",
      },
      {
        name: "GCI Outdoor Master Cook Station",
        note: "Full kitchen table with soft-shell sink, heat-resistant top, telescoping lantern pole. The hub.",
        href: AMZ("B07C3WK867"),
        badge: "Amazon",
      },
      {
        name: "GCI Outdoor Slim-Fold Cook Station",
        note: "Lighter-weight backup/second surface option when space is tighter",
        href: AMZ("B0BDCRJKZR"),
        badge: "Amazon",
      },
      {
        name: "Coleman RoadTrip 285 Portable Stand-Up Propane Grill",
        note: "Three adjustable burners, 20,000 BTU. For when you want a proper grill setup at camp.",
        href: AMZ("B0DV1DFZ8P"),
        badge: "Amazon",
      },
    ],
  },
  {
    icon: "🚿",
    title: "Water & Shower System",
    subtitle: "Full camp shower setup. On-demand hot water with a 12V pump and 60-gal bladder.",
    items: [
      {
        name: "CAMPLUX 1.32 GPM Tankless Propane Water Heater (AY132B)",
        note: "The hot water source for the outdoor shower. Propane, on-demand, compact.",
        href: AMZ("B084TVQFJM"),
        badge: "Amazon",
      },
      {
        name: "Camplux AY132 Quick-Release Mounting Bracket",
        note: "Wall-mount bracket for the AY132B heater.",
        href: AMZ("B0G9H2XLRC"),
        badge: "Amazon",
      },
      {
        name: "SEAFLO 33 Series 12V DC Diaphragm Pump (3.0 GPM, 45 PSI)",
        note: "Powers the shower head off 12V. Self-priming, built-in pressure switch.",
        href: AMZ("B07DQT1FVZ"),
        badge: "Amazon",
      },
      {
        name: "TPU Water Storage Bladder — 60 Gallon (Food Grade, 3/4\" GHT)",
        note: "Fill before leaving or at camp. Main water reservoir.",
        href: AMZ("B0CMZV2R8P"),
        badge: "Amazon",
      },
      {
        name: "RUMOSE 118\" Extra-Long Shower Hose (Matte Black, Stainless)",
        note: "The long hose gives full range of motion under the shower setup",
        href: AMZ("B0B8HJ6V5N"),
        badge: "Amazon",
      },
      {
        name: "RecPro RV Handheld Shower Head with Shut-Off (Matte Black)",
        note: "Conserves water — shut off between rinses",
        href: AMZ("B0BSHDWNHB"),
        badge: "Amazon",
      },
      {
        name: "OVS Outdoor Shower (complete kit)",
        note: "The OVS shower enclosure. In transit.",
        href: "https://ovs-offroad.com",
        badge: "Direct",
        incoming: true,
      },
    ],
  },
  {
    icon: "🔊",
    title: "Audio",
    items: [
      {
        name: "ECOXGEAR EcoDEFENDER Outdoor Bluetooth Speaker (121dB, Blaze Orange)",
        note: "Waterproof, drop-proof, pairs up to 100 units, 25+ hr playtime. Loud enough for camp, durable enough for overlanding.",
        href: AMZ("B0DJ1T36HY"),
        badge: "Amazon",
        incoming: true,
      },
    ],
  },
  {
    icon: "🔋",
    title: "12V Electrical Build (COB Wiring)",
    subtitle: "The under-the-hood electrical work for the COB lighting and 12V auxiliary system.",
    items: [
      {
        name: "TalentCell 12V 12Ah LiFePO4 Battery (LF4021)",
        note: "Small auxiliary lithium battery for the COB lighting circuit",
        href: AMZ("B08GSJJV6Y"),
        badge: "Amazon",
      },
      {
        name: "ECO-WORTHY 12V 280Ah LiFePO4 Battery with Bluetooth & BMS (3584Wh)",
        note: "Main auxiliary house battery for the 12V system",
        href: AMZ("B0G79296WJ"),
        badge: "Amazon",
      },
      {
        name: "Cooclensportey 12AWG Inline Fuse Holder with Assorted Fuses (35 pack)",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "IP68 Waterproof Junction Box (2-Way, with Terminal Block)",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "Deutsch DT 4-pin Pigtail Kit (14AWG Pure Copper)",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "TICONN 200pc Heat Shrink Butt Connector Kit (Waterproof)",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "BTF-LIGHTING COB RGB LED Strip Connectors (4-pin, 10mm, 10-pack)",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "LED Strip Mounting Brackets / Clips (100 pack, 12mm, IP67/68)",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "XHF 1/2\" 3:1 Waterproof Clear Heat Shrink Tubing (4 ft)",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "Firmerst 20 AWG 4-Conductor Insulated Electrical Wire (100 ft)",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "10 ft 14/4 AWG SJOOW Portable Power Cable",
        href: AMZ("#"),
        badge: "Amazon",
      },
      {
        name: "Zip Ties Assorted Sizes 400-pack (UV Resistant)",
        href: AMZ("#"),
        badge: "Amazon",
      },
    ],
  },
  {
    icon: "🪑",
    title: "Seating & Comfort",
    items: [
      {
        name: "GCI Outdoor Freestyle Rocker XL Portable Folding Rocking Chair",
        note: "My main camp chair. The rocking feature sounds gimmicky until you sit in one after a long drive.",
        href: AMZ("B0DQQF4TLB"),
        badge: "Amazon",
      },
      {
        name: "GCI Outdoor Pod Rocker (Indigo Blue)",
        note: "Second chair — same rocking vibe",
        href: AMZ("B07N6ZRF9N"),
        badge: "Amazon",
      },
      {
        name: "ONETIGRIS Tigerblade Lightweight Folding Chair (330 lbs)",
        note: "Ultralight backpacking-style chair. Good for hikes when you want to sit at the trailhead.",
        href: AMZ("B0CQJR8NLW"),
        badge: "Amazon",
      },
      {
        name: "MOON LENCE High Back Folding Camping Chair (330 lbs)",
        note: "Full back support. Good for longer sits.",
        href: AMZ("B0F9WQPSFF"),
        badge: "Amazon",
      },
    ],
  },
];

export default function GearList() {
  useSEO({
    title: "Mike's Sierra Overland Build: The Complete Gear List",
    description: "Every piece of gear on my 2025 GMC Sierra 1500 overland build — shelter, power, fridge, comms, cooking, and the COB lighting wiring system.",
  });

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="py-12 bg-stone-100 dark:bg-stone-900 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Document wrapper */}
        <div className="bg-white text-gray-900 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">

          {/* Header */}
          <div className="bg-stone-800 px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <img src="/favicon.png" alt="Prepper Evolution" className="w-8 h-8 opacity-80" />
              <span className="text-sm font-semibold uppercase tracking-widest text-stone-400">Prepper Evolution</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-2">
              Steal My Gear List
            </h1>
            <p className="text-stone-300 text-base mb-3">
              The complete 2025 GMC Sierra 1500 overland build — every piece I'm running, why I chose it,
              and what's still incoming.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-stone-400 mt-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                {totalItems} total items
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Some still in transit
              </span>
              <span>Vehicle: 2025 GMC Sierra 1500</span>
            </div>
          </div>

          {/* Affiliate notice */}
          <div className="bg-stone-50 border-b border-stone-200 px-8 py-3">
            <p className="text-xs text-stone-500">
              <strong>Affiliate disclosure:</strong> Amazon links use my tag — I earn a small commission at no extra cost to you.
              "Direct" links go to the brand's own site. I only list gear I actually own or have on order.
            </p>
          </div>

          {/* Print + legend */}
          <div className="px-8 pt-5 pb-2 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex flex-wrap gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <span className="bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 font-medium">Amazon</span>
                Affiliate link
              </span>
              <span className="flex items-center gap-1">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 font-medium">Direct</span>
                Brand site
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full inline-block"></span>
                Incoming / in transit
              </span>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-800 border border-stone-200 hover:border-stone-300 rounded-lg px-4 py-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Categories */}
          <div className="px-8 py-4 space-y-10">
            {categories.map((cat) => (
              <section key={cat.title}>
                <h2 className="flex items-center gap-2 text-xl font-black text-gray-900 border-b-2 border-stone-800 pb-2 mb-2">
                  <span>{cat.icon}</span>
                  <span>{cat.title}</span>
                </h2>
                {cat.subtitle && (
                  <p className="text-sm text-stone-500 italic mb-4">{cat.subtitle}</p>
                )}
                <ul className="space-y-3">
                  {cat.items.map((item) => {
                    const isPlaceholder = item.href.endsWith("dp/#?tag=prepperevo-20") || item.href === "#";
                    const showLink = !isPlaceholder;
                    return (
                      <li key={item.name} className="flex items-start gap-3">
                        <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.incoming ? "bg-yellow-400" : "bg-green-500"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {showLink ? (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-stone-800 hover:text-orange-600 hover:underline inline-flex items-center gap-1"
                              >
                                {item.name}
                                <ExternalLink className="w-3 h-3 opacity-50" />
                              </a>
                            ) : (
                              <span className="font-semibold text-stone-800">{item.name}</span>
                            )}
                            {item.badge && (
                              <span className={`text-xs rounded px-1.5 py-0.5 border font-medium print:hidden ${
                                item.badge === "Amazon"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                            {item.incoming && (
                              <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded px-1.5 py-0.5 print:hidden">
                                incoming
                              </span>
                            )}
                          </div>
                          {item.note && (
                            <p className="text-sm text-stone-500 mt-0.5">{item.note}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          {/* What's still coming section */}
          <div className="mx-8 mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <h3 className="font-black text-yellow-800 mb-2">🚧 Still Incoming / On the List</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Recovery boards (still deciding — MAXTRAX vs. Traction Boards)</li>
              <li>• RealTruck Elevate Rack Side Bars (considering)</li>
              <li>• Lift kit + new wheels/tires (planning for before October Overland Expo East)</li>
              <li>• OpenRoad Rugged Case mounts (on backorder from OpenRoad — slow shipping)</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="bg-stone-50 border-t border-stone-200 px-8 py-6">
            <p className="text-sm text-stone-500 mb-2">
              <strong className="text-stone-700">Questions about any of this?</strong> Hit me up at{" "}
              <a href="https://prepperevolution.com/contact" className="text-orange-600 hover:underline">
                prepperevolution.com/contact
              </a>{" "}
              or reply directly to the email I sent you.
            </p>
            <p className="text-xs text-stone-400 mt-3">
              © {new Date().getFullYear()} Prepper Evolution · prepperevolution.com · Updated April 2026
            </p>
          </div>
        </div>

      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
