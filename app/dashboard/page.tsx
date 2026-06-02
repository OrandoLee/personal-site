import Link from "next/link";
import { uiText } from "@/content/uiText";
import { updateTypeMeta } from "@/data/updates";
import { serializeOraskMessage } from "@/lib/content-serializers";
import { prisma } from "@/lib/db";
import { getPublicUpdates } from "@/lib/public-content";

export const dynamic = "force-dynamic";

async function getLabProjectCount() {
  try {
    return await prisma.labProject.count();
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const [
    publishedArticles,
    draftArticles,
    galleryCount,
    labCount,
    unreadOraskCount,
    autoUpdates,
    recentMessages
  ] = await Promise.all([
    prisma.article.count({ where: { published: true } }),
    prisma.article.count({ where: { published: false } }),
    prisma.galleryItem.count(),
    getLabProjectCount(),
    prisma.oraskMessage.count({ where: { read: false } }),
    getPublicUpdates(),
    prisma.oraskMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const stats = [
    { label: uiText.admin.publishedArticles, value: publishedArticles, href: "/dashboard/articles" },
    { label: uiText.admin.draftArticles, value: draftArticles, href: "/dashboard/articles" },
    { label: uiText.admin.galleryWorks, value: galleryCount, href: "/dashboard/gallery" },
    { label: "LAB 项目", value: labCount, href: "/dashboard/lab" },
    { label: uiText.admin.dailyUpdates, value: autoUpdates.length, href: "/dashboard/updates" },
    { label: uiText.admin.unreadOrask, value: unreadOraskCount, href: "/dashboard/orask" }
  ];

  return (
    <div className="grid gap-8">
      <section>
        <p className="text-sm text-zinc-500">{uiText.site.adminBrand}</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-white sm:text-5xl">
          {uiText.admin.dashboardTitle}
        </h1>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-white/25"
          >
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <p className="mt-5 text-4xl font-semibold text-white">
              {stat.value}
            </p>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-serif text-2xl font-semibold">
            {uiText.admin.recentUpdates}
          </h2>
          <div className="mt-5 grid gap-3">
            {autoUpdates.slice(0, 5).map((update) => (
              <Link
                key={update.id}
                href="/dashboard/updates"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/25"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium text-white">{update.title}</h3>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-400">
                    {updateTypeMeta[update.type].label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-500">{update.date}</p>
              </Link>
            ))}
            {autoUpdates.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                暂无自动更新内容。
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-serif text-2xl font-semibold">
            {uiText.admin.recentOrask}
          </h2>
          <div className="mt-5 grid gap-3">
            {recentMessages.map((row) => {
              const message = serializeOraskMessage(row);

              return (
                <Link
                  key={message.id}
                  href="/dashboard/orask"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/25"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium text-white">{message.subject}</h3>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-400">
                      {message.read ? uiText.admin.read : uiText.admin.unread}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    {message.name} / {message.email}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
