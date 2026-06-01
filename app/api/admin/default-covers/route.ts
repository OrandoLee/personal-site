import { z } from "zod";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { errorJson, okJson, readJson, zodErrorMessage } from "@/lib/api-utils";
import {
  defaultCoverKeys,
  getDefaultCovers,
  setDefaultCoverOverrides
} from "@/lib/default-covers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const defaultCoverPatchSchema = z.object({
  covers: z
    .object(
      Object.fromEntries(
        defaultCoverKeys.map((key) => [
          key,
          z.string().trim().nullable().optional()
        ])
      ) as Record<(typeof defaultCoverKeys)[number], z.ZodOptional<z.ZodNullable<z.ZodString>>>
    )
    .partial()
});

export async function GET() {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  return okJson(await getDefaultCovers());
}

export async function PATCH(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = defaultCoverPatchSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  return okJson(await setDefaultCoverOverrides(parsed.data.covers));
}
