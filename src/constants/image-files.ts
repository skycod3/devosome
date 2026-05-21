import type { StaticImageData } from "next/image";
import type { FileDetails } from "@/types/files";
import CssMemeImage from "@/assets/images/photos/css-is-awesome.jpg";
import ThanksBrendan from "@/assets/images/photos/thanks-brendan.jpg";

export interface ImageFile {
  id: string;
  title: string;
  icon: StaticImageData;
  windowTitle: string;
  details?: FileDetails;
}

export const IMAGE_FILES: Record<string, ImageFile> = {
  "image-css-is-awesome": {
    id: "image-css-is-awesome",
    title: "css-is-awesome.jpg",
    icon: CssMemeImage,
    windowTitle: "css-is-awesome.jpg",
    details: {
      type: "JPG",
      size: 1024 * 40.6, // (40.6 KB in bytes)
      createdAt: new Date("2026-03-30T12:00:00Z"),
      dimensions: {
        width: 1088,
        height: 826,
      },
    },
  },
  "image-thanks-brendan": {
    id: "image-thanks-brendan",
    title: "thanks-brendan.jpg",
    icon: ThanksBrendan,
    windowTitle: "thanks-brendan.jpg",
    details: {
      type: "JPG",
      size: 1024 * 158, // (158 KB in bytes)
      createdAt: new Date("2026-05-06T15:30:00Z"),
      dimensions: {
        width: 639,
        height: 724,
      },
    },
  },
};
