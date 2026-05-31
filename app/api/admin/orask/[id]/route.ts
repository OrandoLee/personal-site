import { oraskPatchSchema } from "@/lib/admin-schemas";
import { uiText } from "@/content/uiText";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import {
  errorJson,
  okJson,
  readJson,
  zodErrorMessage
} from "@/lib/api-utils";
import { serializeOraskMessage } from "@/lib/content-serializers";
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

  const row = await prisma.oraskMessage.findUnique({
    where: { id: params.id }
  });

  if (!row) {
    return errorJson(uiText.apiMessages.feedbackMissing, 404);
  }

  return okJson(serializeOraskMessage(row));
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = oraskPatchSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  const row = await prisma.oraskMessage.update({
    where: { id: params.id },
    data: parsed.data
  });

  return okJson(serializeOraskMessage(row));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  await prisma.oraskMessage.delete({
    where: { id: params.id }
  });

  return okJson({ id: params.id });
}
