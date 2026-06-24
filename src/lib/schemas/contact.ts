import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Server-side schema: extends the form fields with anti-bot metadata.
 * - `company` is a honeypot field that must stay empty (real users never see it).
 * - `renderedAt` is the epoch ms when the form mounted, used to reject submits
 *   that happen suspiciously fast.
 */
export const contactRequestSchema = contactFormSchema.extend({
  company: z.string().optional(),
  renderedAt: z.number().optional(),
});

export type ContactRequestData = z.infer<typeof contactRequestSchema>;
