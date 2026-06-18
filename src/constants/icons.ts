import { Icon } from "@/stores/icons-store";

import DocumentsImage from "@/assets/documents.svg";
import SkillsImage from "@/assets/skills.svg";
import AboutMeImage from "@/assets/about-me.svg";
import ContactImage from "@/assets/contact.svg";
import PortfolioImage from "@/assets/portfolio.svg";
import TerminalImage from "@/assets/terminal.svg";
import PicturesImage from "@/assets/pictures.svg";
import MusicImage from "@/assets/music.svg";
import VideosImage from "@/assets/videos.svg";
import ClipboardImage from "@/assets/clipboard.svg";
import SystemMonitorImage from "@/assets/system-monitor.svg";
import SettingsImage from "@/assets/settings.svg";

/** Default size for desktop icons */
export const DEFAULT_ICON_SIZE = { width: 48, height: 48 } as const;

export const DESKTOP_ICONS: Icon[] = [
  {
    id: "icon-documents",
    appId: "files",
    title: "Files",
    icon: DocumentsImage,
    isHighlighted: false,
    show: true,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-about-me",
    appId: "about-me",
    title: "About Me",
    icon: AboutMeImage,
    isHighlighted: false,
    show: false,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-skills",
    appId: "skills",
    title: "Skills",
    icon: SkillsImage,
    isHighlighted: false,
    show: false,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-portfolio",
    appId: "portfolio",
    title: "Portfolio",
    icon: PortfolioImage,
    isHighlighted: false,
    show: false,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-contact",
    appId: "contact",
    title: "Contact",
    icon: ContactImage,
    isHighlighted: false,
    show: false,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-terminal",
    appId: "terminal",
    title: "Terminal",
    icon: TerminalImage,
    isHighlighted: false,
    show: true,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-pictures",
    appId: "pictures",
    title: "Pictures",
    icon: PicturesImage,
    isHighlighted: false,
    show: false,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-music",
    appId: "music",
    title: "Music",
    icon: MusicImage,
    isHighlighted: false,
    show: false,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-videos",
    appId: "videos",
    title: "Videos",
    icon: VideosImage,
    isHighlighted: false,
    show: false,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-clipboard-history",
    appId: "clipboard-history",
    title: "Clipboard History",
    icon: ClipboardImage,
    isHighlighted: false,
    show: false,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-system-monitor",
    appId: "system-monitor",
    title: "System Monitor",
    icon: SystemMonitorImage,
    isHighlighted: false,
    show: false,
    size: DEFAULT_ICON_SIZE,
  },
  {
    id: "icon-system-settings",
    appId: "system-settings",
    title: "System Settings",
    icon: SettingsImage,
    isHighlighted: false,
    show: true,
    size: DEFAULT_ICON_SIZE,
  },
];
