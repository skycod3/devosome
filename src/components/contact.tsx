"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { contactFormSchema, type ContactFormData } from "@/lib/schemas/contact";
import { useNotify } from "@/hooks/useNotify";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import { ABOUT_ME } from "@/constants/about";

import { FaGithub, FaLinkedin } from "react-icons/fa6";
import {
  PiEnvelope,
  PiSpinner,
  PiPencilSimpleLine,
  PiCheckCircle,
} from "react-icons/pi";

import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { RevealGroup, RevealItem } from "./ui/reveal";
import { AppToolbar, ToolbarButton, ToolbarSeparator } from "./window/app-toolbar";
import { HeroBackdrop } from "./effects/hero-backdrop";

type FormStatus = "idle" | "sending";

export function Contact() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [sent, setSent] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const { copied, copy } = useCopyToClipboard();
  const { notify } = useNotify();

  // Anti-bot: timestamp when the form mounted + hidden honeypot field.
  const renderedAtRef = useRef(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);

  function focusForm() {
    const nameInput = document.getElementById("contact-name");
    nameInput?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameInput?.focus();
  }

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
        body: JSON.stringify({
          ...data,
          company: honeypotRef.current?.value ?? "",
          renderedAt: renderedAtRef.current,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error ?? "Something went wrong.");
      }

      reset();
      setSent(true);
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

  return (
    <div className="relative min-h-full">
      <AppToolbar>
        <ToolbarButton onClick={focusForm}>
          <PiPencilSimpleLine className="size-3.5" />
          Compose
        </ToolbarButton>
        <ToolbarButton onClick={copyEmail}>
          <PiEnvelope className="size-3.5" />
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
      {/* Header */}
      <RevealItem>
        <h2 className="text-lg font-semibold">Get in Touch</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Send me a message and I&apos;ll get back to you as soon as possible.
        </p>
      </RevealItem>

      {/* Form / success */}
      <RevealItem>
        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.div
              key="success"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center"
            >
              <motion.span
                initial={reducedMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              >
                <PiCheckCircle className="size-12 text-emerald-500" />
              </motion.span>
              <h3 className="text-base font-semibold text-emerald-800">
                Message sent!
              </h3>
              <p className="text-sm text-emerald-700">
                Thanks for reaching out — I&apos;ll get back to you soon.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-2 rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Honeypot — hidden from real users, bots tend to fill it */}
              <input
                ref={honeypotRef}
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              {/* Name + Email row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group grid gap-1">
                  <label
                    htmlFor="contact-name"
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wide transition-colors group-focus-within:text-foreground"
                  >
                    Name
                  </label>
                  <Input
                    id="contact-name"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className="group grid gap-1">
                  <label
                    htmlFor="contact-email"
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wide transition-colors group-focus-within:text-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="contact-email"
                    aria-invalid={!!errors.email}
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
              <div className="group grid gap-1">
                <label
                  htmlFor="contact-subject"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide transition-colors group-focus-within:text-foreground"
                >
                  Subject
                </label>
                <Input
                  id="contact-subject"
                  aria-invalid={!!errors.subject}
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
              <div className="group grid gap-1">
                <label
                  htmlFor="contact-message"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide transition-colors group-focus-within:text-foreground"
                >
                  Message
                </label>
                <Textarea
                  id="contact-message"
                  aria-invalid={!!errors.message}
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
              <Button
                type="submit"
                disabled={status === "sending"}
                className="transition-transform active:scale-[0.98]"
              >
                {status === "sending" ? (
                  <>
                    <PiSpinner className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </RevealItem>
      </RevealGroup>
    </div>
  );
}
