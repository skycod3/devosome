import { beforeEach, describe, expect, it } from "vitest";
import { useIconsStore } from "@/stores/icons-store";
import type { Icon } from "@/stores/icons-store";

function makeIcon(id: string, overrides: Partial<Icon> = {}): Icon {
  return {
    id,
    title: id,
    icon: "",
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
    ...overrides,
  };
}

beforeEach(() => {
  useIconsStore.setState({ icons: [makeIcon("a"), makeIcon("b")] });
});

describe("unhighlightAllIcons", () => {
  it("is a no-op (same array reference) when nothing is highlighted", () => {
    const before = useIconsStore.getState().icons;
    useIconsStore.getState().unhighlightAllIcons();
    expect(useIconsStore.getState().icons).toBe(before);
  });

  it("clears highlight when an icon is highlighted", () => {
    useIconsStore.getState().highlightIcon("a");
    const highlighted = useIconsStore.getState().icons;
    useIconsStore.getState().unhighlightAllIcons();
    expect(useIconsStore.getState().icons).not.toBe(highlighted);
    expect(useIconsStore.getState().icons.some((i) => i.isHighlighted)).toBe(
      false,
    );
  });

  it("preserves the reference of icons that were not highlighted", () => {
    useIconsStore.getState().highlightIcon("a");
    const [, bBefore] = useIconsStore.getState().icons; // "b" was never highlighted
    useIconsStore.getState().unhighlightAllIcons();
    const [aAfter, bAfter] = useIconsStore.getState().icons;
    expect(bAfter).toBe(bBefore); // unchanged icon keeps identity
    expect(aAfter.isHighlighted).toBe(false); // changed icon updated
  });
});

describe("unhighlightIcon", () => {
  it("is a no-op (same array reference) when the icon is not highlighted", () => {
    const before = useIconsStore.getState().icons;
    useIconsStore.getState().unhighlightIcon("a");
    expect(useIconsStore.getState().icons).toBe(before);
  });
});
