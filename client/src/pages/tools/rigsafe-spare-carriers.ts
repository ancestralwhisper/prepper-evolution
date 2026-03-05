// ─── RigSafe Spare Tire Carrier Database ─────────────────────────────────────
// Real manufacturer specs for spare tire carriers used on trucks and SUVs.
// UTVs NOT included — this is for full-size and mid-size vehicles only.
//
// Sources:
//   Weight, capacity, mount type: Manufacturer spec sheets & product pages
//   Tire size ratings: Manufacturer listings and retailer specs
//   Hitch carriers assume Class III 2" receiver unless noted

export interface SpareCarrierEntry {
  id: string;
  brand: string;
  model: string;
  carrierWeightLbs: number;
  maxTireSizeIn: number;
  mountType: "swing-out" | "hitch" | "bed" | "bumper-integrated";
  affiliateUrl: string;
  notes?: string;
}

export const spareCarrierDatabase: SpareCarrierEntry[] = [
  // ─── WILCO OFFROAD ───────────────────────────────────────────────────

  {
    id: "wilco-hitchgate-solo",
    brand: "Wilco Offroad",
    model: "Hitchgate Solo",
    carrierWeightLbs: 54,
    maxTireSizeIn: 35,
    mountType: "hitch",
    affiliateUrl: "https://www.amazon.com/dp/B07ZGFLPF5?tag=prepperevo-20",
    notes:
      "Universal 2\" Class III hitch mount. Swing-away design. Tow-rated to 7,500 lbs. Hi-Clearance version available.",
  },
  {
    id: "wilco-tiregate-vertical",
    brand: "Wilco Offroad",
    model: "Vertical Tiregate",
    carrierWeightLbs: 38,
    maxTireSizeIn: 35,
    mountType: "bed",
    affiliateUrl: "#",
    notes:
      "Mounts vertically on inside bed rail. Replaces factory tailgate area. Keeps tire off the ground. Full-size truck fitment.",
  },

  // ─── RIGD SUPPLY ─────────────────────────────────────────────────────

  {
    id: "rigd-ultraswing-multifit",
    brand: "RIGd Supply",
    model: "UltraSwing Multi-Fit",
    carrierWeightLbs: 65,
    maxTireSizeIn: 37,
    mountType: "hitch",
    affiliateUrl: "https://www.amazon.com/dp/B08CGLXNWZ?tag=prepperevo-20",
    notes:
      "2\" hitch mount. 250 lb total capacity — handles tire plus accessories (bikes, jerry cans). Tow-rated to 10,000 lbs. Lockable.",
  },
  {
    id: "rigd-ultraswing-megafit",
    brand: "RIGd Supply",
    model: "UltraSwing Mega-Fit",
    carrierWeightLbs: 70,
    maxTireSizeIn: 40,
    mountType: "hitch",
    affiliateUrl: "#",
    notes:
      "Heavy-duty version. 8-lug wheel plate. Designed for 3/4-ton and larger trucks running big tires.",
  },

  // ─── C4 FABRICATION ──────────────────────────────────────────────────

  {
    id: "c4-fab-rear-swing-bumper",
    brand: "C4 Fabrication",
    model: "Overland Rear Bumper w/ Single Swing",
    carrierWeightLbs: 200,
    maxTireSizeIn: 37,
    mountType: "bumper-integrated",
    affiliateUrl: "#",
    notes:
      "Bumper + tire carrier as a single unit. Vehicle-specific fitment (4Runner, Tacoma, etc.). Adds ~200 lbs total. Full-replacement bumper.",
  },

  // ─── EXPEDITION ONE ───────────────────────────────────────────────────

  {
    id: "exp-one-trail-series-swing",
    brand: "Expedition One",
    model: "Trail Series Rear Bumper w/ Tire Carrier",
    carrierWeightLbs: 125,
    maxTireSizeIn: 35,
    mountType: "bumper-integrated",
    affiliateUrl: "#",
    notes:
      "Smooth Motion tire carrier system. FJ Cruiser-spec weight ~125 lbs; Tacoma dual swing ~220 lbs. Vehicle-specific build.",
  },

  // ─── BODY ARMOR ───────────────────────────────────────────────────────

  {
    id: "body-armor-swing-arm",
    brand: "Body Armor 4x4",
    model: "Swing Arm Tire Carrier",
    carrierWeightLbs: 45,
    maxTireSizeIn: 35,
    mountType: "swing-out",
    affiliateUrl: "https://www.amazon.com/dp/B005W35WYE?tag=prepperevo-20",
    notes:
      "Bolt-on to existing rear bumper. Jeep JK and universal fitments. Budget-friendly entry-level swing-arm.",
  },

  // ─── CALI RAISED LED ─────────────────────────────────────────────────

  {
    id: "cali-raised-swing-arm-tacoma",
    brand: "Cali Raised LED",
    model: "Tacoma Swing Arm Bumper Tire Carrier",
    carrierWeightLbs: 185,
    maxTireSizeIn: 35,
    mountType: "bumper-integrated",
    affiliateUrl: "#",
    notes:
      "CBI Offroad built. Dual swing arm. Tacoma 2nd and 3rd Gen fitments. Full replacement rear bumper with tire carrier.",
  },

  // ─── WARRIOR PRODUCTS ────────────────────────────────────────────────

  {
    id: "warrior-sport-spare-carrier",
    brand: "Warrior Products",
    model: "Sport Spare Tire Carrier",
    carrierWeightLbs: 32,
    maxTireSizeIn: 33,
    mountType: "hitch",
    affiliateUrl: "https://www.amazon.com/dp/B004JB53VM?tag=prepperevo-20",
    notes:
      "Lightweight hitch-mount carrier. 2\" receiver. Good entry-level option for smaller SUVs and light-duty applications.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getSpareCarrierBrands(): string[] {
  return [...new Set(spareCarrierDatabase.map((c) => c.brand))].sort();
}

export function getSpareCarrierModels(brand: string): SpareCarrierEntry[] {
  return spareCarrierDatabase
    .filter((c) => c.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findSpareCarrier(id: string): SpareCarrierEntry | undefined {
  return spareCarrierDatabase.find((c) => c.id === id);
}
