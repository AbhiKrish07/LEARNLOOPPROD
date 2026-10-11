import { useState } from "react";
import { ArrowUpRight, Check, PenLine, Sparkles } from "lucide-react";

export default function NotebookHero() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: -y * 5, y: x * 7 });
  }

  return (
    <div className="hero-art-wrap" aria-label="Interactive LearnLoop notebook preview">
      <div className="hero-orbit orbit-one" aria-hidden="true" />
      <div className="hero-orbit orbit-two" aria-hidden="true" />
      <div className="hero-sticker sticker-note"><span>oh, I see it</span><span className="sticker-star">✳</span></div>
      <div className="hero-sticker sticker-agent"><span className="agent-dot"><Sparkles size={13} /></span> Coach is here</div>
      <div
        className="notebook-tilt"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="notebook-shell">
          <div className="notebook-topbar">
            <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
            <span>Calculus <b>/</b> Chain Rule</span>
            <button className="mini-tool" type="button" aria-label="Pen tool preview"><PenLine size={15} /></button>
          </div>
          <div className="notebook-body">
            <aside className="notebook-rail" aria-hidden="true">
              <span className="rail-active">✎</span><span>◌</span><span>⌁</span><span>▱</span>
            </aside>
            <div className="paper-page">
              <div className="paper-eyebrow">TODAY'S THINKING <span>01</span></div>
              <h3>Chain Rule</h3>
              <p className="paper-definition">When one function lives inside another, the slopes travel together.</p>
              <div className="work-step"><span>1</span><code>u = 3x + 1, &nbsp; y = u²</code></div>
              <div className="work-step"><span>2</span><code>dy/du = 2u</code></div>
              <div className="work-step"><span>3</span><code>du/dx = 3</code></div>
              <div className="work-step flagged-step"><span>4</span><code>dy/dx = 2u + 3</code><em>THE SLIP IS HERE</em></div>
              <div className="paper-scribble" aria-hidden="true">multiply, not add ↗</div>
            </div>
            <div className="coach-note">
              <div className="coach-note-top"><span className="coach-avatar"><Sparkles size={15} /></span><span>SPOTTER</span><span className="online-dot" /></div>
              <p><strong>Found the exact step.</strong> Along a chain, the rates multiply.</p>
              <div className="coach-rule"><span>outer</span><b>×</b><span>inner</span></div>
              <button type="button" className="note-link" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>See how it works <ArrowUpRight size={13} /></button>
            </div>
          </div>
          <div className="notebook-foot"><span><span className="sync-dot" /> All changes saved</span><span>Page 01 <b>·</b> 2 min ago</span></div>
        </div>
      </div>
      <div className="float-pill pill-proof"><Check size={13} /> Built from your notes</div>
      <div className="float-pill pill-growth"><span className="growth-spark">✳</span> Evidence, not streaks</div>
    </div>
  );
}
