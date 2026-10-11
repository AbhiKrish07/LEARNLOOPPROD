import { LearnerConceptRecord, RequirementStatus } from './learnerModel';
import { CONCEPT_ONTOLOGY } from './ontology';

export type ActionType = 'Continue' | 'Go deeper' | 'Practice' | 'Explore' | 'Review Prerequisite';

export interface ActionRecommendation {
  action: ActionType;
  label: string;
  reason: string;
  targetConceptId: string;
  targetRequirementId?: string;
  simulationId?: string;
}

export function evaluatePolicy(
  conceptId: string,
  conceptRecord?: LearnerConceptRecord
): ActionRecommendation {
  const conceptDef = CONCEPT_ONTOLOGY[conceptId];
  if (!conceptDef) {
    return {
      action: 'Continue',
      label: 'Continue writing',
      reason: 'No detailed policy found for concept; explore freely.',
      targetConceptId: conceptId
    };
  }

  // 1. Prerequisite check
  for (const prereqId of conceptDef.prerequisiteIds) {
    const prereqRecord = conceptRecord?.evidenceRecords.find(e => e.conceptId === prereqId);
    if (!prereqRecord && conceptId !== 'functions') {
      const prereqDef = CONCEPT_ONTOLOGY[prereqId];
      return {
        action: 'Review Prerequisite',
        label: `Review ${prereqDef?.name || prereqId}`,
        reason: `Current concept ${conceptDef.name} relies on ${prereqDef?.name || prereqId} which has not yet been demonstrated.`,
        targetConceptId: prereqId
      };
    }
  }

  // 2. Misconception check
  const unresolvedMisc = conceptRecord?.misconceptionHistory?.find(m => !m.resolved);
  if (unresolvedMisc) {
    const miscObj = conceptDef.misconceptions.find(m => m.id === unresolvedMisc.misconceptionId);
    return {
      action: 'Go deeper',
      label: 'Address misconception',
      reason: miscObj ? `A known misconception was detected: "${miscObj.label}". Let's clarify why.` : 'Resolve detected concept mismatch.',
      targetConceptId: conceptId
    };
  }

  // 3. Requirement status check
  const statuses = conceptRecord?.requirementStatuses || {};
  const unmetReq = conceptDef.requirements.find(r => (statuses[r.id] || 'Not yet shown') !== 'Met');
  
  if (unmetReq) {
    const currentStatus = statuses[unmetReq.id] || 'Not yet shown';
    if (currentStatus === 'Partly met') {
      return {
        action: 'Go deeper',
        label: 'Teach missing step',
        reason: `Requirement "${unmetReq.statement}" is partly demonstrated. Let's go deeper into the exact details.`,
        targetConceptId: conceptId,
        targetRequirementId: unmetReq.id
      };
    } else {
      if (conceptDef.simulationId) {
        return {
          action: 'Explore',
          label: 'Explore simulation',
          reason: `Interact with the ${conceptDef.name} visual simulation to build concrete intuition for "${unmetReq.statement}".`,
          targetConceptId: conceptId,
          simulationId: conceptDef.simulationId,
          targetRequirementId: unmetReq.id
        };
      }
      return {
        action: 'Practice',
        label: 'Try a demonstration',
        reason: `Demonstrate your understanding of "${unmetReq.statement}" in your own words.`,
        targetConceptId: conceptId,
        targetRequirementId: unmetReq.id
      };
    }
  }

  // 4. Repeated success -> recommend next concept in path
  const nextSeq = ['functions', 'derivatives', 'composition', 'chain-rule', 'computational-graphs', 'backpropagation', 'gradient-descent'];
  const currentIndex = nextSeq.indexOf(conceptId);
  const nextConceptId = nextSeq[currentIndex + 1];
  
  if (nextConceptId && CONCEPT_ONTOLOGY[nextConceptId]) {
    const nextConcept = CONCEPT_ONTOLOGY[nextConceptId];
    return {
      action: 'Continue',
      label: `Move to ${nextConcept.name}`,
      reason: `You have demonstrated understanding of all requirements for ${conceptDef.name}. Ready for the next concept!`,
      targetConceptId: nextConceptId
    };
  }

  return {
    action: 'Continue',
    label: 'Explore applications',
    reason: `You have mastered the canonical CS path up to ${conceptDef.name}.`,
    targetConceptId: conceptId
  };
}
