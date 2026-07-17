import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useWindowActions } from "@/hooks/useWindowActions";
import { useWindowIds, useWindowSummary } from "@/hooks/useWindowSelectors";

import { ChevronDown, X, Folder } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

export function WindowsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  // Only the id list — the trigger/count re-render when a window opens or
  // closes, not on every position change. Each row subscribes to its own fields.
  const windowIds = useWindowIds();
  const { closeAllWindows } = useWindowActions();
  const isMobile = useIsMobile();

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <button data-minimize-anchor className="flex items-center gap-1">
          {isMobile ? <Folder className="size-4" /> : "Windows"}
          {windowIds.length > 0 && (
            <span className="text-xs">({windowIds.length})</span>
          )}
          <ChevronDown
            className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Opened Windows</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {windowIds.map((id) => (
            <WindowRow key={id} id={id} />
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={closeAllWindows}>Close All</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WindowRow({ id }: { id: string }) {
  const { title, isActive, isMinimized } = useWindowSummary(id);
  const { closeWindow, bringToFront, restoreWindow } = useWindowActions();

  function handleClick() {
    if (isMinimized) {
      // Restore minimized window (automatically activates and brings to front)
      restoreWindow(id);
    } else if (!isActive) {
      // Bring non-active window to front
      bringToFront(id);
    }
  }

  return (
    <DropdownMenuItem className="flex items-center gap-2" onClick={handleClick}>
      <span
        className={`size-1.5 shrink-0 rounded-full ${isActive ? "animate-pulse bg-blue-500" : "bg-neutral-300"} `}
      ></span>

      <p className="line-clamp-2">{title}</p>

      <button
        aria-label="Close Window"
        onClick={(e) => {
          e.stopPropagation();
          closeWindow(id);
        }}
        className="flex-center ml-auto size-5 sm:size-4 rounded-full border border-red-500"
      >
        <X className="size-3 text-red-500" />
      </button>
    </DropdownMenuItem>
  );
}
