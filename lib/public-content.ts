import { prisma } from "@/lib/db";
import {
  serializeDailyUpdate,
  serializeGalleryItem
} from "@/lib/content-serializers";

export async function getPublicUpdates() {
  const rows = await prisma.dailyUpdate.findMany({
    where: { published: true },
    orderBy: [{ date: "desc" }, { updatedAt: "desc" }]
  });

  return rows.map(serializeDailyUpdate);
}

export async function getPublicGalleryItems() {
  const rows = await prisma.galleryItem.findMany({
    where: { published: true },
    orderBy: [{ date: "desc" }, { updatedAt: "desc" }]
  });

  return rows.map(serializeGalleryItem);
}
