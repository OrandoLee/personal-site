import { Prisma } from "@prisma/client";
import { labProjectSchema } from "@/lib/admin-schemas";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import {
  errorJson,
  okJson,
  readJson,
  zodErrorMessage
} from "@/lib/api-utils";
import { serializeLabProject } from "@/lib/content-serializers";
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
  const where: Prisma.LabProjectWhereInput = {
    ...(category && category !== "all" ? { categoryKey: category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { slug: { contains: search } },
            { summary: { contains: search } },
            { description: { contains: search } },
            { category: { contains: search } },
            { status: { contains: search } }
          ]
        }
      : {})
  };
  const rows = await prisma.labProject.findMany({
    where,
    orderBy: [
      { sortOrder: "asc" },
      { updatedAt: "desc" },
      { createdAt: "desc" }
    ]
  });

  return okJson(rows.map(serializeLabProject));
}

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = labProjectSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  try {
    const row = await prisma.labProject.create({
      data: parsed.data
    });

    return okJson(serializeLabProject(row), { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorJson("slug 已存在，请换一个。", 409);
    }

    throw error;
  }
}
