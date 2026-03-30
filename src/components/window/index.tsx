import { useViewport } from "@/hooks/useViewport";
import { useWindows } from "@/hooks/useWindows";
import { Window as WindowType } from "@/stores/windows.store";
import { CSSProperties, useEffect, useState } from "react";

import { motion, useMotionValue, useDragControls } from "motion/react";

import { PiImage, PiMusicNote, PiNote, PiVideo } from "react-icons/pi";

import { WindowHeader } from "./window-header";
import { WindowContent } from "./window-content";

interface WindowProps {
  window: WindowType;
}

export function Window({ window }: WindowProps) {
  const { bringToFront, activeWindowId, setWindowPosition } = useWindows();
  const { width, height } = useViewport();

  const [activeTab, setActiveTab] = useState<typeof window.iconId>(
    window.iconId,
  );

  // Use MotionValue for smoother drag without re-renders
  const x = useMotionValue(window.position.x);
  const y = useMotionValue(window.position.y);
  const mvWidth = useMotionValue(window.size.width);
  const mvHeight = useMotionValue(window.size.height);
  const mvRadius = useMotionValue(window.isMaximized ? 0 : 8);

  const [isAnimating, setIsAnimating] = useState(false);

  const dragControls = useDragControls();

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
    maxHeight:
      isAnimating || window.isMaximized
        ? undefined
        : `calc(${height}px - 10vh)`,
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
        window.isMaximized ? "shadow-2xl" : ""
      }`}
    >
      <WindowHeader
        window={window}
        setIsAnimating={setIsAnimating}
        x={x}
        y={y}
        width={width}
        height={height}
        mvWidth={mvWidth}
        mvHeight={mvHeight}
        mvRadius={mvRadius}
        dragControls={dragControls}
      />

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
