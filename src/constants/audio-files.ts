import type { StaticImageData } from "next/image";
import type { FileDetails } from "@/types/files";
import MJBillieJeanImage from "@/assets/images/photos/mj-billie-jean.jpg";

export interface AudioFile {
  id: string;
  title: string;
  icon: StaticImageData;
  windowTitle: string;
  audio: string;
  details?: FileDetails;
}

export const AUDIO_FILES: Record<string, AudioFile> = {
  "audio-mj-billie-jean": {
    id: "audio-mj-billie-jean",
    title: "Michael Jackson - Billie Jean.mp3",
    icon: MJBillieJeanImage,
    windowTitle: "Michael Jackson - Billie Jean.mp3",
    audio: "/media/Michael Jackson - Billie Jean.mp3",
    details: {
      type: "MP3",
      size: 11835885,
      createdAt: new Date("2025-12-16T07:38:22Z"),
    },
  },
};
