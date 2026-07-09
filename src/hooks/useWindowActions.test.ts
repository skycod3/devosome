// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWindowsStore } from "@/stores/windows-store";
import type { Window } from "@/stores/windows-store";
import { useWindowActions } from "./useWindowActions";
import { BASE_Z_INDEX } from "@/constants/windows";

function makeWindow(id: string): Window {
  return {
    id,
    iconId: id,
    parentId: "",
    title: id,
    icon: "",
    isActive: true,
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
    windows: [makeWindow("window-a")],
    activeWindowId: "window-a",
    highestZIndex: BASE_Z_INDEX + 1,
    snapPreview: null,
  });
});

describe("useWindowActions", () => {
  it("exposes actions with stable references and does NOT re-render when a window field changes", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useWindowActions();
    });
    const firstSetPosition = result.current.setWindowPosition;
    expect(renders).toBe(1);
    act(() => {
      useWindowsStore.getState().setWindowPosition("window-a", 99, 99);
    });
    expect(renders).toBe(1);
    expect(result.current.setWindowPosition).toBe(firstSetPosition);
  });
});
