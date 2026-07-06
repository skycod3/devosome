/**
 * Label for the primary modifier key used in shortcuts:
 * "⌘" on macOS, "Ctrl" everywhere else. Client-side only — returns "Ctrl"
 * during SSR (no `navigator`), which is hydration-safe for the common case.
 */
export function getModKeyLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl";
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ??
    navigator.platform ??
    navigator.userAgent ??
    "";
  return /mac/i.test(platform) ? "⌘" : "Ctrl";
}
