import type { StaticImageData } from "next/image";
import ResumeIcon from "@/assets/resume.svg";

export type DocumentViewer = "pdf" | "text";

export interface DocumentFile {
  id: string;
  title: string;
  icon: StaticImageData;
  file: string;
  mimeType: string;
  viewer: DocumentViewer;
  windowTitle: string;
}

export const DOCUMENTS_FILES: Record<string, DocumentFile> = {
  "document-resume": {
    id: "document-resume",
    title: "Resume",
    icon: ResumeIcon,
    file: "/documents/resume.pdf",
    mimeType: "application/pdf",
    viewer: "pdf",
    windowTitle: "Jean's Resume.pdf",
  },
};
