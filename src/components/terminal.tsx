"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { executeCommand } from "@/constants/terminal";
import { useOpenWindow } from "@/hooks/useOpenWindow";
import { useWindowActions } from "@/hooks/useWindowActions";
import { useWindowList } from "@/hooks/useWindowSelectors";

const PROMPT = "visitor@devosome:~$";

const BANNER = [
  "Welcome to devosome terminal.",
  "Type 'help' for available commands.",
  "",
].join("\n");

interface HistoryEntry {
  type: "input" | "output";
  text: string;
}

export function Terminal({ iconId }: { iconId: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: "output", text: BANNER },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openWindowCentered = useOpenWindow();
  const { closeWindow } = useWindowActions();
  const windows = useWindowList();

  // Auto-scroll to bottom on new history entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const appendOutput = useCallback((text: string) => {
    setHistory((prev) => [...prev, { type: "output", text }]);
  }, []);

  const handleSubmit = useCallback(() => {
    const raw = input.trim();

    // Append the input line to history
    setHistory((prev) => [...prev, { type: "input", text: raw }]);

    // Update command history for ArrowUp/Down
    if (raw) {
      setCommandHistory((prev) => [raw, ...prev]);
    }
    setHistoryIndex(-1);
    setInput("");

    const result = executeCommand(raw);

    switch (result.type) {
      case "output":
        if (result.text !== "") appendOutput(result.text);
        break;

      case "clear":
        setHistory([]);
        break;

      case "exit": {
        const win = windows.find((w) => w.iconId === iconId);
        if (win) closeWindow(win.id);
        break;
      }

      case "open": {
        appendOutput(`Opening ${result.appId}...`);
        openWindowCentered(result.appId, "", result.appId, "");
        break;
      }
    }
  }, [input, windows, iconId, closeWindow, openWindowCentered, appendOutput]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex] ?? "");
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = Math.max(historyIndex - 1, -1);
        setHistoryIndex(nextIndex);
        setInput(nextIndex === -1 ? "" : (commandHistory[nextIndex] ?? ""));
        return;
      }
    },
    [handleSubmit, historyIndex, commandHistory],
  );

  return (
    <div
      className="flex h-full flex-col bg-background font-mono text-sm text-foreground"
      onClick={() => inputRef.current?.focus()}
    >
      {/* History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {history.map((entry, i) => (
          <div
            key={i}
            className="whitespace-pre-wrap wrap-break-word leading-relaxed"
          >
            {entry.type === "input" ? (
              <span>
                <span className="text-green-700 dark:text-green-300">
                  {PROMPT}
                </span>{" "}
                {entry.text}
              </span>
            ) : (
              <span className="opacity-90">{entry.text}</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input line */}
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <span className="shrink-0 opacity-60">{PROMPT}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none caret-foreground"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
