export interface CascadeParams {
  /** Cascade index — typically the number of windows already open. */
  index: number;
  /** Pixels offset per step (down-right). */
  step: number;
  /** Upper bound on cascade slots, so the block stays reasonably centered. */
  maxSlots: number;
  windowWidth: number;
  windowHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  /** Work-area insets (taskbar at top, dock at bottom). */
  topInset: number;
  bottomInset: number;
}

/**
 * Windows-style diagonal cascade, kept on screen.
 *
 * Each window is offset down-right by `index * step`. Once the next window
 * would leave the work area (vertical room is the binding axis here), the
 * cascade **wraps back up** to the start and resumes — the classic Windows
 * "Cascade windows" behavior. The whole block is centered in the work area.
 */
export function computeCascadePosition(p: CascadeParams): {
  x: number;
  y: number;
} {
  const workHeight = p.viewportHeight - p.topInset - p.bottomInset;

  // Largest diagonal offset that still keeps the window inside the work area.
  const maxBlock = Math.max(
    0,
    Math.min(p.viewportWidth - p.windowWidth, workHeight - p.windowHeight),
  );

  // Diagonal slots that fit, capped so the centered block doesn't drift far.
  const fit = Math.floor(maxBlock / p.step) + 1;
  const slots = Math.max(1, Math.min(p.maxSlots, fit));

  const k = p.index % slots;
  const span = (slots - 1) * p.step;

  // Center the cascade block within the work area.
  const startX = (p.viewportWidth - p.windowWidth) / 2 - span / 2;
  const startY = p.topInset + (workHeight - p.windowHeight) / 2 - span / 2;

  return {
    x: Math.round(startX + k * p.step),
    y: Math.round(startY + k * p.step),
  };
}
