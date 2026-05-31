"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GalleryCard } from "@/components/GalleryCard";
import { uiText } from "@/content/uiText";
import type { GalleryCategory, GalleryItem } from "@/data/gallery";
import { galleryCategoryLabels } from "@/data/gallery";
import { cn } from "@/lib/classNames";

type GalleryExplorerProps = {
  items: GalleryItem[];
};

const allCategory = "all";
const closeAnimationMs = 180;

export function GalleryExplorer({ items }: GalleryExplorerProps) {
  const [activeCategory, setActiveCategory] =
    useState<GalleryCategory | typeof allCategory>(allCategory);
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const categories = [
    allCategory,
    ...Array.from(new Set(items.map((item) => item.category)))
  ] as Array<GalleryCategory | typeof allCategory>;
  const filteredItems =
    activeCategory === allCategory
      ? items
      : items.filter((item) => item.category === activeCategory);

  const openPreview = useCallback((item: GalleryItem) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setPreview(item);
    window.requestAnimationFrame(() => setIsPreviewOpen(true));
  }, []);

  const stopModalVideo = useCallback(() => {
    const video = modalVideoRef.current;

    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
    video.load();
  }, []);

  const closePreview = useCallback(() => {
    stopModalVideo();
    setIsPreviewOpen(false);

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setPreview(null);
      closeTimerRef.current = null;
    }, closeAnimationMs);
  }, [stopModalVideo]);

  useEffect(() => {
    if (!preview) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePreview();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closePreview, preview]);

  useEffect(() => {
    if (!preview) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [preview]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }

      stopModalVideo();
    };
  }, [stopModalVideo]);

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
            onPreview={openPreview}
          />
        ))}
      </section>

      {preview ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${uiText.gallery.previewAriaPrefix}${preview.title}`}
          onClick={closePreview}
          data-state={isPreviewOpen ? "open" : "closed"}
          className="gallery-lightbox fixed inset-0 z-[80] grid place-items-center bg-black/72 p-4 backdrop-blur-sm"
        >
          <div
            className="gallery-lightbox__panel max-h-[88vh] w-full max-w-5xl rounded-3xl border border-archive-line bg-archive-paper2 p-3 shadow-archive"
            onClick={(event) => event.stopPropagation()}
          >
            {preview.type === "video" ? (
              <video
                key={preview.src}
                ref={modalVideoRef}
                src={preview.src}
                poster={preview.thumbnail}
                className="max-h-[72vh] w-full rounded-2xl bg-black object-contain"
                controls
                autoPlay
                loop
                playsInline
                onClick={(event) => event.stopPropagation()}
              />
            ) : (
              <img
                src={preview.src}
                alt={preview.title}
                className="max-h-[72vh] w-full object-contain"
              />
            )}
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
                onClick={closePreview}
                className="min-h-11 rounded-full border border-archive-line px-5 py-2 text-sm text-archive-muted transition hover:border-archive-ink hover:text-archive-ink"
              >
                {uiText.gallery.closePreview}
              </button>
            </div>
          </div>
          <style jsx>{`
            .gallery-lightbox {
              opacity: 0;
              transition: opacity 180ms ease;
            }

            .gallery-lightbox[data-state="open"] {
              opacity: 1;
            }

            .gallery-lightbox__panel {
              opacity: 0;
              transform: translateY(8px) scale(0.975);
              transition:
                opacity 180ms ease,
                transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
            }

            .gallery-lightbox[data-state="open"] .gallery-lightbox__panel {
              opacity: 1;
              transform: translateY(0) scale(1);
            }

            @media (prefers-reduced-motion: reduce) {
              .gallery-lightbox,
              .gallery-lightbox__panel {
                transition: none;
              }
            }
          `}</style>
        </div>
      ) : null}
    </>
  );
}
