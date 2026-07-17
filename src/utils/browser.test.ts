// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { isInsecureContext, isSafariMobile } from "@/utils/browser";

const IPHONE_SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Safari/604.1";

describe("isSafariMobile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true for Safari on iPhone", () => {
    vi.stubGlobal("navigator", { userAgent: IPHONE_SAFARI_UA });
    expect(isSafariMobile()).toBe(true);
  });

  it("returns false for Chrome on iOS (CriOS)", () => {
    vi.stubGlobal("navigator", {
      userAgent: IPHONE_SAFARI_UA.replace("Version/15.6", "CriOS/120.0"),
    });
    expect(isSafariMobile()).toBe(false);
  });
});

describe("isInsecureContext", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true when window.isSecureContext is false", () => {
    vi.stubGlobal("window", { isSecureContext: false });
    expect(isInsecureContext()).toBe(true);
  });

  it("returns false when window.isSecureContext is true", () => {
    vi.stubGlobal("window", { isSecureContext: true });
    expect(isInsecureContext()).toBe(false);
  });
});
