import { useSEO } from "@/hooks/useSEO";
import { Printer, CheckSquare } from "lucide-react";

const AMAZON = (asin: string) => `https://www.amazon.com/dp/${asin}?tag=prepperevo-20`;

const categories = [
  {
    icon: "💧",
    title: "Water (15 gal minimum for 3 days, family of 4–5)",
    items: [
      { name: "Water storage — 5-gallon BPA-free containers (3 minimum)", asin: "B001QFQA2A", qty: "3" },
      { name: "Water purification tablets (Potable Aqua)", asin: "B000YBFB3C", qty: "2 packs" },
      { name: "Sawyer Squeeze water filter", asin: "B00B1OSU4W", qty: "2" },
      { name: "Collapsible water jugs for refilling", asin: "B07VPRN3FT", qty: "2" },
    ],
  },
  {
    icon: "🥫",
    title: "Food (72+ hours, no cooking required options first)",
    items: [
      { name: "Mountain House 3-Day Emergency Food Supply", asin: "B09M7K6VXP", qty: "1–2" },
      { name: "Augason Farms 72-hour 1-person emergency food kit", asin: "B003M0EXYS", qty: "per person" },
      { name: "High-calorie protein/nut bars (2,400 cal bars)", asin: "B008RXJWIA", qty: "1 per person" },
      { name: "Manual can opener (get two)", asin: "B00004U8Y9", qty: "2" },
      { name: "Camp stove + fuel canisters", asin: "B0006VORDY", qty: "1 stove + 4 canisters" },
      { name: "Mess kit / lightweight cookset", asin: "B00MI5MSPQ", qty: "1" },
    ],
  },
  {
    icon: "🩺",
    title: "First Aid",
    items: [
      { name: "Surviveware Large First Aid Kit (200-piece)", asin: "B01N6NGXDL", qty: "1" },
      { name: "Israeli bandages / trauma dressings", asin: "B001QXYGKY", qty: "4+" },
      { name: "Tourniquet (CAT or SOFTT-W)", asin: "B00CFGWRWU", qty: "2" },
      { name: "QuikClot hemostatic gauze", asin: "B002SM7TNM", qty: "2" },
      { name: "Nitrile gloves", asin: "B01MR6D4LY", qty: "2 boxes" },
      { name: "CPR face shield", asin: "B000S74OO0", qty: "1" },
      { name: "Prescription meds (7-day supply)", href: "#", note: "Rotate regularly", qty: "7 days" },
      { name: "Antihistamine, ibuprofen, antidiarrheal", href: "#", qty: "full bottles" },
    ],
  },
  {
    icon: "📡",
    title: "Communications & Navigation",
    items: [
      { name: "Midland GXT1000VP4 GMRS radios (pair)", asin: "B001WMFYH4", qty: "1 pair (get 2 pairs for family of 5)" },
      { name: "Baofeng UV-5R ham radio (backup)", asin: "B074XPB313", qty: "1–2" },
      { name: "Garmin inReach Mini (satellite SOS)", asin: "B0G4RST8LV", qty: "1" },
      { name: "NOAA hand-crank weather radio", asin: "B00176TPOY", qty: "1" },
      { name: "Paper road maps of your state + region", href: "#", qty: "2" },
      { name: "Compass (basic baseplate compass)", asin: "B0009HD5CC", qty: "2" },
    ],
  },
  {
    icon: "📄",
    title: "Documents & Cash",
    items: [
      { name: "Waterproof document bag/sleeve", asin: "B07GNY3H23", qty: "1" },
      { name: "Copies: IDs, passports, insurance, deeds", href: "#", note: "Laminate or seal in Ziploc", qty: "copies" },
      { name: "$200–$500 cash in small bills", href: "#", note: "ATMs go down during emergencies", qty: "$200 min" },
      { name: "USB drive with family document scans", href: "#", qty: "1 encrypted" },
    ],
  },
  {
    icon: "💡",
    title: "Light & Power",
    items: [
      { name: "Jackery Explorer 240v2 (portable power station)", asin: "B0CFVBGWBT", qty: "1" },
      { name: "Goal Zero Torch 500 lantern/flashlight combo", asin: "B077NFHZ17", qty: "2" },
      { name: "Headlamps (Petzl or Black Diamond) — one per person", asin: "B08CL6YNYH", qty: "5" },
      { name: "AA/AAA batteries — 30 pack", asin: "B00000J1ER", qty: "2 packs" },
      { name: "Solar phone charger panel", asin: "B0CNPHD4VY", qty: "1" },
      { name: "Car battery jump starter", asin: "B07VBZSCPF", qty: "1" },
    ],
  },
  {
    icon: "🏕️",
    title: "Shelter & Warmth",
    items: [
      { name: "Emergency Mylar blankets (per person + spares)", asin: "B00KMHSLKQ", qty: "8" },
      { name: "Sleeping bags rated 20°F or lower", asin: "B088TFLG2M", qty: "per person" },
      { name: "Tarp (10x12 heavy-duty)", asin: "B08KC5SZJN", qty: "2" },
      { name: "550 paracord (100 ft)", asin: "B0040LHUB8", qty: "2 spools" },
      { name: "Work gloves", asin: "B07ZL8FH5H", qty: "2 pairs/adult" },
      { name: "Rain ponchos", asin: "B003HTYQTM", qty: "1/person" },
      { name: "Wool or fleece blanket (kids especially)", asin: "B00KFBQKBY", qty: "per child" },
    ],
  },
  {
    icon: "🚿",
    title: "Sanitation",
    items: [
      { name: "Portable toilet / bucket toilet", asin: "B0829FYQMY", qty: "1" },
      { name: "Waste bags for portable toilet", asin: "B09GZS2P7S", qty: "50-pack" },
      { name: "Hand sanitizer (gallons)", asin: "B07DKTZFSF", qty: "2" },
      { name: "Wet wipes / body wipes (unscented)", asin: "B07DZNTX38", qty: "4 packs" },
      { name: "N95 masks", asin: "B08Q7BRJZ9", qty: "20" },
      { name: "Soap (bar, castile)", asin: "B00PKHY1VS", qty: "6 bars" },
      { name: "Feminine hygiene supplies", href: "#", qty: "as needed" },
      { name: "Diapers / pull-ups (if applicable)", href: "#", qty: "1 week supply" },
    ],
  },
  {
    icon: "🧒",
    title: "Kids-Specific",
    items: [
      { name: "Kids' activity kit (coloring, cards, small games)", href: "#", qty: "1 per child" },
      { name: "Comfort item (stuffed animal, familiar blanket)", href: "#", note: "Critical for stress management", qty: "per child" },
      { name: "Pediatric OTC meds (fever reducer, antihistamine)", href: "#", qty: "full bottles" },
      { name: "Spare kids' clothing (2 changes per child)", href: "#", qty: "per child" },
    ],
  },
  {
    icon: "🔧",
    title: "Tools & Miscellaneous",
    items: [
      { name: "Multi-tool (Leatherman Wave+)", asin: "B0002H49BC", qty: "2" },
      { name: "Fixed blade knife (Mora Companion HD)", asin: "B009NZVZ3E", qty: "1/adult" },
      { name: "Duct tape (heavy-duty, 3-pack)", asin: "B00004Z46U", qty: "1" },
      { name: "Work gloves (heavy leather)", asin: "B07ZL8FH5H", qty: "per adult" },
      { name: "Lighter + waterproof matches + fire striker", asin: "B01KZK2CWK", qty: "multiple" },
      { name: "Whistle (Fox 40 pealess)", asin: "B000L3A89E", qty: "1/person" },
      { name: "Crowbar / pry bar (18\")", asin: "B08CWMJXFZ", qty: "1" },
    ],
  },
];

export default function FamilyKit() {
  useSEO({
    title: "72-Hour Family Emergency Kit Checklist",
    description: "The complete 72-hour emergency kit checklist for a family of 4-5. Water, food, first aid, comms, and more — field-tested and updated for 2026.",
  });

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Document wrapper */}
        <div className="bg-white text-gray-900 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">

          {/* Header */}
          <div className="bg-orange-600 px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <img src="/favicon.png" alt="Prepper Evolution" className="w-8 h-8 opacity-90" />
              <span className="text-sm font-semibold uppercase tracking-widest opacity-80">Prepper Evolution</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-3">
              The 72-Hour Family Emergency Kit Checklist
            </h1>
            <p className="text-orange-100 text-base">
              Built for a family of 4–5. Three days of water, food, shelter, and comms — no guessing, no gaps.
            </p>
          </div>

          {/* Affiliate notice */}
          <div className="bg-orange-50 border-b border-orange-100 px-8 py-3">
            <p className="text-xs text-orange-700">
              <strong>Affiliate disclosure:</strong> Links marked with Amazon go to products I've personally vetted.
              As an Amazon Associate I earn a small commission at no extra cost to you. Prices change — always verify before buying.
            </p>
          </div>

          {/* Print button */}
          <div className="px-8 pt-6 pb-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 rounded-lg px-4 py-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print this checklist
            </button>
          </div>

          {/* Categories */}
          <div className="px-8 py-6 space-y-10">
            {categories.map((cat) => (
              <section key={cat.title}>
                <h2 className="flex items-center gap-2 text-xl font-black text-gray-900 border-b-2 border-orange-500 pb-2 mb-4">
                  <span>{cat.icon}</span>
                  <span>{cat.title}</span>
                </h2>
                <ul className="space-y-2">
                  {cat.items.map((item) => {
                    const href = item.asin ? AMAZON(item.asin) : (item.href ?? "#");
                    const isAmazon = !!item.asin;
                    return (
                      <li key={item.name} className="flex items-start gap-3">
                        <CheckSquare className="w-5 h-5 mt-0.5 text-orange-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-2">
                            {href && href !== "#" ? (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
                              >
                                {item.name}
                              </a>
                            ) : (
                              <span className="font-medium text-gray-800">{item.name}</span>
                            )}
                            {item.qty && (
                              <span className="text-xs text-gray-400 font-mono">× {item.qty}</span>
                            )}
                            {isAmazon && (
                              <span className="text-xs bg-orange-50 text-orange-500 border border-orange-200 rounded px-1.5 py-0.5 print:hidden">Amazon</span>
                            )}
                          </div>
                          {item.note && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">{item.note}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-6 mt-4">
            <p className="text-sm text-gray-500 mb-2">
              <strong className="text-gray-700">Pro tip:</strong> Pack in clearly labeled plastic tubs by category — not in one big duffel bag.
              When you need something at 2am in the dark, you'll thank yourself.
            </p>
            <p className="text-xs text-gray-400 mt-3">
              © {new Date().getFullYear()} Prepper Evolution · prepperevolution.com · Updated 2026
            </p>
          </div>
        </div>

      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
