/**
 * LearnLoop Deterministic Adaptive Policy Engine
 * Maps to Specification Section 6.C.
 * Rules-based decision engine recommending the next pedagogical action.
 */

export type RecommendedAction = "EXPLORE" | "GO_DEEPER" | "PRACTICE" | "CONTINUE";

export interface LearnerConceptState {
  level: "UNKNOWN" | "EXPOSED" | "FAMILIAR" | "UNDERSTOOD" | "APPLIED";
  confidence: "Low" | "Emerging" | "Moderate" | "Strong";
  prerequisiteGap: boolean;
  misconceptionsFound: string[];
}

export interface LatestEvidence {
  kind: "work_check" | "retest" | "quiz" | "demonstration" | "calibration";
  isCorrect: boolean;
  misconceptionId?: string | null;
  confidence?: "Low" | "Emerging" | "Moderate" | "Strong";
}

export interface PolicyDecision {
  action: RecommendedAction;
  reasonCode: string;
  explanation: string;
}

export function chooseNextAction(
  state: LearnerConceptState,
  latestEvidence?: LatestEvidence
): PolicyDecision {
  // Rule 1: Prerequisite concepts are weak -> GO_DEEPER into prerequisite
  if (state.prerequisiteGap) {
    return {
      action: "GO_DEEPER",
      reasonCode: "PREREQUISITE_DEFICIT",
      explanation: "A prerequisite concept needs reinforcement before moving forward."
    };
  }

  // Rule 2: A misconception was just identified -> PRACTICE
  if (latestEvidence && latestEvidence.misconceptionId) {
    return {
      action: "PRACTICE",
      reasonCode: "ACTIVE_MISCONCEPTION",
      explanation: `Targeted practice needed to address: ${latestEvidence.misconceptionId}.`
    };
  }

  // Rule 3: Retest handling
  if (latestEvidence && latestEvidence.kind === "retest") {
    if (!latestEvidence.isCorrect) {
      return {
        action: "GO_DEEPER",
        reasonCode: "RETEST_FAILED",
        explanation: "Retest did not pass. Recommended to review foundational principles."
      };
    }
    if (latestEvidence.confidence === "Low" || latestEvidence.confidence === "Emerging") {
      return {
        action: "PRACTICE",
        reasonCode: "RETEST_PASSED_LOW_CONFIDENCE",
        explanation: "Retest passed, but confidence is low. Practice a transfer problem."
      };
    }
  }

  // Rule 4: High uncertainty or no prior evidence -> EXPLORE
  if (state.level === "UNKNOWN" || state.level === "EXPOSED") {
    return {
      action: "EXPLORE",
      reasonCode: "NOVEL_CONCEPT",
      explanation: "Explore interactive examples and demonstrations to build initial familiarity."
    };
  }

  // Rule 5: Fully applied mastery -> CONTINUE
  if (state.level === "APPLIED" || (state.level === "UNDERSTOOD" && state.confidence === "Strong")) {
    return {
      action: "CONTINUE",
      reasonCode: "MASTERY_ESTABLISHED",
      explanation: "Independent reasoning is sound and confident. Ready to proceed to next concept."
    };
  }

  // Rule 6: Confidence low -> EXPLORE
  if (state.confidence === "Low") {
    return {
      action: "EXPLORE",
      reasonCode: "LOW_CONFIDENCE",
      explanation: "Explore alternative visual perspectives and interactive simulations."
    };
  }

  return {
    action: "CONTINUE",
    reasonCode: "NORMAL_PROGRESSION",
    explanation: "Steady progression across concept track."
  };
}
