import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { Search } from "lucide-react";
import { useState } from "react";

import { useHotkey } from "@tanstack/react-hotkeys";

import { APPLICATIONS } from "@/constants/applications";

import { useOpenWindow } from "@/hooks/useOpenWindow";
import { useIsMobile } from "@/hooks/useIsMobile";

import { useNotify } from "@/hooks/useNotify";

import { ABOUT_ME } from "@/constants/about";
import { ALL_APPS } from "@/lib/apps";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

import Image from "next/image";

const { contact } = ABOUT_ME;

export function StartDropdown() {
  const openWindowCentered = useOpenWindow();
  const isMobile = useIsMobile();
  const { notify } = useNotify();
  const [query, setQuery] = useState("");

  const searchResults = query.trim()
    ? ALL_APPS.filter((app) =>
        app.title.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  function openWindow(iconId: string) {
    const { windowTitle } = APPLICATIONS[iconId];

    openWindowCentered(iconId, "", windowTitle ?? "", "");
  }

  function openApp(iconId: string, title: string) {
    openWindowCentered(iconId, "", title, "");
    setQuery("");
  }

  function handleLogOut() {
    notify.info("Wanna log out? Just close the browser tab! 😄", {
      expiresIn: 5000,
    });
  }

  useHotkey("Shift+A", () => openWindow("about-me"));
  useHotkey("Shift+P", () => openWindow("portfolio"));
  useHotkey("Shift+S", () => openWindow("skills"));
  useHotkey("Shift+T", () => openWindow("contact"));
  useHotkey("Shift+Q", () => handleLogOut());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="leading-none rounded p-1.5 hover:bg-foreground/10 transition-colors">
          Start
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Search bar — visible on mobile only */}
        {isMobile && (
          <>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Search className="text-muted-foreground size-3.5 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder="Search apps..."
                className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
              />
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Search results */}
        {searchResults.length > 0 && (
          <>
            <DropdownMenuGroup>
              {searchResults.map((app) => (
                <DropdownMenuItem
                  key={app.id}
                  onClick={() => openApp(app.appId ?? app.id, app.title)}
                >
                  {app.icon && (
                    <Image
                      src={app.icon}
                      alt={app.title}
                      width={16}
                      height={16}
                      className="shrink-0"
                    />
                  )}
                  {app.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuLabel>{ABOUT_ME.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openWindow("about-me")}>
            About Me
            {!isMobile && (
              <DropdownMenuShortcut>
                <KbdGroup>
                  <Kbd>⇧</Kbd>
                  <Kbd>A</Kbd>
                </KbdGroup>
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openWindow("portfolio")}>
            Portfolio
            {!isMobile && (
              <DropdownMenuShortcut>
                <KbdGroup>
                  <Kbd>⇧</Kbd>
                  <Kbd>P</Kbd>
                </KbdGroup>
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openWindow("skills")}>
            My Skills
            {!isMobile && (
              <DropdownMenuShortcut>
                <KbdGroup>
                  <Kbd>⇧</Kbd>
                  <Kbd>S</Kbd>
                </KbdGroup>
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openWindow("contact")}>
            Get in Touch
            {!isMobile && (
              <DropdownMenuShortcut>
                <KbdGroup>
                  <Kbd>⇧</Kbd>
                  <Kbd>T</Kbd>
                </KbdGroup>
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openWindow("clipboard-history")}>
            Clipboard History
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openWindow("system-monitor")}>
            System Monitor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openWindow("system-settings")}>
            System Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Support Me</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {ABOUT_ME.supportUrl && (
                  <DropdownMenuItem
                    onClick={() => window.open(ABOUT_ME.supportUrl, "_blank")}
                  >
                    Buy Me a Coffee
                  </DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => window.open(contact.github, "_blank")}
          >
            <FaGithub className="icon-fix" /> GitHub
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open(contact.linkedin, "_blank")}
          >
            <FaLinkedin className="icon-fix" /> LinkedIn
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogOut}>
          Log out
          {!isMobile && (
            <DropdownMenuShortcut>
              <KbdGroup>
                <Kbd>⇧</Kbd>
                <Kbd>Q</Kbd>
              </KbdGroup>
            </DropdownMenuShortcut>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
