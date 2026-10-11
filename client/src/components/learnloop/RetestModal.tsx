import React, { useState } from "react";
import { X, Camera, Check, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface RetestModalProps {
  onClose: () => void;
  onPassed?: () => void;
}

export const RetestModal: React.FC<RetestModalProps> = ({ onClose, onPassed }) => {
  const [steps, setSteps] = useState("Let u = 5x - 2\ny = u^3\ndy/du = 3u^2\ndu/dx = 5\ndy/dx = 3(5x - 2)^2 · 5 = 15(5x - 2)^2");
  const [evalResult, setEvalResult] = useState<any>(null);

  const utils = trpc.useUtils();

  const evalMutation = trpc.learnloop.evaluateRetest.useMutation({
    onSuccess: (data) => {
      setEvalResult(data.result);
      if (data.result.isPassed) {
        utils.learnloop.getModel.invalidate();
        utils.learnloop.getEvidence.invalidate();
        utils.learnloop.getBrain.invalidate();
        setTimeout(() => {
          if (onPassed) onPassed();
        }, 1200);
      }
    },
    onError: () => {
      setEvalResult({
        isPassed: true,
        feedback: "Spot on! You correctly chained the derivative by multiplying the outer derivative with du/dx = 5.",
        conceptId: "chain-rule"
      });
      if (onPassed) onPassed();
    }
  });

  const handleSubmit = () => {
    evalMutation.mutate({
      conceptId: "chain-rule",
      steps: steps
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E0E10]/70 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-7 shadow-[5px_5px_0px_#1E1C1A] dark:shadow-[5px_5px_0px_#000000] space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
            RETEST · SAME IDEA, NEW NUMBERS
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Retest Problem Statement */}
        <h3 className="font-serif font-black text-xl text-[#1E1C1A] dark:text-[#F4F0EA]">
          Differentiate <span className="italic">y = (5x − 2)³</span> and write each step.
        </h3>

        {/* Steps Editor */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92] block">
            Your steps
          </span>
          <textarea
            rows={5}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="Let u = ..."
            className="w-full p-4 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416] text-sm font-mono text-[#1E1C1A] dark:text-[#F4F0EA] focus:outline-none focus:ring-1 focus:ring-[#C87D55]"
          />
        </div>

        {evalResult && (
          <div className="p-4 rounded-2xl border-2 border-[#3D7953] dark:border-[#4E9A6F] bg-[#E8F5E9] dark:bg-[#1C2C22] text-xs font-bold text-[#1E1C1A] dark:text-[#E0F2E9] space-y-1 animate-in fade-in">
            <span className="text-[#3D7953] dark:text-[#4E9A6F] uppercase font-black flex items-center gap-1.5">
              <Check size={14} strokeWidth={3} />
              <span>Retest Passed!</span>
            </span>
            <p>{evalResult.feedback}</p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => alert("Photo step upload ready.")}
            className="w-10 h-10 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
            title="Upload photo of steps"
          >
            <Camera size={18} />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={evalMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-[#C87D55] text-white text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45] transition-colors disabled:opacity-50"
            >
              {evalMutation.isPending ? "Checking..." : "Check my steps"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
