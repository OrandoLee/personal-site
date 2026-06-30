"use client";

import { useState } from "react";
import type { ApiResult } from "@/components/admin/types";
import { cn } from "@/lib/classNames";

type EmailSettingsManagerProps = {
  initialSenderEmail: string | null;
  smtpConfigured: boolean;
};

export function EmailSettingsManager({
  initialSenderEmail,
  smtpConfigured
}: EmailSettingsManagerProps) {
  const [senderEmail, setSenderEmail] = useState(initialSenderEmail ?? "");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/orask-reply-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderEmail })
      });
      const result = (await response.json()) as ApiResult<{
        senderEmail: string;
        smtpConfigured: boolean;
      }>;

      if (!response.ok || !result.data) {
        setMessage(result.message ?? "邮箱设置保存失败。");
        return;
      }

      setSenderEmail(result.data.senderEmail);
      setSuccess(true);
      setMessage("回复邮箱已更新。");
    } catch {
      setMessage("网络错误，邮箱设置保存失败。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="max-w-2xl rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <div>
        <h2 className="text-2xl font-semibold text-white">Orask 回复邮箱</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          这里保存邮件中显示的发件地址。SMTP 授权信息继续由服务器环境变量管理。
        </p>
      </div>

      <div
        className={cn(
          "mt-5 rounded-lg border px-4 py-3 text-sm",
          smtpConfigured
            ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-200"
            : "border-amber-400/20 bg-amber-400/5 text-amber-100"
        )}
      >
        {smtpConfigured
          ? "SMTP 配置完整。建议发件邮箱与 SMTP_USER 保持一致。"
          : "SMTP 配置不完整，邮件暂时无法发送。"}
      </div>

      <form onSubmit={save} className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm text-zinc-300">发件邮箱</span>
          <input
            type="email"
            required
            value={senderEmail}
            onChange={(event) => setSenderEmail(event.target.value)}
            className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder="name@example.com"
            autoComplete="email"
          />
        </label>

        <button
          disabled={isSaving}
          className="rounded-lg bg-white px-5 py-3 text-sm text-zinc-950 disabled:opacity-60"
        >
          {isSaving ? "保存中..." : "保存回复邮箱"}
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
