import { prisma } from "@/lib/db";
import { dateToInput, parseTags } from "@/lib/content-serializers";
import { normalizeArticleCategory } from "@/lib/article-categories";
import {
  defaultCoverKeyForArticleCategory,
  getDefaultCoverMap
} from "@/lib/default-covers";

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  summary: string;
  cover?: string;
  featured?: boolean;
};

export type Article = ArticleMeta & {
  content: string;
};

export function formatArticleCategory(category: string) {
  return normalizeArticleCategory(category);
}

export async function getAllArticles() {
  const [rows, defaultCovers] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { date: "desc" }, { updatedAt: "desc" }]
    }),
    getDefaultCoverMap()
  ]);

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    date: dateToInput(row.date),
    category: row.category,
    tags: parseTags(row.tags),
    summary: row.summary,
    cover:
      row.cover ??
      defaultCovers[defaultCoverKeyForArticleCategory(row.category)] ??
      undefined,
    featured: row.featured
  }));
}

export async function getAllArticleCategories() {
  const articles = await getAllArticles();

  return Array.from(new Set(articles.map((article) => article.category)));
}

export async function getArticleSlugs() {
  const rows = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true }
  });

  return rows.map((row) => row.slug);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const [row, defaultCovers] = await Promise.all([
    prisma.article.findFirst({
      where: {
        slug,
        published: true
      }
    }),
    getDefaultCoverMap()
  ]);

  if (!row) {
    return null;
  }

  return {
    slug: row.slug,
    title: row.title,
    date: dateToInput(row.date),
    category: row.category,
    tags: parseTags(row.tags),
    summary: row.summary,
    cover:
      row.cover ??
      defaultCovers[defaultCoverKeyForArticleCategory(row.category)] ??
      undefined,
    featured: row.featured,
    content: row.content
  };
}
