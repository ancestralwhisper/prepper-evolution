// ─── RigRated Gear Presets ────────────────────────────────────────────
// Duration-based gear weight presets for UTV overland trip planning.
// Weights are per-person unless noted. Based on typical UTV overlanding loads.

export interface GearPreset {
  durationDays: number;
  label: string;
  foodLbsPerPerson: number;
  waterGalPerPerson: number;
  spareFuelGal: number;
  coolerIceWeightLbs: number;
  recoveryKitLbs: number;
  toolsLbs: number;
  campingGearLbs: number;
}

export const gearPresets: GearPreset[] = [
  {
    durationDays: 3,
    label: "Weekend Warrior (3 days)",
    foodLbsPerPerson: 6,
    waterGalPerPerson: 3,
    spareFuelGal: 2,
    coolerIceWeightLbs: 20,
    recoveryKitLbs: 15,
    toolsLbs: 10,
    campingGearLbs: 30,
  },
  {
    durationDays: 5,
    label: "Extended Trip (5 days)",
    foodLbsPerPerson: 10,
    waterGalPerPerson: 5,
    spareFuelGal: 4,
    coolerIceWeightLbs: 30,
    recoveryKitLbs: 15,
    toolsLbs: 12,
    campingGearLbs: 40,
  },
  {
    durationDays: 7,
    label: "Full Week (7 days)",
    foodLbsPerPerson: 14,
    waterGalPerPerson: 7,
    spareFuelGal: 6,
    coolerIceWeightLbs: 35,
    recoveryKitLbs: 20,
    toolsLbs: 15,
    campingGearLbs: 50,
  },
  {
    durationDays: 10,
    label: "Deep Backcountry (10 days)",
    foodLbsPerPerson: 20,
    waterGalPerPerson: 10,
    spareFuelGal: 8,
    coolerIceWeightLbs: 40,
    recoveryKitLbs: 25,
    toolsLbs: 18,
    campingGearLbs: 55,
  },
  {
    durationDays: 14,
    label: "Expedition (14 days)",
    foodLbsPerPerson: 28,
    waterGalPerPerson: 14,
    spareFuelGal: 10,
    coolerIceWeightLbs: 50,
    recoveryKitLbs: 30,
    toolsLbs: 20,
    campingGearLbs: 65,
  },
];

// Water weighs 8.34 lbs per gallon
export const WATER_LBS_PER_GALLON = 8.34;

// Fuel weighs ~6.3 lbs per gallon (gasoline)
export const FUEL_LBS_PER_GALLON = 6.3;

// Average occupant weights
export const DEFAULT_OCCUPANT_LBS = 180;
export const DEFAULT_CHILD_LBS = 80;

export function findPreset(days: number): GearPreset | undefined {
  return gearPresets.find((p) => p.durationDays === days);
}

export function getPresetOptions(): { value: number; label: string }[] {
  return gearPresets.map((p) => ({ value: p.durationDays, label: p.label }));
}

/** Calculate total gear weight for a given preset and party size */
export function calcPresetWeight(preset: GearPreset, adults: number, children: number): {
  foodLbs: number;
  waterLbs: number;
  spareFuelLbs: number;
  coolerLbs: number;
  recoveryLbs: number;
  toolsLbs: number;
  campingLbs: number;
  totalLbs: number;
} {
  const people = adults + children;
  const foodLbs = Math.round(preset.foodLbsPerPerson * people);
  const waterLbs = Math.round(preset.waterGalPerPerson * people * WATER_LBS_PER_GALLON);
  const spareFuelLbs = Math.round(preset.spareFuelGal * FUEL_LBS_PER_GALLON);
  const coolerLbs = preset.coolerIceWeightLbs;
  const recoveryLbs = preset.recoveryKitLbs;
  const toolsLbs = preset.toolsLbs;
  const campingLbs = preset.campingGearLbs;
  const totalLbs = foodLbs + waterLbs + spareFuelLbs + coolerLbs + recoveryLbs + toolsLbs + campingLbs;

  return { foodLbs, waterLbs, spareFuelLbs, coolerLbs, recoveryLbs, toolsLbs, campingLbs, totalLbs };
}
