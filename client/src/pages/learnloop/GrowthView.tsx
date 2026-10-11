import React from "react";
import { ArrowRight, CheckCircle2, AlertTriangle, Sprout } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export const GrowthView: React.FC = () => {
  const [, setLocation] = useLocation();

  const modelQuery = trpc.learnloop.getModel.useQuery();
  const evidenceQuery = trpc.learnloop.getEvidence.useQuery();

  const concepts = modelQuery.data?.model?.conceptRecords || {};

  const isChainRuleUnderstood = concepts["chain-rule"]?.state === "Understood";

  const masteryItems = [
    { 
      name: "Functions", 
      level: concepts["functions"]?.state?.toUpperCase() || "APPLIED", 
      filledBars: concepts["functions"]?.state === "Applied" ? 4 : 3 
    },
    { 
      name: "Derivatives", 
      level: concepts["derivatives"]?.state?.toUpperCase() || "UNDERSTOOD", 
      filledBars: 3 
    },
    { 
      name: "Composition", 
      level: concepts["composition"]?.state?.toUpperCase() || "UNDERSTOOD", 
      filledBars: 3 
    },
    { 
      name: "Chain Rule", 
      level: isChainRuleUnderstood ? "UNDERSTOOD" : "FAMILIAR", 
      filledBars: isChainRuleUnderstood ? 3 : 2 
    },
    { 
      name: "Computational Graphs", 
      level: concepts["computational-graphs"]?.state?.toUpperCase() || (isChainRuleUnderstood ? "UNDERSTOOD" : "NEXT"), 
      filledBars: isChainRuleUnderstood ? 3 : 0 
    },
  ];

  const recentEvidence = evidenceQuery.data?.evidence?.length 
    ? evidenceQuery.data.evidence.slice(-3).reverse().map((ev: any) => ({
        title: `${ev.resultStatus}: ${ev.conceptId}${ev.detectedMisconception ? ` (${ev.detectedMisconception})` : ""}`,
        date: "Today"
      }))
    : [
        { title: isChainRuleUnderstood ? "Retest passed: Chain Rule" : "Slip found: Chain Rule, step 4", date: "Today" },
        { title: "Retest passed: Composition", date: "Oct 10" },
      ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-8 font-sans space-y-8 select-none">
      
      {/* Header */}
      <h1 className="text-4xl font-serif font-black tracking-tight text-[#1E1C1A] dark:text-[#F4F0EA]">
        Growth
      </h1>

      {/* 2-Column Layout (Matching Page 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Mastery & Recent Evidence (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* MASTERY Section */}
          <section className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
              Mastery
            </span>

            <div className="space-y-2.5">
              {masteryItems.map((item) => (
                <div
                  key={item.name}
                  onClick={() => setLocation("/path")}
                  className="cursor-pointer bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#FDFBF7] dark:hover:bg-[#222228] transition-all"
                >
                  <span className="font-bold text-sm text-[#1E1C1A] dark:text-[#F4F0EA] w-36">
                    {item.name}
                  </span>

                  {/* 4 Segmented Progress Bars (Matching Page 10) */}
                  <div className="flex items-center gap-1.5 flex-1 max-w-[160px] mx-4">
                    {[0, 1, 2, 3].map((idx) => {
                      const isFilled = idx < item.filledBars;
                      return (
                        <div
                          key={idx}
                          className={`h-2 flex-1 rounded-full border border-[#1E1C1A]/40 dark:border-[#3A3A44] transition-all ${
                            isFilled ? "bg-[#3D7953] dark:bg-[#4E9A6F]" : "bg-gray-100 dark:bg-[#2C2C34]"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <span className={`text-[11px] font-black uppercase tracking-wider shrink-0 ${
                    item.level === "APPLIED" || item.level === "UNDERSTOOD"
                      ? "text-[#3D7953] dark:text-[#4E9A6F]"
                      : item.level === "FAMILIAR"
                      ? "text-[#C87D55]"
                      : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {item.level}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* RECENT EVIDENCE Section */}
          <section className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
              Recent Evidence
            </span>

            <div className="space-y-2.5">
              {recentEvidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]"
                >
                  <span className="font-bold text-sm text-[#1E1C1A] dark:text-[#F4F0EA]">{ev.title}</span>
                  <span className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-semibold">{ev.date}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Your Plant & Mistake Patterns (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* YOUR PLANT Card */}
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-6 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-4 text-center">
            <div className="text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92]">
                Your Plant
              </span>
            </div>

            {/* Plant SVG Illustration */}
            <div className="py-4 flex justify-center">
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Stem */}
                <path d="M50 90V30" stroke="#4E9A6F" strokeWidth="2.5" strokeLinecap="round" />
                {/* Left Leaf */}
                <path d="M50 65C38 65 32 55 35 45C45 42 50 52 50 65Z" fill="#A8D5BA" fillOpacity="0.6" stroke="#4E9A6F" strokeWidth="2" />
                {/* Right Leaf */}
                <path d="M50 48C65 48 72 38 70 26C58 24 50 36 50 48Z" fill="#A8D5BA" fillOpacity="0.6" stroke="#4E9A6F" strokeWidth="2" />
                {isChainRuleUnderstood && (
                  <>
                    {/* Extra blooming top leaf / flower */}
                    <circle cx="50" cy="26" r="8" fill="#EBD37A" stroke="#C87D55" strokeWidth="2" />
                    <circle cx="50" cy="26" r="3" fill="#C87D55" />
                    <path d="M50 38C34 38 30 28 34 20C42 18 50 26 50 38Z" fill="#A8D5BA" fillOpacity="0.8" stroke="#4E9A6F" strokeWidth="2" />
                  </>
                )}
              </svg>
            </div>

            <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium leading-relaxed">
              Grows from what you prove, not time spent.
            </p>
          </div>

          {/* MISTAKE PATTERNS Card */}
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-6 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
              Mistake Patterns
            </span>

            <h3 className="font-serif font-bold text-base text-[#1E1C1A] dark:text-[#F4F0EA]">
              Adds rates instead of chaining them
            </h3>

            <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium leading-relaxed">
              Seen in 2 notebooks. Next retest suggested.
            </p>

            <button
              onClick={() => setLocation("/where-it-breaks")}
              className="mt-2 w-full py-2.5 rounded-xl bg-[#C87D55] text-white font-bold text-xs border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45] transition-colors"
            >
              Review Slip & Retest
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
