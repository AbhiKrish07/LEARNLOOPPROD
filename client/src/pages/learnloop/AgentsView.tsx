import React, { useState, useEffect } from "react";
import { Sparkles, Bot, Eye, HelpCircle, BookOpen, Clock, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

export const AgentsView: React.FC = () => {
  const agentsQuery = trpc.learnloop.getAgents.useQuery();
  const saveMutation = trpc.learnloop.saveAgents.useMutation();

  const [agents, setAgents] = useState({
    spotter: true,
    coach: true,
    visualizer: true,
    wonder: true,
    recall: true,
    sources: true,
  });

  const [character, setCharacter] = useState<"face" | "spark" | "owl">("face");
  const [nudges, setNudges] = useState<"quiet" | "normal">("normal");

  useEffect(() => {
    if (agentsQuery.data?.agents) {
      const a = agentsQuery.data.agents;
      setAgents({
        spotter: a.spotter ?? true,
        coach: a.coach ?? true,
        visualizer: a.visualizer ?? true,
        wonder: a.wonder ?? true,
        recall: a.recall ?? true,
        sources: a.sources ?? true,
      });
      if (a.character) setCharacter(a.character);
      if (a.nudges) setNudges(a.nudges);
    }
  }, [agentsQuery.data]);

  const toggleAgent = (key: keyof typeof agents) => {
    const updated = { ...agents, [key]: !agents[key] };
    setAgents(updated);
    saveMutation.mutate({
      [key]: updated[key]
    });
  };

  const handleSelectCharacter = (ch: "face" | "spark" | "owl") => {
    setCharacter(ch);
    saveMutation.mutate({ character: ch });
  };

  const handleSelectNudges = (n: "quiet" | "normal") => {
    setNudges(n);
    saveMutation.mutate({ nudges: n });
  };

  const agentList = [
    {
      id: "spotter" as const,
      initial: "S",
      name: "Spotter",
      description: "Finds the exact step where your reasoning breaks.",
      trigger: "APPEARS WHEN A STEP IN YOUR WRITING BREAKS",
      color: "bg-[#EBD37A] text-[#1E1C1A]",
    },
    {
      id: "coach" as const,
      initial: "C",
      name: "Coach",
      description: "Suggests your next step and the right amount of challenge.",
      trigger: "APPEARS WHEN YOU FINISH A PAGE",
      color: "bg-[#C87D55] text-white",
    },
    {
      id: "visualizer" as const,
      initial: "V",
      name: "Visualizer",
      description: "Runs simulations and draws what you are stuck on.",
      trigger: "APPEARS WHEN YOU ASK TO SIMULATE, OR GET STUCK",
      color: "bg-[#9ED7C6] text-[#1E1C1A]",
    },
    {
      id: "wonder" as const,
      initial: "W",
      name: "Wonder",
      description: "Turns anything you select into open questions.",
      trigger: "APPEARS WHEN YOU SELECT TEXT",
      color: "bg-[#C3B4E8] text-[#1E1C1A]",
    },
    {
      id: "recall" as const,
      initial: "R",
      name: "Recall",
      description: "Quizzes you from your own pages.",
      trigger: "APPEARS WHEN YOU FINISH A SESSION",
      color: "bg-[#A8CDEE] text-[#1E1C1A]",
    },
    {
      id: "sources" as const,
      initial: "S",
      name: "Sources",
      description: "Searches only the sources attached to this concept.",
      trigger: "APPEARS WHEN YOU ASK",
      color: "bg-[#A8D5BA] text-[#1E1C1A]",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-8 font-sans space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-black tracking-tight text-[#1E1C1A] dark:text-[#F4F0EA]">
          Agents
        </h1>
        <p className="text-sm text-[#635F5B] dark:text-[#9E9A92] font-medium mt-1.5">
          They stay out of the way. The character at the corner of your notebook lights up when one has something for you.
        </p>
      </div>

      {/* Agents 2-Column Grid (Matching Page 9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentList.map((agent) => {
          const isEnabled = agents[agent.id];
          return (
            <div
              key={agent.id}
              className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-5 shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl border border-[#1E1C1A] dark:border-[#3A3A44] ${agent.color} flex items-center justify-center font-black text-xs shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]`}>
                    {agent.initial}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#1E1C1A] dark:text-[#F4F0EA]">
                    {agent.name}
                  </h3>
                </div>

                {/* Switch Toggle */}
                <button
                  onClick={() => toggleAgent(agent.id)}
                  className={`w-11 h-6 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-colors p-0.5 relative ${
                    isEnabled ? "bg-[#3D7953] dark:bg-[#4E9A6F]" : "bg-gray-200 dark:bg-[#2C2C34]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white border border-[#1E1C1A] dark:border-[#2C2C34] transition-transform ${
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#1E1C1A] dark:text-[#D5D0C7] leading-relaxed">
                  {agent.description}
                </p>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92] mt-2 block">
                  {agent.trigger}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar: Character & Nudges Configuration (Matching Page 9) */}
      <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] flex flex-wrap items-center justify-between gap-4">
        
        {/* Character Picker */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold text-[#1E1C1A] dark:text-[#F4F0EA]">Character</span>
          <div className="flex items-center gap-1.5 border border-[#1E1C1A]/20 dark:border-[#2C2C34] p-1 rounded-xl">
            {(["face", "spark", "owl"] as const).map((ch) => {
              const active = character === ch;
              return (
                <button
                  key={ch}
                  onClick={() => handleSelectCharacter(ch)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    active
                      ? "bg-[#C87D55] text-white border border-[#1E1C1A] dark:border-[#2C2C34] shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]"
                      : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nudges Picker */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">NUDGES</span>
          <div className="flex items-center gap-1.5 border border-[#1E1C1A]/20 dark:border-[#2C2C34] p-1 rounded-xl">
            {(["quiet", "normal"] as const).map((nd) => {
              const active = nudges === nd;
              return (
                <button
                  key={nd}
                  onClick={() => handleSelectNudges(nd)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    active
                      ? "bg-[#C87D55] text-white border border-[#1E1C1A] dark:border-[#2C2C34] shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]"
                      : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
                  }`}
                >
                  {nd}
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
