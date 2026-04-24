// ─── Quiz Data: "What's Your Survival Score?" ──────────────────────────────

export interface QuizAnswer {
  text: string;
  score: number;
  feedback: string;
}

export interface QuizQuestion {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answers: QuizAnswer[];
}

export interface AffiliateProduct {
  name: string;
  url: string;
  reason: string;
}

export interface ScoreRange {
  min: number;
  max: number;
  title: string;
  description: string;
  color: string;
  icon: "AlertTriangle" | "Flame" | "Shield" | "Trophy";
  recommendations: string[];
  products: AffiliateProduct[];
}

// ─── Questions ──────────────────────────────────────────────────────────────

export const questions: QuizQuestion[] = [
  {
    id: "bob",
    category: "gear",
    categoryLabel: "Bug Out Bag",
    question: "Do you have a Bug Out Bag packed and ready?",
    answers: [
      { text: "No", score: 0, feedback: "A BOB is your grab-and-go lifeline. Start with a basic 72-hour kit." },
      { text: "Started but incomplete", score: 3, feedback: "You have the right idea. Use a checklist to fill the gaps." },
      { text: "Yes, basic kit", score: 7, feedback: "Solid start. Now test it — take it on a hike and see what you actually need." },
      { text: "Yes, fully loaded + tested", score: 10, feedback: "Outstanding. You know your loadout works because you have proven it in the field." },
    ],
  },
  {
    id: "water-storage",
    category: "water",
    categoryLabel: "Water Storage",
    question: "How many days of water do you have stored?",
    answers: [
      { text: "None", score: 0, feedback: "Water is survival priority #1. Start with 1 gallon per person per day." },
      { text: "1-2 days", score: 3, feedback: "Better than nothing, but most emergencies last longer. Aim for at least a week." },
      { text: "3-7 days", score: 7, feedback: "You can ride out most short-term emergencies. Consider adding purification." },
      { text: "2+ weeks", score: 10, feedback: "Excellent water security. You are ahead of 95% of households." },
    ],
  },
  {
    id: "food-storage",
    category: "food",
    categoryLabel: "Food Storage",
    question: "How many days of food do you have stored?",
    answers: [
      { text: "Just what is in the fridge", score: 0, feedback: "A fridge without power is a countdown clock. Start stocking shelf-stable food." },
      { text: "3-7 days", score: 3, feedback: "Enough for a weekend emergency. Build toward two weeks of real calories." },
      { text: "2 weeks to 1 month", score: 7, feedback: "Strong position. You can handle most disruptions without outside help." },
      { text: "1+ month", score: 10, feedback: "Serious food security. Make sure you are rotating stock and storing it properly." },
    ],
  },
  {
    id: "water-purification",
    category: "water",
    categoryLabel: "Water Purification",
    question: "Do you have a way to purify water?",
    answers: [
      { text: "No", score: 0, feedback: "Stored water runs out. A filter or purification method means indefinite supply." },
      { text: "Purification tabs only", score: 3, feedback: "Tabs work but are slow and limited. Add a filter for faster, reliable purification." },
      { text: "Filter (Sawyer/LifeStraw)", score: 7, feedback: "Good primary method. Consider a backup in case your filter gets damaged." },
      { text: "Multiple methods", score: 10, feedback: "Redundancy is the name of the game. Filter, tabs, and boiling — you are covered." },
    ],
  },
  {
    id: "fire",
    category: "skills",
    categoryLabel: "Fire Skills",
    question: "Can you start a fire without matches?",
    answers: [
      { text: "No", score: 0, feedback: "Fire means warmth, clean water, cooked food, and morale. Learn this skill first." },
      { text: "Maybe, never tried", score: 3, feedback: "Theory without practice fails under stress. Practice before you need it." },
      { text: "Yes, 1 method", score: 7, feedback: "Good. Now learn a backup method — ferro rod, flint, bow drill." },
      { text: "Yes, 3+ methods", score: 10, feedback: "Impressive. You can make fire regardless of conditions or available tools." },
    ],
  },
  {
    id: "comms",
    category: "communication",
    categoryLabel: "Communication",
    question: "Do you have a communication plan if cell towers go down?",
    answers: [
      { text: "No plan", score: 0, feedback: "Cell towers have about 8 hours of backup. After that, you need alternatives." },
      { text: "Family knows to meet somewhere", score: 3, feedback: "A meeting point is a start. Write it down and add backup locations." },
      { text: "HAM radio or satellite communicator", score: 7, feedback: "Serious comms capability. Make sure your family knows how to use it too." },
      { text: "Full comms plan with backup", score: 10, feedback: "Complete communication resilience. You can coordinate no matter what happens." },
    ],
  },
  {
    id: "fitness",
    category: "fitness",
    categoryLabel: "Physical Fitness",
    question: "Could you ruck 10 miles with a 30lb pack?",
    answers: [
      { text: "Definitely not", score: 0, feedback: "Fitness is the prep most people skip. Start with daily walks and build up." },
      { text: "Struggle but maybe", score: 3, feedback: "Honest assessment. Start rucking with 15-20 lbs and gradually increase." },
      { text: "Yes, but it would hurt", score: 7, feedback: "You can do it when it counts. Consistent training will make it easier." },
      { text: "No problem", score: 10, feedback: "Peak readiness. Your body is as prepared as your gear. Well done." },
    ],
  },
  {
    id: "power",
    category: "power",
    categoryLabel: "Portable Power",
    question: "Do you have a portable power solution?",
    answers: [
      { text: "No", score: 0, feedback: "Power keeps your devices, lights, and medical equipment running. Start simple." },
      { text: "Power bank for phone", score: 3, feedback: "Covers phone charging. Consider something bigger for extended outages." },
      { text: "Portable power station", score: 7, feedback: "Great capability. A solar panel would make you truly energy independent." },
      { text: "Solar + power station setup", score: 10, feedback: "Indefinite power generation. You are off-grid capable." },
    ],
  },
  {
    id: "firstaid",
    category: "medical",
    categoryLabel: "First Aid",
    question: "Do you have a first aid kit and know how to use it?",
    answers: [
      { text: "No kit", score: 0, feedback: "Medical emergencies do not wait. A basic kit could save a life today." },
      { text: "Basic kit, no training", score: 3, feedback: "Having supplies is step one. Take a Stop the Bleed class — they are free." },
      { text: "Good kit + basic training", score: 7, feedback: "Solid medical readiness. Consider advancing to Wilderness First Aid." },
      { text: "Advanced kit + first aid certified", score: 10, feedback: "Medical self-sufficiency. You are the person everyone turns to in a crisis." },
    ],
  },
  {
    id: "drills",
    category: "planning",
    categoryLabel: "Emergency Drills",
    question: "Have you practiced or drilled your emergency plan?",
    answers: [
      { text: "What plan?", score: 0, feedback: "No plan survives first contact — but having one beats winging it every time." },
      { text: "Have a plan, never practiced", score: 3, feedback: "A plan you have never tested is just theory. Run through it once this month." },
      { text: "Practiced once", score: 7, feedback: "Good. Drilling reveals gaps you never noticed on paper. Do it again." },
      { text: "Regular drills with family", score: 10, feedback: "Elite preparedness. Your family knows exactly what to do under pressure." },
    ],
  },
];

// ─── Score Ranges ───────────────────────────────────────────────────────────

export const scoreRanges: ScoreRange[] = [
  {
    min: 0,
    max: 25,
    title: "Just Getting Started",
    description:
      "Everyone starts somewhere — and you just took the first step by assessing where you stand. The good news: small, consistent actions compound fast. Focus on the fundamentals below and you will be in a completely different position within 30 days.",
    color: "text-danger",
    icon: "AlertTriangle",
    recommendations: [
      "Build a basic 72-hour Bug Out Bag — use our free BOB calculator",
      "Store at least 3 days of water (1 gallon per person per day)",
      "Get a Sawyer Squeeze water filter — the single best bang-for-buck prep",
      "Put together a basic first aid kit and take a free Stop the Bleed class",
      "Write a one-page family emergency plan with meeting points",
    ],
    products: [
      {
        name: "Sawyer Squeeze Water Filter",
        url: "https://www.amazon.com/dp/B00B1OSU4W?tag=prepperevo-20",
        reason: "Filters 100,000 gallons. The most recommended filter in prepping.",
      },
      {
        name: "5.11 RUSH72 Backpack",
        url: "https://www.amazon.com/dp/B0D9R239MT?tag=prepperevo-20",
        reason: "Built like a tank. Perfect foundation for your first Bug Out Bag.",
      },
      {
        name: "Mountain House Classic Bucket",
        url: "https://www.amazon.com/dp/B00955DUHQ?tag=prepperevo-20",
        reason: "24 servings of freeze-dried meals. 30-year shelf life, no cooking skill needed.",
      },
      {
        name: "Anker 737 Power Bank (24,000mAh)",
        url: "https://www.amazon.com/dp/B09VPHVT2Z?tag=prepperevo-20",
        reason: "140W 3-port power bank that keeps your devices alive for days. Charge your phone 5+ times on a single battery.",
      },
      {
        name: "LifeStraw Peak Series",
        url: "https://www.amazon.com/dp/B0CFYHBWP4?tag=prepperevo-20",
        reason: "Personal water filter you can drink through directly. Filters 99.99% of bacteria and parasites from any freshwater source.",
      },
      {
        name: "SOL Emergency Blankets (4-pack)",
        url: "https://www.amazon.com/dp/B07Z5H98R7?tag=prepperevo-20",
        reason: "Mylar emergency blankets that reflect 90% of body heat. Waterproof, windproof, and weigh almost nothing.",
      },
      {
        name: "UCO Stormproof Matches",
        url: "https://www.amazon.com/dp/B00773VVHO?tag=prepperevo-20",
        reason: "Windproof and waterproof matches that burn for 15 seconds even in rain. Fire is survival priority number two after water.",
      },
      {
        name: "Adventure Medical Kits Ultralight",
        url: "https://www.amazon.com/dp/B0DV6PDY9R?tag=prepperevo-20",
        reason: "Compact first aid kit that covers the basics. Lightweight enough to toss in any bag.",
      },
    ],
  },
  {
    min: 26,
    max: 50,
    title: "Building Your Foundation",
    description:
      "You have the basics started but there are gaps that could leave you vulnerable. You are past the 'I should probably do something' phase — now it is time to get systematic. Fill the weak spots below and you will jump into solid prepper territory fast.",
    color: "text-accent",
    icon: "Flame",
    recommendations: [
      "Expand your water storage to at least 7 days and add a backup purification method",
      "Build your food storage to 2 weeks minimum — rotate what you eat",
      "Add a portable power solution — even a mid-range power station changes everything",
      "Get a communication backup: HAM radio license or satellite communicator",
      "Practice your emergency plan at least once — walk through it with your family",
    ],
    products: [
      {
        name: "Jackery Explorer 1000 Plus",
        url: "https://www.amazon.com/dp/B0C37CWBKZ?tag=prepperevo-20",
        reason: "1264Wh capacity. Powers devices, lights, and small appliances for days.",
      },
      {
        name: "Garmin inReach Mini 3 Plus",
        url: "https://www.amazon.com/dp/B0G4RST8LV?tag=prepperevo-20",
        reason: "Two-way satellite messaging + SOS. Works anywhere on earth, no cell towers needed.",
      },
      {
        name: "ESEE 4 Fixed Blade Knife",
        url: "https://www.amazon.com/dp/B0848RXQ1W?tag=prepperevo-20",
        reason: "Bombproof fixed blade with a lifetime warranty. The only knife you need in the field.",
      },
      {
        name: "Black Diamond Spot 400",
        url: "https://www.amazon.com/dp/B0DK2QZYKG?tag=prepperevo-20",
        reason: "400-lumen headlamp with red night mode. Hands-free lighting is essential when the power goes out.",
      },
      {
        name: "Morakniv Companion",
        url: "https://www.amazon.com/dp/B004TNWD40?tag=prepperevo-20",
        reason: "Budget-friendly fixed blade knife that punches way above its price. Great starter knife for your kit.",
      },
      {
        name: "Eton Emergency Weather Radio",
        url: "https://www.amazon.com/dp/B0C5KSYZ1N?tag=prepperevo-20",
        reason: "Hand-crank AM/FM/NOAA weather radio with built-in phone charger. Information is survival when the grid goes down.",
      },
      {
        name: "Aquamira Water Treatment Drops",
        url: "https://www.amazon.com/dp/B0078SA5SE?tag=prepperevo-20",
        reason: "Chemical water treatment that treats up to 30 gallons. Lightweight backup to your primary water filter.",
      },
    ],
  },
  {
    min: 51,
    max: 75,
    title: "Solid Prepper",
    description:
      "You are more prepared than 90% of the population. Your fundamentals are strong, and you have real capability across multiple areas. Now it is about optimization, redundancy, and extending your self-sufficiency window. The recommendations below take you from prepared to truly resilient.",
    color: "text-secondary",
    icon: "Shield",
    recommendations: [
      "Add solar charging to your power setup for indefinite energy independence",
      "Upgrade your medical training — Wilderness First Aid or TCCC certification",
      "Build redundancy: backup comms, backup water purification, backup fire methods",
      "Extend food storage toward 1+ month with proper Mylar bag long-term storage",
      "Run quarterly drills and update your emergency plan for seasonal changes",
    ],
    products: [
      {
        name: "Renogy 200W Portable Solar Panel",
        url: "https://www.amazon.com/dp/B0CNPHD4VY?tag=prepperevo-20",
        reason: "Pairs with any power station. 200W recharges a 1000Wh station in about 5-6 hours.",
      },
      {
        name: "EcoFlow DELTA 3 Plus",
        url: "https://www.amazon.com/dp/B0GQBJ2SCT?tag=prepperevo-20",
        reason: "1024Wh LFP with 1800W output. UPS mode, 140W USB-C, expandable to 5kWh. 4000+ cycle lifespan.",
      },
      {
        name: "Garmin inReach Mini 3 Plus",
        url: "https://www.amazon.com/dp/B0G4RST8LV?tag=prepperevo-20",
        reason: "If you do not have satellite comms yet, this fills your last major gap.",
      },
      {
        name: "Baofeng BF-F8HP PRO",
        url: "https://www.amazon.com/dp/B0DHSS2NNF?tag=prepperevo-20",
        reason: "Tri-power HAM radio for when cell towers are down. Communicate locally and monitor emergency frequencies.",
      },
      {
        name: "Goal Zero Venture 75",
        url: "https://www.amazon.com/dp/B095FCY299?tag=prepperevo-20",
        reason: "Waterproof power bank built for outdoor abuse. Charges phones and tablets in any weather condition.",
      },
      {
        name: "Nalgene 32oz Wide Mouth",
        url: "https://www.amazon.com/dp/B001NCDE8O?tag=prepperevo-20",
        reason: "Bombproof water bottle that handles boiling water. Use it to purify water by boiling or store treated water.",
      },
    ],
  },
  {
    min: 76,
    max: 100,
    title: "Ready for Anything",
    description:
      "You are in elite company. Your preparedness covers all the fundamentals with depth and redundancy. You have trained, tested, and refined your systems. At this level, focus on community building, teaching others, and fine-tuning your edge cases. Consider helping others on their journey — the strongest communities are the most resilient.",
    color: "text-secondary",
    icon: "Trophy",
    recommendations: [
      "Teach your skills to friends and neighbors — a prepared community is your best asset",
      "Run advanced scenario drills: extended power outage, evacuation under time pressure",
      "Fine-tune your vehicle readiness and overlanding capability for mobile self-sufficiency",
      "Consider advanced comms: HAM repeater access, mesh networking, GMRS",
      "Audit and rotate your gear annually — check expiration dates, test equipment",
    ],
    products: [
      {
        name: "Renogy 200W Portable Solar Panel",
        url: "https://www.amazon.com/dp/B0CNPHD4VY?tag=prepperevo-20",
        reason: "Add or upgrade your solar capability. Pair with a high-capacity power station.",
      },
      {
        name: "EcoFlow DELTA 3 Plus",
        url: "https://www.amazon.com/dp/B0GQBJ2SCT?tag=prepperevo-20",
        reason: "Expandable LFP power for long-term off-grid capability. 1800W output, UPS mode, 4000+ cycles.",
      },
      {
        name: "5.11 RUSH72 Backpack",
        url: "https://www.amazon.com/dp/B0D9R239MT?tag=prepperevo-20",
        reason: "If your BOB pack is getting worn, the RUSH72 is the benchmark upgrade.",
      },
      {
        name: "Baofeng BF-F8HP PRO",
        url: "https://www.amazon.com/dp/B0DHSS2NNF?tag=prepperevo-20",
        reason: "Tri-power HAM radio to maintain your comms edge. Monitor emergency frequencies and communicate when infrastructure fails.",
      },
      {
        name: "Goal Zero Venture 75",
        url: "https://www.amazon.com/dp/B095FCY299?tag=prepperevo-20",
        reason: "Waterproof power bank for your EDC and go-bag. Rugged enough for any environment you operate in.",
      },
      {
        name: "Black Diamond Spot 400",
        url: "https://www.amazon.com/dp/B0DK2QZYKG?tag=prepperevo-20",
        reason: "400-lumen headlamp with multiple modes including red night vision. Upgrade your hands-free lighting game.",
      },
      {
        name: "Morakniv Companion",
        url: "https://www.amazon.com/dp/B004TNWD40?tag=prepperevo-20",
        reason: "Budget backup fixed blade to stash in your vehicle kit or second bag. Reliable Scandinavian steel.",
      },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export const MAX_SCORE = questions.length * 10; // 100

export function getScoreRange(score: number): ScoreRange {
  return scoreRanges.find((r) => score >= r.min && score <= r.max) || scoreRanges[0];
}

export function getCategoryScores(answers: Record<string, number>): { label: string; score: number; maxScore: number }[] {
  const cats: Record<string, { label: string; score: number; maxScore: number }> = {};
  for (const q of questions) {
    if (!cats[q.category]) {
      cats[q.category] = { label: q.categoryLabel, score: 0, maxScore: 0 };
    }
    cats[q.category].maxScore += 10;
    if (answers[q.id] !== undefined) {
      cats[q.category].score += answers[q.id];
    }
  }
  return Object.values(cats);
}
