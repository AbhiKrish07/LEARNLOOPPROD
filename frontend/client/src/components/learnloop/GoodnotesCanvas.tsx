import React, { useState, useRef, useEffect } from "react";
import {
  PenLine,
  Eraser,
  Highlighter,
  Lasso,
  Type,
  Grid,
  RotateCcw,
  RotateCw,
  Sparkles,
  Check,
  AlertTriangle,
  FileText,
  Sliders,
  ChevronDown
} from "lucide-react";
import { crdtEngine, StrokeAtom } from "../../lib/learnloop/crdtSync";

export type PenTool = "pen" | "pencil" | "highlighter" | "eraser" | "lasso" | "text";
export type PaperTemplate = "grid" | "lined" | "dot" | "cornell" | "blank";

interface Point {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  id: string;
  tool: PenTool;
  color: string;
  width: number;
  opacity: number;
  points: Point[];
}

export const GoodnotesCanvas: React.FC<{
  onObserveText?: (text: string) => void;
  activeConceptId?: string;
}> = ({ onObserveText, activeConceptId = "chain-rule" }) => {
  const [selectedTool, setSelectedTool] = useState<PenTool>("pen");
  const [selectedColor, setSelectedColor] = useState<string>("#182235");
  const [selectedWidth, setSelectedWidth] = useState<number>(3);
  const [paperTemplate, setPaperTemplate] = useState<PaperTemplate>("grid");
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [localStrokes, setLocalStrokes] = useState<Stroke[]>([]);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);

  const canvasRef = useRef<SVGSVGElement | null>(null);

  const colors = [
    { name: "Graphite", hex: "#182235" },
    { name: "LearnLoop Blue", hex: "#1E49DA" },
    { name: "Emerald", hex: "#18A999" },
    { name: "Coral Red", hex: "#C9685A" },
    { name: "Gold", hex: "#D8B849" },
    { name: "Purple", hex: "#8B5CF6" },
  ];

  // Initialize with sample Goodnotes handwriting
  useEffect(() => {
    const defaultStrokes: Stroke[] = [
      {
        id: "sample-1",
        tool: "pen",
        color: "#1E49DA",
        width: 3.5,
        opacity: 1,
        points: [
          { x: 50, y: 140, pressure: 0.8 },
          { x: 120, y: 142, pressure: 0.9 },
          { x: 180, y: 138, pressure: 0.85 },
          { x: 260, y: 145, pressure: 0.9 }
        ]
      },
      {
        id: "sample-2",
        tool: "highlighter",
        color: "#D8B849",
        width: 14,
        opacity: 0.4,
        points: [
          { x: 45, y: 225, pressure: 0.9 },
          { x: 310, y: 225, pressure: 0.9 }
        ]
      }
    ];
    setLocalStrokes(defaultStrokes);
  }, []);

  const getPointerPos = (e: React.PointerEvent<SVGSVGElement>): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: e.clientX, y: e.clientY, pressure: e.pressure || 0.5 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure > 0 ? e.pressure : 0.5
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getPointerPos(e);
    setIsDrawing(true);

    if (selectedTool === "eraser") {
      // Erase stroke under touch
      eraseStrokeAt(pt);
      return;
    }

    setCurrentStroke([pt]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const pt = getPointerPos(e);

    if (selectedTool === "eraser") {
      eraseStrokeAt(pt);
      return;
    }

    setCurrentStroke((prev) => [...prev, pt]);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);

    if (selectedTool !== "eraser" && currentStroke.length > 1) {
      const newStroke: Stroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        tool: selectedTool,
        color: selectedTool === "highlighter" ? selectedColor : selectedColor,
        width: selectedTool === "highlighter" ? selectedWidth * 4 : selectedWidth,
        opacity: selectedTool === "highlighter" ? 0.35 : 1,
        points: currentStroke
      };

      setUndoStack((prev) => [...prev, localStrokes]);
      setRedoStack([]);
      setLocalStrokes((prev) => [...prev, newStroke]);

      // Record to CRDT outbox
      try {
        crdtEngine.addStroke(
          currentStroke.map((p) => ({ x: p.x, y: p.y, timestamp: Date.now(), pressure: p.pressure })),
          selectedTool === "highlighter" ? "highlighter" : "pen",
          selectedColor,
          selectedWidth
        );
      } catch (e) {
        console.warn("Outbox sync", e);
      }
    }

    setCurrentStroke([]);
  };

  const eraseStrokeAt = (pt: Point) => {
    const radius = 20;
    setLocalStrokes((prev) =>
      prev.filter((stroke) => {
        const hit = stroke.points.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < radius);
        return !hit;
      })
    );
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, localStrokes]);
    setLocalStrokes(last);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, localStrokes]);
    setLocalStrokes(next);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  const pointsToSvgPath = (points: Point[]): string => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      d += ` Q ${points[i - 1].x} ${points[i - 1].y}, ${xc} ${yc}`;
    }
    return d;
  };

  return (
    <div className="w-full flex flex-col bg-[#FDFCF9] border border-[#E7E5DF] rounded-2xl shadow-sm overflow-hidden min-h-[700px]">
      
      {/* Goodnotes Top Digital Pen & Tool Palette Header */}
      <div className="bg-[#F8F7F3] border-b border-[#E7E5DF] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
        
        {/* Tool Selectors */}
        <div className="flex items-center gap-1 bg-white border border-[#E7E5DF] p-1 rounded-xl shadow-2xs">
          <button
            onClick={() => setSelectedTool("pen")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTool === "pen"
                ? "bg-[#1E49DA] text-white shadow-xs"
                : "text-[#637085] hover:text-[#182235] hover:bg-[#F5F3EE]"
            }`}
          >
            <PenLine size={14} /> Pen
          </button>

          <button
            onClick={() => setSelectedTool("highlighter")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTool === "highlighter"
                ? "bg-[#D8B849] text-[#182235] shadow-xs"
                : "text-[#637085] hover:text-[#182235] hover:bg-[#F5F3EE]"
            }`}
          >
            <Highlighter size={14} /> Highlighter
          </button>

          <button
            onClick={() => setSelectedTool("eraser")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTool === "eraser"
                ? "bg-[#C9685A] text-white shadow-xs"
                : "text-[#637085] hover:text-[#182235] hover:bg-[#F5F3EE]"
            }`}
          >
            <Eraser size={14} /> Eraser
          </button>

          <button
            onClick={() => setSelectedTool("lasso")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTool === "lasso"
                ? "bg-[#8B5CF6] text-white shadow-xs"
                : "text-[#637085] hover:text-[#182235] hover:bg-[#F5F3EE]"
            }`}
          >
            <Lasso size={14} /> Lasso
          </button>
        </div>

        {/* Color Palette Swatches */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#788395] uppercase tracking-wider">Color:</span>
          <div className="flex items-center gap-1.5 bg-white border border-[#E7E5DF] px-2 py-1 rounded-xl">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => setSelectedColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`w-5 h-5 rounded-full transition-transform border border-black/10 ${
                  selectedColor === c.hex ? "scale-125 ring-2 ring-[#1E49DA]/40" : "hover:scale-110"
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Stroke Thickness Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#788395] uppercase tracking-wider">Thickness:</span>
          <div className="flex items-center gap-1 bg-white border border-[#E7E5DF] p-1 rounded-xl">
            {[2, 4, 7].map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWidth(w)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  selectedWidth === w ? "bg-[#182235] text-white" : "text-[#637085] hover:bg-[#F5F3EE]"
                }`}
              >
                {w === 2 ? "Fine" : w === 4 ? "Medium" : "Thick"}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Template Selector & Undo/Redo */}
        <div className="flex items-center gap-2">
          <select
            value={paperTemplate}
            onChange={(e) => setPaperTemplate(e.target.value as PaperTemplate)}
            className="px-3 py-1.5 rounded-xl border border-[#E7E5DF] bg-white text-xs font-semibold text-[#182235] cursor-pointer focus:outline-none"
          >
            <option value="grid">Grid Paper</option>
            <option value="lined">Lined Paper</option>
            <option value="dot">Dot Grid</option>
            <option value="cornell">Cornell Notes</option>
            <option value="blank">Plain Paper</option>
          </select>

          <div className="flex items-center gap-1 bg-white border border-[#E7E5DF] p-1 rounded-xl">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 text-[#637085] hover:text-[#182235] disabled:opacity-30 rounded-lg"
              title="Undo stroke"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 text-[#637085] hover:text-[#182235] disabled:opacity-30 rounded-lg"
              title="Redo stroke"
            >
              <RotateCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Goodnotes Interactive Paper Surface */}
      <div
        className={`relative flex-1 min-h-[620px] select-none ${
          paperTemplate === "grid"
            ? "bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px]"
            : paperTemplate === "lined"
            ? "bg-[linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:100%_28px]"
            : paperTemplate === "dot"
            ? "bg-[radial-gradient(#d1d5db_1.5px,transparent_1.5px)] bg-[size:20px_20px]"
            : "bg-[#FDFCF9]"
        }`}
      >
        {/* Cornell Line Margin */}
        {paperTemplate === "cornell" && (
          <div className="absolute left-[180px] top-0 bottom-0 w-[1.5px] bg-[#C9685A]/40" />
        )}

        {/* Static Default Goodnotes Handwritten Notes & Callouts */}
        <div className="absolute inset-0 p-8 pointer-events-none font-sans">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E49DA] uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Calculus / Chain Rule — Session 08
          </div>

          <h2 className="text-2xl font-bold font-serif text-[#182235] italic tracking-tight mb-2">
            When one function changes <span className="text-[#1E49DA] not-italic">inside</span> another
          </h2>

          <p className="text-sm text-[#637085] max-w-xl leading-relaxed mb-4">
            If y = f(g(x)), then y changes in two compound steps. The rate of change dy/dx is the product of outer and inner derivatives.
          </p>

          {/* Mathematical Equation Card */}
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[#EDF1FF] border border-[#D9E1FF] text-[#1E49DA] font-serif text-lg font-bold shadow-2xs mb-6">
            <span>dy/dx</span>
            <span>=</span>
            <div className="flex flex-col items-center leading-none text-sm">
              <span className="border-b border-[#1E49DA] pb-0.5">df</span>
              <span className="pt-0.5">dg</span>
            </div>
            <span>·</span>
            <div className="flex flex-col items-center leading-none text-sm">
              <span className="border-b border-[#1E49DA] pb-0.5">dg</span>
              <span className="pt-0.5">dx</span>
            </div>
          </div>

          {/* Worked Example Container */}
          <div className="max-w-md p-4 rounded-xl bg-[#FFF8DC] border-l-4 border-[#D8B849] text-xs text-[#182235] space-y-1.5 shadow-2xs">
            <span className="font-mono text-[10px] font-bold text-[#9A8750] uppercase tracking-wider">TRY IT WORKED EXAMPLE</span>
            <div className="font-serif text-sm font-bold">f(x) = sin(3x² + 1)</div>
            <div className="font-serif text-sm text-[#1E49DA]">
              f′(x) = cos(3x² + 1) · <span className="underline decoration-2 decoration-[#1E49DA]">6x</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#3B8C68] pt-1">
              <Check size={13} /> Correct step (inner change multiplied)
            </div>
          </div>
        </div>

        {/* SVG Drawing Layer for Apple Pencil & Touch Strokes */}
        <svg
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        >
          {/* Render Completed Strokes */}
          {localStrokes.map((stroke) => (
            <path
              key={stroke.id}
              d={pointsToSvgPath(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeOpacity={stroke.opacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}

          {/* Render Current In-Progress Stroke */}
          {currentStroke.length > 1 && (
            <path
              d={pointsToSvgPath(currentStroke)}
              stroke={selectedTool === "highlighter" ? selectedColor : selectedColor}
              strokeWidth={selectedTool === "highlighter" ? selectedWidth * 4 : selectedWidth}
              strokeOpacity={selectedTool === "highlighter" ? 0.35 : 1}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </svg>
      </div>

      {/* Footer Info & CRDT Outbox Sync Status */}
      <div className="bg-[#F8F7F3] border-t border-[#E7E5DF] px-4 py-2 text-[11px] text-[#788395] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#18A999]" /> Apple Pencil Active · Low-Latency Vector Ink
        </span>
        <span className="font-mono">CRDT Outbox: {localStrokes.length} Strokes Synced</span>
      </div>
    </div>
  );
};
