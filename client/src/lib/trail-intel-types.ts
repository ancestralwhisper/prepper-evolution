interface WeatherAlert {
  event: string;
  severity: string;
  headline: string;
  description: string;
  expires: string;
}

interface DisasterEntry {
  type: string;
  title: string;
  declarationDate: string;
  county: string;
}

interface WildfireEntry {
  name: string;
  acres: number;
  percentContained: number;
  discoveredAt: string;
}

interface ParkAlert {
  park: string;
  category: "Closure" | "Caution" | "Danger" | "Information";
  title: string;
  description: string;
}

interface RouteStatus {
  open: number;
  closed: number;
  limited: number;
  total: number;
  limitationNotes: string[];
}

interface SeasonalAccess {
  forest: string;
  vehicleAccess: Array<{
    type: string;
    openTrails: number;
    closedTrails: number;
    seasonNote: string;
  }>;
}

interface TrailSystemData {
  id: string;
  name: string;
  landType: "blm" | "usfs" | "nps" | "private" | "mixed";
  parkAlerts?: ParkAlert[];
  routeStatus?: RouteStatus;
  seasonalAccess?: SeasonalAccess;
  websiteUrl?: string;
}

export interface TrailIntelResponse {
  zip: string;
  state: string;
  coords: { lat: number; lon: number };
  fetchedAt: string;
  weather: {
    alerts: WeatherAlert[];
    severity: "none" | "minor" | "moderate" | "severe" | "extreme";
  };
  disasters: {
    active: DisasterEntry[];
    recentCount: number;
  };
  wildfires: {
    active: WildfireEntry[];
    nearbyCount: number;
  };
  trailSystem?: TrailSystemData;
  airQuality?: {
    available: boolean;
    readings: Array<{
      parameter: string;
      aqi: number;
      category: string;
      reportingArea: string;
    }>;
    maxAqi: number;
    maxCategory: string;
  };
  streamGauges?: {
    gauges: Array<{
      name: string;
      lid: string;
      status: string;
      observed: number | null;
      floodStage: number | null;
      url?: string;
    }>;
    hasElevated: boolean;
  };
  fireRestrictions?: {
    areas: Array<{
      name: string;
      level: number;
      description?: string;
      effectiveDate?: string;
    }>;
    maxLevel: number;
  };
  earthquakes?: {
    events: Array<{
      magnitude: number;
      place: string;
      time: string;
      depthKm: number;
    }>;
    maxMagnitude: number;
  };
  overallThreatLevel: "clear" | "advisory" | "watch" | "warning";
  errors: string[];
}
