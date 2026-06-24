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
 * Windows-style cascade placement, kept on screen.
 *
 * Windows are offset down-right by `index * step`, wrapping back to the start
 * once the cascade would leave the work area. The whole cascade **block** is
 * centered within the work area, so the cluster stays visually balanced while
 * each window still lands in a distinct spot (fixes "always the same place"
 * when a tall window leaves no room to cascade from the exact center).
 */
export function computeCascadePosition(p: CascadeParams): {
  x: number;
  y: number;
} {
  const workHeight = p.viewportHeight - p.topInset - p.bottomInset;

  // Largest square offset that keeps the window inside the work area.
  const maxBlock = Math.max(
    0,
    Math.min(p.viewportWidth - p.windowWidth, workHeight - p.windowHeight),
  );

  // Slots that physically fit, capped so the block doesn't drift too far.
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
