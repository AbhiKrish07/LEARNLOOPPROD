import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  Pen, 
  Highlighter, 
  Eraser, 
  Undo2, 
  Redo2, 
  Share2, 
  Grid, 
  Plus, 
  X, 
  Minus,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Type,
  Maximize2,
  FileText,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Loader2,
  Sprout,
  Lightbulb
} from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { ShareModal } from "./ShareModal";
import { RetestModal } from "./RetestModal";

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  id: string;
  tool: "pen" | "highlighter";
  color: string;
  width: number;
  points: StrokePoint[];
}

export function GoodNotesApp() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();

  // URL query params & Notebook state
  const queryParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const notebookId = queryParams.get("id");
  const templateParam = (queryParams.get("template") as "blank" | "grid" | "ruled" | "dot" | "cornell") || "grid";
  const isNewNotebook = queryParams.get("isNew") === "true";
  const isSampleRequested = queryParams.get("sample") === "true";

  // When a user makes an account or opens a notebook, it starts BLANK by default!
  // Sample lesson is only shown when explicitly requested or toggled
  const [isSampleLoaded, setIsSampleLoaded] = useState<boolean>(
    Boolean(notebookId === "chain-rule" && isSampleRequested && !isNewNotebook)
  );

  const [notebookTitle, setNotebookTitle] = useState(
    notebookId === "chain-rule" && isSampleLoaded
      ? "Chain Rule"
      : notebookId === "calculus"
      ? "Calculus"
      : notebookId === "gradient-descent"
      ? "Gradient Descent"
      : isNewNotebook
      ? "Untitled Notebook"
      : notebookId ? notebookId.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Untitled Notebook"
  );

  const [paperTemplate, setPaperTemplate] = useState<"blank" | "grid" | "ruled" | "dot" | "cornell">(templateParam);
  const [isSimInsertedOnBlank, setIsSimInsertedOnBlank] = useState(false);

  // Page management
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Boolean(notebookId === "chain-rule" && isSampleRequested && !isNewNotebook) ? 2 : 1);

  // Active Tool & Style
  const [tool, setTool] = useState<"pen" | "highlighter" | "eraser" | "text">("pen");
  const [selectedColor, setSelectedColor] = useState(theme === "dark" ? "#F4F0EA" : "#1E1C1A");

  // Freehand Canvas State
  const [strokesByPage, setStrokesByPage] = useState<Record<number, Stroke[]>>({ 1: [], 2: [] });
  const [redoByPage, setRedoByPage] = useState<Record<number, Stroke[]>>({ 1: [], 2: [] });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

  // Text annotations placed by user (starts empty when blank!)
  const [textNotes, setTextNotes] = useState<Array<{ id: string; page: number; x: number; y: number; text: string }>>(
    Boolean(notebookId === "chain-rule" && isSampleRequested && !isNewNotebook)
      ? [{ id: "tn-1", page: 1, x: 50, y: 380, text: "Note: dy/dx = (dy/du) · (du/dx)" }]
      : []
  );
  const [activeTextId, setActiveTextId] = useState<string | null>(null);

  // Interactive Simulation Controls
  const [innerSlope, setInnerSlope] = useState(3);
  const [outerSlope, setOuterSlope] = useState(2);
  const totalSlope = (innerSlope * outerSlope).toFixed(1);

  // Coach Mascot & Floating Card State
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachTab, setCoachTab] = useState<"spotter" | "wonder" | "visualize" | "recall">("spotter");
  const [coachInput, setCoachInput] = useState("");
  const [coachMessages, setCoachMessages] = useState<Array<{ sender: "user" | "coach"; text: string }>>([
    { sender: "coach", text: "Welcome to your notebook! Write or draw notes, and I will spot any slips live." }
  ]);

  const [recallAnswer, setRecallAnswer] = useState("");
  const [recallFeedback, setRecallFeedback] = useState<string | null>(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showRetestModal, setShowRetestModal] = useState(false);

  // Refs
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const askCoachMutation = trpc.learnloop.askCoach.useMutation({
    onSuccess: (data) => {
      setCoachMessages(prev => [...prev, { sender: "coach", text: data.reply }]);
    },
    onError: () => {
      setCoachMessages(prev => [...prev, { 
        sender: "coach", 
        text: `Along a chain, rates multiply like gear ratios: dy/dx = dy/du · du/dx. When you compose functions, the inner rate scales the outer function's change.` 
      }]);
    }
  });

  const syncStrokesMutation = trpc.learnloop.syncStrokes.useMutation();

  // Draw Simulation Box
  useEffect(() => {
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Axes
    ctx.strokeStyle = theme === "dark" ? "#44444C" : "#1E1C1A";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 10);
    ctx.lineTo(30, 170);
    ctx.lineTo(380, 170);
    ctx.stroke();

    // Dashed g(x) curve
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#4E9A6F";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 160);
    ctx.quadraticCurveTo(200, 150, 360, 60);
    ctx.stroke();

    // Solid f(g(x)) curve
    ctx.setLineDash([]);
    ctx.strokeStyle = theme === "dark" ? "#F4F0EA" : "#1E1C1A";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(30, 140);
    ctx.quadraticCurveTo(180, 120, 360, 20);
    ctx.stroke();

    // Tangent point
    const px = 210;
    const py = 92;
    ctx.fillStyle = "#C87D55";
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();

    // Tangent Line
    ctx.strokeStyle = "#C87D55";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 60, py + (innerSlope * 8));
    ctx.lineTo(px + 60, py - (innerSlope * 8));
    ctx.stroke();

    // Label
    ctx.fillStyle = theme === "dark" ? "#F4F0EA" : "#1E1C1A";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("slope at this x", px - 35, py - 12);
  }, [innerSlope, outerSlope, theme]);

  // Render Freehand Drawings
  const renderStrokes = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentList = strokesByPage[currentPage] || [];
    const allToDraw = currentStroke ? [...currentList, currentStroke] : currentList;

    allToDraw.forEach((st) => {
      if (st.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = st.color;
      ctx.lineWidth = st.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (st.tool === "highlighter") {
        ctx.globalAlpha = 0.35;
      } else {
        ctx.globalAlpha = 1.0;
      }

      ctx.moveTo(st.points[0].x, st.points[0].y);
      for (let i = 1; i < st.points.length; i++) {
        ctx.lineTo(st.points[i].x, st.points[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });
  };

  useEffect(() => {
    renderStrokes();
  }, [strokesByPage, currentStroke, currentPage]);

  // Pointer Handlers for Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "text") {
      // Add text note
      const newNote = {
        id: `tn-${Date.now()}`,
        page: currentPage,
        x,
        y,
        text: "Type here..."
      };
      setTextNotes(prev => [...prev, newNote]);
      setActiveTextId(newNote.id);
      return;
    }

    if (tool === "eraser") {
      // Erase strokes near click
      const currentList = strokesByPage[currentPage] || [];
      const filtered = currentList.filter(s => {
        return !s.points.some(p => Math.hypot(p.x - x, p.y - y) < 20);
      });
      setStrokesByPage(prev => ({ ...prev, [currentPage]: filtered }));
      return;
    }

    setIsDrawing(true);
    const newStroke: Stroke = {
      id: `strk-${Date.now()}`,
      tool,
      color: tool === "highlighter" ? "#FFE57F" : selectedColor,
      width: tool === "highlighter" ? 18 : 2.5,
      points: [{ x, y }]
    };
    setCurrentStroke(newStroke);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, { x, y }]
      };
    });
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    
    setStrokesByPage(prev => {
      const pageList = prev[currentPage] || [];
      const updated = [...pageList, currentStroke];
      // Sync stroke to server
      syncStrokesMutation.mutate({
        pageId: `page-${currentPage}`,
        operations: [{ type: "add_stroke", stroke: currentStroke }]
      });
      return { ...prev, [currentPage]: updated };
    });

    // Clear redo for this page
    setRedoByPage(prev => ({ ...prev, [currentPage]: [] }));
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    const list = strokesByPage[currentPage] || [];
    if (list.length === 0) return;
    const popped = list[list.length - 1];
    setStrokesByPage(prev => ({ ...prev, [currentPage]: list.slice(0, -1) }));
    setRedoByPage(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), popped]
    }));
  };

  const handleRedo = () => {
    const redos = redoByPage[currentPage] || [];
    if (redos.length === 0) return;
    const restored = redos[redos.length - 1];
    setRedoByPage(prev => ({ ...prev, [currentPage]: redos.slice(0, -1) }));
    setStrokesByPage(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), restored]
    }));
  };

  const handleAddPage = () => {
    const newPage = totalPages + 1;
    setTotalPages(newPage);
    setCurrentPage(newPage);
    setStrokesByPage(prev => ({ ...prev, [newPage]: [] }));
    setRedoByPage(prev => ({ ...prev, [newPage]: [] }));
  };

  const handleAskCoachSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!coachInput.trim()) return;
    const q = coachInput.trim();
    setCoachMessages(prev => [...prev, { sender: "user", text: q }]);
    setCoachInput("");
    askCoachMutation.mutate({
      question: q,
      conceptId: "chain-rule"
    });
  };

  const handleRecallCheck = () => {
    if (recallAnswer.toLowerCase().includes("multiply") || recallAnswer.includes("·") || recallAnswer.includes("*")) {
      setRecallFeedback("Spot on! Along a chain, the rates multiply: dy/dx = (dy/du) · (du/dx).");
    } else {
      setRecallFeedback("Careful: remember that rates along a chain multiply, like gear ratios!");
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F5EFEB] dark:bg-[#0E0E10] text-[#1E1C1A] dark:text-[#F4F0EA] font-sans overflow-hidden select-none transition-colors duration-200">
      
      {/* ---------- Top GoodNotes Toolbar ---------- */}
      <header className="h-14 bg-white dark:bg-[#121214] border-b-2 border-[#1E1C1A] dark:border-[#2C2C34] px-4 flex items-center justify-between gap-3 z-20 shrink-0">
        
        {/* Left: Back & Editable Notebook Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLocation("/library")}
            className="w-8 h-8 rounded-lg border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] flex items-center justify-center hover:bg-[#EBE4DC] dark:hover:bg-[#222228] transition-colors shrink-0"
            title="Back to Library"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
          </button>
          
          <input
            type="text"
            value={notebookTitle}
            onChange={(e) => setNotebookTitle(e.target.value)}
            className="font-serif font-black text-base text-[#1E1C1A] dark:text-[#F4F0EA] bg-transparent border-none outline-none focus:ring-1 focus:ring-[#C87D55] rounded px-1.5 py-0.5 max-w-[170px] truncate"
            title="Click to rename notebook"
          />

          {/* Mode Switcher: Blank Canvas vs Sample Lesson */}
          <div className="hidden sm:flex items-center border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-xl p-0.5 bg-white dark:bg-[#1A1A1E] text-xs font-bold shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]">
            <button
              onClick={() => {
                setIsSampleLoaded(false);
                setTextNotes([]);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                !isSampleLoaded ? "bg-[#C87D55] text-white" : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#222228]"
              }`}
            >
              Blank
            </button>
            <button
              onClick={() => {
                setIsSampleLoaded(true);
                setNotebookTitle("Chain Rule");
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                isSampleLoaded ? "bg-[#C87D55] text-white" : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#222228]"
              }`}
            >
              Sample Note
            </button>
          </div>
        </div>

        {/* Center: Tools, Undo/Redo & Swatches */}
        <div className="flex items-center gap-2">
          
          {/* Tool Buttons */}
          <div className="flex items-center border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-xl p-0.5 bg-white dark:bg-[#1A1A1E] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]">
            <button
              onClick={() => setTool("pen")}
              className={`p-1.5 rounded-lg transition-all ${
                tool === "pen" ? "bg-[#C87D55] text-white" : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#222228]"
              }`}
              title="Pen"
            >
              <Pen size={16} />
            </button>
            <button
              onClick={() => setTool("highlighter")}
              className={`p-1.5 rounded-lg transition-all ${
                tool === "highlighter" ? "bg-[#C87D55] text-white" : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#222228]"
              }`}
              title="Highlighter"
            >
              <Highlighter size={16} />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`p-1.5 rounded-lg transition-all ${
                tool === "eraser" ? "bg-[#C87D55] text-white" : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#222228]"
              }`}
              title="Eraser"
            >
              <Eraser size={16} />
            </button>
            <button
              onClick={() => setTool("text")}
              className={`p-1.5 rounded-lg transition-all ${
                tool === "text" ? "bg-[#C87D55] text-white" : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#222228]"
              }`}
              title="Text Sticky"
            >
              <Type size={16} />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-xl p-0.5 bg-white dark:bg-[#1A1A1E] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]">
            <button
              onClick={handleUndo}
              className="p-1.5 rounded-lg text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#222228]"
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={handleRedo}
              className="p-1.5 rounded-lg text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#222228]"
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-[#1E1C1A]/20 dark:bg-[#2C2C34] mx-1" />

          {/* Paper Texture Selector */}
          <div className="hidden md:flex items-center border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-xl px-2 py-1 bg-white dark:bg-[#1A1A1E] text-xs font-bold shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000] gap-1">
            <span className="text-[#635F5B] dark:text-[#9E9A92] text-[10px] uppercase font-mono">Paper:</span>
            <select
              value={paperTemplate}
              onChange={(e) => setPaperTemplate(e.target.value as any)}
              className="bg-transparent border-none outline-none text-xs font-bold cursor-pointer text-[#1E1C1A] dark:text-[#F4F0EA]"
            >
              <option value="grid">Grid</option>
              <option value="ruled">Ruled</option>
              <option value="blank">Blank</option>
              <option value="dot">Dot</option>
              <option value="cornell">Cornell</option>
            </select>
          </div>

          <div className="w-px h-6 bg-[#1E1C1A]/20 dark:bg-[#2C2C34] mx-1" />

          {/* Color Palette Dots */}
          <div className="flex items-center gap-1.5 border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-xl px-2 py-1.5 bg-white dark:bg-[#1A1A1E] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]">
            {[
              "#1E1C1A", // Charcoal
              "#F4F0EA", // Off-white
              "#2B5EA7", // Blue
              "#C0392B", // Coral Red
              "#3D7953", // Green
              "#EBD37A", // Yellow
              "#8E44AD", // Purple
            ].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className="w-4 h-4 rounded-full border border-[#1E1C1A] dark:border-[#444] transition-transform hover:scale-125"
                style={{
                  backgroundColor: c,
                  boxShadow: selectedColor === c ? "0 0 0 2px #C87D55" : "none",
                }}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-[#1E1C1A]/20 dark:bg-[#2C2C34] mx-1" />

          {/* Page Navigation */}
          <div className="flex items-center gap-1 border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-xl px-2 py-1 bg-white dark:bg-[#1A1A1E] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000] text-xs font-bold">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-0.5 hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] rounded disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-1 text-[#1E1C1A] dark:text-[#F4F0EA]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-0.5 hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] rounded disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={handleAddPage}
              className="p-1 hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] rounded text-[#C87D55] ml-1"
              title="Add Page"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="w-px h-6 bg-[#1E1C1A]/20 dark:bg-[#2C2C34] mx-1" />

          {/* Typed Mode Switch */}
          <button
            onClick={() => setLocation("/typed")}
            className="px-3 py-1.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-bold flex items-center gap-1.5 hover:bg-[#EBE4DC] dark:hover:bg-[#222228] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]"
          >
            <FileText size={14} /> Typed
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setStrokesByPage(prev => ({ ...prev, [currentPage]: [] }));
              setRedoByPage(prev => ({ ...prev, [currentPage]: [] }));
              setTextNotes(prev => prev.filter(n => n.page !== currentPage));
            }}
            className="px-2.5 py-1.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-bold text-[#C0392B] hover:bg-[#FDEDEC] dark:hover:bg-[#3D1E1E] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]"
            title="Clear current page"
          >
            Clear
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3 py-1.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-bold flex items-center gap-1.5 hover:bg-[#EBE4DC] dark:hover:bg-[#222228] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]"
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </header>

      {/* ---------- Main Notebook Canvas Area ---------- */}
      <div className="flex-1 overflow-auto bg-[#EBE4DC] dark:bg-[#0A0A0C] flex justify-center p-8 relative transition-colors duration-200">
        
        {/* Physical Paper Sheet with Dynamic Paper Texture */}
        <div className={`w-[860px] min-h-[1140px] bg-[#FDFBF7] dark:bg-[#141416] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl shadow-[5px_6px_0px_#1E1C1A] dark:shadow-[5px_6px_0px_#000000] p-12 relative space-y-6 text-[#1E1C1A] dark:text-[#F4F0EA] ${
          paperTemplate === "blank" ? "" :
          paperTemplate === "ruled" ? (theme === "dark" ? "[background-image:linear-gradient(transparent_27px,#33333C_28px)] [background-size:100%_28px]" : "[background-image:linear-gradient(transparent_27px,#1E1C1A18_28px)] [background-size:100%_28px]") :
          paperTemplate === "dot" ? (theme === "dark" ? "[background-image:radial-gradient(#444450_1px,transparent_1px)] [background-size:18px_18px]" : "[background-image:radial-gradient(#1E1C1A25_1px,transparent_1px)] [background-size:18px_18px]") :
          paperTemplate === "cornell" ? (theme === "dark" ? "[background-image:linear-gradient(transparent_27px,#33333C_28px)] [background-size:100%_28px] border-l-8 border-l-[#C87D55]/30" : "[background-image:linear-gradient(transparent_27px,#1E1C1A18_28px)] [background-size:100%_28px] border-l-8 border-l-[#C87D55]/30") :
          (theme === "dark" ? "[background-image:radial-gradient(#FFFFFF15_1px,transparent_1px)] [background-size:24px_24px]" : "[background-image:radial-gradient(#1E1C1A18_1px,transparent_1px)] [background-size:24px_24px]")
        }`}>
          
          {/* Transparent Overlay HTML5 Canvas for Live Ink Drawing */}
          <canvas
            ref={drawCanvasRef}
            width={860}
            height={1140}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute inset-0 z-10 w-full h-full cursor-crosshair touch-none"
          />

          {/* Sticky Text Notes Placed on Page */}
          {textNotes.filter(n => n.page === currentPage).map(note => (
            <div
              key={note.id}
              style={{ left: `${note.x}px`, top: `${note.y}px` }}
              className="absolute z-20 bg-[#FFE57F] dark:bg-[#332A15] text-[#1E1C1A] dark:text-[#FFE57F] p-2.5 rounded-xl border border-[#1E1C1A] dark:border-[#FFE57F]/40 shadow-[2px_2px_0px_#1E1C1A] text-xs font-mono"
            >
              <input
                type="text"
                value={note.text}
                onChange={(e) => {
                  const val = e.target.value;
                  setTextNotes(prev => prev.map(n => n.id === note.id ? { ...n, text: val } : n));
                }}
                className="bg-transparent border-none outline-none font-bold"
              />
            </div>
          ))}

          {/* ────────────────────────────────────────────────────────── */}
          {/* CASE A: BLANK NOTEBOOK MODE (Default for New Accounts/Pages) */}
          {/* ────────────────────────────────────────────────────────── */}
          {!isSampleLoaded && (
            <div className="space-y-6 relative z-10">
              {/* Clean Editable Page Header */}
              <div className="flex items-center justify-between border-b border-[#1E1C1A]/10 dark:border-[#2C2C34] pb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={notebookTitle}
                    onChange={(e) => setNotebookTitle(e.target.value)}
                    className="font-serif font-black text-3xl text-[#1E1C1A] dark:text-[#F4F0EA] bg-transparent border-none outline-none focus:ring-1 focus:ring-[#C87D55] rounded px-1.5 min-w-[200px]"
                    placeholder="Untitled Note"
                  />
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#EBE4DC] dark:bg-[#222228] text-[#635F5B] dark:text-[#9E9A92]">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                {/* Quick actions on the sheet */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTool("text");
                      setTextNotes(prev => [
                        ...prev,
                        { id: `tn-${Date.now()}`, page: currentPage, x: 70, y: 150 + prev.length * 60, text: "New step or note..." }
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-bold hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus size={13} /> Sticky Note
                  </button>

                  <button
                    onClick={() => setIsSimInsertedOnBlank(prev => !prev)}
                    className="px-3 py-1.5 rounded-xl border border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-bold hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] flex items-center gap-1.5 shadow-xs text-[#3D7953] transition-colors"
                  >
                    <Sliders size={13} /> {isSimInsertedOnBlank ? "Hide Sim" : "Insert Sim"}
                  </button>

                  <button
                    onClick={() => setLocation("/check-my-work")}
                    className="px-3 py-1.5 rounded-xl bg-[#C87D55] text-white text-xs font-bold border border-[#1E1C1A] dark:border-[#2C2C34] flex items-center gap-1.5 shadow-xs hover:bg-[#B26B45] transition-colors"
                  >
                    <Sparkles size={13} /> Spotter (Check)
                  </button>
                </div>
              </div>

              {/* Optional Inserted Simulation Widget */}
              {isSimInsertedOnBlank && (
                <div className="border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl bg-white dark:bg-[#1A1A1E] p-5 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] relative z-20 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E1C1A]/10 dark:border-[#2C2C34] pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
                      Chain Rule Simulation Widget
                    </span>
                    <button
                      onClick={() => setIsSimInsertedOnBlank(false)}
                      className="text-xs text-[#C0392B] hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-7 flex justify-center">
                      <canvas
                        ref={simCanvasRef}
                        width={380}
                        height={160}
                        className="w-full rounded-xl border border-[#1E1C1A]/20 dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#121214]"
                      />
                    </div>
                    <div className="md:col-span-5 space-y-3 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>Inner slope g'(x)</span>
                        <span>{innerSlope}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        step="0.5"
                        value={innerSlope}
                        onChange={(e) => setInnerSlope(parseFloat(e.target.value))}
                        className="w-full accent-[#3D7953]"
                      />
                      <div className="flex justify-between font-bold">
                        <span>Outer slope f'(u)</span>
                        <span>{outerSlope}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        step="0.5"
                        value={outerSlope}
                        onChange={(e) => setOuterSlope(parseFloat(e.target.value))}
                        className="w-full accent-[#3D7953]"
                      />
                      <div className="p-2.5 rounded-lg bg-[#EBE4DC]/60 dark:bg-[#222228] font-black text-center text-[#C87D55]">
                        {outerSlope} × {innerSlope} = {totalSlope}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty Page Guide Placeholder (disappears as user writes or draws) */}
              {(!strokesByPage[currentPage] || strokesByPage[currentPage].length === 0) &&
               textNotes.filter(n => n.page === currentPage).length === 0 && !isSimInsertedOnBlank && (
                <div className="h-[460px] flex flex-col items-center justify-center text-center opacity-45 select-none space-y-3 pointer-events-none">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#1E1C1A] dark:border-[#777] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA]">
                    <Pen size={22} strokeWidth={2} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif italic text-xl text-[#1E1C1A] dark:text-[#F4F0EA]">
                      Clean blank page ready for your writing
                    </p>
                    <p className="text-xs font-sans text-[#635F5B] dark:text-[#9E9A92] max-w-sm">
                      Select Pen, Highlighter, or Text from the toolbar above to write steps, solve problems, or sketch diagrams.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* CASE B: SAMPLE LESSON MODE (Chain Rule Demo Exploration) */}
          {/* ────────────────────────────────────────────────────────── */}
          {isSampleLoaded && (
            <>
              {/* Sample Mode Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#C87D55]/10 dark:bg-[#C87D55]/20 border border-[#C87D55] text-xs font-bold text-[#C87D55]">
                <span>Sample Lesson Mode · Interactive Chain Rule from Reference PDF</span>
                <button
                  onClick={() => {
                    setIsSampleLoaded(false);
                    setTextNotes([]);
                  }}
                  className="underline hover:text-[#B26B45]"
                >
                  Switch to Blank Canvas →
                </button>
              </div>

              {/* Page 1 Content */}
              {currentPage === 1 && (
                <>
                  {/* Note Title */}
                  <div className="relative inline-block">
                    <span className="absolute inset-0 bg-[#FFE57F]/70 dark:bg-[#FFE57F]/30 -rotate-1 rounded" />
                    <h1 className="relative font-serif font-black text-4xl text-[#1E1C1A] dark:text-[#FFE57F] px-2 py-0.5">
                      Chain Rule
                    </h1>
                  </div>

                  {/* Composition Definition */}
                  <div className="space-y-1 font-serif text-lg leading-relaxed text-[#1E1C1A] dark:text-[#F4F0EA]">
                    <p>
                      <strong className="font-sans font-bold">Composition:</strong>{" "}
                      <span className="italic bg-[#E8F5E9] dark:bg-[#1E3326] dark:text-[#74C39B] px-1 rounded">f(g(x))</span> = a function inside a function
                    </p>
                    <p className="text-[#3D7953] dark:text-[#74C39B] font-medium text-base pl-6">
                      → inner step <span className="italic font-bold">g</span>, then outer step <span className="italic font-bold">f</span>
                    </p>
                  </div>

                  {/* Rule with Planted Slip & Margin Coach Flag */}
                  <div className="relative p-4 rounded-2xl bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">Rule:</div>
                    
                    <div className="flex items-center gap-4 text-2xl font-serif font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                      <span>d/dx f(g(x)) = f'(g(x))</span>
                      <span className="text-[#C0392B] bg-[#FDEDEC] dark:bg-[#3D1E1E] px-2 py-0.5 rounded border border-[#C0392B]">+</span>
                      <span>g'(x)</span>
                      
                      {/* Slip Badge 1 in orange */}
                      <span className="w-5 h-5 rounded-full bg-[#C87D55] text-white text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                    </div>

                    {/* AI Cursor Margin Pointer */}
                    <div 
                      onClick={() => setCoachOpen(true)}
                      className="absolute -right-36 top-6 flex items-center gap-1.5 cursor-pointer animate-bounce z-30"
                    >
                      <span className="text-xs font-black text-white bg-[#3D7953] border-2 border-[#1E1C1A] dark:border-[#2C2C34] px-3 py-1 rounded-full shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
                        Coach: this plus sign
                      </span>
                    </div>
                  </div>

                  {/* Example Formula */}
                  <div className="space-y-2 font-serif text-lg text-[#1E1C1A] dark:text-[#F4F0EA]">
                    <p>
                      <strong className="font-sans font-bold text-base">Example:</strong>{" "}
                      <span className="italic">y = (3x + 1)²</span>, so{" "}
                      <span className="italic">dy/dx = 2(3x + 1) · 3</span>
                    </p>
                    
                    <p className="relative inline-block font-sans text-base">
                      Slopes on a path{" "}
                      <span className="bg-[#FFE57F] dark:bg-[#4A3C1E] dark:text-[#FFE57F] font-bold px-1.5 py-0.5 rounded border border-[#1E1C1A] dark:border-[#FFE57F]">
                        multiply
                      </span>
                      , like gear ratios.
                    </p>
                  </div>

                  {/* Interactive Simulation Block */}
                  <div className="border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl bg-white dark:bg-[#1A1A1E] p-5 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-4 relative z-20">
                    <div className="flex items-center justify-between border-b border-[#1E1C1A]/15 dark:border-[#2C2C34] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92]">
                          Simulation · Chain Rule
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#3D7953] text-white">
                          Run by Visualizer
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setInnerSlope(3);
                            setOuterSlope(2);
                          }}
                          className="px-3 py-1 rounded-lg border border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold hover:bg-[#EBE4DC] dark:hover:bg-[#222228]"
                        >
                          Re-run
                        </button>
                        <button
                          onClick={() => alert("Simulation pinned to page.")}
                          className="px-3 py-1 rounded-lg bg-[#C87D55] text-white border border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold"
                        >
                          Pin to page
                        </button>
                      </div>
                    </div>

                    {/* Interactive Curve & Sliders Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-7 flex justify-center">
                        <canvas
                          ref={simCanvasRef}
                          width={400}
                          height={180}
                          className="w-full max-w-sm rounded-xl border border-[#1E1C1A]/20 dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#121214]"
                        />
                      </div>

                      <div className="md:col-span-5 space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] mb-1">
                            <span>Inner slope g'(x)</span>
                            <span>{innerSlope}</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="6"
                            step="0.5"
                            value={innerSlope}
                            onChange={(e) => setInnerSlope(parseFloat(e.target.value))}
                            className="w-full accent-[#3D7953]"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] mb-1">
                            <span>Outer slope f'(u)</span>
                            <span>{outerSlope}</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="6"
                            step="0.5"
                            value={outerSlope}
                            onChange={(e) => setOuterSlope(parseFloat(e.target.value))}
                            className="w-full accent-[#3D7953]"
                          />
                        </div>

                        <div className="p-3 bg-[#EBE4DC]/50 dark:bg-[#222228] border border-[#1E1C1A] dark:border-[#2C2C34] rounded-xl text-center">
                          <span className="text-xs font-black uppercase text-[#1E1C1A] dark:text-[#F4F0EA] block">
                            Total slope = outer × inner
                          </span>
                          <span className="text-xl font-black font-serif text-[#C87D55]">
                            {outerSlope} × {innerSlope} = {totalSlope}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Page 2 Content: Derivation & Exercises */}
              {currentPage >= 2 && (
                <div className="space-y-6">
                  <div className="relative inline-block">
                    <span className="absolute inset-0 bg-[#A8CDEE]/60 dark:bg-[#2B5EA7]/40 -rotate-1 rounded" />
                    <h1 className="relative font-serif font-black text-3xl text-[#1E1C1A] dark:text-[#F4F0EA] px-2 py-0.5">
                      Page {currentPage}: Multi-Layer Chain Rule & Backprop
                    </h1>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] space-y-3 font-serif text-base">
                    <p>
                      <strong>Chaining 3 Functions:</strong> If <span className="font-mono font-bold">y = f(g(h(x)))</span>, then:
                    </p>
                    <p className="font-mono text-sm bg-[#FDFBF7] dark:bg-[#141416] p-3 rounded-xl border border-[#1E1C1A]/20">
                      dy/dx = (df/dg) · (dg/dh) · (dh/dx)
                    </p>
                    <p className="text-xs font-sans text-[#635F5B] dark:text-[#9E9A92]">
                      This is the exact backbone of Backpropagation in Deep Learning: gradients flow backward through every layer by matrix multiplication!
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border-2 border-dashed border-[#1E1C1A]/40 dark:border-[#3A3A44] flex flex-col items-center justify-center text-center space-y-2 py-10">
                    <span className="text-xs font-bold text-[#635F5B] dark:text-[#9E9A92]">
                      Use the Pen, Highlighter, or Text tool from the toolbar above to sketch or solve exercises directly on this paper!
                    </span>
                    <button
                      onClick={() => setLocation("/check-my-work")}
                      className="px-5 py-2.5 rounded-xl bg-[#C87D55] text-white text-xs font-bold border-2 border-[#1E1C1A] shadow-[2px_2px_0px_#1E1C1A]"
                    >
                      Check my handwritten steps
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

      {/* ---------- Corner Mascot & Coach Floating Drawer ---------- */}
      <div className="fixed bottom-6 right-6 z-40">
        
        {/* Closed Mascot with Speech Bubble */}
        {!coachOpen ? (
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setCoachOpen(true)}
              className="cursor-pointer bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl px-4 py-2.5 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#FDFBF7] dark:hover:bg-[#222228] transition-all flex items-center gap-2"
            >
              <span>I spotted a slip on your rule line</span>
              <span className="w-4 h-4 rounded-full bg-[#C87D55] text-white text-[10px] font-black flex items-center justify-center">
                1
              </span>
            </div>

            {/* Mascot Avatar Button */}
            <button
              onClick={() => setCoachOpen(true)}
              className="w-14 h-14 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] hover:scale-105 transition-transform"
              title="Open Coach"
            >
              <Sprout size={24} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          /* Open Coach Floating Card */
          <div className="w-[440px] bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-5 shadow-[5px_5px_0px_#1E1C1A] dark:shadow-[5px_5px_0px_#000000] space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200 text-[#1E1C1A] dark:text-[#F4F0EA]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E1C1A]/15 dark:border-[#2C2C34] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-[#1E1C1A] bg-[#C87D55] text-white flex items-center justify-center">
                  <Sprout size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-[#1E1C1A] dark:text-[#F4F0EA]">Coach</h3>
                  <span className="text-[10px] font-bold text-[#3D7953] dark:text-[#4E9A6F] block">Living in your page</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCoachOpen(false)} className="w-7 h-7 rounded-lg border border-[#1E1C1A] dark:border-[#2C2C34] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#222228]">
                  <Minus size={14} />
                </button>
                <button onClick={() => setCoachOpen(false)} className="w-7 h-7 rounded-lg border border-[#1E1C1A] dark:border-[#2C2C34] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#222228]">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Coach Tabs: Spotter, Wonder, Visualize, Recall */}
            <div className="flex bg-[#EBE4DC] dark:bg-[#24242A] p-1 rounded-xl border border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold">
              {(["spotter", "wonder", "visualize", "recall"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCoachTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg capitalize transition-all ${
                    coachTab === tab
                      ? "bg-[#C87D55] text-white shadow-[1px_1px_0px_#1E1C1A]"
                      : "text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-white/50 dark:hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Spotter */}
            {coachTab === "spotter" && (
              <div className="bg-[#FFE57F]/30 dark:bg-[#3D3316] border-2 border-[#1E1C1A] dark:border-[#C87D55] rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C87D55] block">
                  SLIP ON YOUR RULE LINE
                </span>
                <p className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] leading-relaxed">
                  You added the two slopes. Along a chain they multiply. Your gear-ratio note says the same.
                </p>
                
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setLocation("/where-it-breaks")}
                    className="px-4 py-2 rounded-xl bg-[#C87D55] text-white text-xs font-bold border border-[#1E1C1A] dark:border-[#2C2C34] shadow-[1px_1px_0px_#1E1C1A] hover:bg-[#B26B45]"
                  >
                    Show why
                  </button>
                  <button
                    onClick={() => setLocation("/simulation-lab")}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#222228] text-[#1E1C1A] dark:text-[#F4F0EA] text-xs font-bold border border-[#1E1C1A] dark:border-[#2C2C34] shadow-[1px_1px_0px_#1E1C1A] hover:bg-[#EBE4DC]"
                  >
                    Simulate it
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Wonder */}
            {coachTab === "wonder" && (
              <div className="bg-[#C3B4E8]/20 dark:bg-[#251E38] border-2 border-[#1E1C1A] dark:border-[#A494D8] rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#7C5BB8] dark:text-[#C3B4E8] block">
                  WONDER · OPEN EXPLORATION
                </span>
                <ul className="text-xs font-medium space-y-2 text-[#1E1C1A] dark:text-[#F4F0EA]">
                  <li className="p-2 rounded-lg bg-white/60 dark:bg-[#1A1A1E] border border-[#1E1C1A]/20 flex items-start gap-2">
                    <Lightbulb size={14} className="text-[#C87D55] shrink-0 mt-0.5" />
                    <span>If the inner function has zero slope (horizontal tangent), what happens to the entire compound derivative?</span>
                  </li>
                  <li className="p-2 rounded-lg bg-white/60 dark:bg-[#1A1A1E] border border-[#1E1C1A]/20 flex items-start gap-2">
                    <Lightbulb size={14} className="text-[#C87D55] shrink-0 mt-0.5" />
                    <span>How does this chain multiplication explain why deep neural networks suffer from the vanishing gradient problem?</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Tab 3: Visualize */}
            {coachTab === "visualize" && (
              <div className="bg-[#9ED7C6]/20 dark:bg-[#19332D] border-2 border-[#1E1C1A] dark:border-[#4E9A6F] rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#3D7953] dark:text-[#74C39B] block">
                  VISUALIZER ACTIONS
                </span>
                <p className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                  Quickly test how changing parameters affects the curve:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setInnerSlope(6);
                      setOuterSlope(2);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white dark:bg-[#1A1A1E] border border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold hover:bg-[#EBE4DC]"
                  >
                    Max Inner (6x)
                  </button>
                  <button
                    onClick={() => {
                      setInnerSlope(1);
                      setOuterSlope(1);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white dark:bg-[#1A1A1E] border border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold hover:bg-[#EBE4DC]"
                  >
                    Unit (1x)
                  </button>
                  <button
                    onClick={() => setLocation("/simulation-lab")}
                    className="px-3 py-2 rounded-xl bg-[#3D7953] text-white text-xs font-bold border border-[#1E1C1A]"
                  >
                    Full Lab
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Recall */}
            {coachTab === "recall" && (
              <div className="bg-[#A8CDEE]/20 dark:bg-[#1C2C3D] border-2 border-[#1E1C1A] dark:border-[#5289C7] rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2B5EA7] dark:text-[#A8CDEE] block">
                  RECALL · ACTIVE TEST
                </span>
                <p className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">
                  Question: Do slopes add or multiply along a composition path?
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recallAnswer}
                    onChange={(e) => setRecallAnswer(e.target.value)}
                    placeholder="Type: add or multiply..."
                    className="flex-1 px-3 py-2 rounded-xl border border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#121214] text-xs font-bold"
                  />
                  <button
                    onClick={handleRecallCheck}
                    className="px-4 py-2 rounded-xl bg-[#2B5EA7] text-white text-xs font-bold"
                  >
                    Check
                  </button>
                </div>
                {recallFeedback && (
                  <p className="text-xs font-bold p-2 bg-white/70 dark:bg-[#121214] rounded-lg border border-[#1E1C1A]/20 text-[#1E1C1A] dark:text-[#F4F0EA]">
                    {recallFeedback}
                  </p>
                )}
              </div>
            )}

            {/* Conversation Log */}
            <div className="max-h-36 overflow-y-auto space-y-2 border-t border-[#1E1C1A]/10 dark:border-[#2C2C34] pt-2">
              {coachMessages.slice(-2).map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl text-xs font-medium ${
                    msg.sender === "user"
                      ? "bg-[#C87D55]/15 border border-[#C87D55]/30 text-[#1E1C1A] dark:text-[#F4F0EA] ml-6"
                      : "bg-[#FDFBF7] dark:bg-[#141416] border border-[#1E1C1A]/20 text-[#1E1C1A] dark:text-[#F4F0EA] mr-6"
                  }`}
                >
                  <strong className="block text-[10px] uppercase font-bold text-[#635F5B] dark:text-[#9E9A92]">
                    {msg.sender === "user" ? "You" : "Coach"}
                  </strong>
                  {msg.text}
                </div>
              ))}
              {askCoachMutation.isPending && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#C87D55]">
                  <Loader2 size={12} className="animate-spin" /> Thinking from your notes...
                </div>
              )}
            </div>

            {/* Input Row */}
            <form onSubmit={handleAskCoachSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="Ask or say what to visualise..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#121214] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C87D55]"
              />
              <button
                type="submit"
                disabled={askCoachMutation.isPending || !coachInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#1E1C1A] dark:bg-[#C87D55] text-white text-xs font-bold hover:bg-[#333] disabled:opacity-50"
              >
                Run
              </button>
            </form>

          </div>
        )}

      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
      {showRetestModal && <RetestModal onClose={() => setShowRetestModal(false)} />}

    </div>
  );
}
