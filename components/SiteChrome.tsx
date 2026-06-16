"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CustomCursor } from "@/components/CustomCursor";
import { Footer } from "@/components/Footer";
import { LanguageProvider, useSiteLanguage } from "@/components/LanguageProvider";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { SplashScreen } from "@/components/SplashScreen";

type SiteChromeProps = {
  children: ReactNode;
};

function PublicSiteChrome({ children }: SiteChromeProps) {
  const { splashEnabled } = useSiteLanguage();

  return (
    <div className="archive-shell">
      <CustomCursor />
      {splashEnabled ? <SplashScreen /> : null}
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </div>
  );
}

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const isCreatorAdmin =
    pathname === "/login" || pathname.startsWith("/dashboard");

  if (isCreatorAdmin) {
    return <>{children}</>;
  }

  return (
    <LanguageProvider>
      <PublicSiteChrome>{children}</PublicSiteChrome>
    </LanguageProvider>
  );
}
