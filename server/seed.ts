import { db } from "./db";
import { products, comparisons } from "@shared/schema";

const productData = [
  { slug: "lifestraw-personal-water-filter", name: "LifeStraw Personal Water Filter", description: "Filters up to 1,000 gallons, removes 99.99% of bacteria", price: "17.97", category: "Water Purification", imageUrl: "/images/product-lifestraw.png", amazonLink: "https://www.amazon.com/dp/B006QF3TW4?tag=prepperevo-20", features: ["Filters 1000 gallons", "Removes 99.99% bacteria", "Ultralight"] },
  { slug: "sawyer-squeeze-water-filter", name: "Sawyer Squeeze Water Filter", description: "Filters up to 100,000 gallons, lightweight and versatile", price: "37.95", category: "Water Purification", imageUrl: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f", amazonLink: "https://www.amazon.com/dp/B00B1OSU4W?tag=prepperevo-20", features: ["Filters 100,000 gallons", "Lightweight", "Versatile inline use"] },
  { slug: "berkey-water-filter", name: "Berkey Water Filter (Big Berkey)", description: "Gravity-fed, purifies up to 6,000 gallons, home base essential", price: "398.00", category: "Water Purification", imageUrl: "/images/product-berkey.png", amazonLink: "https://www.amazon.com/dp/B00BWIWZ7M?tag=prepperevo-20", features: ["Gravity-fed", "6,000 gallon capacity", "Home base essential"] },
  { slug: "ecoflow-delta-2-max", name: "EcoFlow DELTA 2 Max", description: "2048Wh LiFePO4, powers everything from fridges to power tools", price: "1599.00", category: "Power & Energy", imageUrl: "/images/product-ecoflow.png", amazonLink: "https://amzn.to/4kQqKB1", features: ["2048Wh capacity", "LiFePO4 battery", "Heavy duty output"] },
  { slug: "jackery-explorer-1000-plus", name: "Jackery Explorer 1000 Plus", description: "1264Wh expandable to 5kWh, LiFePO4, solar ready", price: "1099.00", category: "Power & Energy", imageUrl: "/images/product-jackery.png", amazonLink: "https://www.amazon.com/dp/B0CG5BP68F?tag=prepperevo-20", features: ["Expandable to 5kWh", "LiFePO4 battery", "Solar ready"] },
  { slug: "bluetti-ac200max", name: "Bluetti AC200MAX", description: "2048Wh expandable, dual charging, LiFePO4", price: "1599.00", category: "Power & Energy", imageUrl: "/images/product-bluetti.png", amazonLink: "https://www.amazon.com/dp/B09P2JD3SR?tag=prepperevo-20", features: ["Expandable capacity", "Dual charging input", "LiFePO4 battery"] },
  { slug: "ikamper-skycamp-3-0", name: "iKamper Skycamp 3.0", description: "Hard-shell rooftop tent, sleeps 2-3, sets up in 1 minute", price: "4899.00", category: "Shelter & Sleep Systems", imageUrl: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7", amazonLink: "https://www.amazon.com/dp/B0CB6RX4RT?tag=prepperevo-20", features: ["Hard-shell design", "Sleeps 2-3", "1-minute setup"] },
  { slug: "roofnest-falcon-2", name: "Roofnest Falcon 2", description: "Clamshell hard-shell, sleeps 2, all-season capable", price: "3495.00", category: "Shelter & Sleep Systems", imageUrl: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d", amazonLink: "https://www.amazon.com/dp/B0CKV16CKZ?tag=prepperevo-20", features: ["Clamshell design", "Sleeps 2", "All-season capable"] },
  { slug: "arb-simpson-iii", name: "ARB Simpson III Rooftop Tent", description: "Soft-shell classic, sleeps 2, budget overlanding pick", price: "1795.00", category: "Shelter & Sleep Systems", imageUrl: "https://images.unsplash.com/photo-1533560904424-a0c61dc306fc", amazonLink: "https://www.amazon.com/dp/B001RDLGG6?tag=prepperevo-20", features: ["Soft-shell design", "Sleeps 2", "Great value"] },
  { slug: "garmin-inreach-mini-2", name: "Garmin inReach Mini 2", description: "Satellite messenger, SOS, GPS tracking, two-way texting", price: "399.99", category: "Navigation & Communication", imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e", amazonLink: "https://www.amazon.com/dp/B09X49GPS1?tag=prepperevo-20", features: ["Satellite messaging", "SOS beacon", "GPS tracking"] },
  { slug: "baofeng-uv-5r", name: "Baofeng UV-5R", description: "Dual-band ham radio, budget emergency comms starter", price: "25.99", category: "Navigation & Communication", imageUrl: "/images/product-baofeng.png", amazonLink: "https://www.amazon.com/dp/B0CPK8GYWG?tag=prepperevo-20", features: ["Dual-band", "Programmable", "Budget friendly"] },
  { slug: "midland-gxt1000vp4", name: "Midland GXT1000VP4", description: "36-mile GMRS radio pair, no license hassle, weather alerts", price: "69.99", category: "Navigation & Communication", imageUrl: "https://images.unsplash.com/photo-1516216628859-9bccecab13ca", amazonLink: "https://www.amazon.com/dp/B001WMFYH4?tag=prepperevo-20", features: ["36-mile range", "GMRS bands", "Weather alerts"] },
  { slug: "solo-stove-ranger-2", name: "Solo Stove Ranger 2.0", description: "Smokeless fire pit, double-wall airflow, portable", price: "199.99", category: "Food & Cooking", imageUrl: "/images/product-solostove.png", amazonLink: "https://www.amazon.com/dp/B0CH7YYXZC?tag=prepperevo-20", features: ["Smokeless burn", "Double-wall design", "Portable"] },
  { slug: "camp-chef-explorer-2x", name: "Camp Chef Explorer 2X", description: "Two-burner propane stove, 30,000 BTU per burner, base camp cooking", price: "199.99", category: "Food & Cooking", imageUrl: "https://images.unsplash.com/photo-1504198458649-3128b932f49e", amazonLink: "https://www.amazon.com/dp/B0006VORDY?tag=prepperevo-20", features: ["Dual burners", "30,000 BTU each", "Sturdy legs"] },
  { slug: "biolite-campstove-2", name: "BioLite CampStove 2+", description: "Burns wood, charges devices via thermoelectric, 5V USB output", price: "149.95", category: "Food & Cooking", imageUrl: "/images/product-biolite.png", amazonLink: "https://www.amazon.com/dp/B09JQPBJNF?tag=prepperevo-20", features: ["Wood burning", "Thermoelectric charging", "USB power output"] },
  { slug: "dometic-cfx3-55im", name: "Dometic CFX3 55IM", description: "53L powered cooler with ice maker, runs on 12V/120V", price: "1299.00", category: "Overlanding Vehicles", imageUrl: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8", amazonLink: "https://www.amazon.com/dp/B083G3NBNZ?tag=prepperevo-20", features: ["53L capacity", "Built-in ice maker", "Dual voltage"] },
  { slug: "arb-classic-series-ii-50qt", name: "ARB Classic Series II Fridge 50qt", description: "50-quart, built like a tank, vibration-resistant for off-road", price: "1099.00", category: "Overlanding Vehicles", imageUrl: "/images/product-arb-fridge.png", amazonLink: "https://www.amazon.com/dp/B07DVBJPGB?tag=prepperevo-20", features: ["50-quart capacity", "Vibration resistant", "Steel construction"] },
  { slug: "molle-ii-rucksack", name: "MOLLE II Rucksack", description: "Military surplus 72hr pack, modular, battle-proven", price: "89.99", category: "Bug Out & Emergency", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62", amazonLink: "https://www.amazon.com/dp/B008SM0XSI?tag=prepperevo-20", features: ["Military surplus", "MOLLE webbed", "Battle proven durability"] },
  { slug: "511-tactical-rush72", name: "5.11 Tactical RUSH72", description: "55L bug-out bag, MOLLE webbing, hydration compatible", price: "199.99", category: "Bug Out & Emergency", imageUrl: "/images/product-rush72.png", amazonLink: "https://www.amazon.com/dp/B005AG3R0C?tag=prepperevo-20", features: ["55L capacity", "Hydration compatible", "Heavy duty nylon"] },
  { slug: "mora-companion-hd", name: "Mora Companion HD", description: "Carbon steel, Scandi grind, best budget survival knife period", price: "16.99", category: "Survival Tools & Knives", imageUrl: "/images/product-mora.png", amazonLink: "https://www.amazon.com/dp/B009O014RG?tag=prepperevo-20", features: ["Carbon steel blade", "Scandi grind", "Ergonomic grip"] },
  { slug: "esee-4", name: "ESEE 4", description: "1095 carbon steel, bombproof, lifetime no-questions warranty", price: "134.95", category: "Survival Tools & Knives", imageUrl: "/images/product-esee4.png", amazonLink: "https://www.amazon.com/dp/B001DZZJ6C?tag=prepperevo-20", features: ["1095 carbon steel", "Micarta handle", "Lifetime warranty"] },
  { slug: "benchmade-bugout-535", name: "Benchmade Bugout 535", description: "Ultralight EDC folder, 1.85oz, CPM-S30V blade", price: "183.00", category: "Survival Tools & Knives", imageUrl: "/images/product-benchmade.png", amazonLink: "https://www.amazon.com/dp/B06XKNF38D?tag=prepperevo-20", features: ["1.85oz ultralight", "CPM-S30V steel", "AXIS lock mechanism"] },
  { slug: "renogy-200w-solar-panel", name: "Renogy 200W Portable Solar Panel", description: "Foldable suitcase design, pairs with any power station", price: "299.99", category: "Power & Energy", imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d", amazonLink: "https://www.amazon.com/dp/B0B5PSSCFY?tag=prepperevo-20", features: ["200W output", "Foldable design", "Universal compatibility"] },
  { slug: "goal-zero-yeti-1000-core", name: "Goal Zero Yeti 1000 Core", description: "983Wh, reliable brand, integrates with Goal Zero solar panels", price: "999.95", category: "Power & Energy", imageUrl: "/images/product-goalzero.png", amazonLink: "https://www.amazon.com/dp/B096ST3VMS?tag=prepperevo-20", features: ["983Wh capacity", "Multiple port options", "Fast charging"] },
];

const comparisonData = [
  { slug: "best-gravity-water-filters-2025", title: "The Best Gravity Water Filters of 2025: Head-to-Head", description: "We tested the top 5 gravity water filters in back-country conditions to see which one actually delivers.", productSlugs: ["lifestraw-personal-water-filter", "sawyer-squeeze-water-filter", "berkey-water-filter"], verdict: "The Berkey takes the top spot for base camp use, while the Sawyer Squeeze wins for portability." },
];

async function seed() {
  console.log("Seeding database...");

  const existingProducts = await db.select().from(products);
  if (existingProducts.length > 0) {
    console.log(`Database already has ${existingProducts.length} products. Skipping seed.`);
    process.exit(0);
  }

  await db.insert(products).values(productData);
  console.log(`Inserted ${productData.length} products.`);

  await db.insert(comparisons).values(comparisonData);
  console.log(`Inserted ${comparisonData.length} comparisons.`);

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
