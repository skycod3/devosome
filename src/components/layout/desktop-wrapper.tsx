"use client";

import { useTheme } from "@/hooks/useTheme";

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
  },
);

export function DesktopWrapper() {
  const { theme, setTheme, systemThemeEnabled, setSystemThemeEnabled } =
    useTheme();

  function handleValueChange(value: string) {
    if (value === "system") {
      setSystemThemeEnabled(true);
    } else {
      setTheme(value as typeof theme);
    }
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Desktop />
        </ContextMenuTrigger>

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
    </>
  );
}
