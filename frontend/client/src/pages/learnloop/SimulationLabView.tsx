import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Pin, Send, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

export const SimulationLabView: React.FC = () => {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const [innerSlope, setInnerSlope] = useState(3);
  const [outerSlope, setOuterSlope] = useState(2);
  const [positionX, setPositionX] = useState(50);
  const [prediction, setPrediction] = useState<"double" | "same" | "add">("double");
  const [hasCompared, setHasCompared] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = theme === "dark";

    // Coordinate Frame
    ctx.strokeStyle = isDark ? "#3A3A44" : "#1E1C1A";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 260);
    ctx.lineTo(540, 260);
    ctx.stroke();

    // Labels
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = isDark ? "#9E9A92" : "#635F5B";
    ctx.fillText("solid: f(g(x))   dashed: g(x)", 50, 45);

    // Dashed inner g(x)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = isDark ? "#4E9A6F" : "#3D7953";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(40, 240);
    ctx.quadraticCurveTo(280, 220, 520, 80);
    ctx.stroke();

    // Solid outer f(g(x))
    ctx.setLineDash([]);
    ctx.strokeStyle = isDark ? "#F4F0EA" : "#1E1C1A";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 210);
    ctx.quadraticCurveTo(260, 180, 520, 40);
    ctx.stroke();

    // Tangent at x
    const px = 100 + (positionX * 3.6);
    const py = 190 - (positionX * 1.3);

    ctx.fillStyle = "#C87D55";
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    // Tangent line
    ctx.strokeStyle = "#C87D55";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px - 60, py + (innerSlope * 6));
    ctx.lineTo(px + 60, py - (innerSlope * 6));
    ctx.stroke();

    ctx.fillStyle = isDark ? "#F4F0EA" : "#1E1C1A";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("tangent at x", px - 35, py - 14);

    // Total slope annotation
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`TOTAL SLOPE = OUTER × INNER (${(outerSlope * innerSlope).toFixed(1)})`, 340, 245);
  }, [innerSlope, outerSlope, positionX, theme]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-8 font-sans space-y-7 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-md border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center text-xs font-black">LL</span>
          <h1 className="text-3xl font-serif font-black text-[#1E1C1A] dark:text-[#F4F0EA]">
            Simulation lab
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-bold border border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA]">
            CHAIN RULE
          </span>
        </div>
        <span className="text-xs font-bold text-[#3D7953] dark:text-[#4E9A6F]">
          Run by Visualizer
        </span>
      </div>

      {/* Main Simulation Layout (Matching Page 22) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Canvas & Timeline Controls (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-6 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-4">
          <canvas
            ref={canvasRef}
            width={560}
            height={280}
            className="w-full rounded-2xl border border-[#1E1C1A]/20 dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416]"
          />

          <div className="flex items-center gap-3 pt-2">
            <button className="w-10 h-10 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]">
              <Play size={16} />
            </button>
            <button className="w-10 h-10 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]">
              <Pause size={16} />
            </button>
            <button
              onClick={() => {
                setInnerSlope(3);
                setOuterSlope(2);
                setPositionX(50);
              }}
              className="w-10 h-10 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Right Controls & Predict First (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Sliders Box */}
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-6 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] mb-1">
                <span>INNER SLOPE g'(x)</span>
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
                <span>OUTER SLOPE f'(u)</span>
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

            <div>
              <div className="flex justify-between text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] mb-1">
                <span>POSITION x</span>
                <span>{positionX}</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={positionX}
                onChange={(e) => setPositionX(parseInt(e.target.value))}
                className="w-full accent-[#3D7953]"
              />
            </div>
          </div>

          {/* PREDICT FIRST Card (Matching Page 22) */}
          <div className="bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-6 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C87D55] block">
              PREDICT FIRST
            </span>

            <p className="font-serif font-bold text-sm text-[#1E1C1A] dark:text-[#F4F0EA] leading-relaxed">
              If you double the inner slope, the total slope will...
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "double", label: "Double" },
                { id: "same", label: "Stay the same" },
                { id: "add", label: "Add a bit" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPrediction(opt.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-all ${
                    prediction === opt.id
                      ? "bg-[#C87D55] text-white shadow-[1px_1px_0px_#1E1C1A] dark:shadow-[1px_1px_0px_#000000]"
                      : "bg-white dark:bg-[#141416] text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setInnerSlope(innerSlope * 2);
                setHasCompared(true);
              }}
              className="w-full py-2.5 rounded-xl bg-[#C87D55] text-white font-bold text-xs border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45]"
            >
              Run it and compare
            </button>

            {hasCompared && (
              <p className="text-xs font-bold text-[#3D7953] dark:text-[#4E9A6F] bg-[#E8F5E9] dark:bg-[#1C2C22] p-2.5 rounded-xl border border-[#3D7953] dark:border-[#4E9A6F] flex items-center gap-1.5">
                <Check size={14} strokeWidth={3} className="shrink-0" />
                <span>Correct! Because slopes multiply, doubling g'(x) exactly doubles the product dy/dx.</span>
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Bottom Bar: Natural Language Prompt + Pin Button (Page 22) */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={agentPrompt}
          onChange={(e) => setAgentPrompt(e.target.value)}
          placeholder="Tell the agent what to change, e.g. use three links"
          className="flex-1 px-5 py-3 rounded-2xl bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] focus:outline-none"
        />
        <button
          onClick={() => {
            alert("Simulation pinned to Chain Rule notebook!");
            setLocation("/notebook");
          }}
          className="px-6 py-3 rounded-2xl bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] flex items-center gap-2"
        >
          <Pin size={14} /> Pin to notebook
        </button>
      </div>

    </div>
  );
};
