"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminOraskMessage, ApiResult } from "@/components/admin/types";
import { uiText } from "@/content/uiText";
import { cn } from "@/lib/classNames";

export function OraskManager() {
  const [items, setItems] = useState<AdminOraskMessage[]>([]);
  const [activeItem, setActiveItem] = useState<AdminOraskMessage | null>(null);
  const [search, setSearch] = useState("");

  const loadItems = useCallback(async (query = "") => {
    const response = await fetch(
      `/api/admin/orask?search=${encodeURIComponent(query)}`,
      { cache: "no-store" }
    );
    const result = (await response.json()) as ApiResult<AdminOraskMessage[]>;
    const nextItems = result.data ?? [];
    setItems(nextItems);
    setActiveItem((current) => {
      if (!current) {
        return nextItems[0] ?? null;
      }

      return nextItems.find((item) => item.id === current.id) ?? nextItems[0] ?? null;
    });
  }, []);

  useEffect(() => {
    void loadItems("");
  }, [loadItems]);

  async function toggleRead(item: AdminOraskMessage) {
    const response = await fetch(`/api/admin/orask/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !item.read })
    });
    const result = (await response.json()) as ApiResult<AdminOraskMessage>;

    if (result.data) {
      setActiveItem(result.data);
    }
    await loadItems(search);
  }

  async function deleteItem(item: AdminOraskMessage) {
    if (!window.confirm(`${uiText.admin.deleteArticleConfirmPrefix}「${item.subject}」？`)) {
      return;
    }

    await fetch(`/api/admin/orask/${item.id}`, { method: "DELETE" });
    await loadItems(search);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5">
          <h2 className="font-serif text-2xl font-semibold">
            {uiText.admin.oraskTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {uiText.admin.oraskDescription}
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void loadItems(search);
          }}
          className="mb-5 flex gap-2"
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm outline-none focus:border-white/40"
            placeholder={uiText.admin.searchOraskPlaceholder}
          />
          <button className="rounded-full border border-white/10 px-4 py-2 text-sm">
            {uiText.admin.search}
          </button>
        </form>

        <div className="grid gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveItem(item)}
              className={cn(
                "rounded-3xl border p-4 text-left transition",
                activeItem?.id === item.id
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 bg-black/20 hover:border-white/20"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-white">{item.subject}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {item.name} / {item.email}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-1 text-xs",
                    item.read
                      ? "border-white/10 text-zinc-500"
                      : "border-emerald-400/30 text-emerald-300"
                  )}
                >
                  {item.read ? uiText.admin.read : uiText.admin.unread}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                {item.message}
              </p>
            </button>
          ))}
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              {uiText.admin.noOrask}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        {activeItem ? (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-500">
                  {new Date(activeItem.createdAt).toLocaleString("zh-CN", {
                    hour12: false
                  })}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold">
                  {activeItem.subject}
                </h2>
              </div>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  activeItem.read
                    ? "border-white/10 text-zinc-500"
                    : "border-emerald-400/30 text-emerald-300"
                )}
              >
                {activeItem.read ? uiText.admin.read : uiText.admin.unread}
              </span>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm">
              <p>
                <span className="text-zinc-500">{uiText.admin.name}</span>
                {activeItem.name}
              </p>
              <p>
                <span className="text-zinc-500">{uiText.admin.email}</span>
                <a
                  href={`mailto:${activeItem.email}`}
                  className="text-white underline underline-offset-4"
                >
                  {activeItem.email}
                </a>
              </p>
              <p>
                <span className="text-zinc-500">{uiText.admin.source}</span>
                {activeItem.source ?? uiText.admin.unknown}
              </p>
            </div>

            <div className="min-h-64 whitespace-pre-wrap rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-zinc-200">
              {activeItem.message}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleRead(activeItem)}
                className="rounded-full bg-white px-4 py-2 text-sm text-zinc-950"
              >
                {uiText.admin.markAs}
                {activeItem.read ? uiText.admin.unread : uiText.admin.read}
              </button>
              <button
                type="button"
                onClick={() => deleteItem(activeItem)}
                className="rounded-full border border-red-400/30 px-4 py-2 text-sm text-red-200"
              >
                {uiText.admin.delete}
              </button>
            </div>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-zinc-500">
            {uiText.admin.chooseFeedback}
          </p>
        )}
      </section>
    </div>
  );
}
