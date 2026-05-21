import Image from "next/image";
import { useWindows } from "@/hooks/useWindows";
import { Window as WindowType } from "@/stores/windows.store";
import type { Icon } from "@/stores/icons-store";
import { CSSProperties, useEffect, useState } from "react";
import { useIcons } from "@/hooks/useIcons";
import { useRecent } from "@/hooks/useRecent";
import { useIsMobile } from "@/hooks/useIsMobile";

import { motion, useMotionValue, useDragControls } from "motion/react";

import { SidebarContent } from "@/components/ui/sidebar";

import {
  PiCaretLeft,
  PiClockCounterClockwise,
  PiImage,
  PiInfo,
  PiMusicNote,
  PiNote,
  PiVideo,
} from "react-icons/pi";

import { APPLICATIONS } from "@/constants/applications";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WindowHeader } from "./window-header";
import { WindowContent } from "./window-content";

import { supportsRelativeColors } from "@/utils/css-supports";

import type { FileDetails } from "@/types/files";
import { IMAGE_FILES } from "@/constants/image-files";
import { VIDEO_FILES } from "@/constants/video-files";
import { AUDIO_FILES } from "@/constants/audio-files";
import { DOCUMENTS_FILES } from "@/constants/documents-files";

const totalImageFiles = Object.keys(IMAGE_FILES).length;
const totalVideoFiles = Object.keys(VIDEO_FILES).length;
const totalAudioFiles = Object.keys(AUDIO_FILES).length;
const totalDocumentFiles = Object.keys(DOCUMENTS_FILES).length;

interface WindowProps {
  window: WindowType;
  desktopRect: { width: number; height: number; top: number; left: number };
}

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
        icon: <PiImage className="size-6 shrink-0" />,
        text: getCategoryText("pictures", totalRecentFiles),
      };
    case "documents":
      return {
        details: DOCUMENTS_FILES[icon.id]?.details,
        icon: <PiNote className="size-6 shrink-0" />,
        text: getCategoryText("documents", totalRecentFiles),
      };
    case "music":
      return {
        details: AUDIO_FILES[icon.id]?.details,
        icon: <PiMusicNote className="size-6 shrink-0" />,
        text: getCategoryText("music", totalRecentFiles),
      };
    case "videos":
      return {
        details: VIDEO_FILES[icon.id]?.details,
        icon: <PiVideo className="size-6 shrink-0" />,
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
        icon: <PiClockCounterClockwise className="size-6 shrink-0" />,
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

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function SidebarToggle({
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
      className="flex shrink-0 w-5 cursor-pointer items-center justify-center border-l bg-sidebar-accent/50 transition-colors hover:bg-sidebar-accent"
      onClick={onToggle}
    >
      <PiCaretLeft
        className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function SidebarDetails({
  highlightedIcon,
  activeTab,
}: {
  highlightedIcon: Icon | undefined;
  activeTab: string;
}) {
  const { items } = useRecent();
  const sidebarData = getSidebarData(highlightedIcon, items.length);

  return (
    <aside className="flex h-full w-[30%] shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <SidebarContent>
        <div className="overflow-auto">
          {highlightedIcon && highlightedIcon.parentId ? (
            <>
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
                    <li className="flex justify-between">
                      Type:{" "}
                      <span>{sidebarData?.details?.type ?? "—"} File</span>
                    </li>
                    <li className="flex justify-between">
                      Size:{" "}
                      <span>
                        {sidebarData?.details
                          ? formatSize(sidebarData.details.size)
                          : "—"}
                      </span>
                    </li>
                    {sidebarData?.details?.createdAt && (
                      <li className="flex justify-between">
                        Created:{" "}
                        <span>
                          {sidebarData.details.createdAt.toLocaleDateString()}
                        </span>
                      </li>
                    )}
                    {sidebarData?.details?.dimensions && (
                      <li className="flex justify-between">
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
            </>
          ) : (
            <div className="text-sm">
              <div className="bg-muted aspect-3/2"></div>

              <div className="flow p-4">
                <h3 className="text-sm">
                  {sidebarData
                    ? sidebarData.text
                    : getCategoryText(activeTab, items.length)}
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

function TabbedWindow({ window }: { window: WindowType }) {
  const { setWindowActiveTab } = useWindows();
  const { icons, unhighlightAllIcons } = useIcons();
  const isLargeDesktop = useIsMobile(1600);
  const [sidebarOpen, setSidebarOpen] = useState(!isLargeDesktop);

  const activeTab = window.activeTab || window.iconId;
  const highlightedIcon = icons.find((icon) => icon.isHighlighted);

  function handleTabChange(tab: string) {
    setWindowActiveTab(window.id, tab);
    unhighlightAllIcons();
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      orientation="vertical"
      className="flex flex-row flex-1 overflow-hidden gap-0"
    >
      <aside
        className={`sticky top-0 sm:flex-[0.6] ${supportsRelativeColors ? "bg-[rgb(from_var(--foreground)_r_g_b/0.1)]" : "bg-sidebar-accent"} p-4`}
      >
        <TabsList
          variant="line"
          className="flex-col items-start gap-6 sm:gap-4 bg-transparent w-full h-auto p-0"
        >
          <TabsTrigger className="p-0 after:hidden" value="recent">
            <PiClockCounterClockwise className="size-6 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">Recent</span>
          </TabsTrigger>

          <TabsTrigger className="p-0 after:hidden" value="pictures">
            <PiImage className="size-6 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">Pictures</span>
          </TabsTrigger>

          <TabsTrigger className="p-0 after:hidden" value="documents">
            <PiNote className="size-6 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>

          <TabsTrigger className="p-0 after:hidden" value="music">
            <PiMusicNote className="size-6 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">Music</span>
          </TabsTrigger>

          <TabsTrigger className="p-0 after:hidden" value="videos">
            <PiVideo className="size-6 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
        </TabsList>
      </aside>

      <div className="flex w-full min-w-0">
        <main className="relative flex flex-1 flex-col bg-background min-w-0">
          <WindowContent
            iconId={window.iconId}
            parentId={window.parentId}
            windowId={window.id}
          />
        </main>

        <SidebarToggle
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((s) => !s)}
        />

        {sidebarOpen && (
          <SidebarDetails
            highlightedIcon={highlightedIcon}
            activeTab={activeTab}
          />
        )}
      </div>
    </Tabs>
  );
}

export function Window({ window, desktopRect }: WindowProps) {
  const { bringToFront, activeWindowId, setWindowPosition, isMobile } =
    useWindows();

  // dragConstraints values are relative to the element's own position as measured
  // by getBoundingClientRect(). Since the window uses position:absolute inside the
  // desktop container, its BCR.top already includes the container's top offset
  // (Taskbar height). We compensate here so the numeric constraints are correctly
  // anchored to the container's coordinate space.
  const { width, height, top: containerTop, left: containerLeft } = desktopRect;

  // Get activeTab from store, fallback to window.iconId
  const activeTab = window.activeTab || window.iconId;

  // Use MotionValue for smoother drag without re-renders
  const x = useMotionValue(window.position.x);
  const y = useMotionValue(window.position.y);
  const mvWidth = useMotionValue(window.size.width);
  const mvHeight = useMotionValue(window.size.height);
  const mvRadius = useMotionValue(window.isMaximized ? 0 : 8);

  const [isAnimating, setIsAnimating] = useState(false);

  const dragControls = useDragControls();

  const activeTabApp = APPLICATIONS[activeTab];
  const windowTitle =
    activeTabApp?.tabTitle ?? activeTabApp?.windowTitle ?? window.title;

  // Sync MotionValue with store position (skipped during maximize/restore animation)
  useEffect(() => {
    if (isAnimating) return;
    x.set(window.position.x);
    y.set(window.position.y);
  }, [window.position.x, window.position.y, x, y, isAnimating]);

  // Sync width/height/borderRadius with store (skipped during maximize/restore animation)
  useEffect(() => {
    if (isAnimating) return;
    mvWidth.set(window.size.width);
    mvHeight.set(window.size.height);
    mvRadius.set(window.isMaximized ? 0 : 8);
  }, [
    window.size.width,
    window.size.height,
    window.isMaximized,
    mvWidth,
    mvHeight,
    mvRadius,
    isAnimating,
  ]);

  function handleWindowClick() {
    if (activeWindowId === window.id) return;
    bringToFront(window.id);
  }

  const windowStyles: CSSProperties = {
    zIndex: window?.zIndex,
    pointerEvents: window?.isMinimized ? "none" : undefined,
    maxHeight:
      isMobile || isAnimating || window.isMaximized ? undefined : "90dvh",
  };

  const getWindowAnimations = () => {
    if (window.isMinimized) {
      return {
        y: -100,
        opacity: 0,
        scale: 0.5,
      };
    }

    return {
      opacity: 1,
      scale: 1,
    };
  };

  return (
    <motion.div
      style={{
        ...windowStyles,
        x,
        y,
        width: mvWidth,
        height: mvHeight,
        borderRadius: mvRadius,
      }}
      onPointerDown={handleWindowClick}
      drag={!window.isMaximized && !isMobile}
      dragControls={dragControls}
      dragElastic={0.1}
      dragListener={false}
      dragConstraints={{
        top: -containerTop,
        left: -containerLeft,
        right: width - window.size.width - containerLeft,
        bottom: height - window.size.height - containerTop,
      }}
      dragMomentum={false}
      onDragTransitionEnd={() => {
        setWindowPosition(window.id, x.get(), y.get());
      }}
      whileDrag={{
        scale: window.isMaximized ? 1 : 1.02,
        boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
      }}
      initial={{
        opacity: 0,
        scale: 0.95,
        x: window.position.x,
        y: window.position.y,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      animate={getWindowAnimations()}
      className={`absolute bg-popover text-popover-foreground grid grid-rows-[auto_1fr] overflow-hidden border shadow-lg ${
        window.isMaximized ? "shadow-2xl" : ""
      }`}
    >
      <WindowHeader
        window={window}
        windowTitle={windowTitle}
        setIsAnimating={setIsAnimating}
        x={x}
        y={y}
        mvWidth={mvWidth}
        mvHeight={mvHeight}
        mvRadius={mvRadius}
        dragControls={dragControls}
        isMobile={isMobile}
      />

      {window.showTabs ? (
        <TabbedWindow window={window} />
      ) : (
        <div className="flex overflow-auto">
          <WindowContent
            iconId={activeTab}
            parentId={window.parentId}
            windowId={window.id}
          />
        </div>
      )}
    </motion.div>
  );
}
