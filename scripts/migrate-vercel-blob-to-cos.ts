import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { saveUploadBuffer, type UploadKind } from "../lib/storage";

loadEnvConfig(process.cwd());

const vercelBlobHostPattern = /\.public\.blob\.vercel-storage\.com$/i;
const dryRun = !process.argv.includes("--commit");
const onlyVideos = process.argv.includes("--videos-only");

type ReplacementMap = Map<string, string>;

type MediaReference = {
  url: string;
  source: string;
};

const prisma = new PrismaClient({ log: ["error", "warn"] });

function isVercelBlobUrl(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("https://")) {
    return false;
  }

  try {
    return vercelBlobHostPattern.test(new URL(value).host);
  } catch {
    return false;
  }
}

function extractUrls(value: unknown) {
  if (typeof value !== "string") {
    return [];
  }

  return value.match(/https:\/\/[^\s"'`)<>]+/g)?.filter(isVercelBlobUrl) ?? [];
}

function parseJsonArray(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function inferKind(url: string, contentType?: string): UploadKind {
  if (contentType?.startsWith("video/") || url.includes("/uploads/videos/")) {
    return "video";
  }

  return "image";
}

function inferFileName(url: string, contentType?: string) {
  const pathname = new URL(url).pathname;
  const baseName = path.basename(decodeURIComponent(pathname));

  if (path.extname(baseName)) {
    return baseName;
  }

  if (contentType?.startsWith("video/")) {
    return `${baseName || "migrated-video"}.mp4`;
  }

  if (contentType === "image/webp") {
    return `${baseName || "migrated-image"}.webp`;
  }

  if (contentType === "image/jpeg") {
    return `${baseName || "migrated-image"}.jpg`;
  }

  return `${baseName || "migrated-image"}.png`;
}

function replaceAll(value: string | null | undefined, replacements: ReplacementMap) {
  if (!value) {
    return value;
  }

  let nextValue = value;
  for (const [from, to] of Array.from(replacements.entries())) {
    nextValue = nextValue.split(from).join(to);
  }
  return nextValue;
}

function replaceJsonArray(value: string, replacements: ReplacementMap) {
  const items = parseJsonArray(value);
  const nextItems = items.map((item) =>
    typeof item === "string" ? replacements.get(item) ?? item : item
  );
  return JSON.stringify(nextItems);
}

async function collectReferences() {
  const references: MediaReference[] = [];
  const galleryItems = await prisma.galleryItem.findMany();
  const articles = await prisma.article.findMany();
  const updates = await prisma.dailyUpdate.findMany();

  for (const item of galleryItems) {
    const fields = [
      ["gallery.src", item.src],
      ["gallery.thumbnail", item.thumbnail],
      ...parseJsonArray(item.images).map((url, index) => [`gallery.images[${index}]`, url] as const)
    ] as const;

    for (const [source, value] of fields) {
      if (typeof value === "string" && isVercelBlobUrl(value)) {
        references.push({ url: value, source: `${source}:${item.slug}` });
      }
    }
  }

  for (const article of articles) {
    if (typeof article.cover === "string" && isVercelBlobUrl(article.cover)) {
      references.push({ url: article.cover, source: `article.cover:${article.slug}` });
    }

    for (const url of extractUrls(article.content)) {
      references.push({ url, source: `article.content:${article.slug}` });
    }
  }

  for (const update of updates) {
    if (typeof update.cover === "string" && isVercelBlobUrl(update.cover)) {
      references.push({ url: update.cover, source: `update.cover:${update.id}` });
    }
  }

  return references.filter((reference) => !onlyVideos || reference.url.includes("/uploads/videos/"));
}

async function migrateUrl(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed ${response.status}: ${url}`);
  }

  const contentType = response.headers.get("content-type") ?? undefined;
  const bytes = Buffer.from(await response.arrayBuffer());
  const kind = inferKind(url, contentType);
  const fileName = inferFileName(url, contentType);
  const uploaded = await saveUploadBuffer({ bytes, fileName, kind, type: contentType });

  return uploaded.url;
}

async function updateDatabase(replacements: ReplacementMap) {
  const galleryItems = await prisma.galleryItem.findMany();
  const articles = await prisma.article.findMany();
  const updates = await prisma.dailyUpdate.findMany();

  let changedRows = 0;

  for (const item of galleryItems) {
    const nextSrc = replaceAll(item.src, replacements);
    const nextThumbnail = replaceAll(item.thumbnail, replacements);
    const nextImages = replaceJsonArray(item.images, replacements);

    if (nextSrc !== item.src || nextThumbnail !== item.thumbnail || nextImages !== item.images) {
      await prisma.galleryItem.update({
        where: { id: item.id },
        data: {
          src: nextSrc ?? item.src,
          thumbnail: nextThumbnail,
          images: nextImages
        }
      });
      changedRows += 1;
    }
  }

  for (const article of articles) {
    const nextCover = replaceAll(article.cover, replacements);
    const nextContent = replaceAll(article.content, replacements);

    if (nextCover !== article.cover || nextContent !== article.content) {
      await prisma.article.update({
        where: { id: article.id },
        data: {
          cover: nextCover,
          content: nextContent ?? article.content
        }
      });
      changedRows += 1;
    }
  }

  for (const update of updates) {
    const nextCover = replaceAll(update.cover, replacements);

    if (nextCover !== update.cover) {
      await prisma.dailyUpdate.update({
        where: { id: update.id },
        data: { cover: nextCover }
      });
      changedRows += 1;
    }
  }

  return changedRows;
}

async function main() {
  if (!process.env.TENCENT_COS_BUCKET?.includes("delee-media-new")) {
    throw new Error("Refusing to migrate: TENCENT_COS_BUCKET must point to the new COS bucket.");
  }

  const references = await collectReferences();
  const uniqueUrls = Array.from(new Set(references.map((reference) => reference.url)));

  console.log(`Mode: ${dryRun ? "dry-run" : "commit"}`);
  console.log(`Scope: ${onlyVideos ? "videos only" : "all media"}`);
  console.log(`Found ${references.length} Vercel Blob references, ${uniqueUrls.length} unique files.`);

  for (const url of uniqueUrls) {
    const sources = references
      .filter((reference) => reference.url === url)
      .map((reference) => reference.source)
      .join(", ");
    console.log(`- ${url}`);
    console.log(`  used by: ${sources}`);
  }

  if (dryRun || uniqueUrls.length === 0) {
    return;
  }

  const replacements: ReplacementMap = new Map();

  for (let index = 0; index < uniqueUrls.length; index += 1) {
    const url = uniqueUrls[index];
    console.log(`[${index + 1}/${uniqueUrls.length}] Migrating ${url}`);
    const newUrl = await migrateUrl(url);
    replacements.set(url, newUrl);
    console.log(`  -> ${newUrl}`);
  }

  const changedRows = await updateDatabase(replacements);
  console.log(`Updated ${changedRows} database rows.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
