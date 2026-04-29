// ─── Overland Load Balancer — Upgrades Database ──────────────────────
// Vehicle modifications that permanently add to curb weight and therefore
// REDUCE available payload capacity.
//
// CRITICAL: These weights are deducted from your stock payload BEFORE
// gear is ever loaded. This is the number most overlanders ignore.
//
// Sources:
//   Weights: Manufacturer spec sheets, verified product listings, community data.
//   Net weight = weight of new part minus weight of stock part removed (where applicable).
//   All weights are bare part weight (no packaging).

export type UpgradeCategory =
  | "bumpers"
  | "winch"
  | "suspension"
  | "protection"
  | "storage"
  | "electrical"
  | "exterior"
  | "shelter"
  | "tires"
  | "towing";

export interface LBUpgrade {
  id: string;
  name: string;
  category: UpgradeCategory;
  weightLbs: number; // net weight ADDED to the vehicle
  description: string;
  affectsHighCG: boolean; // true = raises center of gravity (roof-mounted, high items)
  notes?: string;
}

export const upgradeDatabase: LBUpgrade[] = [

  // ══════════════════════════════════════════════════════════════════
  // BUMPERS — Net weight after removing stock bumper/fascia
  // Stock plastic front fascia typically 10–20 lbs
  // Stock steel rear bumper typically 20–35 lbs
  // ══════════════════════════════════════════════════════════════════

  {
    id: "bumper-front-tube",
    name: "Front Tube Bumper (light steel)",
    category: "bumpers",
    weightLbs: 45,
    description: "Lightweight tube-style front bumper. No winch plate.",
    affectsHighCG: false,
    notes: "Net weight after removing ~15 lb stock fascia. Brands: Smittybilt XRC lite, various.",
  },
  {
    id: "bumper-front-mid-winch",
    name: "Front Steel Bumper w/ Winch Plate (mid)",
    category: "bumpers",
    weightLbs: 90,
    description: "Full-width steel front bumper with winch plate and D-ring mounts.",
    affectsHighCG: false,
    notes: "Net after stock removal. ARB Summit, Warn Ascent, Expedition One comparable.",
  },
  {
    id: "bumper-front-heavy-expedition",
    name: "Front Steel Bumper (heavy expedition)",
    category: "bumpers",
    weightLbs: 140,
    description: "Full-width heavy-duty steel with winch plate, light tabs, and approach angle guards.",
    affectsHighCG: false,
    notes: "ARB Summit (4Runner = 191 lbs gross, net ~176 lbs). Lund, Fab Fours comparable.",
  },
  {
    id: "bumper-rear-steel",
    name: "Rear Steel Bumper (no tire carrier)",
    category: "bumpers",
    weightLbs: 65,
    description: "Full-width steel rear bumper with D-rings. No swing-away carrier.",
    affectsHighCG: false,
    notes: "Net after stock removal. ARB, Fab Fours Vengeance Series comparable.",
  },
  {
    id: "bumper-rear-tire-carrier",
    name: "Rear Steel Bumper + Swing-Away Tire Carrier",
    category: "bumpers",
    weightLbs: 110,
    description: "Full rear bumper with full-size spare tire carrier on swing-away arm.",
    affectsHighCG: false,
    notes: "Net weight without spare tire/wheel. Add tire weight separately in the upgrades.",
  },
  {
    id: "bumper-front-aluminum",
    name: "Front Aluminum Bumper",
    category: "bumpers",
    weightLbs: 50,
    description: "Aluminum front bumper — lighter than steel but less robust.",
    affectsHighCG: false,
    notes: "ARB Deluxe aluminum, Pelfreybilt aluminum comparable. Includes winch plate.",
  },

  // ══════════════════════════════════════════════════════════════════
  // WINCH — Mounted on bumper (added weight after bumper is accounted for)
  // ══════════════════════════════════════════════════════════════════

  {
    id: "winch-8000",
    name: "Winch — 8,000 lb (synthetic rope)",
    category: "winch",
    weightLbs: 55,
    description: "8,000 lb rated winch with synthetic rope.",
    affectsHighCG: false,
    notes: "Warn M8000-S: 55 lbs. Smittybilt X2O 8K: 48 lbs. Add to bumper weight separately.",
  },
  {
    id: "winch-10000",
    name: "Winch — 10,000 lb (synthetic rope)",
    category: "winch",
    weightLbs: 73,
    description: "10,000 lb rated winch with synthetic rope. Most common overlanding choice.",
    affectsHighCG: false,
    notes: "Warn VR EVO 10-S: 72.6 lbs. Smittybilt X2O 10K: 67 lbs. Warn ZEON 10-S: 75 lbs.",
  },
  {
    id: "winch-12000",
    name: "Winch — 12,000 lb (synthetic rope)",
    category: "winch",
    weightLbs: 80,
    description: "12,000 lb rated winch for heavier vehicles or challenging recoveries.",
    affectsHighCG: false,
    notes: "Warn ZEON 12-S: 82 lbs. Smittybilt X2O 12K: 70 lbs.",
  },

  // ══════════════════════════════════════════════════════════════════
  // SUSPENSION — Hardware weight only (springs, shocks, brackets)
  // Does not include alignment or installation hardware
  // ══════════════════════════════════════════════════════════════════

  {
    id: "lift-leveling",
    name: "Leveling Kit (front only)",
    category: "suspension",
    weightLbs: 15,
    description: "Front spacers or strut spacers to level the stance. 1\"–2\" lift.",
    affectsHighCG: true,
    notes: "Hardware only. Raises CG marginally. Minimal payload impact.",
  },
  {
    id: "lift-2inch",
    name: "2\" Lift Kit (springs + shocks)",
    category: "suspension",
    weightLbs: 55,
    description: "Full 2\" lift: new coils or springs, shocks, and all hardware.",
    affectsHighCG: true,
    notes: "Rough Country, Bilstein, Fox 2\" kits. Weight varies by brand and vehicle.",
  },
  {
    id: "lift-3inch",
    name: "3\"–4\" Lift Kit (springs + shocks + UCAs)",
    category: "suspension",
    weightLbs: 90,
    description: "Full 3–4\" lift with upper control arms, new coils, and shocks.",
    affectsHighCG: true,
    notes: "Upper control arms add significant weight. Icon, Fox, Bilstein complete kits.",
  },
  {
    id: "long-travel-suspension",
    name: "Long Travel Suspension (full kit)",
    category: "suspension",
    weightLbs: 130,
    description: "Extended travel suspension with bypass shocks and all associated brackets.",
    affectsHighCG: true,
    notes: "Icon, King, Fox bypass. Typical for full prerunner or dedicated desert builds.",
  },

  // ══════════════════════════════════════════════════════════════════
  // PROTECTION — Underbody and body armor
  // ══════════════════════════════════════════════════════════════════

  {
    id: "skid-tc-only",
    name: "Transfer Case Skid Plate",
    category: "protection",
    weightLbs: 15,
    description: "Single transfer case skid plate only.",
    affectsHighCG: false,
  },
  {
    id: "skid-partial",
    name: "Partial Skid Package (TC + oil pan)",
    category: "protection",
    weightLbs: 35,
    description: "Transfer case and oil pan protection. Common entry-level package.",
    affectsHighCG: false,
  },
  {
    id: "skid-full-steel",
    name: "Full Skid Package (steel)",
    category: "protection",
    weightLbs: 80,
    description: "Full underbody steel skid package: engine, TC, fuel tank, and cross-members.",
    affectsHighCG: false,
    notes: "ARB full steel package: 55–90 lbs depending on vehicle. 3mm plate.",
  },
  {
    id: "rock-sliders",
    name: "Rock Sliders / Side Steps",
    category: "protection",
    weightLbs: 75,
    description: "Full-length steel rock sliders or rock rails.",
    affectsHighCG: false,
    notes: "Low mount — minimal CG impact. Lo-Pro style lighter (~55 lbs) vs full tube (~90 lbs).",
  },
  {
    id: "snorkel",
    name: "Snorkel (safari-style)",
    category: "protection",
    weightLbs: 12,
    description: "Raised air intake for water crossings and dusty environments.",
    affectsHighCG: true,
    notes: "Safari Snorkel, AEV comparable. Mounts high on A-pillar — minor CG raise.",
  },

  // ══════════════════════════════════════════════════════════════════
  // STORAGE — Racks, drawers, and bed organization systems
  // ══════════════════════════════════════════════════════════════════

  {
    id: "roof-rack-aluminum",
    name: "Cab Roof Rack (aluminum)",
    category: "storage",
    weightLbs: 45,
    description: "Aluminum roof rack for the cab or cargo area.",
    affectsHighCG: true,
    notes: "Prinsu, Sherpa, Front Runner aluminum racks: 45–55 lbs. Raises CG — factor in handling.",
  },
  {
    id: "roof-rack-steel",
    name: "Cab Roof Rack (steel)",
    category: "storage",
    weightLbs: 80,
    description: "Steel roof rack — heavier but more robust than aluminum.",
    affectsHighCG: true,
    notes: "Rhino-Rack heavy duty, TracRac. Significantly raises CG vs aluminum.",
  },
  {
    id: "bed-rack-aluminum",
    name: "Bed Rack (aluminum)",
    category: "storage",
    weightLbs: 85,
    description: "Full-width aluminum bed rack system with crossbars.",
    affectsHighCG: true,
    notes: "Leitner ACS Forged: 85 lbs. Sherpa, Cargo Ease comparable. T-slot for accessories.",
  },
  {
    id: "bed-rack-steel",
    name: "Bed Rack (steel)",
    category: "storage",
    weightLbs: 130,
    description: "Steel bed rack — heavier than aluminum but lower cost.",
    affectsHighCG: true,
    notes: "Various budget brands. Closer to bed level — slightly better CG than cab rack.",
  },
  {
    id: "bed-drawers-full",
    name: "Bed Drawer System (full width)",
    category: "storage",
    weightLbs: 215,
    description: "Full-width bed drawer system (Decked, TruckVault, ARB comparable).",
    affectsHighCG: false,
    notes: "Decked: 204–233 lbs depending on truck size. Empty weight — contents add more.",
  },
  {
    id: "bed-drawers-single",
    name: "Bed Drawer System (half width / single)",
    category: "storage",
    weightLbs: 110,
    description: "Single-side drawer system leaving half the bed accessible.",
    affectsHighCG: false,
  },
  {
    id: "cargo-box-rooftop",
    name: "Hard-Side Rooftop Cargo Box",
    category: "storage",
    weightLbs: 40,
    description: "Hard-shell cargo box mounted on roof rack (e.g., Thule, Yakima).",
    affectsHighCG: true,
    notes: "Thule Force XT XL: 38 lbs. Yakima SkyBox: 42 lbs. High CG impact when loaded.",
  },

  // ══════════════════════════════════════════════════════════════════
  // ELECTRICAL — Auxiliary power systems
  // ══════════════════════════════════════════════════════════════════

  {
    id: "aux-battery-lifepo4-100",
    name: "Aux Battery — 100Ah LiFePO4 + Tray",
    category: "electrical",
    weightLbs: 30,
    description: "100Ah lithium iron phosphate aux battery with under-hood tray.",
    affectsHighCG: false,
    notes: "LiTime 100Ah: 24 lbs. Battle Born 100Ah: 31 lbs. Add ~6 lbs for dual-battery tray.",
  },
  {
    id: "aux-battery-agm-100",
    name: "Aux Battery — 100Ah AGM + Tray",
    category: "electrical",
    weightLbs: 70,
    description: "100Ah AGM aux battery with under-hood or under-seat tray.",
    affectsHighCG: false,
    notes: "Optima Yellow/Blue Top 55Ah: 43 lbs. Full 100Ah AGM: 60–65 lbs + tray.",
  },
  {
    id: "solar-panel-roof-mounted",
    name: "Solar Panel — 200W Rigid (roof mounted)",
    category: "electrical",
    weightLbs: 27,
    description: "200W rigid solar panel mounted on roof rack.",
    affectsHighCG: true,
    notes: "Renogy 200W: 26.5 lbs. High mount — raises CG. Consider flexible panels for lower weight.",
  },
  {
    id: "aux-inverter",
    name: "Aux Inverter — 1,000–2,000W",
    category: "electrical",
    weightLbs: 8,
    description: "Under-dash or under-seat mounted power inverter.",
    affectsHighCG: false,
  },

  // ══════════════════════════════════════════════════════════════════
  // EXTERIOR — Body and trim modifications
  // ══════════════════════════════════════════════════════════════════

  {
    id: "fender-flares-steel",
    name: "Steel Fender Flares",
    category: "exterior",
    weightLbs: 25,
    description: "Steel or hard-plastic fender flares for tire clearance.",
    affectsHighCG: false,
  },
  {
    id: "spare-tire-upgrade-fullsize",
    name: "Full-Size Spare on Rear Carrier (net weight)",
    category: "exterior",
    weightLbs: 55,
    description: "Full-size matching spare on a swing-away carrier. Net over a compact spare.",
    affectsHighCG: false,
    notes: "Typical full-size wheel+tire ~65 lbs. Carrier hardware additional. Subtract compact spare weight.",
  },

  // ══════════════════════════════════════════════════════════════════
  // SHELTER — Permanently mounted sleeping and camp systems
  // ══════════════════════════════════════════════════════════════════

  {
    id: "rtt-softshell-2p",
    name: "Rooftop Tent — Softshell (2-person)",
    category: "shelter",
    weightLbs: 120,
    description: "Softshell fold-out rooftop tent for 2 people.",
    affectsHighCG: true,
    notes: "Tepui Autana 2p: 130 lbs. CVT Mt. Shasta: 125 lbs. High CG — critical in RigSafe check.",
  },
  {
    id: "rtt-hardshell-2p",
    name: "Rooftop Tent — Hardshell (2-person)",
    category: "shelter",
    weightLbs: 155,
    description: "Hardshell clamshell or pop-up tent for 2 people.",
    affectsHighCG: true,
    notes: "iKamper Skycamp Mini 3.0: 125 lbs. OVS Bushveld HD 2p: 178 lbs. Verify your model.",
  },
  {
    id: "rtt-hardshell-4p",
    name: "Rooftop Tent — Hardshell (4-person)",
    category: "shelter",
    weightLbs: 205,
    description: "Large hardshell tent for 3–4 people.",
    affectsHighCG: true,
    notes: "OVS Bushveld HD 4p: 208 lbs. iKamper Skycamp 2.0: 178 lbs. Very high CG impact.",
  },
  {
    id: "camper-shell-fiberglass",
    name: "Camper Shell / Topper (fiberglass)",
    category: "shelter",
    weightLbs: 175,
    description: "Full fiberglass camper shell/topper for truck bed.",
    affectsHighCG: true,
    notes: "ARE, SnugTop: 150–200 lbs. Lighter than aluminum canopies but less structural.",
  },
  {
    id: "overland-canopy-aluminum",
    name: "Overland Canopy (aluminum, e.g., Alu-Cab)",
    category: "shelter",
    weightLbs: 135,
    description: "Lightweight aluminum expedition canopy for truck bed.",
    affectsHighCG: true,
    notes: "Alu-Cab Contour: 56–62 kg (123–136 lbs). AT Overland comparable.",
  },
  {
    id: "awning-full-width",
    name: "Awning — Full Width (side-mount)",
    category: "shelter",
    weightLbs: 30,
    description: "6'–8' full side-opening awning mounted to rack or side of vehicle.",
    affectsHighCG: true,
    notes: "ARB 2500: 24 lbs. Tuff Stuff 6.5'x8': 27 lbs. Front Runner Easy-Out: 28 lbs.",
  },
  {
    id: "awning-270-degree",
    name: "270° Awning",
    category: "shelter",
    weightLbs: 65,
    description: "270-degree wraparound awning covering side and rear of vehicle.",
    affectsHighCG: true,
    notes: "Tuff Stuff 270° XL: 62–70 lbs. Heavier than standard awning. High side-mount CG.",
  },

  // ══════════════════════════════════════════════════════════════════
  // TIRES — Net weight gain vs. stock tires (per full set of 4)
  // Stock tire weights vary but rough average is ~30 lbs per tire
  // ══════════════════════════════════════════════════════════════════

  {
    id: "tires-minor-upgrade",
    name: "Tire Upgrade — Minor (e.g., 265→285/70)",
    category: "tires",
    weightLbs: 20,
    description: "One size up from stock. ~4–5 lbs per tire heavier × 4 tires.",
    affectsHighCG: false,
    notes: "Also increases unsprung weight — affects suspension dynamics beyond just payload.",
  },
  {
    id: "tires-medium-upgrade",
    name: "Tire Upgrade — Medium (e.g., 285→315/70 or 33\")",
    category: "tires",
    weightLbs: 40,
    description: "Two sizes up or moving to 33\" all-terrains. ~8–10 lbs per tire × 4.",
    affectsHighCG: false,
  },
  {
    id: "tires-major-upgrade",
    name: "Tire Upgrade — Large (35\"+ or 37\")",
    category: "tires",
    weightLbs: 80,
    description: "35\"–37\" aggressive terrain tires. ~15–20 lbs per tire over stock × 4.",
    affectsHighCG: false,
    notes: "37\" tires on a Wrangler run 50+ lbs each (35 lbs over stock). Payload hit is significant.",
  },

  // ══════════════════════════════════════════════════════════════════
  // TOWING — Hitch and receiver hardware
  // ══════════════════════════════════════════════════════════════════

  {
    id: "hitch-receiver-2inch",
    name: "2\" Receiver Hitch",
    category: "towing",
    weightLbs: 30,
    description: "Bolt-on 2\" receiver hitch for ball mount or receiver-mounted accessories.",
    affectsHighCG: false,
    notes: "Most factory hitches are ~35 lbs. Aftermarket receiver-only hitches: ~25–35 lbs.",
  },
  {
    id: "hitch-fuel-tank",
    name: "Auxiliary Fuel Tank (hitch-mounted, full)",
    category: "towing",
    weightLbs: 60,
    description: "Small hitch-mounted auxiliary fuel tank (5–8 gallon).",
    affectsHighCG: false,
    notes: "Tank empty ~15 lbs. Full: gasoline = 6.3 lbs/gal. 8 gal full ≈ 65 lbs. Use empty weight here; add fuel in gear.",
  },
];

// ─── Helper functions ──────────────────────────────────────────────────

export function getAllUpgrades(): LBUpgrade[] {
  return upgradeDatabase;
}

export function getUpgradesByCategory(cat: UpgradeCategory): LBUpgrade[] {
  return upgradeDatabase.filter((u) => u.category === cat);
}

export function getUpgradeById(id: string): LBUpgrade | undefined {
  return upgradeDatabase.find((u) => u.id === id);
}

export function getUpgradeCategories(): UpgradeCategory[] {
  return [
    "bumpers",
    "winch",
    "suspension",
    "protection",
    "storage",
    "electrical",
    "exterior",
    "shelter",
    "tires",
    "towing",
  ];
}

export const UPGRADE_CATEGORY_LABELS: Record<UpgradeCategory, string> = {
  bumpers: "Bumpers",
  winch: "Winch",
  suspension: "Suspension",
  protection: "Skids & Armor",
  storage: "Racks & Storage",
  electrical: "Electrical",
  exterior: "Exterior",
  shelter: "Shelter",
  tires: "Tires",
  towing: "Towing",
};
