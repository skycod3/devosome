import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

import { TooltipProvider } from "@/components/ui/tooltip";

import { Toaster } from "@/components/ui/sonner";

import { ABOUT_ME } from "@/constants/about";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = "DevOSome";
const title = `${ABOUT_ME.name} — ${ABOUT_ME.title}`;
const description = `Interactive OS-style portfolio of ${ABOUT_ME.name}, ${ABOUT_ME.title} with 8+ years of experience in React, Next.js and TypeScript.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — ${ABOUT_ME.name}`,
    template: `%s — ${siteName}`,
  },
  description,
  applicationName: siteName,
  authors: [{ name: ABOUT_ME.name, url: ABOUT_ME.contact.linkedin }],
  creator: ABOUT_ME.name,
  keywords: [
    ABOUT_ME.name,
    "frontend developer",
    "portfolio",
    "React",
    "Next.js",
    "TypeScript",
    "web developer",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${firaCode.variable} antialiased`}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>

          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
