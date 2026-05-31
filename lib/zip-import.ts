import path from "node:path";
import JSZip from "jszip";
import {
  getMarkdownImageReferences,
  isRelativeImagePath,
  parseMarkdownArticle,
  rewriteMarkdownImagePaths
} from "@/lib/markdown-import";
import { saveUploadBuffer } from "@/lib/storage";

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

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

async function saveImageFile(entry: ZipEntry) {
  if (!isImageFile(entry.normalizedName)) {
    throw new Error(`Unsupported image format in ZIP package: ${entry.name}`);
  }

  const bytes = await entry.file.async("nodebuffer");
  const result = await saveUploadBuffer({
    bytes,
    fileName: entry.normalizedName,
    kind: "image"
  });

  return result.url;
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
  const uploadedImages = new Map<string, string>();
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

    let uploadedUrl = uploadedImages.get(imageEntry.normalizedName);

    if (!uploadedUrl) {
      uploadedUrl = await saveImageFile(imageEntry);
      uploadedImages.set(imageEntry.normalizedName, uploadedUrl);
    }

    replacements.set(reference.url, uploadedUrl);
  }

  if (cover && isRelativeImagePath(cover)) {
    const coverPath = joinZipPath(markdownDirectory, normalizeRelativePath(cover));
    const coverEntry = entryByPath.get(coverPath);

    if (!coverEntry) {
      throw new Error(`Image not found in ZIP package: ${cover}`);
    }

    let uploadedUrl = uploadedImages.get(coverEntry.normalizedName);

    if (!uploadedUrl) {
      uploadedUrl = await saveImageFile(coverEntry);
      uploadedImages.set(coverEntry.normalizedName, uploadedUrl);
    }

    cover = uploadedUrl;
  }

  return {
    ...article,
    cover,
    content: rewriteMarkdownImagePaths(article.content, replacements),
    localImages: []
  };
}
