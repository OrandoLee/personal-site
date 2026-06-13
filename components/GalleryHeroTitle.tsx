"use client";

import { useEffect, useState } from "react";
import { SectionTitleLogo } from "@/components/SectionTitleLogo";
import { cn } from "@/lib/classNames";

export function GalleryHeroTitle() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout: number | undefined;

    function showTitle() {
      timeout = window.setTimeout(() => setVisible(true), 180);
    }

    if (!document.querySelector(".splash-screen")) {
      showTitle();
      return () => window.clearTimeout(timeout);
    }

    const observer = new MutationObserver(() => {
      if (!document.querySelector(".splash-screen")) {
        observer.disconnect();
        showTitle();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div>
      <SectionTitleLogo
        ariaLabel="Image. Ideas visualized."
        className="mb-7"
        main="/section-logos/gallery-main.svg"
        mainRatio="500 / 150"
        maxWidth="420px"
        tagline="/section-logos/gallery-tagline.svg"
        taglineOffset="0.9rem"
        taglineRatio="1265 / 90"
        taglineWidth="88%"
      />
      <h1
        className={cn(
          "gallery-hero-title mt-4 max-w-[509px] font-serif text-5xl font-semibold leading-tight text-archive-ink sm:text-7xl",
          visible && "gallery-hero-title--visible"
        )}
      >
        <span className="gallery-hero-title__line">设计，想法的</span>
        <span className="gallery-hero-title__line">可视化展现。</span>
      </h1>
    </div>
  );
}
