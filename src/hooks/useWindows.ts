"use client";

import { StaticImageData } from "next/image";
import { useWindowsStore } from "@/stores/windows-store";
import { useViewport } from "./useViewport";
import {
  SMALL_DESKTOP_WINDOW_SIZE,
  TABLET_WINDOW_SIZE,
  LARGE_DESKTOP_WINDOW_SIZE,
  CASCADE_STEP,
  MAX_CASCADE_SLOTS,
  WORKAREA_TOP_INSET,
  WORKAREA_BOTTOM_INSET,
} from "@/constants/windows";
import { APPLICATIONS } from "@/constants/applications";
import { BREAKPOINTS } from "@/constants/breakpoints";
import { computeCascadePosition } from "@/lib/cascade";
import { useRecent } from "./useRecent";

// Derived from APPLICATIONS to stay in sync with tab config. Computed lazily on
// first use (not at module load) to avoid touching APPLICATIONS during the
// circular import chain (applications → components → useWindows → applications),
// and cached so it isn't rebuilt on every render.
let mediaTabsCache: Set<string> | null = null;
function getMediaTabs(): Set<string> {
  if (!mediaTabsCache) {
    mediaTabsCache = new Set(
      Object.values(APPLICATIONS).flatMap((app) => app.availableTabs ?? []),
    );
  }
  return mediaTabsCache;
}

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
  const snapWindow = useWindowsStore((state) => state.snapWindow);
  const setSnapPreview = useWindowsStore((state) => state.setSnapPreview);
  const bringToFront = useWindowsStore((state) => state.bringToFront);
  const setWindowActiveTab = useWindowsStore(
    (state) => state.setWindowActiveTab,
  );
  const updateWindowTitle = useWindowsStore((state) => state.updateWindowTitle);

  const addRecentItem = useRecent().addRecentItem;

  // Get viewport dimensions for positioning
  const { width, height } = useViewport();

  // Detect breakpoint for responsive window sizing
  const isMobile = width > 0 && width < BREAKPOINTS.TABLET;
  const isTablet = width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP;
  const isSmallDesktop =
    width >= BREAKPOINTS.DESKTOP && width < BREAKPOINTS.WIDE;

  /**
   * Opens a window centered on the viewport.
   * Calculates position and size based on the current breakpoint:
   * - Mobile (<768px): fullscreen, position (0, 0)
   * - Tablet (768–1023px): TABLET_WINDOW_SIZE, centered, no cascade
   * - Desktop (1024–1599px): SMALL_DESKTOP_WINDOW_SIZE, centered, cascading offset
   * - Wide (≥1600px): LARGE_DESKTOP_WINDOW_SIZE, centered, cascading offset
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

    // Record in recent history if opened from a media tab
    if (parentId && getMediaTabs().has(parentId)) {
      const iconSrc = typeof icon === "string" ? icon : icon.src;
      addRecentItem({ id: iconId, title, icon: iconSrc, sourceTab: parentId });
    }

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
      // Tablet: app defaultSize if set, else the tablet size; centered, no cascade.
      const preferredSize = app?.defaultSize ?? TABLET_WINDOW_SIZE;
      const tabletWidth = Math.min(preferredSize.width, width * 0.9);
      const tabletHeight = Math.min(preferredSize.height, height * 0.9);
      const tabletX = width / 2 - tabletWidth / 2;
      const tabletY = height / 2 - tabletHeight / 2;
      setWindowSize(windowId, tabletWidth, tabletHeight);
      setWindowPosition(windowId, tabletX, tabletY);
    } else {
      // Desktop: app defaultSize wins; fall back to the breakpoint size. Clamp
      // to the viewport so a large defaultSize can't overflow small screens.
      const breakpointSize = isSmallDesktop
        ? SMALL_DESKTOP_WINDOW_SIZE
        : LARGE_DESKTOP_WINDOW_SIZE;
      const preferredSize = app?.defaultSize ?? breakpointSize;
      const effectiveWidth = Math.min(preferredSize.width, width * 0.9);
      const effectiveHeight = Math.min(preferredSize.height, height * 0.9);
      // Cascade down-right with wrap (centered block) so windows never march
      // off the bottom/right of the work area.
      const { x: calculatedX, y: calculatedY } = computeCascadePosition({
        index: windows.length,
        step: CASCADE_STEP,
        maxSlots: MAX_CASCADE_SLOTS,
        windowWidth: effectiveWidth,
        windowHeight: effectiveHeight,
        viewportWidth: width,
        viewportHeight: height,
        topInset: WORKAREA_TOP_INSET,
        bottomInset: WORKAREA_BOTTOM_INSET,
      });
      setWindowSize(windowId, effectiveWidth, effectiveHeight);
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
    snapWindow,
    setSnapPreview,
    bringToFront,
    setWindowActiveTab,
    updateWindowTitle,
  };
};
