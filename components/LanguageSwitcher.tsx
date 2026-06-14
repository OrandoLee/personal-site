"use client";

import { languageLabels, type SiteLanguage } from "@/lib/language";
import { useSiteLanguage } from "@/components/LanguageProvider";

const options: SiteLanguage[] = ["zh-Hans", "zh-Hant-TW"];

export function LanguageSwitcher() {
  const { language, switchLanguage } = useSiteLanguage();

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label="中文显示方式"
      data-no-translate
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className="language-switcher__button"
          aria-pressed={language === option}
          onClick={() => switchLanguage(option)}
        >
          <span aria-hidden="true">{languageLabels[option].short}</span>
          <span>{languageLabels[option].native}</span>
        </button>
      ))}
    </div>
  );
}
