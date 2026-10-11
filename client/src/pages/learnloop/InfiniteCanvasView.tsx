import React, { useState } from "react";
import { ArrowLeft, Share2, Layers, Move, Type, Image, Plus, Minus, Sprout } from "lucide-react";
import { useLocation } from "wouter";
import { ShareModal } from "@/components/learnloop/ShareModal";

export const InfiniteCanvasView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [zoom, setZoom] = useState(62);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#EBE4DC] dark:bg-[#0E0E10] text-[#1E1C1A] dark:text-[#F4F0EA] font-sans overflow-hidden select-none relative">
      
      {/* Top Header */}
      <header className="h-14 bg-white dark:bg-[#121214] border-b-2 border-[#1E1C1A] dark:border-[#2C2C34] px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/library")}
            className="w-8 h-8 rounded-lg border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] flex items-center justify-center hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
          </button>
          <div className="text-xs font-black text-[#1E1C1A] dark:text-[#F4F0EA] flex items-center gap-1.5">
            <span className="text-[#635F5B] dark:text-[#9E9A92]">Calculus</span>
            <span>/</span>
            <span>Chain Rule canvas</span>
          </div>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="px-4 py-1.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] text-xs font-bold hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000]"
        >
          Share
        </button>
      </header>

      {/* Main Canvas Body with Dot Grid */}
      <div className="flex-1 relative overflow-hidden [background-image:radial-gradient(#1E1C1A20_1px,transparent_1px)] dark:[background-image:radial-gradient(#4A4A5640_1px,transparent_1px)] [background-size:24px_24px]">
        
        {/* Left Floating Tool Rail (Matching Page 15) */}
        <div className="absolute left-6 top-6 bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl p-1.5 shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-1 z-10 flex flex-col items-center">
          <button className="p-2 rounded-xl bg-[#C87D55] text-white"><Move size={16} /></button>
          <button className="p-2 rounded-xl hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] text-[#1E1C1A] dark:text-[#F4F0EA]"><Layers size={16} /></button>
          <button className="p-2 rounded-xl hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] text-[#1E1C1A] dark:text-[#F4F0EA]"><Type size={16} /></button>
          <button className="p-2 rounded-xl hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] text-[#1E1C1A] dark:text-[#F4F0EA]"><Image size={16} /></button>
        </div>

        {/* Curved Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M 280 220 C 350 220, 380 260, 440 260" stroke="currentColor" className="text-[#1E1C1A] dark:text-[#3A3A44]" strokeWidth="2" fill="none" strokeDasharray="3,3" />
          <path d="M 280 340 C 360 340, 390 280, 440 280" stroke="currentColor" className="text-[#1E1C1A] dark:text-[#3A3A44]" strokeWidth="2" fill="none" strokeDasharray="3,3" />
          <path d="M 580 240 C 640 240, 680 180, 720 180" stroke="currentColor" className="text-[#1E1C1A] dark:text-[#3A3A44]" strokeWidth="2" fill="none" strokeDasharray="3,3" />
        </svg>

        {/* Group Box: Foundations */}
        <div className="absolute left-32 top-20 border-2 border-dashed border-[#1E1C1A] dark:border-[#3A3A44] rounded-3xl p-6 bg-white/40 dark:bg-[#18181C]/60 space-y-4">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#3D7953] dark:bg-[#4E9A6F] text-white">
            Foundations
          </span>

          {/* Composition Card */}
          <div className="w-52 p-4 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
            <h4 className="font-serif font-black text-sm text-[#1E1C1A] dark:text-[#F4F0EA]">Composition</h4>
            <div className="h-1 w-12 bg-gray-200 dark:bg-[#2C2C34] rounded mt-2" />
          </div>

          {/* Chain Rule Card */}
          <div className="w-52 p-4 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#FFE57F]/40 dark:bg-[#2B2314] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
            <h4 className="font-serif font-black text-sm text-[#1E1C1A] dark:text-[#F4F0EA]">Chain Rule</h4>
            <div className="h-1 w-16 bg-gray-300 dark:bg-[#3A3A44] rounded mt-2" />
          </div>

          {/* Source PDF Card */}
          <div className="w-52 p-4 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
            <span className="text-xs font-bold text-[#635F5B] dark:text-[#9E9A92]">[source].pdf</span>
          </div>
        </div>

        {/* Simulation Card Node */}
        <div className="absolute left-[440px] top-[220px] w-64 p-5 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] space-y-3">
          <span className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA] block">Simulation: chain rule</span>
          <div className="h-16 w-full rounded-xl border border-[#1E1C1A]/20 dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416] flex items-center justify-center">
            <svg width="180" height="40" viewBox="0 0 180 40">
              <path d="M 10 35 Q 90 25 170 5" stroke="#4E9A6F" strokeWidth="2.5" fill="none" />
            </svg>
          </div>
        </div>

        {/* Backpropagation Node */}
        <div className="absolute left-[440px] top-[140px] px-4 py-1.5 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#EBD37A] text-xs font-black shadow-[1.5px_1.5px_0px_#1E1C1A] dark:shadow-[1.5px_1.5px_0px_#000000] text-[#1E1C1A]">
          Backpropagation
        </div>

        {/* Right Inspector Drawer (Matching Page 15) */}
        <div className="absolute right-8 top-8 w-80 bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-6 shadow-[4px_4px_0px_#1E1C1A] dark:shadow-[4px_4px_0px_#000000] space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
            SELECTED · CHAIN RULE
          </span>

          <h3 className="font-serif font-black text-lg text-[#1E1C1A] dark:text-[#F4F0EA] leading-snug">
            Slopes on a path <span className="text-[#3D7953] dark:text-[#4E9A6F]">multiply along the chain.</span>
          </h3>

          <ul className="space-y-2 text-xs font-medium text-[#1E1C1A] dark:text-[#F4F0EA] leading-relaxed">
            <li className="flex items-start gap-2">
              <span>•</span> <span>Name the inner and outer function.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span> <span>Outer slope at g(x), times inner slope.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span> <span>Your slip: adding the two slopes.</span>
            </li>
          </ul>

          <button
            onClick={() => setLocation("/notebook")}
            className="w-full py-2.5 rounded-xl bg-[#C87D55] text-white text-xs font-bold border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45]"
          >
            Open page
          </button>
        </div>

        {/* Bottom Zoom & Mascot (Matching Page 15) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-full px-3 py-1 shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] text-xs font-black text-[#1E1C1A] dark:text-[#F4F0EA]">
            <button onClick={() => setZoom(Math.max(20, zoom - 10))}><Minus size={14} /></button>
            <span>{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))}><Plus size={14} /></button>
          </div>

          <div
            onClick={() => setLocation("/notebook")}
            className="w-10 h-10 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white flex items-center justify-center shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] cursor-pointer"
          >
            <Sprout size={18} strokeWidth={2.5} />
          </div>
        </div>

      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}

    </div>
  );
};
