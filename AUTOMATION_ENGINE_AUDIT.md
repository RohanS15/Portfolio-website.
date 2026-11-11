# Automation Engine Audit

Date: 2026-11-11

## Scope

Reviewed `src/Automation.tsx`, `src/features/automation/automationTypes.ts`, `src/features/automation/automationData.ts`, and the Automation styles. No Portfolio, Projects, or other Playground tool implementation was changed for this workflow editor task.

## Findings and root cause

- `FlowNode`, `FlowEdge`, and `FlowTemplate` store nodes, directed output-port edges, and a sample string. Decision nodes have a `match` substring condition; Yes and No are separate `Port` values.
- The former run loop evaluates the configured condition against the sample. Both bundled preset samples contain the configured condition, so an unmodified preset follows Yes. The engine did not have a way to alter preset inputs.
- The former canvas marked an edge traversed when both endpoints had been visited. On reconverging or repeated graphs this could imply an unselected edge had run. The execution log only included visited nodes, so the opposite branch silently disappeared.
- The previous loop guard stopped repeated nodes, but missing targets, malformed graph structure, unreachable blocks, and incomplete branches were not consistently reported.
- The previous engine had only one traversal loop embedded in the React component, making exhaustive branch simulation prone to duplicating execution behavior.
- Pointer listeners were attached to `window`; node drag did not capture the pointer, canvas had no pan/zoom controls, and connection ports were small for touch use.

## New ownership

- `src/features/automation/workflowEngine.ts` owns validation, deterministic sample execution, and pure exhaustive path enumeration.
- React owns execution presentation and the brief node highlight animation. The engine has no browser, network, or integration side effects.
- `src/Automation.tsx` maps path state to node/edge classes and provides tool controls.
