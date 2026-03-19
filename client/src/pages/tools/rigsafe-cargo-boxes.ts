// ─── RigSafe Cargo Box / Storage Case Database ──────────────────────────────
// Real manufacturer specs for cargo boxes, cases, and storage totes
// used on roof racks and bed racks for overlanding.
//
// Sources:
//   Weight, dimensions, capacity: Manufacturer spec sheets and product pages.
//   Capacity in cubic feet calculated from L×W×H interior dimensions.
//   Material: rotomolded = LLDPE rotational mold, aluminum = welded aluminum,
//             plastic = injection-molded HDPE or similar.

export interface CargoBoxEntry {
  id: string;
  brand: string;
  model: string;
  weightLbs: number;
  capacityCuFt: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  material: "rotomolded" | "aluminum" | "plastic";
  affiliateUrl: string;
  notes?: string;
}

export const cargoBoxDatabase: CargoBoxEntry[] = [
  // ─── ROAM ADVENTURE CO ────────────────────────────────────────────────────

  {
    id: "roam-rugged-case-95l",
    brand: "Roam Adventure Co",
    model: "Rugged Case 95L",
    weightLbs: 25,
    capacityCuFt: 3.35,
    lengthIn: 47.2,
    widthIn: 18.8,
    heightIn: 10.9,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B09TKVHNG8?tag=prepperevo-20",
    notes: "Low-profile flat design — long footprint, check rack length. Bear-resistant certified. Integrated tie-down slots. UV-stabilized LLDPE. Made in USA.",
  },
  {
    id: "roam-rugged-case-55l",
    brand: "Roam Adventure Co",
    model: "Rugged Case 55L",
    weightLbs: 17,
    capacityCuFt: 1.94,
    lengthIn: 25.2,
    widthIn: 14.4,
    heightIn: 14.1,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B09TKVHNG8?tag=prepperevo-20",
    notes: "Compact enough for cab roof racks. Bear-resistant certified. Integrated tie-down slots. UV-stabilized LLDPE. Made in USA.",
  },
  {
    id: "roam-rugged-case-76l",
    brand: "Roam Adventure Co",
    model: "Rugged Case 76L",
    weightLbs: 20,
    capacityCuFt: 2.68,
    lengthIn: 27.4,
    widthIn: 17.8,
    heightIn: 14.2,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B09TKVHNG8?tag=prepperevo-20",
    notes: "Mid-range size. Bear-resistant certified. Integrated tie-down slots. UV-stabilized LLDPE. Made in USA.",
  },
  {
    id: "roam-rugged-case-83l",
    brand: "Roam Adventure Co",
    model: "Rugged Case 83L",
    weightLbs: 23,
    capacityCuFt: 2.93,
    lengthIn: 27.5,
    widthIn: 18.1,
    heightIn: 15.0,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B0CQ34CWKK?tag=prepperevo-20",
    notes: "Bear-resistant certified. Integrated tie-down slots. UV-stabilized LLDPE. Made in USA.",
  },
  {
    id: "roam-rugged-case-105l",
    brand: "Roam Adventure Co",
    model: "Rugged Case 105L",
    weightLbs: 27,
    capacityCuFt: 3.71,
    lengthIn: 33.0,
    widthIn: 19.1,
    heightIn: 15.5,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B09TKVHNG8?tag=prepperevo-20",
    notes: "Large format. Bear-resistant certified. Full bed-width on most full-size trucks. Integrated tie-down slots. UV-stabilized LLDPE. Made in USA.",
  },
  {
    id: "roam-rugged-case-160l",
    brand: "Roam Adventure Co",
    model: "Rugged Case 160L",
    weightLbs: 35,
    capacityCuFt: 5.65,
    lengthIn: 35.8,
    widthIn: 22.4,
    heightIn: 17.6,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B09TKVHNG8?tag=prepperevo-20",
    notes: "Largest Roam case. Bear-resistant certified. Full bed-width on most full-size trucks. Integrated tie-down slots. UV-stabilized LLDPE.",
  },

  // ─── 23ZERO ───────────────────────────────────────────────────────────────

  {
    id: "23zero-case-50l",
    brand: "23zero",
    model: "Overland Gear Box 50L",
    weightLbs: 17,
    capacityCuFt: 1.77,
    lengthIn: 24.5,
    widthIn: 15.0,
    heightIn: 14.0,
    material: "rotomolded",
    affiliateUrl: "https://23zero.com/collections/overland-gear-boxes",
    notes: "Australian overlanding brand. Dust and waterproof seal. Integrated tie-down points. Not sold on Amazon — direct from 23zero.com.",
  },
  {
    id: "23zero-case-70l",
    brand: "23zero",
    model: "Overland Gear Box 70L",
    weightLbs: 21,
    capacityCuFt: 2.47,
    lengthIn: 27.25,
    widthIn: 17.5,
    heightIn: 13.5,
    material: "rotomolded",
    affiliateUrl: "https://23zero.com/collections/overland-gear-boxes",
    notes: "Australian overlanding brand. Dust and waterproof seal. Integrated tie-down points. Not sold on Amazon — direct from 23zero.com.",
  },
  {
    id: "23zero-case-102l",
    brand: "23zero",
    model: "Overland Gear Box 102L",
    weightLbs: 30,
    capacityCuFt: 3.60,
    lengthIn: 50.5,
    widthIn: 18.75,
    heightIn: 9.5,
    material: "rotomolded",
    affiliateUrl: "https://23zero.com/collections/overland-gear-boxes",
    notes: "Low-profile flat design. Long footprint — check rack length before ordering. Dust and waterproof seal. Not sold on Amazon — direct from 23zero.com.",
  },

  // ─── OPENROAD4WD ──────────────────────────────────────────────────────────

  {
    id: "openroad4wd-case-50l",
    brand: "OpenRoad4WD",
    model: "Rugged Case 50L",
    weightLbs: 16,
    capacityCuFt: 1.77,
    lengthIn: 24.8,
    widthIn: 14.5,
    heightIn: 12.9,
    material: "rotomolded",
    affiliateUrl: "https://openroad4wd.com/collections/storage-cases",
    notes: "Compact rotomolded case. Integrated tie-down points. Not sold on Amazon — direct from openroad4wd.com.",
  },
  {
    id: "openroad4wd-case-102l",
    brand: "OpenRoad4WD",
    model: "Rugged Case 102L",
    weightLbs: 28,
    capacityCuFt: 3.60,
    lengthIn: 50.4,
    widthIn: 19.1,
    heightIn: 9.7,
    material: "rotomolded",
    affiliateUrl: "https://openroad4wd.com/collections/storage-cases",
    notes: "Low-profile flat design. Long footprint — check rack length before ordering. Integrated tie-down points. Not sold on Amazon — direct from openroad4wd.com.",
  },

  // ─── FRONT RUNNER ─────────────────────────────────────────────────────────

  {
    id: "frontrunner-wolf-pack-pro",
    brand: "Front Runner",
    model: "Wolf Pack Pro",
    weightLbs: 8,
    capacityCuFt: 1.5,
    lengthIn: 22,
    widthIn: 14.5,
    heightIn: 10.2,
    material: "plastic",
    affiliateUrl: "https://www.amazon.com/dp/B0BVBMY8WK?tag=prepperevo-20",
    notes: "Stackable modular storage. 26L capacity. Fits Front Runner Slimline II trays. Lockable lid with integrated seal. IP54 dust/splash resistant.",
  },
  {
    id: "frontrunner-flat-pack",
    brand: "Front Runner",
    model: "Flat Pack",
    weightLbs: 5,
    capacityCuFt: 0.8,
    lengthIn: 22,
    widthIn: 14.5,
    heightIn: 5.5,
    material: "plastic",
    affiliateUrl: "https://www.amazon.com/dp/B0BVBMY8WK?tag=prepperevo-20",
    notes: "Low-profile stackable storage. Same footprint as Wolf Pack Pro but half the height. Great for recovery gear or flat items.",
  },

  // ─── PELICAN ──────────────────────────────────────────────────────────────

  {
    id: "pelican-bx135",
    brand: "Pelican",
    model: "BX135 Cargo Case",
    weightLbs: 25,
    capacityCuFt: 4.8,
    lengthIn: 38.3,
    widthIn: 19.4,
    heightIn: 14.4,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B0C5JJ1RBB?tag=prepperevo-20",
    notes: "135-quart capacity. Press & Pull latches. Built-in tie-down points. Stackable. Dust and splash resistant. Made by Pelican (same quality as their gun cases).",
  },
  {
    id: "pelican-bx80",
    brand: "Pelican",
    model: "BX80 Cargo Case",
    weightLbs: 18,
    capacityCuFt: 2.8,
    lengthIn: 30.3,
    widthIn: 17.3,
    heightIn: 12.2,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B0C5JHYFLF?tag=prepperevo-20",
    notes: "80-quart capacity. Press & Pull latches. Built-in tie-down points. Stackable with BX135. Lighter option for rack mounting.",
  },

  // ─── DECKED ───────────────────────────────────────────────────────────────

  {
    id: "decked-d-box",
    brand: "DECKED",
    model: "D-Box Drawer System",
    weightLbs: 15,
    capacityCuFt: 1.7,
    lengthIn: 22,
    widthIn: 17,
    heightIn: 10,
    material: "plastic",
    affiliateUrl: "https://www.amazon.com/dp/B07N9J5YGS?tag=prepperevo-20",
    notes: "Designed to fit inside DECKED drawer system but works standalone on racks. Ammo-can style latches. Watertight seal. Stackable. Sold individually.",
  },

  // ─── PLANO ────────────────────────────────────────────────────────────────

  {
    id: "plano-sportsman-trunk-68qt",
    brand: "Plano",
    model: "Sportsman Trunk 68-Quart",
    weightLbs: 12,
    capacityCuFt: 2.4,
    lengthIn: 30,
    widthIn: 17,
    heightIn: 13.5,
    material: "plastic",
    affiliateUrl: "https://www.amazon.com/dp/B003E3ZLMU?tag=prepperevo-20",
    notes: "Budget-friendly camp storage. Padlock tabs for security. Stackable design. Not as rugged as rotomolded options but very affordable.",
  },

  // ─── RUBBERMAID ACTIONPACKER ──────────────────────────────────────────────

  {
    id: "rubbermaid-actionpacker-48gal",
    brand: "Rubbermaid",
    model: "ActionPacker 48-Gallon",
    weightLbs: 15,
    capacityCuFt: 6.4,
    lengthIn: 43.8,
    widthIn: 20.4,
    heightIn: 17.4,
    material: "plastic",
    affiliateUrl: "https://www.amazon.com/dp/B00005KC0E?tag=prepperevo-20",
    notes: "Budget king. 48-gallon capacity. Padlock tabs. Not as dust-tight as rotomolded cases. Great for non-sensitive gear. Widely available.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getCargoBoxBrands(): string[] {
  return [...new Set(cargoBoxDatabase.map((b) => b.brand))].sort();
}

export function getCargoBoxModels(brand: string): CargoBoxEntry[] {
  return cargoBoxDatabase
    .filter((b) => b.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findCargoBox(id: string): CargoBoxEntry | undefined {
  return cargoBoxDatabase.find((b) => b.id === id);
}
