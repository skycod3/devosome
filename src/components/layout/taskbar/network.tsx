"use client";

import { useEffect, useState } from "react";
import { Signal, Unplug } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";

export function Network() {
  const [online, setOnline] = useState(navigator.onLine);
  const { theme } = useTheme();

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* When online, the icon is redundant on mobile — the phone OS already
            shows connectivity in its status bar — so hide it below `md`
            (768px, the app's tablet/mobile breakpoint). When offline, always
            show it: the "no connection" warning is the state that actually
            earns its place. */}
        <div
          className={`p-1.5 items-center ${online ? "hidden md:flex" : "flex"}`}
        >
          {online ? (
            <Signal className="size-4" />
          ) : (
            <Unplug
              className={`size-4 ${theme === "dark" ? "text-red-400" : "text-red-800"}`}
            />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>{online ? "Connected" : "No connection"}</TooltipContent>
    </Tooltip>
  );
}
