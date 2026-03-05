// ─── Trail System Database ──────────────────────────────────────
// Static config for 7 popular overland trail systems.
// Each entry defines which federal APIs to query for trail-specific intel.

export interface TrailSystem {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  /** [minLon, minLat, maxLon, maxLat] — spatial envelope for API queries */
  bbox: [number, number, number, number];
  landType: "blm" | "usfs" | "nps" | "private" | "mixed";
  /** NPS park codes to query for alerts (comma-separated) */
  npsParks?: string;
  /** USFS forest name for MVUM queries */
  usfsForest?: string;
  /** State abbreviation for BLM route queries */
  blmState?: string;
  description: string;
  ohvTypes: string[];
  websiteUrl?: string;
}

export const TRAIL_SYSTEMS: TrailSystem[] = [
  {
    id: "moab",
    name: "Moab, Utah",
    state: "UT",
    lat: 38.5733,
    lon: -109.5498,
    bbox: [-110.0, 38.2, -109.1, 38.9],
    landType: "mixed",
    npsParks: "cany,arch",
    blmState: "UT",
    description: "Slickrock, sand, and canyon country. BLM and NPS land with world-class 4x4 trails.",
    ohvTypes: ["4WD", "SxS", "ATV", "Motorcycle"],
  },
  {
    id: "bighorn",
    name: "Bighorn Mountains, WY",
    state: "WY",
    lat: 44.6,
    lon: -107.4,
    bbox: [-107.9, 44.2, -106.8, 45.0],
    landType: "usfs",
    usfsForest: "Bighorn National Forest",
    description: "High-altitude mountain trails through Bighorn National Forest. Seasonal snow closures.",
    ohvTypes: ["4WD", "ATV", "Motorcycle"],
  },
  {
    id: "black-mountain",
    name: "Black Mountain OHV, KY",
    state: "KY",
    lat: 36.92,
    lon: -83.22,
    bbox: [-83.6, 36.7, -82.8, 37.2],
    landType: "usfs",
    usfsForest: "Daniel Boone National Forest",
    description: "Appalachian OHV trails in Daniel Boone National Forest. Rocky, technical terrain.",
    ohvTypes: ["ATV", "SxS", "Motorcycle"],
  },
  {
    id: "az-peace-trail",
    name: "Arizona Peace Trail",
    state: "AZ",
    lat: 34.0,
    lon: -114.0,
    bbox: [-114.8, 31.3, -113.0, 37.0],
    landType: "blm",
    blmState: "AZ",
    description: "690-mile north-south BLM route through western Arizona desert. Remote and rugged.",
    ohvTypes: ["4WD", "SxS", "ATV", "Motorcycle"],
  },
  {
    id: "glamis",
    name: "Imperial Sand Dunes, CA",
    state: "CA",
    lat: 32.96,
    lon: -115.12,
    bbox: [-115.5, 32.7, -114.8, 33.2],
    landType: "blm",
    blmState: "CA",
    description: "Largest sand dune system in North America. BLM-managed open riding area.",
    ohvTypes: ["SxS", "ATV", "Motorcycle", "Sand Rail"],
  },
  {
    id: "paiute",
    name: "Paiute ATV Trail, UT",
    state: "UT",
    lat: 38.55,
    lon: -112.1,
    bbox: [-112.6, 38.2, -111.6, 38.9],
    landType: "mixed",
    usfsForest: "Fishlake National Forest",
    blmState: "UT",
    description: "300+ mile loop through Fishlake National Forest and BLM land. High desert and mountain.",
    ohvTypes: ["ATV", "SxS", "Motorcycle"],
  },
  {
    id: "hatfield-mccoy",
    name: "Hatfield-McCoy Trails, WV",
    state: "WV",
    lat: 37.78,
    lon: -81.75,
    bbox: [-82.2, 37.4, -81.3, 38.1],
    landType: "private",
    description: "Private trail system across southern West Virginia. Permit required.",
    ohvTypes: ["ATV", "SxS", "Motorcycle", "Mountain Bike"],
    websiteUrl: "https://www.trailsheaven.com",
  },
];

/** Find trail systems within ~200 miles of given coordinates */
export function findNearbyTrailSystems(lat: number, lon: number): TrailSystem[] {
  const MAX_DISTANCE_DEG = 3; // ~200 miles at mid-latitudes
  return TRAIL_SYSTEMS.filter((ts) => {
    const dLat = Math.abs(ts.lat - lat);
    const dLon = Math.abs(ts.lon - lon);
    return dLat <= MAX_DISTANCE_DEG && dLon <= MAX_DISTANCE_DEG;
  });
}

/** Check if coordinates fall within a trail system's bounding box */
export function detectTrailSystem(lat: number, lon: number): TrailSystem | null {
  return TRAIL_SYSTEMS.find((ts) => {
    const [minLon, minLat, maxLon, maxLat] = ts.bbox;
    return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
  }) || null;
}

/** Look up a trail system by ID */
export function getTrailSystem(id: string): TrailSystem | undefined {
  return TRAIL_SYSTEMS.find((ts) => ts.id === id);
}
