// ─── Overland Load Balancer — Vehicle Database ───────────────────────
// Payload-focused specs for overlanding vehicles, 2000–present.
//
// Sources:
//   GVWR / curb weight: Manufacturer owner's manuals, window stickers,
//   NHTSA vehicle database, and verified overlanding community data.
//   Wheelbase: Manufacturer spec sheets.
//   Payload = GVWR − curb weight (confirm against your door jamb sticker).
//
// IMPORTANT: Payload varies by trim, engine, options, and build date.
// These are representative values for the most common overlanding config
// per generation. Always verify against the sticker on your driver's
// door jamb — that is the legally binding number for your specific VIN.
//
// Confidence:
//   high   — confirmed from multiple sources (owner's manual, NHTSA, forums)
//   medium — one confirmed source or cross-validated from community data
//   low    — estimated from generation-level data; verify before relying on it

export interface LBVehicle {
  id: string;
  make: string;
  model: string;
  generation: string;
  yearStart: number;
  yearEnd: number | null; // null = current production
  trim: string;
  gvwrLbs: number;
  curbWeightLbs: number;
  payloadLbs: number;
  gawrFrontLbs?: number;
  gawrRearLbs?: number;
  wheelbaseIn: number;
  drivetrain: "4WD" | "AWD" | "4x4";
  bodyStyle: string;
  notes?: string;
  confidence: "high" | "medium" | "low";
}

export const lbVehicleDatabase: LBVehicle[] = [

  // ══════════════════════════════════════════════════════════════════
  // TOYOTA
  // ══════════════════════════════════════════════════════════════════

  // ─── Tacoma ────────────────────────────────────────────────────────
  {
    id: "tacoma-gen1-4wd",
    make: "Toyota", model: "Tacoma", generation: "1st Gen",
    yearStart: 2000, yearEnd: 2004,
    trim: "4WD V6 XtraCab / Double Cab",
    gvwrLbs: 4700, curbWeightLbs: 3680, payloadLbs: 1020,
    wheelbaseIn: 121.0, drivetrain: "4WD", bodyStyle: "Mid-Size Truck",
    notes: "Payload varies by cab/bed combo. PreRunner 2WD has higher payload.",
    confidence: "medium",
  },
  {
    id: "tacoma-gen2-4wd-dc",
    make: "Toyota", model: "Tacoma", generation: "2nd Gen",
    yearStart: 2005, yearEnd: 2015,
    trim: "TRD Off-Road 4WD Double Cab",
    gvwrLbs: 5800, curbWeightLbs: 4390, payloadLbs: 1410,
    wheelbaseIn: 127.4, drivetrain: "4WD", bodyStyle: "Mid-Size Truck",
    notes: "Access Cab 4WD carries ~200 lbs more. 2005-2009 V8 option adds weight.",
    confidence: "high",
  },
  {
    id: "tacoma-gen3-4wd-dc",
    make: "Toyota", model: "Tacoma", generation: "3rd Gen",
    yearStart: 2016, yearEnd: 2023,
    trim: "TRD Off-Road 4WD Double Cab",
    gvwrLbs: 5600, curbWeightLbs: 4480, payloadLbs: 1120,
    wheelbaseIn: 127.4, drivetrain: "4WD", bodyStyle: "Mid-Size Truck",
    notes: "3rd gen is notably heavier than 2nd gen. TRD Pro further reduces payload ~50 lbs.",
    confidence: "high",
  },
  {
    id: "tacoma-gen4-4wd-dc",
    make: "Toyota", model: "Tacoma", generation: "4th Gen",
    yearStart: 2024, yearEnd: null,
    trim: "TRD Off-Road 4WD Double Cab",
    gvwrLbs: 5800, curbWeightLbs: 4515, payloadLbs: 1285,
    wheelbaseIn: 127.4, drivetrain: "4WD", bodyStyle: "Mid-Size Truck",
    notes: "New platform recovers some payload vs 3rd gen. i-FORCE MAX hybrid adds weight.",
    confidence: "high",
  },

  // ─── 4Runner ────────────────────────────────────────────────────────
  {
    id: "4runner-3rdgen-4wd",
    make: "Toyota", model: "4Runner", generation: "3rd Gen",
    yearStart: 2000, yearEnd: 2002,
    trim: "SR5 / Limited 4WD",
    gvwrLbs: 5000, curbWeightLbs: 3990, payloadLbs: 1010,
    wheelbaseIn: 105.3, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "Last year of the 3rd gen platform. Lighter than later generations.",
    confidence: "medium",
  },
  {
    id: "4runner-4thgen-4wd",
    make: "Toyota", model: "4Runner", generation: "4th Gen",
    yearStart: 2003, yearEnd: 2009,
    trim: "Sport/Trail Edition 4WD",
    gvwrLbs: 5800, curbWeightLbs: 4300, payloadLbs: 1500,
    wheelbaseIn: 109.8, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "4th gen has best payload of any 4Runner generation. V8 option adds ~150 lbs.",
    confidence: "medium",
  },
  {
    id: "4runner-5thgen-trd-4wd",
    make: "Toyota", model: "4Runner", generation: "5th Gen",
    yearStart: 2010, yearEnd: 2024,
    trim: "TRD Off-Road 4WD",
    gvwrLbs: 5750, curbWeightLbs: 4575, payloadLbs: 1175,
    wheelbaseIn: 109.8, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "TRD Pro is ~50 lbs heavier (payload ~1,125 lbs). Base SR5 payload is higher (~1,400 lbs).",
    confidence: "high",
  },
  {
    id: "4runner-6thgen-trd-4wd",
    make: "Toyota", model: "4Runner", generation: "6th Gen",
    yearStart: 2025, yearEnd: null,
    trim: "TRD Off-Road 4WD",
    gvwrLbs: 6000, curbWeightLbs: 4600, payloadLbs: 1400,
    wheelbaseIn: 109.8, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "New platform with improved payload over 5th gen. Hybrid i-FORCE MAX option adds weight.",
    confidence: "low",
  },

  // ─── Land Cruiser ───────────────────────────────────────────────────
  {
    id: "land-cruiser-100-4wd",
    make: "Toyota", model: "Land Cruiser", generation: "100 Series",
    yearStart: 2000, yearEnd: 2007,
    trim: "4WD",
    gvwrLbs: 6900, curbWeightLbs: 5390, payloadLbs: 1510,
    wheelbaseIn: 112.2, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "One of the most capable platforms of its era. Heavy but reliable.",
    confidence: "medium",
  },
  {
    id: "land-cruiser-200-4wd",
    make: "Toyota", model: "Land Cruiser", generation: "200 Series",
    yearStart: 2008, yearEnd: 2021,
    trim: "4WD",
    gvwrLbs: 7100, curbWeightLbs: 5600, payloadLbs: 1500,
    wheelbaseIn: 112.2, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Heritage V8. Final gen before full electrification. Payload stable across years.",
    confidence: "medium",
  },
  {
    id: "land-cruiser-300-4wd",
    make: "Toyota", model: "Land Cruiser", generation: "300 Series",
    yearStart: 2022, yearEnd: null,
    trim: "4WD",
    gvwrLbs: 7275, curbWeightLbs: 5715, payloadLbs: 1560,
    wheelbaseIn: 112.2, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Twin-turbo V6 replaces V8. Improved payload over 200 Series despite similar size.",
    confidence: "medium",
  },

  // ─── Tundra ─────────────────────────────────────────────────────────
  {
    id: "tundra-gen1-4wd",
    make: "Toyota", model: "Tundra", generation: "1st Gen",
    yearStart: 2000, yearEnd: 2006,
    trim: "SR5 4WD Access Cab",
    gvwrLbs: 5900, curbWeightLbs: 4530, payloadLbs: 1370,
    wheelbaseIn: 128.3, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "Double Cab not available until 2004. V8 CrewMax config adds weight.",
    confidence: "medium",
  },
  {
    id: "tundra-gen2-crewmax-4wd",
    make: "Toyota", model: "Tundra", generation: "2nd Gen",
    yearStart: 2007, yearEnd: 2021,
    trim: "TRD Off-Road 4WD CrewMax",
    gvwrLbs: 7000, curbWeightLbs: 5585, payloadLbs: 1415,
    wheelbaseIn: 145.7, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "5.7L V8. Payload consistent across most of this generation. 2010+ gets minor updates.",
    confidence: "high",
  },
  {
    id: "tundra-gen3-trd-4wd",
    make: "Toyota", model: "Tundra", generation: "3rd Gen",
    yearStart: 2022, yearEnd: null,
    trim: "TRD Off-Road 4WD CrewMax",
    gvwrLbs: 7050, curbWeightLbs: 5615, payloadLbs: 1435,
    wheelbaseIn: 145.7, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "Twin-turbo V6 with hybrid option. i-FORCE MAX (hybrid) adds ~150 lbs curb weight.",
    confidence: "high",
  },

  // ─── Sequoia ─────────────────────────────────────────────────────────
  {
    id: "sequoia-gen1-4wd",
    make: "Toyota", model: "Sequoia", generation: "1st Gen",
    yearStart: 2001, yearEnd: 2007,
    trim: "SR5 / Limited 4WD",
    gvwrLbs: 6800, curbWeightLbs: 5000, payloadLbs: 1800,
    wheelbaseIn: 118.1, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Best payload of any Sequoia generation. Truck-based platform.",
    confidence: "medium",
  },
  {
    id: "sequoia-gen2-4wd",
    make: "Toyota", model: "Sequoia", generation: "2nd Gen",
    yearStart: 2008, yearEnd: 2022,
    trim: "TRD Off-Road 4WD",
    gvwrLbs: 7100, curbWeightLbs: 5900, payloadLbs: 1200,
    wheelbaseIn: 121.1, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Heavier platform than Gen 1 with similar GVWR = reduced payload.",
    confidence: "medium",
  },
  {
    id: "sequoia-gen3-trdpro-4wd",
    make: "Toyota", model: "Sequoia", generation: "3rd Gen",
    yearStart: 2023, yearEnd: null,
    trim: "TRD Pro 4WD",
    gvwrLbs: 7800, curbWeightLbs: 6100, payloadLbs: 1700,
    wheelbaseIn: 121.1, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Hybrid-only. Higher GVWR vs Gen 2 recovers payload capacity significantly.",
    confidence: "medium",
  },

  // ─── FJ Cruiser ──────────────────────────────────────────────────────
  {
    id: "fj-cruiser-4wd",
    make: "Toyota", model: "FJ Cruiser", generation: "Only Gen",
    yearStart: 2007, yearEnd: 2014,
    trim: "4WD",
    gvwrLbs: 5350, curbWeightLbs: 4375, payloadLbs: 975,
    wheelbaseIn: 105.9, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "Heavy vehicle with limited payload. Popular overlander despite the constraint.",
    confidence: "medium",
  },

  // ══════════════════════════════════════════════════════════════════
  // FORD
  // ══════════════════════════════════════════════════════════════════

  // ─── F-150 ──────────────────────────────────────────────────────────
  {
    id: "f150-gen10-4x4",
    make: "Ford", model: "F-150", generation: "10th Gen",
    yearStart: 1999, yearEnd: 2003,
    trim: "XLT / Lariat 4x4 SuperCrew",
    gvwrLbs: 6600, curbWeightLbs: 4750, payloadLbs: 1850,
    wheelbaseIn: 138.5, drivetrain: "4x4", bodyStyle: "Full-Size Truck",
    notes: "Steel body. Payload varies significantly by engine and axle ratio.",
    confidence: "medium",
  },
  {
    id: "f150-gen11-4x4",
    make: "Ford", model: "F-150", generation: "11th Gen",
    yearStart: 2004, yearEnd: 2008,
    trim: "FX4 / Lariat 4x4 SuperCrew",
    gvwrLbs: 7000, curbWeightLbs: 4950, payloadLbs: 2050,
    wheelbaseIn: 138.5, drivetrain: "4x4", bodyStyle: "Full-Size Truck",
    notes: "5.4L Triton V8 common in this gen. Strong payload for the era.",
    confidence: "medium",
  },
  {
    id: "f150-gen12-4x4",
    make: "Ford", model: "F-150", generation: "12th Gen",
    yearStart: 2009, yearEnd: 2014,
    trim: "FX4 / Lariat 4x4 SuperCrew",
    gvwrLbs: 7350, curbWeightLbs: 5050, payloadLbs: 2300,
    wheelbaseIn: 145.0, drivetrain: "4x4", bodyStyle: "Full-Size Truck",
    notes: "EcoBoost introduced in 2011. 6.5' bed on SuperCrew. Payload varies widely.",
    confidence: "medium",
  },
  {
    id: "f150-gen13-4x4",
    make: "Ford", model: "F-150", generation: "13th Gen (Aluminum)",
    yearStart: 2015, yearEnd: 2020,
    trim: "Lariat / Tremor 4x4 SuperCrew",
    gvwrLbs: 7600, curbWeightLbs: 5000, payloadLbs: 2100,
    wheelbaseIn: 157.4, drivetrain: "4x4", bodyStyle: "Full-Size Truck",
    notes: "Aluminum body reduced curb weight significantly. Payload up to 3,270 lbs on base trim.",
    confidence: "medium",
  },
  {
    id: "f150-gen14-4x4",
    make: "Ford", model: "F-150", generation: "14th Gen",
    yearStart: 2021, yearEnd: null,
    trim: "Tremor / Lariat 4x4 SuperCrew 5.5'",
    gvwrLbs: 7850, curbWeightLbs: 5050, payloadLbs: 1985,
    wheelbaseIn: 157.4, drivetrain: "4x4", bodyStyle: "Full-Size Truck",
    notes: "Tremor/high-option trims have lower payload than base configs. PowerBoost hybrid reduces payload further.",
    confidence: "medium",
  },

  // ─── Ranger ─────────────────────────────────────────────────────────
  {
    id: "ranger-old-4x4",
    make: "Ford", model: "Ranger", generation: "Old Gen",
    yearStart: 2000, yearEnd: 2011,
    trim: "XLT / FX4 4x4 SuperCab",
    gvwrLbs: 4800, curbWeightLbs: 3560, payloadLbs: 1240,
    wheelbaseIn: 125.7, drivetrain: "4x4", bodyStyle: "Compact Truck",
    notes: "Underrated overlander. Lightweight platform. 4.0L V6 is the performance choice.",
    confidence: "medium",
  },
  {
    id: "ranger-new-tremor",
    make: "Ford", model: "Ranger", generation: "New Gen",
    yearStart: 2019, yearEnd: null,
    trim: "Tremor 4x4 SuperCrew",
    gvwrLbs: 5600, curbWeightLbs: 4185, payloadLbs: 1415,
    wheelbaseIn: 137.7, drivetrain: "4x4", bodyStyle: "Mid-Size Truck",
    notes: "Tremor package adds suspension lift and skid plates. SuperCrew 5' bed.",
    confidence: "high",
  },

  // ─── Bronco ─────────────────────────────────────────────────────────
  {
    id: "bronco-4door-badlands",
    make: "Ford", model: "Bronco", generation: "New Gen",
    yearStart: 2021, yearEnd: null,
    trim: "Badlands / Wildtrak 4x4 4-Door",
    gvwrLbs: 6100, curbWeightLbs: 4880, payloadLbs: 1220,
    wheelbaseIn: 116.1, drivetrain: "4x4", bodyStyle: "Mid-Size SUV",
    notes: "Sasquatch package (37\" tires) adds ~200 lbs and reduces payload. Soft top vs hard top also varies.",
    confidence: "high",
  },
  {
    id: "bronco-2door-badlands",
    make: "Ford", model: "Bronco", generation: "New Gen (2-Door)",
    yearStart: 2021, yearEnd: null,
    trim: "Badlands 4x4 2-Door",
    gvwrLbs: 5500, curbWeightLbs: 4200, payloadLbs: 1300,
    wheelbaseIn: 100.4, drivetrain: "4x4", bodyStyle: "Compact SUV",
    notes: "Lighter than 4-door. Sasquatch payload impact same as 4-door.",
    confidence: "medium",
  },

  // ─── Expedition ──────────────────────────────────────────────────────
  {
    id: "expedition-gen1-4wd",
    make: "Ford", model: "Expedition", generation: "1st Gen",
    yearStart: 2000, yearEnd: 2002,
    trim: "XLT / Eddie Bauer 4WD",
    gvwrLbs: 6800, curbWeightLbs: 5200, payloadLbs: 1600,
    wheelbaseIn: 119.0, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Solid overlanding platform. Roof rack clearance limited without lift.",
    confidence: "medium",
  },
  {
    id: "expedition-gen2-4wd",
    make: "Ford", model: "Expedition", generation: "2nd Gen",
    yearStart: 2003, yearEnd: 2006,
    trim: "XLT / Eddie Bauer 4WD",
    gvwrLbs: 7100, curbWeightLbs: 5500, payloadLbs: 1600,
    wheelbaseIn: 119.0, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    confidence: "medium",
  },
  {
    id: "expedition-gen3-4wd",
    make: "Ford", model: "Expedition", generation: "3rd Gen",
    yearStart: 2007, yearEnd: 2017,
    trim: "XLT / Limited 4WD",
    gvwrLbs: 7100, curbWeightLbs: 5800, payloadLbs: 1300,
    wheelbaseIn: 119.1, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "3rd gen is heaviest Expedition. Well-equipped but payload suffers.",
    confidence: "medium",
  },
  {
    id: "expedition-gen4-timberline",
    make: "Ford", model: "Expedition", generation: "4th Gen",
    yearStart: 2018, yearEnd: null,
    trim: "Timberline 4WD",
    gvwrLbs: 7450, curbWeightLbs: 5785, payloadLbs: 1665,
    wheelbaseIn: 122.5, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Timberline has standard leveling, all-terrain tires, and skid plates.",
    confidence: "high",
  },
  {
    id: "expedition-max-timberline",
    make: "Ford", model: "Expedition Max", generation: "4th Gen",
    yearStart: 2018, yearEnd: null,
    trim: "Timberline 4WD",
    gvwrLbs: 7550, curbWeightLbs: 5910, payloadLbs: 1640,
    wheelbaseIn: 131.6, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Extended wheelbase. 3rd row standard. Best single-vehicle family overlander option.",
    confidence: "high",
  },

  // ══════════════════════════════════════════════════════════════════
  // GMC / CHEVROLET
  // ══════════════════════════════════════════════════════════════════

  // ─── Sierra / Silverado 1500 ──────────────────────────────────────────
  {
    id: "sierra-silverado-gmt800-z71",
    make: "GMC/Chevy", model: "Sierra / Silverado 1500", generation: "GMT800",
    yearStart: 2000, yearEnd: 2006,
    trim: "Z71 4WD Crew Cab",
    gvwrLbs: 6400, curbWeightLbs: 4780, payloadLbs: 1620,
    wheelbaseIn: 143.5, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "Apply to both Sierra and Silverado — identical platforms. 5.3L Vortec common config.",
    confidence: "medium",
  },
  {
    id: "sierra-silverado-gmt900-z71",
    make: "GMC/Chevy", model: "Sierra / Silverado 1500", generation: "GMT900",
    yearStart: 2007, yearEnd: 2013,
    trim: "Z71 4WD Crew Cab",
    gvwrLbs: 7100, curbWeightLbs: 5200, payloadLbs: 1900,
    wheelbaseIn: 143.5, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "New frame significantly increased GVWR and payload. 5.3L and 6.2L options.",
    confidence: "medium",
  },
  {
    id: "sierra-silverado-k2xx-z71",
    make: "GMC/Chevy", model: "Sierra / Silverado 1500", generation: "K2XX",
    yearStart: 2014, yearEnd: 2018,
    trim: "Z71 / All Mountain 4WD Crew Cab",
    gvwrLbs: 7100, curbWeightLbs: 5100, payloadLbs: 2000,
    wheelbaseIn: 143.5, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "High Desert / Sport packages add weight. Payload varies widely by engine config.",
    confidence: "medium",
  },
  {
    id: "sierra-silverado-t1xx-at4-trailboss",
    make: "GMC/Chevy", model: "Sierra / Silverado 1500", generation: "T1XX",
    yearStart: 2019, yearEnd: 2021,
    trim: "AT4 / Trail Boss 4WD Crew Cab",
    gvwrLbs: 7100, curbWeightLbs: 5000, payloadLbs: 2100,
    wheelbaseIn: 147.4, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "AT4 (GMC) / Trail Boss (Chevy) have standard 2\" lift. Payload varies by engine.",
    confidence: "medium",
  },
  {
    id: "sierra-1500-2022-at4",
    make: "GMC", model: "Sierra 1500", generation: "T1XX Refresh",
    yearStart: 2022, yearEnd: null,
    trim: "AT4 4WD Crew Cab 5.8'",
    gvwrLbs: 7100, curbWeightLbs: 5100, payloadLbs: 2000,
    wheelbaseIn: 147.4, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "Multi-Pro tailgate standard on AT4. 5.3L EcoTec3 most common overlanding engine.",
    confidence: "high",
  },
  {
    id: "silverado-1500-2022-trailboss",
    make: "Chevy", model: "Silverado 1500", generation: "T1XX Refresh",
    yearStart: 2022, yearEnd: null,
    trim: "Trail Boss 4WD Crew Cab",
    gvwrLbs: 7100, curbWeightLbs: 5000, payloadLbs: 2100,
    wheelbaseIn: 147.4, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "Trail Boss 2\" factory lift. ZR2 adds more capability but reduces payload slightly.",
    confidence: "high",
  },

  // ─── Colorado / Canyon ───────────────────────────────────────────────
  {
    id: "colorado-canyon-gen1-4wd",
    make: "GMC/Chevy", model: "Canyon / Colorado", generation: "1st Gen",
    yearStart: 2004, yearEnd: 2012,
    trim: "Z71 / SLE 4WD Crew Cab",
    gvwrLbs: 5200, curbWeightLbs: 4000, payloadLbs: 1200,
    wheelbaseIn: 126.0, drivetrain: "4WD", bodyStyle: "Mid-Size Truck",
    notes: "Underrated platform. Limited aftermarket compared to Tacoma of same era.",
    confidence: "medium",
  },
  {
    id: "colorado-canyon-gen2-4wd",
    make: "GMC/Chevy", model: "Canyon / Colorado", generation: "2nd Gen",
    yearStart: 2015, yearEnd: 2022,
    trim: "Z71 / AT4 4WD Crew Cab",
    gvwrLbs: 5900, curbWeightLbs: 4400, payloadLbs: 1500,
    wheelbaseIn: 128.3, drivetrain: "4WD", bodyStyle: "Mid-Size Truck",
    notes: "AT4 (Canyon) and ZR2 add skid plates and suspension. ZR2 payload slightly lower.",
    confidence: "high",
  },
  {
    id: "colorado-canyon-gen3-4wd",
    make: "GMC/Chevy", model: "Canyon AT4 / Colorado Trail Boss", generation: "3rd Gen",
    yearStart: 2023, yearEnd: null,
    trim: "AT4 / Trail Boss 4WD Crew Cab",
    gvwrLbs: 6250, curbWeightLbs: 4650, payloadLbs: 1600,
    wheelbaseIn: 131.7, drivetrain: "4WD", bodyStyle: "Mid-Size Truck",
    notes: "New platform with significantly improved payload. ZR2 further increases capability.",
    confidence: "high",
  },

  // ─── Tahoe / Yukon ───────────────────────────────────────────────────
  {
    id: "tahoe-yukon-gmt800-z71",
    make: "GMC/Chevy", model: "Tahoe / Yukon", generation: "GMT800",
    yearStart: 2000, yearEnd: 2006,
    trim: "Z71 4WD",
    gvwrLbs: 7200, curbWeightLbs: 5300, payloadLbs: 1900,
    wheelbaseIn: 116.0, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Solid payload for the era. Z71 adds off-road suspension tuning.",
    confidence: "medium",
  },
  {
    id: "tahoe-yukon-gmt900-z71",
    make: "GMC/Chevy", model: "Tahoe / Yukon", generation: "GMT900",
    yearStart: 2007, yearEnd: 2014,
    trim: "Z71 4WD",
    gvwrLbs: 7300, curbWeightLbs: 5600, payloadLbs: 1700,
    wheelbaseIn: 116.0, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Heavier than GMT800. Payload reduction vs prior gen.",
    confidence: "medium",
  },
  {
    id: "tahoe-yukon-k2xx-z71",
    make: "GMC/Chevy", model: "Tahoe / Yukon", generation: "K2XX",
    yearStart: 2015, yearEnd: 2020,
    trim: "Z71 4WD",
    gvwrLbs: 7500, curbWeightLbs: 5700, payloadLbs: 1800,
    wheelbaseIn: 116.0, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    confidence: "medium",
  },
  {
    id: "tahoe-z71-t1xx",
    make: "Chevy", model: "Tahoe", generation: "T1XX",
    yearStart: 2021, yearEnd: null,
    trim: "Z71 4WD",
    gvwrLbs: 7900, curbWeightLbs: 6050, payloadLbs: 1850,
    wheelbaseIn: 116.0, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "New independent rear suspension added significant curb weight vs prior gen.",
    confidence: "high",
  },
  {
    id: "yukon-at4-t1xx",
    make: "GMC", model: "Yukon", generation: "T1XX",
    yearStart: 2021, yearEnd: null,
    trim: "AT4 4WD",
    gvwrLbs: 7900, curbWeightLbs: 5900, payloadLbs: 2000,
    wheelbaseIn: 116.0, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "AT4 has air ride adaptive suspension. Slightly higher payload than Tahoe Z71.",
    confidence: "high",
  },

  // ─── Suburban ────────────────────────────────────────────────────────
  {
    id: "suburban-z71-t1xx",
    make: "Chevy", model: "Suburban", generation: "T1XX",
    yearStart: 2021, yearEnd: null,
    trim: "Z71 4WD",
    gvwrLbs: 8600, curbWeightLbs: 6100, payloadLbs: 2500,
    wheelbaseIn: 134.1, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Best payload in its class. Longest wheelbase = best load distribution.",
    confidence: "high",
  },

  // ══════════════════════════════════════════════════════════════════
  // RAM
  // ══════════════════════════════════════════════════════════════════

  // ─── Ram 1500 ────────────────────────────────────────────────────────
  {
    id: "ram-1500-gen3-4x4",
    make: "Ram", model: "1500", generation: "3rd Gen (Dodge Ram)",
    yearStart: 2002, yearEnd: 2008,
    trim: "Laramie 4x4 Quad Cab",
    gvwrLbs: 6900, curbWeightLbs: 5000, payloadLbs: 1900,
    wheelbaseIn: 140.5, drivetrain: "4x4", bodyStyle: "Full-Size Truck",
    notes: "Last of the Dodge-branded trucks. 5.7L HEMI most common. Strong payload for era.",
    confidence: "medium",
  },
  {
    id: "ram-1500-gen4-4x4",
    make: "Ram", model: "1500", generation: "4th Gen",
    yearStart: 2009, yearEnd: 2018,
    trim: "Sport / Outdoorsman 4x4 Crew Cab",
    gvwrLbs: 7100, curbWeightLbs: 5300, payloadLbs: 1800,
    wheelbaseIn: 140.5, drivetrain: "4x4", bodyStyle: "Full-Size Truck",
    notes: "Coil rear suspension improves ride but adds some weight. EcoDiesel option available.",
    confidence: "medium",
  },
  {
    id: "ram-1500-rebel",
    make: "Ram", model: "1500", generation: "5th Gen",
    yearStart: 2019, yearEnd: null,
    trim: "Rebel 4x4 Crew Cab",
    gvwrLbs: 7100, curbWeightLbs: 5500, payloadLbs: 1600,
    wheelbaseIn: 144.5, drivetrain: "4x4", bodyStyle: "Full-Size Truck",
    notes: "Rebel has Fox shocks and skid plates standard. TRX adds supercharged V8 but payload drops to ~1,310 lbs.",
    confidence: "high",
  },
  {
    id: "ram-1500-trx",
    make: "Ram", model: "1500 TRX", generation: "5th Gen",
    yearStart: 2021, yearEnd: 2024,
    trim: "TRX 4x4 Crew Cab",
    gvwrLbs: 7100, curbWeightLbs: 5850, payloadLbs: 1310,
    wheelbaseIn: 144.5, drivetrain: "4x4", bodyStyle: "Full-Size Truck",
    notes: "Supercharged 6.2L HEMI. Heaviest half-ton ever. Performance truck, payload is a tradeoff.",
    confidence: "high",
  },

  // ══════════════════════════════════════════════════════════════════
  // JEEP
  // ══════════════════════════════════════════════════════════════════

  // ─── Wrangler TJ ─────────────────────────────────────────────────────
  {
    id: "wrangler-tj-4wd",
    make: "Jeep", model: "Wrangler", generation: "TJ",
    yearStart: 2000, yearEnd: 2006,
    trim: "Rubicon / Sport 4WD",
    gvwrLbs: 4500, curbWeightLbs: 3750, payloadLbs: 750,
    wheelbaseIn: 93.4, drivetrain: "4WD", bodyStyle: "Compact SUV (2-door)",
    notes: "2-door only. Rubicon heavier than Sport. Very limited payload — factor this in hard.",
    confidence: "medium",
  },
  {
    id: "wrangler-tj-unlimited",
    make: "Jeep", model: "Wrangler Unlimited", generation: "TJ Unlimited (LJ)",
    yearStart: 2004, yearEnd: 2006,
    trim: "Rubicon 4WD",
    gvwrLbs: 4800, curbWeightLbs: 3900, payloadLbs: 900,
    wheelbaseIn: 103.4, drivetrain: "4WD", bodyStyle: "Compact SUV",
    notes: "Extended wheelbase TJ. Better rear cargo space than standard TJ.",
    confidence: "medium",
  },

  // ─── Wrangler JK ──────────────────────────────────────────────────────
  {
    id: "wrangler-jk-2door-rubicon",
    make: "Jeep", model: "Wrangler JK", generation: "JK (2-Door)",
    yearStart: 2007, yearEnd: 2018,
    trim: "Rubicon 4WD",
    gvwrLbs: 5050, curbWeightLbs: 4080, payloadLbs: 970,
    wheelbaseIn: 95.4, drivetrain: "4WD", bodyStyle: "Compact SUV (2-door)",
    notes: "Rubicon Dana 44 axles, heavier than Sport. Payload notoriously low.",
    confidence: "high",
  },
  {
    id: "wrangler-jk-unlimited-rubicon",
    make: "Jeep", model: "Wrangler JK Unlimited", generation: "JK (4-Door)",
    yearStart: 2007, yearEnd: 2018,
    trim: "Rubicon 4WD",
    gvwrLbs: 5250, curbWeightLbs: 4340, payloadLbs: 910,
    wheelbaseIn: 116.0, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "Longer body barely offsets the weight gain vs 2-door. Payload remains very constrained.",
    confidence: "high",
  },

  // ─── Wrangler JL ──────────────────────────────────────────────────────
  {
    id: "wrangler-jl-2door-rubicon",
    make: "Jeep", model: "Wrangler JL", generation: "JL (2-Door)",
    yearStart: 2018, yearEnd: null,
    trim: "Rubicon 4WD",
    gvwrLbs: 5100, curbWeightLbs: 4098, payloadLbs: 1002,
    wheelbaseIn: 96.8, drivetrain: "4WD", bodyStyle: "Compact SUV (2-door)",
    notes: "Slight improvement over JK. 4xe (plug-in hybrid) adds 600+ lbs, payload ~800 lbs.",
    confidence: "high",
  },
  {
    id: "wrangler-jl-unlimited-rubicon",
    make: "Jeep", model: "Wrangler JL Unlimited", generation: "JL (4-Door)",
    yearStart: 2018, yearEnd: null,
    trim: "Rubicon 4WD",
    gvwrLbs: 5100, curbWeightLbs: 4278, payloadLbs: 822,
    wheelbaseIn: 118.4, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "Same GVWR as 2-door but heavier = less payload. 4xe: ~650 lbs payload. Plan builds carefully.",
    confidence: "high",
  },

  // ─── Gladiator ────────────────────────────────────────────────────────
  {
    id: "gladiator-rubicon",
    make: "Jeep", model: "Gladiator", generation: "JT",
    yearStart: 2020, yearEnd: null,
    trim: "Rubicon 4WD",
    gvwrLbs: 6250, curbWeightLbs: 5070, payloadLbs: 1180,
    wheelbaseIn: 137.3, drivetrain: "4WD", bodyStyle: "Mid-Size Truck",
    notes: "Mojave (desert-focused) has similar payload. Sport payload is higher (~1,650 lbs).",
    confidence: "high",
  },

  // ─── Grand Cherokee ───────────────────────────────────────────────────
  {
    id: "grand-cherokee-wj-4wd",
    make: "Jeep", model: "Grand Cherokee", generation: "WJ",
    yearStart: 2000, yearEnd: 2004,
    trim: "Laredo / Limited 4WD",
    gvwrLbs: 5500, curbWeightLbs: 3950, payloadLbs: 1550,
    wheelbaseIn: 105.9, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "WJ Quad-Trac II or Selec-Trac. Good payload for a mid-size SUV of this era.",
    confidence: "medium",
  },
  {
    id: "grand-cherokee-wk-4wd",
    make: "Jeep", model: "Grand Cherokee", generation: "WK",
    yearStart: 2005, yearEnd: 2010,
    trim: "Laredo / Limited 4WD",
    gvwrLbs: 5850, curbWeightLbs: 4350, payloadLbs: 1500,
    wheelbaseIn: 109.5, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    confidence: "medium",
  },
  {
    id: "grand-cherokee-wk2-trailhawk",
    make: "Jeep", model: "Grand Cherokee", generation: "WK2",
    yearStart: 2011, yearEnd: 2021,
    trim: "Trailhawk 4WD",
    gvwrLbs: 6050, curbWeightLbs: 4950, payloadLbs: 1100,
    wheelbaseIn: 114.8, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "Trailhawk has skid plates and lifted suspension. Heavier than Laredo by ~200 lbs.",
    confidence: "medium",
  },
  {
    id: "grand-cherokee-wl-4xe",
    make: "Jeep", model: "Grand Cherokee L / 4xe", generation: "WL",
    yearStart: 2022, yearEnd: null,
    trim: "Trailhawk 4WD",
    gvwrLbs: 6350, curbWeightLbs: 5050, payloadLbs: 1300,
    wheelbaseIn: 121.3, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "3-row L model available. 4xe plug-in hybrid adds battery weight, similar payload.",
    confidence: "medium",
  },

  // ══════════════════════════════════════════════════════════════════
  // NISSAN
  // ══════════════════════════════════════════════════════════════════

  // ─── Titan ──────────────────────────────────────────────────────────
  {
    id: "titan-gen1-pro4x",
    make: "Nissan", model: "Titan", generation: "1st Gen",
    yearStart: 2004, yearEnd: 2015,
    trim: "Pro-4X 4WD Crew Cab",
    gvwrLbs: 6800, curbWeightLbs: 5200, payloadLbs: 1600,
    wheelbaseIn: 139.8, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "5.6L Endurance V8. Good payload but limited aftermarket support.",
    confidence: "medium",
  },
  {
    id: "titan-gen2-pro4x",
    make: "Nissan", model: "Titan", generation: "2nd Gen",
    yearStart: 2016, yearEnd: null,
    trim: "Pro-4X 4WD Crew Cab",
    gvwrLbs: 6800, curbWeightLbs: 5400, payloadLbs: 1400,
    wheelbaseIn: 151.6, drivetrain: "4WD", bodyStyle: "Full-Size Truck",
    notes: "Pro-4X adds skid plates and Bilstein shocks. Longer than Gen 1.",
    confidence: "high",
  },

  // ─── Frontier ────────────────────────────────────────────────────────
  {
    id: "frontier-gen2-pro4x",
    make: "Nissan", model: "Frontier", generation: "2nd Gen",
    yearStart: 2005, yearEnd: 2021,
    trim: "Pro-4X 4WD Crew Cab",
    gvwrLbs: 5050, curbWeightLbs: 4100, payloadLbs: 950,
    wheelbaseIn: 125.9, drivetrain: "4WD", bodyStyle: "Mid-Size Truck",
    notes: "Long production run. Limited payload but proven reliability. V6 only by final years.",
    confidence: "medium",
  },
  {
    id: "frontier-gen3-pro4x",
    make: "Nissan", model: "Frontier", generation: "3rd Gen",
    yearStart: 2022, yearEnd: null,
    trim: "Pro-4X 4WD Crew Cab",
    gvwrLbs: 5550, curbWeightLbs: 4420, payloadLbs: 1130,
    wheelbaseIn: 125.9, drivetrain: "4WD", bodyStyle: "Mid-Size Truck",
    notes: "New platform with improved payload over Gen 2. Still mid-range vs Tacoma.",
    confidence: "high",
  },

  // ─── Armada ──────────────────────────────────────────────────────────
  {
    id: "armada-gen1-4wd",
    make: "Nissan", model: "Armada", generation: "1st Gen",
    yearStart: 2004, yearEnd: 2015,
    trim: "SE / LE 4WD",
    gvwrLbs: 7300, curbWeightLbs: 5700, payloadLbs: 1600,
    wheelbaseIn: 123.6, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "Titan-based platform. Less common overlander but capable.",
    confidence: "medium",
  },
  {
    id: "armada-gen2-pro4x",
    make: "Nissan", model: "Armada", generation: "2nd Gen",
    yearStart: 2017, yearEnd: null,
    trim: "Pro-4X 4WD",
    gvwrLbs: 7800, curbWeightLbs: 6100, payloadLbs: 1700,
    wheelbaseIn: 121.1, drivetrain: "4WD", bodyStyle: "Full-Size SUV",
    notes: "New patrol-based platform. Pro-4X adds skid plates and off-road tuning.",
    confidence: "medium",
  },

  // ══════════════════════════════════════════════════════════════════
  // LAND ROVER
  // ══════════════════════════════════════════════════════════════════

  {
    id: "defender-90-l663",
    make: "Land Rover", model: "Defender 90", generation: "L663",
    yearStart: 2020, yearEnd: null,
    trim: "X-Dynamic SE / First Edition 4WD",
    gvwrLbs: 6400, curbWeightLbs: 4700, payloadLbs: 1700,
    wheelbaseIn: 101.9, drivetrain: "4WD", bodyStyle: "Compact SUV",
    notes: "Surprisingly strong payload. Early models had reliability concerns — research specific year.",
    confidence: "medium",
  },
  {
    id: "defender-110-l663",
    make: "Land Rover", model: "Defender 110", generation: "L663",
    yearStart: 2020, yearEnd: null,
    trim: "X-Dynamic SE / First Edition 4WD",
    gvwrLbs: 6900, curbWeightLbs: 4815, payloadLbs: 2085,
    wheelbaseIn: 119.0, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "Best payload in the Defender lineup. 130 (extended) also available with more seating.",
    confidence: "medium",
  },

  // ─── Discovery / LR3 / LR4 ───────────────────────────────────────────
  {
    id: "lr3-discovery3",
    make: "Land Rover", model: "LR3 / Discovery 3", generation: "L319",
    yearStart: 2004, yearEnd: 2009,
    trim: "SE / HSE 4WD",
    gvwrLbs: 6350, curbWeightLbs: 5200, payloadLbs: 1150,
    wheelbaseIn: 113.8, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "Air suspension. Complex but capable. Common overlanding platform internationally.",
    confidence: "medium",
  },
  {
    id: "lr4-discovery4",
    make: "Land Rover", model: "LR4 / Discovery 4", generation: "L319 Refresh",
    yearStart: 2010, yearEnd: 2016,
    trim: "HSE / HSE Luxury 4WD",
    gvwrLbs: 6600, curbWeightLbs: 5550, payloadLbs: 1050,
    wheelbaseIn: 113.8, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "Heavier than LR3. Terrain Response system. Plan mods carefully given payload limit.",
    confidence: "medium",
  },

  // ══════════════════════════════════════════════════════════════════
  // LEXUS
  // ══════════════════════════════════════════════════════════════════

  {
    id: "gx470",
    make: "Lexus", model: "GX 470", generation: "J120",
    yearStart: 2003, yearEnd: 2009,
    trim: "4WD",
    gvwrLbs: 6150, curbWeightLbs: 4860, payloadLbs: 1290,
    wheelbaseIn: 107.5, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "4Runner-based platform with V8. Strong reliability. Lower payload than 4Runner of same era.",
    confidence: "medium",
  },
  {
    id: "gx460-gen2",
    make: "Lexus", model: "GX 460", generation: "J150",
    yearStart: 2010, yearEnd: 2023,
    trim: "4WD",
    gvwrLbs: 6500, curbWeightLbs: 4960, payloadLbs: 1540,
    wheelbaseIn: 109.8, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "4Runner-based (5th gen). Better payload than GX 470. Shares aftermarket with 5th gen 4Runner.",
    confidence: "medium",
  },
  {
    id: "gx550",
    make: "Lexus", model: "GX 550", generation: "J250",
    yearStart: 2024, yearEnd: null,
    trim: "Overtrail 4WD",
    gvwrLbs: 6900, curbWeightLbs: 5400, payloadLbs: 1500,
    wheelbaseIn: 112.2, drivetrain: "4WD", bodyStyle: "Mid-Size SUV",
    notes: "New Land Cruiser-based platform. Overtrail package has locking rear differential.",
    confidence: "low",
  },
];

// ─── Helper functions ─────────────────────────────────────────────────

export function getAllLBVehicles(): LBVehicle[] {
  return lbVehicleDatabase;
}

export function getLBVehicleById(id: string): LBVehicle | undefined {
  return lbVehicleDatabase.find((v) => v.id === id);
}

export function getLBVehiclesByMake(make: string): LBVehicle[] {
  return lbVehicleDatabase.filter((v) =>
    v.make.toLowerCase().includes(make.toLowerCase())
  );
}

export function getLBVehiclesByYearRange(min: number, max: number): LBVehicle[] {
  return lbVehicleDatabase.filter(
    (v) => v.yearStart <= max && (v.yearEnd === null || v.yearEnd >= min)
  );
}

export function searchLBVehicles(query: string): LBVehicle[] {
  const q = query.toLowerCase();
  return lbVehicleDatabase.filter(
    (v) =>
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.generation.toLowerCase().includes(q) ||
      v.trim.toLowerCase().includes(q)
  );
}

export function getUniqueMakes(): string[] {
  const makes = lbVehicleDatabase.map((v) => v.make);
  return [...new Set(makes)].sort();
}
