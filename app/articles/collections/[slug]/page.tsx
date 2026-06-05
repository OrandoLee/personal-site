import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { uiText } from "@/content/uiText";
import { getArticleCollectionBySlug } from "@/lib/articles";

type ArticleCollectionPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ArticleCollectionPageProps) {
  const collection = await getArticleCollectionBySlug(params.slug);

  if (!collection) {
    return {
      title: uiText.articles.notFoundTitle
    };
  }

  return {
    title: collection.title,
    description: collection.summary
  };
}

export default async function ArticleCollectionPage({
  params
}: ArticleCollectionPageProps) {
  const collection = await getArticleCollectionBySlug(params.slug);

  if (!collection) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Link
        href="/articles"
        className="mb-10 inline-flex rounded-full border border-archive-line px-4 py-2 text-sm text-archive-muted transition hover:border-archive-ink hover:text-archive-ink"
      >
        {uiText.articles.backToArticles}
      </Link>

      <section className="mb-10 overflow-hidden rounded-3xl bg-archive-paper2">
        {collection.cover ? (
          <img
            src={collection.cover}
            alt={collection.title}
            className="h-72 w-full object-cover"
          />
        ) : null}
        <div className="p-7 sm:p-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-archive-muted">
            <span>合集</span>
            <span>{collection.articles.length} 篇文档</span>
            {collection.featured ? <span>置顶</span> : null}
          </div>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight text-archive-ink sm:text-7xl">
            {collection.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-archive-muted">
            {collection.summary}
          </p>
        </div>
      </section>

      <section className="grid gap-5">
        {collection.articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </section>
    </main>
  );
}
