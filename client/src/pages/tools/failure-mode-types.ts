// ─── Failure Mode Diagnostic Tree — Type Definitions ─────────────────────────

export type FailureCategory =
  | "water"
  | "fire"
  | "power"
  | "recovery"
  | "shelter";

export type NodeType = "mechanical" | "electrical" | "chemical";

export type Severity =
  | 1  // Annoyance — trip continues
  | 2  // Degraded — workaround exists
  | 3  // Significant — mission impact
  | 4  // Critical — safety risk
  | 5; // Lethal — discard / evacuate

export interface DiagSolution {
  type: "solution";
  cause: string;
  likelihood: number; // 0–100 percent
  severity: Severity;
  standardFix: string;
  improvisedFix?: string;   // common camp items
  extremeFix?: string;      // natural/found materials — gated
  safetyWarning?: string;   // triggers red modal — must acknowledge
  danger?: boolean;         // true = discard / do not use
  requiredTools?: string[];
  fieldNote?: string;       // extra context
}

export interface DiagQuestion {
  type: "question";
  text: string;
  yes: DiagStep;
  no: DiagStep;
}

export type DiagStep = DiagQuestion | DiagSolution;

export interface FailureNode {
  id: string;
  category: FailureCategory;
  deviceType: string;
  symptom: string;
  symptomDetail: string;
  nodeType: NodeType;
  tree: DiagStep;
}

export interface CategoryMeta {
  id: FailureCategory;
  label: string;
  icon: string;
  color: string;
  description: string;
}
