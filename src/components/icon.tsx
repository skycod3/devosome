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
          className={`z-1 w-full flex-center flex-col gap-1.5 rounded text-center text-(--icon-color) ${supportsRelativeColors ? `${!isHighlighted ? `hover:bg-(--icon-color)/10` : "bg-(--icon-color)/20"}` : ""}`}
        >
          <div>
            <Image
              src={icon}
              alt={title}
              width={size.width}
              height={size.height}
              loading="eager"
              className="flex-2 object-contain max-h-full max-w-16 mx-auto"
              placeholder={imagePlaceholder}
            />
          </div>

          <p className="leading-4 sm:leading-normal text-sm line-clamp-2">
            {title.length > 18 ? `${title.slice(0, 18)}...` : title}
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
