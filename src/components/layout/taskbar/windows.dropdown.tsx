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

import { useWindows } from "@/hooks/useWindows";

import { ChevronDown, X } from "lucide-react";

export function WindowsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { windows, closeWindow, closeAllWindows, bringToFront, restoreWindow } =
    useWindows();

  function handleItemClick(windowId: string) {
    const window = windows.find((w) => w.id === windowId);

    if (!window) return;

    if (window.isMinimized) {
      restoreWindow(window.id);
    }

    if (!window.isActive) {
      bringToFront(window.id);
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1">
          Windows{" "}
          {windows.length > 0 && (
            <span className="text-xs">({windows.length})</span>
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
          {windows.map((window) => (
            <DropdownMenuItem
              className="flex items-center gap-2"
              key={window.id}
              onClick={() => handleItemClick(window.id)}
            >
              <span
                className={`size-1.5 shrink-0 rounded-full ${window.isActive ? "animate-pulse bg-blue-500" : "bg-neutral-300"} `}
              ></span>

              <p className="line-clamp-2">{window.title}</p>

              <button
                aria-label="Close Window"
                onClick={() => closeWindow(window.id)}
                className="flex-center ml-auto size-4 rounded-full border border-red-500"
              >
                <X className="size-3 text-red-500" />
              </button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={closeAllWindows}>Close All</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
