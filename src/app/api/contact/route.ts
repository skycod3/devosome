import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { contactRequestSchema } from "@/lib/schemas/contact";
import { escapeHtml } from "@/lib/escape-html";
import { rateLimit } from "@/lib/rate-limit";

// Anti-bot thresholds
const MIN_FILL_TIME_MS = 2000; // submits faster than this are almost certainly bots
const RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 }; // 5 / hour per IP

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  try {
    // Fail fast (and clearly) if the email service is misconfigured.
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.RESEND_TO_EMAIL;
    if (!apiKey || !toEmail) {
      console.error(
        "Contact route misconfigured: RESEND_API_KEY and/or RESEND_TO_EMAIL are missing.",
      );
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 },
      );
    }

    // Per-IP rate limit.
    const ip = getClientIp(request);
    const limit = rateLimit(`contact:${ip}`, RATE_LIMIT);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
          },
        },
      );
    }

    const body = await request.json();
    const parsed = contactRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { name, email, subject, message, company, renderedAt } = parsed.data;

    // Honeypot: real users never fill the hidden `company` field.
    // Timestamp: reject submits that happened implausibly fast.
    // In both cases return a fake success so bots get no useful signal.
    const tooFast =
      typeof renderedAt === "number" &&
      Date.now() - renderedAt < MIN_FILL_TIME_MS;
    if ((company && company.trim() !== "") || tooFast) {
      return NextResponse.json({ success: true });
    }

    const resend = new Resend(apiKey);
    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      subject: escapeHtml(subject),
      message: escapeHtml(message),
    };

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New message from your portfolio</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 100px;">Name</td>
            <td style="padding: 8px;">${safe.name}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 8px; font-weight: bold;">Email</td>
            <td style="padding: 8px;"><a href="mailto:${safe.email}">${safe.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Subject</td>
            <td style="padding: 8px;">${safe.subject}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f9f9f9; border-radius: 4px; white-space: pre-wrap;">
          ${safe.message.replace(/\n/g, "<br/>")}
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Sent via portfolio contact form · Reply directly to ${safe.email}
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: toEmail,
      replyTo: email,
      subject: `[Portfolio] ${safe.subject}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
