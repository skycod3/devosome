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
        <div className="p-1.5 flex items-center">
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
