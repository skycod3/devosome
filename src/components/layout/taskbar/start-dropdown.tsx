import { FaGithub, FaLinkedin } from "react-icons/fa6";

import { useHotkey } from "@tanstack/react-hotkeys";

import { APPLICATIONS } from "@/constants/applications";

import { useWindows } from "@/hooks/useWindows";

import { ABOUT_ME } from "@/constants/about";

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

const { contact } = ABOUT_ME;

export function StartDropdown() {
  const { openWindowCentered } = useWindows();

  useHotkey("Shift+A", () => openWindow("about-me"));
  useHotkey("Shift+P", () => openWindow("portfolio"));
  useHotkey("Shift+S", () => openWindow("icon-skills"));
  useHotkey("Shift+T", () => openWindow("contact"));
  useHotkey("Shift+Q", () => console.log("Shit + Q pressed!"));

  function openWindow(iconId: string) {
    const { windowTitle } = APPLICATIONS[iconId];

    openWindowCentered(iconId, "", windowTitle ?? "", "");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded px-2 py-1">Start</button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Jean Medeiros</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openWindow("about-me")}>
            About Me
            <DropdownMenuShortcut>⇧+A</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openWindow("portfolio")}>
            Portfolio
            <DropdownMenuShortcut>⇧+P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openWindow("icon-skills")}>
            My Skills
            <DropdownMenuShortcut>⇧+S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openWindow("contact")}>
            Get in Touch
            <DropdownMenuShortcut>⇧+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Support Me</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      "https://buymeacoffee.com/jeanmedeiros.dev",
                      "_blank",
                    )
                  }
                >
                  Buy Me a Coffee
                </DropdownMenuItem>
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

        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧+Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
