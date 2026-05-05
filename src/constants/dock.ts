// ─── Layout ───────────────────────────────────────────────────────────────────

export const DOCK_HEIGHT = 50;
export const DOCK_OFFSET_BOTTOM = 20;

// ─── Item size & magnification ────────────────────────────────────────────────

/** Base size of each dock item in px. */
export const DOCK_BASE_ITEM_SIZE = 48;

/** Max size of a dock item at the peak of the magnification effect in px. */
export const DOCK_MAGNIFICATION = 70;

/** Mouse influence radius for the magnification effect in px. */
export const DOCK_DISTANCE = 200;

// ─── Spring animation ─────────────────────────────────────────────────────────

/** Spring mass — higher = more inertia. */
export const DOCK_SPRING_MASS = 0.1;

/** Spring stiffness — higher = snappier response. */
export const DOCK_SPRING_STIFFNESS = 80;

/** Spring damping — lower = more bounce. */
export const DOCK_SPRING_DAMPING = 6;

// ─── Label animation ──────────────────────────────────────────────────────────

/** Fade-in/out duration of the item tooltip label in seconds. */
export const DOCK_LABEL_ANIMATION_DURATION = 0.2;

// ─── Icon ─────────────────────────────────────────────────────────────────────

/** Size of the SVG icon rendered inside each dock item in px. */
export const DOCK_ICON_SIZE = 18;
