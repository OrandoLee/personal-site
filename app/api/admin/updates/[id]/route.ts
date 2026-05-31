import { dailyUpdateSchema } from "@/lib/admin-schemas";
import { uiText } from "@/content/uiText";
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

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const row = await prisma.dailyUpdate.findUnique({
    where: { id: params.id }
  });

  if (!row) {
    return errorJson(uiText.apiMessages.updateMissing, 404);
  }

  return okJson(serializeDailyUpdate(row));
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = dailyUpdateSchema.partial().safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  const row = await prisma.dailyUpdate.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      date: parsed.data.date ? dateInputToDate(parsed.data.date) : undefined
    }
  });

  return okJson(serializeDailyUpdate(row));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  await prisma.dailyUpdate.delete({
    where: { id: params.id }
  });

  return okJson({ id: params.id });
}
