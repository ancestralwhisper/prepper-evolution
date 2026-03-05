import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle, Circle, Printer, Share2,
  Download, ExternalLink, Minus, Plus, ChevronDown, ChevronUp,
  AlertTriangle, Info, RotateCcw, X, Users, MessageSquarePlus, Send,
} from "lucide-react";
import PrintQrCode from "@/components/tools/PrintQrCode";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import { trackEvent } from "@/lib/analytics";
import InstallButton from "@/components/tools/InstallButton";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import ZipLookup from "@/components/tools/ZipLookup";
import type { ZipPrefixData } from "./zip-types";
import { hazardToKitClimate } from "./zip-types";
import {
  questions,
  kitItems,
  categoryMeta,
  categoryOrder,
  regionTips,
  climateTips,
  type QuestionId,
  type KitItem,
  type ItemCategory,
  type ItemPriority,
} from "./kit-data";
import { useSEO } from "@/hooks/useSEO";

type Answers = Record<string, string | number | string[]>;

interface CheckedItems {
  [itemId: string]: boolean;
}

const STORAGE_KEY = "pe-72hr-kit";

function evaluateConditions(item: KitItem, answers: Answers): boolean {
  if (!item.conditions || item.conditions.length === 0) return true;

  return item.conditions.every((cond) => {
    const answer = answers[cond.question];

    if (cond.values) {
      if (Array.isArray(answer)) {
        return cond.values.some((v) => answer.includes(v));
      }
      return cond.values.includes(answer as string);
    }

    if (cond.minCount !== undefined) {
      return (answer as number) >= cond.minCount;
    }

    return true;
  });
}

function getBudgetRank(tier: string | undefined): number {
  if (!tier) return 0;
  if (tier === "starter") return 0;
  if (tier === "standard") return 1;
  return 2;
}

function answerBudgetRank(budget: string): number {
  if (budget === "starter") return 0;
  if (budget === "standard") return 1;
  return 2;
}

function getFilteredItems(answers: Answers): KitItem[] {
  const budget = (answers.budget as string) || "standard";
  const budgetLevel = answerBudgetRank(budget);

  return kitItems.filter((item) => {
    if (item.budgetTier && getBudgetRank(item.budgetTier) > budgetLevel) {
      if (item.priority !== "essential") return false;
    }

    return evaluateConditions(item, answers);
  });
}

function calculateQuantity(item: KitItem, answers: Answers): number {
  const adults = (answers.adults as number) || 1;
  const children = (answers.children as number) || 0;
  const totalPeople = adults + children;

  if (item.perPerson) return totalPeople;
  if (item.perAdult) return adults;
  return 1;
}

function formatCurrency(amount: number): string {
  if (amount === 0) return "Free";
  return `$${amount.toLocaleString()}`;
}

const priorityOrder: Record<ItemPriority, number> = {
  essential: 0,
  recommended: 1,
  optional: 2,
};

const priorityColors: Record<ItemPriority, { bg: string; text: string; border: string }> = {
  essential:   { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/20" },
  recommended: { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/20" },
  optional:    { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20" },
};

export default function KitBuilder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);
  const [checked, setChecked] = useState<CheckedItems>({});
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(categoryOrder));
  const [showShareToast, setShowShareToast] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestBrand, setRequestBrand] = useState("");
  const [requestCategory, setRequestCategory] = useState<string>(categoryOrder[0] || "");
  const [requestUrl, setRequestUrl] = useState("");
  const [requestStatus, setRequestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useSEO({
    title: "72-Hour Kit Builder",
    description: "Build a personalized 72-hour emergency kit based on your region, climate, household size, and budget. Get a tailored checklist with cost estimates and affiliate links.",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.answers) setAnswers(data.answers);
        if (data.checked) setChecked(data.checked);
        if (data.showResults) {
          setShowResults(true);
          setStep(questions.length);
        }
      }
    } catch {
    }
    trackEvent("pe_tool_view", { tool: "72hr-kit" });
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const data = { answers, checked, showResults, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [answers, checked, showResults, initialized]);

  const setAnswer = useCallback((questionId: string, value: string | number | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const toggleMulti = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      if (value === "none") {
        return { ...prev, [questionId]: ["none"] };
      }
      const withoutNone = current.filter((v) => v !== "none");
      if (withoutNone.includes(value)) {
        const next = withoutNone.filter((v) => v !== value);
        return { ...prev, [questionId]: next.length === 0 ? ["none"] : next };
      }
      return { ...prev, [questionId]: [...withoutNone, value] };
    });
  }, []);

  const adjustCounter = useCallback((questionId: string, delta: number, min: number, max: number) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as number) ?? questions.find((q) => q.id === questionId)?.default ?? 0;
      return { ...prev, [questionId]: Math.max(min, Math.min(max, current + delta)) };
    });
  }, []);

  const handleZipResult = useCallback((data: ZipPrefixData | null) => {
    if (data) {
      setAnswer("region", data.kr);
      setAnswer("climate", hazardToKitClimate[data.hz] || data.hz);
    }
  }, [setAnswer]);

  const currentQuestion = questions[step];
  const totalSteps = questions.length;

  const canGoNext = useMemo(() => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];

    if (currentQuestion.type === "single") return !!answer;
    if (currentQuestion.type === "multi") return Array.isArray(answer) && answer.length > 0;
    if (currentQuestion.type === "counter") return true;
    return false;
  }, [currentQuestion, answers]);

  const goNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setShowResults(true);
      setStep(totalSteps);
      trackEvent("pe_report_generated", { tool: "72hr-kit" });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const goBack = () => {
    if (showResults) {
      setShowResults(false);
      setStep(totalSteps - 1);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  const startOver = () => {
    setStep(0);
    setAnswers({});
    setChecked({});
    setShowResults(false);
    localStorage.removeItem(STORAGE_KEY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredItems = useMemo(() => {
    if (!showResults) return [];
    return getFilteredItems(answers);
  }, [answers, showResults]);

  const groupedItems = useMemo(() => {
    const groups: Record<ItemCategory, { item: KitItem; qty: number }[]> = {} as Record<ItemCategory, { item: KitItem; qty: number }[]>;

    for (const cat of categoryOrder) {
      groups[cat] = [];
    }

    for (const item of filteredItems) {
      const qty = calculateQuantity(item, answers);
      groups[item.category].push({ item, qty });
    }

    for (const cat of categoryOrder) {
      groups[cat].sort((a, b) => priorityOrder[a.item.priority] - priorityOrder[b.item.priority]);
    }

    return groups;
  }, [filteredItems, answers]);

  const totalCost = useMemo(() => {
    return filteredItems.reduce((sum, item) => {
      const qty = calculateQuantity(item, answers);
      return sum + item.estimatedCost * qty;
    }, 0);
  }, [filteredItems, answers]);

  const itemCounts = useMemo(() => {
    const total = filteredItems.length;
    const essential = filteredItems.filter((i) => i.priority === "essential").length;
    const recommended = filteredItems.filter((i) => i.priority === "recommended").length;
    const optional = filteredItems.filter((i) => i.priority === "optional").length;
    const checkedCount = Object.values(checked).filter(Boolean).length;
    return { total, essential, recommended, optional, checkedCount };
  }, [filteredItems, checked]);

  const toggleChecked = (itemId: string) => {
    setChecked((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const handlePrint = () => window.print();

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${window.location.pathname}`;
  }, []);

  const shareLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  const handleDownloadText = () => {
    const lines: string[] = [];
    lines.push("72-HOUR EMERGENCY KIT CHECKLIST");
    lines.push(`Generated by Prepper Evolution on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
    lines.push("");
    lines.push(`Region: ${answers.region || "N/A"}`);
    lines.push(`Climate concern: ${answers.climate || "N/A"}`);
    lines.push(`Household: ${answers.adults || 1} adults, ${answers.children || 0} children, ${answers.elderly || 0} elderly, ${answers.pets || 0} pets`);
    lines.push(`Budget: ${answers.budget || "standard"}`);
    lines.push(`Estimated total cost: ${formatCurrency(totalCost)}`);
    lines.push("");

    for (const cat of categoryOrder) {
      const items = groupedItems[cat];
      if (items.length === 0) continue;
      lines.push(`--- ${categoryMeta[cat].name.toUpperCase()} ---`);
      for (const { item, qty } of items) {
        const check = checked[item.id] ? "[x]" : "[ ]";
        const qtyStr = qty > 1 ? ` (x${qty})` : "";
        const priority = item.priority === "essential" ? " *ESSENTIAL*" : item.priority === "recommended" ? " (recommended)" : " (optional)";
        lines.push(`${check} ${item.name}${qtyStr}${priority} - ${formatCurrency(item.estimatedCost * qty)}`);
      }
      lines.push("");
    }

    lines.push("---");
    lines.push("Generated at prepperevolution.com/tools/72-hour-kit-builder");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "72-hour-kit-checklist.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

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
          category: requestCategory || undefined,
          amazonUrl: requestUrl.trim() || undefined,
          source: "72hr",
        }),
      });

      if (res.ok) {
        setRequestStatus("sent");
        setRequestName("");
        setRequestBrand("");
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

  const tips = useMemo(() => {
    const region = answers.region as string;
    const climate = answers.climate as string;
    const result: string[] = [];
    if (region && regionTips[region]) result.push(...regionTips[region]);
    if (climate && climateTips[climate]) result.push(...climateTips[climate]);
    return result;
  }, [answers]);

  if (!showResults) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3" data-testid="text-tool-label">Free Tool</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4" data-testid="text-page-title">
              72-Hour Kit <span className="text-primary">Builder</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-page-description">
              Answer a few questions about your household, location, and budget.
              We'll build a personalized 72-hour emergency kit checklist with
              cost estimates and product recommendations.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground" data-testid="text-step-indicator">
                Step {step + 1} of {totalSteps}
              </span>
              <span className="text-xs text-muted-foreground" data-testid="text-step-percent">
                {Math.round(((step + 1) / totalSteps) * 100)}% complete
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-3">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => {
                    if (i <= step) setStep(i);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < step
                      ? "bg-primary scale-100"
                      : i === step
                        ? "bg-primary scale-125 ring-2 ring-primary/30"
                        : "bg-muted"
                  }`}
                  aria-label={`Step ${i + 1}: ${q.title}`}
                  data-testid={`button-step-${i}`}
                />
              ))}
            </div>
          </div>

          {step <= 1 && (
            <ZipLookup onResult={handleZipResult} showFields={["region", "climate", "hazard"]} />
          )}

          {currentQuestion && (
            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 animate-fade-in-up" data-testid="card-question">
              <h2 className="text-xl sm:text-2xl font-extrabold mb-2" data-testid="text-question-title">
                {currentQuestion.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed" data-testid="text-question-subtitle">
                {currentQuestion.subtitle}
              </p>

              {currentQuestion.type === "single" && currentQuestion.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setAnswer(currentQuestion.id, opt.value)}
                        className={`text-left p-4 rounded-lg border transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}
                        data-testid={`button-option-${opt.value}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "border-primary bg-primary" : "border-border"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                          </div>
                          <div>
                            <span className="text-sm font-bold block">{opt.label}</span>
                            {opt.description && (
                              <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">{opt.description}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "multi" && currentQuestion.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt) => {
                    const currentValues = (answers[currentQuestion.id] as string[]) || [];
                    const isSelected = currentValues.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleMulti(currentQuestion.id, opt.value)}
                        className={`text-left p-4 rounded-lg border transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}
                        data-testid={`button-multi-${opt.value}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "border-primary bg-primary" : "border-border"
                          }`}>
                            {isSelected && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
                          </div>
                          <div>
                            <span className="text-sm font-bold block">{opt.label}</span>
                            {opt.description && (
                              <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">{opt.description}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "counter" && (
                <div className="flex items-center justify-center gap-6 py-8">
                  <button
                    onClick={() => adjustCounter(currentQuestion.id, -1, currentQuestion.min ?? 0, currentQuestion.max ?? 10)}
                    className="w-14 h-14 rounded-xl flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                    data-testid="button-counter-decrease"
                  >
                    <Minus className="w-6 h-6" />
                  </button>
                  <span className="text-5xl font-extrabold tabular-nums w-20 text-center" data-testid="text-counter-value">
                    {(answers[currentQuestion.id] as number) ?? currentQuestion.default ?? 0}
                  </span>
                  <button
                    onClick={() => adjustCounter(currentQuestion.id, 1, currentQuestion.min ?? 0, currentQuestion.max ?? 10)}
                    className="w-14 h-14 rounded-xl flex items-center justify-center bg-primary text-primary-foreground transition-colors"
                    data-testid="button-counter-increase"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={goBack}
              disabled={step === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
                step === 0
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "bg-muted border border-border hover:bg-card text-foreground"
              }`}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={goNext}
              disabled={!canGoNext}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
                canGoNext
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-primary/30 text-primary-foreground/50 cursor-not-allowed"
              }`}
              data-testid="button-next"
            >
              {step === totalSteps - 1 ? "Build My Kit" : "Next"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={resultsRef} className="min-h-screen bg-background pt-24 pb-20">
      <div className="print-only">
        <div className="print-header">
          <img src="/pe-badge.png" alt="Prepper Evolution" className="print-logo" />
          <div>
            <h2 className="print-title">72-Hour Kit Checklist</h2>
            <p className="print-date">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        <div className="print-summary">
          <div className="print-summary-grid">
            <div>
              <span className="print-label">Total Items</span>
              <span className="print-value">{itemCounts.total}</span>
            </div>
            <div>
              <span className="print-label">Essential</span>
              <span className="print-value">{itemCounts.essential}</span>
            </div>
            <div>
              <span className="print-label">Est. Cost</span>
              <span className="print-value">{formatCurrency(totalCost)}</span>
            </div>
            <div>
              <span className="print-label">Household</span>
              <span className="print-value">{(answers.adults as number) || 1} + {(answers.children as number) || 0}</span>
              <span className="print-sub">adults + kids</span>
            </div>
          </div>
        </div>

        <table className="print-gear-table">
          <thead>
            <tr>
              <th style={{ width: "5%" }}></th>
              <th style={{ width: "40%" }}>Item</th>
              <th style={{ width: "15%", textAlign: "center" }}>Priority</th>
              <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
              <th style={{ width: "15%", textAlign: "right" }}>Est. Cost</th>
            </tr>
          </thead>
          <tbody>
            {categoryOrder.map((cat) => {
              const items = groupedItems[cat];
              if (items.length === 0) return null;
              return (
                <tbody key={`print-${cat}`}>
                  <tr className="print-cat-header">
                    <td colSpan={5}>
                      <span className="print-cat-dot" style={{ backgroundColor: categoryMeta[cat].color }} />
                      {categoryMeta[cat].name}
                    </td>
                  </tr>
                  {items.map(({ item, qty }) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: "center" }}>{checked[item.id] ? "[x]" : "[ ]"}</td>
                      <td>{item.name}</td>
                      <td style={{ textAlign: "center" }}>{item.priority}</td>
                      <td style={{ textAlign: "center" }}>{qty > 1 ? `x${qty}` : "1"}</td>
                      <td style={{ textAlign: "right" }}>{formatCurrency(item.estimatedCost * qty)}</td>
                    </tr>
                  ))}
                </tbody>
              );
            })}
            <tr className="print-total-row">
              <td colSpan={4} style={{ textAlign: "right", fontWeight: 700 }}>ESTIMATED TOTAL</td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(totalCost)}</td>
            </tr>
          </tbody>
        </table>

        <PrintQrCode url={getShareUrl()} />

        <p className="print-footer">
          Generated at prepperevolution.com/tools/72-hour-kit-builder &mdash; {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 no-print">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold mb-1" data-testid="text-results-title">
                Your Personalized 72-Hour Kit
              </h2>
              <p className="text-sm text-muted-foreground" data-testid="text-results-description">
                {itemCounts.total} items tailored to your region, climate, household, and budget.
                Check off items you already own.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-muted border border-border hover:bg-card transition-colors"
                data-testid="button-edit-answers"
              >
                <ArrowLeft className="w-3 h-3" /> Edit Answers
              </button>
              <button
                onClick={startOver}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-muted border border-border hover:bg-card transition-colors"
                data-testid="button-start-over"
              >
                <RotateCcw className="w-3 h-3" /> Start Over
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4 text-center" data-testid="stat-total-items">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Items</p>
            <p className="text-2xl font-extrabold">{itemCounts.total}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center" data-testid="stat-essential">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Essential</p>
            <p className="text-2xl font-extrabold text-red-400">{itemCounts.essential}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center" data-testid="stat-checked">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Checked Off</p>
            <p className="text-2xl font-extrabold text-green-400">{itemCounts.checkedCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center" data-testid="stat-cost">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Est. Cost</p>
            <p className="text-2xl font-extrabold text-primary">{formatCurrency(totalCost)}</p>
          </div>
        </div>

        {itemCounts.total > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Kit Completion</span>
              <span className="text-xs text-muted-foreground">{itemCounts.checkedCount} / {itemCounts.total} items</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(itemCounts.checkedCount / itemCounts.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {categoryOrder.map((cat) => {
              const items = groupedItems[cat];
              if (items.length === 0) return null;

              const meta = categoryMeta[cat];
              const isExpanded = expandedCats.has(cat);
              const catChecked = items.filter(({ item }) => checked[item.id]).length;

              return (
                <div key={cat} className="bg-card border border-border rounded-lg overflow-hidden" data-testid={`category-${cat}`}>
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    aria-expanded={isExpanded}
                    data-testid={`toggle-category-${cat}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="font-bold text-sm uppercase tracking-wide">{meta.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {catChecked}/{items.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {catChecked === items.length && items.length > 0 && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border">
                      {items.map(({ item, qty }) => {
                        const isChecked = !!checked[item.id];
                        const pColors = priorityColors[item.priority];

                        return (
                          <div
                            key={item.id}
                            className={`px-4 py-3 border-b border-border/50 last:border-b-0 transition-all duration-200 ${
                              isChecked ? "bg-green-500/5" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleChecked(item.id)}
                                className="mt-0.5 shrink-0"
                                aria-label={`Mark ${item.name} as ${isChecked ? "incomplete" : "complete"}`}
                                data-testid={`toggle-check-${item.id}`}
                              >
                                {isChecked ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-primary transition-colors" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-sm font-medium transition-all ${
                                    isChecked ? "line-through text-muted-foreground" : "text-foreground"
                                  }`}>
                                    {item.name}
                                  </span>
                                  {qty > 1 && (
                                    <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                      x{qty}
                                    </span>
                                  )}
                                  <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${pColors.bg} ${pColors.text}`}>
                                    {item.priority}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="text-[11px] text-muted-foreground font-medium">
                                    {formatCurrency(item.estimatedCost * qty)}
                                  </span>
                                  {item.affiliateUrl && (
                                    <a
                                      href={item.affiliateUrl}
                                      target="_blank"
                                      rel="noopener noreferrer nofollow"
                                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                                      data-testid={`link-buy-${item.id}`}
                                    >
                                      Buy on Amazon <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                  {item.affiliateNote && (
                                    <span className="text-[10px] text-muted-foreground/50">{item.affiliateNote}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-none space-y-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadText}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 text-sm font-bold uppercase tracking-wide transition-colors"
                  data-testid="button-download"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-card transition-colors"
                  data-testid="button-print"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={shareLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-card transition-colors"
                  data-testid="button-share"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <InstallButton />
              </div>

              {showShareToast && (
                <div className="bg-green-500/15 border border-green-500/30 text-green-400 text-sm rounded-lg p-3 text-center animate-fade-in-up">
                  Link copied to clipboard!
                </div>
              )}

              <ToolSocialShare url={getShareUrl()} toolName="72-Hour Kit Builder" />

              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Cost Breakdown</h3>
                <div className="space-y-2">
                  {categoryOrder.map((cat) => {
                    const items = groupedItems[cat];
                    if (items.length === 0) return null;
                    const catCost = items.reduce((sum, { item, qty }) => sum + item.estimatedCost * qty, 0);
                    const pct = totalCost > 0 ? (catCost / totalCost) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: categoryMeta[cat].color }} />
                            <span className="text-muted-foreground">{categoryMeta[cat].name}</span>
                          </div>
                          <span className="font-bold tabular-nums">{formatCurrency(catCost)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: categoryMeta[cat].color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Total</span>
                  <span className="text-lg font-extrabold text-primary">{formatCurrency(totalCost)}</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Priority Guide</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${priorityColors.essential.bg} ${priorityColors.essential.text}`}>
                      Essential
                    </span>
                    <span className="text-xs text-muted-foreground">Must-have items. Get these first.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${priorityColors.recommended.bg} ${priorityColors.recommended.text}`}>
                      Recommended
                    </span>
                    <span className="text-xs text-muted-foreground">Significantly improves your kit.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${priorityColors.optional.bg} ${priorityColors.optional.text}`}>
                      Optional
                    </span>
                    <span className="text-xs text-muted-foreground">Nice to have when budget allows.</span>
                  </div>
                </div>
              </div>

              {tips.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wide">Tips for Your Area</h3>
                  </div>
                  <ul className="space-y-2">
                    {tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5 shrink-0">&bull;</span>
                        <span className="text-xs text-muted-foreground leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-muted rounded-lg p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Your Answers</h4>
                <ul className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
                  <li>&bull; <strong className="text-foreground">Region:</strong> {answers.region || "N/A"}</li>
                  <li>&bull; <strong className="text-foreground">Climate concern:</strong> {answers.climate || "N/A"}</li>
                  <li>&bull; <strong className="text-foreground">Household:</strong> {answers.adults || 1} adults, {answers.children || 0} children</li>
                  <li>&bull; <strong className="text-foreground">Elderly:</strong> {answers.elderly || 0}</li>
                  <li>&bull; <strong className="text-foreground">Pets:</strong> {answers.pets || 0}</li>
                  <li>&bull; <strong className="text-foreground">Medical:</strong> {Array.isArray(answers.medical) ? (answers.medical as string[]).join(", ") : "none"}</li>
                  <li>&bull; <strong className="text-foreground">Shelter:</strong> {answers.shelter || "N/A"}</li>
                  <li>&bull; <strong className="text-foreground">Vehicle:</strong> {answers.vehicle || "N/A"}</li>
                  <li>&bull; <strong className="text-foreground">Budget:</strong> {answers.budget || "standard"}</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Community Driven</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This calculator is community-driven. We&apos;re constantly adding products based on what
                      real preppers use.
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
                    Missing a Product? Request It
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-primary">Request a Product</h4>
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
                        <p className="text-xs text-muted-foreground mt-1">We&apos;ll review it and add it if it fits. Thanks for helping us improve.</p>
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
                          <select
                            value={requestCategory}
                            onChange={(e) => setRequestCategory(e.target.value)}
                            className="bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                            aria-label="Product category"
                            data-testid="select-request-category"
                          >
                            {categoryOrder.map((cat) => (
                              <option key={cat} value={cat}>{categoryMeta[cat].name}</option>
                            ))}
                          </select>
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

                        <p className="text-[10px] text-muted-foreground/50 text-center">
                          All requests are reviewed before being added. We typically update weekly.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                Product links are affiliate links &mdash; we earn a commission at no extra cost to you.
                Prices are estimated and may vary. Always verify current pricing before purchasing.
              </p>

              <DataPrivacyNotice />
              <SupportFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
