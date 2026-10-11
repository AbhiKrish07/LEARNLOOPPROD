import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Sprout } from "lucide-react";

export const LoadingView: React.FC = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/calibration");
    }, 1800);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-[#F5EFEB] dark:bg-[#0E0E10] flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md text-center space-y-6">
        
        {/* Animated Green Neuron Mascot with Rays (Matching Page 5) */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <svg className="w-full h-full animate-spin [animation-duration:8s]" viewBox="0 0 100 100">
            {/* Rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                x1="50"
                y1="50"
                x2={50 + 38 * Math.cos((angle * Math.PI) / 180)}
                y2={50 + 38 * Math.sin((angle * Math.PI) / 180)}
                stroke="currentColor"
                className="text-[#3D7953] dark:text-[#8FD5A6]"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className="absolute w-12 h-12 rounded-full bg-[#3D7953] dark:bg-[#8FD5A6] border-2 border-[#1E1C1A] dark:border-[#2C2C34] flex items-center justify-center text-white dark:text-[#1E1C1A]">
            <Sprout size={22} strokeWidth={2.5} />
          </div>
        </div>

        {/* Text & Underline */}
        <div className="space-y-2">
          <h2 className="font-serif font-black text-2xl text-[#1E1C1A] dark:text-[#F4F0EA]">
            Waking up your notebooks
          </h2>
          <div className="w-16 h-1 bg-[#C87D55] rounded-full mx-auto" />
        </div>

        {/* 3 Skeleton Shimmer Cards (Matching Page 5) */}
        <div className="flex items-center justify-center gap-3 pt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-24 h-16 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-gradient-to-r from-gray-200 via-gray-400 to-gray-700 dark:from-[#18181C] dark:via-[#222228] dark:to-[#18181C] animate-pulse shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]"
            />
          ))}
        </div>

      </div>
    </div>
  );
};
