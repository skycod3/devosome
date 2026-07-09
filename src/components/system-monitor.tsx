"use client";

import { useEffect, useState } from "react";
import { useWindowStats } from "@/hooks/useWindowSelectors";
import { Progress } from "@/components/ui/progress";

// ─── Types ────────────────────────────────────────────────────────────────────

type MemoryInfo = {
  used: number;
  limit: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function detectBrowser(ua: string): string {
  if (/Edg\/(\S+)/.test(ua))
    return `Edge ${ua.match(/Edg\/(\S+)/)![1].split(".")[0]}`;
  if (/OPR\/(\S+)/.test(ua))
    return `Opera ${ua.match(/OPR\/(\S+)/)![1].split(".")[0]}`;
  if (/Chrome\/(\S+)/.test(ua))
    return `Chrome ${ua.match(/Chrome\/(\S+)/)![1].split(".")[0]}`;
  if (/Firefox\/(\S+)/.test(ua))
    return `Firefox ${ua.match(/Firefox\/(\S+)/)![1].split(".")[0]}`;
  if (/Version\/(\S+).*Safari/.test(ua))
    return `Safari ${ua.match(/Version\/(\S+)/)![1].split(".")[0]}`;
  return "Unknown browser";
}

function getMemory(): MemoryInfo | null {
  if (typeof performance === "undefined" || !("memory" in performance)) {
    return null;
  }
  const mem = (
    performance as Performance & {
      memory: {
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }
  ).memory;
  return { used: mem.usedJSHeapSize, limit: mem.jsHeapSizeLimit };
}

// ─── Row component ────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  title,
}: {
  label: string;
  value: string;
  title?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className="max-w-lg text-right text-sm font-medium"
        title={title ?? value}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Section component ────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="rounded-md border border-border px-3 py-1">
        {children}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const isMemorySupported =
  typeof performance !== "undefined" && "memory" in performance;

export function SystemMonitor({ iconId: _ }: { iconId: string }) {
  const [uptime, setUptime] = useState(() =>
    Math.floor(performance.now() / 1000),
  );
  const [memory, setMemory] = useState<MemoryInfo | null>(() => getMemory());

  const { open: openCount, minimized: minimizedCount } = useWindowStats();

  // Uptime — tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(Math.floor(performance.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Memory — refresh every 3s
  useEffect(() => {
    if (!isMemorySupported) return;
    const interval = setInterval(() => {
      setMemory(getMemory());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const memoryPct =
    memory && memory.limit > 0
      ? Math.round((memory.used / memory.limit) * 100)
      : 0;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Session */}
      <Section title="Session">
        <Row label="Uptime" value={formatUptime(uptime)} />
        <Row label="Windows open" value={String(openCount)} />
        <Row label="Minimized" value={String(minimizedCount)} />
      </Section>

      {/* Memory — Chromium only */}
      {isMemorySupported && (
        <Section title="Memory (Chromium only)">
          {memory ? (
            <>
              <Row label="Heap used" value={formatBytes(memory.used)} />
              <Row label="Heap limit" value={formatBytes(memory.limit)} />
              <div className="py-2">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Heap usage</span>
                  <span>{memoryPct}%</span>
                </div>
                <Progress value={memoryPct} className="h-2" />
              </div>
            </>
          ) : (
            <Row label="Heap used" value="N/A" />
          )}
        </Section>
      )}

      {/* Browser */}
      <Section title="Browser">
        <Row label="Platform" value={navigator.platform ?? "N/A"} />
        <Row label="Language" value={navigator.language ?? "N/A"} />
        <Row
          label="Browser"
          value={detectBrowser(navigator.userAgent)}
          title={navigator.userAgent}
        />
      </Section>

      {/* Hardware */}
      <Section title="Hardware">
        <Row
          label="CPU cores"
          value={
            navigator.hardwareConcurrency
              ? String(navigator.hardwareConcurrency)
              : "N/A"
          }
        />
        <Row label="Resolution" value={`${screen.width} × ${screen.height}`} />
        <Row label="Pixel ratio" value={`${window.devicePixelRatio}x`} />
      </Section>
    </div>
  );
}
