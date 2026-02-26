"use client";

import { useState, useEffect } from "react";

export const useViewport = () => {
  // SSR-safe: initialize with undefined or default values
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Set initial viewport on mount (client-side only)
    setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return viewport;
};
