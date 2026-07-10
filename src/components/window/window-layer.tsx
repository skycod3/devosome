"use client";

import { RefObject, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useWindowIds } from "@/hooks/useWindowSelectors";
import { Window } from "./index";

/**
 * Renders the open windows. Owns the desktop rect measurement (drag
 * constraints) so a resize re-renders only this layer, not the whole shell.
 */
export function WindowLayer({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const windowIds = useWindowIds();
  const [desktopRect, setDesktopRect] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setDesktopRect({
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();

    return () => observer.disconnect();
  }, [containerRef]);

  return (
    <AnimatePresence>
      {windowIds.map((id) => (
        <Window key={id} id={id} desktopRect={desktopRect} />
      ))}
    </AnimatePresence>
  );
}
