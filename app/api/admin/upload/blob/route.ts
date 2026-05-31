import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { errorJson } from "@/lib/api-utils";
import {
  assertBlobConfigured,
  getUploadConstraints,
  type UploadKind
} from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseUploadKind(value: string | null): UploadKind {
  if (value === "image" || value === "video") {
    return value;
  }

  throw new Error("Invalid upload kind.");
}

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  if (body.type === "blob.generate-client-token" && !requireAdminApi()) {
    return unauthorizedJson();
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        assertBlobConfigured();

        const kind = parseUploadKind(clientPayload);

        return {
          ...getUploadConstraints(kind),
          tokenPayload: kind
        };
      }
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Upload failed.", 400);
  }
}
