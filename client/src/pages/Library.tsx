import React, { useState } from "react";
import { Plus, Lock, ArrowRight, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { NewNotebookModal } from "@/components/learnloop/NewNotebookModal";

export default function Library() {
  const [, setLocation] = useLocation();
  const [sortFilter, setSortFilter] = useState<"date" | "name" | "subject">("date");
  const [showNewNotebookModal, setShowNewNotebookModal] = useState(false);

  const modelQuery = trpc.learnloop.getModel.useQuery();
  const concepts = modelQuery.data?.model?.conceptRecords || {};
  const isBackpropagationUnlocked = concepts["chain-rule"]?.state === "Understood";

  const notebooksQuery = trpc.learnloop.getNotebooks.useQuery();
  const rawNotebooks = notebooksQuery.data?.notebooks || [];

  const defaultNotebooks = [
    {
      id: "calculus",
      title: "Calculus",
      subtitle: "4 notebooks",
      subject: "Calculus",
      coverColor: "#A8D5BA",
      isLocked: false,
    },
    {
      id: "chain-rule",
      title: "Chain Rule",
      subtitle: concepts["chain-rule"]?.state === "Understood" ? "Mastered · Understood" : "Sample Demo · Tap to explore",
      subject: "Calculus",
      coverColor: "#A8CDEE",
      isLocked: false,
    },
    {
      id: "gradient-descent",
      title: "Gradient Descent",
      subtitle: "Edited today",
      subject: "Machine Learning",
      coverColor: "#9ED7C6",
      isLocked: false,
    },
    {
      id: "computational-graphs",
      title: "Computational Graphs",
      subtitle: isBackpropagationUnlocked ? "In progress" : "Not started",
      subject: "Computer Science",
      coverColor: "#C3B4E8",
      isLocked: false,
    },
    {
      id: "linear-algebra",
      title: "Linear Algebra",
      subtitle: "Oct 9",
      subject: "Mathematics",
      coverColor: "#EBD37A",
      isLocked: false,
    },
    {
      id: "quantum-gates",
      title: "Quantum Gates",
      subtitle: "Oct 4",
      subject: "Physics",
      coverColor: "#E4B4D5",
      isLocked: false,
    },
    {
      id: "backpropagation",
      title: "Backpropagation",
      subtitle: isBackpropagationUnlocked ? "Unlocked · Ready to learn" : "Locked until Chain Rule",
      subject: "Deep Learning",
      coverColor: isBackpropagationUnlocked ? "#2D4059" : "#1E1E22",
      isLocked: !isBackpropagationUnlocked,
    },
  ];

  // Merge server notebooks with defaults without duplicate IDs
  const serverIds = new Set(rawNotebooks.map((n: any) => n.id));
  const combinedNotebooks = [
    ...rawNotebooks,
    ...defaultNotebooks.filter(n => !serverIds.has(n.id))
  ];

  // Apply sorting
  const sortedNotebooks = [...combinedNotebooks].sort((a: any, b: any) => {
    if (sortFilter === "name") return (a.title || "").localeCompare(b.title || "");
    if (sortFilter === "subject") return (a.subject || "").localeCompare(b.subject || "");
    return 0; // default order (recently created first)
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-8 font-sans space-y-8 select-none">
      
      {/* ---------- Header & Sort Filters (Matching Page 7) ---------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-serif font-black tracking-tight text-[#1E1C1A] dark:text-[#F4F0EA]">
          Notebooks
        </h1>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 border-2 border-[#1E1C1A] dark:border-[#2C2C34] p-1 rounded-2xl bg-white dark:bg-[#1A1A1E] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
          {(["date", "name", "subject"] as const).map((filter) => {
            const active = sortFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSortFilter(filter)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  active
                    ? "bg-[#C87D55] text-white"
                    : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Notebooks Cards Grid (Matching Page 7) ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* + New Book Card */}
        <div
          onClick={() => setShowNewNotebookModal(true)}
          className="group cursor-pointer border-2 border-dashed border-[#1E1C1A] dark:border-[#3A3A44] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-64 bg-transparent hover:bg-white/60 dark:hover:bg-[#1A1A1E]/60 transition-all shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]"
        >
          <div className="w-10 h-10 rounded-full border-2 border-[#1E1C1A] dark:border-[#4A4A56] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA] group-hover:scale-110 transition-transform bg-white dark:bg-[#1A1A1E]">
            <Plus size={22} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">New Book</span>
        </div>

        {/* Colored Notebook Cards */}
        {sortedNotebooks.map((nb: any) => {
          const isDarkCover = nb.coverColor === "#2D4059" || nb.coverColor === "#1E1E22";
          return (
            <div
              key={nb.id}
              onClick={() => {
                if (nb.isLocked) {
                  alert("This notebook unlocks once you complete and pass the Chain Rule retest!");
                } else if (nb.id === "chain-rule") {
                  setLocation(`/notebook?id=chain-rule&sample=true`);
                } else {
                  setLocation(`/notebook?id=${nb.id}&template=${nb.paperTemplate || "grid"}&isNew=true`);
                }
              }}
              style={{ backgroundColor: nb.coverColor?.startsWith("#") ? nb.coverColor : undefined }}
              className={`group cursor-pointer border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl overflow-hidden flex flex-col justify-between p-5 h-64 transition-all shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] hover:translate-y-[-2px] hover:shadow-[4px_5px_0px_#1E1C1A] dark:hover:shadow-[4px_5px_0px_#000000] ${
                !nb.coverColor?.startsWith("#") ? (nb.coverColor || "bg-[#A8CDEE]") : ""
              } relative`}
            >
              {/* Cover lines styling (like physical notebook spine/ruled lines) */}
              <div className="space-y-1.5 opacity-40">
                <div className={`h-0.5 w-12 ${isDarkCover ? "bg-white" : "bg-[#1E1C1A]"}`} />
                <div className={`h-0.5 w-8 ${isDarkCover ? "bg-white" : "bg-[#1E1C1A]"}`} />
              </div>

              {/* Title & Status */}
              <div>
                <div className="flex items-center gap-1.5">
                  {nb.isLocked && <Lock size={14} className="text-white shrink-0" />}
                  <h3 className={`font-serif font-black text-xl leading-tight ${isDarkCover ? "text-white" : "text-[#1E1C1A]"}`}>
                    {nb.title}
                  </h3>
                </div>
                <p className={`text-xs font-semibold mt-1.5 opacity-80 ${isDarkCover ? "text-white" : "text-[#1E1C1A]"}`}>
                  {nb.subtitle || nb.subject || "Edited today"}
                </p>
              </div>

              {/* Subtle notebook page lines at bottom */}
              <div className="pt-4 border-t border-[#1E1C1A]/20 flex items-center justify-between text-[11px] font-bold">
                <span className={isDarkCover ? "text-white" : "text-[#1E1C1A]"}>
                  {nb.isLocked ? "Prerequisite: Chain Rule" : "Tap to open"}
                </span>
                {!nb.isLocked && (
                  <ArrowRight size={14} className={`${isDarkCover ? "text-white" : "text-[#1E1C1A]"} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                )}
              </div>
            </div>
          );
        })}

      </div>

      {/* New Notebook / New Book Modal */}
      {showNewNotebookModal && (
        <NewNotebookModal onClose={() => setShowNewNotebookModal(false)} />
      )}

    </div>
  );
}
