import Link from "next/link";
import type { CSSProperties } from "react";

import { GlitchText } from "@/components/effects/glitch-text";
import { Button } from "@/components/ui/button";

const BSOD_BLUE = "#0078d7";

export default function NotFound() {
  return (
    <main
      style={{
        backgroundColor: BSOD_BLUE,
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
      className="flex h-dvh w-full flex-col justify-center gap-6 px-6 text-white sm:px-16 md:px-24 lg:px-40"
    >
      <div style={{
        "--glitch-bg": BSOD_BLUE,
        "--glitch-color": "#ffffff",
      } as CSSProperties} className="text-7xl font-light sm:text-8xl" aria-hidden>
        <GlitchText
          speed={1}
          enableShadows
          enableOnHover={false}
          className="font-mono"
        >
          :(
        </GlitchText>
      </div>

      <div className="max-w-2xl space-y-3">
        <h1 className="text-xl text-white font-normal leading-relaxed sm:text-2xl">
          This page ran into a problem and couldn&apos;t be found. You can head
          back to the desktop and try again.
        </h1>
        <p className="text-sm text-white/80 sm:text-base">
          We&apos;re not collecting any error info — your data stays yours.
        </p>
      </div>

      <div className="space-y-1.5 text-sm text-white/90 sm:text-base">
        <p>If you call a support person, give them this info:</p>
        <div className="flex flex-wrap items-center gap-x-2">
          <span>Stop code:</span>
          <span className="font-mono">PAGE_NOT_FOUND</span>
        </div>
      </div>

      <div className="pt-2">
        <Button
          asChild
          variant="outline"
          className="border-white/70 bg-transparent text-white hover:bg-white/15 hover:text-white"
        >
          <Link href="/">Return to desktop</Link>
        </Button>
      </div>
    </main>
  );
}
