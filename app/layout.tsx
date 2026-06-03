import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/SiteChrome";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeScript } from "@/components/ThemeScript";
import { uiText } from "@/content/uiText";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: uiText.site.metadataTitle,
    template: `%s | ${uiText.site.brand}`
  },
  description: uiText.site.metadataDescription,
  icons: {
    icon: [
      {
        url: "/favicon.svg?v=2",
        type: "image/svg+xml"
      }
    ],
    apple: "/apple-touch-icon.png?v=2"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
