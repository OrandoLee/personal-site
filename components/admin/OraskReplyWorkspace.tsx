"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AdminOraskMessage,
  ApiResult
} from "@/components/admin/types";
import { cn } from "@/lib/classNames";

type ReplyFilter = "pending" | "all" | "replied";

type OraskReplyWorkspaceProps = {
  initialItems: AdminOraskMessage[];
  initialSenderEmail: string | null;
  smtpConfigured: boolean;
  username: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
}

function sentReplyCount(item: AdminOraskMessage) {
  return item.replies.filter((reply) => reply.status === "sent").length;
}

export function OraskReplyWorkspace({
  initialItems,
  initialSenderEmail,
  smtpConfigured,
  username
}: OraskReplyWorkspaceProps) {
  const router = useRouter();
  const initialActiveItem =
    initialItems.find((item) => !item.repliedAt) ?? initialItems[0];
  const [items, setItems] = useState(initialItems);
  const [senderEmail, setSenderEmail] = useState(initialSenderEmail);
  const [setupEmail, setSetupEmail] = useState(initialSenderEmail ?? "");
  const [activeId, setActiveId] = useState(initialActiveItem?.id ?? "");
  const [filter, setFilter] = useState<ReplyFilter>("pending");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState(
    initialActiveItem ? `Re: ${initialActiveItem.subject}` : ""
  );
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      if (filter === "pending" && item.repliedAt) {
        return false;
      }

      if (filter === "replied" && !item.repliedAt) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [item.name, item.email, item.subject, item.message].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [filter, items, search]);

  const activeItem =
    filteredItems.find((item) => item.id === activeId) ??
    filteredItems[0] ??
    null;

  useEffect(() => {
    if (activeItem && activeItem.id !== activeId) {
      setActiveId(activeItem.id);
      setSubject(`Re: ${activeItem.subject}`);
      setBody("");
    }
  }, [activeId, activeItem]);

  async function saveSenderEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    setIsSavingEmail(true);

    try {
      const response = await fetch("/api/admin/orask-reply-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderEmail: setupEmail })
      });
      const result = (await response.json()) as ApiResult<{
        senderEmail: string;
        smtpConfigured: boolean;
      }>;

      if (!response.ok || !result.data) {
        setMessage(result.message ?? "发件邮箱保存失败。");
        return;
      }

      setSenderEmail(result.data.senderEmail);
      setSetupEmail(result.data.senderEmail);
      setSuccess(true);
      setMessage("发件邮箱已保存。");
    } catch {
      setMessage("网络错误，发件邮箱保存失败。");
    } finally {
      setIsSavingEmail(false);
    }
  }

  async function refreshItems() {
    setIsRefreshing(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/orask", { cache: "no-store" });
      const result = (await response.json()) as ApiResult<AdminOraskMessage[]>;

      if (!response.ok || !result.data) {
        setMessage(result.message ?? "无法刷新留言。");
        return;
      }

      setItems(result.data);
      if (!result.data.some((item) => item.id === activeId)) {
        setActiveId(result.data[0]?.id ?? "");
      }
    } catch {
      setMessage("网络错误，无法刷新留言。");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function selectItem(item: AdminOraskMessage) {
    setActiveId(item.id);
    setSubject(`Re: ${item.subject}`);
    setBody("");
    setMessage("");
    setSuccess(false);

    if (!item.read) {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, read: true } : entry
        )
      );
      await fetch(`/api/admin/orask/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true })
      });
    }
  }

  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeItem) {
      return;
    }

    setMessage("");
    setSuccess(false);
    setIsSending(true);

    try {
      const response = await fetch(
        `/api/admin/orask/${activeItem.id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, body })
        }
      );
      const result = (await response.json()) as ApiResult<AdminOraskMessage>;

      if (!response.ok || !result.data) {
        const errorMessage = result.message ?? "回复发送失败。";
        await refreshItems();
        setMessage(errorMessage);
        return;
      }

      setItems((current) =>
        current.map((item) => (item.id === result.data?.id ? result.data : item))
      );
      setBody("");
      setSuccess(true);
      setMessage(`回复已发送至 ${result.data.email}。`);
    } catch {
      setMessage("网络错误，回复发送失败。");
    } finally {
      setIsSending(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (!senderEmail) {
    return (
      <main className="admin-selection min-h-screen bg-[#0f1115] px-4 py-10 text-zinc-100 sm:px-6">
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center">
          <div className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <p className="text-xs uppercase text-zinc-500">DELEE / ORASK</p>
            <h1 className="mt-3 text-3xl font-semibold">设置回复邮箱</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              首次进入需要确认发件地址。邮箱授权码仍由服务器环境变量管理，不会保存在数据库。
            </p>

            <form onSubmit={saveSenderEmail} className="mt-7 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-zinc-300">发件邮箱</span>
                <input
                  type="email"
                  required
                  value={setupEmail}
                  onChange={(event) => setSetupEmail(event.target.value)}
                  className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </label>

              <div
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm",
                  smtpConfigured
                    ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-200"
                    : "border-amber-400/20 bg-amber-400/5 text-amber-100"
                )}
              >
                {smtpConfigured
                  ? "SMTP 已配置。建议填写与 SMTP_USER 相同的邮箱。"
                  : "SMTP 尚未完整配置，保存后仍需在 Vercel 设置 SMTP 环境变量。"}
              </div>

              <button
                disabled={isSavingEmail}
                className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-zinc-950 disabled:opacity-60"
              >
                {isSavingEmail ? "保存中..." : "保存并进入回复工作台"}
              </button>

              {message ? (
                <p className={success ? "text-sm text-emerald-300" : "text-sm text-red-200"}>
                  {message}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-selection min-h-screen bg-[#0f1115] text-zinc-100">
      <header className="border-b border-white/10 bg-[#11141a] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-zinc-500">DELEE / ORASK</p>
            <h1 className="mt-1 text-xl font-semibold">访客回复工作台</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="hidden text-zinc-500 md:inline">
              {username} · {senderEmail}
            </span>
            <Link
              href="/dashboard/settings"
              className="rounded-lg border border-white/10 px-3 py-2 text-zinc-300 hover:border-white/30"
            >
              邮箱设置
            </Link>
            <Link
              href="/dashboard/orask"
              className="rounded-lg border border-white/10 px-3 py-2 text-zinc-300 hover:border-white/30"
            >
              留言管理
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-white px-3 py-2 text-zinc-950"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-77px)] max-w-[1500px] lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#11141a] p-4 lg:border-b-0 lg:border-r">
          <div className="flex gap-1 rounded-lg bg-black/20 p-1">
            {(
              [
                ["pending", "待回复"],
                ["all", "全部"],
                ["replied", "已回复"]
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "min-w-0 flex-1 rounded-md px-3 py-2 text-sm transition",
                  filter === value
                    ? "bg-white text-zinc-950"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
              placeholder="搜索姓名、邮箱或内容"
            />
            <button
              type="button"
              onClick={refreshItems}
              disabled={isRefreshing}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 disabled:opacity-60"
            >
              {isRefreshing ? "刷新中" : "刷新"}
            </button>
          </div>

          <div className="mt-4 grid max-h-[calc(100vh-190px)] gap-2 overflow-y-auto pr-1">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectItem(item)}
                className={cn(
                  "rounded-lg border p-4 text-left transition",
                  activeItem?.id === item.id
                    ? "border-white/30 bg-white/10"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-1 font-medium text-white">
                    {item.subject}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      item.repliedAt ? "text-zinc-500" : "text-amber-300"
                    )}
                  >
                    {item.repliedAt ? "已回复" : "待回复"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {item.name} · {formatDate(item.createdAt)}
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                  {item.message}
                </p>
              </button>
            ))}

            {filteredItems.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">
                没有符合条件的留言。
              </p>
            ) : null}
          </div>
        </aside>

        <section className="p-4 sm:p-6 lg:p-8">
          {activeItem ? (
            <div className="mx-auto grid max-w-4xl gap-6">
              <section className="border-b border-white/10 pb-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">
                      {formatDate(activeItem.createdAt)}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">
                      {activeItem.subject}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      {activeItem.name} · {activeItem.email}
                    </p>
                  </div>
                  <span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400">
                    {sentReplyCount(activeItem)} 次成功回复
                  </span>
                </div>

                <div className="mt-6 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/20 p-5 text-sm leading-7 text-zinc-200">
                  {activeItem.message}
                </div>
              </section>

              <form onSubmit={sendReply} className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">回复邮件</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    发件人 {senderEmail}，收件人 {activeItem.email}
                  </p>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm text-zinc-300">主题</span>
                  <input
                    required
                    maxLength={200}
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="flex justify-between text-sm text-zinc-300">
                    <span>正文</span>
                    <span className="text-zinc-600">{body.length}/10000</span>
                  </span>
                  <textarea
                    required
                    maxLength={10000}
                    rows={10}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    className="resize-y rounded-lg border border-white/10 bg-black/20 px-4 py-3 leading-7 outline-none focus:border-white/40"
                    placeholder="直接写下要发给访客的内容"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    disabled={isSending}
                    className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-zinc-950 disabled:opacity-60"
                  >
                    {isSending ? "发送中..." : "发送回复"}
                  </button>
                  {message ? (
                    <p
                      className={
                        success ? "text-sm text-emerald-300" : "text-sm text-red-200"
                      }
                    >
                      {message}
                    </p>
                  ) : null}
                </div>
              </form>

              {activeItem.replies.length > 0 ? (
                <section className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-white">回复记录</h3>
                  <div className="mt-4 grid gap-3">
                    {activeItem.replies.map((reply) => (
                      <article
                        key={reply.id}
                        className="rounded-lg border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-zinc-200">{reply.subject}</p>
                          <span
                            className={cn(
                              "text-xs",
                              reply.status === "sent"
                                ? "text-emerald-300"
                                : reply.status === "failed"
                                  ? "text-red-300"
                                  : "text-amber-300"
                            )}
                          >
                            {reply.status === "sent"
                              ? "已发送"
                              : reply.status === "failed"
                                ? "发送失败"
                                : "发送中"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-600">
                          {formatDate(reply.sentAt ?? reply.createdAt)}
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                          {reply.body}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[60vh] items-center justify-center text-sm text-zinc-500">
              暂无可处理的 Orask 留言。
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
