"use client";

import { useEffect } from "react";
import { useThemeActions } from "@/hooks/useTheme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { initializeTheme } = useThemeActions();

  useEffect(() => {
    // initialize theme on mount (client-side only)
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
}
