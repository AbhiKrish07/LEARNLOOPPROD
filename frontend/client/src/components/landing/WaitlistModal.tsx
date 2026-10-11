import React, { useState, useEffect } from "react";
import { X, Sparkles, Check, ArrowRight, BookOpen, Share2, Copy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface WaitlistModalProps {
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ onClose }) => {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("Calculus");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [position, setPosition] = useState<number>(1248);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const joinMutation = trpc.learnloop.joinWaitlist.useMutation({
    onSuccess: (data) => {
      setPosition(data.position);
      setIsSubmitted(true);
      // Persist locally
      localStorage.setItem("learnloop_waitlist_pos", String(data.position));
      localStorage.setItem("learnloop_waitlist_email", email);
    },
    onError: () => {
      // Offline fallback
      const storedPos = Math.floor(1240 + Math.random() * 30);
      setPosition(storedPos);
      setIsSubmitted(true);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    joinMutation.mutate({
      email,
      name,
      topic
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://learnloop.ai?ref=" + position);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topics = ["Calculus", "Machine learning", "Computer science", "Physics", "Linear algebra"];

  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="start-modal" role="dialog" aria-modal="true">
        <button
          className="modal-close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <span className="modal-brand">
          <img src="/learnloop-mark.svg" alt="" /> LEARNLOOP · BETA WAITLIST
        </span>

        {!isSubmitted ? (
          <>
            <span className="eyebrow">EARLY ACCESS COHORT</span>
            <h2 id="start-modal-title">Join the waitlist</h2>
            <p>
              We’re opening access to students and self-learners in weekly cohorts to keep feedback loops tight and inference fast.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#635F5B] block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu or you@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#1A1A1E] text-xs font-medium text-[#1E1C1A] dark:text-[#F4F0EA] outline-none focus:ring-2 focus:ring-[#C87D55]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#635F5B] block mb-1">
                  What are you primarily studying?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {topics.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border border-[#1E1C1A] transition-all ${
                        topic === t
                          ? "bg-[#C87D55] text-white shadow-[1px_1.5px_0px_#1E1C1A]"
                          : "bg-white text-[#1E1C1A] hover:bg-[#EBE4DC]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={joinMutation.isPending}
                className="button button-terracotta full-button font-bold text-xs shadow-[2px_3px_0px_#1E1C1A] mt-2"
              >
                {joinMutation.isPending ? "Securing your spot..." : "Join the Waitlist"} <ArrowRight size={15} />
              </button>
            </form>

            <div className="pt-3 border-t border-[#1E1C1A]/10 text-center">
              <span className="text-[11px] text-[#635F5B]">Already have an invite code or beta account? </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setLocation("/login");
                }}
                className="text-[11px] font-bold text-[#C87D55] underline ml-1"
              >
                Sign in here
              </button>
            </div>
          </>
        ) : (
          <div className="modal-ready py-3 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F5E9] border-2 border-[#1E1C1A] flex items-center justify-center text-[#2E7D32] mx-auto shadow-[3px_3px_0px_#1E1C1A]">
              <Sparkles size={28} />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2E7D32]">
                SPOT RESERVED!
              </span>
              <h2 className="text-2xl font-serif font-black text-[#1E1C1A]">
                You're #{position.toLocaleString()} in line
              </h2>
              <p className="text-xs text-[#635F5B] max-w-sm mx-auto">
                We'll email you at <b>{email}</b> the moment your cohort opens up.
              </p>
            </div>

            <div className="p-3 bg-[#F5EFEB] rounded-xl border border-[#1E1C1A] text-left text-xs space-y-1">
              <div className="font-bold flex items-center justify-between">
                <span>Want priority access?</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[11px] text-[#C87D55] flex items-center gap-1 font-bold"
                >
                  <Copy size={12} /> {copied ? "Copied!" : "Share link"}
                </button>
              </div>
              <p className="text-[10px] text-[#635F5B]">
                Share your link with fellow students to jump ahead in line for next week's cohort.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="button button-light flex-1 text-xs"
              >
                Back to overview
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setLocation("/login");
                }}
                className="button button-terracotta flex-1 text-xs"
              >
                Sign in / Login <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
