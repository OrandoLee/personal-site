import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { uiText } from "@/content/uiText";
import {
  formatArticleCategory,
  getAllArticleCategories,
  getAllArticles
} from "@/lib/articles";
import { cn } from "@/lib/classNames";

type ArticlesPageProps = {
  searchParams?: {
    category?: string;
  };
};

export const metadata = {
  title: uiText.articles.metadataTitle
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const articles = await getAllArticles();
  const categories = await getAllArticleCategories();
  const activeCategory = searchParams?.category ?? "all";
  const filteredArticles =
    activeCategory === "all"
      ? articles
      : articles.filter((article) => article.category === activeCategory);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <section className="mb-12 rounded-3xl bg-archive-paper2/70 p-7 sm:p-10">
        <p className="text-sm text-archive-muted">{uiText.articles.title}</p>
        <h1 className="mt-4 max-w-[875px] font-serif text-5xl font-semibold leading-tight text-archive-ink sm:text-7xl">
          {uiText.articles.heroTitle}
        </h1>
      </section>

      <div className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/articles"
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition",
            activeCategory === "all"
              ? "border-archive-ink bg-archive-ink text-archive-paper2"
              : "border-archive-line bg-archive-paper2 text-archive-muted hover:border-archive-ink hover:text-archive-ink"
          )}
        >
          {uiText.articles.allCategories}
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            href={`/articles?category=${encodeURIComponent(category)}`}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              activeCategory === category
                ? "border-archive-ink bg-archive-ink text-archive-paper2"
                : "border-archive-line bg-archive-paper2 text-archive-muted hover:border-archive-ink hover:text-archive-ink"
            )}
          >
            {formatArticleCategory(category)}
          </Link>
        ))}
      </div>

      <section className="grid gap-5">
        {filteredArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </section>
    </main>
  );
}
