"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";

import { APPLICATIONS } from "@/constants/applications";
import { DESKTOP_ICONS } from "@/constants/icons";
import { useWindows } from "@/hooks/useWindows";

interface SpotlightProps {
  onClose: () => void;
}

// Exclude tab children (documents, pictures, music, videos) — they open via their parent window
const TAB_IDS = new Set(
  Object.values(APPLICATIONS).flatMap((app) => app.availableTabs ?? []),
);

const ALL_APPS = Object.values(APPLICATIONS)
  .filter((app) => (!!app.component || !!app.showTabs) && !TAB_IDS.has(app.id))
  .map((app) => {
    const iconEntry = DESKTOP_ICONS.find((i) => i.appId === app.id);
    return {
      id: app.id,
      title: app.windowTitle ?? app.id,
      icon: iconEntry?.icon ?? null,
    };
  });

export function Spotlight({ onClose }: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { openWindowCentered } = useWindows();

  const results = query.trim()
    ? ALL_APPS.filter((app) =>
        app.title.toLowerCase().includes(query.toLowerCase()),
      )
    : ALL_APPS;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const item = listRef.current?.children[selectedIndex] as
      | HTMLElement
      | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  function openApp(id: string, title: string) {
    openWindowCentered(id, "", title, "");
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      openApp(results[selectedIndex].id, results[selectedIndex].title);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9997] flex items-start justify-center bg-black/40 pt-[20vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background border-border w-[560px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search apps..."
            className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="border-border border-t" />

        <ul ref={listRef} className="max-h-72 overflow-y-auto py-1">
          {results.length === 0 ? (
            <li className="text-muted-foreground px-4 py-3 text-sm">
              No apps found.
            </li>
          ) : (
            results.map((app, i) => (
              <li
                key={app.id}
                onMouseEnter={() => setSelectedIndex(i)}
                onMouseDown={() => openApp(app.id, app.title)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  i === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground"
                }`}
              >
                {app.icon ? (
                  <Image
                    src={app.icon}
                    alt={app.title}
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                ) : (
                  <div className="bg-muted size-5 shrink-0 rounded" />
                )}
                <span>{app.title}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
