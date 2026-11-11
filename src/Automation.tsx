import { useEffect, useMemo, useRef, useState } from "react";
import type { BlockKind, DragNode, DraftEdge, ExecutionPath, FlowEdge, FlowNode, FlowTemplate, Port } from "./features/automation/automationTypes";
import { defaultDetail, defaultTitle, kindIcons, kindLabels, palette, templates } from "./features/automation/automationData";
import { edgeHasValidPort, executeWorkflow, simulateAllPaths, validateWorkflow } from "./features/automation/workflowEngine";

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
  const [executionPaths, setExecutionPaths] = useState<ExecutionPath[]>([]);
  const [selectedExecution, setSelectedExecution] = useState(0);
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [connectSource, setConnectSource] = useState<{ id: string; port: Port } | null>(null);
  const [connectFeedback, setConnectFeedback] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const runner = useRef(0);
  const runTimer = useRef<number | undefined>(undefined);
  const panStart = useRef<{ pointerId: number; x: number; y: number; left: number; top: number } | null>(null);
  const pinchStart = useRef<{ distance: number; zoom: number; centerX: number; centerY: number } | null>(null);
  const node = nodes.find((item) => item.id === selectedNode) ?? null;
  const customMode = workflow?.id === "custom";
  const selectedPath = executionPaths[selectedExecution] ?? null;
  const validationIssues = useMemo(() => validateWorkflow(nodes, edges), [nodes, edges]);
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
      if (panStart.current?.pointerId === event.pointerId && canvasRef.current) {
        canvasRef.current.scrollLeft = panStart.current.left - (event.clientX - panStart.current.x);
        canvasRef.current.scrollTop = panStart.current.top - (event.clientY - panStart.current.y);
      }
      if (dragNode && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.max(12, (event.clientX - rect.left + canvasRef.current.scrollLeft) / canvasZoom - dragNode.offsetX);
        const y = Math.max(12, (event.clientY - rect.top + canvasRef.current.scrollTop) / canvasZoom - dragNode.offsetY);
        setNodes((items) => items.map((item) => item.id === dragNode.id ? { ...item, x, y } : item));
      }
      if (draftEdge) setDraftEdge((item) => item ? { ...item, clientX: event.clientX, clientY: event.clientY } : null);
    };
    const up = (event: PointerEvent) => {
      if (draftEdge) {
        const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-workflow-target]");
        const target = hit?.dataset.workflowTarget;
        if (target && target !== draftEdge.source) {
          const source = nodes.find((item) => item.id === draftEdge.source);
          const targetNode = nodes.find((item) => item.id === target);
          const invalid = !source || !targetNode || targetNode.kind === "trigger" || source.id === target || !edgeHasValidPort(source, draftEdge.port)
            || edges.some((edge) => edge.source === draftEdge.source && edge.sourcePort === draftEdge.port)
            || edges.some((edge) => edge.target === target);
          if (!invalid && targetNode) {
            setEdges((items) => [...items, { id: `edge-${Date.now()}-${items.length}`, source: draftEdge.source, sourcePort: draftEdge.port, target }]);
            setConnectSource({ id: target, port: targetNode.kind === "decision" ? "yes" : "next" });
            setConnectFeedback("Connection added. Choose the next output or tap the selected output to cancel.");
          } else setConnectFeedback(targetNode?.kind === "trigger" ? "Connections cannot point into the trigger block." : "That connection is not available. Check direction, branch, and existing links.");
        }
        setDraftEdge(null);
        setExecutionPaths([]);
      }
      setDragNode(null);
      if (panStart.current?.pointerId === event.pointerId) panStart.current = null;
    };
    const cancel = () => { panStart.current = null; setDragNode(null); setDraftEdge(null); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", cancel); };
  }, [dragNode, draftEdge, canvasZoom, nodes, edges]);

  useEffect(() => () => { runner.current += 1; window.clearTimeout(runTimer.current); }, []);

  useEffect(() => {
    const navigateCanvas = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (connectSource || draftEdge)) {
        setConnectSource(null); setDraftEdge(null); setConnectFeedback("Connection cancelled.");
        return;
      }
      const target = event.target as HTMLElement | null;
      if (!target || !target.closest(".automation-canvas-surface") || target.matches("input,textarea,select,button")) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        if (customMode && node && node.kind !== "trigger") { event.preventDefault(); removeSelected(); }
        return;
      }
      const direction = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, [number, number]>)[event.key];
      if (!direction || !selectedNode) return;
      const current = nodes.find((item) => item.id === selectedNode);
      if (!current) return;
      const candidates = nodes.map((item) => ({ item, dx: item.x - current.x, dy: item.y - current.y })).filter(({ dx, dy }) => direction[0] ? dx * direction[0] > 0 : dy * direction[1] > 0).sort((a, b) => Math.hypot(a.dx, a.dy) - Math.hypot(b.dx, b.dy));
      if (candidates[0]) { event.preventDefault(); setSelectedNode(candidates[0].item.id); document.querySelector<HTMLElement>(`[data-workflow-node="${CSS.escape(candidates[0].item.id)}"]`)?.focus(); }
    };
    window.addEventListener("keydown", navigateCanvas);
    return () => window.removeEventListener("keydown", navigateCanvas);
  }, [connectSource, draftEdge, customMode, node, selectedNode, nodes]);

  const openWorkflow = (template: FlowTemplate) => {
    runner.current += 1;
    window.clearTimeout(runTimer.current);
    const next = { ...template, nodes: template.nodes.map((item) => ({ ...item })), edges: template.edges.map((item) => ({ ...item })) };
    setWorkflow(next); setNodes(next.nodes); setEdges(next.edges); setSelectedNode(next.nodes[0]?.id ?? null);
    setActiveNode(null); setExecutionPaths([]); setSelectedExecution(0); setCompletedNodeIds([]); setRunning(false);
  };
  const backToLibrary = () => { runner.current += 1; window.clearTimeout(runTimer.current); setRunning(false); setWorkflow(null); setNodes([]); setEdges([]); setSelectedNode(null); setActiveNode(null); setExecutionPaths([]); setSelectedExecution(0); setCompletedNodeIds([]); };
  const addBlock = (kind: BlockKind) => {
    if (running) return;
    const index = nodes.filter((item) => item.kind !== "trigger").length;
    const next: FlowNode = { id: `custom-${Date.now()}-${index}`, kind, title: defaultTitle(kind), detail: defaultDetail(kind), ...(kind === "decision" ? { match: "ready" } : {}), x: 360 + (index % 4) * 248, y: 150 + Math.floor(index / 4) * 205 };
    setNodes((items) => [...items, next]); setSelectedNode(next.id); setExecutionPaths([]); setCompletedNodeIds([]);
  };
  const updateNode = (id: string, patch: Partial<FlowNode>) => { setNodes((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item)); setExecutionPaths([]); };
  const removeSelected = () => {
    if (!node || node.kind === "trigger" || running) return;
    setNodes((items) => items.filter((item) => item.id !== node.id));
    setEdges((items) => items.filter((edge) => edge.source !== node.id && edge.target !== node.id));
    setSelectedNode(nodes.find((item) => item.kind === "trigger")?.id ?? null);
    setExecutionPaths([]);
  };
  const beginNodeDrag = (event: React.PointerEvent, item: FlowNode) => {
    if (!canvasRef.current || running) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setSelectedNode(item.id);
    setSettingsOpen(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragNode({ id: item.id, offsetX: (event.clientX - rect.left + canvasRef.current.scrollLeft) / canvasZoom - item.x, offsetY: (event.clientY - rect.top + canvasRef.current.scrollTop) / canvasZoom - item.y });
  };
  const beginConnection = (event: React.PointerEvent<HTMLButtonElement>, item: FlowNode, port: Port) => {
    if (!canvasRef.current || running || !edgeHasValidPort(item, port)) return;
    event.preventDefault(); event.stopPropagation(); setSelectedNode(item.id);
    if (connectSource?.id === item.id && connectSource.port === port) {
      setConnectSource(null); setDraftEdge(null); setConnectFeedback("Connection selection cancelled."); return;
    }
    setConnectFeedback(null);
    setConnectSource((current) => current?.id === item.id && current.port === port ? null : { id: item.id, port });
    if (event.pointerType === "touch") event.currentTarget.setPointerCapture(event.pointerId);
    setDraftEdge({ source: item.id, port, clientX: event.clientX, clientY: event.clientY });
  };
  const beginCanvasPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (running || !canvasRef.current || (event.target as HTMLElement).closest(".automation-node-card, .automation-port")) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    panStart.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop };
  };
  const handleCanvasTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !canvasRef.current) return;
    const [a, b] = Array.from(event.touches);
    pinchStart.current = { distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY), zoom: canvasZoom, centerX: (a.clientX + b.clientX) / 2, centerY: (a.clientY + b.clientY) / 2 };
  };
  const handleCanvasTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !pinchStart.current || !canvasRef.current) return;
    event.preventDefault();
    const [a, b] = Array.from(event.touches);
    const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    const nextZoom = Math.max(.35, Math.min(1.5, pinchStart.current.zoom * distance / Math.max(1, pinchStart.current.distance)));
    const centerX = (a.clientX + b.clientX) / 2;
    const centerY = (a.clientY + b.clientY) / 2;
    const rect = canvasRef.current.getBoundingClientRect();
    const logicalX = (canvasRef.current.scrollLeft + centerX - rect.left) / canvasZoom;
    const logicalY = (canvasRef.current.scrollTop + centerY - rect.top) / canvasZoom;
    setCanvasZoom(nextZoom);
    canvasRef.current.scrollLeft = logicalX * nextZoom - (centerX - rect.left);
    canvasRef.current.scrollTop = logicalY * nextZoom - (centerY - rect.top);
    pinchStart.current.centerX = centerX;
    pinchStart.current.centerY = centerY;
  };
  const handleCanvasTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => { if (event.touches.length < 2) pinchStart.current = null; };
  const addConnection = (sourceId: string, port: Port, targetId: string) => {
    const source = nodes.find((item) => item.id === sourceId);
    const target = nodes.find((item) => item.id === targetId);
    if (!source || !target) { setConnectFeedback("Choose an existing source and destination block."); return; }
    if (target.kind === "trigger") { setConnectFeedback("Connections cannot point into the trigger block."); return; }
    if (sourceId === targetId) { setConnectFeedback("A block cannot connect to itself."); return; }
    if (!edgeHasValidPort(source, port)) { setConnectFeedback(`The ${source.kind} block does not have a ${port} output.`); return; }
    if (edges.some((edge) => edge.source === sourceId && edge.sourcePort === port)) { setConnectFeedback("That output already has a connection. Remove it before connecting another block."); return; }
    if (edges.some((edge) => edge.target === targetId)) { setConnectFeedback("That block already has an incoming connection."); return; }
    setEdges((items) => {
      if (items.some((edge) => edge.source === sourceId && edge.sourcePort === port) || items.some((edge) => edge.target === targetId)) return items;
      return [...items, { id: `edge-${Date.now()}-${items.length}`, source: sourceId, sourcePort: port, target: targetId }];
    });
    setConnectSource({ id: targetId, port: target.kind === "decision" ? "yes" : "next" });
    setDraftEdge(null);
    setConnectFeedback("Connection added.");
    setExecutionPaths([]);
  };
  const pointInCanvas = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return rect ? { x: (clientX - rect.left + (canvasRef.current?.scrollLeft ?? 0)) / canvasZoom, y: (clientY - rect.top + (canvasRef.current?.scrollTop ?? 0)) / canvasZoom } : { x: 0, y: 0 };
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

  const animateExecution = async (path: ExecutionPath) => {
    const runId = ++runner.current;
    setRunning(true); setActiveNode(null); setCompletedNodeIds([]);
    for (const id of path.visitedNodeIds) {
      if (runId !== runner.current) return;
      setActiveNode(id);
      await new Promise<void>((resolve) => { runTimer.current = window.setTimeout(resolve, 320); });
      if (runId !== runner.current) return;
      setCompletedNodeIds((items) => [...items, id]);
    }
    setActiveNode(null); setRunning(false);
  };
  const runWorkflow = () => {
    if (running) return;
    const { path } = executeWorkflow(nodes, edges, workflow?.scenario ?? '');
    setExecutionPaths([path]); setSelectedExecution(0);
    void animateExecution(path);
  };
  const simulateWorkflow = () => {
    if (running) return;
    const { paths } = simulateAllPaths(nodes, edges);
    setExecutionPaths(paths); setSelectedExecution(0); setActiveNode(null); setCompletedNodeIds([]);
  };
  const stopWorkflow = () => {
    runner.current += 1; window.clearTimeout(runTimer.current);
    const complete = new Set(completedNodeIds);
    setExecutionPaths((items) => items.map((path) => path.id !== "run" ? path : {
      ...path,
      outcome: "incomplete",
      nodeStates: Object.fromEntries(Object.entries(path.nodeStates).map(([id, status]) => [id, status === "failed" ? status : complete.has(id) ? "completed" : "skipped"])),
      log: path.log.map((entry) => complete.has(entry.nodeId) || entry.outcome === "failed" ? entry : { ...entry, outcome: "skipped", message: "Not reached because the run was stopped." }),
    }));
    setRunning(false); setActiveNode(null);
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
      {validationIssues.length > 0 && <section className="automation-validation" aria-label="Workflow validation">
        {validationIssues.map((issue, index) => <p key={`${issue.code}-${index}`} className={`is-${issue.severity}`}><b>{issue.severity === "error" ? "CHECK" : "NOTE"}</b>{issue.message}</p>)}
      </section>}
      <div className="automation-canvas-tools" role="toolbar" aria-label="Workflow canvas controls">
        <div className="automation-zoom-tools" aria-label="Zoom controls">
          <button type="button" aria-label="Zoom out" onClick={() => setCanvasZoom((value) => Math.max(.35, Math.round((value - .1) * 100) / 100))}>−</button>
          <span>{Math.round(canvasZoom * 100)}%</span>
          <button type="button" aria-label="Zoom in" onClick={() => setCanvasZoom((value) => Math.min(1.5, Math.round((value + .1) * 100) / 100))}>+</button>
          <button type="button" aria-label="Fit to screen" onClick={() => { if (!canvasRef.current) return; const fit = Math.min(1, (canvasRef.current.clientWidth - 24) / width); setCanvasZoom(Math.max(.35, Math.round(fit * 100) / 100)); canvasRef.current.scrollTo({ left: 0, top: 0 }); }}>Fit to Screen</button>
        </div>
      </div>
      {(connectSource || connectFeedback) && <small className="automation-touch-connect-feedback" role="status">{connectFeedback ?? "Output selected. Tap another block’s input, or tap this output again to cancel."}</small>}
      <div className="automation-canvas-scroll" ref={canvasRef} onPointerDown={beginCanvasPan} onTouchStart={handleCanvasTouchStart} onTouchMove={handleCanvasTouchMove} onTouchEnd={handleCanvasTouchEnd} onTouchCancel={handleCanvasTouchEnd}>
        <div className="automation-canvas-stage" style={{ width: width * canvasZoom, height: height * canvasZoom }}>
        <div className="automation-canvas-surface" style={{ width, height, zoom: canvasZoom }}>
          <svg className="automation-edges" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <defs><marker id="automation-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" /></marker></defs>
            {edgeGeometry.map((edge) => {
              const chosen = selectedPath?.selectedEdgeIds.includes(edge.id) ?? false;
              const sourceState = selectedPath?.branchOutcomes[edge.source];
              const skipped = Boolean(sourceState && (edge.sourcePort === "yes" || edge.sourcePort === "no") && edge.sourcePort !== sourceState);
              return <g key={edge.id} className={`automation-edge ${chosen ? "is-traversed" : ""} ${skipped ? "is-skipped" : ""} ${selectedPath?.branchOutcomes[edge.source] === edge.sourcePort ? `branch-${edge.sourcePort}` : ""}`}>
              <path d={edge.path} markerEnd="url(#automation-arrow)" onClick={() => { if (!running) { setEdges((items) => items.filter((item) => item.id !== edge.id)); setExecutionPaths([]); } }} />
              {nodes.find((item) => item.id === edge.source)?.kind === "decision" && <text x={edge.lx} y={edge.ly - 8}>{edge.sourcePort === "yes" ? "YES" : "NO"}</text>}
            </g>;
            })}
            {connectDraft && <path className="automation-edge-draft" d={connectDraft} />}
          </svg>
          {nodes.map((item) => {
            const pathStatus = selectedPath?.nodeStates[item.id] ?? "pending";
            const status = pathStatus === "failed" ? "failed" : selectedPath?.id === "run" && running ? activeNode === item.id ? "running" : completedNodeIds.includes(item.id) ? "completed" : "pending" : pathStatus;
            return <article key={item.id} data-workflow-node={item.id} role="group" tabIndex={0} aria-label={`${item.title}, ${status}`} className={`automation-node-card kind-${item.kind} is-${status} ${selectedNode === item.id ? "is-selected" : ""}`} style={{ left:item.x, top:item.y, width:NODE_W, minHeight:NODE_H }} onClick={() => { setSelectedNode(item.id); setSettingsOpen(true); }} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) { setSelectedNode(item.id); setSettingsOpen(true); } }}>
            {item.kind !== "trigger" && <button type="button" className={`automation-port automation-port-in ${connectSource ? "is-connect-target" : ""}`} aria-label={`Connect into ${item.title}`} data-workflow-target={item.id} title="Drop a connection here" onClick={(event) => { event.stopPropagation(); if (connectSource) addConnection(connectSource.id, connectSource.port, item.id); }} />}
            <button type="button" className="automation-node-drag" onPointerDown={(event) => beginNodeDrag(event, item)} aria-label={`Select and move ${item.title}`}>
              <span className="automation-node-icon">{kindIcons[item.kind]}</span><span className="automation-node-heading"><small>{kindLabels[item.kind]}</small><b>{item.title}</b></span><span className="automation-node-state">{status.toUpperCase()}</span>
            </button>
            <p>{item.detail}</p>
            {item.kind === "decision" && <div className="automation-branch-labels"><span>YES</span><span>NO</span></div>}
            {item.kind === "decision" ? <><button type="button" className={`automation-port automation-port-out port-yes ${connectSource?.id === item.id && connectSource.port === "yes" ? "is-selected" : ""}`} aria-label={`Connect ${item.title} Yes branch`} aria-pressed={connectSource?.id === item.id && connectSource.port === "yes"} onPointerDown={(event) => beginConnection(event,item,"yes")} /><button type="button" className={`automation-port automation-port-out port-no ${connectSource?.id === item.id && connectSource.port === "no" ? "is-selected" : ""}`} aria-label={`Connect ${item.title} No branch`} aria-pressed={connectSource?.id === item.id && connectSource.port === "no"} onPointerDown={(event) => beginConnection(event,item,"no")} /></> : <button type="button" className={`automation-port automation-port-out ${connectSource?.id === item.id && connectSource.port === "next" ? "is-selected" : ""}`} aria-label={`Connect from ${item.title}`} aria-pressed={connectSource?.id === item.id && connectSource.port === "next"} onPointerDown={(event) => beginConnection(event,item,"next")} />}
          </article>;
          })}
        </div>
        </div>
      </div>
      {node && <section className={`automation-inspector ${settingsOpen ? "is-open" : ""}`} aria-label="Selected block settings">
        <div className="automation-inspector-title"><span>BLOCK SETTINGS</span><b>{kindLabels[node.kind]}</b><button type="button" className="automation-inspector-close" onClick={() => setSettingsOpen(false)}>Close</button></div>
        <label>Block name<input value={node.title} disabled={!customMode || running} onChange={(event) => updateNode(node.id,{ title:event.target.value })} /></label>
        <label>What this block does<textarea value={node.detail} disabled={!customMode || running} rows={2} onChange={(event) => updateNode(node.id,{ detail:event.target.value })} /></label>
        {node.kind === "decision" && <label>YES when sample contains<input value={node.match ?? ""} disabled={!customMode || running} onChange={(event) => updateNode(node.id,{ match:event.target.value })} placeholder="for example: priority=high" /></label>}
        {!customMode && <span className="automation-inspector-note">Open “Make Your Own Workflow and Understand” to edit this example.</span>}
        {customMode && node.kind !== "trigger" && <button type="button" className="automation-delete-block" disabled={running} onClick={removeSelected}>Remove block</button>}
      </section>}
      <div className="automation-runbar">
        <div><span className="automation-live-dot" />{running ? "RUNNING SAMPLE PATH" : selectedPath ? selectedPath.outcome.toUpperCase() : "READY TO RUN"}<small>{selectedPath?.label ?? "Actual run evaluates the configured sample"}</small></div>
        <div className="automation-execution-actions">
          {running ? <button type="button" className="automation-stop-button" onClick={stopWorkflow}>Stop run ■</button> : <>
            <button type="button" className="button-primary" onClick={runWorkflow}>Run workflow ▶</button>
            <button type="button" className="automation-simulate-button" onClick={simulateWorkflow}>Simulate all paths ↗</button>
          </>}
        </div>
      </div>
      {executionPaths.length > 0 && <div className="automation-path-list" role="tablist" aria-label="Execution paths">
        {executionPaths.map((path, index) => <button key={path.id} type="button" role="tab" aria-selected={selectedExecution === index} className={selectedExecution === index ? "is-active" : ""} onClick={() => { if (running) return; setSelectedExecution(index); setActiveNode(null); setCompletedNodeIds([]); }}>{path.label} <small>{path.outcome}</small></button>)}
      </div>}
      <section className="automation-log" aria-live="polite" aria-label="Workflow execution log">
        <div className="automation-log-head"><div><span>{selectedPath?.id.startsWith("simulation-") ? "SIMULATED TRACE" : "EXECUTION LOG"}</span><h4>{selectedPath?.label ?? "What the workflow is doing"}</h4></div><small>{selectedPath ? `${selectedPath.log.length} CHECKPOINT${selectedPath.log.length === 1 ? "" : "S"}` : "READY"}</small></div>
        {!selectedPath ? <p className="automation-log-empty">Run the workflow to evaluate its sample, or simulate all possible conditional paths without executing actions.</p> : <ol>{selectedPath.log.map((entry,index) => <li key={`${index}-${entry.nodeId}`} className={`is-${entry.outcome}`}><span className="automation-log-index">{String(index+1).padStart(2,"0")}</span><span className="automation-log-content"><b>{entry.node}</b><small>{kindLabels[entry.kind]} · {entry.outcome === "branch" ? `SELECTED ${selectedPath.branchOutcomes[entry.nodeId]?.toUpperCase()} BRANCH` : entry.outcome.toUpperCase()}</small><p>{entry.message}</p></span></li>)}</ol>}
      </section>
      <div className="automation-editor-foot"><span><i /> LOCAL SAMPLE DATA</span><span>NO REAL DEVICE, EMAIL, OR ACCOUNT ACTIONS</span></div>
    </div>
  );
}
