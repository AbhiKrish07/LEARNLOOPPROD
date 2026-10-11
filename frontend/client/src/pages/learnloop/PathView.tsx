import React from "react";
import { CheckCircle2, Lock, ArrowRight, Check } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export const PathView: React.FC = () => {
  const [, setLocation] = useLocation();

  const modelQuery = trpc.learnloop.getModel.useQuery();
  const concepts = modelQuery.data?.model?.conceptRecords || {};

  const isChainRuleUnderstood = concepts["chain-rule"]?.state === "Understood";
  const isBackpropUnlocked = concepts["backpropagation"]?.state !== "Locked" && isChainRuleUnderstood;

  const pathItems = [
    { id: "functions", name: "Functions", status: concepts["functions"]?.state?.toUpperCase() || "APPLIED", color: "bg-[#3D7953] text-white" },
    { id: "derivatives", name: "Derivatives", status: concepts["derivatives"]?.state?.toUpperCase() || "UNDERSTOOD", color: "bg-[#3D7953] text-white" },
    { id: "composition", name: "Composition", status: concepts["composition"]?.state?.toUpperCase() || "UNDERSTOOD", color: "bg-[#3D7953] text-white" },
    { id: "chain-rule", name: "Chain Rule", status: isChainRuleUnderstood ? "UNDERSTOOD" : "FAMILIAR", color: isChainRuleUnderstood ? "bg-[#3D7953] text-white" : "bg-[#C87D55] text-white" },
    { id: "computational-graphs", name: "Computational Graphs", status: isChainRuleUnderstood ? "UNDERSTOOD" : "NEXT", color: isChainRuleUnderstood ? "bg-[#3D7953] text-white" : "bg-gray-200 text-gray-700" },
    { id: "backpropagation", name: "Backpropagation", status: isBackpropUnlocked ? "FAMILIAR" : "LOCKED", color: isBackpropUnlocked ? "bg-[#C87D55] text-white" : "bg-gray-200 text-gray-700" },
    { id: "gradient-descent", name: "Gradient Descent", status: isBackpropUnlocked ? "NEXT" : "LOCKED", color: "bg-gray-200 text-gray-700" },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-8 font-sans space-y-7 select-none">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
          <span className="w-5 h-5 rounded-md border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center text-[10px]">LL</span>
          <span>Path and growth</span>
        </div>
        <h1 className="text-4xl font-serif font-black tracking-tight text-[#1E1C1A] dark:text-[#F4F0EA]">
          Your path
        </h1>
      </div>

      {/* Grid Layout (Matching Page 20) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Path Progression List (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          {pathItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.status === "LOCKED") {
                  alert("This concept unlocks once you complete and retest Chain Rule!");
                } else {
                  setLocation("/notebook");
                }
              }}
              className="cursor-pointer bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#FDFBF7] dark:hover:bg-[#222228] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border border-[#1E1C1A] dark:border-[#2C2C34] ${item.status === "LOCKED" || item.status === "NEXT" ? "bg-gray-200 dark:bg-[#2C2C34] text-gray-700 dark:text-gray-400" : item.color} flex items-center justify-center font-bold text-xs shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]`}>
                  {item.status === "APPLIED" || item.status === "UNDERSTOOD" ? (
                    <Check size={12} strokeWidth={3} />
                  ) : item.status === "LOCKED" ? (
                    <Lock size={11} strokeWidth={2.5} />
                  ) : (
                    "•"
                  )}
                </div>
                <span className="font-serif font-bold text-base text-[#1E1C1A] dark:text-[#F4F0EA]">
                  {item.name}
                </span>
              </div>

              <span className={`text-[11px] font-black uppercase tracking-wider ${
                item.status === "APPLIED" || item.status === "UNDERSTOOD"
                  ? "text-[#3D7953] dark:text-[#4E9A6F]"
                  : item.status === "FAMILIAR"
                  ? "text-[#C87D55]"
                  : "text-gray-400 dark:text-gray-500"
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>

        {/* Right Column: GROWTH Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-6 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-5">
            <span className="text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92] block">
              GROWTH
            </span>

            {/* Plant Illustration */}
            <div className="py-2 flex justify-center">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 85V40" stroke="#4E9A6F" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M50 65C38 65 32 55 35 45C45 42 50 52 50 65Z" fill="#A8D5BA" fillOpacity="0.4" stroke="#4E9A6F" strokeWidth="2" />
                <path d="M50 48C65 48 72 38 70 26C58 24 50 36 50 48Z" fill="#A8D5BA" fillOpacity="0.4" stroke="#4E9A6F" strokeWidth="2" />
              </svg>
            </div>

            <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium leading-relaxed text-center">
              Your plant grows from what you prove, not the time you spend.
            </p>

            {/* Recent Evidence */}
            <div className="pt-3 border-t border-[#1E1C1A]/15 dark:border-[#2C2C34] space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
                RECENT EVIDENCE
              </span>
              <div className="flex items-center justify-between text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                <span>Retest passed: Composition</span>
                <span className="text-gray-400 dark:text-[#9E9A92]">Oct 10</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                <span>Slip found: Chain Rule step 4</span>
                <span className="text-gray-400 dark:text-[#9E9A92]">Today</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
