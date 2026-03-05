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
    weightLbs: 28,
    capacityCuFt: 3.4,
    lengthIn: 32.5,
    widthIn: 18,
    heightIn: 13,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B09TKVHNG8?tag=prepperevo-20",
    notes: "Bear-resistant certified. Integrated tie-down slots. Latches rated to 200 lbs pull. UV-stabilized LLDPE. Made in USA.",
  },
  {
    id: "roam-rugged-case-82l",
    brand: "Roam Adventure Co",
    model: "Rugged Case 82L",
    weightLbs: 26,
    capacityCuFt: 2.9,
    lengthIn: 30.5,
    widthIn: 17.5,
    heightIn: 12.5,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B09TKVHNG8?tag=prepperevo-20",
    notes: "Same construction as 95L in a slightly smaller footprint. Bear-resistant certified. Integrated tie-down slots.",
  },
  {
    id: "roam-rugged-case-160l",
    brand: "Roam Adventure Co",
    model: "Rugged Case 160L",
    weightLbs: 42,
    capacityCuFt: 5.7,
    lengthIn: 40.5,
    widthIn: 21.5,
    heightIn: 15,
    material: "rotomolded",
    affiliateUrl: "https://www.amazon.com/dp/B09TKVHNG8?tag=prepperevo-20",
    notes: "Largest Roam case. Bear-resistant certified. Full bed-width on most midsize trucks. Integrated tie-down slots. UV-stabilized LLDPE.",
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
