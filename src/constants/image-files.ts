import type { StaticImageData } from "next/image";
import CssMemeImage from "@/assets/images/photos/css-is-awesome.jpg";

export interface ImageFile {
  id: string;
  title: string;
  icon: StaticImageData;
  windowTitle: string;
}

export const IMAGE_FILES: Record<string, ImageFile> = {
  "image-css-is-awesome": {
    id: "image-css-is-awesome",
    title: "css-is-awesome.jpg",
    icon: CssMemeImage,
    windowTitle: "css-is-awesome.jpg",
  },
};
