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
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  // Store previous position/size before maximizing to restore later
  restorePosition?: { x: number; y: number };
  restoreSize?: { width: number; height: number };
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
      openWindow(iconId, title, icon) {
        const { windows, highestZIndex } = get();

        // Check if window already exists for this icon
        const existingWindow = windows.find((w) => w.iconId === iconId);

        if (existingWindow) {
          // Window exists: restore if minimized and bring to front
          get().restoreWindow(existingWindow.id);
          get().bringToFront(existingWindow.id);
          return existingWindow.id;
        }

        // Create new window
        const newWindowId = `window-${iconId}-${Date.now()}`;
        const newWindow: Window = {
          id: newWindowId,
          iconId,
          title,
          icon,
          isActive: true,
          isMinimized: false,
          isMaximized: false,
          position: DEFAULT_WINDOW_POSITION,
          size: DEFAULT_WINDOW_SIZE,
          zIndex: highestZIndex + 1,
        };

        set((state) => ({
          windows: [
            ...state.windows.map((w) => ({ ...w, isActive: false })),
            newWindow,
          ],
          activeWindowId: newWindowId,
          highestZIndex: highestZIndex + 1,
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
              ? Math.max(...newWindows.map((w) => w.zIndex))
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
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, isMinimized: true, isActive: false }
              : window,
          ),
          activeWindowId:
            state.activeWindowId === id ? null : state.activeWindowId,
        }));
      },

      maximizeWindow(id) {
        set((state) => ({
          windows: state.windows.map((window) => {
            if (window.id === id) {
              return {
                ...window,
                isMaximized: true,
                // Save current position/size before maximizing
                restorePosition: window.position,
                restoreSize: window.size,
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
            if (window.id !== id) return window;

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
                position: window.restorePosition,
                size: window.restoreSize,
                restorePosition: undefined,
                restoreSize: undefined,
              };
            }

            // Just restore from minimized
            return {
              ...window,
              isMinimized: false,
              isMaximized: false,
            };
          }),
        }));
      },

      toggleMinimize(id) {
        const window = get().windows.find((w) => w.id === id);
        if (!window) return;

        if (window.isMinimized) {
          get().restoreWindow(id);
          get().setActiveWindow(id);
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
        const { highestZIndex } = get();
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, zIndex: highestZIndex + 1 }
              : window,
          ),
          highestZIndex: highestZIndex + 1,
          activeWindowId: id,
        }));
      },
    }),
    { name: "windows-store" },
  ),
);
