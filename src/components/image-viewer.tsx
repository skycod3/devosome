"use client";

import Image from "next/image";
import { useRef, useState, useCallback, useEffect, KeyboardEvent } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  animate,
  type PanInfo,
} from "motion/react";

// prettier-ignore
import { PiArrowLeft, PiArrowRight, PiArrowCounterClockwise, PiMagnifyingGlassMinus, PiMagnifyingGlassPlus, PiArrowsOut, PiSpinnerLight } from "react-icons/pi";

import { useIcons } from "@/hooks/useIcons";
import { useWindows } from "@/hooks/useWindows";

import { IMAGE_FILES } from "@/constants/image-files";
// prettier-ignore
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, ZOOM_WHEEL_FACTOR, SWIPE_THRESHOLD, SWIPE_OUT_DISTANCE, SWIPE_SPRING } from "@/constants/image-viewer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageViewerProps {
  iconId: string;
  parentId?: string;
  windowId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatZoom(scale: number) {
  return `${Math.round(scale * 100)}%`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ImageViewer({ iconId, parentId, windowId }: ImageViewerProps) {
  const { icons } = useIcons();
  const { updateWindowTitle } = useWindows();

  // Build ordered list of image IDs from the same parent folder
  const siblingIds = parentId
    ? icons
        .filter(
          (icon) => icon.parentId === parentId && icon.id.startsWith("image-"),
        )
        .map((icon) => icon.id)
    : [];

  // If no siblings found, fall back to just the current image
  const imageList = siblingIds.length > 0 ? siblingIds : [iconId];
  const initialIndex = imageList.indexOf(iconId);
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0,
  );

  const currentId = imageList[clamp(currentIndex, 0, imageList.length - 1)];
  const imageFile = IMAGE_FILES[currentId];

  // ─── Motion values ─────────────────────────────────────────────────────────

  const scale = useMotionValue(1);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const swipeX = useMotionValue(0); // drag offset during swipe gesture
  const entryX = useMotionValue(0); // slide-in animation for incoming image
  const imageOpacity = useMotionValue(1);

  // ─── Local state ───────────────────────────────────────────────────────────

  const [rotation, setRotation] = useState(0);
  const [zoomLabel, setZoomLabel] = useState(formatZoom(1));
  const [, setIsDragging] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAtDefaultZoom, setIsAtDefaultZoom] = useState(true);

  // ─── Refs ──────────────────────────────────────────────────────────────────

  const containerRef = useRef<HTMLDivElement>(null);
  const imageAreaRef = useRef<HTMLDivElement>(null);
  // Mutate-in-place so Framer Motion always reads the latest values via the
  // same object reference it received on the first render.
  const constraintsRef = useRef({ top: 0, left: 0, right: 0, bottom: 0 });

  // Pinch-to-zoom state
  const lastPinchDistRef = useRef<number | null>(null);

  // Prevent double-navigation during swipe animation
  const isNavigatingRef = useRef(false);

  // Direction the next image should enter from (-1 = from right, 1 = from left)
  const swipeEntryRef = useRef<-1 | 1 | 0>(0);

  // Track scale changes: update zoom label + pan constraints
  useMotionValueEvent(scale, "change", (v) => {
    setZoomLabel(formatZoom(v));
    setIsAtDefaultZoom(v === 1);
    const area = imageAreaRef.current;
    if (!area) return;
    const areaW = area.clientWidth;
    const areaH = area.clientHeight;
    // Use StaticImageData natural dimensions to compute the rendered size
    // that object-contain produces inside the area, then derive pan limits.
    const natW = imageFile.icon.width;
    const natH = imageFile.icon.height;
    const containRatio = Math.min(areaW / natW, areaH / natH);
    const rendW = natW * containRatio;
    const rendH = natH * containRatio;
    const maxX = Math.max(0, (rendW * v - areaW) / 2);
    const maxY = Math.max(0, (rendH * v - areaH) / 2);
    // Mutate — never reassign — so Framer Motion's reference stays valid.
    constraintsRef.current.top = -maxY;
    constraintsRef.current.left = -maxX;
    constraintsRef.current.right = maxX;
    constraintsRef.current.bottom = maxY;
  });

  // ─── Reset ─────────────────────────────────────────────────────────────────

  // Reset view + focus whenever the displayed image changes (also runs on mount)
  useEffect(() => {
    scale.set(1);
    setIsAtDefaultZoom(true);
    panX.set(0);
    panY.set(0);
    setRotation(0);
    containerRef.current?.focus();

    // Update the window title to reflect the current image
    if (windowId) {
      updateWindowTitle(windowId, imageFile.title);
    }

    const entry = swipeEntryRef.current;

    if (entry !== 0) {
      // Coming from a swipe: entryX is pre-positioned, swipeX is already 0.
      // Disable drag during animation to prevent elastic interference.
      setIsAnimating(true);
      setIsLoaded(false);
      animate(entryX, 0, {
        type: "tween",
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
        onComplete: () => setIsAnimating(false),
      });
      // imageOpacity animates to 1 only after onLoad fires (see <Image> onLoad handler)
    } else {
      // Button / keyboard navigation: instant reset, onLoad triggers fade-in.
      swipeX.set(0);
      entryX.set(0);
      imageOpacity.set(0);
      setIsLoaded(false);
      setIsAnimating(false);
    }

    swipeEntryRef.current = 0;
    isNavigatingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Register wheel listener as non-passive so preventDefault works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * ZOOM_WHEEL_FACTOR;
      const next = clamp(scale.get() * (1 + delta * 2), ZOOM_MIN, ZOOM_MAX);
      scale.set(next);
      if (next <= 1) {
        panX.set(0);
        panY.set(0);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scale, panX, panY]);

  // ─── Navigation ────────────────────────────────────────────────────────────

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(clamp(index, 0, imageList.length - 1));
    },
    [imageList.length],
  );

  const goPrev = useCallback(
    () => goTo(currentIndex - 1),
    [currentIndex, goTo],
  );

  const goNext = useCallback(
    () => goTo(currentIndex + 1),
    [currentIndex, goTo],
  );

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < imageList.length - 1;

  // ─── Zoom ──────────────────────────────────────────────────────────────────

  const zoomBy = useCallback(
    (delta: number) => {
      const next = clamp(scale.get() + delta, ZOOM_MIN, ZOOM_MAX);
      animate(scale, next, { duration: 0.12 });
      if (next <= 1) {
        animate(panX, 0, { duration: 0.12 });
        animate(panY, 0, { duration: 0.12 });
      }
    },
    [scale, panX, panY],
  );

  const zoomIn = useCallback(() => zoomBy(ZOOM_STEP), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(-ZOOM_STEP), [zoomBy]);
  const fitView = useCallback(() => {
    animate(scale, 1, { duration: 0.2 });
    animate(panX, 0, { duration: 0.2 });
    animate(panY, 0, { duration: 0.2 });
  }, [scale, panX, panY]);

  // ─── Pinch-to-zoom ─────────────────────────────────────────────────────────

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length !== 2) {
        lastPinchDistRef.current = null;
        return;
      }

      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (lastPinchDistRef.current !== null) {
        const ratio = dist / lastPinchDistRef.current;
        const next = clamp(scale.get() * ratio, ZOOM_MIN, ZOOM_MAX);
        scale.set(next);
        if (next <= 1) {
          panX.set(0);
          panY.set(0);
        }
      }

      lastPinchDistRef.current = dist;
    },
    [scale, panX, panY],
  );

  const handleTouchEnd = useCallback(() => {
    lastPinchDistRef.current = null;
  }, []);

  // ─── Swipe ─────────────────────────────────────────────────────────────────

  const handleSwipeEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      // Only swipe at 100% zoom
      if (!isAtDefaultZoom) return;
      // Prevent double-navigation
      if (isNavigatingRef.current) return;

      const offsetX = info.offset.x;

      if (offsetX < -SWIPE_THRESHOLD && hasNext) {
        // Swipe right-to-left → fade out from current dragged position, next enters from right
        isNavigatingRef.current = true;
        swipeEntryRef.current = -1;
        swipeX.stop();
        swipeX.set(0);
        animate(imageOpacity, 0, {
          duration: 0.15,
          onComplete: () => {
            entryX.set(SWIPE_OUT_DISTANCE);
            goNext();
          },
        });
      } else if (offsetX > SWIPE_THRESHOLD && hasPrev) {
        // Swipe left-to-right → fade out from current dragged position, prev enters from left
        isNavigatingRef.current = true;
        swipeEntryRef.current = 1;
        swipeX.stop();
        swipeX.set(0);
        animate(imageOpacity, 0, {
          duration: 0.15,
          onComplete: () => {
            entryX.set(-SWIPE_OUT_DISTANCE);
            goPrev();
          },
        });
      } else {
        // Boundary bounce or sub-threshold swipe: spring back to center
        animate(swipeX, 0, SWIPE_SPRING);
      }
    },
    [
      isAtDefaultZoom,
      swipeX,
      imageOpacity,
      entryX,
      hasNext,
      hasPrev,
      goNext,
      goPrev,
    ],
  );

  // ─── Rotation ──────────────────────────────────────────────────────────────

  const rotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  // ─── Keyboard ──────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (imageList.length > 1) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goPrev();
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          goNext();
        }
      }
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") fitView();
      if (e.key === "r" || e.key === "R") rotate();
    },
    [imageList.length, goPrev, goNext, zoomIn, zoomOut, fitView, rotate],
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  if (!imageFile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Image not found</p>
      </div>
    );
  }

  const canDrag = !isAtDefaultZoom && scale.get() > 1;
  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex === imageList.length - 1;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col size-full overflow-hidden bg-black/5 outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerUp={() => containerRef.current?.focus()}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Image area ── */}
      <div ref={imageAreaRef} className="relative flex-1 overflow-hidden">
        {!isLoaded && (
          <div className="absolute inset-0 grid place-items-center">
            <PiSpinnerLight
              className={`size-8 animate-spin ${isLoaded ? "opacity-0" : "opacity-100"}`}
            />
          </div>
        )}
        {/* ── Swipe wrapper (active only at 100% zoom and multiple images) ── */}
        <motion.div
          drag={
            !isAnimating && isAtDefaultZoom && imageList.length > 1
              ? "x"
              : false
          }
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{
            left: isAtEnd ? 0.4 : 0.4,
            right: isAtStart ? 0.4 : 0.4,
          }}
          style={{ x: swipeX }}
          onDragEnd={handleSwipeEnd}
          className="absolute inset-0"
        >
          {/* ── Entry slide wrapper (animates incoming image position) ── */}
          <motion.div style={{ x: entryX }} className="absolute inset-0">
            <motion.div
              drag={canDrag}
              dragMomentum={false}
              dragConstraints={constraintsRef.current}
              dragElastic={0.05}
              style={{
                x: panX,
                y: panY,
                scale,
                rotate: rotation,
                opacity: imageOpacity,
              }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              className={"absolute inset-0 flex items-center justify-center "}
            >
              <Image
                src={imageFile.icon}
                alt={imageFile.title}
                className="max-h-full max-w-full object-contain select-none"
                sizes="(max-width: 768px) 100vw, 80vw"
                priority
                draggable={false}
                onLoad={() => {
                  setIsLoaded(true);
                  animate(imageOpacity, 1, { type: "tween", duration: 0.2 });
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Prev / Next arrows (floating) ── */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={!hasPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 disabled:opacity-20"
              aria-label="Previous image"
            >
              <PiArrowLeft className="size-5" />
            </button>
            <button
              onClick={goNext}
              disabled={!hasNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 disabled:opacity-20"
              aria-label="Next image"
            >
              <PiArrowRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-popover/80 px-3 py-2 backdrop-blur-sm text-sm">
        {/* Navigation counter */}
        <span className="text-muted-foreground tabular-nums line-clamp-2 text-center text-xs sm:text-sm">
          {imageList.length > 1
            ? `${currentIndex + 1} / ${imageList.length}`
            : imageFile.title}
        </span>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="rounded p-1.5 hover:bg-accent transition"
            aria-label="Zoom out"
            title="Zoom out (-)"
          >
            <PiMagnifyingGlassMinus className="size-4" />
          </button>

          <button
            onClick={fitView}
            className="rounded px-2 py-1 text-xs font-mono hover:bg-accent transition min-w-13 text-center"
            aria-label="Reset zoom"
            title="Reset zoom (0)"
          >
            {zoomLabel}
          </button>

          <button
            onClick={zoomIn}
            className="rounded p-1.5 hover:bg-accent transition"
            aria-label="Zoom in"
            title="Zoom in (+)"
          >
            <PiMagnifyingGlassPlus className="size-4" />
          </button>

          <button
            onClick={fitView}
            className="rounded p-1.5 hover:bg-accent transition"
            aria-label="Fit to screen"
            title="Fit to screen"
          >
            <PiArrowsOut className="size-4" />
          </button>
        </div>

        {/* Rotation */}
        <div className="flex w-16 justify-end">
          <button
            onClick={rotate}
            className="rounded p-1.5 hover:bg-accent transition"
            aria-label="Rotate 90°"
            title="Rotate (R)"
          >
            <PiArrowCounterClockwise className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
