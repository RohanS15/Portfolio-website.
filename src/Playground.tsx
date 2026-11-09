import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useTheme } from "./components/theme/ThemeProvider";
import type { EditorLanguage } from "./CodeEditor";

const CodeEditor = lazy(() => import("./CodeEditor"));

type CodeSample = { html: string; css: string; js: string };
const examples: Record<string, CodeSample> = {
  "Signal card": {
    html: [
      '<main class="card">',
      '  <span class="label">FIELD NOTE 001</span>',
      "  <h1>Observe.<br><em>Then secure.</em></h1>",
      "  <p>Good systems begin with good questions.</p>",
      '  <button id="check-button">Run a check ↗</button>',
      "</main>",
    ].join("\n"),
    css: [
      "* { box-sizing: border-box; }",
      "body { margin:0; min-height:100vh; display:grid; place-items:center; background:#0c1114; color:#eff6f4; font-family:system-ui,sans-serif; }",
      ".card { width:min(88%,390px); padding:38px; border:1px solid #273638; background:#101819; }",
      ".label { color:#67e0d0; font-size:10px; letter-spacing:.2em; }",
      "h1 { font-size:42px; line-height:1.1; margin:22px 0 14px; }",
      "em { color:#67e0d0; font-style:normal; }",
      "p { color:#9eaaa8; }",
      "button { margin-top:20px; padding:12px 16px; color:#07100f; background:#67e0d0; border:0; cursor:pointer; }",
    ].join("\n"),
    js: [
      "// Edit the HTML, CSS, or JavaScript and press Run.",
      'document.querySelector("#check-button")?.addEventListener("click", (event) => { event.currentTarget.textContent = "Signal received ✓"; });',
      'console.log("A small experiment, safely sandboxed.");',
    ].join("\n"),
  },
  "Status panel": {
    html: [
      '<section class="panel">',
      '  <span class="eyebrow">SYSTEM STATUS</span>',
      "  <h1>All signals<br>accounted for.</h1>",
      "  <p>Last checked just now · local demo</p>",
      '  <button id="health-check">Run health check</button>',
      "</section>",
    ].join("\n"),
    css: [
      "body { margin:0; min-height:100vh; display:grid; place-items:center; background:#090d0f; color:#e8f0ec; font-family:system-ui,sans-serif; }",
      ".panel { padding:32px; width:min(82vw,360px); border:1px solid #30413d; background:#101718; }",
      ".eyebrow { color:#67e0d0; font-size:10px; letter-spacing:.16em; }",
      "h1 { font-size:30px; line-height:1.12; }",
      "p { color:#899793; font-size:12px; }",
      "button { margin-top:14px; padding:11px 14px; border:0; background:#67e0d0; color:#07100f; cursor:pointer; }",
    ].join("\n"),
    js: 'document.querySelector("#health-check")?.addEventListener("click", (event) => { event.currentTarget.previousElementSibling.textContent = "Check complete ✓"; });\nconsole.log("Status panel loaded in the sandbox.");',
  },
};

export default function Playground() {
  const { theme } = useTheme();
  const [example, setExample] = useState("Signal card");
  const [code, setCode] = useState(examples["Signal card"]);
  const [tab, setTab] = useState<keyof CodeSample>("html");
  const [src, setSrc] = useState("");
  const [notice, setNotice] = useState(
    "Preview is isolated in a sandboxed iframe.",
  );
  const [full, setFull] = useState(false);
  const run = () => {
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const userScript = code.js.replace(/<\/script/gi, "<\\/script");
    const srcDoc = `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'; form-action 'none'; frame-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src data: blob:; font-src data:; media-src data: blob:"><style>${code.css}</style></head><body>${code.html}<script nonce="${nonce}">try{${userScript}\n}catch(e){const error=document.createElement('pre');error.style.color='#ff8d8d';error.textContent=String(e);document.body.append(error)}</script></body></html>`;
    setSrc(srcDoc);
    setNotice("Preview refreshed · scripts run in an isolated frame.");
  };
  useEffect(() => {
    run();
  }, []);
  useEffect(() => {
    if (!full) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [full]);
  const copySource = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code[tab]);
      } else {
        const temporary = document.createElement("textarea");
        temporary.value = code[tab];
        temporary.setAttribute("readonly", "");
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.append(temporary);
        temporary.select();
        const copied = document.execCommand("copy");
        temporary.remove();
        if (!copied) throw new Error("Copy unavailable");
      }
      setNotice(`${tab.toUpperCase()} copied to clipboard.`);
    } catch {
      setNotice("Clipboard access is unavailable in this browser.");
    }
  };
  const updateExample = (name: string) => {
    setExample(name);
    setCode(examples[name]);
    setNotice(`${name} loaded. Press Run to render it.`);
  };
  const handleEditorChange = useCallback((value: string) => {
    setCode((current) => ({ ...current, [tab]: value }));
  }, [tab]);
  return (
    <div className={full ? "playground play-fullscreen" : "playground"}>
      <div className="play-head">
        <div>
          <b>Code playground</b>
          <span>EDIT · RUN · EXPERIMENT</span>
        </div>
        <div className="play-actions">
          <select
            aria-label="Choose example"
            value={example}
            onChange={(e) => updateExample(e.target.value)}
          >
            {Object.keys(examples).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setCode(examples[example]);
              setNotice("Example restored. Press Run to update the preview.");
            }}
          >
            Reset
          </button>
          <button type="button" onClick={() => setFull(!full)} aria-pressed={full}>
            {full ? "Exit full screen" : "Full screen"}
          </button>
          <button type="button" className="button-primary small" onClick={run}>
            ▶ Run preview
          </button>
        </div>
      </div>
      <div className="play-grid">
        <div className="editor">
          <div className="editor-tabs">
            <div role="tablist" aria-label="Code editor language">
            {(["html", "css", "js"] as const).map((name, index, all) => (
              <button
                key={name}
                id={`editor-tab-${name}`}
                type="button"
                role="tab"
                aria-controls="editor-panel"
                aria-selected={tab === name}
                tabIndex={tab === name ? 0 : -1}
                className={tab === name ? "selected" : ""}
                onClick={() => setTab(name)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                  event.preventDefault();
                  const next = all[(index + (event.key === "ArrowRight" ? 1 : -1) + all.length) % all.length];
                  setTab(next);
                  document.getElementById(`editor-tab-${next}`)?.focus();
                }}
              >
                {name.toUpperCase()}
              </button>
            ))}
            </div>
            <button
              type="button"
              className="copy"
              aria-label={`Copy ${tab.toUpperCase()} source`}
              onClick={copySource}
            >
              Copy
            </button>
          </div>
          <div className="code-area" id="editor-panel" role="tabpanel" aria-labelledby={`editor-tab-${tab}`}>
            <div className="editor-surface">
              <Suspense fallback={<div className="editor-loading" role="status">Loading editor…</div>}>
                <CodeEditor
                  key={tab}
                  language={tab}
                  theme={theme}
                  value={code[tab]}
                  onChange={handleEditorChange}
                />
              </Suspense>
            </div>
          </div>
          <span className="sr-only" id="editor-help">Code editor for the sandboxed preview. Press Tab to indent.</span>
          <div className="editor-foot">
            <span><i aria-hidden="true">●</i> READY</span>
            <span>RUNS IN A SANDBOXED FRAME</span>
          </div>
        </div>
        <div className="preview">
          <div className="preview-top">
            <span><i aria-hidden="true">◉</i> PREVIEW</span>
            <span>UPDATES WHEN YOU RUN</span>
          </div>
          <iframe
            title="Sandboxed code preview"
            sandbox="allow-scripts"
            srcDoc={src}
          />
          <div className="preview-note" aria-live="polite">
            {notice}
          </div>
        </div>
      </div>
    </div>
  );
}
