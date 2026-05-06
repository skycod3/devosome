"use client";

import Image from "next/image";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  PiPlay,
  PiPause,
  PiStop,
  PiPlayThin,
  PiPauseThin,
} from "react-icons/pi";

import { VIDEO_FILES } from "@/constants/video-files";
import { AUDIO_FILES } from "@/constants/audio-files";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaPlayerProps {
  iconId: string;
  mediaType: "video" | "audio";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaPlayer({ iconId, mediaType }: MediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const src =
    mediaType === "video"
      ? VIDEO_FILES[iconId]?.video
      : AUDIO_FILES[iconId]?.audio;

  const coverImage =
    mediaType === "audio" ? AUDIO_FILES[iconId]?.icon : undefined;

  // ─── Sync state with native events ─────────────────────────────────────────

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => setDuration(el.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  // ─── Controls ──────────────────────────────────────────────────────────────

  const handlePlayPause = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
    } else {
      el.pause();
    }
  }, []);

  const handleStop = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const el = mediaRef.current;
    if (!el) return;
    el.currentTime = Number(e.target.value);
    setCurrentTime(Number(e.target.value));
  }, []);

  // ─── No source guard ───────────────────────────────────────────────────────

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Media file not found: {iconId}</p>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col size-full bg-black/5">
      {/* ── Media area ── */}
      <div className="group relative flex-1 overflow-hidden bg-black flex-center">
        {mediaType === "video" ? (
          <video
            ref={mediaRef}
            src={src}
            preload="metadata"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          coverImage && (
            <Image
              src={coverImage}
              alt={AUDIO_FILES[iconId]?.title ?? ""}
              className="h-full object-contain select-none"
              sizes="192px"
              priority
              draggable={false}
            />
          )
        )}
        {/* Hidden audio element for audio mode */}
        {mediaType === "audio" && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio ref={mediaRef} src={src} preload="metadata" />
        )}

        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 grid place-items-center`}
        >
          <button onClick={handlePlayPause}>
            {isPlaying ? (
              <PiPauseThin className="size-20 text-white" />
            ) : (
              <PiPlayThin className="size-20 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="grid p-3 shrink-0">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 accent-primary cursor-pointer"
          aria-label="Seek"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-popover/80 px-3 py-2 backdrop-blur-sm text-sm">
        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePlayPause}
            className="rounded p-1.5 hover:bg-accent transition"
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <PiPause className="size-4" />
            ) : (
              <PiPlay className="size-4" />
            )}
          </button>
          <button
            onClick={handleStop}
            className="rounded p-1.5 hover:bg-accent transition"
            aria-label="Stop"
            title="Stop"
          >
            <PiStop className="size-4" />
          </button>
        </div>

        {/* Time */}
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
