// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useIconsStore } from "@/stores/icons-store";
import type { Icon } from "@/stores/icons-store";
import { useIconActions } from "./useIconActions";

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

describe("useIconActions", () => {
  it("exposes actions with stable references and does NOT re-render when an icon field changes", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useIconActions();
    });
    const firstHighlight = result.current.highlightIcon;
    expect(renders).toBe(1);
    act(() => {
      useIconsStore.getState().highlightIcon("a");
    });
    expect(renders).toBe(1);
    expect(result.current.highlightIcon).toBe(firstHighlight);
  });
});
