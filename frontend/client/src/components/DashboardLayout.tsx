import { useAuth } from "@/_core/hooks/useAuth";
import { 
  BookOpen, 
  Search, 
  Bot, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Plus, 
  Star,
  Layers,
  Sparkles,
  Brain,
  Timer,
  CheckCircle2,
  Share2,
  Sun,
  Moon
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { NewPagePickerModal } from "./learnloop/NewPagePickerModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const [showNewPageModal, setShowNewPageModal] = useState(false);

  const navItems = [
    { label: "Notebooks", path: "/library", icon: BookOpen },
    { label: "Favorites", path: "/favorites", icon: Star },
    { label: "Search", path: "/search", icon: Search },
    { label: "Agents", path: "/agents", icon: Bot },
    { label: "Growth", path: "/growth", icon: TrendingUp },
  ];

  const secondaryTools = [
    { label: "Canvas", path: "/canvas", icon: Layers },
    { label: "Check my work", path: "/check", icon: CheckCircle2 },
    { label: "Course maker", path: "/course-maker", icon: Sparkles },
    { label: "Simulation lab", path: "/simulation-lab", icon: Sparkles },
    { label: "Your brain", path: "/brain", icon: Brain },
    { label: "Study session", path: "/session", icon: Timer },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const isCurrent = (p: string) => {
    if (p === "/library" && (location === "/library" || location === "/notebooks" || location === "/dashboard" || location === "/")) return true;
    return location === p;
  };

  return (
    <div className="flex min-h-screen bg-[#F5EFEB] dark:bg-[#0E0E10] text-[#1E1C1A] dark:text-[#F4F0EA] font-sans antialiased select-none transition-colors duration-200">
      
      {/* ---------- Left Sidebar (Matching Pages 7-10 in Light & Dark) ---------- */}
      <aside className="w-56 border-r-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#F5EFEB] dark:bg-[#121214] flex flex-col justify-between p-5 shrink-0 z-30 transition-colors duration-200">
        <div className="space-y-6">
          
          {/* Logo / Title */}
          <div 
            onClick={() => setLocation("/library")}
            className="cursor-pointer group flex items-center justify-between"
          >
            <span className="font-serif font-black text-2xl tracking-tight text-[#1E1C1A] dark:text-[#F4F0EA] group-hover:opacity-80 transition-opacity">
              LearnLoop
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNewPageModal(true);
              }}
              className="w-7 h-7 rounded-lg border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#C87D55] hover:text-white transition-colors shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]"
              title="New page"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Primary Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = isCurrent(item.path);
              return (
                <button
                  key={item.label}
                  onClick={() => setLocation(item.path)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 ${
                    active
                      ? "bg-[#C87D55] text-white border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]"
                      : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#1E1E24] border-2 border-transparent"
                  }`}
                >
                  <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Secondary Learning Tools */}
          <div className="pt-2 border-t border-[#1E1C1A]/15 dark:border-[#2C2C34] space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] px-3.5 block mb-1">
              Tools
            </span>
            {secondaryTools.map((tool) => {
              const active = location === tool.path;
              return (
                <button
                  key={tool.label}
                  onClick={() => setLocation(tool.path)}
                  className={`w-full text-left px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    active
                      ? "bg-[#1E1C1A] text-white dark:bg-white dark:text-[#121214]"
                      : "text-[#635F5B] dark:text-[#9E9A92] hover:text-[#1E1C1A] dark:hover:text-white hover:bg-[#EBE4DC] dark:hover:bg-[#1E1E24]"
                  }`}
                >
                  <tool.icon size={13} />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Profile, Theme Toggle & Quick Launch */}
        <div className="pt-4 border-t-2 border-[#1E1C1A] dark:border-[#2C2C34] space-y-2">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation("/notebook")}
              className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBD37A] dark:hover:bg-[#2A2A32] transition-colors flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]"
            >
              <BookOpen size={13} /> Open Page
            </button>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#222228] transition-colors shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={14} className="text-[#E0C068]" /> : <Moon size={14} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#635F5B] dark:text-[#9E9A92] px-1 pt-1">
            <span className="font-serif italic">abhinav@learnloop</span>
            <button
              onClick={logout}
              className="hover:text-red-500 font-bold"
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>

        </div>
      </aside>

      {/* ---------- Main Content Canvas Area ---------- */}
      <main className="flex-1 min-w-0 bg-[#F5EFEB] dark:bg-[#0E0E10] overflow-y-auto transition-colors duration-200">
        {children}
      </main>

      {/* New Page Picker Modal */}
      {showNewPageModal && (
        <NewPagePickerModal onClose={() => setShowNewPageModal(false)} />
      )}

    </div>
  );
}
