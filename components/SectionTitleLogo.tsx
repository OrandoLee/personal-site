"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/classNames";

type SectionTitleLogoProps = {
  align?: "left" | "center";
  ariaLabel: string;
  className?: string;
  main: string;
  mainRatio: string;
  maxWidth?: string;
  tagline: string;
  taglineRatio: string;
  taglineWidth?: string;
};

type LogoStyle = CSSProperties & {
  "--section-title-main": string;
  "--section-title-main-ratio": string;
  "--section-title-max-width": string;
  "--section-title-tagline": string;
  "--section-title-tagline-ratio": string;
  "--section-title-tagline-width": string;
};

export function SectionTitleLogo({
  align = "left",
  ariaLabel,
  className,
  main,
  mainRatio,
  maxWidth = "440px",
  tagline,
  taglineRatio,
  taglineWidth = "58%"
}: SectionTitleLogoProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout: number | undefined;

    function showLogo() {
      timeout = window.setTimeout(() => setVisible(true), 180);
    }

    if (!document.querySelector(".splash-screen")) {
      showLogo();
      return () => window.clearTimeout(timeout);
    }

    const observer = new MutationObserver(() => {
      if (!document.querySelector(".splash-screen")) {
        observer.disconnect();
        showLogo();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className={cn(
        "section-title-logo text-archive-muted",
        align === "center" && "section-title-logo--center",
        visible && "section-title-logo--visible",
        className
      )}
      role="img"
      aria-label={ariaLabel}
      style={
        {
          "--section-title-main": `url("${main}")`,
          "--section-title-main-ratio": mainRatio,
          "--section-title-max-width": maxWidth,
          "--section-title-tagline": `url("${tagline}")`,
          "--section-title-tagline-ratio": taglineRatio,
          "--section-title-tagline-width": taglineWidth
        } as LogoStyle
      }
    >
      <span className="section-title-logo__main" aria-hidden="true" />
      <span className="section-title-logo__tagline" aria-hidden="true" />
    </div>
  );
}
