import { FileBrowser } from "./file-browser";
import { IMAGE_FILES } from "@/constants/image-files";

interface PicturesProps {
  iconId: string;
}

export function Pictures({ iconId }: PicturesProps) {
  return <FileBrowser iconId={iconId} files={IMAGE_FILES} />;
}
