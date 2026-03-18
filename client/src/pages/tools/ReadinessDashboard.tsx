import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "wouter";
import {
  Shield, Package, Backpack, Droplets, Zap, Brain, Radio, Truck, DollarSign,
  AlertTriangle, CheckCircle, Clock, ArrowRight, Printer, TrendingUp,
  ChevronDown, ChevronUp, ExternalLink, Info, XCircle, Award,
  Activity, Target, BarChart3,
} from "lucide-react";
import DonutChart from "@/components/tools/DonutChart";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import { trackEvent } from "@/lib/analytics";
import { useSEO } from "@/hooks/useSEO";
import {
  type DeadstockResult,
  type DeadstockInventory,
  DEADSTOCK_RESULT_KEY,
  DEADSTOCK_INVENTORY_KEY,
} from "./deadstock-types";
import {
  type SkillsAssessmentData,
  type Certification,
  SKILLS_STORAGE_KEY,
  SKILL_DOMAINS,
  calculateReadinessScore,
} from "./skills-data";
import { type VehicleProfile as VehicleProfileData, VEHICLE_PROFILE_KEY } from "./vehicle-types";
import { BARTER_PORTFOLIO_KEY, type BarterPortfolio } from "./barter-types";

// ─── Constants ──────────────────────────────────────────────────────

const DASHBOARD_HISTORY_KEY = "pe-readiness-history";
const DASHBOARD_FINANCIAL_KEY = "pe-readiness-financial";

interface PillarScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  icon: React.ElementType;
  color: string;
  accentBg: string;
  details: string[];
  toolLink: string;
  toolName: string;
  lastUpdated: string | null;
  assessed: boolean;
}

interface QuickAction {
  label: string;
  points: number;
  toolLink: string;
  toolName: string;
  pillarId: string;
}

interface AlertItem {
  type: "critical" | "warning" | "info";
  message: string;
  toolLink?: string;
}

interface HistoryEntry {
  date: string;
  score: number;
  pillarsAssessed: number;
}

interface FinancialSelfReport {
  cashDays: number;
  updatedAt: string;
}

// ─── Pillar Config ──────────────────────────────────────────────────

const PILLAR_CONFIG = [
  { id: "supply", name: "Supply Readiness", icon: Package, color: "#EF4444", accentBg: "bg-red-500/10", toolLink: "/tools/deadstock", toolName: "Deadstock" },
  { id: "gear", name: "Gear Readiness", icon: Backpack, color: "#F97316", accentBg: "bg-orange-500/10", toolLink: "/tools/bug-out-bag-calculator", toolName: "Bug Out Bag Calculator" },
  { id: "water", name: "Water Security", icon: Droplets, color: "#3B82F6", accentBg: "bg-blue-500/10", toolLink: "/tools/deadstock", toolName: "Deadstock" },
  { id: "power", name: "Power Independence", icon: Zap, color: "#EAB308", accentBg: "bg-yellow-500/10", toolLink: "/tools/solar-power-calculator", toolName: "Solar Calculator" },
  { id: "skills", name: "Skills & Training", icon: Brain, color: "#8B5CF6", accentBg: "bg-violet-500/10", toolLink: "/tools/skills-tracker", toolName: "Skills Analyzer" },
  { id: "comms", name: "Communication", icon: Radio, color: "#06B6D4", accentBg: "bg-cyan-500/10", toolLink: "/tools/bug-out-bag-calculator", toolName: "Bug Out Bag Calculator" },
  { id: "vehicle", name: "Vehicle Readiness", icon: Truck, color: "#10B981", accentBg: "bg-emerald-500/10", toolLink: "/tools/vehicle-profile", toolName: "Vehicle Profile" },
  { id: "financial", name: "Financial Resilience", icon: DollarSign, color: "#A855F7", accentBg: "bg-purple-500/10", toolLink: "", toolName: "Self-reported" },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────

function safeJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function daysAgo(isoOrTs: string | number | null): number | null {
  if (!isoOrTs) return null;
  const ts = typeof isoOrTs === "number" ? isoOrTs : new Date(isoOrTs).getTime();
  if (isNaN(ts)) return null;
  return Math.floor((Date.now() - ts) / 86_400_000);
}

function formatDaysAgo(d: number | null): string {
  if (d === null) return "Never";
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function scoreColor(score: number): string {
  if (score <= 25) return "#EF4444";
  if (score <= 50) return "#F97316";
  if (score <= 75) return "#EAB308";
  return "#22C55E";
}

function scoreLabel(score: number): string {
  if (score <= 15) return "Critical";
  if (score <= 25) return "Vulnerable";
  if (score <= 40) return "Underprepared";
  if (score <= 55) return "Developing";
  if (score <= 70) return "Capable";
  if (score <= 85) return "Well Prepared";
  return "Mission Ready";
}

// ─── Scoring Engine ─────────────────────────────────────────────────

function calculatePillarScores(): { pillars: PillarScore[]; alerts: AlertItem[]; quickActions: QuickAction[] } {
  const alerts: AlertItem[] = [];
  const quickActions: QuickAction[] = [];

  // Load all data sources
  const deadstockResult = safeJSON<DeadstockResult>(DEADSTOCK_RESULT_KEY);
  const deadstockInventory = safeJSON<DeadstockInventory>(DEADSTOCK_INVENTORY_KEY);
  const bobData = safeJSON<{ bodyWeight: number; selected: Record<string, number>; customItems: { id: string; name: string; weightOz: number; category: string }[]; timestamp: number }>("pe-bob-calculator");
  const waterData = safeJSON<{ adults: number; children: number; days: number; hasFiltration: boolean; climate: string }>("pe-water-calculator");
  const solarData = safeJSON<{ people: number; days: number; selected: Record<string, { qty: number; hours: number; watts?: number }>; timestamp: number }>("pe-solar-calculator");
  // foodData and kitData are tracked in the Tool Completion section; not scored as separate pillars
  const skillsData = safeJSON<SkillsAssessmentData>(SKILLS_STORAGE_KEY);
  const vehicleProfile = safeJSON<VehicleProfileData>(VEHICLE_PROFILE_KEY);
  const barterPortfolio = safeJSON<BarterPortfolio>(BARTER_PORTFOLIO_KEY);
  const fuelTrip = safeJSON<{ segments: unknown[]; timestamp?: number }>("pe-fuel-range-trip");
  const rigConditions = safeJSON<Record<string, unknown>>("pe-fuel-rig-conditions");
  const powerSystem = safeJSON<Record<string, unknown>>("pe-power-system");
  const financialData = safeJSON<FinancialSelfReport>(DASHBOARD_FINANCIAL_KEY);

  // ── 1. Supply Readiness ──
  const supplyPillar: PillarScore = {
    ...PILLAR_CONFIG[0],
    score: 0, maxScore: 100, details: [], lastUpdated: null, assessed: false,
  };

  if (deadstockResult) {
    supplyPillar.assessed = true;
    const days = deadstockResult.autonomyDays || 0;
    supplyPillar.score = clamp(Math.round((days / 90) * 100), 0, 100);
    supplyPillar.lastUpdated = deadstockResult.calculatedAt;
    supplyPillar.details.push(`${days} days of autonomy`);
    supplyPillar.details.push(`Bottleneck: ${deadstockResult.bottleneck}`);

    if (days < 7) {
      alerts.push({ type: "critical", message: `Your supplies run out in ${days} days. This is your primary bottleneck.`, toolLink: "/tools/deadstock" });
    } else if (days < 14) {
      alerts.push({ type: "warning", message: `${days} days of autonomy is below the 14-day FEMA minimum recommendation.`, toolLink: "/tools/deadstock" });
    }

    // Check expiring items
    if (deadstockInventory) {
      const allItems = [
        ...deadstockInventory.water.items,
        ...deadstockInventory.food.items,
        ...deadstockInventory.medical.items,
        ...deadstockInventory.power.items,
        ...deadstockInventory.comms.items,
        ...deadstockInventory.gear.items,
      ];
      const soon = allItems.filter((i) => {
        if (!i.expirationDate) return false;
        const d = daysAgo(i.expirationDate);
        return d !== null && d < 0 && Math.abs(d) <= 30;
      });
      if (soon.length > 0) {
        alerts.push({ type: "warning", message: `${soon.length} item${soon.length > 1 ? "s" : ""} expiring within 30 days in your Deadstock inventory.`, toolLink: "/tools/deadstock" });
      }
    }

    if (supplyPillar.score < 50) {
      quickActions.push({ label: "Increase your Deadstock supplies to reach 45+ days", points: Math.round((45 - days) / 90 * 100), toolLink: "/tools/deadstock", toolName: "Deadstock", pillarId: "supply" });
    }
  } else {
    supplyPillar.details.push("Not assessed -- complete Deadstock to fill this in");
    quickActions.push({ label: "Complete the Deadstock supply audit", points: 15, toolLink: "/tools/deadstock", toolName: "Deadstock", pillarId: "supply" });
  }

  // ── 2. Gear Readiness ──
  const gearPillar: PillarScore = {
    ...PILLAR_CONFIG[1],
    score: 0, maxScore: 100, details: [], lastUpdated: null, assessed: false,
  };

  if (bobData && Object.keys(bobData.selected).length > 0) {
    gearPillar.assessed = true;
    gearPillar.lastUpdated = bobData.timestamp ? new Date(bobData.timestamp).toISOString() : null;

    const selectedCount = Object.keys(bobData.selected).length + (bobData.customItems?.length || 0);
    // Essential items from gear-data: count is approximately 15-20. Use 18 as baseline.
    const essentialBaseline = 18;
    const itemScore = clamp(Math.round((selectedCount / essentialBaseline) * 60), 0, 60);

    // Weight check: under 20% body weight = good
    const totalOz = Object.values(bobData.selected).reduce((s, q) => s + q * 16, 0); // rough estimate
    const bodyLbs = bobData.bodyWeight || 170;
    const maxBobLbs = bodyLbs * 0.2;
    const currentLbs = totalOz / 16;
    const weightBonus = currentLbs > 0 && currentLbs <= maxBobLbs ? 20 : currentLbs > maxBobLbs ? 5 : 0;

    // Has items from critical categories
    const allSelectedIds = Object.keys(bobData.selected);
    const customCats = (bobData.customItems || []).map((c) => c.category);
    const hasShelter = allSelectedIds.some((id) => ["tent-2p", "tarp", "sol-bivvy", "sleeping-bag", "mylar-blanket", "hammock"].includes(id)) || customCats.includes("shelter");
    const hasWater = allSelectedIds.some((id) => ["sawyer-squeeze", "nalgene", "lifestraw", "aquatabs", "sillcock-key", "water-bottle"].includes(id)) || customCats.includes("water");
    const hasFirstAid = allSelectedIds.some((id) => ["ifak", "boo-boo", "trauma", "first-aid"].includes(id)) || customCats.includes("first-aid");
    const categoryBonus = (hasShelter ? 7 : 0) + (hasWater ? 7 : 0) + (hasFirstAid ? 6 : 0);

    gearPillar.score = clamp(itemScore + weightBonus + categoryBonus, 0, 100);
    gearPillar.details.push(`${selectedCount} items selected`);
    if (currentLbs > 0) gearPillar.details.push(`Bag weight: ${currentLbs.toFixed(1)} lbs`);
    if (currentLbs > maxBobLbs) {
      gearPillar.details.push("Warning: Over 20% body weight limit");
      alerts.push({ type: "warning", message: `Your BOB weighs ${currentLbs.toFixed(1)} lbs, exceeding your ${maxBobLbs.toFixed(0)} lb limit.`, toolLink: "/tools/bug-out-bag-calculator" });
    }

    if (gearPillar.score < 60) {
      quickActions.push({ label: "Add missing essential items to your Bug Out Bag", points: 10, toolLink: "/tools/bug-out-bag-calculator", toolName: "BOB Calculator", pillarId: "gear" });
    }
  } else {
    gearPillar.details.push("Not assessed -- complete the BOB Calculator to fill this in");
    quickActions.push({ label: "Build your Bug Out Bag in the BOB Calculator", points: 12, toolLink: "/tools/bug-out-bag-calculator", toolName: "BOB Calculator", pillarId: "gear" });
  }

  // ── 3. Water Security ──
  const waterPillar: PillarScore = {
    ...PILLAR_CONFIG[2],
    score: 0, maxScore: 100, details: [], lastUpdated: null, assessed: false,
  };

  if (deadstockInventory?.water || waterData) {
    waterPillar.assessed = true;
    let waterScore = 0;

    if (deadstockResult?.categoryResults) {
      const waterCat = deadstockResult.categoryResults.find((c) => c.category === "water");
      if (waterCat) {
        waterScore = clamp(Math.round((waterCat.days / 14) * 80), 0, 80);
        waterPillar.details.push(`${waterCat.days} days of water supply`);
        waterPillar.lastUpdated = deadstockResult.calculatedAt;

        if (waterCat.days < 3) {
          alerts.push({ type: "critical", message: `Water supply: only ${waterCat.days} days. The Rule of 3: you cannot survive more than 3 days without water.`, toolLink: "/tools/deadstock" });
        }
      }
    } else if (waterData) {
      // Water calculator gives us planning data but not actual stored gallons
      waterScore = 30; // Planned but not inventoried
      waterPillar.details.push("Water plan created (not inventoried in Deadstock)");
      waterPillar.lastUpdated = null;
    }

    // Filter bonus
    const hasFilter = deadstockInventory?.water?.hasFilter || waterData?.hasFiltration || false;
    const hasPurification = deadstockInventory?.water?.hasPurification || false;
    if (hasFilter) { waterScore += 12; waterPillar.details.push("Water filter available"); }
    if (hasPurification) { waterScore += 8; waterPillar.details.push("Water purification available"); }

    waterPillar.score = clamp(waterScore, 0, 100);

    if (waterPillar.score < 50 && !hasFilter) {
      quickActions.push({ label: "Add a water filter to boost your water security", points: 12, toolLink: "/tools/bug-out-bag-calculator", toolName: "BOB Calculator", pillarId: "water" });
    }
  } else {
    waterPillar.details.push("Not assessed -- complete Deadstock or Water Calculator");
    quickActions.push({ label: "Set up water tracking in Deadstock", points: 14, toolLink: "/tools/deadstock", toolName: "Deadstock", pillarId: "water" });
  }

  // ── 4. Power Independence ──
  const powerPillar: PillarScore = {
    ...PILLAR_CONFIG[3],
    score: 0, maxScore: 100, details: [], lastUpdated: null, assessed: false,
  };

  const hasPowerData = deadstockInventory?.power || solarData || powerSystem;
  if (hasPowerData) {
    powerPillar.assessed = true;
    let powerScore = 0;

    if (deadstockInventory?.power) {
      if (deadstockInventory.power.hasSolar) { powerScore += 25; powerPillar.details.push("Solar panels available"); }
      if (deadstockInventory.power.batteryBankWh > 0) {
        powerScore += 25;
        powerPillar.details.push(`Battery bank: ${deadstockInventory.power.batteryBankWh} Wh`);
      }
      if (deadstockInventory.power.hasGenerator) {
        powerScore += 20;
        powerPillar.details.push("Generator available");
        if (deadstockInventory.power.generatorFuelGallons > 0) {
          powerPillar.details.push(`Generator fuel: ${deadstockInventory.power.generatorFuelGallons} gal`);
        }
      }
      powerPillar.lastUpdated = deadstockResult?.calculatedAt || null;
    }

    if (solarData && Object.keys(solarData.selected).length > 0) {
      if (!deadstockInventory?.power?.hasSolar) powerScore += 15;
      powerPillar.details.push("Solar system planned");
      powerPillar.lastUpdated = powerPillar.lastUpdated || (solarData.timestamp ? new Date(solarData.timestamp).toISOString() : null);
    }

    if (powerSystem) {
      powerScore += 10;
      powerPillar.details.push("12V power system designed");
    }

    // Fuel reserves from vehicle profile
    if (vehicleProfile?.fuel?.auxTankGal && vehicleProfile.fuel.auxTankGal > 0) {
      powerScore += 5;
      powerPillar.details.push(`Aux fuel tank: ${vehicleProfile.fuel.auxTankGal} gal`);
    }

    powerPillar.score = clamp(powerScore, 0, 100);

    if (powerScore < 50) {
      quickActions.push({ label: "Plan a solar power setup in the Solar Calculator", points: 10, toolLink: "/tools/solar-power-calculator", toolName: "Solar Calculator", pillarId: "power" });
    }
  } else {
    powerPillar.details.push("Not assessed -- complete Deadstock power section or Solar Calculator");
    quickActions.push({ label: "Set up power tracking in Deadstock or Solar Calculator", points: 12, toolLink: "/tools/solar-power-calculator", toolName: "Solar Calculator", pillarId: "power" });
  }

  // ── 5. Skills & Training ──
  const skillsPillar: PillarScore = {
    ...PILLAR_CONFIG[4],
    score: 0, maxScore: 100, details: [], lastUpdated: null, assessed: false,
  };

  if (skillsData && Object.keys(skillsData.ratings).length > 0) {
    skillsPillar.assessed = true;
    skillsPillar.score = calculateReadinessScore(skillsData.ratings);
    skillsPillar.lastUpdated = skillsData.lastAssessed;
    const ratedCount = Object.keys(skillsData.ratings).length;
    skillsPillar.details.push(`${ratedCount} skills rated`);
    skillsPillar.details.push(`Readiness score: ${skillsPillar.score}/100`);

    // Check for critical zero-rated skills
    const zeroSkills = Object.entries(skillsData.ratings).filter(([, v]) => v === 0);
    if (zeroSkills.length > 0) {
      skillsPillar.details.push(`${zeroSkills.length} skills rated "No Knowledge"`);
    }

    // Certifications
    if (skillsData.certifications && skillsData.certifications.length > 0) {
      skillsPillar.details.push(`${skillsData.certifications.length} certifications tracked`);

      // Check for expiring certifications
      const expiring = skillsData.certifications.filter((c: Certification) => {
        if (!c.expirationDate) return false;
        const d = daysAgo(c.expirationDate);
        return d !== null && d < 0 && Math.abs(d) <= 90;
      });
      const expired = skillsData.certifications.filter((c: Certification) => {
        if (!c.expirationDate) return false;
        const d = daysAgo(c.expirationDate);
        return d !== null && d >= 0;
      });

      if (expired.length > 0) {
        alerts.push({ type: "critical", message: `${expired.length} certification${expired.length > 1 ? "s have" : " has"} expired. Renew to maintain your readiness.`, toolLink: "/tools/skills-tracker" });
      }
      if (expiring.length > 0) {
        alerts.push({ type: "warning", message: `${expiring.length} certification${expiring.length > 1 ? "s" : ""} expiring within 90 days.`, toolLink: "/tools/skills-tracker" });
      }
    }

    // Check stale data
    const daysOld = daysAgo(skillsData.lastAssessed);
    if (daysOld !== null && daysOld > 90) {
      alerts.push({ type: "info", message: "Skills assessment is over 90 days old. Consider re-evaluating.", toolLink: "/tools/skills-tracker" });
    }

    if (skillsPillar.score < 50) {
      quickActions.push({ label: "Rate more skills in the Skills Analyzer to improve accuracy", points: 8, toolLink: "/tools/skills-tracker", toolName: "Skills Analyzer", pillarId: "skills" });
    }
  } else {
    skillsPillar.details.push("Not assessed -- complete the Skills Analyzer to fill this in");
    quickActions.push({ label: "Complete the Skills & Knowledge Gap Analyzer", points: 13, toolLink: "/tools/skills-tracker", toolName: "Skills Analyzer", pillarId: "skills" });
  }

  // ── 6. Communication ──
  const commsPillar: PillarScore = {
    ...PILLAR_CONFIG[5],
    score: 0, maxScore: 100, details: [], lastUpdated: null, assessed: false,
  };

  {
    let commsScore = 0;
    let hasCommsData = false;

    // BOB communication items
    if (bobData) {
      const selectedIds = Object.keys(bobData.selected);
      const radioIds = ["baofeng", "midland-gxt", "midland-cb", "crank-radio", "retekess-v112", "fiio-rr11", "prunus-j908"];
      const satIds = ["zoleo"];
      const hasRadio = selectedIds.some((id) => radioIds.includes(id));
      const hasSatellite = selectedIds.some((id) => satIds.includes(id));
      const hasWhistle = selectedIds.includes("whistle");
      const hasSignalMirror = selectedIds.includes("signal-mirror");

      if (hasRadio) { commsScore += 35; commsPillar.details.push("Radio in BOB"); hasCommsData = true; }
      if (hasSatellite) { commsScore += 25; commsPillar.details.push("Satellite communicator in BOB"); hasCommsData = true; }
      if (hasWhistle) { commsScore += 5; hasCommsData = true; }
      if (hasSignalMirror) { commsScore += 5; hasCommsData = true; }

      commsPillar.lastUpdated = bobData.timestamp ? new Date(bobData.timestamp).toISOString() : null;
    }

    // Deadstock comms inventory
    if (deadstockInventory?.comms) {
      if (deadstockInventory.comms.hasHamGmrs) { commsScore += 20; commsPillar.details.push("HAM/GMRS radio available"); hasCommsData = true; }
      if (deadstockInventory.comms.hasAmFm) { commsScore += 5; commsPillar.details.push("AM/FM radio available"); hasCommsData = true; }
      commsPillar.lastUpdated = commsPillar.lastUpdated || deadstockResult?.calculatedAt || null;
    }

    // Vehicle radio
    if (vehicleProfile?.electrical?.radioType && vehicleProfile.electrical.radioType !== "none") {
      commsScore += 10;
      commsPillar.details.push(`Vehicle radio: ${vehicleProfile.electrical.radioType.toUpperCase()}`);
      hasCommsData = true;
    }

    // Skills: nav-comm domain
    if (skillsData) {
      const navCommSkillIds = SKILL_DOMAINS.find((d) => d.id === "nav-comm")?.skills.map((s) => s.id) || [];
      const navCommRated = navCommSkillIds.filter((id) => skillsData.ratings[id] !== undefined);
      const avgCommsSkill = navCommRated.length > 0
        ? navCommRated.reduce((s, id) => s + (skillsData.ratings[id] || 0), 0) / navCommRated.length
        : 0;
      if (avgCommsSkill >= 2) { commsScore += 10; }
    }

    commsPillar.assessed = hasCommsData;
    commsPillar.score = clamp(commsScore, 0, 100);

    if (!hasCommsData) {
      commsPillar.details.push("Not assessed -- add communication gear to your BOB or Deadstock");
      quickActions.push({ label: "Add a radio to your Bug Out Bag", points: 8, toolLink: "/tools/bug-out-bag-calculator", toolName: "BOB Calculator", pillarId: "comms" });
    } else if (commsScore < 40) {
      quickActions.push({ label: "Add a satellite communicator or HAM radio", points: 8, toolLink: "/tools/bug-out-bag-calculator", toolName: "BOB Calculator", pillarId: "comms" });
    }
  }

  // ── 7. Vehicle Readiness ──
  const vehiclePillar: PillarScore = {
    ...PILLAR_CONFIG[6],
    score: 0, maxScore: 100, details: [], lastUpdated: null, assessed: false,
  };

  if (vehicleProfile) {
    vehiclePillar.assessed = true;
    vehiclePillar.lastUpdated = vehicleProfile.updatedAt ? new Date(vehicleProfile.updatedAt).toISOString() : null;
    let vScore = 0;

    // Profile complete
    vScore += 40;
    vehiclePillar.details.push(`${vehicleProfile.year} ${vehicleProfile.make} ${vehicleProfile.model}`);

    // Payload check
    const gvwr = vehicleProfile.gvwrLbs || 0;
    const curb = vehicleProfile.curbWeightLbs || 0;
    const payload = gvwr - curb;
    if (payload > 0) {
      vScore += 15;
      vehiclePillar.details.push(`Payload capacity: ${payload.toLocaleString()} lbs`);
    }

    // Fuel range
    const mpg = vehicleProfile.mpgCombined || 0;
    const fuelGal = vehicleProfile.fuelTankGal || 0;
    const auxGal = vehicleProfile.fuel?.auxTankGal || 0;
    const extraCans = vehicleProfile.fuel?.extraCansGal || 0;
    const totalFuel = fuelGal + auxGal + extraCans;
    const rangeMiles = mpg * totalFuel;
    if (rangeMiles > 200) {
      vScore += 15;
      vehiclePillar.details.push(`Estimated range: ${Math.round(rangeMiles)} miles`);
    } else if (rangeMiles > 0) {
      vScore += 5;
      vehiclePillar.details.push(`Limited range: ${Math.round(rangeMiles)} miles`);
      alerts.push({ type: "warning", message: `Vehicle range is only ${Math.round(rangeMiles)} miles. Consider extra fuel capacity.`, toolLink: "/tools/vehicle-profile" });
    }

    // Recovery gear
    const recovery = vehicleProfile.recovery;
    if (recovery) {
      const recoveryCount = [
        recovery.kinetic, recovery.straps, recovery.shackles, recovery.treeProtector,
        recovery.snatchBlock, recovery.highlift, recovery.tractionBoards,
        recovery.tirePlug, recovery.compressor, recovery.spareTire,
      ].filter(Boolean).length;
      if (recoveryCount >= 5) {
        vScore += 15;
        vehiclePillar.details.push(`${recoveryCount} recovery items`);
      } else if (recoveryCount > 0) {
        vScore += 5;
        vehiclePillar.details.push(`${recoveryCount} recovery items (consider adding more)`);
      }
    }

    // Fuel planner data
    if (fuelTrip || rigConditions) {
      vScore += 10;
      vehiclePillar.details.push("Fuel route planned");
    }

    vehiclePillar.score = clamp(vScore, 0, 100);

    if (vehiclePillar.score < 60) {
      quickActions.push({ label: "Add recovery gear to your Vehicle Profile", points: 8, toolLink: "/tools/vehicle-profile", toolName: "Vehicle Profile", pillarId: "vehicle" });
    }
  } else {
    vehiclePillar.details.push("Not assessed -- complete the Vehicle Profile to fill this in");
    quickActions.push({ label: "Build your Vehicle Profile", points: 10, toolLink: "/tools/vehicle-profile", toolName: "Vehicle Profile", pillarId: "vehicle" });
  }

  // ── 8. Financial Resilience ──
  const financialPillar: PillarScore = {
    ...PILLAR_CONFIG[7],
    score: 0, maxScore: 100, details: [], lastUpdated: null, assessed: false,
  };

  if (financialData && financialData.cashDays > 0) {
    financialPillar.assessed = true;
    financialPillar.lastUpdated = financialData.updatedAt;
    const cashDays = financialData.cashDays;
    financialPillar.score = clamp(Math.round((cashDays / 90) * 100), 0, 100);
    financialPillar.details.push(`${cashDays} days of cash/barter reserves`);

    if (cashDays < 14) {
      alerts.push({ type: "warning", message: `Only ${cashDays} days of financial reserves. Consider building a cash emergency fund.` });
    }
  } else if (barterPortfolio && (barterPortfolio.goods.length > 0 || barterPortfolio.skills.length > 0)) {
    financialPillar.assessed = true;
    financialPillar.lastUpdated = barterPortfolio.updatedAt;
    const barterScore = clamp(Math.round(((barterPortfolio.goods.length + barterPortfolio.skills.length) / 20) * 60), 0, 60);
    financialPillar.score = barterScore;
    financialPillar.details.push(`${barterPortfolio.goods.length} barter goods stockpiled`);
    financialPillar.details.push(`${barterPortfolio.skills.length} tradeable skills`);
  } else {
    financialPillar.details.push("Self-report your cash reserves below, or build a barter portfolio");
    quickActions.push({ label: "Build a barter portfolio in the Trade Value Estimator", points: 8, toolLink: "/tools/barter-value-estimator", toolName: "Barter Estimator", pillarId: "financial" });
  }

  const pillars: PillarScore[] = [
    supplyPillar, gearPillar, waterPillar, powerPillar,
    skillsPillar, commsPillar, vehiclePillar, financialPillar,
  ];

  // Sort quick actions by highest potential impact
  quickActions.sort((a, b) => b.points - a.points);

  return { pillars, alerts, quickActions: quickActions.slice(0, 5) };
}

// ─── Tool Completion Tracker Data ───────────────────────────────────

interface ToolStatus {
  name: string;
  link: string;
  storageKey: string;
  status: "completed" | "stale" | "not-started";
  daysOld: number | null;
}

function getToolStatuses(): ToolStatus[] {
  const tools = [
    { name: "Deadstock", link: "/tools/deadstock", key: DEADSTOCK_RESULT_KEY },
    { name: "Bug Out Bag Calculator", link: "/tools/bug-out-bag-calculator", key: "pe-bob-calculator" },
    { name: "Water Storage Calculator", link: "/tools/water-storage-calculator", key: "pe-water-calculator" },
    { name: "Food Storage Calculator", link: "/tools/food-storage-calculator", key: "pe-food-calculator" },
    { name: "Solar Power Calculator", link: "/tools/solar-power-calculator", key: "pe-solar-calculator" },
    { name: "72-Hour Kit Builder", link: "/tools/72-hour-kit-builder", key: "pe-72hr-kit" },
    { name: "Vehicle Profile", link: "/tools/vehicle-profile", key: VEHICLE_PROFILE_KEY },
    { name: "Fuel & Range Planner", link: "/tools/fuel-range-planner", key: "pe-fuel-range-trip" },
    { name: "Skills Analyzer", link: "/tools/skills-tracker", key: SKILLS_STORAGE_KEY },
    { name: "Barter Estimator", link: "/tools/barter-value-estimator", key: BARTER_PORTFOLIO_KEY },
    { name: "Power System Builder", link: "/tools/power-system-builder", key: "pe-power-system" },
  ];

  return tools.map((t) => {
    const raw = localStorage.getItem(t.key);
    if (!raw) return { name: t.name, link: t.link, storageKey: t.key, status: "not-started" as const, daysOld: null };
    try {
      const parsed = JSON.parse(raw);
      const ts = parsed.timestamp || parsed.calculatedAt || parsed.updatedAt || parsed.lastAssessed || parsed.createdAt;
      const d = daysAgo(ts);
      const isStale = d !== null && d > 90;
      return { name: t.name, link: t.link, storageKey: t.key, status: isStale ? "stale" as const : "completed" as const, daysOld: d };
    } catch {
      return { name: t.name, link: t.link, storageKey: t.key, status: "completed" as const, daysOld: null };
    }
  });
}

// ─── Animated Counter ───────────────────────────────────────────────

function AnimatedScore({ target, color, size = "large" }: { target: number; color: string; size?: "large" | "small" }) {
  const [current, setCurrent] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [hasAnimated, target]);

  const textSize = size === "large" ? "text-7xl sm:text-8xl" : "text-4xl";

  return (
    <div ref={ref} className={`font-black tabular-nums ${textSize}`} style={{ color }}>
      {current}
    </div>
  );
}

// ─── Pillar Card Component ──────────────────────────────────────────

function PillarCard({ pillar, expanded, onToggle }: { pillar: PillarScore; expanded: boolean; onToggle: () => void }) {
  const Icon = pillar.icon;
  const pct = pillar.assessed ? pillar.score : 0;
  const barColor = pillar.assessed ? pillar.color : "#4B5563";

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all hover:border-border/80">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg ${pillar.accentBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" style={{ color: pillar.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm">{pillar.name}</h3>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tabular-nums" style={{ color: pillar.assessed ? scoreColor(pct) : "#6B7280" }}>
                  {pillar.assessed ? pct : "--"}
                </span>
                {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">
                {pillar.assessed ? scoreLabel(pct) : "Not assessed"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {formatDaysAgo(daysAgo(pillar.lastUpdated))}
              </span>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-border pt-3 space-y-2">
          {pillar.details.map((d, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: pillar.color }} />
              {d}
            </div>
          ))}
          {pillar.toolLink && (
            <Link
              href={pillar.toolLink}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary mt-2 hover:underline"
              onClick={() => trackEvent("pe_tool_view", { tool: "readiness-dashboard-link" })}
            >
              Open {pillar.toolName} <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sparkline Component ────────────────────────────────────────────

function Sparkline({ data }: { data: HistoryEntry[] }) {
  if (data.length < 2) return null;

  const width = 280;
  const height = 60;
  const padding = 4;
  const max = Math.max(...data.map((d) => d.score), 100);
  const min = Math.min(...data.map((d) => d.score), 0);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.score - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");

  const latest = data[data.length - 1].score;
  const first = data[0].score;
  const change = latest - first;
  const changeColor = change > 0 ? "#22C55E" : change < 0 ? "#EF4444" : "#6B7280";

  return (
    <div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
          const y = height - padding - ((d.score - min) / range) * (height - 2 * padding);
          return <circle key={i} cx={x} cy={y} r={2.5} fill="#3B82F6" />;
        })}
      </svg>
      <div className="flex items-center gap-2 mt-1">
        <TrendingUp className="w-3.5 h-3.5" style={{ color: changeColor }} />
        <span className="text-xs font-bold" style={{ color: changeColor }}>
          {change > 0 ? "+" : ""}{change} points
        </span>
        <span className="text-xs text-muted-foreground">
          over {data.length} check-ins
        </span>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ───────────────────────────────────────

export default function ReadinessDashboard() {
  useSEO({
    title: "Unified Readiness Dashboard",
    description: "See your comprehensive preparedness score across 8 readiness categories. Your Deadstock, BOB, water, power, skills, comms, vehicle, and financial data in one command center.",
    url: "https://prepperevolution.com/tools/readiness-dashboard",
  });

  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [cashDaysInput, setCashDaysInput] = useState("");
  const [showShareCard, setShowShareCard] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Calculate everything
  const { pillars, alerts, quickActions } = useMemo(() => calculatePillarScores(), []);
  const toolStatuses = useMemo(() => getToolStatuses(), []);

  // Overall score: weighted average of assessed pillars, with penalty for unassessed
  const overallScore = useMemo(() => {
    const assessed = pillars.filter((p) => p.assessed);
    if (assessed.length === 0) return 0;

    // Pillar weights (some matter more than others)
    const weights: Record<string, number> = {
      supply: 1.5,
      water: 1.5,
      gear: 1.0,
      power: 1.0,
      skills: 1.2,
      comms: 0.8,
      vehicle: 0.8,
      financial: 0.7,
    };

    const assessedWeightedSum = assessed.reduce((sum, p) => sum + p.score * (weights[p.id] || 1), 0);
    const assessedTotalWeight = assessed.reduce((sum, p) => sum + (weights[p.id] || 1), 0);
    const assessedAvg = assessedWeightedSum / assessedTotalWeight;

    // Penalty: each unassessed pillar reduces the score
    const unassessedCount = pillars.length - assessed.length;
    const coverageFactor = assessed.length / pillars.length;
    // If only 2/8 pillars are assessed, even a perfect score is capped at ~35
    const penalizedScore = assessedAvg * (0.4 + 0.6 * coverageFactor);

    return Math.round(clamp(penalizedScore, 0, 100));
  }, [pillars]);

  const assessedCount = pillars.filter((p) => p.assessed).length;

  // History tracking
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "readiness-dashboard" });

    // Load history
    const saved = safeJSON<HistoryEntry[]>(DASHBOARD_HISTORY_KEY) || [];

    // Add today's entry if not already present
    const today = new Date().toISOString().split("T")[0];
    const alreadyRecorded = saved.some((h) => h.date === today);
    if (!alreadyRecorded && assessedCount > 0) {
      const newEntry: HistoryEntry = { date: today, score: overallScore, pillarsAssessed: assessedCount };
      const updated = [...saved, newEntry].slice(-30); // Keep last 30 entries
      localStorage.setItem(DASHBOARD_HISTORY_KEY, JSON.stringify(updated));
      setHistory(updated);
    } else {
      setHistory(saved);
    }

    // Load financial self-report
    const fin = safeJSON<FinancialSelfReport>(DASHBOARD_FINANCIAL_KEY);
    if (fin) setCashDaysInput(String(fin.cashDays));
  }, [overallScore, assessedCount]);

  const handleSaveFinancial = useCallback(() => {
    const days = parseInt(cashDaysInput);
    if (isNaN(days) || days < 0) return;
    const data: FinancialSelfReport = { cashDays: days, updatedAt: new Date().toISOString() };
    localStorage.setItem(DASHBOARD_FINANCIAL_KEY, JSON.stringify(data));
    window.location.reload();
  }, [cashDaysInput]);

  const handlePrint = useCallback(() => {
    trackEvent("pe_pdf_exported", { tool: "readiness-dashboard" });
    window.print();
  }, []);

  // Donut segments
  const donutSegments = pillars.map((p) => ({
    label: p.name,
    value: p.assessed ? Math.max(p.score, 1) : 0,
    color: p.color,
  }));

  const completedTools = toolStatuses.filter((t) => t.status === "completed").length;
  const staleTools = toolStatuses.filter((t) => t.status === "stale");
  const notStartedTools = toolStatuses.filter((t) => t.status === "not-started");

  // Stale tool alerts
  if (staleTools.length > 0) {
    staleTools.forEach((t) => {
      if (!alerts.find((a) => a.message.includes(t.name))) {
        alerts.push({ type: "info", message: `${t.name} data is over 90 days old. Consider updating.`, toolLink: t.link });
      }
    });
  }

  return (
    <div className="bg-background">
      {/* ─── Hero Score ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-background via-card to-background">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Unified Readiness Dashboard
            </span>
          </div>

          <div className="mb-4">
            <AnimatedScore target={overallScore} color={scoreColor(overallScore)} />
          </div>

          <div className="text-xl sm:text-2xl font-bold mb-2" style={{ color: scoreColor(overallScore) }}>
            {scoreLabel(overallScore)}
          </div>

          <p className="text-muted-foreground text-sm mb-4">
            Based on {assessedCount} of {pillars.length} readiness categories assessed
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last updated: {new Date().toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              {completedTools}/{toolStatuses.length} tools completed
            </span>
          </div>

          {assessedCount === 0 && (
            <div className="mt-8 bg-muted border border-border rounded-lg p-6 max-w-lg mx-auto text-left">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold mb-1">No tools completed yet</p>
                  <p className="text-sm text-muted-foreground">
                    This dashboard reads data from the other PE tools. Complete any tool below to start building your readiness profile.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">

        {/* ─── Critical Alerts ─────────────────────────────────────── */}
        {alerts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-extrabold">Critical Alerts</h2>
              <span className="text-xs font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                {alerts.filter((a) => a.type === "critical").length || alerts.length}
              </span>
            </div>
            <div className="space-y-2">
              {alerts
                .sort((a, b) => {
                  const order = { critical: 0, warning: 1, info: 2 };
                  return order[a.type] - order[b.type];
                })
                .map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg border p-3 sm:p-4 ${
                    alert.type === "critical" ? "bg-red-500/5 border-red-500/30" :
                    alert.type === "warning" ? "bg-yellow-500/5 border-yellow-500/30" :
                    "bg-blue-500/5 border-blue-500/30"
                  }`}
                >
                  {alert.type === "critical" ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> :
                   alert.type === "warning" ? <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" /> :
                   <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{alert.message}</p>
                  </div>
                  {alert.toolLink && (
                    <Link href={alert.toolLink} className="text-xs font-bold text-primary flex-shrink-0 hover:underline">
                      Fix <ArrowRight className="w-3 h-3 inline" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Category Breakdown ─────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-extrabold">8 Readiness Pillars</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {pillars.map((p) => (
              <PillarCard
                key={p.id}
                pillar={p}
                expanded={expandedPillar === p.id}
                onToggle={() => setExpandedPillar(expandedPillar === p.id ? null : p.id)}
              />
            ))}
          </div>
        </section>

        {/* ─── Donut Chart + Quick Actions side by side ────────────── */}
        <section className="grid lg:grid-cols-2 gap-8">
          {/* Donut */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-6">
              Readiness Breakdown
            </h2>
            <div className="flex flex-col items-center">
              <DonutChart
                segments={donutSegments}
                totalLabel="Readiness"
                totalValue={`${overallScore}`}
                size={220}
              />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-6 w-full max-w-sm">
                {pillars.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground truncate text-xs">{p.name}</span>
                    <span className="text-foreground font-bold ml-auto text-xs">
                      {p.assessed ? p.score : "--"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Improve Your Score
              </h2>
            </div>
            {quickActions.length > 0 ? (
              <div className="space-y-3">
                {quickActions.map((action, i) => (
                  <Link
                    key={i}
                    href={action.toolLink}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                    onClick={() => trackEvent("pe_tool_view", { tool: `readiness-action-${action.pillarId}` })}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-primary">+{action.points}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{action.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.toolName}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="text-sm font-bold">All pillars well covered</p>
                <p className="text-xs text-muted-foreground mt-1">Keep your tools updated to maintain your score.</p>
              </div>
            )}
          </div>
        </section>

        {/* ─── Financial Self-Report ──────────────────────────────── */}
        <section className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-purple-500" />
            <h2 className="text-sm font-extrabold">Financial Resilience (Self-Report)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            How many days could your household sustain itself financially without income? Include cash on hand, accessible savings, and liquid assets.
            This stays on your device -- we never see it.
          </p>
          <div className="flex items-end gap-3">
            <div>
              <label htmlFor="cash-days" className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1">
                Days of financial reserves
              </label>
              <input
                id="cash-days"
                type="number"
                min={0}
                max={365}
                value={cashDaysInput}
                onChange={(e) => setCashDaysInput(e.target.value)}
                className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm font-bold"
                placeholder="e.g. 30"
              />
            </div>
            <button
              onClick={handleSaveFinancial}
              className="bg-primary text-primary-foreground font-bold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Save
            </button>
          </div>
        </section>

        {/* ─── Tool Completion Tracker ────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-extrabold">Tool Completion</h2>
            <span className="text-xs text-muted-foreground font-bold">
              {completedTools}/{toolStatuses.length} completed
            </span>
          </div>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {toolStatuses.map((t) => (
              <Link
                key={t.storageKey}
                href={t.link}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
              >
                {t.status === "completed" ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : t.status === "stale" ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                )}
                <span className={`text-sm flex-1 ${t.status === "not-started" ? "text-muted-foreground" : "font-medium"}`}>
                  {t.name}
                </span>
                {t.status === "completed" && t.daysOld !== null && (
                  <span className="text-[10px] text-muted-foreground">{formatDaysAgo(t.daysOld)}</span>
                )}
                {t.status === "stale" && (
                  <span className="text-[10px] text-yellow-500 font-bold">Stale</span>
                )}
                {t.status === "not-started" && (
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Start</span>
                )}
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
          {notStartedTools.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              Complete all tools to unlock your full readiness profile. Each tool adds data that improves score accuracy.
            </p>
          )}
        </section>

        {/* ─── Readiness Over Time ────────────────────────────────── */}
        {history.length >= 2 && (
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-extrabold">Readiness Over Time</h2>
            </div>
            <Sparkline data={history} />
            <p className="text-xs text-muted-foreground mt-3">
              Score is recorded each time you visit this dashboard. Keep completing and updating tools to watch your readiness grow.
            </p>
          </section>
        )}

        {/* ─── Shareable Readiness Card ───────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-extrabold">Your Readiness Card</h2>
          </div>

          <div
            ref={shareCardRef}
            className="bg-gradient-to-br from-card via-card to-muted border-2 border-primary/30 rounded-xl p-6 sm:p-8 max-w-xl print-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Prepper Evolution</p>
                <p className="text-lg font-extrabold">Readiness Report</p>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div>
                <div className="text-5xl font-black" style={{ color: scoreColor(overallScore) }}>
                  {overallScore}
                </div>
                <div className="text-xs font-bold mt-1" style={{ color: scoreColor(overallScore) }}>
                  {scoreLabel(overallScore)}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {pillars.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-16 truncate">{p.name.split(" ")[0]}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.assessed ? p.score : 0}%`, backgroundColor: p.color }}
                      />
                    </div>
                    <span className="text-[10px] font-bold w-6 text-right">{p.assessed ? p.score : "--"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-muted-foreground border-t border-border pt-3">
              <span>{assessedCount}/{pillars.length} categories assessed</span>
              <span>{new Date().toLocaleDateString()}</span>
              <span className="ml-auto font-bold text-primary">prepperevolution.com</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 no-print">
            <button
              onClick={() => {
                setShowShareCard(!showShareCard);
                trackEvent("pe_share_clicked", { tool: "readiness-dashboard", platform: "share_card" });
              }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
              Share Your Readiness
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-muted border border-border font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>

          {showShareCard && (
            <div className="mt-4 max-w-xl no-print">
              <ToolSocialShare
                url="https://prepperevolution.com/tools/readiness-dashboard"
                toolName="Readiness Dashboard"
              />
            </div>
          )}
        </section>

        {/* ─── SEO Content ────────────────────────────────────────── */}
        <section className="max-w-3xl space-y-8 print-hide">
          <div>
            <h2 className="text-xl font-extrabold mb-3">What is a Readiness Score?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your Readiness Score is a single number (0-100) that measures how prepared your household is to handle an emergency without outside help. It pulls data from every PE tool you have completed -- Deadstock supply tracking, Bug Out Bag inventory, water and power planning, skills assessment, vehicle configuration, and financial reserves. The more tools you complete, the more accurate your score becomes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold mb-3">How We Calculate Your Preparedness Level</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The dashboard evaluates 8 categories of preparedness, each scored independently from 0 to 100:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong className="text-foreground">Supply Readiness</strong> -- Days of autonomy from Deadstock, benchmarked against 90 days.</li>
              <li><strong className="text-foreground">Gear Readiness</strong> -- BOB items selected relative to essential minimums, weight compliance, and category coverage.</li>
              <li><strong className="text-foreground">Water Security</strong> -- Days of stored water (14-day FEMA benchmark), plus filtration and purification capability.</li>
              <li><strong className="text-foreground">Power Independence</strong> -- Solar panels, battery banks, generators, and fuel reserves.</li>
              <li><strong className="text-foreground">Skills & Training</strong> -- Self-assessed skill ratings weighted by importance, from the Skills Analyzer.</li>
              <li><strong className="text-foreground">Communication</strong> -- Radios, satellite messengers, and signaling equipment across all tool inventories.</li>
              <li><strong className="text-foreground">Vehicle Readiness</strong> -- Profile completion, payload capacity, range, and recovery gear.</li>
              <li><strong className="text-foreground">Financial Resilience</strong> -- Cash reserves and barter portfolio value.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Your overall score is a weighted average of assessed pillars with a coverage penalty -- you cannot score 100 without completing all 8 categories. This prevents inflated scores from a single strong area masking critical gaps.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold mb-3">Why Track Readiness Over Time</h2>
            <p className="text-muted-foreground leading-relaxed">
              Preparedness is not a one-time checkbox. Supplies expire, skills degrade without practice, financial situations change, and gear wears out. This dashboard tracks your score over time so you can see whether your readiness is improving, plateauing, or declining. Each visit records a data point. Over weeks and months, the trend line tells you more than any single number.
            </p>
          </div>
        </section>

        {/* ─── Privacy + Support ──────────────────────────────────── */}
        <div className="space-y-6 no-print">
          <DataPrivacyNotice />
          <SupportFooter />
        </div>
      </div>

      {/* ─── Print Styles ─────────────────────────────────────────── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-hide { display: none !important; }
          .print-card { break-inside: avoid; border: 2px solid #333; }
          body { background: white !important; color: black !important; }
          * { color-adjust: exact; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
