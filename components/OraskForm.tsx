"use client";

import { FormEvent, useMemo, useState } from "react";
import { uiText } from "@/content/uiText";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const initialForm: FormState = {
  name: "",
  email: "",
  subject: "",
  message: ""
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OraskForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: ""
  });

  const isSubmitting = submitState.status === "loading";

  const validationError = useMemo(() => {
    if (!form.name.trim()) return uiText.orask.validationName;
    if (!emailPattern.test(form.email.trim())) return uiText.orask.validationEmail;
    if (!form.subject.trim()) return uiText.orask.validationSubject;
    if (form.message.trim().length < 10) {
      return uiText.orask.validationMessage;
    }

    return "";
  }, [form]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (validationError) {
      setSubmitState({ status: "error", message: validationError });
      return;
    }

    setSubmitState({
      status: "loading",
      message: uiText.orask.sending
    });

    try {
      const response = await fetch("/api/orask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          sourcePage: window.location.href
        })
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || uiText.orask.failure);
      }

      setForm(initialForm);
      setSubmitState({
        status: "success",
        message: uiText.orask.success
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : uiText.orask.unavailable
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-archive-muted">{uiText.orask.nameLabel}</span>
          <input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            className="rounded-2xl border border-archive-line bg-archive-paper2 px-4 py-3 text-archive-ink outline-none transition placeholder:text-archive-muted/60 focus:border-archive-ink"
            placeholder={uiText.orask.namePlaceholder}
            autoComplete="name"
            disabled={isSubmitting}
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-archive-muted">{uiText.orask.emailLabel}</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            className="rounded-2xl border border-archive-line bg-archive-paper2 px-4 py-3 text-archive-ink outline-none transition placeholder:text-archive-muted/60 focus:border-archive-ink"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            required
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm text-archive-muted">{uiText.orask.subjectLabel}</span>
        <input
          value={form.subject}
          onChange={(event) =>
            setForm((current) => ({ ...current, subject: event.target.value }))
          }
          className="rounded-2xl border border-archive-line bg-archive-paper2 px-4 py-3 text-archive-ink outline-none transition placeholder:text-archive-muted/60 focus:border-archive-ink"
          placeholder={uiText.orask.subjectPlaceholder}
          disabled={isSubmitting}
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm text-archive-muted">{uiText.orask.messageLabel}</span>
        <textarea
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          className="min-h-44 resize-y rounded-2xl border border-archive-line bg-archive-paper2 px-4 py-3 text-archive-ink outline-none transition placeholder:text-archive-muted/60 focus:border-archive-ink"
          placeholder={uiText.orask.messagePlaceholder}
          disabled={isSubmitting}
          required
        />
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full border border-archive-ink bg-archive-ink px-6 py-3 text-sm text-archive-paper2 transition hover:bg-transparent hover:text-archive-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? uiText.orask.submitting : uiText.orask.submit}
        </button>

        {submitState.message ? (
          <p
            className={
              submitState.status === "success"
                ? "text-sm text-archive-moss"
                : submitState.status === "error"
                  ? "text-sm text-archive-clay"
                  : "text-sm text-archive-muted"
            }
            role="status"
          >
            {submitState.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
