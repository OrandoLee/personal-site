export const articleCategories = ["文章", "随笔", "公告", "技术文档"] as const;

export type ArticleCategory = (typeof articleCategories)[number];

export function normalizeArticleCategory(category: string): ArticleCategory {
  if ((articleCategories as readonly string[]).includes(category)) {
    return category as ArticleCategory;
  }

  if (category === "Essay") {
    return "文章";
  }

  if (
    category === "Tech" ||
    category === "Technical Documentation" ||
    category === "技术" ||
    category === "技术文档"
  ) {
    return "技术文档";
  }

  return "文章";
}
