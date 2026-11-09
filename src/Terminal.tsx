import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { completePortfolioInput, runPortfolioCommand } from "./terminal/portfolioFs";

type TerminalLine = { kind: "welcome" | "command" | "output" | "error"; text: string };
const welcome: TerminalLine[] = [
  { kind: "welcome", text: "ROHAN.OS // PORTFOLIO FILESYSTEM" },
  { kind: "output", text: "Read-only website explorer · Type help to begin." },
  { kind: "output", text: "Try tree, summary, or ls projects." },
];

function locationLabel(path: string) {
  return path === "/" ? "~" : `~${path}`;
}

export default function Terminal() {
  const [line, setLine] = useState("");
  const [cwd, setCwd] = useState("/");
  const [out, setOut] = useState<TerminalLine[]>(welcome);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyDraft = useRef("");
  const input = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pane = output.current;
    if (pane) pane.scrollTop = pane.scrollHeight;
  }, [out]);

  const run = (raw: string) => {
    const command = raw.trim();
    if (!command) return;
    const result = runPortfolioCommand(command, cwd, [...commandHistory, command]);
    setCommandHistory((history) => [...history.slice(-49), command]);
    setHistoryIndex(-1);
    setCwd(result.cwd);
    if (result.clear) {
      setOut(welcome);
      setLine("");
      requestAnimationFrame(() => input.current?.focus());
      return;
    }
    const outputLines: TerminalLine[] = result.lines.map((text) => ({
      kind: text.startsWith("error:") ? "error" : "output",
      text,
    }));
    const commandLine: TerminalLine = { kind: "command", text: `visitor@rohan:${locationLabel(cwd)}$ ${command}` };
    setOut((current) => [
      ...current,
      commandLine,
      ...outputLines,
    ].slice(-140));
    setLine("");
    requestAnimationFrame(() => input.current?.focus());
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    run(line);
  };

  const handleInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp" && commandHistory.length) {
      event.preventDefault();
      if (historyIndex < 0) historyDraft.current = line;
      const nextIndex = historyIndex < 0 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setLine(commandHistory[nextIndex]);
    } else if (event.key === "ArrowDown" && historyIndex >= 0) {
      event.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setLine(historyDraft.current);
        historyDraft.current = "";
      } else {
        setHistoryIndex(nextIndex);
        setLine(commandHistory[nextIndex]);
      }
    } else if (event.key === "Tab") {
      event.preventDefault();
      setLine((current) => completePortfolioInput(current, cwd));
    }
  };

  return (
    <div className="terminal" aria-label="Read-only portfolio terminal">
      <div className="term-top">
        <span><i aria-hidden="true" />PORTFOLIO SHELL</span>
        <span>VIRTUAL FILESYSTEM · READ ONLY</span>
      </div>
      <div className="term-toolbar" aria-label="Quick terminal commands">
        {["help", "tree", "summary", "uname -a", "ls projects"].map((command) => (
          <button key={command} type="button" onClick={() => run(command)}>{command}</button>
        ))}
        <span>website data only</span>
      </div>
      <div className="term-body" ref={output}>
        <div className="term-output" role="log" aria-live="polite" aria-relevant="additions text">
          {out.map((item, index) => (
            <div key={`${index}-${item.text}`} className={`term-line term-line-${item.kind}`}>{item.text || "\u00a0"}</div>
          ))}
        </div>
        <form onSubmit={submit} className="term-form">
          <label className="term-entry">
            <span aria-hidden="true">visitor@rohan:{locationLabel(cwd)}$</span>
            <input
              ref={input}
              value={line}
              onChange={(event) => { setLine(event.target.value); setHistoryIndex(-1); }}
              onKeyDown={handleInputKey}
              aria-label="Portfolio terminal command"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </label>
          <button className="term-submit" type="submit" aria-label="Run terminal command">↵</button>
        </form>
      </div>
    </div>
  );
}

export function TerminalGuide() {
  const [open, setOpen] = useState(true);
  if (!open) return <button className="terminal-guide-reopen" type="button" onClick={() => setOpen(true)}>Show command guide <span aria-hidden="true">↗</span></button>;
  return (
    <aside className="terminal-guide" aria-label="Terminal command guide">
      <button className="terminal-guide-close" type="button" onClick={() => setOpen(false)} aria-label="Close terminal command guide">×</button>
      <span className="terminal-guide-label">QUICK COMMAND GUIDE</span>
      <p>Explore portfolio data with familiar, read-only shell commands.</p>
      <div className="terminal-guide-list">
        <code>help</code><span>all supported commands</span>
        <code>tree</code><span>browse the folder map</span>
        <code>cd projects</code><span>move through project folders</span>
        <code>cat about.md</code><span>read a portfolio file</span>
        <code>uname -a</code><span>view this simulated host</span>
        <code>history</code><span>review this session’s commands</span>
      </div>
      <small>Tab completes commands and paths · ↑/↓ recalls commands. No system commands run; the shell only reads website data.</small>
    </aside>
  );
}
