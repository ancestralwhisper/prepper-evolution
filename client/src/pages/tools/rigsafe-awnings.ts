// ─── RigSafe Awning Database ────────────────────────────────────────
// Real manufacturer specs for vehicle-mounted awnings.
//
// Sources:
//   Weight, coverage, type: Manufacturer spec sheets & product pages
//   Mounted bracket weight: Manufacturer data or ~10-15 lbs estimate
//   (most weight transfers to ground poles when deployed)

export interface AwningEntry {
  id: string;
  brand: string;
  model: string;
  type: "270" | "180" | "360" | "batwing";
  mountSide: "driver" | "passenger" | "either";  // which side the awning mounts / deploys from
  totalWeightLbs: number;
  mountedBracketWeightLbs: number;  // weight on rack when deployed
  deployedCoverageSqFt: number;
  hasWallKit: boolean;
  wallKitWeightLbs?: number;
  wallKitCreatesSleeping: boolean;
  wallKitSleeps?: number;
  affiliateUrl: string;
  notes?: string;
}

export const awningDatabase: AwningEntry[] = [
  // ─── OVS (Overland Vehicle Systems) ─────────────────────────────────

  {
    id: "ovs-nomadic-270-hd",
    brand: "OVS",
    model: "HD Nomadic 270",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 70,
    mountedBracketWeightLbs: 15,
    deployedCoverageSqFt: 129,
    hasWallKit: true,
    wallKitWeightLbs: 22,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B09M3S1VK6?tag=prepperevo-20",
    notes: "280g polycotton ripstop. 129 sq ft freestanding shelter. Driver and passenger side SKUs. Annex room enclosure available separately (20 lbs). $849.",
  },
  {
    id: "ovs-nomadic-270-lt",
    brand: "OVS",
    model: "HD Nomadic 270 LT",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 62,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 80,
    hasWallKit: true,
    wallKitWeightLbs: 24,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B09M3RQZJP?tag=prepperevo-20",
    notes: "280g polycotton ripstop. 80 sq ft coverage. No poles required for setup. Driver and passenger side SKUs. Wall kit 24 lbs sold separately. $549–$649.",
  },
  {
    id: "ovs-nomadic-270-lte",
    brand: "OVS",
    model: "HD Nomadic 270 LTE",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 31,
    mountedBracketWeightLbs: 8,
    deployedCoverageSqFt: 65,
    hasWallKit: true,
    wallKitWeightLbs: 21,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=OVS+HD+Nomadic+270+LTE+awning&tag=prepperevo-20",
    notes: "Lightest HD 270 at 31 lbs. 280g polycotton ripstop. Reinforced oversize hinge, heat-sealed seams. No poles required. Driver and passenger side SKUs. Wall kit sold separately (21 lbs). Coverage sq ft not published. $399–$499.",
  },
  {
    id: "ovs-nomadic-xd-270",
    brand: "OVS",
    model: "XD Nomadic 270",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 70,
    mountedBracketWeightLbs: 15,
    deployedCoverageSqFt: 125,
    hasWallKit: true,
    wallKitWeightLbs: 12,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/s?k=OVS+XD+Nomadic+270+awning&tag=prepperevo-20",
    notes: "Premium 270 line. Heavier 320g polycotton ripstop vs 280g on HD. Integrated lighting and blackout system built in. 125+ sq ft coverage. Available in Black/Grey Trim ($999) and Grey Hex ($1,049). XD wall kit 12 lbs. Annex room enclosure available separately (25 lbs).",
  },
  {
    id: "ovs-nomadic-xd-270-lt",
    brand: "OVS",
    model: "XD Nomadic 270 LT",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 31,
    mountedBracketWeightLbs: 8,
    deployedCoverageSqFt: 80,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=OVS+XD+Nomadic+270+LT+awning&tag=prepperevo-20",
    notes: "320g XD fabric in a lightweight 31 lb package. Premium weave without the full XD 270's integrated lighting or maximum coverage. Coverage sq ft not published. $739.",
  },
  {
    id: "ovs-nomadic-xd-270-lte",
    brand: "OVS",
    model: "XD Nomadic 270 LTE",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 31,
    mountedBracketWeightLbs: 8,
    deployedCoverageSqFt: 65,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=OVS+XD+Nomadic+270+LTE+awning&tag=prepperevo-20",
    notes: "Entry-level XD 270 at 31 lbs. 320g polycotton ripstop. Most affordable way into the XD fabric line. Coverage sq ft not published. $474–$599.",
  },
  {
    id: "ovs-nomadic-180",
    brand: "OVS",
    model: "Nomadic 180",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 55,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 88,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B09KXYJ1Y5?tag=prepperevo-20",
    notes: "Side-mount 180-degree awning. Lighter and simpler than 270.",
  },

  // ─── 23ZERO ─────────────────────────────────────────────────────────

  {
    id: "23zero-peregrine-270",
    brand: "23Zero",
    model: "Peregrine 270",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 68,
    mountedBracketWeightLbs: 14,
    deployedCoverageSqFt: 120,
    hasWallKit: true,
    wallKitWeightLbs: 20,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B0CG3NXL8R?tag=prepperevo-20",
    notes: "Australian brand. Premium 270 with quick-deploy design.",
  },
  {
    id: "23zero-peregrine-180",
    brand: "23Zero",
    model: "Peregrine 180",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 32,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 50,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B0CG3QDGX1?tag=prepperevo-20",
    notes: "Compact 180 from 23Zero. Quick setup.",
  },

  // ─── ARB ────────────────────────────────────────────────────────────

  {
    id: "arb-2500-touring",
    brand: "ARB",
    model: "2500 Touring Awning",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 28,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 48,
    hasWallKit: true,
    wallKitWeightLbs: 12,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B002SRZJF4?tag=prepperevo-20",
    notes: "Industry standard 180 awning. Compact and reliable. Tons of accessories.",
  },

  // ─── IRONMAN ────────────────────────────────────────────────────────

  {
    id: "ironman-270-instant",
    brand: "Ironman",
    model: "270 Instant Awning",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 62,
    mountedBracketWeightLbs: 13,
    deployedCoverageSqFt: 110,
    hasWallKit: true,
    wallKitWeightLbs: 18,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B09H3RNV7Y?tag=prepperevo-20",
    notes: "Rapid-deploy 270. Spring-loaded arms. Sub-60-second setup.",
  },

  // ─── RHINO RACK ─────────────────────────────────────────────────────

  {
    id: "rhinorack-batwing",
    brand: "Rhino Rack",
    model: "Batwing Awning",
    type: "batwing",
    mountSide: "either",
    totalWeightLbs: 58,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 118,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B004G9DVVY?tag=prepperevo-20",
    notes: "270 style but 2-piece 'batwing' design. Mounts centrally on roof rack. Very popular.",
  },

  // ─── FRONT RUNNER ───────────────────────────────────────────────────

  {
    id: "frontrunner-easyout-14m",
    brand: "Front Runner",
    model: "Easy-Out Awning 1.4M",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 21,
    mountedBracketWeightLbs: 8,
    deployedCoverageSqFt: 30,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=Front+Runner+Easy-Out+Awning+1.4M&tag=prepperevo-20",
    notes: "SKU AWNI099. 4.6 ft wide × 6.9 ft projection. 400D ripstop polyester, UVP50+, PU1500mm. Fits any T-slot rack. Side/front wind break panels sold separately. $329–$379.",
  },
  {
    id: "frontrunner-easyout-2m",
    brand: "Front Runner",
    model: "Easy-Out Awning 2M",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 30,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 44,
    hasWallKit: true,
    wallKitWeightLbs: 0,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/s?k=Front+Runner+Easy-Out+Awning+2M&tag=prepperevo-20",
    notes: "SKU AWNI100. 78.7\" wide × 82.7\" projection. 400D ripstop polyester, UVP50+, PU1500mm. 2M Awning Enclosure sold separately ($319). Mosquito net ($119) also available. $379.",
  },
  {
    id: "frontrunner-easyout-25m",
    brand: "Front Runner",
    model: "Easy-Out Awning 2.5M",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 33,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 56,
    hasWallKit: true,
    wallKitWeightLbs: 20,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B00UVG5JKC?tag=prepperevo-20",
    notes: "SKU AWNI101. 98.4\" wide × 82.7\" projection. 400D ripstop polyester, UVP50+, PU1500mm. Largest Easy-Out. 2.5M Awning Enclosure (TENT037) sold separately — 20 lbs, $369. Mosquito net $159. $389.",
  },

  // ─── DARCHE ─────────────────────────────────────────────────────────

  {
    id: "darche-eclipse-270",
    brand: "Darche",
    model: "Eclipse 270",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 65,
    mountedBracketWeightLbs: 14,
    deployedCoverageSqFt: 115,
    hasWallKit: true,
    wallKitWeightLbs: 20,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/dp/B0B5BYH3KD?tag=prepperevo-20",
    notes: "Australian-designed. Heavy-duty canvas. Excellent wind resistance.",
  },

  // ─── TUFF STUFF ─────────────────────────────────────────────────────

  {
    id: "tuffstuff-270",
    brand: "Tuff Stuff",
    model: "270 Awning",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 58,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 105,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B0BTMXJR1K?tag=prepperevo-20",
    notes: "Budget 270 option. Good coverage for the price.",
  },

  // ─── CLEVERSHADE ────────────────────────────────────────────────────

  {
    id: "clevershade-270",
    brand: "Clevershade",
    model: "270",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 45,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 95,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B09VBHZ98Y?tag=prepperevo-20",
    notes: "Unique hinge design. Lightweight. Quick deploy. Australian brand.",
  },

  // ─── SMITTYBILT ─────────────────────────────────────────────────────

  {
    id: "smittybilt-270-driver",
    brand: "Smittybilt",
    model: "Overlander 270 Driver",
    type: "270",
    mountSide: "driver",
    totalWeightLbs: 51,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 120,
    hasWallKit: true,
    wallKitWeightLbs: 0,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/s?k=Smittybilt+2795+270+awning&tag=prepperevo-20",
    notes: "SKU 2795. 600D Oxford polyester, 1000D PVC travel cover. 5 adjustable aluminum telescopic poles. Driver side only. Wall kit #2895 sold separately ($445.99; wall kit weight unconfirmed). $689.99.",
  },
  {
    id: "smittybilt-270-qd-passenger",
    brand: "Smittybilt",
    model: "Quick Deploy 270 Passenger",
    type: "270",
    mountSide: "passenger",
    totalWeightLbs: 80,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 80,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=Smittybilt+2796+270+awning&tag=prepperevo-20",
    notes: "SKU 2796. Quick-deploy design, 2 extra support tubes. Ripstop polyester, 1000D PVC cover (Tactical Grey). Passenger side only. Smaller coverage than the driver-side 2795 (80 vs 120 sq ft). $618.99.",
  },
  {
    id: "smittybilt-180",
    brand: "Smittybilt",
    model: "Overlander 180",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 80,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 85,
    hasWallKit: true,
    wallKitWeightLbs: 0,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=Smittybilt+2794+180+awning&tag=prepperevo-20",
    notes: "SKU 2794. 600D Oxford polyester, 1000D PVC cover. 85+ sq ft coverage. Wall kit #2894 sold separately. $599.99.",
  },

  // ─── ARB ─────────────────────────────────────────────────────────────
  // (No ARB 270/batwing exists as of 2026 — lineup is 180-degree only)

  {
    id: "arb-soft-2m",
    brand: "ARB",
    model: "Soft Case Awning 2.0M",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 35,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 54,
    hasWallKit: true,
    wallKitWeightLbs: 15,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=ARB+soft+case+awning+2.0M&tag=prepperevo-20",
    notes: "SKU 814409. 300gsm poly-cotton ripstop canvas, PU1000mm, UVP50+. Includes 1200-lumen LED strip (amber + cool white). Wind break side panel (7 lbs) and front panel (8 lbs) sold separately — no full enclosure room. $299–$402.",
  },
  {
    id: "arb-soft-25m",
    brand: "ARB",
    model: "Soft Case Awning 2.5M",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 44,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 68,
    hasWallKit: true,
    wallKitWeightLbs: 15,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=ARB+soft+case+awning+2.5M&tag=prepperevo-20",
    notes: "SKU 814410. Largest soft case ARB at 8.2 ft wide. 300gsm poly-cotton ripstop, PU1000mm, UVP50+. Includes 1200-lumen LED strip. Wind breaks only — no full enclosure room available. $249–$436.",
  },
  {
    id: "arb-hard-25m",
    brand: "ARB",
    model: "Hard Case Awning 2.5M",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 43,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 68,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=ARB+hard+case+awning+2.5M&tag=prepperevo-20",
    notes: "SKU 814412A. Gloss black powder-coated aluminum extrusion housing. 300gsm canvas, welded + heat-taped seams, PU1000mm, UV-treated. Includes 1200-lumen LED strip (IP58 dimmer). No full enclosure option — wind breaks only. Premium pick for hard case protection. $686.",
  },

  // ─── ROUGH COUNTRY ──────────────────────────────────────────────────

  {
    id: "rough-country-270",
    brand: "Rough Country",
    model: "270 Degree Awning",
    type: "270",
    mountSide: "driver",
    totalWeightLbs: 52,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 70,
    hasWallKit: true,
    wallKitWeightLbs: 39,
    wallKitCreatesSleeping: true,
    wallKitSleeps: 2,
    affiliateUrl: "https://www.amazon.com/s?k=Rough+Country+270+awning&tag=prepperevo-20",
    notes: "SKU 99047. Budget 270 at $459–$499. 600D ripstop canvas, PU2000mm, UVP50+. Black powder-coated aluminum frame. Driver side only. Wall kit (#99048) is heavy at 39 lbs but fully enclosed — 420D Oxford, 4 roll-up windows w/ mosquito screens, interior vehicle-access door, 3 telescopic poles. $359.95 for wall kit.",
  },

  // ─── THULE / TEPUI ──────────────────────────────────────────────────

  {
    id: "thule-overcast-45ft",
    brand: "Thule",
    model: "OverCast Awning 4.5ft",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 22,
    mountedBracketWeightLbs: 8,
    deployedCoverageSqFt: 29,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=Thule+OverCast+Awning+4.5ft&tag=prepperevo-20",
    notes: "Part 901084. Manual roller system. 4 height-adjustable aluminum poles + guide wires. T-track or around-the-bar rack mount. RTT-companion design — lightest full awning in the lineup. $299–$449.",
  },
  {
    id: "thule-overcast-65ft",
    brand: "Thule",
    model: "OverCast Awning 6.5ft",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 28,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 42,
    hasWallKit: true,
    wallKitWeightLbs: 0,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=Thule+OverCast+Awning+6.5ft&tag=prepperevo-20",
    notes: "Part 901086. Manual roller system. Locking hoods. Mosquito net walls (TH8002X1001) clip to awning frame — available for 6ft size only, not the 4.5ft. T-track or around-the-bar mount. $469.95.",
  },

  // ─── BUDGET / AMAZON BRANDS ─────────────────────────────────────────
  // Weights and exact dims vary by SKU/size — use notes for guidance.
  // These are not precision-specced; verify before purchase.

  {
    id: "vevor-270",
    brand: "VEVOR",
    model: "270 Degree Awning w/ LED",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 55,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 117,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=VEVOR+270+degree+awning+LED&tag=prepperevo-20",
    notes: "Budget 270 with integrated LED lighting. 117 sq ft coverage. Driver or passenger side options. Waterproof, UV50+, all-weather. Frequently cited as a cheap OVS/Rhino alternative. ~$300–$450.",
  },
  {
    id: "joytutus-270",
    brand: "JOYTUTUS",
    model: "270 Degree Awning",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 0,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 0,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=JOYTUTUS+270+degree+awning&tag=prepperevo-20",
    notes: "Budget 270. JOYTUTUS does not make a 180 — 270 only. Waterproof/UV-proof polyester, adjustable hardware, quick setup. WEIGHT AND COVERAGE UNCONFIRMED. ~$200–$350.",
  },
  {
    id: "sanhima-180",
    brand: "San Hima",
    model: "Vehicle Awning",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 11,
    mountedBracketWeightLbs: 6,
    deployedCoverageSqFt: 30,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=San+Hima+vehicle+awning&tag=prepperevo-20",
    notes: "Budget 180. Notable for very low weight at ~11 lbs — lightest budget option. 4.6'×6.6' and larger sizes. Slim profile, UPF50+, weatherproof. Great for minimal roof load. ~$150–$250.",
  },
  {
    id: "timber-ridge-180",
    brand: "Timber Ridge",
    model: "19ft x 9.8ft Retractable Awning",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 0,
    mountedBracketWeightLbs: 0,
    deployedCoverageSqFt: 186,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B0DSBJMGFF?tag=prepperevo-20",
    notes: "ASIN B0DSBJMGFF. NOT rack-mounted — quick setup off the side of the vehicle, ground-supported. 186 sq ft shade. Blackout coating, UPF50+. Open dims: 160\"W × 70\"D × 70\"H. Good for base camp / family setups. WEIGHT UNCONFIRMED. ~$200–$400.",
  },
  {
    id: "jcsryd-180-sector",
    brand: "JCSRYD",
    model: "180 Sector Awning",
    type: "180",
    mountSide: "either",
    totalWeightLbs: 57,
    mountedBracketWeightLbs: 10,
    deployedCoverageSqFt: 129,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/s?k=JCSRYD+180+sector+awning&tag=prepperevo-20",
    notes: "Budget 180 sector style. 6.6 ft pull-out, 129 sq ft coverage. Ripstop, reinforced hinges and poles. Fans out in a semi-circle for better coverage than flat-arm awnings. ~$200–$350.",
  },
  {
    id: "bunker-indust-270",
    brand: "Bunker Indust",
    model: "270 Degree Awning w/ LED",
    type: "270",
    mountSide: "either",
    totalWeightLbs: 62,
    mountedBracketWeightLbs: 12,
    deployedCoverageSqFt: 0,
    hasWallKit: false,
    wallKitCreatesSleeping: false,
    affiliateUrl: "https://www.amazon.com/dp/B0F43MP8YV?tag=prepperevo-20",
    notes: "ASIN B0F43MP8YV. Mid-budget 270 with multi-color LED lighting. Stainless knuckle joints, waterproof/wind-resistant. Closest to mid-range quality in the budget 270 space. COVERAGE UNCONFIRMED. ~$500–$650.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

export function getAwningBrands(): string[] {
  return [...new Set(awningDatabase.map((a) => a.brand))].sort();
}

export function getAwningModels(brand: string): AwningEntry[] {
  return awningDatabase.filter((a) => a.brand === brand).sort((a, b) => a.model.localeCompare(b.model));
}

export function findAwning(id: string): AwningEntry | undefined {
  return awningDatabase.find((a) => a.id === id);
}
