"use client";

import { useTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Monitor } from "lucide-react";

export function SystemTray() {
  const { theme, setTheme, systemThemeEnabled, setSystemThemeEnabled } =
    useTheme();

  return (
    <div className="flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded p-2"
            title={
              systemThemeEnabled
                ? "Theme: Auto (System)"
                : `Theme: ${theme === "light" ? "Light" : "Dark"}`
            }
          >
            {systemThemeEnabled ? (
              <Monitor className="size-4" />
            ) : theme === "light" ? (
              <Sun className="size-4 text-yellow-400" />
            ) : (
              <Moon className="size-4 text-blue-400" />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
            <Sun className="size-4 icon-fix text-yellow-400" />
            <span>Light</span>
            {!systemThemeEnabled && theme === "light" && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
            <Moon className="size-4 icon-fix text-blue-400" />
            <span>Dark</span>
            {!systemThemeEnabled && theme === "dark" && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setSystemThemeEnabled(true)}
            className="gap-2"
          >
            <Monitor className="size-4 icon-fix" />
            <span>Auto (System)</span>
            {systemThemeEnabled && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
