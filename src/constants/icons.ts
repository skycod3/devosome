import { Icon } from "@/stores/icons-store";

import DocumentsImage from "@/assets/documents.svg";
import SkillsImage from "@/assets/skills.svg";
import AboutMeImage from "@/assets/about-me.svg";
import ContactImage from "@/assets/contact.svg";
import PortfolioImage from "@/assets/portfolio.svg";

export const DESKTOP_ICONS: Icon[] = [
  {
    id: "icon-documents",
    appId: "files",
    title: "Files",
    icon: DocumentsImage,
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
  },
  {
    id: "icon-about-me",
    appId: "about-me",
    title: "About Me",
    icon: AboutMeImage,
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
  },
  {
    id: "icon-skills",
    appId: "skills",
    title: "Skills",
    icon: SkillsImage,
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
  },
  {
    id: "icon-portfolio",
    appId: "portfolio",
    title: "Portfolio",
    icon: PortfolioImage,
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
  },
  {
    id: "icon-contact",
    appId: "contact",
    title: "Contact",
    icon: ContactImage,
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
  },
];
