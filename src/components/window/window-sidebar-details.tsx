import Image from "next/image";
import { type IconType } from "react-icons";
import {
  PiCaretLeft,
  PiClockCounterClockwise,
  PiImage,
  PiInfo,
  PiMusicNote,
  PiNote,
  PiVideo,
} from "react-icons/pi";

import { Icon } from "@/stores/icons-store";

import { useRecent } from "@/hooks/useRecent";
import { useHighlightedIcon } from "@/hooks/useIconSelectors";

import { SidebarContent } from "../ui/sidebar";

import type { FileDetails } from "@/types/files";
import { DOCUMENTS_FILES } from "@/constants/documents-files";
import { IMAGE_FILES } from "@/constants/image-files";
import { VIDEO_FILES } from "@/constants/video-files";
import { AUDIO_FILES } from "@/constants/audio-files";

const TAB_ICONS: Record<string, IconType> = {
  recent: PiClockCounterClockwise,
  pictures: PiImage,
  documents: PiNote,
  music: PiMusicNote,
  videos: PiVideo,
};

const totalImageFiles = Object.keys(IMAGE_FILES).length;
const totalVideoFiles = Object.keys(VIDEO_FILES).length;
const totalAudioFiles = Object.keys(AUDIO_FILES).length;
const totalDocumentFiles = Object.keys(DOCUMENTS_FILES).length;

type SidebarData = {
  details: FileDetails | undefined;
  icon: React.ReactNode;
  text: string;
};

function getSidebarData(
  icon: Icon | undefined,
  totalRecentFiles: number,
): SidebarData | undefined {
  if (!icon) return undefined;

  switch (icon.parentId) {
    case "pictures":
      return {
        details: IMAGE_FILES[icon.id]?.details,
        icon: getCategoryIcon(icon.id),
        text: getCategoryText("pictures", totalRecentFiles),
      };
    case "documents":
      return {
        details: DOCUMENTS_FILES[icon.id]?.details,
        icon: getCategoryIcon(icon.id),
        text: getCategoryText("documents", totalRecentFiles),
      };
    case "music":
      return {
        details: AUDIO_FILES[icon.id]?.details,
        icon: getCategoryIcon(icon.id),
        text: getCategoryText("music", totalRecentFiles),
      };
    case "videos":
      return {
        details: VIDEO_FILES[icon.id]?.details,
        icon: getCategoryIcon(icon.id),
        text: getCategoryText("videos", totalRecentFiles),
      };
    case "recent": {
      const id = icon.appId;
      if (!id) return undefined;
      return {
        details:
          IMAGE_FILES[id]?.details ??
          DOCUMENTS_FILES[id]?.details ??
          AUDIO_FILES[id]?.details ??
          VIDEO_FILES[id]?.details,
        icon: getCategoryIcon(id),
        text: getCategoryText("recent", totalRecentFiles),
      };
    }
    default:
      return undefined;
  }
}

function getCategoryText(tab: string, totalRecentFiles: number): string {
  switch (tab) {
    case "pictures":
      return `Images (${totalImageFiles} item${totalImageFiles === 1 ? "" : "s"})`;
    case "documents":
      return `Documents (${totalDocumentFiles} item${totalDocumentFiles === 1 ? "" : "s"})`;
    case "music":
      return `Music (${totalAudioFiles} item${totalAudioFiles === 1 ? "" : "s"})`;
    case "videos":
      return `Videos (${totalVideoFiles} item${totalVideoFiles === 1 ? "" : "s"})`;
    case "recent":
      return `Recent files (${totalRecentFiles} item${totalRecentFiles === 1 ? "" : "s"})`;
    default:
      return "";
  }
}

function getCategoryIcon(id: string) {
  if (IMAGE_FILES[id]) return <PiImage className="size-6 shrink-0" />;
  else if (DOCUMENTS_FILES[id]) return <PiNote className="size-6 shrink-0" />;
  else if (AUDIO_FILES[id]) return <PiMusicNote className="size-6 shrink-0" />;
  else if (VIDEO_FILES[id]) return <PiVideo className="size-6 shrink-0" />;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function SidebarToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label="Toggle sidebar"
      title="Toggle sidebar"
      className="hidden md:flex shrink-0 w-5 items-center justify-center border-l bg-sidebar-accent/50 transition-colors hover:bg-sidebar-accent"
      onClick={onToggle}
    >
      <PiCaretLeft
        className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

export function SidebarDetails({ activeTab }: { activeTab: string }) {
  // Subscribed here (not at TabbedWindow) so highlighting an icon re-renders
  // only the sidebar, not the whole Files window content.
  const highlightedIcon = useHighlightedIcon();
  const { items } = useRecent();
  const sidebarData = getSidebarData(highlightedIcon, items.length);
  const TabIcon = TAB_ICONS[activeTab];

  return (
    <aside className="hidden md:flex h-full w-[30%] shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <SidebarContent>
        <div className="overflow-auto">
          {highlightedIcon && highlightedIcon.parentId ? (
            <div className="text-sm">
              <div className="bg-muted relative aspect-3/2">
                <Image
                  fill
                  alt={highlightedIcon.title}
                  src={highlightedIcon.icon}
                  className="object-contain"
                />
              </div>

              <div className="flow p-4">
                <h3 className="text-sm flex items-center gap-2">
                  {sidebarData?.icon} {highlightedIcon.title}
                </h3>

                <p className="font-semibold">Details:</p>

                <ul className="space-y-2 text-accent-foreground/70">
                  <li className="flex flex-wrap justify-between">
                    Type: <span>{sidebarData?.details?.type ?? "—"} File</span>
                  </li>
                  <li className="flex flex-wrap justify-between">
                    Size:{" "}
                    <span>
                      {sidebarData?.details
                        ? formatSize(sidebarData.details.size)
                        : "—"}
                    </span>
                  </li>
                  {sidebarData?.details?.createdAt && (
                    <li className="flex flex-wrap justify-between">
                      Created:{" "}
                      <span>
                        {sidebarData.details.createdAt.toLocaleDateString()}
                      </span>
                    </li>
                  )}
                  {sidebarData?.details?.dimensions && (
                    <li className="flex flex-wrap justify-between">
                      Dimensions:{" "}
                      <span>
                        {sidebarData.details.dimensions.width}x
                        {sidebarData.details.dimensions.height}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <div className="bg-muted flex aspect-3/2 items-center justify-center">
                {TabIcon && (
                  <TabIcon className="size-16 text-muted-foreground" />
                )}
              </div>

              <div className="flow p-4">
                <h3 className="text-sm">
                  {sidebarData?.text ??
                    getCategoryText(activeTab, items.length)}
                </h3>

                <div className="border border-accent-foreground/15 p-3 flex gap-4 items-center">
                  <PiInfo className="size-4 shrink-0" />
                  Select an item to see details.
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarContent>
    </aside>
  );
}
