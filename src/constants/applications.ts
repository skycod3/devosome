"use client";

import type { ComponentType } from "react";
import nextDynamic from "next/dynamic";

import {
  AboutMeSkeleton,
  ClipboardHistorySkeleton,
  ContactSkeleton,
  FileBrowserSkeleton,
  NotesSkeleton,
  PortfolioSkeleton,
  SkillsSkeleton,
  SystemMonitorSkeleton,
  SystemSettingsSkeleton,
  TerminalSkeleton,
} from "@/components/window/app-skeletons";

type AppComponent = ComponentType<{ iconId: string }>;

// Every app is code-split. DesktopWrapper reaches this registry through
// useOpenWindow and is the one client component shipped eagerly on "/", so
// static imports here would pull all 14 apps — plus gsap, zod and howler — into
// the initial payload regardless of the Desktop's own `ssr: false` split.
//
// Deliberately no `loading` option: next/dynamic only wraps the component in a
// Suspense boundary when given `ssr: false` or a `loading`, and WindowContent
// has to own that boundary. Adding one here would let it swallow the suspension
// that WindowContent is scoping to a single window body.
//
// The explicit generic is load-bearing too: inference collapses to
// ComponentType<{}> when a loader ends in `.then(m => m.X)`.
const loaders: (() => Promise<AppComponent>)[] = [];

const lazyApp = (loader: () => Promise<AppComponent>) => {
  loaders.push(loader);
  return nextDynamic<{ iconId: string }>(loader);
};

/**
 * Warms every app chunk so a later window open resolves without suspending.
 * Callers run this off the critical path — the split exists to keep these out
 * of the initial payload, not to defer them until the click.
 */
export function prefetchApps(): void {
  for (const load of loaders) {
    // A failed warm-up is not actionable; opening the window retries.
    void load().catch(() => {});
  }
}

const Pictures = lazyApp(() =>
  import("@/components/layout/pictures").then((m) => m.Pictures),
);
const Documents = lazyApp(() =>
  import("@/components/layout/documents").then((m) => m.Documents),
);
const Music = lazyApp(() =>
  import("@/components/layout/music").then((m) => m.Music),
);
const Videos = lazyApp(() =>
  import("@/components/layout/videos").then((m) => m.Videos),
);
const Recent = lazyApp(() =>
  import("@/components/layout/recent").then((m) => m.Recent),
);
const Skills = lazyApp(() =>
  import("@/components/skills").then((m) => m.Skills),
);
const AboutMe = lazyApp(() =>
  import("@/components/about-me").then((m) => m.AboutMe),
);
const Contact = lazyApp(() =>
  import("@/components/contact").then((m) => m.Contact),
);
const Portfolio = lazyApp(() =>
  import("@/components/portfolio").then((m) => m.Portfolio),
);
const Terminal = lazyApp(() =>
  import("@/components/terminal").then((m) => m.Terminal),
);
const ClipboardHistory = lazyApp(() =>
  import("@/components/clipboard-history").then((m) => m.ClipboardHistory),
);
const SystemMonitor = lazyApp(() =>
  import("@/components/system-monitor").then((m) => m.SystemMonitor),
);
const SystemSettings = lazyApp(() =>
  import("@/components/system-settings").then((m) => m.SystemSettings),
);
const Notes = lazyApp(() => import("@/components/notes").then((m) => m.Notes));

interface Application {
  id: string;
  /** Omit for metadata-only entries (e.g. "document-resume" rendered via DOCUMENTS_FILES). */
  component?: AppComponent;
  /**
   * Placeholder shown while `component`'s chunk loads. Must come from the eager
   * bundle (see components/window/app-skeletons.tsx). Defaults to a spinner.
   */
  loading?: ComponentType;
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
    defaultSize: { width: 1000, height: 600 },
    // Sidebar + toolbar + content grid need room to stay usable.
    minSize: { width: 640, height: 440 },
  },

  // Tab views
  documents: {
    id: "documents",
    windowTitle: "Files",
    tabTitle: "Documents",
    component: Documents,
    loading: FileBrowserSkeleton,
    showTabs: false,
  },
  pictures: {
    id: "pictures",
    windowTitle: "Pictures",
    component: Pictures,
    loading: FileBrowserSkeleton,
    showTabs: false,
  },
  music: {
    id: "music",
    windowTitle: "Music",
    component: Music,
    loading: FileBrowserSkeleton,
    showTabs: false,
  },
  videos: {
    id: "videos",
    windowTitle: "Videos",
    component: Videos,
    loading: FileBrowserSkeleton,
    showTabs: false,
  },
  recent: {
    id: "recent",
    windowTitle: "Files",
    tabTitle: "Recent",
    component: Recent,
    loading: FileBrowserSkeleton,
    showTabs: false,
  },

  // Metadata-only entry: title lookup for the window chrome.
  // Rendering is handled by window-content.tsx: NativePdfViewer on mobile,
  // LazyPdfViewer (pdfjs) on desktop.
  "document-resume": {
    id: "document-resume",
    windowTitle: "Jean's Resume.pdf",
    showTabs: false,
    defaultSize: { width: 1000, height: 600 },
  },

  // Standalone windows
  skills: {
    id: "skills",
    windowTitle: "Skills",
    component: Skills,
    loading: SkillsSkeleton,
    showTabs: false,
    defaultSize: { width: 1000, height: 600 },
  },
  "about-me": {
    id: "about-me",
    windowTitle: "About Me",
    component: AboutMe,
    loading: AboutMeSkeleton,
    showTabs: false,
    defaultSize: { width: 1000, height: 600 },
  },
  contact: {
    id: "contact",
    windowTitle: "Get in Touch",
    component: Contact,
    loading: ContactSkeleton,
    showTabs: false,
    defaultSize: { width: 1000, height: 600 },
  },
  portfolio: {
    id: "portfolio",
    windowTitle: "Portfolio",
    component: Portfolio,
    loading: PortfolioSkeleton,
    showTabs: false,
    defaultSize: { width: 1000, height: 600 },
  },
  terminal: {
    id: "terminal",
    windowTitle: "Terminal",
    component: Terminal,
    loading: TerminalSkeleton,
    showTabs: false,
    defaultSize: { width: 720, height: 480 },
  },
  "clipboard-history": {
    id: "clipboard-history",
    windowTitle: "Clipboard History",
    component: ClipboardHistory,
    loading: ClipboardHistorySkeleton,
    showTabs: false,
    defaultSize: { width: 420, height: 480 },
    // Compact list — stays usable below the global (larger) window minimum.
    minSize: { width: 320, height: 240 },
  },
  "system-monitor": {
    id: "system-monitor",
    windowTitle: "System Monitor",
    component: SystemMonitor,
    loading: SystemMonitorSkeleton,
    showTabs: false,
    defaultSize: { width: 420, height: 500 },
    // Compact stats panel — stays usable below the global window minimum.
    minSize: { width: 320, height: 240 },
  },
  "system-settings": {
    id: "system-settings",
    windowTitle: "System Settings",
    component: SystemSettings,
    loading: SystemSettingsSkeleton,
    showTabs: false,
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 400, height: 320 },
  },
  notes: {
    id: "notes",
    windowTitle: "Tips",
    component: Notes,
    loading: NotesSkeleton,
    showTabs: false,
    defaultSize: { width: 380, height: 420 },
    // Compact sticky note — stays small below the global window minimum.
    minSize: { width: 320, height: 240 },
  },
};
