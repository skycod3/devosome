"use client";

import { useRecentStore } from "@/stores/recent-store";

/**
 * Hook for accessing and manipulating the recent files history.
 * Returns all necessary states and actions.
 */
export const useRecent = () => {
  const items = useRecentStore((state) => state.items);
  const addRecentItem = useRecentStore((state) => state.addRecentItem);
  const clearRecent = useRecentStore((state) => state.clearRecent);

  return {
    // state
    items,
    // actions
    addRecentItem,
    clearRecent,
  };
};

/**
 * Recent actions only — stable refs, NO subscription to the `items` list. Use
 * this where a component only needs to record/clear recents (e.g. useOpenWindow)
 * so it doesn't re-render every time the recent list changes.
 */
export const useRecentActions = () => ({
  addRecentItem: useRecentStore((s) => s.addRecentItem),
  clearRecent: useRecentStore((s) => s.clearRecent),
});
