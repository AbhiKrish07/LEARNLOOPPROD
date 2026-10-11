import React, { useState } from "react";
import { useLocation } from "wouter";

export const VerifyEmailView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [digits, setDigits] = useState(["4", "8", "1", "9", "", ""]);

  const handleVerify = () => {
    setLocation("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] dark:bg-[#0E0E10] flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md text-center space-y-6">
        
        {/* Mascot Icon */}
        <div className="w-12 h-12 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#C87D55] text-white font-black text-sm flex items-center justify-center mx-auto shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
          LL
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-black text-[#1E1C1A] dark:text-[#F4F0EA]">
            Check your email
          </h1>
          <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] font-medium">
            We sent a 6-digit code to <span className="font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">abhinav@learnloop.ai</span>. It expires soon.
          </p>
        </div>

        {/* 6 Digit Inputs (Matching Page 3) */}
        <div className="flex items-center justify-center gap-3">
          {digits.map((d, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={d}
              onChange={(e) => {
                const next = [...digits];
                next[idx] = e.target.value;
                setDigits(next);
              }}
              className="w-12 h-14 text-center text-xl font-mono font-black border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-2xl bg-white dark:bg-[#1A1A1E] text-[#1E1C1A] dark:text-[#F4F0EA] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] focus:outline-none focus:ring-2 focus:ring-[#C87D55]"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="w-full py-3.5 rounded-2xl bg-[#C87D55] text-white font-bold text-sm border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#B26B45] transition-all"
        >
          Verify
        </button>

        <p className="text-xs text-[#635F5B] dark:text-[#9E9A92]">
          Didn't get it?{" "}
          <button onClick={() => alert("Code resent!")} className="font-bold text-[#1E1C1A] dark:text-[#F4F0EA] underline">
            Resend code
          </button>
        </p>

      </div>
    </div>
  );
};
