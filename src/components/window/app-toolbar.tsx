"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * The "program menu bar" shell shared by the standalone apps (About Me, Skills,
 * Portfolio, Contact). It sticks to the top of the scrolling content area so each
 * window reads like a distinct application rather than a generic window. Per-app
 * controls are passed as children.
 */
export function AppToolbar({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`sticky top-0 z-10 flex flex-wrap items-center gap-1.5 border-b bg-background/85 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-background/60 ${className}`}
    >
      {children}
    </div>
  );
}

type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Render the button in its active/selected state. */
  active?: boolean;
};

/** A compact action/toggle button styled for the app toolbar. */
export function ToolbarButton({
  active = false,
  className = "",
  ...props
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      data-active={active}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=false]:hover:bg-accent ${className}`}
      {...props}
    />
  );
}

/** A thin vertical divider between toolbar groups. */
export function ToolbarSeparator() {
  return <span aria-hidden className="mx-1 h-4 w-px bg-border" />;
}
