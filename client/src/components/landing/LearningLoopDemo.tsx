import { useState } from "react";
import { ArrowRight, Check, Lightbulb, RotateCcw, Sparkles } from "lucide-react";

type DemoStep = "spot" | "why" | "visualize" | "retest" | "complete";
const steps: { id: DemoStep; label: string; number: string }[] = [
  { id: "spot", label: "Find the slip", number: "01" },
  { id: "why", label: "Show me why", number: "02" },
  { id: "visualize", label: "Simulate it", number: "03" },
  { id: "retest", label: "Try again", number: "04" },
];

export default function LearningLoopDemo() {
  const [active, setActive] = useState<DemoStep>("spot");
  const [inner, setInner] = useState(3);
  const [outer, setOuter] = useState(2);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const correct = /15|3\s*\(?5x|5x.*2.*3|chain/i.test(answer);

  function selectStep(step: DemoStep) {
    setActive(step);
    setChecked(false);
  }

  return (
    <div className="loop-demo">
      <div className="demo-side">
        <div className="demo-kicker"><span className="tiny-ll">LL</span> A SMALL LEARNING LOOP</div>
        <h3>Not more answers.<br /><em>Better thinking.</em></h3>
        <p className="demo-intro">Tap through a real example. The coach stays close to your work, from the first wrong turn to the next right one.</p>
        <div className="loop-step-list" role="tablist" aria-label="Explore the learning loop">
          {steps.map((step) => (
            <button key={step.id} role="tab" aria-selected={active === step.id || (active === "complete" && step.id === "retest")} className={`loop-step-button ${active === step.id || (active === "complete" && step.id === "retest") ? "is-active" : ""}`} onClick={() => selectStep(step.id)}>
              <span className="step-number">{active === "complete" && step.id === "retest" ? <Check size={14} /> : step.number}</span><span>{step.label}</span><ArrowRight size={15} className="step-arrow" />
            </button>
          ))}
        </div>
        <div className="demo-proof"><span className="proof-icon"><Sparkles size={14} /></span><span><b>Grounded in your page</b><small>No context switching. No generic score.</small></span></div>
      </div>

      <div className="demo-window" aria-live="polite">
        <div className="demo-window-bar"><div className="window-dots" aria-hidden="true"><i /><i /><i /></div><div><span className="mini-crumb">Calculus</span><b>/</b><span>Chain Rule</span></div><span className="page-count">PAGE 01</span></div>
        <div className="demo-window-content">
          <div className="demo-working">
            <div className="demo-page-title"><span>YOUR WORKING</span><span className="ink-label">✎ &nbsp;Ink + text</span></div>
            <div className="demo-equation"><span className="equation-label">1</span><span>Let <i>u</i> = 3x + 1, so y = u²</span></div>
            <div className="demo-equation"><span className="equation-label">2</span><span>dy/du = 2u</span></div>
            <div className="demo-equation"><span className="equation-label">3</span><span>du/dx = 3</span></div>
            <div className={`demo-equation break-equation ${active === "spot" ? "break-pulse" : ""}`}><span className="equation-label">4</span><span>dy/dx = 2u + 3</span><small>THE BREAK IS HERE</small></div>
            <div className="demo-equation faded-equation"><span className="equation-label">5</span><span>= 6x + 5</span></div>
          </div>

          <div className="coach-panel">
            <div className="coach-panel-head"><span className="coach-orb"><Sparkles size={15} /></span><div><span className="eyebrow">{active === "visualize" ? "VISUALIZER" : active === "retest" || active === "complete" ? "RECALL" : "SPOTTER"}</span><b>{active === "visualize" ? "See the slopes" : active === "retest" || active === "complete" ? "Fresh problem" : "I noticed a slip"}</b></div><span className="online-dot" /></div>

            {active === "spot" && <>
              <div className="coach-highlight"><span>STEP 4</span><b>You added the two rates. Along a chain, they multiply.</b><small>Same idea as your gear-ratio note.</small></div>
              <p className="coach-body-copy">Your example already has both pieces. They need to travel together.</p>
              <div className="coach-actions"><button type="button" className="button button-ink" onClick={() => selectStep("why")}>Show me why</button><button type="button" className="button button-terracotta" onClick={() => selectStep("visualize")}>Simulate it</button></div>
            </>}

            {active === "why" && <>
              <div className="why-card"><span className="eyebrow">THE CHAIN RULE</span><div className="math-line">dy/dx = <i>dy/du</i> <b>×</b> <i>du/dx</i></div><p>First y changes with u. Then u changes with x. The total change carries both rates.</p></div>
              <div className="gear-analogy"><span>⚙</span><span><b>Think gear ratios</b><small>Two gears multiply their turns; they don't add them.</small></span></div>
              <button type="button" className="button button-terracotta full-button" onClick={() => selectStep("visualize")}>See the slopes move <ArrowRight size={15} /></button>
            </>}

            {active === "visualize" && <>
              <div className="sim-plot" aria-label={`Inner slope ${inner}, outer slope ${outer}, product ${inner * outer}`}>
                <div className="plot-axis" />
                <svg viewBox="0 0 310 118" role="img" aria-label="Curved function showing the chain rule">
                  <path d="M10 100 C 62 99, 66 28, 133 49 S 221 106, 300 14" fill="none" stroke="#1c241c" strokeWidth="3" strokeLinecap="round" />
                  <path d="M10 105 C 61 104, 74 46, 135 57 S 230 100, 300 39" fill="none" stroke="#9ac8ad" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
                  <circle cx={75 + inner * 15} cy={66 - outer * 5} r="6" fill="#d58c69" stroke="#fff9ef" strokeWidth="3" />
                </svg>
                <div className="plot-legend"><span><i /> f(g(x))</span><span><i className="legend-dash" /> g(x)</span></div>
              </div>
              <div className="sim-controls">
                <label>Inner slope <b>{inner}</b><input type="range" min="1" max="6" value={inner} onChange={(event) => setInner(Number(event.target.value))} aria-label="Adjust inner slope" /></label>
                <label>Outer slope <b>{outer}</b><input type="range" min="1" max="6" value={outer} onChange={(event) => setOuter(Number(event.target.value))} aria-label="Adjust outer slope" /></label>
              </div>
              <div className="product-result"><span>Total slope = outer × inner</span><b>{outer} × {inner} = {outer * inner}</b></div>
              <button type="button" className="button button-terracotta full-button" onClick={() => selectStep("retest")}>Got it. Retest me <ArrowRight size={15} /></button>
            </>}

            {active === "retest" && <>
              <div className="retest-prompt"><span className="eyebrow">SAME IDEA, NEW NUMBERS</span><b>Differentiate y = (5x − 2)³.</b><small>Start by naming the inner and outer function.</small></div>
              <label className="answer-label" htmlFor="retest-answer">YOUR FIRST STEP</label>
              <textarea id="retest-answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false); }} placeholder="Let u = …" rows={3} />
              {checked && <div className={`answer-feedback ${correct ? "is-correct" : "is-hint"}`} role="status">{correct ? "That's it — you carried both rates through the chain." : "Good start. Look for both rates: the outer power and the inner slope of 5."}</div>}
              <button type="button" className="button button-terracotta full-button" onClick={() => { if (answer.trim()) { setChecked(true); if (correct) setTimeout(() => setActive("complete"), 700); } else setChecked(true); }}>{answer.trim() ? "Check my step" : "Give me a hint"} <ArrowRight size={15} /></button>
              <button type="button" className="quiet-button" onClick={() => { setAnswer("3(5x - 2)^2 · 5"); setChecked(true); setTimeout(() => setActive("complete"), 700); }}>Show a worked step</button>
            </>}

            {active === "complete" && <>
              <div className="complete-card"><span className="complete-check"><Check size={21} /></span><span className="eyebrow">RETEST PASSED</span><b>You carried the chain through.</b><p>That understanding is now part of your path—not a streak, just proof.</p></div>
              <div className="evidence-chip"><span>CHAIN RULE</span><b>Familiar → Understood</b><span className="evidence-dot" /></div>
              <button type="button" className="button button-ink full-button" onClick={() => { setAnswer(""); setChecked(false); setActive("spot"); }}><RotateCcw size={14} /> Replay the loop</button>
            </>}
          </div>
        </div>
        <div className="demo-window-foot"><span><span className="sync-dot" /> Your page is private</span><span>Coach is in the corner <span className="foot-coach">✦</span></span></div>
      </div>
    </div>
  );
}
