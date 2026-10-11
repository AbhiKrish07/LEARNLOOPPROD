import React, { useState } from "react";
import { X, FileText, Grid, File, Edit3, CheckSquare, Layers } from "lucide-react";
import { useLocation } from "wouter";

interface NewPagePickerModalProps {
  onClose: () => void;
}

export const NewPagePickerModal: React.FC<NewPagePickerModalProps> = ({ onClose }) => {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string>("typed");

  const pageTypes = [
    { id: "blank", name: "Blank", desc: "Clean white page for open-ended writing" },
    { id: "grid", name: "Grid", desc: "Classic graph paper for math & diagrams" },
    { id: "ruled", name: "Ruled", desc: "Lined paper for lecture notes" },
    { id: "dot", name: "Dot", desc: "Subtle dot grid for bullet sketching" },
    { id: "cornell", name: "Cornell", desc: "Cue column, note area, and summary" },
    { id: "typed", name: "Typed document", desc: "Block editor with slash commands" },
    { id: "problem-set", name: "Problem set", desc: "Step-by-step problem template" },
    { id: "canvas", name: "Canvas", desc: "Infinite canvas for cards & diagrams" },
  ];

  const handleCreate = () => {
    onClose();
    if (selectedType === "typed") {
      setLocation("/typed?isNew=true");
    } else if (selectedType === "canvas") {
      setLocation("/canvas?isNew=true");
    } else {
      setLocation(`/notebook?template=${selectedType}&isNew=true`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E0E10]/70 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-7 shadow-[4px_4px_0px_#1E1C1A] dark:shadow-[4px_4px_0px_#000000] space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-2xl font-bold font-serif text-[#1E1C1A] dark:text-[#F4F0EA]">New page</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* 8 Page Types Grid (Matching Page 14) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {pageTypes.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <div
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`cursor-pointer rounded-2xl border-2 p-3.5 flex flex-col items-center justify-center text-center h-28 transition-all ${
                  isSelected
                    ? "border-[#1E1C1A] dark:border-[#C87D55] bg-[#C87D55]/10 dark:bg-[#C87D55]/20 shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] ring-2 ring-[#C87D55]"
                    : "border-[#1E1C1A]/30 dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416] hover:border-[#1E1C1A] dark:hover:border-[#4A4A56]"
                }`}
              >
                {/* Visual miniature preview box */}
                <div className={`w-14 h-10 rounded border border-[#1E1C1A]/40 dark:border-[#2C2C34] mb-2 flex items-center justify-center ${
                  type.id === "grid" ? "bg-[radial-gradient(#1E1C1A_1px,transparent_1px)] dark:bg-[radial-gradient(#4A4A56_1px,transparent_1px)] [background-size:6px_6px]" :
                  type.id === "ruled" ? "bg-[linear-gradient(transparent_5px,#1E1C1A20_5px)] dark:bg-[linear-gradient(transparent_5px,#4A4A5640_5px)] [background-size:100%_6px]" :
                  type.id === "dot" ? "bg-[radial-gradient(#1E1C1A_0.75px,transparent_0.75px)] dark:bg-[radial-gradient(#4A4A56_0.75px,transparent_0.75px)] [background-size:5px_5px]" :
                  type.id === "cornell" ? "bg-white dark:bg-[#18181C] relative border-l-4 border-l-[#C87D55]/50" :
                  type.id === "canvas" ? "bg-[radial-gradient(#1E1C1A_0.5px,transparent_0.5px)] dark:bg-[radial-gradient(#4A4A56_0.5px,transparent_0.5px)] [background-size:8px_8px]" :
                  "bg-white dark:bg-[#18181C]"
                }`} />

                <span className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] leading-tight">
                  {type.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Description & Create Action */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1E1C1A]/15 dark:border-[#2C2C34]">
          <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium">
            {selectedType === "typed"
              ? "Typed document opens the block editor."
              : selectedType === "canvas"
              ? "Canvas opens the infinite concept map."
              : `Creates a new ${selectedType} page in your notebook.`}
          </p>

          <button
            onClick={handleCreate}
            className="px-6 py-2.5 rounded-xl bg-[#C87D55] text-white font-bold text-xs border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45] transition-colors"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
};
