import React, { useState, useEffect } from "react";
import { Brain, ArrowRight, BookOpen, RotateCcw, Plus, Sprout, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export const YourBrainView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"all" | "calculus" | "ml">("all");

  const brainQuery = trpc.learnloop.getBrain.useQuery();
  const neurons = brainQuery.data?.neurons || [];

  const [selectedNeuron, setSelectedNeuron] = useState<any>({
    title: "Chain Rule session",
    date: "Today",
    durationMinutes: 28,
    pagesWritten: 2,
    slipsFixed: 1,
    retestsPassed: 1
  });

  useEffect(() => {
    if (neurons.length > 0 && !selectedNeuron?.id) {
      const latest = neurons[neurons.length - 1];
      setSelectedNeuron(latest);
    }
  }, [neurons]);

  const neuronsCount = brainQuery.data?.neuronsCount || neurons.length || 6;
  const hoursStudied = brainQuery.data?.hoursStudied || "2.4";

  return (
    <div className="max-w-6xl mx-auto py-10 px-8 font-sans space-y-7 select-none">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-md border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center text-xs font-black">LL</span>
          <h1 className="text-3xl font-serif font-black text-[#1E1C1A] dark:text-[#F4F0EA]">
            Your brain
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-black border border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA]">
            {neuronsCount} NEURONS
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-black border border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA]">
            {hoursStudied} H STUDIED
          </span>
        </div>

        {/* Filter Pills & New Session Button */}
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All" },
            { id: "calculus", label: "Calculus" },
            { id: "ml", label: "Machine learning" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-all ${
                filter === f.id
                  ? "bg-[#C87D55] text-white shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]"
                  : "bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setLocation("/study-session")}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center gap-1 shadow-[1px_1px_0px_#1E1C1A] hover:bg-[#B26B45]"
          >
            <Plus size={12} strokeWidth={3} /> Study
          </button>
        </div>
      </div>

      {/* Grid: Graph Canvas (8 cols) & Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive Neural Canvas */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-6 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] relative h-[440px] flex items-center justify-center overflow-hidden">
          
          {/* Synaptic SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="220" y1="140" x2="350" y2="210" stroke="currentColor" className="text-[#1E1C1A] dark:text-[#3A3A44]" strokeWidth="2" strokeDasharray="3,3" />
            <line x1="480" y1="130" x2="350" y2="210" stroke="currentColor" className="text-[#1E1C1A] dark:text-[#3A3A44]" strokeWidth="2" strokeDasharray="3,3" />
            <line x1="120" y1="230" x2="250" y2="290" stroke="currentColor" className="text-[#1E1C1A] dark:text-[#3A3A44]" strokeWidth="2" strokeDasharray="3,3" />
            <line x1="250" y1="290" x2="350" y2="210" stroke="currentColor" className="text-[#1E1C1A] dark:text-[#3A3A44]" strokeWidth="2" strokeDasharray="3,3" />
            <line x1="350" y1="210" x2="490" y2="280" stroke="currentColor" className="text-[#1E1C1A] dark:text-[#3A3A44]" strokeWidth="2" strokeDasharray="3,3" />
            <line x1="490" y1="280" x2="600" y2="220" stroke="currentColor" className="text-[#1E1C1A] dark:text-[#3A3A44]" strokeWidth="2" strokeDasharray="3,3" />
          </svg>

          {/* Connected Neurons */}
          <div className="relative w-full h-full">
            {/* Center Active Neuron (Chain Rule) */}
            <div
              onClick={() => setSelectedNeuron({
                title: "Chain Rule session",
                date: "Today",
                durationMinutes: 28,
                pagesWritten: 2,
                slipsFixed: 1,
                retestsPassed: 1
              })}
              className="absolute left-[310px] top-[170px] cursor-pointer group flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full border-3 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#EBD37A] shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] flex items-center justify-center group-hover:scale-110 transition-transform animate-pulse">
                <div className="w-12 h-12 rounded-full border border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#141416] flex items-center justify-center text-[#3D7953] dark:text-[#8FD5A6]">
                  <Sprout size={18} strokeWidth={2.5} />
                </div>
              </div>
              <span className="font-serif font-black text-xs text-[#1E1C1A] dark:text-[#F4F0EA] mt-2 bg-white dark:bg-[#141416] px-2 py-0.5 rounded border border-[#1E1C1A] dark:border-[#2C2C34]">
                Chain Rule
              </span>
            </div>

            {/* Other Static & Dynamic Neurons */}
            <div 
              onClick={() => setSelectedNeuron({ title: "Calculus Integrals", date: "Oct 8", durationMinutes: 35, pagesWritten: 3, slipsFixed: 0, retestsPassed: 1 })}
              className="absolute left-[180px] top-[110px] w-12 h-12 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#A8CDEE] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] flex items-center justify-center text-xs font-bold text-[#1E1C1A] cursor-pointer hover:scale-110 transition-transform"
            >
              ∫
            </div>

            <div 
              onClick={() => setSelectedNeuron({ title: "Functions & Composition", date: "Oct 9", durationMinutes: 40, pagesWritten: 4, slipsFixed: 2, retestsPassed: 2 })}
              className="absolute left-[450px] top-[100px] w-14 h-14 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#A8D5BA] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] flex items-center justify-center text-xs font-bold text-[#1E1C1A] cursor-pointer hover:scale-110 transition-transform"
            >
              f(x)
            </div>

            <div 
              onClick={() => setSelectedNeuron({ title: "Gradient Descent Exploration", date: "Oct 10", durationMinutes: 20, pagesWritten: 1, slipsFixed: 0, retestsPassed: 1 })}
              className="absolute left-[90px] top-[210px] w-10 h-10 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#9ED7C6] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] flex items-center justify-center text-[10px] font-bold text-[#1E1C1A] cursor-pointer hover:scale-110 transition-transform"
            >
              g
            </div>

            <div 
              onClick={() => setSelectedNeuron({ title: "Computational Graph Traversal", date: "Oct 11", durationMinutes: 30, pagesWritten: 2, slipsFixed: 1, retestsPassed: 1 })}
              className="absolute left-[220px] top-[270px] w-12 h-12 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C3B4E8] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] flex items-center justify-center text-xs font-bold text-[#1E1C1A] cursor-pointer hover:scale-110 transition-transform"
            >
              ∇
            </div>

            <div 
              onClick={() => setSelectedNeuron({ title: "Neural Weights & Bias", date: "Oct 11", durationMinutes: 50, pagesWritten: 5, slipsFixed: 2, retestsPassed: 2 })}
              className="absolute left-[460px] top-[260px] w-16 h-16 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#EBD37A] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] flex items-center justify-center text-xs font-bold text-[#1E1C1A] cursor-pointer hover:scale-110 transition-transform"
            >
              w
            </div>

            {/* Any newly added sessions from user study sessions */}
            {neurons.slice(6).map((n: any, idx: number) => (
              <div
                key={n.id || idx}
                onClick={() => setSelectedNeuron(n)}
                style={{ left: `${Math.min(520, Math.max(60, n.x || (140 + idx * 70)))}px`, top: `${Math.min(320, Math.max(60, n.y || (80 + idx * 50)))}px` }}
                className="absolute w-12 h-12 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform animate-in zoom-in"
              >
                <Sparkles size={14} strokeWidth={2.5} />
              </div>
            ))}
          </div>

        </div>

        {/* Right Inspector Card (Matching Page 23) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-6 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
              SELECTED NEURON
            </span>

            <div>
              <h3 className="font-serif font-black text-xl text-[#1E1C1A] dark:text-[#F4F0EA]">
                {selectedNeuron?.title || "Study Session"}
              </h3>
              <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium mt-1">
                {selectedNeuron?.date || "Today"} · {selectedNeuron?.durationMinutes || selectedNeuron?.duration || 25} min. A bigger neuron means a longer session.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#1E1C1A]/15 dark:border-[#2C2C34]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
                WHAT YOU DID
              </span>
              <div className="p-3 rounded-xl border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                Wrote {selectedNeuron?.pagesWritten || 1} pages
              </div>
              <div className="p-3 rounded-xl border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                Fixed {selectedNeuron?.slipsFixed || 0} slip{selectedNeuron?.slipsFixed === 1 ? ": step 4" : "s"}
              </div>
              <div className="p-3 rounded-xl border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                Passed {selectedNeuron?.retestsPassed || 0} retest{selectedNeuron?.retestsPassed === 1 ? "" : "s"}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => alert("Launching recall flashcard loop for this session!")}
                className="w-full py-2.5 rounded-xl bg-[#C87D55] text-white text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45]"
              >
                Recall this session
              </button>
              <button
                onClick={() => setLocation("/notebook")}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-[#141416] text-[#1E1C1A] dark:text-[#F4F0EA] text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#EBE4DC] dark:hover:bg-[#222228]"
              >
                Open notebook
              </button>
            </div>
          </div>

          <button
            onClick={() => setLocation("/session")}
            className="w-full py-3 rounded-2xl bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#222228] flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]"
          >
            <Plus size={16} /> Start a session
          </button>
        </div>

      </div>

    </div>
  );
};
