import { useState, useCallback, useMemo } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  Shield, Zap, CloudLightning, AlertTriangle, Snowflake, Flame,
  ArrowRight, RotateCcw, ChevronLeft, ExternalLink, Share2,
  CheckCircle, XCircle, TrendingUp, TrendingDown, Trophy, Skull,
  Heart, Target,
} from "lucide-react";
import {
  scenarios,
  getEndResult,
  getNode,
  type Scenario,
  type Choice,
  type EndResult,
} from "./scenarios";
import { useSEO } from "@/hooks/useSEO";

const scenarioIcons: Record<string, React.ElementType> = {
  "zap-off": Zap,
  "cloud-lightning": CloudLightning,
  "alert-triangle": AlertTriangle,
  snowflake: Snowflake,
  flame: Flame,
};

const difficultyColors: Record<string, string> = {
  Moderate: "bg-green-500/15 text-green-500 border-green-500/30",
  Hard: "bg-[#EAB308]/15 text-[#EAB308] border-[#EAB308]/30",
  Extreme: "bg-red-500/15 text-red-500 border-red-500/30",
};

const ratingConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  Thrived: {
    icon: Trophy,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  Survived: {
    icon: Heart,
    color: "text-[#EAB308]",
    bg: "bg-[#EAB308]/10",
    border: "border-[#EAB308]/30",
  },
  "Barely Made It": {
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  "Didn't Make It": {
    icon: Skull,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

type GamePhase = "select" | "play" | "result";

export default function SHTFSimulator() {
  const [phase, setPhase] = useState<GamePhase>("select");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>("");
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<
    { nodeId: string; choiceIndex: number; consequence: string; impact: number }[]
  >([]);
  const [fadeKey, setFadeKey] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);

  useSEO({
    title: "SHTF Scenario Simulator",
    description: "Test your survival decision-making skills in realistic SHTF scenarios. Choose-your-own-adventure style simulator with educational outcomes and gear recommendations.",
  });

  const startScenario = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentNodeId(scenario.startingNodeId);
    setScore(0);
    setHistory([]);
    setFadeKey((k) => k + 1);
    setPhase("play");
    trackEvent("pe_scenario_selected", { scenario: scenario.id });
  }, []);

  const makeChoice = useCallback(
    (choice: Choice, choiceIndex: number) => {
      const newScore = score + choice.scoreImpact;
      const newHistory = [
        ...history,
        {
          nodeId: currentNodeId,
          choiceIndex,
          consequence: choice.consequence,
          impact: choice.scoreImpact,
        },
      ];

      setScore(newScore);
      setHistory(newHistory);
      setFadeKey((k) => k + 1);

      if (choice.nextNodeId === "end") {
        setPhase("result");
        if (selectedScenario) {
          const endResult = getEndResult(selectedScenario, newScore);
          trackEvent("pe_scenario_completed", { scenario: selectedScenario.id, outcome: endResult.rating, score: newScore });
        }
      } else {
        setCurrentNodeId(choice.nextNodeId);
      }
    },
    [score, history, currentNodeId],
  );

  const resetToSelect = useCallback(() => {
    setPhase("select");
    setSelectedScenario(null);
    setCurrentNodeId("");
    setScore(0);
    setHistory([]);
    setFadeKey((k) => k + 1);
  }, []);

  const retryScenario = useCallback(() => {
    if (selectedScenario) {
      startScenario(selectedScenario);
    }
  }, [selectedScenario, startScenario]);

  const currentNode = useMemo(() => {
    if (!selectedScenario || !currentNodeId) return null;
    return getNode(selectedScenario, currentNodeId);
  }, [selectedScenario, currentNodeId]);

  const progress = useMemo(() => {
    if (!selectedScenario) return 0;
    const total = selectedScenario.totalNodes;
    const current = history.length;
    if (phase === "result") return 100;
    return Math.round((current / total) * 100);
  }, [selectedScenario, history.length, phase]);

  const endResult = useMemo(() => {
    if (!selectedScenario || phase !== "result") return null;
    return getEndResult(selectedScenario, score);
  }, [selectedScenario, score, phase]);

  const shareResult = useCallback(() => {
    if (!selectedScenario || !endResult) return;
    const text = `I ${endResult.rating === "Thrived" ? "thrived" : endResult.rating === "Survived" ? "survived" : endResult.rating === "Barely Made It" ? "barely made it" : "didn't make it"} in the ${selectedScenario.name} scenario on Prepper Evolution's SHTF Simulator! Score: ${score}. Think you can do better?`;
    const url = `${window.location.origin}/tools/shtf-simulator`;

    if (navigator.share) {
      navigator.share({ title: "SHTF Scenario Simulator", text, url }).catch(() => {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  }, [selectedScenario, endResult, score]);

  const fallbackCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  if (phase === "select") {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3" data-testid="text-tool-label">Free Tool</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4" data-testid="text-page-title">
              SHTF <span className="text-primary">Scenario Simulator</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-page-description">
              Test your survival decision-making in realistic scenarios. Every choice matters.
            </p>
          </div>

          <div className="space-y-6 animate-fade-in-up">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scenario) => {
                const Icon = scenarioIcons[scenario.icon] || Shield;
                const diffClass = difficultyColors[scenario.difficulty] || "";

                return (
                  <button
                    key={scenario.id}
                    onClick={() => startScenario(scenario)}
                    className="bg-card border border-border rounded-lg p-5 text-left hover:shadow-lg hover:border-primary/30 transition-all group"
                    data-testid={`button-scenario-${scenario.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${diffClass}`}
                        data-testid={`text-difficulty-${scenario.id}`}
                      >
                        {scenario.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold mb-2 group-hover:text-primary transition-colors">
                      {scenario.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {scenario.description}
                    </p>

                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide pt-3 border-t border-border">
                      Start Scenario <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "play" && selectedScenario && currentNode) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div key={fadeKey} className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={resetToSelect}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-back-scenarios"
              >
                <ChevronLeft className="w-4 h-4" /> All Scenarios
              </button>
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {selectedScenario.name}
              </span>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 mb-6">
              <div className="text-4xl mb-4">{currentNode.emoji}</div>
              <p className="text-foreground leading-relaxed text-base sm:text-lg" data-testid="text-situation">
                {currentNode.situation}
              </p>
            </div>

            {history.length > 0 && (
              <div className="mb-6">
                <div
                  className={`rounded-lg p-4 border ${
                    history[history.length - 1].impact > 0
                      ? "bg-green-500/5 border-green-500/20"
                      : history[history.length - 1].impact < 0
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-muted border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {history[history.length - 1].impact > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : history[history.length - 1].impact < 0 ? (
                      <TrendingDown className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                        Result of your last choice
                        <span
                          className={`ml-2 ${
                            history[history.length - 1].impact > 0
                              ? "text-green-500"
                              : history[history.length - 1].impact < 0
                                ? "text-red-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {history[history.length - 1].impact > 0 ? "+" : ""}
                          {history[history.length - 1].impact} pts
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {history[history.length - 1].consequence}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                What do you do?
              </p>
              {currentNode.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => makeChoice(choice, idx)}
                  className="w-full bg-card border border-border rounded-lg p-4 sm:p-5 text-left hover:border-primary/50 hover:shadow-md transition-all group"
                  data-testid={`button-choice-${idx}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <p className="text-sm sm:text-base font-medium leading-relaxed">
                      {choice.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result" && selectedScenario && endResult) {
    const config = ratingConfig[endResult.rating] || ratingConfig["Survived"];
    const RatingIcon = config.icon;

    return (
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div key={fadeKey} className="max-w-3xl mx-auto animate-fade-in-up">
            <div
              className={`${config.bg} border ${config.border} rounded-lg p-6 sm:p-8 text-center mb-6`}
            >
              <RatingIcon className={`w-16 h-16 ${config.color} mx-auto mb-4`} />
              <h2 className={`text-3xl sm:text-4xl font-extrabold ${config.color} mb-2`} data-testid="text-result-rating">
                {endResult.rating}
              </h2>
              <p className="text-muted-foreground text-sm uppercase tracking-wide font-bold mb-4" data-testid="text-result-score">
                {selectedScenario.name} — Final Score: {score}
              </p>
              <p className="text-foreground leading-relaxed max-w-xl mx-auto">
                {endResult.summary}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4">
                Decision Breakdown
              </h3>
              <div className="space-y-3">
                {history.map((h, idx) => {
                  const node = getNode(selectedScenario, h.nodeId);
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-b-0 last:pb-0"
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          h.impact > 0
                            ? "bg-green-500/15 text-green-500"
                            : h.impact < 0
                              ? "bg-red-500/15 text-red-500"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {h.impact > 0 ? "+" : ""}
                        {h.impact}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {node?.emoji} Decision {idx + 1}
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {h.consequence}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-green-500">
                    What You Did Right
                  </h3>
                </div>
                <ul className="space-y-2">
                  {endResult.didRight.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2"
                    >
                      <span className="text-green-500 shrink-0 mt-1">&#8226;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
                    What to Improve
                  </h3>
                </div>
                <ul className="space-y-2">
                  {endResult.couldImprove.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2"
                    >
                      <span className="text-primary shrink-0 mt-1">&#8226;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4">
                Gear That Would Have Helped
              </h3>
              <div className="space-y-4">
                {endResult.gearRecommendations.map((gear, idx) => (
                  <a
                    key={idx}
                    href={gear.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="block bg-muted rounded-lg p-4 hover:bg-primary/5 transition-colors group"
                    data-testid={`link-gear-${idx}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-sm font-bold group-hover:text-primary transition-colors block">
                          {gear.name}
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                          {gear.reason}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
                    </div>
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-4">
                Affiliate links &mdash; we earn a commission at no extra cost to you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={retryScenario}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 text-sm font-bold uppercase tracking-wide transition-colors"
                data-testid="button-retry"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={resetToSelect}
                className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-card transition-colors"
                data-testid="button-another-scenario"
              >
                <ChevronLeft className="w-4 h-4" /> Try Another Scenario
              </button>
              <button
                onClick={shareResult}
                className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-card transition-colors"
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4" /> Share Result
              </button>
            </div>

            {showShareToast && (
              <div className="bg-green-500/15 border border-green-500/30 text-green-500 text-sm rounded-lg p-3 text-center animate-fade-in-up" data-testid="text-share-toast">
                Link copied to clipboard!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
