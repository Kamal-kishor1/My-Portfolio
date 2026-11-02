"use client";

import { useState, type FormEvent } from "react";
import { submitContactMessage } from "@/lib/api";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [state, setState] = useState<SubmitState>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setState("submitting");
    try {
      await submitContactMessage({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      setState("success");
      form.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="p-6 rounded-md border border-[var(--color-status-live)] bg-[var(--color-surface)] font-mono text-sm">
        <p className="text-[var(--color-status-live)]">message sent.</p>
        <p className="text-[var(--color-text-muted)] mt-1">
          thanks for reaching out — I&apos;ll reply by email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label htmlFor="name" className="block font-mono text-xs text-[var(--color-text-muted)] mb-1">
          name
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full px-3 py-2 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none"
        />
      </div>
      <div>
        <label htmlFor="email" className="block font-mono text-xs text-[var(--color-text-muted)] mb-1">
          email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none"
        />
      </div>
      <div>
        <label htmlFor="message" className="block font-mono text-xs text-[var(--color-text-muted)] mb-1">
          message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full px-3 py-2 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-bg)] rounded-sm font-mono text-sm font-medium hover:bg-[var(--color-accent)]/90 transition-colors disabled:opacity-50"
      >
        {state === "submitting" ? "sending\u2026" : "send message"}
      </button>

      {state === "error" && (
        <p className="font-mono text-xs text-red-400">
          something went wrong — try again in a moment.
        </p>
      )}
    </form>
  );
}
