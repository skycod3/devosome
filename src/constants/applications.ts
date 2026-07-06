import type { ComponentType } from "react";
import { Pictures } from "@/components/layout/pictures";
import { Documents } from "@/components/layout/documents";
import { Music } from "@/components/layout/music";
import { Videos } from "@/components/layout/videos";
import { Recent } from "@/components/layout/recent";
import { Skills } from "@/components/skills";
import { AboutMe } from "@/components/about-me";
import { Contact } from "@/components/contact";
import { Portfolio } from "@/components/portfolio";
import { Terminal } from "@/components/terminal";
import { ClipboardHistory } from "@/components/clipboard-history";
import { SystemMonitor } from "@/components/system-monitor";
import { SystemSettings } from "@/components/system-settings";
import { Notes } from "@/components/notes";

type AppComponent = ComponentType<{ iconId: string }>;

interface Application {
  id: string;
  /** Omit for metadata-only entries (e.g. "document-resume" rendered via DOCUMENTS_FILES). */
  component?: AppComponent;
  windowTitle?: string;
  tabTitle?: string; // Tab label shown in breadcrumb (when different from windowTitle)
  defaultSize?: { width: number; height: number };
  /** Smallest this app may be resized to. Falls back to the global window min. */
  minSize?: { width: number; height: number };
  showTabs?: boolean;
  availableTabs?: string[]; // List of app IDs available as tabs in this window
}

export const APPLICATIONS: Record<string, Application> = {
  // Tabbed "Files" window (Documents, Pictures, Music, Videos)
  files: {
    id: "files",
    windowTitle: "Files",
    showTabs: true,
    availableTabs: ["recent", "documents", "pictures", "music", "videos"],
    // Sidebar + toolbar + content grid need room to stay usable.
    minSize: { width: 640, height: 440 },
  },

  // Tab views
  documents: {
    id: "documents",
    windowTitle: "Files",
    tabTitle: "Documents",
    component: Documents,
    showTabs: false,
  },
  pictures: {
    id: "pictures",
    windowTitle: "Pictures",
    component: Pictures,
    showTabs: false,
  },
  music: {
    id: "music",
    windowTitle: "Music",
    component: Music,
    showTabs: false,
  },
  videos: {
    id: "videos",
    windowTitle: "Videos",
    component: Videos,
    showTabs: false,
  },
  recent: {
    id: "recent",
    windowTitle: "Files",
    tabTitle: "Recent",
    component: Recent,
    showTabs: false,
  },

  // Metadata-only entry: title lookup for the window chrome.
  // Rendering is handled by window-content.tsx: NativePdfViewer on mobile,
  // LazyPdfViewer (pdfjs) on desktop.
  "document-resume": {
    id: "document-resume",
    windowTitle: "Jean's Resume.pdf",
    showTabs: false,
  },

  // Standalone windows
  skills: {
    id: "skills",
    windowTitle: "Skills",
    component: Skills,
    showTabs: false,
  },
  "about-me": {
    id: "about-me",
    windowTitle: "About Me",
    component: AboutMe,
    showTabs: false,
  },
  contact: {
    id: "contact",
    windowTitle: "Get in Touch",
    component: Contact,
    showTabs: false,
  },
  portfolio: {
    id: "portfolio",
    windowTitle: "Portfolio",
    component: Portfolio,
    showTabs: false,
  },
  terminal: {
    id: "terminal",
    windowTitle: "Terminal",
    component: Terminal,
    showTabs: false,
    defaultSize: { width: 620, height: 420 },
  },
  "clipboard-history": {
    id: "clipboard-history",
    windowTitle: "Clipboard History",
    component: ClipboardHistory,
    showTabs: false,
    defaultSize: { width: 420, height: 480 },
    // Compact list — stays usable below the global (larger) window minimum.
    minSize: { width: 320, height: 240 },
  },
  "system-monitor": {
    id: "system-monitor",
    windowTitle: "System Monitor",
    component: SystemMonitor,
    showTabs: false,
    defaultSize: { width: 420, height: 500 },
    // Compact stats panel — stays usable below the global window minimum.
    minSize: { width: 320, height: 240 },
  },
  "system-settings": {
    id: "system-settings",
    windowTitle: "System Settings",
    component: SystemSettings,
    showTabs: false,
    defaultSize: { width: 560, height: 420 },
  },
  notes: {
    id: "notes",
    windowTitle: "Tips",
    component: Notes,
    showTabs: false,
    defaultSize: { width: 320, height: 420 },
    // Compact sticky note — stays small below the global window minimum.
    minSize: { width: 320, height: 240 },
  },
};
