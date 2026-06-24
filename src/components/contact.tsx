"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { contactFormSchema, type ContactFormData } from "@/lib/schemas/contact";
import { useNotify } from "@/hooks/useNotify";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import { ABOUT_ME } from "@/constants/about";

import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { PiEnvelope, PiSpinner } from "react-icons/pi";

import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

type FormStatus = "idle" | "sending";

export function Contact() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const { copied, copy } = useCopyToClipboard();
  const { notify } = useNotify();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error ?? "Something went wrong.");
      }

      reset();
      notify.success("Message sent! I'll get back to you soon.", {
        duration: 1000 * 8, // 8 seconds
      });
    } catch (err) {
      notify.error(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again.",
        { duration: 1000 * 8 }, // 8 seconds
      );
    } finally {
      setStatus("idle");
    }
  }

  function copyEmail() {
    copy(ABOUT_ME.contact.email);
  }

  const githubHandle = ABOUT_ME.contact.github.split("/").pop() ?? "GitHub";
  const linkedinHandle =
    ABOUT_ME.contact.linkedin.split("/").pop() ?? "LinkedIn";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Get in Touch</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Send me a message and I&apos;ll get back to you as soon as possible.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Name + Email row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1">
            <label
              htmlFor="contact-name"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Name
            </label>
            <Input
              id="contact-name"
              {...register("name")}
              placeholder="Your name"
            />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="grid gap-1">
            <label
              htmlFor="contact-email"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Email
            </label>
            <Input
              id="contact-email"
              {...register("email")}
              type="email"
              placeholder="your@email.com"
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        {/* Subject */}
        <div className="grid gap-1">
          <label
            htmlFor="contact-subject"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Subject
          </label>
          <Input
            id="contact-subject"
            {...register("subject")}
            placeholder="What's this about?"
          />
          {errors.subject && (
            <span className="text-xs text-red-500">
              {errors.subject.message}
            </span>
          )}
        </div>

        {/* Message */}
        <div className="grid gap-1">
          <label
            htmlFor="contact-message"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Message
          </label>
          <Textarea
            id="contact-message"
            {...register("message")}
            placeholder="Your message..."
            className="min-h-28"
          />
          {errors.message && (
            <span className="text-xs text-red-500">
              {errors.message.message}
            </span>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? (
            <>
              <PiSpinner className="size-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        Or reach me directly
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Direct contact */}
      <div className="flex flex-col gap-2">
        {/* Email copy */}
        <button
          onClick={copyEmail}
          className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition hover:bg-accent"
        >
          <PiEnvelope className="size-4 text-muted-foreground" />
          <span className="flex-1 text-left">{ABOUT_ME.contact.email}</span>
          <span className="text-xs text-muted-foreground">
            {copied ? "Copied!" : "Click to copy"}
          </span>
        </button>

        {/* LinkedIn */}
        <a
          href={ABOUT_ME.contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition hover:bg-accent"
        >
          <FaLinkedin className="size-4 text-muted-foreground" />
          <span className="flex-1">LinkedIn</span>
          <span className="text-xs text-muted-foreground">
            {linkedinHandle}
          </span>
        </a>

        {/* GitHub */}
        <a
          href={ABOUT_ME.contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition hover:bg-accent"
        >
          <FaGithub className="size-4 text-muted-foreground" />
          <span className="flex-1">GitHub</span>
          <span className="text-xs text-muted-foreground">{githubHandle}</span>
        </a>
      </div>
    </div>
  );
}
