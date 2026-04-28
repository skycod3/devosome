import WallpaperImage from "@/assets/wallpaper.jpg";

import { useEffect } from "react";

import { AnimatePresence } from "motion/react";

import { DESKTOP_ICONS } from "@/constants/icons";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";

import { Taskbar } from "./taskbar";
import { Icon } from "../icon";
import { Window } from "../window";
import { Dock } from "./dock";

export function Desktop() {
  const { icons, setIcons, unhighlightAllIcons } = useIcons();
  const { windows } = useWindows();

  function handleDesktopClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
  }

  useEffect(() => {
    setIcons(DESKTOP_ICONS);
  }, []);

  return (
    <div
      style={{
        backgroundImage: `url(${WallpaperImage.src})`,
        gridTemplateRows: "[taskbar] auto [desktop] 1fr [dock] auto",
      }}
      className="relative grid h-screen bg-cover bg-top select-none overflow-hidden"
    >
      <div style={{ gridRow: "taskbar" }}>
        <Taskbar />
      </div>

      <div style={{ gridRow: "desktop" }}>
        <div
          className="text-white grid-cols-fill-7 grid-rows-fill-7 grid h-full grid-flow-col place-items-center gap-4 p-4"
          onClick={handleDesktopClick}
        >
          {icons
            .filter((icon) => !icon.parentId)
            .map((icon) => (
              <Icon key={icon.id} {...icon} />
            ))}
        </div>
      </div>

      <div style={{ gridRow: "dock" }}>
        <Dock />
      </div>

      <AnimatePresence>
        {windows.map((window) => (
          <Window key={window.id} window={window} />
        ))}
      </AnimatePresence>
    </div>
  );
}
