import path from "node:path";
import JSZip from "jszip";
import { docxPageBreakMarker, markDocxArticleContent } from "@/lib/article-content";
import { normalizeArticleCategory } from "@/lib/article-categories";
import type { ImportedMarkdownArticle } from "@/lib/markdown-import";
import { saveUploadBuffer } from "@/lib/storage";
import { slugify } from "@/lib/slug";

const imageContentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function todayInput() {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeMarkdown(value: string) {
  return value.replace(/([\\`*_{}[\]()#+.!|-])/g, "\\$1");
}

function stripXmlTags(value: string) {
  return decodeXml(value.replace(/<[^>]+>/g, ""));
}

function getAttribute(tag: string, name: string) {
  const pattern = new RegExp(`${name}="([^"]+)"`);
  return tag.match(pattern)?.[1] ?? "";
}

function normalizeRelationshipTarget(target: string) {
  const normalized = target.replace(/\\/g, "/").replace(/^\/+/, "");
  return normalized.startsWith("word/") ? normalized : `word/${normalized}`;
}

function parseRelationships(xml: string) {
  const relationships = new Map<string, string>();

  for (const match of Array.from(xml.matchAll(/<Relationship\b[^>]*>/g))) {
    const tag = match[0];
    const id = getAttribute(tag, "Id");
    const target = getAttribute(tag, "Target");

    if (id && target && !target.startsWith("http")) {
      relationships.set(id, normalizeRelationshipTarget(target));
    }
  }

  return relationships;
}

async function uploadDocxImages(zip: JSZip, relationships: Map<string, string>) {
  const imageUrls = new Map<string, string>();

  for (const [id, target] of Array.from(relationships.entries())) {
    if (!target.startsWith("word/media/")) {
      continue;
    }

    const entry = zip.file(target);
    const extension = path.extname(target).toLowerCase();
    const type = imageContentTypes[extension];

    if (!entry || !type) {
      continue;
    }

    const bytes = await entry.async("nodebuffer");
    const upload = await saveUploadBuffer({
      bytes,
      fileName: path.basename(target),
      kind: "image",
      type
    });

    imageUrls.set(id, upload.url);
  }

  return imageUrls;
}

function renderRun(runXml: string, imageUrls: Map<string, string>) {
  if (/<w:br\b[^>]*w:type="page"[^>]*\/>|<w:lastRenderedPageBreak\b/i.test(runXml)) {
    return `\n\n${docxPageBreakMarker}\n\n`;
  }

  const imageId =
    runXml.match(/r:embed="([^"]+)"/)?.[1] ??
    runXml.match(/r:link="([^"]+)"/)?.[1] ??
    "";
  const imageUrl = imageId ? imageUrls.get(imageId) : undefined;

  if (imageUrl) {
    return `\n\n![docx image](${imageUrl})\n\n`;
  }

  const pieces = Array.from(runXml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\s*\/>|<w:br\s*\/>/g))
    .map((match) => {
      if (match[0].startsWith("<w:tab")) {
        return "\t";
      }

      if (match[0].startsWith("<w:br")) {
        return "\n";
      }

      return decodeXml(match[1] ?? "");
    })
    .join("");

  if (!pieces) {
    return "";
  }

  const escaped = escapeMarkdown(pieces);
  const bold = /<w:b\b/i.test(runXml);
  const italic = /<w:i\b/i.test(runXml);

  if (bold && italic) {
    return `***${escaped}***`;
  }

  if (bold) {
    return `**${escaped}**`;
  }

  if (italic) {
    return `*${escaped}*`;
  }

  return escaped;
}

function paragraphStyle(paragraphXml: string) {
  return paragraphXml.match(/<w:pStyle\b[^>]*w:val="([^"]+)"/)?.[1] ?? "";
}

function paragraphText(paragraphXml: string, imageUrls: Map<string, string>) {
  return Array.from(paragraphXml.matchAll(/<w:r\b[\s\S]*?<\/w:r>/g))
    .map((match) => renderRun(match[0], imageUrls))
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function renderParagraph(paragraphXml: string, imageUrls: Map<string, string>) {
  const text = paragraphText(paragraphXml, imageUrls);

  if (!text) {
    return "";
  }

  if (text === docxPageBreakMarker) {
    return text;
  }

  const style = paragraphStyle(paragraphXml).toLowerCase();

  if (style.includes("heading1") || style === "1") {
    return `# ${text}`;
  }

  if (style.includes("heading2") || style === "2") {
    return `## ${text}`;
  }

  if (style.includes("heading3") || style === "3") {
    return `### ${text}`;
  }

  if (/<w:numPr\b/i.test(paragraphXml)) {
    return `- ${text}`;
  }

  return text;
}

function cellText(cellXml: string) {
  return Array.from(cellXml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g))
    .map((match) => decodeXml(match[1] ?? ""))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function renderTable(tableXml: string) {
  const rows = Array.from(tableXml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g))
    .map((rowMatch) =>
      Array.from(rowMatch[0].matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g))
        .map((cellMatch) => escapeMarkdown(cellText(cellMatch[0])))
    )
    .filter((row) => row.some(Boolean));

  if (rows.length === 0) {
    return "";
  }

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalizedRows = rows.map((row) => [
    ...row,
    ...Array.from({ length: columnCount - row.length }, () => "")
  ]);
  const header = normalizedRows[0];
  const body = normalizedRows.slice(1);

  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n");
}

function renderDocumentMarkdown(documentXml: string, imageUrls: Map<string, string>) {
  const body = documentXml.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/)?.[1] ?? documentXml;
  const blocks = Array.from(body.matchAll(/<w:p\b[\s\S]*?<\/w:p>|<w:tbl\b[\s\S]*?<\/w:tbl>/g))
    .map((match) =>
      match[0].startsWith("<w:tbl")
        ? renderTable(match[0])
        : renderParagraph(match[0], imageUrls)
    )
    .filter(Boolean);

  return blocks.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function stripMarkdown(value: string) {
  return value
    .replace(docxPageBreakMarker, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/[#>*_`~\-|\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(markdown: string, fileName: string) {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const firstLine = markdown
    .split(/\n+/)
    .map((line) => stripMarkdown(line))
    .find(Boolean);

  return heading ? stripMarkdown(heading) : firstLine ?? fileName.replace(/\.docx$/i, "");
}

function excerpt(markdown: string) {
  const plain = stripMarkdown(markdown);

  return plain.length <= 160 ? plain : `${plain.slice(0, 150).trim()}...`;
}

export async function parseDocxArticle(file: File): Promise<ImportedMarkdownArticle> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentEntry = zip.file("word/document.xml");

  if (!documentEntry) {
    throw new Error("This DOCX file does not contain a Word document body.");
  }

  const relationshipsEntry = zip.file("word/_rels/document.xml.rels");
  const relationships = relationshipsEntry
    ? parseRelationships(await relationshipsEntry.async("text"))
    : new Map<string, string>();
  const imageUrls = await uploadDocxImages(zip, relationships);
  const markdown = renderDocumentMarkdown(await documentEntry.async("text"), imageUrls);

  if (!markdown) {
    throw new Error("No readable text was found in this DOCX file.");
  }

  const title = extractTitle(markdown, file.name);

  return {
    title,
    slug: slugify(title) || `article-${Date.now()}`,
    date: todayInput(),
    category: normalizeArticleCategory(""),
    tags: ["DOCX"],
    summary: excerpt(markdown),
    cover: "",
    content: markDocxArticleContent(markdown),
    published: false,
    localImages: []
  };
}
