import React, { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export const CalibrationView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [currentQIndex, setCurrentQIndex] = useState(1); // 0-based index for Question 2 of 5
  const [selectedOption, setSelectedOption] = useState<number | null>(1);
  const [confidence, setConfidence] = useState<"guessing" | "fairly_sure" | "certain">("fairly_sure");

  const questions = [
    {
      q: "What does function composition f(g(x)) represent?",
      options: [
        "Adding two functions together",
        "Feeding the output of g into the input of f",
        "Multiplying f by g",
        "Finding the inverse of f"
      ],
      correct: 1
    },
    {
      q: "If h(x) = f(g(x)), what is h'(x) built from?",
      options: [
        "f'(x) + g'(x)",
        "f'(g(x)) · g'(x)",
        "f'(g'(x))",
        "f(x) · g'(x)"
      ],
      correct: 1
    },
    {
      q: "In backpropagation, how is the gradient propagated backward?",
      options: [
        "Through matrix inversion",
        "By multiplying local Jacobians along computational paths",
        "By averaging weights",
        "By adding loss gradients directly"
      ],
      correct: 1
    },
    {
      q: "What does the slope of g'(x) tell us in the composite rate?",
      options: [
        "How fast the outer function changes",
        "How fast the inner function moves per unit change in x",
        "The constant bias of the network",
        "The maximum value of the function"
      ],
      correct: 1
    },
    {
      q: "What happens if you accidentally add the rates instead of multiplying?",
      options: [
        "The scale of input perturbation is lost",
        "The gradient grows exponentially",
        "The derivative becomes zero everywhere",
        "It yields the exact same result"
      ],
      correct: 0
    }
  ];

  const currentQ = questions[currentQIndex] || questions[1];

  const submitCalibMutation = trpc.learnloop.submitCalibration.useMutation();

  const handleNext = () => {
    if (selectedOption !== null) {
      submitCalibMutation.mutate({
        questionIndex: currentQIndex,
        conceptId: "chain-rule",
        answer: currentQ.options[selectedOption]
      });
    }

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setLocation("/growth");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-8 font-sans space-y-8 select-none">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
          <span className="w-5 h-5 rounded-md border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center text-[10px]">LL</span>
          <span>Quick calibration</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
            QUESTION {currentQIndex + 1} OF {questions.length}
          </span>
          <span className="text-xs font-medium text-[#635F5B] dark:text-[#9E9A92]">
            Adapts to your answers
          </span>
        </div>
      </div>

      {/* Question Title */}
      <h2 className="text-2xl font-serif font-black text-[#1E1C1A] dark:text-[#F4F0EA]">
        {currentQ.q}
      </h2>

      {/* 4 Options Cards (Matching Page 19) */}
      <div className="space-y-3">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          return (
            <div
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] ${
                isSelected
                  ? "border-[#1E1C1A] dark:border-[#C87D55] bg-[#C87D55]/10 dark:bg-[#C87D55]/20 ring-2 ring-[#C87D55]"
                  : "border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] hover:bg-[#FDFBF7] dark:hover:bg-[#222228]"
              }`}
            >
              <span className="font-mono text-sm font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                {opt}
              </span>
            </div>
          );
        })}
      </div>

      {/* Confidence Selector & Next Button (Matching Page 19) */}
      <div className="pt-4 border-t border-[#1E1C1A]/15 dark:border-[#2C2C34] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block mb-2">
              HOW SURE ARE YOU?
            </span>
            <div className="flex items-center gap-2">
              {[
                { id: "guessing", label: "Guessing" },
                { id: "fairly_sure", label: "Fairly sure" },
                { id: "certain", label: "Certain" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setConfidence(c.id as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-all shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000] ${
                    confidence === c.id
                      ? "bg-[#C87D55] text-white"
                      : "bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="px-6 py-2.5 rounded-xl bg-[#C87D55] text-white font-bold text-xs border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45] disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};
