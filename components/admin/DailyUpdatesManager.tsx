"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { UploadField } from "@/components/admin/UploadField";
import type { AdminDailyUpdate, ApiResult } from "@/components/admin/types";
import { uiText } from "@/content/uiText";
import { updateTypeMeta, type UpdateType } from "@/data/updates";
import { cn } from "@/lib/classNames";

type DailyUpdateForm = {
  title: string;
  type: UpdateType;
  date: string;
  description: string;
  cover: string;
  link: string;
  published: boolean;
};

const defaultValues: DailyUpdateForm = {
  title: "",
  type: "note",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  cover: "",
  link: "",
  published: false
};

export function DailyUpdatesManager() {
  const [items, setItems] = useState<AdminDailyUpdate[]>([]);
  const [activeItem, setActiveItem] = useState<AdminDailyUpdate | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting }
  } = useForm<DailyUpdateForm>({ defaultValues });
  const cover = watch("cover");

  const filteredItems = useMemo(() => items, [items]);

  const loadItems = useCallback(async (query = "") => {
    setLoading(true);
    const response = await fetch(
      `/api/admin/updates?search=${encodeURIComponent(query)}`,
      { cache: "no-store" }
    );
    const result = (await response.json()) as ApiResult<AdminDailyUpdate[]>;
    setItems(result.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadItems("");
  }, [loadItems]);

  function editItem(item: AdminDailyUpdate) {
    setActiveItem(item);
    reset({
      title: item.title,
      type: item.type,
      date: item.date,
      description: item.description,
      cover: item.cover ?? "",
      link: item.link ?? "",
      published: item.published
    });
    setMessage("");
  }

  function newItem() {
    setActiveItem(null);
    reset(defaultValues);
    setMessage("");
  }

  async function onSubmit(values: DailyUpdateForm) {
    const endpoint = activeItem
      ? `/api/admin/updates/${activeItem.id}`
      : "/api/admin/updates";
    const response = await fetch(endpoint, {
      method: activeItem ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const result = (await response.json()) as ApiResult<AdminDailyUpdate>;

    if (!response.ok || !result.ok) {
      setMessage(result.message ?? uiText.admin.saveFailed);
      return;
    }

    setMessage(uiText.admin.saved);
    await loadItems(search);
    if (result.data) {
      editItem(result.data);
    }
  }

  async function deleteItem(item: AdminDailyUpdate) {
    if (!window.confirm(`${uiText.admin.deleteArticleConfirmPrefix}「${item.title}」？`)) {
      return;
    }

    await fetch(`/api/admin/updates/${item.id}`, { method: "DELETE" });
    if (activeItem?.id === item.id) {
      newItem();
    }
    await loadItems(search);
  }

  async function togglePublished(item: AdminDailyUpdate) {
    await fetch(`/api/admin/updates/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published })
    });
    await loadItems(search);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold">
              {uiText.admin.dailyUpdates}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {uiText.admin.updatesDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={newItem}
            className="rounded-full bg-white px-4 py-2 text-sm text-zinc-950"
          >
            {uiText.admin.newUpdate}
          </button>
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
            placeholder={uiText.admin.searchUpdatesPlaceholder}
          />
          <button className="rounded-full border border-white/10 px-4 py-2 text-sm">
            {uiText.admin.search}
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-zinc-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4 font-normal">{uiText.admin.title}</th>
                <th className="py-3 pr-4 font-normal">{uiText.admin.type}</th>
                <th className="py-3 pr-4 font-normal">{uiText.admin.date}</th>
                <th className="py-3 pr-4 font-normal">{uiText.admin.status}</th>
                <th className="py-3 pr-4 font-normal">{uiText.admin.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-white/5">
                  <td className="py-4 pr-4 text-white">{item.title}</td>
                  <td className="py-4 pr-4">{updateTypeMeta[item.type].label}</td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              {uiText.admin.noUpdates}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-serif text-2xl font-semibold">
          {activeItem ? uiText.admin.editUpdate : uiText.admin.newDailyUpdate}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
          <input
            {...register("title", { required: true })}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder={uiText.admin.title}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              {...register("type")}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            >
              {Object.entries(updateTypeMeta).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
            <input
              {...register("date", { required: true })}
              type="date"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            />
          </div>
          <textarea
            {...register("description", { required: true })}
            className="min-h-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder={uiText.admin.descriptionPlaceholder}
          />
          <UploadField
            label={uiText.admin.cover}
            kind="image"
            value={cover}
            onChange={(url) => setValue("cover", url)}
          />
          <input
            {...register("link")}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/40"
            placeholder={uiText.admin.linkPlaceholder}
          />
          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input type="checkbox" {...register("published")} />
            {uiText.admin.publishPublic}
          </label>
          <button
            disabled={isSubmitting}
            className="rounded-full bg-white px-5 py-3 text-sm text-zinc-950 disabled:opacity-60"
          >
            {isSubmitting ? uiText.admin.saving : uiText.admin.save}
          </button>
          {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
        </form>
      </section>
    </div>
  );
}
