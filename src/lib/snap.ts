export interface SnapInput {
  /** Cursor Y at drag release (viewport-relative) — drives the top→maximize gesture. */
  pointerY: number;
  /** Window left edge (x) at drag release. */
  windowX: number;
  /** Window width. */
  windowWidth: number;
  viewportWidth: number;
  viewportHeight: number;
  /** Work-area insets (taskbar at top, dock/bottom). */
  topInset: number;
  bottomInset: number;
  /** Cursor distance from the top edge that triggers maximize. */
  topThreshold: number;
  /** How close the window's own edge must get to a side to trigger a half snap. */
  sideInset: number;
}

export type SnapTarget =
  | { kind: "maximize" }
  | {
      kind: "left" | "right";
      x: number;
      y: number;
      width: number;
      height: number;
    };

/**
 * Windows Aero-style edge snapping.
 * - cursor near the top edge        → maximize (the grab point sits near the top)
 * - window's LEFT edge near the left  → left half
 * - window's RIGHT edge near the right → right half
 *
 * Side snaps key off the window's own edges (not the cursor) so the window snaps
 * as soon as it bumps the side, instead of forcing the cursor off-screen.
 */
export function computeSnap(p: SnapInput): SnapTarget | null {
  // Top edge → maximize (checked first; the most iconic gesture).
  if (p.pointerY <= p.topInset + p.topThreshold) {
    return { kind: "maximize" };
  }

  const workTop = p.topInset;
  const workHeight = p.viewportHeight - p.topInset - p.bottomInset;
  const halfWidth = Math.round(p.viewportWidth / 2);

  // Window's left edge reached (or nearly reached) the viewport's left.
  if (p.windowX <= p.sideInset) {
    return {
      kind: "left",
      x: 0,
      y: workTop,
      width: halfWidth,
      height: workHeight,
    };
  }

  // Window's right edge reached (or nearly reached) the viewport's right.
  if (p.windowX + p.windowWidth >= p.viewportWidth - p.sideInset) {
    return {
      kind: "right",
      x: p.viewportWidth - halfWidth,
      y: workTop,
      width: halfWidth,
      height: workHeight,
    };
  }

  return null;
}
