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
  parseGalleryImages,
  parseGalleryWatermark,
  serializeGalleryItem,
  stringifyGalleryImages,
  stringifyTags
} from "@/lib/content-serializers";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const row = await prisma.galleryItem.findUnique({
    where: { id: params.id }
  });

  if (!row) {
    return errorJson(uiText.apiMessages.workMissing, 404);
  }

  return okJson(serializeGalleryItem(row));
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = gallerySchema.partial().safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  try {
    const {
      date,
      images,
      showWatermark,
      tags,
      ...galleryData
    } = parsed.data;
    let serializedImages: string | undefined;

    if (images !== undefined || showWatermark !== undefined) {
      const current = await prisma.galleryItem.findUnique({
        where: { id: params.id },
        select: { images: true, src: true }
      });

      if (!current) {
        return errorJson(uiText.apiMessages.workMissing, 404);
      }

      serializedImages = stringifyGalleryImages(
        images ?? parseGalleryImages(current.images, current.src),
        showWatermark ?? parseGalleryWatermark(current.images)
      );
    }

    const row = await prisma.galleryItem.update({
      where: { id: params.id },
      data: {
        ...galleryData,
        date: date ? dateInputToDate(date) : undefined,
        tags: tags ? stringifyTags(tags) : undefined,
        images: serializedImages
      }
    });

    return okJson(serializeGalleryItem(row));
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

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  await prisma.galleryItem.delete({
    where: { id: params.id }
  });

  return okJson({ id: params.id });
}
