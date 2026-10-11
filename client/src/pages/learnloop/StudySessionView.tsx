import React, { useState, useEffect } from "react";
import { Play, Pause, Check, RotateCcw, Loader2, Sprout } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export const StudySessionView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(true);

  const utils = trpc.useUtils();
  const addSessionMutation = trpc.learnloop.addSession.useMutation({
    onSuccess: () => {
      utils.learnloop.getBrain.invalidate();
      setLocation("/brain");
    },
    onError: () => {
      setLocation("/brain");
    }
  });

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const selectPreset = (mins: number) => {
    setTargetMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  
  // Progress fraction
  const progressPct = ((targetMinutes * 60 - secondsLeft) / (targetMinutes * 60)) * 100;

  const handleFinish = () => {
    addSessionMutation.mutate({
      conceptId: "chain-rule",
      title: "Chain Rule session",
      durationMinutes: targetMinutes,
      pagesWritten: 2,
      slipsFixed: 1,
      retestsPassed: 1
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-8 font-sans space-y-10 text-center select-none flex flex-col items-center">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
          <span className="w-5 h-5 rounded-md border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center text-[10px]">LL</span>
          <span>Study session</span>
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]">
          CHAIN RULE
        </span>
      </div>

      {/* Circular Glowing Ring with Central Growing Neuron (Matching Page 24) */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        
        {/* Outer Circular Gauge */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="120"
            stroke="currentColor"
            className="text-[#EBE4DC] dark:text-[#222228]"
            strokeWidth="14"
            fill="none"
          />
          <circle
            cx="144"
            cy="144"
            r="120"
            stroke="#C87D55"
            strokeWidth="14"
            fill="none"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={(2 * Math.PI * 120) * (1 - progressPct / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        {/* Central Growing Neuron Mascot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-3 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#A8D5BA] shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] flex items-center justify-center animate-pulse text-[#1E1C1A]">
            <Sprout size={36} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Timer Text */}
      <div className="font-mono font-black text-6xl text-[#1E1C1A] dark:text-[#F4F0EA] tracking-tight">
        {timeFormatted}
      </div>

      {/* Preset Chips */}
      <div className="flex items-center gap-3">
        {[15, 25, 45].map((preset) => (
          <button
            key={preset}
            onClick={() => selectPreset(preset)}
            className={`px-5 py-2 rounded-full text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-all shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000] ${
              targetMinutes === preset
                ? "bg-[#C87D55] text-white"
                : "bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
            }`}
          >
            {preset} min
          </button>
        ))}
      </div>

      {/* Explanation Subtext */}
      <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium max-w-md leading-relaxed">
        Your neuron grows while you study. When you finish, it joins your brain with a record of what you did.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-6 py-3 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
        >
          {isRunning ? "Pause" : "Resume"}
        </button>

        <button
          onClick={handleFinish}
          className="px-7 py-3 rounded-xl bg-[#C87D55] text-white text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45]"
        >
          Finish session
        </button>
      </div>

    </div>
  );
};
