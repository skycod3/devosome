import { useTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sun, Moon, Monitor, Bell } from "lucide-react";
import { Battery } from "@/components/layout/taskbar/battery";
import { Network } from "@/components/layout/taskbar/network";
import { NotificationCenter } from "@/components/layout/taskbar/notification-center";
import { useNotificationsStore } from "@/stores/notifications-store";

export function SystemTray() {
  const { theme, setTheme, systemThemeEnabled, setSystemThemeEnabled } =
    useTheme();
  const { unreadCount } = useNotificationsStore();

  return (
    <div className="flex items-center justify-end gap-3 p-2">
      <Battery />
      <Network />

      {/* Bell / Notification Center */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="relative rounded p-1 hover:bg-foreground/10 transition-colors"
            title="Notifications"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="end">
          <NotificationCenter />
        </PopoverContent>
      </Popover>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded"
            title={
              systemThemeEnabled
                ? "Theme: Auto (System)"
                : `Theme: ${theme === "light" ? "Light" : "Dark"}`
            }
          >
            {systemThemeEnabled ? (
              <Monitor className="size-4" />
            ) : theme === "light" ? (
              <Sun className="size-4 text-yellow-800" />
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
