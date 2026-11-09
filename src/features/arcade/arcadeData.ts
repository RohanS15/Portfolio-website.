export const gameNames = [
  "Cyber Defense",
  "Terminal",
  "Binary Puzzle",
  "Memory Matrix",
  "Debugging",
  "Reaction",
];

export const shellPuzzles = [
  {
    prompt: "$ list files in the current folder",
    answer: "ls",
    choices: ["ls", "pwd", "cd"],
    why: "ls lists directory entries.",
  },
  {
    prompt: "$ print the current folder path",
    answer: "pwd",
    choices: ["cat", "pwd", "grep"],
    why: "pwd prints the working directory.",
  },
  {
    prompt: "$ move into the logs folder",
    answer: "cd logs",
    choices: ["cd logs", "ls logs", "open logs"],
    why: "cd changes the current directory.",
  },
  {
    prompt: "$ find ERROR lines in access.log",
    answer: "grep ERROR access.log",
    choices: ["grep ERROR access.log", "pwd access.log", "cd ERROR"],
    why: "grep searches file contents for a pattern.",
  },
  {
    prompt: "$ show the last 20 lines of auth.log",
    answer: "tail -n 20 auth.log",
    choices: ["head -n 20 auth.log", "tail -n 20 auth.log", "ls -20 auth.log"],
    why: "tail -n prints the final N lines.",
  },
  { prompt: "$ include hidden entries in the current folder", answer: "ls -a", choices: ["ls -a", "pwd -a", "cd -a"], why: "ls -a includes entries whose names begin with a dot." },
  { prompt: "$ search case-insensitively for warning in secure.log", answer: "grep -i warning secure.log", choices: ["grep -i warning secure.log", "tail warning secure.log", "find -i secure.log"], why: "grep -i searches for a pattern without matching letter case." },
  { prompt: "$ print the current account name", answer: "whoami", choices: ["whoami", "hostname", "id -f"], why: "whoami prints the effective username." },
  { prompt: "$ display the first 10 lines of boot.log", answer: "head -n 10 boot.log", choices: ["head -n 10 boot.log", "tail -n 10 boot.log", "cat -n 10 boot.log"], why: "head -n prints the first N lines of a file." },
  { prompt: "$ read the operating system release details", answer: "cat /etc/os-release", choices: ["cat /etc/os-release", "cd /etc/os-release", "grep /etc"], why: "cat reads the release metadata file. In this game, all commands are simulated." },
];

export const bugs = [
  {
    code: 'const isAllowed = user => {\n  return user.role = "admin";\n}',
    answer: "Assignment instead of comparison",
    fix: "Assignment changes the value. Compare with === instead.",
  },
  {
    code: "const countItems = items => {\n  return items.length - 1;\n}",
    answer: "Off-by-one result",
    fix: "The length is already the item count. Subtracting one drops an item.",
  },
  {
    code: 'if (password = "secret") {\n  allowLogin();\n}',
    answer: "Assignment instead of comparison",
    fix: "Use a safe comparison and never hard-code real credentials.",
  },
  {
    code: "const isEmpty = list => {\n  return list.length = 0;\n}",
    answer: "Assignment instead of comparison",
    fix: "Use === to compare the length with zero.",
  },
  {
    code: "const label = value => {\n  return value.toUpperCase;\n}",
    answer: "Missing function call",
    fix: "Call the method with parentheses: value.toUpperCase().",
  },
  { code: "const first = values => {\n  return values[1];\n}", answer: "Off-by-one result", fix: "JavaScript arrays start at index 0, so the first item is values[0]." },
  { code: "const isReady = state => {\n  return state.ready = true;\n}", answer: "Assignment instead of comparison", fix: "This assigns true instead of checking the current state. Compare with ===." },
  { code: "const totalItems = prices => {\n  return prices.length - 1;\n}", answer: "Off-by-one result", fix: "The length is already the item count. Subtracting one drops an item." },
  { code: "const getName = user => {\n  return user.getName;\n}", answer: "Missing function call", fix: "Return the result of the method by calling it: user.getName()." },
  { code: 'const isAdmin = user => {\n  return user.role = "admin";\n}', answer: "Assignment instead of comparison", fix: "This changes the role value. Compare against the expected role with ===." },
];

export const securityQuestions = [
  {
    log: "user=jsingh src=198.51.100.23 result=SUCCESS after_failures=14",
    suspicious: true,
  },
  {
    log: "user=admin src=203.0.113.81 result=SUCCESS device=NEW country=NEW",
    suspicious: true,
  },
  {
    log: "user=buildbot src=192.0.2.44 result=SUCCESS change_window=ACTIVE",
    suspicious: false,
  },
  {
    log: "user=analyst src=198.51.100.23 failures=22 interval=3m",
    suspicious: true,
  },
  {
    log: "user=backup src=192.0.2.44 result=SUCCESS schedule=EXPECTED",
    suspicious: false,
  },
  { log: "user=jsingh src=198.51.100.23 result=FAILURE after_failures=3", suspicious: true },
  { log: "user=deploy src=203.0.113.81 result=SUCCESS change_window=ACTIVE", suspicious: false },
  { log: "user=finance src=192.0.2.90 result=SUCCESS mfa=DENIED", suspicious: true },
  { log: "user=backup src=192.0.2.44 result=SUCCESS host=EXPECTED", suspicious: false },
  { log: "user=admin src=203.0.113.140 result=SUCCESS mfa=ABSENT device=NEW", suspicious: true },
];
