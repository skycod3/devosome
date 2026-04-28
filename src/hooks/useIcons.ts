"use client";

import { useIconsStore } from "@/stores/icons-store";

/**
 * Hook for accessing and manipulating desktop icons.
 * Returns all necessary states and actions.
 */
export const useIcons = () => {
  const icons = useIconsStore((state) => state.icons);
  const setIcons = useIconsStore((state) => state.setIcons);
  const addIcon = useIconsStore((state) => state.addIcon);
  const removeIcon = useIconsStore((state) => state.removeIcon);
  const showIcon = useIconsStore((state) => state.showIcon);
  const hideIcon = useIconsStore((state) => state.hideIcon);
  const showAllIcons = useIconsStore((state) => state.showAllIcons);
  const hideAllIcons = useIconsStore((state) => state.hideAllIcons);
  const highlightIcon = useIconsStore((state) => state.highlightIcon);
  const unhighlightIcon = useIconsStore((state) => state.unhighlightIcon);
  const highlightAllIcons = useIconsStore((state) => state.highlightAllIcons);
  const unhighlightAllIcons = useIconsStore(
    (state) => state.unhighlightAllIcons,
  );

  return {
    // state
    icons,
    // actions
    setIcons,
    addIcon,
    removeIcon,
    showIcon,
    hideIcon,
    showAllIcons,
    hideAllIcons,
    highlightIcon,
    unhighlightIcon,
    highlightAllIcons,
    unhighlightAllIcons,
  };
};
