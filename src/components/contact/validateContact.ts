import type { ContactField, ContactValues } from "./contactTypes";

export function validateContact(values: ContactValues): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();

  if (name.length < 2) errors.name = "Enter your name (at least 2 characters).";
  else if (name.length > 100) errors.name = "Keep your name under 100 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email address.";
  else if (email.length > 254) errors.email = "Keep your email under 254 characters.";
  if (subject.length < 3) errors.subject = "Add a short subject (at least 3 characters).";
  else if (subject.length > 160) errors.subject = "Keep the subject under 160 characters.";
  if (message.length < 12) errors.message = "Add a little more context (at least 12 characters).";
  else if (message.length > 4000) errors.message = "Keep your message under 4,000 characters.";
  return errors;
}
