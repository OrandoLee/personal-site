import Link from "next/link";
import { getPublicLabProjectBySlug } from "@/lib/public-content";

type LabDetailPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

function PendingPanel() {
  return (
    <div className="rounded-3xl border border-archive-line bg-archive-paper2 p-7 text-archive-muted">
      这个实验正在组装中。
    </div>
  );
}

export async function generateMetadata({ params }: LabDetailPageProps) {
  const project = await getPublicLabProjectBySlug(params.slug);

  return {
    title: project ? `${project.title} | LAB` : "项目不存在 | LAB"
  };
}

export default async function LabDetailPage({ params }: LabDetailPageProps) {
  const project = await getPublicLabProjectBySlug(params.slug);

  if (!project) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <Link
          href="/lab"
          className="inline-flex rounded-full border border-archive-line bg-archive-paper2 px-4 py-2 text-sm text-archive-muted transition hover:border-archive-ink hover:text-archive-ink"
        >
          返回 LAB
        </Link>
        <section className="mt-10 rounded-3xl bg-archive-paper2/70 p-7 sm:p-10">
          <p className="text-sm text-archive-muted">LAB</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight text-archive-ink sm:text-7xl">
            项目不存在。
          </h1>
        </section>
      </main>
    );
  }

  const openUrl =
    project.openMode === "embed"
      ? project.embedUrl
      : project.openMode === "external"
        ? project.externalUrl
        : project.internalPath;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Link
        href="/lab"
        className="inline-flex rounded-full border border-archive-line bg-archive-paper2 px-4 py-2 text-sm text-archive-muted transition hover:border-archive-ink hover:text-archive-ink"
      >
        ← 返回 LAB
      </Link>

      <section className="mt-10 rounded-3xl bg-archive-paper2/70 p-7 sm:p-10">
        <div className="mb-8 flex flex-wrap gap-2 text-xs text-archive-muted">
          <span className="rounded-full border border-archive-line bg-archive-paper px-2.5 py-1">
            类别：{project.category}
          </span>
          <span className="rounded-full border border-archive-line bg-archive-paper px-2.5 py-1">
            状态：{project.status}
          </span>
        </div>
        <h1 className="max-w-[760px] font-serif text-5xl font-semibold leading-tight text-archive-ink sm:text-7xl">
          {project.title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-archive-muted">
          {project.summary}
        </p>
        {project.description ? (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-archive-muted">
            {project.description}
          </p>
        ) : null}
      </section>

      <section className="mt-8">
        {project.openMode === "embed" && project.embedUrl ? (
          <div className="grid gap-4">
            <div className="flex justify-end">
              <Link
                href={project.embedUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-archive-ink bg-archive-ink px-4 py-2 text-sm text-archive-paper2 transition hover:bg-transparent hover:text-archive-ink"
              >
                新窗口打开
              </Link>
            </div>
            <div className="overflow-hidden rounded-3xl border border-archive-line bg-[#101010]">
              <iframe
                src={project.embedUrl}
                title={project.title}
                allow="fullscreen"
                className="block min-h-[680px] w-full border-0 sm:min-h-[760px]"
              />
            </div>
          </div>
        ) : null}

        {project.openMode === "embed" && !project.embedUrl ? <PendingPanel /> : null}

        {project.openMode === "external" && project.externalUrl ? (
          <div className="rounded-3xl border border-archive-line bg-archive-paper2 p-7">
            <p className="max-w-2xl text-sm leading-7 text-archive-muted">
              这个实验将在独立页面中打开。
            </p>
            <Link
              href={project.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full border border-archive-ink bg-archive-ink px-4 py-2 text-sm text-archive-paper2 transition hover:bg-transparent hover:text-archive-ink"
            >
              新窗口打开
            </Link>
          </div>
        ) : null}

        {project.openMode === "external" && !project.externalUrl ? (
          <PendingPanel />
        ) : null}

        {project.openMode === "internal" && openUrl ? (
          <div className="rounded-3xl border border-archive-line bg-archive-paper2 p-7">
            <p className="max-w-2xl text-sm leading-7 text-archive-muted">
              这个实验使用主站内部页面展示。
            </p>
            <Link
              href={openUrl}
              className="mt-6 inline-flex rounded-full border border-archive-ink bg-archive-ink px-4 py-2 text-sm text-archive-paper2 transition hover:bg-transparent hover:text-archive-ink"
            >
              打开内部页面
            </Link>
          </div>
        ) : null}

        {project.openMode === "internal" && !openUrl ? <PendingPanel /> : null}
      </section>
    </main>
  );
}
