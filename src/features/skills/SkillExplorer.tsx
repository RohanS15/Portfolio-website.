import { useState } from "react";
import { motion } from "motion/react";
import { techStack } from "../../content";
import TechStackIcon from "./TechStackIcon";

const descriptions: Record<string, string> = {
  Languages: "Programming and web platform fundamentals used across my work.",
  "Frontend Development": "Component-driven interfaces and interactive 3D experiences.",
  "Backend Development": "Application services and server-side development technologies.",
  "Databases & Backend Platforms": "Data stores and managed backend platforms.",
  "API & Integration": "Service interfaces, event hooks, and integration methods.",
  "Cybersecurity & SIEM": "Enterprise security operations and SIEM platforms.",
  "AI & Automation": "Local language models and workflow automation tools.",
  "DevOps & Infrastructure": "Containers, orchestration, Linux, and development environments.",
  "Developer Tools": "Source control, delivery platforms, editors, and API tooling.",
  "Design & Creative": "Visual design, motion graphics, video editing, and digital content creation.",
  "Productivity & CMS": "Publishing, knowledge management, and productivity tools.",
};

const categories = Object.keys(techStack);
const totalTools = Object.values(techStack).flat().length;

export function SkillExplorer() {
  const [category, setCategory] = useState("All");
  const groups = Object.entries(techStack).filter(
    ([name]) => category === "All" || name === category,
  );
  const visibleTools = groups.reduce((total, [, items]) => total + items.length, 0);

  return (
    <div className="skill-explorer reveal">
      <div className="tools-toolbar">
        <div
          className="filter-bar"
          role="group"
          aria-label="Filter technologies by category"
        >
          {["All", ...categories].map((name) => {
            const count = name === "All" ? totalTools : techStack[name].length;
            return (
              <motion.button
                key={name}
                type="button"
                className={category === name ? "filter-active" : ""}
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 340, damping: 22 }}
              >
                {name}
                <span>{count}</span>
              </motion.button>
            );
          })}
        </div>
        <span className="tools-count">
          {groups.length} CATEGORIES <i>·</i> {visibleTools} TECHNOLOGIES
        </span>
      </div>
      <div className="skill-groups tools-grid" aria-live="polite">
        {groups.map(([group, items], i) => (
          <article
            className="skill-group tool-card"
            key={group}
            style={{ "--card-index": i } as React.CSSProperties}
          >
            <div className="tool-card-top">
              <span className="tool-icon">
                <TechStackIcon name={items[0]} category={group} />
              </span>
              <span className="tool-category">{group}</span>
            </div>
            <div className="skill-group-head">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{group}</h3>
              <small>{String(items.length).padStart(2, "0")} TOOLS</small>
            </div>
            <p className="tool-description">{descriptions[group]}</p>
            <div className="skill-chips">
              {items.map((skill) => (
                <span className="tech-chip" key={skill}>
                  <TechStackIcon name={skill} category={group} />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <p className="skill-note">
        Tools and technologies describe areas I work with; they do not imply proficiency
        scores or certifications.
      </p>
    </div>
  );
}
