import { Dispatch, SetStateAction } from "react";

import { Window } from "@/stores/windows.store";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";

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
  setIsAnimating: Dispatch<SetStateAction<boolean>>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  width: number;
  height: number;
  mvWidth: MotionValue<number>;
  mvHeight: MotionValue<number>;
  mvRadius: MotionValue<number>;
  dragControls: DragControls;
}

export function WindowHeader({
  window,
  setIsAnimating,
  x,
  y,
  width,
  height,
  mvWidth,
  mvHeight,
  mvRadius,
  dragControls,
}: WindowHeaderProps) {
  const {
    windows,
    restoreWindow,
    openWindowCentered,
    closeWindow,
    toggleMaximize,
    setWindowSize,
    minimizeWindow,
  } = useWindows();

  const { icons } = useIcons();

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

    // Find target icon data to get title and icon for new window
    const targetIconData = icons.find((icon) => icon.id === targetIconId);
    if (!targetIconData) {
      console.warn(`Icon not found: ${targetIconId}`);
      closeWindow(window.id);
      return;
    }

    // Find target window by iconId
    const targetWindow = windows.find((w) => w.iconId === targetIconId);

    if (targetWindow) {
      // Window already exists → Bring to front and restore if minimized
      restoreWindow(targetWindow.id);
    } else {
      // Window does not exist → Open new window
      openWindowCentered(
        targetIconId,
        targetIconData.parentId || "",
        targetIconData.title,
        targetIconData.icon,
      );
    }

    // Always close the current window when navigating via breadcrumb
    closeWindow(window.id);
  }

  return (
    <header
      onPointerDown={(event) => dragControls.start(event)}
      className={`flex select-none ${window.isMaximized ? "rounded-none cursor-default" : "cursor-move"} touch-none`}
    >
      <div
        style={{
          background: `linear-gradient(to right, rgb(from var(--background) r g b / 0.2), transparent 50%), repeating-linear-gradient(45deg, transparent, rgba(0, 0, 0, 0.05) 8%),
              repeating-linear-gradient(-45deg, transparent, rgb(from var(--foreground) r g b / 0.05) 8%)`,
        }}
        className={`flex flex-1 items-center gap-3 p-2`}
      >
        <LuHouse className="size-4 shrink-0" />

        {/* Breadcrumb dinâmico */}
        <button onClick={() => handleBreadcrumbClick("icon-home")}>
          <span>Home</span>
        </button>

        {parentIcon && (
          <button onClick={() => handleBreadcrumbClick(parentIcon.id)}>
            <span>/</span> <span>{parentIcon.title}</span>
          </button>
        )}

        <span>/</span>
        <p className="line-clamp-1">{window.title}</p>
      </div>

      <div
        className="bg-popover flex items-center gap-3 p-3 text-black"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          className="flex-center size-4 cursor-pointer rounded-full border border-yellow-300 bg-yellow-200 hover:bg-yellow-400"
          onClick={() => minimizeWindow(window.id)}
        >
          <VscChromeMinimize className="size-3" />
        </button>

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
