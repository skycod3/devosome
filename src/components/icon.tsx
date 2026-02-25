import { Icon as IconFromStore } from "@/stores/icons-store";

import Image from "next/image";

import { CSSProperties } from "react";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";

interface IconProps extends IconFromStore {}

export function Icon({ id, title, icon, size, isHighlighted }: IconProps) {
  const { highlightIcon, unhighlightAllIcons } = useIcons();
  const { openWindow } = useWindows();

  function handleClick() {
    // Only unhighlight all if this icon isn't already highlighted
    if (!isHighlighted) {
      unhighlightAllIcons();
      highlightIcon(id);
    }
  }

  function handleDoubleClick() {
    // Open or focus window for this icon
    // openWindow handles: existing window check, focus, and creation
    openWindow(id, title, icon);
  }

  return (
    <button
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={title}
      style={
        {
          "--icon-color": "white",
        } as CSSProperties
      }
      className={`grid min-h-28 w-full content-center justify-items-center gap-2 rounded p-1 text-center text-(--icon-color) hover:bg-(--icon-color)/10 ${isHighlighted ? "bg-(--icon-color)/20" : ""}`}
    >
      <Image src={icon} alt={title} width={size.width} height={size.height} />

      <p className="line-clamp-2 leading-normal">{title}</p>
    </button>
  );
}
