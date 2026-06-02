"use client";

import { useMemo, useRef, useState } from "react";
import { ArticleRenderer } from "@/components/ArticleRenderer";
import { splitDocxArticlePages } from "@/lib/article-content";
import { cn } from "@/lib/classNames";

type DocxArticlePagerProps = {
  content: string;
};

export function DocxArticlePager({ content }: DocxArticlePagerProps) {
  const pages = useMemo(() => splitDocxArticlePages(content), [content]);
  const [pageIndex, setPageIndex] = useState(0);
  const readerRef = useRef<HTMLDivElement | null>(null);
  const pageCount = pages.length;
  const currentPage = Math.min(pageIndex, pageCount - 1);

  function goToPage(nextPage: number) {
    const clampedPage = Math.min(Math.max(nextPage, 0), pageCount - 1);
    setPageIndex(clampedPage);
    readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section ref={readerRef} className="docx-reader mx-auto mt-12 w-full max-w-4xl">
      <div className="mb-4 flex flex-col gap-3 border-y border-archive-line py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-archive-muted">
            DOCX 阅读
          </p>
          <p className="mt-1 text-sm text-archive-muted">
            第 {currentPage + 1} / {pageCount} 页
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="rounded-full border border-archive-line px-4 py-2 text-sm text-archive-ink transition hover:border-archive-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            上一页
          </button>
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= pageCount - 1}
            className="rounded-full bg-archive-ink px-4 py-2 text-sm text-archive-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      </div>

      <div className="docx-page border border-archive-line bg-archive-paper2 px-5 py-7 shadow-[0_20px_70px_rgb(var(--archive-shadow)/0.08)] sm:px-10 sm:py-10">
        <ArticleRenderer
          content={pages[currentPage] ?? ""}
          className="article-detail-body docx-page-body"
        />
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {pages.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToPage(index)}
            aria-current={index === currentPage ? "page" : undefined}
            className={cn(
              "h-9 min-w-9 rounded-full border px-3 text-sm transition",
              index === currentPage
                ? "border-archive-ink bg-archive-ink text-archive-paper"
                : "border-archive-line text-archive-muted hover:border-archive-ink hover:text-archive-ink"
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  );
}
