"use client";

import { useWindowsStore } from "@/stores/windows-store";

/**
 * Actions only from the windows-store. Zustand actions have stable references,
 * so selecting them individually creates NO subscription to the `windows`
 * array: a component that only dispatches never re-renders on window changes.
 */
export const useWindowActions = () => ({
  openWindow: useWindowsStore((s) => s.openWindow),
  closeWindow: useWindowsStore((s) => s.closeWindow),
  closeAllWindows: useWindowsStore((s) => s.closeAllWindows),
  setActiveWindow: useWindowsStore((s) => s.setActiveWindow),
  deactivateAllWindows: useWindowsStore((s) => s.deactivateAllWindows),
  minimizeWindow: useWindowsStore((s) => s.minimizeWindow),
  maximizeWindow: useWindowsStore((s) => s.maximizeWindow),
  restoreWindow: useWindowsStore((s) => s.restoreWindow),
  toggleMinimize: useWindowsStore((s) => s.toggleMinimize),
  toggleMaximize: useWindowsStore((s) => s.toggleMaximize),
  setWindowPosition: useWindowsStore((s) => s.setWindowPosition),
  setWindowSize: useWindowsStore((s) => s.setWindowSize),
  snapWindow: useWindowsStore((s) => s.snapWindow),
  setSnapPreview: useWindowsStore((s) => s.setSnapPreview),
  bringToFront: useWindowsStore((s) => s.bringToFront),
  setWindowActiveTab: useWindowsStore((s) => s.setWindowActiveTab),
  updateWindowTitle: useWindowsStore((s) => s.updateWindowTitle),
});
