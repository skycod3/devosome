import { describe, expect, it } from "vitest";
import { computeCascadePosition, type CascadeParams } from "./cascade";

// 1600×1200 work area, 800×600 window. With step 30 / maxSlots 6 the cascade
// block spans 5*30 = 150px and is centered within the work area.
const base: CascadeParams = {
  index: 0,
  step: 30,
  maxSlots: 6,
  windowWidth: 800,
  windowHeight: 600,
  viewportWidth: 1600,
  viewportHeight: 1200,
  topInset: 48,
  bottomInset: 96,
};

// Derived expectations:
//   workHeight = 1200 - 48 - 96 = 1056
//   maxBlock   = min(1600-800, 1056-600) = min(800, 456) = 456 → fit = 16
//   slots      = min(6, 16) = 6 → span = 150
//   startX     = (1600-800)/2 - 75 = 325
//   startY     = 48 + (1056-600)/2 - 75 = 48 + 228 - 75 = 201

describe("computeCascadePosition", () => {
  it("starts the cascade block centered (top-left of the block)", () => {
    expect(computeCascadePosition({ ...base, index: 0 })).toEqual({
      x: 325,
      y: 201,
    });
  });

  it("offsets each subsequent window down-right by step", () => {
    expect(computeCascadePosition({ ...base, index: 1 })).toEqual({
      x: 355,
      y: 231,
    });
    expect(computeCascadePosition({ ...base, index: 2 })).toEqual({
      x: 385,
      y: 261,
    });
  });

  it("wraps back to the start once it reaches maxSlots", () => {
    const first = computeCascadePosition({ ...base, index: 0 });
    const wrapped = computeCascadePosition({ ...base, index: 6 }); // 6 % 6 === 0
    expect(wrapped).toEqual(first);
  });

  it("caps the number of slots (block stays centered on huge viewports)", () => {
    // Lots of physical room, but maxSlots caps it at 6 → index 6 wraps.
    const roomy: CascadeParams = {
      ...base,
      windowWidth: 800,
      windowHeight: 480,
      viewportWidth: 2560,
      viewportHeight: 1440,
    };
    expect(computeCascadePosition({ ...roomy, index: 6 })).toEqual(
      computeCascadePosition({ ...roomy, index: 0 }),
    );
  });

  it("never positions a window outside the work area", () => {
    for (let index = 0; index < 50; index++) {
      const { x, y } = computeCascadePosition({ ...base, index });
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(base.topInset);
      expect(x + base.windowWidth).toBeLessThanOrEqual(base.viewportWidth);
      expect(y + base.windowHeight).toBeLessThanOrEqual(
        base.viewportHeight - base.bottomInset,
      );
    }
  });

  it("falls back to a single centered slot when there is no room to cascade", () => {
    // Window fills the work-area height → only 1 slot → same spot every time.
    const tight: CascadeParams = {
      ...base,
      windowHeight: 1056, // == workHeight
    };
    const a = computeCascadePosition({ ...tight, index: 0 });
    const b = computeCascadePosition({ ...tight, index: 5 });
    expect(b).toEqual(a);
  });
});
