import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface SettingsState {
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
  iconVisibility: Record<string, boolean>;
  setIconVisibility: (id: string, show: boolean) => void;
  screenSaverEnabled: boolean;
  setScreenSaverEnabled: (enabled: boolean) => void;
  /** Transient: forces the screen saver on for a manual preview. Not persisted. */
  screenSaverPreview: boolean;
  setScreenSaverPreview: (active: boolean) => void;
  viewModes: Record<string, "grid" | "list">;
  setViewMode: (tabId: string, mode: "grid" | "list") => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        wallpaper: "wallpaper-1.jpg",
        setWallpaper: (wallpaper) => set({ wallpaper }),
        iconVisibility: {},
        setIconVisibility: (id, show) =>
          set((state) => ({
            iconVisibility: { ...state.iconVisibility, [id]: show },
          })),
        screenSaverEnabled: true,
        setScreenSaverEnabled: (enabled) =>
          set({ screenSaverEnabled: enabled }),
        screenSaverPreview: false,
        setScreenSaverPreview: (active) => set({ screenSaverPreview: active }),
        viewModes: {},
        setViewMode: (tabId, mode) =>
          set((state) => ({
            viewModes: { ...state.viewModes, [tabId]: mode },
          })),
        soundEnabled: true,
        setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      }),
      {
        name: "settings-store",
        // screenSaverPreview is a transient trigger — never persist it, or the
        // screen saver would reappear on reload.
        partialize: ({ screenSaverPreview: _omit, ...rest }) => rest,
      },
    ),
    { name: "settings-store" },
  ),
);
