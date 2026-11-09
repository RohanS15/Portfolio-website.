export type BlockKind = "trigger" | "validate" | "enrich" | "decision" | "action" | "review" | "notify";
export type Port = "next" | "yes" | "no";
export type FlowNode = { id: string; kind: BlockKind; title: string; detail: string; match?: string; x: number; y: number };
export type FlowEdge = { id: string; source: string; sourcePort: Port; target: string };
export type FlowTemplate = { id: string; title: string; summary: string; scenario: string; nodes: FlowNode[]; edges: FlowEdge[] };
export type LogEntry = { node: string; kind: BlockKind; message: string; outcome: "complete" | "branch" };
export type DragNode = { id: string; offsetX: number; offsetY: number };
export type DraftEdge = { source: string; port: Port; clientX: number; clientY: number };
