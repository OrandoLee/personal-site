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
import { enrichLabProjectWithGitHubTimes } from "@/lib/lab-project-enrichment";
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

  const row = await prisma.labProject.findUnique({
    where: { id: params.id }
  });

  if (!row) {
    return errorJson("LAB 项目不存在。", 404);
  }

  return okJson(await enrichLabProjectWithGitHubTimes(serializeLabProject(row)));
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = labProjectSchema.partial().safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  try {
    const row = await prisma.labProject.update({
      where: { id: params.id },
      data: parsed.data
    });

    return okJson(await enrichLabProjectWithGitHubTimes(serializeLabProject(row)));
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

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  await prisma.labProject.delete({
    where: { id: params.id }
  });

  return okJson({ id: params.id });
}
