import { uiText } from "@/content/uiText";
import { createImportedArticle } from "@/lib/article-import";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { errorJson, okJson } from "@/lib/api-utils";
import { parseDocxArticle } from "@/lib/docx-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxDocxBytes = 25 * 1024 * 1024;
const allowedMimeTypes = [
  "",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream"
];

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return errorJson("请上传 DOCX 文件。", 400);
  }

  if (!file.name.toLowerCase().endsWith(".docx")) {
    return errorJson("只支持 .docx 文件。", 400);
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return errorJson("只支持 Word DOCX 文件。", 400);
  }

  if (file.size > maxDocxBytes) {
    return errorJson("DOCX 文件大小不能超过 25MB。", 400);
  }

  try {
    const article = await parseDocxArticle(file);
    const savedArticle = await createImportedArticle(article);

    return okJson(savedArticle, { status: 201 });
  } catch (error) {
    return errorJson(
      error instanceof Error ? error.message : uiText.apiMessages.zipImportFailed,
      400
    );
  }
}
