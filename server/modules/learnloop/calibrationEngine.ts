/**
 * LearnLoop Calibration Engine
 * Maps to Specification Section 6.A & UI Pages 4, 19.
 * 3-5 diagnostic questions assessing student's initial mental models.
 */

import { DIAGNOSTIC_QUESTIONS, DiagnosticQuestion, CS_CONCEPTS } from "./ontology";

export interface CalibrationSession {
  id: string;
  userId: string;
  subject: string;
  questionIds: string[];
  currentIndex: number;
  answers: Array<{
    questionId: string;
    optionId: string;
    confidence: "Low" | "Medium" | "High";
    isCorrect: boolean;
    detectedMisconception?: string;
  }>;
  status: "in_progress" | "completed";
  placement?: {
    recommendedStartingConceptId: string;
    masteryEstimates: Record<string, string>;
    summary: string;
  };
  createdAt: string;
}

const calibrationSessions: Record<string, CalibrationSession> = {};

export function startCalibration(userId: string, subject: string = "Computer Science"): CalibrationSession {
  const sessionId = `calib_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  // Select diagnostic questions from ontology
  const questionIds = DIAGNOSTIC_QUESTIONS.map(q => q.id);

  const session: CalibrationSession = {
    id: sessionId,
    userId,
    subject,
    questionIds,
    currentIndex: 0,
    answers: [],
    status: "in_progress",
    createdAt: new Date().toISOString()
  };

  calibrationSessions[sessionId] = session;
  return session;
}

export function getNextCalibrationQuestion(sessionId: string): { question: DiagnosticQuestion | null; isFinished: boolean; progress: number } {
  const session = calibrationSessions[sessionId];
  if (!session) return { question: null, isFinished: true, progress: 1.0 };

  if (session.currentIndex >= session.questionIds.length) {
    return { question: null, isFinished: true, progress: 1.0 };
  }

  const qId = session.questionIds[session.currentIndex];
  const question = DIAGNOSTIC_QUESTIONS.find(q => q.id === qId) || null;
  const progress = session.currentIndex / session.questionIds.length;

  return { question, isFinished: false, progress };
}

export function submitCalibrationAnswer(
  sessionId: string,
  questionId: string,
  optionId: string,
  confidence: "Low" | "Medium" | "High" = "Medium"
) {
  const session = calibrationSessions[sessionId];
  if (!session) throw new Error("Calibration session not found");

  const question = DIAGNOSTIC_QUESTIONS.find(q => q.id === questionId);
  if (!question) throw new Error("Question not found");

  const option = question.options.find(o => o.id === optionId);
  const isCorrect = option ? option.isCorrect : false;
  const detectedMisconception = option?.misconceptionId;

  session.answers.push({
    questionId,
    optionId,
    confidence,
    isCorrect,
    detectedMisconception
  });

  session.currentIndex += 1;

  if (session.currentIndex >= session.questionIds.length) {
    session.status = "completed";
    session.placement = computePlacement(session);
  }

  return {
    isCorrect,
    feedback: option?.explanation || "Answer recorded.",
    isCompleted: session.status === "completed"
  };
}

function computePlacement(session: CalibrationSession) {
  // Analyze answers
  const correctCount = session.answers.filter(a => a.isCorrect).length;
  const hasChainMisconception = session.answers.some(a => a.detectedMisconception === "adds_rates_instead_of_chaining");

  let startingConcept = "chain-rule";
  if (correctCount >= 3 && !hasChainMisconception) {
    startingConcept = "computational-graphs";
  } else if (correctCount <= 1) {
    startingConcept = "derivatives";
  }

  return {
    recommendedStartingConceptId: startingConcept,
    masteryEstimates: {
      "functions": "UNDERSTOOD",
      "derivatives": correctCount >= 1 ? "UNDERSTOOD" : "FAMILIAR",
      "composition": "UNDERSTOOD",
      "chain-rule": hasChainMisconception ? "FAMILIAR" : "UNDERSTOOD",
      "computational-graphs": "EXPOSED",
      "backpropagation": "UNKNOWN",
      "gradient-descent": "UNKNOWN"
    },
    summary: `Calibration placed you at ${CS_CONCEPTS[startingConcept]?.name || startingConcept}. ${hasChainMisconception ? "Focus on compounding rates multiplicatively." : "Strong foundation ready for forward/backward passes."}`
  };
}

export function getCalibrationResult(sessionId: string) {
  const session = calibrationSessions[sessionId];
  if (!session) return null;
  return {
    sessionId: session.id,
    status: session.status,
    answersCount: session.answers.length,
    placement: session.placement || computePlacement(session)
  };
}
