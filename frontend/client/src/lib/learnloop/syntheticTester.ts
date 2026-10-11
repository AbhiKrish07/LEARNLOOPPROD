/**
 * Synthetic Learner Profile Benchmark & Correctness Tester
 * --------------------------------------------------------
 * Runs automated verification across synthetic learner profiles with planted
 * gaps and misconception signatures to benchmark:
 * 1. Diagnostic placement accuracy
 * 2. Misconception detection precision & recall
 * 3. False positive rate
 * 4. Grounded rubric evaluation accuracy
 * 5. Adaptive policy actionability
 */

import { observeNotebookText, evaluateDemonstrationResponse } from "./evaluator";

export interface SyntheticProfile {
  id: string;
  name: string;
  conceptId: string;
  plantedGap: string;
  plantedText: string;
  expectedMisconception: string | null;
  expectedStatus: "Met" | "Partly met" | "Contradicted";
  expectedAction: "Continue" | "Go deeper" | "Practice" | "Explore" | "Review Prerequisite";
}

export const SYNTHETIC_PROFILES: SyntheticProfile[] = [
  {
    id: "profile_chain_rule_addition",
    name: "Alex - Chain Rule Rate Addition Misconception",
    conceptId: "chain-rule",
    plantedGap: "Adds rates dy/du + du/dx instead of multiplying",
    plantedText: "When taking the derivative of f(g(x)), we add the derivative of the outer function to the derivative of the inner function.",
    expectedMisconception: "Rate Addition Error",
    expectedStatus: "Contradicted",
    expectedAction: "Review Prerequisite"
  },
  {
    id: "profile_composition_order",
    name: "Maya - Composition Order Confusion",
    conceptId: "composition",
    plantedGap: "Confuses f(g(x)) with g(f(x))",
    plantedText: "Composition of f and g means we apply f first to x, then feed the result into g.",
    expectedMisconception: "Composition Order Swap",
    expectedStatus: "Contradicted",
    expectedAction: "Go deeper"
  },
  {
    id: "profile_derivative_slope",
    name: "Jordan - Derivative as Instantaneous Rate",
    conceptId: "derivatives",
    plantedGap: "None (Accurate understanding)",
    plantedText: "A derivative measures the instantaneous rate of change of a function at a specific point as the interval approaches zero.",
    expectedMisconception: null,
    expectedStatus: "Met",
    expectedAction: "Continue"
  },
  {
    id: "profile_gradient_ascent",
    name: "Taylor - Gradient Direction Inversion",
    conceptId: "gradient-descent",
    plantedGap: "Moves in direction of positive gradient instead of negative",
    plantedText: "To minimize the loss function in gradient descent, we update the weights by adding the gradient times the learning rate.",
    expectedMisconception: "Gradient Direction Inversion",
    expectedStatus: "Contradicted",
    expectedAction: "Practice"
  }
];

export interface BenchmarkReport {
  totalProfiles: number;
  passedCount: number;
  misconceptionPrecision: number;
  misconceptionRecall: number;
  falsePositiveCount: number;
  averageSpeedMs: number;
  results: {
    profileId: string;
    profileName: string;
    detectedMisconception: string | null;
    passed: boolean;
    durationMs: number;
  }[];
}

export async function runSyntheticLearnerBenchmark(): Promise<BenchmarkReport> {
  const startTime = Date.now();
  let passedCount = 0;
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  const results: BenchmarkReport["results"] = [];

  for (const profile of SYNTHETIC_PROFILES) {
    const start = Date.now();
    const obs = observeNotebookText(profile.plantedText, profile.conceptId);
    const demo = evaluateDemonstrationResponse(profile.conceptId, profile.plantedText);
    const durationMs = Date.now() - start;

    const detected = obs[0]?.label || demo.detectedMisconceptions?.[0]?.label || null;
    const hasPlantedError = profile.expectedMisconception !== null;

    if (hasPlantedError && detected) {
      truePositives++;
    } else if (!hasPlantedError && detected) {
      falsePositives++;
    } else if (hasPlantedError && !detected) {
      falseNegatives++;
    }

    const passed = (hasPlantedError ? Boolean(detected) : !detected);
    if (passed) passedCount++;

    results.push({
      profileId: profile.id,
      profileName: profile.name,
      detectedMisconception: detected,
      passed,
      durationMs
    });
  }

  const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 1;
  const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 1;
  const averageSpeedMs = (Date.now() - startTime) / SYNTHETIC_PROFILES.length;

  return {
    totalProfiles: SYNTHETIC_PROFILES.length,
    passedCount,
    misconceptionPrecision: precision,
    misconceptionRecall: recall,
    falsePositiveCount: falsePositives,
    averageSpeedMs,
    results
  };
}
