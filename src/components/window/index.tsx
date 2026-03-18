import { useViewport } from "@/hooks/useViewport";
import { useWindows } from "@/hooks/useWindows";
import { useIcons } from "@/hooks/useIcons";
import { Window as WindowType } from "@/stores/windows.store";
import { CSSProperties, useEffect, useRef, useState } from "react";

import { animate, motion, useMotionValue, useDragControls } from "motion/react";

import { LuHouse } from "react-icons/lu";
import {
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore,
  VscClose,
} from "react-icons/vsc";
import { PiImage, PiMusicNote, PiNote, PiVideo } from "react-icons/pi";

import { WindowContent } from "./window-content";

interface WindowProps {
  window: WindowType;
}

export function Window({ window }: WindowProps) {
  const {
    windows,
    restoreWindow,
    openWindowCentered,
    closeWindow,
    bringToFront,
    activeWindowId,
    toggleMaximize,
    setWindowPosition,
    setWindowSize,
    minimizeWindow,
  } = useWindows();
  const { width, height } = useViewport();
  const { icons } = useIcons();
  const [activeTab, setActiveTab] = useState<typeof window.iconId>(
    window.iconId,
  );

  // Use MotionValue for smoother drag without re-renders
  const x = useMotionValue(window.position.x);
  const y = useMotionValue(window.position.y);
  const mvWidth = useMotionValue(window.size.width);
  const mvHeight = useMotionValue(window.size.height);
  const mvRadius = useMotionValue(window.isMaximized ? 0 : 8);

  const isAnimatingRef = useRef(false);

  const dragControls = useDragControls();

  const parentIcon = icons.find((icon) => icon.id === window.parentId);

  // Sync MotionValue with store position (skipped during maximize/restore animation)
  useEffect(() => {
    if (isAnimatingRef.current) return;
    x.set(window.position.x);
    y.set(window.position.y);
  }, [window.position.x, window.position.y, x, y]);

  // Sync width/height/borderRadius with store (skipped during maximize/restore animation)
  useEffect(() => {
    if (isAnimatingRef.current) return;
    mvWidth.set(window.size.width);
    mvHeight.set(window.size.height);
    mvRadius.set(window.isMaximized ? 0 : 8);
  }, [window.size.width, window.size.height, window.isMaximized, mvWidth, mvHeight, mvRadius]);

  function handleWindowClick() {
    if (activeWindowId === window.id) return;
    bringToFront(window.id);
  }

  function handleMaximize() {
    const wasMaximized = window.isMaximized;
    toggleMaximize(window.id);

    // After state change, adjust size for fullscreen
    if (!wasMaximized) {
      // Maximizing: set size to fullscreen (position is set to 0,0 by store)
      setWindowSize(window.id, width, height);
    }
  }

  function handleBreadcrumbClick(targetIconId: string) {
    // Click on "Home" breadcrumb → close current window and return to desktop
    if (targetIconId === "icon-home") {
      closeWindow(window.id);
      return;
    }

    // Find target icon data to get title and icon for new window
    const targetIconData = icons.find((icon) => icon.id === targetIconId);
    if (!targetIconData) {
      console.warn(`Icon not found: ${targetIconId}`);
      closeWindow(window.id);
      return;
    }

    // Find target window by iconId
    const targetWindow = windows.find((w) => w.iconId === targetIconId);

    if (targetWindow) {
      // Window already exists → Bring to front and restore if minimized
      restoreWindow(targetWindow.id);
    } else {
      // Window does not exist → Open new window
      openWindowCentered(
        targetIconId,
        targetIconData.parentId || "",
        targetIconData.title,
        targetIconData.icon,
      );
    }

    // Always close the current window when navigating via breadcrumb
    closeWindow(window.id);
  }

  const windowStyles: CSSProperties = {
    width: window?.size.width,
    height: window?.size.height,
    maxHeight: window.isMaximized ? undefined : `calc(${height}px - 10vh)`,
    zIndex: window?.zIndex,
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
      style={{ ...windowStyles, x, y }}
      onPointerDown={handleWindowClick}
      drag={!window.isMaximized}
      dragControls={dragControls}
      dragElastic={0.1}
      dragListener={false}
      dragConstraints={{
        top: 0,
        left: 0,
        right: width - window.size.width,
        bottom: height - window.size.height,
      }}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        // Calculate new position and clamp within bounds
        const newX = Math.max(
          0,
          Math.min(
            window.position.x + info.offset.x,
            width - window.size.width,
          ),
        );
        const newY = Math.max(
          0,
          Math.min(
            window.position.y + info.offset.y,
            height - window.size.height,
          ),
        );

        setWindowPosition(window.id, newX, newY);
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
        window.isMaximized ? "rounded-none shadow-2xl" : "rounded-lg"
      }`}
    >
      <header
        onPointerDown={(event) => dragControls.start(event)}
        className={`flex select-none ${window.isMaximized ? "rounded-none cursor-default" : "cursor-move"} touch-none`}
      >
        <div
          style={{
            background: `linear-gradient(to right, rgb(from var(--background) r g b / 0.2), transparent 50%), repeating-linear-gradient(45deg, transparent, rgba(0, 0, 0, 0.05) 8%),
              repeating-linear-gradient(-45deg, transparent, rgb(from var(--foreground) r g b / 0.05) 8%)`,
          }}
          className={`flex flex-1 items-center gap-3 p-2`}
        >
          <LuHouse className="size-4 shrink-0" />

          {/* Breadcrumb dinâmico */}
          <button onClick={() => handleBreadcrumbClick("icon-home")}>
            <span>Home</span>
          </button>

          {parentIcon && (
            <button onClick={() => handleBreadcrumbClick(parentIcon.id)}>
              <span>/</span> <span>{parentIcon.title}</span>
            </button>
          )}

          <span>/</span>
          <p className="line-clamp-1">{window.title}</p>
        </div>

        <div
          className="bg-popover flex items-center gap-3 p-3 text-black"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            className="flex-center size-4 cursor-pointer rounded-full border border-yellow-300 bg-yellow-200 hover:bg-yellow-400"
            onClick={() => minimizeWindow(window.id)}
          >
            <VscChromeMinimize className="size-3" />
          </button>

          <button
            className="flex-center size-4 cursor-pointer rounded-full border border-green-300 bg-green-200 hover:bg-green-400"
            onClick={handleMaximize}
          >
            {window.isMaximized ? (
              <VscChromeRestore className="size-3" />
            ) : (
              <VscChromeMaximize className="size-3" />
            )}
          </button>

          <button
            className="flex-center size-4 cursor-pointer rounded-full border border-red-300 bg-red-200 hover:bg-red-400"
            onClick={() => closeWindow(window.id)}
          >
            <VscClose className="size-3" />
          </button>
        </div>
      </header>

      <div className="flex gap-2 overflow-auto">
        {window.showTabs && (
          <aside className="sticky top-0 flex-[0.6] bg-[rgb(from_var(--foreground)_r_g_b/0.1)] p-4">
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setActiveTab("icon-pictures")}
                  className={`flex items-center gap-1 font-medium ${activeTab === "icon-pictures" ? "text-blue-600" : ""}`}
                >
                  <PiImage className="size-4" />
                  Pictures
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("icon-documents")}
                  className={`flex items-center gap-1 font-medium ${activeTab === "icon-documents" ? "text-blue-600" : ""}`}
                >
                  <PiNote className="size-4" />
                  Documents
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("icon-music")}
                  className={`flex items-center gap-1 font-medium ${activeTab === "icon-music" ? "text-blue-600" : ""}`}
                >
                  <PiMusicNote className="size-4" />
                  Music
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("icon-videos")}
                  className={`flex items-center gap-1 font-medium ${activeTab === "icon-videos" ? "text-blue-600" : ""}`}
                >
                  <PiVideo className="size-4" />
                  Videos
                </button>
              </li>
            </ul>
          </aside>
        )}

        <WindowContent iconId={activeTab} />
      </div>
    </motion.div>
  );
}
