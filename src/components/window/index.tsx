import { useViewport } from "@/hooks/useViewport";
import { useWindows } from "@/hooks/useWindows";
import { CSSProperties } from "react";

import { LuHouse } from "react-icons/lu";
import {
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore,
  VscClose,
} from "react-icons/vsc";

interface WindowProps {
  id: string;
}

export function Window({ id }: WindowProps) {
  const { windows, closeWindow } = useWindows();
  const { width, height } = useViewport();

  const window = windows.find((w) => w.id === id);

  if (!window) return null;

  const windowStyles: CSSProperties = {
    left: window?.position.x,
    top: window?.position.y,
    width: window?.size.width,
    height: window?.size.height,
    maxHeight: `calc(${height}px - 10vh)`,
    zIndex: window?.zIndex,
  };

  return (
    <div
      style={windowStyles}
      className={`absolute bg-popover text-popover-foreground grid grid-rows-[auto_1fr] overflow-hidden border shadow-lg ${
        window.isMaximized ? "rounded-none shadow-2xl" : "rounded-lg"
      }`}
    >
      <header
        className={`flex select-none ${window.isMaximized ? "rounded-none" : ""} touch-none`}
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

          <button className="flex-center size-4 cursor-default rounded-full border border-green-300 bg-green-200 hover:bg-green-400">
            {window.isMaximized ? (
              <VscChromeRestore className="size-3" />
            ) : (
              <VscChromeMaximize className="size-3" />
            )}
          </button>

          <button
            className="flex-center size-4 cursor-default rounded-full border border-red-300 bg-red-200 hover:bg-red-400"
            onClick={() => closeWindow(id)}
          >
            <VscClose className="size-3" />
          </button>
        </div>
      </header>
    </div>
  );
}
