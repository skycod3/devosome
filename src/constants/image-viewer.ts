// ─── Image Viewer Constants ───────────────────────────────────────────────────
// Tweak these values to adjust the image viewer behavior.

// Zoom
export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 5;
export const ZOOM_STEP = 0.25;
export const ZOOM_WHEEL_FACTOR = 0.001;

// Swipe gesture
/** Minimum horizontal drag distance (px) to trigger navigation */
export const SWIPE_THRESHOLD = 120;
/** Distance (px) the incoming image starts from before sliding in */
export const SWIPE_OUT_DISTANCE = 400;
/** Spring config used when a sub-threshold swipe bounces back to center */
export const SWIPE_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;
