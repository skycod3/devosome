"use client";

import { StaticImageData } from "next/image";
import { useWindowsStore } from "@/stores/windows.store";
import { useViewport } from "./useViewport";
import { DEFAULT_WINDOW_SIZE, TABLET_WINDOW_SIZE } from "@/constants/windows";
import { APPLICATIONS } from "@/constants/applications";

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
  const setWindowActiveTab = useWindowsStore(
    (state) => state.setWindowActiveTab,
  );

  // Get viewport dimensions for positioning
  const { width, height } = useViewport();

  // Detect breakpoint for responsive window sizing
  const isMobile = width > 0 && width < 768;
  const isTablet = width >= 768 && width < 1024;

  /**
   * Opens a window centered on the viewport.
   * Calculates position and size based on the current breakpoint:
   * - Mobile (<768px): fullscreen, position (0, 0)
   * - Tablet (768–1023px): TABLET_WINDOW_SIZE, centered, no cascade
   * - Desktop (>=1024px): DEFAULT_WINDOW_SIZE, centered, cascading offset
   */
  const openWindowCentered = (
    iconId: string,
    parentId: string,
    title: string,
    icon: StaticImageData | string,
  ) => {
    // Get application config from registry
    const app = APPLICATIONS[iconId];
    const showTabs = app?.showTabs ?? false;

    // Resolve parent title from APPLICATIONS for breadcrumb
    // Prefer tabTitle (tab label) over windowTitle (window title) for accuracy
    const parentApp = parentId ? APPLICATIONS[parentId] : undefined;
    const parentTitle = parentApp?.tabTitle ?? parentApp?.windowTitle;

    const windowId = openWindow(
      iconId,
      parentId,
      title,
      icon,
      showTabs,
      parentTitle,
    );

    if (isMobile) {
      // Mobile: fullscreen, no cascade
      setWindowSize(windowId, width, height);
      setWindowPosition(windowId, 0, 0);
    } else if (isTablet) {
      // Tablet: fixed smaller size, centered, no cascade
      const tabletX = width / 2 - TABLET_WINDOW_SIZE.width / 2;
      const tabletY = height / 2 - TABLET_WINDOW_SIZE.height / 2;
      setWindowSize(
        windowId,
        TABLET_WINDOW_SIZE.width,
        TABLET_WINDOW_SIZE.height,
      );
      setWindowPosition(windowId, tabletX, tabletY);
    } else {
      // Desktop: default size, centered, cascading offset
      const maxAllowedHeight = height * 0.9;
      const effectiveHeight = Math.min(
        DEFAULT_WINDOW_SIZE.height,
        maxAllowedHeight,
      );
      const offset = windows.length > 0 ? windows.length * 50 : 0;
      const calculatedX = width / 2 - DEFAULT_WINDOW_SIZE.width / 2 + offset;
      const calculatedY = height / 2 - effectiveHeight / 2 + offset;
      setWindowPosition(windowId, calculatedX, calculatedY);
    }

    return windowId;
  };

  return {
    // State
    windows,
    activeWindowId,
    highestZIndex,

    // Breakpoints
    isMobile,
    isTablet,

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
    setWindowActiveTab,
  };
};
