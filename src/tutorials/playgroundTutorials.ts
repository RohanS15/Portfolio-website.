export type TutorialId = "playground" | "terminal" | "arcade" | "cyber-lab" | "automation";
export type TutorialCard = {
  title: string;
  body: string;
  actions?: string[];
  example?: string;
  tip?: string;
};
type Tutorial = { label: string; cards: TutorialCard[] };

export const playgroundTutorials: Record<TutorialId, Tutorial> = {
  playground: {
    label: "CODE PLAYGROUND",
    cards: [
      { title: "A small, safe place to experiment", body: "This editor lets you change a sample web page and preview the result. HTML describes the page, CSS changes how it looks, and JavaScript adds behavior. The preview runs in a sandboxed frame, separate from the portfolio.", tip: "Only the preview is sandboxed. Treat it as a learning demo, not a place to run code you do not understand." },
      { title: "Choose a working starting point", body: "The example menu loads a complete page into the editor. Start with Signal card or Status panel; each has HTML, CSS, and JavaScript you can inspect. Changing examples replaces the current draft.", actions: ["Choose an example from the selector.", "Use the HTML, CSS, and JS tabs to inspect each part.", "Edit a small detail before changing more."], tip: "Reset returns the selected example to its original code." },
      { title: "Edit one layer at a time", body: "Select a language tab, make a focused change, and press Run to refresh the preview. HTML content appears in the body, CSS styles those elements, and JavaScript can respond to events. The preview does not update until you run it.", example: "Change the card heading in HTML, then press Run." },
      { title: "Test behavior and recover", body: "Use the sample button inside the preview to see its JavaScript response. Copy copies the code for reuse, while Fullscreen enlarges the editor. If the preview behaves unexpectedly, inspect the code and reset before trying again.", actions: ["Run after each change so you know what caused the result.", "Use Reset to restore the starter example.", "Exit fullscreen with Escape."], tip: "The isolated preview blocks network connections and form submissions." },
    ],
  },
  terminal: {
    label: "PORTFOLIO TERMINAL",
    cards: [
      { title: "A simulated, read-only shell", body: "This terminal explores portfolio content through a small virtual filesystem. Commands are interpreted by the site; they do not run in your computer's operating system, and they cannot change files or contact external systems.", tip: "The prompt shows your current folder. A tilde (~) represents the virtual home directory." },
      { title: "Start with the command guide", body: "Use a quick-command button or type a command in the prompt, then press Enter. The output appears above the prompt. Start with help to see supported commands, or tree to see how portfolio folders are arranged.", actions: ["Click the input or use a quick command.", "Type help and press Enter.", "Read the result before trying another command."], example: "help" },
      { title: "Move around and read files", body: "Use cd to enter a virtual folder, ls to list its contents, and cat to display a supported portfolio file. Paths are limited to the site's published portfolio data; unsupported paths return an error instead of accessing your device.", example: "cd projects → ls → cat about.md", tip: "Use the command guide for valid file names and locations." },
      { title: "Use keyboard helpers", body: "Tab completes recognized commands and paths. The Up and Down arrow keys revisit commands from the current session, and history prints that session's command list. clear resets the visible terminal output.", actions: ["Press Tab after beginning a command or path.", "Press ↑ to recall a previous command.", "Press ↓ to move forward through recent commands."], tip: "The terminal keeps a bounded history only for this page session." },
    ],
  },
  arcade: {
    label: "BROWSER ARCADE",
    cards: [
      { title: "Short challenges with feedback", body: "The arcade groups small logic, memory, security, and reaction challenges. Choose a game, read its prompt, and use the on-screen controls. Scores are local browser state; they are not sent to a service.", tip: "Some challenges are timed. Read the instructions before starting a round." },
      { title: "Pick a challenge and difficulty", body: "Select a game from the game tabs, then choose a difficulty where the game offers one. Difficulty changes the size or pace of the challenge. Starting a game begins a short session with multiple rounds.", actions: ["Choose a game from the selector.", "Set a comfortable difficulty.", "Start when you are ready to focus on the prompt." ] },
      { title: "Answer, then learn from the result", body: "Use the displayed choices or game controls to submit an answer. Correct answers add to your run score; most knowledge challenges show an explanation so you can understand the reasoning. Reaction mode measures timing rather than subject knowledge.", tip: "A score is feedback for this mini-game, not a measure of real-world security skill." },
      { title: "Review or restart your run", body: "Move through the rounds until the session ends, then read the round review where available. Restart or choose another game whenever you like. The best reaction time is kept locally in this browser if storage is available.", tip: "Refreshing the page may reset an in-progress session; only the reaction best is persisted." },
    ],
  },
  "cyber-lab": {
    label: "SYNTHETIC CYBER LAB",
    cards: [
      { title: "Practice analyst decisions with sample data", body: "The lab contains simulated security events and response exercises. It is a training interface, not live monitoring. Use the tabs to move among the Live Desk, Signal Sprint, SOC Overview, Playbook, and ATT&CK Map.", tip: "All event and indicator examples are synthetic. No real system is queried or changed." },
      { title: "Investigate a signal", body: "In Live Desk, select an incoming signal to inspect its severity, event details, and context. Compare the evidence with the response options before choosing. The feedback explains the recommended next step and why.", actions: ["Select a signal from the left rail.", "Read the event context and priority.", "Choose a response and review the explanation." ] },
      { title: "Learn through short challenges", body: "Signal Sprint presents a sample event and asks whether it needs analyst investigation. Answer yes or no, then read the rationale before moving to the next signal. The SOC Overview groups the sample desk by priority for a quick summary.", tip: "A high priority is a cue to investigate, not proof that an event is malicious." },
      { title: "Follow the playbook and map", body: "The Playbook lets you enter an indicator and compare it with a local illustrative sample, then step through evidence and a proposed response. The ATT&CK Map links the lab's synthetic signals to educational technique references.", tip: "The reputation exercise is not a live lookup. A real response would need validation, authorization, and a rollback plan." },
      { title: "Keep conclusions proportional to evidence", body: "Use the event details to explain your decision, collect more context when uncertain, and distinguish a training hint from a confirmed finding. Restart or switch tabs to explore another view; nothing is sent to a real security system.", example: "Signal → evidence → response choice → rationale" },
    ],
  },
  automation: {
    label: "WORKFLOW SIMULATOR",
    cards: [
      { title: "See how sample data moves", body: "The simulator demonstrates trigger, validation, enrichment, decision, action, review, and notification blocks. It runs synthetic sample data locally; it does not connect to n8n, email, devices, or accounts.", tip: "A node is one step in the flow. A connector shows which step runs next." },
      { title: "Open a flow or build your own", body: "Choose a sample workflow from the library to inspect a prepared scenario, or open Make Your Own Workflow to edit the graph. The sample templates are view-and-run demonstrations; custom mode enables block editing.", actions: ["Choose a template to explore an example.", "Use Make Your Own Workflow to add and edit blocks.", "Select a node to see its settings in the inspector." ] },
      { title: "Connect the steps", body: "In a custom flow, drag a node's output port to the next node's input port. Decision nodes have separate Yes and No outputs; connect each route you want to simulate. Drag a node by its move control to arrange the canvas.", tip: "Unconnected decision branches stop at that branch and are reported in the run log." },
      { title: "Set a condition and run", body: "Select a decision block and edit the text it checks for. The simulator tests whether the sample text contains that condition, follows the matching Yes or No connection, and highlights each visited step. Run workflow can be stopped while it is running.", example: "Condition: ready", tip: "This simple demo uses text matching, not a production expression engine." },
      { title: "Read the execution log", body: "Each run writes an explanation for every visited block, including branch decisions and simulated actions. Review and notification steps only describe what a real workflow might do; no approval is requested and no external action occurs here.", actions: ["Check the highlighted route on the canvas.", "Read each checkpoint in the execution log.", "Change the custom flow and run it again." ] },
    ],
  },
};
