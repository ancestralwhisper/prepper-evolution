import type { PowerStation, SolarPanel, ConnectorAdapter, CompatDcDcCharger } from "./solar-compat-data";
import { connectorAdapters } from "./solar-compat-data";

export interface PanelCompatResult {
  panel: SolarPanel;
  compatible: boolean;
  incompatible_reason?: string;
  adapter_needed: ConnectorAdapter | null;
  max_series: number; // how many of this panel in series before hitting Voc limit
  max_parallel_strings: number; // how many series strings in parallel before hitting max watts
  optimal_config: string; // e.g. "2 panels in series (43.2V, 200W)"
  max_achievable_w: number; // actual watts you'll get with optimal config
  charge_time_hrs: number; // estimated full charge time (0-100%) with this config
  charge_time_note: string; // "~4.5 hrs in full sun (add 30-50% for real-world)"
}

export function computeCompatibility(
  station: PowerStation,
  panels: SolarPanel[]
): PanelCompatResult[] {
  return panels.map((panel) => {
    // Check voltage compatibility
    if (panel.voc > station.solar_max_voc) {
      return {
        panel,
        compatible: false,
        incompatible_reason: `Single panel Voc (${panel.voc}V) exceeds station max (${station.solar_max_voc}V). Cannot use — would damage the station.`,
        adapter_needed: null,
        max_series: 0,
        max_parallel_strings: 0,
        optimal_config: "Incompatible",
        max_achievable_w: 0,
        charge_time_hrs: 0,
        charge_time_note: "Incompatible",
      };
    }

    // Find adapter if needed
    let adapter_needed: ConnectorAdapter | null = null;
    if (
      panel.native_connector !== station.native_connector &&
      !station.accepts_mc4_direct
    ) {
      adapter_needed =
        connectorAdapters.find(
          (a) =>
            a.from === panel.native_connector &&
            a.to === station.native_connector
        ) ??
        connectorAdapters.find((a) => a.to === station.native_connector) ??
        null;
    } else if (
      panel.native_connector !== "mc4" &&
      station.accepts_mc4_direct
    ) {
      // Station takes MC4, panel has different connector
      adapter_needed =
        connectorAdapters.find(
          (a) => a.from === panel.native_connector && a.to === "mc4"
        ) ?? null;
    }

    // Series calculation: max panels before hitting Voc limit
    const max_series = Math.floor(station.solar_max_voc / panel.voc);
    const series_voc = max_series * panel.voc;
    const series_w = max_series * panel.watts;

    // Parallel calculation: stay under max watt input
    const max_parallel_strings = Math.max(
      1,
      Math.floor(station.solar_max_w / series_w)
    );
    const total_w = Math.min(series_w * max_parallel_strings, station.solar_max_w);

    // Best config description
    let optimal_config: string;
    if (max_series === 1 && max_parallel_strings === 1) {
      optimal_config = `1 panel (${panel.voc}V, ${panel.watts}W)`;
    } else if (max_parallel_strings === 1) {
      optimal_config = `${max_series} panels in series (${series_voc.toFixed(1)}V, ${series_w}W)`;
    } else {
      optimal_config = `${max_series}S×${max_parallel_strings}P (${series_voc.toFixed(1)}V, ${total_w}W)`;
    }

    // Charge time: capacity_wh / achievable_watts, with 85% round-trip efficiency
    const effective_w = total_w * 0.85;
    const charge_time_hrs =
      effective_w > 0
        ? Math.round((station.capacity_wh / effective_w) * 10) / 10
        : 0;
    const charge_time_note = `~${charge_time_hrs} hrs in full sun (add 30–50% for real-world conditions)`;

    return {
      panel,
      compatible: true,
      adapter_needed,
      max_series,
      max_parallel_strings,
      optimal_config,
      max_achievable_w: total_w,
      charge_time_hrs,
      charge_time_note,
    };
  });
}

// ─── 12V System Compute ───────────────────────────────────────────────────────

export interface TwelveVSystemResult {
  charger: CompatDcDcCharger;
  // Alternator charging
  altChargingAmps: number;
  altChargingWatts: number;
  altHoursToFull: number;
  altHoursNote: string;
  // Solar charging via charger
  solarCompatible: boolean;
  solarMaxW: number;
  solarHoursToFull: number;
  solarHoursNote: string;
  // Combined estimate
  combinedNote: string;
}

export function computeTwelveVSystem(
  charger: CompatDcDcCharger,
  batteryAh: number,
  chemistry: "lifepo4" | "agm" | "fla",
  alternatorAmps: number,
  panelWatts: number
): TwelveVSystemResult {
  const usableDepth = chemistry === "lifepo4" ? 0.80 : 0.50;
  const usableAh = batteryAh * usableDepth;
  const chargeFrom20Ah = usableAh * 0.80; // charging from 20% state of charge

  // Alternator: derate to 80% of charger max or available alternator amps
  const altChargingAmps = Math.min(charger.dcAmps, alternatorAmps * 0.7) * 0.85;
  const altChargingWatts = altChargingAmps * 12.8;
  const altHoursToFull = chargeFrom20Ah / altChargingAmps;
  const altHoursNote = `~${altHoursToFull.toFixed(1)} hrs driving to charge from 20% (${Math.round(altChargingAmps)}A @ 12.8V)`;

  // Solar via charger
  const solarCompatible = charger.solarAmps !== null || charger.solarMaxW !== null;
  const effectiveSolarW = solarCompatible
    ? Math.min(panelWatts, charger.solarMaxW ?? charger.solarAmps! * 18) * 0.70
    : 0;
  const solarChargingAh = effectiveSolarW / 12.8;
  const solarHoursToFull = solarChargingAh > 0 ? chargeFrom20Ah / solarChargingAh : 0;
  const solarHoursNote = solarCompatible
    ? `~${solarHoursToFull.toFixed(1)} hrs full sun to charge from 20% (add 30-50% real-world)`
    : "This charger does not accept solar input — pair with a separate MPPT controller";

  // Combined
  const combinedNote = solarCompatible
    ? `2 hrs driving + ${Math.round(effectiveSolarW)}W solar: covers ~${Math.round(altChargingWatts * 2 + effectiveSolarW * 4)}Wh per day`
    : `Alternator only: ${Math.round(altChargingWatts * 2)}Wh per 2 hrs driving`;

  return {
    charger,
    altChargingAmps,
    altChargingWatts,
    altHoursToFull,
    altHoursNote,
    solarCompatible,
    solarMaxW: charger.solarMaxW ?? (charger.solarAmps ? charger.solarAmps * 18 : 0),
    solarHoursToFull,
    solarHoursNote,
    combinedNote,
  };
}
