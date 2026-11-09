import { lazy, useEffect, useRef, useState } from "react";
import {
  ContextualSidebar,
  GlobalNavigation,
} from "./components/navigation/DivisionNavigation";
import { getDivision } from "./app/routes";
import PortfolioPage from "./features/pages/PortfolioPage";
import ProjectsPage from "./features/pages/ProjectsPage";
import PlaygroundPage from "./features/pages/PlaygroundPage";
import { PointerGlow, ScrollControls } from "./components/layout/PortfolioPrimitives";

const AnimationRuntime = lazy(() => import("./components/motion/AnimationRuntime"));

function App() {
  const division = getDivision(window.location.pathname);
  const [active, setActive] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const frame = requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-35% 0px -55%" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((e) => obs.observe(e));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const tiltStages = Array.from(document.querySelectorAll<HTMLElement>(".profile-feature-visual"));
    const detachTiltHandlers: Array<() => void> = [];
    const detachTilt = () => {
      detachTiltHandlers.splice(0).forEach((detach) => detach());
    };
    const attachParallax = () => {
      if (reduceMotion.matches || !finePointer.matches || detachTiltHandlers.length) return;
      tiltStages.forEach((stage) => {
        let frame = 0;
        let nextX = 0;
        let nextY = 0;
        const move = (event: PointerEvent) => {
          const rect = stage.getBoundingClientRect();
          nextX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          nextY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          if (frame) return;
          frame = requestAnimationFrame(() => {
            stage.style.setProperty("--profile-tilt-x", `${-nextY * 4}deg`);
            stage.style.setProperty("--profile-tilt-y", `${nextX * 6}deg`);
            frame = 0;
          });
        };
        const reset = () => {
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
          stage.style.setProperty("--profile-tilt-x", "0deg");
          stage.style.setProperty("--profile-tilt-y", "0deg");
        };
        stage.addEventListener("pointermove", move, { passive: true });
        stage.addEventListener("pointerleave", reset);
        detachTiltHandlers.push(() => {
          stage.removeEventListener("pointermove", move);
          stage.removeEventListener("pointerleave", reset);
          reset();
        });
      });
    };
    const syncParallax = () => {
      detachTilt();
      attachParallax();
    };
    syncParallax();
    const resetTilt = () =>
      tiltStages.forEach((stage) => {
        stage.style.setProperty("--profile-tilt-x", "0deg");
        stage.style.setProperty("--profile-tilt-y", "0deg");
      });
    window.addEventListener("blur", resetTilt);
    reduceMotion.addEventListener("change", syncParallax);
    finePointer.addEventListener("change", syncParallax);
    return () => {
      obs.disconnect();
      window.removeEventListener("blur", resetTilt);
      reduceMotion.removeEventListener("change", syncParallax);
      finePointer.removeEventListener("change", syncParallax);
      detachTilt();
    };
  }, []);
  return (
    <div className={`app-shell division-app division-${division}`}>
      <AnimationRuntime />
      <div className="ambient-grid" aria-hidden="true" />
      <PointerGlow />
      <GlobalNavigation
        division={division}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((v) => !v)}
      />
      <ContextualSidebar
        division={division}
        active={active}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />
      <a
        className="skip-link"
        href={
          division === "projects"
            ? "#projects"
            : division === "playground"
              ? "#explore"
              : "#home"
        }
      >
        Skip to content
      </a>
      <ScrollControls />
      <main className={`division-main division-main-${division}`}>
        {division === "portfolio" && <PortfolioPage />}
        {division === "projects" && <ProjectsPage />}
        {division === "playground" && <PlaygroundPage />}
        <footer>
          <a className="brand" href="/portfolio#home">
            <span className="brand-mark"><img src="/images/rohan-profile.png" alt="" /></span>
            <span>
              ROHAN<span className="brand-dot">.</span>
            </span>
          </a>
          <span>DESIGNED WITH INTENTION · BUILT TO KEEP LEARNING</span>
          <a
            href={
              division === "projects"
                ? "/projects#projects"
                : division === "playground"
                  ? "/playground#explore"
                  : "/portfolio#home"
            }
          >
            BACK TO TOP ↑
          </a>
        </footer>
      </main>
    </div>
  );
}

export default App;
