import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import {
  getMarkdownImageReferences,
  isRelativeImagePath,
  parseMarkdownArticle,
  rewriteMarkdownImagePaths
} from "@/lib/markdown-import";
import { slugify } from "@/lib/slug";

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
const uploadDirectory = path.join(process.cwd(), "public", "uploads", "images");
const uploadPublicPath = "/uploads/images";

type ZipEntry = {
  name: string;
  normalizedName: string;
  file: JSZip.JSZipObject;
};

function normalizeZipPath(value: string) {
  return value.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}

function normalizeRelativePath(value: string) {
  const withoutHash = value.split("#")[0]?.split("?")[0] ?? value;
  let decoded = withoutHash;

  try {
    decoded = decodeURIComponent(withoutHash);
  } catch {
    decoded = withoutHash;
  }

  return normalizeZipPath(decoded.replace(/^\.\//, ""));
}

function dirname(value: string) {
  const index = value.lastIndexOf("/");
  return index === -1 ? "" : value.slice(0, index);
}

function joinZipPath(base: string, relativePath: string) {
  const parts = [...base.split("/"), ...relativePath.split("/")].filter(Boolean);
  const output: string[] = [];

  for (const part of parts) {
    if (part === ".") {
      continue;
    }

    if (part === "..") {
      output.pop();
      continue;
    }

    output.push(part);
  }

  return output.join("/");
}

function isMarkdownFile(name: string) {
  return /\.(md|markdown)$/i.test(name);
}

function isImageFile(name: string) {
  return imageExtensions.has(path.extname(name).toLowerCase());
}

function chooseMarkdownEntry(entries: ZipEntry[]) {
  const markdownEntries = entries.filter((entry) => isMarkdownFile(entry.normalizedName));

  if (markdownEntries.length === 0) {
    throw new Error("No Markdown file found in ZIP package.");
  }

  if (markdownEntries.length === 1) {
    return markdownEntries[0];
  }

  const rootEntries = markdownEntries.filter(
    (entry) => !entry.normalizedName.includes("/")
  );

  if (rootEntries.length === 1) {
    return rootEntries[0];
  }

  const articleNamedEntries = markdownEntries.filter((entry) =>
    /(^|\/)article\.(md|markdown)$/i.test(entry.normalizedName)
  );

  if (articleNamedEntries.length === 1) {
    return articleNamedEntries[0];
  }

  throw new Error(
    "Multiple Markdown files found in ZIP package. Please keep one article Markdown file at the ZIP root."
  );
}

function createSafeUploadName(sourcePath: string) {
  const extension = path.extname(sourcePath).toLowerCase();
  const baseName = path.basename(sourcePath, extension);
  const safeBaseName = slugify(baseName) || "image";

  return `article-${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;
}

async function saveImageFile(entry: ZipEntry) {
  if (!isImageFile(entry.normalizedName)) {
    throw new Error(`Unsupported image format in ZIP package: ${entry.name}`);
  }

  await fs.mkdir(uploadDirectory, { recursive: true });

  const fileName = createSafeUploadName(entry.normalizedName);
  const diskPath = path.join(uploadDirectory, fileName);
  const bytes = await entry.file.async("nodebuffer");

  await fs.writeFile(diskPath, bytes);

  return `${uploadPublicPath}/${fileName}`;
}

export async function importMarkdownZipPackage(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = Object.values(zip.files)
    .filter((entry) => !entry.dir)
    .map((entry) => ({
      name: entry.name,
      normalizedName: normalizeZipPath(entry.name),
      file: entry
    }));
  const markdownEntry = chooseMarkdownEntry(entries);
  const markdownSource = await markdownEntry.file.async("text");
  const article = parseMarkdownArticle(markdownSource, path.basename(markdownEntry.name));
  const markdownDirectory = dirname(markdownEntry.normalizedName);
  const entryByPath = new Map(entries.map((entry) => [entry.normalizedName, entry]));
  const replacements = new Map<string, string>();
  let cover = article.cover;

  for (const reference of getMarkdownImageReferences(article.content)) {
    if (!isRelativeImagePath(reference.url)) {
      continue;
    }

    const imagePath = normalizeRelativePath(reference.url);
    const zipPath = joinZipPath(markdownDirectory, imagePath);
    const imageEntry = entryByPath.get(zipPath);

    if (!imageEntry) {
      throw new Error(`Image not found in ZIP package: ${reference.url}`);
    }

    replacements.set(reference.url, await saveImageFile(imageEntry));
  }

  if (cover && isRelativeImagePath(cover)) {
    const coverPath = joinZipPath(markdownDirectory, normalizeRelativePath(cover));
    const coverEntry = entryByPath.get(coverPath);

    if (!coverEntry) {
      throw new Error(`Image not found in ZIP package: ${cover}`);
    }

    cover = await saveImageFile(coverEntry);
  }

  return {
    ...article,
    cover,
    content: rewriteMarkdownImagePaths(article.content, replacements),
    localImages: []
  };
}
