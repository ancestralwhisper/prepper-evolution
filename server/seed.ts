import { db } from "./db";
import { products, comparisons } from "@shared/schema";

const productData = [
  { slug: "lifestraw-personal-water-filter", name: "LifeStraw Personal Water Filter", description: "Filters up to 1,000 gallons, removes 99.99% of bacteria", price: "17.97", category: "Water Purification", imageUrl: "https://lifestraw.com/cdn/shop/products/LifeStrawonGreyw-Shadows-3_650x.jpg?v=1750227239", amazonLink: "https://www.amazon.com/dp/B006QF3TW4?tag=prepperevo-20", features: ["Filters 1000 gallons", "Removes 99.99% bacteria", "Ultralight"] },
  { slug: "sawyer-squeeze-water-filter", name: "Sawyer Squeeze Water Filter", description: "Filters up to 100,000 gallons, lightweight and versatile", price: "37.95", category: "Water Purification", imageUrl: "https://cdn.prod.website-files.com/61549f9352f3558157a226ea/6776e9804a8c2ee279d54f97_sawyer-squeeze-water-filteration.png", amazonLink: "https://www.amazon.com/dp/B00B1OSU4W?tag=prepperevo-20", features: ["Filters 100,000 gallons", "Lightweight", "Versatile inline use"] },
  { slug: "berkey-water-filter", name: "Berkey Water Filter (Big Berkey)", description: "Gravity-fed, purifies up to 6,000 gallons, home base essential", price: "398.00", category: "Water Purification", imageUrl: "https://m.media-amazon.com/images/I/61u7kJNAdcL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B00CYW3EVO?tag=prepperevo-20", features: ["Gravity-fed", "6,000 gallon capacity", "Home base essential"] },
  { slug: "ecoflow-delta-3-ultra", name: "EcoFlow DELTA 3 Ultra", description: "4096Wh LiFePO4, 6000W output, powers everything from fridges to power tools", price: "2699.00", category: "Power & Energy", imageUrl: "https://wp.prepperevolution.com/wp-content/uploads/2026/03/ecoflow-delta-3-ultra.jpg", amazonLink: "https://www.amazon.com/dp/B0FT32MCM9?tag=prepperevo-20", features: ["4096Wh capacity", "LiFePO4 battery", "6000W output"] },
  { slug: "jackery-explorer-1000-plus", name: "Jackery Explorer 1000 Plus", description: "1264Wh expandable to 5kWh, LiFePO4, solar ready", price: "1099.00", category: "Power & Energy", imageUrl: "https://m.media-amazon.com/images/I/61JVKysP1nL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B0CFVBGWBT?tag=prepperevo-20", features: ["Expandable to 5kWh", "LiFePO4 battery", "Solar ready"] },
  { slug: "bluetti-ac200max", name: "Bluetti AC200MAX", description: "2048Wh expandable, dual charging, LiFePO4", price: "1599.00", category: "Power & Energy", imageUrl: "https://m.media-amazon.com/images/I/71tjvpo4RrL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B09GKCH4CW?tag=prepperevo-20", features: ["Expandable capacity", "Dual charging input", "LiFePO4 battery"] },
  { slug: "ikamper-skycamp-3-0", name: "iKamper Skycamp 3.0", description: "Hard-shell rooftop tent, sleeps 2-3, sets up in 1 minute", price: "4899.00", category: "Shelter & Sleep Systems", imageUrl: "https://ikamper.com/cdn/shop/files/Skycamp_3.0_FrontRight_1400x.jpg?v=1733271825", amazonLink: "https://www.amazon.com/dp/B0CB6RX4RT?tag=prepperevo-20", features: ["Hard-shell design", "Sleeps 2-3", "1-minute setup"] },
  { slug: "roofnest-falcon-2", name: "Roofnest Falcon 2", description: "Clamshell hard-shell, sleeps 2, all-season capable", price: "3495.00", category: "Shelter & Sleep Systems", imageUrl: "https://m.media-amazon.com/images/I/41vidLnwFAL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B0CJCWY2DN?tag=prepperevo-20", features: ["Clamshell design", "Sleeps 2", "All-season capable"] },
  { slug: "arb-simpson-iii", name: "ARB Simpson III Rooftop Tent", description: "Soft-shell classic, sleeps 2, budget overlanding pick", price: "1795.00", category: "Shelter & Sleep Systems", imageUrl: "https://m.media-amazon.com/images/I/41lCBEpH2GL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B001RDLGG6?tag=prepperevo-20", features: ["Soft-shell design", "Sleeps 2", "Great value"] },
  { slug: "garmin-inreach-mini-2", name: "Garmin inReach Mini 3 Plus", description: "Satellite messenger, SOS, GPS tracking, two-way texting", price: "399.99", category: "Navigation & Communication", imageUrl: "https://m.media-amazon.com/images/I/31pFvYsvGUL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B0G4RST8LV?tag=prepperevo-20", features: ["Satellite messaging", "SOS beacon", "GPS tracking"] },
  { slug: "baofeng-uv-5r", name: "Baofeng UV-5R", description: "Dual-band ham radio, budget emergency comms starter", price: "25.99", category: "Navigation & Communication", imageUrl: "https://m.media-amazon.com/images/I/61b8+ekfccL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B074XPB313?tag=prepperevo-20", features: ["Dual-band", "Programmable", "Budget friendly"] },
  { slug: "midland-gxt1000vp4", name: "Midland GXT1000VP4", description: "36-mile GMRS radio pair, no license hassle, weather alerts", price: "69.99", category: "Navigation & Communication", imageUrl: "https://midlandusa.com/cdn/shop/files/1.GXT1000VP4Front2.jpg?v=1726771934&width=2000", amazonLink: "https://www.amazon.com/dp/B001WMFYH4?tag=prepperevo-20", features: ["36-mile range", "GMRS bands", "Weather alerts"] },
  { slug: "solo-stove-ranger-2", name: "Solo Stove Ranger 2.0", description: "Smokeless fire pit, double-wall airflow, portable", price: "199.99", category: "Food & Cooking", imageUrl: "https://m.media-amazon.com/images/I/61Q1SiBCO5L._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B0B7BG9YPW?tag=prepperevo-20", features: ["Smokeless burn", "Double-wall design", "Portable"] },
  { slug: "camp-chef-explorer-2x", name: "Camp Chef Explorer 2X", description: "Two-burner propane stove, 30,000 BTU per burner, base camp cooking", price: "199.99", category: "Food & Cooking", imageUrl: "https://m.media-amazon.com/images/I/41Ntprn1juL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B0006VORDY?tag=prepperevo-20", features: ["Dual burners", "30,000 BTU each", "Sturdy legs"] },
  { slug: "biolite-campstove-2", name: "BioLite CampStove 2+", description: "Burns wood, charges devices via thermoelectric, 5V USB output", price: "149.95", category: "Food & Cooking", imageUrl: "https://m.media-amazon.com/images/I/71935nPZwsL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B0C31B18Y2?tag=prepperevo-20", features: ["Wood burning", "Thermoelectric charging", "USB power output"] },
  { slug: "dometic-cfx3-55im", name: "Dometic CFX3 55IM", description: "53L powered cooler with ice maker, runs on 12V/120V", price: "1299.00", category: "Overlanding Vehicles", imageUrl: "https://m.media-amazon.com/images/I/21Ob+OMr-NL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B0F9LFBJHF?tag=prepperevo-20", features: ["53L capacity", "Built-in ice maker", "Dual voltage"] },
  { slug: "arb-classic-series-ii-50qt", name: "ARB Classic Series II Fridge 50qt", description: "50-quart, built like a tank, vibration-resistant for off-road", price: "1099.00", category: "Overlanding Vehicles", imageUrl: "https://cdn11.bigcommerce.com/s-wg9nennc1z/images/stencil/1035x1035/products/11999/13136692/arb-50-quart-classic-series-ii-fridge-freezer-10801472__35281.1752171001.jpg?c=1", amazonLink: "https://www.amazon.com/dp/B07Q75PB68?tag=prepperevo-20", features: ["50-quart capacity", "Vibration resistant", "Steel construction"] },
  { slug: "molle-ii-rucksack", name: "MOLLE II Rucksack", description: "Military surplus 72hr pack, modular, battle-proven", price: "89.99", category: "Bug Out & Emergency", imageUrl: "https://m.media-amazon.com/images/I/51GGxHRoCCL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B09H71PN7H?tag=prepperevo-20", features: ["Military surplus", "MOLLE webbed", "Battle proven durability"] },
  { slug: "511-tactical-rush72", name: "5.11 Tactical RUSH72", description: "55L bug-out bag, MOLLE webbing, hydration compatible", price: "199.99", category: "Bug Out & Emergency", imageUrl: "https://www.511tactical.com/media/catalog/product/5/6/56565_019_01_1.jpg?quality=100&bg-color=255,255,255&fit=bounds&height=855&width=855", amazonLink: "https://www.amazon.com/dp/B0D9R239MT?tag=prepperevo-20", features: ["55L capacity", "Hydration compatible", "Heavy duty nylon"] },
  { slug: "mora-companion-hd", name: "Mora Companion HD", description: "Carbon steel, Scandi grind, best budget survival knife period", price: "16.99", category: "Survival Tools & Knives", imageUrl: "https://www.morakniv.com/cdn/shop/files/Companion_Heavy_Duty_S_Black_Main_Product.webp?crop=center&height=2000&v=1756795211&width=2000", amazonLink: "https://www.amazon.com/dp/B009NZVZ3E?tag=prepperevo-20", features: ["Carbon steel blade", "Scandi grind", "Ergonomic grip"] },
  { slug: "esee-4", name: "ESEE 4", description: "1095 carbon steel, bombproof, lifetime no-questions warranty", price: "134.95", category: "Survival Tools & Knives", imageUrl: "https://eseeknives.com/sites/default/files/styles/product_full/public/esee-4.jpg?itok=2JpLk0D1", amazonLink: "https://www.amazon.com/dp/B07F3FKP3C?tag=prepperevo-20", features: ["1095 carbon steel", "Micarta handle", "Lifetime warranty"] },
  { slug: "benchmade-bugout-535", name: "Benchmade Bugout 535", description: "Ultralight EDC folder, 1.85oz, CPM-S30V blade", price: "183.00", category: "Survival Tools & Knives", imageUrl: "https://cdn.shopify.com/s/files/1/0574/8041/3232/files/rpykt0cquscpbqynqblh.jpg?v=1771435479", amazonLink: "https://www.amazon.com/dp/B0BW9WJTDR?tag=prepperevo-20", features: ["1.85oz ultralight", "CPM-S30V steel", "AXIS lock mechanism"] },
  { slug: "renogy-200w-solar-panel", name: "Renogy 200W Portable Solar Panel", description: "Foldable suitcase design, pairs with any power station", price: "299.99", category: "Power & Energy", imageUrl: "https://m.media-amazon.com/images/I/41CvFaQf-fL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B0CNPHD4VY?tag=prepperevo-20", features: ["200W output", "Foldable design", "Universal compatibility"] },
  { slug: "goal-zero-yeti-1000-core", name: "Goal Zero Yeti 1000 Core", description: "983Wh, reliable brand, integrates with Goal Zero solar panels", price: "999.95", category: "Power & Energy", imageUrl: "https://m.media-amazon.com/images/I/711+wL8KJQL._AC_SL1500_.jpg", amazonLink: "https://www.amazon.com/dp/B08FX3S5LF?tag=prepperevo-20", features: ["983Wh capacity", "Multiple port options", "Fast charging"] },
];

const comparisonData = [
  { slug: "best-gravity-water-filters-2025", title: "The Best Gravity Water Filters of 2025: Head-to-Head", description: "We tested the top 5 gravity water filters in back-country conditions to see which one actually delivers.", productSlugs: ["lifestraw-personal-water-filter", "sawyer-squeeze-water-filter", "berkey-water-filter"], verdict: "The Berkey takes the top spot for base camp use, while the Sawyer Squeeze wins for portability." },
];

export async function seedDatabase() {
  const existingProducts = await db.select().from(products);
  if (existingProducts.length > 0) {
    console.log(`Database already has ${existingProducts.length} products. Skipping seed.`);
    return;
  }

  console.log("Seeding database...");
  await db.insert(products).values(productData);
  console.log(`Inserted ${productData.length} products.`);

  await db.insert(comparisons).values(comparisonData);
  console.log(`Inserted ${comparisonData.length} comparisons.`);

  console.log("Seed complete.");
}

if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
