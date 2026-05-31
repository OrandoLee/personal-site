"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { UpdateItem } from "@/data/updates";
import { updateTypeMeta } from "@/data/updates";
import type { ApiResult } from "@/components/admin/types";
import { uiText } from "@/content/uiText";

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

export function DailyUpdatesManager() {
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const today = useMemo(() => todayInput(), []);
  const todayItems = useMemo(
    () => items.filter((item) => item.date === today),
    [items, today]
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/public/updates", { cache: "no-store" });
    const result = (await response.json()) as ApiResult<UpdateItem[]>;
    setItems(result.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold">
            {uiText.admin.dailyUpdates}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-500">
            已自动改为读取当天发布或更新的文章、图片和视频；不再需要手动新增每日更新。
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-zinc-500">今日自动更新</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {todayItems.length}
          </p>
          {todayItems.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              今日还未有新的更新内容，官网会自动显示空状态提示。
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold">
              {uiText.admin.recentUpdates}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              官网首页底部会展示这里最近的 4 条内容。
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-zinc-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4 font-normal">{uiText.admin.title}</th>
                <th className="py-3 pr-4 font-normal">{uiText.admin.type}</th>
                <th className="py-3 pr-4 font-normal">{uiText.admin.date}</th>
                <th className="py-3 pr-4 font-normal">{uiText.admin.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-white/5">
                  <td className="py-4 pr-4 text-white">{item.title}</td>
                  <td className="py-4 pr-4 text-zinc-300">
                    {updateTypeMeta[item.type].label}
                  </td>
                  <td className="py-4 pr-4 text-zinc-400">{item.date}</td>
                  <td className="py-4 pr-4">
                    {item.link ? (
                      <Link
                        href={item.link}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 transition hover:border-white/30"
                      >
                        查看
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-600">无链接</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              暂无自动更新内容。发布文章或画廊作品后会出现在这里。
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
