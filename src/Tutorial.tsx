import { useEffect, useRef, useState } from "react";
import type { TutorialId } from "./tutorials/playgroundTutorials";
import { playgroundTutorials } from "./tutorials/playgroundTutorials";

type TutorialProps = { id: TutorialId };

export default function Tutorial({ id }: TutorialProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [swipeStart, setSwipeStart] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const titleId = `${id}-tutorial-title`;
  const tutorial = playgroundTutorials[id];
  const card = tutorial.cards[step];

  const close = () => {
    if (dialog.current?.open) dialog.current.close();
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  };

  useEffect(() => {
    if (!open || !dialog.current) return;
    const previousOverflow = document.documentElement.style.overflow;
    dialog.current.showModal();
    document.documentElement.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      if (dialog.current?.open) dialog.current.close();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setStep((current) => Math.min(tutorial.cards.length - 1, current + 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setStep((current) => Math.max(0, current - 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, tutorial.cards.length]);

  const move = (delta: number) => setStep((current) => Math.max(0, Math.min(tutorial.cards.length - 1, current + delta)));
  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => setSwipeStart(event.changedTouches[0]?.clientX ?? null);
  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (swipeStart === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? swipeStart) - swipeStart;
    if (Math.abs(distance) > 48) move(distance < 0 ? 1 : -1);
    setSwipeStart(null);
  };

  return (
    <>
      <button ref={trigger} className="tutorial-link" type="button" onClick={() => { setStep(0); setOpen(true); }}>
        How to use <span aria-hidden="true">↗</span>
      </button>
      {open && (
        <dialog ref={dialog} className="tutorial-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); close(); }}>
          <div className="tutorial-top">
            <span className="tutorial-kicker">{tutorial.label} · CARD {String(step + 1).padStart(2, "0")} / {String(tutorial.cards.length).padStart(2, "0")}</span>
            <button ref={closeButton} type="button" className="tutorial-close" onClick={close} aria-label="Close tutorial">×</button>
          </div>
          <div className="tutorial-progress" role="progressbar" aria-label="Tutorial progress" aria-valuemin={1} aria-valuemax={tutorial.cards.length} aria-valuenow={step + 1}>
            <span style={{ width: `${((step + 1) / tutorial.cards.length) * 100}%` }} />
          </div>
          <article className="tutorial-card" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <span className="tutorial-card-index">{String(step + 1).padStart(2, "0")} <i>/ {String(tutorial.cards.length).padStart(2, "0")}</i></span>
            <h3 id={titleId} tabIndex={-1}>{card.title}</h3>
            <p className="tutorial-step" aria-live="polite">{card.body}</p>
            {card.actions?.length ? <ol className="tutorial-card-actions">{card.actions.map((action) => <li key={action}>{action}</li>)}</ol> : null}
            {card.example ? <div className="tutorial-example"><b>TRY THIS</b><code>{card.example}</code></div> : null}
            {card.tip ? <p className="tutorial-tip"><b>TIP</b> {card.tip}</p> : null}
          </article>
          <div className="tutorial-actions">
            <span className="tutorial-swipe-hint" aria-hidden="true">Swipe to move · ← →</span>
            <div>
              {step > 0 && <button type="button" className="button-secondary tutorial-previous" onClick={() => move(-1)}>Previous</button>}
              <button type="button" className="button-primary" onClick={() => step === tutorial.cards.length - 1 ? close() : move(1)}>
                {step === tutorial.cards.length - 1 ? "Finish" : "Next"} {step < tutorial.cards.length - 1 && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
