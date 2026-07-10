"use client";

import { useEffect } from "react";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useNotify } from "@/hooks/useNotify";
import { useSounds } from "@/hooks/useSounds";

/** Mount-only desktop side effects (no render output). */
export function DesktopEffects() {
  const isMobile = useIsMobile();
  const { notify } = useNotify();
  const { playClickLeft, playClickRight } = useSounds();

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button === 0) playClickLeft();
    };
    const handleContextMenu = () => playClickRight();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [playClickLeft, playClickRight]);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.WELCOME_SHOWN)) return;
    localStorage.setItem(STORAGE_KEYS.WELCOME_SHOWN, "true");
    notify.info("Welcome to DevOSome! 🖖", {
      description:
        "Explore the projects and portfolio of a passionate developer.",
      duration: 1000 * 8,
      dedupeId: "welcome",
      expiresIn: 1000 * 60 * 60 * 24 * 3,
      delay: 1000 * 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isMobile) return;
    if (localStorage.getItem(STORAGE_KEYS.TIPS_HINT_SHOWN)) return;
    localStorage.setItem(STORAGE_KEYS.TIPS_HINT_SHOWN, "true");
    notify.info("Tip: open the Tips note on your desktop 📝", {
      description: "It lists handy shortcuts and things you can do here.",
      duration: 1000 * 8,
      dedupeId: "tips-hint",
      expiresIn: 1000 * 60 * 60 * 24 * 3,
      delay: 1000 * 10,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
