"use client";

import { useState } from "react";
import Image from "next/image";

import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { PiCopy, PiCheck, PiMapPin, PiBriefcase, PiUser } from "react-icons/pi";

import { ABOUT_ME } from "@/constants/about";

export function AboutMe() {
  const [copied, setCopied] = useState(false);

  function handleCopyEmail() {
    navigator.clipboard.writeText(ABOUT_ME.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Hero */}
      <div className="grid justify-items-center gap-4">
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

        <div className="grid gap-1 text-center">
          <h1 className="text-xl font-bold text-foreground">{ABOUT_ME.name}</h1>
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
      </div>

      {/* Bio */}
      <div
        style={{ "--flow-space": "0.25em" } as React.CSSProperties}
        className="flow"
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          About
        </h2>
        <p className="text-sm leading-relaxed text-foreground">
          {ABOUT_ME.description}
        </p>
      </div>

      {/* Highlights */}
      <div
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
      </div>

      {/* Contact */}
      <div
        style={{ "--flow-space": "0.25em" } as React.CSSProperties}
        className="flow"
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Contact
        </h2>
        <div className="grid gap-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <PiBriefcase className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {ABOUT_ME.contact.email}
              </span>
            </div>
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {copied ? (
                <>
                  <PiCheck className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <PiCopy className="size-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          <a
            href={ABOUT_ME.contact.linkedin}
            target="_blank"
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <FaLinkedin className="size-4 text-[#0077b5]" />
            LinkedIn
          </a>

          <a
            href={ABOUT_ME.contact.github}
            target="_blank"
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <FaGithub className="size-4" />
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
