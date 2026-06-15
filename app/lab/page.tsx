import Link from "next/link";
import { LabTypedTitle } from "@/components/LabTypedTitle";
import { LabProjectList } from "@/components/LabProjectList";
import { SectionTitleLogo } from "@/components/SectionTitleLogo";
import {
  getLabCategory,
  isLabCategoryKey,
  labCategories
} from "@/data/lab";
import { cn } from "@/lib/classNames";
import { getPublicLabProjects } from "@/lib/public-content";

type LabPageProps = {
  searchParams?: {
    category?: string;
  };
};

export const metadata = {
  title: "LAB"
};

export const dynamic = "force-dynamic";

export default async function LabPage({ searchParams }: LabPageProps) {
  const categoryParam = searchParams?.category;
  const activeCategoryKey =
    categoryParam && isLabCategoryKey(categoryParam) ? categoryParam : "all";
  const activeCategory = getLabCategory(activeCategoryKey) ?? labCategories[0];
  const projects = await getPublicLabProjects(
    activeCategoryKey === "all" ? undefined : activeCategoryKey
  );
  const emptyText =
    activeCategoryKey === "all"
      ? "暂无公开实验。更多东西正在组装中。"
      : "这个分类下暂时没有公开实验。";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="lab-crt-hero mb-12" aria-labelledby="lab-page-title">
        <div className="lab-crt-shell">
          <div className="lab-crt-speaker" aria-hidden="true" />
          <div className="lab-crt-screen">
            <div className="lab-crt-content">
              <SectionTitleLogo
                ariaLabel="Lab. Born from thought, built for value."
                className="lab-logo-crt mb-7"
                main="/section-logos/lab-main.svg"
                mainRatio="630 / 290"
                maxWidth="300px"
                tagline="/section-logos/lab-tagline.svg"
                taglineRatio="1670 / 340"
                taglineWidth="95%"
              />
              <LabTypedTitle
                id="lab-page-title"
                className="lab-title lab-type-title mt-4 max-w-none font-serif text-5xl font-semibold leading-tight sm:text-7xl"
              />
              <div className="lab-type-body mt-7 max-w-2xl text-base leading-8">
                <p className="lab-copy-line lab-copy-line--one">
                  <span>
                    这里存放一些尚未完全命名的实验性项目、交互系统、视觉系统和小游戏原型。
                  </span>
                </p>
                <p className="lab-copy-line lab-copy-line--two">
                  <span>它们不一定完整，但都指向某种正在形成的东西。</span>
                </p>
              </div>
            </div>
          </div>
          <div className="lab-crt-panel" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-archive-muted">
            当前分类：{activeCategory.label}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {labCategories.map((category) => (
            <Link
              key={category.key}
              href={category.href}
              className={cn(
                "filter-pill",
                activeCategory.key === category.key && "filter-pill--active"
              )}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <LabProjectList projects={projects} emptyText={emptyText} />
      </section>

    </main>
  );
}
