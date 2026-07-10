"use client";

import { useCallback, useEffect, useState } from "react";
import { Spotlight } from "@/components/spotlight";

export function SpotlightLauncher() {
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setSpotlightOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return spotlightOpen ? (
    <Spotlight onClose={() => setSpotlightOpen(false)} />
  ) : null;
}
