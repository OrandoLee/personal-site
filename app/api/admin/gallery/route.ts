import { Prisma } from "@prisma/client";
import { uiText } from "@/content/uiText";
import { gallerySchema } from "@/lib/admin-schemas";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import {
  errorJson,
  okJson,
  readJson,
  zodErrorMessage
} from "@/lib/api-utils";
import {
  dateInputToDate,
  serializeGalleryItem,
  stringifyGalleryImages,
  stringifyTags
} from "@/lib/content-serializers";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();
  const category = url.searchParams.get("category")?.trim();
  const where: Prisma.GalleryItemWhereInput = {
    ...(category && category !== "all" ? { category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { slug: { contains: search } },
            { description: { contains: search } },
            { category: { contains: search } },
            { tags: { contains: search } }
          ]
        }
      : {})
  };
  const rows = await prisma.galleryItem.findMany({
    where,
    orderBy: [{ featured: "desc" }, { date: "desc" }, { updatedAt: "desc" }]
  });

  return okJson(rows.map(serializeGalleryItem));
}

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = gallerySchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  try {
    const row = await prisma.galleryItem.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        type: parsed.data.type,
        src: parsed.data.src,
        images: stringifyGalleryImages(parsed.data.images),
        thumbnail: parsed.data.thumbnail,
        date: dateInputToDate(parsed.data.date),
        description: parsed.data.description,
        tags: stringifyTags(parsed.data.tags),
        category: parsed.data.category,
        published: parsed.data.published,
        featured: parsed.data.featured
      }
    });

    return okJson(serializeGalleryItem(row), { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorJson(uiText.apiMessages.duplicateSlug, 409);
    }

    throw error;
  }
}
