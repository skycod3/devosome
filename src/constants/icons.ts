import { Icon } from "@/stores/icons-store";

import DocumentsImage from "@/assets/documents.svg";
import SkillsImage from "@/assets/skills.svg";

export const DESKTOP_ICONS: Icon[] = [
  {
    id: "icon-documents",
    title: "Files",
    icon: DocumentsImage,
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
  },
  {
    id: "icon-skills",
    title: "Skills",
    icon: SkillsImage,
    isHighlighted: false,
    show: true,
    size: { width: 54, height: 54 },
  },
];
