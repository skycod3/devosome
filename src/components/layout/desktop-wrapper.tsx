"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/hooks/useSettings";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { BootScreen } from "@/components/boot-screen";
import { ScreenSaver } from "@/components/screen-saver";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuTrigger,
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
  const { screenSaverEnabled } = useSettings();
  const { isIdle } = useIdleTimer();

  function handleValueChange(value: string) {
    if (value === "system") {
      setSystemThemeEnabled(true);
    } else {
      setTheme(value as typeof theme);
    }
  }

  const showScreenSaver = !booting && screenSaverEnabled && isIdle;

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
        </ContextMenuContent>
      </ContextMenu>
      {showScreenSaver && <ScreenSaver />}
    </>
  );
}
