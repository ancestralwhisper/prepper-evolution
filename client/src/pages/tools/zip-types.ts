export type ClimateZoneId = "temperate" | "cold" | "hot-humid" | "hot-arid";

export type SolarRegionId =
  | "southwest"
  | "south"
  | "southeast"
  | "california"
  | "mountain"
  | "midwest"
  | "northeast"
  | "northwest"
  | "hawaii"
  | "alaska";

export type KitRegionId =
  | "northeast"
  | "southeast"
  | "midwest"
  | "southwest"
  | "california"
  | "mountain"
  | "pacific-nw"
  | "alaska"
  | "hawaii";

export type HazardId =
  | "wildfire"
  | "hurricane"
  | "earthquake"
  | "tornado"
  | "flooding"
  | "extreme-cold"
  | "extreme-heat";

export interface ZipPrefixData {
  st: string;
  cz: ClimateZoneId;
  sr: SolarRegionId;
  psh: number;
  kr: KitRegionId;
  hz: HazardId;
  uhz: string;
  lf: string;
  ff: string;
  gs: number;
}

export type ZipDataMap = Record<string, ZipPrefixData>;

export const hazardToKitClimate: Record<HazardId, string> = {
  wildfire: "wildfires",
  hurricane: "hurricanes",
  earthquake: "earthquakes",
  tornado: "tornadoes",
  flooding: "flooding",
  "extreme-cold": "extreme-cold",
  "extreme-heat": "extreme-heat",
};

export const climateZoneLabels: Record<ClimateZoneId, string> = {
  temperate: "Temperate",
  cold: "Cold",
  "hot-humid": "Hot / Humid",
  "hot-arid": "Hot / Arid",
};

export const hazardLabels: Record<HazardId, string> = {
  wildfire: "Wildfires",
  hurricane: "Hurricanes",
  earthquake: "Earthquakes",
  tornado: "Tornadoes",
  flooding: "Flooding",
  "extreme-cold": "Extreme Cold",
  "extreme-heat": "Extreme Heat",
};
