# Playground Tool Inventory

Reviewed 2026-11-11 from `src/features/pages/PlaygroundPage.tsx` and each tool implementation. The page contains five separately guided interactive tools. There is no standalone 3D experiment in the current Playground; the 3D identity scene belongs to Portfolio and is outside this enhancement.

| Tool | Purpose and input | Main controls and output | Beginner considerations |
| --- | --- | --- | --- |
| Code playground (`src/Playground.tsx`) | Edit an HTML/CSS/JavaScript sample and render it in an isolated iframe. | Example selector; HTML, CSS, JS tabs; Run, Reset, Copy, Fullscreen. Output is a preview refreshed by Run. | Switching examples replaces the current draft. Preview code is isolated, blocks network/form actions, and should be treated as a learning sandbox. |
| Portfolio terminal (`src/Terminal.tsx`, `src/terminal/portfolioFs.ts`) | Explore published portfolio data through a simulated read-only virtual filesystem. | Quick commands or typed command with Enter; Tab completion; Up/Down history; output log. Commands include help, tree, ls, cd, cat, summary, uname, history, clear. | This is not an operating-system shell; commands only read site data. Paths and commands are intentionally limited. |
| Browser arcade (`src/GameArcade.tsx`, `src/features/arcade/arcadeData.ts`) | Play short logic, memory, reaction, and security-inspired challenges. | Game selection, difficulty where supported, per-game controls, round feedback and score. Reaction best time is stored locally when browser storage is available. | Some rounds are timed. Scores are informal game feedback; refresh may reset an active run. |
| Cyber lab (`src/CyberLab.tsx`) | Practice decisions using synthetic security events. | Live Desk, Signal Sprint, SOC Overview, Playbook, and ATT&CK Map tabs; event selection, answer choices, indicator input and staged playbook controls. | All records are synthetic. Reputation is local illustrative data, not a live lookup; no real system is monitored or changed. |
| Workflow simulator (`src/Automation.tsx`, `src/features/automation/automationData.ts`) | Inspect or construct a local sample-data workflow. | Open templates or custom flow; select/edit nodes; drag nodes; connect ports; configure decision match text; run/stop simulation; inspect execution log. | Template examples are not editable. Editing is available in custom mode. Decision matching is simple substring matching, and no external actions occur. |

## Removed/retained guidance

- The former shared `Tutorial` IntersectionObserver opened a tutorial when its button entered view. It has been replaced by explicit per-tool activation.
- The terminal's command reference (`TerminalGuide`) remains available as an inline reference; the new terminal flashcards explain its concepts and workflow.
- Existing tool controls and simulation behavior were not changed for the tutorial work.
