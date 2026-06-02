import Link from "next/link";
import { LogoWordmark } from "@/components/LogoWordmark";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { uiText } from "@/content/uiText";

export function Footer() {
  return (
    <footer className="border-t border-archive-line bg-archive-paper2">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 text-sm text-archive-muted sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <LogoWordmark className="mb-5 h-8 w-28 object-contain object-left" />
          <p className="max-w-xl leading-7">{uiText.footer.description}</p>
        </div>
        <div className="flex flex-col items-start gap-5 lg:items-end lg:self-start">
          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            <Link href="/" className="inline-flex h-5 items-center leading-5 transition hover:text-archive-ink">
              {uiText.nav.home}
            </Link>
            <Link href="/articles" className="inline-flex h-5 items-center leading-5 transition hover:text-archive-ink">
              {uiText.nav.articles}
            </Link>
            <Link href="/gallery" className="inline-flex h-5 items-center leading-5 transition hover:text-archive-ink">
              {uiText.nav.gallery}
            </Link>
            <Link href="/orask" className="inline-flex h-5 items-center leading-5 transition hover:text-archive-ink">
              {uiText.nav.orask}
            </Link>
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}
