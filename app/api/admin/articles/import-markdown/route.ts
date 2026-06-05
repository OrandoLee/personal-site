import { uiText } from "@/content/uiText";
import { createImportedArticle } from "@/lib/article-import";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { errorJson, okJson } from "@/lib/api-utils";
import {
  shouldUseUploadedFileTitle,
  titleFromUploadedFileName
} from "@/lib/import-file-name";
import { parseMarkdownArticle } from "@/lib/markdown-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxMarkdownBytes = 5 * 1024 * 1024;
const allowedMimeTypes = [
  "",
  "text/markdown",
  "text/x-markdown",
  "text/plain",
  "application/octet-stream"
];

function isMarkdownFile(fileName: string) {
  return /\.(md|markdown)$/i.test(fileName);
}

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

  if (!(file instanceof File)) {
    return errorJson(uiText.apiMessages.uploadMarkdown, 400);
  }

  if (!isMarkdownFile(file.name)) {
    return errorJson(uiText.apiMessages.markdownOnly, 400);
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return errorJson(uiText.apiMessages.markdownTextOnly, 400);
  }

  if (file.size > maxMarkdownBytes) {
    return errorJson(uiText.apiMessages.markdownTooLarge, 400);
  }

  const article = parseMarkdownArticle(await file.text(), file.name);

  if (article.localImages.length > 0) {
    return errorJson(uiText.apiMessages.markdownHasLocalImages, 409);
  }

  return okJson(
    await createImportedArticle(article, {
      collectionId: typeof collectionId === "string" ? collectionId : null,
      titleOverride: useFileNameAsTitle
        ? titleFromUploadedFileName(file.name)
        : null
    }),
    { status: 201 }
  );
}
