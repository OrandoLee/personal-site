import Link from "next/link";
import { notFound } from "next/navigation";
import { DocxArticlePager } from "@/components/DocxArticlePager";
import { ArticleRenderer } from "@/components/ArticleRenderer";
import { uiText } from "@/content/uiText";
import { isDocxArticleContent } from "@/lib/article-content";
import {
  formatArticleCategory,
  getArticleBySlug
} from "@/lib/articles";

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: uiText.articles.notFoundTitle
    };
  }

  return {
    title: article.title,
    description: article.summary
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Link
        href="/articles"
        className="mb-10 inline-flex rounded-full border border-archive-line px-4 py-2 text-sm text-archive-muted transition hover:border-archive-ink hover:text-archive-ink"
      >
        {uiText.articles.backToArticles}
      </Link>

      <article>
        <div className="flex flex-wrap items-center gap-3 text-sm text-archive-muted">
          {article.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-archive-gold bg-archive-gold/10 px-2.5 py-1 text-xs text-archive-gold">
              <span aria-hidden="true">★</span>
              置顶
            </span>
          ) : null}
          <span>{formatArticleCategory(article.category)}</span>
        </div>
        <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight text-archive-ink sm:text-7xl">
          {article.title}
        </h1>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-archive-muted">
          <time>{article.date}</time>
          {article.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        {article.cover ? (
          <img
            src={article.cover}
            alt={article.title}
            className="mt-10 w-full rounded-3xl border border-archive-line object-cover"
          />
        ) : null}

        {isDocxArticleContent(article.content) ? (
          <DocxArticlePager content={article.content} />
        ) : (
          <ArticleRenderer
            content={article.content}
            className="article-detail-body"
          />
        )}
      </article>
    </main>
  );
}
