import { useSEO } from "@/hooks/useSEO";
import { Printer, TrendingDown, TrendingUp, Minus } from "lucide-react";

const AMAZON = (asin: string) => `https://www.amazon.com/dp/${asin}?tag=prepperevo-20`;

const weightRules = [
  { weight: "120–140 lbs", max: "24–28 lbs", target: "18–22 lbs", note: "Women / smaller builds — ruthlessly cut luxuries" },
  { weight: "140–160 lbs", max: "28–32 lbs", target: "22–26 lbs", note: "Average build — standard load" },
  { weight: "160–180 lbs", max: "32–36 lbs", target: "26–30 lbs", note: "Most men — comfortable range" },
  { weight: "180–200 lbs", max: "36–40 lbs", target: "30–34 lbs", note: "Bigger/stronger — still keep below 40 lbs" },
  { weight: "200+ lbs", max: "40–45 lbs", target: "32–38 lbs", note: "Hard ceiling — fatigue kills pace after mile 5" },
];

const categories = [
  {
    name: "Water & Hydration",
    targetWeight: "2–4 lbs",
    icon: "💧",
    notes: "Don't carry 3 days of water. Carry filtration. Water = 8.3 lbs/gallon.",
    items: [
      { item: "Sawyer Squeeze filter", lbs: "0.2 lbs", type: "light", asin: "B00B1OSU4W" },
      { item: "2L Platypus or Nalgene bottle", lbs: "0.3–0.5 lbs", type: "light" },
      { item: "Water purification tablets (backup)", lbs: "0.1 lbs", type: "light" },
      { item: "1-gallon water carry capacity", lbs: "8.3 lbs (full)", type: "heavy", note: "Carry 1–2L max, filter as you go" },
    ],
  },
  {
    name: "Food (72-Hour Supply)",
    targetWeight: "3–5 lbs",
    icon: "🥫",
    notes: "2,000 cal/day per adult. Choose calorie-dense, lightweight options.",
    items: [
      { item: "Mountain House freeze-dried meals (2 per day)", lbs: "4–6 oz each", type: "light", asin: "B09M7K6VXP" },
      { item: "Cliff Bars / high-calorie bars", lbs: "2.4 oz each", type: "light", asin: "B008RXJWIA" },
      { item: "Peanut butter packets", lbs: "1.1 oz each", type: "light" },
      { item: "Canned food (big mistake)", lbs: "1–2 lbs each", type: "heavy", note: "Add weight fast, leave the cans behind" },
    ],
  },
  {
    name: "Shelter & Sleep",
    targetWeight: "3–5 lbs",
    icon: "🏕️",
    notes: "Where most bags blow up. A sleeping bag alone can be 5 lbs if you pick wrong.",
    items: [
      { item: "Bivy sack (emergency reflective)", lbs: "0.5 lbs", type: "light", asin: "B003GZU26Q" },
      { item: "Lightweight tarp (silnylon)", lbs: "0.8–1.2 lbs", type: "light", asin: "B08KC5SZJN" },
      { item: "Hammock (ultralight, 650 ft paracord)", lbs: "1.5 lbs", type: "medium" },
      { item: "Mummy sleeping bag (rated 30°F, synthetic)", lbs: "2–3 lbs", type: "medium", asin: "B088TFLG2M" },
      { item: "3-season tent (2-person)", lbs: "5–7 lbs", type: "heavy", note: "Great comfort, brutal weight penalty" },
      { item: "Wool blanket", lbs: "3–5 lbs", type: "heavy", note: "Durable but kill your weight budget" },
    ],
  },
  {
    name: "Fire & Light",
    targetWeight: "0.5–1 lb",
    icon: "🔦",
    notes: "Fire = warmth + water purification + morale. Never skip this category.",
    items: [
      { item: "BIC lighters (3 pack)", lbs: "0.2 lbs", type: "light" },
      { item: "Waterproof matches", lbs: "0.1 lbs", type: "light" },
      { item: "Ferro rod + striker", lbs: "0.1–0.2 lbs", type: "light", asin: "B01KZK2CWK" },
      { item: "Petzl TIKKA headlamp", lbs: "0.1 lbs", type: "light", asin: "B08CL6YNYH" },
      { item: "Spare AA batteries (4-pack)", lbs: "0.3 lbs", type: "light" },
    ],
  },
  {
    name: "First Aid",
    targetWeight: "1–2 lbs",
    icon: "🩺",
    notes: "Build your own — store-bought kits are 70% filler. Strip to the essentials.",
    items: [
      { item: "Israeli bandage (2-pack)", lbs: "0.4 lbs", type: "light", asin: "B001QXYGKY" },
      { item: "CAT tourniquet", lbs: "0.2 lbs", type: "light", asin: "B00CFGWRWU" },
      { item: "QuikClot gauze", lbs: "0.3 lbs", type: "light", asin: "B002SM7TNM" },
      { item: "Personal meds + OTC pack", lbs: "0.3–0.5 lbs", type: "light" },
      { item: "Full trauma kit (200-piece)", lbs: "2.5 lbs", type: "heavy", note: "Great for base camp, heavy for movement" },
    ],
  },
  {
    name: "Clothing",
    targetWeight: "3–4 lbs",
    icon: "👕",
    notes: "Layers beat bulk. Wool and synthetic. Skip cotton — 'cotton kills' is real.",
    items: [
      { item: "Base layer (wool or synthetic)", lbs: "0.5–0.8 lbs", type: "light" },
      { item: "Softshell jacket", lbs: "1 lb", type: "light" },
      { item: "Rain poncho", lbs: "0.5 lbs", type: "light", asin: "B003HTYQTM" },
      { item: "Gloves + wool beanie", lbs: "0.3 lbs", type: "light" },
      { item: "Spare socks (2 pairs merino wool)", lbs: "0.5 lbs", type: "light" },
      { item: "Full change of clothes (jeans + hoodie)", lbs: "3–4 lbs", type: "heavy", note: "Cut to just base layer + midlayer" },
    ],
  },
  {
    name: "Navigation & Communications",
    targetWeight: "0.5–1 lb",
    icon: "📡",
    notes: "Your phone is not your nav plan. GPS fails. Batteries die. Paper doesn't.",
    items: [
      { item: "Paper maps (laminated) + compass", lbs: "0.3 lbs", type: "light" },
      { item: "Garmin inReach Mini", lbs: "0.2 lbs", type: "light", asin: "B0G4RST8LV" },
      { item: "Baofeng UV-5R ham radio", lbs: "0.5 lbs", type: "light", asin: "B074XPB313" },
      { item: "Midland GXT1000 GMRS (pair)", lbs: "0.8 lbs", type: "light", asin: "B001WMFYH4" },
    ],
  },
  {
    name: "Tools & Self-Defense",
    targetWeight: "2–3 lbs",
    icon: "🔧",
    notes: "One good knife beats a tool kit. Redundancy only where it matters.",
    items: [
      { item: "ESEE-4 fixed blade knife", lbs: "0.5 lbs", type: "light", asin: "B07F3FKP3C" },
      { item: "Benchmade Bugout folder (EDC)", lbs: "0.1 lbs", type: "light", asin: "B0BW9WJTDR" },
      { item: "Leatherman Wave+ multi-tool", lbs: "0.5 lbs", type: "light", asin: "B0002H49BC" },
      { item: "Paracord 100 ft", lbs: "0.5 lbs", type: "light" },
      { item: "Machete / hatchet", lbs: "1.5–2 lbs", type: "medium", note: "Worth it in dense terrain" },
    ],
  },
  {
    name: "The Bag Itself",
    targetWeight: "3–5 lbs (empty)",
    icon: "🎒",
    notes: "The bag is dead weight. Every pound you save here = one more pound of food or water.",
    items: [
      { item: "5.11 RUSH72 (55L, empty 4.2 lbs)", lbs: "4.2 lbs", type: "medium", asin: "B0D9R239MT" },
      { item: "MOLLE II Military Surplus Rucksack", lbs: "3.3 lbs", type: "medium", asin: "B09H71PN7H" },
      { item: "Mystery Ranch 3-Day Assault (32L)", lbs: "3 lbs", type: "medium" },
      { item: "Osprey Farpoint 55 travel pack", lbs: "3.5 lbs", type: "medium", note: "Less MOLLE but comfortable for civilians" },
    ],
  },
];

const mistakes = [
  { mistake: "Carrying 3 days of water (22+ lbs)", fix: "Carry 1–2L. Pack filtration (Sawyer = 2 oz). Water is EVERYWHERE in nature." },
  { mistake: "Canned food", fix: "Freeze-dried and bars only. Cans are 70% container weight." },
  { mistake: "Full-size sleeping bag rated to 0°F", fix: "Get a 30°F synthetic bag (2–3 lbs) + emergency bivy. Enough for most scenarios." },
  { mistake: "\"Just in case\" tools you've never used", fix: "If you can't use it in the dark, under stress, leave it home." },
  { mistake: "Duplicate items (3 headlamps, 4 knives)", fix: "One primary, one backup. That's the rule." },
  { mistake: "A bag that was never worn for more than 10 minutes", fix: "Strap it on and walk 3 miles. You'll know immediately what to cut." },
];

export default function BobWeightGuide() {
  useSEO({
    title: "Bug Out Bag Weight Guide",
    description: "How much should your bug out bag weigh? Category-by-category breakdown, weight targets by body weight, and the most common mistakes that add 10+ lbs of dead weight.",
  });

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Document wrapper */}
        <div className="bg-white text-gray-900 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">

          {/* Header */}
          <div className="bg-gray-900 px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <img src="/favicon.png" alt="Prepper Evolution" className="w-8 h-8 opacity-90" />
              <span className="text-sm font-semibold uppercase tracking-widest opacity-60">Prepper Evolution</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-3">
              Bug Out Bag Weight Guide
            </h1>
            <p className="text-gray-400 text-base">
              How heavy is too heavy? Category-by-category targets, common dead weight mistakes, and lightweight swaps that don't compromise your capability.
            </p>
          </div>

          {/* Affiliate notice */}
          <div className="bg-gray-50 border-b border-gray-200 px-8 py-3">
            <p className="text-xs text-gray-500">
              <strong>Affiliate disclosure:</strong> Amazon links use my affiliate tag at no extra cost to you. Weights are approximate and vary by size/option.
            </p>
          </div>

          {/* Print button */}
          <div className="px-8 pt-6 pb-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print this guide
            </button>
          </div>

          <div className="px-8 py-6 space-y-10">

            {/* Weight rule */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 mb-2">The 20% Rule</h2>
              <p className="text-gray-600 mb-4">
                Your loaded bag should weigh no more than <strong>20% of your body weight</strong> for a 72-hour carry.
                Elite infantry carry 30–40% — but they train daily and rotate packs. For civilians, 20% is the hard ceiling.
                Target <strong>15% for sustainable long-distance movement</strong>.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-2 px-3 font-bold text-gray-700 border border-gray-200">Body Weight</th>
                      <th className="text-left py-2 px-3 font-bold text-gray-700 border border-gray-200">Max Load (20%)</th>
                      <th className="text-left py-2 px-3 font-bold text-gray-700 border border-gray-200">Target Load (15%)</th>
                      <th className="text-left py-2 px-3 font-bold text-gray-700 border border-gray-200 hidden sm:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightRules.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="py-2 px-3 font-medium border border-gray-200">{row.weight}</td>
                        <td className="py-2 px-3 text-red-600 font-bold border border-gray-200">{row.max}</td>
                        <td className="py-2 px-3 text-green-700 font-bold border border-gray-200">{row.target}</td>
                        <td className="py-2 px-3 text-gray-500 text-xs border border-gray-200 hidden sm:table-cell">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Category breakdowns */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 mb-4">Category Weight Targets</h2>
              <div className="space-y-8">
                {categories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </h3>
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Target: {cat.targetWeight}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 italic mb-3">{cat.notes}</p>
                    <ul className="space-y-1.5">
                      {cat.items.map((item) => {
                        const href = item.asin ? AMAZON(item.asin) : undefined;
                        const icon = item.type === "light"
                          ? <TrendingDown className="w-4 h-4 text-green-500 flex-shrink-0" />
                          : item.type === "heavy"
                          ? <TrendingUp className="w-4 h-4 text-red-400 flex-shrink-0" />
                          : <Minus className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
                        return (
                          <li key={item.item} className="flex items-start gap-2.5 text-sm">
                            {icon}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-baseline gap-2">
                                {href ? (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-700 hover:underline"
                                  >
                                    {item.item}
                                  </a>
                                ) : (
                                  <span className="font-medium text-gray-800">{item.item}</span>
                                )}
                                <span className="text-xs text-gray-400 font-mono">{item.lbs}</span>
                              </div>
                              {item.note && (
                                <p className="text-xs text-gray-400 italic">{item.note}</p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-2 text-xs text-gray-400 flex gap-4">
                      <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3 text-green-500" /> Lightweight choice</span>
                      <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-yellow-500" /> Medium weight</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-red-400" /> Heavy — consider alternatives</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Common mistakes */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 mb-4">6 Mistakes That Add 10+ lbs</h2>
              <div className="space-y-3">
                {mistakes.map((m, i) => (
                  <div key={i} className="border-l-4 border-red-400 pl-4 py-1">
                    <p className="font-bold text-red-700 text-sm">{m.mistake}</p>
                    <p className="text-gray-600 text-sm mt-0.5">{m.fix}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick total */}
            <section className="bg-gray-900 text-white rounded-xl p-6">
              <h2 className="text-xl font-black mb-3">Quick Reference: Target Total by Category</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Bag (empty)", "3–4 lbs"],
                  ["Water + filter", "1.5–2 lbs"],
                  ["Food (72 hrs)", "3–4 lbs"],
                  ["Shelter + sleep", "2–4 lbs"],
                  ["Clothing", "2–3 lbs"],
                  ["First aid", "1–1.5 lbs"],
                  ["Fire + light", "0.5 lbs"],
                  ["Nav + comms", "0.5–1 lb"],
                  ["Tools", "1.5–2 lbs"],
                  ["Documents + misc", "0.5 lbs"],
                ].map(([cat, weight]) => (
                  <div key={cat} className="flex justify-between border-b border-gray-700 pb-1">
                    <span className="text-gray-300">{cat}</span>
                    <span className="text-green-400 font-mono font-bold">{weight}</span>
                  </div>
                ))}
                <div className="col-span-2 flex justify-between pt-2 text-base">
                  <span className="font-black">Total target</span>
                  <span className="text-green-400 font-black font-mono">16–26 lbs</span>
                </div>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-6">
            <p className="text-sm text-gray-500">
              <strong className="text-gray-700">Final thought:</strong> The bag you'll actually grab and run with is better than the perfectly loaded bag you left because it was too heavy.
              Build for real scenarios, not YouTube worst-case fantasies.
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
