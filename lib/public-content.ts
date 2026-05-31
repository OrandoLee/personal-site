import { prisma } from "@/lib/db";
import {
  dateToInput,
  serializeGalleryItem
} from "@/lib/content-serializers";
import type { UpdateItem, UpdateType } from "@/data/updates";

type AutoUpdateSource = UpdateItem & {
  updatedAt: Date;
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
      updatedAt: item.updatedAt
    }))
  ];

  return updates
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map(({ updatedAt: _updatedAt, ...update }) => update);
}

export async function getPublicGalleryItems() {
  const rows = await prisma.galleryItem.findMany({
    where: { published: true },
    orderBy: [{ date: "desc" }, { updatedAt: "desc" }]
  });

  return rows.map(serializeGalleryItem);
}
