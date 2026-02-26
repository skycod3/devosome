"use client";

import dynamic from "next/dynamic";

const Desktop = dynamic(
  () =>
    import("./desktop").then((mod) => ({
      default: mod.Desktop,
    })),
  {
    ssr: false,
  },
);

export function DesktopWrapper() {
  return <Desktop />;
}
