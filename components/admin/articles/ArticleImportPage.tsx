"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  AdminArticle,
  AdminArticleCollection,
  ApiResult
} from "@/components/admin/types";
import { uiText } from "@/content/uiText";
import { cn } from "@/lib/classNames";

type ImportMode = "markdown" | "zip" | "docx";
type ImportStatus = "idle" | "uploading" | "processing" | "success" | "error";

type ImportCardProps = {
  mode: ImportMode;
  title: string;
  description: string;
  accept: string;
  endpoint: string;
  status: ImportStatus;
  message: string;
  collectionId: string;
  onStatusChange: (status: ImportStatus, message?: string) => void;
  onSuccess: (article: AdminArticle) => void;
  onSwitchToZip?: () => void;
};

function statusText(status: ImportStatus) {
  switch (status) {
    case "uploading":
      return uiText.admin.statusUploading;
    case "processing":
      return uiText.admin.statusProcessing;
    case "success":
      return uiText.admin.statusSuccess;
    case "error":
      return uiText.admin.statusError;
    default:
      return uiText.admin.statusIdle;
  }
}

function ImportCard({
  mode,
  title,
  description,
  accept,
  endpoint,
  status,
  message,
  collectionId,
  onStatusChange,
  onSuccess,
  onSwitchToZip
}: ImportCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  async function upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    if (collectionId) {
      formData.append("collectionId", collectionId);
    }
    onStatusChange("uploading", uiText.admin.uploadingFile);

    try {
      onStatusChange("processing", uiText.admin.processingArticle);
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as ApiResult<AdminArticle>;

      if (!response.ok || !result.ok || !result.data) {
        onStatusChange("error", result.message ?? uiText.admin.importFailed);
        return;
      }

      onStatusChange("success", uiText.admin.importSuccess);
      onSuccess(result.data);
    } catch {
      onStatusChange("error", uiText.admin.importNetworkError);
    }
  }

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files?.[0];

        if (file) {
          void upload(file);
        }
      }}
      className={cn(
        "grid gap-5 rounded-3xl border bg-white/[0.04] p-6 transition",
        dragActive
          ? "border-white/40 bg-white/[0.08]"
          : "border-white/10 hover:border-white/25"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-white">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
        <span
          className={cn(
            "w-fit rounded-full border px-3 py-1 text-xs",
            status === "success"
              ? "border-emerald-400/30 text-emerald-300"
              : status === "error"
                ? "border-red-400/30 text-red-200"
                : "border-white/10 text-zinc-400"
          )}
        >
          {statusText(status)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black/20 px-6 py-10 text-center transition hover:border-white/35"
      >
        <span className="text-base font-medium text-white">
          {uiText.admin.uploadDropHint}
        </span>
        <span className="mt-2 text-sm text-zinc-500">{accept}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void upload(file);
          }
          event.currentTarget.value = "";
        }}
      />

      {message ? (
        <div
          className={cn(
            "rounded-2xl border p-4 text-sm leading-6",
            status === "error"
              ? "border-red-400/20 bg-red-400/10 text-red-100"
              : "border-white/10 bg-black/20 text-zinc-300"
          )}
        >
          <p>{message}</p>
          {mode === "markdown" &&
          status === "error" &&
          message.includes(uiText.apiMessages.localImagesKeyword) ? (
            <button
              type="button"
              onClick={onSwitchToZip}
              className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-950"
            >
              {uiText.admin.switchToZip}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function ArticleImportPage() {
  const [activeMode, setActiveMode] = useState<ImportMode>("markdown");
  const [collections, setCollections] = useState<AdminArticleCollection[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const [markdownStatus, setMarkdownStatus] = useState<ImportStatus>("idle");
  const [zipStatus, setZipStatus] = useState<ImportStatus>("idle");
  const [docxStatus, setDocxStatus] = useState<ImportStatus>("idle");
  const [markdownMessage, setMarkdownMessage] = useState("");
  const [zipMessage, setZipMessage] = useState("");
  const [docxMessage, setDocxMessage] = useState("");
  const [article, setArticle] = useState<AdminArticle | null>(null);

  useEffect(() => {
    async function loadCollections() {
      const response = await fetch("/api/admin/article-collections", {
        cache: "no-store"
      });
      const result = (await response.json()) as ApiResult<
        AdminArticleCollection[]
      >;
      setCollections(result.data ?? []);
    }

    void loadCollections();
  }, []);

  function setModeStatus(mode: ImportMode, status: ImportStatus, message = "") {
    if (mode === "markdown") {
      setMarkdownStatus(status);
      setMarkdownMessage(message);
    } else if (mode === "zip") {
      setZipStatus(status);
      setZipMessage(message);
    } else {
      setDocxStatus(status);
      setDocxMessage(message);
    }
  }

  return (
    <div className="grid gap-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">{uiText.site.adminBrand}</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-white">
            {uiText.admin.importArticle}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            {uiText.admin.importArticleDescription}
          </p>
        </div>
        <Link
          href="/dashboard/articles"
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/30 hover:text-white"
        >
          {uiText.admin.backToArticleList}
        </Link>
      </section>

      <div className="flex w-fit rounded-full border border-white/10 bg-black/20 p-1">
        {[
          ["markdown", uiText.admin.markdownFile],
          ["zip", uiText.admin.markdownZip],
          ["docx", "DOCX 文档"]
        ].map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setActiveMode(mode as ImportMode)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition",
              activeMode === mode
                ? "bg-white text-zinc-950"
                : "text-zinc-400 hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <label className="grid gap-2 text-sm text-zinc-400">
          <span>导入到合集（可选）</span>
          <select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-white/40"
          >
            <option value="">不加入合集</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.title}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          先在文档管理页创建合集并保存，再回到这里上传，新文档会自动加入所选合集。
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className={activeMode === "markdown" ? "block" : "hidden lg:block"}>
          <ImportCard
            mode="markdown"
            title={uiText.admin.importMarkdownFile}
            description={uiText.admin.importMarkdownFileDescription}
            accept=".md,.markdown,text/markdown"
            endpoint="/api/admin/articles/import-markdown"
            status={markdownStatus}
            message={markdownMessage}
            collectionId={collectionId}
            onStatusChange={(status, message) =>
              setModeStatus("markdown", status, message)
            }
            onSuccess={setArticle}
            onSwitchToZip={() => setActiveMode("zip")}
          />
        </div>

        <div className={activeMode === "zip" ? "block" : "hidden lg:block"}>
          <ImportCard
            mode="zip"
            title={uiText.admin.importMarkdownZip}
            description={uiText.admin.importMarkdownZipDescription}
            accept=".zip,application/zip"
            endpoint="/api/admin/articles/import-zip"
            status={zipStatus}
            message={zipMessage}
            collectionId={collectionId}
            onStatusChange={(status, message) => setModeStatus("zip", status, message)}
            onSuccess={setArticle}
          />
        </div>

        <div className={activeMode === "docx" ? "block" : "hidden lg:block"}>
          <ImportCard
            mode="docx"
            title="导入 DOCX 文档"
            description="适用于直接上传 Word .docx 文档。系统会提取正文、基础格式、表格和图片，并在前台使用分页阅读器展示。"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            endpoint="/api/admin/articles/import-docx"
            status={docxStatus}
            message={docxMessage}
            collectionId={collectionId}
            onStatusChange={(status, message) => setModeStatus("docx", status, message)}
            onSuccess={setArticle}
          />
        </div>
      </div>

      {article ? (
        <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
          <p className="text-sm font-medium text-emerald-200">
            {uiText.admin.importSuccess}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white">
            {article.title}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">Slug：{article.slug}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/articles/${article.id}`}
              className="rounded-full bg-white px-4 py-2 text-sm text-zinc-950"
            >
              {uiText.admin.editDraft}
            </Link>
            <Link
              href="/dashboard/articles"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200"
            >
              {uiText.admin.viewArticleList}
            </Link>
            <Link
              href={`/articles/${article.slug}`}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200"
            >
              {uiText.admin.previewArticle}
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
