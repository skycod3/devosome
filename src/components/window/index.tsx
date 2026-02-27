import { useViewport } from "@/hooks/useViewport";
import { useWindows } from "@/hooks/useWindows";
import { Window as WindowType } from "@/stores/windows.store";
import { CSSProperties, useEffect } from "react";

import { motion, useMotionValue, useDragControls } from "motion/react";

import { LuHouse } from "react-icons/lu";
import {
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore,
  VscClose,
} from "react-icons/vsc";

interface WindowProps {
  window: WindowType;
}

export function Window({ window }: WindowProps) {
  const {
    closeWindow,
    bringToFront,
    activeWindowId,
    toggleMaximize,
    setWindowPosition,
    setWindowSize,
  } = useWindows();
  const { width, height } = useViewport();

  // Use MotionValue for smoother drag without re-renders
  const x = useMotionValue(window.position.x);
  const y = useMotionValue(window.position.y);

  const dragControls = useDragControls();

  // Sync MotionValue with store position
  useEffect(() => {
    x.set(window.position.x);
    y.set(window.position.y);
  }, [window.position.x, window.position.y, x, y]);

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

  const windowStyles: CSSProperties = {
    width: window?.size.width,
    height: window?.size.height,
    maxHeight: window.isMaximized ? undefined : `calc(${height}px - 10vh)`,
    zIndex: window?.zIndex,
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
      animate={{
        opacity: 1,
        scale: 1,
      }}
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

          <div className="flex items-center gap-2">
            <span className="font-bold">Home</span>
          </div>
          <span>/</span>

          <p className="line-clamp-1">TEST</p>
        </div>

        <div className="bg-popover flex items-center gap-3 p-3 text-black">
          <button className="flex-center size-4 cursor-default rounded-full border border-yellow-300 bg-yellow-200 hover:bg-yellow-400">
            <VscChromeMinimize className="size-3" />
          </button>

          <button
            className="flex-center size-4 cursor-default rounded-full border border-green-300 bg-green-200 hover:bg-green-400"
            onClick={handleMaximize}
          >
            {window.isMaximized ? (
              <VscChromeRestore className="size-3" />
            ) : (
              <VscChromeMaximize className="size-3" />
            )}
          </button>

          <button
            className="flex-center size-4 cursor-default rounded-full border border-red-300 bg-red-200 hover:bg-red-400"
            onClick={() => closeWindow(window.id)}
          >
            <VscClose className="size-3" />
          </button>
        </div>
      </header>
    </motion.div>
  );
}
