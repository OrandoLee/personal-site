import { LoginForm } from "@/components/admin/LoginForm";
import { uiText } from "@/content/uiText";
import { requireGuestLoginPage } from "@/lib/admin-auth";

export const metadata = {
  title: uiText.admin.loginTitle
};

export default function LoginPage() {
  requireGuestLoginPage();

  return (
    <main className="min-h-screen bg-[#0f1115] px-4 py-10 text-zinc-100 sm:px-6">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.36em] text-zinc-500">
            {uiText.site.brand}
          </p>
          <h1 className="mt-5 font-serif text-5xl font-semibold leading-tight sm:text-7xl">
            {uiText.admin.loginHeading}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400">
            {uiText.admin.loginIntro}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/25 sm:p-8">
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-semibold">
              {uiText.admin.loginPanelTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              {uiText.admin.loginHelp}
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
