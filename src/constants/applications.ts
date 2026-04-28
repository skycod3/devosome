import { Pictures } from "@/components/layout/pictures";
import { Documents } from "@/components/layout/documents";
import { Music } from "@/components/layout/music";
import { Videos } from "@/components/layout/videos";
import { PdfViewer } from "@/components/pdf-viewer";
import { Skills } from "@/components/skills";
import { AboutMe } from "@/components/about-me";
import { Contact } from "@/components/contact";
import { Portfolio } from "@/components/portfolio";

type AppComponent = React.ComponentType<{ iconId: string }>;

interface Application {
  id: string;
  component: AppComponent;
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
    tabTitle: "Documents",
    component: Documents,
    showTabs: true,
    availableTabs: ["files", "pictures", "music", "videos"],
  },

  // Tab views
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

  // Standalone windows
  "document-resume": {
    id: "document-resume",
    windowTitle: "Jean's Resume.pdf",
    component: PdfViewer,
    showTabs: false,
  },
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
