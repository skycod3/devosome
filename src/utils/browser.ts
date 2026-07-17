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

/**
 * Returns true when the page is served over an insecure origin — i.e. not
 * HTTPS and not localhost. Browsers block geolocation (and other powerful
 * APIs) in these contexts, which is the usual cause of a "permission denied"
 * on mobile Safari when the site is opened over http:// on the local network.
 */
export function isInsecureContext(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext === false;
}
