export interface Device {
  id: string;
  name: string;
  watts: number;
  category: string;
  defaultHours: number; // typical daily usage hours
  essential: boolean;
  note?: string;
}

export interface DeviceCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  devices: Device[];
}

// Amazon affiliate tag
const A = (asin: string) => `https://www.amazon.com/dp/${asin}?tag=prepperevo-20`;

export const deviceCategories: DeviceCategory[] = [
  {
    id: "lighting",
    name: "Lighting",
    color: "#EAB308",
    icon: "Lightbulb",
    devices: [
      { id: "led-bulb", name: "LED Light Bulb (10W)", watts: 10, category: "lighting", defaultHours: 6, essential: true },
      { id: "led-lantern", name: "LED Camping Lantern", watts: 5, category: "lighting", defaultHours: 5, essential: false },
      { id: "led-strip", name: "LED Strip Lights (5m)", watts: 15, category: "lighting", defaultHours: 4, essential: false },
      { id: "flood-light", name: "Outdoor Flood Light", watts: 50, category: "lighting", defaultHours: 3, essential: false },
      { id: "string-lights", name: "String Lights / Fairy Lights", watts: 8, category: "lighting", defaultHours: 4, essential: false },
    ],
  },
  {
    id: "communication",
    name: "Communication & Connectivity",
    color: "#06B6D4",
    icon: "Radio",
    devices: [
      { id: "phone-charger", name: "Phone Charger (per phone)", watts: 15, category: "communication", defaultHours: 2, essential: true },
      { id: "ham-radio", name: "Ham Radio (receive/standby)", watts: 5, category: "communication", defaultHours: 12, essential: false },
      { id: "ham-radio-tx", name: "Ham Radio (transmitting)", watts: 50, category: "communication", defaultHours: 1, essential: false },
      { id: "starlink", name: "Starlink Mini", watts: 40, category: "communication", defaultHours: 8, essential: false, note: "25-40W depending on mode" },
      { id: "starlink-std", name: "Starlink Standard / Roam Standard", watts: 75, category: "communication", defaultHours: 8, essential: false, note: "50-100W depending on conditions. Same hardware whether on Roam or Standard plan." },
      { id: "wifi-router", name: "WiFi Router", watts: 12, category: "communication", defaultHours: 24, essential: false },
      { id: "tablet-charger", name: "Tablet Charger", watts: 20, category: "communication", defaultHours: 2, essential: false },
      { id: "laptop-charger", name: "Laptop Charger", watts: 65, category: "communication", defaultHours: 4, essential: false },
      { id: "sat-phone", name: "Satellite Phone Charger", watts: 10, category: "communication", defaultHours: 1, essential: false },
      { id: "mesh-radio", name: "Meshtastic/Mesh Radio", watts: 1, category: "communication", defaultHours: 24, essential: false, note: "Ultra-low power mesh networking" },
      { id: "cb-radio", name: "CB Radio (mobile)", watts: 5, category: "communication", defaultHours: 4, essential: false },
    ],
  },
  {
    id: "medical",
    name: "Medical & Health",
    color: "#EF4444",
    icon: "Heart",
    devices: [
      { id: "cpap", name: "CPAP Machine", watts: 60, category: "medical", defaultHours: 8, essential: true, note: "30-60W without heated humidifier" },
      { id: "cpap-heated", name: "CPAP w/ Heated Humidifier", watts: 100, category: "medical", defaultHours: 8, essential: false, note: "Can draw 100W+" },
      { id: "nebulizer", name: "Nebulizer", watts: 45, category: "medical", defaultHours: 0.5, essential: false },
      { id: "oxygen-concentrator", name: "Portable Oxygen Concentrator", watts: 120, category: "medical", defaultHours: 12, essential: false, note: "High draw — plan accordingly" },
      { id: "mini-fridge-meds", name: "Mini Fridge (medication storage)", watts: 50, category: "medical", defaultHours: 24, essential: false, note: "Runs ~8hrs/day with cycling" },
      { id: "electric-blanket", name: "Heated Blanket (medical)", watts: 100, category: "medical", defaultHours: 8, essential: false },
      { id: "insulin-fridge", name: "Insulin Cooler (USB)", watts: 8, category: "medical", defaultHours: 24, essential: false, note: "Critical for diabetic supplies" },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen & Food Prep",
    color: "#22C55E",
    icon: "UtensilsCrossed",
    devices: [
      { id: "mini-fridge", name: "Mini Fridge / 12V Fridge", watts: 50, category: "kitchen", defaultHours: 24, essential: false, note: "Compressor cycles ~8hrs/day" },
      { id: "full-fridge", name: "Full-Size Fridge", watts: 150, category: "kitchen", defaultHours: 24, essential: false, note: "Cycles ~8-12hrs/day avg 60-80W" },
      { id: "chest-freezer", name: "Chest Freezer", watts: 100, category: "kitchen", defaultHours: 24, essential: false, note: "Very efficient — cycles ~6hrs/day" },
      { id: "microwave", name: "Microwave", watts: 1000, category: "kitchen", defaultHours: 0.25, essential: false, note: "Short bursts only — high draw" },
      { id: "electric-kettle", name: "Electric Kettle", watts: 1200, category: "kitchen", defaultHours: 0.1, essential: false, note: "Boils in ~3-5 min" },
      { id: "coffee-maker", name: "Coffee Maker", watts: 900, category: "kitchen", defaultHours: 0.15, essential: false },
      { id: "blender", name: "Blender", watts: 500, category: "kitchen", defaultHours: 0.1, essential: false },
      { id: "slow-cooker", name: "Slow Cooker / Instant Pot", watts: 300, category: "kitchen", defaultHours: 4, essential: false },
      { id: "toaster", name: "Toaster", watts: 850, category: "kitchen", defaultHours: 0.1, essential: false },
      { id: "ice-maker", name: "Portable Ice Maker", watts: 120, category: "kitchen", defaultHours: 6, essential: false },
    ],
  },
  {
    id: "climate",
    name: "Heating & Cooling",
    color: "#8B5E3C",
    icon: "Thermometer",
    devices: [
      { id: "box-fan", name: "Box Fan", watts: 75, category: "climate", defaultHours: 8, essential: false },
      { id: "tower-fan", name: "Tower Fan", watts: 50, category: "climate", defaultHours: 8, essential: false },
      { id: "ceiling-fan", name: "Ceiling Fan", watts: 60, category: "climate", defaultHours: 10, essential: false },
      { id: "space-heater", name: "Space Heater (small)", watts: 750, category: "climate", defaultHours: 4, essential: false, note: "Major power draw — consider propane" },
      { id: "space-heater-lg", name: "Space Heater (large)", watts: 1500, category: "climate", defaultHours: 4, essential: false, note: "Extremely high draw" },
      { id: "heated-blanket", name: "Electric Heated Blanket", watts: 100, category: "climate", defaultHours: 8, essential: false, note: "Much more efficient than space heater" },
      { id: "portable-ac", name: "Portable A/C Unit", watts: 1200, category: "climate", defaultHours: 6, essential: false, note: "Major draw — typically not viable off-grid" },
      { id: "ecoflow-wave3", name: "EcoFlow WAVE 3 (cooling)", watts: 1800, category: "climate", defaultHours: 4, essential: false, note: "6100 BTU, built-in 1024Wh LFP, 8hr cordless, IPX4" },
      { id: "ecoflow-wave3-heat", name: "EcoFlow WAVE 3 (heating)", watts: 2000, category: "climate", defaultHours: 4, essential: false, note: "6800 BTU heat mode, same unit as cooling" },
      { id: "ecoflow-wave2", name: "EcoFlow WAVE 2 (cooling)", watts: 700, category: "climate", defaultHours: 5, essential: false, note: "5100 BTU, battery sold separately, heat capable" },
      { id: "zero-breeze-mk3", name: "Zero Breeze Mark 3 (cooling)", watts: 1550, category: "climate", defaultHours: 4, essential: false, note: "5280 BTU, 22 lbs, battery sold separately, heat capable" },
      { id: "zero-breeze-mk2", name: "Zero Breeze Mark 2 (cooling)", watts: 240, category: "climate", defaultHours: 5, essential: false, note: "2300 BTU, ultra-low draw, battery powered, cooling only" },
      { id: "dehumidifier", name: "Dehumidifier", watts: 300, category: "climate", defaultHours: 12, essential: false },
    ],
  },
  {
    id: "electronics",
    name: "Electronics & Entertainment",
    color: "#A855F7",
    icon: "Tv",
    devices: [
      { id: "tv-32", name: "TV (32\" LED)", watts: 40, category: "electronics", defaultHours: 4, essential: false },
      { id: "tv-55", name: "TV (55\" LED)", watts: 80, category: "electronics", defaultHours: 4, essential: false },
      { id: "gaming-console", name: "Gaming Console", watts: 150, category: "electronics", defaultHours: 2, essential: false },
      { id: "monitor", name: "Computer Monitor", watts: 30, category: "electronics", defaultHours: 4, essential: false },
      { id: "desktop-pc", name: "Desktop PC", watts: 300, category: "electronics", defaultHours: 4, essential: false },
      { id: "drone-charger", name: "Drone Battery Charger", watts: 60, category: "electronics", defaultHours: 2, essential: false },
      { id: "camera-charger", name: "Camera Battery Charger", watts: 15, category: "electronics", defaultHours: 2, essential: false },
      { id: "speaker", name: "Bluetooth Speaker", watts: 10, category: "electronics", defaultHours: 3, essential: false },
      { id: "projector", name: "Mini Projector", watts: 50, category: "electronics", defaultHours: 2, essential: false },
      { id: "ebook-reader", name: "E-Reader Charger (Kindle)", watts: 5, category: "electronics", defaultHours: 0.5, essential: false, note: "Charges in ~30 min, lasts weeks" },
    ],
  },
  {
    id: "overlanding",
    name: "Overlanding & Vehicle",
    color: "#8B6F47",
    icon: "Truck",
    devices: [
      { id: "12v-fridge", name: "12V Overlanding Fridge (50qt)", watts: 45, category: "overlanding", defaultHours: 24, essential: false, note: "Compressor cycles ~8hrs/day" },
      { id: "air-compressor", name: "Portable Air Compressor", watts: 180, category: "overlanding", defaultHours: 0.25, essential: false, note: "Short use — tire inflation" },
      { id: "winch", name: "Electric Winch", watts: 4500, category: "overlanding", defaultHours: 0.05, essential: false, note: "3-5 min max — vehicle battery" },
      { id: "camp-lights-12v", name: "12V Camp Lights", watts: 15, category: "overlanding", defaultHours: 5, essential: false },
      { id: "inverter-draw", name: "Inverter Standby Draw", watts: 15, category: "overlanding", defaultHours: 24, essential: false, note: "Idle loss when inverter is on" },
      { id: "electric-cooler", name: "Thermoelectric Cooler", watts: 60, category: "overlanding", defaultHours: 12, essential: false, note: "Less efficient than compressor fridge" },
      { id: "roof-fan", name: "Roof Vent Fan (MaxxAir)", watts: 15, category: "overlanding", defaultHours: 8, essential: false },
      { id: "heated-seat", name: "12V Heated Seat Pad", watts: 45, category: "overlanding", defaultHours: 4, essential: false },
      { id: "tire-pump", name: "12V Portable Tire Inflator", watts: 120, category: "overlanding", defaultHours: 0.15, essential: false },
    ],
  },
  {
    id: "tools",
    name: "Power Tools & Utility",
    color: "#6B7280",
    icon: "Wrench",
    devices: [
      { id: "drill", name: "Cordless Drill (charger)", watts: 80, category: "tools", defaultHours: 1, essential: false },
      { id: "circular-saw", name: "Circular Saw", watts: 1400, category: "tools", defaultHours: 0.25, essential: false, note: "Very high draw — check inverter capacity" },
      { id: "angle-grinder", name: "Angle Grinder", watts: 800, category: "tools", defaultHours: 0.25, essential: false },
      { id: "sump-pump", name: "Sump Pump", watts: 500, category: "tools", defaultHours: 4, essential: false, note: "Critical during flooding" },
      { id: "water-pump", name: "Well Water Pump", watts: 750, category: "tools", defaultHours: 2, essential: false },
      { id: "battery-charger", name: "Power Tool Battery Charger", watts: 100, category: "tools", defaultHours: 2, essential: false },
      { id: "garage-door", name: "Garage Door Opener", watts: 500, category: "tools", defaultHours: 0.05, essential: false },
      { id: "security-camera", name: "Security Camera System", watts: 30, category: "tools", defaultHours: 24, essential: false },
      { id: "radio-scanner", name: "Police/Weather Scanner", watts: 5, category: "tools", defaultHours: 12, essential: false, note: "Monitor emergency frequencies" },
      { id: "soldering-iron", name: "Portable Soldering Iron", watts: 65, category: "tools", defaultHours: 0.5, essential: false },
    ],
  },
];

export const allDevices = deviceCategories.flatMap((c) => c.devices);

// ─── Solar Insolation Data (Peak Sun Hours by US Region) ───
export interface SolarRegion {
  id: string;
  name: string;
  peakSunHours: number; // average daily peak sun hours
  note: string;
}

export const solarRegions: SolarRegion[] = [
  { id: "southwest", name: "Southwest (AZ, NM, NV, UT, S. CA)", peakSunHours: 6.5, note: "Best solar in the US" },
  { id: "south", name: "South (TX, OK, LA, AR, MS, AL, S. FL)", peakSunHours: 5.5, note: "Strong year-round" },
  { id: "southeast", name: "Southeast (GA, SC, NC, VA, TN, KY, WV, N. FL)", peakSunHours: 5.0, note: "Good with some cloud cover" },
  { id: "california", name: "California (N. CA, Central Valley)", peakSunHours: 5.5, note: "Varies by coast vs inland — strong overall" },
  { id: "mountain", name: "Mountain (CO, MT, WY, ID)", peakSunHours: 5.5, note: "High altitude helps efficiency" },
  { id: "midwest", name: "Midwest (IL, IN, OH, MI, WI, MN, IA, MO, ND, SD, NE, KS)", peakSunHours: 4.2, note: "Seasonal variation — plan for winter" },
  { id: "northeast", name: "Northeast (NY, NJ, PA, CT, MA, ME, NH, VT, RI, DE, MD, DC)", peakSunHours: 4.0, note: "Winter dips significantly" },
  { id: "northwest", name: "Northwest (WA, OR)", peakSunHours: 3.5, note: "Lowest — oversize your panels" },
  { id: "hawaii", name: "Hawaii", peakSunHours: 6.0, note: "Consistent year-round" },
  { id: "alaska", name: "Alaska", peakSunHours: 3.0, note: "Extreme seasonal variation" },
];

// ─── Power Station Recommendations (tiered by capacity) ───
export interface PowerStationRec {
  id: string;
  name: string;
  capacityWh: number;
  maxOutputW: number;
  price: string;
  affiliateUrl: string;
  note: string;
}

export const powerStations: PowerStationRec[] = [
  { id: "jackery-300p", name: "Jackery Explorer 300 Plus", capacityWh: 288, maxOutputW: 300, price: "$249", affiliateUrl: A("B0CFV93GZM"), note: "Ultraportable, great for phones/lights" },
  { id: "ecoflow-river2", name: "EcoFlow RIVER 2", capacityWh: 256, maxOutputW: 300, price: "$179", affiliateUrl: A("B0B8MXPRDB"), note: "Fastest recharge in class (60 min)" },
  { id: "ecoflow-river3", name: "EcoFlow RIVER 3", capacityWh: 245, maxOutputW: 300, price: "$169", affiliateUrl: A("B0DB1S36YP"), note: "LFP, X-Boost 600W, IP54, 1hr fast charge" },
  { id: "jackery-1000p", name: "Jackery Explorer 1000 Plus", capacityWh: 1264, maxOutputW: 2000, price: "$799", affiliateUrl: A("B0C37CWBKZ"), note: "Expandable to 5kWh" },
  { id: "ecoflow-delta2", name: "EcoFlow DELTA 2", capacityWh: 1024, maxOutputW: 1800, price: "$649", affiliateUrl: A("B0B9XB57XM"), note: "Best value mid-range" },
  { id: "ecoflow-delta3-plus", name: "EcoFlow DELTA 3 Plus", capacityWh: 1024, maxOutputW: 1800, price: "$799", affiliateUrl: A("B0GQBJ2SCT"), note: "LFP, 140W USB-C, UPS mode, expandable to 5kWh" },
  { id: "ecoflow-delta3-1500", name: "EcoFlow DELTA 3 1500", capacityWh: 1536, maxOutputW: 2200, price: "$899", affiliateUrl: A("B0DFY9VZSX"), note: "LFP, X-Boost 2200W, 6 AC outlets, expandable to 5.5kWh" },
  { id: "bluetti-ac200max", name: "Bluetti AC200MAX", capacityWh: 2048, maxOutputW: 2200, price: "$1,599", affiliateUrl: A("B09GKCH4CW"), note: "LiFePO4 — 3,500+ cycles" },
  { id: "ecoflow-delta2max", name: "EcoFlow DELTA 2 Max", capacityWh: 2048, maxOutputW: 2400, price: "$1,599", affiliateUrl: A("B0C4DW17PD"), note: "Expandable to 6kWh" },
  { id: "ecoflow-delta3-max-plus", name: "EcoFlow DELTA 3 Max Plus", capacityWh: 2048, maxOutputW: 3000, price: "$1,899", affiliateUrl: A("B0FQV9Q9J2"), note: "LFP, 3000W output, expandable to 10kWh" },
  { id: "bluetti-ac200l", name: "Bluetti AC200L", capacityWh: 2048, maxOutputW: 2400, price: "$1,199", affiliateUrl: A("B0CLGZB3L6"), note: "LiFePO4, expandable, WiFi app control" },
  { id: "ecoflow-deltapro", name: "EcoFlow DELTA Pro", capacityWh: 3600, maxOutputW: 3600, price: "$2,399", affiliateUrl: A("B0C1Z4GLKS"), note: "Home backup capable — expandable to 25kWh" },
  { id: "ecoflow-delta3-ultra", name: "EcoFlow DELTA 3 Ultra", capacityWh: 3072, maxOutputW: 3600, price: "$2,499", affiliateUrl: A("B0FT32MCM9"), note: "LFP, 7200W surge, 25dB quiet, expandable to 11kWh" },
  { id: "bluetti-ep500", name: "Bluetti EP500", capacityWh: 5100, maxOutputW: 2000, price: "$3,499", affiliateUrl: A("B0C1ZDF36J"), note: "Whole-home backup, UPS function" },
  { id: "gz-yeti-500x", name: "Goal Zero Yeti 500X", capacityWh: 505, maxOutputW: 300, price: "$400", affiliateUrl: A("B085KRMCCY"), note: "Lightweight, chain with Yeti Link" },
  { id: "gz-yeti-1000-core", name: "Goal Zero Yeti 1000 Core", capacityWh: 983, maxOutputW: 1500, price: "$800", affiliateUrl: A("B096ST3VMS"), note: "Wi-Fi app, expandable" },
  { id: "jackery-500", name: "Jackery Explorer 500", capacityWh: 518, maxOutputW: 500, price: "$299", affiliateUrl: A("B07SM5HBK1"), note: "Budget-friendly mid-size" },
  { id: "anker-c1000", name: "Anker SOLIX C1000", capacityWh: 1056, maxOutputW: 1800, price: "$599", affiliateUrl: A("B0C5C89QKZ"), note: "HyperFlash recharge in 58 min" },
  { id: "bluetti-eb3a", name: "Bluetti EB3A", capacityWh: 268, maxOutputW: 600, price: "$199", affiliateUrl: A("B09WW3CTF4"), note: "UPS mode, great for CPAP travel" },
  { id: "ecoflow-river2max", name: "EcoFlow RIVER 2 Max", capacityWh: 512, maxOutputW: 500, price: "$349", affiliateUrl: A("B0B97H2XHS"), note: "X-Boost to 1000W for small appliances" },
  { id: "ecoflow-river3-plus", name: "EcoFlow RIVER 3 Plus", capacityWh: 286, maxOutputW: 600, price: "$219", affiliateUrl: A("B0DCCB657J"), note: "LFP, X-Boost 1200W, UPS mode, expandable to 858Wh" },
  { id: "anker-f2000", name: "Anker SOLIX F2000 (PowerHouse 767)", capacityWh: 2048, maxOutputW: 2400, price: "$1,399", affiliateUrl: A("B09XM7WDZ2"), note: "LiFePO4, 3000+ cycles" },
  { id: "jackery-2000p", name: "Jackery Explorer 2000 Plus", capacityWh: 2042, maxOutputW: 3000, price: "$1,899", affiliateUrl: A("B0C6DHK68Q"), note: "Expandable to 12kWh, LiFePO4" },
  // ─── High-kWh Home Backup Tier ───
  { id: "jackery-3000pro", name: "Jackery Explorer 3000 Pro", capacityWh: 3024, maxOutputW: 3000, price: "$2,499", affiliateUrl: A("B0BZ8DZ3HR"), note: "Smart app control, 2.4hr fast charge" },
  { id: "bluetti-ac500", name: "Bluetti AC500 + B300S", capacityWh: 3072, maxOutputW: 5000, price: "$3,499", affiliateUrl: A("B0BPRVQGVF"), note: "Modular — expandable to 18kWh, 10kW surge, 240V" },
  { id: "ecoflow-deltapro3", name: "EcoFlow DELTA Pro 3", capacityWh: 4096, maxOutputW: 4000, price: "$2,799", affiliateUrl: A("B0D14FMFZD"), note: "LFP, expandable to 48kWh, 120/240V, powers 3-ton AC" },
  { id: "bluetti-ep500pro", name: "Bluetti EP500Pro", capacityWh: 5100, maxOutputW: 3000, price: "$3,499", affiliateUrl: A("B0BCJ7HTS2"), note: "UPS function, 2400W solar input, whole-home backup" },
  { id: "gz-yeti-6000x", name: "Goal Zero Yeti 6000X", capacityWh: 6000, maxOutputW: 2000, price: "$5,500", affiliateUrl: A("B08V8G9MVW"), note: "Home integration kit available, 600W MPPT solar" },
  { id: "ecoflow-deltapro-ultra", name: "EcoFlow DELTA Pro Ultra", capacityWh: 6144, maxOutputW: 7200, price: "$5,799", affiliateUrl: A("B0D98PKKK5"), note: "Top tier — expandable to 90kWh, 120/240V, Smart Home Panel" },
];

// ─── Solar Panel Recommendations ───
export interface SolarPanelRec {
  id: string;
  name: string;
  watts: number;
  price: string;
  affiliateUrl: string;
  note: string;
  portable: boolean;
}

export const solarPanels: SolarPanelRec[] = [
  { id: "jackery-100", name: "Jackery SolarSaga 100W", watts: 100, price: "$300", affiliateUrl: A("B0D5CCY5Y2"), note: "Foldable, 100W", portable: true },
  { id: "bigblue-100", name: "BigBlue 100W Solar Panel", watts: 100, price: "$200", affiliateUrl: A("B083NS75XH"), note: "Budget foldable", portable: true },
  { id: "renogy-200", name: "Renogy 200W Portable Suitcase", watts: 200, price: "$330", affiliateUrl: A("B0CNPHD4VY"), note: "IP65, kickstand, charge controller included", portable: true },
  { id: "ecoflow-110", name: "EcoFlow 110W Portable Panel", watts: 110, price: "$199", affiliateUrl: A("B0D5QWD1FK"), note: "IP68, foldable, 23% efficiency, carry case included", portable: true },
  { id: "ecoflow-220", name: "EcoFlow 220W Bifacial Panel", watts: 220, price: "$399", affiliateUrl: A("B09TKM8PBQ"), note: "Bifacial — captures reflected light", portable: true },
  { id: "ecoflow-220-ntype", name: "EcoFlow 220W N-Type Panel", watts: 220, price: "$399", affiliateUrl: A("B0D2H94PS6"), note: "N-Type cells, 25% efficiency, bifacial +28% gain", portable: true },
  { id: "jackery-200", name: "Jackery SolarSaga 200W", watts: 200, price: "$500", affiliateUrl: A("B0D8377KV3"), note: "Higher efficiency PERC cells", portable: true },
  { id: "ecoflow-400", name: "EcoFlow 400W Portable Panel", watts: 400, price: "$599", affiliateUrl: A("B09TKKYW7G"), note: "Best watts/dollar for large systems", portable: true },
  { id: "renogy-400", name: "Renogy 400W Suitcase Panel", watts: 400, price: "$580", affiliateUrl: A("B0D4LMVKYD"), note: "23% efficiency, IP67", portable: true },
  { id: "rigid-100", name: "Renogy 100W Rigid Panel", watts: 100, price: "$90", affiliateUrl: A("B07GF5JY35"), note: "Permanent mount — RV/cabin rooftop", portable: false },
  { id: "rigid-200", name: "Renogy 200W Rigid Panel", watts: 200, price: "$170", affiliateUrl: A("B08CRJYJ22"), note: "Permanent mount — best efficiency", portable: false },
  { id: "gz-nomad-100", name: "Goal Zero Nomad 100", watts: 100, price: "$300", affiliateUrl: A("B016UQNGFS"), note: "Monocrystalline foldable, pairs with Yeti stations", portable: true },
  { id: "anker-ps100", name: "Anker SOLIX PS100", watts: 100, price: "$190", affiliateUrl: A("B0CYSD1C6Y"), note: "IP67, lightweight foldable", portable: true },
  { id: "gz-boulder-100", name: "Goal Zero Boulder 100 Briefcase", watts: 100, price: "$250", affiliateUrl: A("B06Y3TC113"), note: "Rugged aluminum frame", portable: true },
  { id: "bluetti-pv200", name: "Bluetti PV200", watts: 200, price: "$350", affiliateUrl: A("B0CCXSFSSJ"), note: "23.4% efficiency, foldable", portable: true },
  { id: "renogy-flex-100", name: "Renogy 100W Flexible", watts: 100, price: "$130", affiliateUrl: A("B07BMNGVV3"), note: "Flexible — mounts on curved surfaces", portable: false },
  { id: "ecoflow-160", name: "EcoFlow 160W Portable", watts: 160, price: "$300", affiliateUrl: A("B0D3VCQV6W"), note: "Kickstand, pairs with RIVER series", portable: true },
  { id: "jackery-80", name: "Jackery SolarSaga 80", watts: 80, price: "$250", affiliateUrl: A("B0BMPJ2H5X"), note: "Double-sided, lightweight", portable: true },
  { id: "bougerv-200", name: "BougeRV 200W", watts: 200, price: "$280", affiliateUrl: A("B0C85XKYH2"), note: "Budget 200W option, CIGS tech", portable: true },
  // ─── High-Watt Panels for Home Backup / Off-Grid ───
  { id: "ecoflow-rigid-2x400", name: "EcoFlow 2x400W Rigid Panel Kit", watts: 800, price: "$799", affiliateUrl: A("B0CVL9S84Y"), note: "Permanent mount — balcony, RV, cabin rooftop", portable: false },
  { id: "renogy-800-kit", name: "Renogy 800W Solar Kit (8x100W)", watts: 800, price: "$999", affiliateUrl: A("B08CKHPWHC"), note: "Complete kit — 60A MPPT controller, cables, brackets included", portable: false },
  { id: "ecoflow-rigid-2x100", name: "EcoFlow 2x100W Rigid Panel", watts: 200, price: "$249", affiliateUrl: A("B0D5QXLVC9"), note: "IP68, permanent mount for RV/cabin", portable: false },
];

// ─── Constants ───
export const SYSTEM_LOSS = 0.15; // 15% loss for wiring, inverter, temperature
export const BATTERY_DOD = 0.80; // Only use 80% of battery (protect longevity)
export const BUFFER_FACTOR = 1.25; // 25% safety buffer on calculations

// ─── Living Situations ───
export type LivingSituation = "house" | "apartment" | "rural" | "rv";

export interface LivingSituationOption {
  id: LivingSituation;
  name: string;
  desc: string;
}

export const livingSituations: LivingSituationOption[] = [
  { id: "house", name: "House", desc: "Roof or yard for panels, full outlet access" },
  { id: "apartment", name: "Apartment", desc: "Balcony only, weight limits, HOA rules" },
  { id: "rural", name: "Rural", desc: "Unlimited space, ground-mount possible" },
  { id: "rv", name: "RV / Van", desc: "Roof-mounted or portable panels only" },
];

// ─── Data Sources ───
export const dataSources = [
  { name: "NREL PVWatts Calculator", url: "https://pvwatts.nrel.gov", note: "Solar irradiance data by location" },
  { name: "EcoFlow", url: "https://www.ecoflow.com", note: "Power station specifications" },
  { name: "Goal Zero", url: "https://www.goalzero.com", note: "Product wattage data" },
  { name: "US DOE", note: "Appliance energy consumption estimates" },
];
