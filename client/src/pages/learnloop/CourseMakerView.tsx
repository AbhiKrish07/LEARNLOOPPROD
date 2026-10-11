import React, { useState } from "react";
import { Sparkles, Plus, GripVertical, RotateCcw, ArrowRight, Check } from "lucide-react";
import { useLocation } from "wouter";

export const CourseMakerView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [goal, setGoal] = useState("Backpropagation, from what I already know");
  const [level, setLevel] = useState<"beginner" | "some" | "advanced">("some");
  const [pace, setPace] = useState<"light" | "steady" | "intense">("steady");

  const [module1, setModule1] = useState<Array<{ id: string; title: string; type: string }>>([
    { id: "m1-1", title: "Functions and composition", type: "CONCEPT" },
    { id: "m1-2", title: "Chain Rule", type: "CONCEPT" },
    { id: "m1-3", title: "Chain rule simulation", type: "SIMULATION" },
    { id: "m1-4", title: "Retest: chain rule", type: "RETEST" },
  ]);

  const [module2, setModule2] = useState<Array<{ id: string; title: string; type: string }>>([
    { id: "m2-1", title: "Computational graphs", type: "CONCEPT" },
    { id: "m2-2", title: "Backpropagation", type: "CONCEPT" },
    { id: "m2-3", title: "Gradient descent simulation", type: "SIMULATION" },
  ]);

  const [sources, setSources] = useState<string[]>(["deep_learning_foundations.pdf"]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  const handleBuildCourse = () => {
    setIsBuilding(true);
    setTimeout(() => {
      const topic = goal.toLowerCase();
      if (topic.includes("quantum")) {
        setModule1([
          { id: "m1-1", title: "Qubits and Superposition", type: "CONCEPT" },
          { id: "m1-2", title: "Hadamard & Pauli Gates", type: "CONCEPT" },
          { id: "m1-3", title: "Bloch Sphere Simulation", type: "SIMULATION" },
          { id: "m1-4", title: "Retest: Gate Matrix Multiplication", type: "RETEST" },
        ]);
        setModule2([
          { id: "m2-1", title: "Entanglement & Bell States", type: "CONCEPT" },
          { id: "m2-2", title: "Quantum Teleportation Protocol", type: "CONCEPT" },
          { id: "m2-3", title: "Deutsch-Jozsa Algorithm Lab", type: "SIMULATION" },
        ]);
      } else if (topic.includes("linear algebra")) {
        setModule1([
          { id: "m1-1", title: "Vectors & Linear Combinations", type: "CONCEPT" },
          { id: "m1-2", title: "Matrix Transformations", type: "CONCEPT" },
          { id: "m1-3", title: "Eigenvalue Geometric Simulation", type: "SIMULATION" },
          { id: "m1-4", title: "Retest: Determinants & Inverses", type: "RETEST" },
        ]);
        setModule2([
          { id: "m2-1", title: "Vector Spaces & Subspaces", type: "CONCEPT" },
          { id: "m2-2", title: "Singular Value Decomposition (SVD)", type: "CONCEPT" },
          { id: "m2-3", title: "PCA Dimensionality Reduction Lab", type: "SIMULATION" },
        ]);
      } else {
        // Neural networks / Calculus / Backpropagation
        setModule1([
          { id: "m1-1", title: "Functions and composition", type: "CONCEPT" },
          { id: "m1-2", title: "Chain Rule", type: "CONCEPT" },
          { id: "m1-3", title: "Chain rule simulation", type: "SIMULATION" },
          { id: "m1-4", title: "Retest: chain rule", type: "RETEST" },
        ]);
        setModule2([
          { id: "m2-1", title: "Computational graphs", type: "CONCEPT" },
          { id: "m2-2", title: "Backpropagation", type: "CONCEPT" },
          { id: "m2-3", title: "Gradient descent simulation", type: "SIMULATION" },
          { id: "m2-4", title: "Loss Surface Optimization Lab", type: "SIMULATION" }
        ]);
      }
      setIsBuilding(false);
      setSuccessBanner(true);
    }, 500);
  };

  const handleAddSource = (type: "pdf" | "link" | "notebooks") => {
    if (type === "pdf") {
      const name = prompt("Enter PDF filename or URL:", "lecture_notes.pdf");
      if (name) setSources(prev => [...prev, name]);
    } else if (type === "link") {
      const url = prompt("Enter web documentation link:", "https://colah.github.io/posts/2015-08-Backprop/");
      if (url) setSources(prev => [...prev, url]);
    } else {
      setSources(prev => [...prev, "Calculus Foundations (Notebook)"]);
    }
  };

  const moveModuleItem = (modNum: 1 | 2, index: number, direction: "up" | "down") => {
    const list = modNum === 1 ? [...module1] : [...module2];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    if (modNum === 1) setModule1(list);
    else setModule2(list);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-8 font-sans space-y-7 select-none">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
        <span className="w-5 h-5 rounded-md border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center text-[10px]">LL</span>
        <span>Course maker</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Make a course (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-6 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-5">
          <h2 className="font-serif font-black text-2xl text-[#1E1C1A] dark:text-[#F4F0EA]">
            Make a course
          </h2>

          {/* Goal Input */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92]">
              WHAT DO YOU WANT TO LEARN?
            </span>
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] focus:outline-none"
            />
          </div>

          {/* Sources */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
              SOURCES
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={() => handleAddSource("pdf")}
                className="px-3 py-1.5 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
              >
                + PDF
              </button>
              <button 
                onClick={() => handleAddSource("link")}
                className="px-3 py-1.5 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
              >
                + Link
              </button>
              <button 
                onClick={() => handleAddSource("notebooks")}
                className="px-3 py-1.5 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
              >
                + My notebooks
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {sources.map((s, idx) => (
                <span key={idx} className="inline-block px-2.5 py-1 rounded-lg border border-[#1E1C1A] dark:border-[#3A3A44] bg-[#EBE4DC] dark:bg-[#2C2C34] text-[11px] font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
              YOUR LEVEL
            </span>
            <div className="flex items-center gap-2">
              {[
                { id: "beginner", label: "Beginner" },
                { id: "some", label: "Some background" },
                { id: "advanced", label: "Advanced" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setLevel(lvl.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-all ${
                    level === lvl.id
                      ? "bg-[#C87D55] text-white shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]"
                      : "bg-white dark:bg-[#141416] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pace */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
              PACE
            </span>
            <div className="flex items-center gap-2">
              {[
                { id: "light", label: "Light" },
                { id: "steady", label: "Steady" },
                { id: "intense", label: "Intense" },
              ].map((pc) => (
                <button
                  key={pc.id}
                  onClick={() => setPace(pc.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-all ${
                    pace === pc.id
                      ? "bg-[#C87D55] text-white shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]"
                      : "bg-white dark:bg-[#141416] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
                  }`}
                >
                  {pc.label}
                </button>
              ))}
            </div>
          </div>

          {successBanner && (
            <div className="p-3 bg-[#E8F5E9] dark:bg-[#1C2C22] border border-[#3D7953] dark:border-[#4E9A6F] rounded-xl text-xs font-bold text-[#1E1C1A] dark:text-[#E0F2E9] flex items-center gap-1.5">
              <Check size={14} strokeWidth={3} className="shrink-0 text-[#3D7953] dark:text-[#4E9A6F]" />
              <span>Course structured! Modules generated and linked below.</span>
            </div>
          )}

          <button
            onClick={handleBuildCourse}
            disabled={isBuilding}
            className="w-full py-3 rounded-xl bg-[#C87D55] text-white font-bold text-xs border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45] disabled:opacity-50"
          >
            {isBuilding ? "Synthesizing Modules & Notes..." : "Build my course"}
          </button>
        </div>

        {/* Right Panel: Reorderable Modules Outline (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
              COURSE OUTLINE · DRAG TO REORDER
            </span>
            <button
              onClick={() => alert("Outline regenerated from sources.")}
              className="px-3.5 py-1.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]"
            >
              Regenerate
            </button>
          </div>

          {/* MODULE 1 · FOUNDATIONS */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1E1C1A] dark:text-[#F4F0EA] block">
              MODULE 1 · FOUNDATIONS
            </span>
            <div className="space-y-2">
              {module1.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLocation("/notebook")}
                  className="cursor-pointer bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-3.5 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#FDFBF7] dark:hover:bg-[#222228] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-[#635F5B] dark:text-[#9E9A92]" />
                    <span className="font-bold text-xs text-[#1E1C1A] dark:text-[#F4F0EA]">{item.title}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full border border-[#1E1C1A] dark:border-[#2C2C34] text-[10px] font-black uppercase bg-[#FDFBF7] dark:bg-[#141416] text-[#1E1C1A] dark:text-[#9E9A92]">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* MODULE 2 · BACKPROPAGATION */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1E1C1A] dark:text-[#F4F0EA] block">
              MODULE 2 · BACKPROPAGATION
            </span>
            <div className="space-y-2">
              {module2.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLocation("/notebook")}
                  className="cursor-pointer bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-3.5 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#FDFBF7] dark:hover:bg-[#222228] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-[#635F5B] dark:text-[#9E9A92]" />
                    <span className="font-bold text-xs text-[#1E1C1A] dark:text-[#F4F0EA]">{item.title}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full border border-[#1E1C1A] dark:border-[#2C2C34] text-[10px] font-black uppercase bg-[#FDFBF7] dark:bg-[#141416] text-[#1E1C1A] dark:text-[#9E9A92]">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => alert("New module added")}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-[#1E1C1A] dark:border-[#3A3A44] bg-transparent text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-white/60 dark:hover:bg-[#1A1A1E]/60 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={16} /> Add module
          </button>
        </div>

      </div>

    </div>
  );
};
