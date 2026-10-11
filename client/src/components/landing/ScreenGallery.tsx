import { useState } from "react";
import { ArrowUpRight, BookOpen, Brain, Compass, FileText, Network, Search, Settings2, Sparkles, WandSparkles } from "lucide-react";

type ScreenId = "library" | "agents" | "path" | "course" | "canvas" | "simulation" | "brain" | "settings";
const screenTabs: { id: ScreenId; label: string }[] = [
  { id: "library", label: "Library" }, { id: "agents", label: "Agents" }, { id: "path", label: "Your path" }, { id: "course", label: "Course maker" }, { id: "canvas", label: "Canvas" }, { id: "simulation", label: "Simulation" }, { id: "brain", label: "Your brain" }, { id: "settings", label: "Settings" },
];

function LibraryScreen() {
  return <div className="gallery-screen library-screen"><div className="mock-sidebar"><div className="mock-brand"><span className="tiny-ll">LL</span> LearnLoop</div><span className="mock-side-active"><BookOpen size={14} /> Notebooks</span><span><Search size={14} /> Search</span><span><Sparkles size={14} /> Agents</span><span><Compass size={14} /> Growth</span><div className="mock-sidebar-foot">CALCULUS PATH</div></div><div className="mock-app-main"><div className="mock-page-head"><div><span className="eyebrow">YOUR WORKSPACE</span><h4>Notebooks</h4></div><button className="mock-add" type="button">+ New page</button></div><div className="mock-search"><Search size={14} /><span>Search notes, concepts, mistakes…</span><kbd>⌘ K</kbd></div><div className="mock-book-grid"><div className="mock-book-card book-mint"><span>CALCULUS</span><b>Chain Rule</b><small>Edited just now</small><span className="book-mark">∫</span></div><div className="mock-book-card book-blue"><span>CS FOUNDATIONS</span><b>Computational graphs</b><small>Yesterday</small><span className="book-mark">⌘</span></div><div className="mock-book-card book-yellow"><span>LINEAR ALGEBRA</span><b>Eigenvectors</b><small>Monday</small><span className="book-mark">↗</span></div></div><div className="mock-recent-row"><span className="recent-icon"><FileText size={15} /></span><span><b>Last session</b><small>One slip found · one retest passed</small></span><span className="recent-date">2 min ago</span></div></div></div>;
}

function AgentsScreen() {
  const agents = [{ icon: "S", title: "Spotter", copy: "Finds the exact step where your reasoning breaks.", color: "terracotta" }, { icon: "V", title: "Visualizer", copy: "Turns a stuck idea into something you can test.", color: "mint" }, { icon: "R", title: "Recall", copy: "Brings back what needs one more pass.", color: "blue" }, { icon: "C", title: "Coach", copy: "Suggests a next step, never just a score.", color: "yellow" }];
  return <div className="mock-app-main standalone-screen"><div className="mock-page-head"><div><span className="eyebrow">THEY STAY OUT OF THE WAY</span><h4>Meet your agents</h4></div><span className="mock-status-pill"><i /> All on</span></div><p className="mock-screen-intro">A quiet companion at the corner of your page—there when your thinking needs a hand.</p><div className="agent-card-grid">{agents.map(agent => <div className="agent-mini-card" key={agent.title}><span className={`agent-mini-icon ${agent.color}`}>{agent.icon}</span><b>{agent.title}</b><small>{agent.copy}</small><span className="agent-trigger">APPEARS WHEN IT HELPS</span></div>)}</div></div>;
}

function PathScreen() {
  const concepts = [["Functions", "APPLIED", "done"], ["Derivatives", "UNDERSTOOD", "done"], ["Composition", "UNDERSTOOD", "done"], ["Chain Rule", "FAMILIAR", "now"], ["Computational graphs", "NEXT", "next"], ["Backpropagation", "LOCKED", "locked"]];
  return <div className="mock-app-main standalone-screen"><div className="mock-page-head"><div><span className="eyebrow">BUILT FROM EVIDENCE</span><h4>Your path</h4></div><span className="mock-status-pill">6 concepts</span></div><div className="concept-path">{concepts.map(([name, status, state], index) => <div className={`concept-row ${state}`} key={name}><span className="concept-node">{state === "done" ? <span>✓</span> : index + 1}</span><span className="concept-name">{name}</span><span className="concept-status">{status}</span></div>)}</div><div className="path-evidence-note"><span className="leaf-mark">✳</span><span><b>Your next step grows from what you prove.</b><small>Retest passed: Composition · Slip found: Chain Rule</small></span></div></div>;
}

function CourseScreen() {
  return <div className="mock-app-main standalone-screen course-screen"><div className="course-left"><span className="eyebrow">FROM CURIOSITY TO A PATH</span><h4>Make a course</h4><div className="mock-field-label">WHAT DO YOU WANT TO LEARN?</div><div className="mock-text-field">Backpropagation, from what I already know…</div><div className="mock-field-label">YOUR LEVEL</div><div className="mock-pills"><span>Beginner</span><span className="selected">Some background</span><span>Advanced</span></div><button className="mock-add" type="button">Build my course</button></div><div className="course-outline"><div className="outline-title"><b>COURSE OUTLINE</b><span>7 items</span></div>{["Functions & composition", "Chain Rule", "Chain rule simulation", "Retest: chain rule", "Computational graphs"].map((item, i) => <div className="outline-item" key={item}><span className="drag-dots">⠿</span><b>{item}</b><small>{i === 2 ? "SIMULATION" : i === 3 ? "RETEST" : "CONCEPT"}</small></div>)}</div></div>;
}

function CanvasScreen() {
  return <div className="mock-canvas-screen"><div className="canvas-toolbar"><span className="canvas-toolbar-active">↖</span><span>▤</span><span>⌁</span><span>✎</span></div><div className="canvas-node canvas-foundation"><span>FOUNDATIONS</span><b>Composition</b></div><div className="canvas-node canvas-chain"><span>CHAIN RULE</span><b>Slopes multiply<br />along the chain.</b><small>Your slip: adding the two slopes</small></div><div className="canvas-node canvas-sim"><span>SIMULATION · VISUALIZER</span><svg viewBox="0 0 130 45" aria-hidden="true"><path d="M2 37 C 29 38, 34 9, 62 18 S 89 39, 128 4" fill="none" stroke="currentColor" strokeWidth="3" /></svg></div><svg className="canvas-links" viewBox="0 0 620 310" preserveAspectRatio="none" aria-hidden="true"><path d="M152 116 C230 116, 210 169, 284 169 M397 175 C446 176, 448 123, 475 123" fill="none" stroke="#a9ad99" strokeWidth="2" strokeDasharray="5 4" /></svg><span className="canvas-zoom">− &nbsp; 68% &nbsp; +</span></div>;
}

function SimulationScreen() {
  const [prediction, setPrediction] = useState("Double");
  const [ran, setRan] = useState(false);
  return <div className="mock-app-main standalone-screen sim-gallery"><div className="mock-page-head"><div><span className="eyebrow">RUN BY VISUALIZER</span><h4>Simulation lab</h4></div><span className="mock-status-pill">CHAIN RULE</span></div><div className="sim-gallery-layout"><div className="gallery-graph"><svg viewBox="0 0 490 180" role="img" aria-label="A smooth function curve and a dotted inner function"><path d="M18 154 C 92 148, 103 25, 210 68 S 354 165, 472 19" fill="none" stroke="#20241d" strokeWidth="4" strokeLinecap="round" /><path d="M18 160 C 96 157, 128 47, 210 80 S 369 152, 472 63" fill="none" stroke="#4c9a78" strokeWidth="3" strokeDasharray="8 7" /></svg><div className="graph-legend">● solid: f(g(x)) <span>● dashed: g(x)</span></div></div><div className="prediction-box"><span className="eyebrow">PREDICT FIRST</span><b>If you double the inner slope, the total slope will…</b>{["Double", "Stay the same", "Add a bit"].map(item => <button key={item} type="button" className={prediction === item ? "selected" : ""} onClick={() => { setPrediction(item); setRan(false); }}>{item}</button>)}<button type="button" className="mock-add" onClick={() => setRan(true)}>Run it and compare</button>{ran && <small className="simulation-feedback" role="status">The total doubles too — {prediction === "Double" ? "you called it." : "because the slopes multiply."}</small>}</div></div></div>;
}

function BrainScreen() {
  const [selected, setSelected] = useState("Chain Rule");
  const nodes = [{ name: "Functions", x: 20, y: 36, tone: "node-blue" }, { name: "Composition", x: 37, y: 66, tone: "node-mint" }, { name: "Chain Rule", x: 54, y: 49, tone: "node-yellow" }, { name: "Graphs", x: 72, y: 27, tone: "node-blue" }, { name: "Backprop", x: 79, y: 72, tone: "node-mint" }];
  return <div className="mock-app-main standalone-screen brain-screen"><div className="mock-page-head"><div><span className="eyebrow">EVERY SESSION LEAVES A TRACE</span><h4>Your brain</h4></div><span className="mock-status-pill">6 neurons · 4h studied</span></div><div className="brain-layout"><div className="brain-map"><svg className="brain-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M20 36 L37 66 L54 49 L72 27 L79 72 M20 36 L54 49 M37 66 L79 72 M54 49 L72 27" /></svg>{nodes.map(node => <button key={node.name} className={`brain-node ${node.tone} ${selected === node.name ? "chosen" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => setSelected(node.name)} aria-label={`Recall ${node.name} session`} title={node.name}><span>{node.name}</span></button>)}</div><div className="brain-detail"><span className="eyebrow">SELECTED NEURON</span><h5>{selected} session</h5><p>Wrote 2 pages · fixed 1 slip · passed 1 retest.</p><button type="button" className="mock-add">Recall this session <ArrowUpRight size={13} /></button></div></div></div>;
}

function SettingsScreen() {
  return <div className="mock-app-main standalone-screen"><div className="mock-page-head"><div><span className="eyebrow">MAKE IT YOURS</span><h4>Settings</h4></div><Settings2 size={20} /></div><div className="settings-list"><div><span className="settings-icon"><WandSparkles size={15} /></span><span><b>Coach nudges</b><small>Quiet, only when there’s a useful next step</small></span><span className="mock-toggle on" /></div><div><span className="settings-icon">◐</span><span><b>Appearance</b><small>Warm paper · follows system</small></span><span className="settings-value">Light mode</span></div><div><span className="settings-icon"><Network size={15} /></span><span><b>Learning path</b><small>Calculus · foundations to gradient descent</small></span><span className="settings-value">Edit</span></div></div></div>;
}

export default function ScreenGallery() {
  const [screen, setScreen] = useState<ScreenId>("library");
  const content = { library: <LibraryScreen />, agents: <AgentsScreen />, path: <PathScreen />, course: <CourseScreen />, canvas: <CanvasScreen />, simulation: <SimulationScreen />, brain: <BrainScreen />, settings: <SettingsScreen /> };

  return <div className="screen-gallery">
    <div className="gallery-tabs" role="tablist" aria-label="LearnLoop interface previews">
      {screenTabs.map(item => <button key={item.id} role="tab" aria-selected={screen === item.id} className={screen === item.id ? "selected" : ""} onClick={() => setScreen(item.id)}>{item.label}</button>)}
    </div>
    <div className="gallery-frame"><div className="gallery-frame-head"><div className="window-dots" aria-hidden="true"><i /><i /><i /></div><span>learnloop <b>›</b> {screenTabs.find(item => item.id === screen)?.label.toLowerCase()}</span><span className="gallery-head-mark">LL</span></div>{content[screen]}</div>
    <p className="gallery-caption"><span className="caption-spark">✳</span> Eight views. One notebook that knows what you’re learning. <ArrowUpRight size={14} /></p>
  </div>;
}
