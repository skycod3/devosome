"use client";

import { memo, useRef } from "react";

import { Taskbar } from "./taskbar";
import { Dock } from "./dock";
import { Wallpaper } from "./wallpaper";
import { IconGrid } from "./icon-grid";
import { DesktopEffects } from "./desktop-effects";
import { SpotlightLauncher } from "./spotlight-launcher";
import { SnapPreview } from "../window/snap-preview";
import { WindowLayer } from "../window/window-layer";

// Memoized so a re-render of the parent (DesktopWrapper — which subscribes to
// settings/recent) doesn't cascade through this stateless shell into the Dock,
// Taskbar, etc. Desktop takes no props, so the default comparison never re-renders it.
export const Desktop = memo(function Desktop() {
  const desktopRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={desktopRef}
      // tabIndex makes the desktop a programmatic focus target: when a window
      // closes and its opener is gone, focus returns here instead of <body>.
      tabIndex={-1}
      style={{ gridTemplateRows: "[taskbar] auto [desktop] 1fr [dock] auto" }}
      className="desktop-area relative grid h-dvh select-none overflow-hidden outline-none"
    >
      <Wallpaper />

      <div className="z-1" style={{ gridRow: "taskbar" }}>
        <Taskbar />
      </div>

      <div style={{ gridRow: "desktop" }}>
        <IconGrid />
      </div>

      <div style={{ gridRow: "dock" }}>
        <Dock />
      </div>

      <SnapPreview />

      <WindowLayer containerRef={desktopRef} />

      <SpotlightLauncher />

      <DesktopEffects />
    </div>
  );
});
