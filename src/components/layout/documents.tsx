import { FileBrowser } from "./file-browser";
import { DOCUMENTS_FILES } from "@/constants/documents-files";

interface DocumentsProps {
  iconId: string;
}

export function Documents({ iconId }: DocumentsProps) {
  return <FileBrowser iconId={iconId} files={DOCUMENTS_FILES} />;
}
