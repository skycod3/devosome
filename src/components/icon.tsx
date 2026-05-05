import { Icon as IconFromStore } from "@/stores/icons-store";

import Image from "next/image";

import { CSSProperties } from "react";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";
import { useTheme } from "@/hooks/useTheme";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type IconProps = IconFromStore & {
  imagePlaceholder?: "blur" | "empty";
};

const supportsRelativeColors = CSS.supports(
  "color",
  "color-mix(in oklab, red, blue)",
);

export function Icon({
  id,
  appId,
  title,
  icon,
  size,
  isHighlighted,
  parentId,
  imagePlaceholder,
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
    openWindowCentered(appId ?? id, parentId ?? "", title, icon);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          title={title}
          style={
            {
              wordBreak: "break-word",
              // if the icon has a parent, it should be black in light mode and white in dark mode, otherwise it should always be white
              "--icon-color": parentId
                ? theme === "dark"
                  ? "white"
                  : "black"
                : "white",
            } as CSSProperties
          }
          className={`z-1 grid min-h-28 w-full content-center justify-items-center gap-2 rounded text-center text-(--icon-color) ${supportsRelativeColors ? `${!isHighlighted ? `hover:bg-(--icon-color)/10` : "bg-(--icon-color)/20"}` : ""}`}
        >
          <div className="grid min-h-16 relative">
            <Image
              src={icon}
              alt={title}
              width={size.width}
              height={size.height}
              loading="eager"
              className="object-contain self-end"
              placeholder={imagePlaceholder}
            />
          </div>

          <p className="line-clamp-2 leading-normal text-sm">{title}</p>
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onSelect={handleDoubleClick}>Open</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>Rename</ContextMenuItem>
        <ContextMenuItem disabled variant="destructive">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
