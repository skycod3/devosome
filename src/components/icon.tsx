import { Icon as IconFromStore } from "@/stores/icons-store";

import Image from "next/image";

import { CSSProperties } from "react";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";
import { useTheme } from "@/hooks/useTheme";

import { supportsRelativeColors } from "@/utils/css-supports";

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
          className={`z-1 w-full grid justify-items-center grid-rows-[min(4.25rem,17vw)_auto] gap-1.5 rounded text-center text-(--icon-color) ${supportsRelativeColors ? `${!isHighlighted ? `hover:bg-(--icon-color)/10` : "bg-(--icon-color)/20"}` : ""}`}
        >
          <div className="grid relative self-end">
            <Image
              src={icon}
              alt={title}
              loading="eager"
              className="object-contain self-end max-w-12"
              placeholder={imagePlaceholder}
            />
          </div>

          <p className="line-clamp-2 leading-4 sm:leading-normal text-sm">
            {title}
          </p>
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
