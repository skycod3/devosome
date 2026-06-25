"use client";

import { AnimatePresence, motion } from "motion/react";

import { useWindowsStore } from "@/stores/windows-store";
import { useViewport } from "@/hooks/useViewport";
import type { SnapTarget } from "@/lib/snap";

function targetToRect(target: SnapTarget, vw: number, vh: number) {
  if (target.kind === "maximize") {
    return { x: 0, y: 0, width: vw, height: vh };
  }
  return {
    x: target.x,
    y: target.y,
    width: target.width,
    height: target.height,
  };
}

/**
 * Aero-style glass overlay shown behind the dragged window, previewing where it
 * will snap. Driven by `snapPreview` in the windows store (set during drag).
 */
export function SnapPreview() {
  const preview = useWindowsStore((s) => s.snapPreview);
  const highestZIndex = useWindowsStore((s) => s.highestZIndex);
  const { width, height } = useViewport();

  const rect = preview ? targetToRect(preview, width, height) : null;

  return (
    <AnimatePresence>
      {rect && (
        <motion.div
          // `kind` as key so switching targets re-runs the entrance animation.
          key={preview!.kind}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            zIndex: Math.max(0, highestZIndex - 1),
          }}
          className="pointer-events-none rounded-xl border-2 border-white/60 bg-white/10 shadow-2xl ring-1 ring-black/10 backdrop-blur-md"
        />
      )}
    </AnimatePresence>
  );
}
