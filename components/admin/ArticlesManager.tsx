"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type {
  AdminArticle,
  AdminArticleCollection,
  ApiResult
} from "@/components/admin/types";
import { uiText } from "@/content/uiText";
import { cn } from "@/lib/classNames";
import { slugify } from "@/lib/slug";

type CollectionForm = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  cover: string;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  articleIds: string[];
};

const emptyCollectionForm: CollectionForm = {
  title: "",
  slug: "",
  summary: "",
  cover: "",
  published: false,
  featured: false,
  sortOrder: 100,
  articleIds: []
};

export function ArticleCollectionsManager() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [collections, setCollections] = useState<AdminArticleCollection[]>([]);
  const [form, setForm] = useState<CollectionForm>(emptyCollectionForm);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    const [articleResponse, collectionResponse] = await Promise.all([
      fetch("/api/admin/articles", { cache: "no-store" }),
      fetch("/api/admin/article-collections", { cache: "no-store" })
    ]);
    const articleResult = (await articleResponse.json()) as ApiResult<
      AdminArticle[]
    >;
    const collectionResult = (await collectionResponse.json()) as ApiResult<
      AdminArticleCollection[]
    >;

    setArticles(articleResult.data ?? []);
    setCollections(collectionResult.data ?? []);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function editCollection(collection: AdminArticleCollection) {
    setForm({
      id: collection.id,
      title: collection.title,
      slug: collection.slug,
      summary: collection.summary,
      cover: collection.cover ?? "",
      published: collection.published,
      featured: collection.featured,
      sortOrder: collection.sortOrder,
      articleIds: collection.articleIds
    });
    setMessage("");
  }

  function setArticleChecked(articleId: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      articleIds: checked
        ? [...current.articleIds, articleId]
        : current.articleIds.filter((id) => id !== articleId)
    }));
  }

  async function saveCollection() {
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title) || `collection-${Date.now()}`,
      cover: form.cover || null
    };
    const response = await fetch(
      form.id
        ? `/api/admin/article-collections/${form.id}`
        : "/api/admin/article-collections",
      {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const result = (await response.json()) as ApiResult<AdminArticleCollection>;

    if (!response.ok || !result.ok) {
      setMessage(result.message ?? "保存合集失败。");
      return;
    }

    setMessage("合集已保存。");
    setForm(emptyCollectionForm);
    await loadData();
  }

  async function deleteCollection(collection: AdminArticleCollection) {
    if (!window.confirm(`删除合集「${collection.title}」？文档本身不会被删除。`)) {
      return;
    }

    await fetch(`/api/admin/article-collections/${collection.id}`, {
      method: "DELETE"
    });
    await loadData();
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">文档合集</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            新建合集后，可以勾选以前的文档；上传新文档时也能直接加入合集。
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(emptyCollectionForm);
            setMessage("");
          }}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/30"
        >
          新建合集
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid gap-3">
          {collections.map((collection) => (
            <article
              key={collection.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-white">{collection.title}</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    /articles/collections/{collection.slug}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs",
                    collection.published
                      ? "border-emerald-400/30 text-emerald-300"
                      : "border-white/10 text-zinc-500"
                  )}
                >
                  {collection.published ? uiText.admin.published : uiText.admin.draft}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                {collection.summary}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                {collection.articles.length} 篇文档
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => editCollection(collection)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300"
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => deleteCollection(collection)}
                  className="rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-200"
                >
                  删除
                </button>
              </div>
            </article>
          ))}
          {collections.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-500">
              还没有合集。
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: event.target.value,
                slug: current.slug ? current.slug : slugify(event.target.value)
              }))
            }
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/40"
            placeholder="合集标题"
          />
          <input
            value={form.slug}
            onChange={(event) =>
              setForm((current) => ({ ...current, slug: event.target.value }))
            }
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/40"
            placeholder="collection-slug"
          />
          <textarea
            value={form.summary}
            onChange={(event) =>
              setForm((current) => ({ ...current, summary: event.target.value }))
            }
            className="min-h-24 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/40"
            placeholder="合集简介"
          />
          <input
            value={form.cover}
            onChange={(event) =>
              setForm((current) => ({ ...current, cover: event.target.value }))
            }
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/40"
            placeholder="封面 URL（可选）"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    published: event.target.checked
                  }))
                }
              />
              发布
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    featured: event.target.checked
                  }))
                }
              />
              置顶
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sortOrder: Number(event.target.value)
                }))
              }
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm outline-none focus:border-white/40"
              placeholder="排序"
            />
          </div>
          <div>
            <p className="mb-3 text-sm text-zinc-400">选择合集内文档</p>
            <div className="max-h-72 overflow-auto rounded-2xl border border-white/10">
              {articles.map((article) => (
                <label
                  key={article.id}
                  className="flex items-start gap-3 border-b border-white/5 px-4 py-3 text-sm last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={form.articleIds.includes(article.id)}
                    onChange={(event) =>
                      setArticleChecked(article.id, event.target.checked)
                    }
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-zinc-200">{article.title}</span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      /{article.slug}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void saveCollection()}
              className="rounded-full bg-white px-5 py-2.5 text-sm text-zinc-950"
            >
              保存合集
            </button>
            {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

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

  async function toggleFeatured(item: AdminArticle) {
    await fetch(`/api/admin/articles/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !item.featured })
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
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 font-normal">{uiText.admin.title}</th>
              <th className="py-3 pr-4 font-normal">{uiText.admin.category}</th>
              <th className="py-3 pr-4 font-normal">{uiText.admin.date}</th>
              <th className="py-3 pr-4 font-normal">{uiText.admin.status}</th>
              <th className="py-3 pr-4 font-normal">置顶</th>
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
                  <button
                    type="button"
                    onClick={() => toggleFeatured(item)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      item.featured
                        ? "border-amber-300/50 text-amber-200"
                        : "border-white/10 text-zinc-500"
                    )}
                  >
                    ★ 置顶
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
