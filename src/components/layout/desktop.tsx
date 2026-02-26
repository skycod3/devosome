import WallpaperImage from "@/assets/wallpaper.jpg";

import { useEffect } from "react";

import { DESKTOP_ICONS } from "@/constants/icons";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";

import { Taskbar } from "./taskbar";
import { Icon } from "../icon";
import { Window } from "../window";

export function Desktop() {
  const { icons, setIcons, unhighlightAllIcons } = useIcons();
  const { windows } = useWindows();

  function handleDesktopClick(event: React.MouseEvent<HTMLDivElement>) {
    // Only handle clicks directly on the desktop div, not on child elements
    if (event.target !== event.currentTarget) return;

    if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
  }

  useEffect(() => {
    // Initialize icons only if empty (prevents duplication on remount)
    if (icons.length === 0) {
      setIcons(DESKTOP_ICONS);
    }
  }, [icons.length, setIcons]);

  return (
    <div
      style={{
        backgroundImage: `url(${WallpaperImage.src})`,
        gridTemplateRows: "[taskbar] auto [desktop] 1fr [dock] auto",
      }}
      className="relative grid h-screen bg-cover bg-top select-none"
    >
      <div style={{ gridRow: "taskbar" }}>
        <Taskbar />
      </div>

      <div style={{ gridRow: "desktop" }}>
        <div
          className="text-white grid-cols-fill-7 grid-rows-fill-7 grid h-full grid-flow-col place-items-center gap-4 p-4"
          onClick={handleDesktopClick}
        >
          {icons.map((icon) => (
            <Icon key={icon.id} {...icon} />
          ))}
        </div>
      </div>

      <div style={{ gridRow: "dock" }}>Dock</div>

      {windows.map((window) => (
        <Window key={window.id} id={window.id} />
      ))}
    </div>
  );
}
