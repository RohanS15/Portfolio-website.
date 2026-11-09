import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { motion } from "motion/react";
import { portfolioProjects, type PortfolioProject } from "../../content";
const projectFilters = [
  "All",
  "Multi-Page",
  "Single-Page",
  "Current portfolio",
  "Web Development",
  "E-commerce",
  "Web3",
  "Fitness",
  "Cybersecurity",
  "AI Automation",
  "Experimental",
];
const projectTypeFilters = ["Multi-Page", "Single-Page", "Current portfolio"];

function ProjectPreview({ src, alt, icon, detail = false }: { src: string | null | undefined; alt: string; icon: string; detail?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return <span className={detail ? "detail-preview-fallback" : "project-orb"} role="img" aria-label={`${alt} unavailable`}>{icon}</span>;
  }
  return <img className={detail ? "detail-preview" : "project-preview-image"} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
export function ProjectGallery() {
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const visible = portfolioProjects.filter(
    (project) =>
      category === "All" ||
      (projectTypeFilters.includes(category)
        ? project.projectType === category
        : project.category === category),
  );
  const open = (project: PortfolioProject) => {
    setSelected(project);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  return (
    <>
      <div className="project-tools reveal">
        <div
          id="project-filters"
          className="filter-bar"
          role="group"
          aria-label="Filter projects by category"
        >
          {projectFilters.map((name) => (
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
              <span>
                {name === "All"
                  ? portfolioProjects.length
                  : portfolioProjects.filter((project) =>
                      projectTypeFilters.includes(name)
                        ? project.projectType === name
                        : project.category === name,
                    ).length}
              </span>
            </motion.button>
          ))}
        </div>
        <span className="project-count">
          <b>{String(visible.length).padStart(2, "0")}</b> /{" "}
          {String(portfolioProjects.length).padStart(2, "0")} EXPLORATIONS
        </span>
      </div>
      {visible.length ? (
        <div
          className="project-grid reveal"
          data-layout={category === "All" ? "overview" : "filtered"}
          aria-live="polite"
        >
          {visible.map((project, i) => (
            <article
              className="project-card"
              data-project={project.title}
              key={project.id}
              style={{ "--project-order": i } as React.CSSProperties}
            >
              <button
                className="project-open"
                type="button"
                onClick={() => open(project)}
                aria-label={`Open details for ${project.title}`}
              >
                <span
                  className={`project-visual${project.previewImage ? " has-preview" : ""}`}
                >
                  <ProjectPreview src={project.previewImage} alt={`${project.title} project preview`} icon={project.icon} />
                  <span className="project-index">
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {String(visible.length).padStart(2, "0")}
                  </span>
                  <span className="project-stamp">{project.status}</span>
                  <span className="project-visual-caption" aria-hidden="true">
                    {project.projectType.toUpperCase()}
                    <i> / {project.category.toUpperCase()}</i>
                  </span>
                </span>
                <span className="project-info">
                  <span className="project-tag">
                    {project.tag}
                    <i>· {project.category}</i>
                  </span>
                  <span className="project-title">{project.title}</span>
                  <span className="project-description">
                    {project.description}
                  </span>
                  <span className="project-tech">
                    {project.technologies.length
                      ? project.technologies.slice(0, 4).join(" · ")
                      : "Technology details not listed"}
                  </span>
                  <span className="project-link">
                    View project details <i aria-hidden="true">↗</i>
                  </span>
                </span>
              </button>
              <div className="project-actions">
                <button type="button" onClick={() => open(project)}>
                  Details <span>↗</span>
                </button>
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target={
                      project.demoUrl.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      project.demoUrl.startsWith("http")
                        ? "noreferrer"
                        : undefined
                    }
                  >
                    Demo ↗
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="project-empty">
          No {category.toLowerCase()} project is published yet. This category is
          ready for a verified project.
        </div>
      )}
      <dialog
        ref={dialog}
        className="project-dialog"
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="project-detail">
            <div className="detail-top">
              <div>
                <span className="project-tag">
                  {selected.projectType} · {selected.category}
                </span>
                <h3>{selected.title}</h3>
              </div>
              <button
                type="button"
                className="dialog-close"
                onClick={close}
                aria-label="Close project details"
              >
                ×
              </button>
            </div>
            <ProjectPreview src={selected.previewImage} alt={`${selected.title} preview`} icon={selected.icon} detail />
            <p className="project-detail-description">
              {selected.longDescription || selected.description}
            </p>
            {(selected.problem || selected.solution) && (
              <div className="detail-columns">
                {selected.problem && (
                  <section>
                    <h4>Project context</h4>
                    <p>{selected.problem}</p>
                  </section>
                )}
                {selected.solution && (
                  <section>
                    <h4>Approach</h4>
                    <p>{selected.solution}</p>
                  </section>
                )}
              </div>
            )}
            {selected.features.length > 0 && (
              <>
                <h4>Features</h4>
                <ul>
                  {selected.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="detail-chip-row">
              <div>
                <small>TECHNOLOGIES</small>
                <div>
                  {(selected.technologies.length
                    ? selected.technologies
                    : ["Not listed in source"]
                  ).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
            {selected.verificationNote && (
              <p className="project-verification">
                {selected.verificationNote}
              </p>
            )}
            <div className="dialog-footer">
              <span>{selected.status}</span>
              <div className="project-actions">
                {selected.demoUrl && (
                  <a
                    href={selected.demoUrl}
                    target={
                      selected.demoUrl.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      selected.demoUrl.startsWith("http")
                        ? "noreferrer"
                        : undefined
                    }
                  >
                    Open demo ↗
                  </a>
                )}
                {selected.githubUrl && (
                  <a href={selected.githubUrl} target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
