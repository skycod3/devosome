import { Pictures } from "@/components/layout/pictures";
import { Documents } from "@/components/layout/documents";
import { Music } from "@/components/layout/music";
import { Videos } from "@/components/layout/videos";
import { PdfViewer } from "@/components/pdf-viewer";
import { SkillsViewer } from "@/components/skills-viewer";
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
  availableTabs?: string[]; // List of tab iconIds available in this window
}

export const APPLICATIONS: Record<string, Application> = {
  // Tabbed "Files" window (Documents, Pictures, Music, Videos)
  "icon-documents": {
    id: "icon-documents",
    windowTitle: "Files",
    tabTitle: "Documents",
    component: Documents,
    showTabs: true,
    availableTabs: [
      "icon-documents",
      "icon-pictures",
      "icon-music",
      "icon-videos",
    ],
  },
  // Tab views (not standalone windows)
  "icon-pictures": {
    id: "icon-pictures",
    windowTitle: "Pictures",
    component: Pictures,
    showTabs: false,
  },
  "icon-music": {
    id: "icon-music",
    windowTitle: "Music",
    component: Music,
    showTabs: false,
  },
  "icon-videos": {
    id: "icon-videos",
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
  "skill-viewer": {
    id: "skill-viewer",
    windowTitle: "Skills",
    component: SkillsViewer,
    showTabs: false,
  },
  "icon-skills": {
    id: "icon-skills",
    windowTitle: "Skills",
    component: SkillsViewer,
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
