"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useRecent } from "@/hooks/useRecent";
import { FileBrowser } from "./file-browser";

interface RecentProps {
  iconId: string;
}

export function Recent({ iconId }: RecentProps) {
  const { items, clearRecent } = useRecent();

  const files = useMemo(
    () =>
      Object.fromEntries(
        items.map((item) => [
          `recent-${item.id}`,
          {
            id: `recent-${item.id}`,
            appId: item.id,
            title: item.title,
            icon: item.icon,
            openedAt: item.openedAt,
          },
        ]),
      ),
    [items],
  );

  const clearButton = (
    <button
      onClick={clearRecent}
      title="Clear recent history"
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
    >
      <Trash2 className="size-3.5" />
      <span>Clear</span>
    </button>
  );

  return (
    <FileBrowser
      iconId={iconId}
      files={files}
      toolbarSlot={clearButton}
      emptyMessage="No recent files."
    />
  );
}
