import Link from "next/link";
import { ArticleEditor } from "@/components/admin/articles/ArticleEditor";
import { uiText } from "@/content/uiText";

export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">{uiText.site.adminBrand}</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-white">
            {uiText.admin.newArticle}
          </h1>
        </div>
        <Link
          href="/dashboard/articles"
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/30 hover:text-white"
        >
          {uiText.admin.backToArticleList}
        </Link>
      </section>
      <ArticleEditor />
    </div>
  );
}
