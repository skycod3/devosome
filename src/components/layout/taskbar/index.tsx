import { StartDropdown } from "./start-dropdown";
import { Weather } from "./weather";

export function Taskbar() {
  return (
    <div className="bg-background/50 text-foreground flex items-center justify-between px-2">
      <div className="flex gap-8">
        <StartDropdown />
      </div>

      <div className="flex items-center gap-4">
        <Weather />
      </div>
    </div>
  );
}
