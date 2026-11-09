import { useEffect, useMemo, useRef } from "react";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, HighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { tags } from "@lezer/highlight";
import { Compartment, EditorState } from "@codemirror/state";
import { drawSelection, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, EditorView } from "@codemirror/view";
import type { Theme } from "./components/theme/ThemeProvider";

export type EditorLanguage = "html" | "css" | "js";

type CodeEditorProps = {
  language: EditorLanguage;
  theme: Theme;
  value: string;
  onChange: (value: string) => void;
};

export default function CodeEditor({ language, theme, value, onChange }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const languageConfig = useMemo(() => new Compartment(), []);
  const themeConfig = useMemo(() => new Compartment(), []);
  const contentConfig = useMemo(() => new Compartment(), []);
  const languageExtension = useMemo(() => {
    if (language === "html") return html();
    if (language === "css") return css();
    return javascript();
  }, [language]);

  const editorTheme = useMemo(() => EditorView.theme({
    "&": { height: "100%", color: "var(--pg-code)", backgroundColor: "transparent" },
    ".cm-scroller": { overflow: "auto", fontFamily: "var(--mono)", lineHeight: "1.8" },
    ".cm-content": { caretColor: "var(--pg-accent)", padding: "16px 18px", minHeight: "100%" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--pg-accent)" },
    ".cm-gutters": { backgroundColor: "transparent", color: "var(--pg-line)", border: "none" },
    ".cm-lineNumbers .cm-gutterElement": { minWidth: "3.5em", padding: "0 12px 0 8px" },
    ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--pg-accent) 5%, transparent)" },
    ".cm-activeLineGutter": { color: "var(--pg-accent)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "color-mix(in srgb, var(--pg-accent) 28%, transparent) !important" },
    "&.cm-focused": { outline: "none" },
  }, { dark: theme === "dark" }), [theme]);
  const syntaxTheme = useMemo(() => HighlightStyle.define([
    { tag: tags.keyword, color: theme === "dark" ? "#cba4f7" : "#7541a0" },
    { tag: [tags.name, tags.variableName], color: theme === "dark" ? "#d3e2e7" : "#283449" },
    { tag: [tags.string, tags.special(tags.string)], color: theme === "dark" ? "#d9c28c" : "#765b12" },
    { tag: [tags.comment, tags.lineComment, tags.blockComment], color: theme === "dark" ? "#91a39e" : "#667467", fontStyle: "italic" },
    { tag: [tags.number, tags.bool, tags.null], color: theme === "dark" ? "#f0a384" : "#a94724" },
    { tag: [tags.tagName, tags.angleBracket], color: theme === "dark" ? "#83dcca" : "#087968" },
    { tag: [tags.attributeName, tags.propertyName], color: theme === "dark" ? "#9dc5ff" : "#20599b" },
    { tag: [tags.attributeValue, tags.typeName, tags.className], color: theme === "dark" ? "#e0bd87" : "#765b12" },
    { tag: [tags.operator, tags.punctuation], color: theme === "dark" ? "#aebdc4" : "#526071" },
  ]), [theme]);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    const parent = host.current;
    if (!parent) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        highlightActiveLine(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
        contentConfig.of(EditorView.contentAttributes.of({
          "aria-label": `${language.toUpperCase()} code editor`,
          "aria-describedby": "editor-help",
        })),
        languageConfig.of(languageExtension),
        themeConfig.of([editorTheme, syntaxHighlighting(syntaxTheme)]),
      ],
    });
    const editorView = new EditorView({ state, parent });
    view.current = editorView;
    return () => {
      editorView.destroy();
      view.current = null;
    };
  // The editor is created once. Language and theme changes use compartments below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    view.current?.dispatch({ effects: languageConfig.reconfigure(languageExtension) });
  }, [languageConfig, languageExtension]);

  useEffect(() => {
    view.current?.dispatch({ effects: contentConfig.reconfigure(EditorView.contentAttributes.of({
      "aria-label": `${language.toUpperCase()} code editor`,
      "aria-describedby": "editor-help",
    })) });
  }, [contentConfig, language]);

  useEffect(() => {
    view.current?.dispatch({ effects: themeConfig.reconfigure([editorTheme, syntaxHighlighting(syntaxTheme)]) });
  }, [themeConfig, editorTheme, syntaxTheme]);

  useEffect(() => {
    const editorView = view.current;
    if (!editorView || editorView.state.doc.toString() === value) return;
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: value },
    });
  }, [value]);

  return <div className="codemirror-host" ref={host} />;
}
