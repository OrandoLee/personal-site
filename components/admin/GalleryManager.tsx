"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { UploadField } from "@/components/admin/UploadField";
import type { AdminGalleryItem, ApiResult } from "@/components/admin/types";
import { uploadToCos } from "@/components/admin/uploadToCos";
import { uiText } from "@/content/uiText";
import {
  galleryCategoryLabels,
  type GalleryCategory,
  type GalleryItemType
} from "@/data/gallery";
import { cn } from "@/lib/classNames";
import { slugify } from "@/lib/slug";

type GalleryForm = {
  title: string;
  slug: string;
  type: GalleryItemType;
  src: string;
  thumbnail: string;
  date: string;
  description: string;
  tagsText: string;
  published: boolean;
  featured: boolean;
  showWatermark: boolean;
};

const defaultValues: GalleryForm = {
  title: "",
  slug: "",
  type: "image",
  src: "",
  thumbnail: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  tagsText: "",
  published: false,
  featured: false,
  showWatermark: true
};

const categories: GalleryCategory[] = [
  "image",
  "video",
  "poster",
  "animation",
  "experiment"
];

function toTags(tagsText: string) {
  return tagsText
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function cleanMediaUrls(urls: string[]) {
  return urls.map((url) => url.trim()).filter(Boolean);
}

function moveMedia(urls: string[], fromIndex: number, toIndex: number) {
  const nextUrls = [...urls];
  const [movedUrl] = nextUrls.splice(fromIndex, 1);
  nextUrls.splice(toIndex, 0, movedUrl);
  return nextUrls;
}

function itemToForm(item: AdminGalleryItem): GalleryForm {
  return {
    title: item.title,
    slug: item.slug,
    type: item.type,
    src: item.src,
    thumbnail: item.thumbnail ?? "",
    date: item.date,
    description: item.description,
    tagsText: item.tags.join(", "),
    published: item.published,
    featured: item.featured,
    showWatermark: item.showWatermark
  };
}

type MediaSetEditorProps = {
  kind: "image" | "video";
  urls: string[];
  onChange: (urls: string[]) => void;
};

function MediaSetEditor({ kind, urls, onChange }: MediaSetEditorProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const isVideo = kind === "video";
  const label = isVideo ? "视频组视频" : "图组图片";
  const uploadLabel = isVideo ? "上传多个视频" : "上传多张图片";
  const displayHint = isVideo
    ? "第一条会作为公开网页默认播放视频"
    : "第一张会作为公开网页默认展示图片";
  const emptyLabel = isVideo
    ? "暂无视频。上传或添加 URL 后可以拖拽调整顺序。"
    : "暂无图片。上传或添加 URL 后可以拖拽调整顺序。";

  function addUrls(newUrls: string[]) {
    const nextUrls = cleanMediaUrls([...urls, ...newUrls]);
    onChange(Array.from(new Set(nextUrls)));
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage("");

    try {
      const uploadedUrls: string[] = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const url = await uploadToCos({
          file,
          kind,
          onProgress: (percentage) => {
            const fileBase = (index / files.length) * 100;
            const fileProgress = percentage / files.length;
            setProgress(Math.round(fileBase + fileProgress));
          }
        });

        uploadedUrls.push(url);
      }

      addUrls(uploadedUrls);
      setProgress(100);
      setMessage(uiText.admin.uploadComplete);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : uiText.admin.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-60"
          >
            {uploading ? uiText.admin.statusUploading : uploadLabel}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={
              isVideo
                ? "video/mp4,video/webm,video/quicktime"
                : "image/jpeg,image/png,image/webp,image/gif"
            }
            className="hidden"
            onChange={(event) => {
              void uploadFiles(Array.from(event.target.files ?? []));
              event.currentTarget.value = "";
            }}
          />
          <span className="text-xs text-zinc-500">{displayHint}</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
            placeholder="https://...public.blob.vercel-storage.com/..."
          />
          <button
            type="button"
            onClick={() => {
              addUrls([manualUrl]);
              setManualUrl("");
            }}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/30"
          >
            添加 URL
          </button>
        </div>

        {uploading || progress > 0 ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}

        {message ? <p className="text-xs text-zinc-400">{message}</p> : null}

        <div className="grid gap-2">
          {urls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex === null || dragIndex === index) {
                  setDragIndex(null);
                  return;
                }

                onChange(moveMedia(urls, dragIndex, index));
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition sm:grid-cols-[84px_1fr_auto]",
                dragIndex === index ? "border-white/40 bg-white/10" : ""
              )}
            >
              {isVideo ? (
                <video
                  src={url}
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-[4/3] w-full rounded-xl bg-black object-cover sm:w-[84px]"
                />
              ) : (
                <img
                  src={url}
                  alt=""
                  className="aspect-[4/3] w-full rounded-xl bg-black object-cover sm:w-[84px]"
                />
              )}
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-400">
                    #{index + 1}
                  </span>
                  {index === 0 ? (
                    <span className="rounded-full border border-amber-300/50 px-2 py-0.5 text-xs text-amber-200">
                      默认展示
                    </span>
                  ) : null}
                </div>
                <p className="break-all text-xs leading-5 text-zinc-500">{url}</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onChange(moveMedia(urls, index, index - 1))}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 disabled:opacity-30"
                >
                  上移
                </button>
                <button
                  type="button"
                  disabled={index === urls.length - 1}
                  onClick={() => onChange(moveMedia(urls, index, index + 1))}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 disabled:opacity-30"
                >
                  下移
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(urls.filter((_, urlIndex) => urlIndex !== index))
                  }
                  className="rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-200"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {urls.length === 0 ? (
          <p className="rounded-2xl border border-white/10 p-4 text-sm text-zinc-500">
            {emptyLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function GalleryManager() {
  const [items, setItems] = useState<AdminGalleryItem[]>([]);
  const [activeItem, setActiveItem] = useState<AdminGalleryItem | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const previousTypeRef = useRef<GalleryItemType>(defaultValues.type);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting }
  } = useForm<GalleryForm>({ defaultValues });
  const title = watch("title");
  const slug = watch("slug");
  const type = watch("type");
  const src = watch("src");
  const thumbnail = watch("thumbnail");

  const loadItems = useCallback(async (query = "", category = "all") => {
    const params = new URLSearchParams();
    params.set("search", query);
    params.set("category", category);
    const response = await fetch(`/api/admin/gallery?${params.toString()}`, {
      cache: "no-store"
    });
    const result = (await response.json()) as ApiResult<AdminGalleryItem[]>;
    setItems(result.data ?? []);
  }, []);

  useEffect(() => {
    void loadItems("", "all");
  }, [loadItems]);

  useEffect(() => {
    if (!activeItem && !slugTouched) {
      setValue("slug", slugify(title));
    }
  }, [activeItem, setValue, slugTouched, title]);

  useEffect(() => {
    setValue("src", mediaUrls[0] ?? "");
  }, [mediaUrls, setValue]);

  useEffect(() => {
    if (previousTypeRef.current === type) {
      return;
    }

    previousTypeRef.current = type;
    setMediaUrls([]);
    setValue("src", "");
  }, [setValue, type]);

  function editItem(item: AdminGalleryItem) {
    setActiveItem(item);
    setSlugTouched(true);
    previousTypeRef.current = item.type;
    setMediaUrls(cleanMediaUrls(item.images?.length ? item.images : [item.src]));
    reset(itemToForm(item));
    setMessage("");
  }

  function newItem() {
    setActiveItem(null);
    setSlugTouched(false);
    previousTypeRef.current = defaultValues.type;
    setMediaUrls([]);
    reset(defaultValues);
    setMessage("");
  }

  function generateSlug() {
    setValue("slug", slugify(title) || `work-${Date.now()}`);
    setSlugTouched(true);
  }

  async function onSubmit(values: GalleryForm) {
    const media = cleanMediaUrls(mediaUrls.length > 0 ? mediaUrls : [values.src]);
    const primarySrc = media[0] ?? values.src;
    const payload = {
      title: values.title,
      slug: values.slug || slugify(values.title) || `work-${Date.now()}`,
      type: values.type,
      src: primarySrc,
      images: media,
      thumbnail: values.thumbnail,
      date: values.date,
      description: values.description,
      tags: toTags(values.tagsText),
      category: values.type === "video" ? "video" : "image",
      published: values.published,
      featured: values.featured,
      showWatermark: values.type === "image" ? values.showWatermark : false
    };
    const endpoint = activeItem
      ? `/api/admin/gallery/${activeItem.id}`
      : "/api/admin/gallery";
    const response = await fetch(endpoint, {
      method: activeItem ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json()) as ApiResult<AdminGalleryItem>;

    if (!response.ok || !result.ok) {
      setMessage(result.message ?? uiText.admin.saveFailed);
      return;
    }

    setMessage(uiText.admin.saved);
    await loadItems(search, categoryFilter);
    if (result.data) {
      editItem(result.data);
    }
  }

  async function deleteItem(item: AdminGalleryItem) {
    if (!window.confirm(`${uiText.admin.deleteArticleConfirmPrefix}「${item.title}」？`)) {
      return;
    }

    await fetch(`/api/admin/gallery/${item.id}`, { method: "DELETE" });
    if (activeItem?.id === item.id) {
      newItem();
    }
    await loadItems(search, categoryFilter);
  }

  async function togglePublished(item: AdminGalleryItem) {
    await fetch(`/api/admin/gallery/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published })
    });
    await loadItems(search, categoryFilter);
  }

  async function toggleFeatured(item: AdminGalleryItem) {
    await fetch(`/api/admin/gallery/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !item.featured })
    });
    await loadItems(search, categoryFilter);
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold">
              {uiText.admin.galleryTitle}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {uiText.admin.galleryDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={newItem}
            className="rounded-full bg-white px-4 py-2 text-sm text-zinc-950"
          >
            {uiText.admin.newWork}
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void loadItems(search, categoryFilter);
          }}
          className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto_auto]"
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-0 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm outline-none focus:border-white/40"
            placeholder={uiText.admin.searchArticlesPlaceholder}
          />
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              void loadItems(search, event.target.value);
            }}
            className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm outline-none"
          >
            <option value="all">{uiText.admin.allCategories}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {galleryCategoryLabels[category]}
              </option>
            ))}
          </select>
          <button className="rounded-full border border-white/10 px-4 py-2 text-sm">
            {uiText.admin.search}
          </button>
        </form>

        <div className="grid gap-3">
          {items.map((item) => {
            const displaySrc = item.images?.[0] ?? item.src;

            return (
              <article
                key={item.id}
                className="grid gap-4 rounded-3xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[120px_1fr]"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-black">
                  {item.type === "video" ? (
                    <video
                      src={displaySrc}
                      poster={item.thumbnail}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={displaySrc}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-medium text-white">{item.title}</h3>
                      <p className="mt-1 text-xs text-zinc-500">/{item.slug}</p>
                    </div>
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
                  </div>
                  <p className="text-sm leading-6 text-zinc-400">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span>{item.date}</span>
                    <span>/</span>
                    <span>{galleryCategoryLabels[item.category]}</span>
                    <span>/</span>
                    <span>{item.type}</span>
                    {item.images.length > 1 ? (
                      <>
                        <span>/</span>
                        <span>{item.images.length} 个</span>
                      </>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editItem(item)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300"
                    >
                      {uiText.admin.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(item)}
                      className="rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-200"
                    >
                      {uiText.admin.delete}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              {uiText.admin.noWorks}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-serif text-2xl font-semibold">
          {activeItem ? uiText.admin.editWork : uiText.admin.newWork}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
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
              {uiText.admin.workAnchor}：/gallery#{slug}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              {...register("type")}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            >
              <option value="image">{uiText.galleryCategories.image}</option>
              <option value="video">{uiText.galleryCategories.video}</option>
            </select>
            <input
              {...register("date", { required: true })}
              type="date"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            />
          </div>
          <MediaSetEditor kind={type} urls={mediaUrls} onChange={setMediaUrls} />
          {type === "image" ? (
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
              <input type="checkbox" {...register("showWatermark")} />
              前台图片显示 DELEE 水印
            </label>
          ) : null}
          {type === "video" ? (
            <UploadField
              label={uiText.admin.videoCover}
              kind="image"
              value={thumbnail}
              onChange={(url) => setValue("thumbnail", url)}
            />
          ) : null}
          {src ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              {type === "video" ? (
                <video
                  src={src}
                  poster={thumbnail}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  className="max-h-72 w-full object-contain"
                />
              ) : (
                <img src={src} alt="" className="max-h-72 w-full object-contain" />
              )}
            </div>
          ) : null}
          <input
            {...register("tagsText")}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder={uiText.admin.tagsPlaceholder}
          />
          <textarea
            {...register("description", { required: true })}
            className="min-h-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder={uiText.admin.descriptionPlaceholder}
          />
          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input type="checkbox" {...register("published")} />
            {uiText.admin.publishPublic}
          </label>
          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input type="checkbox" {...register("featured")} />
            置顶到首页
          </label>
          <button
            disabled={isSubmitting}
            className="rounded-full bg-white px-5 py-3 text-sm text-zinc-950 disabled:opacity-60"
          >
            {isSubmitting ? uiText.admin.saving : uiText.admin.saveWork}
          </button>
          {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
        </form>
      </section>
    </div>
  );
}
