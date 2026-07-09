"use client";

import { useIconsStore } from "@/stores/icons-store";

/**
 * Actions only from the icons-store. Zustand actions have stable references, so
 * selecting them individually creates NO subscription to the `icons` array: a
 * component that only dispatches never re-renders on icon changes.
 */
export const useIconActions = () => ({
  setIcons: useIconsStore((s) => s.setIcons),
  addIcon: useIconsStore((s) => s.addIcon),
  removeIcon: useIconsStore((s) => s.removeIcon),
  showIcon: useIconsStore((s) => s.showIcon),
  hideIcon: useIconsStore((s) => s.hideIcon),
  showAllIcons: useIconsStore((s) => s.showAllIcons),
  hideAllIcons: useIconsStore((s) => s.hideAllIcons),
  highlightIcon: useIconsStore((s) => s.highlightIcon),
  unhighlightIcon: useIconsStore((s) => s.unhighlightIcon),
  highlightAllIcons: useIconsStore((s) => s.highlightAllIcons),
  unhighlightAllIcons: useIconsStore((s) => s.unhighlightAllIcons),
});
