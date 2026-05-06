import type { StaticImageData } from "next/image";
import DBZKakarotImagem from "@/assets/images/photos/dbz-kakarot.jpg";

export interface VideoFile {
  id: string;
  title: string;
  icon: StaticImageData;
  windowTitle: string;
  video: string;
}

export const VIDEO_FILES: Record<string, VideoFile> = {
  "video-dbz-kakarot": {
    id: "video-dbz-kakarot",
    title: "dbz-kakarot.mp4",
    icon: DBZKakarotImagem,
    windowTitle: "dbz-kakarot.mp4",
    video: "/media/dbz-kakarot.mp4",
  },
};
