import { lazy, Suspense } from "react";
import Tutorial from "../../Tutorial";
import ErrorBoundary from "../../components/ErrorBoundary";
import { DeferredChunk, LoadingBlock, Mark, SectionHead } from "../../components/layout/PortfolioPrimitives";

const Playground = lazy(() => import("../../Playground"));
const CyberLab = lazy(() => import("../../CyberLab"));
const GameArcade = lazy(() => import("../../GameArcade"));
const Automation = lazy(() => import("../../Automation"));
const Terminal = lazy(() => import("../../Terminal"));
const TerminalGuide = lazy(() => import("../../Terminal").then((module) => ({ default: module.TerminalGuide })));

export default function PlaygroundPage() {
  return (
    <>            <section id="explore" className="section explore-section">
              <SectionHead
                index="06"
                kicker="BEYOND THE CODE"
                title={
                  <>
                    A space to
                    <br />
                    <span>try things out.</span>
                  </>
                }
                copy="Small interactive experiences, made to explore at your own pace. Each one runs locally in your browser."
              />
              <div className="explore-grid">
                <a className="explore-card" href="#playground">
                  <span className="explore-number">01 / BUILD</span>
                  <span className="explore-icon">⌘</span>
                  <h3>Code playground</h3>
                  <p>
                    Edit a small HTML, CSS, and JavaScript example and see it
                    run in an isolated preview.
                  </p>
                  <span className="explore-action">Open playground ↗</span>
                </a>
                <a className="explore-card" href="#arcade">
                  <span className="explore-number">02 / PLAY</span>
                  <span className="explore-icon">✳</span>
                  <h3>Browser arcade</h3>
                  <p>
                    Try short logic, memory, and security inspired challenges
                    with local scores.
                  </p>
                  <span className="explore-action">Choose a game ↗</span>
                </a>
                <a className="explore-card" href="#cyber-lab">
                  <span className="explore-number">03 / INVESTIGATE</span>
                  <span className="explore-icon">◎</span>
                  <h3>Cyber lab</h3>
                  <p>
                    Review synthetic evidence, choose a response, and learn from
                    the outcome.
                  </p>
                  <span className="explore-action">Review a case ↗</span>
                </a>
                <a className="explore-card" href="#automation">
                  <span className="explore-number">04 / SIMULATE</span>
                  <span className="explore-icon">⤳</span>
                  <h3>Workflow simulator</h3>
                  <p>
                    Move sample data through visible validation and review
                    steps.
                  </p>
                  <span className="explore-action">Run a workflow ↗</span>
                </a>
              </div>
            </section>
            <section id="playground" className="section playground-section">
              <SectionHead
                index="07"
                kicker="BROWSER EXPERIMENT"
                title={
                  <>
                    A tiny place to
                    <br />
                    <span>make something move.</span>
                  </>
                }
                copy="Edit the sample and run it. HTML, CSS, and JavaScript execute inside a sandboxed frame, isolated from this portfolio."
              />
              <div className="interactive-toolbar">
                <Tutorial
                  id="playground"
                  title="A quick tour of the code playground"
                  steps={[
                    "Choose a starter example to load a working page.",
                    "Edit HTML, CSS, or JavaScript in the editor tabs.",
                    "Press Run to preview your changes in the isolated sandbox.",
                    "Reset restores the sample. Copy and fullscreen are available beside Run.",
                  ]}
                />
              </div>
              <div className="reveal">
                <DeferredChunk panel="playground"><ErrorBoundary label="Code playground"><Suspense fallback={<LoadingBlock label="code playground" panel="playground" />}><Playground /></Suspense></ErrorBoundary></DeferredChunk>
              </div>
              <div id="terminal" className="terminal-wrap reveal">
                <div className="terminal-intro">
                  <Mark>THE OTHER INTERFACE</Mark>
                  <h3>Talk to the portfolio.</h3>
                  <p>A simulated shell. No commands leave the browser.</p>
                  <DeferredChunk panel="terminal-guide"><ErrorBoundary label="Terminal guide"><Suspense fallback={null}><TerminalGuide /></Suspense></ErrorBoundary></DeferredChunk>
                </div>
                <DeferredChunk panel="terminal"><ErrorBoundary label="Terminal"><Suspense fallback={<LoadingBlock label="terminal" panel="terminal" />}><Terminal /></Suspense></ErrorBoundary></DeferredChunk>
              </div>
            </section>
            <section id="arcade" className="section arcade-section">
              <SectionHead
                index="08"
                kicker="OPTIONAL SIDE QUESTS"
                title={
                  <>
                    The digital
                    <br />
                    <span>playground.</span>
                  </>
                }
                copy="Small browser challenges inspired by security and software. Purely for fun; no data leaves this page."
              />
              <div className="interactive-toolbar">
                <Tutorial
                  id="arcade"
                  title="How the arcade works"
                  steps={[
                    "Choose one of the browser games to begin.",
                    "Read the prompt and use the on-screen controls to play each round.",
                    "Your score and best run stay in this browser only.",
                    "Restart a round or return to game selection whenever you like.",
                  ]}
                />
              </div>
              <div className="reveal">
                <DeferredChunk panel="arcade"><ErrorBoundary label="Arcade"><Suspense fallback={<LoadingBlock label="arcade" panel="arcade" />}><GameArcade /></Suspense></ErrorBoundary></DeferredChunk>
              </div>
            </section>
            <section id="cyber-lab" className="section cyber-section">
              <SectionHead
                index="09"
                kicker="SIMULATED ENVIRONMENT"
                title={
                  <>
                    Read the signal.
                    <br />
                    <span>Choose a response.</span>
                  </>
                }
                copy="An educational investigation sandbox with synthetic events only. This is not a live security monitoring system."
              />
              <div className="interactive-toolbar">
                <Tutorial
                  id="cyber-lab"
                  title="Investigate a synthetic incident"
                  steps={[
                    "The live desk is ready immediately. Pick a signal from the left rail.",
                    "Scan its event details and choose an analyst response for instant feedback and points.",
                    "Try Signal Sprint for quick rounds with score and explanations.",
                    "All examples are synthetic and nothing is sent to a real system.",
                  ]}
                />
              </div>
              <div className="reveal">
                <DeferredChunk panel="cyber-lab"><ErrorBoundary label="Cyber Lab"><Suspense fallback={<LoadingBlock label="cyber lab" panel="cyber-lab" />}><CyberLab /></Suspense></ErrorBoundary></DeferredChunk>
              </div>
            </section>
            <section id="automation" className="section automation-section">
              <SectionHead
                index="10"
                kicker="AUTOMATION, MADE VISIBLE"
                title={
                  <>
                    A workflow should
                    <br />
                    <span>explain itself.</span>
                  </>
                }
                copy="Step through a sample n8n-style flow. Each node is simulated in your browser; no third-party service is called."
              />
              <div className="interactive-toolbar">
                <Tutorial
                  id="automation"
                  title="Step through the workflow"
                  steps={[
                    "Choose a sample trigger from the menu.",
                    "Advance the simulation to run each visible checkpoint.",
                    "Inspect the review step and see how the sample data is handled.",
                    "This is a local demonstration; no external service is connected.",
                  ]}
                />
              </div>
              <div className="reveal">
                <DeferredChunk panel="automation"><ErrorBoundary label="Automation"><Suspense fallback={<LoadingBlock label="workflow simulator" panel="automation" />}><Automation /></Suspense></ErrorBoundary></DeferredChunk>
              </div>
            </section>
              </>
  );
}
