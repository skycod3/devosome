"use client";

import Image from "next/image";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  PiPlay,
  PiPause,
  PiStop,
  PiPlayThin,
  PiPauseThin,
  PiSpeakerX,
  PiSpeakerLow,
  PiSpeakerHigh,
  PiArrowsOut,
} from "react-icons/pi";

import { VIDEO_FILES } from "@/constants/video-files";
import { AUDIO_FILES } from "@/constants/audio-files";
import { useWindowIsMinimized } from "@/hooks/useWindowSelectors";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaPlayerProps {
  iconId: string;
  mediaType: "video" | "audio";
  /** Host window id, used to pause playback when the window is minimized. */
  windowId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaPlayer({ iconId, mediaType, windowId }: MediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

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
    const onVolumeChange = () => {
      setVolume(el.volume);
      setIsMuted(el.muted);
    };

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("volumechange", onVolumeChange);

    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("volumechange", onVolumeChange);
    };
  }, []);

  // Focus container on mount so keyboard shortcuts work immediately
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Pause playback while the host window is minimized (audio/video shouldn't keep
  // playing behind a minimized window). Restoring the window leaves it paused —
  // playback only resumes when the user hits play again.
  const isMinimized = useWindowIsMinimized(windowId);
  useEffect(() => {
    if (isMinimized) mediaRef.current?.pause();
  }, [isMinimized]);

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

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const el = mediaRef.current;
      if (!el) return;
      const v = Number(e.target.value);
      el.volume = v;
      el.muted = false;
    },
    [],
  );

  const handleMute = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    el.muted = !el.muted;
  }, []);

  const handleFullscreen = useCallback(() => {
    mediaRef.current?.requestFullscreen();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const el = mediaRef.current;
      if (!el) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          el.currentTime = clamp(el.currentTime - 5, 0, el.duration);
          break;
        case "ArrowRight":
          e.preventDefault();
          el.currentTime = clamp(el.currentTime + 5, 0, el.duration);
          break;
        case "ArrowUp":
          e.preventDefault();
          el.volume = clamp(el.volume + 0.1);
          el.muted = false;
          break;
        case "ArrowDown":
          e.preventDefault();
          el.volume = clamp(el.volume - 0.1);
          break;
        case "m":
        case "M":
          handleMute();
          break;
      }
    },
    [handlePlayPause, handleMute],
  );

  // ─── No source guard ───────────────────────────────────────────────────────

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Media file not found: {iconId}</p>
      </div>
    );
  }

  // ─── Derived ───────────────────────────────────────────────────────────────

  const effectiveVolume = isMuted ? 0 : volume;

  const VolumeIcon =
    effectiveVolume === 0
      ? PiSpeakerX
      : effectiveVolume < 0.5
        ? PiSpeakerLow
        : PiSpeakerHigh;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="flex flex-col size-full bg-black/5 outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
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
          <audio ref={mediaRef} src={src} preload="metadata" />
        )}

        {/* Play/Pause overlay */}
        <button
          onClick={handlePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 grid place-items-center"
        >
          {isPlaying ? (
            <PiPauseThin className="size-20 text-white" />
          ) : (
            <PiPlayThin className="size-20 text-white" />
          )}
        </button>
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
          className="w-full h-1.5 accent-primary"
          aria-label="Seek"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-popover/80 px-3 py-2 backdrop-blur-sm text-sm">
        {/* Left: play controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePlayPause}
            className="rounded p-1.5 hover:bg-accent transition"
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
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

        {/* Center: time */}
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Right: volume + fullscreen */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleMute}
            className="rounded p-1.5 hover:bg-accent transition"
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute (M)" : "Mute (M)"}
          >
            <VolumeIcon className="size-4" />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={effectiveVolume}
            onChange={handleVolumeChange}
            className="w-16 h-1.5 accent-primary"
            aria-label="Volume"
            title="Volume (↑ ↓)"
          />
          {mediaType === "video" && (
            <button
              onClick={handleFullscreen}
              className="rounded p-1.5 hover:bg-accent transition ml-1"
              aria-label="Fullscreen"
              title="Fullscreen"
            >
              <PiArrowsOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
