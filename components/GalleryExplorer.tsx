"use client";

import { useEffect, useState } from "react";
import { GalleryCard } from "@/components/GalleryCard";
import { uiText } from "@/content/uiText";
import type { GalleryCategory, GalleryItem } from "@/data/gallery";
import { galleryCategoryLabels } from "@/data/gallery";
import { cn } from "@/lib/classNames";

type GalleryExplorerProps = {
  items: GalleryItem[];
};

const allCategory = "all";

export function GalleryExplorer({ items }: GalleryExplorerProps) {
  const [activeCategory, setActiveCategory] =
    useState<GalleryCategory | typeof allCategory>(allCategory);
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const categories = [
    allCategory,
    ...Array.from(new Set(items.map((item) => item.category)))
  ] as Array<GalleryCategory | typeof allCategory>;
  const filteredItems =
    activeCategory === allCategory
      ? items
      : items.filter((item) => item.category === activeCategory);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreview(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              activeCategory === category
                ? "border-archive-ink bg-archive-ink text-archive-paper2"
                : "border-archive-line bg-archive-paper2 text-archive-muted hover:border-archive-ink hover:text-archive-ink"
            )}
          >
            {galleryCategoryLabels[category]}
          </button>
        ))}
      </div>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item, index) => (
          <GalleryCard
            key={item.id}
            item={item}
            priority={index < 2}
            onPreview={setPreview}
          />
        ))}
      </section>

      {preview ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-archive-ink/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${uiText.gallery.previewAriaPrefix}${preview.title}`}
          onClick={() => setPreview(null)}
        >
          <div
            className="max-h-[88vh] w-full max-w-5xl rounded-3xl border border-archive-line bg-archive-paper2 p-3 shadow-archive"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={preview.src}
              alt={preview.title}
              className="max-h-[72vh] w-full object-contain"
            />
            <div className="flex flex-col gap-3 border-t border-archive-line p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-archive-ink">
                  {preview.title}
                </h2>
                <p className="mt-1 text-sm text-archive-muted">
                  {preview.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-full border border-archive-line px-4 py-2 text-sm text-archive-muted transition hover:border-archive-ink hover:text-archive-ink"
              >
                {uiText.gallery.closePreview}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
