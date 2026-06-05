import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { errorJson, okJson, readJson } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BulkAction = "delete" | "feature" | "unfeature" | "publish" | "unpublish";

function parseIds(value: unknown) {
  return Array.isArray(value)
    ? value.map((id) => String(id).trim()).filter(Boolean)
    : [];
}

function parseAction(value: unknown): BulkAction | null {
  return value === "delete" ||
    value === "feature" ||
    value === "unfeature" ||
    value === "publish" ||
    value === "unpublish"
    ? value
    : null;
}

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const body = await readJson(request);
  const ids = parseIds((body as { ids?: unknown }).ids);
  const action = parseAction((body as { action?: unknown }).action);

  if (!action) {
    return errorJson("请选择有效的批量操作。", 400);
  }

  if (ids.length === 0) {
    return errorJson("请先选择文档。", 400);
  }

  if (action === "delete") {
    const result = await prisma.article.deleteMany({
      where: { id: { in: ids } }
    });

    return okJson({ count: result.count });
  }

  const data =
    action === "feature"
      ? { featured: true }
      : action === "unfeature"
        ? { featured: false }
        : action === "publish"
          ? { published: true }
          : { published: false };
  const result = await prisma.article.updateMany({
    where: { id: { in: ids } },
    data
  });

  return okJson({ count: result.count });
}
