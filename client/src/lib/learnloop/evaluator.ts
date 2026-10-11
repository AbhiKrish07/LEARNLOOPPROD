import { CONCEPT_ONTOLOGY, MisconceptionSignature } from './ontology';
import { EvidenceRecord, QualitativeConfidence, RequirementStatus } from './learnerModel';

export interface InlineMisconceptionFlag {
  id: string;
  matchedSentence: string;
  misconceptionId: string;
  label: string;
  explanation: string;
  counterExample: string;
}

export interface EvaluationResult {
  conceptId: string;
  requirementStatuses: {
    requirementId: string;
    statement: string;
    status: RequirementStatus;
    evidenceQuote: string;
  }[];
  detectedMisconceptions: MisconceptionSignature[];
  confidence: QualitativeConfidence;
  recommendedAction: 'Continue' | 'Go deeper' | 'Practice' | 'Explore' | 'Review Prerequisite';
  reason: string;
  evidenceRecord: EvidenceRecord;
}

export function observeNotebookText(
  text: string,
  conceptId: string
): InlineMisconceptionFlag[] {
  const conceptDef = CONCEPT_ONTOLOGY[conceptId];
  if (!conceptDef) return [];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const flags: InlineMisconceptionFlag[] = [];

  for (const sentence of sentences) {
    const sLower = sentence.toLowerCase();
    for (const misc of conceptDef.misconceptions) {
      const matched = misc.triggerPhrases.some(phrase => sLower.includes(phrase.toLowerCase()));
      if (matched) {
        flags.push({
          id: `flag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          matchedSentence: sentence.trim(),
          misconceptionId: misc.id,
          label: 'Possible mismatch',
          explanation: misc.explanation,
          counterExample: misc.counterExample
        });
      }
    }
  }

  return flags;
}

export function evaluateDemonstrationResponse(
  conceptId: string,
  response: string,
  targetRequirementId?: string
): EvaluationResult {
  const conceptDef = CONCEPT_ONTOLOGY[conceptId];
  const reqId = targetRequirementId || conceptDef.requirements[0]?.id || 'req-1';
  const reqDef = conceptDef.requirements.find(r => r.id === reqId) || conceptDef.requirements[0];

  const lowerResp = response.toLowerCase();

  // Check misconceptions
  const detectedMisconceptions: MisconceptionSignature[] = [];
  for (const misc of conceptDef.misconceptions) {
    if (misc.triggerPhrases.some(phrase => lowerResp.includes(phrase.toLowerCase()))) {
      detectedMisconceptions.push(misc);
    }
  }

  let status: RequirementStatus = 'Not yet shown';
  let confidence: QualitativeConfidence = 'Emerging';
  let recommendedAction: 'Continue' | 'Go deeper' | 'Practice' | 'Explore' | 'Review Prerequisite' = 'Go deeper';
  let reason = '';

  if (detectedMisconceptions.length > 0) {
    status = 'Contradicted';
    confidence = 'Low';
    recommendedAction = 'Go deeper';
    reason = `Detected misconception "${detectedMisconceptions[0].label}". Let's review why this differs from the definition.`;
  } else if (
    lowerResp.includes('multiply') || 
    lowerResp.includes('compound') || 
    lowerResp.includes('sensitivity') || 
    lowerResp.includes('rate') || 
    lowerResp.length > 40
  ) {
    status = 'Met';
    confidence = 'Strong';
    recommendedAction = 'Continue';
    reason = `Good explanation! You clearly articulated the core concept behind "${reqDef.statement}".`;
  } else if (response.trim().length > 15) {
    status = 'Partly met';
    confidence = 'Moderate';
    recommendedAction = 'Go deeper';
    reason = `You showed partial understanding of "${reqDef.statement}", but could provide more rigorous rate details.`;
  } else {
    status = 'Not yet shown';
    confidence = 'Low';
    recommendedAction = 'Practice';
    reason = `Response was too short to evaluate "${reqDef.statement}". Try elaborating in detail.`;
  }

  const evidenceRecord: EvidenceRecord = {
    id: `ev-${Date.now()}`,
    conceptId,
    requirementId: reqDef.id,
    sourceText: response,
    status,
    detectedMisconceptionId: detectedMisconceptions[0]?.id,
    confidence,
    recommendedAction,
    reason,
    timestamp: new Date().toISOString()
  };

  return {
    conceptId,
    requirementStatuses: conceptDef.requirements.map(r => ({
      requirementId: r.id,
      statement: r.statement,
      status: r.id === reqDef.id ? status : (status === 'Met' ? 'Met' : 'Not yet shown'),
      evidenceQuote: response.slice(0, 100) + (response.length > 100 ? '...' : '')
    })),
    detectedMisconceptions,
    confidence,
    recommendedAction,
    reason,
    evidenceRecord
  };
}

export function evaluateCalibrationAnswer(
  questionIndex: number,
  answer: string
): {
  detectedMisconception?: string;
  nextConceptId: string;
  confidence: QualitativeConfidence;
  evidenceStatement: string;
} {
  const lower = answer.toLowerCase();
  
  if (lower.includes('add') || lower.includes('sum')) {
    return {
      detectedMisconception: 'chain-misc-1',
      nextConceptId: 'chain-rule',
      confidence: 'Emerging',
      evidenceStatement: 'You may be mixing up how rates combine in composite functions.'
    };
  }

  if (lower.includes('multiply') || lower.includes('rate') || lower.includes('chain')) {
    return {
      nextConceptId: 'computational-graphs',
      confidence: 'Strong',
      evidenceStatement: 'You recognize derivative rates compound multiplicatively in composite functions.'
    };
  }

  return {
    nextConceptId: 'derivatives',
    confidence: 'Moderate',
    evidenceStatement: 'You understand function mappings and basic rates of change.'
  };
}
