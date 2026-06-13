import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { errorJson, okJson, readJson } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BulkAction = "publish";
type BulkScope = "selected" | "unpublished";

function parseIds(value: unknown) {
  return Array.isArray(value)
    ? value.map((id) => String(id).trim()).filter(Boolean)
    : [];
}

function parseAction(value: unknown): BulkAction | null {
  return value === "publish" ? value : null;
}

function parseScope(value: unknown): BulkScope {
  return value === "unpublished" ? value : "selected";
}

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const body = await readJson(request);
  const ids = parseIds((body as { ids?: unknown }).ids);
  const action = parseAction((body as { action?: unknown }).action);
  const scope = parseScope((body as { scope?: unknown }).scope);

  if (!action) {
    return errorJson("请选择有效的批量操作。", 400);
  }

  if (scope === "selected" && ids.length === 0) {
    return errorJson("请先选择未公开作品。", 400);
  }

  const result = await prisma.galleryItem.updateMany({
    where:
      scope === "unpublished"
        ? { published: false }
        : { id: { in: ids }, published: false },
    data: { published: true }
  });

  return okJson({ count: result.count });
}
