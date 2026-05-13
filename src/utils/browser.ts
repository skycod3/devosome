/**
 * Returns true when running on Safari for iOS (iPhone/iPad/iPod).
 * Excludes Chrome for iOS (CriOS), Firefox for iOS (FxiOS) and Opera for iOS (OPiOS),
 * which use the WebKit UA string but have different behaviour.
 */
export function isSafariMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iP(hone|ad|od)/.test(ua) &&
    /WebKit/.test(ua) &&
    !/CriOS|FxiOS|OPiOS/.test(ua)
  );
}
