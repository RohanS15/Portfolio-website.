import type { BlockKind, FlowTemplate } from "./automationTypes";

export const kindLabels: Record<BlockKind, string> = { trigger: "TRIGGER", validate: "VALIDATE", enrich: "ENRICH", decision: "YES / NO", action: "ACTION", review: "REVIEW", notify: "NOTIFY" };

export const kindIcons: Record<BlockKind, string> = { trigger: "⚡", validate: "✓", enrich: "⌕", decision: "◇", action: "↗", review: "◎", notify: "◉" };

export const palette: BlockKind[] = ["validate", "enrich", "decision", "action", "review", "notify"];

export const templates: FlowTemplate[] = [
  {
    id: "security",
    title: "Security alert triage",
    summary: "Validate a sign-in alert, enrich the indicator, then route the case down a clear yes/no response path.",
    scenario: "severity=high · reputation=malicious · source=new",
    nodes: [
      { id: "s1", kind: "trigger", title: "New security alert", detail: "Receive a synthetic sign-in alert with account, source, and event context.", x: 28, y: 190 },
      { id: "s2", kind: "validate", title: "Validate event fields", detail: "Confirm that account, timestamp, source address, and event type are present.", x: 218, y: 190 },
      { id: "s3", kind: "enrich", title: "Enrich source context", detail: "Compare the sample source against local reputation and sign-in context.", x: 408, y: 190 },
      { id: "s4", kind: "decision", title: "Reputation is malicious?", detail: "Route the alert according to the sample reputation result.", match: "malicious", x: 598, y: 190 },
      { id: "s5", kind: "action", title: "Contain the endpoint", detail: "Simulate a containment recommendation. No device is actually isolated.", x: 800, y: 55 },
      { id: "s6", kind: "review", title: "Request analyst approval", detail: "Pause for a human decision before any high impact response.", x: 990, y: 55 },
      { id: "s7", kind: "action", title: "Close as expected", detail: "Record a benign disposition with the evidence used to support it.", x: 800, y: 345 },
      { id: "s8", kind: "notify", title: "Notify the case owner", detail: "Prepare a local notification summary for the assigned analyst.", x: 990, y: 345 },
    ],
    edges: [
      { id: "se1", source: "s1", sourcePort: "next", target: "s2" }, { id: "se2", source: "s2", sourcePort: "next", target: "s3" },
      { id: "se3", source: "s3", sourcePort: "next", target: "s4" }, { id: "se4", source: "s4", sourcePort: "yes", target: "s5" },
      { id: "se5", source: "s5", sourcePort: "next", target: "s6" }, { id: "se6", source: "s4", sourcePort: "no", target: "s7" },
      { id: "se7", source: "s7", sourcePort: "next", target: "s8" },
    ],
  },
  {
    id: "inquiry",
    title: "Website inquiry routing",
    summary: "Check a sample inquiry, identify its topic and urgency, and send it through the matching follow-up path.",
    scenario: "topic=automation · priority=high · consent=yes",
    nodes: [
      { id: "i1", kind: "trigger", title: "New website inquiry", detail: "Receive a synthetic portfolio inquiry with topic, priority, and consent fields.", x: 28, y: 190 },
      { id: "i2", kind: "validate", title: "Check required fields", detail: "Confirm that the message has a topic, reply address, and contact consent.", x: 218, y: 190 },
      { id: "i3", kind: "enrich", title: "Categorize the request", detail: "Match the inquiry with the sample service and response time.", x: 408, y: 190 },
      { id: "i4", kind: "decision", title: "Priority is high?", detail: "High priority goes to a person for follow-up; other inquiries join the queue.", match: "priority=high", x: 598, y: 190 },
      { id: "i5", kind: "action", title: "Assign a consultant", detail: "Route the high priority request to a matching project contact.", x: 800, y: 55 },
      { id: "i6", kind: "review", title: "Prepare a follow-up", detail: "Create a draft checklist for a human to review before responding.", x: 990, y: 55 },
      { id: "i7", kind: "action", title: "Add to the inquiry queue", detail: "Place the request in a sample queue with its category and received time.", x: 800, y: 345 },
      { id: "i8", kind: "notify", title: "Prepare acknowledgment", detail: "Show a local confirmation preview; no message is sent.", x: 990, y: 345 },
    ],
    edges: [
      { id: "ie1", source: "i1", sourcePort: "next", target: "i2" }, { id: "ie2", source: "i2", sourcePort: "next", target: "i3" },
      { id: "ie3", source: "i3", sourcePort: "next", target: "i4" }, { id: "ie4", source: "i4", sourcePort: "yes", target: "i5" },
      { id: "ie5", source: "i5", sourcePort: "next", target: "i6" }, { id: "ie6", source: "i4", sourcePort: "no", target: "i7" },
      { id: "ie7", source: "i7", sourcePort: "next", target: "i8" },
    ],
  },
];

export const defaultTitle = (kind: BlockKind) => ({ trigger: "New sample event", validate: "Validate fields", enrich: "Add context", decision: "Check a condition", action: "Run an action", review: "Human review", notify: "Prepare notification" })[kind];

export const defaultDetail = (kind: BlockKind) => ({ trigger: "Start the workflow with a local sample event.", validate: "Check that the event has the required information.", enrich: "Add useful context to the sample data.", decision: "Choose the Yes or No path using the condition below.", action: "Simulate a reversible workflow action.", review: "Pause for a person to review the proposed result.", notify: "Prepare a message preview without sending it." })[kind];
