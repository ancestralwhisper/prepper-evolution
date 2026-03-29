// ─── Programmatic Answer Pages ────────────────────────────────────────────────
// Hub page at /tools/answers
// Pre-computed answers from calculator logic targeting long-tail search queries.

import { Link } from "wouter";
import { Droplets, UtensilsCrossed, Zap, Backpack, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface AnswerRow {
  label: string;
  value: string;
}

interface AnswerEntry {
  id: string;
  question: string;
  answer: string; // short direct answer
  detail: string;
  rows?: AnswerRow[];
  note?: string;
  cta: { label: string; href: string };
  icon: React.ElementType;
  iconColor: string;
}

const ANSWERS: AnswerEntry[] = [
  // ─── Water ───────────────────────────────────────────────────────
  {
    id: "water-family-4-2-weeks",
    question: "How much water does a family of 4 need for 2 weeks?",
    answer: "56 gallons minimum. Realistically, 112 gallons.",
    detail: "FEMA's 1 gallon/person/day keeps you alive. At 2 gallons/person/day — which covers drinking, cooking, and basic hygiene — a family of 4 needs 8 gallons/day. Over 14 days that's 112 gallons.",
    rows: [
      { label: "FEMA minimum (1 gal/person/day)", value: "56 gallons" },
      { label: "Realistic use (2 gal/person/day)", value: "112 gallons" },
      { label: "Storage: 55-gal drums needed", value: "1–2 drums" },
      { label: "Cost (55-gal food-grade drum)", value: "~$40–60 each" },
    ],
    note: "Two 55-gallon drums is the standard setup. Fills in 20 minutes from a garden hose.",
    cta: { label: "Calculate your exact water needs", href: "/tools/water-storage-calculator" },
    icon: Droplets,
    iconColor: "text-blue-500",
  },
  {
    id: "water-family-4-1-month",
    question: "How much water does a family of 4 need for 1 month?",
    answer: "120–240 gallons depending on daily use.",
    detail: "One month at 2 gal/person/day for 4 people = 240 gallons. That's 4–5 55-gallon drums, or a 250-gallon IBC tote.",
    rows: [
      { label: "1 month at FEMA minimum", value: "120 gallons" },
      { label: "1 month at realistic use", value: "240 gallons" },
      { label: "Storage option 1", value: "4–5 × 55-gal drums" },
      { label: "Storage option 2", value: "1 × 250-gal IBC tote" },
    ],
    note: "IBC totes run $80–200 used from Craigslist. Get food-grade only (previously held food or water).",
    cta: { label: "Calculate by household size and duration", href: "/tools/water-storage-calculator" },
    icon: Droplets,
    iconColor: "text-blue-500",
  },
  {
    id: "water-apartment-2-weeks",
    question: "How much water should an apartment dweller store for 2 weeks?",
    answer: "20–30 gallons in stackable jugs + a WaterBOB for the tub.",
    detail: "You can't fit a 55-gallon drum in most apartments. The practical approach: 4–6 stackable 5-gallon jugs (20–30 gallons), plus a WaterBOB bathtub bladder you fill when a storm warning hits. That bathtub holds 100 gallons on its own.",
    rows: [
      { label: "Under-sink 5-gal jugs (4–6)", value: "20–30 gallons" },
      { label: "WaterBOB tub bladder (fill on warning)", value: "Up to 100 gallons" },
      { label: "Sawyer Squeeze filter (portable)", value: "Extends any water source" },
    ],
    note: "Fill the WaterBOB before a storm, not during. Once the water pressure drops, that option is gone.",
    cta: { label: "Apartment-adjusted water calculator", href: "/tools/water-storage-calculator" },
    icon: Droplets,
    iconColor: "text-blue-500",
  },
  // ─── Food ────────────────────────────────────────────────────────
  {
    id: "food-family-4-3-months",
    question: "How much food does a family of 4 need for 3 months?",
    answer: "About 720,000 calories — around 420 lbs of mixed shelf-stable food.",
    detail: "At 2,000 calories/person/day, a family of 4 needs 8,000 cal/day, or 720,000 calories for 90 days. The most efficient way to store that many calories is bulk rice, beans, oats, and pasta — the staples that run 1,500–3,400 calories per pound.",
    rows: [
      { label: "Total calories needed", value: "720,000 cal" },
      { label: "White rice (3,400 cal/lb)", value: "~200 lbs (~$140)" },
      { label: "Pinto beans (1,500 cal/lb)", value: "~60 lbs (~$48)" },
      { label: "Rolled oats (1,750 cal/lb)", value: "~40 lbs (~$40)" },
      { label: "Pasta (1,700 cal/lb)", value: "~40 lbs (~$50)" },
      { label: "Supplemental (PB, canned, freeze-dried)", value: "~80 lbs (~$300)" },
      { label: "Total estimated cost", value: "~$580–800" },
    ],
    note: "Rice and beans are the backbone. Freeze-dried meals are for variety and morale, not your calorie base.",
    cta: { label: "Get your exact food storage breakdown", href: "/tools/food-storage-calculator" },
    icon: UtensilsCrossed,
    iconColor: "text-amber-500",
  },
  {
    id: "food-1-person-1-year",
    question: "How much food does 1 person need for 1 year?",
    answer: "About 730,000 calories — 400–450 lbs of mixed shelf-stable food.",
    detail: "One year at 2,000 cal/day = 730,000 calories. The LDS Church has been doing this calculation for decades — their one-year supply for one adult runs 400 lbs of core staples plus supplemental items.",
    rows: [
      { label: "Total calories (365 days × 2,000)", value: "730,000 cal" },
      { label: "White rice", value: "300 lbs" },
      { label: "Wheat/flour", value: "100 lbs" },
      { label: "Legumes (beans, lentils)", value: "60 lbs" },
      { label: "Oats", value: "40 lbs" },
      { label: "Sugar, salt, oil, spices", value: "30 lbs" },
      { label: "Estimated cost", value: "$600–900 total" },
    ],
    note: "Store in sealed Mylar bags with oxygen absorbers inside 5-gallon buckets. White rice keeps 25–30 years this way.",
    cta: { label: "Build your 1-year food plan", href: "/tools/food-storage-calculator" },
    icon: UtensilsCrossed,
    iconColor: "text-amber-500",
  },
  {
    id: "food-family-2-72-hours",
    question: "How much food does a family of 2 need for 72 hours?",
    answer: "12,000 calories — about 6–8 lbs of food.",
    detail: "72 hours at 2,000 cal/person/day for 2 people = 12,000 calories. At roughly 1,500–2,000 cal/lb for dense foods, that's 6–8 lbs. Prioritize no-cook or just-add-water options.",
    rows: [
      { label: "Mountain House Pro-Pack (2 pouches)", value: "~1,600 cal, 0.8 lbs" },
      { label: "Datrex 3600 cal bar", value: "3,600 cal, 1.1 lbs" },
      { label: "Clif bars (12 count)", value: "~3,600 cal, 1.5 lbs" },
      { label: "Peanut butter (18 oz jar)", value: "~2,800 cal, 1.1 lbs" },
      { label: "Jerky + trail mix (1 lb each)", value: "~4,000 cal, 2 lbs" },
    ],
    note: "Mix Mountain House pouches (morale) with Datrex bars (pure calories) for a balanced 72-hour kit.",
    cta: { label: "72-hour kit builder", href: "/tools/72-hour-kit-builder" },
    icon: UtensilsCrossed,
    iconColor: "text-amber-500",
  },
  // ─── Solar ───────────────────────────────────────────────────────
  {
    id: "solar-panels-apartment",
    question: "How many solar panels do I need for an apartment?",
    answer: "1–2 panels (100–200W total). A balcony setup maxes at about 200W.",
    detail: "Apartment solar is constrained by space and HOA rules, not energy demand. A single 100W panel paired with a 500Wh battery station covers phone charging, a laptop, and LED lights through a multi-day outage. Two 100W panels doubles your daily recharge.",
    rows: [
      { label: "Phone + laptop + lights (daily)", value: "~200–350Wh/day" },
      { label: "Panel needed", value: "100–200W" },
      { label: "Battery recommendation", value: "500–800Wh station" },
      { label: "EcoFlow River 2 Pro (768Wh)", value: "~$300 — ideal pairing" },
      { label: "Jackery Explorer 500 (518Wh)", value: "~$249 — budget option" },
    ],
    note: "Balcony panels need to be angled toward south (north hemisphere). Even partial shade kills output significantly.",
    cta: { label: "Calculate your apartment solar needs", href: "/tools/solar-power-calculator" },
    icon: Zap,
    iconColor: "text-yellow-500",
  },
  {
    id: "solar-panels-house-critical-loads",
    question: "How many solar panels do I need to run a house during an outage?",
    answer: "400–600W of panels paired with 2,000–4,000Wh of battery storage.",
    detail: "Running critical loads only (fridge, lights, phone, internet router, a few fans) draws 800–1,400Wh/day. At 5 peak sun hours, you need 200–300W of panels just to break even. Add 25% buffer for efficiency losses and you're at 300–400W minimum. 600W gives you real margin.",
    rows: [
      { label: "12V fridge (24 hrs)", value: "~500Wh/day" },
      { label: "Lights × 4 (8 hrs)", value: "~80Wh/day" },
      { label: "Phones × 4, router, laptop", value: "~250Wh/day" },
      { label: "Total daily critical loads", value: "~830Wh/day" },
      { label: "Panels needed (5 sun hrs + buffer)", value: "300–400W" },
      { label: "Battery for 2-day backup", value: "1,600–2,000Wh" },
    ],
    note: "The EcoFlow DELTA Pro (3,600Wh expandable) or Bluetti AC200P (2,000Wh) are the two most popular whole-home backup options.",
    cta: { label: "Size your home solar backup", href: "/tools/solar-power-calculator" },
    icon: Zap,
    iconColor: "text-yellow-500",
  },
  {
    id: "solar-panels-overlanding",
    question: "How many solar panels do I need for overlanding?",
    answer: "200–400W — two 100W portable panels or one 200W rigid panel.",
    detail: "An overlanding setup running a 12V fridge, phones, lights, and a laptop draws 600–900Wh/day. At 5 peak sun hours on the road, 200W of panels generates about 700Wh/day — enough to roughly break even. 400W gives you headroom to charge a large battery bank (100Ah LiFePO4) in a partial travel day.",
    rows: [
      { label: "12V fridge (24 hrs)", value: "~480Wh/day" },
      { label: "Phones × 2, lights, laptop", value: "~200Wh/day" },
      { label: "Total daily draw", value: "~680Wh/day" },
      { label: "200W panel output (5 hrs)", value: "~700Wh — break-even" },
      { label: "400W panel output (5 hrs)", value: "~1,400Wh — recharges 100Ah LiFePO4" },
    ],
    note: "Renogy 200W rigid panels are the most popular choice. EcoFlow's portable 220W panels fold for truck bed or roof storage.",
    cta: { label: "Size your vehicle solar setup", href: "/tools/solar-power-calculator" },
    icon: Zap,
    iconColor: "text-yellow-500",
  },
  // ─── Bug Out Bag ─────────────────────────────────────────────────
  {
    id: "bug-out-bag-weight-150lbs",
    question: "How heavy should a bug out bag be for a 150 lb person?",
    answer: "22–30 lbs maximum. 20–25% of body weight is the functional limit.",
    detail: "At 150 lbs body weight, 20% is 30 lbs. That's the absolute ceiling for someone who needs to move quickly over distance. Aim for 22–25 lbs as a comfortable operational load. Beyond 30 lbs you're slowing down and wearing out your joints.",
    rows: [
      { label: "20% body weight (max)", value: "30 lbs" },
      { label: "15% body weight (optimal)", value: "22.5 lbs" },
      { label: "Pack (empty)", value: "3–4 lbs" },
      { label: "Water (2L)", value: "4.4 lbs" },
      { label: "Food (3 days)", value: "4–6 lbs" },
      { label: "Shelter, sleeping, fire, first aid, tools", value: "8–12 lbs" },
      { label: "Clothing + misc", value: "3–5 lbs" },
    ],
    note: "Weigh your current pack empty before you add anything. Most packs are 4–6 lbs before a single item goes in.",
    cta: { label: "Build your bag and track weight", href: "/tools/bug-out-bag-calculator" },
    icon: Backpack,
    iconColor: "text-emerald-500",
  },
  {
    id: "bug-out-bag-weight-200lbs",
    question: "How heavy should a bug out bag be for a 200 lb person?",
    answer: "30–40 lbs maximum. Stay under 40 lbs for sustained movement.",
    detail: "At 200 lbs body weight, 20% is 40 lbs. That's the ceiling — achievable, but you'll feel it after 5+ miles, especially under stress or in heat. A 30–35 lb loaded pack is the sweet spot: enough gear, still mobile.",
    rows: [
      { label: "20% body weight (max)", value: "40 lbs" },
      { label: "15% body weight (optimal)", value: "30 lbs" },
      { label: "Pack (empty)", value: "3–5 lbs" },
      { label: "Water (3L)", value: "6.6 lbs" },
      { label: "Food (3 days)", value: "5–7 lbs" },
      { label: "Shelter, fire, first aid, tools", value: "10–14 lbs" },
      { label: "Clothing + misc", value: "4–6 lbs" },
    ],
    note: "Heavier body weight doesn't mean a heavier pack is fine — muscular vs. metabolic load matters. If you're not regularly carrying a loaded pack, start training now.",
    cta: { label: "Track your pack weight", href: "/tools/bug-out-bag-calculator" },
    icon: Backpack,
    iconColor: "text-emerald-500",
  },
  {
    id: "bug-out-bag-essentials",
    question: "What are the essential items in a bug out bag?",
    answer: "10 categories: water, food, shelter, fire, navigation, first aid, tools, comms, documents, clothing.",
    detail: "Strip a bug out bag to its function: keep a person alive for 72 hours while mobile. Every item should serve that function. Anything that doesn't directly support water, food, shelter, warmth, navigation, medical, or communication can be cut.",
    rows: [
      { label: "Water", value: "2L carry + filter + tablets" },
      { label: "Food", value: "3 days, 1,800–2,500 cal/day" },
      { label: "Shelter", value: "Emergency bivy + packable tarp" },
      { label: "Fire", value: "2 lighters + ferro rod + tinder" },
      { label: "Navigation", value: "Paper maps + compass" },
      { label: "First Aid", value: "CAT tourniquet + wound care + personal meds" },
      { label: "Tools", value: "Fixed blade + multi-tool + headlamp" },
      { label: "Comms", value: "GMRS radio + power bank" },
      { label: "Documents", value: "IDs + cash + USB backup" },
      { label: "Clothing", value: "Rain layer + warmth layer + extra socks" },
    ],
    note: "The Mora Companion HD ($20) and a BIC lighter do 80% of what $400 in premium gear does. Reliability > brand.",
    cta: { label: "Build your full BOB checklist", href: "/tools/bug-out-bag-calculator" },
    icon: Backpack,
    iconColor: "text-emerald-500",
  },
];

// ─── Group by calculator ──────────────────────────────────────────────────────

const GROUPS = [
  { id: "water",  label: "Water Storage",   icon: Droplets,       color: "text-blue-500",    borderColor: "border-blue-500/30" },
  { id: "food",   label: "Food Storage",    icon: UtensilsCrossed, color: "text-amber-500",   borderColor: "border-amber-500/30" },
  { id: "solar",  label: "Solar Power",     icon: Zap,             color: "text-yellow-500",  borderColor: "border-yellow-500/30" },
  { id: "bob",    label: "Bug Out Bags",    icon: Backpack,        color: "text-emerald-500", borderColor: "border-emerald-500/30" },
];

const ICON_MAP: Record<string, React.ElementType> = {
  water:   Droplets,
  food:    UtensilsCrossed,
  solar:   Zap,
  bob:     Backpack,
};

function categoryOf(id: string): string {
  if (id.startsWith("water")) return "water";
  if (id.startsWith("food")) return "food";
  if (id.startsWith("solar")) return "solar";
  return "bob";
}

// ─── Answer Card ──────────────────────────────────────────────────────────────

function AnswerCard({ entry }: { entry: AnswerEntry }) {
  const [open, setOpen] = useState(false);
  const Icon = entry.icon;

  return (
    <div id={entry.id} className="border border-border rounded-xl overflow-hidden scroll-mt-20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${entry.iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{entry.question}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{entry.answer}</p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        )}
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/10">
          <p className="text-sm text-muted-foreground leading-relaxed">{entry.detail}</p>

          {entry.rows && entry.rows.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  {entry.rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                      <td className="px-3 py-1.5 text-muted-foreground">{row.label}</td>
                      <td className="px-3 py-1.5 font-semibold text-right">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {entry.note && (
            <p className="text-xs text-primary border-l-2 border-primary/40 pl-3 leading-relaxed">
              {entry.note}
            </p>
          )}

          <Link href={entry.cta.href}>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer">
              {entry.cta.label}
              <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProgrammaticAnswers() {
  useSEO({
    title: "Prep Calculator Answers: Water, Food, Solar, Bug Out Bags | Prepper Evolution",
    description:
      "Fast answers to common prep questions — how much water for a family of 4, how many solar panels for a house, how heavy a bug out bag should be, and more. All backed by calculator math.",
  });

  return (
    <div className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="max-w-2xl mb-10">
          <p className="text-primary text-sm font-bold uppercase tracking-wide mb-2">Prep Calculators</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Common Prep Questions,{" "}
            <span className="text-primary">Answered with Real Numbers</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            These are pre-computed answers from the same math our calculators use. For your specific household size, location, and situation — use the full calculator linked in each answer.
          </p>
        </div>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GROUPS.map((g) => {
            const Icon = g.icon;
            return (
              <a
                key={g.id}
                href={`#${g.id}`}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${g.borderColor} hover:bg-muted/40 transition-colors`}
              >
                <Icon className={`w-3 h-3 ${g.color}`} />
                {g.label}
              </a>
            );
          })}
        </div>

        {/* Answers grouped by category */}
        {GROUPS.map((g) => {
          const entries = ANSWERS.filter((a) => categoryOf(a.id) === g.id);
          const Icon = g.icon;
          return (
            <section key={g.id} id={g.id} className="mb-10 scroll-mt-20">
              <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-5 h-5 ${g.color}`} />
                <h2 className="text-lg font-bold">{g.label}</h2>
              </div>
              <div className="space-y-2">
                {entries.map((entry) => (
                  <AnswerCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Footer CTA */}
        <div className="mt-10 p-5 rounded-xl bg-muted/30 border border-border text-center space-y-3">
          <p className="text-sm font-semibold">Need numbers specific to your household?</p>
          <p className="text-xs text-muted-foreground">
            The calculators above take your exact household size, location, and living situation to give you precise targets instead of general ranges.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Water Calculator", href: "/tools/water-storage-calculator" },
              { label: "Food Calculator", href: "/tools/food-storage-calculator" },
              { label: "Solar Calculator", href: "/tools/solar-power-calculator" },
              { label: "Bug Out Bag", href: "/tools/bug-out-bag-calculator" },
            ].map(({ label, href }) => (
              <Link key={href} href={href}>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                  {label}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
