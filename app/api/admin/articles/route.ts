import { Prisma } from "@prisma/client";
import { uiText } from "@/content/uiText";
import { articleSchema } from "@/lib/admin-schemas";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import {
  errorJson,
  okJson,
  readJson,
  zodErrorMessage
} from "@/lib/api-utils";
import {
  dateInputToDate,
  serializeArticle,
  stringifyTags
} from "@/lib/content-serializers";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const search = new URL(request.url).searchParams.get("search")?.trim();
  const where: Prisma.ArticleWhereInput = search
    ? {
        OR: [
          { title: { contains: search } },
          { slug: { contains: search } },
          { summary: { contains: search } },
          { category: { contains: search } },
          { tags: { contains: search } }
        ]
      }
    : {};
  const rows = await prisma.article.findMany({
    where,
    orderBy: [{ date: "desc" }, { updatedAt: "desc" }]
  });

  return okJson(rows.map(serializeArticle));
}

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = articleSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  try {
    const row = await prisma.article.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        date: dateInputToDate(parsed.data.date),
        category: parsed.data.category,
        tags: stringifyTags(parsed.data.tags),
        summary: parsed.data.summary,
        cover: parsed.data.cover,
        content: parsed.data.content,
        published: parsed.data.published
      }
    });

    return okJson(serializeArticle(row), { status: 201 });
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
