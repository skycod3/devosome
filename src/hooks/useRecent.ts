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
