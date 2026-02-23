import WallpaperImage from "@/assets/wallpaper.jpg";

import { Taskbar } from "./taskbar";

export function Desktop() {
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

      <div style={{ gridRow: "desktop" }}>Desktop</div>

      <div style={{ gridRow: "dock" }}>Dock</div>
    </div>
  );
}
