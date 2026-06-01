"use client";

import { useEffect, useRef } from "react";
import { uiText } from "@/content/uiText";
import type { GalleryItem } from "@/data/gallery";
import { galleryCategoryLabels } from "@/data/gallery";
import { formatDate } from "@/lib/format";

type GalleryCardProps = {
  item: GalleryItem;
  priority?: boolean;
  onPreview: (item: GalleryItem) => void;
};

export function GalleryCard({
  item,
  priority = false,
  onPreview
}: GalleryCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (item.type !== "video" || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    video.muted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.55 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [item.type]);

  return (
    <article
      id={item.id}
      className="group overflow-hidden rounded-3xl border border-archive-line bg-archive-paper2 transition duration-300 hover:-translate-y-0.5 hover:shadow-archive"
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b border-archive-line bg-archive-paper">
        {item.featured ? (
          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-archive-gold bg-archive-paper2/90 px-2.5 py-1 text-xs text-archive-gold shadow-sm">
            <span aria-hidden="true">★</span>
            置顶
          </span>
        ) : null}
        {item.type === "image" ? (
          <button
            type="button"
            onClick={() => onPreview(item)}
            className="h-full w-full cursor-zoom-in"
            aria-label={`${uiText.gallery.previewAriaPrefix}${item.title}`}
          >
            <img
              src={item.src}
              alt={item.title}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onPreview(item)}
            className="h-full w-full cursor-pointer"
            aria-label={`${uiText.gallery.previewAriaPrefix}${item.title}`}
          >
            <video
              ref={videoRef}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              src={item.src}
              poster={item.thumbnail}
              muted
              loop
              playsInline
              autoPlay={priority}
              preload={priority ? "auto" : "metadata"}
              onMouseEnter={(event) => {
                void event.currentTarget.play().catch(() => undefined);
              }}
            />
          </button>
        )}
      </div>

      <div className="grid gap-4 p-5">
        <div className="flex items-center justify-between gap-3 text-sm text-archive-muted">
          <time>{formatDate(item.date)}</time>
          <span>{galleryCategoryLabels[item.category]}</span>
        </div>
        <div>
          <h3 className="font-serif text-2xl font-semibold leading-tight text-archive-ink">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-archive-muted">
            {item.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-archive-line bg-archive-paper px-2.5 py-1 text-xs text-archive-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
