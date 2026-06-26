import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Runs for every test file. The DOM-only bits are guarded so the node-env
// suites (lib/store) are unaffected.
afterEach(() => {
  if (typeof document !== "undefined") {
    cleanup();
  }
});

// jsdom doesn't implement scrollIntoView; components that call it (e.g.
// Spotlight's active-option scroll) would otherwise throw in component tests.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom exposes `CSS` but not `CSS.supports`, which `utils/css-supports` calls
// at module load. Stub it so importing components doesn't throw.
if (typeof CSS !== "undefined" && typeof CSS.supports !== "function") {
  CSS.supports = () => false;
}
