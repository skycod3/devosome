import { Documents } from "@/components/layout/documents";
import { ResumeViewer } from "@/components/resume-viewer";

type AppComponent = React.ComponentType<{ iconId: string }>;

interface Application {
  id: string;
  component: AppComponent;
  windowTitle?: string;
  defaultSize?: { width: number; height: number };
  showTabs?: boolean;
}

export const APPLICATIONS: Record<string, Application> = {
  "icon-documents": {
    id: "icon-documents",
    windowTitle: "Documents",
    component: Documents,
    showTabs: true,
  },
  "icon-resume": {
    id: "icon-resume",
    windowTitle: "Jean's Resume.pdf",
    component: ResumeViewer,
    showTabs: false,
  },
};
