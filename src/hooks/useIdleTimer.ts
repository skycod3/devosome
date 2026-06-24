"use client";

import { useEffect, useRef, useState } from "react";
import {
  SCREENSAVER_IDLE_TIMEOUT,
  SCREENSAVER_WAKE_EVENTS,
} from "@/constants/screen-saver";

/**
 * Tracks user inactivity.
 * Returns `isIdle=true` after `timeout` ms without any wake event.
 * Any wake event resets the timer and sets `isIdle=false`.
 */
export function useIdleTimer(timeout = SCREENSAVER_IDLE_TIMEOUT): {
  isIdle: boolean;
} {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetRef = useRef(0);

  useEffect(() => {
    function reset() {
      // Throttle: high-frequency events (e.g. mousemove) would otherwise tear
      // down and recreate the timeout on every tick.
      const now = Date.now();
      if (now - lastResetRef.current < 500) return;
      lastResetRef.current = now;

      if (timerRef.current) clearTimeout(timerRef.current);
      setIsIdle(false);
      timerRef.current = setTimeout(() => setIsIdle(true), timeout);
    }

    // Start the timer immediately
    lastResetRef.current = 0;
    reset();

    for (const event of SCREENSAVER_WAKE_EVENTS) {
      window.addEventListener(event, reset, { passive: true });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of SCREENSAVER_WAKE_EVENTS) {
        window.removeEventListener(event, reset);
      }
    };
  }, [timeout]);

  return { isIdle };
}
