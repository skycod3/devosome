"use client";

import { useShallow } from "zustand/react/shallow";
import { useWindowsStore } from "@/stores/windows-store";

/** Subscribes to a single window's slice; re-renders only when its object changes. */
export const useWindow = (id: string) =>
  useWindowsStore((s) => s.windows.find((w) => w.id === id));

/**
 * Subscribes to just the id list (shallow). Returns shallow-equal while no
 * window is opened/closed/reordered — the consumer doesn't re-render on
 * position/focus/tab changes.
 */
export const useWindowIds = () =>
  useWindowsStore(useShallow((s) => s.windows.map((w) => w.id)));

/** Number of open windows. */
export const useWindowCount = () => useWindowsStore((s) => s.windows.length);

/**
 * Open + minimized window counts for status readouts. Shallow-compared so it
 * only re-renders when a count actually changes, not on every window mutation.
 */
export const useWindowStats = () =>
  useWindowsStore(
    useShallow((s) => ({
      open: s.windows.length,
      minimized: s.windows.filter((w) => w.isMinimized).length,
    })),
  );

/**
 * The full window list. Re-renders on any window change — use only where a
 * component genuinely needs the whole list (e.g. the terminal's window commands).
 */
export const useWindowList = () => useWindowsStore((s) => s.windows);

/**
 * The fields the taskbar dropdown row shows for one window. Projected + shallow
 * so a row re-renders only when its label/state changes, not on every position
 * update.
 */
export const useWindowSummary = (id: string) =>
  useWindowsStore(
    useShallow((s) => {
      const w = s.windows.find((x) => x.id === id);
      return {
        title: w?.title ?? "",
        isActive: w?.isActive ?? false,
        isMinimized: w?.isMinimized ?? false,
      };
    }),
  );

/**
 * Just one window's `isMinimized` flag; re-renders only when that flag flips.
 * Accepts an optional id so consumers rendered outside a window (id undefined)
 * can call it unconditionally and get a stable `false`.
 */
export const useWindowIsMinimized = (id: string | undefined) =>
  useWindowsStore((s) =>
    id ? (s.windows.find((w) => w.id === id)?.isMinimized ?? false) : false,
  );

/** The pending Aero-snap target shown behind the dragged window (null = none). */
export const useSnapPreview = () => useWindowsStore((s) => s.snapPreview);

/** The current top-of-stack zIndex (monotonic counter). */
export const useHighestZIndex = () => useWindowsStore((s) => s.highestZIndex);
