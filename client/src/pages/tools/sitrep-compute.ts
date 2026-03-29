// ─── SITREP Compute Engine ────────────────────────────────────────────────────
// Reads all Ops Deck localStorage keys and scores 6 categories
// with scenario-specific weights to produce a Go/No-Go readiness verdict.

import type {
  SitrepScenario,
  CategoryResult,
  CategoryStatus,
  PriorityGap,
  SitrepResult,
  GoNoGo,
  SitrepManualInputs,
} from "./sitrep-types";
import type { VehicleProfile } from "./vehicle-types";
import type { SharedPowerConfig } from "./power-config-shared";

// ─── localStorage Keys ────────────────────────────────────────────────────────

const VEHICLE_KEY    = "pe-vehicle-profile";
const LB_KEY         = "lb-ops-deck-v1";
const POWER_KEY      = "pe-power-config";
const BOB_KEY        = "pe-bob-calculator";
const WATER_KEY      = "pe-water-calculator";
const FOOD_KEY       = "pe-food-calculator";
const HOUSEHOLD_KEY  = "pe-household";

// ─── Scenario Weights ─────────────────────────────────────────────────────────
// Sum of each row must equal 1.0

const SCENARIO_WEIGHTS: Record<SitrepScenario, Record<string, number>> = {
  "grid-down":        { mobility: 0.15, power: 0.35, shelter: 0.15, water: 0.20, food: 0.10, comms: 0.05 },
  "72hr-bug-out":     { mobility: 0.40, power: 0.15, shelter: 0.20, water: 0.10, food: 0.10, comms: 0.05 },
  "extended-bug-out": { mobility: 0.30, power: 0.20, shelter: 0.20, water: 0.15, food: 0.10, comms: 0.05 },
  "wildfire-evac":    { mobility: 0.50, power: 0.05, shelter: 0.10, water: 0.15, food: 0.10, comms: 0.10 },
  "shelter-in-place": { mobility: 0.05, power: 0.30, shelter: 0.20, water: 0.25, food: 0.15, comms: 0.05 },
  "winter-storm":     { mobility: 0.10, power: 0.30, shelter: 0.30, water: 0.10, food: 0.15, comms: 0.05 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeRead<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function statusFromScore(score: number): CategoryStatus {
  if (score >= 70) return "green";
  if (score >= 40) return "yellow";
  return "red";
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// ─── Mobility ────────────────────────────────────────────────────────────────

interface LBState {
  vehicleKey?: string;
  entries?: unknown[];
  fuelFillPct?: number;
}

function scoreMobility(
  vp: VehicleProfile | null,
  lb: LBState | null,
  manual: SitrepManualInputs,
): Omit<CategoryResult, "weight"> {
  const wins: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  if (!vp) {
    gaps.push("No vehicle profile configured — mobility score is zero");
    gaps.push("Build your Vehicle Profile to unlock full scoring");
    return { id: "mobility", name: "Mobility", score: 0, status: "red", wins, gaps };
  }

  // Base: profile exists
  score += 25;
  wins.push(`${vp.year} ${vp.make} ${vp.model} profile loaded`);

  // Fuel fill
  const fillPct = lb?.fuelFillPct ?? manual.fuelFillPct;
  const fuelPts = Math.round(fillPct * 0.25); // 100% = 25pts
  score += fuelPts;
  if (fillPct >= 80) {
    wins.push(`Fuel tank ${fillPct}% full`);
  } else if (fillPct >= 40) {
    gaps.push(`Tank only ${fillPct}% — fill up before any event`);
  } else {
    gaps.push(`Tank ${fillPct}% — critically low, fill immediately`);
  }

  // Aux tank
  if (vp.fuel?.auxTankGal && vp.fuel.auxTankGal > 0) {
    score += 10;
    wins.push(`${vp.fuel.auxTankGal}gal aux tank installed`);
  } else if (vp.fuel?.extraCansGal && vp.fuel.extraCansGal > 0) {
    score += 5;
    wins.push(`${vp.fuel.extraCansGal}gal in jerry cans`);
  } else {
    gaps.push("No aux fuel — consider a transfer tank or jerry cans");
  }

  // Tire type
  const tireType = vp.tires?.type ?? "highway";
  if (tireType === "all-terrain" || tireType === "mud-terrain") {
    score += 10;
    wins.push(`${tireType === "all-terrain" ? "A/T" : "M/T"} tires installed`);
  } else {
    gaps.push("Highway tires limit off-road capability in an evac");
  }

  // Recovery gear (check recovery object)
  const r = vp.recovery;
  let recoveryCount = 0;
  if (r) {
    if (r.kinetic) recoveryCount++;
    if (r.straps) recoveryCount++;
    if (r.shackles) recoveryCount++;
    if (r.tractionBoards) recoveryCount++;
    if (r.snatchBlock) recoveryCount++;
    if (r.highlift) recoveryCount++;
    if (r.compressor) recoveryCount++;
    if (r.spareTire) recoveryCount++;
  }
  if (vp.winch?.installed) recoveryCount += 2;

  if (recoveryCount >= 5) {
    score += 15;
    wins.push("Full recovery kit — winch, boards, straps, spare");
  } else if (recoveryCount >= 2) {
    score += 8;
    wins.push(`Basic recovery gear (${recoveryCount} items)`);
    gaps.push("Recovery kit is partial — add traction boards + kinetic rope at minimum");
  } else {
    gaps.push("No recovery gear — getting stuck without it ends your mission");
  }

  // Load balancer configured
  if (lb?.entries && lb.entries.length > 0) {
    score += 5;
    wins.push("Load balancer configured");
  }

  // Overloaded check (simplified — just check GVWR vs curb weight with 500lb threshold)
  const curbWeight = vp.curbWeightLbs;
  const gvwr = vp.gvwrLbs;
  if (gvwr && curbWeight && gvwr - curbWeight < 500) {
    gaps.push("Very low payload margin — careful with gear weight");
  }

  return {
    id: "mobility",
    name: "Mobility",
    score: clamp(score, 0, 100),
    status: statusFromScore(clamp(score, 0, 100)),
    wins,
    gaps,
  };
}

// ─── Power ───────────────────────────────────────────────────────────────────

function scorePower(
  pc: SharedPowerConfig | null,
  vp: VehicleProfile | null,
): Omit<CategoryResult, "weight"> {
  const wins: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  if (!pc) {
    gaps.push("Power System Builder not configured");
    gaps.push("Even a 100Ah LiFePO4 bank + 200W solar covers most needs");
    // Small credit if vehicle has alternator
    if (vp?.electrical?.alternatorAmps && vp.electrical.alternatorAmps > 0) {
      score = 10;
      wins.push("Vehicle alternator available for charging while driving");
    }
    return {
      id: "power",
      name: "Power",
      score: clamp(score, 0, 100),
      status: statusFromScore(clamp(score, 0, 100)),
      wins,
      gaps,
    };
  }

  // Config exists
  score += 15;

  if (pc.mode === "power-station" && pc.stationId) {
    score += 40;
    wins.push("Dedicated power station configured");
    wins.push("Power station handles surge loads and is portable");
  } else if (pc.mode === "12v-system") {
    const ah = pc.batteryAh ?? 0;
    if (ah >= 300) {
      score += 40;
      wins.push(`${ah}Ah battery bank — excellent capacity`);
    } else if (ah >= 150) {
      score += 30;
      wins.push(`${ah}Ah battery bank — solid for 2–3 days`);
    } else if (ah >= 50) {
      score += 20;
      wins.push(`${ah}Ah battery bank — 1-day coverage`);
      gaps.push("Consider expanding to 150Ah+ for multi-day autonomy");
    } else {
      gaps.push("Battery bank under 50Ah — barely enough for lights and phone");
    }

    if (pc.batteryChemistry === "lifepo4") {
      score += 5;
      wins.push("LiFePO4 chemistry — 80% usable depth of discharge");
    } else if (pc.batteryChemistry) {
      gaps.push("AGM/FLA batteries only use 50% capacity — LiFePO4 is worth the upgrade");
    }
  }

  // Solar
  const solar = pc.totalSolarWatts ?? 0;
  if (solar >= 300) {
    score += 25;
    wins.push(`${solar}W solar — can recharge daily in good sun`);
  } else if (solar >= 100) {
    score += 15;
    wins.push(`${solar}W solar installed`);
    gaps.push("Consider adding panels to hit 200W+ for reliable daily recharge");
  } else if (solar > 0) {
    score += 8;
    wins.push(`${solar}W solar installed (minimal)`);
    gaps.push(`${solar}W solar is not enough to offset daily loads — add panels`);
  } else {
    gaps.push("No solar configured — fully dependent on alternator or shore power");
  }

  // DC-DC charger
  if (pc.dcDcChargerId) {
    score += 10;
    wins.push("DC-DC charger installed — charges bank while driving");
  } else if (pc.mode === "12v-system") {
    gaps.push("No DC-DC charger — add one to charge your bank while on the road");
  }

  // Vehicle alternator
  if (vp?.electrical?.alternatorAmps && vp.electrical.alternatorAmps > 0) {
    score += 5;
    wins.push("Vehicle alternator available for charging");
  }

  return {
    id: "power",
    name: "Power",
    score: clamp(score, 0, 100),
    status: statusFromScore(clamp(score, 0, 100)),
    wins,
    gaps,
  };
}

// ─── Shelter ─────────────────────────────────────────────────────────────────

interface LBEntry { zone?: string; name?: string; category?: string; }

function scoreShelter(
  vp: VehicleProfile | null,
  lb: LBState | null,
  manual: SitrepManualInputs,
): Omit<CategoryResult, "weight"> {
  const wins: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  // Check for RTT from vehicle profile
  const hasRTT = vp?.roof?.rtt === true;
  // Check for tent from load balancer entries
  const lbEntries = (lb?.entries as LBEntry[] | null) ?? [];
  const hasShelterInLB = lbEntries.some(
    (e) => e.category === "shelter" && e.zone !== "bed-rear" && e.zone !== "hitch",
  );
  const hasTent = manual.hasTentOrTarp || hasShelterInLB;

  if (hasRTT) {
    score += 50;
    wins.push("Rooftop tent — off-ground, waterproof, deploys in 60 seconds");
    if (vp?.roof?.awning) {
      score += 10;
      wins.push("Awning installed — covered outdoor living space");
    }
  } else if (hasTent) {
    score += 30;
    wins.push("Ground tent or tarp shelter available");
    gaps.push("RTT is faster and more secure — worth considering for vehicle builds");
  } else {
    gaps.push("No dedicated shelter — sleeping in the cab only works short-term");
    gaps.push("Add a rooftop tent or quality ground tent to your kit");
  }

  // Sleeping bag
  if (manual.hasSleepingBag) {
    score += 25;
    wins.push("Sleeping bag confirmed");
  } else {
    gaps.push("No sleeping bag confirmed — add a 3-season or 0°F rated bag");
  }

  // Awning (if no RTT credited)
  if (!hasRTT && vp?.roof?.awning) {
    score += 8;
    wins.push("Awning provides weather coverage");
  }

  // Fallback: roof rack + cargo can mount ground tarp
  if (!hasRTT && !hasTent && vp?.roof?.rack) {
    score += 5;
    wins.push("Roof rack available — can mount a tarp or cargo above");
  }

  return {
    id: "shelter",
    name: "Shelter",
    score: clamp(score, 0, 100),
    status: statusFromScore(clamp(score, 0, 100)),
    wins,
    gaps,
  };
}

// ─── Water ───────────────────────────────────────────────────────────────────

interface HouseholdReadiness {
  water?: { daysOfSupply: number };
  food?: { daysOfSupply: number };
}

interface WaterCalcState {
  adults?: number;
  kids?: number;
  storedGallons?: number;
  storedLiters?: number;
}

function scoreWater(
  wc: WaterCalcState | null,
  lb: LBState | null,
  manual: SitrepManualInputs,
  household: { readiness: HouseholdReadiness } | null,
): Omit<CategoryResult, "weight"> {
  const wins: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  // Use days from manual first; fall back to household readiness, then raw calc state
  let daysOnHand = manual.waterDaysOnHand;

  if (daysOnHand === 0 && household?.readiness?.water?.daysOfSupply) {
    daysOnHand = household.readiness.water.daysOfSupply;
  } else if (wc && daysOnHand === 0) {
    // Derive from stored water calc raw state
    const stored = wc.storedGallons ?? (wc.storedLiters ? wc.storedLiters * 0.264 : 0);
    const people = (wc.adults ?? 1) + (wc.kids ?? 0);
    if (stored > 0 && people > 0) {
      daysOnHand = stored / (people * 1);
    }
  }

  // Score based on days on hand
  if (daysOnHand >= 30) {
    score += 70;
    wins.push(`${Math.round(daysOnHand)} days of stored water — excellent`);
  } else if (daysOnHand >= 14) {
    score += 55;
    wins.push(`${Math.round(daysOnHand)} days of stored water`);
    gaps.push("30-day supply is the standard prep recommendation");
  } else if (daysOnHand >= 7) {
    score += 40;
    wins.push(`${Math.round(daysOnHand)} days of stored water — solid start`);
    gaps.push("Build toward 30 days — 50-gallon drum stores 50 days for 1 person");
  } else if (daysOnHand >= 3) {
    score += 20;
    wins.push(`${Math.round(daysOnHand)} days of stored water`);
    gaps.push("72 hours is the minimum — you need at least 14 days on hand");
  } else if (daysOnHand > 0) {
    score += 10;
    gaps.push("Less than 3 days of water — this is your most critical gap");
  } else {
    gaps.push("No water storage data — enter your days on hand above");
    gaps.push("Store 1 gallon per person per day minimum");
  }

  // Bonus: portable water items in load balancer
  const lbEntries = (lb?.entries as LBEntry[] | null) ?? [];
  const hasWaterInKit = lbEntries.some((e) => e.category === "water-fuel");
  if (hasWaterInKit) {
    score += 15;
    wins.push("Portable water containers in vehicle load list");
  } else {
    gaps.push("No water containers in vehicle — add collapsible jugs or a water tank to your kit");
  }

  // Water calculator connected?
  if (wc) {
    score += 15;
    wins.push("Water Storage Calculator connected");
  }

  return {
    id: "water",
    name: "Water",
    score: clamp(score, 0, 100),
    status: statusFromScore(clamp(score, 0, 100)),
    wins,
    gaps,
  };
}

// ─── Food ────────────────────────────────────────────────────────────────────

interface FoodCalcState {
  adults?: number;
  kids?: number;
  daysTarget?: number;
  storedDays?: number;
}

interface BOBState {
  selected?: Record<string, number>;
}

function scoreFood(
  fc: FoodCalcState | null,
  bob: BOBState | null,
  manual: SitrepManualInputs,
  household: { readiness: HouseholdReadiness } | null,
): Omit<CategoryResult, "weight"> {
  const wins: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  let daysOnHand = manual.foodDaysOnHand;

  // Prefer household readiness data (computed by food calculator)
  if (daysOnHand === 0 && household?.readiness?.food?.daysOfSupply) {
    daysOnHand = household.readiness.food.daysOfSupply;
  } else if (fc && daysOnHand === 0) {
    const stored = fc.storedDays ?? 0;
    if (stored > 0) daysOnHand = stored;
  }

  // Score based on days on hand
  if (daysOnHand >= 90) {
    score += 70;
    wins.push(`${Math.round(daysOnHand)} days of food — excellent supply`);
  } else if (daysOnHand >= 30) {
    score += 55;
    wins.push(`${Math.round(daysOnHand)} days of food supply`);
    gaps.push("Build toward 90-day supply — adds resilience for extended events");
  } else if (daysOnHand >= 14) {
    score += 40;
    wins.push(`${Math.round(daysOnHand)} days of food`);
    gaps.push("30 days minimum is the standard recommendation");
  } else if (daysOnHand >= 3) {
    score += 20;
    wins.push(`${Math.round(daysOnHand)} days of food`);
    gaps.push("Only ${Math.round(daysOnHand)} days — a single storm wipes this out");
  } else if (daysOnHand > 0) {
    score += 8;
    gaps.push("Less than 3 days of food — add freeze-dried meals at minimum");
  } else {
    gaps.push("No food storage data — enter your days on hand above");
    gaps.push("Start with 72 hours of high-calorie shelf-stable food in your kit");
  }

  // Bug out bag food bonus
  if (bob?.selected && Object.keys(bob.selected).length > 0) {
    score += 15;
    wins.push("Bug Out Bag configured with food supplies");
  } else {
    gaps.push("No Bug Out Bag food — configure your BOB calculator");
  }

  // Food calculator connected
  if (fc) {
    score += 15;
    wins.push("Food Storage Calculator connected");
  }

  return {
    id: "food",
    name: "Food",
    score: clamp(score, 0, 100),
    status: statusFromScore(clamp(score, 0, 100)),
    wins,
    gaps,
  };
}

// ─── Comms ───────────────────────────────────────────────────────────────────

function scoreComms(
  vp: VehicleProfile | null,
  manual: SitrepManualInputs,
): Omit<CategoryResult, "weight"> {
  const wins: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  // Cell phone (assume everyone has one)
  score += 10;
  wins.push("Cell phone (assumed) — fails in disasters but useful initially");

  // Vehicle radio
  const radioType = vp?.electrical?.radioType ?? "none";
  if (radioType === "ham") {
    score += 35;
    wins.push("Ham radio installed — works when everything else fails");
  } else if (radioType === "gmrs") {
    score += 25;
    wins.push("GMRS radio installed — good for family/group comms");
    gaps.push("Ham license unlocks national repeater network for long-distance comms");
  } else if (radioType === "cb") {
    score += 15;
    wins.push("CB radio installed — trucker standard, short range");
    gaps.push("CB is short-range only — GMRS or ham for anything beyond 5 miles");
  } else if (radioType !== "none" && radioType) {
    score += 15;
    wins.push(`${radioType} radio installed`);
  } else {
    gaps.push("No vehicle radio — GMRS is the best dollar-for-dollar upgrade for evac comms");
  }

  // Handheld radio
  if (manual.hasHandheldRadio) {
    score += 20;
    wins.push("Handheld radio — works without a vehicle");
  } else {
    gaps.push("Add a Baofeng or Midland GMRS handheld to every pack ($30–60)");
  }

  // Satellite communicator
  if (manual.hasSatComm) {
    score += 30;
    wins.push("Satellite communicator (Garmin inReach/SPOT) — works anywhere, no towers needed");
  } else {
    gaps.push("Satellite communicator is the only comms that survives total infrastructure loss");
  }

  // Bonus: multiple methods
  const methodCount = [radioType !== "none", manual.hasHandheldRadio, manual.hasSatComm].filter(Boolean).length;
  if (methodCount >= 3) {
    score += 5;
    wins.push("Multiple independent comms methods — redundancy is the point");
  }

  return {
    id: "comms",
    name: "Comms",
    score: clamp(score, 0, 100),
    status: statusFromScore(clamp(score, 0, 100)),
    wins,
    gaps,
  };
}

// ─── Priority Gap Builder ────────────────────────────────────────────────────

function buildPriorityGaps(
  categories: CategoryResult[],
  scenario: SitrepScenario,
): PriorityGap[] {
  const gaps: PriorityGap[] = [];

  const toolMap: Record<string, { slug: string; name: string }> = {
    mobility: { slug: "vehicle-profile", name: "Vehicle Profile" },
    power:    { slug: "power-system-builder", name: "Power System Builder" },
    shelter:  { slug: "load-balancer", name: "Load Balancer" },
    water:    { slug: "water-storage-calculator", name: "Water Calculator" },
    food:     { slug: "food-storage-calculator", name: "Food Calculator" },
    comms:    { slug: "vehicle-profile", name: "Vehicle Profile" },
  };

  // Collect all category gaps weighted by scenario impact
  const weightedGaps: Array<{ catId: string; gap: string; impact: number }> = [];
  for (const cat of categories) {
    const impact = (100 - cat.score) * cat.weight;
    for (const gap of cat.gaps) {
      weightedGaps.push({ catId: cat.id, gap, impact });
    }
  }

  // Sort by impact descending, take top 5
  weightedGaps.sort((a, b) => b.impact - a.impact);
  const top = weightedGaps.slice(0, 5);

  for (let i = 0; i < top.length; i++) {
    const item = top[i];
    const tool = toolMap[item.catId];
    const catLabel = categories.find((c) => c.id === item.catId)?.name ?? item.catId;

    gaps.push({
      priority: i + 1,
      category: catLabel,
      issue: item.gap,
      fix: fixAction(item.catId, item.gap, scenario),
      toolSlug: tool?.slug,
      toolName: tool?.name,
    });
  }

  return gaps;
}

function fixAction(catId: string, gap: string, scenario: SitrepScenario): string {
  if (catId === "mobility") {
    if (gap.includes("vehicle profile")) return "Open Vehicle Profile and select your rig from the database.";
    if (gap.includes("fuel")) return "Fill your tank before any event. Keep it above 1/2 tank as a rule.";
    if (gap.includes("aux fuel")) return "Install a transfer tank or carry 2× 5-gallon jerry cans.";
    if (gap.includes("recovery")) return "Start with traction boards + kinetic rope + tire plug kit (~$150 total).";
    if (gap.includes("tires")) return "A/T tires are a one-time upgrade that pays dividends in every off-pavement situation.";
  }
  if (catId === "power") {
    if (gap.includes("Power System")) return "Open Power System Builder and enter your setup, even if it's just a single battery.";
    if (gap.includes("solar")) return "Add a 200W rigid panel — it will pay for itself in a single week-long grid outage.";
    if (gap.includes("DC-DC")) return "A $120 MPPT DC-DC charger keeps your bank charged any time the engine is running.";
    if (gap.includes("battery")) return "A 100Ah LiFePO4 drop-in battery (~$300) covers lights, fridge, and phone for 2+ days.";
  }
  if (catId === "shelter") {
    if (gap.includes("shelter")) return "A $150 tent is the minimum. A hard-shell RTT is worth every dollar if you own a truck or SUV.";
    if (gap.includes("sleeping bag")) return "Get a 0°F rated bag — it works in any season and won't fail you when it matters.";
  }
  if (catId === "water") {
    if (gap.includes("Water Storage")) return "Open Water Storage Calculator and enter your stored gallons to get credit.";
    if (gap.includes("containers")) return "Add 5–7 gallon water jugs to your Load Balancer — this is non-negotiable gear.";
    if (gap.includes("3 days") || gap.includes("less than")) return "Buy a case of 5-gallon jugs this week. $20 buys 15+ days for one person.";
  }
  if (catId === "food") {
    if (gap.includes("Food Storage")) return "Open Food Storage Calculator and enter your current supply to get credit.";
    if (gap.includes("Bug Out Bag")) return "Configure your BOB with at least 72 hours of high-calorie bars and freeze-dried meals.";
    if (gap.includes("days")) return "Mountain House or Augason Farms freeze-dried kits provide 72-hour to 1-year supplies.";
  }
  if (catId === "comms") {
    if (gap.includes("GMRS")) return "A Midland T295VP4 GMRS kit (~$60/pair) is the best budget upgrade for family evac comms.";
    if (gap.includes("satellite")) return "Garmin inReach Mini 2 ($350) works anywhere on earth — no towers, no cell service needed.";
    if (gap.includes("handheld")) return "A Baofeng UV-5R (~$25) covers VHF/UHF. Get a GMRS radio for plug-and-play with no license.";
  }
  return `Improve your ${catId} setup to increase readiness for ${scenario} scenarios.`;
}

// ─── Warnings ────────────────────────────────────────────────────────────────

function buildWarnings(
  vp: VehicleProfile | null,
  pc: SharedPowerConfig | null,
  scenario: SitrepScenario,
): string[] {
  const warnings: string[] = [];

  // Vehicle overloaded
  if (vp) {
    const curbWeight = vp.curbWeightLbs ?? 0;
    const gvwr = vp.gvwrLbs ?? 0;
    if (gvwr > 0 && curbWeight > gvwr) {
      warnings.push("Vehicle is over GVWR — illegal and unsafe to drive");
    }
    if (vp.tires?.ageMonths && vp.tires.ageMonths > 60) {
      warnings.push(`Tires are ${vp.tires.ageMonths} months old — replace before any extended trip`);
    }
  }

  // Winter storm with no sleeping bag
  if (scenario === "winter-storm" && pc) {
    if (!pc.totalSolarWatts || pc.totalSolarWatts < 100) {
      warnings.push("Winter storm scenario with minimal solar — solar output drops 30–40% in cold and overcast conditions");
    }
  }

  // Wildfire evac with low fuel
  if (scenario === "wildfire-evac" && vp) {
    warnings.push("Wildfire evac: know your two exit routes before smoke reduces visibility");
  }

  return warnings;
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function computeSitrep(
  scenario: SitrepScenario,
  manual: SitrepManualInputs,
): SitrepResult {
  // Read all data sources
  const vp         = safeRead<VehicleProfile>(VEHICLE_KEY);
  const lb         = safeRead<LBState>(LB_KEY);
  const pc         = safeRead<SharedPowerConfig>(POWER_KEY);
  const bob        = safeRead<BOBState>(BOB_KEY);
  const wc         = safeRead<WaterCalcState>(WATER_KEY);
  const fc         = safeRead<FoodCalcState>(FOOD_KEY);
  const household  = safeRead<{ readiness: HouseholdReadiness }>(HOUSEHOLD_KEY);

  const weights = SCENARIO_WEIGHTS[scenario];

  // Score each category (household readiness data flows into water/food scoring)
  const mobilityRaw = scoreMobility(vp, lb, manual);
  const powerRaw    = scorePower(pc, vp);
  const shelterRaw  = scoreShelter(vp, lb, manual);
  const waterRaw    = scoreWater(wc, lb, manual, household);
  const foodRaw     = scoreFood(fc, bob, manual, household);
  const commsRaw    = scoreComms(vp, manual);

  const categories: CategoryResult[] = [
    { ...mobilityRaw, weight: weights.mobility },
    { ...powerRaw,    weight: weights.power },
    { ...shelterRaw,  weight: weights.shelter },
    { ...waterRaw,    weight: weights.water },
    { ...foodRaw,     weight: weights.food },
    { ...commsRaw,    weight: weights.comms },
  ];

  // Weighted overall score
  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + c.score * c.weight, 0),
  );

  // Go/No-Go determination
  const goNoGo: GoNoGo =
    overallScore >= 75 ? "send-it"
    : overallScore >= 45 ? "marginal"
    : "stand-down";

  // Priority gaps
  const priorityGaps = buildPriorityGaps(categories, scenario);

  // Warnings
  const warnings = buildWarnings(vp, pc, scenario);

  // Count connected data sources (include household profile)
  const dataSourceCount = [vp, lb, pc, bob, wc, fc, household].filter(Boolean).length;

  return {
    scenario,
    overallScore,
    goNoGo,
    categories,
    priorityGaps,
    warnings,
    dataSourceCount,
  };
}

export type { SitrepScenario, SitrepManualInputs, SitrepResult };
