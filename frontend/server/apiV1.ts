/**
 * LearnLoop Complete REST API Router (v1)
 * Maps directly to Section 10 of the LearnLoop Backend Specification.
 *
 * Mounted under /api/v1
 */

import { Router, Request, Response, NextFunction } from "express";
import { CS_CONCEPTS, MISCONCEPTIONS } from "./modules/learnloop/ontology";
import { evaluateStepChain, evaluateRetestSubmission } from "./modules/learnloop/evaluationEngine";
import {
  getSimulationsCatalog,
  runChainRuleSim,
  runGradientDescentSim,
  saveSimulationPrediction,
  pinSimulationToPage,
  getSimulationById
} from "./modules/learnloop/simulationsEngine";
import {
  startCalibration,
  getNextCalibrationQuestion,
  submitCalibrationAnswer,
  getCalibrationResult
} from "./modules/learnloop/calibrationEngine";
import { runAgent, agentEventsLog } from "./modules/learnloop/agentRuntime";
import {
  devGetLearnLoopModel,
  devSaveLearnLoopModel,
  devListLearnLoopEvidence,
  devSaveLearnLoopEvidence,
  devGetLearnLoopBrain,
  devAddLearnLoopSession,
  devGetLearnLoopAgents,
  devSaveLearnLoopAgents,
  devSyncLearnLoopStrokes
} from "./devStore";

export const apiV1Router = Router();

// Helper for consistent error response format (Section 10)
function errorResponse(res: Response, status: number, code: string, message: string, details: any = {}) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return res.status(status).json({
    error: {
      code,
      message,
      request_id: requestId,
      details
    }
  });
}

// In-memory evaluation store for polling/retrieval
const evaluationsStore: Record<string, any> = {};

// ─────────────────────────────────────────────────────────────
// 1. AUTHENTICATION & ONBOARDING
// ─────────────────────────────────────────────────────────────
apiV1Router.post("/auth/email/start", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return errorResponse(res, 400, "INVALID_EMAIL", "A valid email address is required.");
  }
  return res.json({
    status: "code_sent",
    email,
    expires_in_seconds: 600,
    message: "Verification code sent to email."
  });
});

apiV1Router.post("/auth/email/verify", (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return errorResponse(res, 400, "MISSING_FIELDS", "Email and verification code are required.");
  }
  // Accepts demo code or 6 digits
  return res.json({
    access_token: `token_${Date.now()}`,
    user: {
      id: "1",
      email,
      name: email.split("@")[0],
      theme: "system"
    }
  });
});

apiV1Router.post("/auth/oauth/:provider", (req: Request, res: Response) => {
  const { provider } = req.params;
  return res.json({
    status: "authenticated",
    provider,
    user: {
      id: "1",
      email: `user@${provider}.com`,
      name: `${provider} User`
    }
  });
});

apiV1Router.post("/auth/logout", (_req: Request, res: Response) => {
  return res.json({ status: "logged_out" });
});

apiV1Router.get("/users/me", (_req: Request, res: Response) => {
  return res.json({
    id: "1",
    name: "Alex Learner",
    email: "learner@learnloop.ai",
    theme: "light",
    preferences: {
      cornerCharacter: "face",
      nudges: "normal",
      defaultPageType: "ruled"
    }
  });
});

apiV1Router.patch("/users/me", (req: Request, res: Response) => {
  return res.json({
    id: "1",
    ...req.body,
    updated_at: new Date().toISOString()
  });
});

apiV1Router.get("/onboarding", (_req: Request, res: Response) => {
  return res.json({
    step: "completed",
    selectedSubjects: ["Calculus", "Computer Science"],
    hasCalibrated: true
  });
});

apiV1Router.patch("/onboarding", (req: Request, res: Response) => {
  return res.json({
    status: "saved",
    ...req.body
  });
});

// Calibration endpoints
apiV1Router.post("/calibration/start", (req: Request, res: Response) => {
  const subject = req.body.subject || "Computer Science";
  const session = startCalibration("1", subject);
  return res.status(201).json(session);
});

apiV1Router.get("/calibration/:id/next", (req: Request, res: Response) => {
  const { id } = req.params;
  const nextQ = getNextCalibrationQuestion(id);
  return res.json(nextQ);
});

apiV1Router.post("/calibration/:id/answers", (req: Request, res: Response) => {
  const { id } = req.params;
  const { questionId, optionId, confidence } = req.body;
  if (!questionId || !optionId) {
    return errorResponse(res, 400, "MISSING_FIELDS", "questionId and optionId are required.");
  }
  try {
    const outcome = submitCalibrationAnswer(id, questionId, optionId, confidence);
    return res.json(outcome);
  } catch (err: any) {
    return errorResponse(res, 404, "NOT_FOUND", err.message);
  }
});

apiV1Router.get("/calibration/:id/result", (req: Request, res: Response) => {
  const { id } = req.params;
  const result = getCalibrationResult(id);
  if (!result) return errorResponse(res, 404, "NOT_FOUND", "Calibration session not found.");
  return res.json(result);
});

// ─────────────────────────────────────────────────────────────
// 2. NOTEBOOKS AND WRITING
// ─────────────────────────────────────────────────────────────
apiV1Router.get("/notebooks", (_req: Request, res: Response) => {
  return res.json({
    notebooks: [
      {
        id: "chain-rule",
        owner_id: "1",
        title: "Chain Rule",
        subject: "Calculus",
        cover: "#A8CDEE",
        is_favorite: true,
        updated_at: new Date().toISOString()
      },
      {
        id: "computational-graphs",
        owner_id: "1",
        title: "Computational Graphs",
        subject: "Computer Science",
        cover: "#C3B4E8",
        is_favorite: false,
        updated_at: new Date().toISOString()
      },
      {
        id: "backpropagation",
        owner_id: "1",
        title: "Backpropagation",
        subject: "Deep Learning",
        cover: "#F3C5A8",
        is_favorite: false,
        updated_at: new Date().toISOString()
      }
    ]
  });
});

apiV1Router.post("/notebooks", (req: Request, res: Response) => {
  const { title, subject, cover } = req.body;
  return res.status(201).json({
    id: `nb_${Date.now()}`,
    owner_id: "1",
    title: title || "Untitled Notebook",
    subject: subject || "General",
    cover: cover || "#A8CDEE",
    is_favorite: false,
    created_at: new Date().toISOString()
  });
});

apiV1Router.get("/notebooks/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  return res.json({
    id,
    owner_id: "1",
    title: id === "chain-rule" ? "Chain Rule" : "Untitled Notebook",
    subject: "Calculus",
    cover: "#A8CDEE",
    pages: [{ id: "page_1", title: "Derivation & Examples", position: 1 }]
  });
});

apiV1Router.patch("/notebooks/:id", (req: Request, res: Response) => {
  return res.json({ id: req.params.id, ...req.body, updated_at: new Date().toISOString() });
});

apiV1Router.delete("/notebooks/:id", (req: Request, res: Response) => {
  return res.json({ success: true, deleted_id: req.params.id });
});

apiV1Router.post("/notebooks/:id/pages", (req: Request, res: Response) => {
  return res.status(201).json({
    id: `page_${Date.now()}`,
    notebook_id: req.params.id,
    title: req.body.title || "Page 1",
    page_type: req.body.page_type || "ruled",
    position: 1,
    version: 1
  });
});

apiV1Router.get("/pages/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  return res.json({
    id,
    notebook_id: "chain-rule",
    title: "Chain Rule",
    page_type: "ruled",
    position: 1,
    version: 7,
    blocks: [
      { id: "b1", kind: "heading", content_json: { text: "Chain Rule" }, position: 1 },
      { id: "b2", kind: "math", content_json: { formula: "y = (3x + 1)^2" }, position: 2 },
      { id: "b3", kind: "step_chain", content_json: { steps: ["u = 3x + 1, y = u^2", "dy/du = 2u", "du/dx = 3", "dy/dx = 2u + 3"] }, position: 3 }
    ]
  });
});

apiV1Router.patch("/pages/:id", (req: Request, res: Response) => {
  const ifMatch = req.header("If-Match");
  // Optimistic concurrency check example:
  if (ifMatch && ifMatch === "revision-old") {
    return errorResponse(res, 409, "PAGE_VERSION_CONFLICT", "This page has changed since you last loaded it.");
  }
  return res.json({
    id: req.params.id,
    version: 8,
    ...req.body,
    updated_at: new Date().toISOString()
  });
});

apiV1Router.post("/pages/:id/blocks", (req: Request, res: Response) => {
  return res.status(201).json({
    id: `blk_${Date.now()}`,
    page_id: req.params.id,
    kind: req.body.kind || "text",
    content_json: req.body.content_json || {},
    position: req.body.position || 1,
    version: 1
  });
});

apiV1Router.patch("/blocks/:id", (req: Request, res: Response) => {
  return res.json({ id: req.params.id, ...req.body, version: 2 });
});

apiV1Router.delete("/blocks/:id", (req: Request, res: Response) => {
  return res.json({ success: true, deleted_id: req.params.id });
});

apiV1Router.put("/blocks/:id/concepts", (req: Request, res: Response) => {
  return res.json({
    block_id: req.params.id,
    concept_ids: req.body.concept_ids || ["chain-rule"],
    tag_source: "user",
    updated_at: new Date().toISOString()
  });
});

apiV1Router.post("/pages/:id/ink", (req: Request, res: Response) => {
  const result = devSyncLearnLoopStrokes("1", req.params.id, req.body.operations || []);
  return res.json(result);
});

apiV1Router.post("/pages/:id/convert-ink", (_req: Request, res: Response) => {
  return res.json({
    converted_text: "dy/dx = (dy/du) * (du/dx)",
    confidence: 0.96
  });
});

// ─────────────────────────────────────────────────────────────
// 3. INTELLIGENCE AND AGENTS (SPOTTER, COACH, ETC.)
// ─────────────────────────────────────────────────────────────
apiV1Router.post("/evaluations", (req: Request, res: Response) => {
  const { page_id, concept_id, steps } = req.body;
  const evalResult = evaluateStepChain(concept_id || "chain-rule", steps || [], page_id);
  evaluationsStore[evalResult.id] = evalResult;

  // Persist evidence event
  devSaveLearnLoopEvidence("1", {
    conceptId: evalResult.concept_id,
    sourceText: JSON.stringify(steps),
    resultStatus: evalResult.status === "correct" ? "Met" : "Slip found",
    brokenStep: evalResult.first_invalid_step,
    detectedMisconception: evalResult.error_type,
    confidence: "Strong",
    type: "spotter_evaluation"
  });

  return res.json(evalResult);
});

apiV1Router.get("/evaluations/:id", (req: Request, res: Response) => {
  const ev = evaluationsStore[req.params.id];
  if (!ev) return errorResponse(res, 404, "NOT_FOUND", "Evaluation ID not found.");
  return res.json(ev);
});

apiV1Router.post("/evaluations/:id/explain", (req: Request, res: Response) => {
  const ev = evaluationsStore[req.params.id];
  return res.json({
    evaluation_id: req.params.id,
    concept: ev?.concept_id || "chain-rule",
    detailed_explanation: "Along a composition f(g(x)), the rate of change is a chain of multiplications. dy/dx = (dy/du) * (du/dx). When rates are added, the intermediate sensitivity is lost.",
    analogy: "Think of two gears connected by a chain: if gear 1 turns 3 times for every rotation of x, and gear 2 turns 2 times for every rotation of gear 1, then gear 2 turns 2 * 3 = 6 times per rotation of x, not 2 + 3 = 5."
  });
});

apiV1Router.post("/evaluations/:id/retest", (req: Request, res: Response) => {
  return res.json({
    retest_id: `retest_${Date.now()}`,
    concept_id: "chain-rule",
    misconception_targeted: "adds_rates_instead_of_chaining",
    title: "Retest: Same Idea, New Numbers",
    problem: "Differentiate y = (5x - 2)^3. Show intermediate rates and write each step.",
    expected_inner: "u = 5x - 2",
    expected_outer_derivative: "3u^2",
    expected_inner_derivative: "5"
  });
});

apiV1Router.post("/retests/:id/submit", (req: Request, res: Response) => {
  const { concept_id, steps } = req.body;
  const result = evaluateRetestSubmission(concept_id || "chain-rule", steps || "");

  if (result.isPassed) {
    const model = devGetLearnLoopModel("1");
    if (model && model.conceptRecords) {
      if (model.conceptRecords["chain-rule"]) {
        model.conceptRecords["chain-rule"].state = "Understood";
        model.conceptRecords["chain-rule"].confidence = "Strong";
      }
      if (model.conceptRecords["computational-graphs"]) {
        model.conceptRecords["computational-graphs"].state = "Understood";
      }
      if (model.conceptRecords["backpropagation"]) {
        model.conceptRecords["backpropagation"].state = "Familiar";
      }
      devSaveLearnLoopModel("1", model);
    }
  }

  devSaveLearnLoopEvidence("1", {
    conceptId: concept_id || "chain-rule",
    sourceText: steps,
    resultStatus: result.isPassed ? "Retest passed" : "Retest failed",
    confidence: "Strong",
    type: "retest"
  });

  return res.json(result);
});

apiV1Router.post("/agents/:name/run", async (req: Request, res: Response) => {
  const { name } = req.params;
  const context = {
    userId: "1",
    notebookId: req.body.notebook_id || "chain-rule",
    pageId: req.body.page_id,
    conceptIds: req.body.concept_ids || ["chain-rule"],
    selectedBlockIds: req.body.selected_block_ids || [],
    requestId: `req_${Date.now()}`,
    trigger: req.body.trigger,
    inputPayload: req.body.input_payload
  };

  try {
    const outcome = await runAgent(name, context);
    return res.json(outcome);
  } catch (err: any) {
    return errorResponse(res, 400, "AGENT_EXECUTION_ERROR", err.message);
  }
});

apiV1Router.get("/agents/events", (_req: Request, res: Response) => {
  return res.json({ events: agentEventsLog });
});

// Concepts & Ontology
apiV1Router.get("/concepts", (_req: Request, res: Response) => {
  return res.json({ concepts: Object.values(CS_CONCEPTS) });
});

apiV1Router.get("/concepts/:id", (req: Request, res: Response) => {
  const c = CS_CONCEPTS[req.params.id];
  if (!c) return errorResponse(res, 404, "NOT_FOUND", "Concept not found in ontology.");
  return res.json(c);
});

// Learner Model & Growth
apiV1Router.get("/learners/me/concepts", (_req: Request, res: Response) => {
  const model = devGetLearnLoopModel("1");
  return res.json({ concepts: model?.conceptRecords || {} });
});

apiV1Router.get("/learners/me/evidence", (_req: Request, res: Response) => {
  const evidence = devListLearnLoopEvidence("1");
  return res.json({ evidence });
});

apiV1Router.get("/growth/summary", (_req: Request, res: Response) => {
  const model = devGetLearnLoopModel("1");
  const evidence = devListLearnLoopEvidence("1");
  return res.json({
    masteryLevels: model?.conceptRecords || {},
    recentEvidence: evidence.slice(0, 5),
    growthTier: "Flourishing",
    totalDemonstrations: evidence.length,
    activeMisconceptions: [
      {
        id: "adds_rates_instead_of_chaining",
        pattern: "Adds rates instead of chaining them",
        occurrences: 2,
        conceptId: "chain-rule",
        status: "retested"
      }
    ],
    recommendedAction: "CONTINUE"
  });
});

apiV1Router.get("/growth/mistakes", (_req: Request, res: Response) => {
  return res.json({
    mistakes: [
      {
        id: "adds_rates_instead_of_chaining",
        pattern: "Adds rates instead of chaining them",
        concept_id: "chain-rule",
        occurrences: 2,
        crossNotebookNote: "Observed in Chain Rule and Product Rule notes."
      }
    ]
  });
});

// ─────────────────────────────────────────────────────────────
// 4. SIMULATIONS, SESSIONS & BRAIN
// ─────────────────────────────────────────────────────────────
apiV1Router.get("/simulations/catalog", (_req: Request, res: Response) => {
  return res.json({ catalog: getSimulationsCatalog() });
});

apiV1Router.post("/simulations/chain-rule/run", (req: Request, res: Response) => {
  const sim = runChainRuleSim(req.body);
  return res.json(sim);
});

apiV1Router.post("/simulations/gradient-descent/run", (req: Request, res: Response) => {
  const sim = runGradientDescentSim(req.body);
  return res.json(sim);
});

apiV1Router.post("/simulations/:id/predictions", (req: Request, res: Response) => {
  const sim = saveSimulationPrediction(req.params.id, req.body.prediction);
  if (!sim) return errorResponse(res, 404, "NOT_FOUND", "Simulation record not found.");
  return res.json(sim);
});

apiV1Router.post("/simulations/:id/pin", (req: Request, res: Response) => {
  const sim = pinSimulationToPage(req.params.id, req.body.page_id);
  if (!sim) return errorResponse(res, 404, "NOT_FOUND", "Simulation record not found.");
  return res.json({ status: "pinned", simulation: sim });
});

apiV1Router.get("/simulations/:id", (req: Request, res: Response) => {
  const sim = getSimulationById(req.params.id);
  if (!sim) return errorResponse(res, 404, "NOT_FOUND", "Simulation record not found.");
  return res.json(sim);
});

// Sessions & Brain
apiV1Router.post("/sessions/start", (req: Request, res: Response) => {
  const sessionId = `sess_${Date.now()}`;
  return res.status(201).json({
    id: sessionId,
    user_id: "1",
    notebook_id: req.body.notebook_id || "chain-rule",
    concept_id: req.body.concept_id || "chain-rule",
    started_at: new Date().toISOString(),
    status: "active"
  });
});

apiV1Router.post("/sessions/:id/finish", (req: Request, res: Response) => {
  const session = devAddLearnLoopSession("1", {
    conceptId: req.body.concept_id || "chain-rule",
    title: req.body.title || "Study Session",
    durationMinutes: req.body.duration_minutes || 25,
    pagesWritten: req.body.pages_written || 2,
    slipsFixed: req.body.slips_fixed || 1,
    retestsPassed: req.body.retests_passed || 1
  });
  return res.json({ status: "finished", session });
});

apiV1Router.get("/brain", (_req: Request, res: Response) => {
  const brain = devGetLearnLoopBrain("1");
  return res.json(brain);
});

apiV1Router.get("/brain/sessions/:id", (req: Request, res: Response) => {
  const brain = devGetLearnLoopBrain("1");
  const session = brain.neurons.find((n: any) => n.id === req.params.id);
  if (!session) return errorResponse(res, 404, "NOT_FOUND", "Session record not found.");
  return res.json(session);
});

// ─────────────────────────────────────────────────────────────
// 5. SEARCH, SOURCES & COURSES
// ─────────────────────────────────────────────────────────────
apiV1Router.get("/search", (req: Request, res: Response) => {
  const q = String(req.query.q || "").toLowerCase().trim();
  const scope = String(req.query.scope || "all").toLowerCase();

  const results: any[] = [];

  if (scope === "all" || scope === "notebooks") {
    results.push({
      type: "notebook",
      id: "chain-rule",
      title: "Chain Rule",
      snippet: "Slopes on a path multiply like gear ratios: dy/dx = (dy/du) · (du/dx)."
    });
  }
  if (scope === "all" || scope === "concepts") {
    results.push({
      type: "concept",
      id: "chain-rule",
      title: "Chain Rule",
      status: "UNDERSTOOD"
    });
  }
  if (scope === "all" || scope === "mistakes") {
    results.push({
      type: "mistake",
      id: "adds_rates_instead_of_chaining",
      title: "Adds rates instead of chaining them",
      concept_id: "chain-rule"
    });
  }
  if (scope === "all" || scope === "sources") {
    results.push({
      type: "source",
      id: "src_mit_calc",
      title: "MIT 18.01 Single Variable Calculus Notes",
      snippet: "Chapter 3: The derivative of f(g(x)) is f'(g(x))g'(x)."
    });
  }

  const filtered = results.filter(r => !q || r.title.toLowerCase().includes(q) || (r.snippet && r.snippet.toLowerCase().includes(q)));
  return res.json({ query: q, scope, results: filtered });
});

apiV1Router.post("/sources/upload", (req: Request, res: Response) => {
  return res.status(201).json({
    id: `src_${Date.now()}`,
    owner_id: "1",
    title: req.body.title || "Uploaded Document.pdf",
    type: "pdf",
    status: "uploaded"
  });
});

apiV1Router.post("/sources/:id/process", (req: Request, res: Response) => {
  return res.json({
    source_id: req.params.id,
    status: "processed",
    chunk_count: 14,
    embeddings_generated: true
  });
});

apiV1Router.get("/sources/:id", (req: Request, res: Response) => {
  return res.json({
    id: req.params.id,
    title: "MIT 18.01 Single Variable Calculus Notes",
    status: "ready",
    chunks: 14,
    attached_concepts: ["chain-rule", "derivatives"]
  });
});

apiV1Router.post("/sources/:id/attach", (req: Request, res: Response) => {
  return res.json({
    source_id: req.params.id,
    concept_id: req.body.concept_id || "chain-rule",
    status: "attached"
  });
});

apiV1Router.delete("/sources/:id", (req: Request, res: Response) => {
  return res.json({ success: true, deleted_id: req.params.id });
});

// Courses
apiV1Router.post("/courses/generate", (req: Request, res: Response) => {
  const { title, pace, level } = req.body;
  return res.status(201).json({
    id: `crs_${Date.now()}`,
    title: title || "Calculus to Backpropagation Mastery",
    pace: pace || "steady",
    level: level || "intermediate",
    modules: [
      { id: "mod_1", title: "1. Functions & Slopes", status: "completed" },
      { id: "mod_2", title: "2. The Chain Rule & Gear Ratios", status: "in_progress" },
      { id: "mod_3", title: "3. Computational Graphs", status: "locked" },
      { id: "mod_4", title: "4. Reverse-Mode Backpropagation", status: "locked" }
    ]
  });
});

apiV1Router.patch("/courses/:id", (req: Request, res: Response) => {
  return res.json({ id: req.params.id, ...req.body });
});

apiV1Router.put("/courses/:id/items/reorder", (req: Request, res: Response) => {
  return res.json({ course_id: req.params.id, items: req.body.items, status: "reordered" });
});

apiV1Router.post("/courses/:id/modules", (req: Request, res: Response) => {
  return res.status(201).json({
    id: `mod_${Date.now()}`,
    course_id: req.params.id,
    title: req.body.title || "New Module"
  });
});

// ─────────────────────────────────────────────────────────────
// 6. SHARING, FEEDBACK & SETTINGS
// ─────────────────────────────────────────────────────────────
apiV1Router.post("/shares", (req: Request, res: Response) => {
  return res.status(201).json({
    share_token: `share_${Math.random().toString(36).substring(2, 10)}`,
    resource_type: req.body.resource_type || "notebook",
    resource_id: req.body.resource_id || "chain-rule",
    permission: "read_only"
  });
});

apiV1Router.post("/shares/:id/invite", (req: Request, res: Response) => {
  return res.json({ status: "invited", email: req.body.email });
});

apiV1Router.get("/shared/:token", (req: Request, res: Response) => {
  return res.json({
    share_token: req.params.token,
    title: "Chain Rule — Shared Read-Only Notes",
    permission: "read_only",
    pages: [{ id: "p1", title: "Derivation", content: "dy/dx = (dy/du)(du/dx)" }]
  });
});

apiV1Router.post("/shared/:token/comments", (req: Request, res: Response) => {
  return res.status(201).json({
    id: `cmt_${Date.now()}`,
    body: req.body.body,
    author: "Collaborator",
    created_at: new Date().toISOString()
  });
});

apiV1Router.post("/feedback", (req: Request, res: Response) => {
  return res.status(201).json({ status: "received", feedback_id: `fb_${Date.now()}` });
});

apiV1Router.get("/settings", (_req: Request, res: Response) => {
  return res.json({
    theme: "system",
    corner_character: "face",
    nudges: "normal",
    stroke_smoothing: true,
    haptic_feedback: true
  });
});

apiV1Router.patch("/settings", (req: Request, res: Response) => {
  return res.json({ ...req.body, updated_at: new Date().toISOString() });
});
