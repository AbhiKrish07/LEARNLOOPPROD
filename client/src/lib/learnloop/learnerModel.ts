export type LearnerConceptState = 'Unknown' | 'Exposed' | 'Familiar' | 'Understood' | 'Applied';
export type QualitativeConfidence = 'Low' | 'Emerging' | 'Moderate' | 'Strong';
export type RequirementStatus = 'Met' | 'Partly met' | 'Not yet shown' | 'Contradicted';

export interface EvidenceRecord {
  id: string;
  conceptId: string;
  requirementId?: string;
  sourceText: string;
  status: RequirementStatus;
  detectedMisconceptionId?: string;
  confidence: QualitativeConfidence;
  recommendedAction: 'Continue' | 'Go deeper' | 'Practice' | 'Explore' | 'Review Prerequisite';
  reason: string;
  timestamp: string;
}

export interface LearnerConceptRecord {
  conceptId: string;
  state: LearnerConceptState;
  confidence: QualitativeConfidence;
  requirementStatuses: Record<string, RequirementStatus>;
  evidenceRecords: EvidenceRecord[];
  misconceptionHistory: { misconceptionId: string; count: number; resolved: boolean }[];
  lastEvaluatedAt?: string;
  lastIntervention?: string;
}

export interface LearnerModelStore {
  displayName: string;
  calibrationCompleted: boolean;
  startingConceptId: string;
  currentConceptId: string;
  conceptRecords: Record<string, LearnerConceptRecord>;
  writingPreference: 'freeform' | 'blocknote';
  interventionIntensity: 'quiet' | 'balanced' | 'active';
  lastSessionMemoryCue?: string;
  notes: {
    id: string;
    title: string;
    content: string;
    conceptTags: string[];
    updatedAt: string;
  }[];
}

const STORAGE_KEY = 'learnloop_learner_model_v1';

const INITIAL_MODEL: LearnerModelStore = {
  displayName: 'Learner',
  calibrationCompleted: false,
  startingConceptId: 'chain-rule',
  currentConceptId: 'chain-rule',
  writingPreference: 'freeform',
  interventionIntensity: 'balanced',
  lastSessionMemoryCue: 'Last time, you were exploring why rates multiply in the chain rule. Ready to test your idea?',
  conceptRecords: {
    'functions': {
      conceptId: 'functions',
      state: 'Understood',
      confidence: 'Strong',
      requirementStatuses: { 'func-req-1': 'Met', 'func-req-2': 'Met' },
      evidenceRecords: [
        {
          id: 'ev-init-1',
          conceptId: 'functions',
          requirementId: 'func-req-1',
          sourceText: 'Functions map input values to output values deterministically.',
          status: 'Met',
          confidence: 'Strong',
          recommendedAction: 'Continue',
          reason: 'Clear understanding of input/output roles demonstrated.',
          timestamp: new Date().toISOString()
        }
      ],
      misconceptionHistory: []
    },
    'derivatives': {
      conceptId: 'derivatives',
      state: 'Understood',
      confidence: 'Strong',
      requirementStatuses: { 'deriv-req-1': 'Met', 'deriv-req-2': 'Met' },
      evidenceRecords: [
        {
          id: 'ev-init-2',
          conceptId: 'derivatives',
          requirementId: 'deriv-req-1',
          sourceText: 'A derivative measures instantaneous rate of change or sensitivity.',
          status: 'Met',
          confidence: 'Strong',
          recommendedAction: 'Continue',
          reason: 'Correct interpretation of rate of change.',
          timestamp: new Date().toISOString()
        }
      ],
      misconceptionHistory: []
    },
    'composition': {
      conceptId: 'composition',
      state: 'Understood',
      confidence: 'Strong',
      requirementStatuses: { 'comp-req-1': 'Met', 'comp-req-2': 'Met' },
      evidenceRecords: [
        {
          id: 'ev-init-3',
          conceptId: 'composition',
          requirementId: 'comp-req-1',
          sourceText: 'Function composition passes the output of g(x) as input into f(u).',
          status: 'Met',
          confidence: 'Strong',
          recommendedAction: 'Continue',
          reason: 'Recognizes outer and inner function evaluation order.',
          timestamp: new Date().toISOString()
        }
      ],
      misconceptionHistory: []
    },
    'chain-rule': {
      conceptId: 'chain-rule',
      state: 'Familiar',
      confidence: 'Emerging',
      requirementStatuses: { 'chain-req-1': 'Met', 'chain-req-2': 'Partly met', 'chain-req-3': 'Not yet shown' },
      evidenceRecords: [
        {
          id: 'ev-init-4',
          conceptId: 'chain-rule',
          requirementId: 'chain-req-1',
          sourceText: 'In f(g(x)), f is the outer function and g is the inner function.',
          status: 'Met',
          confidence: 'Moderate',
          recommendedAction: 'Go deeper',
          reason: 'You can identify outer and inner functions. Still checking why rates multiply.',
          timestamp: new Date().toISOString()
        }
      ],
      misconceptionHistory: [
        { misconceptionId: 'chain-misc-1', count: 1, resolved: false }
      ]
    },
    'computational-graphs': {
      conceptId: 'computational-graphs',
      state: 'Exposed',
      confidence: 'Low',
      requirementStatuses: { 'comp-graph-req-1': 'Not yet shown', 'comp-graph-req-2': 'Not yet shown' },
      evidenceRecords: [],
      misconceptionHistory: []
    },
    'backpropagation': {
      conceptId: 'backpropagation',
      state: 'Unknown',
      confidence: 'Low',
      requirementStatuses: { 'backprop-req-1': 'Not yet shown', 'backprop-req-2': 'Not yet shown' },
      evidenceRecords: [],
      misconceptionHistory: []
    },
    'gradient-descent': {
      conceptId: 'gradient-descent',
      state: 'Unknown',
      confidence: 'Low',
      requirementStatuses: { 'gd-req-1': 'Not yet shown', 'gd-req-2': 'Not yet shown' },
      evidenceRecords: [],
      misconceptionHistory: []
    }
  },
  notes: [
    {
      id: 'note-default',
      title: 'Chain Rule Notes & Intuition',
      content: `Chain Rule Exploration

If y = f(g(x)), then the sensitivity of y with respect to x is given by:
dy/dx = (df/dg) * (dg/dx)

The inner function g(x) changes the input to the outer function f(u).
When x changes by a small amount, g changes by (dg/dx) * delta_x.
Then that change in g causes f to change by (df/dg) * delta_g.

Possible mismatch check:
"Rates can be added here because both functions change at the same time."`,
      conceptTags: ['chain-rule', 'composition'],
      updatedAt: new Date().toISOString()
    }
  ]
};

export function getLearnerModel(): LearnerModelStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_MODEL;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse learner model from storage:', e);
    return INITIAL_MODEL;
  }
}

export function saveLearnerModel(model: LearnerModelStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
  } catch (e) {
    console.error('Failed to save learner model to storage:', e);
  }
}

export function resetLearnerModel(): LearnerModelStore {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  return INITIAL_MODEL;
}

export function addEvidenceRecord(record: EvidenceRecord): LearnerModelStore {
  const model = getLearnerModel();
  const cRecord = model.conceptRecords[record.conceptId] || {
    conceptId: record.conceptId,
    state: 'Exposed',
    confidence: record.confidence,
    requirementStatuses: {},
    evidenceRecords: [],
    misconceptionHistory: []
  };

  cRecord.evidenceRecords.unshift(record);
  if (record.requirementId) {
    cRecord.requirementStatuses[record.requirementId] = record.status;
  }

  // Update state based on evidence status
  const statuses = Object.values(cRecord.requirementStatuses);
  const metCount = statuses.filter(s => s === 'Met').length;
  if (metCount >= 2) {
    cRecord.state = 'Understood';
    cRecord.confidence = 'Strong';
  } else if (metCount === 1) {
    cRecord.state = 'Familiar';
    cRecord.confidence = 'Moderate';
  } else {
    cRecord.state = 'Exposed';
    cRecord.confidence = 'Emerging';
  }

  if (record.detectedMisconceptionId) {
    const existingMisc = cRecord.misconceptionHistory.find(m => m.misconceptionId === record.detectedMisconceptionId);
    if (existingMisc) {
      existingMisc.count += 1;
    } else {
      cRecord.misconceptionHistory.push({ misconceptionId: record.detectedMisconceptionId, count: 1, resolved: false });
    }
  }

  model.conceptRecords[record.conceptId] = cRecord;
  model.lastSessionMemoryCue = `Evidence updated for ${record.conceptId}: ${record.reason}`;
  saveLearnerModel(model);
  return model;
}
