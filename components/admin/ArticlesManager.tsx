"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  articleIds: string[];
};

const emptyCollectionForm: CollectionForm = {
  title: "",
  slug: "",
  summary: "",
  cover: "",
  published: false,
  featured: false,
  articleIds: []
};

function articleMatches(article: AdminArticle, query: string) {
  if (!query) {
    return true;
  }

  return [article.title, article.slug, article.summary, article.category]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function ArticleCollectionsManager() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [collections, setCollections] = useState<AdminArticleCollection[]>([]);
  const [form, setForm] = useState<CollectionForm>(emptyCollectionForm);
  const [message, setMessage] = useState("");
  const [articleSearch, setArticleSearch] = useState("");

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

  const selectedArticles = useMemo(
    () =>
      form.articleIds
        .map((articleId) => articles.find((article) => article.id === articleId))
        .filter((article): article is AdminArticle => Boolean(article)),
    [articles, form.articleIds]
  );

  const availableArticles = useMemo(() => {
    const query = articleSearch.trim().toLowerCase();

    return articles.filter(
      (article) =>
        !form.articleIds.includes(article.id) && articleMatches(article, query)
    );
  }, [articleSearch, articles, form.articleIds]);

  function resetForm() {
    setForm(emptyCollectionForm);
    setMessage("");
    setArticleSearch("");
  }

  function editCollection(collection: AdminArticleCollection) {
    setForm({
      id: collection.id,
      title: collection.title,
      slug: collection.slug,
      summary: collection.summary,
      cover: collection.cover ?? "",
      published: collection.published,
      featured: collection.featured,
      articleIds: collection.articleIds
    });
    setMessage("");
    setArticleSearch("");
  }

  function addArticle(articleId: string) {
    setForm((current) =>
      current.articleIds.includes(articleId)
        ? current
        : { ...current, articleIds: [...current.articleIds, articleId] }
    );
  }

  function removeArticle(articleId: string) {
    setForm((current) => ({
      ...current,
      articleIds: current.articleIds.filter((id) => id !== articleId)
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

    resetForm();
    setMessage("合集已保存。");
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
            创建合集后，可以从已有文档里搜索添加；上传新文档时也能直接加入合集。
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
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
          <div className="grid gap-3 sm:grid-cols-2">
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
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-medium text-zinc-200">合集内文档</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  已加入 {selectedArticles.length} 篇文档
                </p>
              </div>
              <Link
                href="/dashboard/articles/import"
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/30"
              >
                上传新文档
              </Link>
            </div>

            <div className="grid gap-2">
              {selectedArticles.map((article) => (
                <article
                  key={article.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{article.title}</p>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      /{article.slug}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArticle(article.id)}
                    className="shrink-0 rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-200"
                  >
                    移出
                  </button>
                </article>
              ))}
              {selectedArticles.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-zinc-500">
                  还没有加入文档。请在下方搜索已有文档并点击“加入合集”。
                </p>
              ) : null}
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-medium text-zinc-200">添加已有文档</h3>
                <input
                  value={articleSearch}
                  onChange={(event) => setArticleSearch(event.target.value)}
                  className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm outline-none focus:border-white/40 sm:w-72"
                  placeholder="搜索标题、slug、摘要"
                />
              </div>

              <div className="mt-3 max-h-80 overflow-auto rounded-2xl border border-white/10">
                {availableArticles.map((article) => (
                  <article
                    key={article.id}
                    className="flex items-start justify-between gap-3 border-b border-white/5 px-4 py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-200">
                        {article.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        /{article.slug}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addArticle(article.id)}
                      className="shrink-0 rounded-full bg-white px-3 py-1 text-xs text-zinc-950"
                    >
                      加入合集
                    </button>
                  </article>
                ))}
                {availableArticles.length === 0 ? (
                  <div className="grid gap-3 px-4 py-5 text-sm text-zinc-500">
                    <p>
                      {articles.length === 0
                        ? "还没有可添加的文档。"
                        : "没有找到匹配的文档。"}
                    </p>
                    {articles.length === 0 ? (
                      <Link
                        href="/dashboard/articles/import"
                        className="w-fit rounded-full bg-white px-4 py-2 text-xs text-zinc-950"
                      >
                        去上传文档
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
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
                    置顶
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
