import { useRef, useState, type FormEvent } from "react";
import { submitContactMessage } from "@/lib/api";

type SubmitState = "idle" | "submitting" | "success" | "error";
type FieldName = "name" | "email" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

export default function ContactForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const submitting = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const errors: FieldErrors = {};

    if (name.length < 2 || name.length > 80) errors.name = "Name must be 2–80 characters.";
    if (!emailInput.validity.valid) errors.email = "Enter a valid email address.";
    if (message.length < 10 || message.length > 2000) errors.message = "Message must be 10–2000 characters.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setState("idle");
      return;
    }

    submitting.current = true;
    setState("submitting");
    try {
      await submitContactMessage({
        name,
        email,
        message,
        website: String(data.get("website") ?? ""),
      });
      form.reset();
      setFieldErrors({});
      setState("success");
    } catch {
      setState("error");
    } finally {
      submitting.current = false;
    }
  }

  function clearError(field: FieldName) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (state === "error") setState("idle");
  }

  if (state === "success") {
    return <p className="max-w-lg rounded-md border border-[var(--color-status-live)] bg-[var(--color-surface)] p-6 font-mono text-sm text-[var(--color-status-live)]" aria-live="polite">Thanks, I&apos;ll reply soon.</p>;
  }

  const inputClass = "w-full rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 outline-none focus:border-[var(--color-accent)]";

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-lg space-y-5" aria-busy={state === "submitting"}>
      <div>
        <label htmlFor="contact-name" className="mb-1 block font-mono text-xs text-[var(--color-text-muted)]">Name</label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={80} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "contact-name-error" : undefined} onChange={() => clearError("name")} className={inputClass} />
        {fieldErrors.name && <p id="contact-name-error" className="mt-1 font-mono text-xs text-red-500">{fieldErrors.name}</p>}
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1 block font-mono text-xs text-[var(--color-text-muted)]">Email</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={320} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "contact-email-error" : undefined} onChange={() => clearError("email")} className={inputClass} />
        {fieldErrors.email && <p id="contact-email-error" className="mt-1 font-mono text-xs text-red-500">{fieldErrors.email}</p>}
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1 block font-mono text-xs text-[var(--color-text-muted)]">Message</label>
        <textarea id="contact-message" name="message" required minLength={10} maxLength={2000} rows={6} aria-invalid={Boolean(fieldErrors.message)} aria-describedby={fieldErrors.message ? "contact-message-error" : undefined} onChange={() => clearError("message")} className={`${inputClass} resize-y`} />
        {fieldErrors.message && <p id="contact-message-error" className="mt-1 font-mono text-xs text-red-500">{fieldErrors.message}</p>}
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={state === "submitting"} className="rounded-sm bg-[var(--color-accent)] px-4 py-2 font-mono text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-50">
        {state === "submitting" ? "Sending…" : "Send message"}
      </button>
      {state === "error" && <p className="font-mono text-xs text-red-500" aria-live="polite">Your message could not be sent. Please try again.</p>}
    </form>
  );
}
