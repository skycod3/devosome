import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { StaticImageData } from "next/image";

import {
  BASE_Z_INDEX,
  DEFAULT_WINDOW_POSITION,
  DEFAULT_WINDOW_SIZE,
} from "@/constants/windows";

export interface Window {
  id: string; // Unique window ID: `window-${iconId}-${timestamp}`
  iconId: string; // Reference to the icon that opened this window
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
  tab?: { title: string };
  showTabs?: boolean; // Whether to show sidebar tabs
}

interface WindowsState {
  windows: Window[];
  activeWindowId: string | null;
  highestZIndex: number;

  // Window lifecycle
  openWindow: (
    iconId: string,
    title: string,
    icon: StaticImageData | string,
    showTabs?: boolean,
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
  bringToFront: (id: string) => void;
}

export const useWindowsStore = create<WindowsState>()(
  devtools(
    (set, get) => ({
      windows: [],
      activeWindowId: null,
      highestZIndex: BASE_Z_INDEX,

      // Open or focus existing window for an icon
      openWindow(iconId, title, icon, showTabs) {
        const { windows } = get();

        // Check if window already exists for this icon
        const existingWindow = windows.find((w) => w.iconId === iconId);

        if (existingWindow) {
          // Window exists: restore if minimized and bring to front
          get().restoreWindow(existingWindow.id);
          return existingWindow.id;
        }

        // Create new window with zIndex based on number of windows
        const newWindowId = `window-${iconId}-${Date.now()}`;
        const newZIndex = BASE_Z_INDEX + windows.length + 1;

        const newWindow: Window = {
          id: newWindowId,
          iconId,
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
        };

        set((state) => ({
          windows: [
            ...state.windows.map((w) => ({ ...w, isActive: false })),
            newWindow,
          ],
          activeWindowId: newWindowId,
          highestZIndex: newZIndex,
        }));

        return newWindowId;
      },

      closeWindow(id) {
        const { windows, activeWindowId } = get();
        const newWindows = windows.filter((w) => w.id !== id);

        // If closed window was active, activate the last window
        let newActiveId = activeWindowId === id ? null : activeWindowId;
        if (newActiveId === null && newWindows.length > 0) {
          const lastWindow = newWindows.reduce((prev, current) =>
            current.zIndex > prev.zIndex ? current : prev,
          );
          newActiveId = lastWindow.id;
          lastWindow.isActive = true;
        }

        set({
          windows: newWindows,
          activeWindowId: newActiveId,
          highestZIndex:
            newWindows.length > 0
              ? BASE_Z_INDEX + newWindows.length
              : BASE_Z_INDEX,
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
        set((state) => ({
          windows: state.windows.map((window) => ({
            ...window,
            isActive: window.id === id,
          })),
          activeWindowId: id,
        }));

        // Bring to front when activated
        get().bringToFront(id);
      },

      deactivateAllWindows() {
        set({
          windows: get().windows.map((w) => ({ ...w, isActive: false })),
          activeWindowId: null,
        });
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
                lastState: "normal", // When maximizing, we're coming from normal state
                // Save current position/size before maximizing
                restorePosition: shouldSaveRestore
                  ? window.position
                  : window.restorePosition,
                restoreSize: shouldSaveRestore
                  ? window.size
                  : window.restoreSize,
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
            if (window.id !== id) return { ...window, isActive: false };

            // Restore from minimized state
            if (window.isMinimized) {
              // Restore to the state before minimization (normal or maximized)
              if (window.lastState === "maximized") {
                return {
                  ...window,
                  isMinimized: false,
                  isMaximized: true,
                  isActive: true,
                  lastState: "minimized", // Track that previous state was minimized
                };
              }
              // Restore to normal state
              return {
                ...window,
                isMinimized: false,
                isMaximized: false,
                isActive: true,
                lastState: "minimized", // Track that previous state was minimized
              };
            }

            // Restore from maximized state
            if (
              window.isMaximized &&
              window.restorePosition &&
              window.restoreSize
            ) {
              return {
                ...window,
                isMinimized: false,
                isMaximized: false,
                isActive: true,
                lastState: "maximized", // Track that previous state was maximized
                position: window.restorePosition,
                size: window.restoreSize,
                restorePosition: undefined,
                restoreSize: undefined,
              };
            }

            // Already in normal state, nothing to restore
            return window;
          }),
          activeWindowId: id,
        }));

        // Bring restored window to front
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
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id ? { ...window, position: { x, y } } : window,
          ),
        }));
      },

      setWindowSize(id, width, height) {
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id ? { ...window, size: { width, height } } : window,
          ),
        }));
      },

      bringToFront(id) {
        const { windows } = get();

        // Reorganize zIndex: sort windows by current zIndex, then assign sequential values
        // The window being brought to front gets the highest zIndex
        const otherWindows = windows
          .filter((w) => w.id !== id)
          .sort((a, b) => a.zIndex - b.zIndex);

        const updatedWindows = windows.map((window) => {
          if (window.id === id) {
            // This window gets the highest zIndex
            return {
              ...window,
              zIndex: BASE_Z_INDEX + windows.length,
              isActive: true,
            };
          }

          // Other windows get sequential zIndex based on their current order
          const indexInOtherWindows = otherWindows.findIndex(
            (w) => w.id === window.id,
          );
          return {
            ...window,
            zIndex: BASE_Z_INDEX + indexInOtherWindows + 1,
            isActive: false,
          };
        });

        set({
          windows: updatedWindows,
          activeWindowId: id,
          highestZIndex: BASE_Z_INDEX + windows.length,
        });
      },
    }),
    { name: "windows-store" },
  ),
);
