import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";

interface ShareModalProps {
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [anyoneWithLink, setAnyoneWithLink] = useState(true);
  const [allowComments, setAllowComments] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E0E10]/70 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1A1A1E] border-2 border-[#1E1C1A] dark:border-[#2C2C34] rounded-3xl p-6 shadow-[4px_4px_0px_#1E1C1A] dark:shadow-[4px_4px_0px_#000000] space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-xl font-bold font-serif text-[#1E1C1A] dark:text-[#F4F0EA]">
            Share "Chain Rule"
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] flex items-center justify-center text-[#1E1C1A] dark:text-[#F4F0EA] hover:bg-[#EBE4DC] dark:hover:bg-[#2C2C34] transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Add People By Email */}
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Add people by email"
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-white dark:bg-[#141416] text-[#1E1C1A] dark:text-[#F4F0EA] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C87D55]"
          />
          <button
            onClick={() => {
              if (email) {
                alert(`Invite sent to ${email}`);
                setEmail("");
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-[#C87D55] text-white font-bold text-xs border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#B26B45]"
          >
            Invite
          </button>
        </div>

        {/* Anyone with the link Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416]">
          <div>
            <h4 className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">Anyone with the link</h4>
            <p className="text-[11px] text-[#635F5B] dark:text-[#9E9A92]">Can view the page, not your learning memory</p>
          </div>
          <button
            onClick={() => setAnyoneWithLink(!anyoneWithLink)}
            className={`w-11 h-6 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-colors p-0.5 relative ${
              anyoneWithLink ? "bg-[#3D7953] dark:bg-[#4E9A6F]" : "bg-gray-200 dark:bg-[#2C2C34]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white border border-[#1E1C1A] dark:border-[#2C2C34] transition-transform ${
                anyoneWithLink ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Allow Comments Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-[#1E1C1A] dark:border-[#2C2C34] bg-[#FDFBF7] dark:bg-[#141416]">
          <span className="text-xs font-bold text-[#1E1C1A] dark:text-[#F4F0EA]">Allow comments</span>
          <button
            onClick={() => setAllowComments(!allowComments)}
            className={`w-11 h-6 rounded-full border-2 border-[#1E1C1A] dark:border-[#2C2C34] transition-colors p-0.5 relative ${
              allowComments ? "bg-[#3D7953] dark:bg-[#4E9A6F]" : "bg-gray-200 dark:bg-[#2C2C34]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white border border-[#1E1C1A] dark:border-[#2C2C34] transition-transform ${
                allowComments ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Copy Link Action */}
        <button
          onClick={handleCopyLink}
          className="w-full py-3 rounded-xl bg-[#FDFBF7] dark:bg-[#141416] text-[#1E1C1A] dark:text-[#F4F0EA] font-bold text-xs border-2 border-[#1E1C1A] dark:border-[#2C2C34] shadow-[2px_2px_0px_#1E1C1A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#EBE4DC] dark:hover:bg-[#222228] transition-colors flex items-center justify-center gap-2"
        >
          {copied ? <Check size={14} className="text-[#3D7953] dark:text-[#4E9A6F]" /> : <Copy size={14} />}
          <span>{copied ? "Link copied!" : "Copy link"}</span>
        </button>

      </div>
    </div>
  );
};
