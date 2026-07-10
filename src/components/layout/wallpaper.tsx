"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSettings } from "@/hooks/useSettings";
import { useIconActions } from "@/hooks/useIconActions";

// Lazy-loaded: the wallpaper distortion shader pulls in three.js (~1MB). It
// only renders on desktop with motion enabled, and mounting it via next/dynamic
// keeps three.js out of the initial bundle (loaded after first paint).
const GridDistortion = dynamic(
  () =>
    import("@/components/effects/grid-distortion").then((mod) => ({
      default: mod.GridDistortion,
    })),
  { ssr: false },
);

export function Wallpaper() {
  const { wallpaper } = useSettings();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const { unhighlightAllIcons } = useIconActions();
  const wallpaperSrc = `/wallpapers/${wallpaper}`;

  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-top"
        style={{ backgroundImage: `url(${wallpaperSrc})` }}
      />
      {!isMobile && (
        <div className="absolute inset-0" onClick={() => unhighlightAllIcons()}>
          {/* Distortion shader animates continuously — skip it under reduced
              motion, keeping the overlay (and its deselect-on-click) intact. */}
          {!prefersReducedMotion && (
            <GridDistortion
              imageSrc={wallpaperSrc}
              grid={100}
              mouse={0.1}
              strength={0.15}
              relaxation={0.9}
            />
          )}
        </div>
      )}
    </>
  );
}
