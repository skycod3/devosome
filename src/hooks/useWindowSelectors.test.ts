// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWindowsStore } from "@/stores/windows-store";
import type { Window } from "@/stores/windows-store";
import { useWindow, useWindowIds } from "./useWindowSelectors";
import { BASE_Z_INDEX } from "@/constants/windows";

function makeWindow(id: string): Window {
  return {
    id,
    iconId: id,
    parentId: "",
    title: id,
    icon: "",
    isActive: false,
    isMinimized: false,
    isMaximized: false,
    lastState: "normal",
    position: { x: 10, y: 10 },
    size: { width: 400, height: 300 },
    zIndex: BASE_Z_INDEX + 1,
  };
}

beforeEach(() => {
  useWindowsStore.setState({
    windows: [makeWindow("window-a"), makeWindow("window-b")],
    activeWindowId: null,
    highestZIndex: BASE_Z_INDEX + 2,
    snapPreview: null,
  });
});

describe("useWindow", () => {
  it("returns the window slice and updates when THAT window changes", () => {
    const { result } = renderHook(() => useWindow("window-a"));
    expect(result.current?.position).toEqual({ x: 10, y: 10 });
    act(() => {
      useWindowsStore.getState().setWindowPosition("window-a", 50, 60);
    });
    expect(result.current?.position).toEqual({ x: 50, y: 60 });
  });

  it("does NOT re-render when ANOTHER window changes", () => {
    let renders = 0;
    renderHook(() => {
      renders++;
      return useWindow("window-a");
    });
    expect(renders).toBe(1);
    act(() => {
      useWindowsStore.getState().setWindowPosition("window-b", 1, 1);
    });
    expect(renders).toBe(1);
  });
});

describe("useWindowIds", () => {
  it("does NOT re-render when only a position changes (id list stays shallow-equal)", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useWindowIds();
    });
    expect(result.current).toEqual(["window-a", "window-b"]);
    expect(renders).toBe(1);
    act(() => {
      useWindowsStore.getState().setWindowPosition("window-a", 7, 7);
    });
    expect(renders).toBe(1);
    act(() => {
      useWindowsStore.getState().closeWindow("window-a");
    });
    expect(result.current).toEqual(["window-b"]);
    expect(renders).toBe(2);
  });
});
