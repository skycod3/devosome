import { useWindowActions } from "@/hooks/useWindowActions";
import { useWindow } from "@/hooks/useWindowSelectors";
import { Window as WindowType } from "@/stores/windows-store";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useIcons } from "@/hooks/useIcons";

import { useViewport } from "@/hooks/useViewport";

import {
  motion,
  useMotionValue,
  useDragControls,
  useReducedMotion,
  animate,
  type PanInfo,
} from "motion/react";

import {
  PiClockCounterClockwise,
  PiImage,
  PiMusicNote,
  PiNote,
  PiVideo,
} from "react-icons/pi";

import { APPLICATIONS } from "@/constants/applications";
import { BREAKPOINTS } from "@/constants/breakpoints";
import {
  WORKAREA_TOP_INSET,
  WORKAREA_BOTTOM_INSET,
  SNAP_EDGE_THRESHOLD,
  SNAP_SIDE_TRIGGER,
} from "@/constants/windows";
import { computeSnap } from "@/lib/snap";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WindowHeader } from "./window-header";
import { WindowContent } from "./window-content";

import { supportsRelativeColors } from "@/utils/css-supports";
import { SidebarDetails, SidebarToggle } from "./window-sidebar-details";
import { ResizeHandles } from "./resize-handles";

/** Easing for the minimize/restore glide toward the taskbar dropdown. */
const MINIMIZE_EASE = [0.4, 0, 0.2, 1] as const;

interface WindowProps {
  id: string;
  desktopRect: { width: number; height: number; top: number; left: number };
}

function TabbedWindow({ window }: { window: WindowType }) {
  const { setWindowActiveTab } = useWindowActions();
  const { icons, unhighlightAllIcons } = useIcons();
  const { width: viewportWidth } = useViewport();
  const isLargeDesktop = viewportWidth >= BREAKPOINTS.WIDE;
  const [sidebarOpen, setSidebarOpen] = useState(isLargeDesktop);

  const activeTab = window.activeTab || window.iconId;
  const highlightedIcon = icons.find((icon) => icon.isHighlighted);

  function handleTabChange(tab: string) {
    setWindowActiveTab(window.id, tab);
    unhighlightAllIcons();
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      orientation="vertical"
      className="flex flex-row flex-1 overflow-hidden gap-0"
    >
      <aside
        className={`sticky top-0 sm:flex-[0.6] ${supportsRelativeColors ? "bg-[rgb(from_var(--foreground)_r_g_b/0.1)]" : "bg-sidebar-accent"} p-4 lg:p-6`}
      >
        <TabsList
          variant="line"
          className="flex-col items-start gap-6 sm:gap-4 bg-transparent w-full h-auto p-0"
        >
          <TabsTrigger className="p-0 after:hidden" value="recent">
            <PiClockCounterClockwise className="size-6 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">Recent</span>
          </TabsTrigger>

          <TabsTrigger className="p-0 after:hidden" value="pictures">
            <PiImage className="size-6 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">Pictures</span>
          </TabsTrigger>

          <TabsTrigger className="p-0 after:hidden" value="documents">
            <PiNote className="size-6 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>

          <TabsTrigger className="p-0 after:hidden" value="music">
            <PiMusicNote className="size-6 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">Music</span>
          </TabsTrigger>

          <TabsTrigger className="p-0 after:hidden" value="videos">
            <PiVideo className="size-6 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
        </TabsList>
      </aside>

      <div className="flex w-full min-w-0">
        <main className="relative flex flex-1 flex-col bg-background min-w-0">
          <WindowContent
            iconId={window.iconId}
            parentId={window.parentId}
            windowId={window.id}
          />
        </main>

        <SidebarToggle
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((s) => !s)}
        />

        {sidebarOpen && (
          <SidebarDetails
            highlightedIcon={highlightedIcon}
            activeTab={activeTab}
          />
        )}
      </div>
    </Tabs>
  );
}

export function Window({ id, desktopRect }: WindowProps) {
  const {
    bringToFront,
    setWindowPosition,
    setWindowSize,
    snapWindow,
    setSnapPreview,
    maximizeWindow,
  } = useWindowActions();
  const { width: viewportWidth, height: viewportHeight } = useViewport();
  const isMobile = viewportWidth > 0 && viewportWidth < BREAKPOINTS.TABLET;

  // Subscribe to this window's own slice. During the exit animation the entry
  // is gone from the store, so we hold the last value for AnimatePresence to
  // finish the exit. We use state (not a ref) because reading ref.current
  // during render trips the react-hooks/refs rule — and a conditional early
  // return here (before the hooks below) would violate the Rules of Hooks. The
  // state is adjusted directly in the render body (React's official pattern for
  // "storing information from previous renders"), not in a useEffect.
  const liveWindow = useWindow(id);
  const [lastWindow, setLastWindow] = useState(liveWindow);
  if (liveWindow && liveWindow !== lastWindow) {
    setLastWindow(liveWindow);
  }
  // Desktop only mounts <Window id> for ids present in the store, so this
  // window is always defined on first render; `lastWindow` covers the
  // exit-animation gap after the entry leaves the store.
  const window: WindowType = (liveWindow ?? lastWindow)!;
  // a11y: collapse window enter/exit/snap motion when the user prefers reduced
  // motion (direct-manipulation drag feedback is left intact).
  const prefersReducedMotion = useReducedMotion();
  // Resize is a pointer interaction — enable on any desktop-class viewport,
  // not just ultra-wide. Still disabled on mobile/tablet (touch) below.
  const resizeEnabled = viewportWidth >= BREAKPOINTS.DESKTOP;

  // dragConstraints values are relative to the element's own position as measured
  // by getBoundingClientRect(). Since the window uses position:absolute inside the
  // desktop container, its BCR.top already includes the container's top offset
  // (Taskbar height). We compensate here so the numeric constraints are correctly
  // anchored to the container's coordinate space.
  const { width, height, top: containerTop, left: containerLeft } = desktopRect;

  // Get activeTab from store, fallback to window.iconId
  const activeTab = window.activeTab || window.iconId;

  // Which side a window is snapped to (left snap sits at x=0). Used to square
  // the corners that touch the screen edge.
  const snapSide = window.isSnapped
    ? window.position.x === 0
      ? "left"
      : "right"
    : null;

  // Use MotionValue for smoother drag without re-renders
  const x = useMotionValue(window.position.x);
  const y = useMotionValue(window.position.y);
  const mvWidth = useMotionValue(window.size.width);
  const mvHeight = useMotionValue(window.size.height);
  const mvRadius = useMotionValue(window.isMaximized ? 0 : 8);

  const [isAnimating, setIsAnimating] = useState(false);

  const dragControls = useDragControls();

  // a11y: root element so we can move keyboard focus into the window when it
  // opens or is brought to the front, and return focus to the opener on close.
  const windowRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const activeTabApp = APPLICATIONS[activeTab];
  const windowTitle =
    activeTabApp?.tabTitle ?? activeTabApp?.windowTitle ?? window.title;

  // Sync MotionValue with store position (skipped during maximize/restore animation)
  useEffect(() => {
    if (isAnimating) return;
    x.set(window.position.x);
    y.set(window.position.y);
  }, [window.position.x, window.position.y, x, y, isAnimating]);

  // Minimize/restore drive x/y imperatively (like snap/maximize) so the
  // declarative animate prop never owns x/y — declaring x/y there fights dragging
  // and edge-snapping. Scale/opacity stay declarative (getWindowAnimations).
  const wasMinimizedRef = useRef(window.isMinimized);
  useEffect(() => {
    const wasMinimized = wasMinimizedRef.current;
    if (wasMinimized === window.isMinimized) return;
    wasMinimizedRef.current = window.isMinimized;
    if (prefersReducedMotion) return;

    const options = {
      duration: window.isMinimized ? 0.34 : 0.3,
      ease: MINIMIZE_EASE,
    };

    let targetX = window.position.x;
    let targetY = window.position.y;
    if (window.isMinimized) {
      // Measure the taskbar "Windows" dropdown on demand — the point the window
      // flies into. Fall back to the top-left corner if it isn't mounted.
      const rect = document
        .querySelector("[data-minimize-anchor]")
        ?.getBoundingClientRect();
      targetX = rect
        ? rect.x + rect.width / 2 - containerLeft
        : -containerLeft + 80;
      targetY = rect ? rect.y + rect.height / 2 - containerTop : -containerTop;
      // Collapse toward the top-left corner so the window shrinks into the
      // dropdown. Set imperatively (not via style) so opening/dragging keep the
      // default centered origin. Safe to set here: scale is still 1 this frame.
      if (windowRef.current)
        windowRef.current.style.transformOrigin = "top left";
    }

    const cx = animate(x, targetX, options);
    const cy = animate(y, targetY, options);
    // On restore, keep the top-left origin while the window grows back out, then
    // hand it back to center once scale is 1 again (no jump at scale 1).
    if (!window.isMinimized) {
      cy.then(() => {
        if (windowRef.current) windowRef.current.style.transformOrigin = "";
      });
    }
    return () => {
      cx.stop();
      cy.stop();
    };
  }, [
    window.isMinimized,
    window.position.x,
    window.position.y,
    containerLeft,
    containerTop,
    prefersReducedMotion,
    x,
    y,
  ]);

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

  // a11y: remember whoever opened the window (a desktop icon, dock button, or
  // Spotlight) so focus can return there when it closes. Captured on mount,
  // before the activate effect below steals focus into the window.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    openerRef.current = opener && opener !== document.body ? opener : null;
    return () => {
      const target = openerRef.current;
      if (target && document.contains(target)) {
        target.focus({ preventScroll: true });
      } else {
        // Opener is gone (e.g. Spotlight closed) — land on the desktop.
        document
          .querySelector<HTMLElement>(".desktop-area")
          ?.focus({ preventScroll: true });
      }
    };
    // Mount/unmount only — focus return on close.
  }, []);

  // a11y: move focus into the window when it opens or is brought to the front,
  // unless focus is already inside it (don't yank focus from a clicked input).
  useEffect(() => {
    if (!window.isActive || window.isMinimized) return;
    const el = windowRef.current;
    if (el && !el.contains(document.activeElement)) {
      el.focus({ preventScroll: true });
    }
  }, [window.isActive, window.id, window.isMinimized]);

  function handleWindowClick() {
    if (window.isActive) return;
    bringToFront(window.id);
  }

  // Gates side-snapping: a window must leave the side snap zones at least once
  // during a drag before it can (re)snap — kills the "sticky edge" feel when
  // dragging a snapped window away from the edge.
  const canSideSnapRef = useRef(true);
  // Tracks the preview's current kind so the store is only updated on change.
  const previewKindRef = useRef<string | null>(null);

  function isOutsideSideZones() {
    const left = x.get();
    const right = left + window.size.width;
    return (
      left > SNAP_SIDE_TRIGGER && right < viewportWidth - SNAP_SIDE_TRIGGER
    );
  }

  // Snap target for the current pointer/window position (gated like the release).
  function currentSnapTarget(pointerY: number) {
    const snap = computeSnap({
      pointerY,
      windowX: x.get(),
      windowWidth: window.size.width,
      viewportWidth,
      viewportHeight,
      topInset: WORKAREA_TOP_INSET,
      // Snapped windows fill flush to the viewport bottom (over the dock).
      bottomInset: 0,
      topThreshold: SNAP_EDGE_THRESHOLD,
      sideInset: SNAP_SIDE_TRIGGER,
    });
    const isSide = snap?.kind === "left" || snap?.kind === "right";
    return snap && (!isSide || canSideSnapRef.current) ? snap : null;
  }

  function updatePreview(target: ReturnType<typeof currentSnapTarget>) {
    const kind = target?.kind ?? null;
    if (kind !== previewKindRef.current) {
      previewKindRef.current = kind;
      setSnapPreview(target);
    }
  }

  function handleDragStart() {
    // Lock side-snap until the window clears the zones (set in handleDrag).
    canSideSnapRef.current = isOutsideSideZones();
    updatePreview(null);
  }

  function handleDrag(_event: PointerEvent, info: PanInfo) {
    if (isOutsideSideZones()) canSideSnapRef.current = true;
    updatePreview(currentSnapTarget(info.point.y));
  }

  // Aero-style edge snapping evaluated at drag release.
  function handleDragEnd(_event: PointerEvent, info: PanInfo) {
    updatePreview(null);

    // A maximized window isn't a snap candidate (its left edge sits at 0).
    if (window.isMaximized) return;

    const snap = currentSnapTarget(info.point.y);

    if (!snap) {
      setWindowPosition(window.id, x.get(), y.get());
      return;
    }

    const transition = {
      duration: prefersReducedMotion ? 0 : 0.18,
      ease: "easeOut" as const,
    };
    setIsAnimating(true);

    if (snap.kind === "maximize") {
      // Persist the dragged spot (clamped to the work area) so restore always
      // returns to an on-screen position, then maximize.
      const restoreX = Math.min(
        Math.max(0, x.get()),
        Math.max(0, viewportWidth - window.size.width),
      );
      const restoreY = Math.min(
        Math.max(WORKAREA_TOP_INSET, y.get()),
        Math.max(
          WORKAREA_TOP_INSET,
          viewportHeight - WORKAREA_BOTTOM_INSET - window.size.height,
        ),
      );
      setWindowPosition(window.id, restoreX, restoreY);
      maximizeWindow(window.id);
      setWindowSize(window.id, viewportWidth, viewportHeight);
      Promise.all([
        animate(x, 0, transition),
        animate(y, 0, transition),
        animate(mvWidth, viewportWidth, transition),
        animate(mvHeight, viewportHeight, transition),
        animate(mvRadius, 0, transition),
      ]).then(() => setIsAnimating(false));
      return;
    }

    // Left / right half-screen snap (fills the work-area height; snapWindow
    // marks it snapped so the 90dvh cap below doesn't clip it).
    Promise.all([
      animate(x, snap.x, transition),
      animate(y, snap.y, transition),
      animate(mvWidth, snap.width, transition),
      animate(mvHeight, snap.height, transition),
      animate(mvRadius, 8, transition),
    ]).then(() => {
      snapWindow(window.id, snap);
      setIsAnimating(false);
    });
  }

  const windowStyles: CSSProperties = {
    zIndex: window?.zIndex,
    pointerEvents: window?.isMinimized ? "none" : undefined,
    maxHeight:
      isMobile || isAnimating || window.isMaximized || window.isSnapped
        ? undefined
        : "90dvh",
  };

  const getWindowAnimations = () => {
    if (window.isMinimized) {
      // Reduced motion: fade out in place instead of flying to the taskbar.
      if (prefersReducedMotion) return { opacity: 0 };
      // Shrink + fade; x/y fly to the dropdown imperatively (effect above), and
      // transform-origin (top-left) collapses the window into the anchor. Opacity
      // finishes early so it vanishes a few px shy of the button.
      return {
        opacity: 0,
        scale: 0.02,
        transition: {
          default: { duration: 0.34, ease: MINIMIZE_EASE },
          opacity: { duration: 0.22, ease: "easeIn" },
        },
      };
    }

    return {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: MINIMIZE_EASE },
    };
  };

  return (
    <motion.div
      ref={windowRef}
      role="dialog"
      aria-label={windowTitle}
      tabIndex={-1}
      style={{
        ...windowStyles,
        x,
        y,
        width: mvWidth,
        height: mvHeight,
        borderRadius: mvRadius,
      }}
      onPointerDown={handleWindowClick}
      drag={!window.isMaximized && !isMobile}
      dragControls={dragControls}
      dragElastic={0.1}
      dragListener={false}
      dragConstraints={{
        top: -containerTop,
        left: -containerLeft,
        right: width - window.size.width - containerLeft,
        bottom: height - window.size.height - containerTop,
      }}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: window.isMaximized ? 1 : 1.02,
        boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
      }}
      initial={
        prefersReducedMotion
          ? { opacity: 0, x: window.position.x, y: window.position.y }
          : {
              opacity: 0,
              scale: 0.95,
              x: window.position.x,
              y: window.position.y,
            }
      }
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      animate={getWindowAnimations()}
      className={`absolute bg-popover text-popover-foreground grid grid-rows-[auto_1fr] overflow-hidden border shadow-lg ${
        window.isMaximized ? "shadow-2xl" : ""
      } ${snapSide === "left" ? "rounded-l-none!" : ""} ${
        snapSide === "right" ? "rounded-r-none!" : ""
      }`}
    >
      <WindowHeader
        window={window}
        windowTitle={windowTitle}
        setIsAnimating={setIsAnimating}
        x={x}
        y={y}
        mvWidth={mvWidth}
        mvHeight={mvHeight}
        mvRadius={mvRadius}
        dragControls={dragControls}
        isMobile={isMobile}
      />

      {window.showTabs ? (
        <TabbedWindow window={window} />
      ) : (
        <div className="flex overflow-auto">
          <WindowContent
            iconId={activeTab}
            parentId={window.parentId}
            windowId={window.id}
          />
        </div>
      )}

      <ResizeHandles
        x={x}
        y={y}
        mvWidth={mvWidth}
        mvHeight={mvHeight}
        window={window}
        isMobile={isMobile}
        enabled={resizeEnabled}
      />
    </motion.div>
  );
}
