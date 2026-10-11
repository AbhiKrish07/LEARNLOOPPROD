import { useState } from "react";
import { 
  BookOpen, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Brain, 
  Plus, 
  FileText, 
  Layers, 
  CheckCircle2
} from "lucide-react";
import { useLocation } from "wouter";
import { getStoredNotebooks, Notebook } from "@/lib/notebookStore";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [notebooks] = useState<Notebook[]>(getStoredNotebooks());

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 font-sans space-y-8 select-none">
      
      {/* ---------- Hero Greeting (Screen 1 Wireframe) ---------- */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Good evening, Abhinav
          </h1>
        </div>
        <p className="text-sm text-gray-400 font-medium pl-11">
          "Small steps, big understanding."
        </p>
      </div>

      {/* ---------- Continue Learning Section (Screen 1 Wireframe) ---------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-400">
          <span>Continue Learning</span>
          <button onClick={() => setLocation("/path")} className="text-[#5B5CE2] hover:underline font-bold">
            View all →
          </button>
        </div>

        <div 
          onClick={() => setLocation("/notebook")}
          className="group cursor-pointer bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs hover:shadow-md hover:border-[#5B5CE2] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5B5CE2] flex items-center justify-center font-bold text-lg border border-indigo-100">
              📐
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B5CE2]">Calculus</span>
              <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-[#5B5CE2] transition-colors">
                Chain Rule
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">3 / 6 lessons completed · Rate compounding</p>
            </div>
          </div>

          <button className="px-5 py-2.5 rounded-xl bg-[#5B5CE2] text-white text-xs font-bold shadow-2xs hover:bg-[#4b4cd1] transition-colors flex items-center gap-2">
            Continue <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ---------- Notebooks Folders Row (Screen 1 Wireframe) ---------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-400">
          <span>Notebooks</span>
          <button onClick={() => setLocation("/library")} className="text-[#5B5CE2] hover:underline font-bold">
            View all →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: "math", name: "Math", notes: "12 notes", color: "bg-blue-50 border-blue-200 text-blue-800", icon: "📁" },
            { id: "physics", name: "Physics", count: "8 notes", color: "bg-amber-50 border-amber-200 text-amber-800", icon: "📁" },
            { id: "cs", name: "CS", count: "5 notes", color: "bg-emerald-50 border-emerald-200 text-emerald-800", icon: "📁" },
            { id: "ideas", name: "Ideas", count: "3 notes", color: "bg-purple-50 border-purple-200 text-purple-800", icon: "📁" },
          ].map((folder) => (
            <div
              key={folder.id}
              onClick={() => setLocation("/library")}
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all cursor-pointer flex flex-col justify-between h-28"
            >
              <div className={`w-8 h-8 rounded-xl ${folder.color} border flex items-center justify-center text-sm shadow-2xs`}>
                {folder.icon}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900">{folder.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium">{folder.count || "12 notes"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Recent Notes Section (Screen 1 Wireframe) ---------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-400">
          <span>Recent Notes</span>
          <button onClick={() => setLocation("/library")} className="text-[#5B5CE2] hover:underline font-bold">
            View all →
          </button>
        </div>

        <div className="space-y-2">
          {[
            { id: "note-1", title: "Chain rule derivation", edited: "Edited 2h ago", tag: "Calculus", icon: "📝", iconBg: "bg-amber-50 text-amber-700" },
            { id: "note-2", title: "Neural Networks notes", edited: "Edited 5h ago", tag: "CS", icon: "🧠", iconBg: "bg-purple-50 text-purple-700" },
            { id: "note-3", title: "Random ideas", edited: "Edited 1d ago", tag: "CS", icon: "💡", iconBg: "bg-emerald-50 text-emerald-700" },
          ].map((note) => (
            <div
              key={note.id}
              onClick={() => setLocation("/notebook")}
              className="group bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-[#5B5CE2] transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${note.iconBg} flex items-center justify-center font-bold text-base`}>
                  {note.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#5B5CE2] transition-colors">
                    {note.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium">{note.edited}</p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {note.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
