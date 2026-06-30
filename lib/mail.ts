import nodemailer from "nodemailer";
import { uiText } from "@/content/uiText";

export type OraskMailInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  sourcePage: string;
};

export type OraskReplyMailInput = {
  senderEmail: string;
  recipientEmail: string;
  visitorName: string;
  subject: string;
  body: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createSmtpTransport() {
  const host = requiredEnv("SMTP_HOST");
  const port = Number(requiredEnv("SMTP_PORT"));
  const secure = requiredEnv("SMTP_SECURE") === "true";
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });

  return { transporter, user };
}

export async function sendOraskEmail(input: OraskMailInput) {
  const { transporter, user } = createSmtpTransport();
  const receiver = requiredEnv("ORASK_RECEIVER_EMAIL");
  const subject = `[Orask] ${input.subject}`;
  const text = [
    `${uiText.mail.visitorName}: ${input.name}`,
    `${uiText.mail.visitorEmail}: ${input.email}`,
    `${uiText.mail.subject}: ${input.subject}`,
    `${uiText.mail.submittedAt}: ${input.submittedAt}`,
    `${uiText.mail.sourcePage}: ${input.sourcePage}`,
    "",
    input.message
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #17120f;">
      <h2 style="margin: 0 0 16px;">${uiText.mail.newOrask}</h2>
      <p><strong>${uiText.mail.visitorName}:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>${uiText.mail.visitorEmail}:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>${uiText.mail.subject}:</strong> ${escapeHtml(input.subject)}</p>
      <p><strong>${uiText.mail.submittedAt}:</strong> ${escapeHtml(input.submittedAt)}</p>
      <p><strong>${uiText.mail.sourcePage}:</strong> ${escapeHtml(input.sourcePage)}</p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="white-space: pre-wrap;">${escapeHtml(input.message)}</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"DELEE Orask" <${user}>`,
    to: receiver,
    replyTo: input.email,
    subject,
    text,
    html
  });
}

export async function sendOraskReplyEmail(input: OraskReplyMailInput) {
  const { transporter, user } = createSmtpTransport();
  const text = [
    `${input.visitorName}，你好：`,
    "",
    input.body,
    "",
    "DELEE"
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.75; color: #17120f;">
      <p>${escapeHtml(input.visitorName)}，你好：</p>
      <div style="white-space: pre-wrap;">${escapeHtml(input.body)}</div>
      <p style="margin-top: 28px;">DELEE</p>
    </div>
  `;

  await transporter.sendMail({
    from: {
      name: "DELEE",
      address: input.senderEmail
    },
    sender: user === input.senderEmail ? undefined : user,
    replyTo: input.senderEmail,
    to: input.recipientEmail,
    subject: input.subject,
    text,
    html
  });
}
