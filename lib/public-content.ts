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
  createdAt: Date;
  featuredRank: number;
};

function logPublicReadError(scope: string, error: unknown) {
  console.error(`[public-content] ${scope} failed`, error);
}

function galleryUpdateType(type: string): UpdateType {
  return type === "video" ? "video" : "image";
}

export async function getPublicUpdates() {
  try {
    const [articles, galleryItems, defaultCovers] = await Promise.all([
      prisma.article.findMany({
        where: { published: true },
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          summary: true,
          cover: true,
          featured: true,
          createdAt: true
        }
      }),
      prisma.galleryItem.findMany({
        where: { published: true },
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          src: true,
          thumbnail: true,
          description: true,
          featured: true,
          createdAt: true
        }
      }),
      getDefaultCoverMap()
    ]);

    const updates: AutoUpdateSource[] = [
      ...articles.map((article) => ({
        id: `article-${article.id}`,
        title: article.title,
        type: "article" as const,
        date: dateToInput(article.createdAt),
        description: article.summary,
        cover:
          article.cover ??
          defaultCovers[defaultCoverKeyForArticleCategory(article.category)] ??
          undefined,
        link: `/articles/${article.slug}`,
        featured: article.featured,
        featuredRank: article.featured ? 1 : 0,
        createdAt: article.createdAt
      })),
      ...galleryItems.map((item) => ({
        id: `gallery-${item.id}`,
        title: item.title,
        type: galleryUpdateType(item.type),
        date: dateToInput(item.createdAt),
        description: item.description,
        cover:
          item.thumbnail ??
          (item.type === "video" ? defaultCovers.video : item.src || undefined),
        link: `/gallery#${item.slug}`,
        featured: item.featured,
        featuredRank: item.featured ? 1 : 0,
        createdAt: item.createdAt
      }))
    ];

    return updates
      .sort((a, b) => {
        if (a.featuredRank !== b.featuredRank) {
          return b.featuredRank - a.featuredRank;
        }

        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .map(({ createdAt: _createdAt, featuredRank: _featuredRank, ...update }) => update);
  } catch (error) {
    logPublicReadError("updates", error);
    return [];
  }
}

export async function getPublicGalleryItems() {
  try {
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
  } catch (error) {
    logPublicReadError("gallery", error);
    return [];
  }
}

export async function getPublicLabProjects(category?: string) {
  try {
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
  } catch (error) {
    logPublicReadError("lab projects", error);
    return [];
  }
}

export async function getPublicLabProjectBySlug(slug: string) {
  try {
    const row = await prisma.labProject.findUnique({
      where: { slug }
    });

    if (!row || !row.isPublished) {
      return null;
    }

    return enrichLabProjectWithGitHubTimes(serializeLabProject(row));
  } catch (error) {
    logPublicReadError(`lab project ${slug}`, error);
    return null;
  }
}
