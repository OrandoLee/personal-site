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

const storyPartPattern =
  /^word\/(?:footnotes|endnotes|comments|header\d+|footer\d+)\.xml$/i;
const minimumRenderedTextCoverage = 0.98;

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

function escapeMarkdownPreservingPageBreaks(value: string) {
  const pageBreakPattern = new RegExp(`(${docxPageBreakMarker})`, "g");

  return value
    .split(pageBreakPattern)
    .map((piece) =>
      piece === docxPageBreakMarker ? docxPageBreakMarker : escapeMarkdown(piece)
    )
    .join("");
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
  const imageId =
    runXml.match(/r:embed="([^"]+)"/)?.[1] ??
    runXml.match(/r:link="([^"]+)"/)?.[1] ??
    "";
  const imageUrl = imageId ? imageUrls.get(imageId) : undefined;

  const pieces = Array.from(
    runXml.matchAll(
      /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>|<w:lastRenderedPageBreak\b[^>]*\/>/g
    )
  )
    .map((match) => {
      if (match[0].startsWith("<w:tab")) {
        return "\t";
      }

      if (
        match[0].startsWith("<w:lastRenderedPageBreak") ||
        /<w:br\b[^>]*w:type="page"/i.test(match[0])
      ) {
        return `\n\n${docxPageBreakMarker}\n\n`;
      }

      if (match[0].startsWith("<w:br")) {
        return "\n";
      }

      return decodeXml(match[1] ?? "");
    })
    .join("");

  const imageMarkdown = imageUrl ? `\n\n![docx image](${imageUrl})\n\n` : "";

  const escaped = escapeMarkdownPreservingPageBreaks(pieces);
  const bold = /<w:b\b/i.test(runXml);
  const italic = /<w:i\b/i.test(runXml);
  const hasPageBreak = escaped.includes(docxPageBreakMarker);

  if (!escaped) {
    return imageMarkdown;
  }

  if (hasPageBreak) {
    return `${imageMarkdown}${escaped}`;
  }

  if (bold && italic) {
    return `${imageMarkdown}***${escaped}***`;
  }

  if (bold) {
    return `${imageMarkdown}**${escaped}**`;
  }

  if (italic) {
    return `${imageMarkdown}*${escaped}*`;
  }

  return `${imageMarkdown}${escaped}`;
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

function matchingCloseTag(xml: string, startIndex: number, tagName: "w:p" | "w:tbl") {
  const tagPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
  tagPattern.lastIndex = startIndex;

  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(xml))) {
    if (match[0].startsWith("</")) {
      depth -= 1;

      if (depth === 0) {
        return tagPattern.lastIndex;
      }
    } else if (!match[0].endsWith("/>")) {
      depth += 1;
    }
  }

  return -1;
}

function renderBodyBlocks(bodyXml: string, imageUrls: Map<string, string>) {
  const blocks: string[] = [];
  const blockPattern = /<w:(p|tbl)\b[^>]*>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(bodyXml))) {
    if (match.index < cursor) {
      continue;
    }

    const tagName = `w:${match[1]}` as "w:p" | "w:tbl";
    const endIndex = matchingCloseTag(bodyXml, match.index, tagName);

    if (endIndex === -1) {
      continue;
    }

    const blockXml = bodyXml.slice(match.index, endIndex);
    const rendered =
      tagName === "w:tbl"
        ? renderTable(blockXml)
        : renderParagraph(blockXml, imageUrls);

    if (rendered) {
      blocks.push(rendered);
    }

    cursor = endIndex;
    blockPattern.lastIndex = endIndex;
  }

  return blocks;
}

function renderDocumentMarkdown(documentXml: string, imageUrls: Map<string, string>) {
  const body = documentXml.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/)?.[1] ?? documentXml;
  const blocks = renderBodyBlocks(body, imageUrls);

  return blocks.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function plainTextFromXml(value: string) {
  return Array.from(
    value.matchAll(
      /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>|<w:lastRenderedPageBreak\b[^>]*\/>/g
    )
  )
    .map((match) => {
      if (match[0].startsWith("<w:tab")) {
        return "\t";
      }

      if (
        match[0].startsWith("<w:lastRenderedPageBreak") ||
        /<w:br\b[^>]*w:type="page"/i.test(match[0])
      ) {
        return `\n\n${docxPageBreakMarker}\n\n`;
      }

      if (match[0].startsWith("<w:br")) {
        return "\n";
      }

      return decodeXml(match[1] ?? "");
    })
    .join("");
}

function renderPlainTable(tableXml: string) {
  return Array.from(tableXml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g))
    .map((rowMatch) =>
      Array.from(rowMatch[0].matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g))
        .map((cellMatch) =>
          plainTextFromXml(cellMatch[0]).replace(/\s+/g, " ").trim()
        )
        .filter(Boolean)
        .join(" | ")
    )
    .filter(Boolean)
    .join("\n");
}

function renderPlainBodyBlocks(bodyXml: string) {
  const blocks: string[] = [];
  const blockPattern = /<w:(p|tbl)\b[^>]*>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(bodyXml))) {
    if (match.index < cursor) {
      continue;
    }

    const tagName = `w:${match[1]}` as "w:p" | "w:tbl";
    const endIndex = matchingCloseTag(bodyXml, match.index, tagName);

    if (endIndex === -1) {
      continue;
    }

    const blockXml = bodyXml.slice(match.index, endIndex);
    const text =
      tagName === "w:tbl" ? renderPlainTable(blockXml) : plainTextFromXml(blockXml);

    if (text.trim()) {
      blocks.push(escapeMarkdownPreservingPageBreaks(text.trim()));
    }

    cursor = endIndex;
    blockPattern.lastIndex = endIndex;
  }

  return blocks;
}

function renderPlainDocumentMarkdown(documentXml: string) {
  const body = documentXml.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/)?.[1] ?? documentXml;

  return renderPlainBodyBlocks(body)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizedTextLength(value: string) {
  return stripMarkdown(value).replace(/\s+/g, "").length;
}

function chooseCoveredMarkdown(renderedMarkdown: string, plainMarkdown: string) {
  const renderedLength = normalizedTextLength(renderedMarkdown);
  const plainLength = normalizedTextLength(plainMarkdown);

  if (plainLength === 0) {
    return renderedMarkdown;
  }

  if (renderedLength / plainLength >= minimumRenderedTextCoverage) {
    return renderedMarkdown;
  }

  return plainMarkdown;
}

async function renderStoryParts(zip: JSZip, imageUrls: Map<string, string>) {
  const storyEntries = zip
    .filter((relativePath) => storyPartPattern.test(relativePath))
    .sort((left, right) => left.name.localeCompare(right.name));
  const renderedParts: string[] = [];

  for (const entry of storyEntries) {
    const markdown = renderDocumentMarkdown(await entry.async("text"), imageUrls);

    if (markdown) {
      renderedParts.push(markdown);
    }
  }

  return renderedParts;
}

async function renderPlainStoryParts(zip: JSZip) {
  const storyEntries = zip
    .filter((relativePath) => storyPartPattern.test(relativePath))
    .sort((left, right) => left.name.localeCompare(right.name));
  const renderedParts: string[] = [];

  for (const entry of storyEntries) {
    const markdown = renderPlainDocumentMarkdown(await entry.async("text"));

    if (markdown) {
      renderedParts.push(markdown);
    }
  }

  return renderedParts;
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
  const documentXml = await documentEntry.async("text");
  const markdownParts = [
    renderDocumentMarkdown(documentXml, imageUrls),
    ...(await renderStoryParts(zip, imageUrls))
  ].filter(Boolean);
  const renderedMarkdown = markdownParts.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
  const plainMarkdownParts = [
    renderPlainDocumentMarkdown(documentXml),
    ...(await renderPlainStoryParts(zip))
  ].filter(Boolean);
  const plainMarkdown = plainMarkdownParts.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
  const markdown = chooseCoveredMarkdown(renderedMarkdown, plainMarkdown);

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
    summary: "",
    cover: "",
    content: markDocxArticleContent(markdown),
    published: false,
    localImages: []
  };
}
