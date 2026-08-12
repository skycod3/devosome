import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

/**
 * Loading placeholders for the code-split apps, mirroring each app's layout so
 * the window doesn't reflow when the chunk lands.
 *
 * These have to stay in the eager bundle: they are the Suspense fallback for
 * the lazy apps (wired up in constants/applications.ts), so importing them from
 * inside an app module would make the fallback suspend on the very chunk it is
 * covering. Keep this file free of heavy imports.
 */

/** Skeleton bar whose pulse is decorative, so it opts out of reduced motion. */
function Bar({
  className,
  styles,
}: {
  className?: string;
  styles?: CSSProperties;
}) {
  return (
    <Skeleton
      style={styles}
      className={cn("motion-reduce:animate-none", className)}
    />
  );
}

function repeat(count: number) {
  return Array.from({ length: count }, (_, i) => i);
}

/** Ragged bar row standing in for the action row atop the hero-style apps. */
function PanelHeading({ items = 4 }: { items?: number }) {
  const widths = ["w-14", "w-18", "w-20", "w-28"];

  return (
    <div className="flex gap-2">
      {repeat(items).map((i) => (
        <Bar key={i} className={cn("h-5", widths[i % widths.length])} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Files: documents, pictures, music, videos, recent
// ---------------------------------------------------------------------------
/** `items` matches the busiest view (Pictures); guessing high collapses rows
 * when the real, sparser listing arrives. */
export function FileBrowserSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Mirrors file-browser.tsx's toolbar: view toggles pinned right. */}
      <div className="flex shrink-0 items-center justify-end border-b bg-card px-4 py-2">
        <div className="flex items-center gap-1">
          <Bar className="size-6" />
          <Bar className="size-6" />
        </div>
      </div>
      <div className="grid-cols-fill-6 @min-5xl:grid-cols-fill-7 grid content-start gap-4 p-4">
        {repeat(items).map((i) => (
          <div key={i} className="grid justify-items-center gap-2">
            <Bar className="size-13" />
            <div className="grid place-items-center">
              <Bar className="h-3 w-14" />
              <Bar className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Terminal
// ---------------------------------------------------------------------------
export function TerminalSkeleton() {
  return (
    // bg-background mirrors the real Terminal root; the window underneath is
    // bg-popover, so leaving this transparent renders it noticeably lighter.
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex-1 space-y-2 p-3">
        <Bar className="h-4 w-48" />
        <Bar className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-2 border-t border-border px-3 py-3.5">
        <Bar className="h-3 w-36" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skills — filter chips over grouped cards
// ---------------------------------------------------------------------------
export function SkillsSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-4 md:p-6">
      <PanelHeading items={8} />
      <div className="mt-8 space-y-4">
        <div className="space-y-3">
          <Bar className="h-3 w-28" />
          <div className="grid-cols-fill-18 grid items-start gap-4">
            {repeat(6).map((i) => (
              <Bar key={i} className="h-56" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Portfolio — project cards with a media band on top
// ---------------------------------------------------------------------------
export function PortfolioSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-4 md:p-6">
      <PanelHeading items={7} />
      <div className="grid gap-2 mt-8">
        <Bar className="h-4 w-28" />
        <Bar className="h-3 w-1/3" />
      </div>
      <div className="grid-cols-fill-15 grid gap-4">
        {repeat(3).map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-md border border-border"
          >
            <Bar className="h-36 w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Bar className="h-4 w-32" />
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-3/4" />
              <div className="flex flex-wrap gap-1 mt-4">
                {repeat(4).map((chip) => (
                  <Bar key={chip} className="h-3 w-14 rounded-full" />
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Bar className="h-6 w-18" />
                <Bar className="h-6 w-18" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contact — two-up name/email row, then stacked fields
// ---------------------------------------------------------------------------
export function ContactSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-4 md:p-6">
      <PanelHeading />
      <div className="grid gap-2 mt-8">
        <Bar className="h-4 w-32" />
        <Bar className="h-3 w-1/3" />
      </div>

      <div className="space-y-4 mt-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Bar className="h-3 w-16" />
            <Bar className="h-9" />
          </div>
          <div className="space-y-2">
            <Bar className="h-3 w-16" />
            <Bar className="h-9" />
          </div>
        </div>
        <div className="space-y-2">
          <Bar className="h-3 w-16" />
          <Bar className="h-9" />
        </div>
        <div className="space-y-2">
          <Bar className="h-3 w-16" />
          <Bar className="h-28" />
        </div>
        <Bar className="h-3 w-32" />
        <Bar className="h-10 w-full" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// About Me — centred avatar, then text sections
// ---------------------------------------------------------------------------
export function AboutMeSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-4 md:p-6">
      <PanelHeading />
      <div className="grid justify-items-center gap-4 mt-8">
        <Bar className="size-28 mt-18 mb-10" />
        <div className="grid justify-items-center gap-2">
          <Bar className="h-5 w-40" />
          <Bar className="h-3 w-56" />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {repeat(2).map((i) => (
            <Bar key={i} className="h-5 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Bar className="h-3 w-28" />
        <Bar className="h-3 w-full" />
        <Bar className="h-3 w-full" />
        <Bar className="h-3 w-5/6" />
        <Bar className="h-3 w-full" />
        <Bar className="h-3 w-5/6" />
        <Bar className="h-3 w-5/12" />
        <Bar className="h-3 w-5/6" />
        <Bar className="h-3 w-full" />
        <Bar className="h-3 w-5/6" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// System Settings — fixed-width nav rail beside the panel
// ---------------------------------------------------------------------------
export function SystemSettingsSkeleton() {
  return (
    <div className="flex h-full overflow-hidden">
      <nav className="flex w-36 shrink-0 flex-col gap-3 border-r border-border p-2">
        {repeat(4).map((i) => (
          <Bar
            key={i}
            styles={
              { "--bar-width": `calc(100% - ${i * 20}px)` } as CSSProperties
            }
            className={`h-7 w-(--bar-width)`}
          />
        ))}
      </nav>
      <div className="flex-1 space-y-4 p-4">
        <Bar className="h-4 w-24" />
        <div className="grid gap-2">
          {repeat(3).map((i) => (
            <Bar key={i} className="h-5 w-20" />
          ))}
        </div>
        <Bar className="h-4 w-28" />
        <div className="flex gap-2 mt-6">
          <Bar className="size-4" />
          <Bar className="h-4 w-40" />
          <Bar className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact panels: clipboard history, system monitor
// ---------------------------------------------------------------------------
export function ClipboardHistorySkeleton() {
  return (
    <div className="flex h-full flex-col gap-6.5 p-4">
      <Bar className="h-3 w-15" />
      {repeat(4).map((i) => (
        <div key={i} className="flex items-center">
          <div className="flex-1 grid gap-1 pl-3">
            <Bar className="w-10 h-3" />
            <Bar className="w-1/2 h-3" />
          </div>

          <Bar className="size-4 mr-3" />
        </div>
      ))}
      <Bar className="h-3 w-15" />
      {repeat(2).map((i) => (
        <div key={i} className="flex items-center">
          <div className="flex-1 grid gap-1 pl-3">
            <Bar className="w-10 h-3" />
            <Bar className="w-1/2 h-3" />
          </div>

          <Bar className="size-4 mr-3" />
        </div>
      ))}
    </div>
  );
}

export function SystemMonitorSkeleton() {
  return (
    <div className="flex h-full flex-col gap-5.5 p-4">
      {repeat(4).map((i) => (
        <div key={i} className="space-y-2">
          <Bar className="h-3 w-16 rounded-md" />
          <div className="space-y-4 rounded-md border border-border p-3">
            {repeat(3).map((row) => (
              <div key={row} className="flex items-baseline justify-between">
                <Bar className="h-3 w-18" />
                <Bar className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notes — sticky note, so the bars are tinted for the paper background
// ---------------------------------------------------------------------------
export function NotesSkeleton() {
  return (
    <div className="h-fit bg-[#fdf6c9] p-6">
      <div className="mx-auto max-w-md -rotate-1 space-y-4">
        <div className="h-7 w-48 animate-pulse rounded-md bg-neutral-800/10 motion-reduce:animate-none" />
        <div className="space-y-2">
          <div className="h-5 w-24 animate-pulse rounded-md bg-neutral-800/10 motion-reduce:animate-none" />
          {repeat(14).map((line) => (
            <div
              key={line}
              className={`h-4 ${line % 2 ? "w-10/12" : "w-full"} animate-pulse rounded-md bg-neutral-800/10 motion-reduce:animate-none`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
