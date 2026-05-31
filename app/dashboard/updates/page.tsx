import { DailyUpdatesManager } from "@/components/admin/DailyUpdatesManager";
import { uiText } from "@/content/uiText";

export const dynamic = "force-dynamic";

export default function UpdatesAdminPage() {
  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm text-zinc-500">{uiText.site.adminBrand}</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-white">
          {uiText.admin.updatesTitle}
        </h1>
      </section>
      <DailyUpdatesManager />
    </div>
  );
}
