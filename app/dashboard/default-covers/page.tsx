import { DefaultCoversManager } from "@/components/admin/DefaultCoversManager";

export default function DefaultCoversPage() {
  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm text-zinc-500">内容后台</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">默认封面</h1>
      </header>
      <DefaultCoversManager />
    </div>
  );
}
