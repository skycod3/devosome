"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useSettingsStore } from "@/stores/settings-store";
import { isSafariMobile } from "@/utils/browser";
// prettier-ignore
import { BOOT_BIOS_INITIAL_DELAY, BOOT_BIOS_LINE_DELAY, BOOT_BIOS_LINES, BOOT_BIOS_TO_KERNEL_DELAY, BOOT_BEFORE_FADEOUT_DELAY, BOOT_COUNTDOWN_INTERVAL, BOOT_FADEOUT_DURATION, BOOT_KERNEL_LEADING_LINES, BOOT_KERNEL_MIN_LINE_DELAY, BOOT_KERNEL_TRAILING_LINES, BOOT_WALLPAPER_LABEL, BOOT_AUDIO_LABEL } from "@/constants/boot";
import { Z_BOOT_SCREEN } from "@/constants/windows";

type BootScreenProps = {
  onComplete: () => void;
};

// Minimum ms to display each kernel line (keeps boot from flying by on fast connections)
function formatKernelTime(ms: number): string {
  const s = (ms / 1000).toFixed(6);
  return `[${s.padStart(11, " ")}]`;
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // never block on failure
    img.src = url;
  });
}

function preloadAudio(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => resolve();
    audio.src = url;
  });
}

const BIOS_LINES = BOOT_BIOS_LINES;

export function BootScreen({ onComplete }: BootScreenProps) {
  const { wallpaper } = useSettingsStore();
  const preloadAssets: {
    url: string;
    label: string;
    preload?: (url: string) => Promise<void>;
  }[] = [
    { url: `/wallpapers/${wallpaper}`, label: BOOT_WALLPAPER_LABEL },
    // Safari Mobile never fires canplaythrough without prior user interaction,
    // so audio preload would hang the boot indefinitely on iOS Safari.
    ...(!isSafariMobile()
      ? [
          {
            url: "/sounds/ui-sounds.mp3",
            label: BOOT_AUDIO_LABEL,
            preload: preloadAudio,
          },
        ]
      : []),
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const kernelListRef = useRef<HTMLDivElement>(null);
  const [biosLines, setBiosLines] = useState<string[]>([]);
  const [kernelLines, setKernelLines] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<HTMLSpanElement>(null);
  const startTimeRef = useRef<number>(0);

  // Append a kernel line and animate it in
  const appendKernelLine = (line: string) => {
    setKernelLines((prev) => [...prev, line]);
  };

  useEffect(() => {
    startTimeRef.current = performance.now();
    let cancelled = false;

    async function run() {
      // ── Phase 1: BIOS lines ───────────────────────────────────────────────
      for (let i = 0; i < BIOS_LINES.length; i++) {
        if (cancelled) return;
        await delay(i === 0 ? BOOT_BIOS_INITIAL_DELAY : BOOT_BIOS_LINE_DELAY);
        setBiosLines((prev) => [...prev, BIOS_LINES[i]]);
      }

      await delay(BOOT_BIOS_TO_KERNEL_DELAY);
      if (cancelled) return;

      // ── Phase 2: Kernel lines + real preload ─────────────────────────────
      const elapsed = () => performance.now() - startTimeRef.current;

      // Kick off all preloads immediately (in parallel)
      const preloadPromises = preloadAssets.map((a) => ({
        ...a,
        promise: (a.preload ?? preloadImage)(a.url),
      }));

      // Fixed leading lines before asset-driven ones
      const fixedLeading = BOOT_KERNEL_LEADING_LINES.map((label) => ({
        label,
      }));

      for (const line of fixedLeading) {
        if (cancelled) return;
        await delay(BOOT_KERNEL_MIN_LINE_DELAY);
        appendKernelLine(
          `${formatKernelTime(elapsed())}  ${line.label.padEnd(42)} [  OK  ]`,
        );
      }

      // Deduplicate labels so wallpapers show as one "Loading wallpapers" line
      const seen = new Set<string>();
      const uniqueAssets = preloadPromises.filter((a) => {
        if (seen.has(a.label)) return false;
        seen.add(a.label);
        return true;
      });

      // For each unique label, wait for ALL assets with that label + min delay
      const labelGroups = new Map<string, (typeof preloadPromises)[number][]>();
      for (const a of preloadPromises) {
        if (!labelGroups.has(a.label)) labelGroups.set(a.label, []);
        labelGroups.get(a.label)!.push(a);
      }

      for (const asset of uniqueAssets) {
        if (cancelled) return;
        const group = labelGroups.get(asset.label)!;
        const lineStart = performance.now();
        await Promise.all(group.map((a) => a.promise));
        const spent = performance.now() - lineStart;
        if (spent < BOOT_KERNEL_MIN_LINE_DELAY)
          await delay(BOOT_KERNEL_MIN_LINE_DELAY - spent);
        appendKernelLine(
          `${formatKernelTime(elapsed())}  ${asset.label.padEnd(42)} [  OK  ]`,
        );
      }

      // Fixed trailing lines
      const fixedTrailing = BOOT_KERNEL_TRAILING_LINES.map((label) => ({
        label,
      }));

      for (const line of fixedTrailing) {
        if (cancelled) return;
        await delay(BOOT_KERNEL_MIN_LINE_DELAY);
        appendKernelLine(
          `${formatKernelTime(elapsed())}  ${line.label.padEnd(42)} [  OK  ]`,
        );
      }

      await delay(BOOT_BEFORE_FADEOUT_DELAY);
      if (cancelled) return;

      // ── Phase 3: Countdown 3 → 2 → 1 ────────────────────────────────────
      for (let n = 3; n >= 1; n--) {
        if (cancelled) return;
        setCountdown(n);
        await delay(BOOT_COUNTDOWN_INTERVAL);
      }
      if (cancelled) return;

      // ── Phase 4: Fade out ─────────────────────────────────────────────────
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: BOOT_FADEOUT_DURATION,
        ease: "power2.inOut",
        onComplete,
      });
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  // Animate each new kernel line in
  useEffect(() => {
    if (!kernelListRef.current) return;
    const children = kernelListRef.current.children;
    const last = children[children.length - 1] as HTMLElement | undefined;
    if (!last) return;
    gsap.fromTo(
      last,
      { opacity: 0, x: -6 },
      { opacity: 1, x: 0, duration: 0.18, ease: "power1.out" },
    );
    // Auto-scroll
    last.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [kernelLines]);

  // Animate countdown number on each tick
  useEffect(() => {
    if (countdown === null || !countdownRef.current) return;
    gsap.fromTo(
      countdownRef.current,
      { opacity: 0, scale: 1.6 },
      { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" },
    );
  }, [countdown]);

  // Animate each BIOS line in
  const biosRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const el = biosRefs.current[biosLines.length - 1];
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0 },
      { opacity: 1, duration: 0.12, ease: "none" },
    );
  }, [biosLines]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ zIndex: Z_BOOT_SCREEN }}
    >
      <div className="h-full overflow-y-auto p-6 text-xs sm:text-sm leading-relaxed [&::-webkit-scrollbar]:hidden">
        {/* BIOS section */}
        {biosLines.map((line, i) => (
          <div
            key={`bios-${i}`}
            ref={(el) => {
              biosRefs.current[i] = el;
            }}
            className="whitespace-pre text-gray-300 opacity-0"
          >
            {line}
          </div>
        ))}

        {/* Kernel section */}
        {kernelLines.length > 0 && (
          <div ref={kernelListRef} className="mt-3">
            {kernelLines.map((line, i) => (
              <div
                key={`kernel-${i}`}
                className="whitespace-pre text-green-400 opacity-0"
              >
                {line}
              </div>
            ))}
          </div>
        )}

        {/* Countdown */}
        {countdown !== null && (
          <div className="mt-4 text-yellow-400 whitespace-pre">
            Compiling excuses... done. Launching in{" "}
            <span ref={countdownRef} className="inline-block font-bold">
              {countdown}
            </span>
            ...
          </div>
        )}

        {/* Blinking cursor */}
        {countdown === null && (
          <span className="inline-block w-2 h-[1em] bg-green-400 animate-pulse align-middle ml-0.5" />
        )}
      </div>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
