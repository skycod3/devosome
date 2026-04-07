import { Pictures } from "@/components/layout/pictures";
import { Documents } from "@/components/layout/documents";
import { Music } from "@/components/layout/music";
import { Videos } from "@/components/layout/videos";
import { ResumeViewer } from "@/components/resume-viewer";

type AppComponent = React.ComponentType<{ iconId: string }>;

interface Application {
  id: string;
  component: AppComponent;
  windowTitle?: string;
  defaultSize?: { width: number; height: number };
  showTabs?: boolean;
  availableTabs?: string[]; // List of tab iconIds available in this window
}

export const APPLICATIONS: Record<string, Application> = {
  // Tabbed "Files" window (Documents, Pictures, Music, Videos)
  "icon-documents": {
    id: "icon-documents",
    windowTitle: "Files",
    component: Documents,
    showTabs: true,
    availableTabs: ["icon-documents", "icon-pictures", "icon-music", "icon-videos"],
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
  "icon-resume": {
    id: "icon-resume",
    windowTitle: "Jean's Resume.pdf",
    component: ResumeViewer,
    showTabs: false,
  },
};
