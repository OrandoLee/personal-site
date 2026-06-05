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

function itemWrites(articleIds: string[]) {
  return articleIds.map((articleId, index) => ({
    articleId,
    sortOrder: (index + 1) * 10
  }));
}

export async function GET(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const search = new URL(request.url).searchParams.get("search")?.trim();
  const where: Prisma.ArticleCollectionWhereInput = search
    ? {
        OR: [
          { title: { contains: search } },
          { slug: { contains: search } },
          { summary: { contains: search } }
        ]
      }
    : {};

  const rows = await prisma.articleCollection.findMany({
    where,
    orderBy: [
      { featured: "desc" },
      { sortOrder: "asc" },
      { updatedAt: "desc" }
    ],
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: { article: true }
      }
    }
  });

  return okJson(rows.map(serializeArticleCollection));
}

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = articleCollectionSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  try {
    const { articleIds, ...collection } = parsed.data;
    const row = await prisma.articleCollection.create({
      data: {
        ...collection,
        items: {
          create: itemWrites(articleIds)
        }
      },
      include: {
        items: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          include: { article: true }
        }
      }
    });

    return okJson(serializeArticleCollection(row), { status: 201 });
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
