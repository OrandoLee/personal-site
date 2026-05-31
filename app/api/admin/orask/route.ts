import { Prisma } from "@prisma/client";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { okJson } from "@/lib/api-utils";
import { serializeOraskMessage } from "@/lib/content-serializers";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const search = new URL(request.url).searchParams.get("search")?.trim();
  const where: Prisma.OraskMessageWhereInput = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { subject: { contains: search } },
          { message: { contains: search } }
        ]
      }
    : {};
  const rows = await prisma.oraskMessage.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  return okJson(rows.map(serializeOraskMessage));
}
