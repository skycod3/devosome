import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { StaticImageData } from "next/image";

import {
  BASE_Z_INDEX,
  DEFAULT_WINDOW_POSITION,
  DEFAULT_WINDOW_SIZE,
} from "@/constants/windows";
import { APPLICATIONS } from "@/constants/applications";
import type { SnapTarget } from "@/lib/snap";
import { useRecentStore } from "./recent-store";

/**
 * Helper function to find the parent application that contains tabs
 * for a given iconId.
 *
 * @param iconId - The icon ID to search for
 * @returns The parent Application with tabs, or null if not found
 *
 * @example
 * findTabParentApplication("pictures") // Returns files app
 * findTabParentApplication("documents") // Returns files app (tab of files)
 * findTabParentApplication("document-resume") // Returns null (no tabs)
 * findTabParentApplication("image-xxx") // Returns null (images are not tabs)
 */
function findTabParentApplication(iconId: string) {
  // Images and other dynamic content should not be treated as tabs
  // They should open in their own windows
  if (iconId.startsWith("image-")) {
    return null;
  }

  // Check if the iconId itself has showTabs and availableTabs
  const app = APPLICATIONS[iconId];
  if (app?.showTabs && app?.availableTabs) {
    return app;
  }

  // Search for an application that lists this iconId in its availableTabs
  for (const appKey in APPLICATIONS) {
    const parentApp = APPLICATIONS[appKey];
    if (parentApp.showTabs && parentApp.availableTabs?.includes(iconId)) {
      return parentApp;
    }
  }

  return null;
}

/**
 * Fallback tab when a tabbed window is opened without targeting a specific tab.
 * For the Files window, default to "pictures" unless the Recent tab has items
 * (then land on "recent"). Other tabbed windows fall back to their first tab.
 */
function resolveDefaultTab(availableTabs?: string[]): string | undefined {
  if (availableTabs?.includes("pictures") && availableTabs.includes("recent")) {
    return useRecentStore.getState().items.length > 0 ? "recent" : "pictures";
  }
  return availableTabs?.[0];
}

export interface Window {
  id: string; // Unique window ID: `window-${iconId}-${timestamp}`
  iconId: string; // Reference to the icon that opened this window
  parentId: string;
  title: string;
  icon: StaticImageData | string; // Window icon (same as icon)
  isActive: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  lastState: "normal" | "minimized" | "maximized"; // Track last state for restore logic
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  // Store previous position/size before maximizing to restore later
  restorePosition?: { x: number; y: number };
  restoreSize?: { width: number; height: number };
  // Whether the window was snapped before maximizing, so restore can re-snap it
  // (otherwise the restored work-area height gets clipped by the 90dvh cap).
  restoreSnapped?: boolean;
  // The snap geometry to return to when un-maximizing a snapped window. Kept
  // separate from restorePosition/restoreSize, which hold the pre-snap *floating*
  // geometry used to un-snap on drag.
  snapRect?: { x: number; y: number; width: number; height: number };
  tab?: { title: string };
  isSnapped?: boolean; // True when half-snapped to a screen edge (fills the work area; bypasses the normal max-height cap)
  showTabs?: boolean; // Whether to show sidebar tabs
  parentTitle?: string; // Parent app title for breadcrumb (resolved from APPLICATIONS)
  activeTab?: string; // Active tab app ID (e.g., "pictures") for windows with tabs
}

interface WindowsState {
  windows: Window[];
  activeWindowId: string | null;
  highestZIndex: number;
  /** Pending Aero-snap target shown as a preview while dragging (null = none). */
  snapPreview: SnapTarget | null;
  setSnapPreview: (target: SnapTarget | null) => void;

  // Window lifecycle
  openWindow: (
    iconId: string,
    parentId: string,
    title: string,
    icon: StaticImageData | string,
    showTabs?: boolean,
    parentTitle?: string,
  ) => string;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;

  // Window states
  setActiveWindow: (id: string) => void;
  deactivateAllWindows: () => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;

  // Window properties
  setWindowPosition: (id: string, x: number, y: number) => void;
  setWindowSize: (id: string, width: number, height: number) => void;
  snapWindow: (
    id: string,
    rect: { x: number; y: number; width: number; height: number },
  ) => void;
  bringToFront: (id: string) => void;
  setWindowActiveTab: (id: string, activeTabIconId: string) => void;
  updateWindowTitle: (id: string, title: string) => void;
}

export const useWindowsStore = create<WindowsState>()(
  devtools(
    (set, get) => ({
      windows: [],
      activeWindowId: null,
      highestZIndex: BASE_Z_INDEX,
      snapPreview: null,

      setSnapPreview(target) {
        set({ snapPreview: target });
      },

      // Open or focus existing window for an icon
      openWindow(iconId, parentId, title, icon, showTabs, parentTitle) {
        const { windows, highestZIndex } = get();

        // Check if this iconId belongs to a tabbed window system
        const tabParentApp = findTabParentApplication(iconId);

        if (tabParentApp) {
          // This is a tab or tab-enabled window
          const parentIconId = Object.keys(APPLICATIONS).find(
            (key) => APPLICATIONS[key] === tabParentApp,
          );

          if (!parentIconId) {
            console.warn(
              `openWindow: Could not find parent iconId for tabbed window`,
            );
            // Fall through to regular window creation
          } else {
            // Check if the parent window already exists
            const existingParentWindow = windows.find(
              (w) => w.iconId === parentIconId,
            );

            if (existingParentWindow) {
              // Parent window exists: set the active tab and restore/focus
              const activeTabId = tabParentApp.availableTabs?.includes(iconId)
                ? iconId
                : (resolveDefaultTab(tabParentApp.availableTabs) ?? iconId);
              get().setWindowActiveTab(existingParentWindow.id, activeTabId);
              get().restoreWindow(existingParentWindow.id);
              return existingParentWindow.id;
            }

            // Parent window doesn't exist: create it with the requested tab active
            // Use the parent iconId's title/icon if iconId matches parent, otherwise use provided values
            const useParentInfo = iconId === parentIconId;
            const windowTitle = useParentInfo
              ? title
              : tabParentApp.windowTitle || "Window";
            // Application config has no icon field, so the icon passed by the
            // caller is the only source regardless of which tab was clicked.
            const windowIcon = icon;

            const newWindowId = `window-${parentIconId}-${Date.now()}`;
            const newZIndex = highestZIndex + 1;

            const newWindow: Window = {
              id: newWindowId,
              iconId: parentIconId,
              parentId,
              title: windowTitle,
              icon: windowIcon,
              isActive: true,
              isMinimized: false,
              isMaximized: false,
              lastState: "normal",
              position: DEFAULT_WINDOW_POSITION,
              size: DEFAULT_WINDOW_SIZE,
              zIndex: newZIndex,
              tab: { title: windowTitle },
              showTabs: true,
              parentTitle,
              activeTab: tabParentApp.availableTabs?.includes(iconId)
                ? iconId
                : (resolveDefaultTab(tabParentApp.availableTabs) ?? iconId), // Requested tab, else Pictures/Recent default
            };

            set((state) => ({
              windows: [
                ...state.windows.map((w) =>
                  w.isActive ? { ...w, isActive: false } : w,
                ),
                newWindow,
              ],
              activeWindowId: newWindowId,
              highestZIndex: newZIndex,
            }));

            return newWindowId;
          }
        }

        // Regular window (not part of tabs): check if window already exists for this icon
        const existingWindow = windows.find((w) => w.iconId === iconId);

        if (existingWindow) {
          // Window exists: restore if minimized and bring to front
          get().restoreWindow(existingWindow.id);
          return existingWindow.id;
        }

        // Create new window with zIndex based on number of windows
        const newWindowId = `window-${iconId}-${Date.now()}`;
        const newZIndex = highestZIndex + 1;

        const newWindow: Window = {
          id: newWindowId,
          iconId,
          parentId,
          title,
          icon,
          isActive: true,
          isMinimized: false,
          isMaximized: false,
          lastState: "normal",
          position: DEFAULT_WINDOW_POSITION,
          size: DEFAULT_WINDOW_SIZE,
          zIndex: newZIndex,
          tab: { title },
          showTabs: showTabs ?? false, // Default to false if not provided
          parentTitle,
        };

        set((state) => ({
          windows: [
            ...state.windows.map((w) =>
              w.isActive ? { ...w, isActive: false } : w,
            ),
            newWindow,
          ],
          activeWindowId: newWindowId,
          highestZIndex: newZIndex,
        }));

        return newWindowId;
      },

      closeWindow(id) {
        const { windows, activeWindowId, highestZIndex } = get();
        let newWindows = windows.filter((w) => w.id !== id);
        const windowsNotMinimized = newWindows.filter((w) => !w.isMinimized);

        // If closed window was active, activate the last window (not minimized)
        let newActiveId = activeWindowId === id ? null : activeWindowId;
        if (newActiveId === null && windowsNotMinimized.length > 0) {
          const lastWindow = windowsNotMinimized.reduce((prev, current) =>
            current.zIndex > prev.zIndex ? current : prev,
          );
          newActiveId = lastWindow.id;
          newWindows = newWindows.map((w) =>
            w.id === lastWindow.id ? { ...w, isActive: true } : w,
          );
        }

        set({
          windows: newWindows,
          activeWindowId: newActiveId,
          // Keep the counter monotonic — lowering it could hand a newly focused
          // window a zIndex below an existing one. Reset only when empty.
          highestZIndex: newWindows.length > 0 ? highestZIndex : BASE_Z_INDEX,
        });
      },

      closeAllWindows() {
        set({
          windows: [],
          activeWindowId: null,
          highestZIndex: BASE_Z_INDEX,
        });
      },

      setActiveWindow(id) {
        // Activating always brings the window to front, and bringToFront does
        // both surgically (only the focused + previously active window change).
        get().bringToFront(id);
      },

      deactivateAllWindows() {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.isActive ? { ...w, isActive: false } : w,
          ),
          activeWindowId: null,
        }));
      },

      minimizeWindow(id) {
        const { windows, activeWindowId } = get();
        const isCurrentlyActive = activeWindowId === id;

        // Find next window to activate if minimizing the active one
        let newActiveId = isCurrentlyActive ? null : activeWindowId;
        if (isCurrentlyActive && windows.length > 1) {
          // Find the window with highest zIndex that's not being minimized and not already minimized
          const nextWindow = windows
            .filter((w) => w.id !== id && !w.isMinimized)
            .reduce(
              (highest, current) =>
                current.zIndex > (highest?.zIndex ?? -1) ? current : highest,
              null as Window | null,
            );

          if (nextWindow) {
            newActiveId = nextWindow.id;
          }
        }

        set((state) => ({
          windows: state.windows.map((window) => {
            if (window.id === id) {
              // Save the current state before minimizing
              const previousState = window.isMaximized ? "maximized" : "normal";
              return {
                ...window,
                isMinimized: true,
                lastState: previousState,
                isActive: false,
              };
            }
            // Activate the next window if found
            if (window.id === newActiveId) {
              return { ...window, isActive: true };
            }
            return window;
          }),
          activeWindowId: newActiveId,
        }));
      },

      maximizeWindow(id) {
        set((state) => ({
          windows: state.windows.map((window) => {
            if (window.id === id) {
              // Only save restore position/size if not already maximized
              const shouldSaveRestore = !window.isMaximized;
              return {
                ...window,
                isMaximized: true,
                isMinimized: false,
                isSnapped: false,
                lastState: "normal", // When maximizing, we're coming from normal state
                // Save current position/size before maximizing — but NOT for a
                // snapped window: it already holds the pre-snap floating geometry
                // in restorePosition/restoreSize (and the snap in snapRect), which
                // restore needs to un-snap on drag.
                restorePosition:
                  shouldSaveRestore && !window.isSnapped
                    ? window.position
                    : window.restorePosition,
                restoreSize:
                  shouldSaveRestore && !window.isSnapped
                    ? window.size
                    : window.restoreSize,
                // Remember if it was snapped, so restore re-snaps (and the
                // work-area height isn't clipped by the 90dvh cap).
                restoreSnapped: shouldSaveRestore
                  ? window.isSnapped
                  : window.restoreSnapped,
                // Set position to (0, 0) when maximizing
                position: { x: 0, y: 0 },
              };
            }
            return window;
          }),
        }));
      },

      restoreWindow(id) {
        set((state) => ({
          windows: state.windows.map((window) => {
            // Untouched windows keep their identity. Activation/z is handled by
            // bringToFront below, which only touches the focused + previously
            // active window.
            if (window.id !== id) return window;

            // Restore from minimized state
            if (window.isMinimized) {
              // Restore to the state before minimization (normal or maximized)
              if (window.lastState === "maximized") {
                return {
                  ...window,
                  isMinimized: false,
                  isMaximized: true,
                  lastState: "minimized", // Track that previous state was minimized
                };
              }
              // Restore to normal state
              return {
                ...window,
                isMinimized: false,
                isMaximized: false,
                lastState: "minimized", // Track that previous state was minimized
              };
            }

            // Restore from maximized state
            if (
              window.isMaximized &&
              window.restorePosition &&
              window.restoreSize
            ) {
              const snap = window.snapRect;
              const reSnap = !!(window.restoreSnapped && snap);

              return {
                ...window,
                isMinimized: false,
                isMaximized: false,
                // A window that was snapped before maximizing comes back snapped
                // at full work-area height (an unsnapped restore would be clipped
                // by the 90dvh max-height).
                isSnapped: reSnap,
                lastState: "maximized", // Track that previous state was maximized
                position:
                  reSnap && snap
                    ? { x: snap.x, y: snap.y }
                    : window.restorePosition,
                size:
                  reSnap && snap
                    ? { width: snap.width, height: snap.height }
                    : window.restoreSize,
                // Re-snap keeps the pre-snap floating geometry so a later drag can
                // un-snap to it; a normal restore consumes and clears it.
                restorePosition: reSnap ? window.restorePosition : undefined,
                restoreSize: reSnap ? window.restoreSize : undefined,
                restoreSnapped: undefined,
                snapRect: reSnap ? window.snapRect : undefined,
              };
            }

            // Already in normal state, nothing to restore
            return window;
          }),
        }));

        // Brings it to front AND sets isActive / activeWindowId (surgically).
        get().bringToFront(id);
      },

      toggleMinimize(id) {
        const window = get().windows.find((w) => w.id === id);
        if (!window) return;

        if (window.isMinimized) {
          get().restoreWindow(id);
        } else {
          get().minimizeWindow(id);
        }
      },

      toggleMaximize(id) {
        const window = get().windows.find((w) => w.id === id);
        if (!window) return;

        if (window.isMaximized) {
          get().restoreWindow(id);
        } else {
          get().maximizeWindow(id);
        }
      },

      setWindowPosition(id, x, y) {
        // Manually moving a window breaks its snapped state.
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, position: { x, y }, isSnapped: false }
              : window,
          ),
        }));
      },

      setWindowSize(id, width, height) {
        // Manually resizing a window breaks its snapped state.
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, size: { width, height }, isSnapped: false }
              : window,
          ),
        }));
      },

      snapWindow(id, rect) {
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? {
                  ...window,
                  // Remember the pre-snap (floating) geometry so dragging can
                  // restore it, and the snap geometry so un-maximize can re-snap.
                  restorePosition: window.position,
                  restoreSize: window.size,
                  snapRect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                  },
                  position: { x: rect.x, y: rect.y },
                  size: { width: rect.width, height: rect.height },
                  isSnapped: true,
                  isMaximized: false,
                }
              : window,
          ),
        }));
      },

      bringToFront(id) {
        const { windows, highestZIndex } = get();
        if (!windows.some((w) => w.id === id)) return;

        // Monotonic zIndex: only the focused window moves. Re-sequencing every
        // window (the previous behaviour) recreated every window object, so a
        // single focus re-rendered every open window.
        const newZ = highestZIndex + 1;

        set({
          windows: windows.map((w) =>
            w.id === id
              ? { ...w, zIndex: newZ, isActive: true }
              : w.isActive
                ? { ...w, isActive: false }
                : w,
          ),
          activeWindowId: id,
          highestZIndex: newZ,
        });
      },

      setWindowActiveTab(id, activeTabIconId) {
        const { windows } = get();
        const window = windows.find((w) => w.id === id);

        // Validate window exists
        if (!window) {
          console.warn(`setWindowActiveTab: Window ${id} not found`);
          return;
        }

        // Validate window has tabs enabled
        if (!window.showTabs) {
          console.warn(
            `setWindowActiveTab: Window ${id} does not have tabs enabled`,
          );
          return;
        }

        // Get the parent application to validate the tab exists
        const parentApp = findTabParentApplication(window.iconId);
        if (
          !parentApp?.availableTabs ||
          !parentApp.availableTabs.includes(activeTabIconId)
        ) {
          console.warn(
            `setWindowActiveTab: Tab ${activeTabIconId} is not available in window ${id}`,
          );
          return;
        }

        // Update the activeTab
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, activeTab: activeTabIconId } : w,
          ),
        }));
      },

      updateWindowTitle(id, title) {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, title, tab: { title } } : w,
          ),
        }));
      },
    }),
    { name: "windows-store" },
  ),
);
