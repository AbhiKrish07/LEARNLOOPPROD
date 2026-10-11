import React from "react";
import { useLocation } from "wouter";
import { Sprout } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#F5EFEB] dark:bg-[#0E0E10] flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md text-center space-y-6">
        
        {/* Two Disconnected Neurons Illustration (Matching Page 6) */}
        <div className="flex items-center justify-center gap-4 py-2">
          {/* Green neuron */}
          <div className="w-12 h-12 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#3D7953] dark:bg-[#8FD5A6] flex items-center justify-center text-white dark:text-[#1E1C1A] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
            <Sprout size={18} strokeWidth={2.5} />
          </div>
          {/* Dashed connector */}
          <div className="w-12 border-t-2 border-dashed border-[#1E1C1A] dark:border-[#3A3A44]" />
          {/* Gray neuron */}
          <div className="w-10 h-10 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-gray-400 dark:bg-[#2C2C34] flex items-center justify-center text-white dark:text-gray-400 text-xs shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
            ?
          </div>
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-[#635F5B] dark:text-[#9E9A92] block">
          404
        </span>

        <div className="space-y-1.5">
          <h1 className="text-3xl font-serif font-black text-[#1E1C1A] dark:text-[#F4F0EA]">
            This page wandered off
          </h1>
          <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium leading-relaxed max-w-xs mx-auto">
            The link may be old, or the page was moved. Your notebooks are safe.
          </p>
        </div>

        {/* Buttons (Matching Page 6) */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setLocation("/library")}
            className="px-5 py-2.5 rounded-xl bg-[#C87D55] text-white font-bold text-xs border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45]"
          >
            Back to notebooks
          </button>
          <button
            onClick={() => setLocation("/search")}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] font-bold text-xs border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34]"
          >
            Search
          </button>
        </div>

      </div>
    </div>
  );
}
