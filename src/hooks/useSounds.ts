"use client";

import { useEffect, useRef } from "react";
import type { Howl as HowlType } from "howler";
import { useSettings } from "@/hooks/useSettings";

// Sprite map: [offsetMs, durationMs] — generated from public/sounds/ui-sounds.json
const SPRITE_MAP = {
  "click-left": [0, 465],
  "click-right": [1300, 316],
  toast: [2600, 1071],
  notification: [4900, 4000],
} satisfies Record<string, [number, number]>;

type SoundId = keyof typeof SPRITE_MAP;

export function useSounds() {
  const { soundEnabled } = useSettings();
  const howlRef = useRef<HowlType | null>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    // Dynamic require avoids Next.js App Router SSR parse issues with howler
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Howl, Howler } = require("howler");
    howlRef.current = new Howl({
      src: ["/sounds/ui-sounds.ogg", "/sounds/ui-sounds.mp3"],
      sprite: SPRITE_MAP,
      volume: 0.5,
    });

    // Howler unlocks the AudioContext on first user interaction.
    // Poll until it transitions from "suspended" to "running".
    const ctx: AudioContext | undefined = Howler.ctx;
    if (!ctx || ctx.state === "running") {
      unlockedRef.current = true;
    } else {
      const onStateChange = () => {
        if (ctx.state === "running") {
          unlockedRef.current = true;
          ctx.removeEventListener("statechange", onStateChange);
        }
      };
      ctx.addEventListener("statechange", onStateChange);
    }
  }, []);

  function makePlayer(id: SoundId) {
    return () => {
      if (!soundEnabled || !unlockedRef.current) return;
      howlRef.current?.play(id);
    };
  }

  return {
    playClickLeft: makePlayer("click-left"),
    playClickRight: makePlayer("click-right"),
    playToast: makePlayer("toast"),
    playNotification: makePlayer("notification"),
  };
}
