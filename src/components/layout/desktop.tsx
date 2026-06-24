import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence } from "motion/react";

import { DESKTOP_ICONS } from "@/constants/icons";
import { STORAGE_KEYS } from "@/constants/storage-keys";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSettings } from "@/hooks/useSettings";

import GridDistortion from "@/components/effects/grid-distortion";

import { Taskbar } from "./taskbar";
import { Icon } from "../icon";
import { Window } from "../window";
import { Dock } from "./dock";

import { useNotify } from "@/hooks/useNotify";
import { useSounds } from "@/hooks/useSounds";
import { Spotlight } from "@/components/spotlight";

export function Desktop() {
  const { icons, setIcons, unhighlightAllIcons } = useIcons();
  const { windows } = useWindows();
  const isMobile = useIsMobile();
  const { wallpaper, iconVisibility } = useSettings();
  const { notify } = useNotify();
  const { playClickLeft, playClickRight } = useSounds();
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const wallpaperSrc = `/wallpapers/${wallpaper}`;
  const desktopRef = useRef<HTMLDivElement>(null);
  const [desktopRect, setDesktopRect] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });

  function handleDesktopClick() {
    if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
  }

  const handleSpotlightKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setSpotlightOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleSpotlightKeyDown);
    return () => window.removeEventListener("keydown", handleSpotlightKeyDown);
  }, [handleSpotlightKeyDown]);

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

  // Seed desktop icons from config + persisted visibility — run once on mount.
  useEffect(() => {
    setIcons(
      DESKTOP_ICONS.map((icon) => ({
        ...icon,
        show: iconVisibility[icon.id] ?? icon.show,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show welcome message on first visit — run once on mount.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.WELCOME_SHOWN)) return;

    localStorage.setItem(STORAGE_KEYS.WELCOME_SHOWN, "true");
    notify.info("Welcome to DevOSome! 🖖", {
      description:
        "Explore the projects and portfolio of a passionate developer.",
      duration: 1000 * 8, // 8 seconds
      dedupeId: "welcome",
      expiresIn: 1000 * 60 * 60 * 24 * 3, // 3 days
      delay: 1000 * 2, // Show after 2 seconds
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show spotlight tip on first visit — run once on mount.
  useEffect(() => {
    if (isMobile) return;

    if (localStorage.getItem(STORAGE_KEYS.SPOTLIGHT_TIP_SHOWN)) return;

    localStorage.setItem(STORAGE_KEYS.SPOTLIGHT_TIP_SHOWN, "true");
    notify.info("Tip: Press Ctrl+K to open Spotlight Search 🔍", {
      duration: 1000 * 8, // 8 seconds
      dedupeId: "spotlight-tip",
      expiresIn: 1000 * 60 * 60 * 24 * 3, // 3 days
      delay: 1000 * 10, // Show after 10 seconds
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = desktopRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setDesktopRect({
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={desktopRef}
      style={{
        backgroundImage: `url(${wallpaperSrc})`,
        gridTemplateRows: "[taskbar] auto [desktop] 1fr [dock] auto",
      }}
      className="desktop-area relative grid h-dvh bg-cover bg-top select-none overflow-hidden"
    >
      {!isMobile && (
        <div className="absolute inset-0" onClick={handleDesktopClick}>
          <GridDistortion
            imageSrc={wallpaperSrc}
            grid={100}
            mouse={0.1}
            strength={0.15}
            relaxation={0.9}
          />
        </div>
      )}

      <div className="z-1" style={{ gridRow: "taskbar" }}>
        <Taskbar />
      </div>

      <div style={{ gridRow: "desktop" }}>
        <div className="text-white grid-cols-fill-5 grid-rows-fill-5 sm:grid-cols-fill-6 sm:grid-rows-fill-6 grid h-full grid-flow-col place-items-center gap-4 p-4">
          {icons
            .filter((icon) => !icon.parentId)
            .map((icon) => icon.show && <Icon key={icon.id} {...icon} />)}
        </div>
      </div>

      <div style={{ gridRow: "dock" }}>
        <Dock />
      </div>

      <AnimatePresence>
        {windows.map((window) => (
          <Window key={window.id} window={window} desktopRect={desktopRect} />
        ))}
      </AnimatePresence>

      {spotlightOpen && <Spotlight onClose={() => setSpotlightOpen(false)} />}
    </div>
  );
}
