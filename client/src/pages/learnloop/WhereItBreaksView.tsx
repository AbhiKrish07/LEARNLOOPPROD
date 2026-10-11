import React, { useState } from "react";
import { ArrowLeft, AlertTriangle, ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { RetestModal } from "@/components/learnloop/RetestModal";

export const WhereItBreaksView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [showRetestModal, setShowRetestModal] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Read stored diagnosis if available
  const storedDiagRaw = typeof window !== "undefined" ? sessionStorage.getItem("learnloop_last_diagnosis") : null;
  const diag = storedDiagRaw ? JSON.parse(storedDiagRaw) : null;

  const steps: Array<{ number: number; text: string; isBroken: boolean; label?: string }> = diag?.steps?.length ? diag.steps.map((s: any) => ({
    number: s.stepNumber,
    text: s.text,
    isBroken: s.isBroken,
    label: s.isBroken ? "THE BREAK IS HERE" : undefined
  })) : [
    { number: 1, text: "Let u = 3x + 1, so y = u²", isBroken: false },
    { number: 2, text: "dy/du = 2u", isBroken: false },
    { number: 3, text: "du/dx = 3", isBroken: false },
    { number: 4, text: "dy/dx = 2u + 3", isBroken: true, label: "THE BREAK IS HERE" },
    { number: 5, text: "= 6x + 5, built on step 4", isBroken: false },
  ];

  const brokenStepNum = diag?.brokenStepIndex || 4;
  const diagTitle = diag?.title || "You added the two rates. Along a chain they multiply: dy/dx = dy/du · du/dx.";
  const misconception = diag?.misconception || "Adds rates instead of chaining them";
  const crossNotebook = diag?.crossNotebookNote || "Same slip as your Product Rule notes [Sept 14].";

  return (
    <div className="max-w-5xl mx-auto py-10 px-8 font-sans space-y-7 select-none">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
          <span className="w-5 h-5 rounded-md border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center text-[10px]">LL</span>
          <span>Where it breaks</span>
        </div>
        <h1 className="text-4xl font-serif font-black tracking-tight text-[#1E1C1A] dark:text-[#F4F0EA]">
          Your working
        </h1>
      </div>

      {/* Grid: Left Steps (7 cols) & Right Breakdown Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Steps Cards List */}
        <div className="lg:col-span-7 space-y-3">
          {steps.map((st) => (
            <div
              key={st.number}
              className={`p-4 rounded-2xl border-2 transition-all ${
                st.isBroken
                  ? "bg-[#FFE57F] dark:bg-[#2B2314] border-[#1E1C1A] dark:border-[#D4A359] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]"
                  : "bg-white dark:bg-[#1A1A1E] border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-black shrink-0 ${
                  st.isBroken 
                    ? "bg-[#1E1C1A] dark:bg-[#D4A359] text-white dark:text-[#1E1C1A] border-[#1E1C1A] dark:border-[#D4A359]" 
                    : "bg-[#FDFBF7] dark:bg-[#222228] text-[#1E1C1A] dark:text-[#F4F0EA] border-[#1E1C1A] dark:border-[#2C2C34]"
                }`}>
                  {st.number}
                </span>

                <div className="flex-1">
                  <span className={`font-mono text-sm font-bold ${
                    st.isBroken ? "text-[#1E1C1A] dark:text-[#F4F0EA]" : "text-[#1E1C1A] dark:text-[#F4F0EA]"
                  }`}>
                    {st.text}
                  </span>
                  {st.isBroken && (
                    <span className="block text-[10px] font-black uppercase tracking-widest text-[#B26B45] dark:text-[#E0A855] mt-1">
                      {st.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Inspector Card (Matching Page 17) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-6 shadow-[4px_4px_0px_#1E1C1A] dark:shadow-[4px_4px_0px_#000000] space-y-4">
            
            <span className="text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92] block">
              STEP {brokenStepNum}
            </span>

            <p className="font-serif font-bold text-base text-[#1E1C1A] dark:text-[#F4F0EA] leading-relaxed">
              {diagTitle}
            </p>

            {/* Misconception Tag */}
            <div className="inline-block p-2.5 rounded-xl border border-[#1E1C1A] dark:border-[#D4A359]/50 bg-[#FFE57F]/50 dark:bg-[#2B2314] text-xs font-bold text-[#1E1C1A] dark:text-[#E0A855]">
              {misconception}
            </div>

            {/* Cross-notebook memory */}
            <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium">
              {crossNotebook}
            </p>

            {showExplanation && (
              <div className="p-3 bg-[#E8F5E9] dark:bg-[#1C2C22] border border-[#3D7953] dark:border-[#4E9A6F] rounded-xl text-xs text-[#1E1C1A] dark:text-[#E0F2E9] space-y-1">
                <strong className="text-[#3D7953] dark:text-[#4E9A6F] block">Grounded Reason:</strong>
                <p>When you change x by Δx, u changes by 3Δx. Then y changes by 2u times that change (not 2u + 3). Hence rates multiply!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex-1 py-2.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]"
              >
                Show me why
              </button>
              <button
                onClick={() => setShowRetestModal(true)}
                className="flex-1 py-2.5 rounded-xl bg-[#C87D55] text-white text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45]"
              >
                Retest me
              </button>
            </div>

          </div>

          <button
            onClick={() => setLocation("/notebook")}
            className="w-full py-2.5 rounded-xl bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]"
          >
            <BookOpen size={14} /> Back to Notebook
          </button>
        </div>

      </div>

      {showRetestModal && (
        <RetestModal
          onClose={() => setShowRetestModal(false)}
          onPassed={() => {
            alert("Retest passed! Concept upgraded to UNDERSTOOD.");
            setLocation("/growth");
          }}
        />
      )}

    </div>
  );
};
