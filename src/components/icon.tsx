import { Icon as IconFromStore } from "@/stores/icons-store";

import Image from "next/image";

import { CSSProperties } from "react";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";
import { useTheme } from "@/hooks/useTheme";

interface IconProps extends IconFromStore {}

export function Icon({
  id,
  title,
  icon,
  size,
  isHighlighted,
  parentId,
}: IconProps) {
  const { highlightIcon, unhighlightAllIcons } = useIcons();
  const { openWindowCentered } = useWindows();
  const { theme } = useTheme();

  function handleClick() {
    // Only unhighlight all if this icon isn't already highlighted
    if (!isHighlighted) {
      unhighlightAllIcons();
      highlightIcon(id);
    }
  }

  function handleDoubleClick() {
    openWindowCentered(id, parentId ?? "", title, icon);
  }

  return (
    <button
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={title}
      style={
        {
          // if the icon has a parent, it should be black in light mode and white in dark mode, otherwise it should always be white
          "--icon-color": parentId
            ? theme === "dark"
              ? "white"
              : "black"
            : "white",
        } as CSSProperties
      }
      className={`grid min-h-28 w-full content-center justify-items-center gap-2 rounded p-1 text-center text-(--icon-color) hover:bg-(--icon-color)/10 ${isHighlighted ? "bg-(--icon-color)/20" : ""}`}
    >
      <Image src={icon} alt={title} width={size.width} height={size.height} />

      <p className="line-clamp-2 leading-normal">{title}</p>
    </button>
  );
}
