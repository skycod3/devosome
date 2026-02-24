import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DevOSome - Developer Portfolio",
  description: "Showcasing projects and portfolio of a passionate developer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${firaCode.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
