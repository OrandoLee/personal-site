import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { CursorTiltCard } from "@/components/CursorTiltCard";
import { SectionTitleLogo } from "@/components/SectionTitleLogo";
import { uiText } from "@/content/uiText";
import {
  formatArticleCategory,
  getAllArticleCategories,
  getAllArticles,
  getArticleCollections
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
  const [articles, categories, collections] = await Promise.all([
    getAllArticles(),
    getAllArticleCategories(),
    getArticleCollections()
  ]);
  const activeCategory = searchParams?.category ?? "all";
  const filteredArticles =
    activeCategory === "all"
      ? articles
      : articles.filter((article) => article.category === activeCategory);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <section className="mb-12 rounded-3xl bg-archive-paper2/70 p-7 sm:p-10">
        <SectionTitleLogo
          ariaLabel="Documents. Keep thinking."
          className="mb-7"
          main="/section-logos/article-main.svg"
          mainRatio="960 / 150"
          maxWidth="520px"
          tagline="/section-logos/article-tagline.svg"
          taglineOffset="0.35rem"
          taglineRatio="1660 / 90"
          taglineWidth="82%"
        />
        <h1
          aria-label={uiText.articles.heroTitle}
          className="articles-hero-title mt-4 max-w-[875px] font-serif text-[2.35rem] font-semibold leading-[1.14] text-archive-ink sm:text-7xl sm:leading-tight"
        >
          <span className="articles-hero-title__line" aria-hidden="true">
            <span className="articles-hero-title__text">
              文本作品、观察札记、
            </span>
          </span>
          <span
            className="articles-hero-title__line articles-hero-title__line--second"
            aria-hidden="true"
          >
            <span className="articles-hero-title__text">
              长期想法和创作记录。
            </span>
          </span>
        </h1>
      </section>

      <div className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/articles"
          className={cn(
            "filter-pill",
            activeCategory === "all" && "filter-pill--active"
          )}
        >
          {uiText.articles.allCategories}
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            href={`/articles?category=${encodeURIComponent(category)}`}
            className={cn(
              "filter-pill",
              activeCategory === category && "filter-pill--active"
            )}
          >
            {formatArticleCategory(category)}
          </Link>
        ))}
      </div>

      {collections.length > 0 ? (
        <section
          key={`collections-${activeCategory}`}
          className="mb-10 grid gap-5 md:grid-cols-2"
        >
          {collections.map((collection, index) => (
            <Link
              key={collection.slug}
              href={`/articles/collections/${collection.slug}`}
              className="filter-result-enter group block"
              style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
            >
              <CursorTiltCard
                as="div"
                className="grid overflow-hidden rounded-3xl border border-archive-line bg-archive-paper2"
              >
              {collection.cover ? (
                <img
                  src={collection.cover}
                  alt={collection.title}
                  className="tilt-card-media h-48 w-full object-cover"
                />
              ) : null}
              <div className="tilt-card-content p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-archive-muted">
                  <span>合集</span>
                  <span>{collection.articles.length} 篇文档</span>
                  {collection.featured ? <span>置顶</span> : null}
                </div>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-archive-ink">
                  {collection.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-archive-muted">
                  {collection.summary}
                </p>
              </div>
              </CursorTiltCard>
            </Link>
          ))}
        </section>
      ) : null}

      <section key={`articles-${activeCategory}`} className="grid gap-5">
        {filteredArticles.map((article, index) => (
          <div
            key={article.slug}
            className="filter-result-enter"
            style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
          >
            <ArticleCard article={article} />
          </div>
        ))}
      </section>
    </main>
  );
}
