import { useCallback, useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";

import { AnimatePresence, useReducedMotion } from "motion/react";

import { DESKTOP_ICONS } from "@/constants/icons";
import { STORAGE_KEYS } from "@/constants/storage-keys";

import { useIconActions } from "@/hooks/useIconActions";
import { useDesktopIconIds } from "@/hooks/useIconSelectors";
import { useWindowIds } from "@/hooks/useWindowSelectors";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSettings } from "@/hooks/useSettings";

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

import { Taskbar } from "./taskbar";
import { Icon } from "../icon";
import { Window } from "../window";
import { SnapPreview } from "../window/snap-preview";
import { Dock } from "./dock";

import { useNotify } from "@/hooks/useNotify";
import { useSounds } from "@/hooks/useSounds";
import { Spotlight } from "@/components/spotlight";

export function Desktop() {
  const iconIds = useDesktopIconIds();
  const { setIcons, unhighlightAllIcons } = useIconActions();
  const windowIds = useWindowIds();
  const isMobile = useIsMobile();
  const { wallpaper, iconVisibility } = useSettings();
  const { notify } = useNotify();
  const { playClickLeft, playClickRight } = useSounds();
  // a11y: the wallpaper distortion shader animates continuously — drop it for
  // users who prefer reduced motion (the static wallpaper stays as background).
  const prefersReducedMotion = useReducedMotion();
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
    // unhighlightAllIcons is a no-op when nothing is highlighted (store guard),
    // so we don't need to subscribe to `icons` just to check.
    unhighlightAllIcons();
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

  // Point first-time visitors at the Tips note — run once on mount.
  useEffect(() => {
    if (isMobile) return;

    if (localStorage.getItem(STORAGE_KEYS.TIPS_HINT_SHOWN)) return;

    localStorage.setItem(STORAGE_KEYS.TIPS_HINT_SHOWN, "true");
    notify.info("Tip: open the Tips note on your desktop 📝", {
      description: "It lists handy shortcuts and things you can do here.",
      duration: 1000 * 8, // 8 seconds
      dedupeId: "tips-hint",
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
      // tabIndex makes the desktop a programmatic focus target: when a window
      // closes and its opener is gone, focus returns here instead of <body>.
      tabIndex={-1}
      style={{
        backgroundImage: `url(${wallpaperSrc})`,
        gridTemplateRows: "[taskbar] auto [desktop] 1fr [dock] auto",
      }}
      className="desktop-area relative grid h-dvh bg-cover bg-top select-none overflow-hidden outline-none"
    >
      {!isMobile && (
        <div className="absolute inset-0" onClick={handleDesktopClick}>
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

      <div className="z-1" style={{ gridRow: "taskbar" }}>
        <Taskbar />
      </div>

      <div style={{ gridRow: "desktop" }}>
        <div className="text-white grid-cols-fill-5 grid-rows-fill-5 sm:grid-cols-fill-6 sm:grid-rows-fill-6 grid h-full grid-flow-col place-items-center gap-4 p-4">
          {iconIds.map((id) => (
            <Icon key={id} id={id} />
          ))}
        </div>
      </div>

      <div style={{ gridRow: "dock" }}>
        <Dock />
      </div>

      <SnapPreview />

      <AnimatePresence>
        {windowIds.map((id) => (
          <Window key={id} id={id} desktopRect={desktopRect} />
        ))}
      </AnimatePresence>

      {spotlightOpen && <Spotlight onClose={() => setSpotlightOpen(false)} />}
    </div>
  );
}
