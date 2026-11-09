import { lazy, Suspense } from "react";
import ErrorBoundary from "../../components/ErrorBoundary";
import { DeferredChunk, LoadingBlock, Mark } from "../../components/layout/PortfolioPrimitives";

const ProjectGallery = lazy(() => import("../projects/ProjectGallery").then((module) => ({ default: module.ProjectGallery })));

export default function ProjectsPage() {
  return (
    <>            <section id="projects" className="section projects">
              <div className="projects-intro reveal">
                <div className="projects-kicker">
                  <Mark>03 / SELECTED EXPLORATIONS</Mark>
                  <span>PORTFOLIO / CURRENT WORK</span>
                </div>
                <div className="projects-heading">
                  <h2>
                    Work in progress.
                    <br />
                    <span>Ideas made tangible.</span>
                  </h2>
                  <p>
                    Browse verified work from the original portfolio alongside
                    current concepts and studies. Open a project for context,
                    technologies, and its available links.
                  </p>
                </div>
              </div>
              <DeferredChunk panel="projects"><ErrorBoundary label="Projects"><Suspense fallback={<LoadingBlock label="projects" panel="projects" />}>
                <ProjectGallery />
              </Suspense></ErrorBoundary></DeferredChunk>
            </section>
              </>
  );
}
