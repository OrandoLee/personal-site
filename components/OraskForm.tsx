"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { uiText } from "@/content/uiText";
import { cn } from "@/lib/classNames";

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
  const [visible, setVisible] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const [paperVersion, setPaperVersion] = useState(0);

  const isSubmitting = submitState.status === "loading";
  const isLocked = isSubmitting || isTearing;

  useEffect(() => {
    let timeout: number | undefined;

    function showPaper() {
      timeout = window.setTimeout(() => setVisible(true), 1480);
    }

    if (!document.querySelector(".splash-screen")) {
      showPaper();
      return () => window.clearTimeout(timeout);
    }

    const observer = new MutationObserver(() => {
      if (!document.querySelector(".splash-screen")) {
        observer.disconnect();
        showPaper();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, []);

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

      setIsTearing(true);
      setSubmitState({
        status: "success",
        message: uiText.orask.success
      });
      window.setTimeout(() => {
        setForm(initialForm);
        setPaperVersion((current) => current + 1);
        setIsTearing(false);
      }, 920);
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : uiText.orask.unavailable
      });
    }
  }

  return (
    <div
      className={cn(
        "orask-paper-stack",
        visible && "orask-paper-stack--visible"
      )}
    >
      <form
        key={paperVersion}
        onSubmit={handleSubmit}
        className={cn("orask-paper", isTearing && "orask-paper--tearing")}
      >
        <div className="orask-paper__holes" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        <header className="orask-paper__header">
          <h2 className="orask-paper__title orask-handwrite">
            {uiText.orask.formTitle}
          </h2>
          <p className="orask-paper__intro orask-handwrite">
            {uiText.orask.formDescription}
          </p>
        </header>

        <div className="orask-paper__fields">
          <label className="orask-paper-field orask-handwrite">
            <span>{uiText.orask.nameLabel}：</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder={uiText.orask.namePlaceholder}
              autoComplete="name"
              disabled={isLocked}
              required
            />
          </label>

          <label className="orask-paper-field orask-handwrite">
            <span>{uiText.orask.emailLabel}：</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLocked}
              required
            />
          </label>

          <label className="orask-paper-field orask-paper-field--wide orask-handwrite">
            <span>{uiText.orask.subjectLabel}：</span>
            <input
              value={form.subject}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  subject: event.target.value
                }))
              }
              placeholder={uiText.orask.subjectPlaceholder}
              disabled={isLocked}
              required
            />
          </label>

          <label className="orask-paper-field orask-paper-field--message orask-handwrite">
            <span>{uiText.orask.messageLabel}：</span>
            <textarea
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  message: event.target.value
                }))
              }
              placeholder={uiText.orask.messagePlaceholder}
              disabled={isLocked}
              required
            />
          </label>
        </div>

        <div className="orask-paper__footer">
          <button
            type="submit"
            disabled={isLocked}
            className="orask-paper__submit"
          >
            {isSubmitting ? uiText.orask.submitting : uiText.orask.submit}
          </button>

          {submitState.message ? (
            <p
              className={cn(
                "orask-paper__status",
                submitState.status === "success" &&
                  "orask-paper__status--success",
                submitState.status === "error" && "orask-paper__status--error"
              )}
              role="status"
            >
              {submitState.message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
