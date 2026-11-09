import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Owns the page entrance and scroll reveals; component interactions stay in Motion/CSS. */
export default function AnimationRuntime() {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = gsap.matchMedia();

    animations.add("(prefers-reduced-motion: no-preference)", () => {
      const revealContexts = new Map<HTMLElement, gsap.Context>();
      let mutationObserver: MutationObserver | undefined;
      let resizeObserver: ResizeObserver | undefined;
      let refreshFrame = 0;

      const addReveal = (element: HTMLElement) => {
        if (revealContexts.has(element)) return;
        const context = gsap.context(() => {
          const targets = element.matches(".section-head")
            ? Array.from(element.querySelectorAll<HTMLElement>(".eyebrow, h2, p"))
            : [element];
          if (!targets.length) return;

          gsap.fromTo(
            targets,
            { autoAlpha: 0, y: 14 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.48,
              stagger: targets.length > 1 ? 0.07 : 0,
              ease: "power3.out",
              clearProps: "opacity,transform,visibility",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true,
                invalidateOnRefresh: true,
                onEnter: () => element.classList.add("visible"),
              },
            },
          );
        }, element);
        revealContexts.set(element, context);
      };

      const scanReveals = (root: ParentNode) => {
        root.querySelectorAll<HTMLElement>(".reveal").forEach(addReveal);
        if (root instanceof HTMLElement && root.matches(".reveal")) addReveal(root);
      };

      const hero = document.querySelector<HTMLElement>(".division-main-portfolio .hero");
      if (hero) {
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .from(hero.querySelectorAll(".hero-copy > .eyebrow"), { autoAlpha: 0, y: 10, duration: 0.28 })
          .from(hero.querySelectorAll(".hero-word"), { autoAlpha: 0, yPercent: 82, rotateX: -8, duration: 0.5, stagger: 0.035, clearProps: "all" }, "-=0.18")
          .from(hero.querySelectorAll(".hero-deck, .hero-role, .hero-buttons, .hero-status"), { autoAlpha: 0, y: 10, duration: 0.28, stagger: 0.04, clearProps: "all" }, "-=0.23")
          .from(hero.querySelector(".hero-identity-visual"), { autoAlpha: 0, scale: 0.985, x: 10, duration: 0.38, clearProps: "all" }, "-=0.15")
          .from(hero.querySelectorAll(".identity-orbit-track"), { autoAlpha: 0, duration: 0.3, stagger: 0.07 }, "-=0.12")
          .from(hero.querySelector(".identity-core"), { autoAlpha: 0, duration: 0.28 }, "-=0.1")
          .from(hero.querySelectorAll(".identity-visual-heading, .identity-marker, .identity-visual-footer"), { autoAlpha: 0, y: 5, duration: 0.22, stagger: 0.035, clearProps: "all" }, "-=0.12")
          .from(hero.querySelector(".hero-footer"), { autoAlpha: 0, y: 7, duration: 0.22, clearProps: "all" }, "-=0.2");
      }

      scanReveals(document);
      const main = document.querySelector("main");
      if ("MutationObserver" in window) {
        mutationObserver = new MutationObserver((records) => {
          records.forEach((record) => {
            record.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) scanReveals(node);
            });
            record.removedNodes.forEach((node) => {
              if (!(node instanceof HTMLElement)) return;
              revealContexts.forEach((context, element) => {
                if (node === element || node.contains(element)) {
                  context.revert();
                  revealContexts.delete(element);
                }
              });
            });
          });
        });
        mutationObserver.observe(main ?? document.body, { childList: true, subtree: true });
      }

      if (main && "ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(() => {
          cancelAnimationFrame(refreshFrame);
          refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        });
        resizeObserver.observe(main);
      }
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(refreshFrame);
        mutationObserver?.disconnect();
        resizeObserver?.disconnect();
        revealContexts.forEach((context) => context.revert());
        revealContexts.clear();
      };
    });

    return () => {
      animations.revert();
    };
  }, []);

  return null;
}
