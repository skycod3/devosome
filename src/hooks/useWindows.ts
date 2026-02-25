"use client";

import { useWindowsStore } from "@/stores/windows.store";

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

  // Window properties
  const setWindowPosition = useWindowsStore((state) => state.setWindowPosition);
  const setWindowSize = useWindowsStore((state) => state.setWindowSize);
  const bringToFront = useWindowsStore((state) => state.bringToFront);

  return {
    // State
    windows,
    activeWindowId,
    highestZIndex,

    // Lifecycle
    openWindow,
    closeWindow,
    closeAllWindows,

    // States
    setActiveWindow,
    deactivateAllWindows,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    toggleMinimize,

    // Properties
    setWindowPosition,
    setWindowSize,
    bringToFront,
  };
};
