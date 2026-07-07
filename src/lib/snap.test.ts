import { describe, expect, it } from "vitest";
import { computeSnap, type SnapInput } from "./snap";

// Window (800 wide) sitting in the middle of a 1600×900 viewport — away from
// every edge, cursor away from the top.
const base: SnapInput = {
  pointerY: 400,
  windowX: 400, // left edge at 400, right edge at 1200
  windowWidth: 800,
  viewportWidth: 1600,
  viewportHeight: 900,
  topInset: 44,
  bottomInset: 0,
  topThreshold: 12,
  sideInset: 24,
};

describe("computeSnap", () => {
  it("returns null when the window is away from every edge", () => {
    expect(computeSnap(base)).toBeNull();
  });

  it("maximizes when the cursor reaches the top edge", () => {
    expect(computeSnap({ ...base, pointerY: 50 })).toEqual({
      kind: "maximize",
    });
  });

  it("snaps left when the window's left edge reaches the side", () => {
    expect(computeSnap({ ...base, windowX: 10 })).toEqual({
      kind: "left",
      x: 0,
      y: 44,
      width: 800, // 1600 / 2
      height: 856, // 900 - 44 - 0
    });
  });

  it("snaps right when the window's right edge reaches the side", () => {
    // right edge = windowX + 800; needs >= 1600 - 24 → windowX >= 776
    expect(computeSnap({ ...base, windowX: 790 })).toEqual({
      kind: "right",
      x: 800, // 1600 - 800
      y: 44,
      width: 800,
      height: 856,
    });
  });

  it("triggers a few pixels before the edge (tolerance)", () => {
    // left edge at 24 (== sideInset) still snaps
    expect(computeSnap({ ...base, windowX: 24 })?.kind).toBe("left");
    // but at 25 it does not
    expect(computeSnap({ ...base, windowX: 25 })).toBeNull();
  });
});
