import Link from "next/link";
import type { ArticleMeta } from "@/lib/articles";
import { formatArticleCategory } from "@/lib/articles";
import { formatDate } from "@/lib/format";

type ArticleCardProps = {
  article: ArticleMeta;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <article className="grid gap-6 rounded-3xl border border-archive-line bg-archive-paper2 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-archive sm:grid-cols-[180px_1fr] sm:p-6">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-archive-line bg-archive-paper">
          {article.cover ? (
            <img
              src={article.cover}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-end p-4 font-serif text-5xl text-archive-line">
              {article.title.slice(0, 1)}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-5">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-archive-muted">
              {article.featured ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-archive-gold bg-archive-gold/10 px-2 py-0.5 text-xs text-archive-gold">
                  <span aria-hidden="true">★</span>
                  置顶
                </span>
              ) : null}
              <time>{formatDate(article.date)}</time>
              <span>/</span>
              <span>{formatArticleCategory(article.category)}</span>
            </div>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-archive-ink transition group-hover:text-archive-clay">
              {article.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-archive-muted">
              {article.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-archive-line bg-archive-paper px-2.5 py-1 text-xs text-archive-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
