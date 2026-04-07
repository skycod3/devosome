import WallpaperImage from "@/assets/wallpaper.jpg";

import { useEffect } from "react";

import { AnimatePresence } from "motion/react";

import { DESKTOP_ICONS } from "@/constants/icons";
import { APPLICATIONS } from "@/constants/applications";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";

import { Taskbar } from "./taskbar";
import { Icon } from "../icon";
import { Window } from "../window";
import { Dock } from "./dock";

export function Desktop() {
  const { icons, hasHydrated, setIcons, unhighlightAllIcons } = useIcons();
  const { windows } = useWindows();

  function handleDesktopClick(event: React.MouseEvent<HTMLDivElement>) {
    // Only handle clicks directly on the desktop div, not on child elements
    if (event.target !== event.currentTarget) return;

    if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
  }

  // Run on mount and whenever windows change (to clean up orphaned icons)
  useEffect(() => {
    // Wait for Zustand persist to hydrate before initializing
    if (!hasHydrated) return;

    // Initialize icons only if empty (prevents duplication on remount)
    if (icons.length === 0) {
      setIcons(DESKTOP_ICONS);
      return;
    }

    // Clean orphaned icons (with parentId but no matching window)
    const cleanedIcons = icons.filter((icon) => {
      // Keep desktop icons (no parentId)
      if (!icon.parentId) return true;
      // Keep icons whose parent is an open window
      if (windows.some((w) => w.iconId === icon.parentId)) return true;
      // Keep icons whose parent app supports tabs (exists as tab content, not standalone window)
      if (APPLICATIONS[icon.parentId]?.showTabs) return true;
      // Keep icons whose parent is in the availableTabs of an open tabbed window
      const parentIsActiveTab = windows.some((w) => {
        if (!w.showTabs) return false;
        const parentApp = APPLICATIONS[w.iconId];
        return parentApp?.availableTabs?.includes(icon.parentId || '') ?? false;
      });
      if (parentIsActiveTab) return true;
      return false;
    });

    // Update only if cleaning removed icons
    if (cleanedIcons.length !== icons.length) {
      setIcons(cleanedIcons);
    }
  }, [hasHydrated, windows.length]);

  return (
    <div
      style={{
        backgroundImage: `url(${WallpaperImage.src})`,
        gridTemplateRows: "[taskbar] auto [desktop] 1fr [dock] auto",
      }}
      className="relative grid h-screen bg-cover bg-top select-none overflow-hidden"
    >
      <div style={{ gridRow: "taskbar" }}>
        <Taskbar />
      </div>

      <div style={{ gridRow: "desktop" }}>
        <div
          className="text-white grid-cols-fill-7 grid-rows-fill-7 grid h-full grid-flow-col place-items-center gap-4 p-4"
          onClick={handleDesktopClick}
        >
          {icons
            .filter((icon) => !icon.parentId)
            .map((icon) => (
              <Icon key={icon.id} {...icon} />
            ))}
        </div>
      </div>

      <div style={{ gridRow: "dock" }}>
        <Dock />
      </div>

      <AnimatePresence>
        {windows.map((window) => (
          <Window key={window.id} window={window} />
        ))}
      </AnimatePresence>
    </div>
  );
}
