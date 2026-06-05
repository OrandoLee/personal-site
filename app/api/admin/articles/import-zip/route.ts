import { uiText } from "@/content/uiText";
import { createImportedArticle } from "@/lib/article-import";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { errorJson, okJson } from "@/lib/api-utils";
import {
  shouldPublishImportedFile,
  shouldUseUploadedFileTitle,
  titleFromUploadedFileName
} from "@/lib/import-file-name";
import { importMarkdownZipPackage } from "@/lib/zip-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxZipBytes = 25 * 1024 * 1024;
const allowedMimeTypes = [
  "",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream"
];

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const collectionId = formData.get("collectionId");
  const useFileNameAsTitle = shouldUseUploadedFileTitle(
    formData.get("useFileNameAsTitle")
  );
  const publishOnImport = shouldPublishImportedFile(
    formData.get("publishOnImport")
  );

  if (!(file instanceof File)) {
    return errorJson(uiText.apiMessages.uploadZip, 400);
  }

  if (!file.name.toLowerCase().endsWith(".zip")) {
    return errorJson(uiText.apiMessages.zipOnly, 400);
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return errorJson(uiText.apiMessages.zipMimeOnly, 400);
  }

  if (file.size > maxZipBytes) {
    return errorJson(uiText.apiMessages.zipTooLarge, 400);
  }

  try {
    const article = await importMarkdownZipPackage(file);
    const savedArticle = await createImportedArticle(article, {
      collectionId: typeof collectionId === "string" ? collectionId : null,
      titleOverride: useFileNameAsTitle
        ? titleFromUploadedFileName(file.name)
        : null,
      publishedOverride: publishOnImport ? true : undefined
    });

    return okJson(savedArticle, { status: 201 });
  } catch (error) {
    return errorJson(
      error instanceof Error ? error.message : uiText.apiMessages.zipImportFailed,
      400
    );
  }
}
