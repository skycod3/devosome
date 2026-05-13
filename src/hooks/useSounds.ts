"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";

// Sprite map: [offsetMs, durationMs] — generated from public/sounds/ui-sounds.json
// prettier-ignore
const SPRITE_MAP = {
  "click-left":  [0,    465] as [number, number],
  "click-right": [1300, 316] as [number, number],
  toast:         [2600, 1071] as [number, number],
  notification:  [4900, 4000] as [number, number],
};

type SoundId = keyof typeof SPRITE_MAP;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HowlInstance = any;

export function useSounds() {
  const { soundEnabled } = useSettings();
  const howlRef = useRef<HowlInstance>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    // Dynamic require avoids Next.js App Router SSR parse issues with howler
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Howl, Howler } = require("howler");
    howlRef.current = new Howl({
      src: ["/sounds/ui-sounds.ogg", "/sounds/ui-sounds.mp3"],
      sprite: Object.fromEntries(
        Object.entries(SPRITE_MAP).map(([k, [offset, duration]]) => [
          k,
          [offset, duration],
        ]),
      ),
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
