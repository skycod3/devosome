"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";

import { ALL_APPS } from "@/lib/apps";
import { useWindows } from "@/hooks/useWindows";
import { Z_SPOTLIGHT } from "@/constants/windows";

interface SpotlightProps {
  onClose: () => void;
}

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
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [onClose]);

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
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      openApp(
        results[selectedIndex].appId ?? results[selectedIndex].id,
        results[selectedIndex].title,
      );
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-start justify-center bg-black/40 pt-[20vh] backdrop-blur-sm"
      style={{ zIndex: Z_SPOTLIGHT }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background border-border w-140 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border shadow-2xl">
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
                onMouseDown={() => openApp(app.appId ?? app.id, app.title)}
                className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
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
                    className="shrink-0 size-5"
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
