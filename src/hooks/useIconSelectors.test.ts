// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useIconsStore } from "@/stores/icons-store";
import type { Icon } from "@/stores/icons-store";
import {
  useIcon,
  useDesktopIconIds,
  useIconIdsByParent,
  useHighlightedIcon,
} from "./useIconSelectors";

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
  useIconsStore.setState({
    icons: [
      makeIcon("d1"),
      makeIcon("d2"),
      makeIcon("f1", { parentId: "folder" }),
    ],
  });
});

describe("useIcon", () => {
  it("returns a single icon slice and does NOT re-render when another icon changes", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useIcon("d1");
    });
    expect(result.current?.id).toBe("d1");
    expect(renders).toBe(1);
    act(() => {
      useIconsStore.getState().highlightIcon("d2");
    });
    expect(renders).toBe(1);
  });
});

describe("useDesktopIconIds", () => {
  it("lists shown desktop icon ids and stays shallow-equal across a highlight", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useDesktopIconIds();
    });
    expect(result.current).toEqual(["d1", "d2"]);
    expect(renders).toBe(1);
    act(() => {
      useIconsStore.getState().highlightIcon("d1");
    });
    expect(renders).toBe(1);
    act(() => {
      useIconsStore.getState().hideIcon("d1");
    });
    expect(result.current).toEqual(["d2"]);
    expect(renders).toBe(2);
  });
});

describe("useIconIdsByParent", () => {
  it("lists a folder's icon ids", () => {
    const { result } = renderHook(() => useIconIdsByParent("folder"));
    expect(result.current).toEqual(["f1"]);
  });
});

describe("useHighlightedIcon", () => {
  it("returns the highlighted icon and updates when highlight moves", () => {
    const { result } = renderHook(() => useHighlightedIcon());
    expect(result.current).toBeUndefined();
    act(() => {
      useIconsStore.getState().highlightIcon("d2");
    });
    expect(result.current?.id).toBe("d2");
  });
});
