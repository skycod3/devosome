import type { StaticImageData } from "next/image";
import type { FileDetails } from "@/types/files";
import ResumeIcon from "@/assets/resume.png";

export type DocumentViewer = "pdf" | "text";

export interface DocumentFile {
  id: string;
  title: string;
  icon: StaticImageData;
  file: string;
  mimeType: string;
  viewer: DocumentViewer;
  windowTitle: string;
  details?: FileDetails;
}

export const DOCUMENTS_FILES: Record<string, DocumentFile> = {
  "document-resume": {
    id: "document-resume",
    title: "Jean's Resume.pdf",
    icon: ResumeIcon,
    file: "/documents/resume.pdf",
    mimeType: "application/pdf",
    viewer: "pdf",
    windowTitle: "Jean's Resume.pdf",
    details: {
      type: "PDF",
      size: 181503,
      createdAt: new Date("2026-07-22T00:00:00Z"),
    },
  },
};
