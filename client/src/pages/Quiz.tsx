import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Flame,
  Shield,
  Trophy,
  RotateCcw,
  Check,
  ArrowRight,
  Target,
  Mail,
  Backpack,
  Droplets,
  Zap,
  ExternalLink,
  BookOpen,
  Link2,
  MessageCircle,
} from "lucide-react";
import {
  questions,
  getScoreRange,
  getCategoryScores,
  MAX_SCORE,
  type QuizQuestion,
  type ScoreRange,
} from "./quiz-data";
import { useSEO } from "@/hooks/useSEO";

const iconMap = {
  AlertTriangle,
  Flame,
  Shield,
  Trophy,
};

function encodeAnswers(answers: Record<string, number>): string {
  return Object.entries(answers)
    .map(([k, v]) => `${k}:${v}`)
    .join(",");
}

function decodeAnswers(param: string): Record<string, number> {
  const answers: Record<string, number> = {};
  param.split(",").forEach((entry) => {
    const [key, val] = entry.split(":");
    if (key && val !== undefined) {
      answers[key] = parseInt(val) || 0;
    }
  });
  return answers;
}

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useSEO({
    title: "Prepper Readiness Quiz",
    description: "Find out how prepared you really are with our 10-question survival readiness quiz. Get a personalized score, category breakdown, and gear recommendations.",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = params.get("a");
    if (a) {
      const decoded = decodeAnswers(a);
      const answeredCount = Object.keys(decoded).length;
      if (answeredCount === questions.length) {
        setAnswers(decoded);
        setShowResults(true);
      } else if (answeredCount > 0) {
        setAnswers(decoded);
        setCurrentQuestion(answeredCount);
      }
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (showResults && initialized) {
      const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
      localStorage.setItem(
        "pe-quiz-score",
        JSON.stringify({
          score: totalScore,
          maxScore: MAX_SCORE,
          answers,
          timestamp: Date.now(),
        })
      );
    }
  }, [showResults, answers, initialized]);

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const scoreRange = getScoreRange(totalScore);
  const categoryScores = getCategoryScores(answers);

  const handleAnswer = useCallback(
    (questionId: string, score: number) => {
      setTransitioning(true);
      setAnswers((prev) => ({ ...prev, [questionId]: score }));

      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion((c) => c + 1);
        } else {
          setShowResults(true);
          const newAnswers = { ...answers, [questionId]: score };
          const url = new URL(window.location.href);
          url.searchParams.set("a", encodeAnswers(newAnswers));
          window.history.replaceState({}, "", url.toString());
        }
        setTransitioning(false);
      }, 300);
    },
    [currentQuestion, answers]
  );

  const goBack = useCallback(() => {
    if (currentQuestion > 0) {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion((c) => c - 1);
        setTransitioning(false);
      }, 200);
    }
  }, [currentQuestion]);

  const restart = useCallback(() => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setEmailSubmitted(false);
    setEmail("");
    const url = new URL(window.location.href);
    url.searchParams.delete("a");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const getShareUrl = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("a", encodeAnswers(answers));
    return url.toString();
  }, [answers]);

  const getShareText = useCallback(() => {
    const score = Object.values(answers).reduce((a, b) => a + b, 0);
    const range = getScoreRange(score);
    if (score < 50) {
      return `I scored ${score}/${MAX_SCORE} on the Prepper Readiness Quiz... time to step up my prep game. How do you stack up?`;
    }
    return `I scored ${score}/${MAX_SCORE} on the Prepper Readiness Quiz — ${range.title}! Think you can beat my score?`;
  }, [answers]);

  const copyLink = useCallback(async () => {
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [getShareUrl]);

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.includes("@") || emailSubmitting) return;
      setEmailSubmitting(true);
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: "",
            interests: ["prepping"],
            experience:
              totalScore >= 76
                ? "advanced"
                : totalScore >= 51
                  ? "intermediate"
                  : "beginner",
            priority: "skills",
          }),
        });
      } catch {
        // Silently continue
      }
      setEmailSubmitting(false);
      setEmailSubmitted(true);
    },
    [email, emailSubmitting, totalScore]
  );

  if (showResults) {
    const RangeIcon = iconMap[scoreRange.icon];
    const scorePercent = Math.round((totalScore / MAX_SCORE) * 100);

    return (
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="bg-card border border-border rounded-lg p-8 sm:p-10 text-center shadow-sm mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 ${scoreRange.color} mb-6`}>
                <RangeIcon className="w-10 h-10" />
              </div>

              <div className="mb-4">
                <span className="text-6xl sm:text-7xl font-extrabold" data-testid="text-total-score">{totalScore}</span>
                <span className="text-2xl text-muted-foreground font-bold">/{MAX_SCORE}</span>
              </div>

              <h2 className={`text-2xl sm:text-3xl font-extrabold mb-3 ${scoreRange.color}`} data-testid="text-score-title">
                {scoreRange.title}
              </h2>

              <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
                {scoreRange.description}
              </p>

              <div className="mt-8 max-w-md mx-auto">
                <div className="h-4 bg-muted rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                  <span>0</span>
                  <span>Just Starting</span>
                  <span>Foundation</span>
                  <span>Solid</span>
                  <span>30</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm mb-8">
              <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Category Breakdown
              </h3>
              <div className="space-y-4">
                {categoryScores.map((cat) => {
                  const pct = Math.round((cat.score / cat.maxScore) * 100);
                  const isWeak = pct < 50;
                  return (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-semibold ${isWeak ? "text-red-500" : "text-foreground"}`}>
                          {cat.label}
                          {isWeak && <span className="text-red-500 text-xs ml-2 font-normal">Needs work</span>}
                        </span>
                        <span className="text-sm text-muted-foreground font-medium">
                          {cat.score}/{cat.maxScore}
                        </span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden border border-border">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            isWeak ? "bg-red-500" : pct >= 80 ? "bg-secondary" : "bg-primary"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm mb-8">
              <h3 className="text-xl font-extrabold mb-4">
                Your Next Steps
              </h3>
              <ol className="space-y-3">
                {scoreRange.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm mb-8">
              <h3 className="text-xl font-extrabold mb-2">
                Recommended Gear for Your Level
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Based on your score, these products will have the biggest impact on your readiness.
              </p>
              <div className="grid gap-4">
                {scoreRange.products.map((product) => (
                  <a
                    key={product.name}
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/50 hover:border-primary/40 hover:shadow-sm transition-all"
                    data-testid={`link-product-${product.name}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                        {product.name}
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {product.reason}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-md">
                      View
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 sm:p-8 mb-8">
              <h3 className="text-xl font-extrabold mb-2">
                Improve Your Score
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Use our free calculators to build out the areas where you scored lowest.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <Link
                  href="/tools/bug-out-bag-calculator"
                  className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all group"
                  data-testid="link-bob-calculator"
                >
                  <Backpack className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold group-hover:text-primary transition-colors">BOB Calculator</div>
                    <div className="text-xs text-muted-foreground">Build your bag</div>
                  </div>
                </Link>
                <Link
                  href="/tools/water-storage-calculator"
                  className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all group"
                  data-testid="link-water-calculator"
                >
                  <Droplets className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold group-hover:text-primary transition-colors">Water Calculator</div>
                    <div className="text-xs text-muted-foreground">Plan your supply</div>
                  </div>
                </Link>
                <Link
                  href="/tools/solar-power-calculator"
                  className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all group"
                  data-testid="link-power-calculator"
                >
                  <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold group-hover:text-primary transition-colors">Power Calculator</div>
                    <div className="text-xs text-muted-foreground">Size your setup</div>
                  </div>
                </Link>
              </div>
            </div>

            {!emailSubmitted ? (
              <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-extrabold mb-1">
                      Get Weekly Prep Tips to Boost Your Score
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      One email per week. Actionable advice, gear recommendations, and skills training. Unsubscribe anytime.
                    </p>
                    <form onSubmit={handleEmailSubmit} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        required
                        className="flex-1 min-w-0 bg-background border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                        data-testid="input-email"
                      />
                      <button
                        type="submit"
                        disabled={emailSubmitting || !email.includes("@")}
                        className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-md transition-colors text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="button-subscribe"
                      >
                        {emailSubmitting ? "..." : "Subscribe"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-6 text-center mb-8">
                <Check className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="font-bold text-secondary" data-testid="text-email-success">You are in! Check your inbox for your first tip.</p>
              </div>
            )}

            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm mb-8">
              <h3 className="text-xl font-extrabold mb-2">Share Your Score</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Challenge your friends — see if they can beat your score.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-[#000000] hover:bg-[#000000]/5 transition-all group"
                  data-testid="button-share-x"
                >
                  <span className="w-10 h-10 rounded-full bg-[#000000] flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">X</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-[#1877F2] hover:bg-[#1877F2]/5 transition-all group"
                  data-testid="button-share-facebook"
                >
                  <span className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">Facebook</span>
                </a>

                <a
                  href={`https://www.reddit.com/submit?url=${encodeURIComponent(getShareUrl())}&title=${encodeURIComponent(`I scored ${totalScore}/${MAX_SCORE} on the Prepper Readiness Quiz — ${scoreRange.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-[#FF4500] hover:bg-[#FF4500]/5 transition-all group"
                  data-testid="button-share-reddit"
                >
                  <span className="w-10 h-10 rounded-full bg-[#FF4500] flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 0-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">Reddit</span>
                </a>

                <a
                  href={`sms:?body=${encodeURIComponent(getShareText() + " " + getShareUrl())}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group"
                  data-testid="button-share-sms"
                >
                  <span className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                    <MessageCircle className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">SMS</span>
                </a>

                <a
                  href={`mailto:?subject=${encodeURIComponent(`I scored ${totalScore}/${MAX_SCORE} on the Prepper Readiness Quiz`)}&body=${encodeURIComponent(getShareText() + "\n\nTake the quiz: " + getShareUrl())}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-all group"
                  data-testid="button-share-email"
                >
                  <span className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">Email</span>
                </a>

                <button
                  onClick={copyLink}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  data-testid="button-share-copy"
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${copied ? "bg-secondary" : "bg-muted-foreground/60"}`}>
                    {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                    {copied ? "Copied!" : "Copy Link"}
                  </span>
                </button>
              </div>

              <div className="mt-5 bg-muted border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;{getShareText()}&rdquo;
                </p>
                <p className="text-xs text-primary font-medium mt-1">prepperevolution.com/quiz</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/start-here"
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3.5 rounded-md transition-colors uppercase tracking-wider text-sm shadow-sm"
                data-testid="link-guide"
              >
                <BookOpen className="w-4 h-4" />
                Read the Free Field Guide
              </Link>
              <button
                onClick={restart}
                className="flex-1 flex items-center justify-center gap-2 bg-card border border-border hover:border-primary hover:shadow-sm font-bold px-6 py-3.5 rounded-md transition-all uppercase tracking-wider text-sm"
                data-testid="button-restart"
              >
                <RotateCcw className="w-4 h-4" />
                Take Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q: QuizQuestion = questions[currentQuestion];
  const selectedAnswer = answers[q.id];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium" data-testid="text-question-progress">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider bg-muted px-3 py-1 rounded-full border border-border">
                {q.categoryLabel}
              </span>
            </div>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-sm transition-all duration-300 ${
                    i < currentQuestion
                      ? "bg-primary"
                      : i === currentQuestion
                        ? "bg-primary/60"
                        : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            className={`bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm transition-opacity duration-200 ${
              transitioning ? "opacity-30" : "opacity-100"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-extrabold mb-6 leading-tight" data-testid="text-question">
              {q.question}
            </h2>

            <div className="grid gap-3">
              {q.answers.map((answer, i) => {
                const isSelected = selectedAnswer === answer.score;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(q.id, answer.score)}
                    className={`text-left p-4 sm:p-5 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-primary/5"
                    }`}
                    data-testid={`button-answer-${i}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <div>
                        <div className="font-semibold text-sm sm:text-base">
                          {answer.text}
                        </div>
                        {isSelected && (
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed animate-fade-in-up">
                            {answer.feedback}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {currentQuestion > 0 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  data-testid="button-back"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {selectedAnswer !== undefined && currentQuestion < questions.length - 1 && (
                <button
                  onClick={() => {
                    setTransitioning(true);
                    setTimeout(() => {
                      setCurrentQuestion((c) => c + 1);
                      setTransitioning(false);
                    }, 200);
                  }}
                  className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/90 transition-colors"
                  data-testid="button-next"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {selectedAnswer !== undefined && currentQuestion === questions.length - 1 && (
                <button
                  onClick={() => {
                    setShowResults(true);
                    const url = new URL(window.location.href);
                    url.searchParams.set("a", encodeAnswers(answers));
                    window.history.replaceState({}, "", url.toString());
                  }}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-md transition-colors uppercase tracking-wider text-sm shadow-sm"
                  data-testid="button-see-score"
                >
                  See My Score <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {Object.keys(answers).length > 0 && (
            <div className="mt-6 text-center">
              <span className="text-xs text-muted-foreground/60">
                Current score: {Object.values(answers).reduce((a, b) => a + b, 0)}/{Object.keys(answers).length * 3} on answered questions
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
