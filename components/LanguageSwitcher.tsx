"use client";

import { languageLabels, type SiteLanguage } from "@/lib/language";
import { useSiteLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/classNames";

const options: SiteLanguage[] = ["zh-Hans", "zh-Hant-TW"];

export function LanguageSwitcher() {
  const { language, switchLanguage } = useSiteLanguage();

  return (
    <div
      className="language-switcher inline-flex rounded-full border border-archive-line bg-archive-paper p-1"
      role="group"
      aria-label="中文显示方式"
      data-no-translate
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={cn(
            "language-switcher__button rounded-full px-3 py-1.5 text-xs transition",
            language === option
              ? "bg-archive-ink text-archive-paper2"
              : "text-archive-muted hover:text-archive-ink"
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
