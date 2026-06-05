import { Prisma } from "@prisma/client";
import { dateInputToDate, serializeArticle, stringifyTags } from "@/lib/content-serializers";
import { prisma } from "@/lib/db";
import type { ImportedMarkdownArticle } from "@/lib/markdown-import";
import { slugify } from "@/lib/slug";

type CreateImportedArticleOptions = {
  collectionId?: string | null;
  titleOverride?: string | null;
  publishedOverride?: boolean;
};

function stableTitleSlug(title: string) {
  const slug = slugify(title);

  if (slug && /[a-z]/.test(slug)) {
    return slug;
  }

  let hash = 0;
  for (let index = 0; index < title.length; index += 1) {
    hash = (hash * 31 + title.charCodeAt(index)) >>> 0;
  }

  return `document-${hash.toString(36)}`;
}

export async function createImportedArticle(
  article: ImportedMarkdownArticle,
  options: CreateImportedArticleOptions = {}
) {
  const title = options.titleOverride?.trim() || article.title;
  const published = options.publishedOverride ?? article.published;
  let slug = options.titleOverride
    ? stableTitleSlug(title)
    : article.slug;

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      const row = await prisma.$transaction(async (tx) => {
        const savedArticle = await tx.article.create({
          data: {
            title,
            slug,
            date: dateInputToDate(article.date),
            category: article.category,
            tags: stringifyTags(article.tags),
            summary: article.summary,
            cover: article.cover || null,
            content: article.content,
            published
          }
        });

        if (options.collectionId) {
          const count = await tx.articleCollectionItem.count({
            where: { collectionId: options.collectionId }
          });

          await tx.articleCollectionItem.create({
            data: {
              collectionId: options.collectionId,
              articleId: savedArticle.id,
              sortOrder: (count + 1) * 10
            }
          });
        }

        return savedArticle;
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
