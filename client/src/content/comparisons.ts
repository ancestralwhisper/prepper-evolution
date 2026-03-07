export interface ComparisonProduct {
  slug: string;
  name: string;
  image: string;
  price: string;
  rating: number;
  reviewCount: number;
  affiliateUrl: string;
  badge?: string;
  verdict: string;
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
}

export interface Comparison {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  date: string;
  lastUpdated: string;
  category: string;
  heroImage: string;
  intro: string;
  buyingGuideTitle: string;
  buyingGuide: string[];
  verdict: string;
  products: ComparisonProduct[];
  specLabels: { key: string; label: string }[];
  faq: { question: string; answer: string }[];
}

const comparisons: Comparison[] = [
  {
    slug: "best-water-filters-for-preppers",
    title: "Best Water Filters for Emergency Preparedness (2026)",
    metaTitle: "Best Water Filters for Preppers 2026 — Tested & Compared",
    description:
      "We tested the top water filters for emergency preparedness. Compare the Sawyer Squeeze, Waterdrop King Tank, Aquamira tablets, and Katadyn BeFree by filtration, portability, and value.",
    date: "2026-01-15",
    lastUpdated: "2026-02-18",
    category: "water",
    heroImage:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=1200&q=80",
    intro:
      "Clean water is the #1 survival priority after immediate safety. Whether you're building a bug out bag, stocking a home emergency kit, or heading off-grid for overlanding, a reliable water filter can mean the difference between dehydration and survival. We've compared four of the best water filtration options across different use cases — from ultralight backpacking filters to gravity-fed home systems and chemical backup tablets.",
    buyingGuideTitle: "How to Choose a Water Filter for Emergencies",
    buyingGuide: [
      "Filtration level: Look for 0.1 micron or smaller for bacteria and protozoa removal. Chemical purification (like Aquamira) also kills viruses, which most filters don't.",
      "Portability vs. capacity: Squeeze filters like the Sawyer are ultralight for bug out bags. Gravity-fed systems like the Waterdrop King Tank are ideal for home or base camp. Chemical tablets are the lightest backup of all.",
      "Flow rate: In an emergency, speed matters. Squeeze filters offer instant water. Gravity-fed systems take 15-30 minutes for a full batch. Chemical tablets need 30+ minutes.",
      "Longevity: The Sawyer Squeeze filters 100,000 gallons — essentially a lifetime supply. The Waterdrop King Tank elements last 8,000 gallons combined. Chemical tablets are single-use but have a 4-year shelf life.",
      "Redundancy: Smart preppers carry at least two water purification methods. A primary filter plus chemical tablets gives you a reliable backup if your filter fails.",
    ],
    verdict:
      "For most preppers, the Sawyer Squeeze is the clear winner — it's ultralight, filters 100,000 gallons, and costs under $40. Pair it with Aquamira tablets as a backup for virus protection and you have a nearly unbeatable combo. For home preparedness and base camp, the Waterdrop King Tank delivers NSF-certified gravity filtration at a fraction of what the old Berkey cost.",
    specLabels: [
      { key: "type", label: "Type" },
      { key: "filtration", label: "Filtration" },
      { key: "capacity", label: "Capacity" },
      { key: "weight", label: "Weight" },
      { key: "flowRate", label: "Flow Rate" },
    ],
    products: [
      {
        slug: "sawyer-squeeze-water-filter",
        name: "Sawyer Squeeze Water Filter System",
        image:
          "https://cdn.prod.website-files.com/61549f9352f3558157a226ea/6776e9804a8c2ee279d54f97_sawyer-squeeze-water-filteration.png",
        price: "$37",
        rating: 4.8,
        reviewCount: 28400,
        affiliateUrl:
          "https://www.amazon.com/dp/B00B1OSU4W?tag=prepperevo-20",
        badge: "Editor's Pick",
        verdict:
          "The best all-around water filter for preppers. Ultralight, nearly unlimited capacity, and dead simple to use. Belongs in every bug out bag.",
        pros: [
          "100,000 gallon lifespan",
          "3 oz ultralight",
          "Under $40",
          "Backflushable",
        ],
        cons: [
          "No virus removal",
          "Can freeze-crack if not stored properly",
          "Squeeze pouches wear out",
        ],
        specs: {
          type: "Squeeze filter",
          filtration: "0.1 micron (bacteria + protozoa)",
          capacity: "100,000 gallons",
          weight: "3 oz",
          flowRate: "1.7 L/min",
        },
      },
      {
        slug: "waterdrop-king-tank",
        name: "Waterdrop King Tank Gravity Water Filter System",
        image:
          "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80",
        price: "$190",
        rating: 4.6,
        reviewCount: 3200,
        affiliateUrl:
          "https://www.amazon.com/dp/B0BLNSYNW3?tag=prepperevo-20",
        badge: "Best for Home",
        verdict:
          "The gravity-fed water filter that replaced the discontinued Berkey. NSF certified, significantly cheaper, and requires no electricity or plumbing. The new standard for home preparedness water filtration.",
        pros: [
          "NSF 42 & 372 certified filtration",
          "No electricity needed",
          "High volume (2.25 gal)",
          "Stainless steel durability",
        ],
        cons: [
          "Not portable — home/base camp only",
          "Does not remove viruses",
          "Gravity-fed — slow filtration speed",
        ],
        specs: {
          type: "Gravity-fed filter",
          filtration: "NSF 42/372 (chlorine, lead, mercury, PFAS)",
          capacity: "8,000 gal per element set",
          weight: "6 lbs (empty)",
          flowRate: "3 gal/hr",
        },
      },
      {
        slug: "katadyn-befree-water-filter",
        name: "Katadyn BeFree 1.0L Water Filter",
        image:
          "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80",
        price: "$45",
        rating: 4.5,
        reviewCount: 5600,
        affiliateUrl:
          "https://www.amazon.com/dp/B0F3FLHZK5?tag=prepperevo-20",
        verdict:
          "The fastest-flow ultralight filter with the easiest cleaning. Great for active use — just squeeze or drink directly. Collapsible flask saves space.",
        pros: [
          "2 L/min flow rate",
          "2 oz empty weight",
          "Easy shake-to-clean",
          "Collapsible flask",
        ],
        cons: [
          "Shorter lifespan (1,000L)",
          "Soft flask less durable than hard bottles",
          "No virus protection",
        ],
        specs: {
          type: "Squeeze filter",
          filtration: "0.1 micron (bacteria + protozoa)",
          capacity: "1,000 liters",
          weight: "2 oz (empty)",
          flowRate: "2 L/min",
        },
      },
      {
        slug: "aquamira-water-purification-tablets",
        name: "Aquamira Water Purification Tablets (50-pack)",
        image:
          "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80",
        price: "$12",
        rating: 4.6,
        reviewCount: 5800,
        affiliateUrl:
          "https://www.amazon.com/dp/B01AUWUAQ6?tag=prepperevo-20",
        badge: "Best Backup",
        verdict:
          "The essential backup water purification. Weighs almost nothing, kills viruses (which filters can't), and has a 4-year shelf life. Every prepper should carry these alongside a filter.",
        pros: [
          "Kills viruses + bacteria",
          "Weighs almost nothing",
          "4-year shelf life",
          "Only $12",
        ],
        cons: [
          "30-min wait time",
          "Slight chemical taste",
          "Single-use (50 liters total)",
        ],
        specs: {
          type: "Chemical purification",
          filtration: "Chlorine dioxide (viruses + bacteria + cysts)",
          capacity: "50 liters (50 tablets)",
          weight: "< 1 oz",
          flowRate: "30 min wait",
        },
      },
    ],
    faq: [
      {
        question: "Do water filters remove viruses?",
        answer:
          "Most portable water filters (like the Sawyer Squeeze and Katadyn BeFree) use 0.1 micron membranes that remove bacteria and protozoa but NOT viruses. Viruses are smaller than 0.1 microns. For virus protection, you need a purifier (like the Berkey) or chemical treatment (like Aquamira chlorine dioxide tablets). This is why experienced preppers carry both a filter and chemical backup.",
      },
      {
        question: "How long do water filters last?",
        answer:
          "It varies enormously. The Sawyer Squeeze is rated for 100,000 gallons — essentially a lifetime. The Katadyn BeFree is rated for about 1,000 liters before the membrane clogs permanently. Berkey Black elements last 6,000 gallons per pair. Chemical tablets like Aquamira have a 4-year shelf life regardless of use.",
      },
      {
        question: "What's the best water filter for a bug out bag?",
        answer:
          "The Sawyer Squeeze is the top choice for bug out bags. At 3 oz, it's ultralight enough to forget it's there. It filters instantly (no waiting), works with standard water bottles, and costs under $40. Pair it with a few Aquamira tablets as a backup and you have redundant water purification weighing under 4 oz total.",
      },
      {
        question: "Can you drink directly from a stream with these filters?",
        answer:
          "Yes — both the Sawyer Squeeze and Katadyn BeFree allow you to drink directly by attaching the filter to the squeeze pouch and drinking from the outlet. This is called 'inline' use. The Berkey is gravity-fed only (pour water in the top, collect from the spigot). Aquamira tablets require adding to water and waiting 30 minutes.",
      },
    ],
  },
  {
    slug: "best-portable-power-stations-for-overlanding",
    title: "Best Portable Power Stations for Overlanding (2026)",
    metaTitle:
      "Best Portable Power Stations 2026 — Jackery vs EcoFlow Compared",
    description:
      "Compare the top portable power stations for overlanding. Jackery Explorer 1000 Plus vs EcoFlow DELTA 3 Max Plus vs Anker solar — capacity, output, and real-world performance.",
    date: "2026-01-20",
    lastUpdated: "2026-02-18",
    category: "overlanding",
    heroImage:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
    intro:
      "A portable power station is the backbone of any serious overlanding setup. It keeps your fridge cold, your devices charged, your CPAP running, and your communication gear alive — all without idling your engine. We've compared the two dominant LiFePO4 power stations plus a budget solar panel option for overlanders who want to stay powered indefinitely off-grid.",
    buyingGuideTitle: "How to Choose a Power Station for Overlanding",
    buyingGuide: [
      "Battery chemistry: LiFePO4 (lithium iron phosphate) is the gold standard for overlanding. It lasts 3,000-4,000+ charge cycles vs ~500 for standard lithium-ion. Both the Jackery 1000 Plus and EcoFlow DELTA 3 Max Plus use LiFePO4.",
      "Capacity (Wh): A 12V fridge draws about 30-50W. At 50W continuous, a 1000Wh station runs your fridge for roughly 20 hours. A 2000Wh station doubles that. Size your station based on your biggest power draw.",
      "Output wattage: Make sure the station can handle your peak loads. Running a fridge + charging devices + LED lights might draw 200-400W. Cooking appliances or power tools need 1500W+.",
      "Solar input: Higher solar input means faster recharging. The EcoFlow DELTA 3 Max Plus accepts 1000W solar input vs Jackery's 400W. In practice, most overlanders run 200-400W of panels, so both are adequate.",
      "Expandability: Both stations can add extra batteries. The Jackery expands to 5kWh, the EcoFlow to 10kWh. This matters if you're building a permanent vehicle power system.",
    ],
    verdict:
      "The Jackery Explorer 1000 Plus is the best value for most overlanders — 1264Wh of LiFePO4 power, 2000W output, and expandable to 5kWh, all for $799. The EcoFlow DELTA 3 Max Plus is the premium pick if you need more capacity (2048Wh), 3000W output, and faster solar charging (1000W input). Add the Anker 21W solar panel for keeping phones and small devices topped up without touching your main station.",
    specLabels: [
      { key: "capacity", label: "Capacity" },
      { key: "output", label: "Output" },
      { key: "battery", label: "Battery Type" },
      { key: "solar", label: "Solar Input" },
      { key: "chargeTime", label: "Charge Time" },
      { key: "weight", label: "Weight" },
    ],
    products: [
      {
        slug: "jackery-explorer-1000-plus",
        name: "Jackery Explorer 1000 Plus",
        image:
          "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=600&q=80",
        price: "$799",
        rating: 4.7,
        reviewCount: 8900,
        affiliateUrl:
          "https://www.amazon.com/dp/B0D7PPG25F?tag=prepperevo-20",
        badge: "Best Value",
        verdict:
          "The best power station for most overlanders. Great balance of capacity, output, and price. LiFePO4 chemistry means 4,000+ charge cycles and a 10-year lifespan.",
        pros: [
          "LiFePO4 — 4000+ cycles",
          "Expandable to 5kWh",
          "2000W output handles most loads",
          "$799 is competitive",
        ],
        cons: [
          "400W max solar input",
          "Heavier than lithium-ion alternatives",
          "No built-in WiFi control",
        ],
        specs: {
          capacity: "1264Wh",
          output: "2000W (4000W surge)",
          battery: "LiFePO4",
          solar: "400W max",
          chargeTime: "1.7 hrs (wall), 2.5 hrs (solar)",
          weight: "30.5 lbs",
        },
      },
      {
        slug: "ecoflow-delta-3-max-plus",
        name: "EcoFlow DELTA 3 Max Plus",
        image:
          "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
        price: "$1,899",
        rating: 4.7,
        reviewCount: 1200,
        affiliateUrl:
          "https://www.amazon.com/dp/B0FQV9Q9J2?tag=prepperevo-20",
        badge: "Premium Pick",
        verdict:
          "The most capable power station for serious overlanders and van lifers. 3000W output, 1000W solar input, UPS mode, and expandable to 10kWh.",
        pros: [
          "2048Wh LFP capacity — 4000+ cycles",
          "1000W solar input — fastest charging",
          "3000W output handles heavy loads",
          "Expandable to 10kWh",
        ],
        cons: [
          "Premium price at $1,899",
          "Heavy — plan for permanent mount",
          "Newer product — fewer long-term reviews",
        ],
        specs: {
          capacity: "2048Wh",
          output: "3000W (6000W surge)",
          battery: "LiFePO4",
          solar: "1000W max",
          chargeTime: "64 min to 80% (wall), 2.5 hrs (solar)",
          weight: "49.6 lbs",
        },
      },
      {
        slug: "ecoflow-delta-2-max",
        name: "EcoFlow DELTA 2 Max",
        image:
          "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
        price: "$1,599",
        rating: 4.6,
        reviewCount: 3800,
        affiliateUrl:
          "https://www.amazon.com/dp/B0C4DW17PD?tag=prepperevo-20",
        badge: "Still Great",
        verdict:
          "The previous generation flagship — still excellent. 2048Wh LiFePO4, 2400W output, and proven reliability with thousands of reviews. Often on sale now that the DELTA 3 series is out.",
        pros: [
          "2048Wh LFP capacity — proven reliability",
          "800W solar input",
          "Smart app control",
          "Expandable to 6kWh",
        ],
        cons: [
          "Previous gen — DELTA 3 Max Plus is the successor",
          "50.7 lbs — heavy",
          "2400W output vs 3000W on newer model",
        ],
        specs: {
          capacity: "2048Wh",
          output: "2400W (4800W surge)",
          battery: "LiFePO4",
          solar: "800W max",
          chargeTime: "43 min to 80% (wall), 3 hrs (solar)",
          weight: "50.7 lbs",
        },
      },
      {
        slug: "anker-solar-panel-21w",
        name: "Anker 21W Solar Charger",
        image:
          "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=600&q=80",
        price: "$56",
        rating: 4.5,
        reviewCount: 18500,
        affiliateUrl:
          "https://www.amazon.com/dp/B01EXWCPLC?tag=prepperevo-20",
        badge: "Budget Solar",
        verdict:
          "Not a power station, but the perfect solar companion. Charges phones, radios, and power banks directly from sunlight. At $56, every overlander should carry one.",
        pros: [
          "Only $56",
          "14.7 oz — ultralight",
          "Direct USB charging",
          "No battery to maintain",
        ],
        cons: [
          "21W — won't charge power stations",
          "USB only — no DC/AC output",
          "Depends on direct sunlight",
        ],
        specs: {
          capacity: "N/A (panel only)",
          output: "21W (dual USB)",
          battery: "N/A",
          solar: "21W (self)",
          chargeTime: "Phone: 2-3 hrs in sun",
          weight: "14.7 oz",
        },
      },
    ],
    faq: [
      {
        question: "Can a portable power station run a 12V fridge?",
        answer:
          "Yes — this is the most common overlanding use case. A typical 12V fridge draws 30-50W. The Jackery 1000 Plus (1264Wh) can run a fridge for roughly 25-40 hours on a single charge, depending on ambient temperature and how often the compressor cycles. The EcoFlow DELTA 3 Max Plus nearly doubles that runtime with its 2048Wh capacity.",
      },
      {
        question: "LiFePO4 vs lithium-ion — which is better for overlanding?",
        answer:
          "LiFePO4 is better for overlanding in every way that matters. It lasts 4,000+ charge cycles vs 500 for lithium-ion, handles extreme temperatures better, and is safer (no thermal runaway risk). The tradeoff is weight — LiFePO4 is about 20-30% heavier per Wh. For a vehicle-based setup, the extra weight is worth the dramatically longer lifespan.",
      },
      {
        question:
          "How many solar panels do I need to keep a power station charged?",
        answer:
          "For most overlanders, 200W of portable solar panels is the sweet spot. That gives you about 600-800Wh of charge per day in good sun — enough to offset fridge use and moderate device charging. If you run heavier loads or camp in shady spots, consider 400W of panels. The Jackery accepts up to 400W solar input, the EcoFlow DELTA 3 Max Plus up to 1000W.",
      },
      {
        question: "Is it worth getting an expandable power station?",
        answer:
          "If you're building a permanent overlanding setup, yes. Starting with a base station (1000-2000Wh) and adding batteries later lets you scale your power system as your needs grow. The Jackery expands to 5kWh, the EcoFlow DELTA 3 Max Plus to 10kWh. If you only car camp occasionally, the base station alone is usually plenty.",
      },
    ],
  },
  {
    slug: "best-recovery-gear-for-overlanding",
    title: "Best Recovery Gear for Overlanding (2026)",
    metaTitle: "Best Overlanding Recovery Gear 2026 — MAXTRAX, Warn & ARB",
    description:
      "Compare the essential recovery gear for overlanding. MAXTRAX recovery boards, Warn winch, and ARB air compressor — the 3 tools that get you unstuck anywhere.",
    date: "2026-02-01",
    lastUpdated: "2026-02-18",
    category: "overlanding",
    heroImage:
      "https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1200&q=80",
    intro:
      "Getting stuck is part of overlanding — getting unstuck is what separates a good trip from a rescue call. The right recovery gear lets you self-recover from sand, mud, snow, and rocky terrain without waiting for help. We've compared the three most critical recovery tools: traction boards, a winch, and an air compressor for tire management.",
    buyingGuideTitle: "Essential Recovery Gear — What You Actually Need",
    buyingGuide: [
      "Recovery boards first: If you buy one recovery tool, make it traction boards. They handle 80% of stuck situations (sand, mud, soft ground) without any mechanical installation. Just place them under your tires and drive out.",
      "Winch for serious terrain: A winch is essential if you run technical trails, solo travel, or drive in deep mud. A 10,000 lb rated winch covers most midsize SUVs and trucks. Synthetic rope is lighter and safer than steel cable.",
      "Air compressor for tire management: Airing down (lowering tire pressure to 15-20 PSI) dramatically improves traction on sand, mud, and rocks. But you need a compressor to air back up before hitting pavement. A good compressor also powers air lockers.",
      "Recovery kit extras: Always carry a tree saver strap, D-ring shackles, and recovery damper (in case a line breaks). A basic recovery kit runs $50-100 and should live permanently in your rig.",
      "Know your rig's weight: Size your winch to 1.5x your vehicle's gross weight. A 5,000 lb vehicle needs at least a 7,500 lb winch. The Warn VR EVO 10-S at 10,000 lbs covers most overlanding rigs with margin to spare.",
    ],
    verdict:
      "Start with MAXTRAX recovery boards — they're the most versatile, require zero installation, and handle most stuck situations. Add a Warn winch if you run technical trails or travel solo. The ARB compressor completes your kit by enabling proper tire management, which prevents most stuck situations in the first place.",
    specLabels: [
      { key: "type", label: "Type" },
      { key: "rating", label: "Rating/Capacity" },
      { key: "installation", label: "Installation" },
      { key: "weight", label: "Weight" },
      { key: "warranty", label: "Warranty" },
    ],
    products: [
      {
        slug: "maxtrax-mkii-recovery-boards",
        name: "MAXTRAX MKII Recovery Boards",
        image:
          "https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=600&q=80",
        price: "$299",
        rating: 4.9,
        reviewCount: 4800,
        affiliateUrl:
          "https://www.amazon.com/dp/B01ACMCUGM?tag=prepperevo-20",
        badge: "Essential",
        verdict:
          "The single most important recovery tool you can carry. Works in sand, mud, and snow with zero installation. Just place, drive, and go. Every overlanding rig needs a set.",
        pros: [
          "Works in sand, mud, snow, rock",
          "Zero installation needed",
          "UV-stabilized nylon — indestructible",
          "Built-in leash points",
        ],
        cons: [
          "External storage needed (roof rack or mount)",
          "$299 for a pair",
          "Heavy at 17.6 lbs per pair",
        ],
        specs: {
          type: "Traction boards",
          rating: "Vehicle agnostic — works with any tire",
          installation: "None — place and drive",
          weight: "17.6 lbs (pair)",
          warranty: "Lifetime (against defects)",
        },
      },
      {
        slug: "warn-vr-evo-10s-winch",
        name: "Warn VR EVO 10-S Winch",
        image:
          "https://images.unsplash.com/photo-1621252179027-94459d278660?w=600&q=80",
        price: "$640",
        rating: 4.8,
        reviewCount: 3200,
        affiliateUrl:
          "https://www.amazon.com/dp/B07SJHVQTJ?tag=prepperevo-20",
        badge: "Best Winch",
        verdict:
          "The industry standard overlanding winch. 10,000 lb capacity covers most rigs with margin. Synthetic rope, wireless remote, and IP68 waterproofing. If you run trails alone, this is non-negotiable.",
        pros: [
          "10,000 lb capacity",
          "Synthetic rope (safer, lighter)",
          "IP68 waterproof",
          "Wireless remote included",
        ],
        cons: [
          "Requires bumper mount or winch plate",
          "Heavy — 72 lbs installed",
          "Needs vehicle battery in good condition",
        ],
        specs: {
          type: "Electric winch",
          rating: "10,000 lbs",
          installation: "Bumper mount or winch plate required",
          weight: "72 lbs (with rope)",
          warranty: "Limited lifetime",
        },
      },
      {
        slug: "arb-twin-air-compressor",
        name: "ARB CKMTA12 Twin Motor Air Compressor",
        image:
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&q=80",
        price: "$575",
        rating: 4.8,
        reviewCount: 2400,
        affiliateUrl:
          "https://www.amazon.com/dp/B0050DI9YQ?tag=prepperevo-20",
        badge: "Best Compressor",
        verdict:
          "The fastest, most reliable 12V compressor for overlanding. Airs up a 35-inch tire in under 3 minutes. Also powers ARB air lockers. The go-to compressor for serious builds.",
        pros: [
          "6.16 CFM — airs up fast",
          "Hard-mount or portable",
          "Powers ARB air lockers",
          "Dust and moisture resistant",
        ],
        cons: [
          "Expensive at $575",
          "Loud during operation",
          "Requires 12V wiring for hard mount",
        ],
        specs: {
          type: "12V air compressor",
          rating: "6.16 CFM @ 0 PSI, 150 PSI max",
          installation: "Hard-mount or portable (both included)",
          weight: "13 lbs",
          warranty: "2 years",
        },
      },
    ],
    faq: [
      {
        question: "Do I really need recovery boards if I have a winch?",
        answer:
          "Yes. Recovery boards handle different situations than a winch. In soft sand or loose snow, there may be nothing solid to winch to — boards give your tires traction directly. They're also faster to deploy (30 seconds vs 5-10 minutes for a winch setup) and work without any vehicle modifications. Most experienced overlanders carry both.",
      },
      {
        question: "What PSI should I air down to for off-road driving?",
        answer:
          "It depends on the terrain. Sand: 15-18 PSI for maximum flotation. Rocky trails: 20-25 PSI for better grip and flex. Mud: 18-22 PSI for wider contact patch. Snow: 15-20 PSI. Never go below 15 PSI unless you have beadlock wheels — you risk popping the tire off the rim. Always air back up before highway driving.",
      },
      {
        question: "What size winch do I need?",
        answer:
          "The rule of thumb is 1.5x your vehicle's gross vehicle weight rating (GVWR). A Jeep Wrangler (GVWR ~5,500 lbs) needs at least an 8,250 lb winch. A midsize truck (GVWR ~6,500 lbs) needs at least 9,750 lbs. The Warn VR EVO 10-S at 10,000 lbs covers most overlanding vehicles with comfortable margin.",
      },
      {
        question: "Can I use a portable compressor instead of a hard-mounted one?",
        answer:
          "Yes, but it'll be slower. The ARB CKMTA12 can be used as a portable compressor (it comes with a portable kit). The advantage of hard-mounting is quicker access and cleaner wiring. If you only air down occasionally, a portable setup works fine. If you air down on every trip, hard-mount saves time and hassle.",
      },
    ],
  },
  {
    slug: "best-rooftop-tents-for-overlanding",
    title: "Best Rooftop Tents for Overlanding (2026)",
    metaTitle: "Best Rooftop Tents 2026 — iKamper, Roofnest & Thule Compared",
    description:
      "Compare the top rooftop tents for overlanding. iKamper Skycamp 3.0 vs Roofnest Falcon vs Thule Tepui vs Go Fast Campers — setup time, comfort, weight, and real-world durability.",
    date: "2026-02-18",
    lastUpdated: "2026-02-18",
    category: "overlanding",
    heroImage:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80",
    intro:
      "A rooftop tent transforms your overlanding rig from a day-tripper into a go-anywhere basecamp. No more searching for flat ground, no more rocks under your back, and no more critters in your sleeping space. But rooftop tents range from $1,000 to $4,000+, and the differences in setup time, insulation, weight, and durability are massive. We've compared four of the best rooftop tents across the spectrum — from premium hardshells to rugged softshells — so you can find the right one for your overlanding style.",
    buyingGuideTitle: "How to Choose a Rooftop Tent",
    buyingGuide: [
      "Hardshell vs. softshell: Hardshell tents (iKamper, Roofnest) pop open in under 60 seconds and close just as fast. Softshell tents (Thule Tepui) fold out and require more setup but are usually cheaper and offer more interior space for the money.",
      "Weight matters: Rooftop tents add 100-200 lbs to your roof. Check your vehicle's dynamic roof load rating (not static). Most crossbars are rated for 150-165 lbs dynamic. You may need upgraded crossbars or a roof rack rated for the weight.",
      "Sleeping capacity: A '3-person' tent comfortably sleeps 2 adults. If you need room for kids or gear, size up. King-size mattress tents (iKamper Skycamp) make a real difference for couples.",
      "Four-season capability: If you camp in cold weather, look for insulated mattress pads, draft skirts, and condensation-resistant fabrics. The iKamper and Roofnest both handle 3-season well; true winter camping requires additional insulation layers.",
      "Aerodynamics and fuel economy: Hardshell tents sit lower and create less drag than softshell tents. Expect 1-3 MPG loss depending on your tent profile and driving speed. Wedge-style hardshells (Roofnest Falcon) have the best aerodynamics.",
    ],
    verdict:
      "The iKamper Skycamp 3.0 is the best overall rooftop tent — king-size mattress, 60-second setup, and bomber 4-season construction justify the premium price for serious overlanders. The Roofnest Falcon is the best wedge-style hardshell if aerodynamics and lower profile are priorities. The Thule Tepui Kukenam is the best value for overlanders who want quality without the $3,000+ price tag. Go Fast Campers Platform is the ultralight choice for weight-conscious builds.",
    specLabels: [
      { key: "type", label: "Type" },
      { key: "sleeps", label: "Sleeps" },
      { key: "mattress", label: "Mattress" },
      { key: "weight", label: "Weight" },
      { key: "setupTime", label: "Setup Time" },
      { key: "seasons", label: "Seasons" },
    ],
    products: [
      {
        slug: "ikamper-skycamp-3",
        name: "iKamper Skycamp 3.0",
        image:
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
        price: "$4,299",
        rating: 4.8,
        reviewCount: 1200,
        affiliateUrl:
          "https://www.amazon.com/dp/B0CB6RX4RT?tag=prepperevo-20",
        badge: "Editor's Pick",
        verdict:
          "The gold standard of rooftop tents. King-size mattress, 1-minute setup, and 4-season capability. If you can afford it, this is the one to get.",
        pros: [
          "King-size sleeping area (83\" x 77\")",
          "60-second setup — gas struts do the work",
          "High-density foam mattress included",
          "Hardshell — low profile when closed",
        ],
        cons: [
          "Premium price at $4,299",
          "155 lbs — needs proper roof rack",
          "Requires 55\" minimum crossbar spread",
        ],
        specs: {
          type: "Hardshell (clamshell)",
          sleeps: "2-3",
          mattress: "King-size high-density foam",
          weight: "155 lbs",
          setupTime: "< 1 minute",
          seasons: "4-season",
        },
      },
      {
        slug: "roofnest-falcon",
        name: "Roofnest Falcon XL",
        image:
          "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&q=80",
        price: "$3,195",
        rating: 4.7,
        reviewCount: 680,
        affiliateUrl:
          "https://www.amazon.com/dp/B0D1W21B3J?tag=prepperevo-20",
        badge: "Best Aerodynamics",
        verdict:
          "The sleekest hardshell on the market. Wedge design cuts drag, pops open fast, and sleeps two comfortably. Great choice for daily-driver overlanding rigs.",
        pros: [
          "Low-profile wedge — best aerodynamics",
          "Quick pop-up setup under 1 min",
          "2.5\" high-density mattress",
          "Built-in LED lighting",
        ],
        cons: [
          "Less headroom at foot end (wedge design)",
          "130 lbs still needs rack upgrade",
          "Fewer window options than clamshell",
        ],
        specs: {
          type: "Hardshell (wedge)",
          sleeps: "2",
          mattress: "Queen 2.5\" high-density foam",
          weight: "130 lbs",
          setupTime: "< 1 minute",
          seasons: "3-season",
        },
      },
      {
        slug: "thule-tepui-kukenam",
        name: "Thule Tepui Explorer Kukenam 3",
        image:
          "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600&q=80",
        price: "$1,699",
        rating: 4.6,
        reviewCount: 2100,
        affiliateUrl:
          "https://www.amazon.com/dp/B08FW3PL58?tag=prepperevo-20",
        badge: "Best Value",
        verdict:
          "The best softshell tent for the money. Spacious interior, quality materials from a trusted brand, and nearly half the price of premium hardshells. Great entry point for overlanding.",
        pros: [
          "Under $1,700 — best value",
          "Spacious 3-person interior",
          "600D poly-cotton ripstop canvas",
          "Thule brand quality and warranty",
        ],
        cons: [
          "5-10 min setup (softshell fold-out)",
          "Higher profile when packed — more drag",
          "Heavier than some hardshells at 130 lbs",
        ],
        specs: {
          type: "Softshell (fold-out)",
          sleeps: "3",
          mattress: "2.5\" high-density foam",
          weight: "130 lbs",
          setupTime: "5-10 minutes",
          seasons: "3-season",
        },
      },
      {
        slug: "go-fast-campers-platform",
        name: "Go Fast Campers Platform",
        image:
          "https://images.unsplash.com/photo-1533632359083-0185df1be684?w=600&q=80",
        price: "$2,650",
        rating: 4.7,
        reviewCount: 450,
        affiliateUrl:
          "https://www.amazon.com/s?k=Go+Fast+Campers+Platform+tent&tag=prepperevo-20",
        verdict:
          "The lightest full-size rooftop tent available. At 95 lbs, it works on vehicles that can't handle heavier options. American-made quality with a cult following.",
        pros: [
          "95 lbs — lightest in class",
          "Works on lighter vehicles / stock racks",
          "American-made in Bozeman, MT",
          "Modular design — customize your setup",
        ],
        cons: [
          "Softshell — 5+ min setup",
          "Thin mattress — may want to upgrade",
          "Long wait times (made to order)",
        ],
        specs: {
          type: "Softshell (pop-up)",
          sleeps: "2",
          mattress: "2\" foam pad",
          weight: "95 lbs",
          setupTime: "5 minutes",
          seasons: "3-season",
        },
      },
    ],
    faq: [
      {
        question: "Will a rooftop tent damage my car?",
        answer:
          "Not if your setup is rated for the weight. Check your vehicle's dynamic roof load rating — this is the weight limit while driving, which is lower than the static (parked) rating. Most factory crossbars handle 150-165 lbs. If your tent + rack exceeds this, upgrade to a full roof rack system rated for the combined weight. Thousands of overlanders run rooftop tents on stock 4Runners, Tacomas, and Subarus without issues.",
      },
      {
        question: "Hardshell vs softshell — which is better?",
        answer:
          "Hardshell tents are better for frequent use — they set up in under 60 seconds, pack down flat, and create less wind drag. Softshell tents are better on a budget and when you want more interior space. A $1,700 softshell gives you 3-person space that would cost $4,000+ in a hardshell. If you camp every weekend, go hardshell. If you camp monthly, softshell is great value.",
      },
      {
        question: "How cold can you camp in a rooftop tent?",
        answer:
          "Most rooftop tents are comfortable to about 30-40°F with a good sleeping bag. For true cold weather (below freezing), you need: an insulated tent liner or winter insert, a cold-weather sleeping bag rated to 0°F, and an insulated mattress pad (the stock mattress won't insulate enough). The iKamper Skycamp handles cold best with its thicker walls and draft-resistant design. Below 0°F, most people add a small 12V diesel heater.",
      },
      {
        question: "Can I leave the rooftop tent on my car permanently?",
        answer:
          "Yes — most overlanders leave their tent mounted year-round. Hardshell tents are especially suited for this because they're low-profile and weatherproof when closed. You'll lose 1-3 MPG from the added weight and drag, and you'll need to account for parking garage clearance (add 6-12\" to your vehicle height). Many people daily-drive with their rooftop tent mounted.",
      },
    ],
  },
  {
    slug: "best-bug-out-bags",
    title: "Best Bug Out Bags for Emergency Preparedness (2026)",
    metaTitle: "Best Bug Out Bags 2026 — 5.11, Mystery Ranch & GORUCK Compared",
    description:
      "Compare the best bug out bags for survival. 5.11 RUSH72 vs Mystery Ranch 2-Day Assault vs GORUCK GR2 vs Kelty Redwing — capacity, durability, comfort, and MOLLE compatibility.",
    date: "2026-02-18",
    lastUpdated: "2026-02-18",
    category: "survival",
    heroImage:
      "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=1200&q=80",
    intro:
      "Your bug out bag is the single most important piece of emergency gear you own. When you have 15 minutes to grab one thing and go, this is it. But the wrong bag — too heavy, poorly organized, uncomfortable under load — becomes a liability instead of a lifeline. We've tested four of the top-rated tactical and adventure packs across durability, organization, comfort, and real-world usability to find the best bug out bags for every budget and scenario.",
    buyingGuideTitle: "How to Choose the Right Bug Out Bag",
    buyingGuide: [
      "Capacity: 40-55L is the sweet spot for a 72-hour bug out bag. Under 40L and you're leaving essentials behind. Over 55L and you're packing too much and slowing yourself down. Exception: if you're packing for a family or in cold climates, 55-72L gives room for extra gear.",
      "Weight (empty): Every ounce of pack weight is an ounce less for supplies. A 4-5 lb pack is reasonable for a tactical bag. Under 4 lbs is excellent. Over 6 lbs empty is too heavy unless you're carrying 50+ lbs of gear and need the frame support.",
      "Durability: 500D-1000D Cordura or equivalent nylon is the standard for bug out bags. Anything less wears through quickly. Look for reinforced stitching, YKK zippers, and bartack stress points. Your bag needs to survive being thrown, dragged, and rained on.",
      "MOLLE compatibility: MOLLE webbing lets you attach pouches, holsters, and gear externally. This is valuable for quick-access items and expanding capacity. Most tactical packs have MOLLE; hiking packs generally don't.",
      "Comfort under load: If you can't carry it for 10 miles, it's not a bug out bag — it's a car bag. Look for padded hip belts that transfer weight to your hips, adjustable torso length, and ventilated back panels. Test with 30+ lbs loaded.",
    ],
    verdict:
      "The 5.11 RUSH72 3.0 is the best overall bug out bag — 55L capacity, bomb-proof 1050D construction, excellent MOLLE coverage, and comfortable enough for extended carries. The Mystery Ranch 2-Day Assault is the premium choice with its patented 3-ZIP design and military heritage. The GORUCK GR2 is the most versatile option that doubles as travel luggage. The Kelty Redwing 50 is the best value at under $150 with surprising comfort for the price.",
    specLabels: [
      { key: "capacity", label: "Capacity" },
      { key: "material", label: "Material" },
      { key: "weight", label: "Weight (empty)" },
      { key: "molle", label: "MOLLE" },
      { key: "hipBelt", label: "Hip Belt" },
      { key: "access", label: "Access Points" },
    ],
    products: [
      {
        slug: "511-rush72-30",
        name: "5.11 Tactical RUSH72 3.0",
        image:
          "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600&q=80",
        price: "$220",
        rating: 4.8,
        reviewCount: 6700,
        affiliateUrl:
          "https://www.amazon.com/dp/B0D9R239MT?tag=prepperevo-20",
        badge: "Editor's Pick",
        verdict:
          "The best all-around bug out bag. 55L of organized space, 1050D nylon tank construction, full MOLLE coverage, and a hydration-compatible design. The go-to choice for serious preparedness.",
        pros: [
          "55L capacity — room for 72-hour kit",
          "1050D nylon — virtually indestructible",
          "Full MOLLE front and sides",
          "Padded hip belt with gear pockets",
        ],
        cons: [
          "5 lbs empty — heavier than hiking packs",
          "Tactical look draws attention in urban settings",
          "No built-in rain cover",
        ],
        specs: {
          capacity: "55L",
          material: "1050D nylon",
          weight: "5.0 lbs",
          molle: "Full front + side coverage",
          hipBelt: "Padded with pockets",
          access: "Top, front panel, side zips",
        },
      },
      {
        slug: "mystery-ranch-2day-assault",
        name: "Mystery Ranch 2-Day Assault Pack",
        image:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
        price: "$319",
        rating: 4.8,
        reviewCount: 2400,
        affiliateUrl:
          "https://www.amazon.com/dp/B0DTB48FW4?tag=prepperevo-20",
        badge: "Premium Pick",
        verdict:
          "Military-grade quality with the patented 3-ZIP design for full bag access. The best-fitting pack in this roundup thanks to the adjustable yoke. Worth the premium for heavy-load carries.",
        pros: [
          "3-ZIP design — opens flat for easy packing",
          "Adjustable yoke fits any torso",
          "Made for US Special Operations",
          "Lifetime warranty",
        ],
        cons: [
          "Expensive at $319",
          "27L may be small for full 72-hr kit",
          "Limited external MOLLE compared to RUSH72",
        ],
        specs: {
          capacity: "27L",
          material: "500D Cordura",
          weight: "3.6 lbs",
          molle: "Side panels",
          hipBelt: "Removable padded belt",
          access: "3-ZIP full front access",
        },
      },
      {
        slug: "goruck-gr2-40l",
        name: "GORUCK GR2 40L",
        image:
          "https://images.unsplash.com/photo-1581791534721-e599df4417f6?w=600&q=80",
        price: "$395",
        rating: 4.9,
        reviewCount: 1800,
        affiliateUrl:
          "https://www.amazon.com/dp/B0DDZPCXZD?tag=prepperevo-20",
        verdict:
          "The most versatile pack — works as a bug out bag, travel bag, and rucking pack. 1000D Cordura, clamshell opening, and a bombproof SCARS lifetime warranty. The gray man choice.",
        pros: [
          "Clamshell opening — packs like a suitcase",
          "1000D Cordura — overbuilt by design",
          "Doesn't look tactical — gray man approved",
          "SCARS lifetime warranty",
        ],
        cons: [
          "Most expensive at $395",
          "No external MOLLE",
          "No hip belt (rucking design)",
        ],
        specs: {
          capacity: "40L",
          material: "1000D Cordura",
          weight: "4.2 lbs",
          molle: "Internal only (3 rows external)",
          hipBelt: "None (removable available separately)",
          access: "Clamshell full open + top pocket",
        },
      },
      {
        slug: "kelty-redwing-50",
        name: "Kelty Redwing 50",
        image:
          "https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=600&q=80",
        price: "$140",
        rating: 4.6,
        reviewCount: 4200,
        affiliateUrl:
          "https://www.amazon.com/dp/B0DT2FZGYV?tag=prepperevo-20",
        badge: "Best Budget",
        verdict:
          "Incredible value at under $150. Not a tactical pack, but the hiking-style design is actually an advantage in urban scenarios — looks normal. Comfortable for long carries with proper hip belt.",
        pros: [
          "Under $150 — best value",
          "Comfortable hiking-style suspension",
          "Doesn't look tactical — blends in",
          "50L — fits full 72-hour kit",
        ],
        cons: [
          "No MOLLE — limited external attachment",
          "420D polyester — less durable than Cordura",
          "Not water-resistant without rain cover",
        ],
        specs: {
          capacity: "50L",
          material: "420D polyester",
          weight: "3.5 lbs",
          molle: "None",
          hipBelt: "Padded with wing design",
          access: "Top + U-zip front panel",
        },
      },
    ],
    faq: [
      {
        question: "How heavy should a loaded bug out bag be?",
        answer:
          "The general rule is no more than 20-25% of your body weight for a bag you need to carry long distances. For a 180 lb person, that's 36-45 lbs max. Most well-packed 72-hour bug out bags weigh 25-35 lbs. If yours weighs over 40 lbs, you're packing too much or packing too heavy. Focus on lightweight, multi-use items and cut luxury items ruthlessly.",
      },
      {
        question: "Should my bug out bag look tactical?",
        answer:
          "It depends on your scenario. In a disaster evacuation, a tactical bag screams 'I have supplies' and can make you a target. A normal-looking hiking pack or travel bag (like the GORUCK GR2 or Kelty Redwing) blends in — this is called 'gray man' strategy. In a wilderness bug out, tactical features like MOLLE are more useful. Many preppers keep a tactical pack for home and a gray man pack in their vehicle.",
      },
      {
        question: "What should I pack in a 72-hour bug out bag?",
        answer:
          "The essentials: Water (1L + filter like Sawyer Squeeze), food (3 days of calorie-dense bars or freeze-dried meals), shelter (tarp + emergency bivy or lightweight tent), fire (lighter + ferro rod + tinder), first aid kit, headlamp, knife, cordage (550 paracord), weather-appropriate clothing layers, cash ($200+ in small bills), copies of important documents, phone charger + battery bank. Total target: under 35 lbs.",
      },
      {
        question: "How often should I update my bug out bag?",
        answer:
          "Check your bag every 6 months minimum. Replace expired food, medications, and batteries. Swap clothing for the current season. Test your water filter and fire-starting gear. Update cash if needed. Many preppers do spring and fall gear checks — it takes 30 minutes and ensures your bag is actually ready when you need it.",
      },
    ],
  },
  {
    slug: "best-survival-knives-and-multitools",
    title: "Best Survival Knives & Multitools (2026)",
    metaTitle: "Best Survival Knives 2026 — Morakniv, ESEE, Benchmade & Leatherman",
    description:
      "Compare the best survival knives and multitools for preppers and overlanders. Morakniv Companion vs ESEE 4 vs Benchmade Bushcrafter vs Leatherman Signal — blade steel, durability, and field performance.",
    date: "2026-02-18",
    lastUpdated: "2026-02-18",
    category: "survival",
    heroImage:
      "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=1200&q=80",
    intro:
      "A reliable knife is the most fundamental survival tool. It builds shelter, processes food, makes fire, and handles a thousand other tasks nothing else can. But the survival knife market is flooded with mall-ninja junk and overpriced collectors' pieces. We've cut through the hype to compare four proven knives and multitools that professionals actually carry — from a $17 Swedish workhorse to a $190 bushcraft specialist.",
    buyingGuideTitle: "How to Choose a Survival Knife",
    buyingGuide: [
      "Fixed blade vs. multitool: A fixed-blade knife is stronger and more reliable for heavy tasks like batoning wood and shelter building. A multitool adds versatility (pliers, saw, screwdriver) at the cost of blade strength. Ideally, carry both — a fixed blade as your primary and a multitool for utility tasks.",
      "Blade steel: Carbon steel (1095, SK-5) is easier to sharpen in the field and throws sparks with a ferro rod, but it rusts without maintenance. Stainless steel (S30V, 14C28N) resists corrosion but is harder to sharpen. For survival, carbon steel's field-sharpenability usually wins.",
      "Full tang construction: A full tang knife has the steel running the entire length of the handle — it can't snap at the handle junction. This is non-negotiable for any knife you'll baton or pry with. Avoid partial tang knives for survival use.",
      "Blade length: 4-5 inches is the sweet spot for survival knives. Long enough to baton firewood, short enough for fine carving. Under 4 inches limits utility; over 6 inches adds weight without benefit for most tasks.",
      "Sheath quality: Your knife is useless if you can't carry it securely. Look for Kydex or molded polymer sheaths with positive retention. Leather sheaths look nice but absorb moisture and can dull the blade over time. Belt carry or MOLLE-compatible mounting is essential.",
    ],
    verdict:
      "The Morakniv Companion is the best value in survival knives — period. At $17, it outperforms knives ten times its price. The ESEE 4 is the premium pick for hard use with its legendary no-questions-asked warranty. The Benchmade Bushcrafter 162 is the best choice for dedicated bushcraft and wood processing. The Leatherman Signal is the best multitool for survival with its built-in ferro rod and whistle.",
    specLabels: [
      { key: "bladeSteel", label: "Blade Steel" },
      { key: "bladeLength", label: "Blade Length" },
      { key: "tang", label: "Tang" },
      { key: "weight", label: "Weight" },
      { key: "sheath", label: "Sheath" },
      { key: "made", label: "Made In" },
    ],
    products: [
      {
        slug: "morakniv-companion",
        name: "Morakniv Companion HD",
        image:
          "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=600&q=80",
        price: "$17",
        rating: 4.8,
        reviewCount: 32000,
        affiliateUrl:
          "https://www.amazon.com/dp/B004TNWD40?tag=prepperevo-20",
        badge: "Best Value",
        verdict:
          "The most knife you can get for $17 — or any price. Swedish stainless steel holds an edge well, the Scandi grind is dead simple to sharpen on a rock, and it just works. Buy three: one for your bag, car, and kitchen drawer.",
        pros: [
          "$17 — buy multiples for redundancy",
          "Scandi grind — easiest to field sharpen",
          "Swedish stainless resists corrosion",
          "Comfortable rubber grip even when wet",
        ],
        cons: [
          "Not full tang — won't survive heavy batoning",
          "Plastic sheath is functional but basic",
          "Blade is 4.1\" — slightly short for some tasks",
        ],
        specs: {
          bladeSteel: "Swedish stainless (12C27)",
          bladeLength: "4.1 inches",
          tang: "Partial (rat-tail)",
          weight: "4.1 oz",
          sheath: "Molded polymer clip-on",
          made: "Sweden",
        },
      },
      {
        slug: "esee-4",
        name: "ESEE 4P",
        image:
          "https://images.unsplash.com/photo-1541976844346-f18aeac57b06?w=600&q=80",
        price: "$130",
        rating: 4.9,
        reviewCount: 3800,
        affiliateUrl:
          "https://www.amazon.com/dp/B0848RXQ1W?tag=prepperevo-20",
        badge: "Editor's Pick",
        verdict:
          "The indestructible survival knife. 1095 carbon steel, full tang, and the most legendary warranty in the knife world — ESEE will replace it for any reason, forever. The knife hard-use professionals trust.",
        pros: [
          "Full tang 1095 carbon steel — bombproof",
          "No-questions-asked lifetime warranty",
          "Throws sparks with ferro rod",
          "Textured Micarta handles — no slip",
        ],
        cons: [
          "Carbon steel requires oiling to prevent rust",
          "Heavier at 8 oz",
          "$130 — but backed by lifetime warranty",
        ],
        specs: {
          bladeSteel: "1095 carbon steel",
          bladeLength: "4.5 inches",
          tang: "Full tang",
          weight: "8.0 oz",
          sheath: "Molded Kydex with MOLLE clip",
          made: "USA",
        },
      },
      {
        slug: "benchmade-bushcrafter-162",
        name: "Benchmade Bushcrafter 162",
        image:
          "https://images.unsplash.com/photo-1590080876236-86bde1f0b7d5?w=600&q=80",
        price: "$190",
        rating: 4.7,
        reviewCount: 1200,
        affiliateUrl:
          "https://www.amazon.com/dp/B00B0E1MB6?tag=prepperevo-20",
        badge: "Best Bushcraft",
        verdict:
          "The finest bushcraft knife you can buy. S30V steel holds an edge incredibly long, the drop-point blade excels at wood carving and fire prep, and the leather sheath is a work of art. For dedicated wilderness skills.",
        pros: [
          "S30V steel — exceptional edge retention",
          "Drop-point — ideal for carving and fire prep",
          "Full tang with contoured G10 handles",
          "Premium leather sheath included",
        ],
        cons: [
          "Most expensive at $190",
          "S30V harder to field sharpen than carbon",
          "Stainless won't throw sparks with ferro rod",
        ],
        specs: {
          bladeSteel: "CPM-S30V stainless",
          bladeLength: "4.4 inches",
          tang: "Full tang",
          weight: "7.7 oz",
          sheath: "Leather with belt loop",
          made: "USA",
        },
      },
      {
        slug: "leatherman-signal",
        name: "Leatherman Signal",
        image:
          "https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=600&q=80",
        price: "$130",
        rating: 4.7,
        reviewCount: 5400,
        affiliateUrl:
          "https://www.amazon.com/dp/B07B8BJYKN?tag=prepperevo-20",
        badge: "Best Multitool",
        verdict:
          "The only multitool designed specifically for survival. Built-in ferro rod, emergency whistle, and a diamond sharpener alongside the standard pliers, saw, and blade. The ultimate backup tool for any bug out bag.",
        pros: [
          "19 tools including ferro rod + whistle",
          "420HC blade + saw + hammer",
          "Built-in diamond sharpener",
          "25-year warranty",
        ],
        cons: [
          "Not a replacement for a fixed blade",
          "7.5 oz — heavier than a basic multitool",
          "Ferro rod is small — works but limited",
        ],
        specs: {
          bladeSteel: "420HC stainless",
          bladeLength: "2.73 inches",
          tang: "N/A (folding)",
          weight: "7.5 oz",
          sheath: "Nylon belt sheath",
          made: "USA",
        },
      },
    ],
    faq: [
      {
        question: "What's the best knife steel for survival?",
        answer:
          "For survival, 1095 carbon steel is hard to beat. It's tough enough to baton wood, easy to sharpen on a flat rock, and throws sparks off a ferro rod for fire starting. The downside is rust — you need to keep it oiled. If you want low maintenance, 12C27 stainless (Morakniv) or S30V (Benchmade) resist corrosion but are harder to sharpen in the field. Most survival instructors prefer carbon steel.",
      },
      {
        question: "Do I need a survival knife if I have a multitool?",
        answer:
          "Yes. A multitool blade is too short and thin for heavy survival tasks — batoning firewood, splitting kindling, building shelter, or processing game. The Leatherman Signal is an excellent backup and utility tool, but it can't replace a 4-5 inch fixed blade for primary survival knife duties. The ideal setup is a fixed-blade knife as your primary and a multitool as your secondary.",
      },
      {
        question: "How do I sharpen a knife in the field?",
        answer:
          "Look for a flat, smooth river rock with a fine grain — sandstone or slate works well. Wet the rock, hold the blade at a consistent 20-degree angle, and stroke the blade across the rock in one direction (away from you). Do 10-15 strokes per side, alternating. A Scandi-grind knife (like the Morakniv) is the easiest to sharpen this way — just lay the bevel flat on the stone.",
      },
      {
        question: "Is a $17 Morakniv really good enough for survival?",
        answer:
          "Absolutely. The Morakniv Companion is the most-recommended beginner survival knife by professional bushcraft instructors worldwide. The Swedish stainless steel takes and holds a working edge, the Scandi grind is the easiest to maintain, and the rubber handle won't slip when wet. Its one real limitation is the partial tang — it won't survive aggressive batoning. For that, step up to the ESEE 4. But for everything else, the Morakniv punches absurdly above its weight.",
      },
    ],
  },
  {
    slug: "best-emergency-communication-devices",
    title: "Best Emergency Communication Devices (2026)",
    metaTitle: "Best Emergency Comms 2026 — Garmin inReach, Midland & Baofeng",
    description:
      "Compare the best emergency communication devices for preppers and overlanders. Garmin inReach Mini 2 vs Midland GXT1000VP4 vs Baofeng UV-5R vs Zoleo — satellite, GMRS, and ham radio options.",
    date: "2026-02-18",
    lastUpdated: "2026-02-18",
    category: "survival",
    heroImage:
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80",
    intro:
      "When cell towers go down — and they will in any serious emergency — your ability to call for help, coordinate with your group, and get weather updates depends entirely on your communication gear. There's no single device that does it all: satellite messengers need subscriptions but work anywhere on Earth, GMRS radios are license-free and great for group coordination, and ham radios offer the most range and flexibility. We've compared the best options across each category to help you build a layered communication plan.",
    buyingGuideTitle: "Building a Layered Communication Plan",
    buyingGuide: [
      "Satellite messenger first: This is your lifeline. Devices like the Garmin inReach work anywhere on Earth via satellite — no cell towers needed. Two-way messaging and SOS with search-and-rescue coordination. The monthly subscription ($12-50) is the cost of true emergency communication.",
      "GMRS radios for group communication: GMRS radios operate on UHF frequencies with 1-5 mile range (up to 25+ miles with repeaters). No license exam required — just register online with the FCC ($35 for 10 years). Ideal for family/group coordination during emergencies or on the trail.",
      "Ham radio for maximum range: Ham (amateur radio) requires passing a license exam but gives you access to local repeater networks with 50+ mile range and HF frequencies that reach worldwide. The Baofeng UV-5R is the entry point — under $30 and surprisingly capable.",
      "Redundancy is key: No single device covers all scenarios. A layered approach — satellite messenger + GMRS radio + ham radio — gives you global SOS capability, local group coordination, and regional communication. Budget at minimum: satellite messenger + one radio type.",
      "Power planning: All communication devices need power. The Garmin inReach Mini 2 lasts 14 days on a charge. Radios drain batteries faster during transmit. Carry spare batteries and a small solar panel or power bank to keep your comms alive for extended emergencies.",
    ],
    verdict:
      "The Garmin inReach Mini 2 is the most critical device — it provides global SOS and two-way messaging via satellite when nothing else works. The Midland GXT1000VP4 is the best group communication radio with no exam required. The Baofeng UV-5R is the cheapest entry into ham radio for preppers willing to get licensed. The Zoleo Satellite Communicator offers the best value satellite messaging if you already carry your phone.",
    specLabels: [
      { key: "type", label: "Type" },
      { key: "range", label: "Range" },
      { key: "license", label: "License Required" },
      { key: "battery", label: "Battery Life" },
      { key: "subscription", label: "Subscription" },
      { key: "waterproof", label: "Waterproof" },
    ],
    products: [
      {
        slug: "garmin-inreach-mini-2",
        name: "Garmin inReach Mini 2",
        image:
          "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
        price: "$400",
        rating: 4.7,
        reviewCount: 4200,
        affiliateUrl:
          "https://www.amazon.com/dp/B09X47TGDJ?tag=prepperevo-20",
        badge: "Editor's Pick",
        verdict:
          "The single most important emergency communication device you can own. Global satellite SOS, two-way text messaging, weather updates, and GPS tracking — all in a 3.5 oz package that works anywhere on Earth.",
        pros: [
          "Global coverage — works anywhere via Iridium satellites",
          "Two-way messaging + interactive SOS",
          "14-day battery life (10-min tracking)",
          "Only 3.5 oz — smallest satellite messenger",
        ],
        cons: [
          "Requires subscription ($14.95-65/month)",
          "$400 upfront cost",
          "Text only — no voice communication",
        ],
        specs: {
          type: "Satellite messenger",
          range: "Global (Iridium satellite network)",
          license: "No",
          battery: "Up to 14 days",
          subscription: "$14.95-65/month (Garmin plans)",
          waterproof: "IPX7",
        },
      },
      {
        slug: "midland-gxt1000vp4",
        name: "Midland GXT1000VP4 (pair)",
        image:
          "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
        price: "$80",
        rating: 4.4,
        reviewCount: 9800,
        affiliateUrl:
          "https://www.amazon.com/dp/B001WMFYH4?tag=prepperevo-20",
        badge: "Best Group Radio",
        verdict:
          "The best GMRS radio for family and group communication. Comes as a pair, includes rechargeable batteries and charger, and the 50-channel system with privacy codes keeps your conversations clear. No exam needed.",
        pros: [
          "Comes as a pair with batteries + charger",
          "50 GMRS channels + 142 privacy codes",
          "NOAA weather alerts built in",
          "No license exam — just $35 FCC registration",
        ],
        cons: [
          "Realistic range: 1-3 miles (not the advertised 36)",
          "UHF only — limited to line-of-sight",
          "Bulkier than compact ham radios",
        ],
        specs: {
          type: "GMRS two-way radio",
          range: "1-5 miles (up to 36 with repeater)",
          license: "GMRS registration ($35/10 years, no exam)",
          battery: "10 hours (rechargeable NiMH)",
          subscription: "None",
          waterproof: "JIS4 (splash resistant)",
        },
      },
      {
        slug: "baofeng-uv-5r",
        name: "Baofeng UV-5R",
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
        price: "$28",
        rating: 4.4,
        reviewCount: 42000,
        affiliateUrl:
          "https://www.amazon.com/dp/B09HZK4KGK?tag=prepperevo-20",
        badge: "Best Budget",
        verdict:
          "The cheapest entry into ham radio. Dual-band VHF/UHF covers local repeaters with 5+ mile range, and it can also receive NOAA weather, GMRS, and FRS frequencies. At $28, buy two — one for your bag, one as a spare.",
        pros: [
          "Only $28 — cheapest ham radio available",
          "Dual-band VHF + UHF",
          "5W output — hits most local repeaters",
          "Huge aftermarket for antennas + accessories",
        ],
        cons: [
          "Requires ham radio license to transmit (Technician class)",
          "Menu system is confusing",
          "Cheap build quality — not waterproof",
        ],
        specs: {
          type: "Dual-band ham radio (VHF/UHF)",
          range: "2-5 miles (50+ with repeater)",
          license: "Ham Technician license (exam required)",
          battery: "8-12 hours",
          subscription: "None",
          waterproof: "No",
        },
      },
      {
        slug: "zoleo-satellite-communicator",
        name: "Zoleo Satellite Communicator",
        image:
          "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=80",
        price: "$200",
        rating: 4.5,
        reviewCount: 2800,
        affiliateUrl:
          "https://www.amazon.com/dp/B07X59RH7T?tag=prepperevo-20",
        verdict:
          "The best-value satellite communicator. Works with your phone via Bluetooth for easy messaging, with standalone SOS when your phone dies. Lower subscription costs than Garmin make it more affordable long-term.",
        pros: [
          "$200 — half the price of Garmin inReach",
          "Lower subscription plans ($20/month basic)",
          "Smart message routing (cellular → WiFi → satellite)",
          "SOS works without phone connection",
        ],
        cons: [
          "Larger and heavier than inReach Mini 2",
          "Requires phone for best messaging experience",
          "No built-in GPS tracking/navigation",
        ],
        specs: {
          type: "Satellite messenger",
          range: "Global (Iridium satellite network)",
          license: "No",
          battery: "200+ hours (standby)",
          subscription: "$20-50/month",
          waterproof: "IP68",
        },
      },
    ],
    faq: [
      {
        question: "Do I really need a satellite messenger?",
        answer:
          "If you spend time off-grid — overlanding, hiking, camping — yes. Cell service disappears quickly outside urban areas, and in a major emergency (hurricane, earthquake, wildfire), cell towers fail even in cities. A satellite messenger is the only device that works anywhere on Earth regardless of infrastructure. The Garmin inReach Mini 2's SOS has coordinated thousands of real rescues. The subscription cost is cheap insurance.",
      },
      {
        question: "What's the difference between GMRS, FRS, and ham radio?",
        answer:
          "FRS (Family Radio Service) is the walkie-talkie standard — low power, no license, 0.5-1 mile range. GMRS (General Mobile Radio Service) is higher power with 1-5 mile range and requires a simple $35 FCC registration (no exam). Ham (amateur radio) requires passing a license exam but gives you access to powerful repeater networks with 50+ mile range and worldwide communication capability on HF bands.",
      },
      {
        question: "Is it legal to use a Baofeng UV-5R without a license?",
        answer:
          "You can listen to anything — that's always legal. But to transmit on ham frequencies, you need a Technician class ham radio license. The exam is 35 multiple-choice questions and costs about $15. Study for a week using free online resources (hamstudy.org) and most people pass on the first try. In a life-threatening emergency, FCC rules allow unlicensed transmission on any frequency — but get your license now, not during a crisis.",
      },
      {
        question: "How far can two-way radios really reach?",
        answer:
          "Ignore the 'up to 36 mile range' claims on packaging — that's measured peak-to-peak in perfect conditions. In reality: FRS radios get 0.5-1 mile, GMRS radios get 1-5 miles, and handheld ham radios get 2-5 miles (all in typical terrain). To extend range dramatically, use repeaters. A GMRS repeater can give you 25+ miles. Ham repeaters on mountaintops cover entire metro areas. Line-of-sight is everything — elevation is your friend.",
      },
    ],
  },
  {
    slug: "best-overlanding-fridges-and-coolers",
    title: "Best Overlanding Fridges & Coolers (2026)",
    metaTitle: "Best 12V Overlanding Fridges 2026 — Dometic, ARB & BougeRV",
    description:
      "Compare the best 12V overlanding fridges and coolers. Dometic CFX3 55IM vs ARB Elements vs BougeRV vs Iceco VL60 — cooling performance, power draw, capacity, and value.",
    date: "2026-02-18",
    lastUpdated: "2026-02-18",
    category: "overlanding",
    heroImage:
      "https://images.unsplash.com/photo-1571407921906-1aae6f681c9a?w=1200&q=80",
    intro:
      "A 12V fridge changes overlanding from 'weekend cooler trips' to 'live off-grid indefinitely.' No more melted ice, soggy food, or gas station stops. A proper compressor fridge keeps your food at fridge or freezer temps for days on a single charge — powered by your vehicle battery, power station, or solar panels. We've compared the top 12V fridges from proven brands to the best budget options that have been quietly eating market share.",
    buyingGuideTitle: "How to Choose an Overlanding Fridge",
    buyingGuide: [
      "Capacity (liters): 35-45L is enough for a solo or couple for 3-5 days. 50-60L is the sweet spot for couples or families who want a week of fresh food. 75L+ is for extended trips or groups. Measure your vehicle's cargo area before buying — these fridges are bigger than you think.",
      "Power consumption: A good 12V fridge draws 30-50W when the compressor is running, but the compressor cycles on and off. Actual 24-hour consumption is typically 15-35Ah depending on ambient temperature and how often you open the lid. Look for fridges with efficient compressors and good insulation.",
      "Dual-zone vs. single: Dual-zone fridges have separate fridge and freezer compartments with independent temperature controls. This lets you keep drinks cold and meat frozen simultaneously. Single-zone is simpler and usually cheaper.",
      "Battery protection: A good overlanding fridge has built-in low-voltage cutoff that shuts down before it drains your vehicle's starting battery. Most quality fridges offer 3 settings: low (cuts at 11.8V), medium (12.0V), and high (12.2V). Always use this feature.",
      "Build quality for off-road: Your fridge will bounce around on rough trails. Look for reinforced corners, solid latches, heavy-duty handles, and robust compressors designed for vibration. Cheap fridges fail compressors from off-road vibration — this is where brand reputation matters.",
    ],
    verdict:
      "The Dometic CFX3 55IM is the best overall overlanding fridge — the built-in ice maker is a game-changer, and Dometic's compressor reliability is proven over decades. The ARB Elements is the toughest fridge built specifically for extreme off-road use. The BougeRV 12V Fridge is the best budget option that's been surprising overlanders with its quality. The Iceco VL60 is the best dual-zone for the price.",
    specLabels: [
      { key: "capacity", label: "Capacity" },
      { key: "zones", label: "Zones" },
      { key: "tempRange", label: "Temp Range" },
      { key: "power", label: "Power Draw" },
      { key: "weight", label: "Weight" },
      { key: "compressor", label: "Compressor" },
    ],
    products: [
      {
        slug: "dometic-cfx3-55im",
        name: "Dometic CFX3 55IM",
        image:
          "https://images.unsplash.com/photo-1571407921906-1aae6f681c9a?w=600&q=80",
        price: "$1,350",
        rating: 4.7,
        reviewCount: 1800,
        affiliateUrl:
          "https://www.amazon.com/dp/B083G3NBNZ?tag=prepperevo-20",
        badge: "Editor's Pick",
        verdict:
          "The best overlanding fridge — period. Built-in ice maker, WiFi app control, and Dometic's legendary VMSO3 compressor that handles any temperature and terrain. The ice maker alone justifies the premium.",
        pros: [
          "Built-in ice maker — cold drinks anywhere",
          "WiFi app for monitoring from phone",
          "VMSO3 compressor — proven reliability",
          "ExoFrame construction — off-road tough",
        ],
        cons: [
          "Expensive at $1,350",
          "53L — ice maker takes some usable space",
          "46 lbs — needs a solid mounting solution",
        ],
        specs: {
          capacity: "53L (1.87 cu ft)",
          zones: "Single zone + ice maker",
          tempRange: "-7°F to 50°F",
          power: "45W (avg 1.3Ah/hr)",
          weight: "46 lbs",
          compressor: "Dometic VMSO3",
        },
      },
      {
        slug: "arb-elements-fridge",
        name: "ARB Elements 60L Fridge Freezer",
        image:
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
        price: "$1,450",
        rating: 4.8,
        reviewCount: 950,
        affiliateUrl:
          "https://www.amazon.com/dp/B07Q75PB68?tag=prepperevo-20",
        badge: "Toughest Build",
        verdict:
          "The toughest overlanding fridge money can buy. IP44 dust and splash proof, stainless steel latches, and impact-resistant housing designed for the most brutal off-road conditions. Australian engineering at its finest.",
        pros: [
          "IP44 rated — dust and splash proof",
          "Stainless steel hardware — won't corrode",
          "Secop compressor — whisper quiet",
          "60L capacity — great for extended trips",
        ],
        cons: [
          "Most expensive at $1,450",
          "52 lbs — heaviest option",
          "Single zone only",
        ],
        specs: {
          capacity: "60L (2.12 cu ft)",
          zones: "Single zone",
          tempRange: "0°F to 50°F",
          power: "40W (avg 1.0Ah/hr)",
          weight: "52 lbs",
          compressor: "Secop (Danfoss)",
        },
      },
      {
        slug: "bougerv-12v-fridge-53qt",
        name: "BougeRV 12V Portable Fridge 53Qt",
        image:
          "https://images.unsplash.com/photo-1486673748761-a8d18475c757?w=600&q=80",
        price: "$340",
        rating: 4.5,
        reviewCount: 8200,
        affiliateUrl:
          "https://www.amazon.com/dp/B0BPM7C8RT?tag=prepperevo-20",
        badge: "Best Budget",
        verdict:
          "The budget overlanding fridge that's been shocking the community with its quality. At $340, it costs less than a premium cooler and actually keeps food cold without ice. Incredible value for new overlanders.",
        pros: [
          "$340 — fraction of premium fridge prices",
          "50L capacity — competitive with $1,000+ options",
          "Fast cooling — reaches 32°F in 15 min",
          "Low power draw for the price",
        ],
        cons: [
          "Compressor louder than Dometic or ARB",
          "Plastic build — less durable off-road",
          "No WiFi or app control",
        ],
        specs: {
          capacity: "50L (53 quart)",
          zones: "Single zone",
          tempRange: "0°F to 50°F",
          power: "45W (avg 1.5Ah/hr)",
          weight: "38 lbs",
          compressor: "Generic (LG-type)",
        },
      },
      {
        slug: "iceco-vl60-dual-zone",
        name: "Iceco VL60 Dual Zone",
        image:
          "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&q=80",
        price: "$600",
        rating: 4.6,
        reviewCount: 3400,
        affiliateUrl:
          "https://www.amazon.com/dp/B07TXG7G1Y?tag=prepperevo-20",
        badge: "Best Dual-Zone",
        verdict:
          "The best dual-zone fridge for the price. Run one side as a fridge and the other as a freezer simultaneously. Secop compressor provides premium reliability at a mid-range price point.",
        pros: [
          "True dual-zone — independent fridge + freezer",
          "Secop compressor — same as $1,400 fridges",
          "$600 — excellent value for dual-zone",
          "Adjustable divider for flexible capacity",
        ],
        cons: [
          "60L total split between zones",
          "Heavier at 48 lbs",
          "Less insulation than premium brands",
        ],
        specs: {
          capacity: "60L (split between zones)",
          zones: "Dual zone (independent control)",
          tempRange: "-4°F to 68°F",
          power: "45W (avg 1.2Ah/hr)",
          weight: "48 lbs",
          compressor: "Secop (Danfoss)",
        },
      },
    ],
    faq: [
      {
        question: "Will a 12V fridge drain my car battery?",
        answer:
          "Not if it has proper battery protection — and all quality 12V fridges do. The built-in low-voltage cutoff shuts the fridge down before your starting battery drops below safe levels (typically 11.8-12.0V). For extended camping without driving, use a dedicated auxiliary battery or portable power station instead of your starting battery. Running the fridge off a 100Ah auxiliary battery gives you roughly 3-5 days of cooling.",
      },
      {
        question: "How much solar do I need to run a 12V fridge?",
        answer:
          "A typical 12V fridge uses 15-35Ah per day. A 100W solar panel produces roughly 30-40Ah per day in good sun. So one 100W panel is usually enough to keep your fridge running indefinitely in sunny conditions. Add a 200W panel if you also charge phones and run lights. In cloudy weather or winter, you'll need more solar or supplemental charging from driving.",
      },
      {
        question: "Is a 12V fridge worth it over a high-end cooler?",
        answer:
          "For weekend trips, a quality cooler like a YETI works fine. For trips longer than 3 days, a 12V fridge pays for itself in convenience and food quality. No buying ice, no draining melt water, no soggy food, and your food stays at consistent safe temperatures. The BougeRV at $340 costs less than a YETI 65 and doesn't need ice — ever. For regular overlanders, a 12V fridge is transformative.",
      },
      {
        question: "What size fridge do I need?",
        answer:
          "Solo or couple for 3-5 days: 35-45L. Couple for a week: 50-60L. Family or extended trips: 60-80L. A practical tip: measure in groceries. A 50L fridge holds roughly two grocery bags of food plus drinks. A 60L dual-zone gives you about 40L of fridge space and 20L of freezer — enough to keep meat frozen and veggies cold for a full week.",
      },
    ],
  },
  {
    slug: "best-lifepo4-power-stations",
    title: "Best LiFePO4 Power Stations for Overlanding & Emergencies (2026)",
    metaTitle: "Best LiFePO4 Power Stations 2026 — Bluetti, EcoFlow & Jackery",
    description:
      "Compare the best LiFePO4 power stations for overlanding and home backup. Bluetti AC200PL vs EcoFlow DELTA Pro 3 vs Jackery Explorer 2000 Plus vs VTOMAN FlashSpeed 1500 — capacity, cycle life, and value.",
    date: "2026-02-18",
    lastUpdated: "2026-02-18",
    category: "overlanding",
    heroImage:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
    intro:
      "LiFePO4 (lithium iron phosphate) power stations represent the biggest leap in portable power in years. Unlike standard lithium-ion, LiFePO4 batteries last 3,000-4,000+ charge cycles, handle extreme temperatures better, and are inherently safer — no thermal runaway risk. For overlanders and preppers who depend on their power station daily or need whole-home backup during outages, LiFePO4 is the only chemistry worth buying in 2026. We've compared four of the best across capacity, expandability, and real-world performance.",
    buyingGuideTitle: "Why LiFePO4 and How to Choose",
    buyingGuide: [
      "LiFePO4 vs. lithium-ion: LiFePO4 lasts 4,000+ cycles to 80% capacity vs. 500-800 for lithium-ion. At one charge per day, that's 10+ years of daily use. LiFePO4 is also safer (no thermal runaway), performs better in cold, and retains more capacity over time. The only downside is slightly more weight per Wh.",
      "Capacity (Wh) sizing: A 12V fridge uses ~500Wh/day. A CPAP uses ~200Wh/night. Charging devices: ~50-100Wh/day. For overlanding, 1000-2000Wh covers most needs. For home backup, 2000Wh+ handles essentials (fridge, lights, devices) for 12-24 hours.",
      "Expandable systems: If you might need more power later, choose a station that accepts expansion batteries. The EcoFlow DELTA Pro 3 expands to 48kWh — enough to power a home for days. Jackery 2000 Plus expands to 12kWh. Buying expandable now saves you from replacing the entire system later.",
      "Solar charging speed: Faster solar input means more energy harvested per day. The EcoFlow DELTA Pro 3 accepts 2400W solar input. Bluetti AC200PL accepts 1200W. In practice, most overlanders run 200-400W of panels, but higher input capacity means faster recovery on cloudy days.",
      "UPS (Uninterruptible Power Supply) mode: Some stations can function as a UPS for your home — when grid power fails, they switch to battery in under 20ms, keeping your fridge and internet running without interruption. The EcoFlow DELTA Pro 3 and Bluetti AC200PL both offer this.",
    ],
    verdict:
      "The Jackery Explorer 2000 Plus is the best overall value — 2042Wh of LiFePO4, expandable to 12kWh, and fast charging at a competitive price. The EcoFlow DELTA Pro 3 is the premium pick for home backup with its 4000W output, 120/240V split-phase, and expandability to 48kWh. The Bluetti AC200PL is the best mid-range option with excellent expandability. The VTOMAN FlashSpeed 1500 is the best budget LiFePO4 station with a built-in MPPT controller.",
    specLabels: [
      { key: "capacity", label: "Capacity" },
      { key: "output", label: "AC Output" },
      { key: "cycles", label: "Cycle Life" },
      { key: "solar", label: "Solar Input" },
      { key: "expandable", label: "Expandable To" },
      { key: "weight", label: "Weight" },
    ],
    products: [
      {
        slug: "jackery-explorer-2000-plus",
        name: "Jackery Explorer 2000 Plus",
        image:
          "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=600&q=80",
        price: "$1,499",
        rating: 4.7,
        reviewCount: 3200,
        affiliateUrl:
          "https://www.amazon.com/dp/B0C6DHK68Q?tag=prepperevo-20",
        badge: "Best Value",
        verdict:
          "The best value in high-capacity LiFePO4 power stations. 2042Wh, expandable to a massive 12kWh, with 3000W output that handles everything short of central AC. Outstanding for both overlanding and home backup.",
        pros: [
          "2042Wh capacity — runs a fridge for 3+ days",
          "Expandable to 12kWh with add-on batteries",
          "3000W output (6000W surge)",
          "Fast wall charge — 0-100% in 2 hours",
        ],
        cons: [
          "61.5 lbs — not easily portable",
          "1200W max solar input",
          "App connectivity can be inconsistent",
        ],
        specs: {
          capacity: "2042Wh",
          output: "3000W (6000W surge)",
          cycles: "4000+ to 70%",
          solar: "1200W max",
          expandable: "12kWh (5 add-on batteries)",
          weight: "61.5 lbs",
        },
      },
      {
        slug: "ecoflow-delta-pro",
        name: "EcoFlow DELTA Pro",
        image:
          "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
        price: "$2,299",
        rating: 4.6,
        reviewCount: 5600,
        affiliateUrl:
          "https://www.amazon.com/dp/B0C1Z4GLKS?tag=prepperevo-20",
        badge: "Still Great",
        verdict:
          "The previous generation home backup king — still widely used and proven. 3600W output, 1600W solar input, and Smart Home Panel integration. Often available at steep discounts now.",
        pros: [
          "3600W output — runs heavy appliances",
          "1600W solar — fast off-grid charging",
          "Smart Home Panel integration",
          "Expandable to 10.8kWh",
        ],
        cons: [
          "Previous gen — DELTA Pro 3 is the successor",
          "99 lbs — needs the wheels",
          "3500 cycles (less than newer models)",
        ],
        specs: {
          capacity: "3600Wh",
          output: "3600W (7200W surge)",
          cycles: "3500+ to 80%",
          solar: "1600W max",
          expandable: "10.8kWh (2 extra batteries)",
          weight: "99 lbs",
        },
      },
      {
        slug: "ecoflow-delta-pro-3",
        name: "EcoFlow DELTA Pro 3",
        image:
          "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
        price: "$2,799",
        rating: 4.7,
        reviewCount: 2400,
        affiliateUrl:
          "https://www.amazon.com/dp/B0D14FMFZD?tag=prepperevo-20",
        badge: "Best Home Backup",
        verdict:
          "The most capable power station for whole-home backup. 4000W output with 120/240V split-phase runs everything including 3-ton AC units. Expandable to a massive 48kWh. Smart Home Panel 2 integration makes it a true home battery replacement.",
        pros: [
          "4000W output — runs 3-ton AC units",
          "120/240V split-phase — true home backup",
          "Expandable to 48kWh",
          "2400W solar input — fastest in class",
        ],
        cons: [
          "Premium price at $2,799",
          "Heavy — needs permanent placement",
          "Overkill for casual overlanding",
        ],
        specs: {
          capacity: "4096Wh",
          output: "4000W (8000W surge)",
          cycles: "4000+ to 80%",
          solar: "2400W max",
          expandable: "48kWh (11 extra batteries)",
          weight: "62 lbs",
        },
      },
      {
        slug: "bluetti-ac200pl",
        name: "Bluetti AC200PL",
        image:
          "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600&q=80",
        price: "$1,599",
        rating: 4.6,
        reviewCount: 2800,
        affiliateUrl:
          "https://www.amazon.com/dp/B0D17CW6KK?tag=prepperevo-20",
        verdict:
          "The AC200MAX successor with more power and faster charging. 2304Wh base expandable to 8448Wh. 2400W output with 3600W power lifting handles heavy loads. 30A TT-30 RV port included.",
        pros: [
          "Expandable to 8448Wh with B300 batteries",
          "2400W output (3600W power lifting)",
          "30A TT-30 RV port included",
          "UPS mode for home backup",
        ],
        cons: [
          "2304Wh base — less than Jackery 2000 Plus",
          "1200W solar input — still slower than EcoFlow",
          "62 lbs base unit",
        ],
        specs: {
          capacity: "2304Wh",
          output: "2400W (3600W power lifting)",
          cycles: "3000+ to 80%",
          solar: "1200W max",
          expandable: "8448Wh (with 2x B300)",
          weight: "62 lbs",
        },
      },
      {
        slug: "vtoman-flashspeed-1500",
        name: "VTOMAN FlashSpeed 1500",
        image:
          "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
        price: "$899",
        rating: 4.5,
        reviewCount: 1600,
        affiliateUrl:
          "https://www.amazon.com/dp/B0C8T2C8DB?tag=prepperevo-20",
        badge: "Budget Pick",
        verdict:
          "The best budget LiFePO4 power station. At $899 for 1548Wh, it delivers premium battery chemistry at a mid-range price. Built-in MPPT solar controller and stackable expansion make it surprisingly versatile.",
        pros: [
          "$899 — most affordable LiFePO4 in this class",
          "1548Wh with LiFePO4 chemistry",
          "Built-in MPPT solar controller",
          "Stackable expansion battery available",
        ],
        cons: [
          "1500W output — less than premium options",
          "400W max solar input",
          "Less brand recognition than competitors",
        ],
        specs: {
          capacity: "1548Wh",
          output: "1500W (3000W surge)",
          cycles: "3000+ to 80%",
          solar: "400W max",
          expandable: "3096Wh (with expansion)",
          weight: "48 lbs",
        },
      },
    ],
    faq: [
      {
        question: "Is LiFePO4 really worth the extra cost?",
        answer:
          "Absolutely. A LiFePO4 station lasts 4,000+ cycles vs 500-800 for lithium-ion. If you charge daily, that's 10+ years vs 1.5-2 years. Over its lifetime, a $1,500 LiFePO4 station costs about $0.37 per cycle. A $800 lithium-ion station at 500 cycles costs $1.60 per cycle. LiFePO4 is dramatically cheaper long-term and you're not buying a new station every 2 years.",
      },
      {
        question: "Can I use a power station as whole-home backup?",
        answer:
          "Yes, with the right capacity. A typical US home uses 30kWh/day, but in an outage you only need essentials: fridge (1.5-3kWh/day), lights (0.5kWh), router (0.3kWh), phones (0.1kWh). That's about 2-4kWh/day for essentials. The EcoFlow DELTA Pro 3 expanded to 48kWh could power essentials for over a week. The Jackery 2000 Plus expanded to 12kWh is the best value option. Add solar panels and you can run indefinitely.",
      },
      {
        question: "How long do LiFePO4 power stations last?",
        answer:
          "LiFePO4 batteries retain 80% capacity after 3,000-4,000 cycles, and they continue working beyond that — just with gradually reduced capacity. At one cycle per day, that's 8-11 years to 80%. At one cycle per week (typical weekend overlander), that's 57-76 years. The electronics will likely fail before the battery does. For practical purposes, a LiFePO4 station is a 10-15+ year investment.",
      },
      {
        question: "What about cold weather performance?",
        answer:
          "LiFePO4 performs well down to about 32°F (0°C) for discharge and should not be charged below 32°F — charging in freezing temps damages the cells. Most quality stations have built-in low-temperature charging protection that prevents this. For cold-weather use, keep the station insulated or in your vehicle. Discharge performance drops about 10-20% at freezing temps but remains functional.",
      },
    ],
  },
  {
    slug: "best-portable-propane-grills-and-firepits",
    title: "Best Portable Propane Grills & Fire Pits for Overlanding (2026)",
    metaTitle: "Best Portable Propane Grills & Fire Pits 2026 — Weber, Camp Chef & Ignik",
    description:
      "Compare the best portable propane grills and fire pits for overlanding and camping. Weber Q 1200 vs Camp Chef Everest 2X vs Ignik FireCan vs Outland Firebowl — Overland Expo compliant, compact, and trail-ready.",
    date: "2026-02-18",
    lastUpdated: "2026-02-18",
    category: "overlanding",
    heroImage:
      "https://images.unsplash.com/photo-1529544851697-3050855b2dae?w=1200&q=80",
    intro:
      "Propane is king for overlanding cooking — and at many events, it's your only option. Overland Expo (East, West, Mountain West, and PNW) all prohibit wood and charcoal fires, allowing only propane appliances with an on/off valve. Many BLM areas, national forests, and state parks enact similar fire restrictions during dry seasons. A good portable propane grill or fire pit lets you cook and enjoy campfire ambiance anywhere without restrictions. We've compared the best propane options for overlanders who need compact, trail-ready cooking and fire solutions.",
    buyingGuideTitle: "Choosing the Right Propane Setup for Overlanding",
    buyingGuide: [
      "Fire restriction compliance: Many camping areas and all Overland Expo events require propane-only fires with a visible on/off valve. Wood fires, charcoal, and even some alcohol stoves are prohibited during fire restrictions. Propane appliances with a shutoff valve are universally accepted — this is the #1 reason overlanders choose propane.",
      "BTU output vs. portability: Higher BTUs mean faster cooking but larger size and more fuel consumption. A 10,000 BTU single burner handles most meals. Two burners at 20,000+ BTU let you cook multiple dishes simultaneously. For solo travelers, a single-burner setup saves significant space and weight.",
      "Fuel flexibility: Standard 1 lb propane canisters are convenient but expensive ($3-5 each, last 1-2 hours of cooking). A refillable 5 lb or 20 lb tank is far more economical for extended trips. Look for grills with standard propane fitting or adaptors for both canister and bulk tank.",
      "Wind resistance: Open burners lose massive heat in wind. Look for grills with built-in windscreens or recessed burners. The Weber Q series' enclosed design handles wind better than open two-burner stoves. For fire pits, deeper bowls with wind guards perform better.",
      "Cleanup and maintenance: Overlanding means limited water for cleaning. Porcelain-coated grates resist sticking and clean with a quick wipe. Drip trays catch grease. Some fire pits (like the Ignik FireCan) use lava rocks that self-clean during use — minimal maintenance on the trail.",
    ],
    verdict:
      "The Weber Q 1200 is the best portable propane grill — consistent heat, excellent wind resistance, and compact enough for any vehicle. The Camp Chef Everest 2X is the best two-burner option for serious camp cooking. The Ignik FireCan is the best propane fire pit for overlanders — ultra-portable, Overland Expo compliant, and designed specifically for vehicle-based camping. The Outland Firebowl 893 is the best full-size propane fire pit for car camping and basecamp.",
    specLabels: [
      { key: "type", label: "Type" },
      { key: "btu", label: "BTU" },
      { key: "fuel", label: "Fuel" },
      { key: "cookArea", label: "Cook/Flame Area" },
      { key: "weight", label: "Weight" },
      { key: "ignition", label: "Ignition" },
    ],
    products: [
      {
        slug: "weber-q-1200",
        name: "Weber Q 1200 Portable Propane Grill",
        image:
          "https://images.unsplash.com/photo-1529544851697-3050855b2dae?w=600&q=80",
        price: "$230",
        rating: 4.7,
        reviewCount: 12500,
        affiliateUrl:
          "https://www.amazon.com/dp/B00FKA5V2G?tag=prepperevo-20",
        badge: "Editor's Pick",
        verdict:
          "The gold standard of portable propane grills. Enclosed design blocks wind, porcelain grates sear beautifully, and the 189 sq in cooking area handles steaks for four. Overland Expo compliant with visible on/off valve.",
        pros: [
          "189 sq in cooking area — feeds 4 people",
          "Enclosed design — excellent wind resistance",
          "Porcelain-enameled grates — easy cleanup",
          "Push-button electronic ignition",
        ],
        cons: [
          "8,500 BTU — slower than two-burner stoves",
          "28 lbs — not ultralight",
          "Uses 1 lb canisters (adaptor available for bulk)",
        ],
        specs: {
          type: "Portable gas grill",
          btu: "8,500 BTU",
          fuel: "1 lb propane canister (adaptor for 20 lb)",
          cookArea: "189 sq in",
          weight: "28 lbs",
          ignition: "Electronic push-button",
        },
      },
      {
        slug: "camp-chef-everest-2x",
        name: "Camp Chef Everest 2X Two-Burner Stove",
        image:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
        price: "$140",
        rating: 4.7,
        reviewCount: 7800,
        affiliateUrl:
          "https://www.amazon.com/dp/B09KNVRDNQ?tag=prepperevo-20",
        badge: "Best for Cooking",
        verdict:
          "The best two-burner camp stove for serious overlanding cooks. 40,000 BTU total output boils water fast and simmers low. Matchless ignition, adjustable legs, and standard 1 lb or bulk propane compatibility.",
        pros: [
          "40,000 BTU — two powerful burners",
          "Uses 1 lb canisters or bulk propane",
          "Matchless ignition on both burners",
          "Three-sided windscreen included",
        ],
        cons: [
          "Open-top design — still affected by wind",
          "12 lbs — lighter than grill but two pieces to carry",
          "No grill grate — stovetop cooking only",
        ],
        specs: {
          type: "Two-burner camp stove",
          btu: "40,000 BTU (20K per burner)",
          fuel: "1 lb canister or 20 lb bulk tank",
          cookArea: "Two 10\" burners",
          weight: "12 lbs",
          ignition: "Matchless (both burners)",
        },
      },
      {
        slug: "ignik-firecan",
        name: "Ignik FireCan Deluxe",
        image:
          "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=600&q=80",
        price: "$250",
        rating: 4.6,
        reviewCount: 1800,
        affiliateUrl:
          "https://www.amazon.com/dp/B0BSXRT8ZN?tag=prepperevo-20",
        badge: "Best Fire Pit",
        verdict:
          "The ultimate overlanding fire pit. Fits in an ammo can-sized package, runs on 1 lb propane, and provides real campfire ambiance without violating fire restrictions. Overland Expo approved and Leave No Trace compliant.",
        pros: [
          "Ultra-portable — ammo can size",
          "Overland Expo and fire restriction compliant",
          "Real flame ambiance with lava rocks",
          "Leave No Trace — no ash, no scorch marks",
        ],
        cons: [
          "Small flame area — more ambiance than heat",
          "1 lb canister lasts ~3 hours",
          "Not for cooking — ambiance only",
        ],
        specs: {
          type: "Portable propane fire pit",
          btu: "11,000 BTU",
          fuel: "1 lb propane canister",
          cookArea: "12\" flame area (non-cooking)",
          weight: "12 lbs",
          ignition: "Manual (lighter required)",
        },
      },
      {
        slug: "outland-firebowl-893",
        name: "Outland Living Firebowl 893",
        image:
          "https://images.unsplash.com/photo-1540543661003-f3c0c045e393?w=600&q=80",
        price: "$155",
        rating: 4.6,
        reviewCount: 14200,
        affiliateUrl:
          "https://www.amazon.com/dp/B074SDQXJY?tag=prepperevo-20",
        verdict:
          "The best full-size propane fire pit for car camping and basecamp. 58,000 BTU output produces serious heat with a 21.5-inch diameter — like a real campfire without the wood, ash, or fire restrictions. Bulk propane keeps it running all evening.",
        pros: [
          "58,000 BTU — real campfire-level heat",
          "21.5\" diameter — group-size fire pit",
          "Runs on standard 20 lb propane tank",
          "Lid doubles as carrying case",
        ],
        cons: [
          "22 lbs — car camping only",
          "Requires separate 20 lb propane tank",
          "Too large for compact overlanding setups",
        ],
        specs: {
          type: "Portable propane fire pit",
          btu: "58,000 BTU",
          fuel: "Standard 20 lb propane tank",
          cookArea: "21.5\" diameter flame area",
          weight: "22 lbs (without tank)",
          ignition: "Adjustable regulator with on/off",
        },
      },
    ],
    faq: [
      {
        question: "Are propane grills and fire pits allowed at Overland Expo?",
        answer:
          "Yes — propane appliances with a visible on/off valve are the only fire source allowed at all Overland Expo events (East, West, Mountain West, and PNW). Wood fires, charcoal, and any open flame without a shutoff valve are strictly prohibited. This is why every serious overlander owns at least one propane cooking and/or fire pit option. The same rules apply at many BLM dispersed camping areas during fire season.",
      },
      {
        question: "How long does a 1 lb propane canister last?",
        answer:
          "It depends on BTU output. A Weber Q 1200 at 8,500 BTU runs about 1.5-2 hours on a 1 lb canister. A Camp Chef burner at 20,000 BTU runs about 45-60 minutes per canister. A small fire pit like the Ignik runs about 3 hours. For extended trips, use a refill adaptor to fill 1 lb canisters from a bulk 20 lb tank (costs about $4/gallon vs $4 per disposable canister).",
      },
      {
        question: "Can I use a propane fire pit during fire restrictions?",
        answer:
          "Generally yes, but check specific local regulations. Most fire restrictions allow 'portable stoves or lanterns using gas, jellied petroleum, or pressurized liquid fuel with an on/off switch.' Propane fire pits with a shutoff valve meet this standard in most jurisdictions. However, some extreme Stage 3 fire restrictions ban ALL fires and heat sources. Always check current local fire restrictions before your trip.",
      },
      {
        question: "1 lb canisters vs bulk propane — which is better?",
        answer:
          "For weekend trips, 1 lb canisters are convenient — no bulk tank to store. For extended overlanding, bulk propane wins on cost and waste. A 20 lb tank holds the equivalent of about twenty 1 lb canisters but costs $15-20 to fill vs $60-100 for the same amount in disposable canisters. Use a hose adaptor ($15) to connect your grill to a bulk tank, or a refill adaptor to fill empty 1 lb canisters from your bulk tank.",
      },
    ],
  },
  {
    slug: "best-portable-wood-stoves",
    title: "Best Portable Wood Stoves for Camping & Overlanding (2026)",
    metaTitle: "Best Portable Wood Stoves 2026 — Solo Stove, BioLite & Winnerwell",
    description:
      "Compare the best portable wood stoves for camping and overlanding. Solo Stove Campfire vs BioLite CampStove 2+ vs Winnerwell Nomad vs Pomoly Timber — burn efficiency, cooking ability, and packability.",
    date: "2026-02-18",
    lastUpdated: "2026-02-18",
    category: "overlanding",
    heroImage:
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&q=80",
    intro:
      "A portable wood stove turns every campsite into a kitchen — no fuel canisters to carry, no propane to run out, just the wood around you. From ultralight backpacking stoves to full tent stoves that heat a canvas shelter in winter, portable wood stoves offer self-reliance that gas stoves can't match. But there's an important caveat: wood fires are prohibited at many events, public lands during fire season, and all Overland Expo locations. We've compared four top wood stoves for when and where they're permitted, plus guidance on knowing when to leave the wood stove home and bring propane instead.",
    buyingGuideTitle: "How to Choose a Portable Wood Stove",
    buyingGuide: [
      "IMPORTANT — Fire restriction awareness: Wood stoves CANNOT be used during fire restrictions, at Overland Expo events, or in areas prohibiting wood/charcoal fires. Always check local fire regulations before using a wood stove. For fire-restricted areas, see our portable propane grills and fire pits comparison for compliant alternatives.",
      "Stove type — camp stove vs. tent stove: Compact camp stoves (Solo Stove, BioLite) are for outdoor cooking and campfire ambiance. Tent stoves (Winnerwell Nomad, Pomoly Timber) have chimney pipes designed to heat a tent or shelter in cold weather. Choose based on your primary use case.",
      "Burn efficiency: Double-wall combustion designs (Solo Stove) burn hotter and cleaner by feeding preheated air back into the flames. This means less smoke, less fuel, and more heat per log. Secondary combustion is the key feature to look for.",
      "Cooking capability: Some wood stoves are heating-first with cooking as an afterthought. Others (BioLite, tent stoves with flat tops) are designed for serious cooking. If cooking is primary, look for a flat cooking surface, pot support stability, and adjustable airflow for temperature control.",
      "Packability and weight: A backpacking wood stove should be under 2 lbs. A vehicle-based camp stove can be 10-20 lbs. Tent stoves with chimney pipe run 30-50+ lbs and are strictly vehicle camping gear. Match the stove size to your transport method.",
    ],
    verdict:
      "The Solo Stove Campfire is the best overall portable wood stove — nearly smokeless secondary combustion, beautiful flame, and excellent for cooking. The BioLite CampStove 2+ is the most innovative with its built-in USB charger that converts fire heat to electricity. The Winnerwell Nomad is the best tent stove for winter camping — compact, efficient, and proven in extreme cold. The Pomoly Timber is the ultralight tent stove for backpackers and minimalist overlanders.",
    specLabels: [
      { key: "type", label: "Type" },
      { key: "fuelType", label: "Fuel" },
      { key: "weight", label: "Weight" },
      { key: "cookSurface", label: "Cook Surface" },
      { key: "burnTime", label: "Burn Time" },
      { key: "material", label: "Material" },
    ],
    products: [
      {
        slug: "solo-stove-campfire",
        name: "Solo Stove Campfire",
        image:
          "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&q=80",
        price: "$110",
        rating: 4.7,
        reviewCount: 8900,
        affiliateUrl:
          "https://www.amazon.com/dp/B00FHKQ13O?tag=prepperevo-20",
        badge: "Editor's Pick",
        verdict:
          "The best portable wood stove for most campers. Double-wall secondary combustion produces a nearly smokeless fire with incredible heat. Cooks for groups of 4+, packs down to 7 inches, and weighs just 2.2 lbs. Beautiful engineering.",
        pros: [
          "Nearly smokeless — secondary combustion",
          "2.2 lbs — light enough for car camping",
          "304 stainless steel — lasts forever",
          "No batteries or fuel canisters needed",
        ],
        cons: [
          "Needs small, dry wood pieces",
          "No built-in cooking grate (sold separately)",
          "Cannot be used during fire restrictions",
        ],
        specs: {
          type: "Portable camp stove",
          fuelType: "Wood (sticks, twigs, small logs)",
          weight: "2.2 lbs",
          cookSurface: "7\" diameter (grate sold separately)",
          burnTime: "Continuous (keep feeding wood)",
          material: "304 stainless steel",
        },
      },
      {
        slug: "biolite-campstove-2-plus",
        name: "BioLite CampStove 2+",
        image:
          "https://images.unsplash.com/photo-1504851149172-5b45d0e27524?w=600&q=80",
        price: "$150",
        rating: 4.4,
        reviewCount: 3600,
        affiliateUrl:
          "https://www.amazon.com/dp/B08S46HLM1?tag=prepperevo-20",
        badge: "Most Innovative",
        verdict:
          "A wood stove that charges your phone. The thermoelectric generator converts fire heat into 3W USB power — enough to charge a phone in 2 hours while you cook. The internal fan creates a jet-like flame that boils water in 4.5 minutes. Science and camping combined.",
        pros: [
          "3W USB output — charges devices from fire",
          "Internal fan creates efficient forced-air burn",
          "Boils 1L water in 4.5 minutes",
          "LED dashboard shows power output",
        ],
        cons: [
          "2.06 lbs — heavier than basic stoves",
          "Fan requires charged internal battery",
          "Narrow firebox — small wood only",
        ],
        specs: {
          type: "Thermoelectric camp stove",
          fuelType: "Wood (twigs, pellets, small sticks)",
          weight: "2.06 lbs",
          cookSurface: "Integrated pot stand",
          burnTime: "Continuous (3W USB while burning)",
          material: "Stainless steel + aluminum",
        },
      },
      {
        slug: "winnerwell-nomad-medium",
        name: "Winnerwell Nomad View Medium",
        image:
          "https://images.unsplash.com/photo-1482784160316-6eb046863ece?w=600&q=80",
        price: "$450",
        rating: 4.8,
        reviewCount: 1200,
        affiliateUrl:
          "https://www.amazon.com/dp/B0792V7HY7?tag=prepperevo-20",
        badge: "Best Tent Stove",
        verdict:
          "The best portable tent stove for winter camping. Heats a canvas tent to 70°F+ in subzero conditions, has a glass viewing window for fire ambiance, and cooks on the flat top surface. The go-to stove for hot tent camping.",
        pros: [
          "Heats canvas tents in subzero temps",
          "Glass window — watch the fire",
          "Flat cook top + built-in oven space",
          "304 stainless — handles extreme heat",
        ],
        cons: [
          "33 lbs — vehicle camping only",
          "Requires hot tent with stove jack",
          "7-section chimney pipe to manage",
        ],
        specs: {
          type: "Portable tent stove",
          fuelType: "Wood (logs up to 18\")",
          weight: "33 lbs (with chimney sections)",
          cookSurface: "15\" x 8\" flat top",
          burnTime: "4-8 hours per load",
          material: "304 stainless steel",
        },
      },
      {
        slug: "pomoly-timber-mini",
        name: "Pomoly Timber Mini Titanium",
        image:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
        price: "$340",
        rating: 4.6,
        reviewCount: 680,
        affiliateUrl:
          "https://www.amazon.com/dp/B09FS83FHQ?tag=prepperevo-20",
        verdict:
          "The ultralight tent stove for backpackers and minimalists. At 4.4 lbs with titanium construction, it can actually be carried in a pack — making hot tent camping accessible without a vehicle. Heats small shelters efficiently.",
        pros: [
          "4.4 lbs titanium — backpackable tent stove",
          "Roll-up chimney pipe saves space",
          "Heats 1-2 person shelters effectively",
          "Folds flat for packing",
        ],
        cons: [
          "Small firebox — frequent feeding needed",
          "Titanium warps over time at high heat",
          "$340 for the ultralight tax",
        ],
        specs: {
          type: "Ultralight tent stove",
          fuelType: "Wood (small sticks and splits)",
          weight: "4.4 lbs (with chimney)",
          cookSurface: "Small flat top",
          burnTime: "1-2 hours per load",
          material: "Titanium",
        },
      },
    ],
    faq: [
      {
        question: "Can I use a wood stove at Overland Expo?",
        answer:
          "No. All Overland Expo events (East, West, Mountain West, and PNW) prohibit wood and charcoal fires. Only propane appliances with a visible on/off valve are permitted. This applies to all wood stoves, including enclosed designs like the Solo Stove. For Overland Expo and fire-restricted areas, check out our comparison of portable propane grills and fire pits for compliant alternatives.",
      },
      {
        question: "Are wood stoves allowed during fire restrictions?",
        answer:
          "Generally no. Most fire restrictions (Stage 1 and above) prohibit campfires, charcoal, and wood burning — even in enclosed stoves. Some jurisdictions make exceptions for 'manufactured fire logs' in enclosed stoves, but rules vary widely. Always check the specific fire restriction level for your area before using any wood-burning device. When in doubt, bring propane.",
      },
      {
        question: "How does a secondary combustion stove work?",
        answer:
          "Double-wall stoves like the Solo Stove have a gap between the inner and outer walls. Air enters through bottom vents, gets heated as it rises between the walls, and exits through holes at the top rim. This superheated air ignites the smoke and gases above the flames — burning fuel that would normally escape as smoke. The result is 2-3x more heat from the same amount of wood, dramatically less smoke, and less ash.",
      },
      {
        question: "Do I need a special tent for a tent stove?",
        answer:
          "Yes — you need a 'hot tent' with a stove jack, which is a fire-resistant port (usually silicone-coated fiberglass) sewn into the tent wall or roof for the chimney pipe. Never use a tent stove in a standard nylon tent — it will melt or catch fire. Canvas, polycotton, and some nylon tents with stove jacks are designed for this. Also ensure proper ventilation to prevent carbon monoxide buildup — always crack a vent, and consider a battery-powered CO detector.",
      },
    ],
  },
];

export default comparisons;

export function getComparisonBySlug(slug: string) {
  return comparisons.find((c) => c.slug === slug);
}
