// ─── Failure Mode Diagnostic Tree — Knowledge Base ───────────────────────────
import type { FailureNode, CategoryMeta, FailureCategory } from "./failure-mode-types";

export const categoryMeta: CategoryMeta[] = [
  { id: "water",    label: "Water",    icon: "Droplets",   color: "blue",   description: "Filters, pumps, purifiers, gravity bags" },
  { id: "fire",     label: "Fire / Food", icon: "Flame",  color: "orange", description: "Stoves, lighters, generators, fuel" },
  { id: "power",    label: "Power",    icon: "Zap",        color: "yellow", description: "Solar, batteries, inverters, chargers" },
  { id: "recovery", label: "Recovery", icon: "Truck",      color: "red",    description: "Winch, jack, tires, air compressors" },
  { id: "shelter",  label: "Shelter",  icon: "Tent",       color: "green",  description: "Tents, sleeping systems, tarps" },
];

// Go-bag gear IDs that filter which nodes appear
export const gearToNodes: Record<string, string[]> = {
  sawyer_sqz:      ["water-hollow-fiber-zero-flow", "water-hollow-fiber-slow-flow"],
  sawyer_mini:     ["water-hollow-fiber-zero-flow", "water-hollow-fiber-slow-flow"],
  grayl_geo:       ["water-hollow-fiber-zero-flow", "water-grayl-plunger"],
  katadyn_befree:  ["water-hollow-fiber-zero-flow", "water-hollow-fiber-slow-flow"],
  msr_miniworks:   ["water-pump-no-prime", "water-pump-slow"],
  platypus_grav:   ["water-gravity-bag-leak"],
  msr_autoflow:    ["water-gravity-bag-leak", "water-hollow-fiber-slow-flow"],
  msr_pocket:      ["fire-liquid-fuel-yellow-flame", "fire-liquid-fuel-pump-mushy"],
  whisperlite:     ["fire-liquid-fuel-yellow-flame", "fire-liquid-fuel-pump-mushy"],
  jetboil_flash:   ["fire-gas-igniter", "fire-gas-no-flame"],
  jetboil_genesis: ["fire-gas-igniter", "fire-gas-no-flame"],
  snowpeak_gigapower: ["fire-gas-igniter"],
  honda_eu2200:    ["fire-generator-start-die", "fire-generator-no-start"],
  champion_3500:   ["fire-generator-start-die", "fire-generator-no-start"],
  ecoflow_delta3:  ["power-bms-cutoff", "power-inverter-overload"],
  jackery_1000:    ["power-bms-cutoff", "power-inverter-overload"],
  renogy_200w:     ["power-solar-low-output"],
  bougerv_200w:    ["power-solar-low-output"],
  warn_zeon:       ["recovery-winch-solenoid"],
  smittybilt_x20:  ["recovery-winch-solenoid"],
  arb_hilift:      ["recovery-hilift-pin"],
  viair_400c:      ["recovery-compressor-thermal"],
  bighorn_rtv:     ["shelter-tent-zipper", "shelter-tent-pole"],
  kelty_cosmic:    ["shelter-sleeping-pad-leak"],
};

export const failureNodes: FailureNode[] = [

  // ══════════════════════════════════════════════════════
  // WATER
  // ══════════════════════════════════════════════════════

  {
    id: "water-hollow-fiber-zero-flow",
    category: "water",
    deviceType: "Hollow Fiber Filter (Sawyer, Grayl, Katadyn BeFree)",
    symptom: "Zero flow / total blockage",
    symptomDetail: "Water will not pass through at all — squeezing produces nothing.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Did the temperature drop below 32°F (0°C) at any point while the filter was wet?",
      yes: {
        type: "solution",
        cause: "Internal membrane rupture from ice crystal expansion",
        likelihood: 95,
        severity: 5,
        standardFix: "Discard the unit. A ruptured hollow fiber membrane cannot be repaired and cannot be detected visually.",
        safetyWarning: "CRITICAL — DO NOT USE: Ice expansion ruptures the hollow fibers at the microscopic level. The filter will appear to work after thawing but will pass bacteria, viruses, and protozoa directly into your water. Use as a pre-filter for sediment only and boil ALL output water.",
        danger: true,
        requiredTools: [],
        fieldNote: "Store filters inside sleeping bag or jacket pocket in freezing temperatures.",
      },
      no: {
        type: "question",
        text: "Have you attempted backflushing with the included syringe or a squeeze bottle?",
        yes: {
          type: "solution",
          cause: "Severe biofilm or sediment impaction — backflush not sufficient",
          likelihood: 80,
          severity: 3,
          standardFix: "Mix 0.5% bleach solution (1 tsp per quart). Backflush with bleach solution, let soak 30 min, then flush with clean water. Repeat.",
          improvisedFix: "Blow forcefully and repeatedly into the output (clean) port while submerged in clean water. Alternate with squeezing dirty-side-in. Takes 10–20 cycles.",
          requiredTools: ["Sawyer syringe or squeeze bottle", "Small amount of bleach (optional)"],
        },
        no: {
          type: "solution",
          cause: "Mild sediment clog — membrane dry or compacted",
          likelihood: 75,
          severity: 2,
          standardFix: "Backflush with the included syringe using clean water — 3 to 5 strong pushes.",
          improvisedFix: "Submerge the filter and shake vigorously. Then blow air through the output port to dislodge the clog from inside.",
          extremeFix: "Fill a clean container with water, submerge the filter, and squeeze the dirty bag repeatedly to force water backward through the membrane.",
          requiredTools: [],
        },
      },
    },
  },

  {
    id: "water-hollow-fiber-slow-flow",
    category: "water",
    deviceType: "Hollow Fiber Filter (Sawyer, Grayl, Katadyn BeFree)",
    symptom: "Slow flow — 50% or less of normal rate",
    symptomDetail: "Filter is passing water but noticeably slower than when new.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Is the source water visibly turbid (cloudy, silty, or high in sediment)?",
      yes: {
        type: "solution",
        cause: "Sediment loading — pores physically blocked by fine particles",
        likelihood: 85,
        severity: 2,
        standardFix: "Pre-filter source water through a bandana, coffee filter, or cotton cloth to remove sediment before filtering. Then backflush the filter.",
        improvisedFix: "Let turbid water settle in a container for 30 minutes, then filter from the top — the clearest layer — only.",
        requiredTools: ["Bandana or cloth pre-filter"],
      },
      no: {
        type: "question",
        text: "Have you tried soaking the filter in clean water for 30+ minutes before use?",
        yes: {
          type: "solution",
          cause: "Mineral scaling from hard water — calcium deposits narrowing pores",
          likelihood: 70,
          severity: 2,
          standardFix: "Soak in white vinegar or dilute citric acid solution for 1–2 hours, then backflush thoroughly.",
          improvisedFix: "Soak in lemon juice diluted with an equal part clean water for 2–4 hours. Flush completely before use.",
          requiredTools: ["White vinegar or lemon juice"],
          fieldNote: "Hard water scaling is common in desert Southwest and limestone regions.",
        },
        no: {
          type: "solution",
          cause: "Dry membrane — hollow fibers not fully hydrated",
          likelihood: 80,
          severity: 1,
          standardFix: "Soak the filter in clean water for 30–60 minutes to fully hydrate the membrane before use.",
          improvisedFix: "Submerge and squeeze the bag repeatedly with clean water to force hydration faster.",
          requiredTools: [],
        },
      },
    },
  },

  {
    id: "water-pump-no-prime",
    category: "water",
    deviceType: "Pump Filter (MSR MiniWorks, Katadyn Hiker)",
    symptom: "Pump won't prime / handle moves freely with no resistance",
    symptomDetail: "Pumping produces no suction — handle feels loose or empty.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Has the pump been stored dry for an extended period (weeks or months)?",
      yes: {
        type: "solution",
        cause: "Dried leather or rubber piston cup — lost its seal",
        likelihood: 90,
        severity: 3,
        standardFix: "Apply silicone grease to the piston leather or O-ring. Work it in by pumping dry several times, then prime.",
        improvisedFix: "Use petroleum jelly (Vaseline), olive oil, or animal fat to re-supple the leather cup. Rub in thoroughly with your fingers.",
        extremeFix: "Use forehead or nose skin oil — press the leather against your forehead and rub. It sounds absurd but provides just enough lubrication to restore a temporary seal.",
        requiredTools: ["Silicone grease (standard)", "Any oil or fat (field)"],
      },
      no: {
        type: "solution",
        cause: "Inlet or outlet valve failure — check ball or flap not seating",
        likelihood: 70,
        severity: 3,
        standardFix: "Disassemble pump head, clean valves with clean water, check for debris under valve seats. Reassemble and test.",
        improvisedFix: "Tap the pump body firmly against your palm while pumping — dislodges debris from valve seats without disassembly.",
        requiredTools: ["MSR pump maintenance kit (standard)"],
      },
    },
  },

  {
    id: "water-gravity-bag-leak",
    category: "water",
    deviceType: "Gravity Filter Bag (Platypus, MSR AutoFlow)",
    symptom: "Leaking seam or visible puncture",
    symptomDetail: "Water dripping or spraying from the bag body, not the filter connection.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Can you see the exact puncture or seam failure point?",
      yes: {
        type: "solution",
        cause: "Physical puncture or seam delamination",
        likelihood: 95,
        severity: 3,
        standardFix: "Dry the area completely. Apply a Tenacious Tape patch (included in most repair kits) or Gear Aid Seam Grip over and around the hole.",
        improvisedFix: "Clean the area with alcohol wipe or hand sanitizer. Apply Gorilla Tape patch — press firmly and allow 5 minutes to bond. Reinforce with a second layer.",
        extremeFix: "Heat pine resin over a flame until liquid, apply to the hole, and press flat. Allow to cool fully. Not watertight long-term but buys several hours.",
        requiredTools: ["Tenacious Tape or Gorilla Tape"],
      },
      no: {
        type: "solution",
        cause: "Pinhole leak or micro-tear — not visible without pressurizing",
        likelihood: 75,
        severity: 2,
        standardFix: "Fill bag completely, squeeze to pressurize, and submerge in clean water. Watch for bubble stream to locate leak. Mark and patch.",
        improvisedFix: "Apply a thin coat of lip balm across the entire seam area — acts as a temporary sealant for micro-gaps.",
        requiredTools: ["Clean water for submerge test"],
      },
    },
  },

  {
    id: "water-grayl-plunger",
    category: "water",
    deviceType: "Grayl GeoPress / UltraPress",
    symptom: "Extreme resistance pressing / cannot fully depress plunger",
    symptomDetail: "Pressing the plunger requires far more force than normal or it won't move.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Is the filter cartridge new or recently replaced (under 300 presses)?",
      yes: {
        type: "solution",
        cause: "New filter membrane not fully wet — increased initial resistance is normal",
        likelihood: 85,
        severity: 1,
        standardFix: "Soak the cartridge in clean water for 5 minutes before first use. Resistance drops significantly after 5–10 presses.",
        requiredTools: [],
      },
      no: {
        type: "solution",
        cause: "Cartridge at or past rated capacity / severe sediment loading",
        likelihood: 80,
        severity: 3,
        standardFix: "Replace the filter cartridge. GeoPress rated 350 presses, UltraPress rated 250 presses.",
        improvisedFix: "Pre-filter all water through cloth to remove visible sediment, then press slowly with body weight (not arm strength alone) — lean over and press straight down.",
        fieldNote: "Grayl cartridges cannot be backflushed or cleaned. Replacement is the only long-term fix.",
        requiredTools: ["Replacement Grayl cartridge"],
      },
    },
  },

  // ══════════════════════════════════════════════════════
  // FIRE / FOOD
  // ══════════════════════════════════════════════════════

  {
    id: "fire-liquid-fuel-yellow-flame",
    category: "fire",
    deviceType: "Liquid Fuel Stove (MSR WhisperLite, Pocket Rocket, Optimus Nova)",
    symptom: "Yellow or orange flame — lazy and 'drunk'",
    symptomDetail: "Flame is not a crisp blue — it's yellow, sooty, and won't hold pressure.",
    nodeType: "chemical",
    tree: {
      type: "question",
      text: "Has the stove been run recently on white gas or has the fuel been sitting in the tank for weeks?",
      yes: {
        type: "solution",
        cause: "Carbon carbonization — jet orifice clogged with combustion residue",
        likelihood: 85,
        severity: 2,
        standardFix: "Use the jet-cleaning needle from your MSR maintenance kit. Insert and rotate to break up carbon deposits.",
        improvisedFix: "Extract a single copper strand from a stripped USB charging cable or guitar string. Use it to carefully floss the jet orifice with a gentle in-and-out motion.",
        extremeFix: "Heat the jet directly with a lighter for 10 seconds to burn off carbon, allow to cool, then blow compressed air (from your lungs) through the orifice.",
        requiredTools: ["MSR cleaning needle (standard)", "Copper wire strand (field)"],
      },
      no: {
        type: "solution",
        cause: "Fuel contamination or air-fuel mixture off — dirty fuel or wrong fuel type",
        likelihood: 70,
        severity: 2,
        standardFix: "Drain tank completely, flush with a small amount of fresh white gas, refill with clean fuel. Purge the fuel line before lighting.",
        fieldNote: "Never use automotive gasoline in white gas stoves — the additives clog jets within minutes.",
        requiredTools: [],
      },
    },
  },

  {
    id: "fire-liquid-fuel-pump-mushy",
    category: "fire",
    deviceType: "Liquid Fuel Stove (MSR WhisperLite, Optimus Nova)",
    symptom: "Pump feels soft / mushy — won't build pressure",
    symptomDetail: "Pumping the fuel cap produces little or no resistance. Stove runs weakly or not at all.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Does the pump shaft feel dry or sticky when you pull it out?",
      yes: {
        type: "solution",
        cause: "Dried leather cup — lost its ability to compress air against the tank",
        likelihood: 90,
        severity: 3,
        standardFix: "Remove pump, apply silicone grease to the leather cup. Work in by pumping dry 15–20 strokes. Reassemble.",
        improvisedFix: "Use olive oil, coconut oil, or bacon grease as a leather conditioner. Any oil-based substance will temporarily restore the seal.",
        extremeFix: "Press the leather cup firmly against your forehead or nose (where skin is oiliest) and rub it in. The natural skin oils are enough for a short-term fix.",
        requiredTools: ["Silicone grease (standard)"],
      },
      no: {
        type: "solution",
        cause: "Pump O-ring failure or cracked pump shaft body",
        likelihood: 65,
        severity: 3,
        standardFix: "Inspect pump O-ring (visible at base of pump cup). Replace from MSR repair kit.",
        improvisedFix: "Wrap the pump shaft threads in Teflon plumber's tape. Cut a thin strip from a nitrile glove as an emergency O-ring substitute.",
        requiredTools: ["MSR fuel pump maintenance kit"],
      },
    },
  },

  {
    id: "fire-gas-igniter",
    category: "fire",
    deviceType: "Canister Gas Stove (Jetboil, Snow Peak, MSR Reactor)",
    symptom: "Piezo igniter clicking but not lighting",
    symptomDetail: "You hear the click and see a weak spark, but the burner won't ignite.",
    nodeType: "electrical",
    tree: {
      type: "question",
      text: "Are conditions wet, humid, or has the stove been exposed to rain or condensation?",
      yes: {
        type: "solution",
        cause: "Moisture short-circuiting the piezo spark — spark too weak to cross the wet gap",
        likelihood: 85,
        severity: 2,
        standardFix: "Dry the burner head and igniter tip with a cloth or paper towel. Shield from wind, open gas valve briefly to purge moisture, then click.",
        improvisedFix: "Use a lighter or ferrocerium rod as backup ignition while the piezo dries. The gas valve works — ignition is the only issue.",
        extremeFix: "Strike a piece of char-cloth or magnesium shaving near the burner to catch the weak spark. The gas will light from the ember.",
        requiredTools: ["Backup lighter or ferrocerium rod"],
      },
      no: {
        type: "solution",
        cause: "Piezo crystal failure or loose igniter wire connection",
        likelihood: 75,
        severity: 2,
        standardFix: "Check the igniter wire connection at the burner head — often works loose from vibration. Press connection firmly. If the crystal is dead, use a lighter.",
        improvisedFix: "Always carry a backup BIC lighter or ferrocerium rod. A dead piezo is a known failure point — the gas valve is independent of ignition.",
        requiredTools: ["Backup BIC lighter"],
        fieldNote: "Piezo igniters are the weakest link on all canister stoves. A $1 lighter is your real ignition system.",
      },
    },
  },

  {
    id: "fire-gas-no-flame",
    category: "fire",
    deviceType: "Canister Gas Stove (Jetboil, Snow Peak)",
    symptom: "No gas — valve open but nothing coming out",
    symptomDetail: "Opening the gas valve produces no hiss, no smell, no ignition possible.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Is the ambient temperature below 20°F (-7°C)?",
      yes: {
        type: "solution",
        cause: "Canister pressure too low — isobutane/propane mix won't vaporize in extreme cold",
        likelihood: 90,
        severity: 4,
        standardFix: "Warm the canister with body heat. Place inside jacket against skin for 10–15 minutes. Do NOT place over flame.",
        improvisedFix: "Fill a container with warm water (not hot — not boiling). Place canister in water for 5 minutes. This restores enough pressure for several minutes of operation.",
        extremeFix: "Carry a 4-season canister (Jetboil Jetpower 4-season blend has higher propane ratio for cold weather). Switch to white gas stove for temps below 15°F.",
        safetyWarning: "Never heat a gas canister directly with flame. Warm water only. Pressure release from heat can rupture the canister.",
        requiredTools: [],
        fieldNote: "Standard isobutane canisters lose 80% of pressure below 20°F.",
      },
      no: {
        type: "solution",
        cause: "Canister empty, connection failure, or valve clog",
        likelihood: 70,
        severity: 3,
        standardFix: "Shake the canister — an empty one sounds/feels different. Check the Lindal valve connection for cross-threading. Gently clean valve threads.",
        improvisedFix: "Swap to a backup canister if available. Inspect the stove's connector threads for debris and clear with a pin.",
        requiredTools: [],
      },
    },
  },

  {
    id: "fire-generator-start-die",
    category: "fire",
    deviceType: "Portable Generator (Honda EU2200, Champion)",
    symptom: "Starts but dies within 30 seconds",
    symptomDetail: "Generator fires up, runs briefly, then cuts out. Repeats.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Has the generator been stored with fuel in the tank for more than 30 days?",
      yes: {
        type: "solution",
        cause: "Varnished / gummed carburetor bowl from stale fuel breakdown",
        likelihood: 90,
        severity: 3,
        standardFix: "Drain old fuel completely. Add fresh fuel with Seafoam fuel stabilizer. If still dying, remove carb bowl and clean the float needle with carburetor cleaner.",
        improvisedFix: "Tap the carburetor bowl firmly with the rubber handle of a screwdriver while running — a stuck float needle will often dislodge from the vibration.",
        extremeFix: "Remove the air filter and spray small bursts of starting fluid into the intake while cranking. This bypasses the carb temporarily and can clear a sticky float.",
        requiredTools: ["Screwdriver", "Carburetor cleaner or Seafoam"],
        fieldNote: "Always store generators with either completely empty tanks or Seafoam-treated fuel.",
      },
      no: {
        type: "solution",
        cause: "Load overload or low oil shutdown — Honda ECO throttle kicking in",
        likelihood: 75,
        severity: 2,
        standardFix: "Check oil level first. Honda EU2200 will shut off below 0.21 quarts — this is silent and looks like a carb issue. Add oil if low.",
        improvisedFix: "Disconnect all loads, let the engine cool 5 minutes, restart with no load connected. Add loads one at a time to identify the overload source.",
        requiredTools: ["Oil (SAE 10W-30)"],
      },
    },
  },

  // ══════════════════════════════════════════════════════
  // POWER
  // ══════════════════════════════════════════════════════

  {
    id: "power-solar-low-output",
    category: "power",
    deviceType: "Solar Panel (Rigid or Flexible)",
    symptom: "Output below 20% of rated wattage in full sun",
    symptomDetail: "Panel is in direct sunlight but your charge controller or station shows less than 1/5 of rated output.",
    nodeType: "electrical",
    tree: {
      type: "question",
      text: "Are any part of the panel cells in shadow — even a small corner or edge?",
      yes: {
        type: "solution",
        cause: "Partial shading in series circuit — one shaded cell limits the entire panel's output",
        likelihood: 85,
        severity: 2,
        standardFix: "Reposition the panel so every cell has direct, unobstructed sunlight. Even 5% shading on a series-wired panel can reduce output by 50–80%.",
        improvisedFix: "If repositioning isn't possible, wire panels in parallel instead of series — a shaded panel in parallel only loses its own output, not the whole array.",
        requiredTools: [],
        fieldNote: "Run panels in parallel in wooded or variable-shade environments. Series wiring is only efficient in open, unobstructed sun.",
      },
      no: {
        type: "question",
        text: "Is the panel surface hot to the touch (above approx. 115°F / 46°C)?",
        yes: {
          type: "solution",
          cause: "Thermal derating — solar cells lose ~0.5% efficiency per degree above 77°F",
          likelihood: 80,
          severity: 2,
          standardFix: "Elevate panel off the ground or roof surface to allow airflow underneath. Output recovers as panel cools.",
          improvisedFix: "Wet a cloth and drape over the panel frame edges (not the cells) to cool via evaporation. Or angle panel to catch breeze.",
          fieldNote: "A panel at 140°F can lose 30% of its rated output. In desert environments, morning and late afternoon sun is often more productive than midday.",
          requiredTools: [],
        },
        no: {
          type: "solution",
          cause: "Micro-crack or cell damage — physical damage to cells reducing output",
          likelihood: 70,
          severity: 3,
          standardFix: "Inspect for visible cracks, delamination, or 'hot spots' (darker or discolored patches on cell surface). A single cracked cell can isolate a full bypass string.",
          improvisedFix: "Identify which section of the panel is dead by shading different halves and watching output change. If one half contributes nothing, bypass its junction box connection.",
          requiredTools: ["Multimeter"],
        },
      },
    },
  },

  {
    id: "power-bms-cutoff",
    category: "power",
    deviceType: "Lithium Power Station / LiFePO4 Battery Pack",
    symptom: "Unit is completely unresponsive — no display, no output, won't charge",
    symptomDetail: "Power station appears 'bricked' — no lights, no beeps, no response to button presses.",
    nodeType: "electrical",
    tree: {
      type: "question",
      text: "Was the unit exposed to temperatures below 32°F (0°C) while being charged or stored at low SoC?",
      yes: {
        type: "solution",
        cause: "BMS low-temperature protection cutoff — battery below safe charging threshold",
        likelihood: 90,
        severity: 3,
        standardFix: "Bring unit to room temperature (60°F+) for 30–60 minutes without attempting to charge. BMS will reset automatically once cell temperature rises.",
        improvisedFix: "Place the power station inside your sleeping bag or press it against your body inside a jacket. Body heat is sufficient to warm the cells above the BMS threshold in 20–40 minutes.",
        extremeFix: "Wrap the unit in any available insulation (extra clothing, emergency blanket) and place in direct sunlight. Avoid placing over a heat source — temperature shock can damage cells.",
        requiredTools: [],
        fieldNote: "EcoFlow units typically lock at 32°F for charging. Jackery locks at 32°F. Bluetti locks at 14°F. Check your manual for exact thresholds.",
      },
      no: {
        type: "question",
        text: "Was the unit fully discharged and then left unused for more than 2 months?",
        yes: {
          type: "solution",
          cause: "Deep discharge BMS lockout — cells below minimum voltage for self-recovery",
          likelihood: 75,
          severity: 4,
          standardFix: "Connect to solar or wall charger and leave connected for 4–6 hours before pressing any buttons. Some units require 10+ minutes on charge before the display activates.",
          safetyWarning: "Do not attempt to jump-start a deeply discharged lithium battery with a car battery or external voltage source. This bypasses the BMS and can cause thermal runaway and fire.",
          requiredTools: ["OEM charger or solar panel"],
        },
        no: {
          type: "solution",
          cause: "Overload or short circuit event — BMS protection tripped",
          likelihood: 65,
          severity: 3,
          standardFix: "Disconnect ALL output devices. Press and hold the power button for 10–15 seconds (hard reset). Reconnect charger only, not any output loads.",
          improvisedFix: "If hard reset doesn't work, leave unit unplugged and off for 30 minutes to allow BMS capacitors to fully discharge and reset.",
          requiredTools: [],
        },
      },
    },
  },

  {
    id: "power-inverter-overload",
    category: "power",
    deviceType: "Power Inverter (standalone unit)",
    symptom: "Pop sound and dead — possible ozone smell",
    symptomDetail: "Inverter shut off suddenly with a popping sound. May smell burnt or chemical.",
    nodeType: "electrical",
    tree: {
      type: "question",
      text: "Were you running a load that could draw a high startup surge — motors, compressors, circular saws?",
      yes: {
        type: "solution",
        cause: "Inrush current overload — startup surge exceeded inverter's peak rating",
        likelihood: 85,
        severity: 3,
        standardFix: "Check the internal blade fuse (most inverters have one behind the fuse cover). Replace with identical amperage fuse only. Do not upsize.",
        improvisedFix: "If no spare fuse: reduce load dramatically, then test. If the inverter is internally shorted (not just a fuse), do not continue use.",
        extremeFix: "If absolutely necessary, a small piece of aluminum foil can bridge a blown blade fuse for a one-time test ONLY. This bypasses all overload protection. Disconnect within seconds if it works. This is a fire risk — use only as a test to confirm whether the fuse is the only issue.",
        safetyWarning: "EXTREME RISK: Bypassing a fuse removes all overload protection. A shorted inverter with a bypassed fuse can cause fire. Only use the foil bypass as a diagnostic test lasting 5 seconds maximum. Never run sustained current through a foil bridge.",
        requiredTools: ["Replacement blade fuse (same amperage)"],
      },
      no: {
        type: "solution",
        cause: "Internal component failure — MOSFET or transformer failure",
        likelihood: 60,
        severity: 4,
        standardFix: "Check fuse first. If fuse is good and inverter still dead, the unit has likely suffered an internal component failure. Not field-repairable.",
        fieldNote: "If your inverter has a remote on/off terminal, try cycling power via that terminal — sometimes resets a thermal trip.",
        requiredTools: [],
      },
    },
  },

  // ══════════════════════════════════════════════════════
  // RECOVERY
  // ══════════════════════════════════════════════════════

  {
    id: "recovery-winch-solenoid",
    category: "recovery",
    deviceType: "Electric Winch (Warn, Smittybilt, Runva)",
    symptom: "Click but no spool — motor won't engage",
    symptomDetail: "You hear the relay click when pressing the remote, but the drum doesn't move.",
    nodeType: "electrical",
    tree: {
      type: "question",
      text: "Are the winch battery cables hot to the touch near the solenoid pack?",
      yes: {
        type: "solution",
        cause: "High-resistance connection — corroded terminal or undersized cable heating up",
        likelihood: 80,
        severity: 3,
        standardFix: "Disconnect battery. Clean all cable terminals with wire brush or sandpaper. Apply dielectric grease. Reconnect and torque terminals firmly.",
        improvisedFix: "Abrade terminal contact areas with a rock or the file on a multitool to expose fresh metal. Reconnect firmly.",
        requiredTools: ["Wire brush or sandpaper", "Wrench"],
      },
      no: {
        type: "solution",
        cause: "Solenoid failure — contactor not closing despite receiving signal",
        likelihood: 75,
        severity: 4,
        standardFix: "Test solenoid with multimeter — should show continuity across motor terminals when energized. Replace solenoid pack if failed (common failure point, stock a spare).",
        improvisedFix: "Solenoid bypass: use a HEAVY rubber-handled insulated wrench or jumper cable to momentarily bridge the Battery (+) terminal and the Motor (+) terminal on the solenoid pack directly. Winch will engage instantly and spool until contact is broken. Use only for immediate recovery — this bypasses ALL controls.",
        extremeFix: "If no insulated bridge tool available: use a folded leather belt or rubber strip as a handle insulator around a piece of metal. Do not allow any part of the bridge or your hands to contact vehicle ground simultaneously.",
        safetyWarning: "WARNING: Direct solenoid bypass creates an immediate and uncontrolled winch engagement. The winch will run at full speed with no remote control. Have a spotter to call STOP. Keep all personnel clear of the rope/cable path. Do not use with a kinked or frayed cable. Sparking is expected.",
        requiredTools: ["Heavy insulated jumper cables or rubber-handled wrench"],
      },
    },
  },

  {
    id: "recovery-hilift-pin",
    category: "recovery",
    deviceType: "Hi-Lift / Farm Jack",
    symptom: "Climbing pins sticking — jack won't lift",
    symptomDetail: "Moving the handle produces no vertical movement — pins appear locked.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Is there visible rust or dirt accumulation on the jack bar?",
      yes: {
        type: "solution",
        cause: "Corrosion or debris jamming the climbing pins in their channels",
        likelihood: 85,
        severity: 3,
        standardFix: "Spray WD-40 or penetrating oil on all contact surfaces of the bar. Work the reversing lever back and forth 20+ times to break loose pin movement.",
        improvisedFix: "Pour any liquid oil (cooking, motor, even salad dressing) on the bar surface. Work the reversing lever aggressively. The pins need lubrication and freed debris — movement does both.",
        extremeFix: "Human urine — the warmth and mild acidity breaks surface tension of rust and light corrosion. Pour on the pin channels and work immediately while still warm.",
        requiredTools: ["WD-40 or penetrating oil"],
        fieldNote: "Hi-Lift jacks require monthly cleaning and greasing. A seized jack in the field is a known failure mode from neglect.",
      },
      no: {
        type: "solution",
        cause: "Reversing lever in wrong position or bent climbing pins",
        likelihood: 70,
        severity: 2,
        standardFix: "Verify reversing lever is fully engaged in the UP position (not in neutral/middle). Inspect the climbing pin tips for bending — bent pins won't engage the bar notches.",
        requiredTools: [],
      },
    },
  },

  {
    id: "recovery-compressor-thermal",
    category: "recovery",
    deviceType: "Air Compressor (VIAIR, ARB Twin, portable)",
    symptom: "Stopped working mid-inflation — no warning",
    symptomDetail: "Compressor was running, then suddenly stopped. Won't restart.",
    nodeType: "electrical",
    tree: {
      type: "question",
      text: "Had the compressor been running continuously for more than 10–15 minutes?",
      yes: {
        type: "solution",
        cause: "Thermal overload protection tripped — motor exceeded duty cycle temperature",
        likelihood: 95,
        severity: 2,
        standardFix: "Stop completely. Allow 20–30 minutes cooling time. Shade the unit from direct sun if possible. It will restart automatically in most VIAIR units when cool.",
        improvisedFix: "Wrap the cylinder head in a water-soaked cloth or pour water directly on the fins — accelerates cooling by 40–50%. Restart after 10–12 minutes.",
        requiredTools: ["Water and cloth"],
        fieldNote: "VIAIR 400C duty cycle is 33% — run 10 min, rest 20 min at 100 PSI. ARB is 100% duty rated at lower pressures.",
      },
      no: {
        type: "solution",
        cause: "Blown inline fuse or battery voltage sag",
        likelihood: 70,
        severity: 3,
        standardFix: "Check the inline fuse in the power cable — it's the first failure point. Check battery voltage: under 11.5V will cause most compressors to shut off.",
        improvisedFix: "Run compressor directly from battery terminals with the engine running, not from cigarette socket. Engine charging keeps voltage above 13V.",
        requiredTools: ["Spare inline fuse (40–60A depending on unit)"],
      },
    },
  },

  // ══════════════════════════════════════════════════════
  // SHELTER
  // ══════════════════════════════════════════════════════

  {
    id: "shelter-tent-zipper",
    category: "shelter",
    deviceType: "Tent or RTT (any zipper)",
    symptom: "Zipper pulls but teeth separate behind the slider",
    symptomDetail: "The zipper moves but leaves an open gap in its wake — the teeth won't stay closed.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Does the slider feel loose — can you wiggle it more than 1mm side-to-side?",
      yes: {
        type: "solution",
        cause: "Slider channel worn or bent open — no longer gripping teeth together tightly enough",
        likelihood: 90,
        severity: 2,
        standardFix: "Use needle-nose pliers to gently crimp both sides of the slider body inward — very small increments. Test after each crimp. Over-crimping will lock the slider.",
        improvisedFix: "Use a multi-tool's pliers. Grip both sides of the slider simultaneously and apply even, gentle pressure. Go in 0.25mm steps — feel for increased resistance.",
        extremeFix: "Lash the tent closed from outside with paracord threaded through the pull-tabs and tied off. Not elegant but maintains shelter integrity.",
        requiredTools: ["Needle-nose pliers or multi-tool"],
      },
      no: {
        type: "solution",
        cause: "Debris or dried fabric sizing in the teeth — preventing full engagement",
        likelihood: 75,
        severity: 1,
        standardFix: "Run a candle, bar of wax, or zipper lubricant along both sides of the teeth. Operate the zipper slowly back and forth 10 times to work it in.",
        improvisedFix: "Use lip balm or petroleum jelly rubbed along the teeth. Graphite from a pencil tip works well on metal zippers.",
        requiredTools: [],
      },
    },
  },

  {
    id: "shelter-sleeping-pad-leak",
    category: "shelter",
    deviceType: "Inflatable Sleeping Pad (Therm-a-Rest, Klymit, Sea to Summit)",
    symptom: "Deflating by 3:00 AM — waking on the ground",
    symptomDetail: "Pad starts inflated but loses air progressively through the night.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Can you hear or feel air escaping near the valve?",
      yes: {
        type: "solution",
        cause: "Valve seat failure or debris in valve — not fully seating",
        likelihood: 85,
        severity: 2,
        standardFix: "Remove the valve cap, clean the valve seat with a cloth, check for small debris. Therm-a-Rest valves can be unscrewed and replaced.",
        improvisedFix: "Apply a thin ring of silicone sealant or rubber cement around the valve seating area. Allow to cure before inflating.",
        extremeFix: "Plug the valve with a small piece of rubber cut from a glove or balloon. Inflate through a small gap, then drive the plug in fully.",
        requiredTools: ["Gear Aid patch kit or bicycle tube repair kit"],
      },
      no: {
        type: "solution",
        cause: "Micro-puncture in the pad body — not audible but findable",
        likelihood: 80,
        severity: 2,
        standardFix: "Inflate fully, apply soapy water across the entire surface systematically. A bubble stream will mark the leak. Dry thoroughly, apply patch from repair kit.",
        improvisedFix: "Inflate and submerge pad sections in a creek, puddle, or tub. The bubble stream from even a micro-hole is visible under water.",
        extremeFix: "Apply Tenacious Tape patch or a strip of duct tape over the marked area. Press firmly for 60 seconds. This holds for weeks in field conditions.",
        requiredTools: ["Soap and water", "Patch kit or duct tape"],
      },
    },
  },

  {
    id: "shelter-tent-pole",
    category: "shelter",
    deviceType: "Tent (aluminum or fiberglass poles)",
    symptom: "Snapped or splintered pole — structure collapsed",
    symptomDetail: "One or more poles have broken, leaving the tent unable to hold its shape.",
    nodeType: "mechanical",
    tree: {
      type: "question",
      text: "Is the break at a ferrule junction (where two pole sections connect)?",
      yes: {
        type: "solution",
        cause: "Ferrule failure — joint-point stress fracture from cold or impact",
        likelihood: 80,
        severity: 2,
        standardFix: "Use the tent's included pole repair sleeve. Slide it centered over the break and tape both ends with duct tape.",
        improvisedFix: "Find a sturdy straight branch slightly longer than the broken section. Use it as an external splint alongside the pole. Lash with paracord at 3 points — above break, at break, below break.",
        extremeFix: "If no branch: tape multiple tent stakes alongside the break as a rigid splint. Less elegant but functional.",
        requiredTools: ["Duct tape", "Paracord"],
      },
      no: {
        type: "solution",
        cause: "Mid-section snap — usually from overtorque or step-through",
        likelihood: 75,
        severity: 3,
        standardFix: "Same repair sleeve approach. If no sleeve, duct tape alone can hold a clean break for several nights.",
        improvisedFix: "Splint with a branch as above. Key is keeping the two ends aligned — bind both sides before wrapping the joint.",
        extremeFix: "Rig a tarp or ground sheet over the collapsed section, tied to trees or stakes, to maintain a sleeping area even without a functional pole structure.",
        requiredTools: ["Duct tape", "Repair sleeve (included with most tents)"],
      },
    },
  },
];

// Helper — get all unique device types for a category
export function getDeviceTypes(category: FailureCategory): string[] {
  return Array.from(
    new Set(
      failureNodes
        .filter((n) => n.category === category)
        .map((n) => n.deviceType)
    )
  );
}

// Helper — get nodes filtered by category + optional device type
export function getNodes(
  category: FailureCategory,
  deviceType?: string
): FailureNode[] {
  return failureNodes.filter(
    (n) =>
      n.category === category &&
      (deviceType === undefined || n.deviceType === deviceType)
  );
}

// Helper — get nodes filtered by go-bag gear IDs
export function getNodesByGear(gearIds: string[]): FailureNode[] {
  if (gearIds.length === 0) return failureNodes;
  const relevantNodeIds = new Set(
    gearIds.flatMap((id) => gearToNodes[id] ?? [])
  );
  return failureNodes.filter((n) => relevantNodeIds.has(n.id));
}
