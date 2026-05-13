export const supportsRelativeColors =
  typeof CSS !== "undefined" &&
  CSS.supports("color", "color-mix(in oklab, red, blue)");
