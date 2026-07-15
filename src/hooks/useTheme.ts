"use client";

import { useThemeStore } from "@/stores/theme-store";

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const systemThemeEnabled = useThemeStore((state) => state.systemThemeEnabled);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setSystemThemeEnabled = useThemeStore(
    (state) => state.setSystemThemeEnabled,
  );

  return {
    // state
    theme,
    systemThemeEnabled,
    // computed
    isDark: theme === "dark",
    isLight: theme === "light",
    // actions
    setTheme,
    toggleTheme,
    setSystemThemeEnabled,
  };
};

/**
 * Theme actions only — stable refs, no subscription to theme state. Use where a
 * component needs to dispatch (e.g. init on mount) without re-rendering on
 * every theme change (the ThemeProvider wraps the whole app).
 */
export const useThemeActions = () => ({
  setTheme: useThemeStore((s) => s.setTheme),
  toggleTheme: useThemeStore((s) => s.toggleTheme),
  setSystemThemeEnabled: useThemeStore((s) => s.setSystemThemeEnabled),
  initializeTheme: useThemeStore((s) => s.initializeTheme),
});
