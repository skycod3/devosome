"use client";

import { StaticImageData } from "next/image";
import { useWindowsStore } from "@/stores/windows-store";
import { useViewport } from "./useViewport";
import { useRecentActions } from "./useRecent";
import {
  SMALL_DESKTOP_WINDOW_SIZE,
  TABLET_WINDOW_SIZE,
  LARGE_DESKTOP_WINDOW_SIZE,
  IMAGE_WINDOW_SIZE,
  CASCADE_STEP,
  MAX_CASCADE_SLOTS,
  WORKAREA_TOP_INSET,
  WORKAREA_BOTTOM_INSET,
} from "@/constants/windows";
import { APPLICATIONS } from "@/constants/applications";
import { BREAKPOINTS } from "@/constants/breakpoints";
import { computeCascadePosition } from "@/lib/cascade";

let mediaTabsCache: Set<string> | null = null;
function getMediaTabs(): Set<string> {
  if (!mediaTabsCache) {
    mediaTabsCache = new Set(
      Object.values(APPLICATIONS).flatMap((app) => app.availableTabs ?? []),
    );
  }
  return mediaTabsCache;
}

export const useOpenWindow = () => {
  const { addRecentItem } = useRecentActions();
  const { width, height } = useViewport();

  const isMobile = width > 0 && width < BREAKPOINTS.TABLET;
  const isTablet = width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP;
  const isSmallDesktop =
    width >= BREAKPOINTS.DESKTOP && width < BREAKPOINTS.WIDE;

  return function openWindowCentered(
    iconId: string,
    parentId: string,
    title: string,
    icon: StaticImageData | string,
  ) {
    const store = useWindowsStore.getState();
    const openCountBefore = store.windows.length;

    const app = APPLICATIONS[iconId];
    const showTabs = app?.showTabs ?? false;
    const isImage = iconId.startsWith("image-");

    const parentApp = parentId ? APPLICATIONS[parentId] : undefined;
    const parentTitle = parentApp?.tabTitle ?? parentApp?.windowTitle;

    if (parentId && getMediaTabs().has(parentId)) {
      const iconSrc = typeof icon === "string" ? icon : icon.src;
      addRecentItem({ id: iconId, title, icon: iconSrc, sourceTab: parentId });
    }

    const windowId = store.openWindow(
      iconId,
      parentId,
      title,
      icon,
      showTabs,
      parentTitle,
    );

    if (isMobile) {
      store.setWindowSize(windowId, width, height);
      store.setWindowPosition(windowId, 0, 0);
    } else if (isTablet) {
      const preferredSize =
        app?.defaultSize ?? (isImage ? IMAGE_WINDOW_SIZE : TABLET_WINDOW_SIZE);
      const tabletWidth = Math.min(preferredSize.width, width * 0.9);
      const tabletHeight = Math.min(preferredSize.height, height * 0.9);
      const tabletX = width / 2 - tabletWidth / 2;
      const tabletY = height / 2 - tabletHeight / 2;
      store.setWindowSize(windowId, tabletWidth, tabletHeight);
      store.setWindowPosition(windowId, tabletX, tabletY);
    } else {
      const breakpointSize = isSmallDesktop
        ? SMALL_DESKTOP_WINDOW_SIZE
        : LARGE_DESKTOP_WINDOW_SIZE;
      const preferredSize =
        app?.defaultSize ?? (isImage ? IMAGE_WINDOW_SIZE : breakpointSize);
      const effectiveWidth = Math.min(preferredSize.width, width * 0.9);
      const effectiveHeight = Math.min(preferredSize.height, height * 0.9);
      const { x: calculatedX, y: calculatedY } = computeCascadePosition({
        index: openCountBefore,
        step: CASCADE_STEP,
        maxSlots: MAX_CASCADE_SLOTS,
        windowWidth: effectiveWidth,
        windowHeight: effectiveHeight,
        viewportWidth: width,
        viewportHeight: height,
        topInset: WORKAREA_TOP_INSET,
        bottomInset: WORKAREA_BOTTOM_INSET,
      });
      store.setWindowSize(windowId, effectiveWidth, effectiveHeight);
      store.setWindowPosition(windowId, calculatedX, calculatedY);
    }

    return windowId;
  };
};
