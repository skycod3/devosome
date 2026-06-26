"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { LayoutGrid, List } from "lucide-react";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";
import { useSettings } from "@/hooks/useSettings";
import { Icon } from "@/components/icon";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Icon as IconType } from "@/stores/icons-store";
import { StaticImageData } from "next/image";
import { formatDistanceToNow } from "date-fns";

interface FileEntry {
  id: string;
  appId?: string; // if set, used on double-click instead of id
  title: string;
  icon: StaticImageData | string;
  openedAt?: number; // Unix timestamp, shown as relative time in list view
}

interface FileBrowserProps {
  /** iconId of this tab (e.g. "documents", "pictures") */
  iconId: string;
  /** Static file entries from the relevant constants file */
  files: Record<string, FileEntry>;
  /** Optional content rendered on the left side of the toolbar */
  toolbarSlot?: React.ReactNode;
  /** Message shown when the file list is empty */
  emptyMessage?: string;
}

export function FileBrowser({
  iconId,
  files,
  toolbarSlot,
  emptyMessage = "No files here.",
}: FileBrowserProps) {
  const { icons, addIcon, removeIcon, unhighlightAllIcons } = useIcons();
  const { viewModes, setViewMode } = useSettings();

  const viewMode = viewModes[iconId] ?? "grid";

  function toIconPayload(file: FileEntry) {
    return {
      id: file.id,
      appId: file.appId,
      title: file.title,
      isHighlighted: false,
      show: true,
      icon: file.icon as StaticImageData,
      size: { width: 48, height: 48 },
      parentId: iconId,
      openedAt: file.openedAt,
    };
  }

  useEffect(() => {
    Object.values(files).forEach((file) => addIcon(toIconPayload(file)));
    return () => Object.values(files).forEach((file) => removeIcon(file.id));
    // Register icons only when `files` changes; addIcon/removeIcon are stable
    // store actions and toIconPayload is bound to the fixed iconId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function handleAreaClick() {
    if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
  }

  const iconsFromStore = useMemo(
    () => icons.filter((icon) => icon.parentId === iconId),
    [icons, iconId],
  );

  return (
    <div onClick={handleAreaClick} className="flex flex-col h-full w-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <div>{toolbarSlot}</div>
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

      {/* Empty state */}
      {iconsFromStore.length === 0 && (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      {/* File area — grid */}
      {iconsFromStore.length > 0 && viewMode === "grid" && (
        <RevealGroup
          replayOnView
          className="grid-cols-fill-6 @min-5xl:grid-cols-fill-7 grid-rows-fill-6 grid h-full gap-4 p-4 overflow-auto"
        >
          {iconsFromStore.map((icon) => (
            <RevealItem key={icon.id}>
              <Icon imagePlaceholder="blur" {...icon} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      {/* File area — list */}
      {iconsFromStore.length > 0 && viewMode === "list" && (
        <RevealGroup
          as="ul"
          replayOnView
          className="flex flex-col gap-1 overflow-auto p-2"
        >
          {iconsFromStore.map((icon) => (
            <ListRow key={icon.id} icon={icon} />
          ))}
        </RevealGroup>
      )}
    </div>
  );
}

function ListRow({ icon }: { icon: IconType }) {
  const { highlightIcon, unhighlightAllIcons } = useIcons();
  const { openWindowCentered } = useWindows();

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
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
    <RevealItem
      as="li"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`flex items-center gap-2 rounded px-2 py-1 select-none ${icon.isHighlighted ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
    >
      <Image
        src={icon.icon}
        alt={icon.title}
        width={16}
        height={16}
        className="object-contain shrink-0"
      />
      <span className="text-sm truncate flex-1">{icon.title}</span>
      {icon.openedAt && (
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDistanceToNow(icon.openedAt, { addSuffix: true })}
        </span>
      )}
    </RevealItem>
  );
}
