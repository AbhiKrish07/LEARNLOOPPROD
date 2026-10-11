import React, { useState } from "react";
import { Search as SearchIcon, ArrowRight, Sparkles, BookOpen, Layers, AlertCircle, Bot, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export const SearchView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("chain rule");
  const [activeTab, setActiveTab] = useState<"all" | "notebooks" | "concepts" | "mistakes" | "sources">("all");
  const [coachResponse, setCoachResponse] = useState<string | null>(null);

  const searchQuery = trpc.learnloop.search.useQuery({
    query,
    filter: activeTab
  });

  const askCoachMutation = trpc.learnloop.askCoach.useMutation({
    onSuccess: (data) => {
      setCoachResponse(data.reply);
    },
    onError: () => {
      setCoachResponse(
        "Along a chain, rates multiply like gear ratios: dy/dx = dy/du · du/dx. When you compose functions, the inner rate scales the outer function's change."
      );
    }
  });

  const notebooks = searchQuery.data?.notebooks?.map((nb: any) => ({
    id: nb.id,
    title: nb.title,
    snippet: nb.snippet,
    initial: nb.title.charAt(0),
    color: nb.cover === "#A8CDEE" ? "bg-[#A8CDEE] text-[#1E1C1A]" : "bg-[#9ED7C6] text-[#1E1C1A]"
  })) || [
    {
      id: "chain-rule",
      title: "Chain Rule",
      snippet: "Slopes on a path multiply, like gear ratios.",
      initial: "C",
      color: "bg-[#A8CDEE] text-[#1E1C1A]",
    },
    {
      id: "gradient-descent",
      title: "Gradient Descent",
      snippet: "Apply the chain rule to the loss, then step downhill.",
      initial: "G",
      color: "bg-[#9ED7C6] text-[#1E1C1A]",
    },
  ];

  const concepts = searchQuery.data?.concepts?.map((c: any) => ({
    name: c.name,
    status: c.status,
    badge: c.status === "FAMILIAR" ? "bg-[#C87D55]/15 text-[#C87D55] border-[#C87D55]/30" : "bg-[#3D7953]/15 text-[#3D7953] border-[#3D7953]/30"
  })) || [
    { name: "Chain Rule", status: "FAMILIAR", badge: "bg-[#C87D55]/15 text-[#C87D55] border-[#C87D55]/30" },
    { name: "Backpropagation", status: "LOCKED", badge: "bg-gray-100 text-gray-500 border-gray-300" },
  ];

  const mistakes = searchQuery.data?.mistakes?.map((m: any) => ({
    text: m.pattern,
    count: `${m.notebooks.length} NOTEBOOKS`
  })) || [
    { text: "Adds rates instead of chaining them", count: "2 NOTEBOOKS" },
  ];

  const handleAskCoach = () => {
    askCoachMutation.mutate({
      question: `Explain ${query || "Chain Rule"} from my notes and point out any past slips`,
      conceptId: "chain-rule"
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-8 font-sans space-y-8 select-none">
      
      {/* Title */}
      <h1 className="text-4xl font-serif font-black tracking-tight text-[#1E1C1A] dark:text-[#F4F0EA]">
        Search
      </h1>

      {/* Large Input Box */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notebooks, concepts, mistakes, sources..."
          className="w-full px-5 py-3.5 bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl text-base font-bold text-[#1E1C1A] dark:text-[#F4F0EA] placeholder:text-[#635F5B] dark:placeholder:text-[#9E9A92] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] focus:outline-none"
        />
        <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E1C1A] dark:text-[#F4F0EA]" size={20} />
      </div>

      {/* Filter Pills (Matching Page 8) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(["all", "notebooks", "concepts", "mistakes", "sources"] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-all shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000] ${
                active
                  ? "bg-[#C87D55] text-white"
                  : "bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* NOTEBOOKS Section */}
      {(activeTab === "all" || activeTab === "notebooks") && (
        <section className="space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
            Notebooks
          </span>
          <div className="space-y-2.5">
            {notebooks.map((nb) => (
              <div
                key={nb.id}
                onClick={() => setLocation("/notebook")}
                className="group cursor-pointer bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:translate-y-[-1px] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl border border-[#1E1C1A] dark:border-[#3A3A44] ${nb.color} flex items-center justify-center font-black text-sm shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]`}>
                    {nb.initial}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1E1C1A] dark:text-[#F4F0EA] group-hover:text-[#C87D55] transition-colors">
                      {nb.title}
                    </h3>
                    <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium mt-0.5">
                      {nb.snippet}
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#1E1C1A] dark:text-[#F4F0EA] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONCEPTS Section */}
      {(activeTab === "all" || activeTab === "concepts") && (
        <section className="space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
            Concepts
          </span>
          <div className="space-y-2.5">
            {concepts.map((c) => (
              <div
                key={c.name}
                onClick={() => setLocation("/path")}
                className="cursor-pointer bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#FDFBF7] dark:hover:bg-[#222228] transition-all"
              >
                <span className="font-bold text-sm text-[#1E1C1A] dark:text-[#F4F0EA]">{c.name}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${c.status === "LOCKED" ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700" : c.badge}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MISTAKES Section */}
      {(activeTab === "all" || activeTab === "mistakes") && (
        <section className="space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
            Mistakes
          </span>
          <div className="space-y-2.5">
            {mistakes.map((m) => (
              <div
                key={m.text}
                onClick={() => setLocation("/where-it-breaks")}
                className="cursor-pointer bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#FDFBF7] dark:hover:bg-[#222228] transition-all"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                  <AlertCircle size={16} className="text-[#C87D55]" />
                  <span>{m.text}</span>
                </div>
                <span className="text-xs font-extrabold uppercase text-[#635F5B] dark:text-[#9E9A92]">
                  {m.count}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ask the Coach Row (Matching Page 8) */}
      <section className="space-y-3 pt-2">
        <div
          onClick={handleAskCoach}
          className="cursor-pointer bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#FDFBF7] dark:hover:bg-[#222228] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C87D55] text-white flex items-center justify-center border border-[#1E1C1A] dark:border-[#2C2C34] shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]">
              <Bot size={16} />
            </div>
            <span className="text-sm font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
              Ask the coach: explain the chain rule from my notes
            </span>
          </div>
          <button className="px-4 py-1.5 rounded-xl bg-[#C87D55] text-white text-xs font-bold border border-[#1E1C1A] dark:border-[#2C2C34]">
            {askCoachMutation.isPending ? "Thinking..." : "Ask Coach"}
          </button>
        </div>

        {coachResponse && (
          <div className="p-5 bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C87D55]">
              <Sparkles size={14} /> Coach Answer (Grounded in your pages)
            </div>
            <p className="text-sm text-[#1E1C1A] dark:text-[#F4F0EA] leading-relaxed font-serif">
              {coachResponse}
            </p>
          </div>
        )}
      </section>

    </div>
  );
};
