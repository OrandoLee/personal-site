import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/SiteChrome";
import { uiText } from "@/content/uiText";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: uiText.site.metadataTitle,
    template: `%s | ${uiText.site.brand}`
  },
  description: uiText.site.metadataDescription
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
