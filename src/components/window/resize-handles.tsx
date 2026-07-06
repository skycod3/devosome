"use client";

import { useCallback } from "react";
import { MotionValue } from "motion/react";

import { PiDotsNine } from "react-icons/pi";

import { Window as WindowType } from "@/stores/windows-store";
import { useWindows } from "@/hooks/useWindows";
import { APPLICATIONS } from "@/constants/applications";
import {
  WINDOW_MIN_WIDTH,
  WINDOW_MIN_HEIGHT,
  RESIZE_HANDLE_SIZE,
  RESIZE_CORNER_SIZE,
} from "@/constants/windows";

interface EdgeFlags {
  north?: boolean;
  south?: boolean;
  east?: boolean;
  west?: boolean;
}

interface ResizeHandlesProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  mvWidth: MotionValue<number>;
  mvHeight: MotionValue<number>;
  window: WindowType;
  isMobile: boolean;
  enabled: boolean;
}

function getResizeCursor(edges: EdgeFlags): string {
  if (edges.north && edges.east) return "nesw-resize";
  if (edges.north && edges.west) return "nwse-resize";
  if (edges.south && edges.east) return "nwse-resize";
  if (edges.south && edges.west) return "nesw-resize";
  if (edges.north || edges.south) return "ns-resize";
  return "ew-resize";
}

export function ResizeHandles({
  x,
  y,
  mvWidth,
  mvHeight,
  window: win,
  isMobile,
  enabled,
}: ResizeHandlesProps) {
  const { setWindowPosition, setWindowSize } = useWindows();

  // Per-app resize floor, falling back to the global window minimum.
  const appMinSize = APPLICATIONS[win.iconId]?.minSize;
  const minWidth = appMinSize?.width ?? WINDOW_MIN_WIDTH;
  const minHeight = appMinSize?.height ?? WINDOW_MIN_HEIGHT;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, edges: EdgeFlags) => {
      if (isMobile || win.isMaximized || !enabled) return;
      e.stopPropagation();

      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = mvWidth.get();
      const startHeight = mvHeight.get();
      const startPosX = x.get();
      const startPosY = y.get();
      const cursor = getResizeCursor(edges);

      document.body.style.cursor = cursor;
      document.body.style.userSelect = "none";

      function onMove(ev: PointerEvent) {
        ev.preventDefault();

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startPosX;
        let newY = startPosY;

        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (edges.east) {
          newWidth = Math.max(minWidth, startWidth + dx);
        }
        if (edges.west) {
          newWidth = Math.max(minWidth, startWidth - dx);
          newX = startPosX + (startWidth - newWidth);
        }
        if (edges.south) {
          newHeight = Math.max(minHeight, startHeight + dy);
        }
        if (edges.north) {
          newHeight = Math.max(minHeight, startHeight - dy);
          newY = startPosY + (startHeight - newHeight);
        }

        mvWidth.set(newWidth);
        mvHeight.set(newHeight);
        x.set(newX);
        y.set(newY);
      }

      function onUp() {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {}

        setWindowPosition(win.id, x.get(), y.get());
        setWindowSize(
          win.id,
          Math.round(mvWidth.get()),
          Math.round(mvHeight.get()),
        );

        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
    },
    [
      isMobile,
      win.isMaximized,
      enabled,
      win.id,
      minWidth,
      minHeight,
      x,
      y,
      mvWidth,
      mvHeight,
      setWindowPosition,
      setWindowSize,
    ],
  );

  if (isMobile || win.isMaximized || !enabled) return null;

  const h = RESIZE_HANDLE_SIZE;
  const c = RESIZE_CORNER_SIZE;

  return (
    <div className="absolute inset-0 pointer-events-none z-1">
      <div
        onPointerDown={(e) => handlePointerDown(e, { north: true })}
        className="absolute top-0 left-0 right-0 pointer-events-auto"
        style={{ height: h, cursor: "ns-resize", touchAction: "none" }}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, { south: true })}
        className="absolute bottom-0 left-0 right-0 pointer-events-auto"
        style={{ height: h, cursor: "ns-resize", touchAction: "none" }}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, { east: true })}
        className="absolute top-0 right-0 bottom-0 pointer-events-auto"
        style={{ width: h, cursor: "ew-resize", touchAction: "none" }}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, { west: true })}
        className="absolute top-0 left-0 bottom-0 pointer-events-auto"
        style={{ width: h, cursor: "ew-resize", touchAction: "none" }}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, { north: true, east: true })}
        className="absolute top-0 right-0 pointer-events-auto"
        style={{
          width: c,
          height: c,
          cursor: "nesw-resize",
          touchAction: "none",
        }}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, { north: true, west: true })}
        className="absolute top-0 left-0 pointer-events-auto"
        style={{
          width: c,
          height: c,
          cursor: "nwse-resize",
          touchAction: "none",
        }}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, { south: true, east: true })}
        className="absolute bottom-0 right-0 pointer-events-auto"
        style={{
          width: c,
          height: c,
          cursor: "nwse-resize",
          touchAction: "none",
        }}
      >
        <PiDotsNine className="size-4" />
      </div>
      <div
        onPointerDown={(e) => handlePointerDown(e, { south: true, west: true })}
        className="absolute bottom-0 left-0 pointer-events-auto"
        style={{
          width: c,
          height: c,
          cursor: "nesw-resize",
          touchAction: "none",
        }}
      />
    </div>
  );
}
