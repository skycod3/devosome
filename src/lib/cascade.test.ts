import { describe, expect, it } from "vitest";
import { computeCascadePosition, type CascadeParams } from "./cascade";

// 1600×1200 work area, 800×600 window, step 16, maxSlots 6 → diagonal cascade,
// block spans 5*16 = 80px, centered in the work area.
const base: CascadeParams = {
  index: 0,
  step: 16,
  maxSlots: 6,
  windowWidth: 800,
  windowHeight: 600,
  viewportWidth: 1600,
  viewportHeight: 1200,
  topInset: 48,
  bottomInset: 96,
};

// Derived:
//   workHeight = 1056, slots = 6, span = 80
//   startX = (1600-800)/2 - 40 = 360
//   startY = 48 + (1056-600)/2 - 40 = 236

describe("computeCascadePosition", () => {
  it("starts the cascade block centered", () => {
    expect(computeCascadePosition({ ...base, index: 0 })).toEqual({
      x: 360,
      y: 236,
    });
  });

  it("cascades diagonally (both axes step together)", () => {
    expect(computeCascadePosition({ ...base, index: 1 })).toEqual({
      x: 376,
      y: 252,
    });
    expect(computeCascadePosition({ ...base, index: 2 })).toEqual({
      x: 392,
      y: 268,
    });
  });

  it("wraps back up to the start once it reaches maxSlots", () => {
    const first = computeCascadePosition({ ...base, index: 0 });
    const wrapped = computeCascadePosition({ ...base, index: 6 }); // 6 % 6 === 0
    expect(wrapped).toEqual(first);
  });

  it("caps the number of slots on huge viewports", () => {
    const roomy: CascadeParams = {
      ...base,
      windowHeight: 480,
      viewportWidth: 2560,
      viewportHeight: 1440,
    };
    expect(computeCascadePosition({ ...roomy, index: 6 })).toEqual(
      computeCascadePosition({ ...roomy, index: 0 }),
    );
  });

  it("still cascades diagonally on a short laptop viewport (dock overlap allowed)", () => {
    // Real case: 1360×599 inner, 800×480 window, small bottom inset (dock may be
    // overlapped) → vertical room = 51 → 4 diagonal slots.
    const laptop: CascadeParams = {
      ...base,
      windowWidth: 800,
      windowHeight: 480,
      viewportWidth: 1360,
      viewportHeight: 599,
      bottomInset: 20,
    };
    const p = (i: number) => computeCascadePosition({ ...laptop, index: i });

    expect(p(1).x).toBe(p(0).x + 16);
    expect(p(1).y).toBe(p(0).y + 16); // diagonal
    expect(p(2).x).toBe(p(0).x + 32);
    expect(p(2).y).toBe(p(0).y + 32);
    expect(p(4)).toEqual(p(0)); // wraps back up after 4 slots
  });

  it("never positions a window outside the work area", () => {
    const viewports = [
      base,
      {
        ...base,
        viewportWidth: 1360,
        viewportHeight: 599,
        windowHeight: 480,
        bottomInset: 20,
      },
    ];
    for (const v of viewports) {
      for (let index = 0; index < 50; index++) {
        const { x, y } = computeCascadePosition({ ...v, index });
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(v.topInset);
        expect(x + v.windowWidth).toBeLessThanOrEqual(v.viewportWidth);
        expect(y + v.windowHeight).toBeLessThanOrEqual(
          v.viewportHeight - v.bottomInset,
        );
      }
    }
  });

  it("falls back to a single slot only when there is no room on either axis", () => {
    const full: CascadeParams = {
      ...base,
      windowWidth: 1600, // == viewportWidth
      windowHeight: 1056, // == workHeight
    };
    expect(computeCascadePosition({ ...full, index: 5 })).toEqual(
      computeCascadePosition({ ...full, index: 0 }),
    );
  });
});
