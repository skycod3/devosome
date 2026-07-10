"use client";

import { useEffect } from "react";
import { DESKTOP_ICONS } from "@/constants/icons";
import { useIconActions } from "@/hooks/useIconActions";
import { useDesktopIconIds } from "@/hooks/useIconSelectors";
import { useSettings } from "@/hooks/useSettings";
import { Icon } from "../icon";

export function IconGrid() {
  const iconIds = useDesktopIconIds();
  const { setIcons } = useIconActions();
  const { iconVisibility } = useSettings();

  // Seed desktop icons from config + persisted visibility — run once on mount.
  useEffect(() => {
    setIcons(
      DESKTOP_ICONS.map((icon) => ({
        ...icon,
        show: iconVisibility[icon.id] ?? icon.show,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-white grid-cols-fill-5 grid-rows-fill-5 sm:grid-cols-fill-6 sm:grid-rows-fill-6 grid h-full grid-flow-col place-items-center gap-4 p-4">
      {iconIds.map((id) => (
        <Icon key={id} id={id} />
      ))}
    </div>
  );
}
