import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import {
  Users, Baby, Dog, Cat, Home, MapPin, Activity, Heart,
  CheckCircle, ArrowRight, Droplets, UtensilsCrossed, Zap,
  Backpack, ClipboardList, RefreshCw, Shield, Clock,
} from "lucide-react";
import ZipLookup from "@/components/tools/ZipLookup";
import type { ZipPrefixData } from "@/pages/tools/zip-types";
import { useSEO } from "@/hooks/useSEO";
import {
  getHousehold,
  saveHousehold,
  countConnectedTools,
  staleness,
  HOUSEHOLD_KEY,
} from "@/lib/household-store";
import type { HouseholdProfile, PEHousehold } from "@/lib/household-types";
import { DEFAULT_PROFILE, DEFAULT_HOUSEHOLD } from "@/lib/household-types";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";

// ─── Readiness tile data ──────────────────────────────────────────
const READINESS_TILES = [
  { key: "water",  label: "Water",    icon: Droplets,       slug: "water-storage-calculator",  color: "text-blue-500"    },
  { key: "food",   label: "Food",     icon: UtensilsCrossed,slug: "food-storage-calculator",   color: "text-orange-400"  },
  { key: "bugout", label: "Bug-Out",  icon: Backpack,       slug: "bug-out-bag-calculator",    color: "text-primary"     },
  { key: "kit72",  label: "72-Hr Kit",icon: ClipboardList,  slug: "72-hour-kit-builder",       color: "text-emerald-500" },
  { key: "solar",  label: "Power",    icon: Zap,            slug: "solar-power-calculator",    color: "text-yellow-400"  },
] as const;

// ─── Section wrapper ──────────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Counter row ──────────────────────────────────────────────────
function Counter({ label, value, onChange, min = 0, max = 20, hint }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <span className="text-sm font-medium">{label}</span>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg border border-border bg-muted hover:bg-muted/70 text-lg font-bold flex items-center justify-center transition-colors"
          aria-label={`Decrease ${label}`}
        >
          –
        </button>
        <span className="w-6 text-center font-bold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg border border-border bg-muted hover:bg-muted/70 text-lg font-bold flex items-center justify-center transition-colors"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────
function Toggle({ label, checked, onChange, hint }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        checked ? "border-primary/40 bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"
      }`}
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => e.key === " " && onChange(!checked)}
    >
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium">{label}</span>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors ${
        checked ? "bg-primary border-primary" : "border-border bg-background"
      }`}>
        {checked && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
      </div>
    </div>
  );
}

// ─── Select row ───────────────────────────────────────────────────
function SelectField({ label, value, onChange, options, hint }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────
export default function HouseholdSetup() {
  useSEO({
    title: "Household Profile | Prepper Evolution",
    description: "Set up your household profile once and power all your preparedness calculators automatically.",
  });

  const [profile, setProfile] = useState<HouseholdProfile>(DEFAULT_PROFILE);
  const [readiness, setReadiness] = useState<PEHousehold["readiness"]>({});
  const [lastUpdated, setLastUpdated] = useState("");
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load on mount
  useEffect(() => {
    const existing = getHousehold();
    if (existing) {
      setProfile(existing.profile);
      setReadiness(existing.readiness);
      setLastUpdated(existing.lastProfileUpdate);
    }
    setInitialized(true);
  }, []);

  // Auto-save on profile change
  useEffect(() => {
    if (!initialized) return;
    const existing = getHousehold() ?? { ...DEFAULT_HOUSEHOLD };
    const updated: PEHousehold = {
      ...existing,
      profile,
      lastProfileUpdate: new Date().toISOString(),
    };
    saveHousehold(updated);
    setLastUpdated(updated.lastProfileUpdate);
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [profile, initialized]);

  const update = useCallback(<K extends keyof HouseholdProfile>(key: K, value: HouseholdProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleZipResult = useCallback((data: ZipPrefixData | null) => {
    if (data) {
      setProfile((prev) => ({
        ...prev,
        region: data.sr,
        kitRegion: data.kr,
        climate: data.cz,
        primaryHazard: data.hz,
      }));
    }
  }, []);

  // Load ZIP from pe-zip on mount if profile zipCode is empty
  useEffect(() => {
    if (!initialized) return;
    if (profile.zipCode) return;
    const saved = localStorage.getItem("pe-zip");
    if (saved && saved.length === 5) {
      setProfile((prev) => ({ ...prev, zipCode: saved }));
    }
  }, [initialized, profile.zipCode]);

  const connectedCount = countConnectedTools({ ...DEFAULT_HOUSEHOLD, readiness });
  const totalPeople = profile.adults + profile.children + profile.elderly;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Ops Deck</p>
              <h1 className="text-2xl font-extrabold">Household Profile</h1>
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Fill this in once. Every calculator pulls from it automatically — no re-entering the same household size, living situation, or location across five different tools.
          </p>

          {/* Status bar */}
          {lastUpdated && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Last updated {staleness(lastUpdated)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Powering {connectedCount}/5 calculators
              </div>
              {saved && (
                <div className="flex items-center gap-1 text-xs text-primary font-medium animate-fade-in">
                  <CheckCircle className="w-3 h-3" /> Saved
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ─── People ─────────────────────────────────────────── */}
        <Section title="Your People" icon={Users}>
          <Counter label="Adults (18+)" value={profile.adults} onChange={(v) => update("adults", v)} min={1} />
          <Counter label="Children" value={profile.children} onChange={(v) => update("children", v)} hint="Under 18" />
          <Counter label="Elderly (65+)" value={profile.elderly} onChange={(v) => update("elderly", v)} />
          <Counter label="Nursing Mothers" value={profile.nursingMothers} onChange={(v) => update("nursingMothers", v)} hint="Increases daily water requirements" />
          {totalPeople > 0 && (
            <p className="text-xs text-muted-foreground pt-1 border-t border-border">
              Total household: <strong>{totalPeople} {totalPeople === 1 ? "person" : "people"}</strong>
            </p>
          )}
        </Section>

        {/* ─── Pets ───────────────────────────────────────────── */}
        <Section title="Pets" icon={Dog}>
          <Counter label="Dogs" value={profile.dogs} onChange={(v) => update("dogs", v)} max={10} />
          <Counter label="Cats" value={profile.cats} onChange={(v) => update("cats", v)} max={10} />
        </Section>

        {/* ─── Home ───────────────────────────────────────────── */}
        <Section title="Your Home" icon={Home}>
          <SelectField
            label="Living Situation"
            value={profile.livingSituation}
            onChange={(v) => update("livingSituation", v as HouseholdProfile["livingSituation"])}
            options={[
              { value: "house",     label: "House / Townhouse" },
              { value: "apartment", label: "Apartment / Condo" },
              { value: "rural",     label: "Rural / Farm" },
              { value: "mobile",    label: "Mobile / RV" },
            ]}
            hint="Affects container options and storage capacity"
          />
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Location</label>
            <p className="text-xs text-muted-foreground">Adjusts water needs, solar estimates, and kit recommendations for your region</p>
            <ZipLookup onResult={handleZipResult} showFields={["climate", "region", "hazard"]} />
          </div>
          {profile.region && (
            <p className="text-xs text-muted-foreground">
              Region locked: <strong className="text-foreground capitalize">{profile.region}</strong> · Climate: <strong className="text-foreground capitalize">{profile.climate?.replace(/-/g, " ")}</strong>
            </p>
          )}
        </Section>

        {/* ─── Special Needs ──────────────────────────────────── */}
        <Section title="Special Needs" icon={Heart}>
          <p className="text-xs text-muted-foreground -mt-1">Affects power planning and evacuation complexity.</p>
          <div className="space-y-2">
            <Toggle
              label="CPAP / BiPAP machine"
              checked={profile.hasCPAP}
              onChange={(v) => update("hasCPAP", v)}
              hint="Adds powered device to solar and power planning"
            />
            <Toggle
              label="Refrigerated medications"
              checked={profile.hasRefrigeratedMeds}
              onChange={(v) => update("hasRefrigeratedMeds", v)}
              hint="Flags fridge-dependent medical needs in power planning"
            />
            <Toggle
              label="Mobility limitations"
              checked={profile.hasMobilityLimitations}
              onChange={(v) => update("hasMobilityLimitations", v)}
              hint="Adjusts evacuation complexity and kit recommendations"
            />
          </div>
        </Section>

        {/* ─── Activity & Budget ──────────────────────────────── */}
        <Section title="Activity & Budget" icon={Activity}>
          <SelectField
            label="Typical Activity Level"
            value={profile.activityLevel}
            onChange={(v) => update("activityLevel", v as HouseholdProfile["activityLevel"])}
            options={[
              { value: "sedentary", label: "Sedentary — office / low-mobility household" },
              { value: "moderate",  label: "Moderate — active adults, outdoor work" },
              { value: "heavy",     label: "Heavy — labor-intensive, high exertion" },
            ]}
            hint="Scales calorie and water requirements up"
          />
          <SelectField
            label="Prep Budget Tier"
            value={profile.budgetTier}
            onChange={(v) => update("budgetTier", v as HouseholdProfile["budgetTier"])}
            options={[
              { value: "starter",  label: "Starter — building from scratch, budget-conscious" },
              { value: "standard", label: "Standard — solid prep, quality gear" },
              { value: "premium",  label: "Premium — best-in-class, no compromise" },
            ]}
            hint="Guides gear recommendations across kit builders"
          />
        </Section>

        {/* ─── Readiness Summary ──────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">Calculator Coverage</h2>
            <span className="text-xs text-muted-foreground">{connectedCount}/5 run</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {READINESS_TILES.map(({ key, label, icon: Icon, slug, color }) => {
              const data = readiness[key as keyof typeof readiness];
              const hasData = !!data;
              return (
                <Link key={key} href={`/tools/${slug}`}>
                  <div className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer ${
                    hasData
                      ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                      : "border-border bg-muted/30 hover:bg-muted/50 opacity-60"
                  }`}>
                    <Icon className={`w-5 h-5 ${hasData ? color : "text-muted-foreground"}`} />
                    <span className="text-[10px] font-bold text-center leading-tight">{label}</span>
                    {hasData && data && "lastCalculated" in data && (
                      <span className="text-[9px] text-muted-foreground text-center leading-tight">
                        {staleness(data.lastCalculated)}
                      </span>
                    )}
                    {!hasData && (
                      <span className="text-[9px] text-muted-foreground">Not run</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          {connectedCount < 5 && (
            <p className="text-xs text-muted-foreground mt-3">
              Run a calculator to store its results here — SITREP scores improve with each one connected.
            </p>
          )}
          {connectedCount === 5 && (
            <div className="flex items-center gap-2 mt-3 text-xs text-emerald-500 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              All 5 calculators connected — SITREP running on real data
            </div>
          )}
        </div>

        {/* ─── CTA Row ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/tools/sitrep"
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 px-5 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Run SITREP <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tools"
            className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border font-medium py-3 px-5 rounded-xl hover:bg-muted/70 transition-colors text-sm"
          >
            All Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <DataPrivacyNotice />
      </div>
    </div>
  );
}
