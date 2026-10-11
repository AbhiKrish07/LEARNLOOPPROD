import React, { useState } from "react";
import { useLocation } from "wouter";

export const OnboardingView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Calculus", "Machine learning"]);

  const topics = [
    "Calculus",
    "Machine learning",
    "Linear algebra",
    "Physics",
    "Quantum computing",
    "Chemistry",
    "Biology",
    "Something else",
  ];

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleContinue = () => {
    setLocation("/loading");
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] dark:bg-[#0E0E10] flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-lg text-center space-y-7">
        
        {/* Mascot Icon */}
        <div className="w-12 h-12 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white font-black text-sm flex items-center justify-center mx-auto shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
          LL
        </div>

        {/* Step Indicator */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92]">
            STEP 1 OF 3
          </span>
          <div className="w-16 h-1 bg-[#C87D55] rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="space-y-1.5">
          <h1 className="text-4xl font-serif font-black text-[#1E1C1A] dark:text-[#F4F0EA]">
            What are you learning?
          </h1>
          <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium">
            Pick a few. LearnLoop builds your first path from these.
          </p>
        </div>

        {/* Topic Pills Grid (Matching Page 4) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md mx-auto">
          {topics.map((t) => {
            const isSelected = selectedTopics.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTopic(t)}
                className={`px-4 py-2 rounded-full text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-all shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000] ${
                  isSelected
                    ? "bg-[#C87D55] text-white"
                    : "bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full max-w-sm mx-auto py-3.5 rounded-2xl bg-[#C87D55] text-white font-bold text-sm border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#B26B45] transition-all block"
        >
          Continue
        </button>

      </div>
    </div>
  );
};
