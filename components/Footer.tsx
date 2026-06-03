import Link from "next/link";
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
    <footer className="border-t border-[#27231f] bg-[#111111] text-[#f4efe6]">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8 lg:py-20">
        <div className="flex min-h-[220px] flex-col justify-between gap-10">
          <div>
            <LogoWordmark className="h-9 w-32 object-contain object-left brightness-0 invert dark:brightness-100 dark:invert-0" />
          </div>
          <p className="max-w-xl text-base leading-8 text-[#d6d0c6]">
            {uiText.footer.description}
          </p>
        </div>

        <div className="grid gap-10 lg:justify-self-end">
          <nav aria-label="底部导航" className="grid gap-4">
            <p className="text-sm font-semibold text-[#f4efe6]">导航</p>
            <div className="grid gap-4">
              {footerNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xl leading-7 text-[#d6d0c6] transition hover:text-[#f4efe6]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <p className="mb-3 text-sm font-semibold text-[#f4efe6]">外观</p>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
