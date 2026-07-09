"use client";

import { useShallow } from "zustand/react/shallow";
import { useIconsStore } from "@/stores/icons-store";

/** A single icon's slice; re-renders only when that icon's object changes. */
export const useIcon = (id: string) =>
  useIconsStore((s) => s.icons.find((i) => i.id === id));

/** Shallow id list of shown desktop icons (no parentId). */
export const useDesktopIconIds = () =>
  useIconsStore(
    useShallow((s) =>
      s.icons.filter((i) => !i.parentId && i.show).map((i) => i.id),
    ),
  );

/** Shallow id list of the icons belonging to a folder. */
export const useIconIdsByParent = (parentId: string) =>
  useIconsStore(
    useShallow((s) =>
      s.icons.filter((i) => i.parentId === parentId).map((i) => i.id),
    ),
  );

/** The currently highlighted icon (single object; Object.is is enough). */
export const useHighlightedIcon = () =>
  useIconsStore((s) => s.icons.find((i) => i.isHighlighted));

/**
 * The full icon list. Re-renders on any icon change — only use in low-frequency
 * panels (settings, image viewer) that are mounted transiently.
 */
export const useIconList = () => useIconsStore((s) => s.icons);
