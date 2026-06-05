import { Prisma } from "@prisma/client";
import { articleCollectionSchema } from "@/lib/admin-schemas";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import {
  errorJson,
  okJson,
  readJson,
  zodErrorMessage
} from "@/lib/api-utils";
import { serializeArticleCollection } from "@/lib/content-serializers";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

function itemWrites(articleIds: string[]) {
  return articleIds.map((articleId, index) => ({
    articleId,
    sortOrder: (index + 1) * 10
  }));
}

async function findCollection(id: string) {
  return prisma.articleCollection.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: { article: true }
      }
    }
  });
}

export async function GET(_request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const row = await findCollection(params.id);

  if (!row) {
    return errorJson("合集不存在。", 404);
  }

  return okJson(serializeArticleCollection(row));
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = articleCollectionSchema.partial().safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  try {
    const { articleIds, ...collection } = parsed.data;
    const row = await prisma.articleCollection.update({
      where: { id: params.id },
      data: {
        ...collection,
        ...(articleIds
          ? {
              items: {
                deleteMany: {},
                create: itemWrites(articleIds)
              }
            }
          : {})
      },
      include: {
        items: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          include: { article: true }
        }
      }
    });

    return okJson(serializeArticleCollection(row));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorJson("合集 slug 已存在。", 409);
    }

    throw error;
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  await prisma.articleCollection.delete({
    where: { id: params.id }
  });

  return okJson({ id: params.id });
}
