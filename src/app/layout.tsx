import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

import { TooltipProvider } from "@/components/ui/tooltip";

import { Toaster } from "@/components/ui/sonner";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DevOSome - Developer Portfolio",
  description: "Showcasing projects and portfolio of a passionate developer.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: "no",
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
