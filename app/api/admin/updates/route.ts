import { Prisma } from "@prisma/client";
import { dailyUpdateSchema } from "@/lib/admin-schemas";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import {
  errorJson,
  okJson,
  readJson,
  zodErrorMessage
} from "@/lib/api-utils";
import {
  dateInputToDate,
  serializeDailyUpdate
} from "@/lib/content-serializers";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const search = new URL(request.url).searchParams.get("search")?.trim();
  const where: Prisma.DailyUpdateWhereInput = search
    ? {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { type: { contains: search } }
        ]
      }
    : {};
  const rows = await prisma.dailyUpdate.findMany({
    where,
    orderBy: [{ date: "desc" }, { updatedAt: "desc" }]
  });

  return okJson(rows.map(serializeDailyUpdate));
}

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = dailyUpdateSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  const row = await prisma.dailyUpdate.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      date: dateInputToDate(parsed.data.date),
      description: parsed.data.description,
      cover: parsed.data.cover,
      link: parsed.data.link,
      published: parsed.data.published
    }
  });

  return okJson(serializeDailyUpdate(row), { status: 201 });
}
