"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ABOUT_ME } from "@/constants/about";

import { FaGithub, FaLinkedin } from "react-icons/fa6";
import {
  PiEnvelope,
  PiCheckCircle,
  PiWarningCircle,
  PiSpinner,
} from "react-icons/pi";

import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

type FormStatus = "idle" | "sending" | "success" | "error";

export function Contact() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setStatus("sending");
    setErrorMessage("");

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

      setStatus("success");
      reset();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setStatus("error");
    }
  }

  function copyEmail() {
    navigator.clipboard.writeText(ABOUT_ME.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 p-4 overflow-y-auto h-full">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Get in Touch</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Send me a message and I&apos;ll get back to you as soon as possible.
        </p>
      </div>

      {/* Success banner */}
      {status === "success" && (
        <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          <PiCheckCircle className="size-4 shrink-0" />
          Message sent! I&apos;ll reply to your email soon.
        </div>
      )}

      {/* Error banner */}
      {status === "error" && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <PiWarningCircle className="size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Name + Email row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Name
            </label>
            <Input {...register("name")} placeholder="Your name" />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="grid gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Email
            </label>
            <Input
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
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Subject
          </label>
          <Input {...register("subject")} placeholder="What's this about?" />
          {errors.subject && (
            <span className="text-xs text-red-500">
              {errors.subject.message}
            </span>
          )}
        </div>

        {/* Message */}
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Message
          </label>
          <Textarea
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
          className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition hover:bg-accent"
        >
          <FaLinkedin className="size-4 text-muted-foreground" />
          <span className="flex-1">LinkedIn</span>
          <span className="text-xs text-muted-foreground">skycod3</span>
        </a>

        {/* GitHub */}
        <a
          href={ABOUT_ME.contact.github}
          target="_blank"
          className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition hover:bg-accent"
        >
          <FaGithub className="size-4 text-muted-foreground" />
          <span className="flex-1">GitHub</span>
          <span className="text-xs text-muted-foreground">skycod3</span>
        </a>
      </div>
    </div>
  );
}
