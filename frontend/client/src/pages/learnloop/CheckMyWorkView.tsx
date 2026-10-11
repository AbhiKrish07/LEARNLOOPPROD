import React, { useState } from "react";
import { Camera, Upload, ArrowRight, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export const CheckMyWorkView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"photo" | "type">("type");
  const [typedSteps, setTypedSteps] = useState("Let u = 3x + 1, so y = u^2\ndy/du = 2u\ndu/dx = 3\ndy/dx = 2u + 3\n= 6x + 5, built on step 4");
  const [selectedConcept, setSelectedConcept] = useState("Chain Rule");
  const [photoLoaded, setPhotoLoaded] = useState(false);

  const diagnoseMutation = trpc.learnloop.diagnoseSteps.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("learnloop_last_diagnosis", JSON.stringify(data.diagnosis));
      setLocation("/where-it-breaks");
    },
    onError: () => {
      // Fallback
      setLocation("/where-it-breaks");
    }
  });

  const handleFindTheBreak = () => {
    diagnoseMutation.mutate({
      conceptId: selectedConcept.toLowerCase().replace(/\s+/g, "-"),
      stepsText: typedSteps
    });
  };

  const handleChoosePhoto = () => {
    setPhotoLoaded(true);
    setTypedSteps("Let u = 3x + 1, so y = u^2\ndy/du = 2u\ndu/dx = 3\ndy/dx = 2u + 3\n= 6x + 5, built on step 4");
    setMode("type");
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-8 font-sans space-y-7 select-none">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
          <span className="w-5 h-5 rounded-md border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center text-[10px]">LL</span>
          <span>Check my work</span>
        </div>
        <h1 className="text-4xl font-serif font-black tracking-tight text-[#1E1C1A] dark:text-[#F4F0EA]">
          Check your work
        </h1>
        <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium leading-relaxed">
          Upload a photo or type your steps. LearnLoop finds the exact step where your reasoning breaks.
        </p>
      </div>

      {/* Mode Toggle: Photo vs Type (Page 16) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("photo")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-all shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000] ${
            mode === "photo" ? "bg-[#C87D55] text-white" : "bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
          }`}
        >
          Photo
        </button>
        <button
          onClick={() => setMode("type")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-all shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000] ${
            mode === "type" ? "bg-[#C87D55] text-white" : "bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
          }`}
        >
          Type
        </button>
      </div>

      {/* Photo Dropzone Card (Matching Page 16) */}
      {mode === "photo" ? (
        <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-10 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#222228] flex items-center justify-center mx-auto text-[#1E1C1A] dark:text-[#F4F0EA]">
            <Camera size={22} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#1E1C1A] dark:text-[#F4F0EA]">
              Drop a photo of your working
            </h3>
            <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] mt-0.5">
              or take one with your camera
            </p>
          </div>
          <button
            onClick={handleChoosePhoto}
            className="px-6 py-2.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] text-xs font-bold shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] transition-colors"
          >
            {photoLoaded ? "Photo loaded · Click Find the break" : "Choose a photo"}
          </button>
        </div>
      ) : (
        /* Type Steps Area */
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92]">
            OR TYPE YOUR STEPS
          </span>
          <textarea
            rows={5}
            value={typedSteps}
            onChange={(e) => setTypedSteps(e.target.value)}
            placeholder="y = (3x + 1)^2 ..."
            className="w-full p-4 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] font-mono text-xs text-[#1E1C1A] dark:text-[#F4F0EA] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] focus:outline-none"
          />
        </div>
      )}

      {/* Bottom Bar: Concept & Find The Break Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase text-[#635F5B] dark:text-[#9E9A92]">Concept</span>
          <button
            onClick={() => setSelectedConcept("Chain Rule")}
            className="px-3.5 py-1.5 rounded-full bg-[#C87D55] text-white text-xs font-bold border border-[#1E1C1A] dark:border-[#2C2C34] shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]"
          >
            {selectedConcept}
          </button>
          <button
            onClick={() => setSelectedConcept("Product Rule")}
            className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] text-xs font-bold border border-[#1E1C1A] dark:border-[#2C2C34] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
          >
            Auto-detect
          </button>
        </div>

        <button
          onClick={handleFindTheBreak}
          disabled={diagnoseMutation.isPending}
          className="px-6 py-3 rounded-xl bg-[#C87D55] text-white text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {diagnoseMutation.isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Diagnosing...
            </>
          ) : (
            <>
              Find the break <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
