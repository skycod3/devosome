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
  ) => void;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;

  // Window states
  setActiveWindow: (id: string) => void;
  deactivateAllWindows: () => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;

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
          return;
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
          windows: state.windows.map((window) =>
            window.id === id ? { ...window, isMaximized: true } : window,
          ),
        }));
      },

      restoreWindow(id) {
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, isMinimized: false, isMaximized: false }
              : window,
          ),
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
        }));
      },
    }),
    { name: "windows-store" },
  ),
);
