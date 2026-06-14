import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoWordmark } from "@/components/LogoWordmark";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { uiText } from "@/content/uiText";

const footerNavItems = [
  { href: "/", label: uiText.nav.home },
  { href: "/articles", label: uiText.nav.articles },
  { href: "/gallery", label: uiText.nav.gallery },
  { href: "/lab", label: "LAB" },
  { href: "/orask", label: uiText.nav.orask }
];

export function Footer() {
  return (
    <footer className="border-t border-archive-line bg-archive-paper2">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 text-sm text-archive-muted sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <LogoWordmark className="mb-5 h-8 w-28 object-contain object-left" />
          <p className="max-w-xl leading-7">{uiText.footer.description}</p>
        </div>
        <div className="flex flex-col items-start gap-5 lg:items-end lg:self-start">
          <nav
            aria-label="底部导航"
            className="flex flex-wrap items-center gap-4 lg:justify-end"
          >
            {footerNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-5 items-center leading-5 transition hover:text-archive-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
