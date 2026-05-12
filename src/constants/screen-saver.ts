// Screen Saver configuration
// Adjust these values to tune behavior without touching the component.

// ── Idle detection ────────────────────────────────────────────────────────────

/** Time without interaction before the screen saver activates (ms) */
export const SCREENSAVER_IDLE_TIMEOUT = 1000 * 60 * 2; // 2 minutes

/** Events that reset the idle timer and dismiss the screen saver */
export const SCREENSAVER_WAKE_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "wheel",
];

// ── Model ─────────────────────────────────────────────────────────────────────

/** Path to the Collada (.dae) model */
export const SCREENSAVER_MODEL_URL = "/models/stormtrooper.dae";

/** Index of the animation clip to play (0 = first clip) */
export const SCREENSAVER_ANIMATION_INDEX = 0;

/** Slow continuous Y-axis rotation applied on top of the built-in animation (radians/s). Set to 0 to disable. */
export const SCREENSAVER_ROTATION_SPEED = 0;

// ── Camera ────────────────────────────────────────────────────────────────────

/** Camera vertical field of view (degrees) */
export const SCREENSAVER_CAMERA_FOV = 25;

/** Camera position — [x, y, z] */
export const SCREENSAVER_CAMERA_POSITION: [number, number, number] = [
  15, 15, -15,
];

/** Point the camera looks at — [x, y, z] */
export const SCREENSAVER_CAMERA_TARGET: [number, number, number] = [0, 2, 0];

/** Camera near clipping plane */
export const SCREENSAVER_CAMERA_NEAR = 1;

/** Camera far clipping plane */
export const SCREENSAVER_CAMERA_FAR = 1000;

// ── Scene ─────────────────────────────────────────────────────────────────────

/** Background color of the Three.js scene (hex) */
export const SCREENSAVER_BG_COLOR = 0x000000;

/** Ambient light intensity */
export const SCREENSAVER_AMBIENT_INTENSITY = 2.5;

/** Directional light intensity */
export const SCREENSAVER_DIR_LIGHT_INTENSITY = 3;

/** Directional light position — [x, y, z] */
export const SCREENSAVER_DIR_LIGHT_POSITION: [number, number, number] = [
  1.5, 1, -1.5,
];

// ── Transition ────────────────────────────────────────────────────────────────

/** GSAP fade-in duration when screen saver appears (seconds) */
export const SCREENSAVER_FADEIN_DURATION = 0.6;
