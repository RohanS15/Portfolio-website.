import { lazy, Suspense, useState } from "react";
import { portfolio } from "../../content";
import ContactForm from "../../components/contact/ContactForm";
import ErrorBoundary from "../../components/ErrorBoundary";
import { DeferredChunk, LoadingBlock, MagneticLink, Mark, SectionHead, Services } from "../../components/layout/PortfolioPrimitives";
import SocialIcon, { type SocialPlatform } from "../../components/socials/SocialIcon";

const HeroIdentityExperience = lazy(() => import("../../components/hero/HeroIdentityExperience"));
const ExperienceTimeline = lazy(() => import("../../ExperienceTimeline"));
const SkillExplorer = lazy(() => import("../skills/SkillExplorer").then((module) => ({ default: module.SkillExplorer })));
const ProjectGallery = lazy(() => import("../projects/ProjectGallery").then((module) => ({ default: module.ProjectGallery })));
const socialLinks: Array<[SocialPlatform, string, string]> = [
  ["github", "GitHub", portfolio.githubUrl],
  ["linkedin", "LinkedIn", portfolio.linkedinUrl],
  ["x", "X", portfolio.x],
  ["threads", "Threads", portfolio.threads],
  ["instagram", "Instagram", portfolio.instagram],
  ["discord", "Discord", portfolio.discord],
];

export default function PortfolioPage() {
  const [aboutMotionEnabled, setAboutMotionEnabled] = useState(true);
  return (
    <>            <section className="hero" id="home">
              <div className="hero-copy">
                <Mark>
                  INDEPENDENT PRACTICE <span className="sep">·</span> SECURITY ENGINEERING
                  <span className="sep">·</span> SOFTWARE DEVELOPMENT <span className="sep">·</span> FREELANCE
                </Mark>
                <h1 className="hero-title">
                  <span className="hero-line" aria-hidden="true">
                    <span className="hero-word">Read the</span>{" "}
                    <span className="hero-word">signal.</span>
                  </span>
                  <span className="hero-line hero-line-accent" aria-hidden="true">
                    <span className="hero-word">Build what</span>{" "}
                    <span className="hero-word">lasts.</span>
                  </span>
                  <span className="sr-only">Read the signal. Build what lasts.</span>
                </h1>
                <p className="hero-deck">
                  I’m Rohan, an independent cybersecurity engineer and developer. I turn
                  security insight and complex workflows into software people can trust.
                </p>
                <div className="hero-role">
                  <span>FROM SIGNAL TO STRONGER SYSTEMS</span>
                  <b>Understand <i>→</i> Build <i>→</i> Strengthen</b>
                </div>
              </div>
              <Suspense fallback={<div className="hero-3d-loading" aria-hidden="true"><span>R</span></div>}>
                <HeroIdentityExperience />
              </Suspense>
              <div className="hero-actions">
                <div className="hero-buttons">
                  <MagneticLink className="button-primary hero-cta" href="/projects#projects">
                    Explore selected work <span>↘</span>
                  </MagneticLink>
                  <MagneticLink className="button-quiet hero-cta" href="#contact">
                    Contact me <span>↗</span>
                  </MagneticLink>
                  <MagneticLink className="button-quiet hero-cta" href="">
                    Resume <span>↓</span>
                  </MagneticLink>
                </div>
                <div className="hero-status">
                  <span className="pulse-dot" />{" "}
                  {portfolio.availability.toUpperCase()}
                </div>
              </div>
              <div className="hero-footer">
                <span>SCROLL TO EXPLORE</span>
                <span className="scroll-line" />
                <span>01 — 10</span>
              </div>
            </section>
            <section id="about" className="section about">
              <div className="about-intro reveal">
                <div className="about-kicker">
                  <Mark>01 / A LITTLE CONTEXT</Mark>
                  <span>FIELD NOTES&nbsp; 01—03</span>
                </div>
                <div className="about-intro-grid">
                  <h2>
                    Built with curiosity.
                    <br />
                    <span>Grounded in purpose.</span>
                  </h2>
                  <p>
                    I work across cybersecurity, software, and automation —
                    bringing a systems mindset to problems that deserve
                    thoughtful solutions.
                  </p>
                </div>
              </div>
              <div className="about-editorial reveal">
                <div className="about-art" data-motion={aboutMotionEnabled ? "on" : "off"} role="group" aria-label="Orbiting systems illustration">
                  <div className="about-art-orbit orbit-one" />
                  <div className="about-art-orbit orbit-two" />
                  <div className="about-art-core">
                    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                      <path d="M24 6 39 15v18l-15 9L9 33V15L24 6Z" />
                      <path d="m16 24 5 5 11-11M24 7v10m14-2-9 5m9 13-10-5m-4 13V30m-14 3 9-5M10 15l10 5" />
                      <circle cx="24" cy="24" r="2.5" />
                    </svg>
                  </div>
                  <i className="about-art-node node-one" />
                  <i className="about-art-node node-two" />
                  <span className="about-art-caption">
                    CURIOSITY
                    <br />
                    IN MOTION
                  </span>
                  <button
                    className="about-art-motion-toggle"
                    type="button"
                    aria-pressed={aboutMotionEnabled}
                    aria-label={aboutMotionEnabled ? "Pause illustration motion" : "Enable illustration motion"}
                    onClick={() => setAboutMotionEnabled((enabled) => !enabled)}
                  >
                    <span aria-hidden="true">{aboutMotionEnabled ? "Ⅱ" : "▶"}</span>
                    {aboutMotionEnabled ? "PAUSE" : "ENABLE MOTION"}
                  </button>
                </div>
                <div className="about-main">
                  <Mark>HOW I THINK</Mark>
                  <p className="large-copy">
                    The best technology feels <em>clear</em> to the people using
                    it — and dependable when it matters most.
                  </p>
                  <div className="about-support">
                    <p>
                      My interests sit where useful software meets resilient
                      systems. I enjoy untangling complex workflows, learning
                      how things fail, and turning those observations into
                      practical experiences people can trust.
                    </p>
                    <p>
                      Explore the small labs and prototypes below. Each
                      demonstration is labeled to distinguish a concept from
                      shipped work.
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="about-principles reveal"
                aria-label="How I approach my work"
              >
                <article>
                  <span className="about-principle-number">01</span>
                  <div>
                    <h3>Understand the problem</h3>
                    <p>
                      Start with context, constraints, and the person on the
                      other side.
                    </p>
                  </div>
                  <span className="about-principle-mark" aria-hidden="true">
                    ↗
                  </span>
                </article>
                <article>
                  <span className="about-principle-number">02</span>
                  <div>
                    <h3>Make the system legible</h3>
                    <p>
                      Good defaults and clear feedback help people make better
                      decisions.
                    </p>
                  </div>
                  <span className="about-principle-mark" aria-hidden="true">
                    ↗
                  </span>
                </article>
                <article>
                  <span className="about-principle-number">03</span>
                  <div>
                    <h3>Stay curious, stay careful</h3>
                    <p>
                      Test assumptions and treat security as part of the design.
                    </p>
                  </div>
                  <span className="about-principle-mark" aria-hidden="true">
                    ↗
                  </span>
                </article>
              </div>
            </section>
            <section id="skills" className="section skills">
              <SectionHead
                index="02"
                kicker="TOOLS & PRACTICE"
                title={
                  <>
                    A growing toolkit,
                    <br />
                    <span>built for real problems.</span>
                  </>
                }
                copy="Filter by area to explore the working toolkit. The list describes focus, not proficiency scores or credentials."
              />
              <DeferredChunk panel="skills"><ErrorBoundary label="Skills"><Suspense fallback={<LoadingBlock label="skills" panel="skills" />}>
                <SkillExplorer />
              </Suspense></ErrorBoundary></DeferredChunk>
            </section>

            <section id="experience" className="section experience">
              <DeferredChunk panel="experience"><ErrorBoundary label="Experience"><Suspense fallback={<LoadingBlock label="experience" panel="experience" />}>
                <ExperienceTimeline />
              </Suspense></ErrorBoundary></DeferredChunk>
            </section>
            <section id="services" className="section services">
              <SectionHead
                index="05"
                kicker="HOW I CAN HELP"
                title={
                  <>
                    Practical help.
                    <br />
                    <span>Thoughtfully delivered.</span>
                  </>
                }
                copy="Freelance service areas, scoped around clear outcomes and a useful handoff."
              />
              <div className="reveal">
                <Services />
              </div>
            </section>
            <section id="contact" className="section contact">
              <div className="contact-top">
                <div>
                  <Mark>HAVE A GOOD PROBLEM?</Mark>
                  <h2>
                    Let’s make it
                    <br />
                    <span>work better.</span>
                  </h2>
                </div>
                <p>
                  Have a project in mind, a question, or an idea worth
                  exploring? Share a little context below and I’ll follow up.
                </p>
              </div>
              <div className="contact-grid">
                <ContactForm />
                <div className="contact-aside">
                  <div className="contact-availability">
                    <span className="pulse-dot" /> INTERESTED IN THOUGHTFUL COLLABORATIONS
                  </div>
                  {portfolio.contactEmail && <a className="contact-link" href={`mailto:${portfolio.contactEmail}`}>
                    <span>Email</span>
                    <b>{portfolio.contactEmail} ↗</b>
                  </a>}
                  {socialLinks.some(([, , href]) => Boolean(href)) && <div className="contact-profiles">
                    <span>Professional profiles</span>
                    <div>
                      {socialLinks.filter(([, , href]) => Boolean(href)).map(([platform, label, href]) => (
                        <a key={platform} href={href} target="_blank" rel="noreferrer" aria-label={`${label} profile`} title={label}>
                          <SocialIcon platform={platform} />
                          <span>{label}</span>
                          <i aria-hidden="true">↗</i>
                        </a>
                      ))}
                    </div>
                  </div>}
                  <div className="availability-note">
                    <span>↗</span>
                    <p>
                      Your details are used to handle this inquiry and reply if needed.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section
              className="profile-feature-section reveal"
              aria-labelledby="profile-feature-title"
            >
              <div className="profile-feature-copy">
                <Mark>THE PERSON BEHIND THE SYSTEMS</Mark>
                <h2 id="profile-feature-title">
                  Curious by nature.
                  <br />
                  <span>Careful by design.</span>
                </h2>
                <p>
                  I’m Rohan, a cybersecurity and software engineer focused on
                  building dependable digital experiences, clear security
                  workflows, and thoughtful automation.
                </p>
                <p>
                  I enjoy turning complex systems into useful tools people can
                  understand, trust, and work with confidently.
                </p>
                <a className="button-primary" href="#contact">
                  Let’s talk <span>↗</span>
                </a>
              </div>
              <div className="profile-feature-visual" aria-label="Portrait of Rohan">
                <div className="profile-feature-orbit profile-feature-orbit-a" aria-hidden="true" />
                <div className="profile-feature-orbit profile-feature-orbit-b" aria-hidden="true" />
                <div className="profile-feature-frame">
                  <img
                    className="profile-feature-photo"
                    src="/images/rohan-profile.png"
                    alt="Portrait of Rohan"
                    loading="lazy"
                  />
                  <span className="profile-feature-caption">ROHAN SINGH · ENGINEER / BUILDER</span>
                </div>
              </div>
            </section>
              </>
  );
}
