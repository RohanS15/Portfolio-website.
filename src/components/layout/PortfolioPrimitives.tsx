import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { serviceCatalog } from "../../content";
export function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow">
      <i />
      {children}
    </span>
  );
}
export function LoadingBlock({ label, panel }: { label: string; panel: string }) {
  return (
    <div className="route-chunk-loading" data-panel={panel} role="status" aria-live="polite">
      <span className="pulse-dot" aria-hidden="true" />
      <span>Loading {label}…</span>
    </div>
  );
}
export function DeferredChunk({
  panel,
  children,
}: {
  panel: string;
  children: React.ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearViewport(true);
      observer.disconnect();
    }, { rootMargin: "420px 0px 420px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={host} className="deferred-chunk" data-panel={panel}>
      {nearViewport ? children : <div className="route-chunk-placeholder" data-panel={panel} aria-hidden="true" />}
    </div>
  );
}
export function SectionHead({
  index,
  kicker,
  title,
  copy,
}: {
  index: string;
  kicker: string;
  title: React.ReactNode;
  copy?: string;
}) {
  return (
    <div className="section-head reveal">
      <div>
        <Mark>
          {index} / {kicker}
        </Mark>
        <h2>{title}</h2>
      </div>
      {copy && <p>{copy}</p>}
    </div>
  );
}
export function PointerGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const glow = ref.current;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    if (!glow) return;
    let frame = 0;
    let x = -1000;
    let y = -1000;
    const move = (event: PointerEvent) => {
      x = event.clientX - 210;
      y = event.clientY - 210;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        frame = 0;
      });
    };
    const hide = () => { glow.style.opacity = "0"; };
    const show = () => { glow.style.opacity = ""; };
    const syncPointerEffect = () => {
      window.removeEventListener("pointermove", move);
      if (motionPreference.matches || coarse.matches) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        glow.style.opacity = "0";
        return;
      }
      window.addEventListener("pointermove", move, { passive: true });
      show();
    };
    syncPointerEffect();
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    motionPreference.addEventListener("change", syncPointerEffect);
    coarse.addEventListener("change", syncPointerEffect);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      motionPreference.removeEventListener("change", syncPointerEffect);
      coarse.removeEventListener("change", syncPointerEffect);
    };
  }, []);
  return <div ref={ref} className="pointer-glow" aria-hidden="true" />;
}
export function MagneticLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 22, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 240, damping: 22, mass: 0.5 });
  const onPointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.1);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.1);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.a
      href={href}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
    >
      {children}
    </motion.a>
  );
}
export function ScrollControls() {
  const [show, setShow] = useState(false);
  const isVisible = useRef(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        document.documentElement.style.setProperty("--scroll-progress", `${max > 0 ? scrollY / max : 0}`);
        const visible = scrollY > 500;
        if (visible !== isVisible.current) {
          isVisible.current = visible;
          setShow(visible);
        }
      });
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      {show && (
        <button
          className="scroll-to-top"
          type="button"
          aria-label="Scroll to top"
          title="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
        >
          ↑
        </button>
      )}
    </>
  );
}
export function Services() {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <div className="service-grid">
      {serviceCatalog.map(({ icon, title, description }, i) => (
        <motion.article
          key={title}
          className="service-card"
          whileHover={reduceMotion ? undefined : { y: -4 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 24 }}
        >
          <span className="service-icon">{icon}</span>
          <small>0{i + 1} — SERVICE</small>
          <h3>{title}</h3>
          <p>{description}</p>
          <a href="#contact">
            Discuss a project <span>↗</span>
          </a>
        </motion.article>
      ))}
    </div>
  );
}
