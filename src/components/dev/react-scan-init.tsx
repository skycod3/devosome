"use client";

// Dev-only render profiler powered by react-scan. Intentional tooling — kept in
// the repo for performance work and regression checks. Gated to
// NODE_ENV === "development" and loaded via dynamic import, so it never ships to
// production (react-scan is a devDependency).
//
// Programmatic API exposed on `window` in dev:
//   __scanReset()  — clear collected render stats
//   __scanReport() — array of { name, total, unnecessary, time, phases },
//                    sorted by render count (desc)
// Typical routine: __scanReset() → drive one interaction → __scanReport().
//
// A live toolbar/overlay is enabled via `showToolbar` below (highlights
// re-renders on screen in real time). Flip it to false if it gets noisy.

import { useEffect } from "react";

type Entry = {
  total: number;
  unnecessary: number;
  time: number;
  phases: Record<string, number>;
};

type ScanWindow = Window & {
  __scanStats?: Record<string, Entry>;
  __scanReset?: () => void;
  __scanReport?: () => Array<{ name: string } & Entry>;
};

export function ReactScanInit() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let cancelled = false;

    void import("react-scan").then(({ scan }) => {
      if (cancelled) return;
      const w = window as ScanWindow;
      w.__scanStats = {};
      w.__scanReset = () => {
        w.__scanStats = {};
      };
      w.__scanReport = () =>
        Object.entries(w.__scanStats ?? {})
          .map(([name, s]) => ({ name, ...s }))
          .sort((a, b) => b.total - a.total);

      scan({
        enabled: true,
        log: false,
        showToolbar: true,
        trackUnnecessaryRenders: true,
        onRender: (fiber, renders) => {
          const type = fiber?.type as
            { displayName?: string; name?: string } | string | null | undefined;
          const name =
            typeof type === "string"
              ? type
              : type?.displayName || type?.name || "(anonymous)";

          const store = (w.__scanStats ??= {});
          const entry = (store[name] ??= {
            total: 0,
            unnecessary: 0,
            time: 0,
            phases: {},
          });
          for (const r of renders) {
            const n = r.count ?? 1;
            entry.total += n;
            entry.time += r.time ?? 0;
            if (r.unnecessary) entry.unnecessary += n;
            const phase = String(r.phase ?? "unknown");
            entry.phases[phase] = (entry.phases[phase] ?? 0) + n;
          }
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
