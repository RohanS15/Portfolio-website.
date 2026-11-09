import projectsData from "../portfolio-projects.json";

/** Public copy and links for the portfolio. Replace empty values before publishing. */
export const portfolio = {
  name: "Rohan",
  contactEmail: "rohansinghaug00@gmail.com",
  githubUrl: "https://github.com/RohanS15",
  linkedinUrl: "https://www.linkedin.com/in/bzydome/",
  x:"https://x.com/bzydome",
  threads:"https://www.threads.com/@bzydome",
  instagram:"https://www.instagram.com/bzydome/",
  discord:"https://discord.com/users/1396013213291909190",
  resumeUrl: "",
  availability: "Contact welcome",
};

export const techStack: Record<string, string[]> = {
  Languages: ["JavaScript", "TypeScript", "Python", "Java", "HTML5", "CSS3"],
  "Frontend Development": ["React", "Next.js", "Three.js", "React Three Fiber"],
  "Backend Development": ["Node.js", "FastAPI", "Python", "Java"],
  "Databases & Backend Platforms": ["MySQL", "Firebase", "Supabase"],
  "API & Integration": ["REST APIs", "Webhooks", "JDBC", "API Integrations"],
  "Cybersecurity & SIEM": [
    "ArcSight ESM", "ArcSight SOAR", "ArcSight Platform", "ArcSight Logger",
    "ArcSight Recon", "ArcSight ArcMC", "Fortinet FortiGate", "OpenText SMAX",
  ],
  "AI & Automation": [
    "n8n",
    "Docker",
    "Docker Compose",
    "Python",
    "FastAPI",
    "REST APIs",
    "JSON",
    "GitHub Actions",
    "Webhooks",
    "Workflow Automation",
    "API Integration",
    "Linux",
  ],
  "DevOps & Infrastructure": [
    "Docker", "Docker Compose", "Kubernetes", "Linux",
    "Red Hat Enterprise Linux", "Ubuntu", "WSL2",
  ],
  "Developer Tools": [
    "Git", "GitHub", "GitHub Actions", "Visual Studio Code", "OpenAI Codex",
    "Postman", "Vercel", "Netlify",
  ],
  "Design & Creative": [
    "Figma",
    "Canva",
    "DaVinci Resolve",
    "Adobe After Effects",
    "CapCut",
  ],
  "Productivity & CMS": ["WordPress", "Notion", "Microsoft Excel", "GitHub"],
};

// Compatibility export for the local terminal's synthetic profile data.
export const skillGroups = techStack;

export type PortfolioProject = {
  id: string;
  name: string;
  title: string;
  projectType: string;
  category: string;
  tag: string;
  description: string;
  longDescription: string;
  status: string;
  icon: string;
  problem: string;
  solution: string;
  features: string[];
  relatedSkills: string[];
  technologies: string[];
  previewImage: string | null;
  additionalImages: string[];
  demoUrl: string | null;
  githubUrl: string | null;
  detailsUrl: string | null;
  sourceDemoUrl?: string;
  migrationStatus: "existing" | "verified" | "partial";
  sourceWebsite: string;
  originalProject: boolean;
  verificationNote?: string;
};

function validatePortfolioProjects(value: unknown): PortfolioProject[] {
  if (!Array.isArray(value)) throw new Error("Project data must be an array.");
  const seen = new Set<string>();
  const stringFields = ["id", "name", "title", "projectType", "category", "tag", "description", "longDescription", "status", "icon", "problem", "solution", "sourceWebsite"];
  const arrayFields = ["technologies", "features", "relatedSkills", "additionalImages"];
  return value.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`Project record ${index + 1} is invalid.`);
    const project = item as Record<string, unknown>;
    if (stringFields.some((key) => typeof project[key] !== "string")) throw new Error(`Project record ${index + 1} is missing a required text field.`);
    if (arrayFields.some((key) => !Array.isArray(project[key]) || !(project[key] as unknown[]).every((entry) => typeof entry === "string"))) throw new Error(`Project record ${index + 1} has an invalid list field.`);
    const id = project.id as string;
    if (seen.has(id)) throw new Error(`Project id '${id}' appears more than once.`);
    seen.add(id);
    if (!["demoUrl", "githubUrl", "detailsUrl", "previewImage"].every((key) => project[key] === null || typeof project[key] === "string")) throw new Error(`Project '${id}' has an invalid URL or image field.`);
    if (!["existing", "verified", "partial"].includes(project.migrationStatus as string) || typeof project.originalProject !== "boolean") throw new Error(`Project '${id}' has invalid status metadata.`);
    return project as unknown as PortfolioProject;
  });
}

export const portfolioProjects = validatePortfolioProjects(projectsData.projects);

export const careerTimeline = [
  {
    dateLabel: "PLANNED · PRIMARY PORTFOLIO PROJECT",
    title: "SOC Automation Lab",
    description:
      "Build a local-first demonstration around synthetic alerts, Python/FastAPI, n8n, and a React dashboard. The roadmap is staged from input validation through incident workflows and a reviewable interface.",
    badge: "PLANNED FOCUS",
  },
];

export const serviceCatalog = [
  { icon: "⌘", title: "Website development", description: "A responsive website, tested across screen sizes, with a clean content handoff." },
  { icon: "◫", title: "Web applications", description: "A browser-based tool or dashboard with a documented setup and usage guide." },
  { icon: "◈", title: "Cybersecurity prototypes", description: "Synthetic alert investigations, security workflow concepts, and reviewable dashboard prototypes." },
  { icon: "⤳", title: "AI workflow automation", description: "A mapped automation flow with clear inputs, review steps, and failure paths." },
  { icon: "↗", title: "n8n workflow builds", description: "An exported workflow, configuration notes, and a sample run using test data." },
  { icon: "✳", title: "Social content creation", description: "A small set of platform-ready visual assets with editable source files." },
  { icon: "◷", title: "Video editing", description: "A polished short-form cut with supplied footage, captions, and export settings." },
  { icon: "▤", title: "Technical documentation", description: "A setup guide, process reference, or research summary with linked sources." },
  { icon: "⌕", title: "Digital research support", description: "A structured research brief, spreadsheet, or administrative deliverable with source notes." },
] as const;

export type CareerExperience = {
  id: string;
  company: string;
  role: string;
  employmentType?: string;
  companyUrl: string;
  logo: string;
  logoSource: string;
  technologies: string[];
  projectWork: string[];
  period: string | null;
  duration: string | null;
  location: string | null;
  arrangement: string | null;
  attachment: string | null;
  employmentArrangement?: { title: string; description: string };
  clientOrganization?: string;
  showProjectAndTechnologyDetails?: boolean;
};

// Employment details are transcribed from the supplied experience reference.
export const careerExperiences: CareerExperience[] = [
  {
    id: "opentext",
    company: "OpenText",
    role: "Professional Services | CyberRes",
    employmentType: "Full-time",
    companyUrl: "https://www.opentext.com/",
    logo: "/images/companies/opentext.svg",
    logoSource: "https://www.opentext.com/",
    technologies: [
      "ArcSight SOAR",
      "ArcSight ESM",
      "ArcSight Platform",
      "Logger",
      "Recon",
      "Linux / RHEL",
      "Kubernetes",
      "REST APIs",
      "JSON",
      "TCP/IP",
    ],
    projectWork: [
      "Security Orchestration & Automation (SOAR): Configured and troubleshot ArcSight SOAR playbooks, automated incident response workflows, and supported security operations.",
      "SIEM & Security Platform Implementation: Worked across ArcSight ESM, Platform, Logger, and Recon, supporting enterprise security monitoring and deployment activities.",
      "Security Product Integrations: Implemented and troubleshot integrations between ArcSight SOAR and third-party security products using REST APIs, JSON, and authentication mechanisms.",
      "Enterprise Security Infrastructure: Performed Linux/RHEL troubleshooting, Kubernetes diagnostics, log analysis, and network connectivity testing across enterprise environments.",
    ],
    showProjectAndTechnologyDetails: true,
    period: "Aug 2024 – Present",
    duration: null,
    location: "Gurugram, Haryana, India",
    arrangement: "Remote",
    attachment: null,
  },
  {
    id: "samartha-infosolutions",
    company: "Samartha InfoSolutions",
    role: "Technical Consultant",
    employmentType: "Full-time",
    companyUrl: "https://www.samarthainfo.com/",
    logo: "/images/companies/samartha.png",
    logoSource: "https://www.samarthainfo.com/assets/images/logo.png",
    technologies: [
      "Linux",
      "REST APIs",
      "System Integration",
      "Troubleshooting",
      "Technical Analysis",
      "Networking",
    ],
    projectWork: [
      "Technical Solution Implementation: Supported technical implementations and configurations, translating client requirements into practical technology solutions.",
      "System Integration & Troubleshooting: Worked on system integrations, investigated technical issues, and performed troubleshooting to ensure smooth operations.",
      "Client Requirements & Technical Analysis: Analyzed customer requirements, evaluated technical challenges, and supported the delivery of suitable solutions.",
      "Technical Documentation & Deployment Support: Assisted with technical documentation, configuration details, and implementation activities across customer environments.",
    ],
    period: "Aug 2024 – Present",
    duration: null,
    location: "Bengaluru, Karnataka, India",
    arrangement: "Remote",
    attachment: null,
    employmentArrangement: {
      title: "Contractual Engagement",
      description:
        "Employed through Samartha InfoSolutions and assigned to OpenText for a contractual professional services engagement.",
    },
    clientOrganization: "OpenText — Professional Services | CyberRes",
  },
  {
    id: "softonic",
    company: "Softonic",
    role: "Full-stack Developer",
    employmentType: "Freelance",
    companyUrl: "https://en.softonic.com/",
    logo: "/images/companies/softonic.svg",
    logoSource: "https://en.softonic.com/",
    technologies: ["JavaScript", "Node.js", "REST APIs", "HTML", "CSS"],
    projectWork: [
      "Ad Wall Optimization: Enhanced ad-wall functionality and optimized website performance for a smoother user experience.",
      "File Upload & Download Optimization: Optimized file transfer workflows, improving upload/download efficiency, reliability, and handling.",
    ],
    showProjectAndTechnologyDetails: true,
    period: "Feb 2024 – Jun 2024",
    duration: null,
    location: "Barcelona, Catalonia, Spain",
    arrangement: "Remote",
    attachment: null,
  },
  {
    id: "intrnforte",
    company: "IntrnForte",
    role: "Full-stack Developer",
    employmentType: "Internship",
    companyUrl: "https://intrnforte.com/",
    logo: "/images/companies/intrnforte.webp",
    logoSource:
      "https://intrnforte.com/wp-content/uploads/2023/12/Final-Logo-e1660925885924-1.webp",
    technologies: ["MERN stack", "CSS", "REST APIs"],
    projectWork: [
      "E-commerce website using the MERN stack",
      "Learning management system using the MERN stack",
    ],
    showProjectAndTechnologyDetails: true,
    period: "Apr 2023 – Jun 2023",
    duration: null,
    location: "Bengaluru, Karnataka, India",
    arrangement: "Remote",
    attachment: null,
  },
];

// Real experience, credentials, client work, and testimonials are intentionally
// omitted until verified details are provided.
