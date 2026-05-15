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
              "--icon-color": parentId
                ? theme === "dark"
                  ? "white"
                  : "black"
                : "white",
            } as CSSProperties
          }
          className={`z-1 size-full sm:grid gap-1.5 p-1 rounded text-center text-(--icon-color) ${supportsRelativeColors ? `${!isHighlighted ? `hover:bg-(--icon-color)/10` : "bg-(--icon-color)/20"}` : ""}`}
        >
          <div className="flex-center min-h-0 max-h-14">
            <Image
              src={icon}
              alt={title}
              width={size.width}
              height={size.height}
              loading="eager"
              className="object-contain self-end max-h-full max-w-full"
              placeholder={imagePlaceholder}
            />
          </div>

          <p className="leading-4 sm:leading-normal text-sm line-clamp-2 text-center wrap-break-word mt-2 sm:mt-0 text-shadow-lg">
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
