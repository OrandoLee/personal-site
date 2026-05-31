"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { uiText } from "@/content/uiText";
import { cn } from "@/lib/classNames";

type AdminShellProps = {
  children: ReactNode;
  username: string;
};

const navItems = [
  { href: "/dashboard", label: uiText.admin.navDashboard },
  { href: "/dashboard/updates", label: uiText.admin.navUpdates },
  { href: "/dashboard/articles", label: uiText.admin.navArticles },
  { href: "/dashboard/gallery", label: uiText.admin.navGallery },
  { href: "/dashboard/orask", label: uiText.admin.navOrask },
  { href: "/dashboard/settings", label: uiText.admin.navSettings }
];

export function AdminShell({ children, username }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-[#11141a] px-5 py-6 lg:block">
        <Link href="/dashboard" className="block">
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">
            {uiText.site.brand}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold">
            {uiText.site.adminBrand}
          </h1>
        </Link>

        <nav className="mt-10 grid gap-2">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm transition",
                  active
                    ? "bg-white text-zinc-950"
                    : "text-zinc-400 hover:bg-white/8 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f1115]/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs",
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "border-white bg-white text-zinc-950"
                      : "border-white/10 text-zinc-400"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                {uiText.admin.loggedIn}
              </p>
              <p className="mt-1 text-sm text-zinc-300">{username}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/30 hover:text-white"
              >
                {uiText.admin.viewPublicSite}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white px-4 py-2 text-sm text-zinc-950 transition hover:bg-zinc-200"
              >
                {uiText.admin.logout}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
