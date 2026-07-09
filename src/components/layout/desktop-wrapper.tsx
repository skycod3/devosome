"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/hooks/useSettings";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { BootScreen } from "@/components/boot-screen";

import { APPLICATIONS } from "@/constants/applications";
import { useOpenWindow } from "@/hooks/useOpenWindow";

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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    ),
  },
);

// Lazy-loaded: the screensaver pulls in three.js (~1MB) but only ever renders
// after the user goes idle. Keeping it out of the initial bundle.
const ScreenSaver = dynamic(
  () =>
    import("@/components/screen-saver").then((mod) => ({
      default: mod.ScreenSaver,
    })),
  { ssr: false },
);

export function DesktopWrapper() {
  const [booting, setBooting] = useState(true);
  const { theme, setTheme, systemThemeEnabled, setSystemThemeEnabled } =
    useTheme();
  const {
    screenSaverEnabled,
    setScreenSaverEnabled,
    screenSaverPreview,
    setScreenSaverPreview,
    soundEnabled,
    setSoundEnabled,
  } = useSettings();
  const { isIdle } = useIdleTimer();
  const openWindowCentered = useOpenWindow();
  // a11y: don't auto-launch the animated 3D screensaver for users who prefer
  // reduced motion (the toggle still reflects their saved preference).
  const prefersReducedMotion = useReducedMotion();

  function handleValueChange(value: string) {
    if (value === "system") {
      setSystemThemeEnabled(true);
    } else {
      setTheme(value as typeof theme);
    }
  }

  const showScreenSaver =
    !booting &&
    !prefersReducedMotion &&
    ((screenSaverEnabled && isIdle) || screenSaverPreview);

  // Dismiss a manual preview on the first deliberate interaction. Passive
  // events (mousemove/wheel) are excluded so the preview isn't torn down by an
  // accidental cursor twitch right after the user clicked "Preview".
  useEffect(() => {
    if (!screenSaverPreview) return;
    function dismiss() {
      setScreenSaverPreview(false);
    }
    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "keydown",
      "touchstart",
    ];
    for (const event of events) {
      window.addEventListener(event, dismiss, { passive: true });
    }
    return () => {
      for (const event of events) {
        window.removeEventListener(event, dismiss);
      }
    };
  }, [screenSaverPreview, setScreenSaverPreview]);

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
