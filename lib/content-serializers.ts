import type {
  Article as DbArticle,
  DailyUpdate as DbDailyUpdate,
  GalleryItem as DbGalleryItem,
  OraskMessage as DbOraskMessage
} from "@prisma/client";
import type { UpdateItem, UpdateType } from "@/data/updates";
import type {
  GalleryCategory,
  GalleryItem,
  GalleryItemType
} from "@/data/gallery";
import type { ArticleMeta } from "@/lib/articles";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

export function dateInputToDate(date: string) {
  return new Date(`${date}T00:00:00.000+08:00`);
}

export function dateToInput(date: Date) {
  const parts = dateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

export function parseTags(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.map((tag) => String(tag)).filter(Boolean)
      : [];
  } catch {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}

export function stringifyTags(tags: string[]) {
  return JSON.stringify(
    tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)
  );
}

type GalleryImagesPayload = {
  urls?: unknown;
  showWatermark?: unknown;
};

export function parseGalleryImages(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback ? [fallback] : [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      const images = parsed.map((url) => String(url).trim()).filter(Boolean);
      return images.length > 0 ? images : fallback ? [fallback] : [];
    }

    if (parsed && typeof parsed === "object") {
      const payload = parsed as GalleryImagesPayload;
      const images = Array.isArray(payload.urls)
        ? payload.urls.map((url) => String(url).trim()).filter(Boolean)
        : [];

      return images.length > 0 ? images : fallback ? [fallback] : [];
    }
  } catch {
    const images = value
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    return images.length > 0 ? images : fallback ? [fallback] : [];
  }

  return fallback ? [fallback] : [];
}

export function parseGalleryWatermark(value: string | null | undefined) {
  if (!value) {
    return true;
  }

  try {
    const parsed = JSON.parse(value);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return (parsed as GalleryImagesPayload).showWatermark !== false;
    }
  } catch {
    return true;
  }

  return true;
}

export function stringifyGalleryImages(
  images: string[],
  showWatermark = true
) {
  return JSON.stringify({
    urls: images.map((url) => url.trim()).filter((url) => url.length > 0),
    showWatermark
  });
}

export function serializeDailyUpdate(row: DbDailyUpdate): UpdateItem & {
  published: boolean;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: row.id,
    title: row.title,
    type: row.type as UpdateType,
    date: dateToInput(row.date),
    description: row.description,
    cover: row.cover ?? undefined,
    link: row.link ?? undefined,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function serializeArticle(row: DbArticle): ArticleMeta & {
  id: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: dateToInput(row.date),
    category: row.category,
    tags: parseTags(row.tags),
    summary: row.summary,
    cover: row.cover ?? undefined,
    content: row.content,
    published: row.published,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function serializeGalleryItem(row: DbGalleryItem): GalleryItem & {
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type as GalleryItemType,
    src: row.src,
    images: parseGalleryImages(row.images, row.src),
    thumbnail: row.thumbnail ?? undefined,
    date: dateToInput(row.date),
    description: row.description,
    tags: parseTags(row.tags),
    category: row.category as GalleryCategory,
    published: row.published,
    featured: row.featured,
    showWatermark: parseGalleryWatermark(row.images),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function serializeOraskMessage(row: DbOraskMessage) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    source: row.source,
    read: row.read,
    createdAt: row.createdAt.toISOString()
  };
}
