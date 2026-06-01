import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { errorJson, okJson, readJson } from "@/lib/api-utils";
import { createCosUploadTarget, type UploadKind } from "@/lib/tencent-cos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseUploadKind(value: unknown): UploadKind {
  if (value === "image" || value === "video") {
    return value;
  }

  throw new Error("Invalid upload kind.");
}

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  try {
    const body = (await readJson(request)) as {
      kind?: unknown;
      fileName?: unknown;
      type?: unknown;
      size?: unknown;
    };

    if (typeof body.fileName !== "string" || typeof body.size !== "number") {
      return errorJson("Invalid upload request.", 400);
    }

    return okJson(
      createCosUploadTarget({
        kind: parseUploadKind(body.kind),
        fileName: body.fileName,
        type: typeof body.type === "string" ? body.type : undefined,
        size: body.size
      })
    );
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Upload failed.", 400);
  }
}
