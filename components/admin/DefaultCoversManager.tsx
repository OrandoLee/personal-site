"use client";

import { useCallback, useEffect, useState } from "react";
import { UploadField } from "@/components/admin/UploadField";
import type { ApiResult } from "@/components/admin/types";

type DefaultCoverKey = "article" | "essay" | "announcement" | "video";

type DefaultCover = {
  key: DefaultCoverKey;
  label: string;
  fallbackUrl: string;
  url: string;
  isCustom: boolean;
};

const descriptions: Record<DefaultCoverKey, string> = {
  article: "文章分类在没有手动封面时使用。",
  essay: "随笔分类在没有手动封面时使用。",
  announcement: "公告分类在没有手动封面时使用。",
  video: "视频作品没有手动视频封面时使用。"
};

function coversToForm(covers: DefaultCover[]) {
  return Object.fromEntries(
    covers.map((cover) => [
      cover.key,
      cover.isCustom ? cover.url : ""
    ])
  ) as Record<DefaultCoverKey, string>;
}

export function DefaultCoversManager() {
  const [covers, setCovers] = useState<DefaultCover[]>([]);
  const [values, setValues] = useState<Record<DefaultCoverKey, string>>({
    article: "",
    essay: "",
    announcement: "",
    video: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCovers = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/default-covers", {
      cache: "no-store"
    });
    const result = (await response.json()) as ApiResult<DefaultCover[]>;

    if (response.ok && result.ok && result.data) {
      setCovers(result.data);
      setValues(coversToForm(result.data));
    } else {
      setMessage(result.message ?? "无法加载默认封面。");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCovers();
  }, [loadCovers]);

  async function saveCovers() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/default-covers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ covers: values })
    });
    const result = (await response.json()) as ApiResult<DefaultCover[]>;

    if (!response.ok || !result.ok || !result.data) {
      setMessage(result.message ?? "默认封面保存失败。");
      setSaving(false);
      return;
    }

    setCovers(result.data);
    setValues(coversToForm(result.data));
    setMessage("默认封面已保存。");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-zinc-400">
        正在加载默认封面...
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold">默认封面</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-500">
              这里的图片会用于没有手动上传封面的文章、随笔、公告和视频。留空时使用系统内置图片。
            </p>
          </div>
          <button
            type="button"
            onClick={saveCovers}
            disabled={saving}
            className="rounded-full bg-white px-5 py-3 text-sm text-zinc-950 disabled:opacity-60"
          >
            {saving ? "保存中..." : "保存默认封面"}
          </button>
        </div>
        {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {covers.map((cover) => {
          const customUrl = values[cover.key];
          const displayUrl = customUrl || cover.fallbackUrl;

          return (
            <article
              key={cover.key}
              className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                <img
                  src={displayUrl}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-xl font-semibold">
                    {cover.label}
                  </h3>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-500">
                    {customUrl ? "自定义" : "系统默认"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {descriptions[cover.key]}
                </p>
              </div>
              <UploadField
                label={`${cover.label}默认封面`}
                kind="image"
                value={customUrl}
                onChange={(url) =>
                  setValues((current) => ({ ...current, [cover.key]: url }))
                }
              />
              <button
                type="button"
                onClick={() =>
                  setValues((current) => ({ ...current, [cover.key]: "" }))
                }
                className="justify-self-start rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/30"
              >
                恢复系统默认
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
