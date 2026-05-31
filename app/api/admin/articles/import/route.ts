import { uiText } from "@/content/uiText";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import { errorJson, okJson } from "@/lib/api-utils";
import { parseMarkdownArticle } from "@/lib/markdown-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxMarkdownBytes = 5 * 1024 * 1024;
const allowedExtensions = [".md", ".markdown"];
const allowedMimeTypes = [
  "",
  "text/markdown",
  "text/x-markdown",
  "text/plain",
  "application/octet-stream"
];

function hasAllowedExtension(fileName: string) {
  return allowedExtensions.some((extension) =>
    fileName.toLowerCase().endsWith(extension)
  );
}

export async function POST(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return errorJson(uiText.apiMessages.uploadMarkdown, 400);
  }

  if (!hasAllowedExtension(file.name)) {
    return errorJson(uiText.apiMessages.markdownOnlyLegacy, 400);
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return errorJson(uiText.apiMessages.markdownMimeOnly, 400);
  }

  if (file.size > maxMarkdownBytes) {
    return errorJson(uiText.apiMessages.markdownTooLargeLegacy, 400);
  }

  const source = await file.text();

  return okJson(parseMarkdownArticle(source, file.name), { status: 200 });
}
