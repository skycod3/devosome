import { useWindows } from "@/hooks/useWindows";
import { Window as WindowType } from "@/stores/windows.store";
import { CSSProperties, useEffect, useState } from "react";
import { useIcons } from "@/hooks/useIcons";

import { useIsMobile } from "@/hooks/useIsMobile";

import { motion, useMotionValue, useDragControls } from "motion/react";

import {
  PiClockCounterClockwise,
  PiImage,
  PiMusicNote,
  PiNote,
  PiVideo,
} from "react-icons/pi";

import { APPLICATIONS } from "@/constants/applications";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WindowHeader } from "./window-header";
import { WindowContent } from "./window-content";

import { supportsRelativeColors } from "@/utils/css-supports";
import { SidebarDetails, SidebarToggle } from "./window-sidebar-details";

interface WindowProps {
  window: WindowType;
  desktopRect: { width: number; height: number; top: number; left: number };
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
        className={`sticky top-0 sm:flex-[0.6] ${supportsRelativeColors ? "bg-[rgb(from_var(--foreground)_r_g_b/0.1)]" : "bg-sidebar-accent"} p-4 lg:p-6`}
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
