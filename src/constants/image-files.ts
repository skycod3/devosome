import type { StaticImageData } from "next/image";
import CssMemeImage from "@/assets/images/photos/css-is-awesome.jpg";
import ThanksBrendan from "@/assets/images/photos/thanks-brendan.jpg";

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
  "image-thanks-brendan": {
    id: "image-thanks-brendan",
    title: "thanks-brendan.jpg",
    icon: ThanksBrendan,
    windowTitle: "thanks-brendan.jpg",
  },
};
