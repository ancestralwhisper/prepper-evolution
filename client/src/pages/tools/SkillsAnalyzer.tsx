import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "wouter";
import {
  Brain, ChevronDown, ChevronRight, ChevronUp, ArrowRight,
  Droplets, UtensilsCrossed, Home, Heart, Compass, Shield, Zap, Truck,
  BarChart3, Target, AlertTriangle, Trophy, BookOpen, Clock,
  ExternalLink, Printer, RotateCcw, Check, Info, Star,
  Video, BookOpenCheck, GraduationCap,
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
  calculateReadinessScore,
  calculateDomainScores,
  getCriticalGaps,
  getStrongestSkills,
  getTrainingRoadmap,
  countRatedSkills,
  getTotalSkillCount,
  type SkillLevel,
  type Skill,
  type SkillDomain,
  type SkillsAssessmentData,
  type LearningResource,
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
              px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all
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
}: {
  skill: Skill;
  domain: SkillDomain;
  rating: SkillLevel | undefined;
  onRate: (level: SkillLevel) => void;
  onOpenDetail: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-foreground">{skill.name}</h4>
            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[skill.difficulty]}`}>
              {skill.difficulty}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{skill.description}</p>
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
            className="text-[10px] font-bold uppercase tracking-wide shrink-0"
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
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{domain.name}</span>
            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[skill.difficulty]}`}>
              {skill.difficulty}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-foreground">{skill.name}</h3>
        </div>

        {/* Current Level */}
        {rating !== undefined && (
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <span className="text-xs text-muted-foreground">Your level:</span>
            <span className="text-sm font-bold" style={{ color: SKILL_LEVEL_COLORS[rating] }}>
              {rating}/5 — {SKILL_LEVEL_LABELS[rating]}
            </span>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">What It Is</h4>
          <p className="text-sm text-foreground leading-relaxed">{skill.description}</p>
        </div>

        {/* Why It Matters */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Why It Matters</h4>
          <p className="text-sm text-foreground leading-relaxed">{skill.whyItMatters}</p>
        </div>

        {/* Practice Frequency */}
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Practice:</span>
            <span className="text-sm text-foreground ml-1">{skill.practiceFrequency}</span>
          </div>
        </div>

        {/* Learning Resources */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Learning Resources</h4>
          <div className="space-y-2">
            {skill.learningResources.map((resource, i) => (
              <ResourceLink key={i} resource={resource} skillId={skill.id} />
            ))}
          </div>
        </div>

        {/* Related PE Tools */}
        {skill.relatedTools && skill.relatedTools.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Related PE Tools</h4>
            <div className="flex flex-wrap gap-2">
              {skill.relatedTools.map((slug) => (
                <Link
                  key={slug}
                  href={`/tools/${slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md px-2.5 py-1.5 transition-colors"
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
      <div className="flex items-center justify-between text-xs">
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
        <p className="text-[10px] text-muted-foreground">
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
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: getColor(score) }}>
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
  const [activeResultTab, setActiveResultTab] = useState<"overview" | "gaps" | "roadmap" | "strengths">("overview");
  const resultsRef = useRef<HTMLDivElement>(null);

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
    (newRatings: Record<string, SkillLevel>) => {
      const now = new Date().toISOString();
      setLastAssessed(now);
      const data: SkillsAssessmentData = { ratings: newRatings, lastAssessed: now };
      try {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(data));
      } catch {
        // storage full — silently fail
      }
    },
    [],
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

  // ─── COMPUTED ─────────────────────────────────────────────────────
  const readinessScore = useMemo(() => calculateReadinessScore(ratings), [ratings]);
  const domainScores = useMemo(() => calculateDomainScores(ratings), [ratings]);
  const criticalGaps = useMemo(() => getCriticalGaps(ratings), [ratings]);
  const strongestSkills = useMemo(() => getStrongestSkills(ratings), [ratings]);
  const trainingRoadmap = useMemo(() => getTrainingRoadmap(ratings), [ratings]);

  const donutSegments = useMemo(
    () =>
      SKILL_DOMAINS.map((d) => ({
        label: d.name,
        value: domainScores[d.id] || 0,
        color: d.color,
      })),
    [domainScores],
  );

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

  // ─── LANDING VIEW ────────────────────────────────────────────────
  if (view === "landing") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Ops Deck Badge */}
        <div className="flex items-center gap-2">
          <Link href="/tools" className="text-primary hover:underline text-xs font-bold uppercase tracking-wide">
            Ops Deck
          </Link>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Skills Analyzer</span>
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
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Skill Level Key */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Rating Scale</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {([0, 1, 2, 3, 4, 5] as SkillLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: SKILL_LEVEL_COLORS[level] }}
                >
                  {level}
                </span>
                <span className="text-xs text-foreground">{SKILL_LEVEL_LABELS[level]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8 Domains Preview */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">8 Skill Domains</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SKILL_DOMAINS.map((domain) => {
              const Icon = DOMAIN_ICONS[domain.icon] || Brain;
              return (
                <div key={domain.id} className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: domain.color }} />
                  <span className="text-foreground font-medium">{domain.name}</span>
                  <span className="text-muted-foreground text-xs ml-auto">{domain.skills.length}</span>
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
        <Link href="/tools" className="text-primary hover:underline text-xs font-bold uppercase tracking-wide">
          Ops Deck
        </Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Skills Analyzer</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-3">
            <Brain className="w-7 h-7 text-primary" />
            Skills Analyzer
          </h1>
          {daysSinceAssessment !== null && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last assessed {daysSinceAssessment === 0 ? "today" : `${daysSinceAssessment} day${daysSinceAssessment === 1 ? "" : "s"} ago`}
              {daysSinceAssessment > 90 && (
                <span className="text-amber-500 font-semibold ml-1">— consider re-assessing</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 no-print">
          {ratedCount >= MIN_SKILLS_FOR_RESULTS && (
            <button
              onClick={() => setView(view === "results" ? "assess" : "results")}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wide rounded-lg px-4 py-2.5 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {view === "results" ? "Edit Ratings" : "View Results"}
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-muted-foreground font-semibold text-xs rounded-lg px-3 py-2.5 transition-colors"
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
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                        {domainRatedCount}/{domain.skills.length}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{domain.description}</p>
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
                            <span className="text-[10px] text-muted-foreground">Rate all unrated as:</span>
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
                                className="text-[10px] font-bold px-2 py-1 rounded border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
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
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
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

          {/* Result Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 no-print">
            {([
              { id: "overview" as const, label: "Overview", icon: BarChart3 },
              { id: "gaps" as const, label: `Gaps (${criticalGaps.length})`, icon: AlertTriangle },
              { id: "roadmap" as const, label: "Roadmap", icon: Target },
              { id: "strengths" as const, label: "Strengths", icon: Trophy },
            ]).map(({ id, label, icon: TabIcon }) => (
              <button
                key={id}
                onClick={() => setActiveResultTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold transition-all ${
                  activeResultTab === id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
          {activeResultTab === "overview" && (
            <div className="space-y-6">
              {/* Domain Donut */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
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
                    <p className="text-xs text-muted-foreground leading-relaxed">
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
                              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                {domain.name}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground">{skill.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{skill.whyItMatters}</p>
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
                        <button
                          onClick={() => setDetailSkill({ skill, domain })}
                          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
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
                <p className="text-xs text-muted-foreground leading-relaxed">
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
                            <span className="text-xs font-extrabold text-primary">{index + 1}</span>
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <DomainIcon className="w-3.5 h-3.5" style={{ color: domain.color }} />
                                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                  {domain.name}
                                </span>
                                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[skill.difficulty]}`}>
                                  {skill.difficulty}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-foreground">{skill.name}</h4>
                              <p className="text-xs text-primary/80 font-medium mt-0.5">{reason}</p>
                            </div>

                            {/* Current level & target */}
                            <div className="flex items-center gap-2 text-xs">
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
                              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
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
                    <p className="text-xs text-muted-foreground leading-relaxed">
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
                              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                {domain.name}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground">{skill.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
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
                          <span className="text-[10px] text-muted-foreground">{skill.practiceFrequency}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
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
