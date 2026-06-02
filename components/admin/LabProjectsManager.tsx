"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { UploadField } from "@/components/admin/UploadField";
import type { AdminLabProject, ApiResult } from "@/components/admin/types";
import {
  labCategories,
  labCategoryLabels,
  type LabCategoryKey,
  type LabOpenMode
} from "@/data/lab";
import { cn } from "@/lib/classNames";
import { slugify } from "@/lib/slug";

type LabProjectForm = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  categoryKey: LabCategoryKey;
  status: string;
  coverImage: string;
  openMode: LabOpenMode;
  embedUrl: string;
  externalUrl: string;
  internalPath: string;
  sortOrder: number;
  isPublished: boolean;
};

const defaultValues: LabProjectForm = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  categoryKey: "game",
  status: "原型",
  coverImage: "",
  openMode: "embed",
  embedUrl: "",
  externalUrl: "",
  internalPath: "",
  sortOrder: 100,
  isPublished: false
};

const editableCategories = labCategories.filter(
  (category): category is (typeof labCategories)[number] & { key: LabCategoryKey } =>
    category.key !== "all"
);

const openModeLabels: Record<LabOpenMode, string> = {
  embed: "嵌入展示",
  external: "外部打开",
  internal: "内部页面"
};

function itemToForm(item: AdminLabProject): LabProjectForm {
  return {
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    description: item.description ?? "",
    categoryKey: item.categoryKey,
    status: item.status,
    coverImage: item.coverImage ?? "",
    openMode: item.openMode,
    embedUrl: item.embedUrl ?? "",
    externalUrl: item.externalUrl ?? "",
    internalPath: item.internalPath ?? "",
    sortOrder: item.sortOrder,
    isPublished: item.isPublished
  };
}

export function LabProjectsManager() {
  const [items, setItems] = useState<AdminLabProject[]>([]);
  const [activeItem, setActiveItem] = useState<AdminLabProject | null>(null);
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
  } = useForm<LabProjectForm>({ defaultValues });
  const title = watch("title");
  const slug = watch("slug");
  const coverImage = watch("coverImage");
  const openMode = watch("openMode");

  const loadItems = useCallback(async (query = "", category = "all") => {
    const params = new URLSearchParams();
    params.set("search", query);
    params.set("category", category);
    const response = await fetch(`/api/admin/lab?${params.toString()}`, {
      cache: "no-store"
    });
    const result = (await response.json()) as ApiResult<AdminLabProject[]>;
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

  const activeCategoryLabel = useMemo(
    () => labCategoryLabels[categoryFilter as keyof typeof labCategoryLabels] ?? "全部实验",
    [categoryFilter]
  );

  function editItem(item: AdminLabProject) {
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
    setValue("slug", slugify(title) || `lab-${Date.now()}`);
    setSlugTouched(true);
  }

  async function onSubmit(values: LabProjectForm) {
    const payload = {
      ...values,
      slug: values.slug || slugify(values.title) || `lab-${Date.now()}`,
      category: labCategoryLabels[values.categoryKey],
      sortOrder: Number(values.sortOrder)
    };
    const endpoint = activeItem ? `/api/admin/lab/${activeItem.id}` : "/api/admin/lab";
    const response = await fetch(endpoint, {
      method: activeItem ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json()) as ApiResult<AdminLabProject>;

    if (!response.ok || !result.ok) {
      setMessage(result.message ?? "保存失败。");
      return;
    }

    setMessage("已保存。");
    await loadItems(search, categoryFilter);
    if (result.data) {
      editItem(result.data);
    }
  }

  async function deleteItem(item: AdminLabProject) {
    if (!window.confirm(`确定删除「${item.title}」？`)) {
      return;
    }

    await fetch(`/api/admin/lab/${item.id}`, { method: "DELETE" });
    if (activeItem?.id === item.id) {
      newItem();
    }
    await loadItems(search, categoryFilter);
  }

  async function togglePublished(item: AdminLabProject) {
    await fetch(`/api/admin/lab/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !item.isPublished })
    });
    await loadItems(search, categoryFilter);
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold">LAB 项目管理</h2>
            <p className="mt-1 text-sm text-zinc-500">
              管理实验入口、嵌入地址、外部链接和公开状态。
            </p>
          </div>
          <button
            type="button"
            onClick={newItem}
            className="rounded-full bg-white px-4 py-2 text-sm text-zinc-950"
          >
            新增 LAB 项目
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
            placeholder="搜索标题、slug、简介、状态"
          />
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              void loadItems(search, event.target.value);
            }}
            className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm outline-none"
            aria-label="分类筛选"
          >
            {labCategories.map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
          <button className="rounded-full border border-white/10 px-4 py-2 text-sm">
            搜索
          </button>
        </form>

        <p className="mb-4 text-xs text-zinc-500">
          当前分类：{activeCategoryLabel}
        </p>

        <div className="grid gap-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-3xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium text-white">{item.title}</h3>
                    <p className="mt-1 break-all text-xs text-zinc-500">
                      /lab/{item.slug}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePublished(item)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      item.isPublished
                        ? "border-emerald-400/30 text-emerald-300"
                        : "border-white/10 text-zinc-500"
                    )}
                  >
                    {item.isPublished ? "已公开" : "隐藏"}
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {item.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span>{item.category}</span>
                  <span>/</span>
                  <span>{item.status}</span>
                  <span>/</span>
                  <span>{openModeLabels[item.openMode]}</span>
                  <span>/</span>
                  <span>排序 {item.sortOrder}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 self-start sm:justify-end">
                <Link
                  href={`/lab/${item.slug}`}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300"
                >
                  查看
                </Link>
                <button
                  type="button"
                  onClick={() => editItem(item)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300"
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(item)}
                  className="rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-200"
                >
                  删除
                </button>
              </div>
            </article>
          ))}
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              暂无 LAB 项目。
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-serif text-2xl font-semibold">
          {activeItem ? "编辑 LAB 项目" : "新增 LAB 项目"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
          <input
            {...register("title", { required: true })}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder="项目标题"
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
              生成
            </button>
          </div>
          {slug ? <p className="text-xs text-zinc-500">公开路径：/lab/{slug}</p> : null}

          <textarea
            {...register("summary", { required: true })}
            className="min-h-24 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder="简介"
          />
          <textarea
            {...register("description")}
            className="min-h-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder="详细说明"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <select
              {...register("categoryKey")}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
              aria-label="项目分类"
            >
              {editableCategories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
            <input
              {...register("status", { required: true })}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
              placeholder="状态"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <select
              {...register("openMode")}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
              aria-label="打开方式"
            >
              <option value="embed">嵌入展示</option>
              <option value="external">外部打开</option>
              <option value="internal">内部页面</option>
            </select>
            <input
              {...register("sortOrder", { valueAsNumber: true })}
              type="number"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
              placeholder="排序"
            />
          </div>

          <UploadField
            label="封面图"
            kind="image"
            value={coverImage}
            onChange={(url) => setValue("coverImage", url)}
          />

          {openMode === "embed" ? (
            <input
              {...register("embedUrl")}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
              placeholder="iframe 嵌入地址"
            />
          ) : null}
          {openMode === "external" ? (
            <input
              {...register("externalUrl")}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
              placeholder="外部链接"
            />
          ) : null}
          {openMode === "internal" ? (
            <input
              {...register("internalPath")}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
              placeholder="内部路径"
            />
          ) : null}

          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input type="checkbox" {...register("isPublished")} />
            公开显示
          </label>

          <button
            disabled={isSubmitting}
            className="rounded-full bg-white px-5 py-3 text-sm text-zinc-950 disabled:opacity-60"
          >
            {isSubmitting ? "保存中..." : "保存 LAB 项目"}
          </button>
          {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
        </form>
      </section>
    </div>
  );
}
