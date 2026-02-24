"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // initialize theme on mount (client-side only)
    useThemeStore.getState().initializeTheme();
  }, []);

  return <>{children}</>;
}
