import React, { useState, useEffect } from 'react';
import { LearnLoopShell } from '../../components/learnloop/LearnLoopShell';
import { ChainRuleVisualizer } from '../../components/learnloop/simulations/ChainRuleVisualizer';
import { GradientDescentExplorer } from '../../components/learnloop/simulations/GradientDescentExplorer';
import {
  observeNotebookText,
  evaluateDemonstrationResponse,
  InlineMisconceptionFlag,
  EvaluationResult
} from '../../lib/learnloop/evaluator';
import { GoodnotesCanvas } from '../../components/learnloop/GoodnotesCanvas';
import { GoodNotesApp } from '../../components/learnloop/GoodNotesApp';
import { getLearnerModel, saveLearnerModel, addEvidenceRecord, LearnerModelStore } from '../../lib/learnloop/learnerModel';
import { CONCEPT_ONTOLOGY } from '../../lib/learnloop/ontology';
import { ActionRecommendation } from '../../lib/learnloop/policyEngine';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  BookOpen,
  Sliders,
  Layers,
  Code,
  Type,
  Plus,
  X,
  FileText,
  Tag,
  ChevronDown
} from 'lucide-react';

export const NotebookView: React.FC = () => {
  return <GoodNotesApp />;
};

export const LegacyNotebookView: React.FC = () => {
  const [model, setModel] = useState<LearnerModelStore>(getLearnerModel());
  const [activeConceptId, setActiveConceptId] = useState<string>(model.currentConceptId || 'chain-rule');
  
  // Note content state
  const [noteContent, setNoteContent] = useState<string>(
    model.notes[0]?.content || 
    `Chain Rule Exploration\n\nIf y = f(g(x)), then the sensitivity of y with respect to x is given by:\ndy/dx = (df/dg) * (dg/dx)\n\nThe inner function g(x) changes the input to the outer function f(u).\nWhen x changes by a small amount, g changes by (dg/dx) * delta_x.\nThen that change in g causes f to change by (df/dg) * delta_g.\n\nCheck this idea:\n"Rates can be added here because both functions change at the same time."`
  );

  // View Mode: freeform vs blocknote
  const [isBlocknoteMode, setIsBlocknoteMode] = useState<boolean>(model.writingPreference === 'blocknote');

  // Inline Misconception Flags
  const [flags, setFlags] = useState<InlineMisconceptionFlag[]>([]);
  const [dismissedFlagIds, setDismissedFlagIds] = useState<string[]>([]);

  // Active Interventions / Modals
  const [activeTeachStep, setActiveTeachStep] = useState<boolean>(false);
  const [activeDemonstrateStep, setActiveDemonstrateStep] = useState<boolean>(false);
  const [activePracticeStep, setActivePracticeStep] = useState<boolean>(false);
  const [demonstrateResponse, setDemonstrateResponse] = useState<string>('');
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);

  // Inline Simulations insertion
  const [insertedSimulations, setInsertedSimulations] = useState<string[]>(['chain-rule']);

  // Concept Tagging state
  const [selectedTag, setSelectedTag] = useState<string>(activeConceptId);

  // Evaluate flags dynamically as text changes
  useEffect(() => {
    const detected = observeNotebookText(noteContent, activeConceptId);
    setFlags(detected.filter(f => !dismissedFlagIds.includes(f.id)));
  }, [noteContent, activeConceptId, dismissedFlagIds]);

  const handleDismissFlag = (flagId: string) => {
    setDismissedFlagIds(prev => [...prev, flagId]);
  };

  const handleAddSimulationObservation = (observation: string) => {
    setNoteContent(prev => prev + '\n\n' + observation);
  };

  const handleActionSelect = (rec: ActionRecommendation) => {
    if (rec.action === 'Go deeper' || rec.action === 'Review Prerequisite') {
      setActiveTeachStep(true);
    } else if (rec.action === 'Practice') {
      setActivePracticeStep(true);
    } else if (rec.action === 'Explore') {
      if (rec.simulationId && !insertedSimulations.includes(rec.simulationId)) {
        setInsertedSimulations(prev => [...prev, rec.simulationId!]);
      }
    } else if (rec.action === 'Continue') {
      setActiveConceptId(rec.targetConceptId);
    }
  };

  const handleRunDemonstration = () => {
    if (!demonstrateResponse.trim()) return;
    const res = evaluateDemonstrationResponse(activeConceptId, demonstrateResponse);
    setEvalResult(res);
    addEvidenceRecord(res.evidenceRecord);
    setModel(getLearnerModel());
  };

  const conceptDef = CONCEPT_ONTOLOGY[activeConceptId] || CONCEPT_ONTOLOGY['chain-rule'];

  return (
    <LearnLoopShell activeConceptId={activeConceptId} onSelectAction={handleActionSelect}>
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        
        {/* Notebook Title & Control Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E5DF] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <input
                type="text"
                defaultValue="Chain Rule & Derivatives Study"
                className="text-2xl font-semibold text-[#202225] bg-transparent focus:outline-none focus:border-b border-[#5B5CE2]"
              />
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#18A999]/10 text-[#18A999]">
                {conceptDef.name}
              </span>
            </div>
            <p className="text-xs text-[#73777D]">Last edited today · Autosaved locally</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Concept Selector */}
            <div className="relative">
              <select
                value={activeConceptId}
                onChange={(e) => setActiveConceptId(e.target.value)}
                className="pl-3 pr-8 py-1.5 rounded-lg border border-[#E7E5DF] bg-white text-xs font-medium text-[#202225] focus:outline-none focus:border-[#5B5CE2] appearance-none cursor-pointer"
              >
                {Object.values(CONCEPT_ONTOLOGY).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#73777D] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Blocknote Mode Toggle */}
            <button
              onClick={() => setIsBlocknoteMode(!isBlocknoteMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isBlocknoteMode
                  ? 'bg-[#5B5CE2] text-white border-[#5B5CE2]'
                  : 'bg-white text-[#202225] border-[#E7E5DF] hover:bg-[#F8F7F3]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {isBlocknoteMode ? 'Blocknote Mode' : 'Free-form Mode'}
            </button>
          </div>
        </div>

        {/* Inline Misconception Flags (Screen 6) */}
        {flags.length > 0 && (
          <div className="space-y-3">
            {flags.map(flag => (
              <div
                key={flag.id}
                className="p-4 rounded-xl bg-[#C9685A]/10 border border-[#C9685A]/30 text-[#202225] flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#C9685A]/20 text-[#C9685A] shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#C9685A] uppercase tracking-wider">
                        {flag.label}
                      </span>
                      <span className="text-xs text-[#73777D]">anchored to sentence:</span>
                    </div>
                    <p className="text-xs font-mono bg-white/70 px-2 py-1 rounded border border-[#C9685A]/20 my-1.5 text-[#202225]">
                      "{flag.matchedSentence}"
                    </p>
                    <p className="text-xs text-[#202225] leading-relaxed">{flag.explanation}</p>
                    <div className="mt-2 text-[11px] text-[#73777D]">
                      <strong>Counter-example:</strong> {flag.counterExample}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTeachStep(true)}
                    className="px-2.5 py-1 rounded-md bg-[#C9685A] text-white text-xs font-medium hover:bg-[#b5584b] transition-colors"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleDismissFlag(flag.id)}
                    className="p-1 text-[#73777D] hover:text-[#202225] rounded"
                    title="Dismiss flag"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Goodnotes Digital Writing Canvas */}
        {!isBlocknoteMode ? (
          <GoodnotesCanvas
            activeConceptId={activeConceptId}
            onObserveText={(text) => setNoteContent(prev => prev + '\n' + text)}
          />
        ) : (
          /* Blocknote Mode (Screen 12) */
          <div className="space-y-3 bg-[#FDFCF9] border border-[#E7E5DF] rounded-2xl p-6 shadow-2xs">
            <div className="text-xs text-[#73777D] mb-2 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#5B5CE2]" />
              Parsed Blocks (Reversible Blocknote View)
            </div>

            {noteContent.split('\n\n').map((paragraph, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl border border-[#E7E5DF] bg-white hover:border-[#5B5CE2]/40 transition-colors relative group"
              >
                <div className="flex items-center justify-between text-[11px] text-[#73777D] mb-1.5">
                  <span className="font-mono uppercase font-semibold text-[#5B5CE2]">
                    Block {index + 1} · {paragraph.startsWith('If') ? 'Equation / Definition' : 'Text Block'}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#5B5CE2] cursor-pointer">
                    Edit block
                  </span>
                </div>
                <p className="text-sm text-[#202225] leading-relaxed whitespace-pre-line">{paragraph}</p>
              </div>
            ))}
          </div>
        )}

        {/* Inline Simulations Section */}
        {insertedSimulations.includes('chain-rule') && (
          <ChainRuleVisualizer onAddObservation={handleAddSimulationObservation} />
        )}
        {insertedSimulations.includes('gradient-descent') && (
          <GradientDescentExplorer onAddObservation={handleAddSimulationObservation} />
        )}

        {/* Floating Bottom Writing Toolbar */}
        <div className="sticky bottom-6 bg-[#FDFCF9]/95 backdrop-blur-md border border-[#E7E5DF] rounded-2xl p-3 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setNoteContent(prev => prev + '\n\n## New Section Heading')}
              className="p-2 rounded-lg hover:bg-[#F8F7F3] text-[#73777D] hover:text-[#202225] text-xs flex items-center gap-1"
            >
              <Type className="w-4 h-4" /> Heading
            </button>
            <button
              onClick={() => setNoteContent(prev => prev + '\n\ndy/dx = (df/dg) * (dg/dx)')}
              className="p-2 rounded-lg hover:bg-[#F8F7F3] text-[#73777D] hover:text-[#202225] text-xs flex items-center gap-1"
            >
              <Code className="w-4 h-4" /> Equation
            </button>
            <button
              onClick={() => {
                if (!insertedSimulations.includes('chain-rule')) setInsertedSimulations(prev => [...prev, 'chain-rule']);
                if (!insertedSimulations.includes('gradient-descent')) setInsertedSimulations(prev => [...prev, 'gradient-descent']);
              }}
              className="p-2 rounded-lg hover:bg-[#F8F7F3] text-[#18A999] text-xs flex items-center gap-1 font-medium"
            >
              <Sliders className="w-4 h-4" /> Insert Simulation
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTeachStep(true)}
              className="px-3 py-1.5 rounded-lg bg-[#5B5CE2]/10 text-[#5B5CE2] hover:bg-[#5B5CE2]/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" /> Teach Step
            </button>
            <button
              onClick={() => setActiveDemonstrateStep(true)}
              className="px-3 py-1.5 rounded-lg bg-[#3B8C68] text-white hover:bg-[#327758] text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Demonstrate Step
            </button>
          </div>
        </div>

        {/* Teach Step Modal / Drawer (Screen 7) */}
        {activeTeachStep && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="max-w-xl w-full bg-[#FDFCF9] border border-[#E7E5DF] rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E7E5DF] pb-3">
                <div className="flex items-center gap-2 text-[#5B5CE2] font-semibold text-sm">
                  <BookOpen className="w-4 h-4" /> Teach Step: {conceptDef.name}
                </div>
                <button onClick={() => setActiveTeachStep(false)} className="text-[#73777D] hover:text-[#202225]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#202225] leading-relaxed">
                <div className="p-3 bg-[#5B5CE2]/8 rounded-lg border border-[#5B5CE2]/20 font-medium text-[#5B5CE2]">
                  Objective: Understand why nested rates of change compound multiplicatively through function composition.
                </div>

                <p>
                  Suppose you have nested functions <code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">y = f(g(x))</code>.
                  Think of <code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">g(x)</code> as an intermediate rate multiplier.
                </p>

                <div className="p-3 bg-white rounded-lg border border-[#E7E5DF] font-mono text-center text-sm font-bold text-[#5B5CE2]">
                  dy/dx = (df/dg) × (dg/dx)
                </div>

                <p>
                  A small change in <code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">x</code> produces a change in <code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">g</code> equal to <code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">(dg/dx) · Δx</code>. Then, that change in <code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">g</code> feeds into <code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">f</code>, producing a final change <code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">(df/dg) · Δg = (df/dg) · (dg/dx) · Δx</code>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E5DF]">
                <button
                  onClick={() => {
                    setNoteContent(prev => prev + '\n\nTeach Step Takeaway: dy/dx = (df/dg) * (dg/dx). Rates compound multiplicatively through nested layers.');
                    setActiveTeachStep(false);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#5B5CE2] text-white text-xs font-semibold hover:bg-[#4b4cd1] transition-colors"
                >
                  Add takeaway to notebook
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Demonstrate Step & Evaluator Result Modal (Screens 8 & 9) */}
        {activeDemonstrateStep && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full bg-[#FDFCF9] border border-[#E7E5DF] rounded-2xl p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E7E5DF] pb-3">
                <div className="flex items-center gap-2 text-[#3B8C68] font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Demonstrate Understanding: {conceptDef.name}
                </div>
                <button onClick={() => { setActiveDemonstrateStep(false); setEvalResult(null); }} className="text-[#73777D] hover:text-[#202225]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!evalResult ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#3B8C68]/10 rounded-xl border border-[#3B8C68]/20 text-xs text-[#202225]">
                    <span className="font-semibold text-[#3B8C68] block mb-1">Demonstration Prompt:</span>
                    Explain what happens to the output rate of change when the inner function's derivative doubles in the chain rule f(g(x)).
                  </div>

                  <textarea
                    value={demonstrateResponse}
                    onChange={(e) => setDemonstrateResponse(e.target.value)}
                    placeholder="Type your explanation in your own words..."
                    rows={4}
                    className="w-full p-3.5 rounded-xl border border-[#E7E5DF] bg-white text-xs text-[#202225] focus:outline-none focus:border-[#3B8C68] transition-colors resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleRunDemonstration}
                      disabled={!demonstrateResponse.trim()}
                      className="px-4 py-2 rounded-xl bg-[#3B8C68] hover:bg-[#327758] disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                    >
                      Evaluate my explanation
                    </button>
                  </div>
                </div>
              ) : (
                /* Evaluator Result Table (Screen 9) */
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-[#3B8C68]/10 border border-[#3B8C68]/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#73777D]">Evaluated Qualitative Confidence:</span>
                      <div className="text-base font-bold text-[#3B8C68]">{evalResult.confidence}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#3B8C68] text-white">
                      Action: {evalResult.recommendedAction}
                    </span>
                  </div>

                  {/* Requirements Rubric Table */}
                  <div>
                    <h4 className="text-xs font-semibold text-[#73777D] uppercase tracking-wider mb-2">
                      Rubric Requirements Evaluation:
                    </h4>
                    <div className="border border-[#E7E5DF] rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F8F7F3] border-b border-[#E7E5DF] text-[#73777D] font-medium">
                          <tr>
                            <th className="p-2.5">Requirement</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Evidence Quote</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7E5DF]">
                          {evalResult.requirementStatuses.map((req, i) => (
                            <tr key={i} className="bg-white">
                              <td className="p-2.5 font-medium text-[#202225]">{req.statement}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  req.status === 'Met' ? 'bg-[#3B8C68]/15 text-[#3B8C68]' :
                                  req.status === 'Partly met' ? 'bg-[#D99024]/15 text-[#D99024]' :
                                  'bg-[#C9685A]/15 text-[#C9685A]'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-[#73777D] font-mono text-[11px] truncate max-w-xs">
                                "{req.evidenceQuote}"
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E5DF]">
                    <button
                      onClick={() => { setEvalResult(null); setDemonstrateResponse(''); }}
                      className="px-3.5 py-2 rounded-lg border border-[#E7E5DF] text-xs font-medium text-[#73777D] hover:bg-[#F8F7F3]"
                    >
                      Try another response
                    </button>
                    <button
                      onClick={() => { setActiveDemonstrateStep(false); setEvalResult(null); }}
                      className="px-3.5 py-2 rounded-lg bg-[#3B8C68] text-white text-xs font-semibold hover:bg-[#327758]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </LearnLoopShell>
  );
};
