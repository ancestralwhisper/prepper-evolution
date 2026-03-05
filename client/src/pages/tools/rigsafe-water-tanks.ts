// ─── RigSafe Water Tank Database ─────────────────────────────────────────────
// Real manufacturer specs for overland water storage (trucks/SUVs).
//
// Sources:
//   Empty weight: Manufacturer spec sheets & product pages
//   Capacity: Manufacturer data (gallons)
//
// NOTE: Water weighs 8.34 lbs/gal — the compute engine calculates full weight.
//       emptyWeightLbs is the container only (no water).

export interface WaterTankEntry {
  id: string;
  brand: string;
  model: string;
  emptyWeightLbs: number;
  capacityGal: number;
  mountType: "under-bed" | "truck-bed" | "roof" | "universal";
  affiliateUrl: string;
  notes?: string;
}

export const waterTankDatabase: WaterTankEntry[] = [
  // ─── FRONT RUNNER ────────────────────────────────────────────────────────

  {
    id: "frontrunner-pro-water-tank-20l",
    brand: "Front Runner",
    model: "Pro Water Tank 20L (5.3 gal)",
    emptyWeightLbs: 4.0,
    capacityGal: 5.3,
    mountType: "roof",
    affiliateUrl: "https://www.amazon.com/dp/B0BF5WVTT2?tag=prepperevo-20",
    notes:
      "Mounts to Slimline II rack side rails. Food-grade poly. Includes brackets and hose kit.",
  },
  {
    id: "frontrunner-ultra-slim-40l",
    brand: "Front Runner",
    model: "Ultra Slim Upright Water Tank 40L (10.6 gal)",
    emptyWeightLbs: 6.6,
    capacityGal: 10.6,
    mountType: "roof",
    affiliateUrl: "#",
    notes:
      "Designed to mount vertically on Slimline II rack. Very low profile — 4.7\" wide. BPA-free.",
  },

  // ─── ROTOPAX ─────────────────────────────────────────────────────────────

  {
    id: "rotopax-2gal-water",
    brand: "Rotopax",
    model: "2 Gallon Water Pack (RX-2W)",
    emptyWeightLbs: 1.8,
    capacityGal: 2.0,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B004ETQ2LO?tag=prepperevo-20",
    notes:
      "Mounts to RotoPax pack mount. Stack two for 4 gal. BPA-free HDPE. Fits hood, bumper, rack.",
  },
  {
    id: "rotopax-gen2-2gal-water",
    brand: "Rotopax",
    model: "GEN2 2 Gallon Water Container",
    emptyWeightLbs: 1.8,
    capacityGal: 2.0,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B099R8YJ5D?tag=prepperevo-20",
    notes:
      "Updated GEN2 design. Same RotoPax mount system. Stackable with fuel packs. Food-safe.",
  },

  // ─── SCEPTER ─────────────────────────────────────────────────────────────

  {
    id: "scepter-military-5gal",
    brand: "Scepter",
    model: "Military Water Can 5 Gallon",
    emptyWeightLbs: 4.33,
    capacityGal: 5.0,
    mountType: "truck-bed",
    affiliateUrl: "https://www.amazon.com/dp/B001IV8IYA?tag=prepperevo-20",
    notes:
      "US military-spec NATO jerry can. Reversible spout. BPA-free HDPE. NATO-stackable. Indestructible.",
  },

  // ─── WATERBRICK ──────────────────────────────────────────────────────────

  {
    id: "waterbrick-3-5gal",
    brand: "WaterBrick",
    model: "Stackable 3.5 Gallon",
    emptyWeightLbs: 1.5,
    capacityGal: 3.5,
    mountType: "truck-bed",
    affiliateUrl: "https://www.amazon.com/dp/B00VJQKQDA?tag=prepperevo-20",
    notes:
      "9\"W x 18\"L x 6\"H. Brick-stacks for dense packing. Food-grade HDPE. BPA-free. Dual-handle.",
  },
  {
    id: "waterbrick-1-6gal",
    brand: "WaterBrick",
    model: "Stackable 1.6 Gallon",
    emptyWeightLbs: 0.9,
    capacityGal: 1.6,
    mountType: "truck-bed",
    affiliateUrl: "https://www.amazon.com/dp/B00VJQMDNG?tag=prepperevo-20",
    notes:
      "Compact half-brick. Same footprint, half the height. Fits under seats and in tight spots.",
  },

  // ─── LIFESAVER ───────────────────────────────────────────────────────────

  {
    id: "lifesaver-jerrycan-4-8gal",
    brand: "LifeSaver",
    model: "Jerrycan Water Purifier 18.5L (4.8 gal)",
    emptyWeightLbs: 9.5,
    capacityGal: 4.8,
    mountType: "truck-bed",
    affiliateUrl: "https://www.amazon.com/dp/B079RS4S42?tag=prepperevo-20",
    notes:
      "Built-in ultra-filtration — purifies as you pour. No chemicals needed. Military spec housing. Ideal for remote fill.",
  },

  // ─── OVERLAND VEHICLE SYSTEMS ────────────────────────────────────────────

  {
    id: "ovs-water-storage-5gal",
    brand: "OVS",
    model: "Water Storage Can 5 Gallon",
    emptyWeightLbs: 3.5,
    capacityGal: 5.0,
    mountType: "universal",
    affiliateUrl: "https://www.amazon.com/dp/B082BQFPJ2?tag=prepperevo-20",
    notes:
      "NATO jerry-can style. Thick HDPE walls. Compatible with standard jerry can mounts and holders.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getWaterTankBrands(): string[] {
  return [...new Set(waterTankDatabase.map((t) => t.brand))].sort();
}

export function getWaterTankModels(brand: string): WaterTankEntry[] {
  return waterTankDatabase
    .filter((t) => t.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findWaterTank(id: string): WaterTankEntry | undefined {
  return waterTankDatabase.find((t) => t.id === id);
}
