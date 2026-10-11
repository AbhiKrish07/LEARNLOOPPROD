import React, { useState } from "react";
import { Bold, Italic, Link2, Sigma, ArrowLeft, CheckSquare, Plus, ChevronDown, Sparkles, Check, Heading, List, PenTool } from "lucide-react";
import { useLocation } from "wouter";

export const TypedDocumentView: React.FC = () => {
  const [, setLocation] = useLocation();
  const queryParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const isNewDoc = queryParams.get("isNew") === "true";

  const [isSampleLoaded, setIsSampleLoaded] = useState<boolean>(!isNewDoc && queryParams.get("sample") === "true");
  const [docTitle, setDocTitle] = useState<string>(isSampleLoaded ? "Chain Rule" : "Untitled Document");
  const [typedContent, setTypedContent] = useState<string>(
    isSampleLoaded
      ? "When one function sits inside another, a small change in x first moves g, then moves f. The slopes multiply along the chain."
      : ""
  );

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [inkConverted, setInkConverted] = useState(false);
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; done: boolean }>>(
    isSampleLoaded ? [{ id: "c1", text: "Re-derive the example without looking", done: false }] : []
  );

  const handleInsertBlock = (type: string) => {
    setShowSlashMenu(false);
    if (type === "Heading") {
      setTypedContent(prev => prev + (prev ? "\n\n" : "") + "### Section Heading\n");
    } else if (type === "Bullet list") {
      setTypedContent(prev => prev + (prev ? "\n\n" : "") + "• First key observation\n• Second key observation\n");
    } else if (type === "Checklist") {
      setChecklist(prev => [...prev, { id: `c-${Date.now()}`, text: "New practice item", done: false }]);
    } else if (type === "Equation") {
      setTypedContent(prev => prev + (prev ? "\n\n" : "") + "dy/dx = (dy/du) · (du/dx)\n");
    } else if (type === "Ink block") {
      setInkConverted(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-8 font-sans space-y-6 select-none">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#1E1C1A]/15 dark:border-[#2C2C34] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/library")}
            className="w-8 h-8 rounded-lg border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] flex items-center justify-center hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] transition-colors"
            title="Back to Library"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-[#635F5B] dark:text-[#9E9A92]">
            <span className="w-5 h-5 rounded-md border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center text-[10px]">LL</span>
            <span>Typed document</span>
          </div>
        </div>

        {/* Blank vs Sample Switcher */}
        <div className="flex items-center border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-xl p-0.5 bg-white dark:bg-[#1A1A1E] text-xs font-bold shadow-[1.5px_1.5px_0px_#1E1C1A]">
          <button
            onClick={() => {
              setIsSampleLoaded(false);
              setDocTitle("Untitled Document");
              setTypedContent("");
              setChecklist([]);
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              !isSampleLoaded ? "bg-[#C87D55] text-white" : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC]"
            }`}
          >
            Blank Document
          </button>
          <button
            onClick={() => {
              setIsSampleLoaded(true);
              setDocTitle("Chain Rule");
              setTypedContent("When one function sits inside another, a small change in x first moves g, then moves f. The slopes multiply along the chain.");
              setChecklist([{ id: "c1", text: "Re-derive the example without looking", done: false }]);
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              isSampleLoaded ? "bg-[#C87D55] text-white" : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC]"
            }`}
          >
            Sample Lesson
          </button>
        </div>
      </div>

      {/* Document Canvas Sheet (Matching Page 13) */}
      <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-10 shadow-[4px_4px_0px_#1E1C1A] dark:shadow-[4px_4px_0px_#000000] space-y-6 relative">
        
        {/* Editable Title */}
        <input
          type="text"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          className="w-full text-4xl font-serif font-black text-[#1E1C1A] dark:text-[#F4F0EA] text-center bg-transparent border-none outline-none focus:ring-1 focus:ring-[#C87D55] rounded py-1"
          placeholder="Untitled Document"
        />

        {/* Floating Formatting Bar (Matching Page 13) */}
        <div className="flex items-center justify-center gap-4 bg-[#1E1C1A] dark:bg-[#141416] border border-transparent dark:border-[#2C2C34] text-white px-5 py-2 rounded-2xl w-fit mx-auto shadow-md text-xs font-bold">
          <button className="hover:text-[#FFE57F]"><Bold size={14} /></button>
          <button className="hover:text-[#FFE57F]"><Italic size={14} /></button>
          <button className="hover:text-[#FFE57F]"><Link2 size={14} /></button>
          <button className="hover:text-[#FFE57F]"><Sigma size={14} /></button>
          <button 
            onClick={() => setShowSlashMenu(prev => !prev)}
            className="hover:text-[#FFE57F] pl-2 border-l border-white/20 flex items-center gap-1 text-[11px]"
          >
            + Block (/)
          </button>
        </div>

        {/* Editable Content Block */}
        <div className="space-y-3">
          <textarea
            value={typedContent}
            onChange={(e) => setTypedContent(e.target.value)}
            placeholder="Type your notes, definitions, or type '/' for slash commands..."
            rows={5}
            className="w-full text-sm font-serif leading-relaxed text-[#1E1C1A] dark:text-[#F4F0EA] bg-transparent border border-[#1E1C1A]/10 dark:border-[#2C2C34] rounded-2xl p-4 outline-none focus:border-[#C87D55] resize-y"
          />
        </div>

        {/* Checklist Block */}
        {checklist.length > 0 && (
          <div className="space-y-2">
            {checklist.map(item => (
              <div key={item.id} className="flex items-center gap-2.5 text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, done: checked } : c));
                  }}
                  className="w-4 h-4 rounded border-2 border-[#1E1C1A] dark:border-[#2C2C34] accent-[#C87D55]"
                />
                <span className={item.done ? "line-through opacity-50" : ""}>{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* INK BLOCK (Matching Page 13) */}
        <div className="p-5 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416] space-y-3 relative shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92]">
              INK BLOCK
            </span>
            <button
              onClick={() => setInkConverted(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#C87D55] text-white text-xs font-bold border border-[#1E1C1A] dark:border-[#2C2C34] shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000] hover:bg-[#B26B45] flex items-center gap-1"
            >
              {inkConverted ? (
                <>
                  <Check size={12} strokeWidth={3} />
                  <span>Converted</span>
                </>
              ) : (
                <span>Convert to text</span>
              )}
            </button>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="font-serif italic text-2xl font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
              dy/dx = dy/du · du/dx
            </div>
            <div className="font-serif italic text-sm text-[#635F5B] dark:text-[#9E9A92]">
              slopes multiply, like gears
            </div>
          </div>
        </div>

        {/* Slash Menu Dropdown (Matching Page 13) */}
        {showSlashMenu && (
          <div className="w-60 bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-2 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-1 animate-in fade-in absolute left-10 top-36 z-30">
            <div className="flex items-center justify-between px-3 py-1 border-b border-[#1E1C1A]/10">
              <span className="text-[10px] font-black text-[#635F5B] dark:text-[#9E9A92]">SLASH COMMANDS</span>
              <button onClick={() => setShowSlashMenu(false)} className="text-xs hover:text-[#C0392B]">×</button>
            </div>
            {[
              { icon: Heading, label: "Heading" },
              { icon: List, label: "Bullet list" },
              { icon: CheckSquare, label: "Checklist" },
              { icon: Sigma, label: "Equation" },
              { icon: PenTool, label: "Ink block" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleInsertBlock(item.label)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] flex items-center gap-3"
              >
                <item.icon size={14} className="text-[#635F5B] dark:text-[#9E9A92]" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
