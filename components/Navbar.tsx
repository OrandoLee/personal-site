"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoWordmark } from "@/components/LogoWordmark";
import { uiText } from "@/content/uiText";
import { cn } from "@/lib/classNames";

const navItems = [
  { href: "/", label: uiText.nav.home },
  { href: "/articles", label: uiText.nav.articles },
  { href: "/gallery", label: uiText.nav.gallery },
  { href: "/orask", label: uiText.nav.orask }
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-archive-paper/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="block shrink-0" aria-label={uiText.site.homeAria}>
          <LogoWordmark className="h-7 w-24 object-contain object-left sm:h-8 sm:w-28" />
        </Link>

        <nav className="flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-2 text-sm transition sm:px-4",
                  active
                    ? "bg-archive-ink text-archive-paper2"
                    : "text-archive-muted hover:bg-archive-paper2 hover:text-archive-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
