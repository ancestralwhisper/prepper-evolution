// ─── RigRated Trail Profiles ──────────────────────────────────────────
// 6 Western trail profiles with scoring criteria for UTV trail compatibility.

export interface TrailProfile {
  id: string;
  name: string;
  state: string;
  distanceMiles: number;
  durationDays: string;
  minWidthIn: number;
  minClearanceIn: number;
  minTireSize: string;
  lowRangeRequired: boolean;
  waterCrossings: number;
  rockIntensity: number; // 1-10
  fuelDistanceMiles: number;
  campingSpots: number;
  difficulty: number; // 1-10
  permits: string;
  seasonalNotes: string;
  description: string;
  coordinates: {
    entry: { lat: number; lng: number };
    exit: { lat: number; lng: number };
  };
}

export const trails: TrailProfile[] = [
  {
    id: "arizona-peace-trail",
    name: "Arizona Peace Trail",
    state: "AZ",
    distanceMiles: 680,
    durationDays: "7-14",
    minWidthIn: 60,
    minClearanceIn: 10,
    minTireSize: "28x9R14",
    lowRangeRequired: false,
    waterCrossings: 3,
    rockIntensity: 4,
    fuelDistanceMiles: 80,
    campingSpots: 40,
    difficulty: 5,
    permits: "None required. BLM dispersed camping free. Some state trust land crossings.",
    seasonalNotes: "Best Oct-Apr. Summer temps exceed 110F in the desert sections. Monsoon season (Jul-Sep) can flood washes.",
    description:
      "The longest mapped UTV trail in the US. 680 miles through western Arizona desert from Yuma to Bullhead City. Mix of sandy washes, graded dirt roads, and rocky two-track. Fuel stops every 60-80 miles in small towns. Multiple river crossings on the Colorado River corridor. Extremely remote sections with no cell service for 50+ miles.",
    coordinates: {
      entry: { lat: 32.6927, lng: -114.6277 },
      exit: { lat: 35.1481, lng: -114.5683 },
    },
  },
  {
    id: "colorado-alpine-loop",
    name: "Colorado Alpine Loop",
    state: "CO",
    distanceMiles: 65,
    durationDays: "1-3",
    minWidthIn: 56,
    minClearanceIn: 12,
    minTireSize: "30x10R14",
    lowRangeRequired: true,
    waterCrossings: 8,
    rockIntensity: 7,
    fuelDistanceMiles: 65,
    campingSpots: 12,
    difficulty: 7,
    permits: "Colorado OHV registration or non-resident permit ($25.25). No additional trail permits.",
    seasonalNotes: "Open late Jun-Sep only. Snow closes Engineer and Cinnamon passes through winter. Afternoon thunderstorms common Jul-Aug above treeline.",
    description:
      "Classic alpine loop connecting Lake City, Ouray, and Silverton via Engineer Pass (12,800 ft) and Cinnamon Pass (12,620 ft). Tight shelf roads with steep dropoffs, loose rock, and stream crossings. Stunning 360-degree views above treeline. Narrow sections require careful passing. Multiple ghost towns and mining ruins along the route.",
    coordinates: {
      entry: { lat: 37.8197, lng: -107.3108 },
      exit: { lat: 37.8116, lng: -107.6645 },
    },
  },
  {
    id: "paiute-trail",
    name: "Paiute Trail",
    state: "UT",
    distanceMiles: 275,
    durationDays: "3-7",
    minWidthIn: 58,
    minClearanceIn: 11,
    minTireSize: "29x9R14",
    lowRangeRequired: false,
    waterCrossings: 5,
    rockIntensity: 5,
    fuelDistanceMiles: 60,
    campingSpots: 25,
    difficulty: 5,
    permits: "Utah OHV registration or non-resident permit ($30). Free dispersed camping on USFS land.",
    seasonalNotes: "Best May-Oct. Higher elevations (10,000+ ft) snow-covered Nov-May. Summer temps moderate at altitude.",
    description:
      "One of the premier UTV trail systems in the West. 275-mile loop through the Fishlake National Forest and Tushar Mountains in central Utah. Connects Marysvale, Circleville, Junction, and Joseph. Mix of smooth forest roads, rocky mountain passes, and high alpine meadows. Towns along the route provide fuel, food, and lodging. Well-marked trail system with numbered posts.",
    coordinates: {
      entry: { lat: 38.4494, lng: -112.2271 },
      exit: { lat: 38.4494, lng: -112.2271 },
    },
  },
  {
    id: "rubicon-trail",
    name: "Rubicon Trail",
    state: "CA",
    distanceMiles: 22,
    durationDays: "1-2",
    minWidthIn: 60,
    minClearanceIn: 14,
    minTireSize: "32x10R15",
    lowRangeRequired: true,
    waterCrossings: 4,
    rockIntensity: 9,
    fuelDistanceMiles: 22,
    campingSpots: 6,
    difficulty: 9,
    permits: "California OHV registration required ($52/yr). Loon Lake and Wentworth Springs require USFS campfire permits.",
    seasonalNotes: "Open Jul-Oct typically. Snow and ice persist at 7,000+ ft through June. Trail conditions vary dramatically year to year based on snowpack.",
    description:
      "The most famous off-road trail in America. 22 miles of granite boulders, ledges, and obstacles from Georgetown to Lake Tahoe. Cadillac Hill, Big Sluice, Little Sluice, and the Rubicon Springs are legendary obstacles. UTVs can complete the trail but need high clearance, skid plates, and rock sliders. Expect 6-10 hours to complete. Recovery gear mandatory.",
    coordinates: {
      entry: { lat: 38.9413, lng: -120.4177 },
      exit: { lat: 38.9866, lng: -120.1652 },
    },
  },
  {
    id: "moab-white-rim",
    name: "White Rim Trail",
    state: "UT",
    distanceMiles: 100,
    durationDays: "2-4",
    minWidthIn: 56,
    minClearanceIn: 10,
    minTireSize: "28x9R14",
    lowRangeRequired: false,
    waterCrossings: 0,
    rockIntensity: 4,
    fuelDistanceMiles: 100,
    campingSpots: 10,
    difficulty: 4,
    permits: "NPS permit required ($10/person, $40 max/vehicle). Reserve at recreation.gov. Limited daily entries.",
    seasonalNotes: "Best Mar-May and Sep-Nov. Summer temps exceed 100F. No shade on trail. Carry minimum 2 gallons water per person per day.",
    description:
      "100-mile loop on a sandstone bench 1,200 feet below Island in the Sky mesa in Canyonlands National Park. Mostly smooth but narrow shelf road with dramatic canyon views. Shafer Trail switchbacks and Mineral Bottom switchbacks are the most technical sections. No fuel, water, or services on trail. Must carry all supplies. Permit required and limited — book months in advance.",
    coordinates: {
      entry: { lat: 38.4587, lng: -109.8106 },
      exit: { lat: 38.4587, lng: -109.8106 },
    },
  },
  {
    id: "black-bear-pass",
    name: "Black Bear Pass",
    state: "CO",
    distanceMiles: 9,
    durationDays: "0.5",
    minWidthIn: 56,
    minClearanceIn: 13,
    minTireSize: "30x10R14",
    lowRangeRequired: true,
    waterCrossings: 2,
    rockIntensity: 8,
    fuelDistanceMiles: 9,
    campingSpots: 2,
    difficulty: 8,
    permits: "Colorado OHV registration or non-resident permit ($25.25). One-way downhill only for vehicles.",
    seasonalNotes: "Open Jul-Sep. Snow closes pass Oct-Jun. Afternoon thunderstorms create dangerous conditions above treeline. Start early.",
    description:
      "One of the most extreme mountain passes in Colorado. 9 miles from the summit to Telluride, descending 3,500 feet via tight switchbacks carved into the cliff face. One-way downhill only — no turning around once committed. The infamous steps section has 12%+ grade with loose rock. Views of Bridal Veil Falls and Telluride valley are world-class. Not for beginners.",
    coordinates: {
      entry: { lat: 37.8926, lng: -107.7222 },
      exit: { lat: 37.9375, lng: -107.8123 },
    },
  },
];

// ─── Helper ──────────────────────────────────────────────────────────

export function findTrail(id: string): TrailProfile | undefined {
  return trails.find((t) => t.id === id);
}

/** Parse minTireSize string to diameter in inches (e.g., "32x10R15" → 32) */
export function parseTireDiameter(tireSize: string): number {
  const match = tireSize.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 28;
}
