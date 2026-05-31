"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { SplashScreen } from "@/components/SplashScreen";

type SiteChromeProps = {
  children: ReactNode;
};

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const isCreatorAdmin =
    pathname === "/login" || pathname.startsWith("/dashboard");

  if (isCreatorAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="archive-shell">
      <SplashScreen />
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </div>
  );
}
