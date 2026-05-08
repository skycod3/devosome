"use client";

import { useState } from "react";
import { PiCopy, PiCheck } from "react-icons/pi";
import { getClipboardItems } from "@/constants/clipboard";

const items = getClipboardItems();

const categories = Array.from(new Set(items.map((i) => i.category)));

export function ClipboardHistory({ iconId: _ }: { iconId: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyItem(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard API unavailable or denied — fail silently
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {categories.map((category) => (
        <div key={category}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {category}
          </p>
          <div className="grid gap-1">
            {items
              .filter((item) => item.category === category)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => copyItem(item.id, item.value)}
                  className="group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 text-left">
                    <span className="block truncate font-medium">
                      {item.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.display ?? item.value}
                    </span>
                  </span>
                  <span className="ml-3 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
                    {copied === item.id ? (
                      <PiCheck className="size-4 text-green-500" />
                    ) : (
                      <PiCopy className="size-4" />
                    )}
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
