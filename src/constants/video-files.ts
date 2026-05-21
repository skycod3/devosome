import type { StaticImageData } from "next/image";
import type { FileDetails } from "@/types/files";
import DBZKakarotImagem from "@/assets/images/photos/dbz-kakarot.jpg";

export interface VideoFile {
  id: string;
  title: string;
  icon: StaticImageData;
  windowTitle: string;
  video: string;
  details?: FileDetails;
}

export const VIDEO_FILES: Record<string, VideoFile> = {
  "video-dbz-kakarot": {
    id: "video-dbz-kakarot",
    title: "dbz-kakarot.mp4",
    icon: DBZKakarotImagem,
    windowTitle: "dbz-kakarot.mp4",
    video: "/media/dbz-kakarot.mp4",
    details: {
      type: "MP4",
      size: 19630452,
      createdAt: new Date("2025-12-18T08:33:19Z"),
      dimensions: { width: 1280, height: 720 },
    },
  },
};
