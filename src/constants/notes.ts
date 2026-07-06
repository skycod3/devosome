export type NoteTip = {
  /** Prose line. Real keystrokes go in `keys`, not inline in the text. */
  text: string;
  /** Keystroke tokens rendered as <kbd>. "mod" → ⌘ on macOS, Ctrl elsewhere. */
  keys?: string[];
};

export type NoteSection = {
  category: string;
  tips: NoteTip[];
};

/** Curated, read-only tips surfaced by the Notes ("Tips") app. */
export const NOTES_SECTIONS: NoteSection[] = [
  {
    category: "Windows",
    tips: [
      { text: "Drag a window to the top edge to maximize it." },
      {
        text: "Drag a window to the left or right edge to snap it to that half of the screen.",
      },
      {
        text: "Use the title-bar buttons to minimize, maximize/restore, or close.",
      },
      {
        text: "Drag the title bar to move a window; drag its edges or corners to resize.",
      },
      { text: "Right-click the title bar for more window actions." },
      {
        text: "Hit the home button in the breadcrumb to jump back to the start.",
      },
    ],
  },
  {
    category: "Navigation",
    tips: [
      { text: "Open Spotlight search to jump to any app:", keys: ["mod", "K"] },
      { text: "Launch apps from the Dock at the bottom of the screen." },
      { text: "Double-click any desktop icon to open it." },
    ],
  },
  {
    category: "System",
    tips: [
      { text: "Change the wallpaper and theme in System Settings." },
      {
        text: "Poke around the Terminal — a few commands are hiding in there.",
      },
    ],
  },
];
