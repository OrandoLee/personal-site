"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { uiText } from "@/content/uiText";

type LoginFormValues = {
  username: string;
  password: string;
};

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo = "/dashboard" }: LoginFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "admin",
      password: ""
    }
  });

  async function onSubmit(values: LoginFormValues) {
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });
    const result = (await response.json()) as {
      ok?: boolean;
      message?: string;
    };

    if (!response.ok || !result.ok) {
      setMessage(result.message ?? uiText.admin.loginFailed);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <label className="grid gap-2">
        <span className="text-sm text-zinc-400">{uiText.admin.username}</span>
        <input
          {...register("username", { required: true })}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/40"
          placeholder="admin"
          autoComplete="username"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm text-zinc-400">{uiText.admin.password}</span>
        <input
          {...register("password", { required: true })}
          type="password"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/40"
          placeholder={uiText.admin.passwordPlaceholder}
          autoComplete="current-password"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? uiText.admin.loginSubmitting : uiText.admin.loginSubmit}
      </button>

      {message ? (
        <p className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {message}
        </p>
      ) : null}
    </form>
  );
}
