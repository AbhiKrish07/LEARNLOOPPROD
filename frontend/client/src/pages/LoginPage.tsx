import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, BookOpen, Check, Lock, Mail, Sparkles, User, ArrowLeft, ShieldCheck } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const trimmedEmail = email.trim().toLowerCase();

      // Check if this user has already completed onboarding before
      const knownUsers = JSON.parse(localStorage.getItem("learnloop_known_users") || "[]");
      const isExistingUser = mode === "signin" && (
        knownUsers.includes(trimmedEmail) || 
        trimmedEmail.includes("returning") || 
        trimmedEmail.includes("old") || 
        trimmedEmail === "learner@learnloop.ai"
      );

      const userProfile = {
        id: `u-${Date.now()}`,
        email: trimmedEmail,
        name: name.trim() || trimmedEmail.split("@")[0],
        onboarded: isExistingUser
      };

      localStorage.setItem("learnloop_user", JSON.stringify(userProfile));

      if (isExistingUser) {
        // OLD / RETURNING USER -> Direct to the app
        localStorage.setItem("onboarded", "true");
        setLocation("/library");
      } else {
        // NEW SIGN IN -> Direct to onboarding
        if (!knownUsers.includes(trimmedEmail)) {
          knownUsers.push(trimmedEmail);
          localStorage.setItem("learnloop_known_users", JSON.stringify(knownUsers));
        }
        localStorage.removeItem("onboarded");
        setLocation("/onboarding");
      }
    }, 400);
  };

  const handleQuickNewStudent = () => {
    const userProfile = {
      id: `u-${Date.now()}`,
      email: "newstudent@learnloop.ai",
      name: "New Student",
      onboarded: false
    };
    localStorage.setItem("learnloop_user", JSON.stringify(userProfile));
    localStorage.removeItem("onboarded");
    setLocation("/onboarding");
  };

  const handleQuickExistingMember = () => {
    const userProfile = {
      id: "u-returning",
      email: "learner@learnloop.ai",
      name: "Alex",
      onboarded: true
    };
    localStorage.setItem("learnloop_user", JSON.stringify(userProfile));
    localStorage.setItem("onboarded", "true");
    setLocation("/library");
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] dark:bg-[#0E0E10] text-[#1E1C1A] dark:text-[#F4F0EA] flex flex-col justify-between p-6 select-none font-sans">
      
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#635F5B] dark:text-[#9E9A92] hover:text-[#1E1C1A] dark:hover:text-[#F4F0EA] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-2.5">
          <img src="/learnloop-mark.svg" alt="LearnLoop" className="w-8 h-8" />
          <span className="font-serif font-black text-xl tracking-tight text-[#1E1C1A] dark:text-[#F4F0EA]">
            LearnLoop
          </span>
        </div>

        <div className="w-24" /> {/* Spacer */}
      </header>

      {/* Main Card */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-[#FDFBF7] dark:bg-[#16161A] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-8 shadow-[6px_7px_0px_#1E1C1A] dark:shadow-[6px_7px_0px_#000000] space-y-6">
          
          {/* Brand Eyebrow */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border border-[#1E1C1A]/20 dark:border-[#2C2C34] bg-[#EBE4DC] dark:bg-[#222228] text-[#635F5B] dark:text-[#9E9A92]">
              <Sparkles size={11} className="text-[#C87D55]" />
              {mode === "signin" ? "WELCOME BACK" : "JOIN THE BETA"}
            </span>
            <h1 className="text-3xl font-serif font-black text-[#1E1C1A] dark:text-[#F4F0EA]">
              {mode === "signin" ? "Sign in to your notebook" : "Create your account"}
            </h1>
            <p className="text-xs text-[#635F5B] dark:text-[#9E9A92] leading-relaxed">
              {mode === "signin" 
                ? "Pick up right where your thinking left off." 
                : "Your notebook thinks with you. Start with a quick calibration."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#EBE4DC] dark:bg-[#222228] text-xs font-bold shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000]">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); }}
              className={`py-2 rounded-lg transition-all ${
                mode === "signin" 
                  ? "bg-[#FDFBF7] dark:bg-[#16161A] text-[#1E1C1A] dark:text-[#F4F0EA] shadow-sm" 
                  : "text-[#635F5B] dark:text-[#9E9A92] hover:text-[#1E1C1A]"
              }`}
            >
              Sign In (Existing)
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className={`py-2 rounded-lg transition-all ${
                mode === "signup" 
                  ? "bg-[#C87D55] text-white shadow-sm" 
                  : "text-[#635F5B] dark:text-[#9E9A92] hover:text-[#1E1C1A]"
              }`}
            >
              Sign Up (New)
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92] flex items-center gap-1.5">
                  <User size={13} /> Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-medium text-[#1E1C1A] dark:text-[#F4F0EA] outline-none focus:ring-2 focus:ring-[#C87D55]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92] flex items-center gap-1.5">
                <Mail size={13} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-medium text-[#1E1C1A] dark:text-[#F4F0EA] outline-none focus:ring-2 focus:ring-[#C87D55]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#635F5B] dark:text-[#9E9A92] flex items-center gap-1.5">
                <Lock size={13} /> Password or Beta Passkey
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-medium text-[#1E1C1A] dark:text-[#F4F0EA] outline-none focus:ring-2 focus:ring-[#C87D55]"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-[#C87D55] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[3px_3px_0px_#1E1C1A] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#B26B45] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? "Signing in..." : mode === "signin" ? "Sign In → Enter Notebook" : "Create Account → Start Onboarding"}
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Flow Indicator Info */}
          <div className="p-3 rounded-xl border border-[#1E1C1A]/20 dark:border-[#2C2C34] bg-[#F5EFEB]/70 dark:bg-[#1A1A1E] text-[11px] text-[#635F5B] dark:text-[#9E9A92] space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-[#1E1C1A] dark:text-[#F4F0EA]">
              <ShieldCheck size={14} className="text-[#3D7953]" /> 
              {mode === "signin" ? "Returning Member Flow:" : "New Member Flow:"}
            </span>
            <p>
              {mode === "signin" 
                ? "Existing users go directly to their Notebook Library. If it's your first time, we'll guide you through onboarding."
                : "New sign-ins start with the 3-step setup and calibration before opening your first book."}
            </p>
          </div>

          {/* Quick Demo Testing Shortcuts */}
          <div className="pt-2 border-t border-[#1E1C1A]/15 dark:border-[#2C2C34] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8A867F] block text-center">
              QUICK TESTING SHORTCUTS
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickNewStudent}
                className="p-2.5 rounded-xl border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#E8F5E9] dark:bg-[#1B2E1E] text-[#2E7D32] dark:text-[#81C784] font-bold text-[11px] hover:shadow-[2px_2px_0px_#1E1C1A] transition-all flex items-center justify-center gap-1.5"
                title="Tests brand new account -> goes to /onboarding"
              >
                <Sparkles size={13} />
                New User → Onboarding
              </button>

              <button
                type="button"
                onClick={handleQuickExistingMember}
                className="p-2.5 rounded-xl border border-[#1E1C1A] dark:border-[#2C2C34] bg-[#EDE7F6] dark:bg-[#251E38] text-[#5E35B1] dark:text-[#B39DDB] font-bold text-[11px] hover:shadow-[2px_2px_0px_#1E1C1A] transition-all flex items-center justify-center gap-1.5"
                title="Tests returning member -> goes directly to /library"
              >
                <BookOpen size={13} />
                Old User → App Direct
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#8A867F] py-4">
        Made for the wonderfully curious. © 2026 LearnLoop
      </footer>

    </div>
  );
};
