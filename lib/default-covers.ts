import { Prisma } from "@prisma/client";
import type { ArticleCategory } from "@/lib/article-categories";
import { normalizeArticleCategory } from "@/lib/article-categories";
import { prisma } from "@/lib/db";

export const defaultCoverKeys = [
  "article",
  "essay",
  "announcement",
  "video"
] as const;

export type DefaultCoverKey = (typeof defaultCoverKeys)[number];

export type DefaultCover = {
  key: DefaultCoverKey;
  label: string;
  fallbackUrl: string;
  url: string;
  isCustom: boolean;
};

const settingPrefix = "defaultCover:";

export const fallbackDefaultCovers: Record<DefaultCoverKey, string> = {
  article: "/images/default-covers/article.png",
  essay: "/images/default-covers/essay.png",
  announcement: "/images/default-covers/announcement.png",
  video: "/images/default-covers/video.png"
};

export const defaultCoverLabels: Record<DefaultCoverKey, string> = {
  article: "文章",
  essay: "随笔",
  announcement: "公告",
  video: "视频"
};

function settingKey(key: DefaultCoverKey) {
  return `${settingPrefix}${key}`;
}

function isDefaultCoverKey(value: string): value is DefaultCoverKey {
  return (defaultCoverKeys as readonly string[]).includes(value);
}

function keyFromSetting(value: string): DefaultCoverKey | null {
  const key = value.startsWith(settingPrefix)
    ? value.slice(settingPrefix.length)
    : value;

  return isDefaultCoverKey(key) ? key : null;
}

async function ensureSettingsTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "SiteSetting" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

export function defaultCoverKeyForArticleCategory(
  category: string
): Exclude<DefaultCoverKey, "video"> {
  const normalized = normalizeArticleCategory(category) as ArticleCategory;

  if (normalized === "随笔") {
    return "essay";
  }

  if (normalized === "公告") {
    return "announcement";
  }

  return "article";
}

export async function getDefaultCoverMap() {
  await ensureSettingsTable();

  const keys = defaultCoverKeys.map(settingKey);
  const rows = await prisma.$queryRaw<Array<{ key: string; value: string }>>(
    Prisma.sql`
      SELECT "key", "value"
      FROM "SiteSetting"
      WHERE "key" IN (${Prisma.join(keys)})
    `
  );
  const covers = { ...fallbackDefaultCovers };

  for (const row of rows) {
    const key = keyFromSetting(row.key);

    if (key && row.value.trim()) {
      covers[key] = row.value.trim();
    }
  }

  return covers;
}

export async function getDefaultCovers(): Promise<DefaultCover[]> {
  const covers = await getDefaultCoverMap();

  return defaultCoverKeys.map((key) => ({
    key,
    label: defaultCoverLabels[key],
    fallbackUrl: fallbackDefaultCovers[key],
    url: covers[key],
    isCustom: covers[key] !== fallbackDefaultCovers[key]
  }));
}

export async function setDefaultCoverOverrides(
  covers: Partial<Record<DefaultCoverKey, string | null>>
) {
  await ensureSettingsTable();

  for (const key of defaultCoverKeys) {
    if (!(key in covers)) {
      continue;
    }

    const value = covers[key]?.trim();

    if (!value || value === fallbackDefaultCovers[key]) {
      await prisma.$executeRaw`
        DELETE FROM "SiteSetting"
        WHERE "key" = ${settingKey(key)}
      `;
      continue;
    }

    await prisma.$executeRaw`
      INSERT INTO "SiteSetting" ("key", "value", "updatedAt")
      VALUES (${settingKey(key)}, ${value}, now())
      ON CONFLICT ("key")
      DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now()
    `;
  }

  return getDefaultCovers();
}
