import { prisma } from "@/lib/db";
import {
  dateToInput,
  serializeGalleryItem,
  serializeLabProject
} from "@/lib/content-serializers";
import { enrichLabProjectWithGitHubTimes, enrichLabProjectsWithGitHubTimes } from "@/lib/lab-project-enrichment";
import type { UpdateItem, UpdateType } from "@/data/updates";
import {
  defaultCoverKeyForArticleCategory,
  getDefaultCoverMap
} from "@/lib/default-covers";

type AutoUpdateSource = UpdateItem & {
  updatedAt: Date;
  featuredRank: number;
};

function galleryUpdateType(type: string): UpdateType {
  return type === "video" ? "video" : "image";
}

export async function getPublicUpdates() {
  const [articles, galleryItems, defaultCovers] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        summary: true,
        cover: true,
        featured: true,
        updatedAt: true
      }
    }),
    prisma.galleryItem.findMany({
      where: { published: true },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        src: true,
        thumbnail: true,
        description: true,
        featured: true,
        updatedAt: true
      }
    }),
    getDefaultCoverMap()
  ]);

  const updates: AutoUpdateSource[] = [
    ...articles.map((article) => ({
      id: `article-${article.id}`,
      title: article.title,
      type: "article" as const,
      date: dateToInput(article.updatedAt),
      description: article.summary,
      cover:
        article.cover ??
        defaultCovers[defaultCoverKeyForArticleCategory(article.category)] ??
        undefined,
      link: `/articles/${article.slug}`,
      featured: article.featured,
      featuredRank: article.featured ? 1 : 0,
      updatedAt: article.updatedAt
    })),
    ...galleryItems.map((item) => ({
      id: `gallery-${item.id}`,
      title: item.title,
      type: galleryUpdateType(item.type),
      date: dateToInput(item.updatedAt),
      description: item.description,
      cover:
        item.thumbnail ??
        (item.type === "video" ? defaultCovers.video : item.src || undefined),
      link: `/gallery#${item.slug}`,
      featured: item.featured,
      featuredRank: item.featured ? 1 : 0,
      updatedAt: item.updatedAt
    }))
  ];

  return updates
    .sort((a, b) => {
      if (a.featuredRank !== b.featuredRank) {
        return b.featuredRank - a.featuredRank;
      }

      return b.updatedAt.getTime() - a.updatedAt.getTime();
    })
    .map(({ updatedAt: _updatedAt, featuredRank: _featuredRank, ...update }) => update);
}

export async function getPublicGalleryItems() {
  const [rows, defaultCovers] = await Promise.all([
    prisma.galleryItem.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { date: "desc" }, { updatedAt: "desc" }]
    }),
    getDefaultCoverMap()
  ]);

  return rows.map((row) => {
    const item = serializeGalleryItem(row);

    return row.type === "video" && !row.thumbnail
      ? { ...item, thumbnail: defaultCovers.video }
      : item;
  });
}

export async function getPublicLabProjects(category?: string) {
  const rows = await prisma.labProject.findMany({
    where: {
      isPublished: true,
      ...(category && category !== "all" ? { categoryKey: category } : {})
    },
    orderBy: [
      { sortOrder: "asc" },
      { updatedAt: "desc" },
      { createdAt: "desc" }
    ]
  });

  const projects = rows.map(serializeLabProject);

  return enrichLabProjectsWithGitHubTimes(projects);
}

export async function getPublicLabProjectBySlug(slug: string) {
  const row = await prisma.labProject.findUnique({
    where: { slug }
  });

  if (!row || !row.isPublished) {
    return null;
  }

  return enrichLabProjectWithGitHubTimes(serializeLabProject(row));
}
