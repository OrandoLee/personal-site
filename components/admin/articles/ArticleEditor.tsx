"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArticleRenderer } from "@/components/ArticleRenderer";
import { UploadField } from "@/components/admin/UploadField";
import type { AdminArticle, ApiResult } from "@/components/admin/types";
import { uiText } from "@/content/uiText";
import { slugify } from "@/lib/slug";

type ArticleEditorProps = {
  articleId?: string;
};

type ArticleForm = {
  title: string;
  slug: string;
  date: string;
  category: string;
  tagsText: string;
  summary: string;
  cover: string;
  content: string;
  published: boolean;
};

function todayInput() {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

const defaultValues: ArticleForm = {
  title: "",
  slug: "",
  date: todayInput(),
  category: "Essay",
  tagsText: "",
  summary: "",
  cover: "",
  content: "",
  published: false
};

function toTags(tagsText: string) {
  return tagsText
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function articleToForm(article: AdminArticle): ArticleForm {
  return {
    title: article.title,
    slug: article.slug,
    date: article.date,
    category: article.category,
    tagsText: article.tags.join(", "),
    summary: article.summary,
    cover: article.cover ?? "",
    content: article.content,
    published: article.published
  };
}

export function ArticleEditor({ articleId }: ArticleEditorProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(Boolean(articleId));
  const [slugTouched, setSlugTouched] = useState(Boolean(articleId));
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting }
  } = useForm<ArticleForm>({ defaultValues });
  const title = watch("title");
  const slug = watch("slug");
  const cover = watch("cover");
  const content = watch("content");

  const loadArticle = useCallback(async () => {
    if (!articleId) {
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/admin/articles/${articleId}`, {
      cache: "no-store"
    });
    const result = (await response.json()) as ApiResult<AdminArticle>;

    if (!response.ok || !result.ok || !result.data) {
      setMessage(result.message ?? uiText.admin.loadArticleFailed);
      setLoading(false);
      return;
    }

    reset(articleToForm(result.data));
    setLoading(false);
  }, [articleId, reset]);

  useEffect(() => {
    void loadArticle();
  }, [loadArticle]);

  useEffect(() => {
    if (!articleId && !slugTouched) {
      setValue("slug", slugify(title));
    }
  }, [articleId, setValue, slugTouched, title]);

  function generateSlug() {
    setValue("slug", slugify(title) || `article-${Date.now()}`);
    setSlugTouched(true);
  }

  async function onSubmit(values: ArticleForm) {
    const payload = {
      title: values.title,
      slug: values.slug || slugify(values.title) || `article-${Date.now()}`,
      date: values.date,
      category: values.category,
      tags: toTags(values.tagsText),
      summary: values.summary,
      cover: values.cover,
      content: values.content,
      published: values.published
    };
    const response = await fetch(
      articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles",
      {
        method: articleId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const result = (await response.json()) as ApiResult<AdminArticle>;

    if (!response.ok || !result.ok || !result.data) {
      setMessage(result.message ?? uiText.admin.saveFailed);
      return;
    }

    setMessage(uiText.admin.saved);
    router.push(`/dashboard/articles/${result.data.id}`);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-zinc-400">
        {uiText.admin.loadingArticle}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <input
          {...register("title", { required: true })}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
          placeholder={uiText.admin.title}
        />
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <input
            {...register("slug", {
              required: true,
              onChange: () => setSlugTouched(true)
            })}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder="slug"
          />
          <button
            type="button"
            onClick={generateSlug}
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-zinc-300"
          >
            {uiText.admin.generate}
          </button>
        </div>
        {slug ? (
          <p className="text-xs text-zinc-500">
            {uiText.admin.publicUrl}：/articles/{slug}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            {...register("date", { required: true })}
            type="date"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
          />
          <input
            {...register("category", { required: true })}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder={uiText.admin.category}
          />
        </div>
        <input
          {...register("tagsText")}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
          placeholder={uiText.admin.tagsPlaceholder}
        />
        <textarea
          {...register("summary", { required: true })}
          className="min-h-24 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
          placeholder={uiText.admin.summaryPlaceholder}
        />
        <UploadField
          label={uiText.admin.coverImage}
          kind="image"
          value={cover}
          onChange={(url) => setValue("cover", url)}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">{uiText.admin.markdownEditor}</span>
          <textarea
            {...register("content", { required: true })}
            className="min-h-[620px] resize-y rounded-3xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm leading-7 outline-none focus:border-white/40"
            placeholder={uiText.admin.markdownPlaceholder}
          />
        </label>

        <div className="grid gap-2">
          <span className="text-sm text-zinc-400">{uiText.admin.livePreview}</span>
          <ArticleRenderer
            content={content}
            className="article-body min-h-[620px] overflow-auto rounded-3xl border border-white/10 bg-[#f4efe7] p-6 text-zinc-950"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input type="checkbox" {...register("published")} />
          {uiText.admin.publishPublic}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
          <button
            disabled={isSubmitting}
            className="rounded-full bg-white px-5 py-3 text-sm text-zinc-950 disabled:opacity-60"
          >
            {isSubmitting ? uiText.admin.saving : uiText.admin.saveArticle}
          </button>
        </div>
      </section>
    </form>
  );
}
