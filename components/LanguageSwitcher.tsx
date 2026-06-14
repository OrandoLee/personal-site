"use client";

import { languageLabels, type SiteLanguage } from "@/lib/language";
import { useSiteLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/classNames";

const options: SiteLanguage[] = ["zh-Hans", "zh-Hant-TW"];

export function LanguageSwitcher() {
  const { language, switchLanguage } = useSiteLanguage();

  return (
    <div
      className="language-switcher inline-flex items-center rounded-full border border-archive-line bg-archive-paper p-1"
      role="group"
      aria-label="中文显示方式"
      data-no-translate
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={cn(
            "language-switcher__button rounded-full px-4 py-2 text-sm font-medium leading-none transition duration-200",
            language === option
              ? "bg-archive-paper2 text-archive-ink"
              : "text-archive-muted hover:bg-archive-paper2 hover:text-archive-ink"
          )}
          aria-pressed={language === option}
          onClick={() => switchLanguage(option)}
        >
          <span>{languageLabels[option].native}</span>
        </button>
      ))}
    </div>
  );
}
