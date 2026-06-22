import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { contactFormSchema } from "@/lib/schemas/contact";
import { escapeHtml } from "@/lib/escape-html";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { name, email, subject, message } = parsed.data;
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
      to: process.env.RESEND_TO_EMAIL ?? "",
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
