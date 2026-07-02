"use client";

import { useReducedMotion } from "motion/react";

import { useTheme } from "@/hooks/useTheme";
import DotGrid from "./dot-grid";

export function HeroBackdrop() {
  const reducedMotion = useReducedMotion() ?? false;
  const { theme } = useTheme();

  // The grid's motion is interaction-driven — honor reduced-motion by skipping it.
  if (reducedMotion) return null;

  const isDark = theme === "dark";

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-1 overflow-hidden ${isDark ? "opacity-60" : "opacity-30"}`}
    >
      <DotGrid
        dotSize={4}
        gap={28}
        proximity={120}
        baseColor={isDark ? "#2b2b31" : "#d4d4d8"}
        activeColor={isDark ? "#6b6b7a" : "#71717a"}
      />
    </div>
  );
}
