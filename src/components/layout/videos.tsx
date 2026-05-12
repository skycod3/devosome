import { FileBrowser } from "./file-browser";
import { VIDEO_FILES } from "@/constants/video-files";

interface VideosProps {
  iconId: string;
}

export function Videos({ iconId }: VideosProps) {
  return (
    <FileBrowser iconId={iconId} files={VIDEO_FILES} />
  );
}
