import { Dispatch, SetStateAction, useState } from "react";

import { Window } from "@/stores/windows-store";

import { useIcons } from "@/hooks/useIcons";
import { useViewport } from "@/hooks/useViewport";
import { useWindowActions } from "@/hooks/useWindowActions";
import { Kbd, KbdGroup } from "../ui/kbd";

import { animate, DragControls, MotionValue } from "motion/react";

import { LuHouse } from "react-icons/lu";
import {
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore,
  VscClose,
} from "react-icons/vsc";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";

import { WINDOW_BREADCRUMB_HOME } from "@/constants/windows";
import { supportsRelativeColors } from "@/utils/css-supports";
import { useHotkey } from "@tanstack/react-hotkeys";

import { useTheme } from "@/hooks/useTheme";

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
  const { closeWindow, toggleMaximize, setWindowSize, minimizeWindow } =
    useWindowActions();

  const [, setIsGrabbing] = useState(false);

  const { icons } = useIcons();
  const { width, height } = useViewport();
  const { isDark } = useTheme();

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
      // Restoring: capture the target BEFORE toggleMaximize clears it (React
      // props are snapshots — window still has the old state here). Must mirror
      // restoreWindow's logic: a window snapped before maximizing restores to its
      // snap geometry (snapRect), otherwise to the floating restore geometry.
      // Animating toward a different target than the store sets causes a jump.
      const snap = window.snapRect;
      const reSnap = Boolean(window.restoreSnapped && snap);
      const restorePos =
        reSnap && snap
          ? { x: snap.x, y: snap.y }
          : (window.restorePosition ?? window.position);
      const restoreSize =
        reSnap && snap
          ? { width: snap.width, height: snap.height }
          : (window.restoreSize ?? window.size);

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

  const isActive = window.isActive;

  useHotkey("Control+Q", () => closeWindow(window.id), {
    conflictBehavior: "allow",
    enabled: isActive,
  });

  // Minimize the active window.
  useHotkey("Control+M", () => minimizeWindow(window.id), {
    conflictBehavior: "allow",
    enabled: isActive,
  });

  // Toggle maximize/restore on the active window (animated via handleMaximize).
  useHotkey("Control+Alt+M", () => handleMaximize(), {
    conflictBehavior: "allow",
    enabled: isActive && !isMobile,
  });

  // Start dragging the window from the title bar.
  function handleHeaderPointerDown(event: React.PointerEvent) {
    // A maximized window isn't draggable (restore it via double-click/shortcut).
    if (isMobile || window.isMaximized) return;

    // Normal (non-snapped) window: begin the drag immediately.
    if (!window.isSnapped) {
      setIsGrabbing(true);
      dragControls.start(event);
      return;
    }

    // Snapped window (Windows behavior): a plain click keeps it snapped; only a
    // real drag un-snaps it. Wait for movement, then restore the pre-snap size,
    // reposition under the cursor, and start the drag from the new geometry.
    const startX = event.clientX;
    const startY = event.clientY;
    const pointerId = event.pointerId;

    const cleanup = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", cleanup);
      document.removeEventListener("pointercancel", cleanup);
    };

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      if (
        Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 4
      )
        return;
      cleanup();

      const restoreWidth = window.restoreSize?.width ?? window.size.width;
      const restoreHeight = window.restoreSize?.height ?? window.size.height;
      const currentWidth = window.size.width;
      const relativeX =
        currentWidth > 0 ? (moveEvent.clientX - x.get()) / currentWidth : 0.5;
      // Clamp inside the drag bounds so the restored (wider) window never starts
      // past the viewport edge — otherwise dragElastic pulls it back and the
      // window feels "stuck" to the edge while detaching.
      const maxX = Math.max(0, width - restoreWidth);
      const newX = Math.min(
        Math.max(0, moveEvent.clientX - relativeX * restoreWidth),
        maxX,
      );

      mvWidth.set(restoreWidth);
      mvHeight.set(restoreHeight);
      x.set(newX);
      // y is left at the current top so the title bar stays under the cursor.
      setWindowSize(window.id, restoreWidth, restoreHeight); // also clears isSnapped
      setIsGrabbing(true);
      dragControls.start(moveEvent);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", cleanup);
    document.addEventListener("pointercancel", cleanup);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <header
          onPointerDown={handleHeaderPointerDown}
          onPointerUp={() => setIsGrabbing(false)}
          onPointerOut={() => setIsGrabbing(false)}
          onDoubleClick={handleMaximize}
          className={`flex select-none ${window.isMaximized ? "rounded-none" : ""}`}
        >
          <div
            style={{
              background: supportsRelativeColors
                ? `linear-gradient(to right, rgb(from var(--background) r g b / 0.2), transparent 50%), repeating-linear-gradient(45deg, transparent, rgba(0, 0, 0, ${isDark ? "0.15" : "0.05"}) 8%), repeating-linear-gradient(-45deg, transparent, rgb(from var(--foreground) r g b / 0.05) 8%)`
                : "var(--secondary)", // Solid fallback for browsers without relative color support
            }}
            className={`flex basis-full line-clamp-1 items-center gap-x-3 gap-y-1 p-2`}
          >
            {/* Dynamic breadcrumb */}
            <div className="shrink-0 flex items-center gap-2">
              <LuHouse className="size-4 shrink-0" />

              <span>{WINDOW_BREADCRUMB_HOME}</span>
            </div>

            {(parentIcon || window.parentTitle) && (
              <div className="shrink-0">
                <span>/</span>{" "}
                <span>{window.parentTitle ?? parentIcon?.title}</span>
              </div>
            )}

            <span>/</span>
            <p className="line-clamp-1">{windowTitle}</p>
          </div>

          <div
            className="shrink-0 bg-popover flex items-center gap-4 sm:gap-3 p-3 text-black"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Minimize window"
              className="flex-center size-5 sm:size-4 rounded-full border border-yellow-300 bg-yellow-200 hover:bg-yellow-400"
              onClick={() => minimizeWindow(window.id)}
            >
              <VscChromeMinimize className="size-3" />
            </button>

            {!isMobile && (
              <button
                aria-label={
                  window.isMaximized ? "Restore window" : "Maximize window"
                }
                className="flex-center size-4 rounded-full border border-green-300 bg-green-200 hover:bg-green-400"
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
              aria-label="Close window"
              className="flex-center size-5 sm:size-4 rounded-full border border-red-300 bg-red-200 hover:bg-red-400"
              onClick={() => {
                closeWindow(window.id);
              }}
            >
              <VscClose className="size-3" />
            </button>
          </div>
        </header>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem
          onClick={handleMaximize}
          disabled={!window.isMaximized}
          className="flex gap-3 items-center"
        >
          <VscChromeRestore className="size-4 icon-fix" />
          Restore
          <ContextMenuShortcut>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>Alt</Kbd>
              <Kbd>M</Kbd>
            </KbdGroup>
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => minimizeWindow(window.id)}
          className="flex gap-3 items-center"
        >
          <VscChromeMinimize className="size-4 icon-fix" />
          Minimize
          <ContextMenuShortcut>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>M</Kbd>
            </KbdGroup>
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={handleMaximize}
          disabled={window.isMaximized}
          className="flex gap-3 items-center"
        >
          <VscChromeMaximize className="size-4 icon-fix" />
          Maximize
          <ContextMenuShortcut>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>Alt</Kbd>
              <Kbd>M</Kbd>
            </KbdGroup>
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => closeWindow(window.id)}
          className="flex gap-3 items-center"
        >
          <VscClose className="size-4 icon-fix" />
          Close
          <ContextMenuShortcut>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>Q</Kbd>
            </KbdGroup>
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
