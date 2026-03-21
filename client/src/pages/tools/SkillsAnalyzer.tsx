import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "wouter";
import {
  Brain, ChevronDown, ChevronRight, ChevronUp, ArrowRight,
  Droplets, UtensilsCrossed, Home, Heart, Compass, Shield, Zap, Truck,
  BarChart3, Target, AlertTriangle, Trophy, BookOpen, Clock,
  ExternalLink, Printer, RotateCcw, Check, Info, Star,
  Video, BookOpenCheck, GraduationCap,
  Users, UserPlus, Award, Calendar, TrendingUp, Link2, Siren,
  Plus, Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { trackEvent } from "@/lib/analytics";
import DonutChart from "@/components/tools/DonutChart";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import PrintQrCode from "@/components/tools/PrintQrCode";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import {
  SKILL_DOMAINS,
  SKILLS_STORAGE_KEY,
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_COLORS,
  PREDEFINED_CERTIFICATIONS,
  SCENARIO_DOMAIN_MAP,
  DOMAIN_BARTER_VALUES,
  calculateReadinessScore,
  calculateDomainScores,
  getCriticalGaps,
  getStrongestSkills,
  getTrainingRoadmap,
  countRatedSkills,
  getTotalSkillCount,
  getUnmetPrerequisites,
  getPrerequisiteSuggestions,
  getWeakestScenarios,
  generateTrainingPlan,
  type SkillLevel,
  type Skill,
  type SkillDomain,
  type SkillsAssessmentData,
  type LearningResource,
  type FamilyMember,
  type Certification,
} from "./skills-data";

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  Droplets,
  UtensilsCrossed,
  Home,
  Heart,
  Compass,
  Shield,
  Zap,
  Truck,
};

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  article: BookOpenCheck,
  video: Video,
  course: GraduationCap,
  book: BookOpen,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  advanced: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  expert: "bg-red-500/20 text-red-400 border-red-500/30",
};

const MIN_SKILLS_FOR_RESULTS = 10;

type View = "landing" | "assess" | "results";
type ResultTab = "overview" | "gaps" | "roadmap" | "strengths" | "scenarios" | "family" | "certs" | "training" | "barter" | "dependencies";

// ─── LEVEL BUTTON GROUP ─────────────────────────────────────────────
function LevelSelector({
  value,
  onChange,
}: {
  value: SkillLevel | undefined;
  onChange: (level: SkillLevel) => void;
}) {
  const levels: SkillLevel[] = [0, 1, 2, 3, 4, 5];

  return (
    <div className="flex gap-1.5 flex-wrap">
      {levels.map((level) => {
        const isSelected = value === level;
        return (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`
              px-2.5 py-1.5 rounded-md text-sm font-semibold border transition-all
              ${isSelected
                ? "border-transparent text-white shadow-sm scale-105"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }
            `}
            style={isSelected ? { backgroundColor: SKILL_LEVEL_COLORS[level] } : undefined}
            title={SKILL_LEVEL_LABELS[level]}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
}

// ─── SKILL CARD ─────────────────────────────────────────────────────
function SkillCard({
  skill,
  domain,
  rating,
  onRate,
  onOpenDetail,
  ratings,
}: {
  skill: Skill;
  domain: SkillDomain;
  rating: SkillLevel | undefined;
  onRate: (level: SkillLevel) => void;
  onOpenDetail: () => void;
  ratings: Record<string, SkillLevel>;
}) {
  const unmetPrereqs = useMemo(() => getUnmetPrerequisites(skill.id, ratings), [skill.id, ratings]);
  const hasUnmetPrereqs = unmetPrereqs.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-foreground">{skill.name}</h4>
            <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[skill.difficulty]}`}>
              {skill.difficulty}
            </span>
            {hasUnmetPrereqs && (
              <span className="text-xs font-semibold uppercase px-1.5 py-0.5 rounded border bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1" title={`Prerequisites not met: ${unmetPrereqs.map(p => p.skill.name).join(", ")}`}>
                <Link2 className="w-2.5 h-2.5" />
                Prereq
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">{skill.description}</p>
          {hasUnmetPrereqs && (
            <p className="text-xs text-amber-400 mt-1">
              Learn first: {unmetPrereqs.map(p => p.skill.name).join(", ")}
            </p>
          )}
        </div>
        <button
          onClick={onOpenDetail}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
          title="View details & resources"
        >
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <LevelSelector value={rating} onChange={onRate} />
        {rating !== undefined && (
          <span
            className="text-xs font-bold uppercase tracking-wide shrink-0"
            style={{ color: SKILL_LEVEL_COLORS[rating] }}
          >
            {SKILL_LEVEL_LABELS[rating]}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── SKILL DETAIL MODAL ─────────────────────────────────────────────
function SkillDetailModal({
  skill,
  domain,
  rating,
  onClose,
}: {
  skill: Skill;
  domain: SkillDomain;
  rating: SkillLevel | undefined;
  onClose: () => void;
}) {
  const DomainIcon = DOMAIN_ICONS[domain.icon] || Brain;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DomainIcon className="w-4 h-4" style={{ color: domain.color }} />
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{domain.name}</span>
            <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[skill.difficulty]}`}>
              {skill.difficulty}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-foreground">{skill.name}</h3>
        </div>

        {/* Current Level */}
        {rating !== undefined && (
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <span className="text-sm text-muted-foreground">Your level:</span>
            <span className="text-sm font-bold" style={{ color: SKILL_LEVEL_COLORS[rating] }}>
              {rating}/5 — {SKILL_LEVEL_LABELS[rating]}
            </span>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">What It Is</h4>
          <p className="text-sm text-foreground leading-relaxed">{skill.description}</p>
        </div>

        {/* Why It Matters */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">Why It Matters</h4>
          <p className="text-sm text-foreground leading-relaxed">{skill.whyItMatters}</p>
        </div>

        {/* Prerequisites */}
        {skill.prerequisites && skill.prerequisites.length > 0 && (
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">Prerequisites</h4>
            <div className="flex flex-wrap gap-2">
              {skill.prerequisites.map((prereqId) => {
                const prereqSkill = SKILL_DOMAINS.flatMap(d => d.skills).find(s => s.id === prereqId);
                return prereqSkill ? (
                  <span key={prereqId} className="text-sm font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-2 py-1 flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    {prereqSkill.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Practice Frequency */}
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Practice:</span>
            <span className="text-sm text-foreground ml-1">{skill.practiceFrequency}</span>
          </div>
        </div>

        {/* Learning Resources */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Learning Resources</h4>
          <div className="space-y-2">
            {skill.learningResources.map((resource, i) => (
              <ResourceLink key={i} resource={resource} skillId={skill.id} />
            ))}
          </div>
        </div>

        {/* Related PE Tools */}
        {skill.relatedTools && skill.relatedTools.length > 0 && (
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Related PE Tools</h4>
            <div className="flex flex-wrap gap-2">
              {skill.relatedTools.map((slug) => (
                <Link
                  key={slug}
                  href={`/tools/${slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md px-2.5 py-1.5 transition-colors"
                >
                  <ArrowRight className="w-3 h-3" />
                  {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full bg-muted hover:bg-muted/80 text-foreground font-bold text-sm rounded-lg py-2.5 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── RESOURCE LINK ──────────────────────────────────────────────────
function ResourceLink({ resource, skillId }: { resource: LearningResource; skillId: string }) {
  const Icon = RESOURCE_ICONS[resource.type] || BookOpen;
  const isInternal = resource.url.startsWith("/");

  const handleClick = () => {
    trackEvent("pe_affiliate_click", {
      tool: "skills-analyzer",
      product: skillId,
      url: resource.url,
    });
  };

  if (isInternal) {
    return (
      <Link
        href={resource.url}
        onClick={handleClick}
        className="flex items-center gap-2.5 bg-muted hover:bg-muted/80 rounded-lg px-3 py-2.5 transition-colors group"
      >
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1">{resource.title}</span>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </Link>
    );
  }

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex items-center gap-2.5 bg-muted hover:bg-muted/80 rounded-lg px-3 py-2.5 transition-colors group"
    >
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1">{resource.title}</span>
      <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
    </a>
  );
}

// ─── PROGRESS BAR ───────────────────────────────────────────────────
function ProgressBar({ rated, total }: { rated: number; total: number }) {
  const pct = total > 0 ? (rated / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {rated} of {total} skills rated
        </span>
        <span className="font-bold text-foreground">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {rated < MIN_SKILLS_FOR_RESULTS && (
        <p className="text-xs text-muted-foreground">
          Rate at least {MIN_SKILLS_FOR_RESULTS} skills to see your results dashboard
        </p>
      )}
    </div>
  );
}

// ─── READINESS GAUGE ────────────────────────────────────────────────
function ReadinessGauge({ score }: { score: number }) {
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half circle
  const dashLength = (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#22C55E";
    if (s >= 60) return "#3B82F6";
    if (s >= 40) return "#EAB308";
    if (s >= 20) return "#F97316";
    return "#EF4444";
  };

  const getLabel = (s: number) => {
    if (s >= 80) return "Well Prepared";
    if (s >= 60) return "Solid Foundation";
    if (s >= 40) return "Getting There";
    if (s >= 20) return "Early Stage";
    return "Just Starting";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.3}
          />
          {/* Score arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${dashLength} ${circumference}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-4xl font-extrabold text-foreground">{score}</span>
          <span className="text-sm font-bold uppercase tracking-wide" style={{ color: getColor(score) }}>
            {getLabel(score)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── DOMAIN SCORE BAR ───────────────────────────────────────────────
function DomainScoreCard({ domain, score }: { domain: SkillDomain; score: number }) {
  const Icon = DOMAIN_ICONS[domain.icon] || Brain;
  const pct = (score / 5) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: domain.color }} />
        <span className="text-sm font-bold text-foreground">{domain.name}</span>
        <span className="ml-auto text-sm font-extrabold" style={{ color: domain.color }}>
          {score.toFixed(1)}/5
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: domain.color }}
        />
      </div>
    </div>
  );
}

// ─── CERT EXPIRATION HELPERS ────────────────────────────────────────
function getDaysUntilExpiration(expirationDate: string): number {
  const now = new Date();
  const exp = new Date(expirationDate);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getCertStatusColor(expirationDate?: string): string {
  if (!expirationDate) return "text-muted-foreground";
  const days = getDaysUntilExpiration(expirationDate);
  if (days < 0) return "text-gray-500 line-through";
  if (days <= 30) return "text-red-500";
  if (days <= 90) return "text-amber-500";
  return "text-green-500";
}

function getCertStatusBg(expirationDate?: string): string {
  if (!expirationDate) return "border-border";
  const days = getDaysUntilExpiration(expirationDate);
  if (days < 0) return "border-gray-500/30 bg-gray-500/5";
  if (days <= 30) return "border-red-500/30 bg-red-500/5";
  if (days <= 90) return "border-amber-500/30 bg-amber-500/5";
  return "border-green-500/30 bg-green-500/5";
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function SkillsAnalyzer() {
  useSEO({
    title: "Skills & Knowledge Gap Analyzer",
    description:
      "Self-assess 60+ survival and overlanding skills across 8 domains. Get a personalized readiness score, critical gap analysis, and training roadmap with curated learning resources.",
    url: "https://prepperevolution.com/tools/skills-tracker",
  });

  // ─── STATE ────────────────────────────────────────────────────────
  const [view, setView] = useState<View>("landing");
  const [ratings, setRatings] = useState<Record<string, SkillLevel>>({});
  const [lastAssessed, setLastAssessed] = useState<string | null>(null);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [detailSkill, setDetailSkill] = useState<{ skill: Skill; domain: SkillDomain } | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>("overview");
  const resultsRef = useRef<HTMLDivElement>(null);

  // Family assessment state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyRole, setNewFamilyRole] = useState<FamilyMember["role"]>("Spouse");

  // Certification state
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCertName, setNewCertName] = useState("");
  const [newCertDate, setNewCertDate] = useState("");
  const [newCertExpiration, setNewCertExpiration] = useState("");
  const [newCertIsCustom, setNewCertIsCustom] = useState(false);

  const totalSkills = useMemo(() => getTotalSkillCount(), []);
  const ratedCount = useMemo(() => countRatedSkills(ratings), [ratings]);

  // ─── PERSISTENCE ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SKILLS_STORAGE_KEY);
      if (stored) {
        const data: SkillsAssessmentData = JSON.parse(stored);
        setRatings(data.ratings || {});
        setLastAssessed(data.lastAssessed || null);
        if (data.familyMembers) setFamilyMembers(data.familyMembers);
        if (data.certifications) setCertifications(data.certifications);
        // If they have existing ratings, skip the landing
        if (Object.keys(data.ratings || {}).length > 0) {
          setView("assess");
        }
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  const persist = useCallback(
    (newRatings: Record<string, SkillLevel>, newFamily?: FamilyMember[], newCerts?: Certification[]) => {
      const now = new Date().toISOString();
      setLastAssessed(now);
      const data: SkillsAssessmentData = {
        ratings: newRatings,
        lastAssessed: now,
        familyMembers: newFamily ?? familyMembers,
        certifications: newCerts ?? certifications,
      };
      try {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(data));
      } catch {
        // storage full — silently fail
      }
    },
    [familyMembers, certifications],
  );

  // ─── HANDLERS ─────────────────────────────────────────────────────
  const handleRate = useCallback(
    (skillId: string, level: SkillLevel) => {
      const updated = { ...ratings, [skillId]: level };
      setRatings(updated);
      persist(updated);
      trackEvent("pe_gear_added", { tool: "skills-analyzer", item: skillId, category: String(level) });
    },
    [ratings, persist],
  );

  const handleReset = useCallback(() => {
    if (!confirm("Reset all ratings? This cannot be undone.")) return;
    setRatings({});
    setLastAssessed(null);
    setFamilyMembers([]);
    setCertifications([]);
    localStorage.removeItem(SKILLS_STORAGE_KEY);
    setView("landing");
    trackEvent("pe_deadstock_reset", {});
  }, []);

  const handleStartAssessment = useCallback(() => {
    setView("assess");
    trackEvent("pe_tool_started", { tool: "skills-analyzer" });
  }, []);

  const handleViewResults = useCallback(() => {
    setView("results");
    trackEvent("pe_report_generated", { tool: "skills-analyzer" });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  // Family member handlers
  const handleAddFamilyMember = useCallback(() => {
    if (!newFamilyName.trim()) return;
    const member: FamilyMember = {
      id: `fam-${Date.now()}`,
      name: newFamilyName.trim(),
      role: newFamilyRole,
      domainRatings: {},
    };
    const updated = [...familyMembers, member];
    setFamilyMembers(updated);
    persist(ratings, updated);
    setNewFamilyName("");
    setShowAddFamily(false);
    trackEvent("pe_gear_added", { tool: "skills-analyzer", item: "family-member", category: newFamilyRole });
  }, [newFamilyName, newFamilyRole, familyMembers, ratings, persist]);

  const handleRemoveFamilyMember = useCallback((id: string) => {
    const updated = familyMembers.filter(m => m.id !== id);
    setFamilyMembers(updated);
    persist(ratings, updated);
  }, [familyMembers, ratings, persist]);

  const handleFamilyDomainRate = useCallback((memberId: string, domainId: string, level: SkillLevel) => {
    const updated = familyMembers.map(m =>
      m.id === memberId ? { ...m, domainRatings: { ...m.domainRatings, [domainId]: level } } : m
    );
    setFamilyMembers(updated);
    persist(ratings, updated);
  }, [familyMembers, ratings, persist]);

  // Certification handlers
  const handleAddCertification = useCallback(() => {
    if (!newCertName.trim() || !newCertDate) return;
    const cert: Certification = {
      id: `cert-${Date.now()}`,
      name: newCertName.trim(),
      dateObtained: newCertDate,
      expirationDate: newCertExpiration || undefined,
      isCustom: newCertIsCustom,
    };
    const updated = [...certifications, cert];
    setCertifications(updated);
    persist(ratings, undefined, updated);
    setNewCertName("");
    setNewCertDate("");
    setNewCertExpiration("");
    setNewCertIsCustom(false);
    setShowAddCert(false);
    trackEvent("pe_gear_added", { tool: "skills-analyzer", item: "certification", category: newCertName });
  }, [newCertName, newCertDate, newCertExpiration, newCertIsCustom, certifications, ratings, persist]);

  const handleRemoveCertification = useCallback((id: string) => {
    const updated = certifications.filter(c => c.id !== id);
    setCertifications(updated);
    persist(ratings, undefined, updated);
  }, [certifications, ratings, persist]);

  // ─── COMPUTED ─────────────────────────────────────────────────────
  const readinessScore = useMemo(() => calculateReadinessScore(ratings), [ratings]);
  const domainScores = useMemo(() => calculateDomainScores(ratings), [ratings]);
  const criticalGaps = useMemo(() => getCriticalGaps(ratings), [ratings]);
  const strongestSkills = useMemo(() => getStrongestSkills(ratings), [ratings]);
  const trainingRoadmap = useMemo(() => getTrainingRoadmap(ratings), [ratings]);
  const weakestScenarios = useMemo(() => getWeakestScenarios(ratings), [ratings]);
  const prereqSuggestions = useMemo(() => getPrerequisiteSuggestions(ratings), [ratings]);
  const trainingPlan = useMemo(() => generateTrainingPlan(ratings), [ratings]);

  const donutSegments = useMemo(
    () =>
      SKILL_DOMAINS.map((d) => ({
        label: d.name,
        value: domainScores[d.id] || 0,
        color: d.color,
      })),
    [domainScores],
  );

  // Barter value computations
  const barterInsights = useMemo(() => {
    const entries = Object.entries(DOMAIN_BARTER_VALUES).map(([domainId, info]) => ({
      domainId,
      ...info,
      userScore: domainScores[domainId] || 0,
      domain: SKILL_DOMAINS.find(d => d.id === domainId)!,
    })).filter(e => e.domain);

    const strongest = entries
      .filter(e => e.userScore >= 2)
      .sort((a, b) => b.userScore - a.userScore)[0];

    const weakestHighValue = entries
      .filter(e => e.tradeValue >= 7 && e.userScore < 2)
      .sort((a, b) => b.tradeValue - a.tradeValue)[0];

    return { entries, strongest, weakestHighValue };
  }, [domainScores]);

  // Family household analysis
  const householdAnalysis = useMemo(() => {
    if (familyMembers.length === 0) return null;

    const allMembers = [
      { name: "You", domainRatings: Object.fromEntries(SKILL_DOMAINS.map(d => [d.id, domainScores[d.id] || 0])) as Record<string, number> },
      ...familyMembers.map(m => ({
        name: m.name,
        domainRatings: Object.fromEntries(SKILL_DOMAINS.map(d => [d.id, (m.domainRatings[d.id] ?? 0)])) as Record<string, number>,
      })),
    ];

    // Who covers what best
    const bestCoverage: Record<string, { name: string; score: number }> = {};
    for (const domain of SKILL_DOMAINS) {
      let bestName = "";
      let bestScore = -1;
      for (const member of allMembers) {
        const score = member.domainRatings[domain.id] || 0;
        if (score > bestScore) {
          bestScore = score;
          bestName = member.name;
        }
      }
      bestCoverage[domain.id] = { name: bestName, score: bestScore };
    }

    // Critical household gaps (nobody above Basic)
    const householdGaps = SKILL_DOMAINS.filter(domain => {
      const maxScore = Math.max(...allMembers.map(m => m.domainRatings[domain.id] || 0));
      return maxScore < 2;
    });

    // Aggregate household score
    const aggregateScore = SKILL_DOMAINS.reduce((sum, domain) => {
      const maxScore = Math.max(...allMembers.map(m => m.domainRatings[domain.id] || 0));
      return sum + maxScore;
    }, 0) / SKILL_DOMAINS.length;

    return { allMembers, bestCoverage, householdGaps, aggregateScore };
  }, [familyMembers, domainScores]);

  // Cert alerts
  const certAlerts = useMemo(() => {
    return certifications
      .filter(c => c.expirationDate)
      .map(c => {
        const days = getDaysUntilExpiration(c.expirationDate!);
        return { cert: c, days };
      })
      .filter(a => a.days <= 90)
      .sort((a, b) => a.days - b.days);
  }, [certifications]);

  // ─── TOOL VIEW TRACKING ──────────────────────────────────────────
  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "skills-analyzer" });
  }, []);

  const toolUrl = "https://prepperevolution.com/tools/skills-tracker";

  // Days since last assessment
  const daysSinceAssessment = useMemo(() => {
    if (!lastAssessed) return null;
    const diff = Date.now() - new Date(lastAssessed).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [lastAssessed]);

  // ─── RESULT TABS CONFIG ───────────────────────────────────────────
  const resultTabs: { id: ResultTab; label: string; icon: React.ElementType; shortLabel?: string }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "gaps", label: `Gaps (${criticalGaps.length})`, icon: AlertTriangle, shortLabel: "Gaps" },
    { id: "roadmap", label: "Roadmap", icon: Target },
    { id: "strengths", label: "Strengths", icon: Trophy },
    { id: "scenarios", label: "Scenarios", icon: Siren },
    { id: "family", label: "Family", icon: Users },
    { id: "certs", label: "Certs", icon: Award },
    { id: "training", label: "3-Mo Plan", icon: Calendar },
    { id: "barter", label: "Barter", icon: TrendingUp },
    { id: "dependencies", label: "Skill Tree", icon: Link2 },
  ];

  // ─── LANDING VIEW ────────────────────────────────────────────────
  if (view === "landing") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Ops Deck Badge */}
        <div className="flex items-center gap-2">
          <Link href="/tools" className="text-primary hover:underline text-sm font-bold uppercase tracking-wide">
            Ops Deck
          </Link>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Skills Analyzer</span>
        </div>

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Skills & Knowledge Gap Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Rate yourself across {totalSkills} survival and overlanding skills.
            Get an honest readiness score, find your blind spots, and build a
            training plan that actually matters.
          </p>
        </div>

        {/* What You Get */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Target,
              title: "Readiness Score",
              desc: "One number that tells you where you stand across all 8 skill domains.",
            },
            {
              icon: AlertTriangle,
              title: "Critical Gap Analysis",
              desc: "Foundation skills you're missing that could cost you in a real emergency.",
            },
            {
              icon: BookOpen,
              title: "Training Roadmap",
              desc: "Prioritized learning path with curated videos, books, courses, and PE tools.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-lg p-4 text-center space-y-2">
              <Icon className="w-6 h-6 text-primary mx-auto" />
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Skill Level Key */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Rating Scale</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {([0, 1, 2, 3, 4, 5] as SkillLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: SKILL_LEVEL_COLORS[level] }}
                >
                  {level}
                </span>
                <span className="text-sm text-foreground">{SKILL_LEVEL_LABELS[level]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8 Domains Preview */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">8 Skill Domains</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SKILL_DOMAINS.map((domain) => {
              const Icon = DOMAIN_ICONS[domain.icon] || Brain;
              return (
                <div key={domain.id} className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: domain.color }} />
                  <span className="text-foreground font-medium">{domain.name}</span>
                  <span className="text-muted-foreground text-sm ml-auto">{domain.skills.length}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleStartAssessment}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-lg py-4 transition-colors flex items-center justify-center gap-2"
        >
          <Brain className="w-5 h-5" />
          Start Self-Assessment
          <ArrowRight className="w-4 h-4" />
        </button>

        <DataPrivacyNotice />
      </div>
    );
  }

  // ─── ASSESSMENT + RESULTS VIEW ────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 no-print">
        <Link href="/tools" className="text-primary hover:underline text-sm font-bold uppercase tracking-wide">
          Ops Deck
        </Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Skills Analyzer</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-3">
            <Brain className="w-7 h-7 text-primary" />
            Skills Analyzer
          </h1>
          {daysSinceAssessment !== null && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last assessed {daysSinceAssessment === 0 ? "today" : `${daysSinceAssessment} day${daysSinceAssessment === 1 ? "" : "s"} ago`}
              {daysSinceAssessment > 90 && (
                <span className="text-amber-500 font-semibold ml-1">— consider re-assessing</span>
              )}
            </p>
          )}
          {/* Cert alerts in header */}
          {certAlerts.length > 0 && view === "assess" && (
            <div className="mt-2 space-y-1">
              {certAlerts.slice(0, 2).map(({ cert, days }) => (
                <p key={cert.id} className={`text-sm font-semibold ${days < 0 ? "text-gray-500" : days <= 30 ? "text-red-500" : "text-amber-500"}`}>
                  {days < 0 ? `${cert.name} expired ${Math.abs(days)} days ago` : `${cert.name} expires in ${days} days`}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 no-print">
          {ratedCount >= MIN_SKILLS_FOR_RESULTS && (
            <button
              onClick={() => setView(view === "results" ? "assess" : "results")}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm uppercase tracking-wide rounded-lg px-4 py-2.5 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {view === "results" ? "Edit Ratings" : "View Results"}
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-muted-foreground font-semibold text-sm rounded-lg px-3 py-2.5 transition-colors"
            title="Reset all ratings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar rated={ratedCount} total={totalSkills} />

      {/* ─── ASSESSMENT SECTION ────────────────────────────────────── */}
      {view === "assess" && (
        <div className="space-y-4">
          {SKILL_DOMAINS.map((domain) => {
            const Icon = DOMAIN_ICONS[domain.icon] || Brain;
            const isExpanded = expandedDomain === domain.id;
            const domainRatedCount = domain.skills.filter((s) => ratings[s.id] !== undefined).length;
            const domainAvg = domainScores[domain.id] || 0;

            return (
              <div key={domain.id} className="border border-border rounded-lg overflow-hidden">
                {/* Domain Header */}
                <button
                  onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                  className="w-full flex items-center gap-3 p-4 bg-card hover:bg-muted/50 transition-colors text-left"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${domain.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: domain.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{domain.name}</h3>
                      <span className="text-xs font-semibold text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                        {domainRatedCount}/{domain.skills.length}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{domain.description}</p>
                  </div>
                  {domainRatedCount > 0 && (
                    <span className="text-sm font-extrabold shrink-0" style={{ color: domain.color }}>
                      {domainAvg.toFixed(1)}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Domain Skills */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-3 border-t border-border bg-muted/20">
                        {/* Quick-rate all unrated */}
                        {domainRatedCount < domain.skills.length && (
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <span className="text-xs text-muted-foreground">Rate all unrated as:</span>
                            {([0, 1, 2] as SkillLevel[]).map((level) => (
                              <button
                                key={level}
                                onClick={() => {
                                  const updated = { ...ratings };
                                  domain.skills.forEach((s) => {
                                    if (updated[s.id] === undefined) updated[s.id] = level;
                                  });
                                  setRatings(updated);
                                  persist(updated);
                                }}
                                className="text-xs font-bold px-2 py-1 rounded border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {level} — {SKILL_LEVEL_LABELS[level]}
                              </button>
                            ))}
                          </div>
                        )}
                        {domain.skills.map((skill) => (
                          <SkillCard
                            key={skill.id}
                            skill={skill}
                            domain={domain}
                            rating={ratings[skill.id]}
                            onRate={(level) => handleRate(skill.id, level)}
                            onOpenDetail={() => setDetailSkill({ skill, domain })}
                            ratings={ratings}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* View Results CTA */}
          {ratedCount >= MIN_SKILLS_FOR_RESULTS && (
            <button
              onClick={handleViewResults}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-lg py-4 transition-colors flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              View Your Results Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ─── RESULTS DASHBOARD ─────────────────────────────────────── */}
      {view === "results" && ratedCount >= MIN_SKILLS_FOR_RESULTS && (
        <div ref={resultsRef} className="space-y-8" id="skills-results">
          {/* Overall Readiness Score */}
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-4">
              Overall Readiness Score
            </h2>
            <ReadinessGauge score={readinessScore} />
            <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
              Based on {ratedCount} rated skills, weighted by importance.
              {readinessScore < 40 && " Focus on the foundation skills below to see the biggest improvement."}
              {readinessScore >= 40 && readinessScore < 70 && " You've got a solid start. The roadmap below targets your biggest gaps."}
              {readinessScore >= 70 && " Strong showing. The roadmap focuses on leveling up your remaining gaps."}
            </p>
          </div>

          {/* Result Tabs — scrollable on mobile */}
          <div className="overflow-x-auto no-print">
            <div className="flex gap-1 bg-muted rounded-lg p-1 min-w-max">
              {resultTabs.map(({ id, label, icon: TabIcon, shortLabel }) => (
                <button
                  key={id}
                  onClick={() => setActiveResultTab(id)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                    activeResultTab === id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{shortLabel || label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
          {activeResultTab === "overview" && (
            <div className="space-y-6">
              {/* Domain Donut */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-4">
                  Domain Breakdown
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <DonutChart
                    segments={donutSegments}
                    totalLabel="Readiness"
                    totalValue={`${readinessScore}`}
                    size={180}
                  />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 flex-1">
                    {SKILL_DOMAINS.map((d) => (
                      <div key={d.id} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-muted-foreground truncate">{d.name}</span>
                        <span className="text-foreground font-medium ml-auto">
                          {(domainScores[d.id] || 0).toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Domain Score Cards */}
              <div className="grid sm:grid-cols-2 gap-3">
                {SKILL_DOMAINS.map((domain) => (
                  <DomainScoreCard
                    key={domain.id}
                    domain={domain}
                    score={domainScores[domain.id] || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── CRITICAL GAPS TAB ────────────────────────────────── */}
          {activeResultTab === "gaps" && (
            <div className="space-y-4">
              {criticalGaps.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Check className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground">No Critical Gaps</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    All your foundation and intermediate skills are rated 2 or above. Nice work.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <h3 className="text-sm font-bold text-foreground">
                        {criticalGaps.length} Critical Gap{criticalGaps.length !== 1 ? "s" : ""} Found
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      These are beginner and intermediate skills rated 0-1 that carry high importance.
                      Addressing these first gives you the biggest improvement per hour invested.
                    </p>
                  </div>

                  {criticalGaps.map(({ skill, domain, level }) => {
                    const DomainIcon = DOMAIN_ICONS[domain.icon] || Brain;
                    return (
                      <div
                        key={skill.id}
                        className="bg-card border border-red-500/20 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <DomainIcon className="w-3.5 h-3.5" style={{ color: domain.color }} />
                              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                {domain.name}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground">{skill.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{skill.whyItMatters}</p>
                          </div>
                          <span
                            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                            style={{ backgroundColor: SKILL_LEVEL_COLORS[level] }}
                          >
                            {level}
                          </span>
                        </div>
                        {/* Resources */}
                        <div className="space-y-1.5">
                          {skill.learningResources.slice(0, 2).map((resource, i) => (
                            <ResourceLink key={i} resource={resource} skillId={skill.id} />
                          ))}
                        </div>
                        {/* Article links + Search PE Articles */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          {skill.learningResources
                            .filter((r) => r.type === "article")
                            .map((resource, i) => (
                              <a
                                key={i}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                {resource.title}
                              </a>
                            ))}
                          <a
                            href={`https://prepperevolution.com/?s=${encodeURIComponent(skill.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            Search PE Articles
                          </a>
                        </div>
                        <button
                          onClick={() => setDetailSkill({ skill, domain })}
                          className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                          View all resources
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ── ROADMAP TAB ──────────────────────────────────────── */}
          {activeResultTab === "roadmap" && (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Your Priority Training Roadmap</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ordered by impact — foundation skills you're missing come first, then high-value
                  skills worth leveling up, then weak spots in your strong domains.
                </p>
              </div>

              {trainingRoadmap.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Star className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground">All Caught Up</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your skills are well-rounded. Keep practicing and re-assess quarterly.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainingRoadmap.map(({ skill, domain, level, reason }, index) => {
                    const DomainIcon = DOMAIN_ICONS[domain.icon] || Brain;
                    return (
                      <div
                        key={skill.id}
                        className="bg-card border border-border rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          {/* Priority Number */}
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-extrabold text-primary">{index + 1}</span>
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <DomainIcon className="w-3.5 h-3.5" style={{ color: domain.color }} />
                                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                  {domain.name}
                                </span>
                                <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[skill.difficulty]}`}>
                                  {skill.difficulty}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-foreground">{skill.name}</h4>
                              <p className="text-sm text-primary/80 font-medium mt-0.5">{reason}</p>
                            </div>

                            {/* Current level & target */}
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Current:</span>
                              <span className="font-bold" style={{ color: SKILL_LEVEL_COLORS[level] }}>
                                {level} — {SKILL_LEVEL_LABELS[level]}
                              </span>
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Target:</span>
                              <span className="font-bold" style={{ color: SKILL_LEVEL_COLORS[Math.min(5, level + 2) as SkillLevel] }}>
                                {Math.min(5, level + 2)} — {SKILL_LEVEL_LABELS[Math.min(5, level + 2) as SkillLevel]}
                              </span>
                            </div>

                            {/* Top resource */}
                            {skill.learningResources[0] && (
                              <ResourceLink resource={skill.learningResources[0]} skillId={skill.id} />
                            )}

                            <button
                              onClick={() => setDetailSkill({ skill, domain })}
                              className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                            >
                              All resources & details
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STRENGTHS TAB ────────────────────────────────────── */}
          {activeResultTab === "strengths" && (
            <div className="space-y-4">
              {strongestSkills.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground">No Strengths Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rate some skills at level 3 or above to see your top strengths here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-green-500" />
                      <h3 className="text-sm font-bold text-foreground">Your Top Skills</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      These are skills where you're competent or beyond. Consider teaching
                      others — that's the fastest way to reach Expert level.
                    </p>
                  </div>

                  {strongestSkills.map(({ skill, domain, level }) => {
                    const DomainIcon = DOMAIN_ICONS[domain.icon] || Brain;
                    return (
                      <div
                        key={skill.id}
                        className="bg-card border border-green-500/20 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <DomainIcon className="w-3.5 h-3.5" style={{ color: domain.color }} />
                              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                {domain.name}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground">{skill.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                          </div>
                          <span
                            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                            style={{ backgroundColor: SKILL_LEVEL_COLORS[level] }}
                          >
                            {level}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{skill.practiceFrequency}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ── SCENARIOS TAB ────────────────────────────────────── */}
          {activeResultTab === "scenarios" && (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Siren className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-bold text-foreground">Your Weakest Scenarios</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Based on your domain scores, these SHTF scenarios would expose your biggest skill gaps.
                  Run them in the SHTF Simulator to see how your gaps play out in practice.
                </p>
              </div>

              {weakestScenarios.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Check className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground">No Major Scenario Vulnerabilities</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your domain scores are solid enough that no single scenario type poses an outsized risk. Keep training.
                  </p>
                </div>
              ) : (
                weakestScenarios.map((scenario) => {
                  const domain = SKILL_DOMAINS.find(d => d.id === scenario.domainId);
                  if (!domain) return null;
                  const DomainIcon = DOMAIN_ICONS[domain.icon] || Brain;
                  const score = domainScores[scenario.domainId] || 0;

                  return (
                    <div key={scenario.domainId} className="bg-card border border-red-500/20 rounded-lg p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                          <Siren className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-foreground">{scenario.scenarioName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <DomainIcon className="w-3.5 h-3.5" style={{ color: domain.color }} />
                            <span className="text-sm text-muted-foreground">
                              {domain.name} gap triggers this scenario — your score: <span className="font-bold" style={{ color: domain.color }}>{score.toFixed(1)}/5</span>
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {scenario.description}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={scenario.scenarioUrl}
                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg px-4 py-2.5 transition-colors"
                      >
                        <Siren className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-bold text-foreground">Run this scenario to see how your gaps play out</span>
                        <ArrowRight className="w-4 h-4 text-red-500 ml-auto" />
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── FAMILY TAB ───────────────────────────────────────── */}
          {activeResultTab === "family" && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-foreground">Family Assessment</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Assess your household members at the domain level. See who covers what and where your family has critical gaps.
                </p>
              </div>

              {/* Add Family Member */}
              {showAddFamily ? (
                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-bold text-foreground">Add Family Member</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Name</label>
                      <input
                        type="text"
                        value={newFamilyName}
                        onChange={(e) => setNewFamilyName(e.target.value)}
                        placeholder="e.g. Sarah"
                        className="w-full mt-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Role</label>
                      <select
                        value={newFamilyRole}
                        onChange={(e) => setNewFamilyRole(e.target.value as FamilyMember["role"])}
                        className="w-full mt-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Child">Child</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddFamilyMember} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-lg px-4 py-2 transition-colors">
                      Add Member
                    </button>
                    <button onClick={() => setShowAddFamily(false)} className="bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm rounded-lg px-4 py-2 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddFamily(true)}
                  className="w-full border-2 border-dashed border-border hover:border-primary/40 rounded-lg p-4 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Family Member
                </button>
              )}

              {/* Family Member Cards */}
              {familyMembers.map((member) => (
                <div key={member.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{member.name}</h4>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{member.role}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFamilyMember(member.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:border-red-500/40 hover:bg-red-500/5 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SKILL_DOMAINS.map((domain) => {
                      const DomainIcon = DOMAIN_ICONS[domain.icon] || Brain;
                      const memberLevel = member.domainRatings[domain.id] as SkillLevel | undefined;
                      return (
                        <div key={domain.id} className="space-y-1">
                          <div className="flex items-center gap-1">
                            <DomainIcon className="w-3 h-3" style={{ color: domain.color }} />
                            <span className="text-xs font-semibold text-muted-foreground truncate">{domain.name}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {([0, 1, 2, 3, 4, 5] as SkillLevel[]).map((level) => (
                              <button
                                key={level}
                                onClick={() => handleFamilyDomainRate(member.id, domain.id, level)}
                                className={`w-5 h-5 rounded text-[9px] font-bold transition-all ${
                                  memberLevel === level
                                    ? "text-white scale-110"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                                style={memberLevel === level ? { backgroundColor: SKILL_LEVEL_COLORS[level] } : undefined}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Household Analysis */}
              {householdAnalysis && (
                <div className="space-y-4">
                  {/* Household Aggregate Score */}
                  <div className="bg-card border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Household Aggregate Score</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-extrabold text-foreground">{householdAnalysis.aggregateScore.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">/5 — Best member's score per domain, averaged</span>
                    </div>
                  </div>

                  {/* Skill Coverage */}
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Household Skill Coverage</h4>
                    <div className="space-y-2">
                      {SKILL_DOMAINS.map((domain) => {
                        const DomainIcon = DOMAIN_ICONS[domain.icon] || Brain;
                        const coverage = householdAnalysis.bestCoverage[domain.id];
                        return (
                          <div key={domain.id} className="flex items-center gap-2 text-sm">
                            <DomainIcon className="w-4 h-4 shrink-0" style={{ color: domain.color }} />
                            <span className="text-foreground font-medium flex-1">{domain.name}</span>
                            <span className="text-muted-foreground text-sm">{coverage.name}</span>
                            <span className="font-bold text-sm" style={{ color: domain.color }}>{coverage.score.toFixed(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Household Gaps */}
                  {householdAnalysis.householdGaps.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <h4 className="text-sm font-bold text-foreground">Household Critical Gaps</h4>
                      </div>
                      <div className="space-y-1">
                        {householdAnalysis.householdGaps.map((domain) => (
                          <p key={domain.id} className="text-sm text-red-400">
                            Nobody in your household rates above Basic in <span className="font-bold">{domain.name}</span> — critical gap
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── CERTS TAB ────────────────────────────────────────── */}
          {activeResultTab === "certs" && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-foreground">Certification Tracker</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Track your certifications and licenses. Get alerts when they're about to expire so you never lapse.
                </p>
              </div>

              {/* Cert Alerts */}
              {certAlerts.length > 0 && (
                <div className="space-y-2">
                  {certAlerts.map(({ cert, days }) => (
                    <div key={cert.id} className={`border rounded-lg p-3 ${days < 0 ? "border-gray-500/30 bg-gray-500/5" : days <= 30 ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                      <p className={`text-sm font-bold ${days < 0 ? "text-gray-500" : days <= 30 ? "text-red-500" : "text-amber-500"}`}>
                        {days < 0
                          ? `Your ${cert.name} expired ${Math.abs(days)} days ago`
                          : `Your ${cert.name} expires in ${days} day${days !== 1 ? "s" : ""}`
                        }
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Cert */}
              {showAddCert ? (
                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-bold text-foreground">Add Certification</h4>

                  {/* Predefined list */}
                  {!newCertIsCustom && (
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Select Certification</label>
                      <select
                        value={newCertName}
                        onChange={(e) => setNewCertName(e.target.value)}
                        className="w-full mt-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Choose...</option>
                        {PREDEFINED_CERTIFICATIONS.filter(pc => !certifications.some(c => c.name === pc.name)).map((pc) => (
                          <option key={pc.name} value={pc.name}>{pc.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { setNewCertIsCustom(true); setNewCertName(""); }}
                        className="text-sm text-primary font-semibold mt-2 hover:underline"
                      >
                        + Add custom certification
                      </button>
                    </div>
                  )}

                  {newCertIsCustom && (
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Certification Name</label>
                      <input
                        type="text"
                        value={newCertName}
                        onChange={(e) => setNewCertName(e.target.value)}
                        placeholder="e.g. Advanced Wilderness First Aid"
                        className="w-full mt-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        onClick={() => { setNewCertIsCustom(false); setNewCertName(""); }}
                        className="text-sm text-primary font-semibold mt-2 hover:underline"
                      >
                        Choose from list instead
                      </button>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Date Obtained</label>
                      <input
                        type="date"
                        value={newCertDate}
                        onChange={(e) => setNewCertDate(e.target.value)}
                        className="w-full mt-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Expiration Date (optional)</label>
                      <input
                        type="date"
                        value={newCertExpiration}
                        onChange={(e) => setNewCertExpiration(e.target.value)}
                        className="w-full mt-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCertification}
                      disabled={!newCertName.trim() || !newCertDate}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-bold text-sm rounded-lg px-4 py-2 transition-colors"
                    >
                      Add Certification
                    </button>
                    <button onClick={() => { setShowAddCert(false); setNewCertIsCustom(false); setNewCertName(""); }} className="bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm rounded-lg px-4 py-2 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCert(true)}
                  className="w-full border-2 border-dashed border-border hover:border-primary/40 rounded-lg p-4 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Certification
                </button>
              )}

              {/* Cert List */}
              {certifications.length > 0 && (
                <div className="space-y-2">
                  {certifications.map((cert) => {
                    const statusColor = getCertStatusColor(cert.expirationDate);
                    const statusBg = getCertStatusBg(cert.expirationDate);
                    const days = cert.expirationDate ? getDaysUntilExpiration(cert.expirationDate) : null;

                    return (
                      <div key={cert.id} className={`border rounded-lg p-4 ${statusBg}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className={`text-sm font-bold ${days !== null && days < 0 ? "text-gray-500 line-through" : "text-foreground"}`}>
                              {cert.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span>Obtained: {new Date(cert.dateObtained).toLocaleDateString()}</span>
                              {cert.expirationDate && (
                                <span className={statusColor}>
                                  {days !== null && days < 0
                                    ? `Expired ${Math.abs(days)} days ago`
                                    : days !== null
                                    ? `Expires in ${days} day${days !== 1 ? "s" : ""}`
                                    : ""}
                                </span>
                              )}
                              {!cert.expirationDate && (
                                <span className="text-green-500">No expiration</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveCertification(cert.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:border-red-500/40 hover:bg-red-500/5 transition-colors shrink-0"
                            title="Remove certification"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {certifications.length === 0 && !showAddCert && (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground">No Certifications Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track your training certifications and get expiration alerts.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── 3-MONTH TRAINING PLAN TAB ────────────────────────── */}
          {activeResultTab === "training" && (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">3-Month Seasonal Training Plan</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Based on your skill gaps, here's a structured plan. Priority gaps come first, then intermediate improvements. Print it out and check off each item.
                </p>
              </div>

              {trainingPlan.every(m => m.skills.length === 0) ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Star className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground">No Training Needed</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your skills are well-developed. Keep practicing and re-assess quarterly.
                  </p>
                </div>
              ) : (
                trainingPlan.map((month) => (
                  <div key={month.month} className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="bg-primary/5 border-b border-border px-4 py-3">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-extrabold text-primary">
                          {month.month}
                        </span>
                        Month {month.month}: {month.monthLabel}
                      </h4>
                    </div>

                    {month.skills.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">No additional skills to prioritize this month.</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-4">
                        {month.skills.map(({ skill, domain, currentLevel, targetLevel, actionItems, estimatedTime, seasonalNote }) => {
                          const DomainIcon = DOMAIN_ICONS[domain.icon] || Brain;
                          return (
                            <div key={skill.id} className="border border-border rounded-lg p-3 space-y-2">
                              <div className="flex items-start gap-2">
                                <DomainIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: domain.color }} />
                                <div className="flex-1">
                                  <h5 className="text-sm font-bold text-foreground">{skill.name}</h5>
                                  <div className="flex items-center gap-2 text-sm mt-0.5">
                                    <span className="text-muted-foreground">Rated</span>
                                    <span className="font-bold" style={{ color: SKILL_LEVEL_COLORS[currentLevel] }}>{currentLevel}</span>
                                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Target</span>
                                    <span className="font-bold" style={{ color: SKILL_LEVEL_COLORS[targetLevel] }}>{targetLevel}</span>
                                    <span className="text-muted-foreground ml-2 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {estimatedTime}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Items — print-friendly checkboxes */}
                              <div className="space-y-1.5 ml-6">
                                {actionItems.map((item, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <div className="w-4 h-4 rounded border border-border mt-0.5 shrink-0 flex items-center justify-center print:border-gray-400">
                                      {/* empty checkbox for print */}
                                    </div>
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Seasonal Note */}
                              {seasonalNote && (
                                <div className="ml-6 flex items-start gap-1.5 text-xs text-amber-500 bg-amber-500/5 border border-amber-500/10 rounded px-2 py-1">
                                  <Calendar className="w-3 h-3 shrink-0 mt-0.5" />
                                  <span>{seasonalNote}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Print button for training plan */}
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm rounded-lg py-3 transition-colors no-print"
              >
                <Printer className="w-4 h-4" />
                Print Training Plan
              </button>
            </div>
          )}

          {/* ── BARTER VALUE TAB ─────────────────────────────────── */}
          {activeResultTab === "barter" && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-foreground">Skill Trade Value</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In a long-term disruption, skills become currency. Here's what your skill domains are worth in trade at Day 30.
                </p>
                <p className="text-sm text-emerald-500 font-semibold mt-2 italic">
                  "Skills never run out. You can trade a can of beans once. You can trade electrical repair forever."
                </p>
              </div>

              {/* Trade Value Grid */}
              <div className="space-y-2">
                {barterInsights.entries
                  .sort((a, b) => b.tradeValue - a.tradeValue)
                  .map((entry) => {
                    const DomainIcon = DOMAIN_ICONS[entry.domain.icon] || Brain;
                    return (
                      <div key={entry.domainId} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <DomainIcon className="w-5 h-5 shrink-0" style={{ color: entry.domain.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{entry.domain.name}</span>
                              <span className="text-sm text-muted-foreground">Your score: <span className="font-bold" style={{ color: entry.domain.color }}>{entry.userScore.toFixed(1)}</span></span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-extrabold text-foreground">{entry.tradeValue}/10</div>
                            <span className="text-xs text-muted-foreground">Trade Value</span>
                          </div>
                        </div>
                        {/* Trade value bar */}
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${entry.tradeValue * 10}%`, backgroundColor: entry.domain.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Insights */}
              <div className="space-y-3">
                {barterInsights.strongest && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-green-500" />
                      Your Strongest Tradeable Skill
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-bold text-foreground">{barterInsights.strongest.domain.name}</span> (rated {barterInsights.strongest.userScore.toFixed(1)}/5) — trade value at Day 30: <span className="font-bold text-green-500">{barterInsights.strongest.tradeValue}/10</span>
                    </p>
                  </div>
                )}

                {barterInsights.weakestHighValue && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      High-Value Skill Worth Investing In
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-bold text-foreground">{barterInsights.weakestHighValue.domain.name}</span> has trade value <span className="font-bold text-amber-500">{barterInsights.weakestHighValue.tradeValue}/10</span> but you're only rated {barterInsights.weakestHighValue.userScore.toFixed(1)}/5 — worth investing in.
                    </p>
                  </div>
                )}
              </div>

              {/* Link to barter estimator */}
              <Link
                href="/tools/barter-value-estimator"
                className="flex items-center gap-2 bg-card border border-border hover:border-primary/40 rounded-lg px-4 py-3 transition-colors group"
              >
                <TrendingUp className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <span className="text-sm font-bold text-foreground group-hover:text-primary">Barter & Trade Value Estimator</span>
                  <p className="text-sm text-muted-foreground">See what physical goods and supplies are worth in trade</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </Link>
            </div>
          )}

          {/* ── SKILL DEPENDENCIES TAB ───────────────────────────── */}
          {activeResultTab === "dependencies" && (
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Link2 className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-bold text-foreground">Skill Tree & Dependencies</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Some skills build on others. This shows prerequisite chains — skills you should learn at a Basic level (2+) before moving to dependent skills.
                </p>
              </div>

              {/* Prerequisite Suggestions */}
              {prereqSuggestions.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    Natural Next Steps
                  </h4>
                  {prereqSuggestions.map(({ skill, domain, prereqName }) => (
                    <p key={skill.id} className="text-sm text-muted-foreground">
                      You rated <span className="font-bold text-green-500">{prereqName}</span> as 3+ but <span className="font-bold text-foreground">{skill.name}</span> as 0 — {skill.name.toLowerCase()} is your natural next step.
                    </p>
                  ))}
                </div>
              )}

              {/* Dependency Chains */}
              {SKILL_DOMAINS.map((domain) => {
                const DomainIcon = DOMAIN_ICONS[domain.icon] || Brain;
                const skillsWithPrereqs = domain.skills.filter(s => s.prerequisites && s.prerequisites.length > 0);
                if (skillsWithPrereqs.length === 0) return null;

                return (
                  <div key={domain.id} className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
                      <DomainIcon className="w-4 h-4" style={{ color: domain.color }} />
                      <span className="text-sm font-bold text-foreground">{domain.name}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {skillsWithPrereqs.map((skill) => {
                        const unmet = getUnmetPrerequisites(skill.id, ratings);
                        const currentLevel = ratings[skill.id];
                        const allMet = unmet.length === 0;

                        return (
                          <div key={skill.id} className={`border rounded-lg p-3 ${allMet ? "border-green-500/20" : "border-amber-500/20"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="text-sm font-bold text-foreground">{skill.name}</h5>
                              {currentLevel !== undefined && (
                                <span className="text-xs font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: SKILL_LEVEL_COLORS[currentLevel] }}>
                                  {currentLevel}
                                </span>
                              )}
                              {allMet ? (
                                <span className="text-xs font-semibold text-green-500 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Prerequisites met
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> {unmet.length} unmet
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {skill.prerequisites!.map((prereqId) => {
                                const prereqSkill = SKILL_DOMAINS.flatMap(d => d.skills).find(s => s.id === prereqId);
                                const prereqLevel = ratings[prereqId];
                                const met = prereqLevel !== undefined && prereqLevel >= 2;
                                return prereqSkill ? (
                                  <div key={prereqId} className="flex items-center gap-1">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded border flex items-center gap-1 ${
                                      met
                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    }`}>
                                      {met ? <Check className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                                      {prereqSkill.name}
                                      {prereqLevel !== undefined && ` (${prereqLevel})`}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                ) : null;
                              })}
                              <span className="text-xs font-bold text-foreground">{skill.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Share & Print */}
          <div className="space-y-4 no-print">
            <ToolSocialShare url={toolUrl} toolName="Skills Assessment" />

            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm rounded-lg py-3 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>

          <PrintQrCode url={toolUrl} />
          <DataPrivacyNotice />
          <SupportFooter />
        </div>
      )}

      {/* ─── SKILL DETAIL MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {detailSkill && (
          <SkillDetailModal
            skill={detailSkill.skill}
            domain={detailSkill.domain}
            rating={ratings[detailSkill.skill.id]}
            onClose={() => setDetailSkill(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
