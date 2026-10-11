/**
 * devStore.ts
 * -----------
 * In-memory + JSON-file backed store for local development.
 * Used when DATABASE_URL is not set, so the full app works
 * without MySQL — courses, canvases, cards, sources, etc.
 * Data is persisted to .dev-store.json in the repo root.
 */
import fs from "fs";
import path from "path";

const STORE_FILE = path.join(process.cwd(), ".dev-store.json");

interface StoreData {
  workspaces: Record<number, any>;
  canvases: Record<number, any>;
  cards: Record<number, any>;
  cardLinks: Record<number, any>;
  sources: Record<number, any>;
  syncRuns: Record<number, any>;
  courses: Record<number, any>;
  modules: Record<number, any>;
  lessons: Record<number, any>;
  learningObjectives: Record<number, any>;
  courseVersions: Record<number, any>;
  assessments: Record<number, any>;
  studentMastery: Record<string, any>;
  learnLoopModels?: Record<string, any>;
  learnLoopEvidence?: Record<string, any>;
  learnLoopStrokes?: Record<string, any>;
  counters: Record<string, number>;
}

function emptyStore(): StoreData {
  return {
    workspaces: {},
    canvases: {},
    cards: {},
    cardLinks: {},
    sources: {},
    syncRuns: {},
    courses: {},
    modules: {},
    lessons: {},
    learningObjectives: {},
    courseVersions: {},
    assessments: {},
    studentMastery: {},
    learnLoopModels: {},
    learnLoopEvidence: {},
    learnLoopStrokes: {},
    counters: {},
  };
}

let _store: StoreData | null = null;

function loadStore(): StoreData {
  if (_store) return _store;
  try {
    if (fs.existsSync(STORE_FILE)) {
      _store = JSON.parse(fs.readFileSync(STORE_FILE, "utf-8"));
      console.log(`[DevStore] Loaded from ${STORE_FILE}`);
    } else {
      _store = emptyStore();
      // Seed with default workspace + canvas
      seedDefaults(_store);
    }
  } catch {
    _store = emptyStore();
    seedDefaults(_store);
  }
  return _store!;
}

function seedDefaults(s: StoreData) {
  s.workspaces[1] = { id: 1, ownerId: 1, name: "Research Garden", slug: "dev-workspace-1", description: "Your local dev workspace.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  s.canvases[1] = { id: 1, workspaceId: 1, title: "Learning Garden", description: "A visual map of ideas.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  s.cards[1] = { id: 1, canvasId: 1, title: "Learning is a change in mental models", body: "A working thesis captured from the reading.", cardType: "quote", accent: "mint", x: 120, y: 140, width: 270, height: 188, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  s.cards[2] = { id: 2, canvasId: 1, title: "Models become useful when they connect", body: "The value of an idea often comes from the bridges it creates.", cardType: "insight", accent: "lilac", x: 520, y: 320, width: 275, height: 188, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  s.counters = { workspaces: 1, canvases: 1, cards: 2, cardLinks: 0, sources: 0, syncRuns: 0, courses: 0, modules: 0, lessons: 0, learningObjectives: 0, courseVersions: 0, assessments: 0, studentMastery: 0 };
  saveStore(s);
}

export function saveStore(s?: StoreData) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(s ?? _store, null, 2));
  } catch { /* ignore */ }
}

function nextId(store: StoreData, table: keyof StoreData["counters"]) {
  store.counters[table] = (store.counters[table] || 0) + 1;
  return store.counters[table];
}

// ── WORKSPACE ───────────────────────────────────────────────────
export function devGetWorkspace(id: number) {
  return loadStore().workspaces[id] ?? null;
}

export function devEnsureWorkspace(userId: number) {
  const store = loadStore();
  // Find workspace owned by user
  const ws = Object.values(store.workspaces).find((w: any) => w.ownerId === userId);
  if (ws) return ws;
  const id = nextId(store, "workspaces");
  const newWs = { id, ownerId: userId, name: "Research Garden", slug: `workspace-${userId}`, description: "Your dev workspace.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  store.workspaces[id] = newWs;
  // Also seed a canvas
  const canvasId = nextId(store, "canvases");
  store.canvases[canvasId] = { id: canvasId, workspaceId: id, title: "Learning Garden", description: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  saveStore();
  return newWs;
}

// ── CANVAS ──────────────────────────────────────────────────────
export function devGetCanvasSnapshot(workspaceId: number, canvasId?: number) {
  const store = loadStore();
  const canvasList = Object.values(store.canvases).filter((c: any) => c.workspaceId === workspaceId);
  const canvas = canvasId ? store.canvases[canvasId] : canvasList[0];
  if (!canvas) return undefined;
  const cards = Object.values(store.cards).filter((c: any) => c.canvasId === canvas.id);
  const links = Object.values(store.cardLinks).filter((l: any) => l.canvasId === canvas.id);
  return { canvas, groups: [], cards, links };
}

export function devGetCanvasesForWorkspace(workspaceId: number) {
  const store = loadStore();
  return Object.values(store.canvases).filter((c: any) => c.workspaceId === workspaceId);
}

export function devCreateCanvas(workspaceId: number, title: string, description?: string) {
  const store = loadStore();
  const id = nextId(store, "canvases");
  const canvas = { id, workspaceId, title, description: description ?? "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  store.canvases[id] = canvas;
  saveStore();
  return canvas;
}

// ── CARDS ───────────────────────────────────────────────────────
export function devGetCard(cardId: number) {
  return loadStore().cards[cardId] ?? null;
}

export function devCreateCard(canvasId: number, data: any) {
  const store = loadStore();
  const id = nextId(store, "cards");
  const card = { id, canvasId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  store.cards[id] = card;
  saveStore();
  return card;
}

export function devUpdateCard(cardId: number, data: any) {
  const store = loadStore();
  if (!store.cards[cardId]) return null;
  store.cards[cardId] = { ...store.cards[cardId], ...data, updatedAt: new Date().toISOString() };
  saveStore();
  return store.cards[cardId];
}

export function devDeleteCard(cardId: number) {
  const store = loadStore();
  if (!store.cards[cardId]) return false;
  delete store.cards[cardId];
  saveStore();
  return true;
}

export function devGetCardsForCanvas(canvasId: number) {
  return Object.values(loadStore().cards).filter((c: any) => c.canvasId === canvasId);
}

// ── LINKS ───────────────────────────────────────────────────────
export function devCreateLink(canvasId: number, fromCardId: number, toCardId: number, label?: string) {
  const store = loadStore();
  const id = nextId(store, "cardLinks");
  const link = { id, canvasId, fromCardId, toCardId, label: label ?? "", createdAt: new Date().toISOString() };
  store.cardLinks[id] = link;
  saveStore();
  return link;
}

export function devDeleteLink(linkId: number) {
  const store = loadStore();
  delete store.cardLinks[linkId];
  saveStore();
}

// ── SOURCES ─────────────────────────────────────────────────────
export function devListSources(workspaceId: number) {
  return Object.values(loadStore().sources).filter((s: any) => s.workspaceId === workspaceId).sort((a: any, b: any) => b.updatedAt > a.updatedAt ? 1 : -1);
}

export function devCreateSource(workspaceId: number, data: any) {
  const store = loadStore();
  const id = nextId(store, "sources");
  const source = { id, workspaceId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  store.sources[id] = source;
  saveStore();
  return source;
}

// ── COURSES ─────────────────────────────────────────────────────
export function devListCourses(workspaceId: number) {
  return Object.values(loadStore().courses).filter((c: any) => c.workspaceId === workspaceId).sort((a: any, b: any) => b.updatedAt > a.updatedAt ? 1 : -1);
}

export function devGetCourse(courseId: number) {
  const store = loadStore();
  const course = store.courses[courseId];
  if (!course) return null;
  const courseModules = Object.values(store.modules).filter((m: any) => m.courseId === courseId).sort((a: any, b: any) => a.orderIndex - b.orderIndex);
  const withLessons = courseModules.map((mod: any) => {
    const modLessons = Object.values(store.lessons).filter((l: any) => l.moduleId === mod.id).sort((a: any, b: any) => a.orderIndex - b.orderIndex);
    const withObjs = modLessons.map((les: any) => ({
      ...les,
      learningObjectives: Object.values(store.learningObjectives).filter((lo: any) => lo.lessonId === les.id).sort((a: any, b: any) => a.orderIndex - b.orderIndex)
    }));
    return { ...mod, lessons: withObjs };
  });
  return { ...course, modules: withLessons };
}

export function devCreateCourse(workspaceId: number, title: string, sourceText: string) {
  const store = loadStore();
  const id = nextId(store, "courses");
  const course = { id, workspaceId, title, sourceText, status: "draft", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  store.courses[id] = course;
  // Create initial version
  const vId = nextId(store, "courseVersions");
  store.courseVersions[vId] = { id: vId, courseId: id, version: 1, astJson: "{}", changeLog: "Initial creation", createdBy: 1, createdAt: new Date().toISOString() };
  saveStore();
  return { id, insertId: id };
}

export function devUpdateCourse(courseId: number, data: any) {
  const store = loadStore();
  if (!store.courses[courseId]) return;
  store.courses[courseId] = { ...store.courses[courseId], ...data, updatedAt: new Date().toISOString() };
  saveStore();
}

export function devInsertModule(data: any) {
  const store = loadStore();
  const id = nextId(store, "modules");
  store.modules[id] = { id, ...data, createdAt: new Date().toISOString() };
  saveStore();
  return id;
}

export function devInsertLesson(data: any) {
  const store = loadStore();
  const id = nextId(store, "lessons");
  store.lessons[id] = { id, ...data, createdAt: new Date().toISOString() };
  saveStore();
  return id;
}

export function devInsertLearningObjective(data: any) {
  const store = loadStore();
  const id = nextId(store, "learningObjectives");
  store.learningObjectives[id] = { id, ...data };
  saveStore();
  return id;
}

export function devGetLesson(lessonId: number) {
  const store = loadStore();
  const lesson = store.lessons[lessonId];
  if (!lesson) return null;
  const course = store.courses[lesson.courseId ?? 0] ?? null;
  return { lesson, course, objectives: Object.values(store.learningObjectives).filter((lo: any) => lo.lessonId === lessonId) };
}

export function devMarkMastery(userId: number, courseId: number, lessonId: number, score: number) {
  const store = loadStore();
  const key = `${userId}_${lessonId}`;
  store.studentMastery[key] = { userId, courseId, lessonId, score, status: "completed", completedAt: new Date().toISOString() };
  saveStore();
}

export function devGetCompletedLessons(userId: number, courseId: number): number[] {
  const store = loadStore();
  return Object.values(store.studentMastery)
    .filter((m: any) => m.userId === userId && m.courseId === courseId)
    .map((m: any) => m.lessonId);
}

export function devGetLearnLoopModel(userId: string | number) {
  const store = loadStore();
  if (!store.learnLoopModels) store.learnLoopModels = {};
  if (!store.learnLoopModels[String(userId)]) {
    // Default learner model matching PRD
    store.learnLoopModels[String(userId)] = {
      userId: String(userId),
      currentConceptId: "chain-rule",
      confidence: "Moderate",
      conceptRecords: {
        "functions": { state: "Applied", confidence: "Strong", requirementStatuses: { r1: "Met", r2: "Met" }, evidenceRecords: ["Retest passed: Functions"] },
        "derivatives": { state: "Understood", confidence: "Strong", requirementStatuses: { r1: "Met" }, evidenceRecords: ["Practice: Derivatives"] },
        "composition": { state: "Understood", confidence: "Moderate", requirementStatuses: { r1: "Met" }, evidenceRecords: ["Retest passed: Composition"] },
        "chain-rule": { state: "Familiar", confidence: "Moderate", requirementStatuses: { r1: "Partly met" }, misconceptionHistory: ["Adds rates instead of chaining them"], evidenceRecords: ["Slip found: Chain Rule, step 4"] },
        "computational-graphs": { state: "Next", confidence: "Low", requirementStatuses: {}, evidenceRecords: [] },
        "backpropagation": { state: "Locked", confidence: "Low", requirementStatuses: {}, evidenceRecords: [] },
        "gradient-descent": { state: "Locked", confidence: "Low", requirementStatuses: {}, evidenceRecords: [] }
      },
      updatedAt: new Date().toISOString()
    };
    saveStore();
  }
  return store.learnLoopModels[String(userId)];
}

export function devSaveLearnLoopModel(userId: string | number, modelData: any) {
  const store = loadStore();
  if (!store.learnLoopModels) store.learnLoopModels = {};
  store.learnLoopModels[String(userId)] = {
    ...modelData,
    updatedAt: new Date().toISOString()
  };
  saveStore();
}

export function devSaveLearnLoopEvidence(userId: string | number, evidenceRecord: any) {
  const store = loadStore();
  if (!store.learnLoopEvidence) store.learnLoopEvidence = {};
  const id = `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  store.learnLoopEvidence[id] = {
    id,
    userId: String(userId),
    ...evidenceRecord,
    timestamp: new Date().toISOString()
  };
  saveStore();
  return id;
}

export function devListLearnLoopEvidence(userId: string | number) {
  const store = loadStore();
  if (!store.learnLoopEvidence) return [];
  return Object.values(store.learnLoopEvidence).filter((e: any) => e.userId === String(userId));
}

// ── AGENTS CONFIG ──────────────────────────────────────────────
export function devGetLearnLoopAgents(userId: string | number) {
  const store = loadStore() as any;
  if (!store.learnLoopAgents) store.learnLoopAgents = {};
  if (!store.learnLoopAgents[String(userId)]) {
    store.learnLoopAgents[String(userId)] = {
      spotter: true,
      coach: true,
      visualizer: true,
      wonder: true,
      recall: true,
      sources: true,
      character: "face", // "face" | "spark" | "owl"
      nudges: "normal"   // "quiet" | "normal"
    };
    saveStore();
  }
  return store.learnLoopAgents[String(userId)];
}

export function devSaveLearnLoopAgents(userId: string | number, agentsConfig: any) {
  const store = loadStore() as any;
  if (!store.learnLoopAgents) store.learnLoopAgents = {};
  store.learnLoopAgents[String(userId)] = {
    ...store.learnLoopAgents[String(userId)],
    ...agentsConfig,
    updatedAt: new Date().toISOString()
  };
  saveStore();
  return store.learnLoopAgents[String(userId)];
}

// ── STUDY SESSIONS & BRAIN NEURONS ─────────────────────────────
export function devGetLearnLoopBrain(userId: string | number) {
  const store = loadStore() as any;
  if (!store.learnLoopSessions) store.learnLoopSessions = {};
  const userSessions = Object.values(store.learnLoopSessions).filter((s: any) => s.userId === String(userId));
  
  // Seed initial demo neurons if none exist
  if (userSessions.length === 0) {
    const demoSessions = [
      { id: "s-1", userId: String(userId), conceptId: "chain-rule", title: "Chain Rule session", date: "Today", durationMinutes: 28, neuronSize: 42, pagesWritten: 2, slipsFixed: 1, retestsPassed: 1, x: 260, y: 180, color: "#E8A34A" },
      { id: "s-2", userId: String(userId), conceptId: "composition", title: "Composition study", date: "Yesterday", durationMinutes: 18, neuronSize: 32, pagesWritten: 1, slipsFixed: 0, retestsPassed: 1, x: 140, y: 120, color: "#74C39B" },
      { id: "s-3", userId: String(userId), conceptId: "derivatives", title: "Derivatives recap", date: "3d ago", durationMinutes: 35, neuronSize: 48, pagesWritten: 3, slipsFixed: 2, retestsPassed: 1, x: 190, y: 260, color: "#74C39B" },
      { id: "s-4", userId: String(userId), conceptId: "functions", title: "Functions basis", date: "5d ago", durationMinutes: 15, neuronSize: 26, pagesWritten: 1, slipsFixed: 0, retestsPassed: 1, x: 90, y: 200, color: "#92B8E5" },
      { id: "s-5", userId: String(userId), conceptId: "gradient-descent", title: "Gradient Descent preview", date: "1w ago", durationMinutes: 20, neuronSize: 30, pagesWritten: 1, slipsFixed: 0, retestsPassed: 0, x: 380, y: 140, color: "#92B8E5" },
      { id: "s-6", userId: String(userId), conceptId: "computational-graphs", title: "Graph connections", date: "2d ago", durationMinutes: 22, neuronSize: 34, pagesWritten: 2, slipsFixed: 0, retestsPassed: 0, x: 340, y: 240, color: "#74C39B" }
    ];
    demoSessions.forEach(ds => {
      store.learnLoopSessions[ds.id] = ds;
    });
    saveStore();
  }

  const allSessions = Object.values(store.learnLoopSessions).filter((s: any) => s.userId === String(userId));
  const totalMinutes = allSessions.reduce((acc: number, s: any) => acc + (s.durationMinutes || 0), 0);
  const hours = (totalMinutes / 60).toFixed(1);

  return {
    neuronsCount: allSessions.length,
    hoursStudied: hours,
    neurons: allSessions,
    links: [
      { source: "s-4", target: "s-2" },
      { source: "s-2", target: "s-1" },
      { source: "s-3", target: "s-1" },
      { source: "s-1", target: "s-6" },
      { source: "s-1", target: "s-5" },
      { source: "s-5", target: "s-6" }
    ]
  };
}

export function devAddLearnLoopSession(userId: string | number, session: any) {
  const store = loadStore() as any;
  if (!store.learnLoopSessions) store.learnLoopSessions = {};
  const id = `s-${Date.now()}`;
  const newSession = {
    id,
    userId: String(userId),
    conceptId: session.conceptId || "chain-rule",
    title: session.title || "Study session",
    date: "Just now",
    durationMinutes: session.durationMinutes || 25,
    neuronSize: Math.min(60, Math.max(20, Math.round((session.durationMinutes || 25) * 1.5))),
    pagesWritten: session.pagesWritten || 1,
    slipsFixed: session.slipsFixed || 0,
    retestsPassed: session.retestsPassed || 0,
    x: Math.round(100 + Math.random() * 300),
    y: Math.round(100 + Math.random() * 200),
    color: "#E8A34A"
  };
  store.learnLoopSessions[id] = newSession;
  saveStore();
  return newSession;
}

// ── WHERE IT BREAKS & RETESTS ───────────────────────────────────
export function devDiagnoseSteps(userId: string | number, input: { conceptId: string; stepsText: string }) {
  const rawLines = input.stepsText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  let brokenIdx = -1;
  let brokenText = "";
  let misconceptionTitle = "Adds rates instead of chaining them";
  let diagnosticTitle = "You added the two rates. Along a chain they multiply: dy/dx = dy/du · du/dx.";

  // If user entered lines, let's find the broken step:
  if (rawLines.length > 0) {
    // Check for addition where rates should multiply, e.g. "2u + 3" or "+" between derivatives
    const addRateIdx = rawLines.findIndex(line => 
      (line.includes("dy/dx") || line.includes("y'")) && (line.includes("+") || line.includes(" + "))
    );
    
    if (addRateIdx !== -1) {
      brokenIdx = addRateIdx + 1; // 1-based
      brokenText = rawLines[addRateIdx];
    } else {
      // Find line with '+' or default to step 4 or second-to-last
      const genericAddIdx = rawLines.findIndex(line => line.includes("+") && (line.includes("du") || line.includes("dx") || line.includes("u")));
      if (genericAddIdx !== -1) {
        brokenIdx = genericAddIdx + 1;
        brokenText = rawLines[genericAddIdx];
      } else if (rawLines.length >= 4) {
        brokenIdx = 4;
        brokenText = rawLines[3];
      } else {
        brokenIdx = rawLines.length;
        brokenText = rawLines[rawLines.length - 1];
      }
    }
  }

  const structuredSteps = rawLines.length > 0
    ? rawLines.map((line, idx) => ({
        stepNumber: idx + 1,
        text: line,
        isBroken: idx + 1 === brokenIdx
      }))
    : [
        { stepNumber: 1, text: "Let u = 3x + 1, so y = u^2", isBroken: false },
        { stepNumber: 2, text: "dy/du = 2u", isBroken: false },
        { stepNumber: 3, text: "du/dx = 3", isBroken: false },
        { stepNumber: 4, text: "dy/dx = 2u + 3", isBroken: true },
        { stepNumber: 5, text: "= 6x + 5, built on step 4", isBroken: false }
      ];

  if (brokenIdx === -1) {
    brokenIdx = 4;
    brokenText = "dy/dx = 2u + 3";
  }

  const slipDiagnosis = {
    conceptId: input.conceptId || "chain-rule",
    brokenStepIndex: brokenIdx,
    brokenStepText: brokenText,
    title: diagnosticTitle,
    misconception: misconceptionTitle,
    crossNotebookNote: "Same slip as your Product Rule notes [Sept 14].",
    steps: structuredSteps,
    timestamp: new Date().toISOString()
  };

  devSaveLearnLoopEvidence(userId, {
    conceptId: input.conceptId,
    sourceText: input.stepsText,
    resultStatus: "Slip found",
    brokenStep: brokenIdx,
    detectedMisconception: slipDiagnosis.misconception,
    confidence: "Strong",
    type: "check_my_work"
  });

  return slipDiagnosis;
}

export function devEvaluateRetest(userId: string | number, input: { conceptId: string; steps: string }) {
  const isCorrect = input.steps.includes("15") || 
                    input.steps.toLowerCase().includes("3(5x - 2)^2 * 5") || 
                    input.steps.includes("15(5x - 2)^2") || 
                    input.steps.toLowerCase().includes("· 5") ||
                    input.steps.includes("15(") ||
                    input.steps.length > 25;
  
  const result = {
    isPassed: isCorrect,
    conceptId: input.conceptId || "chain-rule",
    feedback: isCorrect 
      ? "Spot on! You correctly chained the derivative by multiplying the outer derivative with du/dx = 5." 
      : "Remember to multiply the inner rate du/dx = 5 rather than adding it.",
    nextConcept: "computational-graphs",
    retestProblem: "Differentiate y = (5x - 2)^3 and write each step."
  };

  if (isCorrect) {
    // Elevate concept to Understood
    const model = devGetLearnLoopModel(userId);
    if (model && model.conceptRecords) {
      if (model.conceptRecords[input.conceptId || "chain-rule"]) {
        model.conceptRecords[input.conceptId || "chain-rule"].state = "Understood";
        model.conceptRecords[input.conceptId || "chain-rule"].confidence = "Strong";
      }
      // Unlock computational-graphs and backpropagation!
      if (model.conceptRecords["computational-graphs"]) {
        model.conceptRecords["computational-graphs"].state = "Understood";
        model.conceptRecords["computational-graphs"].confidence = "Strong";
      }
      if (model.conceptRecords["backpropagation"]) {
        model.conceptRecords["backpropagation"].state = "Familiar";
        model.conceptRecords["backpropagation"].confidence = "Moderate";
      }
      devSaveLearnLoopModel(userId, model);
    }
  }

  devSaveLearnLoopEvidence(userId, {
    conceptId: input.conceptId,
    sourceText: input.steps,
    resultStatus: isCorrect ? "Retest passed" : "Retest failed",
    confidence: "Strong",
    type: "retest"
  });

  return result;
}

export function devSyncLearnLoopStrokes(userId: string | number, pageId: string, clientOps: any[]) {
  const store = loadStore();
  if (!store.learnLoopStrokes) store.learnLoopStrokes = {};
  const key = `${userId}_${pageId}`;
  const existing = store.learnLoopStrokes[key] || { operations: [], serverSeq: 0 };
  
  let seq = existing.serverSeq;
  const newOps = (clientOps || []).map((op: any) => {
    seq += 1;
    return { ...op, serverSeq: seq, receivedAt: new Date().toISOString() };
  });

  const mergedOps = [...existing.operations, ...newOps];
  store.learnLoopStrokes[key] = { operations: mergedOps, serverSeq: seq };
  saveStore();
  return { acceptedCount: newOps.length, serverSeq: seq, operations: mergedOps };
}

// ── NOTEBOOKS PERSISTENCE ──────────────────────────────────────
export function devListNotebooks(userId: string | number) {
  const store = loadStore() as any;
  if (!store.learnLoopNotebooks) store.learnLoopNotebooks = {};
  if (!store.learnLoopNotebooks[String(userId)]) {
    store.learnLoopNotebooks[String(userId)] = [
      {
        id: "calculus",
        title: "Calculus",
        subtitle: "4 notebooks",
        subject: "Calculus",
        coverColor: "#A8D5BA",
        paperTemplate: "grid",
        createdAt: new Date().toISOString()
      },
      {
        id: "chain-rule",
        title: "Chain Rule",
        subtitle: "Sample Demo · Tap to explore",
        subject: "Calculus",
        coverColor: "#A8CDEE",
        paperTemplate: "ruled",
        createdAt: new Date().toISOString()
      },
      {
        id: "gradient-descent",
        title: "Gradient Descent",
        subtitle: "Edited today",
        subject: "Machine Learning",
        coverColor: "#9ED7C6",
        paperTemplate: "grid",
        createdAt: new Date().toISOString()
      },
      {
        id: "computational-graphs",
        title: "Computational Graphs",
        subtitle: "In progress",
        subject: "Computer Science",
        coverColor: "#C3B4E8",
        paperTemplate: "dot",
        createdAt: new Date().toISOString()
      },
      {
        id: "linear-algebra",
        title: "Linear Algebra",
        subtitle: "Oct 9",
        subject: "Mathematics",
        coverColor: "#EBD37A",
        paperTemplate: "grid",
        createdAt: new Date().toISOString()
      },
      {
        id: "quantum-gates",
        title: "Quantum Gates",
        subtitle: "Oct 4",
        subject: "Physics",
        coverColor: "#E4B4D5",
        paperTemplate: "blank",
        createdAt: new Date().toISOString()
      },
      {
        id: "backpropagation",
        title: "Backpropagation",
        subtitle: "Advanced Deep Learning",
        subject: "Deep Learning",
        coverColor: "#2D4059",
        paperTemplate: "ruled",
        isLocked: false,
        createdAt: new Date().toISOString()
      }
    ];
    saveStore();
  }
  return store.learnLoopNotebooks[String(userId)];
}

export function devCreateNotebook(userId: string | number, notebook: any) {
  const store = loadStore() as any;
  if (!store.learnLoopNotebooks) store.learnLoopNotebooks = {};
  const current = devListNotebooks(userId);
  const newNb = {
    id: notebook.id || `nb-${Date.now()}`,
    title: notebook.title || "Untitled Notebook",
    subject: notebook.subject || "General",
    subtitle: "Just created",
    coverColor: notebook.coverColor || "#A8CDEE",
    paperTemplate: notebook.paperTemplate || "grid",
    createdAt: new Date().toISOString()
  };
  store.learnLoopNotebooks[String(userId)] = [newNb, ...current];
  saveStore();
  return newNb;
}

export function devJoinWaitlist(entry: { email: string; name?: string; topic?: string }) {
  const store = loadStore() as any;
  if (!store.waitlist) store.waitlist = [];
  
  const existing = store.waitlist.find((w: any) => w.email.toLowerCase() === entry.email.toLowerCase());
  if (existing) {
    return {
      success: true,
      alreadyJoined: true,
      position: existing.position,
      entry: existing
    };
  }

  const baseCount = 1240;
  const position = baseCount + store.waitlist.length + 1;
  const newEntry = {
    id: `wl-${Date.now()}`,
    email: entry.email.trim(),
    name: entry.name?.trim() || "",
    topic: entry.topic || "General",
    position,
    createdAt: new Date().toISOString()
  };

  store.waitlist.push(newEntry);
  saveStore();

  return {
    success: true,
    alreadyJoined: false,
    position,
    entry: newEntry
  };
}

export function devGetWaitlist() {
  const store = loadStore() as any;
  return store.waitlist || [];
}
