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
  const screenSaverEnabled = useSettingsStore(
    (state) => state.screenSaverEnabled,
  );
  const setScreenSaverEnabled = useSettingsStore(
    (state) => state.setScreenSaverEnabled,
  );
  const screenSaverPreview = useSettingsStore(
    (state) => state.screenSaverPreview,
  );
  const setScreenSaverPreview = useSettingsStore(
    (state) => state.setScreenSaverPreview,
  );
  const viewModes = useSettingsStore((state) => state.viewModes);
  const setViewMode = useSettingsStore((state) => state.setViewMode);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);

  return {
    // state
    wallpaper,
    iconVisibility,
    screenSaverEnabled,
    screenSaverPreview,
    viewModes,
    soundEnabled,
    // actions
    setWallpaper,
    setIconVisibility,
    setScreenSaverEnabled,
    setScreenSaverPreview,
    setViewMode,
    setSoundEnabled,
  };
};
