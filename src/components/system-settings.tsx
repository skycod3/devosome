"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useIcons } from "@/hooks/useIcons";
import { useSettings } from "@/hooks/useSettings";
import { WALLPAPERS } from "@/constants/wallpapers";
import { DESKTOP_ICONS } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

type Tab = "appearance" | "wallpaper" | "desktop" | "sound";

const TABS: { id: Tab; label: string }[] = [
  { id: "appearance", label: "Appearance" },
  { id: "wallpaper", label: "Wallpaper" },
  { id: "desktop", label: "Desktop" },
  { id: "sound", label: "Sound" },
];

export function SystemSettings({ iconId: _ }: { iconId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("appearance");

  return (
    <div className="flex h-full overflow-hidden">
      <nav className="flex w-36 shrink-0 flex-col gap-1 border-r border-border p-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded px-3 py-2 text-left text-sm transition-colors",
              activeTab === tab.id
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "appearance" && <AppearancePanel />}
        {activeTab === "wallpaper" && <WallpaperPanel />}
        {activeTab === "desktop" && <DesktopPanel />}
        {activeTab === "sound" && <SoundPanel />}
      </div>
    </div>
  );
}

function AppearancePanel() {
  const { theme, systemThemeEnabled, setTheme, setSystemThemeEnabled } =
    useTheme();
  const { screenSaverEnabled, setScreenSaverEnabled } = useSettings();

  const options: { value: "light" | "dark" | "system"; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  function handleChange(value: "light" | "dark" | "system") {
    if (value === "system") {
      setSystemThemeEnabled(true);
    } else {
      setTheme(value);
    }
  }

  function isChecked(value: "light" | "dark" | "system") {
    if (value === "system") return systemThemeEnabled;
    return !systemThemeEnabled && theme === value;
  }

  return (
    <div className="flow">
      <h2 className="text-sm font-semibold">Appearance</h2>
      <div className="grid justify-items-start gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="inline-flex cursor-pointer items-center gap-3"
          >
            <input
              type="radio"
              name="theme"
              value={opt.value}
              checked={isChecked(opt.value)}
              onChange={() => handleChange(opt.value)}
              className="accent-primary"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>

      <h2 className="text-sm font-semibold">Screen Saver</h2>
      <label className="inline-flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={screenSaverEnabled}
          onChange={(e) => setScreenSaverEnabled(e.target.checked)}
          className="accent-primary"
        />
        <span className="text-sm">Enable screen saver</span>
      </label>
    </div>
  );
}

function WallpaperPanel() {
  const { wallpaper, setWallpaper } = useSettings();

  return (
    <div className="flow">
      <h2 className="text-sm font-semibold">Wallpaper</h2>
      <div className="grid grid-cols-fill-12 gap-3">
        {WALLPAPERS.map((w) => (
          <button
            key={w.filename}
            onClick={() => setWallpaper(w.filename)}
            className={cn(
              "overflow-hidden rounded-md border-2 transition-colors",
              wallpaper === w.filename
                ? "border-primary"
                : "border-transparent hover:border-muted-foreground",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/wallpapers/${w.filename}`}
              alt={w.label}
              className="aspect-video w-full object-cover"
            />
            <p className="py-1 text-center text-xs text-muted-foreground">
              {w.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function DesktopPanel() {
  const { icons, showIcon, hideIcon } = useIcons();
  const { setIconVisibility } = useSettings();

  const desktopIconIds = new Set(DESKTOP_ICONS.map((i) => i.id));
  const controllable = icons.filter((i) => desktopIconIds.has(i.id));

  function handleChange(id: string, show: boolean) {
    show ? showIcon(id) : hideIcon(id);
    setIconVisibility(id, show);
  }

  return (
    <div className="flow">
      <h2 className="text-sm font-semibold">Desktop Icons</h2>
      <div className="grid justify-items-start gap-2">
        {controllable.map((icon) => (
          <label
            key={icon.id}
            className="inline-flex cursor-pointer items-center gap-3"
          >
            <input
              type="checkbox"
              checked={icon.show}
              onChange={(e) => handleChange(icon.id, e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm">{icon.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SoundPanel() {
  const { soundEnabled, setSoundEnabled } = useSettings();

  return (
    <div className="flow">
      <h2 className="text-sm font-semibold">Sound Effects</h2>
      <label className="inline-flex cursor-pointer items-center gap-3">
        <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
        <span className="text-sm">Enable sound effects</span>
      </label>
    </div>
  );
}
