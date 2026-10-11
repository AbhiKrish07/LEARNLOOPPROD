import React, { useState } from 'react';
import { Sliders, Sparkles, PlusCircle } from 'lucide-react';

interface Props {
  onAddObservation?: (text: string) => void;
}

export const ChainRuleVisualizer: React.FC<Props> = ({ onAddObservation }) => {
  const [x, setX] = useState<number>(2);
  const [innerMultiplier, setInnerMultiplier] = useState<number>(3); // g(x) = k * x

  // g(x) = k * x
  const gVal = innerMultiplier * x;
  // f(g) = g^2
  const fVal = Math.pow(gVal, 2);

  // Derivatives
  const dg_dx = innerMultiplier;
  const df_dg = 2 * gVal;
  const df_dx = df_dg * dg_dx;

  const handleAddNote = () => {
    const observation = `Simulation Observation [Chain Rule]: At x=${x}, g(x)=${innerMultiplier}x=${gVal}, dg/dx=${dg_dx}, df/dg=${df_dg}. Total rate df/dx = ${df_dg} * ${dg_dx} = ${df_dx}. Rates multiply!`;
    if (onAddObservation) {
      onAddObservation(observation);
    }
  };

  return (
    <div className="my-6 p-5 rounded-xl border border-[#E7E5DF] bg-[#FDFCF9] text-[#202225] shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E7E5DF] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#18A999]/10 text-[#18A999]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#202225]">Chain Rule Rate Composition Visualizer</h4>
            <p className="text-xs text-[#73777D]">Nested function composition: f(g(x)) where g(x) = {innerMultiplier}x and f(g) = g²</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#5B5CE2]/10 text-[#5B5CE2]">
          Interactive Simulation
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="p-3 bg-white rounded-lg border border-[#E7E5DF]">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span>Input Variable (x):</span>
            <span className="font-mono text-[#5B5CE2]">{x.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.5"
            value={x}
            onChange={(e) => setX(parseFloat(e.target.value))}
            className="w-full accent-[#5B5CE2]"
          />
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#E7E5DF]">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span>Inner Rate Constant (k in g(x)=kx):</span>
            <span className="font-mono text-[#18A999]">{innerMultiplier}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={innerMultiplier}
            onChange={(e) => setInnerMultiplier(parseInt(e.target.value))}
            className="w-full accent-[#18A999]"
          />
        </div>
      </div>

      {/* Mathematical Flow Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="p-3 bg-[#18A999]/5 rounded-lg border border-[#18A999]/20">
          <div className="text-xs text-[#73777D] mb-1">Inner Rate (dg/dx)</div>
          <div className="text-lg font-bold font-mono text-[#18A999]">{dg_dx}</div>
          <div className="text-[11px] text-[#73777D] mt-1">g({x}) = {gVal}</div>
        </div>

        <div className="p-3 bg-[#5B5CE2]/5 rounded-lg border border-[#5B5CE2]/20">
          <div className="text-xs text-[#73777D] mb-1">Outer Rate (df/dg)</div>
          <div className="text-lg font-bold font-mono text-[#5B5CE2]">{df_dg}</div>
          <div className="text-[11px] text-[#73777D] mt-1">f({gVal}) = {fVal}</div>
        </div>

        <div className="p-3 bg-[#3B8C68]/10 rounded-lg border border-[#3B8C68]/30">
          <div className="text-xs text-[#3B8C68] font-semibold mb-1">Total Rate (df/dx)</div>
          <div className="text-lg font-bold font-mono text-[#3B8C68]">{df_dx}</div>
          <div className="text-[11px] text-[#73777D] mt-1">{df_dg} × {dg_dx} = {df_dx}</div>
        </div>
      </div>

      {/* What to Notice Box */}
      <div className="p-3.5 bg-[#F8F7F3] rounded-lg border border-[#E7E5DF] text-xs text-[#202225] flex items-start gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#D99024] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">What to notice:</strong> As you change x or k, notice that the total derivative <code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">df/dx</code> is exactly the <em>multiplication</em> of the outer rate (<code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">df/dg = {df_dg}</code>) and inner rate (<code className="bg-white px-1 py-0.5 rounded border border-[#E7E5DF]">dg/dx = {dg_dx}</code>), never their sum!
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
