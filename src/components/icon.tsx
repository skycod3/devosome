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
  // blur placeholder requires a blurDataURL, which is only available on
  // StaticImageData (static imports). String srcs (e.g. recent items serialised
  // to localStorage) don't carry that metadata, so fall back to "empty".
  const resolvedPlaceholder =
    imagePlaceholder === "blur" && typeof icon === "string"
      ? "empty"
      : imagePlaceholder;
  const { highlightIcon, unhighlightAllIcons } = useIcons();
  const { openWindowCentered } = useWindows();
  const { theme } = useTheme();

  const isDesktopIcon = !parentId;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isHighlighted) {
      unhighlightAllIcons();
      highlightIcon(id);
    }
  }

  function handleDoubleClick() {
    openWindowCentered(appId ?? id, parentId ?? "", title, icon);
  }

  // a11y: open the window on Enter or Space — the icon is a <button>, so both
  // keys must activate it identically (ARIA button semantics). preventDefault
  // stops Space from scrolling and the synthetic click that only highlights.
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleDoubleClick();
    }
  }

  const customIconColors = !isDesktopIcon
    ? // window icons
      !isHighlighted
      ? `hover:bg-accent`
      : `bg-accent`
    : // desktop icons (color-mix)
      !isHighlighted
      ? "hover:bg-(--icon-color)/10"
      : "bg-(--icon-color)/20";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
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
          className={`z-1 size-full sm:grid gap-1.5 p-1 rounded text-center text-(--icon-color) ${supportsRelativeColors ? customIconColors : ""}`}
        >
          <div className="flex-center min-h-0 max-h-14">
            <Image
              src={icon}
              alt={title}
              width={size.width}
              height={size.height}
              loading="eager"
              className="object-contain self-end max-h-full max-w-full"
              placeholder={resolvedPlaceholder}
            />
          </div>

          <p
            className={`leading-4 sm:leading-normal text-sm line-clamp-2 text-center wrap-break-word mt-2 sm:mt-0 ${isDesktopIcon ? "text-shadow-lg" : ""}`}
          >
            {title.length > 17 ? `${title.slice(0, 17)}...` : title}
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
