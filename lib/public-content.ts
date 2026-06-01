import { prisma } from "@/lib/db";
import {
  dateToInput,
  serializeGalleryItem
} from "@/lib/content-serializers";
import type { UpdateItem, UpdateType } from "@/data/updates";

type AutoUpdateSource = UpdateItem & {
  updatedAt: Date;
  featuredRank: number;
};

function galleryUpdateType(type: string): UpdateType {
  return type === "video" ? "video" : "image";
}

export async function getPublicUpdates() {
  const [articles, galleryItems] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
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
    })
  ]);

  const updates: AutoUpdateSource[] = [
    ...articles.map((article) => ({
      id: `article-${article.id}`,
      title: article.title,
      type: "article" as const,
      date: dateToInput(article.updatedAt),
      description: article.summary,
      cover: article.cover ?? undefined,
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
      cover: item.thumbnail ?? (item.type === "image" ? item.src : undefined),
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
  const rows = await prisma.galleryItem.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { date: "desc" }, { updatedAt: "desc" }]
  });

  return rows.map(serializeGalleryItem);
}
