export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  amazonLink: string;
  features: string[];
}

export const mockProducts: Product[] = [
  {
    id: "1",
    slug: "lifestraw-personal-water-filter",
    name: "LifeStraw Personal Water Filter",
    description: "Filters up to 1,000 gallons, removes 99.99% of bacteria",
    price: 17.97,
    category: "Water Purification",
    imageUrl: "/images/product-lifestraw.png",
    amazonLink: "https://www.amazon.com/dp/B006QF3TW4?tag=prepperevo-20",
    features: ["Filters 1000 gallons", "Removes 99.99% bacteria", "Ultralight"]
  },
  {
    id: "2",
    slug: "sawyer-squeeze-water-filter",
    name: "Sawyer Squeeze Water Filter",
    description: "Filters up to 100,000 gallons, lightweight and versatile",
    price: 37.95,
    category: "Water Purification",
    imageUrl: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f",
    amazonLink: "https://www.amazon.com/dp/B00B1OSU4W?tag=prepperevo-20",
    features: ["Filters 100,000 gallons", "Lightweight", "Versatile inline use"]
  },
  {
    id: "3",
    slug: "berkey-water-filter",
    name: "Berkey Water Filter (Big Berkey)",
    description: "Gravity-fed, purifies up to 6,000 gallons, home base essential",
    price: 398.00,
    category: "Water Purification",
    imageUrl: "/images/product-berkey.png",
    amazonLink: "https://www.amazon.com/dp/B00BWIWZ7M?tag=prepperevo-20",
    features: ["Gravity-fed", "6,000 gallon capacity", "Home base essential"]
  },
  {
    id: "4",
    slug: "ecoflow-delta-2-max",
    name: "EcoFlow DELTA 2 Max",
    description: "2048Wh LiFePO4, powers everything from fridges to power tools",
    price: 1599.00,
    category: "Power & Energy",
    imageUrl: "/images/product-ecoflow.png",
    amazonLink: "https://amzn.to/4kQqKB1",
    features: ["2048Wh capacity", "LiFePO4 battery", "Heavy duty output"]
  },
  {
    id: "5",
    slug: "jackery-explorer-1000-plus",
    name: "Jackery Explorer 1000 Plus",
    description: "1264Wh expandable to 5kWh, LiFePO4, solar ready",
    price: 1099.00,
    category: "Power & Energy",
    imageUrl: "/images/product-jackery.png",
    amazonLink: "https://www.amazon.com/dp/B0CFVBGWBT?tag=prepperevo-20",
    features: ["Expandable to 5kWh", "LiFePO4 battery", "Solar ready"]
  },
  {
    id: "6",
    slug: "bluetti-ac200max",
    name: "Bluetti AC200MAX",
    description: "2048Wh expandable, dual charging, LiFePO4",
    price: 1599.00,
    category: "Power & Energy",
    imageUrl: "/images/product-bluetti.png",
    amazonLink: "https://www.amazon.com/dp/B09P2JD3SR?tag=prepperevo-20",
    features: ["Expandable capacity", "Dual charging input", "LiFePO4 battery"]
  },
  {
    id: "7",
    slug: "ikamper-skycamp-3-0",
    name: "iKamper Skycamp 3.0",
    description: "Hard-shell rooftop tent, sleeps 2-3, sets up in 1 minute",
    price: 4899.00,
    category: "Shelter & Sleep Systems",
    imageUrl: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7",
    amazonLink: "https://www.amazon.com/dp/B0CB6RX4RT?tag=prepperevo-20",
    features: ["Hard-shell design", "Sleeps 2-3", "1-minute setup"]
  },
  {
    id: "8",
    slug: "roofnest-falcon-2",
    name: "Roofnest Falcon 2",
    description: "Clamshell hard-shell, sleeps 2, all-season capable",
    price: 3495.00,
    category: "Shelter & Sleep Systems",
    imageUrl: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d",
    amazonLink: "https://www.amazon.com/dp/B0CKV16CKZ?tag=prepperevo-20",
    features: ["Clamshell design", "Sleeps 2", "All-season capable"]
  },
  {
    id: "9",
    slug: "arb-simpson-iii",
    name: "ARB Simpson III Rooftop Tent",
    description: "Soft-shell classic, sleeps 2, budget overlanding pick",
    price: 1795.00,
    category: "Shelter & Sleep Systems",
    imageUrl: "https://images.unsplash.com/photo-1533560904424-a0c61dc306fc",
    amazonLink: "https://www.amazon.com/dp/B001RDLGG6?tag=prepperevo-20",
    features: ["Soft-shell design", "Sleeps 2", "Great value"]
  },
  {
    id: "10",
    slug: "garmin-inreach-mini-2",
    name: "Garmin inReach Mini 2",
    description: "Satellite messenger, SOS, GPS tracking, two-way texting",
    price: 399.99,
    category: "Navigation & Communication",
    imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
    amazonLink: "https://www.amazon.com/dp/B09X49GPS1?tag=prepperevo-20",
    features: ["Satellite messaging", "SOS beacon", "GPS tracking"]
  },
  {
    id: "11",
    slug: "baofeng-uv-5r",
    name: "Baofeng UV-5R",
    description: "Dual-band ham radio, budget emergency comms starter",
    price: 25.99,
    category: "Navigation & Communication",
    imageUrl: "/images/product-baofeng.png",
    amazonLink: "https://www.amazon.com/dp/B0CPK8GYWG?tag=prepperevo-20",
    features: ["Dual-band", "Programmable", "Budget friendly"]
  },
  {
    id: "12",
    slug: "midland-gxt1000vp4",
    name: "Midland GXT1000VP4",
    description: "36-mile GMRS radio pair, no license hassle, weather alerts",
    price: 69.99,
    category: "Navigation & Communication",
    imageUrl: "https://images.unsplash.com/photo-1516216628859-9bccecab13ca",
    amazonLink: "https://www.amazon.com/dp/B001WMFYH4?tag=prepperevo-20",
    features: ["36-mile range", "GMRS bands", "Weather alerts"]
  },
  {
    id: "13",
    slug: "solo-stove-ranger-2",
    name: "Solo Stove Ranger 2.0",
    description: "Smokeless fire pit, double-wall airflow, portable",
    price: 199.99,
    category: "Food & Cooking",
    imageUrl: "/images/product-solostove.png",
    amazonLink: "https://www.amazon.com/dp/B0CH7YYXZC?tag=prepperevo-20",
    features: ["Smokeless burn", "Double-wall design", "Portable"]
  },
  {
    id: "14",
    slug: "camp-chef-explorer-2x",
    name: "Camp Chef Explorer 2X",
    description: "Two-burner propane stove, 30,000 BTU per burner, base camp cooking",
    price: 199.99,
    category: "Food & Cooking",
    imageUrl: "https://images.unsplash.com/photo-1504198458649-3128b932f49e",
    amazonLink: "https://www.amazon.com/dp/B0006VORDY?tag=prepperevo-20",
    features: ["Dual burners", "30,000 BTU each", "Sturdy legs"]
  },
  {
    id: "15",
    slug: "biolite-campstove-2",
    name: "BioLite CampStove 2+",
    description: "Burns wood, charges devices via thermoelectric, 5V USB output",
    price: 149.95,
    category: "Food & Cooking",
    imageUrl: "/images/product-biolite.png",
    amazonLink: "https://www.amazon.com/dp/B09JQPBJNF?tag=prepperevo-20",
    features: ["Wood burning", "Thermoelectric charging", "USB power output"]
  },
  {
    id: "16",
    slug: "dometic-cfx3-55im",
    name: "Dometic CFX3 55IM",
    description: "53L powered cooler with ice maker, runs on 12V/120V",
    price: 1299.00,
    category: "Overlanding Vehicles",
    imageUrl: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8",
    amazonLink: "https://www.amazon.com/dp/B083G3NBNZ?tag=prepperevo-20",
    features: ["53L capacity", "Built-in ice maker", "Dual voltage"]
  },
  {
    id: "17",
    slug: "arb-classic-series-ii-50qt",
    name: "ARB Classic Series II Fridge 50qt",
    description: "50-quart, built like a tank, vibration-resistant for off-road",
    price: 1099.00,
    category: "Overlanding Vehicles",
    imageUrl: "/images/product-arb-fridge.png",
    amazonLink: "https://www.amazon.com/dp/B07DVBJPGB?tag=prepperevo-20",
    features: ["50-quart capacity", "Vibration resistant", "Steel construction"]
  },
  {
    id: "18",
    slug: "molle-ii-rucksack",
    name: "MOLLE II Rucksack",
    description: "Military surplus 72hr pack, modular, battle-proven",
    price: 89.99,
    category: "Bug Out & Emergency",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    amazonLink: "https://www.amazon.com/dp/B008SM0XSI?tag=prepperevo-20",
    features: ["Military surplus", "MOLLE webbed", "Battle proven durability"]
  },
  {
    id: "19",
    slug: "511-tactical-rush72",
    name: "5.11 Tactical RUSH72",
    description: "55L bug-out bag, MOLLE webbing, hydration compatible",
    price: 199.99,
    category: "Bug Out & Emergency",
    imageUrl: "/images/product-rush72.png",
    amazonLink: "https://www.amazon.com/dp/B005AG3R0C?tag=prepperevo-20",
    features: ["55L capacity", "Hydration compatible", "Heavy duty nylon"]
  },
  {
    id: "20",
    slug: "mora-companion-hd",
    name: "Mora Companion HD",
    description: "Carbon steel, Scandi grind, best budget survival knife period",
    price: 16.99,
    category: "Survival Tools & Knives",
    imageUrl: "/images/product-mora.png",
    amazonLink: "https://www.amazon.com/dp/B009O014RG?tag=prepperevo-20",
    features: ["Carbon steel blade", "Scandi grind", "Ergonomic grip"]
  },
  {
    id: "21",
    slug: "esee-4",
    name: "ESEE 4",
    description: "1095 carbon steel, bombproof, lifetime no-questions warranty",
    price: 134.95,
    category: "Survival Tools & Knives",
    imageUrl: "/images/product-esee4.png",
    amazonLink: "https://www.amazon.com/dp/B001DZZJ6C?tag=prepperevo-20",
    features: ["1095 carbon steel", "Micarta handle", "Lifetime warranty"]
  },
  {
    id: "22",
    slug: "benchmade-bugout-535",
    name: "Benchmade Bugout 535",
    description: "Ultralight EDC folder, 1.85oz, CPM-S30V blade",
    price: 183.00,
    category: "Survival Tools & Knives",
    imageUrl: "/images/product-benchmade.png",
    amazonLink: "https://www.amazon.com/dp/B06XKNF38D?tag=prepperevo-20",
    features: ["1.85oz ultralight", "CPM-S30V steel", "AXIS lock mechanism"]
  },
  {
    id: "23",
    slug: "renogy-200w-solar-panel",
    name: "Renogy 200W Portable Solar Panel",
    description: "Foldable suitcase design, pairs with any power station",
    price: 299.99,
    category: "Power & Energy",
    imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d",
    amazonLink: "https://www.amazon.com/dp/B0B5PSSCFY?tag=prepperevo-20",
    features: ["200W output", "Foldable design", "Universal compatibility"]
  },
  {
    id: "24",
    slug: "goal-zero-yeti-1000-core",
    name: "Goal Zero Yeti 1000 Core",
    description: "983Wh, reliable brand, integrates with Goal Zero solar panels",
    price: 999.95,
    category: "Power & Energy",
    imageUrl: "/images/product-goalzero.png",
    amazonLink: "https://www.amazon.com/dp/B096ST3VMS?tag=prepperevo-20",
    features: ["983Wh capacity", "Multiple port options", "Fast charging"]
  }
];

export const productArticleMap: Record<string, string> = {
  "sawyer-squeeze-water-filter": "sawyer-squeeze-water-filter-review",
  "waterdrop-king-tank": "waterdrop-king-tank-gravity-water-filter-review-2026",
  "mora-companion-hd": "mora-companion-hd-review-best-budget-survival-knife-17",
  "511-tactical-rush72": "5-11-rush-72-bug-out-bag-review",
  "garmin-inreach-mini-2": "garmin-inreach-mini-2-review-satellite-sos-messaging",
  "ikamper-skycamp-3-0": "ikamper-skycamp-3-review",
  "maxtrax-mkii-recovery-boards": "maxtrax-vs-actiontrax-recovery-boards",
  "dometic-cfx3-55im": "dometic-cfx3-55im-review",
  "jackery-explorer-1000-plus": "jackery-explorer-1000-plus-review",
  "ecoflow-delta-2-max": "best-portable-power-stations-2026",
  "leatherman-wave-plus": "best-survival-knives-compared-budget-to-premium-2026",
  "cat-tourniquet-gen7": "first-aid-essentials-survival",
  "ifak-trauma-kit": "first-aid-essentials-survival",
  "baofeng-uv-5r": "baofeng-uv-5r-review-26-ham-radio-for-emergency-comms",
  "molle-ii-rucksack": "molle-ii-rucksack-review-military-surplus-72hr-pack",
  "sol-emergency-bivvy": "building-your-first-bug-out-bag",
  "bigblue-28w-solar-charger": "renogy-200w-solar-panel-review",
  "petzl-actik-core-headlamp": "best-portable-lighting-camping-2026",
  "katadyn-befree-water-filter": "best-water-filters-preppers-2026",
  "jetboil-flash-cooking-system": "best-camp-stoves-cooking-gear-compared-2026",
  "gsi-pinnacle-camper-cookset": "best-camp-stoves-cooking-gear-compared-2026",
  "big-agnes-copper-spur-hv-ul2": "ultralight-backpacking-gear-guide",
  "thermarest-neoair-xlite-nxt": "ultralight-backpacking-gear-guide",
  "enlightened-equipment-enigma-quilt": "ultralight-backpacking-gear-guide",
  "osprey-atmos-ag-65-backpack": "ultralight-backpacking-gear-guide",
  "mountain-house-14-day-emergency-food": "long-term-food-storage-guide",
  "mylar-bags-oxygen-absorbers": "long-term-food-storage-guide",
  "aquamira-water-purification-tablets": "water-purification-methods",
  "dakota-alert-murs-sensor": "home-security-budget",
  "511-tactical-rush24": "best-bug-out-bags-2026",
  "mystery-ranch-3-day-assault": "best-bug-out-bags-2026",
  "vertx-gamut-2": "best-bug-out-bags-2026",
  "goruck-gr2-40l": "best-bug-out-bags-2026",
  "maxpedition-falcon-ii": "best-bug-out-bags-2026",
  "helikon-tex-raccoon-mk2": "best-bug-out-bags-2026",
  "iceco-vl60-pros": "best-12v-fridges-overlanding",
  "bougerv-cr45": "best-12v-fridges-overlanding",
  "alpicool-c20": "best-12v-fridges-overlanding",
  "setpower-pt45": "best-12v-fridges-overlanding",
  "dometic-cfx3-35": "best-overlanding-fridges-compared-dometic-vs-arb-2026",
  "arb-classic-series-ii-50qt": "arb-classic-series-ii-fridge-review",
};
