/** ≥1600px viewports */
export const DEFAULT_WINDOW_SIZE = { width: 800, height: 600 };
/** ≥1600px viewports */
export const LARGE_DESKTOP_WINDOW_SIZE = { width: 1200, height: 720 };
/** 1024–1599px viewports */
export const SMALL_DESKTOP_WINDOW_SIZE = { width: 800, height: 480 };
/** 768–1023px viewports */
export const TABLET_WINDOW_SIZE = { width: 600, height: 480 };
export const DEFAULT_WINDOW_POSITION = { x: 100, y: 100 };
export const BASE_Z_INDEX = 10;

/** Pixels each newly opened window is offset (down-right) before the cascade wraps.
 *  Kept small so the diagonal cascade still fits a couple of steps on short
 *  (laptop) viewports where a tall window leaves little vertical room. */
export const CASCADE_STEP = 30;
/** Max cascade slots before wrapping — keeps the centered cascade block from drifting too far. */
export const MAX_CASCADE_SLOTS = 6;
/**
 * Work-area insets used to keep cascading windows on screen.
 * Top = measured taskbar height (windows sit flush below it). Bottom is the
 * cascade's small reserve; windows may overlap the dock. Edge-snapping fills
 * all the way to the viewport bottom (uses a 0 bottom inset).
 */
export const WORKAREA_TOP_INSET = 44;
export const WORKAREA_BOTTOM_INSET = 20;

/** Cursor distance (px) from the top edge that triggers maximize. */
export const SNAP_EDGE_THRESHOLD = 12;
/** How close a window's own edge must get to a side (px) to trigger a half snap. */
export const SNAP_SIDE_TRIGGER = 24;

export const WINDOW_MIN_WIDTH = DEFAULT_WINDOW_SIZE.width;
export const WINDOW_MIN_HEIGHT = DEFAULT_WINDOW_SIZE.height;
export const RESIZE_HANDLE_SIZE = 6;
export const RESIZE_CORNER_SIZE = 12;

/** z-index for the Spotlight modal overlay */
export const Z_SPOTLIGHT = 9997;
/** z-index for the boot screen overlay */
export const Z_BOOT_SCREEN = 9999;

/** Label for the Home breadcrumb in window headers */
export const WINDOW_BREADCRUMB_HOME = "Home";
