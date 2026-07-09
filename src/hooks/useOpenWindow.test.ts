// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWindowsStore } from "@/stores/windows-store";
import { useOpenWindow } from "./useOpenWindow";
import { BASE_Z_INDEX } from "@/constants/windows";

beforeEach(() => {
  useWindowsStore.setState({
    windows: [],
    activeWindowId: null,
    highestZIndex: BASE_Z_INDEX,
    snapPreview: null,
  });
});

describe("useOpenWindow", () => {
  it("opens a new window and registers it in the store", () => {
    const { result } = renderHook(() => useOpenWindow());
    act(() => {
      result.current("terminal", "", "Terminal", "");
    });
    const { windows } = useWindowsStore.getState();
    expect(windows).toHaveLength(1);
    expect(windows[0].iconId).toBe("terminal");
  });
});
