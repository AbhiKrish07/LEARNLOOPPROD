import React, { useState } from "react";
import { X, BookOpen, Check } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface NewNotebookModalProps {
  onClose: () => void;
  onCreated?: (notebook: any) => void;
}

export const NewNotebookModal: React.FC<NewNotebookModalProps> = ({ onClose, onCreated }) => {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("Untitled Notebook");
  const [subject, setSubject] = useState("Calculus");
  const [coverColor, setCoverColor] = useState("#A8CDEE");
  const [paperTemplate, setPaperTemplate] = useState<"blank" | "grid" | "ruled" | "dot" | "cornell">("grid");

  const utils = trpc.useUtils();
  const createNotebookMutation = trpc.learnloop.createNotebook.useMutation({
    onSuccess: (data) => {
      utils.learnloop.getNotebooks.invalidate();
      onClose();
      if (onCreated) onCreated(data.notebook);
      setLocation(`/notebook?id=${data.notebook.id}&template=${paperTemplate}&isNew=true`);
    }
  });

  const colorSwatches = [
    { label: "Sky Blue", value: "#A8CDEE" },
    { label: "Soft Mint", value: "#A8D5BA" },
    { label: "Sage Green", value: "#9ED7C6" },
    { label: "Lavender", value: "#C3B4E8" },
    { label: "Warm Amber", value: "#EBD37A" },
    { label: "Rose Quartz", value: "#E4B4D5" },
    { label: "Deep Slate", value: "#2D4059", isDark: true },
  ];

  const subjects = ["Calculus", "Computer Science", "Deep Learning", "Mathematics", "Physics", "General"];

  const paperStyles = [
    { id: "grid", name: "Grid", desc: "Graph paper" },
    { id: "ruled", name: "Ruled", desc: "Lined paper" },
    { id: "blank", name: "Blank", desc: "Clean white paper" },
    { id: "dot", name: "Dot", desc: "Dot matrix" },
    { id: "cornell", name: "Cornell", desc: "Cue margin" },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createNotebookMutation.mutate({
      title: title.trim(),
      subject,
      coverColor,
      paperTemplate
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E0E10]/70 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-7 shadow-[5px_5px_0px_#1E1C1A] dark:shadow-[5px_5px_0px_#000000] space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E1C1A]/10 dark:border-[#2C2C34] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center shadow-[1.5px_1.5px_0px_#1E1C1A]">
              <BookOpen size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1E1C1A] dark:text-[#F4F0EA]">Create New Notebook</h2>
              <p className="text-xs text-[#635F5B] dark:text-[#9E9A92]">Set up a new book for your notes, derivations, and practice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          {/* Notebook Preview & Title Row */}
          <div className="flex gap-5 items-center">
            
            {/* Live Cover Preview */}
            <div
              style={{ backgroundColor: coverColor }}
              className="w-28 h-36 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] p-3 flex flex-col justify-between shrink-0 transition-colors"
            >
              <div className="space-y-1 opacity-40">
                <div className="h-0.5 w-8 bg-[#1E1C1A]" />
                <div className="h-0.5 w-5 bg-[#1E1C1A]" />
              </div>
              <div>
                <p className={`font-serif font-black text-xs leading-tight line-clamp-2 ${coverColor === "#2D4059" ? "text-white" : "text-[#1E1C1A]"}`}>
                  {title || "Untitled"}
                </p>
                <p className={`text-[9px] font-bold mt-1 opacity-75 ${coverColor === "#2D4059" ? "text-white" : "text-[#1E1C1A]"}`}>
                  {subject}
                </p>
              </div>
              <div className="h-1 border-t border-[#1E1C1A]/20" />
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-[#635F5B] dark:text-[#9E9A92] block mb-1">
                  Notebook Title
                </label>
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Calculus II, Quantum Physics"
                  className="w-full text-base font-bold text-[#1E1C1A] dark:text-[#F4F0EA] bg-[#FDFBF7] dark:bg-[#141416] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-xl px-3.5 py-2 outline-none focus:ring-2 focus:ring-[#C87D55]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#635F5B] dark:text-[#9E9A92] block mb-1">
                  Subject / Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {subjects.map((sub) => (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => setSubject(sub)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        subject === sub
                          ? "bg-[#1E1C1A] text-white dark:bg-[#F4F0EA] dark:text-[#1E1C1A]"
                          : "bg-[#EBE4DC] dark:bg-[#222228] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#DED7CE]"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cover Color Selector */}
          <div>
            <label className="text-xs font-bold uppercase text-[#635F5B] dark:text-[#9E9A92] block mb-2">
              Cover Color
            </label>
            <div className="flex items-center gap-2.5">
              {colorSwatches.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setCoverColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-8 h-8 rounded-full border-2 border-[#1E1C1A] dark:border-[#444] transition-transform hover:scale-110 flex items-center justify-center ${
                    coverColor === c.value ? "ring-2 ring-[#C87D55] ring-offset-2 scale-110" : ""
                  }`}
                  title={c.label}
                >
                  {coverColor === c.value && (
                    <Check size={14} className={c.isDark ? "text-white" : "text-[#1E1C1A]"} strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Default Paper Style */}
          <div>
            <label className="text-xs font-bold uppercase text-[#635F5B] dark:text-[#9E9A92] block mb-2">
              Default Paper Style
            </label>
            <div className="grid grid-cols-5 gap-2">
              {paperStyles.map((ps) => (
                <button
                  type="button"
                  key={ps.id}
                  onClick={() => setPaperTemplate(ps.id as any)}
                  className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                    paperTemplate === ps.id
                      ? "border-[#1E1C1A] dark:border-[#C87D55] bg-[#C87D55]/10 dark:bg-[#C87D55]/20 shadow-[1.5px_1.5px_0px_#1E1C1A]"
                      : "border-[#1E1C1A]/20 dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416]"
                  }`}
                >
                  <p className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">{ps.name}</p>
                  <p className="text-[10px] text-[#635F5B] dark:text-[#9E9A92]">{ps.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E1C1A]/10 dark:border-[#2C2C34]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-bold hover:bg-[#EBE4DC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createNotebookMutation.isPending}
              className="px-6 py-2 rounded-xl bg-[#C87D55] text-white text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45] transition-all disabled:opacity-50"
            >
              {createNotebookMutation.isPending ? "Creating..." : "Create Notebook"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
