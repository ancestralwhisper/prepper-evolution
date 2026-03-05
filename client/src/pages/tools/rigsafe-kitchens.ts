// ─── RigSafe Slide-Out / Camp Kitchen Database ───────────────────────────────
// Real manufacturer specs for overland camp kitchen systems.
// For trucks and SUVs — NOT UTVs.
//
// Sources:
//   Weight: Manufacturer spec pages, Outside Online, Overland Expo reviews,
//     retailer product pages (OVS, Trail Kitchens, Scout Equipment)
//   mountType:
//     "truck-bed"  = slides out from truck bed or SUV cargo area
//     "hitch"      = deploys from 2" receiver hitch
//     "tailgate"   = folds down from tailgate / tailgate replacement

export interface SlideKitchenEntry {
  id: string;
  brand: string;
  model: string;
  weightLbs: number;
  mountType: "hitch" | "truck-bed" | "tailgate";
  affiliateUrl: string;
  notes?: string;
}

export const kitchenDatabase: SlideKitchenEntry[] = [
  // ─── SCOUT EQUIPMENT ─────────────────────────────────────────────────────

  {
    id: "scout-overland-kitchen",
    brand: "Scout Equipment",
    model: "Overland Kitchen",
    weightLbs: 100,
    mountType: "truck-bed",
    affiliateUrl: "#",
    notes: "Semi- and fully-custom builds for 4Runner, Tacoma, Jeep, Sprinter. Includes drawers, 2.5-gal water tank, collapsible sink, cutting board, stove shelf. 500 lb drawer load rating. Built to order, starts ~$5,500.",
  },

  // ─── OVS (OVERLAND VEHICLE SYSTEMS) ──────────────────────────────────────

  {
    id: "ovs-komodo-camp-kitchen",
    brand: "OVS",
    model: "Komodo Camp Kitchen",
    weightLbs: 52,
    mountType: "tailgate",
    affiliateUrl: "#",
    notes: "Stainless steel and aluminum. Dual grill + skillet + rocket tower. Folds flat for transport. Dimensions closed: 23.5\" × 14.5\" × 13\". Opens to 86\" × 39.5\".",
  },
  {
    id: "ovs-cargo-box-kitchen",
    brand: "OVS",
    model: "Cargo Box Kitchen",
    weightLbs: 76,
    mountType: "truck-bed",
    affiliateUrl: "#",
    notes: "Same Cargo Box (117Qt) with integrated slide-out kitchen and storage drawer. Universal fit. Works as standalone unit in truck bed or on trailer.",
  },
  {
    id: "ovs-camp-kitchen-table",
    brand: "OVS",
    model: "Camp Kitchen Table",
    weightLbs: 42,
    mountType: "tailgate",
    affiliateUrl: "#",
    notes: "Folding aluminum prep table that deploys from hitch receiver. Lightweight standalone option — no drawers, just work surface.",
  },

  // ─── FRONT RUNNER ─────────────────────────────────────────────────────────

  {
    id: "frontrunner-slide-out-kitchen",
    brand: "Front Runner",
    model: "Slide Out Kitchen",
    weightLbs: 55,
    mountType: "truck-bed",
    affiliateUrl: "#",
    notes: "Mounts to Front Runner load bed rack system or roof rack. Folds out from vehicle side. Includes stove bracket, prep surface, and hanging storage hooks.",
  },

  // ─── TRAIL KITCHENS ───────────────────────────────────────────────────────

  {
    id: "trail-kitchens-slide-kitchen",
    brand: "Trail Kitchens",
    model: "Compact Slide Kitchen",
    weightLbs: 58,
    mountType: "hitch",
    affiliateUrl: "#",
    notes: "2\" receiver hitch mount. Short tray: 27\" × 21\" × 20\". Aluminum frame. Slides out 24\" for full camp kitchen access. Works with any vehicle with a class III hitch.",
  },
  {
    id: "trail-kitchens-slide-kitchen-long",
    brand: "Trail Kitchens",
    model: "Slide Kitchen (Long Tray)",
    weightLbs: 62,
    mountType: "hitch",
    affiliateUrl: "#",
    notes: "2\" receiver hitch mount. Long tray: 31\" × 21\" × 20\". Extra prep space for groups. Stove, utensils, and storage sold separately.",
  },

  // ─── ARB ─────────────────────────────────────────────────────────────────

  {
    id: "arb-slide-out-kitchen-1045",
    brand: "ARB",
    model: "Slide Out Camp Kitchen 1045mm",
    weightLbs: 50,
    mountType: "truck-bed",
    affiliateUrl: "#",
    notes: "41\" × 20\" footprint. Pairs with ARB Roller Drawer system. Includes stove shelf, utensil rails, and storage space. Powder-coated steel.",
  },
  {
    id: "arb-slide-out-kitchen-1355",
    brand: "ARB",
    model: "Slide Out Camp Kitchen 1355mm",
    weightLbs: 65,
    mountType: "truck-bed",
    affiliateUrl: "#",
    notes: "53\" × 20\" footprint. Longer format for full-size truck beds. Full-extension slide, anti-rattle latch. Compatible with ARB drawer frames.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getKitchenBrands(): string[] {
  return [...new Set(kitchenDatabase.map((k) => k.brand))].sort();
}

export function getKitchenModels(brand: string): SlideKitchenEntry[] {
  return kitchenDatabase
    .filter((k) => k.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findKitchen(id: string): SlideKitchenEntry | undefined {
  return kitchenDatabase.find((k) => k.id === id);
}
