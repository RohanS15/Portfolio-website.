import { useEffect, useRef, useState } from "react";

type TutorialProps = { id: string; title: string; steps: string[] };

export default function Tutorial({ id, title, steps }: TutorialProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const seenKey = `portfolio-tutorial-${id}`;

  const show = () => {
    setStep(0);
    setOpen(true);
  };

  useEffect(() => {
    if (!open || !dialog.current) return;
    dialog.current.showModal();
    closeButton.current?.focus();
    return () => {
      if (dialog.current?.open) dialog.current.close();
    };
  }, [open]);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(seenKey) === "done";
    } catch {
      seen = true;
    }
    const target = button.current;
    if (!target || seen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStep(0);
          setOpen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [seenKey]);

  const close = () => {
    try {
      localStorage.setItem(seenKey, "done");
    } catch {
      /* tutorials remain available from the guide button */
    }
    dialog.current?.close();
    setOpen(false);
    button.current?.focus();
  };

  return (
    <>
      <button
        ref={button}
        className="tutorial-link"
        type="button"
        onClick={show}
      >
        How to use <span aria-hidden="true">↗</span>
      </button>
      {open && (
        <dialog
          ref={dialog}
          className="tutorial-dialog"
          aria-labelledby={`${id}-tutorial-title`}
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <div className="tutorial-top">
            <span className="tutorial-kicker">
              QUICK GUIDE · {String(step + 1).padStart(2, "0")} /{" "}
              {String(steps.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              className="tutorial-close"
              ref={closeButton}
              onClick={close}
              aria-label="Close guide"
            >
              ×
            </button>
          </div>
          <h3 id={`${id}-tutorial-title`}>{title}</h3>
          <p className="tutorial-step" aria-live="polite">
            {steps[step]}
          </p>
          <div className="tutorial-progress" aria-hidden="true">
            <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
          <div className="tutorial-actions">
            <button type="button" className="tutorial-skip" onClick={close}>
              Skip guide
            </button>
            <div>
              {step > 0 && (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                className="button-primary"
                onClick={() =>
                  step === steps.length - 1 ? close() : setStep(step + 1)
                }
              >
                {step === steps.length - 1 ? "Start exploring" : "Next"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
