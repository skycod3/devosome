import { Dispatch, SetStateAction, useState } from "react";

import { Window } from "@/stores/windows.store";

import { useIcons } from "@/hooks/useIcons";
import { useViewport } from "@/hooks/useViewport";
import { useWindows } from "@/hooks/useWindows";
import { APPLICATIONS } from "@/constants/applications";

import { animate, DragControls, MotionValue } from "motion/react";

import { LuHouse } from "react-icons/lu";
import {
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore,
  VscClose,
} from "react-icons/vsc";

interface WindowHeaderProps {
  window: Window;
  windowTitle: string;
  setIsAnimating: Dispatch<SetStateAction<boolean>>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  mvWidth: MotionValue<number>;
  mvHeight: MotionValue<number>;
  mvRadius: MotionValue<number>;
  dragControls: DragControls;
  isMobile?: boolean;
}

export function WindowHeader({
  window,
  windowTitle,
  setIsAnimating,
  x,
  y,
  mvWidth,
  mvHeight,
  mvRadius,
  dragControls,
  isMobile = false,
}: WindowHeaderProps) {
  const {
    windows,
    restoreWindow,
    openWindowCentered,
    closeWindow,
    toggleMaximize,
    setWindowSize,
    minimizeWindow,
    setWindowActiveTab,
  } = useWindows();

  const [isGrabbing, setIsGrabbing] = useState(false);

  const { icons } = useIcons();
  const { width, height } = useViewport();

  const parentIcon = icons.find((icon) => icon.id === window.parentId);

  function handleMaximize() {
    const wasMaximized = window.isMaximized;
    const transition = { duration: 0.18, ease: "easeOut" as const };

    if (!wasMaximized) {
      // Maximizing: animate to fullscreen
      // Safe: React 19 batches these store updates; useEffects won't fire until after this handler
      toggleMaximize(window.id);
      setWindowSize(window.id, width, height);

      setIsAnimating(true);
      Promise.all([
        animate(x, 0, transition),
        animate(y, 0, transition),
        animate(mvWidth, width, transition),
        animate(mvHeight, height, transition),
        animate(mvRadius, 0, transition),
      ]).then(() => {
        setIsAnimating(false);
      });
    } else {
      // Restoring: capture restore values BEFORE toggleMaximize clears them
      // (React props are snapshots — window still has the old state here)
      const restorePos = window.restorePosition ?? window.position;
      const restoreSize = window.restoreSize ?? window.size;

      toggleMaximize(window.id);

      setIsAnimating(true);
      Promise.all([
        animate(x, restorePos.x, transition),
        animate(y, restorePos.y, transition),
        animate(mvWidth, restoreSize.width, transition),
        animate(mvHeight, restoreSize.height, transition),
        animate(mvRadius, 8, transition),
      ]).then(() => {
        setIsAnimating(false);
      });
    }
  }

  function handleBreadcrumbClick(targetIconId: string) {
    // Click on "Home" breadcrumb → close current window and return to desktop
    if (targetIconId === "icon-home") {
      closeWindow(window.id);
      return;
    }

    // Try to find icon data first (for desktop icons)
    const targetIconData = icons.find((icon) => icon.id === targetIconId);
    // Fall back to APPLICATIONS registry (for apps without desktop icons, like Pictures)
    const targetAppData = APPLICATIONS[targetIconId];

    const breadcrumbTitle = targetIconData?.title ?? targetAppData?.windowTitle;
    const breadcrumbIcon = targetIconData?.icon;

    if (!breadcrumbTitle) {
      console.warn(`Icon or application not found: ${targetIconId}`);
      closeWindow(window.id);
      return;
    }

    // Check if target is a tab or has tabs
    // First, look for a window that has this tab active
    const windowWithActiveTab = windows.find(
      (w) => w.activeTab === targetIconId,
    );

    if (windowWithActiveTab) {
      // Found a window with this tab active → Restore and bring to front
      restoreWindow(windowWithActiveTab.id);
      closeWindow(window.id);
      return;
    }

    // Check if target has tabs enabled (could be the parent window itself)
    const targetApp = APPLICATIONS[targetIconId];
    if (targetApp?.showTabs && targetApp?.availableTabs) {
      // Target is a tabbed window, look for it by iconId
      const targetWindow = windows.find((w) => w.iconId === targetIconId);
      if (targetWindow) {
        // Window exists, make sure the correct tab is active
        setWindowActiveTab(targetWindow.id, targetIconId);
        restoreWindow(targetWindow.id);
        closeWindow(window.id);
        return;
      }
    }

    // Find target window by iconId (non-tabbed windows or parent window)
    const targetWindow = windows.find((w) => w.iconId === targetIconId);

    if (targetWindow) {
      // Window already exists → Bring to front and restore if minimized
      restoreWindow(targetWindow.id);
    } else {
      // Window does not exist → Open new window (openWindow handles tab logic)
      openWindowCentered(
        targetIconId,
        targetIconData?.parentId || "",
        breadcrumbTitle,
        breadcrumbIcon ?? "",
      );
    }

    // Always close the current window when navigating via breadcrumb
    closeWindow(window.id);
  }

  return (
    <header
      onPointerDown={(event) => {
        if (isMobile) return;
        setIsGrabbing(true);
        dragControls.start(event);
      }}
      onPointerUp={() => setIsGrabbing(false)}
      className={`flex select-none ${window.isMaximized ? "rounded-none" : `${!isMobile ? (isGrabbing ? "cursor-grabbing" : "cursor-grab") : ""}`} touch-none`}
    >
      <div
        style={{
          background: `linear-gradient(to right, rgb(from var(--background) r g b / 0.2), transparent 50%), repeating-linear-gradient(45deg, transparent, rgba(0, 0, 0, 0.05) 8%),
              repeating-linear-gradient(-45deg, transparent, rgb(from var(--foreground) r g b / 0.05) 8%)`,
        }}
        className={`flex flex-wrap flex-1 items-center gap-x-3 gap-y-1 p-2`}
      >
        {/* Breadcrumb dinâmico */}
        <button
          className="flex items-center gap-2"
          onClick={() => handleBreadcrumbClick("icon-home")}
        >
          <LuHouse className="size-4 shrink-0" />

          <span>Home</span>
        </button>

        {(parentIcon || window.parentTitle) && (
          <button
            onClick={() =>
              handleBreadcrumbClick(parentIcon?.id ?? window.parentId)
            }
          >
            <span>/</span>{" "}
            <span>{window.parentTitle ?? parentIcon?.title}</span>
          </button>
        )}

        <span>/</span>
        <p className="line-clamp-1">{windowTitle}</p>
      </div>

      <div
        className="bg-popover flex items-center gap-3 p-3 text-black cursor-default"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          className="flex-center size-4 cursor-pointer rounded-full border border-yellow-300 bg-yellow-200 hover:bg-yellow-400"
          onClick={() => minimizeWindow(window.id)}
        >
          <VscChromeMinimize className="size-3" />
        </button>

        {!isMobile && (
          <button
            className="flex-center size-4 cursor-pointer rounded-full border border-green-300 bg-green-200 hover:bg-green-400"
            onClick={handleMaximize}
          >
            {window.isMaximized ? (
              <VscChromeRestore className="size-3" />
            ) : (
              <VscChromeMaximize className="size-3" />
            )}
          </button>
        )}

        <button
          className="flex-center size-4 cursor-pointer rounded-full border border-red-300 bg-red-200 hover:bg-red-400"
          onClick={() => closeWindow(window.id)}
        >
          <VscClose className="size-3" />
        </button>
      </div>
    </header>
  );
}
