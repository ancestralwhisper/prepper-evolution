// ─── RigSafe Truck Drawer & Storage System Database ──────────────────────────
// Real manufacturer specs for truck-bed drawer systems and cargo storage.
// For trucks and SUVs — NOT UTVs.
//
// Sources:
//   Weight, payload: Manufacturer spec sheets (DECKED tech specs page,
//     ARB USA store, Goose Gear product pages, Front Runner specs)
//   Payload capacities are dynamic-load (moving vehicle) ratings where noted.
//   "full-system" = full dual-drawer + bed platform combo
//   "dual-drawer" = two-drawer unit without full platform
//   "single-drawer" = single pull-out unit or roller drawer

export interface DrawerEntry {
  id: string;
  brand: string;
  model: string;
  type: "single-drawer" | "dual-drawer" | "full-system";
  weightLbs: number;
  payloadCapacityLbs: number;
  compatibleBeds?: string[];
  affiliateUrl: string;
  notes?: string;
}

export const drawerDatabase: DrawerEntry[] = [
  // ─── DECKED ──────────────────────────────────────────────────────────────

  {
    id: "decked-fullsize",
    brand: "DECKED",
    model: "Drawer System — Full-Size",
    type: "full-system",
    weightLbs: 220,     // 208 lbs short bed / 233 lbs standard; 220 avg
    payloadCapacityLbs: 2000,
    compatibleBeds: ["5.5ft", "6.5ft", "8ft"],
    affiliateUrl: "#",
    notes: "2,000 lb top-deck payload. Two full-length drawers, each 186L volume. Weatherproof HDPE. Fits F-150, Silverado, Ram, Tundra, Tacoma (full-size).",
  },
  {
    id: "decked-midsize",
    brand: "DECKED",
    model: "Drawer System — Mid-Size",
    type: "full-system",
    weightLbs: 177,
    payloadCapacityLbs: 1000,   // 400 lb per drawer; 1,000 lb top-deck
    compatibleBeds: ["5ft", "5.5ft", "6ft"],
    affiliateUrl: "#",
    notes: "400 lb per drawer payload. Fits Tacoma, Colorado, Ranger, Frontier, Ridgeline. Lower profile than full-size system.",
  },
  {
    id: "decked-cargo-van",
    brand: "DECKED",
    model: "Drawer System — Cargo Van",
    type: "full-system",
    weightLbs: 195,
    payloadCapacityLbs: 2000,
    compatibleBeds: ["full-van-floor"],
    affiliateUrl: "#",
    notes: "Fits Transit, Sprinter, ProMaster, Express, Savana. Same 2,000 lb deck rating as truck system.",
  },

  // ─── ARB OUTBACK SOLUTIONS ────────────────────────────────────────────────

  {
    id: "arb-roller-drawer-rd945",
    brand: "ARB",
    model: "Outback Roller Drawer RD945",
    type: "single-drawer",
    weightLbs: 42,
    payloadCapacityLbs: 330,    // 150 kg per drawer rating
    affiliateUrl: "#",
    notes: "37.2\" L × 20\" W × 11\" H. Anti-roll-back system keeps drawer open on incline. Push-pull slam latch, key lockable.",
  },
  {
    id: "arb-roller-drawer-rd1355",
    brand: "ARB",
    model: "Outback Roller Drawer RD1355",
    type: "single-drawer",
    weightLbs: 55,
    payloadCapacityLbs: 330,
    affiliateUrl: "#",
    notes: "53\" L × 20\" W × 12\" H. Longer format for full-size truck beds. Floor and roller mat options available.",
  },

  // ─── GOOSE GEAR ──────────────────────────────────────────────────────────

  {
    id: "goose-gear-plate-system",
    brand: "Goose Gear",
    model: "Plate System",
    type: "full-system",
    weightLbs: 85,
    payloadCapacityLbs: 500,
    compatibleBeds: ["SUV-cargo-area"],
    affiliateUrl: "#",
    notes: "Aluminum plate system for 4Runner, Tacoma, FJ Cruiser cargo area. Modular — bolt-on kitchen/storage modules. Made in USA.",
  },
  {
    id: "goose-gear-camp-kitchen",
    brand: "Goose Gear",
    model: "CampKitchen 2.3 Module",
    type: "single-drawer",
    weightLbs: 79,
    payloadCapacityLbs: 300,
    compatibleBeds: ["SUV-cargo-area"],
    affiliateUrl: "#",
    notes: "25\" deep module. Mounts to Goose Gear Plate System. Slide-out stove shelf, storage drawers. Weight excludes stove and fridge.",
  },

  // ─── TRUCK VAULT ─────────────────────────────────────────────────────────

  {
    id: "truckvault-universal",
    brand: "Truck Vault",
    model: "Universal Truck Vault",
    type: "full-system",
    weightLbs: 160,
    payloadCapacityLbs: 1500,
    compatibleBeds: ["5.5ft", "6.5ft", "8ft"],
    affiliateUrl: "#",
    notes: "Heavy-duty locking aluminum vault. Field-adjustable dividers. Top surface rated 1,500 lb. Built to order.",
  },

  // ─── OVS (OVERLAND VEHICLE SYSTEMS) ──────────────────────────────────────

  {
    id: "ovs-cargo-box",
    brand: "OVS",
    model: "Cargo Box w/ Slide-Out Drawer",
    type: "single-drawer",
    weightLbs: 76,
    payloadCapacityLbs: 250,
    affiliateUrl: "https://www.amazon.com/dp/B09Q7ZVL4Z?tag=prepperevo-20",
    notes: "117Qt dry box with integrated slide-out drawer and workstation surface. Universal fit — works on most truck beds and trailers.",
  },

  // ─── FRONT RUNNER ─────────────────────────────────────────────────────────

  {
    id: "frontrunner-wolf-pack-pro",
    brand: "Front Runner",
    model: "Wolf Pack Pro Storage Box",
    type: "single-drawer",
    weightLbs: 11,
    payloadCapacityLbs: 110,    // 50 kg rated
    affiliateUrl: "#",
    notes: "Stackable modular storage box. 26L capacity. Not a drawer per se — sits on roof racks or bed platforms. Pairs with Front Runner load bed racks.",
  },
  {
    id: "frontrunner-load-bed-cargo-slide",
    brand: "Front Runner",
    model: "Load Bed Cargo Slide (Medium)",
    type: "full-system",
    weightLbs: 111,
    payloadCapacityLbs: 440,    // 200 kg dynamic load rating
    compatibleBeds: ["5.5ft", "6.5ft"],
    affiliateUrl: "#",
    notes: "Full-extension aluminum cargo slide. 440 lb dynamic load rating. Mounts inside truck bed without drilling. Pairs with Front Runner bed rack system.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDrawerBrands(): string[] {
  return [...new Set(drawerDatabase.map((d) => d.brand))].sort();
}

export function getDrawerModels(brand: string): DrawerEntry[] {
  return drawerDatabase
    .filter((d) => d.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findDrawer(id: string): DrawerEntry | undefined {
  return drawerDatabase.find((d) => d.id === id);
}
