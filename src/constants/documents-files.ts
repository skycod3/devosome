import type { StaticImageData } from "next/image";

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

export const DOCUMENTS_FILES: Record<string, DocumentFile> = {};
