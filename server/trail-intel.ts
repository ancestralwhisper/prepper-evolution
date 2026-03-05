import type { Request, Response } from "express";
import zipCoordsRaw from "./zip-coords.json";
import zipDataRaw from "./zip-data.json";
import { getTrailSystem, type TrailSystem } from "./trail-systems";

const zipCoords = zipCoordsRaw as Record<string, { lat: number; lon: number }>;

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
  overallThreatLevel: "clear" | "advisory" | "watch" | "warning";
  errors: string[];
}

const cache = new Map<string, { data: TrailIntelResponse; expiresAt: number }>();
const CACHE_TTL = 15 * 60 * 1000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 3600000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function fetchFEMA(state: string): Promise<{ active: DisasterEntry[]; recentCount: number }> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const dateFilter = oneYearAgo.toISOString().split("T")[0];

  const url =
    `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries` +
    `?$filter=state eq '${state}' and declarationDate ge '${dateFilter}'` +
    `&$orderby=declarationDate desc` +
    `&$top=20` +
    `&$select=disasterNumber,declarationTitle,incidentType,declarationDate,incidentBeginDate,incidentEndDate,state,designatedArea`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`FEMA API returned ${res.status}`);

  const json = await res.json();
  const summaries = json.DisasterDeclarationsSummaries || [];

  const now = new Date();
  const active: DisasterEntry[] = [];
  const seen = new Set<number>();

  for (const d of summaries) {
    const endDate = d.incidentEndDate ? new Date(d.incidentEndDate) : null;
    const isActive = !endDate || endDate > now;

    if (isActive && !seen.has(d.disasterNumber)) {
      seen.add(d.disasterNumber);
      active.push({
        type: d.incidentType || "Unknown",
        title: d.declarationTitle || "Disaster Declaration",
        declarationDate: d.declarationDate || "",
        county: d.designatedArea || "",
      });
    }
  }

  return { active, recentCount: summaries.length };
}

const NWS_SEVERITY_ORDER: Record<string, number> = {
  Extreme: 4,
  Severe: 3,
  Moderate: 2,
  Minor: 1,
  Unknown: 0,
};

async function fetchNWS(lat: number, lon: number): Promise<{ alerts: WeatherAlert[]; severity: "none" | "minor" | "moderate" | "severe" | "extreme" }> {
  const url = `https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`;

  const res = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "(prepperevolution.com, contact@prepperevolution.com)",
      Accept: "application/geo+json",
    },
  });
  if (!res.ok) throw new Error(`NWS API returned ${res.status}`);

  const json = await res.json();
  const features = json.features || [];

  const alerts: WeatherAlert[] = features.map((f: Record<string, Record<string, string>>) => ({
    event: f.properties.event || "Unknown Alert",
    severity: f.properties.severity || "Unknown",
    headline: f.properties.headline || "",
    description: (f.properties.description || "").slice(0, 500),
    expires: f.properties.expires || "",
  }));

  alerts.sort((a, b) => (NWS_SEVERITY_ORDER[b.severity] || 0) - (NWS_SEVERITY_ORDER[a.severity] || 0));

  let maxSeverity: "none" | "minor" | "moderate" | "severe" | "extreme" = "none";
  if (alerts.length > 0) {
    const top = alerts[0].severity.toLowerCase();
    if (top === "extreme") maxSeverity = "extreme";
    else if (top === "severe") maxSeverity = "severe";
    else if (top === "moderate") maxSeverity = "moderate";
    else maxSeverity = "minor";
  }

  return { alerts, severity: maxSeverity };
}

async function fetchWildfires(lat: number, lon: number): Promise<{ active: WildfireEntry[]; nearbyCount: number }> {
  const bbox = `${lon - 2},${lat - 2},${lon + 2},${lat + 2}`;

  const url =
    `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters/FeatureServer/0/query` +
    `?where=1%3D1` +
    `&geometry=${encodeURIComponent(bbox)}` +
    `&geometryType=esriGeometryEnvelope` +
    `&inSR=4326` +
    `&spatialRel=esriSpatialRelIntersects` +
    `&outFields=poly_IncidentName,poly_GISAcres,poly_PercentContained,attr_FireDiscoveryDateTime` +
    `&returnGeometry=false` +
    `&f=json`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`NIFC API returned ${res.status}`);

  const json = await res.json();
  const features = json.features || [];

  const active: WildfireEntry[] = features.map((f: Record<string, Record<string, unknown>>) => ({
    name: (f.attributes.poly_IncidentName as string) || "Unnamed Fire",
    acres: Math.round((f.attributes.poly_GISAcres as number) || 0),
    percentContained: (f.attributes.poly_PercentContained as number) || 0,
    discoveredAt: f.attributes.attr_FireDiscoveryDateTime
      ? new Date(f.attributes.attr_FireDiscoveryDateTime as number).toISOString()
      : "",
  }));

  active.sort((a, b) => b.acres - a.acres);

  return { active, nearbyCount: active.length };
}

async function fetchNPSAlerts(parkCodes: string): Promise<ParkAlert[]> {
  const apiKey = process.env.NPS_API_KEY || "";
  const keyParam = apiKey ? `&api_key=${apiKey}` : "";

  const url =
    `https://developer.nps.gov/api/v1/alerts?parkCode=${encodeURIComponent(parkCodes)}&limit=20${keyParam}`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`NPS API returned ${res.status}`);

  const json = await res.json();
  const alerts = json.data || [];

  const validCategories = new Set(["Closure", "Caution", "Danger", "Information"]);

  return alerts.map((a: Record<string, string>) => ({
    park: a.parkCode?.toUpperCase() || "",
    category: validCategories.has(a.category) ? a.category : "Information",
    title: a.title || "Alert",
    description: (a.description || "").slice(0, 500),
  })) as ParkAlert[];
}

async function fetchBLMRouteStatus(blmState: string, bbox: [number, number, number, number]): Promise<RouteStatus> {
  const envelope = `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;

  const url =
    `https://gis.blm.gov/arcgis/rest/services/transportation/BLM_Natl_GTLF_Public_Display/MapServer/0/query` +
    `?where=${encodeURIComponent(`ADMIN_ST='${blmState}'`)}` +
    `&geometry=${encodeURIComponent(envelope)}` +
    `&geometryType=esriGeometryEnvelope` +
    `&inSR=4326` +
    `&spatialRel=esriSpatialRelIntersects` +
    `&outFields=PLAN_OHV_ROUTE_DSGNTN,OHV_ROUTE_DSGNTN_LIM,OBSRVE_ROUTE_USE_CLASS` +
    `&returnGeometry=false` +
    `&returnCountOnly=false` +
    `&f=json`;

  const res = await fetchWithTimeout(url, {}, 8000);
  if (!res.ok) throw new Error(`BLM GTLF API returned ${res.status}`);

  const json = await res.json();
  const features = json.features || [];

  let open = 0;
  let closed = 0;
  let limited = 0;
  const limitationNotes: string[] = [];
  const seenNotes = new Set<string>();

  for (const f of features) {
    const dsgntn = (f.attributes?.PLAN_OHV_ROUTE_DSGNTN || "").toUpperCase();
    if (dsgntn.includes("OPEN")) open++;
    else if (dsgntn.includes("CLOSE")) closed++;
    else if (dsgntn.includes("LIMIT")) {
      limited++;
      const note = f.attributes?.OHV_ROUTE_DSGNTN_LIM || "";
      if (note && !seenNotes.has(note)) {
        seenNotes.add(note);
        limitationNotes.push(note);
      }
    } else {
      open++;
    }
  }

  return {
    open,
    closed,
    limited,
    total: features.length,
    limitationNotes: limitationNotes.slice(0, 5),
  };
}

async function fetchUSFSAccess(forestName: string): Promise<SeasonalAccess> {
  const url =
    `https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MVUM_01/MapServer/2/query` +
    `?where=${encodeURIComponent(`FORESTNAME='${forestName}'`)}` +
    `&outFields=FORESTNAME,ATV,MOTORCYCLE,HIGHCLRNCE_VEHICLE,4WD_GT50,ATV_DATES,MOTORCYCLE_DATES,HIGHCLRNCE_VEHICLE_DATES,4WD_GT50_DATES` +
    `&returnGeometry=false` +
    `&returnCountOnly=false` +
    `&f=json`;

  const res = await fetchWithTimeout(url, {}, 8000);
  if (!res.ok) throw new Error(`USFS MVUM API returned ${res.status}`);

  const json = await res.json();
  const features = json.features || [];

  const vehicleTypes = [
    { field: "ATV", datesField: "ATV_DATES", label: "ATV" },
    { field: "MOTORCYCLE", datesField: "MOTORCYCLE_DATES", label: "Motorcycle" },
    { field: "HIGHCLRNCE_VEHICLE", datesField: "HIGHCLRNCE_VEHICLE_DATES", label: "High Clearance" },
    { field: "4WD_GT50", datesField: "4WD_GT50_DATES", label: "4WD (>50in)" },
  ];

  const now = new Date();
  const currentMM = now.getMonth() + 1;
  const currentDD = now.getDate();

  function isInSeason(dateRange: string): boolean {
    if (!dateRange || dateRange.trim() === "") return true;
    const match = dateRange.match(/^(\d{2})\/(\d{2})-(\d{2})\/(\d{2})$/);
    if (!match) return true;
    const startM = parseInt(match[1], 10);
    const startD = parseInt(match[2], 10);
    const endM = parseInt(match[3], 10);
    const endD = parseInt(match[4], 10);

    const startVal = startM * 100 + startD;
    const endVal = endM * 100 + endD;
    const nowVal = currentMM * 100 + currentDD;

    if (startVal <= endVal) {
      return nowVal >= startVal && nowVal <= endVal;
    }
    return nowVal >= startVal || nowVal <= endVal;
  }

  const vehicleAccess = vehicleTypes.map((vt) => {
    let openTrails = 0;
    let closedTrails = 0;
    const dateSet = new Set<string>();

    for (const f of features) {
      const allowed = f.attributes?.[vt.field];
      if (allowed && allowed !== "0" && allowed !== "N") {
        const dates = f.attributes?.[vt.datesField] || "";
        if (dates) dateSet.add(dates);
        if (isInSeason(dates)) {
          openTrails++;
        } else {
          closedTrails++;
        }
      }
    }

    const seasonNote = dateSet.size > 0
      ? Array.from(dateSet).slice(0, 2).join(", ")
      : "Year-round";

    return {
      type: vt.label,
      openTrails,
      closedTrails,
      seasonNote,
    };
  }).filter((v) => v.openTrails > 0 || v.closedTrails > 0);

  return { forest: forestName, vehicleAccess };
}

function computeThreatLevel(
  weather: { severity: string },
  disasters: { active: DisasterEntry[]; recentCount: number },
  wildfires: { active: WildfireEntry[] },
  trailSystem?: TrailSystemData,
): "clear" | "advisory" | "watch" | "warning" {
  const ws = weather.severity;

  if (ws === "severe" || ws === "extreme" || wildfires.active.length > 0) {
    return "warning";
  }

  if (trailSystem?.parkAlerts) {
    const hasClosure = trailSystem.parkAlerts.some((a) => a.category === "Closure");
    const hasDanger = trailSystem.parkAlerts.some((a) => a.category === "Danger");
    if (hasDanger) return "warning";
    if (hasClosure) return "watch";
  }

  if (ws === "moderate" || disasters.active.length > 0) {
    return "watch";
  }

  if (ws === "minor" || disasters.recentCount > 0) {
    return "advisory";
  }

  return "clear";
}

async function buildTrailSystemData(
  ts: TrailSystem,
  errors: string[],
): Promise<TrailSystemData> {
  const result: TrailSystemData = {
    id: ts.id,
    name: ts.name,
    landType: ts.landType,
  };

  if (ts.websiteUrl) {
    result.websiteUrl = ts.websiteUrl;
  }

  if (ts.landType === "private") {
    return result;
  }

  const fetches: Promise<void>[] = [];

  if (ts.npsParks) {
    fetches.push(
      fetchNPSAlerts(ts.npsParks)
        .then((alerts) => { result.parkAlerts = alerts; })
        .catch(() => { errors.push("NPS park alerts unavailable"); }),
    );
  }

  if (ts.blmState) {
    fetches.push(
      fetchBLMRouteStatus(ts.blmState, ts.bbox)
        .then((status) => { result.routeStatus = status; })
        .catch(() => { errors.push("BLM route status unavailable"); }),
    );
  }

  if (ts.usfsForest) {
    fetches.push(
      fetchUSFSAccess(ts.usfsForest)
        .then((access) => { result.seasonalAccess = access; })
        .catch(() => { errors.push("USFS seasonal access unavailable"); }),
    );
  }

  await Promise.allSettled(fetches);

  return result;
}

const zipStateMap: Record<string, string> = {};
for (const [key, val] of Object.entries(zipDataRaw)) {
  zipStateMap[key] = (val as { st: string }).st;
}

export async function handleTrailIntel(req: Request, res: Response) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Try again later." });
  }

  const zip = (req.query.zip as string) || "";
  const cleanZip = zip.replace(/\D/g, "").substring(0, 5);
  if (cleanZip.length < 3) {
    return res.status(400).json({ error: "Invalid ZIP code" });
  }

  const zip3 = cleanZip.substring(0, 3);

  const trailId = (req.query.trail as string) || "";
  const trailSystem = trailId ? getTrailSystem(trailId) : undefined;

  const cacheKey = trailId ? `${zip3}:${trailId}` : zip3;

  const coords = zipCoords[zip3];
  const state = zipStateMap[zip3];
  if (!coords || !state) {
    return res.status(404).json({ error: "ZIP code not found" });
  }

  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return res.json(cached.data);
  }

  const errors: string[] = [];

  const [weatherResult, disasterResult, wildfireResult] = await Promise.allSettled([
    fetchNWS(coords.lat, coords.lon),
    fetchFEMA(state),
    fetchWildfires(coords.lat, coords.lon),
  ]);

  const weather = weatherResult.status === "fulfilled"
    ? weatherResult.value
    : (() => { errors.push("Weather data unavailable"); return { alerts: [] as WeatherAlert[], severity: "none" as const }; })();

  const disasters = disasterResult.status === "fulfilled"
    ? disasterResult.value
    : (() => { errors.push("Disaster data unavailable"); return { active: [] as DisasterEntry[], recentCount: 0 }; })();

  const wildfires = wildfireResult.status === "fulfilled"
    ? wildfireResult.value
    : (() => { errors.push("Wildfire data unavailable"); return { active: [] as WildfireEntry[], nearbyCount: 0 }; })();

  let trailSystemData: TrailSystemData | undefined;
  if (trailSystem) {
    trailSystemData = await buildTrailSystemData(trailSystem, errors);
  }

  const overallThreatLevel = computeThreatLevel(weather, disasters, wildfires, trailSystemData);

  const response: TrailIntelResponse = {
    zip: cleanZip,
    state,
    coords: { lat: coords.lat, lon: coords.lon },
    fetchedAt: new Date().toISOString(),
    weather,
    disasters,
    wildfires,
    trailSystem: trailSystemData,
    overallThreatLevel,
    errors,
  };

  cache.set(cacheKey, { data: response, expiresAt: now + CACHE_TTL });

  return res.json(response);
}
