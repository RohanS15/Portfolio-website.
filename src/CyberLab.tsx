import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { alerts, playbookSteps, tabs } from "./features/cyberlab/cyberLabData";

type LabTab = (typeof tabs)[number];
type ZoomInfo = { title: string; detail: string; meta?: string };

export default function CyberLab() {
  const [tab, setTab] = useState<LabTab>("LIVE DESK");
  const [selectedId, setSelectedId] = useState(alerts[0].id);
  const [inspecting, setInspecting] = useState(false);
  const [choice, setChoice] = useState("");
  const [outcome, setOutcome] = useState("");
  const [playbookStep, setPlaybookStep] = useState(-1);
  const [playbookIndicator, setPlaybookIndicator] = useState("suspicious-update.example.test");
  const [reputationChecked, setReputationChecked] = useState(false);
  const [playbookAction, setPlaybookAction] = useState("");
  const [mappedId, setMappedId] = useState(alerts[0].id);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [resolved, setResolved] = useState<string[]>([]);
  const [sprintIndex, setSprintIndex] = useState(0);
  const [sprintScore, setSprintScore] = useState(0);
  const [sprintAnswer, setSprintAnswer] = useState<boolean | null>(null);
  const [zoomInfo, setZoomInfo] = useState<ZoomInfo | null>(null);
  const sprint = alerts[sprintIndex % alerts.length];
  const showZoomInfo = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return;
    const block = target.closest<HTMLElement>("[data-zoom-title]");
    if (!block) return;
    const next = {
      title: block.dataset.zoomTitle ?? "Range information",
      detail: block.dataset.zoomDetail ?? "",
      meta: block.dataset.zoomMeta,
    };
    setZoomInfo((current) => current?.title === next.title && current.detail === next.detail && current.meta === next.meta ? current : next);
  };
  const handleZoomOut = (event: MouseEvent<HTMLDivElement>) => {
    const from = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-zoom-title]") : null;
    if (from && event.relatedTarget instanceof Node && from.contains(event.relatedTarget)) return;
    if (event.relatedTarget instanceof Element && event.relatedTarget.closest("[data-zoom-title]")) showZoomInfo(event.relatedTarget);
    else if (from) setZoomInfo(null);
  };
  useEffect(() => {
    if (!inspecting) return;
    const feedback = document.querySelector(".cyber-demo .lab-detail .investigation");
    if (!feedback) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    feedback.scrollIntoView({ behavior, block: "nearest" });
  }, [inspecting, outcome]);
  useEffect(() => {
    if (!zoomInfo) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomInfo(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [zoomInfo]);
  const selected = alerts.find((alert) => alert.id === selectedId) ?? alerts[0];
  const mapped = alerts.find((alert) => alert.id === mappedId) ?? alerts[0];
  const summary = useMemo(
    () => ({
      high: alerts.filter((a) => a.severity === "HIGH").length,
      medium: alerts.filter((a) => a.severity === "MEDIUM").length,
      low: alerts.filter((a) => a.severity === "LOW").length,
    }),
    [],
  );
  const resetAlert = (id: string) => {
    setSelectedId(id);
    setInspecting(false);
    setChoice("");
    setOutcome("");
  };
  const tabSlug = (view: LabTab) => view.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <>
    <div className="cyber-demo" onMouseOver={(event) => showZoomInfo(event.target)} onMouseOut={handleZoomOut} onMouseLeave={() => setZoomInfo(null)} onFocusCapture={(event) => showZoomInfo(event.target)} onBlurCapture={() => setZoomInfo(null)} onClickCapture={(event) => { if (window.matchMedia("(hover: none)").matches) showZoomInfo(event.target); }}>
      <div className="cyber-topline">
        <span><i className="pulse-dot" /> CYBER RANGE <b>TRAINING ENVIRONMENT</b></span>
        <span><i className="cyber-lock">◆</i> SYNTHETIC DATA · RUNS LOCALLY</span>
      </div>
      <div className="cyber-console-head">
        <div><span className="eyebrow">ANALYST WORKSPACE / 01</span><h2>Security operations <em>range</em></h2><p>Read the evidence. Make the call. Learn from every signal.</p></div>
        <div className="cyber-scoreboard"><span><small>RANGE SCORE</small><b key={score}>{score}</b></span><i /><span><small>CURRENT STREAK</small><b>{streak} <small>×</small></b></span><i /><span><small>CASES CLEARED</small><b>{resolved.length}<small> / {alerts.length}</small></b></span></div>
      </div>
      <div className="cyber-status-row"><span><i className="pulse-dot"/> RANGE READY</span><span>3 TRAINING SIGNALS</span><span>NO SETUP REQUIRED</span></div>
      <div
        className="cyber-tabs"
        role="tablist"
        aria-label="Cybersecurity lab views"
      >
        {tabs.map((view) => (
          <button
            role="tab"
            id={`cyber-tab-${tabSlug(view)}`}
            aria-controls="cyber-panel"
            aria-selected={tab === view}
            tabIndex={tab === view ? 0 : -1}
            className={tab === view ? "active" : ""}
            key={view}
            onClick={() => setTab(view)}
            onKeyDown={(event) => {
              if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const index = tabs.indexOf(view);
              const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
              setTab(tabs[next]);
              document.getElementById(`cyber-tab-${tabSlug(tabs[next])}`)?.focus();
            }}
          >
            {view}
          </button>
        ))}
      </div>
      {tab === "LIVE DESK" && (
        <div className="lab" id="cyber-panel" role="tabpanel" aria-labelledby={`cyber-tab-${tabSlug("LIVE DESK")}`} tabIndex={0}>
          <div className="lab-side">
            <div className="lab-label">INCOMING SIGNALS <span>{alerts.length.toString().padStart(2,"0")}</span></div>
            {alerts.map((alert) => (
              <button
                key={alert.id}
                data-zoom-title={alert.title}
                data-zoom-meta={`${alert.severity} PRIORITY · ${alert.id} · ${alert.time}`}
                data-zoom-detail={alert.details}
                className={`${alert.id === selected.id ? "alert-selected" : ""} ${resolved.includes(alert.id) ? "case-resolved" : ""}`}
                onClick={() => resetAlert(alert.id)}
              >
                <span className={`severity ${alert.severity.toLowerCase()}`}>
                  {alert.severity}
                </span>
                <b>{alert.title}</b>
                <small>{alert.id} · {alert.time}</small>
                {resolved.includes(alert.id) && <i className="case-check">✓ CLEARED</i>}
              </button>
            ))}
          </div>
          <div className="lab-detail">
            <div className="detail-top">
              <div data-zoom-title="Case file" data-zoom-meta={`${selected.severity} PRIORITY · ${selected.id}`} data-zoom-detail={selected.details}>
              <span className="eyebrow">CASE FILE / {selected.id} · {selected.severity} PRIORITY</span>
                <h3>{selected.title}</h3>
              </div>
              <span className="synthetic">SYNTHETIC</span>
            </div>
            <div className="detail-meta">
              <div data-zoom-title="Host" data-zoom-meta={selected.id} data-zoom-detail={`${selected.host} · The device associated with this synthetic event.`}>
                <small>HOST</small>
                <b>{selected.host}</b>
              </div>
              <div data-zoom-title="Source address" data-zoom-meta="DOCUMENTATION RANGE · NO NETWORK LOOKUP" data-zoom-detail={`${selected.ip} · This reserved address is illustrative and is not checked against a live reputation service.`}>
                <small>SOURCE</small>
                <b>{selected.ip}</b>
              </div>
              <div data-zoom-title="Observed time" data-zoom-meta={selected.id} data-zoom-detail={`Event timestamp: ${selected.time}. All times in this sample are synthetic.`}>
                <small>OBSERVED</small>
                <b>{selected.time}</b>
              </div>
            </div>
            <p data-zoom-title={selected.title} data-zoom-meta={`${selected.severity} PRIORITY · ${selected.id}`} data-zoom-detail={selected.details}>{selected.details}</p>
            <h4>Evidence telemetry</h4>
            <ul>
              {selected.indicators.map((item) => (
                <li key={item} data-zoom-title="Evidence indicator" data-zoom-meta={selected.id} data-zoom-detail={item}>
                  <span>↗</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="analyst-prompt"><span>YOUR READ</span><b>{selected.severity === "LOW" ? "Does this match expected activity?" : "What should the analyst do next?"}</b><small>Choose a response to resolve this case and see why.</small></div>
            <div className="incident-controls quick-decisions">
              {[
                { label: "Contain & verify", value: "Contain and verify", correct: selected.severity === "HIGH" },
                { label: "Collect evidence", value: "Collect evidence", correct: selected.severity === "MEDIUM" },
                { label: "Close as expected", value: "Close as expected", correct: selected.severity === "LOW" },
              ].map((answer, index) => <button key={answer.value} disabled={resolved.includes(selected.id)} className={`decision-button ${choice === answer.value ? (answer.correct ? "decision-right" : "decision-wrong") : ""}`} onClick={() => {
                if (resolved.includes(selected.id)) { setChoice(answer.value); return; }
                setChoice(answer.value); setInspecting(true); setOutcome(answer.correct ? `Correct call. ${selected.response}` : `Good instinct to pause. The best next step is ${selected.response.toLowerCase()}`);
                setScore((current) => Math.max(0, current + (answer.correct ? 100 + streak * 25 : 0))); setStreak((current) => answer.correct ? current + 1 : 0); if (answer.correct) setResolved((current) => current.includes(selected.id) ? current : [...current, selected.id]);
              }} data-zoom-title={answer.label} data-zoom-meta="ANALYST RESPONSE OPTION" data-zoom-detail={answer.correct ? "This is the recommended response for the current training signal." : "Review the event context, then compare this option with the evidence."}><span>{String(index + 1).padStart(2, "0")}</span>{answer.label}<b>↗</b></button>)}
            </div>
            {inspecting && <div className={`investigation ${choice === (selected.severity === "HIGH" ? "Contain and verify" : selected.severity === "MEDIUM" ? "Collect evidence" : "Close as expected") ? "feedback-correct" : "feedback-review"}`} aria-live="polite"><b>{choice === (selected.severity === "HIGH" ? "Contain and verify" : selected.severity === "MEDIUM" ? "Collect evidence" : "Close as expected") ? `✓ SIGNAL RESOLVED · +${100 + Math.max(0, streak - 1) * 25} XP` : "CASE REVIEW · LEARNING MOMENT"}</b><p>{outcome} {selected.rationale}{!resolved.includes(selected.id) && " Choose another response to clear the signal."}</p></div>}
            {resolved.length === alerts.length && <div className="range-complete"><b>RANGE COMPLETE</b><span>All training signals reviewed. Score: {score} XP · {streak} final streak</span><button onClick={() => { setResolved([]); setScore(0); setStreak(0); setInspecting(false); setChoice(""); setOutcome(""); }}>↻ Run the range again</button></div>}
          </div>
        </div>
      )}
      {tab === "SIGNAL SPRINT" && <div className="sprint-view" id="cyber-panel" role="tabpanel" aria-labelledby={`cyber-tab-${tabSlug("SIGNAL SPRINT")}`} tabIndex={0}>
        <div className="sprint-heading"><span className="eyebrow">MICRO-CHALLENGE / {String((sprintIndex % alerts.length) + 1).padStart(2,"0")} OF 03</span><b>{sprintScore} <small>XP</small></b></div>
        <div className="sprint-track"><i style={{width: `${((sprintIndex % alerts.length) / alerts.length) * 100}%`}}/></div>
        <div className="sprint-card"><span className={`severity ${sprint.severity.toLowerCase()}`}>{sprint.severity} SIGNAL</span><h3>{sprint.title}</h3><p>{sprint.details}</p><div className="sprint-log"><span>{sprint.time}</span><code>{sprint.host} · SRC {sprint.ip}</code><span>LOCAL EVENT</span></div><h4>Does this signal need analyst investigation?</h4><div className="sprint-answers"><button disabled={sprintAnswer !== null} onClick={() => {const correct=sprint.severity!=="LOW";setSprintAnswer(correct);if(correct)setSprintScore(v=>v+100);}}><b>YES</b><span>Investigate this signal</span></button><button disabled={sprintAnswer !== null} onClick={() => {const correct=sprint.severity==="LOW";setSprintAnswer(correct);if(correct)setSprintScore(v=>v+100);}}><b>NO</b><span>Expected activity</span></button></div>{sprintAnswer!==null&&<div className={`sprint-feedback ${sprintAnswer?"good":"learn"}`} aria-live="polite"><b>{sprintAnswer?"NICE READ · +100 XP":"REVIEW THE EVIDENCE"}</b><p>{sprint.rationale}</p><button onClick={()=>{setSprintIndex(v=>v+1);setSprintAnswer(null);}}>Next signal <span>→</span></button></div>}</div><p className="sprint-foot">Quick rounds · immediate feedback · synthetic examples only</p>
      </div>}
      {tab === "SOC OVERVIEW" && (
        <div className="soc-overview" id="cyber-panel" role="tabpanel" aria-labelledby={`cyber-tab-${tabSlug("SOC OVERVIEW")}`} tabIndex={0}>
          <div className="soc-kpis">
            <article data-zoom-title="Alerts in this sample" data-zoom-meta="SYNTHETIC EVENTS" data-zoom-detail={`${alerts.length} local training records are included in this sample. These are not live telemetry.`}>
              <small>ALERTS IN THIS SAMPLE</small>
              <b>{alerts.length.toString().padStart(2, "0")}</b>
              <span>synthetic events</span>
            </article>
            <article data-zoom-title="High priority signals" data-zoom-meta="REQUIRES REVIEW" data-zoom-detail={`${summary.high} sample event is marked high priority and should be reviewed first.`}>
              <small>HIGH</small>
              <b className="kpi-high">
                {summary.high.toString().padStart(2, "0")}
              </b>
              <span>requires review</span>
            </article>
            <article data-zoom-title="Medium priority signals" data-zoom-meta="NEEDS CONTEXT" data-zoom-detail={`${summary.medium} sample event is medium priority and needs additional context before a decision.`}>
              <small>MEDIUM</small>
              <b className="kpi-medium">
                {summary.medium.toString().padStart(2, "0")}
              </b>
              <span>needs context</span>
            </article>
            <article data-zoom-title="Low priority signals" data-zoom-meta="CHANGE CHECK" data-zoom-detail={`${summary.low} sample event appears expected, but should be correlated with its change window.`}>
              <small>LOW</small>
              <b className="kpi-low">
                {summary.low.toString().padStart(2, "0")}
              </b>
              <span>change check</span>
            </article>
          </div>
          <div className="soc-panels">
            <section data-zoom-title="Alert distribution" data-zoom-meta="STATIC SAMPLE" data-zoom-detail={`High: ${summary.high}. Medium: ${summary.medium}. Low: ${summary.low}. Calculated from the three synthetic records on this page.`}>
              <div className="soc-panel-head">
                <b>ALERT DISTRIBUTION</b>
                <span>STATIC SAMPLE</span>
              </div>
              {[
                ["High", summary.high, "high"],
                ["Medium", summary.medium, "medium"],
                ["Low", summary.low, "low"],
              ].map(([name, count, kind]) => (
                <div className="bar-row" key={name as string}>
                  <span>{name}</span>
                  <div>
                    <i
                      className={`bar-${kind}`}
                      style={{
                        width: `${(Number(count) / alerts.length) * 100}%`,
                      }}
                    />
                  </div>
                  <b>{count}</b>
                </div>
              ))}
            </section>
            <section data-zoom-title="Recent events" data-zoom-meta="UTC · SYNTHETIC DATA" data-zoom-detail="Select an event to open it in the Live Desk and inspect the sample evidence.">
              <div className="soc-panel-head">
                <b>RECENT EVENTS</b>
                <span>UTC</span>
              </div>
              {alerts.map((alert) => (
                <button
                  className="event-row"
                  key={alert.id}
                  data-zoom-title={alert.title}
                  data-zoom-meta={`${alert.severity} PRIORITY · ${alert.time}`}
                  data-zoom-detail={alert.details}
                  onClick={() => {
                    resetAlert(alert.id);
                    setTab("LIVE DESK");
                  }}
                >
                  <span className={`severity ${alert.severity.toLowerCase()}`}>
                    {alert.severity}
                  </span>
                  <span>{alert.title}</span>
                  <small>{alert.time}</small>
                </button>
              ))}
            </section>
          </div>
          <p className="lab-footnote">
            All counts are calculated from the three example records in this
            page. They do not represent live telemetry.
          </p>
        </div>
      )}
      {tab === "PLAYBOOK" && (
        <div className="playbook-view" id="cyber-panel" role="tabpanel" aria-labelledby={`cyber-tab-${tabSlug("PLAYBOOK")}`} tabIndex={0}>
          <div className="playbook-intro">
            <span className="eyebrow">SOAR PLAYBOOK / SIMULATED</span>
            <h3>Indicator reputation & response</h3>
            <p>
              Follow a suspicious indicator from analyst input to a documented response. The reputation result is an illustrative local sample, not a live VirusTotal lookup.
            </p>
            <label className="playbook-input-label" htmlFor="playbook-indicator">INDICATOR TO REVIEW</label>
            <div className="playbook-input-row">
              <input id="playbook-indicator" value={playbookIndicator} onChange={(event) => { setPlaybookIndicator(event.target.value); setReputationChecked(false); setPlaybookStep(-1); setPlaybookAction(""); }} placeholder="Domain, IP address, or file hash" spellCheck={false} />
              <button className="button-primary small" disabled={!playbookIndicator.trim()} onClick={() => { setReputationChecked(true); setPlaybookStep(0); setPlaybookAction(""); }}>Check reputation & start →</button>
            </div>
            <div className="reputation-result" aria-live="polite">
              <div className="reputation-heading"><span className="reputation-dot" /> VIRUSTOTAL-STYLE REPUTATION <b>{reputationChecked ? "SIMULATED RESULT" : "WAITING FOR INPUT"}</b></div>
              {reputationChecked ? <><strong>{playbookIndicator.trim()}</strong>{playbookIndicator.trim().toLowerCase() === "suspicious-update.example.test" ? <p><b>3 / 70</b> illustrative sample detections for this demo indicator · community context: limited · confidence: low</p> : <p>No sample reputation record exists for this input. This demo cannot infer whether it is safe or malicious.</p>}<small>Illustrative training data only. No lookup was sent. A real integration needs a server-side API key, provider terms review, and privacy controls.</small></> : <p>Enter an indicator, then run the local sample check to begin the guided playbook.</p>}
            </div>
            <button
              className="button-primary small playbook-next"
              disabled={!reputationChecked}
              onClick={() => setPlaybookStep(playbookStep >= playbookSteps.length - 1 ? 0 : playbookStep + 1)}
            >
              {playbookStep >= playbookSteps.length - 1 ? "Restart playbook" : "Next step"}{" "}
              →
            </button>
          </div>
          <ol className="playbook-steps">
            {playbookSteps.map((step, i) => (
              <li className={`${i < playbookStep ? "step-done" : ""} ${i === playbookStep ? "step-active" : ""}`} key={step.title}>
                <span>{i < playbookStep ? "✓" : String(i + 1).padStart(2,"0")}</span>
                <div>
                  <b>{step.title}</b>
                  <small>{i <= playbookStep ? step.description : "This step unlocks as you move through the playbook."}</small>
                  {i === playbookStep && i === 2 && <div className="playbook-actions" role="group" aria-label="Choose a simulated response action">{[["Block indicator", "Add a block rule after validation."], ["Isolate endpoint", "Contain a device; requires approval."], ["Escalate for review", "Ask an analyst to verify context."], ["Allow after verification", "Close only after owner confirmation."]].map(([action, detail]) => <button type="button" className={playbookAction === action ? "action-selected" : ""} key={action} onClick={() => setPlaybookAction(action)}><b>{action}</b><small>{detail}</small></button>)}</div>}
                  {i === playbookStep && i === 3 && <div className="playbook-review"><b>RESPONSE PLAN</b><p>{playbookAction || "No response selected yet — return to the previous step to choose one."}</p><small>Require approval, retain evidence, and document a rollback or reassessment time before a real response.</small></div>}
                </div>
              </li>
            ))}
          </ol>
          <div className="playbook-outcome" aria-live="polite">
            {playbookStep < 0 ? "Waiting for an indicator to review." : playbookStep === playbookSteps.length - 1 ? "Review complete. Your choice remains a local simulation; no action was executed." : `STEP ${String(playbookStep + 1).padStart(2,"0")} / 04 · ${playbookSteps[playbookStep].title}`}
          </div>
        </div>
      )}
      {tab === "ATT&CK MAP" && (
        <div className="attack-view" id="cyber-panel" role="tabpanel" aria-labelledby={`cyber-tab-${tabSlug("ATT&CK MAP")}`} tabIndex={0}>
          <div className="attack-list">
            <span className="eyebrow">ILLUSTRATIVE MAPPINGS</span>
            {alerts.map((alert) => (
              <button
                key={alert.id}
                className={mapped.id === alert.id ? "selected" : ""}
                onClick={() => setMappedId(alert.id)}
              >
                <span>{alert.id}</span>
                <b>{alert.technique}</b>
              </button>
            ))}
          </div>
          <div className="attack-detail">
            <span className="attack-code">
              {mapped.technique.split(" · ")[0]}
            </span>
            <span className={`severity ${mapped.severity.toLowerCase()}`}>
              {mapped.severity} SAMPLE
            </span>
            <h3>{mapped.title}</h3>
            <p>{mapped.rationale}</p>
            <div className="investigation">
              <b>TRAINING NOTE</b>
              <p>
                Technique selection is illustrative and must be validated
                against the full event chain and platform details. This is not a
                threat-intelligence lookup.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    {zoomInfo && createPortal(
      <aside key={zoomInfo.title} className="cyber-zoom-popup" role="status" aria-live="polite" aria-atomic="true">
        <span className="cyber-zoom-kicker">SECURITY OPERATIONS RANGE · 2× DETAIL</span>
        <h3>{zoomInfo.title}</h3>
        {zoomInfo.meta && <span className="cyber-zoom-meta">{zoomInfo.meta}</span>}
        <p>{zoomInfo.detail}</p>
        <small>Move away or press Esc to dismiss</small>
      </aside>,
      document.body,
    )}
    </>
  );
}
