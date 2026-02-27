import { useState, useEffect, useMemo } from "react";
import {
  ThumbsUp, Filter, ArrowUpDown, Backpack, Zap, Droplets, UtensilsCrossed, Package,
  Send, X, Tag, User, FileText, MessageSquare, Loader2, CheckCircle,
  AlertTriangle, Users,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface CommunityBuild {
  id: string;
  nickname: string;
  buildType: "bob" | "solar" | "water" | "food" | "kit";
  title: string;
  description: string;
  tags: string[];
  data: Record<string, unknown>;
  likes: number;
  status: string;
  createdAt: string;
}

type BuildType = "bob" | "solar" | "water" | "food" | "kit";
type BuildFilter = "all" | BuildType;

const BUILD_TYPE_CONFIG: Record<BuildType, { label: string; icon: typeof Backpack; color: string }> = {
  bob: { label: "Bug Out Bag", icon: Backpack, color: "bg-[#8B6F47]/10 text-[#8B6F47]" },
  solar: { label: "Solar Setup", icon: Zap, color: "bg-[#EAB308]/10 text-[#EAB308]" },
  water: { label: "Water Storage", icon: Droplets, color: "bg-[#3B82F6]/10 text-[#3B82F6]" },
  food: { label: "Food Storage", icon: UtensilsCrossed, color: "bg-green-500/10 text-green-500" },
  kit: { label: "72-Hour Kit", icon: Package, color: "bg-[#7C3AED]/10 text-[#7C3AED]" },
};

const BUILD_CALCULATOR_LINKS: Record<BuildType, string> = {
  bob: "/tools/bug-out-bag-calculator",
  solar: "/tools/solar-power-calculator",
  water: "/tools/water-storage-calculator",
  food: "/tools/food-storage-calculator",
  kit: "/tools/72-hour-kit-builder",
};

const LOCAL_STORAGE_KEYS: Record<BuildType, string> = {
  bob: "pe-bob-calculator",
  solar: "pe-solar-calculator",
  water: "pe-water-calculator",
  food: "pe-food-calculator",
  kit: "pe-kit-builder",
};
type SortMode = "newest" | "most-liked";

const TAG_COLORS = [
  "bg-primary/10 text-primary",
  "bg-green-500/10 text-green-500",
  "bg-[#3B82F6]/10 text-[#3B82F6]",
  "bg-[#8B5E3C]/10 text-[#8B5E3C]",
  "bg-[#7C3AED]/10 text-[#7C3AED]",
  "bg-[#EC4899]/10 text-[#EC4899]",
];

function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function BuildCard({ build, isExpanded, onToggle }: {
  build: CommunityBuild;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = BUILD_TYPE_CONFIG[build.buildType] || BUILD_TYPE_CONFIG.bob;
  const Icon = config.icon;

  function renderQuickStats() {
    const d = build.data;
    switch (build.buildType) {
      case "bob":
        return (
          <>
            {d.totalWeightLbs != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.totalWeightLbs)} lbs</span>}
            {d.itemCount != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.itemCount)} items</span>}
            {d.weightPercent != null && (
              <span className={`text-xs font-bold px-2 py-1 rounded ${Number(d.weightPercent) > 25 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
                {String(d.weightPercent)}% BW
              </span>
            )}
          </>
        );
      case "solar":
        return (
          <>
            {d.totalDailyWh != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{Number(d.totalDailyWh) >= 1000 ? `${(Number(d.totalDailyWh) / 1000).toFixed(1)} kWh/day` : `${String(d.totalDailyWh)} Wh/day`}</span>}
            {d.deviceCount != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.deviceCount)} devices</span>}
            {d.days != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.days)} day{Number(d.days) !== 1 ? "s" : ""}</span>}
          </>
        );
      case "water":
        return (
          <>
            {d.totalGallons != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.totalGallons)} gal</span>}
            {d.people != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.people)} people</span>}
            {d.days != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.days)} days</span>}
          </>
        );
      case "food":
        return (
          <>
            {d.totalCalories != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{Number(d.totalCalories).toLocaleString()} cal</span>}
            {d.people != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.people)} people</span>}
            {d.days != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.days)} days</span>}
          </>
        );
      case "kit":
        return (
          <>
            {d.itemCount != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.itemCount)} items</span>}
            {d.scenario != null && <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{String(d.scenario)}</span>}
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div
      className={`bg-card border rounded-lg overflow-hidden transition-all duration-200 ${
        isExpanded ? "border-primary/40 shadow-lg" : "border-border hover:border-primary/20 hover:shadow-md"
      }`}
      data-testid={`card-build-${build.id}`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-5 focus:outline-none"
        aria-expanded={isExpanded}
        data-testid={`button-toggle-${build.id}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
          <span className="text-[11px] text-muted-foreground">{timeAgo(build.createdAt)}</span>
        </div>

        <h3 className="text-lg font-extrabold mb-1 leading-tight">{build.title}</h3>

        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <User className="w-3 h-3" /> {build.nickname}
        </p>

        <div className="flex flex-wrap gap-3 mb-3">
          {renderQuickStats()}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {build.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
            {build.tags.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{build.tags.length - 4}</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
            <ThumbsUp className="w-3 h-3" /> {build.likes}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border p-5 space-y-4 animate-fade-in-up">
          <p className="text-sm text-muted-foreground leading-relaxed">{build.description}</p>

          <div className="bg-muted rounded-lg p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Build Details</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(build.data).map(([key, val]) => {
                if (val == null || (Array.isArray(val) && val.length === 0)) return null;
                const label = key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
                const display = Array.isArray(val)
                  ? (val as string[]).join(", ")
                  : typeof val === "number" ? val.toLocaleString() : String(val);
                return (
                  <div key={key}>
                    <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
                    <p className="text-sm font-extrabold">{display}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {build.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {build.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded ${getTagColor(tag)}`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubmitForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buildType, setBuildType] = useState<BuildType>("bob");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availableData, setAvailableData] = useState<Record<BuildType, boolean>>({ bob: false, solar: false, water: false, food: false, kit: false });

  useEffect(() => {
    const result: Record<BuildType, boolean> = { bob: false, solar: false, water: false, food: false, kit: false };
    for (const [type, key] of Object.entries(LOCAL_STORAGE_KEYS) as [BuildType, string][]) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          if (data && (data.selected ? Object.keys(data.selected).length > 0 : Object.keys(data).length > 0)) {
            result[type] = true;
          }
        }
      } catch { /* ignore */ }
    }
    setAvailableData(result);
  }, []);

  const addTag = () => {
    const cleaned = tagInput.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    if (cleaned && !tags.includes(cleaned) && tags.length < 8) {
      setTags([...tags, cleaned]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  function extractBuildData(): Record<string, unknown> {
    const key = LOCAL_STORAGE_KEYS[buildType];
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return {};
      const saved = JSON.parse(raw);

      switch (buildType) {
        case "bob": {
          const selected = saved.selected || {};
          const customItems = saved.customItems || [];
          const bodyWeight = saved.bodyWeight || 180;
          const itemCount = Object.values(selected).reduce((sum: number, qty: unknown) => sum + (Number(qty) || 1), 0) + customItems.length;
          return { itemCount, bodyWeightLbs: bodyWeight, customItemCount: customItems.length, gearIds: Object.keys(selected).slice(0, 50) };
        }
        case "solar":
          return { deviceCount: Object.keys(saved.selected || {}).length, days: saved.days || 3, region: saved.region || "unknown" };
        case "water":
          return { people: saved.people || 1, days: saved.days || 3, totalGallons: saved.totalGallons || 0 };
        case "food":
          return { people: saved.people || 1, days: saved.days || 7, totalCalories: saved.totalCalories || 0 };
        case "kit":
          return { itemCount: saved.itemCount || 0, scenario: saved.scenario || "general" };
        default:
          return saved;
      }
    } catch {
      return {};
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const data = extractBuildData();

    try {
      const res = await fetch("/api/community-builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          buildType,
          title,
          description,
          tags,
          data,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      onSuccess();
    } catch {
      setError("Network error. Check your connection and try again.");
      setSubmitting(false);
    }
  };

  const selectedHasData = availableData[buildType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-lg font-extrabold">Submit Your Build</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center bg-muted hover:bg-border transition-colors"
            aria-label="Close"
            data-testid="button-close-form"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
              Build Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.entries(BUILD_TYPE_CONFIG) as [BuildType, typeof BUILD_TYPE_CONFIG.bob][]).map(([type, cfg]) => {
                const TypeIcon = cfg.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBuildType(type)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      buildType === type ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                    data-testid={`button-type-${type}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TypeIcon className="w-4 h-4" />
                      <span className="text-xs font-bold">{cfg.label}</span>
                    </div>
                    {availableData[type] ? (
                      <span className="text-[10px] text-green-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Data found
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">No saved data</span>
                    )}
                  </button>
                );
              })}
            </div>
            {!selectedHasData && (
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-[#EAB308]" />
                No saved {BUILD_TYPE_CONFIG[buildType].label} data.
                Use the{" "}
                <a
                  href={BUILD_CALCULATOR_LINKS[buildType]}
                  className="text-primary underline"
                  target="_blank"
                >
                  calculator
                </a>{" "}
                first to auto-attach your build stats.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cb-nickname" className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
              <User className="w-3 h-3 inline mr-1" /> Nickname
            </label>
            <input
              id="cb-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="TrailGhost, MamaBear, etc."
              maxLength={30}
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              data-testid="input-nickname"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{nickname.length}/30</p>
          </div>

          <div>
            <label htmlFor="cb-title" className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
              <FileText className="w-3 h-3 inline mr-1" /> Build Title
            </label>
            <input
              id="cb-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Ultralight BOB, Family Solar Rig, etc."
              maxLength={100}
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              data-testid="input-title"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{title.length}/100</p>
          </div>

          <div>
            <label htmlFor="cb-description" className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
              <MessageSquare className="w-3 h-3 inline mr-1" /> Description
            </label>
            <textarea
              id="cb-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the community about your build. What is the use case? What makes it unique? Any lessons learned?"
              maxLength={500}
              required
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
              data-testid="input-description"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{description.length}/500</p>
          </div>

          <div>
            <label htmlFor="cb-tags" className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
              <Tag className="w-3 h-3 inline mr-1" /> Tags (optional, max 8)
            </label>
            <div className="flex gap-2">
              <input
                id="cb-tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="ultralight, budget, family..."
                maxLength={30}
                disabled={tags.length >= 8}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                data-testid="input-tags"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={tags.length >= 8 || !tagInput.trim()}
                className="px-3 py-2.5 bg-muted border border-border rounded-lg text-sm font-bold hover:bg-border transition-colors disabled:opacity-50"
                data-testid="button-add-tag"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className={`text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded flex items-center gap-1 hover:opacity-70 transition-opacity ${getTagColor(tag)}`}
                  >
                    {tag} <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-500 flex items-start gap-2" data-testid="text-error">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 text-sm font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
            data-testid="button-submit-build"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit Build for Review
              </>
            )}
          </button>

          <p className="text-[10px] text-muted-foreground text-center">
            Submissions are reviewed before appearing in the gallery. No personal data is stored.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function CommunityGallery() {
  const [builds, setBuilds] = useState<CommunityBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BuildFilter>("all");
  const [sort, setSort] = useState<SortMode>("most-liked");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useSEO({
    title: "Community Builds Gallery",
    description: "Browse and share community bug out bag and solar power builds. See real-world configurations from fellow preppers.",
  });

  useEffect(() => {
    fetch("/api/community-builds")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBuilds(data);
      })
      .catch((err) => console.error("[community] Failed to load builds:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredBuilds = useMemo(() => {
    let result = [...builds];

    if (filter !== "all") {
      result = result.filter((b) => b.buildType === filter);
    }

    if (sort === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result.sort((a, b) => b.likes - a.likes);
    }

    return result;
  }, [builds, filter, sort]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of builds) counts[b.buildType] = (counts[b.buildType] || 0) + 1;
    return counts;
  }, [builds]);

  const handleSubmitSuccess = () => {
    setShowForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3" data-testid="text-tool-label">Community</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4" data-testid="text-page-title">
            Community <span className="text-primary">Builds Gallery</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-page-description">
            Browse real-world builds from fellow preppers. Share your own configuration with the community.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                filter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="button-filter-all"
            >
              <Filter className="w-3 h-3 inline mr-1" />
              All ({builds.length})
            </button>
            {(Object.entries(BUILD_TYPE_CONFIG) as [BuildType, typeof BUILD_TYPE_CONFIG.bob][]).map(([type, cfg]) => {
              const FilterIcon = cfg.icon;
              const count = typeCounts[type] || 0;
              if (count === 0 && filter !== type) return null;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                    filter === type ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-filter-${type}`}
                >
                  <FilterIcon className="w-3 h-3 inline mr-1" />
                  {cfg.label.split(" ")[0]} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setSort("most-liked")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                  sort === "most-liked" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-sort-top"
              >
                <ThumbsUp className="w-3 h-3 inline mr-1" /> Top
              </button>
              <button
                onClick={() => setSort("newest")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                  sort === "newest" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-sort-new"
              >
                <ArrowUpDown className="w-3 h-3 inline mr-1" /> New
              </button>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors"
              data-testid="button-submit-build"
            >
              <Send className="w-3.5 h-3.5" /> Submit Your Build
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="bg-green-500/15 border border-green-500/30 text-green-500 text-sm rounded-lg p-4 mb-6 flex items-start gap-3 animate-fade-in-up" data-testid="text-success-toast">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Submitted for review!</p>
              <p className="text-xs mt-0.5 opacity-80">
                Your build will appear in the gallery once approved. This usually takes less than 24 hours.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {!loading && filteredBuilds.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-bold mb-2" data-testid="text-empty-title">No builds yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              {filter !== "all"
                ? `No ${BUILD_TYPE_CONFIG[filter as BuildType]?.label || filter} builds found. Try a different filter.`
                : "Be the first to share your build with the community!"}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors"
              data-testid="button-submit-first"
            >
              <Send className="w-4 h-4" /> Submit the First Build
            </button>
          </div>
        )}

        {!loading && filteredBuilds.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBuilds.map((build) => (
              <BuildCard
                key={build.id}
                build={build}
                isExpanded={expandedId === build.id}
                onToggle={() => setExpandedId(expandedId === build.id ? null : build.id)}
              />
            ))}
          </div>
        )}

        {showForm && (
          <SubmitForm onClose={() => setShowForm(false)} onSuccess={handleSubmitSuccess} />
        )}
      </div>
    </div>
  );
}
