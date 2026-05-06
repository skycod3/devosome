import type { ComponentType } from "react";
import { Pictures } from "@/components/layout/pictures";
import { Documents } from "@/components/layout/documents";
import { Music } from "@/components/layout/music";
import { Videos } from "@/components/layout/videos";
import { Skills } from "@/components/skills";
import { AboutMe } from "@/components/about-me";
import { Contact } from "@/components/contact";
import { Portfolio } from "@/components/portfolio";

type AppComponent = ComponentType<{ iconId: string }>;

interface Application {
  id: string;
  /** Omit for metadata-only entries (e.g. "document-resume" rendered via DOCUMENTS_FILES). */
  component?: AppComponent;
  windowTitle?: string;
  tabTitle?: string; // Tab label shown in breadcrumb (when different from windowTitle)
  defaultSize?: { width: number; height: number };
  showTabs?: boolean;
  availableTabs?: string[]; // List of app IDs available as tabs in this window
}

export const APPLICATIONS: Record<string, Application> = {
  // Tabbed "Files" window (Documents, Pictures, Music, Videos)
  files: {
    id: "files",
    windowTitle: "Files",
    showTabs: true,
    availableTabs: ["documents", "pictures", "music", "videos"],
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
};
