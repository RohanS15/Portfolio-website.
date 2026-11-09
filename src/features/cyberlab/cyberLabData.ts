export const alerts = [
  {
    id: "ALT-2048",
    severity: "HIGH",
    title: "Repeated authentication failures",
    host: "WS-FIN-07",
    time: "09:41:12 UTC",
    ip: "198.51.100.23",
    details:
      "14 failures followed by one successful login for account j.singh from an unfamiliar address.",
    indicators: [
      "14 failed logins / 4 min",
      "New source address",
      "Success after failure burst",
    ],
    response:
      "Temporarily contain the account, preserve the authentication events, and verify with the user through a trusted channel.",
    technique: "T1110 · Brute Force",
    rationale:
      "A repeated authentication failure pattern is a relevant training example for brute force detection.",
  },
  {
    id: "ALT-2051",
    severity: "MEDIUM",
    title: "Unusual outbound transfer",
    host: "ENG-LT-12",
    time: "10:08:36 UTC",
    ip: "203.0.113.81",
    details:
      "A workstation sent an unusual volume of outbound traffic shortly after a new process started.",
    indicators: [
      "Outbound volume 4.8× baseline",
      "Unusual process parent",
      "Destination not seen in 30 days",
    ],
    response:
      "Capture process and network context, check the destination against approved services, and escalate if the transfer is unapproved.",
    technique: "T1041 · Exfiltration Over C2 Channel",
    rationale:
      "This is a deliberately broad educational mapping. An outbound volume anomaly alone does not establish this technique.",
  },
  {
    id: "ALT-2056",
    severity: "LOW",
    title: "New scheduled task created",
    host: "LAB-VM-03",
    time: "10:22:04 UTC",
    ip: "192.0.2.44",
    details:
      "A scheduled task appeared on a lab host during a documented maintenance window.",
    indicators: [
      "Task created by admin",
      "Change window active",
      "Known lab subnet",
    ],
    response:
      "Correlate the task with the change record and close as expected activity if ownership is confirmed.",
    technique: "T1053.005 · Scheduled Task",
    rationale:
      "A scheduled task is a useful lab example for the Windows Scheduled Task sub-technique; confirm platform context before mapping.",
  },
];

export const tabs = ["LIVE DESK", "SIGNAL SPRINT", "SOC OVERVIEW", "PLAYBOOK", "ATT&CK MAP"] as const;

export const playbookSteps = [
  { title: "Normalize the indicator", description: "Trim whitespace, identify its type (domain, IP, or file hash), and preserve the original value so the lookup can be audited." },
  { title: "Check reputation context", description: "A VirusTotal-style provider can compare an indicator with submitted threat-intelligence reports. Treat detections as a signal: vendors can disagree, data can be stale, and a low count does not prove safety." },
  { title: "Choose a proportionate response", description: "Use reputation, asset importance, and surrounding telemetry together. Pick a response below; high-impact actions should require an analyst and an approved change path." },
  { title: "Record and review the action", description: "Document who approved the response, what evidence supported it, and when to reassess. This walkthrough only records your choice in the page; it does not block, isolate, or contact a service." },
];
