import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { DEFAULT_THEME } from "@/constants/theme";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  systemThemeEnabled: boolean;
  // actions
  initializeTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSystemThemeEnabled: (enabled: boolean) => void;
}

// constant for media query
const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

// listener reference to allow cleanup
let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;

// helper: get media query list (client-side only)
const getMediaQuery = () => {
  if (typeof window === "undefined") return null;
  return window.matchMedia(DARK_MODE_QUERY);
};

// helper: get current system theme preference
const getSystemTheme = (): Theme => {
  const mediaQuery = getMediaQuery();
  if (!mediaQuery) return DEFAULT_THEME;
  return mediaQuery.matches ? "dark" : "light";
};

// helper: apply theme to DOM (client-side only)
const applyThemeToDOM = (theme: Theme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

// helper: remove system theme listener
const removeSystemThemeListener = () => {
  if (!systemThemeListener) return;

  const mediaQuery = getMediaQuery();
  if (mediaQuery) {
    mediaQuery.removeEventListener("change", systemThemeListener);
  }
  systemThemeListener = null;
};

// helper: add system theme listener
const addSystemThemeListener = (set: (state: Partial<ThemeState>) => void) => {
  const mediaQuery = getMediaQuery();
  if (!mediaQuery) return;

  systemThemeListener = (e: MediaQueryListEvent) => {
    const newTheme = e.matches ? "dark" : "light";
    set({ theme: newTheme });
    applyThemeToDOM(newTheme);
  };

  mediaQuery.addEventListener("change", systemThemeListener);
};

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: DEFAULT_THEME,
        systemThemeEnabled: true,

        initializeTheme() {
          const { theme, systemThemeEnabled } = get();

          // only run on client-side
          if (typeof window === "undefined") return;

          // cleanup previous listener if exists
          removeSystemThemeListener();

          if (systemThemeEnabled) {
            const systemTheme = getSystemTheme();
            set({ theme: systemTheme });
            applyThemeToDOM(systemTheme);
            addSystemThemeListener(set);
          } else {
            applyThemeToDOM(theme);
          }
        },

        setTheme(theme: Theme) {
          // only run on client-side
          if (typeof window === "undefined") return;

          removeSystemThemeListener();
          set({ theme, systemThemeEnabled: false });
          applyThemeToDOM(theme);
        },

        toggleTheme() {
          const currentTheme = get().theme;
          const newTheme = currentTheme === "light" ? "dark" : "light";

          // only run on client-side
          if (typeof window === "undefined") return;

          removeSystemThemeListener();
          set({ theme: newTheme, systemThemeEnabled: false });
          applyThemeToDOM(newTheme);
        },

        setSystemThemeEnabled(enabled: boolean) {
          // only run on client-side
          if (typeof window === "undefined") return;

          if (enabled) {
            const systemTheme = getSystemTheme();
            set({ theme: systemTheme, systemThemeEnabled: true });
            applyThemeToDOM(systemTheme);
            addSystemThemeListener(set);
          } else {
            removeSystemThemeListener();
            set({ systemThemeEnabled: false });
          }
        },
      }),
      { name: "theme-store" },
    ),
  ),
);
