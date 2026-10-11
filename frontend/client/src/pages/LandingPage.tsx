import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Menu, Sparkles, X, Users } from "lucide-react";
import "@/landing.css";

import NotebookHero from "@/components/landing/NotebookHero";
import LearningLoopDemo from "@/components/landing/LearningLoopDemo";
import ScreenGallery from "@/components/landing/ScreenGallery";
import GrowthGarden from "@/components/landing/GrowthGarden";
import Reveal from "@/components/landing/Reveal";
import { WaitlistModal } from "@/components/landing/WaitlistModal";

type Subject = "Calculus" | "Computer science" | "Something else";

function StartModal({ onClose, onJoinWaitlist }: { onClose: () => void; onJoinWaitlist: () => void }) {
  const [subject, setSubject] = useState<Subject>("Calculus");
  const [stage, setStage] = useState<"subject" | "calibration" | "ready">("subject");
  const [answer, setAnswer] = useState("");

  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="start-modal" role="dialog" aria-modal="true" aria-labelledby="start-modal-title">
        <button className="modal-close" type="button" aria-label="Close" onClick={onClose}><X size={18} /></button>
        <span className="modal-brand"><img src="/learnloop-mark.svg" alt="" /> LEARNLOOP · PRODUCT PREVIEW</span>
        
        {stage === "subject" && (
          <>
            <span className="eyebrow">STEP 1 OF 2 · WHAT DO YOU STUDY?</span>
            <h2 id="start-modal-title">What are you learning?</h2>
            <p>Pick a starting point. Your notebook can go wherever your curiosity does.</p>
            <div className="subject-options">
              {(["Calculus", "Computer science", "Something else"] as Subject[]).map(item => (
                <button type="button" key={item} className={subject === item ? "selected" : ""} onClick={() => setSubject(item)}>
                  <span className="subject-symbol">{item === "Calculus" ? "∫" : item === "Computer science" ? "⌘" : "✳"}</span>
                  {item}
                  {subject === item && <Check size={15} />}
                </button>
              ))}
            </div>
            <button type="button" className="button button-terracotta full-button font-bold" onClick={() => setStage("calibration")}>
              Continue <ArrowRight size={16} />
            </button>
            <span className="modal-footnote">Interactive demo preview. No signup needed yet.</span>
          </>
        )}

        {stage === "calibration" && (
          <>
            <span className="eyebrow">STEP 2 OF 2 · QUICK CALIBRATION</span>
            <h2 id="start-modal-title">A tiny first question.</h2>
            <p>If h(x) = f(g(x)), what is h′(x) built from?</p>
            <div className="calibration-options">
              {["f′(x) + g′(x)", "f′(g(x)) · g′(x)", "f′(g′(x))"].map(item => (
                <button type="button" key={item} className={answer === item ? "selected" : ""} onClick={() => setAnswer(item)}>
                  {item}
                </button>
              ))}
            </div>
            <div className="confidence-row">
              <span>HOW SURE ARE YOU?</span>
              <button type="button" className="confidence-pill selected">Fairly sure</button>
              <button type="button" className="confidence-pill">Guessing</button>
            </div>
            <button type="button" disabled={!answer} className="button button-terracotta full-button font-bold" onClick={() => setStage("ready")}>
              See my first path <ArrowRight size={16} />
            </button>
          </>
        )}

        {stage === "ready" && (
          <div className="modal-ready">
            <span className="ready-illustration"><BookOpen size={31} /></span>
            <span className="eyebrow">PREVIEW COMPLETE</span>
            <h2 id="start-modal-title">Your {subject.toLowerCase()} path is ready.</h2>
            <p>To access the full persistent coach, live freehand ink canvas, and multi-agent loops, join our early access cohort.</p>
            <button
              type="button"
              className="button button-terracotta full-button font-bold"
              onClick={() => {
                onClose();
                onJoinWaitlist();
              }}
            >
              Claim Beta Spot on Waitlist <ArrowRight size={16} />
            </button>
            <span className="modal-footnote">Cohorts invited weekly.</span>
          </div>
        )}
      </section>
    </div>
  );
}

export const LandingPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openWaitlist = () => setShowWaitlistModal(true);
  const openPreview = () => setShowPreviewModal(true);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      {/* Top Sticky Header */}
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="LearnLoop home">
          <img src="/learnloop-mark.svg" alt="LearnLoop" />
          <span>LearnLoop</span>
        </a>

        <nav className={`main-nav ${menuOpen ? "menu-open" : ""}`} aria-label="Main navigation">
          <a href="#how" onClick={closeMenu}>How it works</a>
          <a href="#inside" onClick={closeMenu}>Inside LearnLoop</a>
          <a href="#growth" onClick={closeMenu}>Your growth</a>
          <button type="button" className="mobile-nav-cta" onClick={() => { closeMenu(); openWaitlist(); }}>
            Join the waitlist <ArrowRight size={15} />
          </button>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="header-link"
            onClick={() => setLocation("/login")}
          >
            Sign in
          </button>
          
          <button
            type="button"
            className="button button-dark header-cta"
            onClick={openWaitlist}
          >
            Join Waitlist <ArrowUpRight size={15} />
          </button>

          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="eyebrow-spark">✳</span> YOUR NOTES, WITH A LITTLE MORE KNOW-HOW
            </div>
            <h1>A notebook that <em>checks your thinking.</em></h1>
            <p className="hero-description">
              Write it out. Your coach catches the exact step where it breaks—and helps you understand why.
            </p>
            
            <div className="hero-actions">
              <button
                type="button"
                className="button button-terracotta hero-cta"
                onClick={openWaitlist}
              >
                Join the Waitlist <ArrowRight size={17} />
              </button>
              
              <button
                type="button"
                className="button button-light hero-cta"
                onClick={openPreview}
              >
                Preview with one problem <ArrowDown size={15} />
              </button>
            </div>

            <div className="hero-note">
              <span className="hero-avatars"><i>∫</i><i>⌘</i><i>✳</i></span>
              <span>For the things you want to understand,<br /><b>not just get through.</b></span>
            </div>
          </div>

          <NotebookHero />

          <div className="hero-bottom-note">
            <span>SCROLL A LITTLE</span>
            <ChevronDown size={14} />
          </div>
        </section>

        {/* Marquee Strip */}
        <section className="marquee-strip" aria-label="Topics">
          <div className="marquee-track">
            {["Calculus", "Computer science", "Engineering", "Machine learning", "Whatever's next", "Calculus", "Computer science", "Engineering", "Machine learning", "Whatever's next"].map((item, index) => (
              <span key={`${item}-${index}`}><i>✳</i>{item}</span>
            ))}
          </div>
        </section>

        {/* Section 01: Loop Demo */}
        <section id="how" className="section loop-section">
          <Reveal className="section-heading-row">
            <div className="section-heading-copy">
              <span className="eyebrow section-eyebrow">
                <span>01</span> THE COACH LIVES IN THE PAGE
              </span>
              <h2>It doesn’t just give you<br />the answer. <em>It finds your turn.</em></h2>
            </div>
            <p className="section-side-copy">
              A chat window knows what you told it. LearnLoop sees the reasoning you’re building—and stays with you through the fix.
            </p>
          </Reveal>
          
          <Reveal delay={90}>
            <LearningLoopDemo />
          </Reveal>
        </section>

        {/* Section 02: Screen Gallery */}
        <section id="inside" className="section inside-section">
          <Reveal className="inside-heading">
            <span className="eyebrow section-eyebrow">
              <span>02</span> THE WHOLE NOTEBOOK, IN MOTION
            </span>
            <h2>Less app-hopping.<br /><em>More getting somewhere.</em></h2>
            <p>From the first question to the note you’ll want to come back to—every tool lives where you’re already thinking.</p>
          </Reveal>
          
          <Reveal delay={80}>
            <ScreenGallery />
          </Reveal>
        </section>

        {/* Section 03: Growth */}
        <section id="growth" className="section growth-section">
          <Reveal className="section-heading-row">
            <div className="section-heading-copy">
              <span className="eyebrow section-eyebrow">
                <span>03</span> GROWTH, WITH RECEIPTS
              </span>
              <h2>Your brain grows from<br />what you <em>prove.</em></h2>
            </div>
            <p className="section-side-copy">
              No streaks to protect. No hearts to collect. Just a living map of ideas you can explain, use, and recall.
            </p>
          </Reveal>
          
          <Reveal delay={75}>
            <GrowthGarden />
          </Reveal>
        </section>

        {/* Section 04: Audience */}
        <section className="audience-section">
          <div className="audience-header">
            <Reveal>
              <span className="eyebrow section-eyebrow"><span>04</span> LEARN WHATEVER YOU'RE LEARNING</span>
              <h2>For people who<br /><em>learn by writing.</em></h2>
            </Reveal>
            <Reveal delay={75}>
              <p>Hard things get easier when you can see your own thinking—and have somewhere to take it next.</p>
            </Reveal>
          </div>

          <div className="audience-cards">
            <Reveal className="audience-card audience-student">
              <span className="audience-count">01 · STUDENTS</span>
              <span className="audience-icon">∫</span>
              <h3>Catch the slip before<br />the exam does.</h3>
              <p>Work through the hard step; get a fresh problem when you’re ready.</p>
              <span className="card-scribble">show your work ↗</span>
            </Reveal>

            <Reveal className="audience-card audience-self" delay={70}>
              <span className="audience-count">02 · SELF-LEARNERS</span>
              <span className="audience-icon">⌘</span>
              <h3>Turn any course<br />into a path.</h3>
              <p>Bring your sources. Build one proven concept at a time.</p>
              <span className="card-scribble">start anywhere ✳</span>
            </Reveal>

            <Reveal className="audience-card audience-research" delay={140}>
              <span className="audience-count">03 · CURIOUS MINDS</span>
              <span className="audience-icon">↗</span>
              <h3>Think across<br />the canvas.</h3>
              <p>Link pages, sources, simulations, and the ideas between them.</p>
              <span className="card-scribble">follow the thread ↗</span>
            </Reveal>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="final-cta-section">
          <Reveal className="final-cta-card">
            <div className="final-cta-orbit" aria-hidden="true"><span>✳</span></div>
            <div className="final-cta-copy">
              <span className="eyebrow">YOUR NEXT GOOD QUESTION IS ENOUGH</span>
              <h2>Start with one problem.<br /><em>See where it takes you.</em></h2>
              <p>Your notes stay yours. Your progress grows from what you can do.</p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  className="button button-light font-bold"
                  onClick={openWaitlist}
                >
                  Join the Waitlist <ArrowRight size={16} />
                </button>
                
                <button
                  type="button"
                  className="button button-terracotta font-bold text-white"
                  onClick={() => setLocation("/login")}
                >
                  Join the Beta (Sign In / Login) <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
            <div className="final-cta-doodle" aria-hidden="true">∫ <span>→</span> ✳</div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <a className="brand-lockup footer-brand" href="#top">
          <img src="/learnloop-mark.svg" alt="" />
          <span>LearnLoop</span>
        </a>
        <span className="footer-line">A notebook that checks your thinking.</span>
        
        <div className="footer-links">
          <a href="#how">How it works</a>
          <a href="#inside">Inside</a>
          <button
            type="button"
            onClick={() => setLocation("/login")}
            className="font-bold text-[#C87D55]"
          >
            Join the beta <ArrowUpRight size={13} />
          </button>
        </div>

        <span className="footer-copyright">
          Made for the wonderfully curious. © 2026 LearnLoop
        </span>
      </footer>

      {/* Modals */}
      {showPreviewModal && (
        <StartModal
          onClose={() => setShowPreviewModal(false)}
          onJoinWaitlist={openWaitlist}
        />
      )}

      {showWaitlistModal && (
        <WaitlistModal
          onClose={() => setShowWaitlistModal(false)}
        />
      )}
    </div>
  );
};

export default LandingPage;
