import { Prisma } from "@prisma/client";
import { dateInputToDate, serializeArticle, stringifyTags } from "@/lib/content-serializers";
import { prisma } from "@/lib/db";
import type { ImportedMarkdownArticle } from "@/lib/markdown-import";

export async function createImportedArticle(article: ImportedMarkdownArticle) {
  let slug = article.slug;

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      const row = await prisma.article.create({
        data: {
          title: article.title,
          slug,
          date: dateInputToDate(article.date),
          category: article.category,
          tags: stringifyTags(article.tags),
          summary: article.summary,
          cover: article.cover || null,
          content: article.content,
          published: article.published
        }
      });

      return serializeArticle(row);
    } catch (error) {
      const duplicateSlug =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";

      if (!duplicateSlug) {
        throw error;
      }

      slug = `${article.slug}-${attempt + 1}`;
    }
  }

  throw new Error("Could not create a unique slug for this article.");
}

