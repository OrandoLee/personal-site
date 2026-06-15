import Link from "next/link";
import { CursorTiltCard } from "@/components/CursorTiltCard";
import type { UpdateItem } from "@/data/updates";
import { updateTypeMeta } from "@/data/updates";
import { formatDate } from "@/lib/format";

type UpdateCardProps = {
  update: UpdateItem;
  compact?: boolean;
};

export function UpdateCard({ update, compact = false }: UpdateCardProps) {
  const meta = updateTypeMeta[update.type];
  const content = (
    <CursorTiltCard className="group h-full overflow-hidden rounded-3xl border border-archive-line bg-archive-paper2">
      {update.cover ? (
        <div className="tilt-card-media aspect-[16/10] overflow-hidden border-b border-archive-line bg-archive-paper">
          <img
            src={update.cover}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}
      <div className={compact ? "tilt-card-content p-5" : "tilt-card-content p-6 sm:p-7"}>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          {update.featured ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-archive-gold bg-archive-gold/10 px-2.5 py-1 text-xs text-archive-gold">
              <span aria-hidden="true">★</span>
              置顶
            </span>
          ) : null}
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${meta.tone}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
          <time className="text-xs text-archive-muted">
            {formatDate(update.date)}
          </time>
        </div>
        <h3 className="display-serif text-2xl font-semibold leading-tight text-archive-ink">
          {update.title}
        </h3>
        <p className="mt-4 text-sm leading-7 text-archive-muted">
          {update.description}
        </p>
      </div>
    </CursorTiltCard>
  );

  if (!update.link) {
    return content;
  }

  return (
    <Link href={update.link} className="block h-full">
      {content}
    </Link>
  );
}
