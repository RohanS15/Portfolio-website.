import { useEffect, useRef, useState } from "react";
import { careerExperiences } from "./content";

function ExperienceMark({ children }: { children: React.ReactNode }) {
  return (
    <span className="experience-eyebrow">
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

function CompanyLogo({ company, src }: { company: string; src?: string | null }) {
  const [failed, setFailed] = useState(!src);
  const logoClass = company === "OpenText" ? " opentext-logo" : "";
  return (
    <div className={`experience-logo${logoClass}${failed ? " logo-fallback" : ""}`}>
      {!failed && <img src={src!} alt={`${company} logo`} loading="lazy" onError={() => setFailed(true)} />}
      {failed && <span aria-label={`${company} logo unavailable`}>{company.trim().slice(0, 2).toUpperCase()}</span>}
    </div>
  );
}

export default function ExperienceTimeline() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let frame = 0;
    const updateProgress = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        const span = Math.max(1, rect.height - innerHeight * 0.35);
        const progress = Math.max(
          0,
          Math.min(1, (innerHeight * 0.68 - rect.top) / span),
        );
        element.style.setProperty("--career-progress", String(progress));
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="experience-showcase">
      <div className="experience-intro reveal">
        <div className="experience-intro-kicker">
          <ExperienceMark>04 / EXPERIENCE</ExperienceMark>
          <span>CAREER NOTES&nbsp; 01—04</span>
        </div>
        <div className="experience-intro-grid">
          <h2>
            Every role shapes
            <br />
            <span>what comes next.</span>
          </h2>
          <p>
            Every role has shaped the way I build, solve problems, and approach
            technology.
          </p>
        </div>
      </div>

      <div
        className="experience-track"
        ref={track}
        aria-label="Professional experience"
      >
        {careerExperiences.map((experience, index) => (
          <article
            className="experience-entry reveal"
            key={experience.id}
            style={{ "--experience-order": index } as React.CSSProperties}
          >
            <div className="experience-rail" aria-hidden="true">
              <span className="experience-node">
                <b>{String(index + 1).padStart(2, "0")}</b>
              </span>
            </div>
            <div className="experience-card">
              <div className="experience-card-top">
                <CompanyLogo company={experience.company} src={experience.logo} />
                <span className="experience-card-index">
                  EXPERIENCE / {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="experience-title-row">
                <div>
                  <h3>{experience.role}</h3>
                  <a
                    className="experience-company"
                    href={experience.companyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {experience.company}
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
                <div className="experience-badges">
                  {experience.employmentType && (
                    <span className="experience-type">
                      {experience.employmentType}
                    </span>
                  )}
                  {experience.period?.endsWith("Present") && (
                    <span className="experience-current">Present</span>
                  )}
                </div>
              </div>
              <div className="experience-meta" aria-label="Experience details">
                {experience.period && <span>{experience.period}</span>}
                {experience.duration && <span>{experience.duration}</span>}
                {experience.location && <span>{experience.location}</span>}
                {experience.arrangement && (
                  <span>{experience.arrangement}</span>
                )}
                {!experience.period && <span>Timeframe not listed</span>}
              </div>
              {(experience.employmentArrangement ||
                experience.clientOrganization ||
                experience.attachment ||
                experience.showProjectAndTechnologyDetails) && (
                <details className="experience-details">
                  <summary>
                    <span>Role details</span>
                    <i aria-hidden="true">+</i>
                  </summary>
                  <div className="experience-detail-body">
                    {experience.employmentArrangement && (
                      <div className="experience-work">
                        <small>EMPLOYMENT ARRANGEMENT</small>
                        <p className="experience-detail-heading">
                          {experience.employmentArrangement.title}
                        </p>
                        <p className="experience-detail-note">
                          {experience.employmentArrangement.description}
                        </p>
                      </div>
                    )}
                    {experience.clientOrganization && (
                      <div className="experience-work">
                        <small>CLIENT ORGANIZATION</small>
                        <p className="experience-detail-heading">
                          {experience.clientOrganization}
                        </p>
                      </div>
                    )}
                    {experience.showProjectAndTechnologyDetails &&
                      experience.projectWork.length > 0 && (
                        <div className="experience-work">
                          <small>PROJECT WORK</small>
                          <ol>
                            {experience.projectWork.map((item) => {
                              const separator = item.indexOf(": ");
                              return (
                                <li key={item}>
                                  {separator >= 0 ? (
                                    <>
                                      <strong>{item.slice(0, separator)}</strong>
                                      <p>{item.slice(separator + 2)}</p>
                                    </>
                                  ) : item}
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      )}
                    {experience.showProjectAndTechnologyDetails &&
                      experience.technologies.length > 0 && (
                        <div className="experience-work">
                          <small>TECHNOLOGIES</small>
                          <div className="experience-detail-tags">
                            {experience.technologies.map((item) => (
                              <span key={item}>{item}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    {experience.attachment && (
                      <a
                        className="experience-attachment"
                        href={experience.attachment}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="attachment-icon" aria-hidden="true">
                          ↗
                        </span>
                        <span>
                          <b>{experience.attachment.split("/").pop()}</b>
                          <small>Open attachment</small>
                        </span>
                        <i aria-hidden="true">↗</i>
                      </a>
                    )}
                  </div>
                </details>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className="experience-source-note">
        Time periods, locations, and additional responsibilities are shown only
        when verified details are available.
      </p>
    </div>
  );
}
