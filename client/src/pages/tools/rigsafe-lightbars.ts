// ─── RigSafe Light Bar Database ──────────────────────────────────────────────
// Real manufacturer specs for vehicle-mounted light bars (trucks/SUVs).
//
// Sources:
//   Weight, wattage, length: Manufacturer spec sheets & product pages
//   Small pods/bars: ~2–6 lbs. Large 40–52" bars: 10–20 lbs.

export interface LightBarEntry {
  id: string;
  brand: string;
  model: string;
  weightLbs: number;
  lengthIn: number;
  watts: number;
  mountLocation: "bumper" | "roof-rack" | "hood" | "ditch" | "a-pillar";
  affiliateUrl: string;
  notes?: string;
}

export const lightBarDatabase: LightBarEntry[] = [
  // ─── BAJA DESIGNS ────────────────────────────────────────────────────────

  {
    id: "baja-onx6plus-40",
    brand: "Baja Designs",
    model: "OnX6+ 40\" LED Light Bar",
    weightLbs: 15.05,
    lengthIn: 40,
    watts: 346,
    mountLocation: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B00Q5FB846?tag=prepperevo-20",
    notes:
      "38,900 lm. 24 Cree LEDs. Aircraft-grade aluminum housing. Mil-spec hard anodize. Baja's flagship bar.",
  },
  {
    id: "baja-s8-30",
    brand: "Baja Designs",
    model: "S8 30\" LED Light Bar",
    weightLbs: 6.5,
    lengthIn: 30,
    watts: 180,
    mountLocation: "bumper",
    affiliateUrl: "#",
    notes:
      "19,050 lm. 24 Cree LEDs. Single-row design. Low-profile at 1.6\" tall. Excellent bumper or grille bar.",
  },
  {
    id: "baja-xl-pro-pod",
    brand: "Baja Designs",
    model: "XL Pro LED Pod (pair)",
    weightLbs: 3.2,
    lengthIn: 6,
    watts: 115,
    mountLocation: "ditch",
    affiliateUrl: "#",
    notes:
      "Per-pair weight. Popular ditch mount or A-pillar pod. Multiple beam patterns. Extremely bright for size.",
  },

  // ─── RIGID INDUSTRIES ────────────────────────────────────────────────────

  {
    id: "rigid-radiance-plus-40",
    brand: "Rigid Industries",
    model: "Radiance+ 40\" RGBW Light Bar",
    weightLbs: 11.5,
    lengthIn: 40,
    watts: 179,
    mountLocation: "roof-rack",
    affiliateUrl: "#",
    notes:
      "16,632 lm. RGBW backlight (8 color options). 12.8A draw. Good choice when you want ambient color + trail lighting.",
  },
  {
    id: "rigid-adapt-30",
    brand: "Rigid Industries",
    model: "Adapt E-Series 30\" Light Bar",
    weightLbs: 10.0,
    lengthIn: 30,
    watts: 150,
    mountLocation: "bumper",
    affiliateUrl: "#",
    notes:
      "Adaptive beam steering — adjusts pattern based on steering input. Single-row. Bumper or grille mount.",
  },
  {
    id: "rigid-sr-series-pro-20",
    brand: "Rigid Industries",
    model: "SR-Series PRO 20\" Spot/Flood Combo",
    weightLbs: 4.12,
    lengthIn: 20,
    watts: 119,
    mountLocation: "bumper",
    affiliateUrl: "https://www.amazon.com/dp/B079DVFZXT?tag=prepperevo-20",
    notes:
      "15,840 lm. Ultra low profile at 1.6\" tall. 20 LEDs. Slim enough for tight grille or behind-bumper installs.",
  },

  // ─── KC HILITES ──────────────────────────────────────────────────────────

  {
    id: "kc-flex-era-40",
    brand: "KC HiLiTES",
    model: "FLEX ERA LED Light Bar 40\"",
    weightLbs: 13.5,
    lengthIn: 40,
    watts: 200,
    mountLocation: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B019O8XKDM?tag=prepperevo-20",
    notes:
      "Modular build — individual light pods can be replaced. Spot/spread combo. American made.",
  },
  {
    id: "kc-gravity-pro6-50",
    brand: "KC HiLiTES",
    model: "Gravity Pro6 50\" LED Light Bar",
    weightLbs: 18.0,
    lengthIn: 50,
    watts: 160,
    mountLocation: "roof-rack",
    affiliateUrl: "https://www.amazon.com/dp/B01DQV2RD2?tag=prepperevo-20",
    notes:
      "6-pod modular design. 51.6\" wide. 160W combo beam. One of the most popular full-length roof bars for 3/4-ton trucks.",
  },

  // ─── DIODE DYNAMICS ──────────────────────────────────────────────────────

  {
    id: "diode-ss50-stage-series",
    brand: "Diode Dynamics",
    model: "SS50 Stage Series 50\" Light Bar",
    weightLbs: 9.5,
    lengthIn: 50,
    watts: 300,
    mountLocation: "roof-rack",
    affiliateUrl: "#",
    notes:
      "100 LEDs. Dual-color (white + amber) option available. Very clean OEM-look finish. Popular on Tundra and Tacoma.",
  },
  {
    id: "diode-ss30-stage-series",
    brand: "Diode Dynamics",
    model: "SS30 Stage Series 30\" Light Bar",
    weightLbs: 5.3,
    lengthIn: 30,
    watts: 180,
    mountLocation: "bumper",
    affiliateUrl: "https://www.amazon.com/dp/B06XDD3BVH?tag=prepperevo-20",
    notes:
      "11,400 lm. 60 LEDs. Combo beam. Slim profile. Fits most OEM grille openings and aftermarket bumpers.",
  },

  // ─── CALI RAISED LED ─────────────────────────────────────────────────────

  {
    id: "cali-raised-32-combo",
    brand: "Cali Raised LED",
    model: "32\" Slim Single Row Combo Bar",
    weightLbs: 7.5,
    lengthIn: 32,
    watts: 180,
    mountLocation: "bumper",
    affiliateUrl: "#",
    notes:
      "Vehicle-specific kits available for Tacoma, 4Runner, Tundra. Spot/flood combo. Popular behind-grille fitment.",
  },
  {
    id: "cali-raised-52-combo",
    brand: "Cali Raised LED",
    model: "52\" Dual Row 5D Optic OSRAM Bar",
    weightLbs: 17.5,
    lengthIn: 52,
    watts: 312,
    mountLocation: "roof-rack",
    affiliateUrl: "#",
    notes:
      "Dual-row OSRAM LEDs. 5D lens optics. Curved version available. Roof bracket kits sold for Tacoma/4Runner.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getLightBarBrands(): string[] {
  return [...new Set(lightBarDatabase.map((l) => l.brand))].sort();
}

export function getLightBarModels(brand: string): LightBarEntry[] {
  return lightBarDatabase
    .filter((l) => l.brand === brand)
    .sort((a, b) => a.model.localeCompare(b.model));
}

export function findLightBar(id: string): LightBarEntry | undefined {
  return lightBarDatabase.find((l) => l.id === id);
}
