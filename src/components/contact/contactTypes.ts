export type ContactValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

export type ContactField = keyof Omit<ContactValues, "website">;
export type FormState = "idle" | "submitting" | "success" | "error";

export const initialContactValues: ContactValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};
