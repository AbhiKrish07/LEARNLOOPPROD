import React, { useState } from "react";
import { Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"account" | "appearance" | "writing" | "agents" | "notifications" | "data">("appearance");
  const [palmRejection, setPalmRejection] = useState(true);
  const [language, setLanguage] = useState("English");
  const [nudges, setNudges] = useState("Normal");
  const [reduceMotion, setReduceMotion] = useState(false);

  const tabs = [
    { id: "account", label: "Account" },
    { id: "appearance", label: "Appearance" },
    { id: "writing", label: "Writing" },
    { id: "agents", label: "Agents" },
    { id: "notifications", label: "Notifications" },
    { id: "data", label: "Data" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 font-sans select-none text-[#1E1C1A] dark:text-[#F4F0EA]">
      
      {/* 2-Column Settings Layout (Matching Page 25) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        
        {/* Left Tabs (3 cols) */}
        <div className="md:col-span-3 space-y-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? "bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]"
                    : "text-[#635F5B] dark:text-[#9E9A92] hover:text-[#1E1C1A] dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Settings Content (9 cols) */}
        <div className="md:col-span-9 space-y-6">
          <h2 className="text-3xl font-serif font-black text-[#1E1C1A] dark:text-[#F4F0EA]">
            Appearance
          </h2>

          {/* 3 Theme Cards: Light, Dark, Auto (Matching Page 25) */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Light Theme Card */}
            <div
              onClick={() => setTheme("light")}
              className={`cursor-pointer rounded-2xl border-2 p-4 h-28 flex flex-col justify-between transition-all shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] ${
                theme === "light"
                  ? "border-[#1E1C1A] dark:border-[#C87D55] bg-white dark:bg-[#1A1A1E] ring-2 ring-[#C87D55]"
                  : "border-[#1E1C1A]/30 dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E]"
              }`}
            >
              <div className="space-y-1.5">
                <div className="h-1.5 w-12 bg-[#1E1C1A] rounded" />
                <div className="h-1.5 w-8 bg-[#635F5B] rounded" />
              </div>
              <span className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] text-center block">
                Light
              </span>
            </div>

            {/* Dark Theme Card (Page 25 shows active with terracotta ring!) */}
            <div
              onClick={() => setTheme("dark")}
              className={`cursor-pointer rounded-2xl border-2 p-4 h-28 flex flex-col justify-between transition-all shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] ${
                theme === "dark"
                  ? "border-[#C87D55] bg-[#161619] ring-2 ring-[#C87D55]"
                  : "border-[#1E1C1A]/30 dark:border-[#2C2C34] bg-[#222228]"
              }`}
            >
              <div className="space-y-1.5">
                <div className="h-1.5 w-12 bg-white rounded" />
                <div className="h-1.5 w-8 bg-[#3D7953] rounded" />
              </div>
              <span className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] text-center block">
                Dark
              </span>
            </div>

            {/* Auto Theme Card */}
            <div
              onClick={() => setTheme("light")}
              className="cursor-pointer rounded-2xl border-2 border-[#1E1C1A]/30 dark:border-[#2C2C34] overflow-hidden h-28 flex flex-col justify-between transition-all shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]"
            >
              <div className="flex h-20">
                <div className="w-1/2 bg-white p-3 space-y-1.5">
                  <div className="h-1.5 w-8 bg-[#1E1C1A] rounded" />
                  <div className="h-1.5 w-5 bg-gray-400 rounded" />
                </div>
                <div className="w-1/2 bg-[#1E1E22] p-3 space-y-1.5">
                  <div className="h-1.5 w-8 bg-white rounded" />
                  <div className="h-1.5 w-5 bg-gray-600 rounded" />
                </div>
              </div>
              <span className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] text-center pb-2 bg-white dark:bg-[#1A1A1E] block">
                Auto
              </span>
            </div>

          </div>

          {/* Toggle 1: Palm Rejection */}
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
            <span className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">Palm rejection</span>
            <button
              onClick={() => setPalmRejection(!palmRejection)}
              className={`w-11 h-6 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-colors p-0.5 relative ${
                palmRejection ? "bg-[#3D7953]" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white border border-[#1E1C1A] transition-transform ${
                  palmRejection ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Selector 2: Convert ink to text in */}
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
            <span className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">Convert ink to text in</span>
            <span className="text-xs font-extrabold text-[#1E1C1A] dark:text-[#F4F0EA]">{language}</span>
          </div>

          {/* Selector 3: Agent nudges */}
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
            <span className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">Agent nudges</span>
            <span className="text-xs font-extrabold text-[#1E1C1A] dark:text-[#F4F0EA]">{nudges}</span>
          </div>

          {/* Toggle 4: Reduce motion */}
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-4 flex items-center justify-between shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
            <span className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">Reduce motion</span>
            <button
              onClick={() => setReduceMotion(!reduceMotion)}
              className={`w-11 h-6 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-colors p-0.5 relative ${
                reduceMotion ? "bg-[#3D7953]" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white border border-[#1E1C1A] transition-transform ${
                  reduceMotion ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
