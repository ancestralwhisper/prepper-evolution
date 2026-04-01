import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MapPin, Navigation, AlertTriangle, Clock, CheckSquare, Square,
  Route, ShieldAlert, RotateCcw, ChevronDown, ChevronRight,
  Flame, Waves, Wind, CloudSnow, Zap, Building2, Activity,
  Info, Phone, User, FileText, Car, Plus, Trash2, Flag,
  ClipboardList, BadgeAlert, TriangleAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { trackEvent } from "@/lib/analytics";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import InstallButton from "@/components/tools/InstallButton";
import { GuidedTour } from "./GuidedTour";

// ─── Storage Key ───────────────────────────────────────────────────
const STORAGE_KEY = "pe-evac-planner-v1";

// ─── Tour Steps ────────────────────────────────────────────────────
const EVAC_TOUR = [
  {
    title: "Your Location & Contacts",
    body: "Fill in your home base, destinations, and an out-of-state contact. Use general descriptions — no exact street addresses needed. Your out-of-state contact is critical: in-region phone lines go down, out-of-state lines stay up.",
    anchor: "section-location",
  },
  {
    title: "Pick Your Threat Scenario",
    body: "Select the most likely emergency you're planning for. The tool customizes timing recommendations, choke point warnings, and checklist items based on your threat type — a hurricane evacuation looks very different from a wildfire evacuation.",
    anchor: "section-scenario",
  },
  {
    title: "Map Your Routes",
    body: "Build at least three routes: one primary, two alternates. In a real emergency, your primary route will be jammed or blocked. The alternate routes are what actually get you out. Add notes about choke points, fuel stops, or bridge crossings.",
    anchor: "section-routes",
  },
  {
    title: "Know When to Leave",
    body: "The Go/No-Go Timing card tells you the decision window for your scenario. The most common mistake: waiting too long. Roads jam, stores empty, and conditions deteriorate faster than official orders suggest.",
    anchor: "section-timing",
  },
  {
    title: "Pre-Departure Checklist",
    body: "Work through the checklist before you leave. Scenario-specific items are added automatically based on your threat selection. Check everything off before you pull out of the driveway — you won't have time to turn back.",
    anchor: "section-checklist",
  },
];

// ─── Types ─────────────────────────────────────────────────────────

type ThreatScenario =
  | "hurricane"
  | "wildfire"
  | "flooding"
  | "winter-storm"
  | "civil-unrest"
  | "chemical-hazard"
  | "earthquake"
  | "grid-down"
  | "general";

type RoadType = "highway" | "state-route" | "back-roads" | "mixed";

interface EvacRoute {
  id: string;
  name: string;
  distanceMiles: string;
  driveTimeHrs: string;
  roadType: RoadType;
  notes: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  scenarioSpecific?: ThreatScenario[];
}

interface EvacPlanState {
  homeBase: string;
  primaryDestination: string;
  secondaryDestination: string;
  contactName: string;
  contactPhone: string;
  scenario: ThreatScenario | "";
  routes: EvacRoute[];
  checklist: ChecklistItem[];
}

// ─── Scenario Data ─────────────────────────────────────────────────

interface ScenarioConfig {
  id: ThreatScenario;
  label: string;
  icon: React.ElementType;
  color: string;
  timing: string;
  timingDetail: string;
  urgency: "extreme" | "high" | "moderate";
  chokepointWarnings: string[];
  scenarioChecklistItems: string[];
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: "hurricane",
    label: "Hurricane / Tropical Storm",
    icon: Wind,
    color: "#3B82F6",
    urgency: "high",
    timing: "Leave 48–72 hours before projected landfall",
    timingDetail:
      "Contraflow lanes open 48 hrs out. Roads are gridlocked 24–36 hrs before landfall. Gas stations run dry 48 hrs out. Do not wait for a mandatory order — by then, you're fighting traffic with everyone else.",
    chokepointWarnings: [
      "Highway routes will be gridlocked 24–48 hrs before landfall — most people wait too long",
      "Gas stations along major corridors run out 48 hrs before landfall",
      "Bridges may be closed or restricted during high winds",
      "Contraflow (both lanes going one direction) opens on major evacuation routes — check ahead",
    ],
    scenarioChecklistItems: [
      "Board or shutter windows before leaving",
      "Turn off main utilities (gas, electric, water) at the meter",
      "Fill bathtub and large containers — water systems may fail on return",
      "Unplug major appliances to prevent surge damage",
      "Move outdoor furniture inside or secure it",
    ],
  },
  {
    id: "wildfire",
    label: "Wildfire",
    icon: Flame,
    color: "#EF4444",
    urgency: "extreme",
    timing: "Leave IMMEDIATELY when evacuation order is issued",
    timingDetail:
      "Wildfires move faster than most people expect — up to 14 mph in grass, faster with wind. Do not wait for a \"watch\" to become an \"order.\" At the first evacuation watch, you should already be loading the vehicle. Fire creates its own wind, and roads can be blocked by flames within minutes.",
    chokepointWarnings: [
      "Single-road communities have only one exit — it can be blocked by fire in minutes",
      "Smoke reduces visibility to near zero — have a route memorized, not just on your phone",
      "Back roads through fire-prone areas may be cut off before main highways",
      "Embers travel ahead of the fire line — your escape route can be threatened before the main fire arrives",
    ],
    scenarioChecklistItems: [
      "N95 or P100 respirator masks for everyone in the vehicle",
      "Close all air vents in vehicle and set to recirculate (keeps smoke out)",
      "Wet towels to seal gaps if sheltering briefly in vehicle",
      "Goggles for anyone with eye sensitivity",
      "Notify neighbors if they may not be aware of the order",
    ],
  },
  {
    id: "flooding",
    label: "Flooding / Flash Flood",
    icon: Waves,
    color: "#06B6D4",
    urgency: "high",
    timing: "Leave before rain starts — once roads flood, you are trapped",
    timingDetail:
      "Six inches of moving water can knock a person down. Two feet can carry away most vehicles. Flash floods can rise in minutes with no visible rain at your location. If you see a flooded road, do not attempt it — turn around, don't drown. Leave when a flood watch is issued for your area.",
    chokepointWarnings: [
      "Low-water crossings and bridges flood first — know your alternate crossings in advance",
      "Roads in valleys and near streams become impassable quickly",
      "Underpasses and tunnels fill with water — avoid these routes",
      "Floodwater is almost always deeper than it looks — the road surface is invisible",
    ],
    scenarioChecklistItems: [
      "Move vehicles to highest ground possible before leaving if staying is considered",
      "Identify all bridge and low-water crossing locations on your route",
      "Have a route that avoids all low-lying areas, underpasses, and creek crossings",
      "Keep emergency supplies above floor level in vehicle",
    ],
  },
  {
    id: "civil-unrest",
    label: "Civil Unrest / Urban Instability",
    icon: Building2,
    color: "#F97316",
    urgency: "high",
    timing: "Leave at first signs — not after incidents are confirmed",
    timingDetail:
      "Urban unrest escalates faster than media coverage. By the time events are reported, roadblocks may already exist. Leave when you see early indicators: unusual gathering activity, social media reports of incidents in your area, or police scanner activity. Do not wait for confirmation.",
    chokepointWarnings: [
      "Urban cores and downtown areas become dangerous quickly — avoid entirely",
      "Highway on-ramps near urban areas may be blocked or dangerous",
      "Fuel stations in affected areas will be crowded and potentially unsafe",
      "Back roads through rural areas are safer than major corridors during civil unrest",
    ],
    scenarioChecklistItems: [
      "Remove identifying bumper stickers or visible political markers from vehicle",
      "Travel in groups if possible — single vehicles are more vulnerable",
      "Keep windows up and doors locked at all times",
      "Plan routes that avoid urban centers, major protests, or known incident areas",
      "Have cash — card systems may be unavailable",
      "Avoid wearing clothing that could be perceived as affiliated with any group",
    ],
  },
  {
    id: "chemical-hazard",
    label: "Chemical / Industrial Hazard",
    icon: AlertTriangle,
    color: "#A855F7",
    urgency: "extreme",
    timing: "Leave immediately and cross-wind — NOT downwind",
    timingDetail:
      "Chemical plumes travel with the wind. Your primary objective is to move perpendicular to the wind direction first, then away. Do not drive through visible smoke or discolored air. Listen to emergency broadcasts for shelter-in-place vs. evacuation orders — sometimes staying sealed indoors is safer than driving through the plume.",
    chokepointWarnings: [
      "Wind direction determines which routes are safe — check wind before choosing your route",
      "Downwind routes may be contaminated before you can smell or see the hazard",
      "Emergency response vehicles may block road access near the incident",
      "Bridges and tunnels concentrate chemical vapors — avoid if possible",
    ],
    scenarioChecklistItems: [
      "Check current wind direction before choosing your escape route",
      "N95 or P100 respirators for everyone",
      "Set vehicle HVAC to recirculate (no outside air intake)",
      "Seal vents with tape if sheltering in vehicle",
      "Tune to emergency broadcasts for shelter-in-place vs. evacuation guidance",
      "Remove and bag clothing that may be contaminated before entering destination",
    ],
  },
  {
    id: "earthquake",
    label: "Earthquake",
    icon: Activity,
    color: "#84CC16",
    urgency: "high",
    timing: "Assess before moving — immediate post-quake movement is dangerous",
    timingDetail:
      "Do not evacuate immediately after a major quake. Aftershocks can be as strong as the initial event. Roads may be buckled, bridges damaged, and overpasses collapsed — conditions that aren't visible until you're on them. Wait for official assessment (typically 30–60 min) before attempting road travel. Then use the most direct route to open ground.",
    chokepointWarnings: [
      "Overpasses and elevated highways are the first to fail — inspect visually before using",
      "Bridge decks may be shifted or cracked — cross at low speed and assess each one",
      "Gas lines may be leaking along roadways — avoid open flames and sparks",
      "Debris fields from collapsed structures can block entire road corridors",
    ],
    scenarioChecklistItems: [
      "Do not use elevators — use stairs only",
      "Check for gas leaks before evacuating (smell, sound)",
      "Put on sturdy shoes before moving through debris",
      "Turn off main gas at meter if leaking",
      "Check vehicle for damage before driving",
      "Carry extra water — infrastructure may be damaged for days",
    ],
  },
  {
    id: "winter-storm",
    label: "Winter Storm / Ice Event",
    icon: CloudSnow,
    color: "#67E8F9",
    urgency: "moderate",
    timing: "Leave 24 hours before the storm — roads become impassable fast",
    timingDetail:
      "Ice is the real danger — not snow. A quarter inch of ice shuts down interstate highways in flat terrain. Unlike snow, ice storms have almost no warning after they begin. The window to leave safely closes quickly. Leave the day before projected arrival. If you're caught in a storm, stay on the vehicle and call for help — hypothermia kills people who walk for help.",
    chokepointWarnings: [
      "Mountain passes close with zero warning — sometimes within minutes of first accumulation",
      "Highway bridges and overpasses freeze first and fastest",
      "Back roads may be unplowed for days after a major storm",
      "Power line failures across roads — do not drive over downed lines",
    ],
    scenarioChecklistItems: [
      "Full winter survival kit in vehicle: blankets, hand warmers, extra clothes",
      "Chains or traction devices in vehicle",
      "Ice scraper and brush accessible (not buried in trunk)",
      "Extra wiper fluid rated below 0°F",
      "Shovel in case you need to dig out",
      "Full fuel tank before storm — gas stations close and lines form",
      "Charge all devices to 100% before departure",
    ],
  },
  {
    id: "grid-down",
    label: "Grid-Down / Extended Power Outage",
    icon: Zap,
    color: "#EAB308",
    urgency: "moderate",
    timing: "Decision window is 72 hours post-outage",
    timingDetail:
      "The first 72 hours of a grid-down event feel manageable — it's the week that follows that breaks communities. ATMs go empty within 24–48 hours. Food service shuts down. Fuel pumps fail without power. Medical equipment stops. If you have a destination with power, supplies, or family, the optimal window to leave is before the 72-hour mark — while roads are still civil and fuel is still available.",
    chokepointWarnings: [
      "Fuel stations without backup generators cannot pump fuel — know which stations have generators",
      "Traffic signals are down — treat all intersections as 4-way stops, expect delays",
      "Urban areas deteriorate faster than suburban or rural areas",
      "Hospitals and emergency services will be overwhelmed — don't plan on them",
    ],
    scenarioChecklistItems: [
      "Fill tank before leaving — assume no fuel available along the route",
      "Withdraw cash immediately (ATMs may be empty within 24 hrs)",
      "Pack EcoFlow / power station with full charge",
      "Bring 72-hour water supply minimum",
      "Bring any prescription medications (pharmacies will be closed)",
      "Paper maps — phone navigation depends on cell towers that may lose power",
    ],
  },
  {
    id: "general",
    label: "General Evacuation",
    icon: Navigation,
    color: "#6B7280",
    urgency: "moderate",
    timing: "When in doubt, leave early — you can always turn around",
    timingDetail:
      "If you're uncertain whether to leave, the answer is usually yes. The cost of an unnecessary evacuation is a hotel night and some inconvenience. The cost of waiting too long can be your life. Have a threshold set in advance: if X happens, we leave. Don't negotiate with that threshold in the moment.",
    chokepointWarnings: [
      "Main evacuation corridors will be the most congested — have alternates ready",
      "Cell service degrades during mass evacuations — download offline maps in advance",
      "Fuel supplies along evacuation routes deplete faster than you expect",
    ],
    scenarioChecklistItems: [],
  },
];

// ─── Base Checklist ────────────────────────────────────────────────

const BASE_CHECKLIST_ITEMS: Omit<ChecklistItem, "checked">[] = [
  { id: "bob-loaded", label: "Bug out bags loaded and in the vehicle" },
  { id: "fuel-full", label: "Vehicle fueled — full tank (never leave on less than 3/4)" },
  { id: "cash-out", label: "Cash withdrawn — ATMs go down during emergencies" },
  { id: "phone-charged", label: "All phones charged to 100%" },
  { id: "backup-battery", label: "Power bank / backup battery fully charged" },
  { id: "documents", label: "Important documents: IDs, insurance cards, titles, passports" },
  { id: "meds", label: "Medications — at least 30-day supply if possible" },
  { id: "pets", label: "Pet carriers, food, leashes, vet records" },
  { id: "contact-notified", label: "Out-of-state contact notified: departure time, route, destination" },
  { id: "offline-maps", label: "Offline maps downloaded (Google Maps / Maps.me) — cell service may fail" },
  { id: "water-supply", label: "Water: at least 1 gallon per person for 3 days" },
  { id: "food-supply", label: "Food: easy-prep items for 3 days minimum" },
  { id: "first-aid", label: "First aid kit in the vehicle" },
  { id: "flashlights", label: "Flashlights and extra batteries" },
  { id: "radio", label: "Hand-crank or battery weather radio" },
  { id: "tools", label: "Basic vehicle tools: jumper cables, tire iron, jack, fix-a-flat" },
];

// ─── Default State ─────────────────────────────────────────────────

function defaultState(): EvacPlanState {
  const baseChecklist: ChecklistItem[] = BASE_CHECKLIST_ITEMS.map((item) => ({
    ...item,
    checked: false,
  }));

  return {
    homeBase: "",
    primaryDestination: "",
    secondaryDestination: "",
    contactName: "",
    contactPhone: "",
    scenario: "",
    routes: [
      { id: "route-primary", name: "Primary Route", distanceMiles: "", driveTimeHrs: "", roadType: "highway", notes: "" },
      { id: "route-alt1", name: "Alternate Route 1", distanceMiles: "", driveTimeHrs: "", roadType: "state-route", notes: "" },
      { id: "route-alt2", name: "Alternate Route 2", distanceMiles: "", driveTimeHrs: "", roadType: "back-roads", notes: "" },
    ],
    checklist: baseChecklist,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────

function loadState(): EvacPlanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw) as EvacPlanState;
  } catch {
    return defaultState();
  }
}

function saveState(state: EvacPlanState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable
  }
}

const ROAD_TYPE_LABELS: Record<RoadType, string> = {
  highway: "Highway / Interstate",
  "state-route": "State Route",
  "back-roads": "Back Roads",
  mixed: "Mixed",
};

const URGENCY_COLORS: Record<string, string> = {
  extreme: "#EF4444",
  high: "#F97316",
  moderate: "#EAB308",
};

const URGENCY_LABELS: Record<string, string> = {
  extreme: "LEAVE IMMEDIATELY",
  high: "HIGH URGENCY",
  moderate: "PLAN AHEAD",
};

function getScenario(id: ThreatScenario | ""): ScenarioConfig | null {
  if (!id) return null;
  return SCENARIOS.find((s) => s.id === id) || null;
}

function buildFullChecklist(base: ChecklistItem[], scenario: ThreatScenario | ""): ChecklistItem[] {
  const scenarioCfg = getScenario(scenario);
  if (!scenarioCfg || scenarioCfg.scenarioChecklistItems.length === 0) return base;

  const existingIds = new Set(base.map((i) => i.id));
  const newItems: ChecklistItem[] = scenarioCfg.scenarioChecklistItems
    .map((label, idx) => ({
      id: `${scenario}-item-${idx}`,
      label,
      checked: false,
      scenarioSpecific: [scenario] as ThreatScenario[],
    }))
    .filter((item) => !existingIds.has(item.id));

  const existing = base.filter((i) => !i.scenarioSpecific || i.scenarioSpecific.includes(scenario as ThreatScenario) || !i.scenarioSpecific.length);
  return [...existing.filter((i) => !i.scenarioSpecific || i.scenarioSpecific.length === 0), ...newItems];
}

// ─── Sub-components ────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, id }: { icon: React.ElementType; label: string; id?: string }) {
  return (
    <div id={id} className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <h2 className="text-lg font-extrabold text-foreground">{label}</h2>
    </div>
  );
}

function RouteCard({
  route,
  index,
  onChange,
}: {
  route: EvacRoute;
  index: number;
  onChange: (updated: EvacRoute) => void;
}) {
  const isPrimary = index === 0;
  const borderColor = isPrimary ? "border-primary/50" : "border-border";
  const labelColor = isPrimary ? "text-primary" : "text-muted-foreground";

  return (
    <div className={`bg-card border ${borderColor} rounded-lg p-4 space-y-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Flag className={`w-4 h-4 flex-shrink-0 ${labelColor}`} />
        <span className={`text-xs font-bold uppercase tracking-wide ${labelColor}`}>
          {isPrimary ? "Primary Route" : `Alternate Route ${index}`}
        </span>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1">Route Name</label>
        <input
          type="text"
          value={route.name}
          onChange={(e) => onChange({ ...route, name: e.target.value })}
          placeholder={isPrimary ? "e.g. I-78 West to I-287 South" : "e.g. Route 202 through Chester"}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1">Distance (miles)</label>
          <input
            type="number"
            min="0"
            value={route.distanceMiles}
            onChange={(e) => onChange({ ...route, distanceMiles: e.target.value })}
            placeholder="e.g. 120"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1">Drive Time (hrs)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={route.driveTimeHrs}
            onChange={(e) => onChange({ ...route, driveTimeHrs: e.target.value })}
            placeholder="e.g. 2.5"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1">Road Type</label>
        <select
          value={route.roadType}
          onChange={(e) => onChange({ ...route, roadType: e.target.value as RoadType })}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
        >
          {(Object.keys(ROAD_TYPE_LABELS) as RoadType[]).map((rt) => (
            <option key={rt} value={rt}>{ROAD_TYPE_LABELS[rt]}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1">
          Notes — choke points, fuel stops, bridge crossings
        </label>
        <textarea
          value={route.notes}
          onChange={(e) => onChange({ ...route, notes: e.target.value })}
          placeholder="e.g. Fuel at Pilot in Easton (mile 45). Avoid I-78 interchange — known jam point. Has a low bridge at mile 80 — fine for passenger vehicles."
          rows={3}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors resize-none"
        />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

export default function EvacuationRoutePlanner() {
  useSEO({
    title: "Evacuation Route Planner — Pre-Plan Your Escape Routes",
    description:
      "Plan your evacuation routes before disaster hits. Scenario-specific timing, choke point warnings, and pre-departure checklist for hurricanes, wildfires, flooding, and more.",
    url: "/tools/evacuation-route-planner",
  });

  const [plan, setPlan] = useState<EvacPlanState>(loadState);
  const [showSummary, setShowSummary] = useState(false);
  const [expandedRoutes, setExpandedRoutes] = useState<Set<number>>(new Set([0, 1, 2]));

  // Auto-save on any state change
  useEffect(() => {
    saveState(plan);
  }, [plan]);

  const scenarioCfg = useMemo(() => getScenario(plan.scenario), [plan.scenario]);

  // Build the active checklist with scenario-specific items merged in
  const activeChecklist = useMemo(() => {
    if (!plan.scenario) return plan.checklist;
    return buildFullChecklist(plan.checklist, plan.scenario);
  }, [plan.checklist, plan.scenario]);

  const checkedCount = useMemo(
    () => activeChecklist.filter((i) => i.checked).length,
    [activeChecklist]
  );

  const updateField = useCallback(<K extends keyof EvacPlanState>(key: K, value: EvacPlanState[K]) => {
    setPlan((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleScenarioChange = useCallback((newScenario: ThreatScenario | "") => {
    setPlan((prev) => {
      // Remove old scenario-specific items, add new ones
      const cleanChecklist = prev.checklist.filter((i) => !i.scenarioSpecific || i.scenarioSpecific.length === 0);
      const newCfg = getScenario(newScenario);
      const newScenarioItems: ChecklistItem[] = newCfg
        ? newCfg.scenarioChecklistItems.map((label, idx) => ({
            id: `${newScenario}-item-${idx}`,
            label,
            checked: false,
            scenarioSpecific: [newScenario],
          }))
        : [];
      return {
        ...prev,
        scenario: newScenario,
        checklist: [...cleanChecklist, ...newScenarioItems],
      };
    });
    trackEvent("pe_tool_use", { tool: "evac-route-planner", scenario: newScenario });
  }, []);

  const handleRouteChange = useCallback((index: number, updated: EvacRoute) => {
    setPlan((prev) => {
      const routes = [...prev.routes];
      routes[index] = updated;
      return { ...prev, routes };
    });
  }, []);

  const handleCheckItem = useCallback((id: string) => {
    setPlan((prev) => {
      const checklist = prev.checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      // Handle scenario-specific items that don't exist in base checklist yet
      const existsInBase = prev.checklist.some((i) => i.id === id);
      if (!existsInBase) {
        // It's a scenario-specific item — add it to checklist state so it persists
        const scenarioItem = activeChecklist.find((i) => i.id === id);
        if (scenarioItem) {
          const updated = prev.checklist.some((i) => i.id === id)
            ? prev.checklist.map((item) => item.id === id ? { ...item, checked: !item.checked } : item)
            : [...prev.checklist, { ...scenarioItem, checked: !scenarioItem.checked }];
          return { ...prev, checklist: updated };
        }
      }
      return { ...prev, checklist };
    });
  }, [activeChecklist]);

  const handleReset = useCallback(() => {
    if (window.confirm("Reset your entire evacuation plan? This cannot be undone.")) {
      const fresh = defaultState();
      setPlan(fresh);
      setShowSummary(false);
      trackEvent("pe_tool_use", { tool: "evac-route-planner", action: "reset" });
    }
  }, []);

  const primaryRoute = plan.routes[0];
  const altRoutes = plan.routes.slice(1);

  const planIsComplete = useMemo(() => {
    return (
      plan.homeBase.trim() !== "" &&
      plan.primaryDestination.trim() !== "" &&
      plan.scenario !== "" &&
      primaryRoute.name.trim() !== ""
    );
  }, [plan, primaryRoute]);

  return (
    <div className="py-16 sm:py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">

          {/* ── Header ── */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-primary text-sm font-bold uppercase tracking-widest">Ops Deck</p>
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded">
                <BadgeAlert className="w-3 h-3" />
                BETA
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
              Evacuation Route <span className="text-primary">Planner</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
              Plan your escape routes before a disaster hits — not during. This tool walks you through
              destinations, alternate routes, timing windows, and a scenario-specific pre-departure
              checklist. Based on Skousen Strategic Relocation principles.
            </p>
          </div>

          {/* ── Guided Tour ── */}
          <GuidedTour steps={EVAC_TOUR} toolName="Evacuation Route Planner" />

          {/* ── How It Works ── */}
          <div className="bg-card border-2 border-primary/30 rounded-lg p-5">
            <h3 className="text-base font-extrabold mb-2">How This Tool Works</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No live maps, no GPS tracking — this is pure strategic planning. Fill in your locations,
              select your most likely threat, build your routes, and complete the checklist. Save it.
              Print it. When it's time to go, you should be able to execute this plan without thinking.
              The goal is that decisions are already made before the emergency happens.
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* SECTION 1 — YOUR LOCATION                              */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div id="section-location" className="bg-card border border-border rounded-lg p-5 sm:p-6 space-y-4">
            <SectionHeader icon={MapPin} label="Your Location & Contacts" id="section-location-header" />

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Home Base (general area — no exact address needed)
                </label>
                <input
                  type="text"
                  value={plan.homeBase}
                  onChange={(e) => updateField("homeBase", e.target.value)}
                  placeholder="e.g. Central NJ, Ocean County — Pine Barrens area"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Primary Destination
                  </label>
                  <input
                    type="text"
                    value={plan.primaryDestination}
                    onChange={(e) => updateField("primaryDestination", e.target.value)}
                    placeholder="e.g. Parents' house, central PA"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Secondary Destination (backup)
                  </label>
                  <input
                    type="text"
                    value={plan.secondaryDestination}
                    onChange={(e) => updateField("secondaryDestination", e.target.value)}
                    placeholder="e.g. Cabin, Pocono Mountains, PA"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Out-of-State Emergency Contact</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      In-region phone lines saturate during local emergencies. An out-of-state contact acts as a relay point for your family.
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={plan.contactName}
                      onChange={(e) => updateField("contactName", e.target.value)}
                      placeholder="e.g. Uncle Joe — Ohio"
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={plan.contactPhone}
                      onChange={(e) => updateField("contactPhone", e.target.value)}
                      placeholder="e.g. (614) 555-0182"
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* SECTION 2 — THREAT SCENARIO                            */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div id="section-scenario" className="bg-card border border-border rounded-lg p-5 sm:p-6">
            <SectionHeader icon={ShieldAlert} label="Threat Scenario" />
            <p className="text-xs text-muted-foreground mb-4">
              Select the threat you're planning for. Timing recommendations, choke point warnings, and
              checklist items will update automatically.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {SCENARIOS.map((s) => {
                const Icon = s.icon;
                const isSelected = plan.scenario === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleScenarioChange(s.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-2 bg-card"
                        : "border-border bg-muted/30 hover:bg-muted/60"
                    }`}
                    style={isSelected ? { borderColor: s.color, boxShadow: `0 0 0 1px ${s.color}20` } : {}}
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${s.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    <span className={`text-xs font-bold leading-tight ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* SECTION 3 — ROUTES                                     */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div id="section-routes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Route className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-extrabold text-foreground">Your Routes</h2>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded">
                Plan 3+ routes
              </div>
            </div>

            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your primary route will be jammed or blocked in most real evacuations. Plan your alternates as seriously as your primary.
                  Back road routes are often faster in mass-evacuation scenarios. Add fuel stops and known choke points in the Notes field.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {plan.routes.map((route, index) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  index={index}
                  onChange={(updated) => handleRouteChange(index, updated)}
                />
              ))}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* SECTION 4 — GO/NO-GO TIMING                            */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div id="section-timing">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-extrabold text-foreground">Go / No-Go Timing</h2>
            </div>

            {scenarioCfg ? (
              <motion.div
                key={scenarioCfg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border rounded-lg p-5 space-y-3"
                style={{ borderColor: `${URGENCY_COLORS[scenarioCfg.urgency]}50` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-widest"
                    style={{
                      backgroundColor: `${URGENCY_COLORS[scenarioCfg.urgency]}20`,
                      color: URGENCY_COLORS[scenarioCfg.urgency],
                    }}
                  >
                    {URGENCY_LABELS[scenarioCfg.urgency]}
                  </div>
                </div>

                <div
                  className="text-base font-extrabold"
                  style={{ color: URGENCY_COLORS[scenarioCfg.urgency] }}
                >
                  {scenarioCfg.timing}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {scenarioCfg.timingDetail}
                </p>
              </motion.div>
            ) : (
              <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">
                  Select a threat scenario above to see timing recommendations.
                </p>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* SECTION 5 — CHOKE POINT WARNINGS                       */}
          {/* ═══════════════════════════════════════════════════════ */}
          {scenarioCfg && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-3 mb-1">
                <TriangleAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <h3 className="text-base font-extrabold">Choke Point Warnings</h3>
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  — {scenarioCfg.label}
                </span>
              </div>
              <div className="space-y-2">
                {scenarioCfg.chokepointWarnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground leading-snug">{warning}</span>
                  </div>
                ))}

                {/* Road type specific warnings */}
                {plan.routes[0].roadType === "highway" && plan.scenario === "hurricane" && (
                  <div className="flex items-start gap-2.5 mt-2 pt-2 border-t border-border">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-400 font-bold leading-snug">
                      Your primary route is highway — this will be the most congested route in a hurricane evacuation. Consider building an alternate that uses state routes or back roads.
                    </span>
                  </div>
                )}
                {plan.routes[0].roadType === "back-roads" && plan.scenario === "winter-storm" && (
                  <div className="flex items-start gap-2.5 mt-2 pt-2 border-t border-border">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-400 font-bold leading-snug">
                      Your primary route uses back roads — these are typically the last to be plowed after a winter storm. Consider a state route or highway as primary in winter conditions.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* SECTION 6 — PRE-DEPARTURE CHECKLIST                    */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div id="section-checklist" className="bg-card border border-border rounded-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-extrabold text-foreground">Pre-Departure Checklist</h2>
              </div>
              <div className="text-sm font-bold text-muted-foreground">
                <span className="text-foreground">{checkedCount}</span>/{activeChecklist.length} done
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary transition-all"
                animate={{ width: `${activeChecklist.length > 0 ? (checkedCount / activeChecklist.length) * 100 : 0}%` }}
              />
            </div>

            {/* Base items */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Universal Items
              </p>
              {activeChecklist
                .filter((item) => !item.scenarioSpecific || item.scenarioSpecific.length === 0)
                .map((item) => (
                  <ChecklistRow key={item.id} item={item} onToggle={handleCheckItem} />
                ))}
            </div>

            {/* Scenario-specific items */}
            {scenarioCfg && activeChecklist.some((i) => i.scenarioSpecific && i.scenarioSpecific.length > 0) && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: scenarioCfg.color }}>
                  {scenarioCfg.label} — Specific Items
                </p>
                {activeChecklist
                  .filter((item) => item.scenarioSpecific && item.scenarioSpecific.length > 0)
                  .map((item) => (
                    <ChecklistRow key={item.id} item={item} onToggle={handleCheckItem} accentColor={scenarioCfg.color} />
                  ))}
              </div>
            )}

            {!scenarioCfg && (
              <p className="text-xs text-muted-foreground mt-2">
                Select a threat scenario above to add scenario-specific checklist items.
              </p>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* SECTION 7 — SUMMARY CARD                               */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowSummary((v) => !v);
                trackEvent("pe_tool_use", { tool: "evac-route-planner", action: "view-summary" });
              }}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors ${
                planIsComplete
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {showSummary ? "Hide Plan Summary" : "View Plan Summary"}
              </span>
              {showSummary ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {!planIsComplete && (
              <p className="text-xs text-muted-foreground px-1">
                Fill in your home base, a destination, select a scenario, and name your primary route to generate a summary.
              </p>
            )}

            <AnimatePresence>
              {showSummary && planIsComplete && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <SummaryCard
                    plan={plan}
                    scenarioCfg={scenarioCfg}
                    checkedCount={checkedCount}
                    totalItems={activeChecklist.length}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Reset Button ── */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors px-4 py-2.5 border border-border rounded-lg hover:border-foreground/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Plan
            </button>
            <InstallButton />
          </div>

          {/* ── Social Share ── */}
          <ToolSocialShare
            title="Prepper Evolution Evacuation Route Planner — build your escape plan before disaster hits"
            url="/tools/evacuation-route-planner"
          />

          <DataPrivacyNotice />
          <SupportFooter />
        </div>
      </div>
    </div>
  );
}

// ─── Checklist Row ─────────────────────────────────────────────────

function ChecklistRow({
  item,
  onToggle,
  accentColor,
}: {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  accentColor?: string;
}) {
  return (
    <button
      onClick={() => onToggle(item.id)}
      className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted/40 transition-colors text-left group"
    >
      <div className="flex-shrink-0 mt-0.5">
        {item.checked ? (
          <div
            className="w-4.5 h-4.5 rounded flex items-center justify-center"
            style={{ backgroundColor: accentColor || "rgb(var(--primary))" }}
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <div className="w-4.5 h-4.5 rounded border-2 border-border group-hover:border-primary/50 transition-colors" />
        )}
      </div>
      <span
        className={`text-sm leading-snug transition-colors ${
          item.checked ? "line-through text-muted-foreground" : "text-foreground"
        }`}
      >
        {item.label}
      </span>
    </button>
  );
}

// ─── Summary Card ──────────────────────────────────────────────────

function SummaryCard({
  plan,
  scenarioCfg,
  checkedCount,
  totalItems,
}: {
  plan: EvacPlanState;
  scenarioCfg: ScenarioConfig | null;
  checkedCount: number;
  totalItems: number;
}) {
  const ScenIcon = scenarioCfg?.icon || Navigation;
  const completionPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-base font-extrabold">Evacuation Plan Summary</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Locations */}
        <div className="bg-muted/40 rounded-lg p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Locations</p>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground">Home Base</p>
                <p className="text-sm font-bold text-foreground">{plan.homeBase || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Flag className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground">Primary Destination</p>
                <p className="text-sm font-bold text-foreground">{plan.primaryDestination || "—"}</p>
              </div>
            </div>
            {plan.secondaryDestination && (
              <div className="flex items-start gap-2">
                <Flag className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Backup Destination</p>
                  <p className="text-sm font-bold text-foreground">{plan.secondaryDestination}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scenario + Timing */}
        <div
          className="rounded-lg p-4 space-y-2"
          style={{
            backgroundColor: scenarioCfg ? `${scenarioCfg.color}10` : "rgb(var(--muted) / 0.4)",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: scenarioCfg ? `${scenarioCfg.color}30` : "transparent",
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Threat + Timing</p>
          {scenarioCfg ? (
            <>
              <div className="flex items-center gap-2">
                <ScenIcon className="w-4 h-4 flex-shrink-0" style={{ color: scenarioCfg.color }} />
                <span className="text-sm font-bold" style={{ color: scenarioCfg.color }}>{scenarioCfg.label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">{scenarioCfg.timing}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No scenario selected</p>
          )}
        </div>
      </div>

      {/* Routes */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Routes</p>
        {plan.routes.map((route, i) => (
          route.name.trim() !== "" && (
            <div key={route.id} className="flex items-center gap-3 text-sm">
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded flex-shrink-0 ${
                  i === 0
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i === 0 ? "Primary" : `Alt ${i}`}
              </span>
              <span className="text-foreground font-bold truncate">{route.name}</span>
              {route.distanceMiles && (
                <span className="text-muted-foreground text-xs flex-shrink-0">{route.distanceMiles} mi</span>
              )}
              {route.driveTimeHrs && (
                <span className="text-muted-foreground text-xs flex-shrink-0">{route.driveTimeHrs} hrs</span>
              )}
            </div>
          )
        ))}
      </div>

      {/* Contact + Checklist */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-muted/40 rounded-lg p-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Out-of-State Contact</p>
          <p className="text-sm font-bold text-foreground">{plan.contactName || "—"}</p>
          {plan.contactPhone && (
            <p className="text-sm text-muted-foreground">{plan.contactPhone}</p>
          )}
        </div>

        <div className="bg-muted/40 rounded-lg p-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Checklist</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${completionPct}%`,
                  backgroundColor: completionPct === 100 ? "#22C55E" : completionPct > 50 ? "#F97316" : "#EF4444",
                }}
              />
            </div>
            <span className="text-sm font-bold text-foreground">{checkedCount}/{totalItems}</span>
          </div>
          <p className={`text-xs font-bold ${completionPct === 100 ? "text-green-400" : "text-muted-foreground"}`}>
            {completionPct === 100
              ? "All items checked — you're ready to go"
              : `${totalItems - checkedCount} items remaining`}
          </p>
        </div>
      </div>

      {/* BETA Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
        <BadgeAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-amber-400">BETA:</strong> Routes are for advance planning only. Always follow official evacuation orders from local authorities. Road conditions, bridge closures, and route access change in real time during emergencies.
        </p>
      </div>
    </div>
  );
}
