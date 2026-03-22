// ─── RigSafe Modular Bed Cap Database ───────────────────────────────
// Real manufacturer specs for modular/overlanding bed caps.
//
// Sources:
//   Weight, load ratings: Manufacturer spec sheets & product pages
//   Vehicle fitments: Manufacturer vehicle selectors (verified Mar 2026)
//
// Notes on load ratings:
//   - "Dynamic" = on-road while driving
//   - "Off-road dynamic" = no bed cap manufacturer publishes this separately;
//     community consensus is it equals on-road dynamic — treated that way here
//   - Static = parked/stationary load (always higher than dynamic)
//   - 0 = not published by manufacturer

export interface BedCapFitment {
  make: string;            // must match vehicle-db make exactly (e.g. "Toyota", "Chevrolet")
  modelKeywords: string[]; // partial match against vehicle.model (e.g. ["Tacoma"])
  yearStart: number;
  yearEnd: number | null;  // null = current (2026+)
  bedLengths?: string[];   // informational (e.g. ["5 ft", "5.5 ft", "6.5 ft"])
}

export interface BedCapEntry {
  id: string;
  brand: string;
  model: string;
  material: "stainless-steel" | "aluminum" | "fiberglass" | "composite";
  weightLbs: number;
  weightNote?: string;         // e.g. "198–272 lbs by series/bed length"
  dynamicLoadLbs: number;      // on-road dynamic; 0 = not published
  staticLoadLbs: number;       // 0 = not published
  loadNote?: string;           // clarification on ratings
  features: string[];
  installType: "no-drill" | "drill" | "clamp" | "custom";
  hasGullwing: boolean;
  hasRails: boolean;
  hasMOLLE: boolean;
  warrantyYears: number | null; // null = not published
  universal: boolean;              // true = custom-fit any make/model (e.g. GFC)
  bedStiffenersRequired?: boolean; // true if manufacturer offers/recommends bed wall support trusses
  bedStiffenersNote?: string;      // specific note about bed wall reinforcement
  fitments: BedCapFitment[];
  websiteUrl: string;
  affiliateUrl?: string;
  notes?: string;
}

export const bedCapDatabase: BedCapEntry[] = [

  // ─── 1. RSI SmartCap EVO Series ─────────────────────────────────────
  {
    id: "rsi-smartcap-evo",
    brand: "RSI SmartCap",
    model: "EVO Series",
    material: "stainless-steel",
    weightLbs: 220,
    weightNote: "198–272 lbs depending on series (Sport/Adventure/Defender/Commercial) and bed length",
    dynamicLoadLbs: 330,
    staticLoadLbs: 770,
    loadNote: "Off-road dynamic not independently published by RSI — treated as equal to on-road dynamic (330 lbs) per community/installer reports. Verify with dealer for your use case.",
    bedStiffenersRequired: true,
    bedStiffenersNote: "RSI specifically notes that the 2022+ Toyota Tundra (and older/smaller trucks) may require bed stiffeners to handle the cap's weight on the bedrails. Without them, the stainless cap's load can deform the bedrails over time. RSI sells bed stiffeners for this — order them with the cap if you're on a Tundra or running a heavy loaded build.",
    features: [
      "5-piece modular — ships flat, installs in sections",
      "Universal roof rails included",
      "Positive-pressure vent (keeps dust out)",
      "Integrated 3rd brake light",
      "Front slider window",
      "Gullwing doors with sliders",
      "No-drill install with bed clamps",
      "Fully weatherproof, double seals",
      "Bed stiffeners available (required for 2022+ Tundra; recommended for heavy builds)",
    ],
    installType: "clamp",
    hasGullwing: true,
    hasRails: true,
    hasMOLLE: false,
    warrantyYears: 3,
    universal: false,
    fitments: [
      { make: "Toyota", modelKeywords: ["Tundra"], yearStart: 2022, yearEnd: null, bedLengths: ["5.5 ft", "6.5 ft"] },
      { make: "Toyota", modelKeywords: ["Tacoma"], yearStart: 2016, yearEnd: null, bedLengths: ["5 ft", "6 ft"] },
      { make: "Ford", modelKeywords: ["Ranger"], yearStart: 2024, yearEnd: null, bedLengths: ["5 ft"] },
    ],
    websiteUrl: "https://na.smartcap.com",
    notes: "North America focus. International models (Hilux, Navara, Amarok, etc.) available via global dealers. Always verify fitment via na.smartcap.com configurator for your exact year/bed.",
  },

  // ─── 2. Alu-Cab Contour Canopy ──────────────────────────────────────
  {
    id: "alu-cab-contour",
    brand: "Alu-Cab",
    model: "Contour Canopy",
    material: "aluminum",
    weightLbs: 130,
    weightNote: "~125–136 lbs midsize; slightly heavier for full-size. Precision-fit per bed length.",
    dynamicLoadLbs: 441,
    staticLoadLbs: 882,
    loadNote: "Off-road dynamic not separately published. Treated as equal to on-road dynamic (441 lbs). High-rated even at that figure.",
    features: [
      "Extruded aluminum — welded, not bolted",
      "Gullwing side doors + full rear door",
      "Integrated roof rail",
      "Positive-pressure vent (keeps interior dust-free)",
      "Double seals throughout",
      "Integrated interior lighting",
      "Powder-coated finish",
      "Separate models for short vs. long bed — precision fit",
    ],
    installType: "clamp",
    hasGullwing: true,
    hasRails: true,
    hasMOLLE: false,
    warrantyYears: null,
    universal: false,
    fitments: [
      { make: "Toyota", modelKeywords: ["Tundra"], yearStart: 2022, yearEnd: null, bedLengths: ["5.5 ft", "6.5 ft"] },
      { make: "Toyota", modelKeywords: ["Tacoma"], yearStart: 2016, yearEnd: null },
      { make: "Ford", modelKeywords: ["F-150"], yearStart: 2015, yearEnd: null, bedLengths: ["5.5 ft", "6.5 ft"] },
      { make: "Ford", modelKeywords: ["Ranger"], yearStart: 2012, yearEnd: null },
      { make: "Ram", modelKeywords: ["1500"], yearStart: 2009, yearEnd: null, bedLengths: ["5.5 ft", "6.5 ft"] },
      { make: "Chevrolet", modelKeywords: ["Colorado"], yearStart: 2023, yearEnd: null },
    ],
    websiteUrl: "https://alu-cab.com",
    notes: "Also covers international models (Hilux, Amarok, D-Max, BYD Shark). Verify fitment via dealer for exact year/bed.",
  },

  // ─── 3. GFC Platform Topper ─────────────────────────────────────────
  {
    id: "gfc-platform-topper",
    brand: "GFC",
    model: "Platform Topper",
    material: "aluminum",
    weightLbs: 152,
    weightNote: "145–160 lbs standard; 165–180 lbs XL. Custom-built per order.",
    dynamicLoadLbs: 800,
    staticLoadLbs: 800,
    loadNote: "800 lbs with optional Beef Bars (upgrade). Base dynamic not separately published — Beef Bars bring it to 800. Off-road not published separately.",
    features: [
      "Triangulated aluminum extrusion + billet joints — no welds",
      "Massive swing-open panel system ('Cabana Mode' — full side access)",
      "Off-road locks standard (panels stay shut on rough terrain)",
      "Embassy hinges (battle-tested, field-rebuildable)",
      "Integrated T-track rails throughout",
      "Lightest full-coverage topper in its class",
      "Stronger than steel at a fraction of the weight",
      "100% custom-built per VIN + bed length",
    ],
    installType: "custom",
    hasGullwing: false,
    hasRails: true,
    hasMOLLE: false,
    warrantyYears: null,
    universal: true,
    fitments: [],
    websiteUrl: "https://gofast.camp",
    notes: "Custom order only — submit your VIN and bed length. Lead times vary. Covers essentially any make/model truck. Panels swing open fully rather than gullwing — unique access system.",
  },

  // ─── 4. Dirtbox Overland Canopy ─────────────────────────────────────
  {
    id: "dirtbox-overland",
    brand: "Dirtbox Overland",
    model: "Canopy",
    material: "aluminum",
    weightLbs: 190,
    weightNote: "150–230 lbs depending on bed length and options.",
    dynamicLoadLbs: 0,
    staticLoadLbs: 0,
    loadNote: "Load ratings not published by manufacturer — designed well below truck payload limits. Contact Dirtbox directly for load data before mounting an RTT.",
    features: [
      "Fully TIG/laser-welded T5/T6 extruded aluminum",
      "L-track and MOLLE on roof, sides, and interior",
      "Pre-wired LED lighting + 12V power ports",
      "Front slider window",
      "No-drill brackets (compatible with bed liners)",
      "270° awning compatible",
      "Gullwing doors",
      "Extreme-weather tested",
    ],
    installType: "no-drill",
    hasGullwing: true,
    hasRails: true,
    hasMOLLE: true,
    warrantyYears: null,
    universal: false,
    fitments: [
      { make: "Toyota", modelKeywords: ["Tacoma"], yearStart: 2016, yearEnd: null },
      { make: "Toyota", modelKeywords: ["Tundra"], yearStart: 2022, yearEnd: null },
      { make: "Ford", modelKeywords: ["F-150"], yearStart: 2015, yearEnd: null },
      { make: "Ford", modelKeywords: ["F-250", "F-350"], yearStart: 2015, yearEnd: null },
      { make: "Chevrolet", modelKeywords: ["Silverado"], yearStart: 2015, yearEnd: null },
      { make: "Chevrolet", modelKeywords: ["Colorado"], yearStart: 2015, yearEnd: null },
      { make: "GMC", modelKeywords: ["Sierra"], yearStart: 2015, yearEnd: null },
      { make: "Ram", modelKeywords: ["1500"], yearStart: 2015, yearEnd: null },
    ],
    websiteUrl: "https://dirtboxoverland.com",
    notes: "Also covers custom applications (trailers, fire trucks). Contact for exact fitment and load ratings before ordering.",
  },

  // ─── 5. Westin EXP Truck Cap ─────────────────────────────────────────
  {
    id: "westin-exp",
    brand: "Westin",
    model: "EXP Truck Cap",
    material: "aluminum",
    weightLbs: 216,
    dynamicLoadLbs: 300,
    staticLoadLbs: 700,
    loadNote: "Off-road dynamic not separately published. Treated as equal to on-road dynamic (300 lbs).",
    features: [
      "Double-wall powder-coated aluminum (modular panels)",
      "Gullwing doors with locking T-handles",
      "Integrated interior T-slot extrusions",
      "No-drill install",
      "Sliding front glass option",
      "Textured black finish",
    ],
    installType: "no-drill",
    hasGullwing: true,
    hasRails: true,
    hasMOLLE: false,
    warrantyYears: null,
    universal: false,
    fitments: [
      { make: "Ford", modelKeywords: ["Ranger"], yearStart: 2024, yearEnd: null },
      { make: "Ford", modelKeywords: ["Maverick"], yearStart: 2022, yearEnd: null },
      { make: "Ford", modelKeywords: ["F-150"], yearStart: 2021, yearEnd: null },
      { make: "Toyota", modelKeywords: ["Tacoma"], yearStart: 2016, yearEnd: null },
      { make: "Toyota", modelKeywords: ["Tundra"], yearStart: 2022, yearEnd: null },
      { make: "Chevrolet", modelKeywords: ["Silverado"], yearStart: 2019, yearEnd: null },
      { make: "Ram", modelKeywords: ["1500"], yearStart: 2019, yearEnd: null },
    ],
    websiteUrl: "https://westinautomotive.com",
    notes: "Verify exact year/trim fitment via westinautomotive.com vehicle selector.",
  },

  // ─── 6. OVS Expedition Cap ──────────────────────────────────────────
  {
    id: "ovs-expedition-cap",
    brand: "OVS",
    model: "Expedition Cap",
    material: "stainless-steel",
    weightLbs: 225,
    weightNote: "~225 lbs actual; ~250 lbs shipping weight. 5-piece modular.",
    dynamicLoadLbs: 325,
    staticLoadLbs: 750,
    loadNote: "Dynamic rating requires crossbars (included as option). Off-road dynamic not separately published — treated as equal to on-road dynamic (325 lbs).",
    features: [
      "Marine-grade stainless steel (5-piece modular)",
      "Full gullwing doors + MOLLE panels",
      "Front and rear windows",
      "Integrated 3rd brake light",
      "Fixed vent",
      "Keyed-alike locks",
      "No-drill clamp install (True-Fit tech)",
      "Lifetime warranty",
      "Optional crossbars for roof load",
    ],
    installType: "no-drill",
    hasGullwing: true,
    hasRails: true,
    hasMOLLE: true,
    warrantyYears: null, // lifetime — not a number
    universal: false,
    fitments: [
      { make: "Toyota", modelKeywords: ["Tacoma"], yearStart: 2016, yearEnd: 2023, bedLengths: ["5 ft", "6 ft"] },
      { make: "Toyota", modelKeywords: ["Tacoma"], yearStart: 2024, yearEnd: null, bedLengths: ["5 ft", "6 ft"] },
      { make: "Toyota", modelKeywords: ["Tundra"], yearStart: 2007, yearEnd: 2021, bedLengths: ["5.5 ft"] },
      { make: "Toyota", modelKeywords: ["Tundra"], yearStart: 2022, yearEnd: null, bedLengths: ["5.5 ft"] },
      { make: "Ford", modelKeywords: ["F-150"], yearStart: 2021, yearEnd: null, bedLengths: ["5.5 ft", "6.5 ft"] },
      { make: "Ford", modelKeywords: ["Ranger"], yearStart: 2019, yearEnd: null, bedLengths: ["5 ft"] },
      { make: "Ford", modelKeywords: ["F-250", "F-350"], yearStart: 2017, yearEnd: null, bedLengths: ["6.8 ft"] },
      { make: "Ford", modelKeywords: ["Maverick"], yearStart: 2022, yearEnd: null, bedLengths: ["4.5 ft"] },
      { make: "Ram", modelKeywords: ["1500"], yearStart: 2019, yearEnd: null, bedLengths: ["5.7 ft"] },
      { make: "Ram", modelKeywords: ["2500", "3500"], yearStart: 2009, yearEnd: null, bedLengths: ["6.4 ft"] },
      { make: "Chevrolet", modelKeywords: ["Silverado"], yearStart: 2015, yearEnd: null, bedLengths: ["5 ft", "5.8 ft"] },
      { make: "Chevrolet", modelKeywords: ["Colorado"], yearStart: 2015, yearEnd: null, bedLengths: ["5 ft"] },
      { make: "GMC", modelKeywords: ["Sierra"], yearStart: 2015, yearEnd: null, bedLengths: ["5 ft", "5.8 ft"] },
      { make: "GMC", modelKeywords: ["Canyon"], yearStart: 2015, yearEnd: null, bedLengths: ["5 ft"] },
      { make: "Jeep", modelKeywords: ["Gladiator"], yearStart: 2020, yearEnd: null, bedLengths: ["5 ft"] },
    ],
    websiteUrl: "https://ovs-online.com",
    notes: "Exclusions: RAMBOX and Carbon Pro trims require fitment verification. Lifetime warranty on frame. Crossbars required for maximum rated dynamic load.",
  },

  // ─── 7. Rough Country Modular Bed Cap ───────────────────────────────
  {
    id: "rough-country-modular",
    brand: "Rough Country",
    model: "Modular Bed Cap",
    material: "stainless-steel",
    weightLbs: 185,
    weightNote: "Lighter than traditional steel caps. Exact weight varies by model/bed length.",
    dynamicLoadLbs: 400,
    staticLoadLbs: 750,
    loadNote: "Off-road dynamic not separately published. Treated as equal to on-road dynamic (400 lbs).",
    features: [
      "Stainless steel frame with modular panels",
      "Locking gullwing doors",
      "MOLLE panels (side and rear)",
      "UV-resistant weatherproof seals",
      "Integrated mounting system",
      "LED interior lighting option",
    ],
    installType: "clamp",
    hasGullwing: true,
    hasRails: true,
    hasMOLLE: true,
    warrantyYears: null,
    universal: false,
    fitments: [
      { make: "Ford", modelKeywords: ["F-150"], yearStart: 2019, yearEnd: null, bedLengths: ["5.7 ft"] },
      { make: "Ram", modelKeywords: ["1500"], yearStart: 2019, yearEnd: null, bedLengths: ["5.7 ft"] },
      { make: "Chevrolet", modelKeywords: ["Silverado"], yearStart: 2019, yearEnd: null, bedLengths: ["5.8 ft"] },
      { make: "GMC", modelKeywords: ["Sierra"], yearStart: 2019, yearEnd: null, bedLengths: ["5.8 ft"] },
      { make: "Toyota", modelKeywords: ["Tacoma"], yearStart: 2016, yearEnd: null },
      { make: "Jeep", modelKeywords: ["Gladiator"], yearStart: 2020, yearEnd: null },
    ],
    websiteUrl: "https://rough-country.com",
    notes: "Verify exact SKU and fitment via rough-country.com — multiple SKUs for different truck/bed combinations.",
  },

  // ─── 8. Leer NexCap ─────────────────────────────────────────────────
  {
    id: "leer-nexcap",
    brand: "Leer",
    model: "NexCap",
    material: "aluminum",
    weightLbs: 220,
    weightNote: "Low-profile (13.78\" height) ~220 lbs; standard (20.47\" height) ~240 lbs.",
    dynamicLoadLbs: 300,
    staticLoadLbs: 660,
    loadNote: "Static 660 lbs published. Dynamic not separately published — 300 lbs is an estimate. Off-road dynamic not published. Verify with Leer dealer for exact ratings.",
    features: [
      "Modular aluminum/metal panels",
      "No-drill install",
      "T-slot rails + MOLLE panels",
      "Gullwing doors",
      "Weather-resistant construction",
      "Ships direct",
      "Two height profiles: low (13.78\") and standard (20.47\")",
      "Pro version adds commercial reinforcements",
    ],
    installType: "no-drill",
    hasGullwing: true,
    hasRails: true,
    hasMOLLE: true,
    warrantyYears: 3,
    universal: false,
    fitments: [
      { make: "Ford", modelKeywords: ["F-150"], yearStart: 2021, yearEnd: null },
      { make: "Ford", modelKeywords: ["Ranger"], yearStart: 2021, yearEnd: null },
      { make: "Ram", modelKeywords: ["1500"], yearStart: 2019, yearEnd: null },
      { make: "Chevrolet", modelKeywords: ["Silverado"], yearStart: 2019, yearEnd: null },
      { make: "GMC", modelKeywords: ["Sierra"], yearStart: 2019, yearEnd: null },
      { make: "Toyota", modelKeywords: ["Tundra"], yearStart: 2022, yearEnd: null },
      { make: "Toyota", modelKeywords: ["Tacoma"], yearStart: 2016, yearEnd: null },
    ],
    websiteUrl: "https://leer.com",
    notes: "Verify fitment via leer.com selector. Two profile heights available — choose based on clearance needs.",
  },

  // ─── 9. Roveroll Full-Size Truck Cap 2.0 ────────────────────────────
  {
    id: "roveroll-20",
    brand: "Roveroll",
    model: "Full-Size Truck Cap 2.0",
    material: "composite",
    weightLbs: 165,
    weightNote: "~154 lbs (5.0 ft bed); ~187 lbs (6.5 ft bed). Aluminum shell + honeycomb composite roof.",
    dynamicLoadLbs: 440,
    staticLoadLbs: 880,
    loadNote: "Off-road dynamic not separately published. Treated as equal to on-road dynamic (440 lbs). Load-tested per manufacturer.",
    features: [
      "Aluminum shell with honeycomb composite roof",
      "Triple gullwing doors (62\" opening — widest in class)",
      "Dual T-slot rails (front and rear independent)",
      "No-drill 30-minute install",
      "Integrated LEDs + 3rd brake light",
      "Double EPDM weatherproof seals",
      "Fully waterproof (lab-tested -35°C to 50°C)",
      "Modular rivet structure",
    ],
    installType: "no-drill",
    hasGullwing: true,
    hasRails: true,
    hasMOLLE: false,
    warrantyYears: 2,
    universal: false,
    fitments: [
      { make: "Toyota", modelKeywords: ["Tacoma"], yearStart: 2016, yearEnd: null, bedLengths: ["5 ft", "6 ft"] },
      { make: "Toyota", modelKeywords: ["Tundra"], yearStart: 2022, yearEnd: null, bedLengths: ["5.5 ft", "6.5 ft"] },
      { make: "Ford", modelKeywords: ["F-150"], yearStart: 2019, yearEnd: null },
      { make: "Chevrolet", modelKeywords: ["Silverado"], yearStart: 2019, yearEnd: null },
      { make: "GMC", modelKeywords: ["Sierra"], yearStart: 2019, yearEnd: null },
      { make: "Ram", modelKeywords: ["1500"], yearStart: 2019, yearEnd: null },
    ],
    websiteUrl: "https://roveroll.com",
    notes: "Verify exact fitment via roveroll.com vehicle selector.",
  },

  // ─── 10. A.R.E HD Series ────────────────────────────────────────────
  {
    id: "are-hd-series",
    brand: "A.R.E",
    model: "HD Series",
    material: "fiberglass",
    weightLbs: 215,
    weightNote: "180–250 lbs depending on configuration and bed length.",
    dynamicLoadLbs: 275,
    staticLoadLbs: 550,
    loadNote: "Static 550 lbs published (HD series roof rack rating). Dynamic on-road and off-road not independently published by A.R.E — 275 lbs is a conservative estimate. Toolbox side load: 200 lbs each. Verify with dealer.",
    features: [
      "Fiberglass shell with internal aluminum skeleton",
      "Heavy-duty roof rails tied to internal skeleton",
      "Gullwing or walk-in door options",
      "T-rails for toolboxes and racks",
      "Screened windows",
      "Commercial-grade durability",
      "Multiple paint/gelcoat finish options",
    ],
    installType: "clamp",
    hasGullwing: true,
    hasRails: true,
    hasMOLLE: false,
    warrantyYears: null,
    universal: false,
    fitments: [
      { make: "Ford", modelKeywords: ["F-150"], yearStart: 2015, yearEnd: null },
      { make: "Ram", modelKeywords: ["1500"], yearStart: 2009, yearEnd: null },
      { make: "Chevrolet", modelKeywords: ["Silverado"], yearStart: 2015, yearEnd: null },
      { make: "GMC", modelKeywords: ["Sierra"], yearStart: 2015, yearEnd: null },
      { make: "Toyota", modelKeywords: ["Tundra"], yearStart: 2014, yearEnd: null },
      { make: "Toyota", modelKeywords: ["Tacoma"], yearStart: 2005, yearEnd: null },
      { make: "Nissan", modelKeywords: ["Titan"], yearStart: 2016, yearEnd: null },
      { make: "Nissan", modelKeywords: ["Frontier"], yearStart: 2005, yearEnd: null },
    ],
    websiteUrl: "https://are-accessories.com",
    notes: "CX/MX profiles cover most applications. Multiple cab/bed combos — use are-accessories.com or call a dealer for exact fit confirmation.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

export function getBedCapBrands(): string[] {
  return Array.from(new Set(bedCapDatabase.map((c) => c.brand))).sort();
}

export function getBedCapModels(brand: string): BedCapEntry[] {
  return bedCapDatabase.filter((c) => c.brand === brand);
}

export function findBedCap(id: string): BedCapEntry | undefined {
  return bedCapDatabase.find((c) => c.id === id);
}

/** Returns all caps compatible with the given vehicle (or all caps if vehicle is unknown). */
export function getBedCapsForVehicle(
  make: string,
  model: string,
  year: number,
): BedCapEntry[] {
  if (!make || !model || !year) return bedCapDatabase;

  return bedCapDatabase.filter((cap) => {
    if (cap.universal) return true;
    return cap.fitments.some((fit) => {
      if (fit.make !== make) return false;
      if (fit.yearStart > year) return false;
      if (fit.yearEnd !== null && fit.yearEnd < year) return false;
      return fit.modelKeywords.some((kw) => model.includes(kw));
    });
  });
}
