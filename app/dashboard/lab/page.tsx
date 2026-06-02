import { LabProjectsManager } from "@/components/admin/LabProjectsManager";
import { uiText } from "@/content/uiText";

export const dynamic = "force-dynamic";

export default function LabAdminPage() {
  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm text-zinc-500">{uiText.site.adminBrand}</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-white">
          LAB 项目管理
        </h1>
      </section>
      <LabProjectsManager />
    </div>
  );
}
