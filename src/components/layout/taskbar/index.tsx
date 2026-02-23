import { StartDropdown } from "./start-dropdown";

export function Taskbar() {
  return (
    <div className="bg-background/50 text-foreground flex items-center justify-between px-2">
      <div className="flex gap-8">
        <StartDropdown />
      </div>
    </div>
  );
}
