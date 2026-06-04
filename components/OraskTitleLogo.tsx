"use client";

import { useEffect, useState } from "react";
import { uiText } from "@/content/uiText";
import { cn } from "@/lib/classNames";

type OraskTitleLogoProps = {
  className?: string;
};

export function OraskTitleLogo({ className }: OraskTitleLogoProps) {
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
        "orask-title-logo text-archive-muted",
        visible && "orask-title-logo--visible",
        className
      )}
      role="img"
      aria-label={uiText.orask.eyebrow}
    >
      <span className="orask-title-logo__main" aria-hidden="true" />
      <span className="orask-title-logo__tagline" aria-hidden="true" />
    </div>
  );
}
