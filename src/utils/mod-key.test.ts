// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { getModKeyLabel } from "@/utils/mod-key";

describe("getModKeyLabel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ⌘ on macOS platforms", () => {
    vi.stubGlobal("navigator", { platform: "MacIntel", userAgent: "" });
    expect(getModKeyLabel()).toBe("⌘");
  });

  it("returns Ctrl on non-mac platforms", () => {
    vi.stubGlobal("navigator", { platform: "Win32", userAgent: "" });
    expect(getModKeyLabel()).toBe("Ctrl");
  });
});
