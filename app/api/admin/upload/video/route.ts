import { uiText } from "@/content/uiText";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { errorJson, okJson } from "@/lib/api-utils";
import { saveUploadFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return errorJson(uiText.apiMessages.uploadVideo, 400);
  }

  try {
    return okJson(await saveUploadFile(file, "video"), { status: 201 });
  } catch (error) {
    return errorJson(
      error instanceof Error ? error.message : uiText.apiMessages.videoUploadFailed,
      400
    );
  }
}
