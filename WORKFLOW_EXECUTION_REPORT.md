# Workflow Execution Report

Date: 2026-11-11

## Modes

- **Run workflow** evaluates each decision against the selected workflow's sample text and follows only the matching Yes or No edge. This preserves the original Run button semantics.
- **Simulate all paths** does not evaluate or execute actions. It forks each reachable decision into Yes and No outcomes, then records each separate route. It is bounded to 128 paths and 256 visited steps per route.
- **Execution log** displays the selected actual or simulated trace, branch choice, warning/failure, and skipped blocks.

## Validation and outcomes

The engine reports missing or duplicate node/edge identifiers, invalid/missing endpoints, invalid output ports, duplicate outgoing slots, invalid trigger counts, empty names, and empty decision conditions. Disconnected nodes are warnings. Missing decision outputs end that route as incomplete. Repeated node visits stop as cycles; runs are capped at 256 steps.

Each path stores visited node IDs, selected edge IDs, branch outcomes, per-node status, trace entries, and a terminal outcome. Unvisited nodes are marked skipped with a reason. The canvas highlights selected edges and mutes the opposite decision edge, including when another branch later visits the same destination.

## Failure semantics

The current node model has no configurable failure policy for action nodes, and all actions are explicitly simulated locally. Invalid workflow structure, invalid decision configuration, a missing block, cycle, or execution limit produces a visible failed/incomplete result. No real integration or external action is performed by either mode.

## Current preset behavior

The Security alert sample contains `malicious`, so its configured decision chooses Yes. The Inquiry sample contains `priority=high`, so it also chooses Yes. Use **Simulate all paths** to inspect No without altering the preset; actual Run still follows its sample.
