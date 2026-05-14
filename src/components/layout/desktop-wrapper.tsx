"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/hooks/useSettings";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { BootScreen } from "@/components/boot-screen";
import { ScreenSaver } from "@/components/screen-saver";

import { APPLICATIONS } from "@/constants/applications";
import { useWindows } from "@/hooks/useWindows";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuItem,
  ContextMenuRadioItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
} from "@/components/ui/context-menu";

import dynamic from "next/dynamic";

const Desktop = dynamic(
  () =>
    import("./desktop").then((mod) => ({
      default: mod.Desktop,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-background" />
    ),
  },
);

export function DesktopWrapper() {
  const [booting, setBooting] = useState(true);
  const { theme, setTheme, systemThemeEnabled, setSystemThemeEnabled } =
    useTheme();
  const { screenSaverEnabled, setScreenSaverEnabled, soundEnabled, setSoundEnabled } = useSettings();
  const { isIdle } = useIdleTimer();
  const { openWindowCentered } = useWindows();

  function handleValueChange(value: string) {
    if (value === "system") {
      setSystemThemeEnabled(true);
    } else {
      setTheme(value as typeof theme);
    }
  }

  const showScreenSaver = !booting && screenSaverEnabled && isIdle;

  const settingsApp = APPLICATIONS["system-settings"];

  return (
    <>
      {booting && <BootScreen onComplete={() => setBooting(false)} />}
      <ContextMenu>
        <ContextMenuTrigger>{!booting && <Desktop />}</ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>Theme</ContextMenuLabel>
            <ContextMenuRadioGroup
              value={systemThemeEnabled ? "system" : theme}
              onValueChange={(v) => handleValueChange(v)}
            >
              <ContextMenuRadioItem value="light">Light</ContextMenuRadioItem>
              <ContextMenuRadioItem value="dark">Dark</ContextMenuRadioItem>
              <ContextMenuRadioItem value="system">System</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuCheckboxItem
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          >
            Sound
          </ContextMenuCheckboxItem>

          <ContextMenuCheckboxItem
            checked={screenSaverEnabled}
            onCheckedChange={setScreenSaverEnabled}
          >
            Screen Saver
          </ContextMenuCheckboxItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() =>
              openWindowCentered(
                settingsApp.id,
                "",
                settingsApp.windowTitle ?? "",
                "",
              )
            }
          >
            Settings
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {showScreenSaver && <ScreenSaver />}
    </>
  );
}
