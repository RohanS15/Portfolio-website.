import { FormEvent, useRef, useState } from "react";
import { sendContactMessage } from "./emailjsClient";
import { initialContactValues, type ContactField, type ContactValues, type FormState } from "./contactTypes";
import { validateContact } from "./validateContact";

type ContactMessageSender = (values: ContactValues) => Promise<void>;

export default function ContactForm({
  sendMessage = sendContactMessage,
}: {
  sendMessage?: ContactMessageSender;
} = {}) {
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);
  const [state, setState] = useState<FormState>("idle");
  const [values, setValues] = useState(initialContactValues);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [notice, setNotice] = useState("");

  const updateField = (field: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== "website" && errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (state === "error") {
      setState("idle");
      setNotice("");
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    const firstInvalid = (Object.keys(nextErrors) as ContactField[])[0];
    if (firstInvalid) {
      setState("error");
      setNotice("Check the highlighted fields and try again.");
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    submittingRef.current = true;
    setState("submitting");
    setNotice("Sending your message…");
    try {
      await sendMessage(values);
      setState("success");
      setNotice("Your message was sent. Thanks for reaching out.");
      setValues(initialContactValues);
      setErrors({});
      formRef.current?.reset();
    } catch (error) {
      setState("error");
      setNotice(error instanceof Error ? error.message : "Something went wrong. Please try again shortly.");
    } finally {
      submittingRef.current = false;
    }
  };

  const fieldProps = (field: ContactField) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  return (
    <form ref={formRef} className="contact-form" onSubmit={submit} noValidate aria-busy={state === "submitting"}>
      <div className="contact-fields">
        <label htmlFor="contact-name">
          <span className="contact-label-text">Name <span aria-hidden="true">*</span></span>
          <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={100} placeholder="Your name" value={values.name} disabled={state === "submitting"} onChange={(event) => updateField("name", event.target.value)} {...fieldProps("name")} />
          {errors.name && <span className="contact-field-error" id="name-error">{errors.name}</span>}
        </label>
        <label htmlFor="contact-email">
          <span className="contact-label-text">Email <span aria-hidden="true">*</span></span>
          <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" value={values.email} disabled={state === "submitting"} onChange={(event) => updateField("email", event.target.value)} {...fieldProps("email")} />
          {errors.email && <span className="contact-field-error" id="email-error">{errors.email}</span>}
        </label>
        <label htmlFor="contact-subject" className="contact-subject-field">
          <span className="contact-label-text">Subject <span aria-hidden="true">*</span></span>
          <input id="contact-subject" name="subject" type="text" required maxLength={160} placeholder="What can I help with?" value={values.subject} disabled={state === "submitting"} onChange={(event) => updateField("subject", event.target.value)} {...fieldProps("subject")} />
          {errors.subject && <span className="contact-field-error" id="subject-error">{errors.subject}</span>}
        </label>
        <label htmlFor="contact-message" className="contact-message-field">
          <span className="contact-label-text">Message <span aria-hidden="true">*</span></span>
          <textarea id="contact-message" name="message" rows={5} required minLength={12} maxLength={4000} placeholder="Share a little context…" value={values.message} disabled={state === "submitting"} onChange={(event) => updateField("message", event.target.value)} {...fieldProps("message")} />
          {errors.message && <span className="contact-field-error" id="message-error">{errors.message}</span>}
        </label>
      </div>
      <label className="contact-honeypot" aria-hidden="true" tabIndex={-1}>
        Leave this field empty
        <input name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => updateField("website", event.target.value)} />
      </label>
      <div className="contact-submit-row">
        <button className="button-primary" type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? "Sending…" : state === "success" ? "Send another message" : "Send message"}
          <span aria-hidden="true">{state === "submitting" ? "◌" : "↗"}</span>
        </button>
        <small>Required fields are marked <span aria-hidden="true">*</span>. Your details are used only to respond to this inquiry.</small>
      </div>
      {notice && <p className={`form-notice form-notice-${state}`} role={state === "error" ? "alert" : "status"} aria-live={state === "error" ? "assertive" : "polite"}>{notice}</p>}
    </form>
  );
}
