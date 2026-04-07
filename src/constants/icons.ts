import { Icon } from "@/stores/icons-store";

import DocumentsImage from "@/assets/documents.svg";

export const DESKTOP_ICONS: Icon[] = [
  {
    id: "icon-documents",
    title: "Files",
    icon: DocumentsImage,
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
  },
];
