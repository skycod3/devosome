import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface SettingsState {
  wallpaper: string; // filename, e.g. "wallpaper-1.jpg"
  setWallpaper: (wallpaper: string) => void;
  iconVisibility: Record<string, boolean>; // iconId → show
  setIconVisibility: (id: string, show: boolean) => void;
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
      }),
      { name: "settings-store" },
    ),
    { name: "settings-store" },
  ),
);
