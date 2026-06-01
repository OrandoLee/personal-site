"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GalleryCard } from "@/components/GalleryCard";
import { WatermarkedImage } from "@/components/WatermarkedImage";
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
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [imageDirection, setImageDirection] = useState<"next" | "previous">("next");
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
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

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  const openPreview = useCallback((item: GalleryItem) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setPreview(item);
    setPreviewImageIndex(0);
    setImageDirection("next");
    window.requestAnimationFrame(() => setIsPreviewOpen(true));
  }, []);

  const showPreviewMedia = useCallback(
    (nextIndex: number) => {
      if (!preview) {
        return;
      }

      const media = preview.images?.length ? preview.images : [preview.src];
      const boundedIndex = (nextIndex + media.length) % media.length;
      setImageDirection(nextIndex > previewImageIndex ? "next" : "previous");
      setPreviewImageIndex(boundedIndex);
    },
    [preview, previewImageIndex]
  );

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

  const previewMedia = preview
    ? preview.images?.length
      ? preview.images
      : [preview.src]
    : [];
  const activePreviewMedia = previewMedia[previewImageIndex] ?? preview?.src ?? "";

  const previewLightbox =
    preview && portalRoot
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${uiText.gallery.previewAriaPrefix}${preview.title}`}
            onClick={closePreview}
            data-state={isPreviewOpen ? "open" : "closed"}
            className="gallery-lightbox fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/72 p-3 backdrop-blur-sm sm:p-4"
          >
            <div
              className="gallery-lightbox__panel flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-archive-line bg-archive-paper2 p-2 shadow-archive sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-3"
              onClick={(event) => event.stopPropagation()}
            >
              {preview.type === "video" ? (
                <video
                  key={activePreviewMedia}
                  ref={modalVideoRef}
                  src={activePreviewMedia}
                  poster={preview.thumbnail}
                  className="gallery-lightbox__media w-full rounded-xl bg-black object-contain sm:rounded-2xl"
                  controls
                  autoPlay
                  loop
                  playsInline
                  onClick={(event) => event.stopPropagation()}
                />
              ) : (
                <div className="relative flex justify-center">
                  <WatermarkedImage
                    key={activePreviewMedia}
                    src={activePreviewMedia}
                    alt={preview.title}
                    data-direction={imageDirection}
                    wrapperClassName="gallery-lightbox__image-frame"
                    watermarkClassName="site-photo-watermark--large"
                    className="gallery-lightbox__media gallery-lightbox__image max-w-full object-contain"
                  />
                  {previewMedia.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => showPreviewMedia(previewImageIndex - 1)}
                        className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-archive-line bg-archive-paper2/90 text-xl text-archive-ink shadow-sm transition hover:border-archive-ink"
                        aria-label="上一张"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => showPreviewMedia(previewImageIndex + 1)}
                        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-archive-line bg-archive-paper2/90 text-xl text-archive-ink shadow-sm transition hover:border-archive-ink"
                        aria-label="下一张"
                      >
                        ›
                      </button>
                    </>
                  ) : null}
                </div>
              )}
              {previewMedia.length > 1 ? (
                <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-archive-line px-3 py-2">
                  {previewMedia.map((media, index) => (
                    <button
                      key={`${media}-${index}`}
                      type="button"
                      onClick={() => showPreviewMedia(index)}
                      className={cn(
                        "h-14 w-20 shrink-0 overflow-hidden rounded-xl border transition",
                        index === previewImageIndex
                          ? "border-archive-ink"
                          : "border-archive-line opacity-70 hover:opacity-100"
                      )}
                      aria-label={`查看第 ${index + 1} 张`}
                    >
                      {preview.type === "video" ? (
                        <video
                          src={media}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={media}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex shrink-0 flex-col gap-3 border-t border-archive-line p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="min-w-0">
                  <h2 className="break-words font-serif text-xl font-semibold text-archive-ink sm:text-2xl">
                    {preview.title}
                  </h2>
                  <p className="mt-1 break-words text-sm text-archive-muted">
                    {preview.description}
                  </p>
                  {previewMedia.length > 1 ? (
                    <p className="mt-2 text-xs text-archive-muted">
                      {previewImageIndex + 1} / {previewMedia.length}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={closePreview}
                  className="min-h-11 shrink-0 rounded-full border border-archive-line px-5 py-2 text-sm text-archive-muted transition hover:border-archive-ink hover:text-archive-ink"
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

              .gallery-lightbox__media {
                display: block;
                max-height: min(72vh, calc(100dvh - 10.5rem));
              }

              .gallery-lightbox__image {
                animation: gallery-image-next 240ms ease both;
              }

              .gallery-lightbox__image[data-direction="previous"] {
                animation-name: gallery-image-previous;
              }

              @keyframes gallery-image-next {
                from {
                  opacity: 0;
                  transform: translateX(18px) scale(0.99);
                }

                to {
                  opacity: 1;
                  transform: translateX(0) scale(1);
                }
              }

              @keyframes gallery-image-previous {
                from {
                  opacity: 0;
                  transform: translateX(-18px) scale(0.99);
                }

                to {
                  opacity: 1;
                  transform: translateX(0) scale(1);
                }
              }

              @media (max-width: 640px) {
                .gallery-lightbox__media {
                  max-height: calc(100dvh - 12.5rem);
                }
              }

              @media (prefers-reduced-motion: reduce) {
              .gallery-lightbox,
              .gallery-lightbox__panel,
              .gallery-lightbox__image {
                transition: none;
                animation: none;
              }
            }
            `}</style>
          </div>,
          portalRoot
        )
      : null;

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

      {previewLightbox}
    </>
  );
}
