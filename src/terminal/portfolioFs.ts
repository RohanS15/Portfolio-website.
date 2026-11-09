import {
  careerExperiences,
  careerTimeline,
  portfolio,
  portfolioProjects,
  serviceCatalog,
  skillGroups,
} from "../content";

export type PortfolioFile = { kind: "file"; name: string; content: string };
export type PortfolioDirectory = { kind: "directory"; name: string; children: Record<string, PortfolioEntry> };
export type PortfolioEntry = PortfolioFile | PortfolioDirectory;

const file = (name: string, content: string): PortfolioFile => ({ kind: "file", name, content });
const directory = (name: string, children: Record<string, PortfolioEntry> = {}): PortfolioDirectory => ({ kind: "directory", name, children });
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";
const list = (values: string[]) => values.length ? values.map((value) => `- ${value}`).join("\n") : "- Not listed in the current portfolio.";
const available = (value?: string | null) => value || "Not listed in the current portfolio.";

const projectFolders: Record<string, Record<string, PortfolioEntry>> = {};
for (const project of portfolioProjects) {
  const category = slug(project.category);
  const folder = projectFolders[category] ?? (projectFolders[category] = {});
  const links = [
    project.demoUrl && `Demo: ${project.demoUrl}`,
    project.githubUrl && `Repository: ${project.githubUrl}`,
    project.detailsUrl && `Details: ${project.detailsUrl}`,
  ].filter(Boolean).join("\n") || "No public project links are configured.";
  const content = [
    `# ${project.title}`,
    `\n- ID: ${project.id}`,
    `- Category: ${project.category}`,
    `- Type: ${project.projectType}`,
    `- Status: ${project.status}`,
    `- Tag: ${project.tag}`,
    `\n## Overview\n${project.description}`,
    `\n## Full description\n${project.longDescription}`,
    `\n## Problem\n${project.problem}`,
    `\n## Approach\n${project.solution}`,
    `\n## Features\n${list(project.features)}`,
    `\n## Technologies\n${list(project.technologies)}`,
    `\n## Related skills\n${list(project.relatedSkills)}`,
    `\n## Links\n${links}`,
    `\n## Media\n- Preview image: ${available(project.previewImage)}`,
    `- Additional images:\n${list(project.additionalImages)}`,
    project.sourceDemoUrl ? `\n## Original demo source\n${project.sourceDemoUrl} (retained for reference; it may not be an active demo)` : "",
    `\n## Source and verification\n- Source website: ${project.sourceWebsite}`,
    `- Migration status: ${project.migrationStatus}`,
    `- Original project: ${project.originalProject ? "Yes" : "No"}`,
    project.verificationNote ? `- Note: ${project.verificationNote}` : "",
  ].filter(Boolean).join("\n");
  folder[`${slug(project.id || project.title)}.md`] = file(`${slug(project.id || project.title)}.md`, content);
}

const experienceFiles: Record<string, PortfolioEntry> = {};
for (const experience of careerExperiences) {
  const name = `${slug(experience.id)}.md`;
  experienceFiles[name] = file(name, [
    `# ${experience.company}`,
    `\n- Role: ${experience.role}`,
    `- Employment type: ${available(experience.employmentType)}`,
    `- Period: ${available(experience.period)}`,
    `- Duration: ${available(experience.duration)}`,
    `- Location: ${available(experience.location)}`,
    `- Arrangement: ${available(experience.arrangement)}`,
    `\n## Work\n${list(experience.projectWork)}`,
    `\n## Technologies\n${list(experience.technologies)}`,
    `\n## Company\n${experience.companyUrl}`,
    `\n## Logo asset\n- Local asset: ${experience.logo}`,
    `- Source: ${experience.logoSource}`,
    `\n## Attachment\n${available(experience.attachment)}`,
  ].join("\n"));
}
experienceFiles["direction.md"] = file("direction.md", `# Current direction\n\n${careerTimeline.map((item) => `## ${item.title}\n${item.description}\n\nStatus: ${item.badge}\n`).join("\n")}`);

const skillFiles: Record<string, PortfolioEntry> = {};
for (const [group, skills] of Object.entries(skillGroups)) {
  const name = `${slug(group)}.md`;
  skillFiles[name] = file(name, `# ${group}\n\n${list(skills)}`);
}

const serviceFiles: Record<string, PortfolioEntry> = {};
for (const service of serviceCatalog) {
  const name = `${slug(service.title)}.md`;
  serviceFiles[name] = file(name, `# ${service.title}\n\n${service.description}\n\nContact: #contact`);
}

export const portfolioFileSystem = directory("portfolio", {
  "README.md": file("README.md", [
    `# ${portfolio.name} — portfolio files`,
    "\nA read-only, local explorer for the information published on this website.",
    "\n## Folders\n- projects/ — project briefs grouped by category\n- experience/ — roles and current direction\n- skills/ — skill groups\n- services/ — service descriptions",
    "\n## Start here\n- `tree` to see the folder map\n- `ls projects` to browse work\n- `cat projects/<category>/<project>.md` to read a project",
    "\nRun `help` for supported commands. This virtual filesystem does not access your computer or run system commands.",
  ].join("\n")),
  "about.md": file("about.md", "# About Rohan\n\nA curious builder working across security, software, and automation.\n\nMy interests sit where useful software meets resilient systems. I enjoy untangling complex workflows, learning how things fail, and turning those observations into practical experiences people can trust.\n\nThis portfolio is a working snapshot. Demonstrations are labeled so the boundary between a concept and shipped work stays clear."),
  "contact.md": file("contact.md", `# Contact\n\nAvailability: ${portfolio.availability}\nEmail: ${available(portfolio.contactEmail)}\nGitHub: ${available(portfolio.githubUrl)}\nLinkedIn: ${available(portfolio.linkedinUrl)}\nResume: ${available(portfolio.resumeUrl)}\n\nSome contact details have not been configured in the portfolio yet.`),
  projects: directory("projects", Object.fromEntries(Object.entries(projectFolders).map(([name, children]) => [name, directory(name, children)]))),
  experience: directory("experience", experienceFiles),
  skills: directory("skills", skillFiles),
  services: directory("services", serviceFiles),
});

export type CommandResult = { cwd: string; lines: string[]; clear?: boolean };

export function tokenizeCommand(input: string): string[] {
  return Array.from(input.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g), (match) => match[1] ?? match[2] ?? match[3]);
}

export function resolveVirtualPath(input: string, cwd: string): string {
  const raw = input.trim();
  const absolute = raw.startsWith("/") || raw === "~" || raw.startsWith("~/");
  const source = raw === "~" ? "/" : raw.startsWith("~/") ? raw.slice(1) : raw;
  const parts = absolute ? [] : cwd.split("/").filter(Boolean);
  for (const part of source.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return `/${parts.join("/")}`;
}

export function getPortfolioEntry(path: string): PortfolioEntry | undefined {
  let current: PortfolioEntry = portfolioFileSystem;
  for (const part of path.split("/").filter(Boolean)) {
    if (current.kind !== "directory") return undefined;
    const key: string | undefined = Object.keys(current.children).find((name: string) => name.toLowerCase() === part.toLowerCase());
    if (!key) return undefined;
    current = current.children[key];
  }
  return current;
}

function collectFiles(entry: PortfolioEntry, path: string): Array<{ path: string; file: PortfolioFile }> {
  if (entry.kind === "file") return [{ path, file: entry }];
  return Object.values(entry.children).flatMap((child) => collectFiles(child, `${path === "/" ? "" : path}/${child.name}`));
}

function treeLines(entry: PortfolioEntry, prefix = ""): string[] {
  if (entry.kind === "file") return [`${prefix}${entry.name}`];
  const children = Object.values(entry.children);
  return children.flatMap((child, index) => {
    const last = index === children.length - 1;
    const branch = last ? "└── " : "├── ";
    const label = child.kind === "directory" ? `${child.name}/` : child.name;
    return [`${prefix}${branch}${label}`, ...(child.kind === "directory" ? treeLines(child, `${prefix}${last ? "    " : "│   "}`) : [])];
  });
}

function summaryLines(): string[] {
  const statusCounts = new Map<string, number>();
  for (const project of portfolioProjects) statusCounts.set(project.status, (statusCounts.get(project.status) ?? 0) + 1);
  const statuses = [...statusCounts].map(([status, count]) => `  ${status}: ${count}`);
  return [
    "Portfolio data summary",
    `  Projects: ${portfolioProjects.length}`,
    ...statuses,
    `  Experience entries: ${careerExperiences.length}`,
    `  Skills: ${Object.values(skillGroups).flat().length} across ${Object.keys(skillGroups).length} groups`,
    `  Services: ${serviceCatalog.length}`,
    `  Contact email configured: ${portfolio.contactEmail ? "yes" : "no"}`,
  ];
}

export function runPortfolioCommand(raw: string, cwd: string, history: string[] = []): CommandResult {
  const args = tokenizeCommand(raw);
  const command = (args.shift() ?? "").toLowerCase();
  const targetArg = args.find((arg) => !arg.startsWith("-"));
  const path = resolveVirtualPath(targetArg || ".", cwd);
  const entry = getPortfolioEntry(path);
  const fail = (message: string): CommandResult => ({ cwd, lines: [`error: ${message}`] });
  const ok = (lines: string[] = [], nextCwd = cwd): CommandResult => ({ cwd: nextCwd, lines });

  if (!command) return ok();
  if (command === "help" || command === "--help") return ok([
    "Portfolio shell · read-only commands",
    "  pwd                         show the current folder",
    "  ls [path]                   list files and folders",
    "  cd [path]                   move through the virtual folders",
    "  tree [path]                 print the folder structure",
    "  cat <file>                  read a portfolio file",
    "  open <file-or-folder>       read a file or list a folder",
    "  find <word>                 search file names and contents",
    "  summary                     count the published portfolio data",
    "  projects | experience       show concise indexes",
    "  skills | services | contact show other portfolio data",
    "  uname [-a] | hostname | whoami | id    simulated host details",
    "  date | uptime | df [-h] | free [-h]   simulated system overview",
    "  history                     review commands from this session",
    "  clear                       clear this terminal view",
    "Example flow: cd projects → ls → cd cybersecurity → ls → cat soc-automation-lab.md",
    "Shortcuts: Tab completes commands and virtual paths · ↑/↓ recalls this session's commands",
    "This shell only browses website content; it cannot access the computer or run OS commands.",
  ]);
  if (command === "clear") return { cwd, lines: [], clear: true };
  if (command === "pwd") return ok([cwd]);
  if (command === "exit") return ok(["Returned to the portfolio root."], "/");
  if (command === "cd") {
    const destination = resolveVirtualPath(args[0] || "/", cwd);
    const node = getPortfolioEntry(destination);
    if (!node) return fail(`folder not found: ${args[0]}`);
    if (node.kind !== "directory") return fail(`${args[0]} is a file; use cat to read it.`);
    return ok([destination], destination);
  }
  if (command === "summary") return ok(summaryLines());
  if (command === "uname") return ok(args.includes("-a")
    ? ["RohanOS 6.8.0-portfolio #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux", "Virtual portfolio shell · read-only environment"]
    : ["Linux"]);
  if (command === "hostname") return ok(["rohan-portfolio"]);
  if (command === "whoami") return ok(["visitor"]);
  if (command === "id") return ok(["uid=1000(visitor) gid=1000(visitor) groups=1000(visitor)", "Virtual identity only; no host account is accessed."]);
  if (command === "date") return ok([new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "long" }).format(new Date())]);
  if (command === "uptime") return ok(["up — session uptime is not exposed in this browser simulation", "load average: not available (simulated shell)"]);
  if (command === "df") return ok(["Filesystem              Size  Used Avail Use% Mounted on", "portfolio-virtual-fs     1.0G  128M  896M  13% /", "Read-only estimate for the portfolio demo; not host disk usage."]);
  if (command === "free") return ok(["               total        used        free      shared  buff/cache   available", "Mem:         8192000     2048000     4096000           0     2048000     6144000", "Swap:              0           0           0", "Illustrative values only; this browser shell cannot inspect device memory."]);
  if (command === "history") return ok(history.length ? history.map((item, index) => ` ${String(index + 1).padStart(3, " ")}  ${item}`) : ["No commands in this session yet."]);
  if (command === "projects") return ok([
    `Projects (${portfolioProjects.length})`,
    ...portfolioProjects.map((project) => `  ${project.title} · ${project.status} · ${project.category}`),
    "Tip: cd projects/<category> then cat <project>.md",
  ]);
  if (command === "experience" || command === "experiences") return ok([
    `Experience entries (${careerExperiences.length})`,
    ...careerExperiences.map((item) => `  ${item.role} · ${item.company} · ${available(item.period)}`),
    `Current direction: ${careerTimeline.map((item) => item.title).join("; ")}`,
    "Tip: cat experience/<company>.md",
  ]);
  if (command === "skills") return ok([
    `Skills (${Object.values(skillGroups).flat().length})`,
    ...Object.entries(skillGroups).map(([group, items]) => `  ${group} (${items.length}): ${items.join(", ")}`),
  ]);
  if (command === "services") return ok([
    `Services (${serviceCatalog.length})`,
    ...serviceCatalog.map((item) => `  ${item.title} — ${item.description}`),
  ]);
  if (command === "about" || command === "whoami") {
    const about = getPortfolioEntry("/about.md");
    return ok(about?.kind === "file" ? about.content.split("\n").slice(2) : []);
  }
  if (command === "contact") {
    const contact = getPortfolioEntry("/contact.md");
    return ok(contact?.kind === "file" ? contact.content.split("\n").slice(2) : []);
  }
  if (command === "ls" || command === "dir") {
    if (!entry) return fail(`path not found: ${targetArg || "."}`);
    if (entry.kind === "file") return ok([entry.name]);
    const children = Object.values(entry.children);
    return ok(children.length ? children.map((child) => `${child.kind === "directory" ? "▸ " : "  "}${child.name}${child.kind === "directory" ? "/" : ""}`) : ["(empty folder)"]);
  }
  if (command === "tree") {
    if (!entry) return fail(`path not found: ${targetArg || "."}`);
    const parts = path.split("/").filter(Boolean);
    const label = path === "/" ? "portfolio/" : `${parts[parts.length - 1]}/`;
    const lines = entry.kind === "directory" ? [label, ...treeLines(entry)] : [entry.name];
    return ok(lines);
  }
  if (command === "cat" || command === "open" || command === "less") {
    if (!args.length) return fail(`usage: ${command} <path>`);
    if (!entry) return fail(`file not found: ${targetArg}`);
    if (entry.kind === "directory") return ok(Object.values(entry.children).map((child) => `${child.kind === "directory" ? "▸ " : "  "}${child.name}${child.kind === "directory" ? "/" : ""}`));
    return ok(entry.content.split("\n"));
  }
  if (command === "find" || command === "search") {
    const query = args.filter((arg) => !arg.startsWith("-")).join(" ").toLowerCase();
    if (!query) return fail(`usage: ${command} <word>`);
    const matches = collectFiles(portfolioFileSystem, "").filter(({ path: filePath, file: item }) => filePath.toLowerCase().includes(query) || item.content.toLowerCase().includes(query));
    return ok(matches.length ? matches.map(({ path: filePath }) => filePath) : [`No portfolio files matched “${query}”.`]);
  }
  return fail(`command not found: ${command}. Type help to see supported commands.`);
}

export function listCommandNames() {
  return ["about", "cat", "cd", "clear", "contact", "date", "df", "dir", "exit", "experience", "experiences", "find", "free", "help", "history", "hostname", "less", "ls", "open", "projects", "search", "services", "skills", "summary", "tree", "id", "uname", "uptime", "whoami"];
}

/** Bash-style completion scoped to the read-only virtual portfolio filesystem. */
export function completePortfolioInput(raw: string, cwd: string): string {
  const leading = raw.match(/^\s*/)?.[0] ?? "";
  const input = raw.slice(leading.length);
  if (!input) return raw;
  const lastSpace = input.lastIndexOf(" ");
  if (lastSpace < 0) {
    const matches = listCommandNames().filter((name) => name.startsWith(input.toLowerCase()));
    if (!matches.length) return raw;
    const common = matches.reduce((prefix, name) => {
      let i = 0;
      while (i < prefix.length && i < name.length && prefix[i].toLowerCase() === name[i].toLowerCase()) i++;
      return prefix.slice(0, i);
    });
    return leading + (matches.length === 1 ? matches[0] : common.length > input.length ? common : input);
  }

  const command = tokenizeCommand(input.slice(0, lastSpace))[0]?.toLowerCase();
  if (!["cd", "ls", "dir", "tree", "cat", "open", "less"].includes(command ?? "")) return raw;
  const partial = input.slice(lastSpace + 1);
  const slash = partial.lastIndexOf("/");
  const parentPart = slash < 0 ? "." : partial.slice(0, slash) || "/";
  const namePart = partial.slice(slash + 1).toLowerCase();
  const parent = getPortfolioEntry(resolveVirtualPath(parentPart, cwd));
  if (!parent || parent.kind !== "directory") return raw;
  const matches = Object.values(parent.children).filter((child) => child.name.toLowerCase().startsWith(namePart));
  if (!matches.length) return raw;
  const common = matches.reduce((prefix, child) => {
    let i = 0;
    while (i < prefix.length && i < child.name.length && prefix[i].toLowerCase() === child.name[i].toLowerCase()) i++;
    return prefix.slice(0, i);
  }, matches[0].name);
  const completedName = matches.length === 1 ? matches[0].name : common.length > namePart.length ? common : namePart;
  const completedPath = `${partial.slice(0, slash + 1)}${completedName}${matches.length === 1 && matches[0].kind === "directory" ? "/" : ""}`;
  return leading + input.slice(0, lastSpace + 1) + completedPath;
}
