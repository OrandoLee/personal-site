import matter from "gray-matter";
import { normalizeArticleCategory } from "@/lib/article-categories";
import { slugify } from "@/lib/slug";

export type ImportedMarkdownArticle = {
  title: string;
  slug: string;
  date: string;
  category: string;
  tags: string[];
  summary: string;
  cover: string;
  content: string;
  published: boolean;
  localImages: string[];
};

export type MarkdownImageReference = {
  raw: string;
  alt: string;
  url: string;
  suffix: string;
};

const markdownImagePattern =
  /!\[([^\]]*)]\(\s*([^)\s]+)(\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;

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

function normalizeDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return todayInput();
}

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,，\n]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~\-|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(content: string) {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? "";
}

function excerpt(content: string) {
  const plain = stripMarkdown(content);
  if (plain.length <= 160) {
    return plain;
  }

  return `${plain.slice(0, 150).trim()}...`;
}

export function isRemoteImagePath(url: string) {
  return /^https?:\/\//i.test(url);
}

export function isLegacyUploadPath(url: string) {
  return url.startsWith("/uploads/images/") || url.startsWith("/uploads/videos/");
}

export function isRelativeImagePath(url: string) {
  return (
    !isRemoteImagePath(url) &&
    !isLegacyUploadPath(url) &&
    !url.startsWith("/") &&
    !url.startsWith("#") &&
    !url.startsWith("data:")
  );
}

export function getMarkdownImageReferences(content: string) {
  return Array.from(content.matchAll(markdownImagePattern)).map((match) => ({
    raw: match[0],
    alt: match[1] ?? "",
    url: match[2] ?? "",
    suffix: match[3] ?? ""
  }));
}

export function getLocalMarkdownImages(content: string) {
  return getMarkdownImageReferences(content)
    .map((reference) => reference.url)
    .filter(isRelativeImagePath);
}

export function rewriteMarkdownImagePaths(
  content: string,
  replacements: Map<string, string>
) {
  return content.replace(markdownImagePattern, (raw, alt, url, suffix = "") => {
    const replacement = replacements.get(String(url));

    if (!replacement) {
      return raw;
    }

    return `![${alt}](${replacement}${suffix})`;
  });
}

export function parseMarkdownArticle(source: string, fileName = "article.md") {
  const parsed = matter(source);
  const data = parsed.data as Record<string, unknown>;
  const content = parsed.content.trim();
  const fallbackTitle =
    extractTitle(content) || fileName.replace(/\.(md|markdown)$/i, "");
  const title =
    typeof data.title === "string" && data.title.trim()
      ? data.title.trim()
      : fallbackTitle;
  const slugSource =
    typeof data.slug === "string" && data.slug.trim() ? data.slug : title;

  return {
    title,
    slug: slugify(slugSource) || `article-${Date.now()}`,
    date: normalizeDate(data.date),
    category: normalizeArticleCategory(
      typeof data.category === "string" ? data.category.trim() : ""
    ),
    tags: normalizeTags(data.tags),
    summary: "",
    cover:
      typeof data.coverImage === "string"
        ? data.coverImage.trim()
        : typeof data.cover === "string"
          ? data.cover.trim()
          : "",
    content,
    published: typeof data.published === "boolean" ? data.published : false,
    localImages: getLocalMarkdownImages(content)
  } satisfies ImportedMarkdownArticle;
}
