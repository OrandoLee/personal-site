"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { UploadField } from "@/components/admin/UploadField";
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

type BatchUploadItem = {
  name: string;
  status: "pending" | "uploading" | "success" | "error";
  message?: string;
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

const batchAccept =
  ".md,.markdown,.zip,.docx,text/markdown,application/zip,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function articleMatches(article: AdminArticle, query: string) {
  if (!query) {
    return true;
  }

  return [article.title, article.slug, article.summary, article.category]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function endpointForFile(file: File) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".docx")) {
    return "/api/admin/articles/import-docx";
  }

  if (name.endsWith(".zip")) {
    return "/api/admin/articles/import-zip";
  }

  if (name.endsWith(".md") || name.endsWith(".markdown")) {
    return "/api/admin/articles/import-markdown";
  }

  return null;
}

function collectionPayload(
  form: CollectionForm,
  options: { forcePublished?: boolean } = {}
) {
  const fallbackTitle = "未命名合集";
  const title = form.title.trim() || fallbackTitle;
  const slug = form.slug.trim() || slugify(title) || `collection-${Date.now()}`;
  const summary = form.summary.trim() || "批量上传创建的文档合集。";

  return {
    title,
    slug,
    summary,
    cover: form.cover || null,
    published: options.forcePublished ? true : form.published,
    featured: form.featured,
    articleIds: form.articleIds
  };
}

export function ArticleCollectionsManager() {
  const batchInputRef = useRef<HTMLInputElement | null>(null);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [collections, setCollections] = useState<AdminArticleCollection[]>([]);
  const [form, setForm] = useState<CollectionForm>(emptyCollectionForm);
  const [message, setMessage] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const [batchItems, setBatchItems] = useState<BatchUploadItem[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [publishBatchOnImport, setPublishBatchOnImport] = useState(false);

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
    setBatchItems([]);
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
    setBatchItems([]);
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

  async function persistCollection(options: {
    resetAfterSave: boolean;
    forcePublished?: boolean;
  }) {
    const payload = collectionPayload(form, {
      forcePublished: options.forcePublished
    });
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

    if (!response.ok || !result.ok || !result.data) {
      throw new Error(result.message ?? "保存合集失败。");
    }

    if (options.resetAfterSave) {
      resetForm();
      setMessage("合集已保存。");
    } else {
      setForm({
        id: result.data.id,
        title: result.data.title,
        slug: result.data.slug,
        summary: result.data.summary,
        cover: result.data.cover ?? "",
        published: result.data.published,
        featured: result.data.featured,
        articleIds: result.data.articleIds
      });
    }

    await loadData();
    return result.data;
  }

  async function saveCollection() {
    try {
      await persistCollection({ resetAfterSave: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存合集失败。");
    }
  }

  async function ensureCollectionForUpload() {
    const saved = await persistCollection({
      resetAfterSave: false,
      forcePublished: publishBatchOnImport
    });
    setMessage("合集已准备好，开始上传文件。");
    return saved.id;
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0 || batchUploading) {
      return;
    }

    const uploadItems = files.map((file) => ({
      name: file.name,
      status: "pending" as const
    }));
    setBatchItems(uploadItems);
    setBatchUploading(true);

    try {
      const collectionId = await ensureCollectionForUpload();
      const uploadedArticleIds: string[] = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const endpoint = endpointForFile(file);

        if (!endpoint) {
          setBatchItems((items) =>
            items.map((item, itemIndex) =>
              itemIndex === index
                ? { ...item, status: "error", message: "不支持这个文件类型。" }
                : item
            )
          );
          continue;
        }

        setBatchItems((items) =>
          items.map((item, itemIndex) =>
            itemIndex === index ? { ...item, status: "uploading" } : item
          )
        );

        const formData = new FormData();
        formData.append("file", file);
        formData.append("collectionId", collectionId);
        formData.append("useFileNameAsTitle", "true");
        formData.append("publishOnImport", publishBatchOnImport ? "true" : "false");

        try {
          const response = await fetch(endpoint, {
            method: "POST",
            body: formData
          });
          const result = (await response.json()) as ApiResult<AdminArticle>;

          if (!response.ok || !result.ok || !result.data) {
            throw new Error(result.message ?? "上传失败。");
          }

          uploadedArticleIds.push(result.data.id);
          setBatchItems((items) =>
            items.map((item, itemIndex) =>
              itemIndex === index
                ? { ...item, status: "success", message: result.data?.title }
                : item
            )
          );
        } catch (error) {
          setBatchItems((items) =>
            items.map((item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    status: "error",
                    message: error instanceof Error ? error.message : "上传失败。"
                  }
                : item
            )
          );
        }
      }

      if (uploadedArticleIds.length > 0) {
        setForm((current) => ({
          ...current,
          articleIds: Array.from(
            new Set([...current.articleIds, ...uploadedArticleIds])
          )
        }));
      }

      await loadData();
      setMessage(`批量上传完成：成功 ${uploadedArticleIds.length} / ${files.length} 个文件。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "批量上传失败。");
    } finally {
      setBatchUploading(false);
    }
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
    <section className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">文档合集</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            可以批量上传文档到当前合集，也可以从已有文档里继续添加。
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
        <div className="grid min-w-0 gap-3">
          {collections.map((collection) => (
            <article
              key={collection.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-white">{collection.title}</h3>
                  <p className="mt-1 truncate text-xs text-zinc-500">
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
              还没有合集。右侧选择多个文件就能直接创建并上传。
            </p>
          ) : null}
        </div>

        <div className="grid min-w-0 gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                  slug: current.slug ? current.slug : slugify(event.target.value)
                }))
              }
              className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/40"
              placeholder="合集标题（可选）"
            />
            <input
              value={form.slug}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
              className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/40"
              placeholder="collection-slug（可选）"
            />
          </div>
          <textarea
            value={form.summary}
            onChange={(event) =>
              setForm((current) => ({ ...current, summary: event.target.value }))
            }
            className="min-h-24 min-w-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/40"
            placeholder="合集简介（可选）"
          />
          <UploadField
            label="合集封面"
            kind="image"
            value={form.cover}
            onChange={(url) => setForm((current) => ({ ...current, cover: url }))}
            showUrlInput={false}
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

          <section
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void uploadFiles(Array.from(event.dataTransfer.files ?? []));
            }}
            className="grid min-w-0 gap-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-zinc-200">批量上传文档</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  支持 Markdown、ZIP、DOCX。文件会自动导入、加入当前合集并公开。
                </p>
              </div>
              <button
                type="button"
                onClick={() => batchInputRef.current?.click()}
                disabled={batchUploading}
                className="rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-950 disabled:opacity-60"
              >
                {batchUploading ? "上传中" : "选择多个文件"}
              </button>
              <input
                ref={batchInputRef}
                type="file"
                multiple
                accept={batchAccept}
                className="hidden"
                onChange={(event) => {
                  void uploadFiles(Array.from(event.target.files ?? []));
                  event.currentTarget.value = "";
                }}
              />
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={publishBatchOnImport}
                onChange={(event) => setPublishBatchOnImport(event.target.checked)}
              />
              <span>
                <span className="block">导入后立即公开 DOCUMENT</span>
                <span className="mt-1 block text-xs text-zinc-500">
                  不勾选时，文档和当前合集会先保存到后台，不在前台展示。
                </span>
              </span>
            </label>
            {batchItems.length > 0 ? (
              <div className="grid gap-2">
                {batchItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  >
                    <span className="min-w-0 truncate text-zinc-200">
                      {item.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-1 text-xs",
                        item.status === "success"
                          ? "border-emerald-400/30 text-emerald-300"
                          : item.status === "error"
                            ? "border-red-400/30 text-red-200"
                            : "border-white/10 text-zinc-400"
                      )}
                    >
                      {item.status === "success"
                        ? "完成"
                        : item.status === "error"
                          ? item.message ?? "失败"
                          : item.status === "uploading"
                            ? "上传中"
                            : "等待"}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <div className="grid min-w-0 gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-zinc-200">合集内文档</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  已加入 {selectedArticles.length} 篇文档
                </p>
              </div>
              <input
                value={articleSearch}
                onChange={(event) => setArticleSearch(event.target.value)}
                className="min-w-0 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm outline-none focus:border-white/40 sm:w-72"
                placeholder="搜索已有文档"
              />
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
                  批量上传后，文档会自动出现在这里。
                </p>
              ) : null}
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="mb-3 text-sm font-medium text-zinc-200">
                添加已有文档
              </h3>
              <div className="max-h-80 min-w-0 overflow-auto rounded-2xl border border-white/10">
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
                  <p className="px-4 py-5 text-sm text-zinc-500">
                    {articles.length === 0
                      ? "还没有可添加的旧文档。"
                      : "没有找到匹配的旧文档。"}
                  </p>
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState("");
  const [draftReleaseMessage, setDraftReleaseMessage] = useState("");

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const draftItems = useMemo(() => items.filter((item) => !item.published), [items]);
  const allDraftSelected =
    draftItems.length > 0 && selectedDraftIds.length === draftItems.length;

  const loadItems = useCallback(async (query = "") => {
    const response = await fetch(
      `/api/admin/articles?search=${encodeURIComponent(query)}`,
      { cache: "no-store" }
    );
    const result = (await response.json()) as ApiResult<AdminArticle[]>;
    setItems(result.data ?? []);
    setSelectedIds([]);
    setSelectedDraftIds([]);
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

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, id]))
        : current.filter((selectedId) => selectedId !== id)
    );
  }

  function toggleAllSelected(checked: boolean) {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  }

  function toggleDraftSelected(id: string, checked: boolean) {
    setSelectedDraftIds((current) =>
      checked
        ? Array.from(new Set([...current, id]))
        : current.filter((selectedId) => selectedId !== id)
    );
  }

  function toggleAllDraftSelected(checked: boolean) {
    setSelectedDraftIds(checked ? draftItems.map((item) => item.id) : []);
  }

  async function runBulkAction(
    action: "delete" | "feature" | "unfeature" | "publish" | "unpublish"
  ) {
    if (selectedIds.length === 0) {
      setBulkMessage("请先选择文档。");
      return;
    }

    if (
      action === "delete" &&
      !window.confirm(`确定删除选中的 ${selectedIds.length} 篇文档吗？`)
    ) {
      return;
    }

    const response = await fetch("/api/admin/articles/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids: selectedIds })
    });
    const result = (await response.json()) as ApiResult<{ count: number }>;

    if (!response.ok || !result.ok) {
      setBulkMessage(result.message ?? "批量操作失败。");
      return;
    }

    setBulkMessage(`已处理 ${result.data?.count ?? selectedIds.length} 篇文档。`);
    await loadItems(search);
  }

  async function releaseDraftDocuments(options: {
    ids?: string[];
    releaseAll?: boolean;
  }) {
    const ids = options.ids ?? [];

    if (!options.releaseAll && ids.length === 0) {
      setDraftReleaseMessage("请先选择未公开 DOCUMENT。");
      return;
    }

    const response = await fetch("/api/admin/articles/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "publish",
        scope: options.releaseAll ? "unpublished" : "selected",
        ids
      })
    });
    const result = (await response.json()) as ApiResult<{ count: number }>;

    if (!response.ok || !result.ok) {
      setDraftReleaseMessage(result.message ?? "放出未公开 DOCUMENT 失败。");
      return;
    }

    setDraftReleaseMessage(`已放出 ${result.data?.count ?? 0} 篇未公开文档。`);
    await loadItems(search);
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5">
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

      <section className="mb-5 rounded-3xl border border-dashed border-white/15 bg-black/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">未公开 DOCUMENT</h3>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              新建、导入或批量上传后未公开的文档会留在这里，可选择部分放出，也可一次放出全部未公开文档。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                void releaseDraftDocuments({ ids: selectedDraftIds })
              }
              className="rounded-full border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-200"
            >
              放出已选
            </button>
            <button
              type="button"
              onClick={() => void releaseDraftDocuments({ releaseAll: true })}
              className="rounded-full bg-white px-3 py-1.5 text-xs text-zinc-950"
            >
              放出全部
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <label className="flex items-center gap-2 text-zinc-300">
            <input
              type="checkbox"
              checked={allDraftSelected}
              onChange={(event) => toggleAllDraftSelected(event.target.checked)}
            />
            全选未公开
          </label>
          <span>
            已选 {selectedDraftIds.length} / {draftItems.length}
          </span>
          {draftReleaseMessage ? <span>{draftReleaseMessage}</span> : null}
        </div>

        <div className="mt-3 grid gap-2">
          {draftItems.slice(0, 6).map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <input
                type="checkbox"
                checked={selectedDraftIds.includes(item.id)}
                onChange={(event) =>
                  toggleDraftSelected(item.id, event.target.checked)
                }
              />
              <span className="min-w-0">
                <span className="block truncate text-sm text-zinc-200">
                  {item.title}
                </span>
                <span className="mt-1 block truncate text-xs text-zinc-500">
                  /articles/{item.slug}
                </span>
              </span>
            </label>
          ))}
          {draftItems.length > 6 ? (
            <p className="px-4 text-xs text-zinc-500">
              还有 {draftItems.length - 6} 篇未公开文档，可用“放出全部”一次公开。
            </p>
          ) : null}
          {draftItems.length === 0 ? (
            <p className="rounded-2xl border border-white/10 px-4 py-4 text-sm text-zinc-500">
              当前没有未公开 DOCUMENT。
            </p>
          ) : null}
        </div>
      </section>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-400">
          已选择 {selectedIds.length} / {items.length} 篇文档
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void runBulkAction("publish")}
            className="rounded-full border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-200"
          >
            批量发布
          </button>
          <button
            type="button"
            onClick={() => void runBulkAction("unpublish")}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300"
          >
            批量取消发布
          </button>
          <button
            type="button"
            onClick={() => void runBulkAction("feature")}
            className="rounded-full border border-amber-300/40 px-3 py-1.5 text-xs text-amber-200"
          >
            批量置顶
          </button>
          <button
            type="button"
            onClick={() => void runBulkAction("unfeature")}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300"
          >
            取消置顶
          </button>
          <button
            type="button"
            onClick={() => void runBulkAction("delete")}
            className="rounded-full border border-red-400/30 px-3 py-1.5 text-xs text-red-200"
          >
            批量删除
          </button>
        </div>
        {bulkMessage ? <p className="text-xs text-zinc-500">{bulkMessage}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 font-normal">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => toggleAllSelected(event.target.checked)}
                />
              </th>
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
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={(event) =>
                      toggleSelected(item.id, event.target.checked)
                    }
                  />
                </td>
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
