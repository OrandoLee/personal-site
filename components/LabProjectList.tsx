import Link from "next/link";
import type { LabProject } from "@/data/lab";

type LabProjectListProps = {
  projects: LabProject[];
  emptyText: string;
};

function projectHref(project: LabProject) {
  if (project.openMode === "external" && project.externalUrl) {
    return project.externalUrl;
  }

  if (project.openMode === "internal" && project.internalPath) {
    return project.internalPath;
  }

  return `/lab/${project.slug}`;
}

export function LabProjectList({ projects, emptyText }: LabProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-archive-line bg-archive-paper2 p-7 text-sm leading-7 text-archive-muted">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {projects.map((project) => {
        const href = projectHref(project);
        const isExternal = project.openMode === "external" && project.externalUrl;

        return (
          <article
            key={project.id}
            className="group flex min-w-0 flex-col justify-between rounded-3xl border border-archive-line bg-archive-paper2 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-archive-ink"
          >
            <div>
              <div className="mb-8 flex flex-wrap gap-2 text-xs text-archive-muted">
                <span className="rounded-full border border-archive-line bg-archive-paper px-2.5 py-1">
                  类别：{project.category}
                </span>
                <span className="rounded-full border border-archive-line bg-archive-paper px-2.5 py-1">
                  状态：{project.status}
                </span>
              </div>
              <h2 className="font-serif text-3xl font-semibold leading-tight text-archive-ink transition group-hover:text-archive-clay">
                {project.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-archive-muted">
                {project.summary}
              </p>
            </div>

            <div className="mt-8">
              <Link
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className="inline-flex rounded-full border border-archive-ink bg-archive-ink px-4 py-2 text-sm text-archive-paper2 transition hover:bg-transparent hover:text-archive-ink"
              >
                进入实验
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
