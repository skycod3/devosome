"use client";

import { FaGithub, FaLinkedin } from "react-icons/fa6";

import { useHotkey } from "@tanstack/react-hotkeys";

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

export function StartDropdown() {
  useHotkey("Shift+A", () => console.log("Shit + A pressed!"));
  useHotkey("Shift+P", () => console.log("Shit + P pressed!"));
  useHotkey("Shift+S", () => console.log("Shit + S pressed!"));
  useHotkey("Shift+T", () => console.log("Shit + T pressed!"));
  useHotkey("Shift+Q", () => console.log("Shit + Q pressed!"));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded px-2 py-1">Start</button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Jean Medeiros</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            About Me
            <DropdownMenuShortcut>⇧+A</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Portfolio
            <DropdownMenuShortcut>⇧+P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            My Skills
            <DropdownMenuShortcut>⇧+S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
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
                <DropdownMenuItem>Buy Me a Coffee</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <FaGithub className="icon-fix" /> GitHub
          </DropdownMenuItem>
          <DropdownMenuItem>
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
