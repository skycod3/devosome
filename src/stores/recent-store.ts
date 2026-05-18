import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const MAX_RECENT_ITEMS = 20;

export interface RecentItem {
  /** Same id as the icon (e.g. "image-1", "document-resume") */
  id: string;
  /** Display name shown in the browser */
  title: string;
  /** Resolved icon image path (string) for localStorage compatibility */
  icon: string;
  /** Originating tab: "pictures" | "documents" | "music" | "videos" */
  sourceTab: string;
  /** Unix timestamp (ms) of last open */
  openedAt: number;
}

interface RecentState {
  items: RecentItem[];
  addRecentItem: (item: Omit<RecentItem, "openedAt">) => void;
  clearRecent: () => void;
}

export const useRecentStore = create<RecentState>()(
  devtools(
    persist(
      (set) => ({
        items: [],

        addRecentItem(item) {
          set((state) => {
            // Remove existing entry with same id (move-to-top semantics)
            const filtered = state.items.filter((i) => i.id !== item.id);
            const next: RecentItem = { ...item, openedAt: Date.now() };
            return { items: [next, ...filtered].slice(0, MAX_RECENT_ITEMS) };
          });
        },

        clearRecent() {
          set({ items: [] });
        },
      }),
      { name: "recent-store" },
    ),
    { name: "recent-store" },
  ),
);
