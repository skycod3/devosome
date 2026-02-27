"use client";

import { StaticImageData } from "next/image";
import { useWindowsStore } from "@/stores/windows.store";
import { useViewport } from "./useViewport";
import { DEFAULT_WINDOW_SIZE } from "@/constants/windows";

/**
 * Hook for managing windows.
 * Returns all states and actions needed to manage windows.
 */
export const useWindows = () => {
  const windows = useWindowsStore((state) => state.windows);
  const activeWindowId = useWindowsStore((state) => state.activeWindowId);
  const highestZIndex = useWindowsStore((state) => state.highestZIndex);

  // Window lifecycle
  const openWindow = useWindowsStore((state) => state.openWindow);
  const closeWindow = useWindowsStore((state) => state.closeWindow);
  const closeAllWindows = useWindowsStore((state) => state.closeAllWindows);

  // Window states
  const setActiveWindow = useWindowsStore((state) => state.setActiveWindow);
  const deactivateAllWindows = useWindowsStore(
    (state) => state.deactivateAllWindows,
  );
  const minimizeWindow = useWindowsStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowsStore((state) => state.maximizeWindow);
  const restoreWindow = useWindowsStore((state) => state.restoreWindow);
  const toggleMinimize = useWindowsStore((state) => state.toggleMinimize);
  const toggleMaximize = useWindowsStore((state) => state.toggleMaximize);

  // Window properties
  const setWindowPosition = useWindowsStore((state) => state.setWindowPosition);
  const setWindowSize = useWindowsStore((state) => state.setWindowSize);
  const bringToFront = useWindowsStore((state) => state.bringToFront);

  // Get viewport dimensions for positioning
  const { width, height } = useViewport();

  /**
   * Opens a window centered on the viewport.
   * Calculates position considering viewport size and window constraints.
   */
  const openWindowCentered = (
    iconId: string,
    title: string,
    icon: StaticImageData | string,
  ) => {
    const windowId = openWindow(iconId, title, icon);

    // Calculate effective window height (considering maxHeight constraint)
    const maxAllowedHeight = height * 0.9; // 90% of viewport (10vh reserved)
    const effectiveHeight = Math.min(
      DEFAULT_WINDOW_SIZE.height,
      maxAllowedHeight,
    );

    // Center the window with the effective dimensions
    setWindowPosition(
      windowId,
      width / 2 - DEFAULT_WINDOW_SIZE.width / 2,
      height / 2 - effectiveHeight / 2,
    );

    return windowId;
  };

  return {
    // State
    windows,
    activeWindowId,
    highestZIndex,

    // Lifecycle
    openWindow,
    openWindowCentered,
    closeWindow,
    closeAllWindows,

    // States
    setActiveWindow,
    deactivateAllWindows,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    toggleMinimize,
    toggleMaximize,

    // Properties
    setWindowPosition,
    setWindowSize,
    bringToFront,
  };
};
