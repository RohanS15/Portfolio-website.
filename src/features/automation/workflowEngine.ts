import type { ExecutionPath, FlowEdge, FlowNode, Port } from "./automationTypes";

const MAX_STEPS = 256;
const MAX_PATHS = 128;

export type WorkflowIssue = { code: string; message: string; severity: "error" | "warning" };

export function validateWorkflow(nodes: FlowNode[], edges: FlowEdge[]): WorkflowIssue[] {
  const issues: WorkflowIssue[] = [];
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (!node.id || nodeIds.has(node.id)) issues.push({ code: "duplicate-node", severity: "error", message: `Node ID “${node.id || "(empty)"}” is missing or duplicated.` });
    nodeIds.add(node.id);
    if (!node.title.trim()) issues.push({ code: "empty-title", severity: "error", message: `A ${node.kind} block is missing a name.` });
    if (node.kind === "decision" && !node.match?.trim()) issues.push({ code: "empty-condition", severity: "error", message: `Decision “${node.title}” needs a condition before it can run against sample data.` });
  }
  const triggers = nodes.filter((node) => node.kind === "trigger");
  if (triggers.length !== 1) issues.push({ code: "trigger-count", severity: "error", message: triggers.length ? "A workflow must have exactly one trigger block." : "Add a trigger block before running the workflow." });

  const edgeIds = new Set<string>();
  const outgoingSlots = new Set<string>();
  for (const edge of edges) {
    if (!edge.id || edgeIds.has(edge.id)) issues.push({ code: "duplicate-edge-id", severity: "error", message: `Connection ID “${edge.id || "(empty)"}” is missing or duplicated.` });
    edgeIds.add(edge.id);
    const source = nodes.find((node) => node.id === edge.source);
    const target = nodes.find((node) => node.id === edge.target);
    if (!source || !target) {
      issues.push({ code: "dangling-edge", severity: "error", message: `Connection ${edge.id} refers to a missing block.` });
      continue;
    }
    if (target.kind === "trigger") issues.push({ code: "into-trigger", severity: "error", message: `Connection ${edge.id} cannot route into a trigger block.` });
    if (source.kind === "decision" ? edge.sourcePort === "next" : edge.sourcePort !== "next") issues.push({ code: "invalid-port", severity: "error", message: `Connection ${edge.id} uses an output that ${source.title} does not have.` });
    const slot = `${edge.source}:${edge.sourcePort}`;
    if (outgoingSlots.has(slot)) issues.push({ code: "duplicate-output", severity: "error", message: `${source.title} has more than one connection from its ${edge.sourcePort.toUpperCase()} output.` });
    outgoingSlots.add(slot);
  }

  const validEdges = edges.filter((edge) => nodes.some((node) => node.id === edge.source) && nodes.some((node) => node.id === edge.target));
  const reachable = new Set<string>();
  const queue = triggers.length === 1 ? [triggers[0].id] : [];
  while (queue.length) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    validEdges.filter((edge) => edge.source === id).forEach((edge) => queue.push(edge.target));
  }
  const unreachable = nodes.filter((node) => !reachable.has(node.id));
  if (unreachable.length) issues.push({ code: "unreachable", severity: "warning", message: `Unreachable block${unreachable.length === 1 ? "" : "s"}: ${unreachable.map((node) => node.title).join(", ")}.` });
  return issues;
}

function makePathBase(nodes: FlowNode[], id: string, label: string): ExecutionPath {
  return {
    id, label, visitedNodeIds: [], selectedEdgeIds: [], branchOutcomes: {},
    nodeStates: Object.fromEntries(nodes.map((node) => [node.id, "pending"])),
    log: [], outcome: "completed",
  };
}

function validationFailurePath(nodes: FlowNode[], issues: WorkflowIssue[], id: string, label: string): ExecutionPath {
  const path = makePathBase(nodes, id, label);
  path.outcome = "failed";
  path.log = issues.filter((issue) => issue.severity === "error").map((issue, index) => ({ nodeId: `issue-${index}`, node: "Workflow validation", kind: "review", message: issue.message, outcome: "failed" }));
  return finalizePath(path, nodes, []);
}

function finalizePath(path: ExecutionPath, nodes: FlowNode[], edges: FlowEdge[]) {
  const visited = new Set(path.visitedNodeIds);
  for (const node of nodes) {
    if (visited.has(node.id) || path.nodeStates[node.id] !== "pending") continue;
    path.nodeStates[node.id] = "skipped";
    const skippedByUnselectedBranch = edges.some((edge) => edge.target === node.id && (edge.sourcePort === "yes" || edge.sourcePort === "no") && path.branchOutcomes[edge.source] && path.branchOutcomes[edge.source] !== edge.sourcePort);
    const skippedBy = skippedByUnselectedBranch ? "Skipped because the other conditional branch was selected." : "This block is not reachable on the selected path.";
    path.log.push({ nodeId: node.id, node: node.title, kind: node.kind, message: skippedBy, outcome: "skipped" });
  }
  return path;
}

function runPath(nodes: FlowNode[], edges: FlowEdge[], startId: string, chooseBranch: (node: FlowNode) => "yes" | "no" | null, id: string, label: string, sample?: string): ExecutionPath {
  const path = makePathBase(nodes, id, label);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const seen = new Set<string>();
  let current: string | undefined = startId;
  let steps = 0;
  while (current && steps < MAX_STEPS) {
    const node = byId.get(current);
    if (!node) {
      path.outcome = "failed";
      path.log.push({ nodeId: current, node: "Missing block", kind: "review", message: `The workflow points to missing block “${current}”.`, outcome: "failed" });
      break;
    }
    if (seen.has(current)) {
      path.nodeStates[current] = "failed";
      path.outcome = "cycle";
      path.log.push({ nodeId: current, node: "Cycle detected", kind: "review", message: `Execution returned to “${node.title}”. The workflow stopped to prevent an endless loop.`, outcome: "failed" });
      break;
    }
    seen.add(current);
    path.visitedNodeIds.push(current);
    path.nodeStates[current] = "completed";
    steps += 1;
    if (node.kind === "decision") {
      const condition = node.match?.trim();
      if (!condition) {
        path.nodeStates[current] = "failed";
        path.outcome = "failed";
        path.log.push({ nodeId: current, node: node.title, kind: node.kind, message: "This decision has no condition. Add one before running the workflow.", outcome: "failed" });
        break;
      }
      const branch = chooseBranch(node);
      if (!branch) {
        path.nodeStates[current] = "failed";
        path.outcome = "failed";
        path.log.push({ nodeId: current, node: node.title, kind: node.kind, message: `Decision “${condition}” could not be evaluated.`, outcome: "failed" });
        break;
      }
      path.branchOutcomes[current] = branch;
      const matched = sample === undefined ? undefined : sample.toLowerCase().includes(condition.toLowerCase());
      const detail = matched === undefined ? `Simulated ${branch.toUpperCase()} outcome for “${condition}”.` : `Condition “${condition}” ${matched ? "matched" : "did not match"} the sample, so the ${branch.toUpperCase()} branch was selected.`;
      path.log.push({ nodeId: current, node: node.title, kind: node.kind, message: detail, outcome: "branch" });
      const edge = edges.find((item) => item.source === current && item.sourcePort === branch);
      if (!edge) {
        path.outcome = "incomplete";
        path.log.push({ nodeId: current, node: `${branch.toUpperCase()} branch`, kind: "review", message: `The ${branch.toUpperCase()} output has no connected block. This path ends here.`, outcome: "warning" });
        break;
      }
      path.selectedEdgeIds.push(edge.id);
      current = edge.target;
      continue;
    }
    path.log.push({ nodeId: current, node: node.title, kind: node.kind, message: node.kind === "trigger" ? `Loaded sample input${sample ? `: ${sample}` : ""}.` : node.kind === "action" || node.kind === "notify" ? `Simulated locally. No external action occurred. ${node.detail}` : node.detail, outcome: "complete" });
    const edge = edges.find((item) => item.source === current && item.sourcePort === "next");
    if (!edge) break;
    path.selectedEdgeIds.push(edge.id);
    current = edge.target;
  }
  if (steps >= MAX_STEPS && current) {
    path.outcome = "limited";
    path.log.push({ nodeId: current, node: "Execution limit", kind: "review", message: `The run exceeded the ${MAX_STEPS}-block safety limit and stopped.`, outcome: "failed" });
  }
  return finalizePath(path, nodes, edges);
}

export function executeWorkflow(nodes: FlowNode[], edges: FlowEdge[], sample: string): { path: ExecutionPath; issues: WorkflowIssue[] } {
  const issues = validateWorkflow(nodes, edges);
  const start = nodes.find((node) => node.kind === "trigger");
  if (!start || issues.some((issue) => issue.severity === "error" && issue.code !== "empty-condition")) {
    return { path: validationFailurePath(nodes, issues, "run", "Actual run"), issues };
  }
  return { path: runPath(nodes, edges, start.id, (node) => node.match?.trim() && sample.toLowerCase().includes(node.match.trim().toLowerCase()) ? "yes" : "no", "run", "Actual run", sample), issues };
}

export function simulateAllPaths(nodes: FlowNode[], edges: FlowEdge[]): { paths: ExecutionPath[]; issues: WorkflowIssue[] } {
  const issues = validateWorkflow(nodes, edges);
  const start = nodes.find((node) => node.kind === "trigger");
  if (!start) return { paths: [], issues };
  if (issues.some((issue) => issue.severity === "error" && issue.code !== "empty-condition")) {
    return { paths: [validationFailurePath(nodes, issues, "simulation-invalid", "Invalid workflow")], issues };
  }
  const paths: ExecutionPath[] = [];
  const pending: { decisions: Record<string, "yes" | "no">; label: string }[] = [{ decisions: {}, label: "Path 1" }];
  const seenSelections = new Set<string>();
  while (pending.length && paths.length < MAX_PATHS) {
    const scenario = pending.shift()!;
    const path = runPath(nodes, edges, start.id, (node) => scenario.decisions[node.id] ?? null, `simulation-${paths.length + 1}`, scenario.label);
    const undecided = path.visitedNodeIds.find((id) => {
      const node = nodes.find((item) => item.id === id);
      return node?.kind === "decision" && Boolean(node.match?.trim()) && !scenario.decisions[id];
    });
    if (undecided) {
      for (const branch of ["yes", "no"] as const) {
        const decisions = { ...scenario.decisions, [undecided]: branch };
        const key = Object.keys(decisions).sort().map((nodeId) => `${nodeId}:${decisions[nodeId]}`).join("|");
        if (!seenSelections.has(key)) {
          seenSelections.add(key);
          pending.push({ decisions, label: `Path ${paths.length + pending.length + 1}: ${Object.entries(decisions).map(([nodeId, choice]) => `${nodes.find((node) => node.id === nodeId)?.title ?? nodeId} ${choice.toUpperCase()}`).join(" · ")}` });
        }
      }
      continue;
    }
    paths.push(finalizePath(path, nodes, edges));
  }
  if (pending.length) issues.push({ code: "path-limit", severity: "warning", message: `Simulation stopped after ${MAX_PATHS} paths to keep the exploration bounded.` });
  const cycleIds = new Set(paths.filter((path) => path.outcome === "cycle").flatMap((path) => path.log.filter((entry) => entry.node === "Cycle detected").map((entry) => entry.nodeId)));
  if (cycleIds.size) issues.push({ code: "cycle", severity: "warning", message: `Cycles were detected near: ${[...cycleIds].map((id) => nodes.find((node) => node.id === id)?.title ?? id).join(", ")}.` });
  return { paths, issues };
}

export function edgeHasValidPort(source: FlowNode, port: Port) {
  return source.kind === "decision" ? port === "yes" || port === "no" : port === "next";
}
