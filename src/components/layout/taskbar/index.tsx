import { StartDropdown } from "./start-dropdown";
import { Weather } from "./weather";
import { Clock } from "./clock";
import { SystemTray } from "../system-tray";
import { WindowsDropdown } from "./windows.dropdown";

import { useWindowCount } from "@/hooks/useWindowSelectors";

// Isolates the window-count subscription so opening/closing a window re-renders
// only this piece, not the whole Taskbar (Clock/Weather/SystemTray).
function TaskbarWindows() {
  const windowCount = useWindowCount();
  return windowCount > 0 ? <WindowsDropdown /> : null;
}

export function Taskbar() {
  return (
    <div className="bg-background/50 text-foreground flex gap-4 items-center justify-between px-2">
      <div className="flex flex-wrap gap-x-8">
        <StartDropdown />

        <TaskbarWindows />
      </div>

      <div className="flex items-center gap-4">
        <Clock />
        <Weather />
      </div>

      <SystemTray />
    </div>
  );
}
