import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import {
  BookOpen,
  GitCommit,
  TrendingUp,
  Settings,
  Plus,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  User,
  PanelRightClose,
  PanelRightOpen,
  Check
} from 'lucide-react';
import { getLearnerModel, LearnerModelStore } from '../../lib/learnloop/learnerModel';
import { CONCEPT_ONTOLOGY } from '../../lib/learnloop/ontology';
import { evaluatePolicy, ActionRecommendation } from '../../lib/learnloop/policyEngine';

interface Props {
  children: React.ReactNode;
  activeConceptId?: string;
  onSelectAction?: (rec: ActionRecommendation) => void;
}

export const LearnLoopShell: React.FC<Props> = ({
  children,
  activeConceptId = 'chain-rule',
  onSelectAction
}) => {
  const [location, setLocation] = useLocation();
  const [model, setModel] = useState<LearnerModelStore>(getLearnerModel());
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);

  useEffect(() => {
    const fresh = getLearnerModel();
    setModel(fresh);
  }, [location]);

  const conceptDef = CONCEPT_ONTOLOGY[activeConceptId] || CONCEPT_ONTOLOGY['chain-rule'];
  const conceptRecord = model.conceptRecords[activeConceptId] || {
    conceptId: activeConceptId,
    state: 'Familiar',
    confidence: 'Emerging',
    requirementStatuses: {},
    evidenceRecords: [],
    misconceptionHistory: []
  };

  const actionRec = evaluatePolicy(activeConceptId, conceptRecord);

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'Applied': return 'bg-[#3B8C68] text-white';
      case 'Understood': return 'bg-[#3B8C68]/15 text-[#3B8C68] border border-[#3B8C68]/30';
      case 'Familiar': return 'bg-[#18A999]/15 text-[#18A999] border border-[#18A999]/30';
      case 'Exposed': return 'bg-[#5B5CE2]/15 text-[#5B5CE2] border border-[#5B5CE2]/30';
      default: return 'bg-[#73777D]/15 text-[#73777D] border border-[#73777D]/30';
    }
  };

  const metRequirements = conceptDef.requirements.filter(
    r => (conceptRecord.requirementStatuses[r.id] || 'Not yet shown') === 'Met'
  );
  const checkingRequirements = conceptDef.requirements.filter(
    r => (conceptRecord.requirementStatuses[r.id] || 'Not yet shown') !== 'Met'
  );

  const handleActionClick = (action: ActionRecommendation) => {
    if (onSelectAction) {
      onSelectAction(action);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F7F3] text-[#202225] font-sans antialiased selection:bg-[#5B5CE2]/20">
      {/* 1. LEFT RAIL */}
      <aside className="w-60 shrink-0 border-r border-[#E7E5DF] bg-[#FDFCF9] flex flex-col justify-between p-4 z-20">
        <div>
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1.5 mb-5 text-[#202225] font-semibold text-lg tracking-tight hover:opacity-90">
            <div className="w-7 h-7 rounded-lg bg-[#5B5CE2] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <span>LearnLoop</span>
          </Link>

          {/* New Note Button */}
          <Link
            href="/"
            className="w-full mb-6 flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#5B5CE2] hover:bg-[#4b4cd1] text-white text-xs font-medium shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <Link
              href="/"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location === '/' ? 'bg-[#5B5CE2]/10 text-[#5B5CE2] font-semibold' : 'text-[#73777D] hover:bg-[#F8F7F3] hover:text-[#202225]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Notebook
            </Link>

            <Link
              href="/path"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location === '/path' ? 'bg-[#5B5CE2]/10 text-[#5B5CE2] font-semibold' : 'text-[#73777D] hover:bg-[#F8F7F3] hover:text-[#202225]'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              Path
            </Link>

            <Link
              href="/growth"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location === '/growth' ? 'bg-[#5B5CE2]/10 text-[#5B5CE2] font-semibold' : 'text-[#73777D] hover:bg-[#F8F7F3] hover:text-[#202225]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Growth
            </Link>

            <Link
              href="/settings"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location === '/settings' ? 'bg-[#5B5CE2]/10 text-[#5B5CE2] font-semibold' : 'text-[#73777D] hover:bg-[#F8F7F3] hover:text-[#202225]'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </div>

        {/* Learner Profile Avatar */}
        <div className="pt-3 border-t border-[#E7E5DF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#5B5CE2]/15 text-[#5B5CE2] flex items-center justify-center font-semibold text-xs border border-[#5B5CE2]/30">
              {model.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#202225] line-clamp-1">{model.displayName}</div>
              <div className="text-[11px] text-[#73777D]">CS Path · Active</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. CENTER WORKSPACE + TOP BAR */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-[#E7E5DF] bg-[#FDFCF9]/80 backdrop-blur-xs px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-[#202225]">LearnLoop Notebook</h1>
            <span className="text-[#73777D] text-xs">/</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18A999]/10 text-[#18A999] text-xs font-medium">
              <Layers className="w-3.5 h-3.5" />
              <span>{conceptDef.name}</span>
            </div>
          </div>

          {/* Sync & Memory Cue */}
          <div className="flex items-center gap-4">
            {model.lastSessionMemoryCue && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B5CE2]/8 border border-[#5B5CE2]/20 text-xs text-[#5B5CE2]">
                <Zap className="w-3.5 h-3.5 text-[#5B5CE2]" />
                <span className="truncate max-w-xs">{model.lastSessionMemoryCue}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-[#3B8C68] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#3B8C68]" />
              <span>Saved</span>
            </div>

            <button
              onClick={() => setIsRailCollapsed(!isRailCollapsed)}
              className="p-1.5 rounded-lg border border-[#E7E5DF] hover:bg-[#F8F7F3] text-[#73777D] transition-colors"
              title={isRailCollapsed ? "Expand Intelligence Rail" : "Collapse Intelligence Rail"}
            >
              {isRailCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Workspace Canvas Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* 3. RIGHT INTELLIGENCE RAIL */}
      {!isRailCollapsed && (
        <aside className="w-80 shrink-0 border-l border-[#E7E5DF] bg-[#FDFCF9] flex flex-col justify-between p-5 overflow-y-auto z-20">
          <div className="space-y-6">
            {/* Active Concept Header */}
            <div>
              <div className="text-[11px] font-semibold text-[#73777D] uppercase tracking-wider mb-1.5">
                Current Concept
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#202225]">{conceptDef.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateBadge(conceptRecord.state)}`}>
                  {conceptRecord.state}
                </span>
              </div>
              <p className="text-xs text-[#73777D] mt-1.5 leading-relaxed">{conceptDef.shortDefinition}</p>
            </div>

            {/* Confidence & Evidence Summary */}
            <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E7E5DF] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#73777D] font-medium">Confidence:</span>
                <span className="font-semibold text-[#5B5CE2]">{conceptRecord.confidence}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#73777D] font-medium">Evidence Count:</span>
                <span className="font-mono text-[#202225] font-semibold">{conceptRecord.evidenceRecords.length} records</span>
              </div>
            </div>

            {/* What You Have Shown */}
            <div>
              <div className="text-xs font-semibold text-[#3B8C68] mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>What you have shown</span>
              </div>
              {metRequirements.length === 0 ? (
                <p className="text-xs text-[#73777D] italic pl-5">No explicit requirements met yet.</p>
              ) : (
                <ul className="space-y-1.5 text-xs text-[#202225]">
                  {metRequirements.map(req => (
                    <li key={req.id} className="flex items-start gap-2 bg-[#3B8C68]/5 p-2 rounded-lg border border-[#3B8C68]/15">
                      <Check size={14} strokeWidth={3} className="text-[#3B8C68] shrink-0 mt-0.5" />
                      <span>{req.statement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Still Checking */}
            <div>
              <div className="text-xs font-semibold text-[#D99024] mb-2 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" />
                <span>Still checking</span>
              </div>
              {checkingRequirements.length === 0 ? (
                <p className="text-xs text-[#73777D] italic pl-5">All requirements for this concept demonstrated!</p>
              ) : (
                <ul className="space-y-1.5 text-xs text-[#202225]">
                  {checkingRequirements.map(req => (
                    <li key={req.id} className="flex items-start gap-2 bg-[#D99024]/5 p-2 rounded-lg border border-[#D99024]/15">
                      <span className="text-[#D99024] font-bold">?</span>
                      <span>{req.statement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Contextual Action Tray */}
            <div className="pt-2 border-t border-[#E7E5DF]">
              <div className="text-[11px] font-semibold text-[#73777D] uppercase tracking-wider mb-2.5">
                Recommended Action
              </div>

              <div className="p-3.5 rounded-xl bg-[#5B5CE2]/8 border border-[#5B5CE2]/20 space-y-3">
                <div className="text-xs text-[#202225] leading-relaxed">
                  <span className="font-semibold text-[#5B5CE2] block mb-1">Why this action:</span>
                  {actionRec.reason}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleActionClick({ ...actionRec, action: 'Continue' })}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E7E5DF] hover:bg-[#F8F7F3] text-xs font-medium text-[#202225] transition-colors"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => handleActionClick({ ...actionRec, action: 'Go deeper' })}
                    className="px-2.5 py-1.5 rounded-lg bg-[#5B5CE2] text-white hover:bg-[#4b4cd1] text-xs font-medium transition-colors"
                  >
                    Go deeper
                  </button>
                  <button
                    onClick={() => handleActionClick({ ...actionRec, action: 'Practice' })}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E7E5DF] hover:bg-[#F8F7F3] text-xs font-medium text-[#202225] transition-colors"
                  >
                    Practice
                  </button>
                  <button
                    onClick={() => handleActionClick({ ...actionRec, action: 'Explore' })}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E7E5DF] hover:bg-[#F8F7F3] text-xs font-medium text-[#202225] transition-colors"
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
