import Link from "next/link";
import { AnimatedDate } from "@/components/AnimatedDate";
import { UpdateCard } from "@/components/UpdateCard";
import { uiText } from "@/content/uiText";
import type { UpdateType } from "@/data/updates";
import { updateTypeMeta } from "@/data/updates";
import { getPublicUpdates } from "@/lib/public-content";

const updateOrder: UpdateType[] = ["article", "image", "video", "project", "note"];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sortedUpdates = await getPublicUpdates();
  const latestDate = sortedUpdates[0]?.date ?? new Date().toISOString().slice(0, 10);
  const todayUpdates = sortedUpdates.filter((update) => update.date === latestDate);
  const highlights = updateOrder.reduce<Array<(typeof sortedUpdates)[number]>>(
    (items, type) => {
      const update = sortedUpdates.find((item) => item.type === type);

      if (update) {
        items.push(update);
      }

      return items;
    },
    []
  );

  return (
    <main>
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="pb-12 lg:pb-16">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <p className="max-w-[268px] text-sm leading-7 text-archive-muted">
              {uiText.home.intro}
            </p>
            <div className="flex gap-3">
              <Link
                href="/articles"
                className="rounded-full border border-archive-ink bg-archive-ink px-5 py-3 text-sm text-archive-paper2 transition hover:bg-transparent hover:text-archive-ink"
              >
                {uiText.home.readArticles}
              </Link>
              <Link
                href="/gallery"
                className="rounded-full border border-archive-line bg-archive-paper2 px-5 py-3 text-sm text-archive-ink transition hover:border-archive-ink"
              >
                {uiText.home.viewGallery}
              </Link>
            </div>
          </div>

          <h1 className="max-w-[1003px] font-serif text-5xl font-semibold leading-[1.06] text-archive-ink sm:text-7xl lg:text-8xl">
            {uiText.home.heroTitle}
          </h1>
        </div>

        <div className="max-w-2xl">
          <div className="rounded-3xl bg-archive-paper2/75 p-7">
            <p className="mb-4 text-sm text-archive-muted">{uiText.home.todayUpdates}</p>
            <h2 className="text-4xl font-semibold text-archive-ink">
              <AnimatedDate date={latestDate} />
            </h2>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-archive-muted">{uiText.home.todayUpdates}</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold text-archive-ink">
              {uiText.home.newArchiveTitle}
            </h2>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {todayUpdates.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 pt-10">
          <p className="text-sm text-archive-muted">{uiText.home.categoryIndex}</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-archive-ink">
            {uiText.home.categoryIndexTitle}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
          {highlights.map((update) => {
            const meta = updateTypeMeta[update.type];

            return (
              <Link
                key={update.id}
                href={update.link ?? "/"}
                className="group rounded-3xl border border-archive-line bg-archive-paper2 p-5 transition hover:-translate-y-0.5 hover:shadow-archive"
              >
                <div
                  className={`mb-8 inline-flex rounded-full border px-2.5 py-1 text-xs ${meta.tone}`}
                >
                  {meta.label}
                </div>
                <h3 className="display-serif text-2xl font-semibold text-archive-ink group-hover:text-archive-clay">
                  {update.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-archive-muted">
                  {update.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
