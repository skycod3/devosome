"use client";

import { useSettingsStore } from "@/stores/settings-store";

/**
 * Hook for accessing and manipulating application settings.
 * Returns all necessary states and actions.
 */
export const useSettings = () => {
  const wallpaper = useSettingsStore((state) => state.wallpaper);
  const setWallpaper = useSettingsStore((state) => state.setWallpaper);
  const iconVisibility = useSettingsStore((state) => state.iconVisibility);
  const setIconVisibility = useSettingsStore(
    (state) => state.setIconVisibility,
  );

  return {
    // state
    wallpaper,
    iconVisibility,
    // actions
    setWallpaper,
    setIconVisibility,
  };
};
