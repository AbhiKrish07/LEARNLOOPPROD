import { useState } from "react";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";

const concepts = [
  { name: "Functions", status: "Applied", color: "mint", size: 18, note: "You used a function to describe a changing quantity." },
  { name: "Derivatives", status: "Understood", color: "blue", size: 15, note: "You found the rate of change in a fresh problem." },
  { name: "Composition", status: "Understood", color: "mint", size: 20, note: "You untangled the inside and outside functions." },
  { name: "Chain Rule", status: "Familiar", color: "terracotta", size: 29, note: "You caught the add-vs-multiply slip and passed a new retest." },
  { name: "Computational graphs", status: "Next", color: "yellow", size: 15, note: "Ready when you are. It builds on the Chain Rule." },
  { name: "Backpropagation", status: "Locked", color: "blue", size: 12, note: "This opens after computational graphs feel familiar." },
];

export default function GrowthGarden() {
  const [selected, setSelected] = useState(3);
  const concept = concepts[selected];
  return <div className="growth-layout">
    <div className="growth-map-card">
      <div className="growth-card-top"><span className="eyebrow">YOUR LEARNING, OVER TIME</span><span className="growth-count"><span className="live-seed" /> 6 concepts</span></div>
      <div className="growth-map" aria-label="Interactive learning path. Select a concept to see evidence.">
        <svg className="growth-lines" viewBox="0 0 600 286" preserveAspectRatio="none" aria-hidden="true"><path d="M75 174 L173 88 L270 182 L368 108 L468 64 M270 182 L371 236 L468 64 M368 108 L520 190" /></svg>
        {concepts.map((item, index) => {
          const positions = [{ left: "12%", top: "57%" }, { left: "28%", top: "24%" }, { left: "45%", top: "60%" }, { left: "62%", top: "36%" }, { left: "79%", top: "22%" }, { left: "86%", top: "66%" }];
          return <button key={item.name} type="button" className={`growth-neuron neuron-${item.color} ${selected === index ? "selected" : ""}`} style={{ left: positions[index].left, top: positions[index].top, width: item.size + 23, height: item.size + 23 }} onClick={() => setSelected(index)} aria-label={`${item.name}, ${item.status}. View evidence.`} aria-pressed={selected === index}><span className="neuron-rays" /><span className="neuron-core" /></button>;
        })}
      </div>
      <div className="growth-map-foot"><span><i className="legend-learned" /> Proven</span><span><i className="legend-building" /> In progress</span><span><i className="legend-next" /> Up next</span></div>
    </div>
    <div className="growth-detail-card">
      <div className="growth-detail-kicker"><span className={`growth-mark ${concept.color}`}><Sparkles size={16} /></span><span className="eyebrow">SELECTED CONCEPT</span></div>
      <h3>{concept.name}</h3><span className={`mastery-tag ${concept.color}`}>{concept.status}</span>
      <p className="growth-note">{concept.note}</p>
      <div className="evidence-list"><span className="eyebrow">RECENT EVIDENCE</span><div><span className="evidence-check"><Check size={12} /></span><span><b>Retest passed</b><small>A fresh problem, not a repeat.</small></span></div><div><span className="evidence-check soft"><Sparkles size={12} /></span><span><b>Reasoning repaired</b><small>Step 4 · chain rule</small></span></div></div>
      <button type="button" className="growth-action" onClick={() => document.getElementById("loop-demo")?.scrollIntoView({ behavior: "smooth" })}>See the learning loop <ArrowUpRight size={15} /></button>
    </div>
  </div>;
}
