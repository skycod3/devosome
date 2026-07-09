"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { PiCopy, PiCheck, PiMapPin, PiUser, PiFilePdf } from "react-icons/pi";

import { ABOUT_ME } from "@/constants/about";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useOpenWindow } from "@/hooks/useOpenWindow";
import { RevealGroup, RevealItem } from "./ui/reveal";
import {
  AppToolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "./window/app-toolbar";

import { HeroBackdrop } from "./effects/hero-backdrop";

// 3D hero — loaded only on the client and kept out of the initial bundle
// (three/fiber/drei are heavy). About Me only mounts when the window is opened.
const ModelViewer = dynamic(() => import("./effects/model-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="size-2 animate-ping rounded-full bg-muted-foreground/50" />
    </div>
  ),
});

export function AboutMe() {
  const { copied, copy } = useCopyToClipboard();
  const openWindowCentered = useOpenWindow();
  const reducedMotion = useReducedMotion() ?? false;

  function handleCopyEmail() {
    copy(ABOUT_ME.contact.email);
  }

  function openResume() {
    openWindowCentered("document-resume", "", "Jean's Resume.pdf", "");
  }

  return (
    <div className="relative min-h-full">
      <AppToolbar>
        <ToolbarButton onClick={openResume}>
          <PiFilePdf className="size-3.5" />
          Resume
        </ToolbarButton>
        <ToolbarButton onClick={handleCopyEmail}>
          {copied ? (
            <PiCheck className="size-3.5 text-emerald-600" />
          ) : (
            <PiCopy className="size-3.5" />
          )}
          {copied ? "Copied!" : "Copy email"}
        </ToolbarButton>
        <ToolbarSeparator />
        <a
          href={ABOUT_ME.contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
        >
          <FaLinkedin className="size-3.5 text-[#0077b5]" />
          LinkedIn
        </a>
        <a
          href={ABOUT_ME.contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
        >
          <FaGithub className="size-3.5" />
          GitHub
        </a>
      </AppToolbar>

      <HeroBackdrop />

      <RevealGroup className="space-y-6 p-4 md:p-6">
        {/* Hero */}
        <RevealItem className="grid justify-items-center gap-4">
          {reducedMotion ? (
            <div className="relative size-24 overflow-hidden rounded-full border-2 border-border bg-accent">
              {ABOUT_ME.photo ? (
                <Image
                  src={ABOUT_ME.photo}
                  alt={ABOUT_ME.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <PiUser className="size-12 text-muted-foreground" />
                </div>
              )}
            </div>
          ) : (
            <div className="h-56 w-full max-w-xs">
              <ModelViewer spin />
            </div>
          )}

          <div className="grid gap-1 text-center">
            <h1 className="text-xl font-bold text-foreground">
              {ABOUT_ME.name}
            </h1>
            <p className="text-sm text-muted-foreground">{ABOUT_ME.title}</p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <PiMapPin className="size-3.5" />
                {ABOUT_ME.location}
              </span>

              {ABOUT_ME.availability && (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {ABOUT_ME.availability}
                </span>
              )}
            </div>
          </div>
        </RevealItem>

        {/* Bio */}
        <RevealItem
          style={{ "--flow-space": "0.25em" } as React.CSSProperties}
          className="flow"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            About
          </h2>
          <p className="text-sm leading-relaxed text-foreground">
            {ABOUT_ME.description}
          </p>
        </RevealItem>

        {/* Timeline */}
        <RevealItem
          style={{ "--flow-space": "0.25em" } as React.CSSProperties}
          className="flow"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Journey
          </h2>
          <ol className="border-l border-border pl-6">
            {ABOUT_ME.timeline.map((entry) => {
              const isCurrent = entry.period === "Present";
              return (
                <li
                  key={`${entry.period}-${entry.role}`}
                  className="relative pb-5 last:pb-0"
                >
                  <span
                    className={`absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-background ${
                      isCurrent ? "bg-emerald-500 animate-pulse" : "bg-primary"
                    }`}
                  />
                  <p className="text-xs font-medium text-muted-foreground">
                    {entry.period}
                  </p>
                  <h3 className="text-sm font-semibold text-foreground">
                    {entry.role}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {entry.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </RevealItem>

        {/* Highlights */}
        <RevealItem
          style={{ "--flow-space": "0.25em" } as React.CSSProperties}
          className="flow"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Highlights
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {ABOUT_ME.highlights.map(({ label, value }) => (
              <div
                key={label}
                className="grid gap-1 rounded-lg border border-border bg-card p-3 text-center"
              >
                <span className="text-2xl font-bold text-foreground">
                  {value}
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </RevealItem>
      </RevealGroup>
    </div>
  );
}
