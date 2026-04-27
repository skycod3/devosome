import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { name, email, subject, message } = parsed.data;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New message from your portfolio</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 100px;">Name</td>
            <td style="padding: 8px;">${name}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 8px; font-weight: bold;">Email</td>
            <td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Subject</td>
            <td style="padding: 8px;">${subject}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f9f9f9; border-radius: 4px; white-space: pre-wrap;">
          ${message.replace(/\n/g, "<br/>")}
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Sent via portfolio contact form · Reply directly to ${email}
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: "jeamcrv@hotmail.com",
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
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
