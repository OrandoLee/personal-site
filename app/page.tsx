import Link from "next/link";
import { AnimatedDate } from "@/components/AnimatedDate";
import { CursorTiltCard } from "@/components/CursorTiltCard";
import { ScrollRevealItem } from "@/components/ScrollRevealItem";
import { UpdateCard } from "@/components/UpdateCard";
import { uiText } from "@/content/uiText";
import { updateTypeMeta } from "@/data/updates";
import { getPublicUpdates } from "@/lib/public-content";

export const dynamic = "force-dynamic";

function todayInput() {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function getLatestUpdateDate(updates: { date: string }[]) {
  return updates.reduce<string | undefined>((latestDate, update) => {
    if (!latestDate || update.date > latestDate) {
      return update.date;
    }

    return latestDate;
  }, undefined);
}

export default async function HomePage() {
  const sortedUpdates = await getPublicUpdates();
  const today = todayInput();
  const todayUpdates = sortedUpdates.filter((update) => update.date === today);
  const currentUpdateDate =
    todayUpdates.length > 0 ? today : getLatestUpdateDate(sortedUpdates);
  const currentUpdates = currentUpdateDate
    ? sortedUpdates.filter((update) => update.date === currentUpdateDate)
    : [];
  const currentUpdateLabel =
    currentUpdateDate === today ? uiText.home.todayUpdates : "最近更新";
  const latestUpdates = sortedUpdates.slice(0, 4);

  return (
    <main>
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="pb-12 lg:pb-16">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <p className="max-w-[420px] text-sm leading-7 text-archive-muted">
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

          <h1 className="max-w-[1003px] font-serif text-[2.35rem] font-semibold leading-[1.12] text-archive-ink sm:text-7xl sm:leading-[1.06] lg:text-8xl">
            {uiText.home.heroTitle}
          </h1>
        </div>

        <div className="max-w-2xl">
          <div className="rounded-3xl bg-archive-paper2/75 p-7">
            <p className="mb-4 text-sm text-archive-muted">{currentUpdateLabel}</p>
            <h2 className="text-4xl font-semibold text-archive-ink">
              <AnimatedDate date={currentUpdateDate} />
            </h2>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-archive-muted">{currentUpdateLabel}</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold text-archive-ink">
              {uiText.home.newArchiveTitle}
            </h2>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {currentUpdates.length > 0 ? (
            currentUpdates.map((update, index) => (
              <ScrollRevealItem key={update.id} index={index} className="h-full">
                <UpdateCard update={update} />
              </ScrollRevealItem>
            ))
          ) : (
            <div className="rounded-3xl border border-archive-line bg-archive-paper2 p-7 text-archive-muted lg:col-span-3">
              今日还未有新的更新内容
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 pt-10">
          <p className="text-sm text-archive-muted">{uiText.home.categoryIndex}</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-archive-ink">
            {uiText.home.categoryIndexTitle}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {latestUpdates.map((update, index) => {
            const meta = updateTypeMeta[update.type];

            return (
              <ScrollRevealItem key={update.id} index={index} className="h-full">
                <Link
                href={update.link ?? "/"}
                className="group block h-full"
              >
                <CursorTiltCard
                  as="div"
                  className="h-full rounded-3xl border border-archive-line bg-archive-paper2 p-5"
                >
                  <div className="tilt-card-content">
                <div className="mb-8 flex flex-wrap gap-2">
                  {update.featured ? (
                    <span className="inline-flex rounded-full border border-archive-gold bg-archive-gold/10 px-2.5 py-1 text-xs text-archive-gold">
                      ★ 置顶
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${meta.tone}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <h3 className="display-serif text-2xl font-semibold text-archive-ink group-hover:text-archive-clay">
                  {update.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-archive-muted">
                  {update.description}
                </p>
                  </div>
                </CursorTiltCard>
                </Link>
              </ScrollRevealItem>
            );
          })}
          {latestUpdates.length === 0 ? (
            <div className="rounded-3xl border border-archive-line bg-archive-paper2 p-5 text-sm leading-7 text-archive-muted md:col-span-2 lg:col-span-4">
              暂无最新内容。
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
