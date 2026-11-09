import {
  siApifox,
  siDocker,
  siDavinciresolve,
  siFastapi,
  siFigma,
  siFirebase,
  siFortinet,
  siGit,
  siGithub,
  siGithubactions,
  siHtml5,
  siJavascript,
  siKubernetes,
  siLinux,
  siMysql,
  siN8n,
  siNetlify,
  siNodedotjs,
  siNextdotjs,
  siNotion,
  siOllama,
  siOpenapiinitiative,
  siOpenjdk,
  siOpentext,
  siPostman,
  siPython,
  siQwen,
  siReact,
  siRedhat,
  siSupabase,
  siThreedotjs,
  siTypescript,
  siUbuntu,
  siVercel,
  siWordpress,
  type SimpleIcon,
} from "simple-icons";

const brandIcons: Record<string, SimpleIcon> = {
  JavaScript: siJavascript,
  TypeScript: siTypescript,
  Python: siPython,
  Java: siOpenjdk,
  HTML5: siHtml5,
  React: siReact,
  "Next.js": siNextdotjs,
  "Three.js": siThreedotjs,
  "React Three Fiber": siReact,
  "Node.js": siNodedotjs,
  FastAPI: siFastapi,
  MySQL: siMysql,
  Firebase: siFirebase,
  Supabase: siSupabase,
  "REST APIs": siOpenapiinitiative,
  "JDBC": siOpenjdk,
  "API Integrations": siApifox,
  "Fortinet FortiGate": siFortinet,
  "OpenText SMAX": siOpentext,
  n8n: siN8n,
  Ollama: siOllama,
  "Qwen 2.5": siQwen,
  Docker: siDocker,
  "Docker Compose": siDocker,
  Kubernetes: siKubernetes,
  Linux: siLinux,
  "Red Hat Enterprise Linux": siRedhat,
  Ubuntu: siUbuntu,
  Git: siGit,
  GitHub: siGithub,
  "GitHub Actions": siGithubactions,
  Postman: siPostman,
  Vercel: siVercel,
  Netlify: siNetlify,
  Figma: siFigma,
  "DaVinci Resolve": siDavinciresolve,
  Notion: siNotion,
  WordPress: siWordpress,
};

const monogramIcons: Record<string, string> = {
  "Adobe After Effects": "Ae",
};

const fallbackPaths: Record<string, string> = {
  Languages: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14",
  "Frontend Development": "M4 5h16v11H4zM8 20h8m-4-4v4",
  "Backend Development": "M4 6h16v12H4zM8 10h.01M8 14h.01m4-4h4m-4 4h4",
  "Databases & Backend Platforms": "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Zm-8 3v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6m-16 6c0 1.7 3.6 3 8 3s8-1.3 8-3",
  "API & Integration": "M8 12h8m-4-4v8M5 5h4v4H5zM15 15h4v4h-4zM15 5h4v4h-4zM5 15h4v4H5z",
  "Cybersecurity & SIEM": "M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Zm-3 9 2 2 4-4",
  "AI & Automation": "M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8m0-12.8-2.8 2.8m-7.2 7.2-2.8 2.8",
  "DevOps & Infrastructure": "M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z",
  "Developer Tools": "M4 7h16M4 12h16M4 17h16M9 5v4m6 1v4m-4 1v4",
  "Design & Creative": "m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Zm10.5-12.5 3 3",
  "Productivity & CMS": "M4 5h16v14H4zM8 9h8m-8 4h8m-8 3h5",
};

export default function TechStackIcon({ name, category }: { name: string; category: string }) {
  const icon = brandIcons[name];
  const monogram = monogramIcons[name];
  return (
    <svg className={`tech-stack-icon${icon || monogram ? " has-brand-icon" : " is-category-icon"}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {icon ? <path d={icon.path} /> : monogram ? (
        <text x="12" y="12" textAnchor="middle" dominantBaseline="central" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700">{monogram}</text>
      ) : <path d={fallbackPaths[category] ?? fallbackPaths.Languages} />}
    </svg>
  );
}
