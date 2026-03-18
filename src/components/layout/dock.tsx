import Image from "next/image";

import { motion } from "motion/react";

import FirefoxLogo from "@/assets/firefox.svg";
import VSCodeLogo from "@/assets/vscode.svg";

import { DOCK_HEIGHT, DOCK_OFFSET_BOTTOM } from "@/constants/dock";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const DOCK_ICONS = [
  {
    id: 1,
    name: "Firefox",
    icon: FirefoxLogo,
    link: "https://www.mozilla.org/firefox",
  },
  {
    id: 2,
    name: "Visual Studio Code",
    icon: VSCodeLogo,
    link: "https://code.visualstudio.com/",
  },
];

export function Dock() {
  return (
    <div
      className="mx-auto flex w-fit items-center justify-center gap-6 rounded bg-neutral-900/50 border border-neutral-800 px-2 py-4"
      style={{ height: DOCK_HEIGHT, marginBottom: DOCK_OFFSET_BOTTOM }}
    >
      {DOCK_ICONS.map((icon) => (
        <Tooltip key={icon.id}>
          <TooltipTrigger asChild>
            <motion.a
              aria-label={`Open ${icon.name} website`}
              href={icon.link}
              target="_blank"
              whileHover={{
                scale: 1.1,
                translateY: -10,
                transition: { duration: 0.2 },
              }}
              transition={{ duration: 0.2 }}
              className="flex-center size-11 rounded-full"
            >
              <Image
                src={icon.icon}
                width={44}
                height={44}
                alt={`${icon.name} Logo`}
              />
            </motion.a>
          </TooltipTrigger>

          <TooltipContent>
            <p>{icon.name}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
