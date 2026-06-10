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

function isMissingSettingsTableError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  );
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
  const keys = defaultCoverKeys.map(settingKey);
  const covers = { ...fallbackDefaultCovers };
  let rows: Array<{ key: string; value: string }>;

  try {
    rows = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true }
    });
  } catch (error) {
    if (isMissingSettingsTableError(error)) {
      return covers;
    }

    throw error;
  }

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
  for (const key of defaultCoverKeys) {
    if (!(key in covers)) {
      continue;
    }

    const value = covers[key]?.trim();

    if (!value || value === fallbackDefaultCovers[key]) {
      await prisma.siteSetting.deleteMany({
        where: { key: settingKey(key) }
      });
      continue;
    }

    await prisma.siteSetting.upsert({
      where: { key: settingKey(key) },
      update: { value },
      create: { key: settingKey(key), value }
    });
  }

  return getDefaultCovers();
}
