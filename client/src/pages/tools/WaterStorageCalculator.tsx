import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, Minus, Droplets, Users, Clock, Printer, Share2,
  AlertTriangle, CheckCircle, X, ExternalLink,
  Thermometer, Activity, Baby, Dog, Cat, Heart, Home,
  MessageSquarePlus, Send, Info,
} from "lucide-react";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import PrintQrCode from "@/components/tools/PrintQrCode";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import { trackEvent } from "@/lib/analytics";
import { getHousehold, updateReadiness } from "@/lib/household-store";
import InstallButton from "@/components/tools/InstallButton";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import ZipLookup from "@/components/tools/ZipLookup";
import type { ZipPrefixData } from "@/pages/tools/zip-types";
import {
  usageBreakdown,
  climateZones,
  activityLevels,
  storageContainers,
  filtrationProducts,
  storageTips,
  dataSources,
  livingSituations,
  apartmentWaterTips,
  BASE_GALLONS_PER_PERSON_PER_DAY,
  NURSING_MOTHER_EXTRA_GAL,
  CHILD_UNDER_5_MULTIPLIER,
  PET_DOG_GAL_PER_DAY,
  PET_CAT_GAL_PER_DAY,
  type ClimateZone,
  type ActivityLevel,
  type LivingSituation,
} from "./water-data";
import { useSEO } from "@/hooks/useSEO";
import { GuidedTour } from "./GuidedTour";

const WATER_TOUR = [
  { title: "Your Group", body: "Set how many people you're storing water for. Each additional person adds to your daily water requirement — adults and children have different needs." },
  { title: "Living Situation", body: "Apartment or house changes your container options. The tool filters out tanks and barrels that won't fit in a small space — only containers realistic for your situation show up." },
  { title: "Climate Zone", body: "Enter your ZIP or pick your region. Hot and arid climates need about 1.5x more water per day than temperate zones — your location directly affects the final gallon count." },
  { title: "Special Needs", body: "Check anything that applies: pregnancy, medical conditions, pets. These all increase your daily water need above the standard FEMA baseline of 1 gallon per person per day." },
  { title: "Your Results", body: "The Water Summary shows daily need, total gallons, total weight, and container options filtered for your living situation. These are the numbers to bring to the hardware store." },
];

interface State {
  adults: number;
  children: number;
  nursingMothers: number;
  dogs: number;
  cats: number;
  days: number;
  climate: string;
  activity: string;
  hasFiltration: boolean;
  livingSituation: LivingSituation;
}

const DEFAULT_STATE: State = {
  adults: 2,
  children: 0,
  nursingMothers: 0,
  dogs: 0,
  cats: 0,
  days: 14,
  climate: "temperate",
  activity: "sedentary",
  hasFiltration: false,
  livingSituation: "house",
};

export default function WaterStorageCalculator() {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [showShareToast, setShowShareToast] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);


  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestBrand, setRequestBrand] = useState("");
  const [requestCapacity, setRequestCapacity] = useState("");
  const [requestUrl, setRequestUrl] = useState("");
  const [requestStatus, setRequestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useSEO({
    title: "Water Storage Calculator",
    description: "Calculate how much water your family needs for emergency preparedness. Based on FEMA guidelines with climate, activity, and pet adjustments.",
  });

  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "water-storage" });
    const params = new URLSearchParams(window.location.search);
    const updates: Partial<State> = {};

    const a = params.get("a");
    const c = params.get("c");
    const nm = params.get("nm");
    const dg = params.get("dg");
    const ct = params.get("ct");
    const d = params.get("d");
    const cl = params.get("cl");
    const ac = params.get("ac");
    const f = params.get("f");

    if (a) updates.adults = Math.max(1, Math.min(20, parseInt(a) || 2));
    if (c) updates.children = Math.max(0, Math.min(20, parseInt(c) || 0));
    if (nm) updates.nursingMothers = Math.max(0, Math.min(10, parseInt(nm) || 0));
    if (dg) updates.dogs = Math.max(0, Math.min(10, parseInt(dg) || 0));
    if (ct) updates.cats = Math.max(0, Math.min(10, parseInt(ct) || 0));
    if (d) updates.days = Math.max(1, Math.min(365, parseInt(d) || 14));
    if (cl && climateZones.some((z) => z.id === cl)) updates.climate = cl;
    if (ac && activityLevels.some((l) => l.id === ac)) updates.activity = ac;
    if (f === "1") updates.hasFiltration = true;
    const ls = params.get("ls");
    if (ls && livingSituations.some((l) => l.id === ls)) updates.livingSituation = ls as LivingSituation;

    if (Object.keys(updates).length > 0) {
      setState((prev) => ({ ...prev, ...updates }));
    }

    try {
      const saved = localStorage.getItem("pe-water-calculator");
      if (saved && Object.keys(updates).length === 0) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.adults === "number") {
          setState((prev) => ({ ...prev, ...parsed }));
        }
      } else if (!saved && Object.keys(updates).length === 0) {
        // No saved state — pre-fill from household profile if available
        const household = getHousehold();
        if (household) {
          const p = household.profile;
          setState((prev) => ({
            ...prev,
            adults: p.adults,
            children: p.children,
            nursingMothers: p.nursingMothers,
            dogs: p.dogs,
            cats: p.cats,
            livingSituation: (p.livingSituation === "rural" || p.livingSituation === "mobile") ? "house" : p.livingSituation as LivingSituation,
            climate: p.climate || prev.climate,
            activity: p.activityLevel || prev.activity,
          }));
        }
      }
    } catch { /* ignore */ }

    setInitialized(true);
  }, []);

  // Write computed results back to household readiness
  useEffect(() => {
    if (!initialized || calc.totalGallons <= 0) return;
    updateReadiness("water", {
      totalGallons: calc.totalGallons,
      daysOfSupply: state.days,
      dailyGallons: calc.totalDailyGallons,
      lastCalculated: new Date().toISOString(),
    });
  }, [initialized, calc.totalGallons, calc.totalDailyGallons, state.days]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem("pe-water-calculator", JSON.stringify(state));
    setLastSaved(new Date());
  }, [state, initialized]);

  const set = useCallback(<K extends keyof State>(key: K, value: State[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const inc = useCallback((key: keyof State, max: number) => {
    setState((prev) => ({ ...prev, [key]: Math.min(max, (prev[key] as number) + 1) }));
  }, []);

  const dec = useCallback((key: keyof State, min: number) => {
    setState((prev) => ({ ...prev, [key]: Math.max(min, (prev[key] as number) - 1) }));
  }, []);

  const handleZipResult = useCallback((data: ZipPrefixData | null) => {
    if (data) set("climate", data.cz);
  }, [set]);

  const calc = useMemo(() => {
    const climateZone = climateZones.find((z) => z.id === state.climate) || climateZones[0];
    const activityLevel = activityLevels.find((l) => l.id === state.activity) || activityLevels[0];

    const climateMultiplier = climateZone.multiplier;
    const activityMultiplier = activityLevel.multiplier;
    const combinedMultiplier = climateMultiplier * activityMultiplier;

    const drinkingPerAdult = usageBreakdown[0].gallons * combinedMultiplier;
    const cookingPerAdult = usageBreakdown[1].gallons * combinedMultiplier;
    const hygienePerAdult = usageBreakdown[2].gallons * combinedMultiplier;
    const gallonsPerAdultPerDay = drinkingPerAdult + cookingPerAdult + hygienePerAdult;

    const gallonsPerChildPerDay = gallonsPerAdultPerDay * CHILD_UNDER_5_MULTIPLIER;

    const nursingExtra = state.nursingMothers * NURSING_MOTHER_EXTRA_GAL;

    const dogGallons = state.dogs * PET_DOG_GAL_PER_DAY;
    const catGallons = state.cats * PET_CAT_GAL_PER_DAY;
    const petGallonsPerDay = dogGallons + catGallons;

    const adultDailyTotal = state.adults * gallonsPerAdultPerDay + nursingExtra;
    const childDailyTotal = state.children * gallonsPerChildPerDay;
    const humanDailyTotal = adultDailyTotal + childDailyTotal;
    const totalDailyGallons = humanDailyTotal + petGallonsPerDay;

    const totalGallons = totalDailyGallons * state.days;

    const totalPeople = state.adults + state.children;
    const effectivePeople = state.adults + (state.children * CHILD_UNDER_5_MULTIPLIER);
    const totalDrinking = drinkingPerAdult * effectivePeople * state.days + (nursingExtra * state.days * (usageBreakdown[0].gallons / BASE_GALLONS_PER_PERSON_PER_DAY));
    const totalCooking = cookingPerAdult * effectivePeople * state.days + (nursingExtra * state.days * (usageBreakdown[1].gallons / BASE_GALLONS_PER_PERSON_PER_DAY));
    const totalHygiene = hygienePerAdult * effectivePeople * state.days + (nursingExtra * state.days * (usageBreakdown[2].gallons / BASE_GALLONS_PER_PERSON_PER_DAY));
    const totalPets = petGallonsPerDay * state.days;

    const isApartment = state.livingSituation === "apartment";
    const isRv = state.livingSituation === "rv";
    const filteredContainers = isApartment
      ? storageContainers.filter((c) => c.portable)
      : isRv
        ? storageContainers.filter((c) => c.portable && c.gallons <= 7)
        : storageContainers;

    const containerRecs = filteredContainers
      .map((c) => ({
        ...c,
        needed: Math.ceil(totalGallons / c.gallons),
        coversPct: totalGallons > 0 ? Math.min(100, Math.round((c.gallons / totalGallons) * 100)) : 0,
      }))
      .sort((a, b) => a.needed - b.needed);

    const totalWeightLbs = totalGallons * 8.34;

    return {
      climateZone,
      activityLevel,
      combinedMultiplier,
      gallonsPerAdultPerDay,
      gallonsPerChildPerDay,
      nursingExtra,
      petGallonsPerDay,
      totalDailyGallons,
      totalGallons,
      totalDrinking,
      totalCooking,
      totalHygiene,
      totalPets,
      totalWeightLbs,
      containerRecs,
      totalPeople,
    };
  }, [state]);

  const chartSegments = [
    { label: "Drinking", value: calc.totalDrinking, color: "#06B6D4" },
    { label: "Cooking", value: calc.totalCooking, color: "#22C55E" },
    { label: "Hygiene", value: calc.totalHygiene, color: "#A855F7" },
    { label: "Pets", value: calc.totalPets, color: "#EAB308" },
  ];

  const fmtGal = (g: number) => {
    if (g >= 100) return `${Math.round(g)}`;
    if (g >= 10) return `${g.toFixed(1)}`;
    return `${g.toFixed(2)}`;
  };

  const getShareUrl = useCallback(() => {
    const p = new URLSearchParams();
    p.set("a", String(state.adults));
    if (state.children > 0) p.set("c", String(state.children));
    if (state.nursingMothers > 0) p.set("nm", String(state.nursingMothers));
    if (state.dogs > 0) p.set("dg", String(state.dogs));
    if (state.cats > 0) p.set("ct", String(state.cats));
    p.set("d", String(state.days));
    p.set("cl", state.climate);
    p.set("ac", state.activity);
    if (state.hasFiltration) p.set("f", "1");
    if (state.livingSituation !== "house") p.set("ls", state.livingSituation);
    return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
  }, [state]);

  const shareLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  const handlePrint = () => window.print();

  const submitProductRequest = async () => {
    const name = requestName.trim();
    if (!name || name.length < 2) return;

    setRequestStatus("sending");
    try {
      const res = await fetch("/api/gear-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brand: requestBrand.trim() || undefined,
          weightOz: requestCapacity ? parseFloat(requestCapacity) : undefined,
          category: "water-storage",
          amazonUrl: requestUrl.trim() || undefined,
          source: "water",
        }),
      });

      if (res.ok) {
        setRequestStatus("sent");
        setRequestName("");
        setRequestBrand("");
        setRequestCapacity("");
        setRequestUrl("");
        setTimeout(() => {
          setRequestStatus("idle");
          setShowRequestForm(false);
        }, 4000);
      } else {
        const data = await res.json();
        console.error("Product request failed:", data.error);
        setRequestStatus("error");
        setTimeout(() => setRequestStatus("idle"), 3000);
      }
    } catch {
      setRequestStatus("error");
      setTimeout(() => setRequestStatus("idle"), 3000);
    }
  };

  const Counter = ({ label, icon, value, onDec, onInc, min = 0 }: {
    label: string;
    icon: React.ReactNode;
    value: number;
    onDec: () => void;
    onInc: () => void;
    min?: number;
  }) => (
    <div>
      <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
        {icon} {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={onDec}
          disabled={value <= min}
          className="w-9 h-9 rounded-md flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          data-testid={`button-dec-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center text-lg font-extrabold tabular-nums">{value}</span>
        <button
          onClick={onInc}
          className="w-9 h-9 rounded-md flex items-center justify-center bg-primary text-primary-foreground transition-colors"
          data-testid={`button-inc-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Free Tool</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
            Water Storage <span className="text-primary">Calculator</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Calculate how much water your family needs for emergency preparedness.
            Adjust for climate, activity level, pets, and special needs — based on FEMA guidelines.
          </p>
        </div>

        <div className="print-only">
          <div className="print-header">
            <img src="/pe-badge.png" alt="Prepper Evolution" className="print-logo" />
            <div>
              <h2 className="print-title">Water Storage Calculator Results</h2>
              <p className="print-date">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          <div className="print-summary">
            <div className="print-summary-grid">
              <div>
                <span className="print-label">Total Water Needed</span>
                <span className="print-value">{fmtGal(calc.totalGallons)} gal</span>
                <span className="print-sub">{state.days} days</span>
              </div>
              <div>
                <span className="print-label">Daily Need</span>
                <span className="print-value">{fmtGal(calc.totalDailyGallons)} gal/day</span>
                <span className="print-sub">{calc.totalPeople} {calc.totalPeople === 1 ? "person" : "people"}{(state.dogs + state.cats) > 0 ? ` + ${state.dogs + state.cats} pet${(state.dogs + state.cats) !== 1 ? "s" : ""}` : ""}</span>
              </div>
              <div>
                <span className="print-label">Total Weight</span>
                <span className="print-value">{Math.round(calc.totalWeightLbs)} lbs</span>
                <span className="print-sub">water alone</span>
              </div>
              <div>
                <span className="print-label">Climate / Activity</span>
                <span className="print-value">{calc.climateZone.name}</span>
                <span className="print-sub">{calc.activityLevel.name} ({calc.combinedMultiplier.toFixed(2)}x)</span>
              </div>
            </div>
          </div>

          <table className="print-gear-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Breakdown</th>
                <th style={{ width: "20%", textAlign: "center" }}>Daily (gal)</th>
                <th style={{ width: "20%", textAlign: "center" }}>Total (gal)</th>
                <th style={{ width: "20%", textAlign: "right" }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {chartSegments.filter((s) => s.value > 0).map((s) => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td style={{ textAlign: "center" }}>{fmtGal(s.value / state.days)}</td>
                  <td style={{ textAlign: "center" }}>{fmtGal(s.value)}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    {calc.totalGallons > 0 ? `${((s.value / calc.totalGallons) * 100).toFixed(0)}%` : "0%"}
                  </td>
                </tr>
              ))}
              <tr className="print-total-row">
                <td colSpan={2} style={{ textAlign: "right", fontWeight: 700 }}>TOTAL</td>
                <td style={{ textAlign: "center", fontWeight: 700 }}>{fmtGal(calc.totalGallons)} gal</td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>100%</td>
              </tr>
            </tbody>
          </table>

          <div className="print-missing">
            <h3>Container Options</h3>
            <ul>
              {calc.containerRecs.map((c) => (
                <li key={c.id}>{c.name} ({c.gallons} gal) &mdash; {c.needed} needed</li>
              ))}
            </ul>
          </div>

          <PrintQrCode url={getShareUrl()} />

          <p className="print-footer">
            Generated at prepperevolution.com/tools/water-storage-calculator &mdash; {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="no-print mb-6">
          {/* Tool Title */}
          <div>
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Free Tool</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold">Water Storage <span className="text-primary">Calculator</span></h2>
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 no-print">
          <div className="lg:col-span-2 space-y-6">

            {/* Guided Tour */}
            <GuidedTour steps={WATER_TOUR} toolName="Water Storage walkthrough" />

            {/* How This Tool Works */}
            <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-extrabold mb-3">How This Tool Works</h3>
              <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-3">
                <p>
                  Plug in your group size, climate, and how active everyone is &mdash; we&apos;ll do the math using FEMA and Red Cross guidelines so you don&apos;t have to. The calculator figures out exactly how many gallons you need per day, then recommends containers and purification gear that actually fit your living situation. Apartment with no garage? We&apos;ll skip the 55-gallon drums and suggest stackable options instead.
                </p>
                <p>
                  <strong className="text-foreground">Bottom line:</strong> water is the one thing you absolutely cannot wing. This tool takes the guesswork out so you can store with confidence and stop second-guessing whether you have enough.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wide">Your Group</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Counter
                  label="Adults"
                  icon={<Users className="w-3 h-3 inline mr-1" />}
                  value={state.adults}
                  onDec={() => dec("adults", 1)}
                  onInc={() => inc("adults", 20)}
                  min={1}
                />
                <Counter
                  label="Children (under 5)"
                  icon={<Baby className="w-3 h-3 inline mr-1" />}
                  value={state.children}
                  onDec={() => dec("children", 0)}
                  onInc={() => inc("children", 20)}
                />
                <Counter
                  label="Nursing Mothers"
                  icon={<Heart className="w-3 h-3 inline mr-1" />}
                  value={state.nursingMothers}
                  onDec={() => dec("nursingMothers", 0)}
                  onInc={() => inc("nursingMothers", Math.min(10, state.adults))}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Counter
                  label="Dogs"
                  icon={<Dog className="w-3 h-3 inline mr-1" />}
                  value={state.dogs}
                  onDec={() => dec("dogs", 0)}
                  onInc={() => inc("dogs", 10)}
                />
                <Counter
                  label="Cats"
                  icon={<Cat className="w-3 h-3 inline mr-1" />}
                  value={state.cats}
                  onDec={() => dec("cats", 0)}
                  onInc={() => inc("cats", 10)}
                />
                <Counter
                  label="Days"
                  icon={<Clock className="w-3 h-3 inline mr-1" />}
                  value={state.days}
                  onDec={() => dec("days", 1)}
                  onInc={() => inc("days", 365)}
                  min={1}
                />
              </div>

              {state.nursingMothers > 0 && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-primary shrink-0" />
                  Nursing mothers are counted as adults with an extra 1 quart (0.25 gal) per day per CDC guidelines.
                </p>
              )}
            </div>

            <ZipLookup onResult={handleZipResult} showFields={["climate", "hazard"]} />

            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                <Thermometer className="w-3.5 h-3.5 inline mr-1.5" />
                Climate Zone
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {climateZones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => set("climate", zone.id)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      state.climate === zone.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                    data-testid={`button-climate-${zone.id}`}
                  >
                    <span className="text-sm font-bold block">{zone.name}</span>
                    <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">{zone.multiplier}x water</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3 h-3 text-primary shrink-0" />
                {calc.climateZone.note}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                <Activity className="w-3.5 h-3.5 inline mr-1.5" />
                Activity Level
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activityLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => set("activity", level.id)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      state.activity === level.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                    data-testid={`button-activity-${level.id}`}
                  >
                    <span className="text-sm font-bold block">{level.name}</span>
                    <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">{level.multiplier}x water</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3 h-3 text-primary shrink-0" />
                {calc.activityLevel.note}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                <Home className="w-3.5 h-3.5 inline mr-1.5" />
                Living Situation
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {livingSituations.map((ls) => (
                  <button
                    key={ls.id}
                    onClick={() => set("livingSituation", ls.id)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      state.livingSituation === ls.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                    data-testid={`button-living-${ls.id}`}
                  >
                    <span className="text-sm font-bold block">{ls.name}</span>
                    <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">{ls.desc}</span>
                  </button>
                ))}
              </div>
              {state.livingSituation === "apartment" && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-primary shrink-0" />
                  Showing portable, stackable containers only — 55-gallon drums and large fixed tanks are excluded.
                </p>
              )}
              {state.livingSituation === "rv" && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-primary shrink-0" />
                  Showing portable containers 7 gallons or smaller for mobile storage.
                </p>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Water Filtration / Purification</h3>
                  <p className="text-sm text-muted-foreground">Do you already have a water filter or purification method?</p>
                </div>
                <button
                  onClick={() => set("hasFiltration", !state.hasFiltration)}
                  className={`w-14 h-7 rounded-full transition-colors relative ${
                    state.hasFiltration ? "bg-primary" : "bg-muted border border-border"
                  }`}
                  role="switch"
                  aria-checked={state.hasFiltration}
                  data-testid="switch-filtration"
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      state.hasFiltration ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4">FEMA Baseline: 1 Gallon Per Person Per Day</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {usageBreakdown.map((usage) => (
                  <div key={usage.id} className="flex items-start gap-3">
                    <span
                      className="w-3 h-3 rounded-sm shrink-0 mt-1"
                      style={{ backgroundColor: usage.color }}
                    />
                    <div>
                      <p className="text-sm font-bold">{usage.label}</p>
                      <p className="text-sm text-muted-foreground">{usage.gallons} gal/person/day</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">{usage.note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 pt-3 border-t border-border">
                This is the FEMA minimum baseline. Climate and activity multipliers are applied on top of these values.
                Your current multiplier: <strong className="text-foreground">{calc.combinedMultiplier.toFixed(2)}x</strong> ({calc.climateZone.name} + {calc.activityLevel.name}).
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 no-print">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Community Driven</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This calculator is community-driven. We're constantly adding products based on what
                    real preppers use. If your container or filter isn't listed, let us know.
                  </p>
                </div>
              </div>

              {!showRequestForm ? (
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-primary/5 hover:border-primary/30 transition-colors"
                  data-testid="button-request-product"
                >
                  <MessageSquarePlus className="w-4 h-4 text-primary" />
                  Don't See Your Container or Filter? Request It
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-primary">Request a Product</h4>
                    <button
                      onClick={() => { setShowRequestForm(false); setRequestStatus("idle"); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close request form"
                      data-testid="button-close-request"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {requestStatus === "sent" ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                      <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-green-500">Request Submitted!</p>
                      <p className="text-sm text-muted-foreground mt-1">We'll review it and add it if it fits. Thanks for helping us improve.</p>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={requestName}
                        onChange={(e) => setRequestName(e.target.value)}
                        placeholder="Product name *"
                        maxLength={100}
                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                        aria-label="Product name"
                        data-testid="input-request-name"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={requestBrand}
                          onChange={(e) => setRequestBrand(e.target.value)}
                          placeholder="Brand (optional)"
                          maxLength={50}
                          className="bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                          aria-label="Brand name"
                          data-testid="input-request-brand"
                        />
                        <input
                          type="text"
                          value={requestCapacity}
                          onChange={(e) => setRequestCapacity(e.target.value)}
                          placeholder="Capacity (optional)"
                          maxLength={50}
                          className="bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                          aria-label="Product capacity"
                          data-testid="input-request-capacity"
                        />
                      </div>

                      <input
                        type="text"
                        value={requestUrl}
                        onChange={(e) => setRequestUrl(e.target.value)}
                        placeholder="Amazon link (optional)"
                        maxLength={200}
                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                        aria-label="Amazon product link"
                        data-testid="input-request-url"
                      />

                      <button
                        onClick={submitProductRequest}
                        disabled={!requestName.trim() || requestName.trim().length < 2 || requestStatus === "sending"}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-border disabled:text-muted-foreground text-primary-foreground font-bold py-3 rounded text-sm uppercase tracking-wide transition-colors"
                        data-testid="button-submit-request"
                      >
                        {requestStatus === "sending" ? (
                          "Submitting..."
                        ) : requestStatus === "error" ? (
                          "Something went wrong — try again"
                        ) : (
                          <><Send className="w-4 h-4" /> Submit Request</>
                        )}
                      </button>

                      <p className="text-xs text-muted-foreground/50 text-center">
                        All requests are reviewed before being added. We typically update weekly.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="bg-muted rounded-lg p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Data Sources &amp; References</h3>
              <ul className="space-y-1">
                {dataSources.map((ds) => (
                  <li key={ds.name} className="text-sm text-muted-foreground">
                    {ds.url ? (
                      <a href={ds.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {ds.name}
                      </a>
                    ) : (
                      <span className="font-medium">{ds.name}</span>
                    )}
                    {" "}&mdash; {ds.note}
                  </li>
                ))}
              </ul>
            </div>

            <DataPrivacyNotice />
            <SupportFooter />
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-none space-y-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide">Water Summary</h3>
                  <Droplets className="w-4 h-4 text-primary" />
                </div>

                <div className="flex justify-center mb-2">
                  <DonutChart
                    segments={chartSegments}
                    totalLabel="Total"
                    totalValue={`${fmtGal(calc.totalGallons)} gal`}
                    size={180}
                  />
                </div>
                <ChartLegend segments={chartSegments} />

                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase">Daily Need</p>
                    <p className="text-lg font-extrabold" data-testid="text-daily-need">{fmtGal(calc.totalDailyGallons)} gal</p>
                    <p className="text-sm text-muted-foreground">per day</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase">{state.days}-Day Total</p>
                    <p className="text-lg font-extrabold" data-testid="text-total-gallons">{fmtGal(calc.totalGallons)} gal</p>
                    <p className="text-sm text-muted-foreground">full duration</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase">Total Weight</p>
                    <p className="text-lg font-extrabold text-primary" data-testid="text-total-weight">{Math.round(calc.totalWeightLbs)} lbs</p>
                    <p className="text-sm text-muted-foreground">water only</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase">Multiplier</p>
                    <p className="text-lg font-extrabold text-primary" data-testid="text-multiplier">{calc.combinedMultiplier.toFixed(2)}x</p>
                    <p className="text-sm text-muted-foreground">climate + activity</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <p className="text-sm text-muted-foreground uppercase font-bold">Per-Person Daily</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Adult</span>
                    <span className="font-bold">{fmtGal(calc.gallonsPerAdultPerDay)} gal/day</span>
                  </div>
                  {state.children > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Child (under 5)</span>
                      <span className="font-bold">{fmtGal(calc.gallonsPerChildPerDay)} gal/day</span>
                    </div>
                  )}
                  {state.nursingMothers > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nursing mother bonus</span>
                      <span className="font-bold">+{NURSING_MOTHER_EXTRA_GAL} gal/day each</span>
                    </div>
                  )}
                  {state.dogs > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dog</span>
                      <span className="font-bold">{PET_DOG_GAL_PER_DAY} gal/day each</span>
                    </div>
                  )}
                  {state.cats > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cat</span>
                      <span className="font-bold">{PET_CAT_GAL_PER_DAY} gal/day each</span>
                    </div>
                  )}
                </div>
              </div>

              {calc.totalWeightLbs > 500 && (
                <div className="bg-[#EAB308]/10 border border-[#EAB308]/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#EAB308] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold mb-1">Heavy Load</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(calc.totalWeightLbs)} lbs of water is not portable. Consider a fixed storage
                        location with 55-gallon drums or a WaterBOB, plus a portable filter for resupply from
                        natural sources.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!state.hasFiltration && (
                <div className="bg-[#EAB308]/10 border border-[#EAB308]/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#EAB308] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold mb-1">No Filtration Method</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Stored water can run out. A backup filtration or purification method is critical for
                        extended emergencies. We strongly recommend adding one of these:
                      </p>
                      <div className="space-y-2">
                        {filtrationProducts.map((product) => (
                          <a
                            key={product.id}
                            href={product.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="block p-2.5 bg-background rounded-md hover:bg-primary/5 transition-colors group"
                            data-testid={`link-filtration-${product.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-sm font-medium group-hover:text-primary transition-colors block">
                                  {product.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground block mt-0.5">{product.note}</span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                            </div>
                          </a>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground/50 mt-2">
                        Affiliate links &mdash; we earn a commission at no extra cost to you.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {state.hasFiltration && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold mb-1 text-green-500">Filtration Covered</p>
                      <p className="text-sm text-muted-foreground">
                        You have a backup water purification method. Even if stored water runs out, you can
                        source from natural water and treat it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wide">Container Options</h3>
                </div>
                <div className="space-y-3">
                  {calc.containerRecs.map((container) => (
                    <a
                      key={container.id}
                      href={container.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="block p-3 bg-muted rounded-md hover:bg-primary/5 transition-colors group"
                      data-testid={`link-container-${container.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors block">
                            {container.name}
                          </span>
                          <span className="text-sm text-muted-foreground block mt-0.5">
                            {container.gallons} gal each &mdash; <strong className="text-foreground">{container.needed} needed</strong>
                            {container.portable && <span className="text-primary ml-1">(portable)</span>}
                          </span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{container.note}</p>
                    </a>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/50 mt-3">
                  Affiliate links &mdash; we earn a commission at no extra cost to you.
                </p>
              </div>

              {state.livingSituation === "apartment" && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold mb-1">Apartment Storage Note</p>
                      <p className="text-sm text-muted-foreground">
                        Your {calc.totalGallons.toFixed(0)} gallons weighs approximately{" "}
                        <strong className="text-foreground">{Math.round(calc.totalWeightLbs)} lbs</strong>.
                        Focus on stackable containers (WaterBricks, Aqua-Tainers) that fit in closets
                        and under sinks. Your water heater is also a hidden 30-50 gallon emergency reserve.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide mb-3">
                  {state.livingSituation === "apartment" ? "Apartment Storage Tips" : "Storage Tips"}
                </h3>
                <ul className="space-y-2">
                  {(state.livingSituation === "apartment" ? apartmentWaterTips : storageTips).slice(0, 6).map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-primary shrink-0 mt-0.5">&bull;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-card transition-colors"
                  data-testid="button-print"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={shareLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 text-sm font-bold uppercase tracking-wide transition-colors"
                  data-testid="button-share"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <InstallButton />
              </div>

              {showShareToast && (
                <div className="bg-green-500/15 border border-green-500/30 text-green-500 text-sm rounded-lg p-3 text-center animate-fade-in-up" data-testid="text-share-toast">
                  Link copied to clipboard!
                </div>
              )}

              <ToolSocialShare url={getShareUrl()} toolName="Water Storage Calculator" />

              <div className="bg-muted rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">How We Calculate</h4>
                <ul className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
                  <li>&bull; <strong className="text-foreground">1 gallon per person per day</strong> &mdash; FEMA minimum baseline</li>
                  <li>&bull; <strong className="text-foreground">Climate multiplier</strong> adjusts for heat, humidity, and cold</li>
                  <li>&bull; <strong className="text-foreground">Activity multiplier</strong> increases for physical exertion</li>
                  <li>&bull; <strong className="text-foreground">Children under 5</strong> receive 50% of adult allocation</li>
                  <li>&bull; <strong className="text-foreground">Nursing mothers</strong> get +1 quart per day (CDC)</li>
                  <li>&bull; <strong className="text-foreground">Water weighs 8.34 lbs/gal</strong> &mdash; plan transport accordingly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
