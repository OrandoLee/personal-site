"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { ApiResult } from "@/components/admin/types";
import { uiText } from "@/content/uiText";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function PasswordManager() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: PasswordForm) {
    setMessage("");
    setSuccess(false);

    const response = await fetch("/api/admin/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const result = (await response.json()) as ApiResult<{ username: string }>;

    if (!response.ok || !result.ok) {
      setMessage(result.message ?? uiText.admin.passwordFailed);
      return;
    }

    reset();
    setSuccess(true);
    setMessage(uiText.admin.passwordSuccess);
  }

  return (
    <section className="max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-white">
          {uiText.admin.passwordTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {uiText.admin.passwordHelp}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
        <input
          {...register("currentPassword", { required: true })}
          type="password"
          autoComplete="current-password"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
          placeholder={uiText.admin.currentPassword}
        />
        <input
          {...register("newPassword", { required: true, minLength: 8 })}
          type="password"
          autoComplete="new-password"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
          placeholder={uiText.admin.newPasswordPlaceholder}
        />
        <input
          {...register("confirmPassword", { required: true, minLength: 8 })}
          type="password"
          autoComplete="new-password"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
          placeholder={uiText.admin.confirmPassword}
        />

        <button
          disabled={isSubmitting}
          className="rounded-full bg-white px-5 py-3 text-sm text-zinc-950 disabled:opacity-60"
        >
          {isSubmitting ? uiText.admin.saving : uiText.admin.saveNewPassword}
        </button>

        {message ? (
          <p className={success ? "text-sm text-emerald-300" : "text-sm text-red-200"}>
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
