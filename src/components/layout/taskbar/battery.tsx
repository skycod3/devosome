"use client";

import { useEffect, useState } from "react";
import {
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";

type BatteryManager = {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
};

type BatteryState = {
  level: number;
  charging: boolean;
  dischargingTime: number;
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `~${h}h${m > 0 ? `${m}m` : ""} remaining`;
  return `~${m}m remaining`;
}

export function Battery() {
  const [battery, setBattery] = useState<BatteryState | null>(null);
  const [supported, setSupported] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (!("getBattery" in navigator)) {
      setSupported(false);
      return;
    }

    let mounted = true;
    let batteryRef: BatteryManager | null = null;
    let handler: (() => void) | null = null;

    const update = (b: BatteryManager) => {
      setBattery({
        level: b.level,
        charging: b.charging,
        dischargingTime: b.dischargingTime,
      });
    };

    (navigator as Navigator & { getBattery: () => Promise<BatteryManager> })
      .getBattery()
      .then((b) => {
        if (!mounted) return;
        batteryRef = b;
        update(b);
        handler = () => update(b);
        b.addEventListener("chargingchange", handler);
        b.addEventListener("levelchange", handler);
        b.addEventListener("chargingtimechange", handler);
        b.addEventListener("dischargingtimechange", handler);
      })
      .catch(() => setSupported(false));

    return () => {
      mounted = false;
      if (batteryRef && handler) {
        batteryRef.removeEventListener("chargingchange", handler);
        batteryRef.removeEventListener("levelchange", handler);
        batteryRef.removeEventListener("chargingtimechange", handler);
        batteryRef.removeEventListener("dischargingtimechange", handler);
      }
    };
  }, []);

  // No battery info to show: unsupported, not yet loaded, or desktop PC
  // (level=1, charging=true, dischargingTime=Infinity → AC-only device)
  if (!supported || battery === null) return null;
  if (
    battery.level === 1 &&
    battery.charging &&
    !isFinite(battery.dischargingTime)
  )
    return null;

  const pct = Math.round(battery.level * 100);

  const Icon = battery.charging
    ? BatteryCharging
    : battery.level > 0.5
      ? BatteryFull
      : battery.level > 0.2
        ? BatteryMedium
        : BatteryLow;

  const color = battery.charging
    ? theme === "dark"
      ? "text-green-400"
      : "text-green-800"
    : battery.level > 0.5
      ? ""
      : battery.level > 0.2
        ? theme === "dark"
          ? "text-yellow-400"
          : "text-yellow-800"
        : theme === "dark"
          ? "text-red-400"
          : "text-red-800";

  const timeStr = !battery.charging ? formatTime(battery.dischargingTime) : "";

  const tooltipText = battery.charging
    ? `${pct}% · Charging`
    : timeStr
      ? `${pct}% · ${timeStr}`
      : `${pct}%`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="p-1.5 flex items-center">
          <Icon className={`size-4 ${color}`} />
        </div>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
}
