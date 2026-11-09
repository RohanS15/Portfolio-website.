import emailjs from "@emailjs/browser";
import type { ContactValues } from "./contactTypes";

export async function sendContactMessage(values: ContactValues): Promise<void> {
  // Keep the honeypot useful for simple bots without sending their submission.
  if (values.website.trim()) return;

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("The contact form is not configured yet. Please try again later.");
  }

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      },
      { publicKey },
    );
  } catch (error) {
    // Keep provider details out of the public UI. Log only diagnostics in local
    // development, and never log the submitted contact fields or identifiers.
    if (import.meta.env.DEV) {
      const details = error && typeof error === "object"
        ? error as { status?: unknown; text?: unknown }
        : undefined;
      console.error("[EmailJS] Contact submission failed", {
        status: details?.status,
        message: typeof details?.text === "string"
          ? details.text
          : error instanceof Error
            ? error.message
            : "Unknown EmailJS error",
      });
    }
    throw new Error("Your message could not be sent right now. Please try again shortly.");
  }
}
