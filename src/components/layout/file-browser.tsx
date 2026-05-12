"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { LayoutGrid, List } from "lucide-react";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";
import { useSettings } from "@/hooks/useSettings";
import { Icon } from "@/components/icon";
import { Icon as IconType } from "@/stores/icons-store";
import { StaticImageData } from "next/image";

interface FileEntry {
  id: string;
  title: string;
  icon: StaticImageData | string;
}

interface FileBrowserProps {
  /** iconId of this tab (e.g. "documents", "pictures") */
  iconId: string;
  /** Static file entries from the relevant constants file */
  files: Record<string, FileEntry>;
}

export function FileBrowser({ iconId, files }: FileBrowserProps) {
  const { icons, addIcon, removeIcon, unhighlightAllIcons } = useIcons();
  const { viewModes, setViewMode } = useSettings();

  const viewMode = viewModes[iconId] ?? "grid";

  function handleAreaClick(event: React.MouseEvent) {
    if (event.target !== event.currentTarget) return;
    if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
  }

  useEffect(() => {
    Object.values(files).forEach((file) => {
      addIcon({
        id: file.id,
        title: file.title,
        isHighlighted: false,
        show: true,
        icon: file.icon as StaticImageData,
        size: { width: 48, height: 48 },
        parentId: iconId,
      });
    });

    return () => {
      Object.values(files).forEach((file) => {
        removeIcon(file.id);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconsFromStore = useMemo(
    () => icons.filter((icon) => icon.parentId === iconId),
    [icons, iconId],
  );

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Toolbar: view toggle */}
      <div className="flex items-center justify-end px-4 py-2 border-b shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode(iconId, "grid")}
            title="Grid view"
            className={`rounded p-1 transition-colors ${viewMode === "grid" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setViewMode(iconId, "list")}
            title="List view"
            className={`rounded p-1 transition-colors ${viewMode === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* File area */}
      {viewMode === "grid" ? (
        <div
          onClick={handleAreaClick}
          className="grid-cols-fill-6 @min-5xl:grid-cols-fill-7 grid-rows-fill-6 grid h-full gap-4 p-4 overflow-auto"
        >
          {iconsFromStore.map((icon) => (
            <Icon imagePlaceholder="blur" key={icon.id} {...icon} />
          ))}
        </div>
      ) : (
        <ul
          onClick={handleAreaClick}
          className="flex flex-col gap-1 overflow-auto p-2"
        >
          {iconsFromStore.map((icon) => (
            <ListRow key={icon.id} icon={icon} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ListRow({ icon }: { icon: IconType }) {
  const { highlightIcon, unhighlightAllIcons } = useIcons();
  const { openWindowCentered } = useWindows();

  function handleClick() {
    if (!icon.isHighlighted) {
      unhighlightAllIcons();
      highlightIcon(icon.id);
    }
  }

  function handleDoubleClick() {
    openWindowCentered(
      icon.appId ?? icon.id,
      icon.parentId ?? "",
      icon.title,
      icon.icon,
    );
  }

  return (
    <li
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`flex items-center gap-2 rounded px-2 py-1 cursor-pointer select-none ${icon.isHighlighted ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
    >
      <Image
        src={icon.icon}
        alt={icon.title}
        width={16}
        height={16}
        className="object-contain shrink-0"
      />
      <span className="text-sm truncate">{icon.title}</span>
    </li>
  );
}
