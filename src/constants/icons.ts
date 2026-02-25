import { Icon } from "@/stores/icons-store";

import HomeImage from "@/assets/home.svg";
import DocumentsImage from "@/assets/documents.svg";

export const DESKTOP_ICONS: Icon[] = [
  {
    id: "icon-home",
    title: "Home",
    icon: HomeImage,
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
  },
  {
    id: "icon-documents",
    title: "Documents",
    icon: DocumentsImage,
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
  },
];
