"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copies text to the clipboard and exposes a transient `copied` flag that
 * auto-resets after `resetMs`. Safe against the Clipboard API throwing
 * (insecure context / permission denied) and against unmount.
 */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        console.warn("Clipboard write failed");
        return false;
      }
    },
    [resetMs],
  );

  return { copied, copy };
}
