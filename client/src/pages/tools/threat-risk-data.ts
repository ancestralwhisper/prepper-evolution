// ─── Threat-Specific Risk Dashboard ────────────────────────────────
// State-level risk scores derived from FEMA National Risk Index (NRI).
// Source: hazards.fema.gov/nri — Expected Annual Loss, normalized 0-100.
// 0-20: Very Low | 21-40: Low | 41-60: Moderate | 61-80: High | 81-100: Very High

export interface HazardDef {
  id: string;
  label: string;
  category: string;
  description: string;
  actions: string[];
}

export interface HazardScore extends HazardDef {
  score: number;
  level: "very-low" | "low" | "moderate" | "high" | "very-high";
  levelLabel: string;
}

export const HAZARDS: HazardDef[] = [
  {
    id: "avalanche",
    label: "Avalanche",
    category: "Mountain / Winter",
    description: "Rapid snow mass failure on steep slopes (≥30°). Highest risk mid-winter after loading events.",
    actions: [
      "Carry an avalanche beacon, probe, and shovel — even on day hikes in avalanche terrain",
      "Check avalanche.org before any backcountry run — especially after 12\"+ snowfall",
      "Avoid slopes between 30–45° during and for 24 hours after a storm",
      "Take an avalanche safety course if you ride or ski off-piste terrain",
    ],
  },
  {
    id: "coastal-flood",
    label: "Coastal Flooding",
    category: "Flood",
    description: "Storm surge, tidal flooding, and wave overwash in low-lying coastal areas.",
    actions: [
      "Know your flood zone letter (A/B/C) and pre-plan your evacuation route inland",
      "Your exit window is often under 24 hours — have a 7-day go-bag always staged",
      "Check FEMA flood maps (msc.fema.gov) for your home's base flood elevation",
      "Storm surge kills more people than wind — your zone, not the storm track, determines your risk",
    ],
  },
  {
    id: "cold-wave",
    label: "Cold Wave",
    category: "Winter / Climate",
    description: "Extended periods of abnormally cold temperatures. Kills through hypothermia and infrastructure failure.",
    actions: [
      "Keep 3 days of backup heating fuel (propane, wood, kerosene) — grid power fails first",
      "Insulate pipes before winter hits — burst pipes are the #1 cold-wave property loss",
      "Have a battery or hand-crank weather radio — power and cell service go down early",
      "Layer up before you feel cold, not after — hypothermia can set in at 40°F with wind chill",
    ],
  },
  {
    id: "drought",
    label: "Drought",
    category: "Climate",
    description: "Extended water deficit affecting municipal supply, wells, and wildfire risk.",
    actions: [
      "Store 14+ days of drinking water — municipal restrictions hit households first",
      "Know your well depth and recharge rate — shallow wells go dry in Year 2+ droughts",
      "Wildfire risk spikes sharply during drought — double your defensible space clearance",
      "Gray water systems and rainwater collection (where legal) are long-game defensive moves",
    ],
  },
  {
    id: "earthquake",
    label: "Earthquake",
    category: "Geologic",
    description: "Ground shaking from fault rupture. Secondary effects include fire, landslide, and tsunami.",
    actions: [
      "Secure your water heater with straps, anchor heavy furniture, know your gas shutoff",
      "DROP, COVER, HOLD ON under a sturdy table — doorframes are outdated, dangerous advice",
      "Keep a 72-hour kit accessible, not buried — exits can be blocked after the shaking stops",
      "Check your foundation type — cripple walls and unreinforced masonry fail first",
    ],
  },
  {
    id: "hail",
    label: "Hail",
    category: "Severe Weather",
    description: "Large ice pellets from severe thunderstorms. Causes catastrophic property and crop damage.",
    actions: [
      "Keep comprehensive auto coverage — hail repairs run $2,500–$8,000 per vehicle",
      "Inspect your roof after any storm dropping 1\"+ hail — one stone can penetrate shingles",
      "Install impact-resistant Class 4 shingles if replacing your roof in hail-prone areas",
      "Hail storms also spin up tornadoes — watch the full storm picture, not just the hail",
    ],
  },
  {
    id: "heat-wave",
    label: "Heat Wave",
    category: "Climate",
    description: "Prolonged extreme heat. Kills faster than most natural disasters through heat stroke.",
    actions: [
      "Identify cooling centers now (libraries, hospitals, malls) — before you need them",
      "Never leave people or pets in parked vehicles — dashboard temps hit 140°F in minutes",
      "Hydrate before you feel thirsty — thirst means you're already behind",
      "Plan for 3-day grid outages in summer — EVACs and hospitals get jammed fast",
    ],
  },
  {
    id: "hurricane",
    label: "Hurricane / Tropical Storm",
    category: "Severe Weather",
    description: "Tropical cyclone with sustained winds 74 mph+. Storm surge, flooding, and wind are all kill mechanisms.",
    actions: [
      "Have 3 planned evacuation routes — highways jam hours before the mandatory order",
      "Know your storm surge zone, not just the wind forecast — surge kills more than wind",
      "Gas up 3 days before projected landfall — stations run dry within 24 hours of a watch",
      "Every hour of advance prep matters — don't wait for the mandatory evacuation order",
    ],
  },
  {
    id: "ice-storm",
    label: "Ice Storm",
    category: "Winter / Climate",
    description: "Freezing rain that coats surfaces. Collapses trees and power lines, makes roads lethal.",
    actions: [
      "Stock 3 days of food and water before any winter storm warning — stores empty in 2 hours",
      "Ice on lines means outages lasting 5–10 days — get a generator or propane backup",
      "Black ice is invisible — avoid driving for 24 hours after any confirmed ice event",
      "Fill your vehicle tank the night before any forecast icing event",
    ],
  },
  {
    id: "landslide",
    label: "Landslide",
    category: "Geologic",
    description: "Sudden downslope movement of rock or soil. Debris flows move faster than you can run.",
    actions: [
      "If your home is on or below a steep slope, know the uphill drainage patterns",
      "During heavy rain exceeding 1.5\"/hr, monitor steep terrain uphill from you",
      "Watch for cracked foundations, tilting trees, and seeps — early warning signs",
      "Debris flows move faster than you can outrun — leave early on any red-tagged slope",
    ],
  },
  {
    id: "lightning",
    label: "Lightning",
    category: "Severe Weather",
    description: "Electrical discharge from thunderstorms. Kills more people per year than tornadoes in many states.",
    actions: [
      "30-30 rule: if thunder follows lightning by <30 sec, seek shelter — wait 30 min after last thunder",
      "Avoid hilltops, open fields, tall isolated trees, and open water during any storm",
      "Get off the water, out of the open, into a hard-topped vehicle or a building",
      "Count on 30 minutes of dangerous lightning after a storm appears to pass",
    ],
  },
  {
    id: "riverine-flood",
    label: "Riverine Flooding",
    category: "Flood",
    description: "Overflow from rivers and streams, often days after heavy rain upstream.",
    actions: [
      "Never drive through flooded roadways — 2 feet of water will move a full-size truck",
      "Know your flood zone on fema.gov — 100-year zones flood multiple times per decade",
      "Sump pump + battery backup saves basements — install before the water, not after",
      "Sandbagging is a last resort — your real plan is getting out early with your go-bag",
    ],
  },
  {
    id: "strong-wind",
    label: "Strong Wind",
    category: "Severe Weather",
    description: "Non-tornado damaging winds 58 mph+. Downs trees, power lines, and structures.",
    actions: [
      "Act on the Watch — don't wait for the Warning to start prepping",
      "Secure or bring in anything that can become a projectile — furniture, trampolines, bins",
      "Park away from trees and overhead lines before any wind event is forecast",
      "Wind outages can last 3–7 days — have 3+ days of food and water staged",
    ],
  },
  {
    id: "tornado",
    label: "Tornado",
    category: "Severe Weather",
    description: "Violent rotating column of air. Typical warning time: 13 minutes. Mobile homes are death traps.",
    actions: [
      "Interior room, lowest floor, no windows — a bathroom or interior closet. NOT a doorframe",
      "You have 15 seconds once you hear a siren — know your shelter spot before the storm season",
      "Mobile homes offer ZERO protection — know the location of the nearest community shelter",
      "NOAA weather radio (battery powered) is the fastest public warning system, full stop",
    ],
  },
  {
    id: "tsunami",
    label: "Tsunami",
    category: "Geologic",
    description: "Ocean wave train triggered by seismic or volcanic events. Can arrive within minutes of an offshore quake.",
    actions: [
      "Strong coastal earthquake = immediate evacuation — don't wait for a siren or official order",
      "Know your tsunami evacuation zone and the nearest high ground (50+ feet elevation)",
      "A receding ocean is not a spectacle — it's the wave pulling back before it hits",
      "After any major offshore quake, stay away from the beach for at least 12 hours",
    ],
  },
  {
    id: "volcano",
    label: "Volcanic Activity",
    category: "Geologic",
    description: "Lava flows, lahars, pyroclastic flows, and ashfall. Ash travels hundreds of miles from the source.",
    actions: [
      "Know the lahar, lava flow, and ashfall zones for your nearest active volcano (usgs.gov/volcanoes)",
      "Volcanic ash clogs engines instantly — stock N95 masks and replacement air filters",
      "Ashfall collapses roofs at 4+ inches of wet ash — monitor and clear flat roofs",
      "If you live within 50 miles of an active volcano, keep 2 weeks of supplies on hand",
    ],
  },
  {
    id: "wildfire",
    label: "Wildfire",
    category: "Climate",
    description: "Uncontrolled fire through vegetation. Can spread faster than a car can drive on rough terrain.",
    actions: [
      "Create 100 ft of defensible space and 30 ft of ember-resistant zone around your home",
      "Go early — wildfire evacuation windows are measured in minutes, not hours",
      "N95 masks are essential during Red Flag warnings — air quality can go lethal fast",
      "Pre-position your go-bag near the door during Red Flag warnings, not after the order",
    ],
  },
  {
    id: "winter-weather",
    label: "Winter Weather",
    category: "Winter / Climate",
    description: "Blizzard, heavy snow, and wind chill. Infrastructure failure + stranding = multi-day emergencies.",
    actions: [
      "Keep vehicles fueled above 1/2 tank from October to April — cold snaps hit fast",
      "Stock 3 days of food, water, and medications — supply chains seize during blizzards",
      "A cold-weather kit in your vehicle can save your life if you get stranded",
      "Know your roof's snow load capacity — wet snow is 3x heavier than dry and can collapse it",
    ],
  },
];

// ─── State Risk Scores ──────────────────────────────────────────────
// Array index = HAZARDS array order (same as above)
// [avl, cfl, cld, drt, eqk, hal, htw, hur, ice, lnd, lgt, fld, wnd, tor, tsu, vol, wlf, wnt]
const STATE_SCORES: Record<string, number[]> = {
  AL: [2, 45, 25, 30, 8, 72, 78, 82, 78, 38, 85, 80, 62, 88, 2, 2, 42, 38],
  AK: [88, 48, 95, 20, 98, 10, 10, 8, 18, 88, 22, 38, 72, 8, 92, 95, 45, 95],
  AZ: [12, 5, 22, 88, 40, 42, 95, 18, 25, 35, 48, 35, 75, 22, 2, 8, 78, 18],
  AR: [2, 20, 38, 40, 15, 75, 72, 35, 88, 32, 78, 82, 68, 82, 2, 2, 42, 52],
  CA: [48, 55, 22, 92, 92, 25, 82, 28, 12, 78, 42, 45, 52, 12, 62, 58, 95, 18],
  CO: [78, 5, 48, 68, 38, 80, 55, 8, 58, 72, 80, 55, 78, 55, 2, 8, 82, 75],
  CT: [5, 50, 45, 25, 22, 35, 42, 45, 45, 18, 50, 55, 48, 15, 12, 2, 25, 58],
  DE: [2, 55, 38, 20, 15, 38, 48, 50, 42, 15, 55, 58, 52, 18, 5, 2, 18, 48],
  DC: [2, 42, 38, 18, 18, 38, 52, 48, 42, 15, 55, 58, 48, 15, 2, 2, 18, 48],
  FL: [2, 92, 8, 38, 12, 52, 78, 98, 15, 18, 95, 62, 72, 32, 8, 2, 62, 5],
  GA: [2, 60, 22, 35, 18, 68, 68, 72, 62, 52, 88, 65, 62, 72, 2, 2, 55, 30],
  HI: [8, 62, 12, 25, 62, 5, 75, 62, 5, 28, 22, 48, 65, 2, 85, 90, 55, 12],
  ID: [62, 8, 62, 58, 55, 35, 45, 5, 32, 62, 28, 45, 65, 8, 8, 18, 80, 72],
  IL: [2, 15, 58, 35, 18, 72, 65, 15, 72, 22, 68, 75, 65, 75, 2, 2, 28, 65],
  IN: [2, 10, 52, 32, 18, 70, 62, 12, 72, 22, 65, 72, 60, 78, 2, 2, 25, 60],
  IA: [2, 8, 62, 45, 15, 80, 62, 10, 68, 18, 72, 82, 72, 80, 2, 2, 30, 72],
  KS: [5, 5, 52, 52, 12, 88, 68, 15, 80, 18, 78, 72, 88, 95, 2, 2, 45, 70],
  KY: [2, 18, 42, 30, 22, 65, 68, 18, 85, 32, 72, 78, 58, 72, 2, 2, 35, 55],
  LA: [2, 95, 20, 32, 12, 55, 72, 92, 35, 22, 72, 92, 65, 55, 5, 2, 42, 15],
  ME: [8, 40, 75, 28, 15, 28, 25, 30, 40, 22, 35, 52, 52, 5, 5, 2, 35, 80],
  MD: [2, 60, 38, 22, 18, 42, 52, 55, 45, 22, 62, 62, 55, 22, 5, 2, 22, 52],
  MA: [8, 52, 48, 25, 22, 32, 38, 45, 42, 20, 48, 58, 52, 8, 8, 2, 22, 65],
  MI: [2, 15, 80, 28, 15, 55, 55, 8, 62, 18, 62, 68, 65, 52, 2, 2, 28, 85],
  MN: [12, 8, 90, 40, 12, 68, 58, 5, 62, 18, 65, 72, 68, 65, 2, 2, 32, 90],
  MS: [2, 85, 22, 32, 10, 68, 72, 88, 72, 28, 78, 88, 65, 88, 2, 2, 42, 28],
  MO: [2, 15, 48, 38, 45, 72, 68, 18, 82, 28, 75, 82, 70, 82, 2, 2, 38, 62],
  MT: [68, 5, 82, 62, 48, 42, 45, 5, 35, 58, 28, 48, 78, 22, 2, 18, 80, 88],
  NE: [5, 5, 65, 48, 12, 82, 68, 8, 75, 18, 72, 72, 82, 88, 2, 2, 35, 72],
  NV: [12, 5, 42, 88, 72, 28, 92, 5, 22, 38, 35, 28, 72, 12, 8, 22, 72, 35],
  NH: [18, 32, 72, 22, 22, 25, 28, 28, 38, 22, 40, 52, 50, 5, 5, 2, 30, 78],
  NJ: [2, 65, 42, 20, 22, 38, 48, 55, 42, 18, 52, 62, 52, 18, 5, 2, 18, 52],
  NM: [22, 5, 30, 82, 35, 45, 85, 10, 22, 38, 52, 38, 78, 28, 2, 12, 80, 25],
  NY: [10, 60, 55, 22, 28, 35, 45, 50, 48, 22, 52, 62, 55, 18, 8, 2, 22, 70],
  NC: [5, 68, 28, 32, 22, 62, 62, 80, 65, 72, 75, 65, 68, 52, 2, 2, 52, 38],
  ND: [12, 5, 90, 52, 10, 70, 55, 5, 62, 12, 58, 65, 80, 70, 2, 2, 28, 92],
  OH: [2, 12, 50, 25, 22, 58, 62, 12, 68, 18, 62, 72, 58, 65, 2, 2, 22, 62],
  OK: [5, 8, 38, 55, 18, 88, 75, 28, 90, 22, 82, 68, 90, 98, 2, 2, 55, 50],
  OR: [65, 42, 38, 58, 78, 22, 38, 12, 28, 82, 28, 58, 62, 8, 68, 72, 85, 50],
  PA: [5, 22, 45, 22, 22, 40, 48, 15, 60, 22, 58, 68, 52, 30, 2, 2, 22, 65],
  RI: [2, 52, 48, 18, 18, 28, 38, 48, 42, 18, 45, 55, 52, 5, 8, 2, 18, 58],
  SC: [2, 65, 22, 30, 40, 58, 65, 78, 65, 45, 75, 68, 62, 52, 2, 2, 45, 28],
  SD: [15, 5, 82, 50, 10, 78, 58, 5, 65, 18, 62, 65, 78, 72, 2, 2, 58, 88],
  TN: [5, 15, 38, 30, 38, 65, 68, 22, 85, 58, 72, 72, 60, 78, 2, 2, 42, 52],
  TX: [5, 75, 28, 72, 25, 90, 80, 85, 62, 32, 82, 72, 88, 92, 5, 5, 72, 30],
  UT: [58, 5, 45, 72, 65, 38, 68, 5, 28, 50, 38, 42, 68, 15, 2, 15, 68, 62],
  VT: [22, 15, 78, 22, 18, 22, 22, 18, 38, 25, 38, 55, 50, 5, 2, 2, 28, 82],
  VA: [5, 65, 35, 25, 22, 45, 55, 65, 62, 52, 68, 65, 60, 35, 2, 2, 38, 48],
  WA: [72, 45, 45, 55, 82, 25, 35, 5, 28, 88, 28, 55, 68, 5, 75, 78, 82, 55],
  WV: [5, 12, 42, 25, 18, 48, 58, 12, 65, 68, 68, 75, 58, 42, 2, 2, 38, 62],
  WI: [12, 8, 85, 32, 12, 62, 52, 5, 62, 18, 62, 68, 65, 55, 2, 2, 28, 88],
  WY: [68, 5, 80, 60, 45, 68, 45, 5, 38, 62, 35, 45, 82, 28, 2, 12, 68, 85],
};

export function scoreToLevel(score: number): HazardScore["level"] {
  if (score <= 20) return "very-low";
  if (score <= 40) return "low";
  if (score <= 60) return "moderate";
  if (score <= 80) return "high";
  return "very-high";
}

export function scoreLevelLabel(level: HazardScore["level"]): string {
  switch (level) {
    case "very-low": return "Very Low";
    case "low": return "Low";
    case "moderate": return "Moderate";
    case "high": return "High";
    case "very-high": return "Very High";
  }
}

export function levelColor(level: HazardScore["level"]): string {
  switch (level) {
    case "very-low": return "#6B7280";
    case "low": return "#3B82F6";
    case "moderate": return "#EAB308";
    case "high": return "#F97316";
    case "very-high": return "#EF4444";
  }
}

export function getStateRisk(state: string): HazardScore[] {
  const scores = STATE_SCORES[state.toUpperCase()];
  if (!scores) return [];
  return HAZARDS.map((hazard, i) => {
    const score = scores[i] ?? 5;
    const level = scoreToLevel(score);
    return {
      ...hazard,
      score,
      level,
      levelLabel: scoreLevelLabel(level),
    };
  }).sort((a, b) => b.score - a.score);
}
