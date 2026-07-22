import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./resume.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Not public portfolio content — keep it out of search indexes.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ResumeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${inter.variable} ${jetbrains.variable}`}>{children}</div>
  );
}
