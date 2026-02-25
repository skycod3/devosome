import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { StaticImageData } from "next/image";

export interface Icon {
  id: string;
  title: string;
  icon: StaticImageData | string;
  isHighlighted: boolean;
  show: boolean;
  size: { width: number; height: number };
}

interface IconsState {
  icons: Icon[];
  setIcons: (icons: Icon[]) => void;
  addIcon: (icon: Icon) => void;
  removeIcon: (id: string) => void;
  updateIcon: (id: string, property: keyof Icon, value: boolean) => void;
  updateAllIcons: (property: keyof Icon, value: boolean) => void;
  showIcon: (id: string) => void;
  hideIcon: (id: string) => void;
  showAllIcons: () => void;
  hideAllIcons: () => void;
  highlightIcon: (id: string) => void;
  unhighlightIcon: (id: string) => void;
  highlightAllIcons: () => void;
  unhighlightAllIcons: () => void;
}

export const useIconsStore = create<IconsState>()(
  devtools(
    persist(
      (set, get) => ({
        icons: [],

        // Initialize icons
        setIcons(icons: Icon[]) {
          set({ icons });
        },

        // Add icon with duplicate check
        addIcon(icon: Icon) {
          const { icons } = get();
          const exists = icons.some((i) => i.id === icon.id);

          if (exists) {
            console.warn(`Icon with id "${icon.id}" already exists`);
            return;
          }

          set({ icons: [...icons, icon] });
        },

        // Remove icon
        removeIcon(id: string) {
          set((state) => ({
            icons: state.icons.filter((icon) => icon.id !== id),
          }));
        },

        // Generic update function to reduce code duplication
        updateIcon(id: string, property: keyof Icon, value: boolean) {
          set((state) => ({
            icons: state.icons.map((icon) =>
              icon.id === id ? { ...icon, [property]: value } : icon,
            ),
          }));
        },

        // Generic bulk update function
        updateAllIcons(property: keyof Icon, value: boolean) {
          set((state) => ({
            icons: state.icons.map((icon) => ({ ...icon, [property]: value })),
          }));
        },

        // Convenience methods (delegate to generic functions)
        showIcon(id: string) {
          get().updateIcon(id, "show", true);
        },

        hideIcon(id: string) {
          get().updateIcon(id, "show", false);
        },

        showAllIcons() {
          get().updateAllIcons("show", true);
        },

        hideAllIcons() {
          get().updateAllIcons("show", false);
        },

        highlightIcon(id: string) {
          get().updateIcon(id, "isHighlighted", true);
        },

        unhighlightIcon(id: string) {
          get().updateIcon(id, "isHighlighted", false);
        },

        highlightAllIcons() {
          get().updateAllIcons("isHighlighted", true);
        },

        unhighlightAllIcons() {
          get().updateAllIcons("isHighlighted", false);
        },
      }),
      { name: "icons-store" },
    ),
  ),
);
