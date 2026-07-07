import { FileBrowser } from "./file-browser";
import { AUDIO_FILES } from "@/constants/audio-files";

interface MusicProps {
  iconId: string;
}

export function Music({ iconId }: MusicProps) {
  return <FileBrowser iconId={iconId} files={AUDIO_FILES} />;
}
