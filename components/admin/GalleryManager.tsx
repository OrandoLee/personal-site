"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { UploadField } from "@/components/admin/UploadField";
import type { AdminGalleryItem, ApiResult } from "@/components/admin/types";
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
  category: GalleryCategory;
  published: boolean;
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
  category: "image",
  published: false
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
    category: item.category,
    published: item.published
  };
}

export function GalleryManager() {
  const [items, setItems] = useState<AdminGalleryItem[]>([]);
  const [activeItem, setActiveItem] = useState<AdminGalleryItem | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
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

  function editItem(item: AdminGalleryItem) {
    setActiveItem(item);
    setSlugTouched(true);
    reset(itemToForm(item));
    setMessage("");
  }

  function newItem() {
    setActiveItem(null);
    setSlugTouched(false);
    reset(defaultValues);
    setMessage("");
  }

  function generateSlug() {
    setValue("slug", slugify(title) || `work-${Date.now()}`);
    setSlugTouched(true);
  }

  async function onSubmit(values: GalleryForm) {
    const payload = {
      title: values.title,
      slug: values.slug || slugify(values.title) || `work-${Date.now()}`,
      type: values.type,
      src: values.src,
      thumbnail: values.thumbnail,
      date: values.date,
      description: values.description,
      tags: toTags(values.tagsText),
      category: values.category,
      published: values.published
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

  return (
    <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
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
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-3xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[120px_1fr]"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-black">
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    poster={item.thumbnail}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={item.src}
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
                </div>
                <p className="text-sm leading-6 text-zinc-400">{item.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span>{item.date}</span>
                  <span>/</span>
                  <span>{galleryCategoryLabels[item.category]}</span>
                  <span>/</span>
                  <span>{item.type}</span>
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
          ))}
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
          <div className="grid gap-4 sm:grid-cols-3">
            <select
              {...register("type")}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            >
              <option value="image">{uiText.galleryCategories.image}</option>
              <option value="video">{uiText.galleryCategories.video}</option>
            </select>
            <select
              {...register("category")}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {galleryCategoryLabels[category]}
                </option>
              ))}
            </select>
            <input
              {...register("date", { required: true })}
              type="date"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            />
          </div>
          <UploadField
            label={type === "video" ? uiText.admin.videoFile : uiText.admin.imageFile}
            kind={type === "video" ? "video" : "image"}
            value={src}
            onChange={(url) => setValue("src", url)}
          />
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
