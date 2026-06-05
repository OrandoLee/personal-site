import Link from "next/link";
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
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <section className="mb-12 rounded-3xl bg-archive-paper2/70 p-7 sm:p-10">
        <SectionTitleLogo
          ariaLabel="Lab. Born from thought, built for value."
          className="mb-7"
          main="/section-logos/lab-main.svg"
          mainRatio="630 / 290"
          maxWidth="350px"
          tagline="/section-logos/lab-tagline.svg"
          taglineRatio="1670 / 340"
          taglineWidth="95%"
        />
        <h1 className="lab-title mt-4 max-w-none font-serif text-5xl font-semibold leading-tight text-archive-ink sm:text-7xl">
          <span className="lab-title-line">实验性作品、系统，</span>
          <span className="lab-title-line">以及尚未完成的项目。</span>
        </h1>
        <div className="mt-7 max-w-2xl text-base leading-8 text-archive-muted">
          <p>
            这里存放一些尚未完全命名的实验性项目、交互系统、视觉系统和小游戏原型。
          </p>
          <p>它们不一定完整，但都指向某种正在形成的东西。</p>
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
                "rounded-full border px-4 py-2 text-sm transition",
                activeCategory.key === category.key
                  ? "border-archive-ink bg-archive-ink text-archive-paper2"
                  : "border-archive-line bg-archive-paper2 text-archive-muted hover:border-archive-ink hover:text-archive-ink"
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
