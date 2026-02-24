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
