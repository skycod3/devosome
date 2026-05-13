// Boot screen configuration
// Adjust these values to tune timing and content without touching the component.

// ── Timing ────────────────────────────────────────────────────────────────────

/** Delay before the first BIOS line appears (ms) */
export const BOOT_BIOS_INITIAL_DELAY = 300;

/** Delay between each subsequent BIOS line (ms) */
export const BOOT_BIOS_LINE_DELAY = 140;

/** Pause after the last BIOS line before kernel phase begins (ms) */
export const BOOT_BIOS_TO_KERNEL_DELAY = 400;

/** Minimum delay between kernel log lines — prevents boot from flying by on fast connections (ms) */
export const BOOT_KERNEL_MIN_LINE_DELAY = 380;

/** Pause after the last kernel line before fade-out starts (ms) */
export const BOOT_BEFORE_FADEOUT_DELAY = 200;

/** Interval between each countdown tick — 3, 2, 1 (ms) */
export const BOOT_COUNTDOWN_INTERVAL = 800;

/** GSAP fade-out duration (seconds) */
export const BOOT_FADEOUT_DURATION = 0.7;

// ── BIOS text ─────────────────────────────────────────────────────────────────

export const BOOT_BIOS_LINES = [
  "DevOSome BIOS v2.6.1  (C) 2025 Jean Medeiros",
  " ",
  "CPU  : AMD Ryzen from the Dead @ 3.2GHz    [OK]",
  "RAM  : 16384 MB                            [OK]",
  "STORE: /dev/portfolio  238 GB SSD          [OK]",
  "GPU  : Creative Renderer v4.2              [OK]",
  " ",
  "Booting devosome-linux 6.1.0...",
];

// ── Kernel log lines ──────────────────────────────────────────────────────────

/** Lines shown before asset preload begins */
export const BOOT_KERNEL_LEADING_LINES = [
  "Initializing kernel subsystems",
  "Mounting root filesystem",
  "Starting system services",
];

/** Lines shown after all assets have been preloaded */
export const BOOT_KERNEL_TRAILING_LINES = [
  "Starting window manager",
  "Loading portfolio data",
  "All services started successfully",
];

/** Label shown in the kernel log for wallpaper preload */
export const BOOT_WALLPAPER_LABEL = "Loading wallpapers";

/** Label shown in the kernel log for audio sprite preload */
export const BOOT_AUDIO_LABEL = "Starting audio subsystem";
