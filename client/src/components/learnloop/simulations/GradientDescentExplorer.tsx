import React, { useState } from 'react';
import { Activity, Play, RotateCcw, PlusCircle } from 'lucide-react';

interface Props {
  onAddObservation?: (text: string) => void;
}

export const GradientDescentExplorer: React.FC<Props> = ({ onAddObservation }) => {
  const [w, setW] = useState<number>(-1.0);
  const [lr, setLr] = useState<number>(0.2); // learning rate
  const [history, setHistory] = useState<number[]>([-1.0]);

  // Loss function: L(w) = (w - 3)^2 + 1
  const loss = Math.pow(w - 3, 2) + 1;
  // Gradient: dL/dw = 2(w - 3)
  const grad = 2 * (w - 3);

  const handleStep = () => {
    const nextW = w - lr * grad;
    setW(nextW);
    setHistory(prev => [...prev.slice(-9), nextW]);
  };

  const handleReset = () => {
    setW(-1.0);
    setHistory([-1.0]);
  };

  const handleAddNote = () => {
    const note = `Simulation Observation [Gradient Descent]: Started at w=-1.0. With learning rate lr=${lr}, current w=${w.toFixed(3)}, Loss=${loss.toFixed(3)}, Grad=${grad.toFixed(3)}. Subtraction moves parameters downhill!`;
    if (onAddObservation) {
      onAddObservation(note);
    }
  };

  return (
    <div className="my-6 p-5 rounded-xl border border-[#E7E5DF] bg-[#FDFCF9] text-[#202225] shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E7E5DF] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#3B8C68]/10 text-[#3B8C68]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#202225]">Gradient Descent Loss Landscape Explorer</h4>
            <p className="text-xs text-[#73777D]">Objective: Minimize L(w) = (w - 3)² + 1 (Minimum loss at w = 3)</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#3B8C68]/10 text-[#3B8C68]">
          Optimization Visualizer
        </span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="p-3 bg-white rounded-lg border border-[#E7E5DF]">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span>Learning Rate (η):</span>
            <span className="font-mono text-[#5B5CE2]">{lr.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.1"
            step="0.05"
            value={lr}
            onChange={(e) => setLr(parseFloat(e.target.value))}
            className="w-full accent-[#5B5CE2]"
          />
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#E7E5DF] flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#73777D]">Current Weight (w):</div>
            <div className="text-lg font-bold font-mono text-[#202225]">{w.toFixed(3)}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleStep}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3B8C68] hover:bg-[#327758] text-white text-xs font-medium transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Step
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg border border-[#E7E5DF] hover:bg-[#F8F7F3] text-[#73777D] transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Numerical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="p-3 bg-white rounded-lg border border-[#E7E5DF]">
          <div className="text-xs text-[#73777D]">Current Loss L(w)</div>
          <div className="text-lg font-bold font-mono text-[#5B5CE2]">{loss.toFixed(3)}</div>
          <div className="text-[11px] text-[#73777D] mt-0.5">Target minimum: 1.000</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#E7E5DF]">
          <div className="text-xs text-[#73777D]">Gradient ∇L(w)</div>
          <div className="text-lg font-bold font-mono text-[#C9685A]">{grad.toFixed(3)}</div>
          <div className="text-[11px] text-[#73777D] mt-0.5">{grad > 0 ? 'Positive (points right)' : 'Negative (points left)'}</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#E7E5DF]">
          <div className="text-xs text-[#73777D]">Next Step Update</div>
          <div className="text-sm font-mono text-[#3B8C68] mt-1">
            w - η(∇L) = {w.toFixed(2)} - {(lr * grad).toFixed(2)}
          </div>
        </div>
      </div>

      {/* History Trace */}
      <div className="p-3 bg-white rounded-lg border border-[#E7E5DF] mb-4">
        <div className="text-xs text-[#73777D] mb-2 font-medium">Optimization Weight Trajectory:</div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {history.map((val, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 rounded text-xs font-mono border ${
                idx === history.length - 1
                  ? 'bg-[#3B8C68]/15 border-[#3B8C68] text-[#3B8C68] font-bold'
                  : 'bg-[#F8F7F3] border-[#E7E5DF] text-[#73777D]'
              }`}
            >
              {val.toFixed(2)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleAddNote}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B5CE2] hover:bg-[#4b4cd1] text-white text-xs font-medium transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add observation to notebook
        </button>
      </div>
    </div>
  );
};
