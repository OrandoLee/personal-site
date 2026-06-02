export const docxArticleMarker = "<!-- article-source:docx -->";
export const docxPageBreakMarker = "<!-- docx-page-break -->";

const fallbackPageCharacterLimit = 2600;

export function markDocxArticleContent(content: string) {
  return `${docxArticleMarker}\n\n${content.trim()}`;
}

export function isDocxArticleContent(content: string) {
  return content.trimStart().startsWith(docxArticleMarker);
}

export function stripArticleContentMeta(content: string) {
  return content.replace(docxArticleMarker, "").trim();
}

function splitMarkdownBlocks(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function paginateByLength(content: string) {
  const blocks = splitMarkdownBlocks(content);
  const pages: string[] = [];
  let current = "";

  for (const block of blocks) {
    const next = current ? `${current}\n\n${block}` : block;

    if (current && next.length > fallbackPageCharacterLimit) {
      pages.push(current);
      current = block;
    } else {
      current = next;
    }
  }

  if (current) {
    pages.push(current);
  }

  return pages.length > 0 ? pages : [content];
}

export function splitDocxArticlePages(content: string) {
  const body = stripArticleContentMeta(content);
  const explicitPages = body
    .split(docxPageBreakMarker)
    .map((page) => page.trim())
    .filter(Boolean);

  if (explicitPages.length > 1) {
    return explicitPages;
  }

  return paginateByLength(explicitPages[0] ?? body);
}
