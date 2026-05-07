import WallpaperImage from "@/assets/wallpaper.jpg";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence } from "motion/react";

import { DESKTOP_ICONS } from "@/constants/icons";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";
import { useIsMobile } from "@/hooks/useIsMobile";

import GridDistortion from "@/components/effects/grid-distortion";

import { Taskbar } from "./taskbar";
import { Icon } from "../icon";
import { Window } from "../window";
import { Dock } from "./dock";

import { toast } from "sonner";

export function Desktop() {
  const { icons, setIcons, unhighlightAllIcons } = useIcons();
  const { windows } = useWindows();
  const isMobile = useIsMobile();
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

  useEffect(() => {
    setIcons(DESKTOP_ICONS);

    const welcomeToastDismissed = localStorage.getItem("welcomeToastDismissed");
    if (welcomeToastDismissed) return;

    toast("Welcome to DevOSome! 🖖", {
      description:
        "Explore the projects and portfolio of a passionate developer.",
      duration: 1000 * 60 * 1, // 1 minute
      onDismiss() {
        localStorage.setItem("welcomeToastDismissed", "true");
      },
      onAutoClose() {
        localStorage.setItem("welcomeToastDismissed", "true");
      },
    });
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
        backgroundImage: `url(${WallpaperImage.src})`,
        gridTemplateRows: "[taskbar] auto [desktop] 1fr [dock] auto",
      }}
      className="relative grid h-dvh bg-cover bg-top select-none overflow-hidden"
    >
      {!isMobile && (
        <div className="absolute inset-0" onClick={handleDesktopClick}>
          <GridDistortion
            imageSrc={WallpaperImage.src}
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
        <div className="text-white grid-cols-fill-5 sm:grid-cols-fill-6 grid-rows-fill-6 grid h-full grid-flow-col place-items-center gap-4 p-4">
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
    </div>
  );
}
