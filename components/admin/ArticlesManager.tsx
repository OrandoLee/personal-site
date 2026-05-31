"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { AdminArticle, ApiResult } from "@/components/admin/types";
import { uiText } from "@/content/uiText";
import { cn } from "@/lib/classNames";

export function ArticlesManager() {
  const [items, setItems] = useState<AdminArticle[]>([]);
  const [search, setSearch] = useState("");

  const loadItems = useCallback(async (query = "") => {
    const response = await fetch(
      `/api/admin/articles?search=${encodeURIComponent(query)}`,
      { cache: "no-store" }
    );
    const result = (await response.json()) as ApiResult<AdminArticle[]>;
    setItems(result.data ?? []);
  }, []);

  useEffect(() => {
    void loadItems("");
  }, [loadItems]);

  async function deleteItem(item: AdminArticle) {
    if (!window.confirm(`${uiText.admin.deleteArticleConfirmPrefix}「${item.title}」？`)) {
      return;
    }

    await fetch(`/api/admin/articles/${item.id}`, { method: "DELETE" });
    await loadItems(search);
  }

  async function togglePublished(item: AdminArticle) {
    await fetch(`/api/admin/articles/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published })
    });
    await loadItems(search);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">
            {uiText.admin.articlesTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {uiText.admin.articlesDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/articles/new"
            className="rounded-full bg-white px-4 py-2 text-sm text-zinc-950"
          >
            {uiText.admin.newArticle}
          </Link>
          <Link
            href="/dashboard/articles/import"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/30"
          >
            {uiText.admin.importMarkdown}
          </Link>
        </div>
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
          placeholder={uiText.admin.searchArticlesPlaceholder}
        />
        <button className="rounded-full border border-white/10 px-4 py-2 text-sm">
          {uiText.admin.search}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 font-normal">{uiText.admin.title}</th>
              <th className="py-3 pr-4 font-normal">{uiText.admin.category}</th>
              <th className="py-3 pr-4 font-normal">{uiText.admin.date}</th>
              <th className="py-3 pr-4 font-normal">{uiText.admin.status}</th>
              <th className="py-3 pr-4 font-normal">{uiText.admin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-white/5">
                <td className="py-4 pr-4">
                  <p className="text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">/{item.slug}</p>
                </td>
                <td className="py-4 pr-4 text-zinc-400">{item.category}</td>
                <td className="py-4 pr-4 text-zinc-400">{item.date}</td>
                <td className="py-4 pr-4">
                  <button
                    type="button"
                    onClick={() => togglePublished(item)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      item.published
                        ? "border-emerald-400/30 text-emerald-300"
                        : "border-white/10 text-zinc-500"
                    )}
                  >
                    {item.published ? uiText.admin.published : uiText.admin.draft}
                  </button>
                </td>
                <td className="py-4 pr-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/articles/${item.id}`}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300"
                    >
                      {uiText.admin.edit}
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteItem(item)}
                      className="rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-200"
                    >
                      {uiText.admin.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            {uiText.admin.noArticles}
          </p>
        ) : null}
      </div>
    </section>
  );
}
