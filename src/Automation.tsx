import { useEffect, useMemo, useRef, useState } from "react";
import type { BlockKind, DragNode, DraftEdge, FlowEdge, FlowNode, FlowTemplate, LogEntry, Port } from "./features/automation/automationTypes";
import { defaultDetail, defaultTitle, kindIcons, kindLabels, palette, templates } from "./features/automation/automationData";

const NODE_W = 172;
const NODE_H = 138;

function makeCustomWorkflow(): FlowTemplate {
  return {
    id: "custom", title: "My workflow", summary: "Connect blocks, set a condition, then run a local sample through your path.",
    scenario: "event=sample · priority=high · status=ready",
    nodes: [{ id: "c1", kind: "trigger", title: "New sample event", detail: "Start with a sample event. Select this block to edit its description.", x: 70, y: 190 }], edges: [],
  };
}

export default function Automation() {
  const [workflow, setWorkflow] = useState<FlowTemplate | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragNode, setDragNode] = useState<DragNode | null>(null);
  const [draftEdge, setDraftEdge] = useState<DraftEdge | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [runLog, setRunLog] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const runner = useRef(0);
  const runTimer = useRef<number | undefined>(undefined);
  const node = nodes.find((item) => item.id === selectedNode) ?? null;
  const customMode = workflow?.id === "custom";
  const width = Math.max(1260, ...nodes.map((item) => item.x + NODE_W + 40));
  const height = Math.max(520, ...nodes.map((item) => item.y + NODE_H + 70));
  const edgeGeometry = useMemo(() => edges.flatMap((edge) => {
    const source = nodes.find((item) => item.id === edge.source);
    const target = nodes.find((item) => item.id === edge.target);
    if (!source || !target) return [];
    const sy = source.y + (source.kind === "decision" ? edge.sourcePort === "yes" ? 42 : 102 : NODE_H / 2);
    const sx = source.x + NODE_W;
    const tx = target.x;
    const ty = target.y + NODE_H / 2;
    const bend = Math.max(50, Math.abs(tx - sx) * .45);
    return [{ ...edge, sx, sy, tx, ty, path: `M ${sx} ${sy} C ${sx + bend} ${sy}, ${tx - bend} ${ty}, ${tx} ${ty}`, lx: (sx + tx) / 2, ly: (sy + ty) / 2 }];
  }), [edges, nodes]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (dragNode && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.max(12, event.clientX - rect.left + canvasRef.current.scrollLeft - dragNode.offsetX);
        const y = Math.max(12, event.clientY - rect.top + canvasRef.current.scrollTop - dragNode.offsetY);
        setNodes((items) => items.map((item) => item.id === dragNode.id ? { ...item, x, y } : item));
      }
      if (draftEdge) setDraftEdge((item) => item ? { ...item, clientX: event.clientX, clientY: event.clientY } : null);
    };
    const up = (event: PointerEvent) => {
      if (draftEdge) {
        const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-workflow-target]");
        const target = hit?.dataset.workflowTarget;
        if (target && target !== draftEdge.source) {
          setEdges((items) => {
            if (items.some((edge) => edge.source === draftEdge.source && edge.sourcePort === draftEdge.port)) return items;
            if (items.some((edge) => edge.target === target)) return items;
            return [...items, { id: `edge-${Date.now()}-${items.length}`, source: draftEdge.source, sourcePort: draftEdge.port, target }];
          });
        }
        setDraftEdge(null);
      }
      setDragNode(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragNode, draftEdge]);

  useEffect(() => () => { runner.current += 1; window.clearTimeout(runTimer.current); }, []);

  const openWorkflow = (template: FlowTemplate) => {
    runner.current += 1;
    window.clearTimeout(runTimer.current);
    const next = { ...template, nodes: template.nodes.map((item) => ({ ...item })), edges: template.edges.map((item) => ({ ...item })) };
    setWorkflow(next); setNodes(next.nodes); setEdges(next.edges); setSelectedNode(next.nodes[0]?.id ?? null);
    setActiveNode(null); setVisited([]); setRunLog([]); setRunning(false);
  };
  const backToLibrary = () => { runner.current += 1; window.clearTimeout(runTimer.current); setRunning(false); setWorkflow(null); setNodes([]); setEdges([]); setSelectedNode(null); setActiveNode(null); setVisited([]); setRunLog([]); };
  const addBlock = (kind: BlockKind) => {
    if (running) return;
    const index = nodes.filter((item) => item.kind !== "trigger").length;
    const next: FlowNode = { id: `custom-${Date.now()}-${index}`, kind, title: defaultTitle(kind), detail: defaultDetail(kind), ...(kind === "decision" ? { match: "ready" } : {}), x: 360 + (index % 4) * 248, y: 150 + Math.floor(index / 4) * 205 };
    setNodes((items) => [...items, next]); setSelectedNode(next.id); setRunLog([]); setVisited([]);
  };
  const updateNode = (id: string, patch: Partial<FlowNode>) => setNodes((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  const removeSelected = () => {
    if (!node || node.kind === "trigger" || running) return;
    setNodes((items) => items.filter((item) => item.id !== node.id));
    setEdges((items) => items.filter((edge) => edge.source !== node.id && edge.target !== node.id));
    setSelectedNode(nodes.find((item) => item.kind === "trigger")?.id ?? null);
  };
  const beginNodeDrag = (event: React.PointerEvent, item: FlowNode) => {
    if (!canvasRef.current || running) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setSelectedNode(item.id);
    setDragNode({ id: item.id, offsetX: event.clientX - rect.left + canvasRef.current.scrollLeft - item.x, offsetY: event.clientY - rect.top + canvasRef.current.scrollTop - item.y });
  };
  const beginConnection = (event: React.PointerEvent, item: FlowNode, port: Port) => {
    if (!canvasRef.current || running) return;
    event.preventDefault(); event.stopPropagation(); setSelectedNode(item.id);
    setDraftEdge({ source: item.id, port, clientX: event.clientX, clientY: event.clientY });
  };
  const pointInCanvas = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return rect ? { x: clientX - rect.left + (canvasRef.current?.scrollLeft ?? 0), y: clientY - rect.top + (canvasRef.current?.scrollTop ?? 0) } : { x: 0, y: 0 };
  };
  const connectDraft = draftEdge ? (() => {
    const from = nodes.find((item) => item.id === draftEdge.source);
    const point = pointInCanvas(draftEdge.clientX, draftEdge.clientY);
    if (!from) return "";
    const sy = from.y + (from.kind === "decision" ? draftEdge.port === "yes" ? 42 : 102 : NODE_H / 2);
    const sx = from.x + NODE_W;
    const bend = Math.max(50, Math.abs(point.x - sx) * .45);
    return `M ${sx} ${sy} C ${sx + bend} ${sy}, ${point.x - bend} ${point.y}, ${point.x} ${point.y}`;
  })() : "";

  const runWorkflow = async () => {
    if (running) { runner.current += 1; window.clearTimeout(runTimer.current); setRunning(false); setActiveNode(null); return; }
    const start = nodes.find((item) => item.kind === "trigger");
    if (!start) { setRunLog([{ node: "Workflow check", kind: "review", message: "Add a trigger block before running this workflow.", outcome: "branch" }]); return; }
    const runId = ++runner.current;
    setRunning(true); setRunLog([]); setVisited([]); setActiveNode(null);
    const sample = workflow?.scenario.toLowerCase() ?? "event=sample · status=ready";
    const seen = new Set<string>();
    let current: FlowNode | undefined = start;
    for (let step = 0; current && step < 32; step += 1) {
      if (runId !== runner.current) return;
      const active: FlowNode = current;
      const activeId: string = active.id;
      if (seen.has(activeId)) {
        setRunLog((items) => [...items, { node: "Workflow guard", kind: "review", message: "A loop was detected. The local simulator stopped to prevent an endless run.", outcome: "branch" }]);
        break;
      }
      seen.add(activeId); setActiveNode(activeId); setVisited((items) => [...items, activeId]);
      let message = active.detail;
      let outcome: LogEntry["outcome"] = "complete";
      let port: Port = "next";
      if (active.kind === "trigger") message = `Loaded sample event: ${sample}. No external event source was contacted.`;
      if (active.kind === "validate") message = `Required sample fields checked. ${active.detail}`;
      if (active.kind === "enrich") message = `Added local context to the sample. ${active.detail}`;
      if (active.kind === "decision") {
        const condition: string = active.match?.trim().toLowerCase() ?? "";
        const matched: boolean = Boolean(condition) && sample.includes(condition);
        port = matched ? "yes" : "no"; outcome = "branch";
        message = `Condition “${active.match || "(empty)"}” ${matched ? "matched" : "did not match"} the sample, so the ${matched ? "Yes" : "No"} branch was followed.`;
      }
      if (active.kind === "action") message = `Simulated action: ${active.detail} No real system or account was changed.`;
      if (active.kind === "review") message = `Human review checkpoint: ${active.detail} The workflow pauses for an approval decision in a real system.`;
      if (active.kind === "notify") message = `Notification preview prepared locally. Nothing was sent. ${active.detail}`;
      setRunLog((items) => [...items, { node: active.title, kind: active.kind, message, outcome }]);
      await new Promise<void>((resolve) => { runTimer.current = window.setTimeout(resolve, 560); });
      if (runId !== runner.current) return;
      const edge: FlowEdge | undefined = edges.find((item) => item.source === activeId && item.sourcePort === port);
      if (!edge) {
        if (active.kind === "decision") setRunLog((items) => [...items, { node: "Branch not connected", kind: "review", message: `The ${port === "yes" ? "Yes" : "No"} output has no connected block yet. Connect it to continue this route.`, outcome: "branch" }]);
        break;
      }
      const nextNode: FlowNode | undefined = nodes.find((item) => item.id === edge.target);
      current = nextNode;
    }
    if (runId === runner.current) { setRunning(false); setActiveNode(null); }
  };

  if (!workflow) return (
    <div className="workflow automation-workflow automation-library">
      <div className="automation-library-head"><span>START WITH A WORKFLOW</span><h3>Choose a starting point</h3><p>Explore two realistic examples, or build a flow yourself. Every run uses sample data in this browser.</p></div>
      <div className="automation-template-grid">
        {templates.map((template) => <article className="automation-template-card" key={template.id}>
          <div className="automation-template-meta"><span>{template.id === "security" ? "SECURITY OPERATIONS" : "INQUIRY AUTOMATION"}</span><b>08 BLOCKS · YES / NO</b></div>
          <h4>{template.title}</h4><p>{template.summary}</p>
          <div className="automation-template-path"><span>{template.nodes[0].title}</span><i>→</i><span>{template.nodes[3].title}</span><b>YES / NO</b></div>
          <button type="button" className="button-primary" onClick={() => openWorkflow(template)}>Open workflow <span>↗</span></button>
        </article>)}
      </div>
      <button type="button" className="automation-own-cta" onClick={() => openWorkflow(makeCustomWorkflow())}><span className="automation-own-icon">＋</span><span><b>Make Your Own Workflow and Understand</b><small>Add blocks, connect the Yes/No paths, and read what each step does as it runs.</small></span><i>→</i></button>
      <div className="automation-library-foot"><span><i /> LOCAL SIMULATOR</span><span>NO THIRD-PARTY SERVICE · NO DATA SENT</span></div>
    </div>
  );

  return (
    <div className="workflow automation-workflow automation-editor">
      <header className="automation-editor-head">
        <div><span>WORKFLOW EDITOR / LOCAL SIMULATION</span><h3>{workflow.title}</h3><p>{workflow.summary}</p></div>
        <div className="automation-editor-actions"><span className="automation-sample-chip">SAMPLE: {workflow.scenario}</span><button type="button" className="automation-back-button" onClick={backToLibrary}>← Workflows</button></div>
      </header>
      <div className="automation-builder-toolbar">
        <div><span className="automation-toolbar-label">ADD A BLOCK</span>{palette.map((kind) => <button type="button" key={kind} onClick={() => addBlock(kind)} disabled={!customMode || running} title={customMode ? `Add ${kindLabels[kind].toLowerCase()} block` : "Choose Make Your Own Workflow to add and edit blocks"}><i>{kindIcons[kind]}</i>{kindLabels[kind]}</button>)}</div>
        <span className="automation-connect-hint">Drag a right-hand port to a block’s left port. Decision blocks branch Yes / No.</span>
      </div>
      <div className="automation-canvas-scroll" ref={canvasRef}>
        <div className="automation-canvas-surface" style={{ width, height }}>
          <svg className="automation-edges" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <defs><marker id="automation-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" /></marker></defs>
            {edgeGeometry.map((edge) => <g key={edge.id} className={visited.includes(edge.source) && visited.includes(edge.target) ? "automation-edge is-traversed" : "automation-edge"}>
              <path d={edge.path} markerEnd="url(#automation-arrow)" onClick={() => !running && setEdges((items) => items.filter((item) => item.id !== edge.id))} />
              {nodes.find((item) => item.id === edge.source)?.kind === "decision" && <text x={edge.lx} y={edge.ly - 8}>{edge.sourcePort === "yes" ? "YES" : "NO"}</text>}
            </g>)}
            {connectDraft && <path className="automation-edge-draft" d={connectDraft} />}
          </svg>
          {nodes.map((item) => <article key={item.id} className={`automation-node-card kind-${item.kind} ${selectedNode === item.id ? "is-selected" : ""} ${activeNode === item.id ? "is-running" : ""} ${visited.includes(item.id) ? "is-visited" : ""}`} style={{ left:item.x, top:item.y, width:NODE_W, minHeight:NODE_H }} onClick={() => setSelectedNode(item.id)}>
            {item.kind !== "trigger" && <button type="button" className="automation-port automation-port-in" aria-label={`Connect into ${item.title}`} data-workflow-target={item.id} title="Drop a connection here" />}
            <button type="button" className="automation-node-drag" onPointerDown={(event) => beginNodeDrag(event, item)} aria-label={`Move ${item.title}`}>
              <span className="automation-node-icon">{kindIcons[item.kind]}</span><span className="automation-node-heading"><small>{kindLabels[item.kind]}</small><b>{item.title}</b></span><span className="automation-node-state">{activeNode === item.id ? "RUNNING" : visited.includes(item.id) ? "DONE" : "READY"}</span>
            </button>
            <p>{item.detail}</p>
            {item.kind === "decision" && <div className="automation-branch-labels"><span>YES</span><span>NO</span></div>}
            {item.kind === "decision" ? <><button type="button" className="automation-port automation-port-out port-yes" aria-label={`Connect ${item.title} Yes branch`} onPointerDown={(event) => beginConnection(event,item,"yes")} /><button type="button" className="automation-port automation-port-out port-no" aria-label={`Connect ${item.title} No branch`} onPointerDown={(event) => beginConnection(event,item,"no")} /></> : <button type="button" className="automation-port automation-port-out" aria-label={`Connect from ${item.title}`} onPointerDown={(event) => beginConnection(event,item,"next")} />}
          </article>)}
        </div>
      </div>
      {node && <section className="automation-inspector" aria-label="Selected block settings">
        <div className="automation-inspector-title"><span>BLOCK SETTINGS</span><b>{kindLabels[node.kind]}</b></div>
        <label>Block name<input value={node.title} disabled={!customMode || running} onChange={(event) => updateNode(node.id,{ title:event.target.value })} /></label>
        <label>What this block does<textarea value={node.detail} disabled={!customMode || running} rows={2} onChange={(event) => updateNode(node.id,{ detail:event.target.value })} /></label>
        {node.kind === "decision" && <label>YES when sample contains<input value={node.match ?? ""} disabled={!customMode || running} onChange={(event) => updateNode(node.id,{ match:event.target.value })} placeholder="for example: priority=high" /></label>}
        {!customMode && <span className="automation-inspector-note">Open “Make Your Own Workflow and Understand” to edit this example.</span>}
        {customMode && node.kind !== "trigger" && <button type="button" className="automation-delete-block" disabled={running} onClick={removeSelected}>Remove block</button>}
      </section>}
      <div className="automation-runbar"><div><span className="automation-live-dot" />{running ? "RUNNING SAMPLE PATH" : "READY TO RUN"}<small>Simulation stays in this browser</small></div><button type="button" className="button-primary" onClick={runWorkflow}>{running ? "Stop run ■" : runLog.length ? "Run again ↻" : "Run workflow ▶"}</button></div>
      <section className="automation-log" aria-live="polite" aria-label="Workflow execution log">
        <div className="automation-log-head"><div><span>EXECUTION LOG</span><h4>What the workflow is doing</h4></div><small>{runLog.length ? `${runLog.length} CHECKPOINT${runLog.length === 1 ? "" : "S"}` : "LIVE EXPLANATION"}</small></div>
        {runLog.length === 0 ? <p className="automation-log-empty">Run the workflow to watch each block process the sample and explain the route it takes.</p> : <ol>{runLog.map((entry,index) => <li key={`${index}-${entry.node}`} className={entry.outcome === "branch" ? "is-branch" : ""}><span className="automation-log-index">{String(index+1).padStart(2,"0")}</span><span className="automation-log-content"><b>{entry.node}</b><small>{kindLabels[entry.kind]}{entry.outcome === "branch" ? " · ROUTING DECISION" : " · COMPLETE"}</small><p>{entry.message}</p></span></li>)}</ol>}
      </section>
      <div className="automation-editor-foot"><span><i /> LOCAL SAMPLE DATA</span><span>NO REAL DEVICE, EMAIL, OR ACCOUNT ACTIONS</span></div>
    </div>
  );
}
